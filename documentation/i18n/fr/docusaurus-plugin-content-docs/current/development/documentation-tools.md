---
translation_last_updated: '2026-01-31T00:51:19.867Z'
source_file_mtime: '2026-01-29T17:58:29.891Z'
source_file_hash: 48575e653bc418bc
translation_language: fr
source_file_path: development/documentation-tools.md
---
# Outils de Documentation {#documentation-tools}

La documentation est construite à l'aide de [Docusaurus](https://docusaurus.io/) et se trouve dans le dossier `documentation`. La documentation est hébergée sur [GitHub Pages](https://wsj-br.github.io/duplistatus/) et n'est plus incluse dans l'image du conteneur Docker.

## Structure des dossiers {#folder-structure}

```
documentation/
├── docs/              # Documentation markdown files
│   ├── api-reference/
│   ├── development/
│   ├── installation/
│   ├── migration/
│   ├── release-notes/
│   └── user-guide/
├── src/               # React components and pages
│   ├── components/    # Custom React components
│   ├── css/           # Custom styles
│   └── pages/         # Additional pages (e.g., 404)
├── static/            # Static assets (images, files)
├── docusaurus.config.ts  # Docusaurus configuration
├── sidebars.ts        # Sidebar navigation configuration
└── package.json       # Dependencies and scripts
```

## Commandes courantes {#common-commands}

Toutes les commandes doivent être exécutées à partir du répertoire `documentation` :

### Développement {#development}

Démarrer le serveur de développement avec rechargement à chaud :

```bash
cd documentation
pnpm start
```

Le site sera disponible à `http://localhost:3000` (ou au port disponible suivant).

### Build {#build}

Créer le site de documentation pour la production :

```bash
cd documentation
pnpm build
```

Ceci génère des fichiers HTML statiques dans le répertoire `documentation/build`.

### Servir la version de production {#serve-production-build}

Prévisualisez la version de production localement :

```bash
cd documentation
pnpm serve
```

Ceci sert à servir le site construit à partir du répertoire `documentation/build`.

### Autres Commandes Utiles {#other-useful-commands}

- `pnpm clear` - Effacer le cache Docusaurus
- `pnpm typecheck` - Exécuter la vérification des types TypeScript
- `pnpm write-heading-ids` - Ajouter des identifiants de titre aux fichiers markdown pour les liens d'ancrage

## Génération de README.md {#generating-readmemd}

Le fichier `README.md` du projet est généré automatiquement à partir de `documentation/docs/intro.md` pour maintenir la synchronisation du fichier README du référentiel GitHub avec la documentation Docusaurus.

Pour générer ou mettre à jour le fichier README.md :

```bash
./scripts/generate-readme-from-intro.sh
```

Ce script :
- Extrait la version actuelle de `package.json` et ajoute un badge de version
- Copie le contenu de `documentation/docs/intro.md`
- Convertit les admonitions Docusaurus (note, tip, warning, etc.) en alertes de style GitHub
- Convertit tous les liens Docusaurus relatifs en URLs GitHub docs absolues (`https://wsj-br.github.io/duplistatus/...`)
- Convertit les chemins d'images de `/img/` à `documentation/static/img/` pour la compatibilité GitHub
- Supprime le bloc IMPORTANT de migration et ajoute une section Informations de migration avec un lien vers la documentation Docusaurus
- Génère une table des matières à l'aide de `doctoc`
- Génère `README_dockerhub.md` avec un formatage compatible Docker Hub (convertit les images et les liens en URLs absolues, convertit les alertes GitHub en format basé sur des emojis)
- Génère les notes de version GitHub (`RELEASE_NOTES_github_VERSION.md`) à partir de `documentation/docs/release-notes/VERSION.md` (convertit les liens et les images en URLs absolues)

**Note :** Vous devez avoir `doctoc` installé globalement pour la génération de la table des matières :

```bash
npm install -g doctoc
```

## Mettre à jour le README pour Docker Hub {#update-readme-for-docker-hub}

Le script `generate-readme-from-intro.sh` génère automatiquement `README_dockerhub.md` avec un formatage compatible avec Docker Hub. Il :
- Copie `README.md` vers `README_dockerhub.md`
- Convertit les chemins d'images relatifs en URL GitHub brutes absolues
- Convertit les liens de documents relatifs en URL GitHub blob absolues
- Convertit les alertes de style GitHub (`[!NOTE]`, `[!WARNING]`, etc.) en format basé sur les émojis pour une meilleure compatibilité avec Docker Hub
- Garantit que toutes les images et tous les liens fonctionnent correctement sur Docker Hub

## Générer les notes de version GitHub {#generate-github-release-notes}

