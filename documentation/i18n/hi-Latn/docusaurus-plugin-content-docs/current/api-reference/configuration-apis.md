# Configuration Management {#configuration-management}

## Get Email Configuration - `/api/configuration/email` {#get-email-configuration---apiconfigurationemail}
- **Endpoint**: `/api/configuration/email`
- **Method**: GET
- **Description**: Retrieves the current email notification configuration aur whether email notifications are enabled/configured.
- **Authentication**: Requires valid session aur CSRF token
- **Response** (configured):

  ```json
  {
    "configured": true,
    "config": {
      "host": "smtp.example.com",
      "port": 465,
      "connectionType": "ssl",
      "username": "user@example.com",
      "mailto": "admin@example.com",
      "senderName": "duplistatus",
      "fromAddress": "user@example.com",
      "requireAuth": true,
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
  - `400`: Master key is invalid - Sabhi encrypted passwords aur settings must be reconfigured
  - `401`: Unauthorized - Invalid session or CSRF token
  - `500`: Failed to get email configuration
- **Notes**:
  - Returns configuration without password for security
  - Includes `hasPassword` field to indicate if password is set
  - Includes `connectionType` (plain|starttls|ssl), `senderName`, `fromAddress`, aur `requireAuth` fields
  - Indicates if email notifications are available for test aur production use
  - Handles master key validation errors gracefully

## Update Email Configuration - `/api/configuration/email` {#update-email-configuration---apiconfigurationemail}
- **Endpoint**: `/api/configuration/email`
- **Method**: POST
- **Description**: Updates the SMTP email notification configuration.
- **Authentication**: Vaidh session aur CSRF token avashyak hai
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
  - Sabhi fields (host, port, username, password, mailto) are required
  - Port must be a valid number between 1 aur 65535
  - Secure field is boolean (true for SSL/TLS)
  - Password is managed separately through the password endpoint

## Delete Email Configuration - `/api/configuration/email` {#delete-email-configuration---apiconfigurationemail}
- **Endpoint**: `/api/configuration/email`
- **Method**: DELETE
- **Description**: Deletes the SMTP email notification configuration.
- **Authentication**: Vaidh session aur CSRF token ki avashyakta hai
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

## Update Email Password - `/api/configuration/email/password` {#update-email-password---apiconfigurationemailpassword}
- **Endpoint**: `/api/configuration/email/password`
- **Method**: PATCH
- **Description**: Updates the email password for SMTP authentication.
- **Authentication**: Vaidh session aur CSRF token avashyak hai
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

## Get Email Password CSRF Token - `/api/configuration/email/password` {#get-email-password-csrf-token---apiconfigurationemailpassword}
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

- **Truti Jawab**:
  - `401`: Amannya ya samapt session
  - `500`: CSRF token generate karne mein asamarth
- **Dhyan Den**:
  - Password update operations ke liye CSRF token vapas karta hai
  - Token generate karne ke liye session vaidh hona chahiye

## Get Unified Configuration - `/api/configuration/unified` {#get-unified-configuration---apiconfigurationunified}
- **Endpoint**: `/api/configuration/unified`
- **Method**: GET
- **Description**: Ek unified configuration object prapt karta hai jismein sabhi configuration data shamil hai, jismein cron settings, notification frequency, aur servers with backups hain.
- **Authentication**: Vaidh session aur CSRF token ki avashyakta hai
- **Response**:

  ```json
  {
    "ntfy": {
      "url": "https://ntfy.sh",
      "topic": "duplistatus-notifications",
      "accessToken": ""
    },
    "templates": {
      "language": "en-GB",
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
    "email": {
      "host": "smtp.example.com",
      "port": 465,
      "connectionType": "ssl",
      "username": "user@example.com",
      "mailto": "admin@example.com",
      "senderName": "duplistatus",
      "fromAddress": "user@example.com",
      "requireAuth": true,
      "hasPassword": true
    },
    "overdue_tolerance": "2h",
    "backup_settings": {
      "server1:backup1": {
        "notificationEvent": "all",
        "expectedInterval": 24,
        "overdueBackupCheckEnabled": true,
        "intervalUnit": "hours",
        "expectedBackupDate": "2025-02-07T00:00:00.000Z",
        "lastBackupDate": "2025-02-06T00:00:00.000Z"
      }
    },
    "serverAddresses": [
      {
        "id": "server1",
        "name": "Server 1",
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
        "id": "server1",
        "name": "Server 1",
        "backupName": "backup1",
        "server_url": "http://localhost:8200",
        "alias": "My Server",
        "note": "Primary backup server",
        "hasPassword": true,
        "expectedBackupDate": "2025-02-07T00:00:00.000Z",
        "lastBackupDate": "2025-02-06T00:00:00.000Z"
      }
    ]
  }
  ```

- **Error Responses**:
  - `500`: Unified configuration fetch karte samay server truti
- **Notes**:
  - Ek hi response mein sabhi configuration data return karta hai
  - Cron settings, notification frequency, aur servers with backups shamil hain
  - Email configuration mein `hasPassword` field shamil hai lekin actual password nahi
  - Behtar performance ke liye sabhi data parallel mein fetch karta hai

## Get NTFY Configuration - `/api/configuration/ntfy` {#get-ntfy-configuration---apiconfigurationntfy}
- **Endpoint**: `/api/configuration/ntfy`
- **Method**: GET
- **Description**: Vartaman NTFY configuration settings prapt karta hai.
- **Authentication**: Vaidh session aur CSRF token ki avashyakta hai
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
  - `401`: Anadhikrit - Avidht session ya CSRF token
  - `500`: NTFY configuration fetch karne mein asafal
- **Notes**:
  - Vartaman NTFY configuration settings return karta hai
  - Notification system management ke liye istemal kiya jata hai
  - Configuration data access karne ke liye authentication ki avashyakta hai

## Get Notification Configuration - `/api/configuration/notifications` {#get-notification-configuration---apiconfigurationnotifications}
- **Endpoint**: `/api/configuration/notifications`
- **Method**: GET
- **Description**: Vartaman notification frequency configuration prapt karta hai.
- **Authentication**: Vaidh session aur CSRF token ki avashyakta hai
- **Response**:

  ```json
  {
    "value": "every_day"
  }
  ```

- **Error Responses**:
  - `401`: Anadhikrit - Avidht session ya CSRF token
  - `500`: Config fetch karne mein asafal
- **Notes**:
  - Vartaman notification frequency configuration prapt karta hai
  - Vilambit backup notification management ke liye istemal kiya jata hai
  - Inmein se ek return karta hai: `"onetime"`, `"every_day"`, `"every_week"`, `"every_month"`

## Update Notification Configuration - `/api/configuration/notifications` {#update-notification-configuration---apiconfigurationnotifications}
- **Endpoint**: `/api/configuration/notifications`
- **Method**: POST
- **Description**: Notification configuration (NTFY settings ya notification frequency) update karta hai.
- **Authentication**: Vidht session aur CSRF token ki avashyakta hai
- **Request Body**:
  NTFY configuration ke liye:

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

Notification frequency ke liye:

  ```json
  {
    "value": "every_week"
  }
  ```

- **Response**:
  NTFY configuration ke liye:

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

Notification frequency ke liye:

  ```json
  {
    "value": "every_week"
  }
  ```

- **Available Values**: `"onetime"`, `"every_day"`, `"every_week"`, `"every_month"`
- **Error Responses**:
  - `401`: Anadhikrit - Avidht session ya CSRF token
  - `400`: NTFY configuration avashyak hai ya avidht value
  - `500`: Server notification configuration update karte samay truti
- **Notes**:
  - NTFY configuration aur notification frequency dono updates ko support karta hai
  - Jab ntfy field provide kiya jata hai to kewal NTFY configuration update karta hai
  - Jab value field provide kiya jata hai to notification frequency update karta hai
  - Agar koi topic provide nahi kiya gaya hai to default topic generate karta hai
  - Vidhyaman configuration settings ko preserve karta hai
  - Alag username/password fields ke bajay `accessToken` field ka istemal karta hai
  - Anumati prapt vikalpon ke viruddh notification frequency value ko validate karta hai
  - Vilambit notifications kitni baar bheji jati hain, isko prabhavit karta hai

## Update Backup Settings - `/api/configuration/backup-settings` {#update-backup-settings---apiconfigurationbackup-settings}
- **Endpoint**: `/api/configuration/backup-settings`
- **Method**: POST
- **Description**: Vishesh serveron/backups ke liye backup notification settings update karta hai.
- **Authentication**: Vaidh session aur CSRF token avashyak hai
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
  - `401`: Anadhikrit - Avidht session ya CSRF token
  - `400`: backupSettings avashyak hai
  - `500`: Server backup settings update karte samay truti
- **Suchnaayein**:
  - Vishes serveron/backup ke liye backup suchnaayein settings ko update karta hai
  - Nishkriya backup ke liye vilambit backup suchnaayein ko saaf karta hai
  - Timeout settings badalne par suchnaayein ko saaf karta hai

## Suchna Template Update Karen - `/api/configuration/templates` {#update-notification-templates---apiconfigurationtemplates}
- **Endpoint**: `/api/configuration/templates`
- **Method**: POST
- **Vivaran**: Suchna templates ko update karta hai.
- **Authentication**: Vaidh session aur CSRF token avashyak hai
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

- **Truti Pratikriyaayein**:
  - `401`: Anadhikrit - Avidh session ya CSRF token
  - `400`: templates anivarya hain
  - `500`: Suchna templates ko update karne mein server truti
- **Suchnaayein**:
  - Vibhinn backup sthitiyon ke liye suchna templates ko update karta hai
  - Vartaman configuration settings ko banaye rakhta hai
  - Templates variable substitution ka samarthan karte hain

## Vilambit Sahanshilta Prapt Karen - `/api/configuration/overdue-tolerance` {#get-overdue-tolerance---apiconfigurationoverdue-tolerance}
- **Endpoint**: `/api/configuration/overdue-tolerance`
- **Method**: GET
- **Vivaran**: Vartaman vilambit sahanshilta setting prapt karta hai.
- **Response**:

  ```json
  {
    "overdue_tolerance": "2h"
  }
  ```

- **Truti Pratikriyaayein**:
  - `500`: Vilambit sahanshilta prapt karne mein asafal
- **Suchnaayein**:
  - Vartaman vilambit sahanshilta setting lautata hai
  - Vartaman configuration dikhane ke liye upyog kiya gaya

## Vilambit Sahanshilta Update Karen - `/api/configuration/overdue-tolerance` {#update-overdue-tolerance---apiconfigurationoverdue-tolerance}
- **Endpoint**: `/api/configuration/overdue-tolerance`
- **Method**: POST
- **Vivaran**: Vilambit sahanshilta setting ko update karta hai.
- **Authentication**: Vaidh session aur CSRF token avashyak hai
- **Request Body**:

  ```json
  {
    "overdue_tolerance": "2h"
  }
  ```

- **Response**:

  ```json
  {
    "message": "Overdue tolerance updated successfully"
  }
  ```

- **Truti Pratikriyaayein**:
  - `401`: Anadhikrit - Avidh session ya CSRF token
  - `400`: overdue_tolerance anivarya hai
  - `500`: Vilambit sahanshilta ko update karne mein server truti
- **Suchnaayein**:
  - Vilambit sahanshilta setting ko update karta hai (`"1h"`, `"2h"`, aadi jaise string format ko sweekar karta hai; naye install ke liye default `2h` hai)
  - Kab backup ko vilambit mana jata hai, isko prabhavit karta hai
  - Vilambit backup checker dwara upyog kiya gaya
