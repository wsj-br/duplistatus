---
translation_last_updated: '2026-05-06T23:20:29.218Z'
source_file_mtime: '2026-05-06T23:18:51.394Z'
source_file_hash: 6582520a51466f9784b01b1236c4ba689c2b3989be1150eed15fadd8137decab
translation_language: de
source_file_path: documentation/docs/development/workspace-admin-scripts-commands.md
translation_models:
  - anthropic/claude-3.5-haiku
  - anthropic/claude-haiku-4.5
  - qwen/qwen3-235b-a22b-2507
---
# Workspace-Admin-Skripte und -Befehle {#workspace-admin-scripts-commands}

## Datenbank bereinigen {#clean-database}

```bash
./scripts/clean-db.sh
```

Bereinigt die Datenbank, indem alle Daten entfernt werden, während das Datenbankschema und die Struktur erhalten bleiben.

>[!CAUTION]
> Mit Vorsicht verwenden, da dies alle vorhandenen Daten löscht.

## Build-Artefakte und Abhängigkeiten bereinigen {#clean-build-artefacts-and-dependencies}

```bash
scripts/clean-workspace.sh
```

Entfernt alle Build-Artefakte, das Verzeichnis node_modules und andere generierte Dateien, um einen sauberen Zustand sicherzustellen. Dies ist nützlich, wenn Sie eine Neuinstallation durchführen oder Abhängigkeitsprobleme beheben müssen. Der Befehl löscht:
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
- pnpm-Store-Cache (über `pnpm store prune`)
- Docker-Build-Cache und Systempruning (Images, Netzwerke, Volumes)

## Docker Compose und Docker-Umgebung bereinigen {#clean-docker-compose-and-docker-environment}

```bash
scripts/clean-docker.sh
```

Führt eine vollständige Docker-Bereinigung durch, was nützlich ist für:
- Freigabe von Speicherplatz
- Entfernen alter/nicht verwendeter Docker-Artefakte
- Bereinigung nach Entwicklungs- oder Testphasen
- Beibehaltung einer sauberen Docker-Umgebung

## Aktualisieren Sie die Pakete auf die neueste Version {#update-the-packages-to-the-latest-version}

Sie können Pakete manuell aktualisieren mit:

```bash
ncu --upgrade
pnpm update
```

Oder verwenden Sie das automatisierte Skript (bevorzugt `source`, damit **nvm** auf Ihre aktuelle Shell angewendet wird; für **CI** oder nicht-interaktive Ausführungen verwenden Sie `CI=1` oder `DUPLISTATUS_UPGRADE_ALLOW_EXEC=1`):

```bash
source ./scripts/upgrade-dependencies.sh
```

Das `upgrade-dependencies.sh`-Skript automatisiert den gesamten Prozess der Abhängigkeitsaktualisierung:
- Lädt die Tool-Setup-Konfiguration über `upgrade-tools.sh` (nvm / Node LTS, globale `pnpm`, `npm-check-updates`, `doctoc`)
- Aktualisiert Root und `documentation/package.json` mithilfe von `npm-check-updates` (mit optionalem ESLint-Peer-Gate, damit `eslint`- und React-Plugin-Aktualisierungen kompatibel bleiben)
- Aktualisiert die Workspace-pnpm-Lockdatei und installiert Abhängigkeiten
- Aktualisiert die Browserslist-Datenbank
- Überprüft auf Sicherheitslücken mithilfe von `pnpm audit`
- Behebt Sicherheitslücken automatisch mithilfe von `pnpm audit fix`
- Überprüft erneut auf Sicherheitslücken nach der Behebung, um die Korrektheit zu verifizieren

Dieses Skript bietet einen vollständigen Workflow zum Aktualisieren und Sichern von Abhängigkeiten.

## Prüfen auf ungenutzte Pakete {#check-for-unused-packages}

```bash
pnpm depcheck
```

## Versionsinformationen aktualisieren {#update-version-information}

```bash
./scripts/update-version.sh
```

Dieses Skript aktualisiert automatisch Versionsinformationen in mehreren Dateien, um sie synchron zu halten. Es:
- Extrahiert die Version aus `package.json`
- Aktualisiert die `.env`-Datei mit der `VERSION`-Variable (erstellt sie, falls nicht vorhanden)
- Aktualisiert die `Dockerfile` mit der `VERSION`-Variable (falls vorhanden)
- Aktualisiert das Versionsfeld in `documentation/package.json` (falls vorhanden)
- Aktualisiert nur, wenn sich die Version geändert hat
- Gibt Rückmeldung zu jeder Aktion

## Pre-checks-Skript {#pre-checks-script}

