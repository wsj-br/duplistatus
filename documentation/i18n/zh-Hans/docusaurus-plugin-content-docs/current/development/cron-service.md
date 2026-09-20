# Cron 服务 {/* #cron-service */}

应用程序包含一个独立的 cron 服务来处理计划任务：

## 在开发模式下启动 cron 服务 {/* #start-cron-service-in-development-mode */}

`pnpm dev` 已经在 Next.js 旁边启动了 cron 服务。要单独运行 cron（例如在第二个终端中）：

```bash
pnpm cron:dev
```

## 在生产模式下启动 cron 服务 {/* #start-cron-service-in-production-mode */}

```bash
pnpm cron:start
```

## 本地启动 cron 服务（用于测试） {/* #start-cron-service-locally-for-testing */}

```bash
pnpm cron:start-local
```

cron 服务在单独的端口上运行（开发环境中为 8667，生产环境中为 9667），并处理计划任务，如过期备份通知。端口可以使用 `CRON_PORT` 环境变量进行配置。

cron 服务包括：
- **健康检查端点**：`/health` - 返回服务状态和活动任务
- **手动触发任务**：`POST /trigger/:taskName` - 手动执行计划任务。此路由拒绝 `daily-summary-dispatch` 任务；请改用设置 → 每日摘要 **立即发送摘要**
- **任务管理**：`POST /start/:taskName` 和 `POST /stop/:taskName` - 控制单个任务
- **配置重载**：`POST /reload-config` - 从数据库重新加载配置
- **自动重启**：如果服务崩溃，服务会自动重启（在 Docker 部署中由 `docker-entrypoint.sh` 管理）
- **监视模式**：开发模式包含文件监视，以便在代码更改时自动重启
- **过期备份监控**：自动检查和通知过期备份（默认每 5 分钟运行一次）
- **每日摘要发送**：在存储的每日摘要 UTC 时间（`minute hour * * *`）每天发送一次当前状态快照。新安装的默认时间为 01:00 UTC。更改发送时间会重新加载此计划。如果启用了每日摘要，任务会发送，但不会重新检查时钟。
- **审计日志清理**：自动清理旧的审计日志条目（每天凌晨 2 点 UTC 运行）
- **数据库压缩**：每周日 04:00 UTC。删除服务器不再存在的备份行、没有剩余备份的服务器行、剩余的 `backup_settings` 和 `overdue_notifications` 键、修剪旧的每日摘要传递行，并运行 SQLite `VACUUM`
- **Duplicati 版本刷新**：从 GitHub Releases 更新缓存的最新 Duplicati 通道版本。默认为每天凌晨 3 点 UTC；管理员可以在[设置 → Duplicati 版本](../user-guide/settings/duplicati-versions.md)中更改间隔和开始时间。
- **灵活调度**：可配置不同任务的 cron 表达式
- **数据库集成**：与主应用程序共享同一个 SQLite 数据库
- **RESTful API**：完整的服务管理和监控 API
- **本地绑定**：默认监听 `127.0.0.1`（`CRON_BIND_HOST`）。非环回绑定需要 `CRON_SERVICE_SECRET`
