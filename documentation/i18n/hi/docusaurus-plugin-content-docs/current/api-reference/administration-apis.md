# प्रशासन {#administration}

## Backups Ikattha Karein - `/api/backups/collect` {#collect-backups---apibackupscollect}
- **Endpoint**: `/api/backups/collect`
- **Method**: POST
- **Description**: Duplicati server ke API ke zariye backup data ko directly collect karta hai. Ye endpoint automatically sabse achchha sambandh protocol detect karta hai (HTTPS with SSL validation, HTTPS with self-signed certificates, ya HTTP as fallback) aur Duplicati server se sambandh karte hue backup information ko retrieve karta hai aur use local database mein process karta hai.
- **Authentication**: मान्य सत्र और CSRF टोकन की आवश्यकता होती है
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
  - `400`: Invalid request parameters ya sambandh asafal
  - `500`: Backup collection ke dauran server error
- **Notes**: 
  - Endpoint automatically optimal sambandh protocol detect karta hai (HTTPS → HTTPS with self-signed → HTTP)
  - Protocol detection attempts security preference ke anusar hote hain
  - Sambandh timeouts environment variables ke zariye configurable hain
  - Debugging ke liye development mode mein collected data ko log karta hai
  - Sabhi servers aur backups ke liye backup settings complete hain
  - Agar specified nahi hai to default port 8200 use hota hai
  - Detected protocol aur server URL automatically database mein store hota hai
  - `serverAlias` database se retrieve hota hai aur agar koi alias set nahi hai to empty ho sakta hai
  - Frontend display purposes ke liye `serverAlias || serverName` ka use karna chahiye
  - Both JSON download aur direct API collection methods ko support karta hai

## Cleanup Backups - `/api/backups/cleanup` {#cleanup-backups---apibackupscleanup}
- **Endpoint**: `/api/backups/cleanup`
- **Method**: POST
- **Description**: Retention period ke hisaab se purane backup data ko delete karta hai. Ye endpoint database size ko manage karne mein madad karta hai aur outdated backup records ko remove karke recent aur important data ko preserve karta hai.
- **Authentication**: मान्य सत्र और CSRF टोकन की आवश्यकता होती है
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

For "Delete all data" option:

  ```json
  {
    "message": "Successfully deleted all 15 backups and 3 servers, and cleared configuration settings",
    "status": 200
  }
  ```

- **Error Responses**:
  - `401`: Unauthorized - Invalid session ya CSRF token
  - `400`: Invalid retention period specified
  - `500`: Cleanup operation ke dauran server error with detailed error information
- **Notes**: 
  - Cleanup operation irreversible hai
  - Backup data database se permanently delete hota hai
  - Machine records preserve rehte hain even if sabhi backups delete ho jate hain
  - Jab "Delete all data" select hota hai, to sabhi machines aur backups remove hote hain aur configuration clear hoti hai
  - Enhanced error reporting details aur stack trace development mode mein include hota hai
  - Both time-based retention aur complete data deletion ko support karta hai

## Backup job delete karein - `/api/backups/delete-job` {#delete-backup-job---apibackupsdelete-job}
- **Endpoint**: `/api/backups/delete-job`
- **Method**: DELETE
- **Description**: Specific server-backup combination ke liye sabhi backup records ko delete karta hai. Ye endpoint sirf development mode mein available hai.
- **Authentication**: मान्य सत्र और CSRF टोकन की आवश्यकता होती है
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
  - `401`: Unauthorized - Invalid session ya CSRF token
  - `403`: Backup job deletion sirf development mode mein available hai
  - `400`: Server ID aur backup name required hain
  - `404`: Delete karne ke liye koi backups nahi mila
  - `500`: Deletion ke dauran server error with detailed error information
- **Notes**: 
  - Ye operation sirf development mode mein available hai
  - यह क्रिया अपरिवर्तनीय है
  - निर्दिष्ट सर्वर-बैकअप संयोजन के लिए सभी बैकअप रिकॉर्ड स्थायी रूप से हटाए जाएंगे
  - हटाए गए बैकअपों की गिनती और सर्वर की जानकारी लौटाता है
  - प्रदर्शन के लिए सर्वर उपनाम का उपयोग करता है यदि उपलब्ध है, अन्यथा सर्वर नाम पर वापस आ जाता है

