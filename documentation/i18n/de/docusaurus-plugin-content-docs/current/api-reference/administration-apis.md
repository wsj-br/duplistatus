# Verwaltung {#administration}

## Backups sammeln - `/api/backups/collect` {#collect-backups-apibackupscollect}

- **Endpunkt**: `/api/backups/collect`
- **Methode**: POST
- **Beschreibung**: Sammelt Sicherungsdaten direkt von einem Duplicati-Server über seine API. Dieser Endpunkt erkennt automatisch das beste Verbindungsprotokoll (HTTPS mit SSL-Validierung, HTTPS mit selbstsigniertem Zertifikat oder HTTP als Fallback) und verbindet sich mit dem Duplicati-Server, um Sicherungsinformationen abzurufen und in die lokale Datenbank zu verarbeiten.
- **Authentifizierung**: Erfordert gültige Sitzung und CSRF-Token
- **Anfragekörper**:
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
  - `401`: Nicht autorisiert - Ungültige Sitzung oder CSRF-Token
  - `500`: Serverfehler während der Sicherungssammlung
- **Hinweise**:
  - Der Endpunkt erkennt automatisch das optimale Verbindungsprotokoll (HTTPS → HTTPS mit selbstsigniert → HTTP)
  - Protokollerkennungsversuche werden in Reihenfolge der Sicherheitspräferenz durchgeführt
  - Verbindungs-Timeouts sind über Umgebungsvariablen konfigurierbar
  - Protokolle gesammelte Daten im Entwicklungsmodus zum Debuggen
  - Stellt sicher, dass Sicherungseinstellungen für alle Server und Sicherungen vollständig sind
  - Verwendet Standard-Port 8200, falls nicht angegeben
  - Das erkannte Protokoll und die Server-URL werden automatisch in der Datenbank gespeichert
  - `serverAlias` wird aus der Datenbank abgerufen und kann leer sein, wenn kein Alias gesetzt ist
  - Das Frontend sollte `serverAlias || serverName` zu Anzeigezwecken verwenden
  - Unterstützt sowohl JSON-Download als auch direkte API-Erfassungsmethoden

## Sicherungen bereinigen - `/api/backups/cleanup` {#cleanup-backups-apibackupscleanup}

- **Endpunkt**: `/api/backups/cleanup`
- **Methode**: POST
- **Beschreibung**: Löscht alte Sicherungsdaten basierend auf der Aufbewahrungsdauer. Dieser Endpunkt hilft bei der Verwaltung der Datenbankgröße durch Entfernen veralteter Sicherungsdatensätze bei Beibehaltung aktueller und wichtiger Daten.
- **Authentifizierung**: Erfordert gültige Sitzung und CSRF-Token
- **Anfragekörper**:
  ```json
  {
    "retentionPeriod": "6 months"
  }
  ```
- **Aufbewahrungszeiträume**: `"6 months"`, `"1 year"`, `"2 years"`, `"Delete all data"`
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
  - Der Bereinigungsvorgang ist nicht umkehrbar
  - Sicherungsdaten werden dauerhaft aus der Datenbank gelöscht
  - Maschinendatensätze bleiben erhalten, auch wenn alle Sicherungen gelöscht werden
  - Wenn "Alle Daten löschen" ausgewählt ist, werden alle Maschinen und Sicherungen entfernt und die Konfiguration gelöscht
  - Erweiterte Fehlerberichterstattung enthält Details und Stack-Trace im Entwicklungsmodus
  - Unterstützt sowohl zeitbasierte Aufbewahrung als auch vollständiges Löschen von Daten

## Sicherungsauftrag löschen - `/api/backups/delete-job` {#delete-backup-job-apibackupsdelete-job}

- **Endpunkt**: `/api/backups/delete-job`
- **Methode**: LÖSCHEN
- **Beschreibung**: Löscht alle Sicherungsdatensätze für eine bestimmte Server-Sicherungs-Kombination. Dieser Endpunkt ist nur im Entwicklungsmodus verfügbar.
- **Authentifizierung**: Erfordert gültige Sitzung und CSRF-Token
- **Anfragekörper**:
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
  - `403`: Das Löschen von Sicherungsaufträgen ist nur im Entwicklungsmodus verfügbar
  - `400`: Server-ID und Sicherungsname sind erforderlich
  - `404`: Keine Sicherungen zum Löschen gefunden
  - `500`: Serverfehler beim Löschen mit detaillierten Fehlerinformationen
