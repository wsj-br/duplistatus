import { withCSRF } from '@/lib/csrf-middleware';
import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { optionalAuth } from '@/lib/auth-middleware';
import { getClientIpAddress } from '@/lib/ip-utils';
import { AuditLogger } from '@/lib/audit-logger';

export const DELETE = withCSRF(optionalAuth(async (request: NextRequest, authContext) => {
  try {
    
    const { serverId, backupName } = await request.json();
    
    // Validate required fields
    if (!serverId || !backupName) {
      return NextResponse.json(
        { error: 'Server ID and backup name are required' },
        { status: 400 }
      );
    }

    // Start a transaction
    const transaction = db.transaction(() => {
      // First check if there are any backups for this server-backup name combination
      const existingBackups = db.prepare(`
        SELECT COUNT(*) as count, s.name as server_name, s.alias as server_alias
        FROM backups b
        JOIN servers s ON b.server_id = s.id
        WHERE b.server_id = ? AND b.backup_name = ?
      `).get(serverId, backupName) as { count: number; server_name: string; server_alias: string } | undefined;

      if (!existingBackups || existingBackups.count === 0) {
        throw new Error(`No backups found for server "${existingBackups?.server_name || 'Unknown'}" with backup name "${backupName}"`);
      }

      // Delete all backups for this server-backup name combination
      const result = db.prepare(`
        DELETE FROM backups 
        WHERE server_id = ? AND backup_name = ?
      `).run(serverId, backupName);

      return {
        changes: result.changes,
        serverName: existingBackups.server_name,
        serverAlias: existingBackups.server_alias,
        backupName: backupName
      };
    });

    // Execute the transaction
    const { changes, serverName, serverAlias, backupName: deletedBackupName } = transaction();

    if (changes === 0) {
      return NextResponse.json(
        { error: 'No backups found to delete' },
        { status: 404 }
      );
    }

    const serverDisplayName = serverAlias || serverName;

    // Log audit event
    if (authContext) {
      const ipAddress = getClientIpAddress(request);
      await AuditLogger.logBackupOperation(
        'backup_job_deleted',
        authContext.userId,
        authContext.username,
        `${serverId}:${backupName}`,
        {
          serverId,
          serverName: serverDisplayName,
          backupName: deletedBackupName,
          deletedCount: changes,
        },
        ipAddress
      );
    }

    return NextResponse.json({
      message: `Successfully deleted ${changes} backup record(s) for "${deletedBackupName}" from server "${serverDisplayName}"`,
      status: 200,
      deletedCount: changes,
      serverName: serverDisplayName,
      backupName: deletedBackupName
    });
  } catch (error) {
    console.error('Error deleting backup job:', error instanceof Error ? error.message : String(error));
    
    // Extract error message
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Failed to delete backup job. Please try again.';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}));
