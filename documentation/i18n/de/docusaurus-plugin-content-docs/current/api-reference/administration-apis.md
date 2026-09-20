# Administration {/* #administration */}

## Backups sammeln - `/api/backups/collect` {/* #collect-backups---apibackupscollect */}
- **Endpunkt**: `/api/backups/collect`
- **Methode**: POST
- **Beschreibung**: Sammelt Sicherungsdaten direkt von einem Duplicati-Server über dessen API. Dieser Endpunkt erkennt automatisch das beste Verbindungsprotokoll (HTTPS mit SSL-Validierung, HTTPS mit selbstsignierten Zertifikaten oder HTTP als Fallback) und stellt eine Verbindung zum Duplicati-Server her, um Backup-Informationen abzurufen und in der lokalen Datenbank zu verarbeiten.
- **Authentifizierung**: Erfordert eine gültige Sitzung und ein CSRF-Token
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
  - `400`: Ungültige Anfrageparameter oder Verbindung fehlgeschlagen
  - `500`: Serverfehler während der Sicherungssammlung
- **Hinweise**: 
  - Der Endpunkt erkennt automatisch das optimale Verbindungsprotokoll (HTTPS → HTTPS mit selbstsigniertem Zertifikat → HTTP)
  - Protokollerfassungsversuche erfolgen in der Reihenfolge der Sicherheitspräferenz
  - Verbindungs-Timeouts sind über Umgebungsvariablen konfigurierbar
  - Protokolle sammeln Daten im Entwicklungsmodus für Debugging-Zwecke
  - Stellt sicher, dass die Sicherungseinstellungen für alle Server und Sicherungen vollständig sind
  - Verwendet Standardport 8200, wenn nicht angegeben
  - Das erkannte Protokoll und die Server-URL werden automatisch in der Datenbank gespeichert
  - `serverAlias` wird aus der Datenbank abgerufen und kann leer sein, wenn kein Alias festgelegt ist
  - Das Frontend sollte `serverAlias || serverName` zu Anzeigezwecken verwenden
  - Unterstützt sowohl JSON-Download als auch direkte API-Sammlungsmethoden

## Sicherungen bereinigen - `/api/backups/cleanup` {/* #cleanup-backups---apibackupscleanup */}
- **Endpunkt**: `/api/backups/cleanup`
- **Methode**: POST
- **Beschreibung**: Löscht alte Sicherungsdaten basierend auf der Aufbewahrungsfrist. Dieser Endpunkt hilft bei der Verwaltung der Datenbankgröße, indem veraltete Sicherungsdatensätze entfernt werden, während aktuelle und wichtige Daten erhalten bleiben.
- **Authentifizierung**: Erfordert eine gültige Sitzung und ein CSRF-Token
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

Für die Option "Alle Daten löschen":

  ```json
  {
    "message": "Successfully deleted all 15 backups and 3 servers, and cleared configuration settings",
    "status": 200
  }
  ```

- **Fehlerantworten**:
  - `401`: Nicht autorisiert - Ungültige Sitzung oder CSRF-Token
  - `400`: Ungültiger Aufbewahrungszeitraum angegeben
  - `500`: Serverfehler während des Bereinigungsvorgangs mit detaillierten Fehlerinformationen
- **Hinweise**: 
  - Der Bereinigungsvorgang ist unwiderruflich
  - Sicherungsdaten werden dauerhaft aus der Datenbank gelöscht
  - Computerdatensätze bleiben erhalten, auch wenn alle Sicherungen gelöscht werden
  - Wenn "Alle Daten löschen" ausgewählt ist, werden alle Computer und Sicherungen entfernt und die Konfiguration geleert
  - Erweiterte Fehlerberichterstattung enthält Details und Stack-Trace im Entwicklungsmodus
  - Unterstützt sowohl zeitbasierte Aufbewahrung als auch vollständige Datenlöschung

## Sicherungsauftrag löschen - `/api/backups/delete-job` {/* #delete-backup-job---apibackupsdelete-job */}
- **Endpunkt**: `/api/backups/delete-job`
- **Methode**: DELETE
- **Beschreibung**: Löscht alle Sicherungsdatensätze für eine bestimmte Server-Sicherungs-Kombination. Dieser Endpunkt ist nur im Entwicklungsmodus verfügbar.
- **Authentifizierung**: Erfordert eine gültige Sitzung und ein CSRF-Token
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
  - `401`: Nicht autorisiert - Ungültige Sitzung oder CSRF-Token
  - `403`: Löschen von Sicherungsaufträgen ist nur im Entwicklungsmodus verfügbar
  - `400`: Server-ID und Sicherungsname sind erforderlich
  - `404`: Keine zu löschenden Sicherungen gefunden
  - `500`: Serverfehler während des Löschvorgangs mit detaillierten Fehlerinformationen
