# Entwicklungssetup {/* #development-setup */}

## Voraussetzungen {/* #prerequisites */}

- Docker / Docker Compose
- Node.js (siehe `engines.node` in `package.json`)
- pnpm (siehe `engines.pnpm` / `packageManager` in `package.json`)
- SQLite3
- Inkscape (für die Übersetzung von Dokumentations-SVG und PNG-Export; erforderlich nur, wenn Sie `translate` oder `translate:svg` ausführen)
- bat/batcat (um eine schöne Version des `translate:help` anzuzeigen)
- direnv (um die `.env*` Dateien automatisch zu laden)
- Playwright Chromium (führen Sie `pnpm take-screenshots:install` nach `pnpm install` aus; dies führt `playwright install chromium` aus)

## Schritte {/* #steps */}

### 1. Klonen Sie das Repository: {/* #1-clone-the-repository */}

    ```bash
    git clone https://github.com/wsj-br/duplistatus.git
    cd duplistatus
    ```

### 2. Installieren Sie die Abhängigkeiten (Debian/Ubuntu): {/* #2-install-dependencies-debianubuntu */}

    ```bash
    sudo apt update
    sudo apt install sqlite3 git inkscape bat -y
    sudo apt install -y build-essential python3 python3-dev python3-setuptools make g++ gcc pkg-config 
    ```

### 3. Entfernen Sie alte Node.js-Installationen (falls Sie es bereits installiert haben) {/* #3-remove-old-nodejs-installations-if-you-already-have-it-installed */}

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

### 4. Installieren Sie Node.js und pnpm: {/* #4-install-nodejs-and-pnpm */}

    ```bash
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
    source ~/.bashrc
    nvm install --lts
    nvm use --lts
    npm config set allow-scripts=pnpm --location=user
    npm install -g pnpm npm-check-updates doctoc
    ```

### 5. Richten Sie die direnv-Unterstützung ein {/* #5-set-up-direnv-support */}

Fügen Sie diese Zeilen zu Ihrer `~/.bashrc` Datei hinzu

    ```bash 
    # direnv support (apt install direnv)
    eval "$(direnv hook bash)"
    ```

mit diesem Befehl:

    ```bash 
    (echo "# direnv support (apt install direnv)"; echo 'eval "$(direnv hook bash)') >> ~/.bashrc
    ```

im Repository-Basisverzeichnis ausführen:

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
  Sie müssen das Terminal neu öffnen oder möglicherweise das Code-Editor-IDE (Visual Studio Code, 
  Cursor, Lingma, Antigravity, Zed, ...) schließen/neu öffnen, damit diese Änderungen wirksam werden.
:::

### 6. Erstellen Sie die `.env` Datei im Repository-Basisverzeichnis mit diesen Variablen. {/* #6-create-the-env-file-at-the-repository-basedir-with-these-variables */}

