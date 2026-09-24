# Gestion des versions {/* #release-management */}

## Versioning (Semantic Versioning) {/* #versioning-semantic-versioning */}

Le projet suit la Semantic Versioning (SemVer) avec le format `MAJOR.MINOR.PATCH` :

- **MAJOR** version (x.0.0) : Quand vous apportez des modifications incompatibles à l'API
- **MINOR** version (0.x.0) : Quand vous ajoutez des fonctionnalités de manière rétrocompatible
- **PATCH** version (0.0.x) : Quand vous corrigez des bugs de manière rétrocompatible

## Liste de contrôle avant la version {/* #pre-release-checklist */}

Avant de publier une nouvelle version, assurez-vous d'avoir complété les éléments suivants :

- [ ] Tous les changements sont validés et poussés vers la branche `vMAJOR.MINOR.x`.
- [ ] Le numéro de version est mis à jour dans `package.json` (utilisez `scripts/update-version.sh` pour le synchroniser dans tous les fichiers).
- [ ] Tous les tests réussissent (en mode devel, local, docker et podman).
- [ ] Démarrez un conteneur Docker avec `pnpm docker:up` et exécutez `scripts/compare-versions.sh` pour vérifier la cohérence des versions entre l'environnement de développement et le conteneur Docker (nécessite que le conteneur Docker soit en cours d'exécution). Ce script compare les versions SQLite par version majeure uniquement (par exemple, 3.45.1 et 3.51.1 sont considérées comme compatibles) et compare exactement les versions de Node, npm et Duplistatus.
- [ ] La documentation est à jour, mettez à jour les captures d'écran (utilisez `pnpm take-screenshots`)
- [ ] Les notes de version sont préparées dans `documentation/docs/release-notes/VERSION.md`.
- [ ] Exécutez `scripts/generate-readme-from-intro.sh` pour mettre à jour `README.md` avec la nouvelle version et tous les changements de `documentation/docs/intro.md`. Ce script génère également automatiquement `README_dockerhub.md` et `RELEASE_NOTES_github_VERSION.md`.

## Aperçu du processus de publication {/* #release-process-overview */}

Le processus de publication recommandé utilise les **demandes de tirage et les versions GitHub** (voir ci-dessous). Cela offre une meilleure visibilité, des capacités d'examen et déclenche automatiquement les compilations d'images Docker. La méthode en ligne de commande est disponible comme alternative.

## Méthode 1 : Demande de tirage et version GitHub (Recommandé) {/* #method-1-github-pull-request-and-release-recommended */}

C'est la méthode préférée car elle offre une meilleure traçabilité et déclenche automatiquement les compilations Docker.

### Étape 1 : Créer une demande de tirage {/* #step-1-create-pull-request */}

