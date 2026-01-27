# API externes {#external-apis}

Ces points de terminaison sont conçus pour être utilisés par d'autres applications et Intégrations, par exemple [Page d'accueil](../user-guide/homepage-integration.md).

## Obtenir le résumé global - `/api/summary` {#get-overall-summary-apisummary}

- **Point de terminaison** : `/api/summary`
- **Méthode** : GET
- **Description** : Récupère un résumé de toutes les opérations de sauvegarde sur Tous les serveurs.
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
  - `500` : Erreur serveur lors de la récupération des données de résumé
- **Notes** :
  - Dans la version 0.5.x, le champ `totalBackupedSize` a été remplacé par `totalBackupSize`
  - Dans la version 0.7.x, le champ `totalMachines` a été remplacé par `totalServers`
  - Le champ `overdueBackupsCount` affiche le nombre de sauvegardes en retard actuellement
  - Le champ `secondsSinceLastBackup` affiche le temps en secondes depuis la dernière sauvegarde sur Tous les serveurs
  - Retourne une réponse de secours avec des zéros si la récupération des données échoue
  - **Note** : Pour une utilisation interne du tableau de bord, envisagez d'utiliser `/api/dashboard` qui inclut ces données plus des informations supplémentaires

## Obtenir la dernière sauvegarde - `/api/lastbackup/:serverId` {#get-latest-backup-apilastbackupserverid}

- **Point de terminaison** : `/api/lastbackup/:serverId`
- **Méthode** : GET
- **Description** : Récupère les informations de sauvegarde les plus récentes pour un Serveur spécifique.
- **Paramètres** :
  - `serverId` : l'ID du serveur (ID ou nom)

:::note
L'ID du serveur doit être codé en URL.
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
  - `404` : Serveur introuvable
  - `500` : Erreur serveur interne
- **Notes** :
  - Dans la version 0.7.x, la clé de l'objet de réponse a changé de `machine` à `server`
  - L'ID du serveur peut être soit l'ID soit le nom
  - Retourne null pour latest_backup s'il n'existe aucune sauvegarde
  - Inclut les en-têtes de contrôle du cache pour empêcher la mise en cache

## Obtenir les dernières sauvegardes - `/api/lastbackups/:serverId` {#get-latest-backups-apilastbackupsserverid}

- **Point de terminaison** : `/api/lastbackups/:serverId`
- **Méthode** : GET
- **Description** : Récupère les informations de sauvegarde les plus récentes pour Tous les sauvegardes configurées (par exemple « Fichiers », « Bases de données ») sur un Serveur spécifique.
- **Paramètres** :
  - `serverId` : l'ID du serveur (ID ou nom)

:::note
L'ID du serveur doit être codé en URL.
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
  - `404` : Serveur introuvable
  - `500` : Erreur serveur interne
- **Notes** :
  - Dans la version 0.7.x, la clé de l'objet de réponse a changé de `machine` à `server`, et le champ `backup_types_count` a été renommé en `backup_jobs_count`
  - L'ID du serveur peut être soit l'ID soit le nom
  - Retourne la dernière sauvegarde pour chaque travail de sauvegarde (backup_name) que le Serveur possède
  - Contrairement à `/api/lastbackup/:serverId` qui retourne uniquement la sauvegarde la plus récente du Serveur (indépendamment du travail de sauvegarde)
  - Inclut les en-têtes de contrôle du cache pour empêcher la mise en cache

## Téléverser les données de sauvegarde - `/api/upload` {#upload-backup-data-apiupload}

- **Point de terminaison** : `/api/upload`

- **Méthode** : POST

- **Description** : Téléverse les données d'opération de sauvegarde pour un Serveur. Prend en charge la détection des exécutions de sauvegarde en double et envoie des Notifications.

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
  - `400` : Champs requis manquants dans les sections Extra ou Data, ou MainOperation invalide
  - `409` : Données de sauvegarde en double (ignorées)
  - `500` : Erreur serveur lors du traitement des données de sauvegarde

- **Notes** :
  - Traite uniquement les opérations de sauvegarde (MainOperation doit être « Backup »)
  - Valide les champs requis dans la section Extra : machine-id, machine-name, backup-name, backup-id
  - Valide les champs requis dans la section Data : ParsedResult, BeginTime, Duration
  - Détecte automatiquement les exécutions de sauvegarde en double et retourne le Statut 409
  - Envoie des Notifications après l'insertion réussie de la sauvegarde (si configuré)
  - Enregistre les données de requête dans un Fichiers dans le répertoire `data` à la racine du projet en mode développement pour le débogage
  - Utilise une transaction pour la cohérence des données
