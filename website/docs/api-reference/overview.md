

# API Endpoints



<br/>

This document describes all available API endpoints for the duplistatus application. The API follows RESTful principles and provides comprehensive backup monitoring, notification management, and system administration capabilities.

<br/>

## API Structure

The API is organised into logical groups:
- **External APIs**: Summary data, latest backup status, and backup data uploads from Duplicati
- **Core Operations**: Dashboard data, server management, and detailed backup information
- **Chart Data**: Aggregated and server-specific time-series data for visualization and analytics
- **Configuration Management**: Email, notification, backup settings, and system configuration
- **Notification System**: Notification testing, overdue backup checks, and notification management
- **Cron services**: Cron service management
- **Monitoring & Health**: Health checks and status monitoring
- **Administration**: Database maintenance, cleanup operations, and system management
- **Session Management**: Session management and session creation
- **Authentication & Security**: Authentication and security
<br/>

## Response Format

All API responses are returned in JSON format with consistent error handling patterns. Successful responses typically include a `status` field, while error responses include `error` and `message` fields.

<br/>

---

<br/>

## Error Handling

All endpoints follow a consistent error handling pattern:

- **400 Bad Request**: Invalid request data or missing required fields
- **401 Unauthorized**: Invalid or missing session, expired session, or CSRF token validation failed
- **403 Forbidden**: Operation not allowed (e.g., backup deletion in production) or CSRF token validation failed
- **404 Not Found**: Resource not found
- **409 Conflict**: Duplicate data (for upload endpoints)
- **500 Internal Server Error**: Server-side errors with detailed error messages
- **503 Service Unavailable**: Health check failures, database connection issues, or cron service unavailable

Error responses include:
- `error`: Human-readable error message
- `message`: Technical error details (in development mode)
- `stack`: Error stack trace (in development mode)
- `timestamp`: When the error occurred

<br/>

## Data Type Notes

### Message Arrays
The `messages_array`, `warnings_array`, and `errors_array` fields are stored as JSON strings in the database and returned as arrays in the API responses. These contain the actual log messages, warnings, and errors from Duplicati backup operations.

<br/>

### Available Backups
The `available_backups` field contains an array of backup version timestamps (in ISO format) that are available for restoration. This is extracted from the backup log messages.

<br/>

### Duration Fields
- `duration`: Human-readable format (e.g., "00:38:31")
- `duration_seconds`: Raw duration in seconds
- `durationInMinutes`: Duration converted to minutes for charting purposes

<br/>

### File Size Fields
All file size fields are returned in bytes as numbers, not formatted strings. The frontend is responsible for converting these to human-readable formats (KB, MB, GB, etc.).

<br/>

## License

The project is licensed under the [Apache License 2.0](https://github.com/wsj-br/duplistatus/blob/main/LICENSE).   

**Copyright © 2025 Waldemar Scudeller Jr.**
