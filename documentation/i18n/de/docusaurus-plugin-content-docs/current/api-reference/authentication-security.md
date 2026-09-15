# Authentifizierung & Sicherheit {/* #authentication--security */}

Die API verwendet eine Kombination aus sessionbasierter Authentifizierung und CSRF-Schutz für alle Datenbank-Schreiboperationen, um unbefugten Zugriff und potenzielle Denial-of-Service-Angriffe zu verhindern. Externe APIs, die von Duplicati und Homepage verwendet werden, bleiben CSRF-frei. Sie können optional einen bereichsspezifischen API-Schlüssel und/oder eine IP-Zulassungsliste erfordern (beide standardmäßig aus). `/api/upload` verfügt auch über eine konfigurierbare Begrenzung der Anforderungskörpergröße und eine Rate-Limitierung.

## Sessionbasierte Authentifizierung {/* #session-based-authentication */}

Geschützte Endpunkte erfordern ein gültiges Session-Cookie und einen CSRF-Token. Das Session-System bietet sichere Authentifizierung für alle geschützten Operationen.

### Sessionverwaltung {/* #session-management */}
1. **Session erstellen**: POST an `/api/session`, um eine neue Session zu erstellen
2. **CSRF-Token abrufen**: GET `/api/csrf`, um einen CSRF-Token für die Session zu erhalten
3. **In Anfragen einbeziehen**: Senden Sie das Session-Cookie und den CSRF-Token mit geschützten Anfragen
4. **Session validieren**: GET `/api/session`, um zu überprüfen, ob die Session noch gültig ist
5. **Session löschen**: DELETE `/api/session`, um sich abzumelden und die Session zu löschen

### CSRF-Schutz {/* #csrf-protection */}
Alle statusändernden Operationen erfordern einen gültigen CSRF-Token, der mit der aktuellen Session übereinstimmt. Der CSRF-Token muss im `X-CSRF-Token`-Header für geschützte Endpunkte enthalten sein.

### Geschützte Endpunkte {/* #protected-endpoints */}
Alle Endpunkte, die Datenbankdaten ändern, erfordern Session-Authentifizierung und einen CSRF-Token:

- **Serververwaltung**: `/api/servers/:id` (PATCH, DELETE), `/api/servers/:id/server-url` (PATCH), `/api/servers/:id/password` (PATCH, GET)
- **Konfigurationsverwaltung**: `/api/configuration/email` (GET, POST, DELETE), `/api/configuration/unified` (GET), `/api/configuration/ntfy` (GET), `/api/configuration/notifications` (GET, POST), `/api/configuration/backup-settings` (POST), `/api/configuration/templates` (POST), `/api/configuration/overdue-tolerance` (GET, POST), `/api/configuration/daily-summary` (GET, POST), `/api/configuration/daily-summary/send` (POST), `/api/configuration/daily-summary/retry` (POST), `/api/configuration/daily-summary/preview` (POST)
- **Benachrichtigungssystem**: `/api/notifications/test` (POST), `/api/notifications/preview` (POST)
- **Cron-Konfiguration**: `/api/cron-config` (GET, POST)
- **Cron-Proxy**: `/api/cron/*` (GET, POST) - leitet Anfragen an den Cron-Dienst weiter. POST erfordert einen Administrator. Der Cron-Prozess bindet standardmäßig an `127.0.0.1`; mutierende Cron-Dienst-Routen erfordern `X-Cron-Service-Secret`, wenn `CRON_SERVICE_SECRET` gesetzt ist.
- **Sessionverwaltung**: `/api/session` (POST, GET, DELETE), `/api/csrf` (GET)
- **Chart-Daten**: `/api/chart-data/*` (GET)
- **Dashboard**: `/api/dashboard` (GET)
- **Serverdetails**: `/api/servers` (GET), `/api/servers/:id` (GET), `/api/detail/:serverId` (GET)
- **Audit-Protokoll**: `/api/audit-log` (GET), `/api/audit-log/download` (GET), `/api/audit-log/filters` (GET), `/api/audit-log/retention` (PATCH), `/api/audit-log/cleanup` (POST) - Admin erforderlich für Schreiboperationen
- **Benutzerverwaltung**: `/api/users` (GET, POST, PATCH, DELETE) - Admin erforderlich
- **Datenbankverwaltung**: `/api/database/backup` (GET), `/api/database/restore` (POST) - Admin erforderlich
- **Anwendungsprotokolle**: `/api/application-logs` (GET), `/api/application-logs/export` (GET) - Admin erforderlich
- **Backup-Sammlung**: `/api/backups/collect` (POST) - erfordert Session und CSRF-Token
- **Backup-Zeitplan-Synchronisierung**: `/api/backups/sync-schedule` (POST) - erfordert Session und CSRF-Token
- **Überfällig-Prüfung**: `/api/notifications/check-overdue` (POST) - erfordert Session und CSRF-Token
- **Überfällige Zeitstempel löschen**: `/api/notifications/clear-overdue-timestamps` (POST) - erfordert Session und CSRF-Token

