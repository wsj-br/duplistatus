# Entwicklungssetup {#development-setup}

## Voraussetzungen {#prerequisites}

- Docker / Docker Compose
- Node.js (siehe `engines.node` in `package.json`)
- pnpm (siehe `engines.pnpm` / `packageManager` in `package.json`)
- SQLite3
- Inkscape (für die Dokumentation der SVG-Übersetzung und PNG-Export; erforderlich nur, wenn Sie `translate` oder `translate:svg` ausführen)
- bat/batcat (um eine schöne Version der `translate:help` anzuzeigen)
- direnv (um die `.env*` Dateien automatisch zu laden)
- Playwright Chromium (führen Sie `pnpm take-screenshots:install` nach `pnpm install` aus; dies führt `playwright install chromium` aus)

## Schritte {#steps}

### 1. Repository klonen: {#1-clone-the-repository}

    ```bash
    git clone https://github.com/wsj-br/duplistatus.git
    cd duplistatus
    ```

### 2. Abhängigkeiten installieren (Debian/Ubuntu): {#2-install-dependencies-debianubuntu}

    ```bash
    sudo apt update
    sudo apt install sqlite3 git inkscape bat -y
    ```

### 3. Alte Node.js-Installationen entfernen (falls bereits installiert) {#3-remove-old-nodejs-installations-if-you-already-have-it-installed}

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

### 4. Node.js und pnpm installieren: {#4-install-nodejs-and-pnpm}

    ```bash
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
    source ~/.bashrc
    nvm install --lts
    nvm use --lts
    npm install -g pnpm npm-check-updates doctoc
    ```

### 5. Direnv-Unterstützung einrichten {#5-set-up-direnv-support}

Fügen Sie diese Zeilen zu Ihrer `~/.bashrc`-Datei hinzu

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

Fügen Sie diese Zeilen zu Ihrer `~/.profile`-Datei hinzu

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
  Sie müssen das Terminal neu öffnen oder möglicherweise die Code-Editor-IDE (Visual Studio Code, 
  Cursor, Lingma, Antigravity, Zed, ...) schließen und wieder öffnen, damit diese Änderungen wirksam werden.
:::

### 6. `.env`-Datei im Repository-Basisverzeichnis mit diesen Variablen erstellen. {#6-create-the-env-file-at-the-repository-basedir-with-these-variables}

