---
translation_last_updated: '2026-05-06T23:19:28.136Z'
source_file_mtime: '2026-05-06T23:18:51.410Z'
source_file_hash: 66a1b7eaf428ec3f6c61417ebd66dea5bc97cfbf726189d73e18416a1b92be0c
translation_language: de
source_file_path: documentation/docs/api-reference/authentication-security.md
translation_models:
  - anthropic/claude-haiku-4.5
  - qwen/qwen3-235b-a22b-2507
---
# Authentifizierung & Sicherheit {#authentication-security}

Die API verwendet eine Kombination aus sessionbasierter Authentifizierung und CSRF-Schutz für alle Datenbankschreibvorgänge, um unbefugten Zugriff und mögliche Denial-of-Service-Angriffe zu verhindern. Externe APIs (verwendet von Duplicati) bleiben aus Kompatibilitätsgründen nicht authentifiziert.

## Sessionbasierte Authentifizierung {#session-based-authentication}

Geschützte Endpunkte erfordern ein gültiges Sitzungs-Cookie und einen CSRF-Token. Das Sitzungssystem bietet eine sichere Authentifizierung für alle geschützten Operationen.

### Sitzungsverwaltung {#session-management}
1. **Sitzung erstellen**: POST-Anfrage an `/api/session`, um eine neue Sitzung zu erstellen
2. **CSRF-Token abrufen**: GET-Anfrage an `/api/csrf`, um ein CSRF-Token für die Sitzung zu erhalten
3. **In Anfragen einbinden**: Sitzungs-Cookie und CSRF-Token mit geschützten Anfragen senden
4. **Sitzung prüfen**: GET `/api/session`, um zu überprüfen, ob die Sitzung noch gültig ist
5. **Sitzung löschen**: DELETE `/api/session`, um sich abzumelden und die Sitzung zu löschen

### CSRF-Schutz {#csrf-protection}
Alle statusändernden Operationen erfordern einen gültigen CSRF-Token, der mit der aktuellen Sitzung übereinstimmt. Der CSRF-Token muss im `X-CSRF-Token`-Header für geschützte Endpunkte enthalten sein.

### Geschützte Endpunkte {#protected-endpoints}
Alle Endpunkte, die Datenbankdaten ändern, erfordern eine Sitzungsauthentifizierung und einen CSRF-Token:

- **Serververwaltung**: `/api/servers/:id` (PATCH, DELETE), `/api/servers/:id/server-url` (PATCH), `/api/servers/:id/password` (PATCH, GET)
- **Konfigurationsverwaltung**: `/api/configuration/email` (GET, POST, DELETE), `/api/configuration/unified` (GET), `/api/configuration/ntfy` (GET), `/api/configuration/notifications` (GET, POST), `/api/configuration/backup-settings` (POST), `/api/configuration/templates` (POST), `/api/configuration/overdue-tolerance` (GET, POST)
- **Benachrichtigungssystem**: `/api/notifications/test` (POST)
- **Cron-Konfiguration**: `/api/cron-config` (GET, POST)
- **Cron-Proxy**: `/api/cron/*` (GET, POST) – leitet Anfragen an den Cron-Dienst weiter
- **Sitzungsverwaltung**: `/api/session` (POST, GET, DELETE), `/api/csrf` (GET)
- **Diagrammdaten**: `/api/chart-data/*` (GET)
- **Dashboard**: `/api/dashboard` (GET)
- **Serverdetails**: `/api/servers` (GET), `/api/servers/:id` (GET), `/api/detail/:serverId` (GET)
- **Audit-Log**: `/api/audit-log` (GET), `/api/audit-log/download` (GET), `/api/audit-log/filters` (GET), `/api/audit-log/retention` (PATCH), `/api/audit-log/cleanup` (POST) – Administrator erforderlich für Schreibvorgänge
- **Benutzerverwaltung**: `/api/users` (GET, POST, PATCH, DELETE) – Administrator erforderlich
- **Datenbankverwaltung**: `/api/database/backup` (GET), `/api/database/restore` (POST) – Administrator erforderlich
- **Anwendungsprotokolle**: `/api/application-logs` (GET), `/api/application-logs/export` (GET) – Administrator erforderlich
- **Backup-Sammlung**: `/api/backups/collect` (POST) – erfordert Sitzung und CSRF-Token
- **Backup-Zeitplan-Synchronisierung**: `/api/backups/sync-schedule` (POST) – erfordert Sitzung und CSRF-Token
- **Überfälligkeitsprüfung**: `/api/notifications/check-overdue` (POST) – erfordert Sitzung und CSRF-Token
- **Überfällige Zeitstempel löschen**: `/api/notifications/clear-overdue-timestamps` (POST) – erfordert Sitzung und CSRF-Token

