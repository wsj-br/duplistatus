import { NextRequest, NextResponse } from 'next/server';
import { withCSRF } from '@/lib/csrf-middleware';
import { dbOps, ensureDatabaseInitialized } from '@/lib/db';

// GET /api/auth/admin-must-change-password - Check if admin user must change password
// This endpoint is public (no authentication required) as it only returns a boolean flag
export const GET = withCSRF(async (request: NextRequest) => {
  try {
    await ensureDatabaseInitialized();

    // Get admin user
    const adminUser = dbOps.getUserByUsername.get('admin') as {
      must_change_password: number;
    } | undefined;

    if (!adminUser) {
      // If admin user doesn't exist, return false (no tip needed)
      return NextResponse.json({
        mustChangePassword: false,
      });
    }

    return NextResponse.json({
      mustChangePassword: adminUser.must_change_password === 1,
    });

  } catch (error) {
    console.error('[Auth] Check admin must change password error:', error);
    
    // On error, return false to avoid showing tip if there's a database issue
    return NextResponse.json(
      { mustChangePassword: false },
      { status: 200 }
    );
  }
});
