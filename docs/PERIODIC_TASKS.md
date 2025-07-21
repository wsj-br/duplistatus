# Periodic Tasks System

This document describes the periodic task system implemented in the duplistatus application.

## Overview

The periodic task system automatically runs background tasks at specified intervals using the `node-cron` library. Currently, it includes a missed backup check that runs every 20 minutes.

## Architecture

### Core Components

1. **PeriodicTaskManager** (`src/lib/periodic-tasks.ts`)
   - Singleton class that manages all periodic tasks
   - Handles task scheduling, execution, and monitoring using node-cron
   - Automatically initializes when the application starts
   - Uses direct function calls for better performance
   - Supports standard cron expressions for flexible scheduling

2. **MissedBackupChecker** (`src/lib/missed-backup-checker.ts`)
   - Core logic for checking missed backups
   - Can be called directly or via HTTP endpoint
   - Reusable function for both periodic and manual execution

3. **Server-Side Initialization**
   - Automatically initializes when imported in Node.js environment
   - Compatible with Edge Runtime (no Node.js dependencies in middleware)
   - Can be manually initialized via `/api/periodic-tasks/init` endpoint

### Current Tasks

#### Missed Backup Check
- **Schedule**: Every 20 minutes (cron: `0,20,40 * * * *`)
- **Function**: `checkMissedBackups()` from `@/lib/missed-backup-checker`
- **Purpose**: Checks for missed backups and sends notifications
- **Configuration**: Uses existing notification settings
- **Performance**: Direct function calls (no HTTP overhead)

## API Endpoints

### Get Task Status
```
GET /api/periodic-tasks/status
```
Returns the current status of all periodic tasks.

**Response:**
```json
{
  "message": "Periodic tasks status retrieved successfully",
  "tasks": [
    {
      "taskName": "missed-backup-check",
      "isRunning": true
    }
  ],
  "timestamp": "2025-07-21T00:44:54.106Z"
}
```

### Manual Trigger
To manually trigger the missed backup check, use the existing endpoint:
```
POST /api/notifications/check-missed
```
This endpoint performs the same function as the periodic task and can be used for manual execution.

### Initialize Periodic Tasks
To manually initialize the periodic task manager (if auto-initialization fails):
```
POST /api/periodic-tasks/init
```
This endpoint manually initializes the periodic task manager and starts all configured tasks.

## Configuration

The periodic task system uses the following environment variables:

- `NEXT_PUBLIC_BASE_URL`: Base URL for the application (defaults to `http://localhost:9666`)

## Logging

The system provides comprehensive logging:

- Task initialization
- Task execution with timestamps
- Success/failure status
- Error details

Example log output:
```
Initializing PeriodicTaskManager with node-cron...
Starting periodic task: missed-backup-check (cron: 0,20,40 * * * *)
[2025-07-21T00:44:54.106Z] Executing periodic task: missed-backup-check
[2025-07-21T00:44:54.218Z] Task missed-backup-check completed successfully: {...}
```

## Adding New Tasks

To add a new periodic task:

1. Create a function in a utility file (e.g., `src/lib/new-task.ts`)
2. Add a new method to the `PeriodicTaskManager` class
3. Configure the task with appropriate cron expression and function
4. Call the new method from the `initialize()` method

Example:
```typescript
// src/lib/new-task.ts
export async function performNewTask() {
  // Task logic here
  return { message: 'Task completed' };
}

// In PeriodicTaskManager
private startNewTask(): void {
  const config: PeriodicTaskConfig = {
    cronExpression: '0 * * * *', // Run every hour at minute 0
    taskName: 'new-task',
    taskFunction: performNewTask
  };

  this.startTask(config);
}
```

### Cron Expression Format

The system uses standard cron expressions with the following format:
```
* * * * *
│ │ │ │ │
│ │ │ │ └── Day of week (0-7, where 0 and 7 are Sunday)
│ │ │ └──── Month (1-12)
│ │ └────── Day of month (1-31)
│ └──────── Hour (0-23)
└────────── Minute (0-59)
```

Common examples:
- `0,20,40 * * * *` - Every 20 minutes
- `0 * * * *` - Every hour at minute 0
- `0 0 * * *` - Every day at midnight
- `0 0 * * 0` - Every Sunday at midnight
- `0 0 1 * *` - First day of every month at midnight

## Troubleshooting

### Task Not Running
- Check that the middleware is properly importing the periodic task manager
- Verify the application is running in a server environment (not client-side)
- Check logs for initialization messages
- Validate cron expressions using `cron.validate(expression)`

### API Endpoint Errors
- Ensure the target API endpoint exists and is accessible
- Check network connectivity if using external URLs
- Verify the endpoint returns proper HTTP status codes

### Memory Leaks
- The system uses node-cron which properly manages task lifecycle
- Monitor memory usage in long-running deployments
- Consider implementing graceful shutdown handlers if needed

## Security Considerations

- The system makes internal HTTP requests to the application's own API endpoints
- No external authentication is required for internal requests
- Manual trigger endpoints should be protected if exposed publicly
- Consider rate limiting for manual trigger endpoints in production 