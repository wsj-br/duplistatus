# Benachrichtigungssystem {/* #notification-system */}

## Testbenachrichtigung - `/api/notifications/test` {/* #test-notification---apinotificationstest */}
- **Endpoint**: `/api/notifications/test`
- **Methode**: POST
- **Beschreibung**: Sendet Testbenachrichtigungen (einfach, vorlagenbasiert oder E-Mail), um die Benachrichtigungskonfiguration zu überprüfen.
- **Authentifizierung**: Erfordert eine Administratorensitzung und ein CSRF-Token
- **Anforderungstext**:
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
  - SMTP-Server-Hostname und -Port
  - Verbindungstyp (Einfaches SMTP, STARTTLS oder Direkte SSL/TLS)
  - Status der SMTP-Authentifizierungsanforderung
  - SMTP-Benutzername (nur angezeigt, wenn eine Authentifizierung erforderlich ist)
  - Empfänger-E-Mail-Adresse
  - Absenderadresse und Absendername, die für die E-Mail verwendet werden
  - Test-Zeitstempel
- **Fehlerantworten**:
  - `401`: Unbefugt - Ungültige Sitzung oder CSRF-Token
  - `400`: NTFY-Konfiguration ist erforderlich, ungültige Konfiguration oder E-Mail nicht konfiguriert
  - `500`: Senden der Test-Benachrichtigung fehlgeschlagen mit Fehlerdetails
- **Hinweise**:
  - Unterstützt einfache Testnachrichten, vorlagenbasierte Benachrichtigungen und E-Mail-Tests
  - Vorlagen-Tests verwenden Beispieldaten, um Vorlagenvariablen zu ersetzen
  - Enthält Zeitstempel in der Testnachricht
  - NTFY-Tests verwenden die gespeicherte NTFY-Konfiguration; eine vom Client bereitgestellte NTFY-URL wird nicht verwendet
  - Verwendet `accessToken`-Feld für die Authentifizierung, wenn gespeichert
  - Für Vorlagen-Tests werden Benachrichtigungen sowohl an NTFY als auch an E-Mail gesendet (wenn konfiguriert)
  - E-Mail-Tests erfordern eine eingerichtete SMTP-Konfiguration
  - Der Test-E-Mail-Endpoint löscht den Anforderungs-Cache, bevor die SMTP-Konfiguration gelesen wird, um sicherzustellen, dass externe Skripte die Konfiguration aktualisieren können und diese sofort in Test-E-Mails reflektiert wird
  - Vorlagen-Tests und Tägliche Zusammenfassungen senden jetzt ohne Unterdrückung pro Backup

## Vorschau der Benachrichtigungsvorlage - `/api/notifications/preview` {/* #preview-notification-template---apinotificationspreview */}
- **Endpoint**: `/api/notifications/preview`
- **Methode**: POST
- **Beschreibung**: Rendert eine Benachrichtigungsvorlage mit dem Produktions-Markdown-Renderer, ohne sie zu senden. Der Text enthält `kind` (`success`, `warning`, `overdueBackup` oder `dailySummaryEmail`) und die bearbeitete Vorlage. Tägliche Zusammenfassungen verwenden den aktuellen echten Snapshot; andere Arten verwenden deterministische Beispielwerte. E-Mail HTML ist für ein sandboxed iframe gedacht. Erfolg, Warnung/Fehler und Überfällig geben ebenfalls die NTFY-Nutzlast zurück (`ntfyMessage`); jeder GFM-Tabellenkopf wird weggelassen und die Zeilen im Textkörper sind Klartext.
- **Authentifizierung**: Erfordert eine gültige Sitzung und ein CSRF-Token

