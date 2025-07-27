import { NextResponse } from 'next/server';
import { dbUtils } from '@/lib/db-utils';

export async function GET() {
  try {
    const machinesSummary = dbUtils.getMachinesSummary();
    
    // Transform the data to include machine name and backup name
    const machinesWithBackups = (machinesSummary as { 
      id: string; 
      name: string; 
      lastBackupName: string | null;
    }[]).map((machine) => ({
      id: machine.id,
      name: machine.name,
      backupName: machine.lastBackupName || 'Unknown'
    }));

    return NextResponse.json(machinesWithBackups);
  } catch (error) {
    console.error('Error fetching machines with backups:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Failed to fetch machines with backups' },
      { status: 500 }
    );
  }
} 