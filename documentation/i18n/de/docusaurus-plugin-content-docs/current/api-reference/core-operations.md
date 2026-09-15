# Kernoperationen {/* #core-operations */}

## Dashboard-Daten abrufen (konsolidiert) - `/api/dashboard` {/* #get-dashboard-data-consolidated---apidashboard */}
- **Endpunkt**: `/api/dashboard`
- **Methode**: GET
- **Beschreibung**: Ruft alle Dashboard-Daten in einer einzigen konsolidierten Antwort ab, einschließlich Server-Zusammenfassungen, Gesamtzusammenfassung und Chart-Daten.
- **Antwort**:

  ```json
  {
    "serversSummary": [
      {
        "id": "server-id",
        "name": "Server Name",
        "lastBackupDate": "2024-03-20T10:00:00Z",
        "lastBackupStatus": "Success",
        "lastBackupDuration": "00:38:31",
        "lastBackupListCount": 10,
        "lastBackupName": "Backup Name",
        "lastBackupId": "backup-id",
        "backupCount": 15,
        "totalWarnings": 5,
        "totalErrors": 0,
        "availableBackups": ["v1", "v2", "v3"],
        "isBackupOverdue": false,
        "notificationEvent": "all",
        "expectedBackupDate": "2024-03-21T10:00:00Z",
        "expectedBackupElapsed": "2 hours ago",
        "lastOverdueCheck": "2024-03-20T12:00:00Z",
        "lastNotificationSent": "N/A"
      }
    ],
    "overallSummary": {
      "totalServers": 3,
      "totalBackups": 9,
      "totalUploadedSize": 2397229507,
      "totalStorageUsed": 43346796938,
      "totalBackupSize": 126089687807,
      "overdueBackupsCount": 2,
      "secondsSinceLastBackup": 7200
    },
    "chartData": [
      {
        "date": "20/03/2024",
        "isoDate": "2024-03-20T10:00:00Z",
        "uploadedSize": 1024000,
        "duration": 45,
        "fileCount": 1500,
        "fileSize": 2048000,
        "storageSize": 3072000,
        "backupVersions": 5
      }
    ]
  }
  ```

- **Fehlerantworten**:
  - `500`: Serverfehler beim Abrufen der Dashboard-Daten
- **Hinweise**:
  - Dieser Endpunkt konsolidiert den vorherigen `/api/servers-summary` Endpunkt (der entfernt wurde)
  - Das `overallSummary` Feld enthält die gleichen Daten wie `/api/summary` (das für externe Anwendungen beibehalten wird)
  - Das `chartData` Feld enthält die gleichen Daten wie `/api/chart-data/aggregated` (das weiterhin für direkten Zugriff existiert)
  - Bietet bessere Leistung durch Reduzierung mehrerer API-Aufrufe auf einen einzigen Request
  - Alle Daten werden parallel abgerufen für optimale Leistung
  - Das `secondsSinceLastBackup` Feld zeigt die Zeit in Sekunden seit der letzten Sicherung aller Server an

## Alle Server abrufen - `/api/servers` {/* #get-all-servers---apiservers */}
- **Endpunkt**: `/api/servers`
- **Methode**: GET
- **Beschreibung**: Ruft eine Liste aller Server mit ihren grundlegenden Informationen ab. Optional können Backup-Informationen enthalten sein.
- **Authentifizierung**: Erfordert eine gültige Sitzung und CSRF-Token
- **Abfrageparameter**:
  - `includeBackups` (optional): Setzen Sie auf `true`, um Backup-Informationen für jeden Server einzubeziehen
- **Antwort** (ohne Parameter):

  ```json
  [
    {
      "id": "server-id",
      "name": "Server Name",
      "alias": "Server Alias",
      "note": "Additional notes about the server"
    }
  ]
  ```

- **Antwort** (mit `includeBackups=true`):

  ```json
  [
    {
      "id": "server-id",
      "name": "Server Name",
      "backupName": "Backup Name",
      "server_url": "http://localhost:8200",
      "alias": "Server Alias",
      "note": "Additional notes about the server",
      "hasPassword": true
    }
  ]
  ```

- **Fehlerantworten**:
  - `401`: Unautorisiert - Ungültige Sitzung oder CSRF-Token
  - `500`: Serverfehler beim Abrufen der Server
- **Hinweise**:
  - Gibt Serverinformationen einschließlich Alias- und Notizfeldern zurück
  - Bei `includeBackups=true` werden Server-Backup-Kombinationen mit URLs und Passwortstatus zurückgegeben
  - Konsolidiert den vorherigen `/api/servers-with-backups` Endpunkt (der entfernt wurde)
  - Wird für die Serverauswahl, Anzeige und Konfiguration verwendet
  - Enthält das `hasPassword` Feld, um anzuzeigen, ob der Server ein gespeichertes Passwort hat