- **Hinweise**:
  - Dieser Vorgang ist nur im Entwicklungsmodus verfügbar
  - Dieser Vorgang ist nicht umkehrbar
  - Alle Sicherungsdatensätze für die angegebene Server-Sicherungs-Kombination werden dauerhaft gelöscht
  - Gibt die Anzahl der gelöschten Sicherungen und Serverinformationen zurück
  - Verwendet Server-Alias zur Anzeige, falls verfügbar, andernfalls wird auf Servername zurückgegriffen

## Sicherungszeitpläne synchronisieren - `/api/backups/sync-schedule` {#sync-backup-schedules-apibackupssync-schedule}

- **Endpunkt**: `/api/backups/sync-schedule`
- **Methode**: POST
- **Beschreibung**: Synchronisiert Sicherungszeitplaninformationen von einem Duplicati-Server. Dieser Endpunkt verbindet sich mit dem Server, ruft Zeitplaninformationen für alle Sicherungen ab und aktualisiert die lokalen Sicherungseinstellungen mit Zeitplandetails einschließlich Wiederholungsintervallen, zulässigen Wochentagen und Zeitplanzeiten.
- **Authentifizierung**: Erfordert gültige Sitzung und CSRF-Token (optionale Authentifizierung)
- **Anfragekörper**:
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
  - `400`: Ungültige Anfrageparameter, fehlender Hostname/Passwort wenn serverId nicht angegeben, oder Verbindung fehlgeschlagen
  - `404`: Server nicht gefunden (wenn serverId angegeben) oder kein Passwort für Server gespeichert
  - `500`: Serverfehler während der Zeitplansynchronisierung
- **Hinweise**:
  - Der Endpunkt erkennt automatisch das optimale Verbindungsprotokoll (HTTPS → HTTPS mit selbstsigniert → HTTP)
  - Kann nur mit serverId aufgerufen werden, um gespeicherte Server-Anmeldedaten zu verwenden
  - Kann mit serverId und neuen Anmeldedaten aufgerufen werden, um Server-Verbindungsdetails zu aktualisieren
  - Kann mit Hostname/Port/Passwort ohne serverId für neue Server aufgerufen werden
  - Aktualisiert Sicherungseinstellungen mit Zeitplaninformationen einschließlich:
    - `expectedInterval`: Das Wiederholungsintervall (z. B. "Daily", "Weekly", "Monthly")
    - `allowedWeekDays`: Array zulässiger Wochentage (0=Sonntag, 1=Montag, usw.)
    - `time`: Die geplante Zeit für die Sicherung
  - Verarbeitet alle auf dem Server gefundenen Sicherungen
  - Gibt Statistiken zu verarbeiteten Sicherungen und aufgetretenen Fehlern zurück
  - Protokolliert Audit-Events für erfolgreiche und fehlgeschlagene Synchronisierungsvorgänge
  - Verwendet Standard-Port 8200, falls nicht angegeben

## Serververbindung testen - `/api/servers/test-connection` {#test-server-connection-apiserverstest-connection}

- **Endpunkt**: `/api/servers/test-connection`
- **Methode**: POST
- **Beschreibung**: Testet die Verbindung zu einem Duplicati-Server, um zu überprüfen, ob er erreichbar ist.
- **Anfragekörper**:
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
  - Der Endpunkt validiert das URL-Format und testet die Konnektivität
  - Gibt Erfolg zurück, wenn der Server mit Status 401 antwortet (erwartet für Login-Endpunkt ohne Anmeldedaten)
  - Testet die Verbindung zum Login-Endpunkt des Duplicati-Servers
  - Unterstützt sowohl HTTP- als auch HTTPS-Protokolle
  - Verwendet Timeout-Konfiguration für Verbindungstests

## Server-URL abrufen - `/api/servers/:serverId/server-url` {#get-server-url-apiserversserveridserver-url}

- **Endpunkt**: `/api/servers/:serverId/server-url`

- **Methode**: GET

- **Beschreibung**: Ruft die Server-URL für einen bestimmten Server ab.

- **Parameter**:
  - `serverId`: die Server-ID

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
  - Wird für die Server-Verbindungsverwaltung verwendet
  - Gibt leeren String zurück, wenn keine Server-URL gesetzt ist

