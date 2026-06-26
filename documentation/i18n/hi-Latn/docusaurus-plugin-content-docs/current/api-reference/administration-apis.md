# Administration {#administration}

## Collect Backups - `/api/backups/collect` {#collect-backups---apibackupscollect}
- **Endpoint**: `/api/backups/collect`
- **Method**: POST
- **Description**: Duplicati server ke API ke dwara seedhe backup data collect karta hai. Yah endpoint sabse achha connection protocol (SSL validation ke saath HTTPS, self-signed certificates ke saath HTTPS, ya fallback ke roop mein HTTP) automatically detect karta hai aur backup jaankaaree prapt karne aur ise local database mein process karne ke liye Duplicati server se connect hota hai.
- **Authentication**: Vaidh session aur CSRF token avashyak hai
- **Request Body**:

  ```json
  {
    "hostname": "duplicati-server.local",
    "port": 8200,
    "password": "your-password",
    "downloadJson": false
  }
  ```

- **Response**:

  ```json
  {
    "success": true,
    "serverName": "Server Name",
    "serverAlias": "My Server",
    "stats": {
      "processed": 5,
      "skipped": 2,
      "errors": 0
    },
    "backupSettings": {
      "added": 2,
      "total": 7
    }
  }
  ```

- **Error Responses**:
  - `400`: Avaidh request parameters ya connection asafal
  - `500`: Backup collection ke dauraan server mein truti
- **Notes**: 
  - Yah endpoint optimal connection protocol (HTTPS → self-signed ke saath HTTPS → HTTP) automatically detect karta hai
  - Protocol detection prayas suraksha preference ke kram mein kiye jaate hain
  - Connection timeouts environment variables ke dwara configure kiye ja sakte hain
  - Debugging ke liye development mode mein collected data log karta hai
  - Sabhi servers aur backups ke liye backup settings poori hone ka vishwas dilata hai
  - Yadi specify na kiya gaya ho to default port 8200 ka upyog karta hai
  - Detect kiya gaya protocol aur server URL automatically database mein store ho jaate hain
  - `serverAlias` database se prapt kiya jaata hai aur yadi koi alias set na ho to khali ho sakta hai
  - Frontend ko display ke liye `serverAlias || serverName` ka upyog karna chahiye
  - JSON download aur seedhe API collection donon methods ko support karta hai

## Cleanup Backups - `/api/backups/cleanup` {#cleanup-backups---apibackupscleanup}
- **Endpoint**: `/api/backups/cleanup`
- **Method**: POST
- **Description**: Retention period ke aadhar par purana backup data delete karta hai. Yah endpoint naye aur mahatvapurna data ko preserve karte hue outdated backup records ko hatakar database size manage karne mein madad karta hai.
- **Authentication**: Vaidh session aur CSRF token avashyak hai
- **Request Body**:

  ```json
  {
    "retentionPeriod": "6 months"
  }
  ```

- **Retention Periods**: `"6 months"`, `"1 year"`, `"2 years"`, `"Delete all data"`
- **Response**:

  ```json
  {
    "message": "Successfully deleted 15 old backups",
    "status": 200
  }
  ```

"Delete all data" option ke liye:

  ```json
  {
    "message": "Successfully deleted all 15 backups and 3 servers, and cleared configuration settings",
    "status": 200
  }
  ```

- **Error Responses**:
  - `401`: Anadhikrit - Avaidh session ya CSRF token
  - `400`: Avaidh retention period specify kiya gaya hai
  - `500`: Cleanup operation ke dauraan server mein truti, jismein vistrit error jaankaaree hai
- **Notes**: 
  - Cleanup operation anivartaniya hai
  - Backup data database se sthayi roop se delete ho jaata hai
  - Yadi sabhi backups delete ho jaate hain tab bhi machine records preserve kiye jaate hain
  - Jab "Delete all data" select kiya jaata hai, to sabhi machines aur backups hat jaate hain aur configuration clear ho jaati hai
  - Enhanced error reporting mein development mode mein details aur stack trace shamil hain
  - Time-based retention aur poori data deletion donon ko support karta hai

## Delete Backup Job - `/api/backups/delete-job` {#delete-backup-job---apibackupsdelete-job}
- **Endpoint**: `/api/backups/delete-job`
- **Method**: DELETE
- **Description**: Ek vishisht server-backup combination ke liye sabhi backup records delete karta hai. Yah endpoint keval development mode mein uplabdh hai.
- **Authentication**: Vaidh session aur CSRF token avashyak hai
- **Request Body**:

  ```json
  {
    "serverId": "server-id",
    "backupName": "Backup Name"
  }
  ```

- **Response**:

  ```json
  {
    "message": "Successfully deleted 5 backup record(s) for \"Files\" from server \"My Server\"",
    "status": 200,
    "deletedCount": 5,
    "serverName": "My Server",
    "backupName": "Files"
  }
  ```

