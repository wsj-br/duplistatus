# Development instructions

## Prerequisites

- docker / docker compose
- Node.js 18.19.0 or later
- pnpm 10.13.1 or later (install with `npm install -g pnpm`)
- SQLite3
- ImageMagick (for SVG conversion scripts)

## Steps

1. Clone the repository:
```bash
git clone https://github.com/wsj-br/duplistatus.git
cd duplistatus
```

2. Install dependencies (debian/ubuntu):
```bash
sudo apt update
sudo apt install nodejs npm sqlite3 imagemagick -y
sudo npm install -g pnpm npm-check-updates
pnpm install
```


3. Start the development server:

For the default tcp port (8666)
```bash
pnpm run dev
```


<br>

## Development Mode Features

When running in development mode (`pnpm run dev`), the application includes additional features to help with debugging and development:

- **JSON File Storage**: All received backup data is stored as JSON files in the `data` directory. These files are named using the timestamp of when they were received, in the format `YYYY-MM-DDTHH-mm-ss-sssZ.json` (UTC time). This feature is only active in development mode and helps with debugging by preserving the raw data received from Duplicati.

-  **Verbose Logging**: The application logs more detailed information about database operations and API requests when running in development mode.

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


The Docker image supports multiple architectures (AMD64 and ARM64) and will automatically use the appropriate version for your system.

<br><br>

## Test Scripts

The project includes several test scripts to help with development and testing:

### Generate Test Data
```bash
pnpm run generate-test-data
```
This script generates and uploads test backup data for multiple machines. 

<br>


### Clean Database
```bash
pnpm run clean-db
```
Clears all data from the database and recreates the schema. Use with caution as this will delete all existing data.

<br>

### Show the overdue notifications contents (to debug notification system)
```bash
pnpm show-overdue-notifications
```


### Run overdue-check at a specific date/time (to debug notification system)

```bash
pnpm run-overdue-check "YYYY-MM-DD HH:MM:SS"
``` 


### Test CRON_PORT functionality
```bash
pnpm test-cron-port
```
Tests the CRON_PORT environment variable handling and configuration.

<br>

### Cron Service

The application includes a separate cron service for handling scheduled tasks:

#### Start cron service in development mode:
```bash
pnpm cron:dev
```

#### Start cron service in production mode:
```bash
pnpm cron:start
```

The cron service runs on a separate port (8667 in development, 9667 in production) and handles scheduled tasks like overdue backup notifications.

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


> The svg files are located in the `docs` folder. This script requires ImageMagick to be installed on your system.

<br>

### Update the packages to the last version

```bash
ncu --upgrade
pnpm update
```


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

### Manual Docker Image Build

To manually trigger the Docker image build workflow:

1. Go to the GitHub repository
2. Click on "Actions" tab
3. Select the "Build and Push Docker Image" workflow
4. Click "Run workflow"
5. Select the branch to build from
6. Click "Run workflow"

## Additional Scripts

### Clean up Docker Environment
```bash
scripts/clean-docker.sh
```
This script cleans up Docker resources:
- Removes all Docker builder cache
- Prunes unused Docker system resources (images, networks, volumes)
- Useful when you need to free up disk space or resolve Docker-related issues

## Frameworks, libraries and tools used

1. **Runtime & Package Management**
   - Node.js (>= 18.19.0)
   - pnpm (v10.13.1)

2. **Core Frameworks & Libraries**
   - Next.js (^15.4.4) – React-based SSR/SSG framework
   - React (^19.1.0)
   - Radix UI (@radix-ui/react-*) – headless component primitives
   - Tailwind CSS (^4.1.11) + tailwindcss-animate plugin
   - PostCSS (postcss.config.mjs)
   - Better-sqlite3 (^12.2.0) + SQLite3 (data store)
   - Recharts (^3.1.0) – charting library
   - react-day-picker (^9.8.1) – date picker
   - react-hook-form (^7.61.1) – forms
   - lucide-react (^0.526.0) – icon components
   - clsx (^2.1.1) – utility for conditional classNames
   - class-variance-authority (^0.7.1) – variant styling helper
   - date-fns (^4.1.0) – date utilities
   - uuid (^11.1.0) – unique IDs
   - server-only – Next helper for server-only modules
   - express (^5.1.0) – web framework for cron service
   - node-cron (^4.2.1) – cron job scheduling
   - string-template (^1.0.0) – string templating
   - tailwind-merge (^3.3.1) – Tailwind class merging utility

