# Konfigurationsverwaltung {/* #configuration-management */}

## E-Mail-Konfiguration abrufen - `/api/configuration/email` {/* #get-email-configuration---apiconfigurationemail */}
- **Endpunkt**: `/api/configuration/email`
- **Methode**: GET
- **Beschreibung**: Ruft die aktuelle Konfiguration der E-Mail-Benachrichtigungen ab und gibt an, ob E-Mail-Benachrichtigungen aktiviert/konfiguriert sind.
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
  - `401`: Nicht autorisiert - Ungültige Sitzung oder CSRF-Token
  - `500`: E-Mail-Konfiguration konnte nicht abgerufen werden
- **Hinweise**:
  - Gibt Konfiguration ohne Passwort aus Sicherheitsgründen zurück
  - Enthält `hasPassword`-Feld, um anzuzeigen, ob ein Passwort festgelegt ist
  - Enthält `connectionType` (plain|starttls|ssl), `senderName`, `fromAddress`- und `requireAuth`-Felder
  - Zeigt an, ob E-Mail-Benachrichtigungen für Test- und Produktionsgebrauch verfügbar sind
  - Handhabt Master-Schlüssel-Validierungsfehler ordnungsgemäß

## E-Mail-Konfiguration aktualisieren - `/api/configuration/email` {/* #update-email-configuration---apiconfigurationemail */}
- **Endpunkt**: `/api/configuration/email`
- **Methode**: POST
- **Beschreibung**: Aktualisiert die SMTP-E-Mail-Benachrichtigungskonfiguration.
- **Authentifizierung**: Erfordert eine gültige Sitzung und ein CSRF-Token
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
  - `401`: Nicht autorisiert - Ungültige Sitzung oder CSRF-Token
  - `500`: SMTP-Konfiguration konnte nicht gespeichert werden
- **Hinweise**:
  - Alle Felder (Host, Port, Benutzername, Passwort, Mailto) sind erforderlich
  - Port muss eine gültige Zahl zwischen 1 und 65535 sein
  - Secure-Feld ist boolesch (true für SSL/TLS)
  - Passwort wird separat über den Passwort-Endpunkt verwaltet

## E-Mail-Konfiguration löschen - `/api/configuration/email` {/* #delete-email-configuration---apiconfigurationemail */}
- **Endpunkt**: `/api/configuration/email`
- **Methode**: DELETE
- **Beschreibung**: Löscht die SMTP-E-Mail-Benachrichtigungskonfiguration.
- **Authentifizierung**: Erfordert eine gültige Sitzung und ein CSRF-Token
- **Antwort**:

  ```json
  {
    "success": true,
    "message": "SMTP configuration deleted successfully"
  }
  ```

- **Fehlerantworten**:
  - `401`: Nicht autorisiert - Ungültige Sitzung oder CSRF-Token
  - `404`: Keine zu löschende SMTP-Konfiguration gefunden
  - `500`: SMTP-Konfiguration konnte nicht gelöscht werden
- **Hinweise**:
  - Dieser Vorgang entfernt die SMTP-Konfiguration dauerhaft
  - Gibt 404 zurück, wenn keine zu löschende Konfiguration existiert
  - Gibt 400 zurück, während der tägliche Zusammenfassungsmodus aktiviert ist, da dieser Modus SMTP erfordert

## E-Mail-Passwort aktualisieren - `/api/configuration/email/password` {/* #update-email-password---apiconfigurationemailpassword */}
- **Endpunkt**: `/api/configuration/email/password`
- **Methode**: PATCH
- **Beschreibung**: Aktualisiert das E-Mail-Passwort für die SMTP-Authentifizierung.
- **Authentifizierung**: Erfordert eine gültige Sitzung und ein CSRF-Token
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
  - `400`: Passwort muss eine Zeichenkette sein oder erforderliche Konfigurationsfelder fehlen
  - `401`: Nicht autorisiert - Ungültige Sitzung oder CSRF-Token
  - `500`: E-Mail-Passwort konnte nicht aktualisiert werden
