

# Welcome to duplistatus

**duplistatus** - Another [Duplicati](https://github.com/duplicati/duplicati) Dashboard

## Features

- **Quick Setup**: Simple containerised deployment, with images available on Docker Hub and GitHub.
- **Unified Dashboard**: View backup status, history, and details for all servers in one place.
- **Overdue Monitoring**: Automated checking and alerting for overdue scheduled backups.
- **Data Visualisation & Logs**: Interactive charts and automatic log collection from Duplicati servers.
- **Notifications & Alerts**: Integrated NTFY and SMTP email support for backup alerts, including overdue backup notifications.
- **User Access Control & Security**: Secure authentication system with role-based access control (Admin/User roles), password policies, account lockout protection, and comprehensive user management.
- **Audit Logging**: Complete audit trail of all system changes and user actions with advanced filtering, export capabilities, and configurable retention periods.

>[!IMPORTANT]
> - **Authentication Required**: All pages now require user authentication. A default admin account is created automatically (username: `admin`, password: `Duplistatus09` - must be changed on first login).
> 
> - If you are upgrading from an earlier version, your database will be automatically 
> [migrated](migration/version_upgrade.md) to the new schema during the upgrade process.
> 
> - Adjust the time zone and language settings to receive notifications in the correct time zone and number/date/time format. See details in the [Timezone and Locale](installation/configure-tz-lang.md) section.
>


## Installation

The application can be deployed using Docker, Portainer Stacks, or Podman. 
See details in the [Installation Guide](installation/installation.md).


>[!NOTE]
> - The application was designed to work in a standalone Podman container. If you plan to use it inside a Pod, 
>  you will need to configure the Pod networking to expose the duplistatus port (defaults to `9666`) to your local network.
> - It worked before version 1.0.4 inside a Pod as it was using a dedicated server. In this version, it uses the standalone Next.js server to reduce the container image size.

## Duplicati Servers Configuration (Required)

Once your **duplistatus** server is up and running, you need to configure your **Duplicati** servers to 
send backup logs to **duplistatus**, as outlined in the [Duplicati Configuration](installation/duplicati-server-configuration.md) 
section of the Installation Guide. Without this configuration, the dashboard will not receive backup data from your Duplicati servers.

## User Guide

See the [User Guide](user-guide/overview.md) for detailed instructions on how to configure and use **duplistatus**, including initial setup, feature configuration, and troubleshooting.

## Screenshots

### Dashboard

![dashboard](/img/screen-main-dashboard-card-mode.png)

### Backup History

![server-detail](/img/screen-server-backup-list.png)

### Backup Details

![backup-detail](/img/screen-backup-detail.png)

### Overdue Backups

![overdue backups](/img/screen-overdue-backup-hover-card.png)

### Overdue notifications on your phone

![ntfy overdue message](/img/screen-overdue-notification.png)

## API Reference

See the [API Endpoints Documentation](api-reference/overview.md) for details about available endpoints, request/response formats, and examples.

## Development

For instructions on downloading, changing, or running the code, see [Development Setup](development/setup.md).

This project was mainly built with AI help. To learn how, see [How I Built this Application using AI tools](development/how-i-build-with-ai).

## Credits

- First and foremost, thanks to Kenneth Skovhede for creating Duplicati—this amazing backup tool. Thanks also to all the contributors.

  💙 If you find [Duplicati](https://www.duplicati.com) useful, please consider supporting the developer. More details are available on their website or GitHub page.

- Duplicati SVG icon from https://dashboardicons.com/icons/duplicati
- Notify SVG icon from https://dashboardicons.com/icons/ntfy
- GitHub SVG icon from https://github.com/logos

>[!NOTE]
> All product names, trademarks, and registered trademarks are the property of their respective owners. Icons and names are used for identification purposes only and do not imply endorsement.

## License

The project is licensed under the [Apache License 2.0](LICENSE.md).   

**Copyright © 2025 Waldemar Scudeller Jr.**

