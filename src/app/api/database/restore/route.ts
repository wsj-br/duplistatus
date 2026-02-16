import { NextRequest, NextResponse } from 'next/server';
import { withCSRF } from '@/lib/csrf-middleware';
import { requireAdmin } from '@/lib/auth-middleware';
import { 
  ensureDatabaseInitialized, 
  getDatabasePath, 
  validateDatabaseFile, 
  createSafetyBackup,
  runWalCheckpointTruncate,
  closeDatabaseConnection,
  reinitializeDatabaseConnection,
  restoreDatabaseFromSQL
} from '@/lib/db';
import { invalidateDataCache, clearRequestCache } from '@/lib/db-utils';
import { getClientIpAddress } from '@/lib/ip-utils';
import { AuditLogger } from '@/lib/audit-logger';
import { clearAllLegacySessions } from '@/lib/session-csrf';
import path from 'path';
import fs from 'fs';
import { getDataDir } from '@/lib/paths';

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

/** Delay after closing DB so the OS releases file handles (e.g. in Docker). */
const RESTORE_CLOSE_DELAY_MS = 500;

/** Remove -wal and -shm files for a database path so the next open gets a clean WAL state. */
function removeWalAndShmForPath(dbPath: string): void {
  const walPath = dbPath + '-wal';
  const shmPath = dbPath + '-shm';
  try {
    if (fs.existsSync(walPath)) fs.unlinkSync(walPath);
  } catch {
    // ignore
  }
  try {
    if (fs.existsSync(shmPath)) fs.unlinkSync(shmPath);
  } catch {
    // ignore
  }
}

