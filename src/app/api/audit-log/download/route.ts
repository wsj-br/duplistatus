import { NextRequest, NextResponse } from 'next/server';
import { ensureDatabaseInitialized } from '@/lib/db';
import { AuditLogger, type AuditLogFilter, type AuditCategory } from '@/lib/audit-logger';
import { withCSRF } from '@/lib/csrf-middleware';
import { requireAuth } from '@/lib/auth-middleware';

// GET /api/audit-log/download - Download audit logs as CSV or JSON
export const GET = withCSRF(requireAuth(async (request: NextRequest) => {
  try {
    await ensureDatabaseInitialized();

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv'; // csv or json
    
    // Build filter (no pagination for exports)
    const categoryParam = searchParams.get('category');
    const filter: AuditLogFilter = {
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      userId: searchParams.get('userId') || undefined,
      username: searchParams.get('username') || undefined,
      action: searchParams.get('action') || undefined,
      category: categoryParam ? (categoryParam as AuditCategory) : undefined,
      status: searchParams.get('status') as 'success' | 'failure' | 'error' | undefined,
      limit: 10000, // Large limit for exports
      offset: 0,
    };

    // Query audit logs
    const { logs } = await AuditLogger.query(filter);

    // Parse details JSON for each log
    const formattedLogs = logs.map(log => ({
      ...log,
      details: log.details ? JSON.parse(log.details) : null,
    }));

    if (format === 'json') {
      return NextResponse.json(formattedLogs, {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="audit-log-${new Date().toISOString().split('T')[0]}.json"`,
        },
      });
    }

    // CSV format
    if (formattedLogs.length === 0) {
      return NextResponse.json(
        { error: 'No logs to export' },
        { status: 400 }
      );
    }

    // CSV headers
    const headers = [
      'ID',
      'Timestamp',
      'User ID',
      'Username',
      'Action',
      'Category',
      'Target Type',
      'Target ID',
      'Status',
      'IP Address',
      'User Agent',
      'Details',
      'Error Message',
    ];

    // CSV rows
    const rows = formattedLogs.map(log => [
      log.id.toString(),
      log.timestamp,
      log.userId || '',
      log.username || '',
      log.action,
      log.category,
      log.targetType || '',
      log.targetId || '',
      log.status,
      log.ipAddress || '',
      log.userAgent || '',
      log.details ? JSON.stringify(log.details) : '',
      log.errorMessage || '',
    ]);

    // Escape CSV values
    const escapeCsv = (value: string): string => {
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    };

    // Build CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(escapeCsv).join(',')),
    ].join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="audit-log-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });

  } catch (error) {
    console.error('[AuditLog] Download error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}));

