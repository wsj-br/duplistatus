---
translation_last_updated: '2026-05-11T14:27:39.509Z'
source_file_mtime: '2026-05-06T23:18:51.418Z'
source_file_hash: f5c3284d1b0dd52ad80889d6741763f8018a5228b0673d443a4e02b03cf60f8e
translation_language: fr
source_file_path: documentation/docs/api-reference/session-management-apis.md
translation_models:
  - qwen/qwen3-235b-a22b-2507
---
# Gestion des sessions {#session-management}

## Créer une session - `/api/session` {#create-session---apisession}
- **Point de terminaison** : `/api/session`
- **Méthode** : POST
- **Description** : Crée une nouvelle session pour l'utilisateur.
- **Réponse** :

  ```json
  {
    "sessionId": "session-id-string",
    "message": "Session created successfully"
  }
  ```

- **Réponses d'erreur**:
  - `500`: Échec de la création de la session
- **Notes**:
  - Crée une nouvelle session avec une expiration de 24 heures
  - Définit un cookie de session HTTP-only
  - Requis pour accéder aux endpoints protégés

## Valider la session - `/api/session` {#validate-session---apisession}
- **Point de terminaison** : `/api/session`
- **Méthode** : GET
- **Description** : Valide une session existante.
- **Réponse** (valide):

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

- **Réponses d'erreur**:
  - `401`: Aucun cookie de session ou identifiant de session
  - `500`: Échec de la validation de la session
- **Notes**:
  - Vérifie si le cookie de session existe et est valide
  - Retourne l'identifiant de session s'il est valide

## Supprimer la session - `/api/session` {#delete-session---apisession}
- **Point de terminaison** : `/api/session`
- **Méthode** : DELETE
- **Description** : Supprime la session actuelle (déconnexion).
- **Réponse** :

  ```json
  {
    "message": "Session deleted successfully"
  }
  ```

- **Réponses d'erreur**:
  - `500`: Échec de la suppression de la session
- **Notes**:
  - Supprime la session du serveur et du client
  - Supprime le cookie de session

## Obtenir le jeton CSRF - `/api/csrf` {#get-csrf-token---apicsrf}
- **Point de terminaison** : `/api/csrf`
- **Méthode** : GET
- **Description** : Génère un jeton CSRF pour la session en cours.
- **Réponse** :

  ```json
  {
    "csrfToken": "csrf-token-string",
    "message": "CSRF token generated successfully"
  }
  ```

- **Réponses d'erreur**:
  - `401`: Aucune session trouvée ou session invalide/expirée
  - `500`: Échec de la génération du jeton CSRF
- **Notes**:
  - Nécessite une session valide
  - Le jeton CSRF est requis pour toutes les opérations modifiant l'état
  - Le jeton est associé à la session actuelle
