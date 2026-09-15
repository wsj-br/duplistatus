# Gestion du service Cron {/* #cron-service-management */}

## Obtenir la configuration Cron - `/api/cron-config` {/* #get-cron-configuration---apicron-config */}
- **Endpoint**: `/api/cron-config`
- **Méthode**: GET
- **Description**: Récupère la configuration actuelle du service cron.
- **Authentification** : Nécessite une session valide et un jeton CSRF
- **Réponse** :

  ```json
  {
    "cronExpression": "*/20 * * * *",
    "enabled": true
  }
  ```

- **Réponses d'erreur**:
  - `500`: Échec de l'obtention de la configuration cron
- **Notes**:
  - Retourne la configuration actuelle du service cron
  - Inclut l'expression cron et le statut activé
  - Utilisé pour la gestion du service cron

## Mettre à jour la configuration Cron - `/api/cron-config` {/* #update-cron-configuration---apicron-config */}
- **Endpoint**: `/api/cron-config`
- **Méthode**: POST
- **Description**: Met à jour la configuration du service cron.
- **Authentification**: Requiert une session valide et un jeton CSRF
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

- **Intervalles disponibles**: `"disabled"`, `"1min"`, `"5min"`, `"10min"`, `"15min"`, `"20min"`, `"30min"`, `"1hour"`, `"2hours"`
- **Réponses d'erreur**:
  - `400`: L'intervalle est requis
  - `500`: Échec de la mise à jour de la configuration cron
- **Notes**:
  - Met à jour la configuration du service cron
  - Valide l'intervalle par rapport aux options autorisées
  - Affecte la fréquence de vérification des sauvegardes en retard

## Proxy du service Cron - `/api/cron/*` {/* #cron-service-proxy---apicron */}
- **Endpoint**: `/api/cron/*`
- **Méthode**: GET, POST
- **Description**: Transmet les requêtes au service cron. Cet endpoint transmet toutes les requêtes au service cron fonctionnant sur un port séparé.
- **Authentification**: Requiert une session valide et un jeton CSRF. GET est autorisé pour les utilisateurs authentifiés; POST (démarrer/arrêter/déclencher/recharger) nécessite un administrateur.
- **Paramètres**:
  - `*`: Tout chemin qui sera transmis au service cron
- **Réponse**: Dépend de l'endpoint du service cron qui est accédé
- **Réponse d'erreur** (503):

  ```json
  {
    "error": "Cron service is not running",
    "message": "The cron service is not available. Please start it with: npm run cron:start"
  }
  ```

- **Notes**:
  - Transmet les requêtes au service cron sur `127.0.0.1`
  - Transmet `CRON_SERVICE_SECRET` comme `X-Cron-Service-Secret` quand défini
  - Retourne 503 si le service cron n'est pas disponible
  - Prend en charge les méthodes GET et POST
  - Utilisé pour la gestion du service cron depuis l'interface web
  - `POST /trigger/daily-summary-dispatch` est rejeté par le service cron; utilisez `/api/configuration/daily-summary/send` à la place
  - `POST /trigger/database-compact` exécute le compact hebdomadaire immédiatement (sauvegardes orphelines/serveurs et paramètres de notification, ainsi que SQLite `VACUUM`)
