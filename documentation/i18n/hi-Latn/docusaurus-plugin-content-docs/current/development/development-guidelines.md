# Development Reference {#development-reference}

## Code Organisation {#code-organisation}

- **Components**: `src/components/` subdirectories ke saath:
  - `ui/` - shadcn/ui components aur reusable UI elements
  - `dashboard/` - Dashboard-specific components
  - `settings/` - Settings page components
  - `server-details/` - Server detail page components
- **API Routes**: `src/app/api/` RESTful endpoint structure ke saath (dekhen [API Reference](../api-reference/overview))
- **Database**: SQLite better-sqlite3 ke saath, utilities `src/lib/db-utils.ts` mein, migrations `src/lib/db-migrations.ts` mein
- **Types**: TypeScript interfaces `src/lib/types.ts` mein
- **Configuration**: Default configs `src/lib/default-config.ts` mein
- **Cron Service**: `src/cron-service/` (port 8667 dev, 9667 prod par chalta hai)
- **Scripts**: Utility scripts `scripts/` directory mein
- **Security**: CSRF protection `src/lib/csrf-middleware.ts` mein, protected endpoints ke liye `withCSRF` middleware ka upyog karen

## Testing & Debugging {#testing--debugging}

- Test data generation: `pnpm generate-test-data --servers=N`
- Notification testing: `/api/notifications/test` endpoint
- Cron health checks: `curl http://localhost:8667/health` ya `/api/notifications/test`
- Overdue backup testing: **Settings → Backup monitoring** (**Test overdue backups**), ya `POST /api/notifications/check-overdue` authentication ke saath
- Development mode: verbose logging aur JSON file storage
- Database maintenance: cleanup operations ke liye maintenance menu ka upyog karen
- Pre-checks: startup issues ko troubleshoot karne ke liye `scripts/pre-checks.sh`

## Development References {#development-references}

- API endpoints: [API Reference](../api-reference/overview) dekhen
- Database schema: [Database Schema](database) dekhen
- Database operations ke liye `src/lib/db-utils.ts` mein patterns follow karen

## Frameworks & Libraries {#frameworks--libraries}

:::info
Exact versions ke liye, [`package.json`](https://github.com/wsj-br/duplistatus/blob/master/package.json) dekhen (`dependencies`, `devDependencies`, `engines`, aur `packageManager`). Neeche di gayi list intentionally version-light hai taaki yeh dependency upgrades mein accurate rahe.
:::

### Runtime & Package Management {#runtime--package-management}
- Node.js (`engines.node` dekhen)
- pnpm (`preinstall` script ke dwara enforce kiya gaya hai; `engines.pnpm` / `packageManager` dekhen)

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
- TSX (TypeScript scripts chalane ke liye)
- ESLint (flat config `eslint.config.mjs` + `eslint-config-next`; `pnpm lint` → `eslint .` ke dwara run karen)
- webpack

### Build & Deployment {#build--deployment}
- Next.js standalone output (`output: 'standalone'`) container entrypoint ke saath jo `server.js` start karta hai
- Docker (node:alpine base) multi-architecture builds ke saath (AMD64, ARM64)
- CI/CD ke liye GitHub Actions workflows
- Inkscape logos aur chitraon ke liye
- Docusaurus documentation ke liye
- Greenfish Icon Editor icons ke liye

### Project Configuration {#project-configuration}
- `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`
- `pnpm-workspace.yaml`, `components.json` (shadcn/ui)

## Pranali Features {#system-features}

- **Cron Service**: Scheduled tasks ke liye alag service, Docker deployments mein `docker-entrypoint.sh` dwara start ki gayi
- **Suchnaayein**: ntfy.sh integration aur SMTP Email (nodemailer), configurable Templates
- **Auto-refresh**: Dashboard aur detail pages ke liye configurable automatic refresh
