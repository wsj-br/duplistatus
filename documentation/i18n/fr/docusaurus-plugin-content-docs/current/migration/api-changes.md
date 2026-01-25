# Modifications Incompatibles de l'API

Ce document décrit les modifications incompatibles des endpoints API externes dans les différentes versions de duplistatus. Les endpoints API externes sont ceux conçus pour être utilisés par d'autres applications et intégrations (par exemple, l'intégration Homepage).

## Aperçu

Ce document couvre les modifications incompatibles des endpoints API externes qui affectent les intégrations, les scripts et les applications consommant ces endpoints. Pour les endpoints API internes utilisés par l'interface web, les modifications sont gérées automatiquement et ne nécessitent pas de mises à jour manuelles.

:::note
Les endpoints API externes sont maintenus rétrocompatibles dans la mesure du possible. Les modifications incompatibles ne sont introduites que lorsqu'elles sont nécessaires pour la cohérence, la sécurité ou les améliorations fonctionnelles.
:::

## Modifications par Version

### Version 1.3.0

**Aucune modification incompatible des endpoints API externes**

### Version 1.2.1

**Aucune modification incompatible des endpoints API externes**


### Version 1.1.x

**Aucune modification incompatible des endpoints API externes**

### Version 1.0.x

**Aucune modification incompatible des endpoints API externes**


### Version 0.9.x

**Aucune modification incompatible des endpoints API externes**

La version 0.9.x introduit l'authentification et exige que tous les utilisateurs se connectent. Lors de la mise à niveau depuis la version 0.8.x :

1. **Authentification requise** : Toutes les pages et endpoints API internes nécessitent désormais une authentification
2. **Compte administrateur par défaut** : Un compte administrateur par défaut est créé automatiquement :
   - Nom d'utilisateur : `admin`
   - Mot de passe : `Duplistatus09` (doit être changé lors de la première connexion)
3. **Invalidation des sessions** : Toutes les sessions existantes sont invalidées
4. **Accès API externe** : Les endpoints API externes (`/api/summary`, `/api/lastbackup`, `/api/lastbackups`, `/api/upload`) restent non authentifiés pour la compatibilité avec les intégrations et Duplicati

### Version 0.8.x

**Aucune modification incompatible des endpoints API externes**

La version 0.8.x n'introduit aucune modification incompatible des endpoints API externes. Les endpoints suivants restent inchangés :

- `/api/summary` - Structure de réponse inchangée
- `/api/lastbackup/{serverId}` - Structure de réponse inchangée
- `/api/lastbackups/{serverId}` - Structure de réponse inchangée
- `/api/upload` - Format de requête/réponse inchangé

#### Améliorations de sécurité

Bien qu'aucune modification incompatible n'ait été apportée aux endpoints API externes, la version 0.8.x inclut des améliorations de sécurité :

- **Protection CSRF** : La validation du token CSRF est appliquée pour les requêtes API modifiant l'état, mais les APIs externes restent compatibles
- **Sécurité des mots de passe** : Les endpoints de mot de passe sont limités à l'interface utilisateur pour des raisons de sécurité

:::note
Ces améliorations de sécurité n'affectent pas les endpoints API externes utilisés pour lire les données de sauvegarde. Si vous avez des scripts personnalisés utilisant des endpoints internes, ils peuvent nécessiter la gestion des tokens CSRF.
:::

### Version 0.7.x

La version 0.7.x introduit plusieurs modifications incompatibles des endpoints API externes qui nécessitent des mises à jour des intégrations externes.

#### Modifications Incompatibles

##### Renommage des champs

- **`totalMachines`** → **`totalServers`** dans l'endpoint `/api/summary`
- **`machine`** → **`server`** dans les objets de réponse API
- **`backup_types_count`** → **`backup_jobs_count`** dans l'endpoint `/api/lastbackups/{serverId}`

##### Modifications des chemins d'endpoint

