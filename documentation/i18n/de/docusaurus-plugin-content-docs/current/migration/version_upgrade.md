---
translation_last_updated: '2026-02-14T04:57:41.694Z'
source_file_mtime: '2026-02-01T03:16:19.469Z'
source_file_hash: 7cff43133e2a1c9a
translation_language: de
source_file_path: migration/version_upgrade.md
---
# Migrationsleitfaden {#migration-guide}

Dieses Handbuch erklärt, wie Sie zwischen Versionen von duplistatus aktualisieren. Migrationen erfolgen automatisch – das Datenbankschema aktualisiert sich selbst, wenn Sie eine neue Version starten.

Manuelle Schritte sind nur erforderlich, wenn Sie benutzerdefinierte Benachrichtigungsvorlagen angepasst haben (Version 0.8.x hat Vorlagenvariablen geändert) oder externe API-Integrationen aktualisiert werden müssen (Version 0.7.x hat API-Feldnamen geändert, Version 0.9.x erfordert Authentifizierung).

## Übersicht {#overview}

duplistatus migriert Ihr Datenbankschema bei einem Upgrade automatisch. Das System:

1. Erstellt eine Sicherung Ihrer Datenbank vor Änderungen
2. Aktualisiert das Datenbankschema auf die neueste Version
3. Bewahrt alle vorhandenen Daten (Server, Sicherungen, Konfiguration)
4. Überprüft, ob die Migration erfolgreich abgeschlossen wurde

## Sicherung Ihrer Datenbank vor der Migration {#backing-up-your-database-before-migration}

Vor dem Upgrade auf eine neue Version wird empfohlen, eine Sicherung von Ihrer Datenbank zu erstellen. Dies stellt sicher, dass Sie Ihre Daten wiederherstellen können, falls während des Migrationsprozesses etwas schiefgeht.

### Wenn Sie Version 1.2.1 oder später ausführen {#if-youre-running-version-121-or-later}

Verwenden Sie die integrierte Datenbanksicherungsfunktion:

1. Navigieren Sie zu `Settings → Database Maintenance` in der Weboberfläche
2. Wählen Sie im Bereich **Datenbanksicherung** ein Sicherungsformat aus:
   - **Datenbankdatei (.db)**: Binärformat – schnellste Sicherung, erhält alle Datenbankstrukturen exakt
   - **SQL-Dump (.sql)**: Textformat – lesbare SQL-Anweisungen
3. Klicken Sie auf `Download Backup`
4. Die Sicherungsdatei wird mit einem Zeitstempel-Dateinamen auf Ihren Computer heruntergeladen

