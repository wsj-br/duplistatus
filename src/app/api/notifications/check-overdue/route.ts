import { withCSRF } from '@/lib/csrf-middleware';
import { NextResponse } from 'next/server';
import { checkOverdueBackups } from '@/lib/overdue-backup-checker';

// HTTP endpoint that uses the core function
export const POST = withCSRF(async () => {
  try {
    
    const result = await checkOverdueBackups();
    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ Error in POST endpoint:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Failed to check for overdue backups' },
      { status: 500 }
    );
  }
});