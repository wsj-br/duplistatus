---
sidebar_position: 7
---

# Chart Data APIs

![duplistatus](//img/duplistatus_banner.png)

APIs for retrieving time-series data for visualization and analytics.

## Overview

The Chart Data APIs provide time-series data for creating charts, graphs, and analytics dashboards. These endpoints return structured data optimized for visualization libraries.

## Get Aggregated Chart Data

### `GET /api/chart-data/aggregated`

Returns aggregated chart data across all servers for visualization.

#### Query Parameters

- `period` (optional): Time period for data (default: "7d")
  - `1d`: Last 24 hours
  - `7d`: Last 7 days
  - `30d`: Last 30 days
  - `90d`: Last 90 days
  - `1y`: Last year
- `metric` (optional): Metric to retrieve (default: "all")
  - `duration`: Backup duration
  - `size`: Backup size
  - `files`: File count
  - `storage`: Storage usage
  - `all`: All metrics
- `granularity` (optional): Data granularity (default: "hour")
  - `minute`: Minute-level data
  - `hour`: Hour-level data
  - `day`: Day-level data
  - `week`: Week-level data

#### Response Format

```json
{
  "status": "success",
  "data": {
    "period": "7d",
    "granularity": "hour",
    "metrics": {
      "duration": {
        "label": "Backup Duration (seconds)",
        "unit": "seconds",
        "data": [
          {
            "timestamp": "2024-01-15T00:00:00.000Z",
            "value": 5400,
            "count": 5
          },
          {
            "timestamp": "2024-01-15T01:00:00.000Z",
            "value": 7200,
            "count": 3
          }
        ],
        "statistics": {
          "min": 1800,
          "max": 14400,
          "avg": 6300,
          "total": 31500
        }
      },
      "size": {
        "label": "Backup Size (bytes)",
        "unit": "bytes",
        "data": [
          {
            "timestamp": "2024-01-15T00:00:00.000Z",
            "value": 1073741824,
            "count": 5
          },
          {
            "timestamp": "2024-01-15T01:00:00.000Z",
            "value": 2147483648,
            "count": 3
          }
        ],
        "statistics": {
          "min": 536870912,
          "max": 4294967296,
          "avg": 1610612736,
          "total": 12884901888
        }
      },
      "files": {
        "label": "File Count",
        "unit": "files",
        "data": [
          {
            "timestamp": "2024-01-15T00:00:00.000Z",
            "value": 1250,
            "count": 5
          },
          {
            "timestamp": "2024-01-15T01:00:00.000Z",
            "value": 2500,
            "count": 3
          }
        ],
        "statistics": {
          "min": 500,
          "max": 5000,
          "avg": 1875,
          "total": 15000
        }
      },
      "storage": {
        "label": "Storage Usage (bytes)",
        "unit": "bytes",
        "data": [
          {
            "timestamp": "2024-01-15T00:00:00.000Z",
            "value": 536870912,
            "count": 5
          },
          {
            "timestamp": "2024-01-15T01:00:00.000Z",
            "value": 1073741824,
            "count": 3
          }
        ],
        "statistics": {
          "min": 268435456,
          "max": 2147483648,
          "avg": 805306368,
          "total": 6442450944
        }
      }
    },
    "summary": {
      "totalBackups": 156,
      "successfulBackups": 150,
      "failedBackups": 6,
      "successRate": 96.15,
      "averageDuration": 6300,
      "totalData": 12884901888,
      "totalStorage": 6442450944
    }
  }
}
```

#### Example Usage

```bash
# Get all metrics for the last 7 days
curl -X GET "http://localhost:9666/api/chart-data/aggregated?period=7d&metric=all&granularity=hour"

# Get duration data for the last 30 days
curl -X GET "http://localhost:9666/api/chart-data/aggregated?period=30d&metric=duration&granularity=day"

# Get size data for the last 24 hours
curl -X GET "http://localhost:9666/api/chart-data/aggregated?period=1d&metric=size&granularity=minute"
```

## Get Server Chart Data

### `GET /api/chart-data/server/:serverId`

Returns chart data for a specific server.

#### Parameters

- `serverId` (path): The ID of the server

#### Query Parameters

- `period` (optional): Time period for data (default: "7d")
- `metric` (optional): Metric to retrieve (default: "all")
- `granularity` (optional): Data granularity (default: "hour")

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
    "period": "7d",
    "granularity": "hour",
    "metrics": {
      "duration": {
        "label": "Backup Duration (seconds)",
        "unit": "seconds",
        "data": [
          {
            "timestamp": "2024-01-15T00:00:00.000Z",
            "value": 5400,
            "backupName": "daily-backup",
            "status": "success"
          },
          {
            "timestamp": "2024-01-15T01:00:00.000Z",
            "value": 7200,
            "backupName": "weekly-backup",
            "status": "success"
          }
        ],
        "statistics": {
          "min": 1800,
          "max": 14400,
          "avg": 6300,
          "total": 31500
        }
      },
      "size": {
        "label": "Backup Size (bytes)",
        "unit": "bytes",
        "data": [
          {
            "timestamp": "2024-01-15T00:00:00.000Z",
            "value": 1073741824,
            "backupName": "daily-backup",
            "status": "success"
          },
          {
            "timestamp": "2024-01-15T01:00:00.000Z",
            "value": 2147483648,
            "backupName": "weekly-backup",
            "status": "success"
          }
        ],
        "statistics": {
          "min": 536870912,
          "max": 4294967296,
          "avg": 1610612736,
          "total": 12884901888
        }
      }
    },
    "backups": [
      {
        "name": "daily-backup",
        "count": 7,
        "successRate": 100.0,
        "averageDuration": 5400,
        "totalSize": 7516192768
      },
      {
        "name": "weekly-backup",
        "count": 1,
        "successRate": 100.0,
        "averageDuration": 7200,
        "totalSize": 2147483648
      }
    ],
    "summary": {
      "totalBackups": 8,
      "successfulBackups": 8,
      "failedBackups": 0,
      "successRate": 100.0,
      "averageDuration": 6300,
      "totalData": 9663676416,
      "totalStorage": 4831838208
    }
  }
}
```

#### Example Usage

```bash
# Get all metrics for server 1
curl -X GET "http://localhost:9666/api/chart-data/server/1?period=7d&metric=all&granularity=hour"

