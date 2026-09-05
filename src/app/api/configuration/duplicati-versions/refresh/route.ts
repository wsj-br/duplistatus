import { withCSRF } from '@/lib/csrf-middleware';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-middleware';
import { refreshDuplicatiVersions } from '@/lib/duplicati-version-service';

export const runtime = 'nodejs';

export const POST = withCSRF(requireAdmin(async () => {
  try {
    const result = await refreshDuplicatiVersions({ force: true, trigger: 'manual' });
    if (!result.success) {
      return NextResponse.json(
        {
          ...result,
          error: result.message,
          errorCode: 'VERSION_REFRESH_FAILED',
        },
        { status: 502 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error(
      'Failed to refresh Duplicati versions:',
      error instanceof Error ? error.message : String(error)
    );
    return NextResponse.json(
      { error: 'Failed to refresh Duplicati versions', errorCode: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}));
