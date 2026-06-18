import { NextRequest, NextResponse } from 'next/server';
import { mergeServers, dbUtils } from '@/lib/db-utils';
import { withCSRF } from '@/lib/csrf-middleware';
import { requireAdmin } from '@/lib/auth-middleware';
import { getClientIpAddress } from '@/lib/ip-utils';
import { AuditLogger } from '@/lib/audit-logger';

interface MergeRequest {
  oldServerIds: string[];
  targetServerId: string;
}

export const POST = withCSRF(
  requireAdmin(async (request: NextRequest, authContext) => {
    try {
      const body = await request.json() as MergeRequest;
      
      if (!body.oldServerIds || !Array.isArray(body.oldServerIds) || body.oldServerIds.length === 0) {
        return NextResponse.json(
          { error: 'oldServerIds must be a non-empty array' },
          { status: 400 }
        );
      }
      
      if (!body.targetServerId || typeof body.targetServerId !== 'string') {
        return NextResponse.json(
          { error: 'targetServerId is required' },
          { status: 400 }
        );
      }
      
      // Ensure target server is not in the old server IDs list
      if (body.oldServerIds.includes(body.targetServerId)) {
        return NextResponse.json(
          { error: 'Target server cannot be in the list of servers to merge' },
          { status: 400 }
        );
      }
      
      const targetServer = await dbUtils.getServerById(body.targetServerId);

      const result = await mergeServers(body.oldServerIds, body.targetServerId);
      
      if (!result.success) {
        const ipAddress = getClientIpAddress(request);
        const userAgent = request.headers.get('user-agent') || 'unknown';
        await AuditLogger.log({
          userId: authContext.userId,
          username: authContext.username,
          action: 'servers_merged',
          category: 'server',
          targetType: 'server',
          targetId: body.targetServerId,
          details: {
            serverName: targetServer?.name,
            oldServerIds: body.oldServerIds,
            mergedCount: body.oldServerIds.length,
            error: result.error || 'Failed to merge servers',
          },
          ipAddress,
          userAgent,
          status: 'error',
          errorMessage: result.error || 'Failed to merge servers',
        });

        return NextResponse.json(
          { error: result.error || 'Failed to merge servers' },
          { status: 500 }
        );
      }

      const ipAddress = getClientIpAddress(request);
      const userAgent = request.headers.get('user-agent') || 'unknown';
      await AuditLogger.logServerOperation(
        'servers_merged',
        authContext.userId,
        authContext.username,
        body.targetServerId,
        {
          serverName: targetServer?.name,
          oldServerIds: body.oldServerIds,
          mergedCount: body.oldServerIds.length,
          backupIdsNormalized: result.backupIdsNormalized ?? 0,
        },
        ipAddress,
        userAgent
      );
      
      return NextResponse.json({
        success: true,
        message: `Successfully merged ${body.oldServerIds.length} server(s) into target server`,
        backupIdsNormalized: result.backupIdsNormalized ?? 0,
      });
    } catch (error) {
      console.error('Error merging servers:', error instanceof Error ? error.message : String(error));

      const errorMessage = error instanceof Error ? error.message : 'Failed to merge servers';
      const ipAddress = getClientIpAddress(request);
      const userAgent = request.headers.get('user-agent') || 'unknown';
      await AuditLogger.log({
        userId: authContext.userId,
        username: authContext.username,
        action: 'servers_merged',
        category: 'server',
        targetType: 'server',
        details: {
          error: errorMessage,
        },
        ipAddress,
        userAgent,
        status: 'error',
        errorMessage,
      });

      return NextResponse.json(
        { error: 'Failed to merge servers' },
        { status: 500 }
      );
    }
  })
);
