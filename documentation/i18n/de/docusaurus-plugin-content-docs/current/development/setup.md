---
translation_last_updated: '2026-02-05T19:08:26.674Z'
source_file_mtime: '2026-02-04T21:14:03.774Z'
source_file_hash: eeffa736b6dc0250
translation_language: de
source_file_path: development/setup.md
---
# Entwicklungssetup {#development-setup}

## Voraussetzungen {#prerequisites}

- Docker / Docker Compose
- Node.js >=24.12.0
- pnpm >=10.24.0
- SQLite3
- Inkscape (zum Übersetzen von Dokumentations-SVGs und PNG-Exportieren; erforderlich nur, wenn Sie `translate` oder `translate:svg` ausführen)
- bat/batcat (zum Einblenden einer ansprechenden Version von `translate:help`)

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

3. Alte Node.js-Installationen entfernen (falls bereits vorhanden)

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

### Test-Skripte {#test-scripts}
- `pnpm generate-test-data` - Test-Sicherungsdaten generieren (erfordert Parameter --servers=N)
- `pnpm show-overdue-notifications` - Inhalte überfälliger Benachrichtigungen einblenden
- `pnpm run-overdue-check` - Überfälligkeitsprüfung zu einem bestimmten Datum/einer bestimmten Zeit ausführen
- `pnpm test-cron-port` - Cron-Service-Port-Konnektivität testen
- `pnpm test-overdue-detection` - Erkennungslogik für überfällige Sicherungen testen
- `pnpm validate-csv-export` - CSV-Exportfunktionalität validieren
- `pnpm set-smtp-test-config` - SMTP-Testkonfiguration aus Umgebungsvariablen festlegen (siehe [Test-Skripte](test-scripts))
- `pnpm test-smtp-connections` - Kompatibilität von SMTP-Verbindungstypen testen (siehe [Test-Skripte](test-scripts))
- `pnpm test-entrypoint` - Docker-Entrypoint-Skript in der lokalen Entwicklung testen (siehe [Test-Skripte](test-scripts))
- `pnpm take-screenshots` - Screenshots für die Dokumentation aufnehmen (siehe [Dokumentationswerkzeuge](documentation-tools))
