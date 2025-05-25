import { NextResponse } from 'next/server';
import { dbUtils } from '@/lib/db-utils';

export async function GET() {
  try {
    const machines = dbUtils.getAllMachines();
    
    // Transform the data to include only id and name for the dropdown
    const machineList = (machines as { id: string; name: string }[]).map((machine) => ({
      id: machine.id,
      name: machine.name
    }));

    return NextResponse.json(machineList);
  } catch (error) {
    console.error('Error fetching machines:', error);
    return NextResponse.json(
      { error: 'Failed to fetch machines' },
      { status: 500 }
    );
  }
} 