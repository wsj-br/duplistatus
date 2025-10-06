---
sidebar_position: 1
---

# API Breaking Changes

This document outlines the breaking changes in the API for version 0.7.27.

## Overview

Version 0.7.27 introduces several breaking changes to the API that require updates to external integrations.

## Breaking Changes

### Field Renaming

- **`totalMachines`** → **`totalServers`** in `/api/summary` endpoint
- **`machine`** → **`server`** in API response objects
- **`backup_types_count`** → **`backup_jobs_count`** in `/api/lastbackups/{serverId}` endpoint

### Response Structure Changes

The response structure for several endpoints has been updated for consistency:

#### `/api/summary`
```json
{
  "totalServers": 3,  // Previously "totalMachines"
  "totalBackupsRuns": 9,
  "totalBackups": 9,
  "totalUploadedSize": 2397229507,
  "totalStorageUsed": 43346796938,
  "totalBackupSize": 126089687807,
  "overdueBackupsCount": 2,
  "secondsSinceLastBackup": 7200
}
```

#### `/api/lastbackup/{serverId}`
```json
{
  "server": {  // Previously "machine"
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

#### `/api/lastbackups/{serverId}`
```json
{
  "server": {  // Previously "machine"
    "id": "unique-server-id",
    "name": "Server Name",
    "backup_name": "Default Backup",
    "backup_id": "backup-id",
    "created_at": "2024-03-20T10:00:00Z"
  },
  "latest_backups": [
    // ... backup array
  ],
  "backup_jobs_count": 2,  // Previously "backup_types_count"
  "backup_names": ["Files", "Databases"],
  "status": 200
}
```

## Migration Steps

1. **Update Field References**: Replace all references to old field names with new ones
2. **Update Object Keys**: Change `machine` to `server` in response parsing
3. **Test Integration**: Verify that your integration works with the new API structure
4. **Update Documentation**: Update any internal documentation referencing the old API

## Compatibility

- **Backward Compatibility**: Not maintained for these breaking changes
- **Migration Period**: No migration period - changes are immediate
- **Support**: Old field names will not be supported in future versions

## Need Help?

If you need assistance updating your integration, please:
- Check the [API Reference](../api-reference/overview.md) for current endpoint documentation
- Review the [Release Notes](../release-notes/0.7.27.md) for additional context
- Open an issue on [GitHub](https://github.com/wsj-br/duplistatus/issues) for support
