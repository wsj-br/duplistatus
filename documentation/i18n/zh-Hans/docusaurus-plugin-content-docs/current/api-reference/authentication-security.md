# 认证与安全 {/* #authentication--security */}

该API使用基于会话的认证和CSRF保护来保护所有数据库写入操作，以防止未经授权的访问和潜在的拒绝服务攻击。Duplicati和Homepage使用的外部API保持CSRF豁免。它们可以选择性地需要一个范围有限的API密钥和/或IP白名单（默认均关闭）。`/api/upload`还具有可配置的正文大小限制和速率限制。

## 基于会话的认证 {/* #session-based-authentication */}

受保护的端点需要有效的会话cookie和CSRF令牌。会话系统为所有受保护的操作提供安全认证。

### 会话管理 {/* #session-management */}
1. **创建会话**：POST到`/api/session`以创建新会话
2. **获取CSRF令牌**：GET `/api/csrf`以获取会话的CSRF令牌
3. **包含在请求中**：将会话cookie和CSRF令牌与受保护的请求一起发送
4. **验证会话**：GET `/api/session`以检查会话是否仍然有效
5. **删除会话**：DELETE `/api/session`以注销并清除会话

### CSRF保护 {/* #csrf-protection */}
所有状态更改操作都需要一个有效的CSRF令牌，该令牌必须与当前会话匹配。CSRF令牌必须包含在`X-CSRF-Token`头中，用于受保护的端点。

### 受保护的端点 {/* #protected-endpoints */}
所有修改数据库数据的端点都需要会话认证和CSRF令牌：

- **服务器管理**：`/api/servers/:id`（PATCH，DELETE），`/api/servers/:id/server-url`（PATCH），`/api/servers/:id/password`（PATCH，GET）
- **配置管理**：`/api/configuration/email`（GET，POST，DELETE），`/api/configuration/unified`（GET），`/api/configuration/ntfy`（GET），`/api/configuration/notifications`（GET，POST），`/api/configuration/backup-settings`（POST），`/api/configuration/templates`（POST），`/api/configuration/overdue-tolerance`（GET，POST），`/api/configuration/daily-summary`（GET，POST），`/api/configuration/daily-summary/send`（POST），`/api/configuration/daily-summary/retry`（POST），`/api/configuration/daily-summary/preview`（POST）
- **通知系统**：`/api/notifications/test`（POST），`/api/notifications/preview`（POST）
- **Cron配置**：`/api/cron-config`（GET，POST）
- **Cron 代理**: `/api/cron/*` (GET, POST) - 代理请求到 cron 服务。POST 需要管理员权限。cron 进程默认绑定到 `127.0.0.1`；修改 cron-service 路由需要 `X-Cron-Service-Secret` 当 `CRON_SERVICE_SECRET` 被设置时。
- **会话管理**: `/api/session` (POST, GET, DELETE), `/api/csrf` (GET)
- **图表数据**: `/api/chart-data/*` (GET)
- **仪表板**: `/api/dashboard` (GET)
- **服务器详情**：`/api/servers`（GET），`/api/servers/:id`（GET），`/api/detail/:serverId`（GET）
- **审计日志**：`/api/audit-log`（GET），`/api/audit-log/download`（GET），`/api/audit-log/filters`（GET），`/api/audit-log/retention`（PATCH），`/api/audit-log/cleanup`（POST）——写入操作需要管理员
- **用户管理**：`/api/users`（GET，POST，PATCH，DELETE）——需要管理员
- **数据库管理**：`/api/database/backup`（GET），`/api/database/restore`（POST）——需要管理员
- **应用程序日志**：`/api/application-logs`（GET），`/api/application-logs/export`（GET）——需要管理员
- **备份集合**：`/api/backups/collect`（POST）——需要会话和CSRF令牌
- **备份计划同步**：`/api/backups/sync-schedule`（POST）——需要会话和CSRF令牌
- **过期检查**：`/api/notifications/check-overdue`（POST）——需要会话和CSRF令牌
- **清除过期时间戳**：`/api/notifications/clear-overdue-timestamps`（POST）——需要会话和CSRF令牌

### 外部端点 {/* #external-endpoints */}
这些路由不使用会话cookie或CSRF。认证是可选的，并在设置中配置：

- `/api/upload`——来自Duplicati的备份数据上传（上传范围密钥，大小和速率限制）
- `/api/lastbackup/:serverId`——最新备份状态（读取范围密钥）
- `/api/lastbackups/:serverId`——最新备份状态（读取范围密钥）
- `/api/summary`——总体摘要数据（读取范围密钥）
- `/api/health`——健康检查端点（永不需要密钥；廉价的SQLite探测；每IP速率限制）
- `/api/ping`——连通性探测（永不需要密钥；每IP速率限制）

