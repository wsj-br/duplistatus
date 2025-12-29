

# Notification System

## Test Notification - `/api/notifications/test`
- **Endpoint**: `/api/notifications/test`
- **Method**: POST
- **Description**: Send test notifications (simple, template-based, or email) to verify notification configuration.
- **Authentication**: Requires valid session and CSRF token
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
  For email test:
    ```json
    {
      "type": "email"
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
    "success": true,
    "message": "Test notifications sent successfully via NTFY and Email",
    "channels": ["NTFY", "Email"]
  }
  ```
  For email test:
  ```json
  {
    "message": "Test email sent successfully"
  }
  ```
  The test email content displays:
  - SMTP server hostname and port
  - Connection type (Plain SMTP, STARTTLS, or Direct SSL/TLS)
  - SMTP authentication requirement status
  - SMTP username (only shown when authentication is required)
  - Recipient email address
  - From address and sender name used for the email
  - Test timestamp
- **Error Responses**:
  - `401`: Unauthorized - Invalid session or CSRF token
  - `400`: NTFY configuration is required, invalid configuration, or email not configured
  - `500`: Failed to send test notification with error details
- **Notes**:
  - Supports simple test messages, template-based notifications, and email tests
  - Template testing uses sample data to replace template variables
  - Includes timestamp in the test message
  - Validates NTFY URL and topic before sending
  - Uses `accessToken` field for authentication
  - For template tests, sends notifications to both NTFY and email (if configured)
  - Email tests require SMTP configuration to be set up
  - The test email endpoint clears the request cache before reading SMTP configuration, ensuring that external scripts can update the configuration and have it immediately reflected in test emails

## Check Overdue Backups - `/api/notifications/check-overdue`
- **Endpoint**: `/api/notifications/check-overdue`
- **Method**: POST
- **Description**: Manually triggers the overdue backup check and sends notifications.
- **Authentication**: Requires valid session and CSRF token
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
  - `401`: Unauthorized - Invalid session or CSRF token
  - `500`: Failed to check for overdue backups
- **Notes**:
  - Manually triggers overdue backup check
  - Returns statistics about the check process
  - Sends notifications for overdue backups found

## Clear Overdue Timestamps - `/api/notifications/clear-overdue-timestamps`
- **Endpoint**: `/api/notifications/clear-overdue-timestamps`
- **Method**: POST
- **Description**: Clears all overdue backup notification timestamps, allowing notifications to be sent again.
- **Authentication**: Requires valid session and CSRF token
- **Response**:
  ```json
  {
    "message": "Overdue backup notification timestamps cleared successfully"
  }
  ```
- **Error Responses**:
  - `401`: Unauthorized - Invalid session or CSRF token
  - `500`: Failed to clear overdue backup timestamps
- **Notes**:
  - Clears all overdue backup notification timestamps
  - Allows notifications to be sent again
  - Useful for testing notification system
