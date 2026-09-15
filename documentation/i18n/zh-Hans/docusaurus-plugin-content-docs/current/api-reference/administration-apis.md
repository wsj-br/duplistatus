# 管理 {/* #administration */}

## 收集备份 - `/api/backups/collect` {/* #collect-backups---apibackupscollect */}
- **端点**: `/api/backups/collect`
- **方法**: POST
- **描述**: 通过 Duplicati 服务器的 API 直接收集备份数据。此端点会自动检测最佳连接协议（HTTPS 具有 SSL 验证、HTTPS 具有自签名证书或 HTTP 作为后备），并连接到 Duplicati 服务器以检索备份信息并将其处理到本地数据库中。
- **认证**: 需要有效的会话和CSRF令牌
- **请求正文**:

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
  - `500`: 备份收集期间的服务器错误
- **注意事项**: 
  - 端点会自动检测最佳连接协议（HTTPS → HTTPS 具有自签名 → HTTP）
  - 协议检测尝试按安全偏好顺序进行
  - 连接超时可通过环境变量进行配置
  - 在开发模式下记录收集的数据以用于调试
  - 确保所有服务器和备份的备份设置完整
  - 如果未指定，则使用默认端口 8200
  - 检测到的协议和服务器 URL 会自动存储在数据库中
  - `serverAlias` 从数据库中检索，如果未设置别名，则可能为空
  - 前端应使用 `serverAlias || serverName` 用于显示目的
  - 支持 JSON 下载和直接 API 收集方法

## 清理备份 - `/api/backups/cleanup` {/* #cleanup-backups---apibackupscleanup */}
- **端点**: `/api/backups/cleanup`
- **方法**: POST
- **描述**: 根据保留期限删除旧的备份数据。此端点通过删除过时的备份记录来帮助管理数据库大小，同时保留最近和重要的数据。
- **认证**: 需要有效的会话和CSRF令牌
- **请求正文**:

  ```json
  {
    "retentionPeriod": "6 months"
  }
  ```

- **保留期限**: `"6 months"`, `"1 year"`, `"2 years"`, `"Delete all data"`
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
  - `401`: 未授权 - 无效的会话或 CSRF 令牌
  - `400`: 指定的保留期限无效
  - `500`: 清理操作期间的服务器错误，并附带详细的错误信息
- **注意事项**: 
  - 清理操作是不可逆的
  - 备份数据将从数据库中永久删除
  - 即使所有备份都被删除，机器记录仍会保留
  - 当选择“删除所有数据”时，所有机器和备份都会被移除，并清除配置
  - 增强的错误报告包括详细信息和堆栈跟踪，在开发模式下
  - 支持基于时间的保留和完全数据删除

## 删除备份任务 - `/api/backups/delete-job` {/* #delete-backup-job---apibackupsdelete-job */}
- **端点**: `/api/backups/delete-job`
- **方法**: DELETE
- **描述**: 删除特定服务器-备份组合的所有备份记录。此端点仅在开发模式下可用。
- **认证**: 需要有效的会话和CSRF令牌
- **请求正文**:

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
  - `401`: 未授权 - 无效的会话或 CSRF 令牌
  - `403`: 备份任务删除仅在开发模式下可用
  - `400`: 需要服务器 ID 和备份名称
  - `404`: 未找到要删除的备份
  - `500`: 删除期间的服务器错误，并附带详细的错误信息
- **注意事项**: 
  - 此操作仅在开发模式下可用
  - 此操作不可逆
  - 将永久删除指定服务器-备份组合的所有备份记录
  - 返回已删除的备份数量和服务器信息
  - 如果可用，使用服务器别名进行显示，否则回退到服务器名称

## 同步备份计划 - `/api/backups/sync-schedule` {/* #sync-backup-schedules---apibackupssync-schedule */}
- **端点**: `/api/backups/sync-schedule`
- **方法**: POST
- **描述**: 从Duplicati服务器同步备份计划信息。此端点连接到服务器，检索所有备份的计划信息，并使用包括重复间隔、允许的工作日和计划时间的计划详细信息更新本地备份设置。
- **认证**: 需要有效的会话和CSRF令牌
- **请求正文**:

  ```json
  {
    "hostname": "duplicati-server.local",
    "port": 8200,
    "password": "your-password",
    "serverId": "optional-server-id"
  }
  ```

