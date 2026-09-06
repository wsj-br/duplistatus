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

- **检查 Duplicati 配置**：确认 Duplicati 已正确配置为向 **duplistatus** 发送 JSON。在 Duplicati 2.0.9.106 及更高版本上，使用 `--send-http-json-urls` 指向 `/api/upload`。在旧版 Duplicati 上，使用 `--send-http-url` 与 `--send-http-result-output-format=Json`。请参阅 [Duplicati 服务器配置](../installation/duplicati-server-configuration.md)。
- **检查网络连接**：确保 Duplicati 服务器能够连接到 **duplistatus** 服务器。确认端口是否正确（默认：`9666`）。
- **HTTP 401**：需要 API 密钥，且上传 URL 缺少有效的 upload-scope 密钥。按照 [API 密钥](settings/api-keys-settings.md) 中的说明添加 `?api_key=`。
- **HTTP 403**：密钥范围错误（读取密钥无法上传），或 Duplicati 主机不在 [外部 API IP 白名单](settings/ip-allowlist-settings.md) 上。
- **HTTP 413**：JSON 报告大小超过上传大小限制（默认 5 MB）。降低 `--send-http-max-log-lines` 或在设置 → API 密钥中提高限制。
- **HTTP 429**：超过每 IP 上传速率限制。等待 `Retry-After`，或如果许多作业同时完成，则提高限制。
- **查看 Duplicati 日志**：在 Duplicati 日志中检查 HTTP 请求错误。
- **双重报告**：如果您还向 [Duplicati 监控](https://www.duplicati-monitoring.com/) 发送表单报告，该服务的失败或 HTTP 500 可能会阻止 Duplicati 向 **duplistatus** 发送 JSON 报告。表单 URL 会首先发送。请参阅 [向 duplistatus 和 Duplicati 监控报告](../installation/duplicati-server-configuration.md#reporting-to-duplistatus-and-duplicati-monitoring)。

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

- **检查 Duplicati 配置**：确保 `send-http-log-level=Information` 和 `send-http-max-log-lines=500` 在 Duplicati 的高级选项中配置。Duplicati 会保留前 N 行日志。如果版本列表仍然缺失，请提高上限或在不向 Duplicati 监控发送报告时使用 `0`。版本 **计数** 仍然可以从 JSON 统计中显示，即使详细列表缺失。请参阅 [日志行和可用版本](../installation/duplicati-server-configuration.md#log-lines-and-available-versions)。

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

- 在 **Duplicati 2.4 及更高版本**上，`/api/v1/systeminfo` 列出 `machine-id`，默认值为空。**duplistatus** 从 Duplicati 服务器设置中读取配置的 id。如果仍然无法识别服务器，请设置 **Duplicati → 设置 → 高级选项 → 机器 ID** 并重试。

### 从早期版本升级（在 0.9.x 之前）并且无法登录 {#upgrade-from-an-earlier-version-before-09x-and-cant-login}

**duplistatus** 从版本 0.9.x 开始需要用户身份验证。默认 `admin` 账户在安装应用程序或从早期版本升级时自动创建：
    - 用户名：`admin`
    - 密码：`Duplistatus09`

您可以在 [设置 > 用户](settings/user-management-settings.md) 中创建其他用户账户，在第一次登录后。

### 管理员密码丢失或被锁定 {#lost-admin-password-or-locked-out}

如果您丢失了管理员密码或被锁定在账户之外（您仍然可以打开`/login`）：

- **使用管理员恢复脚本**：请参阅 [管理员账户恢复](admin-recovery.md) 指南以获取在 Docker 环境中恢复管理员访问权限的说明。
- **验证容器访问**：确保您具有 Docker 执行访问容器以运行恢复脚本的权限。

如果浏览器在登录前显示**Access denied**（HTTP 403），则这是一个[IP白名单锁定](#locked-out-by-ip-allowlist)，而不是忘记密码。管理员恢复脚本无法绕过它。

### IP白名单锁定{#locked-out-by-ip-allowlist}

如果设置→[IP白名单](settings/ip-allowlist-settings.md)已启用但CIDR缺失或错误，代理会在身份验证之前拒绝请求。典型症状：

- 页面（`/`、`/login`、`/settings`、…）返回纯文本**Access denied**（HTTP 403）。
- 会话和管理员API返回JSON `{ "errorCode": "IP_NOT_ALLOWED" }`。
- `/api/health`和`/api/ping`仍然响应（它们是豁免的）。登录cookie无助。

保存路径试图防止这种情况：您无法启用**admin**列表，除非您当前的IP已经在CIDR中（除非从回环中保存）。您仍然可以通过使用现在匹配但以后不匹配的CIDR（VPN、DHCP、另一个网络）、误配置受信任的代理或从`127.0.0.1` / `::1`启用列表而不添加该地址来锁定自己。

环境变量会覆盖数据库，因此您可以在没有UI的情况下恢复。它们不会重写设置；需要重新启动，以便进程获取它们。

**禁用管理员列表**（通常恢复）：

```bash
ADMIN_IP_ALLOWLIST_ENABLED=false
```

**或者保持启用状态并注入包含当前IP的CIDR：**

```bash
ADMIN_IP_ALLOWLIST=203.0.113.10/32
```

然后重新启动应用程序：

- **Docker Compose**：在`docker-compose.yml`中的`environment`下设置相同的键（文件包含注释示例），然后重新创建应用容器。`docker exec`不会更改正在运行的容器的环境变量。
- **本地/系统**：在服务环境中导出变量并重新启动Next.js进程（不仅仅是cron服务）。

当您可以再次打开UI后：

1. 登录并修复设置→IP白名单中的CIDR和受信任的代理。
2. 删除环境覆盖，以便设置再次成为真相的来源。

**外部API**白名单（`/api/upload`、`/api/summary`、`/api/lastbackup*`）不会锁定仪表板。以相同的方式使用`EXTERNAL_API_IP_ALLOWLIST_ENABLED=false`或`EXTERNAL_API_IP_ALLOWLIST`恢复它。如果在启用该列表后Duplicati上传失败并显示HTTP 403，请参阅[新备份不显示](#new-backups-not-showing)。受信任的代理恢复使用`IP_TRUSTED_PROXIES`（非空值也意味着信任代理）。

请参阅[IP白名单](settings/ip-allowlist-settings.md#environment-overrides)和[环境变量](../installation/environment-variables.md)。

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
