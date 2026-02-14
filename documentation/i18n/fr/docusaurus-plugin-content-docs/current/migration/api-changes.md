---
translation_last_updated: '2026-02-14T04:57:37.365Z'
source_file_mtime: '2026-01-25T02:45:42.746Z'
source_file_hash: 42ca049a94e01f4c
translation_language: fr
source_file_path: migration/api-changes.md
---
# Modifications incompatibles de l'API {#api-breaking-changes}

Ce document décrit les modifications majeures apportées aux points de terminaison d'API externes dans différentes versions de duplistatus. Les points de terminaison d'API externes sont ceux conçus pour être utilisés par d'autres applications et intégrations (par exemple, l'intégration Homepage).

## Vue d'ensemble {#overview}

Ce document couvre les modifications majeures apportées aux points de terminaison d'API externes qui affectent les intégrations, les scripts et les applications qui consomment ces points de terminaison. Pour les points de terminaison d'API interne utilisés par l'interface web, les modifications sont gérées automatiquement et ne nécessitent pas de mises à jour manuelles.

:::note
Les points de terminaison des API externes sont maintenus pour la compatibilité rétroactive dans la mesure du possible. Les modifications incompatibles ne sont introduites que lorsqu'elles sont nécessaires pour des améliorations de cohérence, de sécurité ou de fonctionnalité.
:::

## Modifications spécifiques à la version {#version-specific-changes}

### Version 1.3.0 {#version-130}

**Non Aucune modification incompatible avec les points de terminaison API externes**

### Version 1.2.1 {#version-121}

**Non Aucune modification incompatible avec les points de terminaison API externes**

### Version 1.1.x {#version-11x}

**Non Aucune modification incompatible avec les points de terminaison API externes**

### Version 1.0.x {#version-10x}

**Non Aucune modification incompatible avec les points de terminaison API externes**

### Version 0.9.x {#version-09x}

**Non Aucune modification incompatible avec les points de terminaison API externes**

La version 0.9.x introduit l'authentification et nécessite que tous les utilisateurs se connectent. Lors de la mise à niveau à partir de la version 0.8.x :

1. **Authentification requise** : Toutes les pages et les points de terminaison API internes nécessitent maintenant une authentification
2. **Compte Admin par défaut** : Un compte admin par défaut est créé automatiquement :
   - Nom d'utilisateur : `admin`
   - Mot de passe : `Duplistatus09` (doit être modifié à la première connexion)
3. **Invalidation de session** : Tous les sessions existantes sont invalidées
4. **Accès API externe** : Les points de terminaison API externes (`/api/summary`, `/api/lastbackup`, `/api/lastbackups`, `/api/upload`) restent non authentifiés pour la compatibilité avec les intégrations et Duplicati

### Version 0.8.x {#version-08x}

**Non Aucune modification incompatible avec les points de terminaison API externes**

La version 0.8.x n'introduit aucune modification incompatible avec les points de terminaison de l'API externe. Les points de terminaison suivants restent inchangés :

- `/api/summary` - Structure de réponse inchangée
- `/api/lastbackup/{serverId}` - Structure de réponse inchangée
- `/api/lastbackups/{serverId}` - Structure de réponse inchangée
- `/api/upload` - Format de requête/réponse inchangé

#### Améliorations de sécurité {#security-enhancements}

Bien qu'aucune modification de rupture n'ait été apportée aux points de terminaison de l'API externe, la version 0.8.x inclut des améliorations de sécurité :

- **Protection CSRF** : La validation du jeton CSRF est appliquée pour les requêtes API modifiant l'état, mais les API externes restent compatibles
- **Sécurité du mot de passe** : Les points de terminaison de mot de passe sont limités à l'interface utilisateur pour des raisons de sécurité

:::note
Ces améliorations de sécurité n'affectent pas les points de terminaison API externes utilisés pour lire les données de sauvegarde. Si vous avez des scripts personnalisés utilisant des points de terminaison internes, ils peuvent nécessiter la gestion des jetons CSRF.
:::

