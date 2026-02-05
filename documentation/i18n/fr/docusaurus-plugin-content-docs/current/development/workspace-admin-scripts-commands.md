---
translation_last_updated: '2026-02-05T00:20:49.584Z'
source_file_mtime: '2026-01-27T14:22:06.830Z'
source_file_hash: 581bc6778a772b4e
translation_language: fr
source_file_path: development/workspace-admin-scripts-commands.md
---
# Scripts et Commandes Admin de l'Espace de Travail {#workspace-admin-scripts-commands}

## Nettoyer la base de données {#clean-database}

```bash
./scripts/clean-db.sh
```

Nettoie la base de données en supprimant toutes les données tout en préservant le schéma et la structure de la base de données.

>[!CAUTION]
> À utiliser avec prudence car cela supprimera toutes les données existantes.

## Nettoyer les artefacts de compilation et les dépendances {#clean-build-artefacts-and-dependencies}

```bash
scripts/clean-workspace.sh
```

Supprime tous les artefacts de build, le répertoire node_modules et les autres fichiers générés pour assurer un état propre. Ceci est utile quand vous devez effectuer une installation nouvelle ou résoudre des problèmes de dépendances. La commande supprimera :
- Répertoire `node_modules/`
- Répertoire de build `.next/`
- Répertoire `dist/`
- Tous les caches de build Docker et effectuera un nettoyage du système Docker
- Cache du magasin pnpm
- Ressources système Docker inutilisées (images, réseaux, volumes)
- Tous les autres fichiers de cache de build

## Nettoyer Docker Compose et l'environnement Docker {#clean-docker-compose-and-docker-environment}

```bash
scripts/clean-docker.sh
```

Effectuer un nettoyage complet de Docker, qui est utile pour :
- Libérer de l'espace disque
- Supprimer les anciens artefacts Docker inutilisés
- Nettoyer après les sessions de développement ou de test
- Maintenir un environnement Docker propre

## Mettre à jour les packages vers la dernière version {#update-the-packages-to-the-latest-version}

Vous pouvez mettre à jour les packages manuellement en utilisant :

```bash
ncu --upgrade
pnpm update
```

Ou utilisez le script automatisé :

```bash
./scripts/upgrade-dependencies.sh
```

Le script `upgrade-dependencies.sh` automatise l'ensemble du processus de mise à jour des dépendances :
- Met à jour `package.json` avec les dernières versions en utilisant `npm-check-updates`
- Met à jour le fichier de verrouillage pnpm et installe les dépendances mises à jour
- Met à jour la base de données browserslist
- Vérifie les vulnérabilités en utilisant `pnpm audit`
- Corrige automatiquement les vulnérabilités en utilisant `pnpm audit fix`
- Vérifie à nouveau les vulnérabilités après la correction pour valider les correctifs

Ce script fournit un flux de travail complet pour maintenir les dépendances à jour et sécurisées.

## Vérifier les packages inutilisés {#check-for-unused-packages}

```bash
pnpm depcheck
```

## Mettre à jour les informations de version {#update-version-information}

```bash
./scripts/update-version.sh
```