## Sync Backup Schedules - `/api/backups/sync-schedule` {#sync-backup-schedules---apibackupssync-schedule}
- **Endpoint**: `/api/backups/sync-schedule`
- **Method**: POST
- **Description**: एक डुप्लिकेट सर्वर से बैकअप अनुसूची जानकारी को सिंक करता है। यह एंडपॉइंट सर्वर से कनेक्ट होता है, सभी बैकअपों के लिए अनुसूची जानकारी प्राप्त करता है, और स्थानीय बैकअप सेटिंग्स को अनुसूची विवरणों के साथ अपडेट करता है जिसमें रिपीट अंतराल, अनुमत हफ्ते के दिन, और अनुसूची समय शामिल हैं।
- **Authentication**: मान्य सत्र और CSRF टोकन की आवश्यकता होती है
- **Request Body**:

  ```json
  {
    "hostname": "duplicati-server.local",
    "port": 8200,
    "password": "your-password",
    "serverId": "optional-server-id"
  }
  ```

या केवल serverId के साथ (संग्रहीत पासवर्ड का उपयोग करता है):

  ```json
  {
    "serverId": "server-id"
  }
  ```

या serverId और अपडेट किए गए क्रेडेंशियल के साथ:

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

त्रुटियों के साथ:

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
  - `400`: अमान्य अनुरोध पैरामीटर, जब serverId प्रदान नहीं किया गया है तो होस्टनाम/पासवर्ड गायब है, या कनेक्शन असफल
  - `404`: सर्वर नहीं मिला (जब serverId प्रदान किया गया है) या सर्वर के लिए कोई पासवर्ड संग्रहीत नहीं है
  - `500`: अनुसूची सिंक्रनाइज़ेशन के दौरान सर्वर त्रुटि
- **Notes**: 
  - एंडपॉइंट स्वचालित रूप से सर्वोत्तम कनेक्शन प्रोटोकॉल का पता लगाता है (HTTPS → HTTPS सेल्फ-साइन्ड → HTTP)
  - संग्रहीत सर्वर क्रेडेंशियल का उपयोग करने के लिए केवल serverId के साथ कॉल किया जा सकता है
  - नए सर्वर कनेक्शन विवरण अपडेट करने के लिए serverId और नए क्रेडेंशियल के साथ कॉल किया जा सकता है
  - नए सर्वर के लिए serverId के बिना होस्टनाम/पोर्ट/पासवर्ड के साथ कॉल किया जा सकता है
  - बैकअप सेटिंग्स को अनुसूची जानकारी के साथ अपडेट करता है जिसमें शामिल हैं:
    - `expectedInterval`: रिपीट अंतराल (उदाहरण के लिए, "दैनिक", "साप्ताहिक", "मासिक")
    - `allowedWeekDays`: अनुमत हफ्ते के दिनों की एक सरणी (0=रविवार, 1=सोमवार, आदि)
    - `time`: बैकअप के लिए अनुसूचित समय
  - सर्वर पर पाए गए सभी बैकअपों को संसाधित करता है
  - संसाधित बैकअपों और किसी भी त्रुटियों पर प्राप्त सांख्यिकी लौटाता है
  - सफल और असफल सिंक ऑपरेशन के लिए ऑडिट इवेंट्स लॉग करता है
  - निर्दिष्ट नहीं होने पर डिफ़ॉल्ट पोर्ट 8200 का उपयोग करता है

## Test Server Connection - `/api/servers/test-connection` {#test-server-connection---apiserverstest-connection}
- **Endpoint**: `/api/servers/test-connection`
- **Method**: POST
- **Description**: एक डुप्लिकेट सर्वर से कनेक्शन का परीक्षण करता है ताकि यह सत्यापित किया जा सके कि यह पहुंच योग्य है।
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
  - `400`: अमान्य URL प्रारूप या सर्वर URL गायब
  - `500`: कनेक्शन परीक्षण के दौरान सर्वर त्रुटि
