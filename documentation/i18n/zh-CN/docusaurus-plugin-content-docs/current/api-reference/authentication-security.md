# 身份验证和安全 {#authentication-security}

API 使用基于会话的身份验证和 CSRF 保护来防止所有数据库写入操作的未经授权访问和潜在的拒绝服务攻击。外部 API（由 Duplicati 使用）保持未经身份验证，以确保兼容性。

## 基于会话的身份验证 {#session-based-authentication}

受保护的端点需要有效的会话 Cookie 和 CSRF 令牌。会话系统为所有受保护的操作提供安全身份验证。

### 会话管理 {#session-management}
1. **创建会话**：POST 到 `/api/session` 以创建新会话
2. **获取 CSRF 令牌**：GET `/api/csrf` 以获取会话的 CSRF 令牌
3. **包含在请求中**：使用会话 Cookie 和 CSRF 令牌发送受保护的请求
4. **验证会话**：GET `/api/session` 检查会话是否仍然有效
5. **删除会话**：DELETE `/api/session` 以退出登录并清除会话

### CSRF 保护 {#csrf-protection}
所有状态更改操作都需要与当前会话匹配的有效 CSRF 令牌。必须在受保护端点的 `X-CSRF-Token` 标头中包含 CSRF 令牌。

### 受保护的端点 {#protected-endpoints}
所有修改数据库数据的端点都需要会话身份验证和 CSRF 令牌：

- **服务器管理**：`/api/servers/:id`（PATCH, DELETE），`/api/servers/:id/server-url`（PATCH），`/api/servers/:id/password`（PATCH, GET）
- **配置管理**：`/api/configuration/email`（GET, POST, DELETE），`/api/configuration/unified`（GET），`/api/configuration/ntfy`（GET），`/api/configuration/notifications`（GET, POST），`/api/configuration/backup-settings`（POST），`/api/configuration/templates`（POST），`/api/configuration/overdue-tolerance`（GET, POST）
- **通知系统**：`/api/notifications/test`（POST）
- **Cron 配置**：`/api/cron-config`（GET, POST）
- **Cron 代理**：`/api/cron/*`（GET, POST）- 代理请求到 cron 服务
- **会话管理**：`/api/session`（POST, GET, DELETE），`/api/csrf`（GET）
- **图表数据**：`/api/chart-data/*`（GET）
- **仪表板**：`/api/dashboard`（GET）
- **服务器详情**：`/api/servers`（GET），`/api/servers/:id`（GET），`/api/detail/:serverId`（GET）
- **审计日志**：`/api/audit-log`（GET），`/api/audit-log/download`（GET），`/api/audit-log/filters`（GET），`/api/audit-log/retention`（PATCH），`/api/audit-log/cleanup`（POST）- 写入操作需要管理员权限
- **用户管理**：`/api/users`（GET, POST, PATCH, DELETE）- 需要管理员权限
- **数据库管理**：`/api/database/backup`（GET），`/api/database/restore`（POST）- 需要管理员权限
- **应用程序日志**：`/api/application-logs`（GET），`/api/application-logs/export`（GET）- 需要管理员权限
- **备份收集**：`/api/backups/collect`（POST）- 需要会话和 CSRF 令牌
- **备份计划同步**：`/api/backups/sync-schedule`（POST）- 需要会话和 CSRF 令牌
- **逾期检查**：`/api/notifications/check-overdue`（POST）- 需要会话和 CSRF 令牌
- **清除逾期时间戳**：`/api/notifications/clear-overdue-timestamps`（POST）- 需要会话和 CSRF 令牌

### 未受保护的端点 {#unprotected-endpoints}
外部 API 保持未经身份验证，以便 Duplicati 集成：

- `/api/upload` - Duplicati 的备份数据上传
- `/api/lastbackup/:serverId` - 最新备份状态
- `/api/lastbackups/:serverId` - 最新备份状态
- `/api/summary` - 整体摘要数据
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
- **端点**：`/api/auth/login`
- **方法**：POST
- **描述**：对用户进行身份验证并创建会话。支持在失败尝试后锁定账户和密码更改要求。
- **身份验证**：需要有效的会话和 CSRF 令牌（但不需要已登录用户）
- **请求正文**：

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