## Server-URL aktualisieren - `/api/servers/:serverId/server-url` {#update-server-url-apiserversserveridserver-url}

- **Endpunkt**: `/api/servers/:serverId/server-url`
- **Methode**: PATCH
- **Beschreibung**: Aktualisiert die Server-URL für einen bestimmten Server.
- **Authentifizierung**: Erfordert gültige Sitzung und CSRF-Token
- **Parameter**:
  - `serverId`: die Server-ID
- **Anfragekörper**:
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
  - Der Endpunkt validiert das URL-Format vor der Aktualisierung
  - Leere oder Null-Server-URLs sind zulässig
  - Unterstützt sowohl HTTP- als auch HTTPS-Protokolle
  - Gibt aktualisierte Serverinformationen zurück

## Server-Passwort abrufen - `/api/servers/:serverId/password` {#get-server-password-apiserversserveridpassword}

- **Endpunkt**: `/api/servers/:serverId/password`
- **Methode**: GET
- **Beschreibung**: Ruft einen CSRF-Token für Server-Passwort-Operationen ab.
- **Authentifizierung**: Erfordert gültige Sitzung
- **Parameter**:
  - `serverId`: die Server-ID
- **Antwort**:
  ```json
  {
    "csrfToken": "csrf-token-string",
    "serverId": "server-id"
  }
  ```
- **Fehlerantworten**:
  - `401`: Ungültige oder abgelaufene Sitzung
  - `500`: Fehler beim Generieren des CSRF-Tokens
- **Hinweise**:
  - Gibt CSRF-Token zur Verwendung mit Passwort-Update-Operationen zurück
  - Sitzung muss gültig sein, um Token zu generieren

## Server-Passwort aktualisieren - `/api/servers/:serverId/password` {#update-server-password-apiserversserveridpassword}

- **Endpunkt**: `/api/servers/:serverId/password`
- **Methode**: PATCH
- **Beschreibung**: Aktualisiert das Passwort für einen bestimmten Server.
- **Authentifizierung**: Erfordert gültige Sitzung und CSRF-Token
- **Parameter**:
  - `serverId`: die Server-ID
- **Anfragekörper**:
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
  - `401`: Nicht autorisiert - Ungültige Sitzung oder CSRF-Token
  - `500`: Fehler beim Aktualisieren des Passworts
- **Hinweise**:
  - Passwort kann ein leerer String sein, um das Passwort zu löschen
  - Passwort wird sicher mit dem Secrets-Management-System gespeichert

## Benutzerverwaltung {#user-management}

### Benutzer auflisten - `/api/users` {#list-users-apiusers}

- **Endpunkt**: `/api/users`
- **Methode**: GET
- **Beschreibung**: Listet alle Benutzer mit Pagination und optionaler Suchfilterung auf. Gibt Benutzerinformationen einschließlich Anmeldungsverlauf und Kontostatus zurück.
- **Authentifizierung**: Erfordert Admin-Privilegien, gültige Sitzung und CSRF-Token
- **Abfrageparameter**:
  - `page` (optional): Seitennummer (Standard: 1)
  - `limit` (optional): Elemente pro Seite (Standard: 50)
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
  - `403`: Verboten - Admin-Privilegien erforderlich
  - `500`: Interner Serverfehler
- **Hinweise**:
  - Nur für Admin-Benutzer zugänglich
  - Unterstützt Pagination und Suchfilterung
  - Gibt Benutzerkontostatus einschließlich Sperrstatus zurück

### Benutzer erstellen - `/api/users` {#create-user-apiusers}

- **Endpunkt**: `/api/users`
- **Methode**: POST
- **Beschreibung**: Erstellt ein neues Benutzerkonto. Kann ein temporäres Passwort generieren oder ein bereitgestelltes Passwort verwenden.
- **Authentifizierung**: Erfordert Admin-Privilegien, gültige Sitzung und CSRF-Token
- **Anfragekörper**:
  ```json
  {
    "username": "newuser",
    "password": "optional-password",
    "isAdmin": false,
    "requirePasswordChange": true
  }
  ```
  - `username`: Erforderlich, muss 3-50 Zeichen lang sein, eindeutig
  - `password`: Optional, wenn nicht angegeben, wird ein sicheres temporäres Passwort generiert
  - `isAdmin`: Optional, Standard false
  - `requirePasswordChange`: Optional, Standard true
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
  - `temporaryPassword` ist nur enthalten, wenn ein Passwort automatisch generiert wurde
