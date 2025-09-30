---
sidebar_position: 4
---

# Configuration APIs

![duplistatus](//img/duplistatus_banner.png)

APIs for managing system configuration including email settings, notifications, and backup preferences.

## Overview

The Configuration APIs allow you to manage various system settings including email configuration, NTFY settings, notification preferences, backup settings, and notification templates.

## Email Configuration

### Get Email Configuration

#### `GET /api/configuration/email`

Returns the current email configuration settings.

##### Response Format

```json
{
  "status": "success",
  "data": {
    "enabled": true,
    "smtp": {
      "host": "smtp.gmail.com",
      "port": 587,
      "secure": false,
      "auth": {
        "user": "your-email@gmail.com",
        "pass": "***"
      }
    },
    "from": "duplistatus@example.com",
    "to": "admin@example.com",
    "subject": "Backup Notification"
  }
}
```

##### Example Usage

```bash
curl -X GET http://localhost:9666/api/configuration/email
```

### Update Email Configuration

#### `PUT /api/configuration/email`

Updates the email configuration settings.

##### Request Format

```json
{
  "enabled": true,
  "smtp": {
    "host": "smtp.gmail.com",
    "port": 587,
    "secure": false,
    "auth": {
      "user": "your-email@gmail.com",
      "pass": "your-app-password"
    }
  },
  "from": "duplistatus@example.com",
  "to": "admin@example.com",
  "subject": "Backup Notification"
}
```

##### Response Format

```json
{
  "status": "success",
  "message": "Email configuration updated successfully"
}
```

##### Example Usage

```bash
curl -X PUT http://localhost:9666/api/configuration/email \
  -H "Content-Type: application/json" \
  -d '{
    "enabled": true,
    "smtp": {
      "host": "smtp.gmail.com",
      "port": 587,
      "secure": false,
      "auth": {
        "user": "your-email@gmail.com",
        "pass": "your-app-password"
      }
    },
    "from": "duplistatus@example.com",
    "to": "admin@example.com",
    "subject": "Backup Notification"
  }'
```

### Delete Email Configuration

#### `DELETE /api/configuration/email`

Removes the email configuration.

##### Response Format

```json
{
  "status": "success",
  "message": "Email configuration deleted successfully"
}
```

##### Example Usage

```bash
curl -X DELETE http://localhost:9666/api/configuration/email
```

### Update Email Password

#### `PUT /api/configuration/email/password`

Updates only the email password.

##### Request Format

```json
{
  "password": "new-app-password"
}
```

##### Response Format

```json
{
  "status": "success",
  "message": "Email password updated successfully"
}
```

##### Example Usage

```bash
curl -X PUT http://localhost:9666/api/configuration/email/password \
  -H "Content-Type: application/json" \
  -d '{"password": "new-app-password"}'
```

### Get Email Password CSRF Token

#### `GET /api/configuration/email/password`

Returns a CSRF token for password updates.

##### Response Format

```json
{
  "status": "success",
  "data": {
    "csrfToken": "abc123def456"
  }
}
```

##### Example Usage

```bash
curl -X GET http://localhost:9666/api/configuration/email/password
```

## NTFY Configuration

### Get NTFY Configuration

#### `GET /api/configuration/ntfy`

Returns the current NTFY configuration settings.

##### Response Format

```json
{
  "status": "success",
  "data": {
    "enabled": true,
    "server": "https://ntfy.sh",
    "topic": "backup-alerts",
    "priority": "default",
    "tags": ["backup", "duplistatus"],
    "auth": {
      "username": "user",
      "password": "***"
    }
  }
}
```

##### Example Usage

```bash
curl -X GET http://localhost:9666/api/configuration/ntfy
```

### Update NTFY Configuration

#### `PUT /api/configuration/ntfy`

Updates the NTFY configuration settings.

##### Request Format

```json
{
  "enabled": true,
  "server": "https://ntfy.sh",
  "topic": "backup-alerts",
  "priority": "high",
  "tags": ["backup", "duplistatus", "production"],
  "auth": {
    "username": "user",
    "password": "password"
  }
}
```

##### Response Format

```json
{
  "status": "success",
  "message": "NTFY configuration updated successfully"
}
```

##### Example Usage

```bash
curl -X PUT http://localhost:9666/api/configuration/ntfy \
  -H "Content-Type: application/json" \
  -d '{
    "enabled": true,
    "server": "https://ntfy.sh",
    "topic": "backup-alerts",
    "priority": "high",
    "tags": ["backup", "duplistatus"]
  }'
```

## Notification Configuration

### Update Notification Configuration

#### `PUT /api/configuration/notifications`

Updates global notification settings.

##### Request Format

```json
{
  "defaultLevel": "warning",
  "frequency": "immediate",
  "quietHours": {
    "enabled": true,
    "start": "22:00",
    "end": "08:00"
  },
  "escalation": {
    "enabled": true,
    "levels": [
      {
        "delay": 3600,
        "level": "warning"
      },
      {
        "delay": 7200,
        "level": "critical"
      }
    ]
  }
}
```

##### Response Format

```json
{
  "status": "success",
  "message": "Notification configuration updated successfully"
}
```

##### Example Usage

```bash
curl -X PUT http://localhost:9666/api/configuration/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "defaultLevel": "warning",
    "frequency": "immediate",
    "quietHours": {
      "enabled": true,
      "start": "22:00",
      "end": "08:00"
    }
  }'
```

## Backup Settings

### Update Backup Settings

#### `PUT /api/configuration/backup-settings`

Updates backup-related settings.

##### Request Format

```json
{
  "retention": {
    "backupLogs": 90,
    "serverData": 365,
    "statistics": 180
  },
  "collection": {
    "autoCollect": true,
    "interval": 3600,
    "timeout": 300
  },
  "validation": {
    "enabled": true,
    "checksum": true,
    "integrity": true
  }
}
```

##### Response Format

```json
{
  "status": "success",
  "message": "Backup settings updated successfully"
}
```

##### Example Usage

```bash
curl -X PUT http://localhost:9666/api/configuration/backup-settings \
  -H "Content-Type: application/json" \
  -d '{
    "retention": {
      "backupLogs": 90,
      "serverData": 365,
      "statistics": 180
    },
    "collection": {
      "autoCollect": true,
      "interval": 3600
    }
  }'
```

## Notification Templates

### Update Notification Templates

#### `PUT /api/configuration/templates`

Updates notification message templates.

##### Request Format

```json
{
  "success": {
    "subject": "Backup Completed Successfully",
    "body": "Backup {{backupName}} on {{serverName}} completed successfully at {{timestamp}}"
  },
  "warning": {
    "subject": "Backup Warning",
    "body": "Backup {{backupName}} on {{serverName}} completed with warnings at {{timestamp}}"
  },
  "error": {
    "subject": "Backup Failed",
    "body": "Backup {{backupName}} on {{serverName}} failed at {{timestamp}}. Error: {{errorMessage}}"
  },
  "overdue": {
    "subject": "Backup Overdue",
    "body": "Backup {{backupName}} on {{serverName}} is overdue by {{overdueDuration}}"
  }
}
```

##### Response Format

```json
{
  "status": "success",
  "message": "Notification templates updated successfully"
}
```

##### Example Usage

```bash
curl -X PUT http://localhost:9666/api/configuration/templates \
  -H "Content-Type: application/json" \
  -d '{
    "success": {
      "subject": "Backup Completed Successfully",
      "body": "Backup {{backupName}} on {{serverName}} completed successfully"
    },
    "error": {
      "subject": "Backup Failed",
      "body": "Backup {{backupName}} on {{serverName}} failed: {{errorMessage}}"
    }
  }'
```

## Overdue Tolerance

### Get Overdue Tolerance

#### `GET /api/configuration/overdue-tolerance`

Returns the current overdue tolerance settings.

##### Response Format

```json
{
  "status": "success",
  "data": {
    "defaultGracePeriod": 3600,
    "perBackupSettings": {
      "daily-backup": 1800,
      "weekly-backup": 7200
    },
    "escalation": {
      "enabled": true,
      "levels": [
        {
          "delay": 3600,
          "action": "warning"
        },
        {
          "delay": 7200,
          "action": "critical"
        }
      ]
    }
  }
}
```

##### Example Usage

```bash
curl -X GET http://localhost:9666/api/configuration/overdue-tolerance
```

### Update Overdue Tolerance

#### `PUT /api/configuration/overdue-tolerance`

Updates the overdue tolerance settings.

##### Request Format

```json
{
  "defaultGracePeriod": 3600,
  "perBackupSettings": {
    "daily-backup": 1800,
    "weekly-backup": 7200,
    "monthly-backup": 14400
  },
  "escalation": {
    "enabled": true,
    "levels": [
      {
        "delay": 3600,
        "action": "warning"
      },
      {
        "delay": 7200,
        "action": "critical"
      }
    ]
  }
}
```

##### Response Format

```json
{
  "status": "success",
  "message": "Overdue tolerance updated successfully"
}
```

##### Example Usage

```bash
curl -X PUT http://localhost:9666/api/configuration/overdue-tolerance \
  -H "Content-Type: application/json" \
  -d '{
    "defaultGracePeriod": 3600,
    "perBackupSettings": {
      "daily-backup": 1800,
      "weekly-backup": 7200
    }
  }'
```

## Unified Configuration

### Get Unified Configuration

#### `GET /api/configuration/unified`

Returns all configuration settings in a single response.

##### Response Format

```json
{
  "status": "success",
  "data": {
    "email": {
      "enabled": true,
      "smtp": {
        "host": "smtp.gmail.com",
        "port": 587
      }
    },
    "ntfy": {
      "enabled": true,
      "server": "https://ntfy.sh",
      "topic": "backup-alerts"
    },
    "notifications": {
      "defaultLevel": "warning",
      "frequency": "immediate"
    },
    "backup": {
      "retention": {
        "backupLogs": 90
      }
    },
    "overdue": {
      "defaultGracePeriod": 3600
    }
  }
}
```

##### Example Usage

```bash
curl -X GET http://localhost:9666/api/configuration/unified
```

## Error Handling

### Common Error Responses

#### Configuration Validation Error
```json
{
  "status": "error",
  "error": "ValidationError",
  "message": "Invalid SMTP port number"
}
```

#### Configuration Not Found
```json
{
  "status": "error",
  "error": "NotFoundError",
  "message": "Configuration not found"
}
```

#### Update Failed
```json
{
  "status": "error",
  "error": "UpdateError",
  "message": "Failed to update configuration"
}
```

## Usage Examples

### JavaScript Integration

```javascript
class DuplistatusConfigAPI {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async getEmailConfig() {
    const response = await fetch(`${this.baseUrl}/api/configuration/email`);
    const data = await response.json();
    
    if (data.status === 'success') {
      return data.data;
    } else {
      throw new Error(data.message);
    }
  }

  async updateEmailConfig(config) {
    const response = await fetch(`${this.baseUrl}/api/configuration/email`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(config)
    });
    
    const data = await response.json();
    
    if (data.status === 'success') {
      return data.message;
    } else {
      throw new Error(data.message);
    }
  }

  async getUnifiedConfig() {
    const response = await fetch(`${this.baseUrl}/api/configuration/unified`);
    const data = await response.json();
    
    if (data.status === 'success') {
      return data.data;
    } else {
      throw new Error(data.message);
    }
  }
}

// Usage
const configAPI = new DuplistatusConfigAPI('http://localhost:9666');

// Get email configuration
const emailConfig = await configAPI.getEmailConfig();
console.log('Email enabled:', emailConfig.enabled);

// Update email configuration
await configAPI.updateEmailConfig({
  enabled: true,
  smtp: {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'your-email@gmail.com',
      pass: 'your-app-password'
    }
  },
  from: 'duplistatus@example.com',
  to: 'admin@example.com'
});
```

### Python Integration

```python
import requests
from typing import Dict, Any

class DuplistatusConfigAPI:
    def __init__(self, base_url: str):
        self.base_url = base_url
    
    def get_email_config(self) -> Dict[str, Any]:
        response = requests.get(f"{self.base_url}/api/configuration/email")
        data = response.json()
        
        if data['status'] == 'success':
            return data['data']
        else:
            raise Exception(data['message'])
    
    def update_email_config(self, config: Dict[str, Any]) -> str:
        response = requests.put(
            f"{self.base_url}/api/configuration/email",
            json=config
        )
        data = response.json()
        
        if data['status'] == 'success':
            return data['message']
        else:
            raise Exception(data['message'])
    
    def get_unified_config(self) -> Dict[str, Any]:
        response = requests.get(f"{self.base_url}/api/configuration/unified")
        data = response.json()
        
        if data['status'] == 'success':
            return data['data']
        else:
            raise Exception(data['message'])

# Usage
config_api = DuplistatusConfigAPI('http://localhost:9666')

# Get email configuration
email_config = config_api.get_email_config()
print(f"Email enabled: {email_config['enabled']}")

# Update email configuration
config_api.update_email_config({
    'enabled': True,
    'smtp': {
        'host': 'smtp.gmail.com',
        'port': 587,
        'secure': False,
        'auth': {
            'user': 'your-email@gmail.com',
            'pass': 'your-app-password'
        }
    },
    'from': 'duplistatus@example.com',
    'to': 'admin@example.com'
})
```

## Best Practices

### Security
- Never log sensitive configuration data
- Use secure connections for SMTP
- Implement proper authentication
- Regularly rotate passwords

### Configuration Management
- Backup configuration before changes
- Test configuration changes in development
- Document configuration changes
- Use version control for configuration

### Error Handling
- Validate configuration data
- Handle network errors gracefully
- Implement retry logic for transient failures
- Log configuration changes

## Next Steps

- **Core Operations**: Learn about [Core API Operations](core-operations.md)
- **External APIs**: Explore [External Integration APIs](external-apis.md)
- **Monitoring**: Use [Monitoring APIs](monitoring-apis.md)
- **Administration**: Access [Administration APIs](administration-apis.md)
- **Chart Data**: Retrieve [Chart Data APIs](chart-data-apis.md)
