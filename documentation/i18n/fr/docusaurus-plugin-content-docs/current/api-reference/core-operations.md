---
translation_last_updated: '2026-05-06T23:19:30.236Z'
source_file_mtime: '2026-05-06T23:18:51.418Z'
source_file_hash: 71a70ebe58920eba7ffc9c0087432da38e19bacac8c69249ecddce48e51cdce2
translation_language: fr
source_file_path: documentation/docs/api-reference/core-operations.md
translation_models:
  - qwen/qwen3-235b-a22b-2507
---
# Opérations principales {#core-operations}

## Obtenir les données du tableau de bord (consolidées) - `/api/dashboard` {#get-dashboard-data-consolidated---apidashboard}
- **Endpoint** : `/api/dashboard`
- **Méthode** : GET
- **Description** : Récupère toutes les données du tableau de bord dans une seule réponse consolidée, incluant les résumés des serveurs, le résumé général et les données des graphiques.
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

- **Réponses d'erreur** :
  - `500` : Erreur serveur lors de la récupération des données du tableau de bord
- **Notes** :
  - Cet endpoint consolide l'ancien endpoint `/api/servers-summary` (qui a été supprimé)
  - Le champ `overallSummary` contient les mêmes données que `/api/summary` (conservé pour les applications externes)
  - Le champ `chartData` contient les mêmes données que `/api/chart-data/aggregated` (toujours disponible pour un accès direct)
  - Offre de meilleures performances en réduisant plusieurs appels API à une seule requête
  - Toutes les données sont récupérées en parallèle pour des performances optimales
  - Le champ `secondsSinceLastBackup` indique le temps en secondes depuis la dernière sauvegarde sur l'ensemble des serveurs

## Obtenir tous les serveurs - `/api/servers` {#get-all-servers---apiservers}
- **Endpoint** : `/api/servers`
- **Méthode** : GET
- **Description** : Récupère une liste de tous les serveurs avec leurs informations de base. Inclut éventuellement les informations de sauvegarde.
- **Authentification** : Nécessite une session valide et un jeton CSRF
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

- **Réponses d'erreur** :
  - `401` : Non autorisé - Session ou jeton CSRF invalide
  - `500` : Erreur serveur lors de la récupération des serveurs
- **Notes** :
  - Renvoie les informations du serveur, y compris les champs d'alias et de note
  - Lorsque `includeBackups=true`, renvoie les combinaisons serveur-sauvegarde avec les URL et le statut du mot de passe
  - Consolide l'ancien endpoint `/api/servers-with-backups` (qui a été supprimé)
  - Utilisé pour la sélection, l'affichage et la configuration des serveurs
  - Inclut le champ `hasPassword` pour indiquer si le serveur possède un mot de passe enregistré

## Obtenir les détails du serveur - `/api/servers/:id` {#get-server-details---apiserversid}
- **Endpoint** : `/api/servers/:id`
- **Méthode** : GET
- **Description** : Récupère des informations sur un serveur spécifique. Peut renvoyer les informations de base du serveur ou des informations détaillées incluant les sauvegardes et les données des graphiques.
- **Authentification** : Nécessite une session valide et un jeton CSRF
- **Paramètres** :
  - `id` : l'identifiant du serveur
- **Paramètres de requête** :
  - `includeBackups` (facultatif) : Définir sur `true` pour inclure les données de sauvegarde
  - `includeChartData` (facultatif) : Définir sur `true` pour inclure les données du graphique
- **Réponse** (sans paramètres) :

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

- **Réponses d'erreur** :
  - `401` : Non autorisé - Session ou jeton CSRF invalide
  - `404` : Serveur introuvable
  - `500` : Erreur serveur lors de la récupération des détails du serveur
- **Notes** :
  - Renvoie les informations basiques du serveur lorsqu'aucun paramètre de requête n'est fourni
  - Définir `includeBackups` ou `includeChartData` sur `true` renvoie toutes les données du serveur, y compris les sauvegardes et chartData
  - Utilisé pour les paramètres et les vues détaillées du serveur

## Mettre à jour le serveur - `/api/servers/:id` {#update-server---apiserversid}
- **Endpoint** : `/api/servers/:id`
- **Méthode** : PATCH
- **Description** : Met à jour les détails du serveur, notamment l'alias, la note et l'URL du serveur.
- **Authentification** : Nécessite une session valide et un jeton CSRF
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

