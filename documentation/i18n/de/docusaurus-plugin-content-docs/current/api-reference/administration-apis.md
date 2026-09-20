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
  - `500`: Serverfehler bei der Sicherungserfassung
- **Hinweise**: 
  - Der Endpunkt erkennt automatisch das optimale Verbindungsprotokoll (HTTPS → HTTPS mit selbstsigniertem Zertifikat → HTTP)
  - Protokollerkennungsversuche erfolgen in der Reihenfolge der Sicherheitspräferenz
  - Verbindungs-Timeouts sind über Umgebungsvariablen konfigurierbar
  - Protokolliert erfasste Daten im Entwicklungsmodus zur Fehlerbehebung
  - Stellt sicher, dass die Sicherungseinstellungen für alle Server und alle Sicherungen vollständig sind
  - Verwendet Standard-Port 8200, falls nicht angegeben
  - Das erkannte Protokoll und die Server-URL werden automatisch in der Datenbank gespeichert
  - `serverAlias` wird aus der Datenbank abgerufen und kann leer sein, wenn kein Alias festgelegt ist
  - Das Frontend sollte `serverAlias || serverName` für Anzeigezwecke verwenden
  - Unterstützt sowohl JSON-Download- als auch direkte API-Erfassungsmethoden

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
  - `401`: Nicht autorisiert – Ungültige Sitzung oder ungültiges CSRF-Token
  - `400`: Ungültige Aufbewahrungsfrist angegeben
  - `500`: Serverfehler während des Bereinigungsvorgangs mit detaillierten Fehlerinformationen
- **Hinweise**: 
  - Der Bereinigungsvorgang kann nicht rückgängig gemacht werden
  - Sicherungsdaten werden dauerhaft aus der Datenbank gelöscht
  - Maschinendatensätze bleiben erhalten, selbst wenn alle Sicherungen gelöscht werden
  - Wenn "Alle Daten löschen" ausgewählt ist, werden alle Maschinen und Sicherungen entfernt und die Konfiguration wird gelöscht
  - Die erweiterte Fehlerberichterstattung umfasst Details und Stack-Trace im Entwicklungsmodus
  - Unterstützt sowohl zeitbasierte Aufbewahrung als auch das vollständige Löschen von Daten

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
  - `401`: Nicht autorisiert – Ungültige Sitzung oder ungültiges CSRF-Token
  - `403`: Das Löschen von Sicherungsaufträgen ist nur im Entwicklungsmodus verfügbar
  - `400`: Server-ID und Backup-Name sind erforderlich
  - `404`: Keine zu löschenden Sicherungen gefunden
  - `500`: Serverfehler während des Löschens mit detaillierten Fehlerinformationen
- **Hinweise**: 
  - Dieser Vorgang ist nur im Entwicklungsmodus verfügbar
  - Dieser Vorgang kann nicht rückgängig gemacht werden
  - Alle Sicherungseinträge für die angegebene Server-Sicherungs-Kombination werden dauerhaft gelöscht
  - Gibt die Anzahl der gelöschten Sicherungen und Serverinformationen zurück
  - Verwendet zur Anzeige den Server-Alias, sofern verfügbar, andernfalls den Servernamen

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
  - `400`: Ungültige Anforderungsparameter, fehlender Hostname/fehlendes Passwort, wenn serverId nicht angegeben ist, oder Verbindung fehlgeschlagen
  - `404`: Server nicht gefunden (wenn serverId angegeben ist) oder kein Passwort für den Server gespeichert
  - `500`: Serverfehler während der Zeitplansynchronisierung
