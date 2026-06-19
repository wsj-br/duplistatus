# 工作区管理员脚本和命令 {#workspace-admin-scripts-commands}

## 清理数据库 {#clean-database}

```bash
./scripts/clean-db.sh
```

通过删除所有数据来清理数据库，同时保留数据库模式和结构。

>[!CAUTION]
> 请谨慎使用，因为这将删除所有现有数据。

## 清理构建产物和依赖项 {#clean-build-artefacts-and-dependencies}

```bash
scripts/clean-workspace.sh
```

删除所有构建产物、node_modules 目录和其他生成的文件，以确保状态干净。当你需要执行全新安装或解决依赖问题时，这非常有用。该命令将删除：
- `node_modules/` 目录
- `.next/` 构建目录
- `dist/` 目录
- `out/` 目录
- `.turbo/` 目录
- `pnpm-lock.yaml`
- `data/*.json`（开发 JSON 备份文件）
- `public/documentation`
- `documentation/.docusaurus`, `.cache`, `.cache-*`, `build`, `node_modules`, `pnpm-lock.yaml`
- `.genkit/` 目录
- `*.tsbuildinfo` 文件
- pnpm 存储缓存（通过 `pnpm store prune`）
- Docker 构建缓存和系统清理（镜像、网络、卷）

## 清理 Docker Compose 和 Docker 环境 {#clean-docker-compose-and-docker-environment}

```bash
scripts/clean-docker.sh
```

执行完整的 Docker 清理，适用于：
- 释放磁盘空间
- 删除旧的/未使用的 Docker 产物
- 在开发或测试会话后进行清理
- 维护干净的 Docker 环境

## 将软件包更新至最新版本 {#update-the-packages-to-the-latest-version}

你可以使用以下命令手动更新软件包：

```bash
ncu --upgrade
pnpm update
```

或使用自动化脚本（建议使用 `source` 以使 **nvm** 应用于当前 shell；对于 **CI** 或非交互式运行，请使用 `CI=1` 或 `UPGRADE_ALLOW_EXEC=1`）：

```bash
source ./scripts/upgrade-dependencies.sh
```

`upgrade-dependencies.sh` 脚本将整个依赖升级过程自动化。它是与项目无关的：包管理器、工作区软件包以及每个软件包的验证命令都是自动检测的（因此根目录和 `documentation/` 软件包都会被升级，且没有硬编码路径）。它会：
- 通过 `upgrade-tools.sh` 加载工具设置（nvm / Node LTS, 全局 `pnpm`, `npm-check-updates`, `doctoc`）
- 为每个软件包执行 **构建安全**升级，并使用 `npm-check-updates` 医生模式：它会保留通过软件包 `typecheck`/`lint` 的升级，并回滚导致构建失败的升级（内置 ESLint peer 门控，以确保 `eslint` 和 React 插件的升级保持兼容）
- 更新工作区 pnpm lockfile 并安装依赖项
- 更新 browserslist 数据库
- 检查漏洞 (`pnpm audit`) 并应用非破坏性修复 (`pnpm audit --fix`)
- **优先考虑安全性**：如果某个有漏洞的直接依赖项只能通过破坏构建的升级来修复，则强制应用安全版本并报告构建错误，以便更新代码以实现兼容
- 打印摘要（升级的软件包 vs 跳过的破坏构建的软件包、已修复/剩余的漏洞，以及用于手动回滚的清单快照路径）

该脚本提供了一套完整的流程，用于保持依赖项的最新和安全。

## 检查未使用的软件包 {#check-for-unused-packages}

```bash
pnpm depcheck
```

## 更新版本信息 {#update-version-information}

```bash
./scripts/update-version.sh
```

该脚本自动更新多个文件中的版本信息以保持同步。它会：
- 从 `package.json` 中提取版本
- 使用 `VERSION` 变量更新 `.env` 文件（如果不存在则创建）
- 使用 `VERSION` 变量更新 `Dockerfile`（如果存在）
- 更新 `documentation/package.json` 版本字段（如果存在）
- 仅在版本发生变化时更新
- 为每次操作提供反馈

## 预检查脚本 {#pre-checks-script}

```bash
./scripts/pre-checks.sh
```

此脚本在启动开发服务器、构建或启动生产服务器之前运行预检查。它：
- 确保 `.duplistatus.key` 文件存在（通过 `ensure-key-file.sh`）
- 更新版本信息（通过 `update-version.sh`）

此脚本由 `pnpm dev`、`pnpm build` 和 `pnpm start-local` 自动调用。

## 确保关键文件存在 {#ensure-key-file-exists}

```bash
./scripts/ensure-key-file.sh
```

此脚本确保 `data` 目录中存在 `.duplistatus.key` 文件。它：
- 如果 `data` 目录不存在则创建该目录
- 如果缺失则生成一个新的 32 字节随机密钥文件
- 将文件权限设置为 0400（仅所有者可读）
- 如果权限不正确则进行修复

该密钥文件用于应用程序中的加密操作。

## 管理员账户恢复 {#admin-account-recovery}

```bash
./admin-recovery <username> <new-password>
```

此脚本允许在账户被锁定或忘记密码时恢复管理员账户。它：
- 重置指定用户的密码
- 如果账户被锁定则将其解锁
- 重置失败登录尝试计数器
- 清除“必须更改密码”标志
- 验证密码是否符合安全要求
- 将操作记录到审计日志

**示例：**

```bash
./admin-recovery admin NewPassword123
```

>[!CAUTION]
> 此脚本直接修改数据库。仅在账户恢复必要时使用。

## 复制图像 {#copy-images}

```bash
./scripts/copy-images.sh
```

将图像文件从 `documentation/static/img` 复制到应用程序中的相应位置：
- 将 `favicon.ico` 复制到 `src/app/`
- 将 `duplistatus_logo.png` 复制到 `public/images/`
- 将 `duplistatus_banner.png` 复制到 `public/images/`

用于保持应用程序图像与文档图像同步。

## 比较开发环境与 Docker 之间的版本 {#compare-versions-between-development-and-docker}

```bash
./scripts/compare-versions.sh
```

此脚本比较开发环境与运行中的 Docker 容器之间的版本。它：
- 仅通过主版本号比较 SQLite 版本（例如，3.45.1 和 3.51.1 被视为兼容，显示为“✅ (major)”）
- 精确比较 Node、npm 和 Duplistatus 版本（必须完全匹配）
- 显示一个格式化表格，展示所有版本比较结果
- 提供带有颜色标记结果的摘要（✅ 表示匹配，❌ 表示不匹配）
- 如果所有版本均匹配，则以代码 0 退出；如果存在不匹配，则以 1 退出

**要求：**
- 必须运行名为 `duplistatus` 的 Docker 容器
- 脚本从 Docker 容器日志中读取版本信息

**输出示例：**

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

**注意：** SQLite 版本仅通过主版本号进行比较，因为同一主版本下的不同补丁版本通常是兼容的。如果 SQLite 版本在主版本级别匹配但补丁版本不同，脚本将予以指示。

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

以格式化表格的形式显示配置表中 `backup_settings` 值的内容。适用于调试通知配置。默认数据库路径：`data/backups.db`。
