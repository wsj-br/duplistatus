# Database

![duplistatus](../img/duplistatus_banner.png)

Database schema, operations, and maintenance for duplistatus.

## Overview

duplistatus uses SQLite as its database engine, providing a lightweight, file-based solution that's perfect for single-instance deployments.

## Database Schema

### Tables

#### Servers Table
```sql
CREATE TABLE servers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  alias TEXT,
  notes TEXT,
  last_seen DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Backups Table
```sql
CREATE TABLE backups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  server_id INTEGER NOT NULL,
  backup_name TEXT NOT NULL,
  status TEXT NOT NULL,
  start_time DATETIME,
  end_time DATETIME,
  duration INTEGER,
  files_count INTEGER,
  files_size INTEGER,
  storage_size INTEGER,
  uploaded_size INTEGER,
  messages TEXT, -- JSON array
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (server_id) REFERENCES servers (id)
);
```

#### Configuration Table
```sql
CREATE TABLE configuration (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Notifications Table
```sql
CREATE TABLE notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  server_id INTEGER,
  backup_id INTEGER,
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  message TEXT,
  sent_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (server_id) REFERENCES servers (id),
  FOREIGN KEY (backup_id) REFERENCES backups (id)
);
```

## Database Operations

### Connection Management
```javascript
import Database from 'better-sqlite3';

class DatabaseManager {
  constructor(dbPath) {
    this.db = new Database(dbPath);
    this.initializeTables();
  }

  initializeTables() {
    // Create tables if they don't exist
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS servers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        alias TEXT,
        notes TEXT,
        last_seen DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  close() {
    this.db.close();
  }
}
```

### Server Operations
```javascript
class ServerRepository {
  constructor(db) {
    this.db = db;
  }

  create(serverData) {
    const stmt = this.db.prepare(`
      INSERT INTO servers (name, alias, notes)
      VALUES (?, ?, ?)
    `);
    
    return stmt.run(serverData.name, serverData.alias, serverData.notes);
  }

  findById(id) {
    const stmt = this.db.prepare('SELECT * FROM servers WHERE id = ?');
    return stmt.get(id);
  }

  findAll() {
    const stmt = this.db.prepare('SELECT * FROM servers ORDER BY name');
    return stmt.all();
  }

  update(id, updates) {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    
    const stmt = this.db.prepare(`
      UPDATE servers 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `);
    
    return stmt.run(...values, id);
  }

  delete(id) {
    const stmt = this.db.prepare('DELETE FROM servers WHERE id = ?');
    return stmt.run(id);
  }
}
```

### Backup Operations
```javascript
class BackupRepository {
  constructor(db) {
    this.db = db;
  }

  create(backupData) {
    const stmt = this.db.prepare(`
      INSERT INTO backups (
        server_id, backup_name, status, start_time, end_time,
        duration, files_count, files_size, storage_size,
        uploaded_size, messages
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    return stmt.run(
      backupData.server_id,
      backupData.backup_name,
      backupData.status,
      backupData.start_time,
      backupData.end_time,
      backupData.duration,
      backupData.files_count,
      backupData.files_size,
      backupData.storage_size,
      backupData.uploaded_size,
      JSON.stringify(backupData.messages)
    );
  }

  findByServerId(serverId, limit = 100) {
    const stmt = this.db.prepare(`
      SELECT * FROM backups 
      WHERE server_id = ? 
      ORDER BY start_time DESC 
      LIMIT ?
    `);
    
    return stmt.all(serverId, limit);
  }

  findLatestByServer(serverId) {
    const stmt = this.db.prepare(`
      SELECT * FROM backups 
      WHERE server_id = ? 
      ORDER BY start_time DESC 
      LIMIT 1
    `);
    
    return stmt.get(serverId);
  }

  getStatistics(serverId) {
    const stmt = this.db.prepare(`
      SELECT 
        COUNT(*) as total_backups,
        COUNT(CASE WHEN status = 'success' THEN 1 END) as successful_backups,
        COUNT(CASE WHEN status = 'error' THEN 1 END) as failed_backups,
        AVG(duration) as avg_duration,
        SUM(files_size) as total_size
      FROM backups 
      WHERE server_id = ?
    `);
    
    return stmt.get(serverId);
  }
}
```

## Database Migrations

### Migration System
```javascript
class MigrationManager {
  constructor(db) {
    this.db = db;
    this.initializeMigrationsTable();
  }

  initializeMigrationsTable() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        version TEXT NOT NULL UNIQUE,
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  getAppliedMigrations() {
    const stmt = this.db.prepare('SELECT version FROM migrations ORDER BY version');
    return stmt.all().map(row => row.version);
  }

  applyMigration(version, sql) {
    const transaction = this.db.transaction(() => {
      this.db.exec(sql);
      const stmt = this.db.prepare('INSERT INTO migrations (version) VALUES (?)');
      stmt.run(version);
    });
    
    transaction();
  }

