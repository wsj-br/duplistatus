---
translation_last_updated: '2026-01-31T00:51:23.333Z'
source_file_mtime: '2026-01-27T14:22:06.830Z'
source_file_hash: 722ad34b5346ffbb
translation_language: de
source_file_path: development/setup.md
---
# Entwicklungsumgebung {#development-setup}

## Voraussetzungen {#prerequisites}

- Docker / Docker Compose
- Node.js >=24.12.0
- pnpm >=10.24.0
- SQLite3

## Schritte {#steps}

1. Klonen Sie das Repository:

```bash
git clone https://github.com/wsj-br/duplistatus.git
cd duplistatus
```

2. Abhängigkeiten installieren (Debian/Ubuntu):

```bash
sudo apt update
sudo apt install sqlite3 git -y
```

3. Entfernen Sie alte Node.js-Installationen (falls Sie diese bereits installiert hatten)

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

5. Starten Sie den Entwicklungsserver:

Für den Standard-TCP-Port (8666):

```bash
pnpm dev
```

## Verfügbare Skripte {#available-scripts}

Das Projekt enthält mehrere npm-Skripte für verschiedene Entwicklungsaufgaben:

### Entwicklungsskripte {#development-scripts}
- `pnpm dev` - Starten Sie den Entwicklungsserver auf Port 8666 (einschließlich Vorprüfungen)
- `pnpm build` - Erstellen Sie die Anwendung für die Produktion (einschließlich Vorprüfungen)
- `pnpm lint` - Führen Sie ESLint aus, um die Codequalität zu prüfen
- `pnpm typecheck` - Führen Sie die TypeScript-Typprüfung durch
- `scripts/upgrade-dependencies.sh` - Aktualisieren Sie alle Pakete auf die neueste Version, prüfen Sie auf Sicherheitslücken und beheben Sie diese automatisch
- `scripts/clean-workspace.sh` - Bereinigen Sie den Arbeitsbereich

**Hinweis:** Das `preinstall`-Skript erzwingt automatisch pnpm als Paketmanager.

### Production Scripts {#production-scripts}
- `pnpm build-local` - Erstellen und Vorbereitung für lokale Produktion (umfasst Vorprüfungen, kopiert statische Dateien in das Standalone-Verzeichnis)
- `pnpm start-local` - Produktions-Server lokal starten (Port 8666, umfasst Vorprüfungen). **Hinweis:** Führen Sie zuerst `pnpm build-local` aus.
- `pnpm start` - Produktions-Server starten (Port 9666)

### Docker-Skripte {#docker-scripts}
- `pnpm docker-up` - Docker Compose Stack starten
- `pnpm docker-down` - Docker Compose Stack stoppen
- `pnpm docker-clean` - Docker-Umgebung und Cache bereinigen
- `pnpm docker-devel` - Ein Development-Docker-Image mit dem Tag `wsj-br/duplistatus:devel` erstellen

### Cron-Service-Skripte {#cron-service-scripts}
- `pnpm cron:start` - Starten des Cron-Service im Produktionsmodus
- `pnpm cron:dev` - Starten des Cron-Service im Entwicklungsmodus mit Dateiüberwachung (Port 8667)
- `pnpm cron:start-local` - Starten des Cron-Service lokal zum Testen (Port 8667)

### Test-Skripte {#test-scripts}
- `pnpm generate-test-data` - Generiert Test-Sicherungsdaten (erfordert Parameter --servers=N)
- `pnpm show-overdue-notifications` - Zeigt Inhalte überfälliger Benachrichtigungen an
- `pnpm run-overdue-check` - Führt Prüfung überfälliger Sicherungen zu einem bestimmten Datum/einer bestimmten Zeit aus
- `pnpm test-cron-port` - Testet Konnektivität des Cron-Service-Ports
- `pnpm test-overdue-detection` - Testet Erkennungslogik für überfällige Sicherungen
- `pnpm validate-csv-export` - Validiert CSV-Exportfunktionalität
- `pnpm set-smtp-test-config` - Legt SMTP-Testkonfiguration aus Umgebungsvariablen fest (siehe [Test-Skripte](test-scripts))
- `pnpm test-smtp-connections` - Testet Kompatibilität des SMTP-Verbindungstyps (siehe [Test-Skripte](test-scripts))
- `pnpm test-entrypoint` - Testet Docker-Entrypoint-Skript in der lokalen Entwicklung (siehe [Test-Skripte](test-scripts))
- `pnpm take-screenshots` - Erstellt Screenshots für die Dokumentation (siehe [Dokumentationswerkzeuge](documentation-tools))
