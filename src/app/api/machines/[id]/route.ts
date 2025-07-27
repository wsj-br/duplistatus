import { NextResponse } from 'next/server';
import { dbUtils } from '@/lib/db-utils';

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