# 仪表板 {#dashboard}

## 仪表板概览 {#dashboard-summary}

本节显示全部备份的汇总统计信息。

![仪表板概览 - 概览](../assets/screen-dashboard-summary.png)
![仪表板概览 - 表格](../assets/screen-dashboard-summary-table.png)

- **服务器总数**: 监控的服务器数量。                                                                                                             
- **备份任务总数**: 为所有服务器配置的备份任务（类型）总数。                                                                                
- **备份运行总数**: 收到或已采集的所有服务器的备份日志总数。                                                                   
- **备份总大小**: 基于收到的最新备份日志的所有源数据的总大小。
- **已用存储总量**：基于最新备份日志，备份目的地（例如云存储、FTP 服务器、本地驱动器）上备份所占用的总存储空间。
- **已上传总大小**：从 Duplicati 服务器上传到目的地（例如本地存储、FTP、云提供商）的数据总量。
- **逾期备份**（表格）：逾期备份的数量。请参阅 [备份通知设置](settings/backup-notifications-settings.md)。
- **布局切换**：在卡片布局（默认）和表格布局之间切换。

:::tip 看到重复的服务器？
如果同一个服务器在仪表板上出现多次，请使用 [设置 → 数据库维护 → 合并重复服务器](settings/database-maintenance.md#merge-duplicate-servers) 将其合并。当您重新安装或升级 Duplicati 时，可能会出现重复项，因为服务器的 `machine_id` 可能会发生变化，随后 **duplistatus** 会将其视为新服务器。
:::

## 服务器筛选 {#server-filtering}

您可以使用应用程序工具栏中的搜索字段来筛选仪表板上显示的服务器和备份。点击筛选图标 <IconButton icon="lucide:search" /> 即可显示搜索字段。

**筛选匹配项：**
- 服务器 ID
- 服务器 URL
- 备份任务名称

**范围：**
- 同时筛选仪表板上的卡片视图和表格视图
- 会话状态通过仪表板服务器筛选提供程序（Dashboard Server Filter Provider）维护
- 在刷新或离开仪表板时清除

这使得在许多被监控的系统中快速定位特定服务器或备份变得非常简单。

## 卡片布局 {#cards-layout}

卡片布局显示每个备份接收到的最新备份日志的状态。

![Card layout](../assets/duplistatus_dash-cards.svg)

- **服务器名称**：Duplicati 服务器的名称（或别名）
  - 将鼠标悬停在 **服务器名称** 上将显示服务器名称和备注
- **总体状态**：服务器的状态。逾期备份将显示为 **警告** 状态
- **汇总信息**：该服务器所有备份的文件总数、大小和已用存储的汇总。同时显示接收到的最新备份的经过时间（悬停以显示时间戳）
- **备份列表**：一个包含为此服务器配置的所有备份的表格，共有 3 列：
  - **备份名称**：Duplicati 服务器中的备份名称
  - **状态历史**：接收到的最后 10 次备份的状态。
  - **上次接收到的备份**：自接收到最后一条日志以来至今经过的时间。如果备份逾期，将显示警告图标。
    - 时间以缩写格式显示：`m` 表示分钟，`h` 表示小时，`d` 表示天，`w` 表示周，`mo` 表示月，`y` 表示年。

卡片的排序顺序和其他配置可以在 [显示设置](settings/display-settings.md) 中设置。

面板视图提供两种信息显示方式，可通过点击侧面板右上角的按钮访问：

- 状态：按状态显示备份任务的统计信息，并列出逾期备份以及处于警告/错误状态的备份任务。

![status panel](../assets/screen-overview-side-status.png)

- 指标：显示聚合或所选服务器随时间变化的持续时间、文件大小和存储大小的图表。

![charts panel](../assets/screen-overview-side-charts.png)

### 备份详情 {#backup-details}

将鼠标悬停在列表中的备份上，将显示接收到的上次备份日志的详情以及任何逾期信息。

![Overdue details](../assets/screen-backup-tooltip.png)

- **服务器名称 : 备份**：Duplicati 服务器和备份的名称或别名，还将显示服务器名称和备注。
  - 别名和备注可以在 [设置 → 服务器设置](settings/server-settings.md) 中配置。
- **通知**：一个图标，显示新备份日志的 [配置通知](#notifications-icons) 设置。
- **日期**：备份的时间戳以及自上次屏幕刷新以来经过的时间。
- **状态**：接收到的上次备份的状态（成功、警告、错误、致命）。
- **持续时间, 文件数, 文件大小, 存储大小, 已上传大小**：由 Duplicati 服务器报告的值。
- **可用版本**：备份时存储在备份目标中的备份版本数量。

如果此备份逾期，工具提示还将显示：

- **预期备份**：预期备份的时间，包括配置的宽限期（在标记为逾期前允许的额外时间）。

您还可以点击底部的按钮打开 [设置 → 备份通知](settings/backup-notifications-settings.md) 以配置监控设置，或打开 Duplicati 服务器的 Web 界面。

## 表格布局 {#table-layout}

表格布局列出了所有服务器和备份接收到的最新备份日志。

![Dashboard Table Mode](../assets/screen-main-dashboard-table-mode.png)

- **服务器名称**：Duplicati 服务器的名称（或别名）
  - 名称下方是服务器备注
- **备份名称**：Duplicati 服务器中的备份名称。
- **可用版本**：存储在备份目标中的备份版本数量。如果图标为灰色，则表示日志中未接收到详细信息。详情请参阅 [Duplicati 配置说明](../installation/duplicati-server-configuration.md)。
- **备份数量**：Duplicati 服务器报告的备份数量。
- **上次备份日期**：接收到的上次备份日志的时间戳以及自上次屏幕刷新以来经过的时间。
- **上次备份状态**：接收到的上次备份的状态（成功、警告、错误、致命）。
- **持续时间**：备份的持续时间，格式为 HH:MM:SS。
- **警告/错误**：备份日志中报告的警告/错误数量。
- **设置**：
  - **通知**：一个图标，显示为新备份日志配置的通知设置。
  - **Duplicati 配置**：用于打开 Duplicati 服务器 Web 界面的按钮

您可以使用 [显示设置](settings/display-settings.md) 来配置表格大小和其他配置。

### 通知图标 {#notifications-icons}

| 图标                                                                                                                               | 通知选项 | 描述                                                                                         |
|------------------------------------------------------------------------------------------------------------------------------------|---------------------|-----------------------------------------------------------------------------------------------------|
| <IconButton icon="lucide:message-square-off" style={{border: 'none', padding: 0, color: '#9ca3af', background: 'transparent'}} />  | 关闭                 | 接收到新备份日志时不会发送通知                                                                    |
| <IconButton icon="lucide:message-square-more" style={{border: 'none', padding: 0, color: '#60a5fa', background: 'transparent'}} /> | 全部                 | 无论状态如何，每个新备份日志都将发送通知。                                                       |
| <IconButton icon="lucide:message-square-more" style={{border: 'none', padding: 0, color: '#fbbf24', background: 'transparent'}} /> | 警告            | 仅为状态为警告、未知、错误或致命的备份日志发送通知。 |
| <IconButton icon="lucide:message-square-more" style={{border: 'none', padding: 0, color: '#f87171', background: 'transparent'}} /> | 错误              | 仅为状态为错误或致命的备份日志发送通知。                    |

:::note
此通知设置仅在 **duplistatus** 从 Duplicati 服务器接收到新备份日志时适用。逾期通知单独配置，无论此设置如何都会发送。
:::

### 逾期详情 {#overdue-details}

将鼠标悬停在逾期警告图标上可显示关于逾期备份的详情。

![Overdue details](../assets/screen-overdue-backup-hover-card.png)

- **检查**: 上次执行逾期检查的时间。在 [备份通知设置](settings/backup-notifications-settings.md) 中配置频率。
- **上次备份**: 接收到上次备份日志的时间。
- **预期备份**: 预期备份的时间，包括配置的宽限期（在标记为逾期前允许的额外时间）。
- **上次通知**: 发送上次逾期通知的时间。

### 可用备份版本 {#available-backup-versions}

点击蓝色时钟图标可打开 Duplicati 服务器报告的备份时的可用备份版本列表。

![Available versions](../assets/screen-available-backups-modal.png)

- **备份详情**: 显示服务器名称和别名、服务器备注、备份名称以及备份执行的时间。
- **版本详情**: 显示版本数字、创建日期和年龄。

:::note
如果图标为灰色，则表示在消息日志中未收到详细信息。
有关详情，请参阅 [Duplicati 配置说明](../installation/duplicati-server-configuration.md)。
:::
