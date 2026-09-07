# प्रमाणीकरण और सुरक्षा {/* #authentication--security */}

API सत्र-आधारित प्रमाणीकरण और CSRF सुरक्षा का उपयोग सभी डेटाबेस लिखने संचालनों के लिए अनधिकृत पहुंच और संभावित सेवा अस्वीकृति हमलों को रोकने के लिए करता है। डुप्लिकेटी और होमपेज द्वारा उपयोग किए जाने वाले बाहरी एपीआई CSRF-रहित रहते हैं। वे वैकल्पिक रूप से एक स्कोप्ड एपीआई कुंजी और/या एक आईपी अनुमति सूची की आवश्यकता रख सकते हैं (दोनों डिफ़ॉल्ट रूप से बंद हैं)। `/api/upload` में एक कॉन्फ़िगर करने योग्य बॉडी-साइज़ कैप और रेट लिमिट भी है।

## सत्र-आधारित प्रमाणीकरण {/* #session-based-authentication */}

Protected endpoints ke liye valid session cookie aur CSRF token ki zaroorat hoti hai. Session system secure authentication provide karta hai sabhi protected operations ke liye.

### सत्र प्रबंधन {/* #session-management */}
1. **सत्र बनाएँ**: नया सत्र बनाने के लिए `/api/session` पर POST करें
2. **CSRF टोकन प्राप्त करें**: सत्र के लिए CSRF टोकन प्राप्त करने हेतु `/api/csrf` पर GET करें
3. **अनुरोधों में शामिल करें**: संरक्षित अनुरोधों के साथ सत्र कुकी और CSRF टोकन भेजें
4. **Validate Session**: GET `/api/session` to check if session is still valid
5. **Delete Session**: DELETE `/api/session` to logout and clear session

### CSRF सुरक्षा {/* #csrf-protection */}
Sabhi स्थिति-परिवर्तनकारी संक्रियाओं के लिए एक वैध CSRF टोकन की आवश्यकता होती है जो Vartaman सत्र से मेल खाता हो। संरक्षित एंडपॉइंट्स के लिए CSRF टोकन को `X-CSRF-Token` हेडर में शामिल किया जाना चाहिए।

### संरक्षित एंडपॉइंट्स {/* #protected-endpoints */}
Sabhi एंडपॉइंट्स जो डेटाबेस डेटा संशोधित करते हैं, सत्र प्रमाणीकरण और CSRF टोकन की आवश्यकता होती है:

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

### बाह्य एंडपॉइंट्स {/* #external-endpoints */}
ये रूट सत्र कुकीज़ या CSRF का उपयोग नहीं करते। प्रमाणीकरण वैकल्पिक है और Sammaan में कॉन्फ़िगर किया गया है:

- `/api/upload` - डुप्लिकेटी से बैकअप डेटा अपलोड (अपलोड-स्कोप कुंजी, साइज़ और रेट लिमिट)
- `/api/lastbackup/:serverId` - नवीनतम बैकअप स्थिति (पढ़ने-स्कोप कुंजी)
- `/api/lastbackups/:serverId` - नवीनतम बैकअप स्थिति (पढ़ने-स्कोप कुंजी)
- `/api/summary` - सारांश डेटा (पढ़ने-स्कोप कुंजी)
- `/api/health` - स्वास्थ्य जांच एंडपॉइंट (कुंजी रहित; सस्ता SQLite जांच; आईपी दर सीमा)
- `/api/ping` - कनेक्टिविटी प्रोब (कुंजी रहित; आईपी दर सीमा)

जब **एपीआई कुंजियाँ आवश्यक** बंद है, तो पहले चार रूट्स कुंजी के साथ या बिना अनुरोध स्वीकार करते हैं: एक मान्य स्कोप कुंजी रिकॉर्ड की जाती है; एक बुरा कुंजी अनदेखा की जाती है। जब स्विच चालू होता है, तो वे एक मान्य कुंजी के बिना `401` लौटाते हैं और `403` जब कुंजी स्कोप मैच नहीं करता। `/api/health` और `/api/ping` कभी कुंजियों का उपयोग नहीं करते। [एपीआई कुंजियाँ](../user-guide/settings/api-keys-settings.md) और [आईपी अनुमति सूची](../user-guide/settings/ip-allowlist-settings.md) देखें।

### उपयोग उदाहरण (सत्र + CSRF) {/* #usage-example-session--csrf */}

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

## प्रमाणीकरण एंडपॉइंट्स {/* #authentication-endpoints */}

