# Cron 服务管理 {/* #cron-service-management */}

## 获取 Cron 配置 - `/api/cron-config` {/* #get-cron-configuration---apicron-config */}
- **端点**: `/api/cron-config`
- **方法**: GET
- **描述**: 检索当前的 cron 服务配置。
- **认证**: 需要有效会话和CSRF令牌
- **响应**:

  ```json
  {
    "cronExpression": "*/20 * * * *",
    "enabled": true
  }
  ```

- **错误响应**:
  - `500`: 获取 cron 配置失败
- **注意事项**:
  - 返回当前的 cron 服务配置
  - 包括 cron 表达式和启用状态
  - 用于 cron 服务管理

## 更新 Cron 配置 - `/api/cron-config` {/* #update-cron-configuration---apicron-config */}
- **端点**: `/api/cron-config`
- **方法**: POST
- **描述**: 更新 cron 服务配置。
- **认证**: 需要有效的会话和CSRF令牌
- **请求正文**:

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
  - `400`: 需要间隔
  - `500`: 更新 cron 配置失败
- **注意事项**:
  - 更新 cron 服务配置
  - 验证间隔是否符合允许的选项
  - 影响过期备份检查频率

## Cron 服务代理 - `/api/cron/*` {/* #cron-service-proxy---apicron */}
- **端点**: `/api/cron/*`
- **方法**: GET, POST
- **描述**: 将请求代理到 cron 服务。此端点将所有请求转发到在单独端口上运行的 cron 服务。
- **认证**: 需要有效的会话和 CSRF 令牌。GET 允许经过身份验证的用户；POST（启动/停止/触发/重新加载）需要管理员。
- **参数**:
  - `*`: 将转发到 cron 服务的任何路径
- **响应**: 取决于正在访问的 cron 服务端点
- **错误响应** (503):

  ```json
  {
    "error": "Cron service is not running",
    "message": "The cron service is not available. Please start it with: npm run cron:start"
  }
  ```

- **注意事项**:
  - 将请求代理到 `127.0.0.1` 上的 cron 服务
  - 当设置时，将 `CRON_SERVICE_SECRET` 转发为 `X-Cron-Service-Secret`
  - 如果 cron 服务不可用，则返回 503
  - 支持 GET 和 POST 方法
  - 用于从网络界面管理 cron 服务
  - `POST /trigger/daily-summary-dispatch` 被 cron 服务拒绝；请改用 `/api/configuration/daily-summary/send`
  - `POST /trigger/database-compact` 立即运行每周压缩（孤立备份/服务器和通知设置，以及 SQLite `VACUUM`）
