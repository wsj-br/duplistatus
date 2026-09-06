# Cron-Dienst {#cron-service}

Die Anwendung enthält einen separaten Cron-Service zur Verarbeitung geplanter Aufgaben:

## Cron-Service im Entwicklungsmodus starten {#start-cron-service-in-development-mode}

`pnpm dev` startet bereits den Cron-Dienst zusammen mit Next.js. Um Cron allein auszuführen (zum Beispiel in einem zweiten Terminal):

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
- **Gesundheitsprüf-Endpunkt**: `/health` - Gibt den Dienststatus und aktive Aufgaben zurück
- **Manuelle Auslösung von Aufgaben**: `POST /trigger/:taskName` - Führt geplante Aufgaben manuell aus. Die `daily-summary-dispatch`-Aufgabe wird auf dieser Route abgelehnt; verwenden Sie stattdessen Einstellungen → Tägliche Zusammenfassung **Zusammenfassung jetzt senden**
- **Aufgabenverwaltung**: `POST /start/:taskName` und `POST /stop/:taskName` - Steuert einzelne Aufgaben
- **Konfigurationsneuladen**: `POST /reload-config` – Lädt die Konfiguration aus der Datenbank neu
- **Automatischer Neustart**: Der Service startet automatisch neu, falls er abstürzt (wird bei Docker-Deployments von `docker-entrypoint.sh` verwaltet)
- **Watch-Modus**: Der Entwicklungsmodus beinhaltet das Überwachen von Dateiänderungen für automatische Neustarts bei Code-Änderungen
- **Überwachung überfälliger Sicherungen**: Automatische Prüfung und Benachrichtigung bei überfälligen Sicherungen (standardmäßig alle 5 Minuten)
- **Versand der täglichen Zusammenfassung**: Bewertet das gespeicherte Zeitplan der Täglichen Zusammenfassung jede Minute in UTC und sendet den aktuellen Status-Snapshot, wenn fällig
- **Audit-Protokollbereinigung**: Automatische Bereinigung alter Audit-Protokolleinträge (läuft täglich um 2 Uhr UTC)
- **Aktualisierung der Duplicati-Versionen**: Aktualisiert die zwischengespeicherten neuesten Duplicati-Kanalversionen von GitHub Releases. Standardmäßig täglich um 3 Uhr UTC; Administratoren können das Intervall und die Startzeit in [Einstellungen → Duplicati-Versionen](../user-guide/settings/duplicati-versions.md) ändern.
- **Flexible Zeitplanung**: Konfigurierbare Cron-Ausdrücke für verschiedene Aufgaben
- **Datenbankintegration**: Teilt dieselbe SQLite-Datenbank mit der Hauptanwendung
- **RESTful-API**: Vollständige API für die Dienstverwaltung und -überwachung
- **Lokale Bindung**: Hört standardmäßig auf `127.0.0.1` (`CRON_BIND_HOST`). Nicht-Loopback-Bindungen erfordern `CRON_SERVICE_SECRET`
