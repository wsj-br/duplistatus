---
translation_last_updated: '2026-04-18T00:00:41.589Z'
source_file_mtime: '2026-03-05T22:33:28.419Z'
source_file_hash: add8fe98b40a55c51fdd7af09ba7c836d54475b8283bbdebecbe17f2c6beb071
translation_language: fr
source_file_path: documentation/docs/api-reference/cron-service-apis.md
translation_models:
  - qwen/qwen3-235b-a22b-2507
---
# Gestion du service Cron {#cron-service-management}

## Obtenir la configuration Cron - `/api/cron-config` {#get-cron-configuration-apicron-config}
- **Endpoint**: `/api/cron-config`
- **Méthode**: GET
- **Description**: Récupère la configuration actuelle du service Cron.
- **Authentification**: Nécessite une session valide et un jeton CSRF
- **Réponse**:

  ```json
  {
    "cronExpression": "*/20 * * * *",
    "enabled": true
  }
  ```

- **Réponses d'erreur** :
  - `500` : Échec de la récupération de la configuration Cron
- **Notes** :
  - Retourne la configuration actuelle du service Cron
  - Inclut l'expression Cron et le statut activé
  - Utilisé pour la gestion du service Cron

## Mettre à jour la configuration Cron - `/api/cron-config` {#update-cron-configuration-apicron-config}
- **Endpoint**: `/api/cron-config`
- **Méthode**: POST
- **Description**: Met à jour la configuration du service Cron.
- **Authentification**: Nécessite une session valide et un jeton CSRF
- **Corps de la requête**:

  ```json
  {
    "interval": "20min"
  }
  ```

- **Réponse** :

  ```json
  {
    "success": true
  }
  ```

- **Intervalles disponibles** : `"disabled"`, `"1min"`, `"5min"`, `"10min"`, `"15min"`, `"20min"`, `"30min"`, `"1hour"`, `"2hours"`
- **Réponses d'erreur** :
  - `400` : L'intervalle est requis
  - `500` : Échec de la mise à jour de la configuration Cron
- **Notes** :
  - Met à jour la configuration du service Cron
  - Valide l'intervalle par rapport aux options autorisées
  - Affecte la fréquence de vérification des sauvegardes en retard

## Proxy du service Cron - `/api/cron/*` {#cron-service-proxy-apicron}
- **Endpoint**: `/api/cron/*`
- **Méthode**: GET, POST
- **Description**: Transmet les requêtes au service Cron. Ce point de terminaison transfère toutes les requêtes au service Cron en cours d'exécution sur un port distinct.
- **Authentification**: Nécessite une session valide et un jeton CSRF
- **Paramètres** :
  - `*` : Tout chemin qui sera transféré au service Cron
- **Réponse** : Dépend du point de terminaison du service Cron accédé
- **Réponse d'erreur** (503) :

  ```json
  {
    "error": "Cron service is not running",
    "message": "The cron service is not available. Please start it with: npm run cron:start"
  }
  ```

- **Notes** :
  - Transmet les requêtes au service Cron
  - Retourne 503 si le service Cron n'est pas disponible
  - Prend en charge les méthodes GET et POST
  - Utilisé pour la gestion du service Cron depuis l'interface web
