# Cron-Service {/* #cron-service */}

Die Anwendung enthält einen separaten Cron-Service zur Verarbeitung geplanter Aufgaben:

## Cron-Service im Entwicklungsmodus starten {/* #start-cron-service-in-development-mode */}

`pnpm dev` startet den Cron-Service bereits zusammen mit Next.js. Um den Cron-Service allein auszuführen (z. B. in einem zweiten Terminal):

```bash
pnpm cron:dev
```

## Cron-Service im Produktionsmodus starten {/* #start-cron-service-in-production-mode */}

```bash
pnpm cron:start
```

## Cron-Service lokal starten (zum Testen) {/* #start-cron-service-locally-for-testing */}

```bash
pnpm cron:start-local
```

Der Cron-Service läuft auf einem separaten Port (8667 in der Entwicklung, 9667 in der Produktion) und verarbeitet geplante Aufgaben wie Benachrichtigungen über überfällige Sicherungen. Der Port kann mit der `CRON_PORT`-Umgebungsvariable konfiguriert werden.

Der Cron-Service umfasst:
- **Health-Check-Endpunkt**: `/health` – Gibt den Service-Status und aktive Aufgaben zurück
- **Manuelle Aufgabenausführung**: `POST /trigger/:taskName` – Führt geplante Aufgaben manuell aus. Die `daily-summary-dispatch`-Aufgabe wird auf dieser Route abgelehnt; verwenden Sie stattdessen Einstellungen → Tägliche Zusammenfassung **Zusammenfassung jetzt senden**
- **Aufgabenverwaltung**: `POST /start/:taskName` und `POST /stop/:taskName` – Steuern einzelne Aufgaben
- **Konfigurationsneuladen**: `POST /reload-config` – Konfiguration aus der Datenbank neu laden
- **Automatischer Neustart**: Der Service wird automatisch neu gestartet, wenn er abstürzt (verwaltet durch `docker-entrypoint.sh` in Docker-Bereitstellungen)
- **Watch-Modus**: Der Entwicklungsmodus umfasst Dateiüberwachung für automatische Neustarts bei Codeänderungen
- **Überfällige Backup-Überwachung**: Automatisierte Überprüfung und Benachrichtigung über überfällige Sicherungen (läuft standardmäßig alle 5 Minuten)
- **Tägliche Zusammenfassungsversand**: Sendet den aktuellen Status-Snapshot einmal täglich zur gespeicherten UTC-Zeit der Täglichen Zusammenfassung (`minute hour * * *`). Standard für neue Installationen ist 01:00 UTC. Das Ändern der Sendezeit lädt diesen Zeitplan neu. Die Aufgabe wird gesendet, wenn die Tägliche Zusammenfassung aktiviert ist, und überprüft die Uhr nicht erneut.
- **Audit-Protokoll-Bereinigung**: Automatisierte Bereinigung alter Audit-Protokoll-Einträge (läuft täglich um 2 Uhr UTC)
- **Datenbankoptimierung**: Wöchentlich Sonntag 04:00 UTC. Löscht Sicherungszeilen, deren Server nicht mehr existiert, Server-Zeilen ohne verbleibende Sicherungen, verwaiste `backup_settings`- und `overdue_notifications`-Schlüssel, bereinigt alte Zeilen zur Täglichen Zusammenfassungslieferung und führt SQLite `VACUUM` aus
- **Duplicati-Versions-Aktualisierung**: Aktualisiert zwischengespeicherte neueste Duplicati-Kanalversionen von GitHub Releases. Standard ist täglich um 3 Uhr UTC; Administratoren können das Intervall und die Startzeit in [Einstellungen → Duplicati-Versionen](../user-guide/settings/duplicati-versions.md) ändern.
- **Flexible Planung**: Konfigurierbare Cron-Ausdrücke für verschiedene Aufgaben
- **Datenbankintegration**: Nutzt dieselbe SQLite-Datenbank wie die Hauptanwendung
- **RESTful-API**: Vollständige API für Service-Verwaltung und -Überwachung
- **Lokales Binding**: Lauscht standardmäßig auf `127.0.0.1` (`CRON_BIND_HOST`). Nicht-Loopback-Bindings erfordern `CRON_SERVICE_SECRET`