```bash
./scripts/pre-checks.sh
```

Dieses Skript führt Vorprüfungen durch, bevor der Entwicklungsserver gestartet, erstellt oder der Produktionsserver gestartet wird. Es:
- Stellt sicher, dass die Datei `.duplistatus.key` vorhanden ist (über `ensure-key-file.sh`)
- Aktualisiert die Versionsinformationen (über `update-version.sh`)

Dieses Skript wird automatisch durch `pnpm dev`, `pnpm build` und `pnpm start-local` aufgerufen.

## Sicherstellen, dass die Schlüsseldatei vorhanden ist {#ensure-key-file-exists}

```bash
./scripts/ensure-key-file.sh
```

Dieses Skript stellt sicher, dass die `.duplistatus.key`-Datei im `data`-Verzeichnis vorhanden ist. Es:
- Erstellt das `data`-Verzeichnis, falls es nicht existiert
- Generiert eine neue 32-Byte-Zufallsschlüsseldatei, falls nicht vorhanden
- Setzt die Dateiberechtigungen auf 0400 (nur Lesen für den Besitzer)
- Behebt Berechtigungen, falls diese falsch sind

Die Schlüsseldatei wird für kryptografische Operationen in der Anwendung verwendet.

## Admin-Kontowiederherstellung {#admin-account-recovery}

```bash
./admin-recovery <username> <new-password>
```

Dieses Skript ermöglicht die Wiederherstellung von Administrator-Konten, falls der Zugriff gesperrt ist oder das Passwort vergessen wurde. Es:
- Setzt das Passwort für den angegebenen Benutzer zurück
- Entsperrt das Konto, falls es gesperrt war
- Setzt den Zähler für fehlgeschlagene Anmeldeversuche zurück
- Entfernt die Kennung „Passwort muss geändert werden“
- Überprüft, ob das Passwort die Sicherheitsanforderungen erfüllt
- Protokolliert die Aktion im Audit-Log

**Beispiel:**

```bash
./admin-recovery admin NewPassword123
```

>[!CAUTION]
> Dieses Skript modifiziert die Datenbank direkt. Verwenden Sie es nur bei Bedarf zur Kontowiederherstellung.

## Bilder kopieren {#copy-images}

```bash
./scripts/copy-images.sh
```

Kopiert Bilddateien von `documentation/static/img` an ihre entsprechenden Speicherorte in der Anwendung:
- Kopiert `favicon.ico` nach `src/app/`
- Kopiert `duplistatus_logo.png` nach `public/images/`
- Kopiert `duplistatus_banner.png` nach `public/images/`

Nützlich zum Synchronisieren von Anwendungsbildern mit Dokumentationsbildern.

## Versionen zwischen Entwicklung und Docker vergleichen {#compare-versions-between-development-and-docker}

```bash
./scripts/compare-versions.sh
```

Dieses Skript vergleicht die Versionen zwischen Ihrer Entwicklungsumgebung und einem laufenden Docker-Container. Es:
- Vergleicht SQLite-Versionen nur nach Hauptversion (z. B. werden 3.45.1 und 3.51.1 als kompatibel betrachtet und als „✅ (major)“ angezeigt)
- Vergleicht Node-, npm- und Duplistatus-Versionen exakt (müssen genau übereinstimmen)
- Zeigt eine formatierte Tabelle mit allen Versionsvergleichen an
- Gibt eine Zusammenfassung mit farbcodierten Ergebnissen aus (✅ für Übereinstimmungen, ❌ für Abweichungen)
- Beendet sich mit Exit-Code 0, wenn alle Versionen übereinstimmen, andernfalls mit Code 1

**Anforderungen:**
- Docker-Container mit dem Namen `duplistatus` muss ausgeführt werden
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

**Hinweis:** SQLite-Versionen werden nur nach der Hauptversion verglichen, da verschiedene Patch-Versionen innerhalb derselben Hauptversion in der Regel kompatibel sind. Das Skript zeigt an, wenn SQLite-Versionen auf der Hauptebene übereinstimmen, aber in den Patch-Versionen unterschiedlich sind.

## Anzeigen der Konfigurationen in der Datenbank {#viewing-the-configurations-in-the-database}

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

## Sicherungseinstellungen einblenden {#show-backup-settings}

```bash
./scripts/show-backup-settings.sh [database_path]
```

Zeigt den Inhalt des `backup_settings`-Wertes in der Konfigurationstabelle in einer formatierten Tabelle an. Nützlich zum Debuggen von Benachrichtigungskonfigurationen. Standard-Datenbankpfad: `data/backups.db`.
