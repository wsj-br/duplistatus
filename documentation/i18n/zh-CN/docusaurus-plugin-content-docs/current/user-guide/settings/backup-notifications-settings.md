# 备份通知 {#backup-notifications}

使用此设置在[收到新备份日志](../../installation/duplicati-server-configuration.md)时发送通知。

![Backup alerts](../../assets/screen-settings-notifications.png)

备份通知表按服务器组织。显示格式取决于服务器拥有的备份数量：
- **多个备份**：显示服务器标题行，下方为单个备份行。点击服务器标题可展开或折叠备份列表。
- **单个备份**：显示一个带有蓝色左边框的**合并行**，显示：
  - 如果未配置服务器别名，则显示 **服务器名称 : 备份名称**，或者
  - 如果已配置，则显示 **服务器别名 (服务器名称) : 备份名称**。

此页面具有自动保存功能。您所做的任何更改都将自动保存。

<br/>

## 筛选 {#filter}

使用页面顶部的 **按服务器名称筛选** 字段，可通过服务器名称或别名快速查找特定备份。表格将自动筛选以仅显示匹配项。

<br/>

## 配置每个备份的通知设置 {#configure-per-backup-notification-settings}

| 设置                       | 描述                                               | 默认值 |
| :---------------------------- | :-------------------------------------------------------- | :------------ |
| **通知事件**       | 配置何时为新备份日志发送通知。 | **警告**    |
| **NTFY**                      | 为此备份启用或禁用 NTFY 通知。     | **已启用**     |
| **邮件**                     | 为此备份启用或禁用邮件通知。    | **已启用**    |

**通知事件选项：**

- **全部**：为所有备份事件发送通知。
- **警告**：仅为警告和错误发送通知（默认）。
- **错误**：仅为错误发送通知。
- **关闭**：为此备份禁用新备份日志的通知。

<br/>

## 额外目标 {#additional-destinations}

额外通知目标允许您将通知发送到全局设置之外的特定邮件地址或 NTFY 主题。系统使用分层继承模型，备份可以继承其服务器的默认设置，或使用备份特定的值进行覆盖。

额外目标配置由服务器和备份名称旁的上下文图标指示：

- **服务器图标** <IconButton icon="lucide:settings-2" style={{border: 'none', padding: 0, color: 'inherit', background: 'transparent'}} />：当在服务器级别配置了默认额外目标时，显示在服务器名称旁。

- **备份图标** <IconButton icon="lucide:external-link" style={{border: 'none', padding: 0, color: '#60a5fa', background: 'transparent'}} />（蓝色）：当配置了自定义额外目标（覆盖服务器默认值）时，显示在备份名称旁。

- **备份图标** <IconButton icon="lucide:external-link" style={{border: 'none', padding: 0, color: '#64748b', background: 'transparent'}} />（灰色）：当备份继承自服务器默认的额外目标时，显示在备份名称旁。

如果没有显示图标，则表示该服务器或备份未配置额外目标。

![Server-level additional destinations](../../assets/screen-settings-notifications-server.png)

### 服务器级默认值 {#server-level-defaults}

您可以在服务器级别配置默认额外目标，该服务器上的所有备份将自动继承这些设置。

1. 导航至 [设置 → 备份通知](backup-notifications-settings.md)。
2. 表格按服务器分组，不同的服务器标题行显示服务器名称、别名和备份数量。
   - **备注**：对于仅有一个备份的服务器，将显示合并行而非单独的服务器标题。无法直接从合并行配置服务器级默认值。如果您需要为单个备份的服务器配置服务器默认值，可以通过临时向该服务器添加另一个备份来实现，或者该备份的额外目标将自动继承自任何现有的服务器默认值。
3. 点击服务器行的任意位置以展开 **此服务器的默认额外目标** 部分。
4. 配置以下默认设置：
   - **通知事件**：选择哪些事件触发向额外目标的通知（**全部**、**警告**、**错误**或**关闭**）。
   - **额外电子邮件**：输入一个或多个电子邮件地址（用逗号分隔），这些地址将接收此服务器上所有备份的通知。点击 <IconButton icon="lucide:send-horizontal" style={{border: 'none', padding: 0, color: 'inherit', background: 'transparent'}} /> 图标按钮向该字段中的地址发送测试邮件。
   - **额外 NTFY 主题**：输入自定义 NTFY 主题名称，此服务器上所有备份的通知将发布到该主题。点击 <IconButton icon="lucide:send-horizontal" style={{border: 'none', padding: 0, color: 'inherit', background: 'transparent'}} /> 图标按钮向该主题发送测试通知，或点击 <IconButton icon="lucide:qr-code" style={{border: 'none', padding: 0, color: 'inherit', background: 'transparent'}} /> 图标按钮显示该主题的二维码以配置您的设备接收通知。

