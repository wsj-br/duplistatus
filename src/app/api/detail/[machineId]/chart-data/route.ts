import { NextResponse } from 'next/server';
import { getMachineById } from '@/lib/db-utils';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ machineId: string }> }
) {
  try {
    const { machineId } = await params;
    
    // Get machine data which includes chart data
    const machine = await getMachineById(machineId);
    if (!machine) {
      return NextResponse.json(
        { error: 'Machine not found' },
        { status: 404 }
      );
    }

    // Return the chart data from the machine
    return NextResponse.json(machine.chartData);
  } catch (error) {
    console.error('Error fetching machine chart data:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Failed to fetch machine chart data' },
      { status: 500 }
    );
  }
} 