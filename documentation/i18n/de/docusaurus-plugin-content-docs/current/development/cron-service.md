---
translation_last_updated: '2026-05-11T14:27:39.558Z'
source_file_mtime: '2026-05-06T23:18:51.394Z'
source_file_hash: d96b8a208e1a506c80e1a45e3190044bd8a8d6b789fda92a5bc3d91cec00ef2f
translation_language: de
source_file_path: documentation/docs/development/cron-service.md
translation_models:
  - anthropic/claude-haiku-4.5
  - qwen/qwen3-235b-a22b-2507
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

Der Cron-Service umfasst:
- **Health-Check-Endpunkt**: `/health` – Gibt den Service-Status und aktive Aufgaben zurück
- **Manuelle Aufgaben-Auslösung**: `POST /trigger/:taskName` – Geplante Aufgaben manuell ausführen
- **Aufgabenverwaltung**: `POST /start/:taskName` und `POST /stop/:taskName` – Einzelne Aufgaben steuern
- **Konfigurationsneuladen**: `POST /reload-config` – Lädt die Konfiguration aus der Datenbank neu
- **Automatischer Neustart**: Der Service startet automatisch neu, falls er abstürzt (wird bei Docker-Deployments von `docker-entrypoint.sh` verwaltet)
- **Watch-Modus**: Der Entwicklungsmodus beinhaltet das Überwachen von Dateiänderungen für automatische Neustarts bei Code-Änderungen
- **Überwachung überfälliger Sicherungen**: Automatische Prüfung und Benachrichtigung bei überfälligen Sicherungen (standardmäßig alle 5 Minuten)
- **Bereinigung des Audit-Logs**: Automatische Bereinigung alter Audit-Log-Einträge (täglich um 2 Uhr UTC)
- **Flexible Planung**: Konfigurierbare Cron-Ausdrücke für verschiedene Aufgaben
- **Datenbankintegration**: Nutzt dieselbe SQLite-Datenbank wie die Hauptanwendung
- **RESTful-API**: Vollständige API zur Serviceverwaltung und -überwachung
