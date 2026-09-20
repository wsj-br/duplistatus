# Am häufigsten verwendete Befehle {/* #most-used-commands */}

## Im Entwicklungsmodus ausführen {/* #run-in-dev-mode */}

```bash
pnpm dev
```

Dies startet sowohl die Next.js-App (Port 8666) als auch den Cron-Service (Port 8667). STRG+C beendet beide. Verwenden Sie `pnpm dev:next` oder `pnpm cron:dev`, um jeden Prozess einzeln auszuführen.

- **JSON-Dateispeicher**: Alle empfangenen Sicherungsdaten werden als JSON-Dateien im Verzeichnis `data` gespeichert. Diese Dateien werden mit dem Zeitstempel benannt, zu dem sie empfangen wurden, im Format `YYYY-MM-DDTHH-mm-ss-sssZ.json` (UTC-Zeit). Diese Funktion ist nur im Entwicklungsmodus aktiv und hilft beim Debuggen, indem die empfangenen Rohdaten von Duplicati beibehalten werden.

- **Ausführliches Logging**: Die Anwendung protokolliert detailliertere Informationen über Datenbankoperationen und API-Anfragen, wenn sie im Entwicklungsmodus ausgeführt wird.

- **Versionsaktualisierung**: Der Entwicklungsserver aktualisiert automatisch die Versionsinformationen vor dem Start und stellt sicher, dass die aktuelle Version in der Anwendung angezeigt wird.

- **Sicherungslöschung**: Auf der Serverdetailseite wird eine Schaltfläche zum Löschen in der Sicherungstabelle angezeigt, mit der Sie einzelne Sicherungen löschen können. Diese Funktion ist besonders nützlich zum Testen und Debuggen der Funktionalität für überfällige Sicherungen.

## Produktionsserver starten (in Entwicklungsumgebung) {/* #start-the-production-server-in-development-environment */}

Erstellen Sie zunächst die Anwendung für die lokale Produktion:

```bash
pnpm build-local
```

Starten Sie dann den Produktionsserver:

```bash
pnpm start-local
```

## Docker-Stack starten (Docker Compose) {/* #start-a-docker-stack-docker-compose */}

```bash
pnpm docker:up
```

Oder manuell:

```bash
docker compose up --build -d
```

## Docker-Stack stoppen (Docker Compose) {/* #stop-a-docker-stack-docker-compose */}

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
- Freigabe von Speicherplatz
- Entfernen alter/ungenutzter Docker-Artefakte
- Bereinigung nach Entwicklungs- oder Testsitzungen
- Aufrechterhaltung einer sauberen Docker-Umgebung

## Entwicklungsimage erstellen (zum lokalen Testen oder mit Podman) {/* #create-a-development-image-to-test-locally-or-with-podman */}

```bash
export $(grep -v '^#' .env | xargs) && docker build . -t wsj-br/duplistatus:devel-$VERSION
```
