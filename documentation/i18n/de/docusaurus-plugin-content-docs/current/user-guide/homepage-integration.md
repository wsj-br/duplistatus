---
translation_last_updated: '2026-02-16T02:21:37.162Z'
source_file_mtime: '2026-02-16T00:30:39.431Z'
source_file_hash: 5b8fdae17a34ff83
translation_language: de
source_file_path: user-guide/homepage-integration.md
---
# Homepage-Integration (Optional) {#homepage-integration-optional}

[Homepage](https://gethomepage.dev/) ist eine anpassbare Dashboard-Anwendung. Um **duplistatus** mit Homepage zu integrieren, fügen Sie ein Widget zu Ihrer `services.yaml`-Datei hinzu, indem Sie den [Benutzerdefinierten API-Widget-Typ](https://gethomepage.dev/widgets/services/customapi/) verwenden.

## Zusammenfassungs-Widget {#summary-widget}

Dieses Widget zeigt die Gesamtsicherungsstatistiken auf Ihrem Homepage-Dashboard an.

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

**Widget-Anzeige:**

![Homepage Summary Widget](/img/homepage-summary.png)

## Letzte Sicherungsinformationen Widget {#last-backup-information-widget}

Dieses Widget zeigt die neuesten Sicherungsinformationen für einen bestimmten Computer an.

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

**Widget-Anzeige:**

![Homepage Last Backup Widget](/img/homepage-lastbackup.png)

## Konfigurationshinweise {#configuration-notes}

- Ersetzen Sie `your-server` durch die IP-Adresse oder den Hostname Ihres Servers.
- Passen Sie das `refreshInterval` nach Bedarf an (in Millisekunden).
- Ersetzen Sie Leerzeichen in Maschinennamen durch `%20` in der URL (z. B. wird `Test Machine 1` zu `Test%20Machine%201`).
- Die `scale`-Werte konvertieren Bytes in besser lesbare Einheiten (GB, MB).
