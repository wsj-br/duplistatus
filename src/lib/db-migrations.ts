import Database from 'better-sqlite3';
import { extractAvailableBackups } from './utils';

// Database migration interface
interface Migration {
  version: string;
  description: string;
  up: (db: Database.Database) => void;
  down?: (db: Database.Database) => void;
}

// Interface for backup records from database
interface BackupRecord {
  id: string;
  machine_id: string;
  backup_name: string;
  backup_id: string;
  date: string;
  status: string;
  duration_seconds: number;
  size: number;
  uploaded_size: number;
  examined_files: number;
  warnings: number;
  errors: number;
  created_at: string;
  messages_array: string | null;
  warnings_array: string | null;
  errors_array: string | null;
  available_backups?: string | null;
  deleted_files: number;
  deleted_folders: number;
  modified_files: number;
  opened_files: number;
  added_files: number;
  size_of_modified_files: number;
  size_of_added_files: number;
  size_of_examined_files: number;
  size_of_opened_files: number;
  not_processed_files: number;
  added_folders: number;
  too_large_files: number;
  files_with_error: number;
  modified_folders: number;
  modified_symlinks: number;
  added_symlinks: number;
  deleted_symlinks: number;
  partial_backup: number;
  dryrun: number;
  main_operation: string;
  parsed_result: string;
  interrupted: number;
  version: string | null;
  begin_time: string;
  end_time: string;
  warnings_actual_length: number;
  errors_actual_length: number;
  messages_actual_length: number;
  bytes_downloaded: number;
  known_file_size: number;
  last_backup_date: string | null;
  backup_list_count: number;
  reported_quota_error: number;
  reported_quota_warning: number;
  backend_main_operation: string | null;
  backend_parsed_result: string | null;
  backend_interrupted: number;
  backend_version: string | null;
  backend_begin_time: string | null;
  backend_duration: string | null;
  backend_warnings_actual_length: number;
  backend_errors_actual_length: number;
}

