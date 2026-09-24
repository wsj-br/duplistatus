# Administration {/* #administration */}

## Collecter les sauvegardes - `/api/backups/collect` {/* #collect-backups---apibackupscollect */}
- **Endpoint** : `/api/backups/collect`
- **Méthode** : POST
- **Description** : Collecte les données de sauvegarde directement depuis un serveur Duplicati via son API. Ce point de terminaison détecte automatiquement le meilleur protocole de connexion (HTTPS avec validation SSL, HTTPS avec certificats auto-signés ou HTTP comme solution de repli) et se connecte au serveur Duplicati pour récupérer les informations de sauvegarde et les traiter dans la base de données locale.
- **Authentification** : Requiert une session valide et un jeton CSRF
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
  - `400` : Paramètres de requête non valides ou échec de connexion
  - `500` : Erreur du serveur pendant la collecte de sauvegarde
- **Notes** : 
  - Le point de terminaison détecte automatiquement le protocole de connexion optimal (HTTPS → HTTPS avec certificat auto-signé → HTTP)
  - Les tentatives de détection de protocole sont effectuées par ordre de préférence de sécurité
  - Les délais d'expiration de connexion sont configurables via des variables d'environnement
  - Les journaux collectent les données en mode développement pour le débogage
  - S'assure que les paramètres de sauvegarde sont complets pour tous les serveurs et sauvegardes
  - Utilise le port par défaut 8200 si non spécifié
  - Le protocole détecté et l'URL du serveur sont automatiquement stockés dans la base de données
  - `serverAlias` est récupéré depuis la base de données et peut être vide si aucun alias n'est défini
  - L'interface frontend devrait utiliser `serverAlias || serverName` à des fins d'affichage
  - Prend en charge à la fois le téléchargement JSON et les méthodes de collecte API directe

## Nettoyer les sauvegardes - `/api/backups/cleanup` {/* #cleanup-backups---apibackupscleanup */}
- **Endpoint** : `/api/backups/cleanup`
- **Méthode** : POST
- **Description** : Supprime les anciennes données de sauvegarde selon la période de rétention. Ce point de terminaison permet de gérer la taille de la base de données en supprimant les enregistrements de sauvegarde obsolètes tout en préservant les données récentes et importantes.
- **Authentification** : Requiert une session valide et un jeton CSRF
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

Pour l'option "Supprimer toutes les données" :

  ```json
  {
    "message": "Successfully deleted all 15 backups and 3 servers, and cleared configuration settings",
    "status": 200
  }
  ```

- **Réponses d'erreur** :
  - `401` : Non autorisé - Session invalide ou jeton CSRF invalide
  - `400` : Période de rétention spécifiée non valide
  - `500` : Erreur du serveur pendant l'opération de nettoyage avec informations d'erreur détaillées
- **Notes** : 
  - L'opération de nettoyage est irréversible
  - Les données de sauvegarde sont supprimées définitivement de la base de données
  - Les enregistrements de machine sont conservés même si toutes les sauvegardes sont supprimées
  - Lorsque « Supprimer toutes les données » est sélectionné, toutes les machines et sauvegardes sont supprimées et la configuration est effacée
  - Le rapport d'erreurs amélioré inclut des détails et une trace de pile en mode développement
  - Prend en charge à la fois la rétention basée sur le temps et la suppression complète des données

## Supprimer la tâche de sauvegarde - `/api/backups/delete-job` {/* #delete-backup-job---apibackupsdelete-job */}
- **Endpoint** : `/api/backups/delete-job`
- **Méthode** : DELETE
- **Description** : Supprime tous les enregistrements de sauvegarde pour une combinaison serveur-sauvegarde spécifique. Ce point de terminaison n'est disponible qu'en mode développement.
- **Authentification** : Requiert une session valide et un jeton CSRF
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
  - `401` : Non autorisé - Session invalide ou jeton CSRF invalide
  - `403` : La suppression de tâche de sauvegarde n'est disponible qu'en mode développement
  - `400` : L'ID du serveur et le nom de la sauvegarde sont requis
  - `404` : Aucune sauvegarde trouvée à supprimer
  - `500` : Erreur du serveur pendant la suppression avec informations d'erreur détaillées
