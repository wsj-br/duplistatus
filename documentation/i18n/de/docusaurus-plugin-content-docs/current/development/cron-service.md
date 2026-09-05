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
- **Audit-Protokollbereinigung**: Automatische Bereinigung alter Audit-Protokolleinträge (läuft täglich um 2 Uhr UTC)
- **Duplicati-Version-Aktualisierung**: Aktualisiert die zwischengespeicherten neuesten Duplicati-Kanalversionen aus GitHub Releases (läuft täglich um 3 Uhr UTC)
- **Flexible Planung**: Konfigurierbare cron-Ausdrücke für verschiedene Aufgaben
- **Datenbankintegration**: Teilt dieselbe SQLite-Datenbank mit der Hauptanwendung
- **RESTful-API**: Komplette API für die Dienstverwaltung und -überwachung
