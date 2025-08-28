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

let db: Database.Database;
const dbPath = path.join(dataDir, 'backups.db');

try {
  // log(`Initializing database at: ${dbPath}`);
  
  db = new Database(dbPath, {
    // Add verbose logging in development
    // verbose: process.env.NODE_ENV === 'development' ? console.log : undefined,
    // Add timeout and other options for better reliability
    timeout: 5000,
    readonly: false
  });
  
  // Test the connection immediately
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = NORMAL');
  db.pragma('cache_size = 1000000');
  db.pragma('temp_store = memory');
  
  // log('Database initialized successfully');
} catch (error) {
  console.error('Failed to initialize database:', error instanceof Error ? error.message : String(error));
  throw error;
}

// Check if database is empty and initialize schema if needed
try {
  // Check if any tables exist by querying sqlite_master
  const tableCount = db.prepare(`
    SELECT COUNT(*) as count 
    FROM sqlite_master 
    WHERE type='table' AND name IN ('machines', 'backups')
  `).get() as { count: number };
  
  // If no tables exist, create the complete schema
  if (tableCount.count === 0) {
    console.log('Initializing new database with latest schema...');
    
    db.exec(`
      CREATE TABLE IF NOT EXISTS machines (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS backups (
        id TEXT PRIMARY KEY,
        machine_id TEXT NOT NULL,
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
        
        FOREIGN KEY (machine_id) REFERENCES machines(id)
      );

      CREATE INDEX IF NOT EXISTS idx_backups_machine_id ON backups(machine_id);
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
      INSERT OR IGNORE INTO db_version (version) VALUES ('2.0');
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

// Run database migrations (only for existing databases that need upgrading)
try {
  const migrator = new DatabaseMigrator(db, dbPath);
  migrator.runMigrations();
} catch (error) {
  console.error('Failed to run database migrations:', error instanceof Error ? error.message : String(error));
  throw error;
}

// Check and update CRON_PORT configuration
try {
  // Import the function from db-utils
  import('./db-utils').then(({ checkAndUpdateCronPort }) => {
    checkAndUpdateCronPort();
  }).catch((error) => {
    console.error('Failed to check and update CRON_PORT configuration:', error instanceof Error ? error.message : String(error));
  });
} catch (error) {
  console.error('Failed to check and update CRON_PORT configuration:', error instanceof Error ? error.message : String(error));
  // Don't throw error to avoid crashing the application startup
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
    console.log('Populating default configurations...');
    
    // Import default configurations
    const { 
      defaultCronConfig, 
      generateDefaultNtfyTopic,
      createDefaultNotificationConfig,
      defaultNtfyConfig,
      defaultOverdueTolerance
    } = await import('./default-config');
    
    // Generate default ntfy topic
    const defaultTopic = generateDefaultNtfyTopic();
    const ntfyConfig = { ...defaultNtfyConfig, topic: defaultTopic };
    
    // Create default notification configuration with templates
    const defaultNotificationConfig = createDefaultNotificationConfig(ntfyConfig);
    
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
    
    // Set notifications configuration with templates
    db.prepare('INSERT OR REPLACE INTO configurations (key, value) VALUES (?, ?)').run(
      'notifications', 
      JSON.stringify(defaultNotificationConfig)
    );
    
    console.log('Default configurations populated successfully');
  } catch (error) {
    console.error('Failed to populate default configurations:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}

// Helper functions for database operations
const dbOps = {
  // Machine operations
  upsertMachine: safePrepare(`
    INSERT INTO machines (id, name)
    VALUES (@id, @name)
    ON CONFLICT(id) DO UPDATE SET
      name = @name
  `, 'upsertMachine'),

  getMachine: safePrepare(`
    SELECT * FROM machines WHERE id = ?
  `, 'getMachine'),

  getMachineByName: safePrepare(`
    SELECT * FROM machines WHERE name = ?
  `, 'getMachineByName'),

  getAllMachines: safePrepare(`
    SELECT * FROM machines ORDER BY name
  `, 'getAllMachines'),

  // Backup operations
  insertBackup: safePrepare(`
    INSERT INTO backups (
      id, machine_id, backup_name, backup_id, date, status, duration_seconds,
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
      @id, @machine_id, @backup_name, @backup_id, @date, @status, @duration_seconds,
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
    SELECT b.*, m.name as machine_name
    FROM backups b
    JOIN machines m ON b.machine_id = m.id
    WHERE b.machine_id = ?
    ORDER BY b.date DESC
    LIMIT 1
  `, 'getLatestBackup'),

  getLatestBackupByName: safePrepare(`
    SELECT b.*, m.name as machine_name
    FROM backups b
    JOIN machines m ON b.machine_id = m.id
    WHERE b.machine_id = ? AND b.backup_name = ?
    ORDER BY b.date DESC
    LIMIT 1
  `, 'getLatestBackupByName'),

  getMachinesBackupNames: safePrepare(`
    SELECT 
      m.name AS machine_name,
      b.backup_name
    FROM machines m
    JOIN backups b ON b.machine_id = m.id
    GROUP BY m.name, b.backup_name
    ORDER BY m.name, b.backup_name
  `, 'getMachinesBackupNames'),

  getMachineBackups: safePrepare(`
    SELECT 
      b.id,
      b.machine_id,
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
      m.name as machine_name
    FROM backups b
    JOIN machines m ON b.machine_id = m.id
    WHERE b.machine_id = ?
    ORDER BY b.date DESC
  `, 'getMachineBackups'),

   getOverallSummary: safePrepare(`
    SELECT 
      COUNT(DISTINCT m.id) as total_machines,
      COUNT(b.id) as total_backups,
      COALESCE(SUM(b.uploaded_size), 0) as total_uploaded_size,
      (
        SELECT COALESCE(SUM(b2.known_file_size), 0)
        FROM backups b2
        INNER JOIN (
          SELECT machine_id, MAX(date) as max_date
          FROM backups
          GROUP BY machine_id
        ) latest ON b2.machine_id = latest.machine_id AND b2.date = latest.max_date
      ) as total_storage_used,
      (
        SELECT COALESCE(SUM(b2.size_of_examined_files), 0)
        FROM backups b2
        INNER JOIN (
          SELECT machine_id, MAX(date) as max_date
          FROM backups
          GROUP BY machine_id
        ) latest ON b2.machine_id = latest.machine_id AND b2.date = latest.max_date
      ) as total_backuped_size
    FROM machines m
    LEFT JOIN backups b ON b.machine_id = m.id
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
    WHERE machine_id = @machine_id
    AND backup_name = @backup_name
    AND date = @date
  `, 'checkDuplicateBackup'),

  // Add new operation to delete a specific machine and its backups
  deleteMachine: safePrepare(`
    DELETE FROM machines WHERE id = ?
  `, 'deleteMachine'),

  deleteMachineBackups: safePrepare(`
    DELETE FROM backups WHERE machine_id = ?
  `, 'deleteMachineBackups'),

  // New query for machine cards - get backup status history for status bars
   getMachinesSummary: safePrepare(`
    SELECT
      m.id AS machine_id,
      m.name AS machine_name,
      b.backup_name,
      lb.last_backup_date,
      b2.id AS last_backup_id,
      b2.status AS last_backup_status,
      b2.duration_seconds AS last_backup_duration,
      (
        SELECT COUNT(*)
        FROM backups b_count
        WHERE b_count.machine_id = m.id AND b_count.backup_name = b.backup_name
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
          WHERE b_hist.machine_id = m.id AND b_hist.backup_name = b.backup_name
          ORDER BY b_hist.date
        )
      ) AS status_history
    FROM machines m
    JOIN backups b ON b.machine_id = m.id
    LEFT JOIN (
      SELECT
        machine_id,
        backup_name,
        MAX(date) AS last_backup_date
      FROM backups
      GROUP BY machine_id, backup_name
    ) lb ON lb.machine_id = m.id AND lb.backup_name = b.backup_name
    LEFT JOIN backups b2
      ON b2.machine_id = m.id
      AND b2.backup_name = b.backup_name
      AND b2.date = lb.last_backup_date
    WHERE lb.last_backup_date IS NOT NULL
    GROUP BY m.id, m.name, b.backup_name, lb.last_backup_date, b2.id, b2.status, b2.duration_seconds, b2.examined_files, b2.size, b2.known_file_size, b2.backup_list_count, b2.uploaded_size
    ORDER BY m.name, b.backup_name  
  `, 'getMachineSummary'),

  // Query to get all machines chart data grouped by date and machine
  getAllMachinesChartData: safePrepare(`
    SELECT
      strftime('%Y-%m-%d', DATE(b.date)) AS date,
      b.date AS isoDate,
      b.machine_id AS machineId,
      SUM(COALESCE(b.uploaded_size, 0)) AS uploadedSize,
      SUM(COALESCE(b.duration_seconds, 0)) AS duration,
      SUM(COALESCE(b.examined_files, 0)) AS fileCount,
      SUM(COALESCE(b.size, 0)) AS fileSize,
      SUM(COALESCE(b.known_file_size, 0)) AS storageSize,
      SUM(COALESCE(b.backup_list_count, 0)) AS backupVersions
    FROM backups b
    GROUP BY b.date, b.machine_id
    ORDER BY b.date
  `, 'getAllMachinesChartData'),

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

  // New query for machine chart data (no date filtering)
  getMachineChartData: safePrepare(`
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
    WHERE b.machine_id = ?
    GROUP BY DATE(b.date)
    ORDER BY b.date
  `, 'getMachineChartData'),

  // New query for machine chart data with time range filtering
  getMachineChartDataWithTimeRange: safePrepare(`
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
    WHERE b.machine_id = @machineId
      AND b.date BETWEEN @startDate AND @endDate
    GROUP BY DATE(b.date)
    ORDER BY b.date
  `, 'getMachineChartDataWithTimeRange'),

  // New query for machine/backup chart data (no date filtering)
  getMachineBackupChartData: safePrepare(`
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
    WHERE b.machine_id = @machineId
      AND b.backup_name = @backupName
    GROUP BY DATE(b.date)
    ORDER BY b.date
  `, 'getMachineBackupChartData'),

  // New query for machine/backup chart data with time range filtering
  getMachineBackupChartDataWithTimeRange: safePrepare(`
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
    WHERE b.machine_id = @machineId
      AND b.backup_name = @backupName
      AND b.date BETWEEN @startDate AND @endDate
    GROUP BY DATE(b.date)
    ORDER BY b.date
  `, 'getMachineBackupChartDataWithTimeRange')
};

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

// Export the database instance and operations
export { db, dbOps }; 