- **Fehlerantworten**:
  - `400`: Ungültiges Benutzernamenformat, Passwortrichtlinienverletzung oder Validierungsfehler
  - `401`: Nicht autorisiert - Ungültige Sitzung oder CSRF-Token
  - `403`: Verboten - Admin-Privilegien erforderlich
  - `409`: Benutzername existiert bereits
  - `500`: Interner Serverfehler
- **Hinweise**:
  - Nur für Admin-Benutzer zugänglich
  - Benutzername ist nicht case-sensitiv und wird in Kleinbuchstaben gespeichert
  - Wenn kein Passwort angegeben ist, wird ein sicheres 12-stelliges Passwort generiert
  - Generierte temporäre Passwörter werden nur einmal in der Antwort zurückgegeben
  - Benutzererstellung wird im Audit-Log protokolliert

### Benutzer aktualisieren - `/api/users/:id` {#update-user-apiusersid}

- **Endpunkt**: `/api/users/:id`
- **Methode**: PATCH
- **Beschreibung**: Aktualisiert Benutzerinformationen einschließlich Benutzername, Admin-Status, Passwortänderungsanforderung und Passwort-Zurücksetzen.
- **Authentifizierung**: Erfordert Admin-Privilegien, gültige Sitzung und CSRF-Token
- **Parameter**:
  - `id`: Benutzer-ID zum Aktualisieren
- **Anfragekörper**:
  ```json
  {
    "username": "updated-username",
    "isAdmin": true,
    "requirePasswordChange": false,
    "resetPassword": true
  }
  ```
  - Alle Felder sind optional
  - `resetPassword`: Wenn true, generiert ein neues temporäres Passwort und setzt `requirePasswordChange` auf true
- **Antwort** (mit Passwort-Zurücksetzen):
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
- **Antwort** (ohne Passwort-Zurücksetzen):
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
  - `403`: Verboten - Admin-Privilegien erforderlich
  - `404`: Benutzer nicht gefunden
  - `409`: Benutzername existiert bereits (wenn Benutzername geändert wird)
  - `500`: Interner Serverfehler
- **Hinweise**:
  - Nur für Admin-Benutzer zugänglich
  - Benutzernamenänderungen werden auf Eindeutigkeit validiert
  - Passwort-Zurücksetzen generiert ein sicheres 12-stelliges temporäres Passwort
  - Alle Änderungen werden im Audit-Log protokolliert

### Benutzer löschen - `/api/users/:id` {#delete-user-apiusersid}

- **Endpunkt**: `/api/users/:id`
- **Methode**: LÖSCHEN
- **Beschreibung**: Löscht ein Benutzerkonto. Verhindert das Löschen Ihres eigenen Kontos oder des letzten Admin-Kontos.
- **Authentifizierung**: Erfordert Admin-Privilegien, gültige Sitzung und CSRF-Token
- **Parameter**:
  - `id`: Benutzer-ID zum Löschen
- **Antwort**:
  ```json
  {
    "success": true,
    "message": "User deleted successfully"
  }
  ```
- **Fehlerantworten**:
  - `400`: Kann Ihr eigenes Konto oder das letzte Admin-Konto nicht löschen
  - `401`: Nicht autorisiert - Ungültige Sitzung oder CSRF-Token
  - `403`: Verboten - Admin-Privilegien erforderlich
  - `404`: Benutzer nicht gefunden
  - `500`: Interner Serverfehler
- **Hinweise**:
  - Nur für Admin-Benutzer zugänglich
  - Kann Ihr eigenes Konto nicht löschen
  - Das letzte Admin-Konto kann nicht gelöscht werden (mindestens ein Admin muss bleiben)
  - Benutzerlöschung wird im Audit-Log protokolliert
  - Zugehörige Sitzungen werden automatisch gelöscht (Kaskade)

## Audit-Log-Verwaltung {#audit-log-management}

### Audit-Logs auflisten - `/api/audit-log` {#list-audit-logs-apiaudit-log}

