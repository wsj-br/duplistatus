# Administration {/* #administration */}

## Backups sammeln - `/api/backups/collect` {/* #collect-backups---apibackupscollect */}
- **Endpunkt**: `/api/backups/collect`
- **Methode**: POST
- **Beschreibung**: Sammelt Sicherungsdaten direkt von einem Duplicati-Server über dessen API. Dieser Endpunkt erkennt automatisch das beste Verbindungsprotokoll (HTTPS mit SSL-Validierung, HTTPS mit selbstsignierten Zertifikaten oder HTTP als Fallback) und verbindet sich mit dem Duplicati-Server, um Sicherungsinformationen abzurufen und in die lokale Datenbank zu verarbeiten.
- **Authentifizierung**: Erfordert eine gültige Sitzung und ein CSRF-Token
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
  - `400`: Ungültige Anfrageparameter oder Verbindungsfehler
  - `500`: Serverfehler während der Sicherungsdatenabfrage
- **Hinweise**: 
  - Der Endpunkt erkennt automatisch das optimale Verbindungsprotokoll (HTTPS → HTTPS mit selbstsigniertem Zertifikat → HTTP)
  - Protokollerkenntungsversuche erfolgen in der Reihenfolge der Sicherheitspräferenz
  - Verbindungszeitüberschreitungen sind über Umgebungsvariablen konfigurierbar
  - Protokolliert gesammelte Daten im Entwicklungsmodus zur Fehlerbehebung
  - Stellt sicher, dass die Sicherungseinstellungen für alle Server und Sicherungen vollständig sind
  - Verwendet den Standardport 8200, falls nicht angegeben
  - Das erkannte Protokoll und die Server-URL werden automatisch in der Datenbank gespeichert
  - `serverAlias` wird aus der Datenbank abgerufen und kann leer sein, wenn kein Alias gesetzt ist
  - Die Frontend-Anwendung sollte `serverAlias || serverName` zur Anzeige verwenden
  - Unterstützt sowohl den JSON-Download als auch die direkte API-Sammlung

## Backups bereinigen - `/api/backups/cleanup` {/* #cleanup-backups---apibackupscleanup */}
- **Endpunkt**: `/api/backups/cleanup`
- **Methode**: POST
- **Beschreibung**: Löscht alte Sicherungsdaten basierend auf der Aufbewahrungsdauer. Dieser Endpunkt hilft, die Datenbankgröße zu verwalten, indem veraltete Sicherungsdatensätze entfernt werden, während aktuelle und wichtige Daten beibehalten werden.
- **Authentifizierung**: Erfordert eine gültige Sitzung und ein CSRF-Token
- **Anfragekörper**:

  ```json
  {
    "retentionPeriod": "6 months"
  }
  ```

- **Aufbewahrungsdauern**: `"6 months"`, `"1 year"`, `"2 years"`, `"Delete all data"`
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
  - `401`: Unautorisiert - Ungültige Sitzung oder CSRF-Token
  - `400`: Ungültige Aufbewahrungsdauer angegeben
  - `500`: Serverfehler während des Bereinigungsvorgangs mit detaillierter Fehlerinformation
- **Hinweise**: 
  - Der Bereinigungsvorgang ist irreversibel
  - Sicherungsdaten werden dauerhaft aus der Datenbank gelöscht
  - Maschinendatensätze werden beibehalten, auch wenn alle Sicherungen gelöscht werden
  - Wenn "Alle Daten löschen" ausgewählt ist, werden alle Maschinen und Sicherungen entfernt und die Konfiguration zurückgesetzt
  - Erweitertes Fehlerreporting enthält Details und Stack-Trace im Entwicklungsmodus
  - Unterstützt sowohl zeitbasierte Aufbewahrung als auch vollständige Datenlöschung

## Sicherungsauftrag löschen - `/api/backups/delete-job` {/* #delete-backup-job---apibackupsdelete-job */}
- **Endpunkt**: `/api/backups/delete-job`
- **Methode**: DELETE
- **Beschreibung**: Löscht alle Sicherungsdatensätze für eine bestimmte Server-Sicherung-Kombination. Dieser Endpunkt ist nur im Entwicklungsmodus verfügbar.
- **Authentifizierung**: Erfordert eine gültige Sitzung und ein CSRF-Token
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
  - `401`: Unautorisiert - Ungültige Sitzung oder CSRF-Token
  - `403`: Das Löschen von Sicherungsaufträgen ist nur im Entwicklungsmodus verfügbar
  - `400`: Server-ID und Sicherungsname sind erforderlich
  - `404`: Keine Sicherungen zum Löschen gefunden
  - `500`: Serverfehler während des Löschvorgangs mit detaillierter Fehlerinformation
