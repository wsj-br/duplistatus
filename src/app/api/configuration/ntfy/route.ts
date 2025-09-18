import { NextResponse } from 'next/server';
import { getNtfyConfig } from '@/lib/db-utils';

export async function GET() {
  try {
    const ntfyConfig = await getNtfyConfig();
    return NextResponse.json({ ntfy: ntfyConfig });
  } catch (error) {
    console.error('Error fetching NTFY configuration:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Failed to fetch NTFY configuration' },
      { status: 500 }
    );
  }
}