- **Hinweise**: 
  - Der Endpunkt erkennt automatisch das optimale Verbindungsprotokoll (HTTPS → HTTPS mit selbstsigniertem Zertifikat → HTTP)
  - Kann nur mit serverId aufgerufen werden, um die gespeicherten Server-Anmeldedaten zu verwenden
  - Kann mit serverId und neuen Anmeldedaten aufgerufen werden, um die Serververbindungsdetails zu aktualisieren
  - Kann bei neuen Servern mit Hostname/Port/Passwort ohne serverId aufgerufen werden
  - Aktualisiert Sicherungseinstellungen mit Zeitplaninformationen einschließlich:
    - `expectedInterval`: Das Wiederholungsintervall (z. B. „Täglich“, „Wöchentlich“, „Monatlich“)
    - `allowedWeekDays`: Array zulässiger Wochentage (0=Sonntag, 1=Montag usw.)
    - `time`: Die geplante Zeit für die Sicherung
  - Verarbeitet alle auf dem Server gefundenen Sicherungen
  - Gibt Statistiken zu verarbeiteten Sicherungen und aufgetretenen Fehlern zurück
  - Protokolliert Audit-Ereignisse für erfolgreiche und fehlgeschlagene Synchronisierungsvorgänge
  - Verwendet den Standard-Port 8200, falls nicht angegeben

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
  - Der Endpunkt validiert das URL-Format und testet die Konnektivität
  - Gibt Erfolg zurück, wenn der Server mit dem Status 401 antwortet (erwartet für den Login-Endpunkt ohne Anmeldedaten)
  - Testet die Verbindung zum Login-Endpunkt des Duplicati-Servers
  - Unterstützt sowohl das HTTP- als auch das HTTPS-Protokoll
  - Verwendet die Timeout-Konfiguration für Verbindungstests

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
  - Gibt die Server-URL für einen bestimmten Server zurück
  - Wird für die Verwaltung von Serververbindungen verwendet
  - Gibt eine leere Zeichenfolge zurück, wenn keine Server-URL festgelegt ist

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
  - `401`: Nicht autorisiert – Ungültige Sitzung oder ungültiges CSRF-Token
  - `400`: Ungültiges URL-Format
  - `404`: Server nicht gefunden
  - `500`: Serverfehler bei der Aktualisierung
- **Hinweise**: 
  - Der Endpunkt validiert das URL-Format vor der Aktualisierung
  - Leere Server-URLs oder NULL-Werte sind zulässig
  - Unterstützt sowohl das HTTP- als auch das HTTPS-Protokoll
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
  - `500`: Generierung des CSRF-Tokens fehlgeschlagen
- **Hinweise**:
  - Gibt ein CSRF-Token zur Verwendung bei Passwort-Aktualisierungsvorgängen zurück
  - Die Sitzung muss gültig sein, um das Token zu generieren

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
  - `400`: Passwort muss eine Zeichenfolge sein
  - `401`: Nicht autorisiert – Ungültige Sitzung oder ungültiges CSRF-Token
  - `500`: Passwort konnte nicht aktualisiert werden
- **Hinweise**:
  - Das Passwort kann eine leere Zeichenfolge sein, um das Passwort zu löschen
  - Das Passwort wird mithilfe des Secrets-Management-Systems sicher gespeichert

## Benutzerverwaltung {/* #user-management */}

### Benutzer auflisten - `/api/users` {/* #list-users---apiusers */}
- **Endpunkt**: `/api/users`
- **Methode**: GET
- **Beschreibung**: Listet alle Benutzer mit Paginierung und optionaler Suchfilterung auf. Gibt Benutzerinformationen einschließlich Anmeldeverlauf und Kontostatus zurück.
- **Authentifizierung**: Erfordert Admin-Berechtigungen, eine gültige Sitzung und ein CSRF-Token
- **Abfrageparameter**:
  - `page` (optional): Seitennummer (Standard: 1)
  - `limit` (optional): Elemente pro Seite (Standard: 50)
  - `search` (optional): Suchbegriff: Nach Benutzername filtern
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
  - `401`: Unauthorized – Ungültige Sitzung oder ungültiges CSRF-Token
  - `403`: Forbidden – Admin-Rechte erforderlich
  - `500`: Interner Serverfehler
- **Hinweise**:
  - Nur für Admin-Benutzer zugänglich
  - Unterstützt Paginierung und Suchfilterung
  - Gibt den Status des Benutzerkontos einschließlich des Sperrstatus zurück

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

- `username`: Erforderlich, muss 3–50 Zeichen lang und eindeutig sein
  - `password`: Optional; wenn nicht angegeben, wird ein sicheres temporäres Passwort generiert
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
  - `400`: Ungültiges Format des Benutzernamens, Verstoß gegen die Passwortrichtlinie oder Validierungsfehler
  - `401`: Unauthorized – Ungültige Sitzung oder ungültiges CSRF-Token
  - `403`: Forbidden – Admin-Rechte erforderlich
  - `409`: Benutzername existiert bereits
  - `500`: Interner Serverfehler