- **Error Responses**:
  - `401`: Anadhikrit - Avaidh session ya CSRF token
  - `403`: Backup job deletion keval development mode mein uplabdh hai
  - `400`: Server ID aur backup naam avashyak hain
  - `404`: Delete karne ke liye koi backup nahin mila
  - `500`: Deletion ke dauraan server mein truti, jismein vistrit error jaankaaree hai
- **Notes**: 
  - Yah operation keval development mode mein uplabdh hai
  - Yah karya anivartaniya hai
  - Nirdisht server-backup sanyojan ke liye sabhi backup record sthayi roop se mita diye jayenge
  - Mitae gae backups ki sankhya aur server ki jaankari lautata hai
  - Yadi uplabdh ho to pradarshan ke liye server upnaam ka upyog karta hai, anyatha server naam par laut aata hai

## Sync Backup Schedules - `/api/backups/sync-schedule` {#sync-backup-schedules---apibackupssync-schedule}
- **Endpoint**: `/api/backups/sync-schedule`
- **Method**: POST
- **Description**: Duplicati server se backup schedule ki jaankari synchronize karta hai. Yah endpoint server se judta hai, sabhi backups ke liye schedule ki jaankari prapt karta hai, aur repeat intervals, anumatiit saptahik dinon, aur schedule samayon sahit schedule vivaran ke saath sthaniya backup settings ko update karta hai.
- **Authentication**: Vaidh session aur CSRF token avashyak hai
- **Request Body**:

  ```json
  {
    "hostname": "duplicati-server.local",
    "port": 8200,
    "password": "your-password",
    "serverId": "optional-server-id"
  }
  ```

Ya keval serverId ke saath (stored password ka upyog karta hai):

  ```json
  {
    "serverId": "server-id"
  }
  ```

Ya serverId aur update kiye gae credentials ke saath:

  ```json
  {
    "serverId": "server-id",
    "hostname": "new-hostname.local",
    "port": 8200,
    "password": "new-password"
  }
  ```

- **Response**:

  ```json
  {
    "success": true,
    "serverName": "Server Name",
    "stats": {
      "processed": 5,
      "errors": 0
    }
  }
  ```

Trutiyon ke saath:

  ```json
  {
    "success": true,
    "serverName": "Server Name",
    "stats": {
      "processed": 3,
      "errors": 2
    },
    "errors": [
      "Backup Name 1: Error message",
      "Backup Name 2: Error message"
    ]
  }
  ```

- **Error Responses**:
  - `400`: Amannya anurodh parameetar, hostname/password ka gayab hona jab serverId pradan nahin kiya gaya hai, ya sambandh asafal
  - `404`: Server nahin mila (jab serverId pradan kiya gaya hai) ya server ke liye koi password store nahin hai
  - `500`: Schedule synchronization ke dauran server truti
- **Notes**: 
  - Yah endpoint swatah optimal connection protocol ka pata lagata hai (HTTPS → HTTPS with self-signed → HTTP)
  - Store kiye gae server credentials ka upyog karne ke liye keval serverId ke saath call kiya ja sakta hai
  - Server connection vivaran ko update karne ke liye naye credentials ke saath serverId ke saath call kiya ja sakta hai
  - Naye serveron ke liye serverId ke bina hostname/port/password ke saath call kiya ja sakta hai
  - Schedule jaankari ke saath backup settings ko update karta hai jisme shamil hain:
    - `expectedInterval`: Repeat interval (udaharan: "Daily", "Weekly", "Monthly")
    - `allowedWeekDays`: Anumatiit saptahik dinon ka array (0=Ravivar, 1=Somvar, ityadi)
    - `time`: Backup ke liye nirdharit samay
  - Server par mile sabhi backups ko process karta hai
  - Process kiye gae backups aur mili kisi bhi truti par aankde lautata hai
  - Safal aur asafal sync operations ke liye audit events log karta hai
  - Yadi nirdisht nahin kiya gaya hai to default port 8200 ka upyog karta hai

## Test Server Connection - `/api/servers/test-connection` {#test-server-connection---apiserverstest-connection}
- **Endpoint**: `/api/servers/test-connection`
- **Method**: POST
- **Description**: Yah jaanchne ke liye ki Duplicati server pahunchne yogya hai ya nahin, uske connection ka test karta hai.
- **Request Body**:

  ```json
  {
    "server_url": "http://localhost:8200"
  }
  ```

- **Response**:

  ```json
  {
    "success": true,
    "message": "Connection successful"
  }
  ```

- **Error Responses**:
  - `400`: Amannya URL format ya server URL ka gayab hona
  - `500`: Connection test ke dauran server truti
- **Notes**: 
  - Yah endpoint URL format ko validate karta hai aur connectivity test karta hai
  - Yadi server 401 status ke saath response karta hai to safalta lautata hai (credentials ke bina login endpoint ke liye apekshit)
  - Duplicati server ke login endpoint se connection test karta hai
  - HTTP aur HTTPS donon protocols ka samarthan karta hai
  - Connection testing ke liye timeout configuration ka upyog karta hai