## Serverdetails abrufen - `/api/servers/:id` {/* #get-server-details---apiserversid */}
- **Endpunkt**: `/api/servers/:id`
- **Methode**: GET
- **Beschreibung**: Ruft Informationen zu einem bestimmten Server ab. Kann grundlegende Serverinformationen oder detaillierte Informationen einschließlich Backups und Chart-Daten zurückgeben.
- **Authentifizierung**: Erfordert eine gültige Sitzung und CSRF-Token
- **Parameter**:
  - `id`: der Server-Identifikator
- **Abfrageparameter**:
  - `includeBackups` (optional): Setzen Sie auf `true`, um Backup-Daten einzubeziehen
  - `includeChartData` (optional): Setzen Sie auf `true`, um Chart-Daten einzubeziehen
- **Antwort** (ohne Parameter):

  ```json
  {
    "id": "server-id",
    "name": "Server Name",
    "alias": "Server Alias",
    "note": "Additional notes about the server",
    "server_url": "http://localhost:8200"
  }
  ```

- **Antwort** (mit Parametern):

  ```json
  {
    "id": "server-id",
    "name": "Server Name",
    "alias": "Server Alias",
    "note": "Additional notes about the server",
    "server_url": "http://localhost:8200",
    "backups": [
      { ... }
    ],
    "chartData": [
      { ... }
    ]
  }
  ```

- **Fehlerantworten**:
  - `401`: Unautorisiert - Ungültige Sitzung oder CSRF-Token
  - `404`: Server nicht gefunden
  - `500`: Serverfehler beim Abrufen der Serverdetails
- **Hinweise**:
  - Gibt grundlegende Serverinformationen zurück, wenn keine Abfrageparameter angegeben sind
  - Das Setzen von `includeBackups` oder `includeChartData` auf `true` gibt vollständige Serverdaten einschließlich Backups und chartData zurück
  - Wird für Servereinstellungen und Detailansichten verwendet

## Server aktualisieren - `/api/servers/:id` {/* #update-server---apiserversid */}
- **Endpunkt**: `/api/servers/:id`
- **Methode**: PATCH
- **Beschreibung**: Aktualisiert Serverdetails einschließlich Alias, Notiz und Server-URL.
- **Authentifizierung**: Erfordert eine gültige Sitzung und CSRF-Token
- **Parameter**:
  - `id`: der Server-Identifikator
- **Anfragekörper**:

  ```json
  {
    "server_url": "http://localhost:8200",
    "alias": "Server Alias",
    "note": "Additional notes about the server"
  }
  ```

- **Antwort**:

  ```json
  {
    "message": "Server updated successfully",
    "serverId": "server-id",
    "server_url": "http://localhost:8200",
    "alias": "Server Alias",
    "note": "Additional notes about the server"
  }
  ```

- **Fehlerantworten**:
  - `401`: Unautorisiert - Ungültige Sitzung oder CSRF-Token
  - `404`: Server nicht gefunden
  - `500`: Serverfehler während des Updates
- **Notizen**:
  - Aktualisiert Server-Alias, Notiz und Server-URL
  - Alle Felder sind optional
  - Leere Zeichenfolgen sind für alle Felder erlaubt

## Server löschen - `/api/servers/:id` {/* #delete-server---apiserversid */}
- **Endpunkt**: `/api/servers/:id`
- **Methode**: DELETE
- **Beschreibung**: Löscht einen Server und alle zugehörigen Sicherungen.
- **Authentifizierung**: Erfordert eine gültige Sitzung und ein CSRF-Token
- **Parameter**:
  - `id`: der Server-Identifikator

- **Antwort**:

  ```json
  {
    "message": "Successfully deleted server and 15 backups",
    "status": 200,
    "changes": {
      "backupChanges": 15,
      "serverChanges": 1
    }
  }
  ```

- **Fehlerantworten**:
  - `401`: Unautorisiert - Ungültige Sitzung oder CSRF-Token
  - `404`: Server nicht gefunden
  - `500`: Serverfehler beim Löschen
- **Notizen**: 
  - Diese Operation ist irreversibel
  - Alle Sicherungsdaten, die mit dem Server verbunden sind, werden dauerhaft gelöscht
  - Der Server-Datensatz selbst wird auch entfernt
  - Gibt die Anzahl der gelöschten Sicherungen und Server zurück

## Serverdaten mit Informationen zu überfälligen Sicherungen abrufen - `/api/detail/:serverId` {/* #get-server-data-with-overdue-info---apidetailserverid */}
- **Endpunkt**: `/api/detail/:serverId`
- **Methode**: GET
- **Beschreibung**: Ruft detaillierte Serverinformationen ab, einschließlich des Status der überfälligen Sicherung.
- **Parameter**:
  - `serverId`: der Server-Identifikator

