import { NextRequest, NextResponse } from 'next/server';
import { dbOps, ensureDatabaseInitialized } from '@/lib/db';
import { verifyPassword } from '@/lib/auth';
import { createSession, validateSession } from '@/lib/session-csrf';
import { AuditLogger } from '@/lib/audit-logger';
import { withCSRF } from '@/lib/csrf-middleware';
import { getClientIpAddress } from '@/lib/ip-utils';
import { hasKeyFileChanged, clearAllPasswords } from '@/lib/secrets';

const timestamp = () => new Date().toLocaleString(undefined, { hour12: false, timeZoneName: 'short' }).replace(',', '');

interface LoginRequest {
  username: string;
  password: string;
}

export const POST = withCSRF(async (request: NextRequest) => {
  try {
    // Ensure database is ready
    await ensureDatabaseInitialized();
    
    // Wait a moment to ensure dbOps is fully initialized after restore
    // This is critical - sessions must be created in the database, not memory
    // Keep trying until dbOps is available (with timeout)
    const maxWaitTime = 5000; // 5 seconds maximum wait
    const startTime = Date.now();
    let dbOpsReady = false;
    
    while (!dbOpsReady && (Date.now() - startTime) < maxWaitTime) {
      try {
        // Try to access dbOps - if it's ready, this won't throw
        const testModule = await import('@/lib/db');
        // Try to access a property to trigger the proxy
        if (testModule.dbOps && testModule.dbOps.getUserByUsername) {
          dbOpsReady = true;
          break;
        }
      } catch (error) {
        // dbOps not ready yet, wait and retry
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    if (!dbOpsReady) {
      console.error('[Login] dbOps not available after waiting, login will fail');
      return NextResponse.json(
        { error: 'Database is not ready. Please try again in a moment.', errorCode: 'DATABASE_NOT_READY' },
        { status: 503 }
      );
    }
    
    // Now safely import dbOps
    const { dbOps: dbOperations } = await import('@/lib/db');

    // Parse request body
    const body = await request.json() as LoginRequest;
    const { username, password } = body;

    // Get client info for logging
    const ipAddress = getClientIpAddress(request);
    const userAgent = request.headers.get('user-agent') || 'unknown';
    console.log(`[Login] ${timestamp()}: Login attempt for username: ${username || 'unknown'} from IP: ${ipAddress}`);

    // Validate input
    if (!username || !password) {
      console.error(`[Login] ${timestamp()}: Login failed - Missing credentials for username: ${username || 'unknown'} from IP: ${ipAddress}`);
      await AuditLogger.logAuth(
        'login',
        null,
        username || 'unknown',
        false,
        { reason: 'Missing credentials' },
        ipAddress,
        userAgent
      );

      return NextResponse.json(
        { error: 'Username and password are required', errorCode: 'REQUIRED_CREDENTIALS' },
        { status: 400 }
      );
    }

    // Get user from database
    // IMPORTANT: Use dbOperations (the one we waited for), not the module-level dbOps import
    const user = dbOperations.getUserByUsername.get(username) as {
      id: string;
      username: string;
      password_hash: string;
      is_admin: number;
      must_change_password: number;
      failed_login_attempts: number;
      locked_until: string | null;
    } | undefined;

    if (!user) {
      // User not found - use generic error message to prevent username enumeration
      console.error(`[Login] ${timestamp()}: Login failed - User not found: ${username} from IP: ${ipAddress}`);
      await AuditLogger.logAuth(
        'login',
        null,
        username,
        false,
        { reason: 'Invalid credentials' },
        ipAddress,
        userAgent
      );

      return NextResponse.json(
        { error: 'Invalid username or password', errorCode: 'INVALID_CREDENTIALS' },
        { status: 401 }
      );
    }

    // Check if user is locked
    if (user.locked_until) {
      const lockExpiry = new Date(user.locked_until);
      if (lockExpiry > new Date()) {
        const minutesRemaining = Math.ceil((lockExpiry.getTime() - Date.now()) / 60000);
        
        console.error(`[Login] ${timestamp()}: Login failed - Account locked for user: ${user.username} (${minutesRemaining} minutes remaining) from IP: ${ipAddress}`);
        await AuditLogger.logAuth(
          'login',
          user.id,
          user.username,
          false,
          { reason: 'Account locked', minutes_remaining: minutesRemaining },
          ipAddress,
          userAgent
        );

        return NextResponse.json(
          {
            error: 'Account is locked due to too many failed login attempts',
            errorCode: 'ACCOUNT_LOCKED',
            lockedUntil: lockExpiry.toISOString(),
            minutesRemaining
          },
          { status: 403 }
        );
      } else {
        // Lock has expired, unlock the user
        dbOperations.unlockUser.run(user.id);
      }
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password_hash);

    if (!isPasswordValid) {
      // Increment failed login attempts
      const newFailedAttempts = user.failed_login_attempts + 1;
      dbOperations.incrementFailedLoginAttempts.run(user.id);

      // Lock account after 5 failed attempts (15 minutes)
      // Note: incrementFailedLoginAttempts already handles locking when attempts >= 5
      if (newFailedAttempts >= 5) {
        const lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        console.error(`[Login] ${timestamp()}: Login failed - Account locked due to too many failed attempts for user: ${user.username} (attempt ${newFailedAttempts}) from IP: ${ipAddress}`);
        await AuditLogger.logAuth(
          'login',
          user.id,
          user.username,
          false,
          { 
            reason: 'Too many failed attempts',
            failed_attempts: newFailedAttempts,
            locked_until: lockUntil.toISOString()
          },
          ipAddress,
          userAgent
        );

        return NextResponse.json(
          {
            error: 'Account locked due to too many failed login attempts',
            errorCode: 'ACCOUNT_LOCKED',
            lockedUntil: lockUntil.toISOString(),
            minutesRemaining: 15
          },
          { status: 403 }
        );
      }

      console.error(`[Login] ${timestamp()}: Login failed - Invalid password for user: ${user.username} (attempt ${newFailedAttempts}/5) from IP: ${ipAddress}`);
      await AuditLogger.logAuth(
        'login',
        user.id,
        user.username,
        false,
        { 
          reason: 'Invalid password',
          failed_attempts: newFailedAttempts
        },
        ipAddress,
        userAgent
      );

      return NextResponse.json(
        { error: 'Invalid username or password', errorCode: 'INVALID_CREDENTIALS' },
        { status: 401 }
      );
    }

    // Update last login info (also resets failed login attempts)
    dbOperations.updateUserLoginInfo.run(
      ipAddress,
      user.id
    );

    // Get existing session ID or create new one
    const existingSessionId = request.cookies.get('sessionId')?.value;
    let sessionId: string;

    if (existingSessionId && await validateSession(existingSessionId)) {
      // Update existing session with user ID
      sessionId = existingSessionId;
      dbOperations.updateSessionUser.run(
        user.id,
        ipAddress,
        userAgent,
        sessionId
      );
    } else {
      // Create new session with user ID
      sessionId = createSession(user.id, ipAddress, userAgent);
    }

    // Log successful login
    await AuditLogger.logAuth(
      'login',
      user.id,
      user.username,
      true,
      { 
        is_admin: user.is_admin === 1,
        must_change_password: user.must_change_password === 1
      },
      ipAddress,
      userAgent
    );

    // Check if the master key file has changed
    let keyChanged = false;
    try {
      if (hasKeyFileChanged()) {
        console.warn(`[Login] ${timestamp()}: Master key file changed detected for user: ${user.username} from IP: ${ipAddress}`);
        
        // Clear all encrypted passwords
        clearAllPasswords();
        
        // Log to audit log
        await AuditLogger.logSystem(
          'master_key_changed',
          {
            user_id: user.id,
            username: user.username,
            action: 'passwords_cleared',
            reason: 'Master key file changed, all encrypted passwords cleared'
          },
          'success',
          undefined,
          userAgent
        );
        
        keyChanged = true;
      }
    } catch (error) {
      // Log error but don't fail login
      console.error(`[Login] ${timestamp()}: Error checking key file change:`, error instanceof Error ? error.message : String(error));
      await AuditLogger.logSystem(
        'master_key_check_failed',
        {
          user_id: user.id,
          username: user.username,
          error: error instanceof Error ? error.message : String(error)
        },
        'error',
        error instanceof Error ? error.message : String(error),
        userAgent
      );
    }

    // Prepare response
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        isAdmin: user.is_admin === 1,
        mustChangePassword: user.must_change_password === 1,
      },
      keyChanged,
    });

    // Set session cookie
    // Note: Secure cookies are disabled by default to support HTTP connections
    // Set SECURE_COOKIES=true in .env if you're using HTTPS
    const useSecureCookies = process.env.SECURE_COOKIES === 'true';
    
    response.cookies.set('sessionId', sessionId, {
      httpOnly: true,
      secure: useSecureCookies,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('[Auth] Login error:', error);
    
    const userAgent = request.headers.get('user-agent') || 'unknown';
    await AuditLogger.logAuth(
      'login',
      null,
      'unknown',
      false,
      { 
        reason: 'Internal error',
        error: error instanceof Error ? error.message : String(error)
      },
      'unknown',
      userAgent,
      error instanceof Error ? error.message : String(error)
    );

    return NextResponse.json(
      { error: 'Internal server error', errorCode: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
});