- **Hinweise**:
  - Passwort kann eine leere Zeichenkette sein, um das Passwort zu löschen
  - Wenn keine SMTP-Konfiguration existiert, wird eine minimale Konfiguration aus den bereitgestellten Daten erstellt
  - Config-Parameter ist erforderlich, wenn keine vorhandene SMTP-Konfiguration existiert
  - Passwort wird sicher unter Verwendung von Verschlüsselung gespeichert

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
  - Gibt CSRF-Token für die Verwendung bei Passwortaktualisierungsoperationen zurück
  - Die Sitzung muss gültig sein, um Token zu generieren

## Einheitliche Konfiguration abrufen - `/api/configuration/unified` {/* #get-unified-configuration---apiconfigurationunified */}
- **Endpoint**: `/api/configuration/unified`
- **Methode**: GET
- **Beschreibung**: Ruft ein einheitliches Konfigurationsobjekt ab, das alle Konfigurationsdaten einschließlich Cron-Einstellungen, Benachrichtigungshäufigkeit und Server mit Sicherungen enthält.
- **Authentifizierung**: Erfordert eine gültige Sitzung und ein CSRF-Token
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
  - E-Mail-Konfiguration enthält `hasPassword`-Feld, aber nicht das tatsächliche Passwort
  - Ruft alle Daten parallel ab, um bessere Leistung zu erzielen

## NTFY-Konfiguration abrufen - `/api/configuration/ntfy` {/* #get-ntfy-configuration---apiconfigurationntfy */}
- **Endpoint**: `/api/configuration/ntfy`
- **Methode**: GET
- **Beschreibung**: Ruft die aktuellen NTFY-Konfigurationseinstellungen ab.
- **Authentifizierung**: Erfordert eine gültige Sitzung und ein CSRF-Token
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
  - `401`: Nicht autorisiert - Ungültige Sitzung oder CSRF-Token
  - `500`: NTFY-Konfiguration konnte nicht abgerufen werden
- **Hinweise**:
  - Gibt aktuelle NTFY-Konfigurationseinstellungen zurück
  - Wird für Benachrichtigungssystemverwaltung verwendet
  - Erfordert Authentifizierung zum Zugriff auf Konfigurationsdaten

## Benachrichtigungskonfiguration abrufen - `/api/configuration/notifications` {/* #get-notification-configuration---apiconfigurationnotifications */}
- **Endpoint**: `/api/configuration/notifications`
- **Methode**: GET
- **Beschreibung**: Ruft die aktuelle Benachrichtigungshäufigkeitskonfiguration ab.
- **Authentifizierung**: Erfordert eine gültige Sitzung und ein CSRF-Token
- **Antwort**:

  ```json
  {
    "value": "every_day"
  }
  ```

- **Fehlerantworten**:
  - `401`: Nicht autorisiert - Ungültige Sitzung oder CSRF-Token
  - `500`: Konfiguration konnte nicht abgerufen werden
- **Hinweise**:
  - Ruft aktuelle Benachrichtigungshäufigkeitskonfiguration ab
  - Wird für Verwaltung überfälliger Sicherungsbenachrichtigungen verwendet
  - Gibt einen der folgenden Werte zurück: `"onetime"`, `"every_day"`, `"every_week"`, `"every_month"`

## Benachrichtigungskonfiguration aktualisieren - `/api/configuration/notifications` {/* #update-notification-configuration---apiconfigurationnotifications */}
- **Endpoint**: `/api/configuration/notifications`
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

Für Benachrichtigungshäufigkeit:

  ```json
  {
    "value": "every_week"
  }
  ```

- **Antwort**:
  Für NTFY-Konfiguration:

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

Für Benachrichtigungshäufigkeit:

  ```json
  {
    "value": "every_week"
  }
  ```

- **Verfügbare Werte**: `"onetime"`, `"every_day"`, `"every_week"`, `"every_month"`
- **Fehlerantworten**:
  - `401`: Nicht autorisiert - Ungültige Sitzung oder CSRF-Token
  - `400`: NTFY-Konfiguration ist erforderlich oder ungültiger Wert
  - `500`: Serverfehler bei Aktualisierung der Benachrichtigungskonfiguration
- **Hinweise**:
  - Unterstützt sowohl NTFY-Konfiguration als auch Aktualisierung der Benachrichtigungshäufigkeit
  - Aktualisiert nur die NTFY-Konfiguration, wenn das ntfy-Feld bereitgestellt wird
  - Aktualisiert Benachrichtigungshäufigkeit, wenn das value-Feld bereitgestellt wird
  - Generiert Standard-Thema, wenn keines bereitgestellt wird
  - Erhält bestehende Konfigurationseinstellungen bei
  - Verwendet `accessToken`-Feld anstelle separater Benutzername/Passwort-Felder
  - Validiert Benachrichtigungshäufigkeitswert gegen zulässige Optionen
  - Beeinflusst, wie oft überfällige Benachrichtigungen gesendet werden

