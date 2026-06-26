# Authentication aur Suraksha {#authentication-security}

API sabhi database likhne ke operations ke liye session-aadhaarit authentication aur CSRF protection ka combination istemaal karta hai taaki anadhikrit pahunch aur sambhavit denial-of-service hamlon ko roka ja sake. Bahari APIs (Duplicati dwara istemaal ki jaane wali) compatibility ke liye anauthenticated rahti hain.

## Session-Aadhaarit Authentication {#session-based-authentication}

Surakshit endpoints ke liye ek vaidh session cookie aur CSRF token zaroori hai. Session pranali sabhi surakshit operations ke liye surakshit authentication pradaan karti hai.

### Session Prabandhan {#session-management}
1. **Session Banayein**: Nayi session banane ke liye `/api/session` par POST karein
2. **CSRF Token Prapt Karein**: Session ke liye CSRF token prapt karne ke liye `/api/csrf` par GET karein
3. **Requests mein Shamil Karein**: Surakshit requests ke saath session cookie aur CSRF token bhejein
4. **Session Validate Karein**: Session abhi bhi vaidh hai ya nahi, yeh jaanchne ke liye `/api/session` par GET karein
5. **Session Delete Karein**: Logout karne aur session clear karne ke liye `/api/session` par DELETE karein

### CSRF Suraksha {#csrf-protection}
Sabhi sthiti-badalne wale operations ke liye ek vaidh CSRF token zaroori hai jo vartaman session se mel khata ho. Surakshit endpoints ke liye CSRF token `X-CSRF-Token` header mein shamil kiya jana chahiye.

### Surakshit Endpoints {#protected-endpoints}
Database data ko modify karne wale sabhi endpoints ke liye session authentication aur CSRF token zaroori hai:

- **Server Prabandhan**: `/api/servers/:id` (PATCH, DELETE), `/api/servers/:id/server-url` (PATCH), `/api/servers/:id/password` (PATCH, GET)
- **Configuration Prabandhan**: `/api/configuration/email` (GET, POST, DELETE), `/api/configuration/unified` (GET), `/api/configuration/ntfy` (GET), `/api/configuration/notifications` (GET, POST), `/api/configuration/backup-settings` (POST), `/api/configuration/templates` (POST), `/api/configuration/overdue-tolerance` (GET, POST)
- **Notification Pranali**: `/api/notifications/test` (POST)
- **Cron Configuration**: `/api/cron-config` (GET, POST)
- **Cron Proxy**: `/api/cron/*` (GET, POST) - cron service ko requests proxy karta hai
- **Session Prabandhan**: `/api/session` (POST, GET, DELETE), `/api/csrf` (GET)
- **Chart Data**: `/api/chart-data/*` (GET)
- **Dashboard**: `/api/dashboard` (GET)
- **Server Vivaran**: `/api/servers` (GET), `/api/servers/:id` (GET), `/api/detail/:serverId` (GET)
- **Audit Log**: `/api/audit-log` (GET), `/api/audit-log/download` (GET), `/api/audit-log/filters` (GET), `/api/audit-log/retention` (PATCH), `/api/audit-log/cleanup` (POST) - likhne ke operations ke liye Admin zaroori
- **Upyogkarta Prabandhan**: `/api/users` (GET, POST, PATCH, DELETE) - Admin zaroori
- **Database Prabandhan**: `/api/database/backup` (GET), `/api/database/restore` (POST) - Admin zaroori
- **Application Logs**: `/api/application-logs` (GET), `/api/application-logs/export` (GET) - Admin zaroori
- **Backup Collection**: `/api/backups/collect` (POST) - session aur CSRF token ki zaroorat hai
- **Backup Schedule Sync**: `/api/backups/sync-schedule` (POST) - session aur CSRF token ki zaroorat hai
- **Overdue Check**: `/api/notifications/check-overdue` (POST) - session aur CSRF token ki zaroorat hai
- **Clear Overdue Timestamps**: `/api/notifications/clear-overdue-timestamps` (POST) - session aur CSRF token ki zaroorat hai

