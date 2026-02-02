

# Collect Backup Logs {#collect-backup-logs}

**duplistatus** can retrieve backup logs directly from Duplicati servers to populate the database or restore missing log data. The application automatically skips any duplicate logs that already exist in the database.


## Steps to Collect Backup Logs {#steps-to-collect-backup-logs}


### Manual Collection {#manual-collection}

1.  Click the <IconButton icon="lucide:download" /> `Collect Backup Logs` icon on the [Application Toolbar](overview#application-toolbar).

![Collect Backup Logs Popup](../assets/screen-collect-button-popup.png)

2.  Select Server

    If you have server addresses configured in `Settings → Server Settings`, select one from the dropdown list for instant collection. If you don't have any servers configured, you can enter the Duplicati server details manually.

3.  Enter the Duplicati server details:
    - **Hostname**: The hostname or IP address of the Duplicati server. You can enter multiple hostnames separated by commas, for example `192.168.1.23,someserver.local,192.168.1.89`
    - **Port**: The port number used by the Duplicati server (default: `8200`).
    - **Password**: Enter the authentication password if required.
    - **Download collected JSON data**: Enable this option to download the data collected by duplistatus.
4.  Click `Collect Backups`.

***Notes:***
- If you enter multiple hostnames, the collection will be performed using the same port and password for all servers.
- **duplistatus** will automatically detect the best connection protocol (HTTPS or HTTP). It tries HTTPS first (with proper SSL validation), then HTTPS with self-signed certificates, and finally HTTP as a fallback.


:::tip
<IconButton icon="lucide:download" /> buttons are available in `Settings → Overdue Monitoring` and `Settings → Server Settings` for single-server collection.
:::



<br/>

### Bulk Collection {#bulk-collection}

_Right-click_ the <IconButton icon="lucide:download" /> `Collect Backup Logs` button in the application toolbar to collect from all configured servers.

![Collect All Right-Click Menu](../assets/screen-collect-button-right-click-popup.png)

:::tip
You can also use the <IconButton icon="lucide:import" label="Collect All"/> button in the `Settings → Overdue Monitoring` and `Settings → Server Settings` pages to collect from all configured servers.
:::


## How the Collection Process Works {#how-the-collection-process-works}

- **duplistatus** automatically detects the best connection protocol and connects to the specified Duplicati server.
- It retrieves backup history, log information, and backup settings (for overdue monitoring).
- Any logs already present in the **duplistatus** database are skipped.
- New data is processed and stored in the local database.
- The URL used (with the detected protocol) will be stored or updated in the local database.
- If the download option is selected, it will download the JSON data collected. The file name will be in this format: `[serverName]_collected_[Timestamp].json`. The timestamp uses the ISO 8601 date format (YYYY-MM-DDTHH:MM:SS).
- The dashboard updates to reflect the new information.

## Troubleshooting Collection Issues {#troubleshooting-collection-issues}

Backup log collection requires the Duplicati server to be accessible from the **duplistatus** installation. If you encounter issues, please verify the following:

- Confirm that the hostname (or IP address) and port number are correct. You can test this by accessing the Duplicati server UI in your browser (e.g., `http://hostname:port`).
- Check that **duplistatus** can connect to the Duplicati server. A common problem is DNS name resolution (the system cannot find the server by its hostname). See more in [troubleshooting section](troubleshooting.md#collect-backup-logs-not-working).
- Ensure the password you provided is correct.

