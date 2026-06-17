# 我如何使用 AI 工具构建此应用程序 {#how-i-build-this-application-using-ai-tools}

# 动机 {#motivation}

我开始使用 Duplicati 作为家庭服务器的备份工具。我尝试了官方的 [Duplicati dashboard](https://app.duplicati.com/) 和 [Duplicati Monitoring](https://www.duplicati-monitoring.com/)，但我有两个主要需求：(1) 自托管；(2) 暴露 API 以便与 [Homepage](https://gethomepage.dev/) 集成，因为我用它作为家庭实验室的主页。

我也尝试过直接连接网络中的每个 Duplicati 服务器，但认证方式与 Homepage 不兼容（或者我无法正确配置）。

由于我也在尝试 AI 代码工具，我决定尝试使用 AI 构建此工具。以下是我使用的过程...

# 使用的工具 {#tools-used}

1. UI：[Google's Firebase Studio](https://firebase.studio/)
2. 实现：Cursor (https://www.cursor.com/)

:::note
我使用 Firebase 做 UI，但您也可以使用 [v0.app](https://v0.app/) 或任何其他工具生成原型。我使用 Cursor 生成实现，但您也可以使用其他工具，如 VS Code/Copilot、Windsurf 等。
:::

# UI {#ui}

我在 [Firebase Studio](https://studio.firebase.google.com/) 中创建了新项目，并在 "Prototype an app with AI" 功能中使用以下提示：

> A web dashboard application using tailwind/react to consolidate in a sqllite3 database the backup result sent by the duplicati backup solution using the option --send-http-url (json format) of several machines, keep tracking of the status of the backup, size, upload sizes.
> 
> The dashboard first page should have a table with the last backup of each machine in the first page, including the machine name, number of backups stored in the database, the last backup status, duration (hh:mm:ss), number of warnings and errors.
> 
> When clicking a machine line, show a detail page of the select machine with a list of the stored backups (paginated), including the backup name, date and time of the backup, including how long it was ago, the status, number of warnings and errors, number of files, the size of the files, size uploaded and the total size of the storage. Also include in the detail page a chart using Tremor with the evolution of the fields: uploaded size; duration in minutes, number of files examined, size of the files examined. The chart should plot one field at time, with a dropbox to select the desired field to plot. Also the chart has to present all the backups stored in the database, not only the ones showing in the paginated table.
> 
> The application has to expose a api endpoint to receive the post from the duplicati server and other api endpoint to retrieve all the details of the last backup of a machine as a json.
> 
> The design should be modern, responsive and include icons and other visual aids to make it easy to read. The code has to be clean, concise and easy to maintain. Use modern tools like pnpm to deal with dependencies.
> 
> The application has to have a selectable dark and light theme.
> 
> The database should store these fields received by the duplicati json:
```json
"{ "Data": { "DeletedFiles": 0, "DeletedFolders": 0, "ModifiedFiles": 0, "ExaminedFiles": 15399, "OpenedFiles": 1861, "AddedFiles": 1861, "SizeOfModifiedFiles": 0, "SizeOfAddedFiles": 13450481, "SizeOfExaminedFiles": 11086692615, "SizeOfOpenedFiles": 13450481, "NotProcessedFiles": 0, "AddedFolders": 419, "TooLargeFiles": 0, "FilesWithError": 0, "ModifiedFolders": 0, "ModifiedSymlinks": 0, "AddedSymlinks": 0, "DeletedSymlinks": 0, "PartialBackup": false, "Dryrun": false, "MainOperation": "Backup", "ParsedResult": "Success", "Interrupted": false, "Version": "2.1.0.5 (2.1.0.5_stable_2025-03-04)", "EndTime": "2025-04-21T23:46:38.3568274Z", "BeginTime": "2025-04-21T23:45:46.9712217Z", "Duration": "00:00:51.3856057", "WarningsActualLength": 0, "ErrorsActualLength": 0, "BackendStatistics": { "BytesUploaded": 8290314, "BytesDownloaded": 53550393, "KnownFileSize": 9920312634, "LastBackupDate": "2025-04-22T00:45:46+01:00", "BackupListCount": 6, "ReportedQuotaError": false, "ReportedQuotaWarning": false, "MainOperation": "Backup", "ParsedResult": "Success", "Interrupted": false, "Version": "2.1.0.5 (2.1.0.5_stable_2025-03-04)", "BeginTime": "2025-04-21T23:45:46.9712252Z", "Duration": "00:00:00", "WarningsActualLength": 0, "ErrorsActualLength": 0 } }, "Extra": { "OperationName": "Backup", "machine-id": "66f5ffc7ff474a73a3c9cba4ac7bfb65", "machine-name": "WSJ-SER5", "backup-name": "WSJ-SER5 Local files", "backup-id": "DB-2" } } "
```

这生成了 App Blueprint，我在点击 `Prototype this App` 之前稍作修改（如下）：

![appblueprint](/img/app-blueprint.png)

之后我使用以下提示调整和完善设计与行为：

> remove the button "view details" from the dashboard overview page and the link on the machine name, if the user click anywhere on the row, it will show the detail page.

> when presenting sizes in bytes, use a automatic scale (KB, MB, GB, TB).

> in the detail page, move the chart after the table. Change the colour of the barchart to some other colour compatible with light and dark themes.

> in the detail page, reduce the number of rows to present 5 backups per page.

> in the dashboard overview, put a summary on top with the number of machines in the database, total number of backups of all machines, the total uploaded size of all backups and total storage used by all machines. Include icons to facilitate the visualisation.

> please persist the theme select by the user. also, add some lateral margins and make the UI use 90% of the available width.

> in the machine detail header card, include a sumary with the total of backups stored for this machine, a statistic of the backup status, the number of warnings and errors of the last backup, the average duration in hh:mm:ss, the total uploaded size of all backups and the storage size used based on the last backup information received.

> make the summary smaller and more compact to reduce the footprint used.

> when presenting the last backup date, show in the same cell, in a small gray font, the time ago the backup happened (for instance, x minute ago, x hours ago, x days ago, x weeks ago, x months ago, x years ago).

> in the dashboard overview put last backup date before last backup status

迭代这些提示后，Firebase 生成了如下截图所示的原型：

![prototype](/img/screen-prototype.png)

![prototype-detail](/img/screen-prototype-detail.png)

:::note
一个有趣的点是，从第一次交互开始，Firebase Studio 就生成随机数据填充页面/图表，使原型像实时应用程序一样运行。
:::

完成初始原型后，我通过点击界面中的 `</>` 按钮访问源代码。然后使用 Git 扩展导出代码并推送到 [GitHub](https://www.github.com) 上的私有仓库。

# 后端 {#backend}

## 设置 {#setup}

我从 GitHub 下载代码（使用 `git clone` 命令）到本地文件夹（我的情况是运行 Linux 的 Raspberry Pi 5），并安装了 Node.js、npm 和 pnpm 依赖。更多详情请参阅 [DEVELOPMENT.md](../development/setup.md)。

我设置 Cursor 通过 SSH 连接从 Windows 机器访问代码文件夹。

我将 Duplicati 发送的 JSON 样本复制到文件中（请参阅[示例备份报告](../api-reference/database-values)文档），清除了一些不需要的字段。

## 实现 {#implementation}

我使用初始提示开始实现，专注于持久化、修复和新功能。这是一个漫长但非常有趣的过程。

### 使用 AI 生成提示 {#using-ai-to-generate-the-prompt}

我使用 Cursor Chat（`Manual` 模式，`Auto` 模型）创建了详细提示：

> improve this text as a prompt to cursor ai tool to generate the implementation of an applicaiton prototype:
> 
> please create a plan generate the full implementation of a Next.js application prototype from this codebase. Your implementation should thoroughly analyse the provided codebase to maintain the exact visual aesthetics, user experience, and navigation flow. For data storage, utilise SQLite3. Generate the database and populate it using the structure and content found in the [sample backup report](../api-reference/database-values) document, ensuring every field from the JSON is fully integrated and persisted.

AI 生成了以下提示：

>Create a comprehensive implementation plan for a Next.js application prototype with the following requirements:
>
>1. Technical Stack:
>   - Next.js 14+ with App Router
>   - TypeScript for type safety
>   - SQLite3 for data persistence
>   - TailwindCSS for styling
>   - React Server Components where appropriate
>   - Client components for interactive elements
>
>2. Database Design:
>   - Analyse the sample backup report document to create an optimal SQLite schema
>   - Design tables to efficiently store all backup data
>   - Include indexes for common queries
>   - Implement data validation and type safety
>
>3. Application Structure:
>   - Implement the exact UI/UX from the provided codebase
>   - Create reusable components for common elements
>   - Set up proper routing using App Router
>   - Implement responsive layouts
>   - Add dark/light theme support
>
>4. Core Features:
>   - Dashboard overview with machine status table
>   - Detailed machine view with backup history
>   - Data visualisation using charts
>   - Real-time backup status updates
>   - Proper error handling and loading states
>
>5. Data Management:
>   - Create API routes for data operations
>   - Implement efficient data fetching strategies
>   - Add proper data validation
>   - Include error handling for database operations
>
>Please provide a detailed implementation plan that covers all these aspects while maintaining the existing visual design and user experience.

我将生成的提示复制到剪贴板。

### 开始实现之旅 {#start-the-implementation-journey}

我点击 `+` 按钮创建新聊天，切换到 `Agent` 模式，使用 Ctrl+Shift+V 粘贴提示（作为文本）。

计划生成后，我在聊天中输入 `please, implement this plan` 开始实现。

:::note
我只包含了起点，因为我没有记录所有使用的提示。数量很多。
:::

# 备注 {#notes}

- 某些模型在修复 bug 时可能会卡住。"claude-3.5" 和 "claude-4" 通常更好，但有时您需要尝试其他模型（GPT、Gemini 等）。
对于复杂 bug 或错误，使用提示分析错误的可能原因，而不是简单地要求修复。
- 进行复杂修改时，使用提示创建计划，然后要求 AI agent 实现。这总是效果更好。
- 更改源代码时要具体。如有可能，在编辑器中选择相关代码部分，按 Ctrl+L 将其作为上下文包含在聊天中。
- 在聊天中也包含您提及文件的引用，以帮助 AI agent 聚焦相关代码部分，避免更改其他部分。
- 我倾向于将 AI agent 拟人化，因为它持续使用 'we'、'our code' 和 'would you like me to...'。这也是为了提高我在 Skynet 觉醒且终结者被发明时（或[当](https://ai-2027.com/)）的生存几率。
- 有时使用 [Gemini](https://gemini.google.com/app)、[Deepseek](https://chat.deepseek.com/)、[ChatGPT](https://chat.openai.com/)、[Manus](https://manus.im/app) 等，为 AI agent 生成更好的指令提示。
