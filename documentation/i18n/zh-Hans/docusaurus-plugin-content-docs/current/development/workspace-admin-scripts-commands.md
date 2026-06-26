# 工作空间管理员脚本和命令 {#workspace-admin-scripts-commands}

## 清理数据库 {#clean-database}

```bash
./scripts/clean-db.sh
```

通过删除所有数据同时保留数据库模式和结构来清理数据库。

>[!CAUTION]
> 使用时请谨慎，因为这将删除所有现有数据。

## 清理构建工件和依赖项 {#clean-build-artefacts-and-dependencies}

```bash
scripts/clean-workspace.sh
```

删除所有构建工件、node_modules 目录和其他生成的文件，以确保清洁状态。这在您需要执行新安装或解决依赖项问题时很有用。该命令将删除：
- `node_modules/` 目录
- `.next/` 构建目录
- `dist/` 目录
- `out/` 目录
- `.turbo/` 目录
- `pnpm-lock.yaml`
- `data/*.json`（开发 JSON 备份文件）
- `public/documentation`
- `documentation/.docusaurus`、`.cache`、`.cache-*`、`build`、`node_modules`、`pnpm-lock.yaml`
- `.genkit/` 目录
- `*.tsbuildinfo` 文件
- pnpm 存储缓存（通过 `pnpm store prune`）
- Docker 构建缓存和系统剪裁（镜像、网络、卷）

## 清理 Docker Compose 和 Docker 环境 {#clean-docker-compose-and-docker-environment}

```bash
scripts/clean-docker.sh
```

执行完整的 Docker 清理，这对于以下情况很有用：
- 释放磁盘空间
- 删除旧的/未使用的 Docker 工件
- 清理开发或测试会话后
- 维护清洁的 Docker 环境

## 更新包到最新版本 {#update-the-packages-to-the-latest-version}

您可以手动使用：

```bash
ncu --upgrade
pnpm update
```

或使用自动脚本（首选 `source`，因此 **nvm** 应用于当前 shell；对于 **CI** 或非交互式运行，请使用 `CI=1` 或 `UPGRADE_ALLOW_EXEC=1`）：

```bash
source ./scripts/upgrade-dependencies.sh
```

`upgrade-dependencies.sh` 脚本自动执行整个依赖项升级过程。它是项目无关的：包管理器、工作空间包和每个包的验证命令都是自动检测的（因此根包和 `documentation/` 包都升级，没有硬编码路径）。它：
- 通过 `upgrade-tools.sh` 设置工具（nvm / Node LTS、全局 `pnpm`、`npm-check-updates`、`doctoc`）
- 使用 `npm-check-updates` 医生模式执行 **build-safe** 升级，每个包：它保留通过包的 `typecheck`/`lint` 的升级，并撤销破坏构建的升级（具有嵌入式 ESLint 同行网关，因此 `eslint` 和 React 插件升级保持兼容）
- 更新工作空间 pnpm 锁定文件并安装依赖项
- 更新浏览器列表数据库
- 检查漏洞（`pnpm audit`）并应用非破坏性修复（`pnpm audit --fix`）
- **优先考虑安全**：如果易受攻击的直接依赖项只能通过破坏构建的升级来修复，则强制应用安全版本并报告构建错误，以便代码可以更新以保持兼容性
- 打印摘要（升级的包与跳过的破坏构建的包、修复的漏洞/剩余的漏洞以及手动回滚的清单快照路径）

此脚本提供了保持依赖项最新和安全的完整工作流程。

## 检查未使用的包 {#check-for-unused-packages}

```bash
pnpm depcheck
```

## 更新版本信息 {#update-version-information}

```bash
./scripts/update-version.sh
```

此脚本自动更新多个文件中的版本信息以保持同步。它:
- 从 `package.json` 中提取版本
- 更新 `.env` 文件中的 `VERSION` 变量（如果不存在则创建它）
- 更新 `Dockerfile` 中的 `VERSION` 变量（如果存在）
- 更新 `documentation/package.json` 版本字段（如果存在）
- 仅在版本更改时更新
- 对每个操作提供反馈

## 预检查脚本 {#pre-checks-script}

```bash
./scripts/pre-checks.sh
```

此脚本在启动开发服务器、构建或启动生产服务器之前运行预检查。它:
- 确保 `.duplistatus.key` 文件存在（通过 `ensure-key-file.sh`）
- 更新版本信息（通过 `update-version.sh`）

