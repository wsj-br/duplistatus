# Development Setup

## Prerequisites

- Docker / Docker Compose
- Node.js >=24.12.0
- pnpm >=10.24.0
- SQLite3

## Steps

1. Clone the repository:

```bash
git clone https://github.com/wsj-br/duplistatus.git
cd duplistatus
```

2. Install dependencies (Debian/Ubuntu):

```bash
sudo apt update
sudo apt install sqlite3 git -y
```

3. Remove old Node.js installations (if you already had it installed)

```bash
sudo apt-get purge nodejs npm -y
sudo apt-get autoremove -y
sudo rm -rf /usr/local/bin/npm 
sudo rm -rf /usr/local/share/man/man1/node* 
sudo rm -rf /usr/local/lib/dtrace/node.d
rm -rf ~/.npm
rm -rf ~/.node-gyp
sudo rm -rf /opt/local/bin/node
sudo rm -rf /opt/local/include/node
sudo rm -rf /opt/local/lib/node_modules
sudo rm -rf /usr/local/lib/node*
sudo rm -rf /usr/local/include/node*
sudo rm -rf /usr/local/bin/node*
```

4. Install Node.js and pnpm:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc
nvm install --lts
nvm use --lts
npm install -g pnpm npm-check-updates doctoc
```

5. Start the development server:

For the default TCP port (8666):

```bash
pnpm dev
```

## Available Scripts

The project includes several npm scripts for different development tasks:

### Development Scripts

- `pnpm dev` - Start development server on port 8666 (includes pre-checks)
- `pnpm build` - Build the application for production (includes pre-checks)
- `pnpm lint` - Run ESLint to check code quality
- `pnpm typecheck` - Run TypeScript type checking
- `scripts/upgrade-dependencies.sh` - Upgrade all packages to the latest version, check for vulnerabilities, and automatically fix them
- `scripts/clean-workspace.sh` - Clean the workspace

**Note:** The `preinstall` script automatically enforces pnpm as the package manager.

### Production Scripts

- `pnpm build-local` - Build and prepare for local production (includes pre-checks, copies static files to standalone directory)
- `pnpm start-local` - Start production server locally (port 8666, includes pre-checks). **Note:** Run `pnpm build-local` first.
- `pnpm start` - Start production server (port 9666)

### Docker Scripts

- `pnpm docker-up` - Start Docker Compose stack
- `pnpm docker-down` - Stop Docker Compose stack
- `pnpm docker-clean` - Clean Docker environment and cache
- `pnpm docker-devel` - Build a development Docker image tagged as `wsj-br/duplistatus:devel`

### Cron Service Scripts

- `pnpm cron:start` - Start cron service in production mode
- `pnpm cron:dev` - Start cron service in development mode with file watching (port 8667)
- `pnpm cron:start-local` - Start cron service locally for testing (port 8667)

### Test Scripts

- `pnpm generate-test-data` - Generate test backup data (requires --servers=N parameter)
- `pnpm show-overdue-notifications` - Show overdue notification contents
- `pnpm run-overdue-check` - Run overdue check at specific date/time
- `pnpm test-cron-port` - Test cron service port connectivity
- `pnpm test-overdue-detection` - Test overdue backup detection logic
- `pnpm validate-csv-export` - Validate CSV export functionality
- `pnpm set-smtp-test-config` - Set SMTP test configuration from environment variables (see [Test Scripts](test-scripts))
- `pnpm test-smtp-connections` - Test SMTP connection type cross-compatibility (see [Test Scripts](test-scripts))
- `pnpm test-entrypoint` - Test Docker entrypoint script in local development (see [Test Scripts](test-scripts))
- `pnpm take-screenshots` - Take screenshots for documentation (see [Documentation Tools](documentation-tools))
