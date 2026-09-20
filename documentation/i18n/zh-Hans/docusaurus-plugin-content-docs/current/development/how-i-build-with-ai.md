# 如何使用 AI 工具构建此应用程序 {/* #how-i-build-this-application-using-ai-tools */}

# 动机 {/* #motivation */}

我开始使用 Duplicati 作为家庭服务器的备份工具。我尝试了官方的 [Duplicati 仪表板](https://app.duplicati.com/) 和 [Duplicati 监控](https://www.duplicati-monitoring.com/)，但我有两个主要需求：(1) 自托管；(2) 暴露 API 以便与 [Homepage](https://gethomepage.dev/) 集成，因为我用它作为我的家庭实验室主页。

我也尝试直接连接网络上的每个 Duplicati 服务器，但认证方法与 Homepage 不兼容（或者我没有正确配置它）。

由于我还在实验 AI 代码工具，我决定尝试使用 AI 来构建这个工具。以下是我使用的流程...

# 使用的工具 {/* #tools-used */}

1. 对于 UI：[Google 的 Firebase Studio](https://firebase.studio/)
2. 对于实现：Cursor (https://www.cursor.com/)

:::note
我使用 Firebase 进行 UI 开发，但您也可以使用 [v0.app](https://v0.app/) 或任何其他工具来生成原型。我使用 Cursor 生成实现，但您可以使用其他工具，如 VS Code/Copilot、Windsurf 等。
:::

# UI {/* #ui */}

我在 [Firebase Studio](https://studio.firebase.google.com/) 中创建了一个新项目，并在 "使用 AI 原型化应用" 功能中使用了以下提示：

> 一个使用 tailwind/react 的网页仪表板应用程序，在 sqllite3 数据库中整合由 duplicati 备份解决方案使用 --send-http-url 选项（json 格式）发送的多个机器的备份结果，持续跟踪备份状态、大小、上传大小。
> 
> 仪表板首页应该有一个表格，显示每台机器的最后一次备份，包括机器名称、数据库中存储的备份数量、最后一次备份状态、持续时间（hh:mm:ss）、警告和错误数量。
> 
> 当点击机器行时，显示所选机器的详细页面，包含存储的备份列表（分页），包括备份名称、备份日期和时间、多久以前、状态、警告和错误数量、文件数量、文件大小、上传大小和总存储大小。在详细页面还包括一个使用 Tremor 的图表，显示以下字段的变化：上传大小；以分钟为单位的持续时间、检查的文件数量、检查的文件大小。图表应一次绘制一个字段，带有下拉框选择要绘制的所需字段。此外，图表必须显示数据库中存储的所有备份，而不仅仅是分页表格中显示的备份。
> 
> 应用程序必须暴露一个 API 端点来接收来自 duplicati 服务器的 POST 请求，以及另一个 API 端点以 JSON 格式检索机器最后一次备份的所有详细信息。
> 
> 设计应该是现代的、响应式的，包含图标和其他视觉辅助功能，使其易于阅读。代码必须干净、简洁且易于维护。使用现代工具如 pnpm 来处理依赖项。
> 
> 应用程序必须具有可选择的深色和浅色主题。
> 
> 数据库应存储从 duplicati json 接收的这些字段：

```json
"{ "Data": { "DeletedFiles": 0, "DeletedFolders": 0, "ModifiedFiles": 0, "ExaminedFiles": 15399, "OpenedFiles": 1861, "AddedFiles": 1861, "SizeOfModifiedFiles": 0, "SizeOfAddedFiles": 13450481, "SizeOfExaminedFiles": 11086692615, "SizeOfOpenedFiles": 13450481, "NotProcessedFiles": 0, "AddedFolders": 419, "TooLargeFiles": 0, "FilesWithError": 0, "ModifiedFolders": 0, "ModifiedSymlinks": 0, "AddedSymlinks": 0, "DeletedSymlinks": 0, "PartialBackup": false, "Dryrun": false, "MainOperation": "Backup", "ParsedResult": "Success", "Interrupted": false, "Version": "2.1.0.5 (2.1.0.5_stable_2025-03-04)", "EndTime": "2025-04-21T23:46:38.3568274Z", "BeginTime": "2025-04-21T23:45:46.9712217Z", "Duration": "00:00:51.3856057", "WarningsActualLength": 0, "ErrorsActualLength": 0, "BackendStatistics": { "BytesUploaded": 8290314, "BytesDownloaded": 53550393, "KnownFileSize": 9920312634, "LastBackupDate": "2025-04-22T00:45:46+01:00", "BackupListCount": 6, "ReportedQuotaError": false, "ReportedQuotaWarning": false, "MainOperation": "Backup", "ParsedResult": "Success", "Interrupted": false, "Version": "2.1.0.5 (2.1.0.5_stable_2025-03-04)", "BeginTime": "2025-04-21T23:45:46.9712252Z", "Duration": "00:00:00", "WarningsActualLength": 0, "ErrorsActualLength": 0 } }, "Extra": { "OperationName": "Backup", "machine-id": "66f5ffc7ff474a73a3c9cba4ac7bfb65", "machine-name": "WSJ-SER5", "backup-name": "WSJ-SER5 Local files", "backup-id": "DB-2" } } "
```

这生成了一个应用程序蓝图，然后我对其进行了轻微修改（如下所示），然后点击 `Prototype this App`：

![appblueprint](/img/app-blueprint.png)

我后来使用这些提示来调整和完善设计和行为：

> 从仪表板概览页面移除 "查看详情" 按钮和机器名称上的链接，如果用户点击行上的任何位置，将显示详细页面。

> 在显示字节大小时，使用自动缩放（KB、MB、GB、TB）。

> 在详细页面中，将图表移到表格之后。更改柱状图的颜色为与浅色和深色主题兼容的其他颜色。

> 在详细页面中，减少行数，每页显示 5 个备份。

> 在仪表板概览中，在顶部放置摘要，显示数据库中的机器数量、所有机器的备份总数、所有备份的总上传大小以及所有机器使用的总存储空间。包含图标以方便可视化。

> 请持久化用户选择的主题。另外，添加一些横向边距并使 UI 使用 90% 的可用宽度。

> 在机器详细信息页眉卡片中，包含一个摘要，显示此机器存储的备份总数、备份状态统计、上次备份的警告和错误数量、平均持续时间（以hh:mm:ss格式）、所有备份的总上传大小以及基于上次收到备份信息的已用存储大小。

> 使摘要更小且更紧凑，以减少占用空间。

> 显示上次备份日期时，在同一单元格中以小号灰色字体显示备份发生的时间（例如，x分钟前、x小时前、x天前、x周前、x月前、x年前）。

> 在仪表板概览中，将上次备份日期显示在上次备份状态之前

经过这些提示的迭代后，Firebase生成了如下截图所示的原型：

![原型](/img/screen-prototype.png)

![原型详情](/img/screen-prototype-detail.png)

:::note
一个有趣的点是，从第一次交互开始，Firebase Studio就生成了随机数据来填充页面/图表，使原型像实时应用程序一样运行。
:::

完成初始原型后，我通过界面中的`</>`按钮访问源代码。然后使用Git扩展导出代码并推送到[GitHub](https://www.github.com)上的私有仓库。

# 后端 {/* #backend */}

## 设置 {/* #setup */}

我从GitHub下载代码（使用`git clone`命令）到本地文件夹（在我的情况下，是运行Linux的树莓派5），并安装了Node.js、npm和pnpm依赖项。更多详情请参见[DEVELOPMENT.md](../development/setup.md)。

我设置了Cursor，通过SSH连接从我的Windows机器访问代码文件夹。

我将Duplicati发送的JSON样本复制到一个文件中（参见[示例备份报告](../api-reference/database-values)文档），清除了一些不需要的字段。

## 实现 {/* #implementation */}

我使用初始提示开始实现，重点关注持久化、修复和新功能。这是一个漫长但非常有趣的过程。

### 使用AI生成提示 {/* #using-ai-to-generate-the-prompt */}

我使用Cursor Chat创建了一个详细的提示（`Manual`模式，`Auto`模型）：

> 将此文本改进为向Cursor AI工具生成应用程序原型实现的提示：
> 
> 请根据此代码库创建计划，生成Next.js应用程序原型的完整实现。您的实现应彻底分析提供的代码库，以保持确切的视觉美学、用户体验和导航流程。对于数据存储，请使用SQLite3。根据[示例备份报告](../api-reference/database-values)文档中的结构和内容生成数据库并填充数据，确保JSON中的每个字段都完全集成并持久化。

AI生成了以下提示：

>为一个 Next.js 应用原型创建一个全面的实施计划，满足以下要求：
>
>1. 技术栈：
>   - Next.js 14+，使用 App Router
>   - TypeScript，确保类型安全
>   - SQLite3，数据持久化
>   - TailwindCSS，样式设计
>   - 在适当的地方使用 React 服务器组件
>   - 为交互元素使用客户端组件
>
>2. 数据库设计：
>   - 分析示例备份报告文档，以创建最佳 SQLite 架构
>   - 设计表以高效存储所有备份数据
>   - 为常见查询添加索引
>   - 实施数据验证和类型安全
>
>3. 应用结构：
>   - 实施提供的代码库中的确切 UI/UX
>   - 创建可重用组件以用于常见元素
>   - 使用 App Router 设置适当的路由
>   - 实施响应式布局
>   - 添加深色/浅色主题支持
>
>4. 核心功能：
>   - 仪表板概览，包含机器状态表
>   - 详细的机器视图，包含备份历史
>   - 使用图表进行数据可视化
>   - 实时备份状态更新
>   - 适当的错误处理和加载状态
>
>5. 数据管理：
>   - 创建 API 路由以进行数据操作
>   - 实施高效的数据获取策略
>   - 添加适当的数据验证
>   - 包含数据库操作的错误处理
>
>请提供一个详细的实施计划，涵盖所有这些方面，同时保持现有的视觉设计和用户体验。

我已将生成的提示复制到剪贴板。

### 开始实施旅程 {/* #start-the-implementation-journey */}

我通过点击 `+` 按钮创建了一个新聊天，切换到 `Agent` 模式，并使用 Ctrl+Shift+V（作为文本）粘贴了提示。

在计划生成后，我在聊天中输入 `please, implement this plan` 以开始实施。

:::note
我只包含了起始点，因为我没有记录所有使用的提示。使用的提示有很多。
:::

# 备注 {/* #notes */}

- 一些模型在修复错误时可能会卡住。"claude-3.5" 和 "claude-4" 通常更好，但有时你需要尝试其他模型（GPT、Gemini 等）。
对于复杂的错误或问题，使用提示分析错误的可能原因，而不是简单地请求修复。
- 在进行复杂修改时，使用提示创建计划，然后请求 AI 代理实施。这总是效果更好。
- 在更改源代码时要具体。如果可能，在编辑器中选择相关代码部分，然后按 Ctrl+L 将其包含在聊天中作为上下文。
- 还要在聊天中提及你所提到的文件，以帮助 AI 代理专注于代码的相关部分，避免在其他部分进行更改。
- 我有将 AI 代理人拟人化的倾向，因为它持续使用“我们”、“我们的代码”和“您想让我...吗”。这也是为了提高我在（或[当](https://ai-2027.com/) 天网变得有意识和终结者被发明时）生存的机会。
- 有时，使用 [Gemini](https://gemini.google.com/app)、[Deepseek](https://chat.deepseek.com/)、[ChatGPT](https://chat.openai.com/)、[Manus](https://manus.im/app)... 来生成更好指令的提示给 AI 代理人。
