---
translation_last_updated: '2026-05-11T14:27:37.302Z'
source_file_mtime: '2026-05-06T23:18:51.418Z'
source_file_hash: 0cded58e5d286a2acbeba8eab5f1de8a42461da04d9e1f6f427314adadc9afc1
translation_language: de
source_file_path: documentation/docs/api-reference/administration-apis.md
translation_models:
  - qwen/qwen3-235b-a22b-2507
---
# Administration {#administration}

## Backups sammeln - `/api/backups/collect` {#collect-backups---apibackupscollect}
- **Endpoint**: `/api/backups/collect`
- **Methode**: POST
- **Beschreibung**: Sammelt Sicherungsdaten direkt von einem Duplicati-Server über dessen API. Dieser Endpunkt erkennt automatisch das beste Verbindungsprotokoll (HTTPS mit SSL-Überprüfung, HTTPS mit selbstsignierten Zertifikaten oder HTTP als Fallback) und stellt eine Verbindung zum Duplicati-Server her, um Sicherungsinformationen abzurufen und in die lokale Datenbank zu übernehmen.
- **Authentifizierung**: Erfordert gültige Sitzung und CSRF-Token
- **Anforderungstext**:

  ```json
  {
    "hostname": "duplicati-server.local",
    "port": 8200,
    "password": "your-password",
    "downloadJson": false
  }
  ```

- **Antwort**:

  ```json
  {
    "success": true,
    "serverName": "Server Name",
    "serverAlias": "My Server",
    "stats": {
      "processed": 5,
      "skipped": 2,
      "errors": 0
    },
    "backupSettings": {
      "added": 2,
      "total": 7
    }
  }
  ```

- **Fehlerantworten**:
  - `400`: Ungültige Anforderungsparameter oder Verbindung fehlgeschlagen
  - `500`: Serverfehler während des Sammelvorgangs
- **Hinweise**: 
  - Der Endpunkt erkennt automatisch das optimale Verbindungsprotokoll (HTTPS → HTTPS mit selbstsignierten Zertifikaten → HTTP)
  - Die Protokollerfassungsversuche erfolgen in der Reihenfolge der Sicherheitspräferenz
  - Verbindungs-Timeouts sind über Umgebungsvariablen konfigurierbar
  - Im Entwicklungsmodus werden gesammelte Daten protokolliert, um das Debugging zu erleichtern
  - Stellt sicher, dass die Sicherungseinstellungen für alle Server und Sicherungen vollständig sind
  - Verwendet den Standardport 8200, wenn keiner angegeben ist
  - Das erkannte Protokoll und die Server-URL werden automatisch in der Datenbank gespeichert
  - `serverAlias` wird aus der Datenbank abgerufen und kann leer sein, wenn kein Alias festgelegt ist
  - Die Oberfläche sollte `serverAlias || serverName` zu Anzeigezwecken verwenden
  - Unterstützt sowohl den JSON-Download als auch direkte API-Sammlungsmethoden

## Sicherungen bereinigen - `/api/backups/cleanup` {#cleanup-backups---apibackupscleanup}
- **Endpoint**: `/api/backups/cleanup`
- **Methode**: POST
- **Beschreibung**: Löscht alte Sicherungsdaten basierend auf der Aufbewahrungsfrist. Dieser Endpunkt hilft dabei, die Datenbankgröße zu verwalten, indem veraltete Sicherungsdatensätze entfernt werden, während aktuelle und wichtige Daten erhalten bleiben.
- **Authentifizierung**: Erfordert gültige Sitzung und CSRF-Token
- **Anforderungstext**:

  ```json
  {
    "retentionPeriod": "6 months"
  }
  ```

- **Aufbewahrungsfristen**: `"6 months"`, `"1 year"`, `"2 years"`, `"Delete all data"`
- **Antwort**:

  ```json
  {
    "message": "Successfully deleted 15 old backups",
    "status": 200
  }
  ```

Für die Option „Alle Daten löschen“:

  ```json
  {
    "message": "Successfully deleted all 15 backups and 3 servers, and cleared configuration settings",
    "status": 200
  }
  ```

- **Fehlerantworten**:
  - `401`: Nicht autorisiert – Ungültige Sitzung oder CSRF-Token
  - `400`: Ungültige Aufbewahrungsfrist angegeben
  - `500`: Serverfehler während der Bereinigung mit detaillierten Fehlerinformationen
- **Hinweise**: 
  - Der Bereinigungsvorgang ist unwiderruflich
  - Sicherungsdaten werden dauerhaft aus der Datenbank gelöscht
  - Geräte-Datensätze bleiben erhalten, auch wenn alle Sicherungen gelöscht werden
  - Wenn „Alle Daten löschen“ ausgewählt ist, werden alle Geräte und Sicherungen entfernt und die Konfiguration wird zurückgesetzt
  - Verbessertes Fehlermeldesystem enthält Details und Stack-Trace im Entwicklungsmodus
  - Unterstützt sowohl zeitbasierte Aufbewahrung als auch vollständige Datenlöschung

## Sicherungsauftrag löschen - `/api/backups/delete-job` {#delete-backup-job---apibackupsdelete-job}
- **Endpoint**: `/api/backups/delete-job`
- **Methode**: DELETE
- **Beschreibung**: Löscht alle Sicherungsdatensätze für eine bestimmte Server-Sicherungs-Kombination. Dieser Endpunkt ist nur im Entwicklungsmodus verfügbar.
- **Authentifizierung**: Erfordert gültige Sitzung und CSRF-Token
- **Anforderungstext**:

  ```json
  {
    "serverId": "server-id",
    "backupName": "Backup Name"
  }
  ```

