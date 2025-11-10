import { NextRequest, NextResponse } from 'next/server';
import { ensureDatabaseInitialized } from '@/lib/db';
import { AuditLogger } from '@/lib/audit-logger';
import { withCSRF } from '@/lib/csrf-middleware';
import { requireAdmin } from '@/lib/auth-middleware';
import { getConfiguration } from '@/lib/db-utils';
import { getClientIpAddress } from '@/lib/ip-utils';

// POST /api/audit-log/cleanup - Manual cleanup of old audit logs (Admin only)
export const POST = withCSRF(requireAdmin(async (request: NextRequest, authContext) => {
  try {
    await ensureDatabaseInitialized();

    const body = await request.json().catch(() => ({}));
    const { retentionDays: overrideRetentionDays, dryRun = false } = body;

    // Get configured retention days
    let retentionDays = 90; // Default
    if (overrideRetentionDays) {
      retentionDays = parseInt(String(overrideRetentionDays), 10);
      if (isNaN(retentionDays) || retentionDays < 30 || retentionDays > 365) {
        return NextResponse.json(
          { error: 'Retention days must be between 30 and 365' },
          { status: 400 }
        );
      }
    } else {
      // Get from configuration
      const retentionConfig = getConfiguration('audit_retention_days');
      if (retentionConfig) {
        retentionDays = parseInt(retentionConfig, 10);
        if (isNaN(retentionDays)) {
          retentionDays = 90; // Fallback to default
        }
      }
    }

    if (dryRun) {
      // Preview mode - count how many would be deleted
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
      const cutoffDateStr = cutoffDate.toISOString().split('T')[0];

      // Get count of logs that would be deleted
      const { db } = await import('@/lib/db');
      const countResult = db.prepare(`
        SELECT COUNT(*) as count
        FROM audit_log
        WHERE timestamp < datetime('now', '-${retentionDays} days')
      `).get() as { count: number };

      // Get oldest remaining log
      const oldestResult = db.prepare(`
        SELECT MIN(timestamp) as oldest
        FROM audit_log
        WHERE timestamp >= datetime('now', '-${retentionDays} days')
      `).get() as { oldest: string | null };

      return NextResponse.json({
        dryRun: true,
        wouldDeleteCount: countResult.count,
        oldestRemaining: oldestResult.oldest || null,
        retentionDays,
        cutoffDate: cutoffDateStr,
      });
    }

    // Perform actual cleanup - pass user context so it's logged as the user who triggered it
    const ipAddress = getClientIpAddress(request);
    const deletedCount = await AuditLogger.cleanup(
      retentionDays,
      authContext.userId,
      authContext.username,
      ipAddress
    );

    // Get oldest remaining log
    const { db } = await import('@/lib/db');
    const oldestResult = db.prepare(`
      SELECT MIN(timestamp) as oldest
      FROM audit_log
    `).get() as { oldest: string | null };

    return NextResponse.json({
      success: true,
      deletedCount,
      oldestRemaining: oldestResult.oldest || null,
      retentionDays,
    });

  } catch (error) {
    console.error('[AuditLog] Cleanup error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}));

