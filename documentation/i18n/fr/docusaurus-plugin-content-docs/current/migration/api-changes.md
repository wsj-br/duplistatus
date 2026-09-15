# N° Backward-incompatible API changes {/* #backward-incompatible-api-changes */}

Ce document décrit les changements cassants des points de terminaison d'API externes à travers différentes versions de duplistatus. Les points de terminaison d'API externes sont ceux conçus pour être utilisés par d'autres applications et intégrations (par exemple, intégration Homepage).

## Aperçu {/* #overview */}

Ce document couvre les changements cassants des points de terminaison d'API externes qui affectent les intégrations, les scripts et les applications qui les consomment. Pour les points de terminaison d'API internes utilisés par l'interface web, les changements sont gérés automatiquement et ne nécessitent pas de mises à jour manuelles.

:::note
Les points de terminaison d'API externes sont maintenus pour la compatibilité ascendante lorsque c'est possible. Les changements cassants ne sont introduits que lorsque c'est nécessaire pour la cohérence, la sécurité ou les améliorations fonctionnelles.
:::

## Version-Specific Changes {/* #version-specific-changes */}

### Version 1.3.0 {/* #version-130 */}

**Aucun changement cassant des points de terminaison d'API externes**

### Version 1.2.1 {/* #version-121 */}

**Aucun changement cassant des points de terminaison d'API externes**

### Version 1.1.x {/* #version-11x */}

**Aucun changement cassant des points de terminaison d'API externes**

### Version 1.0.x {/* #version-10x */}

**Aucun changement cassant des points de terminaison d'API externes**

### Version 0.9.x {/* #version-09x */}

**Aucun changement cassant des points de terminaison d'API externes**

La version 0.9.x introduit l'authentification et exige que tous les utilisateurs se connectent. Lors de la mise à niveau depuis la version 0.8.x :

1. **Authentification requise** : Toutes les pages et les points de terminaison d'API internes nécessitent maintenant une authentification
2. **Compte administrateur par défaut** : Un compte administrateur par défaut est créé automatiquement :
   - Nom d'utilisateur : `admin`
   - Mot de passe : `Duplistatus09` (doit être changé lors de la première connexion)
3. **Invalidation des sessions** : Toutes les sessions existantes sont invalidées
4. **Accès à l'API externe** : Les points de terminaison d'API externes (`/api/summary`, `/api/lastbackup`, `/api/lastbackups`, `/api/upload`) restent non authentifiés pour la compatibilité avec les intégrations et Duplicati

### Version 0.8.x {/* #version-08x */}

**Aucun changement cassant des points de terminaison d'API externes**

La version 0.8.x n'introduit aucun changement cassant pour les points de terminaison des API externes. Les points de terminaison suivants restent inchangés :

- `/api/summary` - Structure de réponse inchangée
- `/api/lastbackup/{serverId}` - Structure de réponse inchangée
- `/api/lastbackups/{serverId}` - Structure de réponse inchangée
- `/api/upload` - Format de requête/réponse inchangé

#### Améliorations de sécurité {/* #security-enhancements */}

Bien que aucun changement cassant n'ait été apporté aux points de terminaison des API externes, la version 0.8.x inclut des améliorations de sécurité :

- **Protection CSRF** : La validation du jeton CSRF est appliquée pour les requêtes API modifiant l'état, mais les API externes restent compatibles
- **Sécurité des mots de passe** : Les points de terminaison des mots de passe sont restreints à l'interface utilisateur pour des raisons de sécurité

:::note
Ces améliorations de sécurité n'affectent pas les points de terminaison des API externes utilisés pour la lecture des données de sauvegarde. Si vous avez des scripts personnalisés utilisant des points de terminaison internes, ils peuvent nécessiter une gestion des jetons CSRF.
:::

### Version 0.7.x {/* #version-07x */}

La version 0.7.x introduit plusieurs changements cassants pour les points de terminaison des API externes qui nécessitent des mises à jour pour les intégrations externes.

#### Changements cassants {/* #breaking-changes */}

##### Renommage des champs {/* #field-renaming */}

- `totalMachines` → `totalServers` dans le point de terminaison `/api/summary`
- `machine` → `server` dans les objets de réponse de l'API
- `backup_types_count` → `backup_jobs_count` dans le point de terminaison `/api/lastbackups/{serverId}`

##### Modifications des chemins des points de terminaison {/* #endpoint-path-changes */}

