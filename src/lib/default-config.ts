import { NotificationTemplate, CronServiceConfig, CronInterval, BackupNotificationConfig } from './types';

// Default notification templates
export const defaultNotificationTemplates: {
  overdueBackup: NotificationTemplate;
  success: NotificationTemplate;
  warning: NotificationTemplate;
} = {
  success: {
    title: "✅ {status} - {backup_name}  @ {server_alias}",
    message: "Backup {backup_name} on {server_alias} completed with status '{status}' at {backup_date} in {duration}.\n\n" + 
             "🔍 Note: {server_note}\n" + 
             "☁️ Uploaded: {uploaded_size}\n" + 
             "💾 Store usage:  {storage_size}\n" +
             "🔃 Available versions:  {available_versions}\n",
    priority: "default",
    tags: "duplicati, duplistatus, success"
  },
  warning: {
    title: " ⚠️{status} - {backup_name}  @ {server_alias}",
    message: "Backup {backup_name} on {server_alias} completed with status '{status}' at {backup_date}.\n\n" + 
             "🔍 Note: {server_note}\n" + 
             "⏰ Duration: {duration}\n" + 
             "☁️ Uploaded: {uploaded_size}\n\n" + 
             "🚨 {warnings_count} warnings\n" + 
             "🛑 {errors_count} errors.\n\n" + 
             "⚠️ Check the duplicati server immediately {server_url}\n",
    priority: "high",
    tags: "duplicati, duplistatus, warning, error"
  },
  overdueBackup: {
    title: "🕑 Overdue - {backup_name}  @ {server_alias}",
    message: "The backup {backup_name} is overdue on {server_alias}.\n\n" + 
              "🔍 Note: {server_note}\n" + 
              "🚨 Last backup received: {last_backup_date} ({last_elapsed})\n" + 
              "⏰ Expected backup time: {expected_date} ({expected_elapsed})\n\n" + 
              "Expected interval: {backup_interval} / Tolerance: {overdue_tolerance}\n\n" + 
             "⚠️ Check the duplicati server immediately {server_url}\n",
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
      cronExpression: '*/5 * * * *', // Every 5 minutes
      enabled: true
    },
    'audit-log-cleanup': {
      cronExpression: '0 2 * * *', // Daily at 2 AM UTC
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
export const defaultCronInterval = '5min' as CronInterval;

// Default notification frequency configuration
export const defaultNotificationFrequencyConfig = 'every_day' as const;


// Default backup notification configuration
export const defaultBackupNotificationConfig: BackupNotificationConfig = {
  notificationEvent: 'warnings',
  overdueBackupCheckEnabled: true,
  expectedInterval: '1D', // Default to 1 day
  allowedWeekDays: [0, 1, 2, 3, 4, 5, 6], // All days enabled (Sunday to Saturday)
  time: '', // Empty string as default
  ntfyEnabled: true, // NTFY enabled by default
  emailEnabled: true // Email enabled by default
};

// Default UI configuration
export const defaultUIConfig = {
  databaseCleanupPeriod: '2 years' as const,
  tablePageSize: 5 as const,
  chartTimeRange: 'All data' as const,
  autoRefreshInterval: 1 as const,
  dashboardCardsSortOrder: 'Server name (a-z)' as const
};

// Default API configuration
export const defaultAPIConfig = {
  requestTimeout: 15000, // 15 seconds
  duplicatiPort: 8200,
  duplicatiProtocol: 'http' as const
};

// Default authentication configuration
export const defaultAuthConfig = {
  defaultPassword: 'Duplistatus09' as const
};


// Note: Legacy createDefaultNotificationConfig was removed in favor of split keys

// Helper function to generate a random string for ntfy topic
export function generateDefaultNtfyTopic(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'duplistatus-';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
} 