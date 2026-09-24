# 故障排除 {/* #troubleshooting */}

### 仪表板未加载 {/* #dashboard-not-loading */}
- 检查容器是否正在运行：`docker ps`
- 验证端口 9666 是否可访问
- 检查容器日志：`docker logs duplistatus`
- 如果您正在使用反向代理，请检查反向代理日志中的错误
- 如果您正在使用 IP 白名单，请检查 IP 白名单日志中的错误

### 无备份数据 {/* #no-backup-data */}
- 验证 Duplicati 服务器配置
- 检查服务器之间的网络连接
- 查看 duplistatus 日志中的错误
- 确保备份作业正在运行
- 如果使用 API 密钥，请确保 API 密钥正确，范围正确且未过期（读取密钥无法上传）

### 通知不工作 {/* #notifications-not-working */}
- 检查通知配置
- 验证 NTFY 服务器连接（如果使用 NTFY）
- 测试通知设置
- 检查通知日志
- 如果您是管理员，请在工具栏中查找红色警笛图标，并打开关联的电子邮件或 NTFY 设置页面。请参阅[发送失败](delivery-failures.md)。

### 新备份未显示 {/* #new-backups-not-showing */}

如果您看到 Duplicati 服务器警告如 `HTTP Response request failed for:` 和 `Failed to send message: System.Net.Http.HttpRequestException:`，并且新备份未出现在仪表板或备份历史中：

