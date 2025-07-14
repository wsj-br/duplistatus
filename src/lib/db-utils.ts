import { db, dbOps } from './db';
import { formatDurationFromSeconds } from "@/lib/db";
import type { Machine, Backup, BackupStatus } from "@/lib/types";

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

// Wrapper functions for database operations
export const dbUtils = {
  getMachinesSummary: () => withDb(() => safeDbOperation(() => dbOps.getMachinesSummary.all(), 'getMachinesSummary', [])),
  
  getMachineById: (machineId: string): Machine | null => {
    return withDb(() => {
      try {
        const machine = safeDbOperation(() => dbOps.getMachine.get(machineId), 'getMachine') as { id: string; name: string } | undefined;
        if (!machine) return null;

        const backups = safeDbOperation(() => dbOps.getMachineBackups.all(machineId), 'getMachineBackups', []) as BackupRecord[];
        
        const formattedBackups = backups.map((backup): Backup => ({
          id: backup.id,
          machine_id: backup.machine_id,
          name: backup.backup_name,
          date: backup.date,
          status: backup.status,
          warnings: backup.warnings || 0,
          errors: backup.errors || 0,
          messages: backup.messages_actual_length || 0,
          fileCount: backup.examined_files || 0,
          fileSize: backup.size || 0,
          uploadedSize: backup.uploaded_size || 0,
          duration: formatDurationFromSeconds(backup.duration_seconds || 0),
          duration_seconds: backup.duration_seconds || 0,
          durationInMinutes: (backup.duration_seconds || 0) / 60,
          knownFileSize: backup.known_file_size || 0,
          backup_list_count: backup.backup_list_count || 0,
          messages_array: backup.messages_array,
          warnings_array: backup.warnings_array,
          errors_array: backup.errors_array,
          available_backups: backup.available_backups ? JSON.parse(backup.available_backups) : []
        }));

        // Calculate chart data
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
  },
  
  getMachineByName: (name: string) => withDb(() => safeDbOperation(() => dbOps.getMachineByName.get(name), 'getMachineByName')),
  getLatestBackup: (machineId: string) => withDb(() => safeDbOperation(() => dbOps.getLatestBackup.get(machineId), 'getLatestBackup')),
  getMachineBackups: (machineId: string) => withDb(() => safeDbOperation(() => dbOps.getMachineBackups.all(machineId), 'getMachineBackups', [])),
  getAllMachines: () => withDb(() => safeDbOperation(() => dbOps.getAllMachines.all(), 'getAllMachines', [])),
  getOverallSummary: () => withDb(() => safeDbOperation(() => dbOps.getOverallSummary.get(), 'getOverallSummary')),
  getLatestBackupDate: () => withDb(() => safeDbOperation(() => dbOps.getLatestBackupDate.get(), 'getLatestBackupDate')),
  getAggregatedChartData: () => withDb(() => safeDbOperation(() => dbOps.getAggregatedChartData.all(), 'getAggregatedChartData', [])),
  
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