---
translation_last_updated: '2026-02-16T02:21:30.369Z'
source_file_mtime: '2026-02-16T00:30:39.430Z'
source_file_hash: d88751514a7cd433
translation_language: fr
source_file_path: development/setup.md
---
# Configuration de développement {#development-setup}

## Conditions préalables {#prerequisites}

- Docker / Docker Compose
- Node.js >=24.12.0
- pnpm >=10.24.0 (packageManager: pnpm@10.29.3)
- SQLite3
- Inkscape (pour la traduction SVG de la documentation et l'export PNG ; requis uniquement si vous exécutez `translate` ou `translate:svg`)
- bat/batcat (pour afficher une version élégante de `translate:help`)
- direnv (pour charger automatiquement les fichiers `.env*`)

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
- `pnpm dev` - Démarrer le serveur de développement sur le port 8666 (inclut des vérifications préalables)
- `pnpm build` - Construire l'application pour la production (inclut des vérifications préalables)
- `pnpm lint` - Exécuter ESLint pour vérifier la qualité du code
- `pnpm typecheck` - Exécuter la vérification des types TypeScript
- `scripts/upgrade-dependencies.sh` - Mettre à jour tous les packages vers la dernière version, vérifier les vulnérabilités et les corriger automatiquement
- `scripts/clean-workspace.sh` - Nettoyer l'espace de travail

**Note :** Le script `preinstall` applique automatiquement pnpm comme gestionnaire de paquets.

### Scripts de Documentation {#documentation-scripts}

Ces scripts doivent être exécutés depuis le répertoire `documentation/` :

- `pnpm start` - Construire et servir le site de documentation en mode production (port 3000 par défaut)
- `pnpm start:en` - Démarrer le serveur de développement de documentation en anglais (rechargement à chaud activé)
- `pnpm start:fr` - Démarrer le serveur de développement de documentation en français (rechargement à chaud activé)
- `pnpm start:de` - Démarrer le serveur de développement de documentation en allemand (rechargement à chaud activé)
- `pnpm start:es` - Démarrer le serveur de développement de documentation en espagnol (rechargement à chaud activé)
- `pnpm start:pt-br` - Démarrer le serveur de développement de documentation en portugais (Brésil) (rechargement à chaud activé)
- `pnpm build` - Construire le site de documentation pour la production
- `pnpm write-translations` - Extraire les chaînes traduisibles de la documentation
- `pnpm translate` - Traduire les fichiers de documentation à l'aide de l'IA (voir [Workflow de Traduction](translation-workflow))
- `pnpm lint` - Exécuter ESLint sur les fichiers sources de documentation

Les serveurs de développement (`start:*`) offrent un remplacement de module à chaud pour un développement rapide. Le port par défaut est 3000.

### Scripts de Production {#production-scripts}
- `pnpm build-local` - Construire et préparer pour la production locale (inclut les pré-vérifications, copie les fichiers statiques dans le répertoire autonome)
- `pnpm start-local` - Démarrer le serveur de production localement (port 8666, inclut les pré-vérifications). **Note :** Exécutez d'abord `pnpm build-local`.
- `pnpm start` - Démarrer le serveur de production (port 9666)

### Scripts Docker {#docker-scripts}
- `pnpm docker-up` - Démarrer la pile Docker Compose
- `pnpm docker-down` - Arrêter la pile Docker Compose
- `pnpm docker-clean` - Nettoyer l'environnement Docker et le cache
- `pnpm docker-devel` - Construire une image Docker de développement étiquetée comme `wsj-br/duplistatus:devel`

### Scripts du Service Cron {#cron-service-scripts}
- `pnpm cron:start` - Démarrer le service cron en mode production
- `pnpm cron:dev` - Démarrer le service cron en mode développement avec surveillance des fichiers (port 8667)
- `pnpm cron:start-local` - Démarrer le service cron localement pour les tests (port 8667)

### Scripts de Test {#test-scripts}
- `pnpm generate-test-data` - Générer des données de test de sauvegarde (nécessite le paramètre --servers=N)
- `pnpm show-overdue-notifications` - Afficher le contenu des notifications en retard
- `pnpm run-overdue-check` - Exécuter la vérification des retards à une date/heure spécifique
- `pnpm test-cron-port` - Tester la connectivité du port du service cron
- `pnpm test-overdue-detection` - Tester la logique de détection des sauvegardes en retard
- `pnpm validate-csv-export` - Valider la fonctionnalité d'exportation CSV
- `pnpm set-smtp-test-config` - Définir la configuration de test SMTP à partir des variables d'environnement (voir [Scripts de Test](test-scripts))
- `pnpm test-smtp-connections` - Tester la compatibilité croisée des types de connexion SMTP (voir [Scripts de Test](test-scripts))
- `pnpm test-entrypoint` - Tester le script de point d'entrée Docker en développement local (voir [Scripts de Test](test-scripts))
- `pnpm take-screenshots` - Prendre des captures d'écran pour la documentation (voir [Outils de Documentation](documentation-tools))