- **Notes** : 
  - Cette opération n'est disponible qu'en mode développement
  - Cette opération est irréversible
  - Tous les enregistrements de sauvegarde pour la combinaison serveur-sauvegarde spécifiée seront définitivement supprimés
  - Renvoie le nombre de sauvegardes supprimées et les informations du serveur
  - Utilise l'alias du serveur pour l'affichage si disponible, sinon revient au nom du serveur

## Synchroniser les planifications de sauvegarde - `/api/backups/sync-schedule` {/* #sync-backup-schedules---apibackupssync-schedule */}
- **Point de terminaison** : `/api/backups/sync-schedule`
- **Méthode** : POST
- **Description** : Synchronise les informations de planification de sauvegarde à partir d'un serveur duplicati. Ce point de terminaison se connecte au serveur, récupère les informations de planification pour toutes les sauvegardes et met à jour les paramètres de sauvegarde locaux avec les détails de planification, notamment les intervalles de répétition, les jours de la semaine autorisés et les heures de planification.
- **Authentification** : Requiert une session valide et un jeton CSRF
- **Corps de la requête** :

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
  - `400` : Paramètres de requête non valides, nom d'hôte/mot de passe manquant lorsque serverId n'est pas fourni, ou échec de connexion
  - `404` : Serveur introuvable (lorsque serverId est fourni) ou aucun mot de passe stocké pour le serveur
  - `500` : Erreur du serveur pendant la synchronisation de planning
- **Notes** : 
  - Le point de terminaison détecte automatiquement le protocole de connexion optimal (HTTPS → HTTPS avec certificat auto-signé → HTTP)
  - Peut être appelé avec seulement serverId pour utiliser les identifiants de serveur stockés
  - Peut être appelé avec serverId et nouveaux identifiants pour mettre à jour les détails de connexion du serveur
  - Peut être appelé avec nom d'hôte/port/mot de passe sans serverId pour les nouveaux serveurs
  - Met à jour les paramètres de sauvegarde avec les informations de planning, notamment :
    - `expectedInterval` : L'intervalle de répétition (par exemple, « Daily », « Weekly », « Monthly »)
    - `allowedWeekDays` : Tableau des jours de la semaine autorisés (0=dimanche, 1=lundi, etc.)
    - `time` : L'heure planifiée pour la sauvegarde
  - Traite toutes les sauvegardes trouvées sur le serveur
  - Renvoie des statistiques sur les sauvegardes traitées et toutes les erreurs rencontrées
  - Enregistre des événements d'audit pour les opérations de synchronisation réussies et échouées
  - Utilise le port par défaut 8200 si non spécifié

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

- **Réponse** :

  ```json
  {
    "success": true,
    "message": "Connection successful"
  }
  ```

- **Réponses d'erreur** :
  - `400` : Format d'URL non valide ou URL du serveur manquante
  - `500` : Erreur du serveur pendant le test de connexion
- **Notes** : 
  - Le point de terminaison valide le format d'URL et teste la connectivité
  - Renvoie un succès si le serveur répond avec un statut 401 (attendu pour le point de terminaison de connexion sans identifiants)
  - Teste la connexion au point de terminaison de connexion du serveur Duplicati
  - Prend en charge les protocoles HTTP et HTTPS
  - Utilise la configuration de délai d'attente pour les tests de connexion

## Obtenir l'URL du serveur - `/api/servers/:serverId/server-url` {/* #get-server-url---apiserversserveridserver-url */}
- **Point de terminaison** : `/api/servers/:serverId/server-url`
- **Méthode** : GET
- **Description** : Récupère l'URL du serveur pour un serveur spécifique.
- **Parameters** :
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
  - Renvoie l'URL du serveur spécifique
  - Utilisé pour la gestion des connexions serveur
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
  - `400` : Format d'URL non valide
  - `404` : Serveur introuvable
  - `500` : Erreur du serveur lors de la mise à jour
