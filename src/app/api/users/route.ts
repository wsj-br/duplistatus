import { NextRequest, NextResponse } from 'next/server';
import { dbOps, ensureDatabaseInitialized } from '@/lib/db';
import { hashPassword, generateSecurePassword, validatePassword } from '@/lib/auth';
import { AuditLogger } from '@/lib/audit-logger';
import { withCSRF } from '@/lib/csrf-middleware';
import { requireAdmin } from '@/lib/auth-middleware';
import { randomUUID } from 'crypto';
import { getClientIpAddress } from '@/lib/ip-utils';
import { grantFromList, grantsByUserId, parseServerGrantInput, saveUserServerGrant } from '@/lib/user-server-grants';

// GET /api/users - List all users with pagination and search
export const GET = withCSRF(requireAdmin(async (request: NextRequest, authContext) => {
  try {
    await ensureDatabaseInitialized();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const search = searchParams.get('search') || '';

    // Get all users
    const allUsers = dbOps.getAllUsers.all() as Array<{
      id: string;
      username: string;
      is_admin: number;
      must_change_password: number;
      created_at: string;
      updated_at: string;
      last_login_at: string | null;
      last_login_ip: string | null;
      failed_login_attempts: number;
      locked_until: string | null;
      access_all_servers: number;
    }>;

    // Filter by search term if provided
    let filteredUsers = allUsers;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredUsers = allUsers.filter(user => 
        user.username.toLowerCase().includes(searchLower)
      );
    }

    // Pagination
    const total = filteredUsers.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    // Format response
    const serverGrants = grantsByUserId();
    const users = paginatedUsers.map(user => {
      const grant = grantFromList(
        user.is_admin === 1,
        user.access_all_servers,
        serverGrants.get(user.id) ?? []
      );
      return {
      id: user.id,
      username: user.username,
      isAdmin: user.is_admin === 1,
      mustChangePassword: user.must_change_password === 1,
      accessAllServers: grant.accessAllServers,
      serverIds: grant.serverIds,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      lastLoginAt: user.last_login_at,
      lastLoginIp: user.last_login_ip,
      failedLoginAttempts: user.failed_login_attempts,
      lockedUntil: user.locked_until,
      isLocked: user.locked_until ? new Date(user.locked_until) > new Date() : false,
    };
    });

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('[Users] List users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}));

// POST /api/users - Create new user
export const POST = withCSRF(requireAdmin(async (request: NextRequest, authContext) => {
  try {
    await ensureDatabaseInitialized();

    const body = await request.json();
    const { username, password, isAdmin = false, requirePasswordChange = true, accessAllServers, serverIds } = body;
    const parsedGrant = parseServerGrantInput(Boolean(isAdmin), accessAllServers, serverIds);
    if ('error' in parsedGrant) {
      return NextResponse.json({ error: parsedGrant.error }, { status: 400 });
    }

    // Validate input
    if (!username || typeof username !== 'string' || username.trim().length === 0) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    if (username.length < 3 || username.length > 50) {
      return NextResponse.json(
        { error: 'Username must be between 3 and 50 characters' },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingUser = dbOps.getUserByUsername.get(username.trim().toLowerCase()) as {
      id: string;
    } | undefined;

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 409 }
      );
    }

    // Generate or use provided password
    let finalPassword: string;
    let isTemporaryPassword = false;

    if (password && password.trim().length > 0) {
      // Validate provided password
      const validation = validatePassword(password);
      if (!validation.valid) {
        return NextResponse.json(
          { 
            error: 'Password does not meet policy requirements',
            validationErrors: validation.errors
          },
          { status: 400 }
        );
      }
      finalPassword = password;
    } else {
      // Generate temporary password
      finalPassword = generateSecurePassword(12);
      isTemporaryPassword = true;
    }

    // Hash password
    const passwordHash = await hashPassword(finalPassword);

    // Create user
    const userId = randomUUID();
    dbOps.createUser.run(
      userId,
      username.trim().toLowerCase(),
      passwordHash,
      isAdmin ? 1 : 0,
      requirePasswordChange ? 1 : 0,
      1
    );
    try {
      saveUserServerGrant(userId, parsedGrant.grant);
    } catch (error) {
      dbOps.deleteUser.run(userId);
      if (error instanceof Error && error.message === 'UNKNOWN_SERVER') {
        return NextResponse.json({ error: 'One or more servers were not found' }, { status: 400 });
      }
      throw error;
    }

    // Get created user
    const newUser = dbOps.getUserById.get(userId) as {
      id: string;
      username: string;
      is_admin: number;
      must_change_password: number;
    } | undefined;

    if (!newUser) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    // Log audit event
    const ipAddress = getClientIpAddress(request);
    const userAgent = request.headers.get('user-agent') || 'unknown';

    await AuditLogger.logUserManagement(
      'user_created',
      authContext.userId,
      authContext.username,
      userId,
      username.trim().toLowerCase(),
      {
        is_admin: isAdmin,
        must_change_password: requirePasswordChange,
        temp_password: isTemporaryPassword,
        created_by: authContext.username,
      },
      ipAddress,
      userAgent
    );

    // Return user (without password hash) and temporary password if generated
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
        id: newUser.id,
        username: newUser.username,
        isAdmin: newUser.is_admin === 1,
        mustChangePassword: newUser.must_change_password === 1,
        accessAllServers: parsedGrant.grant.accessAllServers,
        serverIds: parsedGrant.grant.serverIds,
      },
    };

    // Only return temporary password once (if generated)
    if (isTemporaryPassword) {
      response.temporaryPassword = finalPassword;
    }

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('[Users] Create user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}));

