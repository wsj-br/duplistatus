# 配置管理 {/* #configuration-management */}

## 获取电子邮件配置 - `/api/configuration/email` {/* #get-email-configuration---apiconfigurationemail */}
- **端点**: `/api/configuration/email`
- **方法**: GET
- **描述**: 检索当前电子邮件通知配置以及电子邮件通知是否已启用/配置。
- **认证**: 需要有效的会话和CSRF令牌
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
  - `401`: 未授权 - 会话或CSRF令牌无效
  - `500`: 获取电子邮件配置失败
- **注意事项**:
  - 为安全起见，返回不带密码的配置
  - 包括`hasPassword`字段以指示密码是否已设置
  - 包括`connectionType` (plain|starttls|ssl), `senderName`, `fromAddress`, 和 `requireAuth`字段
  - 指示电子邮件通知是否可用于测试和生产使用
  - 优雅地处理主密钥验证错误

## 更新电子邮件配置 - `/api/configuration/email` {/* #update-email-configuration---apiconfigurationemail */}
- **端点**: `/api/configuration/email`
- **方法**: POST
- **描述**: 更新SMTP电子邮件通知配置。
- **认证**: 需要有效的会话和CSRF令牌
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
  - `400`: 缺少必填字段或端口号无效
  - `401`: 未授权 - 会话或CSRF令牌无效
  - `500`: 保存SMTP配置失败
- **注意事项**:
  - 所有字段（主机、端口、用户名、密码、mailto）都是必填的
  - 端口必须是1到65535之间的有效数字
  - 安全字段是布尔值（SSL/TLS为true）
  - 密码通过密码端点单独管理

## 删除电子邮件配置 - `/api/configuration/email` {/* #delete-email-configuration---apiconfigurationemail */}
- **端点**: `/api/configuration/email`
- **方法**: DELETE
- **描述**: 删除SMTP电子邮件通知配置。
- **认证**: 需要有效会话和CSRF令牌
- **响应**:

  ```json
  {
    "success": true,
    "message": "SMTP configuration deleted successfully"
  }
  ```

- **错误响应**:
  - `401`: 未授权 - 会话或CSRF令牌无效
  - `404`: 未找到要删除的SMTP配置
  - `500`: 删除SMTP配置失败
- **注意事项**:
  - 此操作永久删除SMTP配置
  - 如果没有要删除的配置，则返回404
  - 当每日摘要模式启用时，返回400，因为该模式需要SMTP

## 更新电子邮件密码 - `/api/configuration/email/password` {/* #update-email-password---apiconfigurationemailpassword */}
- **端点**: `/api/configuration/email/password`
- **方法**: PATCH
- **描述**: 更新SMTP认证的电子邮件密码。
- **认证**: 需要有效的会话和CSRF令牌
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
  - `400`: 密码必须是字符串或缺少必填配置字段
  - `401`: 未授权 - 会话或CSRF令牌无效
  - `500`: 更新电子邮件密码失败
- **注意事项**:
  - 密码可以是空字符串以清除密码
  - 如果不存在SMTP配置，则从提供的配置创建最小配置
  - 当不存在现有SMTP配置时，配置参数是必需的
  - 密码使用加密安全存储

## 获取电子邮件密码CSRF令牌 - `/api/configuration/email/password` {/* #get-email-password-csrf-token---apiconfigurationemailpassword */}
- **端点**: `/api/configuration/email/password`
- **方法**: GET
- **描述**: 检索电子邮件密码操作的CSRF令牌。
- **认证**: 需要有效的会话
- **响应**:

  ```json
  {
    "csrfToken": "csrf-token-string"
  }
  ```

- **错误响应**:
  - `401`: 无效或过期的会话
  - `500`: 生成CSRF令牌失败
- **注意事项**:
  - 返回用于密码更新操作的CSRF令牌
  - 必须有效的会话才能生成令牌

## 获取统一配置 - `/api/configuration/unified` {/* #get-unified-configuration---apiconfigurationunified */}
- **端点**: `/api/configuration/unified`
- **方法**: GET
- **描述**: 检索包含所有配置数据的统一配置对象，包括 cron 设置、通知频率和具有备份的服务器。
- **认证**: 需要有效会话和CSRF令牌
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

- **错误响应**:
  - `500`: 服务器错误获取统一配置
