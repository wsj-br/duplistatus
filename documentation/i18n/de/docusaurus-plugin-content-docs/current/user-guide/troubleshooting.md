---
translation_last_updated: '2026-01-31T00:51:26.388Z'
source_file_mtime: '2026-01-31T00:23:03.813Z'
source_file_hash: ccb921e081ad2c50
translation_language: de
source_file_path: user-guide/troubleshooting.md
---
# Fehlerbehebung {#troubleshooting}

### Dashboard wird nicht geladen {#dashboard-not-loading}
- Prüfen Sie, ob der Container ausgeführt wird: `docker ps`
- Bestätigen Sie, dass Port 9666 erreichbar ist
- Prüfen Sie die Container-Protokolle: `docker logs duplistatus`

### Nein Sicherungsdaten {#no-backup-data}
- Bestätigen Sie die Duplicati-Serverkonfiguration
- Prüfen Sie die Netzwerkverbindung zwischen Servern
- Überprüfen Sie die duplistatus-Protokolle auf Fehler
- Stellen Sie sicher, dass Sicherungsaufträge ausgeführt werden

### Benachrichtigungen funktionieren nicht {#notifications-not-working}
- Benachrichtigungskonfiguration prüfen
- NTFY-Server-Konnektivität bestätigen (falls NTFY verwendet wird)
- Benachrichtigungseinstellungen testen
- Benachrichtigungsprotokolle prüfen

### Neue Sicherungen werden nicht angezeigt {#new-backups-not-showing}

Wenn Sie Duplicati-Server-Warnungen wie `HTTP Response request failed for:` und `Failed to send message: System.Net.Http.HttpRequestException:` sehen und neue Sicherungen nicht im Dashboard oder Sicherungsverlauf angezeigt werden:

- **Duplicati-Konfiguration prüfen**: Bestätigen Sie, dass Duplicati korrekt konfiguriert ist, um Daten an **duplistatus** zu senden. Bestätigen Sie die HTTP-URL-Einstellungen in Duplicati.
- **Netzwerkkonnektivität prüfen**: Stellen Sie sicher, dass der Duplicati-Server eine Verbindung zum **duplistatus**-Server herstellen kann. Bestätigen Sie, dass der Port korrekt ist (Standard: `9666`).
- **Duplicati-Protokolle überprüfen**: Prüfen Sie die Duplicati-Protokolle auf HTTP-Anfragefehler.

### Benachrichtigungen funktionieren nicht (Detailliert) {#notifications-not-working-detailed}

Wenn Benachrichtigungen nicht gesendet oder empfangen werden:

- **Prüfen Sie die NTFY-Konfiguration**: Stellen Sie sicher, dass die NTFY-URL und das Thema korrekt sind. Verwenden Sie die Schaltfläche `Testbenachrichtigung senden` zum Testen.
- **Prüfen Sie die Netzwerkkonnektivität**: Bestätigen Sie, dass **duplistatus** Ihren NTFY-Server erreichen kann. Überprüfen Sie ggf. die Firewall-Einstellungen.
- **Prüfen Sie die Benachrichtigungseinstellungen**: Bestätigen Sie, dass Benachrichtigungen für die relevanten Sicherungen aktiviert sind.

### Verfügbare Versionen werden nicht angezeigt {#available-versions-not-appearing}

Wenn Sicherungsversionen nicht im Dashboard oder auf der Seite „Details" angezeigt werden:

- **Prüfen Sie die Duplicati-Konfiguration**: Stellen Sie sicher, dass `send-http-log-level=Information` und `send-http-max-log-lines=0` in den erweiterten Optionen von Duplicati konfiguriert sind.

### Überfällige Sicherungswarnungen funktionieren nicht {#overdue-backup-alerts-not-working}

Wenn Backup-Benachrichtigungen, die überfällig sind, nicht versendet werden:

- **Überfälligkeitskonfiguration prüfen**: Bestätigen Sie, dass die Überwachung überfälliger Sicherungen für die Sicherung aktiviert ist. Bestätigen Sie die Einstellungen für das erwartete Intervall und die Toleranz.
- **Benachrichtigungshäufigkeit prüfen**: Wenn diese auf `One time` eingestellt ist, werden Warnungen nur einmal pro Überfälligkeitsereignis gesendet.
- **Cron-Dienst prüfen**: Stellen Sie sicher, dass der Cron-Dienst, der überfällige Sicherungen überwacht, ordnungsgemäß ausgeführt wird. Prüfen Sie die Anwendungsprotokolle auf Fehler. Bestätigen Sie, dass der Cron-Dienst unter dem konfigurierten Port erreichbar ist (Standard: `8667`).

### Backup-Protokolle sammeln funktioniert nicht {#collect-backup-logs-not-working}

Wenn die manuelle Sicherungsprotokollerfassung fehlschlägt:

- **Duplistatus-Serverzugriff prüfen**: Bestätigen Sie, dass der Hostname und der Port des Duplicati-Servers korrekt sind. Bestätigen Sie, dass der Remotezugriff in Duplicati aktiviert ist. Stellen Sie sicher, dass das Authentifizierungspasswort korrekt ist.
- **Netzwerkkonnektivität prüfen**: Testen Sie die Konnektivität von **duplistatus** zum Duplicati-Server. Bestätigen Sie, dass der Port des Duplicati-Servers erreichbar ist (Standard: `8200`).
  Wenn Sie beispielsweise Docker verwenden, können Sie `docker exec -it <container-name> /bin/sh` verwenden, um auf die Befehlszeile des Containers zuzugreifen und Netzwerktools wie `ping` und `curl` auszuführen.

    ```bash
    docker exec -it duplistatus /bin/sh
    ping duplicati-server.local
    curl -I http://duplicati-server.local:8200
    ```

Prüfen Sie auch die DNS-Konfiguration im Container (weitere Informationen unter [DNS-Konfiguration für Podman-Container](../installation/installation.md#configuring-dns-for-podman-containers))

### Upgrade von einer früheren Version (vor 0.9.x) und kann sich nicht anmelden {#upgrade-from-an-earlier-version-09x-and-cant-login}

**duplistatus** ab Version 0.9.x erfordert eine Benutzerauthentifizierung. Ein Standard-`admin`-Konto wird automatisch erstellt, wenn Sie die Anwendung zum ersten Mal installieren oder von einer früheren Version aktualisieren:
    - Benutzername: `admin`
    - Passwort: `Duplistatus09`

Sie können zusätzliche Benutzerkonten in [Einstellungen > Benutzer](settings/user-management-settings.md) nach der ersten Anmeldung erstellen.

### Verlorenes Admin-Passwort oder Gesperrt {#lost-admin-password-or-locked-out}

Wenn Sie Ihr Administrator-Passwort verloren haben oder aus Ihrem Konto gesperrt wurden:

- **Admin-Wiederherstellungsskript verwenden**: Siehe den Leitfaden [Admin-Kontowiederherstellung](admin-recovery.md) für Anweisungen zur Wiederherstellung des Administrator-Zugriffs in Docker-Umgebungen.
- **Container-Zugriff bestätigen**: Stellen Sie sicher, dass Sie Docker-exec-Zugriff auf den Container haben, um das Wiederherstellungsskript auszuführen.

### Datenbanksicherung und Migration {#database-backup-and-migration}

Wann Sie von vorherigen Versionen migrieren oder eine Datenbanksicherung erstellen:

**Wenn Sie Version 1.2.1 oder später ausführen:**
- Verwenden Sie die integrierte Datenbanksicherungsfunktion in `Einstellungen → Datenbankwartung`
- Wählen Sie Ihr bevorzugtes Format (.db oder .sql) aus und klicken Sie auf `Sicherung herunterladen`
- Die Sicherungsdatei wird auf Ihren Computer heruntergeladen
- Siehe [Datenbankwartung](settings/database-maintenance.md#database-backup) für detaillierte Anweisungen

**Wenn Sie eine Version vor 1.2.1 ausführen:**
- Sie müssen manuell eine Sicherung erstellen. Weitere Informationen finden Sie im [Migrationsleitfaden](../migration/version_upgrade.md#backing-up-your-database-before-migration).

Wenn Sie weiterhin Probleme haben, versuchen Sie die folgenden Schritte:

1.  **Anwendungsprotokolle prüfen**: Bei Verwendung von Docker führen Sie `docker logs <container-name>` aus, um detaillierte Fehlerinformationen zu überprüfen.
2.  **Konfiguration bestätigen**: Überprüfen Sie alle Konfigurationseinstellungen in Ihrem Container-Verwaltungstool (Docker, Portainer, Podman usw.) doppelt, einschließlich Ports, Netzwerk und Berechtigungen.
3.  **Netzwerkverbindung bestätigen**: Bestätigen Sie, dass alle Netzwerkverbindungen stabil sind.
4.  **Cron-Service prüfen**: Stellen Sie sicher, dass der Cron-Service neben der Hauptanwendung ausgeführt wird. Prüfen Sie die Protokolle für beide Services.
5.  **Dokumentation konsultieren**: Weitere Informationen finden Sie im Installationshandbuch und in der README-Datei.
6.  **Probleme melden**: Wenn das Problem weiterhin besteht, reichen Sie bitte ein detailliertes Problem im [duplistatus GitHub-Repository](https://github.com/wsj-br/duplistatus/issues) ein.

<br/>

# Zusätzliche Ressourcen {#additional-resources}

- **Installationsanleitung**: [Installationsanleitung](../installation/installation.md)
- **Duplicati-Dokumentation**: [docs.duplicati.com](https://docs.duplicati.com)
- **API-Dokumentation**: [API-Referenz](../api-reference/overview.md)
- **GitHub-Repository**: [wsj-br/duplistatus](https://github.com/wsj-br/duplistatus)
- **Entwicklungsanleitung**: [Entwicklungsanleitung](../development/setup.md)
- **Datenbankschema**: [Datenbankdokumentation](../development/database)

### Support {#support}
- **GitHub Issues**: [Fehler melden oder Funktionen anfordern](https://github.com/wsj-br/duplistatus/issues)