- **Notes**: 
  - एंडपॉइंट URL प्रारूप को सत्यापित करता है और कनेक्टिविटी का परीक्षण करता है
  - 401 स्थिति के साथ सफलता लौटाता है (क्रेडेंशियल के बिना लॉगिन एंडपॉइंट के लिए अपेक्षित)
  - डुप्लिकेट सर्वर के लॉगिन एंडपॉइंट से कनेक्शन का परीक्षण करता है
  - दोनों HTTP और HTTPS प्रोटोकॉल का समर्थन करता है
  - कनेक्शन परीक्षण के लिए टाइमआउट कॉन्फ़िगरेशन का उपयोग करता है

## Get Server URL - `/api/servers/:serverId/server-url` {#get-server-url---apiserversserveridserver-url}
- **Endpoint**: `/api/servers/:serverId/server-url`
- **Method**: GET
- **Description**: किसी विशिष्ट सर्वर के लिए सर्वर URL प्राप्त करता है।
- **Parameters**:
  - `serverId`: सर्वर पहचानकर्ता

- **Response**:

  ```json
  {
    "serverId": "server-id",
    "server_url": "http://localhost:8200"
  }
  ```

- **Truti Uttaran**:
  - `404`: Server nahi mila
  - `500`: Server truti
- **Notes**:
  - Specific server ke liye server URL return karta hai
  - Server connection management ke liye istemal hota hai
  - Agar koi server URL set nahi hai to khali string return karta hai

## Update Server URL - `/api/servers/:serverId/server-url` {#update-server-url---apiserversserveridserver-url}
- **Endpoint**: `/api/servers/:serverId/server-url`
- **Method**: PATCH
- **Description**: Specific server ke liye server URL update karta hai.
- **Authentication**: Valid session aur CSRF token ki zaroorat hoti hai
- **Parameters**:
  - `serverId`: the server identifier
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

- **Error Responses**:
  - `401`: Unauthorized - Invalid session or CSRF token
  - `400`: Invalid URL format
  - `404`: Server nahi mila
  - `500`: Update karte samay server truti
- **Notes**: 
  - Endpoint URL format ko validate karta hai update karne se pehle
  - Empty ya null server URLs allowed hain
  - HTTP aur HTTPS protocols dono ko support karta hai
  - Updated server information return karta hai

## Get Server Password - `/api/servers/:serverId/password` {#get-server-password---apiserversserveridpassword}
- **Endpoint**: `/api/servers/:serverId/password`
- **Method**: GET
- **Description**: Server password operations ke liye CSRF token retrieve karta hai.
- **Authentication**: Valid session ki zaroorat hoti hai
- **Parameters**:
  - `serverId`: the server identifier
- **Response**:

  ```json
  {
    "csrfToken": "csrf-token-string",
    "serverId": "server-id"
  }
  ```

- **Error Responses**:
  - `401`: Invalid ya expired session
  - `500`: Failed to generate CSRF token
- **Notes**:
  - Password update operations ke liye CSRF token return karta hai
  - Token generate karne ke liye session valid hona chahiye

## Update Server Password - `/api/servers/:serverId/password` {#update-server-password---apiserversserveridpassword}
- **Endpoint**: `/api/servers/:serverId/password`
- **Method**: PATCH
- **Description**: Specific server ke liye password update karta hai.
- **Authentication**: Valid session aur CSRF token ki zaroorat hoti hai
- **Parameters**:
  - `serverId`: the server identifier
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

- **Error Responses**:
  - `400`: Password must be a string
  - `401`: Unauthorized - Invalid session or CSRF token
  - `500`: Password update karne mein asamarth
- **Notes**:
  - Password clear karne ke liye empty string istemal ki ja sakti hai
  - Password secrets management system ke through securely stored hota hai

## User Management {#user-management}

### List Users - `/api/users` {#list-users---apiusers}
- **Endpoint**: `/api/users`
- **Method**: GET
- **Description**: Pagination aur optional search filtering ke sath sabhi users ki list return karta hai. User information, login history aur account status ke sath.
- **Authentication**: Admin privileges, valid session aur CSRF token ki zaroorat hoti hai
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 50)
  - `search` (optional): Username dwara filter karein ke liye search term
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