### Unprotected Endpoints {#unprotected-endpoints}
Duplicati integration ke liye bahari APIs anauthenticated rahti hain:

- `/api/upload` - Duplicati se backup data uploads
- `/api/lastbackup/:serverId` - Latest backup stithi
- `/api/lastbackups/:serverId` - Latest backups stithi
- `/api/summary` - Overall summary data
- `/api/health` - Health check endpoint

### Upyog ka Udaharan (Session + CSRF) {#usage-example-session--csrf}

```typescript
// 1. Create session
const sessionResponse = await fetch('/api/session', { method: 'POST' });
const { sessionId } = await sessionResponse.json();

// 2. Get CSRF token
const csrfResponse = await fetch('/api/csrf', {
  headers: { 'Cookie': `session=${sessionId}` }
});
const { csrfToken } = await csrfResponse.json();

// 3. Make protected request
const response = await fetch('/api/servers/server-id', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken,
    'Cookie': `session=${sessionId}`
  },
  body: JSON.stringify({
    alias: 'Updated Server Name',
    note: 'Updated notes'
  })
});
```

## Authentication Endpoints {#authentication-endpoints}

### Login - `/api/auth/login` {#login---apiauthlogin}
- **Endpoint**: `/api/auth/login`
- **Method**: POST
- **Description**: Ek upyogkarta ko authenticate karta hai aur ek session banata hai. Asafal prayason ke baad account locking aur password badalne ki avashyaktaon ka samarthan karta hai.
- **Authentication**: Vaidh session aur CSRF token ki zaroorat hai (lekin koi logged-in upyogkarta nahi)
- **Request Body**:

  ```json
  {
    "username": "admin",
    "password": "password123"
  }
  ```

- **Response** (safalta):

  ```json
  {
    "success": true,
    "user": {
      "id": "user-id",
      "username": "admin",
      "isAdmin": true,
      "mustChangePassword": false
    },
    "keyChanged": false
  }
  ```

- **Truti Responses**: Sabhi truti responses mein `error` (English message) aur `errorCode` (client-side translation ke liye stable code) shamil hain.
  - `400`: Username ya password nahin hai — `errorCode: "REQUIRED_CREDENTIALS"`
  - `401`: Galat username ya password — `errorCode: "INVALID_CREDENTIALS"`
  - `403`: Bahut adhik asafal login prayason ke karan account lock ho gaya hai — `errorCode: "ACCOUNT_LOCKED"` (shamil hai `lockedUntil`, `minutesRemaining`)
  - `500`: Antarik server truti — `errorCode: "INTERNAL_ERROR"`
  - `503`: Database taiyar nahin hai — `errorCode: "DATABASE_NOT_READY"`
- **Notes**:
  - Account 15 minute ke liye 5 asafal login prayason ke baad lock ho jata hai
  - Asafal login prayason ko track aur log kiya jata hai
  - Session cookie response mein swayam set ho jata hai
  - Yadi user mein `mustChangePassword` flag set hai, to unhein password badalne wale page par redirect kiya jana chahiye
  - Sabhi login prayason (safal aur asafal) ko audit log mein record kiya jata hai

### Logout - `/api/auth/logout` {#logout---apiauthlogout}
- **Endpoint**: `/api/auth/logout`
- **Method**: POST
- **Description**: Vartaman user ko logout karta hai aur unka session destroy karta hai.
- **Authentication**: Vaidh session aur CSRF token avashyak hai
- **Response** (safalta):

  ```json
  {
    "success": true,
    "message": "Logged out successfully",
    "successCode": "LOGGED_OUT"
  }
  ```

- **Truti Responses**: Client-side translation ke liye `error` aur `errorCode` shamil hain.
  - `400`: Koi sakriya session nahin hai — `errorCode: "NO_ACTIVE_SESSION"`
  - `500`: Antarik server truti — `errorCode: "INTERNAL_ERROR"`
