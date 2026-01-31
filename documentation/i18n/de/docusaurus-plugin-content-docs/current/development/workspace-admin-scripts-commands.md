---
translation_last_updated: '2026-01-31T00:51:23.359Z'
source_file_mtime: '2026-01-27T14:22:06.830Z'
source_file_hash: 581bc6778a772b4e
translation_language: de
source_file_path: development/workspace-admin-scripts-commands.md
---
# Workspace-Admin-Skripte und -Befehle {#workspace-admin-scripts-commands}

## Datenbank bereinigen {#clean-database}

```bash
./scripts/clean-db.sh
```

Bereinigt die Datenbank durch Entfernen aller Daten, während das Datenbankschema und die Struktur erhalten bleiben.

>[!CAUTION]
> Mit Vorsicht verwenden, da dies alle vorhandenen Daten löscht.

## Bereinigung von Build-Artefakten und Abhängigkeiten {#clean-build-artefacts-and-dependencies}

```bash
scripts/clean-workspace.sh
```

Entfernt alle Build-Artefakte, das Verzeichnis node_modules und andere generierte Dateien, um einen sauberen Zustand zu gewährleisten. Dies ist nützlich, wenn Sie eine Neuinstallation durchführen oder Abhängigkeitsprobleme beheben müssen. Der Befehl löscht:
- `node_modules/` Verzeichnis
- `.next/` Build-Verzeichnis
- `dist/` Verzeichnis
- Alle Docker-Build-Caches und führt einen Docker-Systemprune durch
- pnpm Store-Cache
- Ungenutzte Docker-Systemressourcen (Images, Netzwerke, Volumes)
- Alle anderen Build-Cache-Dateien

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

Das `upgrade-dependencies.sh`-Skript automatisiert den gesamten Abhängigkeitsupgrade-Prozess:
- Aktualisiert `package.json` mit den neuesten Versionen mithilfe von `npm-check-updates`
- Aktualisiert die pnpm-Sperrdatei und installiert aktualisierte Abhängigkeiten
- Aktualisiert die browserslist-Datenbank
- Prüft auf Sicherheitslücken mithilfe von `pnpm audit`
- Behebt Sicherheitslücken automatisch mithilfe von `pnpm audit fix`
- Prüft nach der Behebung erneut auf Sicherheitslücken, um die Behebungen zu bestätigen

Dieses Skript bietet einen vollständigen Workflow zur Aktualisierung von Abhängigkeiten und zur Gewährleistung ihrer Sicherheit.

## Prüfen auf ungenutzte Pakete {#check-for-unused-packages}

```bash
pnpm depcheck
```

## Versionsinformationen aktualisieren {#update-version-information}

```bash
./scripts/update-version.sh
```

Dieses Skript aktualisiert automatisch Versionsinformationen über mehrere Dateien hinweg, um diese synchronisiert zu halten. Es:
- Extrahiert die Version aus `package.json`
- Aktualisiert die `.env`-Datei mit der `VERSION`-Variable (erstellt diese, falls sie nicht vorhanden ist)
- Aktualisiert die `Dockerfile` mit der `VERSION`-Variable (falls vorhanden)
- Aktualisiert das Versionierungsfeld in `documentation/package.json` (falls vorhanden)
- Aktualisiert nur, wenn sich die Version geändert hat
- Bietet Rückmeldung zu jeder Operation

## Pre-checks-Skript {#pre-checks-script}

```bash
./scripts/pre-checks.sh
```

Dieses Skript führt Vorabprüfungen durch, bevor der Entwicklungsserver gestartet, erstellt oder der Produktionsserver gestartet wird. Es:
- Stellt sicher, dass die Datei `.duplistatus.key` vorhanden ist (über `ensure-key-file.sh`)
- Aktualisiert die Versionsinformationen (über `update-version.sh`)

Dieses Skript wird automatisch durch `pnpm dev`, `pnpm build` und `pnpm start-local` aufgerufen.

## Sicherstellen, dass die Schlüsseldatei vorhanden ist {#ensure-key-file-exists}

```bash
./scripts/ensure-key-file.sh
```

