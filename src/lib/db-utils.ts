import { db, dbOps } from './db';
import { formatDurationFromSeconds } from "@/lib/db";
import type { BackupStatus, NotificationEvent, BackupKey } from "@/lib/types";
import { CronServiceConfig, CronInterval } from './types';
import { cronIntervalMap } from './cron-interval-map';
import type { ResendFrequencyConfig } from "@/lib/types";
import { defaultCronConfig, generateDefaultNtfyTopic, defaultResendFrequencyConfig, defaultNtfyConfig } from './default-config';

// Helper function to get backup key
function getBackupKey(machineName: string, backupName: string): BackupKey {
  return `${machineName}:${backupName}`;
}

// Helper function to check if a backup is missed
function isBackupMissed(machineName: string, backupName: string, lastBackupDate: string | null): boolean {
  try {
    const lastNotificationJson = getConfiguration('missed_backup_notifications');
    if (!lastNotificationJson || !lastBackupDate) return false;
    
    const lastNotifications = JSON.parse(lastNotificationJson) as Record<string, {
      lastNotificationSent: string; // ISO timestamp
      lastBackupDate: string; // ISO timestamp
    }>;
    
    const backupKey = getBackupKey(machineName, backupName);
    const notification = lastNotifications[backupKey];
    
    if (!notification) return false;
    
    const lastBackupDateObj = new Date(lastBackupDate);
    const lastNotificationSent = new Date(notification.lastNotificationSent);
    
    // If lastBackupDate is older than lastNotificationSent, it's a missed backup
    return lastBackupDateObj < lastNotificationSent;
  } catch (error) {
    console.error('Error checking if backup is missed:', error instanceof Error ? error.message : String(error));
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
      missedBackupCheckEnabled: boolean;
      intervalUnit: 'hours' | 'days';
    }>;
    
    const backupKey = getBackupKey(machineName, backupName);
    return backupSettings[backupKey]?.notificationEvent;
  } catch (error) {
    console.error('Error getting notification event:', error instanceof Error ? error.message : String(error));
    return undefined;
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
  const task = config.tasks['missed-backup-check'];
  
  // Find matching interval
  const entry = Object.entries(cronIntervalMap).find(([, value]) => 
    value.expression === task.cronExpression && value.enabled === task.enabled
  );
  
  return entry ? entry[0] as CronInterval : '20min'; // Default to 20min if no match
}