export const POST = withCSRF(requireAdmin(async (request: NextRequest, authContext) => {
  // CRITICAL: Capture auth context and session info BEFORE restore
  // This ensures we can complete the restore even if the restored database
  // has different sessions or the current session doesn't exist in it
  const preRestoreAuthContext = authContext ? {
    userId: authContext.userId,
    username: authContext.username,
    isAdmin: authContext.isAdmin,
  } : null;
  
  // Get session ID before restore (needed for audit logging)
  const sessionId = request.cookies.get('sessionId')?.value || null;
  
  try {
    await ensureDatabaseInitialized();
    
    const formData = await request.formData();
    const file = formData.get('database') as File | null;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }
    
    // Determine file format from extension or content
    const fileName = file.name.toLowerCase();
    let format: 'db' | 'sql' | null = null;
    
    if (fileName.endsWith('.db') || fileName.endsWith('.sqlite') || fileName.endsWith('.sqlite3')) {
      format = 'db';
    } else if (fileName.endsWith('.sql')) {
      format = 'sql';
    } else {
      // Try to detect from content
      const buffer = Buffer.from(await file.arrayBuffer());
      const header = buffer.slice(0, 16).toString('utf8');
      if (header.startsWith('SQLite format')) {
        format = 'db';
      } else if (buffer.toString('utf8', 0, Math.min(100, buffer.length)).toUpperCase().includes('CREATE TABLE') || 
                 buffer.toString('utf8', 0, Math.min(100, buffer.length)).toUpperCase().includes('BEGIN TRANSACTION')) {
        format = 'sql';
      } else {
        return NextResponse.json(
          { error: 'Unable to determine file format. Please use .db or .sql file' },
          { status: 400 }
        );
      }
    }
    
    // Create temp directory for uploaded file
    const tempDir = path.join(getDataDir(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const tempFilePath = path.join(tempDir, `restore-${timestamp}-${file.name}`);
    const dbPath = getDatabasePath();
    
    let safetyBackupPath: string | null = null;
    
    try {
      // Save uploaded file to temp location
      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync(tempFilePath, buffer);
      
      // Validate file before proceeding
      if (format === 'db') {
        if (!validateDatabaseFile(tempFilePath)) {
          return NextResponse.json(
            { error: 'Database file failed integrity check. File may be corrupted.' },
            { status: 400 }
          );
        }
      }
      
      if (format === 'db') {
        // Flush WAL into main .db and truncate WAL so on-disk state is consistent
        // and safety backup / replace do not leave stale -wal/-shm
        runWalCheckpointTruncate();
        // Safety backup of current database (main .db is now complete after checkpoint)
        safetyBackupPath = createSafetyBackup();

        // Close current database connection
        closeDatabaseConnection();
        // Wait for OS to release file handles (important in Docker/NFS)
        await new Promise(resolve => setTimeout(resolve, RESTORE_CLOSE_DELAY_MS));

        // Remove WAL/SHM so no stale files remain for the replaced .db
        removeWalAndShmForPath(dbPath);

        fs.copyFileSync(tempFilePath, dbPath);
        fs.chmodSync(dbPath, 0o644);

        // Remove any -wal/-shm again so the new connection starts clean
        removeWalAndShmForPath(dbPath);

        // Reinitialize database connection
        reinitializeDatabaseConnection();
        
        // Wait for database to be ready
        await ensureDatabaseInitialized();
        
        // Run integrity check
        const isValid = validateDatabaseFile(dbPath);
        if (!isValid) {
          // Restore from safety backup if integrity check fails
          if (safetyBackupPath && fs.existsSync(safetyBackupPath)) {
            closeDatabaseConnection();
            await new Promise(resolve => setTimeout(resolve, RESTORE_CLOSE_DELAY_MS));
            removeWalAndShmForPath(dbPath);
            fs.copyFileSync(safetyBackupPath, dbPath);
            removeWalAndShmForPath(dbPath);
            reinitializeDatabaseConnection();
            await ensureDatabaseInitialized();
          }
          
          return NextResponse.json(
            { error: 'Restored database failed integrity check. Original database has been restored from safety backup.' },
            { status: 500 }
          );
        }
      } else {
        // SQL format - read and execute SQL statements
        const sqlContent = buffer.toString('utf8');
        
        // Validate SQL content
        if (!sqlContent.trim()) {
          return NextResponse.json(
            { error: 'SQL file is empty' },
            { status: 400 }
          );
        }
        
        // Safety backup before SQL restore (in case we need to roll back)
        safetyBackupPath = createSafetyBackup();

        try {
          // Execute SQL restore
          restoreDatabaseFromSQL(sqlContent);
          
          // Reset database state after SQL restore to ensure dbOps is recreated
          // Note: We don't need to reinitialize connection for SQL restore since we're using the same connection
          // But we should reset the state to ensure everything is fresh
          const { resetDatabaseStateAfterRestore } = await import('@/lib/db');
          resetDatabaseStateAfterRestore();
          
          // Ensure database is reinitialized with fresh state
          await ensureDatabaseInitialized();
          
          // Run integrity check
          const isValid = validateDatabaseFile(dbPath);
          if (!isValid) {
            throw new Error('Restored database failed integrity check');
          }
        } catch (sqlRestoreError) {
          // If SQL restore fails, restore from safety backup before throwing
          // This ensures the user's session is preserved
          if (safetyBackupPath && fs.existsSync(safetyBackupPath)) {
            try {
              closeDatabaseConnection();
              await new Promise(resolve => setTimeout(resolve, RESTORE_CLOSE_DELAY_MS));
              removeWalAndShmForPath(dbPath);
              fs.copyFileSync(safetyBackupPath, dbPath);
              removeWalAndShmForPath(dbPath);
              reinitializeDatabaseConnection();
              await ensureDatabaseInitialized();
              console.log('[Database Restore] Restored from safety backup after SQL restore failure');
            } catch (recoveryError) {
              console.error('[Database Restore] Failed to recover from safety backup:', recoveryError instanceof Error ? recoveryError.message : String(recoveryError));
            }
          }
          
          // Re-throw the error so it's caught by the outer catch block
          // This ensures we don't clear sessions or return requiresReauth
          throw sqlRestoreError;
        }
      }
      
      // Clear all in-memory session data (legacy sessions) FIRST
      // This is critical to prevent stale sessions from causing redirect loops
      // after restore when dbOps might have been temporarily unavailable
      // Do this BEFORE clearing database sessions to catch any sessions created
      // during the restore process
      clearAllLegacySessions();
      
      // CRITICAL: After database restore, the current session no longer exists in the restored database
      // We need to ensure that any subsequent operations don't try to validate or update
      // the session, as it will fail. The restore operation itself should complete successfully
      // even though the session doesn't exist in the restored database.
      // Wait a moment to ensure any in-flight session operations complete
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Invalidate all caches
      invalidateDataCache();
      clearRequestCache();
      
      // Clear all sessions in database after restore for security
      // Old sessions from backup should not be valid and could be a security risk
      // Do this BEFORE logging audit event, as the user might not exist in restored DB
      try {
        // Ensure database is ready before clearing sessions
        await ensureDatabaseInitialized();
        
        // Wait for dbOps to be available (with timeout)
        const maxWaitTime = 5000; // 5 seconds
        const startTime = Date.now();
        let dbModule = await import('@/lib/db');
        
        while (!dbModule.dbOps && (Date.now() - startTime) < maxWaitTime) {
          await new Promise(resolve => setTimeout(resolve, 100));
          dbModule = await import('@/lib/db');
        }
        
        if (!dbModule.dbOps) {
          console.warn('[Database Restore] dbOps not available, cannot clear sessions table');
        } else {
          // Clear all sessions using the db instance directly to avoid depending on dbOps
          const { db } = await import('@/lib/db');
          db.prepare('DELETE FROM sessions').run();
          console.log('[Database Restore] All sessions cleared from database');
          
          // Wait a moment to ensure session deletion is complete
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (sessionError) {
        // Log but don't fail the restore if session clearing fails
        console.warn('[Database Restore] Failed to clear sessions table:', sessionError instanceof Error ? sessionError.message : String(sessionError));
      }
      
      // Log audit event
      // Note: After restore, the user from preRestoreAuthContext might not exist in the restored database
      // So we log with username only (no userId) to avoid foreign key constraint issues
      // Use preRestoreAuthContext instead of authContext to avoid issues if authContext was invalidated
      if (preRestoreAuthContext) {
        try {
          const ipAddress = getClientIpAddress(request);
          const userAgent = request.headers.get('user-agent') || 'unknown';
          
          // Check if user still exists in restored database
          // Use try-catch to handle case where dbOps might not be ready or user doesn't exist
          let userExists = false;
          try {
            const { dbOps } = await import('@/lib/db');
            if (dbOps && dbOps.getUserById) {
              const user = dbOps.getUserById.get(preRestoreAuthContext.userId);
              userExists = !!user;
            }
          } catch (userCheckError) {
            // User doesn't exist in restored database or dbOps not ready - that's okay
            console.log('[Database Restore] User from original database does not exist in restored database (expected when restoring from another system)');
          }
          
          await AuditLogger.log({
            userId: userExists ? preRestoreAuthContext.userId : undefined, // Only set userId if user exists
            username: preRestoreAuthContext.username,
            action: 'database_restore',
            category: 'system',
            details: {
              format,
              filename: file.name,
              size: file.size,
              safetyBackupPath: safetyBackupPath ? path.basename(safetyBackupPath) : null,
            },
            ipAddress,
            userAgent,
            status: 'success',
          });
        } catch (auditError) {
          // Log audit error but don't fail the restore
          console.warn('[Database Restore] Failed to log audit event:', auditError instanceof Error ? auditError.message : String(auditError));
        }
      }
      
      // Clean up temp file
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      
      return NextResponse.json({
        success: true,
        message: `Database restored successfully from ${format.toUpperCase()} file`,
        safetyBackupPath: safetyBackupPath ? path.basename(safetyBackupPath) : null,
        requiresReauth: true, // Flag to indicate user needs to log in again
      });
      
    } catch (restoreError) {
      // Clean up temp file
      if (fs.existsSync(tempFilePath)) {
        try {
          fs.unlinkSync(tempFilePath);
        } catch {
          // Ignore cleanup errors
        }
      }
      
      // If restore failed and we have a safety backup, try to restore it
      if (safetyBackupPath && fs.existsSync(safetyBackupPath)) {
        try {
          closeDatabaseConnection();
          await new Promise(resolve => setTimeout(resolve, RESTORE_CLOSE_DELAY_MS));
          removeWalAndShmForPath(dbPath);
          fs.copyFileSync(safetyBackupPath, dbPath);
          removeWalAndShmForPath(dbPath);
          reinitializeDatabaseConnection();
          await ensureDatabaseInitialized();
        } catch (recoveryError) {
          console.error('[Database Restore] Failed to recover from safety backup:', recoveryError instanceof Error ? recoveryError.message : String(recoveryError));
        }
      }
      
      throw restoreError;
    }
  } catch (error) {
    console.error('[Database Restore] Error:', error instanceof Error ? error.message : String(error));
    
    // Log audit event for failure
    // Use preRestoreAuthContext instead of authContext to avoid issues if authContext was invalidated
    if (preRestoreAuthContext) {
      try {
        const ipAddress = getClientIpAddress(request);
        const userAgent = request.headers.get('user-agent') || 'unknown';
        
        // Try to log audit event, but don't fail if it doesn't work (e.g., if database is in bad state)
        try {
          await AuditLogger.log({
            userId: preRestoreAuthContext.userId,
            username: preRestoreAuthContext.username,
            action: 'database_restore',
            category: 'system',
            details: {
              error: error instanceof Error ? error.message : String(error),
            },
            ipAddress,
            userAgent,
            status: 'error',
            errorMessage: error instanceof Error ? error.message : String(error),
          });
        } catch (auditError) {
          // If audit logging fails (e.g., database is in bad state), just log to console
          console.warn('[Database Restore] Failed to log audit event for error:', auditError instanceof Error ? auditError.message : String(auditError));
        }
      } catch (logError) {
        // Ignore errors in error logging
        console.warn('[Database Restore] Failed to prepare audit log:', logError instanceof Error ? logError.message : String(logError));
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to restore database',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}));
