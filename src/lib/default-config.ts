import { NotificationTemplate, CronServiceConfig, CronInterval, BackupNotificationConfig, SupportedTemplateLanguage, StartOfWeek, FormatLocaleOverride, UploadLimitsConfig, CidrAllowlistConfig, TrustedProxiesConfig, DailySummaryTemplateSet, DAILY_SUMMARY_DISPATCH_TASK } from './types';
import { defaultNotificationTemplatesEn } from './default-notifications-en';
import { defaultNotificationTemplatesDe } from './default-notifications-de';
import { defaultNotificationTemplatesFr } from './default-notifications-fr';
import { defaultNotificationTemplatesEs } from './default-notifications-es';
import { defaultNotificationTemplatesPtBR } from './default-notifications-pt-BR';
import { defaultNotificationTemplatesHi } from './default-notifications-hi';
import { defaultNotificationTemplatesZhHans } from './default-notifications-zh-Hans';
import { SOURCE_LOCALE, parseLocaleTag } from './locales';
import { defaultDailySummaryConfig as defaultDailySummaryScheduleConfig } from './daily-summary-schedule';

type NotificationTemplatesData = {
  overdueBackup: NotificationTemplate;
  success: NotificationTemplate;
  warning: NotificationTemplate;
  dailySummary: DailySummaryTemplateSet;
};

export const defaultNotificationTemplatesByLanguage: Record<
  SupportedTemplateLanguage,
  NotificationTemplatesData
> = {
  [SOURCE_LOCALE]: defaultNotificationTemplatesEn,
  de: defaultNotificationTemplatesDe,
  fr: defaultNotificationTemplatesFr,
  es: defaultNotificationTemplatesEs,
  "pt-BR": defaultNotificationTemplatesPtBR,
  hi: defaultNotificationTemplatesHi,
  "zh-Hans": defaultNotificationTemplatesZhHans,
};

/**
 * Default notification templates (source locale) - for backward compatibility
 * @deprecated Use getDefaultNotificationTemplates(language) instead
 */
export const defaultNotificationTemplates = defaultNotificationTemplatesEn;

/**
 * Get default notification templates for a specific language.
 * Falls back to the source locale templates if the language is not supported.
 */
export function getDefaultNotificationTemplates(
  language: SupportedTemplateLanguage = SOURCE_LOCALE
): NotificationTemplatesData {
  return defaultNotificationTemplatesByLanguage[language] || defaultNotificationTemplatesByLanguage[SOURCE_LOCALE];
}

export function getDefaultDailySummaryTemplates(
  language: SupportedTemplateLanguage = SOURCE_LOCALE
): DailySummaryTemplateSet {
  return getDefaultNotificationTemplates(language).dailySummary;
}

/**
 * Get a specific default template by language and type
 */
export function getDefaultNotificationTemplate(
  language: SupportedTemplateLanguage,
  templateType: 'success' | 'warning' | 'overdueBackup'
): NotificationTemplate {
  const templates = getDefaultNotificationTemplates(language);
  return templates[templateType];
}

/**
 * Check if a language is supported for templates
 */
export function isValidTemplateLanguage(language: string): language is SupportedTemplateLanguage {
  return parseLocaleTag(language) !== null;
}

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
    },
    'duplicati-version-refresh': {
      cronExpression: '0 3 * * *', // Daily at 3 AM UTC
      enabled: true
    },
    [DAILY_SUMMARY_DISPATCH_TASK]: {
      cronExpression: '* * * * *',
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

export const defaultDailySummaryConfig = defaultDailySummaryScheduleConfig;

// Global overdue tolerance configuration
export const defaultOverdueTolerance = '2h' as const;

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
  emailEnabled: true, // Email enabled by default
  // Additional destinations are optional and undefined by default
  additionalNotificationEvent: undefined,
  additionalEmails: undefined,
  additionalNtfyTopic: undefined
};

// Default UI configuration
export const defaultUIConfig = {
  databaseCleanupPeriod: '1 year' as const,
  tablePageSize: 5 as const,
  chartTimeRange: '1 month' as const,
  chartStyle: 'smooth-line' as const,
  autoRefreshInterval: 1 as const,
  dashboardCardsSortOrder: 'Server name (a-z)' as const,
  startOfWeek: 'locale' as const, // Default to locale-based (en-US Sunday, en-GB Monday)
  formatLocale: 'locale-default' as FormatLocaleOverride,
  relativeTimeInUiLocale: false as const,
  showDashboardVersion: true as const,
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

export const defaultUploadLimits: UploadLimitsConfig = {
  enabled: true,
  maxBytes: 5 * 1024 * 1024,
  perMinute: 20,
  perHour: 200,
};

export const defaultTrustedProxies: TrustedProxiesConfig = {
  trustProxy: false,
  trustedProxies: [],
};

export const defaultAdminIpAllowlist: CidrAllowlistConfig = {
  enabled: false,
  cidrs: [],
};

export const defaultExternalApiIpAllowlist: CidrAllowlistConfig = {
  enabled: false,
  cidrs: [],
};

export const AUTH_FAILURE_PER_MINUTE = 5;
export const AUTH_FAILURE_PER_HOUR = 30;
export const READ_API_PER_MINUTE = 60;
export const READ_API_PER_HOUR = 600;


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