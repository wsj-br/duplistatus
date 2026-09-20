# Guide de migration {/* #migration-guide */}

Ce guide explique comment mettre à niveau duplistatus entre les versions. Les migrations sont automatiques : le schéma de la base de données se met à jour automatiquement au démarrage d'une nouvelle version.

Les étapes manuelles ne sont requises que si vous avez personnalisé les modèles de notification (la version 0.8.x a modifié les variables de modèle) ou les intégrations d'API externes qui nécessitent une mise à jour (la version 0.7.x a modifié les noms de champs API, la version 0.9.x nécessite une authentification).

## Aperçu {/* #overview */}

duplistatus migre automatiquement votre schéma de base de données lors de la mise à niveau. Le système :

1. Crée une sauvegarde de votre base de données avant d'apporter des modifications
2. Met à jour le schéma de la base de données vers la dernière version
3. Préserve toutes les données existantes (serveurs, sauvegardes, configuration)
4. Vérifie que la migration s'est déroulée correctement

## Sauvegarde de votre base de données avant la migration {/* #backing-up-your-database-before-migration */}

Avant de mettre à niveau vers une nouvelle version, il est recommandé de créer une sauvegarde de votre base de données. Cela vous permet de restaurer vos données en cas de problème lors du processus de migration.

### Si vous exécutez la version 1.2.1 ou ultérieure {/* #if-youre-running-version-121-or-later */}

Utilisez la fonction de sauvegarde de base de données intégrée :

1. Accédez à [Paramètres → Maintenance de la base de données](../user-guide/settings/database-maintenance.md) dans l'interface web
2. Dans la section **Sauvegarde de la base de données**, sélectionnez un format de sauvegarde :
   - **Fichier de base de données (.db)** : format binaire - sauvegarde la plus rapide, préserve exactement toute la structure de la base de données
   - **Dump SQL (.sql)** : format texte - instructions SQL lisibles par un humain
3. Cliquez sur **Télécharger la sauvegarde**
4. Le fichier de sauvegarde sera téléchargé sur votre ordinateur avec un nom de fichier horodaté