- Tous les points de terminaison de l'API utilisant précédemment `/api/machines/...` utilisent maintenant `/api/servers/...`
- Les noms des paramètres ont changé de `machine_id` à `server_id` (le codage URL fonctionne toujours avec les deux)

#### Modifications de la structure de réponse {/* #response-structure-changes */}

La structure de réponse de plusieurs points de terminaison a été mise à jour pour assurer la cohérence :

##### `/api/summary` {/* #apisummary */}

**Avant (0.6.x et antérieur):**

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

**Après (0.7.x+):**

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

**Avant (0.6.x et antérieur):**

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

**Après (0.7.x+):**

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

**Avant (0.6.x et antérieur):**

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

**Après (0.7.x+):**

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

1. **Mettre à jour les références de champ** : Remplacez toutes les références aux anciens noms de champ par les nouveaux
   - `totalMachines` → `totalServers`
   - `backup_types_count` → `backup_jobs_count`

2. **Mettre à jour les clés d'objet** : Changez `machine` en `server` dans l'analyse des réponses
   - Mettez à jour tout code qui accède à `response.machine` pour `response.server`

3. **Mettre à jour les chemins de point de terminaison** : Changez les points de terminaison utilisant `/api/machines/...` en `/api/servers/...`
   - Remarque : Les paramètres peuvent encore accepter les anciens identifiants ; les chemins doivent être mis à jour

4. **Tester l'intégration** : Vérifiez que votre intégration fonctionne avec la nouvelle structure d'API
   - Testez tous les points de terminaison utilisés par votre application
   - Vérifiez que l'analyse des réponses gère correctement les nouveaux noms de champ

5. **Mettre à jour la documentation** : Mettez à jour toute documentation interne faisant référence à l'ancienne API
   - Mettez à jour les exemples d'API et les références aux noms de champ

## Compatibilité {/* #compatibility */}

### Compatibilité ascendante {/* #backward-compatibility */}

- **Version 1.2.1** : Entièrement compatible avec la structure d'API 1.1.x
- **Version 1.1.x** : Entièrement compatible avec la structure d'API 1.0.x
- **Version 1.0.x** : Entièrement compatible avec la structure d'API 0.9.x
- **Version 0.9.x** : Entièrement compatible avec la structure d'API 0.8.x
- **Version 0.8.x** : Entièrement compatible avec la structure d'API 0.7.x
- **Version 0.7.x** : Non compatible avec les versions antérieures à 0.7.x
  - Les anciens noms de champ ne fonctionneront pas
  - Les anciens chemins de point de terminaison ne fonctionneront pas

### Support futur {/* #future-support */}

- Les anciens noms de champ des versions antérieures à 0.7.x ne sont pas pris en charge
- Les anciens chemins de point de terminaison des versions antérieures à 0.7.x ne sont pas pris en charge
- Les futures versions maintiendront la structure actuelle d'API sauf si des changements cassants sont nécessaires

## Résumé des points de terminaison d'API externes {/* #summary-of-external-api-endpoints */}

Les points de terminaison d'API externes suivants sont maintenus pour la compatibilité ascendante et restent non authentifiés :

| Point de terminaison | Méthode | Description | Changements cassants |
|------------------|---------|-------------|---------------------|
| `/api/summary` | GET | Résumé général des opérations de sauvegarde | 0.7.x : `totalMachines` → `totalServers` |
| `/api/lastbackup/{serverId}` | GET | Dernière sauvegarde pour un serveur | 0.7.x: `machine` → `server` |
| `/api/lastbackups/{serverId}` | GET | Dernières sauvegardes pour toutes les tâches de sauvegarde | 0.7.x: `machine` → `server`, `backup_types_count` → `backup_jobs_count` |
| `/api/upload` | POST | Télécharger les données de sauvegarde depuis Duplicati | Aucune rupture de compatibilité |

## Besoin d'aide ? {/* #need-help */}

Si vous avez besoin d'aide pour mettre à jour votre intégration :

- **Référence API** : Consultez la [Référence API](../api-reference/overview.md) pour la documentation des points de terminaison actuels
- **API externes** : Consultez les [API externes](../api-reference/external-apis.md) pour la documentation détaillée des points de terminaison
- **Guide de migration** : Consultez le [Guide de migration](version_upgrade.md) pour des informations générales sur la migration
- **Notes de version** : Consultez les [Notes de version](../release-notes/0.8.x.md) spécifiques à la version pour des informations supplémentaires
- **Support** : Ouvrez une demande d'assistance sur [GitHub](https://github.com/wsj-br/duplistatus/issues)
