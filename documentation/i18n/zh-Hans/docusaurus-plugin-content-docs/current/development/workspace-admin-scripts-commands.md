# 工作区管理脚本和命令 {/* #workspace-admin-scripts--commands */}

## 清理数据库 {/* #clean-database */}

```bash
./scripts/clean-db.sh
```

通过删除所有数据但保留数据库架构和结构来清理数据库。

>[!CAUTION]
> 注意使用，因为这将删除所有现有数据。

## 清理构建工件和依赖项 {/* #clean-build-artefacts-and-dependencies */}

```bash
scripts/clean-workspace.sh
```

删除所有构建工件、node_modules目录和其他生成的文件以确保干净的状态。当您需要执行新的安装或解决依赖问题时，这很有用。该命令将删除：
- `node_modules/` 目录
- `.next/` 构建目录
- `dist/` 目录
- `out/` 目录
- `.turbo/` 目录
- `pnpm-lock.yaml` 目录
- `data/*.json`（开发JSON备份文件）
- `public/documentation`
- `documentation/.docusaurus`、`.cache`、`.cache-*`、`build`、`node_modules`、`pnpm-lock.yaml`
- `.genkit/` 目录
- `*.tsbuildinfo` 文件
- pnpm存储缓存（通过`pnpm store prune`）
- Docker构建缓存和系统清理（镜像、网络、卷）

## 清理Docker Compose和Docker环境 {/* #clean-docker-compose-and-docker-environment */}

```bash
scripts/clean-docker.sh
```

执行完整的Docker清理，这对于以下情况很有用：
- 释放磁盘空间
- 删除旧的/未使用的Docker工件
- 在开发或测试会话后进行清理
- 保持 Docker 环境的干净

## 将包更新到最新版本 {/* #update-the-packages-to-the-latest-version */}

您可以使用以下命令手动更新包：

```bash
ncu --upgrade
pnpm update
```

或者使用自动化脚本（优先使用`source`，以便**nvm**适用于当前shell；对于**CI**或非交互式运行，使用`CI=1`或`UPGRADE_ALLOW_EXEC=1`）：

```bash
source ./scripts/upgrade-dependencies.sh
```

该`upgrade-dependencies.sh`脚本自动化整个依赖升级过程。它是项目无关的：包管理器、工作区包以及每个包的验证命令都是自动检测的（因此根目录和`documentation/`包都会被升级，没有硬编码路径）。它：
- 通过`upgrade-tools.sh`源工具设置（nvm / Node LTS、全局`pnpm`、`npm-check-updates`、`doctoc`）
- 对每个包执行**构建安全**升级：`npm-check-updates`解析最新版本，然后从工作区根目录安装和`typecheck`/`lint`运行。验证失败的升级通过编辑`package.json`进行二分法（而不是`pnpm add`，因为pnpm在工作区根目录拒绝）。嵌入式同行门在`eslint-plugin-react` / `typescript-eslint`尚未允许最新主要版本时固定`eslint`和`typescript`。
- 更新工作区pnpm锁文件并安装依赖项
- 更新browserslist数据库
- 检查漏洞（`pnpm audit`）并应用非破坏性修复（`pnpm audit --fix`）
- **优先安全**：如果一个易受攻击的直接依赖项只能通过破坏性升级来修复，则会强制应用安全版本，并报告构建错误，以便代码可以更新以实现兼容性
- 打印摘要（已升级与构建中断的包跳过，修复/剩余的漏洞，以及手动回滚的清单快照路径）
- 使用`/usr/bin/cp`复制`package.json`和锁文件，以便源交互式`cp`别名（例如`cp -i`）不会提示覆盖这些文件

此脚本提供了一个完整的工作流程，用于保持依赖项的最新和安全。

## 检查未使用的包 {/* #check-for-unused-packages */}

```bash
pnpm depcheck
```

## 更新版本信息 {/* #update-version-information */}

```bash
./scripts/update-version.sh
```

此脚本会自动更新多个文件中的版本信息，以保持它们同步。它：
- 从 `package.json` 中提取版本信息
- 使用 `VERSION` 变量更新 `.env` 文件（如果不存在则创建）
- 使用 `VERSION` 变量更新 `Dockerfile`（如果存在）
- 更新 `documentation/package.json` 版本字段（如果存在）
- 仅在版本发生变化时更新
- 提供每个操作的反馈

## 预检脚本 {/* #pre-checks-script */}

```bash
./scripts/pre-checks.sh
```

此脚本在启动开发服务器、构建或启动生产服务器之前运行预检。它：
- 确保 `.duplistatus.key` 文件存在（通过 `ensure-key-file.sh`）
- 更新版本信息（通过 `update-version.sh`）

此脚本由 `pnpm dev`、`pnpm build` 和 `pnpm start-local` 自动调用。

## 确保关键文件存在 {/* #ensure-key-file-exists */}

```bash
./scripts/ensure-key-file.sh
```

此脚本确保 `.duplistatus.key` 文件存在于 `data` 目录中。它：
- 如果不存在，则创建 `data` 目录
- 如果缺失，则生成一个新的 32 字节随机密钥文件
- 将文件权限设置为 0400（仅所有者可读）
- 如果权限不正确，则修复权限

密钥文件用于应用程序中的加密操作。

## 管理员账户恢复 {/* #admin-account-recovery */}

```bash
./admin-recovery <username> <new-password>
```

此脚本允许在锁定账户或忘记密码时恢复管理员账户。它：
- 重置指定用户的密码
- 如果账户被锁定，则解锁账户
- 重置失败登录尝试计数器
- 清除“必须更改密码”标志
- 验证密码是否符合安全要求
- 将操作记录到审计日志

**示例：**

```bash
./admin-recovery admin NewPassword123
```

>[!CAUTION]
> 此脚本直接修改数据库。仅在必要时用于账户恢复。

## 复制图像 {/* #copy-images */}

```bash
./scripts/copy-images.sh
```

将图像文件从 `documentation/static/img` 复制到应用程序中的适当位置：
- 将 `favicon.ico` 复制到 `src/app/`
- 将 `duplistatus_logo.png` 复制到 `public/images/`
- 将 `duplistatus_banner.png` 复制到 `public/images/`

有助于保持应用程序图像与文档图像同步。

## 比较开发和 Docker 之间的版本 {/* #compare-versions-between-development-and-docker */}

```bash
./scripts/compare-versions.sh
```

此脚本比较开发环境和正在运行的 Docker 容器之间的版本。它：
- 仅按主要版本比较 SQLite 版本（例如，3.45.1 与 3.51.1 被视为兼容，显示为“✅（主要）”）
- 完全比较 Node、npm 和 Duplistatus 版本（必须完全匹配）
- 显示一个格式化的表格，显示所有版本比较
- 提供带有彩色编码结果的摘要（✅ 表示匹配，❌ 表示不匹配）
- 如果所有版本匹配，则以代码 0 退出；如果存在不匹配，则以代码 1 退出

**要求：**
- 必须运行名为 `duplistatus` 的 Docker 容器
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

**注意：** SQLite 版本仅按主版本号进行比较，因为同一主版本内的不同补丁版本通常是兼容的。该脚本将指示 SQLite 版本在主版本级别是否匹配，但补丁版本不同。

## 查看数据库中的配置 {/* #viewing-the-configurations-in-the-database */}

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

## 显示备份设置 {/* #show-backup-settings */}

```bash
./scripts/show-backup-settings.sh [database_path]
```

以格式化表格显示配置表中 `backup_settings` 值的内容。用于调试通知配置。默认数据库路径：`data/backups.db`。
