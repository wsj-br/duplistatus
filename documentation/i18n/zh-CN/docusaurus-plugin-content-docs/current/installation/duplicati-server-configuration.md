# Duplicati 服务器配置（必填） {#duplicati-server-configuration-required}

为了使本应用程序正常工作，您的每个 Duplicati 服务器都需要配置为在每次备份运行时向 **duplistatus** 服务器发送 HTTP 报告。

请将此配置应用于您的每个 Duplicati 服务器：

1. **配置备份结果报告：** 在 Duplicati 配置页面上，选择 `Settings`，并在 `Default Options` 部分中包含以下选项。

![Duplicati configuration](/img/duplicati-options.png)

将 'my.local.server' 替换为运行 **duplistatus** 的服务器名称或 IP 地址。

| 高级选项 | 值 |
    | -------------------------------- | ---------------------------------------- |
    | `send-http-url` | `http://my.local.server:9666/api/upload` |
    | `send-http-result-output-format` | `Json` |
    | `send-http-log-level` | `Information` |
    | `send-http-max-log-lines` | `0` |

或者，您可以点击 `Edit as text` 并复制以下行，将 `my.local.server` 替换为您实际的服务器地址。

```bash
--send-http-url=http://my.local.server:9666/api/upload
--send-http-result-output-format=Json
--send-http-log-level=Information
--send-http-max-log-lines=0
```

**关于 Duplicati 发送消息的重要说明：**

- 如果您省略 `--send-http-log-level=Information`，则不会向 **duplistatus** 发送日志消息，仅发送统计信息。这将导致可用版本功能无法正常工作。
- 建议的配置是 `--send-http-max-log-lines=0` 以支持无限量消息，因为 Duplicati 默认的 100 条消息可能会导致日志中无法接收到可用版本信息。
- 如果您限制消息数量，可能无法接收到获取可用备份版本所需的日志消息。这将导致该备份运行的这些版本无法显示。

:::tip
配置 **duplistatus** 服务器后，请使用 [采集备份日志](../user-guide/collect-backup-logs.md) 采集所有 Duplicati 服务器的备份日志。
:::

2. **可选 - 允许远程 UI 访问：** 如果您希望直接从 **duplistatus** 仪表板链接访问 Duplicati Web 界面，请登录 [Duplicati UI](https://docs.duplicati.com/getting-started/set-up-a-backup-in-the-ui)，选择 `Settings` 并允许远程访问，包括主机名列表（或使用 `*`）。如果您跳过此步骤，**duplistatus** 仍将接收备份报告，但指向 Duplicati UI 的直接链接将无法工作。

:::info
如果您未在 Duplicati 中启用远程访问，**Duplistatus** 中用于访问 __Duplicati UI__ 的链接将无法工作。
:::

![Duplicati settings](/img/duplicati-settings.png)

:::caution
仅在您的 Duplicati 服务器受安全网络（例如 VPN、私有局域网或防火墙规则）保护时才启用远程访问。在没有适当安全措施的情况下将 Duplicati 界面暴露在公共互联网中可能会导致未经授权的访问。

建议使用 Tailscale、Headscale、NetBird、ZeroTier、Nebula、Twingate、Pritunl、Cloudflare Access、Wireguard 或类似解决方案，以便从本地网络外部安全地访问您的服务器。
:::
