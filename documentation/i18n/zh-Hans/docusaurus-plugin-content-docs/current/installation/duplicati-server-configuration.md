# Duplicati 服务器配置（必填） {#duplicati-server-configuration-required}

为了使此应用程序正常工作，每个 Duplicati 服务器需要配置为向 **duplistatus** 服务器发送每个备份运行的 HTTP 报告。

将此配置应用于每个 Duplicati 服务器：

1. **配置备份结果报告：** 在 Duplicati 配置页面上，选择 `Settings`，在 `Default Options` 部分中，包括以下选项。

![Duplicati 配置](/img/duplicati-options.png)

将 `my.local.server` 替换为 Duplicati 服务器用于访问 **duplistatus** 的主机名或 IP 地址。如果两者都在同一台机器上运行，请参阅 [Duplicati 和 duplistatus 在同一主机上](#duplicati-and-duplistatus-on-the-same-host)。

有关选项参考，请参阅 Duplicati 的 [HTTP 通知](https://docs.duplicati.com/monitoring-and-notifications/sending-reports-via-email/sending-http-notifications) 文档。

### 推荐选项（Duplicati 2.0.9.106 及更高版本）{#recommended-options-duplicati-209106-and-later}

`--send-http-json-urls` 已经发送 JSON，因此 `--send-http-result-output-format=Json` 不是必需的（对于这些 URL，它将被忽略）。

| 高级选项                     | 值                                      |
    | ------------------------- | ---------------------------------------- |
    | `send-http-json-urls`     | `http://my.local.server:9666/api/upload` (当需要 API 密钥时添加 `?api_key=`) |
    | `send-http-log-level`            | `Information`                            |
    | `send-http-max-log-lines`        | `500`                                    |

或者，您可以单击 `Edit as text` 并复制以下行，将 `my.local.server` 替换为您的实际服务器地址。

```bash
--send-http-json-urls=http://my.local.server:9666/api/upload
--send-http-log-level=Information
--send-http-max-log-lines=500
```

当需要 [API 密钥](../user-guide/settings/api-keys-settings.md) 时，将上传范围密钥附加到 URL：

```bash
--send-http-json-urls=http://my.local.server:9666/api/upload?api_key=YOUR_UPLOAD_KEY
```

Duplicati 无法设置自定义 HTTP 标头。查询参数是发送密钥的支持方式。反向代理访问日志将包含密钥，因此限制谁可以读取这些日志。

`--send-http-max-log-lines=500` 使 JSON 报告保持在默认 5 MB 上传大小限制以下。`--send-http-max-log-lines=0`（无限制）可以超过该限制并返回 HTTP 413。如果需要更大的报告，请在设置 → API 密钥中增加限制。

### 较旧的 Duplicati 版本 {#older-duplicati-versions}

如果您的 Duplicati 服务器早于 2.0.9.106，请使用旧版 URL 选项并将结果格式设置为 JSON：

| 高级选项                  | 值                                    |
    | -------------------------------- | ---------------------------------------- |
    | `send-http-url`                  | `http://my.local.server:9666/api/upload` |
    | `send-http-result-output-format` | `Json`                                   |
    | `send-http-log-level`            | `Information`                            |
    | `send-http-max-log-lines`        | `500`                                    |

```bash
--send-http-url=http://my.local.server:9666/api/upload
--send-http-result-output-format=Json
--send-http-log-level=Information
--send-http-max-log-lines=500
```

### 日志行和可用版本 {#log-lines-and-available-versions}

**Duplicati 发送的消息的重要说明：**

- 如果您省略 `--send-http-log-level=Information`，则不会向 **duplistatus** 发送日志消息，只会发送统计信息。这将阻止可用版本 **列表** 正常工作。
- Duplicati 的默认值为 `--send-http-max-log-lines=100`。推荐值为 `500`。Duplicati 保留 **前** N 行日志。用于可用版本列表的行（`Backups to consider`）通常在这些前几百行中；`100` 通常太少。
- `--send-http-max-log-lines=0` 表示无限制。仅当版本列表仍然丢失且您 **不** 同时向 [Duplicati 监控](https://www.duplicati-monitoring.com/) 发送报告时才使用该值。无限制的日志可能导致该服务在大型作业时返回 HTTP 500。
- 可用版本的 **数量** 仍然来自 JSON 统计信息（`BackupListCount`），即使详细的时间戳列表丢失。如果列表图标显示为灰色，请提高上限（或在仅向 **duplistatus** 报告时使用 `0`）。

:::tip
配置 **duplistatus** 服务器后，使用 [收集备份日志](../user-guide/collect-backup-logs.md) 收集所有 Duplicati 服务器的备份日志。
:::

### 向 duplistatus 和 Duplicati 监控报告 {#reporting-to-duplistatus-and-duplicati-monitoring}

您可以从 **同一** Duplicati 服务器同时向 **duplistatus** 和 [Duplicati 监控](https://www.duplicati-monitoring.com/) 发送报告。**duplistatus** 必须接收 JSON。Duplicati 监控期望表单编码的报告。不要将 `--send-http-form-urls` 指向 `/api/upload`。

在此 Duplicati 服务器上，将默认选项设置为：

```bash
--send-http-json-urls=http://my.local.server:9666/api/upload
--send-http-form-urls=https://www.duplicati-monitoring.com/log/<your-endpoint>
--send-http-log-level=Information
--send-http-max-log-lines=500
```

将 `<your-endpoint>` 替换为您的 Duplicati 监控帐户中的 URL。

- 优先使用这些专用选项。不要同时保留 `--send-http-url` 指向相同目标，除非您仍然需要旧版选项。
- `--send-http-log-level` 和 `--send-http-max-log-lines` 适用于 **每个** HTTP 目标。您无法向 **duplistatus** 发送完整日志，同时向 Duplicati 监控发送短报告。
- 使用 `500`，而不是 `0`。如果 Duplicati 监控仍然在大型作业时返回 HTTP 500，请进一步降低上限（或省略 `Information`），知道版本 **列表** 可能丢失。如果列表丢失但监控正常，请提高上限。或者，仅向 **duplistatus** 报告这些作业。

:::caution
如果一个 HTTP 目标失败（停机或 HTTP 500），Duplicati 可能不会发送剩余的报告。表单 URL 将首先发送，然后是 JSON URL。因此，Duplicati 监控的停机或 500 错误可能会阻止向 **duplistatus** 发送 JSON 报告。
:::

[收集备份日志](../user-guide/collect-backup-logs.md) 不依赖于 HTTP 报告。使用它来补全未收到的运行。

### Duplicati 和 duplistatus 在同一主机上 {#duplicati-and-duplistatus-on-the-same-host}

上传 URL 必须能够被 Duplicati 进程**访问**，而不是从您的浏览器访问。

- **主机上的 Duplicati，Docker 中的 duplistatus 使用端口 `9666` 发布：** `http://127.0.0.1:9666/api/upload`（或主机局域网 IP）。
- **两者都在 Docker 中共享网络：** `http://duplistatus:9666/api/upload`（Compose 服务或容器名称）。 `localhost` 在 Duplicati 容器内是该容器，而不是 **duplistatus**。
- **同一主机上的 HTTPS 反向代理：** 使用 [HTTPS 设置](https-setup.md) 中的公共 HTTPS URL。

收集备份日志是反向方向：从 **duplistatus** 容器，`localhost:8200` 不是主机上的 Duplicati。使用主机 IP，`host.docker.internal`（Docker Desktop 或您配置的额外主机），或 Duplicati 容器名称。

2. **可选 - 允许远程 UI 访问：** 如果您想直接从 **duplistatus** 仪表板链接访问 Duplicati 网页界面，请登录 [Duplicati 的 UI](https://docs.duplicati.com/getting-started/set-up-a-backup-in-the-ui)，选择 `Settings`，并允许远程访问，包括主机名列表（或使用 `*`）。如果您跳过此步骤，**duplistatus** 仍将接收备份报告，但直接链接到 Duplicati UI 将不起作用。

:::info
如果您不在 Duplicati 中启用远程访问，**Duplistatus** 中访问 __Duplicati UI__ 的链接将不起作用。 
:::

![Duplicati 设置](/img/duplicati-settings.png)

:::caution
仅在 Duplicati 服务器受到安全网络保护（例如 VPN、专用 LAN 或防火墙规则）时启用远程访问。未经适当安全措施将 Duplicati 界面暴露在公共互联网上可能会导致未经授权的访问。 

建议使用 Tailscale、Headscale、NetBird、ZeroTier、Nebula、Twingate、Pritunl、Cloudflare Access、Wireguard 或类似解决方案以安全地从本地网络外部访问您的服务器。
:::