## Get Server URL - `/api/servers/:serverId/server-url` {#get-server-url---apiserversserveridserver-url}
- **Endpoint**: `/api/servers/:serverId/server-url`
- **Method**: GET
- **Description**: Nirdisht server ke liye server URL prapt karta hai.
- **Parameters**:
  - `serverId`: server identifier

- **Response**:

  ```json
  {
    "serverId": "server-id",
    "server_url": "http://localhost:8200"
  }
  ```

- **Truti Jawab**:
  - `404`: Server nahin mila
  - `500`: Server truti
- **Dhyan Den**:
  - Vishesh server ke liye server URL vapas karta hai
  - Server connection prabandhan ke liye upyog kiya jata hai
  - Yadi koi server URL set nahin hai to khali string vapas karta hai

## Server URL Update Karen - `/api/servers/:serverId/server-url` {#update-server-url---apiserversserveridserver-url}
- **Endpoint**: `/api/servers/:serverId/server-url`
- **Method**: PATCH
- **Vivaran**: Vishesh server ke liye server URL ko update karta hai.
- **Pramanikaran**: Vaidh session aur CSRF token avashyak hai
- **Parameters**:
  - `serverId`: server identifier
- **Request Body**:

  ```json
  {
    "server_url": "http://localhost:8200"
  }
  ```

- **Response**:

  ```json
  {
    "message": "Server URL updated successfully",
    "serverId": "server-id",
    "serverName": "Server Name",
    "server_url": "http://localhost:8200"
  }
  ```

- **Truti Jawab**:
  - `401`: Anadhikrit - Amannya session ya CSRF token
  - `400`: Amannya URL format
  - `404`: Server nahin mila
  - `500`: Update ke dauran server truti
- **Dhyan Den**: 
  - Endpoint update karne se pahle URL format ko validate karta hai
  - Khali ya null server URL anumat hain
  - HTTP aur HTTPS donon protocol ka samarthan karta hai
  - Update kiya gaya server jankari vapas karta hai

## Server Password Prapt Karen - `/api/servers/:serverId/password` {#get-server-password---apiserversserveridpassword}
- **Endpoint**: `/api/servers/:serverId/password`
- **Method**: GET
- **Vivaran**: Server password operations ke liye CSRF token prapt karta hai.
- **Pramanikaran**: Vaidh session avashyak hai
- **Parameters**:
  - `serverId`: server identifier
- **Response**:

  ```json
  {
    "csrfToken": "csrf-token-string",
    "serverId": "server-id"
  }
  ```

- **Truti Jawab**:
  - `401`: Amannya ya samapt session
  - `500`: CSRF token generate karne mein asamarth
- **Dhyan Den**:
  - Password update operations ke liye CSRF token vapas karta hai
  - Token generate karne ke liye session vaidh hona chahiye

## Server Password Update Karen - `/api/servers/:serverId/password` {#update-server-password---apiserversserveridpassword}
- **Endpoint**: `/api/servers/:serverId/password`
- **Method**: PATCH
- **Vivaran**: Vishesh server ke liye password ko update karta hai.
- **Pramanikaran**: Vaidh session aur CSRF token avashyak hai
- **Parameters**:
  - `serverId`: server identifier
- **Request Body**:

  ```json
  {
    "password": "new-password"
  }
  ```

- **Response**:

  ```json
  {
    "message": "Password updated successfully",
    "serverId": "server-id"
  }
  ```

- **Truti Jawab**:
  - `400`: Password ek string hona chahiye
  - `401`: Anadhikrit - Amannya session ya CSRF token
  - `500`: Password update karne mein asamarth
- **Dhyan Den**:
  - Password ko clear karne ke liye password ek khali string ho sakta hai
  - Password ko secrets prabandhan pranali ka upyog karke surakshit roop se store kiya jata hai

## Upyogkarta Prabandhan {#user-management}

### Upyogkarta Suchi Banaye - `/api/users` {#list-users---apiusers}
- **Endpoint**: `/api/users`
- **Method**: GET
- **Vivaran**: Pagination aur vaikalpik khoj filtering ke saath sabhi upyogkartaon ki suchi banata hai. Login itihas aur account stithi sahit upyogkarta jankari vapas karta hai.
- **Pramanikaran**: Admin visheshadhikar, vaidh session aur CSRF token avashyak hai
- **Query Parameters**:
  - `page` (optional): Page sankhya (default: 1)
  - `limit` (optional): Prati page item (default: 50)
  - `search` (optional): Khoj shabd username dwara filter karne ke liye
- **Response**:

  ```json
  {
    "users": [
      {
        "id": "user-id",
        "username": "admin",
        "isAdmin": true,
        "mustChangePassword": false,
        "createdAt": "2024-01-01T00:00:00Z",
        "lastLoginAt": "2024-01-15T10:30:00Z",
        "lastLoginIp": "192.168.1.100",
        "failedLoginAttempts": 0,
        "lockedUntil": null,
        "isLocked": false
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 5,
      "totalPages": 1
    }
  }
  ```

- **Truti Responses**:
  - `401`: Anadhikrit - Avaidh session ya CSRF token
  - `403`: Pratibandhit - Admin adhikar avashyak
  - `500`: Antarik server truti
