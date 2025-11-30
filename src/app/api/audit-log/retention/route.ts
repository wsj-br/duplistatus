import { NextRequest, NextResponse } from 'next/server';
import { ensureDatabaseInitialized } from '@/lib/db';
import { withCSRF } from '@/lib/csrf-middleware';
import { requireAdmin } from '@/lib/auth-middleware';
import { getConfiguration, setConfiguration } from '@/lib/db-utils';
import { AuditLogger } from '@/lib/audit-logger';
import { getClientIpAddress } from '@/lib/ip-utils';

// GET /api/audit-log/retention - Get current retention configuration
export const GET = withCSRF(async (request: NextRequest) => {
  try {
    await ensureDatabaseInitialized();

    const retentionConfig = getConfiguration('audit_retention_days');
    const retentionDays = retentionConfig ? parseInt(retentionConfig, 10) : 90;

    return NextResponse.json({
      retentionDays: isNaN(retentionDays) ? 90 : retentionDays,
    });

  } catch (error) {
    console.error('[AuditLog] Get retention error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// PATCH /api/audit-log/retention - Update retention configuration (Admin only)
export const PATCH = withCSRF(requireAdmin(async (request: NextRequest, authContext) => {
  try {
    await ensureDatabaseInitialized();

    const body = await request.json();
    const { retentionDays } = body;

    if (!retentionDays || typeof retentionDays !== 'number') {
      return NextResponse.json(
        { error: 'retentionDays must be a number' },
        { status: 400 }
      );
    }

    if (retentionDays < 30 || retentionDays > 365) {
      return NextResponse.json(
        { error: 'Retention days must be between 30 and 365' },
        { status: 400 }
      );
    }

    // Get old value before updating
    const oldValue = getConfiguration('audit_retention_days') || '90';

    // Update configuration
    setConfiguration('audit_retention_days', String(retentionDays));

    // Log the configuration change
    const ipAddress = getClientIpAddress(request);
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    await AuditLogger.logConfigChange(
      'audit_retention_updated',
      authContext.userId,
      authContext.username,
      'audit_retention_days',
      {
        oldValue,
        newValue: String(retentionDays),
      },
      ipAddress,
      userAgent
    );

    return NextResponse.json({
      success: true,
      retentionDays,
    });

  } catch (error) {
    console.error('[AuditLog] Update retention error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}));

