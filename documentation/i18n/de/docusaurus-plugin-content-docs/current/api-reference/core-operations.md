# Kernoperationen {#core-operations}

## Dashboard-Daten abrufen (konsolidiert) - `/api/dashboard` {#get-dashboard-data-consolidated---apidashboard}
- **Endpoint**: `/api/dashboard`
- **Methode**: GET
- **Beschreibung**: Ruft alle Dashboard-Daten in einer einzigen konsolidierten Antwort ab, einschließlich Server-Zusammenfassungen, Gesamtzusammenfassung und Diagrammdaten.
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
  - Dieser Endpoint konsolidiert den vorherigen `/api/servers-summary`-Endpoint (der entfernt wurde)
  - Das Feld `overallSummary` enthält dieselben Daten wie `/api/summary` (das für externe Anwendungen beibehalten wurde)
  - Das Feld `chartData` enthält dieselben Daten wie `/api/chart-data/aggregated` (das weiterhin für direkten Zugriff existiert)
  - Bietet bessere Leistung, da mehrere API-Aufrufe auf einen einzigen Request reduziert werden
  - Alle Daten werden parallel abgerufen, um optimale Leistung zu erzielen
  - Das Feld `secondsSinceLastBackup` zeigt die Zeit in Sekunden seit der letzten Sicherung über alle Server hinweg an

## Alle Server abrufen - `/api/servers` {#get-all-servers---apiservers}
- **Endpoint**: `/api/servers`
- **Methode**: GET
- **Beschreibung**: Ruft eine Liste aller Server mit ihren grundlegenden Informationen ab. Optional kann auch Backup-Informationen enthalten sein.
- **Authentifizierung**: Erfordert gültige Sitzung und CSRF-Token
- **Abfrageparameter**:
  - `includeBackups` (optional): Auf `true` setzen, um Backup-Informationen für jeden Server einzuschließen
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
  - `401`: Nicht autorisiert – Ungültige Sitzung oder CSRF-Token
  - `500`: Serverfehler beim Abrufen der Server
- **Hinweise**:
  - Gibt Serverinformationen einschließlich Alias- und Notizfelder zurück
  - Wenn `includeBackups=true`, gibt Kombinationen aus Server und Backup mit URLs und Passwortstatus zurück
  - Konsolidiert den vorherigen `/api/servers-with-backups`-Endpoint (der entfernt wurde)
  - Wird für Serverauswahl, Anzeige und Konfigurationszwecke verwendet
  - Enthält das Feld `hasPassword`, um anzuzeigen, ob ein Server ein gespeichertes Passwort hat

## Serverdetails abrufen - `/api/servers/:id` {#get-server-details---apiserversid}
- **Endpoint**: `/api/servers/:id`
- **Methode**: GET
- **Beschreibung**: Ruft Informationen über einen bestimmten Server ab. Kann grundlegende Serverinformationen oder detaillierte Informationen einschließlich Backups und Diagrammdaten zurückgeben.
- **Authentifizierung**: Erfordert gültige Sitzung und CSRF-Token
- **Parameter**:
  - `id`: die Serverkennung
- **Abfrageparameter**:
  - `includeBackups` (optional): Auf `true` setzen, um Backup-Daten einzuschließen
  - `includeChartData` (optional): Auf `true` setzen, um Diagrammdaten einzuschließen
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
  - `401`: Nicht autorisiert – Ungültige Sitzung oder CSRF-Token
  - `404`: Server nicht gefunden
  - `500`: Serverfehler beim Abrufen der Serverdetails
- **Hinweise**:
  - Gibt Basis-Serverinformationen zurück, wenn keine Abfrageparameter angegeben sind
  - Wenn entweder `includeBackups` oder `includeChartData` auf `true` gesetzt ist, werden vollständige Serverdaten einschließlich Backups und chartData zurückgegeben
  - Wird für Servereinstellungen und Detailansichten verwendet

## Server aktualisieren - `/api/servers/:id` {#update-server---apiserversid}
- **Endpoint**: `/api/servers/:id`
- **Methode**: PATCH
- **Beschreibung**: Aktualisiert Serverdetails, einschließlich Alias, Notiz und Server-URL.
- **Authentifizierung**: Erfordert gültige Sitzung und CSRF-Token
- **Parameter**:
  - `id`: die Serverkennung
- **Anfrage-Body**:

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
  - `401`: Nicht autorisiert – Ungültige Sitzung oder CSRF-Token
  - `404`: Server nicht gefunden
  - `500`: Serverfehler während der Aktualisierung
