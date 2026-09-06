# Konfigurationsverwaltung {#configuration-management}

## E-Mail-Konfiguration abrufen - `/api/configuration/email` {#get-email-configuration---apiconfigurationemail}
- **Endpunkt**: `/api/configuration/email`
- **Methode**: GET
- **Beschreibung**: Ruft die aktuelle Konfiguration für E-Mail-Benachrichtigungen sowie Informationen dazu ab, ob E-Mail-Benachrichtigungen aktiviert/konfiguriert sind.
- **Authentifizierung**: Gültige Sitzung und CSRF-Token erforderlich
- **Antwort** (konfiguriert):

  ```json
  {
    "configured": true,
    "config": {
      "host": "smtp.example.com",
      "port": 465,
      "connectionType": "ssl",
      "username": "user@example.com",
      "mailto": "admin@example.com",
      "senderName": "duplistatus",
      "fromAddress": "user@example.com",
      "requireAuth": true,
      "hasPassword": true
    },
    "message": "Email is configured and ready to use."
  }
  ```

- **Antwort** (nicht konfiguriert):

  ```json
  {
    "configured": false,
    "config": null,
    "message": "Email is not configured. Please configure SMTP settings."
  }
  ```

- **Fehlerantworten**:
  - `400`: Master-Schlüssel ist ungültig – Alle verschlüsselten Passwörter und Einstellungen müssen neu konfiguriert werden
  - `401`: Nicht autorisiert – Ungültige Sitzung oder CSRF-Token
  - `500`: Abrufen der E-Mail-Konfiguration fehlgeschlagen
- **Hinweise**:
  - Gibt die Konfiguration ohne Passwort aus Sicherheitsgründen zurück
  - Enthält das Feld `hasPassword`, um anzugeben, ob ein Passwort festgelegt ist
  - Enthält die Felder `connectionType` (plain|starttls|ssl), `senderName`, `fromAddress` und `requireAuth`
  - Gibt an, ob E-Mail-Benachrichtigungen für Test- und Produktivbetrieb verfügbar sind
  - Behandelt Fehler bei der Validierung des Master-Schlüssels ordnungsgemäß

## E-Mail-Konfiguration aktualisieren - `/api/configuration/email` {#update-email-configuration---apiconfigurationemail}
- **Endpunkt**: `/api/configuration/email`
- **Methode**: POST
- **Beschreibung**: Aktualisiert die SMTP-E-Mail-Benachrichtigungskonfiguration.
- **Authentifizierung**: Erfordert gültige Sitzung und CSRF-Token
- **Anforderungstext**:

  ```json
  {
    "host": "smtp.example.com",
    "port": 465,
    "secure": true,
    "username": "user@example.com",
    "password": "password",
    "mailto": "admin@example.com"
  }
  ```

- **Antwort**:

  ```json
  {
    "success": true,
    "message": "SMTP configuration saved successfully"
  }
  ```

- **Fehlerantworten**:
  - `400`: Erforderliche Felder fehlen oder ungültige Portnummer
  - `401`: Nicht autorisiert – Ungültige Sitzung oder CSRF-Token
  - `500`: Speichern der SMTP-Konfiguration fehlgeschlagen
- **Hinweise**:
  - Alle Felder (Host, Port, Benutzername, Passwort, Mailto) sind erforderlich
  - Der Port muss eine gültige Zahl zwischen 1 und 65535 sein
  - Das Feld „Secure“ ist ein boolescher Wert (true für SSL/TLS)
  - Das Passwort wird separat über den Passwort-Endpunkt verwaltet

## E-Mail-Konfiguration löschen - `/api/configuration/email` {#delete-email-configuration---apiconfigurationemail}
- **Endpunkt**: `/api/configuration/email`
- **Methode**: DELETE
- **Beschreibung**: Löscht die SMTP-E-Mail-Benachrichtigungskonfiguration.
- **Authentifizierung**: Erfordert gültige Sitzung und CSRF-Token
- **Antwort**:

  ```json
  {
    "success": true,
    "message": "SMTP configuration deleted successfully"
  }
  ```