- **Hinweise**: 
  - Diese Operation ist nur im Entwicklungsmodus verfügbar
  - Diese Operation ist irreversibel
  - Alle Sicherungsdatensätze für die angegebene Server-Sicherungskombination werden dauerhaft gelöscht
  - Gibt die Anzahl der gelöschten Sicherungen und Serverinformationen zurück
  - Verwendet den Server-Alias zur Anzeige, falls verfügbar, sonst den Servername

## Synchronisiere Sicherungspläne - `/api/backups/sync-schedule` {/* #sync-backup-schedules---apibackupssync-schedule */}
- **Endpunkt**: `/api/backups/sync-schedule`
- **Methode**: POST
- **Beschreibung**: Synchronisiert die Sicherungsplaninformationen von einem Duplicati-Server. Dieser Endpunkt verbindet sich mit dem Server, ruft die Planinformationen für alle Sicherungen ab und aktualisiert die lokalen Sicherungseinstellungen mit Planinformationen, einschließlich Wiederholungsintervallen, erlaubten Wochentagen und Planzeiten.
- **Authentifizierung**: Erfordert eine gültige Sitzung und ein CSRF-Token
- **Anfragekörper**:

  ```json
  {
    "hostname": "duplicati-server.local",
    "port": 8200,
    "password": "your-password",
    "serverId": "optional-server-id"
  }
  ```

Oder mit serverId nur (verwendet gespeichertes Passwort):

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
  - `400`: Ungültige Anfrageparameter, fehlender Hostname/Passwort, wenn serverId nicht angegeben wurde, oder Verbindungsfehler
  - `404`: Server nicht gefunden (wenn serverId angegeben wurde) oder kein Passwort für den Server gespeichert
  - `500`: Serverfehler während der Plansynchronisierung
- **Hinweise**: 
  - Der Endpunkt erkennt automatisch das optimale Verbindungsprotokoll (HTTPS → HTTPS mit selbstsigniert → HTTP)
  - Kann mit nur serverId aufgerufen werden, um gespeicherte Serveranmeldedaten zu verwenden
  - Kann mit serverId und neuen Anmeldedaten aufgerufen werden, um die Serververbindungsdetails zu aktualisieren
  - Kann mit Hostname/Port/Passwort ohne serverId für neue Server aufgerufen werden
  - Aktualisiert die Sicherungseinstellungen mit Planinformationen, einschließlich:
    - `expectedInterval`: Das Wiederholungsintervall (z. B. "Täglich", "Wöchentlich", "Monatlich")
    - `allowedWeekDays`: Ein Array der erlaubten Wochentage (0=Sonntag, 1=Montag, etc.)
    - `time`: Die geplante Zeit für die Sicherung
  - Verarbeitet alle auf dem Server gefundenen Sicherungen
  - Gibt Statistiken zu den verarbeiteten Sicherungen und allen aufgetretenen Fehlern zurück
  - Protokolliert Audit-Ereignisse für erfolgreiche und fehlgeschlagene Sync-Operationen
  - Verwendet den Standardport 8200, falls nicht angegeben

## Teste Serververbindung - `/api/servers/test-connection` {/* #test-server-connection---apiserverstest-connection */}
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
  - Der Endpunkt überprüft das URL-Format und die Verbindungsfähigkeit
  - Gibt Erfolg zurück, wenn der Server mit einem 401-Status antwortet (erwartet für den Login-Endpunkt ohne Anmeldedaten)
  - Testet die Verbindung zum Login-Endpunkt des Duplicati-Servers
  - Unterstützt sowohl HTTP als auch HTTPS-Protokolle
  - Verwendet die Timeout-Konfiguration für den Verbindungstest

## Hole Server-URL - `/api/servers/:serverId/server-url` {/* #get-server-url---apiserversserveridserver-url */}
- **Endpunkt**: `/api/servers/:serverId/server-url`
- **Methode**: GET
- **Beschreibung**: Ruft die Server-URL für einen bestimmten Server ab.
- **Parameter**:
  - `serverId`: der Server-Identifikator

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
  - Wird für die Server-Verbindungsverwaltung verwendet
  - Gibt eine leere Zeichenfolge zurück, wenn keine Server-URL festgelegt ist

