

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

### Filtering Audit Logs

You can filter audit logs using the following criteria:

| Filter | Description |
|:------|:-----------|
| **Date Range** | Filter logs by start and end dates using the date pickers |
| **User** | Filter by username (enter username in the search field) |
| **Action** | Filter by specific action type |
| **Category** | Filter by category (Authentication, User Management, Configuration, etc.) |
| **Status** | Filter by status (Success, Failure, Error) |

> [!TIP]
> The audit log uses infinite scroll loading. As you scroll down, more logs are automatically loaded. You can also use the export function to download all filtered logs.

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
- **Automatic Cleanup**: Runs daily at 2 AM UTC (not configurable)
- **Manual Cleanup**: Available via API for administrators (see [API Reference](../../api-reference/administration-apis.md))

> [!IMPORTANT]
> Retention configuration is only available to administrators. Non-admin users can view audit logs but cannot modify retention settings.

> [!NOTE]
> When logs are deleted due to retention policy, the deletion action itself is logged to the audit log.

<br/>

## What Gets Logged

The audit log tracks the following types of events:

| Category                       | Events                                                                                                                                                              |
|:-------------------------------|:--------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Authentication Events**      | User login and logout<br/>Password changes<br/>Account lockouts<br/>Failed login attempts                                                                           |
| **User Management Operations** | User creation, updates, and deletion<br/>Password resets<br/>Admin status changes<br/>Password change requirement settings                                          |
| **Configuration Changes**      | Email (SMTP) settings<br/>NTFY settings<br/>Notification templates<br/>Overdue tolerance settings<br/>Backup notification settings<br/>Audit log retention settings |
| **Backup Operations**          | Backup log collection<br/>Backup data deletion<br/>Database cleanup operations                                                                                      |
| **Server Management**          | Server addition, updates, and deletion<br/>Server password changes<br/>Server URL configuration                                                                     |
| **System Operations**          | Database migrations<br/>Overdue backup checks<br/>Notification sending<br/>System cleanup operations                                                                |

<br/>
