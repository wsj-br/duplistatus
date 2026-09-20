# Administration {/* #administration */}

## Collecter les sauvegardes - `/api/backups/collect` {/* #collect-backups---apibackupscollect */}
- **Endpoint** : `/api/backups/collect`
- **Méthode** : POST
- **Description** : Collecte les données de sauvegarde directement depuis un serveur Duplicati via son API. Ce point de terminaison détecte automatiquement le meilleur protocole de connexion (HTTPS avec validation SSL, HTTPS avec certificats auto-signés ou HTTP comme solution de repli) et se connecte au serveur Duplicati pour récupérer les informations de sauvegarde et les traiter dans la base de données locale.
- **Authentification** : Nécessite une session valide et un jeton CSRF
- **Corps de la demande** :

  ```json
  {
    "hostname": "duplicati-server.local",
    "port": 8200,
    "password": "your-password",
    "downloadJson": false
  }
  ```

- **Response** :

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
  - `400` : Paramètres de requête non valides ou échec de connexion
  - `500` : Erreur de serveur pendant la collecte des sauvegardes
- **Remarques** : 
  - Le point de terminaison détecte automatiquement le protocole de connexion optimal (HTTPS → HTTPS avec certificat auto-signé → HTTP)
  - Les tentatives de détection du protocole sont effectuées par ordre de préférence en matière de sécurité
  - Les délais d'expiration de connexion sont configurables via des variables d'environnement
  - Enregistre les données collectées dans les journaux en mode développement à des fins de débogage
  - Garantit que les paramètres de sauvegarde sont complets pour tous les serveurs et toutes les sauvegardes
  - Utilise le port 8200 par défaut s'il n'est pas spécifié
  - Le protocole détecté et l'URL du serveur sont automatiquement stockés dans la base de données
  - `serverAlias` est récupéré depuis la base de données et peut être vide si aucun alias n'est défini
  - Le frontend doit utiliser `serverAlias || serverName` à des fins d'affichage
  - Prend en charge à la fois les méthodes de téléchargement JSON et de collecte directe via l'API

## Nettoyer les sauvegardes - `/api/backups/cleanup` {/* #cleanup-backups---apibackupscleanup */}
- **Endpoint** : `/api/backups/cleanup`
- **Méthode** : POST
- **Description** : Supprime les anciennes données de sauvegarde selon la période de rétention. Ce point de terminaison permet de gérer la taille de la base de données en supprimant les enregistrements de sauvegarde obsolètes tout en préservant les données récentes et importantes.
- **Authentification** : Nécessite une session valide et un jeton CSRF
- **Corps de la demande** :

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

Pour l'option "Supprimer toutes les données" :

  ```json
  {
    "message": "Successfully deleted all 15 backups and 3 servers, and cleared configuration settings",
    "status": 200
  }
  ```

- **Réponses d'erreur** :
  - `401` : Non autorisé - Session ou jeton CSRF non valide
  - `400` : Période de rétention spécifiée non valide
  - `500` : Erreur de serveur pendant l'opération de nettoyage avec des informations d'erreur détaillées
- **Remarques** : 
  - L'opération de nettoyage est irréversible
  - Les données de sauvegarde sont définitivement supprimées de la base de données
  - Les enregistrements de machine sont conservés même si toutes les sauvegardes sont supprimées
  - Quand "Supprimer toutes les données" est sélectionné, toutes les machines et sauvegardes sont supprimées et la configuration est effacée
  - Les rapports d'erreur améliorés incluent des détails et la trace de la pile en mode développement
  - Prend en charge à la fois la rétention temporelle et la suppression complète des données

## Supprimer la tâche de sauvegarde - `/api/backups/delete-job` {/* #delete-backup-job---apibackupsdelete-job */}
- **Endpoint** : `/api/backups/delete-job`
- **Méthode** : DELETE
- **Description** : Supprime tous les enregistrements de sauvegarde pour une combinaison serveur-sauvegarde spécifique. Ce point de terminaison n'est disponible qu'en mode développement.
- **Authentification** : Nécessite une session valide et un jeton CSRF
- **Corps de la demande** :

  ```json
  {
    "serverId": "server-id",
    "backupName": "Backup Name"
  }
  ```

- **Response** :

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
  - `401` : Non autorisé - Session ou jeton CSRF non valide
  - `403` : La suppression de la tâche de sauvegarde n'est disponible qu'en mode développement
  - `400` : L'ID du serveur et le nom de la sauvegarde sont requis
  - `404` : Aucune sauvegarde trouvée à supprimer
  - `500` : Erreur de serveur pendant la suppression avec des informations d'erreur détaillées
