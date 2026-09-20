# Authentifizierung & Sicherheit {/* #authentication--security */}

Die API verwendet eine Kombination aus sitzungsbasierter Authentifizierung und CSRF-Schutz für alle Schreiboperationen in der Datenbank, um unbefugten Zugriff und potenzielle Denial-of-Service-Angriffe zu verhindern. Externe APIs, die von Duplicati und Homepage verwendet werden, bleiben von CSRF ausgenommen. Sie können optional einen bereichsbezogenen API-Schlüssel und/oder eine IP-Zulassungsliste erfordern (beide standardmäßig aus). `/api/upload` verfügt zudem über eine konfigurierbare Obergrenze für die Textkörper-Größe und ein Ratenlimit.

## Sitzungsbasierte Authentifizierung {/* #session-based-authentication */}

Geschützte Endpunkte erfordern ein gültiges Sitzungs-Cookie und ein CSRF-Token. Das Sitzungssystem bietet eine sichere Authentifizierung für alle geschützten Operationen.

### Sitzungsverwaltung {/* #session-management */}
1. **Sitzung erstellen**: POST an `/api/session`, um eine neue Sitzung zu erstellen
2. **CSRF-Token abrufen**: GET `/api/csrf`, um ein CSRF-Token für die Sitzung zu erhalten
3. **In Anfragen einbinden**: Sitzungs-Cookie und CSRF-Token mit geschützten Anfragen senden
4. **Sitzung validieren**: GET `/api/session`, um zu prüfen, ob die Sitzung noch gültig ist
5. **Sitzung löschen**: DELETE `/api/session`, um sich abzumelden und die Sitzung zu löschen

### CSRF-Schutz {/* #csrf-protection */}
Alle zustandsändernden Operationen erfordern ein gültiges CSRF-Token, das mit der aktuellen Sitzung übereinstimmt. Das CSRF-Token muss für geschützte Endpunkte im Header `X-CSRF-Token` enthalten sein.

### Geschützte Endpunkte {/* #protected-endpoints */}
Alle Endpunkte, die Datenbankdaten ändern, erfordern eine Sitzungsauthentifizierung und ein CSRF-Token:

- **Serververwaltung**: `/api/servers/:id` (PATCH, DELETE), `/api/servers/:id/server-url` (PATCH), `/api/servers/:id/password` (PATCH, GET)
- **Konfigurationsverwaltung**: `/api/configuration/email` (GET, POST, DELETE), `/api/configuration/unified` (GET), `/api/configuration/ntfy` (GET), `/api/configuration/notifications` (GET, POST), `/api/configuration/backup-settings` (POST), `/api/configuration/templates` (POST), `/api/configuration/overdue-tolerance` (GET, POST), `/api/configuration/daily-summary` (GET, POST), `/api/configuration/daily-summary/send` (POST), `/api/configuration/daily-summary/retry` (POST), `/api/configuration/daily-summary/preview` (POST)
- **Benachrichtigungssystem**: `/api/notifications/test` (POST), `/api/notifications/preview` (POST)
- **Cron-Konfiguration**: `/api/cron-config` (GET, POST)
- **Cron-Proxy**: `/api/cron/*` (GET, POST) – leitet Anfragen an den Cron-Dienst weiter. POST erfordert einen Administrator. Der Cron-Prozess bindet standardmäßig an `127.0.0.1`; mutierende Cron-Dienst-Routen erfordern `X-Cron-Service-Secret`, wenn `CRON_SERVICE_SECRET` festgelegt ist.
- **Sitzungsverwaltung**: `/api/session` (POST, GET, DELETE), `/api/csrf` (GET)
- **Diagrammdaten**: `/api/chart-data/*` (GET)
- **Dashboard**: `/api/dashboard` (GET)
- **Server-Details**: `/api/servers` (GET), `/api/servers/:id` (GET), `/api/detail/:serverId` (GET)
- **Audit-Protokoll**: `/api/audit-log` (GET), `/api/audit-log/download` (GET), `/api/audit-log/filters` (GET), `/api/audit-log/retention` (PATCH), `/api/audit-log/cleanup` (POST) – Admin für Schreiboperationen erforderlich
- **Benutzerverwaltung**: `/api/users` (GET, POST, PATCH, DELETE) – Admin erforderlich
- **Datenbankverwaltung**: `/api/database/backup` (GET), `/api/database/restore` (POST) – Admin erforderlich
- **Anwendungsprotokolle**: `/api/application-logs` (GET), `/api/application-logs/export` (GET) – Admin erforderlich
- **Sicherungserfassung**: `/api/backups/collect` (POST) – erfordert Sitzung und CSRF-Token
- **Sicherungszeitplan-Synchronisierung**: `/api/backups/sync-schedule` (POST) – erfordert Sitzung und CSRF-Token
- **Überfälligkeitsprüfung**: `/api/notifications/check-overdue` (POST) – erfordert Sitzung und CSRF-Token
- **Überfällige Zeitstempel löschen**: `/api/notifications/clear-overdue-timestamps` (POST) – erfordert Sitzung und CSRF-Token

