# Schéma de la base de données {/* #database-schema */}

Ce document décrit le schéma de la base de données SQLite utilisé par duplistatus pour stocker les données des opérations de sauvegarde.

## Emplacement de la base de données {/* #database-location */}

La base de données est stockée dans le répertoire des données de l'application :
- **Emplacement par défaut** : `/app/data/backups.db`
- **Volume Docker** : `duplistatus_data:/app/data`
- **Nom du fichier** : `backups.db`

## Système de migration de la base de données {/* #database-migration-system */}

duplistatus utilise un système de migration automatique pour gérer les changements de schéma de la base de données entre les versions.

### Historique des versions de migration {/* #migration-version-history */}

Les versions de migration historiques suivantes ont permis d'amener la base de données à son état actuel :

- **Schéma v1.0** (Application v0.6.x et antérieures) : Schéma de base de données initial avec les tables machines et sauvegardes
- **Schéma v2.0** (Application v0.7.x) : Ajout de colonnes manquantes et de la table configurations
- **Schéma v3.0** (Application v0.7.x) : Renommage de la table machines en serveurs, ajout de la colonne server_url
- **Schéma v3.1** (Application v0.8.x) : Amélioration des champs de données de sauvegarde, ajout de la colonne server_password
- **Schéma v4.0** (Application v0.9.x / v1.0.x) : Ajouté le contrôle d'accès utilisateur (tables utilisateurs, sessions, audit_log)
- **Schéma v4.1** (Application v1.5.x) : Ajouté `api_keys` et clés de configuration par défaut pour l'authentification par clé API optionnelle, les listes d'adresses IP autorisées et les limites de téléchargement
- **Schéma v4.2** (Application v1.5.x) : Ajouté `daily_summary_deliveries` ledger et configuration par défaut `daily_summary` pour les notifications de résumé quotidien optionnelles

La version actuelle de l'application (v1.5.x) utilise le **Schéma v4.2** comme version de schéma de base de données la plus récente.

### Processus de migration {/* #migration-process */}

1. **Sauvegarde automatique** : Crée une sauvegarde avant la migration
2. **Mise à jour du schéma** : Met à jour la structure de la base de données
3. **Migration des données** : Préserve les données existantes
4. **Vérification** : Confirme la réussite de la migration

## Tables {/* #tables */}

### Table des serveurs {/* #servers-table */}

Stocke les informations sur les serveurs Duplicati surveillés.

#### Champs {/* #fields */}

| Champ             | Type             | Description                        |
|-------------------|------------------|------------------------------------|
| `id`              | TEXT PRIMARY KEY | Identifiant unique du serveur           |
| `name`            | TEXT NOT NULL    | Nom du serveur depuis Duplicati         |
| `server_url`      | TEXT             | URL du serveur Duplicati               |
| `alias`           | TEXT             | Nom convivial défini par l'utilisateur         |
| `note`            | TEXT             | Notes/description définies par l'utilisateur     |
| `server_password` | TEXT             | Mot de passe du serveur pour l'authentification |
| `created_at`      | DATETIME         | Horodatage de création du serveur          |

### Table des sauvegardes {/* #backups-table */}

Stocke les données d'opération de sauvegarde reçues des serveurs Duplicati.

#### Champs clés {/* #key-fields */}

| Champ              | Type              | Description                                    |
|--------------------|-------------------|------------------------------------------------|
| `id`               | TEXT PRIMARY KEY  | Identifiant unique de sauvegarde                       |
| `server_id`        | TEXT NOT NULL     | Référence à la table des serveurs                     |
| `backup_name`      | TEXT NOT NULL     | Nom du travail de sauvegarde                                |
| `backup_id`        | TEXT NOT NULL     | ID de sauvegarde de Duplicati                       |
| `date`             | DATETIME NOT NULL | Heure d'exécution de la sauvegarde                          |
| `status`           | TEXT NOT NULL     | Statut de la sauvegarde (Succès, Avertissement, Erreur, Fatal) |
| `duration_seconds` | INTEGER NOT NULL  | Durée en secondes                            |
| `size`             | INTEGER           | Taille des fichiers source                           |
| `uploaded_size`    | INTEGER           | Taille des données téléchargées                          |
| `examined_files`   | INTEGER           | Nombre de fichiers examinés                       |
| `warnings`         | INTEGER           | Nombre d'avertissements                             |
| `errors`           | INTEGER           | Nombre d'erreurs                               |
| `created_at`       | DATETIME          | Horodatage de création de l'enregistrement                      |

