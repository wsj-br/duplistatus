---
translation_last_updated: '2026-05-06T23:19:15.525Z'
source_file_mtime: '2026-05-06T23:18:51.410Z'
source_file_hash: 66a1b7eaf428ec3f6c61417ebd66dea5bc97cfbf726189d73e18416a1b92be0c
translation_language: fr
source_file_path: documentation/docs/api-reference/authentication-security.md
translation_models:
  - anthropic/claude-haiku-4.5
  - qwen/qwen3-235b-a22b-2507
---
# Authentification et sécurité {#authentication-security}

L'API utilise une combinaison d'authentification basée sur des sessions et de protection CSRF pour toutes les opérations d'écriture dans la base de données afin d'éviter les accès non autorisés et les attaques par déni de service potentielles. Les API externes (utilisées par Duplicati) restent non authentifiées pour des raisons de compatibilité.

## Authentification basée sur les sessions {#session-based-authentication}

Les points de terminaison protégés nécessitent un cookie de session valide et un jeton CSRF. Le système de session assure une authentification sécurisée pour toutes les opérations protégées.

### Gestion des sessions {#session-management}
1. **Créer une session** : POST vers `/api/session` pour créer une nouvelle session
2. **Obtenir le jeton CSRF** : GET `/api/csrf` pour obtenir un jeton CSRF pour la session
3. **Inclure dans les requêtes** : Envoyer le cookie de session et le jeton CSRF avec les requêtes protégées
4. **Valider la session** : GET `/api/session` pour vérifier si la session est toujours valide
5. **Supprimer la session** : DELETE `/api/session` pour se déconnecter et effacer la session

### Protection CSRF {#csrf-protection}
Toutes les opérations modifiant l'état nécessitent un jeton CSRF valide correspondant à la session en cours. Le jeton CSRF doit être inclus dans l'en-tête `X-CSRF-Token` pour les points de terminaison protégés.

### Points de terminaison protégés {#protected-endpoints}
Tous les points de terminaison qui modifient les données de la base nécessitent une authentification de session et un jeton CSRF :

- **Gestion du serveur** : `/api/servers/:id` (PATCH, DELETE), `/api/servers/:id/server-url` (PATCH), `/api/servers/:id/password` (PATCH, GET)
- **Gestion de la configuration** : `/api/configuration/email` (GET, POST, DELETE), `/api/configuration/unified` (GET), `/api/configuration/ntfy` (GET), `/api/configuration/notifications` (GET, POST), `/api/configuration/backup-settings` (POST), `/api/configuration/templates` (POST), `/api/configuration/overdue-tolerance` (GET, POST)
- **Système de notifications** : `/api/notifications/test` (POST)
- **Configuration Cron** : `/api/cron-config` (GET, POST)
- **Proxy Cron** : `/api/cron/*` (GET, POST) - transmet les requêtes au service cron
- **Gestion des sessions** : `/api/session` (POST, GET, DELETE), `/api/csrf` (GET)
- **Données des graphiques** : `/api/chart-data/*` (GET)
- **Tableau de bord** : `/api/dashboard` (GET)
- **Détails du serveur** : `/api/servers` (GET), `/api/servers/:id` (GET), `/api/detail/:serverId` (GET)
- **Journal d'audit** : `/api/audit-log` (GET), `/api/audit-log/download` (GET), `/api/audit-log/filters` (GET), `/api/audit-log/retention` (PATCH), `/api/audit-log/cleanup` (POST) - administrateur requis pour les opérations d'écriture
- **Gestion des utilisateurs** : `/api/users` (GET, POST, PATCH, DELETE) - administrateur requis
- **Gestion de la base de données** : `/api/database/backup` (GET), `/api/database/restore` (POST) - administrateur requis
- **Journaux de l'application** : `/api/application-logs` (GET), `/api/application-logs/export` (GET) - administrateur requis
- **Collection de sauvegarde** : `/api/backups/collect` (POST) - nécessite une session et un jeton CSRF
- **Synchronisation de l'horaire de sauvegarde** : `/api/backups/sync-schedule` (POST) - nécessite une session et un jeton CSRF
- **Vérification en retard** : `/api/notifications/check-overdue` (POST) - nécessite une session et un jeton CSRF
- **Effacer les horodatages en retard** : `/api/notifications/clear-overdue-timestamps` (POST) - nécessite une session et un jeton CSRF

### Points de terminaison non protégés {#unprotected-endpoints}
Les API externes restent non authentifiées pour l'intégration avec Duplicati :

