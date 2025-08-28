# API Endpoints

![](https://img.shields.io/badge/version-0.6.1-blue)

<br>


This document describes all available API endpoints for the DupliStatus application. The API follows RESTful principles and provides comprehensive backup monitoring, notification management, and system administration capabilities.

<br>

## API Structure

The API is organized into logical groups:
- **Core Operations**: Upload, retrieval, and management of backup data
- **Configuration**: Notification settings, backup preferences, and system configuration
- **Monitoring**: Health checks, status monitoring, and overdue backup tracking
- **Administration**: Database maintenance, cleanup operations, and system management

<br>

## Response Format

All API responses are returned in JSON format with consistent error handling patterns. Successful responses typically include a `status` field, while error responses include `error` and `message` fields.


<br>

---

<br>

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Core Operations](#core-operations)
  - [Upload Backup Data](#upload-backup-data)
  - [Get Latest Backup](#get-latest-backup)
  - [Get Latest Backups](#get-latest-backups)
  - [Get Overall Summary](#get-overall-summary)
  - [Get Machines Summary](#get-machines-summary)
  - [Get All Machines](#get-all-machines)
  - [Get Machines with Backups](#get-machines-with-backups)
  - [Get Machine Details](#get-machine-details)
  - [Get Machine Chart Data](#get-machine-chart-data)
  - [Get Machine Data with Overdue Info](#get-machine-data-with-overdue-info)
  - [Get Chart Data](#get-chart-data)
- [Configuration Management](#configuration-management)
  - [Get Configuration](#get-configuration)
  - [Update Notification Configuration](#update-notification-configuration)
  - [Update Backup Settings](#update-backup-settings)
  - [Update Notification Templates](#update-notification-templates)
  - [Update Overdue Tolerance](#update-overdue-tolerance)
- [Notification System](#notification-system)
  - [Test Notification](#test-notification)
  - [Test Template](#test-template)
  - [Check Overdue Backups](#check-overdue-backups)
  - [Clear Overdue Timestamps](#clear-overdue-timestamps)
  - [Resend Frequency Configuration](#resend-frequency-configuration)
- [Cron Service Management](#cron-service-management)
  - [Get Cron Configuration](#get-cron-configuration)
  - [Update Cron Configuration](#update-cron-configuration)
- [Monitoring & Health](#monitoring--health)
  - [Health Check](#health-check)
- [Administration](#administration)
  - [Collect Backups](#collect-backups)
  - [Cleanup Backups](#cleanup-backups)
  - [Delete Machine](#delete-machine)
- [Error Handling](#error-handling)
- [Data Type Notes](#data-type-notes)
  - [Message Arrays](#message-arrays)
  - [Available Backups](#available-backups)
  - [Duration Fields](#duration-fields)
  - [File Size Fields](#file-size-fields)
- [Authentication & Security](#authentication--security)
- [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

<br>

---

<br>

## Core Operations

### Upload Backup Data
- **Endpoint**: `/api/upload`
- **Method**: POST
- **Description**: Uploads backup operation data for a machine. Supports duplicate detection and sends notifications.
- **Request Body**: JSON sent by Duplicati with the following options:

  ```bash
  --send-http-url=http://my.local.server:9666/api/upload
  --send-http-result-output-format=Json
  --send-http-log-level=Information
  ```
  
- **Response**: 
  ```json
  {
    "success": true
  }
  ```

- **Error Responses**:
  - `400`: Missing required fields or invalid operation type
  - `409`: Duplicate backup data (ignored)
  - `500`: Server error processing backup data

<br>

### Get Latest Backup
- **Endpoint**: `/api/lastbackup/:machineId`
- **Method**: GET
- **Description**: Retrieves the latest backup information for a specific machine.
- **Parameters**:
  - `machineId`: the machine identifier (ID or name)

> [!NOTE]
> The machine identifier has to be URL Encoded.
  
- **Response**:
  ```json
  {
    "machine": {
      "id": "unique-machine-id",
      "name": "Machine Name",
      "backup_name": "Backup Name",
      "backup_id": "backup-id",
      "created_at": "2024-03-20T10:00:00Z"
    },
    "latest_backup": {
      "id": "backup-id",
      "machine_id": "unique-machine-id",
      "name": "Backup Name",
      "date": "2024-03-20T10:00:00Z",
      "status": "Success",
      "warnings": 0,
      "errors": 0,
      "messages": 150,
      "fileCount": 249426,
      "fileSize": 113395849938,
      "uploadedSize": 331318892,
      "duration": "00:38:31",
      "duration_seconds": 2311.6018052,
      "durationInMinutes": 38.52669675333333,
      "knownFileSize": 27203688543,
      "backup_list_count": 10,
      "messages_array": "[\"message1\", \"message2\"]",
      "warnings_array": "[\"warning1\"]",
      "errors_array": "[]",
      "available_backups": ["v1", "v2", "v3"]
    },
    "status": 200
  }
  ```

<br>

### Get Latest Backups
- **Endpoint**: `/api/lastbackups/:machineId`
- **Method**: GET
- **Description**: Retrieves the latest backup information for all configured backups (e.g. 'Files', 'Databases') on a specific machine.
- **Parameters**:
  - `machineId`: the machine identifier (ID or name)

> [!NOTE]
> The machine identifier has to be URL Encoded.
  
- **Response**:
  ```json
  {
    "machine": {
      "id": "unique-machine-id",
      "name": "Machine Name",
      "backup_name": "Default Backup",
      "backup_id": "backup-id",
      "created_at": "2024-03-20T10:00:00Z"
    },
    "latest_backups": [
      {
        "id": "backup1",
        "machine_id": "unique-machine-id",
        "name": "Files",
        "date": "2024-03-20T10:00:00Z",
        "status": "Success",
        "warnings": 0,
        "errors": 0,
        "messages": 150,
        "fileCount": 249426,
        "fileSize": 113395849938,
        "uploadedSize": 331318892,
        "duration": "00:38:31",
        "duration_seconds": 2311.6018052,
        "durationInMinutes": 38.52669675333333,
        "knownFileSize": 27203688543,
        "backup_list_count": 10,
        "messages_array": "[\"message1\", \"message2\"]",
        "warnings_array": "[\"warning1\"]",
        "errors_array": "[]",
        "available_backups": ["v1", "v2", "v3"]
      },
      {
        "id": "backup2",
        "machine_id": "unique-machine-id",
        "name": "Databases",
        "date": "2024-03-20T11:00:00Z",
        "status": "Success",
        "warnings": 1,
        "errors": 0,
        "messages": 75,
        "fileCount": 125000,
        "fileSize": 56789012345,
        "uploadedSize": 123456789,
        "duration": "00:25:15",
        "duration_seconds": 1515.1234567,
        "durationInMinutes": 25.25205761166667,
        "knownFileSize": 12345678901,
        "backup_list_count": 5,
        "messages_array": "[\"message1\"]",
        "warnings_array": "[\"warning1\"]",
        "errors_array": "[]",
        "available_backups": ["v1", "v2"]
      }
    ],
    "backup_types_count": 2,
    "backup_names": ["Files", "Databases"],
    "status": 200
  }
  ```

> [!NOTE]
> This endpoint returns the latest backup for each backup (backup_name) that the machine has, unlike `/api/lastbackup/:machineId` which returns only the single most recent backup.

<br>

### Get Overall Summary
- **Endpoint**: `/api/summary`
- **Method**: GET
- **Description**: Retrieves a summary of all backup operations across all machines.
- **Response**:
  ```json
  {
    "totalMachines": 3,
    "totalBackups": 9,
    "totalUploadedSize": 2397229507,
    "totalStorageUsed": 43346796938,
    "totalBackupSize": 126089687807,
    "overdueBackupsCount": 2,
    "secondsSinceLastBackup": 7200
  }
  ```

> [!NOTE]
>    In version 0.5.0, the field `totalBackupedSize` was replaced by `totalBackupSize`.
>    The field `overdueBackupsCount` shows the number of currently overdue backups.
>    The field `secondsSinceLastBackup` shows the time in seconds since the last backup across all machines.

<br>

### Get Machines Summary
- **Endpoint**: `/api/machines-summary`
- **Method**: GET
- **Description**: Retrieves a summary of all machines with their latest backup information and overdue status.
- **Response**:
  ```json
  [
    {
      "id": "machine-id",
      "name": "Machine Name",
      "lastBackupDate": "2024-03-20T10:00:00Z",
      "lastBackupStatus": "Success",
      "lastBackupDuration": "00:38:31",
      "lastBackupListCount": 10,
      "lastBackupName": "Backup Name",
      "lastBackupId": "backup-id",
      "backupCount": 15,
      "totalWarnings": 5,
      "totalErrors": 0,
      "availableBackups": ["v1", "v2", "v3"],
      "isBackupOverdue": false,
      "notificationEvent": "all",
      "expectedBackupDate": "2024-03-21T10:00:00Z",
      "expectedBackupElapsed": "2 hours ago",
      "lastOverdueCheck": "2024-03-20T12:00:00Z",
      "lastNotificationSent": "N/A"
    }
  ]
  ```

<br>

### Get All Machines
- **Endpoint**: `/api/machines`
- **Method**: GET
- **Description**: Retrieves a list of all machines with their basic information.
- **Response**:
  ```json
  [
    {
      "id": "machine-id",
      "name": "Machine Name"
    }
  ]
  ```

<br>

### Get Machines with Backups
- **Endpoint**: `/api/machines-with-backups`
- **Method**: GET
- **Description**: Retrieves a list of all machines with their backup names.
- **Response**:
  ```json
  [
    {
      "id": "machine-id",
      "name": "Machine Name",
      "backupName": "Backup Name"
    }
  ]
  ```

<br>

### Get Machine Details
- **Endpoint**: `/api/machines/:id`
- **Method**: GET
- **Description**: Retrieves detailed information about a specific machine including all its backups and chart data.
- **Parameters**:
  - `id`: the machine identifier

- **Response**:
  ```json
  {
    "id": "machine-id",
    "name": "Machine Name",
    "backups": [
      {
        "id": "backup-id",
        "machine_id": "machine-id",
        "name": "Backup Name",
        "date": "2024-03-20T10:00:00Z",
        "status": "Success",
        "warnings": 0,
        "errors": 0,
        "messages": 150,
        "fileCount": 249426,
        "fileSize": 113395849938,
        "uploadedSize": 331318892,
        "duration": "00:38:31",
        "duration_seconds": 2311,
        "durationInMinutes": 38,
        "knownFileSize": 27203688543,
        "backup_list_count": 10,
        "messages_array": "[\"message1\", \"message2\"]",
        "warnings_array": "[\"warning1\"]",
        "errors_array": "[]",
        "available_backups": ["v1", "v2", "v3"]
      }
    ],
    "chartData": [
      {
        "date": "20/03/2024",
        "isoDate": "2024-03-20T10:00:00Z",
        "uploadedSize": 331318892,
        "duration": 38,
        "fileCount": 249426,
        "fileSize": 113395849938,
        "storageSize": 27203688543,
        "backupVersions": 10
      }
    ]
  }
  ```

<br>



### Get Machine Data with Overdue Info
- **Endpoint**: `/api/detail/:machineId`
- **Method**: GET
- **Description**: Retrieves detailed machine information including overdue backup status.
- **Parameters**:
  - `machineId`: the machine identifier

- **Response**:
  ```json
  {
    "machine": {
      "id": "machine-id",
      "name": "Machine Name",
      "backups": [...]
    },
    "overdueBackups": [
      {
        "machineName": "Machine Name",
        "backupName": "Backup Name",
        "lastBackupDate": "2024-03-20T10:00:00Z",
        "lastNotificationSent": "2024-03-20T12:00:00Z",
        "notificationEvent": "all",
        "expectedBackupDate": "2024-03-21T10:00:00Z",
        "expectedBackupElapsed": "2 hours ago"
      }
    ],
    "lastOverdueCheck": "2024-03-20T12:00:00Z"
  }
  ```

<br>

### Get Chart Data
- **Endpoint**: `/api/chart-data`
- **Method**: GET
- **Description**: Retrieves aggregated chart data for all machines over time.
- **Response**:
  ```json
  [
    {
      "date": "20/03/2024",
      "isoDate": "2024-03-20T10:00:00Z",
      "uploadedSize": 331318892,
      "duration": 38,
      "fileCount": 249426,
      "fileSize": 113395849938,
      "storageSize": 27203688543,
      "backupVersions": 10
    }
  ]
  ```

<br>

## Configuration Management

### Get Configuration
- **Endpoint**: `/api/configuration`
- **Method**: GET
- **Description**: Retrieves the current notification and backup settings configuration.
- **Response**:
  ```json
  {
    "ntfy": {
      "url": "https://ntfy.sh",
      "topic": "duplistatus-notifications",
      "accessToken": ""
    },
    "backupSettings": {
      "Machine Name:Backup Name": {
        "notificationEvent": "all",
        "expectedInterval": 24,
        "overdueBackupCheckEnabled": true,
        "intervalUnit": "hours"
      }
    },
    "templates": {
      "success": {
        "title": "✅ {status} - {backup_name} @ {machine_name}",
        "message": "Backup {backup_name} on {machine_name} completed with status '{status}' at {backup_date} in {duration}.",
        "priority": "default",
        "tags": "duplicati, duplistatus, success"
      },
      "warning": {
        "title": "⚠️ {status} - {backup_name} @ {machine_name}",
        "message": "Backup {backup_name} on {machine_name} completed with status '{status}' at {backup_date}.",
        "priority": "high",
        "tags": "duplicati, duplistatus, warning, error"
      },
      "overdueBackup": {
        "title": "🕑 Overdue - {backup_name} @ {machine_name}",
        "message": "The backup {backup_name} is overdue on {machine_name}.",
        "priority": "default",
        "tags": "duplicati, duplistatus, overdue"
      }
    },
    "overdue_tolerance": "1h"
  }
  ```

### Update Notification Configuration
- **Endpoint**: `/api/configuration/notifications`
- **Method**: POST
- **Description**: Updates the notification configuration (ntfy settings).
- **Request Body**:
  ```json
  {
    "ntfy": {
      "enabled": true,
      "url": "https://ntfy.sh",
      "topic": "duplistatus-notifications",
      "username": "",
      "password": ""
    }
  }
  ```
- **Response**:
  ```json
  {
    "message": "Notification config updated successfully",
    "ntfy": {
      "enabled": true,
      "url": "https://ntfy.sh",
      "topic": "duplistatus-notifications",
      "username": "",
      "password": ""
    }
  }
  ```

### Update Backup Settings
- **Endpoint**: `/api/configuration/backup-settings`
- **Method**: POST
- **Description**: Updates the backup notification settings for specific machines/backups.
- **Request Body**:
  ```json
  {
    "backupSettings": {
      "Machine Name:Backup Name": {
        "notificationEvent": "all",
        "expectedInterval": 24,
        "overdueBackupCheckEnabled": true,
        "intervalUnit": "hours"
      }
    }
  }
  ```
- **Response**:
  ```json
  {
    "message": "Backup settings updated successfully"
  }
  ```

### Update Notification Templates
- **Endpoint**: `/api/configuration/templates`
- **Method**: POST
- **Description**: Updates the notification templates.
- **Request Body**:
  ```json
  {
    "templates": {
      "success": {
        "title": "✅ {status} - {backup_name} @ {machine_name}",
        "message": "Backup {backup_name} on {machine_name} completed with status '{status}' at {backup_date} in {duration}.",
        "priority": "default",
        "tags": "duplicati, duplistatus, success"
      }
    }
  }
  ```
- **Response**:
  ```json
  {
    "message": "Notification templates updated successfully"
  }
  ```

### Update Overdue Tolerance
- **Endpoint**: `/api/configuration/overdue-tolerance`
- **Method**: POST
- **Description**: Updates the overdue tolerance setting (in hours).
- **Request Body**:
  ```json
  {
    "overdue_tolerance": 2
  }
  ```
- **Response**:
  ```json
  {
    "message": "Overdue tolerance updated successfully"
  }
  ```

<br>

## Notification System

### Test Notification
- **Endpoint**: `/api/notifications/test`
- **Method**: POST
- **Description**: Sends a test notification using the provided ntfy configuration.
- **Request Body**:
  ```json
  {
    "ntfyConfig": {
      "url": "https://ntfy.sh",
      "topic": "test-topic"
    }
  }
  ```
- **Response**:
  ```json
  {
    "message": "Test notification sent successfully"
  }
  ```

### Test Template
- **Endpoint**: `/api/notifications/test-template`
- **Method**: POST
- **Description**: Tests a notification template with sample data.
- **Request Body**:
  ```json
  {
    "template": {
      "title": "Test Title",
      "message": "Test message with {variable}",
      "priority": "default",
      "tags": "test"
    },
    "ntfyConfig": {
      "url": "https://ntfy.sh",
      "topic": "test-topic"
    }
  }
  ```
- **Response**:
  ```json
  {
    "success": true
  }
  ```

### Check Overdue Backups
- **Endpoint**: `/api/notifications/check-overdue`
- **Method**: POST
- **Description**: Manually triggers the overdue backup check and sends notifications.
- **Response**:
  ```json
  {
    "message": "Overdue backup check completed",
    "statistics": {
      "totalBackupConfigs": 5,
      "checkedBackups": 5,
      "overdueBackupsFound": 2,
      "notificationsSent": 2
    }
  }
  ```

### Clear Overdue Timestamps
- **Endpoint**: `/api/notifications/clear-overdue-timestamps`
- **Method**: POST
- **Description**: Clears all overdue backup notification timestamps, allowing notifications to be sent again.
- **Response**:
  ```json
  {
    "message": "Overdue backup notification timestamps cleared successfully"
  }
  ```

### Resend Frequency Configuration
- **Endpoint**: `/api/notifications/resend-frequency`
- **Method**: GET
- **Description**: Retrieves the current notification frequency configuration.
- **Response**:
  ```json
  {
    "value": "every_day"
  }
  ```

- **Method**: POST
- **Description**: Updates the notification frequency configuration.
- **Request Body**:
  ```json
  {
    "value": "every_week"
  }
  ```
- **Available Values**: `"onetime"`, `"every_day"`, `"every_week"`, `"every_month"`

<br>

## Cron Service Management

### Get Cron Configuration
- **Endpoint**: `/api/cron-config`
- **Method**: GET
- **Description**: Retrieves the current cron service configuration.
- **Response**:
  ```json
  {
    "cronExpression": "*/20 * * * *",
    "enabled": true
  }
  ```

### Update Cron Configuration
- **Endpoint**: `/api/cron-config`
- **Method**: POST
- **Description**: Updates the cron service configuration.
- **Request Body**:
  ```json
  {
    "interval": "20min"
  }
  ```
- **Available Intervals**: `"disabled"`, `"1min"`, `"5min"`, `"10min"`, `"15min"`, `"20min"`, `"30min"`, `"1hour"`, `"2hours"`

<br>

## Monitoring & Health



### Health Check
- **Endpoint**: `/api/health`
- **Method**: GET
- **Description**: Checks the health status of the application and database.
- **Response**:
  ```json
  {
    "status": "healthy",
    "database": "connected",
    "basicConnection": true,
    "tablesFound": 2,
    "tables": [
      "machines",
      "backups"
    ],
    "preparedStatements": true,
    "timestamp": "2024-03-20T10:00:00Z"
  }
  ```

- **Error Response** (503):
  ```json
  {
    "status": "unhealthy",
    "error": "Database connection failed",
    "message": "Connection timeout",
    "stack": "Error: Connection timeout\n    at...",
    "timestamp": "2024-03-20T10:00:00Z"
  }
  ```

<br>

## Administration

### Collect Backups
- **Endpoint**: `/api/backups/collect`
- **Method**: POST
- **Description**: Collects backup data directly from a Duplicati server via its API. This endpoint connects to the Duplicati server, retrieves backup information, and processes it into the local database.
- **Request Body**:
  ```json
  {
    "hostname": "duplicati-server.local",
    "port": 8200,
    "password": "your-password",
    "protocol": "http",
    "allowSelfSigned": false
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "machineName": "Machine Name",
    "stats": {
      "processed": 5,
      "skipped": 2,
      "errors": 0
    },
    "backupSettings": {
      "added": 2,
      "total": 7
    }
  }
  ```
- **Error Responses**:
  - `400`: Invalid request parameters or connection failed
  - `500`: Server error during backup collection
- **Notes**: 
  - The endpoint supports both HTTP and HTTPS protocols
  - Self-signed certificates can be allowed with `allowSelfSigned: true`
  - Connection timeouts are configurable via environment variables

<br>

### Cleanup Backups
- **Endpoint**: `/api/backups/cleanup`
- **Method**: POST
- **Description**: Deletes old backup data based on retention period. This endpoint helps manage database size by removing outdated backup records while preserving recent and important data.
- **Request Body**:
  ```json
  {
    "retentionPeriod": "6 months"
  }
  ```
- **Retention Periods**: `"6 months"`, `"1 year"`, `"2 years"`, `"Delete all data"`
- **Response**:
  ```json
  {
    "message": "Successfully deleted 15 old backups",
    "status": 200
  }
  ```
- **Error Responses**:
  - `400`: Invalid retention period specified
  - `500`: Server error during cleanup operation
- **Notes**: 
  - The cleanup operation is irreversible
  - Backup data is permanently deleted from the database
  - Machine records are preserved even if all backups are deleted
  - When "Delete all data" is selected, all machines and backups are removed and configuration is cleared

<br>

### Delete Machine
- **Endpoint**: `/api/machines/:id`
- **Method**: DELETE
- **Description**: Deletes a machine and all its associated backups.
- **Parameters**:
  - `id`: the machine identifier

- **Response**:
  ```json
  {
    "message": "Successfully deleted machine and 15 backups",
    "status": 200,
    "changes": {
      "backupChanges": 15,
      "machineChanges": 1
    }
  }
  ```
- **Error Responses**:
  - `400`: Invalid machine ID
  - `404`: Machine not found
  - `500`: Server error during deletion
- **Notes**: 
  - This operation is irreversible
  - All backup data associated with the machine will be permanently deleted
  - The machine record itself will also be removed

<br>

## Error Handling

All endpoints follow a consistent error handling pattern:

- **400 Bad Request**: Invalid request data or missing required fields
- **409 Conflict**: Duplicate data (for upload endpoints)
- **500 Internal Server Error**: Server-side errors with detailed error messages
- **503 Service Unavailable**: Health check failures or database connection issues

Error responses include:
- `error`: Human-readable error message
- `message`: Technical error details (in development mode)
- `stack`: Error stack trace (in development mode)
- `timestamp`: When the error occurred

<br>

## Data Type Notes

### Message Arrays
The `messages_array`, `warnings_array`, and `errors_array` fields are stored as JSON strings in the database and returned as parsed arrays in the API responses. These contain the actual log messages, warnings, and errors from Duplicati backup operations.

<br>

### Available Backups
The `available_backups` field contains an array of backup version timestamps (in ISO format) that are available for restoration. This is extracted from the backup log messages.

<br>

### Duration Fields
- `duration`: Human-readable format (e.g., "00:38:31")
- `duration_seconds`: Raw duration in seconds
- `durationInMinutes`: Duration converted to minutes for charting purposes

<br>

### File Size Fields
All file size fields are returned in bytes as numbers, not formatted strings. The frontend is responsible for converting these to human-readable formats (KB, MB, GB, etc.).

<br>

## Authentication & Security

Currently, the API does not require authentication for local network access. It's designed for internal network use where the application is deployed. 

<br>

> [!CAUTION]
>  Don't expose the **duplistatus** server to the public internet. Use it in a secure network 
> (e.g., local LAN protected by a firewall).
>
> Exposing the **duplistatus** interface to the public
>  internet without proper security measures could lead to unauthorized access.


<br>


## License

The project is licensed under the [Apache License 2.0](../LICENSE).   

**Copyright © 2025 Waldemar Scudeller Jr.**
