# 开发参考 {#development-reference}

## 代码组织 {#code-organisation}

- **组件**：`src/components/`，包含子目录：
  - `ui/` - shadcn/ui 组件和可复用 UI 元素
  - `dashboard/` - 仪表板专用组件
  - `settings/` - 设置页组件
  - `server-details/` - 服务器详情页组件
- **API 路由**：`src/app/api/`，RESTful 端点结构（请参阅 [API 参考](../api-reference/overview)）
- **数据库**：SQLite 配合 better-sqlite3，工具位于 `src/lib/db-utils.ts`，迁移位于 `src/lib/db-migrations.ts`
- **类型**：TypeScript 接口位于 `src/lib/types.ts`
- **配置**：默认配置位于 `src/lib/default-config.ts`
- **Cron 服务**：`src/cron-service/`（开发端口 8667，生产端口 9667）
- **脚本**：实用脚本位于 `scripts/` 目录
- **安全**：CSRF 保护位于 `src/lib/csrf-middleware.ts`，受保护端点使用 `withCSRF` 中间件

## 测试与调试 {#testing--debugging}

- 测试数据生成：`pnpm generate-test-data --servers=N`
- 通知测试：`/api/notifications/test` 端点
- Cron 健康检查：`curl http://localhost:8667/health` 或 `curl http://localhost:8666/api/cron/health`
- 逾期备份测试：**设置 → 备份监控**（**测试逾期备份**），或已认证的 `POST /api/notifications/check-overdue`
- 开发模式：详细日志和 JSON 文件存储
- 数据库维护：使用维护菜单进行清理操作
- 预检查：`scripts/pre-checks.sh` 用于排查启动问题

## 开发参考 {#development-references}

- API 端点：请参阅 [API 参考](../api-reference/overview)
- 数据库架构：请参阅 [数据库架构](database)
- 数据库操作请遵循 `src/lib/db-utils.ts` 中的模式

## 框架与库 {#frameworks--libraries}

### 运行时与包管理 {#runtime--package-management}
- Node.js >=24.12.0
- pnpm >=10.24.0 (packageManager: pnpm@10.30.3)

### 核心框架与库 {#core-frameworks--libraries}
- Next.js ^16.1.6 (App Router)
- React ^19.2.4 & React-DOM ^19.2.4
- Radix UI (`@radix-ui/react-*`): ^1.1.8 - ^2.2.6 (accordion ^1.2.12, alert-dialog ^1.1.15, avatar ^1.1.11, checkbox ^1.3.3, dialog ^1.1.15, dropdown-menu ^2.1.16, label ^2.1.8, menubar ^1.1.16, popover ^1.1.15, progress ^1.1.8, radio-group ^1.3.8, scroll-area ^1.2.10, select ^2.2.6, separator ^1.1.8, slider ^1.3.6, slot ^1.2.4, switch ^1.2.6, tabs ^1.1.13, toast ^1.2.15, tooltip ^1.2.8)
- Tailwind CSS ^4.2.1 + tailwindcss-animate ^1.0.7
- Better-sqlite3 ^12.6.2
- Recharts ^3.7.0, react-day-picker ^9.14.0, react-hook-form ^7.71.2, react-datepicker ^9.1.0
- lucide-react ^0.575.0, clsx ^2.1.1, class-variance-authority ^0.7.1
- date-fns ^4.1.0, uuid ^13.0.0
- express ^5.2.1 (cron service), node-cron ^4.2.1
- nodemailer ^8.0.1, qrcode ^1.5.4
- ai-i18n-tools ^1.x, i18next ^26.x, react-i18next ^17.x (UI + 文档翻译流水线)

### 类型检查与 Lint {#type-checking--linting}
- TypeScript ^5.9.3
- TSX ^4.21.0
- ESLint ^9.16.0 (via `next lint`)
- webpack ^5.105.3

### 构建与部署 {#build--deployment}
- Next.js standalone 输出（`output: 'standalone'`），容器入口点启动 `server.js`
- Docker（node:alpine 基础）多架构构建（AMD64、ARM64）
- GitHub Actions 工作流用于 CI/CD
- Inkscape 用于 logo 和图片
- Docusaurus 用于文档
- Greenfish Icon Editor 用于图标


### 项目配置 {#project-configuration}
- `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`
- `pnpm-workspace.yaml`, `components.json` (shadcn/ui)

## 系统功能 {#system-features}

- **Cron 服务**：独立服务用于计划任务，在 Docker 部署中由 `docker-entrypoint.sh` 启动
- **通知**：ntfy.sh 集成和 SMTP 邮件（nodemailer），可配置模板
- **自动刷新**：仪表板和详情页的可配置自动刷新