- **Notes**:
  - Session cookie response mein clear kar diya jata hai
  - Logout ko audit log mein record kiya jata hai
  - Session turant avaidh kar diya jata hai

### Get Current User - `/api/auth/me` {#get-current-user---apiauthme}
- **Endpoint**: `/api/auth/me`
- **Method**: GET
- **Description**: Vartaman authenticated user ki jankari lautata hai, ya batata hai ki koi user login nahin hai.
- **Authentication**: Vaidh session avashyak hai (lekin koi login kiya hua user avashyak nahin hai)
- **Response** (authenticated):

  ```json
  {
    "authenticated": true,
    "user": {
      "id": "user-id",
      "username": "admin",
      "isAdmin": true,
      "mustChangePassword": false
    }
  }
  ```

- **Response** (not authenticated):

  ```json
  {
    "authenticated": false,
    "user": null
  }
  ```

- **Truti Responses**: Client-side translation ke liye `error` aur `errorCode` shamil hain.
  - `500`: Antarik server truti — `errorCode: "INTERNAL_ERROR"`
- **Notes**:
  - Bina login kiye hue user ke bhi call kiya ja sakta hai (lautata hai `authenticated: false`)
  - Page load par authentication stithi ki jaanch ke liye upyogi

### Change Password - `/api/auth/change-password` {#change-password---apiauthchange-password}
- **Endpoint**: `/api/auth/change-password`
- **Method**: POST
- **Description**: Vartaman authenticated user ke liye password badalta hai. Yadi `mustChangePassword` set hai, to vartaman password ki jaanch chhod di jati hai.
- **Authentication**: Vaidh session aur CSRF token avashyak hai (login kiya hua user avashyak hai)
- **Request Body**:

  ```json
  {
    "currentPassword": "old-password",
    "newPassword": "new-secure-password"
  }
  ```

- `currentPassword`: Yadi `mustChangePassword` satya hai to vaikalpik, anyatha avashyak
  - `newPassword`: Avashyak, password policy ki avashyaktaon ko poora karna chahiye
- **Response** (safalta):

  ```json
  {
    "success": true,
    "message": "Password changed successfully",
    "successCode": "PASSWORD_CHANGED"
  }
  ```

- **Truti Responses**: Client-side translation ke liye `error` aur `errorCode` shamil hain. Policy violation mein `validationErrors` (strings ka array) shamil ho sakta hai.
  - `400`: Naya password nahin hai — `errorCode: "NEW_PASSWORD_REQUIRED"`
  - `400`: Password policy violation — `errorCode: "POLICY_NOT_MET"` (shamil ho sakta hai `validationErrors`)
  - `400`: Naya password vartaman password jaisa hi hai — `errorCode: "NEW_PASSWORD_SAME_AS_CURRENT"`
  - `401`: Vartaman password galat hai — `errorCode: "CURRENT_PASSWORD_INCORRECT"`
  - `404`: User nahin mila — `errorCode: "USER_NOT_FOUND"`
  - `500`: Antarik server truti — `errorCode: "INTERNAL_ERROR"`
- **Notes**:
  - Naye password ko password policy ki avashyaktaon (lambai, jatilta, ityadi) ko poora karna chahiye
  - Yadi `mustChangePassword` flag set hai, to vartaman password ki jaanch chhod di jati hai
  - Safal password badlav ke baad, `mustChangePassword` flag clear kar diya jata hai
  - Password badlav ko audit log mein record kiya jata hai
  - Naya password vartaman password se alag hona chahiye

### Admin Password Badalna Hai Ki Nahi - `/api/auth/admin-must-change-password` {#check-admin-must-change-password---apiauthadmin-must-change-password}
- **Endpoint**: `/api/auth/admin-must-change-password`
- **Method**: GET
- **Description**: Yah jaanchta hai ki kya admin upyogkarta ko apna password badalna hai. Yah endpoint public hai (koi authentication anivarya nahi hai) kyunki yah kewal ek boolean flag lautata hai.
- **Response**:

  ```json
  {
    "mustChangePassword": false
  }
  ```