// Migration definitions
const migrations: Migration[] = [
  {
    version: '2.0',
    description: 'Consolidated migration: Add DEFAULT values to message arrays, available_backups field, last_backup_date, backup_list_count, and create configurations table',
    up: (db: Database.Database) => {
      console.log('Running consolidated migration 2.0...');
      
      // First, get all existing data to preserve it
      const existingBackups = db.prepare(`SELECT * FROM backups`).all() as BackupRecord[];
      
      // Create new table with the updated schema (including DEFAULT values and new columns)
      db.exec(`
        CREATE TABLE backups_new (
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
          
          -- Message arrays stored as JSON blobs with DEFAULT values
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
      `);
      
      console.log('Processing existing backup records...');
      
      // Prepare the insert statement for the new table
      const insertBackup = db.prepare(`
        INSERT INTO backups_new (
          id, machine_id, backup_name, backup_id, date, status, duration_seconds,
          size, uploaded_size, examined_files, warnings, errors, created_at,
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
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
      `);
      
      let processedCount = 0;
      let extractedCount = 0;
      
      // Copy data from old table to new table, processing each record
      for (const backup of existingBackups) {
        // Set default values for message arrays if they are NULL
        const messages_array = backup.messages_array || '[]';
        const warnings_array = backup.warnings_array || '[]';
        const errors_array = backup.errors_array || '[]';
        
        // Extract available backups from messages_array
        const availableBackups = extractAvailableBackups(messages_array);
        
        insertBackup.run(
          backup.id, backup.machine_id, backup.backup_name, backup.backup_id,
          backup.date, backup.status, backup.duration_seconds,
          backup.size, backup.uploaded_size, backup.examined_files,
          backup.warnings, backup.errors, backup.created_at,
          messages_array, warnings_array, errors_array, JSON.stringify(availableBackups),
          backup.deleted_files, backup.deleted_folders, backup.modified_files,
          backup.opened_files, backup.added_files, backup.size_of_modified_files,
          backup.size_of_added_files, backup.size_of_examined_files, backup.size_of_opened_files,
          backup.not_processed_files, backup.added_folders, backup.too_large_files,
          backup.files_with_error, backup.modified_folders, backup.modified_symlinks,
          backup.added_symlinks, backup.deleted_symlinks, backup.partial_backup,
          backup.dryrun, backup.main_operation, backup.parsed_result, backup.interrupted,
          backup.version, backup.begin_time, backup.end_time, backup.warnings_actual_length,
          backup.errors_actual_length, backup.messages_actual_length,
          backup.bytes_downloaded, backup.known_file_size, backup.last_backup_date,
          backup.backup_list_count, backup.reported_quota_error, backup.reported_quota_warning,
          backup.backend_main_operation, backup.backend_parsed_result, backup.backend_interrupted,
          backup.backend_version, backup.backend_begin_time, backup.backend_duration,
          backup.backend_warnings_actual_length, backup.backend_errors_actual_length
        );
        
        processedCount++;
        if (availableBackups.length > 0) {
          extractedCount++;
        }
      }
      
      // Drop the old table and rename the new one
      db.exec(`
        DROP TABLE backups;
        ALTER TABLE backups_new RENAME TO backups;
      `);
      
      // Recreate indexes
      db.exec(`
        CREATE INDEX IF NOT EXISTS idx_backups_machine_id ON backups(machine_id);
        CREATE INDEX IF NOT EXISTS idx_backups_date ON backups(date);
        CREATE INDEX IF NOT EXISTS idx_backups_begin_time ON backups(begin_time);
        CREATE INDEX IF NOT EXISTS idx_backups_end_time ON backups(end_time);
        CREATE INDEX IF NOT EXISTS idx_backups_backup_id ON backups(backup_id);
      `);
      
      // Create configurations table
      db.exec(`
        CREATE TABLE IF NOT EXISTS configurations (
          key TEXT PRIMARY KEY NOT NULL,
          value TEXT
        );
      `);
      
      console.log(`Consolidated migration 2.0 completed: Added DEFAULT values to message arrays, available_backups column, last_backup_date, backup_list_count, created configurations table, processed ${processedCount} records, extracted available backups from ${extractedCount} records`);
    },
    down: (db: Database.Database) => {
      // Revert to the original schema without DEFAULT values and without available_backups
      const existingBackups = db.prepare(`SELECT * FROM backups`).all() as BackupRecord[];
      
      // Create table with the original schema (without DEFAULT values for message arrays)
      db.exec(`
        CREATE TABLE backups_original (
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
          
          -- Message arrays without DEFAULT values
          messages_array TEXT,
          warnings_array TEXT,
          errors_array TEXT,
          
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
      `);
      
      // Copy data back (excluding available_backups column)
      const insertBackup = db.prepare(`
        INSERT INTO backups_original (
          id, machine_id, backup_name, backup_id, date, status, duration_seconds,
          size, uploaded_size, examined_files, warnings, errors, created_at,
          messages_array, warnings_array, errors_array,
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
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
      `);
      
      for (const backup of existingBackups) {
        insertBackup.run(
          backup.id, backup.machine_id, backup.backup_name, backup.backup_id,
          backup.date, backup.status, backup.duration_seconds,
          backup.size, backup.uploaded_size, backup.examined_files,
          backup.warnings, backup.errors, backup.created_at,
          backup.messages_array, backup.warnings_array, backup.errors_array,
          backup.deleted_files, backup.deleted_folders, backup.modified_files,
          backup.opened_files, backup.added_files, backup.size_of_modified_files,
          backup.size_of_added_files, backup.size_of_examined_files, backup.size_of_opened_files,
          backup.not_processed_files, backup.added_folders, backup.too_large_files,
          backup.files_with_error, backup.modified_folders, backup.modified_symlinks,
          backup.added_symlinks, backup.deleted_symlinks, backup.partial_backup,
          backup.dryrun, backup.main_operation, backup.parsed_result, backup.interrupted,
          backup.version, backup.begin_time, backup.end_time, backup.warnings_actual_length,
          backup.errors_actual_length, backup.messages_actual_length,
          backup.bytes_downloaded, backup.known_file_size, backup.last_backup_date,
          backup.backup_list_count, backup.reported_quota_error, backup.reported_quota_warning,
          backup.backend_main_operation, backup.backend_parsed_result, backup.backend_interrupted,
          backup.backend_version, backup.backend_begin_time, backup.backend_duration,
          backup.backend_warnings_actual_length, backup.backend_errors_actual_length
        );
      }
      
      // Drop the current table and rename the original
      db.exec(`
        DROP TABLE backups;
        ALTER TABLE backups_original RENAME TO backups;
      `);
      
      // Recreate indexes
      db.exec(`
        CREATE INDEX IF NOT EXISTS idx_backups_machine_id ON backups(machine_id);
        CREATE INDEX IF NOT EXISTS idx_backups_date ON backups(date);
        CREATE INDEX IF NOT EXISTS idx_backups_begin_time ON backups(begin_time);
        CREATE INDEX IF NOT EXISTS idx_backups_end_time ON backups(end_time);
        CREATE INDEX IF NOT EXISTS idx_backups_backup_id ON backups(backup_id);
      `);
      
      // Drop configurations table
      db.exec(`DROP TABLE IF EXISTS configurations;`);
    }
  }
];