- **Remarques** : 
  - Cette opération n'est disponible qu'en mode développement
  - Cette opération est irréversible
  - Tous les enregistrements de sauvegarde pour la combinaison serveur-sauvegarde spécifiée seront supprimés définitivement
  - Retourne le nombre de sauvegardes supprimées et les informations du serveur
  - Utilise l'alias du serveur pour l'affichage s'il est disponible, sinon revient au nom du serveur

## Synchroniser les planifications de sauvegarde - `/api/backups/sync-schedule` {/* #sync-backup-schedules---apibackupssync-schedule */}
- **Point de terminaison** : `/api/backups/sync-schedule`
- **Méthode** : POST
- **Description** : Synchronise les informations de planification de sauvegarde à partir d'un serveur duplicati. Ce point de terminaison se connecte au serveur, récupère les informations de planification pour toutes les sauvegardes et met à jour les paramètres de sauvegarde locaux avec les détails de planification, notamment les intervalles de répétition, les jours de la semaine autorisés et les heures de planification.
- **Authentification** : Nécessite une session valide et un jeton CSRF
- **Corps de la demande** :

  ```json
  {
    "hostname": "duplicati-server.local",
    "port": 8200,
    "password": "your-password",
    "serverId": "optional-server-id"
  }
  ```

Ou avec serverId uniquement (utilise le mot de passe stocké) :

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

- **Response** :

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
  - `400` : Paramètres de demande non valides, nom d'hôte/mot de passe manquant quand serverId n'est pas fourni, ou échec de connexion
  - `404` : Serveur non trouvé (quand serverId est fourni) ou aucun mot de passe stocké pour le serveur
  - `500` : Erreur du serveur lors de la synchronisation de la planification
- **Remarques** : 
  - Le point de terminaison détecte automatiquement le protocole de connexion optimal (HTTPS → HTTPS avec auto-signé → HTTP)
  - Peut être appelé avec juste serverId pour utiliser les identifiants du serveur stockés
  - Peut être appelé avec serverId et de nouveaux identifiants pour mettre à jour les détails de connexion du serveur
  - Peut être appelé avec nom d'hôte/port/mot de passe sans serverId pour les nouveaux serveurs
  - Met à jour les paramètres de sauvegarde avec les informations de planification, notamment :
    - `expectedInterval` : L'intervalle de répétition (par exemple, « Quotidien », « Hebdomadaire », « Mensuel »)
    - `allowedWeekDays` : Tableau des jours de la semaine autorisés (0=dimanche, 1=lundi, etc.)
    - `time` : L'heure planifiée pour la sauvegarde
  - Traite toutes les sauvegardes trouvées sur le serveur
  - Retourne des statistiques sur les sauvegardes traitées et les erreurs rencontrées
  - Enregistre les événements d'audit pour les opérations de synchronisation réussies et échouées
  - Utilise le port par défaut 8200 s'il n'est pas spécifié

## Tester la connexion au serveur - `/api/servers/test-connection` {/* #test-server-connection---apiserverstest-connection */}
- **Point de terminaison** : `/api/servers/test-connection`
- **Méthode** : POST
- **Description** : Teste la connexion à un serveur duplicati pour vérifier qu'il est accessible.
- **Corps de la demande** :

  ```json
  {
    "server_url": "http://localhost:8200"
  }
  ```

- **Response** :

  ```json
  {
    "success": true,
    "message": "Connection successful"
  }
  ```

- **Réponses d'erreur** :
  - `400` : Format d'URL non valide ou URL du serveur manquante
  - `500` : Erreur du serveur lors du test de connexion
- **Remarques** : 
  - Le point de terminaison valide le format de l'URL et teste la connectivité
  - Retourne le succès si le serveur répond avec un statut 401 (attendu pour le point de terminaison de connexion sans identifiants)
  - Teste la connexion au point de terminaison de connexion du serveur duplicati
  - Supporte les protocoles HTTP et HTTPS
  - Utilise la configuration du délai d'expiration pour le test de connexion

## Obtenir l'URL du serveur - `/api/servers/:serverId/server-url` {/* #get-server-url---apiserversserveridserver-url */}
- **Point de terminaison** : `/api/servers/:serverId/server-url`
- **Méthode** : GET
- **Description** : Récupère l'URL du serveur pour un serveur spécifique.
- **Paramètres** :
  - `serverId` : l'identifiant du serveur

- **Response** :

  ```json
  {
    "serverId": "server-id",
    "server_url": "http://localhost:8200"
  }
  ```

- **Réponses d'erreur** :
  - `404` : Serveur introuvable
  - `500` : Erreur de serveur
- **Remarques** :
  - Renvoie l'URL de serveur pour un serveur spécifique
  - Utilisé pour la gestion des connexions au serveur
  - Renvoie une chaîne vide si aucune URL de serveur n'est définie

