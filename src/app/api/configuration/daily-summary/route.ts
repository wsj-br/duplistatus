import { NextRequest, NextResponse } from 'next/server';
import { withCSRF } from '@/lib/csrf-middleware';
import { requireAdmin, requireAuth } from '@/lib/auth-middleware';
import { getClientIpAddress } from '@/lib/ip-utils';
import { AuditLogger } from '@/lib/audit-logger';
import {
  getDailySummaryConfig,
  getSMTPConfig,
  setDailySummaryConfig,
} from '@/lib/db-utils';
import { parseDailySummaryConfig } from '@/lib/db-utils';
import {
  getDailySummaryPublicStatus,
  isSmtpConfiguredForSummary,
} from '@/lib/daily-summary';
import { isValidHttpPublicUrl } from '@/lib/public-url-utils';
import { isValidIanaTimeZone, isValidLocalTime } from '@/lib/daily-summary-schedule';
import type { DailySummaryConfig } from '@/lib/types';

export const GET = withCSRF(requireAuth(async () => {
  try {
    const status = await getDailySummaryPublicStatus();
    return NextResponse.json(status, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    console.error('Failed to get daily summary status:', error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: 'Failed to get daily summary status' }, { status: 500 });
  }
}));

export const POST = withCSRF(requireAdmin(async (request: NextRequest, authContext) => {
  try {
    const body = await request.json() as {
      enabled?: boolean;
      utcTime?: string;
      timeZone?: string;
      publicUrl?: string;
    };
    const current = getDailySummaryConfig();
    const nextEnabled = body.enabled ?? current.enabled;
    const nextUtcTime = body.utcTime ?? current.utcTime;
    const nextTimeZone = body.timeZone ?? current.timeZone;
    const nextPublicUrl = body.publicUrl ?? current.publicUrl;

    if (!isValidLocalTime(nextUtcTime)) {
      return NextResponse.json({ error: 'Invalid send time' }, { status: 400 });
    }
    if (!isValidIanaTimeZone(nextTimeZone)) {
      return NextResponse.json({ error: 'Invalid timezone' }, { status: 400 });
    }
    const trimmedPublicUrl = nextPublicUrl.trim();
    if (trimmedPublicUrl.length > 0 && !isValidHttpPublicUrl(trimmedPublicUrl)) {
      return NextResponse.json({ error: 'Invalid public dashboard URL' }, { status: 400 });
    }

    if (nextEnabled) {
      if (!isSmtpConfiguredForSummary(getSMTPConfig())) {
        return NextResponse.json({ error: 'SMTP must be configured before enabling daily summary' }, { status: 400 });
      }
    }

    const scheduleChanged =
      nextEnabled !== current.enabled
      || nextUtcTime !== current.utcTime
      || nextTimeZone !== current.timeZone;

    const nextConfig: DailySummaryConfig = parseDailySummaryConfig({
      enabled: nextEnabled,
      utcTime: nextUtcTime,
      timeZone: nextTimeZone,
      effectiveFromIso: scheduleChanged ? new Date().toISOString() : current.effectiveFromIso,
      publicUrl: nextPublicUrl,
    });

    setDailySummaryConfig(nextConfig);

    if (authContext) {
      await AuditLogger.logConfigChange(
        'daily_summary_updated',
        authContext.userId,
        authContext.username,
        'daily_summary',
        {
          enabled: nextConfig.enabled,
          utcTime: nextConfig.utcTime,
          timeZone: nextConfig.timeZone,
          publicUrl: nextConfig.publicUrl,
        },
        getClientIpAddress(request),
        request.headers.get('user-agent') || 'unknown'
      );
    }

    const status = await getDailySummaryPublicStatus();
    return NextResponse.json(status);
  } catch (error) {
    console.error('Failed to update daily summary:', error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: 'Failed to update daily summary' }, { status: 500 });
  }
}));