#### Tableaux de messages (stockage JSON) {/* #message-arrays-json-storage */}

| Champ               | Type | Description                             |
|---------------------|------|-----------------------------------------|
| `messages_array`    | TEXT | Tableau JSON de messages de journalisation              |
| `warnings_array`    | TEXT | Tableau JSON de messages d'avertissement          |
| `errors_array`      | TEXT | Tableau JSON de messages d'erreur            |
| `available_backups` | TEXT | Tableau JSON des versions de sauvegarde disponibles |

#### Champs d'opération de fichiers {/* #file-operation-fields */}

| Champ                 | Type    | Description                  |
|-----------------------|---------|------------------------------|
| `examined_files`      | INTEGER | Fichiers examinés pendant la sauvegarde |
| `opened_files`        | INTEGER | Fichiers ouverts pour la sauvegarde      |
| `added_files`         | INTEGER | Nouveaux fichiers ajoutés à la sauvegarde    |
| `modified_files`      | INTEGER | Fichiers modifiés dans la sauvegarde     |
| `deleted_files`       | INTEGER | Fichiers supprimés de la sauvegarde    |
| `deleted_folders`     | INTEGER | Dossiers supprimés de la sauvegarde  |
| `added_folders`       | INTEGER | Dossiers ajoutés à la sauvegarde      |
| `modified_folders`    | INTEGER | Dossiers modifiés dans la sauvegarde   |
| `not_processed_files` | INTEGER | Fichiers non traités          |
| `too_large_files`     | INTEGER | Fichiers trop volumineux à traiter   |
| `files_with_error`    | INTEGER | Fichiers avec erreurs            |
| `added_symlinks`      | INTEGER | Liens symboliques ajoutés         |
| `modified_symlinks`   | INTEGER | Liens symboliques modifiés      |
| `deleted_symlinks`    | INTEGER | Liens symboliques supprimés       |

#### Champs de taille de fichier {/* #file-size-fields */}

| Champ                    | Type    | Description                          |
|--------------------------|---------|--------------------------------------|
| `size_of_examined_files` | INTEGER | Taille des fichiers examinés lors de la sauvegarde |
| `size_of_opened_files`   | INTEGER | Taille des fichiers ouverts pour la sauvegarde      |
| `size_of_added_files`    | INTEGER | Taille des nouveaux fichiers ajoutés à la sauvegarde    |
| `size_of_modified_files` | INTEGER | Taille des fichiers modifiés dans la sauvegarde     |

#### Champs d'état d'opération {/* #operation-status-fields */}

| Champ                    | Type              | Description                    |
|--------------------------|-------------------|--------------------------------|
| `parsed_result`          | TEXT NOT NULL     | Résultat de l'opération analysé        |
| `main_operation`         | TEXT NOT NULL     | Type principal d'opération            |
| `interrupted`            | BOOLEAN           | Si la sauvegarde a été interrompue |
| `partial_backup`         | BOOLEAN           | Si la sauvegarde a été partielle     |
| `dryrun`                 | BOOLEAN           | Si la sauvegarde était un essai sec   |
| `version`                | TEXT              | Version de Duplicati utilisée         |
| `begin_time`             | DATETIME NOT NULL | Heure de début de la sauvegarde              |
| `end_time`               | DATETIME NOT NULL | Heure de fin de la sauvegarde                |
| `warnings_actual_length` | INTEGER           | Nombre réel d'avertissements          |
| `errors_actual_length`   | INTEGER           | Nombre réel d'erreurs            |
| `messages_actual_length` | INTEGER           | Nombre réel de messages          |

