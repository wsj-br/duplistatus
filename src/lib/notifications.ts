import format from 'string-template';
import { getConfiguration, getNtfyConfig, getServerUrlById } from './db-utils';
import { NotificationConfig, NotificationTemplate, Backup, BackupStatus, BackupKey } from './types';
import { createDefaultNotificationConfig, defaultNotificationTemplates } from './default-config';

// Ensure this runs in Node.js runtime, not Edge Runtime
export const runtime = 'nodejs';

export interface NotificationContext {
  server_name: string;
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
  server_url: string;
}

export interface OverdueBackupContext {
  server_name: string;
  server_id: string;
  backup_name: string;
  last_backup_date: string;
  last_elapsed: string;
  expected_date: string;
  expected_elapsed: string;
  backup_interval_type: string;
  backup_interval_value: number;
  overdue_tolerance: string; // Human-readable tolerance label
  server_url: string;
}

async function getNotificationConfig(): Promise<NotificationConfig | null> {
  try {
    const configJson = getConfiguration('notifications');
    const backupSettingsJson = getConfiguration('backup_settings');
    
    // Get ntfy config with default topic generation if needed
    const ntfyConfig = await getNtfyConfig();
    
    if (!configJson) {
      // If no configuration exists, create a minimal one with default ntfy config
      return createDefaultNotificationConfig(ntfyConfig);
    }
    
    const config = JSON.parse(configJson) as NotificationConfig;
    
    // Ensure ntfy config is always set with the generated default if needed
    config.ntfy = ntfyConfig;
    
    // Load backup settings from separate configuration if available
    if (backupSettingsJson) {
      try {
        const backupSettings = JSON.parse(backupSettingsJson);
        config.backupSettings = backupSettings;
      } catch (error) {
        console.error('Failed to parse backup settings:', error instanceof Error ? error.message : String(error));
        config.backupSettings = {};
      }
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

  const response = await fetch(url.toString(), {
    method: 'POST',
    body: messageBytes,
    headers,
  });

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

  // Add server URL to context if not already present
  if (!context.server_url) {
    context.server_url = getServerUrlById(serverId);
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

  try {
    const processedTemplate = processTemplate(template, context);

    await sendNtfyNotification(
      config.ntfy.url,
      config.ntfy.topic,
      processedTemplate.title,
      processedTemplate.message,
      processedTemplate.priority,
      processedTemplate.tags,
      config.ntfy.accessToken
    );
    
    console.log(`Notification sent for backup ${backup.name} on server ${serverName}, status: ${status}, notification config: ${notificationConf}`);
  } catch (error) {
    console.error(`Failed to send backup notification for ${serverName}:`, error instanceof Error ? error.message : String(error));
    throw error;
  }
}

export async function sendOverdueBackupNotification(
  context: OverdueBackupContext
): Promise<void> {
  
  const notificationConfig = await getNotificationConfig();
  
  if (!notificationConfig) {
    return;
  }

  try {
    const processedTemplate = processTemplate(notificationConfig.templates?.overdueBackup || defaultNotificationTemplates.overdueBackup, context);
    
    await sendNtfyNotification(
      notificationConfig.ntfy.url,
      notificationConfig.ntfy.topic,
      processedTemplate.title,
      processedTemplate.message,
      processedTemplate.priority,
      processedTemplate.tags,
      notificationConfig.ntfy.accessToken
    );
    
  } catch (error) {
    console.error(`Failed to send overdue backup notification for ${context.server_name}:`, error instanceof Error ? error.message : String(error));
    throw error;
  }
}