- **Fehlerantworten**:
  - `401`: Nicht autorisiert – Ungültige Sitzung oder CSRF-Token
  - `404`: Keine SMTP-Konfiguration zum Löschen vorhanden
  - `500`: Löschen der SMTP-Konfiguration fehlgeschlagen
- **Hinweise**:
  - Diese Operation entfernt die SMTP-Konfiguration dauerhaft
  - Gibt 404 zurück, wenn keine Konfiguration zum Löschen existiert
  - Gibt 400 zurück, wenn der Tägliche Zusammenfassungsmodus aktiviert ist, da dieser Modus SMTP erfordert

## E-Mail-Passwort aktualisieren - `/api/configuration/email/password` {#update-email-password---apiconfigurationemailpassword}
- **Endpunkt**: `/api/configuration/email/password`
- **Methode**: PATCH
- **Beschreibung**: Aktualisiert das E-Mail-Passwort für die SMTP-Authentifizierung.
- **Authentifizierung**: Erfordert gültige Sitzung und CSRF-Token
- **Anforderungstext**:

  ```json
  {
    "password": "new-password",
    "config": {
      "host": "smtp.example.com",
      "port": 465,
      "secure": true,
      "username": "user@example.com",
      "mailto": "admin@example.com"
    }
  }
  ```

- **Antwort**:

  ```json
  {
    "message": "Email password updated successfully"
  }
  ```

- **Fehlerantworten**:
  - `400`: Passwort muss ein String sein oder erforderliche Konfigurationsfelder fehlen
  - `401`: Nicht autorisiert – Ungültige Sitzung oder CSRF-Token
  - `500`: Aktualisieren des E-Mail-Passworts fehlgeschlagen
- **Hinweise**:
  - Das Passwort kann ein leerer String sein, um das Passwort zu löschen
  - Wenn keine SMTP-Konfiguration existiert, wird eine minimale Konfiguration aus den bereitgestellten Daten erstellt
  - Der Parameter „Config“ ist erforderlich, wenn keine bestehende SMTP-Konfiguration vorhanden ist
  - Das Passwort wird sicher verschlüsselt gespeichert

## CSRF-Token für E-Mail-Passwort abrufen - `/api/configuration/email/password` {#get-email-password-csrf-token---apiconfigurationemailpassword}
- **Endpunkt**: `/api/configuration/email/password`
- **Methode**: GET
- **Beschreibung**: Ruft ein CSRF-Token für E-Mail-Passwort-Operationen ab.
- **Authentifizierung**: Gültige Sitzung erforderlich
- **Antwort**:

  ```json
  {
    "csrfToken": "csrf-token-string"
  }
  ```

- **Fehlerantworten**:
  - `401`: Ungültige oder abgelaufene Sitzung
  - `500`: CSRF-Token konnte nicht generiert werden
- **Hinweise**:
  - Gibt ein CSRF-Token zurück, das bei Passwortaktualisierungen verwendet werden muss
  - Die Sitzung muss gültig sein, um das Token zu generieren

