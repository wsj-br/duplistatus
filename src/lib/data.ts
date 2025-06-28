import { Machine, MachineSummary, BackupStatus, OverallSummary } from './types';
import { dbUtils } from './db-utils';

interface MachineSummaryRow {
  id: number;
  machine_id: string;
  name: string;
  last_backup_date: string | null;
  last_backup_status: BackupStatus | null;
  last_backup_duration: number | null;
  last_backup_list_count: number | null;
  last_backup_name: string | null;
  backup_count: number;
  total_warnings: number;
  total_errors: number;
}

interface MachineRow {
  id: string;
  name: string;
  backups: BackupRow[];
}

interface BackupRow {
  backup_name: string;
  id: string;
  machine_id: string;
  name: string;
  date: string;
  status: BackupStatus;
  duration_seconds: number;
  size: number;
  examined_files: number;
  warnings: number;
  errors: number;
  uploaded_size: number;
  known_file_size: number;
  backup_list_count: number | null;
  messages_array: string | null;
  warnings_array: string | null;
  errors_array: string | null;
  warnings_actual_length: number;
  errors_actual_length: number;
  messages_actual_length: number;
}

interface OverallSummaryRow {
  total_machines: number;
  total_backups: number;
  total_uploaded_size: number;
  total_storage_used: number;
  total_backuped_size: number;
}

export async function getMachinesSummary(): Promise<MachineSummary[]> {
  const rows = dbUtils.getMachinesSummary() as MachineSummaryRow[];
  return rows.map(row => ({
    id: row.machine_id,
    name: row.name,
    lastBackupDate: row.last_backup_date || 'N/A',
    lastBackupStatus: row.last_backup_status || 'N/A',
    lastBackupDuration: row.last_backup_duration ? formatDurationFromSeconds(row.last_backup_duration) : 'N/A',
    lastBackupListCount: row.last_backup_list_count,
    lastBackupName: row.last_backup_name || null,
    backupCount: row.backup_count || 0,
    totalWarnings: row.total_warnings || 0,
    totalErrors: row.total_errors || 0
  }));
}

export async function getMachineById(id: string): Promise<Machine | null> {
  const machine = dbUtils.getMachineById(id) as MachineRow | null;
  if (!machine) return null;

  const backups = dbUtils.getMachineBackups(id) as BackupRow[];
  
  const formattedBackups = backups.map(backup => {
    const formatted = {
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
      errors_array: backup.errors_array
    };
    
    return formatted;
  });

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
}

export async function getAllMachines(): Promise<Machine[]> {
  const machines = await Promise.all(
    (dbUtils.getAllMachines() as MachineRow[]).map(async machine => {
      const backups = dbUtils.getMachineBackups(machine.id) as BackupRow[];
      

      const formattedBackups = backups.map(backup => {
        const formatted = {
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
          errors_array: backup.errors_array
        };
        
       
        return formatted;
      });

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
    })
  );

  return machines;
}

export async function getOverallSummary(): Promise<OverallSummary> {
  const summary = dbUtils.getOverallSummary() as OverallSummaryRow;
  if (!summary) {
    return {
      totalMachines: 0,
      totalBackups: 0,
      totalUploadedSize: 0,
      totalStorageUsed: 0,
      totalBackupSize: 0
    };
  }

  return {
    totalMachines: summary.total_machines,
    totalBackups: summary.total_backups,
    totalUploadedSize: summary.total_uploaded_size,
    totalStorageUsed: summary.total_storage_used,
    totalBackupSize: summary.total_backuped_size
  };
}

export async function getAggregatedChartData(): Promise<{
  date: string;
  isoDate: string;
  uploadedSize: number;
  duration: number;
  fileCount: number;
  fileSize: number;
  storageSize: number;
  backupVersions: number;
}[]> {
  return dbUtils.getAggregatedChartData() as {
    date: string;
    isoDate: string;
    uploadedSize: number;
    duration: number;
    fileCount: number;
    fileSize: number;
    storageSize: number;
    backupVersions: number;
  }[];
}

// Helper function to format duration from seconds
function formatDurationFromSeconds(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}
