# बाहरी API {/* #external-apis */}

ये एंडपॉइंट अन्य एप्लिकेशन और एकीकरण द्वारा उपयोग के लिए डिज़ाइन किए गए हैं, उदाहरण के लिए [Homepage](../user-guide/homepage-integration.md)। ये CSRF-मुक्त हैं और सत्र कुकीज़ (session cookies) का उपयोग नहीं करते हैं।

प्रमाणीकरण वैकल्पिक है और डिफ़ॉल्ट रूप से बंद रहता है। जबकि कुंजियाँ वैकल्पिक हैं, क्लाइंट कुंजी छोड़ सकते हैं या भेज सकते हैं: एक मान्य मेल खाने वाले स्कोप की कुंजी स्वीकार की जाती है और रिकॉर्ड की जाती है; अमान्य कुंजी को अनदेखा कर दिया जाता है और अनुरोध फिर भी आगे बढ़ता है। जब [API कुंजियाँ](../user-guide/settings/api-keys-settings.md) में **Require API keys** सक्षम हो, तो कुंजी को `?api_key=`, `X-Api-Key`, या `Authorization: Bearer` के रूप में भेजें। अपलोड कुंजियाँ केवल `POST /api/upload` पर काम करती हैं। रीड कुंजियाँ केवल `/api/summary` और `/api/lastbackup*` पर काम करती हैं। क्वेरी-स्ट्रिंग कुंजियाँ रिवर्स-प्रॉक्सी एक्सेस लॉग में दिखाई देती हैं।

एक [IP अनुमति सूची](../user-guide/settings/ip-allowlist-settings.md) भी इन मार्गों को प्रतिबंधित कर सकती है। जब दोनों सूचियाँ बंद होती हैं तब `/api/health` और `/api/ping` सार्वजनिक रहते हैं; जब कोई भी सूची सक्षम होती है तो वे एडमिन या बाहरी सूची से लूपबैक और CIDR स्वीकार करते हैं, और गैर-लूपबैक क्लाइंट दर-सीमित (rate-limited) होते हैं।

## समग्र सारांश प्राप्त करें - `/api/summary` {/* #get-overall-summary---apisummary */}
- **Endpoint**: `/api/summary`
- **Method**: GET
- **विवरण**: सभी सर्वर पर सभी बैकअप परिचालनों का सारांश पुनर्प्राप्त करता है।
- **प्रतिक्रिया**:

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
  - `401`: कुंजियों की आवश्यकता होने पर अनुपलब्ध या अमान्य API कुंजी
  - `403`: कुंजी स्कोप `read` नहीं है, या क्लाइंट IP बाहरी अनुमति सूची में नहीं है
  - `429`: रीड-API दर सीमा पार हो गई
  - `500`: सारांश डेटा प्राप्त करने में सर्वर त्रुटि
- **नोट्स**:
  - संस्करण 0.5.x में, फ़ील्ड `totalBackupedSize` को `totalBackupSize` द्वारा बदल दिया गया था
  - संस्करण 0.7.x में, फ़ील्ड `totalMachines` को `totalServers` द्वारा बदल दिया गया था
  - फ़ील्ड `overdueBackupsCount` वर्तमान में बकाया बैकअप की संख्या दिखाता है
  - फ़ील्ड `secondsSinceLastBackup` सभी सर्वर पर अंतिम बैकअप के बाद का समय सेकंड में दिखाता है
  - डेटा प्राप्त करना विफल होने पर शून्य के साथ फ़ॉलबैक प्रतिक्रिया लौटाता है
  - **नोट**: आंतरिक डैशबोर्ड उपयोग के लिए, `/api/dashboard` का उपयोग करने पर विचार करें जिसमें यह डेटा और अतिरिक्त जानकारी शामिल है

## नवीनतम बैकअप प्राप्त करें - `/api/lastbackup/:serverId` {/* #get-latest-backup---apilastbackupserverid */}
- **Endpoint**: `/api/lastbackup/:serverId`
- **Method**: GET
- **विवरण**: किसी विशिष्ट सर्वर के लिए नवीनतम बैकअप जानकारी पुनर्प्राप्त करता है।
- **पैरामीटर**:
  - `serverId`: सर्वर पहचानकर्ता (ID या नाम)

:::note
सर्वर पहचानकर्ता URL एन्कोडेड होना चाहिए।
:::

- **प्रतिक्रिया**:

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

- **त्रुटि प्रतिक्रियाएं**:
  - `401`: API कुंजी गायब या अमान्य जब कुंजियां आवश्यक हों
  - `403`: कुंजी स्कोप `read` नहीं है, या क्लाइंट IP बाहरी अनुमति सूची पर नहीं है
  - `404`: सर्वर नहीं मिला
  - `429`: रीड-API दर सीमा पार हो गई
  - `500`: आंतरिक सर्वर त्रुटि
- **नोट्स**:
  - संस्करण 0.7.x में, प्रतिक्रिया ऑब्जेक्ट कुंजी `machine` से बदलकर `server` हो गई
  - सर्वर पहचानकर्ता ID या नाम हो सकता है
  - यदि कोई बैकअप मौजूद नहीं है, तो latest_backup के लिए null लौटाता है
  - कैशिंग को रोकने के लिए कैश नियंत्रण हेडर शामिल हैं

