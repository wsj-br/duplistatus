# Core Operations {#core-operations}

## Get Dashboard Data (Consolidated) - `/api/dashboard` {#get-dashboard-data-consolidated---apidashboard}
- **Endpoint**: `/api/dashboard`
- **Method**: GET
- **Description**: Ek hi consolidated response mein sabhi dashboard data retrieve karta hai, jisme server summaries, overall summary, aur chart data shamil hai.
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
  - `500`: Dashboard data fetch karte samay server truti
- **Notes**:
  - Yeh endpoint pichle `/api/servers-summary` endpoint ko consolidate karta hai (jise hata diya gaya hai)
  - `overallSummary` field mein `/api/summary` jaisa hi data hota hai (jise external applications ke liye maintain kiya gaya hai)
  - `chartData` field mein `/api/chart-data/aggregated` jaisa hi data hota hai (jo abhi bhi direct access ke liye maujood hai)
  - Ek hi request mein multiple API calls ko kam karke behtar performance pradan karta hai
  - Optimal performance ke liye sabhi data parallel mein fetch kiya jata hai
  - `secondsSinceLastBackup` field sabhi servers par antim backup ke baad ka samay seconds mein dikhata hai

## Get All Servers - `/api/servers` {#get-all-servers---apiservers}
- **Endpoint**: `/api/servers`
- **Method**: GET
- **Description**: Unke basic information ke saath sabhi servers ki list retrieve karta hai. Vaikalpik roop se backup jaankaaree shamil ho sakti hai.
- **Authentication**: Vaidh session aur CSRF token ki avashyakta hai
- **Query Parameters**:
  - `includeBackups` (optional): Pratyek server ke liye backup jaankaaree shamil karne hetu `true` par set karein
- **Response** (parameters ke bina):

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

- **Response** (`includeBackups=true` ke saath):

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
  - `401`: Anadhikrit - Avaidh session ya CSRF token
  - `500`: Server fetch karne mein truti
- **Notes**:
  - Alias aur note fields shamil server jaankaaree return karta hai
  - Jab `includeBackups=true`, server-backup combinations ko URLs aur password status ke saath return karta hai
  - Pichle `/api/servers-with-backups` endpoint ko consolidate karta hai (jise hata diya gaya hai)
  - Server selection, display, aur configuration purposes ke liye istemal kiya jata hai
  - Server mein stored password hai ya nahi yeh batane ke liye `hasPassword` field shamil hai

## Get Server Details - `/api/servers/:id` {#get-server-details---apiserversid}
- **Endpoint**: `/api/servers/:id`
- **Method**: GET
- **Description**: Ek vishisht server ke baare mein jaankaaree retrieve karta hai. Basic server info ya detailed jaankaaree return kar sakta hai jisme backups aur chart data shamil hai.
- **Authentication**: Vaidh session aur CSRF token ki avashyakta hai
- **Parameters**:
  - `id`: Server identifier
- **Query Parameters**:
  - `includeBackups` (optional): Backup data shamil karne hetu `true` par set karein
  - `includeChartData` (optional): Chart data shamil karne hetu `true` par set karein
- **Response** (parameters ke bina):

  ```json
  {
    "id": "server-id",
    "name": "Server Name",
    "alias": "Server Alias",
    "note": "Additional notes about the server",
    "server_url": "http://localhost:8200"
  }
  ```

- **Response** (parameters ke saath):

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
  - `401`: Anadhikrit - Avaidh session ya CSRF token
  - `404`: Server nahi mila
  - `500`: Server details fetch karne mein server truti
- **Notes**:
  - Jab koi query parameter nahi diya jata hai tab basic server jaankaaree return karta hai
  - `includeBackups` ya `includeChartData` mein se kisi ko bhi `true` par set karne se backups aur chartData shamil poora server data return hota hai
  - Server settings aur detail views ke liye istemal kiya jata hai

## Update Server - `/api/servers/:id` {#update-server---apiserversid}
- **Endpoint**: `/api/servers/:id`
- **Method**: PATCH
- **Description**: Alias, note, aur server URL shamil server details ko update karta hai.
- **Authentication**: Vaidh session aur CSRF token ki avashyakta hai
- **Parameters**:
  - `id`: Server identifier
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
  - `401`: Anadhikrit - Avaidh session ya CSRF token
  - `404`: Server nahi mila
  - `500`: Update ke dauran server truti
