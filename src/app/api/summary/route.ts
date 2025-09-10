import { NextResponse } from 'next/server';
import { getOverallSummary, dbUtils } from '@/lib/db-utils';

export async function GET() {
  try {
    // Get the overall summary from the database using the consolidated function
    const summary = getOverallSummary();
    
    if (!summary) {
      console.error('getOverallSummary returned null or undefined');
      return NextResponse.json(
        { error: 'Failed to fetch summary data - summary is null' },
        { status: 500 }
      );
    }

    // Get the latest backup date across all servers
    let latestBackup: { last_backup_date: string | null } | null = null;
    try {
      latestBackup = dbUtils.getLatestBackupDate() as { last_backup_date: string | null };
    } catch (error) {
      console.error('Error getting latest backup date:', error instanceof Error ? error.message : String(error));
      latestBackup = null;
    }
        
    // Calculate the time difference in seconds
    const lastBackupDate = latestBackup?.last_backup_date ? new Date(latestBackup.last_backup_date) : null;
    const now = new Date();
    const secondsSinceLastBackup = lastBackupDate ? Math.floor((now.getTime() - lastBackupDate.getTime()) / 1000) : null;

    const response = {
      totalServers: summary.totalServers || 0,
      totalBackups: summary.totalBackups || 0,
      totalUploadedSize: summary.totalUploadedSize || 0,
      totalStorageUsed: summary.totalStorageUsed || 0,
      totalBackupSize: summary.totalBackupSize || 0,
      overdueBackupsCount: summary.overdueBackupsCount || 0,
      secondsSinceLastBackup
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching summary:', error instanceof Error ? error.message : String(error));
    
    // Return a fallback response instead of an error to prevent JSON parsing issues
    const fallbackResponse = {
      totalServers: 0,
      totalBackups: 0,
      totalUploadedSize: 0,
      totalStorageUsed: 0,
      totalBackupSize: 0,
      overdueBackupsCount: 0,
      secondsSinceLastBackup: null
    };
    
    return NextResponse.json(fallbackResponse);
  }
} 