# 测试脚本 {#test-scripts}

该项目包括几个测试脚本，以帮助开发和测试：

> [!NOTE]
> 已删除遗留的仓库根 `pnpm` 辅助工具，用于过期调试、SMTP 矩阵测试和 cron 端口检查。请使用应用程序 UI (**设置 → 备份监控**)、经过身份验证的 HTTP API 和 `curl` 对 cron 服务，如下所述。

## 生成测试数据 {#generate-test-data}

```bash
pnpm generate-test-data --servers=N
```

此脚本为多个服务器和备份生成测试备份数据。

参数 `--servers=N` 是 **必需的**，指定要生成的服务器数量（1-30）。

使用选项 `--upload` 将生成的数据发送到 `/api/upload`

```bash
pnpm generate-test-data --servers=N --upload
```

**示例：**

```bash
# Generate data for 5 servers
pnpm generate-test-data --servers=5

# Generate data for 1 server with upload mode
pnpm generate-test-data --upload --servers=1

# Generate data for all 30 servers
pnpm generate-test-data --servers=30
```

>[!CAUTION]
> 此脚本将删除数据库中的所有以前数据，并用测试数据替换它。
> 在运行此脚本之前，请备份您的数据库。

## 过期检查和 cron 连接性（开发） {#overdue-checks-and-cron-connectivity-development}

### 运行过期备份检查 {#run-an-overdue-backup-check}

在应用程序运行时：

- **UI（推荐）：** 打开 **设置 → 备份监控** 并使用 **测试过期备份**。这将运行与通过身份验证的 `POST /api/notifications/check-overdue` 调度作业相同的逻辑。

### Cron 服务健康状况 {#cron-service-health}

```bash
curl http://localhost:8667/health
curl http://localhost:8666/api/cron/health
```

### 模拟特定日期或时间 {#simulating-a-specific-date-or-time}

没有捆绑的 CLI 用于注入模拟的“当前”时间。有关算法和手动测试想法，请参阅存储库文件 `dev/OVERDUE_DETECTION_ALGORITHM.md` 和 `src/lib/overdue-backup-checker.ts` 中的实现。

## 验证 CSV 导出 {#validate-csv-export}

```bash
pnpm validate-csv-export
```

此脚本验证 CSV 导出功能。它：
- 测试 CSV 导出生成
- 验证数据格式和结构
- 检查导出的文件中的数据完整性

在发布前确保 CSV 导出正确工作很有用。

## 暂时阻止 NTFY 服务器（用于测试） {#temporarily-block-ntfy-server-for-testing}

```bash
sudo ./scripts/temporary_ntfy.sh_block.sh
```

此脚本暂时阻止向 NTFY 服务器 (`ntfy.sh`) 发送网络请求，以测试通知重试机制。它：
- 解析 NTFY 服务器的 IP 地址
- 添加 iptables 规则以阻止发送流量
- 阻止 10 秒（可配置）
- 自动在退出时删除阻止规则
- 需要 root 权限（sudo）

>[!CAUTION]
> 此脚本修改 iptables 规则，需要 root 权限。仅用于测试通知重试机制。

## 数据库迁移测试 {#database-migration-testing}

该项目包括用于测试从旧版本到当前版本的数据库迁移的脚本。这些脚本确保数据库迁移正确工作并保留数据完整性。

### 生成迁移测试数据 {#generate-migration-test-data}

```bash
./scripts/generate-migration-test-data.sh
```

此脚本为多个历史版本的应用程序生成测试数据库。它：

1. **停止并删除**任何现有的 Docker 容器
2. **对于每个版本**（v0.4.0、v0.5.0、v0.6.1、0.7.27、0.8.21）:
   - 删除现有的数据库文件
   - 创建版本标签文件
   - 启动具有特定版本的 Docker 容器
   - 等待容器准备就绪
   - 使用 `pnpm generate-test-data` 生成测试数据
   - 截取 UI 中的测试数据屏幕截图
   - 停止并删除容器
   - 刷新 WAL 文件并保存数据库模式
   - 将数据库文件复制到 `scripts/migration_test_data/`

**要求:**
- 必须已安装并配置好 Docker
- 必须已安装 Chromium (通过 Playwright)
- Docker 操作需要 root/sudo 权限
- 必须存在 Docker 卷 `duplistatus_data`

**输出：**
- 数据库文件：`scripts/migration_test_data/backups_<VERSION>.db`
- 模式文件：`scripts/migration_test_data/backups_<VERSION>.schema`
- 屏幕截图：`scripts/migration_test_data/duplistatus_test_data_<VERSION>.png`

**配置：**
- 服务器数量：通过 `SERVERS` 变量设置（默认：3）
- 数据目录：`/var/lib/docker/volumes/duplistatus_data/_data`
- 端口：9666（Docker 容器端口）

