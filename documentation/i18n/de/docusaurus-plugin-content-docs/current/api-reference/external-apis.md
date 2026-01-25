# External APIs

These endpoints are designed for use by other applications and integrations, for instance [Homepage](../user-guide/homepage-integration.md).

## Get Overall Summary - `/api/summary`

- **Endpoint**: `/api/summary`
- **Method**: GET
- **Description**: Retrieves a summary of all backup operations across all servers.
- **Response**:
  ```json
  {
    "totalServers": 3,
    "totalBackupsRuns": 9,
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
  - In version 0.5.x, the field `totalBackupedSize` was replaced by `totalBackupSize`
  - In version 0.7.x, the field `totalMachines` was replaced by `totalServers`
  - The field `overdueBackupsCount` shows the number of currently overdue backups
  - The field `secondsSinceLastBackup` shows the time in seconds since the last backup across all servers
  - Returns fallback response with zeros if data fetching fails
  - **Note**: For internal dashboard use, consider using `/api/dashboard` which includes this data plus additional information

## Get Latest Backup - `/api/lastbackup/:serverId`

- **Endpoint**: `/api/lastbackup/:serverId`
- **Method**: GET
- **Description**: Retrieves the latest backup information for a specific server.
- **Parameters**:
  - `serverId`: the server identifier (ID or name)

:::note
The server identifier has to be URL Encoded.
:::

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
      "messages_array": ["message1", "message2"],
      "warnings_array": ["warning1"],
      "errors_array": [],
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

## Get Latest Backups - `/api/lastbackups/:serverId`

- **Endpoint**: `/api/lastbackups/:serverId`
- **Method**: GET
- **Description**: Retrieves the latest backup information for all configured backups (e.g. 'Files', 'Databases') on a specific server.
- **Parameters**:
  - `serverId`: the server identifier (ID or name)

:::note
The server identifier has to be URL Encoded.
:::

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
        "messages_array": ["message1"],
        "warnings_array": ["warning1"],
        "errors_array": [],
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

## Upload Backup Data - `/api/upload`

- **Endpoint**: `/api/upload`

- **Method**: POST

- **Description**: Uploads backup operation data for a server. Supports duplicate backup run detection and sends notifications.

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
  - `400`: Missing required fields in Extra or Data sections, or invalid MainOperation
  - `409`: Duplicate backup data (ignored)
  - `500`: Server error processing backup data

- **Notes**:
  - Only processes backup operations (MainOperation must be "Backup")
  - Validates required fields in Extra section: machine-id, machine-name, backup-name, backup-id
  - Validates required fields in Data section: ParsedResult, BeginTime, Duration
  - Automatically detects duplicate backup runs and returns 409 status
  - Sends notifications after successful backup insertion (if configured)
  - Logs request data to a file in the `data` directory in the root of the project in development mode for debugging
  - Uses transaction for data consistency
