# 采集备份日志 {#collect-backup-logs}

**duplistatus** 可以直接从 Duplicati 服务器检索备份日志，以填充数据库或恢复缺失的日志数据。应用程序会自动跳过数据库中已存在的任何重复日志。

## 采集备份日志的步骤 {#steps-to-collect-backup-logs}

### 手动采集 {#manual-collection}

1.  点击 [应用程序工具栏](overview.md#application-toolbar) 上的 <IconButton icon="lucide:download" /> **采集备份日志** 图标。

![Collect Backup Logs Popup](../assets/screen-collect-button-popup.png)

2.  选择服务器

如果您已在 [设置 → 服务器设置](settings/server-settings.md) 中配置了服务器地址，请从下拉列表中选择一个以进行即时采集。如果您没有配置任何服务器，可以手动输入 Duplicati 服务器详情。

3.  输入 Duplicati 服务器详情：
    - **主机名**：Duplicati 服务器的主机名或 IP 地址。您可以输入多个以逗号分隔的主机名，例如 `192.168.1.23,someserver.local,192.168.1.89`
    - **端口**：Duplicati 服务器使用的端口号（默认：`8200`）。
    - **密码**：如果需要，请输入身份验证密码。
    - **下载已采集的 JSON 数据**：启用此选项以下载 duplistatus 采集的数据。
4.  点击 **采集备份**。

***注意：***
- 如果您输入多个主机名，所有服务器将使用相同的端口和密码进行采集。
- **duplistatus** 将自动检测最佳连接协议（HTTPS 或 HTTP）。它会首先尝试 HTTPS（带有正确的 SSL 验证），然后尝试带有自签名证书的 HTTPS，最后将 HTTP 作为备选方案。

:::tip
[设置 → 备份监控](settings/backup-monitoring-settings.md) 和 [设置 → 服务器设置](settings/server-settings.md) 中也提供 <IconButton icon="lucide:download" /> 按钮，用于单服务器采集。
:::

<br/>

### 批量采集 {#bulk-collection}

_右键点击_ 应用程序工具栏中的 <IconButton icon="lucide:download" /> **采集备份日志** 按钮，以从所有已配置的服务器进行采集。

![Collect All Right-Click Menu](../assets/screen-collect-button-right-click-popup.png)

:::tip
您也可以使用 [设置 → 备份监控](settings/backup-monitoring-settings.md) 和 [设置 → 服务器设置](settings/server-settings.md) 页面中的 <IconButton icon="lucide:import" label="采集全部"/> 按钮，从所有已配置的服务器进行采集。
:::

## 采集过程的工作原理 {#how-the-collection-process-works}

- **duplistatus** 自动检测最佳连接协议并连接到指定的 Duplicati 服务器。
- 它检索备份历史、日志信息和备份设置（用于备份监控）。
- **duplistatus** 数据库中已存在的任何日志将被跳过。
- 新数据将被处理并存储在本地数据库中。
- 所使用的 URL（包含检测到的协议）将被存储或更新在本地数据库中。
- 如果选择了下载选项，它将下载采集到的 JSON 数据。文件名格式为：`[serverName]_collected_[Timestamp].json`。时间戳使用 ISO 8601 日期格式 (YYYY-MM-DDTHH:MM:SS)。
- 仪表板将更新以反映新信息。

## 排除采集问题 {#troubleshooting-collection-issues}

备份日志采集要求 Duplicati 服务器能够被 **duplistatus** 安装环境访问。如果您遇到问题，请验证以下各项：

- 确认主机名（或 IP 地址）和端口号正确。您可以通过在浏览器中访问 Duplicati 服务器 UI 来测试（例如 `http://hostname:port`）。
- 检查 **duplistatus** 是否能连接到 Duplicati 服务器。常见问题是 DNS 名称解析（系统无法通过主机名找到服务器）。详见 [故障排除部分](troubleshooting.md#collect-backup-logs-not-working)。
- 确保您提供的密码正确。
