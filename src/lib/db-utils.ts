import { db, dbOps } from './db';
import { formatDurationFromSeconds } from "@/lib/db";
import type { BackupStatus } from "@/lib/types";
import { CronServiceConfig, CronInterval } from './types';
import { cronIntervalMap } from './cron-interval-map';
import type { ResendFrequencyConfig } from "@/lib/types";

// Default cron service configuration
const defaultCronConfig: CronServiceConfig = {
  port: 9667,
  tasks: {
    'missed-backup-check': {
      cronExpression: '0,20,40 * * * *', // Every 20 minutes
      enabled: true
    }
  }
};

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
    console.error('Failed to load cron service configuration:', error);
  }
  return defaultCronConfig;
}

export function setCronConfig(config: CronServiceConfig): void {
  try {
    setConfiguration('cron_service', JSON.stringify(config));
  } catch (error) {
    console.error('Failed to save cron service configuration:', error);
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
    console.error('Database operation failed:', error);
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
    console.error(`Database operation '${operationName}' failed:`, error);
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
      console.error(`Failed to get configuration for key '${key}':`, error);
      return null;
    }
  });
}

export function setConfiguration(key: string, value: string): void {
  withDb(() => {
    try {
      db.prepare('INSERT OR REPLACE INTO configurations (key, value) VALUES (?, ?)').run(key, value);
    } catch (error) {
      console.error(`Failed to set configuration for key '${key}':`, error);
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
        const validStatuses: BackupStatus[] = ['Success', 'Failed', 'InProgress', 'Warning', 'Fatal'];
        if (validStatuses.includes(row.last_backup_status as BackupStatus)) {
          normalizedStatus = row.last_backup_status as BackupStatus;
        } else {
          // If it's not a valid status, default to 'Failed'
          normalizedStatus = 'Failed';
        }
      }

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
        availableBackups: row.available_backups ? JSON.parse(row.available_backups) : null
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
    console.error('Error counting missed backups:', error);
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
      console.error(`Failed to get machine by ID ${machineId}:`, error);
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
        console.error('Failed to check duplicate backup:', error);
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
        console.error(`Failed to delete machine ${machineId}:`, error);
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
  return "never";
}

export function setResendFrequencyConfig(value: ResendFrequencyConfig): void {
  setConfiguration("resend_frequency", value);
} 