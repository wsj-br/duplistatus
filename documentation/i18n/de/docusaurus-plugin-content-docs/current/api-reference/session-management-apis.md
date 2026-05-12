# Sitzungsverwaltung {#session-management}

## Sitzung erstellen - `/api/session` {#create-session---apisession}
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
  - `500`: Fehlgeschlagen beim Erstellen der Sitzung
- **Hinweise**:
  - Erstellt eine neue Sitzung mit einer Gültigkeitsdauer von 24 Stunden
  - Setzt ein HTTP-only-Sitzungs-Cookie
  - Erforderlich für den Zugriff auf geschützte Endpunkte

## Sitzung überprüfen - `/api/session` {#validate-session---apisession}
- **Endpunkt**: `/api/session`
- **Methode**: GET
- **Beschreibung**: Überprüft eine vorhandene Sitzung.
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
  - `401`: Kein Sitzungs-Cookie oder Sitzungs-ID vorhanden
  - `500`: Fehlgeschlagen beim Überprüfen der Sitzung
- **Hinweise**:
  - Prüft, ob das Sitzungs-Cookie vorhanden ist und gültig
  - Gibt die Sitzungs-ID zurück, falls gültig

## Sitzung löschen - `/api/session` {#delete-session---apisession}
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
  - `500`: Fehlgeschlagen beim Löschen der Sitzung
- **Hinweise**:
  - Entfernt die Sitzung vom Server und Client
  - Entfernt das Sitzungs-Cookie

## CSRF-Token abrufen - `/api/csrf` {#get-csrf-token---apicsrf}
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
  - `500`: Fehlgeschlagen beim Generieren des CSRF-Tokens
- **Hinweise**:
  - Erfordert eine gültige Sitzung
  - Das CSRF-Token ist für alle statusändernden Operationen erforderlich
  - Das Token ist an die aktuelle Sitzung gebunden
