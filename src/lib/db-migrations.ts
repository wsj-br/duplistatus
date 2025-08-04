import Database from 'better-sqlite3';
import { extractAvailableBackups } from './utils';

// Import default configurations
import { 
  defaultCronConfig, 
  defaultBackupNotificationConfig, 
  generateDefaultNtfyTopic,
  createDefaultNotificationConfig,
  defaultNtfyConfig
} from './default-config';

// Function to populate default configurations
function populateDefaultConfigurations(db: Database.Database) {
  try {
    console.log('Populating default configurations...');
    
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
      defaultBackupNotificationConfig.overdueTolerance
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
      console.log('Running consolidated migration 2.0...');
      
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
        console.log(`Adding ${missingColumns.length} missing columns to backups table...`);
        for (const columnDef of missingColumns) {
          const [columnName] = columnDef.split(' ');
          try {
            db.exec(`ALTER TABLE backups ADD COLUMN ${columnDef}`);
            console.log(`Added column: ${columnName}`);
          } catch (error) {
            console.warn(`Column ${columnName} might already exist:`, error instanceof Error ? error.message : String(error));
          }
        }
      }
      
      // Create configurations table if it doesn't exist
      if (!configTableExists) {
        console.log('Creating configurations table...');
        db.exec(`
          CREATE TABLE configurations (
            key TEXT PRIMARY KEY NOT NULL,
            value TEXT
          );
        `);
      }
      
      // Update DEFAULT values for message arrays if they are NULL
      console.log('Updating NULL message arrays to empty arrays...');
      
      // Update messages_array if NULL
      const updateMessagesArray = db.prepare(`
        UPDATE backups 
        SET messages_array = '[]'
        WHERE messages_array IS NULL
      `);
      const updatedMessages = updateMessagesArray.run();
      console.log(`Updated ${updatedMessages.changes} rows with NULL messages_array`);
      
      // Update warnings_array if NULL
      const updateWarningsArray = db.prepare(`
        UPDATE backups 
        SET warnings_array = '[]'
        WHERE warnings_array IS NULL
      `);
      const updatedWarnings = updateWarningsArray.run();
      console.log(`Updated ${updatedWarnings.changes} rows with NULL warnings_array`);
      
      // Update errors_array if NULL
      const updateErrorsArray = db.prepare(`
        UPDATE backups 
        SET errors_array = '[]'
        WHERE errors_array IS NULL
      `);
      const updatedErrors = updateErrorsArray.run();
      console.log(`Updated ${updatedErrors.changes} rows with NULL errors_array`);
      
      // Extract available backups from messages_array for existing records
      console.log('Extracting available backups from existing records...');
      const existingBackups = db.prepare(`SELECT id, messages_array FROM backups WHERE available_backups IS NULL OR available_backups = '[]'`).all() as Array<{id: string, messages_array: string | null}>;
      
      let extractedCount = 0;
      for (const backup of existingBackups) {
        if (backup.messages_array) {
          const availableBackups = extractAvailableBackups(backup.messages_array);
          if (availableBackups.length > 0) {
            db.prepare(`UPDATE backups SET available_backups = ? WHERE id = ?`).run(JSON.stringify(availableBackups), backup.id);
            extractedCount++;
          }
        }
      }
      
      console.log(`Extracted available backups from ${extractedCount} records`);
      
      // Populate default configurations if they don't exist
      populateDefaultConfigurations(db);
      
      console.log('Consolidated migration 2.0 completed successfully');
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
  
  isNewDatabase(): boolean {
    try {
      const backupCount = this.db.prepare('SELECT COUNT(*) as count FROM backups').get() as { count: number };
      const machineCount = this.db.prepare('SELECT COUNT(*) as count FROM machines').get() as { count: number };
      return backupCount.count === 0 && machineCount.count === 0;
    } catch (error) {
      console.warn('Error checking if database is new:', error);
      return false;
    }
  }
  
  setVersion(version: string): void {
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
    
    // Run migrations with retry logic for database locking issues
    for (const migration of pendingMigrations) {
      console.log(`Applying migration ${migration.version}: ${migration.description}`);
      
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          // Run migration in a transaction
          const transaction = this.db.transaction(() => {
            migration.up(this.db);
            this.setVersion(migration.version);
          });
          
          transaction();
          console.log(`Migration ${migration.version} completed successfully`);
          break; // Success, exit retry loop
          
        } catch (error) {
          retryCount++;
          const errorMessage = error instanceof Error ? error.message : String(error);
          
          if (errorMessage.includes('database is locked') || errorMessage.includes('SQLITE_BUSY')) {
            if (retryCount < maxRetries) {
              console.warn(`Database is locked, retrying migration ${migration.version} (attempt ${retryCount}/${maxRetries})...`);
              // Wait a bit before retrying
              const waitTime = retryCount * 1000; // 1s, 2s, 3s
              setTimeout(() => {}, waitTime);
            } else {
              console.error(`Migration ${migration.version} failed after ${maxRetries} attempts due to database lock:`, errorMessage);
              throw error;
            }
          } else {
            console.error(`Migration ${migration.version} failed:`, errorMessage);
            throw error;
          }
        }
      }
    }
    
    console.log('All migrations completed successfully');
  }
} 