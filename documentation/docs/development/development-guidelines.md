# Development Reference

## Code Organisation

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

## Testing & Debugging

- Test data generation: `pnpm generate-test-data --servers=N`
- Notification testing: `/api/notifications/test` endpoint
- Cron health checks: `curl http://localhost:8667/health` or `curl http://localhost:8666/api/cron/health`
- Overdue backup testing: `pnpm run-overdue-check`
- Development mode: verbose logging and JSON file storage
- Database maintenance: use maintenance menu for cleanup operations
- Pre-checks: `scripts/pre-checks.sh` for troubleshooting startup issues

## Development References

- API endpoints: See [API Reference](../api-reference/overview)
- Database schema: See [Database Schema](database)
- Follow patterns in `src/lib/db-utils.ts` for database operations

## Frameworks & Libraries

### Runtime & Package Management
- Node.js >=24.12.0
- pnpm >=10.24.0 (packageManager: pnpm@10.27.0)

### Core Frameworks & Libraries
- Next.js ^16.1.1 (App Router)
- React ^19.2.3 & React-DOM ^19.2.3
- Radix UI (@radix-ui/react-*): ^1.1.8 - ^2.2.6 (accordion ^1.2.12, alert-dialog ^1.1.15, avatar ^1.1.11, checkbox ^1.3.3, dialog ^1.1.15, dropdown-menu ^2.1.16, label ^2.1.8, menubar ^1.1.16, popover ^1.1.15, progress ^1.1.8, radio-group ^1.3.8, scroll-area ^1.2.10, select ^2.2.6, separator ^1.1.8, slider ^1.3.6, slot ^1.2.4, switch ^1.2.6, tabs ^1.1.13, toast ^1.2.15, tooltip ^1.2.8)
- Tailwind CSS ^4.1.18 + tailwindcss-animate ^1.0.7
- Better-sqlite3 ^12.5.0
- Recharts ^3.6.0, react-day-picker ^9.13.0, react-hook-form ^7.70.0, react-datepicker ^9.1.0
- lucide-react ^0.562.0, clsx ^2.1.1, class-variance-authority ^0.7.1
- date-fns ^4.1.0, uuid ^13.0.0
- express ^5.2.1 (cron service), node-cron ^4.2.1
- nodemailer ^7.0.12, qrcode ^1.5.4

### Type Checking & Linting
- TypeScript ^5.9.3
- TSX ^4.21.0
- ESLint ^9.39.2 (via `next lint`)

### Build & Deployment
- Next.js standalone output (`output: 'standalone'`) with container entrypoint starting `server.js`
- Docker (node:alpine base) with multi-architecture builds (AMD64, ARM64)
- GitHub Actions workflows for CI/CD
- Inkscape for logos and pictures
- Docusaurus for documentation
- Greenfish Icon Editor for icons


### Project Configuration
- `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`
- `pnpm-workspace.yaml`, `components.json` (shadcn/ui)

## System Features

- **Cron Service**: Separate service for scheduled tasks, auto-restart via `duplistatus-cron.sh`
- **Notifications**: ntfy.sh integration and SMTP email (nodemailer), configurable templates
- **Auto-refresh**: Configurable automatic refresh for dashboard and detail pages
