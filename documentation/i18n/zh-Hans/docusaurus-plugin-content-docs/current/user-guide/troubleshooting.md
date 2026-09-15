# 故障排除 {/* #troubleshooting */}

### 仪表板未加载 {/* #dashboard-not-loading */}
- 检查容器是否正在运行：`docker ps`
- 验证端口 9666 是否可访问
- 检查容器日志：`docker logs duplistatus`
- 如果您正在使用反向代理，请检查反向代理日志中的错误
- 如果您正在使用 IP 白名单，请检查 IP 白名单日志中的错误

### 没有备份数据 {/* #no-backup-data */}
- 验证 Duplicati 服务器配置
- 检查服务器之间的网络连接
- 查看 duplistatus 日志中的错误
- 确保备份作业正在运行
- 如果使用 API 密钥，请确保 API 密钥正确，范围正确且未过期（读取密钥无法上传）

### 通知未工作 {/* #notifications-not-working */}
- 检查通知配置
- 验证 NTFY 服务器连接（如果使用 NTFY）
- 测试通知设置
- 检查通知日志

### 新备份未显示 {/* #new-backups-not-showing */}

如果您看到 Duplicati 服务器警告，如 `HTTP Response request failed for:` 和 `Failed to send message: System.Net.Http.HttpRequestException:`，并且新备份未出现在仪表板或备份历史中：

