import { NextRequest, NextResponse } from 'next/server';
import { getSessionIdFromRequest, getCSRFTokenFromRequest, validateSession, validateCSRFTokenAsync, updateSessionAccess } from './session-csrf';

// List of external APIs that should not have CSRF protection
const EXTERNAL_APIS = [
  '/api/summary',
  '/api/upload',
  '/api/lastbackup',
  '/api/lastbackups',
  '/api/health'
];

// List of public auth endpoints that don't require authentication
const PUBLIC_AUTH_APIS = [
  '/api/auth/admin-must-change-password'
];

// Check if the request path is an external API
function isExternalAPI(pathname: string): boolean {
  return EXTERNAL_APIS.some(api => pathname.startsWith(api));
}

// Check if the request path is a public auth API
function isPublicAuthAPI(pathname: string): boolean {
  return PUBLIC_AUTH_APIS.some(api => pathname.startsWith(api));
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
    
    // Skip authentication for public auth APIs (read-only public endpoints)
    if (isPublicAuthAPI(pathname)) {
      return handler(request, ...args);
    }
    
    // Get session ID and CSRF token from request
    const sessionId = getSessionIdFromRequest(request);
    const csrfToken = getCSRFTokenFromRequest(request);
    
    // Special handling for login endpoint: allow it to proceed if CSRF token is present,
    // even if session validation fails. This is necessary because:
    // 1. After migration to v4.0, sessions table might not be ready yet
    // 2. Login endpoint creates the authenticated session, so it needs to work without one
    // 3. CSRF token provides protection against CSRF attacks
    const isLoginEndpoint = pathname === '/api/auth/login';
    
    if (isLoginEndpoint && request.method === 'POST') {
      // For login, only validate CSRF token if session exists
      // If session doesn't exist or is invalid, still allow login to proceed
      // The login handler will create a new session
      if (sessionId && csrfToken) {
        // If we have both session and CSRF token, validate them
        // But don't fail if session is invalid - login will create a new one
        const isValidSession = await validateSession(sessionId);
        if (isValidSession) {
          const isValidCSRF = await validateCSRFTokenAsync(sessionId, csrfToken);
          if (!isValidCSRF) {
            return NextResponse.json(
              { error: 'Invalid CSRF token' },
              { status: 403 }
            );
          }
          updateSessionAccess(sessionId);
        }
        // If session is invalid but CSRF token exists, allow login to proceed
        // This handles the case where session expired or was lost after migration
      } else if (!csrfToken) {
        // Require CSRF token for login to prevent CSRF attacks
        return NextResponse.json(
          { error: 'CSRF token required' },
          { status: 403 }
        );
      }
      // Allow login to proceed with CSRF token even if session is invalid
      return handler(request, ...args);
    }
    
    // For all other endpoints, validate session
    if (!sessionId || !(await validateSession(sessionId))) {
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
  
  // Skip authentication for public auth APIs (read-only public endpoints)
  if (isPublicAuthAPI(pathname)) {
    return { valid: true };
  }
  
  // Special handling for login endpoint: allow it to proceed if CSRF token is present,
  // even if session validation fails (same logic as withCSRF middleware)
  const isLoginEndpoint = pathname === '/api/auth/login';
  
  if (isLoginEndpoint && request.method === 'POST') {
    const sessionId = getSessionIdFromRequest(request);
    const csrfToken = getCSRFTokenFromRequest(request);
    
    // Require CSRF token for login
    if (!csrfToken) {
      return { 
        valid: false, 
        error: 'CSRF token required', 
        status: 403 
      };
    }
    
    // If session exists and is valid, validate CSRF token
    // But don't fail if session is invalid - login will create a new one
    if (sessionId) {
      const isValidSession = await validateSession(sessionId);
      if (isValidSession) {
        const isValidCSRF = await validateCSRFTokenAsync(sessionId, csrfToken);
        if (!isValidCSRF) {
          return { 
            valid: false, 
            error: 'Invalid CSRF token', 
            status: 403 
          };
        }
        updateSessionAccess(sessionId);
      }
      // If session is invalid but CSRF token exists, allow login to proceed
    }
    
    return { valid: true };
  }
  
  // For GET requests, only validate session (no CSRF token needed)
  if (request.method === 'GET') {
    const sessionId = getSessionIdFromRequest(request);
    if (!sessionId || !(await validateSession(sessionId))) {
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
  if (!sessionId || !(await validateSession(sessionId))) {
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
