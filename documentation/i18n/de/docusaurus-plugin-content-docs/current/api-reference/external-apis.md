# Externe APIs {/* #external-apis */}

Diese Endpunkte sind für die Verwendung durch andere Anwendungen und Integrationen konzipiert, beispielsweise [Homepage](../user-guide/homepage-integration.md). Sie sind CSRF-exempt und verwenden keine Session-Cookies.

Die Authentifizierung ist optional und standardmäßig deaktiviert. Obwohl Schlüssel optional sind, können Clients den Schlüssel weglassen oder einen senden: Ein gültiger Schlüssel mit passendem Bereich wird akzeptiert und aufgezeichnet; ein ungültiger Schlüssel wird ignoriert und die Anfrage wird trotzdem verarbeitet. Wenn **API-Schlüssel erforderlich** in [API-Schlüssel](../user-guide/settings/api-keys-settings.md) aktiviert ist, senden Sie den Schlüssel als `?api_key=`, `X-Api-Key` oder `Authorization: Bearer`. Upload-Schlüssel funktionieren nur auf `POST /api/upload`. Lese-Schlüssel funktionieren nur auf `/api/summary` und `/api/lastbackup*`. Query-String-Schlüssel erscheinen in Reverse-Proxy-Zugriffslogs.

Eine [IP-Zulassungsliste](../user-guide/settings/ip-allowlist-settings.md) kann diese Routen auch einschränken. `/api/health` und `/api/ping` bleiben öffentlich, während beide Listen deaktiviert sind; wenn eine Liste aktiviert ist, akzeptieren sie Loopback und CIDRs von der Admin- oder externen Liste, und Clients außerhalb des Loopback werden ratenbegrenzt.

## Gesamtzusammenfassung abrufen - `/api/summary` {/* #get-overall-summary---apisummary */}
- **Endpunkt**: `/api/summary`
- **Methode**: GET
- **Beschreibung**: Ruft eine Zusammenfassung aller Sicherungsvorgänge auf allen Servern ab.
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
  - `403`: Der Schlüsselbereich ist nicht `read`, oder die Client-IP befindet sich nicht auf der externen Zulassungsliste
  - `429`: Ratenlimit für Lese-API überschritten
  - `500`: Serverfehler beim Abrufen von Zusammenfassungsdaten
- **Notizen**:
  - In Version 0.5.x wurde das Feld `totalBackupedSize` durch `totalBackupSize` ersetzt
  - In Version 0.7.x wurde das Feld `totalMachines` durch `totalServers` ersetzt
  - Das Feld `overdueBackupsCount` zeigt die Anzahl der derzeit überfälligen Sicherungen
  - Das Feld `secondsSinceLastBackup` zeigt die Zeit in Sekunden seit der letzten Sicherung auf allen Servern
  - Gibt Fallback-Antwort mit Nullen zurück, wenn das Abrufen von Daten fehlschlägt
  - **Notiz**: Für die interne Dashboard-Nutzung sollten Sie `/api/dashboard` verwenden, das diese Daten plus zusätzliche Informationen enthält

## Letzte Sicherung abrufen - `/api/lastbackup/:serverId` {/* #get-latest-backup---apilastbackupserverid */}
- **Endpunkt**: `/api/lastbackup/:serverId`
- **Methode**: GET
- **Beschreibung**: Ruft die neuesten Sicherungsinformationen für einen bestimmten Server ab.
- **Parameter**:
  - `serverId`: die Server-ID (ID oder Name)

:::note
Die Server-ID muss URL-codiert sein.
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
  - `401`: Fehlender oder ungültiger API-Schlüssel, wenn Schlüssel erforderlich sind
  - `403`: Der Schlüsselbereich ist nicht `read`, oder die Client-IP befindet sich nicht auf der externen Zulassungsliste
  - `404`: Server nicht gefunden
  - `429`: Ratenlimit für Lese-API überschritten
  - `500`: Interner Serverfehler
- **Notizen**:
  - In Version 0.7.x wurde der Schlüssel des Antwortobjekts von `machine` zu `server` geändert
  - Server-ID kann entweder ID oder Name sein
  - Gibt null für latest_backup zurück, wenn keine Sicherungen vorhanden sind
  - Enthält Cache-Control-Header, um Caching zu verhindern

