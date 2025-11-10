import { withCSRF } from '@/lib/csrf-middleware';
import { NextResponse, NextRequest } from 'next/server';
import { getCronConfig, setCronInterval, getCurrentCronInterval } from '@/lib/db-utils';
import { CronInterval } from '@/lib/types';
import { optionalAuth } from '@/lib/auth-middleware';
import { getClientIpAddress } from '@/lib/ip-utils';
import { AuditLogger } from '@/lib/audit-logger';
import { cronIntervalMap } from '@/lib/cron-interval-map';

// Ensure this runs in Node.js runtime, not Edge Runtime
export const runtime = 'nodejs';

export const GET = withCSRF(async () => {
  try {
    const config = getCronConfig();
    const task = config.tasks['overdue-backup-check'];
    
    // Return only what's needed by the client
    return NextResponse.json({
      cronExpression: task.cronExpression,
      enabled: task.enabled
    });
  } catch (error) {
    console.error('Failed to get cron config:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Failed to get cron configuration' },
      { status: 500 }
    );
  }
});

export const POST = withCSRF(optionalAuth(async (request: NextRequest, authContext) => {
  try {
    
    const { interval } = await request.json() as { interval: CronInterval };
    
    if (!interval) {
      return NextResponse.json(
        { error: 'Interval is required' },
        { status: 400 }
      );
    }

    // Get old value for audit log
    const oldInterval = getCurrentCronInterval();
    const oldIntervalLabel = cronIntervalMap[oldInterval]?.label || oldInterval;

    setCronInterval(interval);
    
    // Log audit event
    if (authContext) {
      const ipAddress = getClientIpAddress(request);
      const newIntervalLabel = cronIntervalMap[interval]?.label || interval;
      await AuditLogger.logConfigChange(
        'overdue_monitoring_interval_updated',
        authContext.userId,
        authContext.username,
        'cron_interval',
        {
          oldInterval: oldIntervalLabel,
          newInterval: newIntervalLabel,
        },
        ipAddress
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update cron config:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Failed to update cron configuration' },
      { status: 500 }
    );
  }
}));