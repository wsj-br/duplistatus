# Migrationsleitfaden

Dieser Leitfaden erklärt, wie Sie zwischen Versionen von duplistatus upgraden. Migrationen sind automatisch—das Datenbankschema aktualisiert sich selbst, wenn Sie eine neue Version starten.

Manuelle Schritte sind nur erforderlich, wenn Sie benutzerdefinierte Benachrichtigungsvorlagen haben (Version 0.8.x hat Vorlagenvariablen geändert) oder externe API-Integrationen, die aktualisiert werden müssen (Version 0.7.x hat API-Feldnamen geändert, Version 0.9.x erfordert Authentifizierung).

## Übersicht

duplistatus migriert Ihr Datenbankschema beim Upgrade automatisch. Das System:

1. Erstellt ein Backup Ihrer Datenbank vor Änderungen
2. Aktualisiert das Datenbankschema auf die neueste Version
3. Erhält alle vorhandenen Daten (Server, Backups, Konfiguration)
4. Verifiziert, dass die Migration erfolgreich abgeschlossen wurde



## Backup Ihrer Datenbank vor der Migration

Vor dem Upgrade auf eine neue Version wird empfohlen, ein Backup Ihrer Datenbank zu erstellen. Dies stellt sicher, dass Sie Ihre Daten wiederherstellen können, wenn während des Migrationsprozesses etwas schiefgeht.

### Wenn Sie Version 1.2.1 oder höher ausführen

Verwenden Sie die integrierte Datenbank-Backup-Funktion:

1. Navigieren Sie zu `Einstellungen → Datenbankwartung` in der Weboberfläche
2. Wählen Sie im Abschnitt **Datenbank-Backup** ein Backup-Format:
   - **Datenbankdatei (.db)**: Binärformat - schnellstes Backup, erhält die gesamte Datenbankstruktur exakt
   - **SQL-Dump (.sql)**: Textformat - menschenlesbare SQL-Anweisungen
3. Klicken Sie auf `Backup herunterladen`
4. Die Backup-Datei wird mit einem Zeitstempel-Dateinamen auf Ihren Computer heruntergeladen