## Mettre à jour l'URL du serveur - `/api/servers/:serverId/server-url` {/* #update-server-url---apiserversserveridserver-url */}
- **Point de terminaison** : `/api/servers/:serverId/server-url`
- **Méthode** : PATCH
- **Description** : Met à jour l'URL de serveur pour un serveur spécifique.
- **Authentification** : Nécessite une session valide et un jeton CSRF
- **Paramètres** :
  - `serverId` : l'identifiant du serveur
- **Corps de la requête** :

  ```json
  {
    "server_url": "http://localhost:8200"
  }
  ```

- **Response** :

  ```json
  {
    "message": "Server URL updated successfully",
    "serverId": "server-id",
    "serverName": "Server Name",
    "server_url": "http://localhost:8200"
  }
  ```

- **Réponses d'erreur** :
  - `401` : Non autorisé - Session ou jeton CSRF non valide
  - `400` : Format d'URL non valide
  - `404` : Serveur introuvable
  - `500` : Erreur de serveur pendant la mise à jour
- **Remarques** : 
  - Le point de terminaison valide le format de l'URL avant la mise à jour
  - Les URL de serveur vides ou nulles sont autorisées
  - Prend en charge les protocoles HTTP et HTTPS
  - Renvoie les informations mises à jour sur le serveur

## Obtenir le mot de passe du serveur - `/api/servers/:serverId/password` {/* #get-server-password---apiserversserveridpassword */}
- **Point de terminaison** : `/api/servers/:serverId/password`
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
  - `401` : Session non valide ou expirée
  - `500` : Échec de la génération du jeton CSRF
- **Remarques** :
  - Renvoie un jeton CSRF à utiliser lors des opérations de mise à jour du mot de passe
  - La session doit être valide pour générer un jeton

## Mettre à jour le mot de passe du serveur - `/api/servers/:serverId/password` {/* #update-server-password---apiserversserveridpassword */}
- **Point de terminaison** : `/api/servers/:serverId/password`
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

- **Response** :

  ```json
  {
    "message": "Password updated successfully",
    "serverId": "server-id"
  }
  ```

- **Réponses d'erreur** :
  - `400` : Le mot de passe doit être une chaîne de caractères
  - `401` : Non autorisé - Session ou jeton CSRF non valide
  - `500` : Échec de la mise à jour du mot de passe
- **Remarques** :
  - Le mot de passe peut être une chaîne vide pour effacer le mot de passe
  - Le mot de passe est stocké de manière sécurisée à l'aide du système de gestion des secrets

## Gestion des utilisateurs {/* #user-management */}

### Répertorier les utilisateurs - `/api/users` {/* #list-users---apiusers */}
- **Point de terminaison** : `/api/users`
- **Méthode** : GET
- **Description** : Répertorie tous les utilisateurs avec pagination et filtrage de recherche facultatif. Renvoie les informations utilisateur, y compris l'historique de connexion et l'état du compte.
- **Authentification** : Nécessite des privilèges d'administrateur, une session valide et un jeton CSRF
- **Paramètres de requête** :
  - `page` (facultatif) : Numéro de page (par défaut : 1)
  - `limit` (facultatif) : Éléments par page (par défaut : 50)
  - `search` (facultatif) : terme de recherche pour filtrer par nom d'utilisateur
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
  - `401` : Non autorisé - Session ou jeton CSRF non valide
  - `403` : Interdit - Privilèges Admin requis
  - `500` : Erreur interne du serveur
- **Remarques** :
  - Accessible uniquement aux utilisateurs Admin
  - Prend en charge la pagination et le filtrage par recherche
  - Renvoie l'état du compte utilisateur, y compris l'état de verrouillage

### Créer un utilisateur - `/api/users` {/* #create-user---apiusers */}
- **Point de terminaison** : `/api/users`
- **Méthode** : POST
- **Description** : Crée un nouveau compte utilisateur. Peut générer un mot de passe temporaire ou utiliser un mot de passe fourni.
- **Authentification** : nécessite des privilèges admin, une session valide et un jeton CSRF
- **Corps de la requête** :

  ```json
  {
    "username": "newuser",
    "password": "optional-password",
    "isAdmin": false,
    "requirePasswordChange": true
  }
  ```

- `username` : Requis, doit comporter entre 3 et 50 caractères, unique
  - `password` : Facultatif, si non fourni, un mot de passe temporaire sécurisé est généré
  - `isAdmin` : Facultatif, par défaut false
  - `requirePasswordChange` : Facultatif, par défaut true
