

# Overview

Welcome to the duplistatus user guide. This comprehensive document provides detailed instructions for using duplistatus to monitor and manage your Duplicati backup operations across multiple servers.

## What is duplistatus?

duplistatus is a powerful monitoring dashboard designed specifically for Duplicati backup systems. It provides:

- Centralised monitoring of multiple Duplicati servers from a single interface
- Real-time status tracking of all backup operations
- Automated overdue backup detection with configurable alerts
- Comprehensive metrics and visualisation of backup performance
- Flexible notification system via NTFY and email

## Installation

For prerequisites and detailed installation instructions, please refer to the [Installation Guide](/installation/).

## Accessing the Dashboard

After successful installation, access the duplistatus web interface by following these steps:

1. Open your preferred web browser
2. Navigate to `http://your-server-ip:9666`
   - Replace `your-server-ip` with the actual IP address or hostname of your duplistatus server
   - The default port is `9666`
3. The main dashboard will display automatically (with no data on first usage)

## User Interface Overview

duplistatus provides an intuitive dashboard for monitoring Duplicati backup operations across your entire infrastructure.

![Dashboard Overview](/img/screen-dashboard.png)

The user interface is organised into several key sections to provide a clear and comprehensive monitoring experience:

1. [Application Toolbar](#application-toolbar): Quick access to essential functions and configurations
2. [Dashboard Summary](dashboard.md#dashboard-summary): Overview statistics for all monitored servers
3. Servers Overview: [Cards layout](dashboard.md#cards-layout) or [table layout](dashboard.md#table-layout) showing the latest status of all backups
4. [Overdue Details](dashboard.md#overdue-details): Visual warnings for overdue backups with detailed information on hover
5. [Available Backup Versions](dashboard.md#available-backup-versions): Click the blue icon to view backup versions available at the destination
6. [Backup Metrics](backup-metrics.md): Interactive charts displaying backup performance over time
7. [Server Details](server-details.md): Comprehensive list of recorded backups for specific servers, including detailed statistics
8. [Backup Details](server-details.md#backup-details): In-depth information for individual backups, including execution logs, warnings, and errors

## Application Toolbar

The application toolbar provides convenient access to key functions and settings, organised for efficient workflow.

![application toolbar](/img/duplistatus_toolbar.png)

| Button | Description |
|-----------|-------------|
| <IconButton icon="lucide:rotate-ccw" /> &nbsp; Refresh screen | Execute an immediate manual refresh of all data |
| <IconButton label="Auto-refresh" />| Enable or disable automatic refresh functionality. Configure in [Display Settings](display-settings.md) |
|  <SvgButton svgFilename="ntfy.svg" /> &nbsp; Open NTFY | Access the ntfy.sh website for your configured notification topic. <br/> _Right-click_ to show a QR code to configure your device to receive notifications from duplistatus. |
| <SvgButton svgFilename="duplicati_logo.svg" href="duplicati-configuration" /> &nbsp; [Duplicati configuration](duplicati-configuration.md) | Open the selected Duplicati server's web interface |
| <IconButton icon="lucide:calendar-check" href="overdue-monitoring" /> &nbsp; [Check overdue backups](overdue-monitoring.md) | Execute immediate overdue backup verification |
| <IconButton icon="lucide:download" href="collect-backup-logs" /> &nbsp; [Collect logs](collect-backup-logs.md) | Connect to Duplicati servers and retrieve backup logs <br/> _Right-click_ to collect logs for all configured servers |
| <IconButton icon="lucide:database" href="database-maintenance" /> &nbsp;  [Database maintenance](database-maintenance.md) | Perform database cleanup and maintenance operations |
| <IconButton icon="lucide:monitor-cog" href="display-settings" /> &nbsp; [Display Settings](display-settings.md) | Configure data display preferences and interface behaviour |
| <IconButton icon="lucide:settings" href="settings/backup-notifications-settings" /> &nbsp; [Settings](settings/backup-notifications-settings.md) | Configure notifications, monitoring, SMTP server and notification templates |
| <IconButton icon="lucide:book-open" href="overview" /> &nbsp; User Guide | Open a new browser tab with this User Guide |
| <IconButton icon="lucide:sun" /> &nbsp; Theme | Toggle between dark (default) and light interface themes |

## Essential Configuration

1. Collect initial backup logs - Use the [Collect Backup Logs](collect-backup-logs.md) feature to populate the database with historical backup data from all your Duplicati servers. This also automatically updates the overdue monitoring intervals from the Duplicati servers.
2. Configure server settings - Set up server aliases, notes in [Settings → Server](settings/server-settings.md) to make your dashboard more informative
3. Configure email settings - Set up email notifications in [Settings → Email](settings/email-settings.md) as an alternative notification method

<br/>

> [!TIP]
> Remember to configure the Duplicati servers to send backup logs to duplistatus, as outlined in the [Duplicati Configuration](/installation/duplicati-server-configuration.md) section.

