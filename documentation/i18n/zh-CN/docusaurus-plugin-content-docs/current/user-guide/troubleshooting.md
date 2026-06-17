# 故障排除 {#troubleshooting}

### 仪表板无法加载 {#dashboard-not-loading}
- 检查容器是否正在运行：`docker ps`
- 验证端口 9666 是否可访问
- 检查容器日志：`docker logs duplistatus`

### 没有备份数据 {#no-backup-data}
- 验证 Duplicati 服务器配置
- 检查服务器之间的网络连接
- 查看 duplistatus 日志中的错误
- 确保备份任务正在运行

### 通知不工作 {#notifications-not-working}
- 检查通知配置
- 验证 NTFY 服务器连接（若使用 NTFY）
- 测试通知设置
- 检查通知日志

### 新备份不显示 {#new-backups-not-showing}

若看到 Duplicati 服务器警告如 `HTTP Response request failed for:` 和 `Failed to send message: System.Net.Http.HttpRequestException:`，且新备份未出现在仪表板或备份历史中：

- **Check Duplicati Configuration**：确认 Duplicati 已正确配置向 **duplistatus** 发送数据。验证 Duplicati 中的 HTTP URL 设置。
- **Check Network Connectivity**：确保 Duplicati 服务器能连接到 **duplistatus** 服务器。确认端口正确（默认：`9666`）。
- **Review Duplicati Logs**：检查 Duplicati 日志中的 HTTP 请求错误。

### 通知不工作（详细） {#notifications-not-working-detailed}

若通知未发送或未收到：

- **Check NTFY Configuration**：确保 NTFY URL 和主题正确。使用 **Send Test Notification** 按钮进行测试。
- **Check Network Connectivity**：验证 **duplistatus** 能否访问您的 NTFY 服务器。如适用，检查防火墙设置。
- **Check Notification Settings**：确认相关备份已启用通知。

### 可用版本不显示 {#available-versions-not-appearing}

若仪表板或详情页未显示备份版本：

- **Check Duplicati Configuration**：确保在 Duplicati 高级选项中配置了 `send-http-log-level=Information` 和 `send-http-max-log-lines=0`。

### 逾期备份告警不工作 {#overdue-backup-alerts-not-working}

若未发送逾期备份通知：

- **Check Overdue Configuration**：确认该备份已启用备份监控。验证预期间隔和宽限期设置。
- **Check Notification Frequency**：若设置为 **One time**，每个逾期事件仅发送一次告警。
- **Check Cron Service**：确保监控逾期备份的 cron 服务正常运行。检查应用程序日志中的错误。验证 cron 服务在配置的端口（默认：`8667`）上可访问。

### 收集备份日志不工作 {#collect-backup-logs-not-working}

若手动备份日志收集失败：

- **Check Duplicati Server Access**：验证 Duplicati 服务器主机名和端口正确。确认 Duplicati 中已启用远程访问。确保认证密码正确。
- **Check Network Connectivity**：测试从 **duplistatus** 到 Duplicati 服务器的连接。确认 Duplicati 服务器端口可访问（默认：`8200`）。
  例如，若使用 Docker，可用 `docker exec -it <container-name> /bin/sh` 进入容器命令行并运行 `ping` 和 `curl` 等网络工具。

    ```bash
    docker exec -it duplistatus /bin/sh
    ping duplicati-server.local
    curl -I http://duplicati-server.local:8200
    ```
  同时检查容器内的 DNS 配置（详见 [Podman 容器的 DNS 配置](../installation/installation.md#configuring-dns-for-podman-containers)）

### 从早期版本（0.9.x 之前）升级后无法登录 {#upgrade-from-an-earlier-version-before-09x-and-cant-login}

**duplistatus** 自 0.9.x 版本起需要用户认证。首次安装或从早期版本升级时会自动创建默认 `admin` 账户：
    - 用户名：`admin`
    - 密码：`Duplistatus09`

首次登录后，可在[设置 > 用户](settings/user-management-settings.md)中创建其他用户账户。

### 丢失管理员密码或被锁定 {#lost-admin-password-or-locked-out}

若丢失管理员密码或被锁定账户：

- **Use Admin Recovery Script**：请参阅 [Admin Account Recovery](admin-recovery.md) 指南，了解在 Docker 环境中恢复管理员访问权限的说明。
- **Verify Container Access**：确保您有 Docker exec 访问权限以运行恢复脚本。

### 数据库备份与迁移 {#database-backup-and-migration}

从先前版本迁移或创建数据库备份时：

**若运行 1.2.1 或更高版本：**
- 使用[设置 → 数据库维护](user-guide/settings/database-maintenance.md)中的内置数据库备份功能
- 选择首选格式（.db 或 .sql）并点击 **Download Backup**
- 备份文件将下载到您的计算机
- 详见[数据库维护](settings/database-maintenance.md#database-backup)

**若运行 1.2.1 之前的版本：**
- 需要手动备份。详见[迁移指南](../migration/version_upgrade.md#backing-up-your-database-before-migration)。

若仍遇到问题，请尝试以下步骤：

1.  **Inspect Application Logs**：若使用 Docker，运行 `docker logs <container-name>` 查看详细错误信息。
2.  **Validate Configuration**：仔细检查容器管理工具（Docker、Portainer、Podman 等）中的所有配置设置，包括端口、网络和权限。
3.  **Verify Network Connectivity**：确认所有网络连接稳定。
4.  **Check Cron Service**：确保 cron 服务与主应用程序一同运行。检查两个服务的日志。
5.  **Consult Documentation**：参阅安装指南和 README 获取更多信息。
6.  **Report Issues**：若问题仍然存在，请在 [duplistatus GitHub 仓库](https://github.com/wsj-br/duplistatus/issues)提交详细 issue。

<br/>

# 其他资源 {#additional-resources}

- **Installation Guide**：[安装指南](../installation/installation.md)
- **Duplicati Documentation**：[docs.duplicati.com](https://docs.duplicati.com)
- **API Documentation**：[API 参考](../api-reference/overview.md)
- **GitHub Repository**：[wsj-br/duplistatus](https://github.com/wsj-br/duplistatus)
- **Development Guide**：[开发指南](../development/setup.md)
- **Database Schema**：[数据库文档](../development/database)

### 支持 {#support}
- **GitHub Issues**：[报告错误或请求功能](https://github.com/wsj-br/duplistatus/issues)
