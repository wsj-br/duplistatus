import { NextRequest, NextResponse } from 'next/server';
import { dbOps, ensureDatabaseInitialized } from '@/lib/db';
import { verifyPassword, validatePassword, hashPassword } from '@/lib/auth';
import { AuditLogger } from '@/lib/audit-logger';
import { withCSRF } from '@/lib/csrf-middleware';
import { requireAuth } from '@/lib/auth-middleware';
import { getClientIpAddress } from '@/lib/ip-utils';

interface ChangePasswordRequest {
  currentPassword?: string;
  newPassword: string;
}

export const POST = withCSRF(requireAuth(async (request: NextRequest, authContext) => {
  try {
    // Ensure database is ready
    await ensureDatabaseInitialized();

    // Parse request body
    const body = await request.json() as ChangePasswordRequest;
    const { currentPassword, newPassword } = body;

    // Get client info for logging
    const ipAddress = getClientIpAddress(request);
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Validate input
    if (!newPassword) {
      await AuditLogger.logAuth(
        'change_password',
        authContext.userId,
        authContext.username,
        false,
        { reason: 'Missing new password', userAgent },
        ipAddress
      );

      return NextResponse.json(
        { error: 'New password is required' },
        { status: 400 }
      );
    }

    // Validate new password against policy
    const validation = validatePassword(newPassword);
    if (!validation.valid) {
      await AuditLogger.logAuth(
        'change_password',
        authContext.userId,
        authContext.username,
        false,
        { 
          reason: 'Password policy violation',
          errors: validation.errors,
          userAgent
        },
        ipAddress
      );

      return NextResponse.json(
        { 
          error: 'New password does not meet policy requirements',
          validationErrors: validation.errors
        },
        { status: 400 }
      );
    }

    // Get user from database (with password hash for verification)
    const user = dbOps.getUserByIdWithPassword.get(authContext.userId) as {
      id: string;
      username: string;
      password_hash: string;
      is_admin: number;
      must_change_password: number;
    } | undefined;

    if (!user) {
      await AuditLogger.logAuth(
        'change_password',
        authContext.userId,
        authContext.username,
        false,
        { reason: 'User not found', userAgent },
        ipAddress
      );

      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // If current password is provided, verify it (for non-forced changes)
    // If must_change_password is set, skip current password verification
    if (currentPassword && user.must_change_password === 0) {
      const isCurrentPasswordValid = await verifyPassword(currentPassword, user.password_hash);

      if (!isCurrentPasswordValid) {
        await AuditLogger.logAuth(
          'change_password',
          authContext.userId,
          authContext.username,
          false,
          { reason: 'Invalid current password', userAgent },
          ipAddress
        );

        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 401 }
        );
      }

      // Check if new password is same as current
      const isSamePassword = await verifyPassword(newPassword, user.password_hash);
      if (isSamePassword) {
        await AuditLogger.logAuth(
          'change_password',
          authContext.userId,
          authContext.username,
          false,
          { reason: 'New password same as current', userAgent },
          ipAddress
        );

        return NextResponse.json(
          { error: 'New password must be different from current password' },
          { status: 400 }
        );
      }
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password and clear must_change_password flag
    dbOps.updateUserPassword.run(
      newPasswordHash,
      0, // Clear must_change_password flag
      user.id
    );

    // Log successful password change
    await AuditLogger.logAuth(
      'change_password',
      authContext.userId,
      authContext.username,
      true,
      { 
        was_forced: user.must_change_password === 1,
        userAgent
      },
      ipAddress
    );

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully',
    });

  } catch (error) {
    console.error('[Auth] Change password error:', error);
    
    await AuditLogger.logAuth(
      'change_password',
      authContext.userId,
      authContext.username,
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
}));

