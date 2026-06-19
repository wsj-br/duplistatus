# 开发参考 {#development-reference}

## 代码组织 {#code-organisation}

- **Components**: `src/components/` 及其子目录：
  - `ui/` - shadcn/ui 组件和可复用 UI 元素
  - `dashboard/` - 仪表板专用组件
  - `settings/` - 设置页面组件
  - `server-details/` - 服务器详情页组件
- **API Routes**: `src/app/api/` 采用 RESTful 端点结构（见 [API 参考](../api-reference/overview)）
- **Database**: 使用 better-sqlite3 的 SQLite，实用程序位于 `src/lib/db-utils.ts`，迁移文件位于 `src/lib/db-migrations.ts`
- **Types**: TypeScript 接口位于 `src/lib/types.ts`
- **Configuration**: 默认配置位于 `src/lib/default-config.ts`
- **Cron Service**: `src/cron-service/`（运行在端口 8667 开发环境，9667 生产环境）
- **Scripts**: 实用脚本位于 `scripts/` 目录
- **Security**: CSRF 保护位于 `src/lib/csrf-middleware.ts`，受保护端点请使用 `withCSRF` 中间件

## 测试与调试 {#testing--debugging}

- 测试数据生成：`pnpm generate-test-data --servers=N`
- 通知测试：`/api/notifications/test` 端点
- Cron 健康检查：`curl http://localhost:8667/health` 或 `curl http://localhost:8666/api/cron/health`
- 逾期备份测试：**设置 → 备份监控**（**测试逾期备份**），或使用带有身份验证的 `POST /api/notifications/check-overdue`
- 开发模式：详细日志记录和 JSON 文件存储
- 数据库维护：使用维护菜单进行清理操作
- 预检：使用 `scripts/pre-checks.sh` 排除启动故障

## 开发参考资料 {#development-references}

- API 端点：见 [API 参考](../api-reference/overview)
- 数据库架构：见 [数据库架构](database)
- 数据库操作请遵循 `src/lib/db-utils.ts` 中的模式

## 框架与库 {#frameworks--libraries}

:::info
有关具体版本，请参阅 [`package.json`](https://github.com/wsj-br/duplistatus/blob/master/package.json) (`dependencies`, `devDependencies`, `engines`, 和 `packageManager`)。下面的列表特意简化了版本信息，以便在依赖升级后依然准确。
:::

### 运行时与包管理 {#runtime--package-management}
- Node.js（见 `engines.node`）
- pnpm（通过 `preinstall` 脚本强制执行；见 `engines.pnpm` / `packageManager`）

### 核心框架与库 {#core-frameworks--libraries}
- Next.js (App Router)
- React 和 React-DOM
- Radix UI (`@radix-ui/react-*` 原语)
- Tailwind CSS v4 + tailwindcss-animate
- better-sqlite3
- Recharts, react-day-picker, react-hook-form, react-datepicker
- lucide-react, clsx, class-variance-authority
- date-fns, uuid
- bcrypt
- express (cron 服务), node-cron
- nodemailer, qrcode
- ai-i18n-tools, i18next, react-i18next (UI + 文档翻译流水线)

### 类型检查与 Linting {#type-checking--linting}
- TypeScript (严格模式)
- TSX (用于运行 TypeScript 脚本)
- ESLint (扁平配置 `eslint.config.mjs` + `eslint-config-next`；通过 `pnpm lint` → `eslint .` 运行)
- webpack

### 构建与部署 {#build--deployment}
- Next.js 独立输出 (`output: 'standalone'`)，容器入口点启动 `server.js`
- Docker (node:alpine 基础镜像)，支持多架构构建 (AMD64, ARM64)
- 用于 CI/CD 的 GitHub Actions 工作流
- 使用 Inkscape 制作 Logo 和图片
- 使用 Docusaurus 编写文档
- 使用 Greenfish Icon Editor 制作图标

### 项目配置 {#project-configuration}
- `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`
- `pnpm-workspace.yaml`, `components.json` (shadcn/ui)

## 系统功能 {#system-features}

- **Cron 服务**：用于计划任务的独立服务，在 Docker 部署中由 `docker-entrypoint.sh` 启动
- **通知**：集成 ntfy.sh 和 SMTP 邮件 (nodemailer)，支持可配置的模板
- **自动刷新**：仪表板和详情页支持可配置的自动刷新
