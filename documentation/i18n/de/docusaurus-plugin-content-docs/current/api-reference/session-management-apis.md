# Sitzungsverwaltung {#session-management}

## Sitzung erstellen - `/api/session` {#create-session-apisession}

- **Endpunkt**: `/api/session`
- **Methode**: POST
- **Beschreibung**: Erstellt eine neue Sitzung für den Benutzer.
- **Antwort**:
  ```json
  {
    "sessionId": "session-id-string",
    "message": "Sitzung erfolgreich erstellt"
  }
  ```
- **Fehlerantworten**:
  - `500`: Fehler beim Erstellen der Sitzung
- **Hinweise**:
  - Erstellt eine neue Sitzung mit 24-Stunden-Ablauf
  - Setzt HTTP-only-Sitzungs-Cookie
  - Erforderlich für den Zugriff auf geschützte Endpunkte

## Sitzung validieren - `/api/session` {#validate-session-apisession}

- **Endpunkt**: `/api/session`
- **Methode**: GET
- **Beschreibung**: Validiert eine vorhandene Sitzung.
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
    "error": "Kein Sitzungs-Cookie"
  }
  ```
- **Fehlerantworten**:
  - `401`: Kein Sitzungs-Cookie oder Sitzungs-ID
  - `500`: Fehler beim Validieren der Sitzung
- **Hinweise**:
  - Prüft, ob das Sitzungs-Cookie vorhanden und gültig ist
  - Gibt Sitzungs-ID zurück, wenn gültig

## Sitzung löschen - `/api/session` {#delete-session-apisession}

- **Endpunkt**: `/api/session`
- **Methode**: DELETE
- **Beschreibung**: Löscht die aktuelle Sitzung (Abmelden).
- **Antwort**:
  ```json
  {
    "message": "Sitzung erfolgreich gelöscht"
  }
  ```
- **Fehlerantworten**:
  - `500`: Fehler beim Löschen der Sitzung
- **Hinweise**:
  - Löscht die Sitzung vom Server und vom Client
  - Entfernt Sitzungs-Cookie

## CSRF-Token abrufen - `/api/csrf` {#get-csrf-token-apicsrf}

- **Endpunkt**: `/api/csrf`
- **Methode**: GET
- **Beschreibung**: Generiert einen CSRF-Token für die aktuelle Sitzung.
- **Antwort**:
  ```json
  {
    "csrfToken": "csrf-token-string",
    "message": "CSRF-Token erfolgreich generiert"
  }
  ```
- **Fehlerantworten**:
  - `401`: Keine Sitzung gefunden oder ungültige/abgelaufene Sitzung
  - `500`: Fehler beim Generieren des CSRF-Tokens
- **Hinweise**:
  - Erfordert eine gültige Sitzung
  - CSRF-Token ist erforderlich für alle zustandsändernden Vorgänge
  - Token ist an die aktuelle Sitzung gebunden
