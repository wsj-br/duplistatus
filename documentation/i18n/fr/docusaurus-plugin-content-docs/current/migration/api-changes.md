# Modifications d'API non rétrocompatibles {/* #backward-incompatible-api-changes */}

Ce document décrit les modifications incompatibles apportées aux points de terminaison d'API externes dans les différentes versions de duplistatus. Les points de terminaison d'API externes sont ceux conçus pour être utilisés par d'autres applications et intégrations (par exemple, l'intégration Homepage).

## Aperçu {/* #overview */}

Ce document couvre les modifications incompatibles apportées aux points de terminaison d'API externes qui affectent les intégrations, les scripts et les applications consommant ces points de terminaison. Pour les points de terminaison d'API interne utilisés par l'interface web, les modifications sont gérées automatiquement et ne nécessitent pas de mises à jour manuelles.

:::note
Les points de terminaison d'API externes sont maintenus pour la compatibilité rétroactive si possible. Les modifications incompatibles ne sont introduites que si nécessaire pour des améliorations de cohérence, de sécurité ou de fonctionnalité.
:::

## Modifications spécifiques à la version {/* #version-specific-changes */}

### Version 1.3.0 {/* #version-130 */}

**Aucune modification incompatible des points de terminaison d'API externe**

### Version 1.2.1 {/* #version-121 */}

**Aucune modification incompatible des points de terminaison d'API externe**

### Version 1.1.x {/* #version-11x */}

**Aucune modification incompatible des points de terminaison d'API externe**

### Version 1.0.x {/* #version-10x */}

**Aucune modification incompatible des points de terminaison d'API externe**

### Version 0.9.x {/* #version-09x */}

**Aucune modification incompatible des points de terminaison d'API externe**

La version 0.9.x introduit l'authentification et nécessite que tous les utilisateurs se connectent. Lors de la mise à niveau à partir de la version 0.8.x :

1. **Authentification requise** : Toutes les pages et tous les points de terminaison internes de l'API nécessitent désormais une authentification
2. **Compte administrateur par défaut** : Un compte administrateur par défaut est créé automatiquement :
   - Nom d'utilisateur : `admin`
   - Mot de passe : `Duplistatus09` (doit être modifié lors de la première connexion)
3. **Invalidation des sessions** : Toutes les sessions existantes sont invalidées
4. **Accès externe à l'API** : Les points de terminaison externes de l'API (`/api/summary`, `/api/lastbackup`, `/api/lastbackups`, `/api/upload`) restent non authentifiés pour assurer la compatibilité avec les intégrations et Duplicati

### Version 0.8.x {/* #version-08x */}

**Aucune modification incompatible des points de terminaison d'API externe**

Version 0.8.x n'introduit aucune modification incompatible aux points de terminaison des API externes. Les points de terminaison suivants restent inchangés :

- `/api/summary` - Structure de réponse inchangée
- `/api/lastbackup/{serverId}` - Structure de réponse inchangée
- `/api/lastbackups/{serverId}` - Structure de réponse inchangée
- `/api/upload` - Format de requête/réponse inchangé

#### Améliorations de sécurité {/* #security-enhancements */}

Bien qu'aucune modification incompatible n'ait été apportée aux points de terminaison des API externes, la version 0.8.x inclut des améliorations de sécurité :

- **Protection CSRF** : La validation du jeton CSRF est appliquée pour les requêtes API modifiant l'état, mais les API externes restent compatibles
- **Sécurité du mot de passe** : Les points de terminaison de mot de passe sont limités à l'interface utilisateur pour des raisons de sécurité

:::note
Ces améliorations de sécurité n'affectent pas les points de terminaison des API externes utilisés pour lire les données de sauvegarde. Si vous avez des scripts personnalisés utilisant des points de terminaison internes, ils peuvent nécessiter la gestion des jetons CSRF.
:::

### Version 0.7.x {/* #version-07x */}

La version 0.7.x introduit plusieurs modifications incompatibles aux points de terminaison des API externes qui nécessitent des mises à jour des intégrations externes.

#### Modifications incompatibles {/* #breaking-changes */}

##### Renommage de champs {/* #field-renaming */}

- `totalMachines` → `totalServers` dans le point de terminaison `/api/summary`
- `machine` → `server` dans les objets de réponse API
- `backup_types_count` → `backup_jobs_count` dans le point de terminaison `/api/lastbackups/{serverId}`

##### Modifications du chemin du point de terminaison {/* #endpoint-path-changes */}

