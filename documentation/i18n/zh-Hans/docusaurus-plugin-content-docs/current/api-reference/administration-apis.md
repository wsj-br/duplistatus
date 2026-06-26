# 管理 {#administration}

## 收集备份 - `/api/backups/collect` {#collect-backups---apibackupscollect}
- **端点**: `/api/backups/collect`
- **方法**: POST
- **描述**: 通过 Duplicati 服务器的 API 直接从 Duplicati 服务器收集备份数据。该端点自动检测最佳连接协议（HTTPS 与 SSL 验证、HTTPS 与自签名证书或 HTTP 作为回退）并连接到 Duplicati 服务器以检索备份信息并将其处理到本地数据库。
- **身份验证**: 需要有效的会话和 CSRF 令牌
- **请求体**:

  ```json
  {
    "hostname": "duplicati-server.local",
    "port": 8200,
    "password": "your-password",
    "downloadJson": false
  }
  ```

- **响应**:

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

- **错误响应**:
  - `400`: 无效的请求参数或连接失败
  - `500`: 备份收集期间服务器错误
- **注意**: 
  - 端点自动检测最佳连接协议（HTTPS → HTTPS 自签名 → HTTP）
  - 协议检测尝试按照安全首选顺序进行
  - 连接超时可以通过环境变量配置
  - 在开发模式下记录收集的数据以进行调试
  - 确保所有服务器和备份的备份设置完整
  - 如果未指定，则使用默认端口 8200
  - 自动将检测到的协议和服务器 URL 存储在数据库中
  - `serverAlias` 从数据库中检索，可能为空如果未设置别名
  - 前端应使用 `serverAlias || serverName` 进行显示目的
  - 支持 JSON 下载和直接 API 收集方法

## 清理备份 - `/api/backups/cleanup` {#cleanup-backups---apibackupscleanup}
- **端点**: `/api/backups/cleanup`
- **方法**: POST
- **描述**: 根据保留期删除旧的备份数据。该端点通过删除过时的备份记录来帮助管理数据库大小，同时保留最近和重要的数据。
- **身份验证**: 需要有效的会话和 CSRF 令牌
- **请求体**:

  ```json
  {
    "retentionPeriod": "6 months"
  }
  ```

- **保留期**: `"6 months"`, `"1 year"`, `"2 years"`, `"Delete all data"`
- **响应**:

  ```json
  {
    "message": "Successfully deleted 15 old backups",
    "status": 200
  }
  ```

对于 "删除所有数据" 选项:

  ```json
  {
    "message": "Successfully deleted all 15 backups and 3 servers, and cleared configuration settings",
    "status": 200
  }
  ```

- **错误响应**:
  - `401`: 未经授权 - 无效的会话或 CSRF 令牌
  - `400`: 指定的保留期无效
  - `500`: 清理操作期间服务器错误，包含详细的错误信息
- **注意**: 
  - 清理操作是不可逆的
  - 备份数据从数据库中永久删除
  - 即使所有备份都被删除，机器记录也会被保留
  - 当 "删除所有数据" 被选中时，所有机器和备份都将被删除，配置将被清除
  - 增强的错误报告包括开发模式下的详细信息和堆栈跟踪
  - 支持基于时间的保留和完整数据删除

## 删除备份作业 - `/api/backups/delete-job` {#delete-backup-job---apibackupsdelete-job}
- **端点**: `/api/backups/delete-job`
- **方法**: DELETE
- **描述**: 删除特定服务器-备份组合的所有备份记录。该端点仅在开发模式下可用。
- **身份验证**: 需要有效的会话和 CSRF 令牌
- **请求体**:

  ```json
  {
    "serverId": "server-id",
    "backupName": "Backup Name"
  }
  ```

- **响应**:

  ```json
  {
    "message": "Successfully deleted 5 backup record(s) for \"Files\" from server \"My Server\"",
    "status": 200,
    "deletedCount": 5,
    "serverName": "My Server",
    "backupName": "Files"
  }
  ```

- **错误响应**:
  - `401`: 未经授权 - 无效的会话或 CSRF 令牌
  - `403`: 备份作业删除仅在开发模式下可用
  - `400`: 服务器 ID 和备份名称是必需的
  - `404`: 没有找到要删除的备份
  - `500`: 删除期间服务器错误，包含详细的错误信息