当**需要API密钥**关闭时，前四个路由接受带有或不带有密钥的请求：记录有效的匹配范围密钥；忽略错误的密钥。当开关打开时，它们在没有有效密钥时返回`401`，在密钥范围不匹配时返回`403`。`/api/health`和`/api/ping`永远不使用密钥。请参阅[API密钥](../user-guide/settings/api-keys-settings.md)和[IP白名单](../user-guide/settings/ip-allowlist-settings.md)。

### 使用示例（会话+CSRF） {/* #usage-example-session--csrf */}

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
- **端点**: `/api/auth/login`
- **方法**: POST
- **描述**: 验证用户并创建会话。支持失败尝试后锁定账户和密码更改要求。
- **认证**: 需要有效的会话和 CSRF 令牌（但不需要已登录的用户）
- **请求正文**:

  ```json
  {
    "username": "admin",
    "password": "password123"
  }
  ```

- **响应**（成功）:

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

- **错误响应**: 所有错误响应都包括 `error`（英文消息）和 `errorCode`（用于客户端翻译的稳定代码）。
  - `400`: 缺少用户名或密码 — `errorCode: "REQUIRED_CREDENTIALS"`
  - `401`: 无效的用户名或密码 — `errorCode: "INVALID_CREDENTIALS"`
  - `403`: 由于多次登录失败而锁定账户 — `errorCode: "ACCOUNT_LOCKED"`（包括 `lockedUntil`, `minutesRemaining`)
  - `500`: 内部服务器错误 — `errorCode: "INTERNAL_ERROR"`
  - `503`: 数据库未就绪 — `errorCode: "DATABASE_NOT_READY"`
- **注意事项**:
  - 账户在 5 次失败登录尝试后锁定 15 分钟
  - 失败的登录尝试会被跟踪并记录
  - 会话 cookie 会自动设置在响应中
  - 如果用户设置了 `mustChangePassword` 标志，他们应该被重定向到更改密码页面
  - 所有登录尝试（成功和失败）都会记录到审计日志中

### 注销 - `/api/auth/logout` {/* #logout---apiauthlogout */}
- **端点**: `/api/auth/logout`
- **方法**: POST
- **描述**: 注销当前用户并销毁他们的会话。
- **认证**: 需要有效的会话和 CSRF 令牌
- **响应**（成功）:

  ```json
  {
    "success": true,
    "message": "Logged out successfully",
    "successCode": "LOGGED_OUT"
  }
  ```

- **错误响应**: 包括 `error` 和 `errorCode` 用于客户端翻译。
  - `400`: 没有活动会话 — `errorCode: "NO_ACTIVE_SESSION"`
  - `500`: 内部服务器错误 — `errorCode: "INTERNAL_ERROR"`
- **注意事项**:
  - 会话 cookie 在响应中被清除
  - 注销记录到审计日志
  - 会话立即失效

### 获取当前用户 - `/api/auth/me` {/* #get-current-user---apiauthme */}
- **端点**: `/api/auth/me`
- **方法**: GET
- **描述**: 返回当前认证用户的信息，或指示没有用户登录。
- **认证**: 需要有效的会话（但不需要已登录的用户）
- **响应**（已认证）:

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

- **响应**（未认证）:

  ```json
  {
    "authenticated": false,
    "user": null
  }
  ```

- **错误响应**: 包括 `error` 和 `errorCode` 用于客户端翻译。
  - `500`: 内部服务器错误 — `errorCode: "INTERNAL_ERROR"`
- **注意事项**:
  - 可以在没有登录用户的情况下调用（返回 `authenticated: false`)
  - 在页面加载时检查认证状态很有用

### 更改密码 - `/api/auth/change-password` {/* #change-password---apiauthchange-password */}
- **端点**: `/api/auth/change-password`
- **方法**: POST
- **描述**: 更改当前认证用户的密码。如果设置了 `mustChangePassword`，则跳过当前密码验证。
- **认证**: 需要有效的会话和 CSRF 令牌（需要已登录的用户）
- **请求正文**:

  ```json
  {
    "currentPassword": "old-password",
    "newPassword": "new-secure-password"
  }
  ```

- `currentPassword`: 如果 `mustChangePassword` 为 true，则可选，否则为必填
  - `newPassword`: 必填，必须符合密码策略要求
- **响应**（成功）:

  ```json
  {
    "success": true,
    "message": "Password changed successfully",
    "successCode": "PASSWORD_CHANGED"
  }
  ```