- Sie können jeden Wert für `VERSION` verwenden; er wird automatisch aktualisiert, wenn Sie die Entwicklungsskripte verwenden.
- Verwenden Sie zufällige Passwörter für die `ADMIN_PASSWORD` und `USER_PASSWORD`; diese Passwörter werden im `pnpm take-screenshots` Skript verwendet.
- Sie können die `OPENROUTER_API_KEY` von [openrouter.ai](https://openrouter.ai) erhalten.

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

### Entwicklungsskripts {/* #development-scripts */}
- `pnpm dev` - Starten Sie den Next.js-Entwicklungsserver (Port 8666) und den Cron-Dienst (Port 8667) gemeinsam über `concurrently` (enthält Vorprüfungen). STRG-C stoppt beide. `NODE_OPTIONS` für Next.js lädt `scripts/dev-preload.cjs`, das `scripts/peer-ip.cjs` anwendet (TCP-Peer-Adresse für IP-Whitelists) und Anforderungsprotokoll-Zeitstempel.
- `pnpm dev:next` - Starten Sie nur den Next.js-Entwicklungsserver auf Port 8666 (kein Cron).
- `pnpm build` - Erstellen Sie die Anwendung für die Produktion (enthält Vorprüfungen)
- `pnpm lint` - Führen Sie ESLint aus, um die Codequalität zu prüfen
- `pnpm typecheck` - Führen Sie die TypeScript-Typprüfung aus
- `scripts/upgrade-dependencies.sh` — Sichere Aktualisierung aller Workspace-Pakete (automatisch erkannt). Löst die neuesten Versionen mit `npm-check-updates` auf, installiert sie aus dem Workspace-Stammverzeichnis und behält nur die Aktualisierungen, die jede Paket-`typecheck`/`lint` bestehen (Peer-Gates fixieren `eslint` / `typescript`, wenn der Lint-Stack die neueste Hauptversion nicht zulässt). Führt dann `pnpm audit` / `audit --fix` aus und erzwingt (und meldet) alle Sicherheitsfixes, die Codeänderungen benötigen. Aktualisiert die Workspace-Lockdatei und die Browserslist. Bevorzugen Sie `source ./scripts/upgrade-dependencies.sh`, damit **nvm** auf Ihre Shell angewendet wird; in CI oder Automatisierung verwenden Sie `CI=1` oder `UPGRADE_ALLOW_EXEC=1`, wenn Sie die Datei direkt ausführen. Siehe auch `scripts/upgrade-tools.sh` für Node/pnpm-Tools nur.
- `scripts/clean-workspace.sh` - Reinigen Sie den Workspace

**Hinweis:** Das `preinstall`-Skript erzwingt automatisch pnpm als Paketmanager.

### Dokumentationsskripts {/* #documentation-scripts */}

Diese Skripts müssen aus dem `documentation/`-Verzeichnis ausgeführt werden:

- `pnpm start` - Erstellen und bereitstellen Sie die Dokumentationsseite im Produktionsmodus (Standardport 3000)
- `pnpm start:en` - Starten Sie den Dokumentations-Entwicklungsserver auf Englisch (Hot Reloading aktiviert)
- `pnpm start:fr` - Starten Sie den Dokumentations-Entwicklungsserver auf Französisch (Hot Reloading aktiviert)
- `pnpm start:de` - Starten Sie den Dokumentations-Entwicklungsserver auf Deutsch (Hot Reloading aktiviert)
- `pnpm start:es` - Starten Sie den Dokumentations-Entwicklungsserver auf Spanisch (Hot Reloading aktiviert)
- `pnpm start:pt-br` - Starten Sie den Dokumentations-Entwicklungsserver auf Portugiesisch (Brasilien) (Hot Reloading aktiviert)
- `pnpm build` - Erstellen Sie die Dokumentationsseite für die Produktion
- `pnpm write-translations` - Extrahieren Sie übersetzbare Strings aus der Dokumentation
- `pnpm translate` - Übersetzen Sie Dokumentationsdateien mit KI (siehe [Übersetzungsworkflow](translation-workflow))
- `pnpm lint` - Führen Sie ESLint auf Dokumentationsquelldateien aus

Die Entwicklungsserver (`start:*`) bieten Hot Module Replacement für eine schnelle Entwicklung. Der Standardport ist 3000.

### Produktionsskripts {/* #production-scripts */}
- `pnpm build-local` - Erstellen und vorbereiten Sie für die lokale Produktion (enthält Vorprüfungen, kopiert statische Dateien in ein eigenständiges Verzeichnis)
- `pnpm start-local` - Starten Sie den Produktionsserver lokal (Port 8666, enthält Vorprüfungen). **Hinweis:** Führen Sie zuerst `pnpm build-local` aus. Startet den eigenständigen Server mit `--require ./scripts/peer-ip.cjs`.
- `pnpm start` - Starten Sie den Produktionsserver (Port 9666) mit demselben Peer-IP-Vorladen. Docker verwendet `docker-entrypoint.sh`, um dasselbe Skript zu laden.

### Docker-Skripts {/* #docker-scripts */}
- `pnpm docker:up` - Starten Sie den Docker-Compose-Stack
- `pnpm docker:down` - Stoppen Sie den Docker-Compose-Stack
- `pnpm docker:clean` - Reinigen Sie die Docker-Umgebung und den Cache
- `pnpm docker:devel` - Erstellen Sie ein Entwicklungs-Docker-Image mit dem Tag `wsj-br/duplistatus:devel`

### Cron-Dienst-Skripts {/* #cron-service-scripts */}
- `pnpm cron:start` - Starten Sie den Cron-Dienst im Produktionsmodus
- `pnpm cron:dev` - Starten Sie nur den Cron-Dienst im Entwicklungsmodus mit Dateiüberwachung (Port 8667). Normalerweise unnötig, wenn Sie `pnpm dev` verwenden, das den Cron-Dienst bereits startet.
- `pnpm cron:start-local` - Starten Sie den Cron-Dienst lokal für Tests (Port 8667)

### Testskripts {/* #test-scripts */}
- `pnpm generate-test-data` - Generieren Sie Test-Sicherungsdaten (erfordert den Parameter --servers=N)
- `pnpm validate-csv-export` - Validieren Sie die CSV-Exportfunktionalität
- `pnpm test-entrypoint` - Testen Sie das Docker-Eintrittsskript in der lokalen Entwicklung (siehe [Testskripts](test-scripts))
- `pnpm take-screenshots` - Erstellen Sie Screenshots für die Dokumentation (siehe [Dokumentationswerkzeuge](documentation-tools))

Überfällige Prüfungen, Cron-Gesundheitsprüfungen und SMTP-Tests werden über die laufende Anwendung und `curl` (siehe [Testskripts](test-scripts)) durchgeführt; die alten eigenständigen `pnpm`-Hilfsprogramme dafür wurden entfernt.
