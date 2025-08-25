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
  backupTypes: Array<{
    name: string;
    lastBackupDate: string;
    lastBackupStatus: BackupStatus | 'N/A';
    lastBackupDuration: string;
    lastBackupListCount: number | null;
    backupCount: number;
    statusHistory: BackupStatus[];
    fileCount: number;
    fileSize: number;
    storageSize: number;
    uploadedSize: number;
    // Backup status fields moved to backup type level
    isBackupOverdue: boolean;
    notificationEvent?: NotificationEvent;
    expectedBackupDate: string;
    expectedBackupElapsed: string;
    lastOverdueCheck: string;
    lastNotificationSent: string;
  }>;
  totalBackupCount: number;
  lastBackupDate: string;
  lastBackupStatus: BackupStatus | 'N/A';
  lastBackupDuration: string;
  lastBackupListCount: number | null;
  lastBackupName: string | null;
  lastBackupId: string | null;
  totalWarnings: number;
  totalErrors: number;
  availableBackups: string[] | null;
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
  accessToken?: string;
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

// Interface for overdue backup notification timestamps
export interface OverdueNotificationTimestamp {
  lastNotificationSent: string; // ISO timestamp
  lastBackupDate: string; // ISO timestamp of the backup that was current when notification was sent
}

// Type for overdue backup notifications configuration
export type OverdueNotifications = Record<BackupKey, OverdueNotificationTimestamp>;

// Chart data interface for dashboard components
export interface ChartDataPoint {
  date: string;
  isoDate: string;
  uploadedSize: number;
  duration: number;
  fileCount: number;
  fileSize: number;
  storageSize: number;
  backupVersions: number;
  machineId?: string;
  backupId?: string;
}

// Machine card data interface for dashboard UI components
export interface MachineCardData {
  id: string;
  name: string;
  backupTypes: Array<{
    name: string;
    lastBackupDate: string;
    lastBackupStatus: BackupStatus | 'N/A';
    lastBackupDuration: string;
    lastBackupListCount: number | null;
    backupCount: number;
    statusHistory: BackupStatus[];
    // New fields from updated query
    fileCount: number;
    fileSize: number;
    storageSize: number;
    uploadedSize: number;
    // Backup status fields moved from machine level
    isBackupOverdue: boolean;
    notificationEvent?: string;
    expectedBackupDate: string;
    expectedBackupElapsed: string;
    lastOverdueCheck: string;
    lastNotificationSent: string;
  }>;
  totalBackupCount: number;
  lastBackupDate: string;
  lastBackupStatus: BackupStatus | 'N/A';
  lastBackupDuration: string;
  lastBackupListCount: number | null;
  availableBackups: string[];
}

// Dashboard data grouping interface
export interface DashboardData {
  machinesSummary: MachineSummary[];
  overallSummary: OverallSummary;
  allMachinesChartData: ChartDataPoint[];
}
