# Administration {/* #administration */}

## Collecter les sauvegardes - `/api/backups/collect` {/* #collect-backups---apibackupscollect */}
- **Endpoint**: `/api/backups/collect`
- **Méthode**: POST
- **Description**: Collecte les données de sauvegarde directement depuis un serveur Duplicati via son API. Cet endpoint détecte automatiquement le meilleur protocole de connexion (HTTPS avec validation SSL, HTTPS avec certificats auto-signés, ou HTTP en dernier recours) et se connecte au serveur Duplicati pour récupérer les informations de sauvegarde et les traiter dans la base de données locale.
- **Authentification**: Requiert une session valide et un jeton CSRF
- **Corps de la requête**:

  ```json
  {
    "hostname": "duplicati-server.local",
    "port": 8200,
    "password": "your-password",
    "downloadJson": false
  }
  ```

- **Réponse** :

  ```json
  {
    "success": true,
    "serverName": "Server Name",
    "serverAlias": "My Server",
    "stats": {
      "processed": 5,
      "skipped": 2,
      "errors": 0
    },
    "backupSettings": {
      "added": 2,
      "total": 7
    }
  }
  ```

- **Réponses d'erreur**:
  - `400`: Paramètres de requête invalides ou échec de connexion
  - `500`: Erreur du serveur lors de la collecte des sauvegardes
- **Notes**: 
  - L'endpoint détecte automatiquement le protocole de connexion optimal (HTTPS → HTTPS avec certificats auto-signés → HTTP)
  - Les tentatives de détection de protocole sont effectuées dans l'ordre de préférence de sécurité
  - Les délais de connexion sont configurables via des variables d'environnement
  - Les données collectées sont enregistrées dans les logs en mode développement pour le débogage
  - S'assure que les paramètres de sauvegarde sont complets pour tous les serveurs et sauvegardes
  - Utilise le port par défaut 8200 si non spécifié
  - Le protocole détecté et l'URL du serveur sont automatiquement stockés dans la base de données
  - `serverAlias` est récupéré depuis la base de données et peut être vide si aucun alias n'est défini
  - L'interface utilisateur doit utiliser `serverAlias || serverName` à des fins d'affichage
  - Prend en charge à la fois le téléchargement JSON et les méthodes de collecte API directe

## Nettoyer les sauvegardes - `/api/backups/cleanup` {/* #cleanup-backups---apibackupscleanup */}
- **Endpoint**: `/api/backups/cleanup`
- **Méthode**: POST
- **Description**: Supprime les données de sauvegarde anciennes en fonction de la période de rétention. Cet endpoint aide à gérer la taille de la base de données en supprimant les enregistrements de sauvegarde obsolètes tout en conservant les données récentes et importantes.
- **Authentification**: Requiert une session valide et un jeton CSRF
- **Corps de la requête**:

  ```json
  {
    "retentionPeriod": "6 months"
  }
  ```

- **Périodes de rétention**: `"6 months"`, `"1 year"`, `"2 years"`, `"Delete all data"`
- **Réponse**:

  ```json
  {
    "message": "Successfully deleted 15 old backups",
    "status": 200
  }
  ```

Pour l'option "Supprimer toutes les données":

  ```json
  {
    "message": "Successfully deleted all 15 backups and 3 servers, and cleared configuration settings",
    "status": 200
  }
  ```

- **Réponses d'erreur**:
  - `401`: Non autorisé - Session ou jeton CSRF invalide
  - `400`: Période de rétention spécifiée invalide
  - `500`: Erreur du serveur lors de l'opération de nettoyage avec des informations d'erreur détaillées
- **Notes**: 
  - L'opération de nettoyage est irréversible
  - Les données de sauvegarde sont supprimées définitivement de la base de données
  - Les enregistrements des machines sont préservés même si toutes les sauvegardes sont supprimées
  - Lorsque l'option "Supprimer toutes les données" est sélectionnée, toutes les machines et sauvegardes sont supprimées et la configuration est effacée
  - Le rapport d'erreur amélioré inclut des détails et une trace de pile en mode développement
  - Prend en charge à la fois la rétention basée sur le temps et la suppression complète des données

## Supprimer la tâche de sauvegarde - `/api/backups/delete-job` {/* #delete-backup-job---apibackupsdelete-job */}
- **Endpoint**: `/api/backups/delete-job`
- **Méthode**: DELETE
- **Description**: Supprime tous les enregistrements de sauvegarde pour une combinaison spécifique de serveur-sauvegarde. Cet endpoint n'est disponible que en mode développement.
- **Authentification**: Requiert une session valide et un jeton CSRF
- **Corps de la requête**:

  ```json
  {
    "serverId": "server-id",
    "backupName": "Backup Name"
  }
  ```

- **Réponse** :

  ```json
  {
    "message": "Successfully deleted 5 backup record(s) for \"Files\" from server \"My Server\"",
    "status": 200,
    "deletedCount": 5,
    "serverName": "My Server",
    "backupName": "Files"
  }
  ```

- **Réponses d'erreur**:
  - `401`: Non autorisé - Session ou jeton CSRF invalide
  - `403`: La suppression de la tâche de sauvegarde n'est disponible qu'en mode développement
  - `400`: L'ID du serveur et le nom de la sauvegarde sont requis
  - `404`: Aucune sauvegarde trouvée à supprimer
  - `500`: Erreur du serveur lors de la suppression avec des informations d'erreur détaillées