- **Hinweise**: 
  - Dieser Vorgang ist nur im Entwicklungsmodus verfügbar
  - Dieser Vorgang ist unwiderruflich
  - Alle Sicherungsdatensätze für die angegebene Server-Sicherungskombination werden dauerhaft gelöscht
  - Gibt die Anzahl der gelöschten Sicherungen und Serverinformationen zurück
  - Verwendet Server-Alias zur Anzeige, falls verfügbar, andernfalls greift es auf den Servernamen zurück

## Sicherungszeitpläne synchronisieren - `/api/backups/sync-schedule` {/* #sync-backup-schedules---apibackupssync-schedule */}
- **Endpunkt**: `/api/backups/sync-schedule`
- **Methode**: POST
- **Beschreibung**: Synchronisiert Sicherungszeitplaninformationen von einem Duplicati-Server. Dieser Endpunkt stellt eine Verbindung zum Server her, ruft Zeitplaninformationen für alle Sicherungen ab und aktualisiert die lokalen Sicherungseinstellungen mit Zeitplandetails einschließlich Wiederholungsintervallen, zulässigen Wochentagen und Zeitplanzeiten.
- **Authentifizierung**: Erfordert eine gültige Sitzung und ein CSRF-Token
- **Anforderungstext**:

  ```json
  {
    "hostname": "duplicati-server.local",
    "port": 8200,
    "password": "your-password",
    "serverId": "optional-server-id"
  }
  ```

Oder nur mit serverId (verwendet das gespeicherte Passwort):

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
  - `400`: Ungültige Anfrageparameter, fehlender Hostname/Passwort wenn serverId nicht bereitgestellt wird, oder Verbindung fehlgeschlagen
  - `404`: Server nicht gefunden (wenn serverId bereitgestellt wird) oder kein Passwort für Server gespeichert
  - `500`: Serverfehler während der Zeitplan-Synchronisierung
- **Hinweise**: 
  - Der Endpunkt erkennt automatisch das optimale Verbindungsprotokoll (HTTPS → HTTPS mit selbstsigniertem Zertifikat → HTTP)
  - Kann nur mit serverId aufgerufen werden, um gespeicherte Server-Anmeldeinformationen zu verwenden
  - Kann mit serverId und neuen Anmeldeinformationen aufgerufen werden, um Server-Verbindungsdetails zu aktualisieren
  - Kann mit Hostname/Port/Passwort ohne serverId für neue Server aufgerufen werden
  - Aktualisiert Sicherungseinstellungen mit Zeitplaninformationen einschließlich:
    - `expectedInterval`: Das Wiederholungsintervall (z.B. "Täglich", "Wöchentlich", "Monatlich")
    - `allowedWeekDays`: Array der erlaubten Wochentage (0=Sonntag, 1=Montag usw.)
    - `time`: Die geplante Zeit für die Sicherung
  - Verarbeitet alle auf dem Server gefundenen Sicherungen
  - Gibt Statistiken zu verarbeiteten Sicherungen und auftretenden Fehlern zurück
  - Protokolliert Audit-Ereignisse für erfolgreiche und fehlgeschlagene Synchronisationsvorgänge
  - Verwendet Standardport 8200, wenn nicht angegeben

## Serververbindung testen - `/api/servers/test-connection` {/* #test-server-connection---apiserverstest-connection */}
- **Endpunkt**: `/api/servers/test-connection`
- **Methode**: POST
- **Beschreibung**: Testet die Verbindung zu einem Duplicati-Server, um zu überprüfen, ob er erreichbar ist.
- **Anforderungstext**:

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
  - Der Endpunkt überprüft das URL-Format und testet die Konnektivität
  - Gibt Erfolg zurück, wenn der Server mit Status 401 antwortet (erwartet für Login-Endpunkt ohne Anmeldeinformationen)
  - Testet die Verbindung zum Login-Endpunkt des Duplicati-Servers
  - Unterstützt sowohl HTTP- als auch HTTPS-Protokolle
  - Verwendet Timeou-Konfiguration für Verbindungstest

## Server-URL abrufen - `/api/servers/:serverId/server-url` {/* #get-server-url---apiserversserveridserver-url */}
- **Endpunkt**: `/api/servers/:serverId/server-url`
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
  - Gibt Server-URL für bestimmten Server zurück
  - Wird für Server-Verbindungsverwaltung verwendet
  - Gibt leeren String zurück, wenn keine Server-URL festgelegt ist

## Server-URL aktualisieren - `/api/servers/:serverId/server-url` {/* #update-server-url---apiserversserveridserver-url */}
- **Endpunkt**: `/api/servers/:serverId/server-url`
- **Methode**: PATCH
- **Beschreibung**: Aktualisiert die Server-URL für einen bestimmten Server.
- **Authentifizierung**: Erfordert eine gültige Sitzung und ein CSRF-Token
- **Parameter**:
  - `serverId`: die Serverkennung
