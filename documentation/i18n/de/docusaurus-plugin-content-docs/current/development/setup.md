# Entwicklungsumgebung einrichten {/* #development-setup */}

## Voraussetzungen {/* #prerequisites */}

- Docker / Docker Compose
- Node.js (siehe `engines.node` in `package.json`)
- pnpm (siehe `engines.pnpm` / `packageManager` in `package.json`)
- SQLite3
- Inkscape (für die Dokumentation von SVG-Übersetzungen und PNG-Export; nur erforderlich, wenn Sie `translate` oder `translate:svg` ausführen)
- bat/batcat (um eine ansprechende Version von `translate:help` anzuzeigen)
- direnv (zum automatischen Laden der `.env*` Dateien)
- Playwright Chromium (führen Sie `pnpm take-screenshots:install` nach `pnpm install` aus; dies führt `playwright install chromium` aus)

## Schritte {/* #steps */}

### 1. Repository klonen: {/* #1-clone-the-repository */}

    ```bash
    git clone https://github.com/wsj-br/duplistatus.git
    cd duplistatus
    ```

### 2. Abhängigkeiten installieren (Debian/Ubuntu): {/* #2-install-dependencies-debianubuntu */}

    ```bash
    sudo apt update
    sudo apt install sqlite3 git inkscape bat -y
    sudo apt install -y build-essential python3 python3-dev python3-setuptools make g++ gcc pkg-config 
    ```

### 3. Alte Node.js-Installationen entfernen (falls bereits installiert) {/* #3-remove-old-nodejs-installations-if-you-already-have-it-installed */}

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

### 4. Node.js und pnpm installieren: {/* #4-install-nodejs-and-pnpm */}

    ```bash
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
    source ~/.bashrc
    nvm install --lts
    nvm use --lts
    npm config set allow-scripts=pnpm --location=user
    npm install -g pnpm npm-check-updates doctoc
    ```

### 5. direnv-Unterstützung einrichten {/* #5-set-up-direnv-support */}

Fügen Sie diese Zeilen zu Ihrer `~/.bashrc` Datei hinzu

    ```bash 
    # direnv support (apt install direnv)
    eval "$(direnv hook bash)"
    ```

mit diesem Befehl:

    ```bash 
    (echo "# direnv support (apt install direnv)"; echo 'eval "$(direnv hook bash)') >> ~/.bashrc
    ```

im Hauptverzeichnis des Repository ausführen:

    ```bash
    direnv allow
    ```

Fügen Sie diese Zeilen zu Ihrer `~/.profile` Datei hinzu

    ```bash 
    # export the Bash environment (needed for code editor or AI Agents to load it).
    export BASH_ENV="$HOME/.bashrc"
    ```

mit diesem Befehl:

    ```bash 
    (echo "# export the Bash environment (needed for code editor or AI Agents to load it)."; \
     echo 'export BASH_ENV="$HOME/.bashrc"') >> ~/.profile
    ```

:::info
  Sie müssen das Terminal neu öffnen oder möglicherweise den Code-Editor (Visual Studio Code, 
  Cursor, Lingma, Antigravity, Zed, ...) schließen/erneut öffnen, damit diese Änderungen wirksam werden.
:::

### 6. Erstellen Sie die `.env` Datei im Hauptverzeichnis des Repository mit diesen Variablen. {/* #6-create-the-env-file-at-the-repository-basedir-with-these-variables */}