Le script `generate-readme-from-intro.sh` génère automatiquement les notes de version GitHub lors de son exécution. Il :
- Lit les notes de version depuis `documentation/docs/release-notes/VERSION.md` (où VERSION est extrait de `package.json`)
- Change le titre de « # Version xxxx » à « # Release Notes - Version xxxxx »
- Convertit les liens markdown relatifs en URLs absolues de documentation GitHub (`https://wsj-br.github.io/duplistatus/...`)
- Convertit les chemins d'images en URLs brutes GitHub (`https://raw.githubusercontent.com/wsj-br/duplistatus/main/documentation/static/img/...`) pour un affichage correct dans les descriptions de version
- Gère les chemins relatifs avec le préfixe `../`
- Préserve les URLs absolues (http:// et https://) sans modification
- Crée `RELEASE_NOTES_github_VERSION.md` à la racine du projet

**Exemple :**

```bash
# This will generate both README.md and RELEASE_NOTES_github_VERSION.md
./scripts/generate-readme-from-intro.sh
```

Le fichier de notes de version généré peut être copié et collé directement dans la description de la version GitHub. Tous les liens et images fonctionneront correctement dans le contexte de la version GitHub.

**Note :** Le fichier généré est temporaire et peut être supprimé après la création de la version GitHub. Il est recommandé d'ajouter `RELEASE_NOTES_github_*.md` à `.gitignore` si vous ne souhaitez pas valider ces fichiers.

## Prendre des captures d'écran pour la documentation {#take-screenshots-for-documentation}

```bash
tsx scripts/take-screenshots.ts
```

Ce script prend automatiquement des captures d'écran de l'application à des fins de documentation. Il :
- Lance un navigateur sans interface (Puppeteer)
- Se connecte en tant qu'administrateur et utilisateur régulier
- Navigue à travers diverses pages (tableau de bord, détails du serveur, paramètres, etc.)
- Prend des captures d'écran à différentes tailles de fenêtre d'affichage
- Enregistre les captures d'écran dans `documentation/static/img/`

**Exigences :**
- Le serveur de développement doit s'exécuter sur `http://localhost:8666`
- Les variables d'environnement doivent être définies :
  - `ADMIN_PASSWORD` : Mot de passe du compte Admin
  - `USER_PASSWORD` : Mot de passe du compte Utilisateur standard

**Exemple :**

```bash
export ADMIN_PASSWORD="your-admin-password"
export USER_PASSWORD="your-user-password"
tsx scripts/take-screenshots.ts
```

**Captures d'écran générées :**

Le script génère les captures d'écran suivantes (enregistrées dans `documentation/static/img/`) :

**Captures d'écran du Tableau de bord :**
- `screen-main-dashboard-card-mode.png` - Tableau de bord en mode carte/vue d'ensemble
- `screen-main-dashboard-table-mode.png` - Tableau de bord en mode tableau
- `screen-overdue-backup-hover-card.png` - Carte/infobulle au survol de sauvegarde en retard
- `screen-backup-tooltip.png` - Infobulle de sauvegarde régulière (survol de la sauvegarde en mode cartes)

**Captures d'écran des Détails du Serveur :**
- `screen-server-backup-list.png` - Page de liste des sauvegardes du serveur
- `screen-backup-history.png` - Section du tableau Historique des sauvegardes
- `screen-backup-detail.png` - Page de détails de sauvegarde individuelle
- `screen-metrics.png` - Graphique des Métriques affichant les métriques de sauvegarde au fil du temps

**Captures d'écran Collecter/Configuration :**
- `screen-collect-button-popup.png` - Popup Collecter les journaux de sauvegarde
- `screen-collect-button-right-click-popup.png` - Menu contextuel Tout collecter
- `screen-collect-backup-logs.png` - Interface Collecter les journaux de sauvegarde
- `screen-duplicati-configuration.png` - Menu déroulant Configuration Duplicati

**Captures d'écran des Paramètres :**
- `screen-settings-left-panel-admin.png` - Barre latérale Paramètres (vue Admin)
- `screen-settings-left-panel-non-admin.png` - Barre latérale Paramètres (vue non-admin)
- `screen-settings-{tab}.png` - Pages de paramètres individuelles pour chaque onglet :
  - `screen-settings-notifications.png`
  - `screen-settings-overdue.png`
  - `screen-settings-server.png`
  - `screen-settings-ntfy.png`
  - `screen-settings-email.png`
  - `screen-settings-templates.png`
  - `screen-settings-users.png`
  - `screen-settings-audit.png`
  - `screen-settings-audit-retention.png`
  - `screen-settings-display.png`
  - `screen-settings-database-maintenance.png`
- `screen-settings-ntfy-configure-device-popup.png` - Fenêtre contextuelle NTFY Configurer l'appareil
- `screen-settings-backup-notifications-detail.png` - Page de détail Notifications de sauvegarde

## Déploiement de la documentation {#deploying-the-documentation}

Pour déployer la documentation sur GitHub Pages, vous devrez générer un jeton d'accès personnel GitHub. Accédez à [GitHub Personal Access Tokens](https://github.com/settings/tokens) et créez un nouveau jeton avec la portée `repo`.

Quand vous disposez du jeton, exécutez la commande suivante pour stocker le jeton dans le magasin d'identifiants Git :

```bash
./setup-git-credentials.sh
```

Ensuite, pour déployer la documentation sur GitHub Pages, exécutez la commande suivante :

```bash
pnpm run deploy
```

Ceci construira la documentation et la poussera vers la branche `gh-pages` du référentiel, et la documentation sera disponible à [https://wsj-br.github.io/duplistatus/](https://wsj-br.github.io/duplistatus/).

## Travailler avec la documentation {#working-with-documentation}

- Les fichiers de documentation sont écrits en Markdown (`.md`) et situés dans `documentation/docs/`
- La navigation de la barre latérale est configurée dans `documentation/sidebars.ts`
- La configuration de Docusaurus se trouve dans `documentation/docusaurus.config.ts`
- Les composants React personnalisés peuvent être ajoutés à `documentation/src/components/`
- Les ressources statiques (images, PDF, etc.) se trouvent dans `documentation/static/`
- La page d'accueil principale de la documentation est `documentation/docs/intro.md`, qui est utilisée comme source pour générer `README.md`