- Tous les points de terminaison API utilisant précédemment `/api/machines/...` utilisent maintenant `/api/servers/...`
- Les noms de paramètres ont changé de `machine_id` à `server_id` (l'encodage URL fonctionne toujours avec les deux)

#### Modifications de la structure de réponse {/* #response-structure-changes */}

La structure de réponse pour plusieurs points de terminaison a été mise à jour pour la cohérence :

##### `/api/summary` {/* #apisummary */}

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

##### `/api/lastbackup/{serverId}` {/* #apilastbackupserverid */}

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

##### `/api/lastbackups/{serverId}` {/* #apilastbackupsserverid */}

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

## Étapes de migration {/* #migration-steps */}

Si vous effectuez une mise à niveau à partir d'une version antérieure à 0.7.x, suivez ces étapes :

1. **Mettre à jour les références de champs** : Remplacez toutes les références aux anciens noms de champs par les nouveaux
   - `totalMachines` → `totalServers`
   - `backup_types_count` → `backup_jobs_count`

2. **Mettre à jour les clés d'objet** : Changez `machine` en `server` dans l'analyse des réponses
   - Mettez à jour tout code qui accède à `response.machine` en `response.server`

3. **Mettre à jour les chemins des points de terminaison** : Changez les points de terminaison utilisant `/api/machines/...` en `/api/servers/...`
   - Remarque : Les paramètres peuvent toujours accepter les anciens identifiants ; les chemins doivent être mis à jour

4. **Tester l'intégration** : Vérifiez que votre intégration fonctionne avec la nouvelle structure d'API
   - Testez tous les points de terminaison utilisés par votre application
   - Vérifiez que l'analyse des réponses gère correctement les nouveaux noms de champs

5. **Mettre à jour la documentation** : Mettez à jour toute documentation interne faisant référence à l'ancienne API
   - Mettez à jour les exemples d'API et les références de noms de champs

## Compatibilité {/* #compatibility */}

### Compatibilité rétroactive {/* #backward-compatibility */}

- **Version 1.2.1** : Entièrement compatible avec la structure d'API 1.1.x
- **Version 1.1.x** : Entièrement compatible avec la structure d'API 1.0.x
- **Version 1.0.x** : Entièrement compatible avec la structure d'API 0.9.x
- **Version 0.9.x** : Entièrement compatible avec la structure d'API 0.8.x
- **Version 0.8.x** : Entièrement compatible avec la structure d'API 0.7.x
- **Version 0.7.x** : Non compatible avec les versions antérieures à 0.7.x
  - Les anciens noms de champs ne fonctionneront pas
  - Les anciens chemins de points de terminaison ne fonctionneront pas

### Support futur {/* #future-support */}

- Les anciens noms de champs des versions antérieures à 0.7.x ne sont pas pris en charge
- Les anciens chemins de points de terminaison des versions antérieures à 0.7.x ne sont pas pris en charge
- Les futures versions maintiendront la structure d'API actuelle sauf si des modifications majeures sont nécessaires

## Résumé des points de terminaison d'API externes {/* #summary-of-external-api-endpoints */}

Les points de terminaison d'API externes suivants sont maintenus pour la compatibilité rétroactive et restent non authentifiés :

| Point de terminaison | Méthode | Description | Modifications majeures |
|----------|--------|-------------|------------------|
| `/api/summary` | GET | Résumé global des opérations de sauvegarde | 0.7.x : `totalMachines` → `totalServers` |
| `/api/lastbackup/{serverId}` | GET | Dernière sauvegarde pour un serveur | 0.7.x: `machine` → `server` |
| `/api/lastbackups/{serverId}` | GET | Dernières sauvegardes pour toutes les tâches de sauvegarde | 0.7.x: `machine` → `server`, `backup_types_count` → `backup_jobs_count` |
| `/api/upload` | POST | Télécharger les données de sauvegarde depuis Duplicati | Aucune modification incompatible |

## Besoin d'aide ? {/* #need-help */}

Si vous avez besoin d'assistance pour mettre à jour votre intégration :

- **Référence API** : Vérifier la [Référence API](../api-reference/overview.md) pour la documentation actuelle des points de terminaison
- **API externes** : Voir [API externes](../api-reference/external-apis.md) pour la documentation détaillée des points de terminaison
- **Guide de migration** : Consulter le [Guide de migration](version_upgrade.md) pour les informations générales de migration
- **Notes de version** : Consulter les [Notes de version](../release-notes/0.8.x.md) spécifiques à la version pour un contexte supplémentaire
- **Support** : Ouvrir un problème sur [GitHub](https://github.com/wsj-br/duplistatus/issues) pour obtenir de l'aide
