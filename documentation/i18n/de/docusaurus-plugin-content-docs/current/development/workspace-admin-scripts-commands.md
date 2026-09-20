# Workspace Admin-Skripte und -Befehle {/* #workspace-admin-scripts--commands */}

## Datenbank bereinigen {/* #clean-database */}

```bash
./scripts/clean-db.sh
```

Bereinigt die Datenbank durch Entfernen aller Daten unter Beibehaltung des Datenbankschemas und der Struktur.

>[!CAUTION]
> Mit Vorsicht verwenden, da alle vorhandenen Daten gelöscht werden.

## Build-Artefakte und Abhängigkeiten bereinigen {/* #clean-build-artefacts-and-dependencies */}

```bash
scripts/clean-workspace.sh
```

Entfernt alle Build-Artefakte, das Verzeichnis node_modules und andere generierte Dateien, um einen sauberen Zustand sicherzustellen. Dies ist nützlich, wenn Sie eine frische Installation durchführen oder Probleme mit Abhängigkeiten lösen müssen. Der Befehl löscht:
- `node_modules/`-Verzeichnis
- `.next/`-Build-Verzeichnis
- `dist/`-Verzeichnis
- `out/`-Verzeichnis
- `.turbo/`-Verzeichnis
- `pnpm-lock.yaml`
- `data/*.json` (Entwicklungs-JSON-Sicherungsdateien)
- `public/documentation`
- `documentation/.docusaurus`, `.cache`, `.cache-*`, `build`, `node_modules`, `pnpm-lock.yaml`
- `.genkit/`-Verzeichnis
- `*.tsbuildinfo`-Dateien
- pnpm-Speicher-Cache (über `pnpm store prune`)
- Docker-Build-Cache und System-Prune (Images, Netzwerke, Volumes)

## Docker Compose- und Docker-Umgebung bereinigen {/* #clean-docker-compose-and-docker-environment */}

```bash
scripts/clean-docker.sh
```

Führt eine vollständige Docker-Bereinigung durch, was nützlich ist für:
- Freigabe von Speicherplatz
- Entfernung alter/nicht verwendeter Docker-Artefakte
- Bereinigung nach Entwicklung- oder Testsitzungen
- Aufrechterhaltung einer sauberen Docker-Umgebung

## Pakete auf die aktuelle Version aktualisieren {/* #update-the-packages-to-the-latest-version */}

Sie können Pakete manuell aktualisieren mit:

```bash
ncu --upgrade
pnpm update
```

Oder verwenden Sie das automatisierte Skript (bevorzugen Sie `source`, damit **nvm** auf Ihre aktuelle Shell angewendet wird; für **CI** oder nicht-interaktive Ausführungen verwenden Sie `CI=1` oder `UPGRADE_ALLOW_EXEC=1`):

```bash
source ./scripts/upgrade-dependencies.sh
```

Das `upgrade-dependencies.sh`-Skript automatisiert den gesamten Prozess der Abhängigkeitsaktualisierung. Es ist projektagnostisch: der Paketmanager, die Arbeitsbereichspakete und der jeweilige Überprüfungsbefehl jedes Pakets werden automatisch erkannt (sowohl das Root- als auch die `documentation/`-Pakete werden also aktualisiert, ohne hartcodierte Pfade). Es:
- Lädt Tool-Setup über `upgrade-tools.sh` (nvm / Node LTS, globale `pnpm`, `npm-check-updates`, `doctoc`)
- Führt **build-sichere** Aktualisierungen für jedes Paket durch: `npm-check-updates` löst neueste Versionen auf, dann Installation und `typecheck`/`lint` werden vom Arbeitsbereichswurzelverzeichnis ausgeführt. Aktualisierungen, die bei der Überprüfung fehlschlagen, werden durch Bearbeitung von `package.json` getrennt (nicht `pnpm add`, welches pnpm im Arbeitsbereichswurzelverzeichnis ablehnt). Eingebettete Peer-Gates fixieren `eslint` und `typescript`, wenn `eslint-plugin-react` / `typescript-eslint` noch nicht die neueste Hauptversion zulassen.
- Aktualisiert die pnpm-Lockdatei des Arbeitsbereichs und installiert Abhängigkeiten
- Aktualisiert die browserslist-Datenbank
- Prüft auf Schwachstellen (`pnpm audit`) und wendet nicht-störende Korrekturen an (`pnpm audit --fix`)
- **Priorisiert Sicherheit**: Wenn eine verwundbare direkte Abhängigkeit nur durch eine build-störende Aktualisierung behoben werden kann, wird die sichere Version erzwungen und die Build-Fehler werden gemeldet, damit der Code für die Kompatibilität aktualisiert werden kann
- Gibt eine Zusammenfassung aus (aktualisierte vs. übersprungene build-störende Pakete, behobene/verbleibende Schwachstellen und ein Manifest-Snapshot-Pfad für manuelles Rollback)
- Kopiert `package.json` und Lockfiles mit `/usr/bin/cp`, sodass ein interaktiver `cp`-Alias (zum Beispiel `cp -i`) nicht zur Überschreibung dieser Dateien auffordert

Dieses Skript bietet einen vollständigen Workflow zum Aufrechterhalten aktueller und sicherer Abhängigkeiten.

## Auf ungenutzte Pakete prüfen {/* #check-for-unused-packages */}

```bash
pnpm depcheck
```

## Versionsinformationen aktualisieren {/* #update-version-information */}

```bash
./scripts/update-version.sh
```

