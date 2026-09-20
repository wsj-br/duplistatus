# Surveillance et santé {/* #monitoring--health */}

## Vérification de santé - `/api/health` {/* #health-check---apihealth */}
- **Point de terminaison** : `/api/health`
- **Méthode** : GET
- **Description** : Vérification de vivacité peu coûteuse pour l'application et la connexion SQLite. Docker `HEALTHCHECK` et la boucle du point d'entrée utilisent cette URL sur localhost.
- **Réponse** (sain) :

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

- **Réponse** (dégradé) :

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

- **Réponse d'erreur** (503) :

  ```json
  {
    "status": "unhealthy",
    "error": "Database connection failed",
    "message": "Connection timeout",
    "timestamp": "2024-03-20T10:00:00Z"
  }
  ```

- **Remarques** :
  - Retourne 200 quand l'initialisation est terminée et `SELECT 1` réussit
  - Retourne 503 quand l'initialisation ou la vérification de connexion échoue
  - Ne liste pas les noms de tables ni n'exécute les requêtes du tableau de bord
  - Ne nécessite jamais une clé API
  - Quand l'une ou l'autre liste d'adresses IP autorisées est activée, l'adresse IP du client doit être une boucle locale ou figurée sur la liste CIDR admin ou externe (`403` `IP_NOT_ALLOWED` sinon)
  - Les clients non-boucle locale sont limités en débit (`429` `PROBE_RATE_LIMITED`, 30/minute et 120/heure). La boucle locale (`127.0.0.1`, `::1`) n'est jamais limitée

## Sonde de connectivité - `/api/ping` {/* #connectivity-probe---apiping */}
- **Point de terminaison** : `/api/ping`
- **Méthode** : GET
- **Description** : Réponse minuscule `{ "ok": true }` utilisée par la vérification de connectivité du tableau de bord (toutes les 30 secondes).
- **Réponse** :

  ```json
  {
    "ok": true
  }
  ```

- **Remarques** :
  - Ne nécessite jamais une clé API ni un cookie de session
  - Mêmes règles d'union de liste d'adresses IP autorisées et de boucle locale que `/api/health`
  - Les clients non-boucle locale sont limités en débit (`429` `PROBE_RATE_LIMITED`, 60/minute et 600/heure)
