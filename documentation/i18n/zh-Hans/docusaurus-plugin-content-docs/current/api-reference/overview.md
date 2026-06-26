# API 概览 {#api-overview}

本文档描述了 duplistatus 应用程序的所有可用 API 端点。API 遵循 RESTful 原则，提供全面备份监控、通知管理和系统管理功能。

## API 结构 {#api-structure}

有关所有端点的快速参考，请参阅 [API 端点列表](api-endpoint-list)。

API 分为逻辑组：
- [**外部 API**](external-apis)：摘要数据、最新备份状态和 Duplicati 的备份数据上传
- [**核心操作**](core-operations)：仪表板数据、服务器管理和详细备份信息
- [**图表数据**](chart-data-apis)：用于可视化和分析的聚合和服务器特定时间序列数据
- [**配置管理**](configuration-apis)：电子邮件、通知、备份设置和系统配置
- [**通知系统**](notification-apis)：通知测试、过期备份检查和通知管理
- [**Cron 服务**](cron-service-apis)：Cron 服务管理
- [**监控和健康**](monitoring-apis)：健康检查和状态监控
- [**管理**](administration-apis)：数据库维护、清理操作和系统管理
- [**会话管理**](session-management-apis)：会话管理和会话创建
- [**身份验证和安全**](authentication-security)：身份验证和安全

有关所有端点的快速参考，请参阅 [API 端点列表](api-endpoint-list)。

## 响应格式 {#response-format}

所有 API 响应都以 JSON 格式返回，具有一致的错误处理模式。成功的响应通常包括 `status` 字段，而错误响应包括 `error` 和 `message` 字段。

---

## 错误处理 {#error-handling}

所有端点都遵循一致的错误处理模式：

- **400 Bad Request**：无效的请求数据或缺少必需字段
- **401 Unauthorized**：无效或缺少会话、会话过期或 CSRF 令牌验证失败
- **403 Forbidden**：不允许操作（例如，在生产环境中删除备份）或 CSRF 令牌验证失败
- **404 Not Found**：资源未找到
- **409 Conflict**：重复数据（对于上传端点）
- **500 Internal Server Error**：服务器端错误，具有详细的错误消息
- **503 Service Unavailable**：健康检查失败、数据库连接问题或 Cron 服务不可用

错误响应包括：
- `error`：人类可读的错误消息
- `message`：技术错误详细信息（在开发模式下）
- `stack`：错误堆栈跟踪（在开发模式下）
- `timestamp`：错误发生的时间

## 数据类型注释 {#data-type-notes}

### 消息数组 {#message-arrays}
`messages_array`、`warnings_array` 和 `errors_array` 字段作为 JSON 字符串存储在数据库中，并在 API 响应中返回为数组。这些包含 Duplicati 备份操作的实际日志消息、警告和错误。

### 可用备份 {#available-backups}
`available_backups` 字段包含一个备份版本时间戳（ISO 格式）数组，用于恢复。这些从备份日志消息中提取。

### 持续时间字段 {#duration-fields}
- `duration`：人类可读的格式（例如 "00:38:31"
- `duration_seconds`：原始持续时间（以秒为单位）
- `durationInMinutes`：用于图表的持续时间（以分钟为单位）

### 文件大小字段 {#file-size-fields}
全部文件大小字段以字节为单位返回数字，而不是格式化字符串。前端负责将这些转换为人类可读的格式（KB、MB、GB等）。

<br/>

:::caution
 不要将 **duplistatus** 服务器暴露在公共互联网上。请在安全网络中使用它 
（例如，通过防火墙保护的本地LAN）。 

将 **duplistatus** 接口暴露在公共 
互联网上而没有适当的安全措施可能会导致未经授权的访问。
:::
