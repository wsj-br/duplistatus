---
translation_last_updated: '2026-02-16T02:21:34.808Z'
source_file_mtime: '2026-02-16T00:30:39.430Z'
source_file_hash: 6f3df4c1ef3576bd
translation_language: de
source_file_path: development/test-scripts.md
---
# Testskripte {#test-scripts}

Das Projekt enthält mehrere Test-Skripte, um bei der Entwicklung und dem Testen zu helfen:

## Testdaten generieren {#generate-test-data}

```bash
pnpm generate-test-data --servers=N
```

Dieses Skript generiert Testdaten für Sicherungen auf mehreren Servern und Sicherungen.

Der Parameter `--servers=N` ist **erforderlich** und gibt die Anzahl der zu generierenden Server an (1-30).

Verwenden Sie die Option `--upload`, um die generierten Daten an `/api/upload` zu senden.

```bash
pnpm generate-test-data --servers=N --upload
```

**Beispiele:**

```bash
# Generate data for 5 servers
pnpm generate-test-data --servers=5

# Generate data for 1 server with upload mode
pnpm generate-test-data --upload --servers=1

# Generate data for all 30 servers
pnpm generate-test-data --servers=30
```

>[!CAUTION]
> Dieses Skript löscht alle vorherigen Daten in der Datenbank und ersetzt sie durch Testdaten.
> Sichern Sie Ihre Datenbank, bevor Sie dieses Skript ausführen.

## Einblenden der Inhalte überfälliger Benachrichtigungen (zum Debuggen des Benachrichtigungssystems) {#show-the-overdue-notifications-contents-to-debug-notification-system}

```bash
pnpm show-overdue-notifications
```

## Überfällige Prüfung zu einem bestimmten Datum/einer bestimmten Uhrzeit ausführen (zum Debuggen des Benachrichtigungssystems) {#run-overdue-check-at-a-specific-datetime-to-debug-notification-system}

```bash
pnpm run-overdue-check "YYYY-MM-DD HH:MM:SS"
``` 

## Testen der Cron-Service-Port-Konnektivität {#test-cron-service-port-connectivity}

Um die Konnektivität des Cron-Dienstes zu testen, können Sie:

Prüfen Sie, ob der Cron-Dienst ausgeführt wird:

```bash
curl http://localhost:8667/health
```

2. Oder verwenden Sie die Cron-Service-API-Endpunkte direkt über die Hauptanwendung:

```bash
curl http://localhost:8666/api/cron/health
```

3. Verwenden Sie das Testskript, um die Port-Konnektivität zu bestätigen:

```bash
pnpm test-cron-port
```

Dieses Skript testet die Konnektivität zum Cron-Service-Port und liefert detaillierte Informationen zum Verbindungsstatus.

## Testen der Überfällig-Erkennung {#test-overdue-detection}

```bash
pnpm test-overdue-detection
```

Dieses Skript testet die Erkennungslogik für überfällige Sicherungen. Es überprüft:
- Identifikation überfälliger Sicherungen
- Auslösung von Benachrichtigungen
- Datums-/Zeitberechnungen für den Status "überfällig"

Nützlich zum Debuggen von Systemen zur Erkennung und Benachrichtigung überfälliger Sicherungen.

## CSV-Exportieren validieren {#validate-csv-export}

```bash
pnpm validate-csv-export
```

Dieses Skript validiert die CSV-Exportfunktionalität. Es:
- Testet die CSV-Exportgenerierung
- Überprüft Datenformat und Struktur
- Prüft die Datenintegrität in exportierten Dateien

Nützlich, um sicherzustellen, dass CSV-Exporte vor Releases ordnungsgemäß funktionieren.

## NTFY-Server vorübergehend blockieren (zum Testen) {#temporarily-block-ntfy-server-for-testing}

```bash
sudo ./scripts/temporary_ntfy.sh_block.sh
```

Dieses Skript blockiert vorübergehend den ausgehenden Netzwerkzugriff auf den NTFY-Server (`ntfy.sh`), um den Wiederholungsmechanismus für Benachrichtigungen zu testen. Es:
- Löst die IP-Adresse des NTFY-Servers auf
- Fügt eine iptables-Regel hinzu, um ausgehenden Datenverkehr zu blockieren
- Blockiert für 10 Sekunden (konfigurierbar)
- Entfernt die Blockierungsregel beim Beenden automatisch
- Erfordert Root-Berechtigungen (sudo)

>[!CAUTION]
> Dieses Skript ändert iptables-Regeln und erfordert Root-Privilegien. Verwenden Sie es nur zum Testen von Benachrichtigungs-Wiederholungsmechanismen.

## Datenbankmigrationstests {#database-migration-testing}

Das Projekt enthält Skripte zum Testen von Datenbankmigrationen von älteren Versionen zur aktuellen Version. Diese Skripte stellen sicher, dass Datenbankmigrationen korrekt funktionieren und die Datenintegrität bewahrt bleibt.

### Migrationstestdaten generieren {#generate-migration-test-data}

```bash
./scripts/generate-migration-test-data.sh
```

Dieses Skript generiert Testdatenbanken für mehrere historische Versionen der Anwendung. Es:

