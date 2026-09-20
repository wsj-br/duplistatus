# Duplicati 服务器配置（必需）{/* #duplicati-server-configuration-required */}

为了使此应用程序正常工作，您需要将每个 Duplicati 服务器配置为在每次备份运行时向 **duplistatus** 服务器发送 HTTP 报告。

将此配置应用到您的每个 Duplicati 服务器：

1. **配置备份结果报告：** 在 Duplicati 配置页面上，选择 `Settings`，并在 `Default Options` 部分中包含以下选项。

![Duplicati 配置](/img/duplicati-options.png)

将 `my.local.server` 替换为 Duplicati 服务器用于访问 **duplistatus** 的主机名或 IP 地址。如果两者在同一台机器上运行，请参阅 [同一主机上的 Duplicati 和 duplistatus](#duplicati-and-duplistatus-on-the-same-host)。

有关选项参考，请参阅 Duplicati 的 [HTTP 通知](https://docs.duplicati.com/monitoring-and-notifications/sending-reports-via-email/sending-http-notifications) 文档。

### 推荐选项（Duplicati 2.0.9.106 及更高版本）{/* #recommended-options-duplicati-209106-and-later */}

`--send-http-json-urls` 已经发送 JSON，因此不需要 `--send-http-result-output-format=Json`（对于这些 URL 将被忽略）。

| 高级选项           | 值                                    |
    | ------------------------- | ---------------------------------------- |
    | `send-http-json-urls`     | `http://my.local.server:9666/api/upload`（当需要 API 密钥时添加 `?api_key=`） |
    | `send-http-log-level`            | `Information`                            |
    | `send-http-max-log-lines`        | `500`                                    |

或者，您可以单击 `Edit as text` 并复制下面的行，将 `my.local.server` 替换为您实际的服务器地址。

```bash
--send-http-json-urls=http://my.local.server:9666/api/upload
--send-http-log-level=Information
--send-http-max-log-lines=500
```

当需要 [API 密钥](../user-guide/settings/api-keys-settings.md) 时，在 URL 后附加上传范围密钥：

```bash
--send-http-json-urls=http://my.local.server:9666/api/upload?api_key=YOUR_UPLOAD_KEY
```

Duplicati 无法设置自定义 HTTP 标头。查询参数是发送密钥的受支持方式。反向代理访问日志将包含密钥，因此请限制可读取这些日志的人员。

`--send-http-max-log-lines=500` 保持 JSON 报告远低于默认的 5 MB 上传大小限制。`--send-http-max-log-lines=0`（无限制）可能超过该限制并返回 HTTP 413。如果需要更大的报告，请在设置 → API 密钥中增加限制。

### 较旧的 Duplicati 版本 {/* #older-duplicati-versions */}

如果您的 Duplicati 服务器早于 2.0.9.106，请使用传统 URL 选项并将结果格式设置为 JSON：

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

### 日志行数和可用版本 {/* #log-lines-and-available-versions */}

**关于 Duplicati 发送消息的重要说明：**

- 如果你省略 `--send-http-log-level=Information`，将不会向 **duplistatus** 发送任何日志消息，仅发送统计数据。这将导致可用版本 **list** 无法工作。
- Duplicati 的默认值是 `--send-http-max-log-lines=100`。推荐值是 `500`。Duplicati 保留 **first** N 条日志行。可用版本列表使用的行（`Backups to consider`）通常在前几百行中；`100` 通常太少了。
- `--send-http-max-log-lines=0` 表示无限制。仅当版本列表仍然缺失且你 **not** 也没有向 [Duplicati 监控](https://www.duplicati-monitoring.com/) 发送报告时才使用该选项。无限制日志可能会导致该服务在大型任务上返回 HTTP 500。
- 可用版本的 **count** 仍然来自 JSON 统计数据（`BackupListCount`），即使详细的时间戳列表缺失也是如此。如果列表图标呈灰显状态，请提高上限（或在仅向 **duplistatus** 报告时使用 `0`）。

:::tip
配置 **duplistatus** 服务器后，使用 [收集备份日志](../user-guide/collect-backup-logs.md) 收集所有 Duplicati 服务器的备份日志。
:::

### 向 duplistatus 和 Duplicati 监控报告 {/* #reporting-to-duplistatus-and-duplicati-monitoring */}

您可以从**同一** Duplicati 服务器同时向 **duplistatus** 和 [Duplicati 监控](https://www.duplicati-monitoring.com/) 发送报告。**duplistatus** 必须接收 JSON。Duplicati 监控期望表单编码的报告。不要将 `--send-http-form-urls` 指向 `/api/upload`。

在该 Duplicati 服务器上，将默认选项设置为：

```bash
--send-http-json-urls=http://my.local.server:9666/api/upload
--send-http-form-urls=https://www.duplicati-monitoring.com/log/<your-endpoint>
--send-http-log-level=Information
--send-http-max-log-lines=500
```

将 `<your-endpoint>` 替换为您 Duplicati 监控账户中的 URL。

- 优先使用这些专用选项。除非您仍需要旧版选项，否则不要再让 `--send-http-url` 指向相同的目标。
- `--send-http-log-level` 和 `--send-http-max-log-lines` 适用于**每个** HTTP 目标。您不能向 **duplistatus** 发送完整日志而向 Duplicati 监控发送简短报告。
- 使用 `500`，而不是 `0`。如果 Duplicati 监控在大型作业上仍返回 HTTP 500，请进一步降低上限（或省略 `Information`），但要知道版本**列表**可能缺失。如果列表缺失但监控正常，请提高上限。或者，对于这些作业仅向 **duplistatus** 报告。

:::caution
如果一个 HTTP 目标失败（停机或 HTTP 500），Duplicati 可能不会发送剩余报告。表单 URL 首先发送，然后是 JSON URL。因此，Duplicati 监控的停机或 500 错误可能会阻止 JSON 报告发送到 **duplistatus**。
:::

[收集备份日志](../user-guide/collect-backup-logs.md) 不依赖于 HTTP 报告。使用它来补全未收到的运行。

### Duplicati 和 duplistatus 在同一主机上 {/* #duplicati-and-duplistatus-on-the-same-host */}

上传 URL 必须可以从**Duplicati 进程**访问，而不是从您的浏览器访问。

- **Duplicati 在主机上，duplistatus 在 Docker 中并发布端口 `9666`：** `http://127.0.0.1:9666/api/upload` （或主机局域网 IP）。
- **都在共享网络上的 Docker 中：** `http://duplistatus:9666/api/upload` （Compose 服务或容器名称）。`localhost` 在 Duplicati 容器内部是指该容器，而不是 **duplistatus**。
- **同一主机上的 HTTPS 反向代理：** 使用公共 HTTPS URL，如 [安全强化](security-hardening.md) 中所述。

收集备份日志是相反方向：从 **duplistatus** 容器来看，`localhost:8200` 不是主机上的 Duplicati。使用主机 IP、`host.docker.internal` （Docker Desktop 或您配置的额外主机）或 Duplicati 容器名称。

2. **可选 - 允许远程 UI 访问：** 如果您想直接从 **duplistatus** 仪表板链接访问 Duplicati 网页界面，请登录到 [Duplicati 的 UI](https://docs.duplicati.com/getting-started/set-up-a-backup-in-the-ui)，选择 `Settings`，并允许远程访问，包括主机名列表（或使用 `*`）。如果您跳过此步骤，**duplistatus** 仍将接收备份报告，但指向 Duplicati UI 的直接链接将无法工作。

:::info
如果您未在 duplicati 中启用远程访问，**duplistatus** 中用于访问 __duplicati UI__ 的链接将无法工作。
:::

![duplicati 设置](/img/duplicati-settings.png)

:::caution
仅当您的 duplicati 服务器受到安全网络保护时（例如 VPN、私有局域网或防火墙规则）才启用远程访问。在没有适当安全措施的情况下将 duplicati 界面暴露给公共互联网可能会导致未授权访问。

建议使用 Tailscale、Headscale、NetBird、ZeroTier、Nebula、Twingate、Pritunl、Cloudflare Access、Wireguard 或类似解决方案从本地网络外部安全地访问您的服务器。
:::
