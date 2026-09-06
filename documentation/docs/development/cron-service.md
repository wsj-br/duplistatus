

# Cron Service {#cron-service}

The application includes a separate cron service for handling scheduled tasks:

## Start cron service in development mode {#start-cron-service-in-development-mode}

`pnpm dev` already starts the cron service alongside Next.js. To run cron alone (for example in a second terminal):

```bash
pnpm cron:dev
```

## Start cron service in production mode {#start-cron-service-in-production-mode}

```bash
pnpm cron:start
```

## Start cron service locally (for testing) {#start-cron-service-locally-for-testing}

```bash
pnpm cron:start-local
```

The cron service runs on a separate port (8667 in development, 9667 in production) and handles scheduled tasks like overdue backup notifications. The port can be configured using the `CRON_PORT` environment variable.

The cron service includes:
- **Health check endpoint**: `/health` - Returns service status and active tasks
- **Manual task triggering**: `POST /trigger/:taskName` - Manually execute scheduled tasks. The `daily-summary-dispatch` task is rejected on this route; use Settings → Daily Summary **Send summary now** instead
- **Task management**: `POST /start/:taskName` and `POST /stop/:taskName` - Control individual tasks
- **Configuration reload**: `POST /reload-config` - Reload configuration from database
- **Automatic restart**: The service automatically restarts if it crashes (managed by `docker-entrypoint.sh` in Docker deployments)
- **Watch mode**: Development mode includes file watching for automatic restarts on code changes
- **Overdue backup monitoring**: Automated checking and notification of overdue backups (runs every 5 minutes by default)
- **Daily summary dispatch**: Evaluates the saved Daily Summary schedule every minute in UTC and sends the current-status snapshot when due
- **Audit log cleanup**: Automated cleanup of old audit log entries (runs daily at 2 AM UTC)
- **Duplicati version refresh**: Updates cached latest Duplicati channel versions from GitHub Releases. The default is daily at 3 AM UTC; administrators can change the interval and start time in [Settings → Duplicati Versions](../user-guide/settings/duplicati-versions.md).
- **Flexible scheduling**: Configurable cron expressions for different tasks
- **Database integration**: Shares the same SQLite database with the main application
- **RESTful API**: Complete API for service management and monitoring
- **Local bind**: Listens on `127.0.0.1` by default (`CRON_BIND_HOST`). Non-loopback binds require `CRON_SERVICE_SECRET`
