---
translation_last_updated: '2026-05-06T23:20:35.742Z'
source_file_mtime: '2026-05-06T23:18:51.410Z'
source_file_hash: 8b9a230f64fd786725b53f2231596f7426ccf84e8ad7352af80d2f9b7a86410c
translation_language: de
source_file_path: documentation/docs/migration/api-changes.md
translation_models:
  - anthropic/claude-haiku-4.5
  - qwen/qwen3-235b-a22b-2507
---
# Rückwärts-inkompatible API-Änderungen {#api-breaking-changes}

Dieses Dokument beschreibt Breaking Changes für externe API-Endpunkte in verschiedenen Versionen von duplistatus. Externe API-Endpunkte sind solche, die für die Verwendung durch andere Anwendungen und Integrationen konzipiert sind (z. B. Homepage-Integration).

## Übersicht {#overview}

Dieses Dokument behandelt Breaking Changes an externen API-Endpunkten, die Integrationen, Skripte und Anwendungen beeinflussen, die diese Endpunkte nutzen. Für interne API-Endpunkte, die von der Weboberfläche verwendet werden, werden Änderungen automatisch verarbeitet und erfordern keine manuellen Aktualisierungen.

:::note
Externe API-Endpunkte werden zur Gewährleistung der Rückwärtskompatibilität nach Möglichkeit beibehalten. Breaking Changes werden nur eingeführt, wenn dies für Konsistenz, Sicherheit oder Funktionsverbesserungen erforderlich ist.
:::

## Versionsspezifische Änderungen {#version-specific-changes}

### Version 1.3.0 {#version-130}

**Keine Breaking Changes für externe API-Endpunkte**

### Version 1.2.1 {#version-121}

**Keine Breaking Changes für externe API-Endpunkte**

### Version 1.1.x {#version-11x}

**Keine Breaking Changes für externe API-Endpunkte**

### Version 1.0.x {#version-10x}

**Keine Breaking Changes für externe API-Endpunkte**

### Version 0.9.x {#version-09x}

**Keine Breaking Changes für externe API-Endpunkte**

Version 0.9.x führt Authentifizierung ein und erfordert, dass sich alle Benutzer anmelden. Beim Upgrade von Version 0.8.x:

1. **Authentifizierung erforderlich**: Alle Seiten und internen API-Endpunkte erfordern nun eine Authentifizierung
2. **Standard-Administrator-Konto**: Ein Standard-Administrator-Konto wird automatisch erstellt:
   - Benutzername: `admin`
   - Passwort: `Duplistatus09` (muss beim ersten Login geändert werden)
3. **Sitzungsungültigkeitserklärung**: Alle bestehenden Sitzungen werden ungültig
4. **Zugriff auf externe API**: Externe API-Endpunkte (`/api/summary`, `/api/lastbackup`, `/api/lastbackups`, `/api/upload`) bleiben zur Kompatibilität mit Integrationen und Duplicati unauthentifiziert

### Version 0.8.x {#version-08x}

**Keine Breaking Changes für externe API-Endpunkte**

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
Diese Sicherheitsverbesserungen beeinflussen nicht die externen API-Endpunkte, die zum Lesen von Sicherungsdaten verwendet werden. Falls Sie benutzerdefinierte Skripte mit internen Endpunkten verwenden, können diese eine CSRF-Token-Behandlung erfordern.
:::

### Version 0.7.x {#version-07x}

Version 0.7.x führt mehrere Breaking Changes bei externen API-Endpunkten ein, die Aktualisierungen an externen Integrationen erfordern.

#### Brechende Änderungen {#breaking-changes}

##### Feldumbenennung {#field-renaming}

- `totalMachines` → `totalServers` im `/api/summary`-Endpunkt
- `machine` → `server` in API-Antwortobjekten
- `backup_types_count` → `backup_jobs_count` im `/api/lastbackups/{serverId}`-Endpunkt

##### Änderungen an Endpunkt-Pfaden {#endpoint-path-changes}

- Alle API-Endpunkte, die zuvor `/api/machines/...` verwendeten, verwenden jetzt `/api/servers/...`
- Parameternamen wurden von `machine_id` zu `server_id` geändert (URL-Codierung funktioniert weiterhin mit beiden)

