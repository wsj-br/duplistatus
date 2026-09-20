# Cron-Dienstverwaltung {/* #cron-service-management */}

## Cron-Konfiguration abrufen - `/api/cron-config` {/* #get-cron-configuration---apicron-config */}
- **Endpunkt**: `/api/cron-config`
- **Methode**: GET
- **Beschreibung**: Ruft die aktuelle Konfiguration des Cron-Dienstes ab.
- **Authentifizierung**: Erfordert eine gültige Sitzung und ein CSRF-Token
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
  - Gibt die aktuelle Cron-Dienst-Konfiguration zurück
  - Enthält Cron-Ausdruck und Aktiviert-Status
  - Wird für die Cron-Dienstverwaltung verwendet

## Cron-Konfiguration aktualisieren - `/api/cron-config` {/* #update-cron-configuration---apicron-config */}
- **Endpunkt**: `/api/cron-config`
- **Methode**: POST
- **Beschreibung**: Aktualisiert die Konfiguration des Cron-Dienstes.
- **Authentifizierung**: Erfordert eine gültige Sitzung und ein CSRF-Token
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
  - `500`: Cron-Konfiguration konnte nicht aktualisiert werden
- **Hinweise**:
  - Aktualisiert die Cron-Dienst-Konfiguration
  - Validiert das Intervall anhand der zulässigen Optionen
  - Wirkt sich auf die Häufigkeit der Prüfung auf überfällige Sicherungen aus

## Cron-Dienst-Proxy - `/api/cron/*` {/* #cron-service-proxy---apicron */}
- **Endpunkt**: `/api/cron/*`
- **Methode**: GET, POST
- **Beschreibung**: Leitet Anfragen an den Cron-Dienst weiter. Dieser Endpunkt leitet alle Anfragen an den Cron-Dienst weiter, der auf einem separaten Port ausgeführt wird.
- **Authentifizierung**: Erfordert eine gültige Sitzung und ein CSRF-Token. GET ist für authentifizierte Benutzer zulässig; POST (Start/Stop/Trigger/Reload) erfordert einen Administrator.
- **Parameter**:
  - `*`: Beliebiger Pfad, der an den Cron-Dienst weitergeleitet wird
- **Antwort**: Hängt vom aufgerufenen Endpunkt des Cron-Dienstes ab
- **Fehlerantwort** (503):

  ```json
  {
    "error": "Cron service is not running",
    "message": "The cron service is not available. Please start it with: npm run cron:start"
  }
  ```

- **Hinweise**:
  - Leitet Anfragen an den Cron-Dienst auf `127.0.0.1` weiter
  - Leitet `CRON_SERVICE_SECRET` als `X-Cron-Service-Secret` weiter, wenn festgelegt
  - Gibt 503 zurück, wenn der Cron-Dienst nicht verfügbar ist
  - Unterstützt sowohl GET- als auch POST-Methoden
  - Wird für die Cron-Dienstverwaltung über die Weboberfläche verwendet
  - `POST /trigger/daily-summary-dispatch` wird vom Cron-Dienst abgelehnt; verwenden Sie stattdessen `/api/configuration/daily-summary/send`
  - `POST /trigger/database-compact` führt die wöchentliche Bereinigung sofort aus (verwaiste Sicherungen/Server und Benachrichtigungseinstellungen sowie SQLite `VACUUM`)
