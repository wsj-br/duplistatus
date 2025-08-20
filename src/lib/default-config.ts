import { NotificationConfig, NotificationTemplate, CronServiceConfig, CronInterval, BackupNotificationConfig } from './types';

// Default notification templates
export const defaultNotificationTemplates: {
  overdueBackup: NotificationTemplate;
  success: NotificationTemplate;
  warning: NotificationTemplate;
} = {
  success: {
    title: "✅ {status} - {backup_name}  @ {machine_name}",
    message: "Backup {backup_name} on {machine_name} completed with status '{status}' at {backup_date} in {duration}.\n\n" + 
             "☁️ Uploaded: {uploaded_size}\n" + 
             "💾 Store usage:  {storage_size}\n" +
             "🔃 Available versions:  {available_versions}\n",
    priority: "default",
    tags: "duplicati, duplistatus, success"
  },
  warning: {
    title: " ⚠️{status} - {backup_name}  @ {machine_name}",
    message: "Backup {backup_name} on {machine_name} completed with status '{status}' at {backup_date}.\n\n" + 
             "⏰ Duration: {duration}\n" + 
             "☁️ Uploaded: {uploaded_size}\n\n" + 
             "🚨 {warnings_count} warnings\n" + 
             "🛑 {errors_count} errors.\n\n" + 
             "🔍 Please check the duplicati server.\n",
    priority: "high",
    tags: "duplicati, duplistatus, warning, error"
  },
  overdueBackup: {
    title: "🕑 Overdue - {backup_name}  @ {machine_name}",
    message: "The backup {backup_name} is overdue on {machine_name}.\n\n" + 
             "🚨 Last backup was {last_backup_date} ({last_elapsed})\n" + 
              "⏰ Expected backup was {expected_date} ({expected_elapsed})\n\n" + 
              "Expected interval:  {backup_interval_value} {backup_interval_type} / Tolerance:  {overdue_tolerance}\n\n" + 
             "🔍 Please check the duplicati server.\n",
    priority: "default",
    tags: "duplicati, duplistatus, overdue"
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
  topic: '', // Will be generated dynamically
  accessToken: '' // Optional access token for authenticated servers
};

// Global overdue tolerance configuration
export const defaultOverdueTolerance = '1h' as const;

// Global cron interval configuration
export const defaultCronInterval = '20min' as CronInterval;

// Default notification frequency configuration
export const defaultNotificationFrequencyConfig = 'every_day' as const;


// Default backup notification configuration
export const defaultBackupNotificationConfig: BackupNotificationConfig = {
  notificationEvent: 'warnings',
  overdueBackupCheckEnabled: true,
  expectedInterval: 1, // Default to 1 day (24 hours)
  intervalUnit: 'day'
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


// Function to create default notification configuration
export function createDefaultNotificationConfig(ntfyConfig: { url: string; topic: string; accessToken?: string }): NotificationConfig {
  return {
    ntfy: ntfyConfig,
    backupSettings: {}, // Keep empty - API handles defaults via separate storage
    templates: defaultNotificationTemplates
  };
}

// Helper function to generate a random string for ntfy topic
export function generateDefaultNtfyTopic(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'duplistatus-';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
} 