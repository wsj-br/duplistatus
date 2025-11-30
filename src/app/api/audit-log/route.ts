import { NextRequest, NextResponse } from 'next/server';
import { ensureDatabaseInitialized } from '@/lib/db';
import { AuditLogger, type AuditLogFilter, type AuditCategory } from '@/lib/audit-logger';
import { withCSRF } from '@/lib/csrf-middleware';
import { requireAuth } from '@/lib/auth-middleware';

// GET /api/audit-log - List audit logs with filtering and pagination
export const GET = withCSRF(requireAuth(async (request: NextRequest) => {
  try {
    await ensureDatabaseInitialized();

    const { searchParams } = new URL(request.url);
    
    // Parse query parameters - support both page-based and offset-based pagination
    const pageParam = searchParams.get('page');
    const offsetParam = searchParams.get('offset');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    
    let offset: number;
    let page: number;
    
    if (offsetParam !== null) {
      // Offset-based pagination (for endless scroll)
      offset = parseInt(offsetParam, 10);
      page = Math.floor(offset / limit) + 1;
    } else {
      // Page-based pagination (backward compatibility)
      page = parseInt(pageParam || '1', 10);
      offset = (page - 1) * limit;
    }

    // Build filter object
    const categoryParam = searchParams.get('category');
    const filter: AuditLogFilter = {
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      userId: searchParams.get('userId') || undefined,
      username: searchParams.get('username') || undefined,
      action: searchParams.get('action') || undefined,
      category: categoryParam ? (categoryParam as AuditCategory) : undefined,
      status: searchParams.get('status') as 'success' | 'failure' | 'error' | undefined,
      limit,
      offset,
    };

    // Query audit logs
    const { logs, total } = await AuditLogger.query(filter);

    // Parse details JSON for each log
    const formattedLogs = logs.map(log => ({
      ...log,
      details: log.details ? JSON.parse(log.details) : null,
    }));

    return NextResponse.json({
      logs: formattedLogs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('[AuditLog] List error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}));

