import format from 'string-template';
import nodemailer from 'nodemailer';
import { getConfigBackupSettings, getNtfyConfig, getServerInfoById, getSMTPConfig, getNotificationTemplates } from './db-utils';
import { NotificationTemplate, Backup, BackupStatus, BackupKey, SMTPConnectionType } from './types';
import { defaultNotificationTemplates } from './default-config';

// Ensure this runs in Node.js runtime, not Edge Runtime
export const runtime = 'nodejs';

export interface NotificationContext {
  server_id: string;
  server_name: string;
  server_alias: string;
  server_note: string;
  server_url: string;
  backup_name: string;
  backup_date: string;
  status: BackupStatus;
  messages_count: number;
  warnings_count: number;
  errors_count: number;
  duration: string;
  file_count: number;
  file_size: string; // formatted size string
  uploaded_size: string; // formatted size string
  storage_size: string; // formatted size string
  available_versions: number;
}

export interface OverdueBackupContext {
  server_id: string; 
  server_name: string;
  server_alias: string;
  server_note: string;
  server_url: string;
  backup_name: string;
  last_backup_date: string;
  last_elapsed: string;
  expected_date: string;
  expected_elapsed: string;
  backup_interval: string;
  overdue_tolerance: string; // Human-readable tolerance label
}

async function getNotificationConfig(): Promise<{
  ntfy: { url: string; topic: string; accessToken?: string };
  templates: { success: NotificationTemplate; warning: NotificationTemplate; overdueBackup: NotificationTemplate };
  backupSettings: Record<BackupKey, import('./types').BackupNotificationConfig>;
} | null> {
  try {
    const backupSettings = await getConfigBackupSettings();
    
    // Get ntfy config with default topic generation if needed
    const ntfyConfig = await getNtfyConfig();
    const templates = getNotificationTemplates();
    
    return {
      ntfy: ntfyConfig,
      templates,
      backupSettings: Object.keys(backupSettings).length > 0 ? backupSettings : {}
    };
  } catch (error) {
    console.error('Failed to get notification config:', error instanceof Error ? error.message : String(error));
    return null;
  }
}


// Helper function to get backup settings with fallback to server settings
async function getBackupSettings(config: { backupSettings: Record<BackupKey, import('./types').BackupNotificationConfig> }, serverId: string, backupName: string) {
  const backupKey: BackupKey = `${serverId}:${backupName}`;
  const backupConfig = config.backupSettings?.[backupKey];
  
  return backupConfig || null;
}


// Helper function to determine if an error is a network error that should be retried
function isRetryableNetworkError(error: unknown): boolean {
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  // Check for common network errors that are worth retrying
  return (
    errorMessage.includes('ENOTFOUND') ||
    errorMessage.includes('ECONNREFUSED') ||
    errorMessage.includes('connection refused') ||
    errorMessage.includes('timeout') ||
    errorMessage.includes('ETIMEDOUT') ||
    errorMessage.includes('ECONNRESET') ||
    errorMessage.includes('ENETUNREACH') ||
    errorMessage.includes('EHOSTUNREACH') ||
    errorMessage.includes('fetch failed') ||
    errorMessage.includes('network error')
  );
}

