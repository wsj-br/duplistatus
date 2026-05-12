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