### Ungeschützte Endpunkte {#unprotected-endpoints}
Externe APIs bleiben für die Duplicati-Integration nicht authentifiziert:

- `/api/upload` – Upload von Backup-Daten aus Duplicati
- `/api/lastbackup/:serverId` – Aktueller Backup-Status
- `/api/lastbackups/:serverId` – Status der letzten Backups
- `/api/summary` – Gesamte Zusammenfassungsdaten
- `/api/health` – Health-Check-Endpunkt

### Verwendungsbeispiel (Sitzung + CSRF) {#usage-example-session--csrf}

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

## Authentifizierungs-Endpunkte {#authentication-endpoints}

### Anmeldung - `/api/auth/login` {#login---apiauthlogin}
- **Endpunkt**: `/api/auth/login`
- **Methode**: POST
- **Beschreibung**: Authentifiziert einen Benutzer und erstellt eine Sitzung. Unterstützt Sperrung des Kontos nach fehlgeschlagenen Versuchen und Passwortänderungsanforderungen.
- **Authentifizierung**: Erfordert gültige Sitzung und CSRF-Token (aber keinen angemeldeten Benutzer)
- **Anfrage-Body**:

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

- **Fehlerantworten**: Alle Fehlerantworten enthalten `error` (Nachricht in Englisch) und `errorCode` (stabilen Code für clientseitige Übersetzung).
  - `400`: Benutzername oder Passwort fehlt — `errorCode: "REQUIRED_CREDENTIALS"`
  - `401`: Ungültiger Benutzername oder Passwort — `errorCode: "INVALID_CREDENTIALS"`
  - `403`: Konto gesperrt aufgrund zu vieler fehlgeschlagener Anmeldeversuche — `errorCode: "ACCOUNT_LOCKED"` (enthält `lockedUntil`, `minutesRemaining`)
  - `500`: Interner Serverfehler — `errorCode: "INTERNAL_ERROR"`
  - `503`: Datenbank nicht bereit — `errorCode: "DATABASE_NOT_READY"`
- **Hinweise**:
  - Das Konto wird nach 5 fehlgeschlagenen Anmeldeversuchen für 15 Minuten gesperrt
  - Fehlgeschlagene Anmeldeversuche werden verfolgt und protokolliert
  - Das Sitzungs-Cookie wird automatisch in der Antwort gesetzt
  - Wenn das `mustChangePassword`-Flag beim Benutzer gesetzt ist, sollte er zur Passwortänderungsseite weitergeleitet werden
  - Alle Anmeldeversuche (erfolgreich und fehlgeschlagen) werden im Audit-Log protokolliert

### Abmeldung - `/api/auth/logout` {#logout---apiauthlogout}
- **Endpunkt**: `/api/auth/logout`
- **Methode**: POST
- **Beschreibung**: Meldet den aktuellen Benutzer ab und löscht dessen Sitzung.
- **Authentifizierung**: Erfordert gültige Sitzung und CSRF-Token
- **Antwort** (Erfolg):

  ```json
  {
    "success": true,
    "message": "Logged out successfully",
    "successCode": "LOGGED_OUT"
  }
  ```

- **Fehlerantworten**: Enthalten `error` und `errorCode` zur clientseitigen Übersetzung.
  - `400`: Keine aktive Sitzung — `errorCode: "NO_ACTIVE_SESSION"`
  - `500`: Interner Serverfehler — `errorCode: "INTERNAL_ERROR"`
- **Hinweise**:
  - Das Sitzungs-Cookie wird in der Antwort gelöscht
  - Die Abmeldung wird im Audit-Log protokolliert
  - Die Sitzung wird sofort ungültig gemacht