- **Hinweise**:
  - Aktualisiert Server-Alias, Notiz und Server-URL
  - Alle Felder sind optional
  - Leere Zeichenketten sind für alle Felder erlaubt

## Server löschen - `/api/servers/:id` {#delete-server---apiserversid}
- **Endpoint**: `/api/servers/:id`
- **Methode**: DELETE
- **Beschreibung**: Löscht einen Server und alle zugehörigen Sicherungen.
- **Authentifizierung**: Erfordert gültige Sitzung und CSRF-Token
- **Parameter**:
  - `id`: die Server-ID

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
  - `401`: Nicht autorisiert – Ungültige Sitzung oder CSRF-Token
  - `404`: Server nicht gefunden
  - `500`: Serverfehler während des Löschvorgangs
- **Hinweise**:
  - Dieser Vorgang ist unwiderruflich
  - Alle mit dem Server verknüpften Sicherungsdaten werden dauerhaft gelöscht
  - Der Servereintrag selbst wird ebenfalls entfernt
  - Gibt die Anzahl der gelöschten Sicherungen und Server zurück

## Serverdaten mit Überfälligkeits-Informationen abrufen - `/api/detail/:serverId` {#get-server-data-with-overdue-info---apidetailserverid}
- **Endpoint**: `/api/detail/:serverId`
- **Methode**: GET
- **Beschreibung**: Ruft detaillierte Serverinformationen ab, einschließlich des Status für überfällige Sicherungen.
- **Parameter**:
  - `serverId`: die Serverkennung

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
- **Hinweise**:
  - Gibt Serverdaten mit Informationen zu überfälligen Sicherungen zurück
  - Enthält Details und Zeitstempel zu überfälligen Sicherungen
  - Wird für die Verwaltung und Überwachung überfälliger Sicherungen verwendet

## Doppelte Server abrufen - `/api/servers/duplicates` {#get-duplicate-servers---apiserversduplicates}
- **Endpoint**: `/api/servers/duplicates`
- **Methode**: GET
- **Beschreibung**: Ruft eine Liste doppelter Server basierend auf der Maschinen-ID ab. Doppelte Server sind Server, die dieselbe Maschinen-ID teilen, aber als separate Datensätze in der Datenbank gespeichert sind.
- **Authentifizierung**: Erfordert gültige Sitzung, CSRF-Token und Administratorzugriff
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
  - `401`: Nicht autorisiert – Ungültige Sitzung oder CSRF-Token
  - `403`: Administratorzugriff erforderlich
  - `500`: Serverfehler beim Abrufen doppelter Server
- **Hinweise**:
  - Nur Administratoren können auf diesen Endpunkt zugreifen
  - Gibt Gruppen von Servern zurück, die dieselbe Maschinen-ID teilen
  - Jede Gruppe enthält alle Server mit derselben Maschinen-ID
  - Wird zum Identifizieren und Zusammenführen doppelter Serverdatensätze verwendet
  - Enthält Serverdetails und Sicherungsanzahlen für jedes Duplikat

## Server zusammenführen - `/api/servers/merge` {#merge-servers---apiserversmerge}
- **Endpoint**: `/api/servers/merge`
- **Methode**: POST
- **Beschreibung**: Führt mehrere Server mit einem Zielserver zusammen. Alle Sicherungen der Quellserver werden auf den Zielserver übertragen, und die Quellserver werden gelöscht.
- **Authentifizierung**: Erfordert gültige Sitzung, CSRF-Token und Administratorzugriff
- **Anforderungstext**:

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
    "message": "Successfully merged 2 server(s) into target server"
  }
  ```

- **Fehlerantworten**:
  - `400`: Ungültiger Anforderungstext, fehlende erforderliche Felder oder Zielserver ist in der Liste der zusammenzuführenden Server enthalten
  - `401`: Nicht autorisiert – Ungültige Sitzung oder CSRF-Token
  - `403`: Administratorzugriff erforderlich
  - `500`: Serverfehler während des Zusammenführungsvorgangs
- **Hinweise**:
  - Nur Administratoren können Zusammenführungsvorgänge durchführen
  - Der Zielserver darf nicht in der Liste der zusammenzuführenden Server enthalten sein
  - Alle Sicherungen der Quellserver werden auf den Zielserver übertragen
  - Quellserver werden nach erfolgreicher Zusammenführung gelöscht
  - Dieser Vorgang ist unwiderruflich
  - Wird zum Konsolidieren doppelter Serverdatensätze verwendet
  - Überprüft, ob oldServerIds ein nicht-leeres Array ist
  - Überprüft, ob targetServerId angegeben ist und ein String ist
