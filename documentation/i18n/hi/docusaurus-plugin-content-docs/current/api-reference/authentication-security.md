# Authentication & Security {#authentication-security}

API सत्र-आधारित प्रमाणीकरण और CSRF सुरक्षा का उपयोग सभी डेटाबेस लिखने संचालनों के लिए अनधिकृत पहुंच और संभावित सेवा अस्वीकृति हमलों को रोकने के लिए करता है। डुप्लिकेटी और होमपेज द्वारा उपयोग किए जाने वाले बाहरी एपीआई CSRF-रहित रहते हैं। वे वैकल्पिक रूप से एक स्कोप्ड एपीआई कुंजी और/या एक आईपी अनुमति सूची की आवश्यकता रख सकते हैं (दोनों डिफ़ॉल्ट रूप से बंद हैं)। `/api/upload` में एक कॉन्फ़िगर करने योग्य बॉडी-साइज़ कैप और रेट लिमिट भी है।

## Session-Based Authentication {#session-based-authentication}

Protected endpoints ke liye valid session cookie aur CSRF token ki zaroorat hoti hai. Session system secure authentication provide karta hai sabhi protected operations ke liye.

### Session Management {#session-management}
1. **Create Session**: POST to `/api/session` to create a new session
2. **Get CSRF Token**: GET `/api/csrf` to obtain a CSRF token for the session
3. **Include in Requests**: Send session cookie and CSRF token with protected requests
4. **Validate Session**: GET `/api/session` to check if session is still valid
5. **Delete Session**: DELETE `/api/session` to logout and clear session

### CSRF Protection {#csrf-protection}
Sabhi state-changing operations ke liye valid CSRF token ki zaroorat hoti hai jo current session ke saath match karta ho. CSRF token ko protected endpoints ke liye `X-CSRF-Token` header mein bhejna hota hai.

### Protected Endpoints {#protected-endpoints}
Sabhi endpoints jo database data modify karte hain, session authentication aur CSRF token ki zaroorat hoti hai:

- **सर्वर प्रबंधन**: `/api/servers/:id` (PATCH, DELETE), `/api/servers/:id/server-url` (PATCH), `/api/servers/:id/password` (PATCH, GET)
- **कॉन्फ़िगरेशन प्रबंधन**: `/api/configuration/email` (GET, POST, DELETE), `/api/configuration/unified` (GET), `/api/configuration/ntfy` (GET), `/api/configuration/notifications` (GET, POST), `/api/configuration/backup-settings` (POST), `/api/configuration/templates` (POST), `/api/configuration/overdue-tolerance` (GET, POST), `/api/configuration/daily-summary` (GET, POST), `/api/configuration/daily-summary/send` (POST), `/api/configuration/daily-summary/retry` (POST), `/api/configuration/daily-summary/preview` (POST)
- **सूचना प्रणाली**: `/api/notifications/test` (POST), `/api/notifications/preview` (POST)
- **क्रॉन कॉन्फ़िगरेशन**: `/api/cron-config` (GET, POST)
- **क्रॉन प्रॉक्सी**: `/api/cron/*` (GET, POST) - क्रॉन सेवा के लिए अनुरोधों को प्रॉक्सी करता है। POST के लिए एक व्यवस्थापक की आवश्यकता होती है। क्रॉन प्रक्रिया डिफ़ॉल्ट रूप से `127.0.0.1` पर बाइंड होती है; क्रॉन-सेवा रूट्स को बदलने के लिए `X-Cron-Service-Secret` की आवश्यकता होती है जब `CRON_SERVICE_SECRET` सेट होती है।
- **सत्र प्रबंधन**: `/api/session` (POST, GET, DELETE), `/api/csrf` (GET)
- **चार्ट डेटा**: `/api/chart-data/*` (GET)
- **डैशबोर्ड**: `/api/dashboard` (GET)
- **Server Details**: `/api/servers` (GET), `/api/servers/:id` (GET), `/api/detail/:serverId` (GET)
- **Audit Log**: `/api/audit-log` (GET), `/api/audit-log/download` (GET), `/api/audit-log/filters` (GET), `/api/audit-log/retention` (PATCH), `/api/audit-log/cleanup` (POST) - admin required for write operations
- **User Management**: `/api/users` (GET, POST, PATCH, DELETE) - admin required
- **Database Management**: `/api/database/backup` (GET), `/api/database/restore` (POST) - admin required
- **Application Logs**: `/api/application-logs` (GET), `/api/application-logs/export` (GET) - admin required
- **Backup Collection**: `/api/backups/collect` (POST) - requires session and CSRF token
- **Backup Schedule Sync**: `/api/backups/sync-schedule` (POST) - requires session and CSRF token
- **Overdue Check**: `/api/notifications/check-overdue` (POST) - requires session and CSRF token
- **Clear Overdue Timestamps**: `/api/notifications/clear-overdue-timestamps` (POST) - requires session and CSRF token

