---
translation_last_updated: '2026-05-11T14:27:38.177Z'
source_file_mtime: '2026-05-06T23:18:51.418Z'
source_file_hash: 801b44af6c628cbca7fddeda42e36809574297c98d475cd678e689dddabadc31
translation_language: fr
source_file_path: documentation/docs/api-reference/chart-data-apis.md
translation_models:
  - qwen/qwen3-235b-a22b-2507
---
# Données du graphique {#chart-data}

## Obtenir les données agrégées du graphique - `/api/chart-data/aggregated` {#get-aggregated-chart-data---apichart-dataaggregated}
- **Point de terminaison** : `/api/chart-data/aggregated`
- **Méthode** : GET
- **Description** : Récupère les données agrégées du graphique avec un filtre de plage horaire facultatif.
- **Paramètres de requête** :
  - `startDate` (facultatif) : Date de début pour le filtrage (format ISO)
  - `endDate` (facultatif) : Date de fin pour le filtrage (format ISO)
- **Réponse** :

  ```json
  [
    {
      "date": "20/03/2024",
      "isoDate": "2024-03-20T10:00:00Z",
      "uploadedSize": 331318892,
      "duration": 38,
      "fileCount": 249426,
      "fileSize": 113395849938,
      "storageSize": 27203688543,
      "backupVersions": 10
    }
  ]
  ```

- **Réponses d'erreur** :
  - `400` : Paramètres de date invalides
  - `500` : Erreur serveur lors de la récupération des données du graphique
- **Notes** :
  - Prend en charge le filtrage par plage horaire avec les paramètres startDate et endDate
  - Valide le format de la date avant traitement
  - Renvoie les données agrégées provenant de tous les serveurs

## Obtenir les données du graphique du serveur - `/api/chart-data/server/:serverId` {#get-server-chart-data---apichart-dataserverserverid}
- **Point de terminaison** : `/api/chart-data/server/:serverId`
- **Méthode** : GET
- **Description** : Récupère les données du graphique pour un serveur spécifique avec un filtre de plage horaire facultatif.
- **Paramètres** :
  - `serverId` : l'identifiant du serveur
- **Paramètres de requête** :
  - `startDate` (facultatif) : Date de début pour le filtrage (format ISO)
  - `endDate` (facultatif) : Date de fin pour le filtrage (format ISO)
- **Réponse** :

  ```json
  [
    {
      "date": "20/03/2024",
      "isoDate": "2024-03-20T10:00:00Z",
      "uploadedSize": 331318892,
      "duration": 38,
      "fileCount": 249426,
      "fileSize": 113395849938,
      "storageSize": 27203688543,
      "backupVersions": 10
    }
  ]
  ```

- **Réponses d'erreur** :
  - `400` : Paramètres de date invalides
  - `500` : Erreur serveur lors de la récupération des données du graphique
- **Notes** :
  - Prend en charge le filtrage par plage horaire avec les paramètres startDate et endDate
  - Valide le format de la date avant traitement
  - Renvoie les données du graphique pour un serveur spécifique

## Obtenir les données du graphique de sauvegarde du serveur - `/api/chart-data/server/:serverId/backup/:backupName` {#get-server-backup-chart-data---apichart-dataserverserveridbackupbackupname}
- **Point de terminaison** : `/api/chart-data/server/:serverId/backup/:backupName`
- **Méthode** : GET
- **Description** : Récupère les données du graphique pour un serveur et une sauvegarde spécifiques avec un filtre de plage horaire facultatif.
- **Paramètres** :
  - `serverId` : l'identifiant du serveur
  - `backupName` : le nom de la sauvegarde (encodé en URL)
- **Paramètres de requête** :
  - `startDate` (facultatif) : Date de début pour le filtrage (format ISO)
  - `endDate` (facultatif) : Date de fin pour le filtrage (format ISO)
- **Réponse** :

  ```json
  [
    {
      "date": "20/03/2024",
      "isoDate": "2024-03-20T10:00:00Z",
      "uploadedSize": 331318892,
      "duration": 38,
      "fileCount": 249426,
      "fileSize": 113395849938,
      "storageSize": 27203688543,
      "backupVersions": 10
    }
  ]
  ```

- **Réponses d'erreur** :
  - `400` : Paramètres de date invalides
  - `500` : Erreur serveur lors de la récupération des données du graphique
- **Notes** :
  - Prend en charge le filtrage par plage horaire avec les paramètres startDate et endDate
  - Valide le format de la date avant traitement
  - Renvoie les données du graphique pour une combinaison spécifique de serveur et de sauvegarde
  - Le nom de la sauvegarde doit être encodé en URL
