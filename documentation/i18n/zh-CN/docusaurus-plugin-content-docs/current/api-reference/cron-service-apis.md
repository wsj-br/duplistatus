

# Cron 服务管理 {#cron-service-management}

## 获取 Cron 配置 - `/api/cron-config` {#get-cron-configuration---apicron-config}
- **端点**：`/api/cron-config`
- **方法**：GET
- **描述**：获取当前 Cron 服务配置。
- **认证**：需要有效会话和 CSRF 令牌
- **响应**：
  ```json
  {
    "cronExpression": "*/20 * * * *",
    "enabled": true
  }
  ```
- **错误响应**：
  - `500`：获取 Cron 配置失败
- **说明**：
  - 返回当前 Cron 服务配置
  - 包含 Cron 表达式和启用状态
  - 用于 Cron 服务管理

## 更新 Cron 配置 - `/api/cron-config` {#update-cron-configuration---apicron-config}
- **端点**：`/api/cron-config`
- **方法**：POST
- **描述**：更新 Cron 服务配置。
- **认证**：需要有效会话和 CSRF 令牌
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
- **可用间隔**：`"disabled"`、`"1min"`、`"5min"`、`"10min"`、`"15min"`、`"20min"`、`"30min"`、`"1hour"`、`"2hours"`
- **错误响应**：
  - `400`：缺少 interval 参数
  - `500`：更新 Cron 配置失败
- **说明**：
  - 更新 Cron 服务配置
  - 根据允许的选项验证间隔
  - 影响逾期备份检查频率

## Cron 服务代理 - `/api/cron/*` {#cron-service-proxy---apicron}
- **端点**：`/api/cron/*`
- **方法**：GET、POST
- **描述**：代理请求到 Cron 服务。此端点将所有请求转发到在独立端口上运行的 Cron 服务。
- **认证**：需要有效会话和 CSRF 令牌
- **参数**：
  - `*`：将转发到 Cron 服务的任意路径
- **响应**：取决于所访问的 Cron 服务端点
- **错误响应**（503）：
  ```json
  {
    "error": "Cron service is not running",
    "message": "The cron service is not available. Please start it with: npm run cron:start"
  }
  ```
- **说明**：
  - 代理请求到 Cron 服务
  - Cron 服务不可用时返回 503
  - 支持 GET 和 POST 方法
  - 用于从 Web 界面管理 Cron 服务
