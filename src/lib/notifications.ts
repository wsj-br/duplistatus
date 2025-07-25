import format from 'string-template';
import { getConfiguration } from './db-utils';
import { NotificationConfig, NotificationTemplate, Backup, BackupStatus, BackupKey } from './types';

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
  link: string; // URL to backup detail page
}

export interface MissedBackupContext {
  machine_name: string;
  machine_id: string;
  backup_name: string;
  expected_interval: number; // hours
  hours_since_last_backup: number;
  last_backup_date?: string;
  // Additional variables to match TEMPLATE_VARIABLES
  backup_date: string; // Same as last_backup_date for consistency
  status: string; // "Missed" for missed backup notifications
  messages_count: number; // 0 for missed backups
  warnings_count: number; // 0 for missed backups
  errors_count: number; // 0 for missed backups
  duration: string; // "N/A" for missed backups
  file_count: number; // 0 for missed backups
  file_size: string; // "N/A" for missed backups
  uploaded_size: string; // "N/A" for missed backups
  storage_size: string; // "N/A" for missed backups
  available_versions: number; // 0 for missed backups
}

async function getNotificationConfig(): Promise<NotificationConfig | null> {
  try {
    const configJson = getConfiguration('notifications');
    const backupSettingsJson = getConfiguration('backup_settings');
    
    if (!configJson) return null;
    
    const config = JSON.parse(configJson) as NotificationConfig;
    
    // Load backup settings from separate configuration if available
    if (backupSettingsJson) {
      try {
        const backupSettings = JSON.parse(backupSettingsJson);
        config.backupSettings = backupSettings;
      } catch (error) {
        console.error('Failed to parse backup settings:', error);
        config.backupSettings = {};
      }
    } else {
      config.backupSettings = {};
    }
    
    return config;
  } catch (error) {
    console.error('Failed to get notification config:', error);
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

function processTemplate(template: NotificationTemplate, context: NotificationContext | MissedBackupContext): {
  title: string;
  message: string;
  priority: string;
  tags: string;
} {
  return {
    title: format(template.title, context),
    message: format(template.message, context),
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
    template = config.templates.success;
  } else if (status === 'Warning' || backup.warnings > 0) {
    if (backupConfig.notificationEvent === 'errors') {
      // Only send error notifications, skip warnings
      return;
    }
    template = config.templates.warning;
  } else if (status === 'Failed' || status === 'Fatal' || status === 'InProgress' || backup.errors > 0) {
    template = config.templates.warning; // Use warning template for errors
  } else {
    // Unknown status, use warning template
    template = config.templates.warning;
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
    console.error(`Failed to send backup notification for ${machineName}:`, error);
    throw error;
  }
}

export async function sendMissedBackupNotification(
  machineId: string,
  machineName: string,
  backupName: string,
  context: MissedBackupContext
): Promise<void> {
  const config = await getNotificationConfig();
  if (!config) {
    return;
  }

  try {
    const processedTemplate = processTemplate(config.templates.missedBackup, context);
    
    await sendNtfyNotification(
      config.ntfy.url,
      config.ntfy.topic,
      processedTemplate.title,
      processedTemplate.message,
      processedTemplate.priority,
      processedTemplate.tags
    );
    
  } catch (error) {
    console.error(`Failed to send missed backup notification for ${machineName}:`, error);
    throw error;
  }
}

// Utility function to format bytes into human-readable string
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Utility function to format duration from seconds
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
} 