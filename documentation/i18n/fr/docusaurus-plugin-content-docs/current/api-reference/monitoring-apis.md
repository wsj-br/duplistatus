# Surveillance et santé {/* #monitoring--health */}

## Vérification de santé - `/api/health` {/* #health-check---apihealth */}
- **Point de terminaison** : `/api/health`
- **Méthode** : GET
- **Description** : Vérification de vitalité basique pour l'application et la connexion SQLite. Docker `HEALTHCHECK` et la boucle d'attente de l'entrée principale utilisent cette URL sur localhost.
- **Réponse** (en bonne santé) :

  ```json
  {
    "status": "healthy",
    "database": "connected",
    "basicConnection": true,
    "initializationStatus": "complete",
    "initializationComplete": true,
    "connectionHealth": true,
    "timestamp": "2024-03-20T10:00:00Z"
  }
  ```

- **Réponse** (dégradée) :

  ```json
  {
    "status": "degraded",
    "database": "unavailable",
    "basicConnection": false,
    "initializationStatus": "complete",
    "initializationComplete": true,
    "connectionHealth": false,
    "connectionHealthError": "Database connection test failed",
    "timestamp": "2024-03-20T10:00:00Z"
  }
  ```

- **Réponse d'erreur** (503):

  ```json
  {
    "status": "unhealthy",
    "error": "Database connection failed",
    "message": "Connection timeout",
    "timestamp": "2024-03-20T10:00:00Z"
  }
  ```

- **Notes** :
  - Retourne 200 lorsque l'initialisation est terminée et que `SELECT 1` réussit
  - Retourne 503 lorsque l'initialisation ou la vérification de la connexion échoue
  - Ne liste pas les noms de tables ou n'exécute pas les requêtes du tableau de bord
  - Ne nécessite jamais une clé API
  - Lorsque l'une des listes d'adresses IP autorisées est activée, l'adresse IP du client doit être en boucle ou figurée sur la liste CIDR admin ou externe (`403` `IP_NOT_ALLOWED` sinon)
  - Les clients non en boucle sont limités en taux (`429` `PROBE_RATE_LIMITED`, 30/minute et 120/heure). La boucle (`127.0.0.1`, `::1`) n'est jamais limitée

## Sonde de connectivité - `/api/ping` {/* #connectivity-probe---apiping */}
- **Point de terminaison** : `/api/ping`
- **Méthode** : GET
- **Description** : Réponse `{ "ok": true }` minuscule utilisée par la vérification de connectivité du tableau de bord (toutes les 30 secondes).
- **Réponse** :

  ```json
  {
    "ok": true
  }
  ```

- **Notes** :
  - Ne nécessite jamais une clé API ou un cookie de session
  - Mêmes règles d'union de liste d'adresses IP et de boucle que `/api/health`
  - Les clients non en boucle sont limités en taux (`429` `PROBE_RATE_LIMITED`, 60/minute et 600/heure)
