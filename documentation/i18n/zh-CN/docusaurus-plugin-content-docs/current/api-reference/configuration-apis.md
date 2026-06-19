# 配置管理 {#configuration-management}

## 获取邮件配置 - `/api/configuration/email` {#get-email-configuration---apiconfigurationemail}
- **端点**: `/api/configuration/email`
- **方法**: GET
- **描述**: 检索当前的邮件通知配置，以及邮件通知是否已启用/配置。
- **身份验证**: 需要有效的会话和 CSRF 令牌
- **响应** (已配置):

  ```json
  {
    "configured": true,
    "config": {
      "host": "smtp.example.com",
      "port": 465,
      "connectionType": "ssl",
      "username": "user@example.com",
      "mailto": "admin@example.com",
      "senderName": "duplistatus",
      "fromAddress": "user@example.com",
      "requireAuth": true,
      "hasPassword": true
    },
    "message": "Email is configured and ready to use."
  }
  ```

- **响应** (未配置):

  ```json
  {
    "configured": false,
    "config": null,
    "message": "Email is not configured. Please configure SMTP settings."
  }
  ```

- **错误响应**:
  - `400`: 主密钥无效 - 所有加密的密码和设置必须重新配置
  - `401`: 未授权 - 无效的会话或 CSRF 令牌
  - `500`: 获取邮件配置失败
- **备注**:
  - 出于安全考虑，返回的配置不包含密码
  - 包含 `hasPassword` 字段以指示是否设置了密码
  - 包含 `connectionType` (plain|starttls|ssl)、`senderName`、`fromAddress` 和 `requireAuth` 字段
  - 指示邮件通知是否可用于测试和生产环境
  - 优雅地处理主密钥验证错误

## 更新邮件配置 - `/api/configuration/email` {#update-email-configuration---apiconfigurationemail}
- **端点**: `/api/configuration/email`
- **方法**: POST
- **描述**: 更新 SMTP 邮件通知配置。
- **身份验证**: 需要有效的会话和 CSRF 令牌
- **请求正文**:

  ```json
  {
    "host": "smtp.example.com",
    "port": 465,
    "secure": true,
    "username": "user@example.com",
    "password": "password",
    "mailto": "admin@example.com"
  }
  ```

- **响应**:

  ```json
  {
    "success": true,
    "message": "SMTP configuration saved successfully"
  }
  ```

- **错误响应**:
  - `400`: 缺少必填字段或端口数字无效
  - `401`: 未授权 - 无效的会话或 CSRF 令牌
  - `500`: 保存 SMTP 配置失败
- **备注**:
  - 所有字段 (host, port, username, password, mailto) 均为必填
  - 端口必须是 1 到 65535 之间的有效数字
  - Secure 字段为布尔值 (SSL/TLS 为 true)
  - 密码通过密码端点单独管理

## 删除邮件配置 - `/api/configuration/email` {#delete-email-configuration---apiconfigurationemail}
- **端点**: `/api/configuration/email`
- **方法**: DELETE
- **描述**: 删除 SMTP 邮件通知配置。
- **身份验证**: 需要有效的会话和 CSRF 令牌
- **响应**:

  ```json
  {
    "success": true,
    "message": "SMTP configuration deleted successfully"
  }
  ```

- **错误响应**:
  - `401`: 未授权 - 无效的会话或 CSRF 令牌
  - `404`: 未找到可删除的 SMTP 配置
  - `500`: 删除 SMTP 配置失败
- **备注**:
  - 此操作将永久删除 SMTP 配置
  - 如果不存在可删除的配置，则返回 404

## 更新邮件密码 - `/api/configuration/email/password` {#update-email-password---apiconfigurationemailpassword}
- **端点**: `/api/configuration/email/password`
- **方法**: PATCH
- **描述**: 更新用于 SMTP 身份验证的邮件密码。
- **身份验证**: 需要有效的会话和 CSRF 令牌
- **请求正文**:

  ```json
  {
    "password": "new-password",
    "config": {
      "host": "smtp.example.com",
      "port": 465,
      "secure": true,
      "username": "user@example.com",
      "mailto": "admin@example.com"
    }
  }
  ```

