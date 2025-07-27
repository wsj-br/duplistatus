import format from 'string-template';
import { getConfiguration, getNtfyConfig } from './db-utils';
import { NotificationConfig, NotificationTemplate, Backup, BackupStatus, BackupKey } from './types';
import { createDefaultNotificationConfig, defaultNotificationTemplates } from './default-config';

// Ensure this runs in Node.js runtime, not Edge Runtime
export const runtime = 'nodejs';

export interface NotificationContext {
  machine_name: string;
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

export interface MissedBackupContext {
  machine_name: string;
  machine_id: string;
  backup_name: string;
  last_backup_date: string;
  last_elapsed: string;
  backup_interval_type: string;
  backup_interval_value: number;
}

async function getNotificationConfig(): Promise<NotificationConfig | null> {
  try {
    const configJson = getConfiguration('notifications');
    const backupSettingsJson = getConfiguration('backup_settings');
    
    // Get ntfy config with default topic generation if needed
    const ntfyConfig = getNtfyConfig();
    
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

// Helper function to get backup key
function getBackupKey(machineName: string, backupName: string): BackupKey {
  return `${machineName}:${backupName}`;
}

// Helper function to get backup settings with fallback to machine settings
function getBackupSettings(config: NotificationConfig, machineName: string, backupName: string, machineId?: string) {
  const backupKey = getBackupKey(machineName, backupName);
  const backupConfig = config.backupSettings?.[backupKey];
  
  if (backupConfig) {
    return backupConfig;
  }
  
  // Fallback to machine settings for backward compatibility
  if (machineId && config.machineSettings?.[machineId]) {
    return config.machineSettings[machineId];
  }
  
  return null;
}

export async function sendNtfyNotification(
  ntfyUrl: string,
  topic: string,
  title: string,
  message: string,
  priority: string,
  tags: string
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

  const response = await fetch(url.toString(), {
    method: 'POST',
    body: messageBytes,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to send notification to NTFY: ${response.statusText} - ${errorBody}`);
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

function processTemplate(template: NotificationTemplate, context: NotificationContext | MissedBackupContext): {
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

  return {
    title: format(template.title, formattedContext),
    message: format(template.message, formattedContext),
    priority: template.priority,
    tags: template.tags,
  };
}

export async function sendBackupNotification(
  backup: Backup,
  machineName: string,
  context: NotificationContext
): Promise<void> {
  const config = await getNotificationConfig();
  if (!config) {
    console.log('No notification configuration found, skipping notification');
    return;
  }

  const backupConfig = getBackupSettings(config, machineName, backup.name, backup.machine_id);
  if (!backupConfig || backupConfig.notificationEvent === 'off') {
    console.log(`Notifications disabled for backup ${backup.name} on machine ${machineName}, skipping`);
    return;
  }

  // Determine which template to use based on backup status and backup settings
  let template: NotificationTemplate;
  const status = backup.status;
  
  if (status === 'Success') {
    if (backupConfig.notificationEvent === 'errors') {
      // Only send error notifications, skip success
      return;
    }
    template = config.templates?.success || defaultNotificationTemplates.success;
  } else if (status === 'Warning' || status=== "Unknown" || backup.warnings > 0) {
    if (backupConfig.notificationEvent === 'errors') {
      // Only send error notifications, skip warnings
      return;
    }
    template = config.templates?.warning || defaultNotificationTemplates.warning;
  } else if (status === 'Error' || status === 'Fatal' || backup.errors > 0) {
    template = config.templates?.warning || defaultNotificationTemplates.warning; // Use warning template for errors
  } else {
    // Unknown status, use warning template
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
      processedTemplate.tags
    );
    
    console.log(`Notification sent for backup ${backup.name} on machine ${machineName}`);
  } catch (error) {
    console.error(`Failed to send backup notification for ${machineName}:`, error instanceof Error ? error.message : String(error));
    throw error;
  }
}

export async function sendMissedBackupNotification(
  machineId: string,
  machineName: string,
  backupName: string,
  context: MissedBackupContext,
  config?: NotificationConfig
): Promise<void> {
  const notificationConfig = config || await getNotificationConfig();
  if (!notificationConfig) {
    return;
  }

  try {
    const processedTemplate = processTemplate(notificationConfig.templates?.missedBackup || defaultNotificationTemplates.missedBackup, context);
    
    await sendNtfyNotification(
      notificationConfig.ntfy.url,
      notificationConfig.ntfy.topic,
      processedTemplate.title,
      processedTemplate.message,
      processedTemplate.priority,
      processedTemplate.tags
    );
    
  } catch (error) {
    console.error(`Failed to send missed backup notification for ${machineName}:`, error instanceof Error ? error.message : String(error));
    throw error;
  }
}