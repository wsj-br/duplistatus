import Database from 'better-sqlite3';
import { extractAvailableBackups } from './utils';

// Database migration interface
interface Migration {
  version: string;
  description: string;
  up: (db: Database.Database) => void;
  down?: (db: Database.Database) => void;
}

// Migration definitions
const migrations: Migration[] = [
  {
    version: '2.0',
    description: 'Add available_backups field and process existing data',
    up: (db: Database.Database) => {
      console.log('Running migration 2.0: Adding available_backups field...');
      
      // Add the available_backups column to the backups table
      db.exec(`
        ALTER TABLE backups ADD COLUMN available_backups TEXT DEFAULT '[]';
      `);
      
      console.log('Processing existing backup records...');
      
      // Get all existing backups with messages_array data
      const getBackups = db.prepare(`
        SELECT id, messages_array FROM backups WHERE messages_array IS NOT NULL
      `);
      
      const updateBackup = db.prepare(`
        UPDATE backups SET available_backups = ? WHERE id = ?
      `);
      
      const backups = getBackups.all() as { id: string; messages_array: string }[];
      
      let processedCount = 0;
      let extractedCount = 0;
      
      for (const backup of backups) {
        const availableBackups = extractAvailableBackups(backup.messages_array);
        updateBackup.run(JSON.stringify(availableBackups), backup.id);
        processedCount++;
        
        if (availableBackups.length > 0) {
          extractedCount++;
        }
      }
      
      // Set default empty array for records without messages_array
      db.exec(`
        UPDATE backups SET available_backups = '[]' WHERE available_backups IS NULL
      `);
      
      console.log(`Migration 2.0 completed: Processed ${processedCount} records, extracted available backups from ${extractedCount} records`);
    },
    down: (db: Database.Database) => {
      // Remove the available_backups column
      db.exec(`
        CREATE TABLE backups_temp AS SELECT * FROM backups;
        ALTER TABLE backups_temp DROP COLUMN available_backups;
        DROP TABLE backups;
        ALTER TABLE backups_temp RENAME TO backups;
      `);
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
      INSERT INTO db_version (version) VALUES (?)
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