- **Endpunkt**: `/api/audit-log`
- **Methode**: GET
- **Beschreibung**: Ruft Audit-Log-Einträge mit Filterung, Pagination und Suchfunktionen ab. Unterstützt sowohl seitenbasierte als auch offset-basierte Pagination.
- **Authentifizierung**: Erfordert gültige Sitzung und CSRF-Token (angemeldeter Benutzer erforderlich)
- **Abfrageparameter**:
  - `page` (optional): Seitennummer für seitenbasierte Pagination
  - `offset` (optional): Offset für offset-basierte Pagination (hat Vorrang vor Seite)
  - `limit` (optional): Elemente pro Seite (Standard: 50)
  - `startDate` (optional): Protokolle von diesem Datum filtern (ISO-Format)
  - `endDate` (optional): Protokolle bis zu diesem Datum filtern (ISO-Format)
  - `userId` (optional): Nach Benutzer-ID filtern
  - `username` (optional): Nach Benutzername filtern
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
  - Unterstützt sowohl seitenbasierte (`page`) als auch offset-basierte (`offset`) Pagination
  - `details`-Feld enthält geparste JSON mit zusätzlichem Kontext
  - Alle Audit-Log-Abfragen werden protokolliert

### Audit-Log-Filterwerte abrufen - `/api/audit-log/filters` {#get-audit-log-filter-values-apiaudit-logfilters}

- **Endpunkt**: `/api/audit-log/filters`
- **Methode**: GET
- **Beschreibung**: Ruft eindeutige Filterwerte ab, die zum Filtern von Audit-Logs verfügbar sind. Gibt alle unterschiedlichen Aktionen, Kategorien und Status zurück, die in der Audit-Log-Datenbank vorhanden sind. Nützlich zum Ausfüllen von Filter-Dropdowns in der Benutzeroberfläche.
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
  - `401`: Nicht autorisiert - Ungültige Sitzung oder CSRF-Token
  - `500`: Interner Serverfehler
- **Hinweise**:
  - Gibt Arrays eindeutiger Werte aus der Audit-Log-Datenbank zurück
  - Werte werden alphabetisch sortiert
  - Leere Arrays werden zurückgegeben, wenn keine Daten vorhanden sind oder bei Fehler
  - Wird vom Audit-Log-Viewer verwendet, um Filter-Dropdowns dynamisch auszufüllen

### Audit-Logs herunterladen - `/api/audit-log/download` {#download-audit-logs-apiaudit-logdownload}

- **Endpunkt**: `/api/audit-log/download`
- **Methode**: GET
- **Beschreibung**: Lädt Audit-Logs in CSV- oder JSON-Format mit optionaler Filterung herunter. Nützlich für externe Analyse und Berichterstattung.
- **Authentifizierung**: Erfordert gültige Sitzung und CSRF-Token (angemeldeter Benutzer erforderlich)
- **Abfrageparameter**:
  - `format` (optional): Exportformat - `csv` oder `json` (Standard: `csv`)
  - `startDate` (optional): Protokolle von diesem Datum filtern (ISO-Format)
  - `endDate` (optional): Protokolle bis zu diesem Datum filtern (ISO-Format)
  - `userId` (optional): Nach Benutzer-ID filtern
  - `username` (optional): Nach Benutzername filtern
  - `action` (optional): Nach Aktionsname filtern
  - `category` (optional): Nach Kategorie filtern
  - `status` (optional): Nach Status filtern
- **Antwort** (CSV):
  - Content-Type: `text/csv`
  - Content-Disposition: `attachment; filename="audit-log-YYYY-MM-DD.csv"`
  - CSV-Datei mit Kopfzeilen: ID, Zeitstempel, Benutzer-ID, Benutzername, Aktion, Kategorie, Zieltyp, Ziel-ID, Status, IP-Adresse, User-Agent, Details, Fehlermeldung
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
  - Details-Feld in CSV ist JSON-stringifiziert
  - Dateiname enthält das aktuelle Datum

### Audit-Logs bereinigen - `/api/audit-log/cleanup` {#cleanup-audit-logs-apiaudit-logcleanup}

- **Endpunkt**: `/api/audit-log/cleanup`
- **Methode**: POST
- **Beschreibung**: Löst manuell die Bereinigung alter Audit-Logs basierend auf der Aufbewahrungsdauer aus. Unterstützt Dry-Run-Modus zur Vorschau, was gelöscht würde.
- **Authentifizierung**: Erfordert Admin-Privilegien, gültige Sitzung und CSRF-Token
- **Anfragekörper**:
  ```json
  {
    "retentionDays": 90,
    "dryRun": false
  }
  ```
  - `retentionDays` (optional): Aufbewahrungstage überschreiben (30-365), andernfalls wird der konfigurierte Wert verwendet
  - `dryRun` (optional): Wenn true, gibt nur zurück, was gelöscht würde, ohne tatsächlich zu löschen
