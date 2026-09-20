# Sitzungsverwaltung {/* #session-management */}

## Sitzung erstellen - `/api/session` {/* #create-session---apisession */}
- **Endpoint**: `/api/session`
- **Methode**: POST
- **Beschreibung**: Erstellt eine neue Sitzung für den Benutzer.
- **Antwort**:

  ```json
  {
    "sessionId": "session-id-string",
    "message": "Session created successfully"
  }
  ```

- **Fehlerantworten**:
  - `500`: Fehlgeschlagen, Sitzung konnte nicht erstellt werden
- **Hinweise**:
  - Erstellt eine neue Sitzung mit 24-Stunden-Gültigkeit
  - Setzt ein HTTP-only-Sitzungscookie
  - Erforderlich für den Zugriff auf geschützte Endpunkte

## Sitzung überprüfen - `/api/session` {/* #validate-session---apisession */}
- **Endpoint**: `/api/session`
- **Methode**: GET
- **Beschreibung**: Überprüft eine bestehende Sitzung.
- **Antwort** (gültig):

  ```json
  {
    "valid": true,
    "sessionId": "session-id-string"
  }
  ```

- **Antwort** (ungültig):

  ```json
  {
    "valid": false,
    "error": "No session cookie"
  }
  ```

- **Fehlerantworten**:
  - `401`: Kein Sitzungscookie oder Sitzungs-ID
  - `500`: Fehlgeschlagen, Sitzung konnte nicht überprüft werden
- **Hinweise**:
  - Überprüft, ob der Sitzungscookie existiert und gültig ist
  - Gibt die Sitzungs-ID zurück, wenn gültig

## Sitzung löschen - `/api/session` {/* #delete-session---apisession */}
- **Endpoint**: `/api/session`
- **Methode**: DELETE
- **Beschreibung**: Löscht die aktuelle Sitzung (Abmelden).
- **Antwort**:

  ```json
  {
    "message": "Session deleted successfully"
  }
  ```

- **Fehlerantworten**:
  - `500`: Fehlgeschlagen, Sitzung konnte nicht gelöscht werden
- **Hinweise**:
  - Entfernt die Sitzung vom Server und dem Client
  - Entfernt den Sitzungscookie

## CSRF-Token abrufen - `/api/csrf` {/* #get-csrf-token---apicsrf */}
- **Endpoint**: `/api/csrf`
- **Methode**: GET
- **Beschreibung**: Generiert ein CSRF-Token für die aktuelle Sitzung.
- **Antwort**:

  ```json
  {
    "csrfToken": "csrf-token-string",
    "message": "CSRF token generated successfully"
  }
  ```

- **Fehlerantworten**:
  - `401`: Keine Sitzung gefunden oder ungültige/abgelaufene Sitzung
  - `500`: Fehlgeschlagen, CSRF-Token konnte nicht generiert werden
- **Hinweise**:
  - Erfordert eine gültige Sitzung
  - CSRF-Token ist für alle statusändernden Operationen erforderlich
  - Das Token ist an die aktuelle Sitzung gebunden