## Sicherungseinstellungen aktualisieren - `/api/configuration/backup-settings` {/* #update-backup-settings---apiconfigurationbackup-settings */}
- **Endpoint**: `/api/configuration/backup-settings`
- **Methode**: POST
- **Beschreibung**: Aktualisiert die Benachrichtigungseinstellungen für Sicherungen auf bestimmten Servern.
- **Authentifizierung**: Erfordert eine gültige Sitzung und ein CSRF-Token
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
  - `401`: Nicht autorisiert - Ungültige Sitzung oder CSRF-Token
  - `400`: backupSettings ist erforderlich
  - `500`: Serverfehler bei Aktualisierung der Sicherungseinstellungen
- **Hinweise**:
  - Aktualisiert Sicherungsbenachrichtigungseinstellungen für bestimmte Server/Sicherungen
  - Bereinigt überfällige Sicherungsbenachrichtigungen für deaktivierte Sicherungen
  - Löscht Benachrichtigungen, wenn Timeout-Einstellungen geändert werden

## Vorlagen für Benachrichtigungen aktualisieren - `/api/configuration/templates` {/* #update-notification-templates---apiconfigurationtemplates */}
- **Endpunkt**: `/api/configuration/templates`
- **Methode**: POST
- **Beschreibung**: Aktualisiert die Vorlagen für Benachrichtigungen.
- **Authentifizierung**: Erfordert eine gültige Sitzung und ein CSRF-Token
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
  - `401`: Nicht autorisiert - Ungültige Sitzung oder CSRF-Token
  - `400`: Vorlagen sind erforderlich
  - `500`: Serverfehler beim Aktualisieren der Benachrichtigungsvorlagen
- **Hinweise**:
  - Aktualisiert Benachrichtigungsvorlagen für verschiedene Sicherungsstatus
  - Erhält vorhandene Konfigurationseinstellungen
  - Vorlagen unterstützen Markdown-E-Mail-Textkörper und `{placeholder}`-Ersetzung
  - Eine `dailySummary` E-Mail-Vorlage (Betreff und Markdown-Textkörper) ist erforderlich

## Tägliche Zusammenfassung - `/api/configuration/daily-summary` {/* #daily-summary---apiconfigurationdaily-summary */}
- **Endpunkt**: `/api/configuration/daily-summary`
- **Methode**: GET, POST
- **Beschreibung**: Liest oder aktualisiert den Modus „Tägliche Zusammenfassung“. GET gibt bereinigte Einstellungen, den Dispatcher-Zustand, das nächste Vorkommen und den E-Mail-Zustellstatus zurück. POST speichert `enabled`, `utcTime` (`HH:mm` UTC), `timeZone` (Browser-IANA-Zeitzone von der letzten Speicherung), optionales `publicUrl` und optionales `smtpRecipient` (wenn leer, wird der SMTP-Empfänger aus den E-Mail-Einstellungen verwendet). Das Aktivieren erfordert gültiges SMTP. Das Ändern von `utcTime` aktualisiert `daily-summary-dispatch` auf `minute hour * * *` UTC und lädt den Cron-Dienst neu. Das Ändern des Zeitplans legt das nächste **zukünftige** Vorkommen fest.
- **Authentifizierung**: GET erfordert eine gültige Sitzung und CSRF-Token. POST erfordert eine Administrator-Sitzung und CSRF-Token.
- **Fehlerantworten**:
  - `400`: Ungültige Zeit/Zeitzone, ungültige öffentliche URL, ungültiger SMTP-Empfänger oder fehlender SMTP
  - `401`: Nicht autorisiert
  - `500`: Fehlgeschlagen beim Lesen oder Aktualisieren der Täglichen Zusammenfassung

