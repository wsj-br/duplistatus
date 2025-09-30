---
sidebar_position: 2
---

# Development Scripts

![duplistatus](//img/duplistatus_banner.png)

Available scripts and commands for development and maintenance.

## Development Scripts

### `pnpm dev`
Start the development server with hot reloading.

```bash
pnpm dev
```

- Starts web server on port 8666
- Starts cron service on port 8667
- Enables hot reloading
- Shows detailed error messages

### `pnpm build`
Build the application for production.

```bash
pnpm build
```

- Optimizes code for production
- Generates static assets
- Creates production bundle
- Validates TypeScript types

### `pnpm start`
Start the production server.

```bash
pnpm start
```

- Starts optimized production server
- Uses production configuration
- Enables performance optimizations

## Docker Scripts

### `pnpm docker:dev`
Start development environment with Docker.

```bash
pnpm docker:dev
```

- Builds development images
- Starts all services
- Enables volume mounting for development
- Shows logs from all containers

### `pnpm docker:stop`
Stop all Docker containers.

```bash
pnpm docker:stop
```

- Stops all running containers
- Preserves volumes and data
- Can be restarted with `pnpm docker:dev`

### `pnpm docker:clean`
Clean Docker environment.

```bash
pnpm docker:clean
```

- Stops and removes containers
- Removes unused images
- Cleans up volumes
- Frees disk space

## Database Scripts

### `pnpm db:init`
Initialize the database.

```bash
pnpm db:init
```

- Creates database file
- Runs initial migrations
- Sets up basic schema

### `pnpm db:migrate`
Run database migrations.

```bash
pnpm db:migrate
```

- Applies pending migrations
- Updates database schema
- Preserves existing data

### `pnpm db:seed`
Seed database with test data.

```bash
pnpm db:seed
```

- Adds sample servers
- Creates test backup data
- Useful for development and testing

## Testing Scripts

### `pnpm test`
Run all tests.

```bash
pnpm test
```

- Runs unit tests
- Runs integration tests
- Generates coverage report
- Validates code quality

### `pnpm test:watch`
Run tests in watch mode.

```bash
pnpm test:watch
```

- Watches for file changes
- Re-runs tests automatically
- Useful during development

### `pnpm test:coverage`
Run tests with coverage report.

```bash
pnpm test:coverage
```

- Generates detailed coverage report
- Shows uncovered code
- Helps identify testing gaps

## Code Quality Scripts

### `pnpm lint`
Run ESLint.

```bash
pnpm lint
```

- Checks code style
- Identifies potential issues
- Enforces coding standards

### `pnpm lint:fix`
Fix linting issues automatically.

```bash
pnpm lint:fix
```

- Automatically fixes fixable issues
- Formats code consistently
- Improves code quality

### `pnpm typecheck`
Run TypeScript type checking.

```bash
pnpm typecheck
```

- Validates TypeScript types
- Checks for type errors
- Ensures type safety

## Utility Scripts

### `pnpm generate:test-data`
Generate test data for development.

```bash
pnpm generate:test-data
```

- Creates sample backup data
- Generates realistic test scenarios
- Useful for testing and development

### `pnpm show:overdue`
Show overdue notification contents.

```bash
pnpm show:overdue
```

- Displays overdue backup information
- Shows notification details
- Useful for debugging notifications

### `pnpm test:cron`
Test cron service connectivity.

```bash
pnpm test:cron
```

- Tests cron service connection
- Validates cron configuration
- Checks service health

## Maintenance Scripts

### `pnpm clean:db`
Clean database.

```bash
pnpm clean:db
```

- Removes old backup data
- Cleans up unused records
- Optimizes database performance

### `pnpm clean:build`
Clean build artifacts.

```bash
pnpm clean:build
```

- Removes build directories
- Cleans cache files
- Frees disk space

### `pnpm update:packages`
Update packages to latest versions.

```bash
pnpm update:packages
```

- Updates all dependencies
- Checks for security updates
- Maintains package compatibility

## Workspace Scripts

### `pnpm workspace:admin`
Run workspace administration commands.

```bash
pnpm workspace:admin
```

- Provides interactive menu
- Access to all admin functions
- Simplified command interface

### `pnpm workspace:status`
Show workspace status.

```bash
pnpm workspace:status
```

- Displays system information
- Shows service status
- Provides health check

## Environment Scripts

### `pnpm env:check`
Check environment configuration.

```bash
pnpm env:check
```

- Validates environment variables
- Checks configuration files
- Identifies missing settings

### `pnpm env:setup`
Setup development environment.

```bash
pnpm env:setup
```

- Creates necessary directories
- Sets up configuration files
- Initializes development environment

## Documentation Scripts

### `pnpm docs:build`
Build documentation.

```bash
pnpm docs:build
```

- Generates documentation site
- Validates documentation links
- Creates static documentation

### `pnpm docs:serve`
Serve documentation locally.

```bash
pnpm docs:serve
```

- Starts documentation server
- Enables live preview
- Useful for documentation development

## Best Practices

### Development Workflow
1. Use `pnpm dev` for development
2. Run `pnpm test` before committing
3. Use `pnpm lint:fix` to maintain code quality
4. Use `pnpm build` to test production builds

### Testing Workflow
1. Write tests for new features
2. Run `pnpm test:watch` during development
3. Use `pnpm test:coverage` to check coverage
4. Ensure all tests pass before merging

### Maintenance Workflow
1. Run `pnpm update:packages` regularly
2. Use `pnpm clean:build` to free space
3. Use `pnpm clean:db` to optimize database
4. Monitor system with `pnpm workspace:status`

## Troubleshooting

### Common Issues
- **Script not found**: Ensure you're in the project root
- **Permission errors**: Check file permissions
- **Port conflicts**: Change ports in configuration
- **Docker issues**: Use `pnpm docker:clean`

### Getting Help
- Check script documentation
- Review error messages
- Consult troubleshooting guides
- Ask for help in community forums
