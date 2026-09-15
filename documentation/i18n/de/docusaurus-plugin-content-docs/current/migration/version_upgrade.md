# Migrationsanleitung {/* #migration-guide */}

Diese Anleitung erklärt, wie Sie zwischen den Versionen von duplistatus aktualisieren. Migrations sind automatisch — das Datenbankschema wird selbst aktualisiert, wenn Sie eine neue Version starten.

Manuelle Schritte sind nur erforderlich, wenn Sie benutzerdefinierte Benachrichtigungsvorlagen (Version 0.8.x änderte die Vorlagenvariablen) oder externe API-Integrationen aktualisieren müssen (Version 0.7.x änderte die API-Feldnamen, Version 0.9.x erfordert Authentifizierung).

## Übersicht {/* #overview */}

duplistatus migriert Ihr Datenbankschema automatisch bei einem Upgrade. Das System:

1. Erstellt eine Sicherung Ihrer Datenbank, bevor Änderungen vorgenommen werden
2. Aktualisiert das Datenbankschema auf die neueste Version
3. Behält alle vorhandenen Daten (Server, Sicherungen, Konfigurationen) bei
4. Überprüft, ob die Migration erfolgreich abgeschlossen wurde

## Sichern Ihrer Datenbank vor der Migration {/* #backing-up-your-database-before-migration */}

Bevor Sie auf eine neue Version aktualisieren, wird empfohlen, eine Sicherung Ihrer Datenbank zu erstellen. Dies stellt sicher, dass Sie Ihre Daten wiederherstellen können, falls etwas schiefgeht während des Migrationsprozesses.

### Wenn Sie Version 1.2.1 oder später ausführen {/* #if-youre-running-version-121-or-later */}

Verwenden Sie die integrierte Datenbanksicherungsfunktion:

1. Navigieren Sie zu [Einstellungen → Datenbankverwaltung](../user-guide/settings/database-maintenance.md) in der Weboberfläche
2. Wählen Sie im Abschnitt **Datenbanksicherung** ein Sicherungsformat aus:
   - **Datenbankdatei (.db)**: Binärformat - schnellste Sicherung, beibehält die gesamte Datenbankstruktur genau
   - **SQL-Dump (.sql)**: Textformat - menschenlesbare SQL-Anweisungen
3. Klicken Sie auf **Sicherung herunterladen**
4. Die Sicherungsdatei wird auf Ihren Computer mit einem Zeitstempel im Dateinamen heruntergeladen

