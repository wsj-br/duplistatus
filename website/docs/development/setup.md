

# Development Setup

## Prerequisites

- Docker / Docker Compose
- Node.js ^20.x (minimum: 20.19.0, recommended: 20.x)
- pnpm ^10.x (minimum: 10.20.0, recommended: 10.20.0+)
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
sudo apt install nodejs npm sqlite3 imagemagick git -y
sudo npm install -g pnpm npm-check-updates doctoc markdown-link-check
pnpm install
```

3. Start the development server:

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