### Externe Endpunkte {/* #external-endpoints */}
Diese Routen verwenden keine Session-Cookies oder CSRF. Die Authentifizierung ist optional und in den Einstellungen konfigurierbar:

- `/api/upload` - Backup-Daten-Hochladen von Duplicati (Upload-Bereich-Schlüssel, Größen- und Rate-Limits)
- `/api/lastbackup/:serverId` - Aktueller Backup-Status (Lesen-Bereich-Schlüssel)
- `/api/lastbackups/:serverId` - Aktuelle Backups-Status (Lesen-Bereich-Schlüssel)
- `/api/summary` - Zusammenfassungsdaten (Lesen-Bereich-Schlüssel)
- `/api/health` - Health-Check-Endpunkt (kein Schlüssel erforderlich; günstige SQLite-Abfrage; IP-basierte Rate-Limitierung)
- `/api/ping` - Connectivity-Probe (kein Schlüssel erforderlich; IP-basierte Rate-Limitierung)

Wenn **API-Schlüssel erfordern** aus ist, akzeptieren die ersten vier Routen Anfragen mit oder ohne Schlüssel: ein gültiger passender Schlüssel wird aufgezeichnet; ein ungültiger Schlüssel wird ignoriert. Wenn der Schalter eingeschaltet ist, geben sie `401` ohne gültigen Schlüssel zurück und `403`, wenn der Schlüsselbereich nicht übereinstimmt. `/api/health` und `/api/ping` verwenden niemals Schlüssel. Siehe [API-Schlüssel](../user-guide/settings/api-keys-settings.md) und [IP-Zulassungsliste](../user-guide/settings/ip-allowlist-settings.md).

### Nutzungsbeispiel (Session + CSRF) {/* #usage-example-session--csrf */}

```typescript
// 1. Create session
const sessionResponse = await fetch('/api/session', { method: 'POST' });
const { sessionId } = await sessionResponse.json();

// 2. Get CSRF token
const csrfResponse = await fetch('/api/csrf', {
  headers: { 'Cookie': `session=${sessionId}` }
});
const { csrfToken } = await csrfResponse.json();

// 3. Make protected request
const response = await fetch('/api/servers/server-id', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken,
    'Cookie': `session=${sessionId}`
  },
  body: JSON.stringify({
    alias: 'Updated Server Name',
    note: 'Updated notes'
  })
});
```

## Authentifizierungsendpunkte {/* #authentication-endpoints */}

### Anmeldung - `/api/auth/login` {/* #login---apiauthlogin */}
- **Endpunkt**: `/api/auth/login`
- **Methode**: POST
- **Beschreibung**: Authentifiziert einen Benutzer und erstellt eine Sitzung. Unterstützt Sperrung des Kontos nach fehlgeschlagenen Versuchen und Anforderungen zur Passwortänderung.
- **Authentifizierung**: Erfordert eine gültige Sitzung und CSRF-Token (aber keinen angemeldeten Benutzer)
- **Anfragekörper**:

  ```json
  {
    "username": "admin",
    "password": "password123"
  }
  ```

