# Core Operations {#core-operations}

## Get Dashboard Data (Consolidated) - `/api/dashboard` {#get-dashboard-data-consolidated---apidashboard}
- **Endpoint**: `/api/dashboard`
- **Method**: GET
- **Description**: एकल संयुक्त प्रतिक्रिया में सभी डैशबोर्ड डेटा प्राप्त करता है, जिसमें सर्वर सारांश, सारांश, और चार्ट डेटा शामिल हैं।
- **Response**:

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

- **Error Responses**:
  - `500`: डैशबोर्ड डेटा प्राप्त करने में सर्वर त्रुटि
- **Notes**:
  - यह एंडपॉइंट पिछले `/api/servers-summary` एंडपॉइंट को संयोजित करता है (जो हटा दिया गया है)
  - `overallSummary` फ़ील्ड में `/api/summary` के समान डेटा होता है (जो बाहरी अनुप्रयोगों के लिए बनाए रखा गया है)
  - `chartData` फ़ील्ड में `/api/chart-data/aggregated` के समान डेटा होता है (जो सीधे पहुंच के लिए अभी भी मौजूद है)
  - एकल अनुरोध द्वारा कई एपीआई कॉल को कम करके बेहतर प्रदर्शन प्रदान करता है
  - सर्वोत्तम प्रदर्शन के लिए सभी डेटा को समानांतर में प्राप्त किया जाता है
  - `secondsSinceLastBackup` फ़ील्ड में सभी सर्वरों के अंतिम बैकअप से सेकंड में समय दिखाता है

## Get All Servers - `/api/servers` {#get-all-servers---apiservers}
- **Endpoint**: `/api/servers`
- **Method**: GET
- **Description**: सभी सर्वरों की सूची प्राप्त करता है उनके बुनियादी जानकारी के साथ। वैकल्पिक रूप से बैकअप जानकारी शामिल होती है।
- **Authentication**: मान्य सत्र और CSRF टोकन की आवश्यकता होती है
- **Query Parameters**:
  - `includeBackups` (optional): प्रत्येक सर्वर के लिए बैकअप जानकारी शामिल करने के लिए `true` पर सेट करें
- **Response** (without parameters):

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

- **Response** (with `includeBackups=true`):

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

- **Error Responses**:
  - `401`: Unauthorized - Invalid session or CSRF token
  - `500`: सर्वर त्रुटि सर्वर प्राप्त करने में
- **Notes**:
  - उपनाम और नोट फ़ील्ड सहित सर्वर जानकारी लौटाता है
  - जब `includeBackups=true`, तो सर्वर-बैकअप संयोजन लौटाता है जिसमें यूआरएल और पासवर्ड स्थिति शामिल होती है
  - पिछले `/api/servers-with-backups` एंडपॉइंट को संयोजित करता है (जो हटा दिया गया है)
  - सर्वर चयन, प्रदर्शन, और कॉन्फ़िगरेशन उद्देश्यों के लिए उपयोग किया जाता है
  - सर्वर में संग्रहीत पासवर्ड होने का संकेत देने के लिए `hasPassword` फ़ील्ड शामिल है

## Get Server Details - `/api/servers/:id` {#get-server-details---apiserversid}
- **Endpoint**: `/api/servers/:id`
- **Method**: GET
- **Description**: एक विशिष्ट सर्वर के बारे में जानकारी प्राप्त करता है। बुनियादी सर्वर जानकारी या बैकअप और चार्ट डेटा सहित विस्तृत जानकारी लौटाता है।
- **Authentication**: मान्य सत्र और CSRF टोकन की आवश्यकता होती है
- **Parameters**:
  - `id`: the server identifier
- **Query Parameters**:
  - `includeBackups` (optional): बैकअप डेटा शामिल करने के लिए `true` पर सेट करें
  - `includeChartData` (optional): चार्ट डेटा शामिल करने के लिए `true` पर सेट करें
- **Response** (without parameters):

  ```json
  {
    "id": "server-id",
    "name": "Server Name",
    "alias": "Server Alias",
    "note": "Additional notes about the server",
    "server_url": "http://localhost:8200"
  }
  ```

- **Response** (with parameters):

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

- **Error Responses**:
  - `401`: Unauthorized - Invalid session or CSRF token
  - `404`: सर्वर नहीं मिला
  - `500`: सर्वर त्रुटि सर्वर विवरण प्राप्त करने में
- **Notes**:
  - कोई क्वेरी पैरामीटर प्रदान न होने पर बुनियादी सर्वर जानकारी लौटाता है
  - या तो `includeBackups` या `includeChartData` को `true` पर सेट करने से बैकअप और चार्टडेटा सहित पूर्ण सर्वर डेटा लौटाता है
  - सर्वर सेटिंग्स और विवरण दृश्यों के लिए उपयोग किया जाता है