- `/api/upload` - Téléversement des données de sauvegarde depuis Duplicati
- `/api/lastbackup/:serverId` - Statut de la dernière sauvegarde
- `/api/lastbackups/:serverId` - Statut des dernières sauvegardes
- `/api/summary` - Données récapitulatives générales
- `/api/health` - Point de terminaison de vérification de santé

### Exemple d'utilisation (Session + CSRF) {#usage-example-session--csrf}

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

## Points de terminaison d'authentification {#authentication-endpoints}

### Connexion - `/api/auth/login` {#login---apiauthlogin}
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
  - `401` : Nom d'utilisateur ou mot de passe invalide — `errorCode: "INVALID_CREDENTIALS"`
  - `403` : Compte verrouillé en raison de trop nombreuses tentatives de connexion échouées — `errorCode: "ACCOUNT_LOCKED"` (inclut `lockedUntil`, `minutesRemaining`)
  - `500` : Erreur interne du serveur — `errorCode: "INTERNAL_ERROR"`
  - `503` : Base de données non prête — `errorCode: "DATABASE_NOT_READY"`
- **Remarques** :
  - Le compte est verrouillé après 5 tentatives de connexion échouées pendant 15 minutes
  - Les tentatives de connexion ayant échoué sont suivies et enregistrées
  - Le cookie de session est automatiquement défini dans la réponse
  - Si l'utilisateur a le drapeau `mustChangePassword` activé, il doit être redirigé vers la page de changement de mot de passe
  - Toutes les tentatives de connexion (réussies et échouées) sont enregistrées dans le journal d'audit

### Déconnexion - `/api/auth/logout` {#logout---apiauthlogout}
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

- **Réponses d'erreur** : Incluent `error` et `errorCode` pour la traduction côté client.
  - `400` : Aucune session active — `errorCode: "NO_ACTIVE_SESSION"`
  - `500` : Erreur interne du serveur — `errorCode: "INTERNAL_ERROR"`
- **Notes** :
  - Le cookie de session est supprimé dans la réponse
  - La déconnexion est enregistrée dans le journal d'audit
  - La session est immédiatement invalidée

### Obtenir l'utilisateur actuel - `/api/auth/me` {#get-current-user---apiauthme}
- **Point de terminaison** : `/api/auth/me`
- **Méthode** : GET
- **Description** : Renvoie les informations de l'utilisateur authentifié actuel, ou indique s'il n'y a aucun utilisateur connecté.
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

- **Réponse** (non authentifié):

  ```json
  {
    "authenticated": false,
    "user": null
  }
  ```

- **Réponses d'erreur** : Incluent `error` et `errorCode` pour la traduction côté client.
  - `500` : Erreur interne du serveur — `errorCode: "INTERNAL_ERROR"`
- **Notes** :
  - Peut être appelé sans utilisateur connecté (renvoie `authenticated: false`)
  - Utile pour vérifier l'état d'authentification au chargement de la page

### Changer le mot de passe - `/api/auth/change-password` {#change-password---apiauthchange-password}
- **Point de terminaison** : `/api/auth/change-password`
- **Méthode** : POST
- **Description** : Change le mot de passe pour l'utilisateur authentifié actuel. Si `mustChangePassword` est défini, la vérification du mot de passe actuel est ignorée.
- **Authentification** : Nécessite une session valide et un jeton CSRF (utilisateur connecté requis)
- **Corps de la requête** :

  ```json
  {
    "currentPassword": "old-password",
    "newPassword": "new-secure-password"
  }
  ```

- `currentPassword` : Facultatif si `mustChangePassword` est vrai, obligatoire sinon
  - `newPassword` : Obligatoire, doit respecter les exigences de la politique de mot de passe
- **Réponse** (succès):

  ```json
  {
    "success": true,
    "message": "Password changed successfully",
    "successCode": "PASSWORD_CHANGED"
  }
  ```

- **Réponses d'erreur** : Incluent `error` et `errorCode` pour la traduction côté client. Une violation de politique peut inclure `validationErrors` (tableau de chaînes).
  - `400` : Nouveau mot de passe manquant — `errorCode: "NEW_PASSWORD_REQUIRED"`
  - `400` : Violation de la politique de mot de passe — `errorCode: "POLICY_NOT_MET"` (peut inclure `validationErrors`)
  - `400` : Le nouveau mot de passe est identique au mot de passe actuel — `errorCode: "NEW_PASSWORD_SAME_AS_CURRENT"`
  - `401` : Le mot de passe actuel est incorrect — `errorCode: "CURRENT_PASSWORD_INCORRECT"`
  - `404` : Utilisateur non trouvé — `errorCode: "USER_NOT_FOUND"`
  - `500` : Erreur interne du serveur — `errorCode: "INTERNAL_ERROR"`
