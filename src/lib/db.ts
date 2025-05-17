import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

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
  db = new Database(path.join(dataDir, 'backups.db'), {
    // Add verbose logging in development
    // verbose: process.env.NODE_ENV === 'development' ? console.log : undefined
    verbose: undefined
  });
} catch (error) {
  console.error('Failed to initialize database:', error);
  throw error;
}

// Initialize database schema
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

// Helper functions for database operations
const dbOps = {
  // Machine operations
  upsertMachine: db.prepare(`
    INSERT INTO machines (id, name)
    VALUES (@id, @name)
    ON CONFLICT(id) DO UPDATE SET
      name = @name
  `),

  getMachine: db.prepare(`
    SELECT * FROM machines WHERE id = ?
  `),

  getMachineByName: db.prepare(`
    SELECT * FROM machines WHERE name = ?
  `),

  getAllMachines: db.prepare(`
    SELECT * FROM machines ORDER BY name
  `),

  // Backup operations
  insertBackup: db.prepare(`
    INSERT INTO backups (
      id, machine_id, backup_name, backup_id, date, status, duration_seconds,
      size, uploaded_size, examined_files, warnings, errors,
      deleted_files, deleted_folders, modified_files, opened_files, added_files,
      size_of_modified_files, size_of_added_files, size_of_examined_files, size_of_opened_files,
      not_processed_files, added_folders, too_large_files, files_with_error,
      modified_folders, modified_symlinks, added_symlinks, deleted_symlinks,
      partial_backup, dryrun, main_operation, parsed_result, interrupted,
      version, begin_time, end_time, warnings_actual_length, errors_actual_length,
      bytes_downloaded, known_file_size, last_backup_date, backup_list_count,
      reported_quota_error, reported_quota_warning, backend_main_operation,
      backend_parsed_result, backend_interrupted, backend_version,
      backend_begin_time, backend_duration, backend_warnings_actual_length,
      backend_errors_actual_length
    ) VALUES (
      @id, @machine_id, @backup_name, @backup_id, @date, @status, @duration_seconds,
      @size, @uploaded_size, @examined_files, @warnings, @errors,
      @deleted_files, @deleted_folders, @modified_files, @opened_files, @added_files,
      @size_of_modified_files, @size_of_added_files, @size_of_examined_files, @size_of_opened_files,
      @not_processed_files, @added_folders, @too_large_files, @files_with_error,
      @modified_folders, @modified_symlinks, @added_symlinks, @deleted_symlinks,
      @partial_backup, @dryrun, @main_operation, @parsed_result, @interrupted,
      @version, @begin_time, @end_time, @warnings_actual_length, @errors_actual_length,
      @bytes_downloaded, @known_file_size, @last_backup_date, @backup_list_count,
      @reported_quota_error, @reported_quota_warning, @backend_main_operation,
      @backend_parsed_result, @backend_interrupted, @backend_version,
      @backend_begin_time, @backend_duration, @backend_warnings_actual_length,
      @backend_errors_actual_length
    )
  `),

  getLatestBackup: db.prepare(`
    SELECT b.*, m.name as machine_name
    FROM backups b
    JOIN machines m ON b.machine_id = m.id
    WHERE b.machine_id = ?
    ORDER BY b.date DESC
    LIMIT 1
  `),

  getMachineBackups: db.prepare(`
    SELECT b.*, m.name as machine_name
    FROM backups b
    JOIN machines m ON b.machine_id = m.id
    WHERE b.machine_id = ?
    ORDER BY b.date DESC
  `),

  getMachinesSummary: db.prepare(`
    WITH latest_backups AS (
      SELECT 
        machine_id,
        MAX(date) as last_backup_date
      FROM backups
      GROUP BY machine_id
    )
    SELECT 
      m.*,
      lb.last_backup_date,
      b.status as last_backup_status,
      b.duration_seconds as last_backup_duration,
      b.warnings as total_warnings,
      b.errors as total_errors,
      COUNT(b2.id) as backup_count
    FROM machines m
    LEFT JOIN latest_backups lb ON m.id = lb.machine_id
    LEFT JOIN backups b ON b.machine_id = m.id AND b.date = lb.last_backup_date
    LEFT JOIN backups b2 ON b2.machine_id = m.id
    GROUP BY m.id
    ORDER BY m.name
  `),

  getOverallSummary: db.prepare(`
    SELECT 
      COUNT(DISTINCT m.id) as total_machines,
      COUNT(b.id) as total_backups,
      SUM(b.uploaded_size) as total_uploaded_size,
      SUM(b.size) as total_storage_used
    FROM machines m
    LEFT JOIN backups b ON b.machine_id = m.id
  `)
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