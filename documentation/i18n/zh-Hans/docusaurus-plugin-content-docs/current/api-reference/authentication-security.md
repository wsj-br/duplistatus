# 身份验证与安全 {/* #authentication--security */}

该 API 对所有数据库写入操作使用基于会话的身份验证和 CSRF 保护的组合，以防止未经授权的访问和潜在的拒绝服务攻击。Duplicati 和 Homepage 使用的外部 API 保持免受 CSRF 限制。它们可以选择性地要求作用域 API 密钥和/或 IP 白名单（默认情况下均处于关闭状态）。`/api/upload` 还具有可配置的正文大小上限和速率限制。

## 基于会话的身份验证 {/* #session-based-authentication */}

受保护的端点需要有效的会话 Cookie 和 CSRF 令牌。会话系统为所有受保护操作提供安全身份验证。

### 会话管理 {/* #session-management */}
1. **创建会话**：向 `/api/session` 发送 POST 请求以创建新会话
2. **获取 CSRF 令牌**：向 `/api/csrf` 发送 GET 请求以获取会话的 CSRF 令牌
3. **在请求中包含**：随受保护的请求发送会话 Cookie 和 CSRF 令牌
4. **验证会话**：向 `/api/session` 发送 GET 请求以检查会话是否仍然有效
5. **删除会话**：向 `/api/session` 发送 DELETE 请求以注销并清除会话

### CSRF 保护 {/* #csrf-protection */}
所有状态更改操作都需要一个与当前会话匹配的有效 CSRF 令牌。CSRF 令牌必须包含在受保护端点的 `X-CSRF-Token` 标头中。

### 受保护的端点 {/* #protected-endpoints */}
所有修改数据库数据的端点都需要会话身份验证和 CSRF 令牌：

- **服务器管理**：`/api/servers/:id` (PATCH, DELETE), `/api/servers/:id/server-url` (PATCH), `/api/servers/:id/password` (PATCH, GET)
- **配置管理**：`/api/configuration/email` (GET, POST, DELETE), `/api/configuration/unified` (GET), `/api/configuration/ntfy` (GET), `/api/configuration/notifications` (GET, POST), `/api/configuration/backup-settings` (POST), `/api/configuration/templates` (POST), `/api/configuration/overdue-tolerance` (GET, POST), `/api/configuration/daily-summary` (GET, POST), `/api/configuration/daily-summary/send` (POST), `/api/configuration/daily-summary/retry` (POST), `/api/configuration/daily-summary/preview` (POST)
- **通知系统**：`/api/notifications/test` (POST), `/api/notifications/preview` (POST)
- **Cron 配置**：`/api/cron-config` (GET, POST)
- **Cron 代理**：`/api/cron/*` (GET, POST) - 代理对 cron 服务的请求。POST 需要管理员权限。cron 进程默认绑定到 `127.0.0.1`；当设置 `CRON_SERVICE_SECRET` 时，变更 cron 服务路由需要 `X-Cron-Service-Secret`。
- **会话管理**：`/api/session` (POST, GET, DELETE), `/api/csrf` (GET)
- **图表数据**：`/api/chart-data/*` (GET)
- **仪表板**：`/api/dashboard` (GET)
- **服务器详情**：`/api/servers` (GET), `/api/servers/:id` (GET), `/api/detail/:serverId` (GET)
- **审计日志**：`/api/audit-log` (GET), `/api/audit-log/download` (GET), `/api/audit-log/filters` (GET), `/api/audit-log/retention` (PATCH), `/api/audit-log/cleanup` (POST) - 写入操作需要管理员权限
- **用户管理**：`/api/users` (GET, POST, PATCH, DELETE) - 需要管理员权限
- **数据库管理**：`/api/database/backup` (GET), `/api/database/restore` (POST) - 需要管理员权限
- **应用程序日志**：`/api/application-logs` (GET), `/api/application-logs/export` (GET) - 需要管理员权限
- **备份集合**：`/api/backups/collect` (POST) - 需要会话和 CSRF 令牌
- **备份计划同步**：`/api/backups/sync-schedule` (POST) - 需要会话和 CSRF 令牌
- **逾期检查**：`/api/notifications/check-overdue` (POST) - 需要会话和 CSRF 令牌
- **清除逾期时间戳**：`/api/notifications/clear-overdue-timestamps` (POST) - 需要会话和 CSRF 令牌

### 外部端点 {/* #external-endpoints */}
这些路由不使用会话 Cookie 或 CSRF。身份验证是可选的，并在设置中配置：

- `/api/upload` - 来自 Duplicati 的备份数据上传（上传作用域密钥、大小和速率限制）
- `/api/lastbackup/:serverId` - 最新备份状态（读取作用域密钥）
- `/api/lastbackups/:serverId` - 最新备份状态（读取作用域密钥）
- `/api/summary` - 整体摘要数据（读取作用域密钥）
- `/api/health` - 健康检查端点（从不需要密钥；轻量级 SQLite 探测；按 IP 限制速率）
- `/api/ping` - 连接性探测（从不需要密钥；按 IP 限制速率）

