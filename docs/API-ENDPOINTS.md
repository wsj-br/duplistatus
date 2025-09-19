
![duplistatus](img/duplistatus_banner.png)


# API Endpoints

![](https://img.shields.io/badge/version-0.7.27-blue)

<br>


This document describes all available API endpoints for the duplistatus application. The API follows RESTful principles and provides comprehensive backup monitoring, notification management, and system administration capabilities.

<br>

## API Structure

The API is organised into logical groups:
- **Core Operations**: Upload, retrieval, and management of backup data
- **Configuration**: Notification settings, backup preferences, and system configuration
- **Monitoring**: Health checks, status monitoring, and overdue backup tracking
- **Administration**: Database maintenance, cleanup operations, and system management
- **Chart Data**: Time-series data for visualisation and analytics

<br>

## Response Format

All API responses are returned in JSON format with consistent error handling patterns. Successful responses typically include a `status` field, while error responses include `error` and `message` fields.


<br>

---

<br>

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [External APIs](#external-apis)
  - [Get Overall Summary - `/api/summary`](#get-overall-summary---apisummary)
  - [Get Latest Backup - `/api/lastbackup/:serverId`](#get-latest-backup---apilastbackupserverid)
  - [Get Latest Backups - `/api/lastbackups/:serverId`](#get-latest-backups---apilastbackupsserverid)
  - [Upload Backup Data - `/api/upload`](#upload-backup-data---apiupload)
- [Core Operations](#core-operations)
  - [Get Dashboard Data (Consolidated) - `/api/dashboard`](#get-dashboard-data-consolidated---apidashboard)
  - [Get All Servers - `/api/servers`](#get-all-servers---apiservers)
  - [Get Server Details - `/api/servers/:id`](#get-server-details---apiserversid)
  - [Update Server - `/api/servers/:id`](#update-server---apiserversid)
  - [Delete Server - `/api/servers/:id`](#delete-server---apiserversid)
  - [Get Server Data with Overdue Info - `/api/detail/:serverId`](#get-server-data-with-overdue-info---apidetailserverid)
- [Chart Data](#chart-data)
  - [Get Aggregated Chart Data - `/api/chart-data/aggregated`](#get-aggregated-chart-data---apichart-dataaggregated)
  - [Get Server Chart Data - `/api/chart-data/server/:serverId`](#get-server-chart-data---apichart-dataserverserverid)
  - [Get Server Backup Chart Data - `/api/chart-data/server/:serverId/backup/:backupName`](#get-server-backup-chart-data---apichart-dataserverserveridbackupbackupname)
- [Configuration Management](#configuration-management)
  - [Get Unified Configuration - `/api/configuration/unified`](#get-unified-configuration---apiconfigurationunified)
  - [Get NTFY Configuration - `/api/configuration/ntfy`](#get-ntfy-configuration---apiconfigurationntfy)
  - [Update Notification Configuration - `/api/configuration/notifications`](#update-notification-configuration---apiconfigurationnotifications)
  - [Update Backup Settings - `/api/configuration/backup-settings`](#update-backup-settings---apiconfigurationbackup-settings)
  - [Update Notification Templates - `/api/configuration/templates`](#update-notification-templates---apiconfigurationtemplates)
  - [Update Overdue Tolerance - `/api/configuration/overdue-tolerance`](#update-overdue-tolerance---apiconfigurationoverdue-tolerance)
- [Notification System](#notification-system)
  - [Test Notification - `/api/notifications/test`](#test-notification---apinotificationstest)
  - [Check Overdue Backups - `/api/notifications/check-overdue`](#check-overdue-backups---apinotificationscheck-overdue)
  - [Clear Overdue Timestamps - `/api/notifications/clear-overdue-timestamps`](#clear-overdue-timestamps---apinotificationsclear-overdue-timestamps)
- [Cron Service Management](#cron-service-management)
  - [Get Cron Configuration - `/api/cron-config`](#get-cron-configuration---apicron-config)
  - [Update Cron Configuration - `/api/cron-config`](#update-cron-configuration---apicron-config)
  - [Cron Service Proxy - `/api/cron/*`](#cron-service-proxy---apicron)
- [Monitoring & Health](#monitoring--health)
  - [Health Check - `/api/health`](#health-check---apihealth)
- [Administration](#administration)
  - [Collect Backups - `/api/backups/collect`](#collect-backups---apibackupscollect)
  - [Cleanup Backups - `/api/backups/cleanup`](#cleanup-backups---apibackupscleanup)
  - [Delete Backup - `/api/backups/:backupId`](#delete-backup---apibackupsbackupid)
  - [Delete Backup Job - `/api/backups/delete-job`](#delete-backup-job---apibackupsdelete-job)
  - [Test Server Connection - `/api/servers/test-connection`](#test-server-connection---apiserverstest-connection)
  - [Get Server URL - `/api/servers/:serverId/server-url`](#get-server-url---apiserversserveridserver-url)
  - [Update Server URL - `/api/servers/:serverId/server-url`](#update-server-url---apiserversserveridserver-url)
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

## External APIs

These endpoints are designed for use by other applications and integrations, for instance [Homepage](USER-GUIDE#homepage-integration-optional).

<br>

### Get Overall Summary - `/api/summary`
- **Endpoint**: `/api/summary`
- **Method**: GET
- **Description**: Retrieves a summary of all backup operations across all servers. This endpoint is maintained for external applications and backward compatibility.
- **Response**:
  ```json
  {
    "totalServers": 3,
    "totalBackups": 9,
    "totalUploadedSize": 2397229507,
    "totalStorageUsed": 43346796938,
    "totalBackupSize": 126089687807,
    "overdueBackupsCount": 2,
    "secondsSinceLastBackup": 7200
  }
  ```
- **Error Responses**:
  - `500`: Server error fetching summary data
- **Notes**:
  - In version 0.5.0, the field `totalBackupedSize` was replaced by `totalBackupSize`
  - In version 0.7.x, the field `totalMachines` was replaced by `totalServers`
  - The field `overdueBackupsCount` shows the number of currently overdue backups
  - The field `secondsSinceLastBackup` shows the time in seconds since the last backup across all servers
  - Returns fallback response with zeros if data fetching fails
  - **Note**: For internal dashboard use, consider using `/api/dashboard` which includes this data plus additional information

<br>

### Get Latest Backup - `/api/lastbackup/:serverId`
- **Endpoint**: `/api/lastbackup/:serverId`
- **Method**: GET
- **Description**: Retrieves the latest backup information for a specific server.
- **Parameters**:
  - `serverId`: the server identifier (ID or name)

> [!NOTE]
> The server identifier has to be URL Encoded.
  
- **Response**:
  ```json
  {
    "server": {
      "id": "unique-server-id",
      "name": "Server Name",
      "backup_name": "Backup Name",
      "backup_id": "backup-id",
      "created_at": "2024-03-20T10:00:00Z"
    },
    "latest_backup": {
      "id": "backup-id",
      "server_id": "unique-server-id",
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
- **Error Responses**:
  - `404`: Server not found
  - `500`: Internal server error
- **Notes**:
  - In version 0.7.x, the response object key changed from `machine` to `server`
  - Server identifier can be either ID or name
  - Returns null for latest_backup if no backups exist
  - Includes cache control headers to prevent caching

<br>

### Get Latest Backups - `/api/lastbackups/:serverId`
- **Endpoint**: `/api/lastbackups/:serverId`
- **Method**: GET
- **Description**: Retrieves the latest backup information for all configured backups (e.g. 'Files', 'Databases') on a specific server.
- **Parameters**:
  - `serverId`: the server identifier (ID or name)

> [!NOTE]
> The server identifier has to be URL Encoded.
  
- **Response**:
  ```json
  {
    "server": {
      "id": "unique-server-id",
      "name": "Server Name",
      "backup_name": "Default Backup",
      "backup_id": "backup-id",
      "created_at": "2024-03-20T10:00:00Z"
    },
    "latest_backups": [
      {
        "id": "backup1",
        "server_id": "unique-server-id",
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
        "server_id": "unique-server-id",
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
    "backup_jobs_count": 2,
    "backup_names": ["Files", "Databases"],
    "status": 200
  }
  ```
- **Error Responses**:
  - `404`: Server not found
  - `500`: Internal server error
- **Notes**:
  - In version 0.7.x, the response object key changed from `machine` to `server`, and the field `backup_types_count` was renamed to `backup_jobs_count`
  - Server identifier can be either ID or name
  - Returns latest backup for each backup job (backup_name) that the server has
  - Unlike `/api/lastbackup/:serverId` which returns only the single most recent backup of the server (independ of backup job)
  - Includes cache control headers to prevent caching

<br>

### Upload Backup Data - `/api/upload`
- **Endpoint**: `/api/upload`
- **Method**: POST
- **Description**: Uploads backup operation data for a server. Supports duplicate backup run detection and sends notifications.
- **Request Body**: JSON sent by Duplicati with the following options:

  ```bash
  --send-http-url=http://my.local.server:8666/api/upload
  --send-http-result-output-format=Json
  --send-http-log-level=Information
  ```
  
- **Response**: 
  ```json
  {
    "success": true
  }
  ```
<br>

---

<br>

## Core Operations



<br>

### Get Dashboard Data (Consolidated) - `/api/dashboard`
- **Endpoint**: `/api/dashboard`
- **Method**: GET
- **Description**: Retrieves all dashboard data in a single consolidated response, including server summaries, overall summary, and chart data.
- **Response**:
  ```json
  {
    "serversSummary": [
      {
        "id": "server-id",
        "name": "Server Name",
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
    ],
    "overallSummary": {
      "totalServers": 3,
      "totalBackups": 9,
      "totalUploadedSize": 2397229507,
      "totalStorageUsed": 43346796938,
      "totalBackupSize": 126089687807,
      "overdueBackupsCount": 2,
      "secondsSinceLastBackup": 7200
    },
    "chartData": [
      {
        "date": "20/03/2024",
        "isoDate": "2024-03-20T10:00:00Z",
        "uploadedSize": 1024000,
        "duration": 45,
        "fileCount": 1500,
        "fileSize": 2048000,
        "storageSize": 3072000,
        "backupVersions": 5
      }
    ]
  }
  ```
- **Error Responses**:
  - `500`: Server error fetching dashboard data
- **Notes**:
  - This endpoint consolidates the previous `/api/servers-summary` and `/api/chart-data/aggregated` endpoints
  - The `overallSummary` field contains the same data as `/api/summary` (which is maintained for external applications)
  - Provides better performance by reducing multiple API calls to a single request
  - All data is fetched in parallel for optimal performance
  - The `secondsSinceLastBackup` field shows the time in seconds since the last backup across all servers

<br>

### Get All Servers - `/api/servers`
- **Endpoint**: `/api/servers`
- **Method**: GET
- **Description**: Retrieves a list of all servers with their basic information. Optionally includes backup information.
- **Query Parameters**:
  - `includeBackups` (optional): Set to `true` to include backup information for each server
- **Response** (without parameters):
  ```json
  [
    {
      "id": "server-id",
      "name": "Server Name",
      "alias": "Server Alias",
      "note": "Additional notes about the server"
    }
  ]
  ```
- **Response** (with `includeBackups=true`):
  ```json
  [
    {
      "id": "server-id",
      "name": "Server Name",
      "backupName": "Backup Name",
      "server_url": "http://localhost:8200",
      "alias": "Server Alias",
      "note": "Additional notes about the server"
    }
  ]
  ```
- **Error Responses**:
  - `500`: Server error fetching servers
- **Notes**:
  - Returns server information including alias and note fields
  - When `includeBackups=true`, returns server-backup combinations with URLs
  - Consolidates the previous `/api/servers-with-backups` functionality
  - Used for server selection, display, and configuration purposes

<br>

### Get Server Details - `/api/servers/:id`
- **Endpoint**: `/api/servers/:id`
- **Method**: GET
- **Description**: Retrieves information about a specific server. Can return basic server info or detailed information including backups and chart data.
- **Parameters**:
  - `id`: the server identifier
- **Query Parameters**:
  - `includeBackups` (optional): Set to `true` to include backup data
  - `includeChartData` (optional): Set to `true` to include chart data
- **Response** (without parameters):
  ```json
  {
    "id": "server-id",
    "name": "Server Name",
    "alias": "Server Alias",
    "note": "Additional notes about the server",
    "server_url": "http://localhost:8200"
  }
  ```
- **Response** (with parameters):
  ```json
  {
    "id": "server-id",
    "name": "Server Name",
    "alias": "Server Alias",
    "note": "Additional notes about the server",
    "server_url": "http://localhost:8200",
    "backups": [
      {
        "id": "backup-id",
        "name": "Backup Name",
        "date": "2024-03-20T10:00:00Z",
        "status": "Success",
        "warnings": 0,
        "errors": 0,
        "fileCount": 1500,
        "fileSize": 2048000,
        "uploadedSize": 1024000,
        "duration": "00:45:30"
      }
    ],
    "chartData": [
      {
        "date": "20/03/2024",
        "isoDate": "2024-03-20T10:00:00Z",
        "uploadedSize": 1024000,
        "duration": 45,
        "fileCount": 1500,
        "fileSize": 2048000,
        "storageSize": 3072000,
        "backupVersions": 5
      }
    ]
  }
  ```
- **Error Responses**:
  - `404`: Server not found
  - `500`: Server error fetching server details
- **Notes**:
  - Returns basic server information by default for better performance
  - Use query parameters to include additional data when needed
  - Optimized for different use cases (settings vs detail views)

<br>

### Update Server - `/api/servers/:id`
- **Endpoint**: `/api/servers/:id`
- **Method**: PATCH
- **Description**: Updates server details including alias, note, and server URL.
- **Parameters**:
  - `id`: the server identifier
- **Request Body**:
  ```json
  {
    "server_url": "http://localhost:8200",
    "alias": "Server Alias",
    "note": "Additional notes about the server"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Server updated successfully",
    "serverId": "server-id",
    "server_url": "http://localhost:8200",
    "alias": "Server Alias",
    "note": "Additional notes about the server"
  }
  ```
- **Error Responses**:
  - `404`: Server not found
  - `500`: Server error during update
- **Notes**:
  - Updates server alias, note, and server URL
  - All fields are optional
  - Empty strings are allowed for all fields

### Delete Server - `/api/servers/:id`
- **Endpoint**: `/api/servers/:id`
- **Method**: DELETE
- **Description**: Deletes a server and all its associated backups.
- **Parameters**:
  - `id`: the server identifier

- **Response**:
  ```json
  {
    "message": "Successfully deleted server and 15 backups",
    "status": 200,
    "changes": {
      "backupChanges": 15,
      "serverChanges": 1
    }
  }
  ```
- **Error Responses**:
  - `404`: Server not found
  - `500`: Server error during deletion
- **Notes**: 
  - This operation is irreversible
  - All backup data associated with the server will be permanently deleted
  - The server record itself will also be removed
  - Returns count of deleted backups and servers

<br>

### Get Server Data with Overdue Info - `/api/detail/:serverId`
- **Endpoint**: `/api/detail/:serverId`
- **Method**: GET
- **Description**: Retrieves detailed server information including overdue backup status.
- **Parameters**:
  - `serverId`: the server identifier

- **Response**:
  ```json
  {
    "server": {
      "id": "server-id",
      "name": "Server Name",
      "backups": [...]
    },
    "overdueBackups": [
      {
        "serverName": "Server Name",
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
- **Error Responses**:
  - `404`: Server not found
  - `500`: Server error fetching server details
- **Notes**:
  - Returns server data with overdue backup information
  - Includes overdue backup details and timestamps
  - Used for overdue backup management and monitoring

<br>

## Chart Data

<br>

### Get Aggregated Chart Data - `/api/chart-data/aggregated`
- **Endpoint**: `/api/chart-data/aggregated`
- **Method**: GET
- **Description**: Retrieves aggregated chart data with optional time range filtering.
- **Query Parameters**:
  - `startDate` (optional): Start date for filtering (ISO format)
  - `endDate` (optional): End date for filtering (ISO format)
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
- **Error Responses**:
  - `400`: Invalid date parameters
  - `500`: Server error fetching chart data
- **Notes**:
  - Supports time range filtering with startDate and endDate parameters
  - Validates date format before processing
  - Returns aggregated data across all servers

<br>

### Get Server Chart Data - `/api/chart-data/server/:serverId`
- **Endpoint**: `/api/chart-data/server/:serverId`
- **Method**: GET
- **Description**: Retrieves chart data for a specific server with optional time range filtering.
- **Parameters**:
  - `serverId`: the server identifier
- **Query Parameters**:
  - `startDate` (optional): Start date for filtering (ISO format)
  - `endDate` (optional): End date for filtering (ISO format)
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
- **Error Responses**:
  - `400`: Invalid date parameters
  - `500`: Server error fetching chart data
- **Notes**:
  - Supports time range filtering with startDate and endDate parameters
  - Validates date format before processing
  - Returns chart data for specific server

<br>

### Get Server Backup Chart Data - `/api/chart-data/server/:serverId/backup/:backupName`
- **Endpoint**: `/api/chart-data/server/:serverId/backup/:backupName`
- **Method**: GET
- **Description**: Retrieves chart data for a specific server and backup with optional time range filtering.
- **Parameters**:
  - `serverId`: the server identifier
  - `backupName`: the backup name (URL encoded)
- **Query Parameters**:
  - `startDate` (optional): Start date for filtering (ISO format)
  - `endDate` (optional): End date for filtering (ISO format)
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
- **Error Responses**:
  - `400`: Invalid date parameters
  - `500`: Server error fetching chart data
- **Notes**:
  - Supports time range filtering with startDate and endDate parameters
  - Validates date format before processing
  - Returns chart data for specific server and backup combination
  - Backup name must be URL encoded

<br>

## Configuration Management

### Get Unified Configuration - `/api/configuration/unified`
- **Endpoint**: `/api/configuration/unified`
- **Method**: GET
- **Description**: Retrieves a unified configuration object containing all configuration data including cron settings, notification frequency, and servers with backups.
- **Response**:
  ```json
  {
    "ntfy": {
      "url": "https://ntfy.sh",
      "topic": "duplistatus-notifications",
      "accessToken": ""
    },
    "backupSettings": {
      "Server Name:Backup Name": {
        "notificationEvent": "all",
        "expectedInterval": 24,
        "overdueBackupCheckEnabled": true,
        "intervalUnit": "hours"
      }
    },
    "templates": {
      "success": {
        "title": "✅ {status} - {backup_name} @ {server_name}",
        "message": "Backup {backup_name} on {server_name} completed with status '{status}' at {backup_date} in {duration}.",
        "priority": "default",
        "tags": "duplicati, duplistatus, success"
      },
      "warning": {
        "title": "⚠️ {status} - {backup_name} @ {server_name}",
        "message": "Backup {backup_name} on {server_name} completed with status '{status}' at {backup_date}.",
        "priority": "high",
        "tags": "duplicati, duplistatus, warning, error"
      },
      "overdueBackup": {
        "title": "🕑 Overdue - {backup_name} @ {server_name}",
        "message": "The backup {backup_name} is overdue on {server_name}.",
        "priority": "default",
        "tags": "duplicati, duplistatus, overdue"
      }
    },
    "overdue_tolerance": "1h",
    "serverAddresses": [
      {
        "id": "server-id",
        "name": "Server Name",
        "server_url": "http://localhost:8200"
      }
    ],
    "cronConfig": {
      "cronExpression": "*/20 * * * *",
      "enabled": true
    },
    "notificationFrequency": "every_day",
    "serversWithBackups": [
      {
        "id": "server-id",
        "name": "Server Name",
        "backupName": "Backup Name",
        "server_url": "http://localhost:8200"
      }
    ]
  }
  ```
- **Error Responses**:
  - `500`: Server error fetching unified configuration
- **Notes**:
  - Returns all configuration data in a single response
  - Includes cron settings, notification frequency, and servers with backups
  - Fetches all data in parallel for better performance

### Get NTFY Configuration - `/api/configuration/ntfy`
- **Endpoint**: `/api/configuration/ntfy`
- **Method**: GET
- **Description**: Retrieves the current NTFY configuration settings.
- **Response**:
  ```json
  {
    "ntfy": {
      "url": "https://ntfy.sh",
      "topic": "duplistatus-notifications",
      "accessToken": "optional-access-token"
    }
  }
  ```
- **Error Responses**:
  - `500`: Failed to fetch NTFY configuration
- **Notes**:
  - Returns current NTFY configuration settings
  - Used for notification system management

### Update Notification Configuration - `/api/configuration/notifications`
- **Endpoint**: `/api/configuration/notifications`
- **Method**: GET
- **Description**: Retrieves the current notification frequency configuration.
- **Response**:
  ```json
  {
    "value": "every_day"
  }
  ```
- **Error Responses**:
  - `500`: Failed to fetch config
- **Notes**:
  - Retrieves current notification frequency configuration
  - Used for overdue backup notification management

- **Method**: POST
- **Description**: Updates notification configuration (NTFY settings or notification frequency).
- **Request Body**:
  For NTFY configuration:
  ```json
  {
    "ntfy": {
      "enabled": true,
      "url": "https://ntfy.sh",
      "topic": "duplistatus-notifications",
      "accessToken": "optional-access-token"
    }
  }
  ```
  For notification frequency:
  ```json
  {
    "value": "every_week"
  }
  ```
- **Response**:
  For NTFY configuration:
  ```json
  {
    "message": "Notification config updated successfully",
    "ntfy": {
      "enabled": true,
      "url": "https://ntfy.sh",
      "topic": "duplistatus-notifications",
      "accessToken": "optional-access-token"
    }
  }
  ```
  For notification frequency:
  ```json
  {
    "value": "every_week"
  }
  ```
- **Available Values**: `"onetime"`, `"every_day"`, `"every_week"`, `"every_month"`
- **Error Responses**:
  - `400`: NTFY configuration is required or invalid value
  - `500`: Server error updating notification configuration
- **Notes**:
  - Supports both NTFY configuration and notification frequency updates
  - Updates only the NTFY configuration when ntfy field is provided
  - Updates notification frequency when value field is provided
  - Generates default topic if none provided
  - Preserves existing configuration settings
  - Uses `accessToken` field instead of separate username/password fields
  - Validates notification frequency value against allowed options
  - Affects how often overdue notifications are sent

### Update Backup Settings - `/api/configuration/backup-settings`
- **Endpoint**: `/api/configuration/backup-settings`
- **Method**: POST
- **Description**: Updates the backup notification settings for specific servers/backups.
- **Request Body**:
  ```json
  {
    "backupSettings": {
      "Server Name:Backup Name": {
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
- **Error Responses**:
  - `400`: backupSettings is required
  - `500`: Server error updating backup settings
- **Notes**:
  - Updates backup notification settings for specific servers/backups
  - Cleans up overdue backup notifications for disabled backups
  - Clears notifications when timeout settings change

### Update Notification Templates - `/api/configuration/templates`
- **Endpoint**: `/api/configuration/templates`
- **Method**: POST
- **Description**: Updates the notification templates.
- **Request Body**:
  ```json
  {
    "templates": {
      "success": {
        "title": "✅ {status} - {backup_name} @ {server_name}",
        "message": "Backup {backup_name} on {server_name} completed with status '{status}' at {backup_date} in {duration}.",
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
- **Error Responses**:
  - `400`: templates are required
  - `500`: Server error updating notification templates
- **Notes**:
  - Updates notification templates for different backup statuses
  - Preserves existing configuration settings
  - Templates support variable substitution

### Update Overdue Tolerance - `/api/configuration/overdue-tolerance`
- **Endpoint**: `/api/configuration/overdue-tolerance`
- **Method**: POST
- **Description**: Updates the overdue tolerance setting.
- **Request Body**:
  ```json
  {
    "overdue_tolerance": "1h"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Overdue tolerance updated successfully"
  }
  ```
- **Error Responses**:
  - `400`: overdue_tolerance is required
  - `500`: Server error updating overdue tolerance
- **Notes**:
  - Updates the overdue tolerance setting (accepts string format like "1h", "2h", etc.)
  - Affects when backups are considered overdue
  - Used by the overdue backup checker

<br>

## Notification System

### Test Notification - `/api/notifications/test`
- **Endpoint**: `/api/notifications/test`
- **Method**: POST
- **Description**: Send test notifications (simple or template-based) to verify NTFY configuration.
- **Request Body**:
  For simple test:
  ```json
  {
    "type": "simple",
    "ntfyConfig": {
      "url": "https://ntfy.sh",
      "topic": "test-topic",
      "accessToken": "optional-access-token"
    }
  }
  ```
  For template test:
  ```json
  {
    "type": "template",
    "ntfyConfig": {
      "url": "https://ntfy.sh",
      "topic": "test-topic",
      "accessToken": "optional-access-token"
    },
    "template": {
      "title": "Test Title",
      "message": "Test message with {variable}",
      "priority": "default",
      "tags": "test"
    }
  }
  ```
- **Response**:
  For simple test:
  ```json
  {
    "message": "Test notification sent successfully"
  }
  ```
  For template test:
  ```json
  {
    "success": true
  }
  ```
- **Error Responses**:
  - `400`: NTFY configuration is required or invalid
  - `500`: Failed to send test notification with error details
- **Notes**:
  - Supports both simple test messages and template-based notifications
  - Template testing uses sample data to replace template variables
  - Includes timestamp in the test message
  - Validates NTFY URL and topic before sending
  - Uses `accessToken` field for authentication

### Check Overdue Backups - `/api/notifications/check-overdue`
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
- **Error Responses**:
  - `500`: Failed to check for overdue backups
- **Notes**:
  - Manually triggers overdue backup check
  - Returns statistics about the check process
  - Sends notifications for overdue backups found

### Clear Overdue Timestamps - `/api/notifications/clear-overdue-timestamps`
- **Endpoint**: `/api/notifications/clear-overdue-timestamps`
- **Method**: POST
- **Description**: Clears all overdue backup notification timestamps, allowing notifications to be sent again.
- **Response**:
  ```json
  {
    "message": "Overdue backup notification timestamps cleared successfully"
  }
  ```
- **Error Responses**:
  - `500`: Failed to clear overdue backup timestamps
- **Notes**:
  - Clears all overdue backup notification timestamps
  - Allows notifications to be sent again
  - Useful for testing notification system

<br>

## Cron Service Management

### Get Cron Configuration - `/api/cron-config`
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
- **Error Responses**:
  - `500`: Failed to get cron configuration
- **Notes**:
  - Returns current cron service configuration
  - Includes cron expression and enabled status
  - Used for cron service management

### Update Cron Configuration - `/api/cron-config`
- **Endpoint**: `/api/cron-config`
- **Method**: POST
- **Description**: Updates the cron service configuration.
- **Request Body**:
  ```json
  {
    "interval": "20min"
  }
  ```
- **Response**:
  ```json
  {
    "success": true
  }
  ```
- **Available Intervals**: `"disabled"`, `"1min"`, `"5min"`, `"10min"`, `"15min"`, `"20min"`, `"30min"`, `"1hour"`, `"2hours"`
- **Error Responses**:
  - `400`: Interval is required
  - `500`: Failed to update cron configuration
- **Notes**:
  - Updates cron service configuration
  - Validates interval against allowed options
  - Affects overdue backup check frequency

### Cron Service Proxy - `/api/cron/*`
- **Endpoint**: `/api/cron/*`
- **Method**: GET, POST
- **Description**: Proxies requests to the cron service. This endpoint forwards all requests to the cron service running on a separate port.
- **Parameters**:
  - `*`: Any path that will be forwarded to the cron service
- **Response**: Depends on the cron service endpoint being accessed
- **Error Response** (503):
  ```json
  {
    "error": "Cron service is not running",
    "message": "The cron service is not available. Please start it with: npm run cron:start"
  }
  ```
- **Notes**:
  - Proxies requests to the cron service
  - Returns 503 if cron service is not available
  - Supports both GET and POST methods

<br>

## Monitoring & Health

### Health Check - `/api/health`
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
      "servers",
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
- **Notes**: 
  - Returns 200 status for healthy systems
  - Returns 503 status for unhealthy systems or prepared statement failures
  - Includes `preparedStatementsError` field when prepared statements fail
  - Stack trace only included in development mode
  - Tests basic database connection and prepared statements

<br>

## Administration

### Collect Backups - `/api/backups/collect`
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
    "serverName": "Server Name",
    "serverAlias": "My Server",
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
  - Logs collected data in development mode for debugging
  - Ensures backup settings are complete for all servers and backups
  - Uses default port 8200 and protocol "http" if not specified
  - `serverAlias` is retrieved from the database and may be empty if no alias is set
  - The frontend should use `serverAlias || serverName` for display purposes

<br>

### Cleanup Backups - `/api/backups/cleanup`
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
  
  For "Delete all data" option:
  ```json
  {
    "message": "Successfully deleted all 15 backups and 3 servers, and cleared configuration settings",
    "status": 200
  }
  ```
- **Error Responses**:
  - `400`: Invalid retention period specified
  - `500`: Server error during cleanup operation with detailed error information
- **Notes**: 
  - The cleanup operation is irreversible
  - Backup data is permanently deleted from the database
  - Machine records are preserved even if all backups are deleted
  - When "Delete all data" is selected, all machines and backups are removed and configuration is cleared
  - Enhanced error reporting includes details and stack trace in development mode
  - Supports both time-based retention and complete data deletion

<br>


### Delete Backup - `/api/backups/:backupId`
- **Endpoint**: `/api/backups/:backupId`
- **Method**: DELETE
- **Description**: Deletes a specific backup record. This endpoint is only available in development mode.
- **Parameters**:
  - `backupId`: the backup identifier

- **Response**:
  ```json
  {
    "message": "Successfully deleted backup Files from 2024-03-20T10:00:00Z",
    "status": 200,
    "deletedBackup": {
      "id": "backup-id",
      "server_id": "server-id",
      "backup_name": "Files",
      "date": "2024-03-20T10:00:00Z"
    }
  }
  ```
- **Error Responses**:
  - `403`: Backup deletion is only available in development mode
  - `400`: Invalid backup ID
  - `404`: Backup not found
  - `500`: Server error during deletion with detailed error information
- **Notes**: 
  - This operation is only available in development mode
  - This operation is irreversible
  - The backup data will be permanently deleted from the database
  - Enhanced error reporting includes details and timestamp
  - Returns information about the deleted backup

### Delete Backup Job - `/api/backups/delete-job`
- **Endpoint**: `/api/backups/delete-job`
- **Method**: DELETE
- **Description**: Deletes all backup records for a specific server-backup combination. This endpoint is only available in development mode.
- **Request Body**:
  ```json
  {
    "serverId": "server-id",
    "backupName": "Backup Name"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Successfully deleted 5 backup record(s) for \"Files\" from server \"My Server\"",
    "status": 200,
    "deletedCount": 5,
    "serverName": "My Server",
    "backupName": "Files"
  }
  ```
- **Error Responses**:
  - `403`: Backup job deletion is only available in development mode
  - `400`: Server ID and backup name are required
  - `404`: No backups found to delete
  - `500`: Server error during deletion with detailed error information
- **Notes**: 
  - This operation is only available in development mode
  - This operation is irreversible
  - All backup records for the specified server-backup combination will be permanently deleted
  - Returns count of deleted backups and server information
  - Uses server alias for display if available, otherwise falls back to server name

<br>

### Test Server Connection - `/api/servers/test-connection`
- **Endpoint**: `/api/servers/test-connection`
- **Method**: POST
- **Description**: Tests the connection to a Duplicati server to verify it's accessible.
- **Request Body**:
  ```json
  {
    "server_url": "http://localhost:8200"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Connection successful"
  }
  ```
- **Error Responses**:
  - `400`: Invalid URL format or missing server URL
  - `500`: Server error during connection test
- **Notes**: 
  - The endpoint validates URL format and tests connectivity
  - Returns success if the server responds with a 401 status (expected for login endpoint without credentials)
  - Tests connection to the Duplicati server's login endpoint
  - Supports both HTTP and HTTPS protocols
  - Uses timeout configuration for connection testing

<br>

### Get Server URL - `/api/servers/:serverId/server-url`
- **Endpoint**: `/api/servers/:serverId/server-url`
- **Method**: GET
- **Description**: Retrieves the server URL for a specific server.
- **Parameters**:
  - `serverId`: the server identifier

- **Response**:
  ```json
  {
    "serverId": "server-id",
    "server_url": "http://localhost:8200"
  }
  ```
- **Error Responses**:
  - `404`: Server not found
  - `500`: Server error
- **Notes**:
  - Returns server URL for specific server
  - Used for server connection management
  - Returns empty string if no server URL is set

<br>

### Update Server URL - `/api/servers/:serverId/server-url`
- **Endpoint**: `/api/servers/:serverId/server-url`
- **Method**: PATCH
- **Description**: Updates the server URL for a specific server.
- **Parameters**:
  - `serverId`: the server identifier
- **Request Body**:
  ```json
  {
    "server_url": "http://localhost:8200"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Server URL updated successfully",
    "serverId": "server-id",
    "serverName": "Server Name",
    "server_url": "http://localhost:8200"
  }
  ```
- **Error Responses**:
  - `400`: Invalid URL format
  - `404`: Server not found
  - `500`: Server error during update
- **Notes**: 
  - The endpoint validates URL format before updating
  - Empty or null server URLs are allowed
  - Supports both HTTP and HTTPS protocols
  - Returns updated server information

<br>

## Error Handling

All endpoints follow a consistent error handling pattern:

- **400 Bad Request**: Invalid request data or missing required fields
- **403 Forbidden**: Operation not allowed (e.g., backup deletion in production)
- **404 Not Found**: Resource not found
- **409 Conflict**: Duplicate data (for upload endpoints)
- **500 Internal Server Error**: Server-side errors with detailed error messages
- **503 Service Unavailable**: Health check failures, database connection issues, or cron service unavailable

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
