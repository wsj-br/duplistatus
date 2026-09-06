# Configuration de développement {#development-setup}

## Conditions préalables {#prerequisites}

- Docker / Docker Compose
- Node.js (voir `engines.node` dans `package.json`)
- pnpm (voir `engines.pnpm` / `packageManager` dans `package.json`)
- SQLite3
- Inkscape (pour la traduction de documentation SVG et l'export PNG ; requis uniquement si vous exécutez `translate` ou `translate:svg`)
- bat/batcat (pour afficher une version esthétique du `translate:help`)
- direnv (pour charger automatiquement les fichiers `.env*`)
- Playwright Chromium (exécuter `pnpm take-screenshots:install` après `pnpm install` ; cela exécute `playwright install chromium`)

## Étapes {#steps}

### 1. Cloner le dépôt : {#1-clone-the-repository}

    ```bash
    git clone https://github.com/wsj-br/duplistatus.git
    cd duplistatus
    ```

### 2. Installer les dépendances (Debian/Ubuntu) : {#2-install-dependencies-debianubuntu}

    ```bash
    sudo apt update
    sudo apt install sqlite3 git inkscape bat -y
    ```

### 3. Supprimer les installations Node.js existantes (si déjà installées) {#3-remove-old-nodejs-installations-if-you-already-have-it-installed}

    ```bash
    sudo apt-get purge nodejs npm -y
    sudo apt-get autoremove -y
    sudo rm -rf /usr/local/bin/npm 
    sudo rm -rf /usr/local/share/man/man1/node* 
    sudo rm -rf /usr/local/lib/dtrace/node.d
    rm -rf ~/.npm
    rm -rf ~/.node-gyp
    sudo rm -rf /opt/local/bin/node
    sudo rm -rf /opt/local/include/node
    sudo rm -rf /opt/local/lib/node_modules
    sudo rm -rf /usr/local/lib/node*
    sudo rm -rf /usr/local/include/node*
    sudo rm -rf /usr/local/bin/node*
    ```

### 4. Installer Node.js et pnpm : {#4-install-nodejs-and-pnpm}

    ```bash
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
    source ~/.bashrc
    nvm install --lts
    nvm use --lts
    npm install -g pnpm npm-check-updates doctoc
    ```

### 5. Configurer le support de direnv {#5-set-up-direnv-support}

Ajoutez ces lignes à votre fichier `~/.bashrc`

    ```bash 
    # direnv support (apt install direnv)
    eval "$(direnv hook bash)"
    ```

avec cette commande :

    ```bash 
    (echo "# direnv support (apt install direnv)"; echo 'eval "$(direnv hook bash)') >> ~/.bashrc
    ```

dans le répertoire de base du dépôt, exécuter :

    ```bash
    direnv allow
    ```

Ajoutez ces lignes à votre fichier `~/.profile`

    ```bash 
    # export the Bash environment (needed for code editor or AI Agents to load it).
    export BASH_ENV="$HOME/.bashrc"
    ```

avec cette commande :

    ```bash 
    (echo "# export the Bash environment (needed for code editor or AI Agents to load it)."; \
     echo 'export BASH_ENV="$HOME/.bashrc"') >> ~/.profile
    ```

:::info
  Vous devez rouvrir le terminal ou potentiellement fermer/rouvrir l'éditeur de code IDE (Visual Studio Code, 
  Cursor, Lingma, Antigravity, Zed, ...) pour que ces modifications prennent effet.
:::

### 6. Créer le fichier `.env` à la racine du dépôt avec ces variables. {#6-create-the-env-file-at-the-repository-basedir-with-these-variables}

