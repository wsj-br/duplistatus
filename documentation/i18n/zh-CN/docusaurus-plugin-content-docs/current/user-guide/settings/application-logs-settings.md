# 应用程序日志 {#application-logs}

应用程序日志查看器让管理员在一个地方监控所有应用程序日志，支持筛选、导出和直接从 Web 界面实时更新。

![Application Log Viewer](../../assets/screen-settings-application-logs.png)

<br/>

## 可用操作 {#available-actions}

| Button                                                              | Description                                                                                         |
|:--------------------------------------------------------------------|:----------------------------------------------------------------------------------------------------|
| <IconButton icon="lucide:refresh-cw" label="Refresh" />            | 手动从所选文件重新加载日志。刷新时显示加载动画，并重置新行检测跟踪。 |
| <IconButton icon="lucide:copy" label="Copy to clipboard" />         | 将所有筛选后的日志行复制到剪贴板。遵循当前搜索筛选器。便于快速分享或粘贴到其他工具。 |
| <IconButton icon="lucide:download" label="Export" />               | 将日志下载为文本文件。从当前所选文件版本导出，并应用当前搜索筛选器（如有）。文件名格式：`duplistatus-logs-YYYY-MM-DD.txt`（日期为 ISO 格式）。 |
| <IconButton icon="lucide:arrow-down-from-line" />                   | 快速跳转到显示日志的开头。在禁用自动滚动或浏览长日志文件时很有用。 |
| <IconButton icon="lucide:arrow-down-to-line" />                    | 快速跳转到显示日志的末尾。在禁用自动滚动或浏览长日志文件时很有用。 |

<br/>

## 控件与筛选 {#controls-and-filters}

| Control | Description |
|:--------|:-----------|
| **File Version** | 选择要查看的日志文件：**Current**（活动文件）或轮转文件（`.1`、`.2` 等，数字越大越旧）。 |
| **Lines to Show** | 显示所选文件最近的 **100**、**500**、**1000**（默认）、**5000** 或 **10000** 行。 |
| **Auto-scroll** | 启用时（当前文件默认启用），自动滚动到新日志条目并每 2 秒刷新。仅适用于 **Current** 文件版本。 |
| **Search** | 按文本筛选日志行（不区分大小写）。筛选应用于当前显示的行。 |

<br/>

日志显示标题显示筛选后的行数、总行数、文件大小和最后修改时间戳。

<br/>
