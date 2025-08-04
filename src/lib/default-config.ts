import { NotificationConfig, NotificationTemplate, CronServiceConfig, CronInterval, BackupNotificationConfig } from './types';

// Default notification templates
export const defaultNotificationTemplates: {
  overdueBackup: NotificationTemplate;
  success: NotificationTemplate;
  warning: NotificationTemplate;
} = {
  overdueBackup: {
    message: "The backup {backup_name} is overdue on {machine_name}.\n\n🚨 Last backup was {last_backup_date} ({last_elapsed})\n⏰ Expected backup was {expected_date} ({expected_elapsed})\n\n🔍 Please check the duplicati server.",
    priority: "default",
    tags: "duplicati, duplistatus, overdue",
    title: "🕑 Overdue - {backup_name}  @ {machine_name}"
  },
  success: {
    message: "Backup {backup_name} on {machine_name} completed with status '{status}' at {backup_date} in {duration}.\n\n💾 Store usage:  {storage_size} \n🔃 Available versions:  {available_versions} ",
    priority: "default",
    tags: "duplicati, duplistatus, success",
    title: "✅ {status} - {backup_name}  @ {machine_name}"
  },
  warning: {
    message: "Backup {backup_name} on {machine_name} completed with status '{status}' at {backup_date}.\n\n🚨 {warnings_count} warnings\n🛑 {errors_count} errors.",
    priority: "high",
    tags: "duplicati, duplistatus, warning, error",
    title: " ⚠️{status} - {backup_name}  @ {machine_name}"
  }
};

// Default cron service configuration
export const defaultCronConfig: CronServiceConfig = {
  port: (() => {
    // Try to get CRON_PORT first
    const cronPort = process.env.CRON_PORT;
    if (cronPort) {
      return parseInt(cronPort, 10);
    }
    
    // Fallback to PORT + 1
    const basePort = process.env.PORT;
    if (basePort) {
      return parseInt(basePort, 10) + 1;
    }
    
    // Default fallback
    return 9667;
  })(),
  tasks: {
    'overdue-backup-check': {
      cronExpression: '*/20 * * * *', // Every 20 minutes
      enabled: true
    }
  }
};

// Default NTFY configuration
export const defaultNtfyConfig = {
  url: 'https://ntfy.sh/',
  topic: '' // Will be generated dynamically
};

// Default backup notification configuration
export const defaultBackupNotificationConfig: BackupNotificationConfig = {
  notificationEvent: 'off',
  overdueBackupCheckEnabled: false,
  expectedInterval: 1, // Default to 1 day (24 hours)
  intervalUnit: 'days',
  overdueTolerance: '1h', // Default to 1h tolerance
  cronInterval: '20min' as CronInterval
};

// Default UI configuration
export const defaultUIConfig = {
  databaseCleanupPeriod: '2 years' as const,
  tablePageSize: 5 as const,
  chartTimeRange: 'All data' as const,
  chartMetricSelection: 'uploadedSize' as const,
  autoRefreshInterval: 1 as const
};

// Default API configuration
export const defaultAPIConfig = {
  requestTimeout: 15000, // 15 seconds
  duplicatiPort: 8200,
  duplicatiProtocol: 'http' as const
};

// Default notification frequency configuration
export const defaultNotificationFrequencyConfig = 'onetime' as const;

// Function to create default notification configuration
export function createDefaultNotificationConfig(ntfyConfig: { url: string; topic: string }): NotificationConfig {
  return {
    ntfy: ntfyConfig,
    backupSettings: {}, // Keep empty - API handles defaults via separate storage
    templates: defaultNotificationTemplates
  };
}

// Helper function to generate a random string for ntfy topic
export function generateDefaultNtfyTopic(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'duplistatus-';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
} 