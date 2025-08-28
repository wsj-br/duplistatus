"use server";

import { NextResponse } from 'next/server';
import { dbUtils } from '@/lib/db-utils';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ machineId: string }> }
) {
  try {
    const { machineId } = await params;
    
    const machine = await dbUtils.getMachineById(machineId);
    
    if (!machine) {
      return NextResponse.json({ error: 'Machine not found' }, { status: 404 });
    }
    
    return NextResponse.json(machine);
  } catch (error) {
    console.error('Error fetching machine:', error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: 'Failed to fetch machine' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ machineId: string }> }
) {
  try {
    const { machineId } = await params;
    
    // Delete the machine and its backups
    const result = dbUtils.deleteMachine(machineId);

    return NextResponse.json({
      message: `Successfully deleted machine and ${result.backupChanges} backups`,
      status: 200,
      changes: result
    });
  } catch (error) {
    console.error('Error deleting machine:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Failed to delete machine' },
      { status: 500 }
    );
  }
}
