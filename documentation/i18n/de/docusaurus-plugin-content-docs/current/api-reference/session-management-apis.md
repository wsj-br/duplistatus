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

- **Fehler-Antworten**:
  - `500`: Sitzung konnte nicht erstellt werden
- **Hinweise**:
  - Erstellt eine neue Sitzung mit 24-Stunden-Ablauf
  - Setzt ein HTTP-only-Sitzungs-Cookie
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

- **Fehler-Antworten**:
  - `401`: Kein Sitzungs-Cookie oder Sitzungs-ID vorhanden
  - `500`: Sitzung konnte nicht validiert werden
- **Hinweise**:
  - Überprüft, ob das Sitzungs-Cookie existiert und gültig ist
  - Gibt die Sitzungs-ID zurück, falls gültig

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

- **Fehler-Antworten**:
  - `500`: Sitzung konnte nicht gelöscht werden
- **Hinweise**:
  - Löscht die Sitzung vom Server und Client
  - Entfernt das Sitzungs-Cookie

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

- **Fehler-Antworten**:
  - `401`: Keine Sitzung gefunden oder ungültige/abgelaufene Sitzung
  - `500`: CSRF-Token konnte nicht generiert werden
- **Hinweise**:
  - Erfordert eine gültige Sitzung
  - CSRF-Token ist für alle Zustandsänderungen erforderlich
  - Token ist an die aktuelle Sitzung gebunden