- **注意**: 
  - 该操作仅在开发模式下可用
  - 此操作不可逆
  - 将永久删除指定服务器备份组合的所有备份记录
  - 返回删除的备份数量和服务器信息
  - 如果可用，使用服务器别名显示，否则回退到服务器名称

## 同步备份计划 - `/api/backups/sync-schedule` {#sync-backup-schedules---apibackupssync-schedule}
- **端点**: `/api/backups/sync-schedule`
- **方法**: POST
- **描述**: 从Duplicati服务器同步备份计划信息。此端点连接到服务器，检索所有备份的计划信息，并使用计划详细信息（包括重复间隔、允许的周几和计划时间）更新本地备份设置。
- **身份验证**: 需要有效的会话和 CSRF 令牌
- **请求体**:

  ```json
  {
    "hostname": "duplicati-server.local",
    "port": 8200,
    "password": "your-password",
    "serverId": "optional-server-id"
  }
  ```

或仅使用serverId（使用存储的密码）:

  ```json
  {
    "serverId": "server-id"
  }
  ```

或使用serverId和更新的凭据:

  ```json
  {
    "serverId": "server-id",
    "hostname": "new-hostname.local",
    "port": 8200,
    "password": "new-password"
  }
  ```

- **响应**:

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

带有错误:

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

- **错误响应**:
  - `400`: 无效的请求参数、缺少主机名/密码或连接失败
  - `404`: 服务器未找到（当提供serverId时）或没有为服务器存储密码
  - `500`: 在计划同步期间发生服务器错误
- **注意**: 
  - 端点自动检测最佳连接协议（HTTPS → HTTPS带自签名 → HTTP)
  - 可以仅使用serverId调用以使用存储的服务器凭据
  - 可以使用serverId和新凭据调用以更新服务器连接详细信息
  - 可以使用主机名/端口/密码而不使用serverId调用新的服务器
  - 使用计划信息更新备份设置，包括:
    - `expectedInterval`: 重复间隔（例如“每日”，“每周”，“每月”）
    - `allowedWeekDays`: 允许的周几数组（0=星期日，1=星期一等）
    - `time`: 备份的计划时间
  - 处理服务器上找到的所有备份
  - 返回处理的备份和遇到的任何错误的统计信息
  - 记录成功和失败的同步操作的审计事件
  - 如果未指定，则使用默认端口8200

## 测试服务器连接 - `/api/servers/test-connection` {#test-server-connection---apiserverstest-connection}
- **端点**: `/api/servers/test-connection`
- **方法**: POST
- **描述**: 测试连接到Duplicati服务器以验证其可访问性。
- **请求体**:

  ```json
  {
    "server_url": "http://localhost:8200"
  }
  ```

- **响应**:

  ```json
  {
    "success": true,
    "message": "Connection successful"
  }
  ```

- **错误响应**:
  - `400`: 无效的URL格式或缺少服务器URL
  - `500`: 在连接测试期间发生服务器错误
- **注意**: 
  - 端点验证URL格式并测试连接性
  - 如果服务器用401状态（无凭据的登录端点的预期状态）响应，则返回成功
  - 测试连接到Duplicati服务器的登录端点
  - 支持HTTP和HTTPS协议
  - 使用超时配置进行连接测试

## 获取服务器URL - `/api/servers/:serverId/server-url` {#get-server-url---apiserversserveridserver-url}
- **端点**: `/api/servers/:serverId/server-url`
- **方法**: GET
- **描述**: 为特定服务器检索服务器URL。
- **参数**:
  - `serverId`: 服务器标识符

- **响应**:

  ```json
  {
    "serverId": "server-id",
    "server_url": "http://localhost:8200"
  }
  ```

- **错误响应**:
  - `404`: 服务器未找到
  - `500`: 服务器错误
- **注意**:
  - 返回特定服务器的服务器 URL
  - 用于服务器连接管理
  - 如果没有设置服务器 URL，则返回空字符串

## 更新服务器 URL - `/api/servers/:serverId/server-url` {#update-server-url---apiserversserveridserver-url}
- **端点**: `/api/servers/:serverId/server-url`
- **方法**: PATCH
- **描述**: 更新特定服务器的服务器 URL。
- **身份验证**: 需要有效的会话和 CSRF 令牌
- **参数**:
  - `serverId`: 服务器标识符
- **请求体**:

  ```json
  {
    "server_url": "http://localhost:8200"
  }
  ```