- Vous pouvez utiliser n'importe quelle valeur pour `VERSION` ; elle sera automatiquement mise à jour lors de l'utilisation des scripts de développement.
- Utilisez des mots de passe aléatoires pour `ADMIN_PASSWORD` et `USER_PASSWORD` ; ces mots de passe seront utilisés dans le script `pnpm take-screenshots`.
- Vous pouvez obtenir la `OPENROUTER_API_KEY` depuis [openrouter.ai](https://openrouter.ai).

    ```bash
    VERSION=x.x.x

    # Development user passwords
    ADMIN_PASSWORD="admin_secret"
    USER_PASSWORD="user_secret"


    # Openrouter.ai API key for translation scripts in documentation 
    OPENROUTER_API_KEY=sk-or-v1-your-key-for-translate-files
    ```

## Scripts Disponibles {#available-scripts}

Le projet inclut plusieurs scripts npm pour différentes tâches de développement :

### Scripts de développement {#development-scripts}
- `pnpm dev` - Démarrer le serveur de développement Next.js (port 8666) et le service cron (port 8667) ensemble via `concurrently` (inclut des pré-vérifications). CTRL-C arrête les deux. `NODE_OPTIONS` pour Next.js charge `scripts/dev-preload.cjs`, qui applique `scripts/peer-ip.cjs` (adresse de pair TCP pour les listes d'autorisation IP) et les horodatages des journaux de requêtes.
- `pnpm dev:next` - Démarrer uniquement le serveur de développement Next.js sur le port 8666 (sans cron).
- `pnpm build` - Construire l'application pour la production (inclut des pré-vérifications)
- `pnpm lint` - Exécuter ESLint pour vérifier la qualité du code
- `pnpm typecheck` - Exécuter la vérification des types TypeScript
- `scripts/upgrade-dependencies.sh` — Mise à niveau sécurisée de chaque package de l'espace de travail (détecté automatiquement). Résout les dernières versions avec `npm-check-updates`, installe depuis la racine de l'espace de travail, et conserve uniquement les mises à niveau qui passent les `typecheck`/`lint` de chaque package (les portes de pair pin `eslint` / `typescript` lorsque la pile de lint n'autorise pas la dernière version majeure). Puis exécute `pnpm audit` / `audit --fix` et applique de force (et rapporte) toute correction de sécurité nécessitant des modifications de code. Actualise le fichier de verrouillage de l'espace de travail et browserslist. Préférez `source ./scripts/upgrade-dependencies.sh` afin que **nvm** s'applique à votre shell ; dans CI ou automatisation, utilisez `CI=1` ou `UPGRADE_ALLOW_EXEC=1` lors de l'exécution du fichier directement. Voir aussi `scripts/upgrade-tools.sh` uniquement pour les outils Node/pnpm.
- `scripts/clean-workspace.sh` - Nettoyer l'espace de travail

**Note :** Le script `preinstall` applique automatiquement pnpm comme gestionnaire de paquets.

### Scripts de Documentation {#documentation-scripts}

Ces scripts doivent être exécutés depuis le répertoire `documentation/` :

- `pnpm start` - Construire et servir le site de documentation en mode production (port 3000 par défaut)
- `pnpm start:en` - Démarrer le serveur de développement de documentation en anglais (rechargement à chaud activé)
- `pnpm start:fr` - Démarrer le serveur de développement de documentation en locale française (rechargement à chaud activé)
- `pnpm start:de` - Démarrer le serveur de développement de documentation en locale allemande (rechargement à chaud activé)
- `pnpm start:es` - Démarrer le serveur de développement de documentation en locale espagnole (rechargement à chaud activé)
- `pnpm start:pt-br` - Démarrer le serveur de développement de documentation en locale portugaise (Brésil) (rechargement à chaud activé)
- `pnpm build` - Construire le site de documentation pour la production
- `pnpm write-translations` - Extraire les chaînes traduisibles depuis la documentation
- `pnpm translate` - Traduire les fichiers de documentation à l'aide de l'IA (voir [Flux de traduction](translation-workflow))
- `pnpm lint` - Exécuter ESLint sur les fichiers sources de la documentation

Les serveurs de développement (`start:*`) offrent un remplacement de module à chaud pour un développement rapide. Le port par défaut est 3000.

### Scripts de production {#production-scripts}
- `pnpm build-local` - Construire et préparer pour la production locale (inclut des vérifications préalables, copie les fichiers statiques dans un répertoire autonome)
- `pnpm start-local` - Démarrer le serveur de production localement (port 8666, inclut des vérifications préalables). **Remarque :** Exécutez `pnpm build-local` en premier. Démarre le serveur autonome avec `--require ./scripts/peer-ip.cjs`.
- `pnpm start` - Démarrer le serveur de production (port 9666) avec le même préchargement d'IP de pair. Docker utilise `docker-entrypoint.sh` pour charger le même script.

### Scripts Docker {#docker-scripts}
- `pnpm docker:up` - Démarrer la pile Docker Compose
- `pnpm docker:down` - Arrêter la pile Docker Compose
- `pnpm docker:clean` - Nettoyer l'environnement Docker et le cache
- `pnpm docker:devel` - Créer une image Docker de développement marquée comme `wsj-br/duplistatus:devel`

### Scripts de service cron {#cron-service-scripts}
- `pnpm cron:start` - Démarrer le service cron en mode production
- `pnpm cron:dev` - Démarrer uniquement le service cron en mode développement avec surveillance de fichiers (port 8667). Généralement inutile lors de l'utilisation de `pnpm dev`, qui démarre déjà cron.
- `pnpm cron:start-local` - Démarrer le service cron localement pour les tests (port 8667)

### Scripts de test {#test-scripts}
- `pnpm generate-test-data` - Générer des données de sauvegarde de test (nécessite le paramètre --servers=N)
- `pnpm validate-csv-export` - Valider la fonctionnalité d'export CSV
- `pnpm test-entrypoint` - Tester le script d'entrée Docker en développement local (voir [Scripts de test](test-scripts))
- `pnpm take-screenshots` - Prendre des captures d'écran pour la documentation (voir [Outils de documentation](documentation-tools))

Les vérifications en retard, les contrôles de santé cron et les tests SMTP sont effectués via l'application en cours d'exécution et `curl` (voir [Test Scripts](test-scripts)) ; les anciens utilitaires autonomes `pnpm` pour ceux-ci ont été supprimés.