- **Error Responses**:
  - `401`: Unauthorized - Invalid session or CSRF token
  - `403`: Forbidden - Admin privileges required
  - `500`: Internal server error
- **Notes**:
  - Only accessible to admin users
  - Supports pagination and search filtering
  - Returns user account status including lock status

### Create User - `/api/users` {#create-user---apiusers}
- **Endpoint**: `/api/users`
- **Method**: POST
- **Description**: Creates a new user account. Can generate a temporary password or use a provided password.
- **Authentication**: Requires admin privileges, valid session and CSRF token
- **Request Body**:

  ```json
  {
    "username": "newuser",
    "password": "optional-password",
    "isAdmin": false,
    "requirePasswordChange": true
  }
  ```

- `username`: Required, must be 3-50 characters, unique
  - `password`: Optional, if not provided a secure temporary password is generated
  - `isAdmin`: Optional, default false
  - `requirePasswordChange`: Optional, default true
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

- `temporaryPassword` is only included if a password was auto-generated
- **Error Responses**:
  - `400`: Invalid username format, password policy violation, or validation errors
  - `401`: Unauthorized - Invalid session or CSRF token
  - `403`: Forbidden - Admin privileges required
  - `409`: Username already exists
  - `500`: Internal server error
- **Notes**:
  - Only accessible to admin users
  - Username is case-insensitive and stored in lowercase
  - If password is not provided, a secure 12-character password is generated
  - Generated temporary passwords are only returned once in the response
  - User creation is logged to audit log

### Update User - `/api/users/:id` {#update-user---apiusersid}
- **Endpoint**: `/api/users/:id`
- **Method**: PATCH
- **Description**: Updates user information including username, admin status, password change requirement, and password reset.
- **Authentication**: Requires admin privileges, valid session and CSRF token
- **Parameters**:
  - `id`: User ID to update
- **Request Body**:

  ```json
  {
    "username": "updated-username",
    "isAdmin": true,
    "requirePasswordChange": false,
    "resetPassword": true
  }
  ```

- All fields are optional
  - `resetPassword`: If true, generates a new temporary password and sets `requirePasswordChange` to true
- **Response** (with password reset):

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

- **Response** (without password reset):

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

- **Error Responses**:
  - `400`: Invalid input or validation errors
  - `401`: Unauthorized - Invalid session or CSRF token
  - `403`: Forbidden - Admin privileges required
  - `404`: User not found
  - `409`: Username already exists (if changing username)
  - `500`: Internal server error
- **Notes**:
  - Only accessible to admin users
  - Username changes are validated for uniqueness
  - Password reset generates a secure 12-character temporary password
  - All changes are logged to audit log

### Delete User - `/api/users/:id` {#delete-user---apiusersid}
- **Endpoint**: `/api/users/:id`
- **Method**: DELETE
- **Description**: Deletes a user account. Prevents deleting yourself or the last admin account.
- **Authentication**: Requires admin privileges, valid session and CSRF token
- **Parameters**:
  - `id`: User ID to delete
- **Response**:

  ```json
  {
    "success": true,
    "message": "User deleted successfully"
  }
  ```

- **Truti Javab**:
  - `400`: Apne khud ke account ko delete nahi kiya ja sakta ya antim admin account
  - `401`: Unauthorized - Invalid session ya CSRF token
  - `403`: Forbidden - Admin privileges chahiye
  - `404`: User nahin mila
  - `500`: Antarik server truti
- **Notes**:
  - Sirf admin users ke liye accessible
  - Apne khud ke account ko delete nahi kiya ja sakta
  - Antim admin account ko delete nahi kiya ja sakta (kam se kam ek admin bachana chahiye)
  - User deletion ko audit log mein log kiya jata hai
  - Associated sessions ko automatically delete kiya jata hai (cascade)

## Audit Log Management {#audit-log-management}

