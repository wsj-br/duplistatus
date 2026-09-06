# Benachrichtigungssystem {#notification-system}

## Testbenachrichtigung - `/api/notifications/test` {#test-notification---apinotificationstest}
- **Endpunkt**: `/api/notifications/test`
- **Methode**: POST
- **Beschreibung**: Sendet Testbenachrichtigungen (einfach, vorlagenbasiert oder per E-Mail), um die Benachrichtigungskonfiguration zu überprüfen.
- **Authentifizierung**: Erfordert eine Administrator-Sitzung und einen CSRF-Token
- **Anfragekörper**:
  Für einfache Tests:

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
  - Absenderadresse und Name des Absenders für die E-Mail
  - Test-Zeitstempel
- **Fehlerantworten**:
  - `401`: Nicht autorisiert – Ungültige Sitzung oder CSRF-Token
  - `400`: NTFY-Konfiguration ist erforderlich, ungültige Konfiguration oder E-Mail nicht konfiguriert
  - `500`: Testbenachrichtigung konnte nicht gesendet werden, mit Fehlerdetails
- **Hinweise**:
  - Unterstützt einfache Testnachrichten, vorlagenbasierte Benachrichtigungen und E-Mail-Tests
  - Bei der Vorlagenprüfung werden Beispieldaten verwendet, um Vorlagenvariablen zu ersetzen
  - Enthält Zeitstempel in der Testnachricht
  - NTFY-Tests verwenden die gespeicherte NTFY-Konfiguration; eine vom Client bereitgestellte NTFY-URL wird nicht verwendet
  - Verwendet das `accessToken`-Feld für die Authentifizierung, wenn gespeichert
  - Bei Vorlagen-Tests werden Benachrichtigungen sowohl an NTFY als auch an E-Mail (falls konfiguriert) gesendet
  - E-Mail-Tests erfordern, dass die SMTP-Konfiguration eingerichtet ist
  - Der Test-E-Mail-Endpunkt leert den Anfrage-Cache, bevor die SMTP-Konfiguration gelesen wird, sodass externe Skripte die Konfiguration aktualisieren und die Änderungen sofort in den Test-E-Mails widerspiegeln können
  - Vorlagen-Tests und die sofortige Senden-Funktion der Täglichen Zusammenfassung umgehen die pro-Sicherung-Unterdrückung

## Vorschau der Benachrichtigungsvorlage - `/api/notifications/preview` {#preview-notification-template---apinotificationspreview}
- **Endpunkt**: `/api/notifications/preview`
- **Methode**: POST
- **Beschreibung**: Rendert eine Benachrichtigungsvorlage mit dem Produktions-Markdown-Renderer ohne Senden. Der Körper enthält `kind` (`success`, `warning`, `overdueBackup`, `dailySummaryEmail` oder `dailySummaryNtfy`) und die bearbeitete Vorlage. Vorschauen der Täglichen Zusammenfassung verwenden das aktuelle reale Snapshot; andere Arten verwenden deterministische Beispielwerte. E-Mail HTML ist für ein sandboxed iframe vorgesehen.
- **Authentifizierung**: Erfordert gültige Sitzung und CSRF-Token

## Überfällige Sicherungen prüfen - `/api/notifications/check-overdue` {#check-overdue-backups---apinotificationscheck-overdue}
- **Endpunkt**: `/api/notifications/check-overdue`
- **Methode**: POST
- **Beschreibung**: Löst manuell die Prüfung auf überfällige Sicherungen aus und sendet Benachrichtigungen.
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
  - `500`: Überprüfung auf überfällige Sicherungen fehlgeschlagen
- **Hinweise**:
  - Löst manuell die Überprüfung auf überfällige Sicherungen aus
  - Gibt Statistiken über den Überprüfungsprozess zurück
  - Sendet Benachrichtigungen für gefundene überfällige Sicherungen

## Überfällige Zeitstempel löschen - `/api/notifications/clear-overdue-timestamps` {#clear-overdue-timestamps---apinotificationsclear-overdue-timestamps}
- **Endpunkt**: `/api/notifications/clear-overdue-timestamps`
- **Methode**: POST
- **Beschreibung**: Löscht alle Zeitstempel für Benachrichtigungen zu überfälligen Sicherungen, sodass Benachrichtigungen erneut gesendet werden können.
- **Authentifizierung**: Erfordert gültige Sitzung und CSRF-Token
- **Antwort**:

  ```json
  {
    "message": "Overdue backup notification timestamps cleared successfully"
  }
  ```

- **Fehlerantworten**:
  - `500`: Löschen der Zeitstempel für überfällige Sicherungen fehlgeschlagen
- **Hinweise**:
  - Löscht alle Zeitstempel für Benachrichtigungen über überfällige Sicherungen
  - Ermöglicht erneutes Senden von Benachrichtigungen
  - Nützlich zum Testen des Benachrichtigungssystems
