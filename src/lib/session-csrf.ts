import { randomBytes } from 'crypto';
import { dbOps, ensureDatabaseInitialized } from './db';

// Session configuration
const SESSION_DURATION_HOURS = 24; // 24 hours
const CSRF_TOKEN_DURATION_MINUTES = 30; // 30 minutes

// Helper to check if sessions table exists (for graceful handling during migration)
function isSessionsTableAvailable(): boolean {
  try {
    // Ensure database is initialized before checking
    // This is important after restore when dbOps might be null
    if (!dbOps) {
      // Try to ensure database is initialized synchronously
      // Note: ensureDatabaseInitialized is async, but we can't make this async
      // So we'll just return false if dbOps is not available
      return false;
    }
    // Try to query sessions table
    dbOps.deleteExpiredSessions.run();
    return true;
  } catch (error) {
    // Table doesn't exist yet (pre-migration 4.0) or dbOps not ready
    return false;
  }
}

// Helper to wait for dbOps to be ready (for use after restore)
async function waitForDbOps(maxWaitMs: number = 2000): Promise<boolean> {
  const startTime = Date.now();
  
  while ((Date.now() - startTime) < maxWaitMs) {
    try {
      // Import db module and check if dbOps is available
      const { dbOps: ops } = await import('./db');
      if (ops && isSessionsTableAvailable()) {
        return true;
      }
    } catch (error) {
      // dbOps not ready yet
    }
    
    // Wait a bit before retrying
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  return false;
}

// Fallback in-memory storage for backward compatibility (pre-migration)
interface LegacySessionData {
  id: string;
  createdAt: Date;
  lastAccessed: Date;
  expiresAt: Date;
}

interface LegacyCSRFTokenData {
  token: string;
  createdAt: Date;
  expiresAt: Date;
}

const legacySessions = new Map<string, LegacySessionData>();
const legacyCSRFTokens = new Map<string, LegacyCSRFTokenData>();

// Helper function to clean up expired entries (fallback for legacy mode)
function cleanupExpiredLegacyEntries(): void {
  const now = new Date();
  
  // Clean up expired sessions
  for (const [sessionId, session] of legacySessions.entries()) {
    if (session.expiresAt <= now) {
      legacySessions.delete(sessionId);
      legacyCSRFTokens.delete(sessionId);
    }
  }
  
  // Clean up expired CSRF tokens
  for (const [sessionId, token] of legacyCSRFTokens.entries()) {
    if (token.expiresAt <= now) {
      legacyCSRFTokens.delete(sessionId);
    }
  }
}

// Session management
export function createSession(userId: string | null = null, ipAddress?: string, userAgent?: string): string {
  const sessionId = randomBytes(32).toString('hex');
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_DURATION_HOURS * 60 * 60 * 1000);
  
  // Try database-backed storage first
  // Important: Check both isSessionsTableAvailable() AND dbOps exists
  // This ensures we use database storage after restore when dbOps is ready
  const sessionsTableAvailable = isSessionsTableAvailable();

  if (sessionsTableAvailable && dbOps) {
    try {
      dbOps.createSession.run(
        sessionId,
        userId, // Can be null for unauthenticated sessions
        expiresAt.toISOString(),
        ipAddress || null,
        userAgent || null,
        null, // csrf_token (will be set when needed)
        null  // csrf_expires_at
      );
      
      // Periodic cleanup (every 10th session creation)
      if (Math.random() < 0.1) {
        cleanupExpiredSessions();
      }
      
      return sessionId;
    } catch (error) {
      console.warn('[Session] Failed to create database session, falling back to memory:', error);
    }
  }
  
  // Fallback to in-memory storage (legacy or error case)
  // IMPORTANT: After database restore, this should NOT be used for authenticated sessions
  // If we're creating a session with a userId but database is not ready, log a warning
  if (userId) {
    console.warn('[Session] CRITICAL: Creating authenticated session in memory instead of database. This may cause login loops after restore. userId:', userId);
  }
  
  const sessionData: LegacySessionData = {
    id: sessionId,
    createdAt: now,
    lastAccessed: now,
    expiresAt
  };
  
  legacySessions.set(sessionId, sessionData);
  
  if (legacySessions.size % 10 === 0) {
    cleanupExpiredLegacyEntries();
  }
  
  return sessionId;
}


