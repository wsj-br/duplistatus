# बाहरी APIs {#external-apis}

ये एंडपॉइंट्स अन्य एप्लिकेशन और इंटीग्रेशन के लिए डिज़ाइन किए गए हैं, उदाहरण के लिए [होमपेज](../user-guide/homepage-integration.md).

## सारांश प्राप्त करें - `/api/summary` {#get-overall-summary---apisummary}
- **एंडपॉइंट**: `/api/summary`
- **विधि**: GET
- **विवरण**: सभी सर्वरों पर सभी बैकअप ऑपरेशन का सारांश प्राप्त करता है।
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

- **त्रुटि प्रतिक्रियाएँ**:
  - `500`: सारांश डेटा प्राप्त करने में सर्वर त्रुटि
- **नोट्स**:
  - संस्करण 0.5.x में, फ़ील्ड `totalBackupedSize` को `totalBackupSize` से बदल दिया गया था
  - संस्करण 0.7.x में, फ़ील्ड `totalMachines` को `totalServers` से बदल दिया गया था
  - फ़ील्ड `overdueBackupsCount` में वर्तमान में ओवरड्यू बैकअप्स की संख्या दिखाई जाती है
  - फ़ील्ड `secondsSinceLastBackup` में सभी सर्वरों पर अंतिम बैकअप के बाद से सेकंड्स में समय दिखाया जाता है
  - डेटा प्राप्त करने में विफल होने पर शून्य के साथ फ़ॉलबैक प्रतिक्रिया लौटाता है
  - **नोट**: आंतरिक डैशबोर्ड उपयोग के लिए, इस डेटा के अलावा अतिरिक्त जानकारी शामिल करने वाले `/api/dashboard` का उपयोग करने पर विचार करें

## नवीनतम बैकअप प्राप्त करें - `/api/lastbackup/:serverId` {#get-latest-backup---apilastbackupserverid}
- **एंडपॉइंट**: `/api/lastbackup/:serverId`
- **विधि**: GET
- **विवरण**: किसी विशिष्ट सर्वर के लिए नवीनतम बैकअप जानकारी प्राप्त करता है।
- **पैरामीटर**:
  - `serverId`: सर्वर पहचानकर्ता (आईडी या नाम)

:::note
सर्वर पहचानकर्ता को URL एन्कोडेड होना चाहिए।
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

- **त्रुटि प्रतिक्रियाएँ**:
  - `404`: सर्वर नहीं मिला
  - `500`: आंतरिक सर्वर त्रुटि
- **नोट्स**:
  - संस्करण 0.7.x में, प्रतिक्रिया ऑब्जेक्ट की कुंजी `machine` से `server` में बदल गई
  - सर्वर पहचानकर्ता आईडी या नाम हो सकता है
  - यदि कोई बैकअप मौजूद नहीं है तो नवीनतम_बैकअप के लिए शून्य लौटाता है
  - कैशिंग को रोकने के लिए कैश कंट्रोल हेडर शामिल हैं

## नवीनतम बैकअप प्राप्त करें - `/api/lastbackups/:serverId` {#get-latest-backups---apilastbackupsserverid}
- **एंडपॉइंट**: `/api/lastbackups/:serverId`
- **विधि**: GET
- **विवरण**: किसी विशिष्ट सर्वर पर कॉन्फ़िगर किए गए सभी बैकअप (जैसे 'फ़ाइलें', 'डेटाबेस') के लिए नवीनतम बैकअप जानकारी प्राप्त करता है।
- **पैरामीटर**:
  - `serverId`: सर्वर पहचानकर्ता (आईडी या नाम)

:::note
सर्वर पहचानकर्ता को URL एन्कोडेड होना चाहिए।
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

- **त्रुटि प्रतिक्रियाएँ**:
  - `404`: सर्वर नहीं मिला
  - `500`: आंतरिक सर्वर त्रुटि
- **नोट्स**:
  - संस्करण 0.7.x में, प्रतिक्रिया ऑब्जेक्ट की कुंजी `machine` से `server` में बदल गई और फ़ील्ड `backup_types_count` को `backup_jobs_count` में पुनर्नामित किया गया
  - सर्वर पहचानकर्ता आईडी या नाम हो सकता है
  - सर्वर के लिए प्रत्येक बैकअप जॉब (बैकअप_नाम) के लिए नवीनतम बैकअप लौटाता है
  - `/api/lastbackup/:serverId` के विपरीत जो सर्वर के एकल सबसे हाल के बैकअप को लौटाता है (बैकअप जॉब के स्वतंत्र रूप से)
  - कैशिंग को रोकने के लिए कैश कंट्रोल हेडर शामिल हैं

## बैकअप डेटा अपलोड करें - `/api/upload` {#upload-backup-data---apiupload}
- **एंडपॉइंट**: `/api/upload`
- **विधि**: POST
- **विवरण**: एक सर्वर के लिए बैकअप ऑपरेशन डेटा अपलोड करता है। डुप्लिकेट बैकअप रन डिटेक्शन का समर्थन करता है और सूचनाएं भेजता है।
- **अनुरोध बॉडी**: डुप्लिकेटी द्वारा भेजा गया JSON जिसमें निम्नलिखित विकल्प शामिल हैं:

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

- **त्रुटि प्रतिक्रियाएँ**:
  - `400`: एक्स्ट्रा या डेटा अनुभाग में आवश्यक फ़ील्ड्स गायब हैं या अमान्य मेन ऑपरेशन
  - `409`: डुप्लिकेट बैकअप डेटा (अनदेखा किया जाता है)
  - `500`: बैकअप डेटा प्रोसेस करने में सर्वर त्रुटि
- **Notes**:
  - केवल बैकअप ऑपरेशन को प्रोसेस करता है (MainOperation "Backup" होना चाहिए)
  - Extra अनुभाग में आवश्यक फ़ील्डों की जाँच करता है: machine-id, machine-name, backup-name, backup-id
  - Data अनुभाग में आवश्यक फ़ील्डों की जाँच करता है: ParsedResult, BeginTime, Avadhi
  - डुप्लिकेट बैकअप रन को स्वचालित रूप से पता लगाता है और 409 स्थिति को रिटर्न करता है
  - सफल बैकअप इन्सर्ट के बाद Suchnaayein भेजता है (यदि कॉन्फ़िगर किया गया हो)
  - रिक्वेस्ट डेटा को `data` डायरेक्टरी में फ़ाइल में लॉग करता है जो प्रोजेक्ट के रूट में है डेवलपमेंट मोड में डीबगिंग के लिए
  - डेटा की सुसंगतता के लिए ट्रांजैक्शन का उपयोग करता है
