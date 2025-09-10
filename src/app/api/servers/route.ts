import { NextResponse } from 'next/server';
import { dbUtils } from '@/lib/db-utils';

export async function GET() {
  try {
    const servers = dbUtils.getAllServers();
    
    // Transform the data to include only id and name for the dropdown
    const serverList = (servers as { id: string; name: string }[]).map((server) => ({
      id: server.id,
      name: server.name
    }));

    return NextResponse.json(serverList);
  } catch (error) {
    console.error('Error fetching servers:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Failed to fetch servers' },
      { status: 500 }
    );
  }
} 