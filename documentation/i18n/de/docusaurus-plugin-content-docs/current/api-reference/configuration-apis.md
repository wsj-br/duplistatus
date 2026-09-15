# Konfigurationsverwaltung {/* #configuration-management */}

## E-Mail-Konfiguration abrufen - `/api/configuration/email` {/* #get-email-configuration---apiconfigurationemail */}
- **Endpunkt**: `/api/configuration/email`
- **Methode**: GET
- **Beschreibung**: Ruft die aktuelle E-Mail-Benachrichtigungs-Konfiguration ab und ob E-Mail-Benachrichtigungen aktiviert/konfiguriert sind.
- **Authentifizierung**: Erfordert eine gültige Sitzung und ein CSRF-Token
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
  - `400`: Master-Schlüssel ist ungültig - Alle verschlüsselten Passwörter und Einstellungen müssen neu konfiguriert werden
  - `401`: Unautorisiert - Ungültige Sitzung oder CSRF-Token
  - `500`: Fehler beim Abrufen der E-Mail-Konfiguration
- **Hinweise**:
  - Gibt die Konfiguration ohne Passwort zurück, um die Sicherheit zu gewährleisten
  - Enthält das Feld `hasPassword`, um anzuzeigen, ob ein Passwort gesetzt ist
  - Enthält die Felder `connectionType` (plain|starttls|ssl), `senderName`, `fromAddress` und `requireAuth`
  - Gibt an, ob E-Mail-Benachrichtigungen für Test- und Produktionszwecke verfügbar sind
  - Behandelt Fehler bei der Master-Schlüssel-Validierung elegant

## E-Mail-Konfiguration aktualisieren - `/api/configuration/email` {/* #update-email-configuration---apiconfigurationemail */}
- **Endpunkt**: `/api/configuration/email`
- **Methode**: POST
- **Beschreibung**: Aktualisiert die SMTP-E-Mail-Benachrichtigungs-Konfiguration.
- **Authentifizierung**: Erfordert eine gültige Sitzung und ein CSRF-Token
- **Anfragekörper**:

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
  - `400`: Fehlende erforderliche Felder oder ungültige Portnummer
  - `401`: Unautorisiert - Ungültige Sitzung oder CSRF-Token
  - `500`: Fehler beim Speichern der SMTP-Konfiguration
- **Hinweise**:
  - Alle Felder (Host, Port, Benutzername, Passwort, Mailto) sind erforderlich
  - Der Port muss eine gültige Zahl zwischen 1 und 65535 sein
  - Das sichere Feld ist ein boolescher Wert (true für SSL/TLS)
  - Das Passwort wird separat über den Passwort-Endpunkt verwaltet

## E-Mail-Konfiguration löschen - `/api/configuration/email` {/* #delete-email-configuration---apiconfigurationemail */}
- **Endpunkt**: `/api/configuration/email`
- **Methode**: DELETE
- **Beschreibung**: Löscht die SMTP-E-Mail-Benachrichtigungs-Konfiguration.
- **Authentifizierung**: Erfordert gültige Sitzung und CSRF-Token
- **Antwort**:

  ```json
  {
    "success": true,
    "message": "SMTP configuration deleted successfully"
  }
  ```

- **Fehlerantworten**:
  - `401`: Unautorisiert - Ungültige Sitzung oder CSRF-Token
  - `404`: Keine SMTP-Konfiguration zum Löschen gefunden
  - `500`: Fehler beim Löschen der SMTP-Konfiguration
- **Hinweise**:
  - Dieser Vorgang entfernt die SMTP-Konfiguration dauerhaft
  - Gibt 404 zurück, wenn keine Konfiguration zum Löschen existiert
  - Gibt 400 zurück, wenn der Tägliche Zusammenfassungsmodus aktiviert ist, da dieser Modus SMTP erfordert

## E-Mail-Passwort aktualisieren - `/api/configuration/email/password` {/* #update-email-password---apiconfigurationemailpassword */}
- **Endpunkt**: `/api/configuration/email/password`
- **Methode**: PATCH
- **Beschreibung**: Aktualisiert das E-Mail-Passwort für die SMTP-Authentifizierung.
- **Authentifizierung**: Erfordert eine gültige Sitzung und ein CSRF-Token
- **Anfragekörper**:

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
  - `400`: Passwort muss eine Zeichenkette sein oder erforderliche Konfigurationsfelder fehlen
  - `401`: Unautorisiert - Ungültige Sitzung oder CSRF-Token
  - `500`: Fehler beim Aktualisieren des E-Mail-Passworts
