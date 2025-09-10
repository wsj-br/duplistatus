"use server";

import { NextResponse } from 'next/server';
import { dbUtils } from '@/lib/db-utils';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ serverId: string }> }
) {
  try {
    const { serverId } = await params;
    
    const server = await dbUtils.getServerById(serverId);
    
    if (!server) {
      return NextResponse.json({ error: 'Server not found' }, { status: 404 });
    }
    
    return NextResponse.json(server);
  } catch (error) {
    console.error('Error fetching server:', error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: 'Failed to fetch server' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ serverId: string }> }
) {
  try {
    const { serverId } = await params;
    
    // Delete the server and its backups
    const result = dbUtils.deleteServer(serverId);

    return NextResponse.json({
      message: `Successfully deleted server and ${result.backupChanges} backups`,
      status: 200,
      changes: result
    });
  } catch (error) {
    console.error('Error deleting server:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Failed to delete server' },
      { status: 500 }
    );
  }
}
