# Testskripte {/* #test-scripts */}

Das Projekt enthält mehrere Testskripte, die bei der Entwicklung und beim Testen helfen:

> [!NOTE]
> Hilfsprogramme für das Repository-Root (`pnpm`) zur Überprüfung überfälliger Backups, SMTP-Matrix-Tests und Port-Prüfungen für Cron wurden entfernt. Verwenden Sie die Anwendungsoberfläche (**Einstellungen → Backup-Überwachung**), authentifizierte HTTP-APIs und `curl` gegen den Cron-Dienst wie unten beschrieben.

## Testdaten generieren {/* #generate-test-data */}

```bash
pnpm generate-test-data --servers=N
```

Dieses Skript generiert Test-Backup-Daten für mehrere Server und Backups.

Der Parameter `--servers=N` ist **erforderlich** und gibt die Anzahl der zu generierenden Server an (1-30).

Verwenden Sie die Option `--upload`, um die generierten Daten an `/api/upload` zu senden.

```bash
pnpm generate-test-data --servers=N --upload
pnpm generate-test-data --servers=N --upload --api-key=YOUR_UPLOAD_KEY
```

`--api-key` ist erforderlich, wenn in den Einstellungen → API-Schlüssel die Verwendung von Schlüsseln aktiviert ist. Das Skript wiederholt den Versuch einmal bei HTTP 429, damit ein großer `--upload` Lauf innerhalb der Standard-Rate-Limits bleibt.

**Beispiele:**

```bash
# Generate data for 5 servers
pnpm generate-test-data --servers=5

# Generate data for 1 server with upload mode
pnpm generate-test-data --upload --servers=1

# Generate data for all 30 servers
pnpm generate-test-data --servers=30
```

Das Skript weist Duplicati-Versionen **pro Server** zu (der gleiche Bericht-String wird für jedes Backup desselben Servers geschrieben):

- **70–80% aktuell**: verwendet die neueste zwischengespeicherte stabile Version von `configurations.duplicati_versions`, falls verfügbar, sonst eine festgelegte Fallback-Version (`2.1.0.5_stable`).
- **Verbleibende ältere**: eine strikt vorherige stabile Version, damit das Dashboard-Badge als veraltet angezeigt wird (gelb).
- Der Direkt-DB-Modus löscht `configurations` zuerst, dann wird die Version zwischengespeichert, damit die Vergleichbarkeit zwischen aktuell und veraltet sofort funktioniert.
- Kleine Mengen können nicht immer in 70–80% landen: `--servers=1` ist 100% aktuell; `--servers=2` oder `3` behält mindestens einen älteren Server; `--servers=6` ist 5 aktuell (83%). `--servers=12` (verwendet von `pnpm take-screenshots`) ist **9 aktuell / 3 älter**.
- Wenn `pnpm take-screenshots` später die Datenmenge auf drei Server reduziert, behält es den geschützten überfälligen Server und **mindestens einen Server mit älterer Version**.

>[!CAUTION]
> Dieses Skript löscht alle vorherigen Daten in der Datenbank und ersetzt sie durch Testdaten.
> Sichern Sie Ihre Datenbank vor dem Ausführen dieses Skripts.

## Überprüfung überfälliger Backups und Cron-Konnektivität (Entwicklung) {/* #overdue-checks-and-cron-connectivity-development */}

### Überprüfung überfälliger Backups ausführen {/* #run-an-overdue-backup-check */}

Während die Anwendung läuft:

- **UI (empfohlen):** Öffnen Sie **Einstellungen → Backup-Überwachung** und verwenden Sie **Überfällige Backups testen**. Dies führt dieselbe Logik wie der geplante Job über authentifizierte `POST /api/notifications/check-overdue` aus.

### Cron-Dienst-Health {/* #cron-service-health */}

```bash
curl http://localhost:8667/health
curl http://localhost:8666/api/cron/health
```

### Simulation eines bestimmten Datums oder einer bestimmten Uhrzeit {/* #simulating-a-specific-date-or-time */}

Es gibt kein gebündeltes CLI zum Einfügen einer simulierten „aktuellen“ Zeit. Für den Algorithmus und Ideen zur manuellen Tests finden Sie die Repository-Datei `dev/OVERDUE_DETECTION_ALGORITHM.md` und die Implementierung in `src/lib/overdue-backup-checker.ts`.

## CSV-Export validieren {/* #validate-csv-export */}

```bash
pnpm validate-csv-export
```

Dieses Skript validiert die CSV-Export-Funktionalität. Es:
- Testet die CSV-Export-Generierung
- Überprüft das Datenformat und die Struktur
- Prüft die Datenintegrität in den exportierten Dateien

Nützlich, um sicherzustellen, dass CSV-Exporte vor Releases korrekt funktionieren.

## NTFY-Server temporär blockieren (für Tests) {/* #temporarily-block-ntfy-server-for-testing */}

```bash
sudo ./scripts/temporary_ntfy.sh_block.sh
```