### बाहरी एंडपॉइंट्स {#external-endpoints}
ये रूट सत्र कुकीज़ या CSRF का उपयोग नहीं करते। प्रमाणीकरण वैकल्पिक है और सेटिंग्स में कॉन्फ़िगर किया गया है:

- `/api/upload` - डुप्लिकेटी से बैकअप डेटा अपलोड (अपलोड-स्कोप कुंजी, साइज़ और रेट लिमिट)
- `/api/lastbackup/:serverId` - नवीनतम बैकअप स्थिति (पढ़ने-स्कोप कुंजी)
- `/api/lastbackups/:serverId` - नवीनतम बैकअप स्थिति (पढ़ने-स्कोप कुंजी)
- `/api/summary` - सारांश डेटा (पढ़ने-स्कोप कुंजी)
- `/api/health` - स्वास्थ्य चेक एंडपॉइंट (कभी कुंजी नहीं)
- `/api/ping` - कनेक्टिविटी प्रोब (कभी कुंजी नहीं)

जब **एपीआई कुंजियाँ आवश्यक** चालू है, तो पहले चार रूट एक मान्य कुंजी के बिना `401` लौटाते हैं और `403` जब कुंजी स्कोप मैच नहीं करता। [एपीआई कुंजियाँ](../user-guide/settings/api-keys-settings.md) और [आईपी अनुमति सूची](../user-guide/settings/ip-allowlist-settings.md) देखें।

### Usage Example (Session + CSRF) {#usage-example-session--csrf}

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
- **Description**: Authenticates a user and creates a session. Supports account locking after failed attempts and password change requirements.
- **Authentication**: Requires valid session and CSRF token (but no logged-in user)
- **Request Body**:

  ```json
  {
    "username": "admin",
    "password": "password123"
  }
  ```

- **Response** (success):

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

- **Error Responses**: Sabhi truti jwab `error` (English message) aur `errorCode` (stable code for client-side translation) ko samahit hote hain.
  - `400`: Missing username or password — `errorCode: "REQUIRED_CREDENTIALS"`
  - `401`: Invalid username or password — `errorCode: "INVALID_CREDENTIALS"`
  - `403`: Account locked due to too many failed login attempts — `errorCode: "ACCOUNT_LOCKED"` (includes `lockedUntil`, `minutesRemaining`)
  - `500`: Internal server error — `errorCode: "INTERNAL_ERROR"`
  - `503`: Database not ready — `errorCode: "DATABASE_NOT_READY"`
- **Notes**:
  - Account is locked after 5 failed login attempts for 15 minutes
  - Failed login attempts are tracked and logged
  - Session cookie is automatically set in the response
  - If user has `mustChangePassword` flag set, they should be redirected to change password page
  - All login attempts (successful and failed) are logged to audit log

### Logout - `/api/auth/logout` {#logout---apiauthlogout}
- **Endpoint**: `/api/auth/logout`
- **Method**: POST
- **Description**: Logs out the current user and destroys their session.
- **Authentication**: Requires valid session and CSRF token
- **Response** (success):

  ```json
  {
    "success": true,
    "message": "Logged out successfully",
    "successCode": "LOGGED_OUT"
  }
  ```

- **Error Responses**: Include `error` and `errorCode` for client-side translation.
  - `400`: No active session — `errorCode: "NO_ACTIVE_SESSION"`
  - `500`: Internal server error — `errorCode: "INTERNAL_ERROR"`
- **Notes**:
  - Session cookie is cleared in the response
  - Logout is logged to audit log
  - Session is immediately invalidated

### Get Current User - `/api/auth/me` {#get-current-user---apiauthme}
- **Endpoint**: `/api/auth/me`
- **Method**: GET
- **Description**: Returns the current authenticated user information, or indicates if no user is logged in.
- **Authentication**: Requires valid session (but no logged-in user required)
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

- **Error Responses**: Include `error` and `errorCode` for client-side translation.
  - `500`: Internal server error — `errorCode: "INTERNAL_ERROR"`
- **Notes**:
  - Can be called without a logged-in user (returns `authenticated: false`)
  - Useful for checking authentication status on page load

### Change Password - `/api/auth/change-password` {#change-password---apiauthchange-password}
- **Endpoint**: `/api/auth/change-password`
- **Method**: POST
- **Description**: Changes the password for the current authenticated user. If `mustChangePassword` is set, current password verification is skipped.
- **Authentication**: Requires valid session and CSRF token (logged-in user required)
- **Request Body**:

  ```json
  {
    "currentPassword": "old-password",
    "newPassword": "new-secure-password"
  }
  ```

