# API Endpoints

The following endpoints are available:

- [Upload Backup Data](#upload-backup-data)
- [Get Latest Backup](#get-latest-backup)
- [Get Overall Summary](#get-overall-summary)
- [Get Machines Summary](#get-machines-summary)
- [Get All Machines](#get-all-machines)
- [Get Machine Details](#get-machine-details)
- [Get Chart Data](#get-chart-data)
- [Configuration Management](#configuration-management)
- [Notification System](#notification-system-endpoints)
- [Cron Service Management](#cron-service-management)
- [Health Check](#health-check)
- [Collect Backups](#collect-backups)
- [Cleanup Backups](#cleanup-backups)


<br>

## Upload Backup Data
- **Endpoint**: `/api/upload`
- **Method**: POST
- **Description**: Uploads backup operation data for a machine.
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

<br>

## Get Latest Backup
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
      "created_at": "2024-03-20T10:00:00Z"
    },
    "latest_backup": {
      "id": "backup-id",
      "name": "Backup Name",
      "date": "2024-03-20T10:00:00Z",
      "status": "Success",
      "warnings": 0,
      "errors": 0,
      "fileCount": 249426,
      "fileSize": 113395849938,
      "uploadedSize": 331318892,
      "duration": "00:38:31",
      "duration_seconds": 2311.6018052,
      "durationInMinutes": 38.52669675333333,
      "knownFileSize": 27203688543,
      "backup_list_count": 10
    },
    "status": 200
  }
  ```

<br>

## Get Overall Summary
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
    "secondsSinceLastBackup": 264
  }
  ```

> [!NOTE]
>    In version 0.5.0, the field `totalBackupedSize` was replaced by `totalBackupSize`.

<br>

## Get Machines Summary
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

## Get All Machines
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

## Get Machine Details
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
        "messages_array": ["message1", "message2"],
        "warnings_array": ["warning1"],
        "errors_array": [],
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

## Get Chart Data
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
- **Endpoint**: `/api/configuration`
- **Method**: GET
- **Description**: Retrieves the current notification and backup settings configuration.
- **Response**:
  ```json
  {
    "ntfy": {
      "enabled": true,
      "url": "https://ntfy.sh",
      "topic": "duplistatus-notifications",
      "username": "",
      "password": ""
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
    }
  }
  ```

- **Method**: POST
- **Description**: Updates the notification and backup settings configuration.
- **Request Body**: Same structure as GET response

<br>

## Notification System Endpoints

### Test Notification
- **Endpoint**: `/api/notifications/test`
- **Method**: POST
- **Description**: Sends a test notification using the current ntfy configuration.
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

### Check Overdue Backups
- **Endpoint**: `/api/notifications/check-overdue`
- **Method**: POST
- **Description**: Manually triggers the overdue backup check and sends notifications.
- **Response**:
  ```json
  {
    "message": "Overdue backup check completed",
    "checkedBackups": 5,
    "overdueBackupsFound": 2,
    "notificationsSent": 2
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
    "frequency": "every_day"
  }
  ```

- **Method**: POST
- **Description**: Updates the notification frequency configuration.
- **Request Body**:
  ```json
  {
    "frequency": "every_week"
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
    "variables": {
      "variable": "test value"
    }
  }
  ```
- **Response**:
  ```json
  {
    "processedTemplate": {
      "title": "Test Title",
      "message": "Test message with test value",
      "priority": "default",
      "tags": "test"
    }
  }
  ```

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

## Health Check
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
    "tables": ["machines", "backups"],
    "preparedStatements": true,
    "timestamp": "2024-03-20T10:00:00Z"
  }
  ```

<br>

## Collect Backups
- **Endpoint**: `/api/backups/collect`
- **Method**: POST
- **Description**: Collects backup data directly from a Duplicati server via its API.
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
    "message": "Successfully collected 5 backups",
    "processedCount": 5,
    "status": 200
  }
  ```

<br>

## Cleanup Backups
- **Endpoint**: `/api/backups/cleanup`
- **Method**: POST
- **Description**: Deletes old backup data based on retention period.
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
