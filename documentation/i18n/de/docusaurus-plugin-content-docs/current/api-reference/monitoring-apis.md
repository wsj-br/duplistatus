# Überwachung & Gesundheit {/* #monitoring--health */}

## Gesundheitsprüfung - `/api/health` {/* #health-check---apihealth */}
- **Endpunkt**: `/api/health`
- **Methode**: GET
- **Beschreibung**: Geringfügige Lebensprüfung für die Anwendung und die SQLite-Verbindung. Docker `HEALTHCHECK` und die Einstiegsschleife verwenden diese URL auf localhost.
- **Antwort** (gesund):

  ```json
  {
    "status": "healthy",
    "database": "connected",
    "basicConnection": true,
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
    "database": "unavailable",
    "basicConnection": false,
    "initializationStatus": "complete",
    "initializationComplete": true,
    "connectionHealth": false,
    "connectionHealthError": "Database connection test failed",
    "timestamp": "2024-03-20T10:00:00Z"
  }
  ```

- **Fehlerantwort** (503):

  ```json
  {
    "status": "unhealthy",
    "error": "Database connection failed",
    "message": "Connection timeout",
    "timestamp": "2024-03-20T10:00:00Z"
  }
  ```

- **Hinweise**:
  - Gibt 200 zurück, wenn die Initialisierung abgeschlossen ist und `SELECT 1` erfolgreich ist
  - Gibt 503 zurück, wenn die Initialisierung oder die Verbindungsprüfung fehlschlägt
  - Listet keine Tabellennamen auf oder führt Dashboard-Abfragen aus
  - Erfordert niemals einen API-Schlüssel
  - Wenn eine der IP-Zulassungslisten aktiviert ist, muss die Client-IP eine Schleifenadresse sein oder in der Admin- oder externen CIDR-Liste aufgeführt sein (`403` `IP_NOT_ALLOWED` sonst)
  - Nicht-Schleifenadressen-Clients werden drosselnd behandelt (`429` `PROBE_RATE_LIMITED`, 30/Minute und 120/Stunde). Schleifenadressen (`127.0.0.1`, `::1`) werden nie gedrosselt

## Verbindungsprüfung - `/api/ping` {/* #connectivity-probe---apiping */}
- **Endpunkt**: `/api/ping`
- **Methode**: GET
- **Beschreibung**: Kleine `{ "ok": true }` Antwort, die vom Dashboard-Verbindungsprüfung verwendet wird (alle 30 Sekunden).
- **Antwort**:

  ```json
  {
    "ok": true
  }
  ```

- **Hinweise**:
  - Erfordert niemals einen API-Schlüssel oder ein Sitzungs-Cookie
  - Gleiche Zulassungslisten-Vereinigung und Schleifenregeln wie `/api/health`
  - Nicht-Schleifenadressen-Clients werden drosselnd behandelt (`429` `PROBE_RATE_LIMITED`, 60/Minute und 600/Stunde)