- **Request-Body**:

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
  - `401`: Nicht autorisiert - Ungültige Sitzung oder CSRF-Token
  - `400`: Ungültiges URL-Format
  - `404`: Server nicht gefunden
  - `500`: Serverfehler während der Aktualisierung
- **Hinweise**: 
  - Der Endpunkt überprüft das URL-Format vor der Aktualisierung
  - Leere oder Null-Server-URLs sind erlaubt
  - Unterstützt sowohl HTTP- als auch HTTPS-Protokolle
  - Gibt aktualisierte Serverinformationen zurück

## Serverpasswort abrufen - `/api/servers/:serverId/password` {/* #get-server-password---apiserversserveridpassword */}
- **Endpunkt**: `/api/servers/:serverId/password`
- **Methode**: GET
- **Beschreibung**: Ruft ein CSRF-Token für Serverpasswort-Operationen ab.
- **Authentifizierung**: Erfordert eine gültige Sitzung
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
  - Gibt CSRF-Token für die Verwendung bei Passwortaktualisierungsoperationen zurück
  - Die Sitzung muss gültig sein, um Token zu generieren

## Serverpasswort aktualisieren - `/api/servers/:serverId/password` {/* #update-server-password---apiserversserveridpassword */}
- **Endpunkt**: `/api/servers/:serverId/password`
- **Methode**: PATCH
- **Beschreibung**: Aktualisiert das Passwort für einen bestimmten Server.
- **Authentifizierung**: Erfordert eine gültige Sitzung und ein CSRF-Token
- **Parameter**:
  - `serverId`: die Serverkennung
- **Request-Body**:

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
  - `400`: Passwort muss eine Zeichenkette sein
  - `401`: Nicht autorisiert - Ungültige Sitzung oder CSRF-Token
  - `500`: Passwort konnte nicht aktualisiert werden
- **Hinweise**:
  - Passwort kann eine leere Zeichenkette sein, um das Passwort zu löschen
  - Passwort wird sicher mit dem Geheimnisspeichersystem gespeichert

## Benutzerverwaltung {/* #user-management */}

### Benutzer auflisten - `/api/users` {/* #list-users---apiusers */}
- **Endpunkt**: `/api/users`
- **Methode**: GET
- **Beschreibung**: Listet alle Benutzer mit Paginierung und optionaler Suchfilterung auf. Gibt Benutzerinformationen einschließlich Anmeldeverlauf und Kontostatus zurück.
- **Authentifizierung**: Erfordert Administratorrechte, gültige Sitzung und CSRF-Token
- **Abfrageparameter**:
  - `page` (optional): Seitennummer (Standard: 1)
  - `limit` (optional): Einträge pro Seite (Standard: 50)
  - `search` (optional): Suchbegriff zum Filtern nach Benutzername
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
  - `401`: Nicht autorisiert - Ungültige Sitzung oder CSRF-Token
  - `403`: Verboten - Administratorrechte erforderlich
  - `500`: Interner Serverfehler
- **Hinweise**:
  - Nur für Administratoren zugänglich
  - Unterstützt Paginierung und Suchfilter
  - Gibt den Benutzerkontostatus einschließlich Sperrstatus zurück

### Benutzer erstellen - `/api/users` {/* #create-user---apiusers */}
- **Endpunkt**: `/api/users`
- **Methode**: POST
- **Beschreibung**: Erstellt ein neues Benutzerkonto. Kann ein temporäres Passwort generieren oder ein angegebenes Passwort verwenden.
- **Authentifizierung**: Erfordert Admin-Berechtigungen, eine gültige Sitzung und ein CSRF-Token
- **Request-Body**:

  ```json
  {
    "username": "newuser",
    "password": "optional-password",
    "isAdmin": false,
    "requirePasswordChange": true
  }
  ```

- `username`: Erforderlich, muss 3-50 Zeichen haben, eindeutig sein
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
  - `400`: Ungültiges Benutzernamenformat, Verstoß gegen Passwortrichtlinie oder Validierungsfehler
  - `401`: Nicht autorisiert - Ungültige Sitzung oder CSRF-Token
  - `403`: Verboten - Administratorrechte erforderlich
  - `409`: Benutzername existiert bereits
  - `500`: Interner Serverfehler
- **Hinweise**:
  - Nur für Administratoren zugänglich
  - Benutzername ist nicht groß-/kleinschreibungsabhängig und wird in Kleinbuchstaben gespeichert
  - Falls kein Passwort angegeben wird, wird ein sicheres 12-stelliges Passwort generiert
  - Generierte temporäre Passwörter werden nur einmalig in der Antwort zurückgegeben
  - Benutzererstellung wird im Audit-Protokoll protokolliert