## नवीनतम बैकअप प्राप्त करें - `/api/lastbackups/:serverId` {/* #get-latest-backups---apilastbackupsserverid */}
- **Endpoint**: `/api/lastbackups/:serverId`
- **Method**: GET
- **विवरण**: किसी विशिष्ट सर्वर पर सभी कॉन्फ़िगर किए गए बैकअप (उदा. 'फ़ाइलें', 'डेटाबेस') के लिए नवीनतम बैकअप जानकारी प्राप्त करता है।
- **पैरामीटर**:
  - `serverId`: सर्वर पहचानकर्ता (ID या नाम)

:::note
सर्वर पहचानकर्ता URL एन्कोडेड होना चाहिए।
:::

- **प्रतिक्रिया**:

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

- **त्रुटि प्रतिक्रियाएं**:
  - `401`: API कुंजी गायब या अमान्य जब कुंजियां आवश्यक हों
  - `403`: कुंजी स्कोप `read` नहीं है, या क्लाइंट IP बाहरी अनुमति सूची पर नहीं है
  - `404`: सर्वर नहीं मिला
  - `429`: Read-API दर सीमा अतिक्रम की गई
  - `500`: आंतरिक सर्वर त्रुटि
- **नोट्स**:
  - संस्करण 0.7.x में, प्रतिक्रिया ऑब्जेक्ट कुंजी `machine` से `server` में बदल गई, और फ़ील्ड `backup_types_count` का नाम बदलकर `backup_jobs_count` कर दिया गया
  - सर्वर पहचानकर्ता ID या नाम हो सकता है
  - प्रत्येक बैकअप कार्य (backup_name) के लिए नवीनतम बैकअप लौटाता है जो सर्वर के पास है
  - `/api/lastbackup/:serverId` के विपरीत जो सर्वर का केवल एक सबसे हाल का बैकअप लौटाता है (बैकअप कार्य की परवाह किए बिना)
  - कैशिंग को रोकने के लिए कैश नियंत्रण हेडर शामिल करता है

## अपलोड बैकअप डेटा - `/api/upload` {/* #upload-backup-data---apiupload */}
- **एंडपॉइंट**: `/api/upload`
- **विधि**: POST
- **विवरण**: सर्वर के लिए बैकअप ऑपरेशन डेटा अपलोड करता है। डुप्लिकेट बैकअप रन पहचान का समर्थन करता है और सूचनाएं भेजता है।
- **अनुरोध निकाय**: Duplicati द्वारा भेजा गया JSON निम्नलिखित विकल्पों के साथ:

  ```bash
  --send-http-json-urls=http://my.local.server:9666/api/upload?api_key=YOUR_UPLOAD_KEY
  --send-http-log-level=Information
  --send-http-max-log-lines=500
```

Duplicati 2.0.9.106 से पुराने संस्करण पर, `--send-http-url` को `--send-http-result-output-format=Json` के साथ उपयोग करें। [Duplicati सर्वर कॉन्फ़िगरेशन](../installation/duplicati-server-configuration.md) देखें।

- **प्रतिक्रिया**:

  ```json
  {
    "success": true
  }
  ```

- **त्रुटि प्रतिक्रियाएं**:
  - `400`: Extra या Data अनुभागों में आवश्यक फ़ील्ड गायब या अमान्य, या अमान्य MainOperation
  - `401`: API कुंजी गायब या अमान्य जब कुंजियां आवश्यक हों
  - `403`: कुंजी स्कोप `upload` नहीं है, या क्लाइंट IP बाहरी अनुमति सूची पर नहीं है
  - `409`: डुप्लिकेट बैकअप डेटा (अनदेखा किया गया)
  - `413`: अनुरोध निकाय कॉन्फ़िगर की गई अपलोड आकार सीमा से अधिक है (डिफ़ॉल्ट 5 MB)
  - `429`: अपलोड या प्रमाणीकरण-विफलता दर सीमा अतिक्रम की गई (`Retry-After` सेट है)
  - `500`: बैकअप डेटा प्रसंस्करण में सर्वर त्रुटि
- **नोट्स**:
  - केवल बैकअप ऑपरेशन को प्रसंस्करण करता है (MainOperation "Backup" होना चाहिए)
  - Extra अनुभाग में आवश्यक फ़ील्ड को मान्य करता है: machine-id, machine-name, backup-name, backup-id
  - Data अनुभाग में आवश्यक फ़ील्ड को मान्य करता है: ParsedResult, BeginTime, Duration
  - स्वचालित रूप से डुप्लिकेट बैकअप रन का पता लगाता है और 409 स्थिति लौटाता है
  - सफल बैकअप सम्मिलन के बाद सूचनाएं भेजता है (यदि कॉन्फ़िगर किया गया हो)
  - विकास मोड में डिबगिंग के लिए प्रोजेक्ट की रूट में `data` निर्देशिका में अनुरोध डेटा को फ़ाइल में लॉग करता है
  - डेटा सामंजस्य के लिए लेनदेन का उपयोग करता है
