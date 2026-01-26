# Homepage-Integration (optional) {#homepage-integration-optional}

[Homepage](https://gethomepage.dev/) ist eine anpassbare Dashboard-Anwendung. Um **duplistatus** mit Homepage zu integrieren, fügen Sie ein Widget zu Ihrer `services.yaml`-Datei hinzu, indem Sie den [Benutzerdefinierten API-Widget-Typ](https://gethomepage.dev/widgets/services/customapi/) verwenden.

## Zusammenfassungs-Widget {#summary-widget}

Dieses Widget zeigt Gesamtsicherungsstatistiken auf Ihrem Homepage-Dashboard an.

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
          label: Server
        - field: totalBackups
          label: Sicherungen empfangen
        - field: secondsSinceLastBackup
          label: Letzte Sicherung
          format: duration
        - field: totalBackupSize
          label: Gesicherte Größe
          format: number
          scale: 0.000000001
          suffix: GB
        - field: totalStorageUsed
          label: Speicherplatz verwendet
          format: number
          scale: 0.000000001
          suffix: GB
        - field: totalUploadedSize
          label: Hochgeladene Größe
          format: number
          scale: 0.000000001
          suffix: GB
```

**Widget-Anzeige:**

![Homepage Summary Widget](/img/homepage-summary.png)

## Letzte Sicherungsinformationen-Widget {#last-backup-information-widget}

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
          label: Sicherungsname
        - field: latest_backup.status
          label: Ergebnis
        - field: latest_backup.date
          label: Datum
          format: relativeDate
        - field: latest_backup.duration
          label: Dauer
        - field: latest_backup.uploadedSize
          label: Bytes hochgeladen
          format: number
          scale: 0.000001
          suffix: MB
        - field: latest_backup.backup_list_count
          label: Versionen
```

**Widget-Anzeige:**

![Homepage Last Backup Widget](/img/homepage-lastbackup.png)

## Konfigurationshinweise {#configuration-notes}

- Ersetzen Sie `your-server` durch die IP-Adresse oder den Hostname Ihres Servers.
- Passen Sie das `refreshInterval` nach Bedarf an (in Millisekunden).
- Ersetzen Sie Leerzeichen in Computernamen durch `%20` in der URL (z. B. `Test Machine 1` wird zu `Test%20Machine%201`).
- Die `scale`-Werte konvertieren Bytes in besser lesbare Einheiten (GB, MB).

