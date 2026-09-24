# Scripts et commandes Admin de l'espace de travail {/* #workspace-admin-scripts--commands */}

## Nettoyer la base de données {/* #clean-database */}

```bash
./scripts/clean-db.sh
```

Nettoie la base de données en supprimant toutes les données tout en préservant le schéma et la structure de la base de données.

>[!CAUTION]
> À utiliser avec prudence car cela supprimera toutes les données existantes.

## Nettoyer les artefacts de compilation et les dépendances {/* #clean-build-artefacts-and-dependencies */}

```bash
scripts/clean-workspace.sh
```

Supprime tous les artefacts de compilation, le répertoire node_modules et les autres fichiers générés pour assurer un état propre. Cela est utile quand vous devez effectuer une installation complète ou résoudre des problèmes de dépendances. La commande supprimera :
- répertoire `node_modules/`
- répertoire de compilation `.next/`
- répertoire `dist/`
- répertoire `out/`
- répertoire `.turbo/`
- `pnpm-lock.yaml`
- `data/*.json` (fichiers de sauvegarde JSON de développement)
- `public/documentation`
- `documentation/.docusaurus`, `.cache`, `.cache-*`, `build`, `node_modules`, `pnpm-lock.yaml`
- répertoire `.genkit/`
- fichiers `*.tsbuildinfo`
- cache du magasin pnpm (via `pnpm store prune`)
- cache de compilation Docker et nettoyage système (images, réseaux, volumes)

## Nettoyer Docker Compose et l'environnement Docker {/* #clean-docker-compose-and-docker-environment */}

```bash
scripts/clean-docker.sh
```

Effectuer un nettoyage complet de Docker, utile pour :
- Libérer de l'espace disque
- Supprimer les anciens artefacts Docker inutilisés
- Nettoyer après les sessions de développement ou de test
- Maintenir un environnement Docker propre

## Mettre à jour les packages vers la dernière version {/* #update-the-packages-to-the-latest-version */}

Vous pouvez mettre à jour les packages manuellement en utilisant :

```bash
ncu --upgrade
pnpm update
```