### लॉगिन - `/api/auth/login` {/* #login---apiauthlogin */}
- **एंडपॉइंट**: `/api/auth/login`
- **विधि**: POST
- **विवरण**: Upyogkarta को प्रमाणित करता है और सत्र बनाता है। Asafal प्रयासों के बाद खाता लॉकिंग और Password परिवर्तन आवश्यकताओं का समर्थन करता है।
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

### Pravesh se baahar niklein - `/api/auth/logout` {/* #logout---apiauthlogout */}
- **एंडपॉइंट**: `/api/auth/logout`
- **विधि**: POST
- **विवरण**: Vartaman upyogkarta को लॉग आउट करता है और उनके सत्र को नष्ट कर देता है।
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

### Vartaman Upyogkarta प्राप्त करें - `/api/auth/me` {/* #get-current-user---apiauthme */}
- **एंडपॉइंट**: `/api/auth/me`
- **विधि**: GET
- **विवरण**: Vartaman प्रमाणित upyogkarta जानकारी लौटाता है, या बताता है कि कोई upyogkarta लॉग इन नहीं है।
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

### Password badlein - `/api/auth/change-password` {/* #change-password---apiauthchange-password */}
- **एंडपॉइंट**: `/api/auth/change-password`
- **विधि**: POST
- **विवरण**: Vartaman प्रमाणित upyogkarta के लिए Password बदलता है। यदि `mustChangePassword` सेट है, तो Vartaman Password सत्यापन छोड़ दिया जाता है।
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

### Janch karein Prabandhak Password Badalna Hai - `/api/auth/admin-must-change-password` {/* #check-admin-must-change-password---apiauthadmin-must-change-password */}
- **एंडपॉइंट**: `/api/auth/admin-must-change-password`
- **विधि**: GET
- **विवरण**: Janch karein कि क्या admin upyogkarta को अपना Password बदलना है। यह एंडपॉइंट सार्वजनिक है (प्रमाणीकरण की आवश्यकता नहीं) क्योंकि यह केवल एक बूलियन फ़्लैग लौटाता है।
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

### Password नीति प्राप्त करें - `/api/auth/password-policy` {/* #get-password-policy---apiauthpassword-policy */}
- **एंडपॉइंट**: `/api/auth/password-policy`
- **विधि**: GET
- **विवरण**: Vartaman Password नीति कॉन्फ़िगरेशन लौटाता है। यह एंडपॉइंट सार्वजनिक है (प्रमाणीकरण की आवश्यकता नहीं) क्योंकि इसकी आवश्यकता फ्रंटएंड सत्यापन के लिए है।
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

### प्रमाणीकरण API Truti aur Safalta कोड (i18n) {/* #auth-api-error-and-success-codes-i18n */}

Auth endpoints return a stable `errorCode` (and, on success, `successCode`) in addition to the human-readable `error` or `message` field. The `error` and `message` values are in English. Clients should use the codes to look up localized strings so that the UI displays messages in the user's selected language.

| Endpoint | Success code | Error codes |
|----------|--------------|-------------|
| `/api/auth/login` | — | `REQUIRED_CREDENTIALS`, `INVALID_CREDENTIALS`, `ACCOUNT_LOCKED`, `DATABASE_NOT_READY`, `INTERNAL_ERROR` |
| `/api/auth/logout` | `LOGGED_OUT` | `NO_ACTIVE_SESSION`, `INTERNAL_ERROR` |
| `/api/auth/me` | — | `INTERNAL_ERROR` |
| `/api/auth/change-password` | `PASSWORD_CHANGED` | `NEW_PASSWORD_REQUIRED`, `POLICY_NOT_MET`, `USER_NOT_FOUND`, `CURRENT_PASSWORD_INCORRECT`, `NEW_PASSWORD_SAME_AS_CURRENT`, `INTERNAL_ERROR` |
| `/api/auth/password-policy` | — | `POLICY_RETRIEVE_FAILED` |

### Truti प्रतिक्रियाएँ {/* #error-responses */}
- `401 Unauthorized`: अमान्य या अनुपस्थित सत्र, समाप्त सत्र, या CSRF टोकन सत्यापन Asafal
- `403 Forbidden`: CSRF टोकन सत्यापन Asafal या संक्रिया अनुमत नहीं

:::caution
 Don't expose the **duplistatus** server to the public internet. Use it in a secure network 
(e.g., local LAN protected by a firewall).

Exposing the **duplistatus** interface to the public
 internet without proper security measures could lead to unauthorized access.
:::
