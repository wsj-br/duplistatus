import { withCSRF } from '@/lib/csrf-middleware';
import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db';

export const DELETE = withCSRF(async (
  request: NextRequest,
  { params }: { params: Promise<{ backupId: string }> }
) => {
  // Only allow deletion in development mode
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Backup deletion is only available in development mode' },
      { status: 403 }
    );
  }

  try {
    
    const { backupId } = await params;
    
    // Validate backup ID
    if (!backupId) {
      return NextResponse.json(
        { error: 'Backup ID is required' },
        { status: 400 }
      );
    }

    // Start a transaction
    const transaction = db.transaction(() => {
      // First check if the backup exists
      const existingBackup = db.prepare(`
        SELECT id, server_id, backup_name, date 
        FROM backups 
        WHERE id = ?
      `).get(backupId) as { id: string; server_id: string; backup_name: string; date: string } | undefined;

      if (!existingBackup) {
        throw new Error(`Backup with ID ${backupId} not found`);
      }

      // Delete the backup
      const result = db.prepare(`
        DELETE FROM backups 
        WHERE id = ?
      `).run(backupId);

      return {
        changes: result.changes,
        deletedBackup: existingBackup
      };
    });

    // Execute the transaction
    const { changes, deletedBackup } = transaction();

    if (changes === 0) {
      return NextResponse.json(
        { error: 'Backup not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: `Successfully deleted backup ${deletedBackup.backup_name} from ${deletedBackup.date}`,
      status: 200,
      deletedBackup
    });
  } catch (error) {
    console.error('Error deleting backup:', error instanceof Error ? error.message : String(error));
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        error: 'Failed to delete backup',
        details: errorMessage,
        time: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
});