- **响应**:

  ```json
  {
    "message": "Email password updated successfully"
  }
  ```

- **错误响应**:
  - `400`: 密码必须为字符串或缺少必填配置字段
  - `401`: 未授权 - 无效的会话或 CSRF 令牌
  - `500`: 更新邮件密码失败
- **备注**:
  - 密码可以为空字符串以清除密码
  - 如果不存在 SMTP 配置，则根据提供的配置创建一个最小配置
  - 当不存在现有 SMTP 配置时，Config 参数为必填
  - 密码使用加密方式安全存储

## 获取邮件密码 CSRF 令牌 - `/api/configuration/email/password` {#get-email-password-csrf-token---apiconfigurationemailpassword}
- **端点**: `/api/configuration/email/password`
- **方法**: GET
- **描述**: 检索用于邮件密码操作的 CSRF 令牌。
- **身份验证**: 需要有效的会话
- **响应**:

  ```json
  {
    "csrfToken": "csrf-token-string"
  }
  ```

- **错误响应**:
  - `401`: 会话无效或已过期
  - `500`: 生成 CSRF 令牌失败
- **备注**:
  - 返回用于密码更新操作的 CSRF 令牌
  - 生成令牌必须拥有有效的会话

## 获取统一配置 - `/api/configuration/unified` {#get-unified-configuration---apiconfigurationunified}
- **端点**: `/api/configuration/unified`
- **方法**: GET
- **描述**: 检索包含所有配置数据的统一配置对象，包括 cron 设置、通知频率和带有备份的服务器。
- **身份验证**: 需要有效的会话和 CSRF 令牌
- **响应**:

  ```json
  {
    "ntfy": {
      "url": "https://ntfy.sh",
      "topic": "duplistatus-notifications",
      "accessToken": ""
    },
    "templates": {
      "language": "en-GB",
      "success": {
        "title": "✅ {status} - {backup_name} @ {server_name}",
        "message": "Backup {backup_name} on {server_name} completed with status '{status}' at {backup_date} in {duration}.",
        "priority": "default",
        "tags": "duplicati, duplistatus, success"
      },
      "warning": {
        "title": "⚠️ {status} - {backup_name} @ {server_name}",
        "message": "Backup {backup_name} on {server_name} completed with status '{status}' at {backup_date}.",
        "priority": "high",
        "tags": "duplicati, duplistatus, warning, error"
      },
      "overdueBackup": {
        "title": "🕑 Overdue - {backup_name} @ {server_name}",
        "message": "The backup {backup_name} is overdue on {server_name}.",
        "priority": "default",
        "tags": "duplicati, duplistatus, overdue"
      }
    },
    "email": {
      "host": "smtp.example.com",
      "port": 465,
      "connectionType": "ssl",
      "username": "user@example.com",
      "mailto": "admin@example.com",
      "senderName": "duplistatus",
      "fromAddress": "user@example.com",
      "requireAuth": true,
      "hasPassword": true
    },
    "overdue_tolerance": "2h",
    "backup_settings": {
      "server1:backup1": {
        "notificationEvent": "all",
        "expectedInterval": 24,
        "overdueBackupCheckEnabled": true,
        "intervalUnit": "hours",
        "expectedBackupDate": "2025-02-07T00:00:00.000Z",
        "lastBackupDate": "2025-02-06T00:00:00.000Z"
      }
    },
    "serverAddresses": [
      {
        "id": "server1",
        "name": "Server 1",
        "server_url": "http://localhost:8200"
      }
    ],
    "cronConfig": {
      "cronExpression": "*/20 * * * *",
      "enabled": true
    },
    "notificationFrequency": "every_day",
    "serversWithBackups": [
      {
        "id": "server1",
        "name": "Server 1",
        "backupName": "backup1",
        "server_url": "http://localhost:8200",
        "alias": "My Server",
        "note": "Primary backup server",
        "hasPassword": true,
        "expectedBackupDate": "2025-02-07T00:00:00.000Z",
        "lastBackupDate": "2025-02-06T00:00:00.000Z"
      }
    ]
  }
  ```

