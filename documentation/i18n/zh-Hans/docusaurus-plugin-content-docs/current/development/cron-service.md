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
- **手动任务触发**: `POST /trigger/:taskName` - 手动执行计划任务。此路由上拒绝 `daily-summary-dispatch` 任务；请改用 设置 → 每日摘要 **立即发送摘要**
- **任务管理**: `POST /start/:taskName` 和 `POST /stop/:taskName` - 控制单个任务
- **配置重载**: `POST /reload-config` - 从数据库重载配置
- **自动重启**: 服务自动重启如果它崩溃（在 Docker 部署中由 `docker-entrypoint.sh` 管理）
- **监视模式**: 开发模式包括文件监视以在代码更改时自动重启
- **逾期备份监控**: 自动检查和通知逾期备份（默认每 5 分钟运行一次）
- **每日摘要发送**: 每分钟在 UTC 时间评估已保存的每日摘要计划，并在到期时发送当前状态快照
- **审计日志清理**: 自动清理旧的审计日志条目（每天 UTC 时间 2 点运行）
- **Duplicati 版本刷新**: 从 GitHub Releases 更新缓存的最新 Duplicati 频道版本。默认每天 UTC 时间 3 点；管理员可以在 [设置 → Duplicati 版本](../user-guide/settings/duplicati-versions.md) 中更改间隔和开始时间
- **灵活调度**: 不同任务的可配置 cron 表达式
- **数据库集成**: 与主应用程序共享同一 SQLite 数据库
- **RESTful API**: 完整的 API 用于服务管理和监控
- **本地绑定**: 默认在 `127.0.0.1` 上监听（`CRON_BIND_HOST`）。非回环绑定需要 `CRON_SERVICE_SECRET`
