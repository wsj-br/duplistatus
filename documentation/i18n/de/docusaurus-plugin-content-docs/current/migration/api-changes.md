# Rückwärtsinkompatible API-Änderungen {/* #backward-incompatible-api-changes */}

Dieses Dokument beschreibt rückwärtsinkompatible Änderungen an externen API-Endpunkten in verschiedenen Versionen von duplistatus. Externe API-Endpunkte sind solche, die für die Verwendung durch andere Anwendungen und Integrationen (z. B. Homepage-Integration) entwickelt wurden.

## Übersicht {/* #overview */}

Dieses Dokument deckt rückwärtsinkompatible Änderungen an externen API-Endpunkten ab, die Integrationen, Skripte und Anwendungen beeinflussen, die diese Endpunkte nutzen. Für interne API-Endpunkte, die von der Weboberfläche verwendet werden, werden Änderungen automatisch behandelt und erfordern keine manuellen Updates.

:::note
Externe API-Endpunkte werden soweit möglich für die Rückwärtskompatibilität beibehalten. Rückwärtsinkompatible Änderungen werden nur dann eingeführt, wenn sie für Konsistenz, Sicherheit oder Funktionsverbesserungen notwendig sind.
:::

## Versionsspezifische Änderungen {/* #version-specific-changes */}

### Version 1.3.0 {/* #version-130 */}

**Keine Rückwärtsinkompatibilität bei externen API-Endpunkten**

### Version 1.2.1 {/* #version-121 */}

**Keine Rückwärtsinkompatibilität bei externen API-Endpunkten**

### Version 1.1.x {/* #version-11x */}

**Keine Rückwärtsinkompatibilität bei externen API-Endpunkten**

### Version 1.0.x {/* #version-10x */}

**Keine Rückwärtsinkompatibilität bei externen API-Endpunkten**

### Version 0.9.x {/* #version-09x */}

**Keine Rückwärtsinkompatibilität bei externen API-Endpunkten**

Version 0.9.x führt Authentifizierung ein und erfordert, dass sich alle Benutzer anmelden. Beim Upgrade von Version 0.8.x:

1. **Authentifizierung erforderlich**: Alle Seiten und interne API-Endpunkte erfordern nun Authentifizierung
2. **Standard-Admin-Konto**: Ein Standard-Admin-Konto wird automatisch erstellt:
   - Benutzername: `admin`
   - Passwort: `Duplistatus09` (muss beim ersten Anmelden geändert werden)
3. **Sitzungsinvalidierung**: Alle bestehenden Sitzungen werden ungültig gemacht
4. **Externer API-Zugriff**: Externe API-Endpunkte (`/api/summary`, `/api/lastbackup`, `/api/lastbackups`, `/api/upload`) bleiben für die Kompatibilität mit Integrationen und Duplicati unauthentifiziert

### Version 0.8.x {/* #version-08x */}

**Keine Rückwärtsinkompatibilität bei externen API-Endpunkten**

Version 0.8.x führt keine breaking changes zu externen API-Endpunkten ein. Die folgenden Endpunkte sind unverändert geblieben:

- `/api/summary` - Antwortstruktur unverändert
- `/api/lastbackup/{serverId}` - Antwortstruktur unverändert
- `/api/lastbackups/{serverId}` - Antwortstruktur unverändert
- `/api/upload` - Anforderungs-/Antwortformat unverändert

#### Sicherheitsverbesserungen {/* #security-enhancements */}

Obwohl keine breaking changes zu externen API-Endpunkten vorgenommen wurden, enthält Version 0.8.x Sicherheitsverbesserungen:

- **CSRF-Schutz**: CSRF-Token-Validierung wird für API-Anfragen mit Zustandsänderung erzwungen, aber externe APIs bleiben kompatibel
- **Passwortsicherheit**: Passwort-Endpunkte sind aus Sicherheitsgründen auf die Benutzeroberfläche beschränkt

:::note
Diese Sicherheitsverbesserungen beeinflussen externe API-Endpunkte nicht, die zum Lesen von Sicherungsdaten verwendet werden. Wenn Sie benutzerdefinierte Skripte mit internen Endpunkten verwenden, müssen Sie möglicherweise die CSRF-Token-Verarbeitung berücksichtigen.
:::

### Version 0.7.x {/* #version-07x */}

Version 0.7.x führt mehrere breaking changes zu externen API-Endpunkten ein, die Updates für externe Integrationen erfordern.

#### Breaking Changes {/* #breaking-changes */}

##### Feldumbenennung {/* #field-renaming */}

- `totalMachines` → `totalServers` im `/api/summary`-Endpunkt
- `machine` → `server` in API-Antwortobjekten
- `backup_types_count` → `backup_jobs_count` im `/api/lastbackups/{serverId}`-Endpunkt

##### Änderungen der Endpunktpfade {/* #endpoint-path-changes */}

- Alle API-Endpunkte, die zuvor `/api/machines/...` verwendet haben, verwenden jetzt `/api/servers/...`
- Parameternamen wurden von `machine_id` auf `server_id` geändert (URL-Codierung funktioniert weiterhin mit beiden)

#### Änderungen der Antwortstruktur {/* #response-structure-changes */}

Die Antwortstruktur für mehrere Endpunkte wurde für Konsistenz aktualisiert:

##### `/api/summary` {/* #apisummary */}

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

**Nach (0.7.x+):**

```json
{
  "totalServers": 3,  // Changed from "totalMachines"
  "totalBackupsRuns": 9,
  "totalBackups": 9,
  "totalUploadedSize": 2397229507,
  "totalStorageUsed": 43346796938,
  "totalBackupSize": 126089687807,
  "overdueBackupsCount": 2,
  "secondsSinceLastBackup": 7200
}
```