### Aktuellen Benutzer abrufen - `/api/auth/me` {#get-current-user---apiauthme}
- **Endpunkt**: `/api/auth/me`
- **Methode**: GET
- **Beschreibung**: Gibt die Informationen des aktuell authentifizierten Benutzers zurück oder zeigt an, wenn kein Benutzer angemeldet ist.
- **Authentifizierung**: Erfordert gültige Sitzung (kein angemeldeter Benutzer erforderlich)
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

- **Fehlerantworten**: Enthalten `error` und `errorCode` zur clientseitigen Übersetzung.
  - `500`: Interner Serverfehler — `errorCode: "INTERNAL_ERROR"`
- **Hinweise**:
  - Kann ohne angemeldeten Benutzer aufgerufen werden (gibt `authenticated: false` zurück)
  - Nützlich zur Überprüfung des Authentifizierungsstatus beim Laden der Seite

### Passwort ändern - `/api/auth/change-password` {#change-password---apiauthchange-password}
- **Endpunkt**: `/api/auth/change-password`
- **Methode**: POST
- **Beschreibung**: Ändert das Passwort für den aktuell authentifizierten Benutzer. Wenn `mustChangePassword` gesetzt ist, entfällt die Überprüfung des aktuellen Passworts.
- **Authentifizierung**: Erfordert gültige Sitzung und CSRF-Token (angemeldeter Benutzer erforderlich)
- **Anforderungstext**:

  ```json
  {
    "currentPassword": "old-password",
    "newPassword": "new-secure-password"
  }
  ```

- `currentPassword`: Optional, wenn `mustChangePassword` wahr ist, andernfalls erforderlich
  - `newPassword`: Erforderlich, muss die Passwortrichtlinie erfüllen
- **Antwort** (Erfolg):

  ```json
  {
    "success": true,
    "message": "Password changed successfully",
    "successCode": "PASSWORD_CHANGED"
  }
  ```

- **Fehlerantworten**: Enthalten `error` und `errorCode` zur clientseitigen Übersetzung. Bei Verstoß gegen die Richtlinie kann `validationErrors` enthalten sein (Array von Zeichenketten).
  - `400`: Neues Passwort fehlt — `errorCode: "NEW_PASSWORD_REQUIRED"`
  - `400`: Verstoß gegen die Passwortrichtlinie — `errorCode: "POLICY_NOT_MET"` (kann `validationErrors` enthalten)
  - `400`: Neues Passwort entspricht aktuellem Passwort — `errorCode: "NEW_PASSWORD_SAME_AS_CURRENT"`
  - `401`: Aktuelles Passwort ist falsch — `errorCode: "CURRENT_PASSWORD_INCORRECT"`
  - `404`: Benutzer nicht gefunden — `errorCode: "USER_NOT_FOUND"`
  - `500`: Interner Serverfehler — `errorCode: "INTERNAL_ERROR"`
- **Hinweise**:
  - Das neue Passwort muss die Anforderungen der Passwortrichtlinie erfüllen (Länge, Komplexität usw.)
  - Wenn das `mustChangePassword`-Flag gesetzt ist, entfällt die Überprüfung des aktuellen Passworts
  - Nach erfolgreicher Passwortänderung wird das `mustChangePassword`-Flag gelöscht
  - Passwortänderungen werden im Audit-Log protokolliert
  - Neues Passwort muss sich vom aktuellen Passwort unterscheiden

### Überprüfen, ob Administrator Passwort ändern muss - `/api/auth/admin-must-change-password` {#check-admin-must-change-password---apiauthadmin-must-change-password}
- **Endpunkt**: `/api/auth/admin-must-change-password`
- **Methode**: GET
- **Beschreibung**: Überprüft, ob der Admin-Benutzer sein Passwort ändern muss. Dieser Endpunkt ist öffentlich (keine Authentifizierung erforderlich), da er lediglich eine boolesche Kennung zurückgibt.
- **Antwort**:

  ```json
  {
    "mustChangePassword": false
  }
  ```

- **Fehlerantworten**:
  - `500`: Interner Serverfehler (gibt bei Fehlern `mustChangePassword: false` zurück, um den Hinweis nicht anzuzeigen, falls ein Datenbankproblem vorliegt)
