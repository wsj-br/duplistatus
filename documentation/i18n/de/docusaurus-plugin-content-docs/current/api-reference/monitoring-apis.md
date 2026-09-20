# Überwachung und Integrität {/* #monitoring--health */}

## Health-Check – `/api/health` {/* #health-check---apihealth */}
- **Endpunkt**: `/api/health`
- **Methode**: GET
- **Beschreibung**: Ressourcenoptimierter Liveness-Check für die Anwendung und die SQLite-Verbindung. Docker `HEALTHCHECK` und die Entrypoint-Warteschleife verwenden diese URL auf localhost.
- **Antwort** (fehlerfrei):

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
  - Gibt 200 zurück, wenn die Initialisierung abgeschlossen ist und `SELECT 1` erfolgreich verläuft
  - Gibt 503 zurück, wenn die Initialisierung oder die Verbindungsprüfung fehlschlägt
  - Listet keine Tabellennamen auf und führt keine Dashboard-Abfragen aus
  - Erfordert niemals einen API-Schlüssel
  - Wenn eine der beiden IP-Zulassungslisten aktiviert ist, muss die Client-IP die Loopback-Adresse sein oder in der Admin- bzw. externen CIDR-Liste aufgeführt sein (andernfalls `403` `IP_NOT_ALLOWED`)
  - Für Nicht-Loopback-Clients gilt ein Rate-Limit (`429` `PROBE_RATE_LIMITED`, 30/Minute und 120/Stunde). Loopback (`127.0.0.1`, `::1`) wird nie gedrosselt

## Konnektivitätsprüfung – `/api/ping` {/* #connectivity-probe---apiping */}
- **Endpunkt**: `/api/ping`
- **Methode**: GET
- **Beschreibung**: Sehr kleine `{ "ok": true }`-Antwort, die für die Konnektivitätsprüfung des Dashboards verwendet wird (alle 30 Sekunden).
- **Antwort**:

  ```json
  {
    "ok": true
  }
  ```

- **Hinweise**:
  - Erfordert niemals einen API-Schlüssel oder ein Sitzungscookie
  - Gleiche Zulassungslisten-Vereinigung und Loopback-Regeln wie bei `/api/health`
  - Für Nicht-Loopback-Clients gilt ein Rate-Limit (`429` `PROBE_RATE_LIMITED`, 60/Minute und 600/Stunde)
