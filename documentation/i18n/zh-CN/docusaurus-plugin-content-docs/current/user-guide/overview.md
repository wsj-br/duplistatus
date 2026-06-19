# 概览 {#overview}

欢迎使用 duplistatus 用户指南。本综合文档提供了使用 duplistatus 监控和管理跨多个服务器的 Duplicati 备份操作的详细说明。

## 什么是 duplistatus？ {#what-is-duplistatus}

duplistatus 是一个专为 Duplicati 备份系统设计的强大监控仪表板。它提供：

- 通过单一界面集中监控多个 Duplicati 服务器
- 所有备份操作的实时状态跟踪
- 具有可配置警报的自动化逾期备份检测
- 备份性能的综合指标和可视化
- 通过 NTFY 和 邮件 实现的灵活通知系统
- 多语言支持（英语、法语、德语、西班牙语和巴西葡萄牙语）。

## 安装 {#installation}

有关先决条件和详细的安装说明，请参阅 [安装指南](../installation/installation.md)。

## 访问仪表板 {#accessing-the-dashboard}

安装成功后，请按照以下步骤访问 duplistatus Web 界面：

1. 打开您首选的 Web 浏览器
2. 导航至 `http://your-server-ip:9666`
   - 将 `your-server-ip` 替换为您 duplistatus 服务器的实际 IP 地址或 主机名
   - 默认 端口 为 `9666`
3. 您将看到登录页面。

首次使用（或从 0.9.x 之前的版本升级后）请使用以下凭据：
    - 用户名: `admin`
    - 密码: `Duplistatus09`

在右上角 <IconButton icon="lucide:languages" label="语言" /> 选择用户界面 语言 ，或在登录后的 <IconButton icon="lucide:user" label="用户名" /> 中选择（见下文）。

4. 登录后，主仪表板将自动显示（首次使用时无数据）

## 用户界面概览 {#user-interface-overview}

duplistatus 提供了一个直观的仪表板，用于监控整个基础设施中的 Duplicati 备份操作。

![Dashboard Overview](../assets/screen-main-dashboard-card-mode.png)

用户界面分为几个关键部分，以提供清晰且全面的监控体验：

