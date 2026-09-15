# कोर ऑपरेशन्स {/* #core-operations */}

## डैशबोर्ड डेटा प्राप्त करें (समेकित) - `/api/dashboard` {/* #get-dashboard-data-consolidated---apidashboard */}
- **एंडपॉइंट**: `/api/dashboard`
- **मेथड**: GET
- **विवरण**: एकल समेकित प्रतिक्रिया में सभी डैशबोर्ड डेटा प्राप्त करता है, जिसमें सर्वर सारांश, समग्र सारांश, और चार्ट डेटा शामिल हैं।
- **प्रतिक्रिया**:

  ```json
  {
    "serversSummary": [
      {
        "id": "server-id",
        "name": "Server Name",
        "lastBackupDate": "2024-03-20T10:00:00Z",
        "lastBackupStatus": "Success",
        "lastBackupDuration": "00:38:31",
        "lastBackupListCount": 10,
        "lastBackupName": "Backup Name",
        "lastBackupId": "backup-id",
        "backupCount": 15,
        "totalWarnings": 5,
        "totalErrors": 0,
        "availableBackups": ["v1", "v2", "v3"],
        "isBackupOverdue": false,
        "notificationEvent": "all",
        "expectedBackupDate": "2024-03-21T10:00:00Z",
        "expectedBackupElapsed": "2 hours ago",
        "lastOverdueCheck": "2024-03-20T12:00:00Z",
        "lastNotificationSent": "N/A"
      }
    ],
    "overallSummary": {
      "totalServers": 3,
      "totalBackups": 9,
      "totalUploadedSize": 2397229507,
      "totalStorageUsed": 43346796938,
      "totalBackupSize": 126089687807,
      "overdueBackupsCount": 2,
      "secondsSinceLastBackup": 7200
    },
    "chartData": [
      {
        "date": "20/03/2024",
        "isoDate": "2024-03-20T10:00:00Z",
        "uploadedSize": 1024000,
        "duration": 45,
        "fileCount": 1500,
        "fileSize": 2048000,
        "storageSize": 3072000,
        "backupVersions": 5
      }
    ]
  }
  ```

- **त्रुटि प्रतिक्रियाएँ**:
  - `500`: डैशबोर्ड डेटा प्राप्त करने में सर्वर त्रुटि
- **नोट्स**:
  - यह एंडपॉइंट पिछले `/api/servers-summary` एंडपॉइंट को समेकित करता है (जिसे हटा दिया गया है)
  - `overallSummary` फ़ील्ड में वही डेटा होता है जो `/api/summary` में होता है (जिसे बाहरी ऐप्लिकेशन्स के लिए बनाए रखा गया है)
  - `chartData` फ़ील्ड में वही डेटा होता है जो `/api/chart-data/aggregated` में होता है (जो प्रत्यक्ष ऐक्सेस के लिए अभी भी मौजूद है)
  - एकाधिक API कॉलों को एकल अनुरोध में घटाकर बेहतर प्रदर्शन प्रदान करता है
  - सर्वोत्तम प्रदर्शन के लिए सभी डेटा समानांतर रूप से प्राप्त किया जाता है
  - `secondsSinceLastBackup` फ़ील्ड सभी सर्वर पर अंतिम बैकअप के बाद का समय सेकंड में दिखाता है

## सभी सर्वर प्राप्त करें - `/api/servers` {/* #get-all-servers---apiservers */}
- **एंडपॉइंट**: `/api/servers`
- **मेथड**: GET
- **विवरण**: सभी सर्वर की उनकी बुनियादी जानकारी के साथ एक सूची प्राप्त करता है। वैकल्पिक रूप से बैकअप जानकारी शामिल करता है।
- **प्रमाणीकरण**: मान्य सत्र और CSRF टोकन की आवश्यकता है
- **क्वेरी पैरामीटर्स**:
  - `includeBackups` (वैकल्पिक): प्रत्येक सर्वर के लिए बैकअप जानकारी शामिल करने के लिए `true` पर सेट करें
- **प्रतिक्रिया** (पैरामीटर्स के बिना):

  ```json
  [
    {
      "id": "server-id",
      "name": "Server Name",
      "alias": "Server Alias",
      "note": "Additional notes about the server"
    }
  ]
  ```

