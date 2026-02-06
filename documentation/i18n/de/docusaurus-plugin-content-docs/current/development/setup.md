---
translation_last_updated: '2026-02-06T22:33:30.905Z'
source_file_mtime: '2026-02-06T22:10:19.145Z'
source_file_hash: ae2bbcffdb897dd2
translation_language: de
source_file_path: development/setup.md
---
# Entwicklungssetup {#development-setup}

## Voraussetzungen {#prerequisites}

- Docker / Docker Compose
- Node.js >=24.12.0
- pnpm >=10.24.0
- SQLite3
- Inkscape (für Dokumentations-SVG-Übersetzung und PNG-Export; nur erforderlich, wenn Sie `translate` oder `translate:svg` ausführen)
- bat/batcat (um eine schöne Version von `translate:help` anzuzeigen)
- direnv (zum automatischen Laden der `.env*`-Dateien)

## Schritte {#steps}

1. Repository klonen:

    ```bash
    git clone https://github.com/wsj-br/duplistatus.git
    cd duplistatus
    ```

2. Abhängigkeiten installieren (Debian/Ubuntu):

    ```bash
    sudo apt update
    sudo apt install sqlite3 git inkscape bat -y
    ```

3. Alte Node.js-Installationen entfernen (falls bereits installiert)

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

4. Installieren Sie Node.js und pnpm:

    ```bash
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
    source ~/.bashrc
    nvm install --lts
    nvm use --lts
    npm install -g pnpm npm-check-updates doctoc
    ```

5. Direnv-Unterstützung einrichten

- Diese Zeilen zur `~/.bashrc`-Datei hinzufügen

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

- Diese Zeilen zur `~/.profile`-Datei hinzufügen

    ```bash 
    # export the Bash environment (needed for Cursor's agents to load it).
    export BASH_ENV="$HOME/.bashrc"
    ```

mit diesem Befehl:

    ```bash 
    (echo "# export the Bash environment (needed for Cursor's agents to load it)."; echo 'export BASH_ENV="$HOME/.bashrc"') >> ~/.profile
    ```

:::note
Sie müssen das Terminal neu öffnen oder die Cursor-Anwendung schließen und wieder öffnen, damit diese Änderungen wirksam werden.
:::

6. Die .env-Datei im Repository-Basisverzeichnis mit diesen Variablen erstellen.

- Sie können einen beliebigen Wert für `VERSION` verwenden; dieser wird automatisch aktualisiert, wenn die Entwicklungsskripte verwendet werden.
- Verwenden Sie zufällige Passwörter für `ADMIN_PASSWORD` und `USER_PASSWORD`; diese Passwörter werden im `pnpm take-screenshots`-Skript verwendet.
- Sie können den `OPENROUTER_API_KEY` von [openrouter.ai](https://openrouter.ai) abrufen.

    ```
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
- `pnpm dev` - Starten Sie den Entwicklungsserver auf Port 8666 (einschließlich Vorprüfungen)
- `pnpm build` - Erstellen Sie die Anwendung für die Produktion (einschließlich Vorprüfungen)
- `pnpm lint` - Führen Sie ESLint aus, um die Codequalität zu prüfen
- `pnpm typecheck` - Führen Sie die TypeScript-Typprüfung aus
- `scripts/upgrade-dependencies.sh` - Aktualisieren Sie alle Pakete auf die neueste Version, prüfen Sie auf Sicherheitslücken und beheben Sie diese automatisch
- `scripts/clean-workspace.sh` - Bereinigen Sie den Arbeitsbereich

**Hinweis:** Das `preinstall`-Skript erzwingt automatisch pnpm als Paketmanager.

### Produktionsskripte {#production-scripts}
- `pnpm build-local` - Erstellen und für lokale Produktion vorbereiten (einschließlich Vor-Checks, kopiert statische Dateien in das Standalone-Verzeichnis)
- `pnpm start-local` - Produktions-Server lokal starten (Port 8666, einschließlich Vor-Checks). **Hinweis:** Führen Sie zuerst `pnpm build-local` aus.
- `pnpm start` - Produktions-Server starten (Port 9666)

### Docker-Skripte {#docker-scripts}
- `pnpm docker-up` - Docker Compose Stack starten
- `pnpm docker-down` - Docker Compose Stack stoppen
- `pnpm docker-clean` - Docker-Umgebung und Cache bereinigen
- `pnpm docker-devel` - Development Docker Image mit dem Tag `wsj-br/duplistatus:devel` erstellen

### Cron-Service-Skripte {#cron-service-scripts}
- `pnpm cron:start` - Starten des Cron-Service im Produktionsmodus
- `pnpm cron:dev` - Starten des Cron-Service im Entwicklungsmodus mit Dateiüberwachung (Port 8667)
- `pnpm cron:start-local` - Starten des Cron-Service lokal zum Testen (Port 8667)

### Testskripte {#test-scripts}
- `pnpm generate-test-data` - Testbackup-Daten generieren (erfordert --servers=N-Parameter)
- `pnpm show-overdue-notifications` - Überfällige Benachrichtigungsinhalte anzeigen
- `pnpm run-overdue-check` - Überfälligkeitsprüfung zu einem bestimmten Datum/Zeitpunkt ausführen
- `pnpm test-cron-port` - Konnektivität des Cron-Service-Ports testen
- `pnpm test-overdue-detection` - Logik zur Erkennung überfälliger Sicherungen testen
- `pnpm validate-csv-export` - CSV-Export-Funktionalität validieren
- `pnpm set-smtp-test-config` - SMTP-Testkonfiguration aus Umgebungsvariablen festlegen (siehe [Testskripte](test-scripts))
- `pnpm test-smtp-connections` - SMTP-Verbindungstyp-Kompatibilität testen (siehe [Testskripte](test-scripts))
- `pnpm test-entrypoint` - Docker-Entrypoint-Skript in lokaler Entwicklung testen (siehe [Testskripte](test-scripts))
- `pnpm take-screenshots` - Screenshots für Dokumentation erstellen (siehe [Dokumentationstools](documentation-tools))
