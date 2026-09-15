# Cron 服务 {/* #cron-service */}

该应用程序包含一个单独的 cron 服务，用于处理计划任务：

## 在开发模式下启动 cron 服务 {/* #start-cron-service-in-development-mode */}

`pnpm dev` 已经启动了 cron 服务，与 Next.js 一起运行。要单独运行 cron（例如在第二个终端中）：

```bash
pnpm cron:dev
```

## 在生产模式下启动 cron 服务 {/* #start-cron-service-in-production-mode */}

```bash
pnpm cron:start
```

## 在本地启动 cron 服务（用于测试） {/* #start-cron-service-locally-for-testing */}

```bash
pnpm cron:start-local
```

cron 服务在单独的端口上运行（开发模式为 8667，生产模式为 9667），并处理计划任务，如过期备份通知。可以使用 `CRON_PORT` 环境变量配置端口。

cron 服务包括：
- **健康检查端点**：`/health` - 返回服务状态和活动任务
- **手动任务触发**：`POST /trigger/:taskName` - 手动执行计划任务。此路由上会拒绝 `daily-summary-dispatch` 任务；请改用 设置 → 每日摘要 **立即发送摘要** 代替
- **任务管理**：`POST /start/:taskName` 和 `POST /stop/:taskName` - 控制单个任务
- **配置重新加载**：`POST /reload-config` - 从数据库重新加载配置
- **自动重启**：如果服务崩溃，服务会自动重启（由 Docker 部署中的 `docker-entrypoint.sh` 管理）
- **监视模式**：开发模式包括文件监视，代码更改时自动重启
- **过期备份监控**：自动检查和通知过期备份（默认每 5 分钟运行一次）
- **每日摘要分发**：每天在存储的每日摘要 UTC 时间发送当前状态快照（`minute hour * * *`）。新安装的默认时间为 01:00 UTC。更改发送时间会重新加载此计划。如果每日摘要已启用，任务会发送，但不会重新检查时钟。
- **审计日志清理**：自动清理旧审计日志条目（默认每天 2 点 UTC 运行）
- **数据库压缩**：每周日 04:00 UTC。删除服务器不再存在的备份行，没有剩余备份的服务器行，残留的 `backup_settings` 和 `overdue_notifications` 键，修剪旧的每日摘要交付行，并运行 SQLite `VACUUM`
- **Duplicati 版本刷新**：从 GitHub Releases 更新缓存的最新 Duplicati 频道版本。默认每天 3 点 UTC；管理员可以在 [设置 → Duplicati 版本](../user-guide/settings/duplicati-versions.md) 中更改间隔和开始时间。
- **灵活调度**：不同任务的可配置 cron 表达式
- **数据库集成**：与主应用程序共享相同的 SQLite 数据库
- **RESTful API**：用于服务管理和监控的完整 API
- **本地绑定**：默认监听 `127.0.0.1`（`CRON_BIND_HOST`）。非回环绑定需要 `CRON_SERVICE_SECRET`