- **Réponses d'erreur** :
  - `401` : Non autorisé - Session ou jeton CSRF invalide
  - `404` : Serveur introuvable
  - `500` : Erreur serveur lors de la mise à jour
- **Notes** :
  - Met à jour l'alias, la note et l'URL du serveur
  - Tous les champs sont facultatifs
  - Les chaînes vides sont autorisées pour tous les champs

## Supprimer le serveur - `/api/servers/:id` {#delete-server---apiserversid}
- **Endpoint** : `/api/servers/:id`
- **Méthode** : DELETE
- **Description** : Supprime un serveur et toutes ses sauvegardes associées.
- **Authentification** : Nécessite une session valide et un jeton CSRF
- **Paramètres** :
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

- **Réponses d'erreur** :
  - `401` : Non autorisé - Session ou jeton CSRF invalide
  - `404` : Serveur introuvable
  - `500` : Erreur serveur lors de la suppression
- **Notes** : 
  - Cette opération est irréversible
  - Toutes les données de sauvegarde associées au serveur seront définitivement supprimées
  - L'enregistrement du serveur lui-même sera également supprimé
  - Renvoie le nombre de sauvegardes et de serveurs supprimés

## Obtenir les données du serveur avec informations en retard - `/api/detail/:serverId` {#get-server-data-with-overdue-info---apidetailserverid}
- **Endpoint** : `/api/detail/:serverId`
- **Méthode** : GET
- **Description** : Récupère des informations détaillées sur le serveur, y compris le statut des sauvegardes en retard.
- **Paramètres** :
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

- **Réponses d'erreur** :
  - `404` : Serveur introuvable
  - `500` : Erreur serveur lors de la récupération des détails du serveur
- **Notes** :
  - Renvoie les données du serveur avec les informations sur les sauvegardes en retard
  - Inclut les détails et horodatages des sauvegardes en retard
  - Utilisé pour la gestion et la surveillance des sauvegardes en retard

## Obtenir les serveurs en double - `/api/servers/duplicates` {#get-duplicate-servers---apiserversduplicates}
- **Endpoint** : `/api/servers/duplicates`
- **Méthode** : GET
- **Description** : Récupère une liste des serveurs en double basée sur l'ID machine. Les serveurs en double sont des serveurs qui partagent le même ID machine mais sont stockés comme des enregistrements distincts dans la base de données.
- **Authentification** : Nécessite une session valide, un jeton CSRF et un accès administrateur
- **Réponse** :

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

- **Réponses d'erreur** :
  - `401` : Non autorisé - Session ou jeton CSRF invalide
  - `403` : Accès administrateur requis
  - `500` : Erreur serveur lors de la récupération des serveurs en double
- **Notes** :
  - Seuls les administrateurs peuvent accéder à ce point de terminaison
  - Renvoie des groupes de serveurs qui partagent le même ID machine
  - Chaque groupe contient tous les serveurs ayant le même ID machine
  - Utilisé pour identifier et fusionner les enregistrements de serveurs en double
  - Inclut les détails des serveurs et les nombres de sauvegardes pour chaque doublon

## Fusionner les serveurs - `/api/servers/merge` {#merge-servers---apiserversmerge}
- **Endpoint** : `/api/servers/merge`
- **Méthode** : POST
- **Description** : Fusionne plusieurs serveurs dans un serveur cible. Toutes les sauvegardes des serveurs sources sont transférées vers le serveur cible, et les serveurs sources sont supprimés.
- **Authentification** : Nécessite une session valide, un jeton CSRF et un accès administrateur
- **Corps de la requête** :

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
    "message": "Successfully merged 2 server(s) into target server"
  }
  ```

- **Réponses d'erreur** :
  - `400` : Corps de requête invalide, champs requis manquants, ou serveur cible figurant dans la liste des serveurs à fusionner
  - `401` : Non autorisé - Session ou jeton CSRF invalide
  - `403` : Accès administrateur requis
  - `500` : Erreur serveur pendant l'opération de fusion
- **Notes** :
  - Seuls les administrateurs peuvent effectuer des opérations de fusion
  - Le serveur cible ne doit pas figurer dans la liste des serveurs à fusionner
  - Toutes les sauvegardes des serveurs sources sont transférées vers le serveur cible
  - Les serveurs sources sont supprimés après une fusion réussie
  - Cette opération est irréversible
  - Utilisé pour consolider les enregistrements de serveurs en double
  - Valide que oldServerIds est un tableau non vide
  - Valide que targetServerId est fourni et est une chaîne de caractères