- **Remarques** : 
  - Le point de terminaison valide le format de l'URL avant la mise à jour
  - Les URL de serveur vides ou nulles sont autorisées
  - Prend en charge les protocoles HTTP et HTTPS
  - Retourne les informations mises à jour du serveur

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
  - `401` : Session invalide ou expirée
  - `500` : Échec de la génération du jeton CSRF
- **Remarques** :
  - Retourne le jeton CSRF à utiliser avec les opérations de mise à jour du mot de passe
  - La session doit être valide pour générer le jeton

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

- **Réponse** :

  ```json
  {
    "message": "Password updated successfully",
    "serverId": "server-id"
  }
  ```

- **Réponses d'erreur** :
  - `400` : Le mot de passe doit être une chaîne
  - `401` : Non autorisé - Session ou jeton CSRF invalide
  - `500` : Échec de la mise à jour du mot de passe
- **Remarques** :
  - Le mot de passe peut être une chaîne vide pour effacer le mot de passe
  - Le mot de passe est stocké en toute sécurité à l'aide du système de gestion des secrets

## Gestion des utilisateurs {/* #user-management */}

### Répertorier les utilisateurs - `/api/users` {/* #list-users---apiusers */}
- **Point de terminaison** : `/api/users`
- **Méthode** : GET
- **Description** : Répertorie tous les utilisateurs avec pagination et filtrage de recherche facultatif. Renvoie les informations utilisateur, y compris l'historique de connexion et l'état du compte.
- **Authentification** : Nécessite des privilèges administrateur, une session valide et un jeton CSRF
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
        "accessAllServers": true,
        "serverIds": [],
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
  - `403` : Interdit - Privilèges administrateur requis
  - `500` : Erreur interne du serveur
- **Remarques** :
  - Uniquement accessible aux utilisateurs administrateurs
  - Prend en charge la pagination et le filtrage de recherche
  - Retourne le statut du compte utilisateur, y compris le statut de verrouillage

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
    "requirePasswordChange": true,
    "accessAllServers": false,
    "serverIds": ["server-id"]
  }
  ```

- `username` : Obligatoire, doit comporter entre 3 et 50 caractères et être unique
  - `password` : Facultatif, si non fourni, un mot de passe temporaire sécurisé est généré
  - `isAdmin` : Facultatif, par défaut false. Les utilisateurs Admin reçoivent toujours tous les serveurs
  - `requirePasswordChange` : Facultatif, par défaut true
  - `accessAllServers` : Facultatif, par défaut true. Quand false, `serverIds` est le seul ensemble de serveurs que l'utilisateur peut voir
  - `serverIds` : Tableau facultatif d'identifiants de serveurs existants. Les identifiants inconnus sont rejetés. Ignoré quand l'utilisateur est un Admin ou que `accessAllServers` n'est pas false
- **Réponse** :

  ```json
  {
    "user": {
      "id": "user-id",
      "username": "newuser",
      "isAdmin": false,
      "mustChangePassword": true,
      "accessAllServers": true,
      "serverIds": []
    },
    "temporaryPassword": "generated-password-123"
  }
  ```

- `temporaryPassword` n'est inclus que si un mot de passe a été généré automatiquement
- **Réponses d'erreur** :
  - `400` : Format de nom d'utilisateur invalide, violation de la politique de mot de passe ou erreurs de validation
  - `401` : Non autorisé - Session ou jeton CSRF invalide
  - `403` : Interdit - Privilèges administrateur requis
  - `409` : Nom d'utilisateur existe déjà
  - `500` : Erreur interne du serveur
- **Remarques** :
  - Uniquement accessible aux utilisateurs administrateurs
  - Le nom d'utilisateur est insensible à la casse et stocké en minuscules
  - Si le mot de passe n'est pas fourni, un mot de passe sécurisé de 12 caractères est généré
  - Les mots de passe temporaires générés ne sont retournés qu'une seule fois dans la réponse
  - La création d'utilisateur est enregistrée dans le journal d'audit

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
    "resetPassword": true,
    "password": "optional-custom-password",
    "accessAllServers": false,
    "serverIds": ["server-id"]
  }
  ```

