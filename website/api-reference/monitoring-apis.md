---
sidebar_position: 5
---

# Monitoring APIs

![duplistatus](//img/duplistatus_banner.png)

APIs for monitoring system health, checking overdue backups, and managing notifications.

## Overview

The Monitoring APIs provide health checks, overdue backup monitoring, notification testing, and system status information.

## Health Check

### `GET /api/health`

Returns the current health status of the duplistatus system.

#### Response Format

```json
{
  "status": "success",
  "data": {
    "health": "healthy",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "version": "0.8.10",
    "uptime": 86400,
    "database": {
      "status": "connected",
      "size": 52428800,
      "lastBackup": "2024-01-15T02:00:00.000Z"
    },
    "services": {
      "web": "running",
      "cron": "running",
      "notifications": "active"
    },
    "metrics": {
      "totalServers": 5,
      "totalBackups": 156,
      "activeConnections": 3,
      "memoryUsage": 134217728,
      "cpuUsage": 15.5
    }
  }
}
```

#### Example Usage

```bash
curl -X GET http://localhost:9666/api/health
```

#### Health Status Values

- `healthy`: All systems operational
- `degraded`: Some non-critical issues
- `unhealthy`: Critical issues detected
- `maintenance`: System in maintenance mode

## Test Notification

### `POST /api/notifications/test`

Sends a test notification to verify notification configuration.

#### Request Format

```json
{
  "type": "success",
  "message": "Test notification from duplistatus",
  "channels": ["email", "ntfy"]
}
```

#### Response Format

```json
{
  "status": "success",
  "message": "Test notification sent successfully",
  "data": {
    "channels": {
      "email": {
        "sent": true,
        "messageId": "msg_123"
      },
      "ntfy": {
        "sent": true,
        "messageId": "ntfy_456"
      }
    }
  }
}
```

#### Example Usage

```bash
curl -X POST http://localhost:9666/api/notifications/test \
  -H "Content-Type: application/json" \
  -d '{
    "type": "success",
    "message": "Test notification from duplistatus",
    "channels": ["email", "ntfy"]
  }'
```

## Check Overdue Backups

### `POST /api/notifications/check-overdue`

Manually triggers a check for overdue backups.

#### Response Format

```json
{
  "status": "success",
  "message": "Overdue backup check completed",
  "data": {
    "checked": 12,
    "overdue": 2,
    "notifications": {
      "sent": 2,
      "failed": 0
    },
    "results": [
      {
        "serverId": 1,
        "backupName": "daily-backup",
        "overdue": true,
        "overdueDuration": 7200,
        "notificationSent": true
      },
      {
        "serverId": 2,
        "backupName": "weekly-backup",
        "overdue": true,
        "overdueDuration": 14400,
        "notificationSent": true
      }
    ]
  }
}
```

#### Example Usage

```bash
curl -X POST http://localhost:9666/api/notifications/check-overdue
```

## Clear Overdue Timestamps

### `POST /api/notifications/clear-overdue-timestamps`

Clears overdue timestamps for resolved backup issues.

#### Request Format

```json
{
  "serverIds": [1, 2, 3],
  "backupNames": ["daily-backup", "weekly-backup"]
}
```

#### Response Format

```json
{
  "status": "success",
  "message": "Overdue timestamps cleared successfully",
  "data": {
    "cleared": 5,
    "servers": [1, 2, 3],
    "backups": ["daily-backup", "weekly-backup"]
  }
}
```

#### Example Usage

```bash
curl -X POST http://localhost:9666/api/notifications/clear-overdue-timestamps \
  -H "Content-Type: application/json" \
  -d '{
    "serverIds": [1, 2, 3],
    "backupNames": ["daily-backup", "weekly-backup"]
  }'
```

## Cron Service Management

### Get Cron Configuration

#### `GET /api/cron-config`

Returns the current cron service configuration.

##### Response Format

```json
{
  "status": "success",
  "data": {
    "enabled": true,
    "port": 9667,
    "tasks": {
      "overdueCheck": {
        "enabled": true,
        "schedule": "0 */6 * * *",
        "lastRun": "2024-01-15T06:00:00.000Z",
        "nextRun": "2024-01-15T12:00:00.000Z"
      },
      "cleanup": {
        "enabled": true,
        "schedule": "0 2 * * 0",
        "lastRun": "2024-01-14T02:00:00.000Z",
        "nextRun": "2024-01-21T02:00:00.000Z"
      }
    },
    "status": "running"
  }
}
```

##### Example Usage

```bash
curl -X GET http://localhost:9667/api/cron-config
```

### Update Cron Configuration

#### `PUT /api/cron-config`

Updates the cron service configuration.

##### Request Format

```json
{
  "enabled": true,
  "tasks": {
    "overdueCheck": {
      "enabled": true,
      "schedule": "0 */4 * * *"
    },
    "cleanup": {
      "enabled": true,
      "schedule": "0 3 * * 0"
    }
  }
}
```

##### Response Format

```json
{
  "status": "success",
  "message": "Cron configuration updated successfully"
}
```

##### Example Usage

```bash
curl -X PUT http://localhost:9667/api/cron-config \
  -H "Content-Type: application/json" \
  -d '{
    "enabled": true,
    "tasks": {
      "overdueCheck": {
        "enabled": true,
        "schedule": "0 */4 * * *"
      }
    }
  }'
```

### Cron Service Proxy

#### `GET /api/cron/*`

Proxies requests to the cron service for additional functionality.

##### Example Usage

```bash
# Get cron service status
curl -X GET http://localhost:9666/api/cron/status

# Get cron service logs
curl -X GET http://localhost:9666/api/cron/logs

# Restart cron service
curl -X POST http://localhost:9666/api/cron/restart
```

## System Metrics

### Get System Metrics

#### `GET /api/metrics`

Returns detailed system metrics and performance data.

##### Response Format

```json
{
  "status": "success",
  "data": {
    "system": {
      "uptime": 86400,
      "memory": {
        "used": 134217728,
        "total": 536870912,
        "percentage": 25.0
      },
      "cpu": {
        "usage": 15.5,
        "load": [0.5, 0.8, 1.2]
      },
      "disk": {
        "used": 1073741824,
        "total": 10737418240,
        "percentage": 10.0
      }
    },
    "application": {
      "version": "0.8.10",
      "startTime": "2024-01-14T10:30:00.000Z",
      "requests": {
        "total": 15420,
        "perMinute": 12.5,
        "errors": 23,
        "errorRate": 0.15
      }
    },
    "database": {
      "size": 52428800,
      "connections": 5,
      "queries": {
        "total": 89420,
        "perMinute": 62.1,
        "slow": 12
      }
    },
    "backups": {
      "totalServers": 5,
      "totalBackups": 156,
      "successRate": 96.15,
      "overdue": 2,
      "last24Hours": 12
    }
  }
}
```

##### Example Usage

```bash
curl -X GET http://localhost:9666/api/metrics
```

## Error Handling

### Common Error Responses

#### Service Unavailable
```json
{
  "status": "error",
  "error": "ServiceUnavailableError",
  "message": "Cron service is not running"
}
```

#### Notification Failed
```json
{
  "status": "error",
  "error": "NotificationError",
  "message": "Failed to send email notification"
}
```

#### Health Check Failed
```json
{
  "status": "error",
  "error": "HealthCheckError",
  "message": "Database connection failed"
}
```

## Usage Examples

### JavaScript Integration

```javascript
class DuplistatusMonitoringAPI {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async getHealth() {
    const response = await fetch(`${this.baseUrl}/api/health`);
    const data = await response.json();
    
    if (data.status === 'success') {
      return data.data;
    } else {
      throw new Error(data.message);
    }
  }

  async testNotification(type, message, channels = ['email', 'ntfy']) {
    const response = await fetch(`${this.baseUrl}/api/notifications/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type,
        message,
        channels
      })
    });
    
    const data = await response.json();
    
    if (data.status === 'success') {
      return data.data;
    } else {
      throw new Error(data.message);
    }
  }

  async checkOverdueBackups() {
    const response = await fetch(`${this.baseUrl}/api/notifications/check-overdue`, {
      method: 'POST'
    });
    
    const data = await response.json();
    
    if (data.status === 'success') {
      return data.data;
    } else {
      throw new Error(data.message);
    }
  }

  async getMetrics() {
    const response = await fetch(`${this.baseUrl}/api/metrics`);
    const data = await response.json();
    
    if (data.status === 'success') {
      return data.data;
    } else {
      throw new Error(data.message);
    }
  }
}

