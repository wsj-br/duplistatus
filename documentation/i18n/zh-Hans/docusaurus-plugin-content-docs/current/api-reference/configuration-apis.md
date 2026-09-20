# 配置管理 {/* #configuration-management */}

## 获取电子邮件配置 - `/api/configuration/email` {/* #get-email-configuration---apiconfigurationemail */}
- **端点**: `/api/configuration/email`
- **方法**: GET
- **描述**: 检索当前电子邮件通知配置以及是否启用/配置了电子邮件通知。
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
  - `400`: 主密钥无效 - 必须重新配置所有加密密码和设置
  - `401`: 未授权 - 会话或 CSRF 令牌无效
  - `500`: 获取电子邮件配置失败
- **备注**:
  - 出于安全考虑，返回不包含密码的配置
  - 包含 `hasPassword` 字段以指示是否设置了密码
  - 包含 `connectionType` (plain|starttls|ssl)、`senderName`、`fromAddress` 和 `requireAuth` 字段
  - 指示电子邮件通知是否可用于测试和生产用途
  - 优雅地处理主密钥验证错误

## 更新电子邮件配置 - `/api/configuration/email` {/* #update-email-configuration---apiconfigurationemail */}
- **端点**: `/api/configuration/email`
- **方法**: POST
- **描述**: 更新 SMTP 电子邮件通知配置。
- **认证**：需要有效的会话和 CSRF 令牌
- **请求体**：

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

- **响应**：

  ```json
  {
    "success": true,
    "message": "SMTP configuration saved successfully"
  }
  ```

- **错误响应**:
  - `400`: 缺少必需字段或端口号无效
  - `401`: 未授权 - 会话或 CSRF 令牌无效
  - `500`: 保存 SMTP 配置失败
- **备注**:
  - 所有字段 (主机、端口、用户名、密码、mailto) 均为必需
  - 端口必须是 1 到 65535 之间的有效数字
  - 安全字段为布尔值 (SSL/TLS 为 true)
  - 密码通过密码端点单独管理

## 删除电子邮件配置 - `/api/configuration/email` {/* #delete-email-configuration---apiconfigurationemail */}
- **端点**: `/api/configuration/email`
- **方法**: DELETE
- **描述**: 删除 SMTP 电子邮件通知配置。
- **身份验证**：需要有效的会话和 CSRF 令牌
- **响应**：

  ```json
  {
    "success": true,
    "message": "SMTP configuration deleted successfully"
  }
  ```

- **错误响应**:
  - `401`: 未授权 - 会话或 CSRF 令牌无效
  - `404`: 未找到要删除的 SMTP 配置
  - `500`: 删除 SMTP 配置失败
- **备注**:
  - 此操作将永久删除 SMTP 配置
  - 如果不存在要删除的配置，则返回 404
  - 启用每日摘要模式时返回 400，因为该模式需要 SMTP

## 更新电子邮件密码 - `/api/configuration/email/password` {/* #update-email-password---apiconfigurationemailpassword */}
- **端点**: `/api/configuration/email/password`
- **方法**: PATCH
- **描述**: 更新 SMTP 身份验证的电子邮件密码。
- **认证**：需要有效的会话和 CSRF 令牌
- **请求体**：

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

- **响应**：

  ```json
  {
    "message": "Email password updated successfully"
  }
  ```

- **错误响应**:
  - `400`: 密码必须为字符串或缺少必需的配置字段
  - `401`: 未授权 - 会话或 CSRF 令牌无效
  - `500`: 更新电子邮件密码失败
- **备注**:
  - 密码可以为空字符串以清除密码
  - 如果不存在 SMTP 配置，则根据提供的配置创建最小配置
  - 当不存在现有 SMTP 配置时，配置参数为必需
  - 密码使用加密安全存储

## 获取电子邮件密码 CSRF 令牌 - `/api/configuration/email/password` {/* #get-email-password-csrf-token---apiconfigurationemailpassword */}
- **端点**: `/api/configuration/email/password`
- **方法**: GET
- **描述**: 检索用于电子邮件密码操作的 CSRF 令牌。
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
  - 会话必须有效才能生成令牌

