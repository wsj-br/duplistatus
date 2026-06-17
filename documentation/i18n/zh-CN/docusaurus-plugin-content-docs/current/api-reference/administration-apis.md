

# 管理 {#administration}

## 采集备份 - `/api/backups/collect` {#collect-backups---apibackupscollect}
- **端点**： `/api/backups/collect`
- **方法**： POST
- **描述**： 通过 Duplicati 服务器 API 直接采集备份数据。此端点自动检测最佳连接协议（SSL 验证的 HTTPS、自签名证书的 HTTPS 或 HTTP 回退），连接 Duplicati 服务器检索备份信息并写入本地数据库。
- **认证**： 需要有效会话和 CSRF 令牌
- **请求体**：
  ```json
  {
    "hostname": "duplicati-server.local",
    "port": 8200,
    "password": "your-password",
    "downloadJson": false
  }
  ```
- **响应**：
  ```json
  {
    "success": true,
    "serverName": "Server Name",
    "serverAlias": "My Server",
    "stats": {
      "processed": 5,
      "skipped": 2,
      "errors": 0
    },
    "backupSettings": {
      "added": 2,
      "total": 7
    }
  }
  ```
- **错误响应**：
  - `400`: 请求参数无效或连接失败
  - `500`: 备份采集期间服务器错误
- **说明**： 
  - 端点自动检测最佳连接协议（HTTPS → 自签名 HTTPS → HTTP）
  - 协议检测按安全偏好顺序尝试
  - 连接超时可通过环境变量配置
  - 开发模式下记录采集数据以供调试
  - 确保所有服务器和备份的备份设置完整
  - 若未指定则使用默认端口 8200
  - 检测到的协议和 server URL 自动存储在数据库中
  - 从数据库检索 `serverAlias`，若未设置别名可能为空
  - 前端显示应使用 `serverAlias || serverName`
  - 支持 JSON 下载和直接 API 采集两种方式

## 清理备份 - `/api/backups/cleanup` {#cleanup-backups---apibackupscleanup}
- **端点**： `/api/backups/cleanup`
- **方法**： POST
- **描述**： 根据保留期删除旧备份数据。此端点通过删除过时备份记录来管理数据库大小，同时保留近期和重要数据。
- **认证**： 需要有效会话和 CSRF 令牌
- **请求体**：
  ```json
  {
    "retentionPeriod": "6 months"
  }
  ```
- **保留期**： `"6 months"`, `"1 year"`, `"2 years"`, `"Delete all data"`
- **响应**：
  ```json
  {
    "message": "Successfully deleted 15 old backups",
    "status": 200
  }
  ```
  
  对于「删除所有数据」选项：
  ```json
  {
    "message": "Successfully deleted all 15 backups and 3 servers, and cleared configuration settings",
    "status": 200
  }
  ```
- **错误响应**：
  - `401`: 未授权 - 会话或 CSRF 令牌无效
  - `400`: 指定的保留期无效
  - `500`: 清理操作期间服务器错误，含详细错误信息
- **说明**： 
  - 清理操作不可逆
  - 备份数据从数据库永久删除
  - 即使删除所有备份也保留机器记录
  - 选择「删除所有数据」时，删除所有机器和备份并清除配置
  - 增强的错误报告在开发模式下包含详情和堆栈跟踪
  - 支持基于时间的保留和完全数据删除

## 删除备份任务 - `/api/backups/delete-job` {#delete-backup-job---apibackupsdelete-job}
- **端点**： `/api/backups/delete-job`
- **方法**： DELETE
- **描述**： 删除特定服务器-备份组合的所有备份记录。此端点仅在开发模式下可用。
- **认证**： 需要有效会话和 CSRF 令牌
- **请求体**：
  ```json
  {
    "serverId": "server-id",
    "backupName": "Backup Name"
  }
  ```
- **响应**：
  ```json
  {
    "message": "Successfully deleted 5 backup record(s) for \"Files\" from server \"My Server\"",
    "status": 200,
    "deletedCount": 5,
    "serverName": "My Server",
    "backupName": "Files"
  }
  ```
