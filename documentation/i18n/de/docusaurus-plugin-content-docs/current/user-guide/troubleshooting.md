---
translation_last_updated: '2026-03-01T00:45:12.418Z'
source_file_mtime: '2026-02-16T00:30:39.432Z'
source_file_hash: e98421b0542e0de6
translation_language: de
source_file_path: user-guide/troubleshooting.md
---
# Fehlerbehebung {#troubleshooting}

### Dashboard wird nicht geladen {#dashboard-not-loading}
- Prüfen Sie, ob der Container ausgeführt wird: `docker ps`
- Bestätigen Sie, dass Port 9666 erreichbar ist
- Prüfen Sie die Container-Protokolle: `docker logs duplistatus`

### Keine Sicherungsdaten {#no-backup-data}
- Bestätigen Sie die Duplicati-Serverkonfiguration
- Prüfen Sie die Netzwerkkonnektivität zwischen Servern
- Überprüfen Sie duplistatus-Protokolle auf Fehler
- Stellen Sie sicher, dass Sicherungsaufträge ausgeführt werden

### Benachrichtigungen funktionieren nicht {#notifications-not-working}
- Benachrichtigungskonfiguration prüfen
- NTFY-Server-Konnektivität bestätigen (falls NTFY verwendet wird)
- Benachrichtigungseinstellungen testen
- Benachrichtigungsprotokolle prüfen

### Neue Sicherungen werden nicht angezeigt {#new-backups-not-showing}

Wenn Sie Duplicati-Server-Warnungen wie `HTTP Response request failed for:` und `Failed to send message: System.Net.Http.HttpRequestException:` sehen und neue Sicherungen nicht im Dashboard oder Sicherungsverlauf angezeigt werden:

- **Prüfen Sie die Duplicati-Konfiguration**: Bestätigen Sie, dass Duplicati korrekt konfiguriert ist, um Daten an **duplistatus** zu senden. Bestätigen Sie die HTTP-URL-Einstellungen in Duplicati.
- **Prüfen Sie die Netzwerkkonnektivität**: Stellen Sie sicher, dass der Duplicati-Server eine Verbindung zum **duplistatus**-Server herstellen kann. Bestätigen Sie, dass der Port korrekt ist (Standard: `9666`).
- **Prüfen Sie die Duplicati-Protokolle**: Suchen Sie in den Duplicati-Protokollen nach HTTP-Request-Fehlern.

### Benachrichtigungen funktionieren nicht (Detailliert) {#notifications-not-working-detailed}

Wenn Benachrichtigungen nicht gesendet oder empfangen werden:

- **NTFY-Konfiguration prüfen**: Stellen Sie sicher, dass die NTFY-URL und das Thema korrekt sind. Verwenden Sie die Schaltfläche **Testbenachrichtigung senden** zum Testen.
- **Netzwerkkonnektivität prüfen**: Bestätigen Sie, dass **duplistatus** Ihren NTFY-Server erreichen kann. Überprüfen Sie die Firewall-Einstellungen, falls zutreffend.
- **Benachrichtigungseinstellungen prüfen**: Bestätigen Sie, dass Benachrichtigungen für die relevanten Sicherungen aktiviert sind.

### Verfügbare Versionen werden nicht angezeigt {#available-versions-not-appearing}

Wenn Sicherungsversionen auf dem Dashboard oder der Detailseite nicht angezeigt werden:

- **Prüfen Sie die Duplicati-Konfiguration**: Stellen Sie sicher, dass `send-http-log-level=Information` und `send-http-max-log-lines=0` in den erweiterten Optionen von Duplicati konfiguriert sind.

### Überfällige Sicherung Warnungen funktionieren nicht {#overdue-backup-alerts-not-working}

Wenn überfällige Backup-Benachrichtigungen nicht gesendet werden:

- **Überfälligkeitskonfiguration prüfen**: Bestätigen Sie, dass die Sicherungsüberwachung für die Sicherung aktiviert ist. Überprüfen Sie die Einstellungen für das erwartete Intervall und die Toleranz.
- **Benachrichtigungshäufigkeit prüfen**: Wenn auf **Einmalig** eingestellt, werden Warnungen nur einmal pro Überfälligkeitsereignis gesendet.
- **Cron-Dienst prüfen**: Stellen Sie sicher, dass der Cron-Dienst, der auf überfällige Sicherungen überwacht, ordnungsgemäß ausgeführt wird. Überprüfen Sie die Anwendungsprotokolle auf Fehler. Bestätigen Sie, dass der Cron-Dienst am konfigurierten Port erreichbar ist (Standard: `8667`).

### Backup-Protokolle sammeln funktioniert nicht {#collect-backup-logs-not-working}

Wenn die manuelle Sicherungsprotokollerfassung fehlschlägt:

