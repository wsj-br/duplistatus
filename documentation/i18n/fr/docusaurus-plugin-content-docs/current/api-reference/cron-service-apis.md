# Gestion du service cron {/* #cron-service-management */}

## Obtenir la configuration cron - `/api/cron-config` {/* #get-cron-configuration---apicron-config */}
- **Point de terminaison** : `/api/cron-config`
- **Méthode** : GET
- **Description** : Récupère la configuration actuelle du service cron.
- **Authentication** : Requiert une session valide et un jeton CSRF
- **Response** :

  ```json
  {
    "cronExpression": "*/20 * * * *",
    "enabled": true
  }
  ```

- **Réponses d'erreur** :
  - `500` : Échec de l'obtention de la configuration cron
- **Remarques** :
  - Renvoie la configuration actuelle du service cron
  - Comprend l'expression cron et l'état activé
  - Utilisé pour la gestion du service cron

## Mettre à jour la configuration cron - `/api/cron-config` {/* #update-cron-configuration---apicron-config */}
- **Point de terminaison** : `/api/cron-config`
- **Méthode** : POST
- **Description** : Met à jour la configuration du service cron.
- **Authentification** : Nécessite une session valide et un jeton CSRF
- **Corps de la demande** :

  ```json
  {
    "interval": "20min"
  }
  ```

- **Response** :

  ```json
  {
    "success": true
  }
  ```

- **Intervalles disponibles** : `"disabled"`, `"1min"`, `"5min"`, `"10min"`, `"15min"`, `"20min"`, `"30min"`, `"1hour"`, `"2hours"`
- **Réponses d'erreur** :
  - `400` : L'intervalle est requis
  - `500` : Échec de la mise à jour de la configuration cron
- **Remarques** :
  - Met à jour la configuration du service cron
  - Valide l'intervalle par rapport aux options autorisées
  - Affecte la fréquence de vérification des sauvegardes en retard

## Proxy du service cron - `/api/cron/*` {/* #cron-service-proxy---apicron */}
- **Point de terminaison** : `/api/cron/*`
- **Méthode** : GET, POST
- **Description** : Transmet les requêtes au service cron. Ce point de terminaison transfère toutes les requêtes au service cron s'exécutant sur un port distinct.
- **Authentification** : Nécessite une session valide et un jeton CSRF. GET est autorisé pour les utilisateurs authentifiés ; POST (démarrer/arrêter/déclencher/recharger) nécessite un administrateur.
- **Paramètres** :
  - `*` : Tout chemin qui sera transféré au service cron
- **Réponse** : Dépend du point de terminaison du service cron interrogé
- **Réponse d'erreur** (503) :

  ```json
  {
    "error": "Cron service is not running",
    "message": "The cron service is not available. Please start it with: npm run cron:start"
  }
  ```

- **Remarques** :
  - Transmet les requêtes au service cron sur `127.0.0.1`
  - Transfère `CRON_SERVICE_SECRET` sous la forme `X-Cron-Service-Secret` lorsqu'il est défini
  - Renvoie 503 si le service cron n'est pas disponible
  - Prend en charge les méthodes GET et POST
  - Utilisé pour la gestion du service cron depuis l'interface web
  - `POST /trigger/daily-summary-dispatch` est rejeté par le service cron ; utilisez `/api/configuration/daily-summary/send` à la place
  - `POST /trigger/database-compact` exécute immédiatement le compactage hebdomadaire (sauvegardes/serveurs orphelins et paramètres de notification, ainsi que `VACUUM` SQLite)