或仅使用serverId（使用存储的密码）：

  ```json
  {
    "serverId": "server-id"
  }
  ```

或使用serverId和更新的凭据：

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

- **错误响应**:
  - `400`: 无效的请求参数，未提供serverId时缺少主机名/密码，或连接失败
  - `404`: 服务器未找到（提供serverId时）或服务器未存储密码
  - `500`: 同步计划时服务器出错
- **注意事项**: 
  - 端点自动检测最佳连接协议（HTTPS → 自签名HTTPS → HTTP）
  - 可以仅使用serverId调用以使用存储的服务器凭据
  - 可以使用serverId和新凭据调用以更新服务器连接详细信息
  - 可以使用主机名/端口/密码而不使用serverId调用新服务器
  - 使用包括以下信息的计划信息更新备份设置：
    - `expectedInterval`: 重复间隔（例如“每日”、“每周”、“每月”）
    - `allowedWeekDays`: 允许的工作日数组（0=星期日，1=星期一等）
    - `time`: 备份的计划时间
  - 处理服务器上找到的所有备份
  - 返回处理的备份统计信息和遇到的任何错误
  - 记录成功和失败的同步操作的审计事件
  - 如果未指定，使用默认端口8200

## 测试服务器连接 - `/api/servers/test-connection` {/* #test-server-connection---apiserverstest-connection */}
- **端点**: `/api/servers/test-connection`
- **方法**: POST
- **描述**: 测试与Duplicati服务器的连接以验证其是否可访问。
- **请求正文**:

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
  - `500`: 连接测试时服务器出错
- **注意事项**: 
  - 端点验证URL格式并测试连接
  - 如果服务器以401状态响应（登录端点无凭据时预期），则返回成功
  - 测试与Duplicati服务器登录端点的连接
  - 支持HTTP和HTTPS协议
  - 使用超时配置进行连接测试

## 获取服务器URL - `/api/servers/:serverId/server-url` {/* #get-server-url---apiserversserveridserver-url */}
- **端点**: `/api/servers/:serverId/server-url`
- **方法**: GET
- **描述**: 检索特定服务器的服务器URL。
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
  - `404`: 找不到服务器
  - `500`: 服务器错误
- **注意事项**:
  - 返回特定服务器的服务器URL
  - 用于服务器连接管理
  - 如果未设置服务器URL，则返回空字符串

## 更新服务器URL - `/api/servers/:serverId/server-url` {/* #update-server-url---apiserversserveridserver-url */}
- **端点**: `/api/servers/:serverId/server-url`
- **方法**: PATCH
- **描述**: 更新特定服务器的服务器URL。
- **认证**: 需要有效的会话和CSRF令牌
- **参数**:
  - `serverId`: 服务器标识符
- **请求正文**:

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
  - `401`: 未授权 - 无效的会话或CSRF令牌
  - `400`: 无效的URL格式
  - `404`: 找不到服务器
  - `500`: 更新期间的服务器错误
- **注意事项**: 
  - 端点在更新前验证URL格式
  - 允许空或空值的服务器URL
  - 支持HTTP和HTTPS协议
  - 返回更新后的服务器信息

## 获取服务器密码 - `/api/servers/:serverId/password` {/* #get-server-password---apiserversserveridpassword */}
- **端点**: `/api/servers/:serverId/password`
- **方法**: GET
- **描述**: 检索服务器密码操作的CSRF令牌。
- **认证**: 需要有效的会话
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
  - `500`: 生成CSRF令牌失败
- **注意事项**:
  - 返回用于密码更新操作的CSRF令牌
  - 必须有效的会话才能生成令牌

## 更新服务器密码 - `/api/servers/:serverId/password` {/* #update-server-password---apiserversserveridpassword */}
- **端点**: `/api/servers/:serverId/password`
- **方法**: PATCH
- **描述**: 更新特定服务器的密码。
- **认证**: 需要有效的会话和CSRF令牌
- **参数**:
  - `serverId`: 服务器标识符
