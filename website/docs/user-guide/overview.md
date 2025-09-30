---
sidebar_position: 1
---

# User Guide Overview

![duplistatus](//img/duplistatus_banner.png)

Welcome to the **duplistatus** user guide. This document provides comprehensive instructions for using **duplistatus** to monitor and manage your Duplicati backup operations.

> [!IMPORTANT]
> If you are upgrading from version 0.6.1 or earlier, check the [Release notes](../release-notes/0.7.27.md) about all changes in this version.

## Getting Started

After installation, access the **duplistatus** web interface:

1. Open your web browser
2. Navigate to `http://your-server-ip:9666`
   - Replace `your-server-ip` with the actual IP address or hostname of the server where **duplistatus** is installed
   - The default port is `9666`
3. The dashboard displays automatically

## User Interface Overview

The **duplistatus** interface consists of several key components:

### Application Toolbar
Located at the top of the interface, the toolbar provides:
- **Refresh Button**: Manually refresh the dashboard data
- **Settings Button**: Access application settings and configuration
- **Layout Toggle**: Switch between Cards and Table layouts
- **Server Management**: Add, edit, or remove servers

### Dashboard Summary
The summary section provides an overview of:
- **Total Servers**: Number of configured backup servers
- **Total Backup Jobs**: Number of backup jobs across all servers
- **Successful Backups**: Number of successful backup operations
- **Failed Backups**: Number of failed backup operations
- **Overdue Backups**: Number of backups that are overdue

### Main Content Area
The main content area displays your backup servers in either:
- **Cards Layout**: Visual cards showing server information
- **Table Layout**: Tabular view with detailed information

## Key Features

### Dashboard Monitoring
- **Real-time Status**: View current backup status for all servers
- **Historical Data**: Access backup history and trends
- **Performance Metrics**: Monitor backup performance and statistics
- **Overdue Alerts**: Get notified about overdue backups

### Server Management
- **Server Configuration**: Set server aliases and descriptions
- **Notification Settings**: Configure per-server notification preferences
- **Backup Monitoring**: Track individual backup job status
- **Log Collection**: Collect and view backup logs

### Notification System
- **NTFY Integration**: Send notifications to your phone
- **Email Notifications**: Configure email alerts
- **Custom Templates**: Customize notification messages
- **Overdue Monitoring**: Automated overdue backup detection

### API Access
- **RESTful API**: Integrate with third-party tools
- **Homepage Integration**: Add widgets to your homepage
- **External Monitoring**: Use with monitoring systems
- **Custom Integrations**: Build custom solutions

## Navigation Guide

### Main Sections
1. **Dashboard**: Overview of all backup servers
2. **Server Details**: Detailed view of individual servers
3. **Backup History**: Historical backup information
4. **Settings**: Application configuration
5. **API Reference**: API documentation and examples

### Quick Actions
- **Refresh Data**: Click the refresh button to update information
- **Switch Layout**: Toggle between Cards and Table views
- **Access Settings**: Click the settings icon for configuration
- **View Server Details**: Click on any server to see detailed information

## Getting Help

### Documentation
- **Installation Guide**: [Getting Started](../getting-started/installation.md)
- **Configuration**: [Duplicati Configuration](../getting-started/configuration.md)
- **API Reference**: [API Documentation](../api-reference/overview.md)
- **Development**: [Development Guide](../development/setup.md)

### Support
- **GitHub Issues**: [Report bugs or request features](https://github.com/wsj-br/duplistatus/issues)
- **GitHub Discussions**: [Community support](https://github.com/wsj-br/duplistatus/discussions)

## Next Steps

Now that you understand the overview, explore these sections:

1. **Dashboard Features**: Learn about the [Dashboard](dashboard.md) layout and features
2. **Server Management**: Configure [Server Settings](server-management.md)
3. **Notifications**: Set up [Notification System](notifications.md)
4. **Backup Monitoring**: Monitor [Backup Operations](backup-monitoring.md)
5. **Troubleshooting**: Common issues and [Troubleshooting](troubleshooting.md) guide

## Tips for Success

- **Regular Monitoring**: Check the dashboard regularly to ensure backups are running
- **Notification Setup**: Configure notifications to stay informed about backup status
- **Server Organization**: Use aliases and notes to organize your servers
- **Backup Testing**: Regularly test your backup and restore procedures
- **Documentation**: Keep notes about your backup configuration and procedures
