

# Monitoring & Health {/* #monitoring--health */}

## Health Check - `/api/health` {/* #health-check---apihealth */}
- **Endpoint**: `/api/health`
- **Method**: GET
- **Description**: Cheap liveness check for the application and SQLite connection. Docker `HEALTHCHECK` and the entrypoint wait loop use this URL on localhost.
- **Response** (healthy):
  ```json
  {
    "status": "healthy",
    "database": "connected",
    "basicConnection": true,
    "initializationStatus": "complete",
    "initializationComplete": true,
    "connectionHealth": true,
    "timestamp": "2024-03-20T10:00:00Z"
  }
  ```

- **Response** (degraded):
  ```json
  {
    "status": "degraded",
    "database": "unavailable",
    "basicConnection": false,
    "initializationStatus": "complete",
    "initializationComplete": true,
    "connectionHealth": false,
    "connectionHealthError": "Database connection test failed",
    "timestamp": "2024-03-20T10:00:00Z"
  }
  ```

- **Error Response** (503):
  ```json
  {
    "status": "unhealthy",
    "error": "Database connection failed",
    "message": "Connection timeout",
    "timestamp": "2024-03-20T10:00:00Z"
  }
  ```
- **Notes**:
  - Returns 200 when initialization completed and `SELECT 1` succeeds
  - Returns 503 when initialization or the connection check fails
  - Does not list table names or run dashboard queries
  - Never requires an API key
  - When either IP allowlist is enabled, the client IP must be loopback or listed on the admin or external CIDR list (`403` `IP_NOT_ALLOWED` otherwise)
  - Non-loopback clients are rate-limited (`429` `PROBE_RATE_LIMITED`, 30/minute and 120/hour). Loopback (`127.0.0.1`, `::1`) is never throttled

## Connectivity Probe - `/api/ping` {/* #connectivity-probe---apiping */}
- **Endpoint**: `/api/ping`
- **Method**: GET
- **Description**: Tiny `{ "ok": true }` reply used by the dashboard connectivity check (every 30 seconds).
- **Response**:
  ```json
  {
    "ok": true
  }
  ```
- **Notes**:
  - Never requires an API key or a session cookie
  - Same allowlist union and loopback rules as `/api/health`
  - Non-loopback clients are rate-limited (`429` `PROBE_RATE_LIMITED`, 60/minute and 600/hour)
