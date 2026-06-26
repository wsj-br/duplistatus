# 开发参考 {#development-reference}

## 代码组织 {#code-organisation}

- **组件**: `src/components/` 包含子目录:
  - `ui/` - shadcn/ui 组件和可重用 UI 元素
  - `dashboard/` - 仪表板特定组件
  - `settings/` - 设置页面组件
  - `server-details/` - 服务器详细页面组件
- **API 路由**: `src/app/api/` 具有 RESTful 端点结构（见 [API 参考](../api-reference/overview)）
- **数据库**: SQLite 与 better-sqlite3，工具在 `src/lib/db-utils.ts`，迁移在 `src/lib/db-migrations.ts`
- **类型**: TypeScript 接口在 `src/lib/types.ts`
- **配置**: 默认配置在 `src/lib/default-config.ts`
- **定时服务**: `src/cron-service/` （在开发环境中运行端口 8667，生产环境中运行端口 9667）
- **脚本**: 实用脚本在 `scripts/` 目录
- **安全**: CSRF 保护在 `src/lib/csrf-middleware.ts`，使用 `withCSRF` 中间件保护端点

## 测试和调试 {#testing--debugging}

- 测试数据生成: `pnpm generate-test-data --servers=N`
- 通知测试: `/api/notifications/test` 端点
- 定时健康检查: `curl http://localhost:8667/health` 或 `curl http://localhost:8666/api/cron/health`
- 过期备份测试: **设置 → 备份监控** （**测试过期备份**），或 `POST /api/notifications/check-overdue` 使用身份验证
- 开发模式:详细日志和 JSON 文件存储
- 数据库维护:使用维护菜单进行清理操作
- 预检查:`scripts/pre-checks.sh` 用于排除启动问题

## 开发参考 {#development-references}

- API 端点:见 [API 参考](../api-reference/overview)
- 数据库模式:见 [数据库模式](database)
- 按照 `src/lib/db-utils.ts` 中的模式进行数据库操作

## 框架和库 {#frameworks--libraries}

:::info
为了获得确切的版本，请参阅 [`package.json`](https://github.com/wsj-br/duplistatus/blob/master/package.json) （`dependencies`，`devDependencies`，`engines` 和 `packageManager`）。以下列表故意不包含版本号，以便在依赖项升级时保持准确性。
:::

### 运行时和包管理 {#runtime--package-management}
- Node.js（见 `engines.node`）
- pnpm（通过 `preinstall` 脚本强制执行；见 `engines.pnpm` / `packageManager`）

### 核心框架和库 {#core-frameworks--libraries}
- Next.js（应用路由器）
- React 和 React-DOM
- Radix UI（`@radix-ui/react-*` 基础组件）
- Tailwind CSS v4 + tailwindcss-animate
- better-sqlite3
- Recharts，react-day-picker，react-hook-form，react-datepicker
- lucide-react，clsx，class-variance-authority
- date-fns，uuid
- bcrypt
- express（定时服务），node-cron
- nodemailer，qrcode
- ai-i18n-tools，i18next，react-i18next（UI + 文档翻译管道）

### 类型检查和linting {#type-checking--linting}
- TypeScript（严格模式）
- TSX（用于运行 TypeScript 脚本）
- ESLint（平面配置 `eslint.config.mjs` + `eslint-config-next`；通过 `pnpm lint` → `eslint .` 运行）
- webpack

### 构建和部署 {#build--deployment}
- Next.js 独立输出（`output: 'standalone'`）具有容器入口点，启动 `server.js`
- Docker（node:alpine 基础）具有多架构构建（AMD64，ARM64）
- GitHub Actions 工作流用于 CI/CD
- Inkscape 用于创建标志和图片
- Docusaurus 用于文档
- Greenfish Icon Editor 用于图标

### 项目配置 {#project-configuration}
- `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`
- `pnpm-workspace.yaml`, `components.json` (shadcn/ui)

## 系统功能 {#system-features}

- **定时服务**: 独立的服务用于调度任务，由 `docker-entrypoint.sh` 在 Docker 部署中启动
- **通知**: ntfy.sh 集成和 SMTP 电子邮件 (nodemailer)，可配置模板
- **自动刷新**: 可配置的自动刷新功能用于仪表板和详细页面