- **Antwort**:

  ```json
  {
    "message": "Successfully deleted 5 backup record(s) for \"Files\" from server \"My Server\"",
    "status": 200,
    "deletedCount": 5,
    "serverName": "My Server",
    "backupName": "Files"
  }
  ```

- **Fehlerantworten**:
  - `401`: Nicht autorisiert – Ungültige Sitzung oder CSRF-Token
  - `403`: Das Löschen von Sicherungsaufträgen ist nur im Entwicklungsmodus verfügbar
  - `400`: Server-ID und Sicherungsname sind erforderlich
  - `404`: Keine Sicherungen zum Löschen gefunden
  - `500`: Serverfehler während des Löschvorgangs mit detaillierten Fehlerinformationen
- **Hinweise**: 
  - Dieser Vorgang ist nur im Entwicklungsmodus verfügbar
  - Dieser Vorgang ist unwiderruflich
  - Alle Sicherungsdatensätze für die angegebene Server-Sicherungs-Kombination werden dauerhaft gelöscht
  - Gibt die Anzahl der gelöschten Sicherungen und Serverinformationen zurück
  - Verwendet den Server-Alias zur Anzeige, falls verfügbar, andernfalls den Servernamen

## Sicherungspläne synchronisieren - `/api/backups/sync-schedule` {#sync-backup-schedules---apibackupssync-schedule}
- **Endpoint**: `/api/backups/sync-schedule`
- **Methode**: POST
- **Beschreibung**: Synchronisiert Informationen zu Sicherungsplänen von einem Duplicati-Server. Dieser Endpunkt stellt eine Verbindung zum Server her, ruft Planungsinformationen für alle Sicherungen ab und aktualisiert die lokalen Sicherungseinstellungen mit Details wie Wiederholungsintervallen, erlaubten Wochentagen und geplanten Zeitpunkten.
- **Authentifizierung**: Erfordert gültige Sitzung und CSRF-Token
- **Anforderungstext**:

  ```json
  {
    "hostname": "duplicati-server.local",
    "port": 8200,
    "password": "your-password",
    "serverId": "optional-server-id"
  }
  ```

Oder nur mit serverId (verwendet gespeichertes Passwort):

  ```json
  {
    "serverId": "server-id"
  }
  ```

Oder mit serverId und aktualisierten Anmeldedaten:

  ```json
  {
    "serverId": "server-id",
    "hostname": "new-hostname.local",
    "port": 8200,
    "password": "new-password"
  }
  ```

- **Antwort**:

  ```json
  {
    "success": true,
    "serverName": "Server Name",
    "stats": {
      "processed": 5,
      "errors": 0
    }
  }
  ```

Mit Fehlern:

  ```json
  {
    "success": true,
    "serverName": "Server Name",
    "stats": {
      "processed": 3,
      "errors": 2
    },
    "errors": [
      "Backup Name 1: Error message",
      "Backup Name 2: Error message"
    ]
  }
  ```

- **Fehlerantworten**:
  - `400`: Ungültige Anfrageparameter, fehlender Hostname/Passwort, wenn serverId nicht angegeben ist, oder Verbindung fehlgeschlagen
  - `404`: Server nicht gefunden (wenn serverId angegeben ist) oder kein Passwort für Server gespeichert
  - `500`: Serverfehler während der Synchronisierung des Zeitplans
- **Hinweise**: 
  - Der Endpunkt erkennt automatisch das optimale Verbindungsprotokoll (HTTPS → HTTPS mit selbstsigniertem Zertifikat → HTTP)
  - Kann mit nur serverId aufgerufen werden, um gespeicherte Serveranmeldeinformationen zu verwenden
  - Kann mit serverId und neuen Anmeldeinformationen aufgerufen werden, um Verbindungsdaten des Servers zu aktualisieren
  - Kann mit hostname/port/passwort ohne serverId für neue Server aufgerufen werden
  - Aktualisiert Sicherungseinstellungen mit Zeitplaninformationen, einschließlich:
    - `expectedInterval`: Das Wiederholungsintervall (z. B. „Daily“, „Weekly“, „Monthly“)
    - `allowedWeekDays`: Array der erlaubten Wochentage (0=Sonntag, 1=Montag usw.)
    - `time`: Die geplante Zeit für die Sicherung
  - Verarbeitet alle auf dem Server gefundenen Sicherungen
  - Gibt Statistiken über verarbeitete Sicherungen und aufgetretene Fehler zurück
  - Protokolliert Audit-Ereignisse für erfolgreiche und fehlgeschlagene Synchronisierungsvorgänge
  - Verwendet Standardport 8200, wenn nicht anders angegeben

## Serververbindung testen - `/api/servers/test-connection` {#test-server-connection---apiserverstest-connection}
- **Endpoint**: `/api/servers/test-connection`
- **Methode**: POST
- **Beschreibung**: Testet die Verbindung zu einem Duplicati-Server, um sicherzustellen, dass er erreichbar ist.
- **Anfrage-Body**:

  ```json
  {
    "server_url": "http://localhost:8200"
  }
  ```

- **Antwort**:

  ```json
  {
    "success": true,
    "message": "Connection successful"
  }
  ```

- **Fehlerantworten**:
  - `400`: Ungültiges URL-Format oder fehlende Server-URL
  - `500`: Serverfehler während des Verbindungstests
- **Hinweise**: 
  - Der Endpunkt überprüft das URL-Format und testet die Verbindung
  - Gibt Erfolg zurück, wenn der Server mit Status 401 antwortet (erwartet für Login-Endpunkt ohne Anmeldeinformationen)
  - Testet die Verbindung zum Login-Endpunkt des Duplicati-Servers
  - Unterstützt sowohl HTTP als auch HTTPS-Protokolle
  - Verwendet Timeout-Konfiguration für den Verbindungstest

