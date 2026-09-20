# Opérations principales {/* #core-operations */}

## Obtenir les données du tableau de bord (consolidées) - `/api/dashboard` {/* #get-dashboard-data-consolidated---apidashboard */}
- **Point de terminaison** : `/api/dashboard`
- **Méthode** : GET
- **Description** : Récupère toutes les données du tableau de bord dans une seule réponse consolidée, y compris les résumés des serveurs, le résumé global et les données graphiques.
- **Réponse** :

  ```json
  {
    "serversSummary": [
      {
        "id": "server-id",
        "name": "Server Name",
        "lastBackupDate": "2024-03-20T10:00:00Z",
        "lastBackupStatus": "Success",
        "lastBackupDuration": "00:38:31",
        "lastBackupListCount": 10,
        "lastBackupName": "Backup Name",
        "lastBackupId": "backup-id",
        "backupCount": 15,
        "totalWarnings": 5,
        "totalErrors": 0,
        "availableBackups": ["v1", "v2", "v3"],
        "isBackupOverdue": false,
        "notificationEvent": "all",
        "expectedBackupDate": "2024-03-21T10:00:00Z",
        "expectedBackupElapsed": "2 hours ago",
        "lastOverdueCheck": "2024-03-20T12:00:00Z",
        "lastNotificationSent": "N/A"
      }
    ],
    "overallSummary": {
      "totalServers": 3,
      "totalBackups": 9,
      "totalUploadedSize": 2397229507,
      "totalStorageUsed": 43346796938,
      "totalBackupSize": 126089687807,
      "overdueBackupsCount": 2,
      "secondsSinceLastBackup": 7200
    },
    "chartData": [
      {
        "date": "20/03/2024",
        "isoDate": "2024-03-20T10:00:00Z",
        "uploadedSize": 1024000,
        "duration": 45,
        "fileCount": 1500,
        "fileSize": 2048000,
        "storageSize": 3072000,
        "backupVersions": 5
      }
    ]
  }
  ```

- **Réponses d'erreur** :
  - `500` : Erreur serveur lors de la récupération des données du tableau de bord
- **Notes** :
  - Cet endpoint consolide l'ancien endpoint `/api/servers-summary` (qui a été supprimé)
  - Le champ `overallSummary` contient les mêmes données que `/api/summary` (qui est maintenu pour les applications externes)
  - Le champ `chartData` contient les mêmes données que `/api/chart-data/aggregated` (qui existe toujours pour un accès direct)
  - Offre de meilleures performances en réduisant plusieurs appels API à une seule requête
  - Toutes les données sont récupérées en parallèle pour des performances optimales
  - Le champ `secondsSinceLastBackup` affiche le temps en secondes depuis la dernière sauvegarde sur tous les serveurs

## Obtenir tous les serveurs - `/api/servers` {/* #get-all-servers---apiservers */}
- **Point de terminaison** : `/api/servers`
- **Méthode** : GET
- **Description** : Récupère la liste de tous les serveurs avec leurs informations de base. Inclut facultativement des informations de sauvegarde.
- **Authentification** : Requiert une session valide et un jeton CSRF
- **Paramètres de requête** :
  - `includeBackups` (facultatif) : Définir sur `true` pour inclure les informations de sauvegarde pour chaque serveur
- **Réponse** (sans paramètres) :

  ```json
  [
    {
      "id": "server-id",
      "name": "Server Name",
      "alias": "Server Alias",
      "note": "Additional notes about the server"
    }
  ]
  ```

- **Réponse** (avec `includeBackups=true`) :

  ```json
  [
    {
      "id": "server-id",
      "name": "Server Name",
      "backupName": "Backup Name",
      "server_url": "http://localhost:8200",
      "alias": "Server Alias",
      "note": "Additional notes about the server",
      "hasPassword": true
    }
  ]
  ```

- **Réponses d'erreur** :
  - `401` : Non autorisé - Session ou jeton CSRF invalide
  - `500` : Erreur serveur lors de la récupération des serveurs
- **Notes** :
  - Retourne les informations du serveur y compris les champs alias et note
  - Lorsque `includeBackups=true`, retourne les combinaisons serveur-sauvegarde avec les URL et l'état du mot de passe
  - Consolide l'ancien endpoint `/api/servers-with-backups` (qui a été supprimé)
  - Utilisé à des fins de sélection, d'affichage et de configuration des serveurs
  - Inclut le champ `hasPassword` pour indiquer si le serveur possède un mot de passe stocké