Dieses Skript blockiert temporär den ausgehenden Netzwerkzugriff zum NTFY-Server (`ntfy.sh`), um das Benachrichtigungs-Wiederholungsmechanismus zu testen. Es:
- Löst die IP-Adresse des NTFY-Servers auf
- Fügt eine iptables-Regel hinzu, um den ausgehenden Datenverkehr zu blockieren
- Blockiert für 10 Sekunden (konfigurierbar)
- Entfernt die Blockierungsregel automatisch beim Beenden
- Erfordert Root-Rechte (sudo)

>[!CAUTION]
> Dieses Skript ändert iptables-Regeln und erfordert Root-Rechte. Verwenden Sie es nur zum Testen des Benachrichtigungs-Wiederholungsmechanismus.

## Datenbank-Migrationstests {/* #database-migration-testing */}

Das Projekt enthält Skripte zum Testen von Datenbank-Migrationen von älteren Versionen zur aktuellen Version. Diese Skripte stellen sicher, dass Datenbank-Migrationen korrekt funktionieren und die Datenintegrität erhalten bleiben.

### Migrationstestdaten generieren {/* #generate-migration-test-data */}

```bash
./scripts/generate-migration-test-data.sh
```

Dieses Skript generiert Testdatenbanken für mehrere historische Versionen der Anwendung. Es:

1. **Stoppt und entfernt** alle vorhandenen Docker-Container
2. **Für jede Version** (v0.4.0, v0.5.0, v0.6.1, 0.7.27, 0.8.21):
   - Entfernt vorhandene Datenbankdateien
   - Erstellt eine Versions-Tag-Datei
   - Startet einen Docker-Container mit der spezifischen Version
   - Wartet, bis der Container bereit ist
   - Generiert Testdaten mit `pnpm generate-test-data`
   - Erstellt einen Screenshot der Benutzeroberfläche mit Testdaten
   - Stoppt und entfernt den Container
   - Leert WAL-Dateien und speichert das Datenbankschema
   - Kopiert die Datenbankdatei nach `scripts/migration_test_data/`

**Anforderungen:**
- Docker muss installiert und konfiguriert sein
- Chromium (über Playwright) muss installiert sein
- Root/Sudo-Zugriff für Docker-Operationen
- Das Docker-Volume `duplistatus_data` muss existieren

**Ausgabe:**
- Datenbankdateien: `scripts/migration_test_data/backups_<VERSION>.db`
- Schemadateien: `scripts/migration_test_data/backups_<VERSION>.schema`
- Screenshots: `scripts/migration_test_data/duplistatus_test_data_<VERSION>.png`

**Konfiguration:**
- Anzahl der Server: Über die Variable `SERVERS` einstellbar (Standard: 3)
- Datenverzeichnis: `/var/lib/docker/volumes/duplistatus_data/_data`
- Port: 9666 (Docker-Container-Port)

>[!CAUTION]
> Dieses Skript erfordert Docker und stoppt/entfernt vorhandene Container. Es erfordert auch Sudo-Zugriff für Docker-Operationen und Dateisystemzugriff. Führen Sie `pnpm take-screenshots:install` zuerst aus, um den Playwright-Chromium-Browser zu installieren, falls dies noch nicht geschehen ist.

>[!IMPORTANT]
> Dieses Skript sollte nur einmal ausgeführt werden, da neue Versionen der Entwickler die Datenbankdatei und Screenshots direkt in das `scripts/migration_test_data/`-Verzeichnis kopieren können. Während der Entwicklung führen Sie einfach das `./scripts/test-migrations.sh`-Skript aus, um die Migrationen zu testen.

### Testen von Datenbank-Migrationen {/* #test-database-migrations */}

```bash
./scripts/test-migrations.sh
```

Dieses Skript testet Datenbank-Migrationen von alten Versionen zur aktuellen Version (4.0). Es:

1. **Für jede Version** (v0.4.0, v0.5.0, v0.6.1, 0.7.27, 0.8.21):
   - Erstellt eine temporäre Kopie der Testdatenbank
   - Führt den Migrationsprozess mit `test-migration.ts` aus
   - Validiert die Struktur der migrierten Datenbank
   - Prüft auf erforderliche Tabellen und Spalten
   - Überprüft, ob die Datenbankversion 4.0 ist
   - Bereinigt temporäre Dateien

**Anforderungen:**
- Testdatenbanken müssen in `scripts/migration_test_data/` existieren
- Wurden durch Ausführen von `generate-migration-test-data.sh` erstellt

**Ausgabe:**
- Farbcodierte Testresultate (grün für Erfolg, rot für Fehler)
- Zusammenfassung der erfolgreichen und fehlgeschlagenen Versionen
- Detaillierte Fehlermeldungen für fehlgeschlagene Migrationen
- Exit-Code 0, wenn alle Tests erfolgreich sind, 1, wenn einer fehlschlägt

