---
sidebar_position: 9
---

# Database Schema

This document describes the SQLite database schema used by duplistatus to store backup operation data.

## Database Location

The database is stored in the application data directory:
- **Default Location**: `/app/data/backups.db`
- **Docker Volume**: `duplistatus_data:/app/data`
- **File Name**: `backups.db`

## Database Migration System

duplistatus uses an automated migration system to handle database schema changes between versions.

### Current Migration Versions

- **Version 0.7.27**: Major schema changes (machines → servers)
- **Version 0.8.x**: Enhanced features and performance improvements

### Migration Process

1. **Automatic Backup**: Creates backup before migration
2. **Schema Update**: Updates database structure
3. **Data Migration**: Preserves existing data
4. **Verification**: Confirms successful migration

## Tables

### Servers Table

Stores information about Duplicati servers being monitored.

#### Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | TEXT PRIMARY KEY | Unique server identifier |
| `name` | TEXT NOT NULL | Server name from Duplicati |
| `alias` | TEXT | User-defined friendly name |
| `notes` | TEXT | User-defined notes/description |
| `created_at` | DATETIME | Server creation timestamp |
| `updated_at` | DATETIME | Last update timestamp |

### Backups Table

Stores backup operation data received from Duplicati servers.

#### Key Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | TEXT PRIMARY KEY | Unique backup identifier |
| `server_id` | TEXT NOT NULL | Reference to servers table |
| `name` | TEXT NOT NULL | Backup job name |
| `date` | DATETIME NOT NULL | Backup execution time |
| `status` | TEXT NOT NULL | Backup status (Success, Warning, Error, Fatal) |
| `duration` | TEXT | Backup duration (HH:MM:SS) |
| `duration_seconds` | REAL | Duration in seconds |
| `file_count` | INTEGER | Number of files processed |
| `file_size` | INTEGER | Size of source files |
| `uploaded_size` | INTEGER | Size of uploaded data |
| `storage_size` | INTEGER | Storage used on destination |

#### Message Arrays (JSON Storage)

| Field | Type | Description |
|-------|------|-------------|
| `messages_array` | TEXT | JSON array of log messages |
| `warnings_array` | TEXT | JSON array of warning messages |
| `errors_array` | TEXT | JSON array of error messages |

#### File Operation Fields

| Field | Type | Description |
|-------|------|-------------|
| `examined_files` | INTEGER | Files examined during backup |
| `opened_files` | INTEGER | Files opened for backup |
| `added_files` | INTEGER | New files added to backup |
| `modified_files` | INTEGER | Files modified in backup |
| `deleted_files` | INTEGER | Files deleted from backup |

#### Operation Status Fields

| Field | Type | Description |
|-------|------|-------------|
| `parsed_result` | TEXT | Parsed operation result |
| `main_operation` | TEXT | Main operation type |
| `interrupted` | BOOLEAN | Whether backup was interrupted |
| `partial_backup` | BOOLEAN | Whether backup was partial |
| `dryrun` | BOOLEAN | Whether backup was a dry run |

#### Backend Statistics Fields

| Field | Type | Description |
|-------|------|-------------|
| `bytes_uploaded` | INTEGER | Bytes uploaded to destination |
| `bytes_downloaded` | INTEGER | Bytes downloaded from destination |
| `known_file_size` | INTEGER | Known file size on destination |
| `backup_list_count` | INTEGER | Number of backup versions |
| `last_backup_date` | DATETIME | Last backup date on destination |

### Configurations Table

Stores application configuration settings.

#### Fields

| Field | Type | Description |
|-------|------|-------------|
| `key` | TEXT PRIMARY KEY | Configuration key |
| `value` | TEXT | Configuration value (JSON) |
| `updated_at` | DATETIME | Last update timestamp |

#### Common Configuration Keys

- `email_config`: Email notification settings
- `ntfy_config`: NTFY notification settings
- `overdue_tolerance`: Overdue backup tolerance settings
- `notification_templates`: Notification message templates

### Database Version Table

Tracks database schema version for migration purposes.

#### Fields

| Field | Type | Description |
|-------|------|-------------|
| `version` | TEXT PRIMARY KEY | Database version |
| `applied_at` | DATETIME | When migration was applied |

## Session Management

### In-Memory Session Storage

Sessions are stored in memory for security and performance:
- **Session ID**: Cryptographically secure random string
- **Expiration**: Configurable session timeout
- **CSRF Protection**: Cross-site request forgery protection

### Session API Endpoints

- `POST /api/session`: Create new session
- `GET /api/session`: Validate existing session
- `DELETE /api/session`: Destroy session
- `GET /api/csrf`: Get CSRF token

## Indexes

The database includes several indexes for optimal query performance:

