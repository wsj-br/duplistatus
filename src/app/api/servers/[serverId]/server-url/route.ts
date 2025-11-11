import { NextRequest, NextResponse } from 'next/server';
import { withDb } from '@/lib/db-utils';
import { dbOps } from '@/lib/db';
import { withCSRF } from '@/lib/csrf-middleware';
import { requireAdmin } from '@/lib/auth-middleware';

interface ServerRow {
  id: string;
  name: string;
  server_url: string;
}

export const GET = withCSRF(async (
  request: NextRequest
) => {
  try {
    // Extract serverId from URL pathname
    const pathname = request.nextUrl.pathname;
    const serverId = pathname.split('/')[3]; // /api/servers/[serverId]/server-url
    
    if (!serverId) {
      return NextResponse.json({ error: 'Server ID is required' }, { status: 400 });
    }

    // Get server data
    const server = withDb(() => {
      return dbOps.getServerById.get(serverId) as ServerRow | undefined;
    });

    if (!server) {
      return NextResponse.json(
        { error: 'Server not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      serverId,
      server_url: server.server_url || ''
    });
  } catch (error) {
    console.error('Error fetching server server URL:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Failed to fetch server URL' },
      { status: 500 }
    );
  }
});

export const PATCH = withCSRF(requireAdmin(async (
  request: NextRequest,
  authContext
) => {
  try {
    // Extract serverId from URL pathname
    const pathname = request.nextUrl.pathname;
    const serverId = pathname.split('/')[3]; // /api/servers/[serverId]/server-url
    
    if (!serverId) {
      return NextResponse.json(
        { error: 'Server ID is required' },
        { status: 400 }
      );
    }
    
    
    const { server_url } = await request.json();

    // Validate URL format
    if (server_url && server_url.trim() !== '') {
      try {
        const url = new URL(server_url);
        if (!['http:', 'https:'].includes(url.protocol)) {
          return NextResponse.json(
            { error: 'URL must use HTTP or HTTPS protocol' },
            { status: 400 }
          );
        }
      } catch {
        return NextResponse.json(
          { error: 'Invalid URL format' },
          { status: 400 }
        );
      }
    }

    // Update server server URL
    const result = withDb(() => {
      return dbOps.updateServerServerUrl.run({
        id: serverId,
        server_url: server_url || ''
      });
    });

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Server not found' },
        { status: 404 }
      );
    }

    // Get the updated server data to include name
    const updatedServer = withDb(() => {
      return dbOps.getServerById .get(serverId) as ServerRow | undefined;
    });

    if (!updatedServer) {
      return NextResponse.json(
        { error: 'Server not found after update' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: 'Server URL updated successfully',
      serverId,
      serverName: updatedServer.name,
      server_url: server_url || ''
    });
  } catch (error) {
    console.error('Error updating server server URL:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Failed to update server URL' },
      { status: 500 }
    );
  }
}));
