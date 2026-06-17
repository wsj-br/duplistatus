# 迁移指南 {#migration-guide}

本指南说明如何在 duplistatus 各版本之间升级。迁移是自动的——启动新版本时数据库架构会自动更新。

仅当您自定义了通知模板（0.8.x 版本更改了模板变量）或需要更新的外部 API 集成（0.7.x 更改了 API 字段名，0.9.x 需要身份验证）时，才需要手动步骤。

## 概览 {#overview}

duplistatus 在升级时会自动迁移数据库架构。系统会：

1. 在更改前创建数据库备份
2. 将数据库架构更新到最新版本
3. 保留所有现有数据（服务器、备份、配置）
4. 验证迁移是否成功完成



## 迁移前备份数据库 {#backing-up-your-database-before-migration}

升级到新版本前，建议创建数据库备份。这样在迁移过程中出现问题时可恢复数据。

### 若运行版本 1.2.1 或更高 {#if-youre-running-version-121-or-later}

使用内置数据库备份功能：

1. 在 Web 界面中进入[设置 → 数据库维护](../user-guide/settings/database-maintenance.md)
2. 在 **Database Backup** 部分选择备份格式：
   - **Database File (.db)**：二进制格式 — 最快，完整保留数据库结构
   - **SQL Dump (.sql)**：文本格式 — 人类可读的 SQL 语句
3. 点击 **Download Backup**
4. 备份文件将下载到您的计算机，文件名带时间戳

