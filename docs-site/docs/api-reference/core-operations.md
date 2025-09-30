---
sidebar_position: 3
---

# Core Operations

![duplistatus](//img/duplistatus_banner.png)

Core API operations for managing backup data, servers, and dashboard information.

## Overview

The Core Operations APIs provide the fundamental functionality for managing backup data, servers, and retrieving dashboard information. These endpoints form the backbone of the duplistatus system.

## Get Dashboard Data (Consolidated)

### `GET /api/dashboard`

Returns consolidated dashboard data including all servers, their backup status, and summary statistics.

#### Response Format

```json
{
  "status": "success",
  "data": {
    "summary": {
      "totalServers": 5,
      "totalBackupJobs": 12,
      "totalBackupRuns": 156,
      "totalBackupSize": 107374182400,
      "storageUsed": 53687091200,
      "uploadedSize": 26843545600,
      "overdueBackups": 1
    },
    "servers": [
      {
        "id": 1,
        "name": "server-01",
        "alias": "Production Server",
        "notes": "Main production server",
        "lastSeen": "2024-01-15T10:30:00.000Z",
        "overallStatus": "success",
        "backups": [
          {
            "id": 123,
            "name": "daily-backup",
            "status": "success",
            "lastBackup": "2024-01-15T03:30:00.000Z",
            "duration": 5400,
            "files": 1250,
            "size": 1073741824,
            "storageUsed": 536870912,
            "overdue": false
          }
        ]
      }
    ],
    "lastUpdated": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Example Usage

```bash
curl -X GET http://localhost:9666/api/dashboard
```

## Get All Servers

### `GET /api/servers`

Returns a list of all configured servers with their basic information.

#### Response Format

```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "server-01",
      "alias": "Production Server",
      "notes": "Main production server",
      "lastSeen": "2024-01-15T10:30:00.000Z",
      "backupCount": 3,
      "overallStatus": "success"
    },
    {
      "id": 2,
      "name": "server-02",
      "alias": "Development Server",
      "notes": "Development and testing server",
      "lastSeen": "2024-01-15T09:45:00.000Z",
      "backupCount": 2,
      "overallStatus": "warning"
    }
  ]
}
```

#### Example Usage

```bash
curl -X GET http://localhost:9666/api/servers
```

## Get Server Details

### `GET /api/servers/:id`

Returns detailed information about a specific server including all backup jobs and their status.

#### Parameters

- `id` (path): The ID of the server

#### Response Format

```json
{
  "status": "success",
  "data": {
    "id": 1,
    "name": "server-01",
    "alias": "Production Server",
    "notes": "Main production server",
    "lastSeen": "2024-01-15T10:30:00.000Z",
    "backupCount": 3,
    "overallStatus": "success",
    "backups": [
      {
        "id": 123,
        "name": "daily-backup",
        "status": "success",
        "lastBackup": "2024-01-15T03:30:00.000Z",
        "duration": 5400,
        "files": 1250,
        "size": 1073741824,
        "storageUsed": 536870912,
        "overdue": false,
        "schedule": "0 2 * * *",
        "nextBackup": "2024-01-16T02:00:00.000Z"
      },
      {
        "id": 124,
        "name": "weekly-backup",
        "status": "warning",
        "lastBackup": "2024-01-14T22:00:00.000Z",
        "duration": 13500,
        "files": 5000,
        "size": 2147483648,
        "storageUsed": 1073741824,
        "overdue": true,
        "schedule": "0 22 * * 0",
        "nextBackup": "2024-01-21T22:00:00.000Z"
      }
    ],
    "statistics": {
      "totalBackups": 156,
      "successfulBackups": 150,
      "failedBackups": 6,
      "successRate": 96.15,
      "averageDuration": 7200,
      "totalData": 107374182400,
      "totalStorage": 53687091200
    }
  }
}
```

#### Example Usage

```bash
curl -X GET http://localhost:9666/api/servers/1
```

## Update Server

### `PUT /api/servers/:id`

Updates server information including alias, notes, and other settings.

#### Parameters

- `id` (path): The ID of the server

#### Request Format

```json
{
  "alias": "Updated Server Name",
  "notes": "Updated server description",
  "notificationSettings": {
    "enabled": true,
    "email": "admin@example.com",
    "ntfy": {
      "enabled": true,
      "topic": "backup-alerts"
    }
  }
}
```

#### Response Format

```json
{
  "status": "success",
  "message": "Server updated successfully",
  "data": {
    "id": 1,
    "name": "server-01",
    "alias": "Updated Server Name",
    "notes": "Updated server description",
    "lastSeen": "2024-01-15T10:30:00.000Z",
    "backupCount": 3,
    "overallStatus": "success"
  }
}
```

#### Example Usage

```bash
curl -X PUT http://localhost:9666/api/servers/1 \
  -H "Content-Type: application/json" \
  -d '{
    "alias": "Updated Server Name",
    "notes": "Updated server description"
  }'
