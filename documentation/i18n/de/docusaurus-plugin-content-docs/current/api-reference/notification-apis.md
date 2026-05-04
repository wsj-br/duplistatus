---
translation_last_updated: '2026-04-18T00:01:35.528Z'
source_file_mtime: '2026-03-05T22:33:28.419Z'
source_file_hash: c9fa1157e8f98ef3d8071252f75634990ea86aa2c6de3db3a16b0f911b7a2789
translation_language: de
source_file_path: documentation/docs/api-reference/notification-apis.md
translation_models:
  - qwen/qwen3-235b-a22b-2507
---
# Benachrichtigungssystem {#notification-system}

## Testbenachrichtigung - `/api/notifications/test` {#test-notification-apinotificationstest}
- **Endpoint**: `/api/notifications/test`
- **Methode**: POST
- **Beschreibung**: Sendet Testbenachrichtigungen (einfach, templatebasiert oder E-Mail), um die Benachrichtigungskonfiguration zu überprüfen.
- **Authentifizierung**: Gültige Sitzung und CSRF-Token erforderlich
- **Anfrageinhalt**:
  Für einfachen Test:

    ```json
    {
      "type": "simple",
      "ntfyConfig": {
        "url": "https://ntfy.sh",
        "topic": "test-topic",
        "accessToken": "optional-access-token"
      }
    }
    ```

Für Template-Test:

    ```json
    {
      "type": "template",
      "ntfyConfig": {
        "url": "https://ntfy.sh",
        "topic": "test-topic",
        "accessToken": "optional-access-token"
      },
      "template": {
        "title": "Test Title",
        "message": "Test message with {variable}",
        "priority": "default",
        "tags": "test"
      }
    }
    ```

Für E-Mail-Test:

    ```json
    {
      "type": "email"
    }
    ```

- **Antwort**:
  Für einfachen Test:

  ```json
  {
    "message": "Test notification sent successfully"
  }
  ```

Für Template-Test:

  ```json
  {
    "success": true,
    "message": "Test notifications sent successfully via NTFY and Email",
    "channels": ["NTFY", "Email"]
  }
  ```

Für E-Mail-Test:

  ```json
  {
    "message": "Test email sent successfully"
  }
  ```

Der Inhalt der Test-E-Mail zeigt Folgendes an:
  - SMTP-Server-Hostname und Port
  - Verbindungstyp (Einfaches SMTP, STARTTLS oder Direkte SSL/TLS)
  - Status der SMTP-Authentifizierungsanforderung
  - SMTP-Benutzername (nur angezeigt, wenn Authentifizierung erforderlich ist)
  - Empfänger-E-Mail-Adresse
  - Absenderadresse und Name, der für die E-Mail verwendet wird
  - Test-Zeitstempel
- **Fehlerantworten**:
  - `401`: Nicht autorisiert – Ungültige Sitzung oder CSRF-Token
  - `400`: NTFY-Konfiguration erforderlich, ungültige Konfiguration oder E-Mail nicht konfiguriert
  - `500`: Testbenachrichtigung konnte nicht gesendet werden, mit Fehlerdetails
- **Hinweise**:
  - Unterstützt einfache Testnachrichten, templatebasierte Benachrichtigungen und E-Mail-Tests
  - Beim Template-Test werden Beispieldaten verwendet, um Template-Variablen zu ersetzen
  - Enthält Zeitstempel in der Testnachricht
  - Überprüft NTFY-URL und Thema vor dem Senden
  - Verwendet `accessToken`-Feld für die Authentifizierung
  - Bei Template-Tests werden Benachrichtigungen sowohl an NTFY als auch an E-Mail gesendet (falls konfiguriert)
  - E-Mail-Tests erfordern eine eingerichtete SMTP-Konfiguration
  - Der Test-E-Mail-Endpunkt löscht den Anfragecache vor dem Lesen der SMTP-Konfiguration, sodass externe Skripte die Konfiguration aktualisieren können und diese sofort in Test-E-Mails berücksichtigt wird

## Überprüfung überfälliger Sicherungen - `/api/notifications/check-overdue` {#check-overdue-backups-apinotificationscheck-overdue}
- **Endpoint**: `/api/notifications/check-overdue`
- **Methode**: POST
- **Beschreibung**: Löst manuell die Überprüfung auf überfällige Sicherungen aus und sendet Benachrichtigungen.
- **Authentifizierung**: Gültige Sitzung und CSRF-Token erforderlich
- **Antwort**:

  ```json
  {
    "message": "Overdue backup check completed",
    "statistics": {
      "totalBackupConfigs": 5,
      "checkedBackups": 5,
      "overdueBackupsFound": 2,
      "notificationsSent": 2
    }
  }
  ```

- **Fehlerantworten**:
  - `500`: Überprüfung auf überfällige Sicherungen fehlgeschlagen
- **Hinweise**:
  - Löst manuell die Überprüfung auf überfällige Sicherungen aus
  - Gibt Statistiken über den Überprüfungsprozess zurück
  - Sendet Benachrichtigungen für gefundene überfällige Sicherungen

## Überfällige Zeitstempel löschen - `/api/notifications/clear-overdue-timestamps` {#clear-overdue-timestamps-apinotificationsclear-overdue-timestamps}
- **Endpoint**: `/api/notifications/clear-overdue-timestamps`
- **Methode**: POST
- **Beschreibung**: Löscht alle Zeitstempel für überfällige Sicherungsbenachrichtigungen, sodass Benachrichtigungen erneut gesendet werden können.
- **Authentifizierung**: Gültige Sitzung und CSRF-Token erforderlich
- **Antwort**:

  ```json
  {
    "message": "Overdue backup notification timestamps cleared successfully"
  }
  ```

- **Fehlerantworten**:
  - `500`: Löschen der Zeitstempel für überfällige Sicherungen fehlgeschlagen
- **Hinweise**:
  - Löscht alle Zeitstempel für überfällige Sicherungsbenachrichtigungen
  - Ermöglicht erneutes Senden von Benachrichtigungen
  - Nützlich zum Testen des Benachrichtigungssystems