## Server-URL aktualisieren - `/api/servers/:serverId/server-url` {/* #update-server-url---apiserversserveridserver-url */}
- **Endpunkt**: `/api/servers/:serverId/server-url`
- **Methode**: PATCH
- **Beschreibung**: Aktualisiert die Server-URL für einen bestimmten Server.
- **Authentifizierung**: Erfordert eine gültige Sitzung und ein CSRF-Token
- **Parameter**:
  - `serverId`: der Server-Identifikator
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
  - `401`: Unautorisiert - Ungültige Sitzung oder CSRF-Token
  - `400`: Ungültiges URL-Format
  - `404`: Server nicht gefunden
  - `500`: Serverfehler während des Updates
- **Hinweise**: 
  - Der Endpunkt validiert das URL-Format vor dem Aktualisieren
  - Leere oder null Server-URLs sind erlaubt
  - Unterstützt sowohl HTTP- als auch HTTPS-Protokolle
  - Gibt die aktualisierten Serverinformationen zurück

## Server-Passwort abrufen - `/api/servers/:serverId/password` {/* #get-server-password---apiserversserveridpassword */}
- **Endpunkt**: `/api/servers/:serverId/password`
- **Methode**: GET
- **Beschreibung**: Ruft ein CSRF-Token für Server-Passwort-Operationen ab.
- **Authentifizierung**: Erfordert eine gültige Sitzung
- **Parameter**:
  - `serverId`: der Server-Identifikator
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
  - Gibt das CSRF-Token für die Verwendung mit Passwort-Aktualisierungsoperationen zurück
  - Die Sitzung muss gültig sein, um das Token zu generieren

## Server-Passwort aktualisieren - `/api/servers/:serverId/password` {/* #update-server-password---apiserversserveridpassword */}
- **Endpunkt**: `/api/servers/:serverId/password`
- **Methode**: PATCH
- **Beschreibung**: Aktualisiert das Passwort für einen bestimmten Server.
- **Authentifizierung**: Erfordert eine gültige Sitzung und ein CSRF-Token
- **Parameter**:
  - `serverId`: der Server-Identifikator
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
  - `400`: Das Passwort muss eine Zeichenfolge sein
  - `401`: Unautorisiert - Ungültige Sitzung oder CSRF-Token
  - `500`: Passwort konnte nicht aktualisiert werden
- **Hinweise**:
  - Das Passwort kann eine leere Zeichenfolge sein, um das Passwort zu löschen
  - Das Passwort wird sicher mit dem Secrets-Management-System gespeichert

## Benutzerverwaltung {/* #user-management */}

### Benutzer auflisten - `/api/users` {/* #list-users---apiusers */}
- **Endpunkt**: `/api/users`
- **Methode**: GET
- **Beschreibung**: Listet alle Benutzer mit Paginierung und optionaler Suchfilterung auf. Gibt Benutzerinformationen einschließlich Anmeldeverlauf und Konto-Status zurück.
- **Authentifizierung**: Erfordert Admin-Berechtigungen, eine gültige Sitzung und ein CSRF-Token
- **Abfrageparameter**:
  - `page` (optional): Seitenzahl (Standard: 1)
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
  - `401`: Unauthorized - Ungültige Sitzung oder CSRF-Token
  - `403`: Forbidden - Admin-Rechte erforderlich
  - `500`: Interner Serverfehler
- **Hinweise**:
  - Nur für Admin-Benutzer zugänglich
  - Unterstützt Paginierung und Suchfilterung
  - Gibt den Benutzerkonto-Status einschließlich Sperrstatus zurück

### Benutzer erstellen - `/api/users` {/* #create-user---apiusers */}
- **Endpunkt**: `/api/users`
- **Methode**: POST
- **Beschreibung**: Erstellt ein neues Benutzerkonto. Kann ein temporäres Passwort generieren oder ein bereitgestelltes Passwort verwenden.
- **Authentifizierung**: Erfordert Admin-Rechte, gültige Sitzung und CSRF-Token
- **Anfragekörper**:

  ```json
  {
    "username": "newuser",
    "password": "optional-password",
    "isAdmin": false,
    "requirePasswordChange": true
  }
  ```

- `username`: Erforderlich, muss 3-50 Zeichen lang sein und eindeutig sein
  - `password`: Optional, wenn nicht angegeben, wird ein sicheres temporäres Passwort generiert
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

- `temporaryPassword` wird nur eingeschlossen, wenn ein Passwort automatisch generiert wurde
- **Fehlerantworten**:
  - `400`: Ungültiges Benutzernamenformat, Passwortrichtlinienverletzung oder Validierungsfehler
  - `401`: Unauthorized - Ungültige Sitzung oder CSRF-Token
  - `403`: Forbidden - Admin-Rechte erforderlich
  - `409`: Benutzername existiert bereits
  - `500`: Interner Serverfehler
