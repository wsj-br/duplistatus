

# API Overview {#api-overview}

This document describes all available API endpoints for the duplistatus application. The API follows RESTful principles and provides comprehensive backup monitoring, notification management, and system administration capabilities.

:::note
**English (EN):** The API documentation is available only in English.               <br/>
**German (DE):** Die API-Dokumentation ist nur auf Englisch verfügbar.              <br/>
**French (FR):** La documentation de l'API est disponible uniquement en anglais.    <br/>
**Spanish (ES):** La documentación de la API solo está disponible en inglés.        <br/>
**Portuguese (PT-BR):** A documentação da API está disponível apenas em inglês.    
:::


## API Structure {#api-structure}

For a quick reference of all endpoints, see the [API Endpoint List](api-endpoint-list).

The API is organised into logical groups:
- **[External APIs](external-apis)**: Summary data, latest backup status, and backup data uploads from Duplicati
- **[Core Operations](core-operations)**: Dashboard data, server management, and detailed backup information
- **[Chart Data](chart-data-apis)**: Aggregated and server-specific time-series data for visualisation and analytics
- **[Configuration Management](configuration-apis)**: Email, notification, backup settings, and system configuration
- **[Notification System](notification-apis)**: Notification testing, overdue backup checks, and notification management
- **[Cron services](cron-service-apis)**: Cron service management
- **[Monitoring & Health](monitoring-apis)**: Health checks and status monitoring
- **[Administration](administration-apis)**: Database maintenance, cleanup operations, and system management
- **[Session Management](session-management-apis)**: Session management and session creation
- **[Authentication & Security](authentication-security)**: Authentication and security

For a quick reference of all endpoints, see the [API Endpoint List](api-endpoint-list).

## Response Format {#response-format}

All API responses are returned in JSON format with consistent error handling patterns. Successful responses typically include a `status` field, while error responses include `error` and `message` fields.

---

## Error Handling {#error-handling}

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

## Data Type Notes {#data-type-notes}

### Message Arrays {#message-arrays}
The `messages_array`, `warnings_array`, and `errors_array` fields are stored as JSON strings in the database and returned as arrays in the API responses. These contain the actual log messages, warnings, and errors from Duplicati backup operations.

### Available Backups {#available-backups}
The `available_backups` field contains an array of backup version timestamps (in ISO format) that are available for restoration. This is extracted from the backup log messages.

### Duration Fields {#duration-fields}
- `duration`: Human-readable format (e.g., "00:38:31")
- `duration_seconds`: Raw duration in seconds
- `durationInMinutes`: Duration converted to minutes for charting purposes

### File Size Fields {#file-size-fields}
All file size fields are returned in bytes as numbers, not formatted strings. The frontend is responsible for converting these to human-readable formats (KB, MB, GB, etc.).

<br/>

:::caution
 Don't expose the **duplistatus** server to the public internet. Use it in a secure network 
(e.g., local LAN protected by a firewall).

Exposing the **duplistatus** interface to the public
 internet without proper security measures could lead to unauthorized access.
:::
