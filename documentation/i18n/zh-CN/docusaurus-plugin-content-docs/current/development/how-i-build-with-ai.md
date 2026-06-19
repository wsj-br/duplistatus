# 我是如何使用 AI 工具构建此应用程序的 {#how-i-build-this-application-using-ai-tools}

# 动机 {#motivation}

我开始使用 Duplicati 作为家庭服务器的备份工具。我尝试了官方的 [Duplicati dashboard](https://app.duplicati.com/) 和 [Duplicati Monitoring](https://www.duplicati-monitoring.com/)，但我有两个主要需求：(1) 自托管；(2) 提供一个 API 以便与 [Homepage](https://gethomepage.dev/) 集成，因为我将其用作家庭实验室的主页。

我还尝试直接连接到网络上的每个 Duplicati 服务器，但身份验证方法与 Homepage 不兼容（或者我无法正确配置它）。

由于我当时也在尝试 AI 代码工具，我决定尝试使用 AI 来构建这个工具。以下是我使用的方法...

# 使用的工具 {#tools-used}

1. UI 部分：[Google's Firebase Studio](https://firebase.studio/)
2. 实现部分：Cursor (https://www.cursor.com/)

:::note
我使用 Firebase 来构建 UI，但你也可以使用 [v0.app](https://v0.app/) 或任何其他工具来生成原型。我使用 Cursor 来生成实现，但你也可以使用其他工具，例如 VS Code/Copilot、Windsurf 等。
:::

# UI {#ui}

我在 [Firebase Studio](https://studio.firebase.google.com/) 中创建了一个新项目，并在“使用 AI 原型化应用”功能中使用了以下提示词：

> 一个使用 tailwind/react 的 Web 仪表板应用程序，用于将多台机器通过 duplicati 备份方案的 --send-http-url 选项（JSON 格式）发送的备份结果整合到 sqllite3 数据库中，并跟踪备份的状态、大小和上传大小。
> 
> 仪表板的第一页应包含一个表格，显示每台机器的上次备份，包括机器名称、数据库中存储的备份数量、上次备份状态、持续时间 (hh:mm:ss)、警告数量和错误数量。
> 
> 当点击机器行时，显示所选机器的详情页，其中包含存储的备份列表（分页），包括备份名称、备份的日期和时间（包括多久以前）、状态、警告数量和错误数量、文件数量、文件大小、已上传大小和存储总量。此外，在详情页中包含一个使用 Tremor 的图表，显示以下字段的演变：已上传大小、以分钟为单位的持续时间、检查的文件数量、检查的文件大小。图表应一次绘制一个字段，并提供一个下拉菜单来选择要绘制的字段。此外，图表必须呈现数据库中存储的所有备份，而不仅仅是分页表格中显示的备份。
> 
> 应用程序必须公开一个 API 端点以接收来自 duplicati 服务器的 POST 请求，以及另一个 API 端点以将机器上次备份的所有详情作为 JSON 返回。
> 
> 设计应现代、响应式，并包含图标和其他视觉辅助工具以提高可读性。代码必须简洁、精炼且易于维护。使用 pnpm 等现代工具处理依赖项。
> 
> 应用程序必须具有可选择的深色和浅色主题。
> 
> 数据库应存储从 duplicati JSON 中接收的这些字段：

```json
"{ "Data": { "DeletedFiles": 0, "DeletedFolders": 0, "ModifiedFiles": 0, "ExaminedFiles": 15399, "OpenedFiles": 1861, "AddedFiles": 1861, "SizeOfModifiedFiles": 0, "SizeOfAddedFiles": 13450481, "SizeOfExaminedFiles": 11086692615, "SizeOfOpenedFiles": 13450481, "NotProcessedFiles": 0, "AddedFolders": 419, "TooLargeFiles": 0, "FilesWithError": 0, "ModifiedFolders": 0, "ModifiedSymlinks": 0, "AddedSymlinks": 0, "DeletedSymlinks": 0, "PartialBackup": false, "Dryrun": false, "MainOperation": "Backup", "ParsedResult": "Success", "Interrupted": false, "Version": "2.1.0.5 (2.1.0.5_stable_2025-03-04)", "EndTime": "2025-04-21T23:46:38.3568274Z", "BeginTime": "2025-04-21T23:45:46.9712217Z", "Duration": "00:00:51.3856057", "WarningsActualLength": 0, "ErrorsActualLength": 0, "BackendStatistics": { "BytesUploaded": 8290314, "BytesDownloaded": 53550393, "KnownFileSize": 9920312634, "LastBackupDate": "2025-04-22T00:45:46+01:00", "BackupListCount": 6, "ReportedQuotaError": false, "ReportedQuotaWarning": false, "MainOperation": "Backup", "ParsedResult": "Success", "Interrupted": false, "Version": "2.1.0.5 (2.1.0.5_stable_2025-03-04)", "BeginTime": "2025-04-21T23:45:46.9712252Z", "Duration": "00:00:00", "WarningsActualLength": 0, "ErrorsActualLength": 0 } }, "Extra": { "OperationName": "Backup", "machine-id": "66f5ffc7ff474a73a3c9cba4ac7bfb65", "machine-name": "WSJ-SER5", "backup-name": "WSJ-SER5 Local files", "backup-id": "DB-2" } } "
```

这生成了一个应用蓝图，我在点击 `Prototype this App` 之前对其进行了轻微修改（如下所示）：

![appblueprint](/img/app-blueprint.png)

随后我使用这些提示词来调整和优化设计与行为：

> 从仪表板概览页中删除“查看详情”按钮以及机器名称上的链接；如果用户点击行的任何位置，将显示详情页。

> 在呈现以字节为单位的大小（sizes）时，使用自动缩放（KB, MB, GB, TB）。

> 在详情页中，将图表移至表格之后。将柱状图的颜色更改为其他与浅色和深色主题兼容的颜色。

> 在详情页中，减少行数，每页显示 5 个备份。

> 在仪表板概览中，在顶部放置一个摘要，包含数据库中的机器数量、所有机器的备份总数、所有备份的已上传总大小以及所有机器使用的存储总量。包含图标以方便可视化。

> 请持久化用户选择的主题。此外，添加一些侧边距，并使 UI 使用可用宽度的 90%。

> 在机器详情页眉卡片中，包含一个摘要，显示该机器存储的备份总数、备份状态统计、上次备份的警告数量和错误数量、平均持续时间（格式为 hh:mm:ss）、全部备份的已上传总大小，以及基于接收到的上次备份信息的已用存储大小。

> 将摘要设计得更小、更紧凑，以减少占用空间。

> 在显示上次备份日期时，在同一个单元格中以灰色小字体显示备份发生的时间（例如：x 分钟前，x 小时前，x 天前，x 周前，x 个月前，x 年前）。

> 在概览仪表板中，将上次备份日期放在上次备份状态之前

在迭代这些提示词后，Firebase 生成了如下截图所示的原型：

![prototype](/img/screen-prototype.png)

![prototype-detail](/img/screen-prototype-detail.png)

:::note
一个有趣的点是，从第一次交互开始，Firebase Studio 就生成了随机数据来填充页面/图表，使原型运行起来像一个实时应用程序。
:::

在完成初始原型后，我通过点击界面中的 `</>` 按钮访问了源代码。然后，我使用 Git 扩展将代码导出并推送到 [GitHub](https://www.github.com) 的私有仓库中。

# 后端 {#backend}

## 环境搭建 {#setup}

我将代码从 GitHub 下载（使用 `git clone` 命令）到本地文件夹（在我的情况下，是运行 Linux 的 Raspberry Pi 5），并安装了 Node.js、npm 和 pnpm 依赖项。更多详情请参阅 [DEVELOPMENT.md](../development/setup.md)。

我配置了 Cursor，通过 SSH 连接从我的 Windows 机器访问代码文件夹。

我将 Duplicati 发送的 JSON 样本复制到一个文件中（参见 [sample backup report](../api-reference/database-values) 文档），并清除了一些不需要的字段。

## 实现 {#implementation}

我使用了一个初始提示词来开始实现，重点关注持久化、修复和新功能。这是一个漫长但非常有趣的过程。

### 使用 AI 生成提示词 {#using-ai-to-generate-the-prompt}

我使用 Cursor Chat（`Manual` 模式，`Auto` 模型）创建了一个详细的提示词：

> 将此文本优化为 Cursor AI 工具的提示词，以生成应用程序原型的实现：
> 
> 请制定一个计划，根据此代码库生成 Next.js 应用程序原型的完整实现。你的实现应深入分析提供的代码库，以保持完全一致的视觉美感、用户体验和导航流程。数据存储请使用 SQLite3。根据 [sample backup report](../api-reference/database-values) 文档中的结构和内容生成数据库并填充数据，确保 JSON 中的每个字段都得到完整的集成和持久化。

AI 生成了以下提示词：

>为 Next.js 应用程序原型创建一个全面的实施计划，要求如下：
>
>1. 技术栈：
>   - Next.js 14+ 且使用 App Router
>   - 使用 TypeScript 确保类型安全
>   - 使用 SQLite3 进行数据持久化
>   - 使用 TailwindCSS 进行样式设计
>   - 在适用场景下使用 React Server Components
>   - 交互元素使用客户端组件
>
>2. 数据库设计：
>   - 分析示例备份报告文档以创建最优的 SQLite 模式 (schema)
>   - 设计能够高效存储所有备份数据的表
>   - 为常用查询添加索引
>   - 实现数据验证和类型安全
>
>3. 应用程序结构：
>   - 实现所提供代码库中的精确 UI/UX
>   - 为通用元素创建可复用组件
>   - 使用 App Router 设置正确的路由
>   - 实现响应式布局
>   - 添加深色/浅色主题支持
>
>4. 核心功能：
>   - 包含机器状态表的概览仪表板
>   - 包含备份历史的机器详细视图
>   - 使用图表进行数据可视化
>   - 实时备份状态更新
>   - 正确的错误处理和加载状态
>
>5. 数据管理：
>   - 为数据操作创建 API 路由
>   - 实现高效的数据获取策略
>   - 添加正确的数据验证
>   - 为数据库操作包含错误处理
>
>请提供一个涵盖所有这些方面的详细实施计划，同时保持现有的视觉设计和用户体验。

我将生成的提示词复制到了剪贴板中。

### 开始实施之旅 {#start-the-implementation-journey}

我通过点击 `+` 按钮创建了一个新聊天，切换到 `Agent` 模式，并使用 Ctrl+Shift+V（作为文本）粘贴了提示词。

计划生成后，我在聊天中输入 `please, implement this plan` 以开始实施。

:::note
我仅包含了起点，因为我没有记录所有使用的提示词。提示词数量很多。
:::

# 笔记 {#notes}

- 某些模型在修复 Bug 时可能会陷入僵局。“claude-3.5”和“claude-4”通常表现更好，但有时你得尝试另一个模型（GPT、Gemini 等）。
对于复杂的 Bug 或错误，请使用提示词分析错误的可能原因，而不是简单地要求修复它。
- 在进行复杂修改时，先使用提示词制定计划，然后要求 AI 代理执行。这样效果总是更好。
- 修改源代码时请具体化。如果可能，在编辑器中选择相关代码部分并按下 Ctrl+L 将其作为上下文包含在聊天中。
- 此外，在聊天中提及你所指的文件引用，以帮助 AI 代理专注于代码的相关部分，避免修改代码的其他部分。
- 鉴于 AI 代理坚持使用“我们”、“我们的代码”和“您是否希望我...”，我有将 AI 代理人格化的倾向。这也是为了在 Skynet 产生意识且终结者被发明的情况下（或者 [当](https://ai-2027.com/) 发生时）提高我的生存几率。
- 有时，使用 [Gemini](https://gemini.google.com/app)、[Deepseek](https://chat.deepseek.com/)、[ChatGPT](https://chat.openai.com/)、[Manus](https://manus.im/app)... 为 AI 代理生成包含更好指令的提示词。
