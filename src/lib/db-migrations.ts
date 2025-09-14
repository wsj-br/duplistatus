import Database from 'better-sqlite3';
import { extractAvailableBackups } from './utils';
import * as fs from 'fs';
import * as path from 'path';

// Import default configurations
import { 
  defaultCronConfig, 
  generateDefaultNtfyTopic,
  createDefaultNotificationConfig,
  defaultNtfyConfig,
  defaultOverdueTolerance
} from './default-config';

// Migration locking mechanism
class MigrationLock {
  private lockFilePath: string;
  private lockFileHandle: number | null = null;
  private readonly LOCK_TIMEOUT = 30000; // 30 seconds
  private readonly RETRY_INTERVAL = 1000; // 1 second

  constructor(dbPath: string) {
    const dbDir = path.dirname(dbPath);
    this.lockFilePath = path.join(dbDir, '.migration.lock');
  }

  async acquireLock(): Promise<boolean> {
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
              await new Promise(resolve => setTimeout(resolve, this.RETRY_INTERVAL));
              continue;
            } catch {
              // Process doesn't exist, remove stale lock
              fs.unlinkSync(this.lockFilePath);
              continue;
            }
          } catch {
            // Lock file is corrupted, remove it
            fs.unlinkSync(this.lockFilePath);
            continue;
          }
        } else {
          throw error;
        }
      }
    }
    
    console.error('[MigrationLock] Failed to acquire migration lock within timeout');
    return false;
  }

  releaseLock(): void {
    if (this.lockFileHandle !== null) {
      try {
        fs.closeSync(this.lockFileHandle);
        fs.unlinkSync(this.lockFilePath);
      } catch (error) {
        console.warn('[MigrationLock] Error releasing migration lock:', error);
      } finally {
        this.lockFileHandle = null;
      }
    }
  }
}

