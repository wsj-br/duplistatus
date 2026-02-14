---
translation_last_updated: '2026-02-14T04:57:35.776Z'
source_file_mtime: '2026-02-06T21:19:17.347Z'
source_file_hash: 21d21cb01acea43b
translation_language: fr
source_file_path: development/database.md
---
# Schéma de base de données {#database-schema}

Ce document décrit le schéma de base de données SQLite utilisé par duplistatus pour stocker les données des opérations de sauvegarde.

## Emplacement de la base de données {#database-location}

La base de données est stockée dans le répertoire des données d'application :
- **Emplacement par défaut** : `/app/data/backups.db`
- **Volume Docker** : `duplistatus_data:/app/data`
- **Nom du fichier** : `backups.db`

## Système de Migration de Base de Données {#database-migration-system}

duplistatus utilise un système de migration automatisé pour gérer les modifications du schéma de base de données entre les versions.

### Historique des versions de migration {#migration-version-history}

Les versions de migration historiques suivantes ont amené la base de données à son état actuel :

- **Schema v1.0** (Application v0.6.x et antérieures) : Schéma de base de données initial avec tables machines et sauvegardes
- **Schema v2.0** (Application v0.7.x) : Ajout de colonnes manquantes et table configurations
- **Schema v3.0** (Application v0.7.x) : Renommage de la table machines en serveurs, ajout de la colonne server_url
- **Schema v3.1** (Application v0.8.x) : Amélioration des champs de données de sauvegarde, ajout de la colonne server_password
- **Schema v4.0** (Application v0.9.x / v1.0.x) : Ajout du contrôle d'accès utilisateur (tables utilisateurs, sessions, audit_log)

La version actuelle de l'application (v1.3.x) utilise **Schema v4.0** comme dernière version du schéma de base de données.

### Processus de Migration {#migration-process}

1. **Sauvegarde Automatique** : Crée une sauvegarde avant la migration
2. **Mise à Jour du Schéma** : Met à jour la structure de la base de données
3. **Migration des Données** : Préserve les données existantes
4. **Vérification** : Confirme la migration réussie

## Tableaux {#tables}

### Tableau des serveurs {#servers-table}

Stocke les informations sur les serveurs Duplicati en cours de surveillance.

#### Champs {#fields}

| Champ            | Type             | Description                        |
|------------------|------------------|------------------------------------|
| `id`             | TEXT PRIMARY KEY | Identifiant unique du serveur      |
| `name`           | TEXT NOT NULL    | Nom du serveur depuis Duplicati    |
| `server_url`     | TEXT             | URL du serveur Duplicati           |
| `alias`          | TEXT             | Nom convivial défini par l'utilisateur |
| `note`           | TEXT             | Notes/Description définies par l'utilisateur |
| `server_password`| TEXT             | Mot de passe du serveur pour l'authentification |
| `created_at`     | DATETIME         | Horodatage de création du serveur  |

### Tableau des sauvegardes {#backups-table}

Stocke les données d'opération de sauvegarde reçues des serveurs Duplicati.

#### Champs clés {#key-fields}

| Champ             | Type              | Description                                          |
|-------------------|-------------------|------------------------------------------------------|
| `id`              | TEXT PRIMARY KEY  | Identifiant unique de sauvegarde                     |
| `server_id`       | TEXT NOT NULL     | Référence à la table serveurs                        |
| `backup_name`     | TEXT NOT NULL     | Nom du travail de sauvegarde                         |
| `backup_id`       | TEXT NOT NULL     | ID de sauvegarde de Duplicati                        |
| `date`            | DATETIME NOT NULL | Heure d'exécution de la sauvegarde                   |
| `status`          | TEXT NOT NULL     | Statut de la sauvegarde (Succès, Avertissement, Erreur, Fatal) |
| `duration_seconds`| INTEGER NOT NULL  | Durée en secondes                                    |
| `size`            | INTEGER           | Taille des fichiers source                           |
| `uploaded_size`   | INTEGER           | Taille des données téléversées                       |
| `examined_files`  | INTEGER           | Nombre de fichiers examinés                          |
| `warnings`        | INTEGER           | Nombre d'avertissements                              |
| `errors`          | INTEGER           | Nombre d'erreurs                                     |
| `created_at`      | DATETIME          | Horodatage de création de l'enregistrement           |