### Benutzer aktualisieren - `/api/users/:id` {/* #update-user---apiusersid */}
- **Endpunkt**: `/api/users/:id`
- **Methode**: PATCH
- **Beschreibung**: Aktualisiert Benutzerinformationen einschließlich Benutzername, Admin-Status, Pflicht zur Passwortänderung und Passwort-Zurücksetzung.
- **Authentifizierung**: Erfordert Admin-Rechte, eine gültige Sitzung und ein gültiges CSRF-Token
- **Parameter**:
  - `id`: Zu aktualisierende Benutzer-ID
- **Request-Body**:

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
- **Antwort** (mit Passwort-Zurücksetzung):

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

- **Antwort** (ohne Passwort-Zurücksetzung):

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
  - `401`: Nicht autorisiert - Ungültige Sitzung oder CSRF-Token
  - `403`: Verboten - Administratorrechte erforderlich
  - `404`: Benutzer nicht gefunden
  - `409`: Benutzername existiert bereits (bei Benutzernamensänderung)
  - `500`: Interner Serverfehler
- **Hinweise**:
  - Nur für Administratoren zugänglich
  - Benutzernamensänderungen werden auf Eindeutigkeit geprüft
  - Passwortzurücksetzung generiert ein sicheres 12-stelliges temporäres Passwort
  - Alle Änderungen werden im Audit-Protokoll protokolliert

### Benutzer löschen - `/api/users/:id` {/* #delete-user---apiusersid */}
- **Endpunkt**: `/api/users/:id`
- **Methode**: DELETE
- **Beschreibung**: Löscht ein Benutzerkonto. Verhindert das Löschen des eigenen Kontos oder des letzten Admin-Kontos.
- **Authentifizierung**: Erfordert Admin-Rechte, eine gültige Sitzung und ein gültiges CSRF-Token
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
  - `400`: Kann eigenen Account oder letzten Administrator-Account nicht löschen
  - `401`: Nicht autorisiert - Ungültige Sitzung oder CSRF-Token
  - `403`: Verboten - Administratorrechte erforderlich
  - `404`: Benutzer nicht gefunden
  - `500`: Interner Serverfehler
- **Hinweise**:
  - Nur für Administratoren zugänglich
  - Kann eigenen Account nicht löschen
  - Kann letzten Administrator-Account nicht löschen (mindestens ein Administrator muss erhalten bleiben)
  - Benutzerlöschung wird im Audit-Protokoll protokolliert
  - Zugehörige Sitzungen werden automatisch gelöscht (Kaskade)

## Audit-Protokoll-Verwaltung {/* #audit-log-management */}

### Audit-Protokolle auflisten - `/api/audit-log` {/* #list-audit-logs---apiaudit-log */}
- **Endpunkt**: `/api/audit-log`
- **Methode**: GET
- **Beschreibung**: Ruft Audit-Protokolleinträge mit Filter-, Paginierungs- und Suchfunktionen ab. Unterstützt sowohl seitenbasierte als auch offsetbasierte Paginierung.
- **Authentifizierung**: Erfordert gültige Sitzung und CSRF-Token (angemeldeter Benutzer erforderlich)
- **Abfrageparameter**:
  - `page` (optional): Seitennummer für seitenbasierte Paginierung
  - `offset` (optional): Offset für offset-basierte Paginierung (hat Vorrang vor Seite)
  - `limit` (optional): Einträge pro Seite (Standard: 50)
  - `startDate` (optional): Protokolle ab diesem Datum filtern (ISO-Format)
  - `endDate` (optional): Protokolle bis zu diesem Datum filtern (ISO-Format)
  - `userId` (optional): Nach Benutzer-ID filtern
  - `username` (optional): Filter by username
  - `action` (optional): Nach Aktionsname filtern
  - `category` (optional): Nach Kategorie filtern (`auth`, `user_management`, `config`, `backup`, `server`)
  - `status` (optional): Nach Status filtern (`success`, `failure`, `error`)
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
  - `401`: Nicht autorisiert - Ungültige Sitzung oder CSRF-Token
  - `500`: Interner Serverfehler
- **Hinweise**:
  - Unterstützt sowohl seitenbasierte (`page`) als auch offset-basierte (`offset`) Paginierung
  - `details`-Feld enthält geparstes JSON mit zusätzlichem Kontext
  - Alle Audit-Log-Abfragen werden protokolliert

