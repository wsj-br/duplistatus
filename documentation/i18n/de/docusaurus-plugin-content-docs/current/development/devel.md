---
translation_last_updated: '2026-05-11T14:27:40.218Z'
source_file_mtime: '2026-05-06T23:18:51.406Z'
source_file_hash: 9d4cf0118b57183b62975b8e1557d2da7033073c6a7bd0b3131a0a0efa508862
translation_language: de
source_file_path: documentation/docs/development/devel.md
translation_models:
  - anthropic/claude-haiku-4.5
  - qwen/qwen3-235b-a22b-2507
---
# Am häufigsten verwendete Befehle {#most-used-commands}

## Im Entwicklungsmodus ausführen {#run-in-dev-mode}

```bash
pnpm dev
```

- **JSON File Storage**: Alle empfangenen Sicherungsdaten werden als JSON-Dateien im Verzeichnis `data` gespeichert. Diese Dateien werden mit dem Zeitstempel des Empfangszeitpunkts benannt, im Format `YYYY-MM-DDTHH-mm-ss-sssZ.json` (UTC-Zeit). Diese Funktion ist nur im Entwicklungsmodus aktiv und hilft beim Debugging durch Beibehaltung der von Duplicati empfangenen Rohdaten.

- **Verbose Logging**: Die Anwendung protokolliert detailliertere Informationen über Datenbankoperationen und API-Anfragen, wenn sie im Entwicklungsmodus ausgeführt wird.

- **Versionsaktualisierung**: Der Entwicklungsserver aktualisiert die Versionsinformationen automatisch vor dem Start und stellt sicher, dass die neueste Version in der Anwendung angezeigt wird.

- **Backup Deletion**: Auf der Server-Detailseite wird in der Sicherungstabelle eine Schaltfläche zum Löschen angezeigt, mit der Sie einzelne Sicherungen löschen können. Diese Funktion ist besonders nützlich zum Testen und Debuggen der Funktionalität für überfällige Sicherungen.

## Starten des Produktionsservers (in der Entwicklungsumgebung) {#start-the-production-server-in-development-environment}

Erstellen Sie zunächst die Anwendung für die lokale Produktion:

```bash
pnpm build-local
```

Starten Sie dann den Produktionsserver:

```bash
pnpm start-local
```

## Starten eines Docker-Stacks (Docker Compose) {#start-a-docker-stack-docker-compose}

```bash
pnpm docker:up
```

Oder manuell:

```bash
docker compose up --build -d
```

## Docker-Stack (Docker Compose) stoppen {#stop-a-docker-stack-docker-compose}

```bash
pnpm docker:down
```

Oder manuell:

```bash
docker compose down
```

## Docker-Umgebung bereinigen {#clean-docker-environment}

```bash
pnpm docker:clean
```

Oder manuell:

```bash
./scripts/clean-docker.sh
```

Dieses Skript führt eine vollständige Docker-Bereinigung durch, was nützlich ist für:
- Freigabe von Speicherplatz
- Entfernen alter oder ungenutzter Docker-Artefakte
- Aufräumen nach Entwicklungs- oder Testphasen
- Beibehaltung einer sauberen Docker-Umgebung

## Entwicklungsimage erstellen (zum lokalen Testen oder mit Podman) {#create-a-development-image-to-test-locally-or-with-podman}

```bash
export $(grep -v '^#' .env | xargs) && docker build . -t wsj-br/duplistatus:devel-$VERSION
```