>[!CAUTION]
> 此脚本需要 Docker，并且会停止/移除现有的容器。它还需要 sudo 权限才能执行 Docker 操作和访问文件系统。如果尚未安装 Playwright Chromium 浏览器，请先运行 `pnpm take-screenshots:install` 进行安装。

>[!IMPORTANT]
> 此脚本只需运行一次，因为新版本的开发人员可以直接将数据库文件和屏幕截图复制到 `scripts/migration_test_data/` 目录。在开发过程中，只需运行 `./scripts/test-migrations.sh` 脚本来测试迁移。

### 测试数据库迁移 {#test-database-migrations}

```bash
./scripts/test-migrations.sh
```

此脚本测试从旧版本到当前版本（4.0）的数据库迁移。它：

1. **对于每个版本**（v0.4.0、v0.5.0、v0.6.1、0.7.27、0.8.21）:
   - 创建测试数据库的临时副本
   - 使用 `test-migration.ts` 运行迁移过程
   - 验证迁移后的数据库结构
   - 检查所需的表和列
   - 验证数据库版本为 4.0
   - 清理临时文件

**要求：**
- 测试数据库必须存在于 `scripts/migration_test_data/`
- 通过运行 `generate-migration-test-data.sh` 生成

**输出：**
- 彩色编码的测试结果（绿色表示通过，红色表示失败）
- 通过和失败的版本摘要
- 失败的迁移的详细错误消息
- 退出代码 0 如果所有测试通过，1 如果任何测试失败

**它验证：**
- 迁移后数据库版本为 4.0
- 所有必需的表存在： `servers`，`backups`，`configurations`，`users`，`sessions`，`audit_log`，`db_version`
- 每个表中存在必需的列
- 数据库结构正确

**示例输出：**

```
==========================================
Database Migration Test Suite
==========================================

Testing migrations from old versions to version 4.0
Test data directory: /path/to/migration_test_data
Temporary directory: /path/to/migration_test_data/.tmp

----------------------------------------
Testing version: v0.4.0
----------------------------------------
  Copying database file to temporary location...
  Running migration test...
✅ Version v0.4.0: Migration test PASSED

==========================================
Test Summary
==========================================

✅ Passed versions (5):
  ✓ v0.4.0
  ✓ v0.5.0
  ✓ v0.6.1
  ✓ 0.7.27
  ✓ 0.8.21

All migration tests passed!
```

**使用方法：**

```bash
# Run all migration tests
./scripts/test-migrations.sh

# Check exit code
echo $?  # 0 = all passed, 1 = some failed
```

>[!NOTE]
> 此脚本在内部使用 TypeScript 迁移测试脚本（`test-migration.ts`）。测试脚本在迁移后验证数据库结构并确保数据完整性。

## SMTP 和电子邮件（开发） {#smtp-and-email-development}

在 **设置 → 电子邮件** 下配置 SMTP，并使用应用程序内的电子邮件测试和通知流程。以前的 `pnpm set-smtp-test-config` 和 `pnpm test-smtp-connections` 帮助脚本已从存储库中删除。

## 测试 Docker 入口点脚本 {#test-docker-entrypoint-script}

```bash
pnpm test-entrypoint
```

此脚本为本地开发提供了 `docker-entrypoint.sh` 的测试包装器。它设置环境以测试入口点日志记录功能，并确保日志写入 `data/logs/`，以便应用程序可以访问它们。

**它做什么：**

1. **始终构建新版本**：自动运行 `pnpm build-local` 创建新构建（无需手动构建）
2. **构建 cron 服务**：确保 cron 服务已构建（`dist/cron-service.cjs`）
3. **设置 Docker 类结构**：创建必要的符号链接和目录结构以模拟 Docker 环境
4. **运行入口点脚本**：使用适当的环境变量执行 `docker-entrypoint.sh`
5. **清理**：自动在退出时删除临时文件

**使用方法：**

```bash
# Run the test (builds fresh version automatically)
pnpm test-entrypoint
```

**环境变量：**
- `PORT=8666` - Next.js 服务器的端口（与 `start-local` 匹配）
- `CRON_PORT=8667` - cron 服务的端口
- `VERSION` - 自动设置为 `test-YYYYMMDD-HHMMSS` 格式

**输出：**
- 日志写入 `data/logs/application.log`（应用程序可访问）
- 控制台输出显示入口点脚本执行
- 按 Ctrl+C 停止并测试日志刷新

**要求：**
- 脚本必须从存储库根目录运行（pnpm 自动处理此操作）
- 脚本自动处理所有先决条件（构建、cron 服务等）

**用例：**
- 在 Docker 部署之前在本地测试入口点脚本更改
- 验证日志轮换和日志记录功能
- 测试正常关闭和信号处理
- 在本地环境中调试入口脚本行为
