---
translation_last_updated: '2026-05-11T14:27:43.592Z'
source_file_mtime: '2026-05-06T23:18:51.410Z'
source_file_hash: 5e64fe25444d347417eef7f5a5c28139a4130cae452f2e3ac9ea593ea31bb608
translation_language: de
source_file_path: documentation/docs/migration/version_upgrade.md
translation_models:
  - anthropic/claude-haiku-4.5
  - qwen/qwen3-235b-a22b-2507
---
# Migrationsleitfaden {#migration-guide}

Diese Anleitung erklärt, wie Sie zwischen Versionen von duplistatus aktualisieren. Migrationen erfolgen automatisch – das Datenbankschema aktualisiert sich beim Start einer neuen Version selbst.

Manuelle Schritte sind nur erforderlich, wenn Sie Benachrichtigungsvorlagen angepasst haben (in Version 0.8.x wurden Vorlagenvariablen geändert) oder externe API-Integrationen aktualisiert werden müssen (in Version 0.7.x wurden API-Feldnamen geändert, in Version 0.9.x ist eine Authentifizierung erforderlich).

## Übersicht {#overview}

duplistatus migriert Ihr Datenbankschema beim Upgrade automatisch. Das System:

1. Erstellt vor Änderungen ein Backup der Datenbank
2. Aktualisiert das Datenbankschema auf die neueste Version
3. Behält alle bestehenden Daten bei (Server, Backups, Konfiguration)
4. Überprüft, ob die Migration erfolgreich abgeschlossen wurde

## Sicherung Ihrer Datenbank vor der Migration {#backing-up-your-database-before-migration}

Bevor Sie auf eine neue Version aktualisieren, sollten Sie ein Backup Ihrer Datenbank erstellen. So können Sie Ihre Daten wiederherstellen, falls während des Migrationsprozesses etwas schiefgeht.

### Wenn Sie Version 1.2.1 oder später ausführen {#if-youre-running-version-121-or-later}

Verwenden Sie die integrierte Datenbank-Backup-Funktion:

1. Navigieren Sie in der Weboberfläche zu [Einstellungen → Datenbankwartung](../user-guide/settings/database-maintenance.md)
2. Wählen Sie im Abschnitt **Datenbank-Backup** ein Backup-Format aus:
   - **Datenbankdatei (.db)**: Binäres Format – schnellstes Backup, behält exakt die gesamte Datenbankstruktur bei
   - **SQL-Dump (.sql)**: Textformat – menschenlesbare SQL-Anweisungen
3. Klicken Sie auf **Backup herunterladen**
4. Die Backup-Datei wird mit einem zeitgestempelten Dateinamen auf Ihren Computer heruntergeladen

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

###### Option A: Docker Desktop verwenden (am einfachsten) {#option-a-use-docker-desktop-easiest}
1. Öffnen Sie das Docker Desktop-Dashboard.
2. Wechseln Sie zum Reiter Container und klicken Sie auf Ihren duplistatus-Container.
3. Klicken Sie auf den Reiter Dateien.
4. Navigieren Sie zu `/app/data/`.
5. Klicken Sie mit der rechten Maustaste auf `backups.db` und wählen Sie **Speichern unter...**, um die Datei in Ihren Windows-Ordnern zu speichern.

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

:::info[IMPORTANT]
Stoppen Sie den Container, bevor Sie die Datenbank wiederherstellen, um Dateibeschädigungen zu vermeiden.
:::

##### Für Linux-Benutzer {#for-linux-users-1}
Die einfachste Methode zur Wiederherstellung besteht darin, die Sicherungsdatei in den internen Speicherpfad des Containers zu „übertragen“.

###### Mit Docker oder Podman: {#using-docker-or-podman-1}

```bash
# stop the container
docker stop duplistatus

# Replace 'duplistatus-backup.db' with your actual backup filename
docker cp ./duplistatus-backup.db duplistatus:/app/data/backups.db

# Restart the container
docker start duplistatus
```

##### Für Windows-Benutzer {#for-windows-users-1}
Wenn Sie Docker Desktop verwenden, können Sie die Wiederherstellung über die grafische Oberfläche (GUI) oder PowerShell durchführen.

###### Option A: Docker Desktop (GUI) verwenden {#option-a-use-docker-desktop-gui}
1. Stellen Sie sicher, dass der duplistatus-Container ausgeführt wird (Docker Desktop erfordert, dass der Container aktiv ist, um Dateien über die GUI hochzuladen).
2. Wechseln Sie zum Reiter Dateien in den Einstellungen Ihres Containers.
3. Navigieren Sie zu `/app/data/`.
4. Klicken Sie mit der rechten Maustaste auf die vorhandene Datei backups.db und wählen Sie Löschen.
5. Klicken Sie auf die Schaltfläche Importieren (oder klicken Sie mit der rechten Maustaste im Ordnerbereich) und wählen Sie Ihre Sicherungsdatei von Ihrem Computer aus.

