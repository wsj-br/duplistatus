

# Core Operations

## Get Dashboard Data (Consolidated) - `/api/dashboard`
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
  - This endpoint consolidates the previous `/api/servers-summary` endpoint (which has been removed)
  - The `overallSummary` field contains the same data as `/api/summary` (which is maintained for external applications)
  - The `chartData` field contains the same data as `/api/chart-data/aggregated` (which still exists for direct access)
  - Provides better performance by reducing multiple API calls to a single request
  - All data is fetched in parallel for optimal performance
  - The `secondsSinceLastBackup` field shows the time in seconds since the last backup across all servers

## Get All Servers - `/api/servers`
- **Endpoint**: `/api/servers`
- **Method**: GET
- **Description**: Retrieves a list of all servers with their basic information. Optionally includes backup information.
- **Authentication**: Requires valid session and CSRF token
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
      "note": "Additional notes about the server",
      "hasPassword": true
    }
  ]
  ```
- **Error Responses**:
  - `401`: Unauthorized - Invalid session or CSRF token
  - `500`: Server error fetching servers
- **Notes**:
  - Returns server information including alias and note fields
  - When `includeBackups=true`, returns server-backup combinations with URLs and password status
  - Consolidates the previous `/api/servers-with-backups` endpoint (which has been removed)
  - Used for server selection, display, and configuration purposes
  - Includes `hasPassword` field to indicate if server has stored password

## Get Server Details - `/api/servers/:id`
- **Endpoint**: `/api/servers/:id`
- **Method**: GET
- **Description**: Retrieves information about a specific server. Can return basic server info or detailed information including backups and chart data.
- **Authentication**: Requires valid session and CSRF token
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
  - `401`: Unauthorized - Invalid session or CSRF token
  - `404`: Server not found
  - `500`: Server error fetching server details
- **Notes**:
  - Returns basic server information by default for better performance
  - Use query parameters to include additional data when needed
  - Optimised for different use cases (settings vs detail views)

## Update Server - `/api/servers/:id`
- **Endpoint**: `/api/servers/:id`
- **Method**: PATCH
- **Description**: Updates server details including alias, note, and server URL.
- **Authentication**: Requires valid session and CSRF token
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
  - `401`: Unauthorized - Invalid session or CSRF token
  - `404`: Server not found
  - `500`: Server error during update
- **Notes**:
  - Updates server alias, note, and server URL
  - All fields are optional
  - Empty strings are allowed for all fields

## Delete Server - `/api/servers/:id`
- **Endpoint**: `/api/servers/:id`
- **Method**: DELETE
- **Description**: Deletes a server and all its associated backups.
- **Authentication**: Requires valid session and CSRF token
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
  - `401`: Unauthorized - Invalid session or CSRF token
  - `404`: Server not found
  - `500`: Server error during deletion
- **Notes**: 
  - This operation is irreversible
  - All backup data associated with the server will be permanently deleted
  - The server record itself will also be removed
  - Returns count of deleted backups and servers

## Get Server Data with Overdue Info - `/api/detail/:serverId`
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