### Audit-Protokoll-Filterwerte abrufen - `/api/audit-log/filters` {/* #get-audit-log-filter-values---apiaudit-logfilters */}
- **Endpunkt**: `/api/audit-log/filters`
- **Methode**: GET
- **Beschreibung**: Ruft eindeutige Filterwerte ab, die zum Filtern von Audit-Protokollen verfügbar sind. Gibt alle eindeutigen Aktionen, Kategorien und Statuswerte zurück, die in der Audit-Protokoll-Datenbank vorhanden sind. Nützlich zum Befüllen von Filter-Dropdowns in der Benutzeroberfläche.
- **Authentifizierung**: Erfordert eine gültige Sitzung und ein CSRF-Token (angemeldeter Benutzer erforderlich)
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
  - `401`: Nicht autorisiert - Ungültige Sitzung oder CSRF-Token
  - `500`: Interner Serverfehler
- **Hinweise**:
  - Gibt Arrays eindeutiger Werte aus der Audit-Log-Datenbank zurück
  - Werte sind alphabetisch sortiert
  - Leere Arrays werden zurückgegeben, wenn keine Daten vorhanden sind oder bei Fehler
  - Wird vom Prüfprotokoll-Viewer verwendet, um Filter-Auswahllisten dynamisch zu füllen

### Audit-Protokolle herunterladen - `/api/audit-log/download` {/* #download-audit-logs---apiaudit-logdownload */}
- **Endpunkt**: `/api/audit-log/download`
- **Methode**: GET
- **Beschreibung**: Lädt Audit-Protokolle im CSV- oder JSON-Format mit optionaler Filterung herunter. Nützlich für externe Analysen und Berichte.
- **Authentifizierung**: Erfordert gültige Sitzung und CSRF-Token (angemeldeter Benutzer erforderlich)
- **Abfrageparameter**:
  - `format` (optional): Exportformat - `csv` oder `json` (Standard: `csv`)
  - `startDate` (optional): Protokolle ab diesem Datum filtern (ISO-Format)
  - `endDate` (optional): Protokolle bis zu diesem Datum filtern (ISO-Format)
  - `userId` (optional): Nach Benutzer-ID filtern
  - `username` (optional): Filter by username
  - `action` (optional): Nach Aktionsname filtern
  - `category` (optional): Nach Kategorie filtern
  - `status` (optional): Nach Status filtern
- **Antwort** (CSV):
  - Content-Type: `text/csv`
  - Content-Disposition: `attachment; filename="audit-log-YYYY-MM-DD.csv"`
  - CSV-Datei mit Kopfzeilen: ID, Zeitstempel, Benutzer-ID, Benutzername, Aktion, Kategorie, Zieltyp, Ziel-ID, Status, IP-Adresse, Benutzer-Agent, Details, Fehlermeldung
- **Antwort** (JSON):
  - Content-Type: `application/json`
  - Content-Disposition: `attachment; filename="audit-log-YYYY-MM-DD.json"`
  - JSON-Array von Audit-Log-Einträgen
- **Fehlerantworten**:
  - `400`: Keine Protokolle zum Exportieren
  - `401`: Nicht autorisiert - Ungültige Sitzung oder CSRF-Token
  - `500`: Interner Serverfehler
- **Hinweise**:
  - Exportlimit beträgt 10.000 Datensätze
  - CSV-Format maskiert Sonderzeichen ordnungsgemäß
  - Details-Feld in CSV ist als JSON formatiert
  - Dateiname enthält das aktuelle Datum

### Audit-Protokolle bereinigen – `/api/audit-log/cleanup` {/* #cleanup-audit-logs---apiaudit-logcleanup */}
- **Endpoint**: `/api/audit-log/cleanup`
- **Method**: POST
- **Description**: Löst die Bereinigung alter Audit-Protokolle basierend auf dem Aufbewahrungszeitraum manuell aus. Unterstützt einen Dry-Run-Modus zur Vorschau der zu löschenden Einträge.
- **Authentifizierung**: Erfordert Admin-Berechtigungen, eine gültige Sitzung und ein CSRF-Token
- **Request-Body**:

  ```json
  {
    "retentionDays": 90,
    "dryRun": false
  }
  ```

- `retentionDays` (optional): Aufbewahrungstage überschreiben (30–365), andernfalls wird der konfigurierte Wert verwendet
  - `dryRun` (optional): Wenn „true“, wird nur zurückgegeben, was gelöscht werden würde, ohne tatsächlich zu löschen
- **Response** (Testlauf):

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
  - `400`: Ungültige Aufbewahrungstage (muss 30-365 sein)
  - `401`: Nicht autorisiert - Ungültige Sitzung oder CSRF-Token
  - `403`: Verboten - Administratorrechte erforderlich
  - `500`: Interner Serverfehler
- **Hinweise**:
  - Nur für Administratoren zugänglich
  - Standardaufbewahrung beträgt 90 Tage, wenn nicht konfiguriert
  - Bereinigungsoperation wird im Audit-Protokoll protokolliert
  - Dry-Run-Modus ist nützlich zur Vorschau des Bereinigungsauswirkungen

