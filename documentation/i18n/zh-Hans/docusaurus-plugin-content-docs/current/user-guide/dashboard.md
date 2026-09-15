# 仪表板 {/* #dashboard */}

## 仪表板摘要 {/* #dashboard-summary */}

本节显示所有备份的聚合统计信息。

![仪表板摘要 - 概览](../assets/screen-dashboard-summary.png)
![仪表板摘要 - 表格](../assets/screen-dashboard-summary-table.png)

- **总服务器数**: 被监控的服务器数量。                                                                                                             
- **总备份作业数**: 为所有服务器配置的备份作业（类型）的总数。                                                                                
- **总备份运行数**: 收到或收集的所有服务器的备份日志的总数。                                                                   
- **总备份大小**: 基于最新接收到的备份日志，所有源数据的总大小。
- **总存储使用量**：基于最新接收的备份日志，备份在备份目标（例如云存储、FTP服务器、本地驱动器）上使用的总存储空间。
- **总上传大小**：从Duplicati服务器上传到目标（例如本地存储、FTP、云提供商）的数据总量。
- **过期备份**（表格）：过期备份的数量。请参阅[备份通知设置](settings/backup-notifications-settings.md)。
- **布局切换**：在卡片布局（默认）和表格布局之间切换。

:::tip 看到重复的服务器？
如果同一服务器在仪表板上出现多次，请使用[设置 → 数据库维护 → 合并重复服务器](settings/database-maintenance.md#merge-duplicate-servers)将其合并。重复可能发生在您重新安装或升级Duplicati时，因为服务器的`machine_id`可能会更改，**duplistatus**会将其视为新服务器。
:::

## 服务器过滤 {/* #server-filtering */}

您可以使用应用程序工具栏中的搜索字段过滤仪表板上显示的服务器和备份。点击过滤器图标<IconButton icon="lucide:search" />以显示搜索字段。

**过滤匹配项：**
- 服务器 ID
- 服务器 URL
- 备份作业名称

**范围：**
- 过滤仪表板上的卡片和表格视图
- 通过仪表板服务器过滤器提供程序维护会话状态
- 刷新或离开仪表板时清除

这使得在许多监控系统中快速定位特定服务器或备份变得容易。

## 卡片布局 {/* #cards-layout */}

卡片布局显示每个备份接收的最新备份日志的状态。

![卡片布局](../assets/duplistatus_dash-cards.svg)

- **服务器名称**：Duplicati服务器的名称（或别名）
  - 悬停在**服务器名称**上会显示服务器名称和注释
- **整体状态**：服务器的状态。过期备份将显示为**警告**状态
- **版本**：最新备份日志中的Duplicati版本，显示在状态指示器的左侧。请参阅[Duplicati服务器版本](#duplicati-server-version)。
- **摘要信息**：此服务器的所有备份的文件数量、大小和存储使用量的综合数字。还显示最新接收的备份的经过时间（悬停以显示时间戳）
- **备份列表**：包含此服务器配置的所有备份的表格，有3列：
  - **备份名称**：Duplicati服务器中的备份名称
  - **状态历史记录**：接收的最后10个备份的状态。
  - **最后备份接收**：自当前时间以来最后一个日志接收的经过时间。如果备份过期，它将显示警告图标。
    - 时间以缩写格式显示：`m`表示分钟，`h`表示小时，`d`表示天，`w`表示周，`mo`表示月，`y`表示年。

卡片排序顺序和其他配置可以在[显示设置](settings/display-settings.md)中设置。

面板视图提供两个信息显示，可通过点击侧面板右上角的按钮访问：

- 状态：按状态显示备份作业的统计信息，包括过期备份和带有警告/错误状态的备份作业列表。

![状态面板](../assets/screen-overview-side-status.png)

- 指标：显示聚合或选定服务器随时间变化的持续时间、文件大小和存储大小的图表。

![图表面板](../assets/screen-overview-side-charts.png)

### 备份详细信息 {/* #backup-details */}

将鼠标悬停在列表中的备份上会显示最后收到的备份日志的详细信息以及任何过期信息。

![过期详情](../assets/screen-backup-tooltip.png)

- **服务器名称 : 备份**：Duplicati 服务器和备份的名称或别名，还将显示服务器名称和备注。
  - 别名和备注可以在 [设置 → 服务器设置](settings/server-settings.md) 中配置。
- **通知**：显示新备份日志的[配置通知](#notifications-icons)设置的图标。
- **日期**：备份的时间戳和自上次屏幕刷新以来的经过时间。
- **状态**：最后收到的备份的状态（成功、警告、错误、致命）。
- **持续时间、文件数量、文件大小、存储大小、上传大小**：Duplicati 服务器报告的值。
- **可用版本**：备份时备份目标上存储的备份版本数量。

如果此备份已过期，工具提示还会显示：

- **预期备份**：备份预期的时间，包括配置的宽限期（在标记为过期之前允许的额外时间）。

您还可以单击底部的按钮打开 [设置 → 备份通知](settings/backup-notifications-settings.md) 以配置监控设置或打开 Duplicati 服务器的 Web 界面。

## 表格布局 {/* #table-layout */}

表格布局列出了所有服务器和备份收到的最新备份日志。

![仪表板表格模式](../assets/screen-main-dashboard-table-mode.png)

- **服务器名称**：Duplicati 服务器的名称（或别名）
  - 名称下方是服务器备注
- **备份名称**：Duplicati 服务器中的备份名称。
- **版本**：该备份作业的最新备份日志中的 Duplicati 版本。请参阅 [Duplicati 服务器版本](#duplicati-server-version)。
- **可用版本**：备份目标上存储的备份版本数量。如果图标显示为灰色，则未在日志中收到详细信息。请参阅 [Duplicati 配置说明](../installation/duplicati-server-configuration.md) 以了解详细信息。
- **备份计数**：Duplicati 服务器报告的备份数量。
- **最后备份日期**：最后收到的备份日志的时间戳和自上次屏幕刷新以来的经过时间。
- **最后备份状态**：最后收到的备份的状态（成功、警告、错误、致命）。
- **持续时间**：备份的持续时间，以 HH:MM:SS 格式显示。
- **警告/错误**：备份日志中报告的警告和错误的数量，显示为 `warnings/errors`（例如 `0/0`）。
- **设置**：
  - **通知**：显示新备份日志的配置通知设置的图标。
  - **Duplicati 配置**：打开 Duplicati 服务器 Web 界面的按钮

您可以使用 [显示设置](settings/display-settings.md) 配置表格大小和其他配置。

### 通知图标 {/* #notifications-icons */}

| 图标                                                                                                                               | 通知选项 | 描述                                                                                         |
|------------------------------------------------------------------------------------------------------------------------------------|---------------------|-----------------------------------------------------------------------------------------------------|
| <IconButton icon="lucide:message-square-off" style={{border: 'none', padding: 0, color: '#9ca3af', background: 'transparent'}} />  | 关闭                 | 收到新备份日志时不会发送通知                                     |
| <IconButton icon="lucide:message-square-more" style={{border: 'none', padding: 0, color: '#60a5fa', background: 'transparent'}} /> | 所有                 | 无论备份日志的状态如何，都会为每个新备份日志发送通知。                      |
| <IconButton icon="lucide:message-square-more" style={{border: 'none', padding: 0, color: '#fbbf24', background: 'transparent'}} /> | 警告            | 仅为状态为警告、未知、错误或致命的备份日志发送通知。 |
| <IconButton icon="lucide:message-square-more" style={{border: 'none', padding: 0, color: '#f87171', background: 'transparent'}} /> | 错误              | 仅为状态为错误或致命的备份日志发送通知。                    |

:::note
此通知设置仅适用于 **duplistatus** 收到来自 Duplicati 服务器的新备份日志时。过期通知单独配置，无论此设置如何都会发送。
:::

### 过期详情 {/* #overdue-details */}

将鼠标悬停在过期警告图标上可显示有关过期备份的详细信息。

![过期详情](../assets/screen-overdue-backup-hover-card.png)

- **已检查**：上次执行过期检查的时间。在 [备份通知设置](settings/backup-notifications-settings.md) 中配置频率。
- **最后备份**：上次收到备份日志的时间。
- **预期备份**：备份预期的时间，包括配置的宽限期（允许的额外时间，在标记为过期之前）。
- **最后通知**：上次发送过期通知的时间。

## Duplicati 服务器版本 {/* #duplicati-server-version */}

仪表板显示每个服务器（卡片视图）或备份作业（表格视图）的最新备份日志中报告的 Duplicati 版本。

- **出现位置**：在卡片的状态指示器左侧，以及表格中的**版本**列（在**过期 / 下次运行**之后）。您可以从[显示设置](settings/display-settings.md)或[Duplicati 版本](settings/duplicati-versions.md)中隐藏卡片徽章。表格列始终保持可见。
- **颜色**：灰色文本表示版本与该通道的最新版本匹配（或比较不可用）。警告黄色表示版本比该通道的最新版本更旧。
- **工具提示**：将鼠标悬停或点击版本号以查看更新通道（`stable`、`beta`、`experimental`或`canary`）、服务器版本以及该通道的最新可用版本。

**duplistatus** 将备份日志中的版本与 GitHub 上发布的最新 Duplicati 版本进行比较。管理员可以在 [设置 → Duplicati 版本](settings/duplicati-versions.md) 中查看缓存的通道版本并配置检查间隔和开始时间。当缓存比所选间隔更旧时，启动时也会刷新缓存。成功和失败的 GitHub 更新记录在 [审计日志](settings/audit-logs-viewer.md) 中，格式为 `duplicati_version_refresh`（由 `startup`、`cron` 或 `manual` 启动）。

:::important
**duplistatus** 不会查询当前正在运行的 Duplicati 服务器的版本。它使用上次收到或 [收集](collect-backup-logs.md) 的备份日志中存储的版本。升级 Duplicati 后，仪表板会继续显示先前的版本，直到收到新的备份日志。
:::

### 可用备份版本 {/* #available-backup-versions */}

点击蓝色时钟图标可打开备份时可用备份版本的列表，由 Duplicati 服务器报告。

![可用版本](../assets/screen-available-backups-modal.png)

- **备份详情**：显示服务器名称和别名、服务器备注、备份名称以及备份执行的时间。
- **版本详情**：显示版本号、创建日期和年龄。

:::note
如果图标是灰色的，这意味着在消息日志中没有收到详细信息。
请参阅 [Duplicati 配置说明](../installation/duplicati-server-configuration.md) 以获取详细信息。
:::
