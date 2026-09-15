# Gestion des versions {/* #release-management */}

## Versioning (Semantic Versioning) {/* #versioning-semantic-versioning */}

Le projet suit la version sémantique (SemVer) avec le format `MAJOR.MINOR.PATCH` :

- **MAJOR** version (x.0.0) : Lorsque vous apportez des modifications d'API incompatibles
- **MINOR** version (0.x.0) : Lorsque vous ajoutez des fonctionnalités de manière compatible en arrière
- **PATCH** version (0.0.x) : Lorsque vous corrigez des bugs de manière compatible en arrière

## Liste de contrôle avant la version {/* #pre-release-checklist */}

Avant de publier une nouvelle version, assurez-vous d'avoir terminé les éléments suivants :

- [ ] Toutes les modifications sont validées et poussées vers la branche `vMAJOR.MINOR.x`.
- [ ] Le numéro de version est mis à jour dans `package.json` (utilisez `scripts/update-version.sh` pour le synchroniser entre les fichiers).
- [ ] Tous les tests passent (en mode développement, local, docker et podman).
- [ ] Démarrez un conteneur Docker avec `pnpm docker:up` et exécutez `scripts/compare-versions.sh` pour vérifier la cohérence des versions entre l'environnement de développement et le conteneur Docker (nécessite que le conteneur Docker soit en cours d'exécution). Ce script compare les versions SQLite par version majeure uniquement (par exemple, 3.45.1 vs 3.51.1 sont considérés comme compatibles), et compare exactement les versions de Node, npm et Duplistatus.
- [ ] La documentation est à jour, mettez à jour les captures d'écran (utilisez `pnpm take-screenshots`)
- [ ] Les notes de version sont préparées dans `documentation/docs/release-notes/VERSION.md`.
- [ ] Exécutez `scripts/generate-readme-from-intro.sh` pour mettre à jour `README.md` avec la nouvelle version et toutes les modifications de `documentation/docs/intro.md`. Ce script génère également automatiquement `README_dockerhub.md` et `RELEASE_NOTES_github_VERSION.md`.

## Aperçu du processus de version {/* #release-process-overview */}

Le processus de version recommandé utilise **GitHub Pull Requests et Releases** (voir ci-dessous). Cela offre une meilleure visibilité, des capacités de révision et déclenche automatiquement les builds d'images Docker. La méthode en ligne de commande est disponible en tant qu'alternative.

## Méthode 1 : GitHub Pull Request et Release (Recommandé) {/* #method-1-github-pull-request-and-release-recommended */}

C'est la méthode préférée car elle offre une meilleure traçabilité et déclenche automatiquement les builds Docker.

### Étape 1 : Créer une Pull Request {/* #step-1-create-pull-request */}

