import { NextResponse } from 'next/server';
import { getDuplicateServers } from '@/lib/db-utils';
import { withCSRF } from '@/lib/csrf-middleware';
import { requireAuth } from '@/lib/auth-middleware';

export const GET = withCSRF(
  requireAuth(async (request, context) => {
    try {
      // Only admins can view duplicate servers
      if (!context.isAdmin) {
        return NextResponse.json(
          { error: 'Administrator access required' },
          { status: 403 }
        );
      }

      const duplicates = getDuplicateServers();
      
      return NextResponse.json(duplicates);
    } catch (error) {
      console.error('Error fetching duplicate servers:', error instanceof Error ? error.message : String(error));
      return NextResponse.json(
        { error: 'Failed to fetch duplicate servers' },
        { status: 500 }
      );
    }
  })
);