## Letzte Sicherungen abrufen - `/api/lastbackups/:serverId` {/* #get-latest-backups---apilastbackupsserverid */}
- **Endpunkt**: `/api/lastbackups/:serverId`
- **Methode**: GET
- **Beschreibung**: Ruft die neuesten Sicherungsinformationen für alle konfigurierten Sicherungen (z. B. 'Dateien', 'Datenbanken') auf einem bestimmten Server ab.
- **Parameter**:
  - `serverId`: die Server-ID (ID oder Name)

:::note
Die Server-ID muss URL-codiert sein.
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
  - `401`: Fehlender oder ungültiger API-Schlüssel, wenn Schlüssel erforderlich sind
  - `403`: Der Schlüsselbereich ist nicht `read`, oder die Client-IP befindet sich nicht auf der externen Zulassungsliste
  - `404`: Server nicht gefunden
  - `429`: Ratenlimit für Lese-API überschritten
  - `500`: Interner Serverfehler
- **Notizen**:
  - In Version 0.7.x wurde der Schlüssel des Antwortobjekts von `machine` zu `server` geändert, und das Feld `backup_types_count` wurde in `backup_jobs_count` umbenannt
  - Server-ID kann entweder ID oder Name sein
  - Gibt die neueste Sicherung für jeden Sicherungsauftrag (backup_name) zurück, den der Server hat
  - Im Gegensatz zu `/api/lastbackup/:serverId`, das nur die einzelne neueste Sicherung des Servers zurückgibt (unabhängig vom Sicherungsauftrag)
  - Enthält Cache-Control-Header, um Caching zu verhindern

## Sicherungsdaten hochladen - `/api/upload` {/* #upload-backup-data---apiupload */}
- **Endpoint**: `/api/upload`
- **Method**: POST
- **Beschreibung**: Lädt Sicherungsvorgangsdaten für einen Server hoch. Unterstützt die Erkennung doppelter Sicherungsläufe und sendet Benachrichtigungen.
- **Request Body**: JSON gesendet von Duplicati mit den folgenden Optionen:

  ```bash
  --send-http-json-urls=http://my.local.server:9666/api/upload?api_key=YOUR_UPLOAD_KEY
  --send-http-log-level=Information
  --send-http-max-log-lines=500
```

Verwenden Sie bei Duplicati älter als 2.0.9.106 `--send-http-url` mit `--send-http-result-output-format=Json`. Siehe [Duplicati Server-Konfiguration](../installation/duplicati-server-configuration.md).

- **Antwort**:

  ```json
  {
    "success": true
  }
  ```

- **Fehlerantworten**:
  - `400`: Erforderliche Felder in den Abschnitten Extra oder Data fehlen oder MainOperation ist ungültig
  - `401`: API-Schlüssel fehlt oder ist ungültig, wenn Schlüssel erforderlich sind
  - `403`: Schlüsselbereich ist nicht `upload`, oder die Client-IP befindet sich nicht auf der externen Zulassungsliste
  - `409`: Doppelte Sicherungsdaten (ignoriert)
  - `413`: Request Body überschreitet das konfigurierte Hochladegrößenlimit (Standard 5 MB)
  - `429`: Hochladen oder Authentifizierungsfehler-Ratenlimit überschritten (`Retry-After` ist gesetzt)
  - `500`: Serverfehler beim Verarbeiten von Sicherungsdaten
- **Hinweise**:
  - Verarbeitet nur Sicherungsvorgänge (MainOperation muss "Backup" sein)
  - Validiert erforderliche Felder im Abschnitt Extra: machine-id, machine-name, backup-name, backup-id
  - Validiert erforderliche Felder im Abschnitt Data: ParsedResult, BeginTime, Duration
  - Erkennt automatisch doppelte Sicherungsläufe und gibt Status 409 zurück
  - Sendet Benachrichtigungen nach erfolgreichem Einfügen von Sicherungen (falls konfiguriert)
  - Protokolliert Anfragedaten in eine Datei im Verzeichnis `data` im Stammverzeichnis des Projekts im Entwicklungsmodus zum Debuggen
  - Verwendet Transaktion für Datenkonsistenz
