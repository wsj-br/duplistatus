# Modifications de rupture de l'API

Ce document décrit les modifications de rupture des points de terminaison de l'API externe dans les différentes versions de duplistatus. Les points de terminaison de l'API externe sont ceux conçus pour être utilisés par d'autres applications et Intégrations (par exemple, intégration de la page d'accueil).

## vue d'ensemble

Ce document couvre les modifications de rupture des points de terminaison de l'API externe qui affectent les Intégrations, les scripts et les applications consommant ces points de terminaison. Pour les points de terminaison de l'API interne utilisés par l'interface Web, les modifications sont gérées automatiquement et ne nécessitent pas de mises à jour manuelles.

:::note
Les points de terminaison de l'API externe sont maintenus pour la compatibilité rétroactive quand possible. Les modifications de rupture ne sont introduites que quand nécessaire pour les améliorations de cohérence, de Sécurité ou de fonctionnalité.
:::

## Modifications spécifiques à la Version

### Version 1.3.0

**Aucune modification de rupture des points de terminaison de l'API externe**

### Version 1.2.1

**Aucune modification de rupture des points de terminaison de l'API externe**

### Version 1.1.x

**Aucune modification de rupture des points de terminaison de l'API externe**

### Version 1.0.x

**Aucune modification de rupture des points de terminaison de l'API externe**

### Version 0.9.x

**Aucune modification de rupture des points de terminaison de l'API externe**

La Version 0.9.x introduit l'authentification et nécessite que tous les Utilisateurs se connectent. Lors de la mise à niveau à partir de la Version 0.8.x :

1. **Authentification requise** : Tous les Pages et les points de terminaison de l'API interne nécessitent maintenant l'authentification
2. **Compte Admin par défaut** : Un compte Admin par défaut est créé automatiquement :
   - Nom d'utilisateur : `admin`
   - Mot de passe : `Duplistatus09` (doit être modifié à la première Connexion)
3. **Invalidation de session** : Tous les sessions existantes sont invalidées
4. **Accès à l'API externe** : Les points de terminaison de l'API externe (`/api/summary`, `/api/lastbackup`, `/api/lastbackups`, `/api/upload`) restent non authentifiés pour la compatibilité avec les Intégrations et Duplicati

### Version 0.8.x

**Aucune modification de rupture des points de terminaison de l'API externe**

La Version 0.8.x n'introduit aucune modification de rupture des points de terminaison de l'API externe. Les points de terminaison suivants restent inchangés :

- `/api/summary` - Structure de réponse inchangée
- `/api/lastbackup/{serverId}` - Structure de réponse inchangée
- `/api/lastbackups/{serverId}` - Structure de réponse inchangée
- `/api/upload` - Format de demande/réponse inchangé

#### Améliorations de Sécurité

Bien qu'aucune modification de rupture n'ait été apportée aux points de terminaison de l'API externe, la Version 0.8.x inclut des améliorations de Sécurité :

- **Protection CSRF** : La validation du jeton CSRF est appliquée pour les demandes d'API qui modifient l'état, mais les API externes restent compatibles
- **Sécurité du Mot de passe** : Les points de terminaison du Mot de passe sont limités à l'interface utilisateur pour des raisons de Sécurité

:::note
Ces améliorations de Sécurité n'affectent pas les points de terminaison de l'API externe utilisés pour lire les données de sauvegarde. Si vous avez des scripts Personnalisés utilisant des points de terminaison internes, ils peuvent nécessiter une gestion des jetons CSRF.
:::

### Version 0.7.x

La Version 0.7.x introduit plusieurs modifications de rupture des points de terminaison de l'API externe qui nécessitent des mises à jour des Intégrations externes.

#### Modifications de rupture

##### Renommage de champ

- **`totalMachines`** → **`totalServers`** dans le point de terminaison `/api/summary`
- **`machine`** → **`server`** dans les objets de réponse de l'API
- **`backup_types_count`** → **`backup_jobs_count`** dans le point de terminaison `/api/lastbackups/{serverId}`

##### Modifications du chemin du point de terminaison

