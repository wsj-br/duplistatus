# Gestion des versions {#release-management}

## Versioning (Semantic Versioning) {#versioning-semantic-versioning}

Le projet suit la Versioning Sémantique (SemVer) avec le format `MAJOR.MINOR.PATCH`:

- **MAJOR** Version (x.0.0): Quand vous apportez des modifications d'API incompatibles
- **MINOR** Version (0.x.0): Quand vous Ajouter des fonctionnalités de manière rétrocompatible
- **PATCH** Version (0.0.x): Quand vous apportez des corrections de bogues rétrocompatibles

## Liste de contrôle de pré-version {#pre-release-checklist}

Avant de publier une nouvelle Version, assurez-vous d'avoir Terminé les éléments suivants:

- [ ] Tous les changements sont validés et poussés vers la branche `vMAJOR.MINOR.x`.
- [ ] Le numéro de Version est mis à jour dans `package.json` (utilisez `scripts/update-version.sh` pour le synchroniser dans les Fichiers).
- [ ] Tous les tests réussissent (en mode devel, local, docker et podman).
- [ ] Démarrez un conteneur Docker avec `pnpm docker-up` et exécutez `scripts/compare-versions.sh` pour Vérifier la cohérence des Versions entre l'environnement de développement et le conteneur Docker (nécessite que le conteneur Docker soit en cours d'exécution). Ce script compare les Versions SQLite par Version majeure uniquement (par exemple, 3.45.1 par rapport à 3.51.1 sont considérés comme compatibles), et compare exactement les Versions Node, npm et duplistatus.
- [ ] La documentation est à jour, mettez à jour les captures d'écran (utilisez `pnpm take-screenshots`)
- [ ] Les Notes de version sont préparées dans `documentation/docs/release-notes/VERSION.md`.
- [ ] Exécutez `scripts/generate-readme-from-intro.sh` pour mettre à jour `README.md` avec la nouvelle Version et tous les changements de `documentation/docs/intro.md`. Ce script génère également automatiquement `README_dockerhub.md` et `RELEASE_NOTES_github_VERSION.md`.

## Aperçu du processus de version {#release-process-overview}

Le processus de version recommandé utilise **GitHub Pull Requests and Releases** (voir ci-dessous). Cela offre une meilleure visibilité, des capacités d'examen et déclenche automatiquement les builds d'images Docker. La méthode en ligne de commande est disponible comme alternative.

## Méthode 1: GitHub Pull Request and Release (Recommandé) {#method-1-github-pull-request-and-release-recommended}

C'est la méthode préférée car elle offre une meilleure traçabilité et déclenche automatiquement les builds Docker.

### Étape 1: Créer une Pull Request {#step-1-create-pull-request}