## Obtenir les détails du serveur - `/api/servers/:id` {/* #get-server-details---apiserversid */}
- **Point de terminaison** : `/api/servers/:id`
- **Méthode** : GET
- **Description** : Récupère les informations relatives à un serveur spécifique. Peut renvoyer des informations de base sur le serveur ou des informations détaillées incluant les sauvegardes et les données graphiques.
- **Authentification** : Nécessite une session valide et un jeton CSRF
- **Paramètres** :
  - `id` : l'identifiant du serveur
- **Paramètres de requête** :
  - `includeBackups` (facultatif) : Définir à `true` pour inclure les données de sauvegarde
  - `includeChartData` (facultatif) : Définir à `true` pour inclure les données de graphique
- **Réponse** (sans paramètres) :

  ```json
  {
    "id": "server-id",
    "name": "Server Name",
    "alias": "Server Alias",
    "note": "Additional notes about the server",
    "server_url": "http://localhost:8200"
  }
  ```

- **Réponse** (avec paramètres) :

  ```json
  {
    "id": "server-id",
    "name": "Server Name",
    "alias": "Server Alias",
    "note": "Additional notes about the server",
    "server_url": "http://localhost:8200",
    "backups": [
      { ... }
    ],
    "chartData": [
      { ... }
    ]
  }
  ```

- **Réponses d'erreur** :
  - `401` : Non autorisé - Session ou jeton CSRF invalide
  - `404` : Serveur introuvable
  - `500` : Erreur serveur lors de la récupération des détails du serveur
- **Notes** :
  - Retourne les informations de base du serveur lorsque aucun paramètre de requête n'est fourni
  - Définir `includeBackups` ou `includeChartData` à `true` renvoie toutes les données du serveur y compris les sauvegardes et les données de graphique
  - Utilisé pour les paramètres et les vues détaillées du serveur

## Mettre à jour le serveur - `/api/servers/:id` {/* #update-server---apiserversid */}
- **Point de terminaison** : `/api/servers/:id`
- **Méthode** : PATCH
- **Description** : Met à jour les détails du serveur, notamment l'alias, la note et l'URL du serveur.
- **Authentification** : Requiert une session valide et un jeton CSRF
- **Paramètres** :
  - `id` : l'identifiant du serveur
- **Corps de la requête** :

  ```json
  {
    "server_url": "http://localhost:8200",
    "alias": "Server Alias",
    "note": "Additional notes about the server"
  }
  ```

- **Réponse** :

  ```json
  {
    "message": "Server updated successfully",
    "serverId": "server-id",
    "server_url": "http://localhost:8200",
    "alias": "Server Alias",
    "note": "Additional notes about the server"
  }
  ```

- **Réponses d'erreur** :
  - `401` : Non autorisé - Session ou jeton CSRF invalide
  - `404` : Serveur introuvable
  - `500` : Erreur serveur pendant la mise à jour
- **Notes** :
  - Met à jour l'alias du serveur, la note et l'URL du serveur
  - Tous les champs sont facultatifs
  - Les chaînes vides sont autorisées pour tous les champs

## Supprimer le serveur - `/api/servers/:id` {/* #delete-server---apiserversid */}
- **Endpoint** : `/api/servers/:id`
- **Method** : DELETE
- **Description** : Supprime un serveur et toutes les sauvegardes qui lui sont associées.
- **Authentication** : Requiert une session valide et un jeton CSRF
- **Parameters** :
  - `id` : l'identifiant du serveur

- **Réponse** :

  ```json
  {
    "message": "Successfully deleted server and 15 backups",
    "status": 200,
    "changes": {
      "backupChanges": 15,
      "serverChanges": 1
    }
  }
  ```

- **Réponses d'erreur** :
  - `401` : Non autorisé - Session ou jeton CSRF invalide
  - `404` : Serveur introuvable
  - `500` : Erreur serveur pendant la suppression
- **Notes** : 
  - Cette opération est irréversible
  - Toutes les données de sauvegarde associées au serveur seront définitivement supprimées
  - L'enregistrement du serveur lui-même sera également supprimé
  - Renvoie le nombre de sauvegardes et de serveurs supprimés

## Obtenir les données du serveur avec les informations de retard - `/api/detail/:serverId` {/* #get-server-data-with-overdue-info---apidetailserverid */}
- **Endpoint** : `/api/detail/:serverId`
- **Method** : GET
- **Description** : Récupère des informations détaillées sur le serveur, y compris l'état de sauvegarde en retard.
- **Parameters** :
  - `serverId` : l'identifiant du serveur