Dieses Skript stellt sicher, dass die Datei `.duplistatus.key` im Verzeichnis `data` vorhanden ist. Es:
- Erstellt das Verzeichnis `data`, falls es nicht vorhanden ist
- Generiert eine neue 32-Byte-Zufallsschlüsseldatei, falls diese fehlt
- Setzt die Dateiberechtigungen auf 0400 (Lesezugriff nur für Eigentümer)
- Behebt Berechtigungen, falls diese fehlerhaft sind

Die Schlüsseldatei wird für kryptografische Operationen in der Anwendung verwendet.

## Wiederherstellung des Admin-Kontos {#admin-account-recovery}

```bash
./admin-recovery <username> <new-password>
```

Dieses Skript ermöglicht die Wiederherstellung von Admin-Konten bei Sperrung oder vergessenem Passwort. Es:
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

Kopiert Bilddateien von `docs/static/img` an ihre entsprechenden Positionen in der Anwendung:
- Kopiert `favicon.ico` zu `src/app/`
- Kopiert `duplistatus_logo.png` zu `public/images/`
- Kopiert `duplistatus_banner.png` zu `public/images/`

Nützlich zum Synchronisieren von Anwendungsbildern mit Dokumentationsbildern.

## Versionen zwischen Entwicklung und Docker vergleichen {#compare-versions-between-development-and-docker}

```bash
./scripts/compare-versions.sh
```

Dieses Skript vergleicht Versionen zwischen Ihrer Entwicklungsumgebung und einem laufenden Docker-Container. Es:
- Vergleicht SQLite-Versionen nur nach Hauptversion (z. B. werden 3.45.1 und 3.51.1 als kompatibel betrachtet, angezeigt als "✅ (major)")
- Vergleicht Node-, npm- und Duplistatus-Versionen exakt (müssen genau übereinstimmen)
- Zeigt eine formatierte Tabelle mit allen Versionsvergleichen an
- Bietet eine Zusammenfassung mit farbcodierten Ergebnissen (✅ für Übereinstimmungen, ❌ für Abweichungen)
- Beendet sich mit Code 0, wenn alle Versionen übereinstimmen, mit Code 1 bei Abweichungen

**Anforderungen:**
- Docker-Container mit dem Namen `duplistatus` muss ausgeführt werden
- Das Skript liest Versionsinformationen aus den Docker-Container-Protokollen

# German Translation

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

**Hinweis:** SQLite-Versionen werden nur nach der Hauptversion verglichen, da verschiedene Patch-Versionen innerhalb derselben Hauptversion im Allgemeinen kompatibel sind. Das Skript zeigt an, wenn SQLite-Versionen auf der Hauptebene übereinstimmen, aber in den Patch-Versionen unterschiedlich sind.

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

## SQL-Skripte zum Debuggen und Warten {#sql-scripts-for-debugging-and-maintenance}

Das Projekt enthält SQL-Skripte für die Datenbankwartung:

### Sicherungseinstellungen löschen {#delete-backup-settings}

```bash
sqlite3 data/backups.db < scripts/delete-backup-settings.sql
```

Dieses Skript entfernt alle Sicherungseinstellungen aus der Konfigurationstabelle. Verwenden Sie dieses mit Vorsicht, da alle Sicherungsmitteilungskonfigurationen zurückgesetzt werden.

### Letzte Sicherung löschen {#delete-last-backup}

```bash
sqlite3 data/backups.db < scripts/delete-last-backup.sql
```

Dieses Skript entfernt den neuesten Sicherungsdatensatz für jeden Server. Standardmäßig löscht es die letzte Sicherung für ALLE Server. Das Skript enthält kommentierte Beispiele zum Ausrichten auf bestimmte Server nach Name. Nützlich für Test- und Debugging-Zwecke.

**Hinweis**: Das Skript wurde aktualisiert, um mit dem aktuellen Datenbankschema zu funktionieren (verwendet die Tabelle `servers` und die Spalte `server_id`).

>[!CAUTION]
> Diese SQL-Skripte ändern die Datenbank direkt. Erstellen Sie immer eine Sicherung Ihrer Datenbank, bevor Sie diese Skripte ausführen.