- **错误响应**: 全部错误响应均包含 `error` (英文消息) 和 `errorCode` (用于客户端翻译的稳定代码)。
  - `400`: 缺少用户名或密码 — `errorCode: "REQUIRED_CREDENTIALS"`
  - `401`: 用户名或密码无效 — `errorCode: "INVALID_CREDENTIALS"`
  - `403`: 由于登录失败次数过多，账户已锁定 — `errorCode: "ACCOUNT_LOCKED"` (包含 `lockedUntil`, `minutesRemaining`)
  - `500`: 内部服务器错误 — `errorCode: "INTERNAL_ERROR"`
  - `503`: 数据库未就绪 — `errorCode: "DATABASE_NOT_READY"`
- **注意**:
  - 登录失败 5 次后，账户将被锁定 15 分钟
  - 登录失败尝试将被跟踪并记录
  - 响应中会自动设置会话 Cookie
  - 如果用户设置了 `mustChangePassword` 标志，则应将其重定向到更改密码页面
  - 全部登录尝试 (成功和失败) 均记录在审计日志中

### 退出登录 - `/api/auth/logout` {#logout---apiauthlogout}
- **端点**: `/api/auth/logout`
- **方法**: POST
- **描述**: 退出当前用户登录并销毁其会话。
- **身份验证**: 需要有效的会话和 CSRF 令牌
- **响应** (成功):

  ```json
  {
    "success": true,
    "message": "Logged out successfully",
    "successCode": "LOGGED_OUT"
  }
  ```

- **错误响应**: 包含 `error` 和 `errorCode` 用于客户端翻译。
  - `400`: 无活动会话 — `errorCode: "NO_ACTIVE_SESSION"`
  - `500`: 内部服务器错误 — `errorCode: "INTERNAL_ERROR"`
- **注意**:
  - 响应中将清除会话 Cookie
  - 退出登录将记录在审计日志中
  - 会话立即失效

### 获取当前用户 - `/api/auth/me` {#get-current-user---apiauthme}
- **端点**: `/api/auth/me`
- **方法**: GET
- **描述**: 返回当前已验证的用户信息，或指示是否没有用户登录。
- **身份验证**: 需要有效的会话 (但不需要登录用户)
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

- **错误响应**: 包含 `error` 和 `errorCode` 用于客户端翻译。
  - `500`: 内部服务器错误 — `errorCode: "INTERNAL_ERROR"`
- **注意**:
  - 可以在没有登录用户的情况下调用 (返回 `authenticated: false`)
  - 用于在页面加载时检查身份验证状态

### 更改密码 - `/api/auth/change-password` {#change-password---apiauthchange-password}
- **端点**: `/api/auth/change-password`
- **方法**: POST
- **描述**: 更改当前已验证用户的密码。如果设置了 `mustChangePassword`，则跳过当前密码验证。
- **身份验证**: 需要有效的会话和 CSRF 令牌 (需要登录用户)
- **请求体**:

  ```json
  {
    "currentPassword": "old-password",
    "newPassword": "new-secure-password"
  }
  ```

- `currentPassword`: 如果 `mustChangePassword` 为 true 则可选，否则必填
  - `newPassword`: 必填，必须符合密码策略要求
- **响应** (成功):

  ```json
  {
    "success": true,
    "message": "Password changed successfully",
    "successCode": "PASSWORD_CHANGED"
  }
  ```

- **错误响应**: 包含 `error` 和 `errorCode` 用于客户端翻译。策略违规可能包含 `validationErrors` (字符串数组)。
  - `400`: 缺少新密码 — `errorCode: "NEW_PASSWORD_REQUIRED"`
  - `400`: 违反密码策略 — `errorCode: "POLICY_NOT_MET"` (可能包含 `validationErrors`)
  - `400`: 新密码与当前密码相同 — `errorCode: "NEW_PASSWORD_SAME_AS_CURRENT"`
  - `401`: 当前密码不正确 — `errorCode: "CURRENT_PASSWORD_INCORRECT"`
  - `404`: 未找到用户 — `errorCode: "USER_NOT_FOUND"`
  - `500`: 内部服务器错误 — `errorCode: "INTERNAL_ERROR"`
