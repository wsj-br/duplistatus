import { NextRequest, NextResponse } from 'next/server';
import { withCSRF } from '@/lib/csrf-middleware';
import { requireAdmin } from '@/lib/auth-middleware';
import { 
  ensureDatabaseInitialized, 
  getDatabasePath, 
  validateDatabaseFile, 
  createSafetyBackup,
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

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export const POST = withCSRF(requireAdmin(async (request: NextRequest, authContext) => {
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
    const tempDir = path.join(process.cwd(), 'data', 'temp');
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
      
      // Create safety backup of current database
      safetyBackupPath = createSafetyBackup();
      
      if (format === 'db') {
        // Close current database connection
        closeDatabaseConnection();
        
        // Wait a moment to ensure file handles are released
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Replace database file
        if (fs.existsSync(dbPath)) {
          // Backup WAL and SHM files if they exist
          const walPath = dbPath + '-wal';
          const shmPath = dbPath + '-shm';
          const walBackup = walPath + '.backup';
          const shmBackup = shmPath + '.backup';
          
          if (fs.existsSync(walPath)) {
            fs.copyFileSync(walPath, walBackup);
            fs.unlinkSync(walPath);
          }
          if (fs.existsSync(shmPath)) {
            fs.copyFileSync(shmPath, shmBackup);
            fs.unlinkSync(shmPath);
          }
          
          fs.copyFileSync(tempFilePath, dbPath);
          fs.chmodSync(dbPath, 0o644); // Ensure proper permissions
        } else {
          fs.copyFileSync(tempFilePath, dbPath);
          fs.chmodSync(dbPath, 0o644);
        }
        
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
            await new Promise(resolve => setTimeout(resolve, 100));
            fs.copyFileSync(safetyBackupPath, dbPath);
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
              await new Promise(resolve => setTimeout(resolve, 100));
              fs.copyFileSync(safetyBackupPath, dbPath);
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
      // Note: After restore, the user from authContext might not exist in the restored database
      // So we log with username only (no userId) to avoid foreign key constraint issues
      if (authContext) {
        try {
          const ipAddress = getClientIpAddress(request);
          const userAgent = request.headers.get('user-agent') || 'unknown';
          
          // Check if user still exists in restored database
          const { dbOps } = await import('@/lib/db');
          const userExists = dbOps.getUserById.get(authContext.userId);
          
          await AuditLogger.log({
            userId: userExists ? authContext.userId : undefined, // Only set userId if user exists
            username: authContext.username,
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
          await new Promise(resolve => setTimeout(resolve, 100));
          fs.copyFileSync(safetyBackupPath, dbPath);
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
    if (authContext) {
      const ipAddress = getClientIpAddress(request);
      const userAgent = request.headers.get('user-agent') || 'unknown';
      await AuditLogger.log({
        userId: authContext.userId,
        username: authContext.username,
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
