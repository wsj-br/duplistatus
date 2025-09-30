---
sidebar_position: 2
---

# External APIs

![duplistatus](//img/duplistatus_banner.png)

APIs designed for external integrations, particularly with tools like Homepage.

## Overview

The External APIs are specifically designed for integration with third-party tools and applications. These endpoints provide simplified, focused data that's perfect for dashboards, monitoring tools, and other external systems.

## Get Overall Summary

### `GET /api/summary`

Returns a high-level summary of all backup operations across all servers.

#### Response Format

```json
{
  "status": "success",
  "data": {
    "totalServers": 5,
    "totalBackupJobs": 12,
    "successfulBackups": 45,
    "failedBackups": 2,
    "overdueBackups": 1,
    "lastUpdated": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Example Usage

```bash
curl -X GET http://localhost:9666/api/summary
```

#### Homepage Integration

```yaml
- duplistatus:
    title: Backup Summary
    url: http://localhost:9666
    api: /api/summary
    refresh: 300
```

## Get Latest Backup

### `GET /api/lastbackup/:serverId`

Returns the most recent backup information for a specific server.

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
      "alias": "Production Server"
    },
    "lastBackup": {
      "id": 123,
      "name": "daily-backup",
      "status": "success",
      "startTime": "2024-01-15T02:00:00.000Z",
      "endTime": "2024-01-15T03:30:00.000Z",
      "duration": 5400,
      "files": 1250,
      "size": 1073741824,
      "storageUsed": 536870912
    }
  }
}
```

#### Example Usage

```bash
curl -X GET http://localhost:9666/api/lastbackup/1
```

#### Homepage Integration

```yaml
- duplistatus:
    title: Last Backup
    url: http://localhost:9666
    api: /api/lastbackup/1
    refresh: 600
```

## Get Latest Backups

### `GET /api/lastbackups/:serverId`

Returns the most recent backup information for all backup jobs on a specific server.

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
      "alias": "Production Server"
    },
    "backups": [
      {
        "id": 123,
        "name": "daily-backup",
        "status": "success",
        "startTime": "2024-01-15T02:00:00.000Z",
        "endTime": "2024-01-15T03:30:00.000Z",
        "duration": 5400,
        "files": 1250,
        "size": 1073741824,
        "storageUsed": 536870912
      },
      {
        "id": 124,
        "name": "weekly-backup",
        "status": "warning",
        "startTime": "2024-01-14T22:00:00.000Z",
        "endTime": "2024-01-15T01:45:00.000Z",
        "duration": 13500,
        "files": 5000,
        "size": 2147483648,
        "storageUsed": 1073741824
      }
    ],
    "backupJobsCount": 2,
    "lastUpdated": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Example Usage

```bash
curl -X GET http://localhost:9666/api/lastbackups/1
```

#### Homepage Integration

```yaml
- duplistatus:
    title: Server Backups
    url: http://localhost:9666
    api: /api/lastbackups/1
    refresh: 600
```

## Upload Backup Data

### `POST /api/upload`

Endpoint for Duplicati servers to upload backup data. This is the primary integration point between Duplicati and duplistatus.

#### Request Format

```json
{
  "server": {
    "name": "server-01",
    "version": "2.0.7.1"
  },
  "backup": {
    "name": "daily-backup",
    "status": "success",
    "startTime": "2024-01-15T02:00:00.000Z",
    "endTime": "2024-01-15T03:30:00.000Z",
    "duration": 5400,
    "files": 1250,
    "size": 1073741824,
    "storageUsed": 536870912,
    "messages": [
      {
        "level": "info",
        "message": "Backup completed successfully"
      }
    ]
  }
}
```

#### Response Format

```json
{
  "status": "success",
  "message": "Backup data uploaded successfully",
  "data": {
    "backupId": 123,
    "serverId": 1
  }
}
```

#### Example Usage

```bash
curl -X POST http://localhost:9666/api/upload \
  -H "Content-Type: application/json" \
  -d '{
    "server": {
      "name": "server-01",
      "version": "2.0.7.1"
    },
    "backup": {
      "name": "daily-backup",
      "status": "success",
      "startTime": "2024-01-15T02:00:00.000Z",
      "endTime": "2024-01-15T03:30:00.000Z",
      "duration": 5400,
      "files": 1250,
      "size": 1073741824,
      "storageUsed": 536870912
    }
  }'
```

#### Duplicati Configuration

Configure Duplicati to send backup data to this endpoint:

```bash
--send-http-url=http://your-duplistatus-server:9666/api/upload
--send-http-result-output-format=Json
--send-http-log-level=Information
--send-http-max-log-lines=0
```

## Error Handling

### Common Error Responses

#### Invalid Server ID
```json
{
  "status": "error",
  "error": "ValidationError",
  "message": "Invalid server ID format"
}
```

#### Server Not Found
```json
{
  "status": "error",
  "error": "NotFoundError",
  "message": "Server not found"
}
```

#### Invalid Upload Data
```json
{
  "status": "error",
  "error": "ValidationError",
  "message": "Invalid backup data format"
}
```

## Integration Examples

### Homepage Dashboard

#### Complete Homepage Configuration

```yaml
services:
  - duplistatus:
      title: Backup Status
      url: http://localhost:9666
      api: /api/summary
      refresh: 300
      
  - duplistatus:
      title: Production Server
      url: http://localhost:9666
      api: /api/lastbackup/1
      refresh: 600
      
  - duplistatus:
      title: Development Server
      url: http://localhost:9666
      api: /api/lastbackup/2
      refresh: 600
```

#### Custom Widget Styling

```yaml
- duplistatus:
    title: Backup Overview
    url: http://localhost:9666
    api: /api/summary
    refresh: 300
    style: |
      .duplistatus-widget {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 10px;
        padding: 20px;
      }
```

### Monitoring Tools

#### Prometheus Integration

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'duplistatus'
    static_configs:
      - targets: ['localhost:9666']
    metrics_path: '/api/health'
    scrape_interval: 30s
```

#### Grafana Dashboard

```json
{
  "dashboard": {
    "title": "Duplistatus Backup Monitoring",
    "panels": [
      {
        "title": "Backup Success Rate",
        "type": "stat",
        "targets": [
          {
            "expr": "duplistatus_backup_success_rate"
          }
        ]
      },
      {
        "title": "Overdue Backups",
        "type": "stat",
        "targets": [
          {
            "expr": "duplistatus_overdue_backups"
          }
        ]
      }
    ]
  }
}
```

### Custom Applications

#### JavaScript Integration

```javascript
class DuplistatusClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async getSummary() {
    const response = await fetch(`${this.baseUrl}/api/summary`);
    const data = await response.json();
    
    if (data.status === 'success') {
      return data.data;
    } else {
      throw new Error(data.message);
    }
  }

  async getLastBackup(serverId) {
    const response = await fetch(`${this.baseUrl}/api/lastbackup/${serverId}`);
    const data = await response.json();
    
    if (data.status === 'success') {
      return data.data;
    } else {
      throw new Error(data.message);
    }
  }
}

// Usage
const client = new DuplistatusClient('http://localhost:9666');
const summary = await client.getSummary();
console.log(`Total servers: ${summary.totalServers}`);
```

#### Python Integration

```python
import requests
from typing import Dict, Any

class DuplistatusClient:
    def __init__(self, base_url: str):
        self.base_url = base_url
    
    def get_summary(self) -> Dict[str, Any]:
        response = requests.get(f"{self.base_url}/api/summary")
        data = response.json()
        
        if data['status'] == 'success':
            return data['data']
        else:
            raise Exception(data['message'])
    
    def get_last_backup(self, server_id: int) -> Dict[str, Any]:
        response = requests.get(f"{self.base_url}/api/lastbackup/{server_id}")
        data = response.json()
        
        if data['status'] == 'success':
            return data['data']
        else:
            raise Exception(data['message'])

# Usage
client = DuplistatusClient('http://localhost:9666')
summary = client.get_summary()
print(f"Total servers: {summary['totalServers']}")
```

## Best Practices

### Performance Optimization
- Use appropriate refresh intervals (300-600 seconds for most use cases)
- Implement caching for frequently accessed data
- Use pagination for large datasets
- Monitor API usage and performance

### Error Handling
- Always check response status
- Implement retry logic for transient failures
- Handle network errors gracefully
- Log errors for debugging

### Security
- Use HTTPS in production
- Implement proper access controls
- Validate all input data
- Monitor API usage for anomalies

## Next Steps

- **Core Operations**: Learn about [Core API Operations](core-operations.md)
- **Configuration**: Manage [Configuration APIs](configuration-apis.md)
- **Monitoring**: Use [Monitoring APIs](monitoring-apis.md)
- **Administration**: Access [Administration APIs](administration-apis.md)
- **Chart Data**: Retrieve [Chart Data APIs](chart-data-apis.md)
