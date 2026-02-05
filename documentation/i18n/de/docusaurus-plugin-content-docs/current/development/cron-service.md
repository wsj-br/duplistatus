---
translation_last_updated: '2026-02-05T00:20:54.063Z'
source_file_mtime: '2026-01-27T14:22:06.830Z'
source_file_hash: a4aa296b36d4dd44
translation_language: de
source_file_path: development/cron-service.md
---
# Cron-Dienst {#cron-service}

Die Anwendung enthält einen separaten Cron-Service zur Verarbeitung geplanter Aufgaben:

## Cron-Service im Entwicklungsmodus starten {#start-cron-service-in-development-mode}

```bash
pnpm cron:dev
```

## Cron-Service im Produktionsmodus starten {#start-cron-service-in-production-mode}

```bash
pnpm cron:start
```

## Cron-Service lokal starten (zum Testen) {#start-cron-service-locally-for-testing}

```bash
pnpm cron:start-local
```

Der Cron-Service läuft auf einem separaten Port (8667 in der Entwicklung, 9667 in der Produktion) und verwaltet geplante Aufgaben wie überfällige Backup-Benachrichtigungen. Der Port kann mithilfe der Umgebungsvariablen `CRON_PORT` konfiguriert werden.

Der Cron-Dienst umfasst:
- **Health-Check-Endpunkt**: `/health` - Gibt den Status des Dienstes und aktive Aufgaben zurück
- **Manuelle Aufgabenauslösung**: `POST /trigger/:taskName` - Führt geplante Aufgaben manuell aus
- **Aufgabenverwaltung**: `POST /start/:taskName` und `POST /stop/:taskName` - Steuert einzelne Aufgaben
- **Konfigurationsneuladen**: `POST /reload-config` - Lädt die Konfiguration aus der Datenbank neu
- **Automatischer Neustart**: Der Dienst startet automatisch neu, wenn er abstürzt (verwaltet durch `duplistatus-cron.sh`)
- **Watch-Modus**: Der Entwicklungsmodus umfasst Dateiüberwachung für automatische Neustarts bei Codeänderungen
- **Überwachung überfälliger Sicherungen**: Automatisierte Prüfung und Benachrichtigung von überfälligen Sicherungen (läuft standardmäßig alle 5 Minuten)
- **Audit-Log-Bereinigung**: Automatisierte Bereinigung von alten Audit-Log-Einträgen (läuft täglich um 2 Uhr UTC)
- **Flexible Planung**: Konfigurierbare Cron-Ausdrücke für verschiedene Aufgaben
- **Datenbankintegration**: Nutzt die gleiche SQLite-Datenbank wie die Hauptanwendung
- **RESTful-API**: Vollständige API für Dienstverwaltung und Überwachung
