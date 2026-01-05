

# Backup Metrics

A chart of backup metrics over time is shown on both the dashboard (table view) and the server details page.

- **Dashboard**, the chart shows the total number of backups recorded in the **duplistatus** database. If you use the Cards layout, you can select a server to see its consolidated metrics (when side panel is showing metrics).
- **Server Details** page, the chart shows metrics for the selected server (for all its backups) or for a single, specific backup.

![Backup Metrics](/img/screen-metrics.png)

- **Uploaded Size**: Total amount of data uploaded/transmitted during backups from Duplicati server to the destination (local storage, FTP, cloud provider, ...) per day.
- **Duration**: The total duration of all backups received per day in HH:MM.
- **File Count**: The sum of the file count counter received for all backups per day.
- **File Size**: The sum of the file size reported by Duplicati server for all backups received per day.
- **Storage Size**: The sum of the storage size used on the backup destination reported by the Duplicati server per day.
- **Available Versions**: The sum of all available versions for all backups per day.

 
   

:::note
You can use the [Display Settings](settings/display-settings.md) control to configure the time range for the chart.
:::

