---
translation_last_updated: '2026-01-31T00:51:23.174Z'
source_file_mtime: '2026-01-27T14:22:06.830Z'
source_file_hash: a4aa296b36d4dd44
translation_language: de
source_file_path: development/cron-service.md
---
# Cron-Dienst {#cron-service}

Die Anwendung enthält einen separaten Cron-Dienst zur Verarbeitung geplanter Aufgaben:

## Starten des Cron-Dienstes im Entwicklungsmodus {#start-cron-service-in-development-mode}

```bash
pnpm cron:dev
```

## Starten des Cron-Dienstes im Produktionsmodus {#start-cron-service-in-production-mode}

```bash
pnpm cron:start
```

## Cron-Dienst lokal starten (zum Testen) {#start-cron-service-locally-for-testing}

```bash
pnpm cron:start-local
```

Der Cron-Service wird auf einem separaten Port ausgeführt (8667 in der Entwicklung, 9667 in der Produktion) und verwaltet geplante Aufgaben wie überfällige Backup-Benachrichtigungen. Der Port kann mithilfe der Umgebungsvariablen `CRON_PORT` konfiguriert werden.

Der Cron-Dienst umfasst:
- **Health-Check-Endpunkt**: `/health` - Gibt den Dienststatus und aktive Aufgaben zurück
- **Manuelle Aufgabenauslösung**: `POST /trigger/:taskName` - Führt geplante Aufgaben manuell aus
- **Aufgabenverwaltung**: `POST /start/:taskName` und `POST /stop/:taskName` - Steuert einzelne Aufgaben
- **Konfigurationsneuladung**: `POST /reload-config` - Lädt die Konfiguration aus der Datenbank neu
- **Automatischer Neustart**: Der Dienst wird automatisch neu gestartet, falls er abstürzt (verwaltet durch `duplistatus-cron.sh`)
- **Watch-Modus**: Der Entwicklungsmodus umfasst Dateiüberwachung für automatische Neustarts bei Codeänderungen
- **Überwachung überfälliger Sicherungen**: Automatisierte Prüfung und Benachrichtigung von überfälligen Sicherungen (wird standardmäßig alle 5 Minuten ausgeführt)
- **Audit-Log-Bereinigung**: Automatisierte Bereinigung alter Audit-Log-Einträge (wird täglich um 2 Uhr UTC ausgeführt)
- **Flexible Planung**: Konfigurierbare Cron-Ausdrücke für verschiedene Aufgaben
- **Datenbankintegration**: Nutzt die gleiche SQLite-Datenbank wie die Hauptanwendung
- **RESTful-API**: Vollständige API für Dienstverwaltung und Überwachung
