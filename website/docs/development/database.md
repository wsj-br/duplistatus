

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

- **Version 0.7.x**: Major schema changes (machines → servers)
- **Version 0.8.x**: Enhanced features and performance improvements
- **Version 0.9.x / Schema v4.0**: User Access Control (users, sessions, audit_log tables)

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
| `server_url` | TEXT | Duplicati server URL |
| `alias` | TEXT | User-defined friendly name |
| `note` | TEXT | User-defined notes/description |
| `server_password` | TEXT | Server password for authentication |
| `created_at` | DATETIME | Server creation timestamp |

### Backups Table

Stores backup operation data received from Duplicati servers.

#### Key Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | TEXT PRIMARY KEY | Unique backup identifier |
| `server_id` | TEXT NOT NULL | Reference to servers table |
| `backup_name` | TEXT NOT NULL | Backup job name |
| `backup_id` | TEXT NOT NULL | Backup ID from Duplicati |
| `date` | DATETIME NOT NULL | Backup execution time |
| `status` | TEXT NOT NULL | Backup status (Success, Warning, Error, Fatal) |
| `duration_seconds` | INTEGER NOT NULL | Duration in seconds |
| `size` | INTEGER | Size of source files |
| `uploaded_size` | INTEGER | Size of uploaded data |
| `examined_files` | INTEGER | Number of files examined |
| `warnings` | INTEGER | Number of warnings |
| `errors` | INTEGER | Number of errors |
| `created_at` | DATETIME | Record creation timestamp |

#### Message Arrays (JSON Storage)

| Field | Type | Description |
|-------|------|-------------|
| `messages_array` | TEXT | JSON array of log messages |
| `warnings_array` | TEXT | JSON array of warning messages |
| `errors_array` | TEXT | JSON array of error messages |
| `available_backups` | TEXT | JSON array of available backup versions |

#### File Operation Fields

| Field | Type | Description |
|-------|------|-------------|
| `examined_files` | INTEGER | Files examined during backup |
| `opened_files` | INTEGER | Files opened for backup |
| `added_files` | INTEGER | New files added to backup |
| `modified_files` | INTEGER | Files modified in backup |
| `deleted_files` | INTEGER | Files deleted from backup |
| `deleted_folders` | INTEGER | Folders deleted from backup |
| `added_folders` | INTEGER | Folders added to backup |
| `modified_folders` | INTEGER | Folders modified in backup |
| `not_processed_files` | INTEGER | Files not processed |
| `too_large_files` | INTEGER | Files too large to process |
| `files_with_error` | INTEGER | Files with errors |
| `added_symlinks` | INTEGER | Symbolic links added |
| `modified_symlinks` | INTEGER | Symbolic links modified |
| `deleted_symlinks` | INTEGER | Symbolic links deleted |

#### Operation Status Fields

| Field | Type | Description |
|-------|------|-------------|
| `parsed_result` | TEXT NOT NULL | Parsed operation result |
| `main_operation` | TEXT NOT NULL | Main operation type |
| `interrupted` | BOOLEAN | Whether backup was interrupted |
| `partial_backup` | BOOLEAN | Whether backup was partial |
| `dryrun` | BOOLEAN | Whether backup was a dry run |
| `version` | TEXT | Duplicati version used |
| `begin_time` | DATETIME NOT NULL | Backup start time |
| `end_time` | DATETIME NOT NULL | Backup end time |
| `warnings_actual_length` | INTEGER | Actual warnings count |
| `errors_actual_length` | INTEGER | Actual errors count |
| `messages_actual_length` | INTEGER | Actual messages count |

#### Backend Statistics Fields

| Field | Type | Description |
|-------|------|-------------|
| `bytes_downloaded` | INTEGER | Bytes downloaded from destination |
| `known_file_size` | INTEGER | Known file size on destination |
| `last_backup_date` | DATETIME | Last backup date on destination |
| `backup_list_count` | INTEGER | Number of backup versions |
| `reported_quota_error` | BOOLEAN | Quota error reported |
| `reported_quota_warning` | BOOLEAN | Quota warning reported |
| `backend_main_operation` | TEXT | Backend main operation |
| `backend_parsed_result` | TEXT | Backend parsed result |
| `backend_interrupted` | BOOLEAN | Backend operation interrupted |
| `backend_version` | TEXT | Backend version |
| `backend_begin_time` | DATETIME | Backend operation start time |
| `backend_duration` | TEXT | Backend operation duration |
| `backend_warnings_actual_length` | INTEGER | Backend warnings count |
| `backend_errors_actual_length` | INTEGER | Backend errors count |

### Configurations Table

Stores application configuration settings.

#### Fields

| Field   | Type                      | Description                |
|---------|---------------------------|----------------------------|
| `key`   | TEXT PRIMARY KEY NOT NULL | Configuration key          |
| `value` | TEXT                      | Configuration value (JSON) |

#### Common Configuration Keys

- `email_config`: Email notification settings
- `ntfy_config`: NTFY notification settings
- `overdue_tolerance`: Overdue backup tolerance settings
- `notification_templates`: Notification message templates
- `audit_retention_days`: Audit log retention period (default: 90 days)

### Database Version Table

Tracks database schema version for migration purposes.

#### Fields

