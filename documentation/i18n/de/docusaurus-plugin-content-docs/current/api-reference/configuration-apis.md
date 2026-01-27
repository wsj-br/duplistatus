# Konfigurationsverwaltung {#configuration-management}

## E-Mail-Konfiguration abrufen - `/api/configuration/email` {#get-email-configuration-apiconfigurationemail}

- **Endpunkt**: `/api/configuration/email`
- **Methode**: GET
- **Beschreibung**: Ruft die aktuelle E-Mail-Benachrichtigungskonfiguration ab und gibt an, ob E-Mail-Benachrichtigungen aktiviert/konfiguriert sind.
- **Authentifizierung**: Erfordert gültige Sitzung und CSRF-Token
- **Antwort** (konfiguriert):
  ```json
  {
    "configured": true,
    "config": {
      "host": "smtp.example.com",
      "port": 465,
      "secure": true,
      "username": "user@example.com",
      "mailto": "admin@example.com",
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
  - `400`: Hauptschlüssel ist ungültig - Alle verschlüsselten Passwörter und Einstellungen müssen neu konfiguriert werden
  - `401`: Nicht autorisiert - Ungültige Sitzung oder CSRF-Token
  - `500`: Fehler beim Abrufen der E-Mail-Konfiguration
- **Hinweise**:
  - Gibt Konfiguration ohne Passwort aus Sicherheitsgründen zurück
  - Enthält das Feld `hasPassword`, um anzuzeigen, ob ein Passwort gesetzt ist
  - Gibt an, ob E-Mail-Benachrichtigungen für Test- und Produktionsnutzung verfügbar sind
  - Behandelt Validierungsfehler des Hauptschlüssels elegant

## E-Mail-Konfiguration aktualisieren - `/api/configuration/email` {#update-email-configuration-apiconfigurationemail}

- **Endpunkt**: `/api/configuration/email`
- **Methode**: POST
- **Beschreibung**: Aktualisiert die SMTP-E-Mail-Benachrichtigungskonfiguration.
- **Authentifizierung**: Erfordert gültige Sitzung und CSRF-Token
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
  - `400`: Erforderliche Felder fehlen oder Port-Nummer ist ungültig
  - `401`: Nicht autorisiert - Ungültige Sitzung oder CSRF-Token
  - `500`: Fehler beim Speichern der SMTP-Konfiguration
- **Hinweise**:
  - Alle Felder (Host, Port, Benutzername, Passwort, mailto) sind erforderlich
  - Port muss eine gültige Zahl zwischen 1 und 65535 sein
  - Sicheres Feld ist boolesch (true für SSL/TLS)
  - Passwort wird separat über den Passwort-Endpunkt verwaltet

## E-Mail-Konfiguration löschen - `/api/configuration/email` {#delete-email-configuration-apiconfigurationemail}

- **Endpunkt**: `/api/configuration/email`
- **Methode**: DELETE
- **Beschreibung**: Löscht die SMTP-E-Mail-Benachrichtigungskonfiguration.
- **Authentifizierung**: Erfordert gültige Sitzung und CSRF-Token
- **Antwort**:
  ```json
  {
    "success": true,
    "message": "SMTP-Konfiguration erfolgreich gelöscht"
  }
  ```
- **Fehlerantworten**:
  - `401`: Nicht autorisiert - Ungültige Sitzung oder CSRF-Token
  - `404`: Keine SMTP-Konfiguration zum Löschen gefunden
  - `500`: Fehler beim Löschen der SMTP-Konfiguration
- **Hinweise**:
  - Dieser Vorgang entfernt die SMTP-Konfiguration dauerhaft
  - Gibt 404 zurück, wenn keine Konfiguration zum Löschen vorhanden ist

## E-Mail-Passwort aktualisieren - `/api/configuration/email/password` {#update-email-password-apiconfigurationemailpassword}

- **Endpunkt**: `/api/configuration/email/password`
- **Methode**: PATCH
- **Beschreibung**: Aktualisiert das E-Mail-Passwort für die SMTP-Authentifizierung.
- **Authentifizierung**: Erfordert gültige Sitzung und CSRF-Token
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
    "message": "E-Mail-Passwort erfolgreich aktualisiert"
  }
  ```
- **Fehlerantworten**:
  - `400`: Passwort muss ein String sein oder erforderliche Konfigurationsfelder fehlen
  - `401`: Nicht autorisiert - Ungültige Sitzung oder CSRF-Token
  - `500`: Fehler beim Aktualisieren des E-Mail-Passworts
- **Hinweise**:
  - Passwort kann ein leerer String sein, um das Passwort zu löschen
  - Wenn keine SMTP-Konfiguration vorhanden ist, wird eine minimale aus der bereitgestellten Konfiguration erstellt
  - Konfigurationsparameter ist erforderlich, wenn keine vorhandene SMTP-Konfiguration vorhanden ist
  - Passwort wird sicher mit Verschlüsselung gespeichert

