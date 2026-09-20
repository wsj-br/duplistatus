# Migrationsanleitung {/* #migration-guide */}

Diese Anleitung erklärt, wie Sie zwischen Versionen von duplistatus aktualisieren. Migrationen erfolgen automatisch – das Datenbankschema aktualisiert sich selbst, wenn Sie eine neue Version starten.

Manuelle Schritte sind nur erforderlich, wenn Sie benutzerdefinierte Benachrichtigungsvorlagen angepasst haben (Version 0.8.x hat Vorlagenvariablen geändert) oder externe API-Integrationen, die aktualisiert werden müssen (Version 0.7.x hat API-Feldnamen geändert, Version 0.9.x erfordert Authentifizierung).

## Übersicht {/* #overview */}

duplistatus migriert Ihr Datenbankschema beim Upgrade automatisch. Das System:

1. Erstellt eine Sicherung Ihrer Datenbank, bevor Änderungen vorgenommen werden
2. Aktualisiert das Datenbankschema auf die neueste Version
3. Behält alle vorhandenen Daten bei (Server, Backups, Konfiguration)
4. Überprüft, ob die Migration erfolgreich abgeschlossen wurde

## Sichern Ihrer Datenbank vor der Migration {/* #backing-up-your-database-before-migration */}

Bevor Sie auf eine neue Version aktualisieren, wird empfohlen, eine Sicherung Ihrer Datenbank zu erstellen. Dies stellt sicher, dass Sie Ihre Daten wiederherstellen können, falls während des Migrationsprozesses etwas schief geht.

### Wenn Sie Version 1.2.1 oder später ausführen {/* #if-youre-running-version-121-or-later */}

Verwenden Sie die integrierte Datenbanksicherungsfunktion:

1. Navigieren Sie in der Weboberfläche zu [Einstellungen → Datenbankverwaltung](../user-guide/settings/database-maintenance.md)
2. Wählen Sie im Abschnitt **Datenbank-Backup** ein Backup-Format aus:
   - **Datenbankdatei (.db)**: Binäres Format – schnellste Sicherung, bewahrt exakt alle Datenbankstruktur erhalten
   - **SQL-Dump (.sql)**: Textformat – menschenlesbare SQL-Anweisungen
3. Klicken Sie auf **Backup herunterladen**
4. Die Sicherungsdatei wird mit einem Zeitstempel versehen auf Ihren Computer heruntergeladen