- **请求正文**:

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
  - `401`: 未授权 - 无效的会话或CSRF令牌
  - `500`: 更新密码失败
- **注意事项**:
  - 密码可以是空字符串以清除密码
  - 密码使用密钥管理系统安全存储

## 用户管理 {/* #user-management */}

### 列出用户 - `/api/users` {/* #list-users---apiusers */}
- **端点**: `/api/users`
- **方法**: GET
- **描述**: 列出所有用户，带有分页和可选的搜索过滤。返回用户信息，包括登录历史记录和账户状态。
- **认证**: 需要管理员权限、有效的会话和CSRF令牌
- **查询参数**:
  - `page` (可选): 页码 (默认: 1)
  - `limit` (可选): 每页项目数 (默认: 50)
  - `search`（可选）：按用户名过滤的搜索词
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
  - `401`：未授权 - 会话无效或 CSRF 令牌无效
  - `403`：禁止 - 需要管理员权限
  - `500`：内部服务器错误
- **注意事项**：
  - 仅限管理员用户访问
  - 支持分页和搜索过滤
  - 返回用户账户状态，包括锁定状态

### 创建用户 - `/api/users` {/* #create-user---apiusers */}
- **端点**：`/api/users`
- **方法**：POST
- **描述**：创建新用户账户。可以生成临时密码或使用提供的密码。
- **认证**: 需要管理员权限、有效的会话和 CSRF 令牌
- **请求正文**:

  ```json
  {
    "username": "newuser",
    "password": "optional-password",
    "isAdmin": false,
    "requirePasswordChange": true
  }
  ```

- `username`：必填，必须为 3-50 个字符，唯一
  - `password`：可选，如果未提供，则生成安全的临时密码
  - `isAdmin`：可选，默认为 false
  - `requirePasswordChange`：可选，默认为 true
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

- `temporaryPassword` 仅在自动生成密码时包含
- **错误响应**：
  - `400`：用户名格式无效、密码策略违规或验证错误
  - `401`：未授权 - 会话无效或 CSRF 令牌无效
  - `403`：禁止 - 需要管理员权限
  - `409`：用户名已存在
  - `500`：内部服务器错误
- **注意事项**：
  - 仅限管理员用户访问
  - 用户名不区分大小写，存储为小写
  - 如果未提供密码，则生成安全的 12 个字符的密码
  - 生成的临时密码仅在响应中返回一次
  - 用户创建记录在审计日志中

### 更新用户 - `/api/users/:id` {/* #update-user---apiusersid */}
- **端点**：`/api/users/:id`
- **方法**：PATCH
- **描述**：更新用户信息，包括用户名、管理员状态、密码更改要求和密码重置。
- **认证**：需要管理员权限、有效会话和 CSRF 令牌
- **参数**：
  - `id`：要更新的用户 ID
- **请求正文**：

  ```json
  {
    "username": "updated-username",
    "isAdmin": true,
    "requirePasswordChange": false,
    "resetPassword": true
  }
  ```

- 所有字段均为可选
  - `resetPassword`：如果为 true，则生成新的临时密码并将 `requirePasswordChange` 设置为 true
- **响应**（密码重置）：

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

- **响应**（无密码重置）：

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
  - `400`：输入无效或验证错误
  - `401`：未授权 - 会话无效或 CSRF 令牌无效
  - `403`：禁止 - 需要管理员权限
  - `404`：用户未找到
  - `409`：用户名已存在（如果更改用户名）
  - `500`：内部服务器错误
- **注意事项**：
  - 仅限管理员用户访问
  - 用户名更改经过唯一性验证
  - 密码重置生成安全的 12 个字符的临时密码
  - 所有更改记录在审计日志中

### 删除用户 - `/api/users/:id` {/* #delete-user---apiusersid */}
- **端点**：`/api/users/:id`
- **方法**：DELETE
- **描述**：删除用户账户。防止删除自己或最后一个管理员账户。
- **认证**：需要管理员权限、有效会话和 CSRF 令牌
- **参数**：
  - `id`：要删除的用户 ID
