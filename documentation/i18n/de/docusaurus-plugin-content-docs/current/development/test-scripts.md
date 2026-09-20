# Testskripte {/* #test-scripts */}

Das Projekt enthält mehrere Testskripte zur Unterstützung bei Entwicklung und Tests:

> [!NOTE]
> Die Legacy-Repository-Root `pnpm`-Hilfsprogramme für überfälliges Debugging, SMTP-Matrix-Tests und Cron-Port-Überprüfungen wurden entfernt. Verwenden Sie die Anwendungsoberfläche (**Einstellungen → Backup-Überwachung**), authentifizierte HTTP-APIs und `curl` gegen den Cron-Dienst, wie unten dokumentiert.

## Testdaten generieren {/* #generate-test-data */}

```bash
pnpm generate-test-data --servers=N
```

Dieses Skript generiert Test-Backup-Daten für mehrere Server und Backups.

Der Parameter `--servers=N` ist **zwingend erforderlich** und gibt die Anzahl der zu generierenden Server an (1–30).

Verwenden Sie die Option `--upload`, um die generierten Daten an `/api/upload` zu senden

```bash
pnpm generate-test-data --servers=N --upload
pnpm generate-test-data --servers=N --upload --api-key=YOUR_UPLOAD_KEY
```

`--api-key` ist erforderlich, wenn unter Einstellungen → API-Schlüssel festgelegt ist, dass Schlüssel benötigt werden. Das Skript versucht es einmal erneut bei HTTP 429, sodass ein großer `--upload`-Durchlauf innerhalb der Standard-Ratelimits bleibt.

**Beispiele:**

```bash
# Generate data for 5 servers
pnpm generate-test-data --servers=5

# Generate data for 1 server with upload mode
pnpm generate-test-data --upload --servers=1

# Generate data for all 30 servers
pnpm generate-test-data --servers=30
```

Das Skript weist Duplicati-Versionen **pro Server** zu (derselbe Berichtsstring wird in jedes Backup dieses Servers geschrieben):

- **70–80 % aktuell**: verwendet die neueste zwischengespeicherte stabile Version von `configurations.duplicati_versions`, falls verfügbar, andernfalls einen festgelegten Ausweichwert (`2.1.0.5_stable`).
- **Rest älter**: eine streng vorhergehende stabile Version, damit das Dashboard-Badge als veraltet (gelb) verglichen wird.
- Der Direct-DB-Modus löscht zuerst `configurations`, dann werden Version-Cache wiederhergestellt oder initialisiert, damit der Vergleich aktuell/veraltet sofort funktioniert.
- Kleine Mengen erreichen nicht immer 70–80 %: `--servers=1` ist 100 % aktuell; `--servers=2` oder `3` behält mindestens einen älteren Server; `--servers=6` sind 5 aktuelle (83 %). `--servers=12` (verwendet von `pnpm take-screenshots`) ist **9 aktuell / 3 älter**.
- Wenn `pnpm take-screenshots` später den Datensatz auf drei Server reduziert, behält es den geschützten überfälligen Server und **mindestens einen Server mit älterer Version**.

>[!CAUTION]
> Dieses Skript löscht alle vorherigen Daten in der Datenbank und ersetzt sie durch Testdaten.
> Sichern Sie Ihre Datenbank, bevor Sie dieses Skript ausführen.

## Überprüfungen auf überfällige Aufgaben und Cron-Konnektivität (Entwicklung) {/* #overdue-checks-and-cron-connectivity-development */}

### Eine Überprüfung auf überfällige Backups ausführen {/* #run-an-overdue-backup-check */}

Während die Anwendung läuft:

- **Benutzeroberfläche (empfohlen)**: Öffnen Sie **Einstellungen → Backup-Überwachung** und verwenden Sie **Test überfällige Backups**. Dadurch wird dieselbe Logik wie beim geplanten Job über authentifiziertes `POST /api/notifications/check-overdue` ausgeführt.

### Cron-Dienst-Zustand {/* #cron-service-health */}

```bash
curl http://localhost:8667/health
curl http://localhost:8666/api/cron/health
```

### Simulieren eines bestimmten Datums oder einer bestimmten Uhrzeit {/* #simulating-a-specific-date-or-time */}

Es gibt keine integrierte Befehlszeilenschnittstelle zum Einspeisen einer simulierten „aktuellen“ Zeit. Für den Algorithmus und Ideen zum manuellen Testen siehe die Repository-Datei `dev/OVERDUE_DETECTION_ALGORITHM.md` und die Implementierung in `src/lib/overdue-backup-checker.ts`.

## CSV-Export validieren {/* #validate-csv-export */}

```bash
pnpm validate-csv-export
```

