# Données du graphique {/* #chart-data */}

## Obtenir des données de graphique agrégées - `/api/chart-data/aggregated` {/* #get-aggregated-chart-data---apichart-dataaggregated */}
- **Point de terminaison**: `/api/chart-data/aggregated`
- **Méthode**: GET
- **Description**: Récupère des données de graphique agrégées avec un filtrage optionnel de la plage horaire.
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

## Obtenir des données de graphique du serveur - `/api/chart-data/server/:serverId` {/* #get-server-chart-data---apichart-dataserverserverid */}
- **Point de terminaison**: `/api/chart-data/server/:serverId`
- **Méthode**: GET
- **Description**: Récupère des données de graphique pour un serveur spécifique avec un filtrage optionnel de la plage horaire.
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

## Obtenir des données de graphique de sauvegarde du serveur - `/api/chart-data/server/:serverId/backup/:backupName` {/* #get-server-backup-chart-data---apichart-dataserverserveridbackupbackupname */}
- **Point de terminaison**: `/api/chart-data/server/:serverId/backup/:backupName`
- **Méthode**: GET
- **Description**: Récupère des données de graphique pour un serveur spécifique et une sauvegarde avec un filtrage optionnel de la plage horaire.
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