#### Tableaux de Messages (Stockage JSON) {#message-arrays-json-storage}

| Champ              | Type | Description                                    |
|-------------------|------|------------------------------------------------|
| `messages_array`    | TEXT | Tableau JSON de messages de journal            |
| `warnings_array`    | TEXT | Tableau JSON de messages d'avertissement       |
| `errors_array`      | TEXT | Tableau JSON de messages d'erreur              |
| `available_backups` | TEXT | Tableau JSON de versions de sauvegarde disponibles |

#### Champs d'opération de fichier {#file-operation-fields}

| Champ                 | Type    | Description                           |
|-----------------------|---------|---------------------------------------|
| `examined_files`      | INTEGER | Fichiers examinés lors de la sauvegarde |
| `opened_files`        | INTEGER | Fichiers ouverts pour la sauvegarde |
| `added_files`         | INTEGER | Nouveaux fichiers ajoutés à la sauvegarde |
| `modified_files`      | INTEGER | Fichiers modifiés dans la sauvegarde |
| `deleted_files`       | INTEGER | Fichiers supprimés de la sauvegarde |
| `deleted_folders`     | INTEGER | Dossiers supprimés de la sauvegarde |
| `added_folders`       | INTEGER | Dossiers ajoutés à la sauvegarde |
| `modified_folders`    | INTEGER | Dossiers modifiés dans la sauvegarde |
| `not_processed_files` | INTEGER | Fichiers non traités |
| `too_large_files`     | INTEGER | Fichiers trop volumineux pour être traités |
| `files_with_error`    | INTEGER | Fichiers avec erreurs |
| `added_symlinks`      | INTEGER | Liens symboliques ajoutés |
| `modified_symlinks`   | INTEGER | Liens symboliques modifiés |
| `deleted_symlinks`    | INTEGER | Liens symboliques supprimés |

#### Champs de Taille des fichiers {#file-size-fields}

| Field                    | Type    | Description                          |
|--------------------------|---------|--------------------------------------|
| `size_of_examined_files` | INTEGER | Taille des fichiers examinés lors de la sauvegarde |
| `size_of_opened_files`   | INTEGER | Taille des fichiers ouverts pour la sauvegarde      |
| `size_of_added_files`    | INTEGER | Taille des nouveaux fichiers ajoutés à la sauvegarde    |
| `size_of_modified_files` | INTEGER | Taille des fichiers modifiés dans la sauvegarde     |

#### Champs de Statut d'Opération {#operation-status-fields}

| Champ                    | Type              | Description                    |
|--------------------------|-------------------|--------------------------------|
| `parsed_result`          | TEXT NOT NULL     | Résultat de l'opération analysé |
| `main_operation`         | TEXT NOT NULL     | Type d'opération principal     |
| `interrupted`            | BOOLEAN           | Indique si la sauvegarde a été interrompue |
| `partial_backup`         | BOOLEAN           | Indique si la sauvegarde a été partielle |
| `dryrun`                 | BOOLEAN           | Indique si la sauvegarde a été un essai à blanc |
| `version`                | TEXT              | Version de Duplicati utilisée  |
| `begin_time`             | DATETIME NOT NULL | Heure de début de la sauvegarde |
| `end_time`               | DATETIME NOT NULL | Heure de fin de la sauvegarde |
| `warnings_actual_length` | INTEGER           | Nombre réel d'avertissements |
| `errors_actual_length`   | INTEGER           | Nombre réel d'erreurs |
| `messages_actual_length` | INTEGER           | Nombre réel de messages |

#### Champs de Statistiques Backend {#backend-statistics-fields}