- **Hinweise**:
  - Das Passwort kann eine leere Zeichenkette sein, um das Passwort zu löschen
  - Wenn keine SMTP-Konfiguration existiert, wird eine minimale Konfiguration aus den bereitgestellten Konfigurationsdaten erstellt
  - Das Konfigurationsparameter ist erforderlich, wenn keine bestehende SMTP-Konfiguration existiert
  - Das Passwort wird sicher mit Verschlüsselung gespeichert

## E-Mail-Passwort-CSRF-Token abrufen - `/api/configuration/email/password` {/* #get-email-password-csrf-token---apiconfigurationemailpassword */}
- **Endpunkt**: `/api/configuration/email/password`
- **Methode**: GET
- **Beschreibung**: Ruft ein CSRF-Token für E-Mail-Passwort-Operationen ab.
- **Authentifizierung**: Erfordert eine gültige Sitzung
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
  - Gibt das CSRF-Token für die Verwendung mit Passwort-Aktualisierungsoperationen zurück
  - Die Sitzung muss gültig sein, um das Token zu generieren

## Holen Sie sich die vereinheitlichte Konfiguration - `/api/configuration/unified` {/* #get-unified-configuration---apiconfigurationunified */}
- **Endpunkt**: `/api/configuration/unified`
- **Methode**: GET
- **Beschreibung**: Ruft ein vereinheitlichtes Konfigurationsobjekt ab, das alle Konfigurationsdaten einschließlich der Cron-Einstellungen, Benachrichtigungshäufigkeit und Server mit Sicherungen enthält.
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
          "title": "Daily Backup Summary — {summary_date} — ✅ {success_count} Success, ⚠️ {warning_count} Warning, 🕑 {overdue_count} Overdue, 🛑 {error_count} Error, ❌ {fatal_count} Fatal",
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
  - Enthält Cron-Einstellungen, Benachrichtigungshäufigkeit und Server mit Sicherungen
  - Die E-Mail-Konfiguration enthält das `hasPassword`-Feld, aber nicht das tatsächliche Passwort
  - Ruft alle Daten parallel ab, um die Leistung zu verbessern

## Holen Sie sich die NTFY-Konfiguration - `/api/configuration/ntfy` {/* #get-ntfy-configuration---apiconfigurationntfy */}
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
  - `401`: Unautorisiert - Ungültige Sitzung oder CSRF-Token
  - `500`: Fehler beim Abrufen der NTFY-Konfiguration
- **Hinweise**:
  - Gibt die aktuellen NTFY-Konfigurationseinstellungen zurück
  - Wird für die Verwaltung des Benachrichtigungssystems verwendet
  - Erfordert Authentifizierung für den Zugriff auf Konfigurationsdaten

## Holen Sie sich die Benachrichtigungskonfiguration - `/api/configuration/notifications` {/* #get-notification-configuration---apiconfigurationnotifications */}
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
  - `401`: Unautorisiert - Ungültige Sitzung oder CSRF-Token
  - `500`: Fehler beim Abrufen der Konfiguration
- **Hinweise**:
  - Ruft die aktuelle Konfiguration der Benachrichtigungshäufigkeit ab
  - Wird für die Verwaltung von Benachrichtigungen über überfällige Sicherungen verwendet
  - Gibt einen der folgenden Werte zurück: `"onetime"`, `"every_day"`, `"every_week"`, `"every_month"`

## Aktualisieren Sie die Benachrichtigungskonfiguration - `/api/configuration/notifications` {/* #update-notification-configuration---apiconfigurationnotifications */}
- **Endpunkt**: `/api/configuration/notifications`
- **Methode**: POST
- **Beschreibung**: Aktualisiert die Benachrichtigungskonfiguration (NTFY-Einstellungen oder Benachrichtigungshäufigkeit).
- **Authentifizierung**: Erfordert eine gültige Sitzung und ein CSRF-Token
- **Anfragekörper**:
  Für die NTFY-Konfiguration:

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
  - `401`: Unautorisiert - Ungültige Sitzung oder CSRF-Token
  - `400`: NTFY-Konfiguration ist erforderlich oder ungültiger Wert
  - `500`: Serverfehler beim Aktualisieren der Benachrichtigungskonfiguration
