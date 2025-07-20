import { NextResponse } from 'next/server';
import { getOverallSummary, dbUtils } from '@/lib/db-utils';

export async function GET() {
  try {
    // Get the overall summary from the database using the consolidated function
    const summary = getOverallSummary();

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