- **Notes**: 
  - Cette opération n'est disponible qu'en mode développement
  - Cette opération est irréversible
  - Tous les enregistrements de sauvegarde pour la combinaison serveur-sauvegarde spécifiée seront définitivement supprimés
  - Retourne le nombre de sauvegardes supprimées et les informations du serveur
  - Utilise l'alias du serveur pour l'affichage si disponible, sinon utilise le nom du serveur

## Synchroniser les horaires de sauvegarde - `/api/backups/sync-schedule` {/* #sync-backup-schedules---apibackupssync-schedule */}
- **Endpoint**: `/api/backups/sync-schedule`
- **Méthode**: POST
- **Description**: Synchronise les informations d'horaire de sauvegarde à partir d'un serveur Duplicati. Cet endpoint se connecte au serveur, récupère les informations d'horaire pour toutes les sauvegardes et met à jour les paramètres locaux de sauvegarde avec les détails d'horaire, y compris les intervalles de répétition, les jours de la semaine autorisés et les heures de sauvegarde.
- **Authentification**: Requiert une session valide et un jeton CSRF
- **Corps de la requête**:

  ```json
  {
    "hostname": "duplicati-server.local",
    "port": 8200,
    "password": "your-password",
    "serverId": "optional-server-id"
  }
  ```

Ou avec uniquement serverId (utilise le mot de passe stocké):

  ```json
  {
    "serverId": "server-id"
  }
  ```

Ou avec serverId et des identifiants mis à jour:

  ```json
  {
    "serverId": "server-id",
    "hostname": "new-hostname.local",
    "port": 8200,
    "password": "new-password"
  }
  ```

- **Réponse** :

  ```json
  {
    "success": true,
    "serverName": "Server Name",
    "stats": {
      "processed": 5,
      "errors": 0
    }
  }
  ```

Avec erreurs:

  ```json
  {
    "success": true,
    "serverName": "Server Name",
    "stats": {
      "processed": 3,
      "errors": 2
    },
    "errors": [
      "Backup Name 1: Error message",
      "Backup Name 2: Error message"
    ]
  }
  ```

- **Réponses d'erreur**:
  - `400`: Paramètres de requête invalides, nom d'hôte/mot de passe manquant lorsque serverId n'est pas fourni, ou échec de connexion
  - `404`: Serveur introuvable (quand serverId est fourni) ou aucun mot de passe stocké pour le serveur
  - `500`: Erreur de serveur pendant la synchronisation des horaires
- **Notes**: 
  - L'endpoint détecte automatiquement le protocole de connexion optimal (HTTPS → HTTPS avec certificat auto-signé → HTTP)
  - Peut être appelé avec uniquement serverId pour utiliser les identifiants du serveur stockés
  - Peut être appelé avec serverId et de nouveaux identifiants pour mettre à jour les détails de connexion du serveur
  - Peut être appelé avec nom d'hôte/port/mot de passe sans serverId pour les nouveaux serveurs
  - Met à jour les paramètres de sauvegarde avec les informations d'horaire, y compris:
    - `expectedInterval`: L'intervalle de répétition (par exemple, "Quotidien", "Hebdomadaire", "Mensuel")
    - `allowedWeekDays`: Tableau des jours de la semaine autorisés (0=Dimanche, 1=Lundi, etc.)
    - `time`: L'heure programmée pour la sauvegarde
  - Traite toutes les sauvegardes trouvées sur le serveur
  - Retourne des statistiques sur les sauvegardes traitées et les erreurs rencontrées
  - Enregistre les événements d'audit pour les opérations de synchronisation réussies et échouées
  - Utilise le port par défaut 8200 si non spécifié

## Tester la connexion au serveur - `/api/servers/test-connection` {/* #test-server-connection---apiserverstest-connection */}
- **Endpoint**: `/api/servers/test-connection`
- **Méthode**: POST
- **Description**: Teste la connexion à un serveur Duplicati pour vérifier qu'il est accessible.
- **Corps de la requête**:

  ```json
  {
    "server_url": "http://localhost:8200"
  }
  ```

- **Réponse** :

  ```json
  {
    "success": true,
    "message": "Connection successful"
  }
  ```

- **Réponses d'erreur**:
  - `400`: Format d'URL invalide ou URL du serveur manquante
  - `500`: Erreur de serveur pendant le test de connexion