  runMigrations() {
    const appliedMigrations = this.getAppliedMigrations();
    const availableMigrations = this.getAvailableMigrations();
    
    for (const migration of availableMigrations) {
      if (!appliedMigrations.includes(migration.version)) {
        console.log(`Applying migration ${migration.version}`);
        this.applyMigration(migration.version, migration.sql);
      }
    }
  }
}
```

### Migration Files
```javascript
// migrations/001_initial_schema.sql
CREATE TABLE IF NOT EXISTS servers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  alias TEXT,
  notes TEXT,
  last_seen DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS backups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  server_id INTEGER NOT NULL,
  backup_name TEXT NOT NULL,
  status TEXT NOT NULL,
  start_time DATETIME,
  end_time DATETIME,
  duration INTEGER,
  files_count INTEGER,
  files_size INTEGER,
  storage_size INTEGER,
  uploaded_size INTEGER,
  messages TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (server_id) REFERENCES servers (id)
);
```

## Database Maintenance

### Cleanup Operations
```javascript
class DatabaseMaintenance {
  constructor(db) {
    this.db = db;
  }

  cleanupOldBackups(retentionDays = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    
    const stmt = this.db.prepare(`
      DELETE FROM backups 
      WHERE created_at < ?
    `);
    
    const result = stmt.run(cutoffDate.toISOString());
    return result.changes;
  }

  vacuum() {
    this.db.exec('VACUUM');
  }

  analyze() {
    this.db.exec('ANALYZE');
  }

  getDatabaseSize() {
    const stmt = this.db.prepare(`
      SELECT page_count * page_size as size 
      FROM pragma_page_count(), pragma_page_size()
    `);
    
    return stmt.get().size;
  }

  getTableSizes() {
    const stmt = this.db.prepare(`
      SELECT 
        name,
        (SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name=m.name) as row_count
      FROM sqlite_master m
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `);
    
    return stmt.all();
  }
}
```

### Backup and Restore
```javascript
class DatabaseBackup {
  constructor(db) {
    this.db = db;
  }

  createBackup(backupPath) {
    const backup = this.db.backup(backupPath);
    return new Promise((resolve, reject) => {
      backup.step(-1, (err) => {
        if (err) {
          reject(err);
        } else {
          backup.finish();
          resolve();
        }
      });
    });
  }

  restoreFromBackup(backupPath) {
    // Close current database
    this.db.close();
    
    // Copy backup file to database location
    const fs = require('fs');
    fs.copyFileSync(backupPath, this.dbPath);
    
    // Reopen database
    this.db = new Database(this.dbPath);
  }
}
```

## Performance Optimization

### Indexing
```sql
-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_backups_server_id ON backups(server_id);
CREATE INDEX IF NOT EXISTS idx_backups_start_time ON backups(start_time);
CREATE INDEX IF NOT EXISTS idx_backups_status ON backups(status);
CREATE INDEX IF NOT EXISTS idx_servers_name ON servers(name);
```

### Query Optimization
```javascript
class OptimizedQueries {
  constructor(db) {
    this.db = db;
  }

  getServerWithLatestBackup(serverId) {
    const stmt = this.db.prepare(`
      SELECT 
        s.*,
        b.status as latest_status,
        b.start_time as latest_backup_time,
        b.duration as latest_duration
      FROM servers s
      LEFT JOIN backups b ON s.id = b.server_id
      WHERE s.id = ? 
      ORDER BY b.start_time DESC 
      LIMIT 1
    `);
    
    return stmt.get(serverId);
  }

  getBackupTrends(serverId, days = 30) {
    const stmt = this.db.prepare(`
      SELECT 
        DATE(start_time) as date,
        COUNT(*) as backup_count,
        AVG(duration) as avg_duration,
        SUM(files_size) as total_size
      FROM backups 
      WHERE server_id = ? 
        AND start_time >= datetime('now', '-${days} days')
      GROUP BY DATE(start_time)
      ORDER BY date
    `);
    
    return stmt.all(serverId);
  }
}
```

## Database Monitoring

### Health Checks
```javascript
class DatabaseHealth {
  constructor(db) {
    this.db = db;
  }

  checkIntegrity() {
    const stmt = this.db.prepare('PRAGMA integrity_check');
    const result = stmt.get();
    return result.integrity_check === 'ok';
  }

  getConnectionCount() {
    const stmt = this.db.prepare('PRAGMA database_list');
    return stmt.all().length;
  }

  getPerformanceStats() {
    const stmt = this.db.prepare('PRAGMA compile_options');
    return stmt.all();
  }
}
```

## Best Practices

### Connection Management
- Use connection pooling for high-traffic applications
- Close connections properly
- Handle connection errors gracefully
- Monitor connection usage

### Query Optimization
- Use prepared statements
- Create appropriate indexes
- Avoid N+1 queries
- Use transactions for multiple operations

### Data Integrity
- Use foreign key constraints
- Validate data before insertion
- Use transactions for atomic operations
- Regular integrity checks

### Security
- Sanitize user input
- Use parameterized queries
- Limit database permissions
- Regular security updates

## Troubleshooting

### Common Issues
- **Database locked**: Check for long-running transactions
- **Disk space**: Monitor database file size
- **Performance**: Analyze slow queries
- **Corruption**: Use integrity checks

### Recovery Procedures
- **Backup restoration**: Use backup files
- **Data recovery**: Extract data from corrupted files
- **Schema repair**: Recreate missing tables
- **Index rebuilding**: Recreate corrupted indexes

## Getting Help

### Resources
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [better-sqlite3 Documentation](https://github.com/WiseLibs/better-sqlite3)
- Database performance guides
- Community support forums
