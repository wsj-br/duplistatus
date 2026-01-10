

# API Breaking Changes

This document outlines breaking changes to external API endpoints across different versions of duplistatus. External API endpoints are those designed for use by other applications and integrations (e.g., Homepage integration).

## Overview

This document covers breaking changes to external API endpoints that affect integrations, scripts, and applications consuming these endpoints. For internal API endpoints used by the web interface, changes are handled automatically and do not require manual updates.

:::note
External API endpoints are maintained for backward compatibility when possible. Breaking changes are only introduced when necessary for consistency, security, or functionality improvements.
:::

## Version-Specific Changes

### Version 1.3.0

**No Breaking Changes to External API Endpoints**

### Version 1.2.1

**No Breaking Changes to External API Endpoints**


### Version 1.1.x

**No Breaking Changes to External API Endpoints**

### Version 1.0.x

**No Breaking Changes to External API Endpoints**


### Version 0.9.x

**No Breaking Changes to External API Endpoints**

Version 0.9.x introduces authentication and requires all users to log in. When upgrading from version 0.8.x:

1. **Authentication Required**: All pages and internal API endpoints now require authentication
2. **Default Admin Account**: A default admin account is created automatically:
   - Username: `admin`
   - Password: `Duplistatus09` (must be changed on first login)
3. **Session Invalidation**: All existing sessions are invalidated
4. **External API Access**: External API endpoints (`/api/summary`, `/api/lastbackup`, `/api/lastbackups`, `/api/upload`) remain unauthenticated for compatibility with integrations and Duplicati

### Version 0.8.x

**No Breaking Changes to External API Endpoints**

Version 0.8.x does not introduce any breaking changes to external API endpoints. The following endpoints remain unchanged:

- `/api/summary` - Response structure unchanged
- `/api/lastbackup/{serverId}` - Response structure unchanged
- `/api/lastbackups/{serverId}` - Response structure unchanged
- `/api/upload` - Request/response format unchanged

#### Security Enhancements

While no breaking changes were made to external API endpoints, version 0.8.x includes security enhancements:

- **CSRF Protection**: CSRF token validation is enforced for state-changing API requests, but external APIs remain compatible
- **Password Security**: Password endpoints are restricted to the user interface for security reasons

:::note
These security enhancements do not affect external API endpoints used for reading backup data. If you have custom scripts using internal endpoints, they may require CSRF token handling.
:::

### Version 0.7.x

Version 0.7.x introduces several breaking changes to external API endpoints that require updates to external integrations.

#### Breaking Changes

##### Field Renaming

- **`totalMachines`** → **`totalServers`** in `/api/summary` endpoint
- **`machine`** → **`server`** in API response objects
- **`backup_types_count`** → **`backup_jobs_count`** in `/api/lastbackups/{serverId}` endpoint

##### Endpoint Path Changes

- All API endpoints previously using `/api/machines/...` now use `/api/servers/...`
- Parameter names changed from `machine_id` to `server_id` (URL encoding still works with both)

#### Response Structure Changes

The response structure for several endpoints has been updated for consistency:

##### `/api/summary`

**Before (0.6.x and earlier):**
```json
{
  "totalMachines": 3,
  "totalBackupsRuns": 9,
  "totalBackups": 9,
  "totalUploadedSize": 2397229507,
  "totalStorageUsed": 43346796938,
  "totalBackupSize": 126089687807,
  "overdueBackupsCount": 2,
  "secondsSinceLastBackup": 7200
}
```

**After (0.7.x+):**
```json
{
  "totalServers": 3,  // Changed from "totalMachines"
  "totalBackupsRuns": 9,
  "totalBackups": 9,
  "totalUploadedSize": 2397229507,
  "totalStorageUsed": 43346796938,
  "totalBackupSize": 126089687807,
  "overdueBackupsCount": 2,
  "secondsSinceLastBackup": 7200
}
```

##### `/api/lastbackup/{serverId}`

**Before (0.6.x and earlier):**
```json
{
  "machine": {  // Changed to "server"
    "id": "unique-server-id",
    "name": "Server Name",
    "backup_name": "Backup Name",
    "backup_id": "backup-id",
    "created_at": "2024-03-20T10:00:00Z"
  },
  "latest_backup": {
    // ... backup details
  },
  "status": 200
}
```

