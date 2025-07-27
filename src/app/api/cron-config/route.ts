import { NextResponse } from 'next/server';
import { getCronConfig, setCronInterval } from '@/lib/db-utils';
import { CronInterval } from '@/lib/types';

// Ensure this runs in Node.js runtime, not Edge Runtime
export const runtime = 'nodejs';

export async function GET() {
  try {
    const config = getCronConfig();
    const task = config.tasks['missed-backup-check'];
    
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
}

export async function POST(request: Request) {
  try {
    const { interval } = await request.json() as { interval: CronInterval };
    
    if (!interval) {
      return NextResponse.json(
        { error: 'Interval is required' },
        { status: 400 }
      );
    }

    setCronInterval(interval);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update cron config:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Failed to update cron configuration' },
      { status: 500 }
    );
  }
} 