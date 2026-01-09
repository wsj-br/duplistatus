import { NextRequest, NextResponse } from 'next/server';
import { withCSRF } from '@/lib/csrf-middleware';
import { requireAdmin } from '@/lib/auth-middleware';
import { ensureDatabaseInitialized, getDatabasePath, backupDatabaseToFile, dumpDatabaseToSQL } from '@/lib/db';
import { getClientIpAddress } from '@/lib/ip-utils';
import { AuditLogger } from '@/lib/audit-logger';
import path from 'path';
import fs from 'fs';
import { Readable } from 'stream';
import { getDataDir } from '@/lib/paths';

export const GET = withCSRF(requireAdmin(async (request: NextRequest, authContext) => {
  try {
    await ensureDatabaseInitialized();
    
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'db'; // 'db' or 'sql'
    
    if (format !== 'db' && format !== 'sql') {
      return NextResponse.json(
        { error: 'Invalid format. Must be "db" or "sql"' },
        { status: 400 }
      );
    }
    
    const dbPath = getDatabasePath();
    // Format timestamp using server's local timezone instead of GMT
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const timestamp = `${year}-${month}-${day}T${hours}-${minutes}-${seconds}`;
    const extension = format === 'db' ? 'db' : 'sql';
    const filename = `duplistatus-backup-${timestamp}.${extension}`;
    
    // Create temporary file for backup
    const tempDir = path.join(getDataDir(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    const tempFilePath = path.join(tempDir, filename);
    
    try {
      if (format === 'db') {
        // Create binary backup using better-sqlite3's backup method
        await backupDatabaseToFile(tempFilePath);
      } else {
        // Create SQL dump
        const sqlContent = dumpDatabaseToSQL();
        fs.writeFileSync(tempFilePath, sqlContent, 'utf8');
      }
      
      // Read the file
      const fileBuffer = fs.readFileSync(tempFilePath);
      
      // Clean up temp file
      fs.unlinkSync(tempFilePath);
      
      // Log audit event
      if (authContext) {
        const ipAddress = getClientIpAddress(request);
        const userAgent = request.headers.get('user-agent') || 'unknown';
        await AuditLogger.log({
          userId: authContext.userId,
          username: authContext.username,
          action: 'database_backup',
          category: 'system',
          details: {
            format,
            filename,
            size: fileBuffer.length,
          },
          ipAddress,
          userAgent,
          status: 'success',
        });
      }
      
      // Return file with appropriate headers
      const contentType = format === 'db' ? 'application/octet-stream' : 'text/plain';
      
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Content-Length': fileBuffer.length.toString(),
        },
      });
    } catch (backupError) {
      // Clean up temp file if it exists
      if (fs.existsSync(tempFilePath)) {
        try {
          fs.unlinkSync(tempFilePath);
        } catch {
          // Ignore cleanup errors
        }
      }
      throw backupError;
    }
  } catch (error) {
    console.error('[Database Backup] Error:', error instanceof Error ? error.message : String(error));
    
    // Log audit event for failure
    if (authContext) {
      const ipAddress = getClientIpAddress(request);
      const userAgent = request.headers.get('user-agent') || 'unknown';
      await AuditLogger.log({
        userId: authContext.userId,
        username: authContext.username,
        action: 'database_backup',
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
        error: 'Failed to create database backup',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}));