- **Hinweise**:
  - Nur für Admin-Benutzer zugänglich
  - Beim Benutzernamen wird nicht zwischen Groß- und Kleinschreibung unterschieden; er wird in Kleinbuchstaben gespeichert
  - Wenn kein Passwort angegeben wird, wird ein sicheres 12-stelliges Passwort generiert
  - Generierte temporäre Passwörter werden nur einmal in der Antwort zurückgegeben
  - Die Benutzererstellung wird im Audit-Protokoll protokolliert

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
  - `401`: Unauthorized – Ungültige Sitzung oder ungültiges CSRF-Token
  - `403`: Forbidden – Admin-Rechte erforderlich
  - `404`: Benutzer nicht gefunden
  - `409`: Benutzername existiert bereits (bei Änderung des Benutzernamens)
  - `500`: Interner Serverfehler
- **Hinweise**:
  - Nur für Admin-Benutzer zugänglich
  - Änderungen des Benutzernamens werden auf Eindeutigkeit überprüft
  - Die Passwort-Zurücksetzung generiert ein sicheres 12-stelliges temporäres Passwort
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
  - `400`: Das eigene Konto oder der letzte Administratorbenutzer kann nicht gelöscht werden
  - `401`: Nicht autorisiert – Ungültige Sitzung oder CSRF-Token
  - `403`: Verboten – Admin-Berechtigungen erforderlich
  - `404`: Benutzer nicht gefunden
  - `500`: Interner Serverfehler
- **Hinweise**:
  - Nur für Admin-Benutzer zugänglich
  - Das eigene Konto kann nicht gelöscht werden
  - Der letzte Administratorbenutzer kann nicht gelöscht werden (mindestens ein Admin muss verbleiben)
  - Das Löschen von Benutzern wird im Audit-Protokoll protokolliert
  - Zugehörige Sitzungen werden automatisch gelöscht (Kaskadierung)

## Audit-Protokoll-Verwaltung {/* #audit-log-management */}

### Audit-Protokolle auflisten - `/api/audit-log` {/* #list-audit-logs---apiaudit-log */}
- **Endpunkt**: `/api/audit-log`
- **Methode**: GET
- **Beschreibung**: Ruft Audit-Protokolleinträge mit Filter-, Paginierungs- und Suchfunktionen ab. Unterstützt sowohl seitenbasierte als auch offsetbasierte Paginierung.
- **Authentifizierung**: Erfordert eine gültige Sitzung und ein CSRF-Token (angemeldeter Benutzer erforderlich)
- **Abfrageparameter**:
  - `page` (optional): Seitennummer für seitenbasierte Paginierung
  - `offset` (optional): Offset für offsetbasierte Paginierung (hat Vorrang vor Seite)
  - `limit` (optional): Elemente pro Seite (Standard: 50)
  - `startDate` (optional): Protokolle ab diesem Datum filtern (ISO-Format)
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
  - `401`: Nicht autorisiert – Ungültige Sitzung oder CSRF-Token
  - `500`: Interner Serverfehler
- **Hinweise**:
  - Unterstützt sowohl seitenbasierte (`page`) als auch offsetbasierte (`offset`) Paginierung
  - Feld `details` enthält geparstes JSON mit zusätzlichem Kontext
  - Alle Audit-Protokoll-Abfragen werden protokolliert

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
  - `401`: Nicht autorisiert – Ungültige Sitzung oder CSRF-Token
  - `500`: Interner Serverfehler
- **Hinweise**:
  - Gibt Arrays mit eindeutigen Werten aus der Audit-Protokoll-Datenbank zurück
  - Werte sind alphabetisch sortiert
  - Leere Arrays werden zurückgegeben, wenn keine Daten vorhanden sind oder ein Fehler auftritt
  - Wird vom Prüfprotokoll-Viewer verwendet, um Filter-Dropdowns dynamisch zu befüllen

### Audit-Protokolle herunterladen - `/api/audit-log/download` {/* #download-audit-logs---apiaudit-logdownload */}
- **Endpunkt**: `/api/audit-log/download`
- **Methode**: GET
- **Beschreibung**: Lädt Audit-Protokolle im CSV- oder JSON-Format mit optionaler Filterung herunter. Nützlich für externe Analysen und Berichte.
- **Authentifizierung**: Erfordert eine gültige Sitzung und ein CSRF-Token (angemeldeter Benutzer erforderlich)
- **Abfrageparameter**:
  - `format` (optional): Exportformat – `csv` oder `json` (Standard: `csv`)
  - `startDate` (optional): Protokolle ab diesem Datum filtern (ISO-Format)
  - `endDate` (optional): Protokolle bis zu diesem Datum filtern (ISO-Format)
  - `userId` (optional): Nach Benutzer-ID filtern
  - `username` (optional): Nach Benutzername filtern
  - `action` (optional): Nach Aktionsname filtern
  - `category` (optional): Nach Kategorie filtern
  - `status` (optional): Nach Status filtern
