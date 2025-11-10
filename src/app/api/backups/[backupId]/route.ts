import { withCSRF } from '@/lib/csrf-middleware';
import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getConfigBackupSettings, setConfigBackupSettings } from '@/lib/db-utils';
import { getAuthContext } from '@/lib/auth-middleware';
import { getClientIpAddress } from '@/lib/ip-utils';
import { AuditLogger } from '@/lib/audit-logger';

export const DELETE = withCSRF(async (
  request: NextRequest,
  { params }: { params: Promise<{ backupId: string }> }
) => {
  const authContext = await getAuthContext(request);
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

    // Update backup_settings time field to -1 year
    try {
      const backupKey = `${deletedBackup.server_id}:${deletedBackup.backup_name}`;
      const currentBackupSettings = await getConfigBackupSettings();
      
      if (currentBackupSettings[backupKey]) {
        const currentTime = new Date(currentBackupSettings[backupKey].time);
        const newTime = new Date(currentTime);
        newTime.setFullYear(currentTime.getFullYear() - 1);
        
        const updatedBackupSettings = {
          ...currentBackupSettings,
          [backupKey]: {
            ...currentBackupSettings[backupKey],
            time: newTime.toISOString()
          }
        };
        
        setConfigBackupSettings(updatedBackupSettings);
        console.log(`Updated backup_settings time for ${backupKey} from ${currentTime.toISOString()} to ${newTime.toISOString()}`);
      }
    } catch (error) {
      console.error('Error updating backup_settings:', error instanceof Error ? error.message : String(error));
      // Don't fail the deletion if backup_settings update fails
    }

    // Log audit event
    if (authContext) {
      const ipAddress = getClientIpAddress(request);
      await AuditLogger.logBackupOperation(
        'backup_deleted',
        authContext.userId,
        authContext.username,
        backupId,
        {
          serverId: deletedBackup.server_id,
          backupName: deletedBackup.backup_name,
          backupDate: deletedBackup.date,
        },
        ipAddress
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