- **Notes**: 
  - L'endpoint valide le format de l'URL et teste la connectivité
  - Retourne un succès si le serveur répond avec un statut 401 (attendu pour l'endpoint de connexion sans identifiants)
  - Teste la connexion à l'endpoint de connexion du serveur Duplicati
  - Prend en charge les protocoles HTTP et HTTPS
  - Utilise la configuration de délai d'attente pour le test de connexion

## Obtenir l'URL du serveur - `/api/servers/:serverId/server-url` {/* #get-server-url---apiserversserveridserver-url */}
- **Endpoint**: `/api/servers/:serverId/server-url`
- **Méthode**: GET
- **Description**: Récupère l'URL du serveur pour un serveur spécifique.
- **Paramètres**:
  - `serverId`: l'identifiant du serveur

- **Réponse** :

  ```json
  {
    "serverId": "server-id",
    "server_url": "http://localhost:8200"
  }
  ```

- **Réponses d'erreur**:
  - `404`: Serveur introuvable
  - `500`: Erreur de serveur
- **Notes**:
  - Retourne l'URL du serveur pour un serveur spécifique
  - Utilisé pour la gestion des connexions de serveur
  - Retourne une chaîne vide si aucune URL de serveur n'est définie

## Mettre à jour l'URL du serveur - `/api/servers/:serverId/server-url` {/* #update-server-url---apiserversserveridserver-url */}
- **Endpoint**: `/api/servers/:serverId/server-url`
- **Méthode**: PATCH
- **Description**: Met à jour l'URL du serveur pour un serveur spécifique.
- **Authentification**: Nécessite une session valide et un jeton CSRF
- **Paramètres**:
  - `serverId`: l'identifiant du serveur
- **Corps de la requête**:

  ```json
  {
    "server_url": "http://localhost:8200"
  }
  ```

- **Réponse** :

  ```json
  {
    "message": "Server URL updated successfully",
    "serverId": "server-id",
    "serverName": "Server Name",
    "server_url": "http://localhost:8200"
  }
  ```

- **Réponses d'erreur**:
  - `401`: Non autorisé - Session ou jeton CSRF invalide
  - `400`: Format d'URL non valide
  - `404`: Serveur introuvable
  - `500`: Erreur de serveur lors de la mise à jour
- **Notes**: 
  - L'endpoint valide le format de l'URL avant la mise à jour
  - Les URL de serveur vides ou nulles sont autorisées
  - Prend en charge les protocoles HTTP et HTTPS
  - Retourne les informations du serveur mises à jour

## Obtenir le mot de passe du serveur - `/api/servers/:serverId/password` {/* #get-server-password---apiserversserveridpassword */}
- **Endpoint**: `/api/servers/:serverId/password`
- **Méthode**: GET
- **Description**: Récupère un jeton CSRF pour les opérations de mot de passe du serveur.
- **Authentification**: Nécessite une session valide
- **Paramètres**:
  - `serverId`: l'identifiant du serveur
- **Réponse**:

  ```json
  {
    "csrfToken": "csrf-token-string",
    "serverId": "server-id"
  }
  ```

- **Réponses d'erreur**:
  - `401`: Session invalide ou expirée
  - `500`: Échec de la génération du jeton CSRF
- **Notes**:
  - Retourne le jeton CSRF pour une utilisation avec les opérations de mise à jour du mot de passe
  - La session doit être valide pour générer le jeton

## Mettre à jour le mot de passe du serveur - `/api/servers/:serverId/password` {/* #update-server-password---apiserversserveridpassword */}
- **Endpoint**: `/api/servers/:serverId/password`
- **Méthode**: PATCH
- **Description**: Met à jour le mot de passe pour un serveur spécifique.
- **Authentification**: Nécessite une session valide et un jeton CSRF
- **Paramètres**:
  - `serverId`: l'identifiant du serveur
- **Corps de la requête**:

  ```json
  {
    "password": "new-password"
  }
  ```

- **Réponse** :

  ```json
  {
    "message": "Password updated successfully",
    "serverId": "server-id"
  }
  ```

- **Réponses d'erreur**:
  - `400`: Le mot de passe doit être une chaîne
  - `401`: Non autorisé - Session ou jeton CSRF invalide
  - `500`: Échec de la mise à jour du mot de passe
- **Notes**:
  - Le mot de passe peut être une chaîne vide pour effacer le mot de passe
  - Le mot de passe est stocké de manière sécurisée à l'aide du système de gestion des secrets

## Gestion des utilisateurs {/* #user-management */}

### Lister les utilisateurs - `/api/users` {/* #list-users---apiusers */}
- **Endpoint**: `/api/users`
- **Méthode**: GET
- **Description**: Liste tous les utilisateurs avec pagination et filtrage de recherche facultatif. Retourne les informations des utilisateurs, y compris l'historique de connexion et le statut du compte.
- **Authentification**: Nécessite des privilèges d'administrateur, une session valide et un jeton CSRF
- **Paramètres de requête**:
  - `page` (facultatif): Numéro de page (par défaut: 1)
  - `limit` (facultatif): Éléments par page (par défaut: 50)
  - `search` (facultatif) : Terme de recherche pour filtrer par nom d'utilisateur
- **Réponse** :

  ```json
  {
    "users": [
      {
        "id": "user-id",
        "username": "admin",
        "isAdmin": true,
        "mustChangePassword": false,
        "createdAt": "2024-01-01T00:00:00Z",
        "lastLoginAt": "2024-01-15T10:30:00Z",
        "lastLoginIp": "192.168.1.100",
        "failedLoginAttempts": 0,
        "lockedUntil": null,
        "isLocked": false
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 5,
      "totalPages": 1
    }
  }
  ```

- **Réponses d'erreur** :
  - `401` : Non autorisé - Session ou jeton CSRF invalide
  - `403` : Interdit - Privilèges d'administrateur requis
  - `500` : Erreur interne du serveur
- **Notes** :
  - Accessible uniquement aux utilisateurs administrateurs
  - Prise en charge de la pagination et du filtrage de recherche
  - Retourne le statut du compte utilisateur, y compris le statut de verrouillage

### Créer un utilisateur - `/api/users` {/* #create-user---apiusers */}
- **Endpoint** : `/api/users`
- **Méthode** : POST
- **Description** : Crée un nouveau compte utilisateur. Peut générer un mot de passe temporaire ou utiliser un mot de passe fourni.
- **Authentification**: Nécessite des privilèges d'administrateur, une session valide et un jeton CSRF
- **Corps de la requête**:

  ```json
  {
    "username": "newuser",
    "password": "optional-password",
    "isAdmin": false,
    "requirePasswordChange": true
  }
  ```

- `username` : Obligatoire, doit comporter 3 à 50 caractères, unique
  - `password` : Facultatif, si non fourni, un mot de passe temporaire sécurisé est généré
  - `isAdmin` : Facultatif, faux par défaut
  - `requirePasswordChange` : Facultatif, vrai par défaut
- **Réponse** :

  ```json
  {
    "user": {
      "id": "user-id",
      "username": "newuser",
      "isAdmin": false,
      "mustChangePassword": true
    },
    "temporaryPassword": "generated-password-123"
  }
  ```

- `temporaryPassword` n'est inclus que si un mot de passe a été généré automatiquement
- **Réponses d'erreur** :
  - `400` : Format de nom d'utilisateur invalide, violation de la politique de mot de passe ou erreurs de validation
  - `401` : Non autorisé - Session ou jeton CSRF invalide
  - `403` : Interdit - Privilèges d'administrateur requis
  - `409` : Le nom d'utilisateur existe déjà
  - `500` : Erreur interne du serveur
- **Notes** :
  - Accessible uniquement aux utilisateurs administrateurs
  - Le nom d'utilisateur est insensible à la casse et est stocké en minuscules
  - Si le mot de passe n'est pas fourni, un mot de passe de 12 caractères sécurisé est généré
  - Les mots de passe temporaires générés ne sont renvoyés qu'une seule fois dans la réponse
  - La création d'utilisateur est enregistrée dans le journal d'audit

### Mettre à jour l'utilisateur - `/api/users/:id` {/* #update-user---apiusersid */}
- **Endpoint** : `/api/users/:id`
- **Méthode** : PATCH
- **Description** : Met à jour les informations de l'utilisateur, y compris le nom d'utilisateur, le statut d'administrateur, la modification du mot de passe requise et la réinitialisation du mot de passe.
- **Authentification** : Nécessite des privilèges d'administrateur, une session valide et un jeton CSRF
- **Paramètres** :
  - `id` : ID de l'utilisateur à mettre à jour
- **Corps de la requête** :

  ```json
  {
    "username": "updated-username",
    "isAdmin": true,
    "requirePasswordChange": false,
    "resetPassword": true
  }
  ```

- Tous les champs sont facultatifs
  - `resetPassword` : Si vrai, génère un nouveau mot de passe temporaire et définit `requirePasswordChange` à vrai
- **Réponse** (avec réinitialisation du mot de passe) :

  ```json
  {
    "user": {
      "id": "user-id",
      "username": "updated-username",
      "isAdmin": true,
      "mustChangePassword": true
    },
    "temporaryPassword": "new-temp-password-456"
  }
  ```

- **Réponse** (sans réinitialisation du mot de passe) :

  ```json
  {
    "user": {
      "id": "user-id",
      "username": "updated-username",
      "isAdmin": true,
      "mustChangePassword": false
    }
  }
  ```

- **Réponses d'erreur** :
  - `400` : Entrée invalide ou erreurs de validation
  - `401` : Non autorisé - Session ou jeton CSRF invalide
  - `403` : Interdit - Privilèges d'administrateur requis
  - `404` : Utilisateur introuvable
  - `409` : Le nom d'utilisateur existe déjà (si changement de nom d'utilisateur)
  - `500` : Erreur interne du serveur