- **Antwort** (CSV):
  - Content-Type: `text/csv`
  - Content-Disposition: `attachment; filename="audit-log-YYYY-MM-DD.csv"`
  - CSV-Datei mit Spaltenüberschriften: ID, Zeitstempel, Benutzer-ID, Benutzername, Aktion, Kategorie, Zieltyp, Ziel-ID, Status, IP-Adresse, Benutzer-Agent, Details, Fehlermeldung
- **Antwort** (JSON):
  - Content-Type: `application/json`
  - Content-Disposition: `attachment; filename="audit-log-YYYY-MM-DD.json"`
  - JSON-Array von Audit-Protokolleinträgen
- **Error Responses**:
  - `400`: Keine Protokolle zum Exportieren vorhanden
  - `401`: Nicht autorisiert – Ungültige Sitzung oder ungültiges CSRF-Token
  - `500`: Interner Serverfehler
- **Notes**:
  - Exportbeschränkung liegt bei 10.000 Datensätzen
  - Das CSV-Format maskiert Sonderzeichen ordnungsgemäß
  - Das Feld „Details“ in der CSV-Datei ist JSON-serialisiert (JSON-stringified)
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

- **Error Responses**:
  - `400`: Ungültige Aufbewahrungstage (muss zwischen 30 und 365 liegen)
  - `401`: Nicht autorisiert – Ungültige Sitzung oder ungültiges CSRF-Token
  - `403`: Verboten – Admin-Berechtigungen erforderlich
  - `500`: Interner Serverfehler
- **Notes**:
  - Nur für Admin-Benutzer zugänglich
  - Standardaufbewahrung beträgt 90 Tage, falls nicht konfiguriert
  - Bereinigungsvorgang wird im Audit-Protokoll protokolliert
  - Der Dry-Run-Modus ist nützlich für die Vorschau der Auswirkungen der Bereinigung

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

- **Error Responses**:
  - `500`: Interner Serverfehler
- **Notes**:
  - Standardaufbewahrung beträgt 90 Tage, falls nicht konfiguriert
  - Kann ohne Authentifizierung aufgerufen werden (schreibgeschützt)

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

- **Error Responses**:
  - `400`: Ungültige Aufbewahrungstage (muss zwischen 30 und 365 liegen)
  - `401`: Nicht autorisiert – Ungültige Sitzung oder ungültiges CSRF-Token
  - `403`: Verboten – Admin-Berechtigungen erforderlich
  - `500`: Interner Serverfehler
- **Notes**:
  - Nur für Admin-Benutzer zugänglich
  - Konfigurationsänderung wird im Audit-Protokoll protokolliert
  - Der Aufbewahrungszeitraum wirkt sich auf automatische und manuelle Bereinigungsvorgänge aus

## API-Schlüssel {/* #api-keys */}

### API-Schlüssel auflisten - `/api/api-keys` {/* #list-api-keys---apiapi-keys */}
- **Endpunkt**: `/api/api-keys`
- **Methode**: GET
- **Beschreibung**: Listet alle API-Schlüssel auf. Secrets werden niemals zurückgegeben; jeder Schlüssel enthält einen Fingerabdruck (`Qk7v…3xTa`).
- **Authentifizierung**: Erfordert Admin-Berechtigungen, eine gültige Sitzung und ein CSRF-Token
- **Fehlerantworten**:
  - `401`: Nicht autorisiert – Ungültige Sitzung oder ungültiges CSRF-Token
  - `403`: Verboten – Admin-Berechtigungen erforderlich
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
  - `401`: Nicht autorisiert – Ungültige Sitzung oder ungültiges CSRF-Token
  - `403`: Verboten – Admin-Berechtigungen erforderlich
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
- **Authentifizierung**: Erfordert Admin-Berechtigungen, eine gültige Sitzung und ein CSRF-Token
- **Abfrageparameter**:
  - `format` (optional): Backup-Format – `db` (binär) oder `sql` (SQL-Dump). Standard: `db`
