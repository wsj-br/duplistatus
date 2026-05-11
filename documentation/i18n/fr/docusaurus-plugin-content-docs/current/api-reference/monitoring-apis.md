---
translation_last_updated: '2026-05-11T14:27:39.165Z'
source_file_mtime: '2026-05-06T23:18:51.410Z'
source_file_hash: eb18cd75959282575195e73b0368d4eecd23bf9684c9c5915cea3d8f6c360fce
translation_language: fr
source_file_path: documentation/docs/api-reference/monitoring-apis.md
translation_models:
  - qwen/qwen3-235b-a22b-2507
---
# Surveillance et état de santé {#monitoring-health}

## Vérification d'intégrité - `/api/health` {#health-check---apihealth}
- **Point de terminaison** : `/api/health`
- **Méthode** : GET
- **Description** : Vérifie le statut de santé de l'application et de la base de données.
- **Réponse** (système sain) :

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
  - Inclut `connectionHealthError` et `connectionDetails` en cas d'échec des vérifications de santé de la connexion
  - La trace de pile n'est incluse qu'en mode développement
  - Teste la connexion de base à la base de données, les instructions préparées, le statut d'initialisation et la santé de la connexion
  - Fournit un diagnostic complet de l'état de santé pour le dépannage
