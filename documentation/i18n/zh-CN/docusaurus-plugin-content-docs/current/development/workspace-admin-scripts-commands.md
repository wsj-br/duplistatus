

# 工作区管理脚本与命令 {#workspace-admin-scripts-commands}

## 清理数据库 {#clean-database}

```bash
./scripts/clean-db.sh
```
清理数据库，删除所有数据但保留数据库架构和结构。

>[!CAUTION]
> 请谨慎使用，这将删除所有现有数据。

## 清理构建产物和依赖 {#clean-build-artefacts-and-dependencies}

```bash
scripts/clean-workspace.sh
```
删除所有构建产物、`node_modules` 目录及其他生成文件，以确保干净状态。在需要全新安装或解决依赖问题时很有用。该命令将删除：
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
- Docker 构建缓存和系统清理（镜像、网络、卷）

## 清理 Docker Compose 和 Docker 环境 {#clean-docker-compose-and-docker-environment}

```bash
scripts/clean-docker.sh
```
执行完整的 Docker 清理，适用于：
- 释放磁盘空间
- 删除旧/未使用的 Docker 产物
- 开发或测试会话后的清理
- 保持干净的 Docker 环境

## 将软件包更新至最新版本 {#update-the-packages-to-the-latest-version}

可以手动更新软件包：
```bash
ncu --upgrade
pnpm update
```

或使用自动化脚本（建议使用 `source`，以便 **nvm** 应用于当前 shell；对于 **CI** 或非交互式运行，使用 `CI=1` 或 `DUPLISTATUS_UPGRADE_ALLOW_EXEC=1`）：
```bash
source ./scripts/upgrade-dependencies.sh
```

`upgrade-dependencies.sh` 脚本自动化整个依赖升级流程：
- 通过 `upgrade-tools.sh` 加载工具设置（nvm / Node LTS、全局 `pnpm`、`npm-check-updates`、`doctoc`）
- 使用 `npm-check-updates` 更新根目录和 `documentation/package.json`（可选 ESLint peer 门控，确保 `eslint` 和 React 插件升级兼容）
- 更新工作区 pnpm 锁文件并安装依赖
- 更新 browserslist 数据库
- 使用 `pnpm audit` 检查漏洞
- 使用 `pnpm audit fix` 自动修复漏洞
- 修复后重新检查漏洞以验证修复效果

此脚本提供完整的依赖保持最新和安全的流程。

## 检查未使用的软件包 {#check-for-unused-packages}

```bash
pnpm depcheck
```

## 更新版本信息 {#update-version-information}

```bash
./scripts/update-version.sh
```

此脚本自动更新多个文件中的版本信息以保持同步。它会：
- 从 `package.json` 提取版本
- 使用 `VERSION` 变量更新 `.env` 文件（若不存在则创建）
- 使用 `VERSION` 变量更新 `Dockerfile`（若存在）
- 更新 `documentation/package.json` 版本字段（若存在）
- 仅在版本变更时更新
- 为每项操作提供反馈

## 预检查脚本 {#pre-checks-script}

```bash
./scripts/pre-checks.sh
```

此脚本在启动开发服务器、构建或启动生产服务器之前运行预检查。它会：
- 确保 `.duplistatus.key` 文件存在（通过 `ensure-key-file.sh`）
- 更新版本信息（通过 `update-version.sh`）

此脚本由 `pnpm dev`、`pnpm build` 和 `pnpm start-local` 自动调用。

## 确保密钥文件存在 {#ensure-key-file-exists}

```bash
./scripts/ensure-key-file.sh
```

此脚本确保 `data` 目录中存在 `.duplistatus.key` 文件。它会：
- 若不存在则创建 `data` 目录
- 若缺失则生成新的 32 字节随机密钥文件
- 将文件权限设置为 0400（仅所有者可读）
- 若权限不正确则修复权限

密钥文件用于应用程序中的加密操作。

## 管理员账户恢复 {#admin-account-recovery}

```bash
./admin-recovery <username> <new-password>
```

此脚本允许在管理员账户被锁定或忘记密码时进行恢复。它会：
- 重置指定用户的密码
- 若账户被锁定则解锁
- 重置失败登录尝试计数器
- 清除"必须更改密码"标志
- 验证密码符合安全要求
- 将操作记录到审计日志

**示例：**
```bash
./admin-recovery admin NewPassword123
```

>[!CAUTION]
> 此脚本直接修改数据库。仅在账户恢复必要时使用。

## 复制图片 {#copy-images}

```bash
./scripts/copy-images.sh
```

将图片文件从 `documentation/static/img` 复制到应用程序中的相应位置：
- 将 `favicon.ico` 复制到 `src/app/`
- 将 `duplistatus_logo.png` 复制到 `public/images/`
- 将 `duplistatus_banner.png` 复制到 `public/images/`

用于保持应用程序图片与文档图片同步。

## 比较开发与 Docker 之间的版本 {#compare-versions-between-development-and-docker}

```bash
./scripts/compare-versions.sh
```

此脚本比较开发环境与运行中的 Docker 容器之间的版本。它会：
- 仅按主版本比较 SQLite 版本（例如 3.45.1 与 3.51.1 视为兼容，显示为 "✅ (major)"）
- 精确比较 Node、npm 和 Duplistatus 版本（必须完全匹配）
- 显示所有版本比较的格式化表格
- 提供带颜色编码结果的摘要（✅ 表示匹配，❌ 表示不匹配）
- 若所有版本匹配则退出码为 0，若有不匹配则为 1

**要求：**
- 名为 `duplistatus` 的 Docker 容器必须正在运行
- 脚本从 Docker 容器日志读取版本信息

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

**注意：** SQLite 版本仅按主版本比较，因为同一主版本内的不同补丁版本通常兼容。若 SQLite 版本在主版本级别匹配但补丁版本不同，脚本会予以说明。

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

以格式化表格显示 configurations 表中 `backup_settings` 值的内容。用于调试通知配置。默认数据库路径：`data/backups.db`。
