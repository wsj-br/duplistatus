# Administration {#administration}

## Collecter les sauvegardes - `/api/backups/collect` {#collect-backups---apibackupscollect}
- **Endpoint** : `/api/backups/collect`
- **Méthode** : POST
- **Description** : Récupère les données de sauvegarde directement depuis un serveur Duplicati via son API. Cet endpoint détecte automatiquement le meilleur protocole de connexion (HTTPS avec validation SSL, HTTPS avec certificats auto-signés, ou HTTP en secours) et se connecte au serveur Duplicati pour récupérer les informations de sauvegarde et les intégrer dans la base de données locale.
- **Authentification** : Nécessite une session valide et un jeton CSRF
- **Corps de la requête** :

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

- **Réponses d'erreur** :
  - `400` : Paramètres de requête invalides ou échec de connexion
  - `500` : Erreur serveur lors de la collecte des sauvegardes
- **Notes** : 
  - L'endpoint détecte automatiquement le protocole de connexion optimal (HTTPS → HTTPS avec certificat auto-signé → HTTP)
  - Les tentatives de détection du protocole sont effectuées par ordre de préférence de sécurité
  - Les délais d'expiration de connexion sont configurables via des variables d'environnement
  - Journalise les données collectées en mode développement pour le débogage
  - Vérifie que les paramètres de sauvegarde sont complets pour tous les serveurs et toutes les sauvegardes
  - Utilise le port par défaut 8200 s'il n'est pas spécifié
  - Le protocole détecté et l'URL du serveur sont automatiquement stockés dans la base de données
  - `serverAlias` est récupéré depuis la base de données et peut être vide si aucun alias n'est défini
  - L'interface doit utiliser `serverAlias || serverName` à des fins d'affichage
  - Prend en charge à la fois le téléchargement au format JSON et la collecte directe via API

## Nettoyer les sauvegardes - `/api/backups/cleanup` {#cleanup-backups---apibackupscleanup}
- **Endpoint** : `/api/backups/cleanup`
- **Méthode** : POST
- **Description** : Supprime les anciennes données de sauvegarde en fonction de la période de rétention. Cet endpoint permet de gérer la taille de la base de données en supprimant les enregistrements de sauvegarde obsolètes tout en préservant les données récentes et importantes.
- **Authentification** : Nécessite une session valide et un jeton CSRF
- **Corps de la requête** :

  ```json
  {
    "retentionPeriod": "6 months"
  }
  ```

- **Périodes de rétention** : `"6 months"`, `"1 year"`, `"2 years"`, `"Delete all data"`
- **Réponse** :

  ```json
  {
    "message": "Successfully deleted 15 old backups",
    "status": 200
  }
  ```

Pour l'option « Supprimer toutes les données » :

  ```json
  {
    "message": "Successfully deleted all 15 backups and 3 servers, and cleared configuration settings",
    "status": 200
  }
  ```

- **Réponses d'erreur** :
  - `401` : Non autorisé - Session ou jeton CSRF invalide
  - `400` : Période de rétention invalide spécifiée
  - `500` : Erreur serveur pendant l'opération de nettoyage avec informations détaillées sur l'erreur
- **Notes** : 
  - L'opération de nettoyage est irréversible
  - Les données de sauvegarde sont définitivement supprimées de la base de données
  - Les enregistrements des machines sont conservés même si toutes les sauvegardes sont supprimées
  - Lorsque l'option "Supprimer toutes les données" est sélectionnée, toutes les machines et sauvegardes sont supprimées et la configuration est effacée
  - Un reporting d'erreur amélioré inclut les détails et la trace de la pile en mode développement
  - Prend en charge à la fois la rétention basée sur le temps et la suppression complète des données

## Supprimer le travail de sauvegarde - `/api/backups/delete-job` {#delete-backup-job---apibackupsdelete-job}
- **Endpoint** : `/api/backups/delete-job`
- **Méthode** : DELETE
- **Description** : Supprime tous les enregistrements de sauvegarde pour une combinaison spécifique serveur-sauvegarde. Cet endpoint n'est disponible que en mode développement.
- **Authentification** : Nécessite une session valide et un jeton CSRF
- **Corps de la requête** :

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

