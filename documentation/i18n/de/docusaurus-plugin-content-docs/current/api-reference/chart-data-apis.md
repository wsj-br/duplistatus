# Diagrammdaten {/* #chart-data */}

## Aggregierte Diagrammdaten abrufen - `/api/chart-data/aggregated` {/* #get-aggregated-chart-data---apichart-dataaggregated */}
- **Endpunkt**: `/api/chart-data/aggregated`
- **Methode**: GET
- **Beschreibung**: Ruft aggregierte Diagrammdaten mit optionaler Filterung nach Zeitbereich ab.
- **Query-Parameter**:
  - `startDate` (optional): Startdatum für die Filterung (ISO-Format)
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
  - Unterstützt Zeitbereichsfilterung mit startDate- und endDate-Parametern
  - Überprüft das Datumsformat vor der Verarbeitung
  - Gibt aggregierte Daten über alle Server zurück

## Server-Diagrammdaten abrufen - `/api/chart-data/server/:serverId` {/* #get-server-chart-data---apichart-dataserverserverid */}
- **Endpunkt**: `/api/chart-data/server/:serverId`
- **Methode**: GET
- **Beschreibung**: Ruft Diagrammdaten für einen bestimmten Server mit optionaler Filterung nach Zeitbereich ab.
- **Parameter**:
  - `serverId`: die Server-ID
- **Abfrageparameter**:
  - `startDate` (optional): Startdatum für Filterung (ISO-Format)
  - `endDate` (optional): Enddatum für Filterung (ISO-Format)
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
  - Unterstützt Zeitbereichsfilterung mit startDate- und endDate-Parametern
  - Überprüft das Datumsformat vor der Verarbeitung
  - Gibt Diagrammdaten für einen bestimmten Server zurück

## Server-Sicherungs-Diagrammdaten abrufen - `/api/chart-data/server/:serverId/backup/:backupName` {/* #get-server-backup-chart-data---apichart-dataserverserveridbackupbackupname */}
- **Endpunkt**: `/api/chart-data/server/:serverId/backup/:backupName`
- **Methode**: GET
- **Beschreibung**: Ruft Diagrammdaten für einen bestimmten Server und eine bestimmte Sicherung mit optionaler Filterung nach Zeitbereich ab.
- **Parameter**:
  - `serverId`: die Server-ID
  - `backupName`: der Sicherungsname (URL-codiert)
- **Abfrageparameter**:
  - `startDate` (optional): Startdatum für Filterung (ISO-Format)
  - `endDate` (optional): Enddatum für Filterung (ISO-Format)
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
  - Unterstützt Zeitbereichsfilterung mit startDate- und endDate-Parametern
  - Überprüft das Datumsformat vor der Verarbeitung
  - Gibt Diagrammdaten für eine spezifische Server- und Sicherungskombination zurück
  - Der Sicherungsname muss URL-codiert sein