- **Antwort** (Dry Run):
  ```json
  {
    "dryRun": true,
    "wouldDeleteCount": 50,
    "oldestRemaining": "2024-01-01T00:00:00Z",
    "retentionDays": 90,
    "cutoffDate": "2024-01-01"
  }
  ```
- **Antwort** (tatsächliche Bereinigung):
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
  - `403`: Verboten - Admin-Privilegien erforderlich
  - `500`: Interner Serverfehler
- **Hinweise**:
  - Nur für Admin-Benutzer zugänglich
  - Standardaufbewahrung beträgt 90 Tage, falls nicht konfiguriert
  - Bereinigungsvorgang wird im Audit-Log protokolliert
  - Dry-Run-Modus ist nützlich zur Vorschau der Bereinigungsauswirkungen

### Audit-Log-Aufbewahrung abrufen - `/api/audit-log/retention` {#get-audit-log-retention-apiaudit-logretention}

- **Endpunkt**: `/api/audit-log/retention`
- **Methode**: GET
- **Beschreibung**: Ruft die aktuelle Audit-Log-Aufbewahrungskonfiguration in Tagen ab.
- **Authentifizierung**: Erfordert gültige Sitzung und CSRF-Token (kein angemeldeter Benutzer erforderlich)
- **Antwort**:
  ```json
  {
    "retentionDays": 90
  }
  ```
- **Fehlerantworten**:
  - `500`: Interner Serverfehler
- **Hinweise**:
  - Standardaufbewahrung beträgt 90 Tage, falls nicht konfiguriert
  - Kann ohne Authentifizierung zugegriffen werden (schreibgeschützt)

### Audit-Log-Aufbewahrung aktualisieren - `/api/audit-log/retention` {#update-audit-log-retention-apiaudit-logretention}

- **Endpunkt**: `/api/audit-log/retention`
- **Methode**: PATCH
- **Beschreibung**: Aktualisiert die Audit-Log-Aufbewahrungsdauer in Tagen. Diese Einstellung bestimmt, wie lange Audit-Logs vor der automatischen Bereinigung aufbewahrt werden.
- **Authentifizierung**: Erfordert Admin-Privilegien, gültige Sitzung und CSRF-Token
- **Anfragekörper**:
  ```json
  {
    "retentionDays": 120
  }
  ```
  - `retentionDays`: Erforderlich, muss zwischen 30 und 365 Tagen liegen
- **Antwort**:
  ```json
  {
    "success": true,
    "retentionDays": 120
  }
  ```
- **Fehlerantworten**:
  - `400`: Ungültige Aufbewahrungstage (muss 30-365 sein)
  - `401`: Nicht autorisiert - Ungültige Sitzung oder CSRF-Token
  - `403`: Verboten - Admin-Privilegien erforderlich
  - `500`: Interner Serverfehler
- **Hinweise**:
  - Nur für Admin-Benutzer zugänglich
  - Konfigurationsänderung wird im Audit-Log protokolliert
  - Aufbewahrungsdauer wirkt sich auf automatische und manuelle Bereinigungsvorgänge aus

## Datenbankverwaltung {#database-management}

### Datenbank sichern - `/api/database/backup` {#backup-database-apidatabasebackup}

- **Endpunkt**: `/api/database/backup`
- **Methode**: GET
- **Beschreibung**: Erstellt eine Sicherung der Datenbank in binärem (.db) oder SQL (.sql) Format. Die Sicherungsdatei wird automatisch mit einem Zeitstempel-Dateinamen heruntergeladen.
- **Authentifizierung**: Erfordert Admin-Privilegien, gültige Sitzung und CSRF-Token
- **Abfrageparameter**:
  - `format` (optional): Sicherungsformat - `db` (binär) oder `sql` (SQL-Dump). Standard: `db`