Benennen Sie die importierte Datei in genau backups.db um, falls sie einen Zeitstempel im Namen enthält.

Starten Sie den Container neu.

###### Option B: PowerShell verwenden {#option-b-use-powershell-1}

```powershell
# Copy the file from your Desktop back into the container
docker cp $HOME\Desktop\duplistatus-backup.db duplistatus:/app/data/backups.db

# Restart the container
docker start duplistatus
```

##### Wenn Sie Bind-Mounts verwenden {#if-you-use-bind-mounts-1}
Wenn Sie einen lokalen Ordner verwenden, der an den Container angebunden ist, benötigen Sie keine speziellen Befehle.

1. Stoppen Sie den Container.
2. Kopieren Sie Ihre Sicherungsdatei manuell in Ihren verknüpften Ordner (z. B. `/opt/duplistatus` oder `C:\duplistatus_data`).
3. Stellen Sie sicher, dass die Datei exakt den Namen `backups.db` trägt.
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

- Datenbankschema wird von v3.1 auf v4.0 migriert
- Neue Tabellen werden erstellt: `users`, `sessions`, `audit_log`
- Standard-Administratorkonto wird automatisch erstellt
- Alle vorhandenen Sitzungen werden ungültig

#### Was Sie tun müssen {#what-you-must-do}

1. **Anmelden** mit Standard-Administrator-Anmeldeinformationen:
   - Benutzername: `admin`
   - Passwort: `Duplistatus09`
2. **Passwort ändern**, wenn dazu aufgefordert (erforderlich beim ersten Anmelden)
3. **Benutzerkonten erstellen** für andere Benutzer (Einstellungen → Benutzer)
4. **Externe API-Integrationen aktualisieren**, um Authentifizierung einzubeziehen (siehe [Nicht abwärtskompatible API-Änderungen](api-changes.md))
5. **Audit-Protokoll-Beibehaltung konfigurieren**, falls erforderlich (Einstellungen → Audit-Log)

#### Wenn Sie gesperrt sind {#if-youre-locked-out}

Verwenden Sie das Administrator-Wiederherstellungstool:

```bash
docker exec -it duplistatus /app/admin-recovery admin NewPassword123
```

Weitere Details finden Sie im [Administrator-Wiederherstellungsleitfaden](../user-guide/admin-recovery.md).

### Upgrade auf Version 0.8.x {#upgrading-to-version-08x}

#### Was sich automatisch ändert {#what-changes-automatically-1}

- Datenbankschema auf v3.1 aktualisiert
- Hauptschlüssel für Verschlüsselung generiert (gespeichert in `.duplistatus.key`)
- Sitzungen ungültig gemacht (neue CSRF-geschützte Sitzungen erstellt)
- Passwörter mit neuem System verschlüsselt

#### Was Sie selbst vornehmen müssen {#what-you-must-do-1}

1. **Benachrichtigungsvorlagen aktualisieren**, falls Sie diese angepasst haben:
   - Ersetzen Sie `{backup_interval_value}` und `{backup_interval_type}` durch `{backup_interval}`
   - Standardvorlagen werden automatisch aktualisiert

#### Sicherheitshinweise {#security-notes}

- Stellen Sie sicher, dass die Datei `.duplistatus.key` gesichert ist (hat Berechtigungen 0400)
- Sitzungen laufen nach 24 Stunden ab

### Upgrade auf Version 0.7.x {#upgrading-to-version-07x}

#### Was sich automatisch ändert {#what-changes-automatically-2}

- Tabelle `machines` wurde umbenannt in `servers`
- Felder `machine_id` wurden umbenannt in `server_id`
- Neue Felder hinzugefügt: `alias`, `notes`, `created_at`, `updated_at`

#### Was Sie selbst vornehmen müssen {#what-you-must-do-2}

1. **Externe API-Integrationen aktualisieren**:
   - Ändern Sie `totalMachines` → `totalServers` in `/api/summary`
   - Ändern Sie `machine` → `server` in API-Antwortobjekten
   - Ändern Sie `backup_types_count` → `backup_jobs_count` in `/api/lastbackups/{serverId}`
   - Aktualisieren Sie die Endpunktpfade von `/api/machines/...` zu `/api/servers/...`
