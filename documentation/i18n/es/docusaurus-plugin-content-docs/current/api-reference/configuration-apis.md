# Configuration Management {#configuration-management}

## Get Email Configuration - `/api/configuration/email` {#get-email-configuration-apiconfigurationemail}

- **Endpoint**: `/api/configuration/email`
- **Method**: GET
- **Description**: Retrieves the current email notification configuration and whether email notifications are enabled/configured.
- **Authentication**: Requires valid session and CSRF token
- **Response** (configured):
  ```json
  {
    "configured": true,
    "config": {
      "host": "smtp.example.com",
      "port": 465,
      "secure": true,
      "username": "user@example.com",
      "mailto": "admin@example.com",
      "hasPassword": true
    },
    "message": "Email is configured and ready to use."
  }
  ```
- **Response** (not configured):
  ```json
  {
    "configured": false,
    "config": null,
    "message": "Email is not configured. Please configure SMTP settings."
  }
  ```
- **Error Responses**:
  - `400`: Master key is invalid - All encrypted passwords and settings must be reconfigured
  - `401`: Unauthorized - Invalid session or CSRF token
  - `500`: Failed to get email configuration
- **Notes**:
  - Returns configuration without password for security
  - Includes `hasPassword` field to indicate if password is set
  - Indicates if email notifications are available for test and production use
  - Handles master key validation errors gracefully

## Update Email Configuration - `/api/configuration/email` {#update-email-configuration-apiconfigurationemail}

- **Endpoint**: `/api/configuration/email`
- **Method**: POST
- **Description**: Updates the SMTP email notification configuration.
- **Authentication**: Requires valid session and CSRF token
- **Request Body**:
  ```json
  {
    "host": "smtp.example.com",
    "port": 465,
    "secure": true,
    "username": "user@example.com",
    "password": "password",
    "mailto": "admin@example.com"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "SMTP configuration saved successfully"
  }
  ```
- **Error Responses**:
  - `400`: Missing required fields or invalid port number
  - `401`: Unauthorized - Invalid session or CSRF token
  - `500`: Failed to save SMTP configuration
- **Notes**:
  - All fields (host, port, username, password, mailto) are required
  - Port must be a valid number between 1 and 65535
  - Secure field is boolean (true for SSL/TLS)
  - Password is managed separately through the password endpoint

## Delete Email Configuration - `/api/configuration/email` {#delete-email-configuration-apiconfigurationemail}

- **Endpoint**: `/api/configuration/email`
- **Method**: DELETE
- **Description**: Deletes the SMTP email notification configuration.
- **Authentication**: Requires valid session and CSRF token
- **Response**:
  ```json
  {
    "success": true,
    "message": "SMTP configuration deleted successfully"
  }
  ```
- **Error Responses**:
  - `401`: Unauthorized - Invalid Session or CSRF token
  - `404`: No SMTP configuration found to delete
  - `500`: Failed to delete SMTP configuration
- **Notes**:
  - This operation permanently removes the SMTP configuration
  - Returns 404 if no configuration exists to delete

## Update Email Password - `/api/configuration/email/password` {#update-email-password-apiconfigurationemailpassword}

- **Endpoint**: `/api/configuration/email/password`
- **Method**: PATCH
- **Description**: Updates the email password for SMTP authentication.
- **Authentication**: Requires valid session and CSRF token
- **Request Body**:
  ```json
  {
    "password": "new-password",
    "config": {
      "host": "smtp.example.com",
      "port": 465,
      "secure": true,
      "username": "user@example.com",
      "mailto": "admin@example.com"
    }
  }
  ```
- **Response**:
  ```json
  {
    "message": "Email password updated successfully"
  }
  ```
- **Error Responses**:
  - `400`: Password must be a string or missing required config fields
  - `401`: Unauthorized - Invalid session or CSRF token
  - `500`: Failed to update email password
- **Notes**:
  - Password can be an empty string to clear the password
  - If no SMTP config exists, creates a minimal one from provided config
  - Config parameter is required when no existing SMTP configuration exists
  - Password is stored securely using encryption

## Get Email Password CSRF Token - `/api/configuration/email/password` {#get-email-password-csrf-token-apiconfigurationemailpassword}

- **Endpoint**: `/api/configuration/email/password`
- **Method**: GET
- **Description**: Retrieves a CSRF token for email password operations.
- **Authentication**: Requires valid session
- **Response**:
  ```json
  {
    "csrfToken": "csrf-token-string"
  }
  ```
- **Error Responses**:
  - `401`: Invalid or expired session
  - `500`: Failed to generate CSRF token