- **Antwort**:
  - Content-Type: `application/octet-stream` (für .db) oder `text/plain` (für .sql)
  - Content-Disposition: `attachment; filename="duplistatus-backup-YYYY-MM-DDTHH-MM-SS.db"` oder `.sql`
  - Binärdateiinhalt (für .db) oder SQL-Textinhalt (für .sql)
- **Fehlerantworten**:
  - `400`: Ungültiges Format (muss "db" oder "sql" sein)
  - `401`: Nicht autorisiert - Ungültige Sitzung oder CSRF-Token
  - `403`: Verboten - Admin-Privilegien erforderlich
  - `500`: Fehler beim Erstellen der Datenbanksicherung
- **Hinweise**:
  - Nur für Admin-Benutzer zugänglich
  - Binärformat verwendet SQLites Sicherungsmethode für Integrität
  - SQL-Format erstellt einen Textdump des gesamten Datenbankinhalts
  - Zeitstempel im Dateinamen verwendet die lokale Zeitzone des Servers
  - Sicherungsvorgang wird im Audit-Log protokolliert
  - Temporäre Dateien werden nach dem Download automatisch bereinigt

### Datenbank wiederherstellen - `/api/database/restore` {#restore-database-apidatabaserestore}

- **Endpunkt**: `/api/database/restore`
- **Methode**: POST
- **Beschreibung**: Stellt die Datenbank aus einer Sicherungsdatei (.db oder .sql Format) wieder her. Erstellt vor der Wiederherstellung eine Sicherheitssicherung und löscht alle Sitzungen nach der Wiederherstellung aus Sicherheitsgründen.
- **Authentifizierung**: Erfordert Admin-Privilegien, gültige Sitzung und CSRF-Token
- **Anfragekörper**: FormData mit einem Dateifeld namens `database`
  - Datei muss entweder `.db`, `.sqlite`, `.sqlite3` (Binärformat) oder `.sql` (SQL-Format) sein
  - Maximale Dateigröße: 100MB
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
  - `403`: Verboten - Admin-Privilegien erforderlich
  - `500`: Fehler beim Wiederherstellen der Datenbank (ursprüngliche Datenbank wird aus Sicherheitssicherung wiederhergestellt, wenn Wiederherstellung fehlschlägt)
- **Hinweise**:
  - Nur für Admin-Benutzer zugänglich
  - Erstellt automatisch eine Sicherheitssicherung vor der Wiederherstellung
  - Unterstützt sowohl binäre (.db) als auch SQL (.sql) Formate
  - Validiert Datenbankintegrität nach der Wiederherstellung
  - Wenn Wiederherstellung fehlschlägt, wird automatisch aus Sicherheitssicherung wiederhergestellt
  - Alle Sitzungen werden nach erfolgreicher Wiederherstellung aus Sicherheitsgründen gelöscht
  - Gibt `requiresReauth: true` zurück, um anzuzeigen, dass sich der Benutzer erneut anmelden muss
  - Wiederherstellungsvorgang wird im Audit-Log protokolliert
  - Für SQL-Format wird SQL-Inhalt vor der Ausführung validiert
  - Datenbankverbindung wird nach der Wiederherstellung neu initialisiert
  - Alle Caches werden nach der Wiederherstellung ungültig gemacht

## Sicherungs-Zeitstempel {#backup-timestamps}

### Letzte Sicherungs-Zeitstempel abrufen - `/api/backups/last-timestamps` {#get-last-backup-timestamps-apibackupslast-timestamps}

- **Endpunkt**: `/api/backups/last-timestamps`
- **Methode**: GET
- **Beschreibung**: Ruft den letzten Sicherungs-Zeitstempel für jede Server-Sicherungs-Kombination ab. Gibt eine Zuordnung zur einfachen Suche zurück.
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
  - `401`: Nicht autorisiert - Ungültige Sitzung oder CSRF-Token
  - `500`: Fehler beim Abrufen der letzten Sicherungs-Zeitstempel
- **Hinweise**:
  - Gibt sowohl eine Zuordnung (zur einfachen Suche nach `server_id:backup_name`) als auch Roharray-Format zurück
  - Enthält Cache-Control-Header, um Caching zu verhindern
  - Nützlich zum Verfolgen der letzten Sicherungszeiten über alle Server-Sicherungs-Kombinationen
  - Zeitstempel sind im ISO-Format

## Anwendungsprotokolle-Verwaltung {#application-logs-management}

### Anwendungsprotokolle abrufen - `/api/application-logs` {#get-application-logs-apiapplication-logs}

