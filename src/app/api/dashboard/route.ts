import { NextResponse } from 'next/server';
import { getServersSummary, getOverallSummaryFromServers, getAggregatedChartData, clearRequestCache, invalidateDataCache } from '@/lib/db-utils';
import { withCSRF } from '@/lib/csrf-middleware';

// Force dynamic rendering and disable all caching in production
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export const GET = withCSRF(async () => {
  try {
    // Clear and invalidate all caches to ensure fresh data on each request
    // This is especially important in production mode where module-level cache might persist
    if (process.env.NODE_ENV === 'production') {
      console.log('[API] /api/dashboard - Starting request, clearing caches...');
    }
    invalidateDataCache();
    clearRequestCache();
    
    if (process.env.NODE_ENV === 'production') {
      console.log('[API] /api/dashboard - Caches cleared, fetching data...');
    }
    
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

    if (process.env.NODE_ENV === 'production') {
      console.log('[API] /api/dashboard - Data fetched successfully, returning response');
      console.log(`[API] /api/dashboard - Response summary: ${serversSummary.length} servers, ${chartData.length} chart data points`);
    }

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
