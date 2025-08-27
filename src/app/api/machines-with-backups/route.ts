import { NextResponse } from 'next/server';
import { dbUtils } from '@/lib/db-utils';

export async function GET() {
  try {
    const machinesBackupNames = dbUtils.getMachinesBackupNames();
    
    // Transform the data to include machine name and backup name
    const machinesWithBackups = (machinesBackupNames as { 
      id: string; 
      machine_name: string; 
      backup_name: string;
    }[]).map((machine) => ({
      id: machine.id,
      name: machine.machine_name,
      backupName: machine.backup_name
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