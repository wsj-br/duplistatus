# Arbeitsbereichs-Administrationsskripte und -befehle {/* #workspace-admin-scripts--commands */}

## Datenbank bereinigen {/* #clean-database */}

```bash
./scripts/clean-db.sh
```

Bereinigt die Datenbank, indem alle Daten entfernt werden, während das Datenbankschema und die Struktur erhalten bleiben.

>[!CAUTION]
> Verwenden Sie dies mit Vorsicht, da alle vorhandenen Daten gelöscht werden.

## Build-Artefakte und Abhängigkeiten bereinigen {/* #clean-build-artefacts-and-dependencies */}

```bash
scripts/clean-workspace.sh
```

Entfernt alle Build-Artefakte, das node_modules-Verzeichnis und andere generierte Dateien, um einen sauberen Zustand sicherzustellen. Dies ist nützlich, wenn Sie eine frische Installation durchführen oder Abhängigkeitsprobleme beheben müssen. Der Befehl löscht:
- `node_modules/`-Verzeichnis
- `.next/`-Build-Verzeichnis
- `dist/`-Verzeichnis
- `out/`-Verzeichnis
- `.turbo/`-Verzeichnis
- `pnpm-lock.yaml`-Verzeichnis
- `data/*.json` (Entwicklungs-JSON-Sicherungsdateien)
- `public/documentation`
- `documentation/.docusaurus`, `.cache`, `.cache-*`, `build`, `node_modules`, `pnpm-lock.yaml`
- `.genkit/`-Verzeichnis
- `*.tsbuildinfo`-Dateien
- pnpm-Speicher-Cache (via `pnpm store prune`)
- Docker-Build-Cache und System-Bereinigung (Images, Netzwerke, Volumes)

## Docker Compose und Docker-Umgebung bereinigen {/* #clean-docker-compose-and-docker-environment */}

```bash
scripts/clean-docker.sh
```

Führt eine vollständige Docker-Bereinigung durch, die nützlich ist für:
- Freigabe von Festplattenspeicherplatz
- Entfernen alter/nicht verwendeter Docker-Artefakte
- Bereinigung nach Entwicklungs- oder Test-Sitzungen
- Aufrechterhaltung einer sauberen Docker-Umgebung

## Pakete auf die neueste Version aktualisieren {/* #update-the-packages-to-the-latest-version */}

Sie können Pakete manuell aktualisieren mit:

```bash
ncu --upgrade
pnpm update
```

Oder verwenden Sie das automatisierte Skript (`source` wird bevorzugt, damit **nvm** auf Ihre aktuelle Shell angewendet wird; für **CI** oder nicht-interaktive Ausführungen verwenden Sie `CI=1` oder `UPGRADE_ALLOW_EXEC=1`):

```bash
source ./scripts/upgrade-dependencies.sh
```

Das `upgrade-dependencies.sh`-Skript automatisiert den gesamten Prozess der Abhängigkeitsaktualisierung. Es ist projektunabhängig: Der Paketmanager, die Workspace-Pakete und jeder Paketüberprüfungskommando werden automatisch erkannt (sodass sowohl das Root- als auch das `documentation/`-Paket aktualisiert werden, ohne dass festcodierte Pfade verwendet werden). Es:
- Richtet die Tools über `upgrade-tools.sh` ein (nvm / Node LTS, globale `pnpm`, `npm-check-updates`, `doctoc`)
- Führt **sichere** Upgrades für jedes Paket durch: `npm-check-updates` ermittelt die neuesten Versionen, installiert sie und führt `typecheck`/`lint` vom Workspace-Root aus. Upgrades, die die Überprüfung nicht bestehen, werden durch Bearbeiten von `package.json` (nicht `pnpm add`, was pnpm im Workspace-Root ablehnt) bisektiert. Eingebettete Peer-Gates pinnen `eslint` und `typescript`, wenn `eslint-plugin-react` / `typescript-eslint` die neueste Major-Version noch nicht zulassen.
- Aktualisiert die pnpm-Lockdatei des Workspaces und installiert die Abhängigkeiten
- Aktualisiert die browserslist-Datenbank
- Prüft auf Sicherheitslücken (`pnpm audit`) und wendet nicht-kompatible Fixes an (`pnpm audit --fix`)
- **Priorisiert Sicherheit**: wenn eine Sicherheitslücke einer direkten Abhängigkeit nur durch ein build-zerstörendes Upgrade behoben werden kann, wird die sichere Version erzwungen und die Build-Fehler werden gemeldet, damit der Code für Kompatibilität aktualisiert werden kann
- Gibt eine Zusammenfassung aus (aktualisierte vs. build-zerstörende Pakete übersprungen, Sicherheitslücken behoben/verbleibend und einen Manifest-Snapshot-Pfad für manuelles Rollback)
- Kopiert `package.json` und Lockdateien mit `/usr/bin/cp`, damit ein interaktives `cp`-Alias (z. B. `cp -i`) nicht auffordert, diese Dateien zu überschreiben

