import { NextRequest, NextResponse } from 'next/server';
import { dbOps, ensureDatabaseInitialized } from '@/lib/db';
import { verifyPassword } from '@/lib/auth';
import { createSession, validateSession } from '@/lib/session-csrf';
import { AuditLogger } from '@/lib/audit-logger';
import { withCSRF } from '@/lib/csrf-middleware';
import { getClientIpAddress } from '@/lib/ip-utils';

interface LoginRequest {
  username: string;
  password: string;
}

export const POST = withCSRF(async (request: NextRequest) => {
  try {
    // Ensure database is ready
    await ensureDatabaseInitialized();

    // Parse request body
    const body = await request.json() as LoginRequest;
    const { username, password } = body;

    // Get client info for logging
    const ipAddress = getClientIpAddress(request);
    const userAgent = request.headers.get('user-agent') || 'unknown';
    console.log('[Login] Extracted IP address:', ipAddress, 'User agent:', userAgent);

    // Validate input
    if (!username || !password) {
      await AuditLogger.logAuth(
        'login',
        null,
        username || 'unknown',
        false,
        { reason: 'Missing credentials', userAgent },
        ipAddress
      );

      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Get user from database
    const user = dbOps.getUserByUsername.get(username) as {
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
      await AuditLogger.logAuth(
        'login',
        null,
        username,
        false,
        { reason: 'Invalid credentials', userAgent },
        ipAddress
      );

      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Check if user is locked
    if (user.locked_until) {
      const lockExpiry = new Date(user.locked_until);
      if (lockExpiry > new Date()) {
        const minutesRemaining = Math.ceil((lockExpiry.getTime() - Date.now()) / 60000);
        
        await AuditLogger.logAuth(
          'login',
          user.id,
          user.username,
          false,
          { reason: 'Account locked', minutes_remaining: minutesRemaining, userAgent },
          ipAddress
        );

        return NextResponse.json(
          { 
            error: 'Account is locked due to too many failed login attempts',
            lockedUntil: lockExpiry.toISOString(),
            minutesRemaining
          },
          { status: 403 }
        );
      } else {
        // Lock has expired, unlock the user
        dbOps.unlockUser.run(user.id);
      }
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password_hash);

    if (!isPasswordValid) {
      // Increment failed login attempts
      const newFailedAttempts = user.failed_login_attempts + 1;
      dbOps.incrementFailedLoginAttempts.run(user.id);

      // Lock account after 5 failed attempts (15 minutes)
      if (newFailedAttempts >= 5) {
        const lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        dbOps.updateUser.run(
          user.username,
          user.is_admin,
          user.must_change_password,
          null,
          null,
          newFailedAttempts,
          lockUntil.toISOString(),
          user.id
        );

        await AuditLogger.logAuth(
          'login',
          user.id,
          user.username,
          false,
          { 
            reason: 'Too many failed attempts',
            failed_attempts: newFailedAttempts,
            locked_until: lockUntil.toISOString(),
            userAgent
          },
          ipAddress
        );

        return NextResponse.json(
          { 
            error: 'Account locked due to too many failed login attempts',
            lockedUntil: lockUntil.toISOString(),
            minutesRemaining: 15
          },
          { status: 403 }
        );
      }

      await AuditLogger.logAuth(
        'login',
        user.id,
        user.username,
        false,
        { 
          reason: 'Invalid password',
          failed_attempts: newFailedAttempts,
          userAgent
        },
        ipAddress
      );

      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Update last login info (also resets failed login attempts)
    dbOps.updateUserLoginInfo.run(
      ipAddress,
      user.id
    );

    // Get existing session ID or create new one
    const existingSessionId = request.cookies.get('sessionId')?.value;
    let sessionId: string;

    if (existingSessionId && validateSession(existingSessionId)) {
      // Update existing session with user ID
      sessionId = existingSessionId;
      dbOps.updateSessionUser.run(
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
        must_change_password: user.must_change_password === 1,
        userAgent
      },
      ipAddress
    );

    // Prepare response
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        isAdmin: user.is_admin === 1,
        mustChangePassword: user.must_change_password === 1,
      },
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
      error instanceof Error ? error.message : String(error)
    );

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