# Get duration data for server 1
curl -X GET "http://localhost:9666/api/chart-data/server/1?period=30d&metric=duration&granularity=day"
```

## Get Server Backup Chart Data

### `GET /api/chart-data/server/:serverId/backup/:backupName`

Returns chart data for a specific backup job on a specific server.

#### Parameters

- `serverId` (path): The ID of the server
- `backupName` (path): The name of the backup job

#### Query Parameters

- `period` (optional): Time period for data (default: "7d")
- `metric` (optional): Metric to retrieve (default: "all")
- `granularity` (optional): Data granularity (default: "hour")

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
    "backup": {
      "name": "daily-backup",
      "schedule": "0 2 * * *",
      "lastRun": "2024-01-15T02:00:00.000Z",
      "nextRun": "2024-01-16T02:00:00.000Z"
    },
    "period": "7d",
    "granularity": "hour",
    "metrics": {
      "duration": {
        "label": "Backup Duration (seconds)",
        "unit": "seconds",
        "data": [
          {
            "timestamp": "2024-01-15T02:00:00.000Z",
            "value": 5400,
            "status": "success",
            "files": 1250,
            "size": 1073741824
          },
          {
            "timestamp": "2024-01-14T02:00:00.000Z",
            "value": 5100,
            "status": "success",
            "files": 1200,
            "size": 1048576000
          }
        ],
        "statistics": {
          "min": 4800,
          "max": 6000,
          "avg": 5400,
          "total": 37800,
          "trend": "stable"
        }
      },
      "size": {
        "label": "Backup Size (bytes)",
        "unit": "bytes",
        "data": [
          {
            "timestamp": "2024-01-15T02:00:00.000Z",
            "value": 1073741824,
            "status": "success",
            "duration": 5400,
            "files": 1250
          },
          {
            "timestamp": "2024-01-14T02:00:00.000Z",
            "value": 1048576000,
            "status": "success",
            "duration": 5100,
            "files": 1200
          }
        ],
        "statistics": {
          "min": 1000000000,
          "max": 1100000000,
          "avg": 1073741824,
          "total": 7516192768,
          "trend": "increasing"
        }
      },
      "files": {
        "label": "File Count",
        "unit": "files",
        "data": [
          {
            "timestamp": "2024-01-15T02:00:00.000Z",
            "value": 1250,
            "status": "success",
            "duration": 5400,
            "size": 1073741824
          },
          {
            "timestamp": "2024-01-14T02:00:00.000Z",
            "value": 1200,
            "status": "success",
            "duration": 5100,
            "size": 1048576000
          }
        ],
        "statistics": {
          "min": 1150,
          "max": 1300,
          "avg": 1250,
          "total": 8750,
          "trend": "increasing"
        }
      }
    },
    "summary": {
      "totalBackups": 7,
      "successfulBackups": 7,
      "failedBackups": 0,
      "successRate": 100.0,
      "averageDuration": 5400,
      "totalData": 7516192768,
      "totalStorage": 3758096384,
      "growthRate": 2.5,
      "reliability": 100.0
    }
  }
}
```