- **Hinweise**:
  - Unterstützt sowohl die Aktualisierung der NTFY-Konfiguration als auch der Benachrichtigungshäufigkeit
  - Aktualisiert nur die NTFY-Konfiguration, wenn das ntfy-Feld bereitgestellt wird
  - Aktualisiert die Benachrichtigungshäufigkeit, wenn das value-Feld bereitgestellt wird
  - Generiert ein Standardthema, wenn keines bereitgestellt wird
  - Behält die bestehenden Konfigurationseinstellungen bei
  - Verwendet das `accessToken`-Feld anstelle separater Benutzername/Passwort-Felder
  - Validiert den Wert der Benachrichtigungshäufigkeit gegen die zulässigen Optionen
  - Beeinflusst, wie oft Benachrichtigungen über überfällige Sicherungen gesendet werden

## Aktualisieren Sie die Sicherungseinstellungen - `/api/configuration/backup-settings` {/* #update-backup-settings---apiconfigurationbackup-settings */}
- **Endpunkt**: `/api/configuration/backup-settings`
- **Methode**: POST
- **Beschreibung**: Aktualisiert die Sicherungsbenachrichtigungseinstellungen für bestimmte Server/Sicherungen.
- **Authentifizierung**: Erfordert eine gültige Sitzung und ein CSRF-Token
- **Anfragekörper**:

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
  - `401`: Unautorisiert - Ungültige Sitzung oder CSRF-Token
  - `400`: backupSettings ist erforderlich
  - `500`: Serverfehler beim Aktualisieren der Sicherungseinstellungen
- **Hinweise**:
  - Aktualisiert die Backup-Benachrichtigungseinstellungen für bestimmte Server/Sicherungen
  - Bereinigt überfällige Backup-Benachrichtigungen für deaktivierte Sicherungen
  - Löscht Benachrichtigungen, wenn die Timeout-Einstellungen geändert werden

## Benachrichtigungsvorlagen aktualisieren - `/api/configuration/templates` {/* #update-notification-templates---apiconfigurationtemplates */}
- **Endpunkt**: `/api/configuration/templates`
- **Methode**: POST
- **Beschreibung**: Aktualisiert die Benachrichtigungsvorlagen.
- **Authentifizierung**: Erfordert eine gültige Sitzung und ein CSRF-Token
- **Anfragekörper**:

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
  - `401`: Unautorisiert - Ungültige Sitzung oder CSRF-Token
  - `400`: Vorlagen sind erforderlich
  - `500`: Serverfehler beim Aktualisieren der Benachrichtigungsvorlagen
- **Hinweise**:
  - Aktualisiert Benachrichtigungsvorlagen für verschiedene Backup-Status
  - Behält bestehende Konfigurationseinstellungen bei
  - Vorlagen unterstützen Markdown-E-Mail-Körper und `{placeholder}`-Ersetzung
  - Eine `dailySummary`-E-Mail-Vorlage (Betreff und Markdown-Körper) ist erforderlich

## Tägliche Zusammenfassung - `/api/configuration/daily-summary` {/* #daily-summary---apiconfigurationdaily-summary */}
- **Endpunkt**: `/api/configuration/daily-summary`
- **Methode**: GET, POST
- **Beschreibung**: Liest oder aktualisiert den Zusammenfassungsmodus. GET gibt bereinigte Einstellungen, Dispatcher-Status, nächstes Vorkommen und Zustellstatus zurück. POST speichert `enabled`, `utcTime` (`HH:mm` UTC), `timeZone` (Browser IANA Zeitzone aus der letzten Speicherung), optionale `publicUrl`, und optionale `smtpRecipient` (leer verwendet den SMTP-Empfänger der E-Mail-Einstellungen). Die Aktivierung erfordert gültige SMTP-Einstellungen. Das Ändern von `utcTime` aktualisiert `daily-summary-dispatch` auf `minute hour * * *` UTC und lädt den Cron-Dienst neu. Das Ändern des Zeitplans setzt das nächste **zukünftige** Vorkommen.
- **Authentifizierung**: GET erfordert eine gültige Sitzung und CSRF-Token. POST erfordert eine Administrator-Sitzung und CSRF-Token.
- **Fehlerantworten**:
  - `400`: Ungültige Zeit/Zeitzone, ungültige öffentliche URL, ungültiger SMTP-Empfänger oder fehlender SMTP
  - `401`: Unautorisiert
  - `500`: Fehler beim Lesen oder Aktualisieren der täglichen Zusammenfassung

