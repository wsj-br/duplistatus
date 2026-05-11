---
translation_last_updated: '2026-05-11T14:27:38.933Z'
source_file_mtime: '2026-05-06T23:18:51.410Z'
source_file_hash: 7c32932a05e97b219f02f1a9f4ad7679394276ba0d2e6bfdc0ae29f85dada19b
translation_language: de
source_file_path: documentation/docs/api-reference/cron-service-apis.md
translation_models:
  - qwen/qwen3-235b-a22b-2507
---
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
- **Authentifizierung**: Gültige Sitzung und CSRF-Token erforderlich
- **Parameter**:
  - `*`: Beliebiger Pfad, der an den Cron-Dienst weitergeleitet wird
- **Antwort**: Hängt vom jeweils aufgerufenen Endpunkt des Cron-Dienstes ab
- **Fehlerantwort** (503):

  ```json
  {
    "error": "Cron service is not running",
    "message": "The cron service is not available. Please start it with: npm run cron:start"
  }
  ```

- **Hinweise**:
  - Leitet Anfragen an den Cron-Dienst weiter
  - Gibt 503 zurück, wenn der Cron-Dienst nicht verfügbar ist
  - Unterstützt sowohl GET- als auch POST-Methoden
  - Wird für die Verwaltung des Cron-Dienstes über die Weboberfläche verwendet
