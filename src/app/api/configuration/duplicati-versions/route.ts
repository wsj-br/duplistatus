import { withCSRF } from '@/lib/csrf-middleware';
import { NextResponse, NextRequest } from 'next/server';
import {
  getCronConfig,
  getDuplicatiVersionCache,
  getDuplicatiVersionCheckConfig,
  setDuplicatiVersionCheckConfig,
} from '@/lib/db-utils';
import { requireAdmin, requireAuth } from '@/lib/auth-middleware';
import { getClientIpAddress } from '@/lib/ip-utils';
import { AuditLogger } from '@/lib/audit-logger';
import {
  isDuplicatiVersionCheckInterval,
  isValidUtcHour,
  isValidUtcTime,
  legacyUtcHourToStartTimeUtc,
} from '@/lib/duplicati-version';
import type { DuplicatiVersionCheckConfig } from '@/lib/types';

export const runtime = 'nodejs';

function resolveStartTimeUtc(body: Partial<DuplicatiVersionCheckConfig & { startHourUtc?: number }>): string | null {
  if (typeof body.startTimeUtc === 'string' && isValidUtcTime(body.startTimeUtc)) {
    return body.startTimeUtc;
  }
  if (isValidUtcHour(body.startHourUtc)) {
    return legacyUtcHourToStartTimeUtc(body.startHourUtc);
  }
  return null;
}

function buildVersionSettingsResponse() {
  const checkConfig = getDuplicatiVersionCheckConfig();
  const cronConfig = getCronConfig();
  const task = cronConfig.tasks['duplicati-version-refresh'];

  return {
    cache: getDuplicatiVersionCache(),
    interval: checkConfig.interval,
    startTimeUtc: checkConfig.startTimeUtc,
    cronExpression: task.cronExpression,
    enabled: task.enabled,
  };
}

export const GET = withCSRF(requireAuth(async () => {
  try {
    return NextResponse.json(buildVersionSettingsResponse());
  } catch (error) {
    console.error(
      'Failed to get Duplicati version settings:',
      error instanceof Error ? error.message : String(error)
    );
    return NextResponse.json(
      { error: 'Failed to get Duplicati version settings', errorCode: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}));

export const POST = withCSRF(requireAdmin(async (request: NextRequest, authContext) => {
  try {
    const body = await request.json() as Partial<DuplicatiVersionCheckConfig & { startHourUtc?: number }>;
    const { interval } = body;
    const startTimeUtc = resolveStartTimeUtc(body);

    if (!isDuplicatiVersionCheckInterval(interval) || !startTimeUtc) {
      return NextResponse.json(
        { error: 'A valid interval and UTC start time are required', errorCode: 'INVALID_CONFIGURATION' },
        { status: 400 }
      );
    }

    const oldConfig = getDuplicatiVersionCheckConfig();
    const newConfig: DuplicatiVersionCheckConfig = { interval, startTimeUtc };

    setDuplicatiVersionCheckConfig(newConfig);

    const ipAddress = getClientIpAddress(request);
    const userAgent = request.headers.get('user-agent') || 'unknown';
    await AuditLogger.logConfigChange(
      'duplicati_version_check_updated',
      authContext.userId,
      authContext.username,
      'duplicati_version_check',
      {
        oldInterval: oldConfig.interval,
        newInterval: newConfig.interval,
        oldStartTimeUtc: oldConfig.startTimeUtc,
        newStartTimeUtc: newConfig.startTimeUtc,
      },
      ipAddress,
      userAgent
    );

    return NextResponse.json({
      success: true,
      ...buildVersionSettingsResponse(),
    });
  } catch (error) {
    console.error(
      'Failed to update Duplicati version settings:',
      error instanceof Error ? error.message : String(error)
    );
    return NextResponse.json(
      { error: 'Failed to update Duplicati version settings', errorCode: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}));
