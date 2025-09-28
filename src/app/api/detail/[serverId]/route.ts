import { NextResponse } from 'next/server';
import { getServerById, getOverdueBackupsForServer, getLastOverdueBackupCheckTime, clearRequestCache } from '@/lib/db-utils';
import { withCSRF } from '@/lib/csrf-middleware';

export const GET = withCSRF(async (
  request: Request,
  { params }: { params: Promise<{ serverId: string }> }
) => {
  try {
    // Clear request cache to ensure fresh data on each request
    clearRequestCache();
    
    const { serverId } = await params;
    
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
