# 迁移指南 {#migration-guide}

本指南解释如何在 duplistatus 的不同版本之间升级。迁移是自动的——数据库模式会在您启动新版本时自动更新。

手动步骤仅在您自定义了通知模板（版本 0.8.x 更改了模板变量）或需要更新的外部 API 集成（版本 0.7.x 更改了 API 字段名称，版本 0.9.x 需要身份验证）时才是必需的。

## 概览 {#overview}

duplistatus 会在升级时自动迁移您的数据库模式。系统:

1. 在进行更改之前创建数据库的备份
2. 更新数据库模式到最新版本
3. 保留所有现有数据（服务器、备份、配置）
4. 验证迁移是否成功完成

## 升级前备份数据库 {#backing-up-your-database-before-migration}

在升级到新版本之前，建议创建数据库的备份。这确保您可以在迁移过程中出现问题时恢复数据。

### 如果您正在运行版本 1.2.1 或更高版本 {#if-youre-running-version-121-or-later}

使用内置的数据库备份功能:

1. 在 Web 界面中导航到 [设置 → 数据库维护](../user-guide/settings/database-maintenance.md)
2. 在 **数据库备份** 部分中，选择备份格式:
   - **数据库文件 (.db)**：二进制格式 - 最快的备份，保留所有数据库结构
   - **SQL 转储 (.sql)**：文本格式 - 人类可读的 SQL 语句
3. 点击 **下载备份**
4. 备份文件将以时间戳文件名下载到您的计算机上

