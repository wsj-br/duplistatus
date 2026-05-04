---
translation_last_updated: '2026-04-18T00:02:14.749Z'
source_file_mtime: '2026-03-05T22:33:28.419Z'
source_file_hash: dcaa22d702c5a5e8506cf1be74b453ae66a255a11f09d5d169b57e890ae439c2
translation_language: de
source_file_path: documentation/docs/api-reference/session-management-apis.md
translation_models:
  - qwen/qwen3-235b-a22b-2507
---
# Sitzungsverwaltung {#session-management}

## Sitzung erstellen - `/api/session` {#create-session-apisession}
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
  - `500`: Fehlgeschlagen, Sitzung zu erstellen
- **Hinweise**:
  - Erstellt eine neue Sitzung mit 24-Stunden-Ablauf
  - Setzt ein HTTP-only-Sitzungs-Cookie
  - Erforderlich für den Zugriff auf geschützte Endpunkte

## Sitzung prüfen - `/api/session` {#validate-session-apisession}
- **Endpoint**: `/api/session`
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
  - `500`: Fehlgeschlagen, Sitzung zu validieren
- **Hinweise**:
  - Prüft, ob das Sitzungs-Cookie existiert und gültig ist
  - Gibt die Sitzungs-ID zurück, falls gültig

## Sitzung löschen - `/api/session` {#delete-session-apisession}
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
  - `500`: Fehlgeschlagen, Sitzung zu löschen
- **Hinweise**:
  - Löscht die Sitzung vom Server und Client
  - Entfernt das Sitzungs-Cookie

## CSRF-Token abrufen - `/api/csrf` {#get-csrf-token-apicsrf}
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
  - `500`: Fehlgeschlagen, CSRF-Token zu generieren
- **Hinweise**:
  - Erfordert eine gültige Sitzung
  - CSRF-Token ist für alle statusändernden Operationen erforderlich
  - Das Token ist an die aktuelle Sitzung gebunden