#### Champs de statistiques de l'arrière-plan {/* #backend-statistics-fields */}

| Champ                            | Type     | Description                       |
|----------------------------------|----------|-----------------------------------|
| `bytes_downloaded`               | INTEGER  | Octets téléchargés depuis la destination |
| `known_file_size`                | INTEGER  | Taille de fichier connue sur la destination    |
| `last_backup_date`               | DATETIME | Date de dernière sauvegarde sur la destination   |
| `backup_list_count`              | INTEGER  | Nombre de versions de sauvegarde         |
| `reported_quota_error`           | BOOLEAN  | Erreur de quota signalée              |
| `reported_quota_warning`         | BOOLEAN  | Avertissement de quota signalé            |
| `backend_main_operation`         | TEXT     | Opération principale du backend            |
| `backend_parsed_result`          | TEXT     | Résultat analysé du backend             |
| `backend_interrupted`            | BOOLEAN  | Opération du backend interrompue     |
| `backend_version`                | TEXT     | Version du backend                   |
| `backend_begin_time`             | DATETIME | Heure de début de l'opération du backend      |
| `backend_duration`               | TEXT     | Durée de l'opération du backend        |
| `backend_warnings_actual_length` | INTEGER  | Nombre d'avertissements du backend            |
| `backend_errors_actual_length`   | INTEGER  | Nombre d'erreurs du backend              |

### Tableau des configurations {/* #configurations-table */}

Stocke les paramètres de configuration de l'application.

#### Champs {/* #fields-1 */}

| Champ   | Type                      | Description                |
|---------|---------------------------|----------------------------|
| `key`   | TEXT PRIMARY KEY NOT NULL | Clé de configuration          |
| `value` | TEXT                      | Valeur de configuration (JSON) |

#### Clés de configuration courantes {/* #common-configuration-keys */}

- `email_config`: Paramètres de notification par e-mail
- `ntfy_config`: Paramètres de notification NTFY
- `overdue_tolerance`: Paramètres de tolérance pour les sauvegardes en retard
- `notification_templates`: Modèles de messages de notification
- `daily_summary`: Mode Résumé quotidien, horaire, fuseau horaire, URL de tableau de bord public facultatif, et destinataire SMTP facultatif (`smtpRecipient`; vide utilise les paramètres de messagerie)
- `cron_service`: Horaires des tâches Cron, y compris `daily-summary-dispatch` (`minute hour * * *` de `daily_summary.utcTime`)
- `audit_retention_days`: Période de conservation des journaux d'audit (par défaut : 90 jours)

### Tableau de version de la base de données {/* #database-version-table */}

Suivi de la version du schéma de la base de données pour les migrations.

#### Champs {/* #fields-2 */}

| Champ        | Type             | Description                |
|--------------|------------------|----------------------------|
| `version`    | TEXT PRIMARY KEY | Version de la base de données           |
| `applied_at` | DATETIME         | Quand la migration a été appliquée |

### Tableau des utilisateurs {/* #users-table */}

Stocke les informations de compte utilisateur pour l'authentification et le contrôle d'accès.

#### Champs {/* #fields-3 */}

| Champ                   | Type                 | Description                         |
|-------------------------|----------------------|-------------------------------------|
| `id`                    | TEXT PRIMARY KEY     | Identifiant unique de l'utilisateur              |
| `username`              | TEXT UNIQUE NOT NULL | Nom d'utilisateur pour la connexion                  |
| `password_hash`         | TEXT NOT NULL        | Mot de passe haché avec Bcrypt              |
| `is_admin`              | BOOLEAN NOT NULL     | Si l'utilisateur a des privilèges d'administrateur   |
| `must_change_password`  | BOOLEAN              | Si un changement de mot de passe est requis |
| `created_at`            | DATETIME             | Horodatage de création du compte          |
| `updated_at`       | DATETIME         | Horodatage de la dernière mise à jour                                                       |
| `last_login_at`         | DATETIME             | Horodatage de la dernière connexion réussie     |
| `last_login_ip`         | TEXT                 | Adresse IP de la dernière connexion            |
| `failed_login_attempts` | INTEGER              | Nombre de tentatives de connexion échouées      |
| `locked_until`          | DATETIME             | Expiration du verrouillage du compte (si verrouillé) |

