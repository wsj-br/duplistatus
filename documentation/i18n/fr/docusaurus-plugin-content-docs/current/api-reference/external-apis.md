---
translation_last_updated: '2026-05-06T23:19:34.833Z'
source_file_mtime: '2026-05-06T23:18:51.410Z'
source_file_hash: 59b045e2f0ca88a7be16ce8ed6d2ae4476eed38416d4d0284b2f590183c45b81
translation_language: fr
source_file_path: documentation/docs/api-reference/external-apis.md
translation_models:
  - qwen/qwen3-235b-a22b-2507
---
# API externes {#external-apis}

Ces points de terminaison sont conçus pour être utilisés par d'autres applications et intégrations, par exemple [Homepage](../user-guide/homepage-integration.md).

## Obtenir un résumé général - `/api/summary` {#get-overall-summary---apisummary}
- **Point de terminaison** : `/api/summary`
- **Méthode** : GET
- **Description** : Récupère un résumé de toutes les opérations de sauvegarde sur l'ensemble des serveurs.
- **Réponse** :

  ```json
  {
    "totalServers": 3,
    "totalBackupsRuns": 9,
    "totalBackups": 9,
    "totalUploadedSize": 2397229507,
    "totalStorageUsed": 43346796938,
    "totalBackupSize": 126089687807,
    "overdueBackupsCount": 2,
    "secondsSinceLastBackup": 7200
  }
  ```

- **Réponses d'erreur** :
  - `500` : Erreur du serveur lors de la récupération des données de résumé
- **Notes** :
  - Dans la version 0.5.x, le champ `totalBackupedSize` a été remplacé par `totalBackupSize`
  - Dans la version 0.7.x, le champ `totalMachines` a été remplacé par `totalServers`
  - Le champ `overdueBackupsCount` indique le nombre de sauvegardes actuellement en retard
  - Le champ `secondsSinceLastBackup` indique le temps en secondes depuis la dernière sauvegarde sur tous les serveurs
  - Renvoie une réponse de secours avec des valeurs nulles si la récupération des données échoue
  - **Note** : Pour une utilisation interne du tableau de bord, envisagez d'utiliser `/api/dashboard`, qui inclut ces données ainsi que des informations supplémentaires

## Obtenir la dernière sauvegarde - `/api/lastbackup/:serverId` {#get-latest-backup---apilastbackupserverid}
- **Point de terminaison** : `/api/lastbackup/:serverId`
- **Méthode** : GET
- **Description** : Récupère les informations sur la dernière sauvegarde pour un serveur spécifique.
- **Paramètres** :
  - `serverId` : l'identifiant du serveur (ID ou nom)

:::note
L'identifiant du serveur doit être encodé en URL.
:::

- **Réponse** :

  ```json
  {
    "server": {
      "id": "unique-server-id",
      "name": "Server Name",
      "backup_name": "Backup Name",
      "backup_id": "backup-id",
      "created_at": "2024-03-20T10:00:00Z"
    },
    "latest_backup": {
      "id": "backup-id",
      "server_id": "unique-server-id",
      "name": "Backup Name",
      "date": "2024-03-20T10:00:00Z",
      "status": "Success",
      "warnings": 0,
      "errors": 0,
      "messages": 150,
      "fileCount": 249426,
      "fileSize": 113395849938,
      "uploadedSize": 331318892,
      "duration": "00:38:31",
      "duration_seconds": 2311.6018052,
      "durationInMinutes": 38.52669675333333,
      "knownFileSize": 27203688543,
      "backup_list_count": 10,
      "messages_array": ["message1", "message2"],
      "warnings_array": ["warning1"],
      "errors_array": [],
      "available_backups": ["v1", "v2", "v3"]
    },
    "status": 200
  }
  ```

- **Réponses d'erreur** :
  - `404` : Serveur non trouvé
  - `500` : Erreur interne du serveur
- **Notes** :
  - Dans la version 0.7.x, la clé de l'objet de réponse est passée de `machine` à `server`
  - L'identifiant du serveur peut être soit l'ID, soit le nom
  - Renvoie null pour latest_backup s'il n'existe aucune sauvegarde
  - Inclut des en-têtes de contrôle de cache pour empêcher la mise en cache

## Obtenir les dernières sauvegardes - `/api/lastbackups/:serverId` {#get-latest-backups---apilastbackupsserverid}
- **Point de terminaison** : `/api/lastbackups/:serverId`
- **Méthode** : GET
- **Description** : Récupère les informations sur la dernière sauvegarde pour toutes les sauvegardes configurées (par exemple 'Fichiers', 'Bases de données') sur un serveur spécifique.
- **Paramètres** :
  - `serverId` : l'identifiant du serveur (ID ou nom)

