
# 欢迎使用 duplistatus {#welcome-to-duplistatus}

**duplistatus** - 从单一仪表板监控多个 [Duplicati](https://github.com/duplicati/duplicati) 服务器

## 功能 {#features}

- **快速部署**：简单的容器化部署，镜像可在 Docker Hub 和 GitHub 获取。
- **统一仪表板**：在一处查看所有服务器的备份状态、历史和详情。
- **备份监控**：自动检查并告警逾期的计划备份。
- **数据可视化与日志**：交互式图表，以及从 Duplicati 服务器自动采集日志。
- **通知与告警**：集成 NTFY 和 SMTP 电子邮件，支持备份告警及逾期备份通知。
- **用户访问控制与安全**：安全认证系统，支持基于角色的访问控制（管理员/用户角色）、可配置密码策略、账户锁定保护及全面的用户管理。
- **审计日志**：完整记录所有系统变更和用户操作，支持高级筛选、导出及可配置保留期。
- **应用程序日志查看器**：仅限管理员，可在 Web 界面中查看、搜索和导出应用程序日志，支持实时监控。
- **多语言支持**：界面和文档提供英语、法语、德语、西班牙语、巴西葡萄牙语和简体中文。


## 安装 {#installation}

可使用 Docker、Portainer Stacks 或 Podman 部署应用。
详见[安装指南](installation/installation.md)。


- 若从较早版本升级，数据库将在升级过程中自动[迁移](migration/version_upgrade.md)到新架构。

- 使用 Podman（独立容器或 Pod 内）且需要自定义 DNS 设置
（例如 Tailscale MagicDNS、企业网络或其他自定义 DNS 配置）时，可手动
指定 DNS 服务器和搜索域。详见安装指南。

## Duplicati 服务器配置（必需） {#duplicati-servers-configuration-required}

**duplistatus** 服务器运行后，需配置 **Duplicati** 服务器
向 **duplistatus** 发送备份日志，详见安装指南中的 [Duplicati 配置](installation/duplicati-server-configuration.md)
部分。未进行此配置，仪表板将无法从 Duplicati 服务器接收备份数据。

## 用户指南 {#user-guide}

详见[用户指南](user-guide/overview.md)，了解如何配置和使用 **duplistatus**，包括初始设置、功能配置和故障排除。

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

详见 [API 端点文档](api-reference/overview.md)，了解可用端点、请求/响应格式及示例。

## 开发 {#development}

有关下载、修改或运行代码的说明，请参阅[开发环境设置](development/setup.md)。

本项目主要在 AI 辅助下构建。了解详情，请参阅[如何使用 AI 工具构建本应用](development/how-i-build-with-ai)。

## 致谢 {#credits}

- 首先感谢 Kenneth Skovhede 创建了 Duplicati 这一出色的备份工具，也感谢所有贡献者。

  💙 若您觉得 [Duplicati](https://www.duplicati.com) 有用，请考虑支持开发者。更多信息请访问其网站或 GitHub 页面。

- Duplicati SVG 图标来自 https://dashboardicons.com/icons/duplicati
- ntfy SVG 图标来自 https://dashboardicons.com/icons/ntfy
- GitHub SVG 图标来自 https://github.com/logos

:::note
 所有产品名称、徽标和商标均为各自所有者所有。图标和名称仅用于识别，不表示背书。
 :::


## 许可证 {#license}

本项目采用 [Apache License 2.0](LICENSE.md) 许可。   

**Copyright © 2026 Waldemar Scudeller Jr.**
