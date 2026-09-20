# 通知系统 {/* #notification-system */}

## 测试通知 - `/api/notifications/test` {/* #test-notification---apinotificationstest */}
- **端点**: `/api/notifications/test`
- **方法**: POST
- **描述**: 发送测试通知（简单、基于模板或电子邮件）以验证通知配置。
- **认证**: 需要管理员会话和 CSRF 令牌
- **请求体**:
  简单测试：

    ```json
    {
      "type": "simple",
      "ntfyConfig": {
        "url": "https://ntfy.sh",
        "topic": "test-topic",
        "accessToken": "optional-access-token"
      }
    }
    ```

模板测试：

    ```json
    {
      "type": "template",
      "ntfyConfig": {
        "url": "https://ntfy.sh",
        "topic": "test-topic",
        "accessToken": "optional-access-token"
      },
      "template": {
        "title": "Test Title",
        "message": "Test message with {variable}",
        "priority": "default",
        "tags": "test"
      }
    }
    ```

电子邮件测试：

    ```json
    {
      "type": "email"
    }
    ```

- **响应**:
  简单测试：

  ```json
  {
    "message": "Test notification sent successfully"
  }
  ```

模板测试：

  ```json
  {
    "success": true,
    "message": "Test notifications sent successfully via NTFY and Email",
    "channels": ["NTFY", "Email"]
  }
  ```

电子邮件测试：

  ```json
  {
    "message": "Test email sent successfully"
  }
  ```

测试电子邮件内容显示：
  - SMTP 服务器主机名和端口
  - 连接类型（普通 SMTP、STARTTLS 或直接 SSL/TLS）
  - SMTP 认证要求状态
  - SMTP 用户名（仅在需要认证时显示）
  - 接收者邮箱
  - 用于电子邮件的发件人地址和发件人姓名
  - 测试时间戳
- **错误响应**:
  - `401`: 未授权 - 无效会话或 CSRF 令牌
  - `400`: 需要 NTFY 配置，配置无效或电子邮件未配置
  - `500`: 发送测试通知失败，包含错误详情
- **注意事项**:
  - 支持简单测试消息、基于模板的通知和电子邮件测试
  - 模板测试使用示例数据替换模板变量
  - 在测试消息中包含时间戳
  - NTFY 测试使用存储的 NTFY 配置；不使用客户端提供的 NTFY URL
  - 存储时使用 `accessToken` 字段进行认证
  - 对于模板测试，向 NTFY 和电子邮件（如果已配置）发送通知
  - 电子邮件测试需要设置 SMTP 配置
  - 测试电子邮件端点在读取 SMTP 配置之前清除请求缓存，确保外部脚本可以更新配置并在测试电子邮件中立即反映出来
  - 模板测试和每日摘要立即发送绕过每个备份抑制

## 预览通知模板 - `/api/notifications/preview` {/* #preview-notification-template---apinotificationspreview */}
- **端点**: `/api/notifications/preview`
- **方法**: POST
- **描述**: 使用生产 Markdown 渲染器渲染通知模板但不发送。主体包括 `kind`（`success`、`warning`、`overdueBackup` 或 `dailySummaryEmail`）和正在编辑的模板。每日摘要预览使用当前真实快照；其他类型使用确定性示例值。电子邮件 HTML 适用于沙盒 iframe。成功、警告/错误和过期还返回 NTFY 负载（`ntfyMessage`）；任何 GFM 表格标题都被省略，正文行是纯文本。
- **身份验证**：需要有效会话和CSRF令牌

## 检查过期备份 - `/api/notifications/check-overdue` {/* #check-overdue-backups---apinotificationscheck-overdue */}
- **端点**: `/api/notifications/check-overdue`
- **方法**: POST
- **描述**: 手动触发过期备份检查并发送通知。
- **身份验证**：需要有效的会话和 CSRF 令牌
- **响应**：

  ```json
  {
    "message": "Overdue backup check completed",
    "statistics": {
      "totalBackupConfigs": 5,
      "checkedBackups": 5,
      "overdueBackupsFound": 2,
      "notificationsSent": 2
    }
  }
  ```

- **错误响应**:
  - `500`: 检查过期备份失败
- **注意事项**:
  - 手动触发过期备份检查
  - 返回检查过程的统计信息
  - 为发现的过期备份发送通知

## 清除过期时间戳 - `/api/notifications/clear-overdue-timestamps` {/* #clear-overdue-timestamps---apinotificationsclear-overdue-timestamps */}
- **端点**: `/api/notifications/clear-overdue-timestamps`
- **方法**: POST
- **描述**: 清除所有过期备份通知时间戳，允许再次发送通知。
- **身份验证**：需要有效的会话和 CSRF 令牌
- **响应**：

  ```json
  {
    "message": "Overdue backup notification timestamps cleared successfully"
  }
  ```

- **错误响应**:
  - `500`: 清除过期备份时间戳失败
- **注意事项**:
  - 清除所有过期备份通知时间戳
  - 允许再次发送通知
  - 用于测试通知系统