// Usage
const monitoringAPI = new DuplistatusMonitoringAPI('http://localhost:9666');

// Check system health
const health = await monitoringAPI.getHealth();
console.log('System health:', health.health);

// Test notifications
await monitoringAPI.testNotification('success', 'Test message');

// Check overdue backups
const overdueCheck = await monitoringAPI.checkOverdueBackups();
console.log(`Found ${overdueCheck.overdue} overdue backups`);

// Get system metrics
const metrics = await monitoringAPI.getMetrics();
console.log('CPU usage:', metrics.system.cpu.usage);
```

### Python Integration

```python
import requests
from typing import Dict, Any, List

class DuplistatusMonitoringAPI:
    def __init__(self, base_url: str):
        self.base_url = base_url
    
    def get_health(self) -> Dict[str, Any]:
        response = requests.get(f"{self.base_url}/api/health")
        data = response.json()
        
        if data['status'] == 'success':
            return data['data']
        else:
            raise Exception(data['message'])
    
    def test_notification(self, notification_type: str, message: str, channels: List[str] = None) -> Dict[str, Any]:
        if channels is None:
            channels = ['email', 'ntfy']
        
        response = requests.post(
            f"{self.base_url}/api/notifications/test",
            json={
                'type': notification_type,
                'message': message,
                'channels': channels
            }
        )
        data = response.json()
        
        if data['status'] == 'success':
            return data['data']
        else:
            raise Exception(data['message'])
    
    def check_overdue_backups(self) -> Dict[str, Any]:
        response = requests.post(f"{self.base_url}/api/notifications/check-overdue")
        data = response.json()
        
        if data['status'] == 'success':
            return data['data']
        else:
            raise Exception(data['message'])
    
    def get_metrics(self) -> Dict[str, Any]:
        response = requests.get(f"{self.base_url}/api/metrics")
        data = response.json()
        
        if data['status'] == 'success':
            return data['data']
        else:
            raise Exception(data['message'])