## Vereinheitlichte Konfiguration abrufen - `/api/configuration/unified` {#get-unified-configuration---apiconfigurationunified}
- **Endpunkt**: `/api/configuration/unified`
- **Methode**: GET
- **Beschreibung**: Ruft ein vereinheitlichtes Konfigurationsobjekt ab, das alle Konfigurationsdaten enthält, einschließlich Cron-Einstellungen, Benachrichtigungshäufigkeit und Server mit Backups.
- **Authentifizierung**: Erfordert gültige Sitzung und CSRF-Token
- **Antwort**:

  ```json
  {
    "ntfy": {
      "url": "https://ntfy.sh",
      "topic": "duplistatus-notifications",
      "accessToken": ""
    },
    "templates": {
      "language": "en-GB",
      "success": {
        "title": "✅ {status} - {backup_name} @ {server_name}",
        "message": "Backup {backup_name} on {server_name} completed with status '{status}' at {backup_date} in {duration}.",
        "priority": "default",
        "tags": "duplicati, duplistatus, success"
      },
      "warning": {
        "title": "⚠️ {status} - {backup_name} @ {server_name}",
        "message": "Backup {backup_name} on {server_name} completed with status '{status}' at {backup_date}.",
        "priority": "high",
        "tags": "duplicati, duplistatus, warning, error"
      },
      "overdueBackup": {
        "title": "🕑 Overdue - {backup_name} @ {server_name}",
        "message": "The backup {backup_name} is overdue on {server_name}.",
        "priority": "default",
        "tags": "duplicati, duplistatus, overdue"
      },
      "dailySummary": {
        "email": {
          "title": "duplistatus — Daily backup summary — {summary_date}",
          "message": "## Daily backup summary"
        }
      }
    },
    "email": {
      "host": "smtp.example.com",
      "port": 465,
      "connectionType": "ssl",
      "username": "user@example.com",
      "mailto": "admin@example.com",
      "senderName": "duplistatus",
      "fromAddress": "user@example.com",
      "requireAuth": true,
      "hasPassword": true
    },
    "overdue_tolerance": "2h",
    "backup_settings": {
      "server1:backup1": {
        "notificationEvent": "all",
        "expectedInterval": 24,
        "overdueBackupCheckEnabled": true,
        "intervalUnit": "hours",
        "expectedBackupDate": "2025-02-07T00:00:00.000Z",
        "lastBackupDate": "2025-02-06T00:00:00.000Z"
      }
    },
    "serverAddresses": [
      {
        "id": "server1",
        "name": "Server 1",
        "server_url": "http://localhost:8200"
      }
    ],
    "cronConfig": {
      "cronExpression": "*/20 * * * *",
      "enabled": true
    },
    "notificationFrequency": "every_day",
    "serversWithBackups": [
      {
        "id": "server1",
        "name": "Server 1",
        "backupName": "backup1",
        "server_url": "http://localhost:8200",
        "alias": "My Server",
        "note": "Primary backup server",
        "hasPassword": true,
        "expectedBackupDate": "2025-02-07T00:00:00.000Z",
        "lastBackupDate": "2025-02-06T00:00:00.000Z"
      }
    ]
  }
  ```

- **Fehlerantworten**:
  - `500`: Serverfehler beim Abrufen der vereinheitlichten Konfiguration
- **Hinweise**:
  - Gibt alle Konfigurationsdaten in einer einzigen Antwort zurück
  - Beinhaltet Cron-Einstellungen, Benachrichtigungshäufigkeit und Server mit Sicherungen
  - Die E-Mail-Konfiguration enthält das Feld `hasPassword`, jedoch nicht das eigentliche Passwort
  - Ruft alle Daten parallel ab, um die Leistung zu verbessern

## NTFY-Konfiguration abrufen - `/api/configuration/ntfy` {#get-ntfy-configuration---apiconfigurationntfy}
- **Endpunkt**: `/api/configuration/ntfy`
- **Methode**: GET
- **Beschreibung**: Ruft die aktuellen NTFY-Konfigurationseinstellungen ab.
- **Authentifizierung**: Erfordert gültige Sitzung und CSRF-Token
- **Antwort**:

  ```json
  {
    "ntfy": {
      "url": "https://ntfy.sh",
      "topic": "duplistatus-notifications",
      "accessToken": "optional-access-token"
    }
  }
  ```

- **Fehlerantworten**:
  - `401`: Nicht autorisiert – Ungültige Sitzung oder CSRF-Token
  - `500`: Abrufen der NTFY-Konfiguration fehlgeschlagen
- **Hinweise**:
  - Gibt die aktuellen NTFY-Konfigurationseinstellungen zurück
  - Wird für das Benachrichtigungssystem-Management verwendet
  - Erfordert Authentifizierung zum Zugriff auf Konfigurationsdaten

## Benachrichtigungskonfiguration abrufen - `/api/configuration/notifications` {#get-notification-configuration---apiconfigurationnotifications}
- **Endpunkt**: `/api/configuration/notifications`
- **Methode**: GET
- **Beschreibung**: Ruft die aktuelle Konfiguration der Benachrichtigungshäufigkeit ab.
- **Authentifizierung**: Erfordert gültige Sitzung und CSRF-Token
- **Antwort**:

  ```json
  {
    "value": "every_day"
  }
  ```