- **Antwort**:
  - Content-Type: `application/octet-stream` (für .db) oder `text/plain` (für .sql)
  - Content-Disposition: `attachment; filename="duplistatus-backup-YYYY-MM-DDTHH-MM-SS.db"` oder `.sql`
  - Binärer Dateiinhalt (für .db) oder SQL-Textinhalt (für .sql)
- **Fehlerantworten**:
  - `400`: Ungültiges Format (muss "db" oder "sql" sein)
  - `401`: Nicht autorisiert – Ungültige Sitzung oder ungültiges CSRF-Token
  - `403`: Verboten – Admin-Berechtigungen erforderlich
  - `500`: Erstellen des Datenbank-Backups fehlgeschlagen
- **Hinweise**:
  - Nur für Admin-Benutzer zugänglich
  - Das Binärformat verwendet die Backup-Methode von SQLite für die Integrität
  - Das SQL-Format erstellt einen Text-Dump aller Datenbankinhalte
  - Zeitstempel im Dateinamen verwendet die lokale Zeitzone des Servers
  - Sicherungsvorgang wird im Audit-Protokoll protokolliert
  - Temporäre Dateien werden nach dem Herunterladen automatisch bereinigt

### Datenbank wiederherstellen - `/api/database/restore` {/* #restore-database---apidatabaserestore */}
- **Endpunkt**: `/api/database/restore`
- **Methode**: POST
- **Beschreibung**: Stellt die Datenbank aus einer Sicherungsdatei (.db- oder .sql-Format) wieder her. Erstellt vor der Wiederherstellung eine Sicherung zur Absicherung und löscht nach der Wiederherstellung aus Sicherheitsgründen alle Sitzungen.
- **Authentifizierung**: Erfordert Admin-Rechte, eine gültige Sitzung und ein CSRF-Token
- **Request-Body**: FormData mit einem Dateifeld namens `database`
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
  - `400`: Keine Datei angegeben, Dateigröße überschreitet das Limit, ungültiges Dateiformat oder Integritätsprüfung der Datenbank fehlgeschlagen
  - `401`: Nicht autorisiert – Ungültige Sitzung oder ungültiges CSRF-Token
  - `403`: Verboten – Admin-Rechte erforderlich
  - `500`: Datenbank wiederherstellen fehlgeschlagen (ursprüngliche Datenbank wird bei fehlgeschlagener Wiederherstellung aus der Sicherheitskopie wiederhergestellt)
- **Hinweise**:
  - Nur für Admin-Benutzer zugänglich
  - Erstellt vor der Wiederherstellung automatisch eine Sicherheitskopie
  - Unterstützt sowohl Binär- (.db) als auch SQL-Formate (.sql)
  - Validiert die Datenbankintegrität nach der Wiederherstellung
  - Stellt bei fehlgeschlagener Wiederherstellung automatisch aus der Sicherheitskopie wieder her
  - Alle Sitzungen werden nach erfolgreicher Wiederherstellung aus Sicherheitsgründen gelöscht
  - Gibt `requiresReauth: true` zurück, um anzuzeigen, dass der Benutzer sich erneut anmelden muss
  - Wiederherstellungsvorgang wird im Audit-Protokoll protokolliert
  - Validiert bei SQL-Format den SQL-Inhalt vor der Ausführung
  - Datenbankverbindung wird nach der Wiederherstellung neu initialisiert
  - Alle Caches werden nach der Wiederherstellung invalidiert

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
  - `401`: Nicht autorisiert – Ungültige Sitzung oder ungültiges CSRF-Token
  - `500`: Fehler beim Abrufen der Zeitstempel der letzten Sicherung
- **Hinweise**:
  - Gibt sowohl eine Map (zum einfachen Nachschlagen nach `server_id:backup_name`) als auch das Roh-Array-Format zurück
  - Enthält Cache-Control-Header zur Verhinderung von Caching
  - Nützlich zur Nachverfolgung der Zeiten der letzten Sicherung über alle Server-Sicherungs-Kombinationen hinweg
  - Zeitstempel liegen im ISO-Format vor

## Verwaltung der Anwendungsprotokolle {/* #application-logs-management */}

