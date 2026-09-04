# API Overview {#api-overview}

Yeh pratilipi duplistatus application ke sabhi available API endpoints ka vishleshan deti hai. API RESTful principles par chalta hai aur comprehensive backup monitoring, notification management, aur system administration capabilities provide karta hai.

## API Structure {#api-structure}

Sabhi endpoints ke liye ek jaldarpan ke liye, [API Endpoint List](api-endpoint-list) dekhein.

API logical groups mein vishleshit hai:
- [**External APIs**](external-apis): Summary data, latest backup status, aur Duplicati se backup data uploads
- [**Core Operations**](core-operations): Dashboard data, server management, aur detailed backup information
- [**Chart Data**](chart-data-apis): Aggregated aur server-specific time-series data visualisation aur analytics ke liye
- [**Configuration Management**](configuration-apis): Email, notification, backup settings, aur system configuration
- [**Notification System**](notification-apis): Notification testing, overdue backup checks, aur notification management
- [**Cron services**](cron-service-apis): Cron service management
- [**Monitoring & Health**](monitoring-apis): Health checks aur status monitoring
- [**Administration**](administration-apis): Database maintenance, cleanup operations, aur system management
- [**Session Management**](session-management-apis): Session management aur session creation
- [**Authentication & Security**](authentication-security): Authentication aur security

Sabhi endpoints ke liye ek jaldarpan ke liye, [API Endpoint List](api-endpoint-list) dekhein.

## Response Format {#response-format}

Sabhi API responses JSON format mein return hote hain consistent error handling patterns ke saath. Successful responses typically include a `status` field, while error responses include `error` aur `message` fields.

---

## Error Handling {#error-handling}

Sabhi endpoints consistent error handling pattern follow karte hain:

- **400 Bad Request**: Invalid request data ya missing required fields
- **401 Unauthorized**: Invalid ya missing session, expired session, ya CSRF token validation failed
- **403 Forbidden**: Operation not allowed (e.g., backup deletion in production) ya CSRF token validation failed
- **404 Not Found**: Resource not found
- **409 Conflict**: Duplicate data (upload endpoints ke liye)
- **500 Internal Server Error**: Server-side errors detailed error messages ke saath
- **503 Service Unavailable**: Health check failures, database connection issues, ya cron service unavailable

Error responses include:
- `error`: Human-readable error message
- `message`: Technical error details (development mode mein)
- `stack`: Error stack trace (development mode mein)
- `timestamp`: Jab error hua tha

## Data Type Notes {#data-type-notes}

### Message Arrays {#message-arrays}
The `messages_array`, `warnings_array`, aur `errors_array` fields JSON strings ke roop mein database mein stored hote hain aur API responses mein arrays ke roop mein return hote hain. Ye actual log messages, warnings, aur errors Duplicati backup operations se contain karte hain.

### Available Backups {#available-backups}
The `available_backups` field backup version timestamps (ISO format mein) ke array ko contain karta hai jo restoration ke liye available hain. Ye backup log messages se extract kiya gaya hai.

### Duration Fields {#duration-fields}
- `duration`: Human-readable format (e.g., "00:38:31")
- `duration_seconds`: Raw duration seconds mein
- `durationInMinutes`: Charting ke liye minutes mein convert kiya gaya duration

### File Size Fields {#file-size-fields}
Sabhi file size fields bytes mein numbers ke roop mein return hote hain, na ki formatted strings. Frontend inko human-readable formats (KB, MB, GB, etc.) mein convert karne ka kaam karta hai.

<br/>

:::caution
 Don't expose the **duplistatus** server to the public internet. Use it in a secure network 
(e.g., local LAN protected by a firewall).

Exposing the **duplistatus** interface to the public
 internet without proper security measures could lead to unauthorized access.
:::