1. Accédez au [référentiel duplistatus](https://github.com/wsj-br/duplistatus) sur GitHub.
2. Cliquez sur l'onglet **"Pull requests"**.
3. Cliquez sur **"New pull request."**
4. Définissez la **branche de base** sur `master` et la **branche de comparaison** sur `vMAJOR.MINOR.x`.
5. Examinez l'aperçu des modifications pour vous assurer que tout semble correct.
6. Cliquez sur **"Create pull request."**
7. Ajouter un Titre descriptif (par exemple, "Release v1.2.0") et une Description résumant les modifications.
8. Cliquez sur **"Create pull request"** à nouveau.

### Étape 2: Fusionner la Pull Request {#step-2-merge-the-pull-request}

Après examen de la pull request:

1. S'il n'y a Non de conflits, cliquez sur le bouton vert **"Merge pull request"**.
2. Choisissez votre stratégie de fusion (généralement "Create a merge commit").
3. Confirmer la fusion.

### Étape 3: Créer une version GitHub {#step-3-create-github-release}

Une fois la fusion terminée, créez une version GitHub:

1. Accédez au [référentiel duplistatus](https://github.com/wsj-br/duplistatus) sur GitHub.
2. Allez à la section **"Releases"** (ou cliquez sur "Releases" dans la barre latérale droite).
3. Cliquez sur **"Draft a new release."**
4. Dans le champ **"Choose a tag"**, tapez votre nouveau numéro de Version au format `vMAJOR.MINOR.PATCH` (par exemple, `v1.2.0`). Cela créera une nouvelle balise.
5. Sélectionner `master` comme branche cible.
6. Ajouter un **Titre de version** (par exemple, "Release v1.2.0").
7. Ajouter une **Description** documentant les modifications dans cette Version. Vous pouvez:
   - Copier le contenu de `RELEASE_NOTES_github_VERSION.md` (généré par `scripts/generate-readme-from-intro.sh`)
   - Ou référencer les Notes de version de `documentation/docs/release-notes/` (notez que les liens relatifs ne fonctionneront pas dans les versions GitHub)
8. Cliquez sur **"Publish release."**

**Ce qui se passe automatiquement:**

- Une nouvelle balise Git est Créée
- Le workflow "Build and Publish Docker Image" est déclenché
- Les images Docker sont construites pour les architectures AMD64 et ARM64
- Les images sont poussées vers:
  - Docker Hub: `wsjbr/duplistatus:VERSION` et `wsjbr/duplistatus:latest` (si c'est la dernière version)
  - GitHub Container Registry: `ghcr.io/wsj-br/duplistatus:VERSION` et `ghcr.io/wsj-br/duplistatus:latest` (si c'est la dernière version)

## Méthode 2: Ligne de commande (Alternative) {#method-2-command-line-alternative}

Si vous préférez utiliser la ligne de commande, suivez ces étapes:

### Étape 1: Mettre à jour la branche Master locale {#step-1-update-local-master-branch}

Assurez-vous que votre branche `master` locale est à jour:

```bash
# Checkout the master branch {#checkout-the-master-branch}
git checkout master

# Pull the latest changes from the remote repository {#pull-the-latest-changes-from-the-remote-repository}
git pull origin master
```

### Étape 2: Fusionner la branche de développement {#step-2-merge-development-branch}

Fusionnez la branche `vMAJOR.MINOR.x` dans `master`:

```bash
# Merge the vMAJOR.MINOR.x branch into master {#merge-the-vmajorminorx-branch-into-master}
git merge vMAJOR.MINOR.x
```

S'il y a des **conflits de fusion**, résolvez-les manuellement:

1. Modifier les Fichiers en conflit
2. Préparer les Fichiers résolus: `git add <file>`
3. Terminer la fusion: `git commit`

### Étape 3: Marquer la version {#step-3-tag-the-release}

Créez une balise annotée pour la nouvelle Version:

```bash
# Create an annotated tag for the new version {#create-an-annotated-tag-for-the-new-version}
git tag -a vMAJOR.MINOR.PATCH -m "Release vMAJOR.MINOR.PATCH - Brief Description"
```

Le drapeau `-a` crée une balise annotée (recommandée pour les versions), et le drapeau `-m` Ajoute un Messages.

### Étape 4: Pousser vers GitHub {#step-4-push-to-github}

Poussez à la fois la branche `master` mise à jour et la nouvelle balise:

```bash
# Push the updated master branch {#push-the-updated-master-branch}
git push origin master

# Push the new tag {#push-the-new-tag}
git push origin vMAJOR.MINOR.PATCH
```

Alternativement, poussez Tous les balises à la fois: `git push --tags`

### Étape 5: Créer une version GitHub {#step-5-create-github-release}

Après avoir poussé la balise, créez une version GitHub (voir Méthode 1, Étape 3) pour déclencher le workflow de build Docker.

## Build manuel d'image Docker {#manual-docker-image-build}

Pour déclencher manuellement le workflow de build d'image Docker sans créer de version:

1. Accédez au [référentiel duplistatus](https://github.com/wsj-br/duplistatus) sur GitHub.
2. Cliquez sur l'onglet **"Actions"**.
3. Sélectionner le workflow **"Build and Publish Docker Image"**.
4. Cliquez sur **"Run workflow"**.
5. Sélectionner la branche à construire (généralement `master`).
6. Cliquez sur **"Run workflow"** à nouveau.

**Remarque:** Les builds manuels ne marqueront pas automatiquement les images comme `latest` sauf si le workflow détermine que c'est la dernière version.

## Libération de la documentation {#releasing-documentation}

La documentation est hébergée sur [GitHub Pages](https://wsj-br.github.io/duplistatus/) et est déployée séparément de la version de l'application. Suivez ces étapes pour publier la documentation mise à jour:

### Conditions préalables {#prerequisites}

1. Assurez-vous que vous disposez d'un jeton d'accès personnel GitHub avec la portée `repo`.
2. Configurez les identifiants Git (configuration unique):

```bash
cd documentation
./setup-git-credentials.sh
```

Cela vous demandera votre jeton d'accès personnel GitHub et le stockera de manière sécurisée.

### Déployer la documentation {#deploy-documentation}

1. Accédez au répertoire `documentation`:

```bash
cd documentation
```

2. Assurez-vous que Tous les modifications de documentation sont validées et poussées vers le référentiel.

3. Construire et déployer la documentation:

```bash
pnpm run deploy
```

Cette commande va:

- Construire le site de documentation Docusaurus
- Pousser le site construit vers la branche `gh-pages`
- Rendre la documentation disponible à [https://wsj-br.github.io/duplistatus/](https://wsj-br.github.io/duplistatus/)

### Quand déployer la documentation {#when-to-deploy-documentation}

Déployer les mises à jour de documentation:

- Après fusion des modifications de documentation vers `master`
- Lors de la publication d'une nouvelle Version (si la documentation a été mise à jour)
- Après des améliorations significatives de la documentation

**Remarque:** Le déploiement de la documentation est indépendant des versions d'application. Vous pouvez déployer la documentation plusieurs fois entre les versions d'application.

### Préparation des Notes de version pour GitHub {#preparing-release-notes-for-github}

Le script `generate-readme-from-intro.sh` génère automatiquement les Notes de version GitHub lors de son exécution. Il lit les Notes de version de `documentation/docs/release-notes/VERSION.md` (où VERSION est extrait de `package.json`) et crée `RELEASE_NOTES_github_VERSION.md` à la racine du projet.

**Exemple:**

```bash
# This will generate README.md, README_dockerhub.md, and RELEASE_NOTES_github_VERSION.md {#this-will-generate-readmemd-readme_dockerhubmd-and-release_notes_github_versionmd}
./scripts/generate-readme-from-intro.sh
```

Le Fichier de Notes de version généré peut être copié et collé directement dans la Description de la version GitHub. Tous les liens et images fonctionneront correctement dans le contexte de la version GitHub.

**Remarque:** Le Fichier généré est temporaire et peut être supprimé après la création de la version GitHub. Il est recommandé d'Ajouter `RELEASE_NOTES_github_*.md` à `.gitignore` si vous ne voulez pas valider ces Fichiers.

### Mettre à jour README.md {#update-readmemd}

Si vous avez apporté des modifications à `documentation/docs/intro.md`, régénérez le `README.md` du référentiel:

```bash
./scripts/generate-readme-from-intro.sh
```

Ce script:

- Extrait la Version de `package.json`
- Génère `README.md` à partir de `documentation/docs/intro.md` (convertit les admonitions Docusaurus en Alertes de style GitHub, convertit les liens et les images)
- Crée `README_dockerhub.md` pour Docker Hub (avec formatage compatible Docker Hub)
- Génère `RELEASE_NOTES_github_VERSION.md` à partir de `documentation/docs/release-notes/VERSION.md` (convertit les liens et les images en URL absolues)
- Met à jour la table de matières en utilisant `doctoc`

Validez et poussez le `README.md` mis à jour avec votre version.
