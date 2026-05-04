---
translation_last_updated: '2026-04-18T00:00:53.261Z'
source_file_mtime: '2026-03-05T22:33:28.419Z'
source_file_hash: add8fe98b40a55c51fdd7af09ba7c836d54475b8283bbdebecbe17f2c6beb071
translation_language: de
source_file_path: documentation/docs/api-reference/cron-service-apis.md
translation_models:
  - qwen/qwen3-235b-a22b-2507
---
# Cron-Dienstverwaltung {#cron-service-management}

## Cron-Konfiguration abrufen - `/api/cron-config` {#get-cron-configuration-apicron-config}
- **Endpoint**: `/api/cron-config`
- **Methode**: GET
- **Beschreibung**: Ruft die aktuelle Konfiguration des Cron-Dienstes ab.
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

## Cron-Konfiguration aktualisieren - `/api/cron-config` {#update-cron-configuration-apicron-config}
- **Endpoint**: `/api/cron-config`
- **Methode**: POST
- **Beschreibung**: Aktualisiert die Konfiguration des Cron-Dienstes.
- **Authentifizierung**: Erfordert gültige Sitzung und CSRF-Token
- **Anfrage-Body**:

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

## Cron-Dienst-Proxy - `/api/cron/*` {#cron-service-proxy-apicron}
- **Endpoint**: `/api/cron/*`
- **Methode**: GET, POST
- **Beschreibung**: Leitet Anfragen an den Cron-Dienst weiter. Dieser Endpunkt leitet alle Anfragen an den auf einem separaten Port laufenden Cron-Dienst weiter.
- **Authentifizierung**: Erfordert gültige Sitzung und CSRF-Token
- **Parameter**:
  - `*`: Jeder Pfad, der an den Cron-Dienst weitergeleitet wird
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
