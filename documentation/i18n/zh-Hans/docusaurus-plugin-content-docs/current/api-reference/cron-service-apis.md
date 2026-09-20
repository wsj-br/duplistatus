# 定时任务服务管理 {/* #cron-service-management */}

## 获取定时任务配置 - `/api/cron-config` {/* #get-cron-configuration---apicron-config */}
- **端点**: `/api/cron-config`
- **方法**: GET
- **描述**: 获取当前的定时任务服务配置。
- **身份验证**：需要有效的会话和 CSRF 令牌
- **响应**：

  ```json
  {
    "cronExpression": "*/20 * * * *",
    "enabled": true
  }
  ```

- **错误响应**:
  - `500`: 获取定时任务配置失败
- **备注**:
  - 返回当前定时任务服务配置
  - 包含定时表达式和启用状态
  - 用于定时任务服务管理

## 更新定时任务配置 - `/api/cron-config` {/* #update-cron-configuration---apicron-config */}
- **端点**: `/api/cron-config`
- **方法**: POST
- **描述**: 更新定时任务服务配置。
- **认证**：需要有效的会话和 CSRF 令牌
- **请求体**：

  ```json
  {
    "interval": "20min"
  }
  ```

- **响应**：

  ```json
  {
    "success": true
  }
  ```

- **可用间隔**: `"disabled"`, `"1min"`, `"5min"`, `"10min"`, `"15min"`, `"20min"`, `"30min"`, `"1hour"`, `"2hours"`
- **错误响应**:
  - `400`: 间隔是必需的
  - `500`: 更新定时任务配置失败
- **备注**:
  - 更新定时任务服务配置
  - 验证间隔是否符合允许的选项
  - 影响过期备份检查频率

## 定时任务服务代理 - `/api/cron/*` {/* #cron-service-proxy---apicron */}
- **端点**: `/api/cron/*`
- **方法**: GET, POST
- **描述**: 将请求代理到定时任务服务。此端点将所有请求转发到在单独端口上运行的定时任务服务。
- **身份验证**: 需要有效的会话和CSRF令牌。GET允许已认证用户访问；POST（启动/停止/触发/重载）需要管理员权限。
- **参数**:
  - `*`: 任何将被转发到定时任务服务的路径
- **响应**: 取决于正在访问的定时任务服务端点
- **错误响应** (503):

  ```json
  {
    "error": "Cron service is not running",
    "message": "The cron service is not available. Please start it with: npm run cron:start"
  }
  ```

- **备注**:
  - 将请求代理到 `127.0.0.1` 上的定时任务服务
  - 当设置时将 `CRON_SERVICE_SECRET` 转发为 `X-Cron-Service-Secret`
  - 如果定时任务服务不可用则返回503
  - 支持GET和POST方法
  - 用于从Web界面进行定时任务服务管理
  - `POST /trigger/daily-summary-dispatch` 被定时任务服务拒绝；请改用 `/api/configuration/daily-summary/send`
  - `POST /trigger/database-compact` 立即运行每周压缩（孤立备份/服务器和通知设置，以及SQLite `VACUUM`）
