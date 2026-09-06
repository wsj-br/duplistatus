# Cron-Dienstverwaltung {#cron-service-management}

## Cron-Konfiguration abrufen - `/api/cron-config` {#get-cron-configuration---apicron-config}
- **Endpoint**: `/api/cron-config`
- **Methode**: GET
- **Beschreibung**: Ruft die aktuelle Cron-Dienstkonfiguration ab.
- **Authentifizierung**: Erfordert gültige Sitzung und CSRF-Token
- **Antwort**:

  ```json
  {
    "cronExpression": "*/20 * * * *",
    "enabled": true
  }
  ```

- **Fehlerantworten**:
  - `500`: Abrufen der Cron-Konfiguration fehlgeschlagen
- **Hinweise**:
  - Gibt die aktuelle Konfiguration des Cron-Dienstes zurück
  - Enthält Cron-Ausdruck und Aktivierungsstatus
  - Wird für die Verwaltung des Cron-Dienstes verwendet

## Cron-Konfiguration aktualisieren - `/api/cron-config` {#update-cron-configuration---apicron-config}
- **Endpoint**: `/api/cron-config`
- **Methode**: POST
- **Beschreibung**: Aktualisiert die Cron-Dienstkonfiguration.
- **Authentifizierung**: Erfordert gültige Sitzung und CSRF-Token
- **Anforderungstext**:

  ```json
  {
    "interval": "20min"
  }
  ```

- **Antwort**:

  ```json
  {
    "success": true
  }
  ```

- **Verfügbare Intervalle**: `"disabled"`, `"1min"`, `"5min"`, `"10min"`, `"15min"`, `"20min"`, `"30min"`, `"1hour"`, `"2hours"`
- **Fehlerantworten**:
  - `400`: Intervall ist erforderlich
  - `500`: Aktualisierung der Cron-Konfiguration fehlgeschlagen
- **Hinweise**:
  - Aktualisiert die Konfiguration des Cron-Dienstes
  - Überprüft das Intervall anhand der zulässigen Optionen
  - Beeinflusst die Häufigkeit der Überprüfung auf verspätete Sicherungen

## Cron-Dienst-Proxy - `/api/cron/*` {#cron-service-proxy---apicron}
- **Endpoint**: `/api/cron/*`
- **Methode**: GET, POST
- **Beschreibung**: Leitet Anfragen an den Cron-Dienst weiter. Dieser Endpoint leitet alle Anfragen an den Cron-Dienst weiter, der auf einem separaten Port läuft.
- **Authentifizierung**: Erfordert eine gültige Sitzung und ein CSRF-Token. GET ist für authentifizierte Benutzer erlaubt; POST (start/stop/trigger/reload) erfordert einen Administrator.
- **Parameter**:
  - `*`: Jeder Pfad, der an den Cron-Dienst weitergeleitet wird
- **Antwort**: Hängt vom zugreifenden Cron-Dienst-Endpunkt ab
- **Fehlerantwort** (503):

  ```json
  {
    "error": "Cron service is not running",
    "message": "The cron service is not available. Please start it with: npm run cron:start"
  }
  ```

- **Hinweise**:
  - Proxies Anfragen an den Cron-Dienst auf `127.0.0.1`
  - Leitet `CRON_SERVICE_SECRET` als `X-Cron-Service-Secret` weiter, wenn gesetzt
  - Gibt 503 zurück, wenn der Cron-Dienst nicht verfügbar ist
  - Unterstützt sowohl GET- als auch POST-Methoden
  - Wird für die Verwaltung des Cron-Dienstes über die Webschnittstelle verwendet
  - `POST /trigger/daily-summary-dispatch` wird vom Cron-Dienst abgelehnt; stattdessen `/api/configuration/daily-summary/send` verwenden
