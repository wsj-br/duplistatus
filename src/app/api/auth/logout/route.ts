import { NextRequest, NextResponse } from 'next/server';
import { dbOps, ensureDatabaseInitialized } from '@/lib/db';
import { deleteSession, getUserIdFromSession } from '@/lib/session-csrf';
import { AuditLogger } from '@/lib/audit-logger';
import { withCSRF } from '@/lib/csrf-middleware';
import { getAuthContext } from '@/lib/auth-middleware';
import { getClientIpAddress } from '@/lib/ip-utils';

export const POST = withCSRF(async (request: NextRequest) => {
  try {
    // Ensure database is ready
    await ensureDatabaseInitialized();

    // Get client info for logging
    const ipAddress = getClientIpAddress(request);
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Get session ID from cookie
    const sessionId = request.cookies.get('sessionId')?.value;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'No active session' },
        { status: 400 }
      );
    }

    // Get auth context before deleting session
    const authContext = await getAuthContext(request);

    // Delete session
    deleteSession(sessionId);

    // Log logout
    if (authContext) {
      await AuditLogger.logAuth(
        'logout',
        authContext.userId,
        authContext.username,
        true,
        {},
        ipAddress,
        userAgent
      );
    }

    // Prepare response
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });

    // Clear session cookie
    response.cookies.delete('sessionId');

    return response;

  } catch (error) {
    console.error('[Auth] Logout error:', error);
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    await AuditLogger.logAuth(
      'logout',
      null,
      'unknown',
      false,
      { 
        reason: 'Internal error',
        error: error instanceof Error ? error.message : String(error)
      },
      'unknown',
      userAgent,
      error instanceof Error ? error.message : String(error)
    );

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

