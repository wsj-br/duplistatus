# Homepage Integration (Optional) {#homepage-integration-optional}

[Homepage](https://gethomepage.dev/) ek anukoolit dashboard application hai. Homepage ke saath **duplistatus** ko integrate karne ke liye, `services.yaml` file mein [Custom API widget type](https://gethomepage.dev/widgets/services/customapi/) ka upyog karke ek widget joden.

## Summary Widget {#summary-widget}

Yah widget aapke Homepage dashboard par samagra backup aankade pradarshit karta hai.

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

## Last Backup Information Widget {#last-backup-information-widget}

Yah widget ek vishisht machine ke liye antim backup jaankaaree pradarshit karta hai.

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

## Configuration Notes {#configuration-notes}

- `your-server` ko apne server ke IP pata ya hostname se badalen.
- `refreshInterval` ko avashyakta anusar adjust karen (milliseconds mein).
- URL mein machine naamon mein space ko `%20` se badalen (udaharan ke liye, `Test Machine 1` `Test%20Machine%201` ban jaata hai).
- `scale` maanon bytes ko adhik padhne yogya ikaiyon (GB, MB) mein parivartit karte hain.
