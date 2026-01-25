# API-Änderungen mit Kompatibilitätsbruch

Dieses Dokument beschreibt die Änderungen mit Kompatibilitätsbruch an externen API-Endpunkten in verschiedenen Versionen von duplistatus. Externe API-Endpunkte sind für die Verwendung durch andere Anwendungen und Integrationen konzipiert (z.B. Homepage-Integration).

## Überblick

Dieses Dokument behandelt Änderungen mit Kompatibilitätsbruch an externen API-Endpunkten, die Integrationen, Skripte und Anwendungen betreffen, die diese Endpunkte nutzen. Für interne API-Endpunkte, die von der Weboberfläche verwendet werden, werden Änderungen automatisch behandelt und erfordern keine manuellen Aktualisierungen.

:::note
Externe API-Endpunkte werden nach Möglichkeit abwärtskompatibel gehalten. Änderungen mit Kompatibilitätsbruch werden nur eingeführt, wenn sie für Konsistenz, Sicherheit oder Funktionsverbesserungen notwendig sind.
:::

## Versionsspezifische Änderungen

### Version 1.3.0

**Keine Änderungen mit Kompatibilitätsbruch an externen API-Endpunkten**

### Version 1.2.1

**Keine Änderungen mit Kompatibilitätsbruch an externen API-Endpunkten**


### Version 1.1.x

**Keine Änderungen mit Kompatibilitätsbruch an externen API-Endpunkten**

### Version 1.0.x

**Keine Änderungen mit Kompatibilitätsbruch an externen API-Endpunkten**


### Version 0.9.x

**Keine Änderungen mit Kompatibilitätsbruch an externen API-Endpunkten**

Version 0.9.x führt Authentifizierung ein und erfordert, dass sich alle Benutzer anmelden. Beim Upgrade von Version 0.8.x:

1. **Authentifizierung erforderlich**: Alle Seiten und internen API-Endpunkte erfordern jetzt Authentifizierung
2. **Standard-Admin-Konto**: Ein Standard-Admin-Konto wird automatisch erstellt:
   - Benutzername: `admin`
   - Passwort: `Duplistatus09` (muss bei der ersten Anmeldung geändert werden)
3. **Sitzungsinvalidierung**: Alle bestehenden Sitzungen werden ungültig
4. **Externer API-Zugriff**: Externe API-Endpunkte (`/api/summary`, `/api/lastbackup`, `/api/lastbackups`, `/api/upload`) bleiben für die Kompatibilität mit Integrationen und Duplicati unauthentifiziert

### Version 0.8.x

**Keine Änderungen mit Kompatibilitätsbruch an externen API-Endpunkten**

Version 0.8.x führt keine Änderungen mit Kompatibilitätsbruch an externen API-Endpunkten ein. Die folgenden Endpunkte bleiben unverändert:

- `/api/summary` - Antwortstruktur unverändert
- `/api/lastbackup/{serverId}` - Antwortstruktur unverändert
- `/api/lastbackups/{serverId}` - Antwortstruktur unverändert
- `/api/upload` - Anfrage-/Antwortformat unverändert

#### Sicherheitsverbesserungen

Obwohl keine Änderungen mit Kompatibilitätsbruch an externen API-Endpunkten vorgenommen wurden, enthält Version 0.8.x Sicherheitsverbesserungen:

- **CSRF-Schutz**: CSRF-Token-Validierung wird für zustandsändernde API-Anfragen erzwungen, aber externe APIs bleiben kompatibel
- **Passwortsicherheit**: Passwort-Endpunkte sind aus Sicherheitsgründen auf die Benutzeroberfläche beschränkt

:::note
Diese Sicherheitsverbesserungen betreffen keine externen API-Endpunkte, die zum Lesen von Backup-Daten verwendet werden. Wenn Sie benutzerdefinierte Skripte haben, die interne Endpunkte verwenden, benötigen diese möglicherweise CSRF-Token-Handling.
:::

### Version 0.7.x

