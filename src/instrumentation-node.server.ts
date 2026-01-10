// This file contains Node.js-specific code for session clearing on startup
// It's only imported when running in Node.js runtime, not Edge Runtime

import fs from 'fs';
import path from 'path';
import { dbOps, ensureDatabaseInitialized } from '@/lib/db';
import { clearAllSessions } from '@/lib/session-csrf';
import { getDataDir } from '@/lib/paths';

export async function clearSessionsOnStartup() {
  console.log('[Instrumentation] Server initialization started');
  
  // Use a lock file to prevent concurrent execution
  // This is important for production with multiple workers
  const dataDir = getDataDir();
  const lockFile = path.join(dataDir, '.session-clear.lock');
  
  try {
    // Ensure data directory exists
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Try to acquire lock
    let lockAcquired = false;
    try {
      fs.writeFileSync(lockFile, process.pid.toString(), { flag: 'wx' });
      lockAcquired = true;
    } catch (error) {
      // Lock file exists - another worker may have already cleared sessions
      try {
        const lockContent = fs.readFileSync(lockFile, 'utf8');
        const lockPid = parseInt(lockContent, 10);
        
        // Check if the process that created the lock is still running
        try {
          process.kill(lockPid, 0); // Signal 0 checks if process exists
          // Process exists, skip session clearing
          console.log('[Instrumentation] Session clearing already handled by another worker');
          return;
        } catch {
          // Process doesn't exist, remove stale lock and try again
          fs.unlinkSync(lockFile);
          fs.writeFileSync(lockFile, process.pid.toString(), { flag: 'wx' });
          lockAcquired = true;
        }
      } catch (readError) {
        // Lock file read failed, try to remove and recreate
        try {
          fs.unlinkSync(lockFile);
          fs.writeFileSync(lockFile, process.pid.toString(), { flag: 'wx' });
          lockAcquired = true;
        } catch {
          // Could not acquire lock, skip session clearing
          console.log('[Instrumentation] Could not acquire lock for session clearing, skipping');
          return;
        }
      }
    }
    
    if (lockAcquired) {
      try {
        // Wait for database to be ready
        await ensureDatabaseInitialized();
        
        // Clear all sessions
        clearAllSessions();
        
        // Log the event in audit log
        try {
          dbOps.insertAuditLog.run(
            null, // user_id (system action)
            'system', // username
            'sessions_cleared_on_startup', // action
            'system', // category
            null, // target_type
            null, // target_id
            JSON.stringify({
              reason: 'Server startup',
              timestamp: new Date().toISOString(),
              pid: process.pid
            }), // details
            null, // ip_address
            null, // user_agent
            'success', // status
            null // error_message
          );
        } catch (auditError) {
          // Log audit error but don't fail the startup
          console.warn('[Instrumentation] Failed to log session clearing to audit log:', auditError);
        }
        
        console.log('[Instrumentation] ✅ All sessions cleared on server startup');
      } catch (error) {
        console.error('[Instrumentation] ❌ Failed to clear sessions on startup:', error);
        // Don't throw - allow server to start even if session clearing fails
      } finally {
        // Clean up lock file
        try {
          fs.unlinkSync(lockFile);
        } catch (error) {
          // Ignore cleanup errors
        }
      }
    }
  } catch (error) {
    console.error('[Instrumentation] Error in startup initialization:', error);
    // Don't throw - allow server to start
  }
}