- **Fehlerantworten**:
  - `401`: Nicht autorisiert – Ungültige Sitzung oder CSRF-Token
  - `500`: Abrufen der Konfiguration fehlgeschlagen
- **Hinweise**:
  - Ruft die aktuelle Konfiguration der Benachrichtigungshäufigkeit ab
  - Wird für das Management von Benachrichtigungen bei überfälligen Sicherungen verwendet
  - Gibt einen der folgenden Werte zurück: `"onetime"`, `"every_day"`, `"every_week"`, `"every_month"`

## Benachrichtigungskonfiguration aktualisieren - `/api/configuration/notifications` {#update-notification-configuration---apiconfigurationnotifications}
- **Endpunkt**: `/api/configuration/notifications`
- **Methode**: POST
- **Beschreibung**: Aktualisiert die Benachrichtigungskonfiguration (NTFY-Einstellungen oder Benachrichtigungshäufigkeit).
- **Authentifizierung**: Erfordert gültige Sitzung und CSRF-Token
- **Anforderungstext**:
  Für NTFY-Konfiguration:

  ```json
  {
    "ntfy": {
      "enabled": true,
      "url": "https://ntfy.sh",
      "topic": "duplistatus-notifications",
      "accessToken": "optional-access-token"
    }
  }
  ```

Für die Benachrichtigungshäufigkeit:

  ```json
  {
    "value": "every_week"
  }
  ```

- **Antwort**:
  Für die NTFY-Konfiguration:

  ```json
  {
    "message": "Notification config updated successfully",
    "ntfy": {
      "enabled": true,
      "url": "https://ntfy.sh",
      "topic": "duplistatus-notifications",
      "accessToken": "optional-access-token"
    }
  }
  ```

Für die Benachrichtigungshäufigkeit:

  ```json
  {
    "value": "every_week"
  }
  ```

- **Verfügbare Werte**: `"onetime"`, `"every_day"`, `"every_week"`, `"every_month"`
- **Fehlerantworten**:
  - `401`: Nicht autorisiert – Ungültige Sitzung oder CSRF-Token
  - `400`: NTFY-Konfiguration ist erforderlich oder ungültiger Wert
  - `500`: Serverfehler bei der Aktualisierung der Benachrichtigungskonfiguration
- **Hinweise**:
  - Unterstützt sowohl NTFY-Konfiguration als auch Aktualisierungen der Benachrichtigungshäufigkeit
  - Aktualisiert nur die NTFY-Konfiguration, wenn das ntfy-Feld angegeben ist
  - Aktualisiert die Benachrichtigungshäufigkeit, wenn das value-Feld angegeben ist
  - Generiert ein Standardthema, falls keines angegeben ist
  - Behält vorhandene Konfigurationseinstellungen bei
  - Verwendet das Feld `accessToken` anstelle separater Benutzername/Passwort-Felder
  - Überprüft den Wert der Benachrichtigungshäufigkeit anhand der zulässigen Optionen
  - Beeinflusst, wie oft Benachrichtigungen über überfällige Sicherungen gesendet werden

## Backup-Einstellungen aktualisieren - `/api/configuration/backup-settings` {#update-backup-settings---apiconfigurationbackup-settings}
- **Endpunkt**: `/api/configuration/backup-settings`
- **Methode**: POST
- **Beschreibung**: Aktualisiert die Backup-Benachrichtigungseinstellungen für bestimmte Server/Backups.
- **Authentifizierung**: Erfordert gültige Sitzung und CSRF-Token
- **Anforderungstext**:

  ```json
  {
    "backupSettings": {
      "Server Name:Backup Name": {
        "notificationEvent": "all",
        "expectedInterval": 24,
        "overdueBackupCheckEnabled": true,
        "intervalUnit": "hours"
      }
    }
  }
  ```

- **Antwort**:

  ```json
  {
    "message": "Backup settings updated successfully"
  }
  ```

- **Fehlerantworten**:
  - `401`: Nicht autorisiert – Ungültige Sitzung oder CSRF-Token
  - `400`: backupSettings ist erforderlich
  - `500`: Serverfehler bei der Aktualisierung der Sicherungseinstellungen