## Server-URL abrufen - `/api/servers/:serverId/server-url` {#get-server-url---apiserversserveridserver-url}
- **Endpoint**: `/api/servers/:serverId/server-url`
- **Methode**: GET
- **Beschreibung**: Ruft die Server-URL für einen bestimmten Server ab.
- **Parameter**:
  - `serverId`: die Serverkennung

- **Antwort**:

  ```json
  {
    "serverId": "server-id",
    "server_url": "http://localhost:8200"
  }
  ```

- **Fehlerantworten**:
  - `404`: Server nicht gefunden
  - `500`: Serverfehler
- **Hinweise**:
  - Gibt die Server-URL für den spezifischen Server zurück
  - Wird für die Verwaltung der Serververbindung verwendet
  - Gibt einen leeren String zurück, wenn keine Server-URL festgelegt ist

## Server-URL aktualisieren - `/api/servers/:serverId/server-url` {#update-server-url---apiserversserveridserver-url}
- **Endpoint**: `/api/servers/:serverId/server-url`
- **Methode**: PATCH
- **Beschreibung**: Aktualisiert die Server-URL für einen bestimmten Server.
- **Authentifizierung**: Erfordert gültige Sitzung und CSRF-Token
- **Parameter**:
  - `serverId`: Die Serverkennung
- **Anforderungstext**:

  ```json
  {
    "server_url": "http://localhost:8200"
  }
  ```

- **Antwort**:

  ```json
  {
    "message": "Server URL updated successfully",
    "serverId": "server-id",
    "serverName": "Server Name",
    "server_url": "http://localhost:8200"
  }
  ```

- **Fehlerantworten**:
  - `401`: Nicht autorisiert – Ungültige Sitzung oder CSRF-Token
  - `400`: Ungültiges URL-Format
  - `404`: Server nicht gefunden
  - `500`: Serverfehler während der Aktualisierung
- **Hinweise**: 
  - Der Endpunkt überprüft das URL-Format vor der Aktualisierung
  - Leere oder null-Werte für Server-URLs sind erlaubt
  - Unterstützt sowohl HTTP als auch HTTPS-Protokolle
  - Gibt aktualisierte Serverinformationen zurück

## Server-Passwort abrufen - `/api/servers/:serverId/password` {#get-server-password---apiserversserveridpassword}
- **Endpoint**: `/api/servers/:serverId/password`
- **Methode**: GET
- **Beschreibung**: Ruft ein CSRF-Token für Server-Passwort-Operationen ab.
- **Authentifizierung**: Gültige Sitzung erforderlich
- **Parameter**:
  - `serverId`: die Serverkennung
- **Antwort**:

  ```json
  {
    "csrfToken": "csrf-token-string",
    "serverId": "server-id"
  }
  ```

- **Fehlerantworten**:
  - `401`: Ungültige oder abgelaufene Sitzung
  - `500`: CSRF-Token konnte nicht generiert werden
- **Hinweise**:
  - Gibt ein CSRF-Token zurück, das bei Passwortaktualisierungen verwendet werden muss
  - Die Sitzung muss gültig sein, um das Token zu generieren

## Server-Passwort aktualisieren - `/api/servers/:serverId/password` {#update-server-password---apiserversserveridpassword}
- **Endpoint**: `/api/servers/:serverId/password`
- **Methode**: PATCH
- **Beschreibung**: Aktualisiert das Passwort für einen bestimmten Server.
- **Authentifizierung**: Erfordert gültige Sitzung und CSRF-Token
- **Parameter**:
  - `serverId`: Die Serverkennung
- **Anforderungstext**:

  ```json
  {
    "password": "new-password"
  }
  ```

- **Antwort**:

  ```json
  {
    "message": "Password updated successfully",
    "serverId": "server-id"
  }
  ```

- **Fehlerantworten**:
  - `400`: Passwort muss ein String sein
  - `401`: Nicht autorisiert – Ungültige Sitzung oder CSRF-Token
  - `500`: Passwortaktualisierung fehlgeschlagen
- **Hinweise**:
  - Das Passwort kann eine leere Zeichenkette sein, um das Passwort zu löschen
  - Das Passwort wird sicher über das Geheimnisseverwaltungssystem gespeichert

## Benutzerverwaltung {#user-management}

### Benutzer auflisten - `/api/users` {#list-users---apiusers}
- **Endpoint**: `/api/users`
- **Methode**: GET
- **Beschreibung**: Listet alle Benutzer mit Seitennummerierung und optionaler Suchfilterung auf. Gibt Benutzerinformationen einschließlich Anmeldeverlauf und Kontostatus zurück.
- **Authentifizierung**: Erfordert Administratorrechte, gültige Sitzung und CSRF-Token
- **Abfrageparameter**:
  - `page` (optional): Seitennummer (Standard: 1)
  - `limit` (optional): Einträge pro Seite (Standard: 50)
  - `search` (optional): Suchbegriff zur Filterung nach Benutzername
- **Antwort**:

  ```json
  {
    "users": [
      {
        "id": "user-id",
        "username": "admin",
        "isAdmin": true,
        "mustChangePassword": false,
        "createdAt": "2024-01-01T00:00:00Z",
        "lastLoginAt": "2024-01-15T10:30:00Z",
        "lastLoginIp": "192.168.1.100",
        "failedLoginAttempts": 0,
        "lockedUntil": null,
        "isLocked": false
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 5,
      "totalPages": 1
    }
  }
  ```