- **错误响应**：
  - `401`: 未授权 - 会话或 CSRF 令牌无效
  - `403`: 备份任务删除仅在开发模式下可用
  - `400`: 需要 server ID 和 backup name
  - `404`: 未找到要删除的备份
  - `500`: 删除期间服务器错误，含详细错误信息
- **说明**： 
  - 此操作仅在开发模式下可用
  - 此操作不可逆
  - 指定服务器-备份组合的所有备份记录将被永久删除
  - 返回已删除备份数量和服务器信息
  - 显示时优先使用服务器别名，否则回退到服务器名称

## 同步备份计划 - `/api/backups/sync-schedule` {#sync-backup-schedules---apibackupssync-schedule}
- **端点**： `/api/backups/sync-schedule`
- **方法**： POST
- **描述**： 从 Duplicati 服务器同步备份计划信息。此端点连接服务器，检索所有备份的计划信息，并使用重复间隔、允许的星期几和计划时间等详情更新本地备份设置。
- **认证**： 需要有效会话和 CSRF 令牌
- **请求体**：
  ```json
  {
    "hostname": "duplicati-server.local",
    "port": 8200,
    "password": "your-password",
    "serverId": "optional-server-id"
  }
  ```
  或仅使用 serverId（使用已存储的密码）：
  ```json
  {
    "serverId": "server-id"
  }
  ```
  或使用 serverId 和更新的凭据：
  ```json
  {
    "serverId": "server-id",
    "hostname": "new-hostname.local",
    "port": 8200,
    "password": "new-password"
  }
  ```
- **响应**：
  ```json
  {
    "success": true,
    "serverName": "Server Name",
    "stats": {
      "processed": 5,
      "errors": 0
    }
  }
  ```
  含错误时：
  ```json
  {
    "success": true,
    "serverName": "Server Name",
    "stats": {
      "processed": 3,
      "errors": 2
    },
    "errors": [
      "Backup Name 1: Error message",
      "Backup Name 2: Error message"
    ]
  }
  ```
- **错误响应**：
  - `400`: 请求参数无效、未提供 serverId 时缺少 hostname/password，或连接失败
  - `404`: 未找到服务器（提供 serverId 时）或服务器未存储密码
  - `500`: 计划同步期间服务器错误
- **说明**： 
  - 端点自动检测最佳连接协议（HTTPS → 自签名 HTTPS → HTTP）
  - 可仅使用 serverId 调用以使用已存储的服务器凭据
  - 可使用 serverId 和新凭据调用以更新服务器连接详情
  - 对新服务器可无 serverId 使用 hostname/port/password 调用
  - 使用计划信息更新备份设置，包括：
    - `expectedInterval`：重复间隔（例如 "Daily"、"Weekly"、"Monthly"）
    - `allowedWeekDays`：允许的星期几数组（0=周日，1=周一，等）
    - `time`：备份的计划时间
  - 处理服务器上找到的所有备份
  - 返回已处理备份的统计及遇到的任何错误
  - 记录成功和失败同步操作的审计事件
  - 若未指定则使用默认端口 8200

## 测试服务器连接 - `/api/servers/test-connection` {#test-server-connection---apiserverstest-connection}
- **端点**： `/api/servers/test-connection`
- **方法**： POST
- **描述**： 测试与 Duplicati 服务器的连接以验证其可访问性。
- **请求体**：
  ```json
  {
    "server_url": "http://localhost:8200"
  }
  ```
- **响应**：
  ```json
  {
    "success": true,
    "message": "Connection successful"
  }
  ```
- **错误响应**：
  - `400`: URL 格式无效或缺少 server URL
  - `500`: 连接测试期间服务器错误
- **说明**： 
  - 端点验证 URL 格式并测试连接
  - 若服务器返回 401 状态则视为成功（无凭据访问登录端点时的预期行为）
  - 测试与 Duplicati 服务器登录端点的连接
  - 支持 HTTP 和 HTTPS 协议
  - 使用超时配置进行连接测试

## 获取服务器 URL - `/api/servers/:serverId/server-url` {#get-server-url---apiserversserveridserver-url}
- **端点**： `/api/servers/:serverId/server-url`
- **方法**： GET
- **描述**： 检索特定服务器的服务器 URL。
- **参数**：
  - `serverId`：服务器标识符

