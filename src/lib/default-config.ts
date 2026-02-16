import { NotificationTemplate, CronServiceConfig, CronInterval, BackupNotificationConfig, SupportedTemplateLanguage, StartOfWeek } from './types';
import { defaultNotificationTemplatesEn } from './default-notifications-en';
import { defaultNotificationTemplatesDe } from './default-notifications-de';
import { defaultNotificationTemplatesFr } from './default-notifications-fr';
import { defaultNotificationTemplatesEs } from './default-notifications-es';
import { defaultNotificationTemplatesPtBR } from './default-notifications-pt-BR';

// Type for notification templates (without language field)
type NotificationTemplatesData = {
  overdueBackup: NotificationTemplate;
  success: NotificationTemplate;
  warning: NotificationTemplate;
};

/**
 * Map of all default notification templates by language
 */
export const defaultNotificationTemplatesByLanguage: Record<
  SupportedTemplateLanguage,
  NotificationTemplatesData
> = {
  en: defaultNotificationTemplatesEn,
  de: defaultNotificationTemplatesDe,
  fr: defaultNotificationTemplatesFr,
  es: defaultNotificationTemplatesEs,
  'pt-BR': defaultNotificationTemplatesPtBR,
};

/**
 * Default notification templates (English) - for backward compatibility
 * @deprecated Use getDefaultNotificationTemplates(language) instead
 */
export const defaultNotificationTemplates = defaultNotificationTemplatesEn;

/**
 * Get default notification templates for a specific language
 * Falls back to English if the language is not supported
 */
export function getDefaultNotificationTemplates(
  language: SupportedTemplateLanguage = 'en'
): NotificationTemplatesData {
  return defaultNotificationTemplatesByLanguage[language] || defaultNotificationTemplatesByLanguage.en;
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
  return ['en', 'de', 'fr', 'es', 'pt-BR'].includes(language);
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
  emailEnabled: true, // Email enabled by default
  // Additional destinations are optional and undefined by default
  additionalNotificationEvent: undefined,
  additionalEmails: undefined,
  additionalNtfyTopic: undefined
};

// Default UI configuration
export const defaultUIConfig = {
  databaseCleanupPeriod: '2 years' as const,
  tablePageSize: 5 as const,
  chartTimeRange: 'All data' as const,
  autoRefreshInterval: 1 as const,
  dashboardCardsSortOrder: 'Server name (a-z)' as const,
  startOfWeek: 'locale' as const // Default to locale-based (en-US = Sunday, en-GB = Monday)
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