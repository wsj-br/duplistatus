import { NextResponse } from 'next/server';
import { getResendFrequencyConfig, setResendFrequencyConfig } from '@/lib/db-utils';
import type { ResendFrequencyConfig } from '@/lib/types';

export async function GET() {
  try {
    const value = getResendFrequencyConfig();
    return NextResponse.json({ value });
  } catch (error) {
    console.error('Error fetching resend frequency config:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Failed to fetch config' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const value = body.value as ResendFrequencyConfig;
    if (!['never', 'every_day', 'every_week', 'every_month'].includes(value)) {
      return NextResponse.json(
        { error: 'Invalid value' },
        { status: 400 }
      );
    }
    setResendFrequencyConfig(value);
    return NextResponse.json({ value });
  } catch (error) {
    console.error('Error setting resend frequency config:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Failed to set config' },
      { status: 500 }
    );
  }
} 