- **Fehlerantworten**:
  - `401`: Nicht autorisiert – Ungültige Sitzung oder CSRF-Token
  - `403`: Verboten – Administratorrechte erforderlich
  - `500`: Interner Serverfehler
- **Hinweise**:
  - Nur für Administratorbenutzer zugänglich
  - Unterstützt Seitennummerierung und Suchfilterung
  - Gibt den Benutzerkontostatus einschließlich Sperrstatus zurück

### Benutzer erstellen - `/api/users` {#create-user---apiusers}
- **Endpoint**: `/api/users`
- **Methode**: POST
- **Beschreibung**: Erstellt ein neues Benutzerkonto. Kann ein temporäres Passwort generieren oder ein vorgegebenes Passwort verwenden.
- **Authentifizierung**: Administratorrechte, gültige Sitzung und CSRF-Token erforderlich
- **Anforderungstext**:

  ```json
  {
    "username": "newuser",
    "password": "optional-password",
    "isAdmin": false,
    "requirePasswordChange": true
  }
  ```

- `username`: Erforderlich, muss 3–50 Zeichen lang sein, eindeutig
  - `password`: Optional, falls nicht angegeben, wird ein sicheres temporäres Passwort generiert
  - `isAdmin`: Optional, Standardwert false
  - `requirePasswordChange`: Optional, Standardwert true
- **Antwort**:

  ```json
  {
    "user": {
      "id": "user-id",
      "username": "newuser",
      "isAdmin": false,
      "mustChangePassword": true
    },
    "temporaryPassword": "generated-password-123"
  }
  ```

- `temporaryPassword` wird nur enthalten, wenn ein Passwort automatisch generiert wurde
- **Fehlerantworten**:
  - `400`: Ungültiges Benutzernamenformat, Verstoß gegen die Passwortrichtlinie oder Validierungsfehler
  - `401`: Nicht autorisiert – Ungültige Sitzung oder CSRF-Token
  - `403`: Verboten – Administratorrechte erforderlich
  - `409`: Benutzername existiert bereits
  - `500`: Interner Serverfehler
- **Hinweise**:
  - Nur für Administratorbenutzer zugänglich
  - Benutzername ist nicht kasesensitiv und wird in Kleinbuchstaben gespeichert
  - Falls kein Passwort angegeben wird, wird ein sicheres 12-stelliges Passwort generiert
  - Generierte temporäre Passwörter werden nur einmal in der Antwort zurückgegeben
  - Die Benutzererstellung wird im Audit-Log protokolliert

### Benutzer aktualisieren - `/api/users/:id` {#update-user---apiusersid}
- **Endpoint**: `/api/users/:id`
- **Methode**: PATCH
- **Beschreibung**: Aktualisiert Benutzerinformationen, einschließlich Benutzername, Administratorstatus, Passwortänderungspflicht und Passwortzurücksetzung.
- **Authentifizierung**: Erfordert Administratorrechte, gültige Sitzung und CSRF-Token
- **Parameter**:
  - `id`: Zu aktualisierende Benutzer-ID
- **Anforderungstext**:

  ```json
  {
    "username": "updated-username",
    "isAdmin": true,
    "requirePasswordChange": false,
    "resetPassword": true
  }
  ```

- Alle Felder sind optional
  - `resetPassword`: Wenn true, wird ein neues temporäres Passwort generiert und `requirePasswordChange` auf true gesetzt
- **Antwort** (mit Passwortzurücksetzung):

  ```json
  {
    "user": {
      "id": "user-id",
      "username": "updated-username",
      "isAdmin": true,
      "mustChangePassword": true
    },
    "temporaryPassword": "new-temp-password-456"
  }
  ```

- **Antwort** (ohne Passwortzurücksetzung):

  ```json
  {
    "user": {
      "id": "user-id",
      "username": "updated-username",
      "isAdmin": true,
      "mustChangePassword": false
    }
  }
  ```

- **Fehlerantworten**:
  - `400`: Ungültige Eingabe oder Validierungsfehler
  - `401`: Nicht autorisiert – Ungültige Sitzung oder CSRF-Token
  - `403`: Zugriff verboten – Administratorrechte erforderlich
  - `404`: Benutzer nicht gefunden
  - `409`: Benutzername existiert bereits (bei Änderung des Benutzernamens)
  - `500`: Interner Serverfehler
- **Hinweise**:
  - Nur für Benutzer mit Administratorrechten zugänglich
  - Änderungen des Benutzernamens werden auf Eindeutigkeit überprüft
  - Beim Zurücksetzen des Passworts wird ein sicheres temporäres 12-stelliges Passwort generiert
  - Alle Änderungen werden im Audit-Log protokolliert

### Benutzer löschen - `/api/users/:id` {#delete-user---apiusersid}
- **Endpoint**: `/api/users/:id`
- **Methode**: DELETE
- **Beschreibung**: Löscht ein Benutzerkonto. Verhindert das Löschen des eigenen Kontos oder des letzten Administrator-Kontos.
- **Authentifizierung**: Erfordert Administratorrechte, gültige Sitzung und CSRF-Token
- **Parameter**:
  - `id`: Zu löschende Benutzer-ID
- **Antwort**:

  ```json
  {
    "success": true,
    "message": "User deleted successfully"
  }
  ```

- **Fehlerantworten**:
  - `400`: Das eigene Konto oder das letzte Admin-Konto kann nicht gelöscht werden
  - `401`: Nicht autorisiert – Ungültige Sitzung oder CSRF-Token
  - `403`: Zugriff verboten – Administratorrechte erforderlich
  - `404`: Benutzer nicht gefunden
  - `500`: Interner Serverfehler