- **Hinweise**:
  - Nur für Admin-Benutzer zugänglich
  - Benutzername ist großschreibungsunabhängig und wird in Kleinbuchstaben gespeichert
  - Wenn kein Passwort bereitgestellt wird, wird ein sicheres 12-stelliges Passwort generiert
  - Generierte temporäre Passwörter werden nur einmal in der Antwort zurückgegeben
  - Die Benutzererstellung wird im Audit-Protokoll protokolliert

### Benutzer aktualisieren - `/api/users/:id` {/* #update-user---apiusersid */}
- **Endpunkt**: `/api/users/:id`
- **Methode**: PATCH
- **Beschreibung**: Aktualisiert Benutzerinformationen einschließlich Benutzername, Admin-Status, Passwortänderungsanforderung und Passwortzurücksetzung.
- **Authentifizierung**: Erfordert Admin-Rechte, gültige Sitzung und CSRF-Token
- **Parameter**:
  - `id`: Benutzer-ID zur Aktualisierung
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
  - `401`: Unauthorized - Ungültige Sitzung oder CSRF-Token
  - `403`: Forbidden - Admin-Rechte erforderlich
  - `404`: Benutzer nicht gefunden
  - `409`: Benutzername existiert bereits (bei Änderung des Benutzernamens)
  - `500`: Interner Serverfehler
- **Hinweise**:
  - Nur für Admin-Benutzer zugänglich
  - Benutzernamenänderungen werden auf Eindeutigkeit überprüft
  - Die Passwortzurücksetzung generiert ein sicheres 12-stelliges temporäres Passwort
  - Alle Änderungen werden im Audit-Protokoll protokolliert

### Benutzer löschen - `/api/users/:id` {/* #delete-user---apiusersid */}
- **Endpunkt**: `/api/users/:id`
- **Methode**: DELETE
- **Beschreibung**: Löscht ein Benutzerkonto. Verhindert das Löschen des eigenen Kontos oder des letzten Admin-Kontos.
- **Authentifizierung**: Erfordert Admin-Rechte, gültige Sitzung und CSRF-Token
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
  - `400`: Eigener Benutzerkonto kann nicht gelöscht werden oder der letzte Administratorbenutzer
  - `401`: Unautorisiert - Ungültige Sitzung oder CSRF-Token
  - `403`: Verboten - Admin-Berechtigungen erforderlich
  - `404`: Benutzer nicht gefunden
  - `500`: Interner Serverfehler
- **Hinweise**:
  - Nur für Administratorbenutzer zugänglich
  - Eigener Benutzerkonto kann nicht gelöscht werden
  - Der letzte Administratorbenutzer kann nicht gelöscht werden (mindestens ein Administrator muss verbleiben)
  - Benutzerlöschungen werden im Prüfprotokoll protokolliert
  - Zugehörige Sitzungen werden automatisch gelöscht (Kaskade)

## Prüfprotokoll-Verwaltung {/* #audit-log-management */}

### Prüfprotokolle auflisten - `/api/audit-log` {/* #list-audit-logs---apiaudit-log */}
- **Endpunkt**: `/api/audit-log`
- **Methode**: GET
- **Beschreibung**: Ruft Prüfprotokolleinträge mit Filter-, Seiten- und Suchfunktionen ab. Unterstützt sowohl seitenbasierte als auch offset-basierte Paginierung.
- **Authentifizierung**: Erfordert gültige Sitzung und CSRF-Token (angemeldeter Benutzer erforderlich)
- **Abfrageparameter**:
  - `page` (optional): Seitenzahl für seitenbasierte Paginierung
  - `offset` (optional): Offset für offset-basierte Paginierung (hat Vorrang vor der Seite)
  - `limit` (optional): Elemente pro Seite (Standard: 50)
  - `startDate` (optional): Filtere Protokolle ab diesem Datum (ISO-Format)
  - `endDate` (optional): Filtere Protokolle bis zu diesem Datum (ISO-Format)
  - `userId` (optional): Filtere nach Benutzer-ID
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
  - `401`: Unautorisiert - Ungültige Sitzung oder CSRF-Token
  - `500`: Interner Serverfehler
- **Hinweise**:
  - Unterstützt sowohl seitenbasierte (`page`) als auch offset-basierte (`offset`) Paginierung
  - Das `details`-Feld enthält geparstes JSON mit zusätzlichem Kontext
  - Alle Prüfprotokollabfragen werden protokolliert

