# Homepage-Integration (optional) {/* #homepage-integration-optional */}

[Homepage](https://gethomepage.dev/) ist eine anpassbare Dashboard-Anwendung. Fügen Sie **duplistatus** mit Homepage zusammen, indem Sie ein Widget zu Ihrer `services.yaml`-Datei hinzufügen, indem Sie den [Benutzerdefinierten API-Widget-Typ](https://gethomepage.dev/widgets/services/customapi/) verwenden.

## Zusammenfassung-Widget {/* #summary-widget */}

Dieses Widget zeigt die gesamten Backup-Statistiken auf Ihrem Homepage-Dashboard an.

```yaml
- Dashboard:
    icon: mdi-cloud-upload
    href: http://your-server:9666/
    widget:
      type: customapi
      url: http://your-server:9666/api/summary?api_key=YOUR_READ_KEY
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

![Homepage-Zusammenfassung-Widget](/img/homepage-summary.png)

## Letzte Backup-Informationen-Widget {/* #last-backup-information-widget */}

Dieses Widget zeigt die neuesten Backup-Informationen für einen bestimmten Server an.

```yaml
- Test Machine 1:
    icon: mdi-test-tube
    widget:
      type: customapi
      url: http://your-server:9666/api/lastbackup/Test%20Machine%201?api_key=YOUR_READ_KEY
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

![Homepage-Letzte-Backup-Widget](/img/homepage-lastbackup.png)

## Konfigurationshinweise {/* #configuration-notes */}

- Ersetzen Sie `your-server` durch die IP-Adresse oder den Hostnamen Ihres Servers.
- Passen Sie den `refreshInterval` nach Bedarf an (in Millisekunden).
- Ersetzen Sie Leerzeichen in Maschinennamen durch `%20` in der URL (z. B. `Test Machine 1` wird zu `Test%20Machine%201`).
- Die `scale`-Werte wandeln Bytes in lesbarere Einheiten (GB, MB) um.
- Verwenden Sie einen **Lesen**-Bereichs-API-Schlüssel, wenn [API-Schlüssel](settings/api-keys-settings.md) erforderlich sind. Lassen Sie `?api_key=` weg, wenn Schlüssel optional sind.
- Wenn die [externe API-IP-Zulassungsliste](settings/ip-allowlist-settings.md) aktiviert ist, fügen Sie den Homepage-Host hinzu.
