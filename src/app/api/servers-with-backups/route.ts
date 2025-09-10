import { NextResponse } from 'next/server';
import { dbUtils } from '@/lib/db-utils';

export async function GET() {
  try {
    const serversBackupNames = dbUtils.getServersBackupNames();
    
    // Transform the data to include server name and backup name
    const serversWithBackups = (serversBackupNames as { 
      id: string; 
      server_id: string;
      server_name: string; 
      backup_name: string;
      server_url: string;
    }[]).map((server) => ({
      id: server.server_id,
      name: server.server_name,
      backupName: server.backup_name,
      server_url: server.server_url
    }));

    return NextResponse.json(serversWithBackups);
  } catch (error) {
    console.error('Error fetching servers with backups:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Failed to fetch servers with backups' },
      { status: 500 }
    );
  }
} 