- **प्रतिक्रिया** (`includeBackups=true` के साथ):

  ```json
  [
    {
      "id": "server-id",
      "name": "Server Name",
      "backupName": "Backup Name",
      "server_url": "http://localhost:8200",
      "alias": "Server Alias",
      "note": "Additional notes about the server",
      "hasPassword": true
    }
  ]
  ```

- **त्रुटि प्रतिक्रियाएँ**:
  - `401`: अनधिकृत - अमान्य सत्र या CSRF टोकन
  - `500`: सर्वर प्राप्त करने में सर्वर त्रुटि
- **नोट्स**:
  - उपनाम और नोट फ़ील्ड सहित सर्वर जानकारी लौटाता है
  - जब `includeBackups=true`, URL और पासवर्ड स्थिति के साथ सर्वर-बैकअप संयोजन लौटाता है
  - पिछले `/api/servers-with-backups` एंडपॉइंट को समेकित करता है (जिसे हटा दिया गया है)
  - सर्वर चयन, प्रदर्शन, और कॉन्फ़िगरेशन उद्देश्यों के लिए उपयोग किया जाता है
  - सर्वर के पास संग्रहीत पासवर्ड है या नहीं, यह इंगित करने के लिए `hasPassword` फ़ील्ड शामिल है

## सर्वर विवरण प्राप्त करें - `/api/servers/:id` {/* #get-server-details---apiserversid */}
- **एंडपॉइंट**: `/api/servers/:id`
- **मेथड**: GET
- **विवरण**: किसी विशिष्ट सर्वर के बारे में जानकारी प्राप्त करता है। बुनियादी सर्वर जानकारी या बैकअप और चार्ट डेटा सहित विस्तृत जानकारी लौटा सकता है।
- **प्रमाणीकरण**: मान्य सत्र और CSRF टोकन की आवश्यकता है
- **पैरामीटर्स**:
  - `id`: सर्वर पहचानकर्ता
- **क्वेरी पैरामीटर्स**:
  - `includeBackups` (वैकल्पिक): बैकअप डेटा शामिल करने के लिए `true` पर सेट करें
  - `includeChartData` (वैकल्पिक): चार्ट डेटा शामिल करने के लिए `true` पर सेट करें
- **प्रतिक्रिया** (पैरामीटर्स के बिना):

  ```json
  {
    "id": "server-id",
    "name": "Server Name",
    "alias": "Server Alias",
    "note": "Additional notes about the server",
    "server_url": "http://localhost:8200"
  }
  ```

- **प्रतिक्रिया** (पैरामीटर्स के साथ):

  ```json
  {
    "id": "server-id",
    "name": "Server Name",
    "alias": "Server Alias",
    "note": "Additional notes about the server",
    "server_url": "http://localhost:8200",
    "backups": [
      { ... }
    ],
    "chartData": [
      { ... }
    ]
  }
  ```

- **त्रुटि प्रतिक्रियाएँ**:
  - `401`: अनधिकृत - अमान्य सत्र या CSRF टोकन
  - `404`: सर्वर नहीं मिला
  - `500`: सर्वर विवरण प्राप्त करने में सर्वर त्रुटि
- **नोट्स**:
  - कोई क्वेरी पैरामीटर प्रदान न किए जाने पर बुनियादी सर्वर जानकारी लौटाता है
  - `includeBackups` या `includeChartData` में से किसी एक को भी `true` पर सेट करने से बैकअप और chartData सहित पूरा सर्वर डेटा वापस मिलता है
  - सर्वर सेटिंग्स और विवरण दृश्यों के लिए उपयोग किया जाता है

## सर्वर अपडेट करें - `/api/servers/:id` {/* #update-server---apiserversid */}
- **एंडपॉइंट**: `/api/servers/:id`
- **मेथड**: PATCH
- **विवरण**: उपनाम, नोट और सर्वर URL सहित सर्वर विवरण अपडेट करता है।
- **प्रमाणीकरण**: मान्य सत्र और CSRF टोकन की आवश्यकता है
- **पैरामीटर्स**:
  - `id`: सर्वर पहचानकर्ता
- **रिक्वेस्ट बॉडी**:

  ```json
  {
    "server_url": "http://localhost:8200",
    "alias": "Server Alias",
    "note": "Additional notes about the server"
  }
  ```

