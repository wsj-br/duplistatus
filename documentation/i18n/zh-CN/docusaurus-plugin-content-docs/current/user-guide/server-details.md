# 服务器详情 {#server-details}

从仪表板点击服务器，会打开该服务器的备份列表页面。若服务器配置了多个备份，可查看全部备份或选择特定备份。

![Server Details](../assets/screen-server-backup-list.png)

## 服务器/备份统计 {#serverbackup-statistics}

本节显示该服务器上所有备份或单个所选备份的统计信息。

- **TOTAL BACKUP JOBS**：此服务器上已配置的备份任务总数。
- **TOTAL BACKUP RUNS**：已执行的备份运行总数（由 Duplicati 服务器报告）。
- **AVAILABLE VERSIONS**：可用版本数量（由 Duplicati 服务器报告）。
- **AVG DURATION**：**duplistatus** 数据库中记录备份的平均（均值）耗时。
- **LAST BACKUP SIZE**：最近收到备份日志中源文件的大小。
- **TOTAL STORAGE USED**：最近备份日志中报告的备份目标端已用存储。
- **TOTAL UPLOADED**：**duplistatus** 数据库中记录的所有上传数据之和。

若此备份或该服务器上的任一备份（选择 **All Backups** 时）逾期，摘要下方会显示消息。

![Server Details - Overdue Scheduled Backups](../assets/screen-server-overdue-message.png)

点击 <IconButton icon="lucide:settings" href="settings/backup-monitoring-settings" label="Configure"/> 前往[设置 → 备份监控](settings/backup-monitoring-settings.md)。或点击工具栏上的 <SvgButton SvgButton svgFilename="duplicati_logo.svg" href="duplicati-configuration" /> 打开 Duplicati 服务器 Web 界面并查看日志。

<br/>

## 备份历史 {#backup-history}

此表格列出所选服务器的备份日志。

![Backup History](../assets/screen-backup-history.png)

- **Backup Name**：Duplicati 服务器中的备份名称。
- **Date**：备份时间戳及自上次屏幕刷新以来的耗时。
- **Status**：备份状态（Success、Warning、Error、Fatal）。
- **Warnings/Errors**：备份日志中报告的警告/错误数量。
- **Available Versions**：目标端可用备份版本数量。若图标为灰色，表示未收到详细信息。
- **File Count, File Size, Uploaded Size, Duration, Storage Size**：Duplicati 服务器报告的值。

:::tip Tips
• 使用 **Backup History** 部分的下拉菜单选择 **All Backups** 或此服务器的特定备份。

• 点击任意列标题可排序，再次点击可反转排序顺序。

• 点击任意行可查看[备份详情](#backup-details)。

:::

:::note
选择 **All Backups** 时，列表默认按从新到旧显示所有备份。
:::

<br/>

## 备份详情 {#backup-details}

点击仪表板（表格视图）中的状态徽章，或备份历史表格中的任意行，会显示详细备份信息。

![Backup Details](../assets/screen-backup-detail.png)

- **Server details**：服务器名称、别名和备注。
- **Backup Information**：备份时间戳及其 ID。
- **Backup Statistics**：报告的计数器、大小和耗时的摘要。
- **Log Summary**：报告的消息数量。
- **Available Versions**：可用版本列表（仅在日志中收到该信息时显示）。
- **Messages/Warnings/Errors**：完整执行日志。副标题会说明日志是否被 Duplicati 服务器截断。

<br/>

:::note
请参阅 [Duplicati 配置说明](../installation/duplicati-server-configuration.md)，了解如何配置 Duplicati 服务器发送完整执行日志以避免截断。
:::