## Überfällige Backups überprüfen - `/api/notifications/check-overdue` {/* #check-overdue-backups---apinotificationscheck-overdue */}
- **Endpoint**: `/api/notifications/check-overdue`
- **Methode**: POST
- **Beschreibung**: Manuelles Auslösen der Überprüfung überfälliger Backups und Versenden von Benachrichtigungen.
- **Authentifizierung**: Erfordert eine gültige Sitzung und ein CSRF-Token
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
  - `500`: Überprüfung überfälliger Backups fehlgeschlagen
- **Hinweise**:
  - Manuelles Auslösen der Überprüfung überfälliger Backups
  - Gibt Statistiken über den Überprüfungsprozess zurück
  - Sendet Benachrichtigungen für gefundene überfällige Backups

## Warnungen zu Benachrichtigungskanälen - `/api/notification-channel-alerts` {/* #notification-channel-alerts---apinotification-channel-alerts */}

- **Endpunkt**: `/api/notification-channel-alerts`
- **Methode**: GET, POST
- **Beschreibung**: Listet offene E-Mail- und NTFY-Zustellungsfehler für den angemeldeten Administrator auf oder löscht die aufgeführten Kanäle, bis ein neuerer Fehler protokolliert wird.
- **Authentifizierung**: Erfordert eine Administratorsitzung. POST erfordert außerdem ein CSRF-Token im `X-CSRF-Token`-Header.
- **Request Body** (POST):

  ```json
  {
    "channels": ["email", "ntfy"]
  }
  ```

`channels` muss einen oder beide Werte von `email` und `ntfy` enthalten.
- **Antwort**:

  ```json
  {
    "alerts": [
      {
        "channel": "email",
        "error": "SMTP authentication failed",
        "latestTimestamp": "2026-09-23 22:10:00",
        "failureCount": 3,
        "settingsTab": "email",
        "host": "smtp.gmail.com"
      }
    ]
  }
  ```

Jede Warnung enthält `channel`, `error` (höchstens 500 Zeichen), `latestTimestamp`, `failureCount` und `settingsTab` (`email` oder `ntfy`). E-Mail-Warnungen können `host` enthalten. NTFY-Warnungen können `topic` enthalten.
- **Fehlerantworten**:
  - `400` `INVALID_CONFIGURATION`: POST-Body fehlt oder `channels` ist leer oder enthält einen unbekannten Wert
  - `500` `INTERNAL_ERROR`: Lesen oder Löschen der Warnungen fehlgeschlagen
- **Hinweise**:
  - GET gibt die Kanäle zurück, für die bei diesem Administrator weiterhin Fehler auftreten
  - POST protokolliert einen administratorbezogenen Löschvorgang für jeden aufgeführten Kanal, der derzeit offen ist, und gibt dann die verbleibenden Warnungen zurück
  - Ein späterer Fehler zeigt den Kanal wieder an, selbst wenn der Fehlertext unverändert ist
  - Eine spätere erfolgreiche Zustellung für diesen Kanal lässt ihn verborgen
  - Die Löschmarkierung wird in der Konfiguration gespeichert und enthält keine Secrets

## Überfällige Zeitstempel löschen - `/api/notifications/clear-overdue-timestamps` {/* #clear-overdue-timestamps---apinotificationsclear-overdue-timestamps */}
- **Endpoint**: `/api/notifications/clear-overdue-timestamps`
- **Methode**: POST
- **Beschreibung**: Löscht alle Zeitstempel für überfällige Backup-Benachrichtigungen, sodass Benachrichtigungen erneut gesendet werden können.
- **Authentifizierung**: Erfordert eine gültige Sitzung und ein CSRF-Token
- **Antwort**:

  ```json
  {
    "message": "Overdue backup notification timestamps cleared successfully"
  }
  ```

- **Fehlerantworten**:
  - `500`: Löschen der überfälligen Backup-Zeitstempel fehlgeschlagen
- **Hinweise**:
  - Löscht alle Zeitstempel für überfällige Backup-Benachrichtigungen
  - Ermöglicht das erneute Senden von Benachrichtigungen
  - Nützlich für das Testen des Benachrichtigungssystems