## 获取统一配置 - `/api/configuration/unified` {/* #get-unified-configuration---apiconfigurationunified */}
- **端点**: `/api/configuration/unified`
- **方法**: GET
- **描述**: 检索包含所有配置数据的统一配置对象，包括 cron 设置、通知频率和具有备份的服务器。
- **身份验证**：需要有效的会话和 CSRF 令牌
- **响应**：

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
      },
      "dailySummary": {
        "email": {
          "title": "Daily Backup Summary — {summary_date} — ✅ {success_count} Success, ⚠️ {warning_count} Warning, 🕑 {overdue_count} Overdue, 🛑 {error_count} Error, ❌ {fatal_count} Fatal",
          "message": "## Daily backup summary"
        }
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

- **错误响应**：
  - `500`：服务器错误获取统一配置
- **备注**：
  - 在单个响应中返回所有配置数据
  - 包括 cron 设置、通知频率和具有备份的服务器
  - 电子邮件配置包含 `hasPassword` 字段但不包含实际密码
  - 并行获取所有数据以获得更好的性能

## 获取 NTFY 配置 - `/api/configuration/ntfy` {/* #get-ntfy-configuration---apiconfigurationntfy */}
- **端点**：`/api/configuration/ntfy`
- **方法**：GET
- **描述**：检索当前 NTFY 配置设置。
- **身份验证**：需要有效的会话和 CSRF 令牌
- **响应**：

  ```json
  {
    "ntfy": {
      "url": "https://ntfy.sh",
      "topic": "duplistatus-notifications",
      "accessToken": "optional-access-token"
    }
  }
  ```

- **错误响应**：
  - `401`：未授权 - 无效会话或 CSRF 令牌
  - `500`：获取 NTFY 配置失败
- **备注**：
  - 返回当前 NTFY 配置设置
  - 用于通知系统管理
  - 访问配置数据需要身份验证

## 获取通知配置 - `/api/configuration/notifications` {/* #get-notification-configuration---apiconfigurationnotifications */}
- **端点**：`/api/configuration/notifications`
- **方法**：GET
- **描述**：检索当前通知频率配置。
- **身份验证**：需要有效的会话和 CSRF 令牌
- **响应**：

  ```json
  {
    "value": "every_day"
  }
  ```

- **错误响应**：
  - `401`：未授权 - 无效会话或 CSRF 令牌
  - `500`：获取配置失败
- **备注**：
  - 检索当前通知频率配置
  - 用于过期备份通知管理
  - 返回以下之一：`"onetime"`，`"every_day"`，`"every_week"`，`"every_month"`

## 更新通知配置 - `/api/configuration/notifications` {/* #update-notification-configuration---apiconfigurationnotifications */}
- **端点**：`/api/configuration/notifications`
- **方法**：POST
- **描述**：更新通知配置（NTFY 设置或通知频率）。
- **身份验证**：需要有效的会话和 CSRF 令牌
- **请求体**：
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

- **响应**：
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

- **可用值**：`"onetime"`，`"every_day"`，`"every_week"`，`"every_month"`
- **错误响应**：
  - `401`：未授权 - 无效会话或 CSRF 令牌
  - `400`：NTFY 配置是必需的或值无效
  - `500`：更新通知配置时服务器错误
- **备注**：
  - 支持 NTFY 配置和通知频率更新
  - 提供 ntfy 字段时仅更新 NTFY 配置
  - 提供 value 字段时更新通知频率
  - 如果未提供则生成默认主题
  - 保留现有配置设置
  - 使用 `accessToken` 字段而不是单独的用户名/密码字段
  - 根据允许的选项验证通知频率值
  - 影响过期通知发送的频率

## 更新备份设置 - `/api/configuration/backup-settings` {/* #update-backup-settings---apiconfigurationbackup-settings */}
- **端点**：`/api/configuration/backup-settings`
- **方法**：POST
- **描述**：更新特定服务器/备份的备份通知设置。
- **认证**：需要有效的会话和 CSRF 令牌
- **请求体**：

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

- **响应**：

  ```json
  {
    "message": "Backup settings updated successfully"
  }
  ```

- **错误响应**：
  - `401`：未授权 - 无效会话或 CSRF 令牌
  - `400`：backupSettings 是必需的
  - `500`：更新备份设置时服务器错误
- **备注**：
  - 更新特定服务器/备份的备份通知设置
  - 清理已禁用备份的过期备份通知
  - 超时设置更改时清除通知

## 更新通知模板 - `/api/configuration/templates` {/* #update-notification-templates---apiconfigurationtemplates */}
- **端点**：`/api/configuration/templates`
- **方法**：POST
- **描述**：更新通知模板。
- **认证**：需要有效的会话和 CSRF 令牌
- **请求体**：

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

- **响应**：

  ```json
  {
    "message": "Notification templates updated successfully"
  }
  ```

- **错误响应**：
  - `401`：未授权 - 会话或CSRF令牌无效
  - `400`：模板是必需的
  - `500`：更新通知模板时服务器出错
- **注意事项**：
  - 更新不同备份状态的通知模板
  - 保留现有配置设置
  - 模板支持Markdown邮件正文和`{placeholder}`替换
  - 需要`dailySummary`邮件模板（主题和Markdown正文）

## 每日摘要 - `/api/configuration/daily-summary` {/* #daily-summary---apiconfigurationdaily-summary */}
- **端点**：`/api/configuration/daily-summary`
- **方法**：GET、POST
- **描述**：读取或更新每日摘要模式。GET返回清理后的设置、调度器健康状况、下次发生时间和邮件发送状态。POST保存`enabled`、`utcTime`（`HH:mm` UTC）、`timeZone`（上次保存时浏览器IANA时区）以及可选的`publicUrl`和可选的`smtpRecipient`（为空则使用电子邮件设置中的SMTP收件人）。启用需要有效的SMTP。更改`utcTime`会将`daily-summary-dispatch`更新为`minute hour * * *` UTC并重新加载cron服务。更改计划会设置下一次**未来**发生时间。
- **身份验证**：GET需要有效会话和CSRF令牌。POST需要管理员会话和CSRF令牌。
- **错误响应**：
  - `400`：时间/时区无效、公共URL无效、SMTP收件人无效或缺少SMTP
  - `401`：未授权
  - `500`：读取或更新每日摘要失败

## 发送每日摘要 - `/api/configuration/daily-summary/send` {/* #send-daily-summary---apiconfigurationdaily-summarysend */}
- **端点**：`/api/configuration/daily-summary/send`
- **方法**：POST
- **描述**：立即发送额外的当前状态快照。不会消耗下次计划的发生时间。使用存储的SMTP。当设置了`daily_summary.smtpRecipient`时发送到该地址，否则发送到电子邮件设置中的收件人。不接受请求中的收件人地址。在审计日志（系统）中记录`daily_summary_sent`。
- **身份验证**：需要管理员会话和CSRF令牌

## 重试每日摘要 - `/api/configuration/daily-summary/retry` {/* #retry-daily-summary---apiconfigurationdaily-summaryretry */}
- **端点**：`/api/configuration/daily-summary/retry`
- **方法**：POST
- **描述**：从持久化载荷中重试失败的通道。可选的请求体`{ "occurrenceKey": "..." }`；否则重试最新的邮件发送失败。
- **身份验证**：需要管理员会话和CSRF令牌

## 预览每日摘要 - `/api/configuration/daily-summary/preview` {/* #preview-daily-summary---apiconfigurationdaily-summarypreview */}
- **端点**：`/api/configuration/daily-summary/preview`
- **方法**：POST
- **描述**：渲染当前快照但不发送且不写入发送分类账行。
- **身份验证**：需要有效会话和CSRF令牌

## 获取过期容差 - `/api/configuration/overdue-tolerance` {/* #get-overdue-tolerance---apiconfigurationoverdue-tolerance */}
- **端点**：`/api/configuration/overdue-tolerance`
- **方法**：GET
- **描述**：检索当前过期容差设置。
- **响应**：

  ```json
  {
    "overdue_tolerance": "2h"
  }
  ```

- **错误响应**：
  - `500`：获取过期容差失败
- **注意事项**：
  - 返回当前过期容差设置
  - 用于显示当前配置

## 更新过期容差 - `/api/configuration/overdue-tolerance` {/* #update-overdue-tolerance---apiconfigurationoverdue-tolerance */}
- **端点**：`/api/configuration/overdue-tolerance`
- **方法**：POST
- **描述**：更新过期容差设置。
- **认证**：需要有效的会话和 CSRF 令牌
- **请求体**：

  ```json
  {
    "overdue_tolerance": "2h"
  }
  ```

- **响应**：

  ```json
  {
    "message": "Overdue tolerance updated successfully"
  }
  ```

- **错误响应**：
  - `401`：未授权 - 会话或CSRF令牌无效
  - `400`：overdue_tolerance是必需的
  - `500`：更新过期容差时服务器出错
- **注意事项**：
  - 更新过期容差设置（接受字符串格式如`"1h"`、`"2h"`等；新安装的默认值为`2h`）
  - 影响备份何时被视为过期
  - 由过期备份检查器使用

## 外部API安全 - `/api/configuration/external-api-security` {/* #external-api-security---apiconfigurationexternal-api-security */}
- **端点**：`/api/configuration/external-api-security`
- **方法**：GET、PATCH
- **描述**：读取或更新外部API是否需要密钥，以及`/api/upload`大小和速率限制。
- **身份验证**：需要管理员权限、有效会话和CSRF令牌
- **PATCH请求体**：

  ```json
  {
    "requireApiKey": false,
    "uploadLimits": {
      "enabled": true,
      "maxBytes": 5242880,
      "perMinute": 20,
      "perHour": 200
    }
  }
  ```

## IP白名单 - `/api/configuration/ip-allowlist` {/* #ip-allowlist---apiconfigurationip-allowlist */}
- **端点**: `/api/configuration/ip-allowlist`
- **方法**: GET, PATCH
- **描述**: 读取或更新受信任的代理以及管理员/外部API CIDR白名单。启用管理员列表时，除非当前客户端IP已在列表中（环回地址除外），否则将失败。
- **身份验证**: 需要管理员权限、有效会话和CSRF令牌