- Tous les champs sont facultatifs
  - `accessAllServers` et `serverIds` : Mêmes règles que pour la création. Promouvoir un utilisateur en Admin accorde l'accès à tous les serveurs. Rétrograder un Admin réinitialise l'accès à tous les serveurs à moins qu'une liste personnalisée ne soit envoyée dans la même requête
  - `resetPassword` : Si true, définit un nouveau mot de passe. `password`, quand fourni, est utilisé après les vérifications de stratégie. Quand `password` est omis, un mot de passe temporaire est généré
  - `requirePasswordChange` : Avec `resetPassword`, par défaut true. Envoyez `false` pour effacer l'indicateur de changement de mot de passe obligatoire
- **Réponse** (avec réinitialisation du mot de passe) :

  ```json
  {
    "user": {
      "id": "user-id",
      "username": "updated-username",
      "isAdmin": true,
      "mustChangePassword": true,
      "accessAllServers": true,
      "serverIds": []
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
      "mustChangePassword": false,
      "accessAllServers": true,
      "serverIds": []
    }
  }
  ```

- **Réponses d'erreur** :
  - `400` : Entrée non valide ou erreurs de validation
  - `401` : Non autorisé - Session ou jeton CSRF non valide
  - `403` : Interdit - Privilèges Admin requis
  - `404` : Utilisateur introuvable
  - `409` : Le nom d'utilisateur existe déjà (si changement de nom d'utilisateur)
  - `500` : Erreur interne du serveur
- **Notes** :
  - Uniquement accessible aux utilisateurs Admin
  - Les modifications de nom d'utilisateur sont validées pour garantir leur unicité
  - L'omission du mot de passe de réinitialisation génère un mot de passe temporaire sécurisé de 12 caractères, renvoyé une seule fois
  - Un mot de passe de réinitialisation fourni doit respecter la politique de mots de passe et n'est pas renvoyé
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

- **Réponses d'erreur** :
  - `400` : Impossible de supprimer votre propre compte ou le dernier compte administrateur
  - `401` : Non autorisé - Session ou jeton CSRF invalide
  - `403` : Interdit - Privilèges administrateur requis
  - `404` : Utilisateur introuvable
  - `500` : Erreur interne du serveur
- **Remarques** :
  - Uniquement accessible aux utilisateurs administrateurs
  - Impossible de supprimer votre propre compte
  - Impossible de supprimer le dernier compte administrateur (au moins un administrateur doit rester)
  - La suppression d'utilisateur est enregistrée dans le journal d'audit
  - Les sessions associées sont automatiquement supprimées (en cascade)

## Audit Log Management {/* #audit-log-management */}

### List Audit Logs - `/api/audit-log` {/* #list-audit-logs---apiaudit-log */}
- **Endpoint** : `/api/audit-log`
- **Method** : GET
- **Description** : Récupère les entrées du journal d'audit avec des fonctionnalités de filtrage, de pagination et de recherche. Prend en charge la pagination basée sur les pages et sur le décalage (offset).
- **Authentification** : Nécessite une session valide et un jeton CSRF (utilisateur connecté requis)
- **Paramètres de requête** :
  - `page` (facultatif) : Numéro de page pour la pagination basée sur les pages
  - `offset` (facultatif) : Décalage pour la pagination basée sur le décalage (prévaut sur la page)
  - `limit` (facultatif) : Éléments par page (par défaut : 50)
  - `startDate` (facultatif) : Filtrer les journaux à partir de cette date (format ISO)
  - `endDate` (facultatif) : Filtrer les journaux jusqu'à cette date (format ISO)
  - `userId` (facultatif) : Filtrer par ID utilisateur
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
  - Prend en charge la pagination basée sur les pages (`page`) et la pagination basée sur le décalage (`offset`)
  - Le champ `details` contient du JSON analysé avec un contexte supplémentaire
  - Toutes les requêtes de journal d'audit sont enregistrées

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