- **Réponses d'erreur** :
  - `401` : Non autorisé - Session ou jeton CSRF invalide
  - `403` : La suppression du travail de sauvegarde n'est disponible qu'en mode développement
  - `400` : L'ID du serveur et le nom de la sauvegarde sont requis
  - `404` : Aucune sauvegarde trouvée à supprimer
  - `500` : Erreur serveur lors de la suppression avec informations détaillées sur l'erreur
- **Notes** : 
  - Cette opération n'est disponible qu'en mode développement
  - Cette opération est irréversible
  - Tous les enregistrements de sauvegarde pour la combinaison serveur-sauvegarde spécifiée seront définitivement supprimés
  - Renvoie le nombre de sauvegardes supprimées et les informations du serveur
  - Utilise l'alias du serveur pour l'affichage s'il est disponible, sinon utilise le nom du serveur

## Synchroniser les plannings de sauvegarde - `/api/backups/sync-schedule` {#sync-backup-schedules---apibackupssync-schedule}
- **Endpoint** : `/api/backups/sync-schedule`
- **Méthode** : POST
- **Description** : Synchronise les informations de planning de sauvegarde depuis un serveur Duplicati. Cet endpoint se connecte au serveur, récupère les informations de planning pour toutes les sauvegardes, et met à jour les paramètres locaux de sauvegarde avec les détails du planning, notamment les intervalles de répétition, les jours de la semaine autorisés et les horaires.
- **Authentification** : Nécessite une session valide et un jeton CSRF
- **Corps de la requête** :

  ```json
  {
    "hostname": "duplicati-server.local",
    "port": 8200,
    "password": "your-password",
    "serverId": "optional-server-id"
  }
  ```

Ou avec uniquement serverId (utilise le mot de passe stocké) :

  ```json
  {
    "serverId": "server-id"
  }
  ```

Ou avec serverId et identifiants mis à jour :

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

Avec erreurs :

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

- **Réponses d'erreur** :
  - `400` : Paramètres de requête invalides, nom d'hôte ou mot de passe manquant lorsque serverId n'est pas fourni, ou échec de connexion
  - `404` : Serveur introuvable (lorsque serverId est fourni) ou mot de passe non stocké pour le serveur
  - `500` : Erreur du serveur lors de la synchronisation de la planification
- **Notes** : 
  - Le point de terminaison détecte automatiquement le protocole de connexion optimal (HTTPS → HTTPS avec certificat auto-signé → HTTP)
  - Peut être appelé uniquement avec serverId pour utiliser les identifiants stockés du serveur
  - Peut être appelé avec serverId et de nouveaux identifiants pour mettre à jour les détails de connexion du serveur
  - Peut être appelé avec hostname/port/password sans serverId pour de nouveaux serveurs
  - Met à jour les paramètres de sauvegarde avec les informations de planification, notamment :
    - `expectedInterval` : L'intervalle de répétition (par exemple, "Daily", "Weekly", "Monthly")
    - `allowedWeekDays` : Tableau des jours de la semaine autorisés (0=dimanche, 1=lundi, etc.)
    - `time` : L'heure planifiée pour la sauvegarde
  - Traite toutes les sauvegardes trouvées sur le serveur
  - Renvoie des statistiques sur les sauvegardes traitées et les erreurs rencontrées
  - Enregistre des événements d'audit pour les opérations de synchronisation réussies et échouées
  - Utilise le port par défaut 8200 s'il n'est pas spécifié

## Tester la connexion au serveur - `/api/servers/test-connection` {#test-server-connection---apiserverstest-connection}
- **Endpoint** : `/api/servers/test-connection`
- **Méthode** : POST
- **Description** : Teste la connexion à un serveur Duplicati afin de vérifier qu'il est accessible.
- **Corps de la requête** :

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

- **Réponses d'erreur** :
  - `400` : Format d'URL invalide ou URL du serveur manquante
  - `500` : Erreur du serveur lors du test de connexion
