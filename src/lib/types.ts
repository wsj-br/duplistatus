export type BackupStatus = "Success" | "Failed" | "InProgress" | "Warning" | "Fatal";

export interface Backup {
  id: string;
  machine_id: string;
  name: string;
  date: string; // ISO string
  status: BackupStatus;
  warnings: number;
  errors: number;
  messages: number;
  fileCount: number;
  fileSize: number; // in bytes
  uploadedSize: number; // in bytes
  duration: string; // e.g., "30m 15s"
  duration_seconds: number; // raw duration in seconds
  // Numeric values for charting
  durationInMinutes: number;
  knownFileSize: number;
  backup_list_count: number | null;
  // Message arrays stored as JSON strings
  messages_array: string | null;
  warnings_array: string | null;
  errors_array: string | null;
}

export interface Machine {
  id: string;
  name: string;
  backups: Backup[];
  // For chart data pre-computation
  chartData: {
    date: string;
    isoDate: string; // ISO date string for accurate date filtering
    uploadedSize: number; // in bytes
    duration: number; // in minutes
    fileCount: number;
    fileSize: number; // in bytes
    storageSize: number; // in bytes
    backupVersions: number; // available backup versions
  }[];
}

export interface MachineSummary {
  id: string;
  name: string;
  backupCount: number;
  lastBackupStatus: BackupStatus | 'N/A';
  lastBackupDate: string; // ISO string or "N/A"
  lastBackupDuration: string; // or "N/A"
  lastBackupListCount: number | null;
  lastBackupName: string | null;
  totalWarnings: number;
  totalErrors: number;
}

export interface OverallSummary {
  totalMachines: number;
  totalBackups: number;
  totalUploadedSize: number; // in bytes
  totalStorageUsed: number; // in bytes (sum of all backup.fileSize)
  totalBackupedSize: number; // in bytes (sum of size_of_examined_files from latest backups)
}
