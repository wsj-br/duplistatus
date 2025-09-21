// Migration utilities for converting old backup notification format to new format
import { BackupNotificationConfig } from './types';
import { convertLegacyToNew, getDefaultAllowedWeekDays } from './interval-utils';

// Legacy interface for old format
interface LegacyBackupNotificationConfig {
  notificationEvent: 'all' | 'warnings' | 'errors' | 'off';
  expectedInterval: number;
  overdueBackupCheckEnabled: boolean;
  intervalUnit: 'hour' | 'day';
}

/**
 * Check if a backup notification config is in the old format
 * @param config - backup notification config to check
 * @returns true if in old format, false if in new format
 */
export function isLegacyFormat(config: unknown): config is LegacyBackupNotificationConfig {
  return (
    typeof config === 'object' &&
    config !== null &&
    typeof (config as Record<string, unknown>).expectedInterval === 'number' &&
    typeof (config as Record<string, unknown>).intervalUnit === 'string' &&
    ((config as Record<string, unknown>).intervalUnit === 'hour' || (config as Record<string, unknown>).intervalUnit === 'day') &&
    !(config as Record<string, unknown>).allowedWeekDays
  );
}

/**
 * Migrate a single backup notification config from old format to new format
 * @param legacyConfig - config in old format
 * @returns config in new format
 */
export function migrateBackupNotificationConfig(legacyConfig: LegacyBackupNotificationConfig): BackupNotificationConfig {
  return {
    notificationEvent: legacyConfig.notificationEvent,
    overdueBackupCheckEnabled: legacyConfig.overdueBackupCheckEnabled,
    expectedInterval: convertLegacyToNew(legacyConfig.expectedInterval, legacyConfig.intervalUnit),
    allowedWeekDays: getDefaultAllowedWeekDays() // Default to all days enabled
  };
}

/**
 * Migrate backup settings from old format to new format
 * @param backupSettings - backup settings object (may contain mixed old/new formats)
 * @returns migrated backup settings in new format
 */
export function migrateBackupSettings(backupSettings: Record<string, unknown>): Record<string, BackupNotificationConfig> {
  const migratedSettings: Record<string, BackupNotificationConfig> = {};
  
  for (const [key, config] of Object.entries(backupSettings)) {
    if (isLegacyFormat(config)) {
      // Migrate old format to new format
      migratedSettings[key] = migrateBackupNotificationConfig(config);
    } else {
      // Already in new format, but ensure allowedWeekDays is present
      migratedSettings[key] = {
        ...(config as BackupNotificationConfig),
        allowedWeekDays: (config as BackupNotificationConfig).allowedWeekDays || getDefaultAllowedWeekDays()
      };
    }
  }
  
  return migratedSettings;
}

/**
 * Ensure backup notification config is in new format
 * @param config - config to check and migrate if needed
 * @returns config in new format
 */
export function ensureNewFormat(config: unknown): BackupNotificationConfig {
  if (isLegacyFormat(config)) {
    return migrateBackupNotificationConfig(config);
  }
  
  // Ensure required fields are present
  const typedConfig = config as BackupNotificationConfig;
  return {
    notificationEvent: typedConfig.notificationEvent || 'warnings',
    overdueBackupCheckEnabled: typedConfig.overdueBackupCheckEnabled !== undefined ? typedConfig.overdueBackupCheckEnabled : true,
    expectedInterval: typedConfig.expectedInterval || '1D',
    allowedWeekDays: typedConfig.allowedWeekDays || getDefaultAllowedWeekDays()
  };
}