#### Änderungen der Antwortstruktur {#response-structure-changes}

Die Antwortstruktur für mehrere Endpunkte wurde zur Konsistenz aktualisiert:

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

2. **Objektschlüssel aktualisieren**: Ändern Sie `machine` in `server` bei der Antwortanalyse
   - Aktualisieren Sie jeden Code, der auf `response.machine` zugreift, zu `response.server`

3. **Endpunkt-Pfade aktualisieren**: Ändern Sie alle Endpunkte, die `/api/machines/...` verwenden, in `/api/servers/...`
   - Hinweis: Parameter können weiterhin alte Bezeichner akzeptieren; Pfade sollten aktualisiert werden

4. **Testintegration**: Bestätigen Sie, dass Ihre Integration mit der neuen API-Struktur funktioniert
   - Testen Sie alle Endpunkte, die Ihre Anwendung verwendet
   - Bestätigen Sie, dass die Antwortanalyse neue Feldnamen korrekt verarbeitet

5. **Dokumentation aktualisieren**: Aktualisieren Sie alle internen Dokumentationen, die auf die alte API verweisen
   - Aktualisieren Sie API-Beispiele und Feldnamenreferenzen

## Kompatibilität {#compatibility}

### Rückwärtskompatibilität {#backward-compatibility}

- **Version 1.2.1**: Vollständig abwärtskompatibel mit der API-Struktur von 1.1.x
- **Version 1.1.x**: Vollständig abwärtskompatibel mit der API-Struktur von 1.0.x
- **Version 1.0.x**: Vollständig abwärtskompatibel mit der API-Struktur von 0.9.x
- **Version 0.9.x**: Vollständig abwärtskompatibel mit der API-Struktur von 0.8.x
- **Version 0.8.x**: Vollständig abwärtskompatibel mit der API-Struktur von 0.7.x
- **Version 0.7.x**: Nicht abwärtskompatibel mit Versionen vor 0.7.x
  - Alte Feldnamen funktionieren nicht mehr
  - Alte Endpunkt-Pfade funktionieren nicht mehr

### Zukünftige Unterstützung {#future-support}

- Alte Feldnamen aus Versionen vor 0.7.x sind nicht unterstützt
- Alte Endpunkt-Pfade aus Versionen vor 0.7.x sind nicht unterstützt
- Zukünftige Versionen werden die aktuelle API-Struktur beibehalten, sofern keine Breaking Changes erforderlich sind

## Zusammenfassung der externen API-Endpunkte {#summary-of-external-api-endpoints}

Die folgenden externen API-Endpunkte werden aus Gründen der Abwärtskompatibilität beibehalten und bleiben unauthentifiziert:

| Endpunkt | Methode | Beschreibung | Breaking Changes |
|----------|--------|-------------|------------------|
| `/api/summary` | GET | Gesamtübersicht der Sicherungsvorgänge | 0.7.x: `totalMachines` → `totalServers` |
| `/api/lastbackup/{serverId}` | GET | Letzte Sicherung für einen Server | 0.7.x: `machine` → `server` |
| `/api/lastbackups/{serverId}` | GET | Letzte Sicherungen für alle Sicherungsaufträge | 0.7.x: `machine` → `server`, `backup_types_count` → `backup_jobs_count` |
| `/api/upload` | POST | Sicherungsdaten von Duplicati hochladen | Keine Breaking Changes |

## Hilfe? {#need-help}

Wenn Sie Hilfe beim Aktualisieren Ihrer Integration benötigen:

- **API-Referenz**: Überprüfen Sie die [API-Referenz](../api-reference/overview.md) für die aktuelle Endpunktdokumentation
- **Externe APIs**: Siehe [Externe APIs](../api-reference/external-apis.md) für detaillierte Endpunktdokumentation
- **Migrationsanleitung**: Lesen Sie die [Migrationsanleitung](version_upgrade.md) für allgemeine Migrationsinformationen
- **Versionshinweise**: Prüfen Sie die versionsbezogenen [Versionshinweise](../release-notes/0.8.x.md) für zusätzlichen Kontext
- **Support**: Öffnen Sie ein Ticket auf [GitHub](https://github.com/wsj-br/duplistatus/issues) für Unterstützung
