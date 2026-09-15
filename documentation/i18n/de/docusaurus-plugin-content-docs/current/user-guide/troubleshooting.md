# Fehlerbehebung {/* #troubleshooting */}

### Dashboard wird nicht geladen {/* #dashboard-not-loading */}
- Prüfen Sie, ob der Container läuft: `docker ps`
- Überprüfen Sie, ob Port 9666 zugänglich ist
- Prüfen Sie die Container-Logs: `docker logs duplistatus`
- Wenn Sie einen Reverse-Proxy verwenden, prüfen Sie die Reverse-Proxy-Logs auf Fehler
- Wenn Sie IP-Zulassungslisten verwenden, prüfen Sie die IP-Zulassungslisten-Logs auf Fehler

### Keine Sicherungsdaten {/* #no-backup-data */}
- Überprüfen Sie die Duplicati-Serverkonfiguration
- Prüfen Sie die Netzwerkverbindung zwischen den Servern
- Überprüfen Sie die duplistatus-Logs auf Fehler
- Stellen Sie sicher, dass Sicherungsjobs laufen
- Wenn Sie API-Schlüssel verwenden, stellen Sie sicher, dass der API-Schlüssel korrekt ist, der Bereich korrekt ist und nicht abgelaufen ist (ein Lese-Schlüssel kann nicht hochladen)

### Benachrichtigungen funktionieren nicht {/* #notifications-not-working */}
- Prüfen Sie die Benachrichtigungskonfiguration
- Überprüfen Sie die NTFY-Serververbindung (falls NTFY verwendet wird)
- Testen Sie die Benachrichtigungseinstellungen
- Prüfen Sie die Benachrichtigungslogs

### Neue Sicherungen werden nicht angezeigt {/* #new-backups-not-showing */}

Wenn Sie Duplicati-Server-Warnungen wie `HTTP Response request failed for:` und `Failed to send message: System.Net.Http.HttpRequestException:` sehen und neue Sicherungen nicht im Dashboard oder im Sicherungsverlauf angezeigt werden:

