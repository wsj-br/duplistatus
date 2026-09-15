# 测试脚本 {/* #test-scripts */}

该项目包含多个测试脚本，以帮助开发和测试：

> [!NOTE]
> 已移除用于过期调试、SMTP矩阵测试和cron端口检查的旧版仓库根目录`pnpm`辅助工具。请使用应用程序UI（**设置 → 备份监控**）、经过身份验证的HTTP API，并根据下面的文档使用`curl`针对cron服务。

## 生成测试数据 {/* #generate-test-data */}

```bash
pnpm generate-test-data --servers=N
```

此脚本为多个服务器和备份生成测试备份数据。

`--servers=N`参数是**必需的**，用于指定要生成的服务器数量（1-30）。

使用选项`--upload`将生成的数据发送到`/api/upload`

```bash
pnpm generate-test-data --servers=N --upload
pnpm generate-test-data --servers=N --upload --api-key=YOUR_UPLOAD_KEY
```

当设置 → API密钥设置为需要密钥时，`--api-key`是必需的。脚本在HTTP 429时重试一次，以确保大型`--upload`运行保持在默认速率限制内。

**示例：**

```bash
# Generate data for 5 servers
pnpm generate-test-data --servers=5

# Generate data for 1 server with upload mode
pnpm generate-test-data --upload --servers=1

# Generate data for all 30 servers
pnpm generate-test-data --servers=30
```

该脚本为每个服务器分配 Duplicati 版本 **每个服务器**（相同的报告字符串会写入该服务器的每个备份）：

- **70–80%当前**：在可用时使用`configurations.duplicati_versions`中的最新缓存稳定版本，否则使用固定后备版本（`2.1.0.5_stable`）。
- **其余较旧**：一个严格的先前稳定版本，以便仪表板徽章显示为过时（黄色）。
- 直接-DB模式首先清除`configurations`，然后恢复或播种版本缓存，以便当前/过时的比较立即生效。
- 小数量无法总是落在70–80%：`--servers=1`是100%当前；`--servers=2`或`3`保持至少一个较旧的服务器；`--servers=6`是5个当前（83%）。`--servers=12`（由`pnpm take-screenshots`使用）是**9个当前/3个较旧**。
- 当`pnpm take-screenshots`稍后将数据集减少到三个服务器时，它会保留受保护的过期服务器和**至少一个较旧版本服务器**。

>[!CAUTION]
> 此脚本会删除数据库中的所有先前数据，并用测试数据替换它。
> 运行此脚本前，请备份您的数据库。

## 过期检查和cron连接（开发） {/* #overdue-checks-and-cron-connectivity-development */}

### 运行过期备份检查 {/* #run-an-overdue-backup-check */}

当应用程序正在运行时：

- **UI（推荐）：** 打开**设置 → 备份监控**，并使用**测试过期备份**。这将运行与经过身份验证的`POST /api/notifications/check-overdue`相同的逻辑。

### Cron服务健康 {/* #cron-service-health */}

```bash
curl http://localhost:8667/health
curl http://localhost:8666/api/cron/health
```

### 模拟特定日期或时间 {/* #simulating-a-specific-date-or-time */}

没有捆绑的CLI用于注入模拟的“当前”时间。有关算法和手动测试想法，请参阅仓库文件`dev/OVERDUE_DETECTION_ALGORITHM.md`和`src/lib/overdue-backup-checker.ts`中的实现。

## 验证 CSV 导出 {/* #validate-csv-export */}

```bash
pnpm validate-csv-export
```

此脚本验证 CSV 导出功能。它：
- 测试 CSV 导出生成
- 验证数据格式和结构
- 检查导出文件中的数据完整性

有助于在发布前确保 CSV 导出正常工作。

## 暂时阻止 NTFY 服务器（用于测试） {/* #temporarily-block-ntfy-server-for-testing */}

```bash
sudo ./scripts/temporary_ntfy.sh_block.sh
```

此脚本暂时阻止对 NTFY 服务器（`ntfy.sh`）的出站网络访问以测试通知重试机制。它：
- 解析 NTFY 服务器的 IP 地址
- 添加 iptables 规则以阻止出站流量
- 阻止 10 秒（可配置）
- 自动在退出时删除阻止规则
- 需要 root 权限（sudo）

>[!CAUTION]
> 此脚本修改 iptables 规则并需要 root 权限。仅用于测试通知重试机制。

## 数据库迁移测试 {/* #database-migration-testing */}

该项目包含用于测试从旧版本迁移到当前版本的数据库迁移脚本。这些脚本确保数据库迁移正常工作并保持数据完整性。

### 生成迁移测试数据 {/* #generate-migration-test-data */}

```bash
./scripts/generate-migration-test-data.sh
```

此脚本为应用程序的多个历史版本生成测试数据库。它：

1. **停止并移除**任何现有的 Docker 容器
2. **对于每个版本**（v0.4.0、v0.5.0、v0.6.1、0.7.27、0.8.21）：
   - 移除现有数据库文件
   - 创建版本标签文件
   - 使用特定版本启动 Docker 容器
   - 等待容器准备就绪
   - 使用 `pnpm generate-test-data` 生成测试数据
   - 截取带有测试数据的 UI 截图
   - 停止并移除容器
   - 清空 WAL 文件并保存数据库架构
   - 将数据库文件复制到 `scripts/migration_test_data/`