Dieses Skript validiert die CSV-Export-Funktionalität. Es:
- Testet die Generierung des CSV-Exports
- Überprüft Datenformat und -struktur
- Prüft die Datenintegrität in den exportierten Dateien

Nützlich, um sicherzustellen, dass CSV-Exporte vor Veröffentlichungen korrekt funktionieren.

## NTFY-Server temporär blockieren (zum Testen) {/* #temporarily-block-ntfy-server-for-testing */}

```bash
sudo ./scripts/temporary_ntfy.sh_block.sh
```

Dieses Skript blockiert vorübergehend den ausgehenden Netzwerkzugriff auf den NTFY-Server (`ntfy.sh`), um den Wiederholungsmechanismus für Benachrichtigungen zu testen. Es:
- Ermittelt die IP-Adresse des NTFY-Servers
- Fügt eine iptables-Regel hinzu, um ausgehenden Datenverkehr zu blockieren
- Blockiert für 10 Sekunden (konfigurierbar)
- Entfernt automatisch die Blockierungsregel beim Beenden
- Erfordert Root-Rechte (sudo)

>[!CAUTION]
> Dieses Skript ändert iptables-Regeln und benötigt Root-Rechte. Nur zum Testen von Wiederholungsmechanismen für Benachrichtigungen verwenden.

## Datenbank-Migrations-Tests {/* #database-migration-testing */}

Das Projekt enthält Skripte zum Testen von Datenbankmigrationen von älteren Versionen zur aktuellen Version. Diese Skripte stellen sicher, dass Datenbankmigrationen ordnungsgemäß funktionieren und die Datenintegrität erhalten bleibt.

### Migrations-Testdaten generieren {/* #generate-migration-test-data */}

```bash
./scripts/generate-migration-test-data.sh
```

Dieses Skript generiert Testdatenbanken für mehrere historische Versionen der Anwendung. Es:

1. **Stoppt und entfernt** alle vorhandenen Docker-Container
2. **Für jede Version** (v0.4.0, v0.5.0, v0.6.1, 0.7.27, 0.8.21):
   - Entfernt vorhandene Datenbankdateien
   - Erstellt eine Versions-Tag-Datei
   - Startet einen Docker-Container mit der jeweiligen spezifischen Version
   - Wartet, bis der Container bereit ist
   - Generiert Testdaten mithilfe von `pnpm generate-test-data`
   - Erstellt einen Screenshot der Benutzeroberfläche mit Testdaten
   - Stoppt und entfernt den Container
   - Leert WAL-Dateien und speichert das Datenbankschema
   - Kopiert die Datenbankdatei nach `scripts/migration_test_data/`

**Voraussetzungen:**
- Docker muss installiert und konfiguriert sein
- Chromium (über Playwright) muss installiert sein
- Root/Sudo-Zugriff für Docker-Operationen
- Das Docker-Volume `duplistatus_data` muss vorhanden sein

**Ausgabe:**
- Datenbankdateien: `scripts/migration_test_data/backups_<VERSION>.db`
- Schema-Dateien: `scripts/migration_test_data/backups_<VERSION>.schema`
- Screenshots: `scripts/migration_test_data/duplistatus_test_data_<VERSION>.png`

**Konfiguration:**
- Anzahl der Server: Festgelegt über Variable `SERVERS` (Standard: 3)
- Datenausgabeverzeichnis: `/var/lib/docker/volumes/duplistatus_data/_data`
- Port: 9666 (Docker-Container-Port)

>[!CAUTION]
> Dieses Skript benötigt Docker und wird vorhandene Container stoppen/entfernen. Es benötigt auch Sudo-Zugriff für Docker-Operationen und Dateisystemzugriff. Führen Sie zuerst `pnpm take-screenshots:install` aus, um den Playwright Chromium-Browser zu installieren, falls Sie dies noch nicht getan haben.

>[!IMPORTANT]
> Dieses Skript sollte nur einmal ausgeführt werden, da neue Versionen vom Entwickler direkt in das Verzeichnis `scripts/migration_test_data/` kopiert werden können. Während der Entwicklung einfach das Skript `./scripts/test-migrations.sh` ausführen, um die Migrationen zu testen.

### Datenbankmigrationen testen {/* #test-database-migrations */}

```bash
./scripts/test-migrations.sh
```

Dieses Skript testet Datenbankmigrationen von alten Versionen zur aktuellen Version (4.0). Es:

1. **Für jede Version** (v0.4.0, v0.5.0, v0.6.1, 0.7.27, 0.8.21):
   - Erstellt eine temporäre Kopie der Testdatenbank
   - Führt den Migrationsprozess unter Verwendung von `test-migration.ts` aus
   - Validiert die migrierte Datenbankstruktur
   - Überprüft auf erforderliche Tabellen und Spalten
   - Stellt sicher, dass die Datenbankversion 4.0 ist
   - Entfernt temporäre Dateien