- **Notes**:
  - Keval admin upyogkartaon ke liye uplabdh
  - Pagination aur khoj filtering ka samarthan karta hai
  - Upyogkarta account stithi lautata hai, lock stithi sahit

### Upyogkarta Banayein - `/api/users` {#create-user---apiusers}
- **Endpoint**: `/api/users`
- **Method**: POST
- **Description**: Naya upyogkarta account banata hai. Ek aarthik password generate kar sakta hai ya diye gaye password ka upyog kar sakta hai.
- **Pramanikaran**: Admin visheshadhikar, vaidh session aur CSRF token ki avashyakta hai
- **Request Body**:

  ```json
  {
    "username": "newuser",
    "password": "optional-password",
    "isAdmin": false,
    "requirePasswordChange": true
  }
  ```

- `username`: Avashyak, 3-50 akshar ka hona chahiye, advitiya
  - `password`: Vaikalpik, yadi pradan nahin kiya gaya hai to ek surakshit aarthik password generate kiya jata hai
  - `isAdmin`: Vaikalpik, default jhootha
  - `requirePasswordChange`: Vaikalpik, default sachcha
- **Response**:

  ```json
  {
    "user": {
      "id": "user-id",
      "username": "newuser",
      "isAdmin": false,
      "mustChangePassword": true
    },
    "temporaryPassword": "generated-password-123"
  }
  ```

- `temporaryPassword` keval tab shamil kiya jata hai yadi koi password swayam generate kiya gaya tha
- **Truti Responses**:
  - `400`: Avadh username format, password policy ullanghan, ya validation trutiyan
  - `401`: Anadhikrit - Avadh session ya CSRF token
  - `403`: Pratibandhit - Admin adhikar avashyak
  - `409`: Username pehle se maujood hai
  - `500`: Antarik server truti
- **Notes**:
  - Keval admin upyogkartaon ke liye uplabdh
  - Username case-insensitive hai aur lowercase mein store kiya jata hai
  - Yadi password pradan nahin kiya gaya hai, to ek surakshit 12-akshar ka password generate kiya jata hai
  - Generate kiye gaye aarthik password keval response mein ek baar lautaye jate hain
  - Upyogkarta nirman audit log mein record kiya jata hai

### Update Upyogkarta - `/api/users/:id` {#update-user---apiusersid}
- **Endpoint**: `/api/users/:id`
- **Method**: PATCH
- **Description**: Upyogkarta ki jaankari update karta hai jisme username, admin stithi, password badalne ki avashyakta, aur password reset shamil hai.
- **Pramanikaran**: Admin adhikar, vaidh session aur CSRF token avashyak
- **Parameters**:
  - `id`: Update karne ke liye User ID
- **Request Body**:

  ```json
  {
    "username": "updated-username",
    "isAdmin": true,
    "requirePasswordChange": false,
    "resetPassword": true
  }
  ```

- Sabhi fields vaikalpik hain
  - `resetPassword`: Yadi sachcha hai, to ek naya aarthik password generate karta hai aur `requirePasswordChange` ko sachcha par set karta hai
- **Response** (password reset ke saath):

  ```json
  {
    "user": {
      "id": "user-id",
      "username": "updated-username",
      "isAdmin": true,
      "mustChangePassword": true
    },
    "temporaryPassword": "new-temp-password-456"
  }
  ```

- **Response** (password reset ke bina):

  ```json
  {
    "user": {
      "id": "user-id",
      "username": "updated-username",
      "isAdmin": true,
      "mustChangePassword": false
    }
  }
  ```

- **Truti Responses**:
  - `400`: Avadh input ya validation trutiyan
  - `401`: Anadhikrit - Avadh session ya CSRF token
  - `403`: Pratibandhit - Admin adhikar avashyak
  - `404`: User nahin mila
  - `409`: Username pehle se maujood hai (yadi username badal rahe hain)
  - `500`: Antarik server truti
- **Notes**:
  - Keval admin upyogkartaon ke liye uplabdh
  - Username badlav advitiyata ke liye validate kiye jate hain
  - Password reset ek surakshit 12-akshar ka aarthik password generate karta hai
  - Sabhi badlav audit log mein record kiye jate hain

### Upyogkarta ko delete karein - `/api/users/:id` {#delete-user---apiusersid}
- **Endpoint**: `/api/users/:id`
- **Method**: DELETE
- **Description**: Ek upyogkarta account delete karta hai. Khud ko ya antim admin account ko delete karne se rokta hai.
- **Pramanikaran**: Admin adhikar, vaidh session aur CSRF token avashyak
- **Parameters**:
  - `id`: Delete karne ke liye User ID
- **Response**:

  ```json
  {
    "success": true,
    "message": "User deleted successfully"
  }
  ```

- **Truti Sandesh**:
  - `400`: Apne account ya antim admin account ko delete nahi kiya ja sakta
  - `401`: Anadhikrit - Avaidh session ya CSRF token
  - `403`: Pratibandhit - Admin visheshadhikar avashyak hain
  - `404`: User nahin mila
  - `500`: Antarik server truti