Version 0.7.x führt mehrere Änderungen mit Kompatibilitätsbruch an externen API-Endpunkten ein, die Aktualisierungen an externen Integrationen erfordern.

#### Änderungen mit Kompatibilitätsbruch

##### Feldumbenennung

- **`totalMachines`** → **`totalServers`** im `/api/summary`-Endpunkt
- **`machine`** → **`server`** in API-Antwortobjekten
- **`backup_types_count`** → **`backup_jobs_count`** im `/api/lastbackups/{serverId}`-Endpunkt

##### Endpunkt-Pfadänderungen

- Alle API-Endpunkte, die zuvor `/api/machines/...` verwendeten, nutzen jetzt `/api/servers/...`
- Parameternamen wurden von `machine_id` zu `server_id` geändert (URL-Kodierung funktioniert weiterhin mit beiden)

#### Änderungen der Antwortstruktur

Die Antwortstruktur für mehrere Endpunkte wurde für Konsistenz aktualisiert:

##### `/api/summary`

**Vorher (0.6.x und früher):**
```json
{
  "totalMachines": 3,
  "totalBackupsRuns": 9,
  "totalBackups": 9,
  "totalUploadedSize": 2397229507,
  "totalStorageUsed": 43346796938,
  "totalBackupSize": 126089687807,
  "overdueBackupsCount": 2,
  "secondsSinceLastBackup": 7200
}
```

**Nachher (0.7.x+):**
```json
{
  "totalServers": 3,  // Geändert von "totalMachines"
  "totalBackupsRuns": 9,
  "totalBackups": 9,
  "totalUploadedSize": 2397229507,
  "totalStorageUsed": 43346796938,
  "totalBackupSize": 126089687807,
  "overdueBackupsCount": 2,
  "secondsSinceLastBackup": 7200
}
```

##### `/api/lastbackup/{serverId}`

**Vorher (0.6.x und früher):**
```json
{
  "machine": {  // Geändert zu "server"
    "id": "unique-server-id",
    "name": "Server Name",
    "backup_name": "Backup Name",
    "backup_id": "backup-id",
    "created_at": "2024-03-20T10:00:00Z"
  },
  "latest_backup": {
    // ... Backup-Details
  },
  "status": 200
}
```

**Nachher (0.7.x+):**
```json
{
  "server": {  // Geändert von "machine"
    "id": "unique-server-id",
    "name": "Server Name",
    "backup_name": "Backup Name",
    "backup_id": "backup-id",
    "created_at": "2024-03-20T10:00:00Z"
  },
  "latest_backup": {
    // ... Backup-Details
  },
  "status": 200
}
```

##### `/api/lastbackups/{serverId}`

**Vorher (0.6.x und früher):**
```json
{
  "machine": {  // Geändert zu "server"
    "id": "unique-server-id",
    "name": "Server Name",
    "backup_name": "Default Backup",
    "backup_id": "backup-id",
    "created_at": "2024-03-20T10:00:00Z"
  },
  "latest_backups": [
    // ... Backup-Array
  ],
  "backup_types_count": 2,  // Geändert zu "backup_jobs_count"
  "backup_names": ["Files", "Databases"],
  "status": 200
}
```

**Nachher (0.7.x+):**
```json
{
  "server": {  // Geändert von "machine"
    "id": "unique-server-id",
    "name": "Server Name",
    "backup_name": "Default Backup",
    "backup_id": "backup-id",
    "created_at": "2024-03-20T10:00:00Z"
  },
  "latest_backups": [
    // ... Backup-Array
  ],
  "backup_jobs_count": 2,  // Geändert von "backup_types_count"
  "backup_names": ["Files", "Databases"],
  "status": 200
}
```

## Migrationsschritte

Wenn Sie von einer Version vor 0.7.x upgraden, befolgen Sie diese Schritte:

1. **Feldreferenzen aktualisieren**: Ersetzen Sie alle Referenzen auf alte Feldnamen durch neue
   - `totalMachines` → `totalServers`
   - `backup_types_count` → `backup_jobs_count`

