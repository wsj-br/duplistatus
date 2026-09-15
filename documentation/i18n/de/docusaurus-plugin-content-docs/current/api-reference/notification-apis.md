# Benachrichtigungssystem {/* #notification-system */}

## Test-Benachrichtigung - `/api/notifications/test` {/* #test-notification---apinotificationstest */}
- **Endpunkt**: `/api/notifications/test`
- **Methode**: POST
- **Beschreibung**: Senden Sie Testbenachrichtigungen (einfach, vorlagenbasiert oder E-Mail), um die Benachrichtigungs-Konfiguration zu überprüfen.
- **Authentifizierung**: Erfordert eine Administrator-Sitzung und ein CSRF-Token
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

Für Vorlagen-Tests:

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

Für E-Mail-Tests:

    ```json
    {
      "type": "email"
    }
    ```

- **Antwort**:
  Für einfache Tests:

  ```json
  {
    "message": "Test notification sent successfully"
  }
  ```

Für Vorlagen-Tests:

  ```json
  {
    "success": true,
    "message": "Test notifications sent successfully via NTFY and Email",
    "channels": ["NTFY", "Email"]
  }
  ```

Für E-Mail-Tests:

  ```json
  {
    "message": "Test email sent successfully"
  }
  ```

Der Inhalt der Test-E-Mail zeigt an:
  - SMTP-Server-Hostname und Port
  - Verbindungstyp (Einfaches SMTP, STARTTLS oder Direkte SSL/TLS)
  - Status der SMTP-Authentifizierung
  - SMTP-Benutzername (nur angezeigt, wenn Authentifizierung erforderlich ist)
  - Empfänger-E-Mail-Adresse
  - Absenderadresse und -name, die für die E-Mail verwendet werden
  - Test-Zeitstempel
- **Fehlerantworten**:
  - `401`: Unautorisiert - Ungültige Sitzung oder CSRF-Token
  - `400`: NTFY-Konfiguration ist erforderlich, die Konfiguration ist ungültig oder die E-Mail ist nicht konfiguriert
  - `500`: Senden der Test-Benachrichtigung fehlgeschlagen mit Fehlerdetails
- **Hinweise**:
  - Unterstützt einfache Testnachrichten, vorlagenbasierte Benachrichtigungen und E-Mail-Tests
  - Vorlagen-Tests verwenden Beispiel-Daten, um Vorlagen-Variablen zu ersetzen
  - Enthält einen Zeitstempel in der Testnachricht
  - NTFY-Tests verwenden die gespeicherte NTFY-Konfiguration; eine vom Client bereitgestellte NTFY-URL wird nicht verwendet
  - Verwendet das `accessToken`-Feld für die Authentifizierung, wenn gespeichert
  - Für Vorlagen-Tests werden Benachrichtigungen sowohl an NTFY als auch an E-Mail (falls konfiguriert) gesendet
  - E-Mail-Tests erfordern, dass die SMTP-Konfiguration eingerichtet ist
  - Der Test-E-Mail-Endpunkt löscht den Anfrage-Cache, bevor die SMTP-Konfiguration gelesen wird, um sicherzustellen, dass externe Skripte die Konfiguration aktualisieren können und diese sofort in Test-E-Mails widerspiegelt
  - Vorlagen-Tests und Tägliche Zusammenfassung (Senden jetzt) umgehen die pro-Sicherung-Unterdrückung

## Vorschau der Benachrichtigungsvorlage - `/api/notifications/preview` {/* #preview-notification-template---apinotificationspreview */}
- **Endpunkt**: `/api/notifications/preview`
- **Methode**: POST
- **Beschreibung**: Rendert eine Benachrichtigungsvorlage mit dem Produktions-Markdown-Renderer ohne Senden. Der Körper enthält `kind` (`success`, `warning`, `overdueBackup` oder `dailySummaryEmail`) und die bearbeitete Vorlage. Vorschauen der Täglichen Zusammenfassung verwenden die aktuelle reale Momentaufnahme; andere Arten verwenden deterministische Beispielwerte. E-Mail HTML ist für ein sandboxed iframe vorgesehen. Erfolg, Warnung/Fehler und Überfällig geben auch die NTFY-Payload (`ntfyMessage`) zurück; jeder GFM-Tabellenkopf wird ausgelassen und die Körperzeilen sind Klartext.
- **Authentifizierung**: Erfordert gültige Sitzung und CSRF-Token

## Überfällige Backups prüfen - `/api/notifications/check-overdue` {/* #check-overdue-backups---apinotificationscheck-overdue */}
- **Endpunkt**: `/api/notifications/check-overdue`
- **Methode**: POST
- **Beschreibung**: Löst manuell die Überprüfung der überfälligen Backups aus und sendet Benachrichtigungen.
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
  - `500`: Überprüfung der überfälligen Backups fehlgeschlagen
- **Hinweise**:
  - Löst manuell die Überprüfung der überfälligen Backups aus
  - Gibt Statistiken über den Überprüfungsprozess zurück
  - Sendet Benachrichtigungen für überfällige Backups, die gefunden wurden

## Überfällige Zeitstempel löschen - `/api/notifications/clear-overdue-timestamps` {/* #clear-overdue-timestamps---apinotificationsclear-overdue-timestamps */}
- **Endpunkt**: `/api/notifications/clear-overdue-timestamps`
- **Methode**: POST
- **Beschreibung**: Löscht alle Zeitstempel der Benachrichtigungen für überfällige Backups, sodass Benachrichtigungen erneut gesendet werden können.
- **Authentifizierung**: Erfordert gültige Sitzung und CSRF-Token
- **Antwort**:

  ```json
  {
    "message": "Overdue backup notification timestamps cleared successfully"
  }
  ```

- **Fehlerantworten**:
  - `500`: Löschen der Zeitstempel für überfällige Backups fehlgeschlagen
- **Hinweise**:
  - Löscht alle Zeitstempel der Benachrichtigungen für überfällige Backups
  - Erlaubt das erneute Senden von Benachrichtigungen
  - Nützlich zum Testen des Benachrichtigungssystems