| Champ                            | Type     | Description                       |
|----------------------------------|----------|-----------------------------------|
| `bytes_downloaded`               | INTEGER  | Octets téléchargés de la destination |
| `known_file_size`                | INTEGER  | Taille des fichiers connue sur la destination |
| `last_backup_date`               | DATETIME | Date de la dernière sauvegarde sur la destination |
| `backup_list_count`              | INTEGER  | Nombre de versions de sauvegarde |
| `reported_quota_error`           | BOOLEAN  | Erreur de quota signalée |
| `reported_quota_warning`         | BOOLEAN  | Avertissement de quota signalé |
| `backend_main_operation`         | TEXT     | Opération principale du backend |
| `backend_parsed_result`          | TEXT     | Résultat analysé du backend |
| `backend_interrupted`            | BOOLEAN  | Opération du backend interrompue |
| `backend_version`                | TEXT     | Version du backend |
| `backend_begin_time`             | DATETIME | Heure de début de l'opération du backend |
| `backend_duration`               | TEXT     | Durée de l'opération du backend |
| `backend_warnings_actual_length` | INTEGER  | Nombre d'avertissements du backend |
| `backend_errors_actual_length`   | INTEGER  | Nombre d'erreurs du backend |

### Tableau des configurations {#configurations-table}

Stocke les paramètres de configuration de l'application.

#### Champs {#fields}

| Champ  | Type                      | Description                |
|--------|---------------------------|----------------------------|
| `key`  | TEXT PRIMARY KEY NOT NULL | Clé de configuration       |
| `value`| TEXT                      | Valeur de configuration (JSON) |

#### Clés de Configuration Communes {#common-configuration-keys}

- `email_config`: Paramètres de notification par e-mail
- `ntfy_config`: Paramètres de notification NTFY
- `overdue_tolerance`: Paramètres de tolérance de sauvegarde en retard
- `notification_templates`: Modèles de message de notification
- `audit_retention_days`: Période de rétention du journal d'audit (par défaut : 90 jours)

### Tableau des versions de base de données {#database-version-table}

Suit la version du schéma de base de données à des fins de migration.

#### Champs {#fields}

| Champ       | Type             | Description                           |
|------------|------------------|---------------------------------------|
| `version`  | TEXT PRIMARY KEY | Version de la base de données         |
| `applied_at` | DATETIME       | Quand la migration a été appliquée    |

### Tableau Utilisateurs {#users-table}

Stocke les informations de compte utilisateur pour l'authentification et le contrôle d'accès.

#### Champs {#fields}

| Champ                   | Type                 | Description                         |
|-------------------------|----------------------|-------------------------------------|
| `id`                    | TEXT PRIMARY KEY     | Identifiant utilisateur unique      |
| `username`              | TEXT UNIQUE NOT NULL | Nom d'utilisateur pour la connexion |
| `password_hash`         | TEXT NOT NULL        | Mot de passe haché avec Bcrypt      |
| `is_admin`              | BOOLEAN NOT NULL     | Si l'utilisateur a les privilèges admin |
| `must_change_password`  | BOOLEAN              | Si le changement de mot de passe est requis |
| `created_at`            | DATETIME             | Horodatage de création du compte    |
| `updated_at`            | DATETIME             | Horodatage de dernière mise à jour  |
| `last_login_at`         | DATETIME             | Horodatage de dernière connexion réussie |
| `last_login_ip`         | TEXT                 | Adresse IP de la dernière connexion |
| `failed_login_attempts` | INTEGER              | Nombre de tentatives de connexion échouées |
| `locked_until`          | DATETIME             | Expiration du verrouillage du compte (si verrouillé) |

### Tableau Sessions {#sessions-table}

Stocke les données de session utilisateur pour l'authentification et la sécurité.

#### Champs {#fields}

| Champ            | Type              | Description                                                      |
|------------------|-------------------|------------------------------------------------------------------|
| `id`             | TEXT PRIMARY KEY  | Identifiant de session                                           |
| `user_id`        | TEXT              | Référence à la table utilisateurs (nullable pour les sessions non authentifiées) |
| `created_at`     | DATETIME          | Horodatage de création de session                                |
| `last_accessed`  | DATETIME          | Horodatage du Dernière accès                                     |
| `expires_at`     | DATETIME NOT NULL | Horodatage d'expiration de session                               |
| `ip_address`     | TEXT              | Adresse IP d'origine de la session                               |
| `user_agent`     | TEXT              | Chaîne Agent utilisateur                                         |
| `csrf_token`     | TEXT              | Jeton CSRF pour la session                                       |
| `csrf_expires_at`| DATETIME          | Expiration du jeton CSRF                                         |

