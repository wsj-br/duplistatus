---
translation_last_updated: '2026-04-18T00:01:05.424Z'
source_file_mtime: '2026-03-05T22:33:28.419Z'
source_file_hash: ccd50e5fe2f6be70227afc5ce46c99b7ce52a87df5184098f4d303683bd9e6c6
translation_language: fr
source_file_path: documentation/docs/api-reference/monitoring-apis.md
translation_models:
  - qwen/qwen3-235b-a22b-2507
---
# Surveillance et état de santé {#monitoring-health}

## Vérification de l'état de santé - `/api/health` {#health-check-apihealth}
- **Point de terminaison** : `/api/health`
- **Méthode** : GET
- **Description** : Vérifie l'état de santé de l'application et de la base de données.
- **Réponse** (sain) :

  ```json
  {
    "status": "healthy",
    "database": "connected",
    "basicConnection": true,
    "tablesFound": 2,
    "tables": [
      "servers",
      "backups"
    ],
    "preparedStatements": true,
    "initializationStatus": "complete",
    "initializationComplete": true,
    "connectionHealth": true,
    "timestamp": "2024-03-20T10:00:00Z"
  }
  ```

- **Réponse** (dégradé) :

  ```json
  {
    "status": "degraded",
    "database": "connected",
    "basicConnection": true,
    "tablesFound": 2,
    "tables": [
      "servers",
      "backups"
    ],
    "preparedStatements": false,
    "preparedStatementsError": "Prepared statement error details",
    "initializationStatus": "complete",
    "initializationComplete": true,
    "connectionHealth": false,
    "connectionHealthError": "Connection health check failed",
    "connectionDetails": {
      "additional": "diagnostic information"
    },
    "timestamp": "2024-03-20T10:00:00Z"
  }
  ```

- **Réponse d'erreur** (503) :

  ```json
  {
    "status": "unhealthy",
    "error": "Database connection failed",
    "message": "Connection timeout",
    "stack": "Error: Connection timeout\n    at...",
    "timestamp": "2024-03-20T10:00:00Z"
  }
  ```

- **Notes** : 
  - Retourne le statut 200 pour les systèmes sains
  - Retourne le statut 503 pour les systèmes défaillants ou en cas d'échec des instructions préparées
  - Inclut le champ `preparedStatementsError` en cas d'échec des instructions préparées
  - Inclut le champ `initializationError` en cas d'échec de l'initialisation de la base de données
  - Inclut les champs `connectionHealthError` et `connectionDetails` en cas d'échec des vérifications de santé de la connexion
  - La trace de pile n'est incluse qu'en mode développement
  - Teste la connexion de base à la base de données, les instructions préparées, l'état d'initialisation et la santé de la connexion
  - Fournit des diagnostics complets de l'état de santé pour le dépannage
