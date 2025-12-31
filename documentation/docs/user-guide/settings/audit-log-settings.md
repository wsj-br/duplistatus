

# Audit Log

The audit log provides a comprehensive record of all system changes and user actions in **duplistatus**. This helps track configuration changes, user activities, and system operations for security and troubleshooting purposes.

![Audit Log](/img/screen-settings-audit.png)

## Audit Log Viewer

The audit log viewer displays a chronological list of all logged events with the following information:

- **Timestamp**: When the event occurred
- **User**: The username who performed the action (or "System" for automated actions)
- **Action**: The specific action that was performed
- **Category**: The category of the action (Authentication, User Management, Configuration, Backup Operations, Server Management, System Operations)
- **Status**: Whether the action succeeded or failed
- **Target**: The object that was affected (if applicable)
- **Details**: Additional information about the action


### Viewing Log Details

Click the <IconButton icon="lucide:eye" /> eye icon next to any log entry to view detailed information, including:
- Full timestamp
- User information
- Complete action details
- IP address and user agent
- Error messages (if the action failed)

### Exporting Audit Logs

You can export filtered audit logs in two formats:

| Button | Description |
|:------|:-----------|
| <IconButton icon="lucide:download" label="Export CSV"/> | Export logs as a CSV file for spreadsheet analysis |
| <IconButton icon="lucide:download" label="Export JSON"/> | Export logs as a JSON file for programmatic analysis |

> [!NOTE]
> Exports include only the logs currently visible based on your active filters. To export all logs, clear all filters first.

<br/>

## Retention Configuration

Configure how long audit logs are retained before automatic cleanup.

![Audit Log Retention](/img/screen-settings-audit-retention.png)

| Setting | Description | Default Value |
|:-------|:-----------|:-------------|
| **Retention (days)** | Number of days to retain audit logs before automatic deletion | `90 days` |

### Retention Settings

- **Range**: 30 to 365 days
- **Automatic Cleanup**: Runs daily at 02:00 UTC (not configurable)
- **Manual Cleanup**: Available via API for administrators (see [Cleanup Audit Logs](../../api-reference/administration-apis.md#cleanup-audit-logs---apiaudit-logcleanup))

