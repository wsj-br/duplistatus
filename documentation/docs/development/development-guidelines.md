# Development Reference {#development-reference}

## Code Organisation {#code-organisation}

- **Components**: `src/components/` with subdirectories:
  - `ui/` - shadcn/ui components and reusable UI elements
  - `dashboard/` - Dashboard-specific components
  - `settings/` - Settings page components
  - `server-details/` - Server detail page components
- **API Routes**: `src/app/api/` with RESTful endpoint structure (see [API Reference](../api-reference/overview))
- **Database**: SQLite with better-sqlite3, utilities in `src/lib/db-utils.ts`, migrations in `src/lib/db-migrations.ts`
- **Types**: TypeScript interfaces in `src/lib/types.ts`
- **Configuration**: Default configs in `src/lib/default-config.ts`
- **Cron Service**: `src/cron-service/` (runs on port 8667 dev, 9667 prod)
- **Scripts**: Utility scripts in `scripts/` directory
- **Security**: CSRF protection in `src/lib/csrf-middleware.ts`, use `withCSRF` middleware for protected endpoints

## Testing & Debugging {#testing--debugging}

- Test data generation: `pnpm generate-test-data --servers=N`
- Notification testing: `/api/notifications/test` endpoint
- Cron health checks: `curl http://localhost:8667/health` or `curl http://localhost:8666/api/cron/health`
- Overdue backup testing: **Settings → Backup monitoring** (**Test overdue backups**), or `POST /api/notifications/check-overdue` with authentication
- Development mode: verbose logging and JSON file storage
- Database maintenance: use maintenance menu for cleanup operations
- Pre-checks: `scripts/pre-checks.sh` for troubleshooting startup issues

## Development References {#development-references}

- API endpoints: See [API Reference](../api-reference/overview)
- Database schema: See [Database Schema](database)
- Follow patterns in `src/lib/db-utils.ts` for database operations

## Frameworks & Libraries {#frameworks--libraries}

:::info
For exact versions, see [`package.json`](https://github.com/wsj-br/duplistatus/blob/master/package.json) (`dependencies`, `devDependencies`, `engines`, and `packageManager`). The list below is intentionally version-light so it stays accurate across dependency upgrades.
:::

### Runtime & Package Management {#runtime--package-management}
- Node.js (see `engines.node`)
- pnpm (enforced via the `preinstall` script; see `engines.pnpm` / `packageManager`)

### Core Frameworks & Libraries {#core-frameworks--libraries}
- Next.js (App Router)
- React & React-DOM
- Radix UI (`@radix-ui/react-*` primitives)
- Tailwind CSS v4 + tailwindcss-animate
- better-sqlite3
- Recharts, react-day-picker, react-hook-form, react-datepicker
- lucide-react, clsx, class-variance-authority
- date-fns, uuid
- bcrypt
- express (cron service), node-cron
- nodemailer, qrcode
- ai-i18n-tools, i18next, react-i18next (UI + docs translation pipeline)

### Type Checking & Linting {#type-checking--linting}
- TypeScript (strict mode)
- TSX (for running TypeScript scripts)
- ESLint (flat config `eslint.config.mjs` + `eslint-config-next`; run via `pnpm lint` → `eslint .`)
- webpack

### Build & Deployment {#build--deployment}
- Next.js standalone output (`output: 'standalone'`) with container entrypoint starting `server.js`
- Docker (node:alpine base) with multi-architecture builds (AMD64, ARM64)
- GitHub Actions workflows for CI/CD
- Inkscape for logos and pictures
- Docusaurus for documentation
- Greenfish Icon Editor for icons


### Project Configuration {#project-configuration}
- `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`
- `pnpm-workspace.yaml`, `components.json` (shadcn/ui)

## System Features {#system-features}

- **Cron Service**: Separate service for scheduled tasks, started by `docker-entrypoint.sh` in Docker deployments
- **Notifications**: ntfy.sh integration and SMTP email (nodemailer), configurable templates
- **Auto-refresh**: Configurable automatic refresh for dashboard and detail pages