1. Accédez au [référentiel duplistatus](https://github.com/wsj-br/duplistatus) sur GitHub.
2. Cliquez sur l'onglet **« Demandes de tirage »**.
3. Cliquez sur **« Nouvelle demande de tirage »**.
4. Définissez la **branche de base** sur `master` et la **branche de comparaison** sur `vMAJOR.MINOR.x`.
5. Vérifiez l'aperçu des changements pour vous assurer que tout semble correct.
6. Cliquez sur **« Créer une demande de tirage »**.
7. Ajoutez un titre descriptif (par exemple, « Release v1.2.0 ») et une description résumant les changements.
8. Cliquez à nouveau sur **« Créer une demande de tirage »**.

### Étape 2 : Fusionner la demande de tirage {/* #step-2-merge-the-pull-request */}

Après avoir examiné la demande de tirage :

1. S'il n'y a pas de conflits, cliquez sur le bouton vert **« Fusionner la demande de tirage »**.
2. Choisissez votre stratégie de fusion (généralement « Créer un commit de fusion »).
3. Confirmez la fusion.

### Étape 3 : Créer une version GitHub {/* #step-3-create-github-release */}

Une fois la fusion terminée, créez une version GitHub :

1. Accédez au [référentiel duplistatus](https://github.com/wsj-br/duplistatus) sur GitHub.
2. Allez à la section **« Versions »** (ou cliquez sur « Versions » dans la barre latérale droite).
3. Cliquez sur **« Créer une nouvelle version »**.
4. Dans le champ **« Choisir une étiquette »**, tapez votre nouveau numéro de version au format `vMAJOR.MINOR.PATCH` (par exemple, `v1.2.0`). Cela créera une nouvelle étiquette.
5. Sélectionnez `master` comme branche cible.
6. Ajoutez un **titre de version** (par exemple, "Release v1.2.0").
7. Ajoutez une **description** documentant les modifications apportées dans cette version. Vous pouvez :
   - Copier le contenu depuis `RELEASE_NOTES_github_VERSION.md` (généré par `scripts/generate-readme-from-intro.sh`)
   - Ou référencer les notes de version depuis `documentation/docs/release-notes/` (mais notez que les liens relatifs ne fonctionneront pas dans les versions GitHub)
8. Cliquez sur **"Publier la version."**

**Ce qui se passe automatiquement :**
- Une nouvelle étiquette Git est créée
- Le flux de travail « Créer et publier l'image Docker » est déclenché
- Les images Docker sont créées pour les architectures AMD64 et ARM64
- Les images sont envoyées vers :
  - Docker Hub : `wsjbr/duplistatus:VERSION` et `wsjbr/duplistatus:latest` (s'il s'agit de la dernière version)
  - Registre de conteneurs GitHub : `ghcr.io/wsj-br/duplistatus:VERSION` et `ghcr.io/wsj-br/duplistatus:latest` (s'il s'agit de la dernière version)

## Méthode 2 : Ligne de commande (Alternative) {/* #method-2-command-line-alternative */}

À partir du commit qui doit être publié (généralement `master`, déjà poussé), avec un arbre de travail propre et `documentation/docs/release-notes/VERSION.md` en place :

```bash
pnpm release:github:dry   # print the planned tag, notes file, and gh command
pnpm release:github       # generate GitHub notes, tag vVERSION at HEAD, publish the release, and deploy the docs
```

`scripts/release.mjs` lit la version depuis `package.json`, exécute `scripts/generate-readme-from-intro.sh` (afin que `RELEASE_NOTES_github_VERSION.md` contienne des liens absolus) et crée la release GitHub. Sa publication démarre le workflow de l'image Docker. Le script exécute ensuite `pnpm run deploy` dans `documentation/` pour compiler le site Docusaurus et le pousser vers `gh-pages`. Si le tag `vVERSION` ou cette release GitHub existe déjà, le script les supprime et recrée le tag sur le HEAD actuel. Transmettez `--verify-clean=false` pour ignorer les vérifications de l'arbre propre.

Les étapes ci-dessous correspondent aux mêmes opérations exécutées manuellement.

### Étape 1 : Mettre à jour la branche principale locale {/* #step-1-update-local-master-branch */}

Assurez-vous que votre branche `master` locale est à jour :

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

S'il y a des **conflits de fusion**, résolvez-les manuellement :
1. Modifiez les fichiers en conflit
2. Indexez les fichiers résolus : `git add <file>`
3. Complétez la fusion : `git commit`

### Étape 3 : Étiqueter la version {/* #step-3-tag-the-release */}

Créez une étiquette annotée pour la nouvelle version :

```bash
# Create an annotated tag for the new version
git tag -a vMAJOR.MINOR.PATCH -m "Release vMAJOR.MINOR.PATCH - Brief description"
```

L'indicateur `-a` crée une étiquette annotée (recommandée pour les versions), et l'indicateur `-m` ajoute un message.

### Étape 4 : Envoyer vers GitHub {/* #step-4-push-to-github */}

Envoyez à la fois la branche `master` mise à jour et la nouvelle étiquette :

```bash
# Push the updated master branch
git push origin master

# Push the new tag
git push origin vMAJOR.MINOR.PATCH
```

Vous pouvez également envoyer toutes les étiquettes à la fois : `git push --tags`

### Étape 5 : Créer une version GitHub {/* #step-5-create-github-release */}

Après avoir envoyé l'étiquette, créez une version GitHub (voir Méthode 1, Étape 3) pour déclencher le flux de travail de création Docker.

## Construction manuelle d'une image Docker {/* #manual-docker-image-build */}

Pour déclencher manuellement le workflow de construction d'une image Docker sans créer de version :

1. Accédez au [référentiel duplistatus](https://github.com/wsj-br/duplistatus) sur GitHub.
2. Cliquez sur l'onglet **« Actions »**.
3. Sélectionnez le workflow **« Build and Publish Docker Image »**.
4. Cliquez sur **« Run workflow »**.
5. Sélectionnez la branche à partir de laquelle effectuer la construction (généralement `master`).
6. Cliquez à nouveau sur **« Run workflow »**.

**Remarque :** Les constructions manuelles ne marqueront pas automatiquement les images comme `latest` sauf si le workflow détermine qu'il s'agit de la dernière version.

## Publication de la documentation {/* #releasing-documentation */}

La documentation est hébergée sur [GitHub Pages](https://wsj-br.github.io/duplistatus/). `pnpm release:github` la déploie après la publication de la release GitHub. Pour mettre à jour le site entre les releases de l'application, suivez ces étapes :

### Conditions préalables {/* #prerequisites */}

1. Assurez-vous que vous disposez d'un jeton d'accès personnel GitHub avec la portée `repo`.
2. Configurez les identifiants Git (configuration unique) :

```bash
cd documentation
./setup-git-credentials.sh
```

Cela vous demandera votre jeton d'accès personnel GitHub et le stockera de manière sécurisée.

### Déployer la documentation {/* #deploy-documentation */}

1. Accédez au répertoire `documentation` :

```bash
cd documentation
```

2. Assurez-vous que toutes les modifications de la documentation sont validées et envoyées au référentiel.

3. Construisez et déployez la documentation :

```bash
pnpm run deploy
```

Cette commande :
- Construit le site de documentation Docusaurus
- Envoie le site construit à la branche `gh-pages`
- Rend la documentation disponible à l'adresse [https://wsj-br.github.io/duplistatus/](https://wsj-br.github.io/duplistatus/)

### Quand déployer la documentation {/* #when-to-deploy-documentation */}

Déployez les mises à jour de la documentation :
- Après la fusion des modifications de documentation vers `master`
- Lors de la publication d'une nouvelle version (si la documentation a été mise à jour)
- Après des améliorations significatives de la documentation

**Remarque :** Le déploiement de la documentation est indépendant des versions de l'application. Vous pouvez déployer la documentation plusieurs fois entre les versions de l'application.

### Préparation des notes de version pour GitHub {/* #preparing-release-notes-for-github */}

Le script `generate-readme-from-intro.sh` génère automatiquement les notes de version GitHub lors de son exécution. Il lit les notes de version à partir de `documentation/docs/release-notes/VERSION.md` (où VERSION est extrait de `package.json`) et crée `RELEASE_NOTES_github_VERSION.md` à la racine du projet.

**Exemple :**

```bash
# This will generate README.md, README_dockerhub.md, and RELEASE_NOTES_github_VERSION.md
./scripts/generate-readme-from-intro.sh
```

Le fichier de notes de version généré peut être copié et collé directement dans la description de la version GitHub. Tous les liens et les images fonctionneront correctement dans le contexte de la version GitHub.

**Remarque :** Le fichier généré est temporaire et peut être supprimé après la création de la version GitHub. Il est recommandé d'ajouter `RELEASE_NOTES_github_*.md` à `.gitignore` si vous ne souhaitez pas valider ces fichiers.

### Mettre à jour README.md {/* #update-readmemd */}

Si vous avez apporté des modifications à `documentation/docs/intro.md`, régénérez le référentiel `README.md` :

```bash
./scripts/generate-readme-from-intro.sh
```

Ce script :
- Extrait la version de `package.json`
- Génère `README.md` à partir de `documentation/docs/intro.md` (convertit les admonitions Docusaurus en alertes de style GitHub, convertit les liens et les images)
- Crée `README_dockerhub.md` pour Docker Hub (avec formatage compatible Docker Hub)
- Génère `RELEASE_NOTES_github_VERSION.md` à partir de `documentation/docs/release-notes/VERSION.md` (convertit les liens et les images en URL absolues)
- Met à jour la table des matières en utilisant `doctoc`

Validez et poussez le `README.md` mis à jour avec votre version.
