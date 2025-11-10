import { NextRequest, NextResponse } from 'next/server';
import { ensureDatabaseInitialized } from '@/lib/db';
import { withCSRF } from '@/lib/csrf-middleware';
import { getAuthContext } from '@/lib/auth-middleware';

export const GET = withCSRF(async (request: NextRequest) => {
  try {
    // Ensure database is ready
    await ensureDatabaseInitialized();

    // Get auth context
    const authContext = await getAuthContext(request);

    if (!authContext) {
      return NextResponse.json(
        { 
          authenticated: false,
          user: null
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: authContext.userId,
        username: authContext.username,
        isAdmin: authContext.isAdmin,
        mustChangePassword: authContext.mustChangePassword,
      },
    });

  } catch (error) {
    console.error('[Auth] Get current user error:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

