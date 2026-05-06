---
translation_last_updated: '2026-05-06T23:20:00.374Z'
source_file_mtime: '2026-05-06T23:18:51.418Z'
source_file_hash: f5c3284d1b0dd52ad80889d6741763f8018a5228b0673d443a4e02b03cf60f8e
translation_language: de
source_file_path: documentation/docs/api-reference/session-management-apis.md
translation_models:
  - qwen/qwen3-235b-a22b-2507
---
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