export async function validateSession(sessionId: string): Promise<boolean> {
  // CRITICAL: After database restore, dbOps might be temporarily null
  // We must wait for it to be ready instead of falling back to memory
  // Otherwise, old in-memory sessions will be used, causing auth failures
  if (!dbOps || !isSessionsTableAvailable()) {
    // Wait for dbOps to be ready (this is fast if already ready)
    const dbReady = await waitForDbOps(2000);
    if (!dbReady) {
      console.warn('[Session] validateSession: dbOps not available after waiting, session validation failed');
      return false;
    }
  }
  
  // At this point, dbOps should be ready
  try {
    const session = dbOps!.getSessionById.get(sessionId) as {
      id: string;
      user_id: string | null;
      expires_at: string;
    } | undefined;
    
    if (!session) {
      return false;
    }
    
    // Session found in database - validate it
    const now = new Date();
    const expiresAt = new Date(session.expires_at);
    
    if (expiresAt <= now) {
      dbOps!.deleteSession.run(sessionId);
      return false;
    }
    
    // Valid session in database
    dbOps!.updateSessionAccess.run(sessionId);
    return true;
  } catch (error) {
    console.error('[Session] Error validating session:', error);
    return false;
  }
}

// Legacy sync version - for backward compatibility, but should not be used after restore
// This is kept for code that can't be easily converted to async
export function validateSessionSync(sessionId: string): boolean {
  // Try database-backed storage first
  if (isSessionsTableAvailable() && dbOps) {
    try {
      const session = dbOps.getSessionById.get(sessionId) as {
        id: string;
        user_id: string | null;
        expires_at: string;
      } | undefined;
      
      if (session) {
        // Session found in database - validate it
        const now = new Date();
        const expiresAt = new Date(session.expires_at);
        
        if (expiresAt <= now) {
          dbOps.deleteSession.run(sessionId);
          return false;
        }
        
        // Valid session in database
        dbOps.updateSessionAccess.run(sessionId);
        return true;
      }
    } catch (error) {
      console.warn('[Session] Failed to validate database session (sync):', error);
    }
  }
  
  // If database is not ready, return false (don't fall back to memory)
  // This prevents using stale in-memory sessions after restore
  console.warn('[Session] validateSessionSync: dbOps not ready, cannot validate session');
  return false;
}

export function updateSessionAccess(sessionId: string): void {
  if (isSessionsTableAvailable()) {
    try {
      dbOps.updateSessionAccess.run(sessionId);
      return;
    } catch (error) {
      console.warn('[Session] Failed to update database session access:', error);
    }
  }
  
  // Fallback to in-memory storage
  const session = legacySessions.get(sessionId);
  if (session) {
    session.lastAccessed = new Date();
  }
}

export function deleteSession(sessionId: string): void {
  if (isSessionsTableAvailable()) {
    try {
      dbOps.deleteSession.run(sessionId);
      return;
    } catch (error) {
      console.warn('[Session] Failed to delete database session:', error);
    }
  }
  
  // Fallback to in-memory storage
  legacySessions.delete(sessionId);
  legacyCSRFTokens.delete(sessionId);
}

// CSRF token management
export function generateCSRFToken(sessionId: string): string {
  // In development mode, return a dummy token since validation is bypassed
  if (process.env.NODE_ENV === 'development') {
    return 'dev-csrf-token';
  }
  
    const now = new Date();
  const expiresAt = new Date(now.getTime() + CSRF_TOKEN_DURATION_MINUTES * 60 * 1000);
  
  // Try database-backed storage first
  if (isSessionsTableAvailable()) {
    try {
      // Check if session exists and has a valid token
      const session = dbOps.getSessionById.get(sessionId) as {
        csrf_token: string | null;
        csrf_expires_at: string | null;
      } | undefined;
      
      if (session?.csrf_token && session?.csrf_expires_at) {
        const tokenExpiresAt = new Date(session.csrf_expires_at);
        // If token expires in more than 5 minutes, reuse it
        if (tokenExpiresAt.getTime() - now.getTime() > 5 * 60 * 1000) {
          return session.csrf_token;
    }
  }
  
  // Generate new token
  const token = randomBytes(32).toString('hex');
      dbOps.updateSessionCsrfToken.run(token, expiresAt.toISOString(), sessionId);
      
      return token;
    } catch (error) {
      console.warn('[Session] Failed to generate database CSRF token, falling back to memory:', error);
    }
  }
  
  // Fallback to in-memory storage
  const existing = legacyCSRFTokens.get(sessionId);
  if (existing && existing.expiresAt.getTime() - now.getTime() > 5 * 60 * 1000) {
    return existing.token;
  }
  
  const token = randomBytes(32).toString('hex');
  const tokenData: LegacyCSRFTokenData = {
    token,
    createdAt: now,
    expiresAt
  };
  
  legacyCSRFTokens.set(sessionId, tokenData);
  
  return token;
}

