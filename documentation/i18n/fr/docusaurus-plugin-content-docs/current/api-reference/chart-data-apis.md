---
translation_last_updated: '2026-04-17T23:59:51.080Z'
source_file_mtime: '2026-03-05T22:33:28.419Z'
source_file_hash: e8daf2dcb7456f01747c2576f18ec55fa9ca80d2816091104bc8cdef9ae84fb7
translation_language: fr
source_file_path: documentation/docs/api-reference/chart-data-apis.md
translation_models:
  - qwen/qwen3-235b-a22b-2507
---
# Données du graphique {#chart-data}

## Obtenir les données agrégées du graphique - `/api/chart-data/aggregated` {#get-aggregated-chart-data-apichart-dataaggregated}
- **Point de terminaison** : `/api/chart-data/aggregated`
- **Méthode** : GET
- **Description** : Récupère les données agrégées du graphique avec un filtrage facultatif par plage horaire.
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
  - Valide le format de date avant le traitement
  - Renvoie les données agrégées pour tous les serveurs

## Obtenir les données du graphique du serveur - `/api/chart-data/server/:serverId` {#get-server-chart-data-apichart-dataserverserverid}
- **Point de terminaison** : `/api/chart-data/server/:serverId`
- **Méthode** : GET
- **Description** : Récupère les données du graphique pour un serveur spécifique avec un filtrage facultatif par plage horaire.
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
  - Valide le format de date avant le traitement
  - Renvoie les données du graphique pour un serveur spécifique

## Obtenir les données du graphique de sauvegarde du serveur - `/api/chart-data/server/:serverId/backup/:backupName` {#get-server-backup-chart-data-apichart-dataserverserveridbackupbackupname}
- **Point de terminaison** : `/api/chart-data/server/:serverId/backup/:backupName`
- **Méthode** : GET
- **Description** : Récupère les données du graphique pour un serveur et une sauvegarde spécifiques avec un filtrage facultatif par plage horaire.
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
  - Valide le format de date avant le traitement
  - Renvoie les données du graphique pour une combinaison spécifique de serveur et de sauvegarde
  - Le nom de la sauvegarde doit être encodé en URL
