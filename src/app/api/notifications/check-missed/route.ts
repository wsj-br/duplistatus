import { NextResponse } from 'next/server';
import { checkMissedBackups } from '@/lib/missed-backup-checker';

// HTTP endpoint that uses the core function
export async function POST() {
  try {
    const result = await checkMissedBackups();
    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ Error in POST endpoint:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Failed to check for missed backups' },
      { status: 500 }
    );
  }
} 