1. **Stoppt und entfernt** jeden vorhandenen Docker-Container
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
- Google Chrome (über Puppeteer) muss installiert sein
- Root-/sudo-Zugriff für Docker-Operationen
- Das Docker-Volume `duplistatus_data` muss vorhanden sein

**Ausgabe:**
- Datenbankdateien: `scripts/migration_test_data/backups_<VERSION>.db`
- Schemadateien: `scripts/migration_test_data/backups_<VERSION>.schema`
- Screenshots: `scripts/migration_test_data/duplistatus_test_data_<VERSION>.png`

**Konfiguration:**
- Anzahl der Server: Wird über die Variable `SERVERS` festgelegt (Standard: 3)
- Datenverzeichnis: `/var/lib/docker/volumes/duplistatus_data/_data`
- Port: 9666 (Docker-Container-Port)

>[!CAUTION]
> Dieses Skript erfordert Docker und stoppt/entfernt vorhandene Container. Es erfordert auch sudo-Zugriff für Docker-Operationen und Dateisystemzugriff. Das Skript `pnpm take-screenshots` muss zuerst ausgeführt werden, um Google Chrome zu installieren, falls noch nicht geschehen.

>[!IMPORTANT]
> Dieses Skript sollte nur einmal ausgeführt werden. Bei neuen Versionen kann der Entwickler die Datenbankdatei und Screenshots direkt in das Verzeichnis `scripts/migration_test_data/` kopieren. Führen Sie während der Entwicklung einfach das Skript `./scripts/test-migrations.sh` aus, um die Migrationen zu testen.

### Testen von Datenbankmigrationen {#test-database-migrations}

```bash
./scripts/test-migrations.sh
```

Dieses Skript testet Datenbankmigrationen von alten Versionen zur aktuellen Version (4.0). Es:

1. **Für jede Version** (v0.4.0, v0.5.0, v0.6.1, 0.7.27, 0.8.21):
   - Erstellt eine temporäre Kopie der Testdatenbank
   - Führt den Migrationsprozess mit `test-migration.ts` aus
   - Validiert die Struktur der migrierten Datenbank
   - Prüft auf erforderliche Tabellen und Spalten
   - Überprüft, dass die Datenbankversion 4.0 ist
   - Bereinigt temporäre Dateien

**Anforderungen:**
- Testdatenbanken müssen in `scripts/migration_test_data/` vorhanden sein
- Generiert durch vorheriges Ausführen von `generate-migration-test-data.sh`

**Ausgabe:**
- Farbcodierte Testergebnisse (grün für bestanden, rot für fehlgeschlagen)
- Zusammenfassung bestandener und fehlgeschlagener Versionen
- Detaillierte Fehlermeldungen für fehlgeschlagene Migrationen
- Exit-Code 0, wenn alle Tests bestanden sind, 1 wenn einer fehlschlägt

**Was wird validiert:**
- Datenbankversion ist nach der Migration 4.0
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
> Dieses Skript verwendet intern das TypeScript-Migrationstestskript (`test-migration.ts`). Das Testskript validiert die Datenbankstruktur nach der Migration und stellt die Datenintegrität sicher.

## SMTP-Testkonfiguration festlegen {#set-smtp-test-configuration}

```bash
pnpm set-smtp-test-config <connectionType>
```

Dieses Skript legt die SMTP-Testkonfiguration aus Umgebungsvariablen fest. Es akzeptiert einen `connectionType`-Parameter (`plain`, `starttls` oder `ssl`) und liest entsprechende Umgebungsvariablen mit Präfixen (`PLAIN_`, `STARTTLS_`, `SSL_`), um die SMTP-Konfiguration in der Datenbank zu aktualisieren.

Bei einfachen Verbindungen liest das Skript die Umgebungsvariable `PLAIN_SMTP_FROM`, um die erforderliche Absenderadresse festzulegen. Dies ermöglicht das Testen verschiedener SMTP-Verbindungstypen ohne manuelle Datenbankaktualisierungen.

**Verwendung:**

```bash
# Set Plain SMTP configuration
PLAIN_SMTP_HOST=smtp.example.com \
PLAIN_SMTP_PORT=25 \
PLAIN_SMTP_FROM=noreply@example.com \
pnpm set-smtp-test-config plain

# Set STARTTLS configuration
STARTTLS_SMTP_HOST=smtp.example.com \
STARTTLS_SMTP_PORT=587 \
STARTTLS_SMTP_USERNAME=user@example.com \
STARTTLS_SMTP_PASSWORD=password \
pnpm set-smtp-test-config starttls

# Set Direct SSL/TLS configuration
SSL_SMTP_HOST=smtp.example.com \
SSL_SMTP_PORT=465 \
SSL_SMTP_USERNAME=user@example.com \
SSL_SMTP_PASSWORD=password \
pnpm set-smtp-test-config ssl
```

**Anforderungen:**
- Die Anwendung muss ausgeführt werden
- Umgebungsvariablen müssen mit dem entsprechenden Präfix für den Verbindungstyp gesetzt werden
- Für einfache Verbindungen ist `PLAIN_SMTP_FROM` erforderlich