- **Notes** :
  - Accessible uniquement aux utilisateurs administrateurs
  - Les changements de nom d'utilisateur sont validés pour l'unicité
  - La réinitialisation du mot de passe génère un mot de passe temporaire sécurisé de 12 caractères
  - Toutes les modifications sont enregistrées dans le journal d'audit

### Supprimer l'utilisateur - `/api/users/:id` {/* #delete-user---apiusersid */}
- **Endpoint** : `/api/users/:id`
- **Méthode** : DELETE
- **Description** : Supprime un compte utilisateur. Empêche de supprimer soi-même ou le dernier compte administrateur.
- **Authentification** : Nécessite des privilèges d'administrateur, une session valide et un jeton CSRF
- **Paramètres** :
  - `id` : ID de l'utilisateur à supprimer
- **Réponse** :

  ```json
  {
    "success": true,
    "message": "User deleted successfully"
  }
  ```

- **Réponses d'erreur** :
  - `400` : Impossible de supprimer votre propre compte ou le dernier compte administrateur
  - `401` : Non autorisé - Session ou jeton CSRF invalide
  - `403` : Interdit - Privilèges d'administrateur requis
  - `404` : Utilisateur introuvable
  - `500` : Erreur interne du serveur
- **Remarques** :
  - Accessible uniquement aux utilisateurs administrateurs
  - Impossible de supprimer votre propre compte
  - Impossible de supprimer le dernier compte administrateur (au moins un administrateur doit rester)
  - La suppression d'utilisateurs est enregistrée dans le journal d'audit
  - Les sessions associées sont automatiquement supprimées (cascade)

## Gestion du journal d'audit {/* #audit-log-management */}

### Lister les journaux d'audit - `/api/audit-log` {/* #list-audit-logs---apiaudit-log */}
- **Point de terminaison** : `/api/audit-log`
- **Méthode** : GET
- **Description** : Récupère les entrées du journal d'audit avec des fonctionnalités de filtrage, de pagination et de recherche. Prend en charge à la fois la pagination basée sur les pages et la pagination basée sur les décalages.
- **Authentification** : Requiert une session et un jeton CSRF valides (utilisateur connecté requis)
- **Paramètres de requête** :
  - `page` (facultatif) : Numéro de page pour la pagination basée sur les pages
  - `offset` (facultatif) : Décalage pour la pagination basée sur les décalages (précède le numéro de page)
  - `limit` (facultatif) : Éléments par page (par défaut : 50)
  - `startDate` (facultatif) : Filtrer les journaux à partir de cette date (format ISO)
  - `endDate` (facultatif) : Filtrer les journaux jusqu'à cette date (format ISO)
  - `userId` (facultatif) : Filtrer par ID d'utilisateur
  - `username` (facultatif) : Filtrer par nom d'utilisateur
  - `action` (facultatif) : Filtrer par nom d'action
  - `category` (facultatif) : Filtrer par catégorie (`auth`, `user_management`, `config`, `backup`, `server`)
  - `status` (facultatif) : Filtrer par statut (`success`, `failure`, `error`)