2. **Objektschlüssel aktualisieren**: Ändern Sie `machine` zu `server` beim Parsen von Antworten
   - Aktualisieren Sie jeden Code, der auf `response.machine` zugreift, zu `response.server`

3. **Endpunkt-Pfade aktualisieren**: Ändern Sie alle Endpunkte, die `/api/machines/...` verwenden, zu `/api/servers/...`
   - Hinweis: Parameter können weiterhin alte Bezeichner akzeptieren; Pfade sollten aktualisiert werden

4. **Integration testen**: Überprüfen Sie, ob Ihre Integration mit der neuen API-Struktur funktioniert
   - Testen Sie alle Endpunkte, die Ihre Anwendung verwendet
   - Überprüfen Sie, ob das Parsen von Antworten die neuen Feldnamen korrekt handhabt

5. **Dokumentation aktualisieren**: Aktualisieren Sie jede interne Dokumentation, die auf die alte API verweist
   - Aktualisieren Sie API-Beispiele und Feldnamenreferenzen

## Kompatibilität

### Abwärtskompatibilität

- **Version 1.2.1**: Vollständig abwärtskompatibel mit der 1.1.x API-Struktur
- **Version 1.1.x**: Vollständig abwärtskompatibel mit der 1.0.x API-Struktur
- **Version 1.0.x**: Vollständig abwärtskompatibel mit der 0.9.x API-Struktur
- **Version 0.9.x**: Vollständig abwärtskompatibel mit der 0.8.x API-Struktur
- **Version 0.8.x**: Vollständig abwärtskompatibel mit der 0.7.x API-Struktur
- **Version 0.7.x**: Nicht abwärtskompatibel mit Versionen vor 0.7.x
  - Alte Feldnamen funktionieren nicht
  - Alte Endpunkt-Pfade funktionieren nicht

### Zukünftige Unterstützung

- Alte Feldnamen aus Versionen vor 0.7.x werden nicht unterstützt
- Alte Endpunkt-Pfade aus Versionen vor 0.7.x werden nicht unterstützt
- Zukünftige Versionen werden die aktuelle API-Struktur beibehalten, es sei denn, Änderungen mit Kompatibilitätsbruch sind notwendig

## Zusammenfassung der externen API-Endpunkte

Die folgenden externen API-Endpunkte werden für Abwärtskompatibilität beibehalten und bleiben unauthentifiziert:

| Endpunkt | Methode | Beschreibung | Änderungen mit Kompatibilitätsbruch |
|----------|---------|--------------|-------------------------------------|
| `/api/summary` | GET | Gesamtübersicht der Backup-Operationen | 0.7.x: `totalMachines` → `totalServers` |
| `/api/lastbackup/{serverId}` | GET | Letztes Backup für einen Server | 0.7.x: `machine` → `server` |
| `/api/lastbackups/{serverId}` | GET | Letzte Backups für alle Backup-Jobs | 0.7.x: `machine` → `server`, `backup_types_count` → `backup_jobs_count` |
| `/api/upload` | POST | Backup-Daten von Duplicati hochladen | Keine Änderungen mit Kompatibilitätsbruch |

## Benötigen Sie Hilfe?

Wenn Sie Unterstützung bei der Aktualisierung Ihrer Integration benötigen:

- **API-Referenz**: Überprüfen Sie die [API-Referenz](../api-reference/overview.md) für aktuelle Endpunkt-Dokumentation
- **Externe APIs**: Siehe [Externe APIs](../api-reference/external-apis.md) für detaillierte Endpunkt-Dokumentation
- **Migrationsanleitung**: Lesen Sie die [Migrationsanleitung](version_upgrade.md) für allgemeine Migrationsinformationen
- **Versionshinweise**: Lesen Sie die versionsspezifischen [Versionshinweise](../release-notes/0.8.x.md) für zusätzlichen Kontext
- **Support**: Eröffnen Sie ein Issue auf [GitHub](https://github.com/wsj-br/duplistatus/issues) für Unterstützung