- **Hinweise**:
  - Aktualisiert die Benachrichtigungseinstellungen für bestimmte Server/Sicherungen
  - Bereinigt Benachrichtigungen über überfällige Sicherungen für deaktivierte Sicherungen
  - Löscht Benachrichtigungen, wenn sich die Timeout-Einstellungen ändern

## Benachrichtigungsvorlagen aktualisieren - `/api/configuration/templates` {#update-notification-templates---apiconfigurationtemplates}
- **Endpunkt**: `/api/configuration/templates`
- **Methode**: POST
- **Beschreibung**: Aktualisiert die Benachrichtigungsvorlagen.
- **Authentifizierung**: Erfordert gültige Sitzung und CSRF-Token
- **Anforderungstext**:

  ```json
  {
    "templates": {
      "success": {
        "title": "✅ {status} - {backup_name} @ {server_name}",
        "message": "Backup {backup_name} on {server_name} completed with status '{status}' at {backup_date} in {duration}.",
        "priority": "default",
        "tags": "duplicati, duplistatus, success"
      }
    }
  }
  ```

- **Antwort**:

  ```json
  {
    "message": "Notification templates updated successfully"
  }
  ```

- **Fehlerantworten**:
  - `401`: Nicht autorisiert – Ungültige Sitzung oder CSRF-Token
  - `400`: Vorlagen sind erforderlich
  - `500`: Serverfehler bei der Aktualisierung der Benachrichtigungsvorlagen
- **Hinweise**:
  - Aktualisiert Benachrichtigungsvorlagen für verschiedene Sicherungsstatus
  - Behält bestehende Konfigurationseinstellungen bei
  - Vorlagen unterstützen Markdown-E-Mail-Inhalte und `{placeholder}`-Ersetzung
  - Eine `dailySummary` E-Mail-Vorlage (Betreff und Markdown-Körper) ist erforderlich

## Tägliche Zusammenfassung - `/api/configuration/daily-summary` {#daily-summary---apiconfigurationdaily-summary}
- **Endpunkt**: `/api/configuration/daily-summary`
- **Methode**: GET, POST
- **Beschreibung**: Liest oder aktualisiert den Zusammenfassungsmodus. GET gibt bereinigte Einstellungen, den Zustand des Dispatchers, das nächste Vorkommen und den Zustellstatus der E-Mail zurück. POST speichert `enabled`, `utcTime` (`HH:mm` UTC), `timeZone` (Browser-IANA-Zeitzone vom letzten Speichern) und optional `publicUrl`. Die Aktivierung erfordert ein gültiges SMTP. Die Änderung des Zeitplans legt das nächste **zukünftige** Vorkommen fest.
- **Authentifizierung**: GET erfordert eine gültige Sitzung und ein CSRF-Token. POST erfordert eine Administrator-Sitzung und ein CSRF-Token.
- **Fehlerantworten**:
  - `400`: Ungültige Zeit/Zeitzone, ungültige öffentliche URL oder fehlendes SMTP
  - `401`: Unbefugt
  - `500`: Tägliche Zusammenfassung konnte nicht gelesen oder aktualisiert werden

## Sende Tägliche Zusammenfassung - `/api/configuration/daily-summary/send` {#send-daily-summary---apiconfigurationdaily-summarysend}
- **Endpunkt**: `/api/configuration/daily-summary/send`
- **Methode**: POST
- **Beschreibung**: Sendet einen zusätzlichen aktuellen Status-Snapshot sofort. Verbraucht nicht das nächste geplante Vorkommen. Verwendet die gespeicherte SMTP-Konfiguration. Akzeptiert keine Empfängeradressen in der Anfrage.
- **Authentifizierung**: Erfordert Administrator-Sitzung und CSRF-Token

## Wiederhole Tägliche Zusammenfassung - `/api/configuration/daily-summary/retry` {#retry-daily-summary---apiconfigurationdaily-summaryretry}
- **Endpunkt**: `/api/configuration/daily-summary/retry`
- **Methode**: POST
- **Beschreibung**: Wiederholt fehlgeschlagene Kanäle aus dem persistierten Payload. Optionaler Körper `{ "occurrenceKey": "..." }`; andernfalls wird die letzte fehlgeschlagene E-Mail-Zustellung wiederholt.
- **Authentifizierung**: Erfordert Administrator-Sitzung und CSRF-Token

