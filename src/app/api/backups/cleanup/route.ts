import { NextResponse } from 'next/server';
import { subMonths } from 'date-fns';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { retentionPeriod } = await request.json();

    // For "Delete all data" option, delete all backups
    if (retentionPeriod === 'Delete all data') {
      // Start a transaction
      const transaction = db.transaction(() => {
        // Get all backups that will be deleted
        const backupsToDelete = db.prepare(`
          SELECT id, backup_name, end_time 
          FROM backups 
          ORDER BY end_time DESC
        `).all();

        // Get all machines that will be deleted
        const machinesToDelete = db.prepare(`
          SELECT id, name
          FROM machines
        `).all();

        // Delete all backups
        const backupResult = db.prepare(`DELETE FROM backups`).run();
        
        // Delete all machines
        const machineResult = db.prepare(`DELETE FROM machines`).run();

        return { 
          deletedBackups: backupsToDelete, 
          deletedMachines: machinesToDelete,
          backupChanges: backupResult.changes,
          machineChanges: machineResult.changes
        };
      });

      // Execute the transaction
      const { deletedBackups, deletedMachines, backupChanges, machineChanges } = transaction();

      return NextResponse.json({
        message: `Successfully deleted all ${backupChanges} backups and ${machineChanges} machines`,
        deletedBackups,
        deletedMachines
      });
    }

    // Calculate the cutoff date based on the retention period
    let cutoffDate: Date;
    const now = new Date();

    switch (retentionPeriod) {
      case '6 months':
        cutoffDate = subMonths(now, 6);
        break;
      case '1 year':
        cutoffDate = subMonths(now, 12);
        break;
      case '2 years':
        cutoffDate = subMonths(now, 24);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid retention period' },
          { status: 400 }
        );
    }

    // Start a transaction
    const transaction = db.transaction(() => {
      // Get the backups that will be deleted
      const backupsToDelete = db.prepare(`
        SELECT id, backup_name, end_time 
        FROM backups 
        WHERE end_time < ? 
        ORDER BY end_time DESC
      `).all(cutoffDate.toISOString());

      // Delete the backups
      const result = db.prepare(`
        DELETE FROM backups 
        WHERE end_time < ?
      `).run(cutoffDate.toISOString());

      return { deletedBackups: backupsToDelete, changes: result.changes };
    });

    // Execute the transaction
    const { deletedBackups, changes } = transaction();

    return NextResponse.json({
      message: `Successfully deleted ${changes} old backups`,
      deletedBackups,
    });
  } catch (error) {
    console.error('Error deleting old backups:', error);
    return NextResponse.json(
      { error: 'Failed to delete old backups' },
      { status: 500 }
    );
  }
} 