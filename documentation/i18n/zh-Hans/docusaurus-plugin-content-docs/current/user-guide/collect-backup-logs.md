# 收集备份日志 {/* #collect-backup-logs */}

**duplistatus** 可以直接从 Duplicati 服务器检索备份日志，以填充数据库或恢复缺失的日志数据。应用程序会自动跳过数据库中已存在的任何重复日志。

## 收集备份日志的步骤 {/* #steps-to-collect-backup-logs */}

### 手动收集 {/* #manual-collection */}

1.  单击 [应用程序工具栏](overview.md#application-toolbar) 上的 <IconButton icon="lucide:download" /> **收集备份日志** 图标。

![收集备份日志弹出窗口](../assets/screen-collect-button-popup.png)

2.  选择服务器

如果您在 [设置 → 服务器设置](settings/server-settings.md) 中配置了服务器地址，请从下拉列表中选择一个进行即时收集。如果您没有配置任何服务器，可以手动输入 Duplicati 服务器详细信息。

3.  输入 Duplicati 服务器详细信息：
    - **主机名**：Duplicati 服务器的主机名或 IP 地址。您可以输入多个主机名，用逗号分隔，例如 `192.168.1.23,someserver.local,192.168.1.89`
    - **端口**：Duplicati 服务器使用的端口号（默认值：`8200`）。
    - **密码**：如果需要，请输入身份验证密码。
    - **下载收集的 JSON 数据**：启用此选项以下载 duplistatus 收集的数据。
4.  单击 **收集备份**。

***注意：***
- 如果您输入多个主机名，将对所有服务器使用相同的端口和密码执行收集。
- **duplistatus** 将自动检测最佳连接协议（HTTPS 或 HTTP）。它首先尝试 HTTPS（具有适当的 SSL 验证），然后是自签名证书的 HTTPS，最后是 HTTP 作为备用。

:::tip
[设置 → 备份监控](settings/backup-monitoring-settings.md) 和 [设置 → 服务器设置](settings/server-settings.md) 中提供 <IconButton icon="lucide:download" /> 按钮用于单服务器收集。
:::

<br/>

### 批量收集 {/* #bulk-collection */}

_右键单击_ 应用程序工具栏中的 <IconButton icon="lucide:download" /> **收集备份日志** 按钮，以从所有已配置的服务器收集。

![收集所有右键菜单](../assets/screen-collect-button-right-click-popup.png)

:::tip
您还可以使用 [设置 → 备份监控](settings/backup-monitoring-settings.md) 和 [设置 → 服务器设置](settings/server-settings.md) 页面中的 <IconButton icon="lucide:import" label="收集所有"/> 按钮从所有已配置的服务器收集。
:::

## 收集过程的工作原理 {/* #how-the-collection-process-works */}

- **duplistatus** 自动检测最佳连接协议并连接到指定的 Duplicati 服务器。
- 它检索备份历史、日志信息和备份设置（用于备份监控）。
- 跳过 **duplistatus** 数据库中已存在的任何日志。
- 新数据经过处理并存储在本地数据库中，包括每个备份日志中报告的 Duplicati 版本。[仪表板版本](dashboard.md#duplicati-server-version) 来自最新的存储日志 — **duplistatus** 不读取当前在服务器上运行的版本。Duplicati 升级后，收集或等待新的备份，以便仪表板显示新版本。
- 使用的 URL（带检测到的协议）将存储或更新到本地数据库中。
- 如果选择了下载选项，将在从 Duplicati 服务器接收到任何数据时下载收集的 JSON 数据 — 即使日志验证失败或无法导入数据库。文件名格式为：`[serverName]_collected_[Timestamp].json`。时间戳使用 ISO 8601 日期格式（YYYY-MM-DDTHH:MM:SS）。
- 仪表板更新以反映新信息。

:::note 收集后看到重复的服务器？
如果收集备份日志后（或 Duplicati 重新安装/升级后）同一服务器出现多次，通常是由 `machine_id` 更改或 Duplicati API 错误导致的，该错误混合了 `identity` id 和 `machine_id`。修复方法是在 Duplicati 服务器上对齐 id（编辑 `identity.txt`/`machineid.txt` 或设置 **Duplicati → 设置 → 高级选项 → 机器 ID**），重启 Duplicati，然后通过 [设置 → 数据库维护 → 合并重复服务器](settings/database-maintenance.md#merge-duplicate-servers) 在 **duplistatus** 中合并条目。请参阅 [仪表板上的重复服务器](troubleshooting.md#duplicate-servers-on-the-dashboard) 了解完整步骤。
:::

## 故障排除收集问题 {/* #troubleshooting-collection-issues */}

备份日志收集需要从 **duplistatus** 安装位置能够访问 Duplicati 服务器。如果遇到问题，请验证以下内容：

- 确认主机名（或 IP 地址）和端口号正确。您可以通过在浏览器中访问 Duplicati 服务器 UI 来测试这一点（例如，`http://hostname:port`）。
- 检查 **duplistatus** 是否可以连接到 Duplicati 服务器。常见问题是 DNS 名称解析（系统无法通过主机名找到服务器）。更多信息请参见[故障排除部分](troubleshooting.md#collect-backup-logs-not-working)。
- 确保您提供的密码正确。
- 在 Duplicati 2.4+ 中，当 systeminfo 选项默认为空时，收集功能会从 Duplicati 服务器设置中读取机器 ID。
