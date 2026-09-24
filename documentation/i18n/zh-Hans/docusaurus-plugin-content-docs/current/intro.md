# 欢迎使用 duplistatus {/* #welcome-to-duplistatus */}

**duplistatus** - 从单个仪表板监控多个 [Duplicati](https://github.com/duplicati/duplicati) 服务器

## 功能特性 {/* #features */}

- **快速设置**：简单的容器化部署，镜像可在 Docker Hub 和 GitHub 上获取。
- **统一仪表板**：在一个地方查看所有服务器的备份状态、历史记录、Duplicati 版本和详细信息。
- **备份监控**：自动检查和提醒逾期的计划备份。
- **数据可视化和日志**：来自 Duplicati 服务器的交互式图表和自动日志收集。
- **通知与警报**：集成 NTFY 和 SMTP 邮件支持以发送备份警报，包括逾期备份通知。
- **用户管理**：支持管理员和用户角色登录，提供可配置的密码策略、账户锁定以及用户管理功能。
- **安全配置**：可选的额外防护，为 duplicati 上传和主页小组件提供 API 密钥（含上传大小和速率限制），为管理界面和外部API设置独立的 IP 白名单，并提供防欺骗保护和 HTTPS 反向代理指南。
- **审计日志**：提供所有系统更改和用户操作的完整审计轨迹，支持高级筛选、导出功能及可配置的保留期限。
- **应用程序日志查看器**：仅限管理员的界面，可直接从 Web 界面查看、搜索和导出应用程序日志，具有实时监控功能。
- **多语言支持**：界面和文档提供英语、法语、德语、西班牙语、巴西葡萄牙语、印地语和简体中文。

## 安装 {/* #installation */}

该应用程序可以使用 Docker、Portainer 堆栈或 Podman 进行部署。
详情请参见 [安装指南](installation/installation.md)。

- 如果您从早期版本升级，您的数据库将在升级过程中自动
  [迁移](migration/version_upgrade.md) 到新架构。

- 使用 Podman（无论是作为独立容器还是在 pod 内）时，如果需要自定义 DNS 设置
（例如用于 Tailscale MagicDNS、企业网络或其他自定义 DNS 配置），您可以手动
指定 DNS 服务器和搜索域。详情请参见安装指南。

## Duplicati 服务器配置（必需） {/* #duplicati-servers-configuration-required */}

当您的 **duplistatus** 服务器启动并运行后，您需要配置您的 **Duplicati** 服务器以
将备份日志发送到 **duplistatus**，如安装指南中的 [Duplicati 配置](installation/duplicati-server-configuration.md)
部分所述。没有此配置，仪表板将无法从您的 Duplicati 服务器接收备份数据。

## 用户指南 {/* #user-guide */}

请参见 [用户指南](user-guide/overview.md) 获取有关如何配置和使用 **duplistatus** 的详细说明，包括初始设置、功能配置和故障排除。

## 截图 {/* #screenshots */}

### 仪表板 {/* #dashboard */}

![dashboard](assets/screen-main-dashboard-card-mode.png)

### 备份历史 {/* #backup-history */}

![server-detail](assets/screen-server-backup-list.png)

### 备份详细信息 {/* #backup-details */}

![备份详情](assets/screen-backup-detail.png)

### 过期备份 {/* #overdue-backups */}

![过期备份](assets/screen-overdue-backup-hover-card.png)

### 手机上的过期通知 {/* #overdue-notifications-on-your-phone */}

![ntfy 过期消息](/img/screen-overdue-notification.png)

## API 参考 {/* #api-reference */}

有关可用端点、请求/响应格式和示例的详细信息，请参阅 [API 端点文档](api-reference/overview.md)。

## 开发 {/* #development */}

有关下载、更改或运行代码的说明，请参阅 [开发设置](development/setup.md)。

此项目主要在 AI 帮助下构建。要了解如何实现，请参阅 [我如何使用 AI 工具构建此应用程序](development/how-i-build-with-ai)。

## 致谢 {/* #credits */}

- 首先，感谢 Kenneth Skovhede 创建了 Duplicati——这款出色的备份工具。同时感谢所有贡献者。

💙 如果您觉得 [Duplicati](https://www.duplicati.com) 有用，请考虑支持开发者。更多详细信息可在其网站或 GitHub 页面上找到。

- API 密钥和 IP 白名单功能的想法/实现由 `henmohr` 在问题 [#79](https://github.com/wsj-br/duplistatus/issues/79) 中提供
- Duplicati SVG 图标来自 https://dashboardicons.com/icons/duplicati
- ntfy SVG 图标来自 https://dashboardicons.com/icons/ntfy
- GitHub SVG 图标来自 https://github.com/logos

:::note
 所有产品名称、标志和商标均为其各自所有者的财产。图标和名称仅用于识别目的，不暗示任何认可。
:::

## 许可证 {/* #license */}

该项目根据 [Apache 许可证 2.0](LICENSE.md) 授权。

**Copyright © 2026 Waldemar Scudeller Jr.**

<small>

> **关于 UI 和文档翻译的说明：** 除英语（英国）外，所有界面和文档语言均使用 [ai-i18n-tools](https://wsj-br.github.io/ai-i18n-tools/) 通过 AI 进行翻译；措辞可能不够精确或包含错误。

</small>
