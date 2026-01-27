# Benachrichtigungssystem {#notification-system}

## Testbenachrichtigung - `/api/notifications/test` {#test-notification-apinotificationstest}

- **Endpoint**: `/api/notifications/test`
- **Methode**: POST
- **Beschreibung**: Testbenachrichtigungen senden (einfach, vorlagenbasiert oder E-Mail), um die Benachrichtigungskonfiguration zu bestätigen.
- **Authentifizierung**: Erfordert gültige Sitzung und CSRF-Token
- **Anforderungstext**:
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
  Für Vorlagentest:
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
  Für Vorlagentest:
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
  Der Test-E-Mail-Inhalt zeigt:
  - SMTP-Server-Hostname und Port
  - Verbindungstyp (Einfaches SMTP, STARTTLS oder Direktes SSL/TLS)
  - SMTP-Authentifizierungsanforderungsstatus
  - SMTP-Benutzername (nur angezeigt, wenn Authentifizierung erforderlich ist)
  - Empfänger-E-Mail-Adresse
  - Absenderadresse und Absendername für die E-Mail
  - Test-Zeitstempel
- **Fehlerantworten**:
  - `401`: Nicht autorisiert - Ungültige Sitzung oder CSRF-Token
  - `400`: NTFY-Konfiguration erforderlich, ungültige Konfiguration oder E-Mail nicht konfiguriert
  - `500`: Fehler beim Senden der Testbenachrichtigung mit Fehlerdetails
- **Hinweise**:
  - Unterstützt einfache Testnachrichten, vorlagenbasierte Benachrichtigungen und E-Mail-Tests
  - Vorlagentests verwenden Beispieldaten zum Ersetzen von Vorlagenvariablen
  - Enthält Zeitstempel in der Testnachricht
  - Validiert NTFY-URL und Thema vor dem Senden
  - Verwendet `accessToken`-Feld für Authentifizierung
  - Für Vorlagentests werden Benachrichtigungen an NTFY und E-Mail gesendet (falls konfiguriert)
  - E-Mail-Tests erfordern SMTP-Konfiguration
  - Der Test-E-Mail-Endpoint löscht den Request-Cache vor dem Lesen der SMTP-Konfiguration, um sicherzustellen, dass externe Skripte die Konfiguration aktualisieren können und diese sofort in Test-E-Mails widergespiegelt wird

## Überfällige Sicherungen prüfen - `/api/notifications/check-overdue` {#check-overdue-backups-apinotificationscheck-overdue}

- **Endpoint**: `/api/notifications/check-overdue`
- **Methode**: POST
- **Beschreibung**: Löst manuell die Prüfung überfälliger Sicherungen aus und sendet Benachrichtigungen.
- **Authentifizierung**: Erfordert gültige Sitzung und CSRF-Token
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
  - `401`: Nicht autorisiert - Ungültige Sitzung oder CSRF-Token
  - `500`: Fehler beim Prüfen auf überfällige Sicherungen
- **Hinweise**:
  - Löst manuell die Prüfung überfälliger Sicherungen aus
  - Gibt Statistiken zum Prüfprozess zurück
  - Sendet Benachrichtigungen für gefundene überfällige Sicherungen

## Überfällige Zeitstempel löschen - `/api/notifications/clear-overdue-timestamps` {#clear-overdue-timestamps-apinotificationsclear-overdue-timestamps}

- **Endpoint**: `/api/notifications/clear-overdue-timestamps`
- **Methode**: POST
- **Beschreibung**: Löscht alle Zeitstempel für überfällige Sicherungsbenachrichtigungen, um Benachrichtigungen erneut zu senden.
- **Authentifizierung**: Erfordert gültige Sitzung und CSRF-Token
- **Antwort**:
  ```json
  {
    "message": "Overdue backup notification timestamps cleared successfully"
  }
  ```
- **Fehlerantworten**:
  - `401`: Nicht autorisiert - Ungültige Sitzung oder CSRF-Token
  - `500`: Fehler beim Löschen der Zeitstempel für überfällige Sicherungen
- **Hinweise**:
  - Löscht alle Zeitstempel für überfällige Sicherungsbenachrichtigungen
  - Ermöglicht erneutes Senden von Benachrichtigungen
  - Nützlich zum Testen des Benachrichtigungssystems
