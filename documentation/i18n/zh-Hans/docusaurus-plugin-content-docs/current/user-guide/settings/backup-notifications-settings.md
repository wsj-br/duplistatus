# 备份通知 {/* #backup-notifications */}

使用此设置在接收到[新备份日志](../../installation/duplicati-server-configuration.md)时发送通知。

![备份警报](../../assets/screen-settings-notifications.png)

备份通知表按服务器组织。显示格式取决于服务器有多少个备份：
- **多个备份**：显示带有下方各个备份行的服务器标题行。单击服务器标题以展开或折叠备份列表。
- **单个备份**：显示带有蓝色左侧边框的**合并行**，显示：
  - 如果未配置服务器别名，则为**服务器名称 : 备份名称**，或者
  - 如果已配置，则为**服务器别名 (服务器名称) : 备份名称**。

此页面具有自动保存功能。您所做的任何更改都将自动保存。

当**每日摘要**启用时，默认电子邮件收件人的邮件将被抑制。此页面上的其他电子邮件目标将继续接收匹配的事件。此页面上的设置将被保留，并在每日摘要关闭时再次激活。请参阅[每日摘要](daily-summary-settings.md)。

<br/>

## 筛选 {/* #filter */}

使用页面顶部的**按服务器名称筛选**字段，通过服务器名称或别名快速查找特定备份。表格将自动筛选以仅显示匹配的条目。

<br/>

## 配置每个备份的通知设置 {/* #configure-per-backup-notification-settings */}

| 设置                          | 描述                                                      | 默认值        |
| :---------------------------- | :-------------------------------------------------------- | :------------ |
| **通知事件**              | 配置何时为此备份的新备份日志发送通知。                        | **警告**     |
| **NTFY**                  | 启用或禁用此备份的 NTFY 通知。                              | **已启用**    |
| **电子邮件**                | 启用或禁用此备份的电子邮件通知。                             | **已启用**    |

**通知事件选项：**

- **所有**：为所有备份事件发送通知。
- **警告**：仅在出现警告和错误时发送通知（默认）。
- **错误**：仅在出现错误时发送通知。
- **关闭**：禁用此备份的新备份日志通知。

<br/>

## 其他目标 {/* #additional-destinations */}

其他通知目标允许您将通知发送到全局设置之外的特定电子邮件地址或 NTFY 主题。系统使用分层继承模型，其中备份可以从其服务器继承默认设置，或使用备份特定值覆盖它们。

服务器和备份名称旁边的情境图标表示其他目标配置：

- **服务器图标** <IconButton icon="lucide:settings-2" style={{border: 'none', padding: 0, color: 'inherit', background: 'transparent'}} />：当在服务器级别配置了默认其他目标时，出现在服务器名称旁边。

- **备份图标** <IconButton icon="lucide:external-link" style={{border: 'none', padding: 0, color: '#60a5fa', background: 'transparent'}} />（蓝色）：当配置了自定义其他目标时（覆盖服务器默认值），出现在备份名称旁边。

- **备份图标** <IconButton icon="lucide:external-link" style={{border: 'none', padding: 0, color: '#64748b', background: 'transparent'}} />（灰色）：当备份从服务器默认值继承其他目标时，出现在备份名称旁边。

如果没有显示图标，则服务器或备份未配置其他目标。

![服务器级附加目标](../../assets/screen-settings-notifications-server.png)

### 服务器级默认值 {/* #server-level-defaults */}

您可以在服务器级别配置默认附加目标，该服务器上的所有备份将自动继承这些目标。

1. 导航到[设置 → 备份通知](backup-notifications-settings.md)。
2. 表格按服务器分组，具有不同服务器标题行，显示服务器名称、别名和备份计数。
   - **注意**：对于只有一个备份的服务器，会显示合并行而不是单独的服务器标题。无法直接从合并行配置服务器级默认值。如果您需要为单备份服务器配置服务器默认值，可以通过临时向该服务器添加另一个备份来实现，或者备份的附加目标将自动从任何现有服务器默认值继承。
3. 单击服务器行中的任意位置以展开**此服务器的默认附加目标**部分。
4. 配置以下默认设置：
   - **通知事件**：选择触发附加目标通知的事件（**所有**、**警告**、**错误**或**关闭**）。
   - **附加电子邮件**：输入一个或多个电子邮件地址（用逗号分隔），这些地址将接收此服务器上所有备份的通知。单击<IconButton icon="lucide:send-horizontal" style={{border: 'none', padding: 0, color: 'inherit', background: 'transparent'}} />图标按钮向字段中的地址发送测试邮件。
   - **附加 NTFY 主题**：输入自定义 NTFY 主题名称，将在其中发布此服务器上所有备份的通知。单击<IconButton icon="lucide:send-horizontal" style={{border: 'none', padding: 0, color: 'inherit', background: 'transparent'}} />图标按钮向主题发送测试通知，或单击<IconButton icon="lucide:qr-code" style={{border: 'none', padding: 0, color: 'inherit', background: 'transparent'}} />图标按钮显示主题的二维码以配置您的设备接收通知。

