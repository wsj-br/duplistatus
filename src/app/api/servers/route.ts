import { NextResponse } from 'next/server';
import { dbUtils } from '@/lib/db-utils';
import { withCSRF } from '@/lib/csrf-middleware';

export const GET = withCSRF(async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url);
    const includeBackups = searchParams.get('includeBackups') === 'true';
    
    if (includeBackups) {
      // Return servers with backup information (consolidates /api/servers-with-backups functionality)
      const serversBackupNames = dbUtils.getServersBackupNames();
      
      // Transform the data to include server name and backup name
      const serversWithBackups = (serversBackupNames as { 
        id: string; 
        server_id: string;
        server_name: string; 
        backup_name: string;
        server_url: string;
        alias: string;
        note: string;
        hasPassword: boolean;
      }[]).map((server) => ({
        id: server.server_id,
        name: server.server_name,
        backupName: server.backup_name,
        server_url: server.server_url,
        alias: server.alias,
        note: server.note,
        hasPassword: server.hasPassword
      }));

      return NextResponse.json(serversWithBackups);
    } else {
      // Return basic server information (original functionality)
      const servers = dbUtils.getAllServers();
      
      // Transform the data to include server information with new fields
      const serverList = (servers as { id: string; name: string; alias: string; note: string }[]).map((server) => ({
        id: server.id,
        name: server.name,
        alias: server.alias,
        note: server.note
      }));

      return NextResponse.json(serverList);
    }
  } catch (error) {
    console.error('Error fetching servers:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Failed to fetch servers' },
      { status: 500 }
    );
  }
}); 