Dieses Skript bietet einen vollständigen Workflow zum Halten der Abhängigkeiten auf dem neuesten Stand und sicher.

## Auf nicht verwendete Pakete prüfen {/* #check-for-unused-packages */}

```bash
pnpm depcheck
```

## Versionsinformationen aktualisieren {/* #update-version-information */}

```bash
./scripts/update-version.sh
```

Dieses Skript aktualisiert automatisch Versionsinformationen in mehreren Dateien, um sie synchron zu halten. Es:
- Extrahiert die Version aus `package.json`
- Aktualisiert die `.env`-Datei mit der `VERSION`-Variable (wird erstellt, falls sie nicht existiert)
- Aktualisiert die `Dockerfile` mit der `VERSION`-Variable (falls vorhanden)
- Aktualisiert das `documentation/package.json`-Versionsfeld (falls vorhanden)
- Aktualisiert nur, wenn sich die Version geändert hat
- Gibt Feedback zu jeder Operation

## Vorabprüfungen-Skript {/* #pre-checks-script */}

```bash
./scripts/pre-checks.sh
```

Dieses Skript führt Vorabprüfungen durch, bevor der Entwicklungsserver, das Bauen oder der Produktionsserver gestartet wird. Es:
- Stellt sicher, dass die `.duplistatus.key`-Datei existiert (über `ensure-key-file.sh`)
- Aktualisiert die Versionsinformationen (über `update-version.sh`)

Dieses Skript wird automatisch von `pnpm dev`, `pnpm build` und `pnpm start-local` aufgerufen.

## Sicherstellen, dass die Schlüsseldatiene existiert {/* #ensure-key-file-exists */}

```bash
./scripts/ensure-key-file.sh
```

Dieses Skript stellt sicher, dass die `.duplistatus.key`-Datei im `data`-Verzeichnis existiert. Es:
- Erstellt das `data`-Verzeichnis, falls es nicht existiert
- Generiert eine neue 32-Byte-Zufallsdatei, falls sie fehlt
- Setzt die Dateiberechtigungen auf 0400 (nur Lesen für den Besitzer)
- Behebt Berechtigungen, falls sie falsch sind

Die Schlüsseldatiene wird für kryptographische Operationen in der Anwendung verwendet.

## Admin-Konto-Wiederherstellung {/* #admin-account-recovery */}

```bash
./admin-recovery <username> <new-password>
```

Dieses Skript ermöglicht die Wiederherstellung von Admin-Konten, falls sie gesperrt sind oder das Passwort vergessen wurde. Es:
- Setzt das Passwort für den angegebenen Benutzer zurück
- Schaltet das Konto freigabe, falls es gesperrt war
- Setzt den Zähler für fehlgeschlagene Anmeldeversuche zurück
- Löscht das "Passwort muss geändert werden"-Flag
- Überprüft, ob das Passwort den Sicherheitsanforderungen entspricht
- Protokolliert die Aktion im Audit-Protokoll

**Beispiel:**

```bash
./admin-recovery admin NewPassword123
```

