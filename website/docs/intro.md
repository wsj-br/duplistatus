---
sidebar_position: 1
---

# Welcome to duplistatus



**duplistatus** - Another [Duplicati](https://github.com/duplicati/duplicati) Dashboard



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

<br/>


>[!IMPORTANT]
> If you are upgrading from version 0.6.x or earlier, your database will be automatically 
> [migrated](#migrating-to-version-0727) to the new schema during the upgrade process.
> 
> 🚨 **API Response Changes in version 0.7.27**
> 
>   If you have external integrations, scripts, or applications that consume the API endpoints `/api/summary`, `/api/lastbackup`
>   and `/api/lastbackups`, you **MUST** update them immediately as [the JSON response structure has changed.](#api-response-changes) 
> 
> For more information see [RELEASE NOTES 0.7.27](release-notes/0.7.27.md)



<br/>

## Screenshots

### Dashboard

![dashboard](img/screen-dashboard.png)

### Backup History

![server-detail](img/screen-server.png)

### Backup Details

![backup-detail](img/screen-backup.png)

### Overdue Backups

![overdue backups](img/screen-overdue-tooltip.png)


### Overdue notifications on your phone

![ntfy overdue message](img/screen-overdue-notification.png)

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

## API Reference

For detailed information about all available API endpoints, request/response formats, and integration examples, please refer to the [API Endpoints Documentation](api-reference/overview.md).

<br/>

## Development

Detailed instructions on how to download the source code, make changes, debug, and run in development mode can be found in the [DEVELOPMENT.md](development/setup.md) file.
This application was developed almost entirely using AI tools. The step-by-step process and tools used are described in [HOW-I-BUILD-WITH-AI.md](development/how-i-build-with-ai).

<br/>


## Migrating to Version 0.7.27

Your database will automatically update when you start the new version. This process is safe and preserves all your existing data.

<br/>

### The Migration Process

The system automatically performs the following steps:

- **Creates a backup** of your current database. The backup file is named `backups-copy-YYYY-MM-DDTHH-MM-SS.db`.
- **Runs the migration**, changes the schema to the next version, and copies all existing data to the new schema.
- **Preserves all your existing data** while improving the database structure.

<br/>

### Monitoring the Migration

To monitor progress, check the Docker logs by running:

```bash
docker logs <container-name>
```

Look for these messages to confirm a successful migration:

- `"Found X pending migrations"`
- `"Running consolidated migration X.0..."`
- `"Migration X.0 completed successfully"`
- `"Database backup created: /path/to/backups-copy-YYYY-MM-DDTHH-MM-SS.db"`
- `"All migrations completed successfully"`

<br/>

### Rolling Back (If Needed)

If you encounter issues, you can restore your database by following these steps:

1. Stop the `duplistatus` container.
2. Replace the current database file `backups.db` with the backup file.
   - The default location is `/var/lib/docker/volumes/duplistatus_data/_data/`
   - To find the exact path, run `docker volume inspect duplistatus_data` and check the Mountpoint field
   - Verify the correct path based on your current configuration and installation
3. Install the previous version of `duplistatus` container image.
4. Restart the container.
5. Please report the issue in the [duplistatus project](https://github.com/wsj-br/duplistatus/issues) on GitHub, including the Docker logs.



### API Response Changes

**IMPORTANT:** If you have external integrations, scripts, or applications that consume the following API endpoints, you **MUST** update them immediately as the JSON response structure has changed:

* **`/api/summary`** - The `totalMachines` field has been renamed to `totalServers` ([API Documentation](api-reference/external-apis.md#get-overall-summary---apisummary)
* **`/api/lastbackup/{serverId}`** - The response object key has changed from `machine` to `server` ([API Documentation](api-reference/external-apis.md#get-latest-backup---apilastbackupserverid))
* **`/api/lastbackups/{serverId}`** - The response object key has changed from `machine` to `server`, and the `backup_types_count` field has been renamed to `backup_jobs_count` ([API Documentation](api-reference/external-apis.md#get-latest-backups---apilastbackupsserverid))


<br/>

> [!Warning]
> **Impact:** While the `server_id` to `machine_id` (or name) parameter change won't affect users directly, the 
> **new JSON response structure will break any external applications** that parse these API responses. 
> Please review and update your integrations accordingly.




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

