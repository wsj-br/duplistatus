

# Dashboard

> [!TIP]
> **Quick Access to Display Settings**: Right-click on the auto-refresh button in the application toolbar to quickly open the [Display Settings](settings/display-settings.md) page.

## Dashboard Summary

This section displays aggregated statistics for all backups.

![Dashboard summary - overview](/img/screen-dashboard-summary.png)
![Dashboard summary - table](/img/screen-dashboard-summary-table.png)

- **Total Servers**: The number of servers being monitored.                                                                                                             |
- **Total Backup Jobs**: The total number of backup jobs (types) configured for all servers.                                                                                |
- **Total Backup Runs**: The total number of backup logs from runs received or collected for all servers.                                                                   |
- **Total Backup Size**: The combined size of all source data, based on the latest backup logs received.                                                                    |
- **Storage Used**: The total storage space used by backups on the backup destination (e.g., cloud storage, FTP server, local drive), based on the latest backup logs. |
- **Uploaded Size**: The total amount of data uploaded from the Duplicati server to the destination (e.g., local storage, FTP, cloud provider).                         |
- **Overdue Backups** (table): The number of backups that are overdue. See [Backup Notifications Settings](settings/backup-notifications-settings.md)                             |
- **Layout Toggle**: Switches between the Cards layout (default) and the Table layout.                                                                                  |

## Cards Layout

The cards layout shows the status of the most recent backup log received for each backup.

![Dashboard Overview](/img/duplistatus_dash-cards.png)

- **Server Name**: Name of the Duplicati server (or the alias)
  - Hovering over the **Server Name** will show the server name and note
- **Overall Status**: The status of the server. Overdue backups will show as a `Warning` status
- **Summary information**: The consolidated number of files, size and storage used for all backups of this server. Also shows the elapsed time of the most recent backup received (hover over to show the timestamp)
- **Backups list**: A table with all the backups configured for this server, with 3 columns:
  - **Backup Name**: Name of the backup in the Duplicati server
  - **Status history**: Status of the last 10 backups received.
  - **Last backup received**: The elapsed time since the current time of the last log received. It will show a warning icon if the backup is overdue.
    - Time is shown in abbreviated format: `m` for minutes, `h` for hours, `d` for days, `w` for weeks, `mo` for months, `y` for years.

> [!NOTE]
> You can use the [Display Settings](settings/display-settings.md) to configure the card sort order. The available options are `Server name (a-z)`, `Status (error > warning > success)`, and `Last backup received (new > old)`.

You can toggle the top right button on the side panel to change the panel view:

- Status: Show statistics of the backup jobs per status, with a list of overdue backups and backup jobs with warnings/errors status.

![status panel](/img/screen-overview-side-status.png)

- Metrics: Show charts with duration, file size and storage size over time for the aggregated or selected server.

![charts panel](/img/screen-overview-side-charts.png)

### Backup Details

Hovering over a backup in the list displays details of the last backup log received and any overdue information.

![Overdue details](/img/screen-backup-tooltip.png)

- **Server Name : Backup**: The name or alias of the Duplicati server and backup, will also show the server name and note.
  - The alias and note can be configured at `Settings → Server Settings`.
- **Notification**: An icon showing the [configured notification](#notifications-icons) setting for new backup logs.
- **Date**: The timestamp of the backup and the elapsed time since the last screen refresh.
- **Status**: The status of the last backup received (Success, Warning, Error, Fatal).
- **Duration, File Count, File Size, Storage Size, Uploaded Size**: Values as reported by the Duplicati server.
- **Available Versions**: The number of backup versions stored on the backup destination at the time of the backup.

If this backup is overdue, the tooltip also shows:

- **Expected Backup**: The time the backup was expected, including the configured grace period (extra time allowed before marking as overdue).

You can also click the buttons at the bottom to open `Settings → Backup Notifications` to configure overdue settings or open the Duplicati server's web interface.

## Table Layout

The table layout lists the most recent backup logs received for all servers and backups.

![Dashboard Table Mode](/img/screen-main-dashboard-table-mode.png)

- **Server Name**: The name of the Duplicati server (or alias)
  - Under the name is the server note
- **Backup Name**: The name of the backup in the Duplicati server.
- **Available Versions**: The number of backup versions stored on the backup destination. If the icon is greyed out, detailed information was not received in the log. See the [Duplicati Configuration instructions](../installation/duplicati-server-configuration.md) for details.
- **Backup Count**: The number of backups reported by the Duplicati server.
- **Last Backup Date**: The timestamp of the last backup log received and the elapsed time since the last screen refresh.
- **Last Backup Status**: The status of the last backup received (Success, Warning, Error, Fatal).
- **Duration**: The duration of the backup in HH:MM:SS.
- **Warnings/Errors**: The number of warnings/errors reported in the backup log.
- **Settings**:
  - **Notification**: An icon showing the configured notification setting for new backup logs.
  - **Duplicati configuration**: A button to open the Duplicati server's web interface

### Notifications Icons

| Icon                                     | Notification Option | Description                                                                                         |
| ---------------------------------------- | ------------------- | --------------------------------------------------------------------------------------------------- |
| ![off](/img/screen-nt-off.png)           | Off                 | No notifications will be sent when a new backup log is received                                     |
| ![all](/img/screen-nt-all.png)           | All                 | Notifications will be sent for every new backup log, regardless of its status.                      |
| ![warnings](/img/screen-nt-warnings.png) | Warnings            | Notifications will be sent only for backup logs with a status of Warning, Unknown, Error, or Fatal. |
| ![errors](/img/screen-nt-errors.png)     | Errors              | Notifications will be sent only for backup logs with a status of Error or Fatal.                    |

> [!NOTE]
> This notification setting only applies when **duplistatus** receives a new backup log from a Duplicati server. Overdue notifications are configured separately and will be sent regardless of this setting.

### Overdue Details

Hovering over the overdue warning icon displays details about the overdue backup.

![Overdue details](/img/screen-overdue-backup-hover-card.png)

- **Checked**: When the last overdue check was performed. Configure the frequency in [Backup Notifications Settings](settings/backup-notifications-settings.md).
- **Last Backup**: When the last backup log was received.
- **Expected Backup**: The time the backup was expected, including the configured grace period (extra time allowed before marking as overdue).
- **Last Notification**: When the last overdue notification was sent.

### Available Backup Versions

Clicking the blue clock icon opens a list of available backup versions at the time of the backup, as reported by the Duplicati server.

![Available versions](/img/screen-available-backups-modal.png)

- **Backup Details**: Shows the server name and alias, server note, backup name, and when the backup was executed.
- **Version Details**: Shows the version number, creation date, and age.

> [!NOTE]
> If the icon is greyed out, it means that no detailed information was received in the message logs.
> See the [Duplicati Configuration instructions](../installation/duplicati-server-configuration.md) for details.

