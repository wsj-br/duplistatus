# Gestion du service Cron {#cron-service-management}

## Obtenir la configuration Cron - `/api/cron-config` {#get-cron-configuration---apicron-config}
- **Point de terminaison** : `/api/cron-config`
- **Méthode** : GET
- **Description** : Récupère la configuration actuelle du service cron.
- **Authentification** : Nécessite une session valide et un jeton CSRF
- **Réponse** :

  ```json
  {
    "cronExpression": "*/20 * * * *",
    "enabled": true
  }
  ```

- **Réponses d'erreur** :
  - `500` : Échec de la récupération de la configuration Cron
- **Notes** :
  - Renvoie la configuration actuelle du service Cron
  - Inclut l'expression Cron et le statut activé
  - Utilisé pour la gestion du service Cron

## Mettre à jour la configuration Cron - `/api/cron-config` {#update-cron-configuration---apicron-config}
- **Point de terminaison** : `/api/cron-config`
- **Méthode** : POST
- **Description** : Met à jour la configuration du service cron.
- **Authentification** : Nécessite une session valide et un jeton CSRF
- **Corps de la requête** :

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

## Proxy du service Cron - `/api/cron/*` {#cron-service-proxy---apicron}
- **Point de terminaison** : `/api/cron/*`
- **Méthode** : GET, POST
- **Description** : Fait transiter les requêtes vers le service cron. Ce point de terminaison transfère toutes les requêtes au service cron en cours d'exécution sur un port distinct.
- **Authentification** : Nécessite une session valide et un jeton CSRF
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
  - Fait transiter les requêtes vers le service Cron
  - Renvoie un code 503 si le service Cron n'est pas disponible
  - Prend en charge les méthodes GET et POST
  - Utilisé pour la gestion du service Cron depuis l'interface web
