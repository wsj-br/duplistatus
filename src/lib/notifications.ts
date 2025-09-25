import format from 'string-template';
import nodemailer from 'nodemailer';
import { getConfigNotifications, getConfigBackupSettings, getNtfyConfig, getServerInfoById } from './db-utils';
import { NotificationConfig, NotificationTemplate, Backup, BackupStatus, BackupKey, EmailConfig } from './types';
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
  backup_interval_type: string;
  backup_interval_value: number;
  overdue_tolerance: string; // Human-readable tolerance label
}

async function getNotificationConfig(): Promise<NotificationConfig | null> {
  try {
    const config = getConfigNotifications();
    const backupSettings = await getConfigBackupSettings();
    
    // Get ntfy config with default topic generation if needed
    const ntfyConfig = await getNtfyConfig();
    
    // Ensure ntfy config is always set with the generated default if needed
    config.ntfy = ntfyConfig;
    
    // Load backup settings from separate configuration if available
    if (Object.keys(backupSettings).length > 0) {
      config.backupSettings = backupSettings;
    } else {
      config.backupSettings = {};
    }
    
    return config;
  } catch (error) {
    console.error('Failed to get notification config:', error instanceof Error ? error.message : String(error));
    return null;
  }
}


// Helper function to get backup settings with fallback to server settings
async function getBackupSettings(config: NotificationConfig, serverId: string, backupName: string) {
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
export function getEmailConfigFromEnv(): EmailConfig | null {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const secure = process.env.SMTP_SECURE;
  const username = process.env.SMTP_USERNAME;
  const password = process.env.SMTP_PASSWORD;
  const mailto = process.env.SMTP_MAILTO;

  // Check if all required environment variables are present
  if (!host || !port || !secure || !username || !password || !mailto) {
    return null;
  }

  return {
    host,
    port: parseInt(port, 10),
    secure: secure.toLowerCase() === 'true',
    username,
    password,
    mailto,
    fromName: 'duplistatus',
    fromEmail: username, // Use username as from email by default
    enabled: true
  };
}

export function isEmailConfigured(): boolean {
  const config = getEmailConfigFromEnv();
  return config !== null;
}

export async function createEmailTransporter(): Promise<nodemailer.Transporter | null> {
  const config = getEmailConfigFromEnv();
  if (!config) {
    return null;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.username,
        pass: config.password,
      },
      // Enforce encrypted connections only
      requireTLS: true, // Require TLS encryption
      tls: {
        rejectUnauthorized: false, // Allow self-signed certificates but require encryption
        minVersion: 'TLSv1.2' // Require at least TLS 1.2
      }
    });

    // Verify the connection
    await transporter.verify();
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

  const config = getEmailConfigFromEnv();
  if (!config) {
    throw new Error('Email configuration not found');
  }

  const mailOptions = {
    from: `"${config.fromName}" <${config.fromEmail}>`,
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
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
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
  const formattedContext = { ...context };

  // Add additional server variables to context 
  const serverInfo = getServerInfoById(context.server_id);
  formattedContext.server_url = serverInfo?.server_url || '';
  formattedContext.server_alias = serverInfo?.alias || context.server_name;
  formattedContext.server_note = serverInfo?.note || '';


  // Format date fields if they exist in the context
  if ('backup_date' in formattedContext) {
    formattedContext.backup_date = formatDateString(formattedContext.backup_date);
  }
  if ('last_backup_date' in formattedContext) {
    formattedContext.last_backup_date = formatDateString(formattedContext.last_backup_date);
  }
  if ('expected_date' in formattedContext) {
    formattedContext.expected_date = formatDateString(formattedContext.expected_date);
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
  if (backupConfig.emailEnabled === true && isEmailConfigured()) {
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
    } catch (error) {
      console.error(`Failed to send notifications for backup ${backup.name} on server ${serverName}:`, error instanceof Error ? error.message : String(error));
      throw error;
    }
  } else {
    console.log(`No notification channels enabled for backup ${backup.name} on server ${serverName}, skipping`);
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
    if (backupConfig.emailEnabled === true && isEmailConfigured()) {
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
      await Promise.all(notifications);
      console.log(`Overdue notifications sent (${notificationTypes.join(', ')}) for backup ${context.backup_name} on server ${context.server_name}`);
    } else {
      console.log(`No notification channels enabled for overdue backup ${context.backup_name} on server ${context.server_name}, skipping`);
    }
    
  } catch (error) {
    console.error(`Failed to send overdue backup notification for ${context.backup_name} on server ${context.server_name}:`, error instanceof Error ? error.message : String(error));
    throw error;
  }
}