# Development Setup

![duplistatus](../img/duplistatus_banner.png)

This guide covers setting up a development environment for duplistatus.

## Prerequisites

- Node.js 20.x or higher
- pnpm package manager
- Docker and Docker Compose
- Git

## Quick Start

1. **Clone the repository**:
   ```bash
   git clone https://github.com/wsj-br/duplistatus.git
   cd duplistatus
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Start development environment**:
   ```bash
   pnpm dev
   ```

4. **Access the application**:
   - Web interface: http://localhost:8666
   - Cron service: http://localhost:8667

## Development Scripts

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run linting
- `pnpm test` - Run tests

### Docker Development

```bash
# Start development stack
pnpm docker:dev

# Stop development stack
pnpm docker:stop

# Clean Docker environment
pnpm docker:clean
```

## Project Structure

```
duplistatus/
├── src/                    # Source code
│   ├── app/               # Next.js app directory
│   ├── components/        # React components
│   ├── lib/              # Utility libraries
│   └── types/            # TypeScript types
├── docs/                 # Documentation
├── docker/               # Docker configurations
├── scripts/              # Build and utility scripts
└── package.json          # Dependencies and scripts
```

## Environment Variables

Create a `.env.local` file:

```env
# Development settings
NODE_ENV=development
PORT=8666
CRON_PORT=8667

# Database
DATABASE_URL=./data/backups.db

# Logging
LOG_LEVEL=debug
```

## Database Setup

The application uses SQLite for development:

```bash
# Initialize database
pnpm db:init

# Run migrations
pnpm db:migrate

# Seed test data
pnpm db:seed
```

## Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

## Code Quality

```bash
# Run linting
pnpm lint

# Fix linting issues
pnpm lint:fix

# Type checking
pnpm typecheck
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run linting and tests
6. Submit a pull request

## Troubleshooting

### Common Issues

- **Port conflicts**: Change ports in `.env.local`
- **Database issues**: Delete `data/backups.db` and restart
- **Docker issues**: Run `pnpm docker:clean` and restart

### Getting Help

- Check the [troubleshooting guide](../user-guide/troubleshooting.md)
- Open an issue on GitHub
- Join the community discussions