更多详情请参阅[数据库维护](../user-guide/settings/database-maintenance.md#database-backup)文档。

### 若运行 1.2.1 之前的版本 {#if-youre-running-a-version-before-121}

#### 备份 {#backup}

继续前必须手动备份数据库。数据库文件位于容器内 `/app/data/backups.db`。

##### Linux 用户 {#for-linux-users}
若在 Linux 上，无需启动辅助容器。可使用原生 `cp` 命令直接从运行中的容器提取数据库到主机。

###### 使用 Docker 或 Podman： {#using-docker-or-podman}

```bash
# Replace 'duplistatus' with your actual container name if different
docker cp duplistatus:/app/data/backups.db ./duplistatus-backup-$(date +%Y%m%d).db
```
（若使用 Podman，将上述命令中的 `docker` 替换为 `podman` 即可。）

##### Windows 用户 {#for-windows-users}
若在 Windows 上使用 Docker Desktop，有两种简单方式，无需命令行：

###### 选项 A：使用 Docker Desktop（最简单） {#option-a-use-docker-desktop-easiest}
1. 打开 Docker Desktop 仪表板。
2. 进入 Containers 选项卡，点击 duplistatus 容器。
3. 点击 Files 选项卡。
4. 导航至 `/app/data/`。
5. 右键点击 `backups.db`，选择 **Save as...** 下载到 Windows 文件夹。

###### 选项 B：使用 PowerShell {#option-b-use-powershell}
若偏好终端，可用 PowerShell 将文件复制到桌面：

```powershell
docker cp duplistatus:/app/data/backups.db $HOME\Desktop\duplistatus-backup.db
```

##### 若使用绑定挂载 {#if-you-use-bind-mounts}
若最初使用绑定挂载设置容器（例如将本地文件夹 `/opt/duplistatus` 映射到容器），则无需 Docker 命令。直接用文件管理器复制文件即可：
- Linux：`cp /path/to/your/folder/backups.db ~/backups.db`
- Windows：在 **文件资源管理器** 中从设置时指定的文件夹复制文件。


#### 恢复数据 {#restoring-your-data}
若需从先前备份恢复数据库，请根据操作系统按以下步骤操作。

:::info[IMPORTANT] 
恢复数据库前请停止容器，以防文件损坏。
:::

##### Linux 用户 {#for-linux-users-1}
最简单的恢复方式是将备份文件「推送」回容器内部存储路径。

###### 使用 Docker 或 Podman： {#using-docker-or-podman-1}

```bash
# stop the container
docker stop duplistatus

# Replace 'duplistatus-backup.db' with your actual backup filename
docker cp ./duplistatus-backup.db duplistatus:/app/data/backups.db

# Restart the container
docker start duplistatus
```

##### Windows 用户 {#for-windows-users-1}
若使用 Docker Desktop，可通过 GUI 或 PowerShell 恢复。

###### 选项 A：使用 Docker Desktop（GUI） {#option-a-use-docker-desktop-gui}
1. 确保 duplistatus 容器处于运行状态（Docker Desktop 需要通过 GUI 上传文件时容器须处于活动状态）。
2. 在容器设置中进入 Files 选项卡。
3. 导航至 `/app/data/`。
4. 右键点击现有 backups.db 并选择 Delete。
5. 点击 Import 按钮（或在文件夹区域右键），从计算机选择备份文件。

若导入的文件名带时间戳，请将其重命名为 exactly `backups.db`。

重启容器。

###### 选项 B：使用 PowerShell {#option-b-use-powershell-1}

```powershell
# Copy the file from your Desktop back into the container
docker cp $HOME\Desktop\duplistatus-backup.db duplistatus:/app/data/backups.db

# Restart the container
docker start duplistatus
```


##### 若使用绑定挂载 {#if-you-use-bind-mounts-1}
若使用映射到容器的本地文件夹，无需特殊命令。

1. 停止容器。
2. 手动将备份文件复制到映射文件夹（例如 `/opt/duplistatus` 或 `C:\duplistatus_data`）。
3. 确保文件名为 exactly `backups.db`。
4. 启动容器。


:::note
若手动恢复数据库，可能遇到权限错误。

请检查容器日志并在必要时调整权限。更多信息请参阅下方[故障排除](#troubleshooting-your-restore--rollback)部分。
::: 

## 自动迁移流程 {#automatic-migration-process}

启动新版本时，迁移会自动运行：

1. **创建备份**：在数据目录中创建带时间戳的备份
2. **架构更新**：按需更新数据库表和字段
3. **数据迁移**：保留并迁移所有现有数据
4. **验证**：记录迁移成功信息

### 监控迁移 {#monitoring-migration}

检查 Docker 日志以监控迁移进度：

```bash
docker logs <container-name>
```

查找类似以下消息：
- `"Found X pending migrations"`
- `"Running consolidated migration X.0..."`
- `"Migration X.0 completed successfully"`
- `"Database backup created: /path/to/backups-copy-YYYY-MM-DDTHH-MM-SS.db"`
- `"All migrations completed successfully"`

## 各版本迁移说明 {#version-specific-migration-notes}

### 升级到 0.9.x 或更高（架构 v4.0） {#upgrading-to-version-09x-or-later-schema-v40}

:::warning
**现在需要身份验证。** 升级后所有用户必须登录。
:::

#### 自动变更 {#what-changes-automatically}

- 数据库架构从 v3.1 迁移到 v4.0
- 创建新表：`users`、`sessions`、`audit_log`
- 自动创建默认管理员账户
- 所有现有会话失效

#### 您必须执行的操作 {#what-you-must-do}

1. **登录**默认管理员凭据：
   - 用户名：`admin`
   - 密码：`Duplistatus09`
2. **更改密码**（首次登录时提示，必须执行）
3. **创建用户账户**供其他用户使用（设置 → 用户）
4. **更新外部 API 集成**以包含身份验证（见[不向后兼容的 API 变更](api-changes.md)）
5. **配置审计日志保留**（如需要）（设置 → 审计日志）

#### 若被锁定 {#if-youre-locked-out}

使用管理员恢复工具：

```bash
docker exec -it duplistatus /app/admin-recovery admin NewPassword123
```

详情见[管理员恢复指南](../user-guide/admin-recovery.md)。

### 升级到 0.8.x {#upgrading-to-version-08x}

#### 自动变更 {#what-changes-automatically-1}

- 数据库架构更新到 v3.1
- 生成加密主密钥（存储在 `.duplistatus.key`）
- 会话失效（创建新的 CSRF 保护会话）
- 使用新系统加密密码

#### 您必须执行的操作 {#what-you-must-do-1}

1. **更新通知模板**（若已自定义）：
   - 将 `{backup_interval_value}` 和 `{backup_interval_type}` 替换为 `{backup_interval}`
   - 默认模板会自动更新

#### 安全说明 {#security-notes}

- 确保备份 `.duplistatus.key` 文件（权限为 0400）
- 会话 24 小时后过期

### 升级到 0.7.x {#upgrading-to-version-07x}

#### 自动变更 {#what-changes-automatically-2}

- `machines` 表重命名为 `servers`
- `machine_id` 字段重命名为 `server_id`
- 新增字段：`alias`、`notes`、`created_at`、`updated_at`

#### 您必须执行的操作 {#what-you-must-do-2}

1. **更新外部 API 集成**：
   - 在 `/api/summary` 中将 `totalMachines` 改为 `totalServers`
   - 在 API 响应对象中将 `machine` 改为 `server`
   - 在 `/api/lastbackups/{serverId}` 中将 `backup_types_count` 改为 `backup_jobs_count`
   - 将端点路径从 `/api/machines/...` 更新为 `/api/servers/...`
2. **更新通知模板**：
   - 将 `{machine_name}` 替换为 `{server_name}`

详细 API 迁移步骤见[不向后兼容的 API 变更](api-changes.md)。

## 迁移后检查清单 {#post-migration-checklist}

升级后请验证：

- [ ] 仪表板中所有服务器显示正确
- [ ] 备份历史完整且可访问
- [ ] 通知正常工作（测试 NTFY/邮件）
- [ ] 外部 API 集成正常（如适用）
- [ ] 设置可访问且正确
- [ ] 备份监控正常工作
- [ ] 成功登录（0.9.x+）
- [ ] 已更改默认管理员密码（0.9.x+）
- [ ] 已为其他用户创建账户（0.9.x+）
- [ ] 已更新外部 API 集成的身份验证（0.9.x+）

## 故障排除 {#troubleshooting}

### 迁移失败 {#migration-fails}

1. 检查磁盘空间（备份需要空间）
2. 验证数据目录写权限
3. 查看容器日志中的具体错误
4. 如需要，从备份恢复（见下方回滚）

### 迁移后数据缺失 {#data-missing-after-migration}

1. 验证是否创建了备份（检查数据目录）
2. 查看容器日志中的备份创建消息
3. 检查数据库文件完整性

### 身份验证问题（0.9.x+） {#authentication-issues-09x}

1. 验证默认管理员账户是否存在（检查日志）
2. 尝试默认凭据：`admin` / `Duplistatus09`
3. 若被锁定，使用管理员恢复工具
4. 验证数据库中是否存在 `users` 表

### API 错误 {#api-errors}

1. 查阅[不向后兼容的 API 变更](api-changes.md)了解端点更新
2. 使用新字段名更新外部集成
3. 为 API 请求添加身份验证（0.9.x+）
4. 迁移后测试 API 端点

### 主密钥问题（0.8.x+） {#master-key-issues-08x}

1. 确保 `.duplistatus.key` 文件可访问
2. 验证文件权限为 0400
3. 检查容器日志中的密钥生成错误

### Podman DNS 配置 {#podman-dns-configuration}

若使用 Podman 且升级后出现网络连接问题，可能需要为容器配置 DNS 设置。详见安装指南中的 [DNS 配置部分](../installation/installation.md#configuring-dns-for-podman-containers)。

## 回滚流程 {#rollback-procedure}

若需回滚到先前版本：

1. **停止容器**：`docker stop <container-name>`（或 `podman stop <container-name>`）
2. **查找备份**：
   - 若使用 Web 界面创建备份（1.2.1+），使用该下载的备份文件
   - 若创建了手动卷备份，先解压
   - 自动迁移备份位于数据目录（带时间戳的 `.db` 文件）
3. **恢复数据库**：
   - **Web 界面备份（1.2.1+）**：使用 `设置 → 数据库维护` 中的恢复功能（见[数据库维护](../user-guide/settings/database-maintenance.md#database-restore)）
   - **手动备份**：用备份文件替换数据目录/卷中的 `backups.db`
4. **使用先前镜像版本**：拉取并运行先前的容器镜像
5. **启动容器**：使用先前版本启动

:::warning
回滚可能导致数据丢失，若较新架构与旧版本不兼容。尝试回滚前请确保有最新备份。
:::

### 恢复/回滚故障排除 {#troubleshooting-your-restore--rollback}

若恢复或回滚后应用程序无法启动或数据未显示，请检查以下常见问题：

#### 1. 数据库文件权限（Linux/Podman） {#1-database-file-permissions-linuxpodman}

若以 `root` 用户恢复文件，容器内应用程序可能无法读写。

* **症状：** 日志显示「Permission Denied」或「Read-only database」。
* **修复：** 重置容器内文件权限以确保可访问。

```bash
# Set ownership (usually UID 1000 or the app user)
docker exec -u 0 duplistatus chown 1000:1000 /app/data/backups.db
# Set read/write permissions
docker exec -u 0 duplistatus chmod 664 /app/data/backups.db
```



#### 2. 文件名不正确 {#2-incorrect-filename}

应用程序专门查找名为 `backups.db` 的文件。

* **症状：** 应用程序启动但显示「空白」（如同全新安装）。
* **修复：** 检查 `/app/data/` 目录。若文件名为 `duplistatus-backup-2024.db` 或扩展名为 `.sqlite`，应用程序会忽略。使用 `mv` 命令或 Docker Desktop GUI 将其重命名为 exactly `backups.db`。

#### 3. 容器未重启 {#3-container-not-restarted}

在某些系统上，容器运行时执行 `docker cp` 可能不会立即「刷新」应用程序与数据库的连接。

* **修复：** 恢复后务必完整重启：
```bash
docker restart duplistatus
```



#### 4. 数据库版本不匹配 {#4-database-version-mismatch}

若将较新版本 duplistatus 的备份恢复到较旧版本应用程序，数据库架构可能不兼容。

* **修复：** 确保运行的 duplistatus 镜像版本与创建备份的版本相同或更新。使用以下命令检查版本：
```bash
docker inspect duplistatus --format '{{.Config.Image}}'
```


## 数据库架构版本 {#database-schema-versions}

| 应用程序版本        | 架构版本 | 主要变更                                        |
|----------------------------|----------------|----------------------------------------------------|
| 0.6.x 及更早          | v1.0           | 初始架构                                     |
| 0.7.x                      | v2.0, v3.0     | 新增配置，machines → servers 重命名   |
| 0.8.x                      | v3.1           | 增强备份字段，加密支持         |
| 0.9.x, 1.0.x, 1.1.x, 1.2.x, 1.3.x | v4.0           | 用户访问控制、身份验证、审计日志 |

## 获取帮助 {#getting-help}

- **文档**：[用户指南](../user-guide/overview.md)
- **API 参考**：[API 文档](../api-reference/overview.md)
- **API 变更**：[不向后兼容的 API 变更](api-changes.md)
- **发行说明**：查阅各版本发行说明了解详细变更
- **社区**：[GitHub Discussions](https://github.com/wsj-br/duplistatus/discussions)
- **Issues**：[GitHub Issues](https://github.com/wsj-br/duplistatus/issues)
