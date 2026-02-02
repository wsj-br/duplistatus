

# Welcome to duplistatus {#welcome-to-duplistatus}

**duplistatus** -  Monitor Multiple [Duplicati](https://github.com/duplicati/duplicati) Servers from a Single Dashboard

## Features {#features}

- **Quick Setup**: Simple containerised deployment, with images available on Docker Hub and GitHub.
- **Unified Dashboard**: View backup status, history, and details for all servers in one place.
- **Overdue Monitoring**: Automated checking and alerting for overdue scheduled backups.
- **Data Visualisation & Logs**: Interactive charts and automatic log collection from Duplicati servers.
- **Notifications & Alerts**: Integrated NTFY and SMTP email support for backup alerts, including overdue backup notifications.
- **User Access Control & Security**: Secure authentication system with role-based access control (Admin/User roles), configurable password policies, account lockout protection, and comprehensive user management.
- **Audit Logging**: Complete audit trail of all system changes and user actions with advanced filtering, export capabilities, and configurable retention periods.
- **Application Logs Viewer**: Admin-only interface to view, search, and export application logs directly from the web interface with real-time monitoring capabilities.


## Installation {#installation}

The application can be deployed using Docker, Portainer Stacks, or Podman. 
See details in the [Installation Guide](installation/installation.md).


- If you are upgrading from an earlier version, your database will be automatically 
[migrated](migration/version_upgrade.md) to the new schema during the upgrade process.

- When using Podman (either as a standalone container or within a pod), and if you require custom DNS settings 
(such as for Tailscale MagicDNS, corporate networks, or other custom DNS configurations), you can manually 
specify DNS servers and search domains. See the installation guide for further details.

## Duplicati Servers Configuration (Required) {#duplicati-servers-configuration-required}

Once your **duplistatus** server is up and running, you need to configure your **Duplicati** servers to 
send backup logs to **duplistatus**, as outlined in the [Duplicati Configuration](installation/duplicati-server-configuration.md) 
section of the Installation Guide. Without this configuration, the dashboard will not receive backup data from your Duplicati servers.

## User Guide {#user-guide}

See the [User Guide](user-guide/overview.md) for detailed instructions on how to configure and use **duplistatus**, including initial setup, feature configuration, and troubleshooting.

## Screenshots {#screenshots}

### Dashboard {#dashboard}

![dashboard](assets/screen-main-dashboard-card-mode.png)

### Backup History {#backup-history}

![server-detail](assets/screen-server-backup-list.png)

### Backup Details {#backup-details}

![backup-detail](assets/screen-backup-detail.png)

### Overdue Backups {#overdue-backups}

![overdue backups](assets/screen-overdue-backup-hover-card.png)

### Overdue notifications on your phone {#overdue-notifications-on-your-phone}

![ntfy overdue message](/img/screen-overdue-notification.png)

## API Reference {#api-reference}

See the [API Endpoints Documentation](api-reference/overview.md) for details about available endpoints, request/response formats, and examples.

## Development {#development}

For instructions on downloading, changing, or running the code, see [Development Setup](development/setup.md).

This project was mainly built with AI help. To learn how, see [How I Built this Application using AI tools](development/how-i-build-with-ai).

## Credits {#credits}

- First and foremost, thanks to Kenneth Skovhede for creating Duplicati—this amazing backup tool. Thanks also to all the contributors.

  💙 If you find [Duplicati](https://www.duplicati.com) useful, please consider supporting the developer. More details are available on their website or GitHub page.

- Duplicati SVG icon from https://dashboardicons.com/icons/duplicati
- Notify SVG icon from https://dashboardicons.com/icons/ntfy
- GitHub SVG icon from https://github.com/logos

>[!NOTE]
> All product names, trademarks, and registered trademarks are the property of their respective owners. Icons and names are used for identification purposes only and do not imply endorsement.

## License {#license}

The project is licensed under the [Apache License 2.0](LICENSE.md).   

**Copyright © 2025 Waldemar Scudeller Jr.**

