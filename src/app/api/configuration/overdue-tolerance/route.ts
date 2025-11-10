import { withCSRF } from '@/lib/csrf-middleware';
import { NextResponse, NextRequest } from 'next/server';
import { setConfiguration, getOverdueToleranceConfig } from '@/lib/db-utils';
import { optionalAuth } from '@/lib/auth-middleware';
import { getClientIpAddress } from '@/lib/ip-utils';
import { AuditLogger } from '@/lib/audit-logger';

export const GET = withCSRF(async () => {
  try {
    const tolerance = getOverdueToleranceConfig();
    return NextResponse.json({ overdue_tolerance: tolerance });
  } catch (error) {
    console.error('Failed to get overdue tolerance:', error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: 'Failed to get overdue tolerance' }, { status: 500 });
  }
});

export const POST = withCSRF(optionalAuth(async (request: NextRequest, authContext) => {
  try {
    
    const body = await request.json();
    const { overdue_tolerance } = body;
    
    if (overdue_tolerance === undefined) {
      return NextResponse.json({ error: 'overdue_tolerance is required' }, { status: 400 });
    }
    
    // Get old value for audit log
    const oldValue = getOverdueToleranceConfig();
    
    // Only update the overdue tolerance setting
    setConfiguration('overdue_tolerance', overdue_tolerance);
    
    // Log audit event
    if (authContext) {
      const ipAddress = getClientIpAddress(request);
      await AuditLogger.logConfigChange(
        'overdue_tolerance_updated',
        authContext.userId,
        authContext.username,
        'overdue_tolerance',
        {
          oldValue,
          newValue: overdue_tolerance,
        },
        ipAddress
      );
    }
    
    return NextResponse.json({ message: 'Overdue tolerance updated successfully' });
  } catch (error) {
    console.error('Failed to update overdue tolerance:', error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: 'Failed to update overdue tolerance' }, { status: 500 });
  }
}));