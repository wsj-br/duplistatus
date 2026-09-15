# API 概述 {/* #api-overview */}

本文档描述了 duplistatus 应用程序的所有可用 API 端点。API 遵循 RESTful 原则，并提供全面的备份监控、通知管理和系统管理功能。

## API 结构 {/* #api-structure */}

要快速参考所有端点，请参阅 [API 端点列表](api-endpoint-list)。

API 按逻辑分组组织：
- [**外部API**](external-apis)：摘要数据、最新备份状态和来自 Duplicati 的备份数据上传
- [**核心操作**](core-operations)：仪表板数据、服务器管理和详细备份信息
- [**图表数据**](chart-data-apis)：用于可视化和分析的聚合和服务器特定时间序列数据
- [**配置管理**](configuration-apis)：电子邮件、通知、备份设置和系统配置
- [**通知系统**](notification-apis)：通知测试、过期备份检查和通知管理
- [**Cron 服务**](cron-service-apis)：Cron 服务管理
- [**监控与健康**](monitoring-apis)：健康检查和状态监控
- [**管理**](administration-apis)：数据库维护、清理操作和系统管理
- [**会话管理**](session-management-apis)：会话管理和会话创建
- [**认证与安全**](authentication-security)：认证和安全

要快速参考所有端点，请参阅 [API 端点列表](api-endpoint-list)。

## 响应格式 {/* #response-format */}

所有 API 响应均以 JSON 格式返回，并具有一致的错误处理模式。成功的响应通常包括 `status` 字段，而错误响应包括 `error` 和 `message` 字段。

---

## 错误处理 {/* #error-handling */}

所有端点均遵循一致的错误处理模式：

- **400 错误请求**：无效的请求数据或缺少必需字段
- **401 未授权**：无效或缺失的会话、过期的会话或 CSRF 令牌验证失败
- **403 禁止**：不允许的操作（例如在生产环境中删除备份）或 CSRF 令牌验证失败
- **404 未找到**：资源未找到
- **409 冲突**：重复数据（用于上传端点）
- **413 有效负载过大**：`/api/upload` 正文超过配置的大小限制
- **429 请求过多**：上传、读取 API 或身份验证失败速率限制超过
- **500 内部服务器错误**：服务器端错误，带有详细的错误消息
- **503 服务不可用**：健康检查失败、数据库连接问题或 Cron 服务不可用

错误响应包括：
- `error`：人类可读的错误消息
- `message`：技术错误详情（在开发模式下）
- `stack`：错误堆栈跟踪（在开发模式下）
- `timestamp`：错误发生的时间

## 数据类型说明 {/* #data-type-notes */}

### 消息数组 {/* #message-arrays */}
`messages_array`、`warnings_array` 和 `errors_array` 字段存储为数据库中的 JSON 字符串，并在 API 响应中作为数组返回。这些包含来自 Duplicati 备份操作的实际日志消息、警告和错误。

### 可用备份 {/* #available-backups */}
`available_backups` 字段包含一个可用于恢复的备份版本时间戳（以 ISO 格式）数组。这些来自备份日志消息。

### 持续时间字段 {/* #duration-fields */}
- `duration`: 可读格式（例如 "00:38:31"）
- `duration_seconds`: 原始持续时间（以秒为单位）
- `durationInMinutes`: 转换为分钟的持续时间，用于绘图

### 文件大小字段 {/* #file-size-fields */}
所有文件大小字段均以字节为单位返回数字，而不是格式化字符串。前端负责将这些转换为可读格式（KB、MB、GB 等）。

<br/>

:::caution
 不要将**duplistatus**服务器暴露在公共互联网上。在安全网络中使用它
（例如，受防火墙保护的本地局域网）。

将**duplistatus**接口暴露在公共互联网上而不采取适当的安全措施可能会导致未经授权的访问。
:::