// Database migration functions
export class DatabaseMigrator {
  private db: Database.Database;
  
  constructor(db: Database.Database) {
    this.db = db;
    this.initializeVersionTable();
  }
  
  private initializeVersionTable(): void {
    // Create db_version table if it doesn't exist
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS db_version (
        version TEXT PRIMARY KEY,
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }
  
  getCurrentVersion(): string {
    try {
      const result = this.db.prepare(`
        SELECT version FROM db_version ORDER BY applied_at DESC LIMIT 1
      `).get() as { version: string } | undefined;
      
      return result?.version || '1.0';
    } catch (error) {
      console.warn('Error getting current database version:', error);
      return '1.0';
    }
  }
  
  private setVersion(version: string): void {
    this.db.prepare(`
      INSERT OR REPLACE INTO db_version (version) VALUES (?)
    `).run(version);
  }
  
  private needsMigration(currentVersion: string, targetVersion: string): boolean {
    // Simple version comparison (assumes semantic versioning)
    const [currentMajor, currentMinor] = currentVersion.split('.').map(Number);
    const [targetMajor, targetMinor] = targetVersion.split('.').map(Number);
    
    if (currentMajor < targetMajor) return true;
    if (currentMajor === targetMajor && currentMinor < targetMinor) return true;
    
    return false;
  }
  
  runMigrations(): void {
    const currentVersion = this.getCurrentVersion();
    // console.log(`Current database version: ${currentVersion}`);
    
    // Filter migrations that need to be applied
    const pendingMigrations = migrations.filter(migration => 
      this.needsMigration(currentVersion, migration.version)
    );
    
    if (pendingMigrations.length === 0) {
      // console.log('Database is up to date, no migrations needed');
      return;
    }
    
    console.log(`Found ${pendingMigrations.length} pending migrations`);
    
    // Run migrations in a transaction
    const transaction = this.db.transaction(() => {
      for (const migration of pendingMigrations) {
        console.log(`Applying migration ${migration.version}: ${migration.description}`);
        try {
          migration.up(this.db);
          this.setVersion(migration.version);
          console.log(`Migration ${migration.version} completed successfully`);
        } catch (error) {
          console.error(`Migration ${migration.version} failed:`, error);
          throw error;
        }
      }
    });
    
    try {
      transaction();
      console.log('All migrations completed successfully');
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  }
} 