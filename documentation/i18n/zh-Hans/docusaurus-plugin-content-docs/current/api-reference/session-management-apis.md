# 会话管理 {/* #session-management */}

## 创建会话 - `/api/session` {/* #create-session---apisession */}
- **端点**: `/api/session`
- **方法**: POST
- **描述**: 为用户创建一个新的会话。
- **响应**:

  ```json
  {
    "sessionId": "session-id-string",
    "message": "Session created successfully"
  }
  ```

- **错误响应**:
  - `500`: 创建会话失败
- **备注**:
  - 创建一个24小时过期的新会话
  - 设置HTTP-only会话cookie
  - 访问受保护端点所必需

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
  - `401`: 没有会话cookie或会话ID
  - `500`: 验证会话失败
- **备注**:
  - 检查会话cookie是否存在且有效
  - 如果有效，返回会话ID

## 删除会话 - `/api/session` {/* #delete-session---apisession */}
- **端点**: `/api/session`
- **方法**: DELETE
- **描述**: 删除当前会话（注销）。
- **响应**:

  ```json
  {
    "message": "Session deleted successfully"
  }
  ```

- **错误响应**:
  - `500`: 删除会话失败
- **备注**:
  - 从服务器和客户端清除会话
  - 移除会话cookie

## 获取CSRF令牌 - `/api/csrf` {/* #get-csrf-token---apicsrf */}
- **端点**: `/api/csrf`
- **方法**: GET
- **描述**: 为当前会话生成CSRF令牌。
- **响应**:

  ```json
  {
    "csrfToken": "csrf-token-string",
    "message": "CSRF token generated successfully"
  }
  ```

- **错误响应**:
  - `401`: 找不到会话或无效/过期的会话
  - `500`: 生成CSRF令牌失败
- **备注**:
  - 需要有效的会话
  - CSRF令牌是所有状态改变操作所必需的
  - 令牌与当前会话相关联
