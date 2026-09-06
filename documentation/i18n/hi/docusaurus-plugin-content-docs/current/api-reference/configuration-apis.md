# विन्यास प्रबंधन {#configuration-management}

## ईमेल विन्यास प्राप्त करें - `/api/configuration/email` {#get-email-configuration---apiconfigurationemail}
- **Endpoint**: `/api/configuration/email`
- **Method**: GET
- **Description**: वर्तमान ईमेल सूचना विन्यास और क्या ईमेल सूचना सक्रिय/विन्यस्त हैं, प्राप्त करता है।
- **Authentication**: मान्य सत्र और CSRF टोकन की आवश्यकता होती है
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
  - `400`: मास्टर कुंजी अमान्य है - सभी एन्क्रिप्टेड पासवर्ड और सेटिंग्स को पुनः विन्यस्त किया जाना चाहिए
  - `401`: Unauthorized - अमान्य सत्र या CSRF टोकन
  - `500`: ईमेल विन्यास प्राप्त करने में असफल
- **Notes**:
  - सुरक्षा के लिए पासवर्ड के बिना विन्यास लौटाता है
  - `hasPassword` फ़ील्ड शामिल है जो इंगित करता है कि क्या पासवर्ड सेट है
  - `connectionType` (plain|starttls|ssl), `senderName`, `fromAddress`, और `requireAuth` फ़ील्ड शामिल हैं
  - इंगित करता है कि क्या ईमेल सूचना परीक्षण और उत्पादन उपयोग के लिए उपलब्ध है
  - मास्टर कुंजी त्रुटियों को सुलभता से संभालता है

## ईमेल विन्यास अपडेट करें - `/api/configuration/email` {#update-email-configuration---apiconfigurationemail}
- **Endpoint**: `/api/configuration/email`
- **Method**: POST
- **Description**: SMTP ईमेल सूचना विन्यास को अपडेट करता है।
- **Authentication**: मान्य सत्र और CSRF टोकन की आवश्यकता होती है
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
  - `400`: आवश्यक फ़ील्ड गायब हैं या अमान्य पोर्ट संख्या
  - `401`: Unauthorized - अमान्य सत्र या CSRF टोकन
  - `500`: SMTP विन्यास सहेजने में असफल
- **Notes**:
  - सभी फ़ील्ड (होस्ट, पोर्ट, उपयोगकर्ता नाम, पासवर्ड, मेलटू) आवश्यक हैं
  - पोर्ट एक मान्य संख्या होने चाहिए जो 1 और 65535 के बीच है
  - सुरक्षित फ़ील्ड बूलियन है (SSL/TLS के लिए सच)
  - पासवर्ड को अलग से पासवर्ड एंडपॉइंट के माध्यम से प्रबंधित किया जाता है

## ईमेल विन्यास हटाएं - `/api/configuration/email` {#delete-email-configuration---apiconfigurationemail}
- **Endpoint**: `/api/configuration/email`
- **Method**: DELETE
- **Description**: SMTP ईमेल सूचना विन्यास को हटाता है।
- **Authentication**: वैध सत्र और CSRF टोकन की आवश्यकता होती है
- **Response**:

  ```json
  {
    "success": true,
    "message": "SMTP configuration deleted successfully"
  }
  ```

- **Error Responses**:
  - `401`: Unauthorized - अमान्य सत्र या CSRF टोकन
  - `404`: हटाने के लिए कोई SMTP विन्यास नहीं मिला
  - `500`: SMTP विन्यास हटाने में असफल
- **Notes**:
  - यह ऑपरेशन SMTP कॉन्फ़िगरेशन को स्थायी रूप से हटा देता है
  - अगर हटाने के लिए कोई कॉन्फ़िगरेशन मौजूद नहीं है तो 404 लौटाता है
  - जब Daily Summary मोड सक्षम है तो 400 लौटाता है, क्योंकि उस मोड को SMTP की आवश्यकता होती है

