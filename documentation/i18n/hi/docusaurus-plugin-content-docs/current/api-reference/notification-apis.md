# Suchnaayein Pranali {#notification-system}

## Suchna Parikshan - `/api/notifications/test` {#test-notification---apinotificationstest}
- **Endpoint**: `/api/notifications/test`
- **Method**: POST
- **Description**: Suchna configuration ko verify karne ke liye test suchnaayein (sadha, template-based, ya email) bhejein.
- **Authentication**: Valid session aur CSRF token chahiye
- **Request Body**:
  Sadha test ke liye:

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

Template test ke liye:

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

Email test ke liye:

    ```json
    {
      "type": "email"
    }
    ```

- **Response**:
  Sadha test ke liye:

  ```json
  {
    "message": "Test notification sent successfully"
  }
  ```

Template test ke liye:

  ```json
  {
    "success": true,
    "message": "Test notifications sent successfully via NTFY and Email",
    "channels": ["NTFY", "Email"]
  }
  ```

Email test ke liye:

  ```json
  {
    "message": "Test email sent successfully"
  }
  ```

Test email content dikhata hai:
  - SMTP server hostname aur port
  - Connection type (Plain SMTP, STARTTLS, ya Direct SSL/TLS)
  - SMTP authentication requirement status
  - SMTP username (sirf jab authentication chahiye ho)
  - Praaptak email address
  - Email ke liye use ki gayi From address aur sender name
  - Test timestamp
- **Error Responses**:
  - `401`: Unauthorized - Invalid session ya CSRF token
  - `400`: NTFY configuration chahiye, invalid configuration, ya email configure nahin kiya gaya hai
  - `500`: Test suchna bhejne mein asafal with error details
- **Notes**:
  - Sadha test messages, template-based notifications, aur email tests ko support karta hai
  - Template testing sample data ka use karta hai template variables ko replace karne ke liye
  - Test message mein timestamp shamil hai
  - Bhejne se pehle NTFY URL aur topic ko validate karta hai
  - Authentication ke liye `accessToken` field ka use karta hai
  - Template tests ke liye, notifications ko NTFY aur email (agar configure kiya gaya ho) dono ko bhejein
  - Email tests ke liye SMTP configuration set up karna zaroori hai
  - Test email endpoint SMTP configuration padhne se pehle request cache ko clear karta hai, isse external scripts ko configuration update karne aur test emails mein immediately reflect karne ki suvidha deta hai

## Vilambit Backup Janch Karein - `/api/notifications/check-overdue` {#check-overdue-backups---apinotificationscheck-overdue}
- **Endpoint**: `/api/notifications/check-overdue`
- **Method**: POST
- **Description**: Vilambit backup check ko manually trigger karta hai aur notifications bhejein.
- **Authentication**: वैध सत्र और CSRF टोकन की आवश्यकता होती है
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
  - `500`: Vilambit backup janch karne mein asafal
- **Notes**:
  - Vilambit backup check ko manually trigger karta hai
  - Check process ke baare mein statistics return karta hai
  - Vilambit backups found ke liye notifications bhejein

## Vilambit Timestamp Clear Karein - `/api/notifications/clear-overdue-timestamps` {#clear-overdue-timestamps---apinotificationsclear-overdue-timestamps}
- **Endpoint**: `/api/notifications/clear-overdue-timestamps`
- **Method**: POST
- **Description**: Sabhi vilambit backup notification timestamps ko clear karta hai, isse notifications dobara bhejne ki suvidha deta hai.
- **Authentication**: वैध सत्र और CSRF टोकन की आवश्यकता होती है
- **Response**:

  ```json
  {
    "message": "Overdue backup notification timestamps cleared successfully"
  }
  ```

- **Error Responses**:
  - `500`: Vilambit backup timestamps clear karne mein asafal
- **Notes**:
  - Sabhi vilambit backup notification timestamps ko clear karta hai
  - Notifications dobara bhejne ki suvidha deta hai
  - Notification system ko test karne ke liye useful hai
