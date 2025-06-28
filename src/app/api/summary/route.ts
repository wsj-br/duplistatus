import { NextResponse } from 'next/server';
import { dbUtils } from '@/lib/db-utils';
import type { OverallSummary } from '@/lib/types';

interface OverallSummaryRow {
  total_machines: number;
  total_backups: number;
  total_uploaded_size: number;
  total_storage_used: number;
  total_backuped_size: number;
}

export async function GET() {
  try {
    // Get the overall summary from the database using dbUtils
    const rawSummary = dbUtils.getOverallSummary() as OverallSummaryRow;
    
    // Transform the data
    const summary: OverallSummary = {
      totalMachines: Number(rawSummary.total_machines) || 0,
      totalBackups: Number(rawSummary.total_backups) || 0,
      totalUploadedSize: Number(rawSummary.total_uploaded_size) || 0,
      totalStorageUsed: Number(rawSummary.total_storage_used) || 0,
      totalBackupSize: Number(rawSummary.total_backuped_size) || 0
    };

    // Get the latest backup date across all machines
    const latestBackup = dbUtils.getLatestBackupDate() as { last_backup_date: string | null };
        
    // Calculate the time difference in seconds
    const lastBackupDate = latestBackup?.last_backup_date ? new Date(latestBackup.last_backup_date) : null;
    const now = new Date();
    const secondsSinceLastBackup = lastBackupDate ? Math.floor((now.getTime() - lastBackupDate.getTime()) / 1000) : null;

    const response = {
      totalMachines: summary.totalMachines,
      totalBackups: summary.totalBackups,
      totalUploadedSize: summary.totalUploadedSize,
      totalStorageUsed: summary.totalStorageUsed,
      totalBackupSize: summary.totalBackupSize,
      secondsSinceLastBackup
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch summary data' },
      { status: 500 }
    );
  }
} 