| Field        | Type             | Description                |
|--------------|------------------|----------------------------|
| `version`    | TEXT PRIMARY KEY | Database version           |
| `applied_at` | DATETIME         | When migration was applied |

### Users Table

Stores user account information for authentication and access control.

#### Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | TEXT PRIMARY KEY | Unique user identifier |
| `username` | TEXT UNIQUE NOT NULL | Username for login |
| `password_hash` | TEXT NOT NULL | Bcrypt hashed password |
| `is_admin` | BOOLEAN NOT NULL | Whether user has admin privileges |
| `must_change_password` | BOOLEAN | Whether password change is required |
| `created_at` | DATETIME | Account creation timestamp |
| `updated_at` | DATETIME | Last update timestamp |
| `last_login_at` | DATETIME | Last successful login timestamp |
| `last_login_ip` | TEXT | IP address of last login |
| `failed_login_attempts` | INTEGER | Count of failed login attempts |
| `locked_until` | DATETIME | Account lock expiration (if locked) |

### Sessions Table

Stores user session data for authentication and security.

#### Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | TEXT PRIMARY KEY | Session identifier |
| `user_id` | TEXT | Reference to users table (nullable for unauthenticated sessions) |
| `created_at` | DATETIME | Session creation timestamp |
| `last_accessed` | DATETIME | Last access timestamp |
| `expires_at` | DATETIME NOT NULL | Session expiration timestamp |
| `ip_address` | TEXT | IP address of session origin |
| `user_agent` | TEXT | User agent string |
| `csrf_token` | TEXT | CSRF token for the session |
| `csrf_expires_at` | DATETIME | CSRF token expiration |

### Audit Log Table

Stores audit trail of user actions and system events.

#### Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | INTEGER PRIMARY KEY AUTOINCREMENT | Unique audit log entry identifier |
| `timestamp` | DATETIME | Event timestamp |
| `user_id` | TEXT | Reference to users table (nullable) |
| `username` | TEXT | Username at time of action |
| `action` | TEXT NOT NULL | Action performed |
| `category` | TEXT NOT NULL | Category of action (e.g., 'authentication', 'settings', 'backup') |
| `target_type` | TEXT | Type of target (e.g., 'server', 'backup', 'user') |
| `target_id` | TEXT | Identifier of target |
| `details` | TEXT | Additional details (JSON) |
| `ip_address` | TEXT | IP address of requester |
| `user_agent` | TEXT | User agent string |
| `status` | TEXT NOT NULL | Status of action ('success', 'failure', 'error') |
| `error_message` | TEXT | Error message if action failed |

## Session Management

### Database-Backed Session Storage

Sessions are stored in the database with in-memory fallback:
- **Primary Storage**: Database-backed sessions table
- **Fallback**: In-memory storage (legacy support or error cases)
- **Session ID**: Cryptographically secure random string
- **Expiration**: Configurable session timeout
- **CSRF Protection**: Cross-site request forgery protection
- **Automatic Cleanup**: Expired sessions are automatically removed

### Session API Endpoints

- `POST /api/session`: Create new session
- `GET /api/session`: Validate existing session
- `DELETE /api/session`: Destroy session
- `GET /api/csrf`: Get CSRF token

## Indexes

The database includes several indexes for optimal query performance:

- **Primary Keys**: All tables have primary key indexes
- **Foreign Keys**: Server references in backups table, user references in sessions and audit_log
- **Query Optimization**: Indexes on frequently queried fields
- **Date Indexes**: Indexes on date fields for time-based queries
- **User Indexes**: Username index for fast user lookups
- **Session Indexes**: Expiration and user_id indexes for session management
- **Audit Indexes**: Timestamp, user_id, action, category, and status indexes for audit queries

## Relationships

- **Servers → Backups**: One-to-many relationship
- **Users → Sessions**: One-to-many relationship (sessions can exist without users)
- **Users → Audit Log**: One-to-many relationship (audit entries can exist without users)
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
    "BeginTime": "2025-04-21T23:45:46.9712217Z", // → begin_time and date
    "Duration": "00:00:51.3856057",   // → duration_seconds (calculated)
    "WarningsActualLength": 0,        // → warnings count
    "ErrorsActualLength": 0           // → errors count
  },
  "Extra": {
    "machine-id": "66f5ffc7ff474a73a3c9cba4ac7bfb65", // → server_id
    "machine-name": "WSJ-SER5",       // → server name
    "backup-name": "WSJ-SER5 Local files", // → backup_name
    "backup-id": "DB-2"               // → backup_id
  }
}
```

## Maintenance

### Regular Maintenance Tasks

1. **Vacuum Database**: Reclaim unused space
2. **Analyse Statistics**: Update query optimiser statistics
3. **Check Integrity**: Verify database integrity
4. **Backup Database**: Create regular backups

### Performance Optimisation

- **Index Maintenance**: Monitor and optimise indexes
- **Query Optimisation**: Analyse slow queries
- **Data Cleanup**: Remove old backup data
- **Connection Pooling**: Optimise database connections

## Troubleshooting

### Common Issues

1. **Database Locked**: Check for long-running transactions
2. **Disk Space**: Monitor database file size
3. **Corruption**: Use integrity checks
4. **Performance**: Analyse query performance

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