#### Example Usage

```bash
# Get all metrics for daily-backup on server 1
curl -X GET "http://localhost:9666/api/chart-data/server/1/backup/daily-backup?period=7d&metric=all&granularity=hour"

# Get size data for daily-backup on server 1
curl -X GET "http://localhost:9666/api/chart-data/server/1/backup/daily-backup?period=30d&metric=size&granularity=day"
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

#### Backup Not Found
```json
{
  "status": "error",
  "error": "NotFoundError",
  "message": "Backup job not found"
}
```

#### Invalid Period
```json
{
  "status": "error",
  "error": "ValidationError",
  "message": "Invalid period format"
}
```

## Usage Examples

### JavaScript Integration

```javascript
class DuplistatusChartAPI {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async getAggregatedData(period = '7d', metric = 'all', granularity = 'hour') {
    const params = new URLSearchParams({
      period,
      metric,
      granularity
    });
    
    const response = await fetch(`${this.baseUrl}/api/chart-data/aggregated?${params}`);
    const data = await response.json();
    
    if (data.status === 'success') {
      return data.data;
    } else {
      throw new Error(data.message);
    }
  }

  async getServerData(serverId, period = '7d', metric = 'all', granularity = 'hour') {
    const params = new URLSearchParams({
      period,
      metric,
      granularity
    });
    
    const response = await fetch(`${this.baseUrl}/api/chart-data/server/${serverId}?${params}`);
    const data = await response.json();
    
    if (data.status === 'success') {
      return data.data;
    } else {
      throw new Error(data.message);
    }
  }

  async getBackupData(serverId, backupName, period = '7d', metric = 'all', granularity = 'hour') {
    const params = new URLSearchParams({
      period,
      metric,
      granularity
    });
    
    const response = await fetch(`${this.baseUrl}/api/chart-data/server/${serverId}/backup/${backupName}?${params}`);
    const data = await response.json();
    
    if (data.status === 'success') {
      return data.data;
    } else {
      throw new Error(data.message);
    }
  }
}

// Usage
const chartAPI = new DuplistatusChartAPI('http://localhost:9666');

// Get aggregated data for all servers
const aggregatedData = await chartAPI.getAggregatedData('7d', 'all', 'hour');
console.log('Total backups:', aggregatedData.summary.totalBackups);

// Get server-specific data
const serverData = await chartAPI.getServerData(1, '30d', 'duration', 'day');
console.log('Server success rate:', serverData.summary.successRate);