- **Notes**:
  - Server upnaam, note, aur server URL update karta hai
  - Sabhi fields optional hain
  - Sabhi fields ke liye khali strings allowed hain

## Server delete karein - `/api/servers/:id` {#delete-server---apiserversid}
- **Endpoint**: `/api/servers/:id`
- **Method**: DELETE
- **Description**: Ek server aur uske sabhi associated backups ko delete karta hai.
- **Authentication**: Valid session aur CSRF token chahiye
- **Parameters**:
  - `id`: server identifier

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
  - `401`: Unauthorized - Invalid session ya CSRF token
  - `404`: Server nahi mila
  - `500`: Deletion ke dauraan server mein truti
- **Notes**: 
  - Yeh operation irreversible hai
  - Server se juda hua sabhi backup data permanently delete ho jayega
  - Server record bhi remove kar diya jayega
  - Delete kiye gaye backups aur servers ki count return karta hai

## Vilambit Backup Jaankaaree ke saath Server Data prapt karein - `/api/detail/:serverId` {#get-server-data-with-overdue-info---apidetailserverid}
- **Endpoint**: `/api/detail/:serverId`
- **Method**: GET
- **Description**: Vilambit backup stithi sahit detailed server jaankaaree prapt karta hai.
- **Parameters**:
  - `serverId`: server identifier

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
  - `404`: Server nahi mila
  - `500`: Server details prapt karne mein server truti
- **Notes**:
  - Vilambit backup jaankaaree ke saath server data return karta hai
  - Vilambit backup details aur timestamps shamil hain
  - Vilambit backup management aur monitoring ke liye istemaal kiya jata hai

## Duplicate servers prapt karein - `/api/servers/duplicates` {#get-duplicate-servers---apiserversduplicates}
- **Endpoint**: `/api/servers/duplicates`
- **Method**: GET
- **Description**: Machine ID ke adhaar par duplicate servers ki list prapt karta hai. Duplicate servers woh servers hain jo ek hi machine ID share karte hain lekin database mein alag records ke roop mein store hote hain.
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
  - `401`: Unauthorized - Invalid session ya CSRF token
  - `403`: Administrator access chahiye
  - `500`: Duplicate servers prapt karne mein server truti
- **Notes**:
  - Sirf administrators is endpoint ko access kar sakte hain
  - Un servers ke groups return karta hai jo ek hi machine ID share karte hain
  - Har group mein ek hi machine ID wale sabhi servers shamil hain
  - Duplicate server records ki pehchaan aur merge karne ke liye istemaal kiya jata hai
  - Har duplicate ke liye server details aur backup counts shamil hain

## Servers merge karein - `/api/servers/merge` {#merge-servers---apiserversmerge}
- **Endpoint**: `/api/servers/merge`
- **Method**: POST
- **Description**: Kai servers ko ek target server mein merge karta hai. Source servers ke sabhi backups target server mein transfer kiye jaate hain, aur source servers delete kar diye jaate hain.
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
  - `400`: Invalid request body, zaroori fields missing, ya target server merge kiye jaane wale servers ki list mein hai
  - `401`: Unauthorized - Invalid session ya CSRF token
  - `403`: Administrator access chahiye
  - `500`: Merge operation ke dauraan server truti
- **Notes**:
  - Sirf administrators merge operations kar sakte hain
  - Target server merge kiye jaane wale servers ki list mein nahi hona chahiye
  - Source servers ke sabhi backups target server mein transfer kiye jaate hain
  - Merged server par ek hi `backup_name` ke liye duplicate `backup_id` values sabse naye backup row ke ID mein normalize ho jaate hain
  - Successful merge ke baad source servers delete kar diye jaate hain
  - Yeh operation irreversible hai
  - Duplicate server records ko consolidate karne ke liye istemaal kiya jata hai
  - Validate karta hai ki oldServerIds ek non-empty array hai
  - Validate karta hai ki targetServerId provide kiya gaya hai aur ek string hai