- **Notes**:
  - Keval admin upyogkartaon ke liye upalabdh
  - Apne account ko delete nahi kar sakte
  - Antim admin account ko delete nahi kar sakte (kam se kam ek admin avashyak hai)
  - User deletion audit log mein record ki jaati hai
  - Sambandhit sessions svatah delete ho jaate hain (cascade)

## Audit Log Prabandhan {#audit-log-management}

### Audit Logs Ki Soochi - `/api/audit-log` {#list-audit-logs---apiaudit-log}
- **Endpoint**: `/api/audit-log`
- **Method**: GET
- **Vivaran**: Filtering, pagination, aur search kshamataon ke saath audit log entries prapt karta hai. Page-aadhaarit aur offset-aadhaarit dono pagination ka samarthan karta hai.
- **Pramanikaran**: Vaidh session aur CSRF token avashyak hai (logged-in user avashyak hai)
- **Query Parameters**:
  - `page` (optional): Page-based pagination ke liye page number
  - `offset` (optional): Offset-based pagination ke liye offset (page par prathmikta leta hai)
  - `limit` (optional): Prati page items (default: 50)
  - `startDate` (optional): Is taareekh se logs filter karein (ISO format)
  - `endDate` (optional): Is taareekh tak logs filter karein (ISO format)
  - `userId` (optional): User ID dwara filter karein
  - `username` (optional): Username dwara filter karein
  - `action` (optional): Action name dwara filter karein
  - `category` (optional): Category dwara filter karein (`auth`, `user_management`, `config`, `backup`, `server`)
  - `status` (optional): Status dwara filter karein (`success`, `failure`, `error`)
- **Response**:

  ```json
  {
    "logs": [
      {
        "id": 1,
        "timestamp": "2024-01-15T10:30:00Z",
        "userId": "user-id",
        "username": "admin",
        "action": "login",
        "category": "auth",
        "targetType": "user",
        "targetId": "user-id",
        "status": "success",
        "ipAddress": "192.168.1.100",
        "userAgent": "Mozilla/5.0...",
        "details": {
          "is_admin": true
        },
        "errorMessage": null
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 150,
      "totalPages": 3
    }
  }
  ```

- **Truti Sandesh**:
  - `401`: Anadhikrit - Avaidh session ya CSRF token
  - `500`: Antarik server truti
- **Notes**:
  - Page-based (`page`) aur offset-based (`offset`) dono pagination ka samarthan karta hai
  - `details` field mein atirikt sandarbh ke saath parsed JSON hai
  - Sabhi audit log queries record ki jaati hain

### Audit Log Filter Values Prapt Karein - `/api/audit-log/filters` {#get-audit-log-filter-values---apiaudit-logfilters}
- **Endpoint**: `/api/audit-log/filters`
- **Method**: GET
- **Vivaran**: Audit logs ko filter karne ke liye uplabdh unique filter values prapt karta hai. Audit log database mein maujood sabhi distinct actions, categories, aur statuses ko return karta hai. UI mein filter dropdowns ko populate karne ke liye upyogi.
- **Pramanikaran**: Vaidh session aur CSRF token avashyak hai (logged-in user avashyak hai)
- **Response**:

  ```json
  {
    "actions": [
      "login",
      "logout",
      "user_created",
      "user_updated",
      "config_updated"
    ],
    "categories": [
      "auth",
      "user_management",
      "config",
      "backup",
      "server"
    ],
    "statuses": [
      "success",
      "failure",
      "error"
    ]
  }
  ```

- **Truti Sandesh**:
  - `401`: Anadhikrit - Avaidh session ya CSRF token
  - `500`: Antarik server truti
- **Notes**:
  - Audit log database se unique values ke arrays return karta hai
  - Values alphabetically sorted hain
  - Agar koi data nahin hai ya truti hone par khali arrays return ki jaati hain
  - Audit log viewer dwara filter dropdowns ko dynamically populate karne ke liye upyog kiya jaata hai

### Audit Logs Download Karein - `/api/audit-log/download` {#download-audit-logs---apiaudit-logdownload}
- **Endpoint**: `/api/audit-log/download`
- **Method**: GET
- **Vivaran**: Audit logs ko CSV ya JSON format mein optional filtering ke saath download karta hai. Bahari vishleshan aur reporting ke liye upyogi.
- **Pramanikaran**: Vaidh session aur CSRF token avashyak hai (logged-in user avashyak hai)
- **Query Parameters**:
  - `format` (optional): Export format - `csv` ya `json` (default: `csv`)
  - `startDate` (optional): Is taareekh se logs filter karein (ISO format)
  - `endDate` (optional): Is taareekh tak logs filter karein (ISO format)
  - `userId` (optional): User ID dwara filter karein
  - `username` (optional): Username dwara filter karein
  - `action` (optional): Action name dwara filter karein
  - `category` (optional): Category dwara filter karein
  - `status` (optional): Status dwara filter karein
