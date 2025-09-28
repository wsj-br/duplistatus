import { randomBytes } from 'crypto';
import { dbOps } from './db';

// Session configuration
const SESSION_DURATION_HOURS = 24; // 24 hours
const CSRF_TOKEN_DURATION_MINUTES = 30; // 30 minutes

// Session management
export function createSession(): string {
  const sessionId = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_DURATION_HOURS * 60 * 60 * 1000).toISOString();
  
  try {
    dbOps.createSession.run({
      id: sessionId,
      expires_at: expiresAt
    });
    
    return sessionId;
  } catch (error) {
    console.error('Failed to create session:', error);
    throw new Error('Failed to create session');
  }
}

export function validateSession(sessionId: string): boolean {
  try {
    const session = dbOps.getSession.get(sessionId) as { id: string } | undefined;
    return !!session;
  } catch (error) {
    console.error('Failed to validate session:', error);
    return false;
  }
}

export function updateSessionAccess(sessionId: string): void {
  try {
    dbOps.updateSessionAccess.run(sessionId);
  } catch (error) {
    console.error('Failed to update session access:', error);
  }
}

export function deleteSession(sessionId: string): void {
  try {
    dbOps.deleteSession.run(sessionId);
  } catch (error) {
    console.error('Failed to delete session:', error);
  }
}

// CSRF token management
export function generateCSRFToken(sessionId: string): string {
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + CSRF_TOKEN_DURATION_MINUTES * 60 * 1000).toISOString();
  
  try {
    dbOps.createCSRFToken.run({
      session_id: sessionId,
      token: token,
      expires_at: expiresAt
    });
    
    return token;
  } catch (error) {
    console.error('Failed to generate CSRF token:', error);
    throw new Error('Failed to generate CSRF token');
  }
}

export function validateCSRFToken(sessionId: string, providedToken: string): boolean {
  try {
    const stored = dbOps.getCSRFToken.get(sessionId) as { token: string } | undefined;
    
    if (!stored) {
      return false;
    }
    
    return stored.token === providedToken;
  } catch (error) {
    console.error('Failed to validate CSRF token:', error);
    return false;
  }
}

export function deleteCSRFToken(sessionId: string): void {
  try {
    dbOps.deleteCSRFToken.run(sessionId);
  } catch (error) {
    console.error('Failed to delete CSRF token:', error);
  }
}

// Cleanup functions
export function cleanupExpiredSessions(): void {
  try {
    dbOps.cleanupExpiredSessions.run();
  } catch (error) {
    console.error('Failed to cleanup expired sessions:', error);
  }
}

export function cleanupExpiredCSRFTokens(): void {
  try {
    dbOps.cleanupExpiredCSRFTokens.run();
  } catch (error) {
    console.error('Failed to cleanup expired CSRF tokens:', error);
  }
}

// Combined cleanup
export function cleanupExpiredData(): void {
  cleanupExpiredSessions();
  cleanupExpiredCSRFTokens();
}

// Helper function to get session ID from request
export function getSessionIdFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) {
    return null;
  }
  
  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);
  
  return cookies['session'] || null;
}

// Helper function to get CSRF token from request
export function getCSRFTokenFromRequest(request: Request): string | null {
  return request.headers.get('x-csrf-token');
}
