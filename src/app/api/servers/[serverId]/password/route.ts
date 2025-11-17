import { NextRequest, NextResponse } from 'next/server';
import { setServerPassword } from '@/lib/secrets';
import { withCSRF } from '@/lib/csrf-middleware';
import { getSessionIdFromRequest, validateSession, generateCSRFToken } from '@/lib/session-csrf';
import { requireAdmin } from '@/lib/auth-middleware';
import { getClientIpAddress } from '@/lib/ip-utils';
import { AuditLogger } from '@/lib/audit-logger';
import { dbUtils } from '@/lib/db-utils';

export const PATCH = withCSRF(requireAdmin(async (
  request: NextRequest,
  authContext
) => {
  try {
    // Extract serverId from URL pathname
    const pathname = request.nextUrl.pathname;
    const serverId = pathname.split('/')[3]; // /api/servers/[serverId]/password
    
    if (!serverId) {
      return NextResponse.json(
        { error: 'Server ID is required' },
        { status: 400 }
      );
    }
    
    
    const { password } = await request.json();

    // Validate password type (allow empty string)
    if (typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Password must be a string' },
        { status: 400 }
      );
    }

    // Get server info before update for audit log
    const serverBefore = await dbUtils.getServerById(serverId);
    if (!serverBefore) {
      return NextResponse.json(
        { error: 'Server not found' },
        { status: 404 }
      );
    }

    // Set the server password
    const success = setServerPassword(serverId, password);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update password' },
        { status: 500 }
      );
    }

    // Log audit event
    const ipAddress = getClientIpAddress(request);
    const userAgent = request.headers.get('user-agent') || 'unknown';
    await AuditLogger.logServerOperation(
      'server_password_updated',
      authContext.userId,
      authContext.username,
      serverId,
      {
        serverName: serverBefore.name,
        passwordChanged: password.trim() !== '',
      },
      ipAddress,
      userAgent
    );

    return NextResponse.json({
      message: 'Password updated successfully',
      serverId
    });
  } catch (error) {
    console.error('Error updating server password:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Failed to update password' },
      { status: 500 }
    );
  }
}));

// GET endpoint to retrieve CSRF token
export const GET = withCSRF(async (
  request: NextRequest
) => {
  try {
    // Extract serverId from URL pathname
    const pathname = request.nextUrl.pathname;
    const serverId = pathname.split('/')[3]; // /api/servers/[serverId]/password
    
    if (!serverId) {
      return NextResponse.json(
        { error: 'Server ID is required' },
        { status: 400 }
      );
    }
    
    
    // Get session ID and validate session
    const sessionId = getSessionIdFromRequest(request);
    if (!sessionId || !validateSession(sessionId)) {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      );
    }
    
    // Generate CSRF token
    const csrfToken = generateCSRFToken(sessionId);
    
    return NextResponse.json({
      csrfToken,
      serverId
    });
  } catch (error) {
    console.error('Error generating CSRF token:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    );
  }
});