- **Response** (CSV):
  - Content-Type: `text/csv`
  - Content-Disposition: `attachment; filename="audit-log-YYYY-MM-DD.csv"`
  - Headers ke saath CSV file: ID, Timestamp, User ID, Username, Action, Category, Target Type, Target ID, Status, IP Address, User Agent, Details, Error Message
- **Response** (JSON):
  - Content-Type: `application/json`
  - Content-Disposition: `attachment; filename="audit-log-YYYY-MM-DD.json"`
  - JSON array of audit log entries
- **Truti Responses**:
  - `400`: Export karne ke liye koi log nahin hai
  - `401`: Anadhikrit - Avaidh session ya CSRF token
  - `500`: Antarik server truti
- **Notes**:
  - Export seema 10,000 records hai
  - CSV format vishesh characters ko theek se escape karta hai
  - CSV mein Details field JSON-stringified hai
  - File ka naam vartaman taareekh shamil karta hai

### Audit Logs Saaf Karen - `/api/audit-log/cleanup` {#cleanup-audit-logs---apiaudit-logcleanup}
- **Endpoint**: `/api/audit-log/cleanup`
- **Method**: POST
- **Description**: Purane audit logs ko retention period ke adhaar par saaf karne ke liye manchitra roop se trigger karta hai. Jo delete kiya jayega uske preview ke liye dry-run mode ka samarthan karta hai.
- **Pramanikaran**: Admin visheshadhikar, vaidh session aur CSRF token ki avashyakta hai
- **Request Body**:

  ```json
  {
    "retentionDays": 90,
    "dryRun": false
  }
  ```

- `retentionDays` (optional): Retention dinon ko override karen (30-365), anyatha configure ki gayi value ka upyog karta hai
  - `dryRun` (optional): Yadi true hai, to kewal wahi return karta hai jo delete kiya jayega bina vastav mein delete kiye
- **Response** (dry run):

  ```json
  {
    "dryRun": true,
    "wouldDeleteCount": 50,
    "oldestRemaining": "2024-01-01T00:00:00Z",
    "retentionDays": 90,
    "cutoffDate": "2024-01-01"
  }
  ```

- **Response** (vastavik cleanup):

  ```json
  {
    "success": true,
    "deletedCount": 50,
    "oldestRemaining": "2024-01-01T00:00:00Z",
    "retentionDays": 90
  }
  ```

- **Truti Responses**:
  - `400`: Avaidh retention din (30-365 hone chahiye)
  - `401`: Anadhikrit - Avaidh session ya CSRF token
  - `403`: Pratibandhit - Admin visheshadhikar avashyak hain
  - `500`: Antarik server truti
- **Notes**:
  - Kewal admin upyogkartaon ke liye sulabh
  - Yadi configure nahin kiya gaya hai to default retention 90 din hai
  - Cleanup operation audit log mein record kiya jata hai
  - Dry-run mode cleanup ke prabhav ka preview karne ke liye upyogi hai

### Audit Log Retention Prapt Karen - `/api/audit-log/retention` {#get-audit-log-retention---apiaudit-logretention}
- **Endpoint**: `/api/audit-log/retention`
- **Method**: GET
- **Description**: Dinon mein vartaman audit log retention configuration prapt karta hai.
- **Pramanikaran**: Vaidh session aur CSRF token ki avashyakta hai (kisi logged-in upyogkarta ki avashyakta nahin hai)
- **Response**:

  ```json
  {
    "retentionDays": 90
  }
  ```

- **Truti Responses**:
  - `500`: Antarik server truti
- **Notes**:
  - Yadi configure nahin kiya gaya hai to default retention 90 din hai
  - Pramanikaran ke bina access kiya ja sakta hai (read-only)

### Audit Log Retention Update Karen - `/api/audit-log/retention` {#update-audit-log-retention---apiaudit-logretention}
- **Endpoint**: `/api/audit-log/retention`
- **Method**: PATCH
- **Description**: Dinon mein audit log retention period update karta hai. Yah setting nirdharit karti hai ki swachalit cleanup se pehle audit logs kitne samay tak rakhe jate hain.
- **Pramanikaran**: Admin visheshadhikar, vaidh session aur CSRF token ki avashyakta hai
- **Request Body**:

  ```json
  {
    "retentionDays": 120
  }
  ```

- `retentionDays`: Avashyak, 30 aur 365 dinon ke beech hona chahiye
- **Response**:

  ```json
  {
    "success": true,
    "retentionDays": 120
  }
  ```

- **Truti Responses**:
  - `400`: Avaidh retention din (30-365 hone chahiye)
  - `401`: Anadhikrit - Avaidh session ya CSRF token
  - `403`: Pratibandhit - Admin visheshadhikar avashyak hain
  - `500`: Antarik server truti
- **Notes**:
  - Kewal admin upyogkartaon ke liye sulabh
  - Configuration badlav audit log mein record kiya jata hai
  - Retention period swachalit aur manchitra cleanup operations ko prabhavit karta hai