## Update Server - `/api/servers/:id` {#update-server---apiserversid}
- **Endpoint**: `/api/servers/:id`
- **Method**: PATCH
- **Description**: उपनाम, नोट, और सर्वर यूआरएल सहित सर्वर विवरण अपडेट करता है।
- **Authentication**: मान्य सत्र और CSRF टोकन की आवश्यकता होती है
- **Parameters**:
  - `id`: the server identifier
- **Request Body**:

  ```json
  {
    "server_url": "http://localhost:8200",
    "alias": "Server Alias",
    "note": "Additional notes about the server"
  }
  ```

- **Response**:

  ```json
  {
    "message": "Server updated successfully",
    "serverId": "server-id",
    "server_url": "http://localhost:8200",
    "alias": "Server Alias",
    "note": "Additional notes about the server"
  }
  ```

- **Error Responses**:
  - `401`: Unauthorized - Invalid session or CSRF token
  - `404`: सर्वर नहीं मिला
  - `500`: अपडेट के दौरान सर्वर त्रुटि
- **Notes**:
  - Server upnaam, note, aur server URL ko update karta hai
  - Sabhi fields optional hain
  - Sabhi fields ke liye khali strings allowed hain

## Delete Server - `/api/servers/:id` {#delete-server---apiserversid}
- **Endpoint**: `/api/servers/:id`
- **Method**: DELETE
- **Description**: Server aur uske saare associated backups ko delete karta hai.
- **Authentication**: Valid session aur CSRF token chahiye
- **Parameters**:
  - `id`: the server identifier

- **Response**:

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

- **Error Responses**:
  - `401`: Unauthorized - Invalid session or CSRF token
  - `404`: Server not found
  - `500`: Server error during deletion
- **Notes**: 
  - Yeh operation irreversible hai
  - Server ke saare associated backup data permanently delete ho jayenge
  - Server record bhi remove ho jayega
  - Deleted backups aur servers ka count return karta hai

## Get Server Data with Overdue Info - `/api/detail/:serverId` {#get-server-data-with-overdue-info---apidetailserverid}
- **Endpoint**: `/api/detail/:serverId`
- **Method**: GET
- **Description**: Overdue backup status ke saath server ka detailed information retrieve karta hai.
- **Parameters**:
  - `serverId`: सर्वर पहचानकर्ता

- **Response**:

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

- **Error Responses**:
  - `404`: Server not found
  - `500`: Server error fetching server details
- **Notes**:
  - Overdue backup information ke saath server data return karta hai
  - Overdue backup details aur timestamps include karta hai
  - Overdue backup management aur monitoring ke liye use hota hai

## Get Duplicate Servers - `/api/servers/duplicates` {#get-duplicate-servers---apiserversduplicates}
- **Endpoint**: `/api/servers/duplicates`
- **Method**: GET
- **Description**: Machine ID ke basis par duplicate servers ka list retrieve karta hai. Duplicate servers unhi servers hain jo same machine ID share karte hain lekin database mein alag-alag records ke roop mein store hain.
- **Authentication**: Valid session, CSRF token, aur administrator access chahiye
- **Response**:

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

- **Error Responses**:
  - `401`: Unauthorized - Invalid session or CSRF token
  - `403`: Administrator access required
  - `500`: Server error fetching duplicate servers
- **Notes**:
  - Yeh endpoint sirf administrators ke liye accessible hai
  - Same machine ID wale servers ke groups return karta hai
  - Har group mein same machine ID wale saare servers hain
  - Duplicate server records ko identify aur merge karne ke liye use hota hai
  - Har duplicate ke liye server details aur backup counts include karta hai

## Merge Servers - `/api/servers/merge` {#merge-servers---apiserversmerge}
- **Endpoint**: `/api/servers/merge`
- **Method**: POST
- **Description**: Multiple servers ko target server mein merge karta hai. Source servers ke saare backups target server mein transfer ho jate hain aur source servers delete ho jate hain.
- **Authentication**: Valid session, CSRF token, aur administrator access chahiye
- **Request Body**:

  ```json
  {
    "oldServerIds": ["server-id-1", "server-id-2"],
    "targetServerId": "server-id-3"
  }
  ```

- **Response**:

  ```json
  {
    "success": true,
    "message": "Successfully merged 2 server(s) into target server",
    "backupIdsNormalized": 1
  }
  ```

- **Error Responses**:
  - `400`: Invalid request body, missing required fields, or target server is in the list of servers to merge
  - `401`: Unauthorized - Invalid session or CSRF token
  - `403`: Administrator access required
  - `500`: Server error during merge operation
- **Notes**:
  - Yeh operation sirf administrators ke liye accessible hai
  - Target server list of servers to merge mein nahi hona chahiye
  - Source servers ke saare backups target server mein transfer ho jate hain
  - Merged server par same `backup_id` values ke liye `backup_name` ka normalization most recent backup row ke ID se hota hai
  - Successful merge ke baad source servers delete ho jate hain
  - Yeh operation irreversible hai
  - Duplicate server records ko consolidate karne ke liye use hota hai
  - Validate karta hai ki oldServerIds ek non-empty array hai
  - Validate karta hai ki targetServerId provided hai aur ek string hai