## Tägliche Zusammenfassung senden - `/api/configuration/daily-summary/send` {/* #send-daily-summary---apiconfigurationdaily-summarysend */}
- **Endpunkt**: `/api/configuration/daily-summary/send`
- **Methode**: POST
- **Beschreibung**: Sendet sofort eine zusätzliche Snapshot-Aufnahme des aktuellen Status. Verbraucht nicht das nächste geplante Vorkommen. Verwendet gespeichertes SMTP. Sendet an `daily_summary.smtpRecipient`, wenn festgelegt, andernfalls an den Empfänger aus den E-Mail-Einstellungen. Akzeptiert keine Empfängeradressen in der Anfrage. Erfasst `daily_summary_sent` im Audit-Protokoll (System).
- **Authentifizierung**: Erfordert eine Administratorsitzung und ein CSRF-Token

## Tägliche Zusammenfassung wiederholen - `/api/configuration/daily-summary/retry` {/* #retry-daily-summary---apiconfigurationdaily-summaryretry */}
- **Endpunkt**: `/api/configuration/daily-summary/retry`
- **Methode**: POST
- **Beschreibung**: Wiederholt fehlgeschlagene Kanäle aus der persistenten Nutzlast. Optionaler Text `{ "occurrenceKey": "..." }`; andernfalls wird die letzte fehlgeschlagene E-Mail-Zustellung wiederholt.
- **Authentifizierung**: Erfordert eine Administratorsitzung und ein CSRF-Token

## Vorschau der täglichen Zusammenfassung - `/api/configuration/daily-summary/preview` {/* #preview-daily-summary---apiconfigurationdaily-summarypreview */}
- **Endpunkt**: `/api/configuration/daily-summary/preview`
- **Methode**: POST
- **Beschreibung**: Rendert den aktuellen Snapshot ohne Versand und ohne Schreiben von Zustellungs-Ledger-Zeilen.
- **Authentifizierung**: Erfordert eine gültige Sitzung und ein CSRF-Token

## Überfälligkeitstoleranz abrufen - `/api/configuration/overdue-tolerance` {/* #get-overdue-tolerance---apiconfigurationoverdue-tolerance */}
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
  - `500`: Abrufen der Überfällig-Toleranz fehlgeschlagen
- **Hinweise**:
  - Gibt die aktuelle Überfällig-Toleranz-Einstellung zurück
  - Wird zur Anzeige der aktuellen Konfiguration verwendet

## Überfälligkeitstoleranz aktualisieren - `/api/configuration/overdue-tolerance` {/* #update-overdue-tolerance---apiconfigurationoverdue-tolerance */}
- **Endpunkt**: `/api/configuration/overdue-tolerance`
- **Methode**: POST
- **Beschreibung**: Aktualisiert die Einstellung für die Überfälligkeitstoleranz.
- **Authentifizierung**: Erfordert eine gültige Sitzung und ein CSRF-Token
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
  - `401`: Nicht autorisiert - Ungültige Sitzung oder CSRF-Token
  - `400`: overdue_tolerance ist erforderlich
  - `500`: Serverfehler beim Aktualisieren der Überfällig-Toleranz
- **Hinweise**:
  - Aktualisiert die Überfällig-Toleranz-Einstellung (akzeptiert Zeichenfolgenformat wie `"1h"`, `"2h"`, usw.; Standard für neue Installationen ist `2h`)
  - Beeinflusst, wann Sicherungen als überfällig gelten
  - Wird vom Überfällig-Sicherungsprüfer verwendet

## Externe API-Sicherheit - `/api/configuration/external-api-security` {/* #external-api-security---apiconfigurationexternal-api-security */}
- **Endpunkt**: `/api/configuration/external-api-security`
- **Methoden**: GET, PATCH
- **Beschreibung**: Liest oder aktualisiert, ob Externe APIs einen Schlüssel erfordern, sowie die `/api/upload`-Größe und Ratenbegrenzungen.
- **Authentifizierung**: Erfordert Admin-Berechtigungen, eine gültige Sitzung und ein CSRF-Token
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
- **Beschreibung**: Liest oder aktualisiert Vertrauenswürdige Proxies und die CIDR-Zulassungslisten für Admin / Externe APIs. Das Aktivieren der Admin-Liste schlägt fehl, es sei denn, die aktuelle Client-IP ist bereits aufgeführt (Loopback ist ausgenommen).
- **Authentifizierung**: Erfordert Admin-Berechtigungen, eine gültige Sitzung und ein CSRF-Token
