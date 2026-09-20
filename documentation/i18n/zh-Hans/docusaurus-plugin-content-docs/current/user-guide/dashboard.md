# 仪表板 {/* #dashboard */}

## 仪表板摘要 {/* #dashboard-summary */}

本节显示所有备份的聚合统计信息。

![仪表板摘要 - 概览](../assets/screen-dashboard-summary.png)
![仪表板摘要 - 表格](../assets/screen-dashboard-summary-table.png)

- **总服务器数**：正在监控的服务器数量。                                                                                                             
- **总备份作业数**：为所有服务器配置的备份作业（类型）总数。                                                                                
- **总备份运行数**：从所有服务器接收或收集的备份运行日志总数。                                                                   
- **总备份大小**：基于最新备份日志的所有源数据的组合大小。                                                                    
- **总存储使用量**：基于最新备份日志，备份在备份目标上使用的总存储空间（例如，云存储、FTP 服务器、本地驱动器）。                
- **总上传大小**：从 Duplicati 服务器上传到目标的总数据量（例如，本地存储、FTP、云提供商）。                                       
- **过期备份**（表格）：过期备份的数量。请参阅[备份通知设置](settings/backup-notifications-settings.md)                          
- **布局切换**：在卡片布局（默认）和表格布局之间切换。

:::tip 看到重复的服务器？
如果同一服务器在仪表板上出现多次，请使用[设置 → 数据库维护 → 合并重复服务器](settings/database-maintenance.md#merge-duplicate-servers)来合并它们。当您重新安装或升级 Duplicati 时可能会出现重复项，因为服务器的 `machine_id` 可能会更改，**duplistatus** 会将其视为新服务器。
:::

## 服务器筛选 {/* #server-filtering */}

您可以使用应用程序工具栏中的搜索字段筛选仪表板上显示的服务器和备份。点击筛选图标 <IconButton icon="lucide:search" /> 以显示搜索字段。

**筛选匹配：**
- 服务器 ID
- 服务器 URL
- 备份作业名称

**范围：**
- 筛选仪表板上的卡片视图和表格视图
- 会话状态通过仪表板服务器筛选提供程序维护
- 刷新或离开仪表板时清除

这使得在许多受监控系统中快速定位特定服务器或备份变得容易。

## 卡片布局 {/* #cards-layout */}

卡片布局显示为每个备份接收到的最新备份日志的状态。

![卡片布局](../assets/duplistatus_dash-cards.svg)

- **服务器名称**：Duplicati 服务器的名称（或别名）
  - 将鼠标悬停在 **服务器名称** 上将显示服务器名称和备注
- **整体状态**：服务器的状态。过期备份将显示为 **警告** 状态
- **版本**：来自最新备份日志的 Duplicati 版本，显示在状态指示器左侧。请参阅[Duplicati 服务器版本](#duplicati-server-version)。
- **摘要信息**：此服务器所有备份的文件数、大小和存储使用量的汇总数字。还显示接收到的最近一次备份的经过时间（悬停以显示时间戳）
- **备份列表**：包含为此服务器配置的所有备份的表格，有 3 列：
  - **备份名称**：Duplicati 服务器中的备份名称
  - **状态历史**：接收到的最后 10 次备份的状态。
  - **上次接收到的备份**：自接收到的最后一条日志当前时间以来的经过时间。如果备份过期，将显示警告图标。
    - 时间以缩写格式显示：`m` 表示分钟，`h` 表示小时，`d` 表示天，`w` 表示周，`mo` 表示月，`y` 表示年。

卡片排序顺序和其他配置可以在[显示设置](settings/display-settings.md)中设置。

面板视图提供两种信息显示，可通过点击侧边面板右上角按钮访问：

- 状态：按状态显示备份任务的统计信息，包括过期备份列表和带有警告/错误状态的备份任务。

![状态面板](../assets/screen-overview-side-status.png)

- 指标：为聚合或选定的服务器显示持续时间、文件大小和存储大小随时间变化的图表。

![图表面板](../assets/screen-overview-side-charts.png)

### 备份详细信息 {/* #backup-details */}

将鼠标悬停在列表中的备份上会显示收到的最后备份日志详细信息以及任何过期信息。

![过期详情](../assets/screen-backup-tooltip.png)

- **服务器名称 : 备份**：Duplicati 服务器和备份的名称或别名，还会显示服务器名称和备注。
  - 别名和备注可在[设置 → 服务器设置](settings/server-settings.md)中配置。
- **通知**：显示新备份日志[已配置通知](#notifications-icons)设置的图标。
- **日期**：备份的时间戳和自上次屏幕刷新以来经过的时间。
- **状态**：收到的最后备份的状态（成功、警告、错误、致命）。
- **持续时间、文件数量、文件大小、存储大小、上传大小**：由 Duplicati 服务器报告的值。
- **可用版本**：备份时存储在备份目标上的备份版本数量。

如果此备份已过期，工具提示还会显示：

- **预期备份**：备份预期的时间，包括配置的宽限期（标记为过期前允许的额外时间）。

您还可以点击底部按钮打开[设置 → 备份通知](settings/backup-notifications-settings.md)以配置监控设置或打开 Duplicati 服务器的 Web 界面。

## 表格布局 {/* #table-layout */}

表格布局列出所有服务器和备份收到的最新备份日志。

![仪表板表格模式](../assets/screen-main-dashboard-table-mode.png)

- **服务器名称**：Duplicati 服务器的名称（或别名）
  - 名称下方是服务器备注
- **备份名称**：Duplicati 服务器中备份的名称。
- **版本**：该备份任务最新备份日志中的 Duplicati 版本。参见[Duplicati 服务器版本](#duplicati-server-version)。
- **可用版本**：存储在备份目标上的备份版本数量。如果图标显示为灰色，则日志中未收到详细信息。详情请参见[Duplicati 配置说明](../installation/duplicati-server-configuration.md)。
- **备份计数**：Duplicati 服务器报告的备份数量。
- **最后备份日期**：收到的最后备份日志的时间戳和自上次屏幕刷新以来经过的时间。
- **最后备份状态**：收到的最后备份的状态（成功、警告、错误、致命）。
- **持续时间**：备份的持续时间，格式为 HH:MM:SS。
- **警告/错误**：备份日志中报告的警告和错误数量，显示为 `warnings/errors`（例如 `0/0`）。
- **设置**：
  - **通知**：显示新备份日志已配置通知设置的图标。
  - **duplicati 配置**：打开 Duplicati 服务器 Web 界面的按钮

您可以使用[显示设置](settings/display-settings.md)来配置表格大小和其他配置。

### 通知图标 {/* #notifications-icons */}

| 图标                                                                                                                               | 通知选项 | 描述                                                                                         |
|------------------------------------------------------------------------------------------------------------------------------------|---------------------|-----------------------------------------------------------------------------------------------------|
| <IconButton icon="lucide:message-square-off" style={{border: 'none', padding: 0, color: '#9ca3af', background: 'transparent'}} />  | 关闭                 | 收到新备份日志时不会发送通知                                     |
| <IconButton icon="lucide:message-square-more" style={{border: 'none', padding: 0, color: '#60a5fa', background: 'transparent'}} /> | 所有                 | 将为每个新的备份日志发送通知，无论其状态如何。                      |
| <IconButton icon="lucide:message-square-more" style={{border: 'none', padding: 0, color: '#fbbf24', background: 'transparent'}} /> | 警告            | 仅当备份日志的状态为警告、未知、错误或致命时才发送通知。 |
| <IconButton icon="lucide:message-square-more" style={{border: 'none', padding: 0, color: '#f87171', background: 'transparent'}} /> | 错误              | 仅当备份日志的状态为错误或致命时才发送通知。                    |

:::note
此通知设置仅适用于 **duplistatus** 从 Duplicati 服务器接收到新备份日志时。过期通知是单独配置的，无论此设置如何都会发送。
:::

### 过期详情 {/* #overdue-details */}

将鼠标悬停在过期警告图标上会显示有关过期备份的详细信息。

![过期详情](../assets/screen-overdue-backup-hover-card.png)

- **检查时间**：上次过期检查执行的时间。可在[备份通知设置](settings/backup-notifications-settings.md)中配置频率。
- **最后备份**：接收最后备份日志的时间。
- **预期备份**：备份预期的时间，包括配置的宽限期（标记为过期之前允许的额外时间）。
- **最后通知**：上次过期通知发送的时间。

## Duplicati 服务器版本 {/* #duplicati-server-version */}

仪表板显示每个服务器（卡片视图）或备份任务（表格视图）在最新备份日志中报告的 Duplicati 版本。

- **出现位置**：在卡片上的状态指示器左侧，以及表格中的 **版本** 列（在 **过期 / 下次运行** 之后）。您可以从[显示设置](settings/display-settings.md) 或[Duplicati 版本](settings/duplicati-versions.md) 中隐藏卡片徽章。表格列始终保持可见。
- **颜色**：灰色文本表示版本与该频道的最新发布版本匹配（或无法进行比较）。警告黄色表示版本早于该频道的最新发布版本。
- **工具提示**：将鼠标悬停或单击版本号以查看更新频道（`stable`、`beta`、`experimental` 或 `canary`）、服务器版本和该频道的最新可用版本。

**duplistatus** 将备份日志中的版本与 GitHub 上发布的最新 Duplicati 版本进行比较。管理员可以在[设置 → Duplicati 版本](settings/duplicati-versions.md) 中查看缓存的频道版本并配置检查间隔和开始时间。当缓存比所选间隔更旧时，启动时也会刷新缓存。成功的和失败的 GitHub 更新记录在[审计日志](settings/audit-logs-viewer.md) 中，标记为 `duplicati_version_refresh`（由 `startup`、`cron` 或 `manual` 启动）。

:::important
**duplistatus** 不会查询当前正在运行的 Duplicati 服务器版本。它使用存储在最后接收或[收集](collect-backup-logs.md) 的备份日志中的版本。升级 Duplicati 后，仪表板会继续显示之前的版本，直到收到新的备份日志。
:::

### 可用备份版本 {/* #available-backup-versions */}

点击蓝色时钟图标会打开备份时间点可用备份版本列表，由 Duplicati 服务器报告。

![可用版本](../assets/screen-available-backups-modal.png)

- **备份详情**：显示服务器名称和别名、服务器备注、备份名称以及备份执行时间。
- **版本详情**：显示版本号、创建日期和年龄。

:::note
如果图标呈灰色，则表示在消息日志中未接收到详细信息。
请参阅[Duplicati 配置说明](../installation/duplicati-server-configuration.md)了解详情。
:::