- Sie können einen beliebigen Wert für `VERSION` verwenden; dieser wird automatisch aktualisiert, wenn die Entwicklungsskripte verwendet werden.
- Verwenden Sie zufällige Passwörter für `ADMIN_PASSWORD` und `USER_PASSWORD`; diese Passwörter werden im `pnpm take-screenshots`-Skript verwendet.
- Sie können den `OPENROUTER_API_KEY` von [openrouter.ai](https://openrouter.ai) abrufen.

    ```bash
    VERSION=x.x.x

    # Development user passwords
    ADMIN_PASSWORD="admin_secret"
    USER_PASSWORD="user_secret"


    # Openrouter.ai API key for translation scripts in documentation 
    OPENROUTER_API_KEY=sk-or-v1-your-key-for-translate-files
    ```

## Verfügbare Skripte {#available-scripts}

Das Projekt enthält mehrere npm-Skripte für verschiedene Entwicklungsaufgaben:

### Entwicklungsskripte {#development-scripts}
- `pnpm dev` - Starte den Next.js-Entwicklungsserver (Port 8666) und den Cron-Dienst (Port 8667) zusammen über `concurrently` (einschließlich Vorprüfungen). CTRL-C stoppt beide. `NODE_OPTIONS` für Next.js lädt `scripts/dev-preload.cjs`, das `scripts/peer-ip.cjs` anwendet (TCP-Peer-Adresse für IP-Whitelist) und Zeitstempel für die Anforderungsprotokolle.
- `pnpm dev:next` - Starte nur den Next.js-Entwicklungsserver auf Port 8666 (kein Cron).
- `pnpm build` - Baue die Anwendung für die Produktion (einschließlich Vorprüfungen)
- `pnpm lint` - Führe ESLint aus, um die Codequalität zu prüfen
- `pnpm typecheck` - Führe TypeScript-Typprüfung aus
- `scripts/upgrade-dependencies.sh` — Sicheres Upgrade jeder Arbeitsbereichspaket (automatisch erkannt). Löst die neuesten Versionen mit `npm-check-updates`, installiert vom Arbeitsbereichs-Stammverzeichnis und behält nur Upgrades, die jede Paket-`typecheck`/`lint` bestehen (Peer-Gates fixieren `eslint` / `typescript`, wenn der Lint-Stack das neueste Hauptversion nicht zulässt). Führt dann `pnpm audit` / `audit --fix` aus und wendet zwangsweise (und berichtet) alle Sicherheitsfixes an, die Codeänderungen benötigen. Aktualisiert die Arbeitsbereichs-Lockdatei und die Browsersliste. Bevorzuge `source ./scripts/upgrade-dependencies.sh`, damit **nvm** auf deine Shell angewendet wird; in CI oder Automatisierung verwende `CI=1` oder `UPGRADE_ALLOW_EXEC=1`, wenn du die Datei direkt ausführst. Siehe auch `scripts/upgrade-tools.sh` nur für Node/pnpm-Tools.
- `scripts/clean-workspace.sh` - Bereinige den Arbeitsbereich

**Hinweis:** Das `preinstall`-Skript erzwingt automatisch pnpm als Paketmanager.

### Dokumentationsskripte {#documentation-scripts}

Diese Skripte müssen aus dem `documentation/`-Verzeichnis ausgeführt werden:

- `pnpm start` - Dokumentationswebsite im Produktionsmodus bauen und bereitstellen (Standardport 3000)
- `pnpm start:en` - Entwicklungs-Server für Dokumentation auf Englisch starten (Hot Reloading aktiviert)
- `pnpm start:fr` - Entwicklungs-Server für Dokumentation im Französisch-Format starten (Hot Reloading aktiviert)
- `pnpm start:de` - Entwicklungs-Server für Dokumentation im Deutsch-Format starten (Hot Reloading aktiviert)
- `pnpm start:es` - Entwicklungs-Server für Dokumentation im Spanisch-Format starten (Hot Reloading aktiviert)
- `pnpm start:pt-br` - Entwicklungs-Server für Dokumentation im Portugiesisch (Brasilien)-Format starten (Hot Reloading aktiviert)
- `pnpm build` - Dokumentationswebsite für die Produktion bauen
- `pnpm write-translations` - Übersetzbare Zeichenketten aus der Dokumentation extrahieren
- `pnpm translate` - Dokumentationsdateien mithilfe von KI übersetzen (siehe [Übersetzungsworkflow](translation-workflow))
- `pnpm lint` - ESLint auf Dokumentations-Quelldateien ausführen

Die Entwicklungsserver (`start:*`) bieten Hot-Module-Replacement für schnelle Entwicklung. Der Standardport ist 3000.

### Produktionsskripte {#production-scripts}
- `pnpm build-local` - Erstellt und bereitet für die lokale Produktion vor (einschließlich Vorprüfungen, kopiert statische Dateien in ein eigenständiges Verzeichnis)
- `pnpm start-local` - Startet den Produktionsserver lokal (Port 8666, einschließlich Vorprüfungen). **Hinweis:** Führen Sie `pnpm build-local` zuerst aus. Startet den eigenständigen Server mit `--require ./scripts/peer-ip.cjs`.
- `pnpm start` - Startet den Produktionsserver (Port 9666) mit demselben Peer-IP-Vorladen. Docker verwendet `docker-entrypoint.sh`, um dasselbe Skript zu laden.

### Docker-Skripte {#docker-scripts}
- `pnpm docker:up` - Docker Compose-Stack starten
- `pnpm docker:down` - Docker Compose-Stack stoppen
- `pnpm docker:clean` - Docker-Umgebung und Cache bereinigen
- `pnpm docker:devel` - Erstellt ein Entwicklung-Docker-Image mit dem Tag `wsj-br/duplistatus:devel`

### Cron-Dienst-Skripte {#cron-service-scripts}
- `pnpm cron:start` - Starte den Cron-Dienst im Produktionsmodus
- `pnpm cron:dev` - Starte nur den Cron-Dienst im Entwicklungsmodus mit Dateibeobachtung (Port 8667). Normalerweise nicht erforderlich, wenn `pnpm dev` verwendet wird, das bereits Cron startet.
- `pnpm cron:start-local` - Starte den Cron-Dienst lokal zum Testen (Port 8667)

### Testskripte {#test-scripts}
- `pnpm generate-test-data` - Test-Sicherungsdaten generieren (erfordert Parameter --servers=N)
- `pnpm validate-csv-export` - CSV-Exportfunktionalität überprüfen
- `pnpm test-entrypoint` - Docker-Entrypoint-Skript im lokalen Entwicklungsmodus testen (siehe [Testskripte](test-scripts))
- `pnpm take-screenshots` - Erstellt Screenshots für die Dokumentation (siehe [Dokumentationswerkzeuge](documentation-tools))

Überfällige Prüfungen, Cron-Systemprüfungen und SMTP-Tests erfolgen über die laufende Anwendung und `curl` (siehe [Test-Skripte](test-scripts)); die alten eigenständigen `pnpm`-Hilfsskripte dafür wurden entfernt.