Weitere Details finden Sie in der Dokumentation zur [Datenbankverwaltung](../user-guide/settings/database-maintenance.md#database-backup).

### Wenn Sie eine Version vor 1.2.1 ausführen {/* #if-youre-running-a-version-before-121 */}

#### Sicherung {/* #backup */}

Sie müssen vor dem Fortfahren manuell eine Sicherung der Datenbank erstellen. Die Datenbankdatei befindet sich unter `/app/data/backups.db` innerhalb des Containers.

##### Für Linux-Benutzer {/* #for-linux-users */}
Wenn Sie Linux verwenden, machen Sie sich keine Gedanken darüber, Hilfscontainer zu starten. Sie können den nativen Befehl `cp` verwenden, um die Datenbank direkt aus dem laufenden Container auf Ihren Host zu extrahieren.

###### Verwendung von Docker oder Podman: {/* #using-docker-or-podman */}

```bash
# Replace 'duplistatus' with your actual container name if different
docker cp duplistatus:/app/data/backups.db ./duplistatus-backup-$(date +%Y%m%d).db
```

(Bei Verwendung von Podman ersetzen Sie einfach `docker` durch `podman` im obigen Befehl.)

##### Für Windows-Benutzer {/* #for-windows-users */}
Wenn Sie Docker Desktop unter Windows ausführen, gibt es zwei einfache Möglichkeiten, dies ohne Befehlszeile zu handhaben:

###### Option A: Docker Desktop verwenden (am einfachsten) {/* #option-a-use-docker-desktop-easiest */}
1. Öffnen Sie das Docker Desktop Dashboard.
2. Gehen Sie auf die Registerkarte Container und klicken Sie auf Ihren duplistatus-Container.
3. Klicken Sie auf die Registerkarte Dateien.
4. Navigieren Sie zu `/app/data/`.
5. Klicken Sie mit der rechten Maustaste auf `backups.db` und wählen Sie **Speichern unter...**, um sie in Ihre Windows-Ordner herunterzuladen.

###### Option B: Verwenden Sie PowerShell {/* #option-b-use-powershell */}
Falls Sie die Befehlszeile bevorzugen, können Sie PowerShell verwenden, um die Datei auf Ihren Desktop zu kopieren:

```powershell
docker cp duplistatus:/app/data/backups.db $HOME\Desktop\duplistatus-backup.db
```

##### Falls Sie Bind-Mounts verwenden {/* #if-you-use-bind-mounts */}
Wenn Sie Ihren Container ursprünglich mit einem Bind-Mount eingerichtet haben (z. B. haben Sie einen lokalen Ordner wie `/opt/duplistatus` mit dem Container verknüpft), benötigen Sie überhaupt keine Docker-Befehle. Kopieren Sie die Datei einfach über Ihren Dateimanager:
- Linux: `cp /path/to/your/folder/backups.db ~/backups.db`
- Windows: Kopieren Sie die Datei einfach im **Datei-Explorer** aus dem Ordner, den Sie während der Einrichtung festgelegt haben.

#### Wiederherstellen Ihrer Daten {/* #restoring-your-data */}
Falls Sie Ihre Datenbank aus einer früheren Sicherung wiederherstellen müssen, folgen Sie den unten stehenden Schritten, entsprechend Ihrem Betriebssystem.

:::info[WICHTIG] 
Beenden Sie den Container vor der Wiederherstellung der Datenbank, um Dateibeschädigungen zu vermeiden.
:::

##### Für Linux-Benutzer {/* #for-linux-users-1 */}
Der einfachste Weg zur Wiederherstellung ist es, die Sicherungsdatei zurück in den internen Speicherpfad des Containers zu „schieben“.

###### Verwendung von Docker oder Podman: {/* #using-docker-or-podman-1 */}

```bash
# stop the container
docker stop duplistatus

# Replace 'duplistatus-backup.db' with your actual backup filename
docker cp ./duplistatus-backup.db duplistatus:/app/data/backups.db

# Restart the container
docker start duplistatus
```

##### Für Windows-Benutzer {/* #for-windows-users-1 */}
Wenn Sie Docker Desktop verwenden, können Sie die Wiederherstellung über die grafische Oberfläche oder PowerShell durchführen.

###### Option A: Docker Desktop (grafische Oberfläche) verwenden {/* #option-a-use-docker-desktop-gui */}
1. Stellen Sie sicher, dass der duplistatus-Container läuft (Docker Desktop erfordert, dass der Container aktiv ist, um Dateien über die grafische Oberfläche hochzuladen).
2. Wechseln Sie zum Reiter „Files“ in Ihren Containereinstellungen.
3. Navigieren Sie zu `/app/data/`.
4. Klicken Sie mit der rechten Maustaste auf die vorhandene backups.db und wählen Sie Löschen.
5. Klicken Sie auf den Button „Import“ (oder klicken Sie mit der rechten Maustaste in den Ordnerbereich) und wählen Sie Ihre Sicherungsdatei von Ihrem Computer aus.

Benennen Sie die importierte Datei exakt in backups.db um, falls sie einen Zeitstempel im Namen trägt.

Starten Sie den Container neu.

###### Option B: Verwenden Sie PowerShell {/* #option-b-use-powershell-1 */}

```powershell
# Copy the file from your Desktop back into the container
docker cp $HOME\Desktop\duplistatus-backup.db duplistatus:/app/data/backups.db

# Restart the container
docker start duplistatus
```

##### Falls Sie Bind-Mounts verwenden {/* #if-you-use-bind-mounts-1 */}
Wenn Sie einen lokalen Ordner verwenden, der mit dem Container verknüpft ist, benötigen Sie keine speziellen Befehle.

1. Stoppen Sie den Container.
2. Kopieren Sie Ihre Sicherungsdatei manuell in Ihren verknüpften Ordner (z. B. `/opt/duplistatus` oder `C:\duplistatus_data`).
3. Stellen Sie sicher, dass die Datei genau den Namen `backups.db` trägt.
4. Starten Sie den Container.

:::note
Wenn Sie die Datenbank manuell wiederherstellen, können Berechtigungsfehler auftreten. 

Überprüfen Sie die Containerprotokolle und passen Sie gegebenenfalls die Berechtigungen an. Weitere Informationen finden Sie im Abschnitt [Fehlerbehebung](#troubleshooting-your-restore--rollback) weiter unten.
:::

## Automatischer Migrationsprozess {/* #automatic-migration-process */}

Wenn Sie eine neue Version starten, werden Migrationen automatisch ausgeführt:

1. **Sicherung erstellen**: Eine zeitgestempelte Sicherung wird in Ihrem DatenvVerzeichnis erstellt
2. **Schema-Aktualisierung**: Datenbanktabellen und -felder werden nach Bedarf aktualisiert
3. **Datenmigration**: Alle vorhandenen Daten werden erhalten und migriert
4. **Überprüfung**: Der erfolgreiche Abschluss der Migration wird protokolliert

### Überwachung der Migration {/* #monitoring-migration */}

Überprüfen Sie die Docker-Protokolle, um den Fortschritt der Migration zu überwachen:

```bash
docker logs <container-name>
```

Suchen Sie nach Nachrichten wie:
- `"Found X pending migrations"`
- `"Running consolidated migration X.0..."`
- `"Migration X.0 completed successfully"`
- `"Database backup created: /path/to/backups-copy-YYYY-MM-DDTHH-MM-SS.db"`
- `"All migrations completed successfully"`

## Versionsabhängige Migrationshinweise {/* #version-specific-migration-notes */}

### Aktualisierung auf Version 0.9.x oder höher (Schema v4.0) {/* #upgrading-to-version-09x-or-later-schema-v40 */}

:::warning
**Authentifizierung ist jetzt erforderlich.** Alle Benutzer müssen sich nach der Aktualisierung anmelden.
:::

#### Was automatisch geändert wird {/* #what-changes-automatically */}

- Datenbankschema wird von v3.1 auf v4.0 migriert
- Neue Tabellen werden erstellt: `users`, `sessions`, `audit_log`
- Standard-Admin-Konto wird automatisch erstellt
- Alle bestehenden Sitzungen werden ungültig

#### Was Sie tun müssen {/* #what-you-must-do */}

1. **Melden Sie sich an** mit den Standard-Admin-Anmeldeinformationen:
   - Benutzername: `admin`
   - Passwort: `Duplistatus09`
2. **Ändern Sie das Passwort**, wenn Sie dazu aufgefordert werden (erforderlich bei erster Anmeldung)
3. **Erstellen Sie Benutzerkonten** für andere Benutzer (Einstellungen → Benutzer)
4. **Aktualisieren Sie externe API-Integrationen**, um Authentifizierung einzubeziehen (siehe [Rückwärtsinkompatible API-Änderungen](api-changes.md))
5. **Konfigurieren Sie die Aufbewahrung des Prüfprotokolls**, falls erforderlich (Einstellungen → Prüfprotokoll)

#### Falls Sie gesperrt sind {/* #if-youre-locked-out */}

Verwenden Sie das Admin-Wiederherstellungstool:

```bash
docker exec -it duplistatus /app/admin-recovery admin NewPassword123
```

Siehe [Admin-Wiederherstellungsanleitung](../user-guide/admin-recovery.md) für Details.

### Aktualisierung auf Version 0.8.x {/* #upgrading-to-version-08x */}

#### Was automatisch geändert wird {/* #what-changes-automatically-1 */}

- Datenbankschema auf v3.1 aktualisiert
- Hauptschlüssel für Verschlüsselung generiert (gespeichert in `.duplistatus.key`)
- Sitzungen ungültig gemacht (neue CSRF-geschützte Sitzungen erstellt)
- Passwörter mit neuem System verschlüsselt

#### Was Sie tun müssen {/* #what-you-must-do-1 */}

1. **Aktualisieren Sie Benachrichtigungsvorlagen**, falls Sie sie angepasst haben:
   - Ersetzen Sie `{backup_interval_value}` und `{backup_interval_type}` durch `{backup_interval}`
   - Standardvorlagen werden automatisch aktualisiert

#### Sicherheitshinweise {/* #security-notes */}

- Stellen Sie sicher, dass die Datei `.duplistatus.key` gesichert ist (hat Berechtigungen 0400)
- Sitzungen laufen nach 24 Stunden ab

### Aktualisierung auf Version 0.7.x {/* #upgrading-to-version-07x */}

#### Was sich automatisch ändert {/* #what-changes-automatically-2 */}

- `machines` Tabelle umbenannt zu `servers`
- `machine_id` Felder umbenannt zu `server_id`
- Neue Felder hinzugefügt: `alias`, `notes`, `created_at`, `updated_at`

#### Was Sie tun müssen {/* #what-you-must-do-2 */}

1. **Externe API-Integrationen aktualisieren**:
   - Ändern Sie `totalMachines` → `totalServers` in `/api/summary`
   - Ändern Sie `machine` → `server` in API-Antwortobjekten
   - Ändern Sie `backup_types_count` → `backup_jobs_count` in `/api/lastbackups/{serverId}`
   - Aktualisieren Sie Endpunktpfade von `/api/machines/...` zu `/api/servers/...`
2. **Benachrichtigungsvorlagen aktualisieren**:
   - Ersetzen Sie `{machine_name}` durch `{server_name}`

Siehe [Rückwärtsinkompatible API-Änderungen](api-changes.md) für detaillierte API-Migrationschritte.

## Prüfliste nach der Migration {/* #post-migration-checklist */}

Nach der Aktualisierung überprüfen Sie:

- [ ] Alle Server werden korrekt im Dashboard angezeigt
- [ ] Sicherungsverlauf ist vollständig und zugänglich
- [ ] Benachrichtigungen funktionieren (NTFY/E-Mail testen)
- [ ] Externe API-Integrationen funktionieren (falls zutreffend)
- [ ] Einstellungen sind zugänglich und korrekt
- [ ] Backup-Überwachung funktioniert ordnungsgemäß
- [ ] Erfolgreich angemeldet (0.9.x+)
- [ ] Standard-Admin-Passwort geändert (0.9.x+)
- [ ] Benutzerkonten für andere Benutzer erstellt (0.9.x+)
- [ ] Externe API-Integrationen mit Authentifizierung aktualisiert (0.9.x+)

## Problembehandlung {/* #troubleshooting */}

### Migration schlägt fehl {/* #migration-fails */}

1. Überprüfen Sie den Speicherplatz (Sicherung benötigt Platz)
2. Stellen Sie Schreibberechtigungen für das Datenverzeichnis sicher
3. Prüfen Sie Container-Protokolle auf spezifische Fehler
4. Wiederherstellung aus Sicherung falls nötig (siehe Rollback unten)

### Daten nach Migration fehlen {/* #data-missing-after-migration */}

1. Stellen Sie sicher, dass Sicherung erstellt wurde (Datenverzeichnis prüfen)
2. Prüfen Sie Container-Protokolle auf Nachrichten zur Sicherungserstellung
3. Prüfen Sie Integrität der Datenbankdatei

### Authentifizierungsprobleme (0.9.x+) {/* #authentication-issues-09x */}

1. Stellen Sie sicher, dass Standard-Admin-Konto existiert (Protokolle prüfen)
2. Versuchen Sie Standard-Anmeldedaten: `admin` / `Duplistatus09`
3. Nutzen Sie Admin-Wiederherstellungswerkzeug bei Sperre
4. Stellen Sie sicher, dass `users` Tabelle in Datenbank existiert

### API-Fehler {/* #api-errors */}

1. Prüfen Sie [Rückwärtsinkompatible API-Änderungen](api-changes.md) für Endpunktaktualisierungen
2. Aktualisieren Sie externe Integrationen mit neuen Feldnamen
3. Fügen Sie Authentifizierung zu API-Anfragen hinzu (0.9.x+)
4. Testen Sie API-Endpunkte nach Migration

### Master-Schlüssel-Probleme (0.8.x+) {/* #master-key-issues-08x */}

1. Stellen Sie sicher, dass die Datei `.duplistatus.key` zugänglich ist
2. Überprüfen Sie, ob die Dateiberechtigungen 0400 lauten
3. Prüfen Sie die Container-Protokolle auf Fehler bei der Schlüsselgenerierung

### Podman DNS-Konfiguration {/* #podman-dns-configuration */}

Wenn Sie Podman verwenden und nach einem Upgrade Netzwerkverbindungsprobleme auftreten, müssen Sie möglicherweise die DNS-Einstellungen für Ihren Container konfigurieren. Weitere Details finden Sie im Abschnitt [DNS-Konfiguration](../installation/installation.md#configuring-dns-for-podman-containers) des Installationshandbuchs.

## Rollback-Verfahren {/* #rollback-procedure */}

Wenn Sie zu einer früheren Version zurückkehren müssen:

1. **Stoppen Sie den Container**: `docker stop <container-name>` (oder `podman stop <container-name>`)
2. **Suchen Sie Ihre Sicherung**: 
   - Wenn Sie eine Sicherung über die Web-Oberfläche (Version 1.2.1+) erstellt haben, verwenden Sie diese heruntergeladene Sicherungsdatei
   - Wenn Sie eine manuelle Volume-Sicherung erstellt haben, entpacken Sie sie zuerst
   - Automatische Migrationsicherungen befinden sich im Datenverzeichnis (zeitgestempelte Dateien `.db`)
3. **Stellen Sie die Datenbank wieder her**: 
   - **Für Web-Oberflächen-Sicherungen (Version 1.2.1+)**: Verwenden Sie die Wiederherstellungsfunktion in `Settings → Database Maintenance` (siehe [Datenbankverwaltung](../user-guide/settings/database-maintenance.md#database-restore))
   - **Für manuelle Sicherungen**: Ersetzen Sie `backups.db` in Ihrem Datenverzeichnis/Volume durch die Sicherungsdatei
4. **Verwenden Sie die vorherige Image-Version**: Laden Sie das vorherige Container-Image herunter und führen Sie es aus
5. **Starten Sie den Container**: Starten Sie mit der vorherigen Version

:::warning
Ein Rollback kann zu Datenverlust führen, wenn das neuere Schema nicht mit der älteren Version kompatibel ist. Stellen Sie immer sicher, dass Sie eine aktuelle Sicherung haben, bevor Sie einen Rollback versuchen.
:::

### Problembehandlung bei Ihrer Wiederherstellung / Rollback {/* #troubleshooting-your-restore--rollback */}

Wenn die Anwendung nach einer Wiederherstellung oder einem Rollback nicht startet oder Ihre Daten nicht erscheinen, überprüfen Sie folgende häufige Probleme:

#### 1. Datenbank-Dateiberechtigungen (Linux/Podman) {/* #1-database-file-permissions-linuxpodman */}

Wenn Sie die Datei als Benutzer `root` wiederhergestellt haben, verfügt die Anwendung innerhalb des Containers möglicherweise nicht über die Berechtigung, sie zu lesen oder zu schreiben.

* **Das Symptom:** Die Protokolle zeigen "Permission Denied" oder "Read-only database."
* **Die Lösung:** Setzen Sie die Berechtigungen der Datei innerhalb des Containers zurück, um sicherzustellen, dass sie zugänglich ist.

```bash
# Set ownership (usually UID 1000 or the app user)
docker exec -u 0 duplistatus chown 1000:1000 /app/data/backups.db
# Set read/write permissions
docker exec -u 0 duplistatus chmod 664 /app/data/backups.db
```

#### 2. Falscher Dateiname {/* #2-incorrect-filename */}

Die Anwendung sucht gezielt nach einer Datei mit dem Namen `backups.db`.

* **Das Symptom:** Die Anwendung startet, sieht aber "leer" aus (wie eine Neuinstallation).
* **Die Lösung:** Überprüfen Sie das Verzeichnis `/app/data/`. Wenn Ihre Datei `duplistatus-backup-2024.db` heißt oder eine `.sqlite`-Erweiterung hat, ignoriert die App sie. Verwenden Sie den Befehl `mv` oder die Docker Desktop-GUI, um sie exakt in `backups.db` umzubenennen.

#### 3. Container wurde nicht neu gestartet {/* #3-container-not-restarted */}

Auf einigen Systemen aktualisiert die Verwendung von `docker cp`, während der Container läuft, möglicherweise nicht sofort die Verbindung der Anwendung zur Datenbank.

* **Die Lösung:** Führen Sie nach einer Wiederherstellung immer einen vollständigen Neustart durch:

```bash
docker restart duplistatus
```

#### 4. Datenbank-Versionskonflikt {/* #4-database-version-mismatch */}

Wenn Sie eine Sicherung aus einer viel neueren Version von duplistatus in eine ältere Version der Anwendung wiederherstellen, kann das Datenbankschema inkompatibel sein.

* **Die Lösung:** Stellen Sie immer sicher, dass Sie dieselbe (oder eine neuere) Version des duplistatus-Images ausführen wie diejenige, die die Sicherung erstellt hat. Überprüfen Sie Ihre Version mit:

```bash
docker inspect duplistatus --format '{{.Config.Image}}'
```

## Datenbankschema-Versionen {/* #database-schema-versions */}

| Anwendungsversion          | Schema-Version | Wichtige Änderungen                                |
|----------------------------|----------------|----------------------------------------------------|
| 0.6.x und früher           | v1.0           | Initiales Schema                                   |
| 0.7.x                      | v2.0, v3.0     | Konfigurationen hinzugefügt, machines zu Server umbenannt |
| 0.8.x                      | v3.1           | Erweiterte Sicherungsfelder, Verschlüsselungsunterstützung |
| 0.9.x, 1.0.x, 1.1.x, 1.2.x, 1.3.x | v4.0           | Benutzerzugriffskontrolle, Authentifizierung, Audit-Protokollierung |

## Hilfe erhalten {/* #getting-help */}

- **Dokumentation**: [Benutzerhandbuch](../user-guide/overview.md)
- **API-Referenz**: [API-Dokumentation](../api-reference/overview.md)
- **API-Änderungen**: [Rückwärtsinkompatible API-Änderungen](api-changes.md)
- **Versionshinweise**: Prüfen Sie versionspezifische Versionshinweise für detaillierte Änderungen
- **Community**: [GitHub-Diskussionen](https://github.com/wsj-br/duplistatus/discussions)
- **Probleme**: [GitHub-Probleme](https://github.com/wsj-br/duplistatus/issues)
