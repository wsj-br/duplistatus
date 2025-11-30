import { NextResponse } from 'next/server';
import { ensureDatabaseInitialized } from '@/lib/db';
import { AuditLogger } from '@/lib/audit-logger';
import { withCSRF } from '@/lib/csrf-middleware';
import { requireAuth } from '@/lib/auth-middleware';

// GET /api/audit-log/filters - Get unique filter values for actions, categories, and statuses
export const GET = withCSRF(requireAuth(async () => {
  try {
    await ensureDatabaseInitialized();

    const filterValues = await AuditLogger.getFilterValues();

    return NextResponse.json(filterValues);
  } catch (error) {
    console.error('[API] Failed to get audit log filter values:', error);
    return NextResponse.json(
      { error: 'Failed to get filter values' },
      { status: 500 }
    );
  }
}));

