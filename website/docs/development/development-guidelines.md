# Development Reference

## Code Organisation

- **Components**: `src/components/` with subdirectories:
  - `ui/` - shadcn/ui components and reusable UI elements
  - `dashboard/` - Dashboard-specific components
  - `settings/` - Settings page components
  - `server-details/` - Server detail page components
- **API Routes**: `src/app/api/` with RESTful endpoint structure (see `API-ENDPOINTS.md`)
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

- API endpoints: See `API-ENDPOINTS.md`
- Database schema: See `DATABASE.md`
- Follow patterns in `src/lib/db-utils.ts` for database operations

## Frameworks & Libraries

### Runtime & Package Management
- Node.js ^20.x (minimum: 20.19.0)
- pnpm ^10.x (minimum: 10.20.0, enforced via preinstall hook)

### Core Frameworks & Libraries
- Next.js ^16.0.5 (App Router)
- React ^19.2.0 & React-DOM ^19.2.0
- Radix UI (@radix-ui/react-*) - latest versions
- Tailwind CSS ^4.1.17 + tailwindcss-animate ^1.0.7
- Better-sqlite3 ^12.5.0
- Recharts ^3.5.1, react-day-picker ^9.11.3, react-hook-form ^7.67.0, react-datepicker ^8.10.0
- lucide-react ^0.555.0, clsx ^2.1.1, class-variance-authority ^0.7.1
- date-fns ^4.1.0, uuid ^13.0.0
- express ^5.1.0 (cron service), node-cron ^4.2.1
- nodemailer ^7.0.11, qrcode ^1.5.4

### Type Checking & Linting
- TypeScript 5.9.3
- TSX 4.20.6
- ESLint 9.39.1 (via `next lint`)

### Build & Deployment
- Custom server: `duplistatus-server.ts`
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