- **Réponse** :

  ```json
  {
    "logs": [
      {
        "id": 1,
        "timestamp": "2024-01-15T10:30:00Z",
        "userId": "user-id",
        "username": "admin",
        "action": "login",
        "category": "auth",
        "targetType": "user",
        "targetId": "user-id",
        "status": "success",
        "ipAddress": "192.168.1.100",
        "userAgent": "Mozilla/5.0...",
        "details": {
          "is_admin": true
        },
        "errorMessage": null
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 150,
      "totalPages": 3
    }
  }
  ```

- **Réponses d'erreur** :
  - `401` : Non autorisé - Session ou jeton CSRF invalide
  - `500` : Erreur interne du serveur
- **Remarques** :
  - Prend en charge à la fois la pagination basée sur les pages (`page`) et la pagination basée sur les décalages (`offset`)
  - Le champ `details` contient un JSON analysé avec des informations contextuelles supplémentaires
  - Toutes les requêtes de journal d'audit sont enregistrées

### Obtenir les valeurs de filtre du journal d'audit - `/api/audit-log/filters` {/* #get-audit-log-filter-values---apiaudit-logfilters */}
- **Point de terminaison** : `/api/audit-log/filters`
- **Méthode** : GET
- **Description** : Récupère les valeurs de filtre uniques disponibles pour filtrer les journaux d'audit. Retourne toutes les actions, catégories et statuts distincts qui existent dans la base de données du journal d'audit. Utile pour remplir les listes déroulantes de filtres dans l'interface utilisateur.
- **Authentification** : Requiert une session et un jeton CSRF valides (utilisateur connecté requis)
- **Réponse** :

  ```json
  {
    "actions": [
      "login",
      "logout",
      "user_created",
      "user_updated",
      "config_updated"
    ],
    "categories": [
      "auth",
      "user_management",
      "config",
      "backup",
      "server"
    ],
    "statuses": [
      "success",
      "failure",
      "error"
    ]
  }
  ```

- **Réponses d'erreur** :
  - `401` : Non autorisé - Session ou jeton CSRF invalide
  - `500` : Erreur interne du serveur
- **Remarques** :
  - Retourne des tableaux de valeurs uniques de la base de données du journal d'audit
  - Les valeurs sont triées par ordre alphabétique
  - Des tableaux vides sont retournés s'il n'existe aucune donnée ou en cas d'erreur
  - Utilisé par la visionneuse de journaux d'audit pour remplir dynamiquement les listes déroulantes de filtres

### Télécharger les journaux d'audit - `/api/audit-log/download` {/* #download-audit-logs---apiaudit-logdownload */}
- **Point de terminaison** : `/api/audit-log/download`
- **Méthode** : GET
- **Description** : Télécharge les journaux d'audit au format CSV ou JSON avec des filtres facultatifs. Utile pour l'analyse et la création de rapports externes.
- **Authentification** : Requiert une session et un jeton CSRF valides (utilisateur connecté requis)
- **Paramètres de requête** :
  - `format` (facultatif) : Format d'exportation - `csv` ou `json` (par défaut : `csv`)
  - `startDate` (facultatif) : Filtrer les journaux à partir de cette date (format ISO)
  - `endDate` (facultatif) : Filtrer les journaux jusqu'à cette date (format ISO)
  - `userId` (facultatif) : Filtrer par ID d'utilisateur
  - `username` (facultatif) : Filtrer par nom d'utilisateur
  - `action` (facultatif) : Filtrer par nom d'action
  - `category` (facultatif) : Filtrer par catégorie
  - `status` (facultatif) : Filtrer par statut
- **Réponse** (CSV) :
  - Content-Type : `text/csv`
  - Content-Disposition : `attachment; filename="audit-log-YYYY-MM-DD.csv"`
  - Fichier CSV avec en-têtes : ID, Horodatage, ID d'utilisateur, Nom d'utilisateur, Action, Catégorie, Type de cible, ID de cible, Statut, Adresse IP, Agent utilisateur, Détails, Message d'erreur
- **Réponse** (JSON) :
  - Content-Type : `application/json`
  - Content-Disposition: `attachment; filename="audit-log-YYYY-MM-DD.json"`
  - Tableau JSON des entrées du journal d'audit
- **Réponses d'erreur**:
  - `400`: Aucun journal à exporter
  - `401`: Non autorisé - Session ou jeton CSRF invalide
  - `500`: Erreur interne du serveur
- **Remarques**:
  - Limite d'exportation est de 10 000 enregistrements
  - Le format CSV échappe correctement les caractères spéciaux
  - Le champ Détails dans le CSV est sous forme de chaîne JSON
  - Le nom du fichier inclut la date actuelle