## Database Prabandhan {#database-management}

### Backup Database - `/api/database/backup` {#backup-database---apidatabasebackup}
- **Endpoint**: `/api/database/backup`
- **Method**: GET
- **Description**: Database ka backup binary (.db) ya SQL (.sql) format mein banata hai. Backup file ek timestamped filename ke saath automatically download ho jaati hai.
- **Authentication**: Admin visheshadhikar, vaidh session aur CSRF token ki avashyakta hai
- **Query Parameters**:
  - `format` (optional): Backup format - `db` (binary) ya `sql` (SQL dump). Default: `db`
- **Response**:
  - Content-Type: `application/octet-stream` (.db ke liye) ya `text/plain` (.sql ke liye)
  - Content-Disposition: `attachment; filename="duplistatus-backup-YYYY-MM-DDTHH-MM-SS.db"` ya `.sql`
  - Binary file content (.db ke liye) ya SQL text content (.sql ke liye)
- **Error Responses**:
  - `400`: Avidh format ( "db" ya "sql" hona chahiye)
  - `401`: Anadhikrit - Avidh session ya CSRF token
  - `403`: Pratibandhit - Admin visheshadhikar ki avashyakta hai
  - `500`: Database backup banane mein Asafal
- **Notes**:
  - Keval admin upyogkartaon ke liye uplabdh
  - Binary format integrity ke liye SQLite ke backup method ka upyog karta hai
  - SQL format sabhi database content ka text dump banata hai
  - Filename mein timestamp server ke local timezone ka upyog karta hai
  - Backup operation audit log mein record hota hai
  - Download ke baad temporary file automatically saaf ho jaati hain

### Restore Database - `/api/database/restore` {#restore-database---apidatabaserestore}
- **Endpoint**: `/api/database/restore`
- **Method**: POST
- **Description**: Backup file (.db ya .sql format) se database ko restore karta hai. Restore se pehle ek suraksha backup banata hai aur suraksha ke liye restore ke baad sabhi sessions ko clear karta hai.
- **Authentication**: Admin visheshadhikar, vaidh session aur CSRF token ki avashyakta hai
- **Request Body**: `database` naam ke field ke saath FormData
  - File `.db`, `.sqlite`, `.sqlite3` (binary format) ya `.sql` (SQL format) mein se ek honi chahiye
  - Adhiktam file aakaar: 100MB
- **Response**:

  ```json
  {
    "success": true,
    "message": "Database restored successfully from DB file",
    "safetyBackupPath": "duplistatus-backup-YYYY-MM-DDTHH-MM-SS.db",
    "requiresReauth": true
  }
  ```

- **Error Responses**:
  - `400`: Koi file nahi di gayi, file aakaar seema se adhik hai, avidh file format, ya database integrity check mein Asafal
  - `401`: Anadhikrit - Avidh session ya CSRF token
  - `403`: Pratibandhit - Admin visheshadhikar ki avashyakta hai
  - `500`: Database restore karne mein Asafal (restore Asafal hone par mul database suraksha backup se restore ho jaata hai)
- **Notes**:
  - Keval admin upyogkartaon ke liye uplabdh
  - Restore se pehle swayam ek suraksha backup banata hai
  - Binary (.db) aur SQL (.sql) dono formats ka samarthan karta hai
  - Restore ke baad database integrity ki jaanch karta hai
  - Agar restore Asafal hota hai, toh swayam suraksha backup se restore karta hai
  - Suraksha ke liye safaltapoorvak restore hone ke baad sabhi sessions clear ho jaate hain
  - Upyogkarta ko dobara pravesh karne ki avashyakta ko darshane ke liye `requiresReauth: true` return karta hai
  - Restore operation audit log mein record hota hai
  - SQL format ke liye, execution se pehle SQL content ki jaanch karta hai
  - Restore ke baad database connection ko dobara initialize kiya jaata hai
  - Restore ke baad sabhi caches invalidate ho jaate hain

## Backup Timestamps {#backup-timestamps}

### Get Last Backup Timestamps - `/api/backups/last-timestamps` {#get-last-backup-timestamps---apibackupslast-timestamps}
- **Endpoint**: `/api/backups/last-timestamps`
- **Method**: GET
- **Description**: Har server-backup combination ke liye antim backup timestamp prapt karta hai. Aasan lookup ke liye ek map return karta hai.
- **Authentication**: Vaidh session aur CSRF token ki avashyakta hai
- **Response**:

  ```json
  {
    "timestamps": {
      "server-id-1:Backup Name 1": "2024-03-20T10:00:00Z",
      "server-id-1:Backup Name 2": "2024-03-20T11:00:00Z",
      "server-id-2:Backup Name 1": "2024-03-20T12:00:00Z"
    },
    "raw": [
      {
        "server_name": "Server Name",
        "server_id": "server-id-1",
        "backup_name": "Backup Name 1",
        "date": "2024-03-20T10:00:00Z"
      }
    ]
  }
  ```

- **Error Responses**:
  - `401`: Anadhikrit - Avidh session ya CSRF token
  - `500`: Antim backup timestamps prapt karne mein Asafal