- **错误响应**:
  - `500`: 获取统一配置时发生服务器错误
- **备注**:
  - 在单个响应中返回所有配置数据
  - 包括 cron 设置、通知频率和带有备份的服务器
  - 邮件配置包含 `hasPassword` 字段，但不包含实际密码
  - 并行获取所有数据以提高性能

## 获取 NTFY 配置 - `/api/configuration/ntfy` {#get-ntfy-configuration---apiconfigurationntfy}
- **端点**: `/api/configuration/ntfy`
- **方法**: GET
- **描述**: 检索当前的 NTFY 配置设置。
- **身份验证**: 需要有效的会话和 CSRF 令牌
- **响应**:

  ```json
  {
    "ntfy": {
      "url": "https://ntfy.sh",
      "topic": "duplistatus-notifications",
      "accessToken": "optional-access-token"
    }
  }
  ```

- **错误响应**:
  - `401`: 未授权 - 会话或 CSRF 令牌无效
  - `500`: 获取 NTFY 配置失败
- **备注**:
  - 返回当前的 NTFY 配置设置
  - 用于通知系统管理
  - 访问配置数据需要身份验证

## 获取通知配置 - `/api/configuration/notifications` {#get-notification-configuration---apiconfigurationnotifications}
- **端点**: `/api/configuration/notifications`
- **方法**: GET
- **描述**: 检索当前的通知频率配置。
- **身份验证**: 需要有效的会话和 CSRF 令牌
- **响应**:

  ```json
  {
    "value": "every_day"
  }
  ```

- **错误响应**:
  - `401`: 未授权 - 会话或 CSRF 令牌无效
  - `500`: 获取配置失败
- **备注**:
  - 检索当前的通知频率配置
  - 用于逾期备份通知管理
  - 返回以下值之一：`"onetime"`, `"every_day"`, `"every_week"`, `"every_month"`

## 更新通知配置 - `/api/configuration/notifications` {#update-notification-configuration---apiconfigurationnotifications}
- **端点**: `/api/configuration/notifications`
- **方法**: POST
- **描述**: 更新通知配置（NTFY 设置或通知频率）。
- **身份验证**: 需要有效的会话和 CSRF 令牌
- **请求体**:
  对于 NTFY 配置：

  ```json
  {
    "ntfy": {
      "enabled": true,
      "url": "https://ntfy.sh",
      "topic": "duplistatus-notifications",
      "accessToken": "optional-access-token"
    }
  }
  ```

对于通知频率：

  ```json
  {
    "value": "every_week"
  }
  ```

- **响应**:
  对于 NTFY 配置：

  ```json
  {
    "message": "Notification config updated successfully",
    "ntfy": {
      "enabled": true,
      "url": "https://ntfy.sh",
      "topic": "duplistatus-notifications",
      "accessToken": "optional-access-token"
    }
  }
  ```

对于通知频率：

  ```json
  {
    "value": "every_week"
  }
  ```

- **可用值**: `"onetime"`, `"every_day"`, `"every_week"`, `"every_month"`
- **错误响应**:
  - `401`: 未授权 - 会话或 CSRF 令牌无效
  - `400`: 需要 NTFY 配置或值为无效值
  - `500`: 更新通知配置时发生服务器错误
