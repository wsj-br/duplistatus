# Duplicati 服务器配置（必填） {#duplicati-server-configuration-required}

为了使此应用程序正常工作，每个 Duplicati 服务器需要配置为向 **duplistatus** 服务器发送每个备份运行的 HTTP 报告。

将此配置应用于每个 Duplicati 服务器：

1. **配置备份结果报告：** 在 Duplicati 配置页面上，选择 `Settings`，在 `Default Options` 部分中，包括以下选项。

![Duplicati configuration](/img/duplicati-options.png)

将 'my.local.server' 替换为 **duplistatus** 运行的服务器名称或 IP 地址。

| 高级选项                  | 值                                    |
    | -------------------------------- | ---------------------------------------- |
    | `send-http-url`                  | `http://my.local.server:9666/api/upload` |
    | `send-http-result-output-format` | `Json`                                   |
    | `send-http-log-level`            | `Information`                            |
    | `send-http-max-log-lines`        | `0`                                      |

或者，您可以点击 `Edit as text` 并复制以下行，替换 `my.local.server` 为您的实际服务器地址。

```bash
--send-http-url=http://my.local.server:9666/api/upload
--send-http-result-output-format=Json
--send-http-log-level=Information
--send-http-max-log-lines=0
```

**Duplicati 发送的消息的重要说明：**

- 如果省略 `--send-http-log-level=Information`，则不会向 **duplistatus** 发送日志消息，只会发送统计信息。这将防止可用版本功能正常工作。
- 推荐的配置是 `--send-http-max-log-lines=0`，以发送无限消息，因为 Duplicati 默认的 100 条消息可能会防止可用版本在日志中被接收。
- 如果限制消息数量，则可能无法接收用于获取可用备份版本的日志消息。这将防止这些版本在备份运行中被显示。

:::tip
配置 **duplistatus** 服务器后，使用 [收集备份日志](../user-guide/collect-backup-logs.md) 收集所有 Duplicati 服务器的备份日志。
:::

2. **可选 - 允许远程 UI 访问：** 如果您想直接从 **duplistatus** 仪表板链接访问 Duplicati 网页界面，请登录 [Duplicati 的 UI](https://docs.duplicati.com/getting-started/set-up-a-backup-in-the-ui)，选择 `Settings`，并允许远程访问，包括主机名列表（或使用 `*`）。如果您跳过此步骤，**duplistatus** 仍将接收备份报告，但直接链接到 Duplicati UI 将不起作用。

:::info
如果您不在 Duplicati 中启用远程访问，**Duplistatus** 中访问 __Duplicati UI__ 的链接将不起作用。 
:::

![Duplicati settings](/img/duplicati-settings.png)

:::caution
仅在 Duplicati 服务器受到安全网络保护（例如 VPN、专用 LAN 或防火墙规则）时启用远程访问。未经适当安全措施将 Duplicati 界面暴露在公共互联网上可能会导致未经授权的访问。 

建议使用 Tailscale、Headscale、NetBird、ZeroTier、Nebula、Twingate、Pritunl、Cloudflare Access、Wireguard 或类似解决方案以安全地从本地网络外部访问您的服务器。
:::