### Prüfprotokoll-Filterwerte abrufen - `/api/audit-log/filters` {/* #get-audit-log-filter-values---apiaudit-logfilters */}
- **Endpunkt**: `/api/audit-log/filters`
- **Methode**: GET
- **Beschreibung**: Ruft eindeutige Filterwerte ab, die für die Filterung von Prüfprotokollen verfügbar sind. Gibt alle unterschiedlichen Aktionen, Kategorien und Status zurück, die in der Prüfprotokolldatenbank vorhanden sind. Nützlich für die Befüllung von Filter-Dropdowns in der Benutzeroberfläche.
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
  - `401`: Unautorisiert - Ungültige Sitzung oder CSRF-Token
  - `500`: Interner Serverfehler
- **Hinweise**:
  - Gibt Arrays mit eindeutigen Werten aus der Prüfprotokolldatenbank zurück
  - Werte sind alphabetisch sortiert
  - Leere Arrays werden zurückgegeben, wenn keine Daten vorhanden sind oder bei einem Fehler
  - Wird vom Prüfprotokoll-Viewer verwendet, um Filter-Dropdowns dynamisch zu befüllen

### Prüfprotokolle herunterladen - `/api/audit-log/download` {/* #download-audit-logs---apiaudit-logdownload */}
- **Endpunkt**: `/api/audit-log/download`
- **Methode**: GET
- **Beschreibung**: Lädt Prüfprotokolle im CSV- oder JSON-Format mit optionaler Filterung herunter. Nützlich für externe Analyse und Berichterstattung.
- **Authentifizierung**: Erfordert gültige Sitzung und CSRF-Token (angemeldeter Benutzer erforderlich)
- **Abfrageparameter**:
  - `format` (optional): Exportformat - `csv` oder `json` (Standard: `csv`)
  - `startDate` (optional): Filtere Protokolle ab diesem Datum (ISO-Format)
  - `endDate` (optional): Filtere Protokolle bis zu diesem Datum (ISO-Format)
  - `userId` (optional): Filtere nach Benutzer-ID
  - `username` (optional): Nach Benutzername filtern
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
  - JSON-Array mit Audit-Protokolleinträgen
- **Fehlerantworten**:
  - `400`: Keine Protokolle zum Exportieren vorhanden
  - `401`: Unautorisiert - Ungültige Sitzung oder CSRF-Token
  - `500`: Interner Serverfehler
- **Hinweise**:
  - Exportlimit ist 10.000 Datensätze
  - CSV-Format escapet Sonderzeichen korrekt
  - Details-Feld in CSV ist JSON-stringifiziert
  - Dateiname enthält das aktuelle Datum

### Audit-Protokolle bereinigen - `/api/audit-log/cleanup` {/* #cleanup-audit-logs---apiaudit-logcleanup */}
- **Endpunkt**: `/api/audit-log/cleanup`
- **Methode**: POST
- **Beschreibung**: Löst manuell die Bereinigung alter Audit-Protokolle basierend auf der Aufbewahrungsdauer aus. Unterstützt Dry-Run-Modus zur Vorschau, was gelöscht werden würde.
- **Authentifizierung**: Erfordert Admin-Rechte, gültige Sitzung und CSRF-Token
- **Anfragekörper**:

  ```json
  {
    "retentionDays": 90,
    "dryRun": false
  }
  ```

- `retentionDays` (optional): Überschreibt Aufbewahrungstage (30-365), andernfalls wird der konfigurierte Wert verwendet
  - `dryRun` (optional): Wenn wahr, gibt nur zurück, was gelöscht werden würde, ohne tatsächlich zu löschen
- **Antwort** (Dry-Run):

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
  - `400`: Ungültige Aufbewahrungstage (müssen zwischen 30 und 365 liegen)
  - `401`: Unautorisiert - Ungültige Sitzung oder CSRF-Token
  - `403`: Verboten - Admin-Rechte erforderlich
  - `500`: Interner Serverfehler
- **Hinweise**:
  - Nur für Admin-Benutzer zugänglich
  - Standard-Aufbewahrung ist 90 Tage, falls nicht konfiguriert
  - Bereinigungsvorgang wird im Audit-Protokoll protokolliert
  - Dry-Run-Modus ist nützlich zur Vorschau des Bereinigungseffekts