// Helper function to sleep for a specified number of milliseconds
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function sendNtfyNotification(
  ntfyUrl: string,
  topic: string,
  title: string,
  message: string,
  priority: string,
  tags: string,
  accessToken?: string
): Promise<void> {
  if (!ntfyUrl || !topic) {
    throw new Error('NTFY URL and topic are required');
  }

  // Build URL with parameters to handle Unicode characters properly
  const url = new URL(`${ntfyUrl.replace(/\/$/, '')}/${topic}`);
  
  // Add parameters to URL to avoid ByteString conversion issues with Unicode
  if (title && title.trim()) {
    url.searchParams.set('title', title);
  }
  
  if (priority && priority.trim()) {
    url.searchParams.set('priority', priority);
  }
  
  if (tags && tags.trim()) {
    url.searchParams.set('tags', tags);
  }

  // Ensure the message is properly encoded as UTF-8
  const encoder = new TextEncoder();
  const messageBytes = encoder.encode(message);

  // Prepare headers
  const headers: Record<string, string> = {
    'Content-Type': 'text/plain; charset=utf-8',
  };

  // Add authorization header if access token is provided
  if (accessToken && accessToken.trim()) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const maxRetries = 5;
  const retryDelay = 3000; // 3 seconds
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    let response;
    try {
      response = await fetch(url.toString(), {
        method: 'POST',
        body: messageBytes,
        headers,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Fetch failed for NTFY notification (attempt ${attempt}/${maxRetries}). Error: ${errorMessage}`);
      
      // If this is the last attempt or it's not a retryable network error, throw the error
      if (attempt === maxRetries || !isRetryableNetworkError(error)) {
        // Provide more specific error messages based on common failure patterns
        if (errorMessage.includes('ENOTFOUND') || errorMessage.includes('DNS')) {
          throw new Error(`Failed to resolve NTFY server hostname. Please check your NTFY URL configuration.`);
        } else if (errorMessage.includes('ECONNREFUSED') || errorMessage.includes('connection refused')) {
          throw new Error(`Cannot connect to NTFY server. Please verify the server is running and accessible.`);
        } else if (errorMessage.includes('timeout')) {
          throw new Error(`Connection to NTFY server timed out. Please check your network connection and server status.`);
        } else if (errorMessage.includes('SSL') || errorMessage.includes('certificate')) {
          throw new Error(`SSL/TLS certificate error when connecting to NTFY server. Please check your server certificate configuration.`);
        } else {
          throw new Error(`Network error when sending notification: ${errorMessage}`);
        }
      }
      
      // Wait before retrying (except on the last attempt)
      if (attempt < maxRetries) {
        console.log(`Retrying NTFY notification in ${retryDelay}ms... (attempt ${attempt + 1}/${maxRetries})`);
        await sleep(retryDelay);
      }
      continue;
    }

    // If we get here, the fetch was successful
    if (!response.ok) {
      const errorBody = await response.text();
      let userFriendlyMessage = `Failed to send notification to NTFY: ${response.statusText}`;
      
      // Parse error response to provide user-friendly messages
      try {
        const errorData = JSON.parse(errorBody);
        if (errorData.code === 42901) {
          userFriendlyMessage = 'Notification service is temporarily unavailable due to rate limiting. Please try again later or upgrade your notification service plan.';
        } else if (errorData.error) {
          userFriendlyMessage = `Notification service error: ${errorData.error}`;
        }
      } catch {
        // If we can't parse the error body, use the original message
      }
      
      throw new Error(userFriendlyMessage);
    }
    
    // If we get here, the request was successful
    return;
  }
}

// Email configuration functions
export async function createEmailTransporter(): Promise<nodemailer.Transporter | null> {
  try {
    const config = getSMTPConfig();
    if (!config) {
      return null;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // If this is a master key error, log it and return null
    if (errorMessage.includes('MASTER_KEY_INVALID')) {
      console.error('Cannot create email transporter: Master key is invalid. SMTP settings must be reconfigured.');
      return null;
    }
    
    // Re-throw other errors
    throw error;
  }

  const config = getSMTPConfig()!; // We know it's not null from the check above

  try {
    // Determine connection type (default to STARTTLS if not set)
    const connectionType: SMTPConnectionType = config.connectionType || 'starttls';
    
    // Log the SMTP configuration being used
    console.log('[SMTP Config] Creating transporter with:', {
      host: config.host,
      port: config.port,
      connectionType: connectionType,
      requireAuth: config.requireAuth !== false,
      username: config.username ? '***' : '(not set)',
      hasPassword: !!config.password
    });
    
    // Set secure based on connection type (true for ssl, false otherwise)
    const useSecure = connectionType === 'ssl';
    
    const transporterConfig: Record<string, unknown> = {
      host: config.host,
      port: config.port,
      secure: useSecure,
      // Connection timeout settings
      connectionTimeout: 20000, // 20 seconds connection timeout
      greetingTimeout: 20000,   // 20 seconds greeting timeout
      socketTimeout: 20000,     // 20 seconds socket timeout
    };
    
    switch (connectionType) {
      case 'plain':
        // Never attempt TLS for plain SMTP connections
        transporterConfig.ignoreTLS = true;
        // Do not add any TLS configuration for plain connections
        break;
        
      case 'starttls':
        // Force STARTTLS upgrade and fail if server doesn't support it
        transporterConfig.requireTLS = true;
        // Add TLS configuration for STARTTLS
        transporterConfig.tls = {
          rejectUnauthorized: false, // Allow self-signed certificates
          minVersion: 'TLSv1.2', // Use modern TLS version
        };
        break;
        
      case 'ssl':
      default:
        // Add TLS configuration for direct SSL/TLS connections
        transporterConfig.tls = {
          rejectUnauthorized: false, // Allow self-signed certificates
          minVersion: 'TLSv1.2', // Use modern TLS version
        };
        break;
    }

    // Only include auth if authentication is required (defaults to true for backward compatibility)
    if (config.requireAuth !== false) {
      transporterConfig.auth = {
        user: config.username,
        pass: config.password,
      };
    }
    
    const transporter = nodemailer.createTransport(transporterConfig as nodemailer.TransportOptions);

    // Verify the connection
    try {
      await transporter.verify();
    } catch (verifyError) {
      const errorMessage = verifyError instanceof Error ? verifyError.message : String(verifyError);
      
      // Provide user-friendly error messages based on connection type
      let userMessage = '';
      
      if (connectionType === 'plain') {
        userMessage = `Failed to connect to SMTP server at ${config.host}:${config.port} using Plain SMTP. ` +
          `Please verify the server address and port are correct.`;
      } else if (connectionType === 'starttls') {
        userMessage = `The SMTP server at ${config.host}:${config.port} does not support STARTTLS. ` +
          `Please change the connection type to "Plain SMTP" or use "Direct SSL/TLS" if your server supports it.`;
      } else if (connectionType === 'ssl') {
        userMessage = `Cannot establish SSL/TLS connection to ${config.host}:${config.port}. ` +
          `The server may not support direct SSL/TLS on this port. Try using "STARTTLS" or "Plain SMTP" instead, or use port 465 for SSL/TLS.`;
      } else {
        userMessage = `Failed to connect to SMTP server at ${config.host}:${config.port}.`;
      }
      
      // Append the original error message for debugging
      throw new Error(`${userMessage}\n\nOriginal error: ${errorMessage}`);
    }
    
    return transporter;
  } catch (error) {
    console.error('Failed to create email transporter:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}

export async function sendEmailNotification(
  subject: string,
  htmlContent: string,
  textContent: string,
  toEmail?: string
): Promise<void> {
  const transporter = await createEmailTransporter();
  if (!transporter) {
    throw new Error('Email is not configured. Please check environment variables.');
  }

  let config;
  try {
    config = getSMTPConfig();
    if (!config) {
      throw new Error('Email configuration not found');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // If this is a master key error, provide a specific error message
    if (errorMessage.includes('MASTER_KEY_INVALID')) {
      throw new Error('Cannot send email: Master key is invalid. SMTP settings must be reconfigured.');
    }
    
    // Re-throw other errors
    throw error;
  }

  // Log the SMTP configuration being used for sending email
  console.log('[SMTP Config] Sending email with config:', {
    host: config.host,
    port: config.port,
    connectionType: config.connectionType || 'starttls',
    requireAuth: config.requireAuth !== false,
    username: config.username ? '***' : '(not set)',
    hasPassword: !!config.password,
    mailto: config.mailto,
    senderName: config.senderName,
    fromAddress: config.fromAddress || '(not set)'
  });

  // Use configured sender name and from address, with fallback to current behavior
  const senderName = config.senderName || 'duplistatus';
  
  // Determine from address with proper fallback chain to ensure RFC 5322 compliance
  // Priority: fromAddress > username (mailto is no longer used as fallback)
  let fromAddress = config.fromAddress || config.username;
  
  // For plain connections, fromAddress is required (UI enforces this, but we validate here too)
  if (config.connectionType === 'plain') {
    if (!config.fromAddress || !config.fromAddress.trim() || !config.fromAddress.includes('@')) {
      throw new Error(
        'Invalid email configuration for Plain SMTP connection: From Address is required. ' +
        'Please configure a From Address in the email settings. Plain SMTP connections require ' +
        'a valid From Address to comply with RFC 5322 email standards.'
      );
    }
    fromAddress = config.fromAddress;
  }
  
  // Validate that fromAddress is not empty and contains '@' (basic email validation)
  if (!fromAddress || !fromAddress.trim() || !fromAddress.includes('@')) {
    throw new Error(
      'Invalid email configuration: From address is missing or invalid. ' +
      'Please configure either a From Address or SMTP Username in the email settings.'
    );
  }
  
  const mailOptions = {
    from: `"${senderName}" <${fromAddress}>`,
    to: toEmail || config.mailto, // Use SMTP_MAILTO as default recipient
    subject,
    text: textContent,
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
  } catch (error) {
    console.error('Failed to send email:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}

// Helper function to convert plain text to HTML
export function convertTextToHtml(text: string): string {
  return text
    // First handle URLs before converting newlines to avoid conflicts
    .replace(/(https?:\/\/[^\s<>]+)/g, '<a href="$1" target="_blank">$1</a>')
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>');
}

// Helper function to format date strings using toLocaleString()
function formatDateString(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      // If the date is invalid, return the original string
      return dateString;
    }
    return date.toLocaleString();
  } catch {
    // If there's any error parsing the date, return the original string
    return dateString;
  }
}

function processTemplate(template: NotificationTemplate, context: NotificationContext | OverdueBackupContext): {
  title: string;
  message: string;
  priority: string;
  tags: string;
} {
   // Create a copy of the context with formatted dates
  const formattedContext = { ...context } as Record<string, unknown>;

  // Add additional server variables to context 
  const serverInfo = getServerInfoById(context.server_id);
  formattedContext.server_url = serverInfo?.server_url || '';
  formattedContext.server_alias = serverInfo?.alias || context.server_name;
  formattedContext.server_note = serverInfo?.note || '';

  // backward compatibility
  formattedContext.backup_interval_value = 'backup_interval' in context ? context.backup_interval : '';
  formattedContext.backup_interval_type = ""; 

  // Format date fields if they exist in the context
  if ('backup_date' in formattedContext) {
    formattedContext.backup_date = formatDateString(formattedContext.backup_date as string);
  }
  if ('last_backup_date' in formattedContext) {
    formattedContext.last_backup_date = formatDateString(formattedContext.last_backup_date as string);
  }
  if ('expected_date' in formattedContext) {
    formattedContext.expected_date = formatDateString(formattedContext.expected_date as string);
  }

  return {
    title: format(template.title, formattedContext),
    message: format(template.message, formattedContext),
    priority: template.priority,
    tags: template.tags,
  };
}

export async function sendBackupNotification(
  backup: Backup,
  serverId: string,
  serverName: string,
  context: NotificationContext
): Promise<void> {
  const config = await getNotificationConfig();
  if (!config) {
    console.log('No notification configuration found, skipping notification');
    return;
  }

  const backupConfig = await getBackupSettings(config, serverId, backup.name);
  if (!backupConfig || backupConfig.notificationEvent === 'off') {
    console.log(`Notifications disabled for backup ${backup.name} on server ${serverName}, skipping`);
    return;
  }

  // Determine which template to use based on backup status and backup settings
  let template: NotificationTemplate;
  const status = backup.status;
  const notificationConf = backupConfig.notificationEvent;
  
  // Check if needed to send a notification
  switch(notificationConf) {
    case 'warnings': // send warnings and errors (all but success)
        if (status === 'Success') {
          return;
        }
        break;
    case 'errors': // send errors (only errors and fatals and errors count > 0)
        if (status != 'Error' && status != 'Fatal' && backup.errors == 0) {
          return;
        }
        break;
    default: // default is to send messages (all)
        break;
  }
  // select the template based on the status
  if (status === 'Success') {
    template = config.templates?.success || defaultNotificationTemplates.success;
  }
  else {
    template = config.templates?.warning || defaultNotificationTemplates.warning;
  }

  let processedTemplate;
  try {
    processedTemplate = processTemplate(template, context);
  } catch (error) {
    console.error(`Failed to process notification template for backup ${backup.name} on server ${serverName}:`, error instanceof Error ? error.message : String(error));
    throw error;
  }

  // Send notifications based on backup configuration
  const notifications: Promise<void>[] = [];
  const notificationTypes: string[] = [];

  // Send NTFY notification if enabled
  if (backupConfig.ntfyEnabled !== false) { // Default to true if not specified
    notifications.push(
      sendNtfyNotification(
        config.ntfy.url,
        config.ntfy.topic,
        processedTemplate.title,
        processedTemplate.message,
        processedTemplate.priority,
        processedTemplate.tags,
        config.ntfy.accessToken
      ).then(() => {
        notificationTypes.push('NTFY');
      }).catch((error) => {
        console.error(`Failed to send NTFY notification for backup ${backup.name} on server ${serverName}:`, error instanceof Error ? error.message : String(error));
        throw new Error(`NTFY notification failed: ${error instanceof Error ? error.message : String(error)}`);
      })
    );
  }

  // Send email notification if enabled and configured
  if (backupConfig.emailEnabled === true && getSMTPConfig()) {
    const htmlContent = convertTextToHtml(processedTemplate.message);
    notifications.push(
      sendEmailNotification(
        processedTemplate.title,
        htmlContent,
        processedTemplate.message
      ).then(() => {
        notificationTypes.push('Email');
      }).catch((error) => {
        console.error(`Failed to send email notification for backup ${backup.name} on server ${serverName}:`, error instanceof Error ? error.message : String(error));
        throw new Error(`Email notification failed: ${error instanceof Error ? error.message : String(error)}`);
      })
    );
  }

  // Wait for all notifications to complete
  if (notifications.length > 0) {
    try {
      await Promise.all(notifications);
      console.log(`Notifications sent (${notificationTypes.join(', ')}) for backup ${backup.name} on server ${serverName}, status: ${status}, notification config: ${notificationConf}`);
      
      // Log audit event for successful notification
      const { AuditLogger } = await import('@/lib/audit-logger');
      await AuditLogger.logSystem(
        'notification_sent',
        {
          type: 'backup',
          serverId,
          serverName,
          backupName: backup.name,
          backupStatus: status,
          channels: notificationTypes,
        },
        'success'
      );
    } catch (error) {
      console.error(`Failed to send notifications for backup ${backup.name} on server ${serverName}:`, error instanceof Error ? error.message : String(error));
      
      // Log audit event for failed notification
      const { AuditLogger } = await import('@/lib/audit-logger');
      await AuditLogger.logSystem(
        'notification_failed',
        {
          type: 'backup',
          serverId,
          serverName,
          backupName: backup.name,
          backupStatus: status,
          channels: notificationTypes,
          error: error instanceof Error ? error.message : String(error),
        },
        'error',
        error instanceof Error ? error.message : String(error)
      );
      
      throw error;
    }
  } else {
    console.log(`No notification channels enabled for backup ${backup.name} on server ${serverName}, skipping`);
  }

  // Send to additional destinations if configured
  const additionalNotificationEvent = backupConfig.additionalNotificationEvent ?? backupConfig.notificationEvent;
  
  // Check if we should send to additional destinations based on additionalNotificationEvent
  let shouldSendToAdditional = true;
  switch(additionalNotificationEvent) {
    case 'warnings':
      if (status === 'Success') {
        shouldSendToAdditional = false;
      }
      break;
    case 'errors':
      if (status !== 'Error' && status !== 'Fatal' && backup.errors === 0) {
        shouldSendToAdditional = false;
      }
      break;
    case 'off':
      shouldSendToAdditional = false;
      break;
    default:
      break;
  }

  if (!shouldSendToAdditional) {
    return;
  }

  const additionalNotifications: Promise<void>[] = [];
  const additionalNotificationTypes: string[] = [];

  // Send to additional email addresses if configured
  if (backupConfig.additionalEmails && backupConfig.additionalEmails.trim() && getSMTPConfig()) {
    const emailAddresses = backupConfig.additionalEmails
      .split(',')
      .map(email => email.trim())
      .filter(email => email.length > 0 && email.includes('@'));
    
    if (emailAddresses.length > 0) {
      const htmlContent = convertTextToHtml(processedTemplate.message);
      for (const email of emailAddresses) {
        additionalNotifications.push(
          sendEmailNotification(
            processedTemplate.title,
            htmlContent,
            processedTemplate.message,
            email
          ).then(() => {
            if (!additionalNotificationTypes.includes('Additional Email')) {
              additionalNotificationTypes.push('Additional Email');
            }
          }).catch((error) => {
            console.error(`Failed to send additional email notification to ${email} for backup ${backup.name} on server ${serverName}:`, error instanceof Error ? error.message : String(error));
            // Don't throw - additional destinations are supplementary
          })
        );
      }
    }
  }

  // Send to additional NTFY topic if configured
  if (backupConfig.additionalNtfyTopic && backupConfig.additionalNtfyTopic.trim() && config.ntfy.url) {
    additionalNotifications.push(
      sendNtfyNotification(
        config.ntfy.url,
        backupConfig.additionalNtfyTopic.trim(),
        processedTemplate.title,
        processedTemplate.message,
        processedTemplate.priority,
        processedTemplate.tags,
        config.ntfy.accessToken
      ).then(() => {
        additionalNotificationTypes.push('Additional NTFY');
      }).catch((error) => {
        console.error(`Failed to send additional NTFY notification to topic ${backupConfig.additionalNtfyTopic} for backup ${backup.name} on server ${serverName}:`, error instanceof Error ? error.message : String(error));
        // Don't throw - additional destinations are supplementary
      })
    );
  }

  // Wait for additional notifications to complete (errors are logged but don't fail the function)
  if (additionalNotifications.length > 0) {
    try {
      await Promise.all(additionalNotifications);
      if (additionalNotificationTypes.length > 0) {
        console.log(`Additional notifications sent (${additionalNotificationTypes.join(', ')}) for backup ${backup.name} on server ${serverName}`);
      }
    } catch (error) {
      // Log but don't throw - additional destinations are supplementary
      console.error(`Some additional notifications failed for backup ${backup.name} on server ${serverName}:`, error instanceof Error ? error.message : String(error));
    }
  }
}

export async function sendOverdueBackupNotification(
  context: OverdueBackupContext
): Promise<void> {
  
  const notificationConfig = await getNotificationConfig();
  
  if (!notificationConfig) {
    return;
  }

  // Get backup settings for this specific backup
  const backupConfig = await getBackupSettings(notificationConfig, context.server_id, context.backup_name);
  if (!backupConfig) {
    console.log(`No backup configuration found for overdue backup ${context.backup_name} on server ${context.server_name}, skipping`);
    return;
  }

  try {
    const processedTemplate = processTemplate(notificationConfig.templates?.overdueBackup || defaultNotificationTemplates.overdueBackup, context);
    
    // Send notifications based on backup configuration
    const notifications: Promise<void>[] = [];
    const notificationTypes: string[] = [];

    // Send NTFY notification if enabled
    if (backupConfig.ntfyEnabled !== false) { // Default to true if not specified
      notifications.push(
        sendNtfyNotification(
          notificationConfig.ntfy.url,
          notificationConfig.ntfy.topic,
          processedTemplate.title,
          processedTemplate.message,
          processedTemplate.priority,
          processedTemplate.tags,
          notificationConfig.ntfy.accessToken
        ).then(() => {
          notificationTypes.push('NTFY');
        }).catch((error) => {
          console.error(`Failed to send NTFY overdue notification for ${context.backup_name} on server ${context.server_name}:`, error instanceof Error ? error.message : String(error));
          throw new Error(`NTFY notification failed: ${error instanceof Error ? error.message : String(error)}`);
        })
      );
    }

    // Send email notification if enabled and configured
    if (backupConfig.emailEnabled === true && getSMTPConfig()) {
      const htmlContent = convertTextToHtml(processedTemplate.message);
      notifications.push(
        sendEmailNotification(
          processedTemplate.title,
          htmlContent,
          processedTemplate.message
        ).then(() => {
          notificationTypes.push('Email');
        }).catch((error) => {
          console.error(`Failed to send email overdue notification for ${context.backup_name} on server ${context.server_name}:`, error instanceof Error ? error.message : String(error));
          throw new Error(`Email notification failed: ${error instanceof Error ? error.message : String(error)}`);
        })
      );
    }

    // Wait for all notifications to complete
    if (notifications.length > 0) {
      try {
        await Promise.all(notifications);
        console.log(`Overdue notifications sent (${notificationTypes.join(', ')}) for backup ${context.backup_name} on server ${context.server_name}`);
        
        // Log audit event for successful overdue notification
        const { AuditLogger } = await import('@/lib/audit-logger');
        await AuditLogger.logSystem(
          'notification_sent',
          {
            type: 'overdue',
            serverId: context.server_id,
            serverName: context.server_name,
            backupName: context.backup_name,
            channels: notificationTypes,
          },
          'success'
        );
      } catch (error) {
        console.error(`Failed to send overdue notifications for backup ${context.backup_name} on server ${context.server_name}:`, error instanceof Error ? error.message : String(error));
        
        // Log audit event for failed overdue notification
        const { AuditLogger } = await import('@/lib/audit-logger');
        await AuditLogger.logSystem(
          'notification_failed',
          {
            type: 'overdue',
            serverId: context.server_id,
            serverName: context.server_name,
            backupName: context.backup_name,
            channels: notificationTypes,
            error: error instanceof Error ? error.message : String(error),
          },
          'error',
          error instanceof Error ? error.message : String(error)
        );
        
        throw error;
      }
    } else {
      console.log(`No notification channels enabled for overdue backup ${context.backup_name} on server ${context.server_name}, skipping`);
    }

    // Send to additional destinations if configured
    // For overdue notifications, we always send unless additionalNotificationEvent is 'off'
    const additionalNotificationEvent = backupConfig.additionalNotificationEvent ?? backupConfig.notificationEvent;
    const shouldSendToAdditional = additionalNotificationEvent !== 'off';

    if (shouldSendToAdditional) {
      const additionalNotifications: Promise<void>[] = [];
      const additionalNotificationTypes: string[] = [];

      // Send to additional email addresses if configured
      if (backupConfig.additionalEmails && backupConfig.additionalEmails.trim() && getSMTPConfig()) {
        const emailAddresses = backupConfig.additionalEmails
          .split(',')
          .map(email => email.trim())
          .filter(email => email.length > 0 && email.includes('@'));
        
        if (emailAddresses.length > 0) {
          const htmlContent = convertTextToHtml(processedTemplate.message);
          for (const email of emailAddresses) {
            additionalNotifications.push(
              sendEmailNotification(
                processedTemplate.title,
                htmlContent,
                processedTemplate.message,
                email
              ).then(() => {
                if (!additionalNotificationTypes.includes('Additional Email')) {
                  additionalNotificationTypes.push('Additional Email');
                }
              }).catch((error) => {
                console.error(`Failed to send additional email notification to ${email} for overdue backup ${context.backup_name} on server ${context.server_name}:`, error instanceof Error ? error.message : String(error));
                // Don't throw - additional destinations are supplementary
              })
            );
          }
        }
      }

      // Send to additional NTFY topic if configured
      if (backupConfig.additionalNtfyTopic && backupConfig.additionalNtfyTopic.trim() && notificationConfig.ntfy.url) {
        additionalNotifications.push(
          sendNtfyNotification(
            notificationConfig.ntfy.url,
            backupConfig.additionalNtfyTopic.trim(),
            processedTemplate.title,
            processedTemplate.message,
            processedTemplate.priority,
            processedTemplate.tags,
            notificationConfig.ntfy.accessToken
          ).then(() => {
            additionalNotificationTypes.push('Additional NTFY');
          }).catch((error) => {
            console.error(`Failed to send additional NTFY notification to topic ${backupConfig.additionalNtfyTopic} for overdue backup ${context.backup_name} on server ${context.server_name}:`, error instanceof Error ? error.message : String(error));
            // Don't throw - additional destinations are supplementary
          })
        );
      }

      // Wait for additional notifications to complete (errors are logged but don't fail the function)
      if (additionalNotifications.length > 0) {
        try {
          await Promise.all(additionalNotifications);
          if (additionalNotificationTypes.length > 0) {
            console.log(`Additional overdue notifications sent (${additionalNotificationTypes.join(', ')}) for backup ${context.backup_name} on server ${context.server_name}`);
          }
        } catch (error) {
          // Log but don't throw - additional destinations are supplementary
          console.error(`Some additional overdue notifications failed for backup ${context.backup_name} on server ${context.server_name}:`, error instanceof Error ? error.message : String(error));
        }
      }
    }
    
  } catch (error) {
    console.error(`Failed to send overdue backup notification for ${context.backup_name} on server ${context.server_name}:`, error instanceof Error ? error.message : String(error));
    throw error;
  }
}