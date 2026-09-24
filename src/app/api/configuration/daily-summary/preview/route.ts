import { NextRequest, NextResponse } from 'next/server';
import { withCSRF } from '@/lib/csrf-middleware';
import { requireAuth, type AuthContext } from '@/lib/auth-middleware';
import { previewDailySummary } from '@/lib/daily-summary';
import { getServerAccess } from '@/lib/server-access';

export const POST = withCSRF(requireAuth(async (_request: NextRequest, authContext: AuthContext) => {
  try {
    const preview = await previewDailySummary(getServerAccess(authContext));
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