- **Notes** :
  - Le nouveau mot de passe doit respecter les exigences de la politique de mot de passe (longueur, complexité, etc.)
  - Si le drapeau `mustChangePassword` est activé, la vérification du mot de passe actuel est ignorée
  - Après un changement de mot de passe réussi, le drapeau `mustChangePassword` est désactivé
  - Les modifications de mot de passe sont enregistrées dans le journal d'audit
  - Le nouveau mot de passe doit être différent du mot de passe actuel

### Vérifier si l'administrateur doit changer le mot de passe - `/api/auth/admin-must-change-password` {#check-admin-must-change-password---apiauthadmin-must-change-password}
- **Point de terminaison** : `/api/auth/admin-must-change-password`
- **Méthode** : GET
- **Description** : Vérifie si l'utilisateur administrateur doit changer son mot de passe. Ce point de terminaison est public (aucune authentification requise), car il renvoie uniquement un indicateur booléen.
- **Réponse** :

  ```json
  {
    "mustChangePassword": false
  }
  ```

- **Réponses d'erreur** :
  - `500` : Erreur interne du serveur (renvoie `mustChangePassword: false` en cas d'erreur pour éviter d'afficher l'indication en cas de problème de base de données)
- **Notes** :
  - Point de terminaison public, aucune authentification requise
  - Renvoie `false` si l'utilisateur administrateur n'existe pas
  - Utilisé pour déterminer si l'indication de changement de mot de passe doit être affichée
  - En cas d'erreur, renvoie `false` pour éviter d'afficher l'indication en cas de problème de base de données

### Obtenir la politique de mot de passe - `/api/auth/password-policy` {#get-password-policy---apiauthpassword-policy}
- **Point de terminaison** : `/api/auth/password-policy`
- **Méthode** : GET
- **Description** : Renvoie la configuration actuelle de la politique de mot de passe. Ce point de terminaison est public (aucune authentification requise), car il est nécessaire pour la validation côté interface.
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

- **Réponses d'erreur** : Incluent `error` et `errorCode` pour la traduction côté client.
  - `500` : Échec de la récupération de la politique de mot de passe — `errorCode: "POLICY_RETRIEVE_FAILED"`
- **Notes** :
  - Point de terminaison public, aucune authentification requise
  - Utilisé par les composants frontend pour afficher les exigences de mot de passe et valider les mots de passe avant soumission
  - La politique est configurée via des variables d'environnement (`PWD_ENFORCE`, `PWD_MIN_LEN`)
  - La vérification du mot de passe par défaut (empêchant l'utilisation du mot de passe administrateur par défaut) est toujours appliquée, indépendamment des paramètres de politique

### Codes d'erreur et de succès de l'API Auth (i18n) {#auth-api-error-and-success-codes-i18n}

Les points de terminaison d'authentification renvoient un `errorCode` stable (et, en cas de succès, un `successCode`) en plus du champ lisible par l'humain `error` ou `message`. Les valeurs `error` et `message` sont en anglais. Les clients doivent utiliser les codes pour rechercher les chaînes localisées afin que l'interface affiche les messages dans la langue sélectionnée par l'utilisateur.

| Point de terminaison | Code de succès | Codes d'erreur |
|----------|--------------|-------------|
| `/api/auth/login` | — | `REQUIRED_CREDENTIALS`, `INVALID_CREDENTIALS`, `ACCOUNT_LOCKED`, `DATABASE_NOT_READY`, `INTERNAL_ERROR` |
| `/api/auth/logout` | `LOGGED_OUT` | `NO_ACTIVE_SESSION`, `INTERNAL_ERROR` |
| `/api/auth/me` | — | `INTERNAL_ERROR` |
| `/api/auth/change-password` | `PASSWORD_CHANGED` | `NEW_PASSWORD_REQUIRED`, `POLICY_NOT_MET`, `USER_NOT_FOUND`, `CURRENT_PASSWORD_INCORRECT`, `NEW_PASSWORD_SAME_AS_CURRENT`, `INTERNAL_ERROR` |
| `/api/auth/password-policy` | — | `POLICY_RETRIEVE_FAILED` |

### Réponses d'erreur {#error-responses}
- `401 Unauthorized` : Session invalide ou manquante, session expirée, ou échec de la validation du jeton CSRF
- `403 Forbidden` : Échec de la validation du jeton CSRF ou opération non autorisée

:::caution
 N'exposez pas le serveur **duplistatus** à l'internet public. Utilisez-le dans un réseau sécurisé 
(par exemple, un réseau local protégé par un pare-feu).

Exposer l'interface **duplistatus** à l'internet public 
sans mesures de sécurité adéquates pourrait entraîner un accès non autorisé.
:::
