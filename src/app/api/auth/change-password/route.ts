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
        { reason: 'Missing new password' },
        ipAddress,
        userAgent
      );

      return NextResponse.json(
        { error: 'New password is required', errorCode: 'NEW_PASSWORD_REQUIRED' },
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
          errors: validation.errors
        },
        ipAddress,
        userAgent
      );

      return NextResponse.json(
        {
          error: 'New password does not meet policy requirements',
          errorCode: 'POLICY_NOT_MET',
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
        { reason: 'User not found' },
        ipAddress,
        userAgent
      );

      return NextResponse.json(
        { error: 'User not found', errorCode: 'USER_NOT_FOUND' },
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
          { reason: 'Invalid current password' },
          ipAddress,
          userAgent
        );

        return NextResponse.json(
          { error: 'Current password is incorrect', errorCode: 'CURRENT_PASSWORD_INCORRECT' },
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
          { reason: 'New password same as current' },
          ipAddress,
          userAgent
        );

        return NextResponse.json(
          { error: 'New password must be different from current password', errorCode: 'NEW_PASSWORD_SAME_AS_CURRENT' },
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
        was_forced: user.must_change_password === 1
      },
      ipAddress,
      userAgent
    );

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully',
      successCode: 'PASSWORD_CHANGED',
    });

  } catch (error) {
    console.error('[Auth] Change password error:', error);
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
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
      userAgent,
      error instanceof Error ? error.message : String(error)
    );

    return NextResponse.json(
      { error: 'Internal server error', errorCode: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}));

