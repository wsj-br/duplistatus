

# Welcome to duplistatus



**duplistatus** - Another [Duplicati](https://github.com/duplicati/duplicati) Dashboard



## Features

- **Easy Installation**: Run inside a container with images available on Docker Hub and GitHub Container Registry
- **Dashboard**: Displays the backup status for all monitored servers 
- **Backup History**: Detailed view of backup history for each server
- **Data Visualisation**: Interactive charts showing backup metrics over time and other statistical information
- **Log Collection**: Collects backup logs directly from Duplicati servers via HTTP/HTTPS
- **Notification System**: [ntfy](https://github.com/binwiederhier/ntfy) and e-mail (SMTP) integration for backup notifications and overdue backup alerts
- **Overdue Backup Monitoring**: Automated checking and alerting for overdue scheduled backups, with Duplicati server configuration sync when collecting logs.
- **Backup Version Display**: Shows the list of backup versions available in the backend
- **Duplicati Server**: Includes feature to open the Duplicati server web UI from **duplistatus** 
- **Server Settings**: Users can choose an alias for the server and include a note with a description 
- **API Access**: RESTful API endpoints to expose backup status to [Homepage](https://gethomepage.dev/) or any other tool that supports RESTful APIs

<br/>


>[!IMPORTANT]
> If you are upgrading from an earlier version, your database will be automatically 
> [migrated](migration/version_upgrade.md) to the new schema during the upgrade process.
> 

<br/>


## Installation

The application can be deployed using Docker, [Portainer Stacks](https://docs.portainer.io/user/docker/stacks), or Podman. 
See details in the [Installation Guide](getting-started/installation.md).

<br/>

## Duplicati Servers Configuration (Required)

Once your **duplistatus** server is up and running, you need to configure your **Duplicati** servers to 
send backup logs to **duplistatus**, as outlined in the [Duplicati Configuration](getting-started/duplicati-server-configuration.md) 
section of the Installation Guide. Without this configuration, the dashboard will not function properly.

<br/>

## User Guide

See the [User Guide](user-guide/overview.md) for detailed instructions on how to configure and use **duplistatus**, including setup, features, and troubleshooting.

<br/>

## Screenshots

### Dashboard

![dashboard]/img/screen-dashboard.png)

### Backup History

![server-detail]/img/screen-server.png)

### Backup Details

![backup-detail]/img/screen-backup.png)

### Overdue Backups

![overdue backups]/img/screen-overdue-tooltip.png)


### Overdue notifications on your phone

![ntfy overdue message]/img/screen-overdue-notification.png)

<br/>



## API Reference

For detailed information about all available API endpoints, request/response formats, and integration examples, please refer to the [API Endpoints Documentation](api-reference/overview.md).

<br/>

## Development

Detailed instructions on how to download the source code, make changes, debug, and run in development mode can be found in the [DEVELOPMENT.md](development/setup.md) file.
This application was developed almost entirely using AI tools. The step-by-step process and tools used are described in [HOW-I-BUILD-WITH-AI.md](development/how-i-build-with-ai).

<br/>


<br/>

## Credits

- First and foremost, thanks to Kenneth Skovhede for creating Duplicati, this amazing backup tool. Thanks also to all the contributors.

  💙 If you find Duplicati (https://www.duplicati.com) useful, please consider supporting the developer. More details are available on their website or GitHub page.

- Duplicati SVG icon from https://dashboardicons.com/icons/duplicati
- Notify SVG icon from https://dashboardicons.com/icons/ntfy
- Github SVG icon from https://github.com/logos

<br/>

>[!NOTE]
> All product names, trademarks, and registered trademarks are the property of their respective owners. Icons and names are used for identification purposes only and do not imply endorsement.

<br/>

## License

The project is licensed under the [Apache License 2.0](LICENSE).   

**Copyright © 2025 Waldemar Scudeller Jr.**

