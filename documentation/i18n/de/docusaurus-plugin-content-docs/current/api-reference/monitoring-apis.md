---
translation_last_updated: '2026-04-18T00:01:20.497Z'
source_file_mtime: '2026-03-05T22:33:28.419Z'
source_file_hash: ccd50e5fe2f6be70227afc5ce46c99b7ce52a87df5184098f4d303683bd9e6c6
translation_language: de
source_file_path: documentation/docs/api-reference/monitoring-apis.md
translation_models:
  - qwen/qwen3-235b-a22b-2507
---
# Überwachung und Zustand {#monitoring-health}

## Zustandsüberprüfung - `/api/health` {#health-check-apihealth}
- **Endpunkt**: `/api/health`
- **Methode**: GET
- **Beschreibung**: Überprüft den Zustand der Anwendung und der Datenbank.
- **Antwort** (gesund):

  ```json
  {
    "status": "healthy",
    "database": "connected",
    "basicConnection": true,
    "tablesFound": 2,
    "tables": [
      "servers",
      "backups"
    ],
    "preparedStatements": true,
    "initializationStatus": "complete",
    "initializationComplete": true,
    "connectionHealth": true,
    "timestamp": "2024-03-20T10:00:00Z"
  }
  ```

- **Antwort** (beeinträchtigt):

  ```json
  {
    "status": "degraded",
    "database": "connected",
    "basicConnection": true,
    "tablesFound": 2,
    "tables": [
      "servers",
      "backups"
    ],
    "preparedStatements": false,
    "preparedStatementsError": "Prepared statement error details",
    "initializationStatus": "complete",
    "initializationComplete": true,
    "connectionHealth": false,
    "connectionHealthError": "Connection health check failed",
    "connectionDetails": {
      "additional": "diagnostic information"
    },
    "timestamp": "2024-03-20T10:00:00Z"
  }
  ```

- **Fehlerantwort** (503):

  ```json
  {
    "status": "unhealthy",
    "error": "Database connection failed",
    "message": "Connection timeout",
    "stack": "Error: Connection timeout\n    at...",
    "timestamp": "2024-03-20T10:00:00Z"
  }
  ```

- **Hinweise**: 
  - Gibt Status 200 für funktionierende Systeme zurück
  - Gibt Status 503 für fehlerhafte Systeme oder Fehler bei vorbereiteten Anweisungen zurück
  - Enthält das Feld `preparedStatementsError`, wenn vorbereitete Anweisungen fehlschlagen
  - Enthält das Feld `initializationError`, wenn die Datenbankinitialisierung fehlschlägt
  - Enthält `connectionHealthError` und `connectionDetails`, wenn Verbindungs-Statusprüfungen fehlschlagen
  - Stack-Trace wird nur im Entwicklungsmodus eingefügt
  - Überprüft grundlegende Datenbankverbindung, vorbereitete Anweisungen, Initialisierungsstatus und Verbindungszustand
  - Bietet umfassende Zustandsdiagnosen zur Fehlerbehebung
