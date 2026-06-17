

# 会话管理 {#session-management}

## 创建会话 - `/api/session` {#create-session---apisession}
- **端点**：`/api/session`
- **方法**：POST
- **描述**：为用户创建新会话。
- **响应**：
  ```json
  {
    "sessionId": "session-id-string",
    "message": "Session created successfully"
  }
  ```
- **错误响应**：
  - `500`：创建会话失败
- **说明**：
  - 创建有效期为 24 小时的新会话
  - 设置 HTTP-only 会话 Cookie
  - 访问受保护端点所必需

## 验证会话 - `/api/session` {#validate-session---apisession}
- **端点**：`/api/session`
- **方法**：GET
- **描述**：验证现有会话。
- **响应**（有效）：
  ```json
  {
    "valid": true,
    "sessionId": "session-id-string"
  }
  ```
- **响应**（无效）：
  ```json
  {
    "valid": false,
    "error": "No session cookie"
  }
  ```
- **错误响应**：
  - `401`：无会话 Cookie 或会话 ID
  - `500`：验证会话失败
- **说明**：
  - 检查会话 Cookie 是否存在且有效
  - 有效时返回会话 ID

## 删除会话 - `/api/session` {#delete-session---apisession}
- **端点**：`/api/session`
- **方法**：DELETE
- **描述**：删除当前会话（登出）。
- **响应**：
  ```json
  {
    "message": "Session deleted successfully"
  }
  ```
- **错误响应**：
  - `500`：删除会话失败
- **说明**：
  - 清除服务器端和客户端的会话
  - 移除会话 Cookie

## 获取 CSRF 令牌 - `/api/csrf` {#get-csrf-token---apicsrf}
- **端点**：`/api/csrf`
- **方法**：GET
- **描述**：为当前会话生成 CSRF 令牌。
- **响应**：
  ```json
  {
    "csrfToken": "csrf-token-string",
    "message": "CSRF token generated successfully"
  }
  ```
- **错误响应**：
  - `401`：未找到会话或会话无效/已过期
  - `500`：生成 CSRF 令牌失败
- **说明**：
  - 需要有效会话
  - 所有状态变更操作都需要 CSRF 令牌
  - 令牌与当前会话绑定