## E-Mail-Passwort-CSRF-Token abrufen - `/api/configuration/email/password` {#get-email-password-csrf-token-apiconfigurationemailpassword}

- **Endpunkt**: `/api/configuration/email/password`
- **Methode**: GET
- **Beschreibung**: Ruft einen CSRF-Token für E-Mail-Passwort-Operationen ab.
- **Authentifizierung**: Erfordert gültige Sitzung
- **Antwort**:
  ```json
  {
    "csrfToken": "csrf-token-string"
  }
  ```
- **Fehlerantworten**:
  - `401`: Ungültige oder abgelaufene Sitzung
  - `500`: Fehler beim Generieren des CSRF-Tokens
- **Hinweise**:
  - Gibt CSRF-Token zur Verwendung mit Passwort-Update-Operationen zurück
  - Sitzung muss gültig sein, um Token zu generieren

## Einheitliche Konfiguration abrufen - `/api/configuration/unified` {#get-unified-configuration-apiconfigurationunified}

- **Endpunkt**: `/api/configuration/unified`
- **Methode**: GET
- **Beschreibung**: Ruft ein einheitliches Konfigurationsobjekt ab, das alle Konfigurationsdaten einschließlich Cron-Einstellungen, Benachrichtigungshäufigkeit und Server mit Sicherungen enthält.
- **Antwort**:
  ```json
  {
    "ntfy": {
      "url": "https://ntfy.sh",
      "topic": "duplistatus-notifications",
      "accessToken": ""
    },
    "email": {
      "host": "smtp.example.com",
      "port": 465,
      "secure": true,
      "username": "user@example.com",
      "mailto": "admin@example.com",
      "enabled": true,
      "hasPassword": true
    },
    "backupSettings": {
      "Server Name:Backup Name": {
        "notificationEvent": "all",
        "expectedInterval": 24,
        "overdueBackupCheckEnabled": true,
        "intervalUnit": "hours"
      }
    },
    "templates": {
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
      }
    },
    "overdue_tolerance": "1h",
    "serverAddresses": [
      {
        "id": "server-id",
        "name": "Server Name",
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
        "id": "server-id",
        "name": "Server Name",
        "backupName": "Backup Name",
        "server_url": "http://localhost:8200"
      }
    ]
  }
  ```
- **Fehlerantworten**:
  - `500`: Serverfehler beim Abrufen der einheitlichen Konfiguration
- **Hinweise**:
  - Gibt alle Konfigurationsdaten in einer einzelnen Antwort zurück
  - Enthält Cron-Einstellungen, Benachrichtigungshäufigkeit und Server mit Sicherungen
  - E-Mail-Konfiguration enthält das Feld `hasPassword`, aber nicht das tatsächliche Passwort
  - Ruft alle Daten parallel ab, um bessere Leistung zu erzielen

## NTFY-Konfiguration abrufen - `/api/configuration/ntfy` {#get-ntfy-configuration-apiconfigurationntfy}

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
  - `401`: Nicht autorisiert - Ungültige Sitzung oder CSRF-Token
  - `500`: Fehler beim Abrufen der NTFY-Konfiguration
- **Hinweise**:
  - Gibt aktuelle NTFY-Konfigurationseinstellungen zurück
  - Wird für die Verwaltung des Benachrichtigungssystems verwendet
  - Erfordert Authentifizierung für den Zugriff auf Konfigurationsdaten

## Benachrichtigungskonfiguration abrufen - `/api/configuration/notifications` {#get-notification-configuration-apiconfigurationnotifications}

- **Endpunkt**: `/api/configuration/notifications`
- **Methode**: GET
- **Beschreibung**: Ruft die aktuelle Benachrichtigungshäufigkeitskonfiguration ab.
- **Authentifizierung**: Erfordert gültige Sitzung und CSRF-Token
- **Antwort**:
  ```json
  {
    "value": "every_day"
  }
  ```
- **Fehlerantworten**:
  - `401`: Nicht autorisiert - Ungültige Sitzung oder CSRF-Token
  - `500`: Fehler beim Abrufen der Konfiguration
- **Hinweise**:
  - Ruft aktuelle Benachrichtigungshäufigkeitskonfiguration ab
  - Wird für die Verwaltung von Benachrichtigungen zu überfälligen Sicherungen verwendet
  - Gibt eines der folgenden zurück: `"onetime"`, `"every_day"`, `"every_week"`, `"every_month"`

## Benachrichtigungskonfiguration aktualisieren - `/api/configuration/notifications` {#update-notification-configuration-apiconfigurationnotifications}

- **Endpunkt**: `/api/configuration/notifications`
- **Methode**: POST
- **Beschreibung**: Aktualisiert die Benachrichtigungskonfiguration (NTFY-Einstellungen oder Benachrichtigungshäufigkeit).
- **Authentifizierung**: Erfordert gültige Sitzung und CSRF-Token
- **Anfragekörper**:
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
    "message": "Benachrichtigungskonfiguration erfolgreich aktualisiert",
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
  - `500`: Serverfehler beim Aktualisieren der Benachrichtigungskonfiguration
