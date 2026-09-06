export type BackupStatus = "Success" | "Unknown" | "Warning" | "Error" | "Fatal";

export const DUPLICATI_CHANNELS = ['stable', 'beta', 'experimental', 'canary'] as const;
export type DuplicatiChannel = (typeof DUPLICATI_CHANNELS)[number];

export type DuplicatiVersionComparison = 'current' | 'outdated' | 'unavailable';

export interface DuplicatiParsedVersion {
  versionNumber: string;
  channel: DuplicatiChannel | null;
  components: readonly [number, number, number, number];
}

export interface DuplicatiChannelVersion {
  versionNumber: string;
  tagName: string;
  publishedAt: string | null;
}

export interface DuplicatiVersionCache {
  updatedAt: string;
  source: 'github';
  channels: Record<DuplicatiChannel, DuplicatiChannelVersion | null>;
}

export interface DuplicatiVersionStatus {
  raw: string | null;
  versionNumber: string | null;
  channel: DuplicatiChannel | null;
  latestVersionNumber: string | null;
  comparison: DuplicatiVersionComparison;
}

export type DuplicatiVersionRefreshTrigger = 'startup' | 'cron' | 'manual';

export const DUPLICATI_VERSION_CHECK_INTERVALS = ['daily', '12h', '6h'] as const;
export type DuplicatiVersionCheckInterval = (typeof DUPLICATI_VERSION_CHECK_INTERVALS)[number];

export interface DuplicatiVersionCheckConfig {
  interval: DuplicatiVersionCheckInterval;
  startTimeUtc: string;
}

export interface DuplicatiVersionRefreshResult {
  success: boolean;
  refreshed: boolean;
  message: string;
  cache: DuplicatiVersionCache | null;
}

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
    duplicatiVersion: DuplicatiVersionStatus;
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
  duplicatiVersion: DuplicatiVersionStatus;
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

export interface EmailConfig {
  host: string;
  port: number;
  connectionType: SMTPConnectionType;
  username: string;
  password?: string;
  mailto: string;
  senderName?: string;
  fromAddress?: string;
  requireAuth?: boolean;
  enabled: boolean;
  hasPassword?: boolean;
}

export type NotificationEvent = 'all' | 'warnings' | 'errors' | 'off';

// Interface for backup-based notifications
export interface BackupNotificationConfig {
  notificationEvent: NotificationEvent;
  expectedInterval: string; // interval string like "1D2h30m" (1 day, 2 hours, 30 minutes) or "1D" (1 day) or "1W" (1 week) or "1M" (1 month)
  overdueBackupCheckEnabled: boolean;
  allowedWeekDays?: number[]; // allowed week days (0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday)
  time: string; // ISO timestamp of next scheduled backup time from Duplicati (Schedule.Time) - fallback to lastBackupDate if not available
  lastBackupDate?: string; // ISO timestamp of last successful backup (Schedule.LastRun or actual backup received)
  ntfyEnabled: boolean; // whether to send NTFY notifications for this backup
  emailEnabled: boolean; // whether to send email notifications for this backup
  additionalNotificationEvent?: NotificationEvent; // Notification event configuration for additional destinations (defaults to notificationEvent if not set)
  additionalEmails?: string; // Comma-separated email addresses for additional recipients
  additionalNtfyTopic?: string; // Additional NTFY topic name
}

// Helper type for backup identification
export type BackupKey = string; // Format: "serverId:backupName"

export interface NotificationTemplate {
  title: string;
  priority: string;
  tags: string;
  message: string;
}

export const NOTIFICATION_PRIORITIES = ['max', 'high', 'default', 'low', 'min'] as const;
export type NotificationPriority = (typeof NOTIFICATION_PRIORITIES)[number];

export function isNotificationPriority(value: string): value is NotificationPriority {
  return (NOTIFICATION_PRIORITIES as readonly string[]).includes(value);
}

export interface DailySummaryEmailTemplate {
  title: string;
  message: string;
}

export interface DailySummaryTemplateSet {
  email: DailySummaryEmailTemplate;
}

export interface StoredNotificationTemplates {
  language: SupportedTemplateLanguage;
  success: NotificationTemplate;
  warning: NotificationTemplate;
  overdueBackup: NotificationTemplate;
  dailySummary: DailySummaryTemplateSet;
}

export const DAILY_SUMMARY_CONFIG_KEY = 'daily_summary';
export const DAILY_SUMMARY_DISPATCH_TASK = 'daily-summary-dispatch';

export interface DailySummaryConfig {
  enabled: boolean;
  /** Daily send time stored as HH:mm UTC. */
  utcTime: string;
  /** Browser IANA timezone from the last save (email display only). */
  timeZone: string;
  effectiveFromIso: string;
  /** Public dashboard URL for `{duplistatus_link}` (no trailing slash). Empty omits the link unless env overrides. */
  publicUrl: string;
}

export type DailySummaryChannel = 'email' | 'ntfy';
export type DailySummaryDeliveryState = 'pending' | 'sending' | 'sent' | 'failed';
export type DailySummaryTrigger = 'scheduled' | 'manual' | 'retry';
export type NotificationDeliveryOutcome = 'sent' | 'suppressed' | 'skipped';

export interface DailySummaryRenderedPayload {
  subject: string;
  emailHtml: string;
  emailText: string;
}

export interface DailySummaryChannelPublicStatus {
  enabled: boolean;
  state: DailySummaryDeliveryState | 'idle';
  lastAttemptAt: string | null;
  lastSuccessAt: string | null;
  lastError: string | null;
  nextRetryAt: string | null;
  occurrenceKey: string | null;
}

