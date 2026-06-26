# Cron 服务 {#cron-service}

该应用程序包括一个单独的 cron 服务用于处理定时任务：

## 在开发模式下启动 cron 服务 {#start-cron-service-in-development-mode}

```bash
pnpm cron:dev
```

## 在生产模式下启动 cron 服务 {#start-cron-service-in-production-mode}

```bash
pnpm cron:start
```

## 本地启动 cron 服务（用于测试） {#start-cron-service-locally-for-testing}

```bash
pnpm cron:start-local
```

cron 服务运行在一个单独的端口（开发模式下为 8667，生产模式下为 9667）并处理定时任务，如逾期备份通知。端口可以使用 `CRON_PORT` 环境变量进行配置。

cron 服务包括：
- **健康检查端点**: `/health` - 返回服务状态和活动任务
- **手动任务触发**: `POST /trigger/:taskName` - 手动执行定时任务
- **任务管理**: `POST /start/:taskName` 和 `POST /stop/:taskName` - 控制个别任务
- **配置重载**: `POST /reload-config` - 从数据库重载配置
- **自动重启**: 服务自动重启如果它崩溃（在 Docker 部署中由 `docker-entrypoint.sh` 管理）
- **监视模式**: 开发模式包括文件监视以在代码更改时自动重启
- **逾期备份监控**: 自动检查和通知逾期备份（默认每 5 分钟运行一次）
- **审计日志清理**: 自动清理旧审计日志条目（默认每天 2 点 UTC 运行）
- **灵活调度**: 可配置的 cron 表达式用于不同的任务
- **数据库集成**: 与主应用程序共享相同的 SQLite 数据库
- **RESTful API**: 完整的 API 用于服务管理和监控
