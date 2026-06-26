# 身份验证和安全 {#authentication-security}

API 使用会话身份验证和 CSRF 保护的组合，用于所有数据库写入操作，以防止未经授权的访问和潜在的拒绝服务攻击。外部 API（由 Duplicati 使用）保持未经身份验证的状态，以保持兼容性。

## 会话身份验证 {#session-based-authentication}

受保护的端点需要有效的会话 cookie 和 CSRF 令牌。会话系统为所有受保护的操作提供安全的身份验证。

### 会话管理 {#session-management}
1. **创建会话**: POST 到 `/api/session` 创建新的会话
2. **获取 CSRF 令牌**: GET `/api/csrf` 获取会话的 CSRF 令牌
3. **包含在请求中**: 将会话 cookie 和 CSRF 令牌发送到受保护的请求中
4. **验证会话**: GET `/api/session` 检查会话是否仍然有效
5. **删除会话**: DELETE `/api/session` 登出并清除会话

### CSRF 保护 {#csrf-protection}
所有状态更改操作需要有效的 CSRF 令牌，该令牌必须与当前会话匹配。CSRF 令牌必须包含在 `X-CSRF-Token` 头中以保护端点。

### 受保护端点 {#protected-endpoints}
所有修改数据库数据的端点需要会话身份验证和 CSRF 令牌:

- **服务器管理**: `/api/servers/:id` (PATCH, DELETE), `/api/servers/:id/server-url` (PATCH), `/api/servers/:id/password` (PATCH, GET)
- **配置管理**: `/api/configuration/email` (GET, POST, DELETE), `/api/configuration/unified` (GET), `/api/configuration/ntfy` (GET), `/api/configuration/notifications` (GET, POST), `/api/configuration/backup-settings` (POST), `/api/configuration/templates` (POST), `/api/configuration/overdue-tolerance` (GET, POST)
- **通知系统**: `/api/notifications/test` (POST)
- **Cron 配置**: `/api/cron-config` (GET, POST)
- **Cron 代理**: `/api/cron/*` (GET, POST) - 代理请求到 Cron 服务
- **会话管理**: `/api/session` (POST, GET, DELETE), `/api/csrf` (GET)
- **图表数据**: `/api/chart-data/*` (GET)
- **仪表板**: `/api/dashboard` (GET)
- **服务器详细信息**: `/api/servers` (GET), `/api/servers/:id` (GET), `/api/detail/:serverId` (GET)
- **审计日志**: `/api/audit-log` (GET), `/api/audit-log/download` (GET), `/api/audit-log/filters` (GET), `/api/audit-log/retention` (PATCH), `/api/audit-log/cleanup` (POST) - 管理员需要写入操作
- **用户管理**: `/api/users` (GET, POST, PATCH, DELETE) - 管理员需要
- **数据库管理**: `/api/database/backup` (GET), `/api/database/restore` (POST) - 管理员需要
- **应用程序日志**: `/api/application-logs` (GET), `/api/application-logs/export` (GET) - 管理员需要
- **备份集合**: `/api/backups/collect` (POST) - 需要会话和 CSRF 令牌
- **备份计划同步**: `/api/backups/sync-schedule` (POST) - 需要会话和 CSRF 令牌
- **逾期检查**: `/api/notifications/check-overdue` (POST) - 需要会话和 CSRF 令牌
- **清除逾期时间戳**: `/api/notifications/clear-overdue-timestamps` (POST) - 需要会话和 CSRF 令牌

### 未受保护的端点 {#unprotected-endpoints}
外部 API 保持未经身份验证的状态，以便与 Duplicati 集成:

- `/api/upload` - 备份数据上传从 Duplicati
- `/api/lastbackup/:serverId` - 最新备份状态
- `/api/lastbackups/:serverId` - 最新备份状态
- `/api/summary` - 总结数据
- `/api/health` - 健康检查端点

### 使用示例（会话 + CSRF） {#usage-example-session--csrf}

```typescript
// 1. Create session
const sessionResponse = await fetch('/api/session', { method: 'POST' });
const { sessionId } = await sessionResponse.json();

// 2. Get CSRF token
const csrfResponse = await fetch('/api/csrf', {
  headers: { 'Cookie': `session=${sessionId}` }
});
const { csrfToken } = await csrfResponse.json();

// 3. Make protected request
const response = await fetch('/api/servers/server-id', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken,
    'Cookie': `session=${sessionId}`
  },
  body: JSON.stringify({
    alias: 'Updated Server Name',
    note: 'Updated notes'
  })
});
```

## 身份验证端点 {#authentication-endpoints}

