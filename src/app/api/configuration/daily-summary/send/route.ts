import { NextRequest, NextResponse } from 'next/server';
import { withCSRF } from '@/lib/csrf-middleware';
import { requireAdmin } from '@/lib/auth-middleware';
import { getClientIpAddress } from '@/lib/ip-utils';
import { AuditLogger } from '@/lib/audit-logger';
import { sendDailySummaryNow } from '@/lib/daily-summary';

export const POST = withCSRF(requireAdmin(async (request: NextRequest, authContext) => {
  try {
    const result = await sendDailySummaryNow();
    if (authContext) {
      await AuditLogger.logSystem(
        'daily_summary_sent',
        {
          trigger: 'manual',
          occurrenceKey: result.occurrenceKey,
          succeeded: result.succeeded,
          failed: result.failed,
        },
        result.failed.length === 0 ? 'success' : 'error'
      );
      await AuditLogger.logConfigChange(
        'daily_summary_sent',
        authContext.userId,
        authContext.username,
        'daily_summary',
        { occurrenceKey: result.occurrenceKey, succeeded: result.succeeded },
        getClientIpAddress(request),
        request.headers.get('user-agent') || 'unknown'
      );
    }
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}));