- Sie können einen beliebigen Wert für `VERSION` verwenden; dieser wird beim Verwenden der Entwicklungsskripte automatisch aktualisiert.
- Verwenden Sie zufällige Passwörter für `ADMIN_PASSWORD` und `USER_PASSWORD`; diese Passwörter werden im `pnpm take-screenshots` Skript verwendet.
- Sie erhalten den `OPENROUTER_API_KEY` von [openrouter.ai](https://openrouter.ai).

    ```bash
    VERSION=x.x.x

    # Development user passwords
    ADMIN_PASSWORD="admin_secret"
    USER_PASSWORD="user_secret"


    # Openrouter.ai API key for translation scripts in documentation 
    OPENROUTER_API_KEY=sk-or-v1-your-key-for-translate-files
    ```

## Verfügbare Skripte {/* #available-scripts */}

Das Projekt enthält mehrere npm-Skripte für verschiedene Entwicklungsaufgaben:

### Entwicklungsskripte {/* #development-scripts */}
- `pnpm dev` - Startet den Next.js-Entwicklungsserver (Port 8666) und den Cron-Service (Port 8667) gemeinsam über `concurrently` (enthält Pre-Checks). STRG-C stoppt beide. `NODE_OPTIONS` für Next.js lädt `scripts/dev-preload.cjs`, das `scripts/peer-ip.cjs` (TCP-Peer-Adresse für IP-Allowlisten) und Zeitstempel für Anforderungsprotokolle anwendet.
- `pnpm dev:next` - Startet nur den Next.js-Entwicklungsserver auf Port 8666 (kein Cron).
- `pnpm build` - Baut die Anwendung für die Produktion (enthält Pre-Checks)
- `pnpm lint` - Führt ESLint aus, um die Code-Qualität zu prüfen
- `pnpm typecheck` - Führt TypeScript-Typüberprüfung aus
- `scripts/upgrade-dependencies.sh` — Build-sicheres Upgrade aller Workspace-Pakete (automatisch erkannt). Ermittelt neueste Versionen mit `npm-check-updates`, installiert vom Workspace-Stamm aus und behält nur Upgrades, die die `typecheck`/`lint` jedes Pakets bestehen (Peer-Gates fixieren `eslint` / `typescript`, wenn der Lint-Stack die neueste Hauptversion nicht zulässt). Führt dann `pnpm audit` / `audit --fix` aus und wendet (und meldet) zwangsweise alle Sicherheitskorrekturen an, die Code-Änderungen benötigen. Aktualisiert die Workspace-Sperrendatei und browserslist. Bevorzugen Sie `source ./scripts/upgrade-dependencies.sh`, damit **nvm** auf Ihre Shell angewendet wird; in CI oder Automatisierung verwenden Sie `CI=1` oder `UPGRADE_ALLOW_EXEC=1`, wenn Sie die Datei direkt ausführen. Siehe auch `scripts/upgrade-tools.sh` nur für Node/pnpm-Tooling.
- `scripts/clean-workspace.sh` - Bereinigt den Workspace
- `pnpm i18n:tools --local` / `--remote` — Verlinkt einen Geschwister-`ai-i18n-tools`-Checkout oder stellt das letzte npm-Paket wieder her (`scripts/link-ai-i18n-tools.sh`). Commiten Sie nicht den `link:`-Spezifikator.

**Hinweis:** Das `preinstall`-Skript erzwingt automatisch pnpm als Paketmanager.

### Dokumentationsskripte {/* #documentation-scripts */}

Diese Skripte müssen aus dem `documentation/`-Verzeichnis heraus ausgeführt werden:

- `pnpm start` - Baut und startet die Dokumentationsseite im Produktionsmodus (standardmäßig Port 3000)
- `pnpm start:en` - Startet den Dokumentationsentwicklungsserver in Englisch (Hot Reloading aktiviert)
- `pnpm start:fr` - Startet den Dokumentationsentwicklungsserver in französischer Lokalisierung (Hot Reloading aktiviert)
- `pnpm start:de` - Startet den Dokumentationsentwicklungsserver in deutscher Lokalisierung (Hot Reloading aktiviert)
- `pnpm start:es` - Startet den Dokumentationsentwicklungsserver in spanischer Lokalisierung (Hot Reloading aktiviert)
- `pnpm start:pt-br` - Startet den Dokumentationsentwicklungsserver in portugiesischer (Brasilien) Lokalisierung (Hot Reloading aktiviert)
- `pnpm build` - Baut die Dokumentationsseite für die Produktion
- `pnpm write-translations` - Extrahiert übersetzbare Zeichenketten aus der Dokumentation
- `pnpm translate` - Übersetzt Dokumentationsdateien mithilfe von KI (siehe [Übersetzungsworkflow](translation-workflow))
- `pnpm lint` - Führt ESLint auf Dokumentationsquelldateien aus

Die Entwicklungsserver (`start:*`) bieten Hot Module Replacement für schnelle Entwicklung. Der Standardport ist 3000.

### Produktionsskripte {/* #production-scripts */}
- `pnpm build-local` - Baut und bereitet für lokale Produktion vor (enthält Pre-Checks, kopiert statische Dateien in eigenständiges Verzeichnis)
- `pnpm start-local` - Startet den Produktionsserver lokal (Port 8666, enthält Pre-Checks). **Hinweis:** Führen Sie zuerst `pnpm build-local` aus. Startet den eigenständigen Server mit `--require ./scripts/peer-ip.cjs`.
- `pnpm start` - Startet den Produktionsserver (Port 9666) mit derselben Peer-IP-Vorabladung. Docker verwendet `docker-entrypoint.sh`, um dasselbe Skript zu laden.

### Docker-Skripte {/* #docker-scripts */}
- `pnpm docker:up` - Startet Docker Compose Stack
- `pnpm docker:down` - Stoppt Docker Compose Stack
- `pnpm docker:clean` - Bereinigt Docker-Umgebung und Cache
- `pnpm docker:devel` - Erstellt ein Entwicklungs-Docker-Image mit dem Tag `wsj-br/duplistatus:devel`

### Cron-Service-Skripte {/* #cron-service-scripts */}
- `pnpm cron:start` - Startet Cron-Service im Produktionsmodus
- `pnpm cron:dev` - Startet nur den Cron-Service im Entwicklungsmodus mit Dateiüberwachung (Port 8667). Normalerweise unnötig, wenn `pnpm dev` verwendet wird, das Cron bereits startet.
- `pnpm cron:start-local` - Startet Cron-Service lokal zum Testen (Port 8667)

### Testskripte {/* #test-scripts */}
- `pnpm generate-test-data` - Generiert Test-Sicherungsdaten (erfordert --servers=N Parameter)
- `pnpm validate-csv-export` - Validiert CSV-Export-Funktionalität
- `pnpm test-entrypoint` - Testet Docker-Entrypoint-Skript in lokaler Entwicklung (siehe [Testskripte](test-scripts))
- `pnpm take-screenshots` - Erstellt Screenshots für die Dokumentation (siehe [Dokumentationswerkzeuge](documentation-tools))

Überfällige Prüfungen, Cron-Statusprüfungen und SMTP-Tests werden über die laufende Anwendung und `curl` durchgeführt (siehe [Testskripte](test-scripts)); die alten eigenständigen `pnpm`-Helfer dafür wurden entfernt.
