# Cron Service

This is an external service that handles periodic tasks for the DupliStatus application. It runs as a separate process to ensure better reliability and scalability of background tasks.

## Features

- Runs periodic tasks independently from the main Next.js application
- Provides REST API for task management
- Configurable through database settings
- Graceful shutdown handling
- Task status monitoring
- Manual task triggering

## Running the Service

### Development

```bash
# Start in development mode with auto-reload
pnpm cron:dev
```

### Production

```bash
# Start in production mode
pnpm cron:start
```

## Configuration

The service can be configured through the database using the `cron_service` configuration key. The configuration schema is:

```typescript
interface CronServiceConfig {
  port: number;
  tasks: {
    [taskName: string]: {
      cronExpression: string;
      enabled: boolean;
    };
  };
}
```

Default configuration:
- Port: 9667
- Tasks:
  - missed-backup-check: Runs every 20 minutes (0,20,40 * * * *)

## API Endpoints

### GET /health
Get the current status of the cron service.

### POST /trigger/:taskName
Manually trigger a specific task.

### POST /stop/:taskName
Stop a running task.

### POST /start/:taskName
Start a stopped task.

## Environment Variables

- `CRON_SERVICE_URL`: Base URL of the cron service (default: http://localhost:9667)
- `CRON_PORT`: Port for the cron service (if not set, uses PORT + 1, or defaults to 9667)
- `PORT`: Base port for the main application (used to calculate CRON_PORT if CRON_PORT is not set)

## Client Usage

The main application can interact with the cron service using the provided client:

```typescript
import { cronClient } from '@/lib/cron-client';

// Get service status
const status = await cronClient.getStatus();

// Trigger a task manually
await cronClient.triggerTask('missed-backup-check');

// Stop a task
await cronClient.stopTask('missed-backup-check');

// Start a task
await cronClient.startTask('missed-backup-check');
```

## Architecture

The cron service is designed to:
1. Run independently from the main Next.js application
2. Share the same database for configuration and data
3. Provide a REST API for monitoring and control
4. Handle graceful shutdowns
5. Support dynamic task configuration

## Adding New Tasks

1. Add the task function to the appropriate module
2. Update the task execution logic in `service.ts`
3. Add the task configuration to the database
4. Update types if necessary

## Benefits Over Previous Implementation

1. **Reliability**: Tasks run independently from the web server
2. **Scalability**: Can be scaled separately from the main application
3. **Monitoring**: Better visibility into task execution
4. **Control**: Tasks can be started/stopped/triggered manually
5. **Configuration**: Dynamic configuration through database 