##### `/api/lastbackup/{serverId}` {/* #apilastbackupserverid */}

**Vorher (0.6.x und früher):**

```json
{
  "machine": {  // Changed to "server"
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

**Nach (0.7.x+):**

```json
{
  "server": {  // Changed from "machine"
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

##### `/api/lastbackups/{serverId}` {/* #apilastbackupsserverid */}

**Vorher (0.6.x und früher):**

```json
{
  "machine": {  // Changed to "server"
    "id": "unique-server-id",
    "name": "Server Name",
    "backup_name": "Default Backup",
    "backup_id": "backup-id",
    "created_at": "2024-03-20T10:00:00Z"
  },
  "latest_backups": [
    // ... backup array
  ],
  "backup_types_count": 2,  // Changed to "backup_jobs_count"
  "backup_names": ["Files", "Databases"],
  "status": 200
}
```

**Nach (0.7.x+):**

```json
{
  "server": {  // Changed from "machine"
    "id": "unique-server-id",
    "name": "Server Name",
    "backup_name": "Default Backup",
    "backup_id": "backup-id",
    "created_at": "2024-03-20T10:00:00Z"
  },
  "latest_backups": [
    // ... backup array
  ],
  "backup_jobs_count": 2,  // Changed from "backup_types_count"
  "backup_names": ["Files", "Databases"],
  "status": 200
}
```

## Migrationsschritte {/* #migration-steps */}

Wenn Sie von einer Version vor 0.7.x aktualisieren, befolgen Sie diese Schritte:

1. **Feldreferenzen aktualisieren**: Ersetzen Sie alle Verweise auf alte Feldnamen durch neue
   - `totalMachines` → `totalServers`
   - `backup_types_count` → `backup_jobs_count`

2. **Objektschlüssel aktualisieren**: Ändern Sie `machine` zu `server` in der Antwortanalyse
   - Aktualisieren Sie alle Code, der auf `response.machine` zugreift, zu `response.server`

3. **Endpunktpfade aktualisieren**: Ändern Sie alle Endpunkte, die `/api/machines/...` verwenden, zu `/api/servers/...`
   - Hinweis: Parameter können weiterhin alte Bezeichner akzeptieren; Pfade sollten aktualisiert werden

4. **Integration testen**: Überprüfen Sie, ob Ihre Integration mit der neuen API-Struktur funktioniert
   - Testen Sie alle Endpunkte, die Ihre Anwendung verwendet
   - Überprüfen Sie, ob die Antwortanalyse die neuen Feldnamen korrekt behandelt

5. **Dokumentation aktualisieren**: Aktualisieren Sie alle interne Dokumentation, die auf die alte API verweist
   - Aktualisieren Sie API-Beispiele und Feldnamenverweise

## Kompatibilität {/* #compatibility */}

### Rückwärtskompatibilität {/* #backward-compatibility */}

- **Version 1.2.1**: Vollständig rückwärtskompatibel mit der 1.1.x API-Struktur
- **Version 1.1.x**: Vollständig rückwärtskompatibel mit der 1.0.x API-Struktur
- **Version 1.0.x**: Vollständig rückwärtskompatibel mit der 0.9.x API-Struktur
- **Version 0.9.x**: Vollständig rückwärtskompatibel mit der 0.8.x API-Struktur
- **Version 0.8.x**: Vollständig rückwärtskompatibel mit der 0.7.x API-Struktur
- **Version 0.7.x**: Nicht rückwärtskompatibel mit Versionen vor 0.7.x
  - Alte Feldnamen funktionieren nicht
  - Alte Endpunktpfade funktionieren nicht

### Zukünftige Unterstützung {/* #future-support */}

- Alte Feldnamen aus Versionen vor 0.7.x werden nicht unterstützt
- Alte Endpunktpfade aus Versionen vor 0.7.x werden nicht unterstützt
- zukünftige Versionen werden die aktuelle API-Struktur beibehalten, es sei denn, es sind Änderungen erforderlich

## Zusammenfassung der externen API-Endpunkte {/* #summary-of-external-api-endpoints */}

Die folgenden externen API-Endpunkte werden für die Rückwärtskompatibilität beibehalten und bleiben unbestätigt:

| Endpunkt | Methode | Beschreibung | Breaking Changes |
|----------|--------|-------------|------------------|
| `/api/summary` | GET | Zusammenfassung aller Sicherungsoperationen | 0.7.x: `totalMachines` → `totalServers` |
| `/api/lastbackup/{serverId}` | GET | Letzte Sicherung für einen Server | 0.7.x: `machine` → `server` |
| `/api/lastbackups/{serverId}` | GET | Letzte Sicherungen für alle Sicherungsjobs | 0.7.x: `machine` → `server`, `backup_types_count` → `backup_jobs_count` |
| `/api/upload` | POST | Sicherungsdaten von Duplicati hochladen | Keine breaking changes |

## Brauchen Sie Hilfe? {/* #need-help */}

Wenn Sie bei der Aktualisierung Ihrer Integration Unterstützung benötigen:

- **API-Referenz**: Prüfen Sie die [API-Referenz](../api-reference/overview.md) für die aktuelle Endpunktdokumentation
- **Externe APIs**: Siehe [Externe APIs](../api-reference/external-apis.md) für detaillierte Endpunktdokumentation
- **Migrationsanleitung**: Überprüfen Sie die [Migrationsanleitung](version_upgrade.md) für allgemeine Migrationsinformationen
- **Versionshinweise**: Überprüfen Sie die versionsspezifischen [Versionshinweise](../release-notes/0.8.x.md) für zusätzlichen Kontext
- **Support**: Öffnen Sie ein Issue auf [GitHub](https://github.com/wsj-br/duplistatus/issues) für Support