2. **Benachrichtigungsvorlagen aktualisieren**:
   - Ersetzen Sie `{machine_name}` durch `{server_name}`

Detaillierte Anweisungen zur API-Migration finden Sie unter [Nicht abwärtskompatible API-Änderungen](api-changes.md).

## Checkliste nach der Migration {#post-migration-checklist}

Nach dem Upgrade überprüfen:

- [ ] Alle Server werden korrekt im Dashboard angezeigt
- [ ] Der Sicherungsverlauf ist vollständig und zugänglich
- [ ] Benachrichtigungen funktionieren (NTFY/E-Mail testen)
- [ ] Externe API-Integrationen funktionieren (falls zutreffend)
- [ ] Einstellungen sind zugänglich und korrekt
- [ ] Die Backup-Überwachung funktioniert ordnungsgemäß
- [ ] Erfolgreich angemeldet (0.9.x+)
- [ ] Standard-Administratorpasswort geändert (0.9.x+)
- [ ] Benutzerkonten für andere Benutzer erstellt (0.9.x+)
- [ ] Externe API-Integrationen mit Authentifizierung aktualisiert (0.9.x+)

## Fehlerbehebung {#troubleshooting}

### Migration schlägt fehl {#migration-fails}

1. Prüfen Sie den verfügbaren Speicherplatz (für die Sicherung wird Platz benötigt)
2. Schreibrechte im Datenverzeichnis überprüfen
3. Container-Logs auf spezifische Fehler prüfen
4. Bei Bedarf aus der Sicherung wiederherstellen (siehe Rollback unten)

### Daten fehlen nach der Migration {#data-missing-after-migration}

1. Überprüfen Sie, ob eine Sicherung erstellt wurde (Datenverzeichnis prüfen)
2. Container-Logs auf Meldungen zur Sicherungserstellung prüfen
3. Integrität der Datenbankdatei prüfen

### Authentifizierungsprobleme (0.9.x+) {#authentication-issues-09x}

1. Überprüfen Sie, ob der Standard-Administratoraccount existiert (Logs prüfen)
2. Standardanmeldedaten versuchen: `admin` / `Duplistatus09`
3. Administratoren-Wiederherstellungstool verwenden, falls Zugang gesperrt ist
4. Überprüfen Sie, ob die Tabelle `users` in der Datenbank existiert

### API-Fehler {#api-errors}

1. [Nicht abwärtskompatible API-Änderungen](api-changes.md) auf Aktualisierungen der Endpunkte prüfen
2. Externe Integrationen mit neuen Feldnamen aktualisieren
3. Authentifizierung zu API-Anfragen hinzufügen (0.9.x+)
4. API-Endpunkte nach der Migration testen

### Probleme mit Master Key (0.8.x+) {#master-key-issues-08x}

1. Stellen Sie sicher, dass die Datei `.duplistatus.key` zugänglich ist
2. Überprüfen Sie, ob die Dateiberechtigungen auf 0400 gesetzt sind
3. Container-Logs auf Fehler bei der Schlüsselerzeugung prüfen

### Podman-DNS-Konfiguration {#podman-dns-configuration}