### Externe Endpunkte {/* #external-endpoints */}
Diese Routen verwenden keine Sitzungs-Cookies oder CSRF. Die Authentifizierung ist optional und wird in den Einstellungen konfiguriert:

- `/api/upload` – Sicherungsdaten-Uploads von Duplicati (Schlüssel mit Upload-Bereich, Größen- und Ratenbegrenzungen)
- `/api/lastbackup/:serverId` – Neuester Sicherungsstatus (Schlüssel mit Lese-Bereich)
- `/api/lastbackups/:serverId` – Status der neuesten Sicherungen (Schlüssel mit Lese-Bereich)
- `/api/summary` – Gesamtzusammenfassungsdaten (Schlüssel mit Lese-Bereich)
- `/api/health` – Health-Check-Endpunkt (niemals mit Schlüssel; ressourcenschonende SQLite-Prüfung; Ratenbegrenzung pro IP)
- `/api/ping` – Konnektivitätsprüfung (niemals mit Schlüssel; Ratenbegrenzung pro IP)

Wenn **API-Schlüssel anfordern** ausgeschaltet ist, akzeptieren die ersten vier Routen Anfragen mit oder ohne Schlüssel: Ein gültiger Schlüssel mit passendem Bereich wird aufgezeichnet; ein ungültiger Schlüssel wird ignoriert. Wenn der Schalter eingeschaltet ist, geben sie ohne gültigen Schlüssel `401` und bei nicht übereinstimmendem Schlüsselbereich `403` zurück. `/api/health` und `/api/ping` verwenden niemals Schlüssel. Siehe [API-Schlüssel](../user-guide/settings/api-keys-settings.md) und [IP-Zulassungsliste](../user-guide/settings/ip-allowlist-settings.md).

### Anwendungsbeispiel (Sitzung + CSRF) {/* #usage-example-session--csrf */}

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

### Login - `/api/auth/login` {/* #login---apiauthlogin */}
- **Endpunkt**: `/api/auth/login`
- **Methode**: POST
- **Beschreibung**: Authentifiziert einen Benutzer und erstellt eine Sitzung. Unterstützt Kontosperrung nach fehlgeschlagenen Versuchen und Anforderungen zur Passwortänderung.
- **Authentifizierung**: Erfordert eine gültige Sitzung und ein CSRF-Token (jedoch keinen angemeldeten Benutzer)
- **Request-Body**:

  ```json
  {
    "username": "admin",
    "password": "password123"
  }
  ```

- **Antwort** (Erfolgreich):

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

- **Fehlerantworten**: Alle Fehlerantworten enthalten `error` (englische Nachricht) und `errorCode` (stabiler Code für clientseitige Übersetzung).
  - `400`: Fehlender Benutzername oder Passwort — `errorCode: "REQUIRED_CREDENTIALS"`
  - `401`: Ungültiger Benutzername oder Passwort — `errorCode: "INVALID_CREDENTIALS"`
  - `403`: Konto aufgrund zu vieler fehlgeschlagener Anmeldeversuche gesperrt — `errorCode: "ACCOUNT_LOCKED"` (enthält `lockedUntil`, `minutesRemaining`)
  - `500`: Interner Serverfehler — `errorCode: "INTERNAL_ERROR"`
  - `503`: Datenbank nicht bereit — `errorCode: "DATABASE_NOT_READY"`
- **Hinweise**:
  - Das Konto wird nach 5 fehlgeschlagenen Anmeldeversuchen für 15 Minuten gesperrt
  - Fehlgeschlagene Anmeldeversuche werden nachverfolgt und protokolliert
  - Das Session-Cookie wird automatisch in der Antwort gesetzt
  - Wenn für den Benutzer das Flag `mustChangePassword` gesetzt ist, sollte er zur Seite „Passwort ändern“ weitergeleitet werden
  - Alle Anmeldeversuche (erfolgreiche und fehlgeschlagene) werden im Audit-Protokoll protokolliert