### List Audit Logs - `/api/audit-log` {#list-audit-logs---apiaudit-log}
- **Endpoint**: `/api/audit-log`
- **Method**: GET
- **Description**: Audit log entries ko filtering, pagination, aur search capabilities ke saath retrieve karta hai. Page-based aur offset-based pagination ko support karta hai.
- **Authentication**: Valid session aur CSRF token chahiye (logged-in user required)
- **Query Parameters**:
  - `page` (optional): Page number for page-based pagination
  - `offset` (optional): Offset for offset-based pagination (page se zyada precedence)
  - `limit` (optional): Items per page (default: 50)
  - `startDate` (optional): Filter logs from this date (ISO format)
  - `endDate` (optional): Filter logs to this date (ISO format)
  - `userId` (optional): Filter by user ID
  - `username` (optional): Username dwara filter karein
  - `action` (optional): Filter by action name
  - `category` (optional): Filter by category (`auth`, `user_management`, `config`, `backup`, `server`)
  - `status` (optional): Filter by status (`success`, `failure`, `error`)
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

- **Error Responses**:
  - `401`: Unauthorized - Invalid session or CSRF token
  - `500`: Internal server error
- **Notes**:
  - Page-based (`page`) aur offset-based (`offset`) pagination ko support karta hai
  - `details` field mein parsed JSON hota hai with additional context
  - Sabhi audit log queries ko log kiya jata hai

### Get Audit Log Filter Values - `/api/audit-log/filters` {#get-audit-log-filter-values---apiaudit-logfilters}
- **Endpoint**: `/api/audit-log/filters`
- **Method**: GET
- **Description**: Audit logs ke liye filtering ke liye available unique filter values ko retrieve karta hai. Returns all distinct actions, categories, aur statuses that exist in the audit log database. Useful for populating filter dropdowns in the UI.
- **Authentication**: Valid session aur CSRF token chahiye (logged-in user required)
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

- **Error Responses**:
  - `401`: Unauthorized - Invalid session or CSRF token
  - `500`: Internal server error
- **Notes**:
  - Audit log database se unique values ko return karta hai
  - Values ko alphabetically sort kiya jata hai
  - Agar koi data nahin hai ya error hai toh empty arrays return hoti hai
  - Audit log viewer ke liye filter dropdowns ko dynamically populate karne ke liye use kiya jata hai

### Download Audit Logs - `/api/audit-log/download` {#download-audit-logs---apiaudit-logdownload}
- **Endpoint**: `/api/audit-log/download`
- **Method**: GET
- **Description**: Audit logs ko CSV ya JSON format mein download karta hai with optional filtering. Useful for external analysis and reporting.
- **Authentication**: Valid session aur CSRF token chahiye (logged-in user required)
- **Query Parameters**:
  - `format` (optional): Export format - `csv` or `json` (default: `csv`)
  - `startDate` (optional): Filter logs from this date (ISO format)
  - `endDate` (optional): Filter logs to this date (ISO format)
  - `userId` (optional): Filter by user ID
  - `username` (optional): Filter by username
  - `action` (optional): Filter by action name
  - `category` (optional): Filter by category
  - `status` (optional): Filter by status
- **Response** (CSV):
  - Content-Type: `text/csv`
  - Content-Disposition: `attachment; filename="audit-log-YYYY-MM-DD.csv"`
  - CSV file with headers: ID, Timestamp, User ID, Username, Action, Category, Target Type, Target ID, Status, IP Address, User Agent, Details, Error Message
- **Response** (JSON):
  - Content-Type: `application/json`
  - Content-Disposition: `attachment; filename="audit-log-YYYY-MM-DD.json"`
  - JSON array of audit log entries
- **Error Responses**:
  - `400`: No logs to export
  - `401`: Unauthorized - Invalid session or CSRF token
  - `500`: Internal server error
- **Notes**:
  - Export limit is 10,000 records
  - CSV format escapes special characters properly
  - Details field in CSV is JSON-stringified
  - File name includes the current date

### Cleanup Audit Logs - `/api/audit-log/cleanup` {#cleanup-audit-logs---apiaudit-logcleanup}
- **Endpoint**: `/api/audit-log/cleanup`
- **Method**: POST
- **Description**: Manually triggers cleanup of old audit logs based on retention period. Supports dry-run mode to preview what would be deleted.
- **Authentication**: Requires admin privileges, valid session and CSRF token
- **Request Body**:

  ```json
  {
    "retentionDays": 90,
    "dryRun": false
  }
  ```