此脚本由 `pnpm dev`、`pnpm build` 和 `pnpm start-local` 自动调用。

## 确保关键文件存在 {#ensure-key-file-exists}

```bash
./scripts/ensure-key-file.sh
```

此脚本确保 `.duplistatus.key` 文件存在于 `data` 目录中。它:
- 如果不存在则创建 `data` 目录
- 如果缺失则生成新的 32 字节随机密钥文件
- 将文件权限设置为 0400（所有者只读）
- 修复权限如果它们不正确

密钥文件用于应用程序中的加密操作。

## 管理员账户恢复 {#admin-account-recovery}

```bash
./admin-recovery <username> <new-password>
```

此脚本允许在锁定或忘记密码时恢复管理员账户。它:
- 重置指定用户的密码
- 如果账户被锁定则解锁它
- 重置失败登录尝试计数
- 清除 "必须更改密码" 标志
- 验证密码是否满足安全要求
- 将操作记录到审计日志

**示例:**

```bash
./admin-recovery admin NewPassword123
```

>[!CAUTION]
> 此脚本直接修改数据库。仅在必要时用于账户恢复时使用。

## 复制图像 {#copy-images}

```bash
./scripts/copy-images.sh
```

将图像文件从 `documentation/static/img` 复制到应用程序中的相应位置:
- 将 `favicon.ico` 复制到 `src/app/`
- 将 `duplistatus_logo.png` 复制到 `public/images/`
- 将 `duplistatus_banner.png` 复制到 `public/images/`

用于保持应用程序图像与文档图像同步。

## 比较开发环境和 Docker 之间的版本 {#compare-versions-between-development-and-docker}

```bash
./scripts/compare-versions.sh
```

此脚本比较开发环境和运行的 Docker 容器之间的版本。它:
- 仅比较 SQLite 版本的主要版本（例如，3.45.1 与 3.51.1 被认为是兼容的，显示为 "✅ （主要）"")
- 精确比较 Node、npm 和 Duplistatus 版本（必须完全匹配）
- 显示一个格式化的表格，显示所有版本比较
- 提供一个带有颜色编码结果的摘要（✅ 表示匹配，❌ 表示不匹配）
- 如果所有版本匹配则退出代码为 0，如果存在不匹配则退出代码为 1

**要求：**
- Docker 容器名为 `duplistatus` 必须正在运行
- 脚本从 Docker 容器日志中读取版本信息

**示例输出：**

```
┌─────────────────────────┬──────────────────────────────┬──────────────────────────────┬──────────────┐
│ Component               │ Development                  │ Docker                       │   Match      │
├─────────────────────────┼──────────────────────────────┼──────────────────────────────┼──────────────┤
│ SQLite                  │ 3.45.1                       │ 3.51.1                       │ ✅ (major)   │
│ Node                    │ 24.12.0                      │ 24.12.0                      │ ✅           │
│ npm                     │ 10.9.2                       │ 10.9.2                       │ ✅           │
│ Duplistatus             │ 1.2.1                        │ 1.2.1                        │ ✅           │
└─────────────────────────┴──────────────────────────────┴──────────────────────────────┴──────────────┘
```

**注意：** SQLite 版本仅按主要版本比较，因为同一主要版本内的不同补丁版本通常是兼容的。脚本将指示如果 SQLite 版本在主要级别上匹配但补丁版本不同。

## 查看数据库中的配置 {#viewing-the-configurations-in-the-database}

```bash
sqlite3 data/backups.db "SELECT key, value FROM configurations;" | awk -F'|' '
  {print "\n" $1 ": "; 
   if(index($2,"{")>0) {print $2 |"jq -C ."; close("jq -C .")} 
   else {print $2;}}' | less -R
```

```bash
sqlite3 /var/lib/docker/volumes/duplistatus_data/_data/backups.db "SELECT key, value FROM configurations;" | awk -F'|' '
  {print "\n" $1 ": "; 
   if(index($2,"{")>0) {print $2 |"jq -C ."; close("jq -C .")} 
   else {print $2;}}' | less -R
```

## 显示备份设置 {#show-backup-settings}

```bash
./scripts/show-backup-settings.sh [database_path]
```

以格式化表格显示配置表中 `backup_settings` 值的内容。用于调试通知配置。默认数据库路径：`data/backups.db`。
