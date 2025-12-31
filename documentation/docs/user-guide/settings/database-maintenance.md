
# Database Maintenance

Manage your backup data and optimise performance through database maintenance operations.

![Database maintenance](/img/screen-settings-database-maintenance.png)


<br/>

> [!NOTE]
> All statistics on the dashboard, detail pages, and charts are calculated using data from the **duplistatus** database. Deleting old information will impact these calculations.
> 
> If you accidentally delete data, you can restore it using the [Collect Backup Logs](../collect-backup-logs.md) feature.

<br/>

## Data Cleanup Period

Remove outdated backup records to free up storage space and improve system performance.

1.  Navigate to `Settings → Database Maintenance`.
2.  Choose a retention period:
    - **6 months**: Retain records from the last 6 months.
    - **1 year**: Retain records from the last year.
    - **2 years**: Retain records from the last 2 years (default).
    - **Delete all data**: Remove all backup records and servers.
3.  Click `Clear Old Records`.
4.  Confirm the action in the dialogue box.

**Cleanup Effects:**

- Deletes backup records older than the selected period.
- Updates all related statistics and metrics.
- The "Delete all data" option also clears all associated configuration settings.

<br/>

## Delete Backup Job Data

Remove a specific Backup Job (type) data.

1.  Navigate to `Settings → Database Maintenance`.
2.  Select a Backup Job from the dropdown list.
    - the backups will be ordered by server alias or name then the backup name.
3.  Click `Delete Backup Job`.
4.  Confirm the action in the dialogue box.

**Deletion Effects:**

- Permanently deletes all data associated with this Backup Job / Server.
- Cleans up associated configuration settings.
- Updates dashboard statistics accordingly.

<br/>

## Delete Server Data

Remove a specific server and all its associated backup data.

1.  Navigate to `Settings → Database Maintenance`.
2.  Select a server from the dropdown list.
3.  Click `Delete Server Data`.
4.  Confirm the action in the dialogue box.

**Deletion Effects:**

- Permanently deletes the selected server and all its backup records.
- Cleans up associated configuration settings.
- Updates dashboard statistics accordingly.

<br/>

## Merge Duplicate Servers

Detect and merge duplicate servers that have the same name but different IDs. se this feature to consolidate them into a single server entry.  

This can occur when Duplicati's `machine-id` changes after an upgrade or reinstall. Duplicate servers are only shown when they exist. If no duplicates are detected, the section will display a message indicating that all servers have unique names.



1.  Navigate to `Settings → Database Maintenance`.
2.  If duplicate servers are detected, a **Merge Duplicate Servers** section will appear.
3.  Review the list of duplicate server groups:
    - Each group shows servers with the same name but different IDs
    - The **Target Server** (newest by creation date) is highlighted
    - **Old Server IDs** that will be merged are listed separately
4.  Select the server groups you want to merge by checking the checkbox next to each group.
5.  Click `Merge Selected Servers`.
6.  Confirm the action in the dialogue box.


**Merge Process:**

- All old server IDs are merged into the target server (newest by creation date)
- All backup records and configurations are transferred to the target server
- The old server entries are deleted
- Dashboard statistics are updated automatically

> [!IMPORTANT]
> This action cannot be undone. A database backup is recommended before confirming.  