```

## Delete Server

### `DELETE /api/servers/:id`

Removes a server and all its associated backup data from the system.

#### Parameters

- `id` (path): The ID of the server

#### Response Format

```json
{
  "status": "success",
  "message": "Server deleted successfully"
}
```

#### Example Usage

```bash
curl -X DELETE http://localhost:9666/api/servers/1
```

## Get Server Data with Overdue Info

### `GET /api/detail/:serverId`

Returns detailed server information including overdue backup analysis and recommendations.

#### Parameters

- `serverId` (path): The ID of the server

#### Response Format

```json
{
  "status": "success",
  "data": {
    "server": {
      "id": 1,
      "name": "server-01",
      "alias": "Production Server",
      "notes": "Main production server",
      "lastSeen": "2024-01-15T10:30:00.000Z"
    },
    "backups": [
      {
        "id": 123,
        "name": "daily-backup",
        "status": "success",
        "lastBackup": "2024-01-15T03:30:00.000Z",
        "duration": 5400,
        "files": 1250,
        "size": 1073741824,
        "storageUsed": 536870912,
        "overdue": false,
        "overdueInfo": {
          "isOverdue": false,
          "expectedTime": "2024-01-15T02:00:00.000Z",
          "gracePeriod": 3600,
          "overdueDuration": 0
        }
      },
      {
        "id": 124,
        "name": "weekly-backup",
        "status": "warning",
        "lastBackup": "2024-01-14T22:00:00.000Z",
        "duration": 13500,
        "files": 5000,
        "size": 2147483648,
        "storageUsed": 1073741824,
        "overdue": true,
        "overdueInfo": {
          "isOverdue": true,
          "expectedTime": "2024-01-14T22:00:00.000Z",
          "gracePeriod": 7200,
          "overdueDuration": 43200,
          "recommendations": [
            "Check backup job status",
            "Verify schedule configuration",
            "Review error logs"
          ]
        }
      }
    ],
    "overdueSummary": {
      "totalOverdue": 1,
      "criticalOverdue": 0,
      "warningOverdue": 1,
      "averageOverdueDuration": 43200
    }
  }
}
```

#### Example Usage

```bash
curl -X GET http://localhost:9666/api/detail/1
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

#### Invalid Server ID
```json
{
  "status": "error",
  "error": "ValidationError",
  "message": "Invalid server ID format"
}
```

#### Update Validation Error
```json
{
  "status": "error",
  "error": "ValidationError",
  "message": "Invalid alias format"
}
```

## Usage Examples

### JavaScript Integration

```javascript
class DuplistatusCoreAPI {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async getDashboard() {
    const response = await fetch(`${this.baseUrl}/api/dashboard`);
    const data = await response.json();
    
    if (data.status === 'success') {
      return data.data;
    } else {
      throw new Error(data.message);
    }
  }

  async getServers() {
    const response = await fetch(`${this.baseUrl}/api/servers`);
    const data = await response.json();
    
    if (data.status === 'success') {
      return data.data;
    } else {
      throw new Error(data.message);
    }
  }

  async getServerDetails(serverId) {
    const response = await fetch(`${this.baseUrl}/api/servers/${serverId}`);
    const data = await response.json();
    
    if (data.status === 'success') {
      return data.data;
    } else {
      throw new Error(data.message);
    }
  }

  async updateServer(serverId, updates) {
    const response = await fetch(`${this.baseUrl}/api/servers/${serverId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });
    
    const data = await response.json();
    
    if (data.status === 'success') {
      return data.data;
    } else {
      throw new Error(data.message);
    }
  }
}

// Usage
const api = new DuplistatusCoreAPI('http://localhost:9666');

// Get dashboard data
const dashboard = await api.getDashboard();
console.log(`Total servers: ${dashboard.summary.totalServers}`);

// Update server
await api.updateServer(1, {
  alias: 'New Server Name',
  notes: 'Updated description'
});
```

### Python Integration

```python
import requests
from typing import Dict, Any, List

class DuplistatusCoreAPI:
    def __init__(self, base_url: str):
        self.base_url = base_url
    
    def get_dashboard(self) -> Dict[str, Any]:
        response = requests.get(f"{self.base_url}/api/dashboard")
        data = response.json()
        
        if data['status'] == 'success':
            return data['data']
        else:
            raise Exception(data['message'])
    
    def get_servers(self) -> List[Dict[str, Any]]:
        response = requests.get(f"{self.base_url}/api/servers")
        data = response.json()
        
        if data['status'] == 'success':
            return data['data']
        else:
            raise Exception(data['message'])
    
    def get_server_details(self, server_id: int) -> Dict[str, Any]:
        response = requests.get(f"{self.base_url}/api/servers/{server_id}")
        data = response.json()
        
        if data['status'] == 'success':
            return data['data']
        else:
            raise Exception(data['message'])
    
    def update_server(self, server_id: int, updates: Dict[str, Any]) -> Dict[str, Any]:
        response = requests.put(
            f"{self.base_url}/api/servers/{server_id}",
            json=updates
        )
        data = response.json()
        
        if data['status'] == 'success':
            return data['data']
        else:
            raise Exception(data['message'])

# Usage
api = DuplistatusCoreAPI('http://localhost:9666')

# Get dashboard data
dashboard = api.get_dashboard()
print(f"Total servers: {dashboard['summary']['totalServers']}")

# Update server
api.update_server(1, {
    'alias': 'New Server Name',
    'notes': 'Updated description'
})
```

## Best Practices

### Performance Optimization
- Use the dashboard endpoint for consolidated data
- Cache server details when possible
- Implement pagination for large server lists
- Use appropriate HTTP methods

### Error Handling
- Always check response status
- Handle network errors gracefully
- Implement retry logic for transient failures
- Log errors for debugging

### Data Management
- Validate input data before sending requests
- Handle partial updates gracefully
- Implement proper backup before deletions
- Monitor API usage and performance

## Next Steps

- **External APIs**: Explore [External Integration APIs](external-apis.md)
- **Configuration**: Manage [Configuration APIs](configuration-apis.md)
- **Monitoring**: Use [Monitoring APIs](monitoring-apis.md)
- **Administration**: Access [Administration APIs](administration-apis.md)
- **Chart Data**: Retrieve [Chart Data APIs](chart-data-apis.md)
