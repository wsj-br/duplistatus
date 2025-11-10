import { withCSRF } from '@/lib/csrf-middleware';
import { NextResponse, NextRequest } from 'next/server';
import { checkOverdueBackups } from '@/lib/overdue-backup-checker';
import { optionalAuth, getAuthContext } from '@/lib/auth-middleware';
import { getClientIpAddress } from '@/lib/ip-utils';
import { AuditLogger } from '@/lib/audit-logger';

// HTTP endpoint that uses the core function
export const POST = withCSRF(optionalAuth(async (request: NextRequest, authContext) => {
  try {
    
    const result = await checkOverdueBackups();
    
    // Log audit event
    if (authContext && result.statistics) {
      const ipAddress = getClientIpAddress(request);
      await AuditLogger.log({
        userId: authContext.userId,
        username: authContext.username,
        action: 'overdue_check_manual',
        category: 'system',
        details: {
          checkedBackups: result.statistics.checkedBackups,
          overdueBackupsFound: result.statistics.overdueBackupsFound,
          notificationsSent: result.statistics.notificationsSent,
        },
        ipAddress,
        status: 'success',
      });
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ Error in POST endpoint:', error instanceof Error ? error.message : String(error));
    
    // Log audit event for error
    const authContext = await getAuthContext(request);
    if (authContext) {
      const ipAddress = getClientIpAddress(request);
      const errorMessage = error instanceof Error ? error.message : 'Failed to check for overdue backups';
      await AuditLogger.log({
        userId: authContext.userId,
        username: authContext.username,
        action: 'overdue_check_manual',
        category: 'system',
        details: {
          error: errorMessage,
        },
        ipAddress,
        status: 'error',
        errorMessage,
      });
    }
    
    return NextResponse.json(
      { error: 'Failed to check for overdue backups' },
      { status: 500 }
    );
  }
}));