- **Hinweise**:
  - Nur für Benutzer mit Administratorrechten zugänglich
  - Das eigene Konto kann nicht gelöscht werden
  - Das letzte Admin-Konto kann nicht gelöscht werden (mindestens ein Administrator muss erhalten bleiben)
  - Die Löschung eines Benutzers wird im Audit-Log protokolliert
  - Zugehörige Sitzungen werden automatisch gelöscht (Kaskade)

## Audit-Log-Verwaltung {#audit-log-management}

### Audit-Logs auflisten - `/api/audit-log` {#list-audit-logs---apiaudit-log}
- **Endpoint**: `/api/audit-log`
- **Methode**: GET
- **Beschreibung**: Ruft Audit-Log-Einträge mit Filterung, Seitennummerierung und Suchfunktion ab. Unterstützt sowohl seitenbasierte als auch offsetbasierte Paginierung.
- **Authentifizierung**: Erfordert gültige Sitzung und CSRF-Token (angemeldeter Benutzer erforderlich)
- **Abfrageparameter**:
  - `page` (optional): Seitennummer für seitenbasierte Paginierung
  - `offset` (optional): Offset für offsetbasierte Paginierung (hat Vorrang vor Seite)
  - `limit` (optional): Elemente pro Seite (Standard: 50)
  - `startDate` (optional): Filtert Logs ab diesem Datum (ISO-Format)
  - `endDate` (optional): Filtert Logs bis zu diesem Datum (ISO-Format)
  - `userId` (optional): Filter nach Benutzer-ID
  - `username` (optional): Filter nach Benutzername
  - `action` (optional): Filter nach Aktionsname
  - `category` (optional): Filter nach Kategorie (`auth`, `user_management`, `config`, `backup`, `server`)
  - `status` (optional): Filter nach Status (`success`, `failure`, `error`)
- **Antwort**:

  ```json
  {
    "logs": [
      {
        "id": 1,
        "timestamp": "2024-01-15T10:30:00Z",
        "userId": "user-id",
        "username": "admin",
        "action": "login",
        "category": "auth",
        "targetType": "user",
        "targetId": "user-id",
        "status": "success",
        "ipAddress": "192.168.1.100",
        "userAgent": "Mozilla/5.0...",
        "details": {
          "is_admin": true
        },
        "errorMessage": null
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 150,
      "totalPages": 3
    }
  }
  ```

- **Fehlerantworten**:
  - `401`: Nicht autorisiert – Ungültige Sitzung oder CSRF-Token
  - `500`: Interner Serverfehler
- **Hinweise**:
  - Unterstützt sowohl seitenbasierte (`page`) als auch offsetbasierte (`offset`) Paginierung
  - Das Feld `details` enthält geparstes JSON mit zusätzlichem Kontext
  - Alle Abfragen des Audit-Logs werden protokolliert

### Filterwerte für Audit-Log abrufen - `/api/audit-log/filters` {#get-audit-log-filter-values---apiaudit-logfilters}
- **Endpoint**: `/api/audit-log/filters`
- **Methode**: GET
- **Beschreibung**: Ruft verfügbare eindeutige Filterwerte für die Filterung von Audit-Logs ab. Gibt alle unterschiedlichen Aktionen, Kategorien und Status zurück, die in der Audit-Log-Datenbank vorhanden sind. Nützlich zur Befüllung von Filter-Dropdowns in der Benutzeroberfläche.
- **Authentifizierung**: Erfordert gültige Sitzung und CSRF-Token (angemeldeter Benutzer erforderlich)
- **Antwort**:

  ```json
  {
    "actions": [
      "login",
      "logout",
      "user_created",
      "user_updated",
      "config_updated"
    ],
    "categories": [
      "auth",
      "user_management",
      "config",
      "backup",
      "server"
    ],
    "statuses": [
      "success",
      "failure",
      "error"
    ]
  }
  ```

- **Fehlerantworten**:
  - `401`: Nicht autorisiert – Ungültige Sitzung oder CSRF-Token
  - `500`: Interner Serverfehler
- **Hinweise**:
  - Gibt Arrays mit eindeutigen Werten aus der Audit-Log-Datenbank zurück
  - Die Werte sind alphabetisch sortiert
  - Leere Arrays werden zurückgegeben, wenn keine Daten vorhanden sind oder ein Fehler auftritt
  - Wird vom Audit-Protokollbetrachter verwendet, um Filterdropdowns dynamisch zu befüllen

### Audit-Logs herunterladen - `/api/audit-log/download` {#download-audit-logs---apiaudit-logdownload}
- **Endpoint**: `/api/audit-log/download`
- **Methode**: GET
- **Beschreibung**: Lädt Audit-Logs im CSV- oder JSON-Format mit optionaler Filterung herunter. Nützlich für externe Analyse und Berichterstattung.
- **Authentifizierung**: Gültige Sitzung und CSRF-Token erforderlich (angemeldeter Benutzer erforderlich)
- **Abfrageparameter**:
  - `format` (optional): Exportformat – `csv` oder `json` (Standard: `csv`)
  - `startDate` (optional): Filtert Logs ab diesem Datum (ISO-Format)
  - `endDate` (optional): Filtert Logs bis zu diesem Datum (ISO-Format)
  - `userId` (optional): Filter nach Benutzer-ID
  - `username` (optional): Filter nach Benutzername
  - `action` (optional): Filter nach Aktionsname
  - `category` (optional): Filter nach Kategorie
  - `status` (optional): Filter nach Status
- **Antwort** (CSV):
  - Content-Type: `text/csv`
  - Content-Disposition: `attachment; filename="audit-log-YYYY-MM-DD.csv"`
  - CSV-Datei mit Überschriften: ID, Zeitstempel, Benutzer-ID, Benutzername, Aktion, Kategorie, Zieltyp, Ziel-ID, Status, IP-Adresse, User-Agent, Details, Fehlermeldung
