import { NextRequest, NextResponse } from 'next/server';
import { withCSRF } from '@/lib/csrf-middleware';
import { requireAdmin } from '@/lib/auth-middleware';
import { retryFailedDailySummary } from '@/lib/daily-summary';

export const POST = withCSRF(requireAdmin(async (request: NextRequest) => {
  try {
    let occurrenceKey: string | undefined;
    try {
      const body = await request.json() as { occurrenceKey?: string };
      if (typeof body.occurrenceKey === 'string' && body.occurrenceKey.length > 0) {
        occurrenceKey = body.occurrenceKey;
      }
    } catch {
      occurrenceKey = undefined;
    }
    const result = await retryFailedDailySummary(occurrenceKey);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}));
