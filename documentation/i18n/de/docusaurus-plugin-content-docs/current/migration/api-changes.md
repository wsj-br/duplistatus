# API-Änderungen

Dieses Dokument beschreibt Änderungen von externen API-Endpunkten in verschiedenen Versionen von duplistatus. Externe API-Endpunkte sind solche, die für die Verwendung durch andere Anwendungen und Integrationen konzipiert sind (z. B. Homepage-Integration).

## Übersicht

Dieses Dokument behandelt Änderungen von externen API-Endpunkten, die Integrationen, Skripte und Anwendungen beeinflussen, die diese Endpunkte nutzen. Für interne API-Endpunkte, die von der Weboberfläche verwendet werden, werden Änderungen automatisch verarbeitet und erfordern keine manuellen Aktualisierungen.

:::note
Externe API-Endpunkte werden zur Rückwärtskompatibilität beibehalten, wenn möglich. Änderungen werden nur eingeführt, wenn dies für Konsistenz, Sicherheit oder Funktionsverbesserungen erforderlich ist.
:::

## Versionsspezifische Änderungen

### Version 1.3.0

**Keine Änderungen an externen API-Endpunkten**

### Version 1.2.1

**Keine Änderungen an externen API-Endpunkten**

### Version 1.1.x

**Keine Änderungen an externen API-Endpunkten**

### Version 1.0.x

**Keine Änderungen an externen API-Endpunkten**

### Version 0.9.x

**Keine Änderungen an externen API-Endpunkten**

Version 0.9.x führt Authentifizierung ein und erfordert, dass sich alle Benutzer anmelden. Beim Upgrade von Version 0.8.x:

1. **Authentifizierung erforderlich**: Alle Seiten und internen API-Endpunkte erfordern jetzt Authentifizierung
2. **Standard-Admin-Konto**: Ein Standard-Admin-Konto wird automatisch erstellt:
   - Benutzername: `admin`
   - Passwort: `Duplistatus09` (muss bei der ersten Anmeldung geändert werden)
3. **Sitzungsungültigmachung**: Alle vorhandenen Sitzungen werden ungültig gemacht
4. **Externer API-Zugriff**: Externe API-Endpunkte (`/api/summary`, `/api/lastbackup`, `/api/lastbackups`, `/api/upload`) bleiben unauthentifiziert für Kompatibilität mit Integrationen und Duplicati

### Version 0.8.x

**Keine Änderungen an externen API-Endpunkten**

Version 0.8.x führt keine Änderungen an externen API-Endpunkten ein. Die folgenden Endpunkte bleiben unverändert:

- `/api/summary` - Antwortstruktur unverändert
- `/api/lastbackup/{serverId}` - Antwortstruktur unverändert
- `/api/lastbackups/{serverId}` - Antwortstruktur unverändert
- `/api/upload` - Anfrage-/Antwortformat unverändert

#### Sicherheitsverbesserungen

Obwohl keine Änderungen an externen API-Endpunkten vorgenommen wurden, enthält Version 0.8.x Sicherheitsverbesserungen:

- **CSRF-Schutz**: CSRF-Token-Validierung wird für zustandsändernde API-Anfragen erzwungen, aber externe APIs bleiben kompatibel
- **Passwort-Sicherheit**: Passwort-Endpunkte sind aus Sicherheitsgründen auf die Benutzeroberfläche beschränkt

:::note
Diese Sicherheitsverbesserungen beeinflussen nicht die externen API-Endpunkte, die zum Lesen von Sicherungsdaten verwendet werden. Wenn Sie benutzerdefinierte Skripte verwenden, die interne Endpunkte nutzen, müssen diese möglicherweise CSRF-Token-Verarbeitung durchführen.
:::

### Version 0.7.x

Version 0.7.x führt mehrere Änderungen an externen API-Endpunkten ein, die Aktualisierungen an externen Integrationen erfordern.

#### Änderungen

##### Feldumbenennung

- **`totalMachines`** → **`totalServers`** im `/api/summary`-Endpunkt
- **`machine`** → **`server`** in API-Antwortobjekten
- **`backup_types_count`** → **`backup_jobs_count`** im `/api/lastbackups/{serverId}`-Endpunkt

##### Endpunkt-Pfad-Änderungen

- Alle API-Endpunkte, die zuvor `/api/machines/...` verwendeten, verwenden jetzt `/api/servers/...`
- Parameternamen wurden von `machine_id` zu `server_id` geändert (URL-Codierung funktioniert immer noch mit beiden)

#### Antwortstruktur-Änderungen