- **Réponses d'erreur** :
  - `401` : Non autorisé - Session ou jeton CSRF invalide
  - `500` : Erreur interne du serveur
- **Remarques** :
  - Renvoie des tableaux de valeurs uniques provenant de la base de données du journal d'audit
  - Les valeurs sont triées alphabétiquement
  - Des tableaux vides sont renvoyés s'il n'existe aucune donnée ou en cas d'erreur
  - Utilisé par la visionneuse de journaux d'audit pour remplir dynamiquement les menus déroulants de filtre

### Download Audit Logs - `/api/audit-log/download` {/* #download-audit-logs---apiaudit-logdownload */}
- **Endpoint** : `/api/audit-log/download`
- **Method** : GET
- **Description** : Télécharge les journaux d'audit au format CSV ou JSON avec filtrage facultatif. Utile pour l'analyse externe et les rapports.
- **Authentification** : Nécessite une session valide et un jeton CSRF (utilisateur connecté requis)
- **Paramètres de requête** :
  - `format` (facultatif) : Format d'export - `csv` ou `json` (par défaut : `csv`)
  - `startDate` (facultatif) : Filtrer les journaux à partir de cette date (format ISO)
  - `endDate` (facultatif) : Filtrer les journaux jusqu'à cette date (format ISO)
  - `userId` (facultatif) : Filtrer par ID utilisateur
  - `username` (facultatif) : Filtrer par nom d'utilisateur
  - `action` (facultatif) : Filtrer par nom d'action
  - `category` (facultatif) : Filtrer par catégorie
  - `status` (facultatif) : Filtrer par statut
- **Réponse** (CSV) :
  - Content-Type : `text/csv`
  - Content-Disposition : `attachment; filename="audit-log-YYYY-MM-DD.csv"`
  - Fichier CSV avec en-têtes : ID, Horodatage, ID utilisateur, Nom d'utilisateur, Action, Catégorie, Type de cible, ID de cible, Statut, Adresse IP, Agent utilisateur, Détails, Message d'erreur
- **Réponse** (JSON) :
  - Content-Type : `application/json`
  - Content-Disposition : `attachment; filename="audit-log-YYYY-MM-DD.json"`
  - Tableau JSON d'entrées de journal d'audit
- **Réponses d'erreur** :
  - `400` : Aucun journal à exporter
  - `401` : Non autorisé - Session ou jeton CSRF invalide
  - `500` : Erreur interne du serveur
- **Remarques** :
  - La limite d'export est de 10 000 enregistrements
  - Le format CSV échappe correctement les caractères spéciaux
  - Le champ Détails dans le CSV est converti en chaîne JSON
  - Le nom du fichier inclut la date actuelle

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
  - `400` : Jours de rétention invalides (doit être entre 30 et 365)
  - `401` : Non autorisé - Session ou jeton CSRF invalide
  - `403` : Interdit - Privilèges administrateur requis
  - `500` : Erreur interne du serveur
- **Remarques** :
  - Uniquement accessible aux utilisateurs administrateurs
  - La rétention par défaut est de 90 jours si non configurée
  - L'opération de nettoyage est enregistrée dans le journal d'audit
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
  - La rétention par défaut est de 90 jours si non configurée
  - Peut être consulté sans authentification (lecture seule)

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
  - `400` : Jours de rétention invalides (doit être entre 30 et 365)
  - `401` : Non autorisé - Session ou jeton CSRF invalide
  - `403` : Interdit - Privilèges administrateur requis
  - `500` : Erreur interne du serveur
- **Remarques** :
  - Uniquement accessible aux utilisateurs administrateurs
  - Le changement de configuration est enregistré dans le journal d'audit
  - La période de rétention affecte les opérations de nettoyage automatique et manuelle

## Clés API {/* #api-keys */}

