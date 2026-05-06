---
translation_last_updated: '2026-05-06T23:20:01.889Z'
source_file_mtime: '2026-05-06T23:18:51.394Z'
source_file_hash: 6582520a51466f9784b01b1236c4ba689c2b3989be1150eed15fadd8137decab
translation_language: fr
source_file_path: documentation/docs/development/workspace-admin-scripts-commands.md
translation_models:
  - anthropic/claude-3.5-haiku
  - anthropic/claude-haiku-4.5
  - qwen/qwen3-235b-a22b-2507
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

Supprime tous les artefacts de construction, le répertoire node_modules et d'autres fichiers générés pour garantir un état propre. Ceci est utile lorsque vous devez effectuer une installation fraîche ou résoudre des problèmes de dépendances. La commande supprimera :
- le répertoire `node_modules/`
- le répertoire de build `.next/`
- le répertoire `dist/`
- répertoire `out/`
- répertoire `.turbo/`
- `pnpm-lock.yaml`
- `data/*.json` (fichiers de sauvegarde JSON de développement)
- `public/documentation`
- `documentation/.docusaurus`, `.cache`, `.cache-*`, `build`, `node_modules`, `pnpm-lock.yaml`
- répertoire `.genkit/`
- fichiers `*.tsbuildinfo`
- cache du magasin pnpm (via `pnpm store prune`)
- cache de construction Docker et nettoyage système (images, réseaux, volumes)

## Nettoyer Docker Compose et l'environnement Docker {#clean-docker-compose-and-docker-environment}

```bash
scripts/clean-docker.sh
```

Effectue un nettoyage complet de Docker, ce qui est utile pour :
- Libérer de l'espace disque
- Supprimer d'anciens artefacts Docker inutilisés
- Nettoyer après des sessions de développement ou de test
- Maintenir un environnement Docker propre

## Mettre à jour les packages vers la dernière version {#update-the-packages-to-the-latest-version}

Vous pouvez mettre à jour les packages manuellement en utilisant :

```bash
ncu --upgrade
pnpm update
```

Ou utilisez le script automatisé (préférez `source` afin que **nvm** s'applique à votre shell actuel ; pour les exécutions **CI** ou non interactives, utilisez `CI=1` ou `DUPLISTATUS_UPGRADE_ALLOW_EXEC=1`) :

```bash
source ./scripts/upgrade-dependencies.sh
```

Le script `upgrade-dependencies.sh` automatise tout le processus de mise à jour des dépendances :
- Configure les outils via `upgrade-tools.sh` (nvm / Node LTS, `pnpm` global, `npm-check-updates`, `doctoc`)
- Met à jour la racine et `documentation/package.json` à l'aide de `npm-check-updates` (avec une vérification optionnelle d'ESLint pour garantir la compatibilité des mises à jour de `eslint` et du plugin React)
- Met à jour le fichier de verrouillage pnpm de l'espace de travail et installe les dépendances
- Met à jour la base de données browserslist
- Vérifie la présence de vulnérabilités à l'aide de `pnpm audit`
- Corrige automatiquement les vulnérabilités à l'aide de `pnpm audit fix`
- Vérifie à nouveau les vulnérabilités après correction pour confirmer leur résolution

Ce script fournit un flux de travail complet pour maintenir les dépendances à jour et sécurisées.

## Vérifier les packages inutilisés {#check-for-unused-packages}

```bash
pnpm depcheck
```

## Mettre à jour les informations de version {#update-version-information}

```bash
./scripts/update-version.sh
```

Ce script met automatiquement à jour les informations de version dans plusieurs fichiers afin de les garder synchronisées. Il :
- Extrait la version à partir de `package.json`
- Met à jour le fichier `.env` avec la variable `VERSION` (le crée s'il n'existe pas)
- Met à jour le `Dockerfile` avec la variable `VERSION` (s'il existe)
- Met à jour le champ version de `documentation/package.json` (s'il existe)
- Met à jour uniquement si la version a changé
- Fournit un retour sur chaque opération

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

Ce script s'assure que le fichier `.duplistatus.key` existe dans le répertoire `data`. Il :
- Crée le répertoire `data` s'il n'existe pas
- Génère un nouveau fichier clé aléatoire de 32 octets s'il est manquant
- Définit les permissions du fichier sur 0400 (lecture seule pour le propriétaire)
- Corrige les autorisations si elles sont incorrectes

Le fichier de clé est utilisé pour les opérations cryptographiques dans l'application.

## Récupération du compte Admin {#admin-account-recovery}

```bash
./admin-recovery <username> <new-password>
```

Ce script permet de récupérer les comptes administrateurs en cas de verrouillage ou d'oubli du mot de passe. Il :
- Réinitialise le mot de passe pour l'utilisateur spécifié
- Déverrouille le compte s'il était verrouillé
- Réinitialise le compteur de tentatives de connexion échouées
- Supprime le drapeau "doit changer le mot de passe"
- Vérifie que le mot de passe respecte les exigences de sécurité
- Enregistre l'action dans le journal d'audit

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

Copie les fichiers image de `documentation/static/img` vers leurs emplacements appropriés dans l'application :
- Copie `favicon.ico` vers `src/app/`
- Copie `duplistatus_logo.png` vers `public/images/`
- Copie `duplistatus_banner.png` vers `public/images/`

Utile pour maintenir les images d'application synchronisées avec les images de documentation.

## Comparer les versions entre le développement et Docker {#compare-versions-between-development-and-docker}

```bash
./scripts/compare-versions.sh
```

Ce script compare les versions entre votre environnement de développement et un conteneur Docker en cours d'exécution. Il :
- Compare les versions de SQLite par version majeure uniquement (par exemple, 3.45.1 et 3.51.1 sont considérées comme compatibles, affichées comme "✅ (majeure)")
- Compare les versions de Node, npm et Duplistatus exactement (doivent correspondre exactement)
- Affiche un tableau formaté montrant toutes les comparaisons de versions
- Fournit un résumé avec des résultats codés par couleur (✅ pour les correspondances, ❌ pour les écarts)
- Termine avec le code 0 si toutes les versions correspondent, 1 s'il y a des écarts

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

## Afficher les paramètres de sauvegarde {#show-backup-settings}

```bash
./scripts/show-backup-settings.sh [database_path]
```

Affiche le contenu de la valeur `backup_settings` dans la table de configurations sous forme de tableau formaté. Utile pour le débogage des configurations de notifications. Chemin de base de données par défaut : `data/backups.db`.
