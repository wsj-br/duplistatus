# 我如何使用 AI 工具构建此应用程序 {#how-i-build-this-application-using-ai-tools}

# 动机 {#motivation}

我开始使用 Duplicati 作为家庭服务器的备份工具。我尝试了官方的 [Duplicati 仪表盘](https://app.duplicati.com/) 和 [Duplicati 监控](https://www.duplicati-monitoring.com/)，但我有两个主要要求：(1) 自托管；和 (2) 暴露 API 以便与 [首页](https://gethomepage.dev/) 集成，因为我使用它作为我的家庭实验室的首页。

我还尝试直接连接到网络上的每个 Duplicati 服务器，但身份验证方法与 Homepage 不兼容（或者我无法正确配置它）。

由于我也在尝试使用 AI 代码工具，我决定尝试使用 AI 构建此工具。以下是我使用的过程...

# 使用的工具 {#tools-used}

1. 用于 UI：[Google 的 Firebase Studio](https://firebase.studio/)
2. 用于实现：Cursor (https://www.cursor.com/)

:::note
我使用 Firebase 进行 UI 设计，但您也可以使用 [v0.app](https://v0.app/) 或其他工具生成原型。我使用 Cursor 生成实现，但您也可以使用其他工具，如 VS Code/Copilot、Windsurf、...
:::

# UI {#ui}

我在 [Firebase Studio](https://studio.firebase.google.com/) 中创建了一个新项目，并使用以下提示在 "使用 AI 原型化应用程序" 功能中：

> 一个使用 tailwind/react 的 Web仪表盘应用程序，使用 sqlite3 数据库来整合来自 Duplicati 备份解决方案的备份结果（使用 --send-http-url 选项，JSON 格式）来自多台机器，跟踪备份状态、大小、上传大小。
> 
> 仪表盘的第一页应具有一个表格，显示每台机器的最后一次备份，包括机器名称、存储在数据库中的备份数量、最后一次备份状态、持续时间（小时：分钟：秒）、警告和错误数量。
> 
> 点击机器行时，显示选定机器的详细页面，包括存储的备份列表（分页），包括备份名称、备份日期和时间、备份时间、状态、警告和错误数量、文件数量、文件大小、上传大小和存储总大小。详细页面还应包括使用 Tremor 的图表，显示以下字段的演变：上传大小；持续时间（分钟）、检查的文件数量、检查的文件大小。图表应一次绘制一个字段，并具有下拉菜单以选择要绘制的字段。图表还应显示数据库中存储的所有备份，而不仅仅是显示在分页表格中的备份。
> 
> 应用程序必须暴露一个 API 端点来接收来自 Duplicati 服务器的 POST 请求和另一个 API 端点来检索机器的最后一次备份的所有详细信息作为 JSON。
> 
> 设计应现代、响应式，并包括图标和其他视觉辅助工具，以便于阅读。代码必须干净、简洁、易于维护。使用现代工具，如 pnpm 来处理依赖项。
> 
> 应用程序必须具有可选择的深色和浅色主题。
> 
> 数据库应存储以下字段，来自 Duplicati JSON：

```json
"{ "Data": { "DeletedFiles": 0, "DeletedFolders": 0, "ModifiedFiles": 0, "ExaminedFiles": 15399, "OpenedFiles": 1861, "AddedFiles": 1861, "SizeOfModifiedFiles": 0, "SizeOfAddedFiles": 13450481, "SizeOfExaminedFiles": 11086692615, "SizeOfOpenedFiles": 13450481, "NotProcessedFiles": 0, "AddedFolders": 419, "TooLargeFiles": 0, "FilesWithError": 0, "ModifiedFolders": 0, "ModifiedSymlinks": 0, "AddedSymlinks": 0, "DeletedSymlinks": 0, "PartialBackup": false, "Dryrun": false, "MainOperation": "Backup", "ParsedResult": "Success", "Interrupted": false, "Version": "2.1.0.5 (2.1.0.5_stable_2025-03-04)", "EndTime": "2025-04-21T23:46:38.3568274Z", "BeginTime": "2025-04-21T23:45:46.9712217Z", "Duration": "00:00:51.3856057", "WarningsActualLength": 0, "ErrorsActualLength": 0, "BackendStatistics": { "BytesUploaded": 8290314, "BytesDownloaded": 53550393, "KnownFileSize": 9920312634, "LastBackupDate": "2025-04-22T00:45:46+01:00", "BackupListCount": 6, "ReportedQuotaError": false, "ReportedQuotaWarning": false, "MainOperation": "Backup", "ParsedResult": "Success", "Interrupted": false, "Version": "2.1.0.5 (2.1.0.5_stable_2025-03-04)", "BeginTime": "2025-04-21T23:45:46.9712252Z", "Duration": "00:00:00", "WarningsActualLength": 0, "ErrorsActualLength": 0 } }, "Extra": { "OperationName": "Backup", "machine-id": "66f5ffc7ff474a73a3c9cba4ac7bfb65", "machine-name": "WSJ-SER5", "backup-name": "WSJ-SER5 Local files", "backup-id": "DB-2" } } "
```

这生成了一个应用程序蓝图，我稍后对其进行了修改（如下），然后点击 `Prototype this App`：

![appblueprint](/img/app-blueprint.png)

我后来使用以下提示来调整和完善设计和行为：

> 从仪表盘概览页面中删除 "查看详情" 按钮和机器名称上的链接，如果用户点击行的任何位置，它将显示详细页面。

> 当显示字节大小时，使用自动缩放（KB、MB、GB、TB）。

> 在详细页面中，将图表移到表格之后。更改条形图的颜色为与浅色和深色主题兼容的其他颜色。

> 在详细页面中，减少要显示的行数以每页显示 5 个备份。

> 在仪表盘概览中，顶部添加一个摘要，包括数据库中的机器数量、所有机器的备份总数、所有备份的总上传大小和所有机器使用的总存储空间。包括图标以方便可视化。

> 请持久保存用户选择的主题。另外，添加一些侧边距，并使 UI 使用 90% 的可用宽度。

> 在机器详细信息头部卡片中，包括一个总结，显示此机器存储的备份总数、备份状态统计、上次备份的警告和错误数量、平均持续时间（以 hh:mm:ss 格式）、所有备份的上传总量和根据上次备份信息计算的存储空间使用情况。

> 使总结更小、更紧凑，以减少使用的空间。

> 当显示上次备份日期时，在同一个单元格中，以小灰色字体显示备份发生的时间（例如，x 分钟前，x 小时前，x 天前，x 周前，x 个月前，x 年前）。

> 在仪表板概览中，将上次备份日期放在上次备份状态之前。

在迭代这些提示后，Firebase 生成了如下所示的原型：

![prototype](/img/screen-prototype.png)

![prototype-detail](/img/screen-prototype-detail.png)

:::note
一个有趣的点是，从第一次交互开始，Firebase Studio 生成了随机数据来填充页面/图表，使原型像一个真实的应用程序一样运行。
:::

完成初始原型后，我通过点击界面中的 `</>` 按钮访问了源代码，然后使用 Git 扩展将代码导出并推送到 [GitHub](https://www.github.com) 上的一个私有仓库。

# 后端 {#backend}

## 设置 {#setup}

我从 GitHub 下载了代码（使用 `git clone` 命令）到一个本地文件夹（在我的情况下，是一个运行 Linux 的 Raspberry Pi 5），并安装了 Node.js、npm 和 pnpm 的依赖项。请参阅 [DEVELOPMENT.md](../development/setup.md) 中的更多详细信息。

我设置了 Cursor 以便从我的 Windows 机器使用 SSH 连接访问代码文件夹。

我将 Duplicati 发送的 JSON 的样本复制到一个文件中（请参阅 [样本备份报告](../api-reference/database-values) 文档），并清除了一些不需要的字段。

## 实现 {#implementation}

我使用一个初始提示开始了实现，重点关注持久性、修复和新功能。这是一个漫长但非常有趣的过程。

### 使用 AI 生成提示 {#using-ai-to-generate-the-prompt}

我使用 Cursor Chat （`Manual` 模式，`Auto` 模型）创建了一个详细的提示：

> 改进此文本作为提示，以便 Cursor AI 工具生成应用程序原型的实现：
> 
> 请创建一个计划，以便从此代码库生成 Next.js 应用程序原型的完整实现。您的实现应该彻底分析提供的代码库，以保持确切的视觉美感、用户体验和导航流程。对于数据存储，请使用 SQLite3。使用 [样本备份报告](../api-reference/database-values) 文档中找到的结构和内容生成数据库，并填充它，确保 JSON 中的每个字段都完全集成和持久化。

AI 生成了以下提示：

>创建一个全面的Next.js应用原型实现计划，具有以下要求：
>
>1. 技术栈：
>   - Next.js 14+带有App Router
>   - 使用TypeScript进行类型安全
>   - 使用SQLite3进行数据持久化
>   - 使用TailwindCSS进行样式设计
>   - 在适当的地方使用React Server Components
>   - 使用客户端组件进行交互元素
>
>2. 数据库设计：
>   - 分析样本备份报告文档以创建最优的SQLite模式
>   - 设计表格以高效存储所有备份数据
>   - 包括常见查询的索引
>   - 实现数据验证和类型安全
>
>3. 应用结构：
>   - 实现提供的代码库的确切UI/UX
>   - 创建可重用的组件用于常见元素
>   - 使用App Router设置正确的路由
>   - 实现响应式布局
>   - 添加深色/浅色主题支持
>
>4. 核心功能：
>   - 仪表板概览，带有机器状态表
>   - 带有备份历史记录的详细机器视图
>   - 使用图表进行数据可视化
>   - 实时备份状态更新
>   - 正确的错误处理和加载状态
>
>5. 数据管理：
>   - 创建用于数据操作的API路由
>   - 实现高效的数据获取策略
>   - 添加正确的数据验证
>   - 包括数据库操作的错误处理
>
>请提供一个详细的实现计划，涵盖所有这些方面，同时保持现有的视觉设计和用户体验。

我将生成的提示复制到剪贴板。

### 开始实现之旅 {#start-the-implementation-journey}

我通过点击 `+` 按钮创建了一个新聊天，切换到 `Agent` 模式，并使用 Ctrl+Shift+V（作为文本）粘贴了提示。

计划生成后，我在聊天中输入 `please, implement this plan` 以开始实现。

:::note
我只包括了起点，因为我没有记录所有使用的提示。有很多。
:::

# 备注 {#notes}

- 一些模型在修复错误时可能会卡住。"claude-3.5" 和 "claude-4" 通常更好，但有时您需要尝试另一个模型（GPT、Gemini 等）。对于复杂的错误或错误，请使用提示分析错误的可能原因，而不是简单地要求修复它。
- 在进行复杂的修改时，使用提示创建一个计划，然后要求 AI 代理实现它。这总是更好。
- 更改源代码时要具体。如果可能，请在编辑器中选择相关的代码部分并按 Ctrl+L 将其包含在聊天中作为上下文。
- 也包括您在聊天中提到的文件的引用，以帮助 AI 代理关注代码的相关部分并避免在代码的其他部分进行更改。
- 我有倾向将人工智能代理人格化，因为它一直使用“我们”、“我们的代码”和“您想让我……”等词语。这也是为了提高我在（或何时（https://ai-2027.com/））Skynet获得感知能力并发明终结者时的生存几率。
- 有时，使用 [Gemini](https://gemini.google.com/app)，[Deepseek](https://chat.deepseek.com/)，[ChatGPT](https://chat.openai.com/)，[Manus](https://manus.im/app)，... 来为人工智能代理生成更好的指令提示。 ||JXA_0: 为了提高人工智能的使用效率||