当**需要 API 密钥**处于关闭状态时，前四个路由接受带或不带密钥的请求：记录有效的匹配作用域密钥；忽略错误密钥。当开关打开时，它们在没有有效密钥时返回 `401`，在密钥作用域不匹配时返回 `403`。`/api/health` 和 `/api/ping` 从不使用密钥。请参阅 [API 密钥](../user-guide/settings/api-keys-settings.md) 和 [IP 白名单](../user-guide/settings/ip-allowlist-settings.md)。

### 使用示例（会话 + CSRF）{/* #usage-example-session--csrf */}

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

## 认证端点 {/* #authentication-endpoints */}

### 登录 - `/api/auth/login` {/* #login---apiauthlogin */}
- **端点**：`/api/auth/login`
- **方法**：POST
- **描述**：验证用户并创建会话。支持登录失败后锁定账户和密码更改要求。
- **认证**：需要有效的会话和 CSRF 令牌（但不需要已登录用户）
- **请求体**：

  ```json
  {
    "username": "admin",
    "password": "password123"
  }
  ```

- **响应**（成功）：

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

- **错误响应**：所有错误响应都包含 `error`（英文消息）和 `errorCode`（用于客户端翻译的稳定代码）。
  - `400`：缺少用户名或密码 — `errorCode: "REQUIRED_CREDENTIALS"`
  - `401`：无效的用户名或密码 — `errorCode: "INVALID_CREDENTIALS"`
  - `403`：因登录失败次数过多而锁定账户 — `errorCode: "ACCOUNT_LOCKED"`（包含 `lockedUntil`，`minutesRemaining`）
  - `500`：内部服务器错误 — `errorCode: "INTERNAL_ERROR"`
  - `503`：数据库未就绪 — `errorCode: "DATABASE_NOT_READY"`
- **备注**：
  - 账户在 5 次登录失败后被锁定 15 分钟
  - 登录失败尝试会被跟踪和记录
  - 会话 Cookie 在响应中自动设置
  - 如果用户设置了 `mustChangePassword` 标志，则应重定向到密码更改页面
  - 所有登录尝试（成功和失败）都会记录到审计日志

### 登出 - `/api/auth/logout` {/* #logout---apiauthlogout */}
- **端点**：`/api/auth/logout`
- **方法**：POST
- **描述**：登出当前用户并销毁其会话。
- **认证**：需要有效的会话和 CSRF 令牌
- **响应**（成功）：

  ```json
  {
    "success": true,
    "message": "Logged out successfully",
    "successCode": "LOGGED_OUT"
  }
  ```

- **错误响应**：包含 `error` 和 `errorCode` 用于客户端翻译。
  - `400`：无活动会话 — `errorCode: "NO_ACTIVE_SESSION"`
  - `500`：内部服务器错误 — `errorCode: "INTERNAL_ERROR"`
- **备注**：
  - 会话 Cookie 在响应中被清除
  - 登出记录到审计日志
  - 会话立即失效

### 获取当前用户 - `/api/auth/me` {/* #get-current-user---apiauthme */}
- **端点**：`/api/auth/me`
- **方法**：GET
- **描述**：返回当前已认证用户的信息，或指示是否没有用户登录。
- **认证**：需要有效的会话（但不需要已登录用户）
- **响应**（已认证）：

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

- **响应**（未认证）：

  ```json
  {
    "authenticated": false,
    "user": null
  }
  ```

- **错误响应**：包含 `error` 和 `errorCode` 用于客户端翻译。
  - `500`：内部服务器错误 — `errorCode: "INTERNAL_ERROR"`
- **备注**：
  - 可以在没有已登录用户的情况下调用（返回 `authenticated: false`）
  - 用于在页面加载时检查认证状态

### 更改密码 - `/api/auth/change-password` {/* #change-password---apiauthchange-password */}
- **端点**：`/api/auth/change-password`
- **方法**：POST
- **描述**：更改当前已认证用户的密码。如果设置了 `mustChangePassword`，则跳过当前密码验证。
- **认证**：需要有效的会话和 CSRF 令牌（需要已登录用户）
- **请求体**：

  ```json
  {
    "currentPassword": "old-password",
    "newPassword": "new-secure-password"
  }
  ```

- `currentPassword`：如果 `mustChangePassword` 为 true 则可选，否则必需
  - `newPassword`：必需，必须满足密码策略要求
- **响应**（成功）：

  ```json
  {
    "success": true,
    "message": "Password changed successfully",
    "successCode": "PASSWORD_CHANGED"
  }
  ```