Pour plus de détails, consultez la documentation [Maintenance de la base de données](../user-guide/settings/database-maintenance.md#database-backup).

### Si vous exécutez une version antérieure à 1.2.1 {/* #if-youre-running-a-version-before-121 */}

#### Sauvegarde {/* #backup */}

Vous devez sauvegarder manuellement la base de données avant de continuer. Le fichier de base de données se trouve à `/app/data/backups.db` à l'intérieur du conteneur.

##### Pour les utilisateurs Linux {/* #for-linux-users */}
Si vous êtes sur Linux, ne vous inquiétez pas de mettre en place des conteneurs d'aide. Vous pouvez utiliser la commande native `cp` pour extraire la base de données directement du conteneur en cours d'exécution vers votre hôte.

###### Utilisation de Docker ou Podman : {/* #using-docker-or-podman */}

```bash
# Replace 'duplistatus' with your actual container name if different
docker cp duplistatus:/app/data/backups.db ./duplistatus-backup-$(date +%Y%m%d).db
```

(Si vous utilisez Podman, remplacez simplement `docker` par `podman` dans la commande ci-dessus.)

##### Pour les utilisateurs Windows {/* #for-windows-users */}
Si vous exécutez Docker Desktop sur Windows, vous avez deux façons simples de gérer cela sans utiliser la ligne de commande :

###### Option A : Utiliser Docker Desktop (Le plus simple) {/* #option-a-use-docker-desktop-easiest */}
1. Ouvrez le tableau de bord Docker Desktop.
2. Allez à l'onglet Conteneurs et cliquez sur votre conteneur duplistatus.
3. Cliquez sur l'onglet Fichiers.
4. Accédez à `/app/data/`.
5. Cliquez avec le bouton droit sur `backups.db` et sélectionnez **Enregistrer sous...** pour le télécharger dans vos dossiers Windows.

###### Option B : Utiliser PowerShell {/* #option-b-use-powershell */}
Si vous préférez le terminal, vous pouvez utiliser PowerShell pour copier le fichier sur votre Bureau :

```powershell
docker cp duplistatus:/app/data/backups.db $HOME\Desktop\duplistatus-backup.db
```

##### Si vous utilisez des montages de liaison {/* #if-you-use-bind-mounts */}
Si vous avez initialement configuré votre conteneur à l'aide d'un montage de liaison (par exemple, vous avez mappé un dossier local comme `/opt/duplistatus` au conteneur), vous n'avez pas besoin de commandes Docker du tout. Copiez simplement le fichier à l'aide de votre gestionnaire de fichiers :
- Linux : `cp /path/to/your/folder/backups.db ~/backups.db`
- Windows : Copiez simplement le fichier dans l'**Explorateur de fichiers** à partir du dossier que vous avez désigné lors de la configuration.

#### Restauration de vos données {/* #restoring-your-data */}
Si vous devez restaurer votre base de données à partir d'une sauvegarde précédente, suivez les étapes ci-dessous en fonction de votre système d'exploitation.

:::info[IMPORTANT] 
Arrêtez le conteneur avant de restaurer la base de données pour éviter la corruption des fichiers.
:::

##### Pour les utilisateurs Linux {/* #for-linux-users-1 */}
Le moyen le plus simple de restaurer est de « pousser » le fichier de sauvegarde dans le chemin de stockage interne du conteneur.

###### Utilisation de Docker ou Podman : {/* #using-docker-or-podman-1 */}

```bash
# stop the container
docker stop duplistatus

# Replace 'duplistatus-backup.db' with your actual backup filename
docker cp ./duplistatus-backup.db duplistatus:/app/data/backups.db

# Restart the container
docker start duplistatus
```

##### Pour les utilisateurs Windows {/* #for-windows-users-1 */}
Si vous utilisez Docker Desktop, vous pouvez effectuer la restauration via l'interface graphique ou PowerShell.

###### Option A : Utiliser Docker Desktop (interface graphique) {/* #option-a-use-docker-desktop-gui */}
1. Assurez-vous que le conteneur duplistatus est en cours d'exécution (Docker Desktop nécessite que le conteneur soit actif pour télécharger des fichiers via l'interface graphique).
2. Accédez à l'onglet Fichiers dans les paramètres de votre conteneur.
3. Accédez à `/app/data/`.
4. Cliquez avec le bouton droit sur le fichier backups.db existant et sélectionnez Supprimer.
5. Cliquez sur le bouton Importer (ou cliquez avec le bouton droit dans la zone du dossier) et sélectionnez votre fichier de sauvegarde sur votre ordinateur.

Renommez le fichier importé en exactement backups.db s'il a un horodatage dans le nom.

Redémarrez le conteneur.

###### Option B : Utiliser PowerShell {/* #option-b-use-powershell-1 */}

```powershell
# Copy the file from your Desktop back into the container
docker cp $HOME\Desktop\duplistatus-backup.db duplistatus:/app/data/backups.db

# Restart the container
docker start duplistatus
```

##### Si vous utilisez des montages de liaison {/* #if-you-use-bind-mounts-1 */}
Si vous utilisez un dossier local mappé au conteneur, vous n'avez besoin d'aucune commande spéciale.

1. Arrêtez le conteneur.
2. Copiez manuellement votre fichier de sauvegarde dans votre dossier mappé (par exemple, `/opt/duplistatus` ou `C:\duplistatus_data`).
3. Assurez-vous que le fichier est nommé exactement `backups.db`.
4. Démarrez le conteneur.

:::note
Si vous restaurez la base de données manuellement, vous pouvez rencontrer des erreurs de permission. 

