# Homepage Integration (Optional)

[Homepage](https://gethomepage.dev/) is a customisable dashboard application. To integrate **duplistatus** with Homepage, add a widget to your `services.yaml` file using the [Custom API widget type](https://gethomepage.dev/widgets/services/customapi/).

## Summary Widget

This widget displays overall backup statistics on your Homepage dashboard.

```yaml
- Dashboard:
    icon: mdi-cloud-upload
    href: http://your-server:9666/
    widget:
      type: customapi
      url: http://your-server:9666/api/summary
      display: list
      refreshInterval: 60000
      mappings:
        - field: totalServers
          label: Servers
        - field: totalBackups
          label: Backups received
        - field: secondsSinceLastBackup
          label: Last backup
          format: duration
        - field: totalBackupSize
          label: Backed up size
          format: number
          scale: 0.000000001
          suffix: GB
        - field: totalStorageUsed
          label: Storage used
          format: number
          scale: 0.000000001
          suffix: GB
        - field: totalUploadedSize
          label: Uploaded size
          format: number
          scale: 0.000000001
          suffix: GB
```

**Widget Display:**

![Homepage Summary Widget](/img/homepage-summary.png)

## Last Backup Information Widget

This widget displays the latest backup information for a specific machine.

```yaml
- Test Machine 1:
    icon: mdi-test-tube
    widget:
      type: customapi
      url: http://your-server:9666/api/lastbackup/Test%20Machine%201
      display: list
      refreshInterval: 60000
      mappings:
        - field: latest_backup.name
          label: Backup name
        - field: latest_backup.status
          label: Result
        - field: latest_backup.date
          label: Date
          format: relativeDate
        - field: latest_backup.duration
          label: Duration
        - field: latest_backup.uploadedSize
          label: Bytes Uploaded
          format: number
          scale: 0.000001
          suffix: MB
        - field: latest_backup.backup_list_count
          label: Versions
```

**Widget Display:**

![Homepage Last Backup Widget](/img/homepage-lastbackup.png)

## Configuration Notes

- Replace `your-server` with your server's IP address or hostname.
- Adjust the `refreshInterval` as needed (in milliseconds).
- Replace spaces in machine names with `%20` in the URL (e.g., `Test Machine 1` becomes `Test%20Machine%201`).
- The `scale` values convert bytes to more readable units (GB, MB).

