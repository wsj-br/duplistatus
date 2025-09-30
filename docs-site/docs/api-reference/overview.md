---
sidebar_position: 1
---

# API Reference Overview

![duplistatus](//img/duplistatus_banner.png)

This document provides an overview of the duplistatus API and its capabilities.

## Introduction

The duplistatus API is a RESTful API that provides comprehensive access to backup monitoring, notification management, and system administration capabilities. The API follows standard HTTP conventions and returns JSON responses.

## API Structure

The API is organized into logical groups:

- **[Core Operations](core-operations.md)**: Upload, retrieval, and management of backup data
- **[External APIs](external-apis.md)**: APIs designed for external integrations (e.g., Homepage)
- **[Configuration APIs](configuration-apis.md)**: Notification settings, backup preferences, and system configuration
- **[Monitoring APIs](monitoring-apis.md)**: Health checks, status monitoring, and overdue backup tracking
- **[Administration APIs](administration-apis.md)**: Database maintenance, cleanup operations, and system management
- **[Chart Data APIs](chart-data-apis.md)**: Time-series data for visualization and analytics

## Base URL

All API endpoints are relative to your duplistatus installation:

```
http://your-server:9666/api/
```

## Authentication

Currently, the API does not require authentication. However, it's recommended to:

- Run duplistatus behind a reverse proxy with authentication
- Use firewall rules to restrict access
- Consider implementing API authentication in future versions

## Response Format

All API responses are returned in JSON format with consistent error handling patterns.

### Success Response

```json
{
  "status": "success",
  "data": {
    // Response data
  }
}
```

### Error Response

```json
{
  "status": "error",
  "error": "Error type",
  "message": "Human-readable error message"
}
```

## HTTP Status Codes

The API uses standard HTTP status codes:

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request parameters
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

## Rate Limiting

Currently, there are no rate limits implemented. However, it's recommended to:

- Implement reasonable request intervals
- Avoid excessive polling
- Use webhooks where possible for real-time updates

## CORS Support

The API supports Cross-Origin Resource Sharing (CORS) for web applications:

- All origins are allowed by default
- All HTTP methods are supported
- All headers are allowed

## Data Types

### Common Data Types

#### Timestamps
All timestamps are in ISO 8601 format:
```json
"2024-01-15T10:30:00.000Z"
```

#### Durations
Durations are in seconds:
```json
3600
```

#### File Sizes
File sizes are in bytes:
```json
1073741824
```

#### Status Values
Common status values:
- `"success"`: Operation completed successfully
- `"warning"`: Operation completed with warnings
- `"error"`: Operation failed
- `"fatal"`: Critical operation failure

## Error Handling

### Common Error Types

#### Validation Errors
```json
{
  "status": "error",
  "error": "ValidationError",
  "message": "Invalid server ID format"
}
```

#### Not Found Errors
```json
{
  "status": "error",
  "error": "NotFoundError",
  "message": "Server not found"
}
```

#### Server Errors
```json
{
  "status": "error",
  "error": "InternalServerError",
  "message": "Database connection failed"
}
```

## API Versioning

The API is currently at version 1. Future versions will be available at:

```
/api/v2/
```

## SDKs and Libraries

Currently, there are no official SDKs available. However, the API is designed to be easily consumed by:

- JavaScript/TypeScript applications
- Python applications
- Go applications
- Any language with HTTP client support

## Examples

### Basic Usage

#### Get All Servers
```bash
curl -X GET http://localhost:9666/api/servers
```

#### Get Server Details
```bash
curl -X GET http://localhost:9666/api/servers/1
```

#### Update Server
```bash
curl -X PUT http://localhost:9666/api/servers/1 \
  -H "Content-Type: application/json" \
  -d '{"alias": "My Server", "notes": "Production server"}'
```

### JavaScript Example

```javascript
// Get all servers
const response = await fetch('http://localhost:9666/api/servers');
const data = await response.json();

if (data.status === 'success') {
  console.log('Servers:', data.data);
} else {
  console.error('Error:', data.message);
}
```

### Python Example

```python
import requests

# Get all servers
response = requests.get('http://localhost:9666/api/servers')
data = response.json()

if data['status'] == 'success':
    print('Servers:', data['data'])
else:
    print('Error:', data['message'])
```

## Best Practices

### Request Optimization
- Use appropriate HTTP methods (GET for retrieval, POST for creation, PUT for updates, DELETE for removal)
- Include only necessary data in requests
- Use pagination for large datasets
- Implement caching where appropriate

### Error Handling
- Always check the response status
- Handle network errors gracefully
- Implement retry logic for transient failures
- Log errors for debugging

### Security
- Validate all input data
- Use HTTPS in production
- Implement proper access controls
- Monitor API usage

## Integration Examples

### Homepage Integration

#### Summary Widget
```yaml
- duplistatus:
    title: Backup Status
    url: http://localhost:9666
    api: /api/summary
```

#### Server Status Widget
```yaml
- duplistatus:
    title: Server Status
    url: http://localhost:9666
    api: /api/servers
    server: 1
```

### Monitoring Integration

#### Prometheus Metrics
```bash
# Export metrics to Prometheus
curl -X GET http://localhost:9666/api/health | prometheus_exporter
```

#### Grafana Dashboard
```json
{
  "dashboard": {
    "title": "Duplistatus Metrics",
    "panels": [
      {
        "title": "Backup Success Rate",
        "type": "stat",
        "targets": [
          {
            "expr": "duplistatus_backup_success_rate"
          }
        ]
      }
    ]
  }
}
```

## Support

### Documentation
- **API Reference**: Complete API documentation
- **Examples**: Code examples and integration guides
- **Changelog**: API changes and updates

### Community
- **GitHub Issues**: [Report bugs or request features](https://github.com/wsj-br/duplistatus/issues)
- **GitHub Discussions**: [Community support](https://github.com/wsj-br/duplistatus/discussions)

### Professional Support
- **Enterprise Support**: Available for enterprise customers
- **Consulting**: Custom integration services
- **Training**: API training and workshops

## Next Steps

- **Core Operations**: Learn about [Core API Operations](core-operations.md)
- **External APIs**: Explore [External Integration APIs](external-apis.md)
- **Configuration**: Manage [Configuration APIs](configuration-apis.md)
- **Monitoring**: Use [Monitoring APIs](monitoring-apis.md)
- **Administration**: Access [Administration APIs](administration-apis.md)
- **Chart Data**: Retrieve [Chart Data APIs](chart-data-apis.md)
