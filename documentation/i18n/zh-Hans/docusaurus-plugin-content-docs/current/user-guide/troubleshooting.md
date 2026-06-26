# 故障排除 {#troubleshooting}

### 仪表盘未加载 {#dashboard-not-loading}
- 检查容器是否正在运行: `docker ps`
- 验证端口 9666 是否可访问
- 检查容器日志: `docker logs duplistatus`

### 无备份数据 {#no-backup-data}
- 验证 Duplicati 服务器配置
- 检查服务器之间的网络连接
- 查看 duplistatus 日志以查找错误
- 确保备份作业正在运行

### 通知不工作 {#notifications-not-working}
- 检查通知配置
- 验证 NTFY 服务器连接（如果使用 NTFY）
- 测试通知设置
- 检查通知日志

### 新备份未显示 {#new-backups-not-showing}

如果您看到 Duplicati 服务器警告，如 `HTTP Response request failed for:` 和 `Failed to send message: System.Net.Http.HttpRequestException:`，且新备份不出现在仪表盘或备份历史记录中:

- **检查 Duplicati 配置**: 确认 Duplicati 配置正确以向 **duplistatus** 发送数据。验证 Duplicati 中的 HTTP URL 设置。
- **检查网络连接**: 确保 Duplicati 服务器可以连接到 **duplistatus** 服务器。确认端口正确（默认：`9666`）。
- **查看 Duplicati 日志**: 在 Duplicati 日志中检查 HTTP 请求错误。

### 仪表盘上的重复服务器 {#duplicate-servers-on-the-dashboard}

如果同一台服务器在仪表板上出现多次，这通常发生在[收集备份日志](collect-backup-logs.md)之后，或者在重新安装或升级 Duplicati 服务器之后。

**原因：**

- **已更改 `machine_id`**：当您重新安装或升级 Duplicati 时，服务器的 `machine_id` 可能会发生变化，**duplistatus** 随后会将其视为一台新服务器。
- **Duplicati API 错误**：在较新版本的 Duplicati 中存在一个错误，某些 API 端点混淆了 `identity` id 和 `machine_id`。这种不一致导致 **duplistatus** 在不同的 ID 下注册同一台服务器，从而产生重复项。

**变通方法：**

1.  在 **Duplicati 服务器**上，执行以下**一项**操作：
    - 编辑 `identity.txt` 和 `machineid.txt` 文件，使这两个文件包含**相同**的 id；或
    - 打开 **Duplicati → 设置 → 高级选项 → Machine-id** 并设置一个值（它会自动填充 —— 只需接受建议的值）。