- **Primary Keys**: All tables have primary key indexes
- **Foreign Keys**: Server references in backups table
- **Query Optimization**: Indexes on frequently queried fields
- **Date Indexes**: Indexes on date fields for time-based queries

## Relationships

- **Servers → Backups**: One-to-many relationship
- **Backups → Messages**: Embedded JSON arrays
- **Configurations**: Key-value storage

## Data Types

- **TEXT**: String data, JSON arrays
- **INTEGER**: Numeric data, file counts, sizes
- **REAL**: Floating-point numbers, durations
- **DATETIME**: Timestamp data
- **BOOLEAN**: True/false values

## Backup Status Values

- **Success**: Backup completed successfully
- **Warning**: Backup completed with warnings
- **Error**: Backup completed with errors
- **Fatal**: Backup failed fatally

## Common Queries

### Get Latest Backup for a Server

```sql
SELECT * FROM backups 
WHERE server_id = ? 
ORDER BY date DESC 
LIMIT 1;
```

### Get All Backups for a Server

```sql
SELECT * FROM backups 
WHERE server_id = ? 
ORDER BY date DESC;
```

### Get Server Summary

```sql
SELECT 
  s.name,
  s.alias,
  COUNT(b.id) as backup_count,
  MAX(b.date) as last_backup,
  b.status as last_status
FROM servers s
LEFT JOIN backups b ON s.id = b.server_id
GROUP BY s.id;
```

### Get Overall Summary

```sql
SELECT 
  COUNT(DISTINCT s.id) as total_servers,
  COUNT(b.id) as total_backups,
  SUM(b.uploaded_size) as total_uploaded,
  SUM(b.storage_size) as total_storage
FROM servers s
LEFT JOIN backups b ON s.id = b.server_id;
```

### Database Cleanup

```sql
-- Delete old backups (older than 30 days)
DELETE FROM backups 
WHERE date < datetime('now', '-30 days');

-- Delete servers with no backups
DELETE FROM servers 
WHERE id NOT IN (SELECT DISTINCT server_id FROM backups);
```

## JSON to Database Mapping

### API Request Body to Database Columns Mapping

When Duplicati sends backup data via HTTP POST, the JSON structure is mapped to database columns:

```json
{
  "Data": {
    "ExaminedFiles": 15399,           // → examined_files
    "OpenedFiles": 1861,              // → opened_files
    "AddedFiles": 1861,               // → added_files
    "SizeOfExaminedFiles": 11086692615, // → file_size
    "SizeOfAddedFiles": 13450481,     // → uploaded_size
    "ParsedResult": "Success",        // → status
    "BeginTime": "2025-04-21T23:45:46.9712217Z", // → date
    "Duration": "00:00:51.3856057",   // → duration
    "WarningsActualLength": 0,        // → warnings count
    "ErrorsActualLength": 0           // → errors count
  },
  "Extra": {
    "machine-id": "66f5ffc7ff474a73a3c9cba4ac7bfb65", // → server_id
    "machine-name": "WSJ-SER5",       // → server name
    "backup-name": "WSJ-SER5 Local files", // → backup name
    "backup-id": "DB-2"               // → backup id
  }
}
```

## Maintenance

### Regular Maintenance Tasks

1. **Vacuum Database**: Reclaim unused space
2. **Analyze Statistics**: Update query optimizer statistics
3. **Check Integrity**: Verify database integrity
4. **Backup Database**: Create regular backups

### Performance Optimization

- **Index Maintenance**: Monitor and optimize indexes
- **Query Optimization**: Analyze slow queries
- **Data Cleanup**: Remove old backup data
- **Connection Pooling**: Optimize database connections

## Troubleshooting

### Common Issues

1. **Database Locked**: Check for long-running transactions
2. **Disk Space**: Monitor database file size
3. **Corruption**: Use integrity checks
4. **Performance**: Analyze query performance

### Recovery Procedures

1. **Backup Restoration**: Restore from backup file
2. **Schema Repair**: Recreate corrupted tables
3. **Data Recovery**: Recover from backup logs
4. **Migration Rollback**: Rollback failed migrations

## Security Considerations

- **File Permissions**: Restrict database file access
- **Encryption**: Consider database encryption for sensitive data
- **Backup Security**: Secure backup file storage
- **Access Control**: Implement proper access controls

## Monitoring

### Database Metrics

- **File Size**: Monitor database file growth
- **Query Performance**: Track slow queries
- **Connection Count**: Monitor active connections
- **Lock Contention**: Check for database locks

### Health Checks

- **Integrity Checks**: Regular database integrity verification
- **Performance Monitoring**: Query performance analysis
- **Error Tracking**: Database error monitoring
- **Backup Verification**: Verify backup file integrity
