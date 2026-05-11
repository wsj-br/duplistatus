---
translation_last_updated: '2026-05-11T14:27:38.174Z'
source_file_mtime: '2026-05-06T23:18:51.418Z'
source_file_hash: 801b44af6c628cbca7fddeda42e36809574297c98d475cd678e689dddabadc31
translation_language: de
source_file_path: documentation/docs/api-reference/chart-data-apis.md
translation_models:
  - qwen/qwen3-235b-a22b-2507
---
# Diagrammdaten {#chart-data}

## Aggregierte Diagrammdaten abrufen - `/api/chart-data/aggregated` {#get-aggregated-chart-data---apichart-dataaggregated}
- **Endpunkt**: `/api/chart-data/aggregated`
- **Methode**: GET
- **Beschreibung**: Ruft aggregierte Diagrammdaten mit optionaler Filterung nach Zeitraum ab.
- **Abfrageparameter**:
  - `startDate` (optional): Anfangsdatum für die Filterung (ISO-Format)
  - `endDate` (optional): Enddatum für die Filterung (ISO-Format)
- **Antwort**:

  ```json
  [
    {
      "date": "20/03/2024",
      "isoDate": "2024-03-20T10:00:00Z",
      "uploadedSize": 331318892,
      "duration": 38,
      "fileCount": 249426,
      "fileSize": 113395849938,
      "storageSize": 27203688543,
      "backupVersions": 10
    }
  ]
  ```

- **Fehlerantworten**:
  - `400`: Ungültige Datumsparameter
  - `500`: Serverfehler beim Abrufen der Diagrammdaten
- **Hinweise**:
  - Unterstützt die Filterung nach Zeitraum mit den Parametern startDate und endDate
  - Überprüft das Datumsformat vor der Verarbeitung
  - Gibt aggregierte Daten über alle Server zurück

## Server-Diagrammdaten abrufen - `/api/chart-data/server/:serverId` {#get-server-chart-data---apichart-dataserverserverid}
- **Endpunkt**: `/api/chart-data/server/:serverId`
- **Methode**: GET
- **Beschreibung**: Ruft Diagrammdaten für einen bestimmten Server mit optionaler Filterung nach Zeitraum ab.
- **Parameter**:
  - `serverId`: die Serverkennung
- **Abfrageparameter**:
  - `startDate` (optional): Anfangsdatum für die Filterung (ISO-Format)
  - `endDate` (optional): Enddatum für die Filterung (ISO-Format)
- **Antwort**:

  ```json
  [
    {
      "date": "20/03/2024",
      "isoDate": "2024-03-20T10:00:00Z",
      "uploadedSize": 331318892,
      "duration": 38,
      "fileCount": 249426,
      "fileSize": 113395849938,
      "storageSize": 27203688543,
      "backupVersions": 10
    }
  ]
  ```

- **Fehlerantworten**:
  - `400`: Ungültige Datumsparameter
  - `500`: Serverfehler beim Abrufen der Diagrammdaten
- **Hinweise**:
  - Unterstützt die Filterung nach Zeitraum mit den Parametern startDate und endDate
  - Überprüft das Datumsformat vor der Verarbeitung
  - Gibt Diagrammdaten für einen bestimmten Server zurück

## Server-Backup-Diagrammdaten abrufen - `/api/chart-data/server/:serverId/backup/:backupName` {#get-server-backup-chart-data---apichart-dataserverserveridbackupbackupname}
- **Endpunkt**: `/api/chart-data/server/:serverId/backup/:backupName`
- **Methode**: GET
- **Beschreibung**: Ruft Diagrammdaten für einen bestimmten Server und ein bestimmtes Backup mit optionaler Filterung nach Zeitraum ab.
- **Parameter**:
  - `serverId`: die Serverkennung
  - `backupName`: der Sicherungsname (URL-kodiert)
- **Abfrageparameter**:
  - `startDate` (optional): Anfangsdatum für die Filterung (ISO-Format)
  - `endDate` (optional): Enddatum für die Filterung (ISO-Format)
- **Antwort**:

  ```json
  [
    {
      "date": "20/03/2024",
      "isoDate": "2024-03-20T10:00:00Z",
      "uploadedSize": 331318892,
      "duration": 38,
      "fileCount": 249426,
      "fileSize": 113395849938,
      "storageSize": 27203688543,
      "backupVersions": 10
    }
  ]
  ```

- **Fehlerantworten**:
  - `400`: Ungültige Datumsparameter
  - `500`: Serverfehler beim Abrufen der Diagrammdaten
- **Hinweise**:
  - Unterstützt die Filterung nach Zeitraum mit den Parametern startDate und endDate
  - Überprüft das Datumsformat vor der Verarbeitung
  - Gibt Diagrammdaten für eine bestimmte Kombination aus Server und Sicherung zurück
  - Der Sicherungsname muss URL-kodiert sein