// Get backup-specific data
const backupData = await chartAPI.getBackupData(1, 'daily-backup', '7d', 'size', 'hour');
console.log('Backup growth rate:', backupData.summary.growthRate);
```

### Python Integration

```python
import requests
from typing import Dict, Any, Optional

class DuplistatusChartAPI:
    def __init__(self, base_url: str):
        self.base_url = base_url
    
    def get_aggregated_data(self, period: str = '7d', metric: str = 'all', granularity: str = 'hour') -> Dict[str, Any]:
        params = {
            'period': period,
            'metric': metric,
            'granularity': granularity
        }
        
        response = requests.get(f"{self.base_url}/api/chart-data/aggregated", params=params)
        data = response.json()
        
        if data['status'] == 'success':
            return data['data']
        else:
            raise Exception(data['message'])
    
    def get_server_data(self, server_id: int, period: str = '7d', metric: str = 'all', granularity: str = 'hour') -> Dict[str, Any]:
        params = {
            'period': period,
            'metric': metric,
            'granularity': granularity
        }
        
        response = requests.get(f"{self.base_url}/api/chart-data/server/{server_id}", params=params)
        data = response.json()
        
        if data['status'] == 'success':
            return data['data']
        else:
            raise Exception(data['message'])
    
    def get_backup_data(self, server_id: int, backup_name: str, period: str = '7d', metric: str = 'all', granularity: str = 'hour') -> Dict[str, Any]:
        params = {
            'period': period,
            'metric': metric,
            'granularity': granularity
        }
        
        response = requests.get(f"{self.base_url}/api/chart-data/server/{server_id}/backup/{backup_name}", params=params)
        data = response.json()
        
        if data['status'] == 'success':
            return data['data']
        else:
            raise Exception(data['message'])

# Usage
chart_api = DuplistatusChartAPI('http://localhost:9666')

# Get aggregated data for all servers
aggregated_data = chart_api.get_aggregated_data('7d', 'all', 'hour')
print(f"Total backups: {aggregated_data['summary']['totalBackups']}")

# Get server-specific data
server_data = chart_api.get_server_data(1, '30d', 'duration', 'day')
print(f"Server success rate: {server_data['summary']['successRate']}%")

# Get backup-specific data
backup_data = chart_api.get_backup_data(1, 'daily-backup', '7d', 'size', 'hour')
print(f"Backup growth rate: {backup_data['summary']['growthRate']}%")
```

### Chart.js Integration

```javascript
// Example using Chart.js
async function createBackupDurationChart() {
  const chartAPI = new DuplistatusChartAPI('http://localhost:9666');
  const data = await chartAPI.getAggregatedData('7d', 'duration', 'hour');
  
  const ctx = document.getElementById('backupDurationChart').getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.metrics.duration.data.map(item => 
        new Date(item.timestamp).toLocaleString()
      ),
      datasets: [{
        label: 'Backup Duration (seconds)',
        data: data.metrics.duration.data.map(item => item.value),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Duration (seconds)'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Time'
          }
        }
      }
    }
  });
}
```

## Best Practices

### Data Visualization
- Choose appropriate chart types for different metrics
- Use consistent colors and styling
- Include trend analysis and statistics
- Implement responsive design for mobile devices

### Performance Optimization
- Cache chart data when possible
- Use appropriate granularity for the time period
- Implement data pagination for large datasets
- Optimize API calls and reduce unnecessary requests

### User Experience
- Provide loading states and error handling
- Include interactive features like zoom and pan
- Show relevant statistics and summaries
- Implement real-time updates where appropriate

### Data Analysis
- Monitor trends and patterns over time
- Identify anomalies and outliers
- Compare performance across servers and backups
- Generate insights and recommendations

## Next Steps

- **Core Operations**: Learn about [Core API Operations](core-operations.md)
- **External APIs**: Explore [External Integration APIs](external-apis.md)
- **Configuration**: Manage [Configuration APIs](configuration-apis.md)
- **Monitoring**: Use [Monitoring APIs](monitoring-apis.md)
- **Administration**: Access [Administration APIs](administration-apis.md)