- **Antwort** (JSON):
  - Content-Type: `application/json`
  - Content-Disposition: `attachment; filename="audit-log-YYYY-MM-DD.json"`
  - JSON-Array mit Einträgen aus dem Audit-Log
- **Fehlerantworten**:
  - `400`: Keine Logs zum Exportieren vorhanden
  - `401`: Nicht autorisiert – Ungültige Sitzung oder CSRF-Token
  - `500`: Interner Serverfehler
- **Hinweise**:
  - Exportlimit beträgt 10.000 Datensätze
  - CSV-Format behandelt Sonderzeichen korrekt
  - Das Feld „Details“ im CSV ist als JSON-String serialisiert
  - Der Dateiname enthält das aktuelle Datum

### Audit-Logs bereinigen - `/api/audit-log/cleanup` {#cleanup-audit-logs---apiaudit-logcleanup}
- **Endpoint**: `/api/audit-log/cleanup`
- **Methode**: POST
- **Beschreibung**: Löst manuell die Bereinigung alter Audit-Logs basierend auf der Aufbewahrungsfrist aus. Unterstützt den Trockenlauf-Modus, um eine Vorschau der zu löschenden Einträge anzuzeigen.
- **Authentifizierung**: Administratorrechte, gültige Sitzung und CSRF-Token erforderlich
- **Anforderungstext**:

  ```json
  {
    "retentionDays": 90,
    "dryRun": false
  }
  ```

- `retentionDays` (optional): Überschreibt die Aufbewahrungstage (30–365), andernfalls wird der konfigurierte Wert verwendet
  - `dryRun` (optional): Wenn true, wird nur angezeigt, was gelöscht würde, ohne tatsächlich zu löschen
- **Response** (Trockenlauf):

  ```json
  {
    "dryRun": true,
    "wouldDeleteCount": 50,
    "oldestRemaining": "2024-01-01T00:00:00Z",
    "retentionDays": 90,
    "cutoffDate": "2024-01-01"
  }
  ```

- **Response** (tatsächliche Bereinigung):

  ```json
  {
    "success": true,
    "deletedCount": 50,
    "oldestRemaining": "2024-01-01T00:00:00Z",
    "retentionDays": 90
  }
  ```

- **Fehlerantworten**:
  - `400`: Ungültige Beibehaltungstage (muss zwischen 30 und 365 liegen)
  - `401`: Nicht autorisiert – Ungültige Sitzung oder CSRF-Token
  - `403`: Zugriff verboten – Administratorrechte erforderlich
  - `500`: Interner Serverfehler
- **Hinweise**:
  - Nur für Administratorbenutzer zugänglich
  - Standardmäßige Beibehaltung beträgt 90 Tage, wenn nicht konfiguriert
  - Der Bereinigungsvorgang wird im Audit-Log protokolliert
  - Der Trockenlauf-Modus ist nützlich, um die Auswirkungen der Bereinigung vorab einzusehen

### Audit-Protokoll-Beibehaltung abrufen - `/api/audit-log/retention` {#get-audit-log-retention---apiaudit-logretention}
- **Endpunkt**: `/api/audit-log/retention`
- **Methode**: GET
- **Beschreibung**: Ruft die aktuelle Konfiguration für die Beibehaltung des Audit-Logs in Tagen ab.
- **Authentifizierung**: Gültige Sitzung und CSRF-Token erforderlich (kein angemeldeter Benutzer erforderlich)
- **Antwort**:

  ```json
  {
    "retentionDays": 90
  }
  ```

- **Fehlerantworten**:
  - `500`: Interner Serverfehler
- **Hinweise**:
  - Standardmäßige Beibehaltung beträgt 90 Tage, wenn nicht konfiguriert
  - Kann ohne Authentifizierung abgerufen werden (schreibgeschützt)

### Audit-Protokoll-Beibehaltung aktualisieren - `/api/audit-log/retention` {#update-audit-log-retention---apiaudit-logretention}
- **Endpunkt**: `/api/audit-log/retention`
- **Methode**: PATCH
- **Beschreibung**: Aktualisiert die Beibehaltungsdauer des Audit-Logs in Tagen. Diese Einstellung legt fest, wie lange Audit-Logs vor der automatischen Bereinigung aufbewahrt werden.
- **Authentifizierung**: Administratorrechte, gültige Sitzung und CSRF-Token erforderlich
- **Anforderungstext**:

  ```json
  {
    "retentionDays": 120
  }
  ```

- `retentionDays`: Erforderlich, muss zwischen 30 und 365 Tagen liegen
- **Response**:

  ```json
  {
    "success": true,
    "retentionDays": 120
  }
  ```

- **Fehlerantworten**:
  - `400`: Ungültige Beibehaltungstage (muss zwischen 30 und 365 liegen)
  - `401`: Nicht autorisiert – Ungültige Sitzung oder CSRF-Token
  - `403`: Zugriff verboten – Administratorrechte erforderlich
  - `500`: Interaler Serverfehler
- **Hinweise**:
  - Nur für Administrator-Benutzer zugänglich
  - Konfigurationsänderungen werden im Audit-Log protokolliert
  - Die Aufbewahrungsfrist wirkt sich auf automatische und manuelle Bereinigungsvorgänge aus

## Database Management {#database-management}