1. [应用程序工具栏](#application-toolbar)：快速访问基本功能和配置
2. [仪表板摘要](dashboard.md#dashboard-summary)：所有受监控服务器的 概览 统计
3. 服务器概览：显示 全部备份 最新状态的 [卡片布局](dashboard.md#cards-layout) 或 [表格布局](dashboard.md#table-layout)
4. [逾期详情](dashboard.md#overdue-details)：逾期备份的可视化 警告 ，悬停可查看详细信息
5. [可用备份版本](dashboard.md#available-backup-versions)：点击蓝色图标以查看目标位置的 可用备份版本
6. [备份指标](backup-metrics.md)：显示备份性能随时间变化的交互式图表
7. [服务器详情](server-details.md)：特定服务器已记录备份的综合列表，包括详细 统计
8. [备份详情](server-details.md#backup-details)：单个备份的深入信息，包括执行日志、 警告 和 错误

## 应用程序工具栏 {#application-toolbar}

应用程序工具栏提供了对关键功能和设置的便捷访问，并经过组织以实现高效的工作流程。

![Application toolbar](../assets/duplistatus_toolbar.svg)

| 按钮                                                                                                                                           | 描述                                                                                                                                                                                |
|--------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| <IconButton icon="lucide:search" /> &nbsp; 筛选                                                                                            | 按 ID、URL 或备份作业名称搜索和筛选服务器。                                                      |
| <IconButton icon="lucide:rotate-ccw" /> &nbsp; 刷新屏幕                                                                                    | 立即手动刷新所有数据的屏幕显示                                                                                                                                     |
| <IconButton label="自动刷新" />                                                                                                              | 启用或禁用自动刷新功能。在 [显示设置](settings/display-settings.md) 中配置 <br/> _右键单击_ 以打开显示设置页面                         |
| <SvgButton svgFilename="ntfy.svg" /> &nbsp; 打开 NTFY                                                                                            | 访问您配置的通知主题的 ntfy.sh 网站。 <br/> _右键单击_ 以显示 QR 码，从而配置您的设备以接收来自 duplistatus 的通知。               |
| <SvgButton svgFilename="duplicati_logo.svg" href="duplicati-configuration" /> &nbsp; [Duplicati 配置](duplicati-configuration.md)       | 打开所选 Duplicati 服务器的 Web 界面 <br/> _右键单击_ 在新建标签页中打开 Duplicati 旧版 UI (`/ngax`)                                                              |
| <IconButton icon="lucide:download" href="collect-backup-logs" /> &nbsp; [采集日志](collect-backup-logs.md)                                   | 连接到 Duplicati 服务器并检索备份日志 <br/> _右键单击_ 以采集所有已配置服务器的日志                                                                       |
| <IconButton icon="lucide:settings" href="settings/backup-notifications-settings" /> &nbsp; [设置](settings/backup-notifications-settings.md) | 配置通知、监控、SMTP 服务器和通知模板                                                                                                               |
| <IconButton icon="lucide:user" label="用户名" />                                                                                               | 显示已连接的用户、用户类型 (`Admin`, `User`)，点击可打开用户菜单（包含语言选择）。更多信息请参阅 [用户管理](settings/user-management-settings.md)               |
| <IconButton icon="lucide:book-open-text" href="overview" /> &nbsp; 用户指南                                                                    | 打开 [用户指南](overview.md) 中与您当前查看的页面相关的章节。工具提示显示“ [页面名称] 的帮助”以指示将打开哪部分文档。 |

### 用户菜单 {#user-menu}

点击用户按钮将打开一个包含用户特定选项的下拉菜单。菜单选项根据您是以管理员还是普通用户登录而有所不同。两种角色都可以通过 **语言** 子菜单更改界面语言。支持的语言：英语、法语、德语、西班牙语和巴西葡萄牙语。

<table>
  <tr>
    <th>管理员</th>
    <th>普通用户</th>
  </tr>
  <tr>
    <td style={{verticalAlign: 'top'}}>![用户菜单 - 管理员](../assets/screen-user-menu-admin.png)</td>
    <td style={{verticalAlign: 'top'}}>![用户菜单 - 用户](../assets/screen-user-menu-user.png)</td>
  </tr>
</table>

## 核心配置 {#essential-configuration}

1. 配置您的 [Duplicati 服务器](../installation/duplicati-server-configuration.md) 以将备份日志消息发送至 duplistatus（必填）。
2. 采集初始备份日志 – 使用 [采集备份日志](collect-backup-logs.md) 功能，将所有 Duplicati 服务器的历史备份数据填充到数据库中。此操作还会根据每台服务器的配置自动更新备份监控间隔。
3. 配置服务器设置 – 在 [设置 → 服务器](settings/server-settings.md) 中设置服务器别名和备注，使您的仪表板提供更多有用信息。
4. 配置 NTFY 设置 – 在 [设置 → NTFY](settings/ntfy-settings.md) 中设置通过 NTFY 发送通知。
5. 配置邮件设置 – 在 [设置 → 邮件](settings/email-settings.md) 中设置邮件通知。
6. 配置备份通知 – 在 [设置 → 备份通知](settings/backup-notifications-settings.md) 中设置针对单个备份或单个服务器的通知。

<br/>

:::info[IMPORTANT]
请记得按照 [Duplicati 配置](../installation/duplicati-server-configuration.md) 章节所述，配置 Duplicati 服务器将备份日志发送至 duplistatus。
:::

<br/>

:::note
所有产品名称、徽标和商标均为其各自所有者的财产。图标和名称仅用于识别目的，并不暗示认可。
:::