- **响应**：
  ```json
  {
    "serverId": "server-id",
    "server_url": "http://localhost:8200"
  }
  ```
- **错误响应**：
  - `404`: 未找到服务器
  - `500`: 服务器错误
- **说明**：
  - 返回特定服务器的 server URL
  - 用于服务器连接管理
  - 若未设置 server URL 则返回空字符串

## 更新服务器 URL - `/api/servers/:serverId/server-url` {#update-server-url---apiserversserveridserver-url}
- **端点**： `/api/servers/:serverId/server-url`
- **方法**： PATCH
- **描述**： 更新特定服务器的服务器 URL。
- **认证**： 需要有效会话和 CSRF 令牌
- **参数**：
  - `serverId`：服务器标识符
- **请求体**：
  ```json
  {
    "server_url": "http://localhost:8200"
  }
  ```
- **响应**：
  ```json
  {
    "message": "Server URL updated successfully",
    "serverId": "server-id",
    "serverName": "Server Name",
    "server_url": "http://localhost:8200"
  }
  ```
- **错误响应**：
  - `401`: 未授权 - 会话或 CSRF 令牌无效
  - `400`: URL 格式无效
  - `404`: 未找到服务器
  - `500`: 服务器错误 during update
- **说明**： 
  - 端点在更新前验证 URL 格式
  - 允许空或 null 的 server URL
  - 支持 HTTP 和 HTTPS 协议
  - 返回更新后的服务器信息

## 获取服务器密码 - `/api/servers/:serverId/password` {#get-server-password---apiserversserveridpassword}
- **端点**： `/api/servers/:serverId/password`
- **方法**： GET
- **描述**： 检索用于服务器密码操作的 CSRF 令牌。
- **认证**： 需要有效会话
- **参数**：
  - `serverId`：服务器标识符
- **响应**：
  ```json
  {
    "csrfToken": "csrf-token-string",
    "serverId": "server-id"
  }
  ```
- **错误响应**：
  - `401`: 会话无效或已过期
  - `500`: 生成 CSRF 令牌失败
- **说明**：
  - 返回用于密码更新操作的 CSRF 令牌
  - 会话必须有效才能生成令牌

## 更新服务器密码 - `/api/servers/:serverId/password` {#update-server-password---apiserversserveridpassword}
- **端点**： `/api/servers/:serverId/password`
- **方法**： PATCH
- **描述**： 更新特定服务器的密码。
- **认证**： 需要有效会话和 CSRF 令牌
- **参数**：
  - `serverId`：服务器标识符
- **请求体**：
  ```json
  {
    "password": "new-password"
  }
  ```
- **响应**：
  ```json
  {
    "message": "Password updated successfully",
    "serverId": "server-id"
  }
  ```
- **错误响应**：
  - `400`: password 必须为字符串
  - `401`: 未授权 - 会话或 CSRF 令牌无效
  - `500`: 更新密码失败
- **说明**：
  - password 可为空字符串以清除密码
  - 使用密钥管理系统安全存储密码

## 用户管理 {#user-management}

### 列出用户 - `/api/users` {#list-users---apiusers}
- **端点**： `/api/users`
- **方法**： GET
- **描述**： 列出所有用户，支持分页和可选搜索筛选。返回用户信息，包括登录历史和账户状态。
- **认证**： 需要管理员权限、有效会话和 CSRF 令牌
- **查询参数**：
  - `page`（可选）： 页码（默认：1）
  - `limit`（可选）： 每页条目数（默认：50）
  - `search`（可选）： 按用户名筛选的搜索词
- **响应**：
  ```json
  {
    "users": [
      {
        "id": "user-id",
        "username": "admin",
        "isAdmin": true,
        "mustChangePassword": false,
        "createdAt": "2024-01-01T00:00:00Z",
        "lastLoginAt": "2024-01-15T10:30:00Z",
        "lastLoginIp": "192.168.1.100",
        "failedLoginAttempts": 0,
        "lockedUntil": null,
        "isLocked": false
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 5,
      "totalPages": 1
    }
  }
  ```
