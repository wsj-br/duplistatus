import { NextResponse } from 'next/server';
import { mergeServers } from '@/lib/db-utils';
import { withCSRF } from '@/lib/csrf-middleware';
import { requireAdmin } from '@/lib/auth-middleware';

interface MergeRequest {
  oldServerIds: string[];
  targetServerId: string;
}

export const POST = withCSRF(
  requireAdmin(async (request, context) => {
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
      
      const result = await mergeServers(body.oldServerIds, body.targetServerId);
      
      if (!result.success) {
        return NextResponse.json(
          { error: result.error || 'Failed to merge servers' },
          { status: 500 }
        );
      }
      
      return NextResponse.json({
        success: true,
        message: `Successfully merged ${body.oldServerIds.length} server(s) into target server`
      });
    } catch (error) {
      console.error('Error merging servers:', error instanceof Error ? error.message : String(error));
      return NextResponse.json(
        { error: 'Failed to merge servers' },
        { status: 500 }
      );
    }
  })
);