**服务器默认值管理：**

- **同步到全部**：清除所有备份的覆盖设置，使所有备份继承自服务器默认值。
- **全部清除**：从服务器默认值和所有备份中清除所有额外目标，同时保留继承结构。

### 单个备份配置 {#per-backup-configuration}

单个备份会自动继承服务器默认值，但您可以为特定的备份任务覆盖这些设置。

1. 点击备份行的任意位置以展开其 **额外目标** 部分。
2. 配置以下设置：
   - **通知事件**：选择哪些事件触发向额外目标的通知（**全部**、**警告**、**错误**或**关闭**）。
   - **额外电子邮件**：输入一个或多个电子邮件地址（用逗号分隔），这些地址将除全局接收者外额外接收通知。点击 <IconButton icon="lucide:send-horizontal" style={{border: 'none', padding: 0, color: 'inherit', background: 'transparent'}} /> 图标按钮向该字段中的地址发送测试邮件。
   - **额外 NTFY 主题**：输入自定义 NTFY 主题名称，通知将除默认主题外额外发布到该主题。点击 <IconButton icon="lucide:send-horizontal" style={{border: 'none', padding: 0, color: 'inherit', background: 'transparent'}} /> 图标按钮向该主题发送测试通知，或点击 <IconButton icon="lucide:qr-code" style={{border: 'none', padding: 0, color: 'inherit', background: 'transparent'}} /> 图标按钮显示该主题的二维码以配置您的设备接收通知。

**继承指示符：**

- 蓝色 **链接图标** <IconButton icon="lucide:link" style={{border: 'none', padding: 0, color: '#3b82f6', background: 'transparent'}} />：表示该值继承自服务器默认值。点击该字段将创建覆盖项以便编辑。
- 蓝色 **断开链接图标** <IconButton icon="lucide:link-2-off" style={{border: 'none', padding: 0, color: '#3b82f6', background: 'transparent'}} />：表示该值已被覆盖。点击该图标可恢复为继承。

**额外目标行为：**

- 配置后，通知将同时发送到全局设置和额外目标。
- 额外目标的通知事件设置独立于主通知事件设置。
- 如果额外目标设置为 **关闭**，则不会向这些目标发送通知，但主通知仍将根据主设置正常工作。
- 当备份继承自服务器默认值时，对服务器默认值的任何更改将自动应用于该备份（除非已被覆盖）。

<br/>

## 批量编辑 {#bulk-edit}

您可以使用批量编辑功能一次性编辑多个备份的额外目标设置。当您需要将相同的额外目标应用于许多备份任务时，此功能特别有用。

![Bulk edit dialog](../../assets/screen-settings-notifications-bulk.png)

1. 导航至 [设置 → 备份通知](backup-notifications-settings.md)。
2. 使用第一列中的复选框选择您要编辑的备份或服务器。
   - 使用标题行中的复选框来选择或取消选择所有可见的备份。
   - 您可以在选择前使用过滤器来缩小列表范围。
3. 选中备份后，将出现一个显示已选备份数量的批量操作栏。
4. 点击 **批量编辑** 以打开编辑对话框。
5. 配置额外目标设置：
   - **通知事件**：为所有选中的备份设置通知事件。
   - **额外电子邮件**：输入要应用于所有选中的备份的电子邮件地址（用逗号分隔）。
   - **额外 NTFY 主题**：输入要应用于所有选中的备份的 NTFY 主题名称。
   - 批量编辑对话框中提供测试按钮，以便在应用于多个备份之前验证电子邮件地址和 NTFY 主题。
6. 点击 **保存** 将设置应用于所有选中的备份。

**批量清除：**

要从选中的备份中移除所有额外目标设置：

1. 选择您要清除的备份。
2. 点击批量操作栏中的 **批量清除**。
3. 在对话框中确认该操作。

这将移除选中备份的所有额外电子邮件地址、NTFY 主题和通知事件。清除后，备份将恢复为继承自服务器默认值（如果配置了任何默认值）。

<br/>