### Audit-Protokoll-Aufbewahrung abrufen - `/api/audit-log/retention` {/* #get-audit-log-retention---apiaudit-logretention */}
- **Endpunkt**: `/api/audit-log/retention`
- **Methode**: GET
- **Beschreibung**: Ruft die aktuelle Audit-Protokoll-Aufbewahrungskonfiguration in Tagen ab.
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
  - Standard-Aufbewahrung ist 90 Tage, falls nicht konfiguriert
  - Kann ohne Authentifizierung aufgerufen werden (nur Lesen)

### Audit-Protokoll-Aufbewahrung aktualisieren - `/api/audit-log/retention` {/* #update-audit-log-retention---apiaudit-logretention */}
- **Endpunkt**: `/api/audit-log/retention`
- **Methode**: PATCH
- **Beschreibung**: Aktualisiert die Aufbewahrungsdauer für Audit-Protokolle in Tagen. Diese Einstellung bestimmt, wie lange Audit-Protokolle behalten werden, bevor sie automatisch bereinigt werden.
- **Authentifizierung**: Erfordert Admin-Rechte, gültige Sitzung und CSRF-Token
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
  - `400`: Ungültige Aufbewahrungstage (müssen zwischen 30 und 365 liegen)
  - `401`: Unautorisiert - Ungültige Sitzung oder CSRF-Token
  - `403`: Verboten - Admin-Rechte erforderlich
  - `500`: Interner Serverfehler
- **Hinweise**:
  - Nur für Admin-Benutzer zugänglich
  - Konfigurationsänderung wird im Audit-Protokoll protokolliert
  - Aufbewahrungsdauer beeinflusst automatische und manuelle Bereinigungsvorgänge

## API-Schlüssel {/* #api-keys */}

### API-Schlüssel auflisten - `/api/api-keys` {/* #list-api-keys---apiapi-keys */}
- **Endpunkt**: `/api/api-keys`
- **Methode**: GET
- **Beschreibung**: Listet alle API-Schlüssel auf. Geheimnisse werden nie zurückgegeben; jeder Schlüssel enthält einen Fingerabdruck (`Qk7v…3xTa`).
- **Authentifizierung**: Erfordert Admin-Rechte, gültige Sitzung und CSRF-Token
- **Fehlerantworten**:
  - `401`: Unautorisiert - Ungültige Sitzung oder CSRF-Token
  - `403`: Verboten - Admin-Rechte erforderlich
  - `500`: Interner Serverfehler

### API-Schlüssel erstellen - `/api/api-keys` {/* #create-api-key---apiapi-keys */}
- **Endpunkt**: `/api/api-keys`
- **Methode**: POST
- **Beschreibung**: Erstellt einen bereichsspezifischen API-Schlüssel. Das Klartext-Geheimnis wird nur in dieser Antwort zurückgegeben.
- **Authentifizierung**: Erfordert Admin-Rechte, gültige Sitzung und CSRF-Token
- **Anfragekörper**:

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
  - `401`: Unautorisiert - Ungültige Sitzung oder CSRF-Token
  - `403`: Verboten - Admin-Rechte erforderlich
  - `500`: Interner Serverfehler

### API-Schlüssel aktualisieren - `/api/api-keys/:id` {/* #update-api-key---apiapi-keysid */}
- **Endpunkt**: `/api/api-keys/:id`
- **Methode**: PATCH
- **Beschreibung**: Aktiviert oder deaktiviert einen Schlüssel.
- **Authentifizierung**: Erfordert Admin-Rechte, gültige Sitzung und CSRF-Token

### API-Schlüssel löschen - `/api/api-keys/:id` {/* #delete-api-key---apiapi-keysid */}
- **Endpunkt**: `/api/api-keys/:id`
- **Methode**: DELETE
- **Beschreibung**: Löscht einen Schlüssel. Existierende Clients, die das Geheimnis verwenden, verlieren sofort den Zugriff.
- **Authentifizierung**: Erfordert Admin-Rechte, gültige Sitzung und CSRF-Token

## Datenbankverwaltung {/* #database-management */}

### Datenbank sichern - `/api/database/backup` {/* #backup-database---apidatabasebackup */}
- **Endpunkt**: `/api/database/backup`
- **Methode**: GET
- **Beschreibung**: Erstellt eine Sicherung der Datenbank im binären (.db) oder SQL (.sql) Format. Die Sicherungsdatei wird automatisch mit einem Zeitstempel im Dateinamen heruntergeladen.
- **Authentifizierung**: Erfordert Admin-Rechte, gültige Sitzung und CSRF-Token
- **Abfrageparameter**:
  - `format` (optional): Sicherungsformat - `db` (binär) oder `sql` (SQL-Dump). Standard: `db`
