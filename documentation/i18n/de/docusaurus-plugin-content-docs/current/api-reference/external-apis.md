---
translation_last_updated: '2026-04-18T00:01:15.250Z'
source_file_mtime: '2026-03-05T22:33:28.419Z'
source_file_hash: 70fe731fa22f714de94b93df446dee4ca4dc1f5683c22bc93eb52b2e03dd77d4
translation_language: de
source_file_path: documentation/docs/api-reference/external-apis.md
translation_models:
  - qwen/qwen3-235b-a22b-2507
---
# Externe APIs {#external-apis}

Diese Endpunkte sind für die Verwendung durch andere Anwendungen und Integrationen konzipiert, zum Beispiel [Homepage](../user-guide/homepage-integration.md).

## Gesamtübersicht abrufen - `/api/summary` {#get-overall-summary-apisummary}
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
  - `500`: Serverfehler beim Abrufen der Zusammenfassungsdaten
- **Hinweise**:
  - In Version 0.5.x wurde das Feld `totalBackupedSize` durch `totalBackupSize` ersetzt
  - In Version 0.7.x wurde das Feld `totalMachines` durch `totalServers` ersetzt
  - Das Feld `overdueBackupsCount` zeigt die Anzahl der aktuell überfälligen Sicherungen an
  - Das Feld `secondsSinceLastBackup` zeigt die Zeit in Sekunden seit der letzten Sicherung auf allen Servern an
  - Gibt eine Fallback-Antwort mit Nullwerten zurück, wenn das Abrufen der Daten fehlschlägt
  - **Hinweis**: Für die Verwendung im internen Dashboard ziehen Sie `/api/dashboard` in Betracht, das diese Daten sowie zusätzliche Informationen enthält

## Letzte Sicherung abrufen - `/api/lastbackup/:serverId` {#get-latest-backup-apilastbackupserverid}
- **Endpunkt**: `/api/lastbackup/:serverId`
- **Methode**: GET
- **Beschreibung**: Ruft die Informationen zur letzten Sicherung für einen bestimmten Server ab.
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
  - `404`: Server nicht gefunden
  - `500`: Interner Serverfehler
- **Hinweise**:
  - In Version 0.7.x hat sich der Schlüssel des Antwortobjekts von `machine` zu `server` geändert
  - Die Serverkennung kann entweder ID oder Name sein
  - Gibt null für latest_backup zurück, wenn keine Sicherungen existieren
  - Beinhaltet Cache-Control-Header, um Caching zu verhindern

## Letzte Sicherungen abrufen - `/api/lastbackups/:serverId` {#get-latest-backups-apilastbackupsserverid}
- **Endpunkt**: `/api/lastbackups/:serverId`
- **Methode**: GET
- **Beschreibung**: Ruft die Informationen zur letzten Sicherung für alle konfigurierten Sicherungen (z. B. 'Dateien', 'Datenbanken') auf einem bestimmten Server ab.
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
  - `404`: Server nicht gefunden
  - `500`: Interner Serverfehler
- **Hinweise**:
  - In Version 0.7.x hat sich der Schlüssel des Antwortobjekts von `machine` zu `server` geändert und das Feld `backup_types_count` wurde in `backup_jobs_count` umbenannt
  - Die Serverkennung kann entweder ID oder Name sein
  - Gibt die letzte Sicherung für jeden Sicherungsauftrag (backup_name) zurück, den der Server hat
  - Im Gegensatz zu `/api/lastbackup/:serverId`, das nur die jeweils aktuellste Sicherung des Servers zurückgibt (unabhängig vom Sicherungsauftrag)
  - Beinhaltet Cache-Control-Header, um Caching zu verhindern

## Sicherungsdaten hochladen - `/api/upload` {#upload-backup-data-apiupload}
- **Endpunkt**: `/api/upload`
- **Methode**: POST
- **Beschreibung**: Lädt Sicherungsdaten für einen Server hoch. Unterstützt die Erkennung doppelter Sicherungsläufe und sendet Benachrichtigungen.
- **Anfrage-Body**: JSON, gesendet von Duplicati, mit folgenden Optionen:

  ```bash
  --send-http-url=http://my.local.server:9666/api/upload
  --send-http-result-output-format=Json
  --send-http-log-level=Information
  ```

- **Antwort**:

  ```json
  {
    "success": true
  }
  ```

- **Fehlerantworten**:
  - `400`: Erforderliche Felder in den Abschnitten Extra oder Data fehlen oder ungültige MainOperation
  - `409`: Doppelte Sicherungsdaten (wird ignoriert)
  - `500`: Serverfehler bei der Verarbeitung der Sicherungsdaten
- **Hinweise**:
  - Verarbeitet nur Sicherungsvorgänge (MainOperation muss „Backup“ sein)
  - Überprüft erforderliche Felder im Extra-Bereich: machine-id, machine-name, backup-name, backup-id
  - Überprüft erforderliche Felder im Data-Bereich: ParsedResult, BeginTime, Duration
  - Erkennt automatisch doppelte Sicherungsläufe und gibt den Status 409 zurück
  - Sendet Benachrichtigungen nach erfolgreichem Einfügen der Sicherung (falls konfiguriert)
  - Protokolliert Anfragedaten in einer Datei im `data`-Verzeichnis im Stammverzeichnis des Projekts im Entwicklungsmodus zu Debugging-Zwecken
  - Verwendet Transaktionen für Datenkonsistenz