**Was wird validiert:**
- Die Datenbankversion ist nach der Migration 4.0
- Alle erforderlichen Tabellen existieren: `servers`, `backups`, `configurations`, `users`, `sessions`, `audit_log`, `db_version`
- Erforderliche Spalten existieren in jeder Tabelle
- Die Datenbankstruktur ist korrekt

**Beispielausgabe:**

```
==========================================
Database Migration Test Suite
==========================================

Testing migrations from old versions to version 4.0
Test data directory: /path/to/migration_test_data
Temporary directory: /path/to/migration_test_data/.tmp

----------------------------------------
Testing version: v0.4.0
----------------------------------------
  Copying database file to temporary location...
  Running migration test...
✅ Version v0.4.0: Migration test PASSED

==========================================
Test Summary
==========================================

✅ Passed versions (5):
  ✓ v0.4.0
  ✓ v0.5.0
  ✓ v0.6.1
  ✓ 0.7.27
  ✓ 0.8.21

All migration tests passed!
```

**Verwendung:**

```bash
# Run all migration tests
./scripts/test-migrations.sh

# Check exit code
echo $?  # 0 = all passed, 1 = some failed
```

>[!NOTE]
> Dieses Skript verwendet das TypeScript-Migrationstestskript (`test-migration.ts`) intern. Das Testskript validiert die Datenbankstruktur nach der Migration und stellt die Datenintegrität sicher.

## SMTP und E-Mail (Entwicklung) {/* #smtp-and-email-development */}

Konfigurieren Sie SMTP unter **Einstellungen → E-Mail** und verwenden Sie die in-App-E-Mail-Test- und Benachrichtigungsflüsse. Die vorherigen `pnpm set-smtp-test-config` und `pnpm test-smtp-connections` Hilfsskripte wurden aus dem Repository entfernt.

## Testen des Docker-Einstiegsskripts {/* #test-docker-entrypoint-script */}

```bash
pnpm test-entrypoint
```

Dieses Skript bietet einen Testwrapper für `docker-entrypoint.sh` in der lokalen Entwicklung. Es richtet die Umgebung ein, um die Logging-Funktionalität des Einstiegsskripts zu testen und stellt sicher, dass die Protokolle in `data/logs/` geschrieben werden, damit die Anwendung darauf zugreifen kann.

**Was es tut:**

1. **Erstellt immer eine frische Version**: Führt `pnpm build-local` automatisch aus, um eine frische Version vor dem Testen zu erstellen (kein manuelles Erstellen erforderlich)
2. **Erstellt den Cron-Dienst**: Stellt sicher, dass der Cron-Dienst erstellt wird (`dist/cron-service.cjs`)
3. **Richtet eine Docker-ähnliche Struktur ein**: Erstellt notwendige Symlinks und Verzeichnisstruktur, um die Docker-Umgebung zu imitieren
4. **Führt das Einstiegsskript aus**: Führt `docker-entrypoint.sh` mit den richtigen Umgebungsvariablen aus
5. **Bereinigt**: Entfernt temporäre Dateien automatisch beim Beenden

**Verwendung:**

```bash
# Run the test (builds fresh version automatically)
pnpm test-entrypoint
```

**Umgebungsvariablen:**
- `PORT=8666` - Port für den Next.js-Server (entspricht `start-local`)
- `CRON_PORT=8667` - Port für den cron-Dienst
- `VERSION` - Wird automatisch auf `test-YYYYMMDD-HHMMSS`-Format gesetzt

**Ausgabe:**
- Protokolle werden in `data/logs/application.log` geschrieben (zugänglich durch die Anwendung)
- Konsolenausgabe zeigt die Ausführung des Einstiegsskripts
- Drücken Sie Strg+C, um zu stoppen und das Protokoll-Flushing zu testen

**Anforderungen:**
- Das Skript muss aus dem Repository-Stammverzeichnis ausgeführt werden (pnpm erledigt dies automatisch)
- Das Skript erledigt alle Voraussetzungen automatisch (Build, cron-Dienst, etc.)

**Anwendungsfälle:**
- Lokales Testen von Änderungen am Einstiegsskript vor der Docker-Bereitstellung
- Überprüfung der Protokollrotation und der Protokollfunktionalität
- Testen des ordnungsgemäßen Herunterfahrens und der Signalbehandlung
- Debuggen des Einstiegsskriptverhaltens in einer lokalen Umgebung

## Tägliche Zusammenfassung Validierung {/* #daily-summary-validation */}

```bash
pnpm validate-daily-summary
```

Führt deterministische Prüfungen für die Planung der Täglichen Zusammenfassung (einschließlich Sommerzeit), die Aggregation von Snapshots (nur neueste Sicherungsjobs), die Bereinigung von Benachrichtigungseinstellungen, verwaiste Sicherungs-/Serverzeilen, die Markdown-Sanitisierung, die Lieferungsprotokollansprüche und die Schema-Migration 4.1 → 4.2 mit angepassten Vorlagen aus. Sendet keine E-Mail oder NTFY.
