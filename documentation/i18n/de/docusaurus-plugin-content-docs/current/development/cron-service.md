# Cron-Dienst {/* #cron-service */}

Die Anwendung enthält einen separaten Cron-Dienst zur Verwaltung geplanter Aufgaben:

## Cron-Dienst im Entwicklungsmodus starten {/* #start-cron-service-in-development-mode */}

`pnpm dev` startet den Cron-Dienst gleichzeitig mit Next.js. Um Cron allein auszuführen (z. B. in einem zweiten Terminal):

```bash
pnpm cron:dev
```

## Cron-Dienst im Produktionsmodus starten {/* #start-cron-service-in-production-mode */}

```bash
pnpm cron:start
```

## Cron-Dienst lokal starten (für Tests) {/* #start-cron-service-locally-for-testing */}

```bash
pnpm cron:start-local
```

Der Cron-Dienst läuft auf einem separaten Port (8667 im Entwicklungsmodus, 9667 im Produktionsmodus) und verwaltet geplante Aufgaben wie Überfällige Backup-Benachrichtigungen. Der Port kann über die `CRON_PORT`-Umgebungsvariable konfiguriert werden.

Der Cron-Dienst umfasst:
- **Gesundheitsprüfung-Endpunkt**: `/health` - Gibt den Dienststatus und aktive Aufgaben zurück
- **Manuelle Ausführung von Aufgaben**: `POST /trigger/:taskName` - Führt geplante Aufgaben manuell aus. Die `daily-summary-dispatch`-Aufgabe wird auf dieser Route abgelehnt; verwenden Sie stattdessen Einstellungen → Tägliche Zusammenfassung **Zusammenfassung jetzt senden**
- **Aufgabenverwaltung**: `POST /start/:taskName` und `POST /stop/:taskName` - Steuert einzelne Aufgaben
- **Konfigurationsneuladen**: `POST /reload-config` - Lädt die Konfiguration aus der Datenbank neu
- **Automatischer Neustart**: Der Dienst startet automatisch neu, wenn er abstürzt (verwaltet von `docker-entrypoint.sh` in Docker-Bereitstellungen)
- **Watch-Modus**: Der Entwicklungsmodus enthält die Überwachung von Dateiänderungen für automatische Neustarts bei Code-Änderungen
- **Überwachung überfälliger Backups**: Automatische Prüfung und Benachrichtigung über überfällige Backups (läuft standardmäßig alle 5 Minuten)
- **Tägliche Zusammenfassung**: Sendet einmal pro Tag einen Snapshot des aktuellen Status zur gespeicherten UTC-Zeit der Täglichen Zusammenfassung (`minute hour * * *`). Der Standard für neue Installationen ist 01:00 UTC. Das Ändern der Sendezeit lädt diesen Zeitplan neu. Die Aufgabe wird gesendet, wenn die Tägliche Zusammenfassung aktiviert ist und die Uhrzeit nicht erneut geprüft wird.
- **Audit-Protokoll-Bereinigung**: Automatische Bereinigung alter Audit-Protokolleinträge (läuft täglich um 2 Uhr UTC)
- **Datenbank-Komprimierung**: Wöchentlich am Sonntag um 04:00 UTC. Löscht Backup-Zeilen, deren Server nicht mehr existiert, Server-Zeilen ohne verbleibende Backups, übrige `backup_settings` und `overdue_notifications`-Schlüssel, altes Tägliche Zusammenfassung-Lieferungszeilen und führt SQLite `VACUUM` aus
- **Aktualisierung der Duplicati-Version**: Aktualisiert die zwischengespeicherten neuesten Duplicati-Kanalversionen aus GitHub Releases. Der Standard ist täglich um 3 Uhr UTC; Administratoren können das Intervall und die Startzeit in [Einstellungen → Duplicati-Versionen](../user-guide/settings/duplicati-versions.md) ändern.
- **Flexible Planung**: Konfigurierbare Cron-Ausdrücke für verschiedene Aufgaben
- **Datenbank-Integration**: Teilt dieselbe SQLite-Datenbank mit der Hauptanwendung
- **RESTful API**: Komplette API für die Dienstverwaltung und -überwachung
- **Lokale Bindung**: Hört standardmäßig auf `127.0.0.1` (`CRON_BIND_HOST`). Nicht-Loopback-Bindungen erfordern `CRON_SERVICE_SECRET`
