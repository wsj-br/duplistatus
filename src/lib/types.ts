
export type BackupStatus = "Success" | "Failed" | "InProgress" | "Warning";

export interface Backup {
  id: string;
  name: string;
  date: string; // ISO string
  status: BackupStatus;
  warnings: number;
  errors: number;
  fileCount: number;
  fileSize: string; // e.g., "1.2 GB"
  uploadedSize: string; // e.g., "500 MB"
  duration: string; // e.g., "30m 15s"
  // Numeric values for charting
  fileSizeInMB: number;
  uploadedSizeInMB: number;
  durationInMinutes: number;
}

export interface Machine {
  id: string;
  name: string;
  backups: Backup[];
  // For chart data pre-computation
  chartData: {
    date: string;
    uploadedSize: number;
    duration: number;
    fileCount: number;
    fileSize: number;
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
