
![duplistatus](img/duplistatus_banner.png)

# duplistatus Database Schema

![](https://img.shields.io/badge/version-0.7.14.dev-blue)


This document describes the SQLite database schema used by duplistatus to store backup operation data.

<br>


<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents** 

- [Database Location](#database-location)
- [Database Migration System](#database-migration-system)
  - [Current Migration Versions](#current-migration-versions)
  - [Migration Process](#migration-process)
- [Tables](#tables)
  - [Machines Table](#machines-table)
    - [Fields](#fields)
  - [Backups Table](#backups-table)
    - [Key Fields](#key-fields)
    - [Message Arrays (JSON Storage)](#message-arrays-json-storage)
    - [File Operation Fields](#file-operation-fields)
    - [Operation Status Fields](#operation-status-fields)
    - [Backend Statistics Fields](#backend-statistics-fields)
  - [Configurations Table](#configurations-table)
    - [Fields](#fields-1)
    - [Common Configuration Keys](#common-configuration-keys)
  - [Database Version Table](#database-version-table)
    - [Fields](#fields-2)
- [Indexes](#indexes)
- [Relationships](#relationships)
- [Data Types](#data-types)
- [Backup Status Values](#backup-status-values)
- [Common Queries](#common-queries)
  - [Get Latest Backup for a Machine](#get-latest-backup-for-a-machine)
  - [Get All Backups for a Machine](#get-all-backups-for-a-machine)
  - [Get Machine Summary](#get-machine-summary)
  - [Get Overall Summary](#get-overall-summary)
  - [Database Cleanup](#database-cleanup)
- [JSON to Database Mapping](#json-to-database-mapping)
  - [API Request Body to Database Columns Mapping](#api-request-body-to-database-columns-mapping)
    - [Main Operation Data](#main-operation-data)
    - [Message Arrays](#message-arrays)
    - [File Operation Statistics](#file-operation-statistics)
    - [Backend Statistics](#backend-statistics)
    - [Extra Information](#extra-information)
    - [Generated Fields](#generated-fields)
  - [Example JSON to Database Insert](#example-json-to-database-insert)
- [Chart Metrics](#chart-metrics)
  - [Chart Data Functions](#chart-data-functions)
  - [Chart Data Generation](#chart-data-generation)
- [Configuration Management](#configuration-management)
  - [Configuration Functions](#configuration-functions)
  - [TypeScript Interfaces](#typescript-interfaces)
  - [Common Configuration Keys](#common-configuration-keys-1)
  - [Configuration API Endpoints](#configuration-api-endpoints)
  - [Configuration Data Structures](#configuration-data-structures)
    - [Notifications Configuration (`notifications`)](#notifications-configuration-notifications)
    - [Backup Settings Configuration (`backup_settings`)](#backup-settings-configuration-backup_settings)
    - [Cron Service Configuration (`cron_service`)](#cron-service-configuration-cron_service)
    - [Overdue Backup Notifications (`overdue_backup_notifications`)](#overdue-backup-notifications-overdue_backup_notifications)
    - [Overdue Tolerance Configuration (`overdue_tolerance`)](#overdue-tolerance-configuration-overdue_tolerance)
- [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

<br>

## Database Location

The database file (`backups.db`) is stored in the `data` directory of the application. The database is automatically created when the application starts if it doesn't exist.

## Database Migration System

The application includes an automatic database migration system that ensures your database schema stays up to date with the application version. The migration system:

- **Automatically detects** when migrations are needed
- **Creates backups** before running migrations (named `backups-copy-YYYY-MM-DDTHH-MM-SS.db`)
- **Runs migrations safely** with retry logic for database locking issues
- **Tracks migration history** in the `db_version` table
- **Preserves all existing data** during migrations

### Current Migration Versions

- **Version 2.0**: Added missing columns to backups table and created configurations table
- **Version 3.0**: Added `server_url` field to machines table

### Migration Process

When the application starts, it automatically:

1. Checks the current database version
2. Identifies pending migrations
3. Creates a backup of the current database
4. Runs each migration in a transaction
5. Updates the version tracking table
6. Populates default configurations for new databases

The migration system is designed to be safe and non-destructive, ensuring your data is preserved throughout the upgrade process.

## Tables

### Machines Table

Stores information about machines that perform backups.

```sql
CREATE TABLE machines (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    server_url TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Fields
- `id` (TEXT, PRIMARY KEY): Unique identifier for the machine
- `name` (TEXT, NOT NULL): Display name of the machine
- `server_url` (TEXT, DEFAULT ''): URL of the Duplicati server for this machine (optional)
- `created_at` (DATETIME): Timestamp when the machine was first registered

### Backups Table

Stores detailed information about each backup operation.

```sql
CREATE TABLE backups (
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
    
    FOREIGN KEY (machine_id) REFERENCES machines(id)
);
```

#### Key Fields
- `id` (TEXT, PRIMARY KEY): Unique identifier for the backup
- `machine_id` (TEXT, NOT NULL): Reference to the machine that performed the backup
- `backup_name` (TEXT, NOT NULL): Name of the backup operation
- `backup_id` (TEXT, NOT NULL): Duplicati backup identifier
- `date` (DATETIME, NOT NULL): When the backup was performed
- `status` (TEXT, NOT NULL): Backup status (Success, Failed, InProgress, Warning)
- `duration_seconds` (INTEGER, NOT NULL): Duration of the backup in seconds
- `size` (INTEGER): Total size of files in the backup
- `uploaded_size` (INTEGER): Size of data uploaded during backup
- `examined_files` (INTEGER): Number of files examined
- `warnings` (INTEGER): Number of warnings during backup
- `errors` (INTEGER): Number of errors during backup

#### Message Arrays (JSON Storage)
- `messages_array` (TEXT): JSON array of log messages from the backup operation
- `warnings_array` (TEXT): JSON array of warning messages
- `errors_array` (TEXT): JSON array of error messages
- `available_backups` (TEXT): JSON array of available backup versions

#### File Operation Fields
- `deleted_files`: Number of files deleted
- `deleted_folders`: Number of folders deleted
- `modified_files`: Number of files modified
- `opened_files`: Number of files opened
- `added_files`: Number of files added
- `size_of_modified_files`: Size of modified files
- `size_of_added_files`: Size of added files
- `size_of_examined_files`: Size of examined files
- `size_of_opened_files`: Size of opened files
- `not_processed_files`: Number of files not processed
- `added_folders`: Number of folders added
- `too_large_files`: Number of files too large to process
- `files_with_error`: Number of files with errors
- `modified_folders`: Number of folders modified
- `modified_symlinks`: Number of symbolic links modified
- `added_symlinks`: Number of symbolic links added
- `deleted_symlinks`: Number of symbolic links deleted

#### Operation Status Fields
- `partial_backup`: Whether this was a partial backup
- `dryrun`: Whether this was a dry run
- `main_operation`: Type of operation performed
- `parsed_result`: Result of the operation
- `interrupted`: Whether the operation was interrupted
- `version`: Duplicati version used
- `begin_time`: When the backup started
- `end_time`: When the backup ended
- `warnings_actual_length`: Number of actual warnings
- `errors_actual_length`: Number of actual errors
- `messages_actual_length`: Number of actual messages

#### Backend Statistics Fields
- `bytes_downloaded`: Amount of data downloaded
- `known_file_size`: Size of known files
- `last_backup_date`: Date of the last backup
- `backup_list_count`: Number of backups in the list
- `reported_quota_error`: Whether a quota error was reported
- `reported_quota_warning`: Whether a quota warning was reported
- `backend_main_operation`: Backend operation type
- `backend_parsed_result`: Backend operation result
- `backend_interrupted`: Whether backend operation was interrupted
- `backend_version`: Backend version
- `backend_begin_time`: Backend operation start time
- `backend_duration`: Backend operation duration
- `backend_warnings_actual_length`: Number of backend warnings
- `backend_errors_actual_length`: Number of backend errors

### Configurations Table

Stores application configuration settings as key-value pairs.

```sql
CREATE TABLE configurations (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT
);
```

#### Fields
- `key` (TEXT, PRIMARY KEY): Configuration key
- `value` (TEXT): Configuration value (stored as JSON for complex objects)

#### Common Configuration Keys

- `notifications`: JSON object containing notification settings including:
  - Ntfy configuration (URL, topic, authentication)
  - Notification templates for different event types
  - Machine addresses for Duplicati server connections
- `backup_settings`: JSON object containing backup-specific settings including:
  - Per-backup configuration (keyed by `machine_name:backup_name`)
  - Expected backup intervals and units (hours/days)
  - Overdue backup check enabled/disabled flags
  - Notification events for each backup
  - Overdue tolerance settings
- `cron_service`: JSON object containing cron service configuration including:
  - Service port settings
  - Task configurations (overdue-backup-check, etc.)
  - Cron expressions and enabled/disabled states
  - Service health check settings
- `overdue_backup_notifications`: JSON object tracking overdue backup notification history:
  - Per-backup notification timestamps (keyed by `machine_name:backup_name`)
  - Last notification sent timestamps
  - Last backup date when notification was sent
  - Used to prevent duplicate notifications
- `last_overdue_check`: String containing the timestamp of the last overdue backup check:
  - ISO timestamp format
  - Used to track when the cron service last ran
  - Helps with debugging and monitoring
- `notification_frequency`: String value controlling notification frequency:
  - Values: `"every_day"`, `"every_week"`, `"every_month"`, `"onetime"`
  - Controls how often overdue backup notifications are sent
  - Defaults to `"every_day"` if not set
- `overdue_tolerance`: String value controlling the tolerance for overdue backups:
  - Values: `"no_tolerance"`, `"5min"`, `"15min"`, `"30min"`, `"1h"`, `"2h"`, `"4h"`, `"6h"`, `"12h"`, `"1d"`
  - Controls how much time to add to expected backup intervals before considering a backup overdue
  - Defaults to `"1h"` if not set

### Database Version Table

Tracks the database schema version and migration history.

```sql
CREATE TABLE db_version (
    version TEXT PRIMARY KEY,
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Fields
- `version` (TEXT, PRIMARY KEY): Database schema version (e.g., "3.0")
- `applied_at` (DATETIME): Timestamp when this version was applied

This table is used by the migration system to track which migrations have been applied and ensure migrations are only run once.

## Indexes

The following indexes are created to optimize query performance:

```sql
CREATE INDEX idx_backups_machine_id ON backups(machine_id);
CREATE INDEX idx_backups_date ON backups(date);
CREATE INDEX idx_backups_begin_time ON backups(begin_time);
CREATE INDEX idx_backups_end_time ON backups(end_time);
CREATE INDEX idx_backups_backup_id ON backups(backup_id);
```

## Relationships

- Each backup (`backups` table) is associated with exactly one machine (`machines` table) through the `machine_id` foreign key
- The relationship is enforced by a foreign key constraint: `FOREIGN KEY (machine_id) REFERENCES machines(id)`

## Data Types

- `TEXT`: Used for string values (IDs, names, statuses, JSON arrays)
- `INTEGER`: Used for numeric values (sizes, counts, durations)
- `DATETIME`: Used for timestamps
- `BOOLEAN`: Used for flags (stored as 0 or 1 in SQLite)

## Backup Status Values

The `status` field in the `backups` table can have the following values:
- `Success`: Backup completed successfully
- `Unknown`: Backup status is unknown or not determined
- `Warning`: Backup completed with warnings
- `Error`: Backup completed with errors
- `Fatal`: Backup failed with fatal errors

## Common Queries

### Get Latest Backup for a Machine
```sql
SELECT b.*, m.name as machine_name
FROM backups b
JOIN machines m ON b.machine_id = m.id
WHERE b.machine_id = ?
ORDER BY b.date DESC
LIMIT 1
```

### Get All Backups for a Machine
```sql
SELECT b.*, m.name as machine_name
FROM backups b
JOIN machines m ON b.machine_id = m.id
WHERE b.machine_id = ?
ORDER BY b.date DESC
```

### Get Machine Summary
```sql
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
```

### Get Overall Summary
```sql
SELECT 
    COUNT(DISTINCT m.id) as total_machines,
    COUNT(b.id) as total_backups,
    COALESCE(SUM(b.uploaded_size), 0) as total_uploaded_size,
    (
        SELECT COALESCE(SUM(b2.known_file_size), 0)
        FROM backups b2
        INNER JOIN (
            SELECT machine_id, MAX(date) as max_date
            FROM backups
            GROUP BY machine_id
        ) latest ON b2.machine_id = latest.machine_id AND b2.date = latest.max_date
    ) as total_storage_used,
    (
        SELECT COALESCE(SUM(b2.size_of_examined_files), 0)
        FROM backups b2
        INNER JOIN (
            SELECT machine_id, MAX(date) as max_date
            FROM backups
            GROUP BY machine_id
        ) latest ON b2.machine_id = latest.machine_id AND b2.date = latest.max_date
    ) as total_backuped_size
FROM machines m
LEFT JOIN backups b ON b.machine_id = m.id
```

### Database Cleanup

The application provides a database cleanup feature that can remove old backup records based on a configurable period. The cleanup period can be set to:
- Delete all data: Removes all backup records and machines
- 6 months: Keeps only the last 6 months of backup records
- 1 year: Keeps only the last year of backup records
- 2 years: Keeps only the last 2 years of backup records (default)

When cleanup is performed, it:
1. For "Delete all data":
   - Deletes all backup records
   - Deletes all machine records
   - Maintains database schema and indexes
2. For time-based cleanup:
   - Deletes backup records older than the selected period based on `end_time`
   - Maintains referential integrity with the machines table
   - Preserves machine records even if all their backups are deleted
   - Updates all related statistics and metrics

The cleanup operation is performed through the `/api/backups/cleanup` endpoint and requires a POST request with the cleanup period. The cleanup period is persisted in the browser's localStorage and can be configured through the database maintenance menu in the UI.

## JSON to Database Mapping

The following tables show how the JSON data from the API maps to the database columns. This is particularly useful when understanding the `/api/upload` endpoint data structure.

### API Request Body to Database Columns Mapping

#### Main Operation Data
| JSON Path | Database Column | Description | Type | Default |
|-----------|----------------|-------------|------|---------|
| `Data.MainOperation` | `main_operation` | Type of backup operation | TEXT | - |
| `Data.ParsedResult` | `parsed_result` | Result of the operation | TEXT | - |
| `Data.BeginTime` | `begin_time` | Start time of backup | DATETIME | - |
| `Data.Duration` | `duration_seconds` | Duration in seconds (converted from string) | INTEGER | - |
| `Data.EndTime` | `end_time` | End time of backup | DATETIME | - |
| `Data.Version` | `version` | Duplicati version used | TEXT | NULL |
| `Data.Interrupted` | `interrupted` | Whether operation was interrupted | BOOLEAN | 0 |
| `Data.PartialBackup` | `partial_backup` | Whether this was a partial backup | BOOLEAN | 0 |
| `Data.Dryrun` | `dryrun` | Whether this was a dry run | BOOLEAN | 0 |

#### Message Arrays
| JSON Path | Database Column | Description | Type | Default |
|-----------|----------------|-------------|------|---------|
| `Data.LogLines` | `messages_array` | Array of log messages | TEXT (JSON) | '[]' |
| `Data.Data.Warnings` | `warnings_array` | Array of warning messages | TEXT (JSON) | '[]' |
| `Data.Data.Errors` | `errors_array` | Array of error messages | TEXT (JSON) | '[]' |
| `Data.Data.Messages` | `messages_array` | Alternative source for messages | TEXT (JSON) | '[]' |

#### File Operation Statistics
| JSON Path | Database Column | Description | Type | Default |
|-----------|----------------|-------------|------|---------|
| `Data.DeletedFiles` | `deleted_files` | Number of files deleted | INTEGER | 0 |
| `Data.DeletedFolders` | `deleted_folders` | Number of folders deleted | INTEGER | 0 |
| `Data.ModifiedFiles` | `modified_files` | Number of files modified | INTEGER | 0 |
| `Data.OpenedFiles` | `opened_files` | Number of files opened | INTEGER | 0 |
| `Data.AddedFiles` | `added_files` | Number of files added | INTEGER | 0 |
| `Data.SizeOfModifiedFiles` | `size_of_modified_files` | Size of modified files | INTEGER | 0 |
| `Data.SizeOfAddedFiles` | `size_of_added_files` | Size of added files | INTEGER | 0 |
| `Data.SizeOfExaminedFiles` | `size_of_examined_files` | Size of examined files | INTEGER | 0 |
| `Data.SizeOfOpenedFiles` | `size_of_opened_files` | Size of opened files | INTEGER | 0 |
| `Data.NotProcessedFiles` | `not_processed_files` | Number of files not processed | INTEGER | 0 |
| `Data.AddedFolders` | `added_folders` | Number of folders added | INTEGER | 0 |
| `Data.TooLargeFiles` | `too_large_files` | Number of files too large to process | INTEGER | 0 |
| `Data.FilesWithError` | `files_with_error` | Number of files with errors | INTEGER | 0 |
| `Data.ModifiedFolders` | `modified_folders` | Number of folders modified | INTEGER | 0 |
| `Data.ModifiedSymlinks` | `modified_symlinks` | Number of symbolic links modified | INTEGER | 0 |
| `Data.AddedSymlinks` | `added_symlinks` | Number of symbolic links added | INTEGER | 0 |
| `Data.DeletedSymlinks` | `deleted_symlinks` | Number of symbolic links deleted | INTEGER | 0 |

#### Backend Statistics
| JSON Path | Database Column | Description | Type | Default |
|-----------|----------------|-------------|------|---------|
| `Data.BackendStatistics.BytesDownloaded` | `bytes_downloaded` | Amount of data downloaded | INTEGER | 0 |
| `Data.BackendStatistics.BytesUploaded` | `uploaded_size` | Amount of data uploaded | INTEGER | 0 |
| `Data.BackendStatistics.KnownFileSize` | `known_file_size` | Size of known files | INTEGER | 0 |
| `Data.BackendStatistics.LastBackupDate` | `last_backup_date` | Date of the last backup | DATETIME | NULL |
| `Data.BackendStatistics.BackupListCount` | `backup_list_count` | Number of backups in the list | INTEGER | 0 |
| `Data.BackendStatistics.ReportedQuotaError` | `reported_quota_error` | Whether a quota error was reported | BOOLEAN | 0 |
| `Data.BackendStatistics.ReportedQuotaWarning` | `reported_quota_warning` | Whether a quota warning was reported | BOOLEAN | 0 |
| `Data.BackendStatistics.MainOperation` | `backend_main_operation` | Backend operation type | TEXT | NULL |
| `Data.BackendStatistics.ParsedResult` | `backend_parsed_result` | Backend operation result | TEXT | NULL |
| `Data.BackendStatistics.Interrupted` | `backend_interrupted` | Whether backend operation was interrupted | BOOLEAN | 0 |
| `Data.BackendStatistics.Version` | `backend_version` | Backend version | TEXT | NULL |
| `Data.BackendStatistics.BeginTime` | `backend_begin_time` | Backend operation start time | DATETIME | NULL |
| `Data.BackendStatistics.Duration` | `backend_duration` | Backend operation duration | TEXT | NULL |
| `Data.BackendStatistics.WarningsActualLength` | `backend_warnings_actual_length` | Number of backend warnings | INTEGER | 0 |
| `Data.BackendStatistics.ErrorsActualLength` | `backend_errors_actual_length` | Number of backend errors | INTEGER | 0 |

#### Extra Information
| JSON Path | Database Column | Description | Type | Default |
|-----------|----------------|-------------|------|---------|
| `Extra.machine-id` | `machine_id` | Unique identifier for the machine | TEXT | - |
| `Extra.machine-name` | `machines.name` | Display name of the machine | TEXT | - |
| `Extra.backup-name` | `backup_name` | Name of the backup operation | TEXT | - |
| `Extra.backup-id` | `backup_id` | Duplicati backup identifier | TEXT | - |

#### Generated Fields
| Database Column | Description | Type | Generation Method |
|----------------|-------------|------|------------------|
| `id` | Unique identifier for the backup | TEXT | Generated UUID |
| `date` | When the backup was performed | DATETIME | Current timestamp |
| `status` | Backup status | TEXT | Derived from `parsed_result` |
| `warnings` | Number of warnings | INTEGER | Copied from `warnings_actual_length` |
| `errors` | Number of errors | INTEGER | Copied from `errors_actual_length` |
| `created_at` | Record creation timestamp | DATETIME | Current timestamp |
| `available_backups` | Available backup versions | TEXT (JSON) | Extracted from messages array |

### Example JSON to Database Insert

```json
{
  "Data": {
    "MainOperation": "Backup",
    "ParsedResult": "Success",
    "BeginTime": "2024-03-20T10:00:00Z",
    "EndTime": "2024-03-20T11:30:00Z",
    "Duration": "1h30m",
    "Version": "2.0.7.1",
    "Interrupted": false,
    "PartialBackup": false,
    "Dryrun": false,
    
    "LogLines": ["Starting backup...", "Backup completed successfully"],
    "Warnings": ["Some files were skipped"],
    "Errors": [],
    
    "DeletedFiles": 10,
    "DeletedFolders": 2,
    "ModifiedFiles": 50,
    "OpenedFiles": 1000,
    "AddedFiles": 25,
    "SizeOfModifiedFiles": 5000000,
    "SizeOfAddedFiles": 2500000,
    "SizeOfExaminedFiles": 1000000,
    "SizeOfOpenedFiles": 1000000,
    "NotProcessedFiles": 5,
    "AddedFolders": 3,
    "TooLargeFiles": 1,
    "FilesWithError": 2,
    "ModifiedFolders": 4,
    "ModifiedSymlinks": 1,
    "AddedSymlinks": 0,
    "DeletedSymlinks": 0,
    
    "BackendStatistics": {
      "BytesDownloaded": 100000,
      "BytesUploaded": 500000,
      "KnownFileSize": 1000000,
      "LastBackupDate": "2024-03-19T10:00:00Z",
      "BackupListCount": 10,
      "ReportedQuotaError": false,
      "ReportedQuotaWarning": false,
      "MainOperation": "Backup",
      "ParsedResult": "Success",
      "Interrupted": false,
      "Version": "2.0.7.1",
      "BeginTime": "2024-03-20T10:00:00Z",
      "Duration": "1h30m",
      "WarningsActualLength": 0,
      "ErrorsActualLength": 0
    },
    
    "WarningsActualLength": 0,
    "ErrorsActualLength": 0
  },
  "Extra": {
    "machine-id": "unique-machine-id",
    "machine-name": "Machine Name",
    "backup-name": "Backup Name",
    "backup-id": "unique-backup-id"
  }
}
```

This JSON would be processed in two steps:

1. First, insert/update the machine:
```sql
INSERT INTO machines (id, name, server_url)
VALUES ('unique-machine-id', 'Machine Name', '')
ON CONFLICT(id) DO UPDATE SET name = 'Machine Name';
```

2. Then, insert the backup record with all fields:
```sql
INSERT INTO backups (
    -- Generated fields
    id,                    -- Generated UUID
    date,                 -- Current timestamp
    status,               -- Derived from ParsedResult
    created_at,           -- Current timestamp
    
    -- Extra information
    machine_id,           -- 'unique-machine-id'
    backup_name,          -- 'Backup Name'
    backup_id,            -- 'unique-backup-id'
    
    -- Main operation data
    main_operation,       -- 'Backup'
    parsed_result,        -- 'Success'
    begin_time,           -- '2024-03-20T10:00:00Z'
    end_time,             -- '2024-03-20T11:30:00Z'
    duration_seconds,     -- 5400 (converted from '1h30m')
    version,              -- '2.0.7.1'
    interrupted,          -- 0
    partial_backup,       -- 0
    dryrun,               -- 0
    
    -- Message arrays
    messages_array,       -- '["Starting backup...", "Backup completed successfully"]'
    warnings_array,       -- '["Some files were skipped"]'
    errors_array,         -- '[]'
    available_backups,    -- '["v1", "v2", "v3"]' (extracted from messages)
    
    -- File operation statistics
    deleted_files,        -- 10
    deleted_folders,      -- 2
    modified_files,       -- 50
    opened_files,         -- 1000
    added_files,          -- 25
    size_of_modified_files, -- 5000000
    size_of_added_files,    -- 2500000
    size_of_examined_files, -- 1000000
    size_of_opened_files,   -- 1000000
    not_processed_files,    -- 5
    added_folders,          -- 3
    too_large_files,        -- 1
    files_with_error,       -- 2
    modified_folders,       -- 4
    modified_symlinks,      -- 1
    added_symlinks,         -- 0
    deleted_symlinks,       -- 0
    
    -- Backend statistics
    bytes_downloaded,        -- 100000
    uploaded_size,           -- 500000
    known_file_size,         -- 1000000
    last_backup_date,        -- '2024-03-19T10:00:00Z'
    backup_list_count,       -- 10
    reported_quota_error,    -- 0
    reported_quota_warning,  -- 0
    backend_main_operation,  -- 'Backup'
    backend_parsed_result,   -- 'Success'
    backend_interrupted,     -- 0
    backend_version,         -- '2.0.7.1'
    backend_begin_time,      -- '2024-03-20T10:00:00Z'
    backend_duration,        -- '1h30m'
    backend_warnings_actual_length, -- 0
    backend_errors_actual_length,   -- 0
    
    -- Warning and error counts
    warnings,                  -- 0 (from WarningsActualLength)
    errors,                    -- 0 (from ErrorsActualLength)
    warnings_actual_length,    -- 0
    errors_actual_length,      -- 0
    messages_actual_length     -- 2 (from LogLines length)
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
```

Note: The actual implementation includes data validation, type conversion, and error handling. Some fields may be optional in the API but required in the database (with default values). 

## Chart Metrics

The application provides visualization of backup metrics over time. The following metrics are available in the charts:

| Metric Key        | Database Column    | Description                            | Unit    |
|-------------------|--------------------|----------------------------------------|---------|
| `uploadedSize`    | `uploaded_size`    | Amount of data uploaded during backup  | Bytes   |
| `duration`        | `duration_seconds` | Duration of the backup operation       | Minutes |
| `fileCount`       | `examined_files`   | Number of files examined during backup | Count   |
| `fileSize`        | `size`             | Total size of files in the backup      | Bytes   |
| `storageSize`     | `known_file_size`  | Size of known files in storage         | Bytes   |
| `backupVersions`  | `backup_list_count`| Number of backup versions              | Count   |

These metrics are used in the chart visualization and can be configured in the application settings. The chart time range and metric selection are persisted in the browser's localStorage.

### Chart Data Functions

The application provides several functions for retrieving chart data:

```typescript
// Get aggregated chart data for all machines
getAggregatedChartData(): ChartDataPoint[]

// Get aggregated chart data with time range filtering
getAggregatedChartDataWithTimeRange(startDate: Date, endDate: Date): ChartDataPoint[]

// Get chart data for all machines (with machine IDs)
getAllMachinesChartData(): ChartDataPoint[]

// Get chart data for a specific machine
getMachineChartData(machineId: string): ChartDataPoint[]

// Get chart data for a specific machine with time range filtering
getMachineChartDataWithTimeRange(machineId: string, startDate: Date, endDate: Date): ChartDataPoint[]

// Get chart data for a specific machine and backup
getMachineBackupChartData(machineId: string, backupName: string): ChartDataPoint[]

// Get chart data for a specific machine and backup with time range filtering
getMachineBackupChartDataWithTimeRange(machineId: string, backupName: string, startDate: Date, endDate: Date): ChartDataPoint[]
```

### Chart Data Generation

The chart data is generated from the backups table using the following query:

```sql
WITH latest_backups_per_day AS (
  SELECT 
    DATE(date) as backup_date,
    machine_id,
    date,
    COALESCE(uploaded_size, 0) as uploaded_size,
    COALESCE(size, 0) as file_size,
    COALESCE(examined_files, 0) as file_count,
    COALESCE(known_file_size, 0) as storage_size,
    COALESCE(backup_list_count, 0) as backup_versions,
    duration_seconds,
    ROW_NUMBER() OVER (
      PARTITION BY machine_id, DATE(date) 
      ORDER BY date DESC
    ) as rn
  FROM backups
),
aggregated_by_date AS (
  SELECT 
    backup_date,
    MAX(date) as iso_date,
    SUM(uploaded_size) as total_uploaded_size,
    SUM(duration_seconds) as total_duration_seconds,
    SUM(file_count) as total_file_count,
    SUM(file_size) as total_file_size,
    SUM(storage_size) as total_storage_size,
    SUM(backup_versions) as total_backup_versions
  FROM latest_backups_per_day
  WHERE rn = 1
  GROUP BY backup_date
)
SELECT 
  strftime('%d/%m/%Y', backup_date) as date,
  iso_date as isoDate,
  total_uploaded_size as uploadedSize,
  CAST(total_duration_seconds / 60 AS INTEGER) as duration,
  total_file_count as fileCount,
  total_file_size as fileSize,
  total_storage_size as storageSize,
  total_backup_versions as backupVersions
FROM aggregated_by_date
ORDER BY backup_date
```

The data is then processed on the client side to:
1. Format dates for display
2. Filter based on the selected time range
3. Convert units (e.g., bytes to human-readable format)
4. Apply any necessary aggregations

## Configuration Management

The application uses the `configurations` table to store application settings. Configuration values are stored as JSON strings and can be retrieved using the following functions:

### Configuration Functions

```typescript
// Get configuration value
getConfiguration(key: string): string | null

// Set configuration value
setConfiguration(key: string, value: string): void

// Get cron service configuration
getCronConfig(): CronServiceConfig

// Set cron service configuration
setCronConfig(config: CronServiceConfig): void

// Get notification frequency configuration
getNotificationFrequencyConfig(): NotificationFrequencyConfig

// Set notification frequency configuration
setNotificationFrequencyConfig(value: NotificationFrequencyConfig): void

// Get overdue tolerance configuration
getOverdueToleranceConfig(): OverdueTolerance

// Set overdue tolerance configuration
setOverdueToleranceConfig(value: OverdueTolerance): void
```

### TypeScript Interfaces

```typescript
export type BackupStatus = "Success" | "Unknown" | "Warning" | "Error" | "Fatal";

export interface Backup {
  id: string;
  machine_id: string;
  name: string;
  date: string; // ISO string
  status: BackupStatus;
  warnings: number;
  errors: number;
  messages: number;
  fileCount: number;
  fileSize: number; // in bytes
  uploadedSize: number; // in bytes
  duration: string; // e.g., "30m 15s"
  duration_seconds: number; // raw duration in seconds
  durationInMinutes: number;
  knownFileSize: number;
  backup_list_count: number | null;
  messages_array: string | null;
  warnings_array: string | null;
  errors_array: string | null;
  available_backups: string[] | null;
}

export interface Machine {
  id: string;
  name: string;
  server_url: string;
  backups: Backup[];
  chartData: ChartDataPoint[];
}

export type NotificationEvent = 'all' | 'warnings' | 'errors' | 'off';

export interface BackupNotificationConfig {
  notificationEvent: NotificationEvent;
  expectedInterval: number;
  overdueBackupCheckEnabled: boolean;
  intervalUnit: 'hour' | 'day';
}

export type BackupKey = string; // Format: "machineName:backupName"

export interface NotificationTemplate {
  title: string;
  priority: string;
  tags: string;
  message: string;
}

export interface NotificationConfig {
  ntfy: NtfyConfig;
  backupSettings: Record<BackupKey, BackupNotificationConfig>;
  templates: {
    success: NotificationTemplate;
    warning: NotificationTemplate;
    overdueBackup: NotificationTemplate;
  };
  machineAddresses: MachineAddress[];
}

export type CronInterval = 'disabled' | '1min' | '5min'| '10min' | '15min' | '20min' | '30min' | '1hour' | '2hours';

export interface CronServiceConfig {
  port: number;
  tasks: {
    [taskName: string]: {
      cronExpression: string;
      enabled: boolean;
    };
  };
  notificationConfig?: NotificationConfig;
}

export type NotificationFrequencyConfig = "onetime" | "every_day" | "every_week" | "every_month";

export type OverdueTolerance = 'no_tolerance' | '5min' | '15min' | '30min' | '1h' | '2h' | '4h' | '6h' | '12h' | '1d';

export interface OverdueNotificationTimestamp {
  lastNotificationSent: string; // ISO timestamp
  lastBackupDate: string; // ISO timestamp of the backup that was current when notification was sent
}

export type OverdueNotifications = Record<BackupKey, OverdueNotificationTimestamp>;

export interface ChartDataPoint {
  date: string;
  isoDate: string;
  uploadedSize: number;
  duration: number;
  fileCount: number;
  fileSize: number;
  storageSize: number;
  backupVersions: number;
  machineId?: string;
  backupId?: string;
}

export interface MachineAddress {
  id: string;
  name: string;
  server_url: string;
}
```

### Common Configuration Keys

- `notifications`: JSON object containing notification settings including:
  - Ntfy configuration (URL, topic, authentication)
  - Notification events and schedules
  - Overdue backup settings
  - Notification frequency settings

- `backup_settings`: JSON object containing backup-specific settings including:
  - Per-backup configuration (keyed by `machine_name:backup_name`)
  - Expected backup intervals and units (hours/days)
  - Overdue backup check enabled/disabled flags
  - Notification events for each backup
  - Timeout and alert settings

- `cron_service`: JSON object containing cron service configuration including:
  - Service port settings
  - Task configurations (overdue-backup-check, etc.)
  - Cron expressions and enabled/disabled states
  - Service health check settings

- `overdue_backup_notifications`: JSON object tracking overdue backup notification history:
  - Per-backup notification timestamps (keyed by `machine_name:backup_name`)
  - Last notification sent timestamps
  - Last backup date when notification was sent
  - Used to prevent duplicate notifications

- `last_overdue_check`: String containing the timestamp of the last overdue backup check:
  - ISO timestamp format
  - Used to track when the cron service last ran
  - Helps with debugging and monitoring

- `notification_frequency`: String value controlling notification frequency:
  - Values: `"every_day"`, `"every_week"`, `"every_month"`, `"onetime"`
  - Controls how often overdue backup notifications are sent
  - Defaults to `"every_day"` if not set

### Configuration API Endpoints

- `GET /api/configuration`: Retrieve all configuration settings
- `POST /api/configuration`: Update configuration settings
- `GET /api/configuration/unified`: Retrieve unified configuration including cron settings, notification frequency, and machines with backups
- `POST /api/configuration/unified`: Update unified configuration

The configuration system provides a centralized way to manage application settings that persist across application restarts and can be modified through the web interface.

### Configuration Data Structures

#### Notifications Configuration (`notifications`)
```json
{
  "ntfy": {
    "url": string,
    "topic": string,
    "accessToken": string
  },
  "backupSettings": {
    "machine_name:backup_name": {
      "notificationEvent": "all" | "warnings" | "errors" | "off",
      "expectedInterval": number,
      "overdueBackupCheckEnabled": boolean,
      "intervalUnit": "hour" | "day"
    }
  },
  "templates": {
    "success": {
      "title": string,
      "priority": string,
      "tags": string,
      "message": string
    },
    "warning": {
      "title": string,
      "priority": string,
      "tags": string,
      "message": string
    },
    "overdueBackup": {
      "title": string,
      "priority": string,
      "tags": string,
      "message": string
    }
  },
  "machineAddresses": [
    {
      "id": string,
      "name": string,
      "server_url": string
    }
  ]
}
```

#### Backup Settings Configuration (`backup_settings`)
```json
{
  "machine_name:backup_name": {
    "notificationEvent": "all" | "warnings" | "errors" | "off",
    "expectedInterval": number,
    "overdueBackupCheckEnabled": boolean,
    "intervalUnit": "hour" | "day"
  }
}
```

#### Cron Service Configuration (`cron_service`)
```json
{
  "port": number,
  "tasks": {
    "overdue-backup-check": {
      "cronExpression": string,
      "enabled": boolean
    }
  }
}
```

#### Overdue Backup Notifications (`overdue_backup_notifications`)
```json
{
  "machine_name:backup_name": {
    "lastNotificationSent": "ISO-timestamp",
    "lastBackupDate": "ISO-timestamp"
  }
}
```

#### Overdue Tolerance Configuration (`overdue_tolerance`)
```json
"no_tolerance" | "5min" | "15min" | "30min" | "1h" | "2h" | "4h" | "6h" | "12h" | "1d"
```




## License

The project is licensed under the [Apache License 2.0](../LICENSE).   

**Copyright © 2025 Waldemar Scudeller Jr.**