### Abmelden - `/api/auth/logout` {/* #logout---apiauthlogout */}
- **Endpunkt**: `/api/auth/logout`
- **Methode**: POST
- **Beschreibung**: Meldet den aktuellen Benutzer ab und zerstört dessen Sitzung.
- **Authentifizierung**: Erfordert eine gültige Sitzung und ein CSRF-Token
- **Antwort** (Erfolgreich):

  ```json
  {
    "success": true,
    "message": "Logged out successfully",
    "successCode": "LOGGED_OUT"
  }
  ```

- **Fehlerantworten**: Enthalten `error` und `errorCode` für clientseitige Übersetzung.
  - `400`: Keine aktive Sitzung — `errorCode: "NO_ACTIVE_SESSION"`
  - `500`: Interner Serverfehler — `errorCode: "INTERNAL_ERROR"`
- **Hinweise**:
  - Das Session-Cookie wird in der Antwort gelöscht
  - Die Abmeldung wird im Audit-Protokoll protokolliert
  - Die Sitzung wird sofort ungültig

### Aktuellen Benutzer abrufen - `/api/auth/me` {/* #get-current-user---apiauthme */}
- **Endpunkt**: `/api/auth/me`
- **Methode**: GET
- **Beschreibung**: Gibt die Informationen des aktuell authentifizierten Benutzers zurück oder gibt an, ob kein Benutzer angemeldet ist.
- **Authentifizierung**: Erfordert eine gültige Sitzung (aber kein angemeldeter Benutzer erforderlich)
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

- **Fehlerantworten**: Enthalten `error` und `errorCode` für clientseitige Übersetzung.
  - `500`: Interner Serverfehler — `errorCode: "INTERNAL_ERROR"`
- **Hinweise**:
  - Kann ohne angemeldeten Benutzer aufgerufen werden (gibt `authenticated: false` zurück)
  - Nützlich zum Überprüfen des Authentifizierungsstatus beim Laden der Seite

### Passwort ändern - `/api/auth/change-password` {/* #change-password---apiauthchange-password */}
- **Endpunkt**: `/api/auth/change-password`
- **Methode**: POST
- **Beschreibung**: Ändert das Passwort für den aktuell authentifizierten Benutzer. Wenn `mustChangePassword` festgelegt ist, wird die Überprüfung des aktuellen Passworts übersprungen.
- **Authentifizierung**: Erfordert eine gültige Sitzung und ein CSRF-Token (angemeldeter Benutzer erforderlich)
- **Request-Body**:

  ```json
  {
    "currentPassword": "old-password",
    "newPassword": "new-secure-password"
  }
  ```

- `currentPassword`: Optional, wenn `mustChangePassword` true ist, andernfalls erforderlich
  - `newPassword`: Erforderlich, muss die Anforderungen der Passwortrichtlinie erfüllen
- **Antwort** (Erfolgreich):

  ```json
  {
    "success": true,
    "message": "Password changed successfully",
    "successCode": "PASSWORD_CHANGED"
  }
  ```

- **Fehlerantworten**: Enthalten `error` und `errorCode` für clientseitige Übersetzung. Bei einer Richtlinienverletzung kann `validationErrors` enthalten sein (Array von Zeichenfolgen).
  - `400`: Neues Passwort fehlt — `errorCode: "NEW_PASSWORD_REQUIRED"`
  - `400`: Verstoß gegen die Passwortrichtlinie — `errorCode: "POLICY_NOT_MET"` (kann `validationErrors` enthalten)
  - `400`: Neues Passwort entspricht dem aktuellen — `errorCode: "NEW_PASSWORD_SAME_AS_CURRENT"`
  - `401`: Aktuelles Passwort ist falsch — `errorCode: "CURRENT_PASSWORD_INCORRECT"`
  - `404`: Benutzer nicht gefunden — `errorCode: "USER_NOT_FOUND"`
  - `500`: Interner Serverfehler — `errorCode: "INTERNAL_ERROR"`
- **Hinweise**:
  - Neues Passwort muss den Anforderungen der Passwortrichtlinie entsprechen (Länge, Komplexität usw.)
  - Wenn das `mustChangePassword`-Flag gesetzt ist, wird die Überprüfung des aktuellen Passworts übersprungen
  - Nach erfolgreicher Passwortänderung wird das `mustChangePassword`-Flag zurückgesetzt
  - Passwortänderungen werden im Audit-Protokoll protokolliert
  - Neues Passwort muss sich vom aktuellen Passwort unterscheiden

### Prüfen: Admin – Passwort muss geändert werden - `/api/auth/admin-must-change-password` {/* #check-admin-must-change-password---apiauthadmin-must-change-password */}
- **Endpunkt**: `/api/auth/admin-must-change-password`
- **Methode**: GET
- **Beschreibung**: Prüft, ob der Administrator-Benutzer sein Passwort ändern muss. Dieser Endpunkt ist öffentlich (keine Authentifizierung erforderlich), da er nur ein boolesches Flag zurückgibt.
- **Antwort**:

  ```json
  {
    "mustChangePassword": false
  }
  ```