- **Antwort**:

  ```json
  {
    "server": {
      "id": "server-id",
      "name": "Server Name",
      "backups": [...]
    },
    "overdueBackups": [
      {
        "serverName": "Server Name",
        "backupName": "Backup Name",
        "lastBackupDate": "2024-03-20T10:00:00Z",
        "lastNotificationSent": "2024-03-20T12:00:00Z",
        "notificationEvent": "all",
        "expectedBackupDate": "2024-03-21T10:00:00Z",
        "expectedBackupElapsed": "2 hours ago"
      }
    ],
    "lastOverdueCheck": "2024-03-20T12:00:00Z"
  }
  ```

- **Fehlerantworten**:
  - `404`: Server nicht gefunden
  - `500`: Serverfehler beim Abrufen der Serverdetails
- **Notizen**:
  - Gibt Serverdaten mit Informationen zu überfälligen Sicherungen zurück
  - Enthält Details zu überfälligen Sicherungen und Zeitstempel
  - Wird für die Verwaltung und Überwachung von überfälligen Sicherungen verwendet

## Doppelte Server abrufen - `/api/servers/duplicates` {/* #get-duplicate-servers---apiserversduplicates */}
- **Endpunkt**: `/api/servers/duplicates`
- **Methode**: GET
- **Beschreibung**: Ruft eine Liste von doppelten Servern ab, basierend auf der Maschinen-ID. Doppelte Server sind Server, die dieselbe Maschinen-ID teilen, aber als separate Datensätze in der Datenbank gespeichert sind.
- **Authentifizierung**: Erfordert eine gültige Sitzung, ein CSRF-Token und Administratorzugriff
- **Antwort**:

  ```json
  [
    {
      "machineId": "machine-id-123",
      "servers": [
        {
          "id": "server-id-1",
          "name": "Server Name 1",
          "alias": "Server Alias 1",
          "server_url": "http://localhost:8200",
          "backupCount": 5
        },
        {
          "id": "server-id-2",
          "name": "Server Name 2",
          "alias": "Server Alias 2",
          "server_url": "http://localhost:8200",
          "backupCount": 3
        }
      ]
    }
  ]
  ```

- **Fehlerantworten**:
  - `401`: Unautorisiert - Ungültige Sitzung oder CSRF-Token
  - `403`: Administratorzugriff erforderlich
  - `500`: Serverfehler beim Abrufen doppelter Server
- **Notizen**:
  - Nur Administratoren können auf diesen Endpunkt zugreifen
  - Gibt Gruppen von Servern zurück, die dieselbe Maschinen-ID teilen
  - Jede Gruppe enthält alle Server mit der gleichen Maschinen-ID
  - Wird für die Identifizierung und Zusammenführung doppelter Serverdatensätze verwendet
  - Enthält Serverdetails und Sicherungszahlen für jeden doppelten Server

## Server zusammenführen - `/api/servers/merge` {/* #merge-servers---apiserversmerge */}
- **Endpunkt**: `/api/servers/merge`
- **Methode**: POST
- **Beschreibung**: Führt mehrere Server in einen Zielserver zusammen. Alle Sicherungen von den Quellservern werden auf den Zielserver übertragen, und die Quellserver werden gelöscht.
- **Authentifizierung**: Erfordert eine gültige Sitzung, ein CSRF-Token und Administratorzugriff
- **Anfragekörper**:

  ```json
  {
    "oldServerIds": ["server-id-1", "server-id-2"],
    "targetServerId": "server-id-3"
  }
  ```

- **Antwort**:

  ```json
  {
    "success": true,
    "message": "Successfully merged 2 server(s) into target server",
    "backupIdsNormalized": 1
  }
  ```

- **Fehlerantworten**:
  - `400`: Ungültiger Anfragekörper, fehlende erforderliche Felder oder Zielserver ist in der Liste der zu zusammenführenden Server
  - `401`: Unautorisiert - Ungültige Sitzung oder CSRF-Token
  - `403`: Administratorzugriff erforderlich
  - `500`: Serverfehler während des Zusammenführungsvorgangs
- **Notizen**:
  - Nur Administratoren können Zusammenführungsoperationen durchführen
  - Der Zielserver darf nicht in der Liste der zu zusammenführenden Server enthalten sein
  - Alle Sicherungen von den Quellservern werden auf den Zielserver übertragen
  - Doppelte `backup_id`-Werte für denselben `backup_name` auf dem zusammengeführten Server werden auf die ID aus der neuesten Sicherungszeile normalisiert
  - Quellserver werden nach erfolgreichem Zusammenführen gelöscht
  - Diese Operation ist irreversibel
  - Wird für die Konsolidierung doppelter Serverdatensätze verwendet
  - Überprüft, ob oldServerIds ein nicht-leeres Array ist
  - Überprüft, ob targetServerId bereitgestellt und eine Zeichenfolge ist
