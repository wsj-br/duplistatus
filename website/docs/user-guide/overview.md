---
sidebar_position: 1
---

# Overview



Welcome to the **duplistatus** user guide. This document provides comprehensive instructions for using **duplistatus** to monitor and manage your Duplicati backup operations.

<br/>

> [!IMPORTANT]
> If you are upgrading from version 0.6.1 or earlier, check the [Release notes](../release-notes/0.7.27.md) about all changes in this version.

<br/>

## Installation

See [Installation Guide](../getting-started/installation.md) for prerequisites and installation instructions.

<br/><br/>

## Getting Started

After installation, access the **duplistatus** web interface:

1.  Open your web browser.

2.  Navigate to `http://your-server-ip:9666`.

    - Replace `your-server-ip` with the actual IP address or hostname of the server where **duplistatus** is installed. The default port is `9666`.

3.  The dashboard displays automatically.

<br/>

> [!TIP]
> On the first use, you should collect backup logs from all your Duplicati servers
> to populate the database. Please refer to the [Collect Backup Logs](collect-backup-logs.md)
> section for guidance.

<br/><br/>

## User Interface

**duplistatus** provides a comprehensive dashboard for monitoring Duplicati backup operations across multiple servers.

<br/>

<div>

![Dashboard Overview](../img/screen-dashboard.png)

<br/>

The user interface consists of several elements, organised into different sections to provide a clear and intuitive experience:

1.  [**Application Toolbar**](#application-toolbar): Provides easy access to main functions and configurations.
2.  [**Dashboard Summary**](dashboard.md#dashboard-summary): A summary of all monitored servers.
3.  **Servers Overview**: [Cards](dashboard.md#cards-layout) or a [table](dashboard.md#table-layout) showing the latest status of all backups from monitored Duplicati servers.
4.  [**Overdue Details**](dashboard.md#overdue-details): A visual warning for overdue backups with details on hover.
5.  [**Available Backup Versions**](dashboard.md#available-backup-versions): Click the blue icon to view backup versions available on the backup destination.
6.  [**Backup Metrics**](backup-metrics.md): Charts displaying backup metrics over time.
7.  [**Server Details**](server-details.md): A list of recorded backups for a specific server, including statistics.
8.  [**Backup Details**](server-details.md#backup-details): Detailed information for a specific backup, including log messages (execution, warnings, and errors).

</div>

<br/>

## Application Toolbar

The toolbar provides easy access to key functions and settings.

<div>

![application toolbar](../img/duplistatus_toolbar.png)

| Button                                              | Description                                                                                      |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Refresh screen                                      | Execute a refresh immediately                                                                    |
| Auto-refresh                                        | Enable/disable auto-refresh. Configure the interval in [`Display Settings`](display-settings.md)   |
| Open NTFY                                           | Open the ntfy.sh website on the topic configured in [`Settings → NTFY Settings`](ntfy-settings.md) |
| [Duplicati configuration](duplicati-configuration.md) | Open the Duplicati server configuration (web interface)                                          |
| [Check overdue backups](overdue-monitoring.md#overdue-check-process)     | Execute the check for overdue backups now                                                        |
| [Collect logs](collect-backup-logs.md)                | Connect to a Duplicati server to collect all backup logs from its database                       |
| [Database maintenance](database-maintenance.md)       | Clean the database, remove old backup logs, or delete data for a specific server                 |
| [Display Settings](display-settings.md)               | Configure how **duplistatus** will display data                                                  |
| [Settings](settings.md)                               | Configure notifications, overdue monitoring, server details and templates                        |
| Theme                                               | Toggle between dark (default) and light themes                                                   |

</div>

<br/><br/>