Dieses Skript aktualisiert automatisch Versionsinformationen in mehreren Dateien, um sie synchron zu halten. Es:
- Extrahiert die Version aus `package.json`
- Aktualisiert die `.env`-Datei mit der `VERSION`-Variable (erstellt sie, falls sie nicht existiert)
- Aktualisiert die `Dockerfile` mit der `VERSION`-Variable (falls sie existiert)
- Aktualisiert das `documentation/package.json`-Versionsfeld (falls es existiert)
- Aktualisiert nur, wenn sich die Version geändert hat
- Zeigt Rückmeldung zu jeder Operation an

## Pre-checks Skript {/* #pre-checks-script */}

```bash
./scripts/pre-checks.sh
```

Dieses Skript führt vor dem Starten des Entwicklungsservers, Erstellen oder Starten des Produktionsservers Vorprüfungen durch. Es:
- Stellt sicher, dass die `.duplistatus.key`-Datei existiert (über `ensure-key-file.sh`)
- Aktualisiert die Versionsinformationen (über `update-version.sh`)

Dieses Skript wird automatisch von `pnpm dev`, `pnpm build` und `pnpm start-local` aufgerufen.

## Sicherstellen, dass wichtige Datei existiert {/* #ensure-key-file-exists */}

```bash
./scripts/ensure-key-file.sh
```

Dieses Skript stellt sicher, dass die `.duplistatus.key`-Datei im Verzeichnis `data` existiert. Es:
- Erstellt das Verzeichnis `data`, falls es nicht existiert
- Generiert eine neue zufällige 32-Byte-Schlüsseldatei, falls diese fehlt
- Setzt Dateiberechtigungen auf 0400 (nur Lesen für Besitzer)
- Korrigiert Berechtigungen, falls diese falsch sind

Die Schlüsseldatei wird für kryptografische Operationen in der Anwendung verwendet.

## Admin-Kontowiederherstellung {/* #admin-account-recovery */}

```bash
./admin-recovery <username> <new-password>
```

Dieses Skript ermöglicht die Wiederherstellung von Admin-Konten, falls Sie ausgesperrt sind oder das Passwort vergessen haben. Es:
- Setzt das Passwort für den angegebenen Benutzer zurück
- Entsperren Sie das Konto, falls es gesperrt war
- Setzt Zähler für fehlgeschlagene Anmeldeversuche zurück
- Löscht das Flag „Passwort muss geändert werden“
- Überprüft, ob das Passwort den Sicherheitsanforderungen entspricht
- Protokolliert die Aktion im Audit-Protokoll

**Beispiel:**

```bash
./admin-recovery admin NewPassword123
```

>[!CAUTION]
> Dieses Skript ändert direkt die Datenbank. Nur bei Bedarf für Kontowiederherstellung verwenden.

## Bilder kopieren {/* #copy-images */}

```bash
./scripts/copy-images.sh
```

Kopiert Bilddateien von `documentation/static/img` an ihre entsprechenden Positionen in der Anwendung:
- Kopiert `favicon.ico` nach `src/app/`
- Kopiert `duplistatus_logo.png` nach `public/images/`
- Kopiert `duplistatus_banner.png` nach `public/images/`

Nützlich zum Synchronisieren von Anwendungsbildern mit Dokumentationsbildern.

## Lokale oder npm ai-i18n-tools wechseln {/* #switch-local-or-npm-ai-i18n-tools */}

```bash
./scripts/link-ai-i18n-tools.sh --local
./scripts/link-ai-i18n-tools.sh --remote
pnpm i18n:tools --local
pnpm i18n:tools --remote
```

Verweist dieses Repository auf einen Geschwister-[ai-i18n-tools](https://github.com/wsj-br/ai-i18n-tools)-Checkout oder wieder auf das veröffentlichte npm-Paket und gibt anschließend die aufgelöste Version aus. `--local` schreibt `link:../ai-i18n-tools` (Pfad kann mit `--path` oder `AI_I18N_TOOLS_PATH` überschrieben werden), sodass `pnpm i18n:*` und `ai-i18n-tools/runtime` beide diesen Baum verwenden. `--remote` installiert die neueste npm-Version als `^x.y.z`. Den `link:`-Spezifikator nicht committen.

## Versionen zwischen Entwicklungsumgebung und Docker vergleichen {/* #compare-versions-between-development-and-docker */}

```bash
./scripts/compare-versions.sh
```

Dieses Skript vergleicht Versionen zwischen Ihrer Entwicklungsumgebung und einem laufenden Docker-Container. Es:
- Vergleicht SQLite-Versionen nur nach Hauptversion (z.B. werden 3.45.1 und 3.51.1 als kompatibel betrachtet, angezeigt als „✅ (major)“)
- Vergleicht Node-, npm- und Duplistatus-Versionen exakt (müssen exakt übereinstimmen)
- Zeigt eine formatierte Tabelle mit allen Versionsvergleichen an
- Zeigt eine Zusammenfassung mit farblich gekennzeichneten Ergebnissen an (✅ für Übereinstimmungen, ❌ für Abweichungen)
- Beendet sich mit Code 0, wenn alle Versionen übereinstimmen, 1, wenn es Abweichungen gibt

**Voraussetzungen:**
- Ein Docker-Container mit dem Namen `duplistatus` muss ausgeführt werden
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

**Hinweis:** SQLite-Versionen werden nur nach Hauptversion verglichen, da verschiedene Patch-Versionen innerhalb derselben Hauptversion in der Regel kompatibel sind. Das Skript zeigt an, wenn SQLite-Versionen auf Hauptversionsebene übereinstimmen, aber in den Patch-Versionen abweichen.

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

## Sicherungseinstellungen anzeigen {/* #show-backup-settings */}

```bash
./scripts/show-backup-settings.sh [database_path]
```

Zeigt den Inhalt des `backup_settings`-Werts in der Konfigurationstabelle in einer formatierten Tabelle an. Nützlich zur Fehlersuche bei Benachrichtigungskonfigurationen. Standarddatenbankpfad: `data/backups.db`.
