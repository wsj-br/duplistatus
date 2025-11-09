

# Welcome to duplistatus

**duplistatus** - Another [Duplicati](https://github.com/duplicati/duplicati) Dashboard

## Features

- **Quick Setup**: Simple deployment in a container, with images on Docker Hub and GitHub.
- **Unified Dashboard**: View backup status, history and details for all servers in one place.
- **Overdue Monitoring**: Automated checking and alerting for overdue scheduled backups.
- **Data Visualisation & Logs**: Interactive charts and automatic log collection from Duplicati servers.
- **Notifications & Alerts**: Integrated NTFY and SMTP email support for backup alerts, including overdue backup notifications.

>[!IMPORTANT]
> - If you are upgrading from an earlier version, your database will be automatically 
> [migrated](migration/version_upgrade.md) to the new schema during the upgrade process.
> 
> - Adjust the timezone and language to receive notifications in right time zone and number/date/time format. See detail in the [Timezone and Locale](installation/configure-tz-lang.md) section.
>


## Installation

The application can be deployed using Docker, Portainer Stacks, or Podman. 
See details in the [Installation Guide](installation/installation.md).

## Duplicati Servers Configuration (Required)

Once your **duplistatus** server is up and running, you need to configure your **Duplicati** servers to 
send backup logs to **duplistatus**, as outlined in the [Duplicati Configuration](installation/duplicati-server-configuration.md) 
section of the Installation Guide. Without this configuration, the dashboard will not function properly.

## User Guide

See the [User Guide](user-guide/overview.md) for detailed instructions on how to configure and use **duplistatus**, including setup, features, and troubleshooting.

## Screenshots

### Dashboard

![dashboard](/img/screen-dashboard.png)

### Backup History

![server-detail](/img/screen-server.png)

### Backup Details

![backup-detail](/img/screen-backup.png)

### Overdue Backups

![overdue backups](/img/screen-overdue-tooltip.png)

### Overdue notifications on your phone

![ntfy overdue message](/img/screen-overdue-notification.png)

## API Reference

See the [API Endpoints Documentation](api-reference/overview.md) for details about available endpoints, request/response formats, and examples.

## Development

For instructions on downloading, changing, or running the code, see [DEVELOPMENT.md](development/setup.md).

This project was mainly built with AI help. To learn how, see [HOW-I-BUILD-WITH-AI.md](development/how-i-build-with-ai).

## Credits

- First and foremost, thanks to Kenneth Skovhede for creating Duplicati, this amazing backup tool. Thanks also to all the contributors.

  💙 If you find Duplicati (https://www.duplicati.com) useful, please consider supporting the developer. More details are available on their website or GitHub page.

- Duplicati SVG icon from https://dashboardicons.com/icons/duplicati
- Notify SVG icon from https://dashboardicons.com/icons/ntfy
- Github SVG icon from https://github.com/logos

>[!NOTE]
> All product names, trademarks, and registered trademarks are the property of their respective owners. Icons and names are used for identification purposes only and do not imply endorsement.

## License

The project is licensed under the [Apache License 2.0](LICENSE.md).   

**Copyright © 2025 Waldemar Scudeller Jr.**

