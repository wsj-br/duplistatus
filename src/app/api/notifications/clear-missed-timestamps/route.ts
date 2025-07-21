import { NextResponse } from 'next/server';
import { clearMissedBackupNotificationTimestamps } from '@/lib/missed-backup-checker';

// HTTP endpoint that uses the core function
export async function POST() {
  try {
    const result = await clearMissedBackupNotificationTimestamps();
    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ Error in POST endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to check for missed backups' },
      { status: 500 }
    );
  }
} 