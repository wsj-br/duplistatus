# Authentification et sécurité {/* #authentication--security */}

L'API utilise une combinaison d'authentification basée sur les sessions et de protection CSRF pour toutes les opérations d'écriture en base de données afin d'empêcher les accès non autorisés et les potentielles attaques par déni de service. Les API externes utilisées par Duplicati et Homepage restent exemptées de CSRF. Elles peuvent éventuellement exiger une clé API restreinte (portée) et/ou une liste d'adresses IP autorisées (toutes deux désactivées par défaut). `/api/upload` dispose également d'une limite configurable pour la taille du corps et pour le débit.

## Authentification basée sur les sessions {/* #session-based-authentication */}

Les points de terminaison protégés nécessitent un cookie de session valide et un jeton CSRF. Le système de session fournit une authentification sécurisée pour toutes les opérations protégées.

### Gestion des sessions {/* #session-management */}
1. **Créer une session** : POST vers `/api/session` pour créer une nouvelle session
2. **Obtenir un jeton CSRF** : GET `/api/csrf` pour obtenir un jeton CSRF pour la session
3. **Inclure dans les requêtes** : envoyer le cookie de session et le jeton CSRF avec les requêtes protégées
4. **Valider la session** : GET `/api/session` pour vérifier si la session est toujours valide
5. **Supprimer la session** : DELETE `/api/session` pour se déconnecter et effacer la session

### Protection CSRF {/* #csrf-protection */}
Toutes les opérations modifiant l'état nécessitent un jeton CSRF valide correspondant à la session actuelle. Le jeton CSRF doit être inclus dans l'en-tête `X-CSRF-Token` pour les points de terminaison protégés.

### Points de terminaison protégés {/* #protected-endpoints */}
Tous les points de terminaison modifiant les données de la base de données nécessitent une authentification par session et un jeton CSRF :

- **Gestion du serveur** : `/api/servers/:id` (PATCH, DELETE), `/api/servers/:id/server-url` (PATCH), `/api/servers/:id/password` (PATCH, GET)
- **Gestion de la configuration** : `/api/configuration/email` (GET, POST, DELETE), `/api/configuration/unified` (GET), `/api/configuration/ntfy` (GET), `/api/configuration/notifications` (GET, POST), `/api/configuration/backup-settings` (POST), `/api/configuration/templates` (POST), `/api/configuration/overdue-tolerance` (GET, POST), `/api/configuration/daily-summary` (GET, POST), `/api/configuration/daily-summary/send` (POST), `/api/configuration/daily-summary/retry` (POST), `/api/configuration/daily-summary/preview` (POST)
- **Système de notification** : `/api/notifications/test` (POST), `/api/notifications/preview` (POST), `/api/notification-channel-alerts` (GET, POST) - administrateur requis ; POST nécessite également un jeton CSRF
- **Configuration de Cron** : `/api/cron-config` (GET, POST)
- **Proxy Cron** : `/api/cron/*` (GET, POST) - relaie les requêtes vers le service cron. POST nécessite un administrateur. Le processus cron écoute sur `127.0.0.1` par défaut ; les routes de modification du service cron nécessitent `X-Cron-Service-Secret` lorsque `CRON_SERVICE_SECRET` est défini.
- **Gestion des sessions** : `/api/session` (POST, GET, DELETE), `/api/csrf` (GET)
- **Données graphiques** : `/api/chart-data/*` (GET)
- **Tableau de bord** : `/api/dashboard` (GET)
- **Détails du serveur** : `/api/servers` (GET), `/api/servers/:id` (GET), `/api/detail/:serverId` (GET)
- **Journal d'audit** : `/api/audit-log` (GET), `/api/audit-log/download` (GET), `/api/audit-log/filters` (GET), `/api/audit-log/retention` (PATCH), `/api/audit-log/cleanup` (POST) - droits administrateur requis pour les opérations d'écriture
- **Gestion des utilisateurs** : `/api/users` (GET, POST, PATCH, DELETE) - droits administrateur requis
- **Gestion de la base de données** : `/api/database/backup` (GET), `/api/database/restore` (POST) - droits administrateur requis
- **Journaux de l'application** : `/api/application-logs` (GET), `/api/application-logs/export` (GET) - droits administrateur requis
- **Collecte des sauvegardes** : `/api/backups/collect` (POST) - nécessite une session et un jeton CSRF
- **Synchronisation du calendrier des sauvegardes** : `/api/backups/sync-schedule` (POST) - nécessite une session et un jeton CSRF
- **Vérification des retards** : `/api/notifications/check-overdue` (POST) - nécessite une session et un jeton CSRF
- **Effacement des horodatages de retard** : `/api/notifications/clear-overdue-timestamps` (POST) - nécessite une session et un jeton CSRF

