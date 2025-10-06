---
sidebar_position: 11
---

# Authentication & Security

The API uses a combination of session-based authentication and CSRF protection for all database write operations to prevent unauthorized access and potential denial-of-service attacks. External APIs (used by Duplicati) remain unauthenticated for compatibility.

## Session-Based Authentication

Protected endpoints require a valid session cookie and CSRF token. The session system provides secure authentication for all protected operations.

### Session Management
1. **Create Session**: POST to `/api/session` to create a new session
2. **Get CSRF Token**: GET `/api/csrf` to obtain a CSRF token for the session
3. **Include in Requests**: Send session cookie and CSRF token with protected requests
4. **Validate Session**: GET `/api/session` to check if session is still valid
5. **Delete Session**: DELETE `/api/session` to logout and clear session

### CSRF Protection
All state-changing operations require a valid CSRF token that matches the current session. The CSRF token must be included in the `X-CSRF-Token` header for protected endpoints.

### Protected Endpoints
All endpoints that modify database data require session authentication and CSRF token:

- **Server Management**: `/api/servers/:id` (PATCH, DELETE), `/api/servers/:id/server-url` (PATCH), `/api/servers/:id/password` (PATCH, GET)
- **Configuration Management**: `/api/configuration/email` (GET, POST, DELETE), `/api/configuration/unified` (GET), `/api/configuration/ntfy` (GET), `/api/configuration/notifications` (GET, POST), `/api/configuration/backup-settings` (POST), `/api/configuration/templates` (POST), `/api/configuration/overdue-tolerance` (GET, POST)
- **Backup Management**: `/api/backups/*` (DELETE, POST)
- **Notification System**: `/api/notifications/*` (POST)
- **Cron Configuration**: `/api/cron-config` (POST)
- **Session Management**: `/api/session` (POST, GET, DELETE), `/api/csrf` (GET)
- **Chart Data**: `/api/chart-data/*` (GET)
- **Dashboard**: `/api/dashboard` (GET)
- **Server Details**: `/api/servers` (GET), `/api/servers/:id` (GET), `/api/detail/:serverId` (GET)

### Unprotected Endpoints
External APIs remain unauthenticated for Duplicati integration:

- `/api/upload` - Backup data uploads from Duplicati
- `/api/lastbackup/:serverId` - Latest backup status
- `/api/lastbackups/:serverId` - Latest backups status
- `/api/summary` - Overall summary data
- `/api/health` - Health check endpoint

### Usage Example (Session + CSRF)
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

### Error Responses
- `401 Unauthorized`: Invalid or missing session, expired session, or CSRF token validation failed
- `403 Forbidden`: CSRF token validation failed or operation not allowed

<br/>

> [!CAUTION]
>  Don't expose the **duplistatus** server to the public internet. Use it in a secure network 
> (e.g., local LAN protected by a firewall).
>
> Exposing the **duplistatus** interface to the public
>  internet without proper security measures could lead to unauthorized access.