- **响应**:

  ```json
  {
    "message": "Server URL updated successfully",
    "serverId": "server-id",
    "serverName": "Server Name",
    "server_url": "http://localhost:8200"
  }
  ```

- **错误响应**:
  - `401`: 未经授权 - 无效的会话或 CSRF 令牌
  - `400`: 无效的 URL 格式
  - `404`: 服务器未找到
  - `500`: 更新期间发生服务器错误
- **注意**: 
  - 端点在更新之前验证 URL 格式
  - 允许空或 null 服务器 URL
  - 支持 HTTP 和 HTTPS 协议
  - 返回更新的服务器信息

## 获取服务器密码 - `/api/servers/:serverId/password` {#get-server-password---apiserversserveridpassword}
- **端点**: `/api/servers/:serverId/password`
- **方法**: GET
- **描述**:检索服务器密码操作的 CSRF 令牌。
- **身份验证**: 需要有效的会话
- **参数**:
  - `serverId`: 服务器标识符
- **响应**:

  ```json
  {
    "csrfToken": "csrf-token-string",
    "serverId": "server-id"
  }
  ```

- **错误响应**:
  - `401`: 无效或过期的会话
  - `500`: 生成 CSRF 令牌失败
- **注意事项**:
  - 返回用于密码更新操作的 CSRF 令牌
  - 会话必须有效才能生成令牌

## 更新服务器密码 - `/api/servers/:serverId/password` {#update-server-password---apiserversserveridpassword}
- **端点**: `/api/servers/:serverId/password`
- **方法**: PATCH
- **描述**: 更新特定服务器的密码。
- **身份验证**: 需要有效的会话和 CSRF 令牌
- **参数**:
  - `serverId`: 服务器标识符
- **请求体**:

  ```json
  {
    "password": "new-password"
  }
  ```

- **响应**:

  ```json
  {
    "message": "Password updated successfully",
    "serverId": "server-id"
  }
  ```

- **错误响应**:
  - `400`: 密码必须是字符串
  - `401`: 未经授权 - 无效的会话或 CSRF 令牌
  - `500`: 更新密码失败
- **注意**:
  - 密码可以是空字符串以清除密码
  - 密码使用密钥管理系统安全存储

## 用户管理 {#user-management}

### 列出用户 - `/api/users` {#list-users---apiusers}
- **端点**: `/api/users`
- **方法**: GET
- **描述**: 列出所有用户，具有分页和可选的搜索过滤。返回用户信息，包括登录历史和帐户状态。
- **身份验证**: 需要管理员权限，有效的会话和 CSRF 令牌
- **查询参数**:
  - `page` （可选）：页码（默认：1）
  - `limit` （可选）：每页项数（默认：50）
  - `search` （可选）：搜索用户名的关键词
- **响应**:

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

- **错误响应**:
  - `401`：未经授权 - 无效的会话或CSRF令牌
  - `403`：禁止 - 需要管理员权限
  - `500`：服务器内部错误
- **注意**:
  - 只有管理员用户可以访问
  - 支持分页和搜索筛选
  - 返回用户账户状态，包括锁定状态

### 创建用户 - `/api/users` {#create-user---apiusers}
- **端点**: `/api/users`
- **方法**: POST
- **描述**: 创建一个新的用户账户。可以生成一个临时密码或使用提供的密码。
- **身份验证**: 需要管理员权限、有效会话和 CSRF 令牌
- **请求体**:

  ```json
  {
    "username": "newuser",
    "password": "optional-password",
    "isAdmin": false,
    "requirePasswordChange": true
  }
  ```

- `username`: 必需，必须是3-50个字符，唯一
  - `password`: 可选，如果没有提供，则生成一个安全的临时密码
  - `isAdmin`: 可选，默认为false
  - `requirePasswordChange`: 可选，默认为true
- **响应**:

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

- `temporaryPassword` 只在自动生成密码时包含
- **错误响应**:
  - `400`：无效的用户名格式，密码策略违规或验证错误
  - `401`：未经授权 - 无效的会话或CSRF令牌
  - `403`：禁止 - 需要管理员权限
  - `409`：用户名已存在
  - `500`：服务器内部错误
- **注意**:
  - 只有管理员用户可以访问
  - 用户名是大小写不敏感的，并以小写形式存储
  - 如果没有提供密码，则生成一个安全的12个字符的密码
  - 生成的临时密码只在响应中返回一次
  - 用户创建被记录到审计日志

