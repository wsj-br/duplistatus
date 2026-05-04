---
translation_last_updated: '2026-04-18T00:00:19.860Z'
source_file_mtime: '2026-03-05T22:33:28.419Z'
source_file_hash: 5e308885291fd834e969c761cd470e1b54c82eee0c672140c1203f8d9cfca674
translation_language: de
source_file_path: documentation/docs/api-reference/configuration-apis.md
translation_models:
  - qwen/qwen3-235b-a22b-2507
---
# Konfigurationsverwaltung {#configuration-management}

## E-Mail-Konfiguration abrufen - `/api/configuration/email` {#get-email-configuration-apiconfigurationemail}
- **Endpoint**: `/api/configuration/email`
- **Methode**: GET
- **Beschreibung**: Ruft die aktuelle Konfiguration für E-Mail-Benachrichtigungen ab und ob E-Mail-Benachrichtigungen aktiviert/konfiguriert sind.
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
  - Beinhaltet das Feld `hasPassword`, um anzuzeigen, ob ein Passwort gesetzt ist
  - Beinhaltet die Felder `connectionType` (plain|starttls|ssl), `senderName`, `fromAddress` und `requireAuth`
  - Zeigt an, ob E-Mail-Benachrichtigungen für Test- und Produktivbetrieb verfügbar sind
  - Behandelt Fehler bei der Validierung des Master-Schlüssels angemessen

## E-Mail-Konfiguration aktualisieren - `/api/configuration/email` {#update-email-configuration-apiconfigurationemail}
- **Endpoint**: `/api/configuration/email`
- **Methode**: POST
- **Beschreibung**: Aktualisiert die SMTP-E-Mail-Benachrichtigungskonfiguration.
- **Authentifizierung**: Gültige Sitzung und CSRF-Token erforderlich
- **Anfrage-Body**:

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
  - Das Passwort wird separat über den Passwort-Endpoint verwaltet

## E-Mail-Konfiguration löschen - `/api/configuration/email` {#delete-email-configuration-apiconfigurationemail}
- **Endpoint**: `/api/configuration/email`
- **Methode**: DELETE
- **Beschreibung**: Löscht die SMTP-E-Mail-Benachrichtigungskonfiguration.
- **Authentifizierung**: Gültige Sitzung und CSRF-Token erforderlich
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
  - Dieser Vorgang entfernt die SMTP-Konfiguration dauerhaft
  - Gibt 404 zurück, wenn keine Konfiguration zum Löschen vorhanden ist

## E-Mail-Passwort aktualisieren - `/api/configuration/email/password` {#update-email-password-apiconfigurationemailpassword}
- **Endpoint**: `/api/configuration/email/password`
- **Methode**: PATCH
- **Beschreibung**: Aktualisiert das E-Mail-Passwort für die SMTP-Authentifizierung.
- **Authentifizierung**: Gültige Sitzung und CSRF-Token erforderlich
- **Anfrage-Body**:

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
  - Falls keine SMTP-Konfiguration existiert, wird eine minimale Konfiguration aus den bereitgestellten Daten erstellt
  - Der Parameter „config“ ist erforderlich, wenn keine bestehende SMTP-Konfiguration vorhanden ist
  - Das Passwort wird sicher verschlüsselt gespeichert

## CSRF-Token für E-Mail-Passwort abrufen - `/api/configuration/email/password` {#get-email-password-csrf-token-apiconfigurationemailpassword}
- **Endpoint**: `/api/configuration/email/password`
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
  - `500`: Generierung des CSRF-Tokens fehlgeschlagen
- **Hinweise**:
  - Gibt CSRF-Token zurück, das für Passwortaktualisierungen verwendet wird
  - Die Sitzung muss gültig sein, um das Token zu generieren