- **错误响应**：包含 `error` 和 `errorCode` 用于客户端翻译。策略违规可能包含 `validationErrors`（字符串数组）。
  - `400`：缺少新密码 — `errorCode: "NEW_PASSWORD_REQUIRED"`
  - `400`：密码策略违规 — `errorCode: "POLICY_NOT_MET"`（可能包含 `validationErrors`）
  - `400`：新密码与当前密码相同 — `errorCode: "NEW_PASSWORD_SAME_AS_CURRENT"`
  - `401`：当前密码不正确 — `errorCode: "CURRENT_PASSWORD_INCORRECT"`
  - `404`：用户未找到 — `errorCode: "USER_NOT_FOUND"`
  - `500`：内部服务器错误 — `errorCode: "INTERNAL_ERROR"`
- **备注**：
  - 新密码必须满足密码策略要求（长度、复杂性等）
  - 如果设置了 `mustChangePassword` 标志，则跳过当前密码验证
  - 密码更改成功后，`mustChangePassword` 标志被清除
  - 密码更改记录到审计日志
  - 新密码必须与当前密码不同

### 检查管理员必须更改密码 - `/api/auth/admin-must-change-password` {/* #check-admin-must-change-password---apiauthadmin-must-change-password */}
- **端点**：`/api/auth/admin-must-change-password`
- **方法**：GET
- **描述**：检查管理员用户是否必须更改其密码。此端点是公共的（无需身份验证），因为它只返回一个布尔标志。
- **响应**：

  ```json
  {
    "mustChangePassword": false
  }
  ```

- **错误响应**：
  - `500`：内部服务器错误（出错时返回 `mustChangePassword: false` 以避免在数据库出现问题时显示提示）
- **注意事项**：
  - 公共端点，无需身份验证
  - 如果管理员用户不存在，则返回 `false`
  - 用于确定是否应显示密码更改提示
  - 出错时返回 `false` 以避免在数据库出现问题时显示提示

### 获取密码策略 - `/api/auth/password-policy` {/* #get-password-policy---apiauthpassword-policy */}
- **端点**：`/api/auth/password-policy`
- **方法**：GET
- **描述**：返回当前密码策略配置。此端点是公共的（无需身份验证），因为前端验证需要使用它。
- **响应**：

  ```json
  {
    "minLength": 8,
    "requireUppercase": true,
    "requireLowercase": true,
    "requireNumbers": true,
    "requireSpecialChars": false
  }
  ```

- **错误响应**：包含 `error` 和 `errorCode` 供客户端翻译。
  - `500`：检索密码策略失败 —— `errorCode: "POLICY_RETRIEVE_FAILED"`
- **注意事项**：
  - 公共端点，无需身份验证
  - 由前端组件使用以显示密码要求并在提交前验证密码
  - 策略通过环境变量配置（`PWD_ENFORCE`，`PWD_MIN_LEN`）
  - 默认密码检查（防止使用默认管理员密码）始终强制执行，无论策略设置如何

### 认证 API 错误和成功代码（国际化）{/* #auth-api-error-and-success-codes-i18n */}

认证端点除了返回人类可读的 `error` 或 `message` 字段外，还会返回一个稳定的 `errorCode`（成功时为 `successCode`）。`error` 和 `message` 值为英文。客户端应使用这些代码查找本地化字符串，以便 UI 以用户选择的语言显示消息。

| 端点 | 成功代码 | 错误代码 |
|----------|--------------|-------------|
| `/api/auth/login` | — | `REQUIRED_CREDENTIALS`，`INVALID_CREDENTIALS`，`ACCOUNT_LOCKED`，`DATABASE_NOT_READY`，`INTERNAL_ERROR` |
| `/api/auth/logout` | `LOGGED_OUT` | `NO_ACTIVE_SESSION`，`INTERNAL_ERROR` |
| `/api/auth/me` | — | `INTERNAL_ERROR` |
| `/api/auth/change-password` | `PASSWORD_CHANGED` | `NEW_PASSWORD_REQUIRED`，`POLICY_NOT_MET`，`USER_NOT_FOUND`，`CURRENT_PASSWORD_INCORRECT`，`NEW_PASSWORD_SAME_AS_CURRENT`，`INTERNAL_ERROR` |
| `/api/auth/password-policy` | — | `POLICY_RETRIEVE_FAILED` |

### 错误响应{/* #error-responses */}
- `401 Unauthorized`：无效或缺少会话、会话已过期，或 CSRF 令牌验证失败
- `403 Forbidden`：CSRF 令牌验证失败或操作不被允许

:::caution
 不要将 **duplistatus** 服务器暴露给公共互联网。在安全网络中使用它
（例如，由防火墙保护的本地局域网）。

在没有适当安全措施的情况下将 **duplistatus** 界面暴露给公共
互联网可能导致未授权访问。
:::