Vérifiez les journaux du conteneur et ajustez les permissions si nécessaire. Consultez la section [Dépannage](#troubleshooting-your-restore--rollback) ci-dessous pour plus d'informations.
:::

## Processus de migration automatique {/* #automatic-migration-process */}

Quand vous démarrez une nouvelle version, les migrations s'exécutent automatiquement :

1. **Création de sauvegarde** : Une sauvegarde horodatée est créée dans votre répertoire de données
2. **Mise à jour du schéma** : Les tables et champs de la base de données sont mis à jour selon les besoins
3. **Migration des données** : Toutes les données existantes sont préservées et migrées
4. **Vérification** : Le succès de la migration est enregistré

### Surveillance de la migration {/* #monitoring-migration */}

Vérifier les journaux Docker pour surveiller la progression de la migration :

```bash
docker logs <container-name>
```

Recherchez des messages comme :
- `"Found X pending migrations"`
- `"Running consolidated migration X.0..."`
- `"Migration X.0 completed successfully"`
- `"Database backup created: /path/to/backups-copy-YYYY-MM-DDTHH-MM-SS.db"`
- `"All migrations completed successfully"`

## Notes de migration spécifiques à la version {/* #version-specific-migration-notes */}

### Mise à niveau vers la version 0.9.x ou ultérieure (Schéma v4.0) {/* #upgrading-to-version-09x-or-later-schema-v40 */}

:::warning
**L'authentification est désormais requise.** Tous les utilisateurs doivent se connecter après la mise à niveau.
:::

#### Ce qui change automatiquement {/* #what-changes-automatically */}

- Le schéma de la base de données migre de v3.1 à v4.0
- Nouvelles tables créées : `users`, `sessions`, `audit_log`
- Compte admin par défaut créé automatiquement
- Toutes les sessions existantes invalidées

#### Ce que vous devez faire {/* #what-you-must-do */}

1. **Connectez-vous** avec les identifiants administrateur par défaut :
   - Nom d'utilisateur : `admin`
   - Mot de passe : `Duplistatus09`
2. **Modifiez le mot de passe** lorsque vous y êtes invité (requis lors de la première connexion)
3. **Créez des comptes d'utilisateurs** pour les autres utilisateurs (Paramètres → Utilisateurs)
4. **Mettez à jour les intégrations API externes** pour inclure l'authentification (voir [Changements d'API incompatibles avec les versions antérieures](api-changes.md))
5. **Configurez la conservation des journaux d'audit** si nécessaire (Paramètres → Journal d'audit)

#### Si vous êtes verrouillé {/* #if-youre-locked-out */}

Utilisez l'outil de récupération admin :

```bash
docker exec -it duplistatus /app/admin-recovery admin NewPassword123
```

Voir [Guide de récupération Admin](../user-guide/admin-recovery.md) pour plus de détails.

### Mise à niveau vers la version 0.8.x {/* #upgrading-to-version-08x */}

#### Ce qui change automatiquement {/* #what-changes-automatically-1 */}

- Schéma de la base de données mis à jour vers v3.1
- Clé maître générée pour le chiffrement (stockée dans `.duplistatus.key`)
- Sessions invalidées (nouvelles sessions protégées par CSRF créées)
- Mots de passe chiffrés à l'aide du nouveau système

#### Ce que vous devez faire {/* #what-you-must-do-1 */}

1. **Mettre à jour les modèles de notification** si vous les avez personnalisés :
   - Remplacer `{backup_interval_value}` et `{backup_interval_type}` par `{backup_interval}`
   - Les modèles par défaut sont mis à jour automatiquement

#### Notes de sécurité {/* #security-notes */}

- Assurez-vous que le fichier `.duplistatus.key` est sauvegardé (dispose des permissions 0400)
- Les sessions expirent après 24 heures

### Mise à niveau vers la Version 0.7.x {/* #upgrading-to-version-07x */}

#### Ce qui change automatiquement {/* #what-changes-automatically-2 */}

- La table `machines` a été renommée en `servers`
- Les champs `machine_id` ont été renommés en `server_id`
- Nouveaux champs ajoutés : `alias`, `notes`, `created_at`, `updated_at`

#### Ce que vous devez faire {/* #what-you-must-do-2 */}

1. **Mettez à jour les intégrations API externes** :
   - Remplacez `totalMachines` par `totalServers` dans `/api/summary`
   - Remplacez `machine` par `server` dans les objets de réponse de l'API
   - Remplacez `backup_types_count` par `backup_jobs_count` dans `/api/lastbackups/{serverId}`
   - Mettez à jour les chemins de point de terminaison de `/api/machines/...` à `/api/servers/...`
2. **Mettez à jour les modèles de notification** :
   - Remplacez `{machine_name}` par `{server_name}`