### Version 0.7.x {#version-07x}

La version 0.7.x introduit plusieurs modifications incompatibles avec les versions antérieures des points de terminaison d'API externes qui nécessitent des mises à jour des intégrations externes.

#### Modifications incompatibles {#breaking-changes}

##### Renommage de champs {#field-renaming}

- **`totalMachines`** → **`totalServers`** dans le point de terminaison `/api/summary`
- **`machine`** → **`server`** dans les objets de réponse API
- **`backup_types_count`** → **`backup_jobs_count`** dans le point de terminaison `/api/lastbackups/{serverId}`

##### Modifications des chemins d'accès aux points de terminaison {#endpoint-path-changes}

- Tous les points de terminaison API utilisant précédemment `/api/machines/...` utilisent maintenant `/api/serveurs/...`
- Les noms de paramètres ont changé de `machine_id` à `server_id` (l'encodage URL fonctionne toujours avec les deux)

#### Modifications de la structure de réponse {#response-structure-changes}

La structure de réponse pour plusieurs points de terminaison a été mise à jour pour plus de cohérence :

##### `/api/summary` {#apisummary}

**Avant (0.6.x et antérieures) :**

```json
{
  "totalMachines": 3,
  "totalBackupsRuns": 9,
  "totalBackups": 9,
  "totalUploadedSize": 2397229507,
  "totalStorageUsed": 43346796938,
  "totalBackupSize": 126089687807,
  "overdueBackupsCount": 2,
  "secondsSinceLastBackup": 7200
}
```

**Après (0.7.x+) :**

```json
{
  "totalServers": 3,  // Changed from "totalMachines"
  "totalBackupsRuns": 9,
  "totalBackups": 9,
  "totalUploadedSize": 2397229507,
  "totalStorageUsed": 43346796938,
  "totalBackupSize": 126089687807,
  "overdueBackupsCount": 2,
  "secondsSinceLastBackup": 7200
}
```

##### `/api/lastbackup/{serverId}` {#apilastbackupserverid}

**Avant (0.6.x et antérieures) :**

```json
{
  "machine": {  // Changed to "server"
    "id": "unique-server-id",
    "name": "Server Name",
    "backup_name": "Backup Name",
    "backup_id": "backup-id",
    "created_at": "2024-03-20T10:00:00Z"
  },
  "latest_backup": {
    // ... backup details
  },
  "status": 200
}
```

**Après (0.7.x+) :**

```json
{
  "server": {  // Changed from "machine"
    "id": "unique-server-id",
    "name": "Server Name",
    "backup_name": "Backup Name",
    "backup_id": "backup-id",
    "created_at": "2024-03-20T10:00:00Z"
  },
  "latest_backup": {
    // ... backup details
  },
  "status": 200
}
```

##### `/api/lastbackups/{serverId}` {#apilastbackupsserverid}

**Avant (0.6.x et antérieures) :**

```json
{
  "machine": {  // Changed to "server"
    "id": "unique-server-id",
    "name": "Server Name",
    "backup_name": "Default Backup",
    "backup_id": "backup-id",
    "created_at": "2024-03-20T10:00:00Z"
  },
  "latest_backups": [
    // ... backup array
  ],
  "backup_types_count": 2,  // Changed to "backup_jobs_count"
  "backup_names": ["Files", "Databases"],
  "status": 200
}
```

**Après (0.7.x+) :**

```json
{
  "server": {  // Changed from "machine"
    "id": "unique-server-id",
    "name": "Server Name",
    "backup_name": "Default Backup",
    "backup_id": "backup-id",
    "created_at": "2024-03-20T10:00:00Z"
  },
  "latest_backups": [
    // ... backup array
  ],
  "backup_jobs_count": 2,  // Changed from "backup_types_count"
  "backup_names": ["Files", "Databases"],
  "status": 200
}
```

## Étapes de migration {#migration-steps}

Si vous effectuez une mise à niveau à partir d'une version antérieure à 0.7.x, suivez ces étapes :

1. **Mettre à jour les références de champs** : Remplacez toutes les références aux anciens noms de champs par les nouveaux
   - `totalMachines` → `totalServers`
   - `backup_types_count` → `backup_jobs_count`

2. **Mettre à jour les clés d'objet** : Remplacer `machine` par `server` dans l'analyse des réponses
   - Mettre à jour tout code qui accède à `response.machine` vers `response.server`

3. **Mettre à jour les chemins des points de terminaison** : Remplacez les points de terminaison utilisant `/api/machines/...` par `/api/servers/...`
   - Note : Les paramètres peuvent toujours accepter les anciens identifiants ; les chemins doivent être mis à jour

4. **Intégration des tests** : Vérifier que votre intégration fonctionne avec la nouvelle structure d'API
   - Tester tous les points de terminaison que votre application utilise
   - Vérifier que l'analyse des réponses gère correctement les nouveaux noms de champs

5. **Mettre à jour la documentation** : Mettre à jour toute documentation interne référençant l'ancienne API
   - Mettre à jour les exemples d'API et les références de noms de champs

## Compatibilité {#compatibility}

### Compatibilité rétroactive {#backward-compatibility}

- **Version 1.2.1** : Entièrement rétrocompatible avec la structure API 1.1.x
- **Version 1.1.x** : Entièrement rétrocompatible avec la structure API 1.0.x
- **Version 1.0.x** : Entièrement rétrocompatible avec la structure API 0.9.x
- **Version 0.9.x** : Entièrement rétrocompatible avec la structure API 0.8.x
- **Version 0.8.x** : Entièrement rétrocompatible avec la structure API 0.7.x
- **Version 0.7.x** : Non rétrocompatible avec les versions antérieures à 0.7.x
  - Les anciens noms de champs ne fonctionneront pas
  - Les anciens chemins de points de terminaison ne fonctionneront pas

### Support Futur {#future-support}

- Les anciens noms de champs des versions antérieures à 0.7.x ne sont pas pris en charge
- Les anciens chemins de points de terminaison des versions antérieures à 0.7.x ne sont pas pris en charge
- Les versions futures maintiendront la structure API actuelle sauf si des modifications majeures sont nécessaires

## Résumé des points de terminaison d'API externes {#summary-of-external-api-endpoints}

Les points de terminaison API externes suivants sont maintenus pour la compatibilité descendante et restent non authentifiés :

| Point de terminaison | Méthode | Description | Modifications incompatibles |
|----------|--------|-------------|------------------|
| `/api/summary` | GET | Résumé global des opérations de sauvegarde | 0.7.x : `totalMachines` → `totalServers` |
| `/api/lastbackup/{serverId}` | GET | Dernière sauvegarde pour un serveur | 0.7.x : `machine` → `server` |
| `/api/lastbackups/{serverId}` | GET | Dernières sauvegardes pour tous les travaux de sauvegarde | 0.7.x : `machine` → `server`, `backup_types_count` → `backup_jobs_count` |
| `/api/upload` | POST | Téléverser les données de sauvegarde depuis Duplicati | Non |

## Besoin d'aide ? {#need-help}

Si vous avez besoin d'aide pour mettre à jour votre intégration :

- **Référence API** : Vérifiez la [Référence API](../api-reference/overview.md) pour la documentation actuelle des points de terminaison
- **API externes** : Consultez [API externes](../api-reference/external-apis.md) pour la documentation détaillée des points de terminaison
- **Guide de migration** : Consultez le [Guide de migration](version_upgrade.md) pour les informations générales de migration
- **Notes de version** : Consultez les [Notes de version](../release-notes/0.8.x.md) spécifiques à la version pour un contexte supplémentaire
- **Support** : Ouvrez un problème sur [GitHub](https://github.com/wsj-br/duplistatus/issues) pour obtenir de l'aide