2.  **重启** Duplicati 服务器以使更改生效。
3.  在 **duplistatus** 中，使用 [设置 → 数据库维护 → 合并重复服务器](settings/database-maintenance.md#merge-duplicate-servers) 合并重复条目。

### 通知不工作（详细） {#notifications-not-working-detailed}

如果通知未被发送或接收:

- **检查 NTFY 配置**: 确保 NTFY URL 和主题正确。使用 **发送测试通知** 按钮进行测试。
- **检查网络连接**: 验证 **duplistatus** 是否可以访问您的 NTFY 服务器。如有必要，查看防火墙设置。
- **检查通知设置**: 确认为相关备份启用了通知。

### 可用版本未显示 {#available-versions-not-appearing}

如果备份版本未显示在仪表盘或详细信息页面上:

- **检查 Duplicati 配置**: 确保 `send-http-log-level=Information` 和 `send-http-max-log-lines=0` 在 Duplicati 的高级选项中配置。

### 过期备份警报不工作 {#overdue-backup-alerts-not-working}

如果过期备份通知未被发送:

- **检查逾期配置**：确认备份监控已为备份启用。验证预期间隔和容忍度设置。
- **检查通知频率**：如果设置为 **一次性**，则仅在每个逾期事件发送一次警报。
- **检查Cron服务**：确保监控逾期备份的Cron服务正常运行。检查应用程序日志以获取错误。验证Cron服务可以在配置的端口（默认：`8667`）访问。

### 收集备份日志不工作 {#collect-backup-logs-not-working}

如果手动备份日志收集失败：

- **检查Duplicati服务器访问**：验证Duplicati服务器主机名和端口正确。确认远程访问在Duplicati中启用。确保身份验证密码正确。
- **检查网络连接**：从 **duplistatus** 到 Duplicati 服务器测试连接。确认 Duplicati 服务器端口可访问（默认：`8200`）。
  例如，如果您使用 Docker，可以使用 `docker exec -it <container-name> /bin/sh` 访问容器的命令行并运行网络工具，如 `ping` 和 `curl`。

    ```bash
    docker exec -it duplistatus /bin/sh
    ping duplicati-server.local
    curl -I http://duplicati-server.local:8200
    ```

还要检查容器内的 DNS 配置（请参阅 [Podman 容器的 DNS 配置](../installation/installation.md#configuring-dns-for-podman-containers) 以获取更多信息）

### 从早期版本升级（在 0.9.x 之前）并且无法登录 {#upgrade-from-an-earlier-version-before-09x-and-cant-login}

**duplistatus** 从版本 0.9.x 开始需要用户身份验证。默认 `admin` 账户在安装应用程序或从早期版本升级时自动创建：
    - 用户名：`admin`
    - 密码：`Duplistatus09`

您可以在 [设置 > 用户](settings/user-management-settings.md) 中创建其他用户账户，在第一次登录后。

### 管理员密码丢失或被锁定 {#lost-admin-password-or-locked-out}

如果您丢失了管理员密码或被锁定出您的账户：

- **使用管理员恢复脚本**：请参阅 [管理员账户恢复](admin-recovery.md) 指南以获取在 Docker 环境中恢复管理员访问权限的说明。
- **验证容器访问**：确保您具有 Docker 执行访问容器以运行恢复脚本的权限。

### 数据库备份和迁移 {#database-backup-and-migration}

当迁移来自以前版本或创建数据库备份时：

**如果您正在运行版本 1.2.1 或更高版本：**
- 使用 [设置 → 数据库维护](user-guide/settings/database-maintenance.md) 中的内置数据库备份功能
- 选择您首选的格式（.db 或 .sql）并单击 **下载备份**
- 备份文件将下载到您的计算机
- 请参阅 [数据库维护](settings/database-maintenance.md#database-backup) 以获取详细说明

**如果您正在运行版本 1.2.1 之前的版本：**
- 您需要手动备份。请参阅 [迁移指南](../migration/version_upgrade.md#backing-up-your-database-before-migration) 以获取更多信息。

如果您仍然遇到问题，请尝试以下步骤：

1.  **检查应用程序日志**：如果使用 Docker，请运行 `docker logs <container-name>` 以查看详细的错误信息。
2.  **验证配置**：在容器管理工具（Docker、Portainer、Podman 等）中双重检查所有配置设置，包括端口、网络和权限。
3.  **验证网络连接**：确认所有网络连接都是稳定的。 
4.  **检查Cron服务**：确保Cron服务与主应用程序一起运行。检查两个服务的日志。
5.  **咨询文档**：请参阅安装指南和自述文件以获取更多信息。
6.  **报告问题**：如果问题仍然存在，请在 [duplistatus GitHub 存储库](https://github.com/wsj-br/duplistatus/issues) 上提交详细问题。

<br/>

# 附加资源 {#additional-resources}

- **安装指南**: [安装指南](../installation/installation.md)
- **Duplicati 文档**: [docs.duplicati.com](https://docs.duplicati.com)
- **API 文档**: [API 参考](../api-reference/overview.md)
- **GitHub 仓库**: [wsj-br/duplistatus](https://github.com/wsj-br/duplistatus)
- **开发指南**: [开发指南](../development/setup.md)
- **数据库架构**: [数据库文档](../development/database)

### 支持 {#support}
- **GitHub 问题**: [报告错误或请求功能](https://github.com/wsj-br/duplistatus/issues)
