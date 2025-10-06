

![duplistatus](img/duplistatus_banner.png)


# Development Instructions



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
    - [Test Scripts](#test-scripts)
  - [Development Mode Features](#development-mode-features)
    - [Build the application for production](#build-the-application-for-production)
    - [Start the production server (in development environment):](#start-the-production-server-in-development-environment)
    - [Start a Docker stack (Docker Compose)](#start-a-docker-stack-docker-compose)
    - [Stop a Docker stack (Docker Compose)](#stop-a-docker-stack-docker-compose)
    - [Clean Docker environment](#clean-docker-environment)
    - [Create a development image (to test locally or with Podman)](#create-a-development-image-to-test-locally-or-with-podman)
  - [Cron Service](#cron-service)
      - [Start cron service in development mode:](#start-cron-service-in-development-mode)
      - [Start cron service in production mode:](#start-cron-service-in-production-mode)
      - [Start cron service locally (for testing):](#start-cron-service-locally-for-testing)
  - [Test Scripts](#test-scripts-1)
    - [Generate Test Data](#generate-test-data)
    - [Show the overdue notifications contents (to debug notification system)](#show-the-overdue-notifications-contents-to-debug-notification-system)
    - [Run overdue-check at a specific date/time (to debug notification system)](#run-overdue-check-at-a-specific-datetime-to-debug-notification-system)
    - [Test cron service port connectivity](#test-cron-service-port-connectivity)
  - [Workspace admin scripts & commands](#workspace-admin-scripts--commands)
    - [Clean Database](#clean-database)
    - [Clean build artefacts and dependencies](#clean-build-artefacts-and-dependencies)
    - [Clean Docker Compose and Docker environment](#clean-docker-compose-and-docker-environment)
    - [Generate the logo/favicon and banner from SVG images](#generate-the-logofavicon-and-banner-from-svg-images)
    - [Update the packages to the latest version](#update-the-packages-to-the-latest-version)
    - [Check for unused packages](#check-for-unused-packages)
    - [Update version information](#update-version-information)
    - [Viewing the configurations in the database](#viewing-the-configurations-in-the-database)
    - [SQL Scripts for Debugging and Maintenance](#sql-scripts-for-debugging-and-maintenance)
      - [Delete Backup Settings](#delete-backup-settings)
      - [Delete Last Backup](#delete-last-backup)
  - [Documentation tools](#documentation-tools)
    - [Update documentation](#update-documentation)
    - [Checking for broken links](#checking-for-broken-links)
  - [Podman Testing](#podman-testing)
    - [Initial Setup and Management](#initial-setup-and-management)
    - [Monitoring and Health Checks](#monitoring-and-health-checks)
    - [Debugging Commands](#debugging-commands)
    - [Usage Workflow](#usage-workflow)
  - [Release Management](#release-management)
    - [Versioning (Semantic Versioning)](#versioning-semantic-versioning)
    - [Merging `devel-MAJOR.MINOR.PATCH` to `master` using command line](#merging-devel-majorminorpatch-to-master-using-command-line)
      - [1. Merge the `devel-MAJOR.MINOR.PATCH` Branch into `master`](#1-merge-the-devel-majorminorpatch-branch-into-master)
      - [2. Tag the New Release](#2-tag-the-new-release)
      - [3. Push to GitHub](#3-push-to-github)
    - [Merging `devel-MAJOR.MINOR.PATCH` to `master` using GitHub](#merging-devel-majorminorpatch-to-master-using-github)
    - [Creating a GitHub Release](#creating-a-github-release)
    - [Manual Docker Image Build](#manual-docker-image-build)
  - [Frameworks, libraries and tools used](#frameworks-libraries-and-tools-used)
  - [Development Guidelines](#development-guidelines)
    - [Code Organisation](#code-organisation)
    - [Testing](#testing)
    - [Debugging](#debugging)
    - [API Development](#api-development)
    - [Database Development](#database-development)
    - [UI Development](#ui-development)
- [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

<br/>

## Prerequisites

- Docker / Docker Compose
- Node.js ^20.x (minimum: 20.19.0, recommended: 20.x)
- pnpm ^10.x (minimum: 10.18.0, recommended: 10.18.0+)
- SQLite3
- ImageMagick (for SVG conversion scripts)
- doctoc for markdown table of contents generation
- markdown-link-check 

<br/>

## Steps

1. Clone the repository:
```bash
git clone https://github.com/wsj-br/duplistatus.git
cd duplistatus
```

2. Install dependencies (Debian/Ubuntu):
```bash
sudo apt update
sudo apt install nodejs npm sqlite3 imagemagick git -y
sudo npm install -g pnpm npm-check-updates doctoc markdown-link-check
pnpm install
```


3. Start the development server:

For the default TCP port (8666):
```bash
pnpm dev
```

<br/>

## Available Scripts

The project includes several npm scripts for different development tasks:

### Development Scripts
- `pnpm dev` - Start development server on port 8666 (includes pre-checks)
- `pnpm build` - Build the application for production (includes pre-checks)
- `pnpm lint` - Run ESLint to check code quality
- `pnpm typecheck` - Run TypeScript type checking

### Production Scripts
- `pnpm start` - Start production server (port 9666)
- `pnpm start-local` - Start production server locally (port 8666, includes pre-checks)
- `pnpm build-local` - Build and prepare for local production (includes pre-checks)

### Docker Scripts
- `pnpm docker-up` - Start Docker Compose stack
- `pnpm docker-down` - Stop Docker Compose stack
- `pnpm docker-clean` - Clean Docker environment and cache

### Cron Service Scripts
- `pnpm cron:start` - Start cron service in production mode
- `pnpm cron:dev` - Start cron service in development mode with file watching (port 8667)
- `pnpm cron:start-local` - Start cron service locally for testing (port 8667)

### Test Scripts
- `pnpm generate-test-data` - Generate test backup data (requires --servers=N parameter)
- `pnpm show-overdue-notifications` - Show overdue notification contents
- `pnpm run-overdue-check` - Run overdue check at specific date/time
- `pnpm test-cron-port` - Test cron service port connectivity

<br/>

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

<br/>

### Build the application for production
```bash
pnpm build
```


### Start the production server (in development environment):
```bash
pnpm start-local
```


### Start a Docker stack (Docker Compose)

```bash
pnpm docker-up
```

Or manually:
```bash
docker compose up --build -d
```

### Stop a Docker stack (Docker Compose)

```bash
pnpm docker-down
```

Or manually:
```bash
docker compose down
```

### Clean Docker environment

```bash
pnpm docker-clean
```

Or manually:
```bash
./scripts/clean-docker.sh
```

This script performs a complete Docker cleanup, which is useful for:
- Freeing up disk space
- Removing old/unused Docker artefacts
- Cleaning up after development or testing sessions
- Maintaining a clean Docker environment

### Create a development image (to test locally or with Podman)

```bash
docker build . -t wsj-br/duplistatus:devel-MAJOR.MINOR.PATCH
```

<br/>

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

The cron service runs on a separate port (8667 in development, 9667 in production) and handles scheduled tasks like overdue backup notifications. The port can be configured using the `CRON_PORT` environment variable.

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


<br/>

## Test Scripts

The project includes several test scripts to help with development and testing:

### Generate Test Data
```bash
pnpm generate-test-data --servers=N
```
This script generates test backup data for multiple servers and backups. 

The `--servers=N` parameter is **mandatory** and specifies the number of servers to generate (1-30).

Use the option `--upload` to send the generated data to the `/api/upload`

```bash
pnpm generate-test-data --servers=N --upload
```

**Examples:**
```bash
# Generate data for 5 servers
pnpm generate-test-data --servers=5

# Generate data for 1 server with upload mode
pnpm generate-test-data --upload --servers=1

# Generate data for all 30 servers
pnpm generate-test-data --servers=30
```

>[!CAUTION]
> This script delete all the previous data in the database and replace it with the test data.
> Backup your database before running this script.

<br/>


### Show the overdue notifications contents (to debug notification system)
```bash
pnpm show-overdue-notifications
```

<br/>

### Run overdue-check at a specific date/time (to debug notification system)

```bash
pnpm run-overdue-check "YYYY-MM-DD HH:MM:SS"
``` 

<br/>

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


<br/>

## Workspace admin scripts & commands

### Clean Database
```bash
./scripts/clean-db.sh
```
Cleans the database by removing all data while preserving the database schema and structure.

>[!CAUTION]
> Use with caution as this will delete all existing data.

<br/>


### Clean build artefacts and dependencies

```bash
scripts/clean-workspace.sh
```
Removes all build artefacts, node_modules directory, and other generated files to ensure a clean state. This is useful when you need to perform a fresh installation or resolve dependency issues. The command will delete:
- `node_modules/` directory
- `.next/` build directory
- `dist/` directory
- All Docker build cache and perform a Docker system prune
- pnpm store cache
- Unused Docker system resources (images, networks, volumes)
- Any other build cache files

<br/>

### Clean Docker Compose and Docker environment

```bash
scripts/clean-docker.sh
```
Perform a complete Docker cleanup, which is useful for:
- Freeing up disk space
- Removing old/unused Docker artefacts
- Cleaning up after development or testing sessions
- Maintaining a clean Docker environment

<br/>

### Generate the logo/favicon and banner from SVG images

```bash
scripts/convert_svg_logo.sh
```


> The SVG files are located in the `docs/img` folder. This script requires ImageMagick to be installed on your system.

<br/>

### Update the packages to the latest version

```bash
ncu --upgrade
pnpm update
```

### Check for unused packages

```bash
pnpm depcheck
```

<br/>

### Update version information

```bash
./scripts/update-version.sh
```

This script automatically updates the `.env` file with the current version from `package.json`. It:
- Extracts the version from `package.json`
- Creates or updates the `.env` file with the `VERSION` variable
- Only updates if the version has changed
- Provides feedback on the operation

<br/>


### Viewing the configurations in the database

```bash
sqlite3 data/backups.db "SELECT key, value FROM configurations;" | awk -F'|' '
  {print "\n" $1 ": "; 
   if(index($2,"{")>0) {print $2 |"jq -C ."; close("jq -C .")} 
   else {print $2;}}' | less -R
```

```bash
sqlite3 /var/lib/docker/volumes/duplistatus_data/_data/backups.db "SELECT key, value FROM configurations;" | awk -F'|' '
  {print "\n" $1 ": "; 
   if(index($2,"{")>0) {print $2 |"jq -C ."; close("jq -C .")} 
   else {print $2;}}' | less -R
```

<br/>

### SQL Scripts for Debugging and Maintenance

The project includes SQL scripts for database maintenance:

<br/>

#### Delete Backup Settings

```bash
sqlite3 data/backups.db < scripts/delete-backup-settings.sql
```
This script removes all backup settings from the configurations table. Use with caution as this will reset all backup notification configurations.

<br/>

#### Delete Last Backup

```bash
sqlite3 data/backups.db < scripts/delete-last-backup.sql
```
This script removes the most recent backup record for each server. By default, it deletes the last backup for ALL servers. The script includes commented examples for targeting specific servers by name. Useful for testing and debugging purposes.

**Note**: The script has been updated to work with the current database schema (uses `servers` table and `server_id` column).

>[!CAUTION]
> These SQL scripts directly modify the database. Always backup your database before running these scripts.

<br/>

## Documentation tools

### Update documentation

```bash
./scripts/update-docs.sh
```

This script updates all documentation files with the current version and regenerates table of contents:
- Updates version badges in all `.md` files to match `package.json`
- Runs `doctoc` to regenerate table of contents
- Provides feedback on updated files
- Requires `doctoc` to be installed globally

<br/>

### Checking for broken links

```bash
markdown-link-check *.md docs/*.md
```

<br/>

## Podman Testing

Copy and execute the scripts located at "scripts/podman_testing" in the Podman test server

### Initial Setup and Management
1. `initialise.duplistatus`: to create the pod
2. `copy.docker.duplistatus`: to copy the Docker image created in the development server to the Podman test server.
   - Create the image using the command `docker build . -t wsj-br/duplistatus:devel-MAJOR.MINOR.PATCH`
3. `start.duplistatus`: to start the container
4. `stop.duplistatus`: to stop the pod and remove the container

### Monitoring and Health Checks
5. `check.duplistatus`: to check the logs, connectivity and application health.

### Debugging Commands
- `logs.duplistatus`: to show the logs of the pod
- `exec.shell.duplistatus`: open a shell in the container
- `restart.duplistatus`: stop the pod, remove the container, copy the image, create the container and start the pod.

### Usage Workflow
1. First run `initialise.duplistatus` to set up the pod
2. Use `copy.docker.duplistatus` to transfer the Docker image
3. Start the container with `start.duplistatus`
4. Monitor with `check.duplistatus` and `logs.duplistatus`
5. Stop with `stop.duplistatus` when done
6. Use `restart.duplistatus` for a complete restart cycle


<br/><br/>

## Release Management

### Versioning (Semantic Versioning)

The project follows Semantic Versioning (SemVer) with the format `MAJOR.MINOR.PATCH`:

- **MAJOR** version (x.0.0): When you make incompatible API changes
- **MINOR** version (0.x.0): When you add functionality in a backward-compatible manner
- **PATCH** version (0.0.x): When you make backward-compatible bug fixes

<br/>


### Merging `devel-MAJOR.MINOR.PATCH` to `master` using command line

To release your new version, you'll need to merge the `devel-MAJOR.MINOR.PATCH` branch into the `master` branch. This process incorporates all the new code from `devel-MAJOR.MINOR.PATCH` into your stable `master` branch, making it ready for a new release.

<br/>

#### 1. Merge the `devel-MAJOR.MINOR.PATCH` Branch into `master`

First, ensure your local `master` branch is up to date with the remote repository. This prevents merge conflicts and ensures you're building on the latest released code.

```bash
# Checkout the master branch
git checkout master

# Pull the latest changes from the remote repository
git pull origin master
```

Next, merge the `devel-MAJOR.MINOR.PATCH` branch into `master`. This will apply all the changes from `devel-MAJOR.MINOR.PATCH` to your `master` branch.

```bash
# Merge the devel-MAJOR.MINOR.PATCH branch into master
git merge devel-MAJOR.MINOR.PATCH
```

Git will attempt to automatically merge the branches. If there are any **merge conflicts**, you'll need to manually resolve them in the affected files. After resolving conflicts, use `git add` to stage the changes and `git commit` to finalize the merge.

<br/>

#### 2. Tag the New Release

Once the `devel-MAJOR.MINOR.PATCH` branch is successfully merged into `master`, you should tag the new version. This creates a permanent reference point in your project's history, making it easy to find and revert to specific releases. Use a **lightweight** or **annotated** tag, with annotated tags being generally preferred for releases as they include more metadata like a message, author, and date.

```bash
# Create an annotated tag for the new version
git tag -a vMAJOR.MINOR.PATCH -m "Release vMAJOR.MINOR.PATCH - New Features and Bug Fixes"
```

The `-a` flag creates an annotated tag, and the `-m` flag lets you add a message describing the release.

<br/>


#### 3. Push to GitHub

Finally, push both the updated `master` branch and the new tag to your remote GitHub repository. This makes the changes and the new release visible to everyone.

```bash
# Push the updated master branch
git push origin master

# Push the new tag
git push origin vMAJOR.MINOR.PATCH
```

You can also push all tags at once using `git push --tags`. After this, the new version will be visible on GitHub, and you can create a new release on the GitHub UI associated with your new tag.

<br/>


### Merging `devel-MAJOR.MINOR.PATCH` to `master` using GitHub 

Instead of a direct merge, you will create a **Pull Request (PR)** from `devel-MAJOR.MINOR.PATCH` to `master`. A pull request is a formal way to propose and review changes before they're merged.

1.  Navigate to [duplistatus repository](https://github.com/wsj-br/duplistatus) on GitHub.
2.  Click the **"Pull requests"** tab.
3.  Click **"New pull request."**
4.  Set the **base branch** to `master` and the **compare branch** to `devel-MAJOR.MINOR.PATCH`.
5.  GitHub will show a preview of all the changes. Review them and ensure there are no conflicts.
6.  Click **"Create pull request."**
7.  Add a title and description, then click **"Create pull request"** again.

After the pull request is created, you will see a green **"Merge pull request"** button if there are no conflicts. Clicking this button will merge all the commits from `devel-MAJOR.MINOR.PATCH` into `master`. 

<br/><br/>



### Creating a GitHub Release

Once the merge is complete, you can create a new release on GitHub, which automatically creates a tag for you.

1.  Navigate to [duplistatus repository](https://github.com/wsj-br/duplistatus) on GitHub.
2.  Go to the **"Releases"** section 
3.  Click **"Draft a new release."**
4.  In the **"Choose a tag"** field, type your new version number in the format `vMAJOR.MINOR.PATCH`, like `v0.8.18`. This will create a new tag.
5.  Select `master` as the target branch.
6.  Add a **release title** and **description** to document the changes in this version.
7.  Click **"Publish release."**

This will automatically:
- Create new Docker images (AMD64 and ARM64 architectures)
- Push the images to Docker Hub 
- Push the images to GitHub Container Registry (ghcr.io/wsj-br/duplistatus:latest)

<br/>

### Manual Docker Image Build

To manually trigger the Docker image build workflow:

1. Navigate to [duplistatus repository](https://github.com/wsj-br/duplistatus) on GitHub.
2. Click on "Actions" tab
3. Select the "Build and Publish Docker Image" workflow
4. Click "Run workflow"
5. Select the branch to build from
6. Click "Run workflow"

<br/><br/>

## Frameworks, libraries and tools used

1. **Runtime & Package Management**
   - Node.js ^20.x (minimum: 20.19.0, recommended: 20.x)
   - pnpm ^10.x (minimum: 10.18.0, enforced via preinstall hook)

2. **Core Frameworks & Libraries**
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

3. **Type Checking & Linting**
   - TypeScript 5.9.3 + tsc (noEmit)
   - TSX 4.20.6 – lightweight runner for TS scripts
   - ESLint 9.37.0 (via `next lint`)

4. **Build & Dev Tools**
   - Web/CSS bundling via Next's built-in toolchain
   - Scripts under `scripts/` (shell & TS) for test data generation, DB reset, SVG conversion, workspace cleanup, etc.
   - Custom server implementation (`duplistatus-server.ts`)

5. **Containerization & Deployment**
   - Docker (node:alpine base)
   - Docker Compose (`docker-compose.yml`)
   - Alpine build tooling (`apk add` curl, python3, make, g++, …) for compiling better-sqlite3
   - cURL (health checks)
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
   - Email notifications via SMTP (nodemailer)
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
    - Display menu component for UI customisation
    - Theme toggle (light/dark mode)
    - Server connection management and testing
    - Metrics charts panel with interactive visualisations
    - Server cards with comprehensive backup information
    - Auto-refresh functionality for real-time updates
    - Progress indicators and loading states
    - Responsive design for mobile and desktop

12. **API Documentation**
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

13. **Database & Data Management**
    - Database schema and key queries documented in `DATABASE.md`
    - SQLite with better-sqlite3 for data persistence
    - Database migrations system (`src/lib/db-migrations.ts`)
    - Utility functions for database operations (`src/lib/db-utils.ts`)
    - Type-safe database operations with TypeScript interfaces
    - Backup data collection and processing
    - Server and backup relationship management
    - CSRF protection with session management

14. **Development & Debugging Tools**
    - TypeScript strict mode enabled
    - ESLint configuration for code quality
    - Development mode features (JSON file storage, verbose logging)
    - Test data generation scripts
    - Database cleanup utilities
    - Workspace management scripts

<br/><br/>

## Development Guidelines

### Code Organisation
- **Components**: Located in `src/components/` with subdirectories for specific features
  - `ui/` - shadcn/ui components and reusable UI elements
  - `dashboard/` - Dashboard-specific components (server cards, tables, summary cards)
  - `settings/` - Settings page components (forms, configuration panels)
  - `server-details/` - Server detail page components (backup tables, charts, summaries)
- **API Routes**: Located in `src/app/api/` with RESTful endpoint structure
  - Core operations: upload, servers, backups, summary, dashboard
  - Configuration: notifications, server connections, backup settings, unified config
  - Chart data: server-specific and aggregated data
  - Cron service: task management and monitoring
  - Health and environment endpoints
  - Session management and CSRF protection
- **Database**: SQLite with better-sqlite3, utilities in `src/lib/db-utils.ts`
- **Types**: TypeScript interfaces in `src/lib/types.ts`
- **Configuration**: Default configs in `src/lib/default-config.ts`
- **Cron Service**: Located in `src/cron-service/` with separate service implementation
- **Scripts**: Utility scripts in `scripts/` directory for testing and maintenance
- **Security**: CSRF protection and session management in `src/lib/csrf-middleware.ts`
- **Pre-checks**: Automated pre-checks via `scripts/pre-checks.sh` for key file and version management

### Testing
- Use the provided test scripts for generating data and testing functionality
- Test notification system with the built-in test endpoints (`/api/notifications/test`)
- Verify cron service functionality by checking the health endpoints (`curl http://localhost:8667/health` or `curl http://localhost:8666/api/cron/health`)
- Test the Docker and Podman images using the provided scripts
- Use TypeScript strict mode for compile-time error checking
- Test database operations with the provided utilities
- Use the test data generation script (`pnpm generate-test-data --servers=N`) for comprehensive testing
- Test overdue backup functionality with manual triggers (`pnpm run-overdue-check`)
- Test server connection management and configuration updates
- Verify CSRF protection and session management

### Debugging
- Development mode provides verbose logging and JSON file storage
- Use the browser's developer tools for frontend debugging
- Check the console for detailed error messages and API responses
- Cron service includes health check endpoints for monitoring (`/api/cron/health`)
- Database utilities include debugging and maintenance functions
- Use the database maintenance menu for cleanup and debugging operations
- Test server connections with the built-in connection testing tools
- Monitor notification system with the NTFY messages button
- Use pre-checks script output for troubleshooting startup issues
- Check CSRF token validation and session management

### API Development
- All API endpoints are documented in `API-ENDPOINTS.md`
- Follow the established RESTful patterns for new endpoints
- Maintain consistent error handling and response formats
- Test new endpoints with the provided test scripts
- Use TypeScript interfaces for type safety
- Implement proper validation and error handling
- Follow the established patterns for configuration endpoints
- Ensure proper CORS handling for cross-origin requests
- Implement CSRF protection for state-changing operations
- Use the `withCSRF` middleware for protected endpoints
- Maintain consistent cache control headers for dynamic data

### Database Development
- Use the migration system for schema changes (`src/lib/db-migrations.ts`)
- Follow the established patterns in `src/lib/db-utils.ts`
- Maintain type safety with TypeScript interfaces
- Test database operations with the provided utilities
- Use the database maintenance tools for cleanup and debugging
- Follow the established schema patterns for new tables
- Implement proper indexing for performance
- Use prepared statements for security
- Maintain session and CSRF token tables for security
- Implement proper request caching for performance optimization
- Use transaction management for data consistency

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
- Use context providers for global state management
- Implement proper CSRF token handling in forms
- Use consistent loading indicators and progress states

<br/>

# License
The project is licensed under the [Apache License 2.0](https://github.com/wsj-br/duplistatus/blob/main/LICENSE).   

**Copyright © 2025 Waldemar Scudeller Jr.**