- **Antwort**:
  - Content-Type: `application/octet-stream` (für .db) oder `text/plain` (für .sql)
  - Content-Disposition: `attachment; filename="duplistatus-backup-YYYY-MM-DDTHH-MM-SS.db"` oder `.sql`
  - Binärer Dateiinhalt (für .db) oder SQL-Textinhalt (für .sql)
- **Fehlerantworten**:
  - `400`: Ungültiges Format (muss "db" oder "sql" sein)
  - `401`: Unautorisiert - Ungültige Sitzung oder CSRF-Token
  - `403`: Verboten - Admin-Rechte erforderlich
  - `500`: Fehler beim Erstellen der Datenbanksicherung
- **Hinweise**:
  - Nur für Admin-Benutzer zugänglich
  - Binäres Format verwendet die Sicherungsmethode von SQLite für Integrität
  - SQL-Format erstellt einen Text-Dump aller Datenbankinhalte
  - Zeitstempel im Dateinamen verwendet die lokale Zeitzone des Servers
  - Sicherungsvorgang wird im Audit-Protokoll protokolliert
  - Temporäre Dateien werden automatisch nach dem Download bereinigt

### Datenbank wiederherstellen - `/api/database/restore` {/* #restore-database---apidatabaserestore */}
- **Endpunkt**: `/api/database/restore`
- **Methode**: POST
- **Beschreibung**: Stellt die Datenbank aus einer Sicherungsdatei (.db oder .sql Format) wieder her. Erstellt eine Sicherheitskopie vor der Wiederherstellung und löscht alle Sitzungen nach der Wiederherstellung aus Sicherheitsgründen.
- **Authentifizierung**: Erfordert Admin-Rechte, gültige Sitzung und CSRF-Token
- **Anfragekörper**: FormData mit einem Dateifeld namens `database`
  - Die Datei muss entweder im Format `.db`, `.sqlite`, `.sqlite3` (binär) oder `.sql` (SQL) vorliegen
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
  - `400`: Keine Datei angegeben, Dateigröße überschreitet das Limit, ungültiges Dateiformat oder Datenbankintegritätsprüfung fehlgeschlagen
  - `401`: Unautorisiert - Ungültige Sitzung oder CSRF-Token
  - `403`: Verboten - Admin-Rechte erforderlich
  - `500`: Wiederherstellung der Datenbank fehlgeschlagen (Originaldatenbank wurde aus der Sicherheitskopie wiederhergestellt, falls die Wiederherstellung fehlschlägt)
- **Hinweise**:
  - Nur für Admin-Benutzer zugänglich
  - Erstellt automatisch eine Sicherheitskopie vor der Wiederherstellung
  - Unterstützt sowohl binäre (.db) als auch SQL (.sql) Formate
  - Prüft die Datenbankintegrität nach der Wiederherstellung
  - Falls die Wiederherstellung fehlschlägt, wird automatisch aus der Sicherheitskopie wiederhergestellt
  - Alle Sitzungen werden nach erfolgreicher Wiederherstellung für Sicherheitsgründe gelöscht
  - Gibt `requiresReauth: true` zurück, um anzuzeigen, dass der Benutzer sich erneut anmelden muss
  - Der Wiederherstellungsvorgang wird im Audit-Protokoll protokolliert
  - Bei SQL-Format wird der SQL-Inhalt vor der Ausführung validiert
  - Die Datenbankverbindung wird nach der Wiederherstellung neu initialisiert
  - Alle Caches werden nach der Wiederherstellung ungültig gemacht

## Sicherungszeitstempel {/* #backup-timestamps */}

### Letzte Sicherungszeitstempel abrufen - `/api/backups/last-timestamps` {/* #get-last-backup-timestamps---apibackupslast-timestamps */}
- **Endpunkt**: `/api/backups/last-timestamps`
- **Methode**: GET
- **Beschreibung**: Ruft den letzten Sicherungszeitstempel für jede Server-Sicherungskombination ab. Gibt eine Karte für einen einfachen Lookup zurück.
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
  - `401`: Unautorisiert - Ungültige Sitzung oder CSRF-Token
  - `500`: Abrufen der letzten Sicherungszeitstempel fehlgeschlagen
- **Hinweise**:
  - Gibt sowohl eine Karte (für einen einfachen Lookup nach `server_id:backup_name`) als auch das Roharray-Format zurück
  - Enthält Cache-Steuerungsheader, um das Caching zu verhindern
  - Nützlich für das Nachverfolgen der letzten Sicherungszeiten für alle Server-Sicherungskombinationen
  - Zeitstempel sind im ISO-Format