- **Notes**:
  - Aasan lookup (`server_id:backup_name` dwara) aur raw array format dono ke liye ek map return karta hai
  - Caching ko rokne ke liye cache control headers shamil hain
  - Sabhi server-backup combinations mein antim backup samay track karne ke liye upyogi
  - Timestamps ISO format mein hain

## Application Logs Prabandhan {#application-logs-management}

### Application Logs Prapt Karen - `/api/application-logs` {#get-application-logs---apiapplication-logs}
- **Endpoint**: `/api/application-logs`
- **Method**: GET
- **Vivaran**: Log file se application log entries prapt karta hai. Current aur rotated log file ko tail functionality ke saath padhne ka samarthan karta hai.
- **Pramanikaran**: Admin visheshadhikar, vaidh session aur CSRF token ki avashyakta hai
- **Query Parameters**:
  - `file` (vaikalpik): Padhne ke liye log file ka naam - `application.log`, `application.log.1`, `application.log.2`, ityadi. Yadi pradan nahin kiya gaya hai, to uplabdh fileon ki soochi vapas karta hai
  - `tail` (vaikalpik): File ke antim se vapas karne ke liye lines ki sankhya (default: 1000, nyuntam: 1, adhiktam: 10000)
- **Response** (file parameter ke saath):

  ```json
  {
    "logs": "log content as string...",
    "fileSize": 1024000,
    "lastModified": "2024-03-20T10:00:00Z",
    "lineCount": 5000,
    "currentFile": "application.log",
    "availableFiles": ["application.log", "application.log.1", "application.log.2"]
  }
  ```

- **Response** (file parameter ke bina):

  ```json
  {
    "logs": "",
    "fileSize": 0,
    "lastModified": "2024-03-20T10:00:00Z",
    "lineCount": 0,
    "currentFile": "",
    "availableFiles": ["application.log", "application.log.1", "application.log.2"]
  }
  ```

- **Truti Responses**:
  - `400`: Avaidh tail parameter (1-10000 hona chahiye) ya avaidh file parameter format
  - `401`: Anadhikrit - Avaidh session ya CSRF token
  - `403`: Pratibandhit - Admin visheshadhikar avashyak hain
  - `404`: Log file nahin mili
  - `500`: Log file padhne mein asafal
- **Notes**:
  - Keval admin upyogkartaon ke liye sulabh
  - Current log file aur rotated log file (10 rotated fileon tak) padhne ka samarthan karta hai
  - Nirdisht log file se antim N lines (tail) vapas karta hai
  - Log file ka naam environment variable dwara nirdharit hota hai (default: `application.log`)
  - Jab file parameter pradan nahin kiya jata hai to uplabdh log fileon ki soochi vapas karta hai
  - Directory traversal hamlon ko rokne ke liye file naam validate kiye jate hain
  - Rotated fileon ko kramik roop se number diya jata hai (`.1`, `.2`, ityadi)

### Application Logs Export Karen - `/api/application-logs/export` {#export-application-logs---apiapplication-logsexport}
- **Endpoint**: `/api/application-logs/export`
- **Method**: GET
- **Vivaran**: Filtered text format mein application log entries export karta hai. Log level aur search string dwara filtering ka samarthan karta hai.
- **Pramanikaran**: Admin visheshadhikar, vaidh session aur CSRF token ki avashyakta hai
- **Query Parameters**:
  - `file` (anivarya): Export karne ke liye log file ka naam - `application.log`, `application.log.1`, `application.log.2`, ityadi.
  - `logLevels` (vaikalpik): Shamil karne ke liye log levels ki comma-separated soochi - `INFO`, `WARN`, `ERROR` (default: `INFO,WARN,ERROR`)
  - `search` (vaikalpik): Log lines ko filter karne ke liye search string (case-insensitive)
- **Response**:
  - Content-Type: `text/plain`
  - Content-Disposition: `attachment; filename="duplistatus-logs-YYYY-MM-DDTHH-MM-SS.txt"`
  - Plain text ke roop mein filtered log content
- **Truti Responses**:
  - `400`: File parameter anivarya hai ya avaidh file parameter format
  - `401`: Anadhikrit - Avaidh session ya CSRF token
  - `403`: Pratibandhit - Admin visheshadhikar avashyak hain
  - `500`: Log export karne mein asafal
- **Notes**:
  - Keval admin upyogkartaon ke liye sulabh
  - Log level aur search criteria ke aadhar par filtered log entries export karta hai
  - Log levels dwara filtering ka samarthan karta hai: `INFO`, `WARN`, `ERROR`
  - Search string filtering case-insensitive hai
  - Khali lines svatah filter ho jati hain
  - Log file ka naam environment variable dwara nirdharit hota hai (default: `application.log`)
  - Directory traversal hamlon ko rokne ke liye file naam validate kiye jate hain
  - Exported file mein filename mein timestamp shamil hota hai
  - Bahari vishleshan aur troubleshooting ke liye upyogi