- **检查 Duplicati 配置**：确认 Duplicati 配置正确以向 **duplistatus** 发送 JSON。在 Duplicati 2.0.9.106 及更高版本中，使用 `--send-http-json-urls` 指向 `/api/upload`。在旧版 Duplicati 中，使用 `--send-http-url` 与 `--send-http-result-output-format=Json`。请参阅 [Duplicati 服务器配置](../installation/duplicati-server-configuration.md)。
- **检查网络连接**：确保 Duplicati 服务器可以连接到 **duplistatus** 服务器。确认端口正确（默认：`9666`）。
- **HTTP 401**：需要 API 密钥，且上传 URL 缺少有效的上传范围密钥。按照 [API 密钥](settings/api-keys-settings.md) 中的说明添加 `?api_key=`。
- **HTTP 403**：密钥范围错误（读取密钥无法上传），或 Duplicati 主机不在 [外部 API IP 白名单](settings/ip-allowlist-settings.md) 上。
- **HTTP 413**：JSON 报告大于上传大小限制（默认 5 MB）。降低 `--send-http-max-log-lines` 或在设置 → API 密钥中提高限制。
- **HTTP 429**：超过每 IP 上传速率限制。等待 `Retry-After`，或如果许多作业同时完成，则提高限制。
- **查看 Duplicati 日志**：在 Duplicati 日志中检查 HTTP 请求错误。
- **双重报告**：如果您还将表单报告发送到 [Duplicati 监控](https://www.duplicati-monitoring.com/)，该服务的故障或 HTTP 500 可能会阻止 Duplicati 向 **duplistatus** 发送 JSON 报告。表单 URL 先发送。请参阅 [报告到 duplistatus 和 Duplicati 监控](../installation/duplicati-server-configuration.md#reporting-to-duplistatus-and-duplicati-monitoring)。

### 仪表板上出现重复服务器 {/* #duplicate-servers-on-the-dashboard */}

如果同一服务器在仪表板上出现多次，这通常发生在 [收集备份日志](collect-backup-logs.md) 之后，或在重新安装或升级 Duplicati 服务器之后。

**原因：**

- **更改了 `machine_id`**：当您重新安装或升级 Duplicati 时，服务器的 `machine_id` 可能会更改，**duplistatus** 会将其视为新服务器。
- **Duplicati API 错误**：在 Duplicati 的较新版本中，某些 API 端点会混合 `identity` id 和 `machine_id`。这种不一致会导致 **duplistatus** 将同一服务器注册为不同的 ID，从而产生重复项。

**修复：**

1. 在 **Duplicati 服务器**上，执行以下 **其中一个**：
    - 编辑 `identity.txt` 和 `machineid.txt` 文件，使两个文件都包含 **相同**的 id；或者
    - 打开 **Duplicati → 设置 → 高级选项 → 机器 id** 并设置一个值（它会自动填充 — 只需接受建议的值）。
2. **重启** Duplicati 服务器以使更改生效。
3. 在 **duplistatus** 中，使用 [设置 → 数据库维护 → 合并重复服务器](settings/database-maintenance.md#merge-duplicate-servers) 来合并重复条目。

### 通知未工作（详细） {/* #notifications-not-working-detailed */}

如果通知未被发送或接收：

- **检查 NTFY 配置**：确保 NTFY URL 和主题正确。使用 **发送测试通知** 按钮进行测试。
- **检查网络连接**：验证 **duplistatus** 是否能够访问您的 NTFY 服务器。如有必要，请检查防火墙设置。
- **检查通知设置**：确认相关备份的通知已启用。

### 可用版本未显示 {/* #available-versions-not-appearing */}

如果备份版本未显示在仪表板或详细信息页面上：

- **检查 Duplicati 配置**：确保 `send-http-log-level=Information` 和 `send-http-max-log-lines=500` 在 Duplicati 的高级选项中配置正确。Duplicati 会保留前 N 行日志。如果版本列表仍然缺失，请提高上限或在不向 Duplicati 监控发送报告时使用 `0`。即使详细列表缺失，版本 **数量** 仍然可以从 JSON 统计中显示。请参阅 [日志行和可用版本](../installation/duplicati-server-configuration.md#log-lines-and-available-versions)。

### 过期备份警报未工作 {/* #overdue-backup-alerts-not-working */}

如果过期备份通知未发送：

- **检查过期配置**：确认备份监控已启用。验证预期间隔和容差设置。
- **检查通知频率**：如果设置为 **一次性**，则仅在过期事件发生时发送一次警报。
- **检查 Cron 服务**：确保监控过期备份的 cron 服务正常运行。检查应用程序日志中的错误。验证 cron 服务是否在配置的端口（默认：`8667`）上可访问。

### 收集备份日志未工作 {/* #collect-backup-logs-not-working */}

如果手动备份日志收集失败：

- **检查 Duplicati 服务器访问**：验证 Duplicati 服务器的主机名和端口是否正确。确认 Duplicati 中已启用远程访问。确保身份验证密码正确。
- **检查网络连接**：测试 **duplistatus** 与 Duplicati 服务器之间的连接。确认 Duplicati 服务器端口可访问（默认：`8200`）。
  例如，如果您使用 Docker，可以使用 `docker exec -it <container-name> /bin/sh` 访问容器的命令行并运行网络工具，如 `ping` 和 `curl`。

    ```bash
    docker exec -it duplistatus /bin/sh
    ping duplicati-server.local
    curl -I http://duplicati-server.local:8200
    ```

还要检查容器内的 DNS 配置（更多信息请参见 [Podman 容器的 DNS 配置](../installation/installation.md#configuring-dns-for-podman-containers))

- 在 **Duplicati 2.4 及更高版本** 中，`/api/v1/systeminfo` 列出 `machine-id`，默认为空。**duplistatus** 从 Duplicati 服务器设置中读取配置的 ID。如果仍然无法识别服务器，请设置 **Duplicati → 设置 → 高级选项 → 机器 ID** 并重试。

### 从早期版本升级（0.9.x 之前）且无法登录 {/* #upgrade-from-an-earlier-version-before-09x-and-cant-login */}

**duplistatus** 从版本 0.9.x 开始需要用户认证。在首次安装应用程序或从早期版本升级时，会自动创建一个默认的 `admin` 帐户：
    - 用户名：`admin`
    - 密码：`Duplistatus09`

首次登录后，您可以在 [设置 > 用户](settings/user-management-settings.md) 中创建其他用户帐户。

### 管理员密码丢失或被锁定 {/* #lost-admin-password-or-locked-out */}

如果您丢失了管理员密码或被锁定（仍然可以打开 `/login`）：

- **使用管理员恢复脚本**：请参阅 [管理员帐户恢复](admin-recovery.md) 指南以获取在 Docker 环境中恢复管理员访问的说明。
- **验证容器访问**：确保您有 Docker exec 访问权限以运行恢复脚本。

如果浏览器在登录前显示 **访问被拒绝**（HTTP 403），则这是 [IP 白名单锁定](#locked-out-by-ip-allowlist)，而不是忘记密码。管理员恢复脚本无法绕过它。

### 被 IP 白名单锁定 {/* #locked-out-by-ip-allowlist */}

如果设置 → [IP 白名单](settings/ip-allowlist-settings.md) 启用且 CIDR 缺失或错误，代理会在身份验证之前拒绝请求。典型症状：

- 页面（`/`、`/login`、`/settings`、…）返回纯文本**访问被拒绝**（HTTP 403）。
- 会话和管理员API返回JSON `{ "errorCode": "IP_NOT_ALLOWED" }`。
- `/api/health`和`/api/ping`在启用白名单时，也会从未列出的IP返回403。它们仍然会从回环响应。登录cookie无效。

要在锁定期间确认应用程序正常运行，请从容器内运行探针（回环始终允许）：

```bash
docker exec duplistatus curl -sf http://127.0.0.1:9666/api/ping
```

保存路径会尝试防止这种情况：除非您的当前IP已经在CIDR中（从回环保存除外），否则您无法启用**管理员**列表。您仍然可以通过使用现在匹配但以后不匹配的CIDR（VPN、DHCP、另一个网络）、错误配置受信任的代理或从`127.0.0.1` / `::1`启用列表而不添加该地址来锁定自己。

环境变量会覆盖数据库，因此您可以在没有UI的情况下恢复。它们不会重写设置；需要重新启动，以便进程获取它们。

**禁用管理员列表**（通常的恢复方法）：

```bash
ADMIN_IP_ALLOWLIST_ENABLED=false
```

**或者保持启用状态并注入包含您当前IP的CIDR：**

```bash
ADMIN_IP_ALLOWLIST=203.0.113.10/32
```

然后重新启动应用程序：

- **Docker Compose**：在`docker-compose.yml`中`environment`下设置相同的键（文件包含注释示例），然后重新创建应用程序容器。`docker exec`不会更改正在运行容器的环境变量。
- **本地/系统**：在服务环境中导出变量，并重新启动Next.js进程（不仅仅是cron服务）。

当您可以再次打开UI后：

1. 登录并修复设置→IP白名单中的CIDR和受信任的代理。
2. 删除环境覆盖，使设置再次成为权威来源。

**外部 API** 白名单（`/api/upload`、`/api/summary`、`/api/lastbackup*`）不会锁定仪表板。使用 `EXTERNAL_API_IP_ALLOWLIST_ENABLED=false` 或 `EXTERNAL_API_IP_ALLOWLIST` 以相同的方式恢复它。如果启用该列表后 Duplicati 上传失败并出现 HTTP 403 错误，请参阅 [新备份未显示](#new-backups-not-showing)。受信任的代理恢复使用 `IP_TRUSTED_PROXIES`（非空值也意味着信任代理）。

请参阅[IP白名单](settings/ip-allowlist-settings.md#environment-overrides)和[环境变量](../installation/environment-variables.md)。

### 数据库备份和迁移 {/* #database-backup-and-migration */}

在从之前的版本迁移或创建数据库备份时：

**如果您正在运行1.2.1或更高版本：**
- 使用[设置→数据库维护](user-guide/settings/database-maintenance.md)中的内置数据库备份功能
- 选择您喜欢的格式（.db或.sql），然后单击**下载备份**
- 备份文件将下载到您的计算机
- 有关详细说明，请参阅[数据库维护](settings/database-maintenance.md#database-backup)

**如果您正在运行1.2.1之前的版本：**
- 您需要手动备份。有关更多信息，请参阅[迁移指南](../migration/version_upgrade.md#backing-up-your-database-before-migration)。

如果您仍然遇到问题，请尝试以下步骤：

1.  **检查应用程序日志**：如果使用Docker，请运行`docker logs <container-name>`以查看详细的错误信息。
2.  **验证配置**：在容器管理工具（Docker、Portainer、Podman等）中双重检查所有配置设置，包括端口、网络和权限。
3.  **验证网络连接**：确认所有网络连接稳定。
4.  **检查Cron服务**：确保cron服务与主应用程序一起运行。检查两个服务的日志。
5.  **参考文档**：有关更多信息，请参阅安装指南和README。
6.  **报告问题**：如果问题仍然存在，请在[duplistatus GitHub存储库](https://github.com/wsj-br/duplistatus/issues)上提交详细的问题。

<br/>

# 附加资源 {/* #additional-resources */}

- **安装指南**: [安装指南](../installation/installation.md)
- **Duplicati 文档**: [docs.duplicati.com](https://docs.duplicati.com)
- **API 文档**: [API 参考](../api-reference/overview.md)
- **GitHub 仓库**: [wsj-br/duplistatus](https://github.com/wsj-br/duplistatus)
- **开发指南**: [开发指南](../development/setup.md)
- **数据库架构**: [数据库文档](../development/database)

### 支持 {/* #support */}
- **GitHub 问题**: [报告错误或请求功能](https://github.com/wsj-br/duplistatus/issues)
