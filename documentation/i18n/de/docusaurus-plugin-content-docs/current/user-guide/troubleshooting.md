# Problembehandlung {/* #troubleshooting */}

### Dashboard lädt nicht {/* #dashboard-not-loading */}
- Prüfen Sie, ob der Container läuft: `docker ps`
- Stellen Sie sicher, dass Port 9666 erreichbar ist
- Überprüfen Sie die Container-Protokolle: `docker logs duplistatus`
- Falls Sie einen Reverse-Proxy verwenden, überprüfen Sie die Protokolle des Reverse-Proxys auf Fehler
- Falls Sie IP-Zulassungslisten verwenden, überprüfen Sie die Protokolle der IP-Zulassungsliste auf Fehler

### Keine Sicherungsdaten {/* #no-backup-data */}
- Überprüfen Sie die Duplicati-Serverkonfiguration
- Prüfen Sie die Netzwerkkonnektivität zwischen den Servern
- Sehen Sie sich die duplistatus-Protokolle auf Fehler an
- Stellen Sie sicher, dass Sicherungsaufträge ausgeführt werden
- Falls Sie API-Schlüssel verwenden, stellen Sie sicher, dass der API-Schlüssel korrekt ist, der Bereich korrekt ist und nicht abgelaufen ist (ein Lese-Schlüssel kann nicht hochladen)

### Benachrichtigungen funktionieren nicht {/* #notifications-not-working */}
- Überprüfen Sie die Benachrichtigungskonfiguration
- Stellen Sie die Konnektivität zum NTFY-Server sicher (falls NTFY verwendet wird)
- Testen Sie die Benachrichtigungseinstellungen
- Prüfen Sie die Benachrichtigungsprotokolle
- Wenn Sie Administrator sind, suchen Sie nach der roten Sirene in der Symbolleiste und öffnen Sie die verknüpfte Seite für E-Mail- oder NTFY-Einstellungen. Siehe [Zustellungsfehler](delivery-failures.md).

### Neue Sicherungen werden nicht angezeigt {/* #new-backups-not-showing */}

Wenn Sie Duplicati-Server-Warnungen wie `HTTP Response request failed for:` und `Failed to send message: System.Net.Http.HttpRequestException:` sehen und neue Sicherungen nicht im Dashboard oder im Sicherungsverlauf erscheinen:

- **Duplicati-Konfiguration prüfen**: Stellen Sie sicher, dass Duplicati ordnungsgemäß konfiguriert ist, um JSON an **duplistatus** zu senden. Verwenden Sie in Duplicati 2.0.9.106 und neuer `--send-http-json-urls`, das auf `/api/upload` zeigt. Verwenden Sie in älteren Versionen von Duplicati `--send-http-url` mit `--send-http-result-output-format=Json`. Siehe [Duplicati-Serverkonfiguration](../installation/duplicati-server-configuration.md).
- **Netzwerkkonnektivität prüfen**: Stellen Sie sicher, dass der Duplicati-Server eine Verbindung zum **duplistatus**-Server herstellen kann. Bestätigen Sie, dass der Port korrekt ist (Standard: `9666`).
- **HTTP 401**: API-Schlüssel sind erforderlich und die Upload-URL enthält keinen gültigen Upload-Bereichsschlüssel. Fügen Sie `?api_key=` hinzu, wie unter [API-Schlüssel](settings/api-keys-settings.md) beschrieben.
- **HTTP 403**: Der Schlüsselbereich ist falsch (ein Lese-Schlüssel kann nicht hochladen) oder der Duplicati-Host befindet sich nicht auf der [externen API IP-Zulassungsliste](settings/ip-allowlist-settings.md).
- **HTTP 413**: Der JSON-Bericht ist größer als das Upload-Größenlimit (Standard 5 MB). Verringern Sie `--send-http-max-log-lines` oder erhöhen Sie das Limit unter Einstellungen → API-Schlüssel.
- **HTTP 429**: Das pro-IP-Upload-Ratelimit wurde überschritten. Warten Sie `Retry-After` oder erhöhen Sie die Limits, wenn viele Jobs gleichzeitig beendet werden.
- **Duplicati-Protokolle überprüfen**: Suchen Sie nach HTTP-Anforderungsfehlern in den Duplicati-Protokollen.
- **Doppelte Berichterstattung**: Wenn Sie auch Formularberichte an [Duplicati-Überwachung](https://www.duplicati-monitoring.com/) senden, kann ein Fehler oder HTTP 500 von diesem Dienst verhindern, dass Duplicati den JSON-Bericht an **duplistatus** sendet. Formular-URLs werden zuerst gesendet. Siehe [Berichterstattung an duplistatus und Duplicati-Überwachung](../installation/duplicati-server-configuration.md#reporting-to-duplistatus-and-duplicati-monitoring).

### Doppelte Server im Dashboard {/* #duplicate-servers-on-the-dashboard */}

Wenn derselbe Server mehrfach im Dashboard erscheint, tritt dies meist nach [Sammeln der Sicherungsprotokolle](collect-backup-logs.md) oder nach Neuinstallation oder Aktualisierung des Duplicati-Servers auf.

**Ursachen:**

- **Geänderte `machine_id`**: Beim Neustart oder Upgrade von Duplicati kann sich die `machine_id` des Servers ändern, woraufhin **duplistatus** ihn als neuen Server behandelt.
- **Duplicati-API-Fehler**: In neueren Versionen von Duplicati gibt es einen Fehler, bei dem einige API-Endpunkte die `identity`-ID und die `machine_id` vermischen. Diese Inkonsistenz führt dazu, dass **duplistatus** denselben Server unter verschiedenen IDs registriert und Duplikate erzeugt.

**Behebung:**

1.  An dem **Duplicati-Server** führen Sie **eine** der folgenden Aktionen aus:
    - Bearbeiten Sie die `identity.txt` und `machineid.txt` Dateien, sodass beide Dateien die **gleiche** ID enthalten; oder
    - Öffnen Sie **Duplicati → Einstellungen → Erweiterte Optionen → Maschinen-ID** und setzen Sie einen Wert (er wird automatisch ausgefüllt — akzeptieren Sie einfach den vorgeschlagenen Wert).
2.  **Starten** Sie den Duplicati-Server neu, damit die Änderung wirksam wird.
3.  Konsolidieren Sie die doppelten Einträge in **duplistatus** über [Einstellungen → Datenbankverwaltung → Doppelte Server zusammenführen](settings/database-maintenance.md#merge-duplicate-servers).

### Benachrichtigungen funktionieren nicht (ausführlich) {/* #notifications-not-working-detailed */}

Wenn Benachrichtigungen nicht gesendet oder empfangen werden:

- **NTFY-Konfiguration prüfen**: Stellen Sie sicher, dass die NTFY-URL und das Topic korrekt sind. Verwenden Sie die Schaltfläche **Testbenachrichtigung senden**, um zu testen.
- **Netzwerkkonnektivität prüfen**: Stellen Sie sicher, dass **duplistatus** Ihren NTFY-Server erreichen kann. Überprüfen Sie gegebenenfalls die Firewall-Einstellungen.
- **Benachrichtigungseinstellungen prüfen**: Stellen Sie sicher, dass Benachrichtigungen für die relevanten Sicherungen aktiviert sind.

### Verfügbare Versionen werden nicht angezeigt {/* #available-versions-not-appearing */}

Wenn Sicherungsversionen nicht im Dashboard oder auf der Detailseite angezeigt werden:

- **Duplicati-Konfiguration prüfen**: Stellen Sie sicher, dass `send-http-log-level=Information` und `send-http-max-log-lines=500` in den erweiterten Optionen von Duplicati konfiguriert sind. Duplicati behält die ersten N Protokollzeilen bei. Wenn die Versionsliste weiterhin fehlt, erhöhen Sie das Limit oder verwenden Sie `0`, wenn Sie keine Berichte an die Duplicati-Überwachung senden. Die Anzahl der **Versionen** kann weiterhin aus den JSON-Statistiken erscheinen, wenn die detaillierte Liste fehlt. Siehe [Protokollzeilen und verfügbare Versionen](../installation/duplicati-server-configuration.md#log-lines-and-available-versions).

### Überfällige Sicherungswarnungen funktionieren nicht {/* #overdue-backup-alerts-not-working */}

Wenn Benachrichtigungen über überfällige Sicherungen nicht gesendet werden:

- **Überfällige Konfiguration prüfen**: Bestätigen Sie, dass die Sicherungsüberwachung für die Sicherung aktiviert ist. Überprüfen Sie die Einstellungen für das erwartete Intervall und die Toleranz.
- **Benachrichtigungshäufigkeit prüfen**: Wenn auf **Einmalig** eingestellt, werden Warnungen nur einmal pro überfälligem Ereignis gesendet.
- **Cron-Dienst prüfen**: Stellen Sie sicher, dass der Cron-Dienst, der überfällige Sicherungen überwacht, korrekt läuft. Prüfen Sie die Anwendungsprotokolle auf Fehler. Vergewissern Sie sich, dass der Cron-Dienst über den konfigurierten Port erreichbar ist (Standard: `8667`).

### Sicherungsprotokolle sammeln funktioniert nicht {/* #collect-backup-logs-not-working */}

Wenn die manuelle Sicherung des Sicherungsprotokolls fehlschlägt:

- **Zugriff auf Duplicati-Server prüfen**: Überprüfen Sie, ob Hostname und Port des Duplicati-Servers korrekt sind. Bestätigen Sie, dass der Fernzugriff in Duplicati aktiviert ist. Stellen Sie sicher, dass das Authentifizierungspasswort korrekt ist.
- **Netzwerkkonnektivität prüfen**: Testen Sie die Konnektivität von **duplistatus** zum Duplicati-Server. Bestätigen Sie, dass der Duplicati-Server-Port zugänglich ist (Standard: `8200`).
  Wenn Sie beispielsweise Docker verwenden, können Sie `docker exec -it <container-name> /bin/sh` verwenden, um auf die Befehlszeile des Containers zuzugreifen und Netzwerktools wie `ping` und `curl` auszuführen.

    ```bash
    docker exec -it duplistatus /bin/sh
    ping duplicati-server.local
    curl -I http://duplicati-server.local:8200
    ```

Überprüfen Sie auch die DNS-Konfiguration innerhalb des Containers (weitere Informationen unter [DNS-Konfiguration für Podman-Container](../installation/installation.md#configuring-dns-for-podman-containers))

- Bei **Duplicati 2.4 und später** listet `/api/v1/systeminfo` `machine-id` mit einem leeren Standardwert auf. **duplistatus** liest die konfigurierte ID aus den Duplicati-Servereinstellungen. Wenn die Sammlung den Server immer noch nicht identifizieren kann, setzen Sie **Duplicati → Einstellungen → Erweiterte Optionen → Maschinen-ID** und versuchen Sie es erneut.

### Upgrade von einer früheren Version (vor 0.9.x) und kann nicht anmelden {/* #upgrade-from-an-earlier-version-before-09x-and-cant-login */}

**duplistatus** ab Version 0.9.x erfordert Benutzerauthentifizierung. Ein Standardkonto `admin` wird automatisch erstellt, wenn Sie die Anwendung zum ersten Mal installieren oder von einer früheren Version aktualisieren: 
    - Benutzername: `admin`
    - Passwort: `Duplistatus09`

Sie können nach der ersten Anmeldung zusätzliche Benutzerkonten in [Einstellungen > Benutzer](settings/user-management-settings.md) erstellen.

### Administrator-Passwort verloren oder ausgesperrt {/* #lost-admin-password-or-locked-out */}

Wenn Sie Ihr Administrator-Passwort vergessen haben oder aus Ihrem Konto ausgesperrt wurden (Sie können `/login` immer noch öffnen):

- **Admin-Wiederherstellungsskript verwenden**: Siehe Leitfaden [Wiederherstellung des Administrator-Kontos](admin-recovery.md) für Anweisungen zur Wiederherstellung des Administratorzugriffs in Docker-Umgebungen.
- **Container-Zugriff bestätigen**: Stellen Sie sicher, dass Sie Docker exec-Zugriff auf den Container haben, um das Wiederherstellungsskript auszuführen.

Wenn der Browser **Zugriff verweigert** (HTTP 403) vor der Anmeldung anzeigt, handelt es sich um eine [IP-Zulassungslisten-Sperre](#locked-out-by-ip-allowlist), nicht um ein vergessenes Passwort. Das Admin-Wiederherstellungsskript kann dies nicht umgehen.

### Durch IP-Zulassungsliste ausgesperrt {/* #locked-out-by-ip-allowlist */}

Wenn Einstellungen → [IP-Zulassungsliste](settings/ip-allowlist-settings.md) mit fehlender oder falscher CIDR aktiviert ist, lehnt der Proxy die Anfrage vor der Authentifizierung ab. Typische Symptome:

- Seiten (`/`, `/login`, `/settings`, …) geben Klartext **Zugriff verweigert** (HTTP 403) zurück.
- Sitzungs- und Admin-APIs geben JSON `{ "errorCode": "IP_NOT_ALLOWED" }` zurück.
- `/api/health` und `/api/ping` geben ebenfalls 403 von einer nicht aufgeführten IP zurück, wenn eine der Zulassungslisten aktiviert ist. Sie antworten immer noch vom Loopback. Anmelde-Cookies helfen nicht.

Um zu bestätigen, dass die Anwendung während eines Lockouts läuft, führen Sie den Test von innerhalb des Containers aus (Loopback ist immer erlaubt):

```bash
docker exec duplistatus curl -sf http://127.0.0.1:9666/api/ping
```

Der Speicherpfad versucht dies zu verhindern: Sie können die **Admin**-Liste nicht aktivieren, solange sich Ihre aktuelle IP nicht bereits in den CIDRs befindet (außer beim Speichern über Loopback). Sie können sich weiterhin aussperren, indem Sie einen CIDR verwenden, der jetzt passt, später aber nicht mehr (VPN, DHCP, ein anderes Netzwerk), durch falsche Konfiguration vertrauenswürdiger Proxies oder durch Aktivierung der Liste von `127.0.0.1` / `::1` ohne Hinzufügen dieser Adresse.

Umgebungsvariablen überschreiben die Datenbank, sodass Sie ohne die Benutzeroberfläche wiederherstellen können. Sie schreiben die Einstellungen nicht um; ein Neustart ist erforderlich, damit der Prozess sie übernimmt.

**Admin-Liste deaktivieren** (übliche Wiederherstellung):

```bash
ADMIN_IP_ALLOWLIST_ENABLED=false
```

**Oder lassen Sie sie aktiviert und fügen Sie einen CIDR hinzu, der Ihre aktuelle IP enthält:**

```bash
ADMIN_IP_ALLOWLIST=203.0.113.10/32
```

Starten Sie dann die Anwendung neu:

- **Docker Compose**: Legen Sie dieselben Schlüssel unter `environment` in `docker-compose.yml` fest (die Datei enthält kommentierte Beispiele) und erstellen Sie den App-Container neu. `docker exec` ändert keine Umgebungsvariablen eines laufenden Containers.
- **Lokal / systemd**: Exportieren Sie die Variable in der Dienstumgebung und starten Sie den Next.js-Prozess neu (nicht nur den Cron-Dienst).

Nachdem Sie die Benutzeroberfläche wieder öffnen können:

1. Melden Sie sich an und korrigieren Sie die CIDRs und vertrauenswürdigen Proxies in Einstellungen → IP-Zulassungsliste.
2. Entfernen Sie die Umgebungsüberschreibung, damit die Einstellungen wieder die einzige Quelle der Wahrheit sind.

Die **externe API**-Zulassungsliste (`/api/upload`, `/api/summary`, `/api/lastbackup*`) sperrt das Dashboard nicht. Stellen Sie es auf dieselbe Weise mit `EXTERNAL_API_IP_ALLOWLIST_ENABLED=false` oder `EXTERNAL_API_IP_ALLOWLIST` wieder her. Wenn Duplicati-Uploads nach Aktivierung dieser Liste mit HTTP 403 fehlschlagen, siehe [Neue Backups werden nicht angezeigt](#new-backups-not-showing). Die Wiederherstellung über vertrauenswürdige Proxies verwendet `IP_TRUSTED_PROXIES` (ein nicht leerer Wert impliziert auch vertrauenswürdigen Proxy).

Siehe [IP-Zulassungsliste](settings/ip-allowlist-settings.md#environment-overrides) und [Umgebungsvariablen](../installation/environment-variables.md).

### Datenbank-Backup und Migration {/* #database-backup-and-migration */}

Beim Migrieren von früheren Versionen oder beim Erstellen einer Datenbanksicherung:

**Wenn Sie Version 1.2.1 oder neuer ausführen:**
- Verwenden Sie die integrierte Datenbanksicherungsfunktion in [Einstellungen → Datenbankverwaltung](user-guide/settings/database-maintenance.md)
- Wählen Sie Ihr bevorzugtes Format (.db oder .sql) und klicken Sie auf **Backup herunterladen**
- Die Sicherungsdatei wird auf Ihren Computer heruntergeladen
- Siehe [Datenbankverwaltung](settings/database-maintenance.md#database-backup) für detaillierte Anweisungen

**Wenn Sie eine Version vor 1.2.1 ausführen:**
- Sie müssen manuell sichern. Siehe den [Migrationsleitfaden](../migration/version_upgrade.md#backing-up-your-database-before-migration) für weitere Informationen.

Wenn Sie weiterhin Probleme haben, versuchen Sie folgende Schritte:

1. **Anwendungsprotokolle prüfen**: Falls Sie Docker verwenden, führen Sie `docker logs <container-name>` aus, um detaillierte Fehlerinformationen anzuzeigen.
2. **Konfiguration überprüfen**: Überprüfen Sie alle Konfigurationseinstellungen in Ihrem Container-Management-Tool (Docker, Portainer, Podman usw.) einschließlich Ports, Netzwerk und Berechtigungen.
3. **Netzwerkkonnektivität überprüfen**: Stellen Sie sicher, dass alle Netzwerkverbindungen stabil sind.
4. **Cron-Dienst prüfen**: Stellen Sie sicher, dass der Cron-Dienst neben der Hauptanwendung läuft. Prüfen Sie die Protokolle für beide Dienste.
5. **Dokumentation konsultieren**: Lesen Sie den Installationsleitfaden und die README für weitere Informationen.
6. **Probleme melden**: Falls das Problem weiterhin besteht, senden Sie bitte ein detailliertes Problem im [duplistatus GitHub-Repository](https://github.com/wsj-br/duplistatus/issues).

<br/>

# Zusätzliche Ressourcen {/* #additional-resources */}

- **Installationsanleitung**: [Installationsanleitung](../installation/installation.md)
- **Duplicati-Dokumentation**: [docs.duplicati.com](https://docs.duplicati.com)
- **API-Dokumentation**: [API-Referenz](../api-reference/overview.md)
- **GitHub-Repository**: [wsj-br/duplistatus](https://github.com/wsj-br/duplistatus)
- **Entwicklungsleitfaden**: [Entwicklungsleitfaden](../development/setup.md)
- **Datenbankschema**: [Datenbankdokumentation](../development/database)

### Support {/* #support */}
- **GitHub-Issues**: [Fehler melden oder Funktionen anfordern](https://github.com/wsj-br/duplistatus/issues)
