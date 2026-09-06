# Fehlerbehebung {#troubleshooting}

### Dashboard wird nicht geladen {#dashboard-not-loading}
- Prüfen Sie, ob der Container ausgeführt wird: `docker ps`
- Bestätigen Sie, dass Port 9666 erreichbar ist
- Prüfen Sie die Container-Protokolle: `docker logs duplistatus`

### Keine Sicherungsdaten {#no-backup-data}
- Duplicati-Serverkonfiguration überprüfen
- Netzwerkkonnektivität zwischen Servern überprüfen
- duplistatus-Logs auf Fehler überprüfen
- Stellen Sie sicher, dass die Backup-Jobs ausgeführt werden

### Benachrichtigungen funktionieren nicht {#notifications-not-working}
- Benachrichtigungskonfiguration überprüfen
- NTFY-Serververbindung überprüfen (wenn NTFY verwendet wird)
- Benachrichtigungseinstellungen testen
- Überprüfen Sie die Benachrichtigungs-Logs

### Neue Sicherungen werden nicht angezeigt {#new-backups-not-showing}

Wenn Sie Duplicati-Server-Warnungen wie `HTTP Response request failed for:` und `Failed to send message: System.Net.Http.HttpRequestException:` sehen und neue Sicherungen nicht im Dashboard oder Sicherungsverlauf angezeigt werden:

- **Duplicati-Konfiguration prüfen**: Stellen Sie sicher, dass Duplicati korrekt konfiguriert ist, um JSON an **duplistatus** zu senden. Bei Duplicati 2.0.9.106 und später verwenden Sie `--send-http-json-urls`, das auf `/api/upload` zeigt. Bei älteren Duplicati-Versionen verwenden Sie `--send-http-url` mit `--send-http-result-output-format=Json`. Siehe [Duplicati Server-Konfiguration](../installation/duplicati-server-configuration.md).
- **Netzwerkverbindung prüfen**: Stellen Sie sicher, dass der Duplicati-Server eine Verbindung zum **duplistatus**-Server herstellen kann. Prüfen Sie, ob der Port korrekt ist (Standard: `9666`).
- **HTTP 401**: API-Schlüssel sind erforderlich, und die Upload-URL fehlt einen gültigen Upload-Bereichsschlüssel. Fügen Sie `?api_key=` hinzu, wie in [API-Schlüssel](settings/api-keys-settings.md) beschrieben.
- **HTTP 403**: Der Schlüsselbereich ist falsch (ein Leseschlüssel kann nicht hochladen), oder der Duplicati-Host steht nicht auf der [externen API-IP-Zulassungsliste](settings/ip-allowlist-settings.md).
- **HTTP 413**: Der JSON-Bericht ist größer als das Upload-Größenlimit (Standard 5 MB). Verringern Sie `--send-http-max-log-lines` oder erhöhen Sie das Limit in Einstellungen → API-Schlüssel.
- **HTTP 429**: Das pro-IP-Upload-Rate-Limit wurde überschritten. Warten Sie `Retry-After`, oder erhöhen Sie die Limits, wenn viele Jobs gleichzeitig abgeschlossen werden.
- **Duplicati-Protokolle überprüfen**: Prüfen Sie die Duplicati-Protokolle auf HTTP-Anforderungsfehler.
- **Doppelte Berichterstattung**: Wenn Sie auch Formberichte an [Duplicati Monitoring](https://www.duplicati-monitoring.com/) senden, kann ein Fehler oder HTTP 500 von diesem Dienst Duplicati daran hindern, den JSON-Bericht an **duplistatus** zu senden. Form-URLs werden zuerst gesendet. Siehe [Berichterstattung an duplistatus und Duplicati Monitoring](../installation/duplicati-server-configuration.md#reporting-to-duplistatus-and-duplicati-monitoring).

### Doppelte Server auf dem Dashboard {#duplicate-servers-on-the-dashboard}

Wenn derselbe Server mehrmals auf dem Dashboard angezeigt wird, geschieht dies meistens nach dem [Sammeln von Backup-Protokollen](collect-backup-logs.md) oder nach der Neuinstallation oder dem Upgrade des Duplicati-Servers.

**Ursachen:**

- **Geänderte `machine_id`**: Wann Sie Duplicati neu installieren oder aktualisieren, kann sich die `machine_id` des Servers ändern, und **duplistatus** behandelt ihn dann als neuen Server.
- **Duplicati-API-Fehler**: In neueren Versionen von Duplicati gibt es einen Fehler, bei dem einige API-Endpunkte die `identity`-ID und die `machine_id` vermischen. Diese Inkonsistenz führt dazu, dass **duplistatus** denselben Server unter verschiedenen IDs registriert, was Duplikate erzeugt.

**Problemumgehung:**

1.  Führen Sie auf dem **Duplicati-Server** **einen** der folgenden Schritte aus:
    - Bearbeiten Sie die `identity.txt`- und `machineid.txt`-Dateien, damit beide Dateien die **gleiche** ID enthalten; oder
    - Öffnen Sie **Duplicati → Einstellungen → Erweiterte Optionen → Machine-id** und setzen Sie einen Wert (er wird automatisch ausgefüllt – akzeptieren Sie einfach den vorgeschlagenen Wert).
2.  **Starten Sie** den Duplicati-Server neu, damit die Änderung wirksam wird.
3.  Führen Sie in **duplistatus** die doppelten Einträge zusammen über [Einstellungen → Datenbankverwaltung → Doppelte Server zusammenführen](settings/database-maintenance.md#merge-duplicate-servers).

### Benachrichtigungen funktionieren nicht (Detailliert) {#notifications-not-working-detailed}

Wenn Benachrichtigungen nicht gesendet oder empfangen werden:

- **NTFY-Konfiguration prüfen**: Stellen Sie sicher, dass die NTFY-URL und das Thema korrekt sind. Verwenden Sie die Schaltfläche **Testbenachrichtigung senden** zum Testen.
- **Netzwerkkonnektivität prüfen**: Bestätigen Sie, dass **duplistatus** Ihren NTFY-Server erreichen kann. Überprüfen Sie die Firewall-Einstellungen, falls zutreffend.
- **Benachrichtigungseinstellungen prüfen**: Bestätigen Sie, dass Benachrichtigungen für die relevanten Sicherungen aktiviert sind.

### Verfügbare Versionen werden nicht angezeigt {#available-versions-not-appearing}

Wenn Sicherungsversionen auf dem Dashboard oder der Detailseite nicht angezeigt werden:

- **Duplicati-Konfiguration prüfen**: Stellen Sie sicher, dass `send-http-log-level=Information` und `send-http-max-log-lines=500` in den erweiterten Optionen von Duplicati konfiguriert sind. Duplicati behält die ersten N Protokollzeilen bei. Wenn die Versionsliste immer noch fehlt, erhöhen Sie die Obergrenze oder verwenden Sie `0`, wenn Sie keine Berichte an Duplicati Monitoring senden. Die Versions**anzahl** kann weiterhin aus den JSON-Statistiken erscheinen, wenn die detaillierte Liste fehlt. Siehe [Protokollzeilen und verfügbare Versionen](../installation/duplicati-server-configuration.md#log-lines-and-available-versions).

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

- Bei **Duplicati 2.4 und später** listet `/api/v1/systeminfo` `machine-id` mit einem leeren Standardwert auf. **duplistatus** liest die konfigurierte ID aus den Duplicati-Server-Einstellungen. Falls die Sammlung den Server weiterhin nicht identifizieren kann, legen Sie **Duplicati → Einstellungen → Erweiterte Optionen → Machine-id** fest und versuchen Sie es erneut.

### Upgrade von einer früheren Version (vor 0.9.x) und Anmeldung nicht möglich {#upgrade-from-an-earlier-version-before-09x-and-cant-login}

**duplistatus** ab Version 0.9.x erfordert Benutzerauthentifizierung. Ein Standard-`admin`-Konto wird automatisch erstellt, wenn die Anwendung zum ersten Mal installiert oder von einer früheren Version aktualisiert wird:
    - Benutzername: `admin`
    - Passwort: `Duplistatus09`

Sie können zusätzliche Benutzerkonten in [Einstellungen > Benutzer](settings/user-management-settings.md) nach dem ersten Anmelden erstellen.

### Verlorenes Admin-Passwort oder gesperrt {#lost-admin-password-or-locked-out}

Wenn Sie Ihr Administrator-Passwort verloren haben oder von Ihrem Konto gesperrt wurden (Sie können `/login` immer noch öffnen):

- **Admin-Wiederherstellungsskript verwenden**: Siehe den Leitfaden [Admin Account Recovery](admin-recovery.md) für Anweisungen zur Wiederherstellung des Administrator-Zugriffs in Docker-Umgebungen.
- **Container-Zugriff bestätigen**: Stellen Sie sicher, dass Sie Docker exec-Zugriff auf den Container haben, um das Wiederherstellungsskript auszuführen.

Wenn der Browser **Zugriff verweigert** (HTTP 403) anzeigt, bevor Sie sich anmelden, handelt es sich um eine [IP-Zulassungslisten-Sperre](#locked-out-by-ip-allowlist), nicht um ein vergessenes Passwort. Das Admin-Wiederherstellungsskript kann diese Sperre nicht umgehen.

### Gesperrt durch IP-Zulassungsliste {#locked-out-by-ip-allowlist}

Wenn Einstellungen → [IP-Zulassungsliste](settings/ip-allowlist-settings.md) aktiviert ist, aber die CIDR fehlt oder falsch ist, lehnt der Proxy die Anfrage vor der Authentifizierung ab. Typische Symptome:

- Seiten (`/`, `/login`, `/settings`, …) geben **Zugriff verweigert** (HTTP 403) als Klartext zurück.
- Session- und Admin-APIs geben JSON `{ "errorCode": "IP_NOT_ALLOWED" }` zurück.
- `/api/health` und `/api/ping` antworten weiterhin (sie sind ausgenommen). Login-Cookies helfen nicht.

Der Speicherpfad versucht, dies zu verhindern: Sie können die **Admin**-Liste nicht aktivieren, es sei denn, Ihre aktuelle IP ist bereits in den CIDRs enthalten (außer beim Speichern von der Loopback-Adresse). Sie können sich trotzdem durch eine CIDR sperren, die jetzt passt, aber später nicht mehr (VPN, DHCP, anderes Netzwerk), durch eine falsche Konfiguration vertrauenswürdiger Proxies oder durch das Aktivieren der Liste von `127.0.0.1` / `::1` ohne das Hinzufügen dieser Adresse.

Umgebungsvariablen überschreiben die Datenbank, sodass Sie sich ohne die Benutzeroberfläche wiederherstellen können. Sie schreiben Einstellungen nicht um; ein Neustart ist erforderlich, damit der Prozess die Änderungen aufnimmt.

**Deaktivieren Sie die Admin-Liste** (gewöhnliche Wiederherstellung):

```bash
ADMIN_IP_ALLOWLIST_ENABLED=false
```

**Oder behalten Sie sie aktiviert und fügen Sie eine CIDR hinzu, die Ihre aktuelle IP enthält:**

```bash
ADMIN_IP_ALLOWLIST=203.0.113.10/32
```

Starten Sie dann die Anwendung neu:

- **Docker Compose**: Legen Sie die gleichen Schlüssel unter `environment` in `docker-compose.yml` fest (die Datei enthält kommentierte Beispiele) und erstellen Sie den App-Container neu. `docker exec` ändert die Umgebungsvariablen eines laufenden Containers nicht.
- **Lokal / systemd**: Exportieren Sie die Variable in der Service-Umgebung und starten Sie den Next.js-Prozess neu (nicht nur den Cron-Service).

Sobald Sie die Benutzeroberfläche wieder öffnen können:

1. Melden Sie sich an und korrigieren Sie die CIDRs und vertrauenswürdigen Proxies in Einstellungen → IP-Zulassungsliste.
2. Entfernen Sie die Umgebungsüberschreibung, sodass Einstellungen wieder die Quelle der Wahrheit ist.

Die **externe API**-Zulassungsliste (`/api/upload`, `/api/summary`, `/api/lastbackup*`) sperrt das Dashboard nicht. Wiederherstellen Sie sie auf die gleiche Weise mit `EXTERNAL_API_IP_ALLOWLIST_ENABLED=false` oder `EXTERNAL_API_IP_ALLOWLIST`. Wenn Duplicati-Uploads nach dem Aktivieren dieser Liste mit HTTP 403 fehlschlagen, siehe [Neue Backups werden nicht angezeigt](#new-backups-not-showing). Die Wiederherstellung vertrauenswürdiger Proxies verwendet `IP_TRUSTED_PROXIES` (ein nicht-leerer Wert impliziert auch trust-proxy).

Siehe [IP-Zulassungsliste](settings/ip-allowlist-settings.md#environment-overrides) und [Umgebungsvariablen](../installation/environment-variables.md).

### Datenbanksicherung und Migration {#database-backup-and-migration}

Beim Migrieren von vorherigen Versionen oder beim Erstellen einer Datenbanksicherung:

**Wenn Sie Version 1.2.1 oder höher verwenden:**
- Verwenden Sie die integrierte Datenbank-Backup-Funktion unter [Einstellungen → Datenbankwartung](user-guide/settings/database-maintenance.md)
- Wählen Sie das gewünschte Format (.db oder .sql) und klicken Sie auf **Backup herunterladen**
- Die Backup-Datei wird auf Ihren Computer heruntergeladen
- Siehe [Datenbankwartung](settings/database-maintenance.md#database-backup) für detaillierte Anweisungen

**Wenn Sie eine Version vor 1.2.1 ausführen:**
- Sie müssen manuell eine Sicherung erstellen. Weitere Informationen finden Sie im [Migration Guide](../migration/version_upgrade.md#backing-up-your-database-before-migration).

Wenn Sie weiterhin Probleme haben, versuchen Sie die folgenden Schritte:

1.  **Anwendungsprotokolle überprüfen**: Wenn Docker verwendet wird, führen Sie `docker logs <container-name>` aus, um detaillierte Fehlerinformationen anzuzeigen.
2.  **Konfiguration überprüfen**: Überprüfen Sie alle Konfigurationseinstellungen in Ihrem Container-Verwaltungstool (Docker, Portainer, Podman usw.), einschließlich Ports, Netzwerk und Berechtigungen.
3.  **Netzwerkverbindung prüfen**: Stellen Sie sicher, dass alle Netzwerkverbindungen stabil sind.
4.  **Cron-Dienst überprüfen**: Stellen Sie sicher, dass der Cron-Dienst neben der Hauptanwendung läuft. Überprüfen Sie die Logs beider Dienste.
5.  **Dokumentation konsultieren**: Weitere Informationen finden Sie im Installationsleitfaden und der README.
6.  **Probleme melden**: Wenn das Problem weiterhin besteht, melden Sie es bitte detailliert im [duplistatus GitHub-Repository](https://github.com/wsj-br/duplistatus/issues).

<br/>

# Zusätzliche Ressourcen {#additional-resources}

- **Installationsanleitung**: [Installationsanleitung](../installation/installation.md)
- **Duplicati-Dokumentation**: [docs.duplicati.com](https://docs.duplicati.com)
- **API-Dokumentation**: [API-Referenz](../api-reference/overview.md)
- **GitHub-Repository**: [wsj-br/duplistatus](https://github.com/wsj-br/duplistatus)
- **Entwicklerhandbuch**: [Entwicklerhandbuch](../development/setup.md)
- **Datenbankschema**: [Datenbankdokumentation](../development/database)

### Unterstützung {#support}
- **GitHub Issues**: [Fehler melden oder Funktionen anfordern](https://github.com/wsj-br/duplistatus/issues)
