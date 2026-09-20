# 会话管理 {/* #session-management */}

## 创建会话 - `/api/session` {/* #create-session---apisession */}
- **端点**: `/api/session`
- **方法**: POST
- **描述**: 为用户创建新会话。
- **响应**：

  ```json
  {
    "sessionId": "session-id-string",
    "message": "Session created successfully"
  }
  ```

- **错误响应**:
  - `500`: 创建会话失败
- **备注**:
  - 创建具有 24 小时过期时间的新会话
  - 设置仅 HTTP 的会话 Cookie
  - 访问受保护端点的必需项

## 验证会话 - `/api/session` {/* #validate-session---apisession */}
- **端点**: `/api/session`
- **方法**: GET
- **描述**: 验证现有会话。
- **响应** (有效):

  ```json
  {
    "valid": true,
    "sessionId": "session-id-string"
  }
  ```

- **响应** (无效):

  ```json
  {
    "valid": false,
    "error": "No session cookie"
  }
  ```

- **错误响应**:
  - `401`: 没有会话 Cookie 或会话 ID
  - `500`: 会话验证失败
- **备注**:
  - 检查会话 Cookie 是否存在且有效
  - 如果有效则返回会话 ID

## 删除会话 - `/api/session` {/* #delete-session---apisession */}
- **端点**: `/api/session`
- **方法**: DELETE
- **描述**: 删除当前会话（登出）。
- **响应**：

  ```json
  {
    "message": "Session deleted successfully"
  }
  ```

- **错误响应**:
  - `500`: 删除会话失败
- **备注**:
  - 从服务器和客户端清除会话
  - 移除会话 Cookie

## 获取 CSRF 令牌 - `/api/csrf` {/* #get-csrf-token---apicsrf */}
- **端点**: `/api/csrf`
- **方法**: GET
- **描述**: 为当前会话生成 CSRF 令牌。
- **响应**：

  ```json
  {
    "csrfToken": "csrf-token-string",
    "message": "CSRF token generated successfully"
  }
  ```

- **错误响应**:
  - `401`: 未找到会话或会话无效/已过期
  - `500`: 生成 CSRF 令牌失败
- **备注**:
  - 需要有效会话
  - 所有状态更改操作都需要 CSRF 令牌
  - 令牌与当前会话关联