- **错误响应**: 包括 `error` 和 `errorCode` 用于客户端翻译。策略违规可能包括 `validationErrors`（字符串数组）。
  - `400`: 缺少新密码 — `errorCode: "NEW_PASSWORD_REQUIRED"`
  - `400`: 密码策略违规 — `errorCode: "POLICY_NOT_MET"`（可能包括 `validationErrors`)
  - `400`: 新密码与当前密码相同 — `errorCode: "NEW_PASSWORD_SAME_AS_CURRENT"`
  - `401`：当前密码不正确 — `errorCode: "CURRENT_PASSWORD_INCORRECT"`
  - `404`：用户未找到 — `errorCode: "USER_NOT_FOUND"`
  - `500`：内部服务器错误 — `errorCode: "INTERNAL_ERROR"`
- **注意**：
  - 新密码必须符合密码策略要求（长度、复杂性等）
  - 如果设置了`mustChangePassword`标志，则跳过当前密码验证
  - 密码更改成功后，`mustChangePassword`标志将被清除
  - 密码更改记录将被记录到审计日志中
  - 新密码必须与当前密码不同

### 检查管理员必须更改密码 - `/api/auth/admin-must-change-password` {/* #check-admin-must-change-password---apiauthadmin-must-change-password */}
- **端点**：`/api/auth/admin-must-change-password`
- **方法**：GET
- **描述**：检查管理员用户是否必须更改密码。此端点是公开的（无需身份验证），因为它仅返回一个布尔标志。
- **响应**:

  ```json
  {
    "mustChangePassword": false
  }
  ```

- **错误响应**：
  - `500`：内部服务器错误（在错误时返回`mustChangePassword: false`以避免显示提示，如果存在数据库问题）
- **注意**：
  - 公开端点，无需身份验证
  - 如果管理员用户不存在，则返回`false`
  - 用于确定是否应显示密码更改提示
  - 在错误时，返回`false`以避免显示提示，如果存在数据库问题

### 获取密码策略 - `/api/auth/password-policy` {/* #get-password-policy---apiauthpassword-policy */}
- **端点**：`/api/auth/password-policy`
- **方法**：GET
- **描述**：返回当前密码策略配置。此端点是公开的（无需身份验证），因为它用于前端验证。
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

- **错误响应**：包括`error`和`errorCode`以进行客户端翻译。
  - `500`：无法检索密码策略 — `errorCode: "POLICY_RETRIEVE_FAILED"`
- **注意**：
  - 公开端点，无需身份验证
  - 由前端组件用于显示密码要求并验证提交前的密码
  - 策略通过环境变量配置（`PWD_ENFORCE`，`PWD_MIN_LEN`）
  - 默认密码检查（防止使用默认管理员密码）始终强制执行，无论策略设置如何

### 认证API错误和成功代码（i18n）{/* #auth-api-error-and-success-codes-i18n */}

认证端点返回一个稳定的`errorCode`（以及在成功时`successCode`），以及人类可读的`error`或`message`字段。`error`和`message`值为英文。客户端应使用代码查找本地化字符串，以便UI以用户选择的语言显示消息。

| 端点 | 成功代码 | 错误代码 |
|----------|--------------|-------------|
| `/api/auth/login` | — | `REQUIRED_CREDENTIALS`, `INVALID_CREDENTIALS`, `ACCOUNT_LOCKED`, `DATABASE_NOT_READY`, `INTERNAL_ERROR` |
| `/api/auth/logout` | `LOGGED_OUT` | `NO_ACTIVE_SESSION`, `INTERNAL_ERROR` |
| `/api/auth/me` | — | `INTERNAL_ERROR` |
| `/api/auth/change-password` | `PASSWORD_CHANGED` | `NEW_PASSWORD_REQUIRED`, `POLICY_NOT_MET`, `USER_NOT_FOUND`, `CURRENT_PASSWORD_INCORRECT`, `NEW_PASSWORD_SAME_AS_CURRENT`, `INTERNAL_ERROR` |
| `/api/auth/password-policy` | — | `POLICY_RETRIEVE_FAILED` |

### 错误响应 {/* #error-responses */}
- `401 Unauthorized`：会话无效或缺失，会话已过期，或CSRF令牌验证失败
- `403 Forbidden`：CSRF令牌验证失败或操作不允许

:::caution
 不要将**duplistatus**服务器暴露在公共互联网上。在安全网络中使用它
（例如，受防火墙保护的本地局域网）。

将**duplistatus**接口暴露在公共互联网上而不采取适当的安全措施可能会导致未经授权的访问。
:::