- `retentionDays` (optional): Override retention days (30-365), otherwise uses configured value
  - `dryRun` (optional): If true, only returns what would be deleted without actually deleting
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

- **Response** (actual cleanup):

  ```json
  {
    "success": true,
    "deletedCount": 50,
    "oldestRemaining": "2024-01-01T00:00:00Z",
    "retentionDays": 90
  }
  ```

- **Error Responses**:
  - `400`: Invalid retention days (must be 30-365)
  - `401`: Unauthorized - Invalid session or CSRF token
  - `403`: Forbidden - Admin privileges required
  - `500`: Internal server error
- **Notes**:
  - Only accessible to admin users
  - Default retention is 90 days if not configured
  - Cleanup operation is logged to audit log
  - Dry-run mode is useful for previewing cleanup impact

### Get Audit Log Retention - `/api/audit-log/retention` {#get-audit-log-retention---apiaudit-logretention}
- **Endpoint**: `/api/audit-log/retention`
- **Method**: GET
- **Description**: Retrieves the current audit log retention configuration in days.
- **Authentication**: Requires valid session and CSRF token (no logged-in user required)
- **Response**:

  ```json
  {
    "retentionDays": 90
  }
  ```

- **Error Responses**:
  - `500`: Internal server error
- **Notes**:
  - Default retention is 90 days if not configured
  - Can be accessed without authentication (read-only)

### Update Audit Log Retention - `/api/audit-log/retention` {#update-audit-log-retention---apiaudit-logretention}
- **Endpoint**: `/api/audit-log/retention`
- **Method**: PATCH
- **Description**: Updates the audit log retention period in days. This setting determines how long audit logs are kept before automatic cleanup.
- **Authentication**: Requires admin privileges, valid session and CSRF token
- **Request Body**:

  ```json
  {
    "retentionDays": 120
  }
  ```

- `retentionDays`: Required, must be between 30 and 365 days
- **Response**:

  ```json
  {
    "success": true,
    "retentionDays": 120
  }
  ```

- **Error Responses**:
  - `400`: Invalid retention days (must be 30-365)
  - `401`: Unauthorized - Invalid session or CSRF token
  - `403`: Forbidden - Admin privileges required
  - `500`: Internal server error
- **Notes**:
  - Only accessible to admin users
  - Configuration change is logged to audit log
  - Retention period affects automatic and manual cleanup operations

## डेटाबेस प्रबंधन {#database-management}

### डेटाबेस बैकअप - `/api/database/backup` {#backup-database---apidatabasebackup}
- **Endpoint**: `/api/database/backup`
- **Method**: GET
- **Description**: डेटाबेस का बैकअप बनाता है, या तो बाइनरी (.db) या SQL (.sql) फॉर्मेट में। बैकअप फ़ाइल स्वचालित रूप से डाउनलोड की जाती है, जिसमें टाइमस्टैम्प वाला फ़ाइलनाम होता है।
- **Authentication**: एडमिन प्राधिकृत, वैध सत्र और CSRF टोकन की आवश्यकता होती है
- **Query Parameters**:
  - `format` (optional): बैकअप फॉर्मेट - `db` (बाइनरी) या `sql` (SQL डंप)। डिफ़ॉल्ट: `db`
- **Response**:
  - Content-Type: `application/octet-stream` (for .db) or `text/plain` (for .sql)
  - Content-Disposition: `attachment; filename="duplistatus-backup-YYYY-MM-DDTHH-MM-SS.db"` or `.sql`
  - Binary file content (for .db) or SQL text content (for .sql)
- **Error Responses**:
  - `400`: अमान्य फॉर्मेट ("db" या "sql" होना चाहिए)
  - `401`: अनधिकृत - अमान्य सत्र या CSRF टोकन
  - `403`: निषेधित - एडमिन प्राधिकृत आवश्यक
  - `500`: डेटाबेस बैकअप बनाने में असफल
