# 欢迎使用 duplistatus {#welcome-to-duplistatus}

**duplistatus** - 从单一仪表板监控多个 [Duplicati](https://github.com/duplicati/duplicati) 服务器

## 功能 {#features}

- **快速设置**：简单的容器化部署，可在 Docker Hub 和 GitHub 上获取镜像。
- **统一仪表板**：在一个地方查看所有服务器的备份状态、历史和详情。
- **备份监控**：自动检查并对逾期的计划备份发出警报。
- **数据可视化和日志**：从 Duplicati 服务器收集交互式图表和自动日志。
- **通知和警报**：集成 NTFY 和 SMTP 邮件支持，包括逾期备份通知的备份警报。
- **用户访问控制和安全**：具有基于角色的访问控制（管理员/用户角色）的安全认证系统，可配置密码策略、账户锁定保护和全面的用户管理。
- **审计日志**：所有系统更改和用户操作的完整审计跟踪，具有高级过滤、导出功能和可配置的保留期。
- **应用程序日志查看器**：仅管理员可访问的界面，可直接从 Web 界面查看、搜索和导出应用程序日志，并具有实时监控功能。
- **多语言支持**：界面和文档提供英语、法语、德语、西班牙语和巴西葡萄牙语版本。

## 安装 {#installation}

可以使用 Docker、Portainer Stacks 或 Podman 部署应用程序。
详情请参见[安装指南](installation/installation.md)。

- 如果您从早期版本升级，数据库将在升级过程中自动
[迁移](migration/version_upgrade.md)到新架构。

- 使用 Podman（作为独立容器或在 pod 中），如果需要自定义 DNS 设置
（如 Tailscale MagicDNS、企业网络或其他自定义 DNS 配置），可以手动
指定 DNS 服务器和搜索域。详情请参见安装指南。

## Duplicati 服务器配置（必填） {#duplicati-servers-configuration-required}

一旦 **duplistatus** 服务器启动并运行，您需要配置 **Duplicati** 服务器以
向 **duplistatus** 发送备份日志，具体请参见安装指南中的 [Duplicati 配置](installation/duplicati-server-configuration.md) 
部分。没有此配置，仪表板将无法接收来自 Duplicati 服务器的备份数据。

## 用户指南 {#user-guide}

请参见[用户指南](user-guide/overview.md)，了解如何配置和使用 **duplistatus** 的详细说明，包括初始设置、功能配置和故障排除。

## 截图 {#screenshots}

### 仪表板 {#dashboard}

![dashboard](assets/screen-main-dashboard-card-mode.png)

### 备份历史 {#backup-history}

![server-detail](assets/screen-server-backup-list.png)

### 备份详情 {#backup-details}

![backup-detail](assets/screen-backup-detail.png)

### 逾期备份 {#overdue-backups}

![overdue backups](assets/screen-overdue-backup-hover-card.png)

### 手机上的逾期通知 {#overdue-notifications-on-your-phone}

![ntfy overdue message](/img/screen-overdue-notification.png)

## API 参考 {#api-reference}

有关可用端点、请求/响应格式和示例的详情，请参阅 [API 端点文档](api-reference/overview.md)。

## 开发 {#development}

有关下载、修改或运行代码的说明，请参阅 [开发环境搭建](development/setup.md)。

本项目主要在 AI 的帮助下构建。要了解具体方法，请参阅 [我如何使用 AI 工具构建此应用程序](development/how-i-build-with-ai)。

## 致谢 {#credits}

- 首先，感谢 Kenneth Skovhede 创建了 Duplicati——这个强大的备份工具。同时也感谢所有贡献者。

💙 如果您觉得 [Duplicati](https://www.duplicati.com) 有用，请考虑支持开发者。更多详情可在其网站或 GitHub 页面上找到。

- Duplicati SVG 图标来自 https://dashboardicons.com/icons/duplicati
- ntfy SVG 图标来自 https://dashboardicons.com/icons/ntfy
- GitHub SVG 图标来自 https://github.com/logos

:::note
 全部产品名称、徽标和商标均为其各自所有者的财产。图标和名称仅用于识别目的，并不暗示认可。
:::


## 许可证 {#license}

本项目基于 [Apache License 2.0](LICENSE.md) 授权。   

**Copyright © 2026 Waldemar Scudeller Jr.**
