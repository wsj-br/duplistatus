

![duplistatus](img/duplistatus_banner.png)


# Development instructions

![](https://img.shields.io/badge/version-0.7.13.dev-blue)

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  

  - [Prerequisites](#prerequisites)
  - [Steps](#steps)
  - [Development Mode Features](#development-mode-features)
    - [Build the application for production](#build-the-application-for-production)
    - [Start the production server (in development environment):](#start-the-production-server-in-development-environment)
    - [Start a docker stack (docker compose)](#start-a-docker-stack-docker-compose)
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
  - [Documentation tools](#documentation-tools)
    - [Updating the Table of Contents on the documentation](#updating-the-table-of-contents-on-the-documentation)
    - [Checking for broken links](#checking-for-broken-links)
  - [Podman testing](#podman-testing)
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
- Node.js ^20.x (minimum: 18.19.0, recommended: 20.x)
- pnpm ^10.x (minimum: 10.12.4, recommended: 10.15.1+)
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


<br>

## Development Mode Features

When running in development mode (`pnpm dev`), the application includes additional features to help with debugging and development:

- **JSON File Storage**: All received backup data is stored as JSON files in the `data` directory. These files are named using the timestamp of when they were received, in the format `YYYY-MM-DDTHH-mm-ss-sssZ.json` (UTC time). This feature is only active in development mode and helps with debugging by preserving the raw data received from Duplicati.

- **Verbose Logging**: The application logs more detailed information about database operations and API requests when running in development mode.

- **Version Update**: The development server automatically updates the version information before starting, ensuring the latest version is displayed in the application.

- **Backup Deletion**: On the machine detail page, a delete button appears in the backups table that allows you to delete individual backups. This feature is especially useful for testing and debugging the overdue backups functionality.

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
docker compose up --build -d
```

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
pnpm run generate-test-data
```
This script generates test backup data for multiple machines and backups. 

Use the option `--upload` to send the generated data to the `/api/upload`

```bash
pnpm run generate-test-data --upload
```




### Show the overdue notifications contents (to debug notification system)
```bash
pnpm show-overdue-notifications
```

### Run overdue-check at a specific date/time (to debug notification system)

```bash
pnpm run-overdue-check "YYYY-MM-DD HH:MM:SS"
``` 

### Test cron service port connectivity

```bash
pnpm test-cron-port
```
This script tests the connectivity to the cron service port and verifies that the service is responding correctly.


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

1. `initialize.duplistatus`: to create the pod
2. `copy.docker.duplistatus`: to copy the docker image create in the devel server to the podman test server.
   - create the image using the command `docker build . -t wsj-br/duplistatus:devel`
3. `start.duplistatus`: to start the container
4. `check.duplistatus`: to check the logs, connectivity and application health.
5. `stop.duplistatus`: to stop the pod and remove the container

To debug use these commands:

- `logs.duplistatus`: to show the logs of the pod
- `exec.shell.duplistatus`: open a shell in the container
- `restart.duplistaus`: stop the pod, remove the container, copy the image, create the container and start the pod.


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
   - Node.js ^20.x (minimum: 18.19.0, recommended: 20.x)
   - pnpm ^10.x (minimum: 10.12.4, enforced via preinstall hook)

2. **Core Frameworks & Libraries**
   - Next.js 15.5.2 – React-based SSR/SSG framework with App Router
   - React 19.1.1 & React-DOM 19.1.1
   - Radix UI (@radix-ui/react-*) – headless component primitives (latest versions)
   - Tailwind CSS 4.1.13 + tailwindcss-animate 1.0.7 plugin
   - PostCSS (@tailwindcss/postcss 4.1.13 + autoprefixer 10.4.21)
   - Better-sqlite3 12.2.0 + SQLite3 (data store)
   - Recharts 3.1.2 – charting library
   - react-day-picker 9.9.0 – date picker
   - react-hook-form 7.62.0 – forms
   - lucide-react 0.542.0 – icon components
   - clsx 2.1.1 – utility for conditional classNames
   - class-variance-authority 0.7.1 – variant styling helper
   - date-fns 4.1.0 – date utilities
   - uuid 12.0.0 – unique IDs
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
    - Machine cards with comprehensive backup information
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
    - Machine and backup management endpoints
    - Database maintenance and cleanup endpoints
    - Environment and system information endpoints

13. **Database & Data Management**
    - Database schema and key queries documented in `DATABASE.md`
    - SQLite with better-sqlite3 for data persistence
    - Database migrations system (`src/lib/db-migrations.ts`)
    - Utility functions for database operations (`src/lib/db-utils.ts`)
    - Type-safe database operations with TypeScript interfaces
    - Backup data collection and processing
    - Machine and backup relationship management

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
  - `dashboard/` - Dashboard-specific components (machine cards, tables, summary cards)
  - `settings/` - Settings page components (forms, configuration panels)
  - `machine-details/` - Machine detail page components (backup tables, charts, summaries)
- **API Routes**: Located in `src/app/api/` with RESTful endpoint structure
  - Core operations: upload, machines, backups, summary
  - Configuration: notifications, server connections, backup settings
  - Chart data: machine-specific and aggregated data
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
- Verify cron service functionality with the test scripts (`pnpm test-cron-port`)
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