- **注意事项**:
  - 在单个响应中返回所有配置数据
  - 包括 cron 设置、通知频率和具有备份的服务器
  - 电子邮件配置包括 `hasPassword` 字段但不包括实际密码
  - 并行获取所有数据以提高性能

## 获取 NTFY 配置 - `/api/configuration/ntfy` {/* #get-ntfy-configuration---apiconfigurationntfy */}
- **端点**: `/api/configuration/ntfy`
- **方法**: GET
- **描述**: 检索当前的 NTFY 配置设置。
- **认证**: 需要有效会话和CSRF令牌
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
  - `401`: 未授权 - 会话无效或 CSRF 令牌无效
  - `500`: 获取 NTFY 配置失败
- **注意事项**:
  - 返回当前的 NTFY 配置设置
  - 用于通知系统管理
  - 需要身份验证才能访问配置数据

## 获取通知配置 - `/api/configuration/notifications` {/* #get-notification-configuration---apiconfigurationnotifications */}
- **端点**: `/api/configuration/notifications`
- **方法**: GET
- **描述**: 检索当前的通知频率配置。
- **认证**: 需要有效会话和CSRF令牌
- **响应**:

  ```json
  {
    "value": "every_day"
  }
  ```

- **错误响应**:
  - `401`: 未授权 - 会话无效或 CSRF 令牌无效
  - `500`: 获取配置失败
- **注意事项**:
  - 检索当前的通知频率配置
  - 用于过期备份通知管理
  - 返回以下之一: `"onetime"`, `"every_day"`, `"every_week"`, `"every_month"`

## 更新通知配置 - `/api/configuration/notifications` {/* #update-notification-configuration---apiconfigurationnotifications */}
- **端点**: `/api/configuration/notifications`
- **方法**: POST
- **描述**: 更新通知配置（NTFY 设置或通知频率）。
- **身份验证**: 需要有效的会话和 CSRF 令牌
- **请求正文**:
  对于 NTFY 配置:

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

对于通知频率:

  ```json
  {
    "value": "every_week"
  }
  ```

- **响应**:
  对于 NTFY 配置:

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

对于通知频率:

  ```json
  {
    "value": "every_week"
  }
  ```

- **可用值**: `"onetime"`, `"every_day"`, `"every_week"`, `"every_month"`
- **错误响应**:
  - `401`: 未授权 - 会话无效或 CSRF 令牌无效
  - `400`: NTFY 配置为必填项或值无效
  - `500`: 服务器错误更新通知配置
- **注意事项**:
  - 支持 NTFY 配置和通知频率更新
  - 当提供 ntfy 字段时仅更新 NTFY 配置
  - 当提供 value 字段时更新通知频率
  - 如果未提供主题，则生成默认主题
  - 保留现有配置设置
  - 使用 `accessToken` 字段而不是单独的用户名/密码字段
  - 验证通知频率值是否与允许的选项匹配
  - 影响过期通知的发送频率

## 更新备份设置 - `/api/configuration/backup-settings` {/* #update-backup-settings---apiconfigurationbackup-settings */}
- **端点**: `/api/configuration/backup-settings`
- **方法**: POST
- **描述**: 更新特定服务器/备份的备份通知设置。
- **认证**: 需要有效的会话和CSRF令牌
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
  - `401`: 未授权 - 会话无效或 CSRF 令牌无效
  - `400`: backupSettings 为必填项
  - `500`: 服务器错误更新备份设置
- **注意**:
  - 更新特定服务器/备份的备份通知设置
  - 清理已禁用备份的过期备份通知
  - 当超时设置更改时清除通知

## 更新通知模板 - `/api/configuration/templates` {/* #update-notification-templates---apiconfigurationtemplates */}
- **端点**: `/api/configuration/templates`
- **方法**: POST
- **描述**: 更新通知模板。
- **认证**: 需要有效的会话和CSRF令牌
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

- **错误响应**:
  - `401`: 未授权 - 会话无效或 CSRF 令牌无效
  - `400`: 模板是必需的
  - `500`: 更新通知模板时出错
- **注意**:
  - 更新不同备份状态的通知模板
  - 保留现有配置设置
  - 模板支持 Markdown 电子邮件正文和 `{placeholder}` 替换
  - 需要一个 `dailySummary` 电子邮件模板（主题和 Markdown 正文）