## ईमेल पासवर्ड अपडेट करें - `/api/configuration/email/password` {#update-email-password---apiconfigurationemailpassword}
- **Endpoint**: `/api/configuration/email/password`
- **Method**: PATCH
- **Description**: SMTP प्रमाणीकरण के लिए ईमेल पासवर्ड को अपडेट करता है।
- **Authentication**: मान्य सत्र और CSRF टोकन की आवश्यकता होती है
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
  - `400`: पासवर्ड एक स्ट्रिंग होना चाहिए या आवश्यक विन्यास फ़ील्ड गायब हैं
  - `401`: Unauthorized - अमान्य सत्र या CSRF टोकन
  - `500`: ईमेल पासवर्ड अपडेट करने में असफल
- **Notes**:
  - पासवर्ड को खाली स्ट्रिंग के रूप में सेट किया जा सकता है पासवर्ड को साफ़ करने के लिए
  - अगर कोई SMTP विन्यास मौजूद नहीं है, तो प्रदान किए गए विन्यास से एक न्यूनतम बनाता है
  - जब कोई मौजूदा SMTP विन्यास मौजूद नहीं है तो कॉन्फ़िग पैरामीटर आवश्यक है
  - पासवर्ड को एन्क्रिप्शन का उपयोग करके सुरक्षित रूप से संग्रहीत किया जाता है

## ईमेल पासवर्ड CSRF टोकन प्राप्त करें - `/api/configuration/email/password` {#get-email-password-csrf-token---apiconfigurationemailpassword}
- **Endpoint**: `/api/configuration/email/password`
- **Method**: GET
- **Description**: ईमेल पासवर्ड ऑपरेशन के लिए एक CSRF टोकन प्राप्त करता है।
- **Authentication**: मान्य सत्र की आवश्यकता होती है
- **Response**:

  ```json
  {
    "csrfToken": "csrf-token-string"
  }
  ```

- **Error Responses**:
  - `401`: Invalid ya expired session
  - `500`: Failed to generate CSRF token
- **Notes**:
  - Password update operations ke liye CSRF token return karta hai
  - Token generate karne ke liye session valid hona chahiye

