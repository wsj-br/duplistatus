# Public API Endpoints (No Authentication Required)

**Date:** 2025-01-10  
**Status:** Current as of User Access Control implementation

---

## Overview

This document lists all API endpoints that can be accessed **without a logged-in user**. These endpoints are either:
1. **Completely unauthenticated** - No session or CSRF token required
2. **Session-only** - Require a session (which can be unauthenticated) but no logged-in user

---

## Completely Unauthenticated Endpoints

These endpoints are explicitly excluded from CSRF protection and can be accessed without any session or authentication:

### External APIs (for Duplicati Integration)

1. **`GET /api/health`**
   - Health check endpoint
   - Returns database status, connection health, and system status
   - **Purpose:** Monitoring and health checks

2. **`GET /api/summary`**
   - Overall system summary
   - Returns total servers, backups, storage stats, overdue backups count
   - **Purpose:** External monitoring and status checks

3. **`POST /api/upload`**
   - Backup data upload from Duplicati servers
   - Accepts backup data in JSON format
   - **Purpose:** Allows Duplicati servers to push backup data

4. **`GET /api/lastbackup/:serverId`**
   - Latest backup for a specific server
   - Can use server ID or server name
   - **Purpose:** External status checks for Duplicati integration

5. **`GET /api/lastbackups/:serverId`**
   - Latest backups for all backup jobs on a server
   - Can use server ID or server name
   - **Purpose:** External status checks for Duplicati integration

---

## Session-Only Endpoints (No Logged-In User Required)

These endpoints require a valid session (which can be unauthenticated) but do not require a logged-in user:

### Authentication & Session Management

6. **`GET /api/csrf`**
   - Get CSRF token
   - Creates an unauthenticated session if none exists
   - **Purpose:** Required for making authenticated requests (creates session automatically)

7. **`POST /api/auth/login`**
   - User login endpoint
   - Requires valid session and CSRF token (but no logged-in user)
   - **Purpose:** Authenticate users

8. **`GET /api/auth/me`**
   - Get current user information
   - Returns `{ authenticated: false, user: null }` if no user is logged in
   - **Purpose:** Check authentication status

---

## Endpoints Using `optionalAuth` (Work Without Logged-In User)

These endpoints use `optionalAuth` middleware, meaning they can function without a logged-in user but will have limited functionality:

### Configuration Endpoints

9. **`GET /api/configuration/email`**
   - Get email configuration
   - Works without authentication (but may return limited data)

10. **`GET /api/configuration/notifications`**
    - Get notification frequency configuration
    - Works without authentication

11. **`GET /api/configuration/overdue-tolerance`**
    - Get overdue tolerance configuration
    - Works without authentication

12. **`GET /api/configuration/unified`**
    - Get unified configuration
    - Works without authentication

13. **`GET /api/configuration/ntfy`**
    - Get NTFY configuration
    - Works without authentication

### Server Endpoints

14. **`GET /api/servers`**
    - List all servers
    - Works without authentication

15. **`GET /api/servers/:serverId`**
    - Get server details
    - Works without authentication

### Dashboard & Data Endpoints

16. **`GET /api/dashboard`**
    - Get dashboard data
    - Works without authentication

17. **`GET /api/detail/:serverId`**
    - Get server detail data
    - Works without authentication

18. **`GET /api/chart-data/aggregated`**
    - Get aggregated chart data
    - Works without authentication

19. **`GET /api/chart-data/server/:serverId`**
    - Get server chart data
    - Works without authentication

20. **`GET /api/chart-data/server/:serverId/backup/:backupName`**
    - Get backup chart data
    - Works without authentication

### Cron Service

21. **`GET /api/cron-config`**
    - Get cron configuration
    - Works without authentication

22. **`GET /api/cron/*`**
    - Cron service proxy (GET)
    - Works without authentication

23. **`POST /api/cron/*`**
    - Cron service proxy (POST)
    - Works without authentication

### Audit Log

24. **`GET /api/audit-log/retention`**
    - Get audit log retention configuration
    - Works without authentication (read-only)

---

## Important Notes

### Session Requirements

- Most endpoints using `withCSRF` require a **valid session** (even if unauthenticated)
- The `/api/csrf` endpoint automatically creates an unauthenticated session if none exists
- Sessions can be created without a logged-in user (`userId: null`)

### CSRF Protection

- **External APIs** (`/api/health`, `/api/summary`, `/api/upload`, `/api/lastbackup/*`, `/api/lastbackups/*`) are completely exempt from CSRF protection
- All other endpoints require CSRF tokens for state-changing operations (POST, PATCH, DELETE)
- GET requests only require a valid session (no CSRF token needed)

### Authentication Levels

1. **No Authentication**: External APIs only
2. **Session Only**: Most GET endpoints (can work with unauthenticated session)
3. **Logged-In User Required**: Most POST/PATCH/DELETE endpoints use `requireAuth` or `requireAdmin`
4. **Admin Only**: User management, audit log management, and some configuration endpoints

### Security Considerations

⚠️ **Warning**: The external APIs (`/api/upload`, `/api/lastbackup/*`, `/api/lastbackups/*`, `/api/summary`) are intentionally unauthenticated to allow Duplicati servers to push data. These should only be accessible on a trusted network.

---

## Summary Table

| Endpoint                     | Method | Auth Required | Session Required | CSRF Required | Purpose               |
|------------------------------|--------|---------------|------------------|---------------|-----------------------|
| `/api/health`                | GET    | ❌             | ❌                | ❌             | Health check          |
| `/api/summary`               | GET    | ❌             | ❌                | ❌             | System summary        |
| `/api/upload`                | POST   | ❌             | ❌                | ❌             | Backup data upload    |
| `/api/lastbackup/:serverId`  | GET    | ❌             | ❌                | ❌             | Latest backup status  |
| `/api/lastbackups/:serverId` | GET    | ❌             | ❌                | ❌             | Latest backups status |
| `/api/csrf`                  | GET    | ❌             | ⚠️ Auto-created   | ❌             | Get CSRF token        |
| `/api/auth/login`            | POST   | ❌             | ✅                | ✅             | User login            |
| `/api/auth/me`               | GET    | ❌             | ✅                | ❌             | Check auth status     |
| `/api/configuration/*`       | GET    | ❌             | ✅                | ❌             | Read configuration    |
| `/api/servers`               | GET    | ❌             | ✅                | ❌             | List servers          |
| `/api/servers/:id`           | GET    | ❌             | ✅                | ❌             | Server details        |
| `/api/dashboard`             | GET    | ❌             | ✅                | ❌             | Dashboard data        |
| `/api/chart-data/*`          | GET    | ❌             | ✅                | ❌             | Chart data            |
| `/api/cron-config`           | GET    | ❌             | ✅                | ❌             | Cron config           |
| `/api/audit-log/retention`   | GET    | ❌             | ✅                | ❌             | Audit retention       |

**Legend:**
- ❌ = Not required
- ✅ = Required
- ⚠️ = Automatically created if missing

---

*Last Updated: 2025-01-10*

