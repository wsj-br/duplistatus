import { NextResponse, NextRequest } from 'next/server';
import { dbUtils } from '@/lib/db-utils';
import { withCSRF } from '@/lib/csrf-middleware';
import { getAuthContext } from '@/lib/auth-middleware';
import { getClientIpAddress } from '@/lib/ip-utils';
import { AuditLogger } from '@/lib/audit-logger';

export const GET = withCSRF(async (
  request: Request,
  { params }: { params: Promise<{ serverId: string }> }
) => {
  try {
    const { serverId } = await params;
    const { searchParams } = new URL(request.url);
    const includeBackups = searchParams.get('includeBackups') === 'true';
    const includeChartData = searchParams.get('includeChartData') === 'true';
    
    const server = await dbUtils.getServerById(serverId);
    
    if (!server) {
      return NextResponse.json({ error: 'Server not found' }, { status: 404 });
    }
    
    // If no specific data is requested, return basic server info
    if (!includeBackups && !includeChartData) {
      return NextResponse.json({
        id: server.id,
        name: server.name,
        alias: server.alias,
        note: server.note,
        server_url: server.server_url
      });
    }
    
    // Return full server data if any additional data is requested
    return NextResponse.json(server);
  } catch (error) {
    console.error('Error fetching server:', error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: 'Failed to fetch server' }, { status: 500 });
  }
});

export const PATCH = withCSRF(async (
  request: NextRequest,
  { params }: { params: Promise<{ serverId: string }> }
) => {
  const authContext = await getAuthContext(request);
  try {
    const { serverId } = await params;
    
    
    const body = await request.json();
    const { server_url, alias, note } = body;
    
    // Get server info before update for audit log
    const serverBefore = await dbUtils.getServerById(serverId);
    
    // Update server details
    const result = dbUtils.updateServer(serverId, {
      server_url: server_url || '',
      alias: alias || '',
      note: note || ''
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Server not found' },
        { status: 404 }
      );
    }

    // Log audit event
    if (authContext && serverBefore) {
      const ipAddress = getClientIpAddress(request);
      await AuditLogger.logServerOperation(
        'server_updated',
        authContext.userId,
        authContext.username,
        serverId,
        {
          serverName: serverBefore.name,
          changes: {
            server_url: server_url || serverBefore.server_url,
            alias: alias || serverBefore.alias,
            note: note || serverBefore.note,
          },
        },
        ipAddress
      );
    }

    return NextResponse.json({
      message: 'Server updated successfully',
      serverId,
      server_url: server_url || '',
      alias: alias || '',
      note: note || ''
    });
  } catch (error) {
    console.error('Error updating server:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Failed to update server' },
      { status: 500 }
    );
  }
});

export const DELETE = withCSRF(async (
  request: NextRequest,
  { params }: { params: Promise<{ serverId: string }> }
) => {
  const authContext = await getAuthContext(request);
  try {
    const { serverId } = await params;
    
    // Get server info before deletion for audit log
    const serverBefore = await dbUtils.getServerById(serverId);
    
    // Delete the server and its backups
    const result = dbUtils.deleteServer(serverId);

    // Log audit event
    if (authContext && serverBefore) {
      const ipAddress = getClientIpAddress(request);
      await AuditLogger.logServerOperation(
        'server_deleted',
        authContext.userId,
        authContext.username,
        serverId,
        {
          serverName: serverBefore.name,
          backupChanges: result.backupChanges,
        },
        ipAddress
      );
    }

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
});
