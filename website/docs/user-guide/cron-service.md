

# Cron Service

**duplistatus** includes a separate cron service that handles periodic background tasks independently from the main Next.js application. This service ensures better reliability and scalability of background operations.

## Features

- **Independent Operation**: Runs as a separate process from the main web application
- **Automatic Overdue Checks**: Monitors for overdue backups at configurable intervals
- **REST API**: Provides endpoints for task management and monitoring
- **Graceful Shutdown**: Handles shutdown signals properly
- **Manual Task Triggering**: Allows manual execution of scheduled tasks

## Configuration

The cron service is automatically configured through the database and runs on port `8667` by default (or `PORT + 1` if `PORT` is set). The service includes the following default tasks:

- **Overdue Backup Check**: Runs every 20 minutes to check for overdue backups and send notifications

### Enhanced Features (Version 0.8.x)

- **Improved Reliability**: Enhanced error handling and automatic retry mechanisms
- **Flexible Scheduling**: Supports configurable intervals from 1 minute to 2 hours
- **Better Integration**: Seamless integration with enhanced overdue monitoring features
- **Secure Communication**: Uses session-based authentication for API endpoints

## Management

You can interact with the cron service through the application's toolbar buttons:

- **Check Overdue Backups**: Manually trigger an overdue backup check
- **Application Logs**: Monitor cron service status and execution logs

## Troubleshooting

If you experience issues with overdue notifications:

1. Verify the cron service is running alongside the main application
2. Check the cron service logs for errors
3. Ensure the cron service port (default: `8667`) is accessible
4. Use the manual "Check Overdue Backups" button to test functionality

<br/><br/>