- **Fehlerantworten**:
  - `500`: Interner Serverfehler (gibt bei einem Fehler `mustChangePassword: false` zurück, um zu vermeiden, dass der Hinweis angezeigt wird, wenn ein Datenbankproblem vorliegt)
- **Hinweise**:
  - Öffentlicher Endpunkt, keine Authentifizierung erforderlich
  - Gibt `false` zurück, wenn der Administrator-Benutzer nicht existiert
  - Wird verwendet, um zu bestimmen, ob der Hinweis zur Passwortänderung angezeigt werden soll
  - Gibt bei einem Fehler `false` zurück, um zu vermeiden, dass der Hinweis angezeigt wird, wenn ein Datenbankproblem vorliegt

### Passwortrichtlinie abrufen - `/api/auth/password-policy` {/* #get-password-policy---apiauthpassword-policy */}
- **Endpunkt**: `/api/auth/password-policy`
- **Methode**: GET
- **Beschreibung**: Gibt die aktuelle Konfiguration der Passwortrichtlinie zurück. Dieser Endpunkt ist öffentlich (keine Authentifizierung erforderlich), da er für die Frontend-Validierung benötigt wird.
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

- **Fehlerantworten**: Enthalten `error` und `errorCode` für die clientseitige Übersetzung.
  - `500`: Abrufen der Passwortrichtlinie fehlgeschlagen — `errorCode: "POLICY_RETRIEVE_FAILED"`
- **Hinweise**:
  - Öffentlicher Endpunkt, keine Authentifizierung erforderlich
  - Wird von Frontend-Komponenten verwendet, um Passwortanforderungen anzuzeigen und Passwörter vor dem Absenden zu validieren
  - Richtlinie wird über Umgebungsvariablen konfiguriert (`PWD_ENFORCE`, `PWD_MIN_LEN`)
  - Standard-Passwortprüfung (Verhinderung der Verwendung des Standard-Admin-Passworts) wird unabhängig von den Richtlinieneinstellungen immer erzwungen

### Fehler- und Erfolgscodes der Auth-API (i18n) {/* #auth-api-error-and-success-codes-i18n */}

Auth-Endpunkte geben zusätzlich zum visuell lesbaren Feld `error` oder `message` einen stabilen `errorCode` (und bei Erfolg `successCode`) zurück. Die Werte für `error` und `message` sind auf Englisch. Clients sollten die Codes verwenden, um lokalisierte Zeichenfolgen nachzuschlagen, damit die Benutzeroberfläche Nachrichten in der vom Benutzer ausgewählten Sprache anzeigt.

| Endpunkt | Erfolgscode | Fehlercodes |
|----------|-------------|-------------|
| `/api/auth/login` | — | `REQUIRED_CREDENTIALS`, `INVALID_CREDENTIALS`, `ACCOUNT_LOCKED`, `DATABASE_NOT_READY`, `INTERNAL_ERROR` |
| `/api/auth/logout` | `LOGGED_OUT` | `NO_ACTIVE_SESSION`, `INTERNAL_ERROR` |
| `/api/auth/me` | — | `INTERNAL_ERROR` |
| `/api/auth/change-password` | `PASSWORD_CHANGED` | `NEW_PASSWORD_REQUIRED`, `POLICY_NOT_MET`, `USER_NOT_FOUND`, `CURRENT_PASSWORD_INCORRECT`, `NEW_PASSWORD_SAME_AS_CURRENT`, `INTERNAL_ERROR` |
| `/api/auth/password-policy` | — | `POLICY_RETRIEVE_FAILED` |

### Fehlerantworten {/* #error-responses */}
- `401 Unauthorized`: Ungültige oder fehlende Sitzung, abgelaufene Sitzung oder Validierung des CSRF-Tokens fehlgeschlagen
- `403 Forbidden`: Validierung des CSRF-Tokens fehlgeschlagen oder Vorgang nicht zulässig

:::caution
 Den **duplistatus**-Server nicht für das öffentliche Internet freigeben. Verwenden Sie ihn in einem sicheren Netzwerk 
(z. B. lokales LAN, das durch eine Firewall geschützt ist).

Die Freigabe der **duplistatus**-Benutzeroberfläche für das öffentliche
 Internet ohne angemessene Sicherheitsmaßnahmen könnte zu unbefugtem Zugriff führen.
:::