### Nettoyer les journaux d'audit - `/api/audit-log/cleanup` {/* #cleanup-audit-logs---apiaudit-logcleanup */}
- **Point de terminaison**: `/api/audit-log/cleanup`
- **Méthode**: POST
- **Description**: Déclenche manuellement le nettoyage des anciens journaux d'audit en fonction de la période de conservation. Prend en charge le mode d'essai pour prévisualiser ce qui serait supprimé.
- **Authentification**: Nécessite des privilèges d'administrateur, une session valide et un jeton CSRF
- **Corps de la requête**:

  ```json
  {
    "retentionDays": 90,
    "dryRun": false
  }
  ```

- `retentionDays` (facultatif): Remplacer les jours de conservation (30-365), sinon utilise la valeur configurée
  - `dryRun` (facultatif): Si vrai, retourne uniquement ce qui serait supprimé sans supprimer réellement
- **Réponse** (mode d'essai):

  ```json
  {
    "dryRun": true,
    "wouldDeleteCount": 50,
    "oldestRemaining": "2024-01-01T00:00:00Z",
    "retentionDays": 90,
    "cutoffDate": "2024-01-01"
  }
  ```

- **Réponse** (nettoyage effectif):

  ```json
  {
    "success": true,
    "deletedCount": 50,
    "oldestRemaining": "2024-01-01T00:00:00Z",
    "retentionDays": 90
  }
  ```

- **Réponses d'erreur**:
  - `400`: Jours de conservation invalides (doivent être entre 30 et 365)
  - `401`: Non autorisé - Session ou jeton CSRF invalide
  - `403`: Interdit - Privilèges d'administrateur requis
  - `500`: Erreur interne du serveur
- **Remarques**:
  - Accessible uniquement aux utilisateurs administrateurs
  - La conservation par défaut est de 90 jours si non configurée
  - L'opération de nettoyage est enregistrée dans le journal d'audit
  - Le mode d'essai est utile pour prévisualiser l'impact du nettoyage

### Obtenir la conservation des journaux d'audit - `/api/audit-log/retention` {/* #get-audit-log-retention---apiaudit-logretention */}
- **Point de terminaison**: `/api/audit-log/retention`
- **Méthode**: GET
- **Description**: Récupère la configuration actuelle de la conservation des journaux d'audit en jours.
- **Authentification**: Nécessite une session valide et un jeton CSRF (aucun utilisateur connecté requis)
- **Réponse**:

  ```json
  {
    "retentionDays": 90
  }
  ```

- **Réponses d'erreur**:
  - `500`: Erreur interne du serveur
- **Remarques**:
  - La conservation par défaut est de 90 jours si non configurée
  - Peut être accédé sans authentification (lecture seule)

### Mettre à jour la conservation des journaux d'audit - `/api/audit-log/retention` {/* #update-audit-log-retention---apiaudit-logretention */}
- **Point de terminaison**: `/api/audit-log/retention`
- **Méthode**: PATCH
- **Description**: Met à jour la période de conservation des journaux d'audit en jours. Ce paramètre détermine combien de temps les journaux d'audit sont conservés avant le nettoyage automatique.
- **Authentification**: Nécessite des privilèges d'administrateur, une session valide et un jeton CSRF
- **Corps de la requête**:

  ```json
  {
    "retentionDays": 120
  }
  ```

- `retentionDays`: Obligatoire, doit être compris entre 30 et 365 jours
- **Réponse**:

  ```json
  {
    "success": true,
    "retentionDays": 120
  }
  ```

- **Réponses d'erreur**:
  - `400`: Jours de conservation invalides (doivent être entre 30 et 365)
  - `401`: Non autorisé - Session ou jeton CSRF invalide
  - `403`: Interdit - Privilèges d'administrateur requis
  - `500`: Erreur interne du serveur
- **Remarques**:
  - Accessible uniquement aux utilisateurs administrateurs
  - Le changement de configuration est enregistré dans le journal d'audit
  - La période de conservation affecte les opérations de nettoyage automatique et manuel

## Clés API {/* #api-keys */}

### Lister les clés API - `/api/api-keys` {/* #list-api-keys---apiapi-keys */}
- **Point de terminaison**: `/api/api-keys`
- **Méthode**: GET
- **Description**: Liste toutes les clés API. Les secrets ne sont jamais retournés ; chaque clé inclut une empreinte digitale (`Qk7v…3xTa`).
- **Authentification**: Nécessite des privilèges d'administrateur, une session valide et un jeton CSRF
- **Réponses d'erreur**:
  - `401`: Non autorisé - Session ou jeton CSRF invalide
  - `403`: Interdit - Privilèges d'administrateur requis
  - `500`: Erreur interne du serveur

### Créer une clé API - `/api/api-keys` {/* #create-api-key---apiapi-keys */}
- **Point de terminaison**: `/api/api-keys`
- **Méthode**: POST
- **Description**: Crée une clé API avec une portée définie. Le secret en texte brut n'est retourné que dans cette réponse.
- **Authentification**: Nécessite des privilèges d'administrateur, une session valide et un jeton CSRF
- **Corps de la requête**:

  ```json
  {
    "name": "Duplicati uploads",
    "scope": "upload",
    "description": "Optional",
    "expiresAt": null
  }
  ```

- **Réponses d'erreur**:
  - `400`: Nom manquant ou portée invalide (`upload` ou `read`)
  - `401`: Non autorisé - Session ou jeton CSRF invalide
  - `403`: Interdit - Privilèges d'administrateur requis
  - `500`: Erreur interne du serveur

### Mettre à jour une clé API - `/api/api-keys/:id` {/* #update-api-key---apiapi-keysid */}
- **Point de terminaison**: `/api/api-keys/:id`
- **Méthode**: PATCH
- **Description**: Active ou désactive une clé.
- **Authentification**: Nécessite des privilèges d'administrateur, une session valide et un jeton CSRF

### Supprimer une clé API - `/api/api-keys/:id` {/* #delete-api-key---apiapi-keysid */}
- **Point de terminaison**: `/api/api-keys/:id`
- **Méthode**: DELETE
- **Description**: Supprime une clé. Les clients existants utilisant ce secret perdent immédiatement l'accès.
- **Authentification**: Nécessite des privilèges d'administrateur, une session valide et un jeton CSRF

## Gestion de la base de données {/* #database-management */}

### Sauvegarder la base de données - `/api/database/backup` {/* #backup-database---apidatabasebackup */}
- **Point de terminaison**: `/api/database/backup`
- **Méthode**: GET
- **Description**: Crée une sauvegarde de la base de données au format binaire (.db) ou SQL (.sql). Le fichier de sauvegarde est automatiquement téléchargé avec un nom de fichier horodaté.
- **Authentification**: Nécessite des privilèges d'administrateur, une session valide et un jeton CSRF
- **Paramètres de requête**:
  - `format` (facultatif): Format de sauvegarde - `db` (binaire) ou `sql` (dump SQL). Par défaut: `db`
- **Réponse**:
  - Content-Type: `application/octet-stream` (pour .db) ou `text/plain` (pour .sql)
  - Content-Disposition: `attachment; filename="duplistatus-backup-YYYY-MM-DDTHH-MM-SS.db"` ou `.sql`
  - Contenu binaire (pour .db) ou contenu texte SQL (pour .sql)
- **Réponses d'erreur**:
  - `400`: Format invalide (doit être "db" ou "sql")
  - `401`: Non autorisé - Session ou jeton CSRF invalide
  - `403`: Interdit - Privilèges d'administrateur requis
  - `500`: Échec de la création de la sauvegarde de la base de données
- **Notes**:
  - Accessible uniquement aux utilisateurs administrateurs
  - Le format binaire utilise la méthode de sauvegarde de SQLite pour garantir l'intégrité
  - Le format SQL crée un dump texte de tout le contenu de la base de données
  - L'horodatage dans le nom de fichier utilise le fuseau horaire local du serveur
  - L'opération de sauvegarde est enregistrée dans le journal d'audit
  - Les fichiers temporaires sont automatiquement nettoyés après le téléchargement

### Restaurer la base de données - `/api/database/restore` {/* #restore-database---apidatabaserestore */}
- **Point de terminaison**: `/api/database/restore`
- **Méthode**: POST
- **Description**: Restaure la base de données à partir d'un fichier de sauvegarde (.db ou .sql). Crée une sauvegarde de sécurité avant la restauration et efface toutes les sessions après la restauration pour des raisons de sécurité.
- **Authentification** : Nécessite des privilèges d'administrateur, une session valide et un jeton CSRF
- **Corps de la requête** : FormData avec un champ de fichier nommé `database`
  - Le fichier doit être soit `.db`, `.sqlite`, `.sqlite3` (format binaire) ou `.sql` (format SQL)
  - Taille maximale du fichier : 100 Mo
- **Réponse** :

  ```json
  {
    "success": true,
    "message": "Database restored successfully from DB file",
    "safetyBackupPath": "duplistatus-backup-YYYY-MM-DDTHH-MM-SS.db",
    "requiresReauth": true
  }
  ```

- **Réponses d'erreur** :
  - `400` : Aucun fichier fourni, taille du fichier dépasse la limite, format de fichier invalide ou échec de la vérification d'intégrité de la base de données
  - `401` : Non autorisé - Session ou jeton CSRF invalide
  - `403` : Interdit - Privilèges d'administrateur requis
  - `500` : Échec de la restauration de la base de données (base de données d'origine restaurée à partir de la sauvegarde de sécurité si la restauration échoue)
- **Remarques** :
  - Accessible uniquement aux utilisateurs administrateurs
  - Crée automatiquement une sauvegarde de sécurité avant la restauration
  - Prend en charge les formats binaires (.db) et SQL (.sql)
  - Valide l'intégrité de la base de données après la restauration
  - Si la restauration échoue, restaure automatiquement à partir de la sauvegarde de sécurité
  - Toutes les sessions sont effacées après une restauration réussie pour des raisons de sécurité
  - Retourne `requiresReauth: true` pour indiquer que l'utilisateur doit se reconnecter
  - L'opération de restauration est enregistrée dans le journal d'audit
  - Pour le format SQL, valide le contenu SQL avant l'exécution
  - La connexion à la base de données est réinitialisée après la restauration
  - Tous les caches sont invalidés après la restauration

## Horodatages des sauvegardes {/* #backup-timestamps */}

### Obtenir les derniers horodatages des sauvegardes - `/api/backups/last-timestamps` {/* #get-last-backup-timestamps---apibackupslast-timestamps */}
- **Point de terminaison** : `/api/backups/last-timestamps`
- **Méthode** : GET
- **Description** : Récupère l'horodatage de la dernière sauvegarde pour chaque combinaison serveur-sauvegarde. Retourne une carte pour un accès facile.
- **Authentification** : Nécessite une session valide et un jeton CSRF
- **Réponse** :

  ```json
  {
    "timestamps": {
      "server-id-1:Backup Name 1": "2024-03-20T10:00:00Z",
      "server-id-1:Backup Name 2": "2024-03-20T11:00:00Z",
      "server-id-2:Backup Name 1": "2024-03-20T12:00:00Z"
    },
    "raw": [
      {
        "server_name": "Server Name",
        "server_id": "server-id-1",
        "backup_name": "Backup Name 1",
        "date": "2024-03-20T10:00:00Z"
      }
    ]
  }
  ```

- **Réponses d'erreur** :
  - `401` : Non autorisé - Session ou jeton CSRF invalide
  - `500` : Échec de la récupération des horodatages des dernières sauvegardes
- **Remarques** :
  - Retourne à la fois une carte (pour un accès facile par `server_id:backup_name`) et un format de tableau brut
  - Inclut des en-têtes de contrôle du cache pour empêcher le cache
  - Utile pour suivre les dernières heures de sauvegarde sur toutes les combinaisons serveur-sauvegarde
  - Les horodatages sont au format ISO

## Gestion des journaux d'application {/* #application-logs-management */}

### Obtenir les journaux d'application - `/api/application-logs` {/* #get-application-logs---apiapplication-logs */}
- **Point de terminaison** : `/api/application-logs`
- **Méthode** : GET
- **Description** : Récupère les entrées de journal d'application à partir des fichiers de journal. Prend en charge la lecture des fichiers de journal courants et rotatifs avec la fonctionnalité de queue.
- **Authentification** : Nécessite des privilèges d'administrateur, une session valide et un jeton CSRF
- **Paramètres de requête** :
  - `file` (facultatif) : Nom du fichier de journal à lire - `application.log`, `application.log.1`, `application.log.2`, etc. Si non fourni, retourne la liste des fichiers disponibles
  - `tail` (facultatif) : Nombre de lignes à retourner à partir de la fin du fichier (par défaut : 1000, min : 1, max : 10000)
- **Réponse** (avec paramètre de fichier) :

  ```json
  {
    "logs": "log content as string...",
    "fileSize": 1024000,
    "lastModified": "2024-03-20T10:00:00Z",
    "lineCount": 5000,
    "currentFile": "application.log",
    "availableFiles": ["application.log", "application.log.1", "application.log.2"]
  }
  ```

- **Réponse** (sans paramètre de fichier) :

  ```json
  {
    "logs": "",
    "fileSize": 0,
    "lastModified": "2024-03-20T10:00:00Z",
    "lineCount": 0,
    "currentFile": "",
    "availableFiles": ["application.log", "application.log.1", "application.log.2"]
  }
  ```

- **Réponses d'erreur** :
  - `400` : Paramètre de queue invalide (doit être compris entre 1 et 10000) ou format de paramètre de fichier invalide
  - `401` : Non autorisé - Session ou jeton CSRF invalide
  - `403` : Interdit - Privilèges d'administrateur requis
  - `404` : Fichier de journal introuvable
  - `500` : Échec de la lecture du fichier de journal
- **Remarques** :
  - Accessible uniquement aux utilisateurs administrateurs
  - Prend en charge la lecture du fichier de journal courant et des fichiers de journal rotatifs (jusqu'à 10 fichiers rotatifs)
  - Retourne les dernières N lignes (queue) du fichier de journal spécifié
  - Le nom du fichier de journal est déterminé par la variable d'environnement (par défaut : `application.log`)
  - Retourne la liste des fichiers de journal disponibles lorsque le paramètre de fichier n'est pas fourni
  - Les noms de fichiers sont validés pour prévenir les attaques de type parcours de répertoire
  - Les fichiers rotatifs sont numérotés séquentiellement (`.1`, `.2`, etc.)

### Exporter les journaux de l'application - `/api/application-logs/export` {/* #export-application-logs---apiapplication-logsexport */}
- **Point de terminaison**: `/api/application-logs/export`
- **Méthode**: GET
- **Description**: Exporte les entrées de journal de l'application au format texte filtré. Prend en charge le filtrage par niveau de journal et chaîne de recherche.
- **Authentification**: Nécessite des privilèges d'administrateur, une session valide et un jeton CSRF
- **Paramètres de requête**:
  - `file` (requis): Nom du fichier de journal à exporter - `application.log`, `application.log.1`, `application.log.2`, etc.
  - `logLevels` (facultatif): Liste séparée par des virgules des niveaux de journal à inclure - `INFO`, `WARN`, `ERROR` (par défaut: `INFO,WARN,ERROR`)
  - `search` (facultatif): Chaîne de recherche pour filtrer les lignes de journal (insensible à la casse)
- **Réponse**:
  - Content-Type: `text/plain`
  - Content-Disposition: `attachment; filename="duplistatus-logs-YYYY-MM-DDTHH-MM-SS.txt"`
  - Contenu filtré des journaux au format texte brut
- **Réponses d'erreur**:
  - `400`: Le paramètre de fichier est requis ou le format du paramètre de fichier est invalide
  - `401`: Non autorisé - Session ou jeton CSRF invalide
  - `403`: Interdit - Privilèges d'administrateur requis
  - `500`: Échec de l'exportation des journaux
- **Remarques**:
  - Accessible uniquement aux utilisateurs administrateurs
  - Exporte les entrées de journal filtrées en fonction du niveau de journal et des critères de recherche
  - Prend en charge le filtrage par niveaux de journal: `INFO`, `WARN`, `ERROR`
  - Le filtrage par chaîne de recherche est insensible à la casse
  - Les lignes vides sont automatiquement filtrées
  - Le nom du fichier de journal est déterminé par la variable d'environnement (par défaut: `application.log`)
  - Les noms de fichiers sont validés pour prévenir les attaques de type parcours de répertoire
  - Le fichier exporté inclut un horodatage dans le nom du fichier
  - Utile pour l'analyse externe et le dépannage
