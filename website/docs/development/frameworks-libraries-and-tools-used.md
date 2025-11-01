

# Frameworks, Libraries and Tools Used

## Runtime & Package Management
- Node.js ^20.x (minimum: 20.19.0, recommended: 20.x)
- pnpm ^10.x (minimum: 10.18.0, enforced via preinstall hook)

## Core Frameworks & Libraries
- Next.js 15.5.4 – React-based SSR/SSG framework with App Router
- React 19.2.0 & React-DOM 19.2.0
- Radix UI (@radix-ui/react-*) – headless component primitives (latest versions)
- Tailwind CSS 4.1.14 + tailwindcss-animate 1.0.7 plugin
- PostCSS (@tailwindcss/postcss 4.1.14 + autoprefixer 10.4.21)
- Better-sqlite3 12.4.1 + SQLite3 (data store)
- Recharts 3.2.1 – charting library
- react-day-picker 9.11.0 – date picker
- react-hook-form 7.64.0 – forms
- lucide-react 0.544.0 – icon components
- clsx 2.1.1 – utility for conditional classNames
- class-variance-authority 0.7.1 – variant styling helper
- date-fns 4.1.0 – date utilities
- uuid 13.0.0 – unique IDs
- express 5.1.0 – web framework for cron service
- node-cron 4.2.1 – cron job scheduling
- string-template 1.0.0 – string templating
- tailwind-merge 3.3.1 – Tailwind class merging utility
- nodemailer 7.0.7 – email notifications
- qrcode 1.5.4 – QR code generation

## Type Checking & Linting
- TypeScript 5.9.3 + tsc (noEmit)
- TSX 4.20.6 – lightweight runner for TS scripts
- ESLint 9.37.0 (via `next lint`)

## Build & Dev Tools
- Web/CSS bundling via Next's built-in toolchain
- Scripts under `scripts/` (shell & TS) for test data generation, DB reset, SVG conversion, workspace cleanup, etc.
- Custom server implementation (`duplistatus-server.ts`)

## Containerization & Deployment
- Docker (node:alpine base)
- Docker Compose (`docker-compose.yml`)
- Alpine build tooling (`apk add` curl, python3, make, g++, …) for compiling better-sqlite3
- cURL (health checks)
- GitHub Actions workflows (docker/setup-*, buildx, metadata-action, build-push-action)
- Docker Hub & GitHub Container Registry
- Multi-architecture builds (AMD64, ARM64)

## Project Configuration & Monorepo Support
- `tsconfig.json` & `scripts/tsconfig.json`
- `next.config.ts` (standalone output, webpack configuration)
- `tailwind.config.ts`
- `postcss.config.mjs`
- `pnpm-workspace.yaml`
- `components.json` (shadcn/ui configuration)

## Version Control & Release
- Git (preinstall hook enforces pnpm)
- Semantic-versioning scripts (`release:patch`, `release:minor`, `release:major`)
- GitHub Releases (via Actions on `release` events)

## Cron Service
- Separate cron service (`src/cron-service/`) for scheduled tasks 
- Express-based REST API for service management
- Health check and task management endpoints
- Automatic restart via `duplistatus-cron.sh` script
- Runs on separate port (8667 dev, 9667 prod)
- Handles overdue backup notifications and other scheduled tasks
- Configurable via environment variables and database settings

## Notification System
- ntfy.sh integration for push notifications
- Email notifications via SMTP (nodemailer)
- Configurable notification templates with variable substitution
- Overdue backup monitoring and alerting
- Test notification functionality
- Flexible overdue backup notification scheduling (one time/daily/weekly/monthly)

## Auto-refresh System
- Configurable automatic refresh of dashboard and detail pages
- Manual refresh controls with visual feedback
- Progress indicators and loading states

## Enhanced UI Features
- Sortable tables with persistent preferences
- Enhanced backup version display with icons
- Click-to-view available versions functionality
- Improved navigation with return links
- Status badges that link to backup details
- Database maintenance menu with cleanup operations
- NTFY messages button for notification management
- Global refresh controls with visual feedback
- Overdue backup check button for manual testing
- Enhanced backup collection menu
- Display menu component for UI customisation
- Theme toggle (light/dark mode)
- Server connection management and testing
- Metrics charts panel with interactive visualisations
- Server cards with comprehensive backup information
- Auto-refresh functionality for real-time updates
- Progress indicators and loading states
- Responsive design for mobile and desktop

## API Documentation
- Comprehensive API endpoints documented in `API-ENDPOINTS.md`
- RESTful API structure with consistent error handling and CSRF protection
- Core operations: Upload, retrieval, and management of backup data
- Configuration management endpoints for notifications, server connections, and backup settings
- Notification system endpoints with NTFY and email integration
- Cron service management endpoints for task control
- Health check and monitoring endpoints
- Chart data endpoints for visualisation (aggregated and server-specific)
- Server and backup management endpoints with alias and note support
- Database maintenance and cleanup endpoints
- Environment and system information endpoints
- Session management and CSRF token endpoints
- Dashboard data aggregation endpoints
- Server detail endpoints with overdue backup information

## Database & Data Management
- Database schema and key queries documented in `DATABASE.md`
- SQLite with better-sqlite3 for data persistence
- Database migrations system (`src/lib/db-migrations.ts`)
- Utility functions for database operations (`src/lib/db-utils.ts`)
- Type-safe database operations with TypeScript interfaces
- Backup data collection and processing
- Server and backup relationship management
- CSRF protection with session management

## Development & Debugging Tools
- TypeScript strict mode enabled
- ESLint configuration for code quality
- Development mode features (JSON file storage, verbose logging)
- Test data generation scripts
- Database cleanup utilities
- Workspace management scripts
