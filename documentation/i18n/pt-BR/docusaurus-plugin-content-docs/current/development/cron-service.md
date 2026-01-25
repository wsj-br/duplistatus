# Cron Service

The application includes a separate cron service for handling scheduled tasks:

## Start cron service in development mode

```bash
pnpm cron:dev
```

## Start cron service in production mode

```bash
pnpm cron:start
```

## Start cron service locally (for testing)

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
- **Overdue backup monitoring**: Automated checking and notification of overdue backups (runs every 5 minutes by default)
- **Audit log cleanup**: Automated cleanup of old audit log entries (runs daily at 2 AM UTC)
- **Flexible scheduling**: Configurable cron expressions for different tasks
- **Database integration**: Shares the same SQLite database with the main application
- **RESTful API**: Complete API for service management and monitoring
