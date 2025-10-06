---
sidebar_position: 7
---

# Collect Backup Logs

**duplistatus** can retrieve backup logs directly from Duplicati servers to populate the database or restore missing log data. The application automatically skips any duplicate logs that already exist in the database.

<div>

![Collect Backup Logs](../img/screen-collect-backup-logs.png)

## Steps to Collect Backup Logs

### Manual Collection (All Servers)

1.  Click the `Collect Backup Logs` icon on the [Application Toolbar](overview#application-toolbar).
2.  Enter the Duplicati server details:
    - **Hostname**: The hostname or IP address of the Duplicati server.
    - **Port**: The port number used by the Duplicati server (default: `8200`).
    - **Password**: Enter the authentication password if required.
    - **Download collected JSON data**: Enable this option to download the data collected by duplistatus.
3.  Click `Collect Backups`.

### Quick Collection (Version 0.8.x)

**Server Selection:**

- **Pre-configured Servers**: If you have server addresses configured in `Settings → Server Settings`, select from the dropdown list for instant collection.
- **Individual Collection**: Buttons are available in `Settings → Overdue Monitoring` and `Settings → Server Settings` for single-server collection.

**Bulk Collection:**

- **Collect All**: Right-click the `Collect Backup Logs` button in the application toolbar to collect from all configured servers.
- **Bulk Action**: Collection buttons available in settings pages to process multiple servers simultaneously.

### Automatic Configuration Updates

When collecting backup logs, **duplistatus** automatically:

- Updates server URLs and passwords in the database (for first-time collection)
- Extracts and synchronises backup schedule information from Duplicati
- Configures overdue monitoring intervals to match your Duplicati settings
- Preserves existing notification preferences

<br/>

> [!TIP]
> **duplistatus** will automatically detect the best connection protocol (HTTPS or HTTP). It tries HTTPS first (with proper SSL validation), then HTTPS with self-signed certificates, and finally HTTP as a fallback. You no longer need to manually specify the protocol.

<br/>

## How the Collection Process Works

- **duplistatus** automatically detects the best connection protocol and connects to the specified Duplicati server.
- It retrieves backup history and log information.
- Any logs already present in the **duplistatus** database are skipped.
- New data is processed and stored in the local database.
- The URL used (with the detected protocol) will be stored or updated in the local database.
- If selected, will download the JSON data collected. The file name will be in this format: `[serverName]_collected_[Timestamp].json`. The timestamp uses the ISO 8601 date format (YYYY-MM-DDTHH:MM:SS).
- The dashboard updates to reflect the new information.

<br/>

</div>

> [!NOTE]
> Manual collection requires the Duplicati server to be accessible from the **duplistatus** installation. If you encounter issues, please verify the following:
>
> - Confirm that the hostname (or IP address) and port number are correct. You can test this by accessing the Duplicati server UI in your browser (e.g., `http://hostname:port`).
> - Check that **duplistatus** can connect to the Duplicati server. A common problem is DNS name resolution (the system cannot find the server by its hostname).
> - Ensure the password you provided is correct.

<br/><br/>