- **Notes** : 
  - Le point de terminaison valide le format de l'URL et teste la connectivité
  - Renvoie un succès si le serveur répond avec un statut 401 (attendu pour le point de terminaison de connexion sans identifiants)
  - Teste la connexion au point de terminaison de connexion du serveur Duplicati
  - Prend en charge les protocoles HTTP et HTTPS
  - Utilise la configuration de délai d'attente pour le test de connexion

## Obtenir l'URL du serveur - `/api/servers/:serverId/server-url` {#get-server-url---apiserversserveridserver-url}
- **Endpoint** : `/api/servers/:serverId/server-url`
- **Méthode** : GET
- **Description** : Récupère l'URL du serveur pour un serveur spécifique.
- **Paramètres** :
  - `serverId` : l'identifiant du serveur

- **Réponse** :

  ```json
  {
    "serverId": "server-id",
    "server_url": "http://localhost:8200"
  }
  ```

- **Réponses d'erreur** :
  - `404` : Serveur introuvable
  - `500` : Erreur du serveur
- **Notes** :
  - Renvoie l'URL du serveur pour le serveur spécifique
  - Utilisé pour la gestion de la connexion au serveur
  - Renvoie une chaîne vide si aucune URL de serveur n'est définie

## Mettre à jour l'URL du serveur - `/api/servers/:serverId/server-url` {#update-server-url---apiserversserveridserver-url}
- **Endpoint** : `/api/servers/:serverId/server-url`
- **Méthode** : PATCH
- **Description** : Met à jour l'URL du serveur pour un serveur spécifique.
- **Authentification** : Nécessite une session valide et un jeton CSRF
- **Paramètres** :
  - `serverId` : l'identifiant du serveur
- **Corps de la requête** :

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

- **Réponses d'erreur** :
  - `401` : Non autorisé - Session ou jeton CSRF invalide
  - `400` : Format d'URL invalide
  - `404` : Serveur introuvable
  - `500` : Erreur du serveur lors de la mise à jour
- **Notes** : 
  - Le point de terminaison valide le format de l'URL avant la mise à jour
  - Les URL de serveur vides ou nulles sont autorisées
  - Prend en charge les protocoles HTTP et HTTPS
  - Renvoie les informations mises à jour du serveur

## Obtenir le mot de passe du serveur - `/api/servers/:serverId/password` {#get-server-password---apiserversserveridpassword}
- **Endpoint** : `/api/servers/:serverId/password`
- **Méthode** : GET
- **Description** : Récupère un jeton CSRF pour les opérations liées au mot de passe du serveur.
- **Authentification** : Nécessite une session valide
- **Paramètres** :
  - `serverId` : l'identifiant du serveur
- **Réponse** :

  ```json
  {
    "csrfToken": "csrf-token-string",
    "serverId": "server-id"
  }
  ```

- **Réponses d'erreur** :
  - `401` : Session invalide ou expirée
  - `500` : Échec de la génération du jeton CSRF
- **Notes** :
  - Renvoie un jeton CSRF à utiliser avec les opérations de mise à jour du mot de passe
  - La session doit être valide pour générer le jeton

## Mettre à jour le mot de passe du serveur - `/api/servers/:serverId/password` {#update-server-password---apiserversserveridpassword}
- **Endpoint** : `/api/servers/:serverId/password`
- **Méthode** : PATCH
- **Description** : Met à jour le mot de passe pour un serveur spécifique.
- **Authentification** : Nécessite une session valide et un jeton CSRF
- **Paramètres** :
  - `serverId` : l'identifiant du serveur
- **Corps de la requête** :

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

- **Réponses d'erreur** :
  - `400` : Le mot de passe doit être une chaîne de caractères
  - `401` : Non autorisé - Session ou jeton CSRF invalide
  - `500` : Échec de la mise à jour du mot de passe
- **Notes** :
  - Le mot de passe peut être une chaîne vide pour le supprimer
  - Le mot de passe est stocké de manière sécurisée à l'aide du système de gestion des secrets

## Gestion des utilisateurs {#user-management}