Für weitere Details siehe die [Datenbankverwaltung](../user-guide/settings/database-maintenance.md#database-backup) Dokumentation.

### Wenn Sie eine Version vor 1.2.1 ausführen {/* #if-youre-running-a-version-before-121 */}

#### Sicherung {/* #backup */}

Sie müssen die Datenbank manuell sichern, bevor Sie fortfahren. Die Datenbankdatei befindet sich unter `/app/data/backups.db` innerhalb des Containers.

##### Für Linux-Benutzer {/* #for-linux-users */}
Wenn Sie auf Linux sind, machen Sie sich keine Sorgen, zusätzliche Hilfscontainer zu starten. Sie können den nativen `cp` Befehl verwenden, um die Datenbank direkt aus dem laufenden Container auf Ihren Host zu extrahieren.

###### Mit Docker oder Podman: {/* #using-docker-or-podman */}

```bash
# Replace 'duplistatus' with your actual container name if different
docker cp duplistatus:/app/data/backups.db ./duplistatus-backup-$(date +%Y%m%d).db
```

(Wenn Sie Podman verwenden, ersetzen Sie einfach `docker` durch `podman` im obigen Befehl.)

##### Für Windows-Benutzer {/* #for-windows-users */}
Wenn Sie Docker Desktop unter Windows ausführen, haben Sie zwei einfache Möglichkeiten, dies ohne die Verwendung der Befehlszeile zu erledigen:

###### Option A: Docker Desktop verwenden (Einfachste Methode) {/* #option-a-use-docker-desktop-easiest */}
1. Öffnen Sie das Docker Desktop-Dashboard.
2. Gehen Sie zum Containers-Tab und klicken Sie auf Ihren duplistatus-Container.
3. Klicken Sie auf den Files-Tab.
4. Navigieren Sie zu `/app/data/`.
5. Klicken Sie mit der rechten Maustaste auf `backups.db` und wählen Sie **Speichern unter...**, um es in Ihre Windows-Ordner herunterzuladen.

###### Option B: Verwenden Sie PowerShell {/* #option-b-use-powershell */}
Wenn Sie die Eingabeaufforderung bevorzugen, können Sie PowerShell verwenden, um die Datei auf Ihren Desktop zu kopieren:

```powershell
docker cp duplistatus:/app/data/backups.db $HOME\Desktop\duplistatus-backup.db
```

##### Wenn Sie Bind Mounts verwenden {/* #if-you-use-bind-mounts */}
Wenn Sie den Container ursprünglich mit einem Bind Mount eingerichtet haben (z. B. haben Sie einen lokalen Ordner wie `/opt/duplistatus` auf den Container abgebildet), benötigen Sie keine Docker-Befehle. Kopieren Sie einfach die Datei mit Ihrem Dateimanager:
- Linux: `cp /path/to/your/folder/backups.db ~/backups.db`
- Windows: Kopieren Sie die Datei einfach in **Datei-Explorer** aus dem Ordner, den Sie während der Einrichtung angegeben haben.

#### Wiederherstellen Ihrer Daten {/* #restoring-your-data */}
Wenn Sie Ihre Datenbank aus einem vorherigen Backup wiederherstellen müssen, befolgen Sie die folgenden Schritte basierend auf Ihrem Betriebssystem.

:::info[WICHTIG] 
Stoppen Sie den Container vor dem Wiederherstellen der Datenbank, um eine Datei-Korruption zu verhindern.
:::

##### Für Linux-Benutzer {/* #for-linux-users-1 */}
Der einfachste Weg, die Datenbank wiederherzustellen, besteht darin, die Sicherungsdatei zurück in den internen Speicherpfad des Containers zu "schieben".

###### Mit Docker oder Podman: {/* #using-docker-or-podman-1 */}

```bash
# stop the container
docker stop duplistatus

# Replace 'duplistatus-backup.db' with your actual backup filename
docker cp ./duplistatus-backup.db duplistatus:/app/data/backups.db

# Restart the container
docker start duplistatus
```

##### Für Windows-Benutzer {/* #for-windows-users-1 */}
Wenn Sie Docker Desktop verwenden, können Sie die Wiederherstellung über die GUI oder PowerShell durchführen.

###### Option A: Verwenden Sie Docker Desktop (GUI) {/* #option-a-use-docker-desktop-gui */}
1. Stellen Sie sicher, dass der duplistatus-Container läuft (Docker Desktop erfordert, dass der Container aktiv ist, um Dateien über die GUI hochzuladen).
2. Gehen Sie zum Reiter Dateien in den Containereinstellungen.
3. Navigieren Sie zu `/app/data/`.
4. Klicken Sie mit der rechten Maustaste auf die bestehende backups.db und wählen Sie Löschen.
5. Klicken Sie auf die Schaltfläche Importieren (oder klicken Sie mit der rechten Maustaste in den Ordnerbereich) und wählen Sie Ihre Sicherungsdatei von Ihrem Computer aus.

Benennen Sie die importierte Datei genau in backups.db um, wenn sie einen Zeitstempel im Namen hat.

Starten Sie den Container neu.

###### Option B: Verwenden Sie PowerShell {/* #option-b-use-powershell-1 */}

```powershell
# Copy the file from your Desktop back into the container
docker cp $HOME\Desktop\duplistatus-backup.db duplistatus:/app/data/backups.db

# Restart the container
docker start duplistatus
```

##### Wenn Sie Bind Mounts verwenden {/* #if-you-use-bind-mounts-1 */}
Wenn Sie einen lokalen Ordner auf den Container abgebildet haben, benötigen Sie keine speziellen Befehle.

1. Stoppen Sie den Container.
2. Kopieren Sie Ihre Sicherungsdatei manuell in Ihren abgebildeten Ordner (z. B. `/opt/duplistatus` oder `C:\duplistatus_data`).
3. Stellen Sie sicher, dass die Datei genau `backups.db` heißt.
4. Starten Sie den Container.

:::note
Wenn Sie die Datenbank manuell wiederherstellen, können Sie möglicherweise Berechtigungsfehler encounter.

Überprüfen Sie die Container-Protokolle und passen Sie die Berechtigungen bei Bedarf an. Siehe den Abschnitt [Troubleshooting](#troubleshooting-your-restore--rollback) unten für weitere Informationen.
:::

## Automatischer Migrationsprozess {/* #automatic-migration-process */}

Wenn Sie eine neue Version starten, werden die Migrationsvorgänge automatisch ausgeführt:

1. **Sicherungserstellung**: Eine zeitstempelbasierte Sicherung wird in Ihrem Datenverzeichnis erstellt
2. **Schema-Update**: Datenbanktabellen und Felder werden nach Bedarf aktualisiert
3. **Datenmigration**: Alle vorhandenen Daten werden beibehalten und migriert
4. **Überprüfung**: Der Migrationserfolg wird protokolliert

### Überwachen der Migration {/* #monitoring-migration */}

Überwachen Sie die Docker-Protokolle, um den Migrationsfortschritt zu überwachen:

```bash
docker logs <container-name>
```

Suchen Sie nach Nachrichten wie:
- `"Found X pending migrations"`
- `"Running consolidated migration X.0..."`
- `"Migration X.0 completed successfully"`
- `"Database backup created: /path/to/backups-copy-YYYY-MM-DDTHH-MM-SS.db"`
- `"All migrations completed successfully"`

## Version-spezifische Migrationshinweise {/* #version-specific-migration-notes */}

### Aktualisierung auf Version 0.9.x oder höher (Schema v4.0) {/* #upgrading-to-version-09x-or-later-schema-v40 */}

:::warning
**Authentifizierung ist jetzt erforderlich.** Alle Benutzer müssen sich nach der Aktualisierung anmelden.
:::

#### Was Automatisch Geändert Wird {/* #what-changes-automatically */}

- Datenbankschema migriert von v3.1 zu v4.0
- Neue Tabellen erstellt: `users`, `sessions`, `audit_log`
- Standard-Admin-Konto automatisch erstellt
- Alle bestehenden Sitzungen ungültig gemacht

#### Was Sie Tun Müssen {/* #what-you-must-do */}

1. **Melden Sie sich** mit den Standard-Admin-Anmeldedaten an:
   - Benutzername: `admin`
   - Passwort: `Duplistatus09`
2. **Ändern Sie das Passwort**, wenn Sie dazu aufgefordert werden (erforderlich beim ersten Anmelden)
3. **Erstellen Sie Benutzerkonten** für andere Benutzer (Einstellungen → Benutzer)
4. **Aktualisieren Sie externe API-Integrationen**, um die Authentifizierung einzubeziehen (siehe [Rückwärts-inkompatible API-Änderungen](api-changes.md))
5. **Konfigurieren Sie die Aufbewahrung des Prüfprotokolls**, falls nötig (Einstellungen → Prüfprotokoll)

#### Wenn Sie Ausgeschlossen Wurden {/* #if-youre-locked-out */}

Verwenden Sie das Admin-Wiederherstellungstool:

```bash
docker exec -it duplistatus /app/admin-recovery admin NewPassword123
```

Siehe [Admin-Wiederherstellungsanleitung](../user-guide/admin-recovery.md) für Details.

### Aktualisierung auf Version 0.8.x {/* #upgrading-to-version-08x */}

#### Was Automatisch Geändert Wird {/* #what-changes-automatically-1 */}

- Datenbankschema auf v3.1 aktualisiert
- Master-Schlüssel für die Verschlüsselung generiert (gespeichert in `.duplistatus.key`)
- Sitzungen ungültig gemacht (neue CSRF-geschützte Sitzungen erstellt)
- Passwörter mit dem neuen System verschlüsselt

#### Was Sie Tun Müssen {/* #what-you-must-do-1 */}

1. **Aktualisieren Sie die Benachrichtigungsvorlagen**, wenn Sie sie angepasst haben:
   - Ersetzen Sie `{backup_interval_value}` und `{backup_interval_type}` durch `{backup_interval}`
   - Standardvorlagen werden automatisch aktualisiert

#### Sicherheitshinweise {/* #security-notes */}

- Stellen Sie sicher, dass die `.duplistatus.key`-Datei gesichert ist (hat 0400-Berechtigungen)
- Sitzungen laufen nach 24 Stunden ab

### Aktualisierung auf Version 0.7.x {/* #upgrading-to-version-07x */}

#### Was Wird Automatisch Geändert {/* #what-changes-automatically-2 */}

- `machines`-Tabelle umbenannt in `servers`
- `machine_id`-Felder umbenannt in `server_id`
- Neue Felder hinzugefügt: `alias`, `notes`, `created_at`, `updated_at`

#### Was Sie Tun Müssen {/* #what-you-must-do-2 */}

1. **Aktualisieren Sie externe API-Integrationen**:
   - Ändern Sie `totalMachines` → `totalServers` in `/api/summary`
   - Ändern Sie `machine` → `server` in API-Antwortobjekten
   - Ändern Sie `backup_types_count` → `backup_jobs_count` in `/api/lastbackups/{serverId}`
   - Aktualisieren Sie Endpunktpfade von `/api/machines/...` zu `/api/servers/...`
2. **Aktualisieren Sie Benachrichtigungsvorlagen**:
   - Ersetzen Sie `{machine_name}` durch `{server_name}`

Siehe [Rückwärtsinkompatible API-Änderungen](api-changes.md) für detaillierte API-Migrationsschritte.

## Post-Migrations-Checkliste {/* #post-migration-checklist */}

Nach der Aktualisierung überprüfen Sie:

- [ ] Alle Server erscheinen korrekt im Dashboard
- [ ] Sicherungsverlauf ist vollständig und zugänglich
- [ ] Benachrichtigungen funktionieren (testen Sie NTFY/E-Mail)
- [ ] Externe API-Integrationen funktionieren (falls zutreffend)
- [ ] Einstellungen sind zugänglich und korrekt
- [ ] Backup-Überwachung funktioniert korrekt
- [ ] Erfolgreich angemeldet (0.9.x+)
- [ ] Standard-Administratorpasswort geändert (0.9.x+)
- [ ] Benutzerkonten für andere Benutzer erstellt (0.9.x+)
- [ ] Externe API-Integrationen mit Authentifizierung aktualisiert (0.9.x+)

## Fehlerbehebung {/* #troubleshooting */}

### Migration Fehlgeschlagen {/* #migration-fails */}

1. Überprüfen Sie den freien Speicherplatz (Backup erfordert Speicherplatz)
2. Überprüfen Sie die Schreibberechtigungen im Datenverzeichnis
3. Überprüfen Sie die Container-Logs auf spezifische Fehler
4. Falls nötig, stellen Sie aus dem Backup wieder her (siehe Rollback unten)

### Daten Fehlen Nach Der Migration {/* #data-missing-after-migration */}

1. Überprüfen Sie, ob ein Backup erstellt wurde (überprüfen Sie das Datenverzeichnis)
2. Überprüfen Sie die Container-Logs auf Nachrichten zur Backup-Erstellung
3. Überprüfen Sie die Integrität der Datenbankdatei

### Authentifizierungsprobleme (0.9.x+) {/* #authentication-issues-09x */}

1. Überprüfen Sie, ob das Standard-Administratorkonto existiert (überprüfen Sie die Logs)
2. Versuchen Sie die Standardanmeldeinformationen: `admin` / `Duplistatus09`
3. Verwenden Sie das Admin-Wiederherstellungstool, wenn Sie ausgeschlossen sind
4. Überprüfen Sie, ob die `users`-Tabelle in der Datenbank existiert

### API-Fehler {/* #api-errors */}

1. Überprüfen Sie [rückwärts-inkompatible API-Änderungen](api-changes.md) für Endpunktaktualisierungen
2. Aktualisieren Sie externe Integrationen mit neuen Feldnamen
3. Fügen Sie Authentifizierung zu API-Anfragen hinzu (0.9.x+)
4. Testen Sie API-Endpunkte nach der Migration

### Master Key-Probleme (0.8.x+) {/* #master-key-issues-08x */}

1. Stellen Sie sicher, dass die `.duplistatus.key`-Datei zugänglich ist
2. Überprüfen Sie, ob die Dateiberechtigungen 0400 sind
3. Prüfen Sie die Container-Logs auf Fehler bei der Schlüsselgenerierung

### Podman DNS-Konfiguration {/* #podman-dns-configuration */}

Wenn Sie Podman verwenden und nach einem Upgrade Netzwerkverbindungsprobleme haben, müssen Sie möglicherweise die DNS-Einstellungen für Ihren Container konfigurieren. Siehe den Abschnitt [DNS-Konfiguration](../installation/installation.md#configuring-dns-for-podman-containers) im Installationshandbuch für Details.

## Rollback-Verfahren {/* #rollback-procedure */}

Wenn Sie auf eine frühere Version zurückrollen müssen:

1. **Stoppen Sie den Container**: `docker stop <container-name>` (oder `podman stop <container-name>`)
2. **Finden Sie Ihre Sicherung**: 
   - Wenn Sie eine Sicherung mit der Weboberfläche (Version 1.2.1+) erstellt haben, verwenden Sie diese heruntergeladene Sicherungsdatei
   - Wenn Sie eine manuelle Volumensicherung erstellt haben, extrahieren Sie diese zuerst
   - Automatische Migrationssicherungen befinden sich im Datenverzeichnis (zeitgestempelte `.db`-Dateien)
3. **Stellen Sie die Datenbank wieder her**: 
   - **Für Sicherungen der Weboberfläche (Version 1.2.1+)**: Verwenden Sie die Wiederherstellungsfunktion in `Settings → Database Maintenance` (siehe [Datenbankverwaltung](../user-guide/settings/database-maintenance.md#database-restore))
   - **Für manuelle Sicherungen**: Ersetzen Sie `backups.db` in Ihrem Datenverzeichnis/Volumen durch die Sicherungsdatei
4. **Verwenden Sie die vorherige Bildversion**: Holen Sie sich und führen Sie das vorherige Containerbild aus
5. **Starten Sie den Container**: Starten Sie mit der vorherigen Version

:::warning
Ein Rollback kann zu Datenverlust führen, wenn das neuere Schema mit der älteren Version inkompatibel ist. Stellen Sie immer sicher, dass Sie eine aktuelle Sicherung haben, bevor Sie ein Rollback versuchen.
:::

### Problembehandlung bei Ihrer Wiederherstellung / Rollback {/* #troubleshooting-your-restore--rollback */}

Wenn die Anwendung nicht startet oder Ihre Daten nach einer Wiederherstellung oder einem Rollback nicht angezeigt werden, überprüfen Sie die folgenden häufigen Probleme:

#### 1. Datenbankdateiberechtigungen (Linux/Podman) {/* #1-database-file-permissions-linuxpodman */}

Wenn Sie die Datei als `root`-Benutzer wiederhergestellt haben, könnte die Anwendung im Container möglicherweise keine Berechtigung zum Lesen oder Schreiben haben.

* **Das Symptom:** Die Logs zeigen "Permission Denied" oder "Read-only database".
* **Die Lösung:** Setzen Sie die Berechtigungen der Datei innerhalb des Containers zurück, um sicherzustellen, dass sie zugänglich ist.

```bash
# Set ownership (usually UID 1000 or the app user)
docker exec -u 0 duplistatus chown 1000:1000 /app/data/backups.db
# Set read/write permissions
docker exec -u 0 duplistatus chmod 664 /app/data/backups.db
```

#### 2. Falscher Dateiname {/* #2-incorrect-filename */}

Die Anwendung sucht speziell nach einer Datei mit dem Namen `backups.db`.

* **Das Symptom:** Die Anwendung startet, sieht aber "leer" aus (wie eine frische Installation).
* **Die Lösung:** Überprüfen Sie das `/app/data/`-Verzeichnis. Wenn Ihre Datei den Namen `duplistatus-backup-2024.db` trägt oder eine `.sqlite`-Erweiterung hat, wird die App sie ignorieren. Verwenden Sie den Befehl `mv` oder die Docker Desktop GUI, um sie genau in `backups.db` umzubenennen.

#### 3. Container nicht neu gestartet {/* #3-container-not-restarted */}

Bei einigen Systemen kann das Verwenden von `docker cp` während des Betriebs des Containers möglicherweise nicht sofort die Verbindung der Anwendung zur Datenbank "aktualisieren".

* **Die Lösung:** Führen Sie immer einen vollständigen Neustart nach einer Wiederherstellung durch:

```bash
docker restart duplistatus
```

#### 4. Datenbankversionsinkongruenz {/* #4-database-version-mismatch */}

Wenn Sie eine Sicherung aus einer viel neueren Version von duplistatus in eine ältere Version der App wiederherstellen, kann das Datenbankschema inkompatibel sein.

* **Die Lösung:** Stellen Sie immer sicher, dass Sie dieselbe (oder eine neuere) Version des duplistatus-Images verwenden wie diejenige, die die Sicherung erstellt hat. Überprüfen Sie Ihre Version mit:

```bash
docker inspect duplistatus --format '{{.Config.Image}}'
```

## Datenbankschema-Versionen {/* #database-schema-versions */}

| Anwendungsversion        | Schemaversion | Wichtige Änderungen                                        |
|----------------------------|----------------|----------------------------------------------------|
| 0.6.x und früher          | v1.0           | Initiales Schema                                     |
| 0.7.x                      | v2.0, v3.0     | Hinzugefügte Konfigurationen, Umbenennung von Maschinen → Server   |
| 0.8.x                      | v3.1           | Verbesserte Sicherungsfelder, Verschlüsselungsunterstützung         |
| 0.9.x, 1.0.x, 1.1.x, 1.2.x, 1.3.x | v4.0           | Benutzerzugriffskontrolle, Authentifizierung, Audit-Protokollierung |

## Hilfe erhalten {/* #getting-help */}

- **Dokumentation**: [Benutzerhandbuch](../user-guide/overview.md)
- **API-Referenz**: [API-Dokumentation](../api-reference/overview.md)
- **API-Änderungen**: [Rückwärtsinkompatible API-Änderungen](api-changes.md)
- **Versionshinweise**: Überprüfen Sie die versionsspezifischen Versionshinweise für detaillierte Änderungen
- **Community**: [GitHub Diskussionen](https://github.com/wsj-br/duplistatus/discussions)
- **Probleme**: [GitHub Probleme](https://github.com/wsj-br/duplistatus/issues)
