import { db } from '../src/lib/db';
import path from 'path';
import fs from 'fs';

async function clearDatabase() {
  try {
    console.log('Starting database cleanup...');

    // Begin a transaction
    const transaction = db.transaction(() => {
      // Drop all tables
      db.exec(`
        DROP TABLE IF EXISTS backups;
        DROP TABLE IF EXISTS machines;
      `);

      // Recreate the tables with the original schema
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
    });

    // Execute the transaction
    transaction();

    console.log('Database cleared and schema recreated successfully!');
  } catch (error) {
    console.error('Error clearing database:', error);
    process.exit(1);
  }
}

// Run the script
clearDatabase().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('Error:', error);
  process.exit(1);
}); 