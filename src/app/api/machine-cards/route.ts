import { NextResponse } from 'next/server';
import { getMachineCardsData } from '@/lib/db-utils';

export async function GET() {
  try {
    const machineCardsData = getMachineCardsData();
    return NextResponse.json(machineCardsData);
  } catch (error) {
    console.error('Error fetching machine cards data:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Failed to fetch machine cards data' },
      { status: 500 }
    );
  }
}