- **Response** :

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
  - `400` : Format de nom d'utilisateur non valide, non-respect de la politique de mot de passe ou erreurs de validation
  - `401` : Non autorisé - Session ou jeton CSRF non valide
  - `403` : Interdit - Privilèges Admin requis
  - `409` : Le nom d'utilisateur existe déjà
  - `500` : Erreur interne du serveur
- **Remarques** :
  - Accessible uniquement aux utilisateurs Admin
  - Le nom d'utilisateur est insensible à la casse et stocké en minuscules
  - Si le mot de passe n'est pas fourni, un mot de passe sécurisé de 12 caractères est généré
  - Les mots de passe temporaires générés ne sont renvoyés qu'une seule fois dans la réponse
  - La création de l'utilisateur est consignée dans le journal d'audit

### Mettre à jour l'utilisateur - `/api/users/:id` {/* #update-user---apiusersid */}
- **Point de terminaison** : `/api/users/:id`
- **Méthode** : PATCH
- **Description** : Met à jour les informations de l'utilisateur, notamment le nom d'utilisateur, le statut Admin, l'obligation de changement de mot de passe et la réinitialisation du mot de passe.
- **Authentification** : Requiert des privilèges Admin, une session valide et un jeton CSRF
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
  - `resetPassword` : Si true, génère un nouveau mot de passe temporaire et définit `requirePasswordChange` sur true
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
  - `400` : Entrée non valide ou erreurs de validation
  - `401` : Non autorisé - Session ou jeton CSRF non valide
  - `403` : Interdit - Privilèges Admin requis
  - `404` : Utilisateur introuvable
  - `409` : Le nom d'utilisateur existe déjà (en cas de modification du nom d'utilisateur)
  - `500` : Erreur interne du serveur
- **Remarques** :
  - Accessible uniquement aux utilisateurs Admin
  - Les modifications de nom d'utilisateur font l'objet d'une validation d'unicité
  - La réinitialisation du mot de passe génère un mot de passe temporaire sécurisé de 12 caractères
  - Toutes les modifications sont consignées dans le journal d'audit

### Supprimer l'utilisateur - `/api/users/:id` {/* #delete-user---apiusersid */}
- **Point de terminaison** : `/api/users/:id`
- **Méthode** : DELETE
- **Description** : Supprime un compte utilisateur. Empêche de vous supprimer vous-même ou de supprimer le dernier compte Admin.
- **Authentification** : Requiert des privilèges Admin, une session valide et un jeton CSRF
- **Paramètres** :
  - `id` : ID de l'utilisateur à supprimer
- **Réponse** :

  ```json
  {
    "success": true,
    "message": "User deleted successfully"
  }
  ```

- **Error Responses** :
  - `400` : Impossible de supprimer votre propre compte ou le dernier compte administrateur
  - `401` : Non autorisé - Session ou jeton CSRF non valide
  - `403` : Interdit - Privilèges d'administrateur requis
  - `404` : Utilisateur introuvable
  - `500` : Erreur interne du serveur
- **Notes** :
  - Accessible uniquement aux utilisateurs administrateurs
  - Impossible de supprimer votre propre compte
  - Impossible de supprimer le dernier compte administrateur (au moins un administrateur doit rester)
  - La suppression d'un utilisateur est enregistrée dans le journal d'audit
  - Les sessions associées sont automatiquement supprimées (en cascade)

## Audit Log Management {/* #audit-log-management */}

### List Audit Logs - `/api/audit-log` {/* #list-audit-logs---apiaudit-log */}
- **Endpoint** : `/api/audit-log`
- **Method** : GET
- **Description** : Récupère les entrées du journal d'audit avec des fonctionnalités de filtrage, de pagination et de recherche. Prend en charge la pagination basée sur les pages et sur le décalage (offset).
- **Authentication** : Nécessite une session valide et un jeton CSRF (utilisateur connecté requis)
- **Query Parameters** :
  - `page` (facultatif) : Numéro de page pour la pagination par page
  - `offset` (facultatif) : Décalage pour la pagination par décalage (prioritaire sur la page)
  - `limit` (facultatif) : Éléments par page (valeur par défaut : 50)
  - `startDate` (facultatif) : Filtrer les journaux à partir de cette date (format ISO)
  - `endDate` (facultatif) : Filtrer les journaux jusqu'à cette date (format ISO)
  - `userId` (facultatif) : Filtrer par identifiant d'utilisateur
  - `username` (facultatif) : Filtrer par nom d'utilisateur
  - `action` (facultatif) : Filtrer par nom d'action
  - `category` (facultatif) : Filtrer par catégorie (`auth`, `user_management`, `config`, `backup`, `server`)
  - `status` (facultatif) : Filtrer par statut (`success`, `failure`, `error`)
- **Response** :

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

- **Error Responses** :
  - `401` : Non autorisé - Session ou jeton CSRF non valide
  - `500` : Erreur interne du serveur