### 更新用户 - `/api/users/:id` {#update-user---apiusersid}
- **端点**: `/api/users/:id`
- **方法**: PATCH
- **描述**: 更新用户信息，包括用户名，管理员状态，密码更改要求和密码重置。
- **身份验证**: 需要管理员权限，有效的会话和CSRF令牌
- **参数**:
  - `id`: 要更新的用户ID
- **请求体**:

  ```json
  {
    "username": "updated-username",
    "isAdmin": true,
    "requirePasswordChange": false,
    "resetPassword": true
  }
  ```

- 所有字段都是可选的
  - `resetPassword`: 如果为true，则生成一个新的临时密码并将 `requirePasswordChange` 设置为true
- **响应** （带密码重置）：

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

- **响应** （不带密码重置）：

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

- **错误响应**:
  - `400`: 无效的输入或验证错误
  - `401`: 未经授权 - 无效的会话或CSRF令牌
  - `403`: 禁止 - 需要管理员权限
  - `404`: 未找到用户
  - `409`: 用户名已存在（如果更改用户名）
  - `500`: 服务器内部错误
- **注意**:
  - 只有管理员用户可以访问
  - 用户名更改被验证为唯一
  - 密码重置生成一个安全的12个字符的临时密码
  - 所有的更改被记录到审计日志

### 删除用户 - `/api/users/:id` {#delete-user---apiusersid}
- **端点**: `/api/users/:id`
- **方法**: DELETE
- **描述**: 删除一个用户账户。防止删除自己或最后一个管理员账户。
- **身份验证**: 需要管理员权限，有效的会话和CSRF令牌
- **参数**:
  - `id`: 要删除的用户ID
- **响应**:

  ```json
  {
    "success": true,
    "message": "User deleted successfully"
  }
  ```

- **错误响应**:
  - `400`: 不能删除自己的帐户或最后一个管理员帐户
  - `401`: 未经授权 - 无效会话或 CSRF 令牌
  - `403`: 禁止 - 需要管理员权限
  - `404`: 未找到用户
  - `500`: 服务器内部错误
- **注意**:
  - 只有管理员用户可以访问
  - 不能删除自己的帐户
  - 不能删除最后一个管理员帐户（至少必须保留一个管理员）
  - 用户删除将被记录到审计日志
  - 关联的会话将被自动删除（级联）

## 审计日志管理 {#audit-log-management}

### 列出审计日志 - `/api/audit-log` {#list-audit-logs---apiaudit-log}
- **端点**: `/api/audit-log`
- **方法**: GET
- **描述**: 检索审计日志条目，具有过滤、分页和搜索功能。支持基于页和偏移的分页。
- **身份验证**: 需要有效的会话和 CSRF 令牌（需要登录用户）
- **查询参数**:
  - `page` （可选）：基于页的分页的页码
  - `offset` （可选）：偏移量，用于偏移量分页（优先于页）
  - `limit` （可选）：每页项目数（默认：50）
  - `startDate` （可选）：从此日期筛选日志（ISO 格式）
  - `endDate` （可选）：到此日期筛选日志（ISO 格式）
  - `userId` （可选）：按用户 ID 筛选
  - `username` （可选）：按用户名筛选
  - `action` （可选）：按操作名称筛选
  - `category` （可选）：按类别筛选（`auth`，`user_management`，`config`，`backup`，`server`）
  - `status` （可选）：按状态筛选（`success`，`failure`，`error`）
- **响应**:

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

- **错误响应**:
  - `401`: 未经授权 - 无效会话或 CSRF 令牌
  - `500`: 服务器内部错误
- **注意**:
  - 支持基于页（`page`）和偏移量（`offset`）的分页
  - `details` 字段包含带有附加上下文的解析 JSON
  - 所有审计日志查询都被记录

### 获取审计日志筛选值 - `/api/audit-log/filters` {#get-audit-log-filter-values---apiaudit-logfilters}
- **端点**: `/api/audit-log/filters`
- **方法**: GET
- **描述**: 检索用于筛选审计日志的唯一筛选值。返回审计日志数据库中存在的所有操作、类别和状态的所有不同值。用于填充 UI 中的筛选下拉菜单。
- **身份验证**: 需要有效的会话和 CSRF 令牌（需要登录用户）
- **响应**:

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

