import { NextResponse } from 'next/server';
import { getServersSummary } from '@/lib/db-utils';

export async function GET() {
  try {
    const serversSummary = getServersSummary();
    return NextResponse.json(serversSummary);
  } catch (error) {
    console.error('Error fetching servers summary:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Failed to fetch servers summary' },
      { status: 500 }
    );
  }
} 