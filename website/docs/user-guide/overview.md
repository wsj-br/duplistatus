---
sidebar_position: 1
---

# Overview

Welcome to the **duplistatus** user guide. This comprehensive document provides detailed instructions for using **duplistatus** to monitor and manage your Duplicati backup operations across multiple servers.

<br/>

> [!IMPORTANT]
> If you are upgrading from version 0.6.1 or earlier, please check the [Release notes](../release-notes/0.7.27.md) for information about all changes in this version.

<br/>

## What is duplistatus?

**duplistatus** is a powerful monitoring dashboard designed specifically for Duplicati backup systems. It provides:

- **Centralised monitoring** of multiple Duplicati servers from a single interface
- **Real-time status tracking** of all backup operations
- **Automated overdue backup detection** with configurable alerts
- **Comprehensive metrics and visualisation** of backup performance
- **Flexible notification system** via NTFY and email

<br/>

## Installation

For prerequisites and detailed installation instructions, please refer to the [Installation Guide](../getting-started/installation.md).

<br/><br/>

## Getting Started

After successful installation, access the **duplistatus** web interface by following these steps:

1.  Open your preferred web browser
2.  Navigate to `http://your-server-ip:9666`
    - Replace `your-server-ip` with the actual IP address or hostname of your **duplistatus** server
    - The default port is `9666`
3.  The main dashboard will display automatically

<br/>

> [!TIP]
> On first use, we recommend collecting backup logs from all your Duplicati servers to populate the database. Please refer to the [Collect Backup Logs](collect-backup-logs.md) section for detailed guidance.

<br/><br/>

## User Interface Overview

**duplistatus** provides an intuitive dashboard for monitoring Duplicati backup operations across your entire infrastructure.

<br/>

<div>

![Dashboard Overview](../img/screen-dashboard.png)

<br/>

The user interface is organised into several key sections to provide a clear and comprehensive monitoring experience:

1.  [**Application Toolbar**](#application-toolbar): Quick access to essential functions and configurations
2.  [**Dashboard Summary**](dashboard.md#dashboard-summary): Overview statistics for all monitored servers
3.  **Servers Overview**: [Cards layout](dashboard.md#cards-layout) or [table layout](dashboard.md#table-layout) showing the latest status of all backups
4.  [**Overdue Details**](dashboard.md#overdue-details): Visual warnings for overdue backups with detailed information on hover
5.  [**Available Backup Versions**](dashboard.md#available-backup-versions): Click the blue icon to view backup versions available at the destination
6.  [**Backup Metrics**](backup-metrics.md): Interactive charts displaying backup performance over time
7.  [**Server Details**](server-details.md): Comprehensive list of recorded backups for specific servers, including detailed statistics
8.  [**Backup Details**](server-details.md#backup-details): In-depth information for individual backups, including execution logs, warnings, and errors

</div>

<br/>

## Application Toolbar

The application toolbar provides convenient access to key functions and settings, organised for efficient workflow.

<div>

![application toolbar](../img/duplistatus_toolbar.png)

| Button | Description |
|--------|-------------|
| **Refresh screen** | Execute an immediate manual refresh of all data |
| **Auto-refresh** | Enable or disable automatic refresh functionality |
| **Open NTFY** | Access the ntfy.sh website for your configured notification topic |
| [**Duplicati configuration**](duplicati-configuration.md) | Open the selected Duplicati server's web interface |
| [**Check overdue backups**](overdue-monitoring.md#overdue-check-process) | Execute immediate overdue backup verification |
| [**Collect logs**](collect-backup-logs.md) | Connect to Duplicati servers and retrieve backup logs |
| [**Database maintenance**](database-maintenance.md) | Perform database cleanup and maintenance operations |
| [**Display Settings**](display-settings.md) | Configure data display preferences and interface behaviour |
| [**Settings**](settings.md) | Configure notifications, monitoring, and server templates |
| **Theme** | Toggle between dark (default) and light interface themes |

</div>

<br/>

### Auto-refresh Configuration

The auto-refresh interval can be customised in the [Display Settings](display-settings.md) to match your monitoring requirements.

### NTFY Integration

The NTFY button opens the configured notification topic, which is set up in [Settings → NTFY Settings](ntfy-settings.md).

<br/><br/>

## Key Features

### Enhanced Overdue Monitoring (Version 0.8.x+)

Version 0.8.x introduces advanced overdue monitoring capabilities:

- **Custom interval support** using Duplicati-compatible formats (e.g., "1D12h" for 1 day and 12 hours)
- **Automatic synchronisation** of backup schedules from Duplicati configuration
- **Flexible notification channels** with independent NTFY and email settings per backup job
- **Bulk collection** from all configured servers with single actions

### Comprehensive Backup Visualisation

- **Interactive metrics charts** showing duration, file size, and storage usage trends
- **Detailed backup history** with complete execution logs and error tracking
- **Version management** displaying available backup versions at destination storage
- **Real-time status updates** with configurable refresh intervals

### Flexible Notification System

- **Multiple notification channels**: NTFY push notifications and email alerts
- **Customisable templates** for different backup scenarios
- **Granular control** over notification triggers and frequencies
- **Device configuration** with QR code generation for easy mobile setup

<br/>

## Next Steps

After familiarising yourself with the interface, we recommend:

1.  **Configure your Duplicati servers** to send backup logs to **duplistatus**
2.  **Collect initial backup logs** using the [Collect Backup Logs](collect-backup-logs.md) feature
3.  **Set up notifications** in [Settings](settings.md) to receive alerts for important events
4.  **Configure overdue monitoring** to ensure timely backup completion alerts
5.  **Explore server details** to understand backup performance and history

For detailed configuration instructions, please refer to the specific sections in this user guide.

<br/><br/>