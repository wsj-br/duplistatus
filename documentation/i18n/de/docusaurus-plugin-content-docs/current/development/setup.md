---
translation_last_updated: '2026-05-11T14:27:41.541Z'
source_file_mtime: '2026-05-06T23:18:51.410Z'
source_file_hash: afa62bd5079025673839bdb73483cc80a950dce1e23ab6fbc63dccb4333ad41f
translation_language: de
source_file_path: documentation/docs/development/setup.md
translation_models:
  - anthropic/claude-3.5-haiku
  - anthropic/claude-haiku-4.5
  - qwen/qwen3-235b-a22b-2507
---
# Entwicklungssetup {#development-setup}

## Voraussetzungen {#prerequisites}

- Docker / Docker Compose
- Node.js >=24.12.0
- pnpm >=10.24.0 (packageManager: pnpm@10.30.3)
- SQLite3
- Inkscape (für die Übersetzung von Dokumentations-SVGs und PNG-Export; nur erforderlich, wenn Sie `translate` oder `translate:svg` ausführen)
- bat/batcat (um eine ansprechende Version von `translate:help` anzuzeigen)
- direnv (zum automatischen Laden der `.env*`-Dateien)

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
- `pnpm dev` - Entwicklungs-Server auf Port 8666 starten (beinhaltet Vorabprüfungen)
- `pnpm build` - Anwendung für die Produktion bauen (beinhaltet Vorabprüfungen)
- `pnpm lint` - ESLint ausführen, um die Code-Qualität zu überprüfen
- `pnpm typecheck` - TypeScript-Typüberprüfung ausführen
- `scripts/upgrade-dependencies.sh` — Root- und `documentation/`-Pakete aktualisieren (`npm-check-updates`), die Workspace-Lockdatei aktualisieren, browserslist aktualisieren und `pnpm audit` / fix ausführen. Bevorzugen Sie `source ./scripts/upgrade-dependencies.sh`, damit **nvm** in Ihrer Shell greift; in CI oder Automatisierung verwenden Sie `CI=1` oder `DUPLISTATUS_UPGRADE_ALLOW_EXEC=1`, wenn die Datei direkt ausgeführt wird. Siehe auch `scripts/upgrade-tools.sh` für Node/pnpm-Tooling allein.
- `scripts/clean-workspace.sh` - Arbeitsbereich bereinigen

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
- `pnpm build-local` - Erstellen und für lokale Produktion vorbereiten (einschließlich Vor-Checks, kopiert statische Dateien in das Standalone-Verzeichnis)
- `pnpm start-local` - Produktions-Server lokal starten (Port 8666, einschließlich Vor-Checks). **Hinweis:** Führen Sie zuerst `pnpm build-local` aus.
- `pnpm start` - Produktions-Server starten (Port 9666)

### Docker-Skripte {#docker-scripts}
- `pnpm docker:up` - Docker Compose-Stack starten
- `pnpm docker:down` - Docker Compose-Stack stoppen
- `pnpm docker:clean` - Docker-Umgebung und Cache bereinigen
- `pnpm docker:devel` - Erstellt ein Entwicklung-Docker-Image mit dem Tag `wsj-br/duplistatus:devel`

### Cron-Service-Skripte {#cron-service-scripts}
- `pnpm cron:start` - Starten des Cron-Service im Produktionsmodus
- `pnpm cron:dev` - Starten des Cron-Service im Entwicklungsmodus mit Dateiüberwachung (Port 8667)
- `pnpm cron:start-local` - Starten des Cron-Service lokal zum Testen (Port 8667)

### Testskripte {#test-scripts}
- `pnpm generate-test-data` - Test-Sicherungsdaten generieren (erfordert Parameter --servers=N)
- `pnpm validate-csv-export` - CSV-Exportfunktionalität überprüfen
- `pnpm test-entrypoint` - Docker-Entrypoint-Skript im lokalen Entwicklungsmodus testen (siehe [Testskripte](test-scripts))
- `pnpm take-screenshots` - Erstellt Screenshots für die Dokumentation (siehe [Dokumentationswerkzeuge](documentation-tools))

Überfällige Prüfungen, Cron-Systemprüfungen und SMTP-Tests erfolgen über die laufende Anwendung und `curl` (siehe [Test-Skripte](test-scripts)); die alten eigenständigen `pnpm`-Hilfsskripte dafür wurden entfernt.