- **Notes** :
  - Prend en charge la pagination par page (`page`) et par décalage (`offset`)
  - Le champ `details` contient du JSON analysé avec un contexte supplémentaire
  - Toutes les requêtes de journaux d'audit sont journalisées

### Get Audit Log Filter Values - `/api/audit-log/filters` {/* #get-audit-log-filter-values---apiaudit-logfilters */}
- **Endpoint** : `/api/audit-log/filters`
- **Method** : GET
- **Description** : Récupère les valeurs de filtre uniques disponibles pour filtrer les journaux d'audit. Renvoie toutes les actions, catégories et tous les statuts distincts qui existent dans la base de données des journaux d'audit. Utile pour alimenter les listes déroulantes de filtres dans l'interface utilisateur.
- **Authentication** : Nécessite une session valide et un jeton CSRF (utilisateur connecté requis)
- **Response** :

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

- **Error Responses** :
  - `401` : Non autorisé - Session ou jeton CSRF non valide
  - `500` : Erreur interne du serveur
- **Notes** :
  - Renvoie des tableaux de valeurs uniques provenant de la base de données des journaux d'audit
  - Les valeurs sont triées par ordre alphabétique
  - Des tableaux vides sont renvoyés si aucune donnée n'existe ou en cas d'erreur
  - Utilisé par la visionneuse de journaux d'audit pour alimenter dynamiquement les listes déroulantes de filtres

### Download Audit Logs - `/api/audit-log/download` {/* #download-audit-logs---apiaudit-logdownload */}
- **Endpoint** : `/api/audit-log/download`
- **Method** : GET
- **Description** : Télécharge les journaux d'audit au format CSV ou JSON avec filtrage facultatif. Utile pour l'analyse externe et les rapports.
- **Authentication** : Nécessite une session valide et un jeton CSRF (utilisateur connecté requis)
- **Query Parameters** :
  - `format` (facultatif) : Format d'exportation - `csv` ou `json` (par défaut : `csv`)
  - `startDate` (facultatif) : Filtrer les journaux à partir de cette date (format ISO)
  - `endDate` (facultatif) : Filtrer les journaux jusqu'à cette date (format ISO)
  - `userId` (facultatif) : Filtrer par identifiant d'utilisateur
  - `username` (facultatif) : Filtrer par nom d'utilisateur
  - `action` (facultatif) : Filtrer par nom d'action
  - `category` (facultatif) : Filtrer par catégorie
  - `status` (facultatif) : Filtrer par statut
- **Response** (CSV) :
  - Content-Type : `text/csv`
  - Content-Disposition : `attachment; filename="audit-log-YYYY-MM-DD.csv"`
  - Fichier CSV avec les en-têtes : ID, Horodatage, ID d'utilisateur, Nom d'utilisateur, Action, Catégorie, Type de cible, ID de cible, Statut, Adresse IP, Agent utilisateur, Détails, Message d'erreur
- **Response** (JSON) :
  - Content-Type : `application/json`
  - Content-Disposition : `attachment; filename="audit-log-YYYY-MM-DD.json"`
  - Tableau JSON d'entrées du journal d'audit
- **Réponses d'erreur** :
  - `400` : Aucun journal à exporter
  - `401` : Non autorisé - Session ou jeton CSRF non valide
  - `500` : Erreur interne du serveur
- **Remarques** :
  - La limite d'exportation est de 10 000 enregistrements
  - Le format CSV échappe correctement les caractères spéciaux
  - Le champ Détails dans le CSV est converti en chaîne JSON
  - Le nom de fichier inclut la date actuelle

### Nettoyer les journaux d'audit - `/api/audit-log/cleanup` {/* #cleanup-audit-logs---apiaudit-logcleanup */}
- **Point de terminaison** : `/api/audit-log/cleanup`
- **Méthode** : POST
- **Description** : Déclenche manuellement le nettoyage des anciens journaux d'audit en fonction de la période de conservation. Prend en charge le mode simulation pour afficher un aperçu de ce qui serait supprimé.
- **Authentification** : nécessite des privilèges admin, une session valide et un jeton CSRF
- **Corps de la requête** :

  ```json
  {
    "retentionDays": 90,
    "dryRun": false
  }
  ```

- `retentionDays` (facultatif) : Remplacer le nombre de jours de conservation (30 à 365), sinon la valeur configurée est utilisée
  - `dryRun` (facultatif) : Si la valeur est true, renvoie uniquement ce qui serait supprimé sans procéder à la suppression
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

- **Réponses d'erreur** :
  - `400` : Nombre de jours de conservation non valide (doit être compris entre 30 et 365)
  - `401` : Non autorisé - Session ou jeton CSRF non valide
  - `403` : Interdit - Privilèges admin requis
  - `500` : Erreur interne du serveur