有关更多详细信息，请参阅 [数据库维护](../user-guide/settings/database-maintenance.md#database-backup) 文档。

### 如果您正在运行版本 1.2.1 之前的版本 {#if-youre-running-a-version-before-121}

#### 备份 {#backup}

您必须在继续之前手动备份数据库。数据库文件位于 `/app/data/backups.db` 容器内。

##### 对于 Linux 用户 {#for-linux-users}
如果您使用 Linux，不必担心启动辅助容器。您可以使用本机 `cp` 命令直接从运行容器中提取数据库到主机。

###### 使用 Docker 或 Podman： {#using-docker-or-podman}

```bash
# Replace 'duplistatus' with your actual container name if different
docker cp duplistatus:/app/data/backups.db ./duplistatus-backup-$(date +%Y%m%d).db
```

(如果使用 Podman，只需在上面的命令中用 `podman` 替换 `docker`。)

##### 对于 Windows 用户 {#for-windows-users}
如果您在 Windows 上运行 Docker Desktop，您有两种简单的方法可以处理此问题，而无需使用命令行:

###### 选项 A：使用 Docker Desktop（最简单）{#option-a-use-docker-desktop-easiest}
1. 打开 Docker Desktop 仪表板。
2. 转到“容器”选项卡，并点击您的 duplistatus 容器。
3. 点击“文件”选项卡。
4. 导航到 `/app/data/`。
5. 右键点击 `backups.db` 并选择 **另存为...** 将其下载到您的 Windows 文件夹中。

###### 选项 B：使用 PowerShell {#option-b-use-powershell}
如果您更喜欢使用终端，可以使用 PowerShell 将文件复制到您的桌面：

```powershell
docker cp duplistatus:/app/data/backups.db $HOME\Desktop\duplistatus-backup.db
```

##### 如果您使用绑定挂载 {#if-you-use-bind-mounts}
如果您最初使用绑定挂载（例如，您将本地文件夹 `/opt/duplistatus` 映射到容器）设置容器，则无需使用 Docker 命令。只需使用文件管理器复制文件：
- Linux：`cp /path/to/your/folder/backups.db ~/backups.db`
- Windows：在 **文件资源管理器** 中简单地复制文件到您在设置期间指定的文件夹中。

#### 恢复您的数据 {#restoring-your-data}
如果您需要从以前的备份中恢复数据库，请根据您的操作系统遵循以下步骤。

:::info[IMPORTANT]
在恢复数据库之前停止容器，以防止文件损坏。
:::

##### 适用于 Linux 用户 {#for-linux-users-1}
恢复的最简单方法是将备份文件“推送”到容器的内部存储路径。

###### 使用 Docker 或 Podman：{#using-docker-or-podman-1}

```bash
# stop the container
docker stop duplistatus

# Replace 'duplistatus-backup.db' with your actual backup filename
docker cp ./duplistatus-backup.db duplistatus:/app/data/backups.db

# Restart the container
docker start duplistatus
```

##### 适用于 Windows 用户 {#for-windows-users-1}
如果您使用 Docker Desktop，可以通过 GUI 或 PowerShell 进行恢复。

###### 选项 A：使用 Docker Desktop（GUI） {#option-a-use-docker-desktop-gui}
1. 确保 duplistatus 容器正在运行（Docker Desktop 需要容器处于活动状态才能通过 GUI 上传文件）。
2. 转到容器设置中的文件选项卡。
3. 导航到 `/app/data/`。
4. 右键单击现有的 backups.db 并选择 删除。
5. 点击导入按钮（或右键单击文件夹区域）并从计算机中选择您的备份文件。

将导入的文件重命名为确切的 backups.db，如果文件名中有时间戳。

重新启动容器。

###### 选项 B：使用 PowerShell {#option-b-use-powershell-1}

```powershell
# Copy the file from your Desktop back into the container
docker cp $HOME\Desktop\duplistatus-backup.db duplistatus:/app/data/backups.db

# Restart the container
docker start duplistatus
```

##### 如果您使用绑定挂载 {#if-you-use-bind-mounts-1}
如果您使用本地文件夹映射到容器，则无需任何特殊命令。

1. 停止容器。
2. 手动将备份文件复制到映射的文件夹中（例如 `/opt/duplistatus` 或 `C:\duplistatus_data`）。 
3. 确保文件名为 `backups.db`。
4. 启动容器。

```bash
docker logs <container-name>
```

:::note
如果您手动恢复数据库，可能会遇到权限错误。 

检查容器日志并根据需要调整权限。请参阅下面的 [故障排除](#troubleshooting-your-restore--rollback) 部分以获取更多信息。
:::

## 自动迁移过程 {#automatic-migration-process}

启动新版本时，迁移会自动运行：

1. **备份创建**：在您的数据目录中创建带时间戳的备份
2. **模式更新**：更新数据库表和字段
3. **数据迁移**：保留和迁移所有现有数据
4. **验证**：记录迁移成功

### 监控迁移 {#monitoring-migration}

检查 Docker 日志以监控迁移进度：


查找类似以下的消息：
- `"Found X pending migrations"`
- `"Running consolidated migration X.0..."`
- `"Migration X.0 completed successfully"`
- `"Database backup created: /path/to/backups-copy-YYYY-MM-DDTHH-MM-SS.db"`
- `"All migrations completed successfully"`

## 特定版本的迁移说明 {#version-specific-migration-notes}

### 升级到版本 0.9.x 或更高版本（模式 v4.0） {#upgrading-to-version-09x-or-later-schema-v40}

:::warning
**现在需要身份验证。** 所有用户在升级后必须登录。
:::

#### 自动更改的内容 {#what-changes-automatically}

- 数据库模式从 v3.1 迁移到 v4.0
- 创建新表：`users`，`sessions`，`audit_log`
- 自动创建默认管理员帐户
- 所有现有会话都被取消

#### 您必须执行的操作 {#what-you-must-do}

1. **登录**，使用默认管理员凭据：
   - 用户名：`admin`
   - 密码：`Duplistatus09`
2. 收到提示时**更改密码**（首次登录时必须）
3. **为其他用户创建用户帐户**（设置 → 用户）
4. **更新外部 API 集成**以包含身份验证（请参阅[不兼容的 API 更改](api-changes.md))
5. **配置审计日志保留期**（如果需要）（设置 → 审计日志）

#### 如果您被锁定 {#if-youre-locked-out}

使用管理员恢复工具：

```bash
docker exec -it duplistatus /app/admin-recovery admin NewPassword123
```

有关详细信息，请参阅 [管理员恢复指南](../user-guide/admin-recovery.md)。

### 升级到版本 0.8.x {#upgrading-to-version-08x}

#### 自动更改的内容 {#what-changes-automatically-1}

- 数据库架构已更新至 v3.1
- 已生成用于加密的主密钥（存储在 `.duplistatus.key` 中）
- 会话已失效（已创建受 CSRF 保护的新会话）
- 密码已使用新系统加密

#### 您必须执行的操作 {#what-you-must-do-1}

1. 如果您自定义了通知模板，请**更新通知模板**：
   - 将 `{backup_interval_value}` 和 `{backup_interval_type}` 替换为 `{backup_interval}`
   - 默认模板会自动更新

#### 安全说明 {#security-notes}

- 确保 `.duplistatus.key` 文件已备份（具有 0400 权限）
- 会话在 24 小时后过期

### 升级到版本 0.7.x {#upgrading-to-version-07x}

#### 自动更改的内容 {#what-changes-automatically-2}

- `machines` 表已重命名为 `servers`
- `machine_id` 字段已重命名为 `server_id`
- 添加了新字段：`alias`、`notes`、`created_at`、`updated_at`

#### 您必须执行的操作 {#what-you-must-do-2}

1. **更新外部 API 集成**：
   - 在 `/api/summary` 中将 `totalMachines` 更改为 `totalServers`
   - 在 API 响应对象中将 `machine` 更改为 `server`
   - 在 `/api/lastbackups/{serverId}` 中将 `backup_types_count` 更改为 `backup_jobs_count`
   - 将端点路径从 `/api/machines/...` 更新为 `/api/servers/...`
2. **更新通知模板**：
   - 将 `{machine_name}` 替换为 `{server_name}`

有关详细的 API 迁移步骤，请参阅 [不兼容的 API 更改](api-changes.md)。

## 迁移后检查清单 {#post-migration-checklist}

升级后，请验证：

- [ ] 所有服务器在仪表板中正确显示
- [ ] 备份历史记录完整且可访问
- [ ] 通知功能正常（测试NTFY/电子邮件）
- [ ] 外部API集成正常（如果适用）
- [ ] 设置可访问且正确
- [ ] 备份监控正常工作
- [ ] 登录成功（0.9.x+）
- [ ] 更改默认管理员密码（0.9.x+）
- [ ] 为其他用户创建用户账户（0.9.x+）
- [ ] 更新外部API集成的身份验证（0.9.x+）

## 故障排除 {#troubleshooting}

### 迁移失败 {#migration-fails}

1. 检查磁盘空间（备份需要空间）
2. 验证数据目录的写入权限
3. 查看容器日志以获取特定的错误信息
4. 如果需要，从备份中恢复（请参阅下面的回滚）

### 迁移后数据丢失 {#data-missing-after-migration}

1. 验证备份是否创建（检查数据目录）
2. 查看容器日志以获取备份创建消息
3. 检查数据库文件的完整性

### 身份验证问题（0.9.x+） {#authentication-issues-09x}

1. 验证默认管理员账户是否存在（检查日志）
2. 尝试默认凭据： `admin` / `Duplistatus09`
3. 如果被锁定，使用管理员恢复工具
4. 验证 `users` 表是否存在于数据库中

### API错误 {#api-errors}

1. 查看 [向后不兼容的API更改](api-changes.md) 以获取端点更新
2. 更新外部集成以使用新的字段名称
3. 向API请求添加身份验证（0.9.x+）
4. 迁移后测试API端点

### 主密钥问题（0.8.x+） {#master-key-issues-08x}

1. 确保 `.duplistatus.key` 文件可访问
2. 验证文件权限为0400
3. 查看容器日志以获取密钥生成错误

### Podman DNS配置 {#podman-dns-configuration}

如果您使用Podman并在升级后遇到网络连接问题，您可能需要为容器配置DNS设置。请参阅安装指南中的 [DNS配置部分](../installation/installation.md#configuring-dns-for-podman-containers) 以获取详细信息。

## 回滚程序 {#rollback-procedure}

如果您需要回滚到以前的版本：

1. **停止容器**： `docker stop <container-name>` （或 `podman stop <container-name>`）
2. **找到您的备份**： 
   - 如果您使用Web界面创建了备份（版本1.2.1+），请使用下载的备份文件
   - 如果您创建了手动卷备份，请先提取它
   - 自动迁移备份位于数据目录中（带有时间戳的 `.db` 文件）
3. **恢复数据库**: 
   - **对于 Web 界面备份（版本 1.2.1+）**: 使用 `Settings → Database Maintenance` 中的恢复功能（参见 [数据库维护](../user-guide/settings/database-maintenance.md#database-restore))
   - **对于手动备份**: 用备份文件替换数据目录/卷中的 `backups.db`
4. **使用前一版本的镜像**: 拉取并运行前一容器镜像
5. **启动容器**: 使用前一版本启动

:::warning
如果新schema与旧版本不兼容，回滚可能会导致数据丢失。尝试回滚之前，请确保您有最近的备份。
:::

### 故障排除：恢复/回滚 {#troubleshooting-your-restore--rollback}

如果应用程序在恢复或回滚后无法启动，或者数据未出现，请检查以下常见问题:

#### 1. 数据库文件权限（Linux/Podman） {#1-database-file-permissions-linuxpodman}

如果您以 `root` 用户身份恢复了文件，容器内的应用程序可能没有读取或写入该文件的权限。

* **症状：** 日志显示 "权限被拒绝" 或 "只读数据库。"
* **解决方法：** 重置容器内文件的权限，以确保其可访问。

```bash
# Set ownership (usually UID 1000 or the app user)
docker exec -u 0 duplistatus chown 1000:1000 /app/data/backups.db
# Set read/write permissions
docker exec -u 0 duplistatus chmod 664 /app/data/backups.db
```

#### 2. 文件名不正确 {#2-incorrect-filename}

应用程序特意寻找名为 `backups.db` 的文件。

* **症状：** 应用程序启动，但看起来 "空"（像新安装一样）。
* **解决方法：** 检查 `/app/data/` 目录。如果您的文件名为 `duplistatus-backup-2024.db` 或具有 `.sqlite` 扩展名，应用程序将忽略它。使用 `mv` 命令或 Docker Desktop GUI 将其重命名为 `backups.db`。

#### 3. 容器未重启 {#3-container-not-restarted}

在某些系统上，容器运行时使用 `docker cp` 可能不会立即 "刷新" 应用程序与数据库的连接。

* **解决方法：** 恢复后始终执行完全重启:

```bash
docker restart duplistatus
```

#### 4. 数据库版本不匹配 {#4-database-version-mismatch}

如果您将来自 duplistatus 新版本的备份恢复到应用程序的旧版本中，数据库 schema 可能不兼容。

* **解决方法：** 确保您运行的 duplistatus 镜像版本与创建备份的版本相同或更新。使用以下命令检查您的版本:

```bash
docker inspect duplistatus --format '{{.Config.Image}}'
```

## 数据库 Schema 版本 {#database-schema-versions}

| 应用程序版本        | Schema 版本 | 关键更改                                        |
|----------------------------|----------------|----------------------------------------------------|
| 0.6.x 及更早          | v1.0           | 初始 schema                                     |
| 0.7.x                      | v2.0, v3.0     | 添加配置，重命名机器 → 服务器   |
| 0.8.x                      | v3.1           | 增强备份字段，支持加密                         |
| 0.9.x, 1.0.x, 1.1.x, 1.2.x, 1.3.x | v4.0           | 用户访问控制，身份验证，审计日志 |

## 获取帮助 {#getting-help}

- **文档**: [用户指南](../user-guide/overview.md)
- **API 参考**: [API 文档](../api-reference/overview.md)
- **API 变更**: [不向后兼容的 API 变更](api-changes.md)
- **版本说明**: 检查版本特定的版本说明以获取详细的变更
- **社区**: [GitHub 讨论](https://github.com/wsj-br/duplistatus/discussions)
- **问题**: [GitHub 问题](https://github.com/wsj-br/duplistatus/issues)
