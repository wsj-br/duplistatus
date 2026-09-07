# Cron 服务管理 {/* #cron-service-management */}

## 获取 Cron 配置 - `/api/cron-config` {/* #get-cron-configuration---apicron-config */}
- **端点**: `/api/cron-config`
- **方法**: GET
- **描述**: 检索当前的 cron 服务配置。
- **身份验证**: 需要有效的会话和 CSRF 令牌
- **响应**:

  ```json
  {
    "cronExpression": "*/20 * * * *",
    "enabled": true
  }
  ```

- **错误响应**:
  - `500`: 获取计时配置失败
- **备注**:
  - 返回当前的计时服务配置
  - 包括计时表达式和启用状态
  - 用于计时服务管理

## 更新 Cron 配置 - `/api/cron-config` {/* #update-cron-configuration---apicron-config */}
- **端点**: `/api/cron-config`
- **方法**: POST
- **描述**: 更新 cron 服务配置。
- **身份验证**: 需要有效的会话和 CSRF 令牌
- **请求体**:

  ```json
  {
    "interval": "20min"
  }
  ```

- **响应**:

  ```json
  {
    "success": true
  }
  ```

- **可用间隔**: `"disabled"`, `"1min"`, `"5min"`, `"10min"`, `"15min"`, `"20min"`, `"30min"`, `"1hour"`, `"2hours"`
- **错误响应**:
  - `400`: 间隔是必需的
  - `500`: 更新计时配置失败
- **备注**:
  - 更新计时服务配置
  - 验证间隔对允许的选项
  - 影响逾期备份检查频率

## Cron 服务代理 - `/api/cron/*` {/* #cron-service-proxy---apicron */}
- **端点**: `/api/cron/*`
- **方法**: GET, POST
- **描述**: 将请求代理到 cron 服务。此端点将所有请求转发到运行在单独端口上的 cron 服务。
- **认证**：需要有效的会话和CSRF令牌。GET允许经过身份验证的用户；POST（启动/停止/触发/重新加载）需要管理员。
- **参数**：
  - `*`：将被转发到cron服务的任何路径
- **响应**：取决于正在访问的cron服务端点
- **错误响应** (503):

  ```json
  {
    "error": "Cron service is not running",
    "message": "The cron service is not available. Please start it with: npm run cron:start"
  }
  ```

- **注意事项**：
  - 将请求代理到`127.0.0.1`上的cron服务
  - 当设置时，将`CRON_SERVICE_SECRET`转发为`X-Cron-Service-Secret`
  - 如果cron服务不可用，则返回503
  - 支持 GET 和 POST 方法
  - 用于从网页界面管理 cron 服务
  - cron 服务拒绝 `POST /trigger/daily-summary-dispatch`；请改用 `/api/configuration/daily-summary/send`
  - `POST /trigger/database-compact` 立即运行每周压缩（孤立备份/服务器和通知设置，以及 SQLite `VACUUM`）