**要求：**
- Docker 必须已安装并配置
- Chromium（通过 Playwright）必须已安装
- Docker 操作需要 root/sudo 访问权限
- Docker 卷 `duplistatus_data` 必须存在

**输出：**
- 数据库文件：`scripts/migration_test_data/backups_<VERSION>.db`
- 架构文件：`scripts/migration_test_data/backups_<VERSION>.schema`
- 截图：`scripts/migration_test_data/duplistatus_test_data_<VERSION>.png`

**配置：**
- 服务器数量：通过 `SERVERS` 变量设置（默认：3）
- 数据目录：`/var/lib/docker/volumes/duplistatus_data/_data`
- 端口：9666（Docker 容器端口）

>[!CAUTION]
> 此脚本需要 Docker 并将停止/移除现有容器。它还需要 sudo 访问权限进行 Docker 操作和文件系统访问。如果尚未安装，请先运行 `pnpm take-screenshots:install` 安装 Playwright Chromium 浏览器。

>[!IMPORTANT]
> 此脚本最初仅需运行一次，因为新版本开发者可以直接将数据库文件和截图复制到 `scripts/migration_test_data/` 目录。在开发过程中，只需运行 `./scripts/test-migrations.sh` 脚本即可测试迁移。

### 测试数据库迁移 {/* #test-database-migrations */}

```bash
./scripts/test-migrations.sh
```

此脚本测试从旧版本迁移到当前版本（4.0）的数据库迁移。它：

1. **每个版本**（v0.4.0、v0.5.0、v0.6.1、0.7.27、0.8.21）：
   - 创建测试数据库的临时副本
   - 使用 `test-migration.ts` 运行迁移过程
   - 验证迁移后的数据库结构
   - 检查所需的表和列
   - 验证数据库版本是否为 4.0
   - 清理临时文件

**要求：**
- 测试数据库必须存在于 `scripts/migration_test_data/`
- 通过先运行 `generate-migration-test-data.sh` 生成

**输出：**
- 彩色测试结果（绿色表示通过，红色表示失败）
- 通过和失败版本的摘要
- 失败迁移的详细错误消息
- 如果所有测试通过，则退出代码为 0；如果有任何失败，则为 1

**验证内容：**
- 迁移后数据库版本为 4.0
- 所有必需的表存在：`servers`、`backups`、`configurations`、`users`、`sessions`、`audit_log`、`db_version`
- 每个表中存在所需的列
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

**用法：**

```bash
# Run all migration tests
./scripts/test-migrations.sh

# Check exit code
echo $?  # 0 = all passed, 1 = some failed
```

>[!NOTE]
> 此脚本在内部使用 TypeScript 迁移测试脚本（`test-migration.ts`）。测试脚本在迁移后验证数据库结构并确保数据完整性。

## SMTP 和电子邮件（开发） {/* #smtp-and-email-development */}

在 **设置 → 电子邮件** 下配置 SMTP，并使用应用内电子邮件测试和通知流程。之前的 `pnpm set-smtp-test-config` 和 `pnpm test-smtp-connections` 辅助脚本已从存储库中删除。

## 测试 Docker 入口点脚本 {/* #test-docker-entrypoint-script */}

```bash
pnpm test-entrypoint
```

此脚本为本地开发中的 `docker-entrypoint.sh` 提供测试包装器。它设置环境以测试入口点日志记录功能，并确保日志写入 `data/logs/`，以便应用程序可以访问它们。

**功能：**

1. **始终构建新版本**：在测试前自动运行 `pnpm build-local` 创建新版本（无需手动构建）
2. **构建 cron 服务**：确保构建 cron 服务（`dist/cron-service.cjs`）
3. **设置 Docker 类似结构**：创建必要的符号链接和目录结构以模拟 Docker 环境
4. **运行入口点脚本**：使用正确的环境变量执行 `docker-entrypoint.sh`
5. **清理**：退出时自动删除临时文件

**用法：**

```bash
# Run the test (builds fresh version automatically)
pnpm test-entrypoint
```

**环境变量:**
- `PORT=8666` - Next.js 服务器的端口（与 `start-local` 匹配）
- `CRON_PORT=8667` - cron 服务的端口
- `VERSION` - 自动设置为 `test-YYYYMMDD-HHMMSS` 格式

**输出:**
- 日志写入 `data/logs/application.log`（应用程序可访问）
- 控制台输出显示入口脚本执行
- 按 Ctrl+C 停止并测试日志刷新

**要求:**
- 脚本必须从仓库根目录运行（pnpm 自动处理）
- 脚本自动处理所有先决条件（构建、cron 服务等）

**用例:**
- 在 Docker 部署前本地测试入口脚本更改
- 验证日志轮换和日志记录功能
- 测试优雅关闭和信号处理
- 在本地环境中调试入口脚本行为

## 每日摘要验证 {/* #daily-summary-validation */}

```bash
pnpm validate-daily-summary
```

运行确定性检查以验证每日摘要调度（包括夏令时）、快照聚合（仅最新备份作业）、剩余通知设置清理、孤立备份/服务器行、Markdown 清理、交付账本索赔以及使用自定义模板的架构 4.1 → 4.2 迁移。不发送电子邮件或 NTFY。