# Usage
monitoring_api = DuplistatusMonitoringAPI('http://localhost:9666')

# Check system health
health = monitoring_api.get_health()
print(f"System health: {health['health']}")

# Test notifications
monitoring_api.test_notification('success', 'Test message')

# Check overdue backups
overdue_check = monitoring_api.check_overdue_backups()
print(f"Found {overdue_check['overdue']} overdue backups")

# Get system metrics
metrics = monitoring_api.get_metrics()
print(f"CPU usage: {metrics['system']['cpu']['usage']}%")
```

## Best Practices

### Health Monitoring
- Monitor health endpoints regularly
- Set up alerts for health status changes
- Track system metrics over time
- Implement automated health checks

### Notification Testing
- Test notifications after configuration changes
- Verify all notification channels
- Monitor notification delivery rates
- Handle notification failures gracefully

### Overdue Monitoring
- Run overdue checks regularly
- Monitor overdue patterns
- Implement escalation procedures
- Track resolution times

### Performance Monitoring
- Monitor system metrics continuously
- Set up performance alerts
- Track resource usage trends
- Optimize based on metrics

## Next Steps

- **Core Operations**: Learn about [Core API Operations](core-operations.md)
- **External APIs**: Explore [External Integration APIs](external-apis.md)
- **Configuration**: Manage [Configuration APIs](configuration-apis.md)
- **Administration**: Access [Administration APIs](administration-apis.md)
- **Chart Data**: Retrieve [Chart Data APIs](chart-data-apis.md)
