import { NextRequest, NextResponse } from 'next/server';
import { dbOps, ensureDatabaseInitialized } from '@/lib/db';
import { hashPassword, generateSecurePassword, validatePassword } from '@/lib/auth';
import { AuditLogger } from '@/lib/audit-logger';
import { withCSRF } from '@/lib/csrf-middleware';
import { requireAdmin } from '@/lib/auth-middleware';
import { getClientIpAddress } from '@/lib/ip-utils';
import { parseServerGrantInput, readUserServerGrant, saveUserServerGrant } from '@/lib/user-server-grants';

// PATCH /api/users/[id] - Update user
export const PATCH = withCSRF(requireAdmin(async (request: NextRequest, authContext) => {
  try {
    await ensureDatabaseInitialized();

    const pathname = request.nextUrl.pathname;
    const userId = pathname.split('/').pop() || '';

    const body = await request.json();
    const { username, isAdmin, requirePasswordChange, resetPassword, password, accessAllServers, serverIds } = body;

    // Get existing user
    const existingUser = dbOps.getUserById.get(userId) as {
      id: string;
      username: string;
      is_admin: number;
      must_change_password: number;
      access_all_servers: number;
    } | undefined;

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const ipAddress = getClientIpAddress(request);
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Check if trying to change username
    if (username && username !== existingUser.username) {
      // Check if new username already exists
      const usernameCheck = dbOps.getUserByUsername.get(username.trim().toLowerCase()) as {
        id: string;
      } | undefined;

      if (usernameCheck && usernameCheck.id !== userId) {
        return NextResponse.json(
          { error: 'Username already exists' },
          { status: 409 }
        );
      }
    }

    const nextIsAdmin = isAdmin !== undefined ? Boolean(isAdmin) : existingUser.is_admin === 1;
    const grantTouched = isAdmin !== undefined || accessAllServers !== undefined || serverIds !== undefined;
    let savedGrant = readUserServerGrant(
      userId,
      existingUser.is_admin === 1,
      existingUser.access_all_servers ?? 1
    );
    if (grantTouched) {
      const parsedGrant = parseServerGrantInput(nextIsAdmin, nextIsAdmin ? true : accessAllServers, serverIds);
      if ('error' in parsedGrant) {
        return NextResponse.json({ error: parsedGrant.error }, { status: 400 });
      }
      try {
        saveUserServerGrant(userId, parsedGrant.grant);
        savedGrant = parsedGrant.grant;
      } catch (error) {
        if (error instanceof Error && error.message === 'UNKNOWN_SERVER') {
          return NextResponse.json({ error: 'One or more servers were not found' }, { status: 400 });
        }
        throw error;
      }
    }

    // Prepare update data
    const updateData: {
      username?: string;
      is_admin?: number;
      must_change_password?: number;
      password_hash?: string;
    } = {};

    if (username !== undefined) {
      updateData.username = username.trim().toLowerCase();
    }

    if (isAdmin !== undefined) {
      updateData.is_admin = isAdmin ? 1 : 0;
    }

    if (requirePasswordChange !== undefined) {
      updateData.must_change_password = requirePasswordChange ? 1 : 0;
    }

    // Handle password reset. A supplied password is used as-is after policy
    // checks; otherwise a temporary password is generated. must_change_password
    // stays required unless the caller explicitly clears it.
    if (resetPassword === true) {
      let temporaryPassword: string | undefined;
      let passwordToSet: string;

      if (typeof password === 'string' && password.length > 0) {
        const validation = validatePassword(password);
        if (!validation.valid) {
          return NextResponse.json(
            {
              error: 'Password does not meet policy requirements',
              validationErrors: validation.errors,
            },
            { status: 400 }
          );
        }
        passwordToSet = password;
      } else {
        temporaryPassword = generateSecurePassword(12);
        passwordToSet = temporaryPassword;
      }

      const mustChangePassword = requirePasswordChange === false ? 0 : 1;
      updateData.password_hash = await hashPassword(passwordToSet);
      updateData.must_change_password = mustChangePassword;

      // Update user
      dbOps.updateUser.run(
        updateData.username || existingUser.username,
        updateData.is_admin !== undefined ? updateData.is_admin : existingUser.is_admin,
        updateData.must_change_password,
        userId
      );

      // Update password if reset
      if (updateData.password_hash) {
        dbOps.updateUserPassword.run(
          updateData.password_hash,
          updateData.must_change_password,
          userId
        );
      }

      // Log audit event
      await AuditLogger.logUserManagement(
        'password_reset',
        authContext.userId,
        authContext.username,
        userId,
        existingUser.username,
        {
          reset_by: authContext.username,
          temp_password: temporaryPassword !== undefined,
          must_change_password: mustChangePassword === 1,
        },
        ipAddress,
        userAgent
      );

      // Get updated user
      const updatedUser = dbOps.getUserById.get(userId) as {
        id: string;
        username: string;
        is_admin: number;
        must_change_password: number;
      } | undefined;

      const response: {
        user: {
          id: string;
          username: string;
          isAdmin: boolean;
          mustChangePassword: boolean;
          accessAllServers: boolean;
          serverIds: string[];
        };
        temporaryPassword?: string;
      } = {
        user: {
          id: updatedUser!.id,
          username: updatedUser!.username,
          isAdmin: updatedUser!.is_admin === 1,
          mustChangePassword: updatedUser!.must_change_password === 1,
          accessAllServers: savedGrant.accessAllServers,
          serverIds: savedGrant.serverIds,
        },
      };

      if (temporaryPassword !== undefined) {
        response.temporaryPassword = temporaryPassword;
      }

      return NextResponse.json(response);
    }

    // Regular update (no password reset)
    dbOps.updateUser.run(
      updateData.username || existingUser.username,
      updateData.is_admin !== undefined ? updateData.is_admin : existingUser.is_admin,
      updateData.must_change_password !== undefined ? updateData.must_change_password : existingUser.must_change_password,
      userId
    );

    // Log audit event
    const changes: Record<string, unknown> = {};
    if (username !== undefined && username !== existingUser.username) {
      changes.username = { from: existingUser.username, to: username };
    }
    if (isAdmin !== undefined && isAdmin !== (existingUser.is_admin === 1)) {
      changes.is_admin = { from: existingUser.is_admin === 1, to: isAdmin };
    }
    if (requirePasswordChange !== undefined && requirePasswordChange !== (existingUser.must_change_password === 1)) {
      changes.must_change_password = { from: existingUser.must_change_password === 1, to: requirePasswordChange };
    }

    await AuditLogger.logUserManagement(
      'user_updated',
      authContext.userId,
      authContext.username,
      userId,
      existingUser.username,
      changes,
      ipAddress,
      userAgent
    );

    // Get updated user
    const updatedUser = dbOps.getUserById.get(userId) as {
      id: string;
      username: string;
      is_admin: number;
      must_change_password: number;
    } | undefined;

    return NextResponse.json({
      user: {
        id: updatedUser!.id,
        username: updatedUser!.username,
        isAdmin: updatedUser!.is_admin === 1,
        mustChangePassword: updatedUser!.must_change_password === 1,
        accessAllServers: savedGrant.accessAllServers,
        serverIds: savedGrant.serverIds,
      },
    });

  } catch (error) {
    console.error('[Users] Update user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}));

// DELETE /api/users/[id] - Delete user
export const DELETE = withCSRF(requireAdmin(async (request: NextRequest, authContext) => {
  try {
    await ensureDatabaseInitialized();

    const pathname = request.nextUrl.pathname;
    const userId = pathname.split('/').pop() || '';

    // Get user to delete
    const userToDelete = dbOps.getUserById.get(userId) as {
      id: string;
      username: string;
      is_admin: number;
    } | undefined;

    if (!userToDelete) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent deleting yourself
    if (userId === authContext.userId) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    // Prevent deleting last admin
    if (userToDelete.is_admin === 1) {
      const allUsers = dbOps.getAllUsers.all() as Array<{
        id: string;
        is_admin: number;
      }>;

      const adminCount = allUsers.filter(u => u.is_admin === 1).length;

      if (adminCount <= 1) {
        return NextResponse.json(
          { error: 'Cannot delete the last admin account' },
          { status: 400 }
        );
      }
    }

    const ipAddress = getClientIpAddress(request);
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Log audit event before deletion
    await AuditLogger.logUserManagement(
      'user_deleted',
      authContext.userId,
      authContext.username,
      userId,
      userToDelete.username,
      {
        deleted_username: userToDelete.username,
        was_admin: userToDelete.is_admin === 1,
        deleted_by: authContext.username,
      },
      ipAddress,
      userAgent
    );

    // Delete user (cascade will delete sessions)
    dbOps.deleteUser.run(userId);

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    });

  } catch (error) {
    console.error('[Users] Delete user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}));