export function setCronInterval(interval: CronInterval): void {
  const config = getCronConfig();
  const { expression, enabled } = cronIntervalMap[interval];
  
  config.tasks['missed-backup-check'] = {
    cronExpression: expression,
    enabled
  };
  
  setCronConfig(config);
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

// Enhanced data functions with better formatting (consolidated from data.ts)
interface MachineSummaryRow {
  machine_id: string;
  name: string;
  last_backup_date: string | null;
  last_backup_id: string | null;
  last_backup_status: BackupStatus | null;
  last_backup_duration: number | null;
  last_backup_list_count: number | null;
  last_backup_name: string | null;
  backup_count: number;
  total_warnings: number;
  total_errors: number;
  available_backups: string | null;
}

export function getMachinesSummary() {
  return withDb(() => {
    const rows = safeDbOperation(() => dbOps.getMachinesSummary.all(), 'getMachinesSummary', []) as MachineSummaryRow[];
    return rows.map(row => {
      // Validate and normalize the backup status
      let normalizedStatus: BackupStatus | 'N/A';
      if (row.last_backup_status === null) {
        normalizedStatus = 'N/A';
      } else {
        // Check if the status is a valid BackupStatus value
        const validStatuses: BackupStatus[] = ['Success', 'Unknown', 'Warning', 'Error', 'Fatal', 'Missed'];
        if (validStatuses.includes(row.last_backup_status as BackupStatus)) {
          normalizedStatus = row.last_backup_status as BackupStatus;
        } else {
          // If it's not a valid status, default to 'Failed'
          normalizedStatus = 'Unknown';
        }
      }

      // Check if backup is missed and override status if needed
      let isMissed : boolean =false;
      if (row.last_backup_name && row.last_backup_date && row.last_backup_date !== 'N/A') {
        isMissed = isBackupMissed(row.name, row.last_backup_name, row.last_backup_date);
      }

      // Get notification event for this backup
      const notificationEvent = row.last_backup_name ? 
        getNotificationEvent(row.name, row.last_backup_name) : 
        undefined;

      return {
        id: row.machine_id,
        name: row.name,
        lastBackupDate: row.last_backup_date || 'N/A',
        lastBackupStatus: normalizedStatus,
        lastBackupDuration: row.last_backup_duration ? formatDurationFromSeconds(row.last_backup_duration) : 'N/A',
        lastBackupListCount: row.last_backup_list_count,
        lastBackupName: row.last_backup_name || null,
        lastBackupId: row.last_backup_id || null,
        backupCount: row.backup_count || 0,
        totalWarnings: row.total_warnings || 0,
        totalErrors: row.total_errors || 0,
        availableBackups: row.available_backups ? JSON.parse(row.available_backups) : null,
        isBackupMissed: isMissed,
        notificationEvent
      };
    });
  });
}

interface MachineRow {
  id: string;
  name: string;
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

// Helper function to count missed backups from configuration
function countMissedBackups(): number {
  try {
    const lastNotificationJson = getConfiguration('missed_backup_notifications');
    if (!lastNotificationJson) return 0;
    
    const lastNotifications = JSON.parse(lastNotificationJson) as Record<string, {
      lastNotificationSent: string; // ISO timestamp
      lastBackupDate: string; // ISO timestamp
    }>;
    
    let missedCount = 0;
    
    for (const backupKey in lastNotifications) {
      const notification = lastNotifications[backupKey];
      const lastBackupDate = new Date(notification.lastBackupDate);
      const lastNotificationSent = new Date(notification.lastNotificationSent);
      
      // If lastBackupDate is older than lastNotificationSent, it's a missed backup
      if (lastBackupDate < lastNotificationSent) {
        missedCount++;
      }
    }
    
    return missedCount;
  } catch (error) {
    console.error('Error counting missed backups:', error instanceof Error ? error.message : String(error));
    return 0;
  }
}

export function getOverallSummary() {
  return withDb(() => {
    const summary = safeDbOperation(() => dbOps.getOverallSummary.get(), 'getOverallSummary') as OverallSummaryRow | undefined;
    if (!summary) {
      return {
        totalMachines: 0,
        totalBackups: 0,
        totalUploadedSize: 0,
        totalStorageUsed: 0,
        totalBackupSize: 0,
        missedBackupsCount: 0
      };
    }

    return {
      totalMachines: summary.total_machines,
      totalBackups: summary.total_backups,
      totalUploadedSize: summary.total_uploaded_size,
      totalStorageUsed: summary.total_storage_used,
      totalBackupSize: summary.total_backuped_size,
      missedBackupsCount: countMissedBackups()
    };
  });
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
  return withDb(() => {
    return safeDbOperation(() => dbOps.getAggregatedChartData.all(), 'getAggregatedChartData', []) as {
      date: string;
      isoDate: string;
      uploadedSize: number;
      duration: number;
      fileCount: number;
      fileSize: number;
      storageSize: number;
      backupVersions: number;
    }[];
  });
}

// Wrapper functions for database operations (keeping for backward compatibility)
export const dbUtils = {
  getMachinesSummary: () => getMachinesSummary(),
  getMachineById: (machineId: string) => getMachineById(machineId),
  getMachineByName: (name: string) => withDb(() => safeDbOperation(() => dbOps.getMachineByName.get(name), 'getMachineByName')),
  getLatestBackup: (machineId: string) => withDb(() => safeDbOperation(() => dbOps.getLatestBackup.get(machineId), 'getLatestBackup')),
  getLatestBackupByName: (machineId: string, backupName: string) => withDb(() => safeDbOperation(() => dbOps.getLatestBackupByName.get(machineId, backupName), 'getLatestBackupByName')),
  getMachineBackups: (machineId: string) => withDb(() => safeDbOperation(() => dbOps.getMachineBackups.all(machineId), 'getMachineBackups', [])),
  getAllMachines: () => getAllMachines(),
  getOverallSummary: () => getOverallSummary(),
  getLatestBackupDate: () => withDb(() => safeDbOperation(() => dbOps.getLatestBackupDate.get(), 'getLatestBackupDate')),
  getAggregatedChartData: () => getAggregatedChartData(),
  
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
          // First delete all backups for the machine
          const backupResult = safeDbOperation(() => dbOps.deleteMachineBackups.run(machineId), 'deleteMachineBackups');
          // Then delete the machine itself
          const machineResult = safeDbOperation(() => dbOps.deleteMachine.run(machineId), 'deleteMachine');
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

// Functions to get/set resend frequency config
export function getResendFrequencyConfig(): ResendFrequencyConfig {
  const value = getConfiguration("resend_frequency");
  if (
    value === "every_day" ||
    value === "every_week" ||
    value === "every_month" ||
    value === "never"
  ) {
    return value;
  }
  return defaultResendFrequencyConfig;
}

export function setResendFrequencyConfig(value: ResendFrequencyConfig): void {
  setConfiguration("resend_frequency", value);
} 

// Helper function to get missed backups for a specific machine
export function getMissedBackupsForMachine(machineIdentifier: string): Array<{
  machineName: string;
  backupName: string;
  lastBackupDate: string;
  lastNotificationSent: string;
  notificationEvent?: NotificationEvent;
}> {
  try {
    const lastNotificationJson = getConfiguration('missed_backup_notifications');
    if (!lastNotificationJson) return [];
    
    const lastNotifications = JSON.parse(lastNotificationJson) as Record<string, {
      lastNotificationSent: string; // ISO timestamp
      lastBackupDate: string; // ISO timestamp
    }>;
    
    const missedBackups: Array<{
      machineName: string;
      backupName: string;
      lastBackupDate: string;
      lastNotificationSent: string;
      notificationEvent?: NotificationEvent;
    }> = [];
    
    for (const backupKey in lastNotifications) {
      const notification = lastNotifications[backupKey];
      const lastBackupDate = new Date(notification.lastBackupDate);
      const lastNotificationSent = new Date(notification.lastNotificationSent);
      
      // Parse the backup key to get machine name and backup name
      const [machineName, backupName] = backupKey.split(':');
      
      // Check if this is for the requested machine (by name or ID)
      if (machineName === machineIdentifier || machineName.toLowerCase() === machineIdentifier.toLowerCase()) {
        // If lastBackupDate is older than lastNotificationSent, it's a missed backup
        if (lastBackupDate < lastNotificationSent) {
          // Get notification event for this backup
          const notificationEvent = getNotificationEvent(machineName, backupName);
          
          missedBackups.push({
            machineName,
            backupName,
            lastBackupDate: notification.lastBackupDate,
            lastNotificationSent: notification.lastNotificationSent,
            notificationEvent
          });
        }
      }
    }
    
    return missedBackups;
  } catch (error) {
    console.error('Error getting missed backups for machine:', error instanceof Error ? error.message : String(error));
    return [];
  }
} 



// Function to get ntfy configuration with default topic generation
export function getNtfyConfig(): { url: string; topic: string } {
  try {
    const configJson = getConfiguration('notifications');
    if (configJson) {
      try {
        const config = JSON.parse(configJson);
        if (config.ntfy && config.ntfy.topic && config.ntfy.topic.trim() !== '') {
          return config.ntfy;
        }
      } catch (parseError) {
        console.error('Failed to parse notifications configuration JSON:', parseError);
        // If JSON is corrupted, we'll fall through to generate a new one
      }
    }
    
    // If no configuration exists or topic is empty, generate default
    const defaultTopic = generateDefaultNtfyTopic();
    const defaultConfig = {
      url: defaultNtfyConfig.url,
      topic: defaultTopic
    };
    
    // Save the default configuration with better error handling
    try {
      let currentConfig: Record<string, unknown> = {};
      if (configJson) {
        try {
          currentConfig = JSON.parse(configJson) as Record<string, unknown>;
        } catch (parseError) {
          console.error('Failed to parse existing config, creating new one:', parseError);
          currentConfig = {};
        }
      }
      
      currentConfig.ntfy = defaultConfig;
      setConfiguration('notifications', JSON.stringify(currentConfig));
    } catch (saveError) {
      console.error('Failed to save default NTFY configuration:', saveError);
      // Don't throw, just return the default config
    }
    
    return defaultConfig;
  } catch (error) {
    console.error('Failed to get NTFY configuration:', error instanceof Error ? error.message : String(error));
    // Return default even if there's an error
    return {
      url: defaultNtfyConfig.url,
      topic: generateDefaultNtfyTopic()
    };
  }
} 