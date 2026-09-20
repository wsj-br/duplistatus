# 开发参考 {/* #development-reference */}

## 代码组织 {/* #code-organisation */}

- **组件**：`src/components/`，包含子目录：
  - `ui/` - shadcn/ui 组件和可复用的 UI 元素
  - `dashboard/` - 仪表板特定组件
  - `settings/` - 设置页面组件
  - `server-details/` - 服务器详情页面组件
- **API 路由**：`src/app/api/`，采用 RESTful 端点结构（参见 [API 参考](../api-reference/overview)）
- **数据库**：SQLite 配合 better-sqlite3，在 `src/lib/db-utils.ts` 中有工具函数，在 `src/lib/db-migrations.ts` 中有迁移脚本
- **类型**：TypeScript 接口在 `src/lib/types.ts`
- **配置**：默认配置在 `src/lib/default-config.ts`
- **Cron 服务**：`src/cron-service/`（开发环境运行在端口 8667，生产环境运行在端口 9667）
- **脚本**：实用脚本在 `scripts/` 目录
- **安全**：CSRF 保护在 `src/lib/csrf-middleware.ts`，使用 `withCSRF` 中间件保护端点

## 测试与调试 {/* #testing--debugging */}

- 测试数据生成：`pnpm generate-test-data --servers=N`
- 通知测试：`/api/notifications/test` 端点
- Cron 健康检查：`curl http://localhost:8667/health` 或 `curl http://localhost:8666/api/cron/health`
- 过期备份测试：**设置 → 备份监控**（**测试过期备份**），或使用身份验证访问 `POST /api/notifications/check-overdue`
- 开发模式：详细日志记录和 JSON 文件存储
- 数据库维护：使用维护菜单进行清理操作
- 预检查：`scripts/pre-checks.sh` 用于排查启动问题

## 开发参考 {/* #development-references */}

- API 端点：参见 [API 参考](../api-reference/overview)
- 数据库架构：参见 [数据库架构](database)
- 遵循 `src/lib/db-utils.ts` 中的模式进行数据库操作

## 框架与库 {/* #frameworks--libraries */}

:::info
关于确切版本，请参见 [`package.json`](https://github.com/wsj-br/duplistatus/blob/master/package.json)（`dependencies`、`devDependencies`、`engines` 和 `packageManager`）。以下列表有意不指定版本，以便在依赖升级时保持准确性。
:::

### 运行时与包管理 {/* #runtime--package-management */}
- Node.js（参见 `engines.node`）
- pnpm（通过 `preinstall` 脚本强制执行；参见 `engines.pnpm` / `packageManager`）

### 核心框架与库 {/* #core-frameworks--libraries */}
- Next.js（应用路由器）
- React 和 React-DOM
- Radix UI（`@radix-ui/react-*` 基础组件）
- Tailwind CSS v4 + tailwindcss-animate
- better-sqlite3
- Recharts、react-day-picker、react-hook-form、react-datepicker
- lucide-react、clsx、class-variance-authority
- date-fns、uuid
- bcrypt
- express（cron 服务）、node-cron
- nodemailer、qrcode
- ai-i18n-tools、i18next、react-i18next（UI + 文档翻译流水线）

### 类型检查与代码规范 {/* #type-checking--linting */}
- TypeScript（严格模式）
- TSX（用于运行 TypeScript 脚本）
- ESLint（平面配置 `eslint.config.mjs` + `eslint-config-next`；通过 `pnpm lint` → `eslint .` 运行）
- webpack

### 构建与部署 {/* #build--deployment */}
- Next.js 独立输出（`output: 'standalone'`），容器入口点启动 `server.js`。文件追踪仍会在 Docker 运行时镜像中运行；`outputFileTracingExcludes` 在 `next.config.ts` 中删除仅构建包（webpack、SWC 编译器原生包、esbuild、CSS 压缩工具）和非 Linux `better-sqlite3` 预构建包。请勿排除 `@swc/helpers`、`sharp` 或 Linux sqlite 预构建包。
- Docker（基于 node:alpine）支持多架构构建（AMD64、ARM64）。镜像仅构建 Next.js 应用（不构建 Docusaurus 站点）；pnpm 版本取自 `package.json` 中的 `packageManager`
- GitHub Actions 工作流用于 CI/CD
- Inkscape 用于徽标和图片
- Docusaurus 用于文档
- Greenfish Icon Editor 用于图标

### 项目配置 {/* #project-configuration */}
- `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`
- `pnpm-workspace.yaml`, `components.json` (shadcn/ui)

## 系统功能 {/* #system-features */}

- **Cron 服务**：用于定时任务的独立服务，在 Docker 部署中由 `docker-entrypoint.sh` 启动
- **通知**：集成 ntfy.sh 和 SMTP 邮件（nodemailer），可配置模板
- **自动刷新**：可配置仪表板和详情页面的自动刷新