- **响应**：

  ```json
  {
    "success": true,
    "message": "User deleted successfully"
  }
  ```

- **错误响应**:
  - `400`: 无法删除自己的账户或最后一个管理员账户
  - `401`: 未授权 - 会话无效或 CSRF 令牌无效
  - `403`: 禁止 - 需要管理员权限
  - `404`: 用户未找到
  - `500`: 内部服务器错误
- **注意事项**:
  - 仅限管理员用户访问
  - 无法删除自己的账户
  - 无法删除最后一个管理员账户（必须至少保留一个管理员）
  - 用户删除操作会记录到审计日志中
  - 关联的会话会自动删除（级联删除）

## 审计日志管理 {/* #audit-log-management */}

### 列出审计日志 - `/api/audit-log` {/* #list-audit-logs---apiaudit-log */}
- **端点**: `/api/audit-log`
- **方法**: GET
- **描述**: 检索审计日志条目，支持过滤、分页和搜索功能。支持基于页面和偏移量的分页。
- **认证**: 需要有效的会话和 CSRF 令牌（需要已登录用户）
- **查询参数**:
  - `page` (可选): 基于页面的分页的页码
  - `offset` (可选): 偏移量（优先于页码）
  - `limit` (可选): 每页项目数（默认: 50）
  - `startDate` (可选): 从该日期过滤日志（ISO 格式）
  - `endDate` (可选): 到该日期过滤日志（ISO 格式）
  - `userId` (可选): 按用户 ID 过滤
  - `username` (可选): 按用户名过滤
  - `action` (可选): 按操作名称过滤
  - `category` (可选): 按类别过滤（`auth`, `user_management`, `config`, `backup`, `server`）
  - `status` (可选): 按状态过滤（`success`, `failure`, `error`）
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
  - `401`: 未授权 - 会话无效或 CSRF 令牌无效
  - `500`: 内部服务器错误
- **注意事项**:
  - 支持基于页面（`page`）和偏移量（`offset`）的分页
  - `details` 字段包含解析后的 JSON，其中包含额外的上下文
  - 所有审计日志查询都会被记录

### 获取审计日志过滤值 - `/api/audit-log/filters` {/* #get-audit-log-filter-values---apiaudit-logfilters */}
- **端点**: `/api/audit-log/filters`
- **方法**: GET
- **描述**: 检索可用于过滤审计日志的唯一过滤值。返回审计日志数据库中存在的所有不同操作、类别和状态。用于填充 UI 中的过滤下拉菜单。
- **认证**: 需要有效的会话和 CSRF 令牌（需要已登录用户）
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
  - `401`: 未授权 - 会话无效或 CSRF 令牌无效
  - `500`: 内部服务器错误
- **注意事项**:
  - 返回审计日志数据库中唯一值的数组
  - 值按字母顺序排序
  - 如果没有数据存在或发生错误，则返回空数组
  - 由审计日志查看器用于动态填充过滤下拉菜单

### 下载审计日志 - `/api/audit-log/download` {/* #download-audit-logs---apiaudit-logdownload */}
- **端点**: `/api/audit-log/download`
- **方法**: GET
- **描述**: 以 CSV 或 JSON 格式下载审计日志，支持可选过滤。适用于外部分析和报告。
- **认证**: 需要有效的会话和 CSRF 令牌（需要已登录用户）
- **查询参数**:
  - `format` (可选): 导出格式 - `csv` 或 `json`（默认: `csv`）
  - `startDate` (可选): 从该日期过滤日志（ISO 格式）
  - `endDate` (可选): 到该日期过滤日志（ISO 格式）
  - `userId` (可选): 按用户 ID 过滤
  - `username` (可选): 按用户名过滤
  - `action` (可选): 按操作名称过滤
  - `category` (可选): 按类别过滤
  - `status` (可选): 按状态过滤
- **响应** (CSV):
  - Content-Type: `text/csv`
  - Content-Disposition: `attachment; filename="audit-log-YYYY-MM-DD.csv"`
  - 带有标题的 CSV 文件: ID, 时间戳, 用户 ID, 用户名, 操作, 类别, 目标类型, 目标 ID, 状态, IP 地址, 用户代理, 详细信息, 错误消息
