import { NextRequest, NextResponse } from 'next/server';
import { getSessionIdFromRequest, validateSession, generateCSRFToken, createSession } from '@/lib/session-csrf';
import { getClientIpAddress } from '@/lib/ip-utils';

// Get CSRF token for the current session (creates session if needed)
export async function GET(request: NextRequest) {
  try {
    let sessionId = getSessionIdFromRequest(request);
    const ipAddress = getClientIpAddress(request);
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    // Create session if none exists or if invalid
    if (!sessionId || !validateSession(sessionId)) {
      sessionId = createSession(null, ipAddress, userAgent); // null userId for unauthenticated session
    }
    
    const csrfToken = generateCSRFToken(sessionId);
    
    const response = NextResponse.json({ 
      token: csrfToken,
      message: 'CSRF token generated successfully' 
    });
    
    // Set session cookie if it wasn't already set
    response.cookies.set('sessionId', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });
    
    return response;
  } catch (error) {
    console.error('Error generating CSRF token:', error);
    return NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    );
  }
}