- **Notes**:
  - Returns CSRF token for use with password update operations
  - Session must be valid to generate token

## Get Unified Configuration - `/api/configuration/unified` {#get-unified-configuration-apiconfigurationunified}

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
    "email": {
      "host": "smtp.example.com",
      "port": 465,
      "secure": true,
      "username": "user@example.com",
      "mailto": "admin@example.com",
      "enabled": true,
      "hasPassword": true
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
  - Email configuration includes `hasPassword` field but not the actual password
  - Fetches all data in parallel for better performance

## Get NTFY Configuration - `/api/configuration/ntfy` {#get-ntfy-configuration-apiconfigurationntfy}

- **Endpoint**: `/api/configuration/ntfy`
- **Method**: GET
- **Description**: Retrieves the current NTFY configuration settings.
- **Authentication**: Requires valid session and CSRF token
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
  - `401`: Unauthorized - Invalid session or CSRF token
  - `500`: Failed to fetch NTFY configuration
- **Notes**:
  - Returns current NTFY configuration settings
  - Used for notification system management
  - Requires authentication for accessing configuration data

## Get Notification Configuration - `/api/configuration/notifications` {#get-notification-configuration-apiconfigurationnotifications}

- **Endpoint**: `/api/configuration/notifications`
- **Method**: GET
- **Description**: Retrieves the current notification frequency configuration.
- **Authentication**: Requires valid session and CSRF token
- **Response**:
  ```json
  {
    "value": "every_day"
  }
  ```
- **Error Responses**:
  - `401`: Unauthorized - Invalid session or CSRF token
  - `500`: Failed to fetch config
- **Notes**:
  - Retrieves current notification frequency configuration
  - Used for overdue backup notification management
  - Returns one of: `"onetime"`, `"every_day"`, `"every_week"`, `"every_month"`

## Update Notification Configuration - `/api/configuration/notifications` {#update-notification-configuration-apiconfigurationnotifications}

- **Endpoint**: `/api/configuration/notifications`
- **Method**: POST
- **Description**: Updates notification configuration (NTFY settings or notification frequency).
- **Authentication**: Requires valid session and CSRF token
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
  - `401`: Unauthorized - Invalid session or CSRF token
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

## Update Backup Settings - `/api/configuration/backup-settings` {#update-backup-settings-apiconfigurationbackup-settings}

- **Endpoint**: `/api/configuration/backup-settings`
- **Method**: POST
- **Description**: Updates the backup notification settings for specific servers/backups.
- **Authentication**: Requires valid session and CSRF token
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
  - `401`: Unauthorized - Invalid session or CSRF token
  - `400`: backupSettings is required
  - `500`: Server error updating backup settings
- **Notes**:
  - Updates backup notification settings for specific servers/backups
  - Cleans up overdue backup notifications for disabled backups
  - Clears notifications when timeout settings change

## Update Notification Templates - `/api/configuration/templates` {#update-notification-templates-apiconfigurationtemplates}

- **Endpoint**: `/api/configuration/templates`
- **Method**: POST
- **Description**: Updates the notification templates.
- **Authentication**: Requires valid session and CSRF token
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
  - `401`: Unauthorized - Invalid session or CSRF token
  - `400`: templates are required
  - `500`: Server error updating notification templates
- **Notes**:
  - Updates notification templates for different backup statuses
  - Preserves existing configuration settings
  - Templates support variable substitution

## Get Overdue Tolerance - `/api/configuration/overdue-tolerance` {#get-overdue-tolerance-apiconfigurationoverdue-tolerance}

- **Endpoint**: `/api/configuration/overdue-tolerance`
- **Method**: GET
- **Description**: Retrieves the current overdue tolerance setting.
- **Response**:
  ```json
  {
    "overdue_tolerance": "1h"
  }
  ```
- **Error Responses**:
  - `500`: Failed to get overdue tolerance
- **Notes**:
  - Returns the current overdue tolerance setting
  - Used for displaying current configuration

## Update Overdue Tolerance - `/api/configuration/overdue-tolerance` {#update-overdue-tolerance-apiconfigurationoverdue-tolerance}

- **Endpoint**: `/api/configuration/overdue-tolerance`
- **Method**: POST
- **Description**: Updates the overdue tolerance setting.
- **Authentication**: Requires valid session and CSRF token
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
  - `401`: Unauthorized - Invalid session or CSRF token
  - `400`: overdue_tolerance is required
  - `500`: Server error updating overdue tolerance
- **Notes**:
  - Updates the overdue tolerance setting (accepts string format like "1h", "2h", etc.)
  - Affects when backups are considered overdue
  - Used by the overdue backup checker
