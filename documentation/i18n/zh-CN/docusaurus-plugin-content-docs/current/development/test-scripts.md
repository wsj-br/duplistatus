# 测试脚本 {#test-scripts}

该项目包含多个测试脚本，用于辅助开发和测试：

> [!NOTE]
> 移除了用于逾期调试、SMTP 矩阵测试和 cron 端口检查的旧版仓库根目录 `pnpm` 辅助工具。请使用应用程序 UI (**设置 → 备份监控**)、经过身份验证的 HTTP API 以及如下文所述针对 cron 服务的 `curl`。

## 生成测试数据 {#generate-test-data}

```bash
pnpm generate-test-data --servers=N
```

此脚本为多个服务器和备份生成测试备份数据。

`--servers=N` 参数是**强制性**的，用于指定要生成的服务器数量 (1-30)。

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
> 此脚本将删除数据库中所有之前的数据，并将其替换为测试数据。
> 在运行此脚本之前，请备份您的数据库。

## 逾期检查和 cron 连接性（开发） {#overdue-checks-and-cron-connectivity-development}

### 运行逾期备份检查 {#run-an-overdue-backup-check}

在应用程序运行时：

- **UI（推荐）：** 打开 **设置 → 备份监控** 并使用 **测试逾期备份**。该操作通过经过身份验证的 `POST /api/notifications/check-overdue` 运行与计划任务相同的逻辑。

### Cron 服务健康状况 {#cron-service-health}

```bash
curl http://localhost:8667/health
curl http://localhost:8666/api/cron/health
```

### 模拟特定日期或时间 {#simulating-a-specific-date-or-time}

没有捆绑用于注入模拟“当前”时间的 CLI。有关算法和手动测试思路，请参阅仓库文件 `dev/OVERDUE_DETECTION_ALGORITHM.md` 和 `src/lib/overdue-backup-checker.ts` 中的实现。

## 验证 CSV 导出 {#validate-csv-export}

```bash
pnpm validate-csv-export
```

此脚本验证 CSV 导出功能。它将：
- 测试 CSV 导出生成
- 验证数据格式和结构
- 检查导出文件中的数据完整性

用于在发布前确保 CSV 导出功能正常工作。

## 临时屏蔽 NTFY 服务器（用于测试） {#temporarily-block-ntfy-server-for-testing}

```bash
sudo ./scripts/temporary_ntfy.sh_block.sh
```

此脚本暂时拦截发往 NTFY 服务器 (`ntfy.sh`) 的出站网络访问，以测试通知重试机制。它将：
- 解析 NTFY 服务器的 IP 地址
- 添加一条 iptables 规则以拦截出站流量
- 拦截 10 秒钟（可配置）
- 在退出时自动删除拦截规则
- 需要 root 权限 (sudo)

>[!CAUTION]
> 此脚本会修改 iptables 规则并需要 root 权限。仅用于测试通知重试机制。

## 数据库迁移测试 {#database-migration-testing}

该项目包含用于测试从旧版本到当前版本数据库迁移的脚本。这些脚本可确保数据库迁移正常工作并保持数据完整性。

### 生成迁移测试数据 {#generate-migration-test-data}

```bash
./scripts/generate-migration-test-data.sh
```

此脚本为应用程序的多个历史版本生成测试数据库。它将：

1. **停止并删除** 任何现有的 Docker 容器
2. **针对每个版本** (v0.4.0, v0.5.0, v0.6.1, 0.7.27, 0.8.21)：
   - 删除现有的数据库文件
   - 创建版本标记文件
   - 启动指定版本的 Docker 容器
   - 等待容器就绪
   - 使用 `pnpm generate-test-data` 生成测试数据
   - 对包含测试数据的 UI 进行截图
   - 停止并删除容器
   - 刷新 WAL 文件并保存数据库架构
   - 将数据库文件复制到 `scripts/migration_test_data/`

**要求：**
- 必须安装并配置 Docker
- 必须安装 Google Chrome (通过 Puppeteer)
- Docker 操作需要 Root/sudo 权限
- Docker 卷 `duplistatus_data` 必须存在

**输出：**
- 数据库文件：`scripts/migration_test_data/backups_<VERSION>.db`
- 架构文件：`scripts/migration_test_data/backups_<VERSION>.schema`
- 截图：`scripts/migration_test_data/duplistatus_test_data_<VERSION>.png`

