import { NextRequest, NextResponse } from 'next/server';
import { ensureDatabaseInitialized } from '@/lib/db';
import { AuditLogger } from '@/lib/audit-logger';
import { withCSRF } from '@/lib/csrf-middleware';
import { requireAuth } from '@/lib/auth-middleware';

// GET /api/audit-log/stats - Get audit log statistics
export const GET = withCSRF(requireAuth(async (request: NextRequest) => {
  try {
    await ensureDatabaseInitialized();

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7', 10);

    // Get statistics
    const stats = await AuditLogger.getStats(days);

    return NextResponse.json(stats);

  } catch (error) {
    console.error('[AuditLog] Stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}));

