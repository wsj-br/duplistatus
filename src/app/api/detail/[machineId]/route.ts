import { NextResponse } from 'next/server';
import { getMachineById, getOverdueBackupsForMachine, getLastOverdueBackupCheckTime } from '@/lib/db-utils';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ machineId: string }> }
) {
  try {
    const { machineId } = await params;
    
    // Get machine data
    const machine = await getMachineById(machineId);
    if (!machine) {
      return NextResponse.json(
        { error: 'Machine not found' },
        { status: 404 }
      );
    }

    // Get overdue backups for this machine
    const overdueBackups = getOverdueBackupsForMachine(machine.name);

    // Get the last overdue backup check time
    const lastOverdueCheck = getLastOverdueBackupCheckTime();

    return NextResponse.json({
      machine,
      overdueBackups,
      lastOverdueCheck
    });
  } catch (error) {
    console.error('Error fetching machine details:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Failed to fetch machine details' },
      { status: 500 }
    );
  }
}