// Function to populate default configurations
function populateDefaultConfigurations(db: Database.Database) {
  try {
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
  } catch (error) {
    console.error('Failed to populate default configurations:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}

// Function to create a backup of the database file
function createDatabaseBackup(dbPath: string): string {
  try {
    const dbDir = path.dirname(dbPath);
    const dbName = path.basename(dbPath, path.extname(dbPath));
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(dbDir, `${dbName}-copy-${timestamp}.db`);
    
    // Copy the database file
    fs.copyFileSync(dbPath, backupPath);
    
    return backupPath;
  } catch (error) {
    console.error('Failed to create database backup:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}

// Database migration interface
interface Migration {
  version: string;
  description: string;
  up: (db: Database.Database) => void;
}



// Migration definitions
const migrations: Migration[] = [
  {
    version: '2.0',
    description: 'Add missing columns and create configurations table for existing databases',
    up: (db: Database.Database) => {
      console.log('Migration 2.0: Adding missing columns and configurations...');
      
      // Check if we need to add missing columns instead of recreating the entire table
      const tableInfo = db.prepare("PRAGMA table_info(backups)").all() as Array<{name: string, type: string}>;
      const columnNames = tableInfo.map(col => col.name);
      
      // Check if we need to add missing columns
      const missingColumns = [];
      if (!columnNames.includes('available_backups')) missingColumns.push('available_backups TEXT DEFAULT "[]"');
      if (!columnNames.includes('last_backup_date')) missingColumns.push('last_backup_date DATETIME');
      if (!columnNames.includes('backup_list_count')) missingColumns.push('backup_list_count INTEGER NOT NULL DEFAULT 0');
      if (!columnNames.includes('reported_quota_error')) missingColumns.push('reported_quota_error BOOLEAN NOT NULL DEFAULT 0');
      if (!columnNames.includes('reported_quota_warning')) missingColumns.push('reported_quota_warning BOOLEAN NOT NULL DEFAULT 0');
      if (!columnNames.includes('backend_main_operation')) missingColumns.push('backend_main_operation TEXT');
      if (!columnNames.includes('backend_parsed_result')) missingColumns.push('backend_parsed_result TEXT');
      if (!columnNames.includes('backend_interrupted')) missingColumns.push('backend_interrupted BOOLEAN NOT NULL DEFAULT 0');
      if (!columnNames.includes('backend_version')) missingColumns.push('backend_version TEXT');
      if (!columnNames.includes('backend_begin_time')) missingColumns.push('backend_begin_time DATETIME');
      if (!columnNames.includes('backend_duration')) missingColumns.push('backend_duration TEXT');
      if (!columnNames.includes('backend_warnings_actual_length')) missingColumns.push('backend_warnings_actual_length INTEGER NOT NULL DEFAULT 0');
      if (!columnNames.includes('backend_errors_actual_length')) missingColumns.push('backend_errors_actual_length INTEGER NOT NULL DEFAULT 0');
      
      // Check if configurations table exists
      const configTableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='configurations'").get();
      
      // Add missing columns if any
      if (missingColumns.length > 0) {
        for (const columnDef of missingColumns) {
          const [columnName] = columnDef.split(' ');
          try {
            db.exec(`ALTER TABLE backups ADD COLUMN ${columnDef}`);
          } catch (error) {
            console.warn(`Column ${columnName} might already exist:`, error instanceof Error ? error.message : String(error));
          }
        }
      }
      
      // Create configurations table if it doesn't exist
      if (!configTableExists) {
        db.exec(`
          CREATE TABLE configurations (
            key TEXT PRIMARY KEY NOT NULL,
            value TEXT
          );
        `);
      }
      
      // Update DEFAULT values for message arrays if they are NULL
      const updateMessagesArray = db.prepare(`
        UPDATE backups 
        SET messages_array = '[]'
        WHERE messages_array IS NULL
      `);
      updateMessagesArray.run();
      
      // Update warnings_array if NULL
      const updateWarningsArray = db.prepare(`
        UPDATE backups 
        SET warnings_array = '[]'
        WHERE warnings_array IS NULL
      `);
      updateWarningsArray.run();
      
      // Update errors_array if NULL
      const updateErrorsArray = db.prepare(`
        UPDATE backups 
        SET errors_array = '[]'
        WHERE errors_array IS NULL
      `);
      updateErrorsArray.run();
      
      // Extract available backups from messages_array for existing records
      const existingBackups = db.prepare(`SELECT id, messages_array FROM backups WHERE available_backups IS NULL OR available_backups = '[]'`).all() as Array<{id: string, messages_array: string | null}>;
      
      for (const backup of existingBackups) {
        if (backup.messages_array) {
          const availableBackups = extractAvailableBackups(backup.messages_array);
          if (availableBackups.length > 0) {
            db.prepare(`UPDATE backups SET available_backups = ? WHERE id = ?`).run(JSON.stringify(availableBackups), backup.id);
          }
        }
      }
      
      // Populate default configurations if they don't exist
      populateDefaultConfigurations(db);
    }
  },
  {
    version: '3.0',
    description: 'Rename machines table to servers, add server_url, and update all references',
    up: (db: Database.Database) => {
      console.log('Migration 3.0: Renaming machines to servers...');
      
      // Check if the servers table already exists (migration already completed)
      const serversTableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='servers'").get();
      if (serversTableExists) {
        // Throw a specific error to indicate the migration was already done
        throw new Error('MIGRATION_ALREADY_COMPLETED');
      }
      
      // Check if the machines table exists (required for migration)
      const machinesTableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='machines'").get();
      if (!machinesTableExists) {
        // Throw a specific error to indicate the migration is not needed
        throw new Error('MIGRATION_NOT_NEEDED');
      }
      
      // Step 1: Create new servers table with same structure as machines
      db.exec(`
          CREATE TABLE servers (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            server_url TEXT DEFAULT '',
            alias TEXT DEFAULT '',
            note TEXT DEFAULT '',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          );
        `);
      
      // Step 2: Copy data from machines to servers
      db.exec(`INSERT INTO servers (id, name, created_at) SELECT id, name, created_at FROM machines;`);
      
      // Step 3: Add server_id column to backups table
      db.exec(`ALTER TABLE backups ADD COLUMN server_id TEXT;`);
      
      // Step 4: Update server_id in backups table
      db.exec(`UPDATE backups SET server_id = machine_id;`);
      
      // Step 5: Drop foreign key constraint and recreate with server_id
      db.exec(`PRAGMA foreign_keys=OFF;`);
      
      // Step 6: Create new backups table with server_id
      db.exec(`
        CREATE TABLE backups_new (
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
      `);
      
      // Step 7: Copy data from old backups table to new one
      db.exec(`
        INSERT INTO backups_new 
        SELECT id, server_id, backup_name, backup_id, date, status, duration_seconds,
               size, uploaded_size, examined_files, warnings, errors, created_at,
               messages_array, warnings_array, errors_array, available_backups,
               deleted_files, deleted_folders, modified_files, opened_files, added_files,
               size_of_modified_files, size_of_added_files, size_of_examined_files,
               size_of_opened_files, not_processed_files, added_folders, too_large_files,
               files_with_error, modified_folders, modified_symlinks, added_symlinks,
               deleted_symlinks, partial_backup, dryrun, main_operation, parsed_result,
               interrupted, version, begin_time, end_time, warnings_actual_length,
               errors_actual_length, messages_actual_length, bytes_downloaded,
               known_file_size, last_backup_date, backup_list_count, reported_quota_error,
               reported_quota_warning, backend_main_operation, backend_parsed_result,
               backend_interrupted, backend_version, backend_begin_time, backend_duration,
               backend_warnings_actual_length, backend_errors_actual_length
        FROM backups;
      `);
      
      // Step 8: Drop old tables and rename new ones
      db.exec(`DROP TABLE backups;`);
      db.exec(`ALTER TABLE backups_new RENAME TO backups;`);
      db.exec(`DROP TABLE machines;`);
      
      // Step 9: Recreate indexes
      db.exec(`
        CREATE INDEX IF NOT EXISTS idx_backups_server_id ON backups(server_id);
        CREATE INDEX IF NOT EXISTS idx_backups_date ON backups(date);
        CREATE INDEX IF NOT EXISTS idx_backups_begin_time ON backups(begin_time);
        CREATE INDEX IF NOT EXISTS idx_backups_end_time ON backups(end_time);
        CREATE INDEX IF NOT EXISTS idx_backups_backup_id ON backups(backup_id);
      `);
      
      // Step 10: Re-enable foreign keys
      db.exec(`PRAGMA foreign_keys=ON;`);
      
      // Step 11: Migrate configuration data
      // Migrate backup_settings from machine_name:backup_name to server_id:backup_name
      const backupSettingsRow = db.prepare('SELECT value FROM configurations WHERE key = ?').get('backup_settings') as { value: string } | undefined;
      
      if (backupSettingsRow && backupSettingsRow.value) {
        const oldBackupSettings = JSON.parse(backupSettingsRow.value) as Record<string, unknown>;
        const newBackupSettings: Record<string, unknown> = {};
        let migratedCount = 0;
        let skippedCount = 0;
        
        for (const [oldKey, settings] of Object.entries(oldBackupSettings)) {
          // Validate key format: should be "machine_name:backup_name"
          const keyParts = oldKey.split(':');
          if (keyParts.length !== 2) {
            skippedCount++;
            continue;
          }
          
          const [machineName, backupName] = keyParts;
          
          // Validate that both parts are non-empty strings
          if (!machineName || !backupName || machineName.trim() === '' || backupName.trim() === '') {
            skippedCount++;
            continue;
          }
          
          // Find server by name (now in servers table)
          const servers = db.prepare('SELECT id, name FROM servers WHERE name = ?').all(machineName) as Array<{ id: string; name: string }>;
          
          if (servers.length === 0 || servers.length > 1) {
            skippedCount++;
            continue;
          }
          
          const server = servers[0];
          
          // Verify that backups exist for this server and backup name
          const backupExists = db.prepare('SELECT 1 FROM backups WHERE server_id = ? AND backup_name = ? LIMIT 1').get(server.id, backupName);
          
          if (!backupExists) {
            skippedCount++;
            continue;
          }
          
          // Create new key with server_id:backup_name
          const newKey = `${server.id}:${backupName}`;
          
          // Add debug field to settings
          const newSettings = {
            ...(settings as Record<string, unknown>),
            machineName: machineName
          };
          
          newBackupSettings[newKey] = newSettings;
          migratedCount++;
        }
        
        // Update the configuration with migrated settings
        if (Object.keys(newBackupSettings).length > 0) {
          db.prepare('INSERT OR REPLACE INTO configurations (key, value) VALUES (?, ?)').run(
            'backup_settings',
            JSON.stringify(newBackupSettings)
          );
        }
      }
      
      // Migrate overdue_backup_notifications to overdue_notifications
      const overdueNotificationsRow = db.prepare('SELECT value FROM configurations WHERE key = ?').get('overdue_backup_notifications') as { value: string } | undefined;
      
      if (overdueNotificationsRow && overdueNotificationsRow.value) {
        const oldOverdueNotifications = JSON.parse(overdueNotificationsRow.value) as Record<string, unknown>;
        const newOverdueNotifications: Record<string, unknown> = {};
        let migratedCount = 0;
        let skippedCount = 0;
        
        for (const [oldKey, notifications] of Object.entries(oldOverdueNotifications)) {
          // Validate key format: should be "machine_name:backup_name"
          const keyParts = oldKey.split(':');
          if (keyParts.length !== 2) {
            skippedCount++;
            continue;
          }
          
          const [machineName, backupName] = keyParts;
          
          // Validate that both parts are non-empty strings
          if (!machineName || !backupName || machineName.trim() === '' || backupName.trim() === '') {
            skippedCount++;
            continue;
          }
          
          // Find server by machine name (now in servers table)
          const servers = db.prepare('SELECT id, name FROM servers WHERE name = ?').all(machineName) as Array<{ id: string; name: string }>;
          
          if (servers.length === 0 || servers.length > 1) {
            skippedCount++;
            continue;
          }
          
          const server = servers[0];
          
          // Filter out lastBackupDate key as it's no longer used
          const filteredNotifications = { ...(notifications as Record<string, unknown>) };
          if ('lastBackupDate' in filteredNotifications) {
            delete filteredNotifications.lastBackupDate;
          }
          
          // Create new key with server_id:backup_name format
          const newKey = `${server.id}:${backupName}`;
          
          // Add debug field to track original server name
          const newNotificationData = {
            ...filteredNotifications,
            serverName: machineName
          };
          
          newOverdueNotifications[newKey] = newNotificationData;
          migratedCount++;
        }
        
        // Update overdue_notifications configuration
        if (Object.keys(newOverdueNotifications).length > 0) {
          db.prepare('INSERT OR REPLACE INTO configurations (key, value) VALUES (?, ?)').run(
            'overdue_notifications',
            JSON.stringify(newOverdueNotifications)
          );
        }
        
        // Delete the old overdue_backup_notifications configuration
        db.prepare('DELETE FROM configurations WHERE key = ?').run('overdue_backup_notifications');
      }
    }
  }
];

// Database migration functions
export class DatabaseMigrator {
  private db: Database.Database;
  private dbPath: string;
  private migrationLock: MigrationLock;
  private static isRunning: boolean = false;
  
  constructor(db: Database.Database, dbPath: string) {
    this.db = db;
    this.dbPath = dbPath;
    this.migrationLock = new MigrationLock(dbPath);
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
  
  isNewDatabase(): boolean {
    try {
      const backupCount = this.db.prepare('SELECT COUNT(*) as count FROM backups').get() as { count: number };
      const serverCount = this.db.prepare('SELECT COUNT(*) as count FROM servers').get() as { count: number };
      return backupCount.count === 0 && serverCount.count === 0;
    } catch (error) {
      console.warn('Error checking if database is new:', error);
      return false;
    }
  }
  
  setVersion(version: string): void {
    // First, clear any existing versions to ensure we only have one
    this.db.prepare('DELETE FROM db_version').run();
    
    // Insert the new version
    this.db.prepare(`
      INSERT INTO db_version (version, applied_at) VALUES (?, CURRENT_TIMESTAMP)
    `).run(version);
    
    // Force a checkpoint to ensure WAL changes are written
    this.db.pragma('wal_checkpoint(TRUNCATE)');
    
    // Verify the version was set correctly
    const currentVersion = this.getCurrentVersion();
    if (currentVersion !== version) {
      console.error(`[Migration] Version mismatch! Expected ${version}, got ${currentVersion}`);
    }
  }
  
  private needsMigration(currentVersion: string, targetVersion: string): boolean {
    // Simple version comparison (assumes semantic versioning)
    const [currentMajor, currentMinor] = currentVersion.split('.').map(Number);
    const [targetMajor, targetMinor] = targetVersion.split('.').map(Number);
    
    if (currentMajor < targetMajor) return true;
    if (currentMajor === targetMajor && currentMinor < targetMinor) return true;
    
    return false;
  }
  
  async runMigrations(): Promise<void> {
    // Prevent multiple concurrent migration runs
    if (DatabaseMigrator.isRunning) {
      return;
    }
    
    DatabaseMigrator.isRunning = true;
    
    try {
      const currentVersion = this.getCurrentVersion();
      
      // Filter migrations that need to be applied
      const pendingMigrations = migrations.filter(migration => 
        this.needsMigration(currentVersion, migration.version)
      );
      
      if (pendingMigrations.length === 0) {
        return;
      }
      
      console.log(`[Migration] Running ${pendingMigrations.length} migrations: ${pendingMigrations.map(m => m.version).join(', ')}`);
      
      // Acquire migration lock to prevent concurrent migrations
      const lockAcquired = await this.migrationLock.acquireLock();
      if (!lockAcquired) {
        return;
      }
      
      try {
        // Create backup before running migrations
        let backupPath: string | undefined;
        try {
          backupPath = createDatabaseBackup(this.dbPath);
        } catch (error) {
          console.error('Failed to create database backup. Aborting migrations for safety.');
          throw error;
        }
      
        // Run migrations with retry logic for database locking issues
        for (const migration of pendingMigrations) {
          let retryCount = 0;
          const maxRetries = 3;
          
          while (retryCount < maxRetries) {
            try {
              // Check if migration actually needs to run by checking current state
              const currentVersion = this.getCurrentVersion();
              const needsThisMigration = this.needsMigration(currentVersion, migration.version);
              
              if (!needsThisMigration) {
                break;
              }
              
              // Run migration in a transaction
              const transaction = this.db.transaction(() => {
                migration.up(this.db);
              });
              
              transaction();
              
              // Update version outside transaction to ensure it's committed
              this.setVersion(migration.version);
              break; // Success, exit retry loop
              
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : String(error);
              
              // Handle specific migration errors
              if (errorMessage === 'MIGRATION_ALREADY_COMPLETED' || errorMessage === 'MIGRATION_NOT_NEEDED') {
                // Migration was already done or not needed, update version anyway to prevent re-running
                this.setVersion(migration.version);
                break; // Success, exit retry loop
              }
              
              retryCount++;
              
              if (errorMessage.includes('database is locked') || errorMessage.includes('SQLITE_BUSY')) {
                if (retryCount < maxRetries) {
                  // Wait a bit before retrying
                  const waitTime = retryCount * 1000; // 1s, 2s, 3s
                  await new Promise(resolve => setTimeout(resolve, waitTime));
                } else {
                  console.error(`Migration ${migration.version} failed after ${maxRetries} attempts due to database lock:`, errorMessage);
                  console.log(`Database backup is available at: ${backupPath}`);
                  throw error;
                }
              } else {
                console.error(`Migration ${migration.version} failed:`, errorMessage);
                console.log(`Database backup is available at: ${backupPath}`);
                throw error;
              }
            }
          }
        }
      } catch (error) {
        console.error('[Migration] Migration failed:', error);
        throw error;
      } finally {
        // Always release the migration lock and reset running flag
        this.migrationLock.releaseLock();
        DatabaseMigrator.isRunning = false;
        
        // Small delay to ensure all database operations are committed
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error('[Migration] Outer migration failed:', error);
      DatabaseMigrator.isRunning = false;
      throw error;
    }
  }
} 