## Tägliche Zusammenfassung Vorschau - `/api/configuration/daily-summary/preview` {#preview-daily-summary---apiconfigurationdaily-summarypreview}
- **Endpunkt**: `/api/configuration/daily-summary/preview`
- **Methode**: POST
- **Beschreibung**: Rendert die aktuelle Momentaufnahme ohne Senden und ohne Schreiben von Zustellprotokollzeilen.
- **Authentifizierung**: Erfordert gültige Sitzung und CSRF-Token

## Überfälligkeitstoleranz abrufen - `/api/configuration/overdue-tolerance` {#get-overdue-tolerance---apiconfigurationoverdue-tolerance}
- **Endpunkt**: `/api/configuration/overdue-tolerance`
- **Methode**: GET
- **Beschreibung**: Ruft die aktuelle Überfälligkeitstoleranz-Einstellung ab.
- **Antwort**:

  ```json
  {
    "overdue_tolerance": "2h"
  }
  ```

- **Fehlerantworten**:
  - `500`: Abrufen der Überfälligkeits-Toleranz fehlgeschlagen
- **Hinweise**:
  - Gibt die aktuelle Überfälligkeits-Toleranz-Einstellung zurück
  - Wird zur Anzeige der aktuellen Konfiguration verwendet

## Überfälligkeitstoleranz aktualisieren - `/api/configuration/overdue-tolerance` {#update-overdue-tolerance---apiconfigurationoverdue-tolerance}
- **Endpunkt**: `/api/configuration/overdue-tolerance`
- **Methode**: POST
- **Beschreibung**: Aktualisiert die Überfälligkeitstoleranz-Einstellung.
- **Authentifizierung**: Erfordert gültige Sitzung und CSRF-Token
- **Anforderungstext**:

  ```json
  {
    "overdue_tolerance": "2h"
  }
  ```

- **Antwort**:

  ```json
  {
    "message": "Overdue tolerance updated successfully"
  }
  ```

- **Fehlerantworten**:
  - `401`: Nicht autorisiert – Ungültige Sitzung oder CSRF-Token
  - `400`: overdue_tolerance ist erforderlich
  - `500`: Serverfehler bei der Aktualisierung der Überfälligkeits-Toleranz
- **Hinweise**:
  - Aktualisiert die Einstellung für die Toleranz überfälliger Sicherungen (akzeptiert Stringformate wie `"1h"`, `"2h"` usw.; Standard für neue Installationen ist `2h`)
  - Beeinflusst, wann Sicherungen als überfällig gelten
  - Wird vom Prüfer für überfällige Sicherungen verwendet

## Externe API-Sicherheit - `/api/configuration/external-api-security` {#external-api-security---apiconfigurationexternal-api-security}
- **Endpunkt**: `/api/configuration/external-api-security`
- **Methoden**: GET, PATCH
- **Beschreibung**: Liest oder aktualisiert, ob externe APIs einen Schlüssel erfordern, sowie die `/api/upload` Größe und die Rate Limits.
- **Authentifizierung**: Erfordert Admin-Rechte, gültige Sitzung und CSRF-Token
- **PATCH-Body**:

  ```json
  {
    "requireApiKey": false,
    "uploadLimits": {
      "enabled": true,
      "maxBytes": 5242880,
      "perMinute": 20,
      "perHour": 200
    }
  }
  ```

## IP-Zulassungsliste - `/api/configuration/ip-allowlist` {#ip-allowlist---apiconfigurationip-allowlist}
- **Endpunkt**: `/api/configuration/ip-allowlist`
- **Methoden**: GET, PATCH
- **Beschreibung**: Liest oder aktualisiert vertrauenswürdige Proxies und die Admin- / Externe-API-CIDR-Zulassungslisten. Die Aktivierung der Admin-Liste schlägt fehl, wenn die aktuelle Client-IP nicht bereits aufgelistet ist (Loopback ist ausgenommen).
- **Authentifizierung**: Erfordert Admin-Rechte, gültige Sitzung und CSRF-Token
