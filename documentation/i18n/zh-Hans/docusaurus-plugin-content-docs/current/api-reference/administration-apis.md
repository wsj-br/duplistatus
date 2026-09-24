# 管理员 {/* #administration */}

## 收集备份 - `/api/backups/collect` {/* #collect-backups---apibackupscollect */}
- **端点**: `/api/backups/collect`
- **方法**: POST
- **描述**: 通过 API 直接从 Duplicati 服务器收集备份数据。此端点自动检测最佳连接协议（带 SSL 验证的 HTTPS、带自签名证书的 HTTPS 或作为备选的 HTTP），并连接到 Duplicati 服务器以检索备份信息并将其处理到本地数据库中。
- **认证**：需要有效的会话和 CSRF 令牌
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

- **错误响应**:
  - `400`: 请求参数无效或连接失败
  - `500`: 备份收集期间发生服务器错误
- **注意事项**: 
  - 端点自动检测最佳连接协议（HTTPS → 带自签名证书的 HTTPS → HTTP）
  - 协议检测按安全偏好顺序进行
  - 连接超时可通过环境变量配置
  - 在开发模式下记录收集的数据用于调试
  - 确保所有服务器和备份的备份设置完整
  - 如果未指定则使用默认端口 8200
  - 检测到的协议和服务器 URL 将自动存储在数据库中
  - `serverAlias` 从数据库中检索，如果未设置别名则可能为空
  - 前端应使用 `serverAlias || serverName` 进行显示
  - 支持 JSON 下载和直接 API 收集方法

## 清理备份 - `/api/backups/cleanup` {/* #cleanup-backups---apibackupscleanup */}
- **端点**: `/api/backups/cleanup`
- **方法**: POST
- **描述**: 根据保留期删除旧备份数据。此端点通过删除过时的备份记录来帮助管理数据库大小，同时保留最近和重要的数据。
- **认证**：需要有效的会话和 CSRF 令牌
- **请求体**：

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

对于“删除所有数据”选项：

  ```json
  {
    "message": "Successfully deleted all 15 backups and 3 servers, and cleared configuration settings",
    "status": 200
  }
  ```

- **错误响应**:
  - `401`: 未授权 - 会话或 CSRF 令牌无效
  - `400`: 指定的保留期无效
  - `500`: 清理操作期间发生服务器错误，包含详细错误信息
- **注意事项**: 
  - 清理操作不可逆
  - 备份数据将从数据库中永久删除
  - 即使删除了所有备份，机器记录也会被保留
  - 当选择“删除所有数据”时，所有机器和备份都将被移除且配置被清除
  - 增强的错误报告在开发模式下包含详细信息和堆栈跟踪
  - 支持基于时间的保留和完全数据删除

## 删除备份任务 - `/api/backups/delete-job` {/* #delete-backup-job---apibackupsdelete-job */}
- **端点**: `/api/backups/delete-job`
- **方法**: DELETE
- **描述**: 删除特定服务器-备份组合的所有备份记录。此端点仅在开发模式下可用。
- **认证**：需要有效的会话和 CSRF 令牌
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

- **错误响应**:
  - `401`: 未授权 - 会话或 CSRF 令牌无效
  - `403`: 备份任务删除仅在开发模式下可用
  - `400`: 需要服务器 ID 和备份名称
  - `404`: 未找到要删除的备份
  - `500`: 删除期间发生服务器错误，包含详细错误信息
- **注意事项**: 
  - 此操作仅在开发模式下可用
  - 此操作不可逆
  - 指定服务器-备份组合的所有备份记录将被永久删除
  - 返回已删除备份的数量和服务器信息
  - 如有可用则使用服务器别名进行显示，否则回退到服务器名称

## 同步备份计划 - `/api/backups/sync-schedule` {/* #sync-backup-schedules---apibackupssync-schedule */}
- **端点**：`/api/backups/sync-schedule`
- **方法**：POST
- **描述**：从 Duplicati 服务器同步备份计划信息。此端点连接到服务器，检索所有备份的计划信息，并使用计划详细信息更新本地备份设置，包括重复间隔、允许的星期几和计划时间。
- **认证**：需要有效的会话和 CSRF 令牌
- **请求体**：

  ```json
  {
    "hostname": "duplicati-server.local",
    "port": 8200,
    "password": "your-password",
    "serverId": "optional-server-id"
  }
  ```

或仅使用 serverId（使用存储的密码）：

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

