
# Cron 服务 {#cron-service}

应用程序包含独立的 cron 服务，用于处理计划任务：

## 以开发模式启动 cron 服务 {#start-cron-service-in-development-mode}

```bash
pnpm cron:dev
```

## 以生产模式启动 cron 服务 {#start-cron-service-in-production-mode}

```bash
pnpm cron:start
```

## 在本地启动 cron 服务（用于测试） {#start-cron-service-locally-for-testing}

```bash
pnpm cron:start-local
```

cron 服务在独立端口上运行（开发 8667，生产 9667），处理逾期备份通知等计划任务。端口可使用 `CRON_PORT` 环境变量配置。

cron 服务包括：
- **健康检查端点**：`/health` - 返回服务状态和活动任务
- **手动任务触发**：`POST /trigger/:taskName` - 手动执行计划任务
- **任务管理**：`POST /start/:taskName` 和 `POST /stop/:taskName` - 控制单个任务
- **配置重载**：`POST /reload-config` - 从数据库重载配置
- **自动重启**：服务崩溃时自动重启（在 Docker 部署中由 `docker-entrypoint.sh` 管理）
- **监视模式**：开发模式包含文件监视，代码更改时自动重启
- **逾期备份监控**：自动检查和通知逾期备份（默认每 5 分钟运行一次）
- **审计日志清理**：自动清理旧审计日志条目（每天 UTC 2:00 运行）
- **灵活调度**：不同任务的可配置 cron 表达式
- **数据库集成**：与主应用程序共享同一 SQLite 数据库
- **RESTful API**：完整的服务管理和监控 API
