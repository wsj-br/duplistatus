import { db, dbOps } from './db';
import { formatDurationFromSeconds } from "@/lib/db";
import type { BackupStatus, NotificationEvent, BackupKey, OverdueTolerance, BackupNotificationConfig, OverdueNotifications, ChartDataPoint } from "@/lib/types";
import { CronServiceConfig, CronInterval } from './types';
import { cronIntervalMap } from './cron-interval-map';
import type { NotificationFrequencyConfig } from "@/lib/types";
import { defaultCronConfig, defaultNotificationFrequencyConfig, defaultOverdueTolerance, defaultCronInterval } from './default-config';
import { formatTimeElapsed } from './utils';

// Helper function to convert overdue tolerance to minutes
function getToleranceInMinutes(tolerance: OverdueTolerance): number {
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

// Helper function to get backup key
function getBackupKey(machineName: string, backupName: string): BackupKey {
  return `${machineName}:${backupName}`;
}

// Helper function to check if a backup is overdue based on expected interval
function isBackupOverdueByInterval(machineName: string, backupName: string, lastBackupDate: string | null): boolean {
  try {
    if (!lastBackupDate || lastBackupDate === 'N/A') return false;
    
    // Get backup settings to check if overdue backup check is enabled
    const backupSettingsJson = getConfiguration('backup_settings');
    if (!backupSettingsJson) return false;
    
    const backupSettings = JSON.parse(backupSettingsJson) as Record<BackupKey, {
      notificationEvent: NotificationEvent;
      expectedInterval: number;
      overdueBackupCheckEnabled: boolean;
      intervalUnit: 'hour' | 'day';
      overdueTolerance?: OverdueTolerance;
    }>;
    
    const backupKey = getBackupKey(machineName, backupName);
    const settings = backupSettings[backupKey];
    
    // If no settings found or overdue backup check is disabled, return false
    if (!settings || !settings.overdueBackupCheckEnabled) return false;
    
    // Get backup interval settings
    const backupIntervalSettings = getBackupIntervalSettings(machineName, backupName);
    if (!backupIntervalSettings) return false;
    
    // Calculate expected backup date with tolerance
    const globalTolerance = getOverdueToleranceConfig();
    const expectedBackupDate = calculateExpectedBackupDate(
      lastBackupDate, 
      backupIntervalSettings.expectedInterval, 
      backupIntervalSettings.intervalUnit,
      globalTolerance
    );
    
    if (expectedBackupDate === 'N/A') return false;
    
    // Check if current time is past the expected backup date
    const currentTime = new Date();
    const expectedTime = new Date(expectedBackupDate);
    
    return currentTime > expectedTime;
  } catch (error) {
    console.error('Error checking if backup is overdue by interval:', error instanceof Error ? error.message : String(error));
    return false;
  }
}

// Helper function to get notification event for a backup
function getNotificationEvent(machineName: string, backupName: string): NotificationEvent | undefined {
  try {
    const backupSettingsJson = getConfiguration('backup_settings');
    if (!backupSettingsJson) return undefined;
    
    const backupSettings = JSON.parse(backupSettingsJson) as Record<BackupKey, {
      notificationEvent: NotificationEvent;
      expectedInterval: number;
      overdueBackupCheckEnabled: boolean;
      intervalUnit: 'hour' | 'day';
    }>;
    
    const backupKey = getBackupKey(machineName, backupName);
    return backupSettings[backupKey]?.notificationEvent;
  } catch (error) {
    console.error('Error getting notification event:', error instanceof Error ? error.message : String(error));
    return undefined;
  }
}

// Helper function to get last notification sent timestamp for a backup
function getLastNotificationSent(machineName: string, backupName: string): string {
  try {
    const lastNotificationJson = getConfiguration('overdue_backup_notifications');
    if (!lastNotificationJson) return 'N/A';
    
    const lastNotifications = JSON.parse(lastNotificationJson) as OverdueNotifications;
    const backupKey = getBackupKey(machineName, backupName);
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
function getBackupIntervalSettings(machineName: string, backupName: string): {
  expectedInterval: number;
  intervalUnit: 'hour' | 'day';
  overdueTolerance?: OverdueTolerance;
} | undefined {
  try {
    const backupSettingsJson = getConfiguration('backup_settings');
    if (!backupSettingsJson) return undefined;
    
    const backupSettings = JSON.parse(backupSettingsJson) as Record<BackupKey, {
      notificationEvent: NotificationEvent;
      expectedInterval: number;
      overdueBackupCheckEnabled: boolean;
      intervalUnit: 'hour' | 'day';
      overdueTolerance?: OverdueTolerance;
    }>;
    
    const backupKey = getBackupKey(machineName, backupName);
    const settings = backupSettings[backupKey];
    
    if (!settings) return undefined;
    
    return {
      expectedInterval: settings.expectedInterval,
      intervalUnit: settings.intervalUnit,
      overdueTolerance: settings.overdueTolerance
    };
  } catch (error) {
    console.error('Error getting backup interval settings:', error instanceof Error ? error.message : String(error));
    return undefined;
  }
}

// Helper function to calculate expected backup date
export function calculateExpectedBackupDate(lastBackupDate: string, expectedInterval: number, intervalUnit: 'hour' | 'day', tolerance: OverdueTolerance = defaultOverdueTolerance): string {
  try {
    const lastBackup = new Date(lastBackupDate);
    if (isNaN(lastBackup.getTime())) {
      return 'N/A';
    }
    
    const expectedDate = new Date(lastBackup);
    if (intervalUnit === 'hour') {
      expectedDate.setHours(expectedDate.getHours() + expectedInterval);
    } else if (intervalUnit === 'day') {
      expectedDate.setDate(expectedDate.getDate() + expectedInterval);
    }
    
    // Add tolerance to the expected date
    const toleranceMinutes = getToleranceInMinutes(tolerance);
    if (toleranceMinutes > 0) {
      expectedDate.setMinutes(expectedDate.getMinutes() + toleranceMinutes);
    }
    
    return expectedDate.toISOString();
  } catch (error) {
    console.error('Error calculating expected backup date:', error instanceof Error ? error.message : String(error));
    return 'N/A';
  }
}



export function getCronConfig(): CronServiceConfig {
  try {
    const configJson = getConfiguration('cron_service');
    if (configJson) {
      const config = JSON.parse(configJson);
      return {
        ...defaultCronConfig,
        ...config,
        tasks: {
          ...defaultCronConfig.tasks,
          ...config.tasks
        }
      };
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
  try {
    const lastOverdueCheck = getConfiguration('last_overdue_check');
    return lastOverdueCheck || 'N/A';
  } catch (error) {
    console.error('Error getting last overdue backup check time:', error instanceof Error ? error.message : String(error));
    return 'N/A';
  }
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
      // console.log(`[CronPortChecker] Updating cron service port from ${currentConfig.port} to ${expectedPort}`);
      
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
  machine_id: string;
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
    } catch (error) {
      console.error(`Failed to set configuration for key '${key}':`, error instanceof Error ? error.message : String(error));
      throw error;
    }
  });
}

interface MachineRow {
  id: string;
  name: string;
  server_url: string;
}

export function getAllMachineConnections() {
  return withDb(() => {
    const machines = safeDbOperation(() => dbOps.getAllMachines.all(), 'getAllMachines', []) as MachineRow[];
    return machines.map(machine => ({
      id: machine.id,
      name: machine.name,
      server_url: machine.server_url || ''
    }));
  });
}

export function getAllMachines() {
  return withDb(() => {
    const machines = safeDbOperation(() => dbOps.getAllMachines.all(), 'getAllMachines', []) as MachineRow[];
    return machines.map(machine => {
      const backups = safeDbOperation(() => dbOps.getMachineBackups.all(machine.id), 'getMachineBackups', []) as BackupRecord[];
      
      const formattedBackups = backups.map(backup => ({
        id: String(backup.id),
        machine_id: String(backup.machine_id),
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
        id: machine.id,
        name: machine.name,
        backups: formattedBackups,
        chartData
      };
    });
  });
}

interface OverallSummaryRow {
  total_machines: number;
  total_backups: number;
  total_uploaded_size: number;
  total_storage_used: number;
  total_backuped_size: number;
}

// Helper function to count overdue backups from configuration
function countOverdueBackups(): number {
  try {
    // Get backup settings to check which backups have overdue check enabled
    const backupSettingsJson = getConfiguration('backup_settings');
    if (!backupSettingsJson) {
      return 0;
    }
    
    let backupSettings: Record<BackupKey, {
      notificationEvent: NotificationEvent;
      expectedInterval: number;
      overdueBackupCheckEnabled: boolean;
      intervalUnit: 'hour' | 'day';
      overdueTolerance?: OverdueTolerance;
    }>;
    
    try {
      backupSettings = JSON.parse(backupSettingsJson);
    } catch (parseError) {
      console.error('Failed to parse backup settings JSON in countOverdueBackups:', parseError);
      return 0;
    }
    
    // Get machines summary for machine ID lookup
    const machinesSummary = withDb(() => {
      return safeDbOperation(() => dbOps.getAllMachines.all(), 'getAllMachines', []) as { 
        id: string; 
        name: string; 
      }[];
    });
    
    // Create a map for quick machine name to ID lookup
    const machineNameToId = new Map<string, string>();
    machinesSummary.forEach(machine => {
      machineNameToId.set(machine.name, machine.id);
    });
    
    const currentTime = new Date();
    let overdueCount = 0;
    
    // Iterate through backup settings keys (machine_name:backup_name)
    const backupKeys = Object.keys(backupSettings);
    
    for (const backupKey of backupKeys) {
      // Parse machine name and backup name from the key
      const [machineName, backupName] = backupKey.split(':');
      
      if (!machineName || !backupName) {
        continue;
      }
      
      // Get the backup configuration
      const backupConfig = backupSettings[backupKey];
      
      if (!backupConfig || !backupConfig.overdueBackupCheckEnabled) {
        continue;
      }
      
      // Get machine ID from the machine name
      const machineId = machineNameToId.get(machineName);
      if (!machineId) {
        continue;
      }
      
      // Get the latest backup for this machine and backup name
      const latestBackup = safeDbOperation(() => dbOps.getLatestBackupByName.get(machineId, backupName), 'getLatestBackupByName') as {
        date: string;
        machine_name: string;
        backup_name?: string;
      } | null;
      
      if (!latestBackup) {
        continue;
      }
      
      // Get interval configuration
      const intervalUnit = backupConfig.intervalUnit || 'hour';
      const expectedInterval = backupConfig.expectedInterval;
      
      // Calculate expected backup date using the helper function with tolerance
      const globalTolerance = getOverdueToleranceConfig();
      const expectedBackupDate = calculateExpectedBackupDate(latestBackup.date, expectedInterval, intervalUnit, globalTolerance);
      
      // Check if backup is overdue by comparing expected date with current time
      const expectedBackupTime = new Date(expectedBackupDate);
      
      // Check if backup is overdue (expected date is in the past)
      if (expectedBackupDate !== 'N/A' && !isNaN(expectedBackupTime.getTime()) && currentTime > expectedBackupTime) {
        overdueCount++;
      }
    }
    
    return overdueCount;
  } catch (error) {
    console.error('Error counting overdue backups:', error instanceof Error ? error.message : String(error));
    return 0;
  }
}

export function getOverallSummary() {
  try {
    const result = withDb(() => {
      const summary = safeDbOperation(() => dbOps.getOverallSummary.get(), 'getOverallSummary') as OverallSummaryRow | undefined;
      
      if (!summary) {
        return {
          totalMachines: 0,
          totalBackups: 0,
          totalUploadedSize: 0,
          totalStorageUsed: 0,
          totalBackupSize: 0,
          overdueBackupsCount: 0
        };
      }

      let overdueCount = 0;
      try {
        overdueCount = countOverdueBackups();
      } catch (overdueError) {
        console.error('[getOverallSummary] Error counting overdue backups:', overdueError instanceof Error ? overdueError.message : String(overdueError));
        // Continue with overdueCount = 0
      }

      return {
        totalMachines: summary.total_machines,
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
      totalMachines: 0,
      totalBackups: 0,
      totalUploadedSize: 0,
      totalStorageUsed: 0,
      totalBackupSize: 0,
      overdueBackupsCount: 0
    };
  }
}

export function getMachineById(machineId: string) {
  return withDb(() => {
    try {
      const machine = safeDbOperation(() => dbOps.getMachine.get(machineId), 'getMachine') as { id: string; name: string } | undefined;
      if (!machine) return null;

      const backups = safeDbOperation(() => dbOps.getMachineBackups.all(machineId), 'getMachineBackups', []) as BackupRecord[];
      
      const formattedBackups = backups.map(backup => ({
        id: String(backup.id),
        machine_id: String(backup.machine_id),
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
        id: machine.id,
        name: machine.name,
        backups: formattedBackups,
        chartData
      };
    } catch (error) {
      console.error(`Failed to get machine by ID ${machineId}:`, error instanceof Error ? error.message : String(error));
      return null;
    }
  });
}

export function getAggregatedChartData() {
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

export function getAllMachinesChartData() {
  try {
    return withDb(() => {
      const result = safeDbOperation(() => dbOps.getAllMachinesChartData.all(), 'getAllMachinesChartData', []) as {
        date: string;
        isoDate: string;
        machineId: string;
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
    console.error('[getAllMachinesChartData] Error:', error instanceof Error ? error.message : String(error));
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

// New function to get machine chart data (no date filtering)
export function getMachineChartData(machineId: string) {
  try {
    return withDb(() => {
      const result = safeDbOperation(() => dbOps.getMachineChartData.all(machineId), 'getMachineChartData', []) as ChartDataPoint[];
      
      return result || [];
    });
  } catch (error) {
    console.error('[getMachineChartData] Error:', error instanceof Error ? error.message : String(error));
    return [];
  }
}

// New function to get machine chart data with time range filtering
export function getMachineChartDataWithTimeRange(machineId: string, startDate: Date, endDate: Date) {
  try {
    return withDb(() => {
      const result = safeDbOperation(() => dbOps.getMachineChartDataWithTimeRange.all({
        machineId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      }), 'getMachineChartDataWithTimeRange', []) as ChartDataPoint[];
      
      return result || [];
    });
  } catch (error) {
    console.error('[getMachineChartDataWithTimeRange] Error:', error instanceof Error ? error.message : String(error));
    return [];
  }
}

// New function to get machine/backup chart data (no date filtering)
export function getMachineBackupChartData(machineId: string, backupName: string) {
  try {
    return withDb(() => {
      const result = safeDbOperation(() => dbOps.getMachineBackupChartData.all({
        machineId,
        backupName
      }), 'getMachineBackupChartData', []) as ChartDataPoint[];
      
      return result || [];
    });
  } catch (error) {
    console.error('[getMachineBackupChartData] Error:', error instanceof Error ? error.message : String(error));
    return [];
  }
}

// New function to get machine/backup chart data with time range filtering
export function getMachineBackupChartDataWithTimeRange(machineId: string, backupName: string, startDate: Date, endDate: Date) {
  try {
    return withDb(() => {
      const result = safeDbOperation(() => dbOps.getMachineBackupChartDataWithTimeRange.all({
        machineId,
        backupName,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      }), 'getMachineBackupChartDataWithTimeRange', []) as ChartDataPoint[];
      
      return result || [];
    });
  } catch (error) {
    console.error('[getMachineBackupChartDataWithTimeRange] Error:', error instanceof Error ? error.message : String(error));
    return [];
  }
}

// New function to get machine summary for the new dashboard
export function  getMachinesSummary() {
  try {
    return withDb(() => {
      const rows = safeDbOperation(() => dbOps.getMachinesSummary.all(), 'getMachinesSummary', []) as Array<{
        machine_id: string;
        machine_name: string;
        server_url: string;
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
      
      // Group by machine to create the structure needed for machine cards/table
      const machineMap = new Map<string, {
        id: string;
        name: string;
        server_url: string;
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
        lastBackupDate: string;
        lastBackupStatus: BackupStatus | 'N/A';
        lastBackupDuration: string;
        lastBackupListCount: number | null;
        lastBackupName: string | null;
        lastBackupId: string | null;
        lastOverdueCheck: string;
        haveOverdueBackups: boolean;
        backupNames: string[];
      }>();
      
      rows.forEach(row => {
        const machineId = row.machine_id;
        
        if (!machineMap.has(machineId)) {
          // Initialize machine data
          machineMap.set(machineId, {
            id: machineId,
            name: row.machine_name,
            server_url: row.server_url,
            backupInfo: [],
            totalBackupCount: 0,
            totalStorageSize: 0,
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
        
        const machine = machineMap.get(machineId)!;
        
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
        
        // Add backup type data
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
        
        machine.backupInfo.push(backupInfo);

        // add the backup name to the backup names array
        machine.backupNames.push(row.backup_name);
        
        // Update machine totals
        machine.totalBackupCount += row.backup_count || 0;
        // Calculate total storage size from backupInfo
        machine.totalStorageSize += row.storage_size || 0;
        
        // Update latest backup info (use the most recent backup across all types)
        if (row.last_backup_date && (machine.lastBackupDate === 'N/A' || new Date(row.last_backup_date) > new Date(machine.lastBackupDate))) {
          machine.lastBackupDate = row.last_backup_date;
          machine.lastBackupStatus = row.last_backup_status || 'N/A';
          machine.lastBackupDuration = row.last_backup_duration ? formatDurationFromSeconds(row.last_backup_duration) : 'N/A';
          machine.lastBackupListCount = row.backup_versions || null;
          machine.lastBackupId = row.last_backup_id || 'N/A';
        }
        
      });
      
      // Process each machine to add overdue status and other derived data per backup type
      const result = Array.from(machineMap.values()).map(machine => {
        // Process each backup type to add overdue status and other derived data
        machine.backupInfo = machine.backupInfo.map(thisBackupInfo => {
          let isOverdue = false;
          let expectedBackupDate = 'N/A';
          let expectedBackupElapsed = 'N/A';
          
          if (thisBackupInfo.lastBackupDate !== 'N/A') {
            isOverdue = isBackupOverdueByInterval(machine.name, thisBackupInfo.name, thisBackupInfo.lastBackupDate);

            // Check if the machine has overdue backups
            if (isOverdue) {
              machine.haveOverdueBackups = true;
            }

            // Get expected backup date
            const backupSettings = getBackupIntervalSettings(machine.name, thisBackupInfo.name);
            if (backupSettings) {
              const globalTolerance = getOverdueToleranceConfig();
              expectedBackupDate = calculateExpectedBackupDate(
                thisBackupInfo.lastBackupDate,
                backupSettings.expectedInterval,
                backupSettings.intervalUnit,
                globalTolerance
              );
              expectedBackupElapsed = formatTimeElapsed(expectedBackupDate);
            }
          }
          
          // Get notification event for this backup type
          const notificationEvent = getNotificationEvent(machine.name, thisBackupInfo.name);
          
          // Get last notification sent (if any)
          const lastNotificationSent = getLastNotificationSent(machine.name, thisBackupInfo.name);
          
          return {
            ...thisBackupInfo,
            isBackupOverdue: isOverdue,
            notificationEvent,
            expectedBackupDate,
            expectedBackupElapsed,
            lastNotificationSent
          };
        });
        
        // Remove duplicate available backups
        machine.backupNames = [...new Set(machine.backupNames)];
        
        return machine;
      });
           
      return result;
    });
  } catch (error) {
    console.error('[getMachineSummary] Error:', error instanceof Error ? error.message : String(error));
    return [];
  }
}

// Wrapper functions for database operations (keeping for backward compatibility)
export const dbUtils = {
  getMachineById: (machineId: string) => getMachineById(machineId),
  getMachineByName: (name: string) => withDb(() => safeDbOperation(() => dbOps.getMachineByName.get(name), 'getMachineByName')),
  getLatestBackup: (machineId: string) => withDb(() => safeDbOperation(() => dbOps.getLatestBackup.get(machineId), 'getLatestBackup')),
  getLatestBackupByName: (machineId: string, backupName: string) => withDb(() => safeDbOperation(() => dbOps.getLatestBackupByName.get(machineId, backupName), 'getLatestBackupByName')),
  getMachineBackups: (machineId: string) => withDb(() => safeDbOperation(() => dbOps.getMachineBackups.all(machineId), 'getMachineBackups', [])),
  getAllMachines: () => getAllMachines(),
  getOverallSummary: () => getOverallSummary(),
  getLatestBackupDate: () => withDb(() => safeDbOperation(() => dbOps.getLatestBackupDate.get(), 'getLatestBackupDate')),
  getAggregatedChartData: () => getAggregatedChartData(),
  getAggregatedChartDataWithTimeRange: (startDate: Date, endDate: Date) => getAggregatedChartDataWithTimeRange(startDate, endDate),
  getAllMachinesChartData: () => getAllMachinesChartData(),
  getMachineChartData: (machineId: string) => getMachineChartData(machineId),
  getMachineChartDataWithTimeRange: (machineId: string, startDate: Date, endDate: Date) => 
    getMachineChartDataWithTimeRange(machineId, startDate, endDate),
  getMachineBackupChartData: (machineId: string, backupName: string) => 
    getMachineBackupChartData(machineId, backupName),
  getMachineBackupChartDataWithTimeRange: (machineId: string, backupName: string, startDate: Date, endDate: Date) => 
    getMachineBackupChartDataWithTimeRange(machineId, backupName, startDate, endDate),
  getMachinesSummary: () => getMachinesSummary(),
  getMachinesBackupNames: () => getMachinesBackupNames(),
  
  insertBackup: (data: Parameters<typeof dbOps.insertBackup.run>[0]) => 
    withDb(() => safeDbOperation(() => dbOps.insertBackup.run(data), 'insertBackup')),
  
  upsertMachine: (data: Parameters<typeof dbOps.upsertMachine.run>[0]) => 
    withDb(() => safeDbOperation(() => dbOps.upsertMachine.run(data), 'upsertMachine')),
  
  checkDuplicateBackup: (data: { machine_id: string; backup_name: string; date: string }) =>
    withDb(() => {
      try {
        const result = safeDbOperation(() => dbOps.checkDuplicateBackup.get(data), 'checkDuplicateBackup') as { count: number } | undefined;
        return (result?.count || 0) > 0;
      } catch (error) {
        console.error('Failed to check duplicate backup:', error instanceof Error ? error.message : String(error));
        return false;
      }
    }),
  
  deleteMachine: (machineId: string) => {
    return withDb(() => {
      try {
        const transaction = db.transaction(() => {
          // First get the machine name before deleting
          const machine = safeDbOperation(() => dbOps.getMachine.get(machineId), 'getMachine') as { id: string; name: string } | undefined;
          if (!machine) {
            throw new Error(`Machine with ID ${machineId} not found`);
          }
          
          // First delete all backups for the machine
          const backupResult = safeDbOperation(() => dbOps.deleteMachineBackups.run(machineId), 'deleteMachineBackups');
          // Then delete the machine itself
          const machineResult = safeDbOperation(() => dbOps.deleteMachine.run(machineId), 'deleteMachine');
          
          // Clean up configuration data for this machine
          cleanupMachineConfiguration(machine.name);
          
          return {
            backupChanges: backupResult?.changes || 0,
            machineChanges: machineResult?.changes || 0
          };
        });
        return transaction();
      } catch (error) {
        console.error(`Failed to delete machine ${machineId}:`, error instanceof Error ? error.message : String(error));
        throw error;
      }
    });
  }
}; 

// Helper function to clean up configuration data for a machine
function cleanupMachineConfiguration(machineName: string): void {
  try {
    // Clean up backup_settings
    const backupSettingsJson = getConfiguration('backup_settings');
    if (backupSettingsJson) {
      try {
        const backupSettings = JSON.parse(backupSettingsJson) as Record<BackupKey, BackupNotificationConfig>;
        const updatedBackupSettings: Record<BackupKey, BackupNotificationConfig> = {};
        
        // Keep only entries that don't match the machine name
        for (const [backupKey, settings] of Object.entries(backupSettings)) {
          const [keyMachineName] = backupKey.split(':');
          if (keyMachineName !== machineName) {
            updatedBackupSettings[backupKey] = settings;
          }
        }
        
        // Save the updated backup settings
        setConfiguration('backup_settings', JSON.stringify(updatedBackupSettings));

      } catch (error) {
        console.error('Failed to parse backup_settings during cleanup:', error instanceof Error ? error.message : String(error));
      }
    }
    
    // Clean up overdue_backup_notifications
    const overdueNotificationsJson = getConfiguration('overdue_backup_notifications');
    if (overdueNotificationsJson) {
      try {
        const overdueNotifications = JSON.parse(overdueNotificationsJson) as OverdueNotifications;
        const updatedOverdueNotifications: OverdueNotifications = {};
        
        // Keep only entries that don't match the machine name
        for (const [backupKey, notification] of Object.entries(overdueNotifications)) {
          const [keyMachineName] = backupKey.split(':');
          if (keyMachineName !== machineName) {
            updatedOverdueNotifications[backupKey] = notification;
          }
        }
        
        // Save the updated overdue notifications
        setConfiguration('overdue_backup_notifications', JSON.stringify(updatedOverdueNotifications));

      } catch (error) {
        console.error('Failed to parse overdue_backup_notifications during cleanup:', error instanceof Error ? error.message : String(error));
      }
    }
  } catch (error) {
    console.error(`Failed to cleanup configuration for machine ${machineName}:`, error instanceof Error ? error.message : String(error));
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

// Functions to get/set overdue tolerance config
export function getOverdueToleranceConfig(): OverdueTolerance {
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
}

export function setOverdueToleranceConfig(value: OverdueTolerance): void {
  setConfiguration("overdue_tolerance", value);
}

// Helper function to get overdue backups for a specific machine based on interval calculation
export function getOverdueBackupsForMachine(machineIdentifier: string): Array<{
  machineName: string;
  backupName: string;
  lastBackupDate: string;
  lastNotificationSent: string;
  notificationEvent?: NotificationEvent;
  expectedBackupDate: string;
  expectedBackupElapsed: string;
}> {
  try {
    const backupSettingsJson = getConfiguration('backup_settings');
    if (!backupSettingsJson) return [];
    
    const backupSettings = JSON.parse(backupSettingsJson) as Record<BackupKey, {
      notificationEvent: NotificationEvent;
      expectedInterval: number;
      overdueBackupCheckEnabled: boolean;
      intervalUnit: 'hour' | 'day';
      overdueTolerance?: OverdueTolerance;
    }>;
    
    const overdueBackups: Array<{
      machineName: string;
      backupName: string;
      lastBackupDate: string;
      lastNotificationSent: string;
      notificationEvent?: NotificationEvent;
      expectedBackupDate: string;
      expectedBackupElapsed: string;
    }> = [];
    
    // Get the latest backup for each backup configuration
    for (const backupKey in backupSettings) {
      const [machineName, backupName] = backupKey.split(':');
      
      // Check if this is for the requested machine (by name or ID)
      if (machineName === machineIdentifier || machineName.toLowerCase() === machineIdentifier.toLowerCase()) {
        const settings = backupSettings[backupKey];
        
        // Skip if overdue backup check is not enabled
        if (!settings.overdueBackupCheckEnabled) continue;
        
        // Get machine ID for database lookup
        const machinesSummary = getMachinesSummary();
        const machine = machinesSummary.find(m => m.name === machineName);
        if (!machine) continue;
        
        // Get the latest backup for this machine and backup name
        const latestBackup = dbUtils.getLatestBackupByName(machine.id, backupName) as {
          date: string;
          machine_name: string;
          backup_name?: string;
        } | null;
        
        if (!latestBackup) continue;
        
        // Calculate expected backup date and check if overdue
        const globalTolerance = getOverdueToleranceConfig();
        const expectedBackupDate = calculateExpectedBackupDate(
          latestBackup.date, 
          settings.expectedInterval, 
          settings.intervalUnit,
          globalTolerance
        );
        
        if (expectedBackupDate === 'N/A') continue;
        
        const currentTime = new Date();
        const expectedTime = new Date(expectedBackupDate);
        
        // Check if backup is overdue
        if (currentTime > expectedTime) {
          // Get notification event for this backup
          const notificationEvent = getNotificationEvent(machineName, backupName);
          
          // Calculate elapsed time
          const expectedBackupElapsed = formatTimeElapsed(expectedBackupDate);
          
          // Get last notification sent (if any)
          const lastNotificationSent = getLastNotificationSent(machineName, backupName);
          
          overdueBackups.push({
            machineName,
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
    console.error('Error getting overdue backups for machine:', error instanceof Error ? error.message : String(error));
    return [];
  }
} 



// Function to get ntfy configuration with default topic generation
export async function getNtfyConfig(): Promise<{ url: string; topic: string; accessToken?: string }> {
  try {
    const configJson = getConfiguration('notifications');
    if (configJson) {
      const config = JSON.parse(configJson);
      if (config.ntfy) {
        return config.ntfy;
      }
    }
  } catch (error) {
    console.error('Failed to get ntfy config from notifications:', error instanceof Error ? error.message : String(error));
  }
  
  // Generate default topic if no configuration exists
  const { generateDefaultNtfyTopic, defaultNtfyConfig } = await import('./default-config');
  const defaultTopic = generateDefaultNtfyTopic();
  return { ...defaultNtfyConfig, topic: defaultTopic };
}

// Function to get all machine and their respective backup names
export function getMachinesBackupNames() {
  return withDb(() => safeDbOperation(() => {
    const results = dbOps.getMachinesBackupNames.all() as Array<{ machine_name: string; backup_name: string; server_url: string }>;
    return results.map(row => ({
      id: getBackupKey(row.machine_name, row.backup_name),
      machine_name: row.machine_name,
      backup_name: row.backup_name,
      server_url: row.server_url
    }));
  }, 'getMachinesBackupNames', []));
}

// Function to ensure backup settings are complete for all machines and backups
export async function ensureBackupSettingsComplete(): Promise<{ added: number; total: number }> {
  try {
    // Get current backup settings
    const backupSettingsJson = getConfiguration('backup_settings');
    const currentBackupSettings: Record<BackupKey, BackupNotificationConfig> = backupSettingsJson 
      ? JSON.parse(backupSettingsJson) 
      : {};
    
    // Get all machines with backups
    const machinesSummary = getMachinesBackupNames() as { 
      id: string;
      machine_name: string; 
      backup_name: string;
    }[];


    
    // Create a set of all machine-backup combinations
    const machineBackupCombinations = new Set<string>();
    machinesSummary.forEach(machine => {
      if (machine.id) {
        machineBackupCombinations.add(machine.id);
      }
    });


    
    // Check for missing backup settings and add defaults
    let addedSettings = 0;
    const updatedBackupSettings = { ...currentBackupSettings };
    
    for (const backupKey of machineBackupCombinations) {
      if (!currentBackupSettings[backupKey]) {
        // Import default configuration
        const { defaultBackupNotificationConfig } = await import('./default-config');
        updatedBackupSettings[backupKey] = { ...defaultBackupNotificationConfig };
        addedSettings++;

      }
    }
    
    // Save updated settings if any were added
    if (addedSettings > 0) {
      setConfiguration('backup_settings', JSON.stringify(updatedBackupSettings));
  
    }
    
    return {
      added: addedSettings,
      total: machineBackupCombinations.size
    };
  } catch (error) {
    console.error('Error ensuring backup settings complete:', error instanceof Error ? error.message : String(error));
    return { added: 0, total: 0 };
  }
} 