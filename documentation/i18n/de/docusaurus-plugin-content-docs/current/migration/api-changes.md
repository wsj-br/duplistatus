# Rückwärtsinkompatible API-Änderungen {/* #backward-incompatible-api-changes */}

Dieses Dokument beschreibt die Änderungen an externen API-Endpunkten über verschiedene Versionen von duplistatus hinweg. Externe API-Endpunkte sind solche, die für die Verwendung durch andere Anwendungen und Integrationen konzipiert sind (z.B. Homepage-Integration).

## Übersicht {/* #overview */}

Dieses Dokument behandelt Änderungen an externen API-Endpunkten, die Integrationen, Skripte und Anwendungen betreffen, die diese Endpunkte nutzen. Für interne API-Endpunkte, die von der Weboberfläche verwendet werden, werden Änderungen automatisch behandelt und erfordern keine manuellen Aktualisierungen.

:::note
Externe API-Endpunkte werden nach Möglichkeit rückwärtskompatibel gehalten. Breaking Changes werden nur dann eingeführt, wenn sie aus Gründen der Konsistenz, Sicherheit oder Funktionsverbesserungen erforderlich sind.
:::

## Versionsabhängige Änderungen {/* #version-specific-changes */}

### Version 1.3.0 {/* #version-130 */}

**Keine Breaking Changes bei externen API-Endpunkten**

### Version 1.2.1 {/* #version-121 */}

**Keine Breaking Changes bei externen API-Endpunkten**

### Version 1.1.x {/* #version-11x */}

**Keine Breaking Changes bei externen API-Endpunkten**

### Version 1.0.x {/* #version-10x */}

**Keine Breaking Changes bei externen API-Endpunkten**

### Version 0.9.x {/* #version-09x */}

**Keine Breaking Changes bei externen API-Endpunkten**

Version 0.9.x führt Authentifizierung ein und erfordert, dass sich alle Benutzer anmelden. Beim Upgrade von Version 0.8.x:

1. **Authentifizierung erforderlich**: Alle Seiten und internen API-Endpunkte erfordern nun eine Authentifizierung
2. **Standard-Admin-Konto**: Ein Standard-Admin-Konto wird automatisch erstellt:
   - Benutzername: `admin`
   - Passwort: `Duplistatus09` (muss bei der ersten Anmeldung geändert werden)
3. **Sitzungsinvalidierung**: Alle bestehenden Sitzungen werden ungültig
4. **Zugriff auf externe APIs**: Externe API-Endpunkte (`/api/summary`, `/api/lastbackup`, `/api/lastbackups`, `/api/upload`) bleiben weiterhin ohne Authentifizierung zugänglich, um die Kompatibilität mit Integrationen und Duplicati zu gewährleisten

### Version 0.8.x {/* #version-08x */}

**Keine Breaking Changes bei externen API-Endpunkten**

Version 0.8.x führt keine Breaking Changes bei externen API-Endpunkten ein. Die folgenden Endpunkte bleiben unverändert:

- `/api/summary` - Antwortstruktur unverändert
- `/api/lastbackup/{serverId}` - Antwortstruktur unverändert
- `/api/lastbackups/{serverId}` - Antwortstruktur unverändert
- `/api/upload` - Anfrage/Antwort-Format unverändert

#### Sicherheitsverbesserungen {/* #security-enhancements */}

Obwohl keine Breaking Changes an externen API-Endpunkten vorgenommen wurden, enthält Version 0.8.x Sicherheitsverbesserungen:

- **CSRF-Schutz**: Die CSRF-Token-Validierung wird für API-Anfragen, die den Zustand ändern, erzwungen, aber externe APIs bleiben kompatibel
- **Passwortsicherheit**: Passwort-Endpunkte sind aus Sicherheitsgründen auf die Benutzeroberfläche beschränkt

:::note
Diese Sicherheitsverbesserungen beeinflussen nicht die externen API-Endpunkte, die zum Lesen von Sicherungsdaten verwendet werden. Wenn Sie benutzerdefinierte Skripte verwenden, die interne Endpunkte nutzen, benötigen diese möglicherweise die Behandlung von CSRF-Tokens.
:::

### Version 0.7.x {/* #version-07x */}

Version 0.7.x führt mehrere Breaking Changes für externe API-Endpunkte ein, die Aktualisierungen der externen Integrationen erfordern.

#### Breaking Changes {/* #breaking-changes */}

##### Umbenennung von Feldern {/* #field-renaming */}

- `totalMachines` → `totalServers` im `/api/summary`-Endpunkt
- `machine` → `server` in API-Antwortobjekten
- `backup_types_count` → `backup_jobs_count` im `/api/lastbackups/{serverId}`-Endpunkt

##### Änderungen am Endpunktpfad {/* #endpoint-path-changes */}

