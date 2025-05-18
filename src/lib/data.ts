import { Machine, MachineSummary, Backup, BackupStatus, OverallSummary } from './types';
import { dbUtils } from './db-utils';

interface MachineSummaryRow {
  id: string;
  name: string;
  last_backup_date: string | null;
  last_backup_status: BackupStatus | null;
  last_backup_duration: number | null;
  last_backup_size: number | null;
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
  backup_name: any;
  id: string;
  name: string;
  machine_id: string;
  date: string;
  status: BackupStatus;
  duration_seconds: number;
  size: number;
  examined_files: number;
  warnings: number;
  errors: number;
  uploaded_size: number;
  known_file_size: number;
}

interface OverallSummaryRow {
  total_machines: number;
  total_backups: number;
  total_uploaded_size: number;
  total_storage_used: number;
}

export async function getMachinesSummary(): Promise<MachineSummary[]> {
  const rows = dbUtils.getMachinesSummary() as MachineSummaryRow[];
  return rows.map(row => ({
    id: row.id,
    name: row.name,
    lastBackupDate: row.last_backup_date || 'N/A',
    lastBackupStatus: row.last_backup_status || 'N/A',
    lastBackupDuration: row.last_backup_duration ? formatDurationFromSeconds(row.last_backup_duration) : 'N/A',
    backupCount: row.backup_count || 0,
    totalWarnings: row.total_warnings || 0,
    totalErrors: row.total_errors || 0
  }));
}

export async function getMachineById(id: string): Promise<Machine | null> {
  const machine = dbUtils.getMachineById(id) as MachineRow | null;
  if (!machine) return null;

  const backups = dbUtils.getMachineBackups(id) as BackupRow[];
  
  // Debug logging for raw backup data
  // console.log('Raw backup data from database:', backups.map(b => ({
  //   id: b.id,
  //   uploaded_size: b.uploaded_size,
  //   known_file_size: b.known_file_size,
  //   size: b.size
  // })));

  const formattedBackups = backups.map(backup => {
    const formatted = {
      id: String(backup.id),
      name: String(backup.backup_name),
      date: backup.date,
      status: backup.status,
      warnings: Number(backup.warnings) || 0,
      errors: Number(backup.errors) || 0,
      fileCount: Number(backup.examined_files) || 0,
      fileSize: Number(backup.size) || 0,
      uploadedSize: Number(backup.uploaded_size) || 0,
      duration: formatDurationFromSeconds(Number(backup.duration_seconds) || 0),
      durationInMinutes: Math.floor((Number(backup.duration_seconds) || 0) / 60),
      knownFileSize: Number(backup.known_file_size) || 0
    };
    
    // // Debug logging for each formatted backup
    // console.log('Formatted backup:', {
    //   id: formatted.id,
    //   uploadedSize: formatted.uploadedSize,
    //   knownFileSize: formatted.knownFileSize
    // });
    
    return formatted;
  });

  // Calculate chart data
  const chartData = formattedBackups.map(backup => {
    const backupDate = new Date(backup.date);
    return {
      date: backupDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      isoDate: backup.date, // Preserve the original ISO date string for accurate filtering
      originalDate: backupDate, // Keep original date for sorting
      uploadedSize: backup.uploadedSize,
      duration: backup.durationInMinutes,
      fileCount: backup.fileCount,
      fileSize: backup.fileSize,
      storageSize: backup.knownFileSize
    };
  }).sort((a, b) => a.originalDate.getTime() - b.originalDate.getTime())
    .map(({ originalDate, ...rest }) => rest); // Remove only originalDate before returning, keep isoDate

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
      
      // Debug logging for raw backup data
      // console.log('Raw backup data for machine', machine.id, ':', backups.map(b => ({
      //   id: b.id,
      //   uploaded_size: b.uploaded_size,
      //   known_file_size: b.known_file_size,
      //   size: b.size
      // })));

      const formattedBackups = backups.map(backup => {
        const formatted = {
          id: String(backup.id),
          name: String(backup.backup_name),
          date: backup.date,
          status: backup.status,
          warnings: Number(backup.warnings) || 0,
          errors: Number(backup.errors) || 0,
          fileCount: Number(backup.examined_files) || 0,
          fileSize: Number(backup.size) || 0,
          uploadedSize: Number(backup.uploaded_size) || 0,
          duration: formatDurationFromSeconds(Number(backup.duration_seconds) || 0),
          durationInMinutes: Math.floor((Number(backup.duration_seconds) || 0) / 60),
          knownFileSize: Number(backup.known_file_size) || 0
        };
        
        // Debug logging for each formatted backup
        // console.log('Formatted backup for machine', machine.id, ':', {
        //   id: formatted.id,
        //   uploadedSize: formatted.uploadedSize,
        //   knownFileSize: formatted.knownFileSize
        // });
        
        return formatted;
      });

      const chartData = formattedBackups.map(backup => {
        const backupDate = new Date(backup.date);
        return {
          date: backupDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }),
          isoDate: backup.date, // Preserve the original ISO date string for accurate filtering
          originalDate: backupDate, // Keep original date for sorting
          uploadedSize: backup.uploadedSize,
          duration: backup.durationInMinutes,
          fileCount: backup.fileCount,
          fileSize: backup.fileSize,
          storageSize: backup.knownFileSize
        };
      }).sort((a, b) => a.originalDate.getTime() - b.originalDate.getTime())
        .map(({ originalDate, ...rest }) => rest); // Remove only originalDate before returning, keep isoDate

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
      totalStorageUsed: 0
    };
  }

  return {
    totalMachines: summary.total_machines,
    totalBackups: summary.total_backups,
    totalUploadedSize: summary.total_uploaded_size,
    totalStorageUsed: summary.total_storage_used
  };
}

// Helper function to format duration from seconds
function formatDurationFromSeconds(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}