**Voraussetzungen:**
- Testdatenbanken müssen in `scripts/migration_test_data/` vorhanden sein
- Wird durch Ausführen von `generate-migration-test-data.sh` zuerst generiert

**Ausgabe:**
- Farbcodierte Testergebnisse (grün für bestanden, rot für fehlgeschlagen)
- Zusammenfassung der bestandenen und fehlgeschlagenen Versionen
- Detaillierte Fehlermeldungen für fehlgeschlagene Migrationen
- Rückgabecode 0, wenn alle Tests bestehen, 1, wenn einer fehlschlägt

**Was es validiert:**
- Datenbankversion ist nach Migration 4.0
- Alle erforderlichen Tabellen existieren: `servers`, `backups`, `configurations`, `users`, `sessions`, `audit_log`, `db_version`
- Erforderliche Spalten existieren in jeder Tabelle
- Datenbankstruktur ist korrekt

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
> Dieses Skript verwendet intern das TypeScript-Migrationstestskript (`test-migration.ts`). Das Testskript validiert die Datenbankstruktur nach der Migration und stellt die Datensicherheit sicher.

## SMTP und E-Mail (Entwicklung) {/* #smtp-and-email-development */}

Konfigurieren Sie SMTP unter **Einstellungen → E-Mail** und verwenden Sie die integrierten E-Mail-Test- und Benachrichtigungsabläufe. Die ehemaligen Hilfsskripte `pnpm set-smtp-test-config` und `pnpm test-smtp-connections` wurden aus dem Repository entfernt.

## Test-Docker-Entrypoint-Skript {/* #test-docker-entrypoint-script */}

```bash
pnpm test-entrypoint
```

Dieses Skript bietet einen Test-Wrapper für `docker-entrypoint.sh` in der lokalen Entwicklung. Es richtet die Umgebung ein, um die Entry-Point-Protokollierungsfunktionalität zu testen, und stellt sicher, dass Protokolle in `data/logs/` geschrieben werden, damit die Anwendung darauf zugreifen kann.

**Was es tut:**

1. **Erstellt immer eine frische Version**: Führt automatisch `pnpm build-local` aus, um vor dem Testen eine frische Build-Version zu erstellen (kein manuelles Erstellen erforderlich)
2. **Erstellt Cron-Service**: Stellt sicher, dass der Cron-Service erstellt wird (`dist/cron-service.cjs`)
3. **Richtet Docker-ähnliche Struktur ein**: Erstellt notwendige symbolische Links und Verzeichnisstruktur, um die Docker-Umgebung zu simulieren
4. **Führt Entry-Point-Skript aus**: Führt `docker-entrypoint.sh` mit richtigen Umgebungsvariablen aus
5. **Räumt auf**: Entfernt beim Beenden automatisch temporäre Dateien

**Verwendung:**

```bash
# Run the test (builds fresh version automatically)
pnpm test-entrypoint
```

**Umgebungsvariablen:**
- `PORT=8666` - Port für den Next.js-Server (entspricht `start-local`)
- `CRON_PORT=8667` - Port für den Cron-Service
- `VERSION` - Automatisch auf `test-YYYYMMDD-HHMMSS`-Format gesetzt

**Ausgabe:**
- Protokolle werden in `data/logs/application.log` geschrieben (zugänglich für die Anwendung)
- Konsolenausgabe zeigt die Ausführung des Entry-Point-Skripts an
- Drücken Sie Strg+C, um zu stoppen und das Leeren der Protokolle zu testen

**Voraussetzungen:**
- Das Skript muss aus dem Hauptverzeichnis des Repositorys ausgeführt werden (pnpm behandelt dies automatisch)
- Das Skript behandelt automatisch alle Voraussetzungen (Build, Cron-Service usw.)

**Anwendungsfälle:**
- Testen von Änderungen am Einstiegsskript lokal vor der Docker-Bereitstellung
- Überprüfen der Protokollrotation und Protokollierungsfunktionalität
- Testen des ordnungsgemäßen Herunterfahrens und Signalbehandlung
- Debuggen des Verhaltens des Einstiegsskripts in einer lokalen Umgebung

## Validierung der täglichen Zusammenfassung {/* #daily-summary-validation */}

```bash
pnpm validate-daily-summary
```

Führt deterministische Prüfungen für die Planung der täglichen Zusammenfassung durch (einschließlich Sommerzeit), Aggregation von Snapshots (nur neueste Sicherungsjobs), Bereinigung überflüssiger Benachrichtigungseinstellungen, verwaiste Sicherungs-/Server-Einträge, Markdown-Bereinigung, Delivery-Ledger-Ansprüche und Schema-Migration von 4.1 auf 4.2 mit angepassten Vorlagen. Sendet keine E-Mails oder NTFY-Benachrichtigungen.