export interface DailySummaryPublicStatus {
  enabled: boolean;
  utcTime: string;
  timeZone: string;
  publicUrl: string;
  publicUrlEffective: string | null;
  publicUrlEnvOverride: boolean;
  nextOccurrenceIso: string | null;
  dispatcherHealthy: boolean;
  emailConfigured: boolean;
  channel: DailySummaryChannelPublicStatus;
}

export interface DailySummaryJobRow {
  serverId: string;
  serverName: string;
  serverAlias: string;
  serverNote: string;
  serverUrl: string;
  backupName: string;
  lastBackupId: string | null;
  lastBackupDate: string | null;
  lastBackupStatus: BackupStatus | null;
  durationSeconds: number | null;
  uploadedSize: number;
  sourceSize: number;
  storageSize: number;
  examinedFiles: number;
  warnings: number;
  errors: number;
  isOverdue: boolean;
  expectedBackupDate: string | null;
  hasReport: boolean;
}

export interface DailySummarySnapshot {
  generatedAt: string;
  timeZone: string;
  summaryDate: string;
  jobs: DailySummaryJobRow[];
  serverCount: number;
  jobCount: number;
  successCount: number;
  warningCount: number;
  errorCount: number;
  fatalCount: number;
  unknownCount: number;
  noReportCount: number;
  overdueCount: number;
  latestUploadedSize: number;
  latestSourceSize: number;
  latestStorageSize: number;
  latestFileCount: number;
  totalWarnings: number;
  totalErrors: number;
  omittedJobCount: number;
}

import { LOCALE_CODE_LIST, type LocaleCode } from '@/lib/locales';

/**
 * Supported languages for notification templates.
 */
export type SupportedTemplateLanguage = LocaleCode;

/**
 * List of all supported template languages - derived from ui-languages.json
 */
export const SUPPORTED_TEMPLATE_LANGUAGES: SupportedTemplateLanguage[] = [...LOCALE_CODE_LIST];

// Deprecated: NotificationConfig has been replaced by separate keys and unified response shape

export type CronInterval = 'disabled' | '1min' | '5min'| '10min' | '15min' | '20min' | '30min' | '1hour' | '2hours';

export interface CronServiceConfig {
  port: number;
  tasks: {
    [taskName: string]: {
      cronExpression: string;
      enabled: boolean;
    };
  };
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
    notificationsSuppressed?: number;
  };
}

export type NotificationFrequencyConfig = "onetime" | "every_day" | "every_week" | "every_month";

// New type for overdue tolerance options
export type OverdueTolerance = 'no_tolerance' | '5min' | '15min' | '30min' | '1h' | '2h' | '4h' | '6h' | '12h' | '1d';

// Start of week options
export type StartOfWeek = 'locale' | 'sunday' | 'monday';

// Format locale override: 'locale-default' or any locale code from supported-locales.json
export type FormatLocaleOverride = 'locale-default' | string;

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
  hasPassword: boolean;
  duplicatiVersion?: DuplicatiVersionStatus;
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
  ServerOnlyOptions?: Array<{
    Name: string;
    DefaultValue: string;
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

// SMTP Configuration types
export type SMTPConnectionType = 'plain' | 'starttls' | 'ssl';

export interface SMTPConfig {
  host: string;
  port: number;
  connectionType: SMTPConnectionType;
  username: string;
  password: string;
  mailto: string;
  senderName?: string; // Optional sender display name (defaults to "duplistatus")
  fromAddress?: string; // Optional from email address (defaults to username)
  requireAuth?: boolean; // Whether SMTP server requires authentication (defaults to true)
}

export const API_KEY_SCOPES = ['upload', 'read'] as const;
export type ApiKeyScope = (typeof API_KEY_SCOPES)[number];

export function isApiKeyScope(value: string): value is ApiKeyScope {
  return (API_KEY_SCOPES as readonly string[]).includes(value);
}

export function assertApiKeyScope(scope: ApiKeyScope): ApiKeyScope {
  switch (scope) {
    case 'upload':
    case 'read':
      return scope;
    default: {
      const exhaustive: never = scope;
      throw new Error(`Unhandled API key scope: ${String(exhaustive)}`);
    }
  }
}

export interface ApiKeyPublic {
  id: string;
  name: string;
  description: string;
  scope: ApiKeyScope;
  fingerprint: string;
  enabled: boolean;
  createdAt: string;
  createdBy: string | null;
  expiresAt: string | null;
  lastUsedAt: string | null;
  usageCount: number;
}

export interface UploadLimitsConfig {
  enabled: boolean;
  maxBytes: number;
  perMinute: number;
  perHour: number;
}

export interface CidrAllowlistConfig {
  enabled: boolean;
  cidrs: string[];
}

export interface TrustedProxiesConfig {
  trustProxy: boolean;
  trustedProxies: string[];
}

export interface SMTPConfigEncrypted {
  host: string;
  port: number;
  connectionType?: SMTPConnectionType; // 'plain' | 'starttls' | 'ssl'
  secure?: boolean; // Deprecated: stored only for backward compatibility
  username: string; // encrypted
  password: string; // encrypted
  mailto: string;
  senderName?: string; // Optional sender display name (defaults to "duplistatus")
  fromAddress?: string; // Optional from email address (defaults to username)
  requireAuth?: boolean; // Whether SMTP server requires authentication (defaults to true)
}