- **检查 Duplicati 配置**：确认 Duplicati 已正确配置为向 **duplistatus** 发送 JSON。在 Duplicati 2.0.9.106 及更高版本中，使用指向 `/api/upload` 的 `--send-http-json-urls`。在较旧的 Duplicati 中，使用带有 `--send-http-result-output-format=Json` 的 `--send-http-url`。参见 [Duplicati 服务器配置](../installation/duplicati-server-configuration.md)。
- **检查网络连接**：确保 Duplicati 服务器可以连接到 **duplistatus** 服务器。确认端口正确（默认：`9666`）。
- **HTTP 401**：需要 API 密钥，且上传 URL 缺少有效的上传范围密钥。按 [API 密钥](settings/api-keys-settings.md) 中所述添加 `?api_key=`。
- **HTTP 403**：密钥范围错误（读取密钥无法上传），或者 Duplicati 主机不在 [外部 API IP 白名单](settings/ip-allowlist-settings.md) 上。
- **HTTP 413**：JSON 报告大于上传大小限制（默认 5 MB）。降低 `--send-http-max-log-lines` 或在设置 → API 密钥中提高限制。
- **HTTP 429**：超出每 IP 上传速率限制。等待 `Retry-After`，或者如果许多作业同时完成则提高限制。
- **查看 Duplicati 日志**：检查 Duplicati 日志中的 HTTP 请求错误。
- **双重报告**：如果您还向 [Duplicati 监控](https://www.duplicati-monitoring.com/) 发送表单报告，则该服务的失败或 HTTP 500 错误可能会阻止 Duplicati 向 **duplistatus** 发送 JSON 报告。表单 URL 优先发送。参见 [向 duplistatus 和 Duplicati 监控报告](../installation/duplicati-server-configuration.md#reporting-to-duplistatus-and-duplicati-monitoring)。

### 仪表板上的重复服务器 {/* #duplicate-servers-on-the-dashboard */}

如果同一服务器在仪表板上出现多次，这通常发生在 [收集备份日志](collect-backup-logs.md) 之后，或重新安装或升级 Duplicati 服务器之后。

**原因：**

- **更改了 `machine_id`**：当您重新安装或升级 Duplicati 时，服务器的 `machine_id` 可能会改变，然后 **duplistatus** 将其视为新服务器。
- **Duplicati API 错误**：在较新版本的 Duplicati 中存在一个错误，其中某些 API 端点混合了 `identity` id 和 `machine_id`。这种不一致性导致 **duplistatus** 在不同 ID 下注册同一服务器，生成重复项。

**修复：**

1.  在 **Duplicati 服务器** 上，执行以下 **一项** 操作：
    - 编辑 `identity.txt` 和 `machineid.txt` 文件，使两个文件包含 **相同** 的 id；或
    - 打开 **Duplicati → 设置 → 高级选项 → 机器-id** 并设置一个值（自动填充 — 只需接受建议的值）。
2.  **重启** Duplicati 服务器以使更改生效。
3.  在 **duplistatus** 中，使用 [设置 → 数据库维护 → 合并重复服务器](settings/database-maintenance.md#merge-duplicate-servers) 合并重复条目。

### 通知不工作（详细） {/* #notifications-not-working-detailed */}

如果通知未被发送或接收：

- **检查 NTFY 配置**：确保 NTFY URL 和主题正确。使用 **发送测试通知** 按钮进行测试。
- **检查网络连接**：验证 **duplistatus** 能够访问您的 NTFY 服务器。如有必要，请查看防火墙设置。
- **检查通知设置**：确认已为相关备份启用了通知。

### 可用版本未显示 {/* #available-versions-not-appearing */}

如果备份版本未在仪表板或详细信息页面上显示：

- **检查 Duplicati 配置**：确保在 Duplicati 的高级选项中配置了 `send-http-log-level=Information` 和 `send-http-max-log-lines=500`。Duplicati 保留前 N 行日志。如果版本列表仍然缺失，请提高上限或在不同时向 Duplicati 监控发送报告时使用 `0`。即使详细列表缺失，版本 **计数** 仍可从 JSON 统计信息中显示。请参阅 [日志行和可用版本](../installation/duplicati-server-configuration.md#log-lines-and-available-versions)。

### 过期备份警报不工作 {/* #overdue-backup-alerts-not-working */}

如果未发送过期备份通知：

- **检查过期配置**：确认已为备份启用备份监控。验证预期间隔和容差设置。
- **检查通知频率**：如果设置为 **一次性**，则每个过期事件仅发送一次警报。
- **检查 Cron 服务**：确保监控过期备份的 cron 服务正在正常运行。检查应用程序日志中的错误。验证 cron 服务可通过配置的端口（默认值：`8667`）访问。

### 收集备份日志不工作 {/* #collect-backup-logs-not-working */}

如果手动备份日志收集失败：

- **检查 Duplicati 服务器访问**：验证 Duplicati 服务器主机名和端口是否正确。确认已在 Duplicati 中启用远程访问。确保认证密码正确。
- **检查网络连接**：测试从 **duplistatus** 到 Duplicati 服务器的连接。确认 Duplicati 服务器端口可访问（默认值：`8200`）。
  例如，如果您使用 Docker，可以使用 `docker exec -it <container-name> /bin/sh` 访问容器的命令行并运行网络工具如 `ping` 和 `curl`。

    ```bash
    docker exec -it duplistatus /bin/sh
    ping duplicati-server.local
    curl -I http://duplicati-server.local:8200
    ```

还请检查容器内的 DNS 配置（详情请见 [Podman 容器的 DNS 配置](../installation/installation.md#configuring-dns-for-podman-containers)）

- 在 **Duplicati 2.4 及更高版本** 中，`/api/v1/systeminfo` 列出 `machine-id` 并带有空的默认值。**duplistatus** 从 Duplicati 服务器设置中读取配置的 ID。如果收集仍然无法识别服务器，请设置 **Duplicati → 设置 → 高级选项 → 机器 ID** 并重试。

### 从早期版本（0.9.x 之前）升级后无法登录 {/* #upgrade-from-an-earlier-version-before-09x-and-cant-login */}

**duplistatus**从 0.9.x 版本开始需要用户身份验证。首次安装应用程序或从早期版本升级时，会自动创建一个默认的 `admin` 账户：
    - 用户名：`admin`
    - 密码：`Duplistatus09`

首次登录后，您可以在 [设置 > 用户](settings/user-management-settings.md) 中创建额外的用户账户。

### 丢失管理员密码或被锁定 {/* #lost-admin-password-or-locked-out */}

如果您丢失了管理员密码或被锁定账户（仍可打开 `/login`）：

- **使用管理员恢复脚本**：请参阅 [管理员账户恢复](admin-recovery.md) 指南，了解在 Docker 环境中恢复管理员访问权限的说明。
- **验证容器访问**：确保您具有对容器的 Docker exec 访问权限以运行恢复脚本。

如果浏览器显示 **访问被拒绝**（HTTP 403）且在登录前出现，这是 [IP 白名单锁定](#locked-out-by-ip-allowlist)，而不是忘记密码。管理员恢复脚本无法绕过此问题。

### 被 IP 白名单锁定 {/* #locked-out-by-ip-allowlist */}

如果设置 → [IP 白名单](settings/ip-allowlist-settings.md) 启用但缺少或错误的 CIDR，代理会在身份验证前拒绝请求。典型症状：

- 页面（`/`、`/login`、`/settings`等）返回纯文本**访问被拒绝**（HTTP 403）。
- 会话和管理API返回JSON `{ "errorCode": "IP_NOT_ALLOWED" }`。
- 当启用任一白名单时，`/api/health`和`/api/ping`也会从未列入白名单的IP返回403。它们仍会响应环回地址。登录cookie无帮助。

要确认在锁定期间应用程序仍在运行，请在容器内部运行探测（始终允许环回）：

```bash
docker exec duplistatus curl -sf http://127.0.0.1:9666/api/ping
```

保存路径尝试防止此情况：除非您的当前IP已在CIDR中，否则无法启用**管理员**列表（从环回保存除外）。您仍可能通过使用现在匹配但以后不匹配的CIDR（VPN、DHCP、另一个网络）、错误配置受信任的代理，或在未添加该地址的情况下从`127.0.0.1`/`::1`启用列表而将自己锁定。

环境变量会覆盖数据库，因此您可以在没有UI的情况下恢复。它们不会重写设置；需要重启以便进程获取它们。

**禁用管理员列表**（通常恢复方法）：

```bash
ADMIN_IP_ALLOWLIST_ENABLED=false
```

**或者保持启用并注入包含您当前IP的CIDR：**

```bash
ADMIN_IP_ALLOWLIST=203.0.113.10/32
```

然后重启应用程序：

- **Docker Compose**：在`docker-compose.yml`中的`environment`下设置相同的键（文件包含注释示例）并重新创建应用容器。`docker exec`不会更改正在运行容器的环境变量。
- **本地/systemd**：在服务环境中导出变量并重启Next.js进程（不仅仅是cron服务）。

当您可以再次打开UI后：

1. 登录并在设置→IP白名单中修复CIDR和受信任的代理。
2. 移除环境覆盖，使设置再次成为真实来源。

**外部API**白名单（`/api/upload`、`/api/summary`、`/api/lastbackup*`）不会锁定仪表板。使用`EXTERNAL_API_IP_ALLOWLIST_ENABLED=false`或`EXTERNAL_API_IP_ALLOWLIST`以相同方式恢复。如果启用该列表后Duplicati上传失败并出现HTTP 403，请参见[新备份未显示](#new-backups-not-showing)。受信任代理恢复使用`IP_TRUSTED_PROXIES`（非空值也意味着信任代理）。

请参见[IP白名单](settings/ip-allowlist-settings.md#environment-overrides)和[环境变量](../installation/environment-variables.md)。

### 数据库备份和迁移 {/* #database-backup-and-migration */}

从先前版本迁移或创建数据库备份时：

**如果您运行的是1.2.1或更高版本：**
- 使用[设置→数据库维护](user-guide/settings/database-maintenance.md)中的内置数据库备份功能
- 选择您首选的格式（.db或.sql）并点击**下载备份**
- 备份文件将下载到您的计算机
- 请参见[数据库维护](settings/database-maintenance.md#database-backup)获取详细说明

**如果您运行的是1.2.1之前的版本：**
- 您需要手动备份。请参见[迁移指南](../migration/version_upgrade.md#backing-up-your-database-before-migration)了解更多信息。

如果您仍然遇到问题，请尝试以下步骤：

1. **检查应用程序日志**：如果使用Docker，请运行`docker logs <container-name>`查看详细的错误信息。
2. **验证配置**：仔细检查容器管理工具（Docker、Portainer、Podman等）中的所有配置设置，包括端口、网络和权限。
3. **验证网络连接**：确认所有网络连接稳定。
4. **检查Cron服务**：确保cron服务与主应用程序一起运行。检查两个服务的日志。
5. **查阅文档**：参考安装指南和README了解更多信息。
6. **报告问题**：如果问题持续存在，请在[duplistatus GitHub仓库](https://github.com/wsj-br/duplistatus/issues)上提交详细的问题报告。

<br/>

# 附加资源 {/* #additional-resources */}

- **安装指南**：[安装指南](../installation/installation.md)
- **duplicati 文档**：[docs.duplicati.com](https://docs.duplicati.com)
- **API 文档**：[API 参考](../api-reference/overview.md)
- **GitHub 仓库**：[wsj-br/duplistatus](https://github.com/wsj-br/duplistatus)
- **开发指南**：[开发指南](../development/setup.md)
- **数据库架构**：[数据库文档](../development/database)

### 支持 {/* #support */}
- **GitHub Issues**：[报告错误或请求功能](https://github.com/wsj-br/duplistatus/issues)