Ce script met à jour automatiquement les informations de version dans plusieurs fichiers pour les maintenir synchronisés. Il :
- Extrait la version de `package.json`
- Met à jour le fichier `.env` avec la variable `VERSION` (la crée s'il n'existe pas)
- Met à jour le `Dockerfile` avec la variable `VERSION` (s'il existe)
- Met à jour le champ version de `documentation/package.json` (s'il existe)
- Met à jour uniquement si la version a changé
- Fournit un retour d'information sur chaque opération

## Script de pré-vérifications {#pre-checks-script}

```bash
./scripts/pre-checks.sh
```

Ce script exécute des vérifications préalables avant de démarrer le serveur de développement, de générer la version ou de démarrer le serveur de production. Il :
- Vérifie que le fichier `.duplistatus.key` existe (via `ensure-key-file.sh`)
- Met à jour les informations de version (via `update-version.sh`)

Ce script est automatiquement appelé par `pnpm dev`, `pnpm build` et `pnpm start-local`.

## Assurer l'existence du fichier clé {#ensure-key-file-exists}

```bash
./scripts/ensure-key-file.sh
```

Ce script garantit que le fichier `.duplistatus.key` existe dans le répertoire `data`. Il :
- Crée le répertoire `data` s'il n'existe pas
- Génère un nouveau fichier de clé aléatoire de 32 octets s'il est manquant
- Définit les permissions du fichier à 0400 (lecture seule pour le propriétaire)
- Corrige les permissions si elles sont incorrectes

Le fichier de clé est utilisé pour les opérations cryptographiques dans l'application.

## Récupération du compte Admin {#admin-account-recovery}

```bash
./admin-recovery <username> <new-password>
```

Ce script permet la récupération des comptes admin en cas de verrouillage ou d'oubli de mot de passe. Il :
- Réinitialise le mot de passe pour l'utilisateur spécifié
- Déverrouille le compte s'il était verrouillé
- Réinitialise le compteur de tentatives de connexion échouées
- Efface l'indicateur « Doit changer le mot de passe »
- Valide que le mot de passe respecte les exigences de sécurité
- Enregistre l'action dans le Journal d'Audit

**Exemple :**

```bash
./admin-recovery admin NewPassword123
```

>[!CAUTION]
> Ce script modifie directement la base de données. À utiliser uniquement si nécessaire pour la récupération de compte.

## Copier des images {#copy-images}

```bash
./scripts/copy-images.sh
```

Copie les fichiers image de `docs/static/img` vers leurs emplacements appropriés dans l'application :
- Copie `favicon.ico` vers `src/app/`
- Copie `duplistatus_logo.png` vers `public/images/`
- Copie `duplistatus_banner.png` vers `public/images/`

Utile pour maintenir les images d'application synchronisées avec les images de documentation.

## Comparer les versions entre le développement et Docker {#compare-versions-between-development-and-docker}

```bash
./scripts/compare-versions.sh
```

Ce script compare les versions entre votre environnement de développement et un conteneur Docker en cours d'exécution. Il :
- Compare les versions SQLite par version majeure uniquement (par exemple, 3.45.1 par rapport à 3.51.1 sont considérées comme compatibles, affichées comme « ✅ (major) »)
- Compare les versions Node, npm et duplistatus exactement (doivent correspondre exactement)
- Affiche un tableau formaté montrant toutes les comparaisons de versions
- Fournit un résumé avec des résultats codés par couleur (✅ pour les correspondances, ❌ pour les non-correspondances)
- Quitte avec le code 0 si toutes les versions correspondent, 1 s'il y a des non-correspondances

**Exigences :**
- Le conteneur Docker nommé `duplistatus` doit être en cours d'exécution
- Le script lit les informations de version à partir des journaux du conteneur Docker

**Exemple de sortie :**

```
┌─────────────────────────┬──────────────────────────────┬──────────────────────────────┬──────────────┐
│ Component               │ Development                  │ Docker                       │   Match      │
├─────────────────────────┼──────────────────────────────┼──────────────────────────────┼──────────────┤
│ SQLite                  │ 3.45.1                       │ 3.51.1                       │ ✅ (major)   │
│ Node                    │ 24.12.0                      │ 24.12.0                      │ ✅           │
│ npm                     │ 10.9.2                       │ 10.9.2                       │ ✅           │
│ Duplistatus             │ 1.2.1                        │ 1.2.1                        │ ✅           │
└─────────────────────────┴──────────────────────────────┴──────────────────────────────┴──────────────┘
```

**Note :** Les versions de SQLite sont comparées par version majeure uniquement, car les différentes versions de correctif au sein de la même version majeure sont généralement compatibles. Le script indiquera si les versions de SQLite correspondent au niveau majeur mais diffèrent dans les versions de correctif.

## Affichage des configurations dans la base de données {#viewing-the-configurations-in-the-database}

```bash
sqlite3 data/backups.db "SELECT key, value FROM configurations;" | awk -F'|' '
  {print "\n" $1 ": "; 
   if(index($2,"{")>0) {print $2 |"jq -C ."; close("jq -C .")} 
   else {print $2;}}' | less -R
```

```bash
sqlite3 /var/lib/docker/volumes/duplistatus_data/_data/backups.db "SELECT key, value FROM configurations;" | awk -F'|' '
  {print "\n" $1 ": "; 
   if(index($2,"{")>0) {print $2 |"jq -C ."; close("jq -C .")} 
   else {print $2;}}' | less -R
```

## Scripts SQL pour le débogage et la maintenance {#sql-scripts-for-debugging-and-maintenance}

Le projet inclut des scripts SQL pour la maintenance de la base de données :

### Supprimer les paramètres de sauvegarde {#delete-backup-settings}

```bash
sqlite3 data/backups.db < scripts/delete-backup-settings.sql
```

Ce script supprime tous les paramètres de sauvegarde de la table des configurations. À utiliser avec prudence car cela réinitialisera toutes les configurations de notification de sauvegarde.

### Supprimer Dernière sauvegarde {#delete-last-backup}

```bash
sqlite3 data/backups.db < scripts/delete-last-backup.sql
```

Ce script supprime l'enregistrement de sauvegarde le plus récent pour chaque serveur. Par défaut, il supprime la dernière sauvegarde pour TOUS les serveurs. Le script inclut des exemples commentés pour cibler des serveurs spécifiques par nom. Utile à des fins de test et de débogage.

**Note** : Le script a été mis à jour pour fonctionner avec le schéma de base de données actuel (utilise la table `servers` et la colonne `server_id`).

>[!CAUTION]
> Ces scripts SQL modifient directement la base de données. Effectuez toujours une sauvegarde de votre base de données avant d'exécuter ces scripts.
