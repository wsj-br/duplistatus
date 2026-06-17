

# 监控与健康 {#monitoring-health}

## 健康检查 - `/api/health` {#health-check---apihealth}
- **端点**：`/api/health`
- **方法**：GET
- **描述**：检查应用程序和数据库的健康状态。
- **响应**（健康）：
  ```json
  {
    "status": "healthy",
    "database": "connected",
    "basicConnection": true,
    "tablesFound": 2,
    "tables": [
      "servers",
      "backups"
    ],
    "preparedStatements": true,
    "initializationStatus": "complete",
    "initializationComplete": true,
    "connectionHealth": true,
    "timestamp": "2024-03-20T10:00:00Z"
  }
  ```

- **响应**（降级）：
  ```json
  {
    "status": "degraded",
    "database": "connected",
    "basicConnection": true,
    "tablesFound": 2,
    "tables": [
      "servers",
      "backups"
    ],
    "preparedStatements": false,
    "preparedStatementsError": "Prepared statement error details",
    "initializationStatus": "complete",
    "initializationComplete": true,
    "connectionHealth": false,
    "connectionHealthError": "Connection health check failed",
    "connectionDetails": {
      "additional": "diagnostic information"
    },
    "timestamp": "2024-03-20T10:00:00Z"
  }
  ```

- **错误响应**（503）：
  ```json
  {
    "status": "unhealthy",
    "error": "Database connection failed",
    "message": "Connection timeout",
    "stack": "Error: Connection timeout\n    at...",
    "timestamp": "2024-03-20T10:00:00Z"
  }
  ```
- **说明**：
  - 健康系统返回 200 状态码
  - 不健康系统或预编译语句失败时返回 503 状态码
  - 预编译语句失败时包含 `preparedStatementsError` 字段
  - 数据库初始化失败时包含 `initializationError` 字段
  - 连接健康检查失败时包含 `connectionHealthError` 和 `connectionDetails`
  - 堆栈跟踪仅在开发模式下包含
  - 测试基本数据库连接、预编译语句、初始化状态和连接健康
  - 提供全面的健康诊断以便故障排查