>[!CAUTION]
> Dieses Skript ändert die Datenbank direkt. Verwenden Sie es nur bei Bedarf für die Konto-Wiederherstellung.

## Bilder kopieren {/* #copy-images */}

```bash
./scripts/copy-images.sh
```

Kopiert Bilddateien von `documentation/static/img` an die entsprechenden Stellen in der Anwendung:
- Kopiert `favicon.ico` nach `src/app/`
- Kopiert `duplistatus_logo.png` nach `public/images/`
- Kopiert `duplistatus_banner.png` nach `public/images/`

Nützlich, um die Bilder der Anwendung mit den Dokumentationsbildern synchron zu halten.

## Versionen zwischen Entwicklung und Docker vergleichen {/* #compare-versions-between-development-and-docker */}

```bash
./scripts/compare-versions.sh
```

Dieses Skript vergleicht die Versionen zwischen Ihrer Entwicklungsumgebung und einem laufenden Docker-Container. Es:
- Vergleicht die SQLite-Versionen nur nach der Hauptversion (z. B. 3.45.1 vs 3.51.1 werden als kompatibel betrachtet, angezeigt als "✅ (major)")
- Vergleicht die Node-, npm- und Duplistatus-Versionen exakt (müssen genau übereinstimmen)
- Zeigt eine formatierte Tabelle mit allen Versionsvergleichen an
- Bietet eine Zusammenfassung mit farbcodierten Ergebnissen (✅ für Übereinstimmungen, ❌ für Unterschiede)
- Beendet mit Code 0, wenn alle Versionen übereinstimmen, 1 bei Unterschieden

**Anforderungen:**
- Der Docker-Container mit dem Namen `duplistatus` muss laufen
- Das Skript liest Versionsinformationen aus den Docker-Container-Protokollen

**Beispielausgabe:**

```
┌─────────────────────────┬──────────────────────────────┬──────────────────────────────┬──────────────┐
│ Component               │ Development                  │ Docker                       │   Match      │
├─────────────────────────┼──────────────────────────────┼──────────────────────────────┼──────────────┤
│ SQLite                  │ 3.45.1                       │ 3.51.1                       │ ✅ (major)   │
│ Node                    │ 24.12.0                      │ 24.12.0                      │ ✅           │
│ npm                     │ 10.9.2                       │ 10.9.2                       │ ✅           │
│ Duplistatus             │ 1.2.1                        │ 1.2.1                        │ ✅           │
└─────────────────────────┴──────────────────────────────┴──────────────────────────────┴──────────────┘
```

**Hinweis:** SQLite-Versionen werden nur nach der Hauptversion verglichen, da verschiedene Patch-Versionen innerhalb derselben Hauptversion im Allgemeinen kompatibel sind. Das Skript gibt an, wenn die SQLite-Versionen auf der Hauptversion übereinstimmen, aber in den Patch-Versionen unterscheiden.

## Anzeigen der Konfigurationen in der Datenbank {/* #viewing-the-configurations-in-the-database */}

```bash
sqlite3 data/backups.db "SELECT key, value FROM configurations;" | awk -F'|' '
  {print "\n" $1 ": "; 
   if(index($2,"{")>0) {print $2 |"jq -C ."; close("jq -C .")} 
   else {print $2;}}' | less -R
```

```bash
sqlite3 /var/lib/docker/volumes/duplistatus_data/_data/backups.db "SELECT key, value FROM configurations;" | awk -F'|' '
  {print "\n" $1 ": "; 
   if(index($2,"{")>0) {print $2 |"jq -C ."; close("jq -C .")} 
   else {print $2;}}' | less -R
```

## Anzeigen der Sicherungseinstellungen {/* #show-backup-settings */}

```bash
./scripts/show-backup-settings.sh [database_path]
```

Zeigt den Inhalt des `backup_settings` Werts in der Konfigurationstabelle in einer formatierten Tabelle an. Nützlich für die Fehlersuche bei Benachrichtigungskonfigurationen. Standard-Datenbankpfad: `data/backups.db`.
