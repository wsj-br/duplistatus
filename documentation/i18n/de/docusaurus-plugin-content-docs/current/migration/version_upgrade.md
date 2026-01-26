# Migrationsleitfaden

Dieser Leitfaden erklärt, wie Sie zwischen Versionen von duplistatus aktualisieren. Migrationen sind automatisch – das Datenbankschema aktualisiert sich selbst, wenn Sie eine neue Version starten.

Manuelle Schritte sind nur erforderlich, wenn Sie Benachrichtigungsvorlagen angepasst haben (Version 0.8.x hat Vorlagenvariablen geändert) oder externe API-Integrationen, die aktualisiert werden müssen (Version 0.7.x hat API-Feldnamen geändert, Version 0.9.x erfordert Authentifizierung).

## Übersicht

duplistatus migriert Ihr Datenbankschema automatisch beim Upgrade. Das System:

1. Erstellt eine Sicherung Ihrer Datenbank vor Änderungen
2. Aktualisiert das Datenbankschema auf die neueste Version
3. Bewahrt alle vorhandenen Daten (Server, Sicherungen, Konfiguration)
4. Überprüft, dass die Migration erfolgreich abgeschlossen wurde

## Sicherung Ihrer Datenbank vor der Migration

Vor dem Upgrade auf eine neue Version wird empfohlen, eine Sicherung Ihrer Datenbank zu erstellen. Dies stellt sicher, dass Sie Ihre Daten wiederherstellen können, falls während des Migrationsprozesses etwas schiefgeht.

### Wenn Sie Version 1.2.1 oder später ausführen

Verwenden Sie die integrierte Datenbanksicherungsfunktion:

1. Navigieren Sie zu `Einstellungen → Datenbankwartung` in der Weboberfläche
2. Im Bereich **Datenbanksicherung** wählen Sie ein Sicherungsformat:
   - **Datenbankdatei (.db)**: Binärformat - schnellste Sicherung, bewahrt alle Datenbankstruktur genau
   - **SQL-Dump (.sql)**: Textformat - lesbare SQL-Anweisungen
3. Klicken Sie auf `Sicherung herunterladen`
4. Die Sicherungsdatei wird auf Ihren Computer mit einem Zeitstempel-Dateinamen heruntergeladen

