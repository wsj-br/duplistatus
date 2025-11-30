import { NextRequest, NextResponse } from 'next/server';
import { createSession, validateSession, deleteSession } from '@/lib/session-csrf';

// Create a new session
export async function POST() {
  try {
    const sessionId = createSession();
    
    const response = NextResponse.json({ 
      sessionId,
      message: 'Session created successfully' 
    });
    
    // Set session cookie
    const isProduction = process.env.NODE_ENV === 'production';
    response.cookies.set('session', sessionId, {
      httpOnly: true,
      secure: false, // Always false since application runs over HTTP
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 24 * 60 * 60 // 24 hours
    });
    
    return response;
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}

// Validate existing session
export async function GET(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) {
      return NextResponse.json(
        { valid: false, error: 'No session cookie' },
        { status: 401 }
      );
    }
    
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);
    
    // Try sessionId first (current standard), then fallback to session (legacy)
    const sessionId = cookies['sessionId'] || cookies['session'];
    if (!sessionId) {
      return NextResponse.json(
        { valid: false, error: 'No session ID' },
        { status: 401 }
      );
    }
    
    const isValid = validateSession(sessionId);
    
    return NextResponse.json({ 
      valid: isValid,
      sessionId: isValid ? sessionId : null
    });
  } catch (error) {
    console.error('Error validating session:', error);
    return NextResponse.json(
      { error: 'Failed to validate session' },
      { status: 500 }
    );
  }
}

// Delete session (logout)
export async function DELETE(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) {
      return NextResponse.json({ message: 'No session to delete' });
    }
    
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);
    
    // Try sessionId first (current standard), then fallback to session (legacy)
    const sessionId = cookies['sessionId'] || cookies['session'];
    if (sessionId) {
      deleteSession(sessionId);
    }
    
    const response = NextResponse.json({ 
      message: 'Session deleted successfully' 
    });
    
    // Clear session cookie
    const isProduction = process.env.NODE_ENV === 'production';
    response.cookies.set('session', '', {
      httpOnly: true,
      secure: false, // Always false since application runs over HTTP
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 0
    });
    
    return response;
  } catch (error) {
    console.error('Error deleting session:', error);
    return NextResponse.json(
      { error: 'Failed to delete session' },
      { status: 500 }
    );
  }
}
