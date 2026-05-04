---
translation_last_updated: '2026-04-18T00:02:14.847Z'
source_file_mtime: '2026-03-05T22:33:28.419Z'
source_file_hash: d96b8a208e1a506c80e1a45e3190044bd8a8d6b789fda92a5bc3d91cec00ef2f
translation_language: de
source_file_path: documentation/docs/development/cron-service.md
translation_models:
  - anthropic/claude-3.5-haiku
  - anthropic/claude-haiku-4.5
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
- **Gesundheitsprüfungs-Endpunkt**: `/health` - Gibt Dienstatus und aktive Aufgaben zurück
- **Manuelle Aufgabenauslösung**: `POST /trigger/:taskName` - Manuelles Ausführen geplanter Aufgaben
- **Aufgabenverwaltung**: `POST /start/:taskName` und `POST /stop/:taskName` - Steuerung einzelner Aufgaben
- **Konfigurationsneuladen**: `POST /reload-config` - Konfiguration aus Datenbank neu laden
- **Automatischer Neustart**: Der Dienst startet automatisch neu, wenn er abstürzt (verwaltet durch `docker-entrypoint.sh` in Docker-Bereitstellungen)
- **Beobachtungsmodus**: Entwicklungsmodus mit Dateiüberwachung für automatische Neustarts bei Codeänderungen
- **Überwachung überfälliger Sicherungen**: Automatische Prüfung und Benachrichtigung von überfälligen Sicherungen (läuft standardmäßig alle 5 Minuten)
- **Audit-Log-Bereinigung**: Automatische Bereinigung alter Audit-Log-Einträge (täglich um 2 Uhr UTC)
- **Flexible Planung**: Konfigurierbare Cron-Ausdrücke für verschiedene Aufgaben
- **Datenbankintegration**: Nutzt dieselbe SQLite-Datenbank wie die Hauptanwendung
- **RESTful-API**: Vollständige API zur Dienstverwaltung und -überwachung