- **Prüfen Sie die Duplicati-Konfiguration**: Stellen Sie sicher, dass Duplicati korrekt konfiguriert ist, um JSON an **duplistatus** zu senden. Bei Duplicati 2.0.9.106 und später verwenden Sie `--send-http-json-urls`, das auf `/api/upload` zeigt. Bei älteren Duplicati-Versionen verwenden Sie `--send-http-url` mit `--send-http-result-output-format=Json`. Siehe [Duplicati-Serverkonfiguration](../installation/duplicati-server-configuration.md).
- **Prüfen Sie die Netzwerkverbindung**: Stellen Sie sicher, dass der Duplicati-Server eine Verbindung zum **duplistatus**-Server herstellen kann. Stellen Sie sicher, dass der Port korrekt ist (Standard: `9666`).
- **HTTP 401**: API-Schlüssel sind erforderlich und die Upload-URL fehlt einen gültigen Upload-Bereichsschlüssel. Fügen Sie `?api_key=` hinzu, wie in [API-Schlüssel](settings/api-keys-settings.md) beschrieben.
- **HTTP 403**: Der Schlüsselbereich ist falsch (ein Lese-Schlüssel kann nicht hochladen), oder der Duplicati-Host ist nicht in der [externen API-IP-Zulassungsliste](settings/ip-allowlist-settings.md).
- **HTTP 413**: Der JSON-Bericht ist größer als das Upload-Größenlimit (Standard 5 MB). Verringern Sie `--send-http-max-log-lines` oder erhöhen Sie das Limit unter Einstellungen → API-Schlüssel.
- **HTTP 429**: Das pro-IP-Upload-Rate-Limit wurde überschritten. Warten Sie auf `Retry-After`, oder erhöhen Sie die Limits, wenn viele Jobs gleichzeitig beendet werden.
- **Überprüfen Sie die Duplicati-Logs**: Prüfen Sie die Duplicati-Logs auf HTTP-Anforderungsfehler.
- **Doppelte Berichterstattung**: Wenn Sie auch Formberichte an [Duplicati Monitoring](https://www.duplicati-monitoring.com/) senden, kann ein Fehler oder HTTP 500 von diesem Dienst Duplicati daran hindern, den JSON-Bericht an **duplistatus** zu senden. Form-URLs werden zuerst gesendet. Siehe [Berichterstattung an duplistatus und Duplicati Monitoring](../installation/duplicati-server-configuration.md#reporting-to-duplistatus-and-duplicati-monitoring).

### Doppelte Server im Dashboard {/* #duplicate-servers-on-the-dashboard */}

Wenn der gleiche Server mehrmals im Dashboard angezeigt wird, passiert dies am häufigsten nach dem [Sammeln von Sicherungsprotokollen](collect-backup-logs.md), oder nach einer Neuinstallation oder einem Upgrade des Duplicati-Servers.

**Ursachen:**

- **Geänderte `machine_id`**: Wenn Sie Duplicati neu installieren oder upgraden, kann sich die `machine_id` des Servers ändern, und **duplistatus** behandelt ihn dann als neuen Server.
- **Duplicati-API-Fehler**: In neueren Versionen von Duplicati gibt es einen Fehler, bei dem einige API-Endpunkte die `identity` id und die `machine_id` mischen. Diese Inkonsistenz führt dazu, dass **duplistatus** denselben Server unter verschiedenen IDs registriert und damit Duplikate erzeugt.

**Behebung:**

1.  Auf dem **Duplicati-Server** führen Sie **einen** der folgenden Schritte aus:
    - Bearbeiten Sie die `identity.txt` und `machineid.txt` Dateien so, dass beide Dateien die **gleiche** id enthalten; oder
    - Öffnen Sie **Duplicati → Einstellungen → Erweiterte Optionen → Maschinen-ID** und setzen Sie einen Wert (er wird automatisch ausgefüllt — akzeptieren Sie einfach den vorgeschlagenen Wert).
2.  **Starten** Sie den Duplicati-Server neu, damit die Änderung wirksam wird.
3.  In **duplistatus** konsolidieren Sie die doppelten Einträge unter [Einstellungen → Datenbankverwaltung → Doppelte Server zusammenführen](settings/database-maintenance.md#merge-duplicate-servers).

### Benachrichtigungen funktionieren nicht (detailliert) {/* #notifications-not-working-detailed */}

Wenn Benachrichtigungen nicht gesendet oder empfangen werden:

- **Prüfen Sie die NTFY-Konfiguration**: Stellen Sie sicher, dass die NTFY-URL und das Thema korrekt sind. Verwenden Sie die Schaltfläche **Testbenachrichtigung senden**, um zu testen.
- **Prüfen Sie die Netzwerkverbindung**: Stellen Sie sicher, dass **duplistatus** eine Verbindung zu Ihrem NTFY-Server herstellen kann. Überprüfen Sie die Firewall-Einstellungen, falls zutreffend.
- **Prüfen Sie die Benachrichtigungseinstellungen**: Stellen Sie sicher, dass Benachrichtigungen für die relevanten Sicherungen aktiviert sind.

### Verfügbare Versionen erscheinen nicht {/* #available-versions-not-appearing */}

Wenn Sicherungsversionen nicht im Dashboard oder auf der Detailseite angezeigt werden:

- **Duplicati-Konfiguration prüfen**: Stellen Sie sicher, dass `send-http-log-level=Information` und `send-http-max-log-lines=500` in den erweiterten Optionen von Duplicati konfiguriert sind. Duplicati behält die ersten N Protokollzeilen bei. Wenn die Versionsliste immer noch fehlt, erhöhen Sie die Obergrenze oder verwenden Sie `0`, wenn Sie keine Berichte an Duplicati Monitoring senden. Die Versions**anzahl** kann weiterhin aus den JSON-Statistiken erscheinen, wenn die detaillierte Liste fehlt. Siehe [Protokollzeilen und verfügbare Versionen](../installation/duplicati-server-configuration.md#log-lines-and-available-versions).

### Überfällige Backup-Benachrichtigungen funktionieren nicht {/* #overdue-backup-alerts-not-working */}

Wenn überfällige Backup-Benachrichtigungen nicht gesendet werden:

- **Überfällige Konfiguration prüfen**: Stellen Sie sicher, dass die Backup-Überwachung für die Sicherung aktiviert ist. Überprüfen Sie die Einstellungen für das erwartete Intervall und die Toleranz.
- **Benachrichtigungsfrequenz prüfen**: Wenn auf **Einmalig** gesetzt, werden Benachrichtigungen nur einmal pro überfälligem Ereignis gesendet.
- **Cron-Dienst prüfen**: Stellen Sie sicher, dass der Cron-Dienst, der auf überfällige Backups überwacht, korrekt läuft. Überprüfen Sie die Anwendungsprotokolle auf Fehler. Stellen Sie sicher, dass der Cron-Dienst unter dem konfigurierten Port (Standard: `8667`) erreichbar ist.

### Backup-Protokolle sammeln funktioniert nicht {/* #collect-backup-logs-not-working */}

Wenn die manuelle Sammlung der Backup-Protokolle fehlschlägt:

- **Duplicati-Server-Zugriff prüfen**: Stellen Sie sicher, dass der Hostname und der Port des Duplicati-Servers korrekt sind. Stellen Sie sicher, dass der Remote-Zugriff in Duplicati aktiviert ist. Stellen Sie sicher, dass das Authentifizierungs-Passwort korrekt ist.
- **Netzwerkverbindung prüfen**: Testen Sie die Verbindung von **duplistatus** zum Duplicati-Server. Stellen Sie sicher, dass der Port des Duplicati-Servers erreichbar ist (Standard: `8200`).
  Wenn Sie Docker verwenden, können Sie `docker exec -it <container-name> /bin/sh` verwenden, um auf die Befehlszeile des Containers zuzugreifen und Netzwerk-Tools wie `ping` und `curl` auszuführen.

    ```bash
    docker exec -it duplistatus /bin/sh
    ping duplicati-server.local
    curl -I http://duplicati-server.local:8200
    ```

Überprüfen Sie auch die DNS-Konfiguration innerhalb des Containers (siehe mehr unter [DNS-Konfiguration für Podman-Container](../installation/installation.md#configuring-dns-for-podman-containers))

- Bei **Duplicati 2.4 und später** listet `/api/v1/systeminfo` `machine-id` mit einem leeren Standardwert auf. **duplistatus** liest die konfigurierte ID aus den Duplicati-Server-Einstellungen. Wenn die Sammlung den Server immer noch nicht identifizieren kann, legen Sie **Duplicati → Einstellungen → Erweiterte Optionen → Machine-id** fest und versuchen Sie es erneut.

### Upgrade von einer früheren Version (vor 0.9.x) und kann nicht anmelden {/* #upgrade-from-an-earlier-version-before-09x-and-cant-login */}

**duplistatus** ab Version 0.9.x erfordert die Benutzerauthentifizierung. Ein Standard-`admin`-Konto wird automatisch erstellt, wenn die Anwendung zum ersten Mal installiert oder von einer älteren Version aktualisiert wird: 
    - Benutzername: `admin`
    - Passwort: `Duplistatus09`

Sie können zusätzliche Benutzerkonten in [Einstellungen > Benutzer](settings/user-management-settings.md) nach der ersten Anmeldung erstellen.

### Admin-Passwort verloren oder gesperrt {/* #lost-admin-password-or-locked-out */}

Wenn Sie Ihr Administrator-Passwort verloren haben oder von Ihrem Konto gesperrt wurden (Sie können immer noch `/login` öffnen):

- **Admin-Wiederherstellungsskript verwenden**: Siehe die Anleitung zur [Admin-Konto-Wiederherstellung](admin-recovery.md) für Anweisungen zur Wiederherstellung des Administrator-Zugriffs in Docker-Umgebungen.
- **Container-Zugriff überprüfen**: Stellen Sie sicher, dass Sie Docker exec-Zugriff auf den Container haben, um das Wiederherstellungsskript auszuführen.

Wenn der Browser **Zugriff verweigert** (HTTP 403) vor der Anmeldung anzeigt, handelt es sich um eine [IP-Zulassungslisten-Sperre](#locked-out-by-ip-allowlist), nicht um ein vergessenes Passwort. Das Admin-Wiederherstellungsskript kann sie nicht umgehen.

### Durch IP-Zulassungsliste gesperrt {/* #locked-out-by-ip-allowlist */}

Wenn Einstellungen → [IP-Zulassungsliste](settings/ip-allowlist-settings.md) aktiviert ist mit einer fehlenden oder falschen CIDR, lehnt der Proxy die Anfrage vor der Authentifizierung ab. Typische Symptome:

- Seiten (`/`, `/login`, `/settings`, …) geben **Zugriff verweigert** (HTTP 403) als Klartext zurück.
- Sitzungs- und Admin-APIs geben JSON `{ "errorCode": "IP_NOT_ALLOWED" }` zurück.
- `/api/health` und `/api/ping` geben auch 403 von einer nicht aufgelisteten IP zurück, wenn eine der Zulassungslisten aktiviert ist. Sie antworten jedoch immer noch von der Schleife. Login-Cookies helfen nicht.

Um zu bestätigen, dass die Anwendung während eines Sperrens aktiv ist, führen Sie die Probe von innerhalb des Containers aus (Loopback ist immer erlaubt):

```bash
docker exec duplistatus curl -sf http://127.0.0.1:9666/api/ping
```

Der Speicherpfad versucht dies zu verhindern: Sie können die **Admin**-Liste nicht aktivieren, es sei denn, Ihre aktuelle IP ist bereits in den CIDRs enthalten (außer beim Speichern von Loopback). Sie können sich trotzdem sperren, indem Sie ein CIDR verwenden, das jetzt, aber später nicht mehr passt (VPN, DHCP, anderes Netzwerk), indem Sie vertrauenswürdige Proxies falsch konfigurieren oder indem Sie die Liste von `127.0.0.1` / `::1` aktivieren, ohne diese Adresse hinzuzufügen.

Umgebungsvariablen überschreiben die Datenbank, sodass Sie sich ohne die Benutzeroberfläche wiederherstellen können. Sie schreiben die Einstellungen nicht um; ein Neustart ist erforderlich, damit der Prozess sie aufnimmt.

**Deaktivieren Sie die Admin-Liste** (gewöhnliche Wiederherstellung):

```bash
ADMIN_IP_ALLOWLIST_ENABLED=false
```

**Oder lassen Sie sie aktiviert und injizieren Sie ein CIDR, das Ihre aktuelle IP enthält:**

```bash
ADMIN_IP_ALLOWLIST=203.0.113.10/32
```

Starten Sie dann die Anwendung neu:

- **Docker Compose**: Legen Sie dieselben Schlüssel unter `environment` in `docker-compose.yml` fest (die Datei enthält kommentierte Beispiele) und erstellen Sie den App-Container neu. `docker exec` ändert die Umgebungsvariablen eines laufenden Containers nicht.
- **Lokal / systemd**: Exportieren Sie die Variable in der Service-Umgebung und starten Sie den Next.js-Prozess neu (nicht nur den Cron-Service).

Sobald Sie die Benutzeroberfläche wieder öffnen können:

1. Melden Sie sich an und korrigieren Sie die CIDRs und vertrauenswürdigen Proxies in Einstellungen → IP-Zulassungsliste.
2. Entfernen Sie die Umgebungsüberschreibung, damit die Einstellungen wieder die Quelle der Wahrheit sind.

Die **externe API**-Zulassungsliste (`/api/upload`, `/api/summary`, `/api/lastbackup*`) sperrt das Dashboard nicht. Wiederherstellen Sie sie auf dieselbe Weise mit `EXTERNAL_API_IP_ALLOWLIST_ENABLED=false` oder `EXTERNAL_API_IP_ALLOWLIST`. Wenn Duplicati-Uploads mit HTTP 403 fehlschlagen, nachdem Sie diese Liste aktiviert haben, sehen Sie [Neue Backups werden nicht angezeigt](#new-backups-not-showing). Die Wiederherstellung vertrauenswürdiger Proxies verwendet `IP_TRUSTED_PROXIES` (ein nicht-leerer Wert impliziert auch trust-proxy).

Siehe [IP-Zulassungsliste](settings/ip-allowlist-settings.md#environment-overrides) und [Umgebungsvariablen](../installation/environment-variables.md).

### Datenbank-Backup und Migration {/* #database-backup-and-migration */}

Wenn Sie von vorherigen Versionen migrieren oder ein Datenbank-Backup erstellen:

**Wenn Sie Version 1.2.1 oder höher ausführen:**
- Verwenden Sie die integrierte Datenbank-Backup-Funktion in [Einstellungen → Datenbankverwaltung](user-guide/settings/database-maintenance.md)
- Wählen Sie Ihr bevorzugtes Format (.db oder .sql) aus und klicken Sie auf **Backup herunterladen**
- Die Backup-Datei wird auf Ihren Computer heruntergeladen
- Siehe [Datenbankverwaltung](settings/database-maintenance.md#database-backup) für detaillierte Anweisungen

**Wenn Sie eine Version vor 1.2.1 ausführen:**
- Sie müssen manuell sichern.  siehe die [Migration Anleitung](../migration/version_upgrade.md#backing-up-your-database-before-migration) für weitere Informationen.

Wenn Sie weiterhin Probleme haben, versuchen Sie die folgenden Schritte:

1.  **Anwendungsprotokolle prüfen**: Wenn Sie Docker verwenden, führen Sie `docker logs <container-name>` aus, um detaillierte Fehlerinformationen zu überprüfen.
2.  **Konfiguration überprüfen**: Überprüfen Sie alle Konfigurationseinstellungen in Ihrem Container-Management-Tool (Docker, Portainer, Podman, etc.) einschließlich Ports, Netzwerk und Berechtigungen.
3.  **Netzwerkverbindung überprüfen**: Stellen Sie sicher, dass alle Netzwerkverbindungen stabil sind. 
4.  **Cron-Service überprüfen**: Stellen Sie sicher, dass der Cron-Service neben der Hauptanwendung läuft. Überprüfen Sie die Protokolle für beide Dienste.
5.  **Dokumentation konsultieren**: Lesen Sie die Installationsanleitung und das README für weitere Informationen.
6.  **Probleme melden**: Wenn das Problem weiterhin besteht, melden Sie bitte ein detailliertes Problem im [duplistatus GitHub-Repository](https://github.com/wsj-br/duplistatus/issues).

<br/>

# Zusätzliche Ressourcen {/* #additional-resources */}

- **Installationsanleitung**: [Installationsanleitung](../installation/installation.md)
- **Duplicati-Dokumentation**: [docs.duplicati.com](https://docs.duplicati.com)
- **API-Dokumentation**: [API-Referenz](../api-reference/overview.md)
- **GitHub-Repository**: [wsj-br/duplistatus](https://github.com/wsj-br/duplistatus)
- **Entwicklerhandbuch**: [Entwicklerhandbuch](../development/setup.md)
- **Datenbankschema**: [Datenbankdokumentation](../development/database)

### Unterstützung {/* #support */}
- **GitHub-Issues**: [Fehler melden oder Funktionen anfordern](https://github.com/wsj-br/duplistatus/issues)