## एकीकृत कॉन्फ़िगरेशन प्राप्त करें - `/api/configuration/unified` {#get-unified-configuration---apiconfigurationunified}
- **एंडपॉइंट**: `/api/configuration/unified`
- **विधि**: GET
- **विवरण**: एक एकीकृत कॉन्फ़िगरेशन ऑब्जेक्ट प्राप्त करता है जिसमें क्रॉन सेटिंग्स, सूचना आवृत्ति, और बैकअप के साथ सर्वर शामिल हैं।
- **Authentication**: वैध सत्र और CSRF टोकन की आवश्यकता होती है
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
      },
      "dailySummary": {
        "email": {
          "title": "duplistatus — Daily backup summary — {summary_date}",
          "message": "## Daily backup summary"
        },
        "ntfy": {
          "title": "duplistatus daily summary",
          "message": "Servers {server_count}, jobs {job_count}",
          "priority": "default",
          "tags": "duplicati, duplistatus, daily-summary"
        }
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

- **त्रुटि प्रतिक्रियाएँ**:
  - `500`: एकीकृत कॉन्फ़िगरेशन प्राप्त करने में सर्वर त्रुटि
- **टिप्पणियाँ**:
  - एक ही प्रतिक्रिया में सभी कॉन्फ़िगरेशन डेटा लौटाता है
  - क्रॉन सेटिंग्स, सूचना आवृत्ति, और बैकअप के साथ सर्वर शामिल हैं
  - ईमेल कॉन्फ़िगरेशन में `hasPassword` फ़ील्ड शामिल है लेकिन वास्तविक पासवर्ड नहीं
  - बेहतर प्रदर्शन के लिए सभी डेटा को समानांतर में प्राप्त करता है

## NTFY कॉन्फ़िगरेशन प्राप्त करें - `/api/configuration/ntfy` {#get-ntfy-configuration---apiconfigurationntfy}
- **एंडपॉइंट**: `/api/configuration/ntfy`
- **विधि**: GET
- **विवरण**: वर्तमान NTFY कॉन्फ़िगरेशन सेटिंग्स प्राप्त करता है।
- **Authentication**: वैध सत्र और CSRF टोकन की आवश्यकता होती है
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

- **त्रुटि प्रतिक्रियाएँ**:
  - `401`: अनधिकृत - अमान्य सत्र या CSRF टोकन
  - `500`: NTFY कॉन्फ़िगरेशन प्राप्त करने में असफल
- **टिप्पणियाँ**:
  - वर्तमान NTFY कॉन्फ़िगरेशन सेटिंग्स लौटाता है
  - सूचना प्रणाली प्रबंधन के लिए उपयोग किया जाता है
  - कॉन्फ़िगरेशन डेटा तक पहुंचने के लिए प्रमाणीकरण की आवश्यकता होती है

## सूचना कॉन्फ़िगरेशन प्राप्त करें - `/api/configuration/notifications` {#get-notification-configuration---apiconfigurationnotifications}
- **एंडपॉइंट**: `/api/configuration/notifications`
- **विधि**: GET
- **विवरण**: वर्तमान सूचना आवृत्ति कॉन्फ़िगरेशन प्राप्त करता है।
- **Authentication**: वैध सत्र और CSRF टोकन की आवश्यकता होती है
- **Response**:

  ```json
  {
    "value": "every_day"
  }
  ```

- **त्रुटि प्रतिक्रियाएँ**:
  - `401`: अनधिकृत - अमान्य सत्र या CSRF टोकन
  - `500`: कॉन्फ़िगरेशन प्राप्त करने में असफल
- **टिप्पणियाँ**:
  - वर्तमान सूचना आवृत्ति कॉन्फ़िगरेशन प्राप्त करता है
  - विलंबित बैकअप सूचना प्रबंधन के लिए उपयोग किया जाता है
  - एक में से एक लौटाता है: `"onetime"`, `"every_day"`, `"every_week"`, `"every_month"`

## सूचना कॉन्फ़िगरेशन अपडेट करें - `/api/configuration/notifications` {#update-notification-configuration---apiconfigurationnotifications}
- **एंडपॉइंट**: `/api/configuration/notifications`
- **विधि**: POST
- **विवरण**: सूचना कॉन्फ़िगरेशन (NTFY सेटिंग्स या सूचना आवृत्ति) अपडेट करता है।
- **प्रमाणीकरण**: मान्य सत्र और CSRF टोकन की आवश्यकता होती है
- **अनुरोध बॉडी**:
  NTFY कॉन्फ़िगरेशन के लिए:

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

सूचना आवृत्ति के लिए:

  ```json
  {
    "value": "every_week"
  }
  ```

- **प्रतिक्रिया**:
  NTFY कॉन्फ़िगरेशन के लिए:

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

सूचना आवृत्ति के लिए:

  ```json
  {
    "value": "every_week"
  }
  ```

- **उपलब्ध मान**: `"onetime"`, `"every_day"`, `"every_week"`, `"every_month"`
- **त्रुटि प्रतिक्रियाएँ**:
  - `401`: अनधिकृत - अमान्य सत्र या CSRF टोकन
  - `400`: NTFY कॉन्फ़िगरेशन आवश्यक है या अमान्य मान
  - `500`: सूचना कॉन्फ़िगरेशन अपडेट करने में सर्वर त्रुटि
- **टिप्पणियाँ**:
  - NTFY कॉन्फ़िगरेशन और सूचना आवृत्ति अपडेट दोनों का समर्थन करता है
  - जब ntfy फ़ील्ड प्रदान की जाती है तो केवल NTFY कॉन्फ़िगरेशन अपडेट करता है
  - जब मान फ़ील्ड प्रदान की जाती है तो सूचना आवृत्ति अपडेट करता है
  - अगर कोई टॉपिक प्रदान नहीं की जाती है तो डिफ़ॉल्ट टॉपिक जनरेट करता है
  - मौजूदा कॉन्फ़िगरेशन सेटिंग्स को संरक्षित करता है
  - `accessToken` फ़ील्ड का उपयोग करता है बजाय अलग-अलग यूज़रनेम/पासवर्ड फ़ील्ड
  - अनुमत विकल्पों के खिलाफ सूचना आवृत्ति मान की वैधता की जाँच करता है
  - यह निर्धारित करता है कि विलंबित सूचनाएँ कितनी बार भेजी जाती हैं

## बैकअप सेटिंग्स अपडेट करें - `/api/configuration/backup-settings` {#update-backup-settings---apiconfigurationbackup-settings}
- **एंडपॉइंट**: `/api/configuration/backup-settings`
- **विधि**: POST
- **विवरण**: विशिष्ट सर्वरों/बैकअप के लिए बैकअप सूचना सेटिंग्स अपडेट करता है।
- **Authentication**: मान्य सत्र और CSRF टोकन की आवश्यकता होती है
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

- **त्रुटि प्रतिक्रियाएँ**:
  - `401`: अनधिकृत - अमान्य सत्र या CSRF टोकन
  - `400`: backupSettings आवश्यक है
  - `500`: बैकअप सेटिंग्स अपडेट करने में सर्वर त्रुटि
- **Notes**:
  - विशिष्ट server/backup के लिए backup notification settings को update करता है
  - निष्क्रिय backup के लिए विलंबित backup notifications को साफ़ करता है
  - timeout settings बदलने पर notifications को clear करता है

## Notification Templates को Update करें - `/api/configuration/templates` {#update-notification-templates---apiconfigurationtemplates}
- **Endpoint**: `/api/configuration/templates`
- **Method**: POST
- **Description**: Notification templates को update करता है।
- **Authentication**: मान्य सत्र और CSRF टोकन की आवश्यकता होती है
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
  - `401`: Unauthorized - Invalid session या CSRF token
  - `400`: templates आवश्यक हैं
  - `500`: Notification templates को update करने में server error
- **Notes**:
  - विभिन्न बैकअप स्थितियों के लिए अधिसूचना टेम्प्लेट्स को अपडेट करता है
  - मौजूदा कॉन्फ़िगरेशन सेटिंग्स को संरक्षित करता है
  - टेम्प्लेट्स Markdown ईमेल बॉडी और `{placeholder}` प्रतिस्थापन का समर्थन करते हैं
  - एक `dailySummary` टेम्प्लेट सेट (ईमेल विषय/बॉडी और संक्षिप्त NTFY) की आवश्यकता होती है

## Daily Summary - `/api/configuration/daily-summary` {#daily-summary---apiconfigurationdaily-summary}
- **Endpoint**: `/api/configuration/daily-summary`
- **Method**: GET, POST
- **Description**: Daily Summary मोड को पढ़ता या अपडेट करता है। GET सैनिटाइज़्ड सेटिंग्स, डिस्पैचर स्वास्थ्य, अगली घटना, और प्रति-चैनल वितरण स्थिति लौटाता है। POST `enabled`, `localTime` (`HH:mm`), `timeZone` (IANA), और `sendNtfy` को सहेजता है। सक्षम करने के लिए वैलिड SMTP और स्वस्थ `daily-summary-dispatch` टास्क की आवश्यकता होती है। NTFY सक्षम करने के लिए स्टोर्ड NTFY सेटिंग्स की आवश्यकता होती है। शेड्यूल बदलने पर अगली **भविष्य** घटना सेट होती है।
- **Authentication**: GET के लिए वैलिड सेशन और CSRF टोकन की आवश्यकता होती है। POST के लिए व्यवस्थापक सेशन और CSRF टोकन की आवश्यकता होती है।
- **Error Responses**:
  - `400`: अमान्य समय/समय क्षेत्र, SMTP/NTFY का अभाव, या डिस्पैचर स्वस्थ नहीं
  - `401`: अनधिकृत
  - `500`: Daily Summary को पढ़ने या अपडेट करने में असफल

## Send Daily Summary - `/api/configuration/daily-summary/send` {#send-daily-summary---apiconfigurationdaily-summarysend}
- **Endpoint**: `/api/configuration/daily-summary/send`
- **Method**: POST
- **Description**: वर्तमान स्थिति का एक अतिरिक्त स्नैपशॉट तुरंत भेजता है। अगली शेड्यूल की घटना को खर्च नहीं करता। स्टोर्ड SMTP (और स्टोर्ड NTFY जब चयनित हो) का उपयोग करता है। अनुरोध में प्राप्तकर्ता पते या एंडपॉइंट्स स्वीकार नहीं करता।
- **Authentication**: व्यवस्थापक सेशन और CSRF टोकन की आवश्यकता होती है

## Retry Daily Summary - `/api/configuration/daily-summary/retry` {#retry-daily-summary---apiconfigurationdaily-summaryretry}
- **Endpoint**: `/api/configuration/daily-summary/retry`
- **Method**: POST
- **Description**: संग्रहीत पेलोड से असफल चैनलों को पुनः प्रयास करता है। वैकल्पिक बॉडी `{ "occurrenceKey": "..." }`; अन्यथा नवीनतम असफल घटना को पुनः प्रयास करता है।
- **Authentication**: व्यवस्थापक सेशन और CSRF टोकन की आवश्यकता होती है

## Preview Daily Summary - `/api/configuration/daily-summary/preview` {#preview-daily-summary---apiconfigurationdaily-summarypreview}
- **Endpoint**: `/api/configuration/daily-summary/preview`
- **Method**: POST
- **Description**: वर्तमान स्नैपशॉट को रेंडर करता है बिना भेजे और बिना वितरण-लेजर पंक्तियों को लिखे।
- **Authentication**: वैलिड सेशन और CSRF टोकन की आवश्यकता होती है

## Overdue Tolerance प्राप्त करें - `/api/configuration/overdue-tolerance` {#get-overdue-tolerance---apiconfigurationoverdue-tolerance}
- **Endpoint**: `/api/configuration/overdue-tolerance`
- **Method**: GET
- **Description**: वर्तमान overdue tolerance setting को प्राप्त करता है।
- **Response**:

  ```json
  {
    "overdue_tolerance": "2h"
  }
  ```

- **Error Responses**:
  - `500`: Overdue tolerance प्राप्त करने में असफल
- **Notes**:
  - वर्तमान overdue tolerance setting को लौटाता है
  - वर्तमान configuration को प्रदर्शित करने के लिए उपयोग किया जाता है

## Overdue Tolerance को Update करें - `/api/configuration/overdue-tolerance` {#update-overdue-tolerance---apiconfigurationoverdue-tolerance}
- **Endpoint**: `/api/configuration/overdue-tolerance`
- **Method**: POST
- **Description**: Overdue tolerance setting को update करता है।
- **Authentication**: मान्य सत्र और CSRF टोकन की आवश्यकता होती है
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

- **Error Responses**:
  - `401`: Unauthorized - Invalid session या CSRF token
  - `400`: overdue_tolerance आवश्यक है
  - `500`: Overdue tolerance को update करने में server error
- **Notes**:
  - Overdue tolerance setting को update करता है (`"1h"`, `"2h"` आदि जैसे string format स्वीकार करता है; नए installs के लिए default `2h` है)
  - जब backups को विलंबित माना जाता है, उस पर प्रभाव डालता है
  - Overdue backup checker द्वारा उपयोग किया जाता है

## बाहरी एपीआई सुरक्षा - `/api/configuration/external-api-security` {#external-api-security---apiconfigurationexternal-api-security}
- **एंडपॉइंट**: `/api/configuration/external-api-security`
- **विधियाँ**: GET, PATCH
- **विवरण**: बाहरी एपीआई के लिए कुंजी की आवश्यकता है या नहीं, साथ ही `/api/upload` आकार और दर सीमाएँ पढ़ें या अपडेट करें।
- **प्रमाणीकरण**: व्यवस्थापक विशेषाधिकार, मान्य सत्र और CSRF टोकन की आवश्यकता होती है
- **PATCH शरीर**:

  ```json
  {
    "requireApiKey": false,
    "uploadLimits": {
      "enabled": true,
      "maxBytes": 5242880,
      "perMinute": 20,
      "perHour": 200
    }
  }
  ```

## आईपी अनुमति सूची - `/api/configuration/ip-allowlist` {#ip-allowlist---apiconfigurationip-allowlist}
- **एंडपॉइंट**: `/api/configuration/ip-allowlist`
- **विधियाँ**: GET, PATCH
- **विवरण**: विश्वसनीय प्रॉक्सी और व्यवस्थापक / बाहरी-एपीआई CIDR अनुमति सूचियों को पढ़ें या अपडेट करें। व्यवस्थापक सूची को सक्षम करने से पहले, वर्तमान क्लाइंट आईपी को पहले सूचीबद्ध होना चाहिए (लूपबैक को छोड़ दिया जाता है)।
- **Authentication**: एडमिन प्राइविलेज, वैध सेशन और CSRF टोकन की आवश्यकता होती है