- **Antwort** (Erfolg):

  ```json
  {
    "success": true,
    "user": {
      "id": "user-id",
      "username": "admin",
      "isAdmin": true,
      "mustChangePassword": false
    },
    "keyChanged": false
  }
  ```

- **Fehlerantworten**: Alle Fehlerantworten enthalten `error` (Englische Nachricht) und `errorCode` (stabile Code für die Übersetzung auf der Client-Seite).
  - `400`: Fehlender Benutzername oder Passwort — `errorCode: "REQUIRED_CREDENTIALS"`
  - `401`: Ungültiger Benutzername oder Passwort — `errorCode: "INVALID_CREDENTIALS"`
  - `403`: Konto gesperrt aufgrund zu vieler fehlgeschlagener Anmeldeversuche — `errorCode: "ACCOUNT_LOCKED"` (enthält `lockedUntil`, `minutesRemaining`)
  - `500`: Interner Serverfehler — `errorCode: "INTERNAL_ERROR"`
  - `503`: Datenbank nicht bereit — `errorCode: "DATABASE_NOT_READY"`
- **Hinweise**:
  - Konto wird nach 5 fehlgeschlagenen Anmeldeversuchen für 15 Minuten gesperrt
  - Fehlgeschlagene Anmeldeversuche werden verfolgt und protokolliert
  - Sitzungscookie wird automatisch in der Antwort gesetzt
  - Wenn der Benutzer die `mustChangePassword`-Flagge gesetzt hat, sollte er zur Seite zum Ändern des Passworts weitergeleitet werden
  - Alle Anmeldeversuche (erfolgreich und fehlgeschlagen) werden im Audit-Protokoll protokolliert

### Abmeldung - `/api/auth/logout` {/* #logout---apiauthlogout */}
- **Endpunkt**: `/api/auth/logout`
- **Methode**: POST
- **Beschreibung**: Meldet den aktuellen Benutzer ab und zerstört seine Sitzung.
- **Authentifizierung**: Erfordert eine gültige Sitzung und CSRF-Token
- **Antwort** (Erfolg):

  ```json
  {
    "success": true,
    "message": "Logged out successfully",
    "successCode": "LOGGED_OUT"
  }
  ```

- **Fehlerantworten**: Enthalten `error` und `errorCode` für die Übersetzung auf der Client-Seite.
  - `400`: Keine aktive Sitzung — `errorCode: "NO_ACTIVE_SESSION"`
  - `500`: Interner Serverfehler — `errorCode: "INTERNAL_ERROR"`
- **Hinweise**:
  - Sitzungscookie wird in der Antwort gelöscht
  - Abmeldung wird im Audit-Protokoll protokolliert
  - Sitzung wird sofort ungültig gemacht

### Aktuellen Benutzer abrufen - `/api/auth/me` {/* #get-current-user---apiauthme */}
- **Endpunkt**: `/api/auth/me`
- **Methode**: GET
- **Beschreibung**: Gibt die Informationen des aktuellen authentifizierten Benutzers zurück oder zeigt an, wenn kein Benutzer angemeldet ist.
- **Authentifizierung**: Erfordert eine gültige Sitzung (aber keinen angemeldeten Benutzer)
- **Antwort** (authentifiziert):

  ```json
  {
    "authenticated": true,
    "user": {
      "id": "user-id",
      "username": "admin",
      "isAdmin": true,
      "mustChangePassword": false
    }
  }
  ```

- **Antwort** (nicht authentifiziert):

  ```json
  {
    "authenticated": false,
    "user": null
  }
  ```

- **Fehlerantworten**: Enthalten `error` und `errorCode` für die Übersetzung auf der Client-Seite.
  - `500`: Interner Serverfehler — `errorCode: "INTERNAL_ERROR"`