export function validateCSRFToken(sessionId: string, providedToken: string): boolean {
  // In development mode, bypass CSRF token validation
  if (process.env.NODE_ENV === 'development') {
    return true;
  }
  
  // Try database-backed storage first
  if (isSessionsTableAvailable()) {
    try {
      const session = dbOps.getSessionById.get(sessionId) as {
        csrf_token: string | null;
        csrf_expires_at: string | null;
      } | undefined;
      
      if (!session || !session.csrf_token) {
        return false;
      }
      
      // Check if token has expired
      if (session.csrf_expires_at) {
        const expiresAt = new Date(session.csrf_expires_at);
        if (expiresAt <= new Date()) {
          return false;
        }
      }
      
      return session.csrf_token === providedToken;
    } catch (error) {
      console.warn('[Session] Failed to validate database CSRF token, falling back to memory:', error);
    }
  }
  
  // Fallback to in-memory storage
  const stored = legacyCSRFTokens.get(sessionId);
  
  if (!stored) {
    return false;
  }
  
  if (stored.expiresAt <= new Date()) {
    legacyCSRFTokens.delete(sessionId);
    return false;
  }
  
  return stored.token === providedToken;
}

// Async version of validateCSRFToken (kept for compatibility)
export async function validateCSRFTokenAsync(sessionId: string, providedToken: string): Promise<boolean> {
  return validateCSRFToken(sessionId, providedToken);
}

export function deleteCSRFToken(sessionId: string): void {
  if (isSessionsTableAvailable()) {
    try {
      dbOps.updateSessionCsrfToken.run(null, null, sessionId);
      return;
    } catch (error) {
      console.warn('[Session] Failed to delete database CSRF token:', error);
    }
  }
  
  legacyCSRFTokens.delete(sessionId);
}

// Cleanup functions
export function cleanupExpiredSessions(): void {
  if (isSessionsTableAvailable()) {
    try {
      const result = dbOps.deleteExpiredSessions.run();
      if (result.changes > 0) {
        console.log(`[Session] Cleaned up ${result.changes} expired sessions`);
      }
      return;
    } catch (error) {
      console.warn('[Session] Failed to cleanup database sessions:', error);
    }
  }
  
  // Fallback to in-memory cleanup
  cleanupExpiredLegacyEntries();
}

export function cleanupExpiredCSRFTokens(): void {
  // CSRF tokens are stored with sessions, so this calls the session cleanup
  cleanupExpiredSessions();
}

// Combined cleanup
export function cleanupExpiredData(): void {
  cleanupExpiredSessions();
}

/**
 * Clear all in-memory session data
 * This is important after database restore to prevent stale sessions
 * from causing authentication issues
 */
export function clearAllLegacySessions(): void {
  legacySessions.clear();
  legacyCSRFTokens.clear();
}

/**
 * Clear all sessions from both database and in-memory storage
 * This is useful for logging out all users on server restart
 */
export function clearAllSessions(): void {
  // Clear in-memory sessions
  clearAllLegacySessions();
  
  // Clear database sessions
  if (isSessionsTableAvailable() && dbOps) {
    try {
      const result = dbOps.deleteAllSessions.run();
      console.log(`[Session] Cleared all sessions from database (${result.changes} sessions deleted)`);
    } catch (error) {
      console.warn('[Session] Failed to clear database sessions:', error);
    }
  }
}

// Get user ID from session (new helper for authentication)
export function getUserIdFromSession(sessionId: string): string | null {
  if (isSessionsTableAvailable() && dbOps) {
    try {
      const session = dbOps.getSessionById.get(sessionId) as {
        user_id: string;
      } | undefined;
      
      return session?.user_id || null;
    } catch (error) {
      console.warn('[Session] Failed to get user from database session:', error);
    }
  }
  
  // Legacy sessions don't have user association
  // IMPORTANT: If we reach here with an authenticated session, something is wrong
  // Log a warning to help debug login loop issues after restore
  const legacySession = legacySessions.get(sessionId);
  if (legacySession) {
    console.warn('[Session] CRITICAL: Trying to get userId from legacy session. This will fail authentication and may cause login loops.');
  }
  
  return null;
}

// Helper function to get session ID from request
export function getSessionIdFromRequest(request: Request): string | null {
  // Try NextRequest cookies first (preferred method)
  if ('cookies' in request && typeof request.cookies === 'object' && request.cookies !== null) {
    const nextRequest = request as { cookies: { get: (name: string) => { value: string } | undefined } };
    const sessionCookie = nextRequest.cookies.get('sessionId');
    if (sessionCookie?.value) {
      return sessionCookie.value;
    }
  }
  
  // Fallback to parsing cookie header manually
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) {
    return null;
  }
  
  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);
  
  // Try sessionId first (current standard), then fallback to session (legacy)
  return cookies['sessionId'] || cookies['session'] || null;
}

// Helper function to get CSRF token from request
export function getCSRFTokenFromRequest(request: Request): string | null {
  return request.headers.get('x-csrf-token');
}