Ou utilisez le script automatisé (préférez `source` pour que **nvm** s'applique à votre shell actuel ; pour les exécutions **CI** ou non-interactives, utilisez `CI=1` ou `UPGRADE_ALLOW_EXEC=1`) :

```bash
source ./scripts/upgrade-dependencies.sh
```

Le script `upgrade-dependencies.sh` automatise l'ensemble du processus de mise à niveau des dépendances. Il est indépendant du projet : le gestionnaire de packages, les packages de l'espace de travail et la commande de vérification de chaque package sont détectés automatiquement (ainsi les packages racine et `documentation/` sont tous deux mis à niveau, sans chemins codés en dur). Il :
- Source la configuration des outils via `upgrade-tools.sh` (nvm / Node LTS, `pnpm` global, `npm-check-updates`, `doctoc`)
- Effectue des mises à niveau **sûres pour la compilation** pour chaque package : `npm-check-updates` résout les dernières versions, puis installe et `typecheck`/`lint` s'exécutent à partir de la racine de l'espace de travail. Les mises à niveau qui échouent la vérification sont bisectées en modifiant `package.json` (pas `pnpm add`, que pnpm rejette à la racine de l'espace de travail). Les portes de pairs intégrées épinglent `eslint` et `typescript` quand `eslint-plugin-react` / `typescript-eslint` ne permettent pas encore la dernière version majeure.
- Met à jour le fichier de verrouillage pnpm de l'espace de travail et installe les dépendances
- Met à jour la base de données browserslist
- Vérifie les vulnérabilités (`pnpm audit`) et applique les correctifs non-cassants (`pnpm audit --fix`)
- **Priorise la sécurité** : si une dépendance directe vulnérable ne peut être corrigée que par une mise à niveau cassante pour la compilation, la version sûre est forcément appliquée et les erreurs de compilation sont signalées pour que le code puisse être mis à jour pour la compatibilité
- Affiche un résumé (packages mis à niveau vs. packages cassants ignorés, vulnérabilités corrigées/restantes, et un chemin d'instantané du manifeste pour un retour en arrière manuel)
- Copie `package.json` et les fichiers de verrouillage avec `/usr/bin/cp` pour qu'un alias `cp` interactif sourcé (par exemple `cp -i`) ne demande pas de confirmer le remplacement de ces fichiers

Ce script fournit un flux de travail complet pour maintenir les dépendances à jour et sécurisées.

## Vérifier les packages inutilisés {/* #check-for-unused-packages */}

```bash
pnpm depcheck
```

## Mettre à jour les informations de version {/* #update-version-information */}

```bash
./scripts/update-version.sh
```

Ce script met à jour automatiquement les informations de version dans plusieurs fichiers pour les maintenir synchronisés. Il :
- Extrait la version de `package.json`
- Met à jour le fichier `.env` avec la variable `VERSION` (la crée si elle n'existe pas)
- Met à jour `Dockerfile` avec la variable `VERSION` (si elle existe)
- Met à jour le champ de version `documentation/package.json` (s'il existe)
- Met à jour uniquement si la version a changé
- Fournit un retour sur chaque opération

## Publier une release GitHub {/* #publish-a-github-release */}

```bash
pnpm release:github:dry
pnpm release:github
```

`scripts/release.mjs` crée le tag `v<package.json version>` sur HEAD, publie une release GitHub dont les notes proviennent de `documentation/docs/release-notes/<version>.md` (réécrit en `RELEASE_NOTES_github_<version>.md`), puis déploie le site Docusaurus. Consultez [Gestion des versions](./release-management.md).

## Script de pré-vérifications {/* #pre-checks-script */}

```bash
./scripts/pre-checks.sh
```

Ce script exécute des pré-vérifications avant de démarrer le serveur de développement, de compiler ou de démarrer le serveur de production. Il :
- Vérifie que le fichier `.duplistatus.key` existe (via `ensure-key-file.sh`)
- Met à jour les informations de version (via `update-version.sh`)

Ce script est appelé automatiquement par `pnpm dev`, `pnpm build` et `pnpm start-local`.

## Vérifier l'existence du fichier clé {/* #ensure-key-file-exists */}

```bash
./scripts/ensure-key-file.sh
```

Ce script vérifie que le fichier `.duplistatus.key` existe dans le répertoire `data`. Il :
- Crée le répertoire `data` s'il n'existe pas
- Génère un nouveau fichier de clé aléatoire de 32 octets s'il est manquant
- Définit les permissions du fichier à 0400 (lecture seule pour le propriétaire)
- Corrige les permissions si elles sont incorrectes

Le fichier de clé est utilisé pour les opérations cryptographiques dans l'application.

## Récupération du compte Admin {/* #admin-account-recovery */}

```bash
./admin-recovery <username> <new-password>
```

Ce script permet la récupération des comptes Admin en cas de verrouillage ou d'oubli de mot de passe. Il :
- Réinitialise le mot de passe pour l'utilisateur spécifié
- Déverrouille le compte s'il était verrouillé
- Réinitialise le compteur de tentatives de connexion échouées
- Efface l'indicateur « Doit changer de mot de passe »
- Valide que le mot de passe respecte les exigences de sécurité
- Enregistre l'action dans le journal d'audit

**Exemple :**

```bash
./admin-recovery admin NewPassword123
```

>[!CAUTION]
> Ce script modifie directement la base de données. À utiliser uniquement si nécessaire pour la récupération de compte.

## Copier les images {/* #copy-images */}

```bash
./scripts/copy-images.sh
```

Copie les fichiers image de `documentation/static/img` vers leurs emplacements appropriés dans l'application :
- Copie `favicon.ico` vers `src/app/`
- Copie `duplistatus_logo.png` vers `public/images/`
- Copie `duplistatus_banner.png` vers `public/images/`

Utile pour maintenir les images de l'application synchronisées avec les images de la documentation.

## Basculer entre local ou npm ai-i18n-tools {/* #switch-local-or-npm-ai-i18n-tools */}

```bash
./scripts/link-ai-i18n-tools.sh --local
./scripts/link-ai-i18n-tools.sh --remote
pnpm i18n:tools --local
pnpm i18n:tools --remote
```

Pointe ce dépôt vers un [ai-i18n-tools](https://github.com/wsj-br/ai-i18n-tools) frère ou retourne vers le package npm publié, puis imprime la version résolue. `--local` écrit `link:../ai-i18n-tools` (remplacez le chemin par `--path` ou `AI_I18N_TOOLS_PATH`) afin que `pnpm i18n:*` et `ai-i18n-tools/runtime` utilisent tous deux cet arbre. `--remote` installe la dernière version npm en tant que `^x.y.z`. Ne pas valider le spécificateur `link:`.

## Comparer les versions entre le développement et Docker {/* #compare-versions-between-development-and-docker */}

```bash
./scripts/compare-versions.sh
```

Ce script compare les versions entre votre environnement de développement et un conteneur Docker en cours d'exécution. Il :
- Compare les versions SQLite par version majeure uniquement (par exemple, 3.45.1 vs 3.51.1 sont considérées comme compatibles, affichées comme « ✅ (major) »)
- Compare exactement les versions de Node, npm et Duplistatus (doivent correspondre exactement)
- Affiche un tableau formaté montrant toutes les comparaisons de version
- Fournit un résumé avec des résultats codés par couleur (✅ pour les correspondances, ❌ pour les non-correspondances)
- Quitte avec le code 0 si toutes les versions correspondent, 1 s'il y a des non-correspondances

**Prérequis :**
- Le conteneur Docker nommé `duplistatus` doit être en cours d'exécution
- Le script lit les informations de version à partir des journaux du conteneur Docker

**Exemple de résultat :**

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

**Remarque :** Les versions de SQLite sont comparées par version majeure uniquement, car les différentes versions de correctif au sein d'une même version majeure sont généralement compatibles. Le script indiquera si les versions de SQLite correspondent au niveau majeur mais diffèrent dans les versions de correctif.

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

Affiche le contenu de la valeur `backup_settings` dans la table des configurations dans un tableau formaté. Utile pour déboguer les configurations de notification. Chemin de base de données par défaut : `data/backups.db`.