### Lister les utilisateurs - `/api/users` {#list-users---apiusers}
- **Endpoint** : `/api/users`
- **Méthode** : GET
- **Description** : Liste tous les utilisateurs avec pagination et filtre de recherche optionnel. Renvoie les informations utilisateur, notamment l'historique de connexion et le statut du compte.
- **Authentification** : Nécessite des privilèges d'administrateur, une session valide et un jeton CSRF
- **Paramètres de requête** :
  - `page` (facultatif) : Numéro de page (par défaut : 1)
  - `limit` (facultatif) : Éléments par page (par défaut : 50)
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
  - Prend en charge la pagination et le filtrage par recherche
  - Renvoie le statut du compte utilisateur, y compris le statut de verrouillage

### Créer l'utilisateur - `/api/users` {#create-user---apiusers}
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

- `username` : Obligatoire, doit contenir entre 3 et 50 caractères, unique
  - `password` : Facultatif, si non fourni, un mot de passe temporaire sécurisé est généré
  - `isAdmin` : Facultatif, par défaut à false
  - `requirePasswordChange` : Facultatif, par défaut à true
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
  - Le nom d'utilisateur est insensible à la casse et stocké en minuscules
  - Si aucun mot de passe n'est fourni, un mot de passe sécurisé de 12 caractères est généré
  - Les mots de passe temporaires générés ne sont renvoyés qu'une seule fois dans la réponse
  - La création d'utilisateur est enregistrée dans le journal d'audit

### Mettre à jour l'utilisateur - `/api/users/:id` {#update-user---apiusersid}
- **Endpoint** : `/api/users/:id`
- **Méthode** : PATCH
- **Description** : Met à jour les informations utilisateur, notamment le nom d'utilisateur, le statut d'administrateur, l'exigence de changement de mot de passe et la réinitialisation du mot de passe.
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
  - `resetPassword` : Si vrai, génère un nouveau mot de passe temporaire et définit `requirePasswordChange` sur true
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
  - `404` : Utilisateur non trouvé
  - `409` : Nom d'utilisateur déjà utilisé (en cas de modification du nom d'utilisateur)
  - `500` : Erreur interne du serveur
- **Notes** :
  - Accessible uniquement aux utilisateurs administrateurs
  - Les modifications du nom d'utilisateur sont validées pour garantir l'unicité
  - La réinitialisation du mot de passe génère un mot de passe temporaire sécurisé de 12 caractères
  - Toutes les modifications sont enregistrées dans le journal d'audit

### Supprimer l'utilisateur - `/api/users/:id` {#delete-user---apiusersid}
- **Endpoint** : `/api/users/:id`
- **Méthode** : DELETE
- **Description** : Supprime un compte utilisateur. Empêche la suppression de son propre compte ou du dernier compte administrateur.
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
  - `404` : Utilisateur non trouvé
  - `500` : Erreur interne du serveur
- **Notes** :
  - Accessible uniquement aux utilisateurs administrateurs
  - Impossible de supprimer son propre compte
  - Impossible de supprimer le dernier compte administrateur (au moins un administrateur doit rester)
  - La suppression d'un utilisateur est enregistrée dans le journal d'audit
  - Les sessions associées sont automatiquement supprimées (suppression en cascade)

## Gestion du journal d'audit {#audit-log-management}

### Lister les journaux d'audit - `/api/audit-log` {#list-audit-logs---apiaudit-log}
- **Endpoint** : `/api/audit-log`
- **Méthode** : GET
- **Description** : Récupère les entrées du journal d'audit avec filtrage, pagination et fonctionnalités de recherche. Prend en charge la pagination basée sur les pages et celle basée sur les décalages.
- **Authentification** : Nécessite une session valide et un jeton CSRF (connexion requise)
- **Paramètres de requête** :
  - `page` (facultatif) : Numéro de page pour la pagination par page
  - `offset` (facultatif) : Décalage pour la pagination par décalage (prend le pas sur la page)
  - `limit` (facultatif) : Nombre d'éléments par page (par défaut : 50)
  - `startDate` (facultatif) : Filtre les journaux à partir de cette date (format ISO)
  - `endDate` (facultatif) : Filtre les journaux jusqu'à cette date (format ISO)
  - `userId` (facultatif) : Filtre par ID utilisateur
  - `username` (facultatif) : Filtre par nom d'utilisateur
  - `action` (facultatif) : Filtre par nom d'action
  - `category` (facultatif) : Filtre par catégorie (`auth`, `user_management`, `config`, `backup`, `server`)
  - `status` (facultatif) : Filtre par statut (`success`, `failure`, `error`)
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
- **Notes** :
  - Prend en charge la pagination par page (`page`) et par décalage (`offset`)
  - Le champ `details` contient du JSON analysé avec un contexte supplémentaire
  - Toutes les requêtes sur le journal d'audit sont enregistrées

