# 开发参考 {/* #development-reference */}

## 代码组织 {/* #code-organisation */}

- **组件**: `src/components/` 具有子目录:
  - `ui/` - shadcn/ui 组件和可重用的 UI 元素
  - `dashboard/` - 仪表板特定组件
  - `settings/` - 设置页面组件
  - `server-details/` - 服务器详情页面组件
- **API 路由**: `src/app/api/` 具有 RESTful 端点结构 (请参阅 [API 参考](../api-reference/overview))
- **数据库**: SQLite 与 better-sqlite3，实用程序在 `src/lib/db-utils.ts`，迁移在 `src/lib/db-migrations.ts`
- **类型**: TypeScript 接口在 `src/lib/types.ts`
- **配置**: 默认配置在 `src/lib/default-config.ts`
- **Cron 服务**: `src/cron-service/` (在开发模式下运行端口 8667，生产模式下运行端口 9667)
- **脚本**: 实用脚本在 `scripts/` 目录
- **安全**: CSRF 保护在 `src/lib/csrf-middleware.ts`，使用 `withCSRF` 中间件保护端点

## 测试与调试 {/* #testing--debugging */}

- 测试数据生成: `pnpm generate-test-data --servers=N`
- 通知测试: `/api/notifications/test` 端点
- Cron 健康检查: `curl http://localhost:8667/health` 或 `curl http://localhost:8666/api/cron/health`
- 过期备份测试: **设置 → 备份监控** (**测试过期备份**)，或 `POST /api/notifications/check-overdue` 与身份验证
- 开发模式: 详细日志记录和 JSON 文件存储
- 数据库维护: 使用维护菜单进行清理操作
- 预检查: `scripts/pre-checks.sh` 用于排查启动问题

## 开发参考 {/* #development-references */}

- API 端点: 请参阅 [API 参考](../api-reference/overview)
- 数据库架构: 请参阅 [数据库架构](database)
- 遵循 `src/lib/db-utils.ts` 中的模式进行数据库操作

## 框架与库 {/* #frameworks--libraries */}

:::info
有关精确版本，请参阅 [`package.json`](https://github.com/wsj-br/duplistatus/blob/master/package.json) (`dependencies`, `devDependencies`, `engines`, 和 `packageManager`)。以下列表故意不包含版本信息，以便在依赖项升级时保持准确性。
:::

### 运行时与包管理 {/* #runtime--package-management */}
- Node.js (请参阅 `engines.node`)
- pnpm (通过 `preinstall` 脚本强制执行；请参阅 `engines.pnpm` / `packageManager`)

### 核心框架与库 {/* #core-frameworks--libraries */}
- Next.js (App Router)
- React & React-DOM
- Radix UI (`@radix-ui/react-*` 原语)
- Tailwind CSS v4 + tailwindcss-animate
- better-sqlite3
- Recharts, react-day-picker, react-hook-form, react-datepicker
- lucide-react, clsx, class-variance-authority
- date-fns, uuid
- bcrypt
- express (cron 服务), node-cron
- nodemailer, qrcode
- ai-i18n-tools, i18next, react-i18next (UI + 文档翻译管道)

### 类型检查与代码检查 {/* #type-checking--linting */}
- TypeScript (严格模式)
- TSX (用于运行 TypeScript 脚本)
- ESLint (平面配置 `eslint.config.mjs` + `eslint-config-next`；通过 `pnpm lint` → `eslint .` 运行)
- webpack

### 构建与部署 {/* #build--deployment */}
- Next.js 独立输出 (`output: 'standalone'`) 与容器入口点启动 `server.js`。文件跟踪仍然运行用于 Docker 运行时镜像；`outputFileTracingExcludes` 在 `next.config.ts` 中删除仅构建的包 (webpack, SWC 编译器本地代码, esbuild, CSS 压缩器) 和非 Linux `better-sqlite3` 预构建。请勿排除 `@swc/helpers`, `sharp`, 或 Linux sqlite 预构建。
- Docker (基于 node:alpine) 具有多架构构建 (AMD64, ARM64)。该镜像仅构建 Next.js 应用 (不构建 Docusaurus 站点)；pnpm 版本取自 `packageManager` 在 `package.json` 中
- GitHub Actions 工作流用于 CI/CD
- Inkscape 用于徽标和图片
- Docusaurus 用于文档
- Greenfish Icon Editor 用于图标

### 项目配置 {/* #project-configuration */}
- `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`
- `pnpm-workspace.yaml`, `components.json` (shadcn/ui)

## 系统功能 {/* #system-features */}

- **Cron 服务**：用于计划任务的独立服务，在 Docker 部署中由 `docker-entrypoint.sh` 启动
- **通知**：ntfy.sh 集成和 SMTP 电子邮件（nodemailer），可配置的模板
- **自动刷新**：可配置的仪表板和详细页面自动刷新
