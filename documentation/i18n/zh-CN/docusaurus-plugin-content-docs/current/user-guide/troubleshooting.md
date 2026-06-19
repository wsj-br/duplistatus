# 故障排除 {#troubleshooting}

### 仪表板无法加载 {#dashboard-not-loading}
- 检查容器是否正在运行：`docker ps`
- 验证端口 9666 是否可访问
- 检查容器日志：`docker logs duplistatus`

### 无备份数据 {#no-backup-data}
- 验证 Duplicati 服务器配置
- 检查服务器之间的网络连接
- 查看 duplistatus 日志以查找错误
- 确保备份任务正在运行

### 通知无法工作 {#notifications-not-working}
- 检查通知配置
- 验证 NTFY 服务器连接（如果使用 NTFY）
- 测试通知设置
- 检查通知日志

### 新备份未显示 {#new-backups-not-showing}

如果您看到类似 `HTTP Response request failed for:` 和 `Failed to send message: System.Net.Http.HttpRequestException:` 的 Duplicati 服务器警告，且新备份未出现在仪表板或备份历史中：

- **检查 Duplicati 配置**：确认 Duplicati 已正确配置以向 **duplistatus** 发送数据。验证 Duplicati 中的 HTTP URL 设置。
- **检查网络连接**：确保 Duplicati 服务器能够连接到 **duplistatus** 服务器。确认端口正确（默认：`9666`）。
- **查看 Duplicati 日志**：检查 Duplicati 日志中是否存在 HTTP 请求错误。

### 仪表板上出现重复服务器 {#duplicate-servers-on-the-dashboard}

如果同一台服务器在仪表板上出现多次：

- **原因**：当您重新安装或升级 Duplicati 时，可能会出现重复项，因为服务器的 `machine_id` 可能会发生变化，随后 **duplistatus** 将其视为新服务器。
- **解决方法**：使用 [设置 → 数据库维护 → 合并重复服务器](settings/database-maintenance.md#merge-duplicate-servers) 将重复条目合并为单个服务器。

### 通知无法工作（详细） {#notifications-not-working-detailed}

如果通知未发送或未接收：

- **检查 NTFY 配置**：确保 NTFY URL 和主题正确。使用 **发送测试通知** 按钮进行测试。
- **检查网络连接**：验证 **duplistatus** 能否访问您的 NTFY 服务器。如果适用，请检查防火墙设置。
- **检查通知设置**：确认相关备份已启用通知。

### 可用版本未出现 {#available-versions-not-appearing}

如果备份版本未在仪表板或详情页显示：

- **检查 Duplicati 配置**：确保在 Duplicati 的高级选项中配置了 `send-http-log-level=Information` 和 `send-http-max-log-lines=0`。

### 逾期备份警报无法工作 {#overdue-backup-alerts-not-working}

如果逾期备份通知未发送：

- **检查逾期配置**：确认该备份已启用备份监控。验证预期间隔和容差设置。
- **检查通知频率**：如果设置为**一次**，则每个逾期事件仅发送一次警报。
- **检查 Cron 服务**：确保监控逾期备份的 cron 服务运行正常。检查应用程序日志是否有错误。验证可通过配置的端口（默认：`8667`）访问 cron 服务。

### 采集备份日志不起作用 {#collect-backup-logs-not-working}

如果手动采集备份日志失败：

- **检查 Duplicati 服务器访问**：验证 Duplicati 服务器主机名和端口是否正确。确认 Duplicati 中已启用远程访问。确保身份验证密码正确。
- **检查网络连接**：测试从 **duplistatus** 到 Duplicati 服务器的连接。确认 Duplicati 服务器端口可访问（默认：`8200`）。
  例如，如果您使用的是 Docker，可以使用 `docker exec -it <container-name> /bin/sh` 访问容器的命令行并运行 `ping` 和 `curl` 等网络工具。

    ```bash
    docker exec -it duplistatus /bin/sh
    ping duplicati-server.local
    curl -I http://duplicati-server.local:8200
    ```

同时检查容器内部的 DNS 配置（详见 [Podman 容器的 DNS 配置](../installation/installation.md#configuring-dns-for-podman-containers))

### 从早期版本（0.9.x 之前）升级后无法登录 {#upgrade-from-an-earlier-version-before-09x-and-cant-login}

**duplistatus** 从 0.9.x 版本开始需要用户认证。首次安装或从早期版本升级时，会自动创建一个默认的 `admin` 账户：
    - 用户名：`admin`
    - 密码：`Duplistatus09`

您可以在首次登录后在 [设置 > 用户](settings/user-management-settings.md) 中创建额外的用户账户。

### 丢失管理员密码或被锁定 {#lost-admin-password-or-locked-out}

如果您丢失了管理员密码或账户被锁定：

- **使用管理员恢复脚本**：请参阅 [管理员账户恢复](admin-recovery.md) 指南，了解在 Docker 环境中恢复管理员访问权限的说明。
- **验证容器访问权限**：确保您拥有对容器的 Docker exec 访问权限，以便运行恢复脚本。

### 数据库备份和迁移 {#database-backup-and-migration}

从之前的版本迁移或创建数据库备份时：

**如果您运行的是 1.2.1 或更高版本：**
- 使用 [设置 → 数据库维护](user-guide/settings/database-maintenance.md) 中的内置数据库备份功能
- 选择您偏好的格式 (.db 或 .sql) 并点击 **下载备份**
- 备份文件将下载到您的计算机
- 详细说明请参阅 [数据库维护](settings/database-maintenance.md#database-backup)

**如果您运行的是 1.2.1 之前的版本：**
- 您需要手动备份。请参阅 [迁移指南](../migration/version_upgrade.md#backing-up-your-database-before-migration) 了解更多信息。

如果您仍然遇到问题，请尝试以下步骤：

1.  **检查应用程序日志**：如果使用 Docker，请运行 `docker logs <container-name>` 以查看详细的错误信息。
2.  **验证配置**：仔细检查容器管理工具（Docker、Portainer、Podman 等）中的所有配置设置，包括端口、网络和权限。
3.  **验证网络连接**：确认所有网络连接稳定。
4.  **检查 Cron 服务**：确保 cron 服务与主应用程序一起运行。检查这两个服务的日志。
5.  **查阅文档**：参考安装指南和 README 了解更多信息。
6.  **报告问题**：如果问题仍然存在，请在 [duplistatus GitHub 仓库](https://github.com/wsj-br/duplistatus/issues) 上提交详细的问题报告。

<br/>

# 附加资源 {#additional-resources}

- **安装指南**：[安装指南](../installation/installation.md)
- **Duplicati 文档**：[docs.duplicati.com](https://docs.duplicati.com)
- **API 文档**：[API 参考](../api-reference/overview.md)
- **GitHub 仓库**：[wsj-br/duplistatus](https://github.com/wsj-br/duplistatus)
- **开发指南**: [开发指南](../development/setup.md)
- **数据库架构**: [数据库文档](../development/database)

### 支持 {#support}
- **GitHub Issues**: [报告 Bug 或请求功能](https://github.com/wsj-br/duplistatus/issues)