Consultez [Modifications d'API incompatibles avec les versions antérieures](api-changes.md) pour les étapes détaillées de migration de l'API.

## Liste de contrôle post-migration {/* #post-migration-checklist */}

Après la mise à niveau, vérifiez :

- [ ] Tous les serveurs s'affichent correctement dans le tableau de bord
- [ ] L'historique des sauvegardes est complet et accessible
- [ ] Les notifications fonctionnent (testez NTFY/e-mail)
- [ ] Les intégrations API externes fonctionnent (le cas échéant)
- [ ] Les paramètres sont accessibles et corrects
- [ ] La surveillance des sauvegardes fonctionne correctement
- [ ] Connexion réussie (0.9.x+)
- [ ] Mot de passe admin par défaut modifié (0.9.x+)
- [ ] Comptes utilisateur créés pour les autres utilisateurs (0.9.x+)
- [ ] Intégrations API externes mises à jour avec authentification (0.9.x+)

## Dépannage {/* #troubleshooting */}

### La migration échoue {/* #migration-fails */}

1. Vérifiez l'espace disque (la sauvegarde nécessite de l'espace)
2. Vérifiez les permissions d'écriture sur le répertoire de données
3. Consultez les journaux du conteneur pour les erreurs spécifiques
4. Restaurez à partir de la sauvegarde si nécessaire (voir Restauration ci-dessous)

### Données manquantes après la migration {/* #data-missing-after-migration */}

1. Vérifiez que la sauvegarde a été créée (vérifiez le répertoire de données)
2. Consultez les journaux du conteneur pour les messages de création de sauvegarde
3. Vérifiez l'intégrité du fichier de base de données

### Problèmes d'authentification (0.9.x+) {/* #authentication-issues-09x */}

1. Vérifiez que le compte admin par défaut existe (vérifiez les journaux)
2. Essayez les identifiants par défaut : `admin` / `Duplistatus09`
3. Utilisez l'outil de récupération admin si vous êtes verrouillé
4. Vérifiez que la table `users` existe dans la base de données

### Erreurs API {/* #api-errors */}

1. Examinez les [Modifications de l’API non rétrocompatibles](api-changes.md) pour les mises à jour des points de terminaison
2. Mettez à jour les intégrations externes avec les nouveaux noms de champs
3. Ajoutez l’authentification aux requêtes API (0.9.x+)
4. Tester les points de terminaison API après la migration

### Problèmes de clé maître (0.8.x+) {/* #master-key-issues-08x */}

1. Assurez-vous que le fichier `.duplistatus.key` est accessible
2. Vérifiez que les permissions du fichier sont 0400
3. Vérifiez les journaux du conteneur pour les erreurs de génération de clé

### Configuration DNS de Podman {/* #podman-dns-configuration */}