### 登录 - `/api/auth/login` {#login---apiauthlogin}
- **端点**: `/api/auth/login`
- **方法**: POST
- **描述**: 身份验证用户并创建会话。支持账户锁定和密码更改要求。
- **身份验证**: 需要有效的会话和 CSRF 令牌（但无需登录用户）
- **请求正文**:

  ```json
  {
    "username": "admin",
    "password": "password123"
  }
  ```

- **响应** (成功):

  ```json
  {
    "success": true,
    "user": {
      "id": "user-id",
      "username": "admin",
      "isAdmin": true,
      "mustChangePassword": false
    },
    "keyChanged": false
  }
  ```

- **错误响应**: 所有错误响应包括 `error` (英文消息) 和 `errorCode` (稳定的代码用于客户端翻译).
  - `400`: 缺少用户名或密码 — `errorCode: "REQUIRED_CREDENTIALS"`
  - `401`: 无效的用户名或密码 — `errorCode: "INVALID_CREDENTIALS"`
  - `403`: 账户被锁定由于多次失败的登录尝试 — `errorCode: "ACCOUNT_LOCKED"` (包括 `lockedUntil`，`minutesRemaining`)
  - `500`: 内部服务器错误 — `errorCode: "INTERNAL_ERROR"`
  - `503`: 数据库未准备好 — `errorCode: "DATABASE_NOT_READY"`
- **注意**:
  - 账户在 5 次失败的登录尝试后被锁定 15 分钟
  - 失败的登录尝试被跟踪和记录
  - 会话 cookie 在响应中自动设置
  - 如果用户有 `mustChangePassword` 标志设置，他们应该被重定向到更改密码页面
  - 所有的登录尝试（成功和失败）都被记录到审计日志

### 登出 - `/api/auth/logout` {#logout---apiauthlogout}
- **端点**: `/api/auth/logout`
- **方法**: POST
- **描述**: 登出当前用户并销毁他们的会话.
- **身份验证**: 需要有效的会话和 CSRF 令牌
- **响应** (成功):

  ```json
  {
    "success": true,
    "message": "Logged out successfully",
    "successCode": "LOGGED_OUT"
  }
  ```

- **错误响应**: 包括 `error` 和 `errorCode` 用于客户端翻译.
  - `400`: 没有活动会话 — `errorCode: "NO_ACTIVE_SESSION"`
  - `500`: 内部服务器错误 — `errorCode: "INTERNAL_ERROR"`
- **注意**:
  - 会话 cookie 在响应中被清除
  - 登出被记录到审计日志
  - 会话被立即失效

### 获取当前用户 - `/api/auth/me` {#get-current-user---apiauthme}
- **端点**: `/api/auth/me`
- **方法**: GET
- **描述**: 返回当前已验证的用户信息，或指示没有用户登录.
- **身份验证**: 需要有效的会话（但不需要登录用户）
- **响应** (已验证):

  ```json
  {
    "authenticated": true,
    "user": {
      "id": "user-id",
      "username": "admin",
      "isAdmin": true,
      "mustChangePassword": false
    }
  }
  ```

- **响应** (未验证):

  ```json
  {
    "authenticated": false,
    "user": null
  }
  ```

- **错误响应**: 包括 `error` 和 `errorCode` 用于客户端翻译.
  - `500`: 内部服务器错误 — `errorCode: "INTERNAL_ERROR"`
- **注意**:
  - 可以在没有登录用户的情况下调用（返回 `authenticated: false`)
  - 有用地检查页面加载时的身份验证状态

### 更改密码 - `/api/auth/change-password` {#change-password---apiauthchange-password}
- **端点**: `/api/auth/change-password`
- **方法**: POST
- **描述**: 更改当前已验证用户的密码。如果 `mustChangePassword` 被设置，当前密码验证将被跳过。
- **身份验证**: 需要有效的会话和 CSRF 令牌（需要登录用户）
- **请求正文**:

  ```json
  {
    "currentPassword": "old-password",
    "newPassword": "new-secure-password"
  }
  ```

- `currentPassword`: 如果 `mustChangePassword` 为真，则为可选，否则为必需
  - `newPassword`: 必需，必须满足密码策略要求
- **响应** (成功):

  ```json
  {
    "success": true,
    "message": "Password changed successfully",
    "successCode": "PASSWORD_CHANGED"
  }
  ```

