import { NextResponse } from 'next/server';
import { getNotificationFrequencyConfig, setNotificationFrequencyConfig } from '@/lib/db-utils';
import type { NotificationFrequencyConfig } from '@/lib/types';

export async function GET() {
  try {
    const value = getNotificationFrequencyConfig();
    return NextResponse.json({ value });
  } catch (error) {
    console.error('Error fetching notification frequency config:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Failed to fetch config' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const value = body.value as NotificationFrequencyConfig;
    if (!['onetime', 'every_day', 'every_week', 'every_month'].includes(value)) {
      return NextResponse.json(
        { error: 'Invalid value' },
        { status: 400 }
      );
    }
    setNotificationFrequencyConfig(value);
    return NextResponse.json({ value });
  } catch (error) {
    console.error('Error setting notification frequency config:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Failed to set config' },
      { status: 500 }
    );
  }
} 