1. Accédez au [dépôt duplistatus](https://github.com/wsj-br/duplistatus) sur GitHub.
2. Cliquez sur l'onglet **"Pull requests"**.
3. Cliquez sur **"New pull request"**.
4. Définissez la **branche de base** sur `master` et la **branche de comparaison** sur `vMAJOR.MINOR.x`.
5. Examinez l'aperçu des modifications pour vous assurer que tout semble correct.
6. Cliquez sur **"Create pull request"**.
7. Ajoutez un titre descriptif (par exemple, "Release v1.2.0") et une description résumant les modifications.
8. Cliquez à nouveau sur **"Create pull request"**.

### Étape 2 : Fusionner la Pull Request {/* #step-2-merge-the-pull-request */}

Après avoir examiné la pull request :

1. Si aucune conflit n'existe, cliquez sur le bouton vert **"Merge pull request"**.
2. Choisissez votre stratégie de fusion (généralement "Create a merge commit").
3. Confirmez la fusion.

### Étape 3 : Créer une Release GitHub {/* #step-3-create-github-release */}

Une fois la fusion terminée, créez une release GitHub :

1. Accédez au dépôt [duplistatus](https://github.com/wsj-br/duplistatus) sur GitHub.
2. Allez à la section **"Releases"** (ou cliquez sur "Releases" dans la barre latérale droite).
3. Cliquez sur **"Draft a new release."**
4. Dans le champ **"Choose a tag"**, saisissez votre nouveau numéro de version au format `vMAJOR.MINOR.PATCH` (par exemple, `v1.2.0`). Cela créera une nouvelle étiquette.
5. Sélectionnez `master` comme branche cible.
6. Ajoutez un **titre de version** (par exemple, "Release v1.2.0").
7. Ajoutez une **description** documentant les modifications de cette version. Vous pouvez :
   - Copier le contenu de `RELEASE_NOTES_github_VERSION.md` (généré par `scripts/generate-readme-from-intro.sh`)
   - Ou faire référence aux notes de version de `documentation/docs/release-notes/` (mais notez que les liens relatifs ne fonctionneront pas dans les versions GitHub)
8. Cliquez sur **"Publish release."**

**Ce qui se passe automatiquement :**
- Une nouvelle étiquette Git est créée
- Le flux de travail "Build and Publish Docker Image" est déclenché
- Les images Docker sont construites pour les architectures AMD64 et ARM64
- Les images sont poussées vers :
  - Docker Hub : `wsjbr/duplistatus:VERSION` et `wsjbr/duplistatus:latest` (si c'est la dernière version)
  - GitHub Container Registry : `ghcr.io/wsj-br/duplistatus:VERSION` et `ghcr.io/wsj-br/duplistatus:latest` (si c'est la dernière version)

## Méthode 2 : Ligne de commande (Alternative) {/* #method-2-command-line-alternative */}

Si vous préférez utiliser la ligne de commande, suivez ces étapes :

### Étape 1 : Mettre à jour la branche locale master {/* #step-1-update-local-master-branch */}

Assurez-vous que votre branche locale `master` est à jour :

```bash
# Checkout the master branch
git checkout master

# Pull the latest changes from the remote repository
git pull origin master
```

### Étape 2 : Fusionner la branche de développement {/* #step-2-merge-development-branch */}

Fusionnez la branche `vMAJOR.MINOR.x` dans `master` :

```bash
# Merge the vMAJOR.MINOR.x branch into master
git merge vMAJOR.MINOR.x
```

Si des **conflits de fusion** surviennent, résolvez-les manuellement :
1. Modifiez les fichiers en conflit
2. Ajoutez les fichiers résolus : `git add <file>`
3. Terminez la fusion : `git commit`

### Étape 3 : Taguer la version {/* #step-3-tag-the-release */}

Créez une étiquette annotée pour la nouvelle version :

```bash
# Create an annotated tag for the new version
git tag -a vMAJOR.MINOR.PATCH -m "Release vMAJOR.MINOR.PATCH - Brief description"
```

Le flag `-a` crée une étiquette annotée (recommandé pour les versions), et le flag `-m` ajoute un message.

### Étape 4 : Pousser vers GitHub {/* #step-4-push-to-github */}

Poussez à la fois la branche `master` mise à jour et la nouvelle étiquette :

```bash
# Push the updated master branch
git push origin master

# Push the new tag
git push origin vMAJOR.MINOR.PATCH
```

Alternativement, poussez toutes les étiquettes d'un coup : `git push --tags`

### Étape 5 : Créer une version GitHub {/* #step-5-create-github-release */}

Après avoir poussé l'étiquette, créez une version GitHub (voir Méthode 1, Étape 3) pour déclencher le flux de travail de construction Docker.

## Construction manuelle d'une image Docker {/* #manual-docker-image-build */}

Pour déclencher manuellement le workflow de construction d'image Docker sans créer de release :

1. Accédez au [dépôt duplistatus](https://github.com/wsj-br/duplistatus) sur GitHub.
2. Cliquez sur l'onglet **"Actions"**.
3. Sélectionnez le workflow **"Build and Publish Docker Image"**.
4. Cliquez sur **"Run workflow"**.
5. Sélectionnez la branche à partir de laquelle construire (généralement `master`).
6. Cliquez à nouveau sur **"Run workflow"**.

**Remarque :** Les constructions manuelles ne taggeront pas automatiquement les images comme `latest` sauf si le workflow détermine qu'il s'agit de la dernière release.

## Publication de la documentation {/* #releasing-documentation */}

La documentation est hébergée sur [GitHub Pages](https://wsj-br.github.io/duplistatus/) et est déployée séparément de la release de l'application. Suivez ces étapes pour publier une documentation mise à jour :

### Prérequis {/* #prerequisites */}

1. Assurez-vous d'avoir un jeton d'accès personnel GitHub avec la portée `repo`.
2. Configurez les identifiants Git (configuration unique) :

```bash
cd documentation
./setup-git-credentials.sh
```

Cela vous demandera votre jeton d'accès personnel GitHub et le stockera en toute sécurité.

### Déployer la documentation {/* #deploy-documentation */}

1. Accédez au répertoire `documentation` :

```bash
cd documentation
```

2. Assurez-vous que tous les changements de documentation sont validés et poussés vers le dépôt.

3. Construisez et déployez la documentation :

```bash
pnpm run deploy
```

Cette commande va :
- Construire le site de documentation Docusaurus
- Pousser le site construit vers la branche `gh-pages`
- Rendre la documentation disponible sur [https://wsj-br.github.io/duplistatus/](https://wsj-br.github.io/duplistatus/)

### Quand déployer la documentation {/* #when-to-deploy-documentation */}

Déployez les mises à jour de la documentation :
- Après avoir fusionné les changements de documentation vers `master`
- Lors de la publication d'une nouvelle version (si la documentation a été mise à jour)
- Après des améliorations significatives de la documentation

**Remarque :** Le déploiement de la documentation est indépendant des releases de l'application. Vous pouvez déployer la documentation plusieurs fois entre les releases de l'application.

### Préparation des notes de release pour GitHub {/* #preparing-release-notes-for-github */}

Le script `generate-readme-from-intro.sh` génère automatiquement les notes de release GitHub lorsqu'il est exécuté. Il lit les notes de release depuis `documentation/docs/release-notes/VERSION.md` (où VERSION est extraite de `package.json`) et crée `RELEASE_NOTES_github_VERSION.md` à la racine du projet.

**Exemple :**

```bash
# This will generate README.md, README_dockerhub.md, and RELEASE_NOTES_github_VERSION.md
./scripts/generate-readme-from-intro.sh
```

Le fichier de notes de version généré peut être copié et collé directement dans la description de la version GitHub. Tous les liens et les images fonctionneront correctement dans le contexte de la version GitHub.

**Remarque :** Le fichier généré est temporaire et peut être supprimé après la création de la version GitHub. Il est recommandé d'ajouter `RELEASE_NOTES_github_*.md` à `.gitignore` si vous ne souhaitez pas valider ces fichiers.

### Mettre à jour README.md {/* #update-readmemd */}

Si vous avez apporté des modifications à `documentation/docs/intro.md`, régénérez le dépôt `README.md` :

```bash
./scripts/generate-readme-from-intro.sh
```

Ce script :
- Extrait la version de `package.json`
- Génère `README.md` à partir de `documentation/docs/intro.md` (convertit les avertissements Docusaurus en alertes au style GitHub, convertit les liens et les images)
- Crée `README_dockerhub.md` pour Docker Hub (avec un formatage compatible Docker Hub)
- Génère `RELEASE_NOTES_github_VERSION.md` à partir de `documentation/docs/release-notes/VERSION.md` (convertit les liens et les images en URLs absolues)
- Met à jour la table des matières en utilisant `doctoc`

Validez et poussez les mises à jour de `README.md` avec votre version.
