---
translation_last_updated: '2026-01-31T00:51:25.963Z'
source_file_mtime: '2026-01-27T14:22:06.834Z'
source_file_hash: 42ca049a94e01f4c
translation_language: de
source_file_path: migration/api-changes.md
---
# API-Änderungen mit Auswirkungen {#api-breaking-changes}

Dieses Dokument beschreibt grundlegende Änderungen an externen API-Endpunkten in verschiedenen Versionen von duplistatus. Externe API-Endpunkte sind solche, die für die Verwendung durch andere Anwendungen und Integrationen konzipiert sind (z. B. Homepage-Integration).

## Übersicht {#overview}

Dieses Dokument behandelt Breaking Changes bei externen API-Endpunkten, die Integrationen, Skripte und Anwendungen beeinflussen, die diese Endpunkte nutzen. Für interne API-Endpunkte, die von der Weboberfläche verwendet werden, werden Änderungen automatisch verarbeitet und erfordern keine manuellen Aktualisierungen.

:::note
Externe API-Endpunkte werden nach Möglichkeit zur Gewährleistung der Rückwärtskompatibilität beibehalten. Änderungen mit Auswirkungen auf die Kompatibilität werden nur eingeführt, wenn dies für Konsistenz, Sicherheit oder Funktionsverbesserungen erforderlich ist.
:::

## Versionsspezifische Änderungen {#version-specific-changes}

### Version 1.3.0 {#version-130}

**Keine Breaking Changes bei externen API-Endpunkten**

### Version 1.2.1 {#version-121}

**Keine Breaking Changes bei externen API-Endpunkten**

### Version 1.1.x {#version-11x}

**Keine Breaking Changes bei externen API-Endpunkten**

### Version 1.0.x {#version-10x}

**Keine Breaking Changes bei externen API-Endpunkten**

### Version 0.9.x {#version-09x}

**Keine Breaking Changes bei externen API-Endpunkten**

Version 0.9.x führt Authentifizierung ein und erfordert, dass sich alle Benutzer anmelden. Beim Upgrade von Version 0.8.x:

1. **Authentifizierung erforderlich**: Alle Seiten und internen API-Endpunkte erfordern jetzt Authentifizierung
2. **Standard-Admin-Konto**: Ein Standard-Admin-Konto wird automatisch erstellt:
   - Benutzername: `admin`
   - Passwort: `Duplistatus09` (muss beim ersten Anmelden geändert werden)
3. **Sitzungsentwertung**: Alle bestehenden Sitzungen werden entwertet
4. **Externer API-Zugriff**: Externe API-Endpunkte (`/api/summary`, `/api/lastbackup`, `/api/lastbackups`, `/api/upload`) bleiben aus Kompatibilitätsgründen mit Integrationen und Duplicati unauthentifiziert

### Version 0.8.x {#version-08x}

**Keine Breaking Changes bei externen API-Endpunkten**

Version 0.8.x führt keine Breaking Changes für externe API-Endpunkte ein. Die folgenden Endpunkte bleiben unverändert:

- `/api/summary` - Antwortstruktur unverändert
- `/api/lastbackup/{serverId}` - Antwortstruktur unverändert
- `/api/lastbackups/{serverId}` - Antwortstruktur unverändert
- `/api/upload` - Anfrage-/Antwortformat unverändert

#### Sicherheitsverbesserungen {#security-enhancements}

Obwohl keine Breaking Changes an externen API-Endpunkten vorgenommen wurden, enthält Version 0.8.x Sicherheitsverbesserungen:

- **CSRF-Schutz**: CSRF-Token-Validierung wird für zustandsändernde API-Anfragen erzwungen, externe APIs bleiben jedoch kompatibel
- **Passwort-Sicherheit**: Passwort-Endpunkte sind aus Sicherheitsgründen auf die Benutzeroberfläche beschränkt

:::note
Diese Sicherheitsverbesserungen beeinflussen externe API-Endpunkte, die zum Lesen von Sicherungsdaten verwendet werden, nicht. Falls Sie benutzerdefinierte Skripte verwenden, die interne Endpunkte nutzen, könnten diese eine CSRF-Token-Verarbeitung erfordern.
:::

### Version 0.7.x {#version-07x}

Version 0.7.x führt mehrere Breaking Changes bei externen API-Endpunkten ein, die Aktualisierungen an externen Integrationen erfordern.

#### Grundlegende Änderungen {#breaking-changes}

##### Feldumbenennung {#field-renaming}

- **`totalMachines`** → **`totalServers`** im `/api/summary` Endpunkt
- **`machine`** → **`server`** in API-Antwortobjekten
- **`backup_types_count`** → **`backup_jobs_count`** im `/api/lastbackups/{serverId}` Endpunkt

##### Änderungen an Endpunkt-Pfaden {#endpoint-path-changes}

