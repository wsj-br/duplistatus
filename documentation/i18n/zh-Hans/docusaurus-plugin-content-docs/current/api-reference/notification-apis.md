# 通知系统 {#notification-system}

## 测试通知 - `/api/notifications/test` {#test-notification---apinotificationstest}
- **端点**: `/api/notifications/test`
- **方法**: POST
- **描述**: 发送测试通知（简单、模板或电子邮件）以验证通知配置。
- **身份验证**: 需要有效的会话和 CSRF 令牌
- **请求体**:
  对于简单测试:

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

对于模板测试:

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

对于电子邮件测试:

    ```json
    {
      "type": "email"
    }
    ```

- **响应**:
  对于简单测试:

  ```json
  {
    "message": "Test notification sent successfully"
  }
  ```

对于模板测试:

  ```json
  {
    "success": true,
    "message": "Test notifications sent successfully via NTFY and Email",
    "channels": ["NTFY", "Email"]
  }
  ```

对于电子邮件测试:

  ```json
  {
    "message": "Test email sent successfully"
  }
  ```

测试电子邮件内容显示:
  - SMTP 服务器主机名和端口
  - 连接类型（普通 SMTP、STARTTLS 或直接 SSL/TLS）
  - SMTP 身份验证要求状态
  - SMTP 用户名（仅在身份验证时显示）
  - 收件人电子邮件地址
  - 发件人地址和名称用于电子邮件
  - 测试时间戳
- **错误响应**:
  - `401`: 未经授权 - 无效会话或 CSRF 令牌
  - `400`: NTFY 配置是必需的，配置无效或电子邮件未配置
  - `500`: 发送测试通知失败，包含错误详细信息
- **注意**:
  - 支持简单测试消息、模板通知和电子邮件测试
  - 模板测试使用示例数据替换模板变量
  - 包含时间戳在测试消息中
  - 验证 NTFY URL 和主题之前发送
  - 使用 `accessToken` 字段进行身份验证
  - 对于模板测试，发送通知到 NTFY 和电子邮件（如果配置）
  - 电子邮件测试需要设置 SMTP 配置
  - 测试电子邮件端点在读取 SMTP 配置之前清除请求缓存，确保外部脚本可以更新配置并立即在测试电子邮件中反映出来

## 检查逾期备份 - `/api/notifications/check-overdue` {#check-overdue-backups---apinotificationscheck-overdue}
- **端点**: `/api/notifications/check-overdue`
- **方法**: POST
- **描述**: 手动触发逾期备份检查并发送通知。
- **身份验证**: 需要有效的会话和 CSRF 令牌
- **响应**:

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
  - `500`: 检查逾期备份失败
- **注意**:
  - 手动触发逾期备份检查
  - 返回检查过程的统计信息
  - 为找到的逾期备份发送通知

## 清除逾期时间戳 - `/api/notifications/clear-overdue-timestamps` {#clear-overdue-timestamps---apinotificationsclear-overdue-timestamps}
- **端点**: `/api/notifications/clear-overdue-timestamps`
- **方法**: POST
- **描述**: 清除所有逾期备份通知时间戳，允许再次发送通知。
- **身份验证**: 需要有效的会话和 CSRF 令牌
- **响应**:

  ```json
  {
    "message": "Overdue backup notification timestamps cleared successfully"
  }
  ```

- **错误响应**:
  - `500`: 清除逾期备份时间戳失败
- **说明**:
  - 清除全部逾期备份通知时间戳
  - 允许再次发送通知
  - 对于测试通知系统很有用
