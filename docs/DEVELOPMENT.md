

![duplistatus](img/duplistatus_banner.png)


# Development instructions

![](https://img.shields.io/badge/version-0.7.22.dev-blue)

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  

  - [Prerequisites](#prerequisites)
  - [Steps](#steps)
  - [Available Scripts](#available-scripts)
    - [Development Scripts](#development-scripts)
    - [Production Scripts](#production-scripts)
    - [Docker Scripts](#docker-scripts)
    - [Cron Service Scripts](#cron-service-scripts)
    - [Testing Scripts](#testing-scripts)
    - [Release Scripts](#release-scripts)
  - [Development Mode Features](#development-mode-features)
    - [Build the application for production](#build-the-application-for-production)
    - [Start the production server (in development environment):](#start-the-production-server-in-development-environment)
    - [Start a docker stack (docker compose)](#start-a-docker-stack-docker-compose)
    - [Stop a docker stack (docker compose)](#stop-a-docker-stack-docker-compose)
    - [Clean docker environment](#clean-docker-environment)
    - [Create a devel image (to test locally or with podman)](#create-a-devel-image-to-test-locally-or-with-podman)
  - [Cron Service](#cron-service)
      - [Start cron service in development mode:](#start-cron-service-in-development-mode)
      - [Start cron service in production mode:](#start-cron-service-in-production-mode)
      - [Start cron service locally (for testing):](#start-cron-service-locally-for-testing)
  - [Test Scripts](#test-scripts)
    - [Generate Test Data](#generate-test-data)
    - [Show the overdue notifications contents (to debug notification system)](#show-the-overdue-notifications-contents-to-debug-notification-system)
    - [Run overdue-check at a specific date/time (to debug notification system)](#run-overdue-check-at-a-specific-datetime-to-debug-notification-system)
    - [Test cron service port connectivity](#test-cron-service-port-connectivity)
  - [Workspace admin scripts & commands](#workspace-admin-scripts--commands)
    - [Clean Database](#clean-database)
    - [Clean build artifacts and dependencies](#clean-build-artifacts-and-dependencies)
    - [Clean docker compose and docker environment](#clean-docker-compose-and-docker-environment)
    - [Generate the logo/favicon and banner from SVG images](#generate-the-logofavicon-and-banner-from-svg-images)
    - [Update the packages to the last version](#update-the-packages-to-the-last-version)
    - [Update version information](#update-version-information)
    - [Update documentation](#update-documentation)
    - [Viewing the configurations on the database](#viewing-the-configurations-on-the-database)
    - [SQL Maintenance Scripts](#sql-maintenance-scripts)
  - [Documentation tools](#documentation-tools)
    - [Updating the Table of Contents on the documentation](#updating-the-table-of-contents-on-the-documentation)
    - [Checking for broken links](#checking-for-broken-links)
  - [Podman testing](#podman-testing)
    - [Initial Setup and Management](#initial-setup-and-management)
    - [Monitoring and Health Checks](#monitoring-and-health-checks)
    - [Debugging Commands](#debugging-commands)
    - [Usage Workflow](#usage-workflow)
  - [Release Management](#release-management)
    - [Versioning (Semantic Versioning)](#versioning-semantic-versioning)
    - [Release Commands](#release-commands)
    - [Creating a GitHub Release](#creating-a-github-release)
    - [Manual Docker Image Build](#manual-docker-image-build)
  - [Frameworks, libraries and tools used](#frameworks-libraries-and-tools-used)
  - [Development Guidelines](#development-guidelines)
    - [Code Organization](#code-organization)
    - [Testing](#testing)
    - [Debugging](#debugging)
    - [API Development](#api-development)
    - [Database Development](#database-development)
    - [UI Development](#ui-development)
- [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->



## Prerequisites

- docker / docker compose
- Node.js ^20.x (minimum: 20.19.0, recommended: 20.x)
- pnpm ^10.x (minimum: 10.15.0, recommended: 10.16.1+)
- SQLite3
- ImageMagick (for SVG conversion scripts)
- doctoc for markdown TOC generation
- markdown-link-check 

## Steps

1. Clone the repository:
```bash
git clone https://github.com/wsj-br/duplistatus.git
cd duplistatus
```

2. Install dependencies (debian/ubuntu):
```bash
sudo apt update
sudo apt install nodejs npm sqlite3 imagemagick  -y
sudo npm install -g pnpm npm-check-updates doctoc markdown-link-check
pnpm install
```


3. Start the development server:

For the default tcp port (8666)
```bash
pnpm dev
```

## Available Scripts

The project includes several npm scripts for different development tasks:

### Development Scripts
- `pnpm dev` - Start development server on port 8666
- `pnpm build` - Build the application for production
- `pnpm lint` - Run ESLint to check code quality
- `pnpm typecheck` - Run TypeScript type checking

### Production Scripts
- `pnpm start` - Start production server (port 9666)
- `pnpm start-local` - Start production server locally (port 8666)
- `pnpm build-local` - Build and prepare for local production

### Docker Scripts
- `pnpm docker-up` - Start Docker Compose stack
- `pnpm docker-down` - Stop Docker Compose stack
- `pnpm docker-clean` - Clean Docker environment and cache

### Cron Service Scripts
- `pnpm cron:start` - Start cron service in production mode
- `pnpm cron:dev` - Start cron service in development mode with file watching
- `pnpm cron:start-local` - Start cron service locally for testing

### Test Scripts
- `pnpm generate-test-data` - Generate test backup data
- `pnpm show-overdue-notifications` - Show overdue notification contents
- `pnpm run-overdue-check` - Run overdue check at specific date/time
- `pnpm test-cron-port` - Test cron service port connectivity

### Release Scripts
- `pnpm release:patch` - Create a patch release (0.0.x)
- `pnpm release:minor` - Create a minor release (0.x.0)
- `pnpm release:major` - Create a major release (x.0.0)


<br>

## Development Mode Features

When running in development mode (`pnpm dev`), the application includes additional features to help with debugging and development:

- **JSON File Storage**: All received backup data is stored as JSON files in the `data` directory. These files are named using the timestamp of when they were received, in the format `YYYY-MM-DDTHH-mm-ss-sssZ.json` (UTC time). This feature is only active in development mode and helps with debugging by preserving the raw data received from Duplicati.

- **Verbose Logging**: The application logs more detailed information about database operations and API requests when running in development mode.

- **Version Update**: The development server automatically updates the version information before starting, ensuring the latest version is displayed in the application.

- **Backup Deletion**: On the server detail page, a delete button appears in the backups table that allows you to delete individual backups. This feature is especially useful for testing and debugging the overdue backups functionality.

- **Enhanced Debugging Tools**: Development mode includes additional debugging features such as:
  - Database maintenance menu with cleanup options
  - Test notification functionality
  - Overdue backup check button for manual testing
  - Server connection testing tools
  - Backup collection utilities

<br>

### Build the application for production
```bash
pnpm build
```


### Start the production server (in development environment):
```bash
pnpm start-local
```


### Start a docker stack (docker compose)

```bash
pnpm docker-up
```

Or manually:
```bash
docker compose up --build -d
```

### Stop a docker stack (docker compose)

```bash
pnpm docker-down
```

Or manually:
```bash
docker compose down
```

### Clean docker environment

```bash
pnpm docker-clean
```

Or manually:
```bash
./scripts/clean-docker.sh
```

This script performs a complete Docker cleanup, which is useful for:
- Freeing up disk space
- Removing old/unused Docker artifacts
- Cleaning up after development or testing sessions
- Maintaining a clean Docker environment

### Create a devel image (to test locally or with podman)

```bash
docker build . -t wsj-br/duplistatus:devel
```

<br><br>

## Cron Service

The application includes a separate cron service for handling scheduled tasks:

#### Start cron service in development mode:
```bash
pnpm cron:dev
```

#### Start cron service in production mode:
```bash
pnpm cron:start
```

#### Start cron service locally (for testing):
```bash
pnpm cron:start-local
```

The cron service runs on a separate port (8667 in development, 9667 in production) and handles scheduled tasks like overdue backup notifications. The port can be configured using `CRON_PORT` environment variable.

The cron service includes:
- **Health check endpoint**: `/health` - Returns service status and active tasks
- **Manual task triggering**: `POST /trigger/:taskName` - Manually execute scheduled tasks
- **Task management**: `POST /start/:taskName` and `POST /stop/:taskName` - Control individual tasks
- **Configuration reload**: `POST /reload-config` - Reload configuration from database
- **Automatic restart**: The service automatically restarts if it crashes (managed by `duplistatus-cron.sh`)
- **Watch mode**: Development mode includes file watching for automatic restarts on code changes
- **Overdue backup monitoring**: Automated checking and notification of overdue backups
- **Flexible scheduling**: Configurable cron expressions for different tasks
- **Database integration**: Shares the same SQLite database with the main application
- **RESTful API**: Complete API for service management and monitoring


<br><br>

## Test Scripts

The project includes several test scripts to help with development and testing:

### Generate Test Data
```bash
pnpm run generate-test-data --servers=N
```
This script generates test backup data for multiple servers and backups. 

The `--servers=N` parameter is **mandatory** and specifies the number of servers to generate (1-30).

Use the option `--upload` to send the generated data to the `/api/upload`

```bash
pnpm run generate-test-data --servers=N --upload
```

**Examples:**
```bash
# Generate data for 5 servers
pnpm run generate-test-data --servers=5

# Generate data for 1 server with upload mode
pnpm run generate-test-data --upload --servers=1

# Generate data for all 30 servers
pnpm run generate-test-data --servers=30
```

>[!CAUTION]
> This script delete all the previous data in the database and replace it with the test data.
> Backup your database before running this script.



### Show the overdue notifications contents (to debug notification system)
```bash
pnpm show-overdue-notifications
```

### Run overdue-check at a specific date/time (to debug notification system)

```bash
pnpm run-overdue-check "YYYY-MM-DD HH:MM:SS"
``` 

### Test cron service port connectivity

To test cron service connectivity, you can:

1. Check if the cron service is running:
```bash
curl http://localhost:8667/health
```

2. Or use the cron service API endpoints directly through the main application:
```bash
curl http://localhost:8666/api/cron/health
```

3. Use the test script to verify port connectivity:
```bash
pnpm test-cron-port
```

This script tests the connectivity to the cron service port and provides detailed information about the connection status.


<br><br>

## Workspace admin scripts & commands

### Clean Database
```bash
./scripts/clean-db.sh
```
Cleans the database by removing all data while preserving the database schema and structure.

>[!CAUTION]
> Use with caution as this will delete all existing data.

<br>


### Clean build artifacts and dependencies
```bash
scripts/clean-workspace.sh
```
Removes all build artifacts, node_modules directory, and other generated files to ensure a clean state. This is useful when you need to perform a fresh installation or resolve dependency issues. The command will delete:
- `node_modules/` directory
- `.next/` build directory
- `dist/` directory
- All docker build cache and perform a docker system prune
- pnpm store cache
- Unused Docker system resources (images, networks, volumes)
- Any other build cache files

<br>

### Clean docker compose and docker environment
```bash
scripts/clean-docker.sh
```
Perform a complete Docker cleanup, which is useful for:
- Freeing up disk space
- Removing old/unused Docker artifacts
- Cleaning up after development or testing sessions
- Maintaining a clean Docker environment

<br>

### Generate the logo/favicon and banner from SVG images
```bash
scripts/convert_svg_logo.sh
```


> The svg files are located in the `docs/img` folder. This script requires ImageMagick to be installed on your system.

<br>

### Update the packages to the last version

```bash
ncu --upgrade
pnpm update
```

### Update version information

```bash
./scripts/update-version.sh
```

This script automatically updates the `.env` file with the current version from `package.json`. It:
- Extracts the version from `package.json`
- Creates or updates the `.env` file with the `VERSION` variable
- Only updates if the version has changed
- Provides feedback on the operation

### Update documentation

```bash
./scripts/update-docs.sh
```

This script updates all documentation files with the current version and regenerates table of contents:
- Updates version badges in all `.md` files to match `package.json`
- Runs `doctoc` to regenerate table of contents
- Provides feedback on updated files
- Requires `doctoc` to be installed globally

### Viewing the configurations on the database

```bash
sqlite3 data/backups.db "SELECT key, value FROM configurations;" | awk -F'|' '
  {print "\n" $1 ": "; 
   if(index($2,"{")>0) {print $2 |"jq -C ."; close("jq -C .")} 
   else {print $2;}}' | less -R
```

### SQL Scripts for Debugging and Maintenance

The project includes SQL scripts for database maintenance:

#### Delete Backup Settings
```bash
sqlite3 data/backups.db < scripts/delete-backup-settings.sql
```
This script removes all backup settings from the configurations table. Use with caution as this will reset all backup notification configurations.

#### Delete Last Backup
```bash
sqlite3 data/backups.db < scripts/delete-last-backup.sql
```
This script removes the most recent backup record for each server. By default, it deletes the last backup for ALL servers. The script includes commented examples for targeting specific servers by name. Useful for testing and debugging purposes.

**Note**: The script has been updated to work with the current database schema (uses `servers` table and `server_id` column).

>[!CAUTION]
> These SQL scripts directly modify the database. Always backup your database before running these scripts.

<br><br>

## Documentation tools

### Updating the Table of Contents on the documentation

```bash
doctoc *.md docs/*.md
```
<br>

### Checking for broken links

```bash
markdown-link-check *.md docs/*.md
```


## Podman testing

Copy and execute the scripts located at "scripts/podman_testing" in the podman test server

### Initial Setup and Management
1. `initialize.duplistatus`: to create the pod
2. `copy.docker.duplistatus`: to copy the docker image created in the devel server to the podman test server.
   - Create the image using the command `docker build . -t wsj-br/duplistatus:devel`
3. `start.duplistatus`: to start the container
4. `stop.duplistatus`: to stop the pod and remove the container

### Monitoring and Health Checks
5. `check.duplistatus`: to check the logs, connectivity and application health.

### Debugging Commands
- `logs.duplistatus`: to show the logs of the pod
- `exec.shell.duplistatus`: open a shell in the container
- `restart.duplistatus`: stop the pod, remove the container, copy the image, create the container and start the pod.

### Usage Workflow
1. First run `initialize.duplistatus` to set up the pod
2. Use `copy.docker.duplistatus` to transfer the Docker image
3. Start the container with `start.duplistatus`
4. Monitor with `check.duplistatus` and `logs.duplistatus`
5. Stop with `stop.duplistatus` when done
6. Use `restart.duplistatus` for a complete restart cycle


<br><br>

## Release Management

### Versioning (Semantic Versioning)

The project follows Semantic Versioning (SemVer) with the format `MAJOR.MINOR.PATCH`:

- **MAJOR** version (x.0.0): When you make incompatible API changes
- **MINOR** version (0.x.0): When you add functionality in a backward-compatible manner
- **PATCH** version (0.0.x): When you make backward-compatible bug fixes

### Release Commands

The project includes several release commands to manage versioning:

```bash
# For bug fixes and minor changes (0.0.x)
pnpm run release:patch

# For new features that don't break existing functionality (0.x.0)
pnpm run release:minor

# For major changes that may break compatibility (x.0.0)
pnpm run release:major
```


These commands will:
1. Update the version in package.json
2. Create a git commit with the version change
3. Create a git tag for the new version
4. Push the changes and tag to the remote repository

### Creating a GitHub Release

After running a release command, follow these steps to create a GitHub release:

1. Go to the [GitHub repository](https://github.com/wsj-br/duplistatus)
2. Click on "Releases" in the right sidebar
3. Click "Create a new release"
4. Select the tag that was just created (e.g., v1.2.3)
5. Add release notes describing the changes
6. Click "Publish release"

This will automatically:
- Create a new Docker images (AMD64 and ARM64 architectures)
- Push the images to Docker Hub 
- Push the images to GitHub Container Registry (ghcr.io/wsj-br/duplistatus:latest)

<br>

### Manual Docker Image Build

To manually trigger the Docker image build workflow:

1. Go to the GitHub repository
2. Click on "Actions" tab
3. Select the "Build and Publish Docker Image" workflow
4. Click "Run workflow"
5. Select the branch to build from
6. Click "Run workflow"

<br><br>

## Frameworks, libraries and tools used

1. **Runtime & Package Management**
   - Node.js ^20.x (minimum: 20.19.0, recommended: 20.x)
   - pnpm ^10.x (minimum: 10.15.0, enforced via preinstall hook)

2. **Core Frameworks & Libraries**
   - Next.js 15.5.3 – React-based SSR/SSG framework with App Router
   - React 19.1.1 & React-DOM 19.1.1
   - Radix UI (@radix-ui/react-*) – headless component primitives (latest versions)
   - Tailwind CSS 4.1.13 + tailwindcss-animate 1.0.7 plugin
   - PostCSS (@tailwindcss/postcss 4.1.13 + autoprefixer 10.4.21)
   - Better-sqlite3 12.2.0 + SQLite3 (data store)
   - Recharts 3.2.0 – charting library
   - react-day-picker 9.9.0 – date picker
   - react-hook-form 7.62.0 – forms
   - lucide-react 0.544.0 – icon components
   - clsx 2.1.1 – utility for conditional classNames
   - class-variance-authority 0.7.1 – variant styling helper
   - date-fns 4.1.0 – date utilities
   - uuid 13.0.0 – unique IDs
   - server-only 0.0.1 – Next helper for server-only modules
   - express 5.1.0 – web framework for cron service
   - node-cron 4.2.1 – cron job scheduling
   - string-template 1.0.0 – string templating
   - tailwind-merge 3.3.1 – Tailwind class merging utility
   - framer-motion 12.23.12 – animation library

3. **Type Checking & Linting**
   - TypeScript 5.9.2 + tsc (noEmit)
   - TSX 4.20.5 – lightweight runner for TS scripts
   - ESLint 9.35.0 (via `next lint`)

4. **Build & Dev Tools**
   - Web/CSS bundling via Next's built-in toolchain
   - Scripts under `scripts/` (shell & TS) for test data generation, DB reset, SVG conversion, workspace cleanup, etc.
   - Custom server implementation (`duplistatus-server.ts`)

5. **Containerization & Deployment**
   - Docker (node:alpine base)
   - Docker Compose (`docker-compose.yml`)
   - Alpine build tooling (`apk add` curl, python3, make, g++, …) for compiling better-sqlite3
   - cURL (healthchecks)
   - GitHub Actions workflows (docker/setup-*, buildx, metadata-action, build-push-action)
   - Docker Hub & GitHub Container Registry
   - Multi-architecture builds (AMD64, ARM64)

6. **Project Configuration & Monorepo Support**
   - `tsconfig.json` & `scripts/tsconfig.json`
   - `next.config.ts` (standalone output, webpack configuration)
   - `tailwind.config.ts`
   - `postcss.config.mjs`
   - `pnpm-workspace.yaml`
   - `components.json` (shadcn/ui configuration)

7. **Version Control & Release**
   - Git (preinstall hook enforces pnpm)
   - Semantic-versioning scripts (`release:patch`, `release:minor`, `release:major`)
   - GitHub Releases (via Actions on `release` events)

8. **Cron Service**
   - Separate cron service (`src/cron-service/`) for scheduled tasks 
   - Express-based REST API for service management
   - Health check and task management endpoints
   - Automatic restart via `duplistatus-cron.sh` script
   - Runs on separate port (8667 dev, 9667 prod)
   - Handles overdue backup notifications and other scheduled tasks
   - Configurable via environment variables and database settings

9. **Notification System**
   - ntfy.sh integration for push notifications
   - Configurable notification templates with variable substitution
   - Overdue backup monitoring and alerting
   - Test notification functionality
   - Flexible overdue backup notification scheduling (one time/daily/weekly/monthly)

10. **Auto-refresh System**
    - Configurable automatic refresh of dashboard and detail pages
    - Manual refresh controls with visual feedback
    - Progress indicators and loading states

11. **Enhanced UI Features**
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
    - Display menu component for UI customization
    - Theme toggle (light/dark mode)
    - Server connection management and testing
    - Metrics charts panel with interactive visualizations
    - Server cards with comprehensive backup information
    - Auto-refresh functionality for real-time updates
    - Progress indicators and loading states
    - Responsive design for mobile and desktop

12. **API Documentation**
    - Comprehensive API endpoints documented in `API-ENDPOINTS.md`
    - RESTful API structure with consistent error handling
    - Core operations: Upload, retrieval, and management of backup data
    - Configuration management endpoints for notifications, server connections, and backup settings
    - Notification system endpoints with NTFY integration
    - Cron service management endpoints for task control
    - Health check and monitoring endpoints
    - Chart data endpoints for visualization
    - Server and backup management endpoints
    - Database maintenance and cleanup endpoints
    - Environment and system information endpoints

13. **Database & Data Management**
    - Database schema and key queries documented in `DATABASE.md`
    - SQLite with better-sqlite3 for data persistence
    - Database migrations system (`src/lib/db-migrations.ts`)
    - Utility functions for database operations (`src/lib/db-utils.ts`)
    - Type-safe database operations with TypeScript interfaces
    - Backup data collection and processing
    - Server and backup relationship management

14. **Development & Debugging Tools**
    - TypeScript strict mode enabled
    - ESLint configuration for code quality
    - Development mode features (JSON file storage, verbose logging)
    - Test data generation scripts
    - Database cleanup utilities
    - Workspace management scripts

<br><br>

## Development Guidelines

### Code Organization
- **Components**: Located in `src/components/` with subdirectories for specific features
  - `ui/` - shadcn/ui components and reusable UI elements
  - `dashboard/` - Dashboard-specific components (server cards, tables, summary cards)
  - `settings/` - Settings page components (forms, configuration panels)
  - `server-details/` - Server detail page components (backup tables, charts, summaries)
- **API Routes**: Located in `src/app/api/` with RESTful endpoint structure
  - Core operations: upload, servers, backups, summary
  - Configuration: notifications, server connections, backup settings
  - Chart data: server-specific and aggregated data
  - Cron service: task management and monitoring
  - Health and environment endpoints
- **Database**: SQLite with better-sqlite3, utilities in `src/lib/db-utils.ts`
- **Types**: TypeScript interfaces in `src/lib/types.ts`
- **Configuration**: Default configs in `src/lib/default-config.ts`
- **Cron Service**: Located in `src/cron-service/` with separate service implementation
- **Scripts**: Utility scripts in `scripts/` directory for testing and maintenance

### Testing
- Use the provided test scripts for generating data and testing functionality
- Test notification system with the built-in test endpoints (`/api/notifications/test`)
- Verify cron service functionality by checking the health endpoints (`curl http://localhost:8667/health` or `curl http://localhost:8666/api/cron/health`)
- Test the docker and podman images using the provided scripts
- Use TypeScript strict mode for compile-time error checking
- Test database operations with the provided utilities
- Use the test data generation script (`pnpm generate-test-data`) for comprehensive testing
- Test overdue backup functionality with manual triggers (`pnpm run-overdue-check`)

### Debugging
- Development mode provides verbose logging and JSON file storage
- Use the browser's developer tools for frontend debugging
- Check the console for detailed error messages and API responses
- Cron service includes health check endpoints for monitoring (`/api/cron/health`)
- Database utilities include debugging and maintenance functions
- Use the database maintenance menu for cleanup and debugging operations
- Test server connections with the built-in connection testing tools
- Monitor notification system with the NTFY messages button

### API Development
- All API endpoints are documented in `API-ENDPOINTS.md`
- Follow the established RESTful patterns for new endpoints
- Maintain consistent error handling and response formats
- Test new endpoints with the provided test scripts
- Use TypeScript interfaces for type safety
- Implement proper validation and error handling
- Follow the established patterns for configuration endpoints
- Ensure proper CORS handling for cross-origin requests

### Database Development
- Use the migration system for schema changes (`src/lib/db-migrations.ts`)
- Follow the established patterns in `src/lib/db-utils.ts`
- Maintain type safety with TypeScript interfaces
- Test database operations with the provided utilities
- Use the database maintenance tools for cleanup and debugging
- Follow the established schema patterns for new tables
- Implement proper indexing for performance
- Use prepared statements for security

### UI Development
- Use shadcn/ui components for consistency
- Follow the established patterns in existing components
- Use Tailwind CSS for styling
- Maintain responsive design principles
- Test components in both light and dark themes
- Use TypeScript interfaces for component props
- Implement proper error boundaries and loading states
- Follow accessibility best practices
- Use the established patterns for forms and validation
- Implement proper state management with React hooks

<br>

# License
The project is licensed under the [Apache License 2.0](../LICENSE).   

**Copyright © 2025 Waldemar Scudeller Jr.**
