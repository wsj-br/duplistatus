

# 认证与安全 {#authentication-security}

API 对所有数据库写入操作采用会话认证和 CSRF 保护相结合，以防止未经授权的访问和潜在的拒绝服务攻击。外部 API（供 Duplicati 使用）保持未认证以确保兼容性。

## 基于会话的认证 {#session-based-authentication}

受保护的端点需要有效的会话 Cookie 和 CSRF 令牌。会话系统为所有受保护操作提供安全认证。

### 会话管理 {#session-management}
1. **创建会话**：POST 到 `/api/session` 创建新会话
2. **获取 CSRF 令牌**：GET `/api/csrf` 获取会话的 CSRF 令牌
3. **包含在请求中**：在受保护请求中发送会话 Cookie 和 CSRF 令牌
4. **验证会话**：GET `/api/session` 检查会话是否仍然有效
5. **删除会话**：DELETE `/api/session` 登出并清除会话

### CSRF 保护 {#csrf-protection}
所有状态变更操作都需要与当前会话匹配的有效 CSRF 令牌。受保护端点必须在 `X-CSRF-Token` 头中包含 CSRF 令牌。

### 受保护端点 {#protected-endpoints}
所有修改数据库数据的端点都需要会话认证和 CSRF 令牌：

- **服务器管理**：`/api/servers/:id`（PATCH、DELETE）、`/api/servers/:id/server-url`（PATCH）、`/api/servers/:id/password`（PATCH、GET）
- **配置管理**：`/api/configuration/email`（GET、POST、DELETE）、`/api/configuration/unified`（GET）、`/api/configuration/ntfy`（GET）、`/api/configuration/notifications`（GET、POST）、`/api/configuration/backup-settings`（POST）、`/api/configuration/templates`（POST）、`/api/configuration/overdue-tolerance`（GET、POST）
- **通知系统**：`/api/notifications/test`（POST）
- **Cron 配置**：`/api/cron-config`（GET、POST）
- **Cron 代理**：`/api/cron/*`（GET、POST）- 代理请求到 Cron 服务
- **会话管理**：`/api/session`（POST、GET、DELETE）、`/api/csrf`（GET）
- **图表数据**：`/api/chart-data/*`（GET）
- **仪表板**：`/api/dashboard`（GET）
- **服务器详情**：`/api/servers`（GET）、`/api/servers/:id`（GET）、`/api/detail/:serverId`（GET）
- **审计日志**：`/api/audit-log`（GET）、`/api/audit-log/download`（GET）、`/api/audit-log/filters`（GET）、`/api/audit-log/retention`（PATCH）、`/api/audit-log/cleanup`（POST）- 写入操作需要管理员权限
- **用户管理**：`/api/users`（GET、POST、PATCH、DELETE）- 需要管理员权限
- **数据库管理**：`/api/database/backup`（GET）、`/api/database/restore`（POST）- 需要管理员权限
- **应用程序日志**：`/api/application-logs`（GET）、`/api/application-logs/export`（GET）- 需要管理员权限
- **备份收集**：`/api/backups/collect`（POST）- 需要会话和 CSRF 令牌
- **备份计划同步**：`/api/backups/sync-schedule`（POST）- 需要会话和 CSRF 令牌
- **逾期检查**：`/api/notifications/check-overdue`（POST）- 需要会话和 CSRF 令牌
- **清除逾期时间戳**：`/api/notifications/clear-overdue-timestamps`（POST）- 需要会话和 CSRF 令牌

### 未保护端点 {#unprotected-endpoints}
外部 API 保持未认证以确保 Duplicati 集成：

- `/api/upload` - 来自 Duplicati 的备份数据上传
- `/api/lastbackup/:serverId` - 最新备份状态
- `/api/lastbackups/:serverId` - 最新备份列表状态
- `/api/summary` - 总体摘要数据
- `/api/health` - 健康检查端点

