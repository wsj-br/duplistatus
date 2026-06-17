

# API 概览 {#api-overview}

本文档描述 duplistatus 应用程序所有可用的 API 端点。API 遵循 RESTful 原则，提供全面的备份监控、通知管理和系统管理功能。

:::note
**英语 (EN)：** The API documentation is available only in English.               <br/>
**德语 (DE)：** Die API-Dokumentation ist nur auf Englisch verfügbar.              <br/>
**法语 (FR)：** La documentation de l'API est disponible uniquement en anglais.    <br/>
**西班牙语 (ES)：** La documentación de la API solo está disponible en inglés.        <br/>
**葡萄牙语 (PT-BR)：** A documentação da API está disponível apenas em inglês.    <br/>
**简体中文 (zh-CN)：** API 文档仅以英语提供。
:::


## API 结构 {#api-structure}

有关所有端点的快速参考，请参阅 [API 端点列表](api-endpoint-list)。

API 分为以下逻辑组：
- [**外部 API**](external-apis)：摘要数据、最新备份状态，以及来自 Duplicati 的备份数据上传
- [**核心操作**](core-operations)：仪表板数据、服务器管理和详细备份信息
- [**图表数据**](chart-data-apis)：用于可视化和分析的聚合及服务器特定时间序列数据
- [**配置管理**](configuration-apis)：电子邮件、通知、备份设置和系统配置
- [**通知系统**](notification-apis)：通知测试、逾期备份检查和通知管理
- [**Cron 服务**](cron-service-apis)：Cron 服务管理
- [**监控与健康**](monitoring-apis)：健康检查和状态监控
- [**管理**](administration-apis)：数据库维护、清理操作和系统管理
- [**会话管理**](session-management-apis)：会话管理和会话创建
- [**认证与安全**](authentication-security)：认证和安全

有关所有端点的快速参考，请参阅 [API 端点列表](api-endpoint-list)。

## 响应格式 {#response-format}

所有 API 响应以 JSON 格式返回，具有一致的错误处理模式。成功响应通常包含 `status` 字段，错误响应包含 `error` 和 `message` 字段。

---

## 错误处理 {#error-handling}

所有端点遵循一致的错误处理模式：

- **400 Bad Request**：请求数据无效或缺少必填字段
- **401 Unauthorized**：会话无效或缺失、会话过期，或 CSRF 令牌验证失败
- **403 Forbidden**：操作不允许（例如在生产环境中删除备份）或 CSRF 令牌验证失败
- **404 Not Found**：资源未找到
- **409 Conflict**：重复数据（用于上传端点）
- **500 Internal Server Error**：服务器端错误及详细错误消息
- **503 Service Unavailable**：健康检查失败、数据库连接问题或 Cron 服务不可用

错误响应包括：
- `error`：人类可读的错误消息
- `message`：技术错误详情（开发模式下）
- `stack`：错误堆栈跟踪（开发模式下）
- `timestamp`：错误发生时间

## 数据类型说明 {#data-type-notes}

### 消息数组 {#message-arrays}
`messages_array`、`warnings_array` 和 `errors_array` 字段在数据库中以 JSON 字符串存储，在 API 响应中以数组返回。这些包含 Duplicati 备份操作中的实际日志消息、警告和错误。

### 可用备份 {#available-backups}
`available_backups` 字段包含可用于还原的备份版本时间戳数组（ISO 格式）。这从备份日志消息中提取。

### 持续时间字段 {#duration-fields}
- `duration`：人类可读格式（例如 "00:38:31"）
- `duration_seconds`：原始持续时间（秒）
- `durationInMinutes`：转换为分钟，用于图表

### 文件大小字段 {#file-size-fields}
所有文件大小字段以字节为单位的数字返回，而非格式化字符串。前端负责转换为人类可读格式（KB、MB、GB 等）。

<br/>

:::caution
 请勿将 **duplistatus** 服务器暴露于公网。请在安全网络中使用
（例如受防火墙保护的本地 LAN）。

在未采取适当安全措施的情况下将 **duplistatus** 界面暴露于公网
可能导致未经授权的访问。
:::
