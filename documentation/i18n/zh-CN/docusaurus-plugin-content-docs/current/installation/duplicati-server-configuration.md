

# Duplicati 服务器配置（必需） {#duplicati-server-configuration-required}

为使本应用程序正常工作，每台 Duplicati 服务器需配置为在每次备份运行后向 **duplistatus** 服务器发送 HTTP 报告。

请对每台 Duplicati 服务器应用此配置：

1. **配置备份结果报告：** 在 Duplicati 配置页面，选择 `Settings`，在 `Default Options` 部分包含以下选项。


![Duplicati configuration](/img/duplicati-options.png)


 将 `my.local.server` 替换为运行 **duplistatus** 的服务器名称或 IP 地址。

    | 高级选项                  | 值                                    |
    | -------------------------------- | ---------------------------------------- |
    | `send-http-url`                  | `http://my.local.server:9666/api/upload` |
    | `send-http-result-output-format` | `Json`                                   |
    | `send-http-log-level`            | `Information`                            |
    | `send-http-max-log-lines`        | `0`                                      |

或者，可点击 `Edit as text` 并复制以下行，将 `my.local.server` 替换为实际服务器地址。


```bash
--send-http-url=http://my.local.server:9666/api/upload
--send-http-result-output-format=Json
--send-http-log-level=Information
--send-http-max-log-lines=0
```

**关于 Duplicati 发送消息的说明：**

- 若省略 `--send-http-log-level=Information`，Duplicati 将不会向 **duplistatus** 发送日志消息，仅发送统计信息。这将导致可用版本功能无法工作。
- 推荐配置为 `--send-http-max-log-lines=0` 以不限制消息数量，因为 Duplicati 默认 100 条消息可能无法接收日志中的可用版本。
- 若限制消息数量，可能无法接收获取可用备份版本所需的日志消息。这将导致该次备份运行无法显示这些版本。

:::tip
配置 **duplistatus** 服务器后，使用[采集备份日志](../user-guide/collect-backup-logs.md)功能为所有 Duplicati 服务器采集备份日志。
:::


2. **可选 - 允许远程 UI 访问：** 若要从 **duplistatus** 仪表板链接直接访问 Duplicati Web 界面，请登录 [Duplicati UI](https://docs.duplicati.com/getting-started/set-up-a-backup-in-the-ui)，选择 `Settings`，并允许远程访问，包括主机名列表（或使用 `*`）。若跳过此步骤，**duplistatus** 仍会接收备份报告，但指向 Duplicati UI 的直接链接将无法工作。


:::info
若未在 Duplicati 中启用远程访问，**Duplicatus** 中访问 __Duplicati UI__ 的链接将无法工作。 
:::


![Duplicati settings](/img/duplicati-settings.png)


:::caution
仅在 Duplicati 服务器受安全网络保护
（例如 VPN、私有 LAN 或防火墙规则）时启用远程访问。在未采取适当安全措施的情况下将 Duplicati 界面暴露于公网
可能导致未经授权的访问。

建议使用 Tailscale、Headscale、NetBird、ZeroTier、Nebula、Twingate、Pritunl、Cloudflare Access、Wireguard 或类似方案，从本地网络外安全访问服务器。
:::
