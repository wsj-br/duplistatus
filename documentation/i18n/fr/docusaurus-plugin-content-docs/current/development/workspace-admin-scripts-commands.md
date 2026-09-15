# Scripts et commandes d'administration de l'espace de travail {/* #workspace-admin-scripts--commands */}

## Nettoyer la base de données {/* #clean-database */}

```bash
./scripts/clean-db.sh
```

Nettoie la base de données en supprimant toutes les données tout en conservant le schéma et la structure de la base de données.

>[!CAUTION]
> Utilisez avec prudence car cela supprimera toutes les données existantes.

## Nettoyer les artefacts de construction et les dépendances {/* #clean-build-artefacts-and-dependencies */}

```bash
scripts/clean-workspace.sh
```

Supprime tous les artefacts de construction, le répertoire node_modules et autres fichiers générés pour garantir un état propre. Cela est utile lorsque vous devez effectuer une nouvelle installation ou résoudre des problèmes de dépendances. La commande supprimera :
- Répertoire `node_modules/`
- Répertoire de construction `.next/`
- Répertoire `dist/`
- Répertoire `out/`
- Répertoire `.turbo/`
- Répertoire `pnpm-lock.yaml`
- Répertoire `data/*.json` (fichiers de sauvegarde JSON de développement)
- `public/documentation`
- `documentation/.docusaurus`, `.cache`, `.cache-*`, `build`, `node_modules`, `pnpm-lock.yaml`
- Répertoire `.genkit/`
- Fichiers `*.tsbuildinfo`
- Cache du magasin pnpm (via `pnpm store prune`)
- Cache de construction Docker et purge du système (images, réseaux, volumes)

## Nettoyer l'environnement Docker Compose et Docker {/* #clean-docker-compose-and-docker-environment */}

```bash
scripts/clean-docker.sh
```

Effectue un nettoyage complet de Docker, ce qui est utile pour :
- Libérer de l'espace disque
- Supprimer les artefacts Docker anciens/inutilisés
- Nettoyer après des sessions de développement ou de test
- Maintenir un environnement Docker propre

## Mettre à jour les packages vers la dernière version {/* #update-the-packages-to-the-latest-version */}

Vous pouvez mettre à jour les packages manuellement en utilisant :

```bash
ncu --upgrade
pnpm update
```

