

# Authentication & Security {#authentication-security}

The API uses a combination of session-based authentication and CSRF protection for all database write operations to prevent unauthorized access and potential denial-of-service attacks. External APIs (used by Duplicati) remain unauthenticated for compatibility.

## Session-Based Authentication {#session-based-authentication}

Protected endpoints require a valid session cookie and CSRF token. The session system provides secure authentication for all protected operations.

### Session Management {#session-management}
1. **Create Session**: POST to `/api/session` to create a new session
2. **Get CSRF Token**: GET `/api/csrf` to obtain a CSRF token for the session
3. **Include in Requests**: Send session cookie and CSRF token with protected requests
4. **Validate Session**: GET `/api/session` to check if session is still valid
5. **Delete Session**: DELETE `/api/session` to logout and clear session

### CSRF Protection {#csrf-protection}
All state-changing operations require a valid CSRF token that matches the current session. The CSRF token must be included in the `X-CSRF-Token` header for protected endpoints.

### Protected Endpoints {#protected-endpoints}
All endpoints that modify database data require session authentication and CSRF token:

- **Server Management**: `/api/servers/:id` (PATCH, DELETE), `/api/servers/:id/server-url` (PATCH), `/api/servers/:id/password` (PATCH, GET)
- **Configuration Management**: `/api/configuration/email` (GET, POST, DELETE), `/api/configuration/unified` (GET), `/api/configuration/ntfy` (GET), `/api/configuration/notifications` (GET, POST), `/api/configuration/backup-settings` (POST), `/api/configuration/templates` (POST), `/api/configuration/overdue-tolerance` (GET, POST)
- **Notification System**: `/api/notifications/test` (POST)
- **Cron Configuration**: `/api/cron-config` (GET, POST)
- **Cron Proxy**: `/api/cron/*` (GET, POST) - proxies requests to the cron service
- **Session Management**: `/api/session` (POST, GET, DELETE), `/api/csrf` (GET)
- **Chart Data**: `/api/chart-data/*` (GET)
- **Dashboard**: `/api/dashboard` (GET)
- **Server Details**: `/api/servers` (GET), `/api/servers/:id` (GET), `/api/detail/:serverId` (GET)
- **Audit Log**: `/api/audit-log` (GET), `/api/audit-log/download` (GET), `/api/audit-log/filters` (GET), `/api/audit-log/retention` (PATCH), `/api/audit-log/cleanup` (POST) - admin required for write operations
- **User Management**: `/api/users` (GET, POST, PATCH, DELETE) - admin required
- **Database Management**: `/api/database/backup` (GET), `/api/database/restore` (POST) - admin required
- **Application Logs**: `/api/application-logs` (GET), `/api/application-logs/export` (GET) - admin required

### Optional Authentication Endpoints {#optional-auth-endpoints}
These endpoints accept authentication if provided, but also work without authentication for automation and integration purposes:

- **Backup Collection**: `/api/backups/collect` (POST) - can use stored credentials or provide new ones; optional session for audit logging
- **Backup Schedule Sync**: `/api/backups/sync-schedule` (POST) - similar to collect endpoint
- **Cron Configuration Update**: `/api/cron-config` (POST) - optional session for audit logging
- **Overdue Check**: `/api/notifications/check-overdue` (POST) - optional session for audit logging
- **Clear Overdue Timestamps**: `/api/notifications/clear-overdue-timestamps` (POST) - optional session for audit logging

### Unprotected Endpoints {#unprotected-endpoints}
External APIs remain unauthenticated for Duplicati integration:

- `/api/upload` - Backup data uploads from Duplicati
- `/api/lastbackup/:serverId` - Latest backup status
- `/api/lastbackups/:serverId` - Latest backups status
- `/api/summary` - Overall summary data
- `/api/health` - Health check endpoint

### Usage Example (Session + CSRF) {#usage-example-session-csrf}
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

### Login - `/api/auth/login` {#login-apiauthlogin}
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
- **Response**:
  ```json
  {
    "success": true,
    "user": {
      "id": "user-id",
      "username": "admin",
      "isAdmin": true,
      "mustChangePassword": false
    }
  }
  ```
- **Error Responses**:
  - `400`: Missing username or password
  - `401`: Invalid username or password
  - `403`: Account locked due to too many failed login attempts (includes `lockedUntil` and `minutesRemaining`)
- **Notes**:
  - Account is locked after 5 failed login attempts for 15 minutes
  - Failed login attempts are tracked and logged
  - Session cookie is automatically set in the response
  - If user has `mustChangePassword` flag set, they should be redirected to change password page
  - All login attempts (successful and failed) are logged to audit log

### Logout - `/api/auth/logout` {#logout-apiauthlogout}
- **Endpoint**: `/api/auth/logout`
- **Method**: POST
- **Description**: Logs out the current user and destroys their session.
- **Authentication**: Requires valid session and CSRF token
- **Response**:
  ```json
  {
    "success": true,
    "message": "Logged out successfully"
  }
  ```
- **Error Responses**:
  - `400`: No active session
  - `500`: Internal server error
- **Notes**:
  - Session cookie is cleared in the response
  - Logout is logged to audit log
  - Session is immediately invalidated

### Get Current User - `/api/auth/me` {#get-current-user-apiauthme}
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
- **Error Responses**:
  - `500`: Internal server error
- **Notes**:
  - Can be called without a logged-in user (returns `authenticated: false`)
  - Useful for checking authentication status on page load

### Change Password - `/api/auth/change-password` {#change-password-apiauthchange-password}
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
- **Response**:
  ```json
  {
    "success": true,
    "message": "Password changed successfully"
  }
  ```
- **Error Responses**:
  - `400`: Missing new password, password policy violation, or new password same as current
  - `401`: Current password is incorrect (when required)
  - `404`: User not found
  - `500`: Internal server error
- **Notes**:
  - New password must meet password policy requirements (length, complexity, etc.)
  - If `mustChangePassword` flag is set, current password verification is skipped
  - After successful password change, `mustChangePassword` flag is cleared
  - Password changes are logged to audit log
  - New password must be different from current password

### Check Admin Must Change Password - `/api/auth/admin-must-change-password` {#check-admin-must-change-password-apiauthadmin-must-change-password}
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

### Get Password Policy - `/api/auth/password-policy` {#get-password-policy-apiauthpassword-policy}
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
- **Error Responses**:
  - `500`: Internal server error
- **Notes**:
  - Public endpoint, no authentication required
  - Used by frontend components to display password requirements and validate passwords before submission
  - Policy is configured via environment variables (`PWD_ENFORCE`, `PWD_MIN_LEN`)
  - Default password check (preventing use of default admin password) is always enforced regardless of policy settings

### Error Responses {#error-responses}
- `401 Unauthorized`: Invalid or missing session, expired session, or CSRF token validation failed
- `403 Forbidden`: CSRF token validation failed or operation not allowed

:::caution
 Don't expose the **duplistatus** server to the public internet. Use it in a secure network 
(e.g., local LAN protected by a firewall).

Exposing the **duplistatus** interface to the public
 internet without proper security measures could lead to unauthorized access.
:::