- **Hinweise**:
  - Kann ohne angemeldeten Benutzer aufgerufen werden (gibt `authenticated: false` zurück)
  - Nützlich zum Überprüfen des Authentifizierungsstatus beim Laden der Seite

### Passwort ändern - `/api/auth/change-password` {/* #change-password---apiauthchange-password */}
- **Endpunkt**: `/api/auth/change-password`
- **Methode**: POST
- **Beschreibung**: Ändert das Passwort des aktuellen authentifizierten Benutzers. Wenn `mustChangePassword` gesetzt ist, wird die Überprüfung des aktuellen Passworts übersprungen.
- **Authentifizierung**: Erfordert eine gültige Sitzung und CSRF-Token (angemeldeter Benutzer erforderlich)
- **Anfragekörper**:

  ```json
  {
    "currentPassword": "old-password",
    "newPassword": "new-secure-password"
  }
  ```

- `currentPassword`: Optional, wenn `mustChangePassword` wahr ist, sonst erforderlich
  - `newPassword`: Erforderlich, muss die Passwortrichtlinien erfüllen
- **Antwort** (Erfolg):

  ```json
  {
    "success": true,
    "message": "Password changed successfully",
    "successCode": "PASSWORD_CHANGED"
  }
  ```

- **Fehlerantworten**: Enthalten `error` und `errorCode` für die Übersetzung auf der Client-Seite. Eine Richtlinienverletzung kann `validationErrors` (Array von Zeichenketten) enthalten.
  - `400`: Fehlendes neues Passwort — `errorCode: "NEW_PASSWORD_REQUIRED"`
  - `400`: Passwortrichtlinienverletzung — `errorCode: "POLICY_NOT_MET"` (kann `validationErrors` enthalten)
  - `400`: Neues Passwort ist gleich dem aktuellen — `errorCode: "NEW_PASSWORD_SAME_AS_CURRENT"`
  - `401`: Aktuelles Passwort ist falsch — `errorCode: "CURRENT_PASSWORD_INCORRECT"`
  - `404`: Benutzer nicht gefunden — `errorCode: "USER_NOT_FOUND"`
  - `500`: Interner Serverfehler — `errorCode: "INTERNAL_ERROR"`
- **Hinweise**:
  - Neues Passwort muss die Anforderungen der Passwortrichtlinie erfüllen (Länge, Komplexität, etc.)
  - Wenn die `mustChangePassword`-Flagge gesetzt ist, wird die Überprüfung des aktuellen Passworts übersprungen
  - Nach erfolgreicher Passwortänderung wird die `mustChangePassword`-Flagge gelöscht
  - Passwortänderungen werden im Audit-Protokoll protokolliert
  - Neues Passwort muss sich vom aktuellen Passwort unterscheiden

### Prüfen, ob Administrator-Benutzer Passwort ändern muss - `/api/auth/admin-must-change-password` {/* #check-admin-must-change-password---apiauthadmin-must-change-password */}
- **Endpunkt**: `/api/auth/admin-must-change-password`
- **Methode**: GET
- **Beschreibung**: Prüft, ob der Administrator-Benutzer sein Passwort ändern muss. Dieser Endpunkt ist öffentlich (keine Authentifizierung erforderlich), da er nur eine boolesche Flagge zurückgibt.
- **Antwort**:

  ```json
  {
    "mustChangePassword": false
  }
  ```

- **Fehlerantworten**:
  - `500`: Interner Serverfehler (gibt `mustChangePassword: false` bei einem Fehler zurück, um keine Tipp anzuzeigen, falls es ein Datenbankproblem gibt)
- **Hinweise**:
  - Öffentlicher Endpunkt, keine Authentifizierung erforderlich
  - Gibt `false` zurück, wenn der Administrator-Benutzer nicht existiert
  - Wird verwendet, um zu bestimmen, ob ein Tipp zur Passwortänderung angezeigt werden soll
  - Bei einem Fehler wird `false` zurückgegeben, um keine Tipp anzuzeigen, falls es ein Datenbankproblem gibt

