---
sidebar_position: 1
---

# Welcome to duplistatus

![duplistatus](///img/duplistatus_banner.png)

**duplistatus** - Another [Duplicati](https://github.com/duplicati/duplicati) Dashboard

![](https://img.shields.io/badge/version-0.8.10-blue)

This web application monitors and visualises backup operations from [Duplicati](https://github.com/duplicati/duplicati). **duplistatus** provides a comprehensive dashboard to track backup statuses, execution, metrics, and performance across multiple servers.

It also provides API endpoints that can be integrated with third-party tools such as [Homepage](https://gethomepage.dev/).

## Features

- **Easy Installation**: Run inside a container with images available on Docker Hub and GitHub Container Registry
- **Dashboard**: Displays the backup status for all monitored servers (NEW LAYOUT)
- **Backup History**: Detailed view of backup history for each server
- **Data Visualisation**: Interactive charts showing backup metrics over time and other statistical information
- **Log Collection**: Collects backup logs directly from Duplicati servers via HTTP/HTTPS
- **Notification System**: [ntfy](https://github.com/binwiederhier/ntfy) integration for backup notifications and overdue backup alerts; see notifications on your phone
- **Overdue Backup Monitoring**: Automated checking and alerting for overdue scheduled backups
- **Backup Version Display**: Shows the list of backup versions available in the backend
- **Duplicati Server**: Includes feature to open the Duplicati server web UI from **duplistatus** (NEW)
- **Server Settings**: Users can choose an alias for the server and include a note with a description (NEW)
- **API Access**: RESTful API endpoints to expose backup status to [Homepage](https://gethomepage.dev/) or any other tool that supports RESTful APIs

## Screenshots

### Dashboard

![dashboard](//img/screen-dashboard.png)

### Backup History

![server-detail](//img/screen-server.png)

### Backup Details

![backup-detail](//img/screen-backup.png)

### Overdue Backups

![overdue backups](//img/screen-overdue-tooltip.png)

### Overdue notifications on your phone

![ntfy overdue message](//img/screen-overdue-notification.png)

## Quick Start

1. **Install duplistatus** - See our [Installation Guide](getting-started/installation.md)
2. **Configure Duplicati servers** - Follow the [Configuration Guide](getting-started/configuration.md)
3. **Start monitoring** - Check out the [User Guide](user-guide/overview.md)

## What's New in Version 0.8.10

> [!IMPORTANT]
> If you are upgrading from version 0.6.x or earlier, your database will be automatically 
> [migrated](migration/overview.md) to the new schema during the upgrade process.
> 
> 🚨 **API Response Changes in version 0.7.x**
> 
>   If you have external integrations, scripts, or applications that consume the API endpoints `/api/summary`, `/api/lastbackup`
>   and `/api/lastbackups`, you **MUST** update them immediately as [the JSON response structure has changed.](migration/api-changes.md) 
> 
> For more information see [Release Notes 0.7.27](release-notes/0.7.27.md)

## Need Help?

- 📖 **User Guide**: Learn how to use all features in our [User Guide](user-guide/overview.md)
- 🔧 **API Reference**: Integrate with third-party tools using our [API Reference](api-reference/overview.md)
- 🛠️ **Development**: Want to contribute? Check our [Development Guide](development/setup.md)
- 🐛 **Issues**: Found a bug? [Report it on GitHub](https://github.com/wsj-br/duplistatus/issues)

## Credits

- First and foremost, thanks to Kenneth Skovhede for creating Duplicati, this amazing backup tool. Thanks also to all the contributors.

  💙 If you find Duplicati (https://www.duplicati.com) useful, please consider supporting the developer. More details are available on their website or GitHub page.

- Duplicati SVG icon from https://dashboardicons.com/icons/duplicati
- Notify SVG icon from https://dashboardicons.com/icons/ntfy
- Github SVG icon from https://github.com/logos

> [!NOTE]
> All product names, trademarks, and registered trademarks are the property of their respective owners. Icons and names are used for identification purposes only and do not imply endorsement.

## License

The project is licensed under the [Apache License 2.0](https://github.com/wsj-br/duplistatus/blob/main/LICENSE).   

**Copyright © 2025 Waldemar Scudeller Jr.**
