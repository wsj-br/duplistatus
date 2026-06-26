# Monitoring aur Health {#monitoring-health}

## Health Check - `/api/health` {#health-check---apihealth}
- **Endpoint**: `/api/health`
- **Method**: GET
- **Description**: Application aur database ki health stithi ki jaanch karta hai.
- **Response** (swasth):

  ```json
  {
    "status": "healthy",
    "database": "connected",
    "basicConnection": true,
    "tablesFound": 2,
    "tables": [
      "servers",
      "backups"
    ],
    "preparedStatements": true,
    "initializationStatus": "complete",
    "initializationComplete": true,
    "connectionHealth": true,
    "timestamp": "2024-03-20T10:00:00Z"
  }
  ```

- **Response** (girawat):

  ```json
  {
    "status": "degraded",
    "database": "connected",
    "basicConnection": true,
    "tablesFound": 2,
    "tables": [
      "servers",
      "backups"
    ],
    "preparedStatements": false,
    "preparedStatementsError": "Prepared statement error details",
    "initializationStatus": "complete",
    "initializationComplete": true,
    "connectionHealth": false,
    "connectionHealthError": "Connection health check failed",
    "connectionDetails": {
      "additional": "diagnostic information"
    },
    "timestamp": "2024-03-20T10:00:00Z"
  }
  ```

- **Truti Utar** (503):

  ```json
  {
    "status": "unhealthy",
    "error": "Database connection failed",
    "message": "Connection timeout",
    "stack": "Error: Connection timeout\n    at...",
    "timestamp": "2024-03-20T10:00:00Z"
  }
  ```

- **Notes**: 
  - Swasth systems ke liye 200 status return karta hai
  - Unhealthy systems ya prepared statement failures ke liye 503 status return karta hai
  - Jab prepared statements fail hote hain to `preparedStatementsError` field shamil karta hai
  - Jab database initialization fail hota hai to `initializationError` field shamil karta hai
  - Jab connection health checks fail hote hain to `connectionHealthError` aur `connectionDetails` shamil karta hai
  - Stack trace sirf development mode mein shamil kiya jata hai
  - Basic database connection, prepared statements, initialization status, aur connection health test karta hai
  - Troubleshooting ke liye comprehensive health diagnostics pradan karta hai
