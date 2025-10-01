import { NextRequest, NextResponse } from 'next/server';
import { getSessionIdFromRequest, getCSRFTokenFromRequest, validateSessionAsync, validateCSRFTokenAsync, updateSessionAccess } from './session-csrf';

// List of external APIs that should not have CSRF protection
const EXTERNAL_APIS = [
  '/api/summary',
  '/api/upload',
  '/api/lastbackup',
  '/api/lastbackups',
  '/api/health'
];

// Check if the request path is an external API
function isExternalAPI(pathname: string): boolean {
  return EXTERNAL_APIS.some(api => pathname.startsWith(api));
}

// CSRF validation middleware
export function withCSRF<T extends unknown[]>(
  handler: (request: NextRequest, ...args: T) => Promise<Response>
) {
  return async (request: NextRequest, ...args: T) => {
    const pathname = request.nextUrl.pathname;
    
    // Skip CSRF validation for external APIs
    if (isExternalAPI(pathname)) {
      return handler(request, ...args);
    }
    
    // Get session ID and CSRF token from request
    const sessionId = getSessionIdFromRequest(request);
    const csrfToken = getCSRFTokenFromRequest(request);
    
    // Validate session with retry logic
    if (!sessionId || !(await validateSessionAsync(sessionId))) {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      );
    }
    
    // For GET requests, only validate session (no CSRF token needed)
    if (request.method === 'GET') {
      updateSessionAccess(sessionId);
      return handler(request, ...args);
    }
    
    // For state-changing methods, validate CSRF token with retry logic
    if (!csrfToken || !(await validateCSRFTokenAsync(sessionId, csrfToken))) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      );
    }
    
    // Update session access time
    updateSessionAccess(sessionId);
    
    // Call the original handler
    return handler(request, ...args);
  };
}

// Standalone CSRF validation function
export async function validateCSRFRequest(request: NextRequest): Promise<{ valid: boolean; error?: string; status?: number }> {
  const pathname = request.nextUrl.pathname;
  
  // Skip CSRF validation for external APIs
  if (isExternalAPI(pathname)) {
    return { valid: true };
  }
  
  // For GET requests, only validate session (no CSRF token needed)
  if (request.method === 'GET') {
    const sessionId = getSessionIdFromRequest(request);
    if (!sessionId || !(await validateSessionAsync(sessionId))) {
      return { 
        valid: false, 
        error: 'Invalid or expired session', 
        status: 401 
      };
    }
    updateSessionAccess(sessionId);
    return { valid: true };
  }
  
  // Get session ID and CSRF token from request
  const sessionId = getSessionIdFromRequest(request);
  const csrfToken = getCSRFTokenFromRequest(request);
  
  // Validate session with retry logic
  if (!sessionId || !(await validateSessionAsync(sessionId))) {
    return { 
      valid: false, 
      error: 'Invalid or expired session', 
      status: 401 
    };
  }
  
  // Validate CSRF token with retry logic
  if (!csrfToken || !(await validateCSRFTokenAsync(sessionId, csrfToken))) {
    return { 
      valid: false, 
      error: 'Invalid CSRF token', 
      status: 403 
    };
  }
  
  // Update session access time
  updateSessionAccess(sessionId);
  
  return { valid: true };
}
