

# Overdue Settings


**Per-Backup Settings:**

- **Expected Backup Interval**: Custom interval format (e.g., "1D", "1W", "2M", "1D12h30m")
- **Notification Channels**: Separate toggles for NTFY and email notifications
- **Overdue Monitoring**: Enable/disable overdue checks per backup
- **Reset Function**: Reset overdue notification timers individually

**Global Settings:**

- **Overdue Tolerance**: Grace period before marking backups as overdue (5 minutes to 1 day)
- **Notification Frequency**: How often to send overdue notifications (one time, daily, weekly, monthly)
- **Monitoring Interval**: How frequently to check for overdue backups (1 to 2 hours)

## Automatic Configuration

When you collect backup logs from a Duplicati server, **duplistatus** automatically:

- Extracts the backup schedule from the Duplicati configuration
- Updates the overdue monitoring intervals to match exactly
- Synchronises allowed weekdays and scheduled times
- Preserves your notification preferences

> [!TIP]
> For best results, collect backup logs after changing backup job intervals in your Duplicati server. This ensures **duplistatus** stays synchronised with your current configuration.

<br/>