Si vous utilisez Podman et rencontrez des problèmes de connectivité réseau après la mise à niveau, vous devrez peut-être configurer les paramètres DNS de votre conteneur. Consultez la [section de configuration DNS](../installation/installation.md#configuring-dns-for-podman-containers) du guide d'installation pour plus de détails.

## Procédure de restauration {/* #rollback-procedure */}

Si vous devez revenir à une version antérieure :

1. **Arrêtez le conteneur** : `docker stop <container-name>` (ou `podman stop <container-name>`)
2. **Trouvez votre sauvegarde** :
   - Si vous avez créé une sauvegarde à l'aide de l'interface web (version 1.2.1+), utilisez ce fichier de sauvegarde téléchargé
   - Si vous avez créé une sauvegarde manuelle de volume, extrayez-la d'abord
   - Les sauvegardes automatiques de migration se trouvent dans le répertoire de données (fichiers `.db` horodatés)
3. **Restaurez la base de données** :
   - **Pour les sauvegardes via l'interface web (version 1.2.1+)** : utilisez la fonction de restauration dans `Settings → Database Maintenance` (voir [Maintenance de la base de données](../user-guide/settings/database-maintenance.md#database-restore))
   - **Pour les sauvegardes manuelles** : remplacez `backups.db` dans votre répertoire/volume de données par le fichier de sauvegarde
4. **Utilisez la version précédente de l'image** : téléchargez et exécutez l'image du conteneur précédente
5. **Démarrez le conteneur** : démarrez avec la version précédente

:::warning
La restauration peut entraîner une perte de données si le nouveau schéma est incompatible avec la version antérieure. Assurez-vous toujours d'avoir une sauvegarde récente avant de tenter une restauration.
:::

### Dépannage de votre restauration / restauration {/* #troubleshooting-your-restore--rollback */}

Si l'application ne démarre pas ou que vos données n'apparaissent pas après une restauration ou une restauration, vérifiez les problèmes courants suivants :

#### 1. Permissions du fichier de base de données (Linux/Podman) {/* #1-database-file-permissions-linuxpodman */}

Si vous avez restauré le fichier en tant qu'utilisateur `root`, l'application à l'intérieur du conteneur pourrait ne pas avoir la permission de le lire ou d'y écrire.

* **Le symptôme** : Les journaux affichent « Permission refusée » ou « Base de données en lecture seule ».
* **La solution** : Réinitialisez les permissions du fichier à l'intérieur du conteneur pour vous assurer qu'il est accessible.

```bash
# Set ownership (usually UID 1000 or the app user)
docker exec -u 0 duplistatus chown 1000:1000 /app/data/backups.db
# Set read/write permissions
docker exec -u 0 duplistatus chmod 664 /app/data/backups.db
```

#### 2. Nom de fichier incorrect {/* #2-incorrect-filename */}

L'application recherche spécifiquement un fichier nommé `backups.db`.

* **Le symptôme** : L'application démarre mais semble « vide » (comme une nouvelle installation).
* **La solution** : Vérifiez le répertoire `/app/data/`. Si votre fichier est nommé `duplistatus-backup-2024.db` ou a une extension `.sqlite`, l'application l'ignorera. Utilisez la commande `mv` ou l'interface graphique Docker Desktop pour le renommer exactement en `backups.db`.

#### 3. Conteneur non redémarré {/* #3-container-not-restarted */}

Sur certains systèmes, l'utilisation de `docker cp` pendant que le conteneur est en cours d'exécution peut ne pas actualiser immédiatement la connexion de l'application à la base de données.

* **La Solution :** Effectuez toujours un redémarrage complet après une restauration :

```bash
docker restart duplistatus
```

#### 4. Incompatibilité de Version de Base de Données {/* #4-database-version-mismatch */}

Si vous restaurez une sauvegarde d'une version beaucoup plus récente de duplistatus dans une version plus ancienne de l'application, le schéma de la base de données pourrait être incompatible.

* **La Solution :** Assurez-vous toujours que vous exécutez la même version (ou une version plus récente) de l'image duplistatus que celle qui a créé la sauvegarde. Vérifiez votre version avec :

```bash
docker inspect duplistatus --format '{{.Config.Image}}'
```

## Versions du Schéma de Base de Données {/* #database-schema-versions */}

| Version de l'Application   | Version du Schéma | Modifications Clés                                 |
|----------------------------|-------------------|----------------------------------------------------|
| 0.6.x et antérieures       | v1.0              | Schéma initial                                     |
| 0.7.x                     | v2.0, v3.0        | Configurations ajoutées, machines renommées en serveurs |
| 0.8.x                     | v3.1              | Champs de sauvegarde améliorés, support du chiffrement |
| 0.9.x, 1.0.x, 1.1.x, 1.2.x, 1.3.x | v4.0              | Contrôle d'accès utilisateur, authentification, journalisation d'audit |

## Obtenir de l'Aide {/* #getting-help */}

- **Documentation** : [Guide Utilisateur](../user-guide/overview.md)
- **Référence API** : [Documentation API](../api-reference/overview.md)
- **Modifications API** : [Modifications API non rétrocompatibles](api-changes.md)
- **Notes de Version** : Consultez les notes de version spécifiques à chaque version pour les modifications détaillées
- **Communauté** : [GitHub Discussions](https://github.com/wsj-br/duplistatus/discussions)
- **Problèmes** : [GitHub Issues](https://github.com/wsj-br/duplistatus/issues)