- **Réponse** :

  ```json
  {
    "server": {
      "id": "server-id",
      "name": "Server Name",
      "backups": [...]
    },
    "overdueBackups": [
      {
        "serverName": "Server Name",
        "backupName": "Backup Name",
        "lastBackupDate": "2024-03-20T10:00:00Z",
        "lastNotificationSent": "2024-03-20T12:00:00Z",
        "notificationEvent": "all",
        "expectedBackupDate": "2024-03-21T10:00:00Z",
        "expectedBackupElapsed": "2 hours ago"
      }
    ],
    "lastOverdueCheck": "2024-03-20T12:00:00Z"
  }
  ```

- **Réponses d'erreur** :
  - `404` : Serveur introuvable
  - `500` : Erreur serveur lors de la récupération des détails du serveur
- **Notes** :
  - Renvoie les données du serveur avec les informations de sauvegarde en retard
  - Inclut les détails et les horodatages des sauvegardes en retard
  - Utilisé pour la gestion et la surveillance des sauvegardes en retard

## Serveurs en double - `/api/servers/duplicates` {/* #get-duplicate-servers---apiserversduplicates */}
- **Endpoint** : `/api/servers/duplicates`
- **Method** : GET
- **Description** : Récupère une liste de serveurs en double basée sur l'ID machine. Les serveurs en double sont des serveurs qui partagent le même ID machine mais qui sont stockés sous forme d'enregistrements distincts dans la base de données.
- **Authentication** : Requiert une session valide, un jeton CSRF et un accès administrateur
- **Response** :

  ```json
  [
    {
      "machineId": "machine-id-123",
      "servers": [
        {
          "id": "server-id-1",
          "name": "Server Name 1",
          "alias": "Server Alias 1",
          "server_url": "http://localhost:8200",
          "backupCount": 5
        },
        {
          "id": "server-id-2",
          "name": "Server Name 2",
          "alias": "Server Alias 2",
          "server_url": "http://localhost:8200",
          "backupCount": 3
        }
      ]
    }
  ]
  ```

- **Réponses d'erreur** :
  - `401` : Non autorisé - Session ou jeton CSRF invalide
  - `403` : Accès administrateur requis
  - `500` : Erreur serveur lors de la récupération des serveurs en double
- **Notes** :
  - Seuls les administrateurs peuvent accéder à cet endpoint
  - Renvoie des groupes de serveurs partageant le même identifiant machine
  - Chaque groupe contient tous les serveurs ayant le même identifiant machine
  - Utilisé pour identifier et fusionner les doublons d'enregistrements de serveurs
  - Inclut les détails du serveur et les nombres de sauvegardes pour chaque doublon

## Fusionner les serveurs - `/api/servers/merge` {/* #merge-servers---apiserversmerge */}
- **Endpoint** : `/api/servers/merge`
- **Method** : POST
- **Description** : Fusionne plusieurs serveurs dans un serveur cible. Toutes les sauvegardes des serveurs sources sont transférées vers le serveur cible, et les serveurs sources sont supprimés.
- **Authentication** : Requiert une session valide, un jeton CSRF et un accès administrateur
- **Request Body** :

  ```json
  {
    "oldServerIds": ["server-id-1", "server-id-2"],
    "targetServerId": "server-id-3"
  }
  ```

- **Réponse** :

  ```json
  {
    "success": true,
    "message": "Successfully merged 2 server(s) into target server",
    "backupIdsNormalized": 1
  }
  ```

- **Réponses d'erreur** :
  - `400` : Corps de la requête invalide, champs requis manquants ou le serveur cible figure dans la liste des serveurs à fusionner
  - `401` : Non autorisé - Session ou jeton CSRF invalide
  - `403` : Accès administrateur requis
  - `500` : Erreur du serveur pendant l'opération de fusion
- **Remarques** :
  - Seuls les administrateurs peuvent effectuer des opérations de fusion
  - Le serveur cible ne doit pas figurer dans la liste des serveurs à fusionner
  - Toutes les sauvegardes provenant des serveurs sources sont transférées vers le serveur cible
  - Les valeurs `backup_id` dupliquées pour le même `backup_name` sur le serveur fusionné sont normalisées avec l'identifiant de la ligne de sauvegarde la plus récente
  - Les serveurs sources sont supprimés après une fusion réussie
  - Cette opération est irréversible
  - Utilisée pour consolider les doublons d'enregistrements de serveurs
  - Valide que oldServerIds est un tableau non vide
  - Valide que targetServerId est fourni et est une chaîne de caractères