Die Antwortstruktur für mehrere Endpunkte wurde zur Konsistenz aktualisiert:

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
    // ... backup details
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
    // ... backup details
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
    // ... backup array
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
    // ... backup array
  ],
  "backup_jobs_count": 2,  // Geändert von "backup_types_count"
  "backup_names": ["Files", "Databases"],
  "status": 200
}
```

## Migrationschritte

Wenn Sie ein Upgrade von einer Version vor 0.7.x durchführen, führen Sie diese Schritte aus:

1. **Feldverweise aktualisieren**: Ersetzen Sie alle Verweise auf alte Feldnamen durch neue
   - `totalMachines` → `totalServers`
   - `backup_types_count` → `backup_jobs_count`

2. **Objektschlüssel aktualisieren**: Ändern Sie `machine` zu `server` in der Antwortanalyse
   - Aktualisieren Sie jeden Code, der auf `response.machine` zugreift, zu `response.server`

3. **Endpunkt-Pfade aktualisieren**: Ändern Sie alle Endpunkte, die `/api/machines/...` verwenden, zu `/api/servers/...`
   - Hinweis: Parameter können immer noch alte Bezeichner akzeptieren; Pfade sollten aktualisiert werden

4. **Integration testen**: Überprüfen Sie, dass Ihre Integration mit der neuen API-Struktur funktioniert
   - Testen Sie alle Endpunkte, die Ihre Anwendung verwendet
   - Überprüfen Sie, dass die Antwortanalyse neue Feldnamen korrekt verarbeitet

5. **Dokumentation aktualisieren**: Aktualisieren Sie alle internen Dokumentationen, die auf die alte API verweisen
   - Aktualisieren Sie API-Beispiele und Feldnamenverweise

## Kompatibilität

### Rückwärtskompatibilität

- **Version 1.2.1**: Vollständig rückwärtskompatibel mit 1.1.x API-Struktur
- **Version 1.1.x**: Vollständig rückwärtskompatibel mit 1.0.x API-Struktur
- **Version 1.0.x**: Vollständig rückwärtskompatibel mit 0.9.x API-Struktur
- **Version 0.9.x**: Vollständig rückwärtskompatibel mit 0.8.x API-Struktur
- **Version 0.8.x**: Vollständig rückwärtskompatibel mit 0.7.x API-Struktur
- **Version 0.7.x**: Nicht rückwärtskompatibel mit Versionen vor 0.7.x
  - Alte Feldnamen funktionieren nicht
  - Alte Endpunkt-Pfade funktionieren nicht

### Zukünftige Unterstützung

- Alte Feldnamen von Versionen vor 0.7.x werden nicht unterstützt
- Alte Endpunkt-Pfade von Versionen vor 0.7.x werden nicht unterstützt
- Zukünftige Versionen werden die aktuelle API-Struktur beibehalten, es sei denn, Änderungen sind erforderlich

## Zusammenfassung der externen API-Endpunkte

Die folgenden externen API-Endpunkte werden zur Rückwärtskompatibilität beibehalten und bleiben unauthentifiziert:

| Endpunkt                      | Methode | Beschreibung                                   | Änderungen                                                                                                              |
| ----------------------------- | ------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `/api/summary`                | GET     | Gesamtzusammenfassung von Sicherungsvorgängen  | 0.7.x: `totalMachines` → `totalServers`                                 |
| `/api/lastbackup/{serverId}`  | GET     | Letzte Sicherung für einen Server              | 0.7.x: `machine` → `server`                                             |
| `/api/lastbackups/{serverId}` | GET     | Letzte Sicherungen für alle Sicherungsaufträge | 0.7.x: `machine` → `server`, `backup_types_count` → `backup_jobs_count` |
| `/api/upload`                 | POST    | Sicherungsdaten von Duplicati hochladen        | Keine Änderungen                                                                                                        |

## Benötigen Sie Hilfe? {#need-help}

Wenn Sie Hilfe beim Aktualisieren Ihrer Integration benötigen:

- **API-Referenz**: Überprüfen Sie die [API-Referenz](../api-reference/overview.md) für aktuelle Endpunkt-Dokumentation
- **Externe APIs**: Siehe [Externe APIs](../api-reference/external-apis.md) für detaillierte Endpunkt-Dokumentation
- **Migrationsleitfaden**: Überprüfen Sie den [Migrationsleitfaden](version_upgrade.md) für allgemeine Migrationsinformationen
- **Versionshinweise**: Überprüfen Sie versionsspezifische [Versionshinweise](../release-notes/0.8.x.md) für zusätzlichen Kontext
- **Unterstützung**: Öffnen Sie ein Problem auf [GitHub](https://github.com/wsj-br/duplistatus/issues) für Unterstützung
