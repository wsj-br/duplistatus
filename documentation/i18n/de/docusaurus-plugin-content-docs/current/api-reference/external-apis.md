# Externe APIs {#external-apis}

Diese Endpunkte sind für die Verwendung durch andere Anwendungen und Integrationen vorgesehen, zum Beispiel [Homepage](../user-guide/homepage-integration.md). Sie sind CSRF-frei und verwenden keine Sitzungscookies.

Die Authentifizierung ist optional und standardmäßig deaktiviert. Wenn **API-Schlüssel erforderlich** in [API-Schlüssel](../user-guide/settings/api-keys-settings.md) aktiviert ist, senden Sie den Schlüssel als `?api_key=`, `X-Api-Key` oder `Authorization: Bearer`. Upload-Schlüssel funktionieren nur auf `POST /api/upload`. Lese-Schlüssel funktionieren nur auf `/api/summary` und `/api/lastbackup*`. Abfragezeichenfolgen-Schlüssel erscheinen in den Zugriffsprotokollen des Reverse-Proxys.

Eine [IP-Zulassungsliste](../user-guide/settings/ip-allowlist-settings.md) kann diese Routen auch einschränken. `/api/health` und `/api/ping` bleiben offen.

## Gesamtübersicht abrufen - `/api/summary` {#get-overall-summary---apisummary}
- **Endpunkt**: `/api/summary`
- **Methode**: GET
- **Beschreibung**: Ruft eine Zusammenfassung aller Backup-Operationen auf allen Servern ab.
- **Antwort**:

  ```json
  {
    "totalServers": 3,
    "totalBackupsRuns": 9,
    "totalBackups": 9,
    "totalUploadedSize": 2397229507,
    "totalStorageUsed": 43346796938,
    "totalBackupSize": 126089687807,
    "overdueBackupsCount": 2,
    "secondsSinceLastBackup": 7200
  }
  ```

- **Fehlerantworten**:
  - `401`: Fehlender oder ungültiger API-Schlüssel, wenn Schlüssel erforderlich sind
  - `403`: Der Schlüsselbereich ist nicht `read`, oder die Client-IP ist nicht auf der externen Zulassungsliste
  - `429`: Lese-API-Ratenlimit überschritten
  - `500`: Serverfehler beim Abrufen der Zusammenfassung
- **Notizen**:
  - In Version 0.5.x wurde das Feld `totalBackupedSize` durch `totalBackupSize` ersetzt
  - In Version 0.7.x wurde das Feld `totalMachines` durch `totalServers` ersetzt
  - Das Feld `overdueBackupsCount` zeigt die Anzahl der derzeit überfälligen Backups an
  - Das Feld `secondsSinceLastBackup` zeigt die Zeit in Sekunden seit der letzten Sicherung auf allen Servern an
  - Gibt eine Rückfallantwort mit Nullen zurück, wenn das Abrufen der Daten fehlschlägt
  - **Notiz**: Für die interne Dashboard-Nutzung sollten Sie `/api/dashboard` verwenden, das diese Daten plus zusätzliche Informationen enthält

## Letztes Backup abrufen - `/api/lastbackup/:serverId` {#get-latest-backup---apilastbackupserverid}
- **Endpunkt**: `/api/lastbackup/:serverId`
- **Methode**: GET
- **Beschreibung**: Ruft die neuesten Backup-Informationen für einen bestimmten Server ab.
- **Parameter**:
  - `serverId`: die Serverkennung (ID oder Name)

:::note
Die Serverkennung muss URL-kodiert sein.
:::

- **Antwort**:

  ```json
  {
    "server": {
      "id": "unique-server-id",
      "name": "Server Name",
      "backup_name": "Backup Name",
      "backup_id": "backup-id",
      "created_at": "2024-03-20T10:00:00Z"
    },
    "latest_backup": {
      "id": "backup-id",
      "server_id": "unique-server-id",
      "name": "Backup Name",
      "date": "2024-03-20T10:00:00Z",
      "status": "Success",
      "warnings": 0,
      "errors": 0,
      "messages": 150,
      "fileCount": 249426,
      "fileSize": 113395849938,
      "uploadedSize": 331318892,
      "duration": "00:38:31",
      "duration_seconds": 2311.6018052,
      "durationInMinutes": 38.52669675333333,
      "knownFileSize": 27203688543,
      "backup_list_count": 10,
      "messages_array": ["message1", "message2"],
      "warnings_array": ["warning1"],
      "errors_array": [],
      "available_backups": ["v1", "v2", "v3"]
    },
    "status": 200
  }
  ```

- **Fehlerantworten**:
  - `401`: Fehlende oder ungültige API-Schlüssel, wenn Schlüssel erforderlich sind
  - `403`: Der Schlüsselbereich ist nicht `read`, oder die Client-IP ist nicht auf der externen Zulassungsliste
  - `404`: Server nicht gefunden
  - `429`: Lese-API-Ratenlimit überschritten
  - `500`: Interner Serverfehler
- **Notizen**:
  - In Version 0.7.x wurde der Schlüssel des Antwortobjekts von `machine` zu `server` geändert
  - Die Server-ID kann entweder die ID oder der Name sein
  - Gibt null für latest_backup zurück, wenn keine Backups existieren
  - Enthält Cache-Steuerungsheader, um das Caching zu verhindern

## Letzte Backups abrufen - `/api/lastbackups/:serverId` {#get-latest-backups---apilastbackupsserverid}
- **Endpunkt**: `/api/lastbackups/:serverId`
- **Methode**: GET
- **Beschreibung**: Ruft die neuesten Backup-Informationen für alle konfigurierten Backups (z. B. 'Dateien', 'Datenbanken') auf einem bestimmten Server ab.
- **Parameter**:
  - `serverId`: die Serverkennung (ID oder Name)