- **प्रतिक्रिया**:

  ```json
  {
    "message": "Server updated successfully",
    "serverId": "server-id",
    "server_url": "http://localhost:8200",
    "alias": "Server Alias",
    "note": "Additional notes about the server"
  }
  ```

- **त्रुटि प्रतिक्रियाएं**:
  - `401`: अनधिकृत - अमान्य सत्र या CSRF टोकन
  - `404`: सर्वर नहीं मिला
  - `500`: अपडेट के दौरान सर्वर त्रुटि
- **नोट्स**:
  - सर्वर उपनाम, नोट और सर्वर URL को अपडेट करता है
  - सभी फ़ील्ड वैकल्पिक हैं
  - सभी फ़ील्ड के लिए रिक्त स्ट्रिंग की अनुमति है

## सर्वर हटाएं - `/api/servers/:id` {/* #delete-server---apiserversid */}
- **एंडपॉइंट**: `/api/servers/:id`
- **विधि**: DELETE
- **विवरण**: सर्वर और उसके सभी संबद्ध बैकअप हटाता है।
- **प्रमाणीकरण**: मान्य सत्र और CSRF टोकन की आवश्यकता है
- **पैरामीटर**:
  - `id`: सर्वर पहचानकर्ता

- **प्रतिक्रिया**:

  ```json
  {
    "message": "Successfully deleted server and 15 backups",
    "status": 200,
    "changes": {
      "backupChanges": 15,
      "serverChanges": 1
    }
  }
  ```

- **त्रुटि प्रतिक्रियाएं**:
  - `401`: अनधिकृत - अमान्य सत्र या CSRF टोकन
  - `404`: सर्वर नहीं मिला
  - `500`: हटाने के दौरान सर्वर त्रुटि
- **नोट्स**: 
  - यह ऑपरेशन अपरिवर्तनीय है
  - सर्वर से संबद्ध सभी बैकअप डेटा स्थायी रूप से हटा दिया जाएगा
  - सर्वर रिकॉर्ड स्वयं भी हटा दिया जाएगा
  - हटाए गए बैकअप और सर्वर की संख्या लौटाता है

## अतिदेय जानकारी के साथ सर्वर डेटा प्राप्त करें - `/api/detail/:serverId` {/* #get-server-data-with-overdue-info---apidetailserverid */}
- **एंडपॉइंट**: `/api/detail/:serverId`
- **विधि**: GET
- **विवरण**: अतिदेय बैकअप स्थिति सहित विस्तृत सर्वर जानकारी प्राप्त करता है।
- **पैरामीटर**:
  - `serverId`: सर्वर पहचानकर्ता

- **प्रतिक्रिया**:

  ```json
  {
    "server": {
      "id": "server-id",
      "name": "Server Name",
      "backups": [...]
    },
    "overdueBackups": [
      {
        "serverName": "Server Name",
        "backupName": "Backup Name",
        "lastBackupDate": "2024-03-20T10:00:00Z",
        "lastNotificationSent": "2024-03-20T12:00:00Z",
        "notificationEvent": "all",
        "expectedBackupDate": "2024-03-21T10:00:00Z",
        "expectedBackupElapsed": "2 hours ago"
      }
    ],
    "lastOverdueCheck": "2024-03-20T12:00:00Z"
  }
  ```

- **त्रुटि प्रतिक्रियाएं**:
  - `404`: सर्वर नहीं मिला
  - `500`: सर्वर विवरण प्राप्त करने में सर्वर त्रुटि
- **नोट्स**:
  - अतिदेय बैकअप जानकारी के साथ सर्वर डेटा लौटाता है
  - अतिदेय बैकअप विवरण और टाइमस्टैम्प शामिल हैं
  - अतिदेय बैकअप प्रबंधन और निगरानी के लिए उपयोग किया जाता है