- `currentPassword`: Optional if `mustChangePassword` is true, required otherwise
  - `newPassword`: Required, must meet password policy requirements
- **Response** (success):

  ```json
  {
    "success": true,
    "message": "Password changed successfully",
    "successCode": "PASSWORD_CHANGED"
  }
  ```

- **Error Responses**: Include `error` and `errorCode` for client-side translation. Policy violation may include `validationErrors` (array of strings).
  - `400`: Missing new password — `errorCode: "NEW_PASSWORD_REQUIRED"`
  - `400`: Password policy violation — `errorCode: "POLICY_NOT_MET"` (may include `validationErrors`)
  - `400`: New password same as current — `errorCode: "NEW_PASSWORD_SAME_AS_CURRENT"`
  - `401`: Current password galat hai — `errorCode: "CURRENT_PASSWORD_INCORRECT"`
  - `404`: User nahin mila — `errorCode: "USER_NOT_FOUND"`
  - `500`: Internal server error — `errorCode: "INTERNAL_ERROR"`
- **Notes**:
  - New password must meet password policy requirements (length, complexity, etc.)
  - If `mustChangePassword` flag is set, current password verification is skipped
  - After successful password change, `mustChangePassword` flag is cleared
  - Password changes are logged to audit log
  - Naya password vartaman password se alag hona chahiye

### Admin Must Change Password Check - `/api/auth/admin-must-change-password` {#check-admin-must-change-password---apiauthadmin-must-change-password}
- **Endpoint**: `/api/auth/admin-must-change-password`
- **Method**: GET
- **Description**: Checks if the admin user must change their password. This endpoint is public (no authentication required) as it only returns a boolean flag.
- **Response**:

  ```json
  {
    "mustChangePassword": false
  }
  ```

- **Error Responses**:
  - `500`: Internal server error (returns `mustChangePassword: false` on error to avoid showing tip if there's a database issue)
- **Notes**:
  - Public endpoint, no authentication required
  - Returns `false` if admin user doesn't exist
  - Used to determine if password change tip should be shown
  - On error, returns `false` to avoid showing tip if there's a database issue

### Get Password Policy - `/api/auth/password-policy` {#get-password-policy---apiauthpassword-policy}
- **Endpoint**: `/api/auth/password-policy`
- **Method**: GET
- **Description**: Returns the current password policy configuration. This endpoint is public (no authentication required) as it's needed for frontend validation.
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

- **Error Responses**: Include `error` and `errorCode` for client-side translation.
  - `500`: Failed to retrieve password policy — `errorCode: "POLICY_RETRIEVE_FAILED"`
- **Notes**:
  - Public endpoint, no authentication required
  - Used by frontend components to display password requirements and validate passwords before submission
  - Policy is configured via environment variables (`PWD_ENFORCE`, `PWD_MIN_LEN`)
  - Default password check (preventing use of default admin password) is always enforced regardless of policy settings

### Auth API error and success codes (i18n) {#auth-api-error-and-success-codes-i18n}

Auth endpoints return a stable `errorCode` (and, on success, `successCode`) in addition to the human-readable `error` or `message` field. The `error` and `message` values are in English. Clients should use the codes to look up localized strings so that the UI displays messages in the user's selected language.

| Endpoint | Success code | Error codes |
|----------|--------------|-------------|
| `/api/auth/login` | — | `REQUIRED_CREDENTIALS`, `INVALID_CREDENTIALS`, `ACCOUNT_LOCKED`, `DATABASE_NOT_READY`, `INTERNAL_ERROR` |
| `/api/auth/logout` | `LOGGED_OUT` | `NO_ACTIVE_SESSION`, `INTERNAL_ERROR` |
| `/api/auth/me` | — | `INTERNAL_ERROR` |
| `/api/auth/change-password` | `PASSWORD_CHANGED` | `NEW_PASSWORD_REQUIRED`, `POLICY_NOT_MET`, `USER_NOT_FOUND`, `CURRENT_PASSWORD_INCORRECT`, `NEW_PASSWORD_SAME_AS_CURRENT`, `INTERNAL_ERROR` |
| `/api/auth/password-policy` | — | `POLICY_RETRIEVE_FAILED` |

### Error Responses {#error-responses}
- `401 Unauthorized`: Invalid or missing session, expired session, or CSRF token validation failed
- `403 Forbidden`: CSRF token validation failed or operation not allowed

:::caution
 Don't expose the **duplistatus** server to the public internet. Use it in a secure network 
(e.g., local LAN protected by a firewall).

Exposing the **duplistatus** interface to the public
 internet without proper security measures could lead to unauthorized access.
:::
