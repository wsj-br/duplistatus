# Development instructions

## Prerequisites

- docker / docker compose
- Node.js 18.19.0 or later
- pnpm 10.12.4 or later (install with `npm install -g pnpm`)
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

For the default tcp port (9666)
```bash
pnpm run dev
```

For an alternative TCP port (8666)
```bash
pnpm run dev-alt
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

### Test Last Backup Endpoint
```bash
pnpm run test-lastbackup [machineName]
```
Tests the `/api/lastbackup` endpoint. If no machine name is provided, it defaults to "Test Machine 1".

<br>

### Clean Database
```bash
pnpm run clean-db
```
Clears all data from the database and recreates the schema. Use with caution as this will delete all existing data.

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
- Docker system resources (images, networks, volumes)
- Any other build cache files

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
   - pnpm (v10.12.4)

2. **Core Frameworks & Libraries**
   - Next.js (^15.3.4) – React-based SSR/SSG framework (uses Turbopack in dev)
   - React (^19.1.0)
   - Radix UI (@radix-ui/react-*) – headless component primitives
   - Tailwind CSS (^4.1.11) + tailwindcss-animate plugin
   - PostCSS (postcss.config.mjs)
   - Better-sqlite3 (^12.2.0) + SQLite3 (data store)
   - Recharts (^3.0.2) – charting library
   - react-day-picker (^9.7.0) – date picker
   - react-hook-form (^7.59.0) – forms
   - lucide-react (^0.525.0) – icon components
   - clsx (^2.1.1) – utility for conditional classNames
   - class-variance-authority (^0.7.1) – variant styling helper
   - date-fns (^4.1.0) – date utilities
   - uuid (^11.1.0) – unique IDs
   - server-only – Next helper for server-only modules

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

7. **Version Control & Release**
   - Git (preinstall hook enforces pnpm)
   - Semantic-versioning scripts (`release:patch`, `release:minor`, `release:major`)
   - GitHub Releases (via Actions on `release` events)

8. **Other tools**
   - ["Easy Screenshot"](https://webextension.org/listing/screenshot.html) extension 
