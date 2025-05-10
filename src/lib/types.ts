
export type BackupStatus = "Success" | "Failed" | "InProgress" | "Warning";

export interface Backup {
  id: string;
  name: string;
  date: string; // ISO string
  status: BackupStatus;
  warnings: number;
  errors: number;
  fileCount: number;
  fileSize: number; // in bytes
  uploadedSize: number; // in bytes
  duration: string; // e.g., "30m 15s"
  // Numeric values for charting
  durationInMinutes: number;
}

export interface Machine {
  id: string;
  name: string;
  backups: Backup[];
  // For chart data pre-computation
  chartData: {
    date: string;
    uploadedSize: number; // in bytes
    duration: number; // in minutes
    fileCount: number;
    fileSize: number; // in bytes
  }[];
}

export interface MachineSummary {
  id: string;
  name: string;
  backupCount: number;
  lastBackupStatus: BackupStatus;
  lastBackupDate: string; // ISO string
  lastBackupDuration: string;
  totalWarnings: number;
  totalErrors: number;
}
