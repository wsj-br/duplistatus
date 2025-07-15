import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { DatabaseMigrator } from './db-migrations';

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

try {
  const dbPath = path.join(dataDir, 'backups.db');
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
  console.error('Failed to initialize database:', error);
  throw error;
}

// Initialize database schema
try {
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
      messages_array TEXT,
      warnings_array TEXT,
      errors_array TEXT,
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

  `);
  // log('Database schema initialized successfully');
} catch (error) {
  console.error('Failed to initialize database schema:', error);
  throw error;
}

// Run database migrations
try {
  const migrator = new DatabaseMigrator(db);
  migrator.runMigrations();
} catch (error) {
  console.error('Failed to run database migrations:', error);
  throw error;
}

// Helper function to safely prepare statements with error handling
function safePrepare(sql: string, name: string) {
  try {
    const stmt = db.prepare(sql);
    // log(`Prepared statement '${name}' successfully`);
    return stmt;
  } catch (error) {
    console.error(`Failed to prepare statement '${name}':`, error);
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

  getMachinesSummary: safePrepare(`
    WITH machine_backups AS (
      SELECT DISTINCT 
        m.id as machine_id,
        m.name as machine_name,
        b.backup_name
      FROM machines m
      JOIN backups b ON b.machine_id = m.id
    ),
    latest_backups AS (
      SELECT 
        machine_id,
        backup_name,
        MAX(date) as last_backup_date
      FROM backups
      GROUP BY machine_id, backup_name
    ),
    numbered_results AS (
      SELECT 
        ROW_NUMBER() OVER (ORDER BY mb.machine_name, mb.backup_name) as id,
        mb.machine_id as machine_id,
        mb.machine_name as name,
        mb.backup_name as last_backup_name,
        lb.last_backup_date,
        b.id as last_backup_id,
        b.status as last_backup_status,
        b.duration_seconds as last_backup_duration,
        b.warnings as total_warnings,
        b.errors as total_errors,
        b.backup_list_count as last_backup_list_count,
        b.available_backups as available_backups,
        COUNT(b2.id) as backup_count
      FROM machine_backups mb
      LEFT JOIN latest_backups lb ON mb.machine_id = lb.machine_id AND mb.backup_name = lb.backup_name
      LEFT JOIN backups b ON b.machine_id = mb.machine_id AND b.date = lb.last_backup_date AND b.backup_name = mb.backup_name
      LEFT JOIN backups b2 ON b2.machine_id = mb.machine_id AND b2.backup_name = mb.backup_name
      GROUP BY mb.machine_id, mb.backup_name
    )
    SELECT * FROM numbered_results
    ORDER BY name, last_backup_name
  `, 'getMachinesSummary'),

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
    WITH latest_backups_per_day AS (
      SELECT 
        DATE(date) as backup_date,
        machine_id,
        date,
        COALESCE(uploaded_size, 0) as uploaded_size,
        COALESCE(size, 0) as file_size,
        COALESCE(examined_files, 0) as file_count,
        COALESCE(known_file_size, 0) as storage_size,
        COALESCE(backup_list_count, 0) as backup_versions,
        duration_seconds,
        ROW_NUMBER() OVER (
          PARTITION BY machine_id, DATE(date) 
          ORDER BY date DESC
        ) as rn
      FROM backups
    ),
    aggregated_by_date AS (
      SELECT 
        backup_date,
        MAX(date) as iso_date,
        SUM(uploaded_size) as total_uploaded_size,
        SUM(duration_seconds) as total_duration_seconds,
        SUM(file_count) as total_file_count,
        SUM(file_size) as total_file_size,
        SUM(storage_size) as total_storage_size,
        SUM(backup_versions) as total_backup_versions
      FROM latest_backups_per_day
      WHERE rn = 1
      GROUP BY backup_date
    )
    SELECT 
      strftime('%d/%m/%Y', backup_date) as date,
      iso_date as isoDate,
      total_uploaded_size as uploadedSize,
      CAST(total_duration_seconds / 60 AS INTEGER) as duration,
      total_file_count as fileCount,
      total_file_size as fileSize,
      total_storage_size as storageSize,
      total_backup_versions as backupVersions
    FROM aggregated_by_date
    ORDER BY backup_date
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
  `, 'deleteMachineBackups')
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