### Datenbank sichern - `/api/database/backup` {#backup-database---apidatabasebackup}
- **Endpunkt**: `/api/database/backup`
- **Methode**: GET
- **Beschreibung**: Erstellt eine Sicherung der Datenbank im binären Format (.db) oder im SQL-Format (.sql). Die Sicherungsdatei wird automatisch mit einem zeitgestempelten Dateinamen heruntergeladen.
- **Authentifizierung**: Erfordert Administratorrechte, gültige Sitzung und CSRF-Token
- **Abfrageparameter**:
  - `format` (optional): Backup-Format - `db` (binär) oder `sql` (SQL-Dump). Standard: `db`
- **Antwort**:
  - Content-Type: `application/octet-stream` (für .db) oder `text/plain` (für .sql)
  - Content-Disposition: `attachment; filename="duplistatus-backup-YYYY-MM-DDTHH-MM-SS.db"` oder `.sql`
  - Binärinhalt der Datei (für .db) oder SQL-Textinhalt (für .sql)
- **Fehlerantworten**:
  - `400`: Ungültiges Format (muss "db" oder "sql" sein)
  - `401`: Nicht autorisiert – Ungültige Sitzung oder CSRF-Token
  - `403`: Zugriff verboten – Administratorrechte erforderlich
  - `500`: Erstellung des Datenbank-Backups fehlgeschlagen
- **Hinweise**:
  - Nur für Administrator-Benutzer zugänglich
  - Das binäre Format verwendet die Backup-Methode von SQLite zur Sicherstellung der Integrität
  - Das SQL-Format erstellt einen Text-Dump aller Datenbankinhalte
  - Der Zeitstempel im Dateinamen verwendet die lokale Zeitzone des Servers
  - Der Backup-Vorgang wird im Audit-Log protokolliert
  - Temporäre Dateien werden nach dem Download automatisch bereinigt

### Datenbank wiederherstellen - `/api/database/restore` {#restore-database---apidatabaserestore}
- **Endpunkt**: `/api/database/restore`
- **Methode**: POST
- **Beschreibung**: Stellt die Datenbank aus einer Sicherungsdatei (.db oder .sql-Format) wieder her. Erstellt vor der Wiederherstellung eine Sicherungskopie und löscht alle Sitzungen nach der Wiederherstellung aus Sicherheitsgründen.
- **Authentifizierung**: Erfordert Administratorrechte, gültige Sitzung und CSRF-Token
- **Anfrage-Body**: FormData mit einem Dateifeld namens `database`
  - Die Datei muss entweder `.db`, `.sqlite`, `.sqlite3` (binäres Format) oder `.sql` (SQL-Format) sein
  - Maximale Dateigröße: 100 MB
- **Antwort**:

  ```json
  {
    "success": true,
    "message": "Database restored successfully from DB file",
    "safetyBackupPath": "duplistatus-backup-YYYY-MM-DDTHH-MM-SS.db",
    "requiresReauth": true
  }
  ```

- **Fehlerantworten**:
  - `400`: Keine Datei angegeben, Dateigröße überschritten, ungültiges Dateiformat oder Datenbank-Integritätsprüfung fehlgeschlagen
  - `401`: Nicht autorisiert – Ungültige Sitzung oder CSRF-Token
  - `403`: Zugriff verboten – Administratorrechte erforderlich
  - `500`: Wiederherstellung der Datenbank fehlgeschlagen (ursprüngliche Datenbank wird aus dem Sicherheits-Backup wiederhergestellt, falls die Wiederherstellung fehlschlägt)
- **Hinweise**:
  - Nur für Administrator-Benutzer zugänglich
  - Erstellt automatisch ein Sicherheits-Backup vor der Wiederherstellung
  - Unterstützt sowohl das binäre (.db) als auch das SQL-Format (.sql)
  - Überprüft die Datenbankintegrität nach der Wiederherstellung
  - Falls die Wiederherstellung fehlschlägt, wird automatisch aus dem Sicherheits-Backup wiederhergestellt
  - Alle Sitzungen werden nach erfolgreicher Wiederherstellung aus Sicherheitsgründen gelöscht
  - Gibt `requiresReauth: true` zurück, um anzuzeigen, dass sich der Benutzer erneut anmelden muss
  - Der Wiederherstellungsvorgang wird im Audit-Log protokolliert
  - Für das SQL-Format wird der SQL-Inhalt vor der Ausführung überprüft
  - Die Datenbankverbindung wird nach der Wiederherstellung neu initialisiert
  - Alle Caches werden nach der Wiederherstellung ungültig gemacht

## Backup-Zeitstempel {#backup-timestamps}

### Zeitstempel der letzten Sicherung abrufen - `/api/backups/last-timestamps` {#get-last-backup-timestamps---apibackupslast-timestamps}
- **Endpunkt**: `/api/backups/last-timestamps`
- **Methode**: GET
- **Beschreibung**: Ruft den Zeitstempel der letzten Sicherung für jede Kombination aus Server und Sicherung ab. Gibt eine Zuordnung für eine einfache Nachschlagefunktion zurück.
- **Authentifizierung**: Erfordert gültige Sitzung und CSRF-Token
- **Antwort**:

  ```json
  {
    "timestamps": {
      "server-id-1:Backup Name 1": "2024-03-20T10:00:00Z",
      "server-id-1:Backup Name 2": "2024-03-20T11:00:00Z",
      "server-id-2:Backup Name 1": "2024-03-20T12:00:00Z"
    },
    "raw": [
      {
        "server_name": "Server Name",
        "server_id": "server-id-1",
        "backup_name": "Backup Name 1",
        "date": "2024-03-20T10:00:00Z"
      }
    ]
  }
  ```

- **Fehlerantworten**:
  - `401`: Nicht autorisiert – Ungültige Sitzung oder CSRF-Token
  - `500`: Abrufen der letzten Backup-Zeitstempel fehlgeschlagen