- **Notes**:
  - केवल एडमिन उपयोगकर्ताओं के लिए उपलब्ध
  - बाइनरी फॉर्मेट में SQLite का बैकअप विधि उपयोग की जाती है, अखंडता के लिए
  - SQL फॉर्मेट में सभी डेटाबेस सामग्री का टेक्स्ट डंप बनाया जाता है
  - फ़ाइलनाम में टाइमस्टैम्प सर्वर के स्थानीय समय क्षेत्र का उपयोग करता है
  - बैकअप ऑपरेशन ऑडिट लॉग में लॉग किया जाता है
  - डाउनलोड के बाद अस्थायी फ़ाइलें स्वचालित रूप से साफ़ की जाती हैं

### डेटाबेस रिस्टोर - `/api/database/restore` {#restore-database---apidatabaserestore}
- **Endpoint**: `/api/database/restore`
- **Method**: POST
- **Description**: बैकअप फ़ाइल (.db या .sql फॉर्मेट) से डेटाबेस को रिस्टोर करता है। रिस्टोर से पहले एक सुरक्षा बैकअप बनाता है और रिस्टोर के बाद सभी सत्रों को साफ़ करता है, सुरक्षा के लिए।
- **Authentication**: एडमिन प्राधिकृत, वैध सत्र और CSRF टोकन की आवश्यकता होती है
- **Request Body**: FormData जिसमें एक फ़ाइल फ़ील्ड होता है, जिसका नाम `database` होता है
  - फ़ाइल या तो `.db`, `.sqlite`, `.sqlite3` (बाइनरी फॉर्मेट) या `.sql` (SQL फॉर्मेट) होनी चाहिए
  - अधिकतम फ़ाइल आकार: 100MB
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
  - `400`: कोई फ़ाइल प्रदान नहीं की गई, फ़ाइल आकार सीमा से अधिक, अमान्य फ़ाइल फॉर्मेट, या डेटाबेस अखंडता जाँच असफल
  - `401`: अनधिकृत - अमान्य सत्र या CSRF टोकन
  - `403`: निषेधित - एडमिन प्राधिकृत आवश्यक
  - `500`: डेटाबेस रिस्टोर करने में असफल (असफल होने पर मूल डेटाबेस सुरक्षा बैकअप से रिस्टोर किया जाता है)
- **Notes**:
  - केवल एडमिन उपयोगकर्ताओं के लिए उपलब्ध
  - रिस्टोर से पहले स्वचालित रूप से एक सुरक्षा बैकअप बनाता है
  - दोनों बाइनरी (.db) और SQL (.sql) फॉर्मेट का समर्थन करता है
  - रिस्टोर के बाद डेटाबेस अखंडता की जाँच करता है
  - अगर रिस्टोर असफल होता है, तो स्वचालित रूप से सुरक्षा बैकअप से रिस्टोर करता है
  - सफल रिस्टोर के बाद सभी सत्र साफ़ किए जाते हैं, सुरक्षा के लिए
  - वापस `requiresReauth: true` लौटाता है, जो इंगित करता है कि उपयोगकर्ता को फिर से लॉग इन करना होगा
  - रिस्टोर ऑपरेशन ऑडिट लॉग में लॉग किया जाता है
  - SQL फॉर्मेट के लिए, निष्पादन से पहले SQL सामग्री की जाँच की जाती है
  - रिस्टोर के बाद डेटाबेस कनेक्शन को फिर से प्रारंभ किया जाता है
  - रिस्टोर के बाद सभी कैशे अमान्य हो जाते हैं

## बैकअप टाइमस्टैम्प {#backup-timestamps}

### अंतिम बैकअप टाइमस्टैम्प प्राप्त करें - `/api/backups/last-timestamps` {#get-last-backup-timestamps---apibackupslast-timestamps}
- **Endpoint**: `/api/backups/last-timestamps`
- **Method**: GET
- **Description**: प्रत्येक सर्वर-बैकअप संयोजन के लिए अंतिम बैकअप टाइमस्टैम्प प्राप्त करता है। आसान लुकअप के लिए एक मैप लौटाता है।
- **Authentication**: वैध सत्र और CSRF टोकन की आवश्यकता होती है
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
  - `401`: अनधिकृत - अमान्य सत्र या CSRF टोकन
  - `500`: अंतिम बैकअप टाइमस्टैम्प प्राप्त करने में असफल