- **错误响应**：
  - `401`: 未授权 - 会话或 CSRF 令牌无效
  - `403`: 禁止 - 需要管理员权限
  - `500`: 内部服务器错误
- **说明**：
  - 仅管理员可访问
  - 支持分页和搜索筛选
  - 返回用户账户状态，包括锁定状态

### 创建用户 - `/api/users` {#create-user---apiusers}
- **端点**： `/api/users`
- **方法**： POST
- **描述**： 创建新用户账户。可生成临时密码或使用提供的密码。
- **认证**： 需要管理员权限、有效会话和 CSRF 令牌
- **请求体**：
  ```json
  {
    "username": "newuser",
    "password": "optional-password",
    "isAdmin": false,
    "requirePasswordChange": true
  }
  ```
  - `username`： 必填，3-50 个字符，唯一
  - `password`： 可选，若未提供则生成安全临时密码
  - `isAdmin`： 可选，默认 false
  - `requirePasswordChange`： 可选，默认 true
- **响应**：
  ```json
  {
    "user": {
      "id": "user-id",
      "username": "newuser",
      "isAdmin": false,
      "mustChangePassword": true
    },
    "temporaryPassword": "generated-password-123"
  }
  ```
  - 仅在自动生成密码时包含 `temporaryPassword`
- **错误响应**：
  - `400`: 用户名格式无效、违反密码策略或验证错误
  - `401`: 未授权 - 会话或 CSRF 令牌无效
  - `403`: 禁止 - 需要管理员权限
  - `409`: 用户名已存在
  - `500`: 内部服务器错误
- **说明**：
  - 仅管理员可访问
  - 用户名不区分大小写并以小写存储
  - 若未提供密码，则生成 12 字符安全密码
  - 生成的临时密码仅在响应中返回一次
  - 用户创建记录到审计日志

### 更新用户 - `/api/users/:id` {#update-user---apiusersid}
- **端点**： `/api/users/:id`
- **方法**： PATCH
- **描述**： 更新用户信息，包括用户名、管理员状态、密码更改要求和密码重置。
- **认证**： 需要管理员权限、有效会话和 CSRF 令牌
- **参数**：
  - `id`：要更新的用户 ID
- **请求体**：
  ```json
  {
    "username": "updated-username",
    "isAdmin": true,
    "requirePasswordChange": false,
    "resetPassword": true
  }
  ```
  - 所有字段均为可选
  - `resetPassword`： 若为 true，生成新临时密码并将 `requirePasswordChange` 设为 true
- **响应**（含密码重置）：
  ```json
  {
    "user": {
      "id": "user-id",
      "username": "updated-username",
      "isAdmin": true,
      "mustChangePassword": true
    },
    "temporaryPassword": "new-temp-password-456"
  }
  ```
- **响应**（不含密码重置）：
  ```json
  {
    "user": {
      "id": "user-id",
      "username": "updated-username",
      "isAdmin": true,
      "mustChangePassword": false
    }
  }
  ```
- **错误响应**：
  - `400`: 输入无效或验证错误
  - `401`: 未授权 - 会话或 CSRF 令牌无效
  - `403`: 禁止 - 需要管理员权限
  - `404`: 未找到用户
  - `409`: 用户名已存在 (if changing username)
  - `500`: 内部服务器错误
- **说明**：
  - 仅管理员可访问
  - 用户名更改验证唯一性
  - 密码重置生成 12 字符安全临时密码
  - 所有更改记录到审计日志

### 删除用户 - `/api/users/:id` {#delete-user---apiusersid}
- **端点**： `/api/users/:id`
- **方法**： DELETE
- **描述**： 删除用户账户。防止删除自己或最后一个管理员账户。
- **认证**： 需要管理员权限、有效会话和 CSRF 令牌
- **参数**：
  - `id`：要删除的用户 ID
- **响应**：
  ```json
  {
    "success": true,
    "message": "User deleted successfully"
  }
  ```
- **错误响应**：
  - `400`: 无法删除自己的账户或最后一个管理员账户
  - `401`: 未授权 - 会话或 CSRF 令牌无效
  - `403`: 禁止 - 需要管理员权限
  - `404`: 未找到用户
  - `500`: 内部服务器错误
