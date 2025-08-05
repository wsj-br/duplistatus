import format from 'string-template';
import { getConfiguration, getNtfyConfig, getOverdueToleranceConfig } from './db-utils';
import { NotificationConfig, NotificationTemplate, Backup, BackupStatus, BackupKey, OverdueTolerance } from './types';
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

export interface OverdueBackupContext {
  machine_name: string;
  machine_id: string;
  backup_name: string;
  last_backup_date: string;
  last_elapsed: string;
  expected_date: string;
  expected_elapsed: string;
  backup_interval_type: string;
  backup_interval_value: number;
  overdue_tolerance: string; // Human-readable tolerance label
}

// Helper function to convert overdue tolerance value to human-readable label
function getOverdueToleranceLabel(tolerance: OverdueTolerance): string {
  const toleranceLabels: Record<OverdueTolerance, string> = {
    'no_tolerance': 'No tolerance',
    '5min': '5 min',
    '15min': '15 min',
    '30min': '30 min',
    '1h': '1 hour',
    '2h': '2 hours',
    '4h': '4 hours',
    '6h': '6 hours',
    '12h': '12 hours',
    '1d': '1 day',
  };
  
  return toleranceLabels[tolerance] || tolerance;
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

// Helper function to get backup key
function getBackupKey(machineName: string, backupName: string): BackupKey {
  return `${machineName}:${backupName}`;
}

// Helper function to get backup settings with fallback to machine settings
function getBackupSettings(config: NotificationConfig, machineName: string, backupName: string) {
  const backupKey = getBackupKey(machineName, backupName);
  const backupConfig = config.backupSettings?.[backupKey];
  
  return backupConfig || null;
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
  machineName: string,
  context: NotificationContext
): Promise<void> {
  const config = await getNotificationConfig();
  if (!config) {
    console.log('No notification configuration found, skipping notification');
    return;
  }

  const backupConfig = getBackupSettings(config, machineName, backup.name);
  if (!backupConfig || backupConfig.notificationEvent === 'off') {
    console.log(`Notifications disabled for backup ${backup.name} on machine ${machineName}, skipping`);
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
      processedTemplate.tags
    );
    
    console.log(`Notification sent for backup ${backup.name} on machine ${machineName}, status: ${status}, notification config: ${notificationConf}`);
  } catch (error) {
    console.error(`Failed to send backup notification for ${machineName}:`, error instanceof Error ? error.message : String(error));
    throw error;
  }
}

export async function sendOverdueBackupNotification(
  machineId: string,
  machineName: string,
  backupName: string,
  context: OverdueBackupContext,
  config?: NotificationConfig
): Promise<void> {
  const notificationConfig = config || await getNotificationConfig();
  if (!notificationConfig) {
    return;
  }

  // Get the overdue tolerance configuration and add it to the context
  const overdueTolerance = getOverdueToleranceConfig();
  const contextWithTolerance: OverdueBackupContext = {
    ...context,
    overdue_tolerance: getOverdueToleranceLabel(overdueTolerance),
  };

  try {
    const processedTemplate = processTemplate(notificationConfig.templates?.overdueBackup || defaultNotificationTemplates.overdueBackup, contextWithTolerance);
    
    await sendNtfyNotification(
      notificationConfig.ntfy.url,
      notificationConfig.ntfy.topic,
      processedTemplate.title,
      processedTemplate.message,
      processedTemplate.priority,
      processedTemplate.tags
    );
    
  } catch (error) {
    console.error(`Failed to send overdue backup notification for ${machineName}:`, error instanceof Error ? error.message : String(error));
    throw error;
  }
}