- **响应** (JSON):
  - Content-Type: `application/json`
  - Content-Disposition: `attachment; filename="audit-log-YYYY-MM-DD.json"`
  - JSON 审计日志条目数组
- **错误响应**:
  - `400`: 没有要导出的日志
  - `401`: 未授权 - 会话无效或 CSRF 令牌无效
  - `500`: 内部服务器错误
- **注意事项**:
  - 导出限制为 10,000 条记录
  - CSV 格式正确转义特殊字符
  - CSV 中的详细信息字段为 JSON 字符串化
  - 文件名包含当前日期

### 清理审计日志 - `/api/audit-log/cleanup` {/* #cleanup-audit-logs---apiaudit-logcleanup */}
- **端点**: `/api/audit-log/cleanup`
- **方法**: POST
- **描述**: 手动触发基于保留期的旧审计日志清理。支持干运行模式以预览将被删除的内容。
- **认证**: 需要管理员权限、有效的会话和 CSRF 令牌
- **请求正文**:

  ```json
  {
    "retentionDays": 90,
    "dryRun": false
  }
  ```

- `retentionDays`（可选）：覆盖保留天数（30-365），否则使用配置的值
  - `dryRun`（可选）：如果为 true，则仅返回将被删除的内容而不实际删除
- **响应**（干运行）：

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

- **错误响应**:
  - `400`: 无效的保留天数（必须为 30-365 天）
  - `401`: 未授权 - 会话无效或 CSRF 令牌无效
  - `403`: 禁止 - 需要管理员权限
  - `500`: 内部服务器错误
- **注意事项**:
  - 仅限管理员用户访问
  - 默认保留期为 90 天（如果未配置）
  - 清理操作记录在审计日志中
  - 干运行模式可用于预览清理影响

### 获取审计日志保留 - `/api/audit-log/retention` {/* #get-audit-log-retention---apiaudit-logretention */}
- **端点**: `/api/audit-log/retention`
- **方法**: GET
- **描述**: 检索当前审计日志保留配置（以天为单位）。
- **认证**: 需要有效会话和 CSRF 令牌（无需登录用户）
- **响应**:

  ```json
  {
    "retentionDays": 90
  }
  ```

- **错误响应**:
  - `500`: 内部服务器错误
- **注意事项**:
  - 默认保留期为 90 天（如果未配置）
  - 可无需身份验证访问（仅限读取）

### 更新审计日志保留 - `/api/audit-log/retention` {/* #update-audit-log-retention---apiaudit-logretention */}
- **端点**: `/api/audit-log/retention`
- **方法**: PATCH
- **描述**: 更新审计日志保留期（以天为单位）。此设置决定了审计日志在自动清理前保留多长时间。
- **认证**: 需要管理员权限、有效的会话和 CSRF 令牌
- **请求正文**:

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
  - `400`: 无效的保留天数（必须为 30-365 天）
  - `401`: 未授权 - 会话无效或 CSRF 令牌无效
  - `403`: 禁止 - 需要管理员权限
  - `500`: 内部服务器错误
- **注意事项**:
  - 仅限管理员用户访问
  - 配置更改记录在审计日志中
  - 保留期影响自动和手动清理操作

## API 密钥 {/* #api-keys */}

### 列出 API 密钥 - `/api/api-keys` {/* #list-api-keys---apiapi-keys */}
- **端点**: `/api/api-keys`
- **方法**: GET
- **描述**: 列出所有 API 密钥。密钥的秘密信息不会返回；每个密钥都包含一个指纹（`Qk7v…3xTa`）。
- **认证**: 需要管理员权限、有效的会话和 CSRF 令牌
- **错误响应**:
  - `401`: 未授权 - 无效的会话或 CSRF 令牌
  - `403`: 禁止 - 需要管理员权限
  - `500`: 内部服务器错误

