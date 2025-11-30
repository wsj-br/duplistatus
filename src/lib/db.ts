import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { DatabaseMigrator } from './db-migrations';
import bcrypt from 'bcrypt';
import { BackupNotificationConfig } from '@/lib/types';
import { defaultAuthConfig } from './default-config';

// Ensure this runs in Node.js runtime, not Edge Runtime
export const runtime = 'nodejs';

// Ensure we're running on the server side
if (typeof window !== 'undefined') {
  throw new Error('Database can only be initialized on the server side');
}

// Create data directory if it doesn't exist
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'backups.db');

// Use a global singleton to prevent multiple database connections during hot reload
// This is critical in development mode where Next.js may re-import modules
declare global {
  var __dbInstance: Database.Database | undefined;
}

let db: Database.Database;

// Reuse existing database connection if available (hot reload in dev)
if (global.__dbInstance) {
  db = global.__dbInstance;
} else {
  try {
    db = new Database(dbPath, {
      // Add verbose logging in development
      // verbose: process.env.NODE_ENV === 'development' ? console.log : undefined,
      // Add timeout and other options for better reliability
      timeout: 10000, // Increased timeout for better reliability
      readonly: false,
      // Disable file locking to avoid I/O errors in development
      fileMustExist: false
    });
    
    // Configure SQLite for better concurrency and performance
    // Only set pragmas that are safe to change on existing databases
    try {
      db.pragma('journal_mode = WAL'); // Write-Ahead Logging for better concurrency
    } catch (error) {
      console.warn('Could not set WAL mode:', error);
    }
    
    db.pragma('synchronous = NORMAL'); // Balanced safety and performance
    db.pragma('cache_size = -10000'); // 10MB cache (negative means KB)
    db.pragma('temp_store = memory'); // Store temp tables in memory
    db.pragma('mmap_size = 0'); // Disable memory-mapped I/O to avoid I/O errors
    // Note: page_size and auto_vacuum can only be set during database creation
    db.pragma('wal_autocheckpoint = 1000'); // Checkpoint every 1000 pages
    db.pragma('busy_timeout = 30000'); // 30 second busy timeout
    
    // Store in global for hot reload persistence
    global.__dbInstance = db;
  } catch (error) {
    console.error('Failed to initialize database:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}

// Database initialization lock mechanism
class DatabaseInitLock {
  private lockFilePath: string;
  private lockFileHandle: number | null = null;
  private readonly LOCK_TIMEOUT = 30000; // 30 seconds
  private readonly RETRY_INTERVAL = 100; // 100ms for faster retries during build

  constructor(dbPath: string) {
    const dbDir = path.dirname(dbPath);
    this.lockFilePath = path.join(dbDir, '.db-init.lock');
  }

  acquireLockSync(): boolean {
    const startTime = Date.now();
    
    while (Date.now() - startTime < this.LOCK_TIMEOUT) {
      try {
        // Try to create lock file exclusively
        this.lockFileHandle = fs.openSync(this.lockFilePath, 'wx');
        
        // Write process info to lock file
        const lockInfo = {
          pid: process.pid,
          timestamp: new Date().toISOString(),
          process: process.title || 'unknown'
        };
        fs.writeFileSync(this.lockFileHandle, JSON.stringify(lockInfo, null, 2));
        
        return true;
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'EEXIST') {
          // Lock file exists, check if it's stale
          try {
            const lockContent = fs.readFileSync(this.lockFilePath, 'utf8');
            const lockInfo = JSON.parse(lockContent);
            
            // Check if the process that created the lock is still running
            try {
              process.kill(lockInfo.pid, 0); // Signal 0 just checks if process exists
              // Process exists, wait and retry
              const sleep = require('util').promisify(setTimeout);
              // Use synchronous sleep for this sync function
              const sleepSync = (ms: number) => {
                const start = Date.now();
                while (Date.now() - start < ms) {
                  // Busy wait
                }
              };
              sleepSync(this.RETRY_INTERVAL);
              continue;
            } catch {
              // Process doesn't exist, remove stale lock
              try {
                if (fs.existsSync(this.lockFilePath)) {
                  fs.unlinkSync(this.lockFilePath);
                }
              } catch {
                // Ignore - file may have been removed by another process
              }
              continue;
            }
          } catch {
            // Lock file is corrupted, remove it
            try {
              if (fs.existsSync(this.lockFilePath)) {
                fs.unlinkSync(this.lockFilePath);
              }
            } catch {
              // Ignore - file may have been removed by another process
            }
            continue;
          }
        } else {
          throw error;
        }
      }
    }
    
    console.error('[DatabaseInitLock] Failed to acquire initialization lock within timeout');
    return false;
  }

  releaseLock(): void {
    if (this.lockFileHandle !== null) {
      try {
        fs.closeSync(this.lockFileHandle);
        this.lockFileHandle = null;
      } catch (error) {
        // Ignore close errors
      }
      
      // Try to remove lock file, but don't error if it doesn't exist
      try {
        if (fs.existsSync(this.lockFilePath)) {
          fs.unlinkSync(this.lockFilePath);
        }
      } catch (error) {
        // Ignore unlink errors - file may have been removed by another process
      }
    } else {
      // No handle, but try to clean up lock file if it exists
      try {
        if (fs.existsSync(this.lockFilePath)) {
          fs.unlinkSync(this.lockFilePath);
        }
      } catch (error) {
        // Ignore - file may have been removed by another process
      }
    }
  }
}

// Track if we just created a fresh database (to skip migrations)
let isFreshDatabase = false;
const initLock = new DatabaseInitLock(dbPath);

// Check if database is empty and initialize schema if needed
try {
  // Check if any tables exist by querying sqlite_master
  const tableCount = db.prepare(`
    SELECT COUNT(*) as count 
    FROM sqlite_master 
    WHERE type='table' AND name IN ('servers', 'backups')
  `).get() as { count: number };
  
  // If no tables exist, create the complete schema with latest version (4.0)
  // Use a lock to ensure only one process initializes the database
  if (tableCount.count === 0) {
    // Acquire lock before initializing
    const lockAcquired = initLock.acquireLockSync();
    
    if (!lockAcquired) {
      // Could not acquire lock, wait a bit and check if database was initialized by another process
      const sleepSync = (ms: number) => {
        const start = Date.now();
        while (Date.now() - start < ms) {
          // Busy wait
        }
      };
      sleepSync(500); // Wait 500ms
      
      // Re-check if tables exist (another process may have created them)
      const tableCountAfterWait = db.prepare(`
        SELECT COUNT(*) as count 
        FROM sqlite_master 
        WHERE type='table' AND name IN ('servers', 'backups')
      `).get() as { count: number };
      
      if (tableCountAfterWait.count > 0) {
        // Database was initialized by another process
        // Check version to confirm it's at 4.0
        try {
          const versionCheck = db.prepare('SELECT version FROM db_version WHERE version = ?').get('4.0') as { version: string } | undefined;
          if (versionCheck) {
            isFreshDatabase = true;
            // Silent - another process handled it
          } else {
            throw new Error('Database tables exist but version is not set');
          }
        } catch (error) {
          throw new Error('Failed to verify database version after waiting for initialization');
        }
      } else {
        throw new Error('Failed to acquire database initialization lock');
      }
    } else {
      try {
        // Double-check tables don't exist (another process may have created them while we waited)
        const tableCountRecheck = db.prepare(`
          SELECT COUNT(*) as count 
          FROM sqlite_master 
          WHERE type='table' AND name IN ('servers', 'backups')
        `).get() as { count: number };
        
        if (tableCountRecheck.count === 0) {
          isFreshDatabase = true;
          console.log('Initializing new database with latest schema (v4.0)...');
    
          // Import dependencies for initial setup
          const bcrypt = require('bcrypt');
          const { randomBytes } = require('crypto');
          
          // CRITICAL: Create db_version table FIRST and set version to 4.0 IMMEDIATELY
          // This prevents other processes from trying to run migrations while we're initializing
          db.exec(`
            CREATE TABLE IF NOT EXISTS db_version (
              version TEXT PRIMARY KEY,
              applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
          `);
          
          // Set version to 4.0 immediately - this is critical to prevent migrations from running
          db.prepare('INSERT OR REPLACE INTO db_version (version, applied_at) VALUES (?, CURRENT_TIMESTAMP)').run('4.0');
          
          db.exec(`
            -- Core application tables (from v3.1)
      CREATE TABLE IF NOT EXISTS servers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        server_url TEXT DEFAULT '',
        alias TEXT DEFAULT '',
        note TEXT DEFAULT '',
        server_password TEXT DEFAULT '',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS backups (
        id TEXT PRIMARY KEY,
        server_id TEXT NOT NULL,
        backup_name TEXT NOT NULL,
        backup_id TEXT NOT NULL,
        date DATETIME NOT NULL,
        status TEXT NOT NULL,
        duration_seconds INTEGER NOT NULL,
        size INTEGER NOT NULL DEFAULT 0,
        uploaded_size INTEGER NOT NULL DEFAULT 0,
        examined_files INTEGER NOT NULL DEFAULT 0,
        warnings INTEGER NOT NULL DEFAULT 0,
        errors INTEGER NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        
        -- Message arrays stored as JSON blobs
        messages_array TEXT DEFAULT '[]',
        warnings_array TEXT DEFAULT '[]',
        errors_array TEXT DEFAULT '[]',
        available_backups TEXT DEFAULT '[]',
        
        -- Data fields
        deleted_files INTEGER NOT NULL DEFAULT 0,
        deleted_folders INTEGER NOT NULL DEFAULT 0,
        modified_files INTEGER NOT NULL DEFAULT 0,
        opened_files INTEGER NOT NULL DEFAULT 0,
        added_files INTEGER NOT NULL DEFAULT 0,
        size_of_modified_files INTEGER NOT NULL DEFAULT 0,
        size_of_added_files INTEGER NOT NULL DEFAULT 0,
        size_of_examined_files INTEGER NOT NULL DEFAULT 0,
        size_of_opened_files INTEGER NOT NULL DEFAULT 0,
        not_processed_files INTEGER NOT NULL DEFAULT 0,
        added_folders INTEGER NOT NULL DEFAULT 0,
        too_large_files INTEGER NOT NULL DEFAULT 0,
        files_with_error INTEGER NOT NULL DEFAULT 0,
        modified_folders INTEGER NOT NULL DEFAULT 0,
        modified_symlinks INTEGER NOT NULL DEFAULT 0,
        added_symlinks INTEGER NOT NULL DEFAULT 0,
        deleted_symlinks INTEGER NOT NULL DEFAULT 0,
        partial_backup BOOLEAN NOT NULL DEFAULT 0,
        dryrun BOOLEAN NOT NULL DEFAULT 0,
        main_operation TEXT NOT NULL,
        parsed_result TEXT NOT NULL,
        interrupted BOOLEAN NOT NULL DEFAULT 0,
        version TEXT,
        begin_time DATETIME NOT NULL,
        end_time DATETIME NOT NULL,
        warnings_actual_length INTEGER NOT NULL DEFAULT 0,
        errors_actual_length INTEGER NOT NULL DEFAULT 0,
        messages_actual_length INTEGER NOT NULL DEFAULT 0,
        
        -- BackendStatistics fields
        bytes_downloaded INTEGER NOT NULL DEFAULT 0,
        known_file_size INTEGER NOT NULL DEFAULT 0,
        last_backup_date DATETIME,
        backup_list_count INTEGER NOT NULL DEFAULT 0,
        reported_quota_error BOOLEAN NOT NULL DEFAULT 0,
        reported_quota_warning BOOLEAN NOT NULL DEFAULT 0,
        backend_main_operation TEXT,
        backend_parsed_result TEXT,
        backend_interrupted BOOLEAN NOT NULL DEFAULT 0,
        backend_version TEXT,
        backend_begin_time DATETIME,
        backend_duration TEXT,
        backend_warnings_actual_length INTEGER NOT NULL DEFAULT 0,
        backend_errors_actual_length INTEGER NOT NULL DEFAULT 0,
        
        FOREIGN KEY (server_id) REFERENCES servers(id)
      );

      CREATE INDEX IF NOT EXISTS idx_backups_server_id ON backups(server_id);
      CREATE INDEX IF NOT EXISTS idx_backups_date ON backups(date);
      CREATE INDEX IF NOT EXISTS idx_backups_begin_time ON backups(begin_time);
      CREATE INDEX IF NOT EXISTS idx_backups_end_time ON backups(end_time);
      CREATE INDEX IF NOT EXISTS idx_backups_backup_id ON backups(backup_id);

      CREATE TABLE IF NOT EXISTS configurations (
        key TEXT PRIMARY KEY NOT NULL,
        value TEXT
      );

      -- User Access Control tables (from v4.0)
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        is_admin BOOLEAN NOT NULL DEFAULT 0,
        must_change_password BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login_at DATETIME,
        last_login_ip TEXT,
        failed_login_attempts INTEGER DEFAULT 0,
        locked_until DATETIME
      );

      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
      CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login_at);

      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_accessed DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME NOT NULL,
        ip_address TEXT,
        user_agent TEXT,
        csrf_token TEXT,
        csrf_expires_at DATETIME,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
      CREATE INDEX IF NOT EXISTS idx_sessions_last_accessed ON sessions(last_accessed);

      CREATE TABLE IF NOT EXISTS audit_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        user_id TEXT,
        username TEXT,
        action TEXT NOT NULL,
        category TEXT NOT NULL,
        target_type TEXT,
        target_id TEXT,
        details TEXT,
        ip_address TEXT,
        user_agent TEXT,
        status TEXT NOT NULL,
        error_message TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      );

      CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_log(timestamp);
      CREATE INDEX IF NOT EXISTS idx_audit_user_id ON audit_log(user_id);
      CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_log(action);
      CREATE INDEX IF NOT EXISTS idx_audit_category ON audit_log(category);
      CREATE INDEX IF NOT EXISTS idx_audit_status ON audit_log(status);
    `);
          
          // Create admin user with bcrypt hash (use INSERT OR IGNORE to handle race conditions)
          // Even with the lock, there might be edge cases, so use INSERT OR IGNORE
          let adminUserCreated = false;
          const adminId = 'admin-' + randomBytes(16).toString('hex');
          const adminPasswordHash = bcrypt.hashSync(defaultAuthConfig.defaultPassword, 12);
          
          try {
            db.prepare(`
              INSERT INTO users (
                id, 
                username, 
                password_hash, 
                is_admin, 
                must_change_password
              ) VALUES (?, ?, ?, ?, ?)
            `).run(
              adminId,
              'admin',
              adminPasswordHash,
              1,
              1
            );
            adminUserCreated = true;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            // If admin user already exists (UNIQUE constraint), that's okay
            if (errorMessage.includes('UNIQUE constraint') || errorMessage.includes('username')) {
              // Silent - admin user already exists, another process created it
            } else {
              throw error;
            }
          }
          
          // Set audit retention configuration
          db.prepare(
            'INSERT OR REPLACE INTO configurations (key, value) VALUES (?, ?)'
          ).run('audit_retention_days', '90');
          
          // Log initial database creation (only if not already logged)
          // Check if initialization log already exists to handle concurrent builds
          const existingInitLog = db.prepare(`
            SELECT id FROM audit_log 
            WHERE action = 'database_initialization' AND category = 'system'
            LIMIT 1
          `).get() as { id: number } | undefined;
          
          if (!existingInitLog) {
            db.prepare(`
              INSERT INTO audit_log (
                action, 
                category, 
                status, 
                username,
                details
              ) VALUES (?, ?, ?, ?, ?)
            `).run(
              'database_initialization',
              'system',
              'success',
              'system',
              JSON.stringify({ 
                schema_version: '4.0',
                description: 'New database initialized with full schema',
                tables_created: ['servers', 'backups', 'configurations', 'users', 'sessions', 'audit_log'],
                admin_user_created: true,
                default_password: `${defaultAuthConfig.defaultPassword} (must change on first login)`,
                sessions_note: 'user_id is nullable to support unauthenticated sessions'
              })
            );
          }
          
          // Version was already set at the beginning of initialization
          // Just verify it's still set correctly
          const versionCheck = db.prepare('SELECT version FROM db_version WHERE version = ?').get('4.0') as { version: string } | undefined;
          if (!versionCheck) {
            // Version was somehow lost, set it again
            db.prepare('INSERT OR REPLACE INTO db_version (version, applied_at) VALUES (?, CURRENT_TIMESTAMP)').run('4.0');
          }
          
          console.log('Database initialized with schema v4.0');
          if (adminUserCreated) {
            console.log(`Admin user created: username="admin", password="${defaultAuthConfig.defaultPassword}" (must change on first login)`);
          }
          console.log('Database schema initialized successfully');
          
          // Populate default configurations for new databases (silent - uses INSERT OR REPLACE)
          populateDefaultConfigurations().catch(error => {
            console.error('Failed to populate default configurations:', error instanceof Error ? error.message : String(error));
          });
        } else {
          // Tables were created by another process while we waited for the lock
          // Verify version is set
          try {
            const versionCheck = db.prepare('SELECT version FROM db_version WHERE version = ?').get('4.0') as { version: string } | undefined;
            if (versionCheck) {
              isFreshDatabase = true;
              // Silent - another process handled it
            } else {
              throw new Error('Database tables exist but version is not set');
            }
          } catch (error) {
            throw new Error('Failed to verify database version after lock acquisition');
          }
        }
      } finally {
        // Always release the lock
        initLock.releaseLock();
      }
    }
  } else {
    // Database already exists, not a fresh database
    isFreshDatabase = false;
  }
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  // During concurrent builds, tables might already exist - this is okay
  // Check if the error is about tables already existing
  if (errorMessage.includes('already exists') || errorMessage.includes('table') && errorMessage.includes('exists')) {
    console.log('Database tables already exist (likely from concurrent build process), continuing...');
    // Don't throw - the database is already initialized
    isFreshDatabase = true; // Mark as fresh so migrations are skipped
  } else {
    console.error('Failed to initialize database schema:', errorMessage);
    throw error;
  }
}

// Helper function to safely prepare statements with error handling
function safePrepare(sql: string, name: string) {
  try {
    const stmt = db.prepare(sql);
    // log(`Prepared statement '${name}' successfully`);
    return stmt;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // If table doesn't exist (e.g., pre-migration), create a dummy statement
    // This allows the app to start even if new tables aren't created yet
    if (errorMessage.includes('no such table')) {
      console.warn(`[Database] Table doesn't exist yet for statement '${name}', creating placeholder`);
      // Return a dummy statement that will throw a helpful error if called
      return {
        run: () => { throw new Error(`Table for '${name}' doesn't exist yet. Run migration 4.0.`); },
        get: () => { throw new Error(`Table for '${name}' doesn't exist yet. Run migration 4.0.`); },
        all: () => { throw new Error(`Table for '${name}' doesn't exist yet. Run migration 4.0.`); },
      } as any;
    }
    
    console.error(`Failed to prepare statement '${name}':`, errorMessage);
    throw error;
  }
}

// Function to populate default configurations
async function populateDefaultConfigurations() {
  try {
    
    // Import default configurations
    const { 
      defaultCronConfig, 
      generateDefaultNtfyTopic,
      defaultNtfyConfig,
      defaultOverdueTolerance,
      defaultNotificationFrequencyConfig,
      defaultNotificationTemplates
    } = await import('./default-config');
    
    // Generate default ntfy topic
    const defaultTopic = generateDefaultNtfyTopic();
    const ntfyConfig = { ...defaultNtfyConfig, topic: defaultTopic };
    // Set cron_service configuration
    db.prepare('INSERT OR REPLACE INTO configurations (key, value) VALUES (?, ?)').run(
      'cron_service', 
      JSON.stringify(defaultCronConfig)
    );
    
    // Set overdue_tolerance configuration
    db.prepare('INSERT OR REPLACE INTO configurations (key, value) VALUES (?, ?)').run(
      'overdue_tolerance', 
      defaultOverdueTolerance
    );
    
    // Set ntfy_config and notification_templates configuration
    db.prepare('INSERT OR REPLACE INTO configurations (key, value) VALUES (?, ?)').run(
      'ntfy_config', 
      JSON.stringify(ntfyConfig)
    );
    db.prepare('INSERT OR REPLACE INTO configurations (key, value) VALUES (?, ?)').run(
      'notification_templates', 
      JSON.stringify(defaultNotificationTemplates)
    );
    
    // Set notification_frequency configuration
    db.prepare('INSERT OR REPLACE INTO configurations (key, value) VALUES (?, ?)').run(
      'notification_frequency', 
      defaultNotificationFrequencyConfig
    );
    
    // Silent - configurations are populated/updated using INSERT OR REPLACE
    // No need to log unless there's an actual change or error
  } catch (error) {
    console.error('Failed to populate default configurations:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}

// Initialize migrations and database operations
const migrator = new DatabaseMigrator(db, dbPath);
let dbOps: ReturnType<typeof createDbOps> | null = null;
let initializationPromise: Promise<void> | null = null;

// Database initialization status tracking
export enum DatabaseStatus {
  NOT_STARTED = 'not_started',
  INITIALIZING = 'initializing',
  READY = 'ready',
  ERROR = 'error'
}

let databaseStatus: DatabaseStatus = DatabaseStatus.NOT_STARTED;
let initializationError: Error | null = null;

// Function to ensure database is fully initialized
async function ensureDatabaseInitialized() {
  // If already ready, return immediately (no logging)
  if (databaseStatus === DatabaseStatus.READY) {
    return;
  }

  // If there's an error, throw it
  if (databaseStatus === DatabaseStatus.ERROR && initializationError) {
    throw initializationError;
  }

  // If already initializing, wait for the existing promise
  if (initializationPromise) {
    return initializationPromise;
  }

  // Start initialization
  databaseStatus = DatabaseStatus.INITIALIZING;
  initializationError = null;

  initializationPromise = (async () => {
    try {
      // Check the actual database version before deciding whether to run migrations
      const currentVersion = migrator.getCurrentVersion();
      
      if (currentVersion === '4.0') {
        // Database is at latest version, no migrations needed
        // Only log if we actually created a fresh database
        if (isFreshDatabase) {
          // Already logged during initialization
        }
      } else if (isFreshDatabase) {
        // Fresh database but version check failed - shouldn't happen, but skip migrations
      } else {
        // Database exists but is not at version 4.0, run migrations
        await migrator.runMigrations();
      }
      
      // Create database operations if not already created
      if (!dbOps) {
        dbOps = createDbOps();
      }
      
      databaseStatus = DatabaseStatus.READY;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      // Don't log ENOENT errors for lock files - they're expected in concurrent scenarios
      if (!errorMessage.includes('ENOENT') || !errorMessage.includes('lock')) {
        console.error('[Database] Initialization failed:', errorMessage);
      }
      databaseStatus = DatabaseStatus.ERROR;
      initializationError = error instanceof Error ? error : new Error(errorMessage);
      // Only throw if it's not a lock file ENOENT error
      if (!errorMessage.includes('ENOENT') || !errorMessage.includes('lock')) {
        throw initializationError;
      } else {
        // For lock file ENOENT errors, just mark as ready (another process handled it)
        databaseStatus = DatabaseStatus.READY;
        initializationError = null;
      }
    }
  })();

  return initializationPromise;
}

// Function to get current database status
function getDatabaseStatus(): { status: DatabaseStatus; error?: Error } {
  return {
    status: databaseStatus,
    error: initializationError || undefined
  };
}

// Function to check database connection health
function checkDatabaseHealth(): { healthy: boolean; error?: string; details?: Record<string, unknown> } {
  try {
    // Test basic connection
    const testResult = db.prepare('SELECT 1 as test').get() as { test: number };
    
    if (!testResult || testResult.test !== 1) {
      return { healthy: false, error: 'Database connection test failed' };
    }
    
    // Check WAL mode
    const walMode = db.pragma('journal_mode') as { journal_mode: string };
    
    // Check if database is locked
    const busyTimeout = db.pragma('busy_timeout') as { busy_timeout: number };
    
    return {
      healthy: true,
      details: {
        walMode: walMode.journal_mode,
        busyTimeout: busyTimeout.busy_timeout,
        status: databaseStatus
      }
    };
  } catch (error) {
    return {
      healthy: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// Function to perform database maintenance
function performDatabaseMaintenance(): { success: boolean; error?: string } {
  try {
    // Checkpoint WAL file
    const checkpointResult = db.pragma('wal_checkpoint(TRUNCATE)') as { 
      busy: number; 
      log: number; 
      checkpointed: number 
    };
    
    // Incremental vacuum
    db.pragma('incremental_vacuum');
    
    console.log('[Database] Maintenance completed:', checkpointResult);
    
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[Database] Maintenance failed:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

// Start initialization immediately and block until complete
// This ensures database is ready before any routes/pages try to access it
let startupInitialization: Promise<void> | null = null;
let initializationComplete = false;

startupInitialization = ensureDatabaseInitialized()
  .then(() => {
    initializationComplete = true;
    // Only log if we actually did something (created DB or ran migrations)
    // Silent if database was already ready
  })
  .catch(error => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    // Don't log ENOENT errors for lock files
    if (!errorMessage.includes('ENOENT') || !errorMessage.includes('lock')) {
      console.error('[Database] Startup initialization failed:', error);
    }
    throw error; // Propagate error to prevent app startup with broken database
  });

// Export helper to wait for startup initialization
export async function waitForDatabaseReady(): Promise<void> {
  if (startupInitialization) {
    await startupInitialization;
  }
  await ensureDatabaseInitialized();
}

// Helper functions for database operations
function createDbOps() {
  return {
  // Server operations
  upsertServer: safePrepare(`
    INSERT INTO servers (id, name, server_url, alias, note, server_password)
    VALUES (@id, @name, @server_url, @alias, @note, @server_password)
    ON CONFLICT(id) DO UPDATE SET
      name = @name,
      server_url = @server_url,
      alias = @alias,
      note = @note,
      server_password = @server_password
  `, 'upsertServer'),

  insertServerIfNotExists: safePrepare(`
    INSERT INTO servers (id, name, alias, note)
    VALUES (@id, @name, @alias, @note)
    ON CONFLICT(id) DO NOTHING
  `, 'insertServerIfNotExists'),

  insertServerIfNotExistsWithDefaults: safePrepare(`
    INSERT INTO servers (id, name)
    VALUES (@id, @name)
    ON CONFLICT(id) DO NOTHING
  `, 'insertServerIfNotExistsWithDefaults'),

  updateServerServerUrl: safePrepare(`
    UPDATE servers 
    SET server_url = @server_url 
    WHERE id = @id
  `, 'updateServerServerUrl'),

  getServerById: safePrepare(`
    SELECT id, name, server_url, alias, note, created_at, 
           CASE WHEN server_password IS NOT NULL AND server_password != '' THEN 1 ELSE 0 END as has_password
    FROM servers WHERE id = ?
  `, 'getServer'),

  getServerByName: safePrepare(`
    SELECT id, name, server_url, alias, note, created_at,
           CASE WHEN server_password IS NOT NULL AND server_password != '' THEN 1 ELSE 0 END as has_password
    FROM servers WHERE name = ?
  `, 'getServerByName'),

  getAllServersByName: safePrepare(`
    SELECT id, name, server_url, alias, note, created_at,
           CASE WHEN server_password IS NOT NULL AND server_password != '' THEN 1 ELSE 0 END as has_password
    FROM servers WHERE name = ?
  `, 'getAllServersByName'),

  getAllServers: safePrepare(`
    SELECT id, name, server_url, alias, note, created_at,
           CASE WHEN server_password IS NOT NULL AND server_password != '' THEN 1 ELSE 0 END as has_password
    FROM servers ORDER BY name
  `, 'getAllServers'),

  getServerPassword: safePrepare(`
    SELECT server_password FROM servers WHERE id = ?
  `, 'getServerPassword'),

  setServerPassword: safePrepare(`
    UPDATE servers SET server_password = ? WHERE id = ?
  `, 'setServerPassword'),

  // Backup operations
  insertBackup: safePrepare(`
    INSERT INTO backups (
      id, server_id, backup_name, backup_id, date, status, duration_seconds,
      size, uploaded_size, examined_files, warnings, errors,
      messages_array, warnings_array, errors_array, available_backups,
      deleted_files, deleted_folders, modified_files, opened_files, added_files,
      size_of_modified_files, size_of_added_files, size_of_examined_files, size_of_opened_files,
      not_processed_files, added_folders, too_large_files, files_with_error,
      modified_folders, modified_symlinks, added_symlinks, deleted_symlinks,
      partial_backup, dryrun, main_operation, parsed_result, interrupted,
      version, begin_time, end_time, warnings_actual_length, errors_actual_length, messages_actual_length,
      bytes_downloaded, known_file_size, last_backup_date, backup_list_count,
      reported_quota_error, reported_quota_warning, backend_main_operation,
      backend_parsed_result, backend_interrupted, backend_version,
      backend_begin_time, backend_duration, backend_warnings_actual_length,
      backend_errors_actual_length
    ) VALUES (
      @id, @server_id, @backup_name, @backup_id, @date, @status, @duration_seconds,
      @size, @uploaded_size, @examined_files, @warnings, @errors,
      @messages_array, @warnings_array, @errors_array, @available_backups,
      @deleted_files, @deleted_folders, @modified_files, @opened_files, @added_files,
      @size_of_modified_files, @size_of_added_files, @size_of_examined_files, @size_of_opened_files,
      @not_processed_files, @added_folders, @too_large_files, @files_with_error,
      @modified_folders, @modified_symlinks, @added_symlinks, @deleted_symlinks,
      @partial_backup, @dryrun, @main_operation, @parsed_result, @interrupted,
      @version, @begin_time, @end_time, @warnings_actual_length, @errors_actual_length, @messages_actual_length,
      @bytes_downloaded, @known_file_size, @last_backup_date, @backup_list_count,
      @reported_quota_error, @reported_quota_warning, @backend_main_operation,
      @backend_parsed_result, @backend_interrupted, @backend_version,
      @backend_begin_time, @backend_duration, @backend_warnings_actual_length,
      @backend_errors_actual_length
    )
  `, 'insertBackup'),

  getLatestBackup: safePrepare(`
    SELECT b.*, s.name as server_name
    FROM backups b
    JOIN servers s ON b.server_id = s.id
    WHERE b.server_id = ?
    ORDER BY b.date DESC
    LIMIT 1
  `, 'getLatestBackup'),

  getLatestBackupByName: safePrepare(`
    SELECT b.*, s.name as server_name
    FROM backups b
    JOIN servers s ON b.server_id = s.id
    WHERE b.server_id = ? AND b.backup_name = ?
    ORDER BY b.date DESC
    LIMIT 1
  `, 'getLatestBackupByName'),

  getServersBackupNames: safePrepare(`
    SELECT 
      s.id AS server_id,
      s.name AS server_name,
      b.backup_name,
      s.server_url,
      s.alias,
      s.note,
      CASE WHEN s.server_password IS NOT NULL AND s.server_password != '' THEN 1 ELSE 0 END as has_password
    FROM servers s
    JOIN backups b ON b.server_id = s.id
    GROUP BY s.id, s.name, b.backup_name
    ORDER BY s.name, b.backup_name
  `, 'getServersBackupNames'),

  getAllLatestBackups: safePrepare(`
    SELECT 
      b.server_id,
      b.backup_name,
      b.date,
      s.name as server_name
    FROM backups b
    JOIN servers s ON b.server_id = s.id
    WHERE (b.server_id, b.backup_name, b.date) IN (
      SELECT server_id, backup_name, MAX(date) as max_date
      FROM backups
      GROUP BY server_id, backup_name
    )
    ORDER BY s.name, b.backup_name
  `, 'getAllLatestBackups'),

  getServerBackups: safePrepare(`
    SELECT 
      b.id,
      b.server_id,
      b.backup_name,
      b.date,
      b.status,
      b.duration_seconds,
      b.size,
      b.examined_files,
      b.warnings,
      b.errors,
      COALESCE(b.uploaded_size, 0) as uploaded_size,
      COALESCE(b.known_file_size, 0) as known_file_size,
      b.backup_list_count,
      b.messages_array,
      b.warnings_array,
      b.errors_array,
      b.available_backups,
      b.warnings_actual_length,
      b.errors_actual_length,
      b.messages_actual_length,
      s.name as server_name
    FROM backups b
    JOIN servers s ON b.server_id = s.id
    WHERE b.server_id = ?
    ORDER BY b.date DESC
  `, 'getServerBackups'),

   getOverallSummary: safePrepare(`
    SELECT 
      COUNT(DISTINCT s.id) as total_servers,
      COUNT(b.id) as total_backups_runs,
      COUNT(DISTINCT s.id || ':' || b.backup_name) as total_backups,
      COALESCE(SUM(b.uploaded_size), 0) as total_uploaded_size,
      (
        SELECT COALESCE(SUM(b2.known_file_size), 0)
        FROM backups b2
        INNER JOIN (
          SELECT server_id, MAX(date) as max_date
          FROM backups
          GROUP BY server_id
        ) latest ON b2.server_id = latest.server_id AND b2.date = latest.max_date
      ) as total_storage_used,
      (
        SELECT COALESCE(SUM(b2.size_of_examined_files), 0)
        FROM backups b2
        INNER JOIN (
          SELECT server_id, MAX(date) as max_date
          FROM backups
          GROUP BY server_id
        ) latest ON b2.server_id = latest.server_id AND b2.date = latest.max_date
      ) as total_backuped_size
    FROM servers s
    LEFT JOIN backups b ON b.server_id = s.id
  `, 'getOverallSummary'),
  
  getLatestBackupDate: safePrepare(`
    SELECT MAX(date) as last_backup_date
    FROM backups
  `, 'getLatestBackupDate'),

  getAggregatedChartData: safePrepare(`
    SELECT 
      strftime('%d/%m/%Y', DATE(b.date)) as date,
      b.date as isoDate,
      COALESCE(b.uploaded_size, 0) as uploadedSize,
      CAST(b.duration_seconds / 60 AS INTEGER) as duration,
      COALESCE(b.examined_files, 0) as fileCount,
      COALESCE(b.size, 0) as fileSize,
      COALESCE(b.known_file_size, 0) as storageSize,
      COALESCE(b.backup_list_count, 0) as backupVersions
    FROM backups b
    ORDER BY b.date
  `, 'getAggregatedChartData'),

  checkDuplicateBackup: safePrepare(`
    SELECT COUNT(*) as count
    FROM backups
    WHERE server_id = @server_id
    AND backup_name = @backup_name
    AND date = @date
  `, 'checkDuplicateBackup'),

  // Add new operation to delete a specific server and its backups
  deleteServer: safePrepare(`
    DELETE FROM servers WHERE id = ?
  `, 'deleteServer'),

  deleteServerBackups: safePrepare(`
    DELETE FROM backups WHERE server_id = ?
  `, 'deleteServerBackups'),

  // New query for server cards - get backup status history for status bars
   getServersSummary: safePrepare(`
    SELECT
      s.id AS server_id,
      s.name AS server_name,
      s.server_url AS server_url,
      s.alias,
      s.note,
      CASE WHEN s.server_password IS NOT NULL AND s.server_password != '' THEN 1 ELSE 0 END as has_password,
      b.backup_name,
      lb.last_backup_date,
      b2.id AS last_backup_id,
      b2.status AS last_backup_status,
      b2.duration_seconds AS last_backup_duration,
      (
        SELECT COUNT(*)
        FROM backups b_count
        WHERE b_count.server_id = s.id AND b_count.backup_name = b.backup_name
      ) AS backup_count,
      b2.examined_files AS file_count,
      b2.size AS file_size,
      b2.known_file_size AS storage_size,
      b2.backup_list_count AS backup_versions,
      b2.available_backups AS available_backups,
      b2.uploaded_size AS uploaded_size,
      b2.warnings AS warnings,
      b2.errors AS errors,
      (
        SELECT GROUP_CONCAT(b_hist_status, ',')
        FROM (
          SELECT b_hist.status as b_hist_status
          FROM backups b_hist
          WHERE b_hist.server_id = s.id AND b_hist.backup_name = b.backup_name
          ORDER BY b_hist.date
        )
      ) AS status_history
    FROM servers s
    JOIN backups b ON b.server_id = s.id
    LEFT JOIN (
      SELECT
        server_id,
        backup_name,
        MAX(date) AS last_backup_date
      FROM backups
      GROUP BY server_id, backup_name
    ) lb ON lb.server_id = s.id AND lb.backup_name = b.backup_name
    LEFT JOIN backups b2
      ON b2.server_id = s.id
      AND b2.backup_name = b.backup_name
      AND b2.date = lb.last_backup_date
    WHERE lb.last_backup_date IS NOT NULL
    GROUP BY s.id, s.name, b.backup_name, lb.last_backup_date, b2.id, b2.status, b2.duration_seconds, b2.examined_files, b2.size, b2.known_file_size, b2.backup_list_count, b2.uploaded_size
    ORDER BY s.name, b.backup_name  
  `, 'getServersSummary'),

  // Query to get all servers chart data grouped by date and server
  getAllServersChartData: safePrepare(`
    SELECT
      strftime('%Y-%m-%d', DATE(b.date)) AS date,
      b.date AS isoDate,
      b.server_id AS serverId,
      SUM(COALESCE(b.uploaded_size, 0)) AS uploadedSize,
      SUM(COALESCE(b.duration_seconds, 0)) AS duration,
      SUM(COALESCE(b.examined_files, 0)) AS fileCount,
      SUM(COALESCE(b.size, 0)) AS fileSize,
      SUM(COALESCE(b.known_file_size, 0)) AS storageSize,
      SUM(COALESCE(b.backup_list_count, 0)) AS backupVersions
    FROM backups b
    GROUP BY b.date, b.server_id
    ORDER BY b.date
  `, 'getAllServersChartData'),

  // New query for aggregated chart data with time range filtering
  getAggregatedChartDataWithTimeRange: safePrepare(`
    SELECT
      strftime('%Y-%m-%d', DATE(b.date)) AS date,
      b.date AS isoDate,
      SUM(COALESCE(b.uploaded_size, 0)) AS uploadedSize,
      SUM(COALESCE(b.duration_seconds, 0)) AS duration,
      SUM(COALESCE(b.examined_files, 0)) AS fileCount,
      SUM(COALESCE(b.size, 0)) AS fileSize,
      SUM(COALESCE(b.known_file_size, 0)) AS storageSize,
      SUM(COALESCE(b.backup_list_count, 0)) AS backupVersions
    FROM backups b
    WHERE b.date BETWEEN @startDate AND @endDate
    GROUP BY DATE(b.date)
    ORDER BY b.date
  `, 'getAggregatedChartDataWithTimeRange'),

  // New query for server chart data (no date filtering)
  getServerChartData: safePrepare(`
    SELECT
      strftime('%Y-%m-%d', DATE(b.date)) AS date,
      b.date AS isoDate,
      SUM(COALESCE(b.uploaded_size, 0)) AS uploadedSize,
      SUM(COALESCE(b.duration_seconds, 0)) AS duration,
      SUM(COALESCE(b.examined_files, 0)) AS fileCount,
      SUM(COALESCE(b.size, 0)) AS fileSize,
      SUM(COALESCE(b.known_file_size, 0)) AS storageSize,
      SUM(COALESCE(b.backup_list_count, 0)) AS backupVersions
    FROM backups b
    WHERE b.server_id = ?
    GROUP BY DATE(b.date)
    ORDER BY b.date
  `, 'getServerChartData'),

  // New query for server chart data with time range filtering
  getServerChartDataWithTimeRange: safePrepare(`
    SELECT
      strftime('%Y-%m-%d', DATE(b.date)) AS date,
      b.date AS isoDate,
      SUM(COALESCE(b.uploaded_size, 0)) AS uploadedSize,
      SUM(COALESCE(b.duration_seconds, 0)) AS duration,
      SUM(COALESCE(b.examined_files, 0)) AS fileCount,
      SUM(COALESCE(b.size, 0)) AS fileSize,
      SUM(COALESCE(b.known_file_size, 0)) AS storageSize,
      SUM(COALESCE(b.backup_list_count, 0)) AS backupVersions
    FROM backups b
    WHERE b.server_id = @serverId
    AND b.date BETWEEN @startDate AND @endDate
    GROUP BY DATE(b.date)
    ORDER BY b.date
  `, 'getServerChartDataWithTimeRange'),

  // New query for server/backup chart data (no date filtering)
  getServerBackupChartData: safePrepare(`
    SELECT
      strftime('%Y-%m-%d', DATE(b.date)) AS date,
      b.date AS isoDate,
      SUM(COALESCE(b.uploaded_size, 0)) AS uploadedSize,
      SUM(COALESCE(b.duration_seconds, 0)) AS duration,
      SUM(COALESCE(b.examined_files, 0)) AS fileCount,
      SUM(COALESCE(b.size, 0)) AS fileSize,
      SUM(COALESCE(b.known_file_size, 0)) AS storageSize,
      SUM(COALESCE(b.backup_list_count, 0)) AS backupVersions
    FROM backups b
    WHERE b.server_id = @serverId
    AND b.backup_name = @backupName
    GROUP BY DATE(b.date)
    ORDER BY b.date
  `, 'getServerBackupChartData'),

  // New query for server/backup chart data with time range filtering
  getServerBackupChartDataWithTimeRange: safePrepare(`
    SELECT
      strftime('%Y-%m-%d', DATE(b.date)) AS date,
      b.date AS isoDate,
      SUM(COALESCE(b.uploaded_size, 0)) AS uploadedSize,
      SUM(COALESCE(b.duration_seconds, 0)) AS duration,
      SUM(COALESCE(b.examined_files, 0)) AS fileCount,
      SUM(COALESCE(b.size, 0)) AS fileSize,
      SUM(COALESCE(b.known_file_size, 0)) AS storageSize,
      SUM(COALESCE(b.backup_list_count, 0)) AS backupVersions
    FROM backups b
    WHERE b.server_id = @serverId
      AND b.backup_name = @backupName
      AND b.date BETWEEN @startDate AND @endDate
    GROUP BY DATE(b.date)
    ORDER BY b.date
  `, 'getServerBackupChartDataWithTimeRange'),

  // User operations
  getUserById: safePrepare(`
    SELECT id, username, is_admin, must_change_password, created_at, updated_at, 
           last_login_at, last_login_ip, failed_login_attempts, locked_until
    FROM users WHERE id = ?
  `, 'getUserById'),

  getUserByIdWithPassword: safePrepare(`
    SELECT id, username, password_hash, is_admin, must_change_password, created_at, updated_at, 
           last_login_at, last_login_ip, failed_login_attempts, locked_until
    FROM users WHERE id = ?
  `, 'getUserByIdWithPassword'),

  getUserByUsername: safePrepare(`
    SELECT id, username, password_hash, is_admin, must_change_password, created_at, 
           updated_at, last_login_at, last_login_ip, failed_login_attempts, locked_until
    FROM users WHERE username = ?
  `, 'getUserByUsername'),

  getAllUsers: safePrepare(`
    SELECT id, username, is_admin, must_change_password, created_at, updated_at, 
           last_login_at, last_login_ip, failed_login_attempts, locked_until
    FROM users ORDER BY username
  `, 'getAllUsers'),

  createUser: safePrepare(`
    INSERT INTO users (
      id, username, password_hash, is_admin, must_change_password
    ) VALUES (?, ?, ?, ?, ?)
  `, 'createUser'),

  updateUser: safePrepare(`
    UPDATE users 
    SET username = ?, is_admin = ?, must_change_password = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, 'updateUser'),

  updateUserPassword: safePrepare(`
    UPDATE users 
    SET password_hash = ?, must_change_password = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, 'updateUserPassword'),

  updateUserLoginInfo: safePrepare(`
    UPDATE users 
    SET last_login_at = CURRENT_TIMESTAMP, last_login_ip = ?, 
        failed_login_attempts = 0, locked_until = NULL
    WHERE id = ?
  `, 'updateUserLoginInfo'),

  incrementFailedLoginAttempts: safePrepare(`
    UPDATE users 
    SET failed_login_attempts = failed_login_attempts + 1,
        locked_until = CASE 
          WHEN failed_login_attempts + 1 >= 5 
          THEN datetime('now', '+15 minutes')
          ELSE locked_until
        END
    WHERE id = ?
  `, 'incrementFailedLoginAttempts'),

  unlockUser: safePrepare(`
    UPDATE users 
    SET failed_login_attempts = 0, locked_until = NULL
    WHERE id = ?
  `, 'unlockUser'),

  deleteUser: safePrepare(`
    DELETE FROM users WHERE id = ?
  `, 'deleteUser'),

  countAdminUsers: safePrepare(`
    SELECT COUNT(*) as count FROM users WHERE is_admin = 1
  `, 'countAdminUsers'),

  // Session operations
  createSession: safePrepare(`
    INSERT INTO sessions (
      id, user_id, expires_at, ip_address, user_agent, csrf_token, csrf_expires_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `, 'createSession'),

  getSessionById: safePrepare(`
    SELECT id, user_id, created_at, last_accessed, expires_at, 
           ip_address, user_agent, csrf_token, csrf_expires_at
    FROM sessions WHERE id = ?
  `, 'getSessionById'),

  updateSessionAccess: safePrepare(`
    UPDATE sessions 
    SET last_accessed = CURRENT_TIMESTAMP
    WHERE id = ?
  `, 'updateSessionAccess'),

  updateSessionUser: safePrepare(`
    UPDATE sessions 
    SET user_id = ?, last_accessed = CURRENT_TIMESTAMP, ip_address = ?, user_agent = ?
    WHERE id = ?
  `, 'updateSessionUser'),

  updateSessionCsrfToken: safePrepare(`
    UPDATE sessions 
    SET csrf_token = ?, csrf_expires_at = ?
    WHERE id = ?
  `, 'updateSessionCsrfToken'),

  deleteSession: safePrepare(`
    DELETE FROM sessions WHERE id = ?
  `, 'deleteSession'),

  deleteUserSessions: safePrepare(`
    DELETE FROM sessions WHERE user_id = ?
  `, 'deleteUserSessions'),

  deleteExpiredSessions: safePrepare(`
    DELETE FROM sessions WHERE expires_at < datetime('now')
  `, 'deleteExpiredSessions'),

  // Audit log operations
  insertAuditLog: safePrepare(`
    INSERT INTO audit_log (
      user_id, username, action, category, target_type, target_id, 
      details, ip_address, user_agent, status, error_message
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, 'insertAuditLog'),

  getAuditLogs: safePrepare(`
    SELECT id, timestamp, user_id as userId, username, action, category, target_type as targetType, 
           target_id as targetId, details, ip_address as ipAddress, user_agent as userAgent, status, error_message as errorMessage
    FROM audit_log
    ORDER BY timestamp DESC
    LIMIT ? OFFSET ?
  `, 'getAuditLogs'),

  getAuditLogsFiltered: safePrepare(`
    SELECT id, timestamp, user_id as userId, username, action, category, target_type as targetType, 
           target_id as targetId, details, ip_address as ipAddress, user_agent as userAgent, status, error_message as errorMessage
    FROM audit_log
    WHERE 1=1
      AND (@startDate IS NULL OR timestamp >= @startDate)
      AND (@endDate IS NULL OR timestamp < datetime(@endDate, '+1 day'))
      AND (@userId IS NULL OR user_id = @userId)
      AND (@username IS NULL OR username = @username)
      AND (@action IS NULL OR action = @action)
      AND (@category IS NULL OR category = @category)
      AND (@status IS NULL OR status = @status)
    ORDER BY timestamp DESC
    LIMIT @limit OFFSET @offset
  `, 'getAuditLogsFiltered'),

  countAuditLogs: safePrepare(`
    SELECT COUNT(*) as count FROM audit_log
  `, 'countAuditLogs'),

  countAuditLogsFiltered: safePrepare(`
    SELECT COUNT(*) as count FROM audit_log
    WHERE 1=1
      AND (@startDate IS NULL OR timestamp >= @startDate)
      AND (@endDate IS NULL OR timestamp < datetime(@endDate, '+1 day'))
      AND (@userId IS NULL OR user_id = @userId)
      AND (@username IS NULL OR username = @username)
      AND (@action IS NULL OR action = @action)
      AND (@category IS NULL OR category = @category)
      AND (@status IS NULL OR status = @status)
  `, 'countAuditLogsFiltered'),

  deleteOldAuditLogs: safePrepare(`
    DELETE FROM audit_log 
    WHERE timestamp < datetime('now', '-' || ? || ' days')
  `, 'deleteOldAuditLogs'),

  getAuditLogStats: safePrepare(`
    SELECT 
      COUNT(*) as totalEvents,
      SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successCount,
      SUM(CASE WHEN status = 'failure' THEN 1 ELSE 0 END) as failureCount,
      SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as errorCount
    FROM audit_log
    WHERE timestamp >= datetime('now', '-' || ? || ' days')
  `, 'getAuditLogStats'),

  getUniqueAuditActions: safePrepare(`
    SELECT DISTINCT action
    FROM audit_log
    WHERE action IS NOT NULL AND action != ''
    ORDER BY action
  `, 'getUniqueAuditActions'),

  getUniqueAuditCategories: safePrepare(`
    SELECT DISTINCT category
    FROM audit_log
    WHERE category IS NOT NULL AND category != ''
    ORDER BY category
  `, 'getUniqueAuditCategories'),

  getUniqueAuditStatuses: safePrepare(`
    SELECT DISTINCT status
    FROM audit_log
    WHERE status IS NOT NULL AND status != ''
    ORDER BY status
  `, 'getUniqueAuditStatuses'),

  };
}

// Helper function to parse duration string to seconds
export function parseDurationToSeconds(duration: string): number {
  const [hours, minutes, seconds] = duration.split(':').map(Number);
  return hours * 3600 + minutes * 60 + seconds;
}

// Helper function to format duration from seconds
export function formatDurationFromSeconds(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Check and update CRON_PORT configuration after database initialization is complete
ensureDatabaseInitialized().then(() => {
  import('./db-utils').then(({ checkAndUpdateCronPort }) => {
    checkAndUpdateCronPort();
  }).catch((error) => {
    console.error('Failed to check and update CRON_PORT configuration:', error instanceof Error ? error.message : String(error));
  });
}).catch(error => {
  console.error('Failed to complete database initialization before checking CRON_PORT:', error);
});

// Create a proxy that ensures database initialization is complete before operations
// Note: Database operations are SYNCHRONOUS (better-sqlite3), so we must ensure
// initialization completes before any operations are attempted
const dbOpsProxy = new Proxy({} as ReturnType<typeof createDbOps>, {
  get(target, prop) {
    // Only handle string properties, ignore symbols
    if (typeof prop !== 'string') {
      return undefined;
    }

    // If database is not ready, throw a clear error
    // We cannot wait asynchronously because better-sqlite3 operations are synchronous
          if (!dbOps) {
      throw new Error(
        `[Database] Operation '${prop}' attempted before database initialization completed. ` +
        `This is likely a timing issue during startup. Database operations are synchronous and ` +
        `cannot wait for async initialization. Ensure 'await ensureDatabaseInitialized()' ` +
        `completes before accessing database operations.`
      );
          }
          
          // Get the actual method from dbOps
          const method = (dbOps as Record<string, unknown>)[prop];
          if (typeof method !== 'object' || method === null) {
            throw new Error(`Database operation '${prop}' not found or is not an object.`);
          }
          
    // Return the method directly (it's a prepared statement object with .all, .get, .run)
    return method;
  }
});

// Export the database instance and operations
export { 
  db, 
  dbOpsProxy as dbOps, 
  ensureDatabaseInitialized, 
  getDatabaseStatus, 
  checkDatabaseHealth, 
  performDatabaseMaintenance 
}; 