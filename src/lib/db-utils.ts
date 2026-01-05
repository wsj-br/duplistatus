import { db, dbOps, waitForDatabaseReady } from './db';
import { formatDurationFromSeconds } from "@/lib/db";
import type { BackupStatus, NotificationEvent, BackupKey, OverdueTolerance, BackupNotificationConfig, OverdueNotifications, ChartDataPoint, SMTPConfig, SMTPConfigEncrypted, NotificationTemplate, NtfyConfig, SMTPConnectionType } from "@/lib/types";
import { CronServiceConfig, CronInterval } from './types';
import { cronIntervalMap } from './cron-interval-map';
import type { NotificationFrequencyConfig } from "@/lib/types";
import { defaultCronConfig, defaultNotificationFrequencyConfig, defaultOverdueTolerance, defaultCronInterval, defaultNtfyConfig, defaultNotificationTemplates, generateDefaultNtfyTopic } from './default-config';
import { previousTemplatesMessages } from './previous-defaults';
import { formatTimeElapsed } from './utils';
import { migrateBackupSettings } from './migration-utils';
import { getDefaultAllowedWeekDays } from './interval-utils';
import { GetNextBackupRunDate } from './server_intervals';
import { defaultBackupNotificationConfig } from './default-config';
import { encryptData, decryptData } from './secrets';

// Request-level cache to avoid redundant function calls within a single request
// In production mode, this is a module-level variable that persists across requests,
// so we need to be careful to clear it properly
const requestCache = new Map<string, unknown>();

// Track the last cache clear time to help debug cache issues in production
let lastCacheClearTime: number = Date.now();
let cacheClearCount: number = 0;

// Helper function to log cache operations in production mode
// Removed logging for production builds
function logCacheOperation(operation: string, details?: string): void {
  // Logging disabled in production
}

// Helper function to get cached value or compute and cache it
function getCachedOrCompute<T>(key: string, computeFn: () => T, functionName?: string): T {
  if (requestCache.has(key)) {
    if (process.env.NODE_ENV === 'production') {
      logCacheOperation('CACHE_HIT', `key: ${key}`);
    }
    return requestCache.get(key) as T;
  }
  if (functionName) {
    //  console.log(functionName);
  }
  const result = computeFn();
  requestCache.set(key, result);
  if (process.env.NODE_ENV === 'production') {
    logCacheOperation('CACHE_SET', `key: ${key}, function: ${functionName || 'unknown'}`);
  }
  return result;
}

// Helper function to clear request cache (call at start of each request)
// In production mode, this is critical to ensure fresh data on each request
export function clearRequestCache(): void {
  const beforeSize = requestCache.size;
  const beforeKeys = Array.from(requestCache.keys());
  requestCache.clear();
  lastCacheClearTime = Date.now();
  cacheClearCount++;
  
  if (process.env.NODE_ENV === 'production') {
    logCacheOperation('CACHE_CLEAR', `cleared ${beforeSize} entries, keys: [${beforeKeys.join(', ')}], total clears: ${cacheClearCount}`);
  }
}

// Helper function to invalidate specific cache keys
// Use this when data changes that affects specific cached values
export function invalidateCacheKey(key: string): void {
  const hadKey = requestCache.has(key);
  requestCache.delete(key);
  if (process.env.NODE_ENV === 'production') {
    logCacheOperation('CACHE_INVALIDATE_KEY', `key: ${key}, existed: ${hadKey}`);
  }
}

// Helper function to invalidate all data-related cache keys
// Call this when servers or backups are modified to ensure fresh data on next request
export function invalidateDataCache(): void {
  const beforeSize = requestCache.size;
  const beforeKeys = Array.from(requestCache.keys());
  
  // Invalidate all cache keys that depend on server/backup data
  requestCache.delete('backupSettings');
  requestCache.delete('lastOverdueBackupCheckTime');
  requestCache.delete('overdueNotifications');
  
  const afterSize = requestCache.size;
  const afterKeys = Array.from(requestCache.keys());
  
  if (process.env.NODE_ENV === 'production') {
    logCacheOperation('CACHE_INVALIDATE_DATA', `before: ${beforeSize} entries [${beforeKeys.join(', ')}], after: ${afterSize} entries [${afterKeys.join(', ')}]`);
  }
  // Note: Configuration caches (ntfy_config, smtp_config, etc.) are not invalidated
  // as they don't depend on server/backup data
}

// Helper function to get cache statistics (for debugging)
export function getCacheStats(): { size: number; lastClearTime: number; keys: string[]; clearCount: number } {
  return {
    size: requestCache.size,
    lastClearTime: lastCacheClearTime,
    keys: Array.from(requestCache.keys()),
    clearCount: cacheClearCount
  };
}



// Helper function to check if a backup is overdue based on expected interval
export async function isBackupOverdueByInterval(serverId: string, backupName: string, lastBackupDate: string | null): Promise<boolean> {
  try {
    if (!lastBackupDate || lastBackupDate === 'N/A') return false;
    
    // Get backup settings to check if overdue backup check is enabled
    const backupSettings = await getConfigBackupSettings();
    if (!backupSettings || Object.keys(backupSettings).length === 0) return false;
    
    const backupKey = `${serverId}:${backupName}`;
    const settings = backupSettings[backupKey];
    
    // If no settings found or overdue backup check is disabled, return false
    if (!settings || !settings.overdueBackupCheckEnabled) return false;
    
    // The time field is already the next expected backup date (lastBackupDate + interval)
    // It was calculated and stored in getConfigBackupSettings()
    const expectedBackupDate = settings.time;
    
    if (!expectedBackupDate || expectedBackupDate === 'N/A') return false;
    
    // Add tolerance to the expected backup date for overdue check
    const toleranceMinutes = getConfigOverdueTolerance();
    const expectedTime = new Date(expectedBackupDate);
    
    if (toleranceMinutes > 0) {
      expectedTime.setMinutes(expectedTime.getMinutes() + toleranceMinutes);
    }
    
    // Check if current time is past the expected backup date (with tolerance)
    const currentTime = new Date();
    
    return currentTime > expectedTime;
  } catch (error) {
    console.error('Error checking if backup is overdue by interval:', error instanceof Error ? error.message : String(error));
    return false;
  }
}

// Helper function to get notification event for a backup
async function getNotificationEvent(serverId: string, backupName: string): Promise<NotificationEvent | undefined> {
  try {
    const backupSettings = await getConfigBackupSettings();
    if (!backupSettings || Object.keys(backupSettings).length === 0) return undefined;
    
    const backupKey = `${serverId}:${backupName}`;
    return backupSettings[backupKey]?.notificationEvent;
  } catch (error) {
    console.error('Error getting notification event:', error instanceof Error ? error.message : String(error));
    return undefined;
  }
}

// Helper function to get last notification sent timestamp for a backup
function getLastNotificationSent(serverId: string, backupName: string): string {
  try {
    const lastNotifications = getConfigOverdueNotifications();
    const backupKey = `${serverId}:${backupName}`;
    const notification = lastNotifications[backupKey];
    
    if (notification && notification.lastNotificationSent) {
      return notification.lastNotificationSent;
    }
    
    return 'N/A';
  } catch (error) {
    console.error('Error getting last notification sent:', error instanceof Error ? error.message : String(error));
    return 'N/A';
  }
}

// Helper function to get backup interval settings for expected backup calculations
async function getBackupIntervalSettings(serverId: string, backupName: string): Promise<{
  expectedInterval: string;
  allowedWeekDays: number[];
  scheduleTime: string;
  overdueTolerance?: OverdueTolerance;
} | undefined> {
  try {
    const backupSettings = await getConfigBackupSettings();
    if (!backupSettings || Object.keys(backupSettings).length === 0) return undefined;
    
    const backupKey = `${serverId}:${backupName}`;
    const settings = backupSettings[backupKey];
    
    if (!settings) return undefined;
    
    return {
      expectedInterval: settings.expectedInterval,
      allowedWeekDays: settings.allowedWeekDays || getDefaultAllowedWeekDays(),
      scheduleTime: settings.time
    };
  } catch (error) {
    console.error('Error getting backup interval settings:', error instanceof Error ? error.message : String(error));
    return undefined;
  }
}


export function getCronConfig(): CronServiceConfig {
  try {

    const configJson = getConfiguration('cron_service');
    if (configJson && configJson.trim() !== '') {
      try {
        const config = JSON.parse(configJson);
        return {
          ...defaultCronConfig,
          ...config,
          tasks: {
            ...defaultCronConfig.tasks,
            ...config.tasks
          }
        };
      } catch (parseError) {
        console.error('Failed to parse cron service config:', parseError);
        return defaultCronConfig;
      }
    }
  } catch (error) {
    console.error('Failed to load cron service configuration:', error instanceof Error ? error.message : String(error));
  }
  return defaultCronConfig;
}

