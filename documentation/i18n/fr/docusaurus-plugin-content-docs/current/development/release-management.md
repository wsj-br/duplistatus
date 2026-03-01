---
translation_last_updated: '2026-03-01T00:16:11.463Z'
source_file_mtime: '2026-03-01T00:08:29.885Z'
source_file_hash: 717b94b8fdfe2364
translation_language: fr
source_file_path: development/release-management.md
---
# Gestion des versions {#release-management}

## Versioning (Semantic Versioning) {#versioning-semantic-versioning}

Le projet suit le Versioning Sémantique (SemVer) avec le format `MAJOR.MINOR.PATCH` :

- **Version MAJEURE** (x.0.0) : Quand vous apportez des modifications d'API incompatibles
- **Version MINEURE** (0.x.0) : Quand vous ajoutez des fonctionnalités de manière rétrocompatible
- **Version CORRECTIF** (0.0.x) : Quand vous apportez des corrections de bogues rétrocompatibles

## Liste de contrôle de pré-lancement {#pre-release-checklist}

Avant de publier une nouvelle version, assurez-vous d'avoir terminé les éléments suivants :

- [ ] Tous les changements sont validés et poussés vers la branche `vMAJOR.MINOR.x`.
- [ ] Le numéro de version est mis à jour dans `package.json` (utilisez `scripts/update-version.sh` pour le synchroniser dans tous les fichiers).
- [ ] Tous les tests réussissent (en mode développement, local, docker et podman).
- [ ] Démarrez un conteneur Docker avec `pnpm docker:up` et exécutez `scripts/compare-versions.sh` pour vérifier la cohérence des versions entre l'environnement de développement et le conteneur Docker (nécessite que le conteneur Docker soit en cours d'exécution). Ce script compare les versions SQLite par version majeure uniquement (par exemple, 3.45.1 et 3.51.1 sont considérées comme compatibles) et compare exactement les versions de Node, npm et duplistatus.
- [ ] La documentation est à jour, mettez à jour les captures d'écran (utilisez `pnpm take-screenshots`)
- [ ] Les notes de version sont préparées dans `documentation/docs/release-notes/VERSION.md`.
- [ ] Exécutez `scripts/generate-readme-from-intro.sh` pour mettre à jour `README.md` avec la nouvelle version et les modifications de `documentation/docs/intro.md`. Ce script génère également automatiquement `README_dockerhub.md` et `RELEASE_NOTES_github_VERSION.md`.

## Vue d'ensemble du processus de publication {#release-process-overview}

Le processus de publication recommandé utilise **GitHub Pull Requests and Releases** (voir ci-dessous). Cela offre une meilleure visibilité, des capacités d'examen et déclenche automatiquement les compilations d'images Docker. La méthode en ligne de commande est disponible comme alternative.

## Méthode 1 : Demande de tirage GitHub et publication (Recommandé) {#method-1-github-pull-request-and-release-recommended}

Ceci est la méthode préférée car elle offre une meilleure traçabilité et déclenche automatiquement les compilations Docker.

### Étape 1 : Créer une demande de tirage {#step-1-create-pull-request}

