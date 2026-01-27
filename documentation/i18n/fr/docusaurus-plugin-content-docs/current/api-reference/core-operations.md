# Opérations principales {#core-operations}

## Obtenir les données du tableau de bord (consolidées) - `/api/dashboard` {#get-dashboard-data-consolidated-apidashboard}

- **Point de terminaison** : `/api/dashboard`
- **Méthode** : GET
- **Description** : Récupère toutes les données du tableau de bord dans une réponse consolidée unique, incluant les résumés des serveurs, le résumé global et les données des graphiques.
- **Réponse** :
  ```json
  {
    "serversSummary": [
      {
        "id": "server-id",
        "name": "Nom du serveur",
        "lastBackupDate": "2024-03-20T10:00:00Z",
        "lastBackupStatus": "Succès",
        "lastBackupDuration": "00:38:31",
        "lastBackupListCount": 10,
        "lastBackupName": "Nom de sauvegarde",
        "lastBackupId": "backup-id",
        "backupCount": 15,
        "totalWarnings": 5,
        "totalErrors": 0,
        "availableBackups": ["v1", "v2", "v3"],
        "isBackupOverdue": false,
        "notificationEvent": "tous",
        "expectedBackupDate": "2024-03-21T10:00:00Z",
        "expectedBackupElapsed": "2 heures ago",
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
  - Ce point de terminaison consolide le point de terminaison précédent `/api/servers-summary` (qui a été supprimé)
  - Le champ `overallSummary` contient les mêmes données que `/api/summary` (qui est maintenu pour les applications externes)
  - Le champ `chartData` contient les mêmes données que `/api/chart-data/aggregated` (qui existe toujours pour un accès direct)
  - Offre de meilleures performances en réduisant plusieurs appels API à une seule requête
  - Toutes les données sont récupérées en parallèle pour des performances optimales
  - Le champ `secondsSinceLastBackup` affiche le temps en secondes depuis la dernière sauvegarde sur tous les serveurs

## Obtenir tous les serveurs - `/api/servers` {#get-all-servers-apiservers}

- **Point de terminaison** : `/api/servers`
- **Méthode** : GET
- **Description** : Récupère une liste de tous les serveurs avec leurs informations de base. Inclut optionnellement les informations de sauvegarde.
- **Authentification** : Nécessite une session valide et un jeton CSRF
- **Paramètres de requête** :
  - `includeBackups` (optionnel) : Définir sur `true` pour inclure les informations de sauvegarde pour chaque serveur
- **Réponse** (sans paramètres) :
  ```json
  [
    {
      "id": "server-id",
      "name": "Nom du serveur",
      "alias": "Alias du serveur",
      "note": "Notes supplémentaires à propos du serveur"
    }
  ]
  ```
- **Réponse** (avec `includeBackups=true`) :
  ```json
  [
    {
      "id": "server-id",
      "name": "Nom du serveur",
      "backupName": "Nom de sauvegarde",
      "server_url": "http://localhost:8200",
      "alias": "Alias du serveur",
      "note": "Notes supplémentaires à propos du serveur",
      "hasPassword": true
    }
  ]
  ```
- **Réponses d'erreur** :
  - `401` : Non autorisé - Session invalide ou jeton CSRF invalide
  - `500` : Erreur serveur lors de la récupération des serveurs
- **Notes** :
  - Retourne les informations du serveur incluant les champs alias et note
  - Quand `includeBackups=true`, retourne les combinaisons serveur-sauvegarde avec les URL et le statut du mot de passe
  - Consolide le point de terminaison précédent `/api/servers-with-backups` (qui a été supprimé)
  - Utilisé pour la sélection, l'affichage et les objectifs de configuration du serveur
  - Inclut le champ `hasPassword` pour indiquer si le serveur a un mot de passe stocké

## Obtenir les détails du serveur - `/api/servers/:id` {#get-server-details-apiserversid}

- **Point de terminaison** : `/api/servers/:id`
- **Méthode** : GET
- **Description** : Récupère les informations à propos d'un serveur spécifique. Peut retourner les informations de base du serveur ou les informations détaillées incluant les sauvegardes et les données des graphiques.
- **Authentification** : Nécessite une session valide et un jeton CSRF
- **Paramètres** :
  - `id` : l'identifiant du serveur
- **Paramètres de requête** :
  - `includeBackups` (optionnel) : Définir sur `true` pour inclure les données de sauvegarde
  - `includeChartData` (optionnel) : Définir sur `true` pour inclure les données des graphiques
- **Réponse** (sans paramètres) :
  ```json
  {
    "id": "server-id",
    "name": "Nom du serveur",
    "alias": "Alias du serveur",
    "note": "Notes supplémentaires à propos du serveur",
    "server_url": "http://localhost:8200"
  }
  ```
- **Réponse** (avec paramètres) :
  ```json
  {
    "id": "server-id",
    "name": "Nom du serveur",
    "alias": "Alias du serveur",
    "note": "Notes supplémentaires à propos du serveur",
    "server_url": "http://localhost:8200",
    "backups": [
      {
        "id": "backup-id",
        "name": "Nom de sauvegarde",
        "date": "2024-03-20T10:00:00Z",
        "status": "Succès",
        "warnings": 0,
        "errors": 0,
        "fileCount": 1500,
        "fileSize": 2048000,
        "uploadedSize": 1024000,
        "duration": "00:45:30"
      }
    ],
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
  - `401` : Non autorisé - Session invalide ou jeton CSRF invalide
  - `404` : Serveur introuvable
  - `500` : Erreur serveur lors de la récupération des détails du serveur
- **Notes** :
  - Retourne les informations de base du serveur par défaut pour de meilleures performances
  - Utilisez les paramètres de requête pour inclure des données supplémentaires quand nécessaire
  - Optimisé pour différents cas d'utilisation (paramètres par rapport aux vues de détails)

## Mettre à jour le serveur - `/api/servers/:id` {#update-server-apiserversid}

- **Point de terminaison** : `/api/servers/:id`
- **Méthode** : PATCH
- **Description** : Met à jour les détails du serveur incluant l'alias, la note et l'URL du serveur.
- **Authentification** : Nécessite une session valide et un jeton CSRF
- **Paramètres** :
  - `id` : l'identifiant du serveur
- **Corps de la requête** :
  ```json
  {
    "server_url": "http://localhost:8200",
    "alias": "Alias du serveur",
    "note": "Notes supplémentaires à propos du serveur"
  }
  ```
- **Réponse** :
  ```json
  {
    "message": "Serveur mis à jour avec succès",
    "serverId": "server-id",
    "server_url": "http://localhost:8200",
    "alias": "Alias du serveur",
    "note": "Notes supplémentaires à propos du serveur"
  }
  ```
- **Réponses d'erreur** :
  - `401` : Non autorisé - Session invalide ou jeton CSRF invalide
  - `404` : Serveur introuvable
  - `500` : Erreur serveur lors de la mise à jour
- **Notes** :
  - Met à jour l'alias du serveur, la note et l'URL du serveur
  - Tous les champs sont optionnels
  - Les chaînes vides sont autorisées pour tous les champs

## Supprimer le serveur - `/api/servers/:id` {#delete-server-apiserversid}

- **Point de terminaison** : `/api/servers/:id`

- **Méthode** : DELETE

- **Description** : Supprime un serveur et toutes ses sauvegardes associées.

- **Authentification** : Nécessite une session valide et un jeton CSRF

- **Paramètres** :
  - `id` : l'identifiant du serveur

- **Réponse** :
  ```json
  {
    "message": "Serveur et 15 sauvegardes supprimés avec succès",
    "status": 200,
    "changes": {
      "backupChanges": 15,
      "serverChanges": 1
    }
  }
  ```

- **Réponses d'erreur** :
  - `401` : Non autorisé - Session invalide ou jeton CSRF invalide
  - `404` : Serveur introuvable
  - `500` : Erreur serveur lors de la suppression

- **Notes** :
  - Cette opération est irréversible
  - Toutes les données de sauvegarde associées au serveur seront supprimées définitivement
  - L'enregistrement du serveur lui-même sera également supprimé
  - Retourne le nombre de sauvegardes et de serveurs supprimés

## Obtenir les données du serveur avec les informations de retard - `/api/detail/:serverId` {#get-server-data-with-overdue-info-apidetailserverid}

- **Point de terminaison** : `/api/detail/:serverId`

- **Méthode** : GET

- **Description** : Récupère les informations détaillées du serveur incluant le statut de sauvegarde en retard.

- **Paramètres** :
  - `serverId` : l'identifiant du serveur

- **Réponse** :
  ```json
  {
    "server": {
      "id": "server-id",
      "name": "Nom du serveur",
      "backups": [...]
    },
    "overdueBackups": [
      {
        "serverName": "Nom du serveur",
        "backupName": "Nom de sauvegarde",
        "lastBackupDate": "2024-03-20T10:00:00Z",
        "lastNotificationSent": "2024-03-20T12:00:00Z",
        "notificationEvent": "tous",
        "expectedBackupDate": "2024-03-21T10:00:00Z",
        "expectedBackupElapsed": "2 heures ago"
      }
    ],
    "lastOverdueCheck": "2024-03-20T12:00:00Z"
  }
  ```

- **Réponses d'erreur** :
  - `404` : Serveur introuvable
  - `500` : Erreur serveur lors de la récupération des détails du serveur

- **Notes** :
  - Retourne les données du serveur avec les informations de sauvegarde en retard
  - Inclut les détails de sauvegarde en retard et les horodatages
  - Utilisé pour la gestion et la surveillance des sauvegardes en retard

## Obtenir les serveurs en double - `/api/servers/duplicates` {#get-duplicate-servers-apiserversduplicates}

- **Point de terminaison** : `/api/servers/duplicates`
- **Méthode** : GET
- **Description** : Récupère une liste de serveurs en double basée sur l'ID de machine. Les serveurs en double sont des serveurs qui partagent le même ID de machine mais sont stockés comme des enregistrements séparés dans la base de données.
- **Authentification** : Nécessite une session valide, un jeton CSRF et un accès administrateur
- **Réponse** :
  ```json
  [
    {
      "machineId": "machine-id-123",
      "servers": [
        {
          "id": "server-id-1",
          "name": "Nom du serveur 1",
          "alias": "Alias du serveur 1",
          "server_url": "http://localhost:8200",
          "backupCount": 5
        },
        {
          "id": "server-id-2",
          "name": "Nom du serveur 2",
          "alias": "Alias du serveur 2",
          "server_url": "http://localhost:8200",
          "backupCount": 3
        }
      ]
    }
  ]
  ```
- **Réponses d'erreur** :
  - `401` : Non autorisé - Session invalide ou jeton CSRF invalide
  - `403` : Accès administrateur requis
  - `500` : Erreur serveur lors de la récupération des serveurs en double
- **Notes** :
  - Seuls les administrateurs peuvent accéder à ce point de terminaison
  - Retourne les groupes de serveurs qui partagent le même ID de machine
  - Chaque groupe contient tous les serveurs avec le même ID de machine
  - Utilisé pour identifier et fusionner les enregistrements de serveur en double
  - Inclut les détails du serveur et les nombres de sauvegardes pour chaque doublon

## Fusionner les serveurs - `/api/servers/merge` {#merge-servers-apiserversmerge}

- **Point de terminaison** : `/api/servers/merge`
- **Méthode** : POST
- **Description** : Fusionne plusieurs serveurs dans un serveur cible. Toutes les sauvegardes des serveurs source sont transférées au serveur cible, et les serveurs source sont supprimés.
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
    "message": "2 serveur(s) fusionné(s) avec succès dans le serveur cible"
  }
  ```
- **Réponses d'erreur** :
  - `400` : Corps de requête invalide, champs requis manquants, ou le serveur cible est dans la liste des serveurs à fusionner
  - `401` : Non autorisé - Session invalide ou jeton CSRF invalide
  - `403` : Accès administrateur requis
  - `500` : Erreur serveur lors de l'opération de fusion
- **Notes** :
  - Seuls les administrateurs peuvent effectuer des opérations de fusion
  - Le serveur cible ne doit pas être dans la liste des serveurs à fusionner
  - Toutes les sauvegardes des serveurs source sont transférées au serveur cible
  - Les serveurs source sont supprimés après une fusion réussie
  - Cette opération est irréversible
  - Utilisé pour consolider les enregistrements de serveur en double
  - Valide que oldServerIds est un tableau non vide
  - Valide que targetServerId est fourni et est une chaîne
