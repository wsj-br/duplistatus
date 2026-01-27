# Gestion de la gestion du service Cron {#cron-service-management}

## Obtenir la configuration Cron - `/api/cron-config` {#get-cron-configuration-apicron-config}

- **Point de terminaison**: `/api/cron-config`
- **Méthode**: GET
- **Description**: Récupère la configuration actuelle du service cron.
- **Réponse**:
  ```json
  {
    "cronExpression": "*/20 * * * *",
    "enabled": true
  }
  ```
- **Réponses d'erreur**:
  - `500`: Échec de la récupération de la configuration cron
- **Notes**:
  - Retourne la configuration actuelle du service cron
  - Inclut l'expression cron et le statut activé
  - Utilisé pour la gestion du service cron

## Mettre à jour la configuration Cron - `/api/cron-config` {#update-cron-configuration-apicron-config}

- **Point de terminaison**: `/api/cron-config`
- **Méthode**: POST
- **Description**: Met à jour la configuration du service cron.
- **Authentification**: Nécessite une session valide et un jeton CSRF
- **Corps de la demande**:
  ```json
  {
    "interval": "20min"
  }
  ```
- **Réponse**:
  ```json
  {
    "success": true
  }
  ```
- **Intervalles disponibles**: `"disabled"`, `"1min"`, `"5min"`, `"10min"`, `"15min"`, `"20min"`, `"30min"`, `"1hour"`, `"2hours"`
- **Réponses d'erreur**:
  - `401`: Non autorisé - Session invalide ou jeton CSRF
  - `400`: L'intervalle est requis
  - `500`: Échec de la mise à jour de la configuration cron
- **Notes**:
  - Met à jour la configuration du service cron
  - Valide l'intervalle par rapport aux options autorisées
  - Affecte la fréquence de vérification des sauvegardes en retard

## Proxy du service Cron - `/api/cron/*` {#cron-service-proxy-apicron}

- **Point de terminaison**: `/api/cron/*`
- **Méthode**: GET, POST
- **Description**: Proxifie les demandes au service cron. Ce point de terminaison transfère toutes les demandes au service cron s'exécutant sur un port séparé.
- **Paramètres**:
  - `*`: N'importe quel chemin qui sera transféré au service cron
- **Réponse**: Dépend du point de terminaison du service cron accédé
- **Réponse d'erreur** (503):
  ```json
  {
    "error": "Cron service is not running",
    "message": "The cron service is not available. Please start it with: npm run cron:start"
  }
  ```
- **Notes**:
  - Proxifie les demandes au service cron
  - Retourne 503 si le service cron n'est pas disponible
  - Supporte les méthodes GET et POST