### Lister les clés API - `/api/api-keys` {/* #list-api-keys---apiapi-keys */}
- **Point de terminaison** : `/api/api-keys`
- **Méthode** : GET
- **Description** : Répertorie toutes les clés API. Les secrets ne sont jamais renvoyés ; chaque clé inclut une empreinte digitale (`Qk7v…3xTa`).
- **Authentification** : Nécessite des privilèges administrateur, une session valide et un jeton CSRF
- **Réponses d'erreur** :
  - `401` : Non autorisé - Session ou jeton CSRF invalide
  - `403` : Interdit - Privilèges administrateur requis
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
  - `400` : Nom manquant ou portée invalide (`upload` ou `read`)
  - `401` : Non autorisé - Session ou jeton CSRF invalide
  - `403` : Interdit - Privilèges Admin requis
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
- **Authentification** : Nécessite des privilèges Admin, une session valide et un jeton CSRF
- **Paramètres de requête** :
  - `format` (facultatif) : Format de sauvegarde - `db` (binaire) ou `sql` (export SQL). Par défaut : `db`
- **Réponse** :
  - Content-Type : `application/octet-stream` (pour .db) ou `text/plain` (pour .sql)
  - Content-Disposition : `attachment; filename="duplistatus-backup-YYYY-MM-DDTHH-MM-SS.db"` ou `.sql`
  - Contenu binaire du fichier (pour .db) ou contenu texte SQL (pour .sql)
- **Réponses d'erreur** :
  - `400` : Format invalide (doit être "db" ou "sql")
  - `401` : Non autorisé - Session ou jeton CSRF invalide
  - `403` : Interdit - Privilèges Admin requis
  - `500` : Échec de création de la sauvegarde de la base de données
- **Remarques** :
  - Uniquement accessible aux utilisateurs Admin
  - Le format binaire utilise la méthode de sauvegarde de SQLite pour l'intégrité
  - Le format SQL crée un export texte de tout le contenu de la base de données
  - L'horodatage dans le nom de fichier utilise le fuseau horaire local du serveur
  - L'opération de sauvegarde est enregistrée dans le journal d'audit
  - Les fichiers temporaires sont nettoyés automatiquement après le téléchargement

