import { NextResponse } from 'next/server';
import { getAllMachineConnections } from '@/lib/db-utils';

export async function GET() {
  try {
    const machineConnections = getAllMachineConnections();
    
    return NextResponse.json({
      machineConnections
    });
  } catch (error) {
    console.error('Failed to get server connections:', error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: 'Failed to get server connections' }, { status: 500 });
  }
}