### Journal d'Audit {#audit-log-table}

Stocke la piste d'audit des actions des utilisateurs et des événements système.

#### Champs {#fields}

| Champ          | Type                              | Description                                                       |
|----------------|-----------------------------------|-------------------------------------------------------------------|
| `id`           | INTEGER PRIMARY KEY AUTOINCREMENT | Identifiant unique de l'entrée du journal d'audit                 |
| `timestamp`    | DATETIME                          | Horodatage de l'événement                                         |
| `user_id`      | TEXT                              | Référence à la table Utilisateurs (nullable)                      |
| `username`     | TEXT                              | Nom d'utilisateur au moment de l'action                           |
| `action`       | TEXT NOT NULL                     | Action effectuée                                                  |
| `category`     | TEXT NOT NULL                     | Catégorie de l'action (par ex. « authentication », « Paramètres », « sauvegarde ») |
| `target_type`  | TEXT                              | Type de cible (par ex. « Serveur », « sauvegarde », « Utilisateur ») |
| `target_id`    | TEXT                              | Identifiant de la cible                                           |
| `details`      | TEXT                              | Détails supplémentaires (JSON)                                    |
| `ip_address`   | TEXT                              | Adresse IP du demandeur                                           |
| `user_agent`   | TEXT                              | Chaîne Agent utilisateur                                          |
| `status`       | TEXT NOT NULL                     | Statut de l'action (« Succès », « Échec », « Erreur »)            |
| `error_message`| TEXT                              | Message d'erreur si l'action a échoué                             |

## Gestion des sessions {#session-management}

### Stockage de session sauvegardé par base de données {#database-backed-session-storage}

Les sessions sont stockées dans la base de données avec secours en mémoire :
- **Stockage Principal** : Table de sessions sauvegardée en base de données
- **Secours** : Stockage en mémoire (support hérité ou cas d'erreur)
- **ID de Session** : Chaîne aléatoire cryptographiquement sécurisée
- **Expiration** : Délai dépassé de session configurable
- **Protection CSRF** : Protection contre les attaques par falsification de requête intersite
- **Nettoyage Automatique** : Les sessions expirées sont automatiquement supprimées

### Points de terminaison de l'API de session {#session-api-endpoints}

- `POST /api/session` : Créer une nouvelle session
- `GET /api/session` : Valider une session existante
- `DELETE /api/session` : Détruire la session
- `GET /api/csrf` : Obtenir le jeton CSRF

## Index {#indexes}

La base de données comprend plusieurs index pour des performances de requête optimales :

- **Clés primaires** : Tous les tableaux ont des index de clé primaire
- **Clés étrangères** : Références de Serveur dans la table sauvegardes, références d'Utilisateur dans sessions et audit_log
- **Optimisation des requêtes** : Index sur les champs fréquemment interrogés
- **Index de Date** : Index sur les champs de date pour les requêtes basées sur le temps
- **Index d'Utilisateur** : Index de nom d'utilisateur pour les recherches rapides d'utilisateurs
- **Index de Session** : Index d'expiration et user_id pour la gestion des sessions
- **Index d'audit** : Index d'horodatage, user_id, action, catégorie et statut pour les requêtes d'audit

## Relations {#relationships}

- **Serveurs → Sauvegardes** : Relation un-à-plusieurs
- **Utilisateurs → Sessions** : Relation un-à-plusieurs (les sessions peuvent exister sans utilisateurs)
- **Utilisateurs → Journal d'Audit** : Relation un-à-plusieurs (les entrées d'audit peuvent exister sans utilisateurs)
- **Sauvegardes → Messages** : Tableaux JSON intégrés
- **Configurations** : Stockage clé-valeur

## Types de données {#data-types}

- **TEXT** : Données de chaîne de caractères, tableaux JSON
- **INTEGER** : Données numériques, nombre de fichiers, tailles
- **REAL** : Nombres à virgule flottante, durées
- **DATETIME** : Données d'horodatage
- **BOOLEAN** : Valeurs vrai/faux

## Valeurs de Statut de Sauvegarde {#backup-status-values}

