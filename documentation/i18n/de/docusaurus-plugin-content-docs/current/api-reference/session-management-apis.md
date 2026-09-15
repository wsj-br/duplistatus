# Sitzungsverwaltung {/* #session-management */}

## Sitzung erstellen - `/api/session` {/* #create-session---apisession */}
- **Endpunkt**: `/api/session`
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
  - `500`: Sitzung konnte nicht erstellt werden
- **Hinweise**:
  - Erstellt eine neue Sitzung mit 24-Stunden-Ablauf
  - Setzt HTTP-only Sitzungscookie
  - Erforderlich für den Zugriff auf geschützte Endpunkte

## Sitzung validieren - `/api/session` {/* #validate-session---apisession */}
- **Endpunkt**: `/api/session`
- **Methode**: GET
- **Beschreibung**: Validiert eine bestehende Sitzung.
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
  - `500`: Sitzung konnte nicht validiert werden
- **Hinweise**:
  - Überprüft, ob das Sitzungscookie vorhanden und gültig ist
  - Gibt die Sitzungs-ID zurück, wenn gültig

## Sitzung löschen - `/api/session` {/* #delete-session---apisession */}
- **Endpunkt**: `/api/session`
- **Methode**: DELETE
- **Beschreibung**: Löscht die aktuelle Sitzung (Abmelden).
- **Antwort**:

  ```json
  {
    "message": "Session deleted successfully"
  }
  ```

- **Fehlerantworten**:
  - `500`: Sitzung konnte nicht gelöscht werden
- **Hinweise**:
  - Löscht die Sitzung vom Server und Client
  - Entfernt das Sitzungscookie

## CSRF-Token abrufen - `/api/csrf` {/* #get-csrf-token---apicsrf */}
- **Endpunkt**: `/api/csrf`
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
  - `500`: CSRF-Token konnte nicht generiert werden
- **Hinweise**:
  - Erfordert eine gültige Sitzung
  - CSRF-Token ist für alle zustandsverändernden Operationen erforderlich
  - Token ist an die aktuelle Sitzung gebunden