## डुप्लिकेट सर्वर प्राप्त करें - `/api/servers/duplicates` {/* #get-duplicate-servers---apiserversduplicates */}
- **एंडपॉइंट**: `/api/servers/duplicates`
- **विधि**: GET
- **विवरण**: मशीन आईडी के आधार पर डुप्लिकेट सर्वर की सूची प्राप्त करता है। डुप्लिकेट सर्वर वे सर्वर होते हैं जो समान मशीन आईडी साझा करते हैं लेकिन डेटाबेस में अलग-अलग रिकॉर्ड के रूप में संग्रहीत होते हैं।
- **प्रमाणीकरण**: मान्य सत्र, CSRF टोकन और व्यवस्थापक पहुँच की आवश्यकता है
- **प्रतिक्रिया**:

  ```json
  [
    {
      "machineId": "machine-id-123",
      "servers": [
        {
          "id": "server-id-1",
          "name": "Server Name 1",
          "alias": "Server Alias 1",
          "server_url": "http://localhost:8200",
          "backupCount": 5
        },
        {
          "id": "server-id-2",
          "name": "Server Name 2",
          "alias": "Server Alias 2",
          "server_url": "http://localhost:8200",
          "backupCount": 3
        }
      ]
    }
  ]
  ```

- **त्रुटि प्रतिक्रियाएं**:
  - `401`: अनधिकृत - अमान्य सत्र या CSRF टोकन
  - `403`: व्यवस्थापक पहुँच आवश्यक है
  - `500`: डुप्लिकेट सर्वर प्राप्त करने में सर्वर त्रुटि
- **नोट्स**:
  - केवल व्यवस्थापक ही इस एंडपॉइंट तक पहुँच सकते हैं
  - समान मशीन आईडी साझा करने वाले सर्वर के समूह लौटाता है
  - प्रत्येक समूह में समान मशीन आईडी वाले सभी सर्वर होते हैं
  - डुप्लिकेट सर्वर रिकॉर्ड की पहचान करने और उन्हें मर्ज करने के लिए उपयोग किया जाता है
  - प्रत्येक डुप्लिकेट के लिए सर्वर विवरण और बैकअप संख्या शामिल है

## सर्वर मर्ज करें - `/api/servers/merge` {/* #merge-servers---apiserversmerge */}
- **एंडपॉइंट**: `/api/servers/merge`
- **विधि**: POST
- **विवरण**: एकाधिक सर्वर को एक लक्ष्य सर्वर में मर्ज करता है। स्रोत सर्वर से सभी बैकअप लक्ष्य सर्वर पर स्थानांतरित कर दिए जाते हैं, और स्रोत सर्वर हटा दिए जाते हैं।
- **प्रमाणीकरण**: मान्य सत्र, CSRF टोकन और व्यवस्थापक पहुँच आवश्यक है
- **रिक्वेस्ट बॉडी**:

  ```json
  {
    "oldServerIds": ["server-id-1", "server-id-2"],
    "targetServerId": "server-id-3"
  }
  ```

- **प्रतिक्रिया**:

  ```json
  {
    "success": true,
    "message": "Successfully merged 2 server(s) into target server",
    "backupIdsNormalized": 1
  }
  ```

- **त्रुटि रिस्पॉन्स**:
  - `400`: अमान्य रिक्वेस्ट बॉडी, आवश्यक फ़ील्ड मौजूद नहीं हैं, या लक्ष्य सर्वर मर्ज किए जाने वाले सर्वर की सूची में है
  - `401`: अनधिकृत - अमान्य सत्र या CSRF टोकन
  - `403`: व्यवस्थापक पहुँच आवश्यक है
  - `500`: मर्ज ऑपरेशन के दौरान सर्वर त्रुटि
- **नोट**:
  - केवल व्यवस्थापक ही मर्ज ऑपरेशन कर सकते हैं
  - लक्ष्य सर्वर मर्ज किए जाने वाले सर्वर की सूची में नहीं होना चाहिए
  - स्रोत सर्वर से सभी बैकअप लक्ष्य सर्वर पर स्थानांतरित किए जाते हैं
  - मर्ज किए गए सर्वर पर समान `backup_name` के लिए डुप्लिकेट `backup_id` मान सबसे हाल की बैकअप पंक्ति की ID पर सामान्यीकृत किए जाते हैं
  - सफल मर्ज के बाद स्रोत सर्वर हटा दिए जाते हैं
  - यह ऑपरेशन अपरिवर्तनीय है
  - डुप्लिकेट सर्वर रिकॉर्ड को समेकित करने के लिए उपयोग किया जाता है
  - पुष्टि करता है कि oldServerIds एक गैर-रिक्त ऐरे है
  - पुष्टि करता है कि targetServerId प्रदान किया गया है और यह एक स्ट्रिंग है