### 创建 API 密钥 - `/api/api-keys` {/* #create-api-key---apiapi-keys */}
- **端点**: `/api/api-keys`
- **方法**: POST
- **描述**: 创建一个范围限定的 API 密钥。明文密钥仅在此响应中返回。
- **认证**: 需要管理员权限、有效的会话和 CSRF 令牌
- **请求正文**:

  ```json
  {
    "name": "Duplicati uploads",
    "scope": "upload",
    "description": "Optional",
    "expiresAt": null
  }
  ```

- **错误响应**:
  - `400`: 缺少名称或无效范围（`upload` 或 `read`）
  - `401`: 未授权 - 无效的会话或 CSRF 令牌
  - `403`: 禁止 - 需要管理员权限
  - `500`: 内部服务器错误

### 更新 API 密钥 - `/api/api-keys/:id` {/* #update-api-key---apiapi-keysid */}
- **端点**: `/api/api-keys/:id`
- **方法**: PATCH
- **描述**: 启用或禁用密钥。
- **认证**: 需要管理员权限、有效的会话和 CSRF 令牌

### 删除 API 密钥 - `/api/api-keys/:id` {/* #delete-api-key---apiapi-keysid */}
- **端点**: `/api/api-keys/:id`
- **方法**: DELETE
- **描述**: 删除密钥。使用该密钥的现有客户端立即失去访问权限。
- **认证**: 需要管理员权限、有效的会话和 CSRF 令牌

## 数据库管理 {/* #database-management */}

### 备份数据库 - `/api/database/backup` {/* #backup-database---apidatabasebackup */}
- **端点**: `/api/database/backup`
- **方法**: GET
- **描述**: 以二进制（.db）或 SQL（.sql）格式创建数据库备份。备份文件会自动下载，并带有带时间戳的文件名。
- **认证**: 需要管理员权限、有效的会话和 CSRF 令牌
- **查询参数**:
  - `format`（可选）：备份格式 - `db`（二进制）或 `sql`（SQL 转储）。默认值：`db`
- **响应**:
  - Content-Type: `application/octet-stream`（用于 .db）或 `text/plain`（用于 .sql）
  - Content-Disposition: `attachment; filename="duplistatus-backup-YYYY-MM-DDTHH-MM-SS.db"` 或 `.sql`
  - 二进制文件内容（用于 .db）或 SQL 文本内容（用于 .sql）
- **错误响应**:
  - `400`: 无效格式（必须是 "db" 或 "sql"）
  - `401`: 未授权 - 无效的会话或 CSRF 令牌
  - `403`: 禁止 - 需要管理员权限
  - `500`: 无法创建数据库备份
- **注意事项**:
  - 仅管理员用户可访问
  - 二进制格式使用 SQLite 的备份方法以确保完整性
  - SQL 格式创建所有数据库内容的文本转储
  - 文件名中的时间戳使用服务器的本地时区
  - 备份操作记录在审计日志中
  - 下载后自动清理临时文件

### 恢复数据库 - `/api/database/restore` {/* #restore-database---apidatabaserestore */}
- **端点**: `/api/database/restore`
- **方法**: POST
- **描述**: 从备份文件（.db 或 .sql 格式）恢复数据库。在恢复之前创建安全备份，并为安全起见在恢复后清除所有会话。
- **认证**: 需要管理员权限、有效会话和CSRF令牌
- **请求正文**: 表单数据，包含一个名为`database`的文件字段
  - 文件必须是`.db`、`.sqlite`、`.sqlite3`（二进制格式）或`.sql`（SQL格式）
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
  - `400`: 未提供文件、文件大小超过限制、无效文件格式或数据库完整性检查失败
  - `401`: 未授权 - 无效会话或CSRF令牌
  - `403`: 禁止 - 需要管理员权限
  - `500`: 恢复数据库失败（如果恢复失败，将从安全备份中恢复原始数据库）
- **注意事项**:
  - 仅限管理员用户访问
  - 恢复前自动创建安全备份
  - 支持二进制（.db）和SQL（.sql）格式
  - 恢复后验证数据库完整性
  - 如果恢复失败，自动从安全备份恢复
  - 恢复成功后，为安全起见，清除所有会话
  - 返回`requiresReauth: true`表示用户需要重新登录
  - 恢复操作记录在审计日志中
  - 对于SQL格式，在执行前验证SQL内容
  - 恢复后重新初始化数据库连接
  - 恢复后使所有缓存失效

