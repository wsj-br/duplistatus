import { NextResponse } from 'next/server';
import { withCSRF } from '@/lib/csrf-middleware';
import { requireAdmin } from '@/lib/auth-middleware';
import { sendDailySummaryNow } from '@/lib/daily-summary';

export const POST = withCSRF(requireAdmin(async () => {
  try {
    const result = await sendDailySummaryNow();
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}));