### Tableau des sessions {/* #sessions-table */}

Stocke les données de session utilisateur pour l'authentification et la sécurité.

#### Champs {/* #fields-4 */}

| Champ             | Type              | Description                                                      |
|-------------------|-------------------|------------------------------------------------------------------|
| `id`              | TEXT PRIMARY KEY  | Identifiant de session                                               |
| `user_id`         | TEXT              | Référence à la table des utilisateurs (nullable pour les sessions non authentifiées) |
| `created_at`      | DATETIME          | Horodatage de création de la session                                       |
| `last_accessed`   | DATETIME          | Horodatage du dernier accès                                            |
| `expires_at`      | DATETIME NOT NULL | Horodatage d'expiration de la session                                     |
| `ip_address`      | TEXT              | Adresse IP de l'origine de la session                                     |
| `user_agent`    | TEXT                              | Chaîne de l'agent utilisateur                                                 |
| `csrf_token`      | TEXT              | Jeton CSRF pour la session                                       |
| `csrf_expires_at` | DATETIME          | Expiration du jeton CSRF                                            |

### Tableau du journal d'audit {/* #audit-log-table */}

Stocke l'historique des actions utilisateur et des événements système.

#### Champs {/* #fields-5 */}

| Champ           | Type                              | Description                                                       |
|-----------------|-----------------------------------|-------------------------------------------------------------------|
| `id`            | INTEGER PRIMARY KEY AUTOINCREMENT | Identifiant unique de l'entrée du journal d'audit                                 |
| `timestamp`     | DATETIME                          | Horodatage de l'événement                                                   |
| `user_id`       | TEXT                              | Référence à la table des utilisateurs (nullable)                               |
| `username`      | TEXT                              | Nom d'utilisateur au moment de l'action                                        |
| `action`        | TEXT NOT NULL                     | Action effectuée                                                  |
| `category`      | TEXT NOT NULL                     | Catégorie de l'action (par exemple, 'authentification', 'paramètres', 'sauvegarde') |
| `target_type`   | TEXT                              | Type de cible (par exemple, 'serveur', 'sauvegarde', 'utilisateur')                 |
| `target_id`     | TEXT                              | Identifiant de la cible                                              |
| `details`       | TEXT                              | Détails supplémentaires (JSON)                                         |
| `ip_address`    | TEXT                              | Adresse IP du demandeur                                           |
| `user_agent`    | TEXT                              | Chaîne de l'agent utilisateur                                                 |
| `status`        | TEXT NOT NULL                     | Statut de l'action ('succès', 'échec', 'erreur')                  |
| `error_message` | TEXT                              | Message d'erreur si l'action a échoué                                    |

### Tableau des clés API {/* #api-keys-table */}

Stocke les clés API hachées pour les API HTTP externes. Le secret en texte brut est affiché une seule fois à la création et n'est jamais stocké.

#### Champs {/* #fields-6 */}