Weitere Details finden Sie in der Dokumentation zur [Datenbankwartung](../user-guide/settings/database-maintenance.md#database-backup).

### Wenn Sie eine Version vor 1.2.1 ausführen {#if-youre-running-a-version-before-121}

#### Sicherung {#backup}

Sie müssen die Datenbank manuell sichern, bevor Sie fortfahren. Die Datenbankdatei befindet sich unter `/app/data/backups.db` im Container.

##### Für Linux-Benutzer {#for-linux-users}
Wenn Sie Linux verwenden, müssen Sie sich keine Gedanken über das Starten von Hilfcontainern machen. Sie können den nativen `cp`-Befehl verwenden, um die Datenbank direkt aus dem laufenden Container auf Ihren Host zu extrahieren.

###### Docker oder Podman verwenden: {#using-docker-or-podman}

```bash
# Replace 'duplistatus' with your actual container name if different
docker cp duplistatus:/app/data/backups.db ./duplistatus-backup-$(date +%Y%m%d).db
```

(Wenn Sie Podman verwenden, ersetzen Sie einfach `docker` durch `podman` im obigen Befehl.)

##### Für Windows-Benutzer {#for-windows-users}
Wenn Sie Docker Desktop unter Windows ausführen, haben Sie zwei einfache Möglichkeiten, dies ohne Verwendung der Befehlszeile zu bewältigen:

###### Option A: Docker Desktop verwenden (Am einfachsten) {#option-a-use-docker-desktop-easiest}
1. Öffnen Sie das Docker Desktop Dashboard.
2. Gehen Sie zur Registerkarte Containers und klicken Sie auf Ihren duplistatus Container.
3. Klicken Sie auf die Registerkarte Dateien.
4. Navigieren Sie zu `/app/data/`.
5. Klicken Sie mit der rechten Maustaste auf `backups.db` und wählen Sie **Speichern unter...**, um die Datei in Ihre Windows-Ordner herunterzuladen.

###### Option B: PowerShell verwenden {#option-b-use-powershell}
Wenn Sie das Terminal bevorzugen, können Sie PowerShell verwenden, um die Datei auf Ihren Desktop zu kopieren:

```powershell
docker cp duplistatus:/app/data/backups.db $HOME\Desktop\duplistatus-backup.db
```

##### Wenn Sie Bind Mounts verwenden {#if-you-use-bind-mounts}
Wenn Sie Ihren Container ursprünglich mit einem Bind Mount eingerichtet haben (z. B. haben Sie einen lokalen Ordner wie `/opt/duplistatus` dem Container zugeordnet), benötigen Sie überhaupt keine Docker-Befehle. Kopieren Sie die Datei einfach mit Ihrem Dateimanager:
- Linux: `cp /path/to/your/folder/backups.db ~/backups.db`
- Windows: Kopieren Sie die Datei einfach im **Datei-Explorer** aus dem Ordner, den Sie während der Einrichtung festgelegt haben.

#### Wiederherstellen Ihrer Daten {#restoring-your-data}
Wenn Sie Ihre Datenbank aus einer vorherigen Sicherung wiederherstellen müssen, führen Sie die folgenden Schritte basierend auf Ihrem Betriebssystem aus.

:::info[WICHTIG] 
Stoppen Sie den Container vor der Wiederherstellung der Datenbank, um Dateikorruption zu verhindern.
:::

##### Für Linux-Benutzer {#for-linux-users}
Die einfachste Möglichkeit zur Wiederherstellung besteht darin, die Sicherungsdatei in den internen Speicherplatz des Containers "zurückzuspielen".

###### Docker oder Podman verwenden: {#using-docker-or-podman}

```bash
# stop the container
docker stop duplistatus

# Replace 'duplistatus-backup.db' with your actual backup filename
docker cp ./duplistatus-backup.db duplistatus:/app/data/backups.db

# Restart the container
docker start duplistatus
```

##### Für Windows-Benutzer {#for-windows-users}
Wenn Sie Docker Desktop verwenden, können Sie die Wiederherstellung über die GUI oder PowerShell durchführen.

###### Option A: Docker Desktop (GUI) verwenden {#option-a-use-docker-desktop-gui}
1. Stellen Sie sicher, dass der duplistatus-Container aktiv ist (Docker Desktop erfordert, dass der Container aktiv ist, um Dateien über die GUI hochzuladen).
2. Gehen Sie zur Registerkarte „Dateien" in Ihren Container-Einstellungen.
3. Navigieren Sie zu `/app/data/`.
4. Klicken Sie mit der rechten Maustaste auf die vorhandene backups.db und wählen Sie „Löschen".
5. Klicken Sie auf die Schaltfläche „Importieren" (oder klicken Sie mit der rechten Maustaste in den Ordnerbereich) und wählen Sie Ihre Sicherungsdatei von Ihrem Computer aus.

Benennen Sie die importierte Datei in genau backups.db um, wenn sie einen Zeitstempel im Namen hat.

Starten Sie den Container neu.

###### Option B: PowerShell verwenden {#option-b-use-powershell}

```powershell
# Copy the file from your Desktop back into the container
docker cp $HOME\Desktop\duplistatus-backup.db duplistatus:/app/data/backups.db

# Restart the container
docker start duplistatus
```

##### Wenn Sie Bind Mounts verwenden {#if-you-use-bind-mounts}
Wenn Sie einen lokalen Ordner dem Container zuordnen, benötigen Sie keine speziellen Befehle.

1. Stoppen Sie den Container.
2. Kopieren Sie Ihre Sicherungsdatei manuell in Ihren zugeordneten Ordner (z. B. `/opt/duplistatus` oder `C:\duplistatus_data`).
3. Stellen Sie sicher, dass die Datei genau `backups.db` benannt ist.
4. Starten Sie den Container.

```bash
docker logs <container-name>
```

:::note
Wenn Sie die Datenbank manuell wiederherstellen, können Berechtigungsfehler auftreten. 

Prüfen Sie die Container-Protokolle und passen Sie die Berechtigungen bei Bedarf an. Weitere Informationen finden Sie im Abschnitt [Troubleshooting](#troubleshooting-your-restore--rollback) weiter unten.
::: 

## Automatischer Migrationsprozess {#automatic-migration-process}

Wenn Sie eine neue Version starten, werden Migrationen automatisch ausgeführt:

1. **Sicherungserstellung**: Eine mit Zeitstempel versehene Sicherung wird in Ihrem Datenverzeichnis erstellt
2. **Schema-Update**: Datenbanktabellen und Felder werden nach Bedarf aktualisiert
3. **Datenmigration**: Alle vorhandenen Daten werden beibehalten und migriert
4. **Verifizierung**: Der Migrationserfolg wird protokolliert

### Überwachung der Migration {#monitoring-migration}

Prüfen Sie Docker-Protokolle, um den Migrationsverlauf zu überwachen:


Suchen Sie nach Nachrichten wie:
- `"Found X pending migrations"`
- `"Running consolidated migration X.0..."`
- `"Migration X.0 completed successfully"`
- `"Database backup created: /path/to/backups-copy-YYYY-MM-DDTHH-MM-SS.db"`
- `"All migrations completed successfully"`

## Versionsspezifische Migrationshinweise {#version-specific-migration-notes}

### Upgrade auf Version 0.9.x oder höher (Schema v4.0) {#upgrading-to-version-09x-or-later-schema-v40}

:::warning
**Authentifizierung ist jetzt erforderlich.** Alle Benutzer müssen sich nach dem Upgrade anmelden.
:::

#### Was ändert sich automatisch {#what-changes-automatically}

- Datenbankschema wird von v3.1 zu v4.0 migriert
- Neue Tabellen erstellt: `users`, `sessions`, `audit_log`
- Standard-Admin-Konto wird automatisch erstellt
- Alle vorhandenen Sitzungen ungültig gemacht

#### Was Sie tun müssen {#what-you-must-do}

1. **Anmelden** mit Standard-Admin-Anmeldedaten:
   - Benutzername: `admin`
   - Passwort: `Duplistatus09`
2. **Passwort ändern** wenn dazu aufgefordert (erforderlich beim ersten Anmelden)
3. **Benutzerkonten erstellen** für andere Benutzer (Einstellungen → Benutzer)
4. **Externe API-Integrationen aktualisieren** um Authentifizierung einzubeziehen (siehe [API Breaking Changes](api-changes.md))
5. **Audit-Log-Aufbewahrung konfigurieren** falls erforderlich (Einstellungen → Audit-Log)

#### Wenn Sie gesperrt sind {#if-youre-locked-out}

Verwenden Sie das Admin-Wiederherstellungstool:

```bash
docker exec -it duplistatus /app/admin-recovery admin NewPassword123
```

Weitere Informationen finden Sie im [Admin Recovery Guide](../user-guide/admin-recovery.md).

### Upgrade auf Version 0.8.x {#upgrading-to-version-08x}

#### Was ändert sich automatisch {#what-changes-automatically}

- Datenbankschema auf v3.1 aktualisiert
- Hauptschlüssel für Verschlüsselung generiert (gespeichert in `.duplistatus.key`)
- Sitzungen ungültig gemacht (neue CSRF-geschützte Sitzungen erstellt)
- Passwörter mit neuem System verschlüsselt

#### Was Sie tun müssen {#what-you-must-do}

1. **Benachrichtigungsvorlagen aktualisieren**, falls Sie diese angepasst haben:
   - Ersetzen Sie `{backup_interval_value}` und `{backup_interval_type}` durch `{backup_interval}`
   - Standard-Vorlagen werden automatisch aktualisiert

#### Sicherheitshinweise {#security-notes}

- Stellen Sie sicher, dass die Datei `.duplistatus.key` gesichert ist (hat 0400-Berechtigungen)
- Sitzungen verfallen nach 24 Stunden

### Upgrade auf Version 0.7.x {#upgrading-to-version-07x}

#### Was ändert sich automatisch {#what-changes-automatically}

- `machines` Tabelle in `servers` umbenannt
- `machine_id` Felder in `server_id` umbenannt
- Neue Felder hinzugefügt: `alias`, `notes`, `created_at`, `updated_at`

#### Was Sie tun müssen {#what-you-must-do}

1. **Externe API-Integrationen aktualisieren**:
   - `totalMachines` → `totalServers` in `/api/summary` ändern
   - `machine` → `server` in API-Antwortobjekten ändern
   - `backup_types_count` → `backup_jobs_count` in `/api/lastbackups/{serverId}` ändern
   - Endpunkt-Pfade von `/api/machines/...` zu `/api/servers/...` aktualisieren
2. **Benachrichtigungsvorlagen aktualisieren**:
   - `{machine_name}` durch `{server_name}` ersetzen

Siehe [API Breaking Changes](api-changes.md) für detaillierte Schritte zur API-Migration.

## Checkliste nach der Migration {#post-migration-checklist}

Nach dem Upgrade bestätigen:

- [ ] Alle Server werden korrekt im Dashboard angezeigt
- [ ] Sicherungsverlauf ist vollständig und zugänglich
- [ ] Benachrichtigungen funktionieren (NTFY/E-Mail testen)
- [ ] Externe API-Integrationen funktionieren (falls zutreffend)
- [ ] Einstellungen sind zugänglich und korrekt
- [ ] Überwachung überfälliger Sicherungen funktioniert korrekt
- [ ] Erfolgreich angemeldet (0.9.x+)
- [ ] Standard-Admin-Passwort geändert (0.9.x+)
- [ ] Benutzerkonten für andere Benutzer erstellt (0.9.x+)
- [ ] Externe API-Integrationen mit Authentifizierung aktualisiert (0.9.x+)

## Fehlerbehebung {#troubleshooting}

### Migration schlägt fehl {#migration-fails}

1. Prüfen Sie den Speicherplatz (Sicherung erfordert Speicherplatz)
2. Bestätigen Sie Schreibberechtigungen im Datenverzeichnis
3. Überprüfen Sie Container-Protokolle auf spezifische Fehler
4. Stellen Sie bei Bedarf aus einer Sicherung wieder her (siehe Rollback unten)

### Daten fehlen nach der Migration {#data-missing-after-migration}

1. Bestätigen Sie, dass die Sicherung erstellt wurde (Datenverzeichnis prüfen)
2. Überprüfen Sie die Container-Protokolle auf Nachrichten zur Sicherungserstellung
3. Prüfen Sie die Integrität der Datenbankdatei

### Authentifizierungsprobleme (0.9.x+) {#authentication-issues-09x}

1. Bestätigen Sie, dass das Standard-Admin-Konto vorhanden ist (Protokolle prüfen)
2. Versuchen Sie Standard-Anmeldedaten: `admin` / `Duplistatus09`
3. Verwenden Sie das Admin-Wiederherstellungstool, wenn gesperrt
4. Bestätigen Sie, dass die Tabelle `users` in der Datenbank vorhanden ist

### API-Fehler {#api-errors}

1. Überprüfen Sie [API Breaking Changes](api-changes.md) auf Endpunkt-Updates
2. Aktualisieren Sie externe Integrationen mit neuen Feldnamen
3. Hinzufügen von Authentifizierung zu API-Anfragen (0.9.x+)
4. Testen Sie API-Endpunkte nach der Migration

### Probleme mit Master Key (0.8.x+) {#master-key-issues-08x}

1. Stellen Sie sicher, dass die Datei `.duplistatus.key` zugänglich ist
2. Bestätigen Sie, dass die Dateiberechtigungen 0400 sind
3. Prüfen Sie die Container-Protokolle auf Fehler bei der Schlüsselerzeugung

### Podman-DNS-Konfiguration {#podman-dns-configuration}

Wenn Sie Podman verwenden und nach einem Upgrade Probleme mit der Netzwerkkonnektivität haben, müssen Sie möglicherweise die DNS-Einstellungen für Ihren Container konfigurieren. Weitere Informationen finden Sie im [Abschnitt zur DNS-Konfiguration](../installation/installation.md#configuring-dns-for-podman-containers) des Installationshandbuchs.

## Rollback-Verfahren {#rollback-procedure}

Wenn Sie zu einer vorherigen Version zurückwechseln müssen:

1. **Container stoppen**: `docker stop <container-name>` (oder `podman stop <container-name>`)
2. **Ihre Sicherung suchen**: 
   - Wenn Sie eine Sicherung über die Weboberfläche erstellt haben (Version 1.2.1+), verwenden Sie diese heruntergeladene Sicherungsdatei
   - Wenn Sie eine manuelle Volume-Sicherung erstellt haben, extrahieren Sie diese zunächst
   - Automatische Migrationssicherungen befinden sich im Datenverzeichnis (mit Zeitstempel versehene `.db`-Dateien)
3. **Datenbank wiederherstellen**: 
   - **Für Sicherungen der Weboberfläche (Version 1.2.1+)**: Verwenden Sie die Wiederherstellungsfunktion in `Einstellungen → Datenbankwartung` (siehe [Datenbankwartung](../user-guide/settings/database-maintenance.md#database-restore))
   - **Für manuelle Sicherungen**: Ersetzen Sie `backups.db` in Ihrem Datenverzeichnis/Volume mit der Sicherungsdatei
4. **Vorherige Image-Version verwenden**: Rufen Sie das vorherige Container-Image ab und führen Sie es aus
5. **Container starten**: Starten Sie mit der vorherigen Version

:::warning
Das Zurückrollen kann zu Datenverlust führen, wenn das neuere Schema mit der älteren Version nicht kompatibel ist. Stellen Sie immer sicher, dass Sie eine aktuelle Sicherung haben, bevor Sie versuchen, ein Zurückrollen durchzuführen.
:::

### Fehlerbehebung bei Ihrer Wiederherstellung / Rollback {#troubleshooting-your-restore--rollback}

Wenn die Anwendung nicht startet oder Ihre Daten nach einer Wiederherstellung oder einem Rollback nicht angezeigt werden, prüfen Sie die folgenden häufigen Probleme:

#### 1. Dateiberechtigungen (Linux/Podman) {#1-database-file-permissions-linuxpodman}

Wenn Sie die Datei als `root`-Benutzer wiederhergestellt haben, hat die Anwendung im Container möglicherweise keine Berechtigung, sie zu lesen oder zu schreiben.

* **Das Symptom:** Protokolle zeigen "Permission Denied" oder "Read-only database" ein.
* **Die Lösung:** Setzen Sie die Berechtigungen von der Datei im Container zurück, um sicherzustellen, dass sie zugänglich ist.

```bash
# Set ownership (usually UID 1000 or the app user)
docker exec -u 0 duplistatus chown 1000:1000 /app/data/backups.db
# Set read/write permissions
docker exec -u 0 duplistatus chmod 664 /app/data/backups.db
```

#### 2. Falscher Dateiname {#2-incorrect-filename}

Die Anwendung sucht speziell nach einer Datei mit dem Namen `backups.db`.

* **Das Symptom:** Die Anwendung startet, sieht aber „leer" aus (wie eine Neuinstallation).
* **Die Lösung:** Prüfen Sie das Verzeichnis `/app/data/`. Wenn Ihre Datei `duplistatus-backup-2024.db` heißt oder die Erweiterung `.sqlite` hat, wird die App sie ignorieren. Verwenden Sie den Befehl `mv` oder die Docker Desktop GUI, um sie exakt in `backups.db` umzubenennen.

#### 3. Container nicht neu gestartet {#3-container-not-restarted}

Auf einigen Systemen kann die Verwendung von `docker cp` während der Ausführung des Containers die Verbindung der Anwendung zur Datenbank möglicherweise nicht sofort "aktualisieren".

* **Die Lösung:** Führen Sie nach einer Wiederherstellung immer einen vollständigen Neustart durch:

```bash
docker restart duplistatus
```

#### 4. Datenbankversion-Nichtübereinstimmung {#4-database-version-mismatch}

Wenn Sie eine Sicherung aus einer viel neueren Version von duplistatus in einer älteren Version der App wiederherstellen, könnte das Datenbankschema inkompatibel sein.

* **Die Lösung:** Stellen Sie immer sicher, dass Sie die gleiche (oder eine neuere) Version des duplistatus-Images ausführen wie diejenige, die die Sicherung erstellt hat. Prüfen Sie Ihre Version mit:

```bash
docker inspect duplistatus --format '{{.Config.Image}}'
```

## Datenbankschema-Versionen {#database-schema-versions}

| Anwendungsversion         | Schema-Version | Wichtigste Änderungen                                        |
|----------------------------|----------------|----------------------------------------------------|
| 0.6.x und früher          | v1.0           | Initiales Schema                                     |
| 0.7.x                      | v2.0, v3.0     | Konfigurationen hinzugefügt, machines → Server umbenannt   |
| 0.8.x                      | v3.1           | Erweiterte Sicherungsfelder, Verschlüsselungsunterstützung         |
| 0.9.x, 1.0.x, 1.1.x, 1.2.x, 1.3.x | v4.0           | Benutzerzugriffskontrolle, Authentifizierung, Audit-Protokollierung |

## Hilfe {#getting-help}

- **Dokumentation**: [Benutzerhandbuch](../user-guide/overview.md)
- **API-Referenz**: [API-Dokumentation](../api-reference/overview.md)
- **API-Änderungen**: [API Breaking Changes](api-changes.md)
- **Versionshinweise**: Prüfen Sie versionsspezifische Versionshinweise für detaillierte Änderungen
- **Community**: [GitHub Discussions](https://github.com/wsj-br/duplistatus/discussions)
- **Probleme**: [GitHub Issues](https://github.com/wsj-br/duplistatus/issues)
