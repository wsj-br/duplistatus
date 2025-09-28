import { NextRequest, NextResponse } from 'next/server';
import { setServerPassword } from '@/lib/secrets';
import { withCSRF } from '@/lib/csrf-middleware';
import { getSessionIdFromRequest, validateSession, generateCSRFToken } from '@/lib/session-csrf';

export const PATCH = withCSRF(async (
  request: NextRequest,
  { params }: { params: Promise<{ serverId: string }> }
) => {
  try {
    const { serverId } = await params;
    
    
    const { password } = await request.json();

    // Validate password type (allow empty string)
    if (typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Password must be a string' },
        { status: 400 }
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
});

// GET endpoint to retrieve CSRF token
export const GET = withCSRF(async (
  request: NextRequest,
  { params }: { params: Promise<{ serverId: string }> }
) => {
  try {
    const { serverId } = await params;
    
    
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
