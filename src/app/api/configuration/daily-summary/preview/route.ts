import { NextResponse } from 'next/server';
import { withCSRF } from '@/lib/csrf-middleware';
import { requireAuth } from '@/lib/auth-middleware';
import { previewDailySummary } from '@/lib/daily-summary';

export const POST = withCSRF(requireAuth(async () => {
  try {
    const preview = await previewDailySummary();
    return NextResponse.json({
      snapshot: preview.snapshot,
      payload: {
        subject: preview.payload.subject,
        emailHtml: preview.payload.emailHtml,
        emailText: preview.payload.emailText,
      },
    });
  } catch (error) {
    console.error('Failed to preview daily summary:', error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: 'Failed to preview daily summary' }, { status: 500 });
  }
}));