- **说明**：
  - 仅管理员可访问
  - 无法删除自己的账户
  - 无法删除最后一个管理员账户（至少保留一名管理员）
  - 用户删除记录到审计日志
  - 关联会话自动删除（级联）

## 审计日志管理 {#audit-log-management}

### 列出审计日志 - `/api/audit-log` {#list-audit-logs---apiaudit-log}
- **端点**： `/api/audit-log`
- **方法**： GET
- **描述**： 检索审计日志条目，支持筛选、分页和搜索。支持基于页码和基于偏移量的分页。
- **认证**： 需要有效会话和 CSRF 令牌 (logged-in user required)
- **查询参数**：
  - `page`（可选）： 基于页码分页的页码
  - `offset` (optional): 基于偏移量分页的偏移量（优先于 page）
  - `limit`（可选）： 每页条目数（默认：50）
  - `startDate` (optional): 从此日期筛选日志（ISO 格式）
  - `endDate` (optional): 筛选到此日期的日志（ISO 格式）
  - `userId` (optional): 按用户 ID 筛选
  - `username` (optional): 按用户名筛选
  - `action` (optional): 按操作名称筛选
  - `category` (optional): 按类别筛选（`auth`、`user_management`、`config`、`backup`、`server`）
  - `status` (optional): 按状态筛选（`success`、`failure`、`error`）
- **响应**：
  ```json
  {
    "logs": [
      {
        "id": 1,
        "timestamp": "2024-01-15T10:30:00Z",
        "userId": "user-id",
        "username": "admin",
        "action": "login",
        "category": "auth",
        "targetType": "user",
        "targetId": "user-id",
        "status": "success",
        "ipAddress": "192.168.1.100",
        "userAgent": "Mozilla/5.0...",
        "details": {
          "is_admin": true
        },
        "errorMessage": null
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 150,
      "totalPages": 3
    }
  }
  ```
- **错误响应**：
  - `401`: 未授权 - 会话或 CSRF 令牌无效
  - `500`: 内部服务器错误
- **说明**：
  - 支持基于页码（`page`）和基于偏移量（`offset`）的分页
  - `details` 字段包含带附加上下文的解析 JSON
  - 所有审计日志查询均被记录

### 获取审计日志筛选值 - `/api/audit-log/filters` {#get-audit-log-filter-values---apiaudit-logfilters}
- **端点**： `/api/audit-log/filters`
- **方法**： GET
- **描述**： 检索可用于筛选审计日志的唯一筛选值。返回审计日志数据库中存在的所有不同操作、类别和状态。用于填充 UI 中的筛选下拉列表。
- **认证**： 需要有效会话和 CSRF 令牌 (logged-in user required)
- **响应**：
  ```json
  {
    "actions": [
      "login",
      "logout",
      "user_created",
      "user_updated",
      "config_updated"
    ],
    "categories": [
      "auth",
      "user_management",
      "config",
      "backup",
      "server"
    ],
    "statuses": [
      "success",
      "failure",
      "error"
    ]
  }
  ```
- **错误响应**：
  - `401`: 未授权 - 会话或 CSRF 令牌无效
  - `500`: 内部服务器错误
- **说明**：
  - 返回审计日志数据库中的唯一值数组
  - 值按字母顺序排序
  - 若无数据或出错则返回空数组
  - 审计日志查看器用于动态填充筛选下拉列表

### 下载审计日志 - `/api/audit-log/download` {#download-audit-logs---apiaudit-logdownload}
- **端点**： `/api/audit-log/download`
- **方法**： GET
- **描述**： 以 CSV 或 JSON 格式下载审计日志，支持可选筛选。适用于外部分析和报告。
- **认证**： 需要有效会话和 CSRF 令牌 (logged-in user required)
- **查询参数**：
  - `format`（可选）： 导出格式 - `csv` 或 `json`（默认：`csv`）
  - `startDate` (optional): 从此日期筛选日志（ISO 格式）
  - `endDate` (optional): 筛选到此日期的日志（ISO 格式）
  - `userId` (optional): 按用户 ID 筛选
  - `username` (optional): 按用户名筛选
  - `action` (optional): 按操作名称筛选
  - `category` (optional): Filter by category
  - `status` (optional): Filter by status