| Champ          | Type             | Description                                              |
|----------------|------------------|----------------------------------------------------------|
| `id`           | TEXT PRIMARY KEY | Identifiant unique de la clé                                    |
| `name`         | TEXT NOT NULL    | Nom d'affichage                                             |
| `key_hash`     | TEXT UNIQUE      | Hachage SHA-256 du secret                               |
| `key_prefix`   | TEXT             | Premiers quatre caractères du secret (pour les empreintes digitales)   |
| `key_suffix`   | TEXT             | Derniers quatre caractères du secret (pour les empreintes digitales)    |
| `scope`        | TEXT NOT NULL    | `upload` ou `read`                                       |
| `description`  | TEXT             | Description optionnelle                                     |
| `enabled`      | INTEGER          | `1` quand la clé est active                               |
| `created_at`   | DATETIME         | Horodatage de création                                       |
| `created_by`   | TEXT             | Identifiant de l'utilisateur administrateur qui a créé la clé         |
| `expires_at`   | DATETIME         | Expiration optionnelle                                      |
| `last_used_at` | DATETIME         | Dernière utilisation réussie                                   |
| `usage_count`  | INTEGER          | Nombre d'utilisations réussies                                |

Clés de configuration associées dans la table `configurations` : `external_api_require_api_key`, `ip_trusted_proxies`, `admin_ip_allowlist`, `external_api_ip_allowlist`, `upload_limits`.

### Table des livraisons de résumés quotidiens {/* #daily-summary-deliveries-table */}

Registre par chaîne pour la livraison des e-mails de résumé quotidien. Les lignes héritées peuvent inclure une chaîne `ntfy` d'anciennes versions. Chaque occurrence planifiée (ou envoi manuel unique) a au plus une ligne par chaîne. Les charges utiles rendues sont stockées avant l'envoi afin que les tentatives de réessai gardent la même capture instantanée. Les lignes plus anciennes de 30 jours sont supprimées.

Si le processus s'arrête après qu'un fournisseur ait accepté un message mais avant que le succès ne soit enregistré, cette chaîne peut être réessayée (au moins une fois).

#### Champs {/* #fields-7 */}

| Champ              | Type             | Description                                                                 |
|--------------------|------------------|-----------------------------------------------------------------------------|
| `id`               | TEXT PRIMARY KEY | Identifiant de livraison unique                                               |
| `occurrence_key`   | TEXT NOT NULL    | Clé planifiée `scheduled:UTC:{date}:{HH:mm}` ou `manual:{uuid}`             |
| `channel`          | TEXT NOT NULL    | `email` ou `ntfy`                                                           |
| `trigger`          | TEXT NOT NULL    | `scheduled`, `manual`, ou `retry`                                           |
| `summary_date`     | TEXT NOT NULL    | Date du calendrier local pour la capture instantanée                     |
| `time_zone`        | TEXT NOT NULL    | Fuseau horaire IANA enregistré                                               |
| `payload_json`     | TEXT             | Sujet rendu, HTML, texte et champs NTFY                                  |
| `state`            | TEXT NOT NULL    | `pending`, `sending`, `sent`, ou `failed`                                   |
| `attempt_count`    | INTEGER          | Tentatives de livraison                                                    |
| `next_retry_at`    | DATETIME         | Quand une chaîne en échec peut être réclamée à nouveau                     |
| `lease_expires_at` | DATETIME         | Bail de réclamation ; un bail périmé peut être récupéré                     |
| `error`            | TEXT             | Dernière erreur, le cas échéant                                           |
| `created_at`       | DATETIME         | Horodatage de création de la ligne                                                      |
| `updated_at`       | DATETIME         | Horodatage de la dernière mise à jour                                                       |
| `sent_at`          | DATETIME         | Horodatage de succès                                                           |

Un index unique sur `(occurrence_key, channel)` empêche les envois en double de la même occurrence sur la même chaîne.

## Gestion des sessions {/* #session-management */}

### Stockage des sessions avec sauvegarde dans la base de données {/* #database-backed-session-storage */}