出现错误时：

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
  - `400`：无效的请求参数，未提供 serverId 时缺少主机名/密码，或连接失败
  - `404`：未找到服务器（提供 serverId 时）或服务器没有存储密码
  - `500`：计划同步期间服务器错误
- **备注**：
  - 端点自动检测最佳连接协议（HTTPS → 自签名 HTTPS → HTTP）
  - 可以仅使用 serverId 调用以使用存储的服务器凭据
  - 可以使用 serverId 和新凭据调用以更新服务器连接详情
  - 可以使用 hostname/port/password 而不带 serverId 调用用于新服务器
  - 使用计划信息更新备份设置，包括：
    - `expectedInterval`：重复间隔（例如，"每日"、"每周"、"每月"）
    - `allowedWeekDays`：允许的星期几数组（0=星期日，1=星期一，等等）
    - `time`：备份的计划时间
  - 处理服务器上找到的所有备份
  - 返回处理的备份统计信息和遇到的任何错误
  - 为成功和失败的同步操作记录审计事件
  - 如果未指定则使用默认端口 8200

## 测试服务器连接 - `/api/servers/test-connection` {/* #test-server-connection---apiserverstest-connection */}
- **端点**：`/api/servers/test-connection`
- **方法**：POST
- **描述**：测试与 Duplicati 服务器的连接以验证其可访问性。
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
  - `400`：无效的 URL 格式或缺少服务器 URL
  - `500`：连接测试期间服务器错误
- **备注**：
  - 端点验证 URL 格式并测试连接性
  - 如果服务器以 401 状态响应（登录端点在无凭据情况下预期的状态），则返回成功
  - 测试与 Duplicati 服务器登录端点的连接
  - 支持 HTTP 和 HTTPS 协议
  - 使用超时配置进行连接测试

## 获取服务器 URL - `/api/servers/:serverId/server-url` {/* #get-server-url---apiserversserveridserver-url */}
- **端点**：`/api/servers/:serverId/server-url`
- **方法**：GET
- **描述**：检索特定服务器的服务器 URL。
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
  - `404`：未找到服务器
  - `500`：服务器错误
- **备注**：
  - 返回特定服务器的服务器 URL
  - 用于服务器连接管理
  - 如果未设置服务器 URL 则返回空字符串

## 更新服务器 URL - `/api/servers/:serverId/server-url` {/* #update-server-url---apiserversserveridserver-url */}
- **端点**：`/api/servers/:serverId/server-url`
- **方法**：PATCH
- **描述**：更新特定服务器的服务器 URL。
- **身份验证**：需要有效的会话和 CSRF 令牌
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
  - `401`：未授权 - 无效的会话或 CSRF 令牌
  - `400`：无效的 URL 格式
  - `404`：未找到服务器
  - `500`：更新期间服务器错误
- **备注**：
  - 端点在更新前验证 URL 格式
  - 允许空或 null 的服务器 URL
  - 支持 HTTP 和 HTTPS 协议
  - 返回更新的服务器信息

## 获取服务器密码 - `/api/servers/:serverId/password` {/* #get-server-password---apiserversserveridpassword */}
- **端点**：`/api/servers/:serverId/password`
- **方法**：GET
- **描述**：检索用于服务器密码操作的 CSRF 令牌。
- **身份验证**：需要有效的会话
- **参数**：
  - `serverId`：服务器标识符
- **响应**：

  ```json
  {
    "csrfToken": "csrf-token-string",
    "serverId": "server-id"
  }
  ```

- **错误响应**:
  - `401`: 会话无效或已过期
  - `500`: 生成 CSRF 令牌失败
- **备注**:
  - 返回用于密码更新操作的 CSRF 令牌
  - 会话必须有效才能生成令牌

## 更新服务器密码 - `/api/servers/:serverId/password` {/* #update-server-password---apiserversserveridpassword */}
- **端点**：`/api/servers/:serverId/password`
- **方法**：PATCH
- **描述**：更新特定服务器的密码。
- **身份验证**：需要有效的会话和 CSRF 令牌
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
  - `400`：密码必须为字符串
  - `401`：未授权 - 会话或 CSRF 令牌无效
  - `500`：更新密码失败
- **备注**：
  - 密码可以为空字符串以清除密码
  - 密码使用密钥管理系统安全存储

## 用户管理 {/* #user-management */}