- **响应**（CSV）：
  - Content-Type： `text/csv`
  - Content-Disposition： `attachment; filename="audit-log-YYYY-MM-DD.csv"`
  - 带表头的 CSV 文件： ID, Timestamp, User ID, Username, Action, Category, Target Type, Target ID, Status, IP Address, User Agent, Details, Error Message
- **响应**（JSON）：
  - Content-Type： `application/json`
  - Content-Disposition： `attachment; filename="audit-log-YYYY-MM-DD.json"`
  - 审计日志条目的 JSON 数组
- **错误响应**：
  - `400`: 无日志可导出
  - `401`: 未授权 - 会话或 CSRF 令牌无效
  - `500`: 内部服务器错误
- **说明**：
  - 导出限制 10,000 条记录
  - CSV 格式正确转义特殊字符
  - CSV 中的 Details 字段为 JSON 字符串
  - 文件名包含当前日期

### 清理审计日志 - `/api/audit-log/cleanup` {#cleanup-audit-logs---apiaudit-logcleanup}
- **端点**： `/api/audit-log/cleanup`
- **方法**： POST
- **描述**： 根据保留期手动触发旧审计日志清理。支持试运行模式以预览将删除的内容。
- **认证**： 需要管理员权限、有效会话和 CSRF 令牌
- **请求体**：
  ```json
  {
    "retentionDays": 90,
    "dryRun": false
  }
  ```
  - `retentionDays`（可选）： 覆盖保留天数（30-365），否则使用配置值
  - `dryRun`（可选）： 若为 true，仅返回将删除的内容而不实际删除
- **响应**（试运行）：
  ```json
  {
    "dryRun": true,
    "wouldDeleteCount": 50,
    "oldestRemaining": "2024-01-01T00:00:00Z",
    "retentionDays": 90,
    "cutoffDate": "2024-01-01"
  }
  ```
- **响应**（实际清理）：
  ```json
  {
    "success": true,
    "deletedCount": 50,
    "oldestRemaining": "2024-01-01T00:00:00Z",
    "retentionDays": 90
  }
  ```
- **错误响应**：
  - `400`: 保留天数无效（必须为 30-365）
  - `401`: 未授权 - 会话或 CSRF 令牌无效
  - `403`: 禁止 - 需要管理员权限
  - `500`: 内部服务器错误
- **说明**：
  - 仅管理员可访问
  - 若未配置则默认保留 90 天
  - 清理操作记录到审计日志
  - 试运行模式便于预览清理影响

### 获取审计日志保留期 - `/api/audit-log/retention` {#get-audit-log-retention---apiaudit-logretention}
- **端点**： `/api/audit-log/retention`
- **方法**： GET
- **描述**： 检索当前审计日志保留配置（天数）。
- **认证**： 需要有效会话和 CSRF 令牌 (no logged-in user required)
- **响应**：
  ```json
  {
    "retentionDays": 90
  }
  ```
- **错误响应**：
  - `500`: 内部服务器错误
- **说明**：
  - 若未配置则默认保留 90 天
  - 可无认证访问（只读）

### 更新审计日志保留期 - `/api/audit-log/retention` {#update-audit-log-retention---apiaudit-logretention}
- **端点**： `/api/audit-log/retention`
- **方法**： PATCH
- **描述**： 更新审计日志保留期（天数）。此设置决定自动清理前审计日志的保留时长。
- **认证**： 需要管理员权限、有效会话和 CSRF 令牌
- **请求体**：
  ```json
  {
    "retentionDays": 120
  }
  ```
  - `retentionDays`：必填，必须在 30 至 365 天之间
- **响应**：
  ```json
  {
    "success": true,
    "retentionDays": 120
  }
  ```
- **错误响应**：
  - `400`: 保留天数无效（必须为 30-365）
  - `401`: 未授权 - 会话或 CSRF 令牌无效
  - `403`: 禁止 - 需要管理员权限
  - `500`: 内部服务器错误
- **说明**：
  - 仅管理员可访问
  - 配置更改记录到审计日志
  - 保留期影响自动和手动清理操作

