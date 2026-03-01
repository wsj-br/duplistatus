

# Development Setup {#development-setup}

## Prerequisites {#prerequisites}

- Docker / Docker Compose
- Node.js >=24.12.0
- pnpm >=10.24.0 (packageManager: pnpm@10.30.3)
- SQLite3
- Inkscape (for documentation SVG translation and PNG export; required only if you run `translate` or `translate:svg`)
- bat/batcat (to show a pretty version of the `translate:help`)
- direnv (to automatically load the `.env*` files)



## Steps {#steps}

### 1. Clone the repository: {#1-clone-the-repository}
    ```bash
    git clone https://github.com/wsj-br/duplistatus.git
    cd duplistatus
    ```


### 2. Install dependencies (Debian/Ubuntu): {#2-install-dependencies-debianubuntu}
    ```bash
    sudo apt update
    sudo apt install sqlite3 git inkscape bat -y
    ```

### 3. Remove old Node.js installations (if you already have it installed) {#3-remove-old-nodejs-installations-if-you-already-have-it-installed}

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

### 4. Install Node.js and pnpm: {#4-install-nodejs-and-pnpm}

    ```bash
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
    source ~/.bashrc
    nvm install --lts
    nvm use --lts
    npm install -g pnpm npm-check-updates doctoc
    ```

### 5. Set up direnv support {#5-set-up-direnv-support}

Add these lines to your `~/.bashrc` file

    ```bash 
    # direnv support (apt install direnv)
    eval "$(direnv hook bash)"
    ```

    with this command:

    ```bash 
    (echo "# direnv support (apt install direnv)"; echo 'eval "$(direnv hook bash)') >> ~/.bashrc
    ```

    in the repository basedir, run:

    ```bash
    direnv allow
    ```

Add these lines to your `~/.profile` file

    ```bash 
    # export the Bash environment (needed for code editor or AI Agents to load it).
    export BASH_ENV="$HOME/.bashrc"
    ```

    with this command:

    ```bash 
    (echo "# export the Bash environment (needed for code editor or AI Agents to load it)."; \
     echo 'export BASH_ENV="$HOME/.bashrc"') >> ~/.profile
    ```


  :::info
  You need to reopen the terminal or may need to close/reopen the code editor IDE (Visual Studio Code, 
  Cursor, Lingma, Antigravity, Zed, ...) for these changes to take effect.
  :::

### 6. Create the `.env` file at the repository basedir with these variables. {#6-create-the-env-file-at-the-repository-basedir-with-these-variables}

- You can use any value for `VERSION`; it will be automatically updated when using the development scripts.
- Use random passwords for the `ADMIN_PASSWORD` and `USER_PASSWORD`; these passwords will be used in the `pnpm take-screenshots` script.
- You can get the `OPENROUTER_API_KEY` from [openrouter.ai](https://openrouter.ai). 


    ```bash
    VERSION=x.x.x

    # Development user passwords
    ADMIN_PASSWORD="admin_secret"
    USER_PASSWORD="user_secret"


    # Openrouter.ai API key for translation scripts in documentation 
    OPENROUTER_API_KEY=sk-or-v1-your-key-for-translate-files
    ```


## Available Scripts {#available-scripts}

The project includes several npm scripts for different development tasks:

### Development Scripts {#development-scripts}
- `pnpm dev` - Start development server on port 8666 (includes pre-checks)
- `pnpm build` - Build the application for production (includes pre-checks)
- `pnpm lint` - Run ESLint to check code quality
- `pnpm typecheck` - Run TypeScript type checking
- `scripts/upgrade-dependencies.sh` - Upgrade all packages to the latest version, check for vulnerabilities, and automatically fix them
- `scripts/clean-workspace.sh` - Clean the workspace

**Note:** The `preinstall` script automatically enforces pnpm as the package manager.

### Documentation Scripts {#documentation-scripts}

These scripts must be run from the `documentation/` directory:

- `pnpm start` - Build and serve the documentation site in production mode (port 3000 by default)
- `pnpm start:en` - Start documentation development server in English (hot reloading enabled)
- `pnpm start:fr` - Start documentation development server in French locale (hot reloading enabled)
- `pnpm start:de` - Start documentation development server in German locale (hot reloading enabled)
- `pnpm start:es` - Start documentation development server in Spanish locale (hot reloading enabled)
- `pnpm start:pt-br` - Start documentation development server in Portuguese (Brazil) locale (hot reloading enabled)
- `pnpm build` - Build the documentation site for production
- `pnpm write-translations` - Extract translatable strings from the documentation
- `pnpm translate` - Translate documentation files using AI (see [Translation Workflow](translation-workflow))
- `pnpm lint` - Run ESLint on documentation source files

The development servers (`start:*`) provide hot module replacement for rapid development. The default port is 3000.


### Production Scripts {#production-scripts}
- `pnpm build-local` - Build and prepare for local production (includes pre-checks, copies static files to standalone directory)
- `pnpm start-local` - Start production server locally (port 8666, includes pre-checks). **Note:** Run `pnpm build-local` first.
- `pnpm start` - Start production server (port 9666)

### Docker Scripts {#docker-scripts}
- `pnpm docker:up` - Start Docker Compose stack
- `pnpm docker:down` - Stop Docker Compose stack
- `pnpm docker:clean` - Clean Docker environment and cache
- `pnpm docker:devel` - Build a development Docker image tagged as `wsj-br/duplistatus:devel`

### Cron Service Scripts {#cron-service-scripts}
- `pnpm cron:start` - Start cron service in production mode
- `pnpm cron:dev` - Start cron service in development mode with file watching (port 8667)
- `pnpm cron:start-local` - Start cron service locally for testing (port 8667)

### Test Scripts {#test-scripts}
- `pnpm generate-test-data` - Generate test backup data (requires --servers=N parameter)
- `pnpm show-overdue-notifications` - Show overdue notification contents
- `pnpm run-overdue-check` - Run overdue check at a specific date/time
- `pnpm test-cron-port` - Test cron service port connectivity
- `pnpm test-overdue-detection` - Test overdue backup detection logic
- `pnpm validate-csv-export` - Validate CSV export functionality
- `pnpm set-smtp-test-config` - Set SMTP test configuration from environment variables (see [Test Scripts](test-scripts))
- `pnpm test-smtp-connections` - Test SMTP connection type cross-compatibility (see [Test Scripts](test-scripts))
- `pnpm test-entrypoint` - Test Docker entrypoint script in local development (see [Test Scripts](test-scripts))
- `pnpm take-screenshots` - Take screenshots for documentation (see [Documentation Tools](documentation-tools))