**服务器默认值管理：**

- **同步所有**：清除所有备份覆盖，使所有备份都从服务器默认值继承。
- **清除所有**：从服务器默认值和所有备份中清除所有附加目标，同时保持继承结构。

### 每个备份配置 {/* #per-backup-configuration */}

各个备份自动继承服务器默认值，但您可以为特定备份作业覆盖它们。

1. 单击备份行中的任意位置以展开其**其他目标**部分。
2. 配置以下设置：
   - **通知事件**：选择触发附加目标通知的事件（**所有**、**警告**、**错误**或**关闭**）。
   - **附加电子邮件**：输入一个或多个电子邮件地址（用逗号分隔），这些地址将除了全局收件人外还接收通知。单击<IconButton icon="lucide:send-horizontal" style={{border: 'none', padding: 0, color: 'inherit', background: 'transparent'}} />图标按钮向字段中的地址发送测试邮件。
   - **附加 NTFY 主题**：输入自定义 NTFY 主题名称，将在其中发布除默认主题外的通知。单击<IconButton icon="lucide:send-horizontal" style={{border: 'none', padding: 0, color: 'inherit', background: 'transparent'}} />图标按钮向主题发送测试通知，或单击<IconButton icon="lucide:qr-code" style={{border: 'none', padding: 0, color: 'inherit', background: 'transparent'}} />图标按钮显示主题的二维码以配置您的设备接收通知。

**继承指示器：**

- **链接图标** <IconButton icon="lucide:link" style={{border: 'none', padding: 0, color: '#3b82f6', background: 'transparent'}} />（蓝色）：表示该值从服务器默认值继承。单击该字段将创建覆盖以进行编辑。
- **断开链接图标** <IconButton icon="lucide:link-2-off" style={{border: 'none', padding: 0, color: '#3b82f6', background: 'transparent'}} />（蓝色）：表示该值已被覆盖。单击图标可恢复继承。

**附加目标行为：**

- 配置后，通知将同时发送到全局设置和其他目标。
- 其他目标的通知事件设置与主通知事件设置是独立的。
- 如果其他目标设置为 **关闭**，则不会向这些目标发送任何通知，但根据主要设置，主通知仍会正常工作。
- **超期**警报在其他通知事件筛选器中被视为 **警告**：当事件为 **所有** 或 **警告** 时会发送，而当事件为 **错误** 或 **关闭** 时则不发送。相同的筛选器也适用于附加 NTFY 主题。
- 当备份继承自服务器默认值时，对服务器默认值的任何更改将自动应用到该备份（除非已被覆盖）。
- 当[每日摘要](daily-summary-settings.md)启用时，附加电子邮件目标仍会接收匹配的事件；只有默认电子邮件收件人会被抑制。

<br/>

## 批量编辑 {/* #bulk-edit */}

您可以使用批量编辑功能一次编辑多个备份的附加目标设置。当您需要将相同的附加目标应用到许多备份作业时，这特别有用。

![批量编辑对话框](../../assets/screen-settings-notifications-bulk.png)

1. 导航至[设置 → 备份通知](backup-notifications-settings.md)。
2. 使用第一列中的复选框选择您要编辑的备份或服务器。
   - 使用标题行中的复选框选择或取消选择所有可见的备份。
   - 您可以在选择前使用筛选器缩小列表范围。
3. 选择备份后，批量操作栏将显示所选备份的数量。
4. 单击**批量编辑**以打开编辑对话框。
5. 配置附加目标设置：
   - **通知事件**：为所有选定的备份设置通知事件。
   - **附加电子邮件**：输入电子邮件地址（用逗号分隔）以应用到所有选定的备份。
   - **附加 NTFY 主题**：输入一个 NTFY 主题名称以应用到所有选定的备份。
   - 批量编辑对话框中提供测试按钮，可在应用到多个备份之前验证电子邮件地址和 NTFY 主题。
6. 单击**保存**以将设置应用到所有选定的备份。

**批量清除：**

要从选定的备份中移除所有附加目标设置：

1. 选择您要清除的备份。
2. 在批量操作栏中单击**批量清除**。
3. 在对话框中确认操作。

这将移除所选备份的所有附加电子邮件地址、NTFY 主题和通知事件。清除后，备份将恢复为继承自服务器默认值（如果已配置任何默认值）。

<br/>
