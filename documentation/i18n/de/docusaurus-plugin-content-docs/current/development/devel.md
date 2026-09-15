# Meistgenutzte Befehle {/* #most-used-commands */}

## Im Entwicklungsmodus ausführen {/* #run-in-dev-mode */}

```bash
pnpm dev
```

Dies startet sowohl die Next.js-Anwendung (Port 8666) als auch den Cron-Dienst (Port 8667). STRG-C stoppt beide. Verwenden Sie `pnpm dev:next` oder `pnpm cron:dev`, um entweder Prozess einzeln auszuführen.

- **JSON-Dateispeicher**: Alle empfangenen Sicherungsdaten werden als JSON-Dateien im Verzeichnis `data` gespeichert. Diese Dateien werden mit dem Zeitstempel benannt, zu dem sie empfangen wurden, im Format `YYYY-MM-DDTHH-mm-ss-sssZ.json` (UTC-Zeit). Diese Funktion ist nur im Entwicklungsmodus aktiv und hilft beim Debugging, indem sie die rohen Daten aufbewahrt, die von Duplicati empfangen wurden.

- **Ausführliche Protokollierung**: Die Anwendung protokolliert detailliertere Informationen zu Datenbankoperationen und API-Anfragen, wenn sie im Entwicklungsmodus ausgeführt wird.

- **Versionsaktualisierung**: Der Entwicklungsserver aktualisiert die Versionsinformationen automatisch vor dem Start, um sicherzustellen, dass die neueste Version in der Anwendung angezeigt wird.

- **Sicherungslöschung**: Auf der Serverdetailseite erscheint eine Löschschaltfläche in der Sicherungstabelle, mit der Sie einzelne Sicherungen löschen können. Diese Funktion ist besonders nützlich für das Testen und Debuggen der Funktion für überfällige Sicherungen.

## Starten Sie den Produktionsserver (in der Entwicklungsumgebung) {/* #start-the-production-server-in-development-environment */}

Zuerst die Anwendung für die lokale Produktion erstellen:

```bash
pnpm build-local
```

Dann starten Sie den Produktionsserver:

```bash
pnpm start-local
```

## Starten Sie einen Docker-Stack (Docker Compose) {/* #start-a-docker-stack-docker-compose */}

```bash
pnpm docker:up
```

Oder manuell:

```bash
docker compose up --build -d
```

## Stoppen Sie einen Docker-Stack (Docker Compose) {/* #stop-a-docker-stack-docker-compose */}

```bash
pnpm docker:down
```

Oder manuell:

```bash
docker compose down
```

## Docker-Umgebung bereinigen {/* #clean-docker-environment */}

```bash
pnpm docker:clean
```

Oder manuell:

```bash
./scripts/clean-docker.sh
```

Dieses Skript führt eine vollständige Docker-Bereinigung durch, die nützlich ist für:
- Freigabe von Festplattenspeicherplatz
- Entfernen alter/ungebrauchter Docker-Artefakte
- Bereinigung nach Entwicklungs- oder Test-Sitzungen
- Aufrechterhaltung einer sauberen Docker-Umgebung

## Erstellen Sie ein Entwicklungsimage (zum lokalen Testen oder mit Podman) {/* #create-a-development-image-to-test-locally-or-with-podman */}

```bash
export $(grep -v '^#' .env | xargs) && docker build . -t wsj-br/duplistatus:devel-$VERSION
```
