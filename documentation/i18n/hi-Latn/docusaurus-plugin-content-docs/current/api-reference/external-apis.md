# Bahariye API {#external-apis}

Ye endpoint doosre applications aur integrations dwara istemal ke liye design kiye gaye hain, misaal ke taur par [Homepage](../user-guide/homepage-integration.md).

## Samagra Saar Prapt Karen - `/api/summary` {#get-overall-summary---apisummary}
- **Endpoint**: `/api/summary`
- **Method**: GET
- **Description**: Sabhi servers par sabhi backup operations ka ek saar prapt karta hai.
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

- **Truti Responses**:
  - `500`: Saar data prapt karne mein server truti
- **Notes**:
  - Sanskaran 0.5.x mein, field `totalBackupedSize` ko `totalBackupSize` se badla gaya tha
  - Sanskaran 0.7.x mein, field `totalMachines` ko `totalServers` se badla gaya tha
  - Field `overdueBackupsCount` abhi overdue backups ki sankhya dikhata hai
  - Field `secondsSinceLastBackup` sabhi servers par antim backup ke baad ka samay seconds mein dikhata hai
  - Data prapt karne mein vifalta hone par zeros ke saath fallback response deta hai
  - **Note**: Aantarik dashboard istemal ke liye, `/api/dashboard` ka istemal karne par vichar karen jo is data ke saath atirikt jaankaaree bhi shamil karta hai

## Antim Backup Prapt Karen - `/api/lastbackup/:serverId` {#get-latest-backup---apilastbackupserverid}
- **Endpoint**: `/api/lastbackup/:serverId`
- **Method**: GET
- **Description**: Ek vishisht server ke liye antim backup jaankaaree prapt karta hai.
- **Parameters**:
  - `serverId`: server identifier (ID ya naam)

:::note
Server identifier URL Encoded hona chahiye.
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

- **Truti Responses**:
  - `404`: Server nahi mila
  - `500`: Antarik server truti
- **Notes**:
  - Sanskaran 0.7.x mein, response object key `machine` se `server` mein badal gaya tha
  - Server identifier ID ya naam ho sakta hai
  - Agar koi backup nahi hai to antim_backup ke liye null deta hai
  - Caching rokne ke liye cache control headers shamil hain

## Antim Backups Prapt Karen - `/api/lastbackups/:serverId` {#get-latest-backups---apilastbackupsserverid}
- **Endpoint**: `/api/lastbackups/:serverId`
- **Method**: GET
- **Description**: Ek vishisht server par sabhi configure kiye gaye backups (jaise 'File', 'Database') ke liye antim backup jaankaaree prapt karta hai.
- **Parameters**:
  - `serverId`: server identifier (ID ya naam)

:::note
Server identifier URL Encoded hona chahiye.
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

- **Truti Responses**:
  - `404`: Server nahi mila
  - `500`: Antarik server truti
- **Notes**:
  - Sanskaran 0.7.x mein, response object key `machine` se `server` mein badal gaya tha, aur field `backup_types_count` ka naam badalkar `backup_jobs_count` kar diya gaya tha
  - Server identifier ID ya naam ho sakta hai
  - Server ke paas har backup job (backup_name) ke liye antim backup deta hai
  - `/api/lastbackup/:serverId` ke vipreet, jo server ka kewal sabse haal hi mein ek backup deta hai (backup job se swatantra)
  - Caching rokne ke liye cache control headers shamil hain

## Backup Data Upload Karen - `/api/upload` {#upload-backup-data---apiupload}
- **Endpoint**: `/api/upload`
- **Method**: POST
- **Description**: Ek server ke liye backup operation data upload karta hai. Duplicate backup run detection ka samarthan karta hai aur suchnaayein bhejta hai.
- **Request Body**: Duplicati dwara bheja gaya JSON nimnalikhit options ke saath:

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

- **Truti Responses**:
  - `400`: Extra ya Data sections mein avashyak fields nahi hain, ya avaidh MainOperation
  - `409`: Duplicate backup data (andekha kiya gaya)
  - `500`: Backup data process karne mein server truti
- **Dhyaan Dein**:
  - Keval backup operations process karta hai (MainOperation "Backup" hona chahiye)
  - Extra section mein avashyak fields validate karta hai: machine-id, machine-name, backup-name, backup-id
  - Data section mein avashyak fields validate karta hai: ParsedResult, BeginTime, Avadhi
  - Duplicate backup runs ko automatically detect karta hai aur 409 stithi return karta hai
  - Safal backup insertion ke baad suchnaayein bhejta hai (agar configure kiya gaya ho)
  - Development mode mein project ke root mein `data` directory mein debugging ke liye request data ko ek file mein log karta hai
  - Data consistency ke liye transaction ka upyog karta hai