### Restaurer la base de données - `/api/database/restore` {/* #restore-database---apidatabaserestore */}
- **Point de terminaison** : `/api/database/restore`
- **Méthode** : POST
- **Description** : Restaure la base de données à partir d'un fichier de sauvegarde (au format .db ou .sql). Crée une sauvegarde de sécurité avant la restauration et efface toutes les sessions après la restauration pour des raisons de sécurité.
- **Authentification** : Nécessite des privilèges Admin, une session valide et un jeton CSRF
- **Corps de la requête** : FormData avec un champ de fichier nommé `database`
  - Le fichier doit être au format `.db`, `.sqlite`, `.sqlite3` (format binaire) ou `.sql` (format SQL)
  - Taille maximale du fichier : 200 Mo
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
  - `400` : Aucun fichier fourni, taille du fichier dépasse la limite, format de fichier invalide, ou échec de la vérification d'intégrité de la base de données
  - `401` : Non autorisé - Session ou jeton CSRF invalide
  - `403` : Interdit - Privilèges Admin requis
  - `500` : Échec de la restauration de la base de données (la base de données d'origine est restaurée à partir de la sauvegarde de sécurité si la restauration échoue)
- **Remarques** :
  - Uniquement accessible aux utilisateurs Admin
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

### Obtenir les horodatages de la dernière sauvegarde - `/api/backups/last-timestamps` {/* #get-last-backup-timestamps---apibackupslast-timestamps */}
- **Endpoint** : `/api/backups/last-timestamps`
- **Method** : GET
- **Description** : Récupère l'horodatage de la dernière sauvegarde pour chaque combinaison serveur-sauvegarde. Renvoie une map pour une recherche facile.
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
  - `500` : Échec de la récupération des horodatages de la dernière sauvegarde
- **Remarques** :
  - Retourne à la fois une carte (pour une recherche facile par `server_id:backup_name`) et un format de tableau brut
  - Inclut des en-têtes de contrôle de cache pour empêcher la mise en cache
  - Utile pour suivre les dernières heures de sauvegarde pour toutes les combinaisons serveur-sauvegarde
  - Les horodatages sont au format ISO

## Gestion des journaux de l'application {/* #application-logs-management */}

### Obtenir les journaux de l'application - `/api/application-logs` {/* #get-application-logs---apiapplication-logs */}
- **Endpoint** : `/api/application-logs`
- **Method** : GET
- **Description** : Récupère les entrées de journaux de l'application à partir des fichiers journaux. Prend en charge la lecture des fichiers journaux actuels et avec rotation avec la fonctionnalité tail.
- **Authentification** : Nécessite des privilèges Admin, une session valide et un jeton CSRF
- **Paramètres de requête** :
  - `file` (facultatif) : Nom du fichier journal à lire - `application.log`, `application.log.1`, `application.log.2`, etc. Si non fourni, renvoie la liste des fichiers disponibles
  - `tail` (facultatif) : Nombre de lignes à retourner depuis la fin du fichier (par défaut : 1000, min : 1, max : 10000)
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

- **Réponses d'erreur** :
  - `400` : Paramètre de fin invalide (doit être 1-10000) ou format de paramètre de fichier invalide
  - `401` : Non autorisé - Session ou jeton CSRF invalide
  - `403` : Interdit - Privilèges Admin requis
  - `404` : Fichier journal introuvable
  - `500` : Échec de lecture du fichier journal
- **Remarques** :
  - Uniquement accessible aux utilisateurs Admin
  - Prend en charge la lecture du fichier journal actuel et des fichiers journaux archivés (jusqu'à 10 fichiers archivés)
  - Retourne les N dernières lignes (fin) du fichier journal spécifié
  - Le nom du fichier journal est déterminé par la variable d'environnement (par défaut : `application.log`)
  - Renvoie la liste des fichiers journaux disponibles lorsque le paramètre de fichier n'est pas fourni
  - Les noms de fichiers sont validés pour prévenir les attaques de traversée de répertoire
  - Les fichiers archivés sont numérotés séquentiellement (`.1`, `.2`, etc.)

### Exporter les Journaux de l'application - `/api/application-logs/export` {/* #export-application-logs---apiapplication-logsexport */}
- **Endpoint** : `/api/application-logs/export`
- **Méthode** : GET
- **Description** : Exporte les entrées du journal d'application au format texte filtré. Prend en charge le filtrage par niveau de journalisation et par chaîne de recherche.
- **Authentification** : Nécessite des privilèges Admin, une session valide et un jeton CSRF
- **Paramètres de requête** :
  - `file` (requis) : Nom du fichier journal à exporter - `application.log`, `application.log.1`, `application.log.2`, etc.
  - `logLevels` (facultatif) : Liste séparée par des virgules des niveaux de journalisation à inclure - `INFO`, `WARN`, `ERROR` (par défaut : `INFO,WARN,ERROR`)
  - `search` (facultatif) : Chaîne de recherche pour filtrer les lignes de journal (insensible à la casse)
- **Réponse** :
  - Content-Type : `text/plain`
  - Content-Disposition : `attachment; filename="duplistatus-logs-YYYY-MM-DDTHH-MM-SS.txt"`
  - Contenu du journal filtré au format texte brut
- **Réponses d'erreur** :
  - `400` : Le paramètre de fichier est requis ou le format du paramètre de fichier est invalide
  - `401` : Non autorisé - Session ou jeton CSRF invalide
  - `403` : Interdit - Privilèges Admin requis
  - `500` : Échec de l'exportation des journaux
- **Remarques** :
  - Uniquement accessible aux utilisateurs Admin
  - Exporte les entrées de journal filtrées selon le niveau de journalisation et les critères de recherche
  - Prend en charge le filtrage par niveaux de journalisation : `INFO`, `WARN`, `ERROR`
  - Le filtrage par chaîne de recherche est insensible à la casse
  - Les lignes vides sont automatiquement filtrées
  - Le nom du fichier journal est déterminé par une variable d'environnement (par défaut : `application.log`)
  - Les noms de fichiers sont validés pour empêcher les attaques de traversée de répertoire
  - Le fichier exporté inclut un horodatage dans son nom
  - Utile pour l'analyse externe et le dépannage
