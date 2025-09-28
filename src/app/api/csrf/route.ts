import { NextRequest, NextResponse } from 'next/server';
import { getSessionIdFromRequest, validateSession, generateCSRFToken } from '@/lib/session-csrf';

// Get CSRF token for the current session
export async function GET(request: NextRequest) {
  try {
    const sessionId = getSessionIdFromRequest(request);
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'No session found' },
        { status: 401 }
      );
    }
    
    if (!validateSession(sessionId)) {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      );
    }
    
    const csrfToken = generateCSRFToken(sessionId);
    
    return NextResponse.json({ 
      csrfToken,
      message: 'CSRF token generated successfully' 
    });
  } catch (error) {
    console.error('Error generating CSRF token:', error);
    return NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    );
  }
}
