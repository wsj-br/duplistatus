import Database from 'better-sqlite3';
import { extractAvailableBackups } from './utils';
import * as fs from 'fs';
import * as path from 'path';
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

// Import default configurations
import { 
  defaultCronConfig, 
  generateDefaultNtfyTopic,
  defaultNtfyConfig,
  defaultOverdueTolerance,
  defaultNotificationFrequencyConfig,
  defaultNotificationTemplates,
  defaultAuthConfig
} from './default-config';
import { previousTemplatesMessages } from './previous-defaults';

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
    
    console.error('[MigrationLock] Failed to acquire migration lock within timeout');
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

// Function to populate default configurations
function populateDefaultConfigurations(db: Database.Database) {
  try {
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
    
    // Set ntfy_config configuration
    db.prepare('INSERT OR REPLACE INTO configurations (key, value) VALUES (?, ?)').run(
      'ntfy_config', 
      JSON.stringify(ntfyConfig)
    );
    
    // Set notification_templates configuration
    db.prepare('INSERT OR REPLACE INTO configurations (key, value) VALUES (?, ?)').run(
      'notification_templates', 
      JSON.stringify(defaultNotificationTemplates)
    );
    
    // Set notification_frequency configuration
    db.prepare('INSERT OR REPLACE INTO configurations (key, value) VALUES (?, ?)').run(
      'notification_frequency', 
      defaultNotificationFrequencyConfig
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
    description: 'Rename machines table to servers, add server_url, and add sessions/CSRF tables for enhanced security',
    up: (db: Database.Database) => {
      console.log('Migration 3.0: Renaming machines to servers and adding security tables...');
      
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
        
        for (const [oldKey, settings] of Object.entries(oldBackupSettings)) {
          // Validate key format: should be "machine_name:backup_name"
          const keyParts = oldKey.split(':');
          if (keyParts.length !== 2) {
            continue;
          }
          
          const [machineName, backupName] = keyParts;
          
          // Validate that both parts are non-empty strings
          if (!machineName || !backupName || machineName.trim() === '' || backupName.trim() === '') {
            continue;
          }
          
          // Find server by name (now in servers table)
          const servers = db.prepare('SELECT id, name FROM servers WHERE name = ?').all(machineName) as Array<{ id: string; name: string }>;
          
          if (servers.length === 0 || servers.length > 1) {
            continue;
          }
          
          const server = servers[0];
          
          // Verify that backups exist for this server and backup name
          const backupExists = db.prepare('SELECT 1 FROM backups WHERE server_id = ? AND backup_name = ? LIMIT 1').get(server.id, backupName);
          
          if (!backupExists) {
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
        
        for (const [oldKey, notifications] of Object.entries(oldOverdueNotifications)) {
          // Validate key format: should be "machine_name:backup_name"
          const keyParts = oldKey.split(':');
          if (keyParts.length !== 2) {
            continue;
          }
          
          const [machineName, backupName] = keyParts;
          
          // Validate that both parts are non-empty strings
          if (!machineName || !backupName || machineName.trim() === '' || backupName.trim() === '') {
            continue;
          }
          
          // Find server by machine name (now in servers table)
          const servers = db.prepare('SELECT id, name FROM servers WHERE name = ?').all(machineName) as Array<{ id: string; name: string }>;
          
          if (servers.length === 0 || servers.length > 1) {
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
      
      // Step 12: Populate default configurations if they don't exist
      populateDefaultConfigurations(db);
      
      console.log('Migration 3.0 completed successfully');
    }
  },
  {
    version: '3.1',
    description: 'Add server_password column to servers table and remove sessions/CSRF tables - now using in-memory storage. Split notifications config into ntfy_config and notification_templates.',
    up: (db: Database.Database) => {
      console.log('Migration 3.1: Adding server_password column and removing security tables...');
      
      // Function to check if a specific template message matches any previous default template
      const isOldDefaultMessage = (message: string | undefined, previousMessages: string[]): boolean => {
        if (!message) return false;
        return previousMessages.includes(message);
      };

      // Function to get all previous messages for a specific template type
      const getPreviousMessages = (templateType: 'success' | 'warning' | 'overdueBackup'): string[] => {
        const messages: string[] = [];
        for (const previousTemplate of previousTemplatesMessages) {
          if (templateType === 'success' && previousTemplate.sucess) {
            messages.push(previousTemplate.sucess);
          } else if (templateType === 'warning' && previousTemplate.warning) {
            messages.push(previousTemplate.warning);
          } else if (templateType === 'overdueBackup' && previousTemplate.overdueBackup) {
            messages.push(previousTemplate.overdueBackup);
          }
        }
        return messages;
      };
      
      try {
        // Step 1: Add server_password column to servers table (this is the critical part)
        const serversTableInfo = db.prepare("PRAGMA table_info(servers)").all() as Array<{name: string, type: string}>;
        const serverColumnNames = serversTableInfo.map(col => col.name);
        
        if (!serverColumnNames.includes('server_password')) {
          console.log('Adding server_password column to servers table...');
          db.exec(`ALTER TABLE servers ADD COLUMN server_password TEXT DEFAULT '';`);
        } else {
          console.log('server_password column already exists in servers table');
        }
        
        // Step 2: Migrate old notifications key into new keys if present
        try {
          const row = db.prepare('SELECT value FROM configurations WHERE key = ?').get('notifications') as { value: string } | undefined;
          if (row && row.value) {
            try {
              const legacy = JSON.parse(row.value);
              const ntfy = legacy?.ntfy;
              const templates = legacy?.templates;
              if (ntfy) {
                db.prepare('INSERT OR REPLACE INTO configurations (key, value) VALUES (?, ?)')
                  .run('ntfy_config', JSON.stringify(ntfy));
              } else {
                const topic = generateDefaultNtfyTopic();
                db.prepare('INSERT OR REPLACE INTO configurations (key, value) VALUES (?, ?)')
                  .run('ntfy_config', JSON.stringify({ ...defaultNtfyConfig, topic }));
              }
              if (templates) {
                // Check if notification templates are any old default templates using previous-defaults.ts. If so, use the new default templates.
                const updatedTemplates = { ...templates };

                // Check and replace success template if it matches old defaults
                if (templates.success && isOldDefaultMessage(templates.success.message, getPreviousMessages('success'))) {
                  console.log('Migration 3.1: Detected old success template, replacing with new default');
                  updatedTemplates.success = defaultNotificationTemplates.success;
                }

                // Check and replace warning template if it matches old defaults
                if (templates.warning && isOldDefaultMessage(templates.warning.message, getPreviousMessages('warning'))) {
                  console.log('Migration 3.1: Detected old warning template, replacing with new default');
                  updatedTemplates.warning = defaultNotificationTemplates.warning;
                }

                // Check and replace overdueBackup template if it matches old defaults
                if (templates.overdueBackup && isOldDefaultMessage(templates.overdueBackup.message, getPreviousMessages('overdueBackup'))) {
                  console.log('Migration 3.1: Detected old overdueBackup template, replacing with new default');
                  updatedTemplates.overdueBackup = defaultNotificationTemplates.overdueBackup;
                }

                db.prepare('INSERT OR REPLACE INTO configurations (key, value) VALUES (?, ?)')
                  .run('notification_templates', JSON.stringify(updatedTemplates));
              }
              // Remove legacy key
              db.prepare('DELETE FROM configurations WHERE key = ?').run('notifications');
            } catch (e) {
              console.warn('Migration 3.1: Failed to parse legacy notifications config, writing defaults. Error:', e instanceof Error ? e.message : String(e));
              const topic = generateDefaultNtfyTopic();
              db.prepare('INSERT OR REPLACE INTO configurations (key, value) VALUES (?, ?)')
                .run('ntfy_config', JSON.stringify({ ...defaultNtfyConfig, topic }));
              db.prepare('INSERT OR REPLACE INTO configurations (key, value) VALUES (?, ?)')
                .run('notification_templates', JSON.stringify(defaultNotificationTemplates));
              db.prepare('DELETE FROM configurations WHERE key = ?').run('notifications');
            }
          }
        } catch (e) {
          console.warn('Migration 3.1: Error migrating notifications config:', e instanceof Error ? e.message : String(e));
        }
        
        // Step 3: Populate default configurations if they don't exist
        populateDefaultConfigurations(db);
        
        console.log('Migration 3.1 completed successfully');
      } catch (error) {
        // If the column already exists or any other error, log and continue
        const errorMsg = error instanceof Error ? error.message : String(error);
        if (errorMsg.includes('duplicate column') || errorMsg.includes('already exists')) {
          console.log('Migration 3.1: server_password column already exists, skipping');
        } else {
          console.error('Migration 3.1 error:', errorMsg);
          throw error;
        }
      }
    }
  },
  {
    version: '4.0',
    description: 'Add user access control system with users, database-backed sessions, and audit logging',
    up: (db: Database.Database) => {
      const timestamp = () => new Date().toLocaleString(undefined, { hour12: false, timeZoneName: 'short' }).replace(',', '');
      const logMigration = (level: 'log' | 'warn', message: string) => {
        const formatted = `[Migration 4.0] ${timestamp()}: ${message}`;
        if (level === 'warn') {
          console.warn(formatted);
        } else {
          console.log(formatted);
        }
      };

      logMigration('log', 'Adding user access control system...');
      
      // Step 1: Check if users table already exists (migration already completed)
      const usersTableExists = db.prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='users'"
      ).get();
      
      if (usersTableExists) {
        throw new Error('MIGRATION_ALREADY_COMPLETED');
      }
      
      // Step 2: Create users table (use IF NOT EXISTS for safety during concurrent builds)
      db.exec(`
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
      `);
      
      // Step 3: Create indexes for users table (use IF NOT EXISTS for safety)
      db.exec(`
        CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
        CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login_at);
      `);
      
      // Step 4: Create sessions table (database-backed, replaces in-memory)
      // Note: user_id is nullable to support unauthenticated sessions (before login)
      db.exec(`
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
      `);
      
      // Step 5: Create indexes for sessions table (use IF NOT EXISTS for safety)
      db.exec(`
        CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
        CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
        CREATE INDEX IF NOT EXISTS idx_sessions_last_accessed ON sessions(last_accessed);
      `);
      
      // Step 6: Create audit_log table (use IF NOT EXISTS for safety)
      db.exec(`
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
      `);
      
      // Step 7: Create indexes for audit_log table (use IF NOT EXISTS for safety)
      db.exec(`
        CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_log(timestamp);
        CREATE INDEX IF NOT EXISTS idx_audit_user_id ON audit_log(user_id);
        CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_log(action);
        CREATE INDEX IF NOT EXISTS idx_audit_category ON audit_log(category);
        CREATE INDEX IF NOT EXISTS idx_audit_status ON audit_log(status);
      `);
      
      // Step 8: Seed default admin user (only if it doesn't exist)
      // IMPORTANT: Admin user MUST be created during migration to version 4.0 because
      // user authentication was introduced in this version. Without an admin user,
      // users would be locked out of their data after migration.
      // The default password is temporary and MUST be changed on first login.
      // Check if admin user already exists to handle concurrent builds
      const existingAdmin = db.prepare('SELECT id FROM users WHERE username = ?').get('admin') as { id: string } | undefined;
      let adminUserCreated = false;
      
      // Check if database has existing data (servers or backups) to determine if this is a migration
      let hasExistingData = false;
      try {
        const backupCount = db.prepare('SELECT COUNT(*) as count FROM backups').get() as { count: number } | undefined;
        const serverCount = db.prepare('SELECT COUNT(*) as count FROM servers').get() as { count: number } | undefined;
        hasExistingData = (backupCount?.count ?? 0) > 0 || (serverCount?.count ?? 0) > 0;
      } catch (error) {
        // If tables don't exist yet, assume it's a new database
        hasExistingData = false;
      }
      
      if (!existingAdmin) {
        // Create admin user with default password (required for both new and migrating databases)
        // SECURITY NOTE: The default password is publicly known and MUST be changed immediately
        // after first login. The must_change_password flag enforces this requirement.
        // Generate admin user ID
        const adminId = 'admin-' + randomBytes(16).toString('hex');
        
        // Hash default password
        // Using bcrypt.hashSync for synchronous execution within migration
        const adminPasswordHash = bcrypt.hashSync(defaultAuthConfig.defaultPassword, 12);
        
        // Insert admin user
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
          1,  // is_admin = true
          1   // must_change_password = true (enforces password change on first login)
        );
        adminUserCreated = true;
      }
      
      // Step 9: Set default audit retention configuration (90 days)
      db.prepare(
        'INSERT OR REPLACE INTO configurations (key, value) VALUES (?, ?)'
      ).run(
        'audit_retention_days',
        '90'
      );
      
      // Step 10: Log the migration in audit log
      let adminUserMessage: string;
      if (adminUserCreated) {
        if (hasExistingData) {
          adminUserMessage = `${defaultAuthConfig.defaultPassword} (TEMPORARY - MUST CHANGE IMMEDIATELY - database migrated from previous version)`;
        } else {
          adminUserMessage = `${defaultAuthConfig.defaultPassword} (must change on first login)`;
        }
      } else {
        adminUserMessage = 'N/A (admin user already exists)';
      }
      
      db.prepare(`
        INSERT INTO audit_log (
          action, 
          category, 
          status, 
          username,
          details
        ) VALUES (?, ?, ?, ?, ?)
      `).run(
        'database_migration',
        'system',
        'success',
        'system',
        JSON.stringify({ 
          migration: '4.0', 
          description: 'User Access Control System',
          tables_created: ['users', 'sessions', 'audit_log'],
          admin_user_created: adminUserCreated,
          default_password: adminUserMessage,
          has_existing_data: hasExistingData,
          security_note: adminUserCreated && hasExistingData 
            ? '⚠️ Admin user created with default password during migration - password MUST be changed immediately'
            : adminUserCreated 
              ? '⚠️ Admin user created with default password - password must be changed on first login'
              : 'N/A'
        })
      );
      
      logMigration('log', 'User access control system created successfully');
      if (adminUserCreated) {
        const adminPasswordSummary =
          `⚠️ Admin user created (username "admin") with temporary password "${defaultAuthConfig.defaultPassword}". ` +
          'Password change is enforced on first login.';
        if (hasExistingData) {
          logMigration('warn', `${adminPasswordSummary} Existing data detected; change the password immediately after login.`);
        } else {
          logMigration('log', adminPasswordSummary);
        }
      }
      logMigration('log', 'Sessions table created with nullable user_id to support unauthenticated sessions');
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
    
    // Insert the new version (use INSERT OR REPLACE as a safety measure)
    this.db.prepare(`
      INSERT OR REPLACE INTO db_version (version, applied_at) VALUES (?, CURRENT_TIMESTAMP)
    `).run(version);
    
    // Use passive checkpoint to avoid I/O errors (doesn't block or truncate)
    try {
      this.db.pragma('wal_checkpoint(PASSIVE)');
    } catch (error) {
      console.warn('[Migration] Could not checkpoint WAL:', error);
      // Continue anyway, checkpoint is not critical
    }
    
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
      
      // If database is already at the latest version (4.0), skip all migrations
      // This handles the case where a fresh database was created with version 4.0
      if (currentVersion === '4.0') {
        // Silent - no migrations needed
        return;
      }
      
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
        const errorMessage = error instanceof Error ? error.message : String(error);
        // Don't log ENOENT errors for lock files - they're expected in concurrent scenarios
        if (!errorMessage.includes('ENOENT') || !errorMessage.includes('lock')) {
          console.error('[Migration] Migration failed:', error);
        }
        // Only throw if it's not a lock file ENOENT error
        if (!errorMessage.includes('ENOENT') || !errorMessage.includes('lock')) {
          throw error;
        }
        // For lock file ENOENT errors, just return silently (another process handled it)
      } finally {
        // Always release the migration lock and reset running flag
        this.migrationLock.releaseLock();
        DatabaseMigrator.isRunning = false;
        
        // Small delay to ensure all database operations are committed
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      // Don't log ENOENT errors for lock files - they're expected in concurrent scenarios
      if (!errorMessage.includes('ENOENT') || !errorMessage.includes('lock')) {
        console.error('[Migration] Outer migration failed:', error);
      }
      DatabaseMigrator.isRunning = false;
      // Only throw if it's not a lock file ENOENT error
      if (!errorMessage.includes('ENOENT') || !errorMessage.includes('lock')) {
        throw error;
      }
      // For lock file ENOENT errors, just return silently (another process handled it)
    }
  }
  
  runMigrationsSync(): void {
    // Prevent multiple concurrent migration runs
    if (DatabaseMigrator.isRunning) {
      return;
    }
    
    DatabaseMigrator.isRunning = true;
    
    try {
      const currentVersion = this.getCurrentVersion();
      
      // If database is already at the latest version (4.0), skip all migrations
      // This handles the case where a fresh database was created with version 4.0
      if (currentVersion === '4.0') {
        // Silent - no migrations needed
        return;
      }
      
      // Filter migrations that need to be applied
      const pendingMigrations = migrations.filter(migration => 
        this.needsMigration(currentVersion, migration.version)
      );
      
      if (pendingMigrations.length === 0) {
        return;
      }
      
      console.log(`[Migration] Running ${pendingMigrations.length} migrations synchronously: ${pendingMigrations.map(m => m.version).join(', ')}`);
      
      // Run migrations synchronously without locking (since we're in single process)
      for (const migration of pendingMigrations) {
        try {
          // Check if migration actually needs to run by checking current state
          const currentVersion = this.getCurrentVersion();
          const needsThisMigration = this.needsMigration(currentVersion, migration.version);
          
          if (!needsThisMigration) {
            continue;
          }
          
          // Run migration in a transaction
          const transaction = this.db.transaction(() => {
            migration.up(this.db);
          });
          
          transaction();
          
          // Update version outside transaction to ensure it's committed
          this.setVersion(migration.version);
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          
          // Handle specific migration errors
          if (errorMessage === 'MIGRATION_ALREADY_COMPLETED' || errorMessage === 'MIGRATION_NOT_NEEDED') {
            // Migration was already done or not needed, update version anyway to prevent re-running
            this.setVersion(migration.version);
            continue;
          }
          
          console.error(`Migration ${migration.version} failed:`, errorMessage);
          throw error;
        }
      }
      
    } catch (error) {
      console.error('[Migration] Synchronous migration failed:', error);
      throw error;
    } finally {
      DatabaseMigrator.isRunning = false;
    }
  }
} 