### Prüfprotokoll-Aufbewahrung abrufen – `/api/audit-log/retention` {/* #get-audit-log-retention---apiaudit-logretention */}
- **Endpoint**: `/api/audit-log/retention`
- **Method**: GET
- **Description**: Ruft die aktuelle Konfiguration der Prüfprotokoll-Aufbewahrung in Tagen ab.
- **Authentication**: Erfordert eine gültige Sitzung und ein gültiges CSRF-Token (kein angemeldeter Benutzer erforderlich)
- **Response**:

  ```json
  {
    "retentionDays": 90
  }
  ```

- **Fehlerantworten**:
  - `500`: Interner Serverfehler
- **Hinweise**:
  - Standardaufbewahrung beträgt 90 Tage, wenn nicht konfiguriert
  - Kann ohne Authentifizierung abgerufen werden (schreibgeschützt)

### Prüfprotokoll-Aufbewahrung aktualisieren – `/api/audit-log/retention` {/* #update-audit-log-retention---apiaudit-logretention */}
- **Endpoint**: `/api/audit-log/retention`
- **Method**: PATCH
- **Description**: Aktualisiert den Zeitraum für die Prüfprotokoll-Aufbewahrung in Tagen. Diese Einstellung bestimmt, wie lange Audit-Protokolle vor der automatischen Bereinigung aufbewahrt werden.
- **Authentifizierung**: Erfordert Admin-Berechtigungen, eine gültige Sitzung und ein CSRF-Token
- **Request-Body**:

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
  - `400`: Ungültige Aufbewahrungstage (muss 30-365 sein)
  - `401`: Nicht autorisiert - Ungültige Sitzung oder CSRF-Token
  - `403`: Verboten - Administratorrechte erforderlich
  - `500`: Interner Serverfehler
- **Hinweise**:
  - Nur für Administratoren zugänglich
  - Konfigurationsänderung wird im Audit-Protokoll protokolliert
  - Aufbewahrungszeitraum beeinflusst automatische und manuelle Bereinigungsoperationen

## API-Schlüssel {/* #api-keys */}

### API-Schlüssel auflisten - `/api/api-keys` {/* #list-api-keys---apiapi-keys */}
- **Endpunkt**: `/api/api-keys`
- **Methode**: GET
- **Beschreibung**: Listet alle API-Schlüssel auf. Secrets werden niemals zurückgegeben; jeder Schlüssel enthält einen Fingerabdruck (`Qk7v…3xTa`).
- **Authentifizierung**: Erfordert Administratorrechte, gültige Sitzung und CSRF-Token
- **Fehlerantworten**:
  - `401`: Nicht autorisiert - Ungültige Sitzung oder CSRF-Token
  - `403`: Verboten - Administratorrechte erforderlich
  - `500`: Interner Serverfehler

### API-Schlüssel erstellen - `/api/api-keys` {/* #create-api-key---apiapi-keys */}
- **Endpunkt**: `/api/api-keys`
- **Methode**: POST
- **Beschreibung**: Erstellt einen bereichsbezogenen API-Schlüssel. Das Klartext-Secret wird nur in dieser Antwort zurückgegeben.
- **Authentifizierung**: Erfordert Admin-Berechtigungen, eine gültige Sitzung und ein CSRF-Token
- **Request-Body**:

  ```json
  {
    "name": "Duplicati uploads",
    "scope": "upload",
    "description": "Optional",
    "expiresAt": null
  }
  ```

- **Fehlerantworten**:
  - `400`: Fehlender Name oder ungültiger Bereich (`upload` oder `read`)
  - `401`: Nicht autorisiert - Ungültige Sitzung oder CSRF-Token
  - `403`: Verboten - Administratorrechte erforderlich
  - `500`: Interner Serverfehler

### API-Schlüssel aktualisieren - `/api/api-keys/:id` {/* #update-api-key---apiapi-keysid */}
- **Endpunkt**: `/api/api-keys/:id`
- **Methode**: PATCH
- **Beschreibung**: Aktiviert oder deaktiviert einen Schlüssel.
- **Authentifizierung**: Erfordert Admin-Berechtigungen, eine gültige Sitzung und ein CSRF-Token

### API-Schlüssel löschen - `/api/api-keys/:id` {/* #delete-api-key---apiapi-keysid */}
- **Endpunkt**: `/api/api-keys/:id`
- **Methode**: DELETE
- **Beschreibung**: Löscht einen Schlüssel. Bestehende Clients, die dieses Secret verwenden, verlieren sofort den Zugriff.
- **Authentifizierung**: Erfordert Admin-Berechtigungen, eine gültige Sitzung und ein CSRF-Token

## Datenbankverwaltung {/* #database-management */}