## 数据库管理 {#database-management}

### 备份数据库 - `/api/database/backup` {#backup-database---apidatabasebackup}
- **端点**： `/api/database/backup`
- **方法**： GET
- **描述**： 以二进制（.db）或 SQL（.sql）格式创建数据库备份。备份文件自动下载，文件名带时间戳。
- **认证**： 需要管理员权限、有效会话和 CSRF 令牌
- **查询参数**：
  - `format`（可选）： 备份格式 - `db`（二进制）或 `sql`（SQL 转储）。默认：`db`
- **响应**：
  - Content-Type： `application/octet-stream` (for .db) or `text/plain` (for .sql)
  - Content-Disposition： `attachment; filename="duplistatus-backup-YYYY-MM-DDTHH-MM-SS.db"` or `.sql`
  - 二进制文件内容（.db）或 SQL 文本内容（.sql）
- **错误响应**：
  - `400`: 格式无效（必须为 "db" 或 "sql"）
  - `401`: 未授权 - 会话或 CSRF 令牌无效
  - `403`: 禁止 - 需要管理员权限
  - `500`: 创建数据库备份失败
- **说明**：
  - 仅管理员可访问
  - 二进制格式使用 SQLite 备份方法保证完整性
  - SQL 格式创建所有数据库内容的文本转储
  - 文件名中的时间戳使用服务器本地时区
  - 备份操作记录到审计日志
  - 下载后自动清理临时文件

### 还原数据库 - `/api/database/restore` {#restore-database---apidatabaserestore}
- **端点**： `/api/database/restore`
- **方法**： POST
- **描述**： 从备份文件（.db 或 .sql 格式）还原数据库。还原前创建安全备份，还原后为安全起见清除所有会话。
- **认证**： 需要管理员权限、有效会话和 CSRF 令牌
- **请求体**： FormData with a file field named `database`
  - 文件必须为 `.db`, `.sqlite`, `.sqlite3` (binary format) or `.sql` (SQL format)
  - 最大文件大小：100MB
- **响应**：
  ```json
  {
    "success": true,
    "message": "Database restored successfully from DB file",
    "safetyBackupPath": "duplistatus-backup-YYYY-MM-DDTHH-MM-SS.db",
    "requiresReauth": true
  }
  ```
- **错误响应**：
  - `400`: 未提供文件、文件大小超限、文件格式无效或数据库完整性检查失败
  - `401`: 未授权 - 会话或 CSRF 令牌无效
  - `403`: 禁止 - 需要管理员权限
  - `500`: 还原数据库失败（若还原失败则从安全备份恢复原始数据库）
- **说明**：
  - 仅管理员可访问
  - 还原前自动创建安全备份
  - 支持二进制（.db）和 SQL（.sql）格式
  - 还原后验证数据库完整性
  - 若还原失败，自动从安全备份恢复
  - 成功还原后为安全起见清除所有会话
  - 返回 `requiresReauth: true` 表示用户需重新登录
  - 还原操作记录到审计日志
  - 对于 SQL 格式，执行前验证 SQL 内容
  - 还原后重新初始化数据库连接
  - 还原后使所有缓存失效

## 备份时间戳 {#backup-timestamps}

### 获取最后备份时间戳 - `/api/backups/last-timestamps` {#get-last-backup-timestamps---apibackupslast-timestamps}
- **端点**： `/api/backups/last-timestamps`
- **方法**： GET
- **描述**： 检索每个服务器-备份组合的最后备份时间戳。返回便于查找的映射。
- **认证**： 需要有效会话和 CSRF 令牌
- **响应**：
  ```json
  {
    "timestamps": {
      "server-id-1:Backup Name 1": "2024-03-20T10:00:00Z",
      "server-id-1:Backup Name 2": "2024-03-20T11:00:00Z",
      "server-id-2:Backup Name 1": "2024-03-20T12:00:00Z"
    },
    "raw": [
      {
        "server_name": "Server Name",
        "server_id": "server-id-1",
        "backup_name": "Backup Name 1",
        "date": "2024-03-20T10:00:00Z"
      }
    ]
  }
  ```
