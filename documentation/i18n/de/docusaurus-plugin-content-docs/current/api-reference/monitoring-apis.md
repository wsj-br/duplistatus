---
translation_last_updated: '2026-05-06T23:19:50.423Z'
source_file_mtime: '2026-05-06T23:18:51.410Z'
source_file_hash: eb18cd75959282575195e73b0368d4eecd23bf9684c9c5915cea3d8f6c360fce
translation_language: de
source_file_path: documentation/docs/api-reference/monitoring-apis.md
translation_models:
  - qwen/qwen3-235b-a22b-2507
---
# Überwachung und Zustand {#monitoring-health}

## Health Check - `/api/health` {#health-check---apihealth}
- **Endpoint**: `/api/health`
- **Methode**: GET
- **Beschreibung**: Überprüft den Status der Anwendung und der Datenbank.
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
  - Gibt Status 503 für gestörte Systeme oder Fehler bei vorbereiteten Anweisungen zurück
  - Enthält das Feld `preparedStatementsError`, wenn vorbereitete Anweisungen fehlschlagen
  - Enthält das Feld `initializationError`, wenn die Datenbankinitialisierung fehlschlägt
  - Enthält `connectionHealthError` und `connectionDetails`, wenn Verbindungs-Statusprüfungen fehlschlagen
  - Stack-Trace wird nur im Entwicklungsmodus eingefügt
  - Prüft grundlegende Datenbankverbindung, vorbereitete Anweisungen, Initialisierungsstatus und Verbindungsintegrität
  - Bietet umfassende Zustandsdiagnosen zur Fehlerbehebung