- **错误响应**:
  - `401`: 未经授权 - 无效会话或 CSRF 令牌
  - `500`: 服务器内部错误
- **注意**:
  - 返回审计日志数据库中的唯一值数组
  - 值按字母顺序排序
  - 如果没有数据或出错，返回空数组
  - 由审计日志查看器用于动态填充筛选下拉菜单

### 下载审计日志 - `/api/audit-log/download` {#download-audit-logs---apiaudit-logdownload}
- **端点**: `/api/audit-log/download`
- **方法**: GET
- **描述**: 下载审计日志，以 CSV 或 JSON 格式，具有可选筛选功能。用于外部分析和报告。
- **身份验证**: 需要有效的会话和 CSRF 令牌（需要登录用户）
- **查询参数**:
  - `format` （可选）：导出格式 - `csv` 或 `json` （默认：`csv`）
  - `startDate` （可选）：从此日期筛选日志（ISO 格式）
  - `endDate` （可选）：到此日期筛选日志（ISO 格式）
  - `userId` （可选）：按用户 ID 筛选
  - `username` （可选）：按用户名筛选
  - `action` （可选）：按操作名称筛选
  - `category` （可选）：按类别筛选
  - `status` （可选）：按状态筛选
- **响应**（CSV）:
  - Content-Type: `text/csv`
  - Content-Disposition: `attachment; filename="audit-log-YYYY-MM-DD.csv"`
  - 带有标题的 CSV 文件：ID、时间戳、用户 ID、用户名、操作、类别、目标类型、目标 ID、状态、IP 地址、用户代理、详细信息、错误消息
- **响应**（JSON）:
  - Content-Type: `application/json`
  - Content-Disposition: `attachment; filename="audit-log-YYYY-MM-DD.json"`
  - JSON 数组的审计日志条目
- **错误响应**:
  - `400`: 没有日志导出
  - `401`: 未经授权 - 无效会话或 CSRF 令牌
  - `500`: 服务器内部错误
- **注意事项**:
  - 导出限制为 10,000 条记录
  - CSV 格式正确转义特殊字符
  - CSV 中的详细信息字段是 JSON 字符串化的
  - 文件名包含当前日期

### 清理审计日志 - `/api/audit-log/cleanup` {#cleanup-audit-logs---apiaudit-logcleanup}
- **端点**: `/api/audit-log/cleanup`
- **方法**: POST
- **描述**: 手动触发基于保留期的旧审计日志清理。支持 dry-run 模式以预览将要删除的内容。
- **身份验证**: 需要管理员权限、有效会话和 CSRF 令牌
- **请求体**:

  ```json
  {
    "retentionDays": 90,
    "dryRun": false
  }
  ```

- `retentionDays` （可选）: 覆盖保留天数（30-365），否则使用配置值
  - `dryRun` （可选）: 如果为 true，则仅返回将要删除的内容而不实际删除
- **响应** （dry run）：

  ```json
  {
    "dryRun": true,
    "wouldDeleteCount": 50,
    "oldestRemaining": "2024-01-01T00:00:00Z",
    "retentionDays": 90,
    "cutoffDate": "2024-01-01"
  }
  ```

- **响应** （实际清理）：

  ```json
  {
    "success": true,
    "deletedCount": 50,
    "oldestRemaining": "2024-01-01T00:00:00Z",
    "retentionDays": 90
  }
  ```

- **错误响应**:
  - `400`: 无效的保留天数（必须为 30-365）
  - `401`: 未经授权 - 无效会话或 CSRF 令牌
  - `403`: 禁止 - 需要管理员权限
  - `500`: 服务器内部错误
- **注意事项**:
  - 仅对管理员用户可访问
  - 如果未配置，则默认保留期为 90 天
  - 清理操作记录到审计日志
  - dry-run 模式用于预览清理影响

### 获取审计日志保留期 - `/api/audit-log/retention` {#get-audit-log-retention---apiaudit-logretention}
- **端点**: `/api/audit-log/retention`
- **方法**: GET
- **描述**: 检索当前审计日志保留配置（天数）。
- **身份验证**: 需要有效会话和 CSRF 令牌（无需登录用户）
- **响应**:

  ```json
  {
    "retentionDays": 90
  }
  ```

- **错误响应**:
  - `500`: 服务器内部错误