## 备份时间戳 {/* #backup-timestamps */}

### 获取最后备份时间戳 - `/api/backups/last-timestamps` {/* #get-last-backup-timestamps---apibackupslast-timestamps */}
- **端点**: `/api/backups/last-timestamps`
- **方法**: GET
- **描述**: 检索每个服务器-备份组合的最后备份时间戳。返回一个映射以便于查找。
- **认证**: 需要有效会话和CSRF令牌
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
  - `401`: 未授权 - 无效会话或CSRF令牌
  - `500`: 获取最后备份时间戳失败
- **注意事项**:
  - 返回映射（便于通过`server_id:backup_name`查找）和原始数组格式
  - 包含缓存控制头以防止缓存
  - 有助于跟踪所有服务器-备份组合的最后备份时间
  - 时间戳采用ISO格式

## 应用程序日志管理 {/* #application-logs-management */}

### 获取应用程序日志 - `/api/application-logs` {/* #get-application-logs---apiapplication-logs */}
- **端点**: `/api/application-logs`
- **方法**: GET
- **描述**: 从日志文件中检索应用程序日志条目。支持读取当前和轮换的日志文件，具有尾部功能。
- **认证**: 需要管理员权限、有效会话和CSRF令牌
- **查询参数**:
  - `file`（可选）：要读取的日志文件名 - `application.log`、`application.log.1`、`application.log.2`等。如果未提供，则返回可用文件列表
  - `tail`（可选）：从文件末尾返回的行数（默认值: 1000，最小值: 1，最大值: 10000）
- **响应**（带文件参数）

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

- **响应**（不带文件参数）

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
  - `401`: 未授权 - 无效会话或CSRF令牌
  - `403`: 禁止 - 需要管理员权限
  - `404`: 日志文件未找到
  - `500`: 读取日志文件失败
- **注意事项**:
  - 仅限管理员用户访问
  - 支持读取当前日志文件和轮换的日志文件（最多10个轮换文件）
  - 从指定的日志文件中返回最后N行（尾部）
  - 日志文件名由环境变量确定（默认值: `application.log`）
  - 当未提供文件参数时，返回可用日志文件列表
  - 文件名经过验证以防止目录遍历攻击
  - 旋转文件按顺序编号（`.1`、`.2`等）

### 导出应用程序日志 - `/api/application-logs/export` {/* #export-application-logs---apiapplication-logsexport */}
- **端点**: `/api/application-logs/export`
- **方法**: GET
- **描述**: 以过滤后的文本格式导出应用程序日志条目。支持按日志级别和搜索字符串进行过滤。
- **认证**: 需要管理员权限、有效会话和CSRF令牌
- **查询参数**:
  - `file`（必需）：要导出的日志文件名 - `application.log`、`application.log.1`、`application.log.2`等
  - `logLevels`（可选）：要包含的日志级别的逗号分隔列表 - `INFO`、`WARN`、`ERROR`（默认值：`INFO,WARN,ERROR`）
  - `search`（可选）：用于过滤日志行的搜索字符串（不区分大小写）
- **响应**:
  - Content-Type: `text/plain`
  - Content-Disposition: `attachment; filename="duplistatus-logs-YYYY-MM-DDTHH-MM-SS.txt"`
  - 作为纯文本的过滤后的日志内容
- **错误响应**:
  - `400`: 文件参数为必需项或文件参数格式无效
  - `401`: 未授权 - 会话或CSRF令牌无效
  - `403`: 禁止 - 需要管理员权限
  - `500`: 导出日志失败
- **注意事项**:
  - 仅管理员用户可访问
  - 根据日志级别和搜索条件导出过滤后的日志条目
  - 支持按日志级别过滤：`INFO`、`WARN`、`ERROR`
  - 搜索字符串过滤不区分大小写
  - 自动过滤掉空行
  - 日志文件名由环境变量确定（默认值：`application.log`）
  - 文件名经过验证以防止目录遍历攻击
  - 导出的文件名包含时间戳
  - 适用于外部分析和故障排除
