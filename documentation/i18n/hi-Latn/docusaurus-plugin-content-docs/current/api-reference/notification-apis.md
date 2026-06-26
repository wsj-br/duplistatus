# Suchna Pranali {#notification-system}

## Parikshan Suchna - `/api/notifications/test` {#test-notification---apinotificationstest}
- **Endpoint**: `/api/notifications/test`
- **Method**: POST
- **Description**: Suchnaayein (saral, template-aadhaarit, ya email) bhejkar NTFY configuration ki jaanch karein.
- **Authentication**: Vaidh session aur CSRF token avashyak hai
- **Request Body**:
  Saral parikshan ke liye:

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

Template parikshan ke liye:

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

Email parikshan ke liye:

    ```json
    {
      "type": "email"
    }
    ```

- **Response**:
  Saral parikshan ke liye:

  ```json
  {
    "message": "Test notification sent successfully"
  }
  ```

Template parikshan ke liye:

  ```json
  {
    "success": true,
    "message": "Test notifications sent successfully via NTFY and Email",
    "channels": ["NTFY", "Email"]
  }
  ```

Email parikshan ke liye:

  ```json
  {
    "message": "Test email sent successfully"
  }
  ```

Test email ka content dikhata hai:
  - SMTP server hostname aur port
  - Connection type (Plain SMTP, STARTTLS, ya Direct SSL/TLS)
  - SMTP authentication avashyakta ki stithi
  - SMTP username (keval tab dikhaya jaata hai jab authentication avashyak ho)
  - Praaptak email address
  - Email ke liye istemaal kiya gaya Se address aur bhejane wale ka naam
  - Parikshan ka samay chinh
- **Truti Responses**:
  - `401`: Anadhikrit - Avidh session ya CSRF token
  - `400`: NTFY configuration avashyak hai, avaidh configuration, ya email configure nahin kiya gaya hai
  - `500`: Truti vivaran ke saath test suchna bhejane mein asafal
- **Notes**:
  - Saral test sandesh, template-aadhaarit suchnaayein, aur email parikshan ka samarthan karta hai
  - Template parikshan template variables ko replace karne ke liye sample data ka upyog karta hai
  - Test sandesh mein samay chinh shaamil hai
  - Bhejane se pehle NTFY URL aur topic ko validate karta hai
  - Authentication ke liye `accessToken` field ka upyog karta hai
  - Template parikshan ke liye, NTFY aur email (yadi configure kiya gaya ho) dono ko suchnaayein bhejta hai
  - Email parikshan ke liye SMTP configuration ka setup avashyak hai
  - Test email endpoint, SMTP configuration ko padhne se pehle request cache ko clear karta hai, yeh sunishchit karta hai ki bahari scripts configuration ko update kar sakti hain aur yeh turant test emails mein reflect hoga

## Vilambit Backups ki Janch Karein - `/api/notifications/check-overdue` {#check-overdue-backups---apinotificationscheck-overdue}
- **Endpoint**: `/api/notifications/check-overdue`
- **Method**: POST
- **Description**: Vilambit backup check ko manchaliyak roop se trigger karta hai aur suchnaayein bhejta hai.
- **Authentication**: Vaidh session aur CSRF token ki avashyakta hai
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

- **Truti Responses**:
  - `500`: Vilambit backups ke liye jaanch karne mein asafal
- **Notes**:
  - Vilambit backup check ko manchaliyak roop se trigger karta hai
  - Check prakriya ke baare mein aankde lautata hai
  - Mile vilambit backups ke liye suchnaayein bhejta hai

## Vilambit Samay Chinh Clear Karein - `/api/notifications/clear-overdue-timestamps` {#clear-overdue-timestamps---apinotificationsclear-overdue-timestamps}
- **Endpoint**: `/api/notifications/clear-overdue-timestamps`
- **Method**: POST
- **Description**: Sabhi vilambit backup notification timestamps ko clear karta hai, jisse suchnaayein phir se bheji ja sakti hain.
- **Authentication**: Vaidh session aur CSRF token ki avashyakta hai
- **Response**:

  ```json
  {
    "message": "Overdue backup notification timestamps cleared successfully"
  }
  ```

- **Truti Responses**:
  - `500`: Vilambit backup notification timestamps ko clear karne mein asafal
- **Notes**:
  - Sabhi vilambit backup notification timestamps ko clear karta hai
  - Suchnaayein phir se bhejne ki anumati deta hai
  - Suchna pranali ke parikshan ke liye upyogi hai