- Alle API-Endpunkte, die zuvor `/api/machines/...` verwendet haben, verwenden jetzt `/api/servers/...`
- Parameternamen wurden von `machine_id` zu `server_id` geändert (URL-Codierung funktioniert immer noch mit beiden)

#### Änderungen der Antwortstruktur {#response-structure-changes}

Die Antwortstruktur für mehrere Endpunkte wurde zur Gewährleistung der Konsistenz aktualisiert:

##### `/api/summary` {#apisummary}

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

##### `/api/lastbackup/{serverId}` {#apilastbackupserverid}

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

##### `/api/lastbackups/{serverId}` {#apilastbackupsserverid}

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

## Migrationsschritte {#migration-steps}

Wenn Sie von einer Version vor 0.7.x aktualisieren, führen Sie diese Schritte aus:

1. **Feldverweise aktualisieren**: Ersetzen Sie alle Verweise auf alte Feldnamen durch neue
   - `totalMachines` → `totalServers`
   - `backup_types_count` → `backup_jobs_count`

2. **Objektschlüssel aktualisieren**: Ändern Sie `machine` zu `server` bei der Antwortanalyse
   - Aktualisieren Sie jeden Code, der auf `response.machine` zugreift, zu `response.server`

3. **Update Endpoint Paths**: Change any endpoints using `/api/machines/...` to `/api/servers/...`
   - Hinweis: Parameters can still accept old identifiers; paths should be updated

4. **Integration testen**: Bestätigen Sie, dass Ihre Integration mit der neuen API-Struktur funktioniert
   - Alle Endpunkte testen, die Ihre Anwendung nutzt
   - Bestätigen Sie, dass die Antwortverarbeitung neue Feldnamen korrekt verarbeitet

5. **Dokumentation aktualisieren**: Aktualisieren Sie alle internen Dokumentationen, die auf die alte API verweisen
   - Aktualisieren Sie API-Beispiele und Feldnamenreferenzen

## Kompatibilität {#compatibility}

### Rückwärtskompatibilität {#backward-compatibility}

- **Version 1.2.1**: Vollständig abwärtskompatibel mit der API-Struktur 1.1.x
- **Version 1.1.x**: Vollständig abwärtskompatibel mit der API-Struktur 1.0.x
- **Version 1.0.x**: Vollständig abwärtskompatibel mit der API-Struktur 0.9.x
- **Version 0.9.x**: Vollständig abwärtskompatibel mit der API-Struktur 0.8.x
- **Version 0.8.x**: Vollständig abwärtskompatibel mit der API-Struktur 0.7.x
- **Version 0.7.x**: Nicht abwärtskompatibel mit Versionen vor 0.7.x
  - Alte Feldnamen funktionieren nicht
  - Alte Endpunkt-Pfade funktionieren nicht

### Zukünftige Unterstützung {#future-support}

- Alte Feldnamen aus Versionen vor 0.7.x sind nicht unterstützt
- Alte Endpunkt-Pfade aus Versionen vor 0.7.x sind nicht unterstützt
- Zukünftige Versionen werden die aktuelle API-Struktur beibehalten, sofern keine Breaking Changes erforderlich sind

## Zusammenfassung der externen API-Endpunkte {#summary-of-external-api-endpoints}

Die folgenden externen API-Endpunkte werden aus Gründen der Rückwärtskompatibilität beibehalten und bleiben unauthentifiziert:

| Endpoint | Method | Beschreibung | Breaking Changes |
|----------|--------|-------------|------------------|
| `/api/summary` | GET | Gesamtübersicht von Sicherungsvorgängen | 0.7.x: `totalMachines` → `totalServers` |
| `/api/lastbackup/{serverId}` | GET | Neueste Sicherung für einen Server | 0.7.x: `machine` → `server` |
| `/api/lastbackups/{serverId}` | GET | Neueste Sicherungen für alle Sicherungsaufträge | 0.7.x: `machine` → `server`, `backup_types_count` → `backup_jobs_count` |
| `/api/upload` | POST | Hochladen von Sicherungsdaten von Duplicati | Nein breaking changes |

## Benötigen Sie Hilfe? {#need-help}

Wenn Sie Unterstützung beim Aktualisieren Ihrer Integration benötigen:

- **API-Referenz**: Konsultieren Sie die [API-Referenz](../api-reference/overview.md) für aktuelle Endpunkt-Dokumentation
- **Externe APIs**: Siehe [Externe APIs](../api-reference/external-apis.md) für detaillierte Endpunkt-Dokumentation
- **Migrationsleitfaden**: Lesen Sie den [Migrationsleitfaden](version_upgrade.md) für allgemeine Migrationsinformationen
- **Versionshinweise**: Lesen Sie versionsspezifische [Versionshinweise](../release-notes/0.8.x.md) für zusätzlichen Kontext
- **Unterstützung**: Öffnen Sie ein Problem auf [GitHub](https://github.com/wsj-br/duplistatus/issues) für Unterstützung