- **Succès** : Sauvegarde terminée avec succès
- **Avertissement** : Sauvegarde terminée avec avertissements
- **Erreur** : Sauvegarde terminée avec erreurs
- **Fatal** : Sauvegarde échouée fatalement

## Requêtes courantes {#common-queries}

### Obtenir la dernière sauvegarde pour un serveur {#get-latest-backup-for-a-server}

```sql
SELECT * FROM backups 
WHERE server_id = ? 
ORDER BY date DESC 
LIMIT 1;
```

### Obtenir toutes les sauvegardes pour un serveur {#get-all-backups-for-a-server}

```sql
SELECT * FROM backups 
WHERE server_id = ? 
ORDER BY date DESC;
```

### Obtenir le résumé du serveur {#get-server-summary}

```sql
SELECT 
  s.name,
  s.alias,
  COUNT(b.id) as backup_count,
  MAX(b.date) as last_backup,
  b.status as last_status
FROM servers s
LEFT JOIN backups b ON s.id = b.server_id
GROUP BY s.id;
```

### Obtenir le Résumé Général {#get-overall-summary}

```sql
SELECT 
  COUNT(DISTINCT s.id) as total_servers,
  COUNT(b.id) as total_backups_runs,
  COUNT(DISTINCT s.id || ':' || b.backup_name) as total_backups,
  COALESCE(SUM(b.uploaded_size), 0) as total_uploaded_size,
  (
    SELECT COALESCE(SUM(b2.known_file_size), 0)
    FROM backups b2
    INNER JOIN (
      SELECT server_id, MAX(date) as max_date
      FROM backups
      GROUP BY server_id
    ) latest ON b2.server_id = latest.server_id AND b2.date = latest.max_date
  ) as total_storage_used,
  (
    SELECT COALESCE(SUM(b2.size_of_examined_files), 0)
    FROM backups b2
    INNER JOIN (
      SELECT server_id, MAX(date) as max_date
      FROM backups
      GROUP BY server_id
    ) latest ON b2.server_id = latest.server_id AND b2.date = latest.max_date
  ) as total_backuped_size
FROM servers s
LEFT JOIN backups b ON b.server_id = s.id;
```

### Nettoyage de la base de données {#database-cleanup}

```sql
-- Delete old backups (older than 30 days)
DELETE FROM backups 
WHERE date < datetime('now', '-30 days');

-- Delete servers with no backups
DELETE FROM servers 
WHERE id NOT IN (SELECT DISTINCT server_id FROM backups);
```

## Mappage JSON vers base de données {#json-to-database-mapping}

### Mappage du corps de la requête API aux colonnes de la base de données {#api-request-body-to-database-columns-mapping}

Quand Duplicati envoie les données de sauvegarde via HTTP POST, la structure JSON est mappée aux colonnes de la base de données :

```json
{
  "Data": {
    "ExaminedFiles": 15399,           // → examined_files
    "OpenedFiles": 1861,              // → opened_files
    "AddedFiles": 1861,               // → added_files
    "SizeOfExaminedFiles": 11086692615, // → size_of_examined_files
    "SizeOfOpenedFiles": 13450481,    // → size_of_opened_files
    "SizeOfAddedFiles": 13450481,     // → size_of_added_files
    "SizeOfModifiedFiles": 0,         // → size_of_modified_files
    "ParsedResult": "Success",        // → status
    "BeginTime": "2025-04-21T23:45:46.9712217Z", // → begin_time and date
    "Duration": "00:00:51.3856057",   // → duration_seconds (calculated)
    "WarningsActualLength": 0,        // → warnings_actual_length
    "ErrorsActualLength": 0           // → errors_actual_length
  },
  "Extra": {
    "machine-id": "66f5ffc7ff474a73a3c9cba4ac7bfb65", // → server_id
    "machine-name": "WSJ-SER5",       // → server name
    "backup-name": "WSJ-SER5 Local files", // → backup_name
    "backup-id": "DB-2"               // → backup_id
  }
}
```

**Note** : Le champ `size` dans la table des sauvegardes stocke `SizeOfExaminedFiles` et `uploaded_size` stocke la taille réelle téléversée/transférée à partir de l'opération de sauvegarde.
