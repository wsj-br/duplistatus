import { randomBytes } from 'crypto';

// Session configuration
const SESSION_DURATION_HOURS = 24; // 24 hours
const CSRF_TOKEN_DURATION_MINUTES = 30; // 30 minutes

// In-memory storage for sessions and CSRF tokens
interface SessionData {
  id: string;
  createdAt: Date;
  lastAccessed: Date;
  expiresAt: Date;
}

interface CSRFTokenData {
  token: string;
  createdAt: Date;
  expiresAt: Date;
}

const sessions = new Map<string, SessionData>();
const csrfTokens = new Map<string, CSRFTokenData>();

// Helper function to clean up expired entries
function cleanupExpiredEntries(): void {
  const now = new Date();
  
  // Clean up expired sessions
  for (const [sessionId, session] of sessions.entries()) {
    if (session.expiresAt <= now) {
      sessions.delete(sessionId);
      csrfTokens.delete(sessionId); // Also remove associated CSRF token
    }
  }
  
  // Clean up expired CSRF tokens (in case they exist without sessions)
  for (const [sessionId, token] of csrfTokens.entries()) {
    if (token.expiresAt <= now) {
      csrfTokens.delete(sessionId);
    }
  }
}

// Session management
export function createSession(): string {
  const sessionId = randomBytes(32).toString('hex');
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_DURATION_HOURS * 60 * 60 * 1000);
  
  const sessionData: SessionData = {
    id: sessionId,
    createdAt: now,
    lastAccessed: now,
    expiresAt
  };
  
  sessions.set(sessionId, sessionData);
  
  // Clean up expired entries periodically
  if (sessions.size % 10 === 0) {
    cleanupExpiredEntries();
  }
  
  return sessionId;
}


export function validateSession(sessionId: string): boolean {
  // In development mode, bypass session validation to avoid issues with in-memory sessions
  if (process.env.NODE_ENV === 'development') {
    return true;
  }
  
  const session = sessions.get(sessionId);
  if (!session) {
    return false;
  }
  
  // Check if session has expired
  const now = new Date();
  if (session.expiresAt <= now) {
    sessions.delete(sessionId);
    csrfTokens.delete(sessionId);
    return false;
  }
  
  return true;
}

// Async version of validateSession (kept for compatibility)
export async function validateSessionAsync(sessionId: string): Promise<boolean> {
  return validateSession(sessionId);
}

export function updateSessionAccess(sessionId: string): void {
  const session = sessions.get(sessionId);
  if (session) {
    session.lastAccessed = new Date();
  }
}

export function deleteSession(sessionId: string): void {
  sessions.delete(sessionId);
  csrfTokens.delete(sessionId);
}

// CSRF token management
export function generateCSRFToken(sessionId: string): string {
  // In development mode, return a dummy token since validation is bypassed
  if (process.env.NODE_ENV === 'development') {
    return 'dev-csrf-token';
  }
  
  // First, check if we have a valid existing token
  const existing = csrfTokens.get(sessionId);
  if (existing) {
    const now = new Date();
    // If token expires in more than 5 minutes, reuse it to prevent overwrites in parallel requests
    if (existing.expiresAt.getTime() - now.getTime() > 5 * 60 * 1000) {
      return existing.token;
    }
  }
  
  // Generate new token
  const token = randomBytes(32).toString('hex');
  const now = new Date();
  const expiresAt = new Date(now.getTime() + CSRF_TOKEN_DURATION_MINUTES * 60 * 1000);
  
  const tokenData: CSRFTokenData = {
    token,
    createdAt: now,
    expiresAt
  };
  
  csrfTokens.set(sessionId, tokenData);
  
  return token;
}

export function validateCSRFToken(sessionId: string, providedToken: string): boolean {
  // In development mode, bypass CSRF token validation to avoid issues with in-memory sessions
  if (process.env.NODE_ENV === 'development') {
    return true;
  }
  
  const stored = csrfTokens.get(sessionId);
  
  if (!stored) {
    return false;
  }
  
  // Check if token has expired
  if (stored.expiresAt <= new Date()) {
    csrfTokens.delete(sessionId);
    return false;
  }
  
  return stored.token === providedToken;
}

// Async version of validateCSRFToken (kept for compatibility)
export async function validateCSRFTokenAsync(sessionId: string, providedToken: string): Promise<boolean> {
  return validateCSRFToken(sessionId, providedToken);
}

export function deleteCSRFToken(sessionId: string): void {
  csrfTokens.delete(sessionId);
}

// Cleanup functions (now just call the internal cleanup)
export function cleanupExpiredSessions(): void {
  cleanupExpiredEntries();
}

export function cleanupExpiredCSRFTokens(): void {
  cleanupExpiredEntries();
}

// Combined cleanup
export function cleanupExpiredData(): void {
  cleanupExpiredEntries();
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
