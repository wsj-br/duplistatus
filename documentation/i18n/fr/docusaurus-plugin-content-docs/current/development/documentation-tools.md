---
translation_last_updated: '2026-02-06T22:33:25.446Z'
source_file_mtime: '2026-02-06T21:19:26.573Z'
source_file_hash: bb3c3536a92b19fc
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

Le site sera disponible à `http://localhost:3000` (ou au prochain port disponible).

### Construire {#build}

Construire le site de documentation pour la production :

```bash
cd documentation
pnpm build
```

Cela génère des fichiers HTML statiques dans le répertoire `documentation/build`.

### Servir la version de production {#serve-production-build}

Prévisualisez la version de production localement :

```bash
cd documentation
pnpm serve
```

Cela sert le site construit à partir du répertoire `documentation/build`.

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
- Convertit les chemins d'images relatifs en URLs GitHub brutes absolues
- Convertit les liens de documents relatifs en URLs GitHub blob absolues
- Convertit les alertes de style GitHub (`[!NOTE]`, `[!WARNING]`, etc.) en format basé sur les emojis pour une meilleure compatibilité avec Docker Hub
- Garantit que toutes les images et tous les liens fonctionnent correctement sur Docker Hub

## Générer les notes de version GitHub {#generate-github-release-notes}

Le script `generate-readme-from-intro.sh` génère automatiquement les notes de version GitHub lors de son exécution. Il :
- Lit les notes de version depuis `documentation/docs/release-notes/VERSION.md` (où VERSION est extrait de `package.json`)
- Change le titre de « # Version xxxx » à « # Release Notes - Version xxxxx »
- Convertit les liens markdown relatifs en URLs absolues de documentation GitHub (`https://wsj-br.github.io/duplistatus/...`)
- Convertit les chemins d'images en URLs brutes GitHub (`https://raw.githubusercontent.com/wsj-br/duplistatus/main/documentation/static/img/...`) pour un affichage correct dans les descriptions de version
- Gère les chemins relatifs avec le préfixe `../`
- Préserve les URLs absolues (http:// et https://) inchangées
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
pnpm take-screenshots
```

Ou exécuter directement : `tsx scripts/take-screenshots.ts` (utilisez `--env-file=.env` si nécessaire pour les variables d'environnement).

Ce script prend automatiquement des captures d'écran de l'application à des fins de documentation. Il :
- Lance un navigateur en mode headless (Puppeteer)
- Se connecte en tant qu'admin et utilisateur standard
- Navigue à travers différentes pages (tableau de bord, détails du serveur, paramètres, etc.)
- Prend des captures d'écran à différentes tailles de viewport
- Enregistre les captures d'écran dans `documentation/static/assets/` (anglais) ou `documentation/i18n/{locale}/docusaurus-plugin-content-docs/current/assets` (autres langues)

**Exigences :**
- Le serveur de développement doit s'exécuter sur `http://localhost:8666`
- Les variables d'environnement doivent être définies :
  - `ADMIN_PASSWORD` : Mot de passe du compte admin
  - `USER_PASSWORD` : Mot de passe du compte utilisateur régulier

**Options :** `--locale` limite les captures d'écran à une ou plusieurs locales (séparées par des virgules). Si omis, toutes les locales sont capturées. Locales valides : `en`, `de`, `fr`, `es`, `pt-BR`. Utilisez `-h` ou `--help` pour afficher l'utilisation.

**Exemple :**

```bash
export ADMIN_PASSWORD="your-admin-password"
export USER_PASSWORD="your-user-password"
tsx scripts/take-screenshots.ts
# All locales (default):
tsx scripts/take-screenshots.ts
# Single locale:
tsx scripts/take-screenshots.ts --locale en
# Multiple locales:
tsx scripts/take-screenshots.ts --locale en,de,pt-BR
```

**Captures d'écran générées :**

Le script génère les captures d'écran suivantes (enregistrées dans `documentation/static/assets/` pour l'anglais, ou `documentation/i18n/{locale}/docusaurus-plugin-content-docs/current/assets` pour les autres langues) :

