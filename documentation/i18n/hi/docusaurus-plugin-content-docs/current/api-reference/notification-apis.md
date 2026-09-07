# अधिसूचना प्रणाली {/* #notification-system */}

## Parikshan Suchnaayein - `/api/notifications/test` {/* #test-notification---apinotificationstest */}
- **Endpoint**: `/api/notifications/test`
- **Method**: POST
- **Description**: Shochnaayi karyawahi ki janch ke liye Parikshan suchnaayen (sadharan, template-based, ya email) bhejein.
- **प्रमाणीकरण**: व्यवस्थापक सत्र और CSRF टोकन की आवश्यकता होती है
- **अनुरोध बॉडी**:
  सरल परीक्षण के लिए:

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
  - NTFY परीक्षणों में संग्रहीत NTFY कॉन्फ़िगरेशन का उपयोग किया जाता है; एक क्लाइंट-सप्लाई NTFY URL का उपयोग नहीं किया जाता
  - संग्रहीत होने पर `accessToken` फ़ील्ड का उपयोग प्रमाणीकरण के लिए किया जाता है
  - टेम्पलेट परीक्षणों में, दोनों NTFY और ईमेल (यदि कॉन्फ़िगर किया गया हो) को सूचनाएं भेजी जाती हैं
  - ईमेल परीक्षणों के लिए SMTP कॉन्फ़िगरेशन सेट अप की आवश्यकता होती है
  - परीक्षण ईमेल एंडपॉइंट SMTP कॉन्फ़िगरेशन को पढ़ने से पहले अनुरोध कैश को साफ़ करता है, जिससे बाहरी स्क्रिप्ट कॉन्फ़िगरेशन को अपडेट कर सकते हैं और इसे परीक्षण ईमेल में तुरंत प्रतिबिंबित किया जा सके
  - टेम्पलेट परीक्षण और दैनिक सारांश भेजें-अब प्रति-बैकअप दबाव को बायपास करते हैं

## Suchnaayi Template ka Poorvavalokan - `/api/notifications/preview` {/* #preview-notification-template---apinotificationspreview */}
- **Endpoint**: `/api/notifications/preview`
- **Method**: POST
- **Description**: Suchnaayi template ko production Markdown renderer ke saath bheje bina render karta hai. Body mein `kind` (`success`, `warning`, `overdueBackup`, ya `dailySummaryEmail`) aur edited ho raha template shamil hai. Daily Summary poorvaavalokan vartaman real snapshot ka upayog karte hain; any prakar deterministic sample values ka upayog karte hain. Email HTML sandboxed iframe ke liye hai.
- **Authentication**: वैलिड सेशन और CSRF टोकन की आवश्यकता होती है

## Vilambit Backups ki Janch karein - `/api/notifications/check-overdue` {/* #check-overdue-backups---apinotificationscheck-overdue */}
- **Endpoint**: `/api/notifications/check-overdue`
- **Method**: POST
- **Description**: Vilambit backup janch ko manually trigger karta hai aur suchnaayen bheja hai.
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

## Vilambit Samayachinh ki Safai karein - `/api/notifications/clear-overdue-timestamps` {/* #clear-overdue-timestamps---apinotificationsclear-overdue-timestamps */}
- **Endpoint**: `/api/notifications/clear-overdue-timestamps`
- **Method**: POST
- **Description**: Sabhi vilambit backup suchnaayi samayachinh ko saaf karta hai, jisse suchnaayen phir se bheje ja sakein.
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
