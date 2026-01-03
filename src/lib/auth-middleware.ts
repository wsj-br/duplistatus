import { NextRequest, NextResponse } from 'next/server';
import { dbOps, ensureDatabaseInitialized } from './db';
import { validateSession, getUserIdFromSession } from './session-csrf';

/**
 * Authentication middleware for protecting API routes
 * Checks if user is authenticated and has valid session
 */

export interface AuthenticatedRequest extends NextRequest {
  userId?: string;
  username?: string;
  isAdmin?: boolean;
}

export interface AuthContext {
  userId: string;
  username: string;
  isAdmin: boolean;
  mustChangePassword: boolean;
}

/**
 * Get authentication context from request
 * Returns user information if authenticated, null otherwise
 */
export async function getAuthContext(request: NextRequest): Promise<AuthContext | null> {
  try {
    // Ensure database is ready
    await ensureDatabaseInitialized();
    
    // Wait for dbOps to be fully initialized after restore
    // This is important after database restore when dbOps might have been reset
    // Keep trying until dbOps is available (with shorter timeout for API requests)
    const maxWaitTime = 2000; // 2 seconds maximum wait
    const startTime = Date.now();
    let dbOpsReady = false;
    
    while (!dbOpsReady && (Date.now() - startTime) < maxWaitTime) {
      try {
        // Try to access dbOps - if it's ready, this won't throw
        const testModule = await import('./db');
        if (testModule.dbOps && testModule.dbOps.getUserById) {
          dbOpsReady = true;
          break;
        }
      } catch (error) {
        // dbOps not ready yet, wait and retry
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }

    if (!dbOpsReady) {
      console.warn('[Auth] dbOps not available after waiting, cannot authenticate');
      return null;
    }

    // Get session ID from cookie
    const sessionId = request.cookies.get('sessionId')?.value;
    if (!sessionId) {
      return null;
    }

    // Validate session
    const isValid = await validateSession(sessionId);
    if (!isValid) {
      return null;
    }

    // Get user ID from session
    const userId = getUserIdFromSession(sessionId);
    if (!userId) {
      return null;
    }

    // Get user from database
    const user = dbOps.getUserById.get(userId) as {
      id: string;
      username: string;
      is_admin: number;
      must_change_password: number;
      locked_until: string | null;
    } | undefined;

    if (!user) {
      return null;
    }

    // Check if user is locked
    if (user.locked_until) {
      const lockExpiry = new Date(user.locked_until);
      if (lockExpiry > new Date()) {
        return null; // User is still locked
      }
    }

    return {
      userId: user.id,
      username: user.username,
      isAdmin: user.is_admin === 1,
      mustChangePassword: user.must_change_password === 1,
    };
  } catch (error) {
    console.error('[Auth] Error getting auth context:', error);
    return null;
  }
}

/**
 * Middleware wrapper to require authentication
 * Returns 401 if not authenticated
 */
export function requireAuth(
  handler: (request: NextRequest, context: AuthContext) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const authContext = await getAuthContext(request);

    if (!authContext) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return handler(request, authContext);
  };
}

/**
 * Middleware wrapper to require admin role
 * Returns 401 if not authenticated, 403 if not admin
 */
export function requireAdmin(
  handler: (request: NextRequest, context: AuthContext) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const authContext = await getAuthContext(request);

    if (!authContext) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!authContext.isAdmin) {
      return NextResponse.json(
        { error: 'Administrator access required' },
        { status: 403 }
      );
    }

    return handler(request, authContext);
  };
}

/**
 * Middleware wrapper for optional authentication
 * Passes null context if not authenticated
 */
export function optionalAuth(
  handler: (request: NextRequest, context: AuthContext | null) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const authContext = await getAuthContext(request);
    return handler(request, authContext);
  };
}