**Captures d'écran du tableau de bord :**
- `screen-main-dashboard-card-mode.png` - Tableau de bord en mode carte/vue d'ensemble
- `screen-main-dashboard-table-mode.png` - Tableau de bord en mode tableau
- `screen-overdue-backup-hover-card.png` - Carte/infobulle de sauvegarde en retard
- `screen-backup-tooltip.png` - Infobulle de sauvegarde standard (survol d'une sauvegarde en mode carte)
- `screen-dashboard-summary.png` - Section résumé du tableau de bord
- `screen-dashboard-summary-table.png` - Tableau de résumé du tableau de bord en mode tableau
- `screen-overview-side-status.png` - Panneau latéral de statut
- `screen-overview-side-charts.png` - Graphiques latéraux

**Captures d'écran des détails du serveur :**
- `screen-server-backup-list.png` - Page de liste des sauvegardes du serveur
- `screen-backup-history.png` - Section du tableau de l'historique des sauvegardes
- `screen-backup-detail.png` - Page de détail d'une sauvegarde individuelle
- `screen-metrics.png` - Graphique des métriques montrant les sauvegardes dans le temps
- `screen-available-backups-modal.png` - Modal des sauvegardes disponibles
- `screen-server-overdue-message.png` - Message de serveur en retard

**Captures d'écran de collecte/configuration :**
- `screen-collect-button-popup.png` - Popup de collecte des journaux de sauvegarde
- `screen-collect-button-right-click-popup.png` - Menu contextuel de collecte totale
- `screen-duplicati-configuration.png` - Menu déroulant de configuration Duplicati

**Captures d'écran des paramètres :**
- `screen-settings-left-panel-admin.png` - Barre latérale des paramètres (vue admin)
- `screen-settings-left-panel-non-admin.png` - Barre latérale des paramètres (vue non-admin)
- `screen-settings-{tab}.png` - Pages de paramètres individuelles pour chaque onglet :
  - `screen-settings-notifications.png`
  - `screen-settings-notifications-bulk.png`
  - `screen-settings-notifications-server.png`
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
  - `screen-settings-application-logs.png`

**Captures d'écran du menu utilisateur :**
- `screen-user-menu-admin.png` - Menu utilisateur (vue admin)
- `screen-user-menu-user.png` - Menu utilisateur (vue utilisateur standard)

## Traduire les fichiers SVG {#translate-svg-files}

La traduction SVG est incluse dans `pnpm run translate` par défaut (s'exécute après les documents). Le script `translate:svg` est destiné aux exécutions SVG uniquement (par exemple, quand seuls les SVG ont changé). Les deux traduisent le texte à l'intérieur des fichiers SVG (par exemple, les diagrammes de barre d'outils et de Tableau de bord) dans chaque locale, puis les exportent en PNG à l'aide d'Inkscape.

**Prérequis :** Interface de ligne de commande Inkscape (voir [Configuration du développement](setup#prerequisites)) ; `OPENROUTER_API_KEY` pour la traduction basée sur l'API (non requis pour `--dry-run` ou `--stats`).

**Utilisation rapide :**

```bash
cd documentation
pnpm translate:svg          # SVG-only
pnpm run translate          # Docs + SVGs (use --no-svg for docs only)
```

Pour le flux de travail de traduction complet (glossaire, traduction IA, cache, options, dépannage), voir [Translation Workflow](translation-workflow.md).

## Déploiement de la documentation {#deploying-the-documentation}

Pour déployer la documentation sur GitHub Pages, vous devrez générer un jeton d'accès personnel GitHub. Allez à [GitHub Personal Access Tokens](https://github.com/settings/tokens) et créez un nouveau jeton avec la portée `repo`.

Une fois le jeton obtenu, stockez-le dans le magasin d'informations d'identification Git (par exemple en utilisant `git config credential.helper store` ou le gestionnaire d'informations d'identification de votre système).

Ensuite, pour déployer la documentation sur GitHub Pages, exécutez la commande suivante depuis le répertoire `documentation` :

```bash
pnpm run deploy
```

Cela construira la documentation et la poussera vers la branche `gh-pages` du référentiel, et la documentation sera disponible à l'adresse [https://wsj-br.github.io/duplistatus/](https://wsj-br.github.io/duplistatus/).

## Travailler avec la documentation {#working-with-documentation}

Pour le flux de travail de traduction (glossaire, traduction IA, gestion du cache), voir [Flux de travail de traduction](translation-workflow.md).

- Les fichiers de documentation sont écrits en Markdown (`.md`) et situés dans `documentation/docs/`
- La navigation de la barre latérale est configurée dans `documentation/sidebars.ts`
- La configuration de Docusaurus se trouve dans `documentation/docusaurus.config.ts`
- Les composants React personnalisés peuvent être ajoutés à `documentation/src/components/`
- Les ressources statiques (images, PDF, etc.) vont dans `documentation/static/`
- La page d'accueil principale de la documentation est `documentation/docs/intro.md`, qui est utilisée comme source pour générer `README.md`
