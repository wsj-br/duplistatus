---
translation_last_updated: '2026-02-15T20:57:35.484Z'
source_file_mtime: '2026-02-06T21:19:15.606Z'
source_file_hash: a8ff236072ebae34
translation_language: de
source_file_path: development/workspace-admin-scripts-commands.md
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

Entfernt alle Build-Artefakte, das node_modules-Verzeichnis und andere generierte Dateien, um einen sauberen Zustand zu gewährleisten. Dies ist nützlich, wenn Sie eine Neuinstallation durchführen oder Abhängigkeitsprobleme beheben müssen. Der Befehl wird Folgendes löschen:
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
- pnpm Store-Cache (über `pnpm store prune`)
- Docker-Build-Cache und Systembereinigung (Images, Netzwerke, Volumes)

## Docker Compose und Docker-Umgebung bereinigen {#clean-docker-compose-and-docker-environment}

```bash
scripts/clean-docker.sh
```

Führen Sie eine vollständige Docker-Bereinigung durch, die nützlich ist für:
- Freigabe von Speicherplatz
- Entfernung alter/ungenutzter Docker-Artefakte
- Bereinigung nach Entwicklungs- oder Testsitzungen
- Wartung einer sauberen Docker-Umgebung

## Aktualisieren Sie die Pakete auf die neueste Version {#update-the-packages-to-the-latest-version}

Sie können Pakete manuell aktualisieren mit:

```bash
ncu --upgrade
pnpm update
```

Oder verwenden Sie das automatisierte Skript:

```bash
./scripts/upgrade-dependencies.sh
```

Das Skript `upgrade-dependencies.sh` automatisiert den gesamten Abhängigkeits-Upgrade-Prozess:
- Aktualisiert `package.json` mit den neuesten Versionen mithilfe von `npm-check-updates`
- Aktualisiert die pnpm-Sperrdatei und installiert aktualisierte Abhängigkeiten
- Aktualisiert die browserslist-Datenbank
- Prüft auf Sicherheitslücken mithilfe von `pnpm audit`
- Behebt Sicherheitslücken automatisch mithilfe von `pnpm audit fix`
- Prüft erneut auf Sicherheitslücken nach der Behebung, um die Fixes zu bestätigen

Dieses Skript bietet einen vollständigen Workflow zum Aktualisieren und Sichern von Abhängigkeiten.

## Prüfen auf ungenutzte Pakete {#check-for-unused-packages}

```bash
pnpm depcheck
```

## Versionsinformationen aktualisieren {#update-version-information}

```bash
./scripts/update-version.sh
```

Dieses Skript aktualisiert automatisch Versionsinformationen über mehrere Dateien hinweg, um sie synchron zu halten. Es:
- Extrahiert die Version aus `package.json`
- Aktualisiert die `.env`-Datei mit der `VERSION`-Variable (erstellt sie, falls sie nicht vorhanden ist)
- Aktualisiert die `Dockerfile` mit der `VERSION`-Variable (falls vorhanden)
- Aktualisiert das Versionfeld in `documentation/package.json` (falls vorhanden)
- Aktualisiert nur, wenn sich die Version geändert hat
- Gibt Rückmeldung zu jeder Operation

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

Dieses Skript stellt sicher, dass die Datei `.duplistatus.key` im Verzeichnis `data` vorhanden ist. Es:
- Erstellt das Verzeichnis `data`, falls es nicht existiert
- Generiert eine neue 32-Byte-Zufallsschlüsseldatei, falls diese fehlt
- Setzt die Dateiberechtigungen auf 0400 (Lesezugriff nur für Besitzer)
- Behebt Berechtigungen, falls diese fehlerhaft sind

Die Schlüsseldatei wird für kryptografische Operationen in der Anwendung verwendet.

## Admin-Kontowiederherstellung {#admin-account-recovery}

```bash
./admin-recovery <username> <new-password>
```

Dieses Skript ermöglicht die Wiederherstellung von Admin-Konten, falls diese gesperrt oder das Passwort vergessen wurde. Es:
- Setzt das Passwort für den angegebenen Benutzer zurück
- Entsperrt das Konto, falls es gesperrt war
- Setzt den Zähler für fehlgeschlagene Anmeldeversuche zurück
- Löscht das Flag „Passwort muss geändert werden"
- Validiert, dass das Passwort die Sicherheitsanforderungen erfüllt
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

Dieses Skript vergleicht Versionen zwischen Ihrer Entwicklungsumgebung und einem laufenden Docker-Container. Es:
- Vergleicht SQLite-Versionen nur nach Hauptversion (z. B. 3.45.1 vs 3.51.1 werden als kompatibel betrachtet, angezeigt als "✅ (major)")
- Vergleicht Node-, npm- und duplistatus-Versionen exakt (müssen genau übereinstimmen)
- Zeigt eine formatierte Tabelle mit allen Versionsvergleichen an
- Bietet eine Zusammenfassung mit farbcodierten Ergebnissen (✅ für Übereinstimmungen, ❌ für Abweichungen)
- Beendet sich mit Code 0, wenn alle Versionen übereinstimmen, mit Code 1 bei Abweichungen

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