- **Hinweise**:
  - Gibt sowohl eine Map (zur einfachen Suche nach `server_id:backup_name`) als auch das rohe Array-Format zurück
  - Beinhaltet Cache-Control-Header, um Caching zu verhindern
  - Nützlich zur Verfolgung der letzten Sicherungszeiten über alle Server-Sicherungs-Kombinationen hinweg
  - Zeitstempel sind im ISO-Format

## Verwaltung der Anwendungsprotokolle {#application-logs-management}

### Anwendungsprotokolle abrufen - `/api/application-logs` {#get-application-logs---apiapplication-logs}
- **Endpunkt**: `/api/application-logs`
- **Methode**: GET
- **Beschreibung**: Ruft Einträge aus den Anwendungsprotokolldateien ab. Unterstützt das Lesen der aktuellen und rotierten Protokolldateien mit Tail-Funktionalität.
- **Authentifizierung**: Erfordert Administratorrechte, gültige Sitzung und CSRF-Token
- **Abfrageparameter**:
  - `file` (optional): Name der zu lesenden Protokolldatei – `application.log`, `application.log.1`, `application.log.2`, usw. Wenn nicht angegeben, wird eine Liste der verfügbaren Dateien zurückgegeben
  - `tail` (optional): Anzahl der zurückzugebenden Zeilen vom Ende der Datei (Standard: 1000, minimal: 1, maximal: 10000)
- **Antwort** (mit Dateiparameter):

  ```json
  {
    "logs": "log content as string...",
    "fileSize": 1024000,
    "lastModified": "2024-03-20T10:00:00Z",
    "lineCount": 5000,
    "currentFile": "application.log",
    "availableFiles": ["application.log", "application.log.1", "application.log.2"]
  }
  ```

- **Antwort** (ohne Dateiparameter):

  ```json
  {
    "logs": "",
    "fileSize": 0,
    "lastModified": "2024-03-20T10:00:00Z",
    "lineCount": 0,
    "currentFile": "",
    "availableFiles": ["application.log", "application.log.1", "application.log.2"]
  }
  ```

- **Fehlerantworten**:
  - `400`: Ungültiger Tail-Parameter (muss zwischen 1 und 10000 liegen) oder ungültiges Format des Dateiparameters
  - `401`: Nicht autorisiert – Ungültige Sitzung oder CSRF-Token
  - `403`: Zugriff verboten – Administratorrechte erforderlich
  - `404`: Protokolldatei nicht gefunden
  - `500`: Lesen der Protokolldatei fehlgeschlagen
- **Hinweise**:
  - Nur für Administratorbenutzer zugänglich
  - Unterstützt das Lesen der aktuellen Protokolldatei und rotierter Protokolldateien (bis zu 10 rotierte Dateien)
  - Gibt die letzten N Zeilen (Tail) aus der angegebenen Protokolldatei zurück
  - Der Name der Protokolldatei wird über eine Umgebungsvariable festgelegt (Standard: `application.log`)
  - Gibt eine Liste der verfügbaren Protokolldateien zurück, wenn kein Dateiparameter angegeben ist
  - Dateinamen werden validiert, um Verzeichnisdurchlaufangriffe zu verhindern
  - Rotierte Dateien sind fortlaufend nummeriert (`.1`, `.2`, usw.)

### Anwendungsprotokolle exportieren - `/api/application-logs/export` {#export-application-logs---apiapplication-logsexport}
- **Endpunkt**: `/api/application-logs/export`
- **Methode**: GET
- **Beschreibung**: Exportiert Anwendungsprotokolleinträge im gefilterten Textformat. Unterstützt Filterung nach Protokollstufe und Suchbegriff.
- **Authentifizierung**: Erfordert Administratorrechte, gültige Sitzung und CSRF-Token
- **Abfrageparameter**:
  - `file` (erforderlich): Name der zu exportierenden Protokolldatei – `application.log`, `application.log.1`, `application.log.2`, usw.
  - `logLevels` (optional): Kommagetrennte Liste der einzuschließenden Protokollstufen – `INFO`, `WARN`, `ERROR` (Standard: `INFO,WARN,ERROR`)
  - `search` (optional): Suchbegriff zur Filterung der Protokollzeilen (nicht beachtungssensibel)
- **Antwort**:
  - Content-Type: `text/plain`
  - Content-Disposition: `attachment; filename="duplistatus-logs-YYYY-MM-DDTHH-MM-SS.txt"`
  - Gefilterter Protokollinhalt als Nur-Text
- **Fehlerantworten**:
  - `400`: Dateiparameter ist erforderlich oder hat ein ungültiges Format
  - `401`: Nicht autorisiert – Ungültige Sitzung oder CSRF-Token
  - `403`: Zugriff verboten – Administratorrechte erforderlich
  - `500`: Export der Protokolle fehlgeschlagen
- **Hinweise**:
  - Nur für Administratorbenutzer zugänglich
  - Exportiert gefilterte Protokolleinträge basierend auf Protokollstufe und Suchkriterien
  - Unterstützt Filterung nach Protokollstufen: `INFO`, `WARN`, `ERROR`
  - Die Filterung nach Suchbegriff erfolgt nicht beachtungssensibel
  - Leere Zeilen werden automatisch herausgefiltert
  - Der Name der Protokolldatei wird über eine Umgebungsvariable festgelegt (Standard: `application.log`)
  - Dateinamen werden validiert, um Verzeichnisdurchlaufangriffe zu verhindern
  - Der exportierten Datei wird ein Zeitstempel in den Dateinamen eingefügt
  - Nützlich für externe Analyse und Fehlerbehebung
