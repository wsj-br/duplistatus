# Surveillance et santé {#monitoring-health}

## Vérification de santé - `/api/health` {#health-check-apihealth}

- **Point de terminaison**: `/api/health`

- **Méthode**: GET

- **Description**: Vérifie le statut de santé de l'application et de la base de données.

- **Réponse** (sain):
  ```json
  {
    "status": "healthy",
    "database": "connected",
    "basicConnection": true,
    "tablesFound": 2,
    "tables": [
      "serveurs",
      "sauvegardes"
    ],
    "preparedStatements": true,
    "initializationStatus": "complete",
    "initializationComplete": true,
    "connectionHealth": true,
    "timestamp": "2024-03-20T10:00:00Z"
  }
  ```

- **Réponse** (dégradée):
  ```json
  {
    "status": "degraded",
    "database": "connected",
    "basicConnection": true,
    "tablesFound": 2,
    "tables": [
      "serveurs",
      "sauvegardes"
    ],
    "preparedStatements": false,
    "preparedStatementsError": "Détails de l'erreur de déclaration préparée",
    "initializationStatus": "complete",
    "initializationComplete": true,
    "connectionHealth": false,
    "connectionHealthError": "Échec de la vérification de santé de la connexion",
    "connectionDetails": {
      "additional": "informations de diagnostic"
    },
    "timestamp": "2024-03-20T10:00:00Z"
  }
  ```

- **Réponse d'erreur** (503):
  ```json
  {
    "status": "unhealthy",
    "error": "Connexion échouée à la base de données",
    "message": "Délai de connexion dépassé",
    "stack": "Error: Délai de connexion dépassé\n    at...",
    "timestamp": "2024-03-20T10:00:00Z"
  }
  ```

- **Remarques**:
  - Retourne le statut 200 pour les systèmes sains
  - Retourne le statut 503 pour les systèmes défaillants ou les échecs de déclarations préparées
  - Inclut le champ `preparedStatementsError` quand les déclarations préparées échouent
  - Inclut le champ `initializationError` quand l'initialisation de la base de données échoue
  - Inclut `connectionHealthError` et `connectionDetails` quand les vérifications de santé de la connexion échouent
  - La trace de pile est incluse uniquement en mode développement
  - Teste la connexion de base de données, les déclarations préparées, le statut d'initialisation et la santé de la connexion
  - Fournit des diagnostics de santé complets pour le dépannage