- **注意事项**:
  - 如果未配置，则默认保留期为 90 天
  - 可以在无需身份验证的情况下访问（只读）

### 更新审计日志保留期 - `/api/audit-log/retention` {#update-audit-log-retention---apiaudit-logretention}
- **端点**: `/api/audit-log/retention`
- **方法**: PATCH
- **描述**: 更新审计日志保留期（天数）。此设置决定审计日志在自动清理之前保留多长时间。
- **身份验证**: 需要管理员权限、有效会话和 CSRF 令牌
- **请求体**:

  ```json
  {
    "retentionDays": 120
  }
  ```

- `retentionDays`: 必需，必须在 30 到 365 天之间
- **响应**:

  ```json
  {
    "success": true,
    "retentionDays": 120
  }
  ```

- **错误响应**:
  - `400`: 无效的保留天数（必须为 30-365）
  - `401`: 未经授权 - 无效会话或 CSRF 令牌
  - `403`: 禁止 - 需要管理员权限
  - `500`: 服务器内部错误
- **注意事项**:
  - 仅对管理员用户可访问
  - 配置更改记录到审计日志
  - 保留期影响自动和手动清理操作

## 数据库管理 {#database-management}

### 备份数据库 - `/api/database/backup` {#backup-database---apidatabasebackup}
- **端点**: `/api/database/backup`
- **方法**: GET
- **描述**: 创建数据库的备份，格式可以是二进制 (.db) 或 SQL (.sql)。备份文件将自动下载，文件名中包含时间戳。
- **身份验证**: 需要管理员权限、有效的会话和 CSRF 令牌
- **查询参数**:
  - `format` (可选): 备份格式 - `db` (二进制) 或 `sql` (SQL 导出)。默认: `db`
- **响应**:
  - Content-Type: `application/octet-stream` (用于 .db) 或 `text/plain` (用于 .sql)
  - Content-Disposition: `attachment; filename="duplistatus-backup-YYYY-MM-DDTHH-MM-SS.db"` 或 `.sql`
  - 二进制文件内容 (用于 .db) 或 SQL 文本内容 (用于 .sql)
- **错误响应**:
  - `400`: 无效的格式 (必须是 "db" 或 "sql")
  - `401`: 未经授权 - 无效的会话或 CSRF 令牌
  - `403`: 禁止 - 需要管理员权限
  - `500`: 失败创建数据库备份
- **注意**:
  - 只能由管理员用户访问
  - 二进制格式使用 SQLite 的备份方法以确保完整性
  - SQL 格式创建所有数据库内容的文本导出
  - 文件名中的时间戳使用服务器的本地时区
  - 备份操作记录在审计日志中
  - 下载后自动清除临时文件

### 恢复数据库 - `/api/database/restore` {#restore-database---apidatabaserestore}
- **端点**: `/api/database/restore`
- **方法**: POST
- **描述**: 从备份文件 (.db 或 .sql 格式) 恢复数据库。在恢复之前创建安全备份，并在恢复后清除所有会话以确保安全。
- **身份验证**: 需要管理员权限、有效的会话和 CSRF 令牌
- **请求体**: FormData，包含一个名为 `database` 的文件字段
  - 文件必须是 `.db`、`.sqlite`、`.sqlite3` (二进制格式) 或 `.sql` (SQL 格式)
  - 最大文件大小: 100MB
- **响应**:

  ```json
  {
    "success": true,
    "message": "Database restored successfully from DB file",
    "safetyBackupPath": "duplistatus-backup-YYYY-MM-DDTHH-MM-SS.db",
    "requiresReauth": true
  }
  ```

- **错误响应**:
  - `400`: 没有提供文件、文件大小超过限制、无效的文件格式或数据库完整性检查失败
  - `401`: 未经授权 - 无效的会话或 CSRF 令牌
  - `403`: 禁止 - 需要管理员权限
  - `500`: 失败恢复数据库 (如果恢复失败，原始数据库将从安全备份中恢复)
- **注意**:
  - 只能由管理员用户访问
  - 自动在恢复之前创建安全备份
  - 支持二进制 (.db) 和 SQL (.sql) 格式
  - 恢复后验证数据库完整性
  - 如果恢复失败，自动从安全备份中恢复
  - 恢复后清除所有会话以确保安全
  - 返回 `requiresReauth: true` 以指示用户需要重新登录
  - 恢复操作记录在审计日志中
  - 对于 SQL 格式，执行前验证 SQL 内容
  - 恢复后重新初始化数据库连接
  - 恢复后所有缓存都将失效