- **Remarques** :
  - Accessible uniquement aux utilisateurs administrateurs
  - La conservation par défaut est de 90 jours si elle est non configuré
  - L'opération de nettoyage est consignée dans le journal d'audit
  - Le mode simulation est utile pour prévisualiser l'impact du nettoyage

### Obtenir la conservation des journaux d'audit - `/api/audit-log/retention` {/* #get-audit-log-retention---apiaudit-logretention */}
- **Point de terminaison** : `/api/audit-log/retention`
- **Méthode** : GET
- **Description** : Récupère la configuration actuelle de conservation des journaux d'audit en jours.
- **Authentification** : Nécessite une session valide et un jeton CSRF (aucun utilisateur connecté requis)
- **Réponse** :

  ```json
  {
    "retentionDays": 90
  }
  ```

- **Réponses d'erreur** :
  - `500` : Erreur interne du serveur
- **Remarques** :
  - La conservation par défaut est de 90 jours si elle est non configuré
  - Accessible sans authentification (lecture seule)

### Mettre à jour la conservation des journaux d'audit - `/api/audit-log/retention` {/* #update-audit-log-retention---apiaudit-logretention */}
- **Point de terminaison** : `/api/audit-log/retention`
- **Méthode** : PATCH
- **Description** : Met à jour la période de conservation des journaux d'audit en jours. Ce paramètre détermine la durée de conservation des journaux d'audit avant le nettoyage automatique.
- **Authentification** : nécessite des privilèges admin, une session valide et un jeton CSRF
- **Corps de la requête** :

  ```json
  {
    "retentionDays": 120
  }
  ```

- `retentionDays` : Requis, doit être compris entre 30 et 365 jours
- **Réponse** :

  ```json
  {
    "success": true,
    "retentionDays": 120
  }
  ```

- **Réponses d'erreur** :
  - `400` : Nombre de jours de conservation non valide (doit être compris entre 30 et 365)
  - `401` : Non autorisé - Session ou jeton CSRF non valide
  - `403` : Interdit - Privilèges admin requis
  - `500` : Erreur interne du serveur
- **Remarques** :
  - Accessible uniquement aux utilisateurs administrateurs
  - La modification de configuration est consignée dans le journal d'audit
  - La période de conservation a une incidence sur les opérations de nettoyage automatiques et manuelles

## Clés API {/* #api-keys */}

### Lister les clés API - `/api/api-keys` {/* #list-api-keys---apiapi-keys */}
- **Point de terminaison** : `/api/api-keys`
- **Méthode** : GET
- **Description** : Répertorie toutes les clés API. Les secrets ne sont jamais renvoyés ; chaque clé inclut une empreinte digitale (`Qk7v…3xTa`).
- **Authentification** : nécessite des privilèges admin, une session valide et un jeton CSRF
- **Réponses d'erreur** :
  - `401` : Non autorisé - Session ou jeton CSRF non valide
  - `403` : Interdit - Privilèges admin requis
  - `500` : Erreur interne du serveur

### Créer une clé API - `/api/api-keys` {/* #create-api-key---apiapi-keys */}
- **Point de terminaison** : `/api/api-keys`
- **Méthode** : POST
- **Description** : Crée une clé API avec portée. Le secret en texte clair est renvoyé uniquement dans cette réponse.
- **Authentification** : nécessite des privilèges admin, une session valide et un jeton CSRF
- **Corps de la requête** :

  ```json
  {
    "name": "Duplicati uploads",
    "scope": "upload",
    "description": "Optional",
    "expiresAt": null
  }
  ```

- **Réponses d'erreur** :
  - `400` : Nom manquant ou portée non valide (`upload` ou `read`)
  - `401` : Non autorisé - Session ou jeton CSRF non valide
  - `403` : Interdit - Privilèges admin requis
  - `500` : Erreur interne du serveur

### Mettre à jour la clé API - `/api/api-keys/:id` {/* #update-api-key---apiapi-keysid */}
- **Point de terminaison** : `/api/api-keys/:id`
- **Méthode** : PATCH
- **Description** : Active ou désactive une clé.
- **Authentification** : nécessite des privilèges admin, une session valide et un jeton CSRF

### Supprimer la clé API - `/api/api-keys/:id` {/* #delete-api-key---apiapi-keysid */}
- **Point de terminaison** : `/api/api-keys/:id`
- **Méthode** : DELETE
- **Description** : Supprime une clé. Les clients existants qui utilisent ce secret perdent immédiatement l'accès.
- **Authentification** : nécessite des privilèges admin, une session valide et un jeton CSRF

## Gestion de la base de données {/* #database-management */}

