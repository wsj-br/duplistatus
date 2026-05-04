---
translation_last_updated: '2026-04-18T00:01:50.555Z'
source_file_mtime: '2026-03-05T22:33:28.419Z'
source_file_hash: dcaa22d702c5a5e8506cf1be74b453ae66a255a11f09d5d169b57e890ae439c2
translation_language: fr
source_file_path: documentation/docs/api-reference/session-management-apis.md
translation_models:
  - qwen/qwen3-235b-a22b-2507
---
# Gestion des sessions {#session-management}

## Créer une session - `/api/session` {#create-session-apisession}
- **Endpoint**: `/api/session`
- **Method**: POST
- **Description**: Crée une nouvelle session pour l'utilisateur.
- **Response**:

  ```json
  {
    "sessionId": "session-id-string",
    "message": "Session created successfully"
  }
  ```

- **Error Responses**:
  - `500`: Échec de création de la session
- **Notes**:
  - Crée une nouvelle session avec une expiration de 24 heures
  - Définit un cookie de session HTTP-only
  - Requis pour accéder aux endpoints protégés

## Valider la session - `/api/session` {#validate-session-apisession}
- **Endpoint**: `/api/session`
- **Method**: GET
- **Description**: Valide une session existante.
- **Response** (valide):

  ```json
  {
    "valid": true,
    "sessionId": "session-id-string"
  }
  ```

- **Response** (invalide):

  ```json
  {
    "valid": false,
    "error": "No session cookie"
  }
  ```

- **Error Responses**:
  - `401`: Aucun cookie de session ou identifiant de session
  - `500`: Échec de validation de la session
- **Notes**:
  - Vérifie si le cookie de session existe et est valide
  - Retourne l'identifiant de session s'il est valide

## Supprimer la session - `/api/session` {#delete-session-apisession}
- **Endpoint**: `/api/session`
- **Method**: DELETE
- **Description**: Supprime la session actuelle (déconnexion).
- **Response**:

  ```json
  {
    "message": "Session deleted successfully"
  }
  ```

- **Error Responses**:
  - `500`: Échec de suppression de la session
- **Notes**:
  - Supprime la session du serveur et du client
  - Supprime le cookie de session

## Obtenir le jeton CSRF - `/api/csrf` {#get-csrf-token-apicsrf}
- **Endpoint**: `/api/csrf`
- **Method**: GET
- **Description**: Génère un jeton CSRF pour la session actuelle.
- **Response**:

  ```json
  {
    "csrfToken": "csrf-token-string",
    "message": "CSRF token generated successfully"
  }
  ```

- **Error Responses**:
  - `401`: Aucune session trouvée ou session invalide/expirée
  - `500`: Échec de génération du jeton CSRF
- **Notes**:
  - Nécessite une session valide
  - Le jeton CSRF est requis pour toutes les opérations modifiant l'état
  - Le jeton est lié à la session actuelle
