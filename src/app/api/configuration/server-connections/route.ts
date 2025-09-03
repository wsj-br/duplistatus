import { NextResponse } from 'next/server';
import { getAllMachineAddresses } from '@/lib/db-utils';

export async function GET() {
  try {
    const machineAddresses = getAllMachineAddresses();

  return NextResponse.json({
    machineAddresses
    });
  } catch (error) {
    console.error('Failed to get server connections:', error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: 'Failed to get server connections' }, { status: 500 });
  }
}