## Vereinheitlichte Konfiguration abrufen - `/api/configuration/unified` {#get-unified-configuration-apiconfigurationunified}
- **Endpoint**: `/api/configuration/unified`
- **Methode**: GET
- **Beschreibung**: Ruft ein vereinheitlichtes Konfigurationsobjekt ab, das alle Konfigurationsdaten einschließlich Cron-Einstellungen, Benachrichtigungshäufigkeit und Server mit Backups enthält.
- **Authentifizierung**: Gültige Sitzung und CSRF-Token erforderlich
- **Antwort**:

  ```json
  {
    "ntfy": {
      "url": "https://ntfy.sh",
      "topic": "duplistatus-notifications",
      "accessToken": ""
    },
    "templates": {
      "language": "en",
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
    "overdue_tolerance": "1h",
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
  - Beinhaltet Cron-Einstellungen, Benachrichtigungshäufigkeit und Server mit Backups
  - Die E-Mail-Konfiguration enthält das Feld `hasPassword`, jedoch nicht das tatsächliche Passwort
  - Ruft alle Daten parallel ab, um die Leistung zu verbessern

## NTFY-Konfiguration abrufen - `/api/configuration/ntfy` {#get-ntfy-configuration-apiconfigurationntfy}
- **Endpoint**: `/api/configuration/ntfy`
- **Methode**: GET
- **Beschreibung**: Ruft die aktuellen NTFY-Konfigurationseinstellungen ab.
- **Authentifizierung**: Gültige Sitzung und CSRF-Token erforderlich
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

## Benachrichtigungskonfiguration abrufen – `/api/configuration/notifications` {#get-notification-configuration-apiconfigurationnotifications}
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
  - Wird für das Management von Benachrichtigungen bei verspäteten Sicherungen verwendet
  - Gibt einen der folgenden Werte zurück: `"onetime"`, `"every_day"`, `"every_week"`, `"every_month"`

## Benachrichtigungskonfiguration aktualisieren – `/api/configuration/notifications` {#update-notification-configuration-apiconfigurationnotifications}
- **Endpunkt**: `/api/configuration/notifications`
- **Methode**: POST
- **Beschreibung**: Aktualisiert die Benachrichtigungskonfiguration (NTFY-Einstellungen oder Benachrichtigungshäufigkeit).
- **Authentifizierung**: Erfordert gültige Sitzung und CSRF-Token
- **Anfrage-Body**:
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
  - `401`: Nicht autorisiert – Ungültige Sitzung oder CSRF-Token
  - `400`: NTFY-Konfiguration erforderlich oder ungültiger Wert
  - `500`: Serverfehler beim Aktualisieren der Benachrichtigungskonfiguration
- **Hinweise**:
  - Unterstützt sowohl Aktualisierungen der NTFY-Konfiguration als auch der Benachrichtigungshäufigkeit
  - Aktualisiert nur die NTFY-Konfiguration, wenn das Feld „ntfy“ angegeben ist
  - Aktualisiert die Benachrichtigungshäufigkeit, wenn das Feld „value“ angegeben ist
  - Generiert ein Standardthema, falls keines angegeben ist
  - Behält bestehende Konfigurationseinstellungen bei
  - Verwendet das `accessToken`-Feld anstelle separater Felder für Benutzername/Passwort
  - Überprüft den Wert der Benachrichtigungshäufigkeit anhand der zulässigen Optionen
  - Beeinflusst, wie oft Benachrichtigungen über verspätete Sicherungen gesendet werden

## Sicherungseinstellungen aktualisieren – `/api/configuration/backup-settings` {#update-backup-settings-apiconfigurationbackup-settings}
- **Endpunkt**: `/api/configuration/backup-settings`
- **Methode**: POST
- **Beschreibung**: Aktualisiert die Benachrichtigungseinstellungen für bestimmte Server/Sicherungen.
- **Authentifizierung**: Erfordert gültige Sitzung und CSRF-Token
- **Anfrage-Body**:

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
  - `500`: Serverfehler beim Aktualisieren der Sicherungseinstellungen
- **Hinweise**:
  - Aktualisiert die Benachrichtigungseinstellungen für bestimmte Server/Sicherungen
  - Bereinigt Benachrichtigungen über verspätete Sicherungen für deaktivierte Sicherungen
  - Löscht Benachrichtigungen, wenn sich die Timeout-Einstellungen ändern

## Benachrichtigungsvorlagen aktualisieren – `/api/configuration/templates` {#update-notification-templates-apiconfigurationtemplates}
- **Endpunkt**: `/api/configuration/templates`
- **Methode**: POST
- **Beschreibung**: Aktualisiert die Benachrichtigungsvorlagen.
- **Authentifizierung**: Erfordert gültige Sitzung und CSRF-Token
- **Anfrage-Body**:

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
  - `500`: Serverfehler beim Aktualisieren der Benachrichtigungsvorlagen
- **Hinweise**:
  - Aktualisiert Benachrichtigungsvorlagen für verschiedene Sicherungsstatus
  - Behält bestehende Konfigurationseinstellungen bei
  - Vorlagen unterstützen Variablensubstitution

## Überfälligkeitstoleranz abrufen – `/api/configuration/overdue-tolerance` {#get-overdue-tolerance-apiconfigurationoverdue-tolerance}
- **Endpunkt**: `/api/configuration/overdue-tolerance`
- **Methode**: GET
- **Beschreibung**: Ruft die aktuelle Einstellung für die Überfälligkeitstoleranz ab.
- **Antwort**:

  ```json
  {
    "overdue_tolerance": "1h"
  }
  ```

- **Fehlerantworten**:
  - `500`: Abrufen der Überfälligkeitstoleranz fehlgeschlagen
- **Hinweise**:
  - Gibt die aktuelle Einstellung für die Überfälligkeitstoleranz zurück
  - Wird zum Anzeigen der aktuellen Konfiguration verwendet

## Überfälligkeitstoleranz aktualisieren – `/api/configuration/overdue-tolerance` {#update-overdue-tolerance-apiconfigurationoverdue-tolerance}
- **Endpunkt**: `/api/configuration/overdue-tolerance`
- **Methode**: POST
- **Beschreibung**: Aktualisiert die Einstellung für die Überfälligkeitstoleranz.
- **Authentifizierung**: Erfordert gültige Sitzung und CSRF-Token
- **Anfrage-Body**:

  ```json
  {
    "overdue_tolerance": "1h"
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
  - `500`: Serverfehler beim Aktualisieren der Überfälligkeits-Toleranz
- **Hinweise**:
  - Aktualisiert die Einstellung für die Überfälligkeits-Toleranz (akzeptiert String-Format wie „1h“, „2h“ usw.)
  - Beeinflusst, wann Sicherungen als überfällig gelten
  - Wird vom Prüfer für verspätete Sicherungen verwendet