### Anwendungsprotokolle abrufen - `/api/application-logs` {/* #get-application-logs---apiapplication-logs */}
- **Endpunkt**: `/api/application-logs`
- **Methode**: GET
- **Beschreibung**: Ruft Anwendungsprotokolleinträge aus Protokolldateien ab. Unterstützt das Lesen aktueller und rotierter Protokolldateien mit Tail-Funktionalität.
- **Authentifizierung**: Erfordert Admin-Rechte, eine gültige Sitzung und ein CSRF-Token
- **Abfrageparameter**:
  - `file` (optional): Name der zu lesenden Protokolldatei – `application.log`, `application.log.1`, `application.log.2` usw. Falls nicht angegeben, wird die Liste der verfügbaren Dateien zurückgegeben
  - `tail` (optional): Anzahl der vom Ende der Datei zurückzugebenden Zeilen (Standard: 1000, Min: 1, Max: 10000)
- **Antwort** (mit file-Parameter):

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
  - `400`: Ungültiger tail-Parameter (muss 1-10000 sein) oder ungültiges Format des file-Parameters
  - `401`: Nicht autorisiert – Ungültige Sitzung oder ungültiges CSRF-Token
  - `403`: Verboten – Admin-Rechte erforderlich
  - `404`: Protokolldatei nicht gefunden
  - `500`: Fehler beim Lesen der Protokolldatei
- **Hinweise**:
  - Nur für Admin-Benutzer zugänglich
  - Unterstützt das Lesen der aktuellen Protokolldatei und rotierter Protokolldateien (bis zu 10 rotierte Dateien)
  - Gibt die letzten N Zeilen (Tail) aus der angegebenen Protokolldatei zurück
  - Name der Protokolldatei wird über Umgebungsvariable bestimmt (Standard: `application.log`)
  - Gibt eine Liste verfügbarer Protokolldateien zurück, wenn kein file-Parameter angegeben ist
  - Dateinamen werden validiert, um Directory-Traversal-Angriffe zu verhindern
  - Rotierte Dateien sind fortlaufend nummeriert (`.1`, `.2` usw.)

### Anwendungsprotokolle exportieren – `/api/application-logs/export` {/* #export-application-logs---apiapplication-logsexport */}
- **Endpunkt**: `/api/application-logs/export`
- **Methode**: GET
- **Beschreibung**: Exportiert Anwendungsprotokolleinträge in einem gefilterten Textformat. Unterstützt das Filtern nach Protokollebene und Suchzeichenfolge.
- **Authentifizierung**: Erfordert Admin-Berechtigungen, eine gültige Sitzung und ein CSRF-Token
- **Abfrageparameter**:
  - `file` (erforderlich): Name der zu exportierenden Protokolldatei – `application.log`, `application.log.1`, `application.log.2` usw.
  - `logLevels` (optional): Kommagetrennte Liste der einzuschließenden Protokollebenen – `INFO`, `WARN`, `ERROR` (Standard: `INFO,WARN,ERROR`)
  - `search` (optional): Suchzeichenfolge zum Filtern von Protokollzeilen (Groß-/Kleinschreibung wird nicht berücksichtigt)
- **Antwort**:
  - Content-Type: `text/plain`
  - Content-Disposition: `attachment; filename="duplistatus-logs-YYYY-MM-DDTHH-MM-SS.txt"`
  - Gefilterter Protokollinhalt als Klartext
- **Fehlerantworten**:
  - `400`: Dateiparameter ist erforderlich oder ungültiges Format für den Dateiparameter
  - `401`: Nicht autorisiert – Ungültige Sitzung oder ungültiges CSRF-Token
  - `403`: Verboten – Admin-Berechtigungen erforderlich
  - `500`: Protokolle konnten nicht exportiert werden
- **Hinweise**:
  - Nur für Admin-Benutzer zugänglich
  - Exportiert gefilterte Protokolleinträge basierend auf Protokollebene und Suchkriterien
  - Unterstützt das Filtern nach Protokollebenen: `INFO`, `WARN`, `ERROR`
  - Bei der Filterung nach Suchzeichenfolgen wird die Groß-/Kleinschreibung nicht berücksichtigt
  - Leerzeilen werden automatisch herausgefiltert
  - Der Name der Protokolldatei wird durch die Umgebungsvariable bestimmt (Standard: `application.log`)
  - Dateinamen werden validiert, um Directory-Traversal-Angriffe zu verhindern
  - Die exportierte Datei enthält einen Zeitstempel im Dateinamen
  - Nützlich für externe Analysen und die Fehlerbehebung
