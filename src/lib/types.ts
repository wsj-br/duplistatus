export type BackupStatus = "Success" | "Unknown" | "Warning" | "Error" | "Fatal";

export interface Backup {
  id: string;
  server_id: string;
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

export interface Server {
  id: string;
  name: string;
  alias: string;
  note: string;
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

export interface ServerSummary {
  id: string;
  name: string;
  server_url: string;
  alias: string;
  note: string;
  backupInfo: Array<{
    name: string;
    lastBackupDate: string;
    lastBackupId: string;
    lastBackupStatus: BackupStatus | 'N/A';
    lastBackupDuration: string;
    lastBackupListCount: number | null;
    backupCount: number;
    statusHistory: BackupStatus[];
    fileCount: number;
    fileSize: number;
    storageSize: number;
    uploadedSize: number;
    warnings: number;
    errors: number;
    isBackupOverdue: boolean;
    notificationEvent?: NotificationEvent;
    expectedBackupDate: string;
    expectedBackupElapsed: string;
    lastNotificationSent: string;
    availableBackups: string[];
  }>;
  totalBackupCount: number;
  totalStorageSize: number;
  totalFileCount: number;
  totalFileSize: number;
  totalUploadedSize: number;
  haveOverdueBackups: boolean;
  lastBackupDate: string;
  lastBackupStatus: BackupStatus | 'N/A';
  lastBackupDuration: string;
  lastBackupListCount: number | null;
  lastBackupName: string | null;
  lastBackupId: string | null;
  lastOverdueCheck: string;
  backupNames: string[];
}

export interface OverallSummary {
  totalServers: number;
  totalBackupsRuns: number; // count of all backup runs (individual executions)
  totalBackups: number; // count of all backup jobs/configurations across all machines
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
  expectedInterval: string; // interval string like "1D2h30m" (1 day, 2 hours, 30 minutes) or "1D" (1 day) or "1W" (1 week) or "1M" (1 month)
  overdueBackupCheckEnabled: boolean;
  allowedWeekDays?: number[]; // allowed week days (0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday)
  time: string; // ISO timestamp of scheduled backup time from Duplicati
}

// Helper type for backup identification
export type BackupKey = string; // Format: "serverId:backupName"

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
  serverAddresses: ServerAddress[];
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
  serverName: string;  // server name
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
  serverId?: string;
  backupId?: string;
}


// Dashboard data grouping interface
export interface DashboardData {
  serversSummary: ServerSummary[];
  overallSummary: OverallSummary;
  allServersChartData: ChartDataPoint[];
}

export interface ServerAddress {
  id: string;
  name: string;
  server_url: string;
  alias: string;
  note: string;
}

// Interface for Duplicati system info
export interface SystemInfo {
  APIVersion: number;
  PasswordPlaceholder: string;
  ServerVersion: string;
  ServerVersionName: string;
  ServerVersionType: string;
  RemoteControlRegistrationUrl: string;
  StartedBy: string;
  DefaultUpdateChannel: string;
  DefaultUsageReportLevel: string;
  ServerTime: string;
  OSType: string;
  OSVersion: string;
  DirectorySeparator: string;
  PathSeparator: string;
  CaseSensitiveFilesystem: boolean;
  MachineName: string;
  PackageTypeId: string;
  UserName: string;
  NewLine: string;
  CLRVersion: string;
  Options: Array<{
    Aliases: string | null;
    LongDescription: string;
    Name: string;
    ShortDescription: string;
    Type: string;
    ValidValues: string | null;
    DefaultValue: string;
    Typename: string;
    Deprecated: boolean;
    DeprecationMessage: string;
  }>;
  CompressionModules?: unknown[];
  EncryptionModules?: unknown[];
  BackendModules?: unknown[];
  GenericModules?: unknown[];
  WebModules?: unknown[];
  ConnectionModules?: unknown[];
  SecretProviderModules?: unknown[];
  ServerModules?: unknown[];
  LogLevels?: unknown[];
  SupportedLocales?: unknown[];
}
