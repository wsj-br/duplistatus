import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { DatabaseMigrator } from './db-migrations';

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
  // eslint-disable-next-line no-var
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

// Check if database is empty and initialize schema if needed
try {
  // Check if any tables exist by querying sqlite_master
  const tableCount = db.prepare(`
    SELECT COUNT(*) as count 
    FROM sqlite_master 
    WHERE type='table' AND name IN ('servers', 'backups')
  `).get() as { count: number };
  
  // If no tables exist, create the complete schema
  if (tableCount.count === 0) {
    console.log('Initializing new database with latest schema...');
    
    db.exec(`
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

      CREATE TABLE IF NOT EXISTS db_version (
        version TEXT PRIMARY KEY,
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );


      -- Set initial database version for new databases (only if not exists)
      INSERT OR IGNORE INTO db_version (version) VALUES ('3.1');
    `);
    
    console.log('Database schema initialized successfully');
    
    // Populate default configurations for new databases
    populateDefaultConfigurations().catch(error => {
      console.error('Failed to populate default configurations:', error instanceof Error ? error.message : String(error));
    });
  } 
} catch (error) {
  console.error('Failed to initialize database schema:', error instanceof Error ? error.message : String(error));
  throw error;
}

// Helper function to safely prepare statements with error handling
function safePrepare(sql: string, name: string) {
  try {
    const stmt = db.prepare(sql);
    // log(`Prepared statement '${name}' successfully`);
    return stmt;
  } catch (error) {
    console.error(`Failed to prepare statement '${name}':`, error instanceof Error ? error.message : String(error));
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
    
    console.log('Default configurations populated successfully');
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
  // If already ready, return immediately
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
      await migrator.runMigrations();
      
      // Create database operations after migrations complete
      if (!dbOps) {
        dbOps = createDbOps();
      }
      
      databaseStatus = DatabaseStatus.READY;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('[Database] Initialization failed:', errorMessage);
      databaseStatus = DatabaseStatus.ERROR;
      initializationError = error instanceof Error ? error : new Error(errorMessage);
      throw initializationError;
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

// Start initialization immediately but don't block module loading
ensureDatabaseInitialized().catch(error => {
  console.error('Database initialization failed:', error);
});

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
const dbOpsProxy = new Proxy({} as ReturnType<typeof createDbOps>, {
  get(target, prop) {
    // Ensure database is initialized
    if (!dbOps) {
      throw new Error(
        'Database not ready. Please ensure database initialization completes before using database operations. ' +
        'Call "await ensureDatabaseInitialized()" or wait for app startup to complete.'
      );
    }
    
    // Only handle string properties, ignore symbols
    if (typeof prop !== 'string') {
      return undefined;
    }

    // Return a proxy that waits for migrations to complete before accessing the method
    return new Proxy({}, {
      get(methodTarget, methodProp) {
        // Return a function that executes the database operation
        return (...args: unknown[]) => {
          // Check if migrations are complete
          if (!dbOps) {
            throw new Error(`Database operations not yet initialized. Migrations may still be running. Please ensure migrations complete before accessing '${prop}.${String(methodProp)}'.`);
          }
          
          // Get the actual method from dbOps
          const method = (dbOps as Record<string, unknown>)[prop];
          if (typeof method !== 'object' || method === null) {
            throw new Error(`Database operation '${prop}' not found or is not an object.`);
          }
          
          // Get the sub-method (like .all, .get, .run)
          const subMethod = (method as Record<string, unknown>)[methodProp as string];
          if (typeof subMethod !== 'function') {
            throw new Error(`Database operation '${prop}.${String(methodProp)}' not found or is not a function.`);
          }
          
          // Execute the sub-method with proper this context
          return subMethod.call(method, ...args);
        };
      }
    });
  }
});

// Export the database instance and operations
export { db, dbOpsProxy as dbOps, ensureDatabaseInitialized, getDatabaseStatus, checkDatabaseHealth, performDatabaseMaintenance }; 