### Passwortrichtlinie abrufen - `/api/auth/password-policy` {/* #get-password-policy---apiauthpassword-policy */}
- **Endpunkt**: `/api/auth/password-policy`
- **Methode**: GET
- **Beschreibung**: Gibt die aktuelle Passwortrichtlinienkonfiguration zurück. Dieser Endpunkt ist öffentlich (keine Authentifizierung erforderlich), da er für die Frontend-Validierung benötigt wird.
- **Antwort**:

  ```json
  {
    "minLength": 8,
    "requireUppercase": true,
    "requireLowercase": true,
    "requireNumbers": true,
    "requireSpecialChars": false
  }
  ```

- **Fehlerantworten**: Beinhalten `error` und `errorCode` für die clientseitige Übersetzung.
  - `500`: Passwortrichtlinie konnte nicht abgerufen werden — `errorCode: "POLICY_RETRIEVE_FAILED"`
- **Hinweise**:
  - Öffentlicher Endpunkt, keine Authentifizierung erforderlich
  - Wird von Frontend-Komponenten verwendet, um die Passwortanforderungen anzuzeigen und Passwörter vor der Übermittlung zu validieren
  - Richtlinie wird über Umgebungsvariablen konfiguriert (`PWD_ENFORCE`, `PWD_MIN_LEN`)
  - Standard-Passwortprüfung (Verhinderung der Verwendung des Standard-Administrator-Passworts) wird unabhängig von den Richtlinieneinstellungen immer erzwungen

### Authentifizierungs-API-Fehler- und Erfolgs-Codes (i18n) {/* #auth-api-error-and-success-codes-i18n */}

Authentifizierungs-Endpunkte geben einen stabilen `errorCode` (und bei Erfolg `successCode`) sowie das menschlich lesbare `error`- oder `message`-Feld zurück. Die `error`- und `message`-Werte sind auf Englisch. Clients sollten die Codes verwenden, um lokalisierte Zeichenfolgen nachzuschlagen, damit die Benutzeroberfläche die Nachrichten in der vom Benutzer ausgewählten Sprache anzeigt.

| Endpunkt | Erfolgs-Code | Fehler-Codes |
|----------|--------------|-------------|
| `/api/auth/login` | — | `REQUIRED_CREDENTIALS`, `INVALID_CREDENTIALS`, `ACCOUNT_LOCKED`, `DATABASE_NOT_READY`, `INTERNAL_ERROR` |
| `/api/auth/logout` | `LOGGED_OUT` | `NO_ACTIVE_SESSION`, `INTERNAL_ERROR` |
| `/api/auth/me` | — | `INTERNAL_ERROR` |
| `/api/auth/change-password` | `PASSWORD_CHANGED` | `NEW_PASSWORD_REQUIRED`, `POLICY_NOT_MET`, `USER_NOT_FOUND`, `CURRENT_PASSWORD_INCORRECT`, `NEW_PASSWORD_SAME_AS_CURRENT`, `INTERNAL_ERROR` |
| `/api/auth/password-policy` | — | `POLICY_RETRIEVE_FAILED` |

### Fehlerantworten {/* #error-responses */}
- `401 Unauthorized`: Ungültige oder fehlende Sitzung, abgelaufene Sitzung oder CSRF-Token-Validierung fehlgeschlagen
- `403 Forbidden`: CSRF-Token-Validierung fehlgeschlagen oder Vorgang nicht erlaubt

:::caution
 Stellen Sie den **duplistatus**-Server nicht ins öffentliche Internet. Verwenden Sie ihn in einem sicheren Netzwerk 
(z. B. einem lokalen LAN, das durch eine Firewall geschützt ist).

Die Offenlegung der **duplistatus**-Schnittstelle im öffentlichen Internet ohne angemessene Sicherheitsmaßnahmen könnte zu unbefugtem Zugriff führen.
:::