- **Notes**:
  - एक मैप (आसान लुकअप के लिए `server_id:backup_name` द्वारा) और रॉ एरे फॉर्मेट दोनों लौटाता है
  - कैशिंग को रोकने के लिए कैश कंट्रोल हेडर शामिल हैं
  - सभी सर्वर-बैकअप संयोजन के अंतिम बैकअप समयों को ट्रैक करने के लिए उपयोगी
  - टाइमस्टैम्प ISO फॉर्मेट में होते हैं

## Application Logs Management {#application-logs-management}

### Get Application Logs - `/api/application-logs` {#get-application-logs---apiapplication-logs}
- **Endpoint**: `/api/application-logs`
- **Method**: GET
- **Description**: Log file se application log entries ko retrieve karta hai. Current aur rotated log files ko tail functionality ke saath padhne ka support karta hai.
- **Authentication**: Admin privileges, valid session aur CSRF token ki zarurat hoti hai
- **Query Parameters**:
  - `file` (optional): Padhne ke liye log file ka naam - `application.log`, `application.log.1`, `application.log.2`, etc. Agar nahi diya gaya hai, to available files list return karta hai
  - `tail` (optional): File ke end se return karne wale lines ki sankhya (default: 1000, min: 1, max: 10000)
- **Response** (with file parameter):

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

- **Response** (without file parameter):

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

- **Error Responses**:
  - `400`: Invalid tail parameter (must be 1-10000) or invalid file parameter format
  - `401`: Unauthorized - Invalid session or CSRF token
  - `403`: Forbidden - Admin privileges required
  - `404`: Log file not found
  - `500`: Failed to read log file
- **Notes**:
  - Sirf admin users ke liye accessible hai
  - Current log file aur rotated log files (upto 10 rotated files) ko padhne ka support karta hai
  - Specified log file se last N lines (tail) return karta hai
  - Log file ka naam environment variable se decide hota hai (default: `application.log`)
  - Agar file parameter nahi diya gaya hai, to available log files ki list return karta hai
  - File names ko directory traversal attacks se bachane ke liye validate kiya jata hai
  - Rotated files sequentially numbered hoti hain (`.1`, `.2`, etc.)

### Export Application Logs - `/api/application-logs/export` {#export-application-logs---apiapplication-logsexport}
- **Endpoint**: `/api/application-logs/export`
- **Method**: GET
- **Description**: Filtered text format mein application log entries ko export karta hai. Log level aur search string ke basis par filtering ka support karta hai.
- **Authentication**: Admin privileges, valid session aur CSRF token ki zarurat hoti hai
- **Query Parameters**:
  - `file` (required): Export karne ke liye log file ka naam - `application.log`, `application.log.1`, `application.log.2`, etc.
  - `logLevels` (optional): Include karne wale log levels ki comma-separated list - `INFO`, `WARN`, `ERROR` (default: `INFO,WARN,ERROR`)
  - `search` (optional): Log lines ko filter karne ke liye search string (case-insensitive)
- **Response**:
  - Content-Type: `text/plain`
  - Content-Disposition: `attachment; filename="duplistatus-logs-YYYY-MM-DDTHH-MM-SS.txt"`
  - Filtered log content as plain text
- **Error Responses**:
  - `400`: File parameter is required or invalid file parameter format
  - `401`: Unauthorized - Invalid session or CSRF token
  - `403`: Forbidden - Admin privileges required
  - `500`: Failed to export logs
- **Notes**:
  - Sirf admin users ke liye accessible hai
  - Log level aur search criteria ke basis par filtered log entries ko export karta hai
  - Log levels ke basis par filtering ka support karta hai: `INFO`, `WARN`, `ERROR`
  - Search string filtering case-insensitive hoti hai
  - Empty lines automatically filter out hoti hain
  - Log file ka naam environment variable se decide hota hai (default: `application.log`)
  - File names ko directory traversal attacks se bachane ke liye validate kiya jata hai
  - Exported file mein filename mein timestamp shamil hota hai
  - External analysis aur troubleshooting ke liye useful hai