### Points de terminaison externes {/* #external-endpoints */}
Ces routes n'utilisent ni cookies de session ni CSRF. L'authentification est facultative et se configure dans Paramètres :

- `/api/upload` - Téléchargements de données de sauvegarde depuis Duplicati (clé avec portée de téléversement, limites de taille et de débit)
- `/api/lastbackup/:serverId` - Dernier état de sauvegarde (clé avec portée de lecture)
- `/api/lastbackups/:serverId` - Dernier état des sauvegardes (clé avec portée de lecture)
- `/api/summary` - Données récapitulatives globales (clé avec portée de lecture)
- `/api/health` - Point de terminaison de contrôle d'intégrité (sans clé ; vérification SQLite légère ; limite de débit par IP)
- `/api/ping` - Test de connectivité (sans clé ; limite de débit par IP)

Quand **Exiger des clés API** est désactivé, les quatre premières routes acceptent les requêtes avec ou sans clé : une clé valide avec une portée correspondante est enregistrée ; une mauvaise clé est ignorée. Quand l'option est activée, elles renvoient `401` sans clé valide et `403` lorsque la portée de la clé ne correspond pas. `/api/health` et `/api/ping` n'utilisent jamais de clés. Consultez [Clés API](../user-guide/settings/api-keys-settings.md) et [Liste d'adresses IP autorisées](../user-guide/settings/ip-allowlist-settings.md).

### Exemple d'utilisation (Session + CSRF) {/* #usage-example-session--csrf */}

```typescript
// 1. Create session
const sessionResponse = await fetch('/api/session', { method: 'POST' });
const { sessionId } = await sessionResponse.json();

// 2. Get CSRF token
const csrfResponse = await fetch('/api/csrf', {
  headers: { 'Cookie': `session=${sessionId}` }
});
const { csrfToken } = await csrfResponse.json();

// 3. Make protected request
const response = await fetch('/api/servers/server-id', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken,
    'Cookie': `session=${sessionId}`
  },
  body: JSON.stringify({
    alias: 'Updated Server Name',
    note: 'Updated notes'
  })
});
```

## Points de terminaison d'authentification {/* #authentication-endpoints */}

### Connexion - `/api/auth/login` {/* #login---apiauthlogin */}
- **Point de terminaison** : `/api/auth/login`
- **Méthode** : POST
- **Description** : Authentifie un utilisateur et crée une session. Prend en charge le verrouillage du compte après des tentatives infructueuses et les exigences de changement de mot de passe.
- **Authentification** : Nécessite une session valide et un jeton CSRF (mais aucun utilisateur connecté)
- **Corps de la requête** :

  ```json
  {
    "username": "admin",
    "password": "password123"
  }
  ```

- **Réponse** (succès) :

  ```json
  {
    "success": true,
    "user": {
      "id": "user-id",
      "username": "admin",
      "isAdmin": true,
      "mustChangePassword": false
    },
    "keyChanged": false
  }
  ```

- **Réponses d'erreur** : Toutes les réponses d'erreur incluent `error` (message en anglais) et `errorCode` (code stable pour la traduction côté client).
  - `400` : Nom d'utilisateur ou mot de passe manquant — `errorCode: "REQUIRED_CREDENTIALS"`
  - `401` : Nom d'utilisateur ou mot de passe incorrect — `errorCode: "INVALID_CREDENTIALS"`
  - `403` : Compte verrouillé en raison de trop nombreuses tentatives de connexion échouées — `errorCode: "ACCOUNT_LOCKED"` (inclut `lockedUntil`, `minutesRemaining`)
  - `500` : Erreur interne du serveur — `errorCode: "INTERNAL_ERROR"`
  - `503` : Base de données non prête — `errorCode: "DATABASE_NOT_READY"`
- **Remarques** :
  - Le compte est verrouillé après 5 tentatives de connexion échouées pendant 15 minutes
  - Les tentatives de connexion échouées sont suivies et journalisées
  - Le cookie de session est automatiquement défini dans la réponse
  - Si l'utilisateur a le drapeau `mustChangePassword` activé, il doit être redirigé vers la page de changement de mot de passe
  - Toutes les tentatives de connexion (réussies et échouées) sont enregistrées dans le journal d'audit

### Déconnexion - `/api/auth/logout` {/* #logout---apiauthlogout */}
- **Point de terminaison** : `/api/auth/logout`
- **Méthode** : POST
- **Description** : Déconnecte l'utilisateur actuel et détruit sa session.
- **Authentification** : Nécessite une session valide et un jeton CSRF
- **Réponse** (succès) :

  ```json
  {
    "success": true,
    "message": "Logged out successfully",
    "successCode": "LOGGED_OUT"
  }
  ```

- **Réponses d'erreur** : Inclut `error` et `errorCode` pour la traduction côté client.
  - `400` : Aucune session active — `errorCode: "NO_ACTIVE_SESSION"`
  - `500` : Erreur interne du serveur — `errorCode: "INTERNAL_ERROR"`
- **Remarques** :
  - Le cookie de session est effacé dans la réponse
  - La déconnexion est enregistrée dans le journal d'audit
  - La session est immédiatement invalidée

### Obtenir l'utilisateur actuel - `/api/auth/me` {/* #get-current-user---apiauthme */}
- **Point de terminaison** : `/api/auth/me`
- **Méthode** : GET
- **Description** : Renvoie les informations de l'utilisateur authentifié actuel, ou indique si aucun utilisateur n'est connecté.
- **Authentification** : Nécessite une session valide (mais aucun utilisateur connecté n'est requis)
- **Réponse** (authentifié) :

  ```json
  {
    "authenticated": true,
    "user": {
      "id": "user-id",
      "username": "admin",
      "isAdmin": true,
      "mustChangePassword": false
    }
  }
  ```

- **Réponse** (non authentifié) :

  ```json
  {
    "authenticated": false,
    "user": null
  }
  ```

- **Réponses d'erreur** : Inclut `error` et `errorCode` pour la traduction côté client.
  - `500` : Erreur interne du serveur — `errorCode: "INTERNAL_ERROR"`
- **Remarques** :
  - Peut être appelé sans utilisateur connecté (retourne `authenticated: false`)
  - Utile pour vérifier l'état d'authentification au chargement de la page

### Changer de mot de passe - `/api/auth/change-password` {/* #change-password---apiauthchange-password */}
- **Point de terminaison** : `/api/auth/change-password`
- **Méthode** : POST
- **Description** : Modifie le mot de passe de l'utilisateur authentifié actuel. Si `mustChangePassword` est défini, la vérification du mot de passe actuel est ignorée.
- **Authentification** : Nécessite une session valide et un jeton CSRF (utilisateur connecté requis)
- **Corps de la requête** :

  ```json
  {
    "currentPassword": "old-password",
    "newPassword": "new-secure-password"
  }
  ```

- `currentPassword` : facultatif si `mustChangePassword` est vrai, obligatoire sinon
  - `newPassword` : obligatoire, doit respecter les exigences de la stratégie de mot de passe
- **Réponse** (succès) :

  ```json
  {
    "success": true,
    "message": "Password changed successfully",
    "successCode": "PASSWORD_CHANGED"
  }
  ```

- **Réponses d'erreur** : Inclut `error` et `errorCode` pour la traduction côté client. La violation de politique peut inclure `validationErrors` (tableau de chaînes).
  - `400` : Nouveau mot de passe manquant — `errorCode: "NEW_PASSWORD_REQUIRED"`
  - `400` : Violation de la politique de mot de passe — `errorCode: "POLICY_NOT_MET"` (peut inclure `validationErrors`)
  - `400` : Nouveau mot de passe identique à l'actuel — `errorCode: "NEW_PASSWORD_SAME_AS_CURRENT"`
  - `401` : Le mot de passe actuel est incorrect — `errorCode: "CURRENT_PASSWORD_INCORRECT"`
  - `404` : Utilisateur introuvable — `errorCode: "USER_NOT_FOUND"`
  - `500` : Erreur interne du serveur — `errorCode: "INTERNAL_ERROR"`
- **Remarques** :
  - Le nouveau mot de passe doit respecter les exigences de la politique de mot de passe (longueur, complexité, etc.)
  - Si le drapeau `mustChangePassword` est activé, la vérification du mot de passe actuel est ignorée
  - Après un changement de mot de passe réussi, le drapeau `mustChangePassword` est désactivé
  - Les modifications de mot de passe sont enregistrées dans le journal d'audit
  - Le nouveau mot de passe doit être différent du mot de passe actuel

### Vérifier Doit changer de mot de passe pour l'Admin - `/api/auth/admin-must-change-password` {/* #check-admin-must-change-password---apiauthadmin-must-change-password */}
- **Endpoint** : `/api/auth/admin-must-change-password`
- **Méthode** : GET
- **Description** : Vérifie si l'utilisateur administrateur doit changer son mot de passe. Cet endpoint est public (aucune authentification requise) car il renvoie uniquement un indicateur booléen.
- **Réponse** :

  ```json
  {
    "mustChangePassword": false
  }
  ```

- **Réponses d'erreur** :
  - `500` : Erreur interne du serveur (retourne `mustChangePassword: false` en cas d'erreur pour éviter d'afficher l'astuce s'il y a un problème de base de données)
- **Remarques** :
  - Point de terminaison public, aucune authentification requise
  - Retourne `false` si l'utilisateur administrateur n'existe pas
  - Utilisé pour déterminer si l'astuce de changement de mot de passe doit être affichée
  - En cas d'erreur, retourne `false` pour éviter d'afficher l'astuce s'il y a un problème de base de données

### Obtenir la politique de mot de passe - `/api/auth/password-policy` {/* #get-password-policy---apiauthpassword-policy */}
- **Endpoint** : `/api/auth/password-policy`
- **Méthode** : GET
- **Description** : Renvoie la configuration actuelle de la politique de mot de passe. Cet endpoint est public (aucune authentification requise) car il est nécessaire pour la validation côté frontend.
- **Réponse** :

  ```json
  {
    "minLength": 8,
    "requireUppercase": true,
    "requireLowercase": true,
    "requireNumbers": true,
    "requireSpecialChars": false
  }
  ```

- **Réponses d'erreur** : Inclut `error` et `errorCode` pour la traduction côté client.
  - `500` : Échec de la récupération de la politique de mot de passe — `errorCode: "POLICY_RETRIEVE_FAILED"`
- **Remarques** :
  - Point de terminaison public, aucune authentification requise
  - Utilisé par les composants frontal pour afficher les exigences de mot de passe et valider les mots de passe avant soumission
  - La politique est configurée via des variables d'environnement (`PWD_ENFORCE`, `PWD_MIN_LEN`)
  - La vérification par défaut du mot de passe (empêchant l'utilisation du mot de passe administrateur par défaut) est toujours appliquée quelle que soit la configuration de la politique

### Codes d'erreur et de succès de l'API d'authentification (i18n) {/* #auth-api-error-and-success-codes-i18n */}

Les endpoints d'authentification renvoient un `errorCode` stable (et, en cas de succès, `successCode`) en plus du champ `error` ou `message` lisible par l'utilisateur. Les valeurs `error` et `message` sont en anglais. Les clients doivent utiliser les codes pour rechercher les chaînes localisées afin que l'interface utilisateur affiche les messages dans la langue sélectionnée par l'utilisateur.

| Endpoint | Code de succès | Codes d'erreur |
|----------|--------------|-------------|
| `/api/auth/login` | — | `REQUIRED_CREDENTIALS`, `INVALID_CREDENTIALS`, `ACCOUNT_LOCKED`, `DATABASE_NOT_READY`, `INTERNAL_ERROR` |
| `/api/auth/logout` | `LOGGED_OUT` | `NO_ACTIVE_SESSION`, `INTERNAL_ERROR` |
| `/api/auth/me` | — | `INTERNAL_ERROR` |
| `/api/auth/change-password` | `PASSWORD_CHANGED` | `NEW_PASSWORD_REQUIRED`, `POLICY_NOT_MET`, `USER_NOT_FOUND`, `CURRENT_PASSWORD_INCORRECT`, `NEW_PASSWORD_SAME_AS_CURRENT`, `INTERNAL_ERROR` |
| `/api/auth/password-policy` | — | `POLICY_RETRIEVE_FAILED` |

### Réponses d'erreur {/* #error-responses */}
- `401 Unauthorized` : Session non valide ou manquante, session expirée ou échec de la validation du jeton CSRF
- `403 Forbidden` : Échec de la validation du jeton CSRF ou opération non autorisée

:::caution
 N'exposez pas le serveur **duplistatus** à l'Internet public. Utilisez-le sur un réseau sécurisé 
(par exemple, un réseau local protégé par un pare-feu).

Exposer l'interface **duplistatus** à l'Internet public
 sans mesures de sécurité appropriées pourrait entraîner un accès non autorisé.
:::
