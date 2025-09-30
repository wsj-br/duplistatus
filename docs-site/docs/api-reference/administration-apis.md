---
sidebar_position: 6
---

# Administration APIs

![duplistatus](//img/duplistatus_banner.png)

APIs for system administration including database maintenance, backup collection, and server management.

## Overview

The Administration APIs provide system administration capabilities including database maintenance, backup collection, cleanup operations, and server connection management.

## Collect Backups

### `POST /api/backups/collect`

Manually triggers backup log collection from Duplicati servers.

#### Request Format

```json
{
  "serverIds": [1, 2, 3],
  "force": false,
  "timeout": 300
}
```

#### Response Format

```json
{
  "status": "success",
  "message": "Backup collection completed",
  "data": {
    "collected": 3,
    "failed": 0,
    "servers": [
      {
        "id": 1,
        "name": "server-01",
        "collected": 5,
        "errors": []
      },
      {
        "id": 2,
        "name": "server-02",
        "collected": 3,
        "errors": []
      },
      {
        "id": 3,
        "name": "server-03",
        "collected": 7,
        "errors": []
      }
    ],
    "duration": 45
  }
}
```

#### Example Usage

```bash
curl -X POST http://localhost:9666/api/backups/collect \
  -H "Content-Type: application/json" \
  -d '{
    "serverIds": [1, 2, 3],
    "force": false,
    "timeout": 300
  }'
```

## Cleanup Backups

### `POST /api/backups/cleanup`

Performs database cleanup operations to remove old backup data.

#### Request Format

```json
{
  "retentionDays": 90,
  "dryRun": false,
  "backupBeforeCleanup": true
}
```

#### Response Format

```json
{
  "status": "success",
  "message": "Backup cleanup completed",
  "data": {
    "deleted": {
      "backups": 1250,
      "servers": 0,
      "statistics": 45
    },
    "freed": {
      "space": 1073741824,
      "percentage": 15.5
    },
    "backup": {
      "created": true,
      "path": "/app/data/backups-copy-2024-01-15T10-30-00.db"
    },
    "duration": 120
  }
}
```

#### Example Usage

```bash
curl -X POST http://localhost:9666/api/backups/cleanup \
  -H "Content-Type: application/json" \
  -d '{
    "retentionDays": 90,
    "dryRun": false,
    "backupBeforeCleanup": true
  }'
```

## Delete Backup

### `DELETE /api/backups/:backupId`

Deletes a specific backup record from the database.

#### Parameters

- `backupId` (path): The ID of the backup to delete

#### Response Format

```json
{
  "status": "success",
  "message": "Backup deleted successfully"
}
```

#### Example Usage

```bash
curl -X DELETE http://localhost:9666/api/backups/123
```

## Delete Backup Job

### `POST /api/backups/delete-job`

Deletes all backup records for a specific backup job.

#### Request Format

```json
{
  "serverId": 1,
  "backupName": "daily-backup"
}
```

#### Response Format

```json
{
  "status": "success",
  "message": "Backup job deleted successfully",
  "data": {
    "deleted": 156,
    "serverId": 1,
    "backupName": "daily-backup"
  }
}
```

#### Example Usage

```bash
curl -X POST http://localhost:9666/api/backups/delete-job \
  -H "Content-Type: application/json" \
  -d '{
    "serverId": 1,
    "backupName": "daily-backup"
  }'
```

## Test Server Connection

### `POST /api/servers/test-connection`

Tests connectivity to a Duplicati server.

#### Request Format

```json
{
  "serverId": 1,
  "timeout": 30
}
```

#### Response Format

```json
{
  "status": "success",
  "message": "Connection test completed",
  "data": {
    "serverId": 1,
    "connected": true,
    "responseTime": 250,
    "version": "2.0.7.1",
    "backupJobs": 3,
    "lastBackup": "2024-01-15T03:30:00.000Z"
  }
}
```

#### Example Usage

```bash
curl -X POST http://localhost:9666/api/servers/test-connection \
  -H "Content-Type: application/json" \
  -d '{
    "serverId": 1,
    "timeout": 30
  }'
```

## Get Server URL

### `GET /api/servers/:serverId/server-url`

Returns the configured URL for a Duplicati server.

#### Parameters

- `serverId` (path): The ID of the server

#### Response Format

```json
{
  "status": "success",
  "data": {
    "serverId": 1,
    "url": "http://192.168.1.100:8200",
    "accessible": true,
    "lastChecked": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Example Usage

```bash
curl -X GET http://localhost:9666/api/servers/1/server-url
```

## Update Server URL

### `PUT /api/servers/:serverId/server-url`

Updates the URL for a Duplicati server.

#### Parameters

- `serverId` (path): The ID of the server

#### Request Format

```json
{
  "url": "http://192.168.1.101:8200"
}
```

#### Response Format

```json
{
  "status": "success",
  "message": "Server URL updated successfully",
  "data": {
    "serverId": 1,
    "url": "http://192.168.1.101:8200",
    "accessible": true,
    "lastChecked": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Example Usage

```bash
curl -X PUT http://localhost:9666/api/servers/1/server-url \
  -H "Content-Type: application/json" \
  -d '{"url": "http://192.168.1.101:8200"}'
```

## Get Server Password

### `GET /api/servers/:serverId/password`

Returns the configured password for a Duplicati server (masked).

#### Parameters

- `serverId` (path): The ID of the server

#### Response Format

```json
{
  "status": "success",
  "data": {
    "serverId": 1,
    "hasPassword": true,
    "password": "***"
  }
}
```

#### Example Usage

```bash
curl -X GET http://localhost:9666/api/servers/1/password
```

## Update Server Password

### `PUT /api/servers/:serverId/password`

Updates the password for a Duplicati server.

#### Parameters

- `serverId` (path): The ID of the server

#### Request Format

```json
{
  "password": "new-password"
}
```

#### Response Format

```json
{
  "status": "success",
  "message": "Server password updated successfully"
}
```

#### Example Usage

```bash
curl -X PUT http://localhost:9666/api/servers/1/password \
  -H "Content-Type: application/json" \
  -d '{"password": "new-password"}'
```

## Database Maintenance

### `POST /api/admin/database/maintenance`

Performs database maintenance operations.

#### Request Format

```json
{
  "operation": "optimize",
  "backup": true,
  "vacuum": true,
  "analyze": true
}
```

#### Response Format

```json
{
  "status": "success",
  "message": "Database maintenance completed",
  "data": {
    "operation": "optimize",
    "backup": {
      "created": true,
      "path": "/app/data/backups-copy-2024-01-15T10-30-00.db"
    },
    "vacuum": {
      "completed": true,
      "freed": 5242880
    },
    "analyze": {
      "completed": true,
      "tables": 8
    },
    "duration": 45
  }
}
```

#### Example Usage

```bash
curl -X POST http://localhost:9666/api/admin/database/maintenance \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "optimize",
    "backup": true,
    "vacuum": true,
    "analyze": true
  }'
```

## System Information

### `GET /api/admin/system/info`

Returns detailed system information.

#### Response Format

```json
{
  "status": "success",
  "data": {
    "application": {
      "name": "duplistatus",
      "version": "0.8.10",
      "nodeVersion": "20.10.0",
      "platform": "linux",
      "arch": "x64"
    },
    "system": {
      "hostname": "duplistatus-server",
      "uptime": 86400,
      "load": [0.5, 0.8, 1.2],
      "memory": {
        "total": 536870912,
        "used": 134217728,
        "free": 402653184
      },
      "disk": {
        "total": 10737418240,
        "used": 1073741824,
        "free": 9663676416
      }
    },
    "database": {
      "type": "sqlite",
      "version": "3.42.0",
      "size": 52428800,
      "tables": 8,
      "indexes": 12
    },
    "services": {
      "web": {
        "status": "running",
        "port": 9666,
        "pid": 1234
      },
      "cron": {
        "status": "running",
        "port": 9667,
        "pid": 1235
      }
    }
  }
}
```

#### Example Usage

```bash
curl -X GET http://localhost:9666/api/admin/system/info
```

## Error Handling

### Common Error Responses

#### Server Not Found
```json
{
  "status": "error",
  "error": "NotFoundError",
  "message": "Server not found"
}
```

#### Connection Failed
```json
{
  "status": "error",
  "error": "ConnectionError",
  "message": "Failed to connect to Duplicati server"
}
```

#### Database Error
```json
{
  "status": "error",
  "error": "DatabaseError",
  "message": "Database operation failed"
}
```

#### Permission Denied
```json
{
  "status": "error",
  "error": "PermissionError",
  "message": "Insufficient permissions for this operation"
}
```

## Usage Examples

### JavaScript Integration

```javascript
class DuplistatusAdminAPI {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async collectBackups(serverIds, options = {}) {
    const response = await fetch(`${this.baseUrl}/api/backups/collect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        serverIds,
        force: options.force || false,
        timeout: options.timeout || 300
      })
    });
    
    const data = await response.json();
    
    if (data.status === 'success') {
      return data.data;
    } else {
      throw new Error(data.message);
    }
  }

  async cleanupBackups(retentionDays, options = {}) {
    const response = await fetch(`${this.baseUrl}/api/backups/cleanup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        retentionDays,
        dryRun: options.dryRun || false,
        backupBeforeCleanup: options.backupBeforeCleanup || true
      })
    });
    
    const data = await response.json();
    
    if (data.status === 'success') {
      return data.data;
    } else {
      throw new Error(data.message);
    }
  }

  async testServerConnection(serverId, timeout = 30) {
    const response = await fetch(`${this.baseUrl}/api/servers/test-connection`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        serverId,
        timeout
      })
    });
    
    const data = await response.json();
    
    if (data.status === 'success') {
      return data.data;
    } else {
      throw new Error(data.message);
    }
  }

  async getSystemInfo() {
    const response = await fetch(`${this.baseUrl}/api/admin/system/info`);
    const data = await response.json();
    
    if (data.status === 'success') {
      return data.data;
    } else {
      throw new Error(data.message);
    }
  }
}

// Usage
const adminAPI = new DuplistatusAdminAPI('http://localhost:9666');

// Collect backups from all servers
const collection = await adminAPI.collectBackups([1, 2, 3]);
console.log(`Collected ${collection.collected} backups`);

// Cleanup old backups
const cleanup = await adminAPI.cleanupBackups(90);
console.log(`Deleted ${cleanup.deleted.backups} old backups`);

// Test server connection
const connection = await adminAPI.testServerConnection(1);
console.log(`Server connected: ${connection.connected}`);

// Get system information
const systemInfo = await adminAPI.getSystemInfo();
console.log(`System uptime: ${systemInfo.system.uptime} seconds`);
```

### Python Integration

```python
import requests
from typing import Dict, Any, List

class DuplistatusAdminAPI:
    def __init__(self, base_url: str):
        self.base_url = base_url
    
    def collect_backups(self, server_ids: List[int], options: Dict[str, Any] = None) -> Dict[str, Any]:
        if options is None:
            options = {}
        
        response = requests.post(
            f"{self.base_url}/api/backups/collect",
            json={
                'serverIds': server_ids,
                'force': options.get('force', False),
                'timeout': options.get('timeout', 300)
            }
        )
        data = response.json()
        
        if data['status'] == 'success':
            return data['data']
        else:
            raise Exception(data['message'])
    
    def cleanup_backups(self, retention_days: int, options: Dict[str, Any] = None) -> Dict[str, Any]:
        if options is None:
            options = {}
        
        response = requests.post(
            f"{self.base_url}/api/backups/cleanup",
            json={
                'retentionDays': retention_days,
                'dryRun': options.get('dryRun', False),
                'backupBeforeCleanup': options.get('backupBeforeCleanup', True)
            }
        )
        data = response.json()
        
        if data['status'] == 'success':
            return data['data']
        else:
            raise Exception(data['message'])
    
    def test_server_connection(self, server_id: int, timeout: int = 30) -> Dict[str, Any]:
        response = requests.post(
            f"{self.base_url}/api/servers/test-connection",
            json={
                'serverId': server_id,
                'timeout': timeout
            }
        )
        data = response.json()
        
        if data['status'] == 'success':
            return data['data']
        else:
            raise Exception(data['message'])
    
    def get_system_info(self) -> Dict[str, Any]:
        response = requests.get(f"{self.base_url}/api/admin/system/info")
        data = response.json()
        
        if data['status'] == 'success':
            return data['data']
        else:
            raise Exception(data['message'])

# Usage
admin_api = DuplistatusAdminAPI('http://localhost:9666')

# Collect backups from all servers
collection = admin_api.collect_backups([1, 2, 3])
print(f"Collected {collection['collected']} backups")

# Cleanup old backups
cleanup = admin_api.cleanup_backups(90)
print(f"Deleted {cleanup['deleted']['backups']} old backups")

# Test server connection
connection = admin_api.test_server_connection(1)
print(f"Server connected: {connection['connected']}")

# Get system information
system_info = admin_api.get_system_info()
print(f"System uptime: {system_info['system']['uptime']} seconds")
```

## Best Practices

### Database Maintenance
- Always backup before cleanup operations
- Run maintenance during low-usage periods
- Monitor database size and performance
- Use dry-run mode to preview changes

### Server Management
- Test connections before making changes
- Keep server credentials secure
- Monitor server accessibility
- Document server configurations

### System Administration
- Monitor system resources regularly
- Implement proper logging
- Use appropriate timeouts
- Handle errors gracefully

### Security
- Restrict admin API access
- Use secure connections
- Implement proper authentication
- Audit administrative actions

## Next Steps

- **Core Operations**: Learn about [Core API Operations](core-operations.md)
- **External APIs**: Explore [External Integration APIs](external-apis.md)
- **Configuration**: Manage [Configuration APIs](configuration-apis.md)
- **Monitoring**: Use [Monitoring APIs](monitoring-apis.md)
- **Chart Data**: Retrieve [Chart Data APIs](chart-data-apis.md)
