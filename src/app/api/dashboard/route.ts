import { NextResponse } from 'next/server';
import { getServersSummary, getOverallSummary, getAggregatedChartData } from '@/lib/db-utils';

export async function GET() {
  try {
    // Fetch all dashboard data in parallel for better performance
    const [serversSummary, overallSummary, chartData] = await Promise.all([
      Promise.resolve(getServersSummary()),
      Promise.resolve(getOverallSummary()),
      Promise.resolve(getAggregatedChartData())
    ]);

    // Validate that we got valid data
    if (!serversSummary || !overallSummary || !Array.isArray(chartData)) {
      throw new Error('Invalid data received from database functions');
    }

    // Get the latest backup date across all servers for secondsSinceLastBackup calculation
    let latestBackup: { last_backup_date: string | null } | null = null;
    try {
      const { dbUtils } = await import('@/lib/db-utils');
      latestBackup = dbUtils.getLatestBackupDate() as { last_backup_date: string | null };
    } catch (error) {
      console.error('Error getting latest backup date:', error instanceof Error ? error.message : String(error));
      latestBackup = null;
    }
        
    // Calculate the time difference in seconds
    const lastBackupDate = latestBackup?.last_backup_date ? new Date(latestBackup.last_backup_date) : null;
    const now = new Date();
    const secondsSinceLastBackup = lastBackupDate ? Math.floor((now.getTime() - lastBackupDate.getTime()) / 1000) : null;

    // Enhance overall summary with secondsSinceLastBackup
    const enhancedOverallSummary = {
      ...overallSummary,
      secondsSinceLastBackup
    };

    const response = {
      serversSummary,
      overallSummary: enhancedOverallSummary,
      chartData
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching dashboard data:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
