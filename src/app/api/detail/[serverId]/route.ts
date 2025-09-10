import { NextResponse } from 'next/server';
import { getServerById, getOverdueBackupsForServer, getLastOverdueBackupCheckTime } from '@/lib/db-utils';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ serverId: string }> }
) {
  try {
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
    const overdueBackups = getOverdueBackupsForServer(server.name);

    // Get the last overdue backup check time
    const lastOverdueCheck = getLastOverdueBackupCheckTime();

    return NextResponse.json({
      server,
      overdueBackups,
      lastOverdueCheck
    });
  } catch (error) {
    console.error('Error fetching server details:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Failed to fetch server details' },
      { status: 500 }
    );
  }
}
