export type BackupStatus = "Success" | "Unknown" | "Warning" | "Error" | "Fatal";

export interface Backup {
  id: string;
  machine_id: string;
  name: string;
  date: string; // ISO string
  status: BackupStatus;
  warnings: number;
  errors: number;
  messages: number;
  fileCount: number;
  fileSize: number; // in bytes
  uploadedSize: number; // in bytes
  duration: string; // e.g., "30m 15s"
  duration_seconds: number; // raw duration in seconds
  // Numeric values for charting
  durationInMinutes: number;
  knownFileSize: number;
  backup_list_count: number | null;
  // Message arrays stored as JSON strings
  messages_array: string | null;
  warnings_array: string | null;
  errors_array: string | null;
  // Available version timestamps (ISO format)
  available_backups: string[] | null;
}

export interface Machine {
  id: string;
  name: string;
  backups: Backup[];
  // For chart data pre-computation
  chartData: {
    date: string;
    isoDate: string; // ISO date string for accurate date filtering
    uploadedSize: number; // in bytes
    duration: number; // in minutes
    fileCount: number;
    fileSize: number; // in bytes
    storageSize: number; // in bytes
    backupVersions: number; // available versions
  }[];
}

export interface MachineSummary {
  id: string;
  name: string;
  backupCount: number;
  lastBackupStatus: BackupStatus | 'N/A';
  lastBackupDate: string; // ISO string or "N/A"
  lastBackupDuration: string; // or "N/A"
  lastBackupListCount: number | null;
  lastBackupName: string | null;
  lastBackupId: string | null;
  totalWarnings: number;
  totalErrors: number;
  availableBackups: string[] | null;
  isBackupOverdue: boolean;
  notificationEvent?: NotificationEvent;
  expectedBackupDate: string; // ISO string or "N/A"
  expectedBackupElapsed: string; // formatted time ago or "N/A"
  lastOverdueCheck: string; // ISO string or "N/A" - time of last run of checkOverdueBackups()
  lastNotificationSent: string; // ISO string or "N/A" - time of last notification sent
}

export interface OverallSummary {
  totalMachines: number;
  totalBackups: number;
  totalUploadedSize: number; // in bytes
  totalStorageUsed: number; // in bytes (sum of all backup.fileSize)
  totalBackupSize: number; // in bytes (sum of size_of_examined_files from latest backups)
  overdueBackupsCount: number; // count of currently overdue backups
}

export interface NtfyConfig {
  url: string;
  topic: string;
}

export type NotificationEvent = 'all' | 'warnings' | 'errors' | 'off';

// Interface for backup-based notifications
export interface BackupNotificationConfig {
  notificationEvent: NotificationEvent;
  expectedInterval: number; // raw value as entered by user
  overdueBackupCheckEnabled: boolean;
  intervalUnit: 'hour' | 'day';
}

// Helper type for backup identification
export type BackupKey = string; // Format: "machineName:backupName"

export interface NotificationTemplate {
  title: string;
  priority: string;
  tags: string;
  message: string;
}

export interface NotificationConfig {
  ntfy: NtfyConfig;
  backupSettings: Record<BackupKey, BackupNotificationConfig>;
  templates: {
    success: NotificationTemplate;
    warning: NotificationTemplate;
    overdueBackup: NotificationTemplate;
  };
}

export type CronInterval = 'disabled' | '1min' | '5min'| '10min' | '15min' | '20min' | '30min' | '1hour' | '2hours';

export interface CronServiceConfig {
  port: number;
  tasks: {
    [taskName: string]: {
      cronExpression: string;
      enabled: boolean;
    };
  };
  notificationConfig?: NotificationConfig;
}

export interface CronServiceStatus {
  isRunning: boolean;
  activeTasks: string[];
  lastRunTimes: Record<string, string>;
  errors: Record<string, string>;
}

export interface TaskExecutionResult {
  taskName: string;
  success: boolean;
  message?: string;
  error?: string;
  statistics?: Record<string, unknown>;
}

export interface OverdueBackupCheckResult {
  message: string;
  statistics?: {
    checkedBackups: number;
    overdueBackupsFound: number;
    notificationsSent: number;
  };
}

export type NotificationFrequencyConfig = "onetime" | "every_day" | "every_week" | "every_month";

// New type for overdue tolerance options
export type OverdueTolerance = 'no_tolerance' | '5min' | '15min' | '30min' | '1h' | '2h' | '4h' | '6h' | '12h' | '1d';