Für weitere Details siehe die [Datenbankwartung](../user-guide/settings/database-maintenance.md#database-backup) Dokumentation.

### Wenn Sie eine Version vor 1.2.1 ausführen

#### Backup

Sie müssen die Datenbank manuell sichern, bevor Sie fortfahren. Die Datenbankdatei befindet sich unter `/app/data/backups.db` im Container.

##### Für Linux-Benutzer
Wenn Sie Linux verwenden, müssen Sie sich keine Sorgen über Hilfscontainer machen. Sie können den nativen `cp`-Befehl verwenden, um die Datenbank direkt vom laufenden Container auf Ihren Host zu extrahieren.

###### Mit Docker oder Podman:

```bash
# Ersetzen Sie 'duplistatus' durch Ihren tatsächlichen Containernamen, falls unterschiedlich
docker cp duplistatus:/app/data/backups.db ./duplistatus-backup-$(date +%Y%m%d).db
```
(Wenn Sie Podman verwenden, ersetzen Sie einfach `docker` durch `podman` im obigen Befehl.)

##### Für Windows-Benutzer
Wenn Sie Docker Desktop unter Windows ausführen, haben Sie zwei einfache Möglichkeiten, dies ohne die Befehlszeile zu handhaben:

###### Option A: Docker Desktop verwenden (Einfachste)
1. Öffnen Sie das Docker Desktop Dashboard.
2. Gehen Sie zum Tab Container und klicken Sie auf Ihren duplistatus-Container.
3. Klicken Sie auf den Tab Dateien.
4. Navigieren Sie zu `/app/data/`.
5. Rechtsklicken Sie auf `backups.db` und wählen Sie **Speichern unter...**, um es in Ihre Windows-Ordner herunterzuladen.

###### Option B: PowerShell verwenden
Wenn Sie das Terminal bevorzugen, können Sie PowerShell verwenden, um die Datei auf Ihren Desktop zu kopieren:

```powershell
docker cp duplistatus:/app/data/backups.db $HOME\Desktop\duplistatus-backup.db
```

##### Wenn Sie Bind Mounts verwenden
Wenn Sie Ihren Container ursprünglich mit einem Bind Mount eingerichtet haben (z. B. haben Sie einen lokalen Ordner wie `/opt/duplistatus` auf den Container gemappt), benötigen Sie überhaupt keine Docker-Befehle. Kopieren Sie einfach die Datei mit Ihrem Dateimanager:
- Linux: `cp /path/to/your/folder/backups.db ~/backups.db`
- Windows: Kopieren Sie einfach die Datei im **Datei-Explorer** aus dem Ordner, den Sie während der Einrichtung festgelegt haben.


#### Wiederherstellen Ihrer Daten
Wenn Sie Ihre Datenbank aus einem vorherigen Backup wiederherstellen müssen, befolgen Sie die folgenden Schritte basierend auf Ihrem Betriebssystem.

:::info[WICHTIG] 
Stoppen Sie den Container vor der Wiederherstellung der Datenbank, um Dateibeschädigungen zu vermeiden.
:::

##### Für Linux-Benutzer
Der einfachste Weg zur Wiederherstellung ist, die Backup-Datei zurück in den internen Speicherpfad des Containers zu "pushen".

###### Mit Docker oder Podman:

```bash
# Container stoppen
docker stop duplistatus

# Ersetzen Sie 'duplistatus-backup.db' durch Ihren tatsächlichen Backup-Dateinamen
docker cp ./duplistatus-backup.db duplistatus:/app/data/backups.db

# Container neu starten
docker start duplistatus
```

##### Für Windows-Benutzer
Wenn Sie Docker Desktop verwenden, können Sie die Wiederherstellung über die GUI oder PowerShell durchführen.

###### Option A: Docker Desktop verwenden (GUI)
1. Stellen Sie sicher, dass der duplistatus-Container läuft (Docker Desktop erfordert, dass der Container aktiv ist, um Dateien über die GUI hochzuladen).
2. Gehen Sie zum Tab Dateien in Ihren Containereinstellungen.
3. Navigieren Sie zu `/app/data/`.
4. Rechtsklicken Sie auf die vorhandene backups.db und wählen Sie Löschen.
5. Klicken Sie auf die Schaltfläche Importieren (oder rechtsklicken Sie im Ordnerbereich) und wählen Sie Ihre Backup-Datei von Ihrem Computer aus.

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
Wenn Sie einen lokalen Ordner verwenden, der auf den Container gemappt ist, benötigen Sie keine speziellen Befehle.

1. Stoppen Sie den Container.
2. Kopieren Sie Ihre Backup-Datei manuell in Ihren gemappten Ordner (z. B. `/opt/duplistatus` oder `C:\duplistatus_data`).
3. Stellen Sie sicher, dass die Datei genau `backups.db` heißt.
4. Starten Sie den Container.


:::note
Wenn Sie die Datenbank manuell wiederherstellen, können Sie auf Berechtigungsfehler stoßen. 

Überprüfen Sie die Container-Logs und passen Sie die Berechtigungen bei Bedarf an. Siehe den Abschnitt [Fehlerbehebung](#troubleshooting-your-restore--rollback) unten für weitere Informationen.
::: 

## Automatischer Migrationsprozess

Wenn Sie eine neue Version starten, laufen Migrationen automatisch:

1. **Backup-Erstellung**: Ein Backup mit Zeitstempel wird in Ihrem Datenverzeichnis erstellt
2. **Schema-Update**: Datenbanktabellen und -felder werden nach Bedarf aktualisiert
3. **Datenmigration**: Alle vorhandenen Daten werden erhalten und migriert
4. **Verifizierung**: Der Migrationserfolg wird protokolliert

### Migration überwachen

Überprüfen Sie Docker-Logs, um den Migrationsfortschritt zu überwachen:

```bash
docker logs <container-name>
```

Suchen Sie nach Nachrichten wie:
- `"Found X pending migrations"`
- `"Running consolidated migration X.0..."`
- `"Migration X.0 completed successfully"`
- `"Database backup created: /path/to/backups-copy-YYYY-MM-DDTHH-MM-SS.db"`
- `"All migrations completed successfully"`

## Versionsspezifische Migrationshinweise

### Upgrade auf Version 0.9.x oder höher (Schema v4.0)

:::warning
**Authentifizierung ist jetzt erforderlich.** Alle Benutzer müssen sich nach dem Upgrade anmelden.
:::

#### Was sich automatisch ändert

- Datenbankschema migriert von v3.1 zu v4.0
- Neue Tabellen erstellt: `users`, `sessions`, `audit_log`
- Standard-Admin-Konto automatisch erstellt
- Alle vorhandenen Sitzungen ungültig

#### Was Sie tun müssen

1. **Anmelden** mit Standard-Admin-Anmeldedaten:
   - Benutzername: `admin`
   - Passwort: `Duplistatus09`
2. **Passwort ändern**, wenn dazu aufgefordert (erforderlich bei erster Anmeldung)
3. **Benutzerkonten erstellen** für andere Benutzer (Einstellungen → Benutzer)
4. **Externe API-Integrationen aktualisieren**, um Authentifizierung einzuschließen (siehe [API Breaking Changes](api-changes.md))
5. **Audit-Log-Aufbewahrung konfigurieren**, falls erforderlich (Einstellungen → Audit-Log)

#### Wenn Sie ausgesperrt sind

Verwenden Sie das Admin-Wiederherstellungstool:

```bash
docker exec -it duplistatus /app/admin-recovery admin NewPassword123
```

Siehe [Admin-Wiederherstellungsleitfaden](../user-guide/admin-recovery.md) für Details.

### Upgrade auf Version 0.8.x

#### Was sich automatisch ändert

- Datenbankschema auf v3.1 aktualisiert
- Hauptschlüssel für Verschlüsselung generiert (gespeichert in `.duplistatus.key`)
- Sitzungen ungültig (neue CSRF-geschützte Sitzungen erstellt)
- Passwörter mit neuem System verschlüsselt

#### Was Sie tun müssen

1. **Benachrichtigungsvorlagen aktualisieren**, wenn Sie sie angepasst haben:
   - Ersetzen Sie `{backup_interval_value}` und `{backup_interval_type}` durch `{backup_interval}`
   - Standardvorlagen werden automatisch aktualisiert

#### Sicherheitshinweise

- Stellen Sie sicher, dass die `.duplistatus.key`-Datei gesichert ist (hat 0400-Berechtigungen)
- Sitzungen laufen nach 24 Stunden ab

### Upgrade auf Version 0.7.x

#### Was sich automatisch ändert

- `machines`-Tabelle umbenannt in `servers`
- `machine_id`-Felder umbenannt in `server_id`
- Neue Felder hinzugefügt: `alias`, `notes`, `created_at`, `updated_at`

#### Was Sie tun müssen

1. **Externe API-Integrationen aktualisieren**:
   - Ändern Sie `totalMachines` → `totalServers` in `/api/summary`
   - Ändern Sie `machine` → `server` in API-Antwortobjekten
   - Ändern Sie `backup_types_count` → `backup_jobs_count` in `/api/lastbackups/{serverId}`
   - Aktualisieren Sie Endpunkt-Pfade von `/api/machines/...` zu `/api/servers/...`
2. **Benachrichtigungsvorlagen aktualisieren**:
   - Ersetzen Sie `{machine_name}` durch `{server_name}`

Siehe [API Breaking Changes](api-changes.md) für detaillierte API-Migrationsschritte.

## Checkliste nach der Migration

Nach dem Upgrade überprüfen Sie:

- [ ] Alle Server erscheinen korrekt im Dashboard
- [ ] Backup-Verlauf ist vollständig und zugänglich
- [ ] Benachrichtigungen funktionieren (NTFY/E-Mail testen)
- [ ] Externe API-Integrationen funktionieren (falls zutreffend)
- [ ] Einstellungen sind zugänglich und korrekt
- [ ] Überfällige Überwachung funktioniert korrekt
- [ ] Erfolgreich angemeldet (0.9.x+)
- [ ] Standard-Admin-Passwort geändert (0.9.x+)
- [ ] Benutzerkonten für andere Benutzer erstellt (0.9.x+)
- [ ] Externe API-Integrationen mit Authentifizierung aktualisiert (0.9.x+)

## Fehlerbehebung

### Migration schlägt fehl

1. Überprüfen Sie den Festplattenspeicher (Backup erfordert Speicherplatz)
2. Überprüfen Sie Schreibberechtigungen im Datenverzeichnis
3. Überprüfen Sie Container-Logs auf spezifische Fehler
4. Wiederherstellen aus Backup bei Bedarf (siehe Rollback unten)

### Daten fehlen nach Migration

1. Überprüfen Sie, ob Backup erstellt wurde (Datenverzeichnis überprüfen)
2. Überprüfen Sie Container-Logs auf Backup-Erstellungsnachrichten
3. Überprüfen Sie die Integrität der Datenbankdatei

### Authentifizierungsprobleme (0.9.x+)

1. Überprüfen Sie, ob Standard-Admin-Konto existiert (Logs überprüfen)
2. Versuchen Sie Standard-Anmeldedaten: `admin` / `Duplistatus09`
3. Verwenden Sie Admin-Wiederherstellungstool, wenn ausgesperrt
4. Überprüfen Sie, ob `users`-Tabelle in der Datenbank existiert

### API-Fehler

1. Überprüfen Sie [API Breaking Changes](api-changes.md) für Endpunkt-Updates
2. Aktualisieren Sie externe Integrationen mit neuen Feldnamen
3. Authentifizierung zu API-Anfragen hinzufügen (0.9.x+)
4. API-Endpunkte nach Migration testen

### Hauptschlüssel-Probleme (0.8.x+)

1. Stellen Sie sicher, dass die `.duplistatus.key`-Datei zugänglich ist
2. Überprüfen Sie, ob Dateiberechtigungen 0400 sind
3. Überprüfen Sie Container-Logs auf Schlüsselgenerierungsfehler

### Podman DNS-Konfiguration

Wenn Sie Podman verwenden und nach dem Upgrade Netzwerkverbindungsprobleme haben, müssen Sie möglicherweise DNS-Einstellungen für Ihren Container konfigurieren. Siehe den [DNS-Konfigurationsabschnitt](../installation/installation.md#configuring-dns-for-podman-containers) im Installationsleitfaden für Details.

## Rollback-Prozedur

Wenn Sie auf eine vorherige Version zurücksetzen müssen:

1. **Container stoppen**: `docker stop <container-name>` (oder `podman stop <container-name>`)
2. **Backup finden**: 
   - Wenn Sie ein Backup über die Weboberfläche erstellt haben (Version 1.2.1+), verwenden Sie diese heruntergeladene Backup-Datei
   - Wenn Sie ein manuelles Volume-Backup erstellt haben, extrahieren Sie es zuerst
   - Automatische Migrations-Backups befinden sich im Datenverzeichnis (mit Zeitstempel versehene `.db`-Dateien)
3. **Datenbank wiederherstellen**: 
   - **Für Weboberflächen-Backups (Version 1.2.1+)**: Verwenden Sie die Wiederherstellungsfunktion in `Einstellungen → Datenbankwartung` (siehe [Datenbankwartung](../user-guide/settings/database-maintenance.md#database-restore))
   - **Für manuelle Backups**: Ersetzen Sie `backups.db` in Ihrem Datenverzeichnis/Volume durch die Backup-Datei
4. **Vorherige Image-Version verwenden**: Vorheriges Container-Image abrufen und ausführen
5. **Container starten**: Mit der vorherigen Version starten

:::warning
Ein Rollback kann zu Datenverlust führen, wenn das neuere Schema mit der älteren Version inkompatibel ist. Stellen Sie immer sicher, dass Sie ein aktuelles Backup haben, bevor Sie einen Rollback versuchen.
:::

### Fehlerbehebung bei Wiederherstellung / Rollback

Wenn die Anwendung nicht startet oder Ihre Daten nach einer Wiederherstellung oder einem Rollback nicht erscheinen, überprüfen Sie die folgenden häufigen Probleme:

#### 1. Datenbankdateiberechtigungen (Linux/Podman)

Wenn Sie die Datei als `root`-Benutzer wiederhergestellt haben, hat die Anwendung im Container möglicherweise keine Berechtigung, darauf zuzugreifen oder sie zu schreiben.

* **Das Symptom:** Logs zeigen "Permission Denied" oder "Read-only database."
* **Die Lösung:** Setzen Sie die Berechtigungen der Datei im Container zurück, um sicherzustellen, dass sie zugänglich ist.

```bash
# Eigentümer setzen (normalerweise UID 1000 oder der App-Benutzer)
docker exec -u 0 duplistatus chown 1000:1000 /app/data/backups.db
# Lese-/Schreibberechtigungen setzen
docker exec -u 0 duplistatus chmod 664 /app/data/backups.db
```



#### 2. Falscher Dateiname

Die Anwendung sucht speziell nach einer Datei namens `backups.db`.

* **Das Symptom:** Die Anwendung startet, sieht aber "leer" aus (wie eine frische Installation).
* **Die Lösung:** Überprüfen Sie das Verzeichnis `/app/data/`. Wenn Ihre Datei `duplistatus-backup-2024.db` heißt oder eine `.sqlite`-Erweiterung hat, wird die App sie ignorieren. Verwenden Sie den `mv`-Befehl oder die Docker Desktop GUI, um sie genau in `backups.db` umzubenennen.

#### 3. Container nicht neu gestartet

Auf einigen Systemen aktualisiert die Verwendung von `docker cp` während der Container läuft möglicherweise nicht sofort die Verbindung der Anwendung zur Datenbank.

* **Die Lösung:** Führen Sie nach einer Wiederherstellung immer einen vollständigen Neustart durch:
```bash
docker restart duplistatus
```



#### 4. Datenbankversions-Konflikt

Wenn Sie ein Backup aus einer viel neueren Version von duplistatus in eine ältere Version der App wiederherstellen, könnte das Datenbankschema inkompatibel sein.

* **Die Lösung:** Stellen Sie immer sicher, dass Sie die gleiche (oder eine neuere) Version des duplistatus-Images ausführen wie die, die das Backup erstellt hat. Überprüfen Sie Ihre Version mit:
```bash
docker inspect duplistatus --format '{{.Config.Image}}'
```


## Datenbankschema-Versionen

| Anwendungsversion        | Schema-Version | Wichtige Änderungen                                        |
|--------------------------|----------------|------------------------------------------------------------|
| 0.6.x und früher          | v1.0           | Initiales Schema                                           |
| 0.7.x                      | v2.0, v3.0     | Konfigurationen hinzugefügt, machines → servers umbenannt |
| 0.8.x                      | v3.1           | Erweiterte Backup-Felder, Verschlüsselungsunterstützung   |
| 0.9.x, 1.0.x, 1.1.x, 1.2.x, 1.3.x | v4.0           | Benutzerzugriffskontrolle, Authentifizierung, Audit-Protokollierung |

## Hilfe erhalten

- **Dokumentation**: [Benutzerhandbuch](../user-guide/overview.md)
- **API-Referenz**: [API-Dokumentation](../api-reference/overview.md)
- **API-Änderungen**: [API Breaking Changes](api-changes.md)
- **Release Notes**: Überprüfen Sie versionsspezifische Release Notes für detaillierte Änderungen
- **Community**: [GitHub Discussions](https://github.com/wsj-br/duplistatus/discussions)
- **Issues**: [GitHub Issues](https://github.com/wsj-br/duplistatus/issues)