Weitere Details finden Sie in der Dokumentation [Datenbankwartung](../user-guide/settings/database-maintenance.md#database-backup).

### Wenn Sie eine Version vor 1.2.1 ausführen

#### Sicherung

Sie müssen die Datenbank manuell sichern, bevor Sie fortfahren. Die Datenbankdatei befindet sich unter `/app/data/backups.db` im Container.

##### Für Linux-Benutzer

Wenn Sie unter Linux arbeiten, machen Sie sich keine Sorgen um das Starten von Hilfs-Containern. Sie können den nativen `cp`-Befehl verwenden, um die Datenbank direkt aus dem laufenden Container auf Ihren Host zu extrahieren.

###### Docker oder Podman verwenden:

```bash
# Ersetzen Sie 'duplistatus' durch Ihren tatsächlichen Container-Namen, falls unterschiedlich
docker cp duplistatus:/app/data/backups.db ./duplistatus-backup-$(date +%Y%m%d).db
```

(Wenn Sie Podman verwenden, ersetzen Sie einfach `docker` durch `podman` im obigen Befehl.)

##### Für Windows-Benutzer

Wenn Sie Docker Desktop unter Windows ausführen, haben Sie zwei einfache Möglichkeiten, dies ohne Befehlszeile zu handhaben:

###### Option A: Docker Desktop verwenden (am einfachsten)

1. Öffnen Sie das Docker Desktop Dashboard.
2. Gehen Sie zur Registerkarte Container und klicken Sie auf Ihren duplistatus-Container.
3. Klicken Sie auf die Registerkarte Dateien.
4. Navigieren Sie zu `/app/data/`.
5. Klicken Sie mit der rechten Maustaste auf `backups.db` und wählen Sie **Speichern unter...**, um es in Ihre Windows-Ordner herunterzuladen.

###### Option B: PowerShell verwenden

Wenn Sie das Terminal bevorzugen, können Sie PowerShell verwenden, um die Datei auf Ihren Desktop zu kopieren:

```powershell
docker cp duplistatus:/app/data/backups.db $HOME\Desktop\duplistatus-backup.db
```

##### Wenn Sie Bind Mounts verwenden

Wenn Sie Ihren Container ursprünglich mit einem Bind Mount eingerichtet haben (z. B. haben Sie einen lokalen Ordner wie `/opt/duplistatus` dem Container zugeordnet), benötigen Sie überhaupt keine Docker-Befehle. Kopieren Sie die Datei einfach mit Ihrem Dateimanager:

- Linux: `cp /path/to/your/folder/backups.db ~/backups.db`
- Windows: Kopieren Sie die Datei einfach im **Datei-Explorer** aus dem Ordner, den Sie während der Einrichtung festgelegt haben.

#### Wiederherstellen Ihrer Daten

Wenn Sie Ihre Datenbank aus einer vorherigen Sicherung wiederherstellen müssen, führen Sie die folgenden Schritte basierend auf Ihrem Betriebssystem aus.

:::info[IMPORTANT]
Stoppen Sie den Container vor der Wiederherstellung der Datenbank, um Dateikorruption zu vermeiden.
:::

##### Für Linux-Benutzer

Der einfachste Weg zur Wiederherstellung besteht darin, die Sicherungsdatei in den internen Speicherpfad des Containers "zu pushen".

###### Docker oder Podman verwenden:

```bash
# Container stoppen
docker stop duplistatus

# Ersetzen Sie 'duplistatus-backup.db' durch Ihren tatsächlichen Sicherungsdateinamen
docker cp ./duplistatus-backup.db duplistatus:/app/data/backups.db

# Container neu starten
docker start duplistatus
```

##### Für Windows-Benutzer

Wenn Sie Docker Desktop verwenden, können Sie die Wiederherstellung über die GUI oder PowerShell durchführen.

###### Option A: Docker Desktop verwenden (GUI)

1. Stellen Sie sicher, dass der duplistatus-Container aktiv ist (Docker Desktop erfordert, dass der Container aktiv ist, um Dateien über die GUI hochzuladen).
2. Gehen Sie zur Registerkarte Dateien in Ihren Container-Einstellungen.
3. Navigieren Sie zu `/app/data/`.
4. Klicken Sie mit der rechten Maustaste auf die vorhandene backups.db und wählen Sie Löschen.
5. Klicken Sie auf die Schaltfläche Importieren (oder klicken Sie mit der rechten Maustaste in den Ordnerbereich) und wählen Sie Ihre Sicherungsdatei von Ihrem Computer.

Benennen Sie die importierte Datei genau in backups.db um, wenn sie einen Zeitstempel im Namen hat.

Starten Sie den Container neu.

###### Option B: PowerShell verwenden

```powershell
# Kopieren Sie die Datei von Ihrem Desktop zurück in den Container
docker cp $HOME\Desktop\duplistatus-backup.db duplistatus:/app/data/backups.db

# Container neu starten
docker start duplistatus
```

##### Wenn Sie Bind Mounts verwenden

Wenn Sie einen lokalen Ordner verwenden, der dem Container zugeordnet ist, benötigen Sie keine speziellen Befehle.

1. Stoppen Sie den Container.
2. Kopieren Sie Ihre Sicherungsdatei manuell in Ihren zugeordneten Ordner (z. B. `/opt/duplistatus` oder `C:\duplistatus_data`).
3. Stellen Sie sicher, dass die Datei genau `backups.db` heißt.
4. Starten Sie den Container.

:::note
Wenn Sie die Datenbank manuell wiederherstellen, können Berechtigungsfehler auftreten.

Überprüfen Sie die Container-Protokolle und passen Sie die Berechtigungen bei Bedarf an. Weitere Informationen finden Sie im Abschnitt [Fehlerbehebung](#troubleshooting-your-restore--rollback) unten.
:::

## Automatischer Migrationsprozess

Wenn Sie eine neue Version starten, werden Migrationen automatisch ausgeführt:

1. **Sicherungserstellung**: Eine Sicherung mit Zeitstempel wird in Ihrem Datenverzeichnis erstellt
2. **Schema-Update**: Datenbanktabellen und Felder werden nach Bedarf aktualisiert
3. **Datenmigration**: Alle vorhandenen Daten werden bewahrt und migriert
4. **Überprüfung**: Der Migrationserfolg wird protokolliert

### Überwachung der Migration

Überprüfen Sie Docker-Protokolle, um den Migrationsprozess zu überwachen:

```bash
docker logs <container-name>
```

Suchen Sie nach Meldungen wie:

- `"Found X pending migrations"`
- `"Running consolidated migration X.0..."`
- `"Migration X.0 completed successfully"`
- `"Database backup created: /path/to/backups-copy-YYYY-MM-DDTHH-MM-SS.db"`
- `"All migrations completed successfully"`

## Versionsspezifische Migrationsnoten

### Upgrade auf Version 0.9.x oder später (Schema v4.0)

:::warning
**Authentifizierung ist jetzt erforderlich.** Alle Benutzer müssen sich nach dem Upgrade anmelden.
:::

#### Was ändert sich automatisch

- Datenbankschema migriert von v3.1 zu v4.0
- Neue Tabellen erstellt: `users`, `sessions`, `audit_log`
- Standard-Admin-Konto wird automatisch erstellt
- Alle vorhandenen Sitzungen werden ungültig

#### Was Sie tun müssen

1. **Melden Sie sich an** mit Standard-Admin-Anmeldedaten:
   - Benutzername: `admin`
   - Passwort: `Duplistatus09`
2. **Ändern Sie das Passwort**, wenn Sie dazu aufgefordert werden (erforderlich bei der ersten Anmeldung)
3. **Erstellen Sie Benutzerkonten** für andere Benutzer (Einstellungen → Benutzer)
4. **Aktualisieren Sie externe API-Integrationen**, um Authentifizierung einzubeziehen (siehe [API Breaking Changes](api-changes.md))
5. **Konfigurieren Sie die Audit-Log-Aufbewahrung**, falls erforderlich (Einstellungen → Audit-Log)

#### Wenn Sie gesperrt sind

Verwenden Sie das Admin-Wiederherstellungstool:

```bash
docker exec -it duplistatus /app/admin-recovery admin NewPassword123
```

Weitere Details finden Sie im [Admin-Wiederherstellungsleitfaden](../user-guide/admin-recovery.md).

### Upgrade auf Version 0.8.x

#### Was ändert sich automatisch

- Datenbankschema aktualisiert auf v3.1
- Hauptschlüssel für Verschlüsselung generiert (gespeichert in `.duplistatus.key`)
- Sitzungen ungültig gemacht (neue CSRF-geschützte Sitzungen erstellt)
- Passwörter mit neuem System verschlüsselt

#### Was Sie tun müssen

1. **Aktualisieren Sie Benachrichtigungsvorlagen**, wenn Sie diese angepasst haben:
   - Ersetzen Sie `{backup_interval_value}` und `{backup_interval_type}` durch `{backup_interval}`
   - Standardvorlagen werden automatisch aktualisiert

#### Sicherheitshinweise

- Stellen Sie sicher, dass die Datei `.duplistatus.key` gesichert wird (hat 0400-Berechtigungen)
- Sitzungen verfallen nach 24 Stunden

### Upgrade auf Version 0.7.x

#### Was ändert sich automatisch

- `machines`-Tabelle in `servers` umbenannt
- `machine_id`-Felder in `server_id` umbenannt
- Neue Felder hinzugefügt: `alias`, `notes`, `created_at`, `updated_at`

#### Was Sie tun müssen

1. **Aktualisieren Sie externe API-Integrationen**:
   - Ändern Sie `totalMachines` → `totalServers` in `/api/summary`
   - Ändern Sie `machine` → `server` in API-Antwortobjekten
   - Ändern Sie `backup_types_count` → `backup_jobs_count` in `/api/lastbackups/{serverId}`
   - Aktualisieren Sie Endpunktpfade von `/api/machines/...` zu `/api/servers/...`
2. **Aktualisieren Sie Benachrichtigungsvorlagen**:
   - Ersetzen Sie `{machine_name}` durch `{server_name}`

Weitere Informationen finden Sie unter [API Breaking Changes](api-changes.md) für detaillierte API-Migrationschritte.

## Checkliste nach der Migration

Nach dem Upgrade überprüfen Sie:

- [ ] Alle Server werden korrekt im Dashboard angezeigt
- [ ] Der Sicherungsverlauf ist vollständig und zugänglich
- [ ] Benachrichtigungen funktionieren (NTFY/E-Mail testen)
- [ ] Externe API-Integrationen funktionieren (falls zutreffend)
- [ ] Einstellungen sind zugänglich und korrekt
- [ ] Die Überwachung überfälliger Sicherungen funktioniert korrekt
- [ ] Erfolgreich angemeldet (0.9.x+)
- [ ] Standard-Admin-Passwort geändert (0.9.x+)
- [ ] Benutzerkonten für andere Benutzer erstellt (0.9.x+)
- [ ] Externe API-Integrationen mit Authentifizierung aktualisiert (0.9.x+)

## Fehlerbehebung

### Migration schlägt fehl

1. Überprüfen Sie den Speicherplatz (Sicherung benötigt Speicherplatz)
2. Überprüfen Sie die Schreibberechtigungen im Datenverzeichnis
3. Überprüfen Sie Container-Protokolle auf spezifische Fehler
4. Stellen Sie bei Bedarf aus der Sicherung wieder her (siehe Rollback unten)

### Daten fehlen nach der Migration

1. Überprüfen Sie, ob die Sicherung erstellt wurde (überprüfen Sie das Datenverzeichnis)
2. Überprüfen Sie Container-Protokolle auf Sicherungserstellungsmeldungen
3. Überprüfen Sie die Integrität der Datenbankdatei

### Authentifizierungsprobleme (0.9.x+)

1. Überprüfen Sie, ob das Standard-Admin-Konto vorhanden ist (überprüfen Sie die Protokolle)
2. Versuchen Sie Standard-Anmeldedaten: `admin` / `Duplistatus09`
3. Verwenden Sie das Admin-Wiederherstellungstool, wenn Sie gesperrt sind
4. Überprüfen Sie, ob die `users`-Tabelle in der Datenbank vorhanden ist

### API-Fehler

1. Überprüfen Sie [API Breaking Changes](api-changes.md) auf Endpunkt-Updates
2. Aktualisieren Sie externe Integrationen mit neuen Feldnamen
3. Fügen Sie Authentifizierung zu API-Anfragen hinzu (0.9.x+)
4. Testen Sie API-Endpunkte nach der Migration

### Hauptschlüsselprobleme (0.8.x+)

1. Stellen Sie sicher, dass die Datei `.duplistatus.key` zugänglich ist
2. Überprüfen Sie, ob die Dateiberechtigungen 0400 sind
3. Überprüfen Sie Container-Protokolle auf Fehler bei der Schlüsselerzeugung

### Podman-DNS-Konfiguration

Wenn Sie Podman verwenden und nach dem Upgrade Probleme mit der Netzwerkkonnektivität haben, müssen Sie möglicherweise die DNS-Einstellungen für Ihren Container konfigurieren. Weitere Details finden Sie im Abschnitt [DNS-Konfiguration](../installation/installation.md#configuring-dns-for-podman-containers) im Installationsleitfaden.

## Rollback-Verfahren

Wenn Sie zu einer vorherigen Version zurückgehen müssen:

1. **Stoppen Sie den Container**: `docker stop <container-name>` (oder `podman stop <container-name>`)
2. **Finden Sie Ihre Sicherung**:
   - Wenn Sie eine Sicherung über die Weboberfläche erstellt haben (Version 1.2.1+), verwenden Sie diese heruntergeladene Sicherungsdatei
   - Wenn Sie eine manuelle Volume-Sicherung erstellt haben, extrahieren Sie diese zuerst
   - Automatische Migrations-Sicherungen befinden sich im Datenverzeichnis (Zeitstempel `.db`-Dateien)
3. **Stellen Sie die Datenbank wieder her**:
   - **Für Weboberflächen-Sicherungen (Version 1.2.1+)**: Verwenden Sie die Wiederherstellungsfunktion in `Einstellungen → Datenbankwartung` (siehe [Datenbankwartung](../user-guide/settings/database-maintenance.md#database-restore))
   - **Für manuelle Sicherungen**: Ersetzen Sie `backups.db` in Ihrem Datenverzeichnis/Volume durch die Sicherungsdatei
4. **Verwenden Sie die vorherige Image-Version**: Ziehen Sie das vorherige Container-Image und führen Sie es aus
5. **Starten Sie den Container**: Starten Sie mit der vorherigen Version

:::warning
Das Rollback kann zu Datenverlust führen, wenn das neuere Schema mit der älteren Version nicht kompatibel ist. Stellen Sie immer sicher, dass Sie eine aktuelle Sicherung haben, bevor Sie versuchen, ein Rollback durchzuführen.
:::

### Fehlerbehebung bei Ihrer Wiederherstellung / Rollback

Wenn die Anwendung nicht startet oder Ihre Daten nach einer Wiederherstellung oder einem Rollback nicht angezeigt werden, überprüfen Sie die folgenden häufigen Probleme:

#### 1. Datenbankdatei-Berechtigungen (Linux/Podman)

Wenn Sie die Datei als `root`-Benutzer wiederhergestellt haben, hat die Anwendung im Container möglicherweise keine Berechtigung zum Lesen oder Schreiben.

- **Das Symptom:** Protokolle zeigen "Permission Denied" oder "Read-only database".
- **Die Lösung:** Setzen Sie die Berechtigungen der Datei im Container zurück, um sicherzustellen, dass sie zugänglich ist.

```bash
# Eigentümerschaft festlegen (normalerweise UID 1000 oder der App-Benutzer)
docker exec -u 0 duplistatus chown 1000:1000 /app/data/backups.db
# Lese-/Schreibberechtigungen festlegen
docker exec -u 0 duplistatus chmod 664 /app/data/backups.db
```

#### 2. Falscher Dateiname

Die Anwendung sucht speziell nach einer Datei namens `backups.db`.

- **Das Symptom:** Die Anwendung startet, sieht aber "leer" aus (wie eine Neuinstallation).
- **Die Lösung:** Überprüfen Sie das Verzeichnis `/app/data/`. Wenn Ihre Datei `duplistatus-backup-2024.db` heißt oder eine `.sqlite`-Erweiterung hat, wird die App sie ignorieren. Verwenden Sie den `mv`-Befehl oder die Docker Desktop-GUI, um sie genau in `backups.db` umzubenennen.

#### 3. Container nicht neu gestartet

Auf einigen Systemen kann die Verwendung von `docker cp` während der Ausführung des Containers die "Aktualisierung" der Verbindung der Anwendung zur Datenbank nicht sofort durchführen.

- **Die Lösung:** Führen Sie nach einer Wiederherstellung immer einen vollständigen Neustart durch:

```bash
docker restart duplistatus
```

#### 4. Datenbankversion-Nichtübereinstimmung

Wenn Sie eine Sicherung aus einer viel neueren Version von duplistatus in eine ältere Version der App wiederherstellen, ist das Datenbankschema möglicherweise nicht kompatibel.

- **Die Lösung:** Stellen Sie immer sicher, dass Sie die gleiche (oder eine neuere) Version des duplistatus-Images ausführen wie die, die die Sicherung erstellt hat. Überprüfen Sie Ihre Version mit:

```bash
docker inspect duplistatus --format '{{.Config.Image}}'
```

## Datenbankschema-Versionen

| Anwendungsversion                                                                                                                                                                                 | Schema-Version                             | Wichtige Änderungen                                                 |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------- |
| 0.6.x und früher                                                                                                                                                  | v1.0                       | Anfängliches Schema                                                 |
| 0.7.x                                                                                                                                                             | v2.0, v3.0 | Konfigurationen hinzugefügt, machines → servers umbenannt           |
| 0.8.x                                                                                                                                                             | v3.1                       | Verbesserte Sicherungsfelder, Verschlüsselungsunterstützung         |
| 0.9.x, 1.0.x, 1.1.x, 1.2.x, 1.3.x | v4.0                       | Benutzerzugriffskontrolle, Authentifizierung, Audit-Protokollierung |

## Hilfe erhalten

- **Dokumentation**: [Benutzerhandbuch](../user-guide/overview.md)
- **API-Referenz**: [API-Dokumentation](../api-reference/overview.md)
- **API-Änderungen**: [API Breaking Changes](api-changes.md)
- **Versionshinweise**: Überprüfen Sie versionsspezifische Versionshinweise auf detaillierte Änderungen
- **Community**: [GitHub Discussions](https://github.com/wsj-br/duplistatus/discussions)
- **Probleme**: [GitHub Issues](https://github.com/wsj-br/duplistatus/issues)
