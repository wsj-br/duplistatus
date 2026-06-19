# Cron 服务管理 {#cron-service-management}

## 获取 Cron 配置 - `/api/cron-config` {#get-cron-configuration---apicron-config}
- **端点**: `/api/cron-config`
- **方法**: GET
- **描述**: 检索当前 cron 服务配置。
- **身份验证**: 需要有效的会话和 CSRF 令牌
- **响应**:

  ```json
  {
    "cronExpression": "*/20 * * * *",
    "enabled": true
  }
  ```

- **错误响应**:
  - `500`: 获取 cron 配置失败
- **备注**:
  - 返回当前 cron 服务配置
  - 包含 cron 表达式和已启用状态
  - 用于 cron 服务管理

## 更新 Cron 配置 - `/api/cron-config` {#update-cron-configuration---apicron-config}
- **端点**: `/api/cron-config`
- **方法**: POST
- **描述**: 更新 cron 服务配置。
- **身份验证**: 需要有效的会话和 CSRF 令牌
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
  - `400`: 必须提供间隔
  - `500`: 更新 cron 配置失败
- **备注**:
  - 更新 cron 服务配置
  - 根据允许的选项验证间隔
  - 影响逾期备份检查频率

## Cron 服务代理 - `/api/cron/*` {#cron-service-proxy---apicron}
- **端点**: `/api/cron/*`
- **方法**: GET, POST
- **描述**: 将请求代理到 cron 服务。此端点将所有请求转发到运行在独立端口上的 cron 服务。
- **身份验证**: 需要有效的会话和 CSRF 令牌
- **参数**:
  - `*`: 将转发到 cron 服务的任何路径
- **响应**: 取决于所访问的 cron 服务端点
- **错误响应** (503):

  ```json
  {
    "error": "Cron service is not running",
    "message": "The cron service is not available. Please start it with: npm run cron:start"
  }
  ```

- **备注**:
  - 将请求代理到 cron 服务
  - 如果 cron 服务不可用，则返回 503
  - 支持 GET 和 POST 方法
  - 用于从 Web 界面进行 cron 服务管理
