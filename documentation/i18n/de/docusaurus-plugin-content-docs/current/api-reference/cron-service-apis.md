# Cron-Dienstverwaltung {/* #cron-service-management */}

## Cron-Konfiguration abrufen - `/api/cron-config` {/* #get-cron-configuration---apicron-config */}
- **Endpunkt**: `/api/cron-config`
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
  - `500`: Cron-Konfiguration konnte nicht abgerufen werden
- **Hinweise**:
  - Gibt die aktuelle Cron-Dienstkonfiguration zurück
  - Enthält den Cron-Ausdruck und den Aktivierungsstatus
  - Wird für die Cron-Dienstverwaltung verwendet

## Cron-Konfiguration aktualisieren - `/api/cron-config` {/* #update-cron-configuration---apicron-config */}
- **Endpunkt**: `/api/cron-config`
- **Methode**: POST
- **Beschreibung**: Aktualisiert die Cron-Dienstkonfiguration.
- **Authentifizierung**: Erfordert eine gültige Sitzung und ein CSRF-Token
- **Anfragekörper**:

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
  - `500`: Cron-Konfiguration konnte nicht aktualisiert werden
- **Hinweise**:
  - Aktualisiert die Cron-Dienstkonfiguration
  - Validiert das Intervall gegen die erlaubten Optionen
  - Beeinflusst die Häufigkeit der Überprüfung überfälliger Sicherungen

## Cron-Dienst-Proxy - `/api/cron/*` {/* #cron-service-proxy---apicron */}
- **Endpunkt**: `/api/cron/*`
- **Methode**: GET, POST
- **Beschreibung**: Leitet Anfragen an den Cron-Dienst weiter. Dieser Endpunkt leitet alle Anfragen an den Cron-Dienst weiter, der auf einem separaten Port läuft.
- **Authentifizierung**: Erfordert eine gültige Sitzung und ein CSRF-Token. GET ist für authentifizierte Benutzer erlaubt; POST (Start/Stop/Trigger/Reload) erfordert einen Administrator.
- **Parameter**:
  - `*`: Jeder Pfad, der an den Cron-Dienst weitergeleitet wird
- **Antwort**: Hängt vom Zugriff auf den Cron-Dienst-Endpunkt ab
- **Fehlerantwort** (503):

  ```json
  {
    "error": "Cron service is not running",
    "message": "The cron service is not available. Please start it with: npm run cron:start"
  }
  ```

- **Hinweise**:
  - Leitet Anfragen an den Cron-Dienst auf `127.0.0.1` weiter
  - Leitet `CRON_SERVICE_SECRET` als `X-Cron-Service-Secret` weiter, wenn gesetzt
  - Gibt 503 zurück, wenn der Cron-Dienst nicht verfügbar ist
  - Unterstützt sowohl GET- als auch POST-Methoden
  - Wird für die Cron-Dienstverwaltung über die Weboberfläche verwendet
  - `POST /trigger/daily-summary-dispatch` wird vom Cron-Dienst abgelehnt; stattdessen `/api/configuration/daily-summary/send` verwenden
  - `POST /trigger/database-compact` führt die wöchentliche Komprimierung sofort durch (verwaiste Sicherungen/Server und Benachrichtigungseinstellungen sowie SQLite `VACUUM`)