## 每日摘要 - `/api/configuration/daily-summary` {/* #daily-summary---apiconfigurationdaily-summary */}
- **端点**: `/api/configuration/daily-summary`
- **方法**: GET, POST
- **描述**: 读取或更新每日摘要模式。GET 返回净化后的设置、调度程序健康状况、下次发生时间和电子邮件发送状态。POST 保存 `enabled`、`utcTime`（`HH:mm` UTC）、`timeZone`（上次保存的浏览器 IANA 时区）、可选的 `publicUrl`，以及可选的 `smtpRecipient`（空值使用电子邮件设置的 SMTP 收件人）。启用需要有效的 SMTP。更改 `utcTime` 会将 `daily-summary-dispatch` 更新为 `minute hour * * *` UTC 并重新加载 cron 服务。更改计划会设置下一个 **未来** 发生时间。
- **认证**: GET 需要有效的会话和 CSRF 令牌。POST 需要管理员会话和 CSRF 令牌。
- **错误响应**:
  - `400`: 时间/时区无效、公共 URL 无效、SMTP 收件人无效或缺少 SMTP
  - `401`: 未授权
  - `500`: 无法读取或更新每日摘要

## 发送每日摘要 - `/api/configuration/daily-summary/send` {/* #send-daily-summary---apiconfigurationdaily-summarysend */}
- **端点**: `/api/configuration/daily-summary/send`
- **方法**: POST
- **描述**: 立即发送额外的当前状态快照。不消耗下一个计划发生时间。使用存储的 SMTP。发送到 `daily_summary.smtpRecipient` 如果已设置，否则使用电子邮件设置的收件人。不接受请求中的收件人地址。在审计日志（系统）中记录 `daily_summary_sent`。
- **认证**: 需要管理员会话和 CSRF 令牌

## 重试每日摘要 - `/api/configuration/daily-summary/retry` {/* #retry-daily-summary---apiconfigurationdaily-summaryretry */}
- **端点**: `/api/configuration/daily-summary/retry`
- **方法**: POST
- **描述**: 从持久化负载中重试失败的通道。可选正文 `{ "occurrenceKey": "..." }`；否则重试最新的失败电子邮件发送。
- **认证**: 需要管理员会话和 CSRF 令牌

## 预览每日摘要 - `/api/configuration/daily-summary/preview` {/* #preview-daily-summary---apiconfigurationdaily-summarypreview */}
- **端点**: `/api/configuration/daily-summary/preview`
- **方法**: POST
- **描述**: 渲染当前快照而不发送，也不写入发送账本行。
- **认证**: 需要有效的会话和 CSRF 令牌

## 获取过期容忍度 - `/api/configuration/overdue-tolerance` {/* #get-overdue-tolerance---apiconfigurationoverdue-tolerance */}
- **端点**: `/api/configuration/overdue-tolerance`
- **方法**: GET
- **描述**: 检索当前的过期容忍度设置。
- **响应**:

  ```json
  {
    "overdue_tolerance": "2h"
  }
  ```

- **错误响应**:
  - `500`: 无法获取过期容忍度
- **注意**:
  - 返回当前的过期容忍度设置
  - 用于显示当前配置

## 更新过期容忍度 - `/api/configuration/overdue-tolerance` {/* #update-overdue-tolerance---apiconfigurationoverdue-tolerance */}
- **端点**: `/api/configuration/overdue-tolerance`
- **方法**: POST
- **描述**: 更新过期容忍度设置。
- **认证**: 需要有效的会话和CSRF令牌
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

- **错误响应**:
  - `401`: 未授权 - 会话无效或 CSRF 令牌无效
  - `400`: overdue_tolerance 是必需的
  - `500`: 更新过期容忍度时出错
- **注意**:
  - 更新过期容忍度设置（接受字符串格式如 `"1h"`、`"2h"` 等；新安装的默认值为 `2h`）
  - 影响备份被视为过期的时间
  - 由过期备份检查器使用

## 外部API安全 - `/api/configuration/external-api-security` {/* #external-api-security---apiconfigurationexternal-api-security */}
- **端点**: `/api/configuration/external-api-security`
- **方法**: GET, PATCH
- **描述**: 读取或更新外部API是否需要密钥，以及`/api/upload`大小和速率限制。
- **认证**: 需要管理员权限、有效会话和CSRF令牌
- **PATCH主体**:

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
- **描述**: 读取或更新受信任的代理和管理员/外部API CIDR白名单。启用管理员列表时，除非当前客户端IP已列入白名单（环回除外），否则会失败。
- **认证**: 需要管理员权限、有效的会话和 CSRF 令牌