## 备份时间戳 {#backup-timestamps}

### 获取最后备份时间戳 - `/api/backups/last-timestamps` {#get-last-backup-timestamps---apibackupslast-timestamps}
- **端点**: `/api/backups/last-timestamps`
- **方法**: GET
- **描述**: 检索每个服务器-备份组合的最后备份时间戳。返回一个映射以便于查找。
- **身份验证**: 需要有效的会话和 CSRF 令牌
- **响应**:

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

- **错误响应**:
  - `401`: 未经授权 - 无效的会话或 CSRF 令牌
  - `500`: 失败获取最后备份时间戳
- **注意**:
  - 返回一个映射 (用于通过 `server_id:backup_name` 查找) 和原始数组格式
  - 包括缓存控制头以防止缓存
  - 有助于跟踪所有服务器-备份组合的最后备份时间
  - 时间戳采用 ISO 格式

## 应用程序日志管理 {#application-logs-management}

### 获取应用程序日志 - `/api/application-logs` {#get-application-logs---apiapplication-logs}
- **端点**: `/api/application-logs`
- **方法**: GET
- **描述**: 从日志文件中检索应用程序日志条目。支持读取当前和轮换日志文件，具有尾部功能。
- **身份验证**: 需要管理员权限、有效会话和CSRF令牌
- **查询参数**:
  - `file` （可选）: 要读取的日志文件名 - `application.log`、`application.log.1`、`application.log.2`等。如果未提供，则返回可用文件列表
  - `tail` （可选）: 从文件末尾返回的行数（默认：1000，最低：1，最大：10000）
- **响应** （带文件参数）:

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

- **响应** （无文件参数）:

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

- **错误响应**:
  - `400`: 无效的尾部参数（必须为1-10000）或无效的文件参数格式
  - `401`: 未经授权 - 无效会话或CSRF令牌
  - `403`: 禁止 - 需要管理员权限
  - `404`: 未找到日志文件
  - `500`: 未能读取日志文件
- **注意**:
  - 只对管理员用户可访问
  - 支持读取当前日志文件和轮换日志文件（最多10个轮换文件）
  - 从指定日志文件返回最后N行（尾部）
  - 日志文件名由环境变量确定（默认：`application.log`）
  - 当文件参数未提供时，返回可用日志文件列表
  - 文件名经过验证以防止目录遍历攻击
  - 轮换文件按顺序编号（`.1`、`.2`等）

### 导出应用程序日志 - `/api/application-logs/export` {#export-application-logs---apiapplication-logsexport}
- **端点**: `/api/application-logs/export`
- **方法**: GET
- **描述**: 以过滤的文本格式导出应用程序日志条目。支持按日志级别和搜索字符串过滤。
- **身份验证**: 需要管理员权限、有效会话和CSRF令牌
- **查询参数**:
  - `file` （必填）: 要导出的日志文件名 - `application.log`、`application.log.1`、`application.log.2`等。
  - `logLevels` （可选）: 逗号分隔的日志级别列表，包括 - `INFO`、`WARN`、`ERROR`（默认：`INFO,WARN,ERROR`）
  - `search` （可选）: 用于过滤日志行的搜索字符串（不区分大小写）
- **响应**:
  - Content-Type: `text/plain`
  - Content-Disposition: `attachment; filename="duplistatus-logs-YYYY-MM-DDTHH-MM-SS.txt"`
  - 过滤后的日志内容作为纯文本
- **错误响应**:
  - `400`: 文件参数是必需的或无效的文件参数格式
  - `401`: 未经授权 - 无效会话或CSRF令牌
  - `403`: 禁止 - 需要管理员权限
  - `500`: 导出日志失败
- **注意**:
  - 只对管理员用户可访问
  - 根据日志级别和搜索标准导出过滤后的日志条目
  - 支持按日志级别过滤：`INFO`、`WARN`、`ERROR`
  - 搜索字符串过滤不区分大小写
  - 自动过滤空行
  - 日志文件名由环境变量确定（默认：`application.log`）
  - 文件名经过验证以防止目录遍历攻击
  - 导出的文件名中包含时间戳
  - 有助于外部分析和故障排除