- **错误响应**：
  - `401`: 未授权 - 会话或 CSRF 令牌无效
  - `500`: 获取最后备份时间戳失败
- **说明**：
  - 同时返回映射（便于按 `server_id:backup_name` 查找）和原始数组格式
  - 包含缓存控制头以防止缓存
  - 便于跟踪所有服务器-备份组合的最后备份时间
  - 时间戳为 ISO 格式

## 应用程序日志管理 {#application-logs-management}

### 获取应用程序日志 - `/api/application-logs` {#get-application-logs---apiapplication-logs}
- **端点**： `/api/application-logs`
- **方法**： GET
- **描述**： 从日志文件检索应用程序日志条目。支持读取当前和轮转的日志文件，具有 tail 功能。
- **认证**： 需要管理员权限、有效会话和 CSRF 令牌
- **查询参数**：
  - `file`（可选）： 要读取的日志文件名 - `application.log`、`application.log.1`、`application.log.2` 等。若未提供，返回可用文件列表
  - `tail`（可选）： 从文件末尾返回的行数（默认：1000，最小：1，最大：10000）
- **响应**（含 file 参数）：
  ```json
  {
    "logs": "log content as string...",
    "fileSize": 1024000,
    "lastModified": "2024-03-20T10:00:00Z",
    "lineCount": 5000,
    "currentFile": "application.log",
    "availableFiles": ["application.log", "application.log.1", "application.log.2"]
  }
  ```
- **响应**（不含 file 参数）：
  ```json
  {
    "logs": "",
    "fileSize": 0,
    "lastModified": "2024-03-20T10:00:00Z",
    "lineCount": 0,
    "currentFile": "",
    "availableFiles": ["application.log", "application.log.1", "application.log.2"]
  }
  ```
- **错误响应**：
  - `400`: tail 参数无效（必须为 1-10000）或 file 参数格式无效
  - `401`: 未授权 - 会话或 CSRF 令牌无效
  - `403`: 禁止 - 需要管理员权限
  - `404`: 未找到日志文件
  - `500`: 读取日志文件失败
- **说明**：
  - 仅管理员可访问
  - 支持读取当前日志文件和轮转日志文件（最多 10 个轮转文件）
  - 返回指定日志文件的最后 N 行（tail）
  - 日志文件名由环境变量决定（默认：`application.log`）
  - 未提供 file 参数时返回可用日志文件列表
  - 验证文件名以防止目录遍历攻击
  - 轮转文件按顺序编号（`.1`、`.2` 等）

### 导出应用程序日志 - `/api/application-logs/export` {#export-application-logs---apiapplication-logsexport}
- **端点**： `/api/application-logs/export`
- **方法**： GET
- **描述**： 以过滤文本格式导出应用程序日志条目。支持按日志级别和搜索字符串筛选。
- **认证**： 需要管理员权限、有效会话和 CSRF 令牌
- **查询参数**：
  - `file`（必填）： 要导出的日志文件名 - `application.log`、`application.log.1`、`application.log.2` 等
  - `logLevels`（可选）： 要包含的日志级别逗号分隔列表 - `INFO`、`WARN`、`ERROR`（默认：`INFO,WARN,ERROR`）
  - `search`（可选）： 筛选日志行的搜索字符串（不区分大小写）
- **响应**：
  - Content-Type： `text/plain`
  - Content-Disposition： `attachment; filename="duplistatus-logs-YYYY-MM-DDTHH-MM-SS.txt"`
  - 过滤后的纯文本日志内容
- **错误响应**：
  - `400`: 需要 file 参数或 file 参数格式无效
  - `401`: 未授权 - 会话或 CSRF 令牌无效
  - `403`: 禁止 - 需要管理员权限
  - `500`: 导出日志失败
- **说明**：
  - 仅管理员可访问
  - 根据日志级别和搜索条件导出过滤后的日志条目
  - 支持按日志级别筛选：`INFO`、`WARN`、`ERROR`
  - 搜索字符串筛选不区分大小写
  - 自动过滤空行
  - 日志文件名由环境变量决定（默认：`application.log`）
  - 验证文件名以防止目录遍历攻击
  - 导出文件名包含时间戳
  - 适用于外部分析和故障排除
