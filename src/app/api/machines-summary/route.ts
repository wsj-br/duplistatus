import { NextResponse } from 'next/server';
import { getMachinesSummary } from '@/lib/db-utils';

export async function GET() {
  try {
    const machinesSummary = getMachinesSummary();
    return NextResponse.json(machinesSummary);
  } catch (error) {
    console.error('Error fetching machines summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch machines summary' },
      { status: 500 }
    );
  }
} 