Wenn Sie Podman verwenden und nach einem Upgrade Probleme mit der Netzwerkkonnektivität haben, müssen Sie möglicherweise die DNS-Einstellungen für Ihren Container konfigurieren. Weitere Informationen finden Sie im [Abschnitt zur DNS-Konfiguration](../installation/installation.md#configuring-dns-for-podman-containers) des Installationshandbuchs.

## Rollback-Verfahren {#rollback-procedure}

Wenn Sie zu einer früheren Version zurückkehren müssen:

1. **Container stoppen**: `docker stop <container-name>` (oder `podman stop <container-name>`)
2. **Sicherung suchen**:
   - Wenn Sie eine Sicherung über die Weboberfläche erstellt haben (ab Version 1.2.1+), verwenden Sie diese heruntergeladene Sicherungsdatei
   - Wenn Sie eine manuelle Volume-Sicherung erstellt haben, extrahieren Sie diese zuerst
   - Automatische Migrations-Backups befinden sich im Datenverzeichnis (zeitgestempelte `.db`-Dateien)
3. **Stellen Sie die Datenbank wieder her**: 
   - **Für Backups über die Weboberfläche (Version 1.2.1+)**: Verwenden Sie die Wiederherstellungsfunktion in `Settings → Database Maintenance` (siehe [Datenbankwartung](../user-guide/settings/database-maintenance.md#database-restore))
   - **Für manuelle Backups**: Ersetzen Sie `backups.db` in Ihrem Datenverzeichnis/Volume durch die Backup-Datei
4. **Verwenden Sie die vorherige Image-Version**: Ziehen und führen Sie das vorherige Container-Image aus
5. **Starten Sie den Container**: Starten Sie mit der vorherigen Version

:::warning
Ein Zurücksetzen kann zu Datenverlust führen, wenn das neuere Schema mit der älteren Version nicht kompatibel ist. Stellen Sie immer sicher, dass Sie ein aktuelles Backup haben, bevor Sie ein Zurücksetzen versuchen.
:::

### Fehlerbehebung bei Ihrer Wiederherstellung / Rollback {#troubleshooting-your-restore--rollback}

Wenn die Anwendung nach einer Wiederherstellung oder einem Zurücksetzen nicht startet oder Ihre Daten nicht angezeigt werden, überprüfen Sie die folgenden häufigen Probleme:

#### 1. Dateiberechtigungen (Linux/Podman) {#1-database-file-permissions-linuxpodman}

Wenn Sie die Datei als `root`-Benutzer wiederhergestellt haben, könnte die Anwendung im Container keine Berechtigung zum Lesen oder Schreiben haben.

* **Das Symptom:** Die Logs zeigen „Zugriff verweigert“ oder „Datenbank schreibgeschützt.“
* **Die Lösung:** Setzen Sie die Berechtigungen der Datei im Container zurück, um sicherzustellen, dass darauf zugegriffen werden kann.

```bash
# Set ownership (usually UID 1000 or the app user)
docker exec -u 0 duplistatus chown 1000:1000 /app/data/backups.db
# Set read/write permissions
docker exec -u 0 duplistatus chmod 664 /app/data/backups.db
```

#### 2. Falscher Dateiname {#2-incorrect-filename}

Die Anwendung sucht gezielt nach einer Datei mit dem Namen `backups.db`.

* **Das Symptom:** Die Anwendung startet, scheint aber „leer“ (wie eine Neuinstallation).
* **Die Lösung:** Überprüfen Sie das `/app/data/`-Verzeichnis. Wenn Ihre Datei `duplistatus-backup-2024.db` heißt oder die Erweiterung `.sqlite` hat, ignoriert die App sie. Verwenden Sie den Befehl `mv` oder die Docker Desktop-GUI, um sie exakt in `backups.db` umzubenennen.

#### 3. Container nicht neu gestartet {#3-container-not-restarted}

Auf einigen Systemen führt die Verwendung von `docker cp`, während der Container läuft, möglicherweise nicht zu einer sofortigen „Aktualisierung“ der Verbindung der Anwendung zur Datenbank.

* **Die Lösung:** Führen Sie nach einer Wiederherstellung immer einen vollständigen Neustart durch:

```bash
docker restart duplistatus
```

#### 4. Datenbankversion-Nichtübereinstimmung {#4-database-version-mismatch}

Wenn Sie ein Backup einer viel neueren Version von duplistatus in eine ältere Version der Anwendung einspielen, könnte das Datenbankschema inkompatibel sein.

* **Die Lösung:** Stellen Sie sicher, dass Sie die gleiche (oder eine neuere) Version des duplistatus-Images verwenden wie diejenige, die das Backup erstellt hat. Prüfen Sie Ihre Version mit:

```bash
docker inspect duplistatus --format '{{.Config.Image}}'
```

## Datenbankschema-Versionen {#database-schema-versions}

| Anwendungsversion        | Schema-Version | Wichtige Änderungen                                        |
|----------------------------|----------------|----------------------------------------------------|
| 0.6.x und früher          | v1.0           | Erstes Schema                                     |
| 0.7.x                      | v2.0, v3.0     | Hinzugefügte Konfigurationen, umbenannte Maschinen → Server   |
| 0.8.x                      | v3.1           | Erweiterte Sicherungsfelder, Unterstützung für Verschlüsselung         |
| 0.9.x, 1.0.x, 1.1.x, 1.2.x, 1.3.x | v4.0           | Benutzer-Zugriffskontrolle, Authentifizierung, Audit-Protokollierung |

## Hilfe {#getting-help}

- **Dokumentation**: [Benutzerhandbuch](../user-guide/overview.md)
- **API-Referenz**: [API-Dokumentation](../api-reference/overview.md)
- **API-Änderungen**: [Nicht abwärtskompatible API-Änderungen](api-changes.md)
- **Versionshinweise**: Überprüfen Sie die versionsbezogenen Release Notes für detaillierte Änderungen
- **Community**: [GitHub-Diskussionen](https://github.com/wsj-br/duplistatus/discussions)
- **Probleme melden**: [GitHub Issues](https://github.com/wsj-br/duplistatus/issues)
