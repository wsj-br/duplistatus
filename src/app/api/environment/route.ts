import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    PORT: process.env.PORT,
    CRON_PORT: process.env.CRON_PORT,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_TELEMETRY_DISABLED: process.env.NEXT_TELEMETRY_DISABLED,
    TZ: process.env.TZ,
    timestamp: new Date().toISOString(),
  });
}