Ou utilisez le script automatisé (préférez `source` afin que **nvm** s'applique à votre shell actuel ; pour **CI** ou les exécutions non interactives, utilisez `CI=1` ou `UPGRADE_ALLOW_EXEC=1`):

```bash
source ./scripts/upgrade-dependencies.sh
```

Le script `upgrade-dependencies.sh` automatise l'ensemble du processus de mise à niveau des dépendances. Il est agnostique du projet : le gestionnaire de paquets, les packages de l'espace de travail et la commande de vérification de chaque package sont auto-détectés (ainsi, les packages racine et `documentation/` sont tous deux mis à jour, sans chemins codés en dur). Il :
- Configure les outils via `upgrade-tools.sh` (nvm / Node LTS, `pnpm` global, `npm-check-updates`, `doctoc`)
- Effectue des mises à niveau **sûres pour la construction** pour chaque package : `npm-check-updates` résout les dernières versions, puis installe et `typecheck`/`lint` s'exécutent à partir de la racine de l'espace de travail. Les mises à niveau qui échouent à la vérification sont bisectées en éditant `package.json` (pas `pnpm add`, que pnpm rejette à la racine de l'espace de travail). Les portes de pairs intégrées fixent `eslint` et `typescript` lorsque `eslint-plugin-react` / `typescript-eslint` ne permettent pas encore la dernière version majeure.
- Met à jour le fichier de verrouillage pnpm de l'espace de travail et installe les dépendances
- Met à jour la base de données browserslist
- Vérifie les vulnérabilités (`pnpm audit`) et applique les correctifs non cassants (`pnpm audit --fix`)
- **Priorise la sécurité** : si une dépendance directe vulnérable ne peut être corrigée que par une mise à niveau cassante, la version sûre est appliquée de force et les erreurs de construction sont rapportées afin que le code puisse être mis à jour pour la compatibilité
- Affiche un résumé (packages mis à jour vs. packages sautés cassants, vulnérabilités corrigées/restantes, et un chemin de snapshot de manifeste pour le rollback manuel)
- Copie `package.json` et les fichiers de verrouillage avec `/usr/bin/cp` afin qu'un alias `cp` interactif (par exemple `cp -i`) ne demande pas de remplacer ces fichiers

Ce script fournit un workflow complet pour garder les dépendances à jour et sécurisées.

## Vérifier les packages inutilisés {/* #check-for-unused-packages */}

```bash
pnpm depcheck
```

## Mettre à jour les informations de version {/* #update-version-information */}

```bash
./scripts/update-version.sh
```

Ce script met automatiquement à jour les informations de version dans plusieurs fichiers pour les maintenir synchronisés. Il:
- Extrait la version de `package.json`
- Met à jour le fichier `.env` avec la variable `VERSION` (le crée s'il n'existe pas)
- Met à jour le `Dockerfile` avec la variable `VERSION` (si elle existe)
- Met à jour le champ de version de `documentation/package.json` (si elle existe)
- Ne met à jour que si la version a changé
- Fournit des commentaires sur chaque opération

## Script de vérification préalable {/* #pre-checks-script */}

```bash
./scripts/pre-checks.sh
```

Ce script exécute des vérifications préalables avant de démarrer le serveur de développement, la construction ou le serveur de production. Il:
- S'assure que le fichier `.duplistatus.key` existe (via `ensure-key-file.sh`)
- Met à jour les informations de version (via `update-version.sh`)

Ce script est automatiquement appelé par `pnpm dev`, `pnpm build`, et `pnpm start-local`.

## Assurer l'existence du fichier clé {/* #ensure-key-file-exists */}

```bash
./scripts/ensure-key-file.sh
```

Ce script s'assure que le fichier `.duplistatus.key` existe dans le répertoire `data`. Il:
- Crée le répertoire `data` s'il n'existe pas
- Génère un nouveau fichier de clé aléatoire de 32 octets s'il est manquant
- Définit les permissions de fichier à 0400 (lecture seule pour le propriétaire)
- Corrige les permissions si elles sont incorrectes

Le fichier de clé est utilisé pour les opérations cryptographiques dans l'application.

## Récupération du compte administrateur {/* #admin-account-recovery */}

```bash
./admin-recovery <username> <new-password>
```

Ce script permet la récupération des comptes administrateurs si verrouillés ou mot de passe oublié. Il:
- Réinitialise le mot de passe de l'utilisateur spécifié
- Déverrouille le compte s'il était verrouillé
- Réinitialise le compteur de tentatives de connexion échouées
- Efface le drapeau "doit changer de mot de passe"
- Valide que le mot de passe répond aux exigences de sécurité
- Enregistre l'action dans le journal d'audit

**Exemple :**

```bash
./admin-recovery admin NewPassword123
```

>[!CAUTION]
> Ce script modifie directement la base de données. Utilisez-le uniquement lorsque nécessaire pour la récupération de compte.

## Copier les images {/* #copy-images */}

```bash
./scripts/copy-images.sh
```

Copie les fichiers d'images de `documentation/static/img` vers leurs emplacements appropriés dans l'application:
- Copie `favicon.ico` vers `src/app/`
- Copie `duplistatus_logo.png` vers `public/images/`
- Copie `duplistatus_banner.png` vers `public/images/`

Utile pour maintenir les images de l'application synchronisées avec les images de documentation.

## Comparer les versions entre développement et Docker {/* #compare-versions-between-development-and-docker */}

```bash
./scripts/compare-versions.sh
```

Ce script compare les versions entre votre environnement de développement et un conteneur Docker en cours d'exécution. Il:
- Compare les versions de SQLite par version majeure uniquement (par exemple, 3.45.1 vs 3.51.1 sont considérés comme compatibles, affichés comme "✅ (majeure)")
- Compare exactement les versions de Node, npm et Duplistatus (doivent correspondre exactement)
- Affiche un tableau formaté montrant toutes les comparaisons de versions
- Fournit un résumé avec des résultats codés en couleur (✅ pour les correspondances, ❌ pour les incompatibilités)
- Quitte avec le code 0 si toutes les versions correspondent, 1 s'il y a des incompatibilités

**Exigences:**
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

**Remarque :** Les versions de SQLite sont comparées uniquement par version majeure car les différentes versions de patch au sein de la même version majeure sont généralement compatibles. Le script indiquera si les versions de SQLite correspondent au niveau majeur mais diffèrent en versions de patch.

## Affichage des configurations dans la base de données {/* #viewing-the-configurations-in-the-database */}

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

## Afficher les paramètres de sauvegarde {/* #show-backup-settings */}

```bash
./scripts/show-backup-settings.sh [database_path]
```

Affiche le contenu de la valeur `backup_settings` dans la table des configurations sous forme de tableau formaté. Utile pour le débogage des configurations de notification. Chemin de la base de données par défaut : `data/backups.db`.