- Alle API-Endpunkte, die zuvor `/api/machines/...` verwendeten, verwenden jetzt `/api/servers/...`
- Parameternamen geändert von `machine_id` zu `server_id` (URL-Codierung funktioniert weiterhin mit beiden)

#### Änderungen an der Antwortstruktur {/* #response-structure-changes */}

Die Antwortstruktur für mehrere Endpunkte wurde zur Vereinheitlichung aktualisiert:

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

**Nachher (0.7.x+):**

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

**Nachher (0.7.x+):**

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

**Nachher (0.7.x+):**

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

## Migrationschritte {/* #migration-steps */}

Wenn Sie von einer Version vor 0.7.x aktualisieren, führen Sie diese Schritte aus:

1. **Feldreferenzen aktualisieren**: Ersetzen Sie alle Referenzen auf alte Feldnamen durch neue
   - `totalMachines` → `totalServers`
   - `backup_types_count` → `backup_jobs_count`

2. **Objektschlüssel aktualisieren**: Ändern Sie `machine` zu `server` beim Parsen der Antwort
   - Aktualisieren Sie jeden Code, der auf `response.machine` zugreift, zu `response.server`

3. **Endpunktpfade aktualisieren**: Ändern Sie alle Endpunkte, die `/api/machines/...` verwenden, zu `/api/servers/...`
   - Hinweis: Parameter können weiterhin alte Bezeichner akzeptieren; Pfade sollten aktualisiert werden

4. **Integration testen**: Stellen Sie sicher, dass Ihre Integration mit der neuen API-Struktur funktioniert
   - Testen Sie alle Endpunkte, die Ihre Anwendung verwendet
   - Überprüfen Sie, dass das Parsen der Antworten die neuen Feldnamen korrekt verarbeitet

5. **Dokumentation aktualisieren**: Aktualisieren Sie jegliche interne Dokumentation, die auf die alte API verweist
   - Aktualisieren Sie API-Beispiele und Referenzen zu Feldnamen

## Kompatibilität {/* #compatibility */}

### Abwärtskompatibilität {/* #backward-compatibility */}

- **Version 1.2.1**: Vollständig abwärtskompatibel mit 1.1.x API-Struktur
- **Version 1.1.x**: Vollständig abwärtskompatibel mit 1.0.x API-Struktur
- **Version 1.0.x**: Vollständig abwärtskompatibel mit 0.9.x API-Struktur
- **Version 0.9.x**: Vollständig abwärtskompatibel mit 0.8.x API-Struktur
- **Version 0.8.x**: Vollständig abwärtskompatibel mit 0.7.x API-Struktur
- **Version 0.7.x**: Nicht abwärtskompatibel mit Versionen vor 0.7.x
  - Alte Feldnamen funktionieren nicht
  - Alte Endpunktpfade funktionieren nicht

### Zukünftige Unterstützung {/* #future-support */}

- Alte Feldnamen aus Versionen vor 0.7.x werden nicht unterstützt
- Alte Endpunktpfade aus Versionen vor 0.7.x werden nicht unterstützt
- Zukünftige Versionen werden die aktuelle API-Struktur beibehalten, es sei denn, Breaking Changes sind notwendig

## Zusammenfassung der externen API-Endpunkte {/* #summary-of-external-api-endpoints */}

Die folgenden externen API-Endpunkte werden zur Abwärtskompatibilität beibehalten und bleiben unauthentifiziert:

| Endpunkt | Methode | Beschreibung | Breaking Changes |
|----------|---------|---------------|------------------|
| `/api/summary` | GET | Gesamtübersicht der Sicherungsoperationen | 0.7.x: `totalMachines` → `totalServers` |
| `/api/lastbackup/{serverId}` | GET | Neueste Sicherung für einen Server | 0.7.x: `machine` → `server` |
| `/api/lastbackups/{serverId}` | GET | Aktuelle Sicherungen für alle Sicherungsaufträge | 0.7.x: `machine` → `server`, `backup_types_count` → `backup_jobs_count` |
| `/api/upload` | POST | Sicherungsdaten von duplicati hochladen | Keine nicht abwärtskompatiblen Änderungen |

## Hilfe benötigt? {/* #need-help */}

Wenn Sie Unterstützung bei der Aktualisierung Ihrer Integration benötigen:

- **API-Referenz**: Prüfen Sie die [API-Referenz](../api-reference/overview.md) für aktuelle Endpunktdokumentation
- **Externe APIs**: Siehe [Externe APIs](../api-reference/external-apis.md) für detaillierte Endpunktdokumentation
- **Migrationsanleitung**: Lesen Sie die [Migrationsanleitung](version_upgrade.md) für allgemeine Migrationsinformationen
- **Versionshinweise**: Lesen Sie versionspezifische [Versionshinweise](../release-notes/0.8.x.md) für zusätzlichen Kontext
- **Support**: Öffnen Sie ein Issue auf [GitHub](https://github.com/wsj-br/duplistatus/issues) für Support
