---
translation_last_updated: '2026-01-31T00:51:23.211Z'
source_file_mtime: '2026-01-27T14:22:06.830Z'
source_file_hash: 4651d154540967f5
translation_language: de
source_file_path: development/devel.md
---
# Häufig verwendete Befehle {#most-used-commands}

## Im Entwicklungsmodus ausführen {#run-in-dev-mode}

```bash
pnpm dev
```

- **JSON Dateispeicherplatz**: Alle empfangenen Sicherungsdaten werden als JSON-Dateien im Verzeichnis `data` gespeichert. Diese Dateien werden mit dem Zeitstempel des Empfangszeitpunkts benannt, im Format `YYYY-MM-DDTHH-mm-ss-sssZ.json` (UTC-Zeit). Diese Funktion ist nur im Entwicklungsmodus aktiv und unterstützt das Debugging durch die Beibehaltung der von Duplicati empfangenen Rohdaten.

- **Verbose Logging**: Die Anwendung protokolliert detailliertere Informationen über Datenbankoperationen und API-Anfragen, wenn sie im Entwicklungsmodus ausgeführt wird.

- **Versionsaktualisierung**: Der Entwicklungsserver aktualisiert die Versionsinformationen automatisch vor dem Start und stellt sicher, dass die neueste Version in der Anwendung angezeigt wird.

- **Löschen von Sicherungen**: Auf der Server-Detailseite wird in der Sicherungstabelle eine Schaltfläche zum Löschen angezeigt, mit der Sie einzelne Sicherungen löschen können. Diese Funktion ist besonders nützlich zum Testen und Debuggen der Funktionalität für überfällige Sicherungen.

## Starten Sie den Produktionsserver (in der Entwicklungsumgebung) {#start-the-production-server-in-development-environment}

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
pnpm docker-up
```

Oder manuell:

```bash
docker compose up --build -d
```

## Stoppen eines Docker-Stacks (Docker Compose) {#stop-a-docker-stack-docker-compose}

```bash
pnpm docker-down
```

Oder manuell:

```bash
docker compose down
```

## Docker-Umgebung bereinigen {#clean-docker-environment}

```bash
pnpm docker-clean
```

Oder manuell:

```bash
./scripts/clean-docker.sh
```

Dieses Skript führt eine vollständige Docker-Bereinigung durch, die für folgende Zwecke nützlich ist:
- Freigabe von Speicherplatz
- Entfernung alter/ungenutzter Docker-Artefakte
- Bereinigung nach Entwicklungs- oder Testsitzungen
- Wartung einer sauberen Docker-Umgebung

## Erstellen Sie ein Entwicklungsabbild (zum lokalen Testen oder mit Podman) {#create-a-development-image-to-test-locally-or-with-podman}

```bash
export $(grep -v '^#' .env | xargs) && docker build . -t wsj-br/duplistatus:devel-$VERSION
```