- **Truti Jawab**:
  - `500`: Antarik server truti (truti hone par `mustChangePassword: false` lautata hai taaki database samasya hone par tip dikhane se bacha ja sake)
- **Notes**:
  - Public endpoint, koi authentication anivarya nahi hai
  - Yadi admin upyogkarta maujood nahi hai to `false` lautata hai
  - Yah nirdharit karne ke liye istemaal kiya jaata hai ki password badalne ki tip dikhai jani chahiye ya nahi
  - Truti hone par, database samasya hone par tip dikhane se bachne ke liye `false` lautata hai

### Password Policy Prapt Karein - `/api/auth/password-policy` {#get-password-policy---apiauthpassword-policy}
- **Endpoint**: `/api/auth/password-policy`
- **Method**: GET
- **Description**: Vartaman password policy configuration lautata hai. Yah endpoint public hai (koi authentication anivarya nahi hai) kyunki yah frontend validation ke liye zaroori hai.
- **Response**:

  ```json
  {
    "minLength": 8,
    "requireUppercase": true,
    "requireLowercase": true,
    "requireNumbers": true,
    "requireSpecialChars": false
  }
  ```

- **Truti Jawab**: Client-side translation ke liye `error` aur `errorCode` shamil karein.
  - `500`: Password policy prapt karne mein asafal — `errorCode: "POLICY_RETRIEVE_FAILED"`
- **Notes**:
  - Public endpoint, koi authentication anivarya nahi hai
  - Password avashyaktaon ko dikhane aur submission se pehle passwords ko validate karne ke liye frontend components dwara istemaal kiya jaata hai
  - Policy environment variables (`PWD_ENFORCE`, `PWD_MIN_LEN`) ke madhyam se configure ki jaati hai
  - Default password check (default admin password ka istemaal rokna) policy settings ke bawajood hamesha lagu kiya jaata hai

### Auth API truti aur safalta codes (i18n) {#auth-api-error-and-success-codes-i18n}

Auth endpoints manav-pathya `error` ya `message` field ke alawa ek sthir `errorCode` (aur, safalta par, `successCode`) lautate hain. `error` aur `message` value English mein hain. Clients ko localized strings lookup karne ke liye codes ka istemaal karna chahiye taaki UI upyogkarta ki chuni hui bhaasha mein sandesh dikhaye.

| Endpoint | Safalta code | Truti codes |
|----------|--------------|-------------|
| `/api/auth/login` | — | `REQUIRED_CREDENTIALS`, `INVALID_CREDENTIALS`, `ACCOUNT_LOCKED`, `DATABASE_NOT_READY`, `INTERNAL_ERROR` |
| `/api/auth/logout` | `LOGGED_OUT` | `NO_ACTIVE_SESSION`, `INTERNAL_ERROR` |
| `/api/auth/me` | — | `INTERNAL_ERROR` |
| `/api/auth/change-password` | `PASSWORD_CHANGED` | `NEW_PASSWORD_REQUIRED`, `POLICY_NOT_MET`, `USER_NOT_FOUND`, `CURRENT_PASSWORD_INCORRECT`, `NEW_PASSWORD_SAME_AS_CURRENT`, `INTERNAL_ERROR` |
| `/api/auth/password-policy` | — | `POLICY_RETRIEVE_FAILED` |

### Truti Jawab {#error-responses}
- `401 Unauthorized`: Avidh ya gair-maujood session, samapt session, ya CSRF token validation asafal
- `403 Forbidden`: CSRF token validation asafal ya operation ki anumati nahi hai

:::caution
 **duplistatus** server ko public internet par expose na karein. Iska istemaal ek surakshit network mein karein 
(jaise, firewall dwara surakshit local LAN).

**duplistatus** interface ko public
 internet par bina uchit suraksha upaayon ke expose karne se anadhikrit access ho sakta hai.
:::
