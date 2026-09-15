# 如何使用AI工具构建此应用程序 {/* #how-i-build-this-application-using-ai-tools */}

# 动机 {/* #motivation */}

我开始使用Duplicati作为家庭服务器的备份工具。我尝试了官方的[Duplicati仪表板](https://app.duplicati.com/)和[Duplicati监控](https://www.duplicati-monitoring.com/)，但有两个主要要求：(1) 自托管；和(2) 暴露API以与[Homepage](https://gethomepage.dev/)集成，因为我用它作为家庭实验室的主页。

我也尝试直接连接到网络上的每个Duplicati服务器，但身份验证方法与Homepage不兼容（或者我无法正确配置它）。

由于我还在尝试使用AI代码工具，我决定尝试使用AI构建此工具。以下是我使用的过程...

# 使用的工具 {/* #tools-used */}

1. 用于UI：[Google的Firebase Studio](https://firebase.studio/)
2. 用于实现：Cursor (https://www.cursor.com/)

:::note
我使用了Firebase进行UI，但你也可以使用[v0.app](https://v0.app/)或其他工具生成原型。我使用Cursor生成实现，但你也可以使用其他工具，如VS Code/Copilot、Windsurf等...
:::

# UI {/* #ui */}

我在[Firebase Studio](https://studio.firebase.google.com/)中创建了一个新项目，并在“使用AI原型化应用程序”功能中使用了以下提示：

> 一个使用tailwind/react的Web仪表板应用程序，通过duplicati备份解决方案使用选项--send-http-url（JSON格式）将备份结果汇总到sqllite3数据库中，跟踪多台机器的备份状态、大小和上传大小。
> 
> 仪表板的第一页应包含一个表格，显示每台机器的最后备份，包括机器名称、数据库中存储的备份数量、最后备份状态、持续时间（hh:mm:ss）、警告和错误数量。
> 
> 当点击机器行时，显示所选机器的详细页面，其中包含存储的备份列表（分页显示），包括备份名称、备份日期和时间、备份时间、状态、警告和错误数量、文件数量、文件大小、上传大小和存储的总大小。在详细页面中，使用Tremor绘制字段的演变图表：上传大小；持续时间（分钟）、检查的文件数量、检查的文件大小。图表应一次绘制一个字段，并使用下拉框选择要绘制的字段。图表应显示数据库中存储的所有备份，而不仅仅是分页表格中显示的备份。
> 
> 应用程序应暴露API端点以接收来自Duplicati服务器的POST请求，并提供另一个API端点以JSON格式检索机器的最后备份的所有详细信息。
> 
> 设计应当是现代的、响应式的，并包含图标和其他视觉辅助工具，以便易于阅读。代码应当是清晰、简洁且易于维护的。使用现代工具如pnpm处理依赖关系。
> 
> 应用程序应当具有可选择的深色和浅色主题。
> 
> 数据库应当存储由Duplicati JSON接收的这些字段：

```json
"{ "Data": { "DeletedFiles": 0, "DeletedFolders": 0, "ModifiedFiles": 0, "ExaminedFiles": 15399, "OpenedFiles": 1861, "AddedFiles": 1861, "SizeOfModifiedFiles": 0, "SizeOfAddedFiles": 13450481, "SizeOfExaminedFiles": 11086692615, "SizeOfOpenedFiles": 13450481, "NotProcessedFiles": 0, "AddedFolders": 419, "TooLargeFiles": 0, "FilesWithError": 0, "ModifiedFolders": 0, "ModifiedSymlinks": 0, "AddedSymlinks": 0, "DeletedSymlinks": 0, "PartialBackup": false, "Dryrun": false, "MainOperation": "Backup", "ParsedResult": "Success", "Interrupted": false, "Version": "2.1.0.5 (2.1.0.5_stable_2025-03-04)", "EndTime": "2025-04-21T23:46:38.3568274Z", "BeginTime": "2025-04-21T23:45:46.9712217Z", "Duration": "00:00:51.3856057", "WarningsActualLength": 0, "ErrorsActualLength": 0, "BackendStatistics": { "BytesUploaded": 8290314, "BytesDownloaded": 53550393, "KnownFileSize": 9920312634, "LastBackupDate": "2025-04-22T00:45:46+01:00", "BackupListCount": 6, "ReportedQuotaError": false, "ReportedQuotaWarning": false, "MainOperation": "Backup", "ParsedResult": "Success", "Interrupted": false, "Version": "2.1.0.5 (2.1.0.5_stable_2025-03-04)", "BeginTime": "2025-04-21T23:45:46.9712252Z", "Duration": "00:00:00", "WarningsActualLength": 0, "ErrorsActualLength": 0 } }, "Extra": { "OperationName": "Backup", "machine-id": "66f5ffc7ff474a73a3c9cba4ac7bfb65", "machine-name": "WSJ-SER5", "backup-name": "WSJ-SER5 Local files", "backup-id": "DB-2" } } "
```

这生成了一个应用程序蓝图，我稍微修改了一下（如下所示），然后点击`Prototype this App`：

![appblueprint](/img/app-blueprint.png)

我后来使用了这些提示来调整和完善设计和行为：

> 从仪表板概览页面和机器名称上移除“查看详情”按钮和链接，如果用户点击行上的任何位置，将显示详细页面。

> 在以字节为单位显示大小时，使用自动缩放（KB、MB、GB、TB）。

> 在详细页面中，将图表移动到表格之后。将条形图的颜色更改为与浅色和深色主题兼容的其他颜色。

> 在详细页面中，将每页显示的备份数量减少到5个。

> 在仪表板概览中，在顶部添加摘要，显示数据库中的机器数量、所有机器的总备份数量、所有备份的总上传大小和所有机器的总存储使用量。包含图标以便于可视化。

> 请持久化用户选择的主题。另外，添加一些侧边距，使UI使用可用宽度的90%。

> 在机器详情页的标题卡中，包含一个摘要，显示该机器存储的备份总数，备份状态的统计信息，最后一次备份的警告和错误数量，平均持续时间（hh:mm:ss），所有备份的总上传大小以及基于最后一次备份信息的存储大小使用情况。

> 使摘要更小更紧凑，以减少占用的空间。

> 在显示最后备份日期时，在同一个单元格中，用小号灰色字体显示备份发生的时间（例如，x分钟前，x小时前，x天前，x周前，x个月前，x年前）。

> 在仪表盘概览中，将最后备份日期放在最后备份状态之前。

经过这些提示的迭代后，Firebase生成了如下所示的原型：

![原型](/img/screen-prototype.png)

![原型详情](/img/screen-prototype-detail.png)

:::note
一个有趣的点是，从第一次交互开始，Firebase Studio生成了随机数据来填充页面/图表，使原型像一个实时应用程序一样运行。
:::

完成初始原型后，我通过点击界面中的`</>`按钮访问了源代码。然后，我使用Git扩展将代码导出并推送到[GitHub](https://www.github.com)上的私有仓库。

# 后端 {/* #backend */}

## 设置 {/* #setup */}

我从GitHub（使用`git clone`命令）下载了代码到本地文件夹（在我的情况下，是运行Linux的Raspberry Pi 5），并安装了Node.js、npm和pnpm依赖项。更多详情请参见[DEVELOPMENT.md](../development/setup.md)。

我设置了Cursor以通过SSH连接从我的Windows机器访问代码文件夹。

我将Duplicati发送的JSON样本复制到一个文件中（参见[备份报告样本](../api-reference/database-values)文档），清除了一些不需要的字段。

## 实现 {/* #implementation */}

我使用了一个初始提示来开始实现，重点放在持久性、修复和新功能上。这是一个漫长但非常有趣的过程。

### 使用AI生成提示 {/* #using-ai-to-generate-the-prompt */}

我使用Cursor Chat（`Manual`模式，`Auto`模型）创建了一个详细的提示：

> 将此文本改进为一个提示，用于Cursor AI工具生成应用程序原型的实现：
> 
> 请创建一个计划，从这个代码库生成一个Next.js应用程序原型的完整实现。您的实现应彻底分析提供的代码库，以保持精确的视觉美学、用户体验和导航流程。对于数据存储，使用SQLite3。生成数据库并使用[备份报告样本](../api-reference/database-values)文档中的结构和内容填充它，确保JSON中的每个字段都完全集成并持久化。

AI生成了以下提示：

>创建一个综合实施计划，用于满足以下要求的Next.js应用原型：
>
>1. 技术栈：
>   - Next.js 14+ 与 App Router
>   - TypeScript 用于类型安全
>   - SQLite3 用于数据持久化
>   - TailwindCSS 用于样式
>   - 适当使用 React 服务器组件
>   - 客户端组件用于交互元素
>
>2. 数据库设计：
>   - 分析示例备份报告文档以创建最佳SQLite模式
>   - 设计表以高效存储所有备份数据
>   - 包括常见查询的索引
>   - 实现数据验证和类型安全
>
>3. 应用结构：
>   - 实现提供的代码库中的精确UI/UX
>   - 创建可重用组件以用于常见元素
>   - 使用App Router设置适当的路由
>   - 实现响应式布局
>   - 添加暗/亮主题支持
>
>4. 核心功能：
>   - 仪表板概览，带有机器状态表
>   - 详细机器视图，带有备份历史
>   - 使用图表进行数据可视化
>   - 实时备份状态更新
>   - 适当的错误处理和加载状态
>
>5. 数据管理：
>   - 为数据操作创建API路由
>   - 实现高效的数据获取策略
>   - 添加适当的数据验证
>   - 包括数据库操作的错误处理
>
>请提供一个详细的实施计划，涵盖所有这些方面，同时保持现有的视觉设计和用户体验。

我已将生成的提示复制到剪贴板。

### 开始实施之旅 {/* #start-the-implementation-journey */}

我通过单击`+`按钮创建了一个新聊天，切换到`Agent`模式，并使用Ctrl+Shift+V（作为文本）粘贴了提示。

计划生成后，我输入`please, implement this plan`在聊天中开始实施。

:::note
我只包括了起点，因为我没有记录所有使用的提示。有很多这样的提示。
:::

# 注意事项 {/* #notes */}

- 某些模型在修复错误时可能会卡住。"claude-3.5"和"claude-4"通常更好，但有时必须尝试其他模型（GPT、Gemini等）。
对于复杂的错误或错误，使用提示来分析错误的可能原因，而不是简单地要求修复。
- 进行复杂修改时，使用提示创建计划，然后要求AI代理实施该计划。这总是效果更好。
- 在更改源代码时，要具体。如果可能，在编辑器中选择相关代码部分，然后按Ctrl+L将其包含在聊天中作为上下文。
- 还要在聊天中包含您提到的文件的引用，以帮助AI代理聚焦于代码的相关部分，避免在代码的其他部分进行更改。
- 我有将AI代理人类化的倾向，因为它持续使用'我们'、'我们的代码'和'您是否希望我...'。这也是为了提高我的生存机会，以防（或[当](https://ai-2027.com/)) Skynet变得有意识，并发明了终结者。
- 有时，使用[Gemini](https://gemini.google.com/app)、[Deepseek](https://chat.deepseek.com/)、[ChatGPT](https://chat.openai.com/)、[Manus](https://manus.im/app),...生成更好的指令以用于AI代理的提示。