### Obtenir les valeurs de filtre du journal d'audit - `/api/audit-log/filters` {#get-audit-log-filter-values---apiaudit-logfilters}
- **Endpoint** : `/api/audit-log/filters`
- **Méthode** : GET
- **Description** : Récupère les valeurs de filtre uniques disponibles pour le filtrage des journaux d'audit. Renvoie toutes les actions, catégories et statuts distincts présents dans la base de données du journal d'audit. Utile pour remplir les menus déroulants de filtres dans l'interface utilisateur.
- **Authentification** : Nécessite une session valide et un jeton CSRF (connexion requise)
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
- **Notes** :
  - Renvoie des tableaux de valeurs uniques provenant de la base de données du journal d'audit
  - Les valeurs sont triées par ordre alphabétique
  - Des tableaux vides sont renvoyés s'il n'y a pas de données ou en cas d'erreur
  - Utilisé par la visionneuse des journaux d'audit pour remplir dynamiquement les menus déroulants de filtres

### Télécharger les journaux d'audit - `/api/audit-log/download` {#download-audit-logs---apiaudit-logdownload}
- **Endpoint** : `/api/audit-log/download`
- **Méthode** : GET
- **Description** : Télécharge les journaux d'audit au format CSV ou JSON avec un filtre optionnel. Utile pour l'analyse externe et la génération de rapports.
- **Authentification**: Nécessite une session valide et un jeton CSRF (connexion utilisateur requise)
- **Paramètres de requête**:
  - `format` (facultatif): Format d'exportation - `csv` ou `json` (par défaut : `csv`)
  - `startDate` (facultatif): Filtre les journaux à partir de cette date (format ISO)
  - `endDate` (facultatif): Filtre les journaux jusqu'à cette date (format ISO)
  - `userId` (facultatif): Filtre par identifiant utilisateur
  - `username` (facultatif): Filtre par nom d'utilisateur
  - `action` (facultatif): Filtre par nom d'action
  - `category` (facultatif): Filtre par catégorie
  - `status` (facultatif): Filtre par statut
- **Réponse** (CSV):
  - Content-Type: `text/csv`
  - Content-Disposition: `attachment; filename="audit-log-YYYY-MM-DD.csv"`
  - Fichier CSV avec les en-têtes : ID, Horodatage, ID utilisateur, Nom d'utilisateur, Action, Catégorie, Type de cible, ID de la cible, Statut, Adresse IP, Agent utilisateur, Détails, Message d'erreur
- **Réponse** (JSON):
  - Content-Type: `application/json`
  - Content-Disposition: `attachment; filename="audit-log-YYYY-MM-DD.json"`
  - Tableau JSON des entrées du journal d'audit
- **Réponses d'erreur**:
  - `400` : Aucun journal à exporter
  - `401` : Non autorisé - Session ou jeton CSRF invalide
  - `500` : Erreur interne du serveur
- **Notes**:
  - Limite d'exportation de 10 000 enregistrements
  - Le format CSV échappe correctement les caractères spéciaux
  - Le champ Détails dans le CSV est sérialisé en JSON
  - Le nom du fichier inclut la date actuelle

### Nettoyer les journaux d'audit - `/api/audit-log/cleanup` {#cleanup-audit-logs---apiaudit-logcleanup}
- **Endpoint** : `/api/audit-log/cleanup`
- **Méthode** : POST
- **Description** : Déclenche manuellement le nettoyage des anciens journaux d'audit en fonction de la période de rétention. Prend en charge le mode d'essai (dry-run) pour prévisualiser les éléments qui seraient supprimés.
- **Authentification**: Nécessite des privilèges d'administrateur, une session valide et un jeton CSRF
- **Corps de la requête**:

  ```json
  {
    "retentionDays": 90,
    "dryRun": false
  }
  ```