- **Prüfen Sie den Duplicati-Serverzugriff**: Bestätigen Sie, dass der Duplicati-Server-Hostname und der Port korrekt sind. Bestätigen Sie, dass der Fernzugriff in Duplicati aktiviert ist. Stellen Sie sicher, dass das Authentifizierungspasswort korrekt ist.
- **Prüfen Sie die Netzwerkkonnektivität**: Testen Sie die Konnektivität von **duplistatus** zum Duplicati-Server. Bestätigen Sie, dass der Duplicati-Server-Port erreichbar ist (Standard: `8200`).
  Wenn Sie beispielsweise Docker verwenden, können Sie `docker exec -it <container-name> /bin/sh` verwenden, um auf die Befehlszeile des Containers zuzugreifen und Netzwerktools wie `ping` und `curl` auszuführen.

    ```bash
    docker exec -it duplistatus /bin/sh
    ping duplicati-server.local
    curl -I http://duplicati-server.local:8200
    ```

Prüfen Sie auch die DNS-Konfiguration im Container (siehe [DNS-Konfiguration für Podman-Container](../installation/installation.md#configuring-dns-for-podman-containers))

### Upgrade von einer früheren Version (vor 0.9.x) und kann sich nicht anmelden {#upgrade-from-an-earlier-version-09x-and-cant-login}

**duplistatus** ab Version 0.9.x erfordert Benutzerauthentifizierung. Ein Standard-`admin`-Konto wird automatisch erstellt, wenn die Anwendung zum ersten Mal installiert oder von einer früheren Version aktualisiert wird:
    - Benutzername: `admin`
    - Passwort: `Duplistatus09`

Sie können zusätzliche Benutzerkonten in [Einstellungen > Benutzer](settings/user-management-settings.md) nach dem ersten Anmelden erstellen.

### Verlorenes Admin-Passwort oder gesperrt {#lost-admin-password-or-locked-out}

Wenn Sie Ihr Administratorpasswort verloren haben oder aus Ihrem Konto gesperrt wurden:

- **Admin-Wiederherstellungsskript verwenden**: Siehe den Leitfaden [Admin Account Recovery](admin-recovery.md) für Anweisungen zur Wiederherstellung des Administrator-Zugriffs in Docker-Umgebungen.
- **Container-Zugriff bestätigen**: Stellen Sie sicher, dass Sie Docker exec-Zugriff auf den Container haben, um das Wiederherstellungsskript auszuführen.

### Datenbanksicherung und Migration {#database-backup-and-migration}

Beim Migrieren von vorherigen Versionen oder beim Erstellen einer Datenbanksicherung:

**Wenn Sie Version 1.2.1 oder später ausführen:**
- Verwenden Sie die integrierte Datenbanksicherungsfunktion in [Einstellungen → Datenbankwartung](user-guide/settings/database-maintenance.md)
- Wählen Sie Ihr bevorzugtes Format (.db oder .sql) und klicken Sie auf **Sicherung herunterladen**
- Die Sicherungsdatei wird auf Ihren Computer heruntergeladen
- Siehe [Datenbankwartung](settings/database-maintenance.md#database-backup) für detaillierte Anweisungen

**Wenn Sie eine Version vor 1.2.1 ausführen:**
- Sie müssen manuell eine Sicherung erstellen. Weitere Informationen finden Sie im [Migration Guide](../migration/version_upgrade.md#backing-up-your-database-before-migration).

Wenn Sie weiterhin Probleme haben, versuchen Sie die folgenden Schritte:

1.  **Anwendungsprotokolle prüfen**: Bei Verwendung von Docker führen Sie `docker logs <container-name>` aus, um detaillierte Fehlerinformationen zu überprüfen.
2.  **Konfiguration validieren**: Überprüfen Sie alle Konfigurationseinstellungen in Ihrem Container-Verwaltungstool (Docker, Portainer, Podman usw.) doppelt, einschließlich Ports, Netzwerk und Berechtigungen.
3.  **Netzwerkkonnektivität bestätigen**: Bestätigen Sie, dass alle Netzwerkverbindungen stabil sind. 
4.  **Cron-Dienst prüfen**: Stellen Sie sicher, dass der Cron-Dienst zusammen mit der Hauptanwendung ausgeführt wird. Überprüfen Sie die Protokolle für beide Dienste.
5.  **Dokumentation konsultieren**: Weitere Informationen finden Sie im Installationshandbuch und in der README-Datei.
6.  **Probleme melden**: Wenn das Problem weiterhin besteht, reichen Sie bitte ein detailliertes Problem im [duplistatus GitHub-Repository](https://github.com/wsj-br/duplistatus/issues) ein.

<br/>

# Zusätzliche Ressourcen {#additional-resources}

- **Installationsanleitung**: [Installationsanleitung](../installation/installation.md)
- **Duplicati-Dokumentation**: [docs.duplicati.com](https://docs.duplicati.com)
- **API-Dokumentation**: [API-Referenz](../api-reference/overview.md)
- **GitHub-Repository**: [wsj-br/duplistatus](https://github.com/wsj-br/duplistatus)
- **Entwicklungsleitfaden**: [Entwicklungsleitfaden](../development/setup.md)
- **Datenbankschema**: [Datenbankdokumentation](../development/database)

### Unterstützung {#support}
- **GitHub Issues**: [Fehler melden oder Funktionen anfordern](https://github.com/wsj-br/duplistatus/issues)