## Testen des SMTP-Verbindungstyps – Plattformübergreifende Kompatibilität {#test-smtp-connection-type-cross-compatibility}

```bash
pnpm test-smtp-connections
```

Dieses Skript führt einen umfassenden 3x3-Matrix-Test durch, der überprüft, ob Konfigurationen, die für einen Verbindungstyp vorgesehen sind, korrekt mit verschiedenen Verbindungstypen funktionieren. Für jeden Basis-Konfigurationstyp (plain, starttls, ssl) führt das Skript:

1. Liest Umgebungsvariablen mit entsprechenden Präfixen (`PLAIN_*`, `STARTTLS_*`, `SSL_*`)
2. Testet alle drei Verbindungstypen durch Änderung nur des Feldes `connectionType`
3. Sendet Test-E-Mails über die API
4. Erfasst Ergebnisse in einem Matrixformat
5. Zeigt eine Zusammenfassungstabelle an
6. Speichert detaillierte Ergebnisse in `smtp-test-results.json`

**Verwendung:**

```bash
# Set environment variables for all three connection types
PLAIN_SMTP_HOST=smtp.example.com \
PLAIN_SMTP_PORT=25 \
PLAIN_SMTP_FROM=noreply@example.com \
STARTTLS_SMTP_HOST=smtp.example.com \
STARTTLS_SMTP_PORT=587 \
STARTTLS_SMTP_USERNAME=user@example.com \
STARTTLS_SMTP_PASSWORD=password \
SSL_SMTP_HOST=smtp.example.com \
SSL_SMTP_PORT=465 \
SSL_SMTP_USERNAME=user@example.com \
SSL_SMTP_PASSWORD=password \
pnpm test-smtp-connections
```

**Anforderungen:**
- Die Anwendung muss ausgeführt werden
- Umgebungsvariablen müssen für alle drei Verbindungstypen festgelegt sein
- Das Skript validiert die verwendete Konfiguration durch detaillierte Protokollierung

**Erwartet Verhalten:**
Konfigurationen sollten nur mit ihrem vorgesehenen Verbindungstyp funktionieren (z. B. einfache Konfiguration funktioniert mit einfachem Verbindungstyp, schlägt aber mit STARTTLS/SSL fehl).

**Ausgabe:**
- Konsolenausgabe mit einer Zusammenfassungstabelle mit Testergebnissen
- `smtp-test-results.json` Datei mit detaillierten Testergebnissen für jede Kombination aus Konfiguration und Verbindungstyp

## Testen des Docker-Entrypoint-Skripts {#test-docker-entrypoint-script}

```bash
pnpm test-entrypoint
```

Dieses Skript bietet einen Test-Wrapper für `docker-entrypoint.sh` in der lokalen Entwicklung. Es richtet die Umgebung ein, um die Protokollierungsfunktionalität des Einstiegspunkts zu testen, und stellt sicher, dass Protokolle in `data/logs/` geschrieben werden, damit die Anwendung darauf zugreifen kann.

**Was es tut:**

1. **Erstellt immer eine neue Version**: Führt automatisch `pnpm build-local` aus, um vor dem Testen einen neuen Build zu erstellen (kein manuelles Bauen erforderlich)
2. **Erstellt den Cron-Service**: Stellt sicher, dass der Cron-Service erstellt wird (`dist/cron-service.cjs`)
3. **Richtet eine Docker-ähnliche Struktur ein**: Erstellt notwendige Symlinks und Verzeichnisstrukturen, um die Docker-Umgebung nachzuahmen
4. **Führt das Entrypoint-Skript aus**: Führt `docker-entrypoint.sh` mit den richtigen Umgebungsvariablen aus
5. **Räumt auf**: Entfernt automatisch temporäre Dateien beim Beenden

**Verwendung:**

```bash
# Run the test (builds fresh version automatically)
pnpm test-entrypoint
```

**Umgebungsvariablen:**
- `PORT=8666` - Port für den Next.js-Server (entspricht `start-local`)
- `CRON_PORT=8667` - Port für den Cron-Service
- `VERSION` - Wird automatisch im Format `test-YYYYMMDD-HHMMSS` gesetzt

**Ausgabe:**
- Protokolle werden in `data/logs/application.log` geschrieben (zugänglich durch die Anwendung)
- Die Konsolenausgabe zeigt die Ausführung des Einstiegspunktskripts
- Drücken Sie Strg+C zum Stoppen und Testen der Protokollpufferung

**Anforderungen:**
- Das Skript muss aus dem Repository-Stammverzeichnis ausgeführt werden (pnpm handhabt dies automatisch)
- Das Skript handhabt automatisch alle Voraussetzungen (Build, Cron-Service usw.)

**Use Cases:**
- Lokales Testen von Änderungen am Entrypoint-Skript vor der Docker-Bereitstellung
- Überprüfung der Protokollrotation und Protokollierungsfunktionalität
- Testen von ordnungsgemäßem Herunterfahren und Signalbehandlung
- Debugging des Verhaltens von Entrypoint-Skripten in einer lokalen Umgebung