- Tous les endpoints API utilisant précédemment `/api/machines/...` utilisent maintenant `/api/servers/...`
- Les noms de paramètres ont changé de `machine_id` à `server_id` (l'encodage URL fonctionne toujours avec les deux)

#### Modifications de la structure de réponse

La structure de réponse pour plusieurs endpoints a été mise à jour pour plus de cohérence :

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
  "totalServers": 3,  // Changé de "totalMachines"
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
  "machine": {  // Changé en "server"
    "id": "unique-server-id",
    "name": "Server Name",
    "backup_name": "Backup Name",
    "backup_id": "backup-id",
    "created_at": "2024-03-20T10:00:00Z"
  },
  "latest_backup": {
    // ... détails de sauvegarde
  },
  "status": 200
}
```

**Après (0.7.x+) :**
```json
{
  "server": {  // Changé de "machine"
    "id": "unique-server-id",
    "name": "Server Name",
    "backup_name": "Backup Name",
    "backup_id": "backup-id",
    "created_at": "2024-03-20T10:00:00Z"
  },
  "latest_backup": {
    // ... détails de sauvegarde
  },
  "status": 200
}
```

##### `/api/lastbackups/{serverId}`

**Avant (0.6.x et antérieur) :**
```json
{
  "machine": {  // Changé en "server"
    "id": "unique-server-id",
    "name": "Server Name",
    "backup_name": "Default Backup",
    "backup_id": "backup-id",
    "created_at": "2024-03-20T10:00:00Z"
  },
  "latest_backups": [
    // ... tableau de sauvegardes
  ],
  "backup_types_count": 2,  // Changé en "backup_jobs_count"
  "backup_names": ["Files", "Databases"],
  "status": 200
}
```

**Après (0.7.x+) :**
```json
{
  "server": {  // Changé de "machine"
    "id": "unique-server-id",
    "name": "Server Name",
    "backup_name": "Default Backup",
    "backup_id": "backup-id",
    "created_at": "2024-03-20T10:00:00Z"
  },
  "latest_backups": [
    // ... tableau de sauvegardes
  ],
  "backup_jobs_count": 2,  // Changé de "backup_types_count"
  "backup_names": ["Files", "Databases"],
  "status": 200
}
```

## Étapes de migration

Si vous effectuez une mise à niveau depuis une version antérieure à 0.7.x, suivez ces étapes :

1. **Mettre à jour les références de champs** : Remplacez toutes les références aux anciens noms de champs par les nouveaux
   - `totalMachines` → `totalServers`
   - `backup_types_count` → `backup_jobs_count`

2. **Mettre à jour les clés d'objet** : Changez `machine` en `server` lors de l'analyse des réponses
   - Mettez à jour tout code accédant à `response.machine` vers `response.server`

3. **Mettre à jour les chemins d'endpoint** : Changez tous les endpoints utilisant `/api/machines/...` vers `/api/servers/...`
   - Note : Les paramètres peuvent toujours accepter les anciens identifiants ; les chemins doivent être mis à jour

4. **Tester l'intégration** : Vérifiez que votre intégration fonctionne avec la nouvelle structure API
   - Testez tous les endpoints utilisés par votre application
   - Vérifiez que l'analyse des réponses gère correctement les nouveaux noms de champs

5. **Mettre à jour la documentation** : Mettez à jour toute documentation interne faisant référence à l'ancienne API
   - Mettez à jour les exemples d'API et les références de noms de champs

## Compatibilité

### Rétrocompatibilité

- **Version 1.2.1** : Entièrement rétrocompatible avec la structure API 1.1.x
- **Version 1.1.x** : Entièrement rétrocompatible avec la structure API 1.0.x
- **Version 1.0.x** : Entièrement rétrocompatible avec la structure API 0.9.x
- **Version 0.9.x** : Entièrement rétrocompatible avec la structure API 0.8.x
- **Version 0.8.x** : Entièrement rétrocompatible avec la structure API 0.7.x
- **Version 0.7.x** : Non rétrocompatible avec les versions antérieures à 0.7.x
  - Les anciens noms de champs ne fonctionneront pas
  - Les anciens chemins d'endpoint ne fonctionneront pas

### Support futur

- Les anciens noms de champs des versions antérieures à 0.7.x ne sont pas supportés
- Les anciens chemins d'endpoint des versions antérieures à 0.7.x ne sont pas supportés
- Les futures versions maintiendront la structure API actuelle sauf si des modifications incompatibles sont nécessaires

## Résumé des endpoints API externes

Les endpoints API externes suivants sont maintenus pour la rétrocompatibilité et restent non authentifiés :

| Endpoint | Méthode | Description | Modifications incompatibles |
|----------|---------|-------------|----------------------------|
| `/api/summary` | GET | Résumé global des opérations de sauvegarde | 0.7.x : `totalMachines` → `totalServers` |
| `/api/lastbackup/{serverId}` | GET | Dernière sauvegarde pour un serveur | 0.7.x : `machine` → `server` |
| `/api/lastbackups/{serverId}` | GET | Dernières sauvegardes pour tous les jobs | 0.7.x : `machine` → `server`, `backup_types_count` → `backup_jobs_count` |
| `/api/upload` | POST | Télécharger les données de sauvegarde depuis Duplicati | Aucune modification incompatible |

## Besoin d'aide ?

Si vous avez besoin d'aide pour mettre à jour votre intégration :

- **Référence API** : Consultez la [Référence API](../api-reference/overview.md) pour la documentation actuelle des endpoints
- **APIs externes** : Voir [APIs externes](../api-reference/external-apis.md) pour la documentation détaillée des endpoints
- **Guide de migration** : Consultez le [Guide de migration](version_upgrade.md) pour les informations générales de migration
- **Notes de version** : Consultez les [Notes de version](../release-notes/0.8.x.md) spécifiques pour plus de contexte
- **Support** : Ouvrez une issue sur [GitHub](https://github.com/wsj-br/duplistatus/issues) pour obtenir de l'aide