- **错误响应**: 包括 `error` 和 `errorCode` 用于客户端翻译。策略违规可能包括 `validationErrors`（字符串数组）.
  - `400`: 缺少新密码 — `errorCode: "NEW_PASSWORD_REQUIRED"`
  - `400`: 密码策略违规 — `errorCode: "POLICY_NOT_MET"`（可能包括 `validationErrors`)
  - `400`: 新密码与当前密码相同 — `errorCode: "NEW_PASSWORD_SAME_AS_CURRENT"`
  - `401`: 当前密码不正确 — `errorCode: "CURRENT_PASSWORD_INCORRECT"`
  - `404`: 未找到用户 — `errorCode: "USER_NOT_FOUND"`
  - `500`: 内部服务器错误 — `errorCode: "INTERNAL_ERROR"`
- **注意**:
  - 新密码必须满足密码策略要求（长度，复杂性等）
  - 如果 `mustChangePassword` 标志被设置，当前密码验证将被跳过
  - 成功更改密码后，`mustChangePassword` 标志将被清除
  - 密码更改被记录到审计日志
  - 新密码必须与当前密码不同

### 检查管理员必须更改密码 - `/api/auth/admin-must-change-password` {#check-admin-must-change-password---apiauthadmin-must-change-password}
- **端点**: `/api/auth/admin-must-change-password`
- **方法**: GET
- **描述**: 检查管理员用户是否必须更改密码。该端点是公共的（无需身份验证），因为它只返回一个布尔标志。
- **响应**:

  ```json
  {
    "mustChangePassword": false
  }
  ```

- **错误响应**:
  - `500`: 服务器内部错误（在错误时返回 `mustChangePassword: false` 以避免显示提示，如果存在数据库问题）
- **注意**:
  - 公共端点，无需身份验证
  - 如果管理员用户不存在，则返回 `false`
  - 用于确定是否应显示密码更改提示
  - 错误时，返回 `false` 以避免显示提示，如果存在数据库问题

### 获取密码策略 - `/api/auth/password-policy` {#get-password-policy---apiauthpassword-policy}
- **端点**: `/api/auth/password-policy`
- **方法**: GET
- **描述**: 返回当前密码策略配置。该端点是公共的（无需身份验证），因为它需要用于前端验证。
- **响应**:

  ```json
  {
    "minLength": 8,
    "requireUppercase": true,
    "requireLowercase": true,
    "requireNumbers": true,
    "requireSpecialChars": false
  }
  ```

- **错误响应**: 包括 `error` 和 `errorCode` 用于客户端翻译。
  - `500`: 未能检索密码策略 — `errorCode: "POLICY_RETRIEVE_FAILED"`
- **注意**:
  - 公共端点，无需身份验证
  - 由前端组件用于显示密码要求并在提交前验证密码
  - 策略通过环境变量（`PWD_ENFORCE`，`PWD_MIN_LEN`）配置
  - 默认密码检查（防止使用默认管理员密码）始终强制执行，无论策略设置如何

### 身份验证 API 错误和成功代码（i18n） {#auth-api-error-and-success-codes-i18n}

身份验证端点返回一个稳定的 `errorCode`（和，在成功时，`successCode`），以及人类可读的 `error` 或 `message` 字段。`error` 和 `message` 值为英文。客户端应使用代码查找本地化字符串，以便 UI 以用户选择的语言显示消息。

| 端点 | 成功代码 | 错误代码 |
|----------|--------------|-------------|
| `/api/auth/login` | — | `REQUIRED_CREDENTIALS`，`INVALID_CREDENTIALS`，`ACCOUNT_LOCKED`，`DATABASE_NOT_READY`，`INTERNAL_ERROR` |
| `/api/auth/logout` | `LOGGED_OUT` | `NO_ACTIVE_SESSION`，`INTERNAL_ERROR` |
| `/api/auth/me` | — | `INTERNAL_ERROR` |
| `/api/auth/change-password` | `PASSWORD_CHANGED` | `NEW_PASSWORD_REQUIRED`，`POLICY_NOT_MET`，`USER_NOT_FOUND`，`CURRENT_PASSWORD_INCORRECT`，`NEW_PASSWORD_SAME_AS_CURRENT`，`INTERNAL_ERROR` |
| `/api/auth/password-policy` | — | `POLICY_RETRIEVE_FAILED` |

### 错误响应 {#error-responses}
- `401 Unauthorized`: 无效或缺少会话，会话过期，或 CSRF 令牌验证失败
- `403 Forbidden`: CSRF 令牌验证失败或操作不允许

:::caution
 不要将 **duplistatus** 服务器暴露在公共互联网上。请在安全网络中使用它 
（例如，通过防火墙保护的本地LAN）。 

将 **duplistatus** 接口暴露在公共 
互联网上而没有适当的安全措施可能会导致未经授权的访问。
:::
