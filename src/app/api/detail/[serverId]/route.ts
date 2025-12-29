import { NextResponse } from 'next/server';
import { getServerById, getOverdueBackupsForServer, getLastOverdueBackupCheckTime, clearRequestCache, invalidateDataCache } from '@/lib/db-utils';
import { withCSRF } from '@/lib/csrf-middleware';

// Force dynamic rendering and disable all caching in production
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export const GET = withCSRF(async (
  request: Request,
  { params }: { params: Promise<{ serverId: string }> }
) => {
  try {
    // Clear and invalidate all caches to ensure fresh data on each request
    // This is especially important in production mode where module-level cache might persist
    if (process.env.NODE_ENV === 'production') {
      console.log('[API] /api/detail/[serverId] - Starting request, clearing caches...');
    }
    invalidateDataCache();
    clearRequestCache();
    
    const { serverId } = await params;
    
    if (process.env.NODE_ENV === 'production') {
      console.log(`[API] /api/detail/[serverId] - Caches cleared, fetching data for server: ${serverId}`);
    }
    
    // Get server data
    const server = await getServerById(serverId);
    if (!server) {
      return NextResponse.json(
        { error: 'Server not found' },
        { status: 404 }
      );
    }

    // Get overdue backups for this server
    const overdueBackups = await getOverdueBackupsForServer(server.id);

    // Get the last overdue backup check time
    const lastOverdueCheck = getLastOverdueBackupCheckTime();

    if (process.env.NODE_ENV === 'production') {
      console.log(`[API] /api/detail/[serverId] - Data fetched successfully for server: ${serverId}, returning response`);
    }

    return NextResponse.json({
      server,
      overdueBackups,
      lastOverdueCheck
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Error fetching server details:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Failed to fetch server details' },
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