**配置：**
- 服务器数字：通过 `SERVERS` 变量设置 (默认：3)
- 数据目录：`/var/lib/docker/volumes/duplistatus_data/_data`
- 端口：9666 (Docker 容器端口)

>[!CAUTION]
> 此脚本需要 Docker 且会停止/删除现有容器。它还需要 sudo 权限以进行 Docker 操作和文件系统访问。如果您尚未安装 Google Chrome，需要先运行 `pnpm take-screenshots` 脚本。

>[!IMPORTANT]
> 此脚本原计划仅运行一次，因为在发布新版本时，开发人员可以直接将数据库文件和截图复制到 `scripts/migration_test_data/` 目录。在开发期间，只需运行 `./scripts/test-migrations.sh` 脚本即可测试迁移。

### 测试数据库迁移 {#test-database-migrations}

```bash
./scripts/test-migrations.sh
```

此脚本测试从旧版本到当前版本 (4.0) 的数据库迁移。它将：

1. **针对每个版本** (v0.4.0, v0.5.0, v0.6.1, 0.7.27, 0.8.21)：
   - 创建测试数据库的临时副本
   - 使用 `test-migration.ts` 运行迁移过程
   - 验证迁移后的数据库结构
   - 检查所需的表和列
   - 验证数据库版本是否为 4.0
   - 清理临时文件

**要求：**
- `scripts/migration_test_data/` 中必须存在测试数据库
- 需先运行 `generate-migration-test-data.sh` 生成

**输出：**
- 带有颜色标记的测试结果（绿色表示通过，红色表示失败）
- 通过和失败版本的摘要
- 失败迁移的详细错误消息
- 如果全部测试通过，退出代码为 0；如果有任何一项失败，则为 1

**验证内容：**
- 迁移后数据库版本为 4.0
- 所有必需的表均存在：`servers`, `backups`, `configurations`, `users`, `sessions`, `audit_log`, `db_version`
- 每个表中均存在必需的列
- 数据库结构正确

**输出示例：**

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

**用法：**

```bash
# Run all migration tests
./scripts/test-migrations.sh

# Check exit code
echo $?  # 0 = all passed, 1 = some failed
```

>[!NOTE]
> 此脚本在内部使用 TypeScript 迁移测试脚本 (`test-migration.ts`)。该测试脚本在迁移后验证数据库结构并确保数据完整性。

## SMTP 和邮件（开发） {#smtp-and-email-development}

在 **设置 → 邮件** 下配置 SMTP，并使用应用内的邮件测试和通知流程。之前的 `pnpm set-smtp-test-config` 和 `pnpm test-smtp-connections` 辅助脚本已从仓库中移除。

## 测试 Docker Entrypoint 脚本 {#test-docker-entrypoint-script}

```bash
pnpm test-entrypoint
```

此脚本为本地开发中的 `docker-entrypoint.sh` 提供了一个测试包装器。它设置环境以测试 entrypoint 日志记录功能，并确保日志写入 `data/logs/`，以便应用程序可以访问。

**功能：**

1. **始终构建新版本**：在测试前自动运行 `pnpm build-local` 以创建全新构建（无需手动先构建）
2. **构建 cron 服务**：确保 cron 服务已构建 (`dist/cron-service.cjs`)
3. **设置类 Docker 结构**：创建必要的符号链接和目录结构以模拟 Docker 环境
4. **运行 entrypoint 脚本**：使用正确的环境变量执行 `docker-entrypoint.sh`
5. **清理**：退出时自动删除临时文件

**用法：**

```bash
# Run the test (builds fresh version automatically)
pnpm test-entrypoint
```

**环境变量：**
- `PORT=8666` - Next.js 服务器的端口（与 `start-local` 一致）
- `CRON_PORT=8667` - cron 服务的端口
- `VERSION` - 自动设置为 `test-YYYYMMDD-HHMMSS` 格式

**输出：**
- 日志写入 `data/logs/application.log`（应用程序可访问）
- 控制台输出显示 entrypoint 脚本的执行情况
- 按 Ctrl+C 停止并测试日志刷新

**要求：**
- 脚本必须在仓库根目录下运行（pnpm 会自动处理此操作）
- 脚本自动处理所有前提条件（构建、cron 服务等）

**用例：**
- 在 Docker 部署前在本地测试 entrypoint 脚本的更改
- 验证日志轮转和日志记录功能
- 测试优雅停机和信号处理
- 在本地环境中调试入口点脚本行为