- **Hinweise**:
  - Öffentlicher Endpunkt, keine Authentifizierung erforderlich
  - Gibt `false` zurück, wenn der Admin-Benutzer nicht existiert
  - Wird verwendet, um zu bestimmen, ob der Hinweis zur Passwortänderung angezeigt werden soll
  - Bei Fehlern gibt er `false` zurück, um den Hinweis nicht anzuzeigen, falls ein Datenbankproblem vorliegt

### Passwortsicherheitsrichtlinie abrufen - `/api/auth/password-policy` {#get-password-policy---apiauthpassword-policy}
- **Endpunkt**: `/api/auth/password-policy`
- **Methode**: GET
- **Beschreibung**: Gibt die aktuelle Konfiguration der Passwortsicherheitsrichtlinie zurück. Dieser Endpunkt ist öffentlich (keine Authentifizierung erforderlich), da er für die Frontend-Validierung benötigt wird.
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

- **Fehlerantworten**: Enthalten `error` und `errorCode` zur clientseitigen Übersetzung.
  - `500`: Abrufen der Passwortrichtlinie fehlgeschlagen — `errorCode: "POLICY_RETRIEVE_FAILED"`
- **Hinweise**:
  - Öffentlicher Endpunkt, keine Authentifizierung erforderlich
  - Wird von Frontend-Komponenten verwendet, um Passwortanforderungen anzuzeigen und Passwörter vor der Übergabe zu überprüfen
  - Die Richtlinie wird über Umgebungsvariablen konfiguriert (`PWD_ENFORCE`, `PWD_MIN_LEN`)
  - Die Standardpasswortprüfung (um die Verwendung des Standard-Administratorpassworts zu verhindern) wird immer unabhängig von den Richtlinieneinstellungen erzwungen

### Auth-API-Fehler- und Erfolgscodes (i18n) {#auth-api-error-and-success-codes-i18n}

Auth-Endpunkte geben einen stabilen `errorCode` (und bei Erfolg `successCode`) zusätzlich zum menschenlesbaren Feld `error` oder `message` zurück. Die Werte von `error` und `message` sind in Englisch. Clients sollten die Codes verwenden, um lokalisierte Zeichenketten nachzuschlagen, sodass die Benutzeroberfläche Nachrichten in der vom Benutzer gewählten Sprache anzeigt.

| Endpunkt | Erfolgscode | Fehlercodes |
|----------|--------------|-------------|
| `/api/auth/login` | — | `REQUIRED_CREDENTIALS`, `INVALID_CREDENTIALS`, `ACCOUNT_LOCKED`, `DATABASE_NOT_READY`, `INTERNAL_ERROR` |
| `/api/auth/logout` | `LOGGED_OUT` | `NO_ACTIVE_SESSION`, `INTERNAL_ERROR` |
| `/api/auth/me` | — | `INTERNAL_ERROR` |
| `/api/auth/change-password` | `PASSWORD_CHANGED` | `NEW_PASSWORD_REQUIRED`, `POLICY_NOT_MET`, `USER_NOT_FOUND`, `CURRENT_PASSWORD_INCORRECT`, `NEW_PASSWORD_SAME_AS_CURRENT`, `INTERNAL_ERROR` |
| `/api/auth/password-policy` | — | `POLICY_RETRIEVE_FAILED` |

### Fehlerantworten {#error-responses}
- `401 Unauthorized`: Ungültige oder fehlende Sitzung, abgelaufene Sitzung oder fehlgeschlagene CSRF-Token-Validierung
- `403 Forbidden`: CSRF-Token-Validierung fehlgeschlagen oder Operation nicht erlaubt

:::caution
 Stellen Sie den **duplistatus**-Server nicht dem öffentlichen Internet zur Verfügung. Nutzen Sie ihn in einem sicheren Netzwerk 
(z. B. lokales LAN, geschützt durch eine Firewall).

Die Bereitstellung der **duplistatus**-Schnittstelle im öffentlichen Internet 
 ohne angemessene Sicherheitsmaßnahmen könnte zu unbefugtem Zugriff führen.
:::