### Sauvegarder la base de données - `/api/database/backup` {/* #backup-database---apidatabasebackup */}
- **Point de terminaison** : `/api/database/backup`
- **Méthode** : GET
- **Description** : Crée une sauvegarde de la base de données au format binaire (.db) ou SQL (.sql). Le fichier de sauvegarde est automatiquement téléchargé avec un nom de fichier horodaté.
- **Authentification** : nécessite des privilèges admin, une session valide et un jeton CSRF
- **Paramètres de requête** :
  - `format` (facultatif) : Format de sauvegarde - `db` (binaire) ou `sql` (dump SQL). Par défaut : `db`
- **Réponse** :
  - Content-Type : `application/octet-stream` (pour .db) ou `text/plain` (pour .sql)
  - Content-Disposition : `attachment; filename="duplistatus-backup-YYYY-MM-DDTHH-MM-SS.db"` ou `.sql`
  - Contenu de fichier binaire (pour .db) ou contenu textuel SQL (pour .sql)
- **Réponses d'erreur** :
  - `400` : Format non valide (doit être "db" ou "sql")
  - `401` : Non autorisé - Session ou jeton CSRF non valide
  - `403` : Interdit - Privilèges admin requis
  - `500` : Échec de la création de la sauvegarde de la base de données
- **Remarques** :
  - Accessible uniquement aux utilisateurs admin
  - Le format binaire utilise la méthode de sauvegarde de SQLite pour garantir l'intégrité
  - Le format SQL crée un dump textuel de tout le contenu de la base de données
  - L'horodatage dans le nom de fichier utilise le fuseau horaire local du serveur
  - L'opération de sauvegarde est enregistrée dans le journal d'audit
  - Les fichiers temporaires sont automatiquement nettoyés après le téléchargement

### Restaurer la base de données - `/api/database/restore` {/* #restore-database---apidatabaserestore */}
- **Point de terminaison** : `/api/database/restore`
- **Méthode** : POST
- **Description** : Restaure la base de données à partir d'un fichier de sauvegarde (au format .db ou .sql). Crée une sauvegarde de sécurité avant la restauration et efface toutes les sessions après la restauration pour des raisons de sécurité.
- **Authentication** : Requiert des privilèges Admin, une session valide et un jeton CSRF
- **Request Body** : FormData avec un champ de fichier nommé `database`
  - Le fichier doit être au format `.db`, `.sqlite`, `.sqlite3` (format binaire) ou `.sql` (format SQL)
  - Taille de fichier maximale : 100 Mo
- **Response** :

  ```json
  {
    "success": true,
    "message": "Database restored successfully from DB file",
    "safetyBackupPath": "duplistatus-backup-YYYY-MM-DDTHH-MM-SS.db",
    "requiresReauth": true
  }
  ```

- **Error Responses** :
  - `400` : Aucun fichier fourni, taille de fichier dépassant la limite, format de fichier non valide ou échec de la vérification d'intégrité de la base de données
  - `401` : Non autorisé - Session ou jeton CSRF non valide
  - `403` : Interdit - Privilèges Admin requis
  - `500` : Échec de la restauration de la base de données (la base de données d'origine est restaurée à partir de la sauvegarde de sécurité en cas d'échec de la restauration)
- **Notes** :
  - Accessible uniquement aux utilisateurs Admin
  - Crée automatiquement une sauvegarde de sécurité avant la restauration
  - Prend en charge à la fois les formats binaires (.db) et SQL (.sql)
  - Valide l'intégrité de la base de données après la restauration
  - En cas d'échec de la restauration, restaure automatiquement à partir de la sauvegarde de sécurité
  - Toutes les sessions sont effacées après une restauration réussie pour des raisons de sécurité
  - Renvoie `requiresReauth: true` pour indiquer que l'utilisateur doit se reconnecter
  - L'opération de restauration est consignée dans le Journal d'audit
  - Pour le format SQL, valide le contenu SQL avant l'exécution
  - La connexion à la base de données est réinitialisée après la restauration
  - Tous les caches sont invalidés après la restauration

## Horodatages des sauvegardes {/* #backup-timestamps */}

### Obtenir les horodatages de la dernière sauvegarde - `/api/backups/last-timestamps` {/* #get-last-backup-timestamps---apibackupslast-timestamps */}
- **Endpoint** : `/api/backups/last-timestamps`
- **Method** : GET
- **Description** : Récupère l'horodatage de la dernière sauvegarde pour chaque combinaison serveur-sauvegarde. Renvoie une map pour une recherche facile.
- **Authentication** : Requiert une session valide et un jeton CSRF
- **Response** :

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