### Datenbank sichern - `/api/database/backup` {/* #backup-database---apidatabasebackup */}
- **Endpunkt**: `/api/database/backup`
- **Methode**: GET
- **Beschreibung**: Erstellt eine Sicherung der Datenbank im Binär- (.db) oder SQL-Format (.sql). Die Sicherungsdatei wird automatisch mit einem mit Zeitstempel versehenen Dateinamen heruntergeladen.
- **Authentifizierung**: Erfordert Administratorrechte, gültige Sitzung und CSRF-Token
- **Abfrageparameter**:
  - `format` (optional): Backup-Format - `db` (binär) oder `sql` (SQL-Dump). Standard: `db`
- **Antwort**:
  - Content-Type: `application/octet-stream` (für .db) oder `text/plain` (für .sql)
  - Content-Disposition: `attachment; filename="duplistatus-backup-YYYY-MM-DDTHH-MM-SS.db"` oder `.sql`
  - Binärdateiinhalt (für .db) oder SQL-Textinhalt (für .sql)
- **Fehlerantworten**:
  - `400`: Ungültiges Format (muss "db" oder "sql" sein)
  - `401`: Nicht autorisiert - Ungültige Sitzung oder CSRF-Token
  - `403`: Verboten - Administratorrechte erforderlich
  - `500`: Erstellung des Datenbank-Backups fehlgeschlagen
- **Hinweise**:
  - Nur für Administratoren zugänglich
  - Binärformat verwendet die Backup-Methode von SQLite zur Gewährleistung der Integrität
  - SQL-Format erstellt einen Textdump aller Datenbankinhalte
  - Zeitstempel im Dateinamen verwendet die lokale Zeitzone des Servers
  - Backup-Vorgang wird im Audit-Protokoll protokolliert
  - Temporäre Dateien werden nach dem Download automatisch bereinigt

### Datenbank wiederherstellen - `/api/database/restore` {/* #restore-database---apidatabaserestore */}
- **Endpunkt**: `/api/database/restore`
- **Methode**: POST
- **Beschreibung**: Stellt die Datenbank aus einer Sicherungsdatei (.db- oder .sql-Format) wieder her. Erstellt vor der Wiederherstellung eine Sicherung zur Absicherung und löscht nach der Wiederherstellung aus Sicherheitsgründen alle Sitzungen.
- **Authentifizierung**: Erfordert Administratorrechte, gültige Sitzung und CSRF-Token
- **Anforderungstext**: FormData mit einem Dateifeld namens `database`
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
  - `400`: Keine Datei bereitgestellt, Dateigröße überschreitet Limit, ungültiges Dateiformat oder Datenbankintegritätsprüfung fehlgeschlagen
  - `401`: Nicht autorisiert - Ungültige Sitzung oder CSRF-Token
  - `403`: Verboten - Administratorrechte erforderlich
  - `500`: Wiederherstellung der Datenbank fehlgeschlagen (ursprüngliche Datenbank wird aus Sicherungssicherung wiederhergestellt, falls Wiederherstellung fehlschlägt)
- **Hinweise**:
  - Nur für Administratoren zugänglich
  - Erstellt automatisch eine Sicherungssicherung vor der Wiederherstellung
  - Unterstützt sowohl binäres (.db) als auch SQL-Format (.sql)
  - Überprüft die Datenbankintegrität nach der Wiederherstellung
  - Falls Wiederherstellung fehlschlägt, wird automatisch aus Sicherungssicherung wiederhergestellt
  - Alle Sitzungen werden nach erfolgreicher Wiederherstellung aus Sicherheitsgründen gelöscht
  - Gibt `requiresReauth: true` zurück, um anzuzeigen, dass sich der Benutzer erneut anmelden muss
  - Wiederherstellungsvorgang wird im Audit-Protokoll protokolliert
  - Für SQL-Format wird der SQL-Inhalt vor der Ausführung überprüft
  - Datenbankverbindung wird nach der Wiederherstellung neu initialisiert
  - Alle Caches werden nach der Wiederherstellung ungültig gemacht

## Sicherungs-Zeitstempel {/* #backup-timestamps */}

### Zeitstempel der letzten Sicherung abrufen - `/api/backups/last-timestamps` {/* #get-last-backup-timestamps---apibackupslast-timestamps */}
- **Endpunkt**: `/api/backups/last-timestamps`
- **Methode**: GET
- **Beschreibung**: Ruft den Zeitstempel der letzten Sicherung für jede Server-Sicherungs-Kombination ab. Gibt eine Map für ein einfaches Nachschlagen zurück.
- **Authentifizierung**: Erfordert eine gültige Sitzung und ein CSRF-Token
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
  - `401`: Nicht autorisiert - Ungültige Sitzung oder CSRF-Token
  - `500`: Abrufen der Zeitstempel der letzten Sicherung fehlgeschlagen
