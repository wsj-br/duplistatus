export type BackupStatus = "Success" | "Unknown" | "Warning" | "Error" | "Fatal" | "Missed";

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
  isBackupMissed: boolean;
  notificationEvent?: NotificationEvent;
}

export interface OverallSummary {
  totalMachines: number;
  totalBackups: number;
  totalUploadedSize: number; // in bytes
  totalStorageUsed: number; // in bytes (sum of all backup.fileSize)
  totalBackupSize: number; // in bytes (sum of size_of_examined_files from latest backups)
  missedBackupsCount: number; // count of currently missed backups
}

export interface NtfyConfig {
  url: string;
  topic: string;
}

export type NotificationEvent = 'all' | 'warnings' | 'errors' | 'off';

// Legacy interface for backward compatibility
export interface MachineNotificationConfig {
  notificationEvent: NotificationEvent;
  expectedInterval: number; // in hours
  missedBackupCheckEnabled: boolean;
  intervalUnit: 'hours' | 'days';
}

// New interface for backup-based notifications
export interface BackupNotificationConfig {
  notificationEvent: NotificationEvent;
  expectedInterval: number; // raw value as entered by user
  missedBackupCheckEnabled: boolean;
  intervalUnit: 'hours' | 'days';
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
  machineSettings: Record<string, MachineNotificationConfig>; // Legacy - for backward compatibility
  backupSettings: Record<BackupKey, BackupNotificationConfig>; // New - for backup-based notifications
  templates: {
    success: NotificationTemplate;
    warning: NotificationTemplate;
    missedBackup: NotificationTemplate;
  };
}

export type CronInterval = 'disabled' | '5min'| '10min' | '15min' | '20min' | '30min' | '1hour' | '2hours';

export interface CronServiceConfig {
  port: number;
  tasks: {
    [taskName: string]: {
      cronExpression: string;
      enabled: boolean;
    };
  };
}

export type ResendFrequencyConfig = "never" | "every_day" | "every_week" | "every_month";