- `retentionDays` (facultatif) : Remplace la durée de rétention (30-365 jours), sinon utilise la valeur configurée
  - `dryRun` (facultatif) : Si vrai, retourne uniquement ce qui serait supprimé sans effectuer la suppression
- **Réponse** (simulation) :

  ```json
  {
    "dryRun": true,
    "wouldDeleteCount": 50,
    "oldestRemaining": "2024-01-01T00:00:00Z",
    "retentionDays": 90,
    "cutoffDate": "2024-01-01"
  }
  ```

- **Réponse** (nettoyage effectif) :

  ```json
  {
    "success": true,
    "deletedCount": 50,
    "oldestRemaining": "2024-01-01T00:00:00Z",
    "retentionDays": 90
  }
  ```

- **Réponses d'erreur**:
  - `400` : Nombre de jours de rétention invalide (doit être compris entre 30 et 365)
  - `401` : Non autorisé - Session ou jeton CSRF invalide
  - `403` : Interdit - Privilèges d'administrateur requis
  - `500` : Erreur interne du serveur
- **Notes**:
  - Accessible uniquement aux utilisateurs administrateurs
  - La rétention par défaut est de 90 jours si non configurée
  - L'opération de nettoyage est enregistrée dans le journal d'audit
  - Le mode test est utile pour prévisualiser l'impact du nettoyage

### Obtenir la rétention du journal d'audit - `/api/audit-log/retention` {#get-audit-log-retention---apiaudit-logretention}
- **Point de terminaison** : `/api/audit-log/retention`
- **Méthode** : GET
- **Description** : Récupère la configuration actuelle de rétention du journal d'audit en jours.
- **Authentification**: Nécessite une session valide et un jeton CSRF (aucun utilisateur connecté requis)
- **Réponse**:

  ```json
  {
    "retentionDays": 90
  }
  ```

- **Réponses d'erreur**:
  - `500` : Erreur interne du serveur
- **Notes**:
  - La rétention par défaut est de 90 jours si non configurée
  - Peut être consultée sans authentification (lecture seule)

### Mettre à jour la rétention du journal d'audit - `/api/audit-log/retention` {#update-audit-log-retention---apiaudit-logretention}
- **Point de terminaison** : `/api/audit-log/retention`
- **Méthode** : PATCH
- **Description** : Met à jour la période de rétention du journal d'audit en jours. Ce paramètre détermine la durée pendant laquelle les journaux d'audit sont conservés avant leur suppression automatique.
- **Authentification**: Nécessite des privilèges d'administrateur, une session valide et un jeton CSRF
- **Corps de la requête**:

  ```json
  {
    "retentionDays": 120
  }
  ```

- `retentionDays` : Obligatoire, doit être compris entre 30 et 365 jours
- **Réponse** :

  ```json
  {
    "success": true,
    "retentionDays": 120
  }
  ```

- **Réponses d'erreur**:
  - `400` : Nombre de jours de rétention invalide (doit être compris entre 30 et 365)
  - `401` : Non autorisé - Session ou jeton CSRF invalide
  - `403` : Interdit - Privilèges d'administrateur requis
  - `500` : Erreur interne du serveur
- **Notes** :
  - Accessible uniquement aux utilisateurs administrateurs
  - La modification de la configuration est enregistrée dans le journal d'audit
  - La période de rétention affecte les opérations de nettoyage automatique et manuel

## Gestion de la base de données {#database-management}

### Sauvegarder la base de données - `/api/database/backup` {#backup-database---apidatabasebackup}
- **Point de terminaison** : `/api/database/backup`
- **Méthode** : GET
- **Description** : Crée une sauvegarde de la base de données au format binaire (.db) ou SQL (.sql). Le fichier de sauvegarde est automatiquement téléchargé avec un nom de fichier horodaté.
- **Authentification** : Nécessite des privilèges d'administrateur, une session valide et un jeton CSRF
- **Paramètres de requête** :
  - `format` (facultatif) : Format de sauvegarde - `db` (binaire) ou `sql` (export SQL). Par défaut : `db`