## Tägliche Zusammenfassung senden - `/api/configuration/daily-summary/send` {/* #send-daily-summary---apiconfigurationdaily-summarysend */}
- **Endpunkt**: `/api/configuration/daily-summary/send`
- **Methode**: POST
- **Beschreibung**: Sendet eine zusätzliche Momentaufnahme des aktuellen Status sofort. Verbraucht nicht das nächste geplante Vorkommen. Verwendet gespeicherte SMTP-Einstellungen. Sendet an `daily_summary.smtpRecipient`, wenn gesetzt, sonst an den SMTP-Empfänger der E-Mail-Einstellungen. Akzeptiert keine Empfängeradressen in der Anfrage. Protokolliert `daily_summary_sent` im Audit-Protokoll (System).
- **Authentifizierung**: Erfordert Administrator-Sitzung und CSRF-Token

## Tägliche Zusammenfassung wiederholen - `/api/configuration/daily-summary/retry` {/* #retry-daily-summary---apiconfigurationdaily-summaryretry */}
- **Endpunkt**: `/api/configuration/daily-summary/retry`
- **Methode**: POST
- **Beschreibung**: Wiederholt fehlgeschlagene Kanäle aus dem persistierten Payload. Optionaler Körper `{ "occurrenceKey": "..." }`; andernfalls wird die letzte fehlgeschlagene E-Mail-Zustellung wiederholt.
- **Authentifizierung**: Erfordert Administrator-Sitzung und CSRF-Token

## Tägliche Zusammenfassung Vorschau - `/api/configuration/daily-summary/preview` {/* #preview-daily-summary---apiconfigurationdaily-summarypreview */}
- **Endpunkt**: `/api/configuration/daily-summary/preview`
- **Methode**: POST
- **Beschreibung**: Rendert die aktuelle Momentaufnahme ohne Senden und ohne Schreiben von Zustellungszeilen.
- **Authentifizierung**: Erfordert gültige Sitzung und CSRF-Token

## Überfällige Toleranz abrufen - `/api/configuration/overdue-tolerance` {/* #get-overdue-tolerance---apiconfigurationoverdue-tolerance */}
- **Endpunkt**: `/api/configuration/overdue-tolerance`
- **Methode**: GET
- **Beschreibung**: Ruft die aktuelle Einstellung für die Überfälligkeitstoleranz ab.
- **Antwort**:

  ```json
  {
    "overdue_tolerance": "2h"
  }
  ```

- **Fehlerantworten**:
  - `500`: Fehler beim Abrufen der Überfälligkeitstoleranz
- **Hinweise**:
  - Gibt die aktuelle Einstellung für die Überfälligkeitstoleranz zurück
  - Wird für die Anzeige der aktuellen Konfiguration verwendet

## Überfällige Toleranz aktualisieren - `/api/configuration/overdue-tolerance` {/* #update-overdue-tolerance---apiconfigurationoverdue-tolerance */}
- **Endpunkt**: `/api/configuration/overdue-tolerance`
- **Methode**: POST
- **Beschreibung**: Aktualisiert die Einstellung für die Überfälligkeitstoleranz.
- **Authentifizierung**: Erfordert eine gültige Sitzung und ein CSRF-Token
- **Anfragekörper**:

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
  - `401`: Unautorisiert - Ungültige Sitzung oder CSRF-Token
  - `400`: overdue_tolerance ist erforderlich
  - `500`: Serverfehler beim Aktualisieren der Überfälligkeitstoleranz
- **Hinweise**:
  - Aktualisiert die Einstellung für die Überfälligkeitstoleranz (akzeptiert String-Format wie `"1h"`, `"2h"`, etc.; Standard für neue Installationen ist `2h`)
  - Beeinflusst, wann Sicherungen als überfällig betrachtet werden
  - Wird vom Überfälligen Backup-Checker verwendet

## Externe API-Sicherheit - `/api/configuration/external-api-security` {/* #external-api-security---apiconfigurationexternal-api-security */}
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

## IP-Zulassungsliste - `/api/configuration/ip-allowlist` {/* #ip-allowlist---apiconfigurationip-allowlist */}
- **Endpunkt**: `/api/configuration/ip-allowlist`
- **Methoden**: GET, PATCH
- **Beschreibung**: Liest oder aktualisiert vertrauenswürdige Proxies und die Admin- / Externe-API-CIDR-Zulassungslisten. Die Aktivierung der Admin-Liste schlägt fehl, wenn die aktuelle Client-IP nicht bereits in der Liste enthalten ist (Loopback ist ausgenommen).
- **Authentifizierung**: Erfordert Admin-Rechte, gültige Sitzung und CSRF-Token