3. **Type Checking & Linting**
   - TypeScript (^5.8.3) + tsc (noEmit)
   - TSX (^4.20.3) – lightweight runner for TS scripts
   - ESLint (via `next lint`)

4. **Build & Dev Tools**
   - Turbopack (Next dev server)
   - Web/CSS bundling via Next's built-in toolchain
   - Scripts under `scripts/` (shell & TS) for test data generation, DB reset, SVG conversion, workspace cleanup, etc.

5. **Containerization & Deployment**
   - Docker (node:lts-alpine base)
   - Docker Compose (`docker-compose.yml`)
   - Alpine build tooling (`apk add` curl, python3, make, g++, …) for compiling better-sqlite3
   - cURL (healthchecks)
   - GitHub Actions workflows (docker/setup-*, buildx, metadata-action, build-push-action)
   - Docker Hub & GitHub Container Registry

6. **Project Configuration & Monorepo Support**
   - `tsconfig.json` & `scripts/tsconfig.json`
   - `next.config.ts`
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
   - Runs on separate port (8667 dev, 9667 prod)
   - Handles overdue backup notifications and other scheduled tasks
   - Uses `keep-cron-alive.sh` script for process management

9. **Notification System**
   - ntfy.sh integration for push notifications
   - Configurable notification templates with variable substitution
   - Overdue backup monitoring and alerting
   - Test notification functionality
   - Flexible notification scheduling (one time/daily/weekly/monthly)

10. **Auto-refresh System**
    - Configurable automatic refresh of dashboard and detail pages
    - Manual refresh controls with visual feedback
    - Progress indicators and loading states
    - Persistent refresh preferences
    - Page-specific refresh behavior

11. **Enhanced UI Features**
    - Sortable tables with persistent preferences
    - Enhanced backup version display with icons
    - Click-to-view available versions functionality
    - Improved navigation with return links
    - Status badges that link to backup details

12. **Other tools**
    - ["Easy Screenshot"](https://webextension.org/listing/screenshot.html) extension 

## Current Development Status

The project is currently in active development with the following major features implemented:

### ✅ Completed Features (v0.5.19+)
- **Notification System**: Complete ntfy.sh integration with customizable templates
- **Overdue Backup Monitoring**: Automated checking and alerting for overdue backups
- **Auto-refresh System**: Configurable automatic refresh of dashboard and detail pages
- **Enhanced UI**: Sortable tables, improved navigation, and better backup version display
- **Cron Service**: Separate service for handling scheduled tasks
- **API Enhancements**: New endpoints for notification management and cron configuration

### 🚧 In Progress Features
- **Table Sorting**: Client-side persistence of sort preferences
- **Enhanced Backup Version Visibility**: Version icons and click-to-view functionality
- **UI/Navigation Improvements**: Return links and status badge navigation

### 📋 Planned Features
- **HTTPS Support**: Documentation for serving with HTTPS (nginx/certbot or Caddy)
- **Additional Integrations**: Enhanced third-party tool support

## Development Guidelines

### Code Organization
- **Components**: Located in `src/components/` with subdirectories for specific features
- **API Routes**: Located in `src/app/api/` with RESTful endpoint structure
- **Database**: SQLite with better-sqlite3, utilities in `src/lib/db-utils.ts`
- **Types**: TypeScript interfaces in `src/lib/types.ts`
- **Configuration**: Default configs in `src/lib/default-config.ts`

### Testing
- Use the provided test scripts for generating data and testing functionality
- Test notification system with the built-in test endpoints
- Verify cron service functionality with the test scripts

### Debugging
- Development mode provides verbose logging and JSON file storage
- Use the browser's developer tools for frontend debugging
- Check the console for detailed error messages and API responses

