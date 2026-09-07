# 监控与健康 {/* #monitoring--health */}

## 健康检查 - `/api/health` {/* #health-check---apihealth */}
- **端点**: `/api/health`
- **方法**: GET
- **描述**: 应用程序和 SQLite 连接的低成本存活检查。Docker `HEALTHCHECK` 和入口点等待循环使用此 URL 在本地主机上。
- **响应** (健康):

  ```json
  {
    "status": "healthy",
    "database": "connected",
    "basicConnection": true,
    "initializationStatus": "complete",
    "initializationComplete": true,
    "connectionHealth": true,
    "timestamp": "2024-03-20T10:00:00Z"
  }
  ```

- **响应** (退化):

  ```json
  {
    "status": "degraded",
    "database": "unavailable",
    "basicConnection": false,
    "initializationStatus": "complete",
    "initializationComplete": true,
    "connectionHealth": false,
    "connectionHealthError": "Database connection test failed",
    "timestamp": "2024-03-20T10:00:00Z"
  }
  ```

- **错误响应** (503):

  ```json
  {
    "status": "unhealthy",
    "error": "Database connection failed",
    "message": "Connection timeout",
    "timestamp": "2024-03-20T10:00:00Z"
  }
  ```

- **注意事项**:
  - 当初始化完成且 `SELECT 1` 成功时返回 200
  - 当初始化或连接检查失败时返回 503
  - 不列出表名或运行仪表板查询
  - 永不需要 API 密钥
  - 当启用任一 IP 白名单时，客户端 IP 必须是回环地址或在管理员或外部 CIDR 列表上列出（否则 `403` `IP_NOT_ALLOWED`）
  - 非回环客户端受限速（`429` `PROBE_RATE_LIMITED`，每分钟 30 次和每小时 120 次）。回环（`127.0.0.1`，`::1`）永不受限

## 连接探测 - `/api/ping` {/* #connectivity-probe---apiping */}
- **端点**: `/api/ping`
- **方法**: GET
- **描述**: 仪表板连接检查使用的微小 `{ "ok": true }` 回复（每 30 秒一次）。
- **响应**:

  ```json
  {
    "ok": true
  }
  ```

- **注意事项**:
  - 永不需要 API 密钥或会话 cookie
  - 与 `/api/health` 相同的白名单联合和回环规则
  - 非回环客户端受限速（`429` `PROBE_RATE_LIMITED`，每分钟 60 次和每小时 600 次）