### 使用示例（会话 + CSRF） {#usage-example-session--csrf}
```typescript
// 1. 创建会话
const sessionResponse = await fetch('/api/session', { method: 'POST' });
const { sessionId } = await sessionResponse.json();

// 2. 获取 CSRF 令牌
const csrfResponse = await fetch('/api/csrf', {
  headers: { 'Cookie': `session=${sessionId}` }
});
const { csrfToken } = await csrfResponse.json();

// 3. 发起受保护请求
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

## 认证端点 {#authentication-endpoints}

### 登录 - `/api/auth/login` {#login---apiauthlogin}
- **端点**：`/api/auth/login`
- **方法**：POST
- **描述**：认证用户并创建会话。支持登录失败后的账户锁定和密码更改要求。
- **认证**：需要有效会话和 CSRF 令牌（但无需已登录用户）
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
- **错误响应**：所有错误响应包含 `error`（英语消息）和 `errorCode`（用于客户端翻译的稳定代码）。
  - `400`：缺少用户名或密码 — `errorCode: "REQUIRED_CREDENTIALS"`
  - `401`：用户名或密码无效 — `errorCode: "INVALID_CREDENTIALS"`
  - `403`：登录失败次数过多导致账户锁定 — `errorCode: "ACCOUNT_LOCKED"`（包含 `lockedUntil`、`minutesRemaining`）
  - `500`：内部服务器错误 — `errorCode: "INTERNAL_ERROR"`
  - `503`：数据库未就绪 — `errorCode: "DATABASE_NOT_READY"`
- **说明**：
  - 5 次登录失败后账户锁定 15 分钟
  - 跟踪并记录失败的登录尝试
  - 响应中自动设置会话 Cookie
  - 若用户设置了 `mustChangePassword` 标志，应重定向到更改密码页面
  - 所有登录尝试（成功和失败）均记录到审计日志

### 登出 - `/api/auth/logout` {#logout---apiauthlogout}
- **端点**：`/api/auth/logout`
- **方法**：POST
- **描述**：登出当前用户并销毁其会话。
- **认证**：需要有效会话和 CSRF 令牌
- **响应**（成功）：
  ```json
  {
    "success": true,
    "message": "Logged out successfully",
    "successCode": "LOGGED_OUT"
  }
  ```
- **错误响应**：包含 `error` 和 `errorCode` 供客户端翻译。
  - `400`：无活动会话 — `errorCode: "NO_ACTIVE_SESSION"`
  - `500`：内部服务器错误 — `errorCode: "INTERNAL_ERROR"`
- **说明**：
  - 响应中清除会话 Cookie
  - 登出记录到审计日志
  - 会话立即失效

### 获取当前用户 - `/api/auth/me` {#get-current-user---apiauthme}
- **端点**：`/api/auth/me`
- **方法**：GET
- **描述**：返回当前已认证用户信息，或指示是否无用户登录。
- **认证**：需要有效会话（但无需已登录用户）
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
- **错误响应**：包含 `error` 和 `errorCode` 供客户端翻译。
  - `500`：内部服务器错误 — `errorCode: "INTERNAL_ERROR"`
- **说明**：
  - 可在无登录用户时调用（返回 `authenticated: false`）
  - 适用于页面加载时检查认证状态

### 更改密码 - `/api/auth/change-password` {#change-password---apiauthchange-password}
- **端点**：`/api/auth/change-password`
- **方法**：POST
- **描述**：更改当前已认证用户的密码。若设置了 `mustChangePassword`，则跳过当前密码验证。
- **认证**：需要有效会话和 CSRF 令牌（需要已登录用户）
- **请求体**：
  ```json
  {
    "currentPassword": "old-password",
    "newPassword": "new-secure-password"
  }
  ```
  - `currentPassword`：若 `mustChangePassword` 为 true 则可选，否则必填
  - `newPassword`：必填，必须满足密码策略要求
- **响应**（成功）：
  ```json
  {
    "success": true,
    "message": "Password changed successfully",
    "successCode": "PASSWORD_CHANGED"
  }
  ```
- **错误响应**：包含 `error` 和 `errorCode` 供客户端翻译。策略违规可能包含 `validationErrors`（字符串数组）。
  - `400`：缺少新密码 — `errorCode: "NEW_PASSWORD_REQUIRED"`
  - `400`：违反密码策略 — `errorCode: "POLICY_NOT_MET"`（可能包含 `validationErrors`）
  - `400`：新密码与当前密码相同 — `errorCode: "NEW_PASSWORD_SAME_AS_CURRENT"`
  - `401`：当前密码不正确 — `errorCode: "CURRENT_PASSWORD_INCORRECT"`
  - `404`：未找到用户 — `errorCode: "USER_NOT_FOUND"`
  - `500`：内部服务器错误 — `errorCode: "INTERNAL_ERROR"`
- **说明**：
  - 新密码必须满足密码策略要求（长度、复杂度等）
  - 若设置了 `mustChangePassword` 标志，则跳过当前密码验证
  - 成功更改密码后清除 `mustChangePassword` 标志
  - 密码更改记录到审计日志
  - 新密码必须与当前密码不同

### 检查管理员是否必须更改密码 - `/api/auth/admin-must-change-password` {#check-admin-must-change-password---apiauthadmin-must-change-password}
- **端点**：`/api/auth/admin-must-change-password`
- **方法**：GET
- **描述**：检查管理员用户是否必须更改密码。此端点为公开（无需认证），因为它仅返回布尔标志。
- **响应**：
  ```json
  {
    "mustChangePassword": false
  }
  ```
- **错误响应**：
  - `500`：内部服务器错误（出错时返回 `mustChangePassword: false`，以避免数据库问题时显示提示）
- **说明**：
  - 公开端点，无需认证
  - 若管理员用户不存在则返回 `false`
  - 用于确定是否应显示密码更改提示
  - 出错时返回 `false`，以避免数据库问题时显示提示

### 获取密码策略 - `/api/auth/password-policy` {#get-password-policy---apiauthpassword-policy}
- **端点**：`/api/auth/password-policy`
- **方法**：GET
- **描述**：返回当前密码策略配置。此端点为公开（无需认证），因为前端验证需要它。
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
  - `500`：获取密码策略失败 — `errorCode: "POLICY_RETRIEVE_FAILED"`
- **说明**：
  - 公开端点，无需认证
  - 供前端组件显示密码要求并在提交前验证密码
  - 策略通过环境变量配置（`PWD_ENFORCE`、`PWD_MIN_LEN`）
  - 默认密码检查（防止使用默认管理员密码）无论策略设置如何始终强制执行

### 认证 API 错误和成功代码（i18n） {#auth-api-error-and-success-codes-i18n}

认证端点除人类可读的 `error` 或 `message` 字段外，还返回稳定的 `errorCode`（成功时返回 `successCode`）。`error` 和 `message` 值为英语。客户端应使用代码查找本地化字符串，以便 UI 以用户选择的语言显示消息。

| 端点 | 成功代码 | 错误代码 |
|----------|--------------|-------------|
| `/api/auth/login` | — | `REQUIRED_CREDENTIALS`、`INVALID_CREDENTIALS`、`ACCOUNT_LOCKED`、`DATABASE_NOT_READY`、`INTERNAL_ERROR` |
| `/api/auth/logout` | `LOGGED_OUT` | `NO_ACTIVE_SESSION`、`INTERNAL_ERROR` |
| `/api/auth/me` | — | `INTERNAL_ERROR` |
| `/api/auth/change-password` | `PASSWORD_CHANGED` | `NEW_PASSWORD_REQUIRED`、`POLICY_NOT_MET`、`USER_NOT_FOUND`、`CURRENT_PASSWORD_INCORRECT`、`NEW_PASSWORD_SAME_AS_CURRENT`、`INTERNAL_ERROR` |
| `/api/auth/password-policy` | — | `POLICY_RETRIEVE_FAILED` |

### 错误响应 {#error-responses}
- `401 Unauthorized`：会话无效或缺失、会话过期，或 CSRF 令牌验证失败
- `403 Forbidden`：CSRF 令牌验证失败或操作不允许

:::caution
 请勿将 **duplistatus** 服务器暴露于公网。请在安全网络中使用
（例如受防火墙保护的本地 LAN）。

在未采取适当安全措施的情况下将 **duplistatus** 界面暴露于公网
可能导致未经授权的访问。
:::