- **Hinweise**:
  - Unterstützt sowohl NTFY-Konfiguration als auch Benachrichtigungshäufigkeit-Updates
  - Aktualisiert nur die NTFY-Konfiguration, wenn das ntfy-Feld bereitgestellt wird
  - Aktualisiert die Benachrichtigungshäufigkeit, wenn das value-Feld bereitgestellt wird
  - Generiert Standard-Topic, wenn keines bereitgestellt wird
  - Behält vorhandene Konfigurationseinstellungen bei
  - Verwendet das Feld `accessToken` anstelle separater Benutzername-/Passwort-Felder
  - Validiert den Benachrichtigungshäufigkeitswert gegen zulässige Optionen
  - Beeinflusst, wie oft Benachrichtigungen zu überfälligen Sicherungen gesendet werden

## Sicherungseinstellungen aktualisieren - `/api/configuration/backup-settings` {#update-backup-settings-apiconfigurationbackup-settings}

- **Endpunkt**: `/api/configuration/backup-settings`
- **Methode**: POST
- **Beschreibung**: Aktualisiert die Sicherungsbenachrichtigungseinstellungen für bestimmte Server/Sicherungen.
- **Authentifizierung**: Erfordert gültige Sitzung und CSRF-Token
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
    "message": "Sicherungseinstellungen erfolgreich aktualisiert"
  }
  ```
- **Fehlerantworten**:
  - `401`: Nicht autorisiert - Ungültige Sitzung oder CSRF-Token
  - `400`: backupSettings ist erforderlich
  - `500`: Serverfehler beim Aktualisieren der Sicherungseinstellungen
- **Hinweise**:
  - Aktualisiert Sicherungsbenachrichtigungseinstellungen für bestimmte Server/Sicherungen
  - Bereinigt Benachrichtigungen zu überfälligen Sicherungen für deaktivierte Sicherungen
  - Löscht Benachrichtigungen, wenn sich die Timeout-Einstellungen ändern

## Benachrichtigungsvorlagen aktualisieren - `/api/configuration/templates` {#update-notification-templates-apiconfigurationtemplates}

- **Endpunkt**: `/api/configuration/templates`
- **Methode**: POST
- **Beschreibung**: Aktualisiert die Benachrichtigungsvorlagen.
- **Authentifizierung**: Erfordert gültige Sitzung und CSRF-Token
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
    "message": "Benachrichtigungsvorlagen erfolgreich aktualisiert"
  }
  ```
- **Fehlerantworten**:
  - `401`: Nicht autorisiert - Ungültige Sitzung oder CSRF-Token
  - `400`: Vorlagen sind erforderlich
  - `500`: Serverfehler beim Aktualisieren der Benachrichtigungsvorlagen
- **Hinweise**:
  - Aktualisiert Benachrichtigungsvorlagen für verschiedene Sicherungsstatus
  - Behält vorhandene Konfigurationseinstellungen bei
  - Vorlagen unterstützen Variablenersetzung

## Überfälligkeitstoleranz abrufen - `/api/configuration/overdue-tolerance` {#get-overdue-tolerance-apiconfigurationoverdue-tolerance}

- **Endpunkt**: `/api/configuration/overdue-tolerance`
- **Methode**: GET
- **Beschreibung**: Ruft die aktuelle Überfälligkeitstoleranz-Einstellung ab.
- **Antwort**:
  ```json
  {
    "overdue_tolerance": "1h"
  }
  ```
- **Fehlerantworten**:
  - `500`: Fehler beim Abrufen der Überfälligkeitstoleranz
- **Hinweise**:
  - Gibt die aktuelle Überfälligkeitstoleranz-Einstellung zurück
  - Wird zur Anzeige der aktuellen Konfiguration verwendet

## Überfälligkeitstoleranz aktualisieren - `/api/configuration/overdue-tolerance` {#update-overdue-tolerance-apiconfigurationoverdue-tolerance}

- **Endpunkt**: `/api/configuration/overdue-tolerance`
- **Methode**: POST
- **Beschreibung**: Aktualisiert die Überfälligkeitstoleranz-Einstellung.
- **Authentifizierung**: Erfordert gültige Sitzung und CSRF-Token
- **Anfragekörper**:
  ```json
  {
    "overdue_tolerance": "1h"
  }
  ```
- **Antwort**:
  ```json
  {
    "message": "Überfälligkeitstoleranz erfolgreich aktualisiert"
  }
  ```
- **Fehlerantworten**:
  - `401`: Nicht autorisiert - Ungültige Sitzung oder CSRF-Token
  - `400`: overdue_tolerance ist erforderlich
  - `500`: Serverfehler beim Aktualisieren der Überfälligkeitstoleranz
- **Hinweise**:
  - Aktualisiert die Überfälligkeitstoleranz-Einstellung (akzeptiert Stringformat wie "1h", "2h" usw.)
  - Bestimmt, wann Sicherungen als überfällig betrachtet werden
  - Wird vom Checker für überfällige Sicherungen verwendet
