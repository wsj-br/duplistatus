# Configuration de développement {/* #development-setup */}

## Prérequis {/* #prerequisites */}

- Docker / Docker Compose
- Node.js (voir `engines.node` dans `package.json`)
- pnpm (voir `engines.pnpm` / `packageManager` dans `package.json`)
- SQLite3
- Inkscape (pour la traduction SVG et l'export PNG de la documentation ; requis uniquement si vous exécutez `translate` ou `translate:svg`)
- bat/batcat (pour afficher une version élégante du `translate:help`)
- direnv (pour charger automatiquement les fichiers `.env*`)
- Playwright Chromium (exécutez `pnpm take-screenshots:install` après `pnpm install` ; cela exécute `playwright install chromium`)

## Étapes {/* #steps */}

### 1. Cloner le référentiel : {/* #1-clone-the-repository */}

    ```bash
    git clone https://github.com/wsj-br/duplistatus.git
    cd duplistatus
    ```

### 2. Installer les dépendances (Debian/Ubuntu) : {/* #2-install-dependencies-debianubuntu */}

    ```bash
    sudo apt update
    sudo apt install sqlite3 git inkscape bat -y
    sudo apt install -y build-essential python3 python3-dev python3-setuptools make g++ gcc pkg-config 
    ```

### 3. Supprimer les anciennes installations de Node.js (si vous l'avez déjà installé) {/* #3-remove-old-nodejs-installations-if-you-already-have-it-installed */}

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

### 4. Installer Node.js et pnpm : {/* #4-install-nodejs-and-pnpm */}

    ```bash
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
    source ~/.bashrc
    nvm install --lts
    nvm use --lts
    npm config set allow-scripts=pnpm --location=user
    npm install -g pnpm npm-check-updates doctoc
    ```

### 5. Configurer le support direnv {/* #5-set-up-direnv-support */}

Ajoutez ces lignes à votre fichier `~/.bashrc`

    ```bash 
    # direnv support (apt install direnv)
    eval "$(direnv hook bash)"
    ```

avec cette commande :

    ```bash 
    (echo "# direnv support (apt install direnv)"; echo 'eval "$(direnv hook bash)') >> ~/.bashrc
    ```

dans le répertoire de base du référentiel, exécutez :

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
  Vous devez rouvrir le terminal ou vous devrez peut-être fermer/rouvrir l'IDE de l'éditeur de code (Visual Studio Code,
  Cursor, Lingma, Antigravity, Zed, ...) pour que ces modifications prennent effet.
:::

### 6. Créez le fichier `.env` au répertoire de base du référentiel avec ces variables. {/* #6-create-the-env-file-at-the-repository-basedir-with-these-variables */}

- Vous pouvez utiliser n'importe quelle valeur pour `VERSION` ; elle sera automatiquement mise à jour lors de l'utilisation des scripts de développement.
- Utilisez des mots de passe aléatoires pour `ADMIN_PASSWORD` et `USER_PASSWORD` ; ces mots de passe seront utilisés dans le script `pnpm take-screenshots`.
- Vous pouvez obtenir `OPENROUTER_API_KEY` sur [openrouter.ai](https://openrouter.ai).

    ```bash
    VERSION=x.x.x

    # Development user passwords
    ADMIN_PASSWORD="admin_secret"
    USER_PASSWORD="user_secret"


    # Openrouter.ai API key for translation scripts in documentation 
    OPENROUTER_API_KEY=sk-or-v1-your-key-for-translate-files
    ```

## Scripts disponibles {/* #available-scripts */}

Le projet inclut plusieurs scripts npm pour différentes tâches de développement :

### Scripts de développement {/* #development-scripts */}
- `pnpm dev` - Démarrer le serveur de développement Next.js (port 8666) et le service cron (port 8667) ensemble via `concurrently` (inclut les pré-vérifications). CTRL-C arrête les deux. `NODE_OPTIONS` pour Next.js charge `scripts/dev-preload.cjs`, qui applique `scripts/peer-ip.cjs` (adresse de pair TCP pour les listes blanches IP) et les horodatages des journaux de requêtes.
- `pnpm dev:next` - Démarrer uniquement le serveur de développement Next.js sur le port 8666 (pas de cron).
- `pnpm build` - Construire l'application pour la production (inclut les pré-vérifications)
- `pnpm lint` - Exécuter ESLint pour vérifier la qualité du code
- `pnpm typecheck` - Exécuter la vérification de type TypeScript
- `scripts/upgrade-dependencies.sh` — Mise à niveau sûre pour la construction de chaque paquet de l'espace de travail (détection automatique). Résout les dernières versions avec `npm-check-updates`, installe à partir de la racine de l'espace de travail, et conserve uniquement les mises à niveau qui passent `typecheck`/`lint` de chaque paquet (les portes de pair épinglent `eslint` / `typescript` quand la pile de linting ne permet pas la dernière version majeure). Puis exécute `pnpm audit` / `audit --fix` et applique de force (et signale) tout correctif de sécurité qui nécessite des modifications de code. Actualise le fichier de verrouillage de l'espace de travail et browserslist. Préférez `source ./scripts/upgrade-dependencies.sh` pour que **nvm** s'applique à votre shell ; en CI ou en automatisation, utilisez `CI=1` ou `UPGRADE_ALLOW_EXEC=1` lors de l'exécution directe du fichier. Voir aussi `scripts/upgrade-tools.sh` pour l'outillage Node/pnpm uniquement.
- `scripts/clean-workspace.sh` - Nettoyer l'espace de travail
- `pnpm i18n:tools --local` / `--remote` — Liez un `ai-i18n-tools` frère ou restaurez le dernier paquet npm (`scripts/link-ai-i18n-tools.sh`). Ne validez pas le spécificateur `link:`.

**Remarque :** Le script `preinstall` applique automatiquement pnpm comme gestionnaire de paquets.

### Scripts de documentation {/* #documentation-scripts */}

Ces scripts doivent être exécutés à partir du répertoire `documentation/` :

- `pnpm start` - Construire et servir le site de documentation en mode production (port 3000 par défaut)
- `pnpm start:en` - Démarrer le serveur de développement de documentation en anglais (rechargement à chaud activé)
- `pnpm start:fr` - Démarrer le serveur de développement de documentation en locale français (rechargement à chaud activé)
- `pnpm start:de` - Démarrer le serveur de développement de documentation en locale allemand (rechargement à chaud activé)
- `pnpm start:es` - Démarrer le serveur de développement de documentation en locale espagnol (rechargement à chaud activé)
- `pnpm start:pt-br` - Démarrer le serveur de développement de documentation en locale portugais (Brésil) (rechargement à chaud activé)
- `pnpm build` - Construire le site de documentation pour la production
- `pnpm write-translations` - Extraire les chaînes traduisibles de la documentation
- `pnpm translate` - Traduire les fichiers de documentation à l'aide de l'IA (voir [Flux de travail de traduction](translation-workflow))
- `pnpm lint` - Exécuter ESLint sur les fichiers source de documentation

Les serveurs de développement (`start:*`) fournissent le remplacement de module à chaud pour un développement rapide. Le port par défaut est 3000.

### Scripts de production {/* #production-scripts */}
- `pnpm build-local` - Construire et préparer pour la production locale (inclut les pré-vérifications, copie les fichiers statiques vers le répertoire autonome)
- `pnpm start-local` - Démarrer le serveur de production localement (port 8666, inclut les pré-vérifications). **Remarque :** Exécutez `pnpm build-local` d'abord. Démarre le serveur autonome avec `--require ./scripts/peer-ip.cjs`.
- `pnpm start` - Démarrer le serveur de production (port 9666) avec le même préchargement peer-ip. Docker utilise `docker-entrypoint.sh` pour charger le même script.

### Scripts Docker {/* #docker-scripts */}
- `pnpm docker:up` - Démarrer la pile Docker Compose
- `pnpm docker:down` - Arrêter la pile Docker Compose
- `pnpm docker:clean` - Nettoyer l'environnement Docker et le cache
- `pnpm docker:devel` - Construire une image Docker de développement étiquetée comme `wsj-br/duplistatus:devel`

### Scripts du service Cron {/* #cron-service-scripts */}
- `pnpm cron:start` - Démarrer le service cron en mode production
- `pnpm cron:dev` - Démarrer uniquement le service cron en mode développement avec surveillance des fichiers (port 8667). Généralement inutile lors de l'utilisation de `pnpm dev`, qui démarre déjà cron.
- `pnpm cron:start-local` - Démarrer le service cron localement pour les tests (port 8667)

### Scripts de test {/* #test-scripts */}
- `pnpm generate-test-data` - Générer des données de sauvegarde de test (nécessite le paramètre --servers=N)
- `pnpm validate-csv-export` - Valider la fonctionnalité d'export CSV
- `pnpm test-entrypoint` - Tester le script de point d'entrée Docker en développement local (voir [Scripts de test](test-scripts))
- `pnpm take-screenshots` - Prendre des captures d'écran pour la documentation (voir [Outils de documentation](documentation-tools))

Les vérifications en retard, les vérifications de santé cron et les tests SMTP sont effectués via l'application en cours d'exécution et `curl` (voir [Scripts de test](test-scripts)) ; les anciens assistants autonomes `pnpm` pour ceux-ci ont été supprimés.