- Tous les points de terminaison de l'API utilisant précédemment `/api/machines/...` utilisent maintenant `/api/Serveurs/...`
- Les noms de paramètres ont changé de `machine_id` à `server_id` (l'encodage URL fonctionne toujours avec les deux)

#### Modifications de la structure de réponse

La structure de réponse pour plusieurs points de terminaison a été mise à jour pour la cohérence :

##### `/api/summary`

**Avant (0.6.x et antérieur) :**

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
  "totalServers": 3,  // Modifié de "totalMachines"
  "totalBackupsRuns": 9,
  "totalBackups": 9,
  "totalUploadedSize": 2397229507,
  "totalStorageUsed": 43346796938,
  "totalBackupSize": 126089687807,
  "overdueBackupsCount": 2,
  "secondsSinceLastBackup": 7200
}
```

##### `/api/lastbackup/{serverId}`

**Avant (0.6.x et antérieur) :**

```json
{
  "machine": {  // Modifié en "server"
    "id": "unique-server-id",
    "name": "Server Name",
    "backup_name": "Backup Name",
    "backup_id": "backup-id",
    "created_at": "2024-03-20T10:00:00Z"
  },
  "latest_backup": {
    // ... Détails
  },
  "status": 200
}
```

**Après (0.7.x+) :**

```json
{
  "server": {  // Modifié de "machine"
    "id": "unique-server-id",
    "name": "Server Name",
    "backup_name": "Backup Name",
    "backup_id": "backup-id",
    "created_at": "2024-03-20T10:00:00Z"
  },
  "latest_backup": {
    // ... Détails
  },
  "status": 200
}
```

##### `/api/lastbackups/{serverId}`

**Avant (0.6.x et antérieur) :**

```json
{
  "machine": {  // Modifié en "server"
    "id": "unique-server-id",
    "name": "Server Name",
    "backup_name": "Default Backup",
    "backup_id": "backup-id",
    "created_at": "2024-03-20T10:00:00Z"
  },
  "latest_backups": [
    // ... backup array
  ],
  "backup_types_count": 2,  // Modifié en "backup_jobs_count"
  "backup_names": ["Files", "Databases"],
  "status": 200
}
```

**Après (0.7.x+) :**

```json
{
  "server": {  // Modifié de "machine"
    "id": "unique-server-id",
    "name": "Server Name",
    "backup_name": "Default Backup",
    "backup_id": "backup-id",
    "created_at": "2024-03-20T10:00:00Z"
  },
  "latest_backups": [
    // ... backup array
  ],
  "backup_jobs_count": 2,  // Modifié de "backup_types_count"
  "backup_names": ["Files", "Databases"],
  "status": 200
}
```

## Étapes de migration

Si vous effectuez une mise à niveau à partir d'une Version antérieure à 0.7.x, suivez ces étapes :

1. **Mettre à jour les références de champ** : Remplacez Tous les références aux anciens noms de champ par les nouveaux
   - `totalMachines` → `totalServers`
   - `backup_types_count` → `backup_jobs_count`

2. **Mettre à jour les clés d'objet** : Modifiez `machine` en `server` dans l'analyse de réponse
   - Mettez à jour tout code qui accède à `response.machine` à `response.server`

3. **Mettre à jour les chemins des points de terminaison** : Modifiez tous les points de terminaison utilisant `/api/machines/...` en `/api/Serveurs/...`
   - Remarque : Les paramètres peuvent toujours accepter les anciens identifiants ; les chemins doivent être mis à jour

4. **Tester l'Intégration** : Vérifier que votre Intégration fonctionne avec la nouvelle structure d'API
   - Tester Tous les points de terminaison que votre application utilise
   - Vérifier que l'analyse de réponse gère correctement les nouveaux noms de champ

5. **Mettre à jour la documentation** : Mettez à jour toute documentation interne faisant référence à l'ancienne API
   - Mettez à jour les exemples d'API et les références de noms de champ

## Compatibilité

### Compatibilité rétroactive

- **Version 1.2.1** : Entièrement compatible avec la structure de l'API 1.1.x
- **Version 1.1.x** : Entièrement compatible avec la structure de l'API 1.0.x
- **Version 1.0.x** : Entièrement compatible avec la structure de l'API 0.9.x
- **Version 0.9.x** : Entièrement compatible avec la structure de l'API 0.8.x
- **Version 0.8.x** : Entièrement compatible avec la structure de l'API 0.7.x
- **Version 0.7.x** : Non compatible avec les versions antérieures à 0.7.x
  - Les anciens noms de champ ne fonctionneront pas
  - Les anciens chemins de points de terminaison ne fonctionneront pas

### Support futur

- Les anciens noms de champ des versions antérieures à 0.7.x ne sont pas pris en charge
- Les anciens chemins de points de terminaison des versions antérieures à 0.7.x ne sont pas pris en charge
- Les versions futures maintiendront la structure de l'API actuelle sauf si des modifications de rupture sont nécessaires

## Résumé des points de terminaison de l'API externe

Les points de terminaison de l'API externe suivants sont maintenus pour la compatibilité rétroactive et restent non authentifiés :

| Point de terminaison          | Méthode | Description                                       | Modifications de rupture                                                                                                 |
| ----------------------------- | ------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `/api/summary`                | GET     | Résumé global des opérations de sauvegarde        | 0.7.x : `totalMachines` → `totalServers`                                 |
| `/api/lastbackup/{serverId}`  | GET     | Dernière sauvegarde pour un Serveurs              | 0.7.x : `machine` → `server`                                             |
| `/api/lastbackups/{serverId}` | GET     | Dernières Sauvegardes pour Toutes les sauvegardes | 0.7.x : `machine` → `server`, `backup_types_count` → `backup_jobs_count` |
| `/api/upload`                 | POST    | Téléverser les données de sauvegarde de Duplicati | Aucune modification de rupture                                                                                           |

## Besoin d'aide ? {#need-help}

Si vous avez besoin d'aide pour mettre à jour votre Intégration :

- **Référence de l'API** : Consultez la [Référence de l'API](../api-reference/overview.md) pour la documentation du point de terminaison actuel
- **API externes** : Consultez [API externes](../api-reference/external-apis.md) pour la documentation détaillée du point de terminaison
- **Guide de migration** : Consultez le [Guide de migration](version_upgrade.md) pour les informations de migration Général
- **Notes de version** : Consultez les [Notes de version](../release-notes/0.8.x.md) spécifiques à la version pour un contexte supplémentaire
- **Support** : Ouvrez un problème sur [GitHub](https://github.com/wsj-br/duplistatus/issues) pour obtenir du support
