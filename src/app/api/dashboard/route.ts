import { NextResponse } from 'next/server';
import { getServersSummary, getOverallSummaryFromServers, getAggregatedChartData, clearRequestCache } from '@/lib/db-utils';
import { withCSRF } from '@/lib/csrf-middleware';

export const GET = withCSRF(async () => {
  try {
    // Clear request cache to ensure fresh data on each request
    clearRequestCache();
    
    // Fetch dashboard data efficiently - get serversSummary first, then use it for overallSummary
    const serversSummary = await Promise.resolve(getServersSummary());
    const [overallSummary, chartData] = await Promise.all([
      Promise.resolve(getOverallSummaryFromServers(serversSummary)),
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

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
  }
});