- **注意**:
  - 新密码必须符合密码策略要求 (长度、复杂度等)
  - 如果设置了 `mustChangePassword` 标志，则跳过当前密码验证
  - 成功更改密码后，`mustChangePassword` 标志将被清除
  - 密码更改将记录在审计日志中
  - 新密码必须与当前密码不同

### 检查管理员必须更改密码 - `/api/auth/admin-must-change-password` {#check-admin-must-change-password---apiauthadmin-must-change-password}
- **端点**: `/api/auth/admin-must-change-password`
- **方法**: GET
- **描述**: 检查管理员用户是否必须更改其密码。此端点是公开的（无需身份验证），因为它仅返回一个布尔标志。
- **响应**:

  ```json
  {
    "mustChangePassword": false
  }
  ```

- **错误响应**:
  - `500`: 内部服务器错误（如果出现数据库问题，返回 `mustChangePassword: false` 以避免显示提示）
- **注意事项**:
  - 公开端点，无需身份验证
  - 如果管理员用户不存在，返回 `false`
  - 用于确定是否应显示密码更改提示
  - 出错时，返回 `false` 以避免在出现数据库问题时显示提示

### 获取密码策略 - `/api/auth/password-policy` {#get-password-policy---apiauthpassword-policy}
- **端点**: `/api/auth/password-policy`
- **方法**: GET
- **描述**: 返回当前密码策略配置。此端点是公开的（无需身份验证），因为它需要用于前端验证。
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

- **错误响应**: 包括 `error` 和 `errorCode` 以进行客户端翻译。
  - `500`: 检索密码策略失败 — `errorCode: "POLICY_RETRIEVE_FAILED"`
- **注意事项**:
  - 公开端点，无需身份验证
  - 由前端组件用于显示密码要求并在提交前验证密码
  - 策略通过环境变量配置（`PWD_ENFORCE`，`PWD_MIN_LEN`）
  - 默认密码检查（防止使用默认管理员密码）无论策略设置如何都会强制执行

### 认证 API 错误和成功代码（国际化）{#auth-api-error-and-success-codes-i18n}

认证端点除了返回人类可读的 `error` 或 `message` 字段外，还返回稳定的 `errorCode`（成功时为 `successCode`）。`error` 和 `message` 值为英文。客户端应使用代码查找本地化字符串，以便用户界面以用户选择的语言显示消息。

| 端点 | 成功代码 | 错误代码 |
|----------|--------------|-------------|
| `/api/auth/login` | — | `REQUIRED_CREDENTIALS`，`INVALID_CREDENTIALS`，`ACCOUNT_LOCKED`，`DATABASE_NOT_READY`，`INTERNAL_ERROR` |
| `/api/auth/logout` | `LOGGED_OUT` | `NO_ACTIVE_SESSION`，`INTERNAL_ERROR` |
| `/api/auth/me` | — | `INTERNAL_ERROR` |
| `/api/auth/change-password` | `PASSWORD_CHANGED` | `NEW_PASSWORD_REQUIRED`，`POLICY_NOT_MET`，`USER_NOT_FOUND`，`CURRENT_PASSWORD_INCORRECT`，`NEW_PASSWORD_SAME_AS_CURRENT`，`INTERNAL_ERROR` |
| `/api/auth/password-policy` | — | `POLICY_RETRIEVE_FAILED` |

### 错误响应 {#error-responses}
- `401 Unauthorized`: 无效或缺失会话，会话过期，或 CSRF 令牌验证失败
- `403 Forbidden`: CSRF 令牌验证失败或操作不允许

:::caution
 不要将 **duplistatus** 服务器暴露在公共互联网上。请在安全网络中使用
（例如，受防火墙保护的本地局域网）。

在没有适当安全措施的情况下将 **duplistatus** 接口暴露在公共
互联网上可能导致未经授权的访问。
:::