## Anwendungsprotokolleverwaltung {/* #application-logs-management */}

### Anwendungsprotokolle abrufen - `/api/application-logs` {/* #get-application-logs---apiapplication-logs */}
- **Endpunkt**: `/api/application-logs`
- **Methode**: GET
- **Beschreibung**: Ruft Einträge aus den Anwendungsprotokollen aus Protokolldateien ab. Unterstützt das Lesen von aktuellen und rotierten Protokolldateien mit Tail-Funktionalität.
- **Authentifizierung**: Erfordert Admin-Rechte, gültige Sitzung und CSRF-Token
- **Abfrageparameter**:
  - `file` (optional): Name der zu lesenden Protokolldatei - `application.log`, `application.log.1`, `application.log.2`, etc. Wenn nicht angegeben, wird eine Liste der verfügbaren Dateien zurückgegeben
  - `tail` (optional): Anzahl der Zeilen, die vom Ende der Datei zurückgegeben werden sollen (Standard: 1000, Min: 1, Max: 10000)
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
  - `400`: Ungültiger Tail-Parameter (muss 1-10000 sein) oder ungültiges Dateiformat
  - `401`: Unautorisiert - Ungültige Sitzung oder CSRF-Token
  - `403`: Verboten - Admin-Rechte erforderlich
  - `404`: Protokolldatei nicht gefunden
  - `500`: Lesen der Protokolldatei fehlgeschlagen
- **Hinweise**:
  - Nur für Admin-Benutzer zugänglich
  - Unterstützt das Lesen der aktuellen Protokolldatei und rotierten Protokolldateien (bis zu 10 rotierte Dateien)
  - Gibt die letzten N Zeilen (Tail) aus der angegebenen Protokolldatei zurück
  - Der Name der Protokolldatei wird durch eine Umgebungsvariable bestimmt (Standard: `application.log`)
  - Gibt eine Liste der verfügbaren Protokolldateien zurück, wenn der Dateiparameter nicht angegeben ist
  - Dateinamen werden validiert, um Directory-Traversal-Angriffe zu verhindern
  - Rotierte Dateien werden sequenziell nummeriert (`.1`, `.2`, etc.)

### Anwendungsprotokolle exportieren - `/api/application-logs/export` {/* #export-application-logs---apiapplication-logsexport */}
- **Endpunkt**: `/api/application-logs/export`
- **Methode**: GET
- **Beschreibung**: Exportiert Anwendungsprotokolleinträge im gefilterten Textformat. Unterstützt Filterung nach Protokollebene und Suchzeichenfolge.
- **Authentifizierung**: Erfordert Admin-Berechtigungen, gültige Sitzung und CSRF-Token
- **Abfrageparameter**:
  - `file` (erforderlich): Zu exportierende Protokolldatei - `application.log`, `application.log.1`, `application.log.2`, etc.
  - `logLevels` (optional): Kommagetrennte Liste der einzubeziehenden Protokollebene - `INFO`, `WARN`, `ERROR` (Standard: `INFO,WARN,ERROR`)
  - `search` (optional): Suchzeichenfolge zur Filterung der Protokollzeilen (Groß-/Kleinschreibung unbeachtet)
- **Antwort**:
  - Content-Type: `text/plain`
  - Content-Disposition: `attachment; filename="duplistatus-logs-YYYY-MM-DDTHH-MM-SS.txt"`
  - Gefilterter Protokollinhalt als Klartext
- **Fehlerantworten**:
  - `400`: Dateiparameter ist erforderlich oder hat ein ungültiges Format
  - `401`: Unautorisiert - Ungültige Sitzung oder CSRF-Token
  - `403`: Verboten - Admin-Berechtigungen erforderlich
  - `500`: Protokolle konnten nicht exportiert werden
- **Hinweise**:
  - Nur für Admin-Benutzer zugänglich
  - Exportiert gefilterte Protokolleinträge basierend auf Protokollebene und Suchkriterien
  - Unterstützt Filterung nach Protokollebene: `INFO`, `WARN`, `ERROR`
  - Suchzeichenfolgenfilterung ist groß-/kleinschreibungsunabhängig
  - Leere Zeilen werden automatisch gefiltert
  - Der Name der Protokolldatei wird durch eine Umgebungsvariable bestimmt (Standard: `application.log`)
  - Dateinamen werden validiert, um Directory-Traversal-Angriffe zu verhindern
  - Die exportierte Datei enthält einen Zeitstempel im Dateinamen
  - Nützlich für externe Analyse und Fehlerbehebung