:::note
Die Serverkennung muss URL-kodiert sein.
:::

- **Antwort**:

  ```json
  {
    "server": {
      "id": "unique-server-id",
      "name": "Server Name",
      "backup_name": "Default Backup",
      "backup_id": "backup-id",
      "created_at": "2024-03-20T10:00:00Z"
    },
    "latest_backups": [
      {
        "id": "backup1",
        "server_id": "unique-server-id",
        "name": "Files",
        "date": "2024-03-20T10:00:00Z",
        "status": "Success",
        "warnings": 0,
        "errors": 0,
        "messages": 150,
        "fileCount": 249426,
        "fileSize": 113395849938,
        "uploadedSize": 331318892,
        "duration": "00:38:31",
        "duration_seconds": 2311.6018052,
        "durationInMinutes": 38.52669675333333,
        "knownFileSize": 27203688543,
        "backup_list_count": 10,
        "messages_array": "[\"message1\", \"message2\"]",
        "warnings_array": "[\"warning1\"]",
        "errors_array": "[]",
        "available_backups": ["v1", "v2", "v3"]
      },
      {
        "id": "backup2",
        "server_id": "unique-server-id",
        "name": "Databases",
        "date": "2024-03-20T11:00:00Z",
        "status": "Success",
        "warnings": 1,
        "errors": 0,
        "messages": 75,
        "fileCount": 125000,
        "fileSize": 56789012345,
        "uploadedSize": 123456789,
        "duration": "00:25:15",
        "duration_seconds": 1515.1234567,
        "durationInMinutes": 25.25205761166667,
        "knownFileSize": 12345678901,
        "backup_list_count": 5,
        "messages_array": ["message1"],
        "warnings_array": ["warning1"],
        "errors_array": [],
        "available_backups": ["v1", "v2"]
      }
    ],
    "backup_jobs_count": 2,
    "backup_names": ["Files", "Databases"],
    "status": 200
  }
  ```

- **Fehlerantworten**:
  - `401`: Fehlende oder ungültige API-Schlüssel, wenn Schlüssel erforderlich sind
  - `403`: Der Schlüsselbereich ist nicht `read`, oder die Client-IP ist nicht auf der externen Zulassungsliste
  - `404`: Server nicht gefunden
  - `429`: Lese-API-Ratenlimit überschritten
  - `500`: Interner Serverfehler
- **Notizen**:
  - In Version 0.7.x wurde der Schlüssel des Antwortobjekts von `machine` zu `server` geändert, und das Feld `backup_types_count` wurde in `backup_jobs_count` umbenannt
  - Die Server-ID kann entweder die ID oder der Name sein
  - Gibt das neueste Backup für jeden Sicherungsauftrag (backup_name) zurück, den der Server hat
  - Im Gegensatz zu `/api/lastbackup/:serverId`, das nur das neueste Backup des Servers zurückgibt (unabhängig vom Sicherungsauftrag)
  - Enthält Cache-Steuerungsheader, um das Caching zu verhindern

## Backup-Daten hochladen - `/api/upload` {#upload-backup-data---apiupload}
- **Endpunkt**: `/api/upload`
- **Methode**: POST
- **Beschreibung**: Lädt Backup-Operationsdaten für einen Server hoch. Unterstützt die Erkennung doppelter Backup-Läufe und sendet Benachrichtigungen.
- **Anforderungstext**: JSON, gesendet von Duplicati, mit folgenden Optionen:

  ```bash
  --send-http-json-urls=http://my.local.server:9666/api/upload?api_key=YOUR_UPLOAD_KEY
  --send-http-log-level=Information
  --send-http-max-log-lines=500
```

Bei Duplicati in Versionen älter als 2.0.9.106 verwenden Sie `--send-http-url` mit `--send-http-result-output-format=Json`. Siehe [Duplicati Server-Konfiguration](../installation/duplicati-server-configuration.md).

- **Antwort**:

  ```json
  {
    "success": true
  }
  ```

- **Fehlerantworten**:
  - `400`: Fehlende erforderliche Felder in den Abschnitten Extra oder Data, oder ungültige MainOperation
  - `401`: Fehlender oder ungültiger API-Schlüssel, wenn Schlüssel erforderlich sind
  - `403`: Der Schlüsselbereich ist nicht `upload`, oder die Client-IP ist nicht auf der externen Zulassungsliste
  - `409`: Doppelte Sicherungsdaten (ignoriert)
  - `413`: Die Anforderungskörpergröße überschreitet das konfigurierte Upload-Größenlimit (Standard 5 MB)
  - `429`: Upload- oder Authentifizierungsfehler-Ratenlimit überschritten (`Retry-After` ist gesetzt)
  - `500`: Serverfehler beim Verarbeiten der Sicherungsdaten
- **Hinweise**:
  - Verarbeitet nur Sicherungsvorgänge (MainOperation muss „Backup“ sein)
  - Überprüft erforderliche Felder im Extra-Abschnitt: machine-id, machine-name, backup-name, backup-id
  - Überprüft erforderliche Felder im Data-Abschnitt: ParsedResult, BeginTime, Duration
  - Erkennt automatisch doppelte Sicherungsläufe und gibt den Status 409 zurück
  - Sendet Benachrichtigungen nach erfolgreichem Einfügen der Sicherung (falls konfiguriert)
  - Protokolliert Anforderungsdaten in einer Datei im `data`-Verzeichnis im Projektstamm im Entwicklungsmodus zur Fehlerbehebung
  - Verwendet eine Transaktion für Datenkonsistenz
