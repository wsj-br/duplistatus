# Cron 服务 {#cron-service}

该应用程序包含一个独立的 cron 服务用于处理计划任务：

## 在开发模式下启动 cron 服务 {#start-cron-service-in-development-mode}

```bash
pnpm cron:dev
```

## 在生产模式下启动 cron 服务 {#start-cron-service-in-production-mode}

```bash
pnpm cron:start
```

## 在本地启动 cron 服务（用于测试） {#start-cron-service-locally-for-testing}

```bash
pnpm cron:start-local
```

cron 服务运行在独立的端口上（开发环境为 8667，生产环境为 9667），并处理诸如逾期备份通知等计划任务。可以使用 `CRON_PORT` 环境变量来配置端口。

cron 服务包括：
- **健康检查端点**: `/health` - 返回服务状态和活动任务
- **手动触发任务**: `POST /trigger/:taskName` - 手动执行计划任务
- **任务管理**: `POST /start/:taskName` 和 `POST /stop/:taskName` - 控制单个任务
- **配置重载**: `POST /reload-config` - 从数据库重新加载配置
- **自动重启**: 如果服务崩溃，它会自动重启（在 Docker 部署中由 `docker-entrypoint.sh` 管理）
- **监听模式**: 开发模式包含文件监听，以便在代码更改时自动重启
- **逾期备份监控**: 自动检查和通知逾期备份（默认每 5 分钟运行一次)
- **审计日志清理**: 自动清理旧的审计日志条目（每天 UTC 时间凌晨 2 点运行）
- **灵活的调度**: 为不同任务配置可自定义的 cron 表达式
- **数据库集成**: 与主应用程序共享同一个 SQLite 数据库
- **RESTful API**: 用于服务管理和监控的完整 API