export function setCronConfig(config: CronServiceConfig): void {
  try {
    setConfiguration('cron_service', JSON.stringify(config));
  } catch (error) {
    console.error('Failed to save cron service configuration:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}

export function getCurrentCronInterval(): CronInterval {
  const config = getCronConfig();
  const task = config.tasks['overdue-backup-check'];
  
  // Find matching interval
  const entry = Object.entries(cronIntervalMap).find(([, value]) => 
    value.expression === task.cronExpression && value.enabled === task.enabled
  );
  
  return entry ? entry[0] as CronInterval : defaultCronInterval; // Default to default if no match
}

export function setCronInterval(interval: CronInterval) {
  try {
    const config = getCronConfig();
    const intervalConfig = cronIntervalMap[interval];
    
    if (!intervalConfig) {
      throw new Error(`Invalid interval: ${interval}`);
    }
    
    const updatedConfig = {
      ...config,
      tasks: {
        ...config.tasks,
        'overdue-backup-check': {
          cronExpression: intervalConfig.expression,
          enabled: intervalConfig.enabled
        }
      }
    };
    
    setCronConfig(updatedConfig);
  } catch (error) {
    console.error('Failed to set cron interval:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}

// Helper function to get the last overdue backup check time from database
export function getLastOverdueBackupCheckTime(): string {
  return getCachedOrCompute('lastOverdueBackupCheckTime', () => {
    try {
      const lastOverdueCheck = getConfiguration('last_overdue_check');
      return lastOverdueCheck || 'N/A';
    } catch (error) {
      console.error('Error getting last overdue backup check time:', error instanceof Error ? error.message : String(error));
      return 'N/A';
    }
  }, 'getLastOverdueBackupCheckTime');
}

/**
 * Checks the CRON_PORT environment variable and updates the cron configuration in the database if needed.
 * 
 * Logic:
 * 1. If CRON_PORT is defined, use that value
 * 2. If CRON_PORT is not defined, use PORT + 1
 * 3. If PORT is not defined, fallback to 9667
 */
export function checkAndUpdateCronPort(): void {
  try {
    // Calculate the expected port based on environment variables
    const expectedPort = (() => {
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
    })();

    // Get current configuration from database
    const currentConfig = getCronConfig();
    
    // Check if the port needs to be updated
    if (currentConfig.port !== expectedPort) {
      
      // Update the configuration with the new port
      const updatedConfig = {
        ...currentConfig,
        port: expectedPort
      };
      
      // Save the updated configuration to the database
      setCronConfig(updatedConfig);
    }
  } catch (error) {
    console.error('[CronPortChecker] Failed to check and update cron port configuration:', error instanceof Error ? error.message : String(error));
    // Don't throw the error to avoid crashing the application startup
  }
}

// Ensure this runs in Node.js runtime, not Edge Runtime
export const runtime = 'nodejs';

// Define the database backup record type
interface BackupRecord {
  id: string;
  server_id: string;
  backup_name: string;
  date: string;
  status: BackupStatus;
  warnings: number;
  errors: number;
  messages_actual_length: number;
  examined_files: number;
  size: number;
  uploaded_size: number;
  duration_seconds: number;
  known_file_size: number;
  backup_list_count: number;
  messages_array: string | null;
  warnings_array: string | null;
  errors_array: string | null;
  available_backups: string | null;
}

// Helper function to ensure database operations are only performed on the server
export function withDb<T>(operation: () => T): T {
  if (typeof window !== 'undefined') {
    throw new Error('Database operations can only be performed on the server side');
  }
  
  try {
    return operation();
  } catch (error) {
    console.error('Database operation failed:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}

// Helper function to safely execute database operations with better error handling
function safeDbOperation<T>(operation: () => T, operationName: string, fallback?: T): T {
  try {
    if (!db) {
      throw new Error('Database not initialized');
    }
    
    const result = operation();
    return result;
  } catch (error) {
    console.error(`Database operation '${operationName}' failed:`, error instanceof Error ? error.message : String(error));
    if (fallback !== undefined) {
      console.warn(`Using fallback value for '${operationName}'`);
      return fallback;
    }
    throw error;
  }
}

// Configuration data functions (moved from config-data.ts)
export function getConfiguration(key: string): string | null {
  return withDb(() => {
    try {
      const row = db.prepare('SELECT value FROM configurations WHERE key = ?').get(key) as { value: string } | undefined;
      return row ? row.value : null;
    } catch (error) {
      console.error(`Failed to get configuration for key '${key}':`, error instanceof Error ? error.message : String(error));
      return null;
    }
  });
}

export function setConfiguration(key: string, value: string): void {
  withDb(() => {
    try {
      db.prepare('INSERT OR REPLACE INTO configurations (key, value) VALUES (?, ?)').run(key, value);
      // Clear request cache after updating configuration to ensure fresh data is returned
      clearRequestCache();
    } catch (error) {
      console.error(`Failed to set configuration for key '${key}':`, error instanceof Error ? error.message : String(error));
      throw error;
    }
  });
}

interface ServerRow {
  id: string;
  name: string;
  server_url: string;
  alias: string;
  note: string;
}

export function getAllServerAddresses() {
  return withDb(() => {
    const servers = safeDbOperation(() => dbOps.getAllServers.all(), 'getAllServers', []) as Array<ServerRow & { has_password: number }>;
    return servers.map(server => ({
      id: server.id,
      name: server.name,
      server_url: server.server_url || '',
      alias: server.alias || '',
      note: server.note || '',
      hasPassword: Boolean(server.has_password)
    }));
  });
}

export function getAllServers() {
  return withDb(() => {
    const servers = safeDbOperation(() => dbOps.getAllServers.all(), 'getAllServers', []) as ServerRow[];
    return servers.map(server => {
      const backups = safeDbOperation(() => dbOps.getServerBackups.all(server.id), 'getServerBackups', []) as BackupRecord[];
      
      const formattedBackups = backups.map(backup => ({
        id: String(backup.id),
        server_id: String(backup.server_id),
        name: String(backup.backup_name),
        date: backup.date,
        status: backup.status,
        warnings: Number(backup.warnings) || 0,
        errors: Number(backup.errors) || 0,
        messages: Number(backup.messages_actual_length) || 0,
        fileCount: Number(backup.examined_files) || 0,
        fileSize: Number(backup.size) || 0,
        uploadedSize: Number(backup.uploaded_size) || 0,
        duration: formatDurationFromSeconds(Number(backup.duration_seconds) || 0),
        duration_seconds: Number(backup.duration_seconds) || 0,
        durationInMinutes: Math.floor((Number(backup.duration_seconds) || 0) / 60),
        knownFileSize: Number(backup.known_file_size) || 0,
        backup_list_count: backup.backup_list_count,
        messages_array: backup.messages_array,
        warnings_array: backup.warnings_array,
        errors_array: backup.errors_array,
        available_backups: backup.available_backups ? JSON.parse(backup.available_backups) : []
      }));

      const chartData = formattedBackups.map(backup => {
        const backupDate = new Date(backup.date);
        return {
          date: backupDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }),
          isoDate: backup.date,
          uploadedSize: backup.uploadedSize,
          duration: backup.durationInMinutes,
          fileCount: backup.fileCount,
          fileSize: backup.fileSize,
          storageSize: backup.knownFileSize,
          backupVersions: backup.backup_list_count || 0
        };
      }).sort((a, b) => new Date(a.isoDate).getTime() - new Date(b.isoDate).getTime());

      return {
        id: server.id,
        name: server.name,
        alias: server.alias || '',
        note: server.note || '',
        backups: formattedBackups,
        chartData
      };
    });
  });
}

interface OverallSummaryRow {
  total_servers: number;
  total_backups_runs: number;
  total_backups: number;
  total_uploaded_size: number;
  total_storage_used: number;
  total_backuped_size: number;
}

// Helper function to count overdue backups from configuration
async function countOverdueBackups(): Promise<number> {
  try {
    // Get backup settings to check which backups have overdue check enabled
    const backupSettings = await getConfigBackupSettings();
    if (!backupSettings || Object.keys(backupSettings).length === 0) {
      return 0;
    }
    
    // Get all latest backups once before the loop
    const allLatestBackups = getAllLatestBackups();
    
    // Create a Map for quick lookup of latest backups by server_id:backup_name
    const latestBackupMap = new Map<string, { date: string; server_name: string; backup_name?: string }>();
    for (const backup of allLatestBackups) {
      const key = `${backup.server_id}:${backup.backup_name}`;
      latestBackupMap.set(key, {
        date: backup.date,
        server_name: backup.server_name,
        backup_name: backup.backup_name
      });
    }
    
    const currentTime = new Date();
    let overdueCount = 0;
    
    // Iterate through backup settings keys (server_id:backup_name)
    const backupKeys = Object.keys(backupSettings);
    
    for (const backupKey of backupKeys) {
      // Get the backup configuration
      const backupConfig = backupSettings[backupKey];
      
      if (!backupConfig || !backupConfig.overdueBackupCheckEnabled) {
        continue;
      }
      
      // Get the latest backup from the Map
      const latestBackup = latestBackupMap.get(backupKey);
      
      if (!latestBackup) {
        continue;
      }
      
      // Get interval configuration
      const expectedInterval = backupConfig.expectedInterval;
      
      // Calculate expected backup date (without tolerance)
      const expectedBackupDate = GetNextBackupRunDate(latestBackup.date, backupConfig.time, expectedInterval, backupConfig.allowedWeekDays || getDefaultAllowedWeekDays());
      
      if (expectedBackupDate === 'N/A') continue;
      
      // Add tolerance to the expected backup date for overdue check
      const toleranceMinutes = getConfigOverdueTolerance();
      const expectedBackupTime = new Date(expectedBackupDate);
      
      if (toleranceMinutes > 0) {
        expectedBackupTime.setMinutes(expectedBackupTime.getMinutes() + toleranceMinutes);
      }
      
      // Check if backup is overdue (current time is past expected date with tolerance)
      if (!isNaN(expectedBackupTime.getTime()) && currentTime > expectedBackupTime) {
        overdueCount++;
      }
    }
    
    return overdueCount;
  } catch (error) {
    console.error('Error counting overdue backups:', error instanceof Error ? error.message : String(error));
    return 0;
  }
}

// Optimized version that calculates all totals from serversSummary data (no database query needed)
export async function getOverallSummaryFromServers(serversSummary: Awaited<ReturnType<typeof getServersSummary>>) {
  try {
    // Calculate all totals from serversSummary data
    let totalServers = 0;
    let totalBackupsRuns = 0;
    let totalBackups = 0;
    let totalUploadedSize = 0;
    let totalStorageUsed = 0;
    let totalBackupSize = 0;
    let overdueBackupsCount = 0;

    try {
      const totals = serversSummary.reduce((acc, server) => {
        acc.totalServers++;
        acc.totalBackupsRuns += server.totalBackupCount;
        acc.totalUploadedSize += server.totalUploadedSize;
        acc.totalStorageUsed += server.totalStorageSize;
        acc.totalBackupSize += server.totalFileSize;
        acc.totalBackups += server.backupInfo.length;
        
        // Count overdue backups
        acc.overdueBackupsCount += server.backupInfo.filter(backup => backup.isBackupOverdue).length;
        
        return acc;
      }, {
        totalServers: 0,
        totalBackupsRuns: 0,
        totalUploadedSize: 0,
        totalStorageUsed: 0,
        totalBackupSize: 0,
        totalBackups: 0,
        overdueBackupsCount: 0
      });

      totalServers = totals.totalServers;
      totalBackupsRuns = totals.totalBackupsRuns;
      totalUploadedSize = totals.totalUploadedSize;
      totalStorageUsed = totals.totalStorageUsed;
      totalBackupSize = totals.totalBackupSize;
      totalBackups = totals.totalBackups;
      overdueBackupsCount = totals.overdueBackupsCount;
    } catch (calculationError) {
      console.error('[getOverallSummaryFromServers] Error calculating totals:', calculationError instanceof Error ? calculationError.message : String(calculationError));
      // Continue with zeros
    }

    return {
      totalServers,
      totalBackupsRuns,
      totalBackups,
      totalUploadedSize,
      totalStorageUsed,
      totalBackupSize,
      overdueBackupsCount
    };
  } catch (error) {
    console.error('[getOverallSummaryFromServers] Error:', error instanceof Error ? error.message : String(error));
    // Return a fallback instead of throwing
    return {
      totalServers: 0,
      totalBackupsRuns: 0,
      totalBackups: 0,
      totalUploadedSize: 0,
      totalStorageUsed: 0,
      totalBackupSize: 0,
      overdueBackupsCount: 0
    };
  }
}

// Original function kept for backward compatibility
export async function getOverallSummary() {
  try {
    const result = await withDb(async () => {
      const summary = safeDbOperation(() => dbOps.getOverallSummary.get(), 'getOverallSummary') as OverallSummaryRow | undefined;
      
      if (!summary) {
        return {
          totalServers: 0,
          totalBackupsRuns: 0,
          totalBackups: 0,
          totalUploadedSize: 0,
          totalStorageUsed: 0,
          totalBackupSize: 0,
          overdueBackupsCount: 0
        };
      }

      let overdueCount = 0;
      try {
        overdueCount = await countOverdueBackups();
      } catch (overdueError) {
        console.error('[getOverallSummary] Error counting overdue backups:', overdueError instanceof Error ? overdueError.message : String(overdueError));
        // Continue with overdueCount = 0
      }

      return {
        totalServers: summary.total_servers,
        totalBackupsRuns: summary.total_backups_runs,
        totalBackups: summary.total_backups,
        totalUploadedSize: summary.total_uploaded_size,
        totalStorageUsed: summary.total_storage_used,
        totalBackupSize: summary.total_backuped_size,
        overdueBackupsCount: overdueCount
      };
    });
    
    return result;
  } catch (error) {
    console.error('[getOverallSummary] Error:', error instanceof Error ? error.message : String(error));
    // Return a fallback instead of throwing
    return {
      totalServers: 0,
      totalBackupsRuns: 0,
      totalBackups: 0,
      totalUploadedSize: 0,
      totalStorageUsed: 0,
      totalBackupSize: 0,
      overdueBackupsCount: 0
    };
  }
}

export function getServerInfoById(serverId: string) {
  return withDb(() => {
    try {
      const server = safeDbOperation(() => dbOps.getServerById.get(serverId), 'getServerById') as { id: string; name: string; server_url: string; alias: string; note: string; has_password: number } | undefined;
      if (!server) return null;

      return {
        ...server,
        hasPassword: Boolean(server.has_password)
      };
    } catch (error) {
      console.error(`Failed to get server by ID ${serverId}:`, error instanceof Error ? error.message : String(error));
      return null;
    }
  });
}


export function getServerById(serverId: string) {
  return withDb(() => {
    try {
      const server = safeDbOperation(() => dbOps.getServerById.get(serverId), 'getServerById') as { id: string; name: string; server_url: string; alias: string; note: string; has_password: number } | undefined;
      if (!server) return null;

      const backups = safeDbOperation(() => dbOps.getServerBackups.all(serverId), 'getServerBackups', []) as BackupRecord[];
      
      const formattedBackups = backups.map(backup => ({
        id: String(backup.id),
        server_id: String(backup.server_id),
        name: String(backup.backup_name),
        date: backup.date,
        status: backup.status,
        warnings: Number(backup.warnings) || 0,
        errors: Number(backup.errors) || 0,
        messages: Number(backup.messages_actual_length) || 0,
        fileCount: Number(backup.examined_files) || 0,
        fileSize: Number(backup.size) || 0,
        uploadedSize: Number(backup.uploaded_size) || 0,
        duration: formatDurationFromSeconds(Number(backup.duration_seconds) || 0),
        duration_seconds: Number(backup.duration_seconds) || 0,
        durationInMinutes: Math.floor((Number(backup.duration_seconds) || 0) / 60),
        knownFileSize: Number(backup.known_file_size) || 0,
        backup_list_count: backup.backup_list_count,
        messages_array: backup.messages_array,
        warnings_array: backup.warnings_array,
        errors_array: backup.errors_array,
        available_backups: backup.available_backups ? JSON.parse(backup.available_backups) : []
      }));

      const chartData = formattedBackups.map(backup => {
        const backupDate = new Date(backup.date);
        return {
          date: backupDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }),
          isoDate: backup.date,
          uploadedSize: backup.uploadedSize,
          duration: backup.durationInMinutes,
          fileCount: backup.fileCount,
          fileSize: backup.fileSize,
          storageSize: backup.knownFileSize,
          backupVersions: backup.backup_list_count || 0
        };
      }).sort((a, b) => new Date(a.isoDate).getTime() - new Date(b.isoDate).getTime());

      return {
        id: server.id,
        name: server.name,
        alias: server.alias || '',
        note: server.note || '',
        server_url: server.server_url || '',
        hasPassword: Boolean(server.has_password),
        backups: formattedBackups,
        chartData
      };
    } catch (error) {
      console.error(`Failed to get server by ID ${serverId}:`, error instanceof Error ? error.message : String(error));
      return null;
    }
  });
}

export async function getAggregatedChartData() {
  // Wait for database initialization before accessing operations
  await waitForDatabaseReady();
  
  try {
    return withDb(() => {
      const result = safeDbOperation(() => dbOps.getAggregatedChartData.all(), 'getAggregatedChartData', []) as {
        date: string;
        isoDate: string;
        uploadedSize: number;
        duration: number;
        fileCount: number;
        fileSize: number;
        storageSize: number;
        backupVersions: number;
      }[];
      
      // Ensure we always return an array, even if empty
      return result || [];
    });
  } catch (error) {
    console.error('[getAggregatedChartData] Error:', error instanceof Error ? error.message : String(error));
    // Return empty array as fallback
    return [];
  }
}

export function getAllServersChartData() {
  try {
    return withDb(() => {
      const result = safeDbOperation(() => dbOps.getAllServersChartData.all(), 'getAllServersChartData', []) as {
        date: string;
        isoDate: string;
        serverId: string;
        uploadedSize: number;
        duration: number;
        fileCount: number;
        fileSize: number;
        storageSize: number;
        backupVersions: number;
      }[];
      
      // Ensure we always return an array, even if empty
      return result || [];
    });
  } catch (error) {
    console.error('[getAllServersChartData] Error:', error instanceof Error ? error.message : String(error));
    // Return empty array as fallback
    return [];
  }
}

// New function to get aggregated chart data with time range filtering
export function getAggregatedChartDataWithTimeRange(startDate: Date, endDate: Date) {
  try {
    return withDb(() => {
      const result = safeDbOperation(() => dbOps.getAggregatedChartDataWithTimeRange.all({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      }), 'getAggregatedChartDataWithTimeRange', []) as ChartDataPoint[];
      
      return result || [];
    });
  } catch (error) {
    console.error('[getAggregatedChartDataWithTimeRange] Error:', error instanceof Error ? error.message : String(error));
    return [];
  }
}

// New function to get server chart data (no date filtering)
export function getServerChartData(serverId: string) {
  try {
    return withDb(() => {
      const result = safeDbOperation(() => dbOps.getServerChartData.all(serverId), 'getServerChartData', []) as ChartDataPoint[];
      
      return result || [];
    });
  } catch (error) {
    console.error('[getServerChartData] Error:', error instanceof Error ? error.message : String(error));
    return [];
  }
}

// New function to get server chart data with time range filtering
export function getServerChartDataWithTimeRange(serverId: string, startDate: Date, endDate: Date) {
  try {
    return withDb(() => {
      const result = safeDbOperation(() => dbOps.getServerChartDataWithTimeRange.all({
        serverId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      }), 'getServerChartDataWithTimeRange', []) as ChartDataPoint[];
      
      return result || [];
    });
  } catch (error) {
    console.error('[getServerChartDataWithTimeRange] Error:', error instanceof Error ? error.message : String(error));
    return [];
  }
}

// New function to get server/backup chart data (no date filtering)
export function getServerBackupChartData(serverId: string, backupName: string) {
  try {
    return withDb(() => {
      const result = safeDbOperation(() => dbOps.getServerBackupChartData.all({
        serverId,
        backupName
      }), 'getServerBackupChartData', []) as ChartDataPoint[];
      
      return result || [];
    });
  } catch (error) {
    console.error('[getServerBackupChartData] Error:', error instanceof Error ? error.message : String(error));
    return [];
  }
}

// New function to get server/backup chart data with time range filtering
export function getServerBackupChartDataWithTimeRange(serverId: string, backupName: string, startDate: Date, endDate: Date) {
  try {
    return withDb(() => {
      const result = safeDbOperation(() => dbOps.getServerBackupChartDataWithTimeRange.all({
        serverId,
        backupName,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      }), 'getServerBackupChartDataWithTimeRange', []) as ChartDataPoint[];
      
      return result || [];
    });
  } catch (error) {
    console.error('[getServerBackupChartDataWithTimeRange] Error:', error instanceof Error ? error.message : String(error));
    return [];
  }
}

// New function to get server summary for the new dashboard
export async function getServersSummary() {
  // Wait for database initialization before accessing operations
  await waitForDatabaseReady();
  
  try {
    return await withDb(async () => {
      const rows = safeDbOperation(() => dbOps.getServersSummary.all(), 'getServersSummary', []) as Array<{
        server_id: string;
        server_name: string;
        server_url: string;
        alias: string;
        note: string;
        has_password: number;
        backup_name: string;
        last_backup_date: string | null;
        last_backup_id: string | null;
        last_backup_status: BackupStatus | null;
        last_backup_duration: number | null;
        backup_count: number;
        file_count: number;
        file_size: number;
        storage_size: number;
        backup_versions: number;
        available_backups: string | null;
        uploaded_size: number;
        warnings: number;
        errors: number;
        status_history: string | null;
      }>;
      
      // Group by server to create the structure needed for server cards/table
      const serverMap = new Map<string, {
        id: string;
        name: string;
        server_url: string;
        alias: string;
        note: string;
        hasPassword: boolean;
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
          availableBackups: string[];
          warnings: number;
          errors: number;
          isBackupOverdue: boolean;
          notificationEvent?: NotificationEvent;
          expectedBackupDate: string;
          expectedBackupElapsed: string;
          lastNotificationSent: string;
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
      }>();
      
      
      rows.forEach(row => {
        const serverId = row.server_id;
        
        if (!serverMap.has(serverId)) {
          // Initialize server data
          serverMap.set(serverId, {
            id: serverId,
            name: row.server_name,
            server_url: row.server_url,
            alias: row.alias || '',
            note: row.note || '',
            hasPassword: Boolean(row.has_password),
            backupInfo: [],
            totalBackupCount: 0,
            totalStorageSize: 0,
            totalFileCount: 0,
            totalFileSize: 0,
            totalUploadedSize: 0,
            lastBackupDate: 'N/A',
            lastBackupStatus:  'N/A',
            lastBackupDuration: 'N/A',
            lastBackupListCount: 0,
            lastBackupName: 'N/A',
            lastBackupId: 'N/A',
            lastOverdueCheck: getLastOverdueBackupCheckTime(),
            haveOverdueBackups: false,
            backupNames: [],
          });
        }
        
        const server = serverMap.get(serverId)!;
        
        // Skip rows with empty backup_name (servers without backups)
        // These will still be included in the serverMap but without backup info
        if (!row.backup_name || row.backup_name.trim() === '') {
          return; // Skip this row but keep the server in the map
        }
        
        // Parse status history for status bars
        const statusHistory: BackupStatus[] = [];
        if (row.status_history) {
          const statuses = row.status_history.split(',');
          statuses.forEach(status => {
            if (status && status !== 'null') {
              // Validate status
              const validStatuses: BackupStatus[] = ['Success', 'Unknown', 'Warning', 'Error', 'Fatal'];
              if (validStatuses.includes(status as BackupStatus)) {
                statusHistory.push(status as BackupStatus);
              } else {
                statusHistory.push('Unknown');
              }
            }
          });
        }
        
        // Add backup job data
        const backupInfo = {
          name: row.backup_name,
          lastBackupDate: row.last_backup_date || 'N/A',
          lastBackupId: row.last_backup_id || 'N/A',
          lastBackupStatus: (row.last_backup_status || 'N/A') as BackupStatus | 'N/A',
          lastBackupDuration: row.last_backup_duration ? formatDurationFromSeconds(row.last_backup_duration) : 'N/A',
          lastBackupListCount: row.backup_versions || null,
          backupCount: row.backup_count || 0,
          statusHistory,
          fileCount: row.file_count || 0,
          fileSize: row.file_size || 0,
          storageSize: row.storage_size || 0,
          uploadedSize: row.uploaded_size || 0,
          warnings: row.warnings || 0,
          errors: row.errors || 0,
          availableBackups: row.available_backups ? JSON.parse(row.available_backups) : [],
          // Initialize backup status fields
          isBackupOverdue: false,
          notificationEvent: undefined,
          expectedBackupDate: 'N/A',
          expectedBackupElapsed: 'N/A',
          lastNotificationSent: 'N/A'
        };
        
        server.backupInfo.push(backupInfo);

        // add the backup name to the backup names array
        server.backupNames.push(row.backup_name);
        
        // Update server totals
        server.totalBackupCount += row.backup_count || 0;
        server.totalStorageSize += row.storage_size || 0;
        server.totalFileCount += row.file_count || 0;
        server.totalFileSize += row.file_size || 0;
        server.totalUploadedSize += row.uploaded_size || 0;
        
        // Update latest backup info (use the most recent backup across all jobs)
        if (row.last_backup_date && (server.lastBackupDate === 'N/A' || new Date(row.last_backup_date) > new Date(server.lastBackupDate))) {
          server.lastBackupDate = row.last_backup_date;
          server.lastBackupStatus = row.last_backup_status || 'N/A';
          server.lastBackupDuration = row.last_backup_duration ? formatDurationFromSeconds(row.last_backup_duration) : 'N/A';
          server.lastBackupListCount = row.backup_versions || null;
          server.lastBackupId = row.last_backup_id || 'N/A';
        }
        
      });
      
      
      // Process each server to add overdue status and other derived data per backup job
      const result = await Promise.all(Array.from(serverMap.values()).map(async (server) => {
        // Process each backup job to add overdue status and other derived data
        server.backupInfo = await Promise.all(server.backupInfo.map(async (thisBackupInfo) => {
          let isOverdue = false;
          let expectedBackupDate = 'N/A';
          let expectedBackupElapsed = 'N/A';
          
          if (thisBackupInfo.lastBackupDate !== 'N/A') {
            isOverdue = await isBackupOverdueByInterval(server.id, thisBackupInfo.name, thisBackupInfo.lastBackupDate);

            // Check if the server has overdue backups
            if (isOverdue) {
              server.haveOverdueBackups = true;
            }

            // Get expected backup date (pure expected date without tolerance)
            const backupSettings = await getBackupIntervalSettings(server.id, thisBackupInfo.name);
            if (backupSettings) {
              expectedBackupDate = GetNextBackupRunDate(
                thisBackupInfo.lastBackupDate,
                backupSettings.scheduleTime,
                backupSettings.expectedInterval,
                backupSettings.allowedWeekDays
              );
              expectedBackupElapsed = formatTimeElapsed(expectedBackupDate);
            }
          }
          
          // Get notification event for this backup job
          const notificationEvent = await getNotificationEvent(server.id, thisBackupInfo.name);
          
          // Get last notification sent (if any)
          const lastNotificationSent = getLastNotificationSent(server.id, thisBackupInfo.name);
          
          return {
            ...thisBackupInfo,
            isBackupOverdue: isOverdue,
            notificationEvent,
            expectedBackupDate,
            expectedBackupElapsed,
            lastNotificationSent
          };
        }));
        
        // Remove duplicate available backups
        server.backupNames = [...new Set(server.backupNames)];
        
        return server;
      }));
      
           
      return result;
    });
  } catch (error) {
    // Error logging handled by error handler
    return [];
  }
}

// Helper function to get server URL by server ID
export function getServerUrlById(serverId: string): string {
  try {
    const server = withDb(() => {
      return safeDbOperation(() => dbOps.getServerById.get(serverId), 'getServerById') as { id: string; name: string; server_url: string; alias: string; note: string } | undefined;
    });
    return server?.server_url || '';
  } catch (error) {
    console.warn('Failed to get server URL:', error);
    return '';
  }
}

export function updateServer(serverId: string, updates: { server_url?: string; alias?: string; note?: string }): { success: boolean; error?: string } {
  try {
    return withDb(() => {
      // Get the current server to verify it exists
      const existingServer = safeDbOperation(() => dbOps.getServerById.get(serverId), 'getServerById') as { id: string; name: string; server_url: string; alias: string; note: string; server_password?: string } | undefined;
      
      if (!existingServer) {
        return { success: false, error: 'Server not found' };
      }

      // Validate URL format if provided
      if (updates.server_url && updates.server_url.trim() !== '') {
        try {
          const url = new URL(updates.server_url);
          if (!['http:', 'https:'].includes(url.protocol)) {
            return { success: false, error: 'URL must use HTTP or HTTPS protocol' };
          }
        } catch {
          return { success: false, error: 'Invalid URL format' };
        }
      }

      // Update server with new values using a direct UPDATE to preserve password
      const updateQuery = db.prepare(`
        UPDATE servers 
        SET server_url = ?, alias = ?, note = ? 
        WHERE id = ?
      `);
      
      const result = safeDbOperation(() => updateQuery.run(
        updates.server_url !== undefined ? updates.server_url : existingServer.server_url,
        updates.alias !== undefined ? updates.alias : existingServer.alias,
        updates.note !== undefined ? updates.note : existingServer.note,
        serverId
      ), 'updateServerDetails');

      if (result.changes === 0) {
        return { success: false, error: 'No changes were made' };
      }

      return { success: true };
    });
  } catch (error) {
    console.error('Failed to update server:', error instanceof Error ? error.message : String(error));
    return { success: false, error: 'Database error occurred' };
  }
}

// Wrapper functions for database operations (keeping for backward compatibility)
export const dbUtils = {
  getServerById: (serverId: string) => getServerById(serverId),
  getServerByName: (name: string) => withDb(() => safeDbOperation(() => dbOps.getServerByName.get(name), 'getServerByName')),
  getLatestBackup: (serverId: string) => withDb(() => safeDbOperation(() => dbOps.getLatestBackup.get(serverId), 'getLatestBackup')),
  getLatestBackupByName: (serverId: string, backupName: string) => withDb(() => safeDbOperation(() => dbOps.getLatestBackupByName.get(serverId, backupName), 'getLatestBackupByName')),
  getServerBackups: (serverId: string) => withDb(() => safeDbOperation(() => dbOps.getServerBackups.all(serverId), 'getServerBackups', [])),
  getAllServers: () => getAllServers(),
  getOverallSummary: () => getOverallSummary(),
  getLatestBackupDate: () => withDb(() => safeDbOperation(() => dbOps.getLatestBackupDate.get(), 'getLatestBackupDate')),
  getAggregatedChartData: () => getAggregatedChartData(),
  getAggregatedChartDataWithTimeRange: (startDate: Date, endDate: Date) => getAggregatedChartDataWithTimeRange(startDate, endDate),
  getAllServersChartData: () => getAllServersChartData(),
  getServerChartData: (serverId: string) => getServerChartData(serverId),
  getServerChartDataWithTimeRange: (serverId: string, startDate: Date, endDate: Date) => 
    getServerChartDataWithTimeRange(serverId, startDate, endDate),
  getServerBackupChartData: (serverId: string, backupName: string) => 
    getServerBackupChartData(serverId, backupName),
  getServerBackupChartDataWithTimeRange: (serverId: string, backupName: string, startDate: Date, endDate: Date) => 
    getServerBackupChartDataWithTimeRange(serverId, backupName, startDate, endDate),
  getServersSummary: () => getServersSummary(),
  getServersBackupNames: () => getServersBackupNames(),
  getAllLatestBackups: () => getAllLatestBackups(),
  
  insertBackup: (data: Parameters<typeof dbOps.insertBackup.run>[0]) => {
    const result = withDb(() => safeDbOperation(() => dbOps.insertBackup.run(data), 'insertBackup'));
    // Invalidate data cache after backup insertion to ensure fresh data on next request
    invalidateDataCache();
    clearRequestCache();
    return result;
  },
  
  upsertServer: (data: Parameters<typeof dbOps.upsertServer.run>[0]) => 
    withDb(() => safeDbOperation(() => dbOps.upsertServer.run(data), 'upsertServer')),
  
  checkDuplicateBackup: (data: { server_id: string; backup_name: string; date: string }) =>
    withDb(() => {
      try {
        const result = safeDbOperation(() => dbOps.checkDuplicateBackup.get(data), 'checkDuplicateBackup') as { count: number } | undefined;
        return (result?.count || 0) > 0;
      } catch (error) {
        console.error('Failed to check duplicate backup:', error instanceof Error ? error.message : String(error));
        return false;
      }
    }),
  
  deleteServer: (serverId: string) => {
    return withDb(() => {
      try {
        const transaction = db.transaction(() => {
          // First get the server name before deleting
          const server = safeDbOperation(() => dbOps.getServerById.get(serverId), 'getServerById') as { id: string; name: string } | undefined;
          if (!server) {
            throw new Error(`Server with ID ${serverId} not found`);
          }
          
          // First delete all backups for the server
          const backupResult = safeDbOperation(() => dbOps.deleteServerBackups.run(serverId), 'deleteServerBackups');
          // Then delete the server itself
          const serverResult = safeDbOperation(() => dbOps.deleteServer.run(serverId), 'deleteServer');
          
          // Clean up configuration data for this server
          cleanupServerConfiguration(server.id);
          
          return {
            backupChanges: backupResult?.changes || 0,
            serverChanges: serverResult?.changes || 0
          };
        });
        const result = transaction();
        
        // Invalidate data cache after server deletion to ensure fresh data on next request
        invalidateDataCache();
        clearRequestCache();
        
        return result;
      } catch (error) {
        console.error(`Failed to delete server ${serverId}:`, error instanceof Error ? error.message : String(error));
        throw error;
      }
    });
  },

  updateServer: (serverId: string, updates: { server_url?: string; alias?: string; note?: string }) => 
    updateServer(serverId, updates)
};

// Interface for duplicate server information
export interface DuplicateServer {
  name: string;
  servers: Array<{
    id: string;
    created_at: string;
    alias: string;
    note: string;
    server_url: string;
  }>;
}

// Function to get duplicate servers (servers with same name but different IDs)
export function getDuplicateServers(): DuplicateServer[] {
  return withDb(() => {
    try {
      const results = safeDbOperation(() => dbOps.getDuplicateServers.all(), 'getDuplicateServers', []) as Array<{
        name: string;
        id: string;
        created_at: string;
        alias: string;
        note: string;
        server_url: string;
        server_password: string;
      }>;
      
      // Group results by server name
      const duplicatesMap = new Map<string, DuplicateServer>();
      
      for (const row of results) {
        if (!duplicatesMap.has(row.name)) {
          duplicatesMap.set(row.name, {
            name: row.name,
            servers: []
          });
        }
        
        const duplicate = duplicatesMap.get(row.name)!;
        duplicate.servers.push({
          id: row.id,
          created_at: row.created_at || '',
          alias: row.alias || '',
          note: row.note || '',
          server_url: row.server_url || ''
        });
      }
      
      // Convert map to array
      return Array.from(duplicatesMap.values());
    } catch (error) {
      console.error('Error getting duplicate servers:', error instanceof Error ? error.message : String(error));
      return [];
    }
  });
}

// Helper function to update configuration keys with old server ID to new server ID
function updateConfigurationServerId(oldServerId: string, newServerId: string): void {
  try {
    // Update backup_settings
    const backupSettings = getConfigBackupSettings();
    if (Object.keys(backupSettings).length > 0) {
      const updatedBackupSettings: Record<BackupKey, BackupNotificationConfig> = {};
      
      for (const [backupKey, settings] of Object.entries(backupSettings)) {
        const [keyServerId, backupName] = backupKey.split(':');
        if (keyServerId === oldServerId) {
          // Update the key to use the new server ID
          const newBackupKey = `${newServerId}:${backupName}` as BackupKey;
          updatedBackupSettings[newBackupKey] = settings;
        } else {
          updatedBackupSettings[backupKey] = settings;
        }
      }
      
      setConfigBackupSettings(updatedBackupSettings);
    }
    
    // Update overdue_notifications
    const overdueNotifications = getConfigOverdueNotifications();
    if (Object.keys(overdueNotifications).length > 0) {
      const updatedOverdueNotifications: OverdueNotifications = {};
      
      for (const [backupKey, notification] of Object.entries(overdueNotifications)) {
        const [keyServerId, backupName] = backupKey.split(':');
        if (keyServerId === oldServerId) {
          // Update the key to use the new server ID
          const newBackupKey = `${newServerId}:${backupName}`;
          updatedOverdueNotifications[newBackupKey] = notification;
        } else {
          updatedOverdueNotifications[backupKey] = notification;
        }
      }
      
      setConfigOverdueNotifications(updatedOverdueNotifications);
    }
  } catch (error) {
    console.error(`Failed to update configuration for server merge ${oldServerId} -> ${newServerId}:`, error instanceof Error ? error.message : String(error));
  }
}

// Function to merge servers (move all data from old servers to target server)
export async function mergeServers(oldServerIds: string[], targetServerId: string): Promise<{ success: boolean; error?: string }> {
  try {
    return await withDb(async () => {
      // Get target server details first
      const targetServer = safeDbOperation(() => dbOps.getServerById.get(targetServerId), 'getServerById') as {
        id: string;
        name: string;
        server_url: string;
        alias: string;
        note: string;
        has_password: number;
      } | undefined;
      
      if (!targetServer) {
        throw new Error(`Target server ${targetServerId} not found`);
      }
      
      // Get target server password
      const targetServerPassword = safeDbOperation(() => dbOps.getServerPassword.get(targetServerId), 'getServerPassword') as {
        server_password: string;
      } | undefined;
      const targetHasPassword = targetServerPassword && targetServerPassword.server_password && targetServerPassword.server_password.trim() !== '';
      
      // Process each old server
      for (const oldServerId of oldServerIds) {
        if (oldServerId === targetServerId) {
          continue; // Skip if it's the target server itself
        }
        
        // Get old server details
        const oldServer = safeDbOperation(() => dbOps.getServerById.get(oldServerId), 'getServerById') as {
          id: string;
          name: string;
          server_url: string;
          alias: string;
          note: string;
          has_password: number;
        } | undefined;
        
        if (!oldServer) {
          console.warn(`Old server ${oldServerId} not found, skipping`);
          continue;
        }
        
        // Get old server password
        const oldServerPassword = safeDbOperation(() => dbOps.getServerPassword.get(oldServerId), 'getServerPassword') as {
          server_password: string;
        } | undefined;
        const oldHasPassword = oldServerPassword && oldServerPassword.server_password && oldServerPassword.server_password.trim() !== '';
        
        // Use transaction for database operations
        const transaction = db.transaction(() => {
          // Update all backups to point to target server
          safeDbOperation(() => dbOps.updateBackupServerId.run(targetServerId, oldServerId), 'updateBackupServerId');
          
          // Merge server metadata:
          // - Password: use non-empty field, if both exist, prefer newest (target)
          //   Copy the encrypted password directly without decrypting/re-encrypting
          const targetPassword = targetServerPassword?.server_password || '';
          const oldPassword = oldServerPassword?.server_password || '';
          const mergedPassword = (targetPassword && targetPassword.trim() !== '') ? targetPassword : oldPassword;
          
          // - Alias/Note/Server URL: use non-empty field, if both are non-empty, prefer newest (target)
          const targetAlias = (targetServer.alias || '').trim();
          const oldAlias = (oldServer.alias || '').trim();
          const mergedAlias = targetAlias || oldAlias || '';
          
          const targetNote = (targetServer.note || '').trim();
          const oldNote = (oldServer.note || '').trim();
          const mergedNote = targetNote || oldNote || '';
          
          const targetServerUrl = (targetServer.server_url || '').trim();
          const oldServerUrl = (oldServer.server_url || '').trim();
          const mergedServerUrl = targetServerUrl || oldServerUrl || '';
          
          // Update target server with merged values including password (direct SQL update to preserve encryption)
          const updateQuery = db.prepare(`
            UPDATE servers 
            SET server_url = ?, alias = ?, note = ?, server_password = ?
            WHERE id = ?
          `);
          
          safeDbOperation(() => updateQuery.run(
            mergedServerUrl,
            mergedAlias,
            mergedNote,
            mergedPassword,
            targetServerId
          ), 'updateServerWithPassword');
          
          // Delete old server entry
          safeDbOperation(() => dbOps.deleteServer.run(oldServerId), 'deleteServer');
        });
        
        transaction();
        
        // Update configuration entries (backup_settings and overdue_notifications) outside transaction
        // since these are async operations on configuration data
        await updateConfigurationServerId(oldServerId, targetServerId);
      }
      
      return { success: true };
    });
  } catch (error) {
    console.error('Error merging servers:', error instanceof Error ? error.message : String(error));
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to merge servers'
    };
  }
}

// Helper function to clean up configuration data for a server
function cleanupServerConfiguration(serverId: string): void {
  try {
    // Clean up backup_settings
    const backupSettings = getConfigBackupSettings();
    if (Object.keys(backupSettings).length > 0) {
      const updatedBackupSettings: Record<BackupKey, BackupNotificationConfig> = {};
      
      // Keep only entries that don't match the server ID
      for (const [backupKey, settings] of Object.entries(backupSettings)) {
        const [keyServerId] = backupKey.split(':');
        if (keyServerId !== serverId) {
          updatedBackupSettings[backupKey] = settings;
        }
      }
      
      // Save the updated backup settings
      setConfigBackupSettings(updatedBackupSettings);
    }
    
    // Clean up overdue_notifications
    const overdueNotifications = getConfigOverdueNotifications();
    if (Object.keys(overdueNotifications).length > 0) {
      const updatedOverdueNotifications: OverdueNotifications = {};
      
      // Keep only entries that don't match the server ID
      for (const [backupKey, notification] of Object.entries(overdueNotifications)) {
        const [keyServerId] = backupKey.split(':');
        if (keyServerId !== serverId) {
          updatedOverdueNotifications[backupKey] = notification;
        }
      }
      
      // Save the updated overdue notifications
      setConfigOverdueNotifications(updatedOverdueNotifications);
    }
  } catch (error) {
    console.error(`Failed to cleanup configuration for server ${serverId}:`, error instanceof Error ? error.message : String(error));
  }
}

// Functions to get/set notification frequency config
export function getNotificationFrequencyConfig(): NotificationFrequencyConfig {
  const value = getConfiguration("notification_frequency");
  if (
    value === "every_day" ||
    value === "every_week" ||
    value === "every_month" ||
    value === "onetime"
  ) {
    return value;
  }
  return defaultNotificationFrequencyConfig;
}

export function setNotificationFrequencyConfig(value: NotificationFrequencyConfig): void {
  setConfiguration("notification_frequency", value);
}

// New: Functions to get/set NTFY configuration stored under 'ntfy_config'
// NTFY configuration stored under 'ntfy_config'
export function getNtfyConfig(): NtfyConfig {
  return getCachedOrCompute('ntfy_config', () => {
    try {
      const ntfyJson = getConfiguration('ntfy_config');
      if (!ntfyJson || ntfyJson.trim() === '') {
        const topic = generateDefaultNtfyTopic();
        const cfg: NtfyConfig = { ...defaultNtfyConfig, topic };
        setNtfyConfig(cfg);
        return cfg;
      }
      const parsed = JSON.parse(ntfyJson) as NtfyConfig;
      if (!parsed.topic || parsed.topic.trim() === '') {
        const topic = generateDefaultNtfyTopic();
        const fixed = { ...parsed, topic };
        setNtfyConfig(fixed);
        return fixed;
      }
      return parsed;
    } catch (error) {
      console.error('Failed to get ntfy configuration:', error instanceof Error ? error.message : String(error));
      const topic = generateDefaultNtfyTopic();
      const cfg: NtfyConfig = { ...defaultNtfyConfig, topic };
      setNtfyConfig(cfg);
      return cfg;
    }
  }, 'getNtfyConfig');
}

export function setNtfyConfig(config: NtfyConfig): void {
  try {
    setConfiguration('ntfy_config', JSON.stringify(config));
  } catch (error) {
    console.error('Failed to save ntfy configuration:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}

// Helper function to check if a specific template message matches any previous default template
function isOldDefaultMessage(message: string | undefined, previousMessages: string[]): boolean {
  if (!message) return false;
  return previousMessages.includes(message);
}

// Helper function to get all previous messages for a specific template type
function getPreviousMessages(templateType: 'success' | 'warning' | 'overdueBackup'): string[] {
  const messages: string[] = [];
  for (const previousTemplate of previousTemplatesMessages) {
    if (templateType === 'success' && previousTemplate.sucess) {
      messages.push(previousTemplate.sucess);
    } else if (templateType === 'warning' && previousTemplate.warning) {
      messages.push(previousTemplate.warning);
    } else if (templateType === 'overdueBackup' && previousTemplate.overdueBackup) {
      messages.push(previousTemplate.overdueBackup);
    }
  }
  return messages;
}

// New: Functions to get/set Notification Templates under 'notification_templates'
export function getNotificationTemplates(): { success: NotificationTemplate; warning: NotificationTemplate; overdueBackup: NotificationTemplate } {
  return getCachedOrCompute('notification_templates', () => {
    try {
      const templatesJson = getConfiguration('notification_templates');
      if (!templatesJson || templatesJson.trim() === '') {
        setNotificationTemplates(defaultNotificationTemplates);
        return defaultNotificationTemplates;
      }
      const parsed = JSON.parse(templatesJson) as { success: NotificationTemplate; warning: NotificationTemplate; overdueBackup: NotificationTemplate };
      
      // Lazy upgrade: check if templates match old defaults and upgrade if needed
      const updatedTemplates = { ...parsed };
      let needsUpdate = false;
      
      // Check and replace warning template if it matches old defaults
      if (parsed.warning && isOldDefaultMessage(parsed.warning.message, getPreviousMessages('warning'))) {
        console.log('Lazy upgrade: Detected old warning template, replacing with new default');
        updatedTemplates.warning = defaultNotificationTemplates.warning;
        needsUpdate = true;
      }
      
      // Save updated templates if any were upgraded
      if (needsUpdate) {
        setNotificationTemplates(updatedTemplates);
        return updatedTemplates;
      }
      
      return {
        success: parsed.success || defaultNotificationTemplates.success,
        warning: parsed.warning || defaultNotificationTemplates.warning,
        overdueBackup: parsed.overdueBackup || defaultNotificationTemplates.overdueBackup
      };
    } catch (error) {
      console.error('Failed to get notification templates:', error instanceof Error ? error.message : String(error));
      setNotificationTemplates(defaultNotificationTemplates);
      return defaultNotificationTemplates;
    }
  }, 'getNotificationTemplates');
}

export function setNotificationTemplates(templates: { success: NotificationTemplate; warning: NotificationTemplate; overdueBackup: NotificationTemplate }): void {
  try {
    setConfiguration('notification_templates', JSON.stringify(templates));
  } catch (error) {
    console.error('Failed to save notification templates:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}

// Functions to get/set overdue notifications configuration
export function getConfigOverdueNotifications(): OverdueNotifications {
  return getCachedOrCompute('overdueNotifications', () => {
    try {
      const overdueNotificationsJson = getConfiguration('overdue_notifications');
      if (!overdueNotificationsJson || overdueNotificationsJson.trim() === '') {
        // Return empty object if no configuration exists
        return {};
      }
      
      try {
        const overdueNotifications = JSON.parse(overdueNotificationsJson) as OverdueNotifications;
        return overdueNotifications;
      } catch (parseError) {
        console.error('Failed to parse overdue notifications configuration:', parseError);
        return {};
      }
    } catch (error) {
      console.error('Failed to get overdue notifications configuration:', error instanceof Error ? error.message : String(error));
      return {};
    }
  }, 'getConfigOverdueNotifications');
}

export function setConfigOverdueNotifications(overdueNotifications: OverdueNotifications): void {
  try {
    setConfiguration('overdue_notifications', JSON.stringify(overdueNotifications));
  } catch (error) {
    console.error('Failed to save overdue notifications configuration:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}

// Functions to get/set overdue tolerance config
export function getOverdueToleranceConfig(): OverdueTolerance {
  return getCachedOrCompute('overdueToleranceConfig', () => {
    const value = getConfiguration("overdue_tolerance");
    if (
      value === "no_tolerance" ||
      value === "5min" ||
      value === "15min" ||
      value === "30min" ||
      value === "1h" ||
      value === "2h" ||
      value === "4h" ||
      value === "6h" ||
      value === "12h" ||
      value === "1d"
    ) {
      return value;
    }
    return defaultOverdueTolerance;
  }, 'getOverdueToleranceConfig');
}

export function setOverdueToleranceConfig(value: OverdueTolerance): void {
  setConfiguration("overdue_tolerance", value);
}

// Functions to get/set overdue tolerance config (returning minutes)
export function getConfigOverdueTolerance(): number {
  const tolerance = getOverdueToleranceConfig();
  switch (tolerance) {
    case 'no_tolerance':
      return 0;
    case '5min':
      return 5;
    case '15min':
      return 15;
    case '30min':
      return 30;
    case '1h':
      return 60;
    case '2h':
      return 120;
    case '4h':
      return 240;
    case '6h':
      return 360;
    case '12h':
      return 720;
    case '1d':
      return 1440; 
    default:
      return 0;
  }
}

export function setConfigOverdueTolerance(toleranceMinutes: number): void {
  // Convert minutes back to OverdueTolerance enum
  let tolerance: OverdueTolerance;
  
  switch (toleranceMinutes) {
    case 0:
      tolerance = 'no_tolerance';
      break;
    case 5:
      tolerance = '5min';
      break;
    case 15:
      tolerance = '15min';
      break;
    case 30:
      tolerance = '30min';
      break;
    case 60:
      tolerance = '1h';
      break;
    case 120:
      tolerance = '2h';
      break;
    case 240:
      tolerance = '4h';
      break;
    case 360:
      tolerance = '6h';
      break;
    case 720:
      tolerance = '12h';
      break;
    case 1440:
      tolerance = '1d';
      break;
    default:
      // Default to 1 hour if invalid value
      tolerance = '1h';
      console.warn(`Invalid tolerance minutes: ${toleranceMinutes}, defaulting to 1h`);
  }
  
  setOverdueToleranceConfig(tolerance);
}

// Functions to get/set backup settings configuration
export async function getConfigBackupSettings(forceRecalculation: boolean = false): Promise<Record<BackupKey, BackupNotificationConfig>> {
  // Check if backup_settings exists in database - if not, clear cache to force regeneration
  // This handles the case where backup_settings was deleted externally (e.g., by generate-test-data.ts)
  const backupSettingsJson = getConfiguration('backup_settings');
  if (!backupSettingsJson || backupSettingsJson.trim() === '') {
    // If backup_settings was deleted, clear the cache to ensure fresh data is loaded
    if (requestCache.has('backupSettings')) {
      requestCache.delete('backupSettings');
    }
  }
  
  // If force recalculation is requested, clear cache to force regeneration
  if (forceRecalculation && requestCache.has('backupSettings')) {
    requestCache.delete('backupSettings');
  }
  
  return getCachedOrCompute('backupSettings', async () => {
    try {
    // Re-read backup_settings from database (may have changed since initial check)
    const currentBackupSettingsJson = getConfiguration('backup_settings');
    let currentBackupSettings: Record<BackupKey, BackupNotificationConfig> = {};
    
    if (currentBackupSettingsJson && currentBackupSettingsJson.trim() !== '') {
      try {
        currentBackupSettings = migrateBackupSettings(JSON.parse(currentBackupSettingsJson));
      } catch (parseError) {
        console.error('Failed to parse backup settings configuration:', parseError);
        currentBackupSettings = {};
      }
    }
    
    // Get all servers with backups
    const serversSummary = getServersBackupNames() as { 
      id: string;
      server_id: string;
      server_name: string; 
      backup_name: string;
    }[];

    // Create a set of all server-backup combinations
    const serverBackupCombinations = new Set<string>();
    serversSummary.forEach(server => {
      if (server.server_id && server.backup_name) {
        const backupKey = `${server.server_id}:${server.backup_name}`;
        serverBackupCombinations.add(backupKey);
      }
    });

    // Get latest backup information for all server-backup combinations
    const allLatestBackups = getAllLatestBackups() as Array<{
      server_id: string;
      backup_name: string;
      date: string;
      server_name: string;
    }>;
    
    // Create a lookup map for quick access to latest backup dates
    const latestBackupMap = new Map<string, string>();
    allLatestBackups.forEach(backup => {
      const backupKey = `${backup.server_id}:${backup.backup_name}`;
      latestBackupMap.set(backupKey, backup.date);
    });

    // Check for missing backup settings and add defaults
    let addedSettings = 0;
    let updatedSettings = 0;
    const updatedBackupSettings = { ...currentBackupSettings };
    
    for (const backupKey of serverBackupCombinations) {
      if (!currentBackupSettings[backupKey]) {
        // Import default configuration
        const defaultConfig = { ...defaultBackupNotificationConfig };
        
        // For new servers (no existing settings): initialize with lastBackup + interval
        const latestBackupDate = latestBackupMap.get(backupKey);
        
        if (latestBackupDate) {
          defaultConfig.lastBackupDate = latestBackupDate;
          
          // For new servers: time = lastBackup + interval
          try {
            defaultConfig.time = GetNextBackupRunDate(
              latestBackupDate,
              latestBackupDate, // Use lastBackup as base time
              defaultConfig.expectedInterval,
              defaultConfig.allowedWeekDays || getDefaultAllowedWeekDays()
            );
          } catch (error) {
            console.warn(`Failed to calculate initial time for ${backupKey}:`, error instanceof Error ? error.message : String(error));
            defaultConfig.time = latestBackupDate; // Fallback
          }
        }
        
        updatedBackupSettings[backupKey] = defaultConfig;
        addedSettings++;
      } 

      // Check if existing settings need updates
      const existingSettings = updatedBackupSettings[backupKey];
      const latestBackupDate = latestBackupMap.get(backupKey);
      
      // Force recalculation if requested, or if lastBackupDate has changed
      const shouldRecalculate = forceRecalculation || (latestBackupDate && existingSettings.lastBackupDate !== latestBackupDate);
      
      if (latestBackupDate && shouldRecalculate) {
        // Update lastBackupDate and recalculate time
        let newTime = existingSettings.time || latestBackupDate;
        
        try {
          // Keep adding intervals until time > lastBackupDate
          // This preserves the original schedule time-of-day
          const maxIterations = 1000; // Safety limit
          let iterations = 0;
          
          const lastBackupDateObj = new Date(latestBackupDate);
          let newTimeObj = new Date(newTime);
          
          // When a new backup arrives, we need to ensure the time field is advanced
          // by at least one interval from the new last backup date.
          // If the old time field is already after the last backup, GetNextBackupRunDate
          // will return it immediately without advancing. To fix this, we need to ensure
          // we start from a time that's <= lastBackupDate so it will advance.
          // We preserve the time-of-day from the old time field by applying it to the
          // last backup date, but if that's still after the last backup, we use the
          // last backup date itself as the base.
          if (newTimeObj > lastBackupDateObj) {
            // Preserve the time-of-day (hours, minutes, seconds) from the old time field
            const oldTimeOfDay = {
              hours: newTimeObj.getUTCHours(),
              minutes: newTimeObj.getUTCMinutes(),
              seconds: newTimeObj.getUTCSeconds(),
              milliseconds: newTimeObj.getUTCMilliseconds()
            };
            
            // Create a new date using the last backup date but with the old time-of-day
            const baseTimeForCalculation = new Date(lastBackupDateObj);
            baseTimeForCalculation.setUTCHours(oldTimeOfDay.hours, oldTimeOfDay.minutes, oldTimeOfDay.seconds, oldTimeOfDay.milliseconds);
            
            // Only use this if it's <= lastBackupDate, otherwise use lastBackupDate itself
            // This ensures GetNextBackupRunDate will always advance the time
            if (baseTimeForCalculation <= lastBackupDateObj) {
              newTime = baseTimeForCalculation.toISOString();
            } else {
              // If preserving time-of-day would still be after last backup, use last backup date
              // The time-of-day will be preserved through the interval advancement
              newTime = latestBackupDate;
            }
            newTimeObj = new Date(newTime);
          }
          
          // Now advance by intervals until we're past the last backup
          while (newTimeObj <= lastBackupDateObj && iterations < maxIterations) {
            newTime = GetNextBackupRunDate(
              latestBackupDate, // Reference point
              newTime, // Current time to advance
              existingSettings.expectedInterval,
              existingSettings.allowedWeekDays || getDefaultAllowedWeekDays()
            );
            iterations++;
            newTimeObj = new Date(newTime);
          }
          
          if (iterations >= maxIterations) {
            console.warn(`Max iterations reached for ${backupKey}, using lastBackup + interval`);
            newTime = GetNextBackupRunDate(
              latestBackupDate,
              latestBackupDate,
              existingSettings.expectedInterval,
              existingSettings.allowedWeekDays || getDefaultAllowedWeekDays()
            );
          }
          
          updatedBackupSettings[backupKey] = {
            ...existingSettings,
            lastBackupDate: latestBackupDate,
            time: newTime
          };
          updatedSettings++;
        } catch (error) {
          console.warn(`Failed to calculate time for ${backupKey}:`, error instanceof Error ? error.message : String(error));
          // If calculation fails, just update lastBackupDate if it changed
          if (existingSettings.lastBackupDate !== latestBackupDate) {
            updatedBackupSettings[backupKey] = {
              ...existingSettings,
              lastBackupDate: latestBackupDate
            };
            updatedSettings++;
          }
        }
      }
      
      // Populate empty time field if needed (safety net)
      if (existingSettings && (!existingSettings.time || existingSettings.time.trim() === '')) {
        const latestBackupDate = latestBackupMap.get(backupKey);
        if (latestBackupDate) {
          try {
            const calculatedTime = GetNextBackupRunDate(
              latestBackupDate,
              latestBackupDate,
              existingSettings.expectedInterval,
              existingSettings.allowedWeekDays || getDefaultAllowedWeekDays()
            );
            updatedBackupSettings[backupKey] = {
              ...updatedBackupSettings[backupKey],
              time: calculatedTime
            };
            updatedSettings++;
          } catch (error) {
            console.warn(`Failed to populate empty time for ${backupKey}:`, error instanceof Error ? error.message : String(error));
            updatedBackupSettings[backupKey] = {
              ...updatedBackupSettings[backupKey],
              time: latestBackupDate // Fallback
            };
            updatedSettings++;
          }
        }
      }
      
      // NOTE: The time field represents the next expected backup date
      // Algorithm: while (time <= lastBackupDate) { time = time + interval }
      // This preserves the original schedule time-of-day even when manual backups arrive
      // For new servers without Duplicati sync: time = lastBackup + interval
    }
    
    // Save updated settings if any were added or updated
    if (addedSettings > 0 || updatedSettings > 0) {
      setConfigBackupSettings(updatedBackupSettings);
    }
    return updatedBackupSettings;
  } catch (error) {
    console.error('Failed to get backup settings configuration:', error instanceof Error ? error.message : String(error));
    return {};
  }
  }, 'getConfigBackupSettings');
}

export function setConfigBackupSettings(backupSettings: Record<BackupKey, BackupNotificationConfig>): void {
  try {
    setConfiguration('backup_settings', JSON.stringify(backupSettings));
  } catch (error) {
    console.error('Failed to save backup settings configuration:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}


// Helper function to get overdue backups for a specific server based on interval calculation
export async function getOverdueBackupsForServer(serverIdentifier: string): Promise<Array<{
  serverName: string;
  backupName: string;
  lastBackupDate: string;
  lastNotificationSent: string;
  notificationEvent?: NotificationEvent;
  expectedBackupDate: string;
  expectedBackupElapsed: string;
}>> {
  try {
    const backupSettings = await getConfigBackupSettings();
    if (!backupSettings || Object.keys(backupSettings).length === 0) return [];
    
    // Get all latest backups once before the loop
    const allLatestBackups = getAllLatestBackups();
    
    // Create a Map for quick lookup of latest backups by server_id:backup_name
    const latestBackupMap = new Map<string, { date: string; server_name: string; backup_name?: string }>();
    for (const backup of allLatestBackups) {
      const key = `${backup.server_id}:${backup.backup_name}`;
      latestBackupMap.set(key, {
        date: backup.date,
        server_name: backup.server_name,
        backup_name: backup.backup_name
      });
    }
    
    const overdueBackups: Array<{
      serverName: string;
      backupName: string;
      lastBackupDate: string;
      lastNotificationSent: string;
      notificationEvent?: NotificationEvent;
      expectedBackupDate: string;
      expectedBackupElapsed: string;
    }> = [];
    
    // Get the latest backup for each backup configuration
    for (const backupKey in backupSettings) {
      const [serverId, backupName] = backupKey.split(':');
      
      // Check if this is for the requested server (by ID or name)
      if (serverId === serverIdentifier) {
        const settings = backupSettings[backupKey];
        
        // Skip if overdue backup check is not enabled
        if (!settings.overdueBackupCheckEnabled) continue;
        
        // Get server info for database lookup
        const serversSummary = await getServersSummary();
        const server = serversSummary.find(s => s.id === serverId);
        if (!server) continue;
        
        // Get the latest backup from the Map
        const latestBackup = latestBackupMap.get(backupKey);
        
        if (!latestBackup) continue;
        
        // Calculate expected backup date (without tolerance)
        const expectedBackupDate = GetNextBackupRunDate(
          latestBackup.date,
          settings.time, 
          settings.expectedInterval, 
          settings.allowedWeekDays || getDefaultAllowedWeekDays()
        );
        
        if (expectedBackupDate === 'N/A') continue;
        
        // Add tolerance to the expected backup date for overdue check
        const toleranceMinutes = getConfigOverdueTolerance();
        const expectedTime = new Date(expectedBackupDate);
        
        if (toleranceMinutes > 0) {
          expectedTime.setMinutes(expectedTime.getMinutes() + toleranceMinutes);
        }
        
        const currentTime = new Date();
        
        // Check if backup is overdue (current time is past expected date with tolerance)
        if (currentTime > expectedTime) {
          // Get notification event for this backup
          const notificationEvent = await getNotificationEvent(serverId, backupName);
          
          // Calculate elapsed time
          const expectedBackupElapsed = formatTimeElapsed(expectedBackupDate);
          
          // Get last notification sent (if any)
          const lastNotificationSent = getLastNotificationSent(serverId, backupName);
          
          overdueBackups.push({
            serverName: server.name,
            backupName,
            lastBackupDate: latestBackup.date,
            lastNotificationSent,
            notificationEvent,
            expectedBackupDate,
            expectedBackupElapsed
          });
        }
      }
    }
    
    return overdueBackups;
  } catch (error) {
    console.error('Error getting overdue backups for server:', error instanceof Error ? error.message : String(error));
    return [];
  }
} 



// Function to get ntfy configuration with default topic generation
// Removed async alias; use getNtfyConfig() directly

// Function to get all server and their respective backup names
export function getServersBackupNames() {
  return withDb(() => safeDbOperation(() => {
    const results = dbOps.getServersBackupNames.all() as Array<{ server_id: string; server_name: string; backup_name: string; server_url: string; alias: string; note: string; has_password: number }>;
    return results.map(row => ({
      id: `${row.server_id}:${row.backup_name}`,
      server_id: row.server_id,
      server_name: row.server_name,
      backup_name: row.backup_name,
      server_url: row.server_url,
      alias: row.alias || '',
      note: row.note || '',
      hasPassword: Boolean(row.has_password)
    }));
  }, 'getServersBackupNames', []));
}

// Function to get latest backup information for all server-backup combinations
export function getAllLatestBackups() {
  return withDb(() => safeDbOperation(() => {
    const results = dbOps.getAllLatestBackups.all() as Array<{ 
      server_id: string; 
      backup_name: string; 
      date: string; 
      server_name: string 
    }>;
    return results.map(row => ({
      server_id: row.server_id,
      backup_name: row.backup_name,
      date: row.date,
      server_name: row.server_name
    }));
  }, 'getAllLatestBackups', []));
}

// SMTP Configuration functions
export function getSMTPConfig(): SMTPConfig | null {
  return getCachedOrCompute('smtp_config', () => {
    const configJson = getConfiguration('smtp_config');
    if (!configJson) {
      return null;
    }

    try {
      const encryptedConfig: SMTPConfigEncrypted = JSON.parse(configJson);
      
      // Determine connection type (fallback to legacy secure flag if needed)
      const connectionType: SMTPConnectionType =
        encryptedConfig.connectionType ||
        (typeof encryptedConfig.secure === 'boolean'
          ? (encryptedConfig.secure ? 'ssl' : 'starttls')
          : 'starttls');
      
      // Decrypt username and password (only if they're not empty strings)
      const decryptedConfig: SMTPConfig = {
        host: encryptedConfig.host,
        port: encryptedConfig.port,
        connectionType,
        username: (encryptedConfig.username && encryptedConfig.username.trim() !== '') ? decryptData(encryptedConfig.username) : '',
        password: (encryptedConfig.password && encryptedConfig.password.trim() !== '') ? decryptData(encryptedConfig.password) : '',
        mailto: encryptedConfig.mailto,
        senderName: encryptedConfig.senderName,
        fromAddress: encryptedConfig.fromAddress,
        requireAuth: encryptedConfig.requireAuth !== false // Default to true for backward compatibility
      };

      return decryptedConfig;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // If this is a master key error, return null gracefully instead of throwing
      if (errorMessage.includes('MASTER_KEY_INVALID')) {
        console.warn('SMTP configuration has invalid master key, returning null to continue execution');
        return null;
      }
      
      console.error('Failed to parse or decrypt SMTP configuration:', errorMessage);
      return null;
    }
  }, 'getSMTPConfig');
}

export function setSMTPConfig(config: SMTPConfig): void {
  try {
    // Encrypt username and password only if they're not empty
    const encryptedConfig: SMTPConfigEncrypted = {
      host: config.host,
      port: config.port,
      connectionType: config.connectionType,
      username: (config.username && config.username.trim() !== '') ? encryptData(config.username) : '',
      password: (config.password && config.password.trim() !== '') ? encryptData(config.password) : '',
      mailto: config.mailto,
      senderName: config.senderName,
      fromAddress: config.fromAddress,
      requireAuth: config.requireAuth !== false // Default to true for backward compatibility
    };

    setConfiguration('smtp_config', JSON.stringify(encryptedConfig));
  } catch (error) {
    console.error('Failed to encrypt or save SMTP configuration:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}

export function deleteSMTPConfig(): void {
  withDb(() => {
    try {
      db.prepare('DELETE FROM configurations WHERE key = ?').run('smtp_config');
      // Clear request cache after deleting configuration to ensure fresh data is returned
      clearRequestCache();
    } catch (error) {
      console.error('Failed to delete SMTP configuration:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  });
}