Les sessions sont stockées dans la base de données avec un secours en mémoire :
- **Stockage principal** : Table des sessions sauvegardées dans la base de données
- **Secours** : Stockage en mémoire (support legacy ou cas d'erreur)
- **ID de session** : Chaîne aléatoire cryptographiquement sécurisée
- **Expiration** : Délai d'expiration de session configurable
- **Protection CSRF** : Protection contre la falsification de requêtes intersites
- **Nettoyage automatique** : Les sessions expirées sont automatiquement supprimées

### Points de terminaison de l'API de session {/* #session-api-endpoints */}

- `POST /api/session` : Créer une nouvelle session
- `GET /api/session` : Valider une session existante
- `DELETE /api/session` : Détruire une session
- `GET /api/csrf` : Obtenir un jeton CSRF

## Indexes {/* #indexes */}

La base de données comprend plusieurs index pour une performance de requête optimale :

- **Clés primaires** : Tous les tableaux ont des index de clés primaires
- **Clés étrangères** : Références de serveur dans la table de sauvegardes, références d'utilisateur dans les sessions et le journal d'audit
- **Optimisation des requêtes** : Index sur les champs fréquemment interrogés
- **Index de date** : Index sur les champs de date pour les requêtes basées sur le temps
- **Index d'utilisateur** : Index de nom d'utilisateur pour des recherches d'utilisateur rapides
- **Index de session** : Index d'expiration et user_id pour la gestion des sessions
- **Index d'audit** : Index de timestamp, user_id, action, catégorie et statut pour les requêtes d'audit
- **Index de clé API** : Hachage unique, ainsi que les recherches activé/portée pour l'authentification

## Relations {/* #relationships */}

- **Serveurs → Sauvegardes** : Relation un-à-plusieurs
- **Utilisateurs → Sessions** : Relation un-à-plusieurs (les sessions peuvent exister sans utilisateurs)
- **Utilisateurs → Journal d'audit** : Relation un-à-plusieurs (les entrées d'audit peuvent exister sans utilisateurs)
- **Utilisateurs → Clés API** : Relation un-à-plusieurs via `created_by` (les clés restent après la suppression de l'utilisateur)
- **Sauvegardes → Messages** : Tableaux JSON intégrés
- **Configurations** : Stockage clé-valeur

## Types de données {/* #data-types */}

- **TEXT** : Données de chaîne, tableaux JSON
- **INTEGER** : Données numériques, nombre de fichiers, tailles
- **REAL** : Nombres à virgule flottante, durées
- **DATETIME** : Données de timestamp
- **BOOLEAN** : Valeurs vrai/faux

## Valeurs d'état de sauvegarde {/* #backup-status-values */}

- **Succès** : Sauvegarde terminée avec succès
- **Avertissement** : Sauvegarde terminée avec des avertissements
- **Erreur** : Sauvegarde terminée avec des erreurs
- **Fatal** : Échec de la sauvegarde

## Requêtes courantes {/* #common-queries */}

### Obtenir la dernière sauvegarde d'un serveur {/* #get-latest-backup-for-a-server */}

```sql
SELECT * FROM backups 
WHERE server_id = ? 
ORDER BY date DESC 
LIMIT 1;
```

### Obtenir toutes les sauvegardes d'un serveur {/* #get-all-backups-for-a-server */}

```sql
SELECT * FROM backups 
WHERE server_id = ? 
ORDER BY date DESC;
```

### Obtenir le résumé du serveur {/* #get-server-summary */}

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

### Obtenir le résumé global {/* #get-overall-summary */}

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

### Nettoyage de la base de données {/* #database-cleanup */}

```sql
-- Delete old backups (older than 30 days)
DELETE FROM backups 
WHERE date < datetime('now', '-30 days');

-- Delete servers with no backups
DELETE FROM servers 
WHERE id NOT IN (SELECT DISTINCT server_id FROM backups);
```

## Mappage JSON à la base de données {/* #json-to-database-mapping */}

### Mappage des colonnes de la base de données aux champs du corps de la requête API {/* #api-request-body-to-database-columns-mapping */}

Quand Duplicati envoie des données de sauvegarde via HTTP POST, la structure JSON est mappée aux colonnes de la base de données :

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

**Note** : Le champ `size` dans la table des sauvegardes stocke `SizeOfExaminedFiles` et `uploaded_size` stocke la taille réelle téléchargée/transférée de l'opération de sauvegarde.