### 列出用户 - `/api/users` {/* #list-users---apiusers */}
- **端点**：`/api/users`
- **方法**：GET
- **描述**：列出所有用户，支持分页和可选的搜索过滤。返回用户信息，包括登录历史和账户状态。
- **身份验证**：需要管理员权限、有效会话和 CSRF 令牌
- **查询参数**：
  - `page`（可选）：页码（默认：1）
  - `limit`（可选）：每页项目数（默认：50）
  - `search`（可选）：按用户名过滤的搜索词
- **响应**：

  ```json
  {
    "users": [
      {
        "id": "user-id",
        "username": "admin",
        "isAdmin": true,
        "accessAllServers": true,
        "serverIds": [],
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
  - `401`：未授权 - 会话或 CSRF 令牌无效
  - `403`：禁止访问 - 需要管理员权限
  - `500`：内部服务器错误
- **备注**：
  - 仅管理员用户可访问
  - 支持分页和搜索过滤
  - 返回用户账户状态，包括锁定状态

### 创建用户 - `/api/users` {/* #create-user---apiusers */}
- **端点**：`/api/users`
- **方法**：POST
- **描述**：创建新用户账户。可以生成临时密码或使用提供的密码。
- **身份验证**：需要管理员权限、有效会话和 CSRF 令牌
- **请求体**：

  ```json
  {
    "username": "newuser",
    "password": "optional-password",
    "isAdmin": false,
    "requirePasswordChange": true,
    "accessAllServers": false,
    "serverIds": ["server-id"]
  }
  ```

- `username`：必填，长度必须为 3-50 个字符，且唯一
  - `password`：选填，若未提供，将生成安全的临时密码
  - `isAdmin`：选填，默认值为 false。管理员用户始终接收所有服务器
  - `requirePasswordChange`：选填，默认值为 true
  - `accessAllServers`：选填，默认值为 true。当为 false 时，`serverIds` 是该用户能看到的唯一服务器集合
  - `serverIds`：选填，现有服务器 ID 数组。未知的 ID 将被拒绝。当用户为管理员或 `accessAllServers` 不为 false 时，此参数将被忽略
- **响应**：

  ```json
  {
    "user": {
      "id": "user-id",
      "username": "newuser",
      "isAdmin": false,
      "mustChangePassword": true,
      "accessAllServers": true,
      "serverIds": []
    },
    "temporaryPassword": "generated-password-123"
  }
  ```

- 仅在自动生成密码时包含 `temporaryPassword`
- **错误响应**：
  - `400`：用户名格式无效、密码策略违规或验证错误
  - `401`：未授权 - 会话或 CSRF 令牌无效
  - `403`：禁止访问 - 需要管理员权限
  - `409`：用户名已存在
  - `500`：内部服务器错误
- **备注**：
  - 仅管理员用户可访问
  - 用户名不区分大小写并以小写形式存储
  - 如未提供密码，则生成安全的 12 字符密码
  - 生成的临时密码仅在响应中返回一次
  - 用户创建记录到审计日志

### 更新用户 - `/api/users/:id` {/* #update-user---apiusersid */}
- **端点**：`/api/users/:id`
- **方法**：PATCH
- **描述**：更新用户信息，包括用户名、管理员状态、密码更改要求和密码重置。
- **身份验证**：需要管理员权限、有效会话和 CSRF 令牌
- **参数**：
  - `id`：要更新的用户 ID
- **请求体**：

  ```json
  {
    "username": "updated-username",
    "isAdmin": true,
    "requirePasswordChange": false,
    "resetPassword": true,
    "password": "optional-custom-password",
    "accessAllServers": false,
    "serverIds": ["server-id"]
  }
  ```

- 所有字段均为选填
  - `accessAllServers` 和 `serverIds`：与创建时的规则相同。将用户提升为管理员会存储所有服务器访问权限。将管理员降级时，除非在同一请求中发送自定义列表，否则将重新从所有服务器开始
  - `resetPassword`：如果为 true，则设置新密码。提供 `password` 时，将在策略检查后使用。省略 `password` 时，将生成临时密码
  - `requirePasswordChange`：与 `resetPassword` 一起使用时，默认值为 true。发送 `false` 以清除必须更改密码的标志
- **响应**（包含密码重置）：

  ```json
  {
    "user": {
      "id": "user-id",
      "username": "updated-username",
      "isAdmin": true,
      "mustChangePassword": true,
      "accessAllServers": true,
      "serverIds": []
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
      "mustChangePassword": false,
      "accessAllServers": true,
      "serverIds": []
    }
  }
  ```

- **错误响应**：
  - `400`：无效输入或验证错误
  - `401`：未授权 - 会话或 CSRF 令牌无效
  - `403`：禁止访问 - 需要管理员权限
  - `404`：用户未找到
  - `409`：用户名已存在（如果更改用户名）
  - `500`：内部服务器错误
- **注意事项**：
  - 仅限管理员用户访问
  - 更改用户名时会验证唯一性
  - 省略重置密码时，将生成安全的 12 字符临时密码，仅返回一次
  - 提供的重置密码必须符合密码策略，且不会返回
  - 所有更改均会记录到审计日志中

### 删除用户 - `/api/users/:id` {/* #delete-user---apiusersid */}
- **端点**：`/api/users/:id`
- **方法**：DELETE
- **描述**：删除用户账户。防止删除您自己或最后一个管理员账户。
- **身份验证**：需要管理员权限、有效会话和 CSRF 令牌
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
  - `400`：无法删除您自己的账户或最后一个管理员账户
  - `401`：未授权 - 会话或 CSRF 令牌无效
  - `403`：禁止访问 - 需要管理员权限
  - `404`：用户未找到
  - `500`：内部服务器错误
- **注意事项**：
  - 仅管理员用户可访问
  - 无法删除您自己的账户
  - 无法删除最后一个管理员账户（必须至少保留一个管理员）
  - 用户删除操作会记录到审计日志
  - 相关会话将自动删除（级联）

## 审计日志管理 {/* #audit-log-management */}

### 列出审计日志 - `/api/audit-log` {/* #list-audit-logs---apiaudit-log */}
- **端点**：`/api/audit-log`
- **方法**：GET
- **描述**：检索审计日志条目，支持过滤、分页和搜索功能。支持基于页面和基于偏移量的分页。
- **身份验证**：需要有效会话和 CSRF 令牌（需要登录用户）
- **查询参数**：
  - `page`（可选）：基于页面分页的页码
  - `offset`（可选）：基于偏移量分页的偏移量（优先于页码）
  - `limit`（可选）：每页项目数（默认值：50）
  - `startDate`（可选）：从此日期开始筛选日志（ISO 格式）
  - `endDate`（可选）：到此日期结束筛选日志（ISO 格式）
  - `userId`（可选）：按用户 ID 筛选
  - `username`（可选）：按用户名筛选
  - `action`（可选）：按操作名称筛选
  - `category`（可选）：按类别筛选（`auth`、`user_management`、`config`、`backup`、`server`）
  - `status`（可选）：按状态筛选（`success`、`failure`、`error`）
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
  - `401`：未授权 - 会话或 CSRF 令牌无效
  - `500`：内部服务器错误
- **注意事项**：
  - 支持基于页面（`page`）和基于偏移量（`offset`）的分页
  - `details` 字段包含带附加上下文的解析 JSON
  - 所有审计日志查询都会被记录

### 获取审计日志筛选值 - `/api/audit-log/filters` {/* #get-audit-log-filter-values---apiaudit-logfilters */}
- **端点**：`/api/audit-log/filters`
- **方法**：GET
- **描述**：检索可用于筛选审计日志的唯一筛选值。返回审计日志数据库中存在的所有不同操作、类别和状态。用于在 UI 中填充筛选下拉列表。
- **身份验证**：需要有效会话和 CSRF 令牌（需要登录用户）
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
  - `401`：未授权 - 会话或 CSRF 令牌无效
  - `500`：内部服务器错误
- **注意事项**：
  - 返回审计日志数据库中的唯一值数组
  - 值按字母顺序排序
  - 如果不存在数据或发生错误，则返回空数组
  - 由审计日志查看器使用，以动态填充筛选下拉列表

### 下载审计日志 - `/api/audit-log/download` {/* #download-audit-logs---apiaudit-logdownload */}
- **端点**：`/api/audit-log/download`
- **方法**：GET
- **描述**：以 CSV 或 JSON 格式下载审计日志，并支持可选的筛选。用于外部分析和报告。
- **身份验证**：需要有效的会话和 CSRF 令牌（需要登录用户）
- **查询参数**：
  - `format`（可选）：导出格式 - `csv` 或 `json`（默认值：`csv`）
  - `startDate`（可选）：从此日期开始筛选日志（ISO 格式）
  - `endDate`（可选）：到此日期结束筛选日志（ISO 格式）
  - `userId`（可选）：按用户 ID 过滤
  - `username`（可选）：按用户名过滤
  - `action`（可选）：按操作名称过滤
  - `category`（可选）：按类别过滤
  - `status`（可选）：按状态过滤
- **响应**（CSV）：
  - Content-Type：`text/csv`
  - Content-Disposition：`attachment; filename="audit-log-YYYY-MM-DD.csv"`
  - 带有标题的 CSV 文件：ID、时间戳、用户 ID、用户名、操作、类别、目标类型、目标 ID、状态、IP 地址、用户代理、详细信息、错误消息
- **响应**（JSON）：
  - Content-Type：`application/json`
  - Content-Disposition：`attachment; filename="audit-log-YYYY-MM-DD.json"`
  - 审计日志条目的 JSON 数组
- **错误响应**：
  - `400`：没有要导出的日志
  - `401`：未授权 - 无效会话或 CSRF 令牌
  - `500`：内部服务器错误
- **注意事项**：
  - 导出限制为 10,000 条记录
  - CSV 格式正确转义特殊字符
  - CSV 中的详细信息字段是 JSON 字符串化
  - 文件名包含当前日期

### 清理审计日志 - `/api/audit-log/cleanup` {/* #cleanup-audit-logs---apiaudit-logcleanup */}
- **端点**：`/api/audit-log/cleanup`
- **方法**：POST
- **描述**：根据保留期限手动触发旧审计日志的清理。支持预演模式以预览将要删除的内容。
- **身份验证**：需要管理员权限、有效会话和 CSRF 令牌
- **请求体**：

  ```json
  {
    "retentionDays": 90,
    "dryRun": false
  }
  ```

- `retentionDays`（可选）：覆盖保留天数（30-365），否则使用已配置的值
  - `dryRun`（可选）：如果为 true，则仅返回将要删除的内容而不实际删除
- **响应**（预演）：

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
  - `400`：无效保留天数（必须为 30-365）
  - `401`：未授权 - 无效会话或 CSRF 令牌
  - `403`：禁止访问 - 需要管理员权限
  - `500`：内部服务器错误
- **注意事项**：
  - 仅对管理员用户可访问
  - 如果未配置，默认保留期为 90 天
  - 清理操作记录到审计日志
  - 预演模式对于预览清理影响很有用

### 获取审计日志保留期 - `/api/audit-log/retention` {/* #get-audit-log-retention---apiaudit-logretention */}
- **端点**：`/api/audit-log/retention`
- **方法**：GET
- **描述**：检索当前审计日志保留配置（以天为单位）。
- **身份验证**：需要有效的会话和 CSRF 令牌（不需要登录用户）
- **响应**：

  ```json
  {
    "retentionDays": 90
  }
  ```

- **错误响应**：
  - `500`：内部服务器错误
- **注意事项**：
  - 如果未配置，默认保留期为 90 天
  - 可以在无需身份验证的情况下访问（只读）

### 更新审计日志保留期 - `/api/audit-log/retention` {/* #update-audit-log-retention---apiaudit-logretention */}
- **端点**：`/api/audit-log/retention`
- **方法**：PATCH
- **描述**：更新审计日志保留期限（以天为单位）。此设置确定审计日志在自动清理前保存多长时间。
- **身份验证**：需要管理员权限、有效会话和 CSRF 令牌
- **请求体**：

  ```json
  {
    "retentionDays": 120
  }
  ```

- `retentionDays`：必需，必须在 30 到 365 天之间
- **响应**：

  ```json
  {
    "success": true,
    "retentionDays": 120
  }
  ```

- **错误响应**：
  - `400`：无效保留天数（必须为 30-365）
  - `401`：未授权 - 无效会话或 CSRF 令牌
  - `403`：禁止访问 - 需要管理员权限
  - `500`：内部服务器错误
- **注意事项**：
  - 仅对管理员用户可访问
  - 配置更改记录到审计日志
  - 保留期限影响自动和手动清理操作

## API 密钥 {/* #api-keys */}

### 列出 API 密钥 - `/api/api-keys` {/* #list-api-keys---apiapi-keys */}
- **端点**：`/api/api-keys`
- **方法**：GET
- **描述**：列出所有 API 密钥。永远不会返回密钥；每个密钥都包含一个指纹（`Qk7v…3xTa`）。
- **身份验证**：需要管理员权限、有效会话和 CSRF 令牌
- **错误响应**：
  - `401`：未授权 - 无效会话或 CSRF 令牌
  - `403`：禁止访问 - 需要管理员权限
  - `500`：内部服务器错误

### 创建 API 密钥 - `/api/api-keys` {/* #create-api-key---apiapi-keys */}
- **端点**：`/api/api-keys`
- **方法**：POST
- **描述**：创建一个作用域 API 密钥。明文密钥仅在此响应中返回。
- **身份验证**：需要管理员权限、有效会话和 CSRF 令牌
- **请求体**：

  ```json
  {
    "name": "Duplicati uploads",
    "scope": "upload",
    "description": "Optional",
    "expiresAt": null
  }
  ```

- **错误响应**：
  - `400`：缺少名称或无效作用域（`upload` 或 `read`）
  - `401`：未授权 - 无效会话或 CSRF 令牌
  - `403`：禁止访问 - 需要管理员权限
  - `500`：内部服务器错误

### 更新 API 密钥 - `/api/api-keys/:id` {/* #update-api-key---apiapi-keysid */}
- **端点**：`/api/api-keys/:id`
- **方法**：PATCH
- **描述**：启用或禁用密钥。
- **身份验证**: 需要管理员权限、有效会话和CSRF令牌

### 删除 API 密钥 - `/api/api-keys/:id` {/* #delete-api-key---apiapi-keysid */}
- **端点**：`/api/api-keys/:id`
- **方法**：DELETE
- **描述**：删除密钥。使用该密钥的现有客户端立即失去访问权限。
- **身份验证**: 需要管理员权限、有效会话和CSRF令牌

## 数据库管理 {/* #database-management */}

### 备份数据库 - `/api/database/backup` {/* #backup-database---apidatabasebackup */}
- **端点**：`/api/database/backup`
- **方法**：GET
- **描述**：以二进制（.db）或 SQL（.sql）格式创建数据库备份。备份文件将自动下载，并带有时间戳文件名。
- **身份验证**：需要管理员权限、有效会话和 CSRF 令牌
- **查询参数**：
  - `format`（可选）：备份格式 - `db`（二进制）或 `sql`（SQL 转储）。默认值：`db`
- **响应**：
  - Content-Type：`application/octet-stream`（用于 .db）或 `text/plain`（用于 .sql）
  - Content-Disposition：`attachment; filename="duplistatus-backup-YYYY-MM-DDTHH-MM-SS.db"` 或 `.sql`
  - 二进制文件内容（用于 .db）或 SQL 文本内容（用于 .sql）
- **错误响应**：
  - `400`：无效格式（必须是 "db" 或 "sql"）
  - `401`：未授权 - 无效会话或 CSRF 令牌
  - `403`：禁止访问 - 需要管理员权限
  - `500`：创建数据库备份失败
- **备注**：
  - 仅管理员用户可访问
  - 二进制格式使用 SQLite 的备份方法确保完整性
  - SQL 格式创建所有数据库内容的文本转储
  - 文件名中的时间戳使用服务器本地时区
  - 备份操作记录到审计日志
  - 下载后临时文件自动清理

### 恢复数据库 - `/api/database/restore` {/* #restore-database---apidatabaserestore */}
- **端点**：`/api/database/restore`
- **方法**：POST
- **描述**：从备份文件（.db 或 .sql 格式）恢复数据库。恢复前创建安全备份，恢复后清除所有会话以确保安全。
- **身份验证**：需要管理员权限、有效会话和 CSRF 令牌
- **请求体**：包含名为 `database` 的文件字段的 FormData
  - 文件必须是 `.db`、`.sqlite`、`.sqlite3`（二进制格式）或 `.sql`（SQL 格式）
  - 最大文件大小: 200MB
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
  - `400`：未提供文件、文件大小超过限制、无效的文件格式或数据库完整性检查失败
  - `401`：未授权 - 会话或 CSRF 令牌无效
  - `403`：禁止访问 - 需要管理员权限
  - `500`：恢复数据库失败（如果恢复失败，将从安全备份中还原原始数据库）
- **注意事项**：
  - 仅管理员用户可访问
  - 在恢复前自动创建安全备份
  - 支持二进制（.db）和 SQL（.sql）格式
  - 恢复后验证数据库完整性
  - 如果恢复失败，自动从安全备份恢复
  - 成功恢复后清除所有会话以确保安全
  - 返回 `requiresReauth: true` 表示用户需要重新登录
  - 恢复操作记录到审计日志
  - 对于 SQL 格式，在执行前验证 SQL 内容
  - 恢复后重新初始化数据库连接
  - 恢复后使所有缓存失效

## 备份时间戳 {/* #backup-timestamps */}

### 获取最后备份时间戳 - `/api/backups/last-timestamps` {/* #get-last-backup-timestamps---apibackupslast-timestamps */}
- **端点**：`/api/backups/last-timestamps`
- **方法**：GET
- **描述**：检索每个服务器-备份组合的最后备份时间戳。返回映射以便轻松查找。
- **身份验证**：需要有效的会话和 CSRF 令牌
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
  - `401`：未授权 - 会话或 CSRF 令牌无效
  - `500`：获取最后备份时间戳失败
- **注意事项**：
  - 返回映射（便于通过 `server_id:backup_name` 轻松查找）和原始数组格式
  - 包含缓存控制头以防止缓存
  - 用于跟踪所有服务器-备份组合的最后备份时间
  - 时间戳采用 ISO 格式

## 应用程序日志管理 {/* #application-logs-management */}

### 获取应用程序日志 - `/api/application-logs` {/* #get-application-logs---apiapplication-logs */}
- **端点**：`/api/application-logs`
- **方法**：GET
- **描述**：从日志文件检索应用程序日志条目。支持读取当前日志文件和轮转的日志文件，并具有尾部功能。
- **身份验证**：需要管理员权限、有效会话和 CSRF 令牌
- **查询参数**：
  - `file`（可选）：要读取的日志文件名 - `application.log`、`application.log.1`、`application.log.2` 等。如果不提供，则返回可用文件列表
  - `tail`（可选）：从文件末尾返回的行数（默认值：1000，最小值：1，最大值：10000）
- **响应**（带文件参数）：

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

- **响应**（不带文件参数）：

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
  - `400`：无效的 tail 参数（必须是 1-10000）或无效的文件参数格式
  - `401`：未授权 - 会话或 CSRF 令牌无效
  - `403`：禁止 - 需要管理员权限
  - `404`：找不到日志文件
  - `500`：读取日志文件失败
- **注意事项**：
  - 仅管理员用户可访问
  - 支持读取当前日志文件和轮转的日志文件（最多 10 个轮转文件）
  - 从指定的日志文件返回最后 N 行（tail）
  - 日志文件名由环境变量确定（默认值：`application.log`）
  - 当未提供文件参数时返回可用日志文件列表
  - 验证文件名以防止目录遍历攻击
  - 轮转文件按顺序编号（`.1`、`.2` 等）

### 导出应用程序日志 - `/api/application-logs/export` {/* #export-application-logs---apiapplication-logsexport */}
- **端点**：`/api/application-logs/export`
- **方法**：GET
- **描述**：以过滤的文本格式导出应用程序日志条目。支持按日志级别和搜索字符串进行过滤。
- **身份验证**：需要管理员权限、有效会话和 CSRF 令牌
- **查询参数**：
  - `file`（必需）：要导出的日志文件名 - `application.log`、`application.log.1`、`application.log.2` 等
  - `logLevels`（可选）：包含日志级别的逗号分隔列表 - `INFO`、`WARN`、`ERROR`（默认值：`INFO,WARN,ERROR`）
  - `search`（可选）：用于筛选日志行的搜索字符串（不区分大小写）
- **响应**：
  - Content-Type：`text/plain`
  - Content-Disposition：`attachment; filename="duplistatus-logs-YYYY-MM-DDTHH-MM-SS.txt"`
  - 过滤后的日志内容为纯文本
- **错误响应**：
  - `400`：文件参数为必填项或文件参数格式无效
  - `401`：未授权 - 会话或 CSRF 令牌无效
  - `403`：禁止访问 - 需要管理员权限
  - `500`：导出日志失败
- **注意事项**：
  - 仅管理员用户可访问
  - 根据日志级别和搜索条件导出过滤的日志条目
  - 支持按日志级别过滤：`INFO`、`WARN`、`ERROR`
  - 搜索字符串筛选不区分大小写
  - 自动过滤空行
  - 日志文件名由环境变量确定（默认值：`application.log`）
  - 验证文件名以防止目录遍历攻击
  - 导出的文件在文件名中包含时间戳
  - 适用于外部分析和故障排除
