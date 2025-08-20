import { NextResponse } from 'next/server';
import { dbUtils } from '@/lib/db-utils';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: machineId } = await params;
    
    // Get machine details including backups and chart data
    const machineDetails = dbUtils.getMachineById(machineId);
    
    if (!machineDetails) {
      return NextResponse.json(
        { error: 'Machine not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(machineDetails);
  } catch (error) {
    console.error('Error fetching machine details:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Failed to fetch machine details' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: machineId } = await params;
    
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