- **Réponse** :
  - Content-Type : `application/octet-stream` (pour .db) ou `text/plain` (pour .sql)
  - Content-Disposition : `attachment; filename="duplistatus-backup-YYYY-MM-DDTHH-MM-SS.db"` ou `.sql`
  - Contenu binaire (pour .db) ou contenu texte SQL (pour .sql)
- **Réponses d'erreur** :
  - `400` : Format invalide (doit être "db" ou "sql")
  - `401` : Non autorisé - Session ou jeton CSRF invalide
  - `403` : Interdit - Privilèges d'administrateur requis
  - `500` : Échec de la création de la sauvegarde de la base de données
- **Notes** :
  - Accessible uniquement aux utilisateurs administrateurs
  - Le format binaire utilise la méthode de sauvegarde SQLite pour garantir l'intégrité
  - Le format SQL crée un export texte de tout le contenu de la base de données
  - L'horodatage dans le nom du fichier utilise le fuseau horaire local du serveur
  - L'opération de sauvegarde est enregistrée dans le journal d'audit
  - Les fichiers temporaires sont automatiquement supprimés après le téléchargement

### Restaurer la base de données - `/api/database/restore` {#restore-database---apidatabaserestore}
- **Point de terminaison** : `/api/database/restore`
- **Méthode** : POST
- **Description** : Restaure la base de données à partir d'un fichier de sauvegarde (format .db ou .sql). Crée une sauvegarde de sécurité avant la restauration et supprime toutes les sessions après la restauration pour des raisons de sécurité.
- **Authentification** : Nécessite des privilèges d'administrateur, une session valide et un jeton CSRF
- **Corps de la requête** : FormData avec un champ fichier nommé `database`
  - Le fichier doit être au format `.db`, `.sqlite`, `.sqlite3` (format binaire) ou `.sql` (format SQL)
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
  - `400` : Aucun fichier fourni, taille du fichier dépassant la limite, format de fichier invalide ou échec du contrôle d'intégrité de la base de données
  - `401` : Non autorisé - Session ou jeton CSRF invalide
  - `403` : Interdit - Privilèges d'administrateur requis
  - `500` : Échec de la restauration de la base de données (la base de données d'origine est restaurée à partir de la sauvegarde de sécurité si la restauration échoue)
- **Notes** :
  - Accessible uniquement aux utilisateurs administrateurs
  - Crée automatiquement une sauvegarde de sécurité avant la restauration
  - Prend en charge les formats binaires (.db) et SQL (.sql)
  - Valide l'intégrité de la base de données après la restauration
  - En cas d'échec de la restauration, restaure automatiquement à partir de la sauvegarde de sécurité
  - Toutes les sessions sont supprimées après une restauration réussie pour des raisons de sécurité
  - Renvoie `requiresReauth: true` pour indiquer que l'utilisateur doit se reconnecter
  - L'opération de restauration est enregistrée dans le journal d'audit
  - Pour le format SQL, valide le contenu SQL avant son exécution
  - La connexion à la base de données est réinitialisée après la restauration
  - Tous les caches sont invalidés après la restauration

## Horodatages des sauvegardes {#backup-timestamps}

### Obtenir les horodatages de la dernière sauvegarde - `/api/backups/last-timestamps` {#get-last-backup-timestamps---apibackupslast-timestamps}
- **Point de terminaison** : `/api/backups/last-timestamps`
- **Méthode** : GET
- **Description** : Récupère l'horodatage de la dernière sauvegarde pour chaque combinaison serveur-sauvegarde. Renvoie une carte pour une recherche facile.
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
  - `500` : Échec de la récupération des derniers horodatages de sauvegarde
- **Notes** :
  - Renvoie à la fois une carte (pour une recherche facile par `server_id:backup_name`) et un format de tableau brut
  - Inclut des en-têtes de contrôle de cache pour empêcher la mise en cache
  - Utile pour suivre les derniers horodatages de sauvegarde pour toutes les combinaisons serveur-sauvegarde
  - Les horodatages sont au format ISO

## Gestion des journaux de l'application {#application-logs-management}

### Obtenir les journaux de l'application - `/api/application-logs` {#get-application-logs---apiapplication-logs}
- **Point de terminaison** : `/api/application-logs`
- **Méthode** : GET
- **Description** : Récupère les entrées de journal depuis les fichiers journaux. Prend en charge la lecture des fichiers journaux actuels et archivés avec une fonctionnalité de suivi (tail).
- **Authentification** : Nécessite des privilèges d'administrateur, une session valide et un jeton CSRF
- **Paramètres de requête** :
  - `file` (facultatif) : Nom du fichier journal à lire - `application.log`, `application.log.1`, `application.log.2`, etc. Si non fourni, renvoie la liste des fichiers disponibles
  - `tail` (facultatif) : Nombre de lignes à renvoyer depuis la fin du fichier (par défaut : 1000, min : 1, max : 10000)
- **Réponse** (avec le paramètre fichier) :

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

- **Réponse** (sans le paramètre fichier) :

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
  - `400` : Paramètre tail non valide (doit être compris entre 1 et 10000) ou format du paramètre fichier non valide
  - `401` : Non autorisé - Session ou jeton CSRF non valide
  - `403` : Interdit - Privilèges d'administrateur requis
  - `404` : Fichier journal introuvable
  - `500` : Échec de la lecture du fichier journal
- **Notes** :
  - Accessible uniquement aux utilisateurs administrateurs
  - Prend en charge la lecture du fichier journal actuel et des fichiers journaux archivés (jusqu'à 10 fichiers archivés)
  - Renvoie les N dernières lignes (tail) du fichier journal spécifié
  - Le nom du fichier journal est déterminé par une variable d'environnement (par défaut : `application.log`)
  - Renvoie la liste des fichiers journaux disponibles lorsque le paramètre fichier n'est pas fourni
  - Les noms de fichiers sont validés pour empêcher les attaques par traversée de répertoire
  - Les fichiers archivés sont numérotés séquentiellement (`.1`, `.2`, etc.)

### Exporter les journaux de l'application - `/api/application-logs/export` {#export-application-logs---apiapplication-logsexport}
- **Point de terminaison** : `/api/application-logs/export`
- **Méthode** : GET
- **Description** : Exporte les entrées de journal de l'application dans un format texte filtré. Prend en charge le filtrage par niveau de journal et par chaîne de recherche.
- **Authentification** : Nécessite des privilèges d'administrateur, une session valide et un jeton CSRF
- **Paramètres de requête** :
  - `file` (requis) : Nom du fichier journal à exporter - `application.log`, `application.log.1`, `application.log.2`, etc.
  - `logLevels` (facultatif) : Liste séparée par des virgules des niveaux de journal à inclure - `INFO`, `WARN`, `ERROR` (par défaut : `INFO,WARN,ERROR`)
  - `search` (facultatif) : Chaîne de recherche pour filtrer les lignes de journal (insensible à la casse)
- **Réponse** :
  - Content-Type : `text/plain`
  - Content-Disposition : `attachment; filename="duplistatus-logs-YYYY-MM-DDTHH-MM-SS.txt"`
  - Contenu du journal filtré au format texte brut
- **Réponses d'erreur** :
  - `400` : Le paramètre fichier est requis ou le format du paramètre fichier est non valide
  - `401` : Non autorisé - Session ou jeton CSRF non valide
  - `403` : Interdit - Privilèges d'administrateur requis
  - `500` : Échec de l'exportation des journaux
- **Notes** :
  - Accessible uniquement aux utilisateurs administrateurs
  - Exporte les entrées de journal filtrées selon le niveau de journal et les critères de recherche
  - Prend en charge le filtrage par niveaux de journal : `INFO`, `WARN`, `ERROR`
  - Le filtrage par chaîne de recherche est insensible à la casse
  - Les lignes vides sont automatiquement filtrées
  - Le nom du fichier journal est déterminé par une variable d'environnement (par défaut : `application.log`)
  - Les noms de fichiers sont validés pour empêcher les attaques par traversée de répertoire
  - Le fichier exporté inclut l'horodatage dans son nom
  - Utile pour l'analyse externe et le dépannage
