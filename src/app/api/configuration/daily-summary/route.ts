import { NextRequest, NextResponse } from 'next/server';
import { withCSRF } from '@/lib/csrf-middleware';
import { requireAdmin, requireAuth } from '@/lib/auth-middleware';
import { getClientIpAddress } from '@/lib/ip-utils';
import { AuditLogger } from '@/lib/audit-logger';
import {
  getDailySummaryConfig,
  getNtfyConfig,
  getSMTPConfig,
  setDailySummaryConfig,
} from '@/lib/db-utils';
import { parseDailySummaryConfig } from '@/lib/db-utils';
import {
  getDailySummaryPublicStatus,
  isDailySummaryDispatcherHealthy,
  isNtfyConfiguredForSummary,
  isSmtpConfiguredForSummary,
} from '@/lib/daily-summary';
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
      localTime?: string;
      timeZone?: string;
      sendNtfy?: boolean;
    };
    const current = getDailySummaryConfig();
    const nextEnabled = body.enabled ?? current.enabled;
    const nextLocalTime = body.localTime ?? current.localTime;
    const nextTimeZone = body.timeZone ?? current.timeZone;
    const nextSendNtfy = body.sendNtfy ?? current.sendNtfy;

    if (!isValidLocalTime(nextLocalTime)) {
      return NextResponse.json({ error: 'Invalid local time' }, { status: 400 });
    }
    if (!isValidIanaTimeZone(nextTimeZone)) {
      return NextResponse.json({ error: 'Invalid timezone' }, { status: 400 });
    }

    if (nextEnabled) {
      if (!isSmtpConfiguredForSummary(getSMTPConfig())) {
        return NextResponse.json({ error: 'SMTP must be configured before enabling daily summary' }, { status: 400 });
      }
      if (!await isDailySummaryDispatcherHealthy()) {
        return NextResponse.json({ error: 'The scheduler must be running before enabling daily summary' }, { status: 400 });
      }
    }
    if (nextSendNtfy && !isNtfyConfiguredForSummary(getNtfyConfig())) {
      return NextResponse.json({ error: 'NTFY must be configured before sending the summary to NTFY' }, { status: 400 });
    }

    const scheduleChanged =
      nextEnabled !== current.enabled
      || nextLocalTime !== current.localTime
      || nextTimeZone !== current.timeZone;

    const nextConfig: DailySummaryConfig = parseDailySummaryConfig({
      enabled: nextEnabled,
      localTime: nextLocalTime,
      timeZone: nextTimeZone,
      sendNtfy: nextSendNtfy,
      effectiveFromIso: scheduleChanged ? new Date().toISOString() : current.effectiveFromIso,
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
          localTime: nextConfig.localTime,
          timeZone: nextConfig.timeZone,
          sendNtfy: nextConfig.sendNtfy,
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
