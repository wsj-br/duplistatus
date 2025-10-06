---
sidebar_position: 10
---

# Backup Notifications Settings

<div>

![Backup alerts](../img/screen-settings-backup-alerts.png)

<br/>

## Configure Per-Backup Notification Settings

![overdue backup config](../img/screen-settings-overdue-bkp.png)

| Setting                       | Description                                               | Default Value |
| :---------------------------- | :-------------------------------------------------------- | :------------ |
| **Notification Events**       | Configure when to send notifications for new backup logs. | `Warnings`    |
| **NTFY**                      | Enable or disable NTFY notifications for this backup.     | `Enabled`     |
| **Email**                     | Enable or disable email notifications for this backup.    | `Disabled`    |
| **Overdue Backup Monitoring** | Enable or disable overdue monitoring for this backup.     | `Enabled`     |
| **Expected Backup Interval**  | How often backups are expected to run.                    | `1`           |
| **Unit**                      | The time unit for the interval (Hours/Days).              | `Day(s)`      |

**Notification Events Options:**

- `all`: Send notifications for all backup events.
- `warnings`: Send notifications for warnings and errors only.
- `errors`: Send notifications for errors only.
- `off`: Disable notifications for new backup logs for this backup.

**Notification Channels (Version 0.8.x):**

- **NTFY**: Enable/disable push notifications via NTFY service. Requires [NTFY Settings](ntfy-settings) to be configured.
- **Email**: Enable/disable email notifications via SMTP. Requires [Email Configuration](email-configuration) to be configured.

You can independently enable or disable each notification channel per backup. Configuration indicators show which channels are properly set up (greyed icons indicate missing or invalid configuration).

**Per-Backup Configuration:**
Each backup job can be configured independently for:

- Notification events (All, Warnings, Errors, Off)
- NTFY notifications (enabled/disabled)
- Email notifications (enabled/disabled)
- Overdue monitoring (enabled/disabled)

This allows you to create customised notification strategies, such as enabling only email for critical backups and both NTFY and email for important servers.

> [!NOTE]
> These options only control notifications sent when a [new backup log is received](../getting-started/duplicati-server-configuration.md). Overdue notifications will be sent regardless of these settings.

<br/>

## Global Configurations

These settings apply to all backups:

![overdue global config](../img/screen-settings-overdue-conf.png)

| Setting                         | Description                                                                                                                                                                                                                                                                                                               |
| :------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Overdue Tolerance**           | The grace period (extra time allowed) added to the expected backup time before marking as overdue. The default is `1 hour`.                                                                                                                                                                                               |
| **Overdue Monitoring Interval** | How often the system checks for overdue backups. The default is `5 minutes`.                                                                                                                                                                                                                                              |
| **Notification Frequency**      | How often to send overdue notifications: <br/> - `One time`: Send one notification when the backup becomes overdue. <br/> - `Every day`: Send daily notifications while overdue (default).<br/> - `Every week`: Send weekly notifications while overdue. <br/> - `Every month`: Send monthly notifications while overdue. |

<br/>

## Action Buttons

![Backup Notifications Buttons](../img/screen-settings-overdue-btn.png)

| Button                 | Description                                                                              |
| :--------------------- | :--------------------------------------------------------------------------------------- |
| `Save Backup Settings` | Saves the settings, clears timers for any disabled backups, and runs an overdue check.   |
| `Check now`            | Runs the overdue backup check immediately. This is useful after changing configurations. |
| `Reset timer`          | Resets the last overdue notification sent for all backups.                               |

<br/>

</div>