- **Hinweise**:
  - Gibt sowohl eine Karte (zur einfachen Suche nach `server_id:backup_name`) als auch ein Roharray-Format zurück
  - Enthält Cache-Control-Header, um Caching zu verhindern
  - Nützlich zum Verfolgen der letzten Sicherungszeiten über alle Server-Sicherungskombinationen hinweg
  - Zeitstempel sind im ISO-Format

## Verwaltung der Anwendungsprotokolle {/* #application-logs-management */}

### Anwendungsprotokolle abrufen - `/api/application-logs` {/* #get-application-logs---apiapplication-logs */}
- **Endpunkt**: `/api/application-logs`
- **Methode**: GET
- **Beschreibung**: Ruft Anwendungsprotokolleinträge aus Protokolldateien ab. Unterstützt das Lesen aktueller und rotierter Protokolldateien mit Tail-Funktionalität.
- **Authentifizierung**: Erfordert Administratorrechte, gültige Sitzung und CSRF-Token
- **Abfrageparameter**:
  - `file` (optional): Zu lesende Protokolldatei - `application.log`, `application.log.1`, `application.log.2`, usw. Wenn nicht angegeben, wird die Liste verfügbarer Dateien zurückgegeben
  - `tail` (optional): Anzahl der Zeilen, die vom Ende der Datei zurückgegeben werden sollen (Standard: 1000, Mindestwert: 1, Maximalwert: 10000)
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

- **Antwort** (ohne file-Parameter):

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
  - `400`: Ungültiger Tail-Parameter (muss 1-10000 sein) oder ungültiges Dateiparameterformat
  - `401`: Nicht autorisiert - Ungültige Sitzung oder CSRF-Token
  - `403`: Verboten - Administratorrechte erforderlich
  - `404`: Protokolldatei nicht gefunden
  - `500`: Lesen der Protokolldatei fehlgeschlagen
- **Hinweise**:
  - Nur für Administratoren zugänglich
  - Unterstützt das Lesen der aktuellen Protokolldatei und rotierter Protokolldateien (bis zu 10 rotierte Dateien)
  - Gibt die letzten N Zeilen (Tail) aus der angegebenen Protokolldatei zurück
  - Der Name der Protokolldatei wird durch eine Umgebungsvariable bestimmt (Standard: `application.log`)
  - Gibt eine Liste verfügbarer Protokolldateien zurück, wenn der Dateiparameter nicht angegeben ist
  - Dateinamen werden überprüft, um Directory Traversal-Angriffe zu verhindern
  - Rotierte Dateien sind sequenziell nummeriert (`.1`, `.2`, usw.)

### Anwendungsprotokolle exportieren – `/api/application-logs/export` {/* #export-application-logs---apiapplication-logsexport */}
- **Endpunkt**: `/api/application-logs/export`
- **Methode**: GET
- **Beschreibung**: Exportiert Anwendungsprotokolleinträge in einem gefilterten Textformat. Unterstützt das Filtern nach Protokollebene und Suchzeichenfolge.
- **Authentifizierung**: Erfordert Administratorrechte, gültige Sitzung und CSRF-Token
- **Abfrageparameter**:
  - `file` (erforderlich): Zu exportierender Protokolldateiname - `application.log`, `application.log.1`, `application.log.2`, usw.
  - `logLevels` (optional): Durch Kommas getrennte Liste der einzuschließenden Protokollstufen - `INFO`, `WARN`, `ERROR` (Standard: `INFO,WARN,ERROR`)
  - `search` (optional): Suchbegriff zum Filtern der Protokollzeilen (Groß-/Kleinschreibung wird ignoriert)
- **Antwort**:
  - Content-Type: `text/plain`
  - Content-Disposition: `attachment; filename="duplistatus-logs-YYYY-MM-DDTHH-MM-SS.txt"`
  - Gefilterter Protokollinhalt als Klartext
- **Fehlerantworten**:
  - `400`: Dateiparameter ist erforderlich oder ungültiges Format des Dateiparameters
  - `401`: Nicht autorisiert - Ungültige Sitzung oder CSRF-Token
  - `403`: Verboten - Administratorrechte erforderlich
  - `500`: Protokolle konnten nicht exportiert werden
- **Hinweise**:
  - Nur für Admin-Benutzer zugänglich
  - Exportiert gefilterte Protokolleinträge basierend auf Protokollstufe und Suchkriterien
  - Unterstützt Filterung nach Protokollstufen: `INFO`, `WARN`, `ERROR`
  - Die Filterung nach Suchbegriffen berücksichtigt nicht die Groß-/Kleinschreibung
  - Leere Zeilen werden automatisch herausgefiltert
  - Der Name der Protokolldatei wird durch eine Umgebungsvariable bestimmt (Standard: `application.log`)
  - Dateinamen werden überprüft, um Directory Traversal-Angriffe zu verhindern
  - Exportierte Datei enthält Zeitstempel im Dateinamen
  - Nützlich für externe Analyse und Fehlerbehebung