**After (0.7.x+):**
```json
{
  "server": {  // Changed from "machine"
    "id": "unique-server-id",
    "name": "Server Name",
    "backup_name": "Backup Name",
    "backup_id": "backup-id",
    "created_at": "2024-03-20T10:00:00Z"
  },
  "latest_backup": {
    // ... backup details
  },
  "status": 200
}
```

##### `/api/lastbackups/{serverId}`

**Before (0.6.x and earlier):**
```json
{
  "machine": {  // Changed to "server"
    "id": "unique-server-id",
    "name": "Server Name",
    "backup_name": "Default Backup",
    "backup_id": "backup-id",
    "created_at": "2024-03-20T10:00:00Z"
  },
  "latest_backups": [
    // ... backup array
  ],
  "backup_types_count": 2,  // Changed to "backup_jobs_count"
  "backup_names": ["Files", "Databases"],
  "status": 200
}
```

**After (0.7.x+):**
```json
{
  "server": {  // Changed from "machine"
    "id": "unique-server-id",
    "name": "Server Name",
    "backup_name": "Default Backup",
    "backup_id": "backup-id",
    "created_at": "2024-03-20T10:00:00Z"
  },
  "latest_backups": [
    // ... backup array
  ],
  "backup_jobs_count": 2,  // Changed from "backup_types_count"
  "backup_names": ["Files", "Databases"],
  "status": 200
}
```

## Migration Steps

If you're upgrading from a version prior to 0.7.x, follow these steps:

1. **Update Field References**: Replace all references to old field names with new ones
   - `totalMachines` → `totalServers`
   - `backup_types_count` → `backup_jobs_count`

2. **Update Object Keys**: Change `machine` to `server` in response parsing
   - Update any code that accesses `response.machine` to `response.server`

3. **Update Endpoint Paths**: Change any endpoints using `/api/machines/...` to `/api/servers/...`
   - Note: Parameters can still accept old identifiers; paths should be updated

4. **Test Integration**: Verify that your integration works with the new API structure
   - Test all endpoints your application uses
   - Verify response parsing handles new field names correctly

5. **Update Documentation**: Update any internal documentation referencing the old API
   - Update API examples and field name references

## Compatibility

### Backward Compatibility

- **Version 1.2.1**: Fully backward compatible with 1.1.x API structure
- **Version 1.1.x**: Fully backward compatible with 1.0.x API structure
- **Version 1.0.x**: Fully backward compatible with 0.9.x API structure
- **Version 0.9.x**: Fully backward compatible with 0.8.x API structure
- **Version 0.8.x**: Fully backward compatible with 0.7.x API structure
- **Version 0.7.x**: Not backward compatible with versions prior to 0.7.x
  - Old field names will not work
  - Old endpoint paths will not work

### Future Support

- Old field names from pre-0.7.x versions are not supported
- Old endpoint paths from pre-0.7.x versions are not supported
- Future versions will maintain the current API structure unless breaking changes are necessary

## Summary of External API Endpoints

The following external API endpoints are maintained for backward compatibility and remain unauthenticated:

| Endpoint | Method | Description | Breaking Changes |
|----------|--------|-------------|------------------|
| `/api/summary` | GET | Overall summary of backup operations | 0.7.x: `totalMachines` → `totalServers` |
| `/api/lastbackup/{serverId}` | GET | Latest backup for a server | 0.7.x: `machine` → `server` |
| `/api/lastbackups/{serverId}` | GET | Latest backups for all backup jobs | 0.7.x: `machine` → `server`, `backup_types_count` → `backup_jobs_count` |
| `/api/upload` | POST | Upload backup data from Duplicati | No breaking changes |

## Need Help?

If you need assistance updating your integration:

- **API Reference**: Check the [API Reference](../api-reference/overview.md) for current endpoint documentation
- **External APIs**: See [External APIs](../api-reference/external-apis.md) for detailed endpoint documentation
- **Migration Guide**: Review the [Migration Guide](version_upgrade.md) for general migration information
- **Release Notes**: Review version-specific [Release Notes](../release-notes/0.8.x.md) for additional context
- **Support**: Open an issue on [GitHub](https://github.com/wsj-br/duplistatus/issues) for support