- **Error Responses** :
  - `401` : Non autorisé - Session ou jeton CSRF non valide
  - `500` : Échec de la récupération des horodatages de la dernière sauvegarde
- **Notes** :
  - Renvoie à la fois une map (pour une recherche facile par `server_id:backup_name`) et un format de tableau brut
  - Inclut des en-têtes de contrôle du cache pour empêcher la mise en cache
  - Utile pour suivre les heures de la dernière sauvegarde sur toutes les combinaisons serveur-sauvegarde
  - Les horodatages sont au format ISO

## Gestion des journaux de l'application {/* #application-logs-management */}

### Obtenir les journaux de l'application - `/api/application-logs` {/* #get-application-logs---apiapplication-logs */}
- **Endpoint** : `/api/application-logs`
- **Method** : GET
- **Description** : Récupère les entrées de journaux de l'application à partir des fichiers journaux. Prend en charge la lecture des fichiers journaux actuels et avec rotation avec la fonctionnalité tail.
- **Authentication** : Requiert des privilèges Admin, une session valide et un jeton CSRF
- **Query Parameters** :
  - `file` (facultatif) : Nom du fichier journal à lire - `application.log`, `application.log.1`, `application.log.2`, etc. S'il n'est pas fourni, renvoie la liste des fichiers disponibles
  - `tail` (facultatif) : Nombre de lignes à renvoyer depuis la fin du fichier (par défaut : 1000, min : 1, max : 10000)
- **Response** (avec le paramètre file) :

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

- **Response** (sans le paramètre file) :

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

- **Error Responses** :
  - `400` : Paramètre tail non valide (doit être compris entre 1 et 10000) ou format de paramètre file non valide
  - `401` : Non autorisé - Session ou jeton CSRF non valide
  - `403` : Interdit - Privilèges Admin requis
  - `404` : Fichier journal introuvable
  - `500` : Échec de la lecture du fichier journal
- **Notes** :
  - Accessible uniquement aux utilisateurs Admin
  - Prend en charge la lecture du fichier journal actuel et des fichiers journaux avec rotation (jusqu'à 10 fichiers avec rotation)
  - Renvoie les N dernières lignes (tail) du fichier journal spécifié
  - Le nom du fichier journal est déterminé par une variable d'environnement (par défaut : `application.log`)
  - Renvoie la liste des fichiers journaux disponibles lorsque le paramètre file n'est pas fourni
  - Les noms de fichiers sont validés pour empêcher les attaques par traversée de répertoires
  - Les fichiers ayant fait l'objet d'une rotation sont numérotés de manière séquentielle (`.1`, `.2`, etc.)

### Exporter les Journaux de l'application - `/api/application-logs/export` {/* #export-application-logs---apiapplication-logsexport */}
- **Endpoint** : `/api/application-logs/export`
- **Méthode** : GET
- **Description** : Exporte les entrées du journal d'application au format texte filtré. Prend en charge le filtrage par niveau de journalisation et par chaîne de recherche.
- **Authentification** : Nécessite des privilèges Admin, une session valide et un jeton CSRF
- **Paramètres de requête** :
  - `file` (requis) : Nom du fichier journal à exporter - `application.log`, `application.log.1`, `application.log.2`, etc.
  - `logLevels` (facultatif) : Liste séparée par des virgules des niveaux de journalisation à inclure - `INFO`, `WARN`, `ERROR` (valeur par défaut : `INFO,WARN,ERROR`)
  - `search` (facultatif) : Chaîne de recherche pour filtrer les lignes de journal (insensible à la casse)
- **Réponse** :
  - Content-Type : `text/plain`
  - Content-Disposition : `attachment; filename="duplistatus-logs-YYYY-MM-DDTHH-MM-SS.txt"`
  - Contenu du journal filtré sous forme de texte brut
- **Réponses d'erreur** :
  - `400` : Le paramètre file est obligatoire ou son format n'est pas valide
  - `401` : Non autorisé - Session ou jeton CSRF non valide
  - `403` : Interdit - Privilèges Admin requis
  - `500` : Échec de l'exportation des journaux
- **Remarques** :
  - Accessible uniquement aux utilisateurs administrateurs
  - Exporte les entrées de journal filtrées en fonction du niveau de journalisation et des critères de recherche
  - Prend en charge le filtrage par niveaux de journalisation : `INFO`, `WARN`, `ERROR`
  - Le filtrage par chaîne de recherche est insensible à la casse
  - Les lignes vides sont automatiquement éliminées
  - Le nom du fichier journal est déterminé par une variable d'environnement (valeur par défaut : `application.log`)
  - Les noms de fichiers sont validés pour empêcher les attaques par traversée de répertoires
  - Le fichier exporté inclut un horodatage dans son nom
  - Utile pour l'analyse externe et le dépannage