:::note
L'identifiant du serveur doit être encodé en URL.
:::

- **Réponse** :

  ```json
  {
    "server": {
      "id": "unique-server-id",
      "name": "Server Name",
      "backup_name": "Default Backup",
      "backup_id": "backup-id",
      "created_at": "2024-03-20T10:00:00Z"
    },
    "latest_backups": [
      {
        "id": "backup1",
        "server_id": "unique-server-id",
        "name": "Files",
        "date": "2024-03-20T10:00:00Z",
        "status": "Success",
        "warnings": 0,
        "errors": 0,
        "messages": 150,
        "fileCount": 249426,
        "fileSize": 113395849938,
        "uploadedSize": 331318892,
        "duration": "00:38:31",
        "duration_seconds": 2311.6018052,
        "durationInMinutes": 38.52669675333333,
        "knownFileSize": 27203688543,
        "backup_list_count": 10,
        "messages_array": "[\"message1\", \"message2\"]",
        "warnings_array": "[\"warning1\"]",
        "errors_array": "[]",
        "available_backups": ["v1", "v2", "v3"]
      },
      {
        "id": "backup2",
        "server_id": "unique-server-id",
        "name": "Databases",
        "date": "2024-03-20T11:00:00Z",
        "status": "Success",
        "warnings": 1,
        "errors": 0,
        "messages": 75,
        "fileCount": 125000,
        "fileSize": 56789012345,
        "uploadedSize": 123456789,
        "duration": "00:25:15",
        "duration_seconds": 1515.1234567,
        "durationInMinutes": 25.25205761166667,
        "knownFileSize": 12345678901,
        "backup_list_count": 5,
        "messages_array": ["message1"],
        "warnings_array": ["warning1"],
        "errors_array": [],
        "available_backups": ["v1", "v2"]
      }
    ],
    "backup_jobs_count": 2,
    "backup_names": ["Files", "Databases"],
    "status": 200
  }
  ```

- **Réponses d'erreur** :
  - `404` : Serveur non trouvé
  - `500` : Erreur interne du serveur
- **Notes** :
  - Dans la version 0.7.x, la clé de l'objet de réponse est passée de `machine` à `server`, et le champ `backup_types_count` a été renommé en `backup_jobs_count`
  - L'identifiant du serveur peut être soit l'ID, soit le nom
  - Renvoie la dernière sauvegarde pour chaque tâche de sauvegarde (backup_name) que possède le serveur
  - Contrairement à `/api/lastbackup/:serverId`, qui renvoie uniquement la sauvegarde la plus récente du serveur (indépendamment de la tâche de sauvegarde)
  - Inclut des en-têtes de contrôle de cache pour empêcher la mise en cache

## Téléverser les données de sauvegarde - `/api/upload` {#upload-backup-data---apiupload}
- **Point de terminaison** : `/api/upload`
- **Méthode** : POST
- **Description** : Téléverse les données d'opération de sauvegarde pour un serveur. Prend en charge la détection des exécutions de sauvegarde en double et envoie des notifications.
- **Corps de la requête** : JSON envoyé par Duplicati avec les options suivantes :

  ```bash
  --send-http-url=http://my.local.server:9666/api/upload
  --send-http-result-output-format=Json
  --send-http-log-level=Information
  ```

- **Réponse** :

  ```json
  {
    "success": true
  }
  ```

- **Réponses d'erreur** :
  - `400` : Champs requis manquants dans les sections Extra ou Data, ou MainOperation non valide
  - `409` : Données de sauvegarde en double (ignorées)
  - `500` : Erreur du serveur lors du traitement des données de sauvegarde
- **Notes** :
  - Ne traite que les opérations de sauvegarde (MainOperation doit être "Backup")
  - Valide les champs requis dans la section Extra : machine-id, machine-name, backup-name, backup-id
  - Valide les champs requis dans la section Data : ParsedResult, BeginTime, Duration
  - Détecte automatiquement les exécutions de sauvegarde en double et renvoie un statut 409
  - Envoie des notifications après une insertion réussie de la sauvegarde (si configuré)
  - Journalise les données de la requête dans un fichier du répertoire `data` à la racine du projet en mode développement, à des fins de débogage
  - Utilise une transaction pour assurer la cohérence des données