- **备注**:
  - 支持 NTFY 配置和通知频率更新
  - 当提供 ntfy 字段时，仅更新 NTFY 配置
  - 当提供 value 字段时，更新通知频率
  - 如果未提供主题，则生成默认主题
  - 保留现有的配置设置
  - 使用 `accessToken` 字段而非单独的用户名/密码字段
  - 根据允许的选项验证通知频率值
  - 影响逾期通知的发送频率

## 更新备份设置 - `/api/configuration/backup-settings` {#update-backup-settings---apiconfigurationbackup-settings}
- **端点**: `/api/configuration/backup-settings`
- **方法**: POST
- **描述**: 更新特定服务器/备份的备份通知设置。
- **身份验证**: 需要有效的会话和 CSRF 令牌
- **请求正文**:

  ```json
  {
    "backupSettings": {
      "Server Name:Backup Name": {
        "notificationEvent": "all",
        "expectedInterval": 24,
        "overdueBackupCheckEnabled": true,
        "intervalUnit": "hours"
      }
    }
  }
  ```

- **响应**:

  ```json
  {
    "message": "Backup settings updated successfully"
  }
  ```

- **错误响应**:
  - `401`: 未授权 - 会话或 CSRF 令牌无效
  - `400`: 需要 backupSettings
  - `500`: 更新备份设置时发生服务器错误
- **备注**：
  - 更新特定服务器/备份的备份通知设置
  - 清理已禁用备份的逾期备份通知
  - 在超时设置更改时清除通知

## 更新通知模板 - `/api/configuration/templates` {#update-notification-templates---apiconfigurationtemplates}
- **端点**：`/api/configuration/templates`
- **方法**：POST
- **描述**：更新通知模板。
- **身份验证**: 需要有效的会话和 CSRF 令牌
- **请求正文**:

  ```json
  {
    "templates": {
      "success": {
        "title": "✅ {status} - {backup_name} @ {server_name}",
        "message": "Backup {backup_name} on {server_name} completed with status '{status}' at {backup_date} in {duration}.",
        "priority": "default",
        "tags": "duplicati, duplistatus, success"
      }
    }
  }
  ```

- **响应**:

  ```json
  {
    "message": "Notification templates updated successfully"
  }
  ```

- **错误响应**：
  - `401`：未授权 - 无效的会话或 CSRF 令牌
  - `400`：需要模板
  - `500`：更新通知模板时出现服务器错误
- **备注**：
  - 更新不同备份状态的通知模板
  - 保留现有配置设置
  - 模板支持变量替换

## 获取逾期容忍度 - `/api/configuration/overdue-tolerance` {#get-overdue-tolerance---apiconfigurationoverdue-tolerance}
- **端点**：`/api/configuration/overdue-tolerance`
- **方法**：GET
- **描述**：检索当前逾期容忍度设置。
- **响应**:

  ```json
  {
    "overdue_tolerance": "2h"
  }
  ```

- **错误响应**：
  - `500`：获取逾期容忍度失败
- **备注**：
  - 返回当前逾期容忍度设置
  - 用于显示当前配置

## 更新逾期容忍度 - `/api/configuration/overdue-tolerance` {#update-overdue-tolerance---apiconfigurationoverdue-tolerance}
- **端点**：`/api/configuration/overdue-tolerance`
- **方法**：POST
- **描述**：更新逾期容忍度设置。
- **身份验证**: 需要有效的会话和 CSRF 令牌
- **请求正文**:

  ```json
  {
    "overdue_tolerance": "2h"
  }
  ```

- **响应**:

  ```json
  {
    "message": "Overdue tolerance updated successfully"
  }
  ```

- **错误响应**：
  - `401`：未授权 - 无效的会话或 CSRF 令牌
  - `400`：需要 overdue_tolerance
  - `500`：更新逾期容忍度时出现服务器错误
- **备注**：
  - 更新逾期容忍度设置（接受字符串格式如 `"1h"`、`"2h"` 等；新安装的默认值为 `2h`）
  - 影响备份被视为逾期的时间
  - 由逾期备份检查器使用