- **Endpunkt**: `/api/application-logs`
- **Methode**: GET
- **Beschreibung**: Ruft Anwendungsprotokoll-Einträge aus Protokolldateien ab. Unterstützt das Lesen aktueller und rotierter Protokolldateien mit Tail-Funktionalität.
- **Authentifizierung**: Erfordert Admin-Privilegien, gültige Sitzung und CSRF-Token
- **Abfrageparameter**:
  - `file` (optional): Zu lesende Protokolldatei - `application.log`, `application.log.1`, `application.log.2`, usw. Falls nicht angegeben, wird eine Liste verfügbarer Dateien zurückgegeben
  - `tail` (optional): Anzahl der Zeilen, die vom Ende der Datei zurückgegeben werden (Standard: 1000, Min: 1, Max: 10000)
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
  - `400`: Ungültiger Tail-Parameter (muss 1-10000 sein) oder ungültiges Dateiparameterformat
  - `401`: Nicht autorisiert - Ungültige Sitzung oder CSRF-Token
  - `403`: Verboten - Admin-Privilegien erforderlich
  - `404`: Protokolldatei nicht gefunden
  - `500`: Fehler beim Lesen der Protokolldatei
- **Hinweise**:
  - Nur für Admin-Benutzer zugänglich
  - Unterstützt das Lesen der aktuellen Protokolldatei und rotierter Protokolldateien (bis zu 10 rotierte Dateien)
  - Gibt die letzten N Zeilen (Tail) aus der angegebenen Protokolldatei zurück
  - Protokolldateiname wird durch Umgebungsvariable bestimmt (Standard: `application.log`)
  - Gibt eine Liste verfügbarer Protokolldateien zurück, wenn der Dateiparameter nicht angegeben ist
  - Dateinamen werden validiert, um Directory-Traversal-Angriffe zu verhindern
  - Rotierte Dateien werden sequenziell nummeriert (`.1`, `.2`, usw.)

### Anwendungsprotokolle exportieren - `/api/application-logs/export` {#export-application-logs-apiapplication-logsexport}

- **Endpunkt**: `/api/application-logs/export`
- **Methode**: GET
- **Beschreibung**: Exportiert Anwendungsprotokoll-Einträge in gefiltertem Textformat. Unterstützt Filterung nach Protokollebene und Suchzeichenfolge.
- **Authentifizierung**: Erfordert Admin-Privilegien, gültige Sitzung und CSRF-Token
- **Abfrageparameter**:
  - `file` (erforderlich): Zu exportierende Protokolldatei - `application.log`, `application.log.1`, `application.log.2`, usw.
  - `logLevels` (optional): Kommagetrennte Liste von Protokollebenen zum Einschließen - `INFO`, `WARN`, `ERROR` (Standard: `INFO,WARN,ERROR`)
  - `search` (optional): Suchzeichenfolge zum Filtern von Protokollzeilen (Groß-/Kleinschreibung ignoriert)
- **Antwort**:
  - Content-Type: `text/plain`
  - Content-Disposition: `attachment; filename="duplistatus-logs-YYYY-MM-DDTHH-MM-SS.txt"`
  - Gefilterter Protokollinhalt als Klartext
- **Fehlerantworten**:
  - `400`: Dateiparameter ist erforderlich oder ungültiges Dateiparameterformat
  - `401`: Nicht autorisiert - Ungültige Sitzung oder CSRF-Token
  - `403`: Verboten - Admin-Privilegien erforderlich
  - `500`: Fehler beim Exportieren der Protokolle
- **Hinweise**:
  - Nur für Admin-Benutzer zugänglich
  - Exportiert gefilterte Protokolleinträge basierend auf Protokollebene und Suchkriterien
  - Unterstützt Filterung nach Protokollebenen: `INFO`, `WARN`, `ERROR`
  - Suchzeichenfolgen-Filterung ist Groß-/Kleinschreibung ignoriert
  - Leere Zeilen werden automatisch gefiltert
  - Protokolldateiname wird durch Umgebungsvariable bestimmt (Standard: `application.log`)
  - Dateinamen werden validiert, um Directory-Traversal-Angriffe zu verhindern
  - Exportierte Datei enthält Zeitstempel im Dateinamen
  - Nützlich für externe Analyse und Fehlerbehebung