1. Accédez au [référentiel duplistatus](https://github.com/wsj-br/duplistatus) sur GitHub.
2. Cliquez sur l'onglet **« Pull requests »**.
3. Cliquez sur **« New pull request »**.
4. Définissez la **branche de base** sur `master` et la **branche de comparaison** sur `vMAJOR.MINOR.x`.
5. Vérifiez l'aperçu des modifications pour vous assurer que tout semble correct.
6. Cliquez sur **« Create pull request »**.
7. Ajouter un titre descriptif (par exemple, « Release v1.2.0 ») et une description résumant les modifications.
8. Cliquez à nouveau sur **« Create pull request »**.

### Étape 2 : Fusionner la demande d'extraction {#step-2-merge-the-pull-request}

Après examen de la demande de fusion :

1. S'il n'y a pas de conflits, cliquez sur le bouton vert **« Fusionner la demande de tirage »**.
2. Choisissez votre stratégie de fusion (généralement « Créer un commit de fusion »).
3. Confirmez la fusion.

### Étape 3 : Créer une version GitHub {#step-3-create-github-release}

Une fois la fusion terminée, créez une version GitHub :

1. Accédez au [référentiel duplistatus](https://github.com/wsj-br/duplistatus) sur GitHub.
2. Allez à la section **« Releases »** (ou cliquez sur « Releases » dans la barre latérale droite).
3. Cliquez sur **« Draft a new release »**.
4. Dans le champ **« Choose a tag »**, saisissez votre nouveau numéro de version au format `vMAJOR.MINOR.PATCH` (par exemple, `v1.2.0`). Cela créera une nouvelle étiquette.
5. Sélectionnez `master` comme branche cible.
6. Ajouter un **titre de version** (par exemple, « Release v1.2.0 »).
7. Ajouter une **description** documentant les modifications de cette version. Vous pouvez :
   - Copier le contenu de `RELEASE_NOTES_github_VERSION.md` (généré par `scripts/generate-readme-from-intro.sh`)
   - Ou référencer les notes de version de `documentation/docs/release-notes/` (notez que les liens relatifs ne fonctionneront pas dans les versions GitHub)
8. Cliquez sur **« Publish release »**.

**Ce qui se passe automatiquement :**
- Une nouvelle balise Git est créée
- Le workflow « Build and Publish Docker Image » est déclenché
- Les images Docker sont construites pour les architectures AMD64 et ARM64
- Les images sont envoyées vers :
  - Docker Hub : `wsjbr/duplistatus:VERSION` et `wsjbr/duplistatus:latest` (si c'est la dernière version)
  - GitHub Container Registry : `ghcr.io/wsj-br/duplistatus:VERSION` et `ghcr.io/wsj-br/duplistatus:latest` (si c'est la dernière version)

## Méthode 2 : Ligne de commande (Alternative) {#method-2-command-line-alternative}

Si vous préférez utiliser la ligne de commande, suivez ces étapes :

### Étape 1 : Mettre à jour la branche maître locale {#step-1-update-local-master-branch}

Assurez-vous que votre branche `master` locale est à jour :

```bash
# Checkout the master branch
git checkout master

# Pull the latest changes from the remote repository
git pull origin master
```

### Étape 2 : Fusionner la branche de développement {#step-2-merge-development-branch}

Fusionner la branche `vMAJOR.MINOR.x` dans `master` :

```bash
# Merge the vMAJOR.MINOR.x branch into master
git merge vMAJOR.MINOR.x
```

S'il y a des **conflits de fusion**, résolvez-les manuellement :
1. Modifiez les fichiers en conflit
2. Indexez les fichiers résolus : `git add <file>`
3. Complétez la fusion : `git commit`

### Étape 3 : Étiqueter la version {#step-3-tag-the-release}

Créer une étiquette annotée pour la nouvelle version :

```bash
# Create an annotated tag for the new version
git tag -a vMAJOR.MINOR.PATCH -m "Release vMAJOR.MINOR.PATCH - Brief description"
```

L'indicateur `-a` crée une balise annotée (recommandée pour les versions), et l'indicateur `-m` ajoute un message.

### Étape 4 : Pousser vers GitHub {#step-4-push-to-github}

Poussez à la fois la branche `master` mise à jour et la nouvelle étiquette :

```bash
# Push the updated master branch
git push origin master

# Push the new tag
git push origin vMAJOR.MINOR.PATCH
```

Vous pouvez également envoyer tous les tags à la fois : `git push --tags`

### Étape 5 : Créer une version GitHub {#step-5-create-github-release}

Après avoir poussé l'étiquette, créez une version GitHub (voir Méthode 1, Étape 3) pour déclencher le flux de travail de construction Docker.

## Construction manuelle d'image Docker {#manual-docker-image-build}

Pour déclencher manuellement le workflow de construction de l'image Docker sans créer de version :

1. Accédez au [référentiel duplistatus](https://github.com/wsj-br/duplistatus) sur GitHub.
2. Cliquez sur l'onglet **« Actions »**.
3. Sélectionnez le workflow **« Build and Publish Docker Image »**.
4. Cliquez sur **« Run workflow »**.
5. Sélectionnez la branche à partir de laquelle effectuer la compilation (généralement `master`).
6. Cliquez à nouveau sur **« Run workflow »**.

**Note :** Les builds manuels ne marqueront pas automatiquement les images avec le tag `latest` sauf si le workflow détermine qu'il s'agit de la dernière version.

## Publication de la documentation {#releasing-documentation}

La documentation est hébergée sur [GitHub Pages](https://wsj-br.github.io/duplistatus/) et est déployée séparément de la version de l'application. Suivez ces étapes pour publier la documentation mise à jour :

### Conditions préalables {#prerequisites}

1. Assurez-vous que vous disposez d'un jeton d'accès personnel GitHub avec la portée `repo`.
2. Configurez les identifiants Git (configuration unique) :

```bash
cd documentation
./setup-git-credentials.sh
```

Cela vous demandera votre jeton d'accès personnel GitHub et le stockera de manière sécurisée.

### Déployer la Documentation {#deploy-documentation}

1. Accédez au répertoire `documentation` :

```bash
cd documentation
```

2. Assurez-vous que tous les changements de documentation sont validés et poussés vers le référentiel.

3. Créer et déployer la documentation :

```bash
pnpm run deploy
```

Cette commande va :
- Construire le site de documentation Docusaurus
- Envoyer le site construit vers la branche `gh-pages`
- Rendre la documentation disponible à [https://wsj-br.github.io/duplistatus/](https://wsj-br.github.io/duplistatus/)

### Quand Déployer la Documentation {#when-to-deploy-documentation}

Déployer les mises à jour de la documentation :
- Après la fusion des modifications de documentation vers `master`
- Lors de la publication d'une nouvelle version (si la documentation a été mise à jour)
- Après des améliorations significatives de la documentation

**Note :** Le déploiement de la documentation est indépendant des versions de l'application. Vous pouvez déployer la documentation plusieurs fois entre les versions de l'application.

### Préparation des notes de version pour GitHub {#preparing-release-notes-for-github}

Le script `generate-readme-from-intro.sh` génère automatiquement les notes de version GitHub lors de son exécution. Il lit les notes de version depuis `documentation/docs/release-notes/VERSION.md` (où VERSION est extrait de `package.json`) et crée `RELEASE_NOTES_github_VERSION.md` à la racine du projet.

**Exemple :**

```bash
# This will generate README.md, README_dockerhub.md, and RELEASE_NOTES_github_VERSION.md
./scripts/generate-readme-from-intro.sh
```

Le fichier de notes de version généré peut être copié et collé directement dans la description de la version GitHub. Tous les liens et images fonctionneront correctement dans le contexte de la version GitHub.

**Note :** Le fichier généré est temporaire et peut être supprimé après la création de la version GitHub. Il est recommandé d'ajouter `RELEASE_NOTES_github_*.md` à `.gitignore` si vous ne souhaitez pas valider ces fichiers.

### Mettre à jour README.md {#update-readmemd}

Si vous avez apporté des modifications à `documentation/docs/intro.md`, régénérez le fichier `README.md` du référentiel :

```bash
./scripts/generate-readme-from-intro.sh
```

Ce script :
- Extrait la version de `package.json`
- Génère `README.md` à partir de `documentation/docs/intro.md` (convertit les admonitions Docusaurus en alertes de style GitHub, convertit les liens et les images)
- Crée `README_dockerhub.md` pour Docker Hub (avec un formatage compatible Docker Hub)
- Génère `RELEASE_NOTES_github_VERSION.md` à partir de `documentation/docs/release-notes/VERSION.md` (convertit les liens et les images en URL absolues)
- Met à jour la table des matières en utilisant `doctoc`

Validez et envoyez le fichier `README.md` mis à jour avec votre version.
