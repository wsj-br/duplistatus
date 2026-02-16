import { NextRequest, NextResponse } from 'next/server';
import { withCSRF } from '@/lib/csrf-middleware';
import { getAuthContext } from '@/lib/auth-middleware';

export const GET = withCSRF(async (request: NextRequest) => {
  try {
    // Get auth context (it will ensure database is ready)
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
      { error: 'Internal server error', errorCode: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
});

