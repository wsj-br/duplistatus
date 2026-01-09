

# Administration

## Collect Backups - `/api/backups/collect`
- **Endpoint**: `/api/backups/collect`
- **Method**: POST
- **Description**: Collects backup data directly from a Duplicati server via its API. This endpoint automatically detects the best connection protocol (HTTPS with SSL validation, HTTPS with self-signed certificates, or HTTP as fallback) and connects to the Duplicati server to retrieve backup information and process it into the local database.
- **Authentication**: Requires valid session and CSRF token
- **Request Body**:
  ```json
  {
    "hostname": "duplicati-server.local",
    "port": 8200,
    "password": "your-password",
    "downloadJson": false
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
  - `401`: Unauthorized - Invalid session or CSRF token
  - `500`: Server error during backup collection
- **Notes**: 
  - The endpoint automatically detects the optimal connection protocol (HTTPS → HTTPS with self-signed → HTTP)
  - Protocol detection attempts are made in order of security preference
  - Connection timeouts are configurable via environment variables
  - Logs collected data in development mode for debugging
  - Ensures backup settings are complete for all servers and backups
  - Uses default port 8200 if not specified
  - The detected protocol and server URL are automatically stored in the database
  - `serverAlias` is retrieved from the database and may be empty if no alias is set
  - The frontend should use `serverAlias || serverName` for display purposes
  - Supports both JSON download and direct API collection methods

## Cleanup Backups - `/api/backups/cleanup`
- **Endpoint**: `/api/backups/cleanup`
- **Method**: POST
- **Description**: Deletes old backup data based on retention period. This endpoint helps manage database size by removing outdated backup records while preserving recent and important data.
- **Authentication**: Requires valid session and CSRF token
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
  - `401`: Unauthorized - Invalid session or CSRF token
  - `400`: Invalid retention period specified
  - `500`: Server error during cleanup operation with detailed error information
- **Notes**: 
  - The cleanup operation is irreversible
  - Backup data is permanently deleted from the database
  - Machine records are preserved even if all backups are deleted
  - When "Delete all data" is selected, all machines and backups are removed and configuration is cleared
  - Enhanced error reporting includes details and stack trace in development mode
  - Supports both time-based retention and complete data deletion

## Delete Backup Job - `/api/backups/delete-job`
- **Endpoint**: `/api/backups/delete-job`
- **Method**: DELETE
- **Description**: Deletes all backup records for a specific server-backup combination. This endpoint is only available in development mode.
- **Authentication**: Requires valid session and CSRF token
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
  - `401`: Unauthorized - Invalid session or CSRF token
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

## Sync Backup Schedules - `/api/backups/sync-schedule`
- **Endpoint**: `/api/backups/sync-schedule`
- **Method**: POST
- **Description**: Synchronizes backup schedule information from a Duplicati server. This endpoint connects to the server, retrieves schedule information for all backups, and updates the local backup settings with schedule details including repeat intervals, allowed week days, and schedule times.
- **Authentication**: Requires valid session and CSRF token (optional authentication)
- **Request Body**:
  ```json
  {
    "hostname": "duplicati-server.local",
    "port": 8200,
    "password": "your-password",
    "serverId": "optional-server-id"
  }
  ```
  Or with serverId only (uses stored password):
  ```json
  {
    "serverId": "server-id"
  }
  ```
  Or with serverId and updated credentials:
  ```json
  {
    "serverId": "server-id",
    "hostname": "new-hostname.local",
    "port": 8200,
    "password": "new-password"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "serverName": "Server Name",
    "stats": {
      "processed": 5,
      "errors": 0
    }
  }
  ```
  With errors:
  ```json
  {
    "success": true,
    "serverName": "Server Name",
    "stats": {
      "processed": 3,
      "errors": 2
    },
    "errors": [
      "Backup Name 1: Error message",
      "Backup Name 2: Error message"
    ]
  }
  ```
- **Error Responses**:
  - `400`: Invalid request parameters, missing hostname/password when serverId not provided, or connection failed
  - `404`: Server not found (when serverId provided) or no password stored for server
  - `500`: Server error during schedule synchronization
- **Notes**: 
  - The endpoint automatically detects the optimal connection protocol (HTTPS → HTTPS with self-signed → HTTP)
  - Can be called with just serverId to use stored server credentials
  - Can be called with serverId and new credentials to update server connection details
  - Can be called with hostname/port/password without serverId for new servers
  - Updates backup settings with schedule information including:
    - `expectedInterval`: The repeat interval (e.g., "Daily", "Weekly", "Monthly")
    - `allowedWeekDays`: Array of allowed week days (0=Sunday, 1=Monday, etc.)
    - `time`: The scheduled time for the backup
  - Processes all backups found on the server
  - Returns statistics on processed backups and any errors encountered
  - Logs audit events for successful and failed sync operations
  - Uses default port 8200 if not specified

## Test Server Connection - `/api/servers/test-connection`
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

## Get Server URL - `/api/servers/:serverId/server-url`
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

## Update Server URL - `/api/servers/:serverId/server-url`
- **Endpoint**: `/api/servers/:serverId/server-url`
- **Method**: PATCH
- **Description**: Updates the server URL for a specific server.
- **Authentication**: Requires valid session and CSRF token
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
  - `401`: Unauthorized - Invalid session or CSRF token
  - `400`: Invalid URL format
  - `404`: Server not found
  - `500`: Server error during update
- **Notes**: 
  - The endpoint validates URL format before updating
  - Empty or null server URLs are allowed
  - Supports both HTTP and HTTPS protocols
  - Returns updated server information

## Get Server Password - `/api/servers/:serverId/password`
- **Endpoint**: `/api/servers/:serverId/password`
- **Method**: GET
- **Description**: Retrieves a CSRF token for server password operations.
- **Authentication**: Requires valid session
- **Parameters**:
  - `serverId`: the server identifier
- **Response**:
  ```json
  {
    "csrfToken": "csrf-token-string",
    "serverId": "server-id"
  }
  ```
- **Error Responses**:
  - `401`: Invalid or expired session
  - `500`: Failed to generate CSRF token
- **Notes**:
  - Returns CSRF token for use with password update operations
  - Session must be valid to generate token

## Update Server Password - `/api/servers/:serverId/password`
- **Endpoint**: `/api/servers/:serverId/password`
- **Method**: PATCH
- **Description**: Updates the password for a specific server.
- **Authentication**: Requires valid session and CSRF token
- **Parameters**:
  - `serverId`: the server identifier
- **Request Body**:
  ```json
  {
    "password": "new-password"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Password updated successfully",
    "serverId": "server-id"
  }
  ```
- **Error Responses**:
  - `400`: Password must be a string
  - `401`: Unauthorized - Invalid session or CSRF token
  - `500`: Failed to update password
- **Notes**:
  - Password can be an empty string to clear the password
  - Password is stored securely using the secrets management system

## User Management

### List Users - `/api/users`
- **Endpoint**: `/api/users`
- **Method**: GET
- **Description**: Lists all users with pagination and optional search filtering. Returns user information including login history and account status.
- **Authentication**: Requires admin privileges, valid session and CSRF token
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 50)
  - `search` (optional): Search term to filter by username
- **Response**:
  ```json
  {
    "users": [
      {
        "id": "user-id",
        "username": "admin",
        "isAdmin": true,
        "mustChangePassword": false,
        "createdAt": "2024-01-01T00:00:00Z",
        "lastLoginAt": "2024-01-15T10:30:00Z",
        "lastLoginIp": "192.168.1.100",
        "failedLoginAttempts": 0,
        "lockedUntil": null,
        "isLocked": false
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 5,
      "totalPages": 1
    }
  }
  ```
- **Error Responses**:
  - `401`: Unauthorized - Invalid session or CSRF token
  - `403`: Forbidden - Admin privileges required
  - `500`: Internal server error
- **Notes**:
  - Only accessible to admin users
  - Supports pagination and search filtering
  - Returns user account status including lock status

### Create User - `/api/users`
- **Endpoint**: `/api/users`
- **Method**: POST
- **Description**: Creates a new user account. Can generate a temporary password or use a provided password.
- **Authentication**: Requires admin privileges, valid session and CSRF token
- **Request Body**:
  ```json
  {
    "username": "newuser",
    "password": "optional-password",
    "isAdmin": false,
    "requirePasswordChange": true
  }
  ```
  - `username`: Required, must be 3-50 characters, unique
  - `password`: Optional, if not provided a secure temporary password is generated
  - `isAdmin`: Optional, default false
  - `requirePasswordChange`: Optional, default true
- **Response**:
  ```json
  {
    "user": {
      "id": "user-id",
      "username": "newuser",
      "isAdmin": false,
      "mustChangePassword": true
    },
    "temporaryPassword": "generated-password-123"
  }
  ```
  - `temporaryPassword` is only included if a password was auto-generated
- **Error Responses**:
  - `400`: Invalid username format, password policy violation, or validation errors
  - `401`: Unauthorized - Invalid session or CSRF token
  - `403`: Forbidden - Admin privileges required
  - `409`: Username already exists
  - `500`: Internal server error
- **Notes**:
  - Only accessible to admin users
  - Username is case-insensitive and stored in lowercase
  - If password is not provided, a secure 12-character password is generated
  - Generated temporary passwords are only returned once in the response
  - User creation is logged to audit log

### Update User - `/api/users/:id`
- **Endpoint**: `/api/users/:id`
- **Method**: PATCH
- **Description**: Updates user information including username, admin status, password change requirement, and password reset.
- **Authentication**: Requires admin privileges, valid session and CSRF token
- **Parameters**:
  - `id`: User ID to update
- **Request Body**:
  ```json
  {
    "username": "updated-username",
    "isAdmin": true,
    "requirePasswordChange": false,
    "resetPassword": true
  }
  ```
  - All fields are optional
  - `resetPassword`: If true, generates a new temporary password and sets `requirePasswordChange` to true
- **Response** (with password reset):
  ```json
  {
    "user": {
      "id": "user-id",
      "username": "updated-username",
      "isAdmin": true,
      "mustChangePassword": true
    },
    "temporaryPassword": "new-temp-password-456"
  }
  ```
- **Response** (without password reset):
  ```json
  {
    "user": {
      "id": "user-id",
      "username": "updated-username",
      "isAdmin": true,
      "mustChangePassword": false
    }
  }
  ```
- **Error Responses**:
  - `400`: Invalid input or validation errors
  - `401`: Unauthorized - Invalid session or CSRF token
  - `403`: Forbidden - Admin privileges required
  - `404`: User not found
  - `409`: Username already exists (if changing username)
  - `500`: Internal server error
- **Notes**:
  - Only accessible to admin users
  - Username changes are validated for uniqueness
  - Password reset generates a secure 12-character temporary password
  - All changes are logged to audit log

### Delete User - `/api/users/:id`
- **Endpoint**: `/api/users/:id`
- **Method**: DELETE
- **Description**: Deletes a user account. Prevents deleting yourself or the last admin account.
- **Authentication**: Requires admin privileges, valid session and CSRF token
- **Parameters**:
  - `id`: User ID to delete
- **Response**:
  ```json
  {
    "success": true,
    "message": "User deleted successfully"
  }
  ```
- **Error Responses**:
  - `400`: Cannot delete your own account or the last admin account
  - `401`: Unauthorized - Invalid session or CSRF token
  - `403`: Forbidden - Admin privileges required
  - `404`: User not found
  - `500`: Internal server error
- **Notes**:
  - Only accessible to admin users
  - Cannot delete your own account
  - Cannot delete the last admin account (at least one admin must remain)
  - User deletion is logged to audit log
  - Associated sessions are automatically deleted (cascade)

## Audit Log Management

### List Audit Logs - `/api/audit-log`
- **Endpoint**: `/api/audit-log`
- **Method**: GET
- **Description**: Retrieves audit log entries with filtering, pagination, and search capabilities. Supports both page-based and offset-based pagination.
- **Authentication**: Requires valid session and CSRF token (logged-in user required)
- **Query Parameters**:
  - `page` (optional): Page number for page-based pagination
  - `offset` (optional): Offset for offset-based pagination (takes precedence over page)
  - `limit` (optional): Items per page (default: 50)
  - `startDate` (optional): Filter logs from this date (ISO format)
  - `endDate` (optional): Filter logs to this date (ISO format)
  - `userId` (optional): Filter by user ID
  - `username` (optional): Filter by username
  - `action` (optional): Filter by action name
  - `category` (optional): Filter by category (`auth`, `user_management`, `config`, `backup`, `server`)
  - `status` (optional): Filter by status (`success`, `failure`, `error`)
- **Response**:
  ```json
  {
    "logs": [
      {
        "id": 1,
        "timestamp": "2024-01-15T10:30:00Z",
        "userId": "user-id",
        "username": "admin",
        "action": "login",
        "category": "auth",
        "targetType": "user",
        "targetId": "user-id",
        "status": "success",
        "ipAddress": "192.168.1.100",
        "userAgent": "Mozilla/5.0...",
        "details": {
          "is_admin": true
        },
        "errorMessage": null
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 150,
      "totalPages": 3
    }
  }
  ```
- **Error Responses**:
  - `401`: Unauthorized - Invalid session or CSRF token
  - `500`: Internal server error
- **Notes**:
  - Supports both page-based (`page`) and offset-based (`offset`) pagination
  - `details` field contains parsed JSON with additional context
  - All audit log queries are logged

### Get Audit Log Filter Values - `/api/audit-log/filters`
- **Endpoint**: `/api/audit-log/filters`
- **Method**: GET
- **Description**: Retrieves unique filter values available for filtering audit logs. Returns all distinct actions, categories, and statuses that exist in the audit log database. Useful for populating filter dropdowns in the UI.
- **Authentication**: Requires valid session and CSRF token (logged-in user required)
- **Response**:
  ```json
  {
    "actions": [
      "login",
      "logout",
      "user_created",
      "user_updated",
      "config_updated"
    ],
    "categories": [
      "auth",
      "user_management",
      "config",
      "backup",
      "server"
    ],
    "statuses": [
      "success",
      "failure",
      "error"
    ]
  }
  ```
- **Error Responses**:
  - `401`: Unauthorized - Invalid session or CSRF token
  - `500`: Internal server error
- **Notes**:
  - Returns arrays of unique values from the audit log database
  - Values are sorted alphabetically
  - Empty arrays are returned if no data exists or on error
  - Used by the audit log viewer to populate filter dropdowns dynamically

### Download Audit Logs - `/api/audit-log/download`
- **Endpoint**: `/api/audit-log/download`
- **Method**: GET
- **Description**: Downloads audit logs in CSV or JSON format with optional filtering. Useful for external analysis and reporting.
- **Authentication**: Requires valid session and CSRF token (logged-in user required)
- **Query Parameters**:
  - `format` (optional): Export format - `csv` or `json` (default: `csv`)
  - `startDate` (optional): Filter logs from this date (ISO format)
  - `endDate` (optional): Filter logs to this date (ISO format)
  - `userId` (optional): Filter by user ID
  - `username` (optional): Filter by username
  - `action` (optional): Filter by action name
  - `category` (optional): Filter by category
  - `status` (optional): Filter by status
- **Response** (CSV):
  - Content-Type: `text/csv`
  - Content-Disposition: `attachment; filename="audit-log-YYYY-MM-DD.csv"`
  - CSV file with headers: ID, Timestamp, User ID, Username, Action, Category, Target Type, Target ID, Status, IP Address, User Agent, Details, Error Message
- **Response** (JSON):
  - Content-Type: `application/json`
  - Content-Disposition: `attachment; filename="audit-log-YYYY-MM-DD.json"`
  - JSON array of audit log entries
- **Error Responses**:
  - `400`: No logs to export
  - `401`: Unauthorized - Invalid session or CSRF token
  - `500`: Internal server error
- **Notes**:
  - Export limit is 10,000 records
  - CSV format escapes special characters properly
  - Details field in CSV is JSON-stringified
  - File name includes the current date

### Cleanup Audit Logs - `/api/audit-log/cleanup`
- **Endpoint**: `/api/audit-log/cleanup`
- **Method**: POST
- **Description**: Manually triggers cleanup of old audit logs based on retention period. Supports dry-run mode to preview what would be deleted.
- **Authentication**: Requires admin privileges, valid session and CSRF token
- **Request Body**:
  ```json
  {
    "retentionDays": 90,
    "dryRun": false
  }
  ```
  - `retentionDays` (optional): Override retention days (30-365), otherwise uses configured value
  - `dryRun` (optional): If true, only returns what would be deleted without actually deleting
- **Response** (dry run):
  ```json
  {
    "dryRun": true,
    "wouldDeleteCount": 50,
    "oldestRemaining": "2024-01-01T00:00:00Z",
    "retentionDays": 90,
    "cutoffDate": "2024-01-01"
  }
  ```
- **Response** (actual cleanup):
  ```json
  {
    "success": true,
    "deletedCount": 50,
    "oldestRemaining": "2024-01-01T00:00:00Z",
    "retentionDays": 90
  }
  ```
- **Error Responses**:
  - `400`: Invalid retention days (must be 30-365)
  - `401`: Unauthorized - Invalid session or CSRF token
  - `403`: Forbidden - Admin privileges required
  - `500`: Internal server error
- **Notes**:
  - Only accessible to admin users
  - Default retention is 90 days if not configured
  - Cleanup operation is logged to audit log
  - Dry-run mode is useful for previewing cleanup impact

### Get Audit Log Retention - `/api/audit-log/retention`
- **Endpoint**: `/api/audit-log/retention`
- **Method**: GET
- **Description**: Retrieves the current audit log retention configuration in days.
- **Authentication**: Requires valid session and CSRF token (no logged-in user required)
- **Response**:
  ```json
  {
    "retentionDays": 90
  }
  ```
- **Error Responses**:
  - `500`: Internal server error
- **Notes**:
  - Default retention is 90 days if not configured
  - Can be accessed without authentication (read-only)

### Update Audit Log Retention - `/api/audit-log/retention`
- **Endpoint**: `/api/audit-log/retention`
- **Method**: PATCH
- **Description**: Updates the audit log retention period in days. This setting determines how long audit logs are kept before automatic cleanup.
- **Authentication**: Requires admin privileges, valid session and CSRF token
- **Request Body**:
  ```json
  {
    "retentionDays": 120
  }
  ```
  - `retentionDays`: Required, must be between 30 and 365 days
- **Response**:
  ```json
  {
    "success": true,
    "retentionDays": 120
  }
  ```
- **Error Responses**:
  - `400`: Invalid retention days (must be 30-365)
  - `401`: Unauthorized - Invalid session or CSRF token
  - `403`: Forbidden - Admin privileges required
  - `500`: Internal server error
- **Notes**:
  - Only accessible to admin users
  - Configuration change is logged to audit log
  - Retention period affects automatic and manual cleanup operations

## Database Management

### Backup Database - `/api/database/backup`
- **Endpoint**: `/api/database/backup`
- **Method**: GET
- **Description**: Creates a backup of the database in either binary (.db) or SQL (.sql) format. The backup file is automatically downloaded with a timestamped filename.
- **Authentication**: Requires admin privileges, valid session and CSRF token
- **Query Parameters**:
  - `format` (optional): Backup format - `db` (binary) or `sql` (SQL dump). Default: `db`
- **Response**:
  - Content-Type: `application/octet-stream` (for .db) or `text/plain` (for .sql)
  - Content-Disposition: `attachment; filename="duplistatus-backup-YYYY-MM-DDTHH-MM-SS.db"` or `.sql`
  - Binary file content (for .db) or SQL text content (for .sql)
- **Error Responses**:
  - `400`: Invalid format (must be "db" or "sql")
  - `401`: Unauthorized - Invalid session or CSRF token
  - `403`: Forbidden - Admin privileges required
  - `500`: Failed to create database backup
- **Notes**:
  - Only accessible to admin users
  - Binary format uses SQLite's backup method for integrity
  - SQL format creates a text dump of all database content
  - Timestamp in filename uses server's local timezone
  - Backup operation is logged to audit log
  - Temporary files are automatically cleaned up after download

### Restore Database - `/api/database/restore`
- **Endpoint**: `/api/database/restore`
- **Method**: POST
- **Description**: Restores the database from a backup file (.db or .sql format). Creates a safety backup before restore and clears all sessions after restore for security.
- **Authentication**: Requires admin privileges, valid session and CSRF token
- **Request Body**: FormData with a file field named `database`
  - File must be either `.db`, `.sqlite`, `.sqlite3` (binary format) or `.sql` (SQL format)
  - Maximum file size: 100MB
- **Response**:
  ```json
  {
    "success": true,
    "message": "Database restored successfully from DB file",
    "safetyBackupPath": "duplistatus-backup-YYYY-MM-DDTHH-MM-SS.db",
    "requiresReauth": true
  }
  ```
- **Error Responses**:
  - `400`: No file provided, file size exceeds limit, invalid file format, or database integrity check failed
  - `401`: Unauthorized - Invalid session or CSRF token
  - `403`: Forbidden - Admin privileges required
  - `500`: Failed to restore database (original database restored from safety backup if restore fails)
- **Notes**:
  - Only accessible to admin users
  - Automatically creates a safety backup before restore
  - Supports both binary (.db) and SQL (.sql) formats
  - Validates database integrity after restore
  - If restore fails, automatically restores from safety backup
  - All sessions are cleared after successful restore for security
  - Returns `requiresReauth: true` to indicate user needs to log in again
  - Restore operation is logged to audit log
  - For SQL format, validates SQL content before execution
  - Database connection is reinitialized after restore
  - All caches are invalidated after restore

## Backup Timestamps

### Get Last Backup Timestamps - `/api/backups/last-timestamps`
- **Endpoint**: `/api/backups/last-timestamps`
- **Method**: GET
- **Description**: Retrieves the last backup timestamp for each server-backup combination. Returns a map for easy lookup.
- **Authentication**: Requires valid session and CSRF token
- **Response**:
  ```json
  {
    "timestamps": {
      "server-id-1:Backup Name 1": "2024-03-20T10:00:00Z",
      "server-id-1:Backup Name 2": "2024-03-20T11:00:00Z",
      "server-id-2:Backup Name 1": "2024-03-20T12:00:00Z"
    },
    "raw": [
      {
        "server_name": "Server Name",
        "server_id": "server-id-1",
        "backup_name": "Backup Name 1",
        "date": "2024-03-20T10:00:00Z"
      }
    ]
  }
  ```
- **Error Responses**:
  - `401`: Unauthorized - Invalid session or CSRF token
  - `500`: Failed to fetch last backup timestamps
- **Notes**:
  - Returns both a map (for easy lookup by `server_id:backup_name`) and raw array format
  - Includes cache control headers to prevent caching
  - Useful for tracking last backup times across all server-backup combinations
  - Timestamps are in ISO format

## Application Logs Management

### Get Application Logs - `/api/application-logs`
- **Endpoint**: `/api/application-logs`
- **Method**: GET
- **Description**: Retrieves application log entries from log files. Supports reading current and rotated log files with tail functionality.
- **Authentication**: Requires admin privileges, valid session and CSRF token
- **Query Parameters**:
  - `file` (optional): Log file name to read - `application.log`, `application.log.1`, `application.log.2`, etc. If not provided, returns available files list
  - `tail` (optional): Number of lines to return from the end of the file (default: 1000, min: 1, max: 10000)
- **Response** (with file parameter):
  ```json
  {
    "logs": "log content as string...",
    "fileSize": 1024000,
    "lastModified": "2024-03-20T10:00:00Z",
    "lineCount": 5000,
    "currentFile": "application.log",
    "availableFiles": ["application.log", "application.log.1", "application.log.2"]
  }
  ```
- **Response** (without file parameter):
  ```json
  {
    "logs": "",
    "fileSize": 0,
    "lastModified": "2024-03-20T10:00:00Z",
    "lineCount": 0,
    "currentFile": "",
    "availableFiles": ["application.log", "application.log.1", "application.log.2"]
  }
  ```
- **Error Responses**:
  - `400`: Invalid tail parameter (must be 1-10000) or invalid file parameter format
  - `401`: Unauthorized - Invalid session or CSRF token
  - `403`: Forbidden - Admin privileges required
  - `404`: Log file not found
  - `500`: Failed to read log file
- **Notes**:
  - Only accessible to admin users
  - Supports reading current log file and rotated log files (up to 10 rotated files)
  - Returns last N lines (tail) from the specified log file
  - Log file name is determined by environment variable (default: `application.log`)
  - Returns list of available log files when file parameter is not provided
  - File names are validated to prevent directory traversal attacks
  - Rotated files are numbered sequentially (`.1`, `.2`, etc.)

### Export Application Logs - `/api/application-logs/export`
- **Endpoint**: `/api/application-logs/export`
- **Method**: GET
- **Description**: Exports application log entries in filtered text format. Supports filtering by log level and search string.
- **Authentication**: Requires admin privileges, valid session and CSRF token
- **Query Parameters**:
  - `file` (required): Log file name to export - `application.log`, `application.log.1`, `application.log.2`, etc.
  - `logLevels` (optional): Comma-separated list of log levels to include - `INFO`, `WARN`, `ERROR` (default: `INFO,WARN,ERROR`)
  - `search` (optional): Search string to filter log lines (case-insensitive)
- **Response**:
  - Content-Type: `text/plain`
  - Content-Disposition: `attachment; filename="duplistatus-logs-YYYY-MM-DDTHH-MM-SS.txt"`
  - Filtered log content as plain text
- **Error Responses**:
  - `400`: File parameter is required or invalid file parameter format
  - `401`: Unauthorized - Invalid session or CSRF token
  - `403`: Forbidden - Admin privileges required
  - `500`: Failed to export logs
- **Notes**:
  - Only accessible to admin users
  - Exports filtered log entries based on log level and search criteria
  - Supports filtering by log levels: `INFO`, `WARN`, `ERROR`
  - Search string filtering is case-insensitive
  - Empty lines are automatically filtered out
  - Log file name is determined by environment variable (default: `application.log`)
  - File names are validated to prevent directory traversal attacks
  - Exported file includes timestamp in filename
  - Useful for external analysis and troubleshooting
