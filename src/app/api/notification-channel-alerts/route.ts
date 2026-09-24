import { NextRequest, NextResponse } from 'next/server';
import { withCSRF } from '@/lib/csrf-middleware';
import { requireAdmin } from '@/lib/auth-middleware';
import {
  clearNotificationChannelAlerts,
  getNotificationChannelAlerts,
  parseNotificationChannels,
} from '@/lib/notification-channel-alerts';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = withCSRF(requireAdmin(async (_request: NextRequest, authContext) => {
  try {
    return NextResponse.json({
      alerts: getNotificationChannelAlerts(authContext.userId),
    });
  } catch (error) {
    console.error(
      'Failed to read notification channel alerts:',
      error instanceof Error ? error.message : String(error)
    );
    return NextResponse.json(
      { error: 'Failed to read notification channel alerts', errorCode: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}));

export const POST = withCSRF(requireAdmin(async (request: NextRequest, authContext) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'At least one notification channel is required', errorCode: 'INVALID_CONFIGURATION' },
      { status: 400 }
    );
  }

  try {
    const channels = body && typeof body === 'object'
      ? parseNotificationChannels((body as { channels?: unknown }).channels)
      : null;
    if (!channels) {
      return NextResponse.json(
        { error: 'At least one notification channel is required', errorCode: 'INVALID_CONFIGURATION' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      alerts: clearNotificationChannelAlerts(authContext.userId, channels),
    });
  } catch (error) {
    console.error(
      'Failed to clear notification channel alerts:',
      error instanceof Error ? error.message : String(error)
    );
    return NextResponse.json(
      { error: 'Failed to clear notification channel alerts', errorCode: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}));
