---
translation_last_updated: '2026-02-14T04:57:39.775Z'
source_file_mtime: '2026-02-06T21:19:17.347Z'
source_file_hash: 21d21cb01acea43b
translation_language: de
source_file_path: development/database.md
---
# Datenbankschema {#database-schema}

Dieses Dokument beschreibt das SQLite-Datenbankschema, das von duplistatus zur Speicherung von Sicherungsvorgangsdaten verwendet wird.

## Datenbankstandort {#database-location}

Die Datenbank wird im Anwendungsdatenverzeichnis gespeichert:
- **Standard-Speicherort**: `/app/data/backups.db`
- **Docker-Volume**: `duplistatus_data:/app/data`
- **Dateiname**: `backups.db`

## Datenbankmigrationssystem {#database-migration-system}

duplistatus verwendet ein automatisiertes Migrationssystem, um Datenbankschemaänderungen zwischen Versionen zu verwalten.

### Migrationsversionsverlauf {#migration-version-history}

Die folgenden sind historische Migrationsversionenen, die die Datenbank in ihren aktuellen Zustand gebracht haben:

- **Schema v1.0** (Application v0.6.x und früher): Initiales Datenbankschema mit Tabellen für Server und Sicherungen
- **Schema v2.0** (Application v0.7.x): Fehlende Spalten und Konfigurationstabelle hinzugefügt
- **Schema v3.0** (Application v0.7.x): Tabelle „machines" in „servers" umbenannt, Spalte „server_url" hinzugefügt
- **Schema v3.1** (Application v0.8.x): Sicherungsdatenfelder erweitert, Spalte „server_password" hinzugefügt
- **Schema v4.0** (Application v0.9.x / v1.0.x): Benutzerzugriffskontrolle hinzugefügt (Tabellen „users", „sessions", „audit_log")

Die aktuelle Anwendungsversion (v1.3.x) verwendet **Schema v4.0** als neueste Datenbankschema-Version.

### Migrationsprozess {#migration-process}

1. **Automatische Sicherung**: Erstellt eine Sicherung vor der Migration
2. **Schema-Update**: Aktualisiert die Datenbankstruktur
3. **Datenmigration**: Bewahrt vorhandene Daten
4. **Überprüfung**: Bestätigt die erfolgreiche Migration

## Tabellen {#tables}

### Server-Tabelle {#servers-table}

Speichert Informationen über überwachte Duplicati-Server.

#### Felder {#fields}

| Feld              | Typ              | Beschreibung                       |
|-------------------|------------------|------------------------------------|
| `id`              | TEXT PRIMARY KEY | Eindeutige Server-Kennung          |
| `name`            | TEXT NOT NULL    | Servername aus Duplicati           |
| `server_url`      | TEXT             | Duplicati-Server-URL               |
| `alias`           | TEXT             | Benutzerdefinierten Anzeigename    |
| `note`            | TEXT             | Benutzerdefinierte Notizen/Beschreibung |
| `server_password` | TEXT             | Server-Passwort zur Authentifizierung |
| `created_at`      | DATETIME         | Server-Erstellungs-Zeitstempel     |

### Sicherungen-Tabelle {#backups-table}

Speichert Sicherungsvorgangsdaten, die von Duplicati-Servern empfangen werden.

#### Schlüsselfelder {#key-fields}

| Feld              | Typ               | Beschreibung                                    |
|--------------------|-------------------|------------------------------------------------|
| `id`               | TEXT PRIMARY KEY  | Eindeutige Sicherungs-ID                       |
| `server_id`        | TEXT NOT NULL     | Referenz zur Server-Tabelle                     |
| `backup_name`      | TEXT NOT NULL     | Name des Sicherungsauftrags                    |
| `backup_id`        | TEXT NOT NULL     | Sicherungs-ID von Duplicati                    |
| `date`             | DATETIME NOT NULL | Ausführungszeit der Sicherung                  |
| `status`           | TEXT NOT NULL     | Sicherungsstatus (Erfolg, Warnung, Fehler, Kritisch) |
| `duration_seconds` | INTEGER NOT NULL  | Dauer in Sekunden                              |
| `size`             | INTEGER           | Größe der Quelldateien                         |
| `uploaded_size`    | INTEGER           | Größe der hochgeladenen Daten                  |
| `examined_files`   | INTEGER           | Anzahl der untersuchten Dateien                |
| `warnings`         | INTEGER           | Anzahl der Warnungen                           |
| `errors`           | INTEGER           | Anzahl der Fehler                              |
| `created_at`       | DATETIME          | Zeitstempel der Datensatzerstellung            |

#### Message Arrays (JSON Speicherplatz) {#message-arrays-json-storage}

| Feld                | Typ  | Beschreibung                                    |
|---------------------|------|-------------------------------------------------|
| `messages_array`    | TEXT | JSON-Array von Nachrichten                      |
| `warnings_array`    | TEXT | JSON-Array von Warnungsnachrichten              |
| `errors_array`      | TEXT | JSON-Array von Fehlernachrichten                |
| `available_backups` | TEXT | JSON-Array von verfügbaren Sicherungsversionen |

#### Dateioperations-Felder {#file-operation-fields}

| Feld                  | Typ     | Beschreibung                           |
|-----------------------|---------|----------------------------------------|
| `examined_files`      | INTEGER | Während der Sicherung geprüfte Dateien |
| `opened_files`        | INTEGER | Zur Sicherung geöffnete Dateien        |
| `added_files`         | INTEGER | Neue Dateien zur Sicherung hinzugefügt |
| `modified_files`      | INTEGER | In der Sicherung geänderte Dateien     |
| `deleted_files`       | INTEGER | Aus der Sicherung gelöschte Dateien    |
| `deleted_folders`     | INTEGER | Aus der Sicherung gelöschte Ordner     |
| `added_folders`       | INTEGER | Zur Sicherung hinzugefügte Ordner      |
| `modified_folders`    | INTEGER | In der Sicherung geänderte Ordner      |
| `not_processed_files` | INTEGER | Nicht verarbeitete Dateien             |
| `too_large_files`     | INTEGER | Zu große Dateien zur Verarbeitung      |
| `files_with_error`    | INTEGER | Dateien mit Fehler                     |
| `added_symlinks`      | INTEGER | Hinzugefügte symbolische Links         |
| `modified_symlinks`   | INTEGER | Geänderte symbolische Links            |
| `deleted_symlinks`    | INTEGER | Gelöschte symbolische Links            |

#### Dateigröße-Felder {#file-size-fields}

| Field                    | Type    | Beschreibung                              |
|--------------------------|---------|-------------------------------------------|
| `size_of_examined_files` | INTEGER | Größe von Dateien, die während der Sicherung überprüft wurden |
| `size_of_opened_files`   | INTEGER | Größe von Dateien, die zur Sicherung geöffnet wurden |
| `size_of_added_files`    | INTEGER | Größe neuer Dateien, die zur Sicherung hinzugefügt wurden |
| `size_of_modified_files` | INTEGER | Größe von Dateien, die in der Sicherung geändert wurden |

#### Felder des Betriebsstatus {#operation-status-fields}

| Feld                     | Typ               | Beschreibung                           |
|--------------------------|-------------------|----------------------------------------|
| `parsed_result`          | TEXT NOT NULL     | Analysiertes Operationsergebnis        |
| `main_operation`         | TEXT NOT NULL     | Hauptoperationstyp                     |
| `interrupted`            | BOOLEAN           | Ob die Sicherung unterbrochen wurde    |
| `partial_backup`         | BOOLEAN           | Ob die Sicherung teilweise war         |
| `dryrun`                 | BOOLEAN           | Ob die Sicherung ein Testlauf war      |
| `version`                | TEXT              | Verwendete Duplicati-Version           |
| `begin_time`             | DATETIME NOT NULL | Startzeit der Sicherung                |
| `end_time`               | DATETIME NOT NULL | Endzeit der Sicherung                  |
| `warnings_actual_length` | INTEGER           | Tatsächliche Anzahl der Warnungen      |
| `errors_actual_length`   | INTEGER           | Tatsächliche Anzahl der Fehler         |
| `messages_actual_length` | INTEGER           | Tatsächliche Anzahl der Nachrichten    |

#### Backend-Statistiken-Felder {#backend-statistics-fields}

| Feld                             | Typ      | Beschreibung                              |
|----------------------------------|----------|-------------------------------------------|
| `bytes_downloaded`               | INTEGER  | Von Ziel heruntergeladene Bytes           |
| `known_file_size`                | INTEGER  | Bekannte Dateigröße am Ziel               |
| `last_backup_date`               | DATETIME | Datum der letzten Sicherung am Ziel       |
| `backup_list_count`              | INTEGER  | Anzahl von Sicherungsversionen            |
| `reported_quota_error`           | BOOLEAN  | Kontingentfehler gemeldet                 |
| `reported_quota_warning`         | BOOLEAN  | Kontingentwarnung gemeldet                |
| `backend_main_operation`         | TEXT     | Backend-Hauptoperation                    |
| `backend_parsed_result`          | TEXT     | Backend-Analyseergebnis                   |
| `backend_interrupted`            | BOOLEAN  | Backend-Operation unterbrochen            |
| `backend_version`                | TEXT     | Backend-Version                           |
| `backend_begin_time`             | DATETIME | Startzeit der Backend-Operation           |
| `backend_duration`               | TEXT     | Dauer der Backend-Operation               |
| `backend_warnings_actual_length` | INTEGER  | Anzahl von Backend-Warnungen              |
| `backend_errors_actual_length`   | INTEGER  | Anzahl von Backend-Fehlern                |

### Konfigurationstabelle {#configurations-table}

Speichert Anwendungskonfigurationseinstellungen.

#### Felder {#fields}

| Feld    | Typ                       | Beschreibung               |
|---------|---------------------------|----------------------------|
| `key`   | TEXT PRIMARY KEY NOT NULL | Konfigurationsschlüssel    |
| `value` | TEXT                      | Konfigurationswert (JSON)  |

#### Allgemeine Konfigurationsschlüssel {#common-configuration-keys}

- `email_config`: E-Mail-Benachrichtigungseinstellungen
- `ntfy_config`: NTFY-Benachrichtigungseinstellungen
- `overdue_tolerance`: Toleranzeinstellungen für überfällige Sicherungen
- `notification_templates`: Vorlagen für Benachrichtigungsmeldungen
- `audit_retention_days`: Aufbewahrungszeitraum für Audit-Logs (Standard: 90 Tage)

### Datenbankversionstabelle {#database-version-table}

Verfolgt die Datenbankschema-Version für Migrationszwecke.

#### Felder {#fields}

| Feld         | Typ              | Beschreibung               |
|--------------|------------------|----------------------------|
| `version`    | TEXT PRIMARY KEY | Datenbankversion           |
| `applied_at` | DATETIME         | Wann die Migration angewendet wurde |

### Benutzer-Tabelle {#users-table}

Speichert Benutzerkonteninformationen für Authentifizierung und Zugriffskontrolle.

#### Felder {#fields}

| Feld                    | Typ                  | Beschreibung                                    |
|-------------------------|----------------------|--------------------------------------------------|
| `id`                    | TEXT PRIMARY KEY     | Eindeutige Benutzerkennung                      |
| `username`              | TEXT UNIQUE NOT NULL | Benutzername zum Anmelden                       |
| `password_hash`         | TEXT NOT NULL        | Bcrypt-verschlüsseltes Passwort                 |
| `is_admin`              | BOOLEAN NOT NULL     | Ob der Benutzer Admin-Berechtigungen hat         |
| `must_change_password`  | BOOLEAN              | Ob eine Passwortänderung erforderlich ist       |
| `created_at`            | DATETIME             | Zeitstempel der Kontoerstellung                 |
| `updated_at`            | DATETIME             | Zeitstempel der letzten Aktualisierung          |
| `last_login_at`         | DATETIME             | Zeitstempel der letzten erfolgreichen Anmeldung |
| `last_login_ip`         | TEXT                 | IP-Adresse der letzten Anmeldung                |
| `failed_login_attempts` | INTEGER              | Anzahl fehlgeschlagener Anmeldeversuche         |
| `locked_until`          | DATETIME             | Sperrablauf des Kontos (falls gesperrt)         |

### Sitzungstabelle {#sessions-table}

Speichert Benutzersitzungsdaten für Authentifizierung und Sicherheit.

#### Felder {#fields}

| Feld              | Typ               | Beschreibung                                                     |
|-------------------|-------------------|------------------------------------------------------------------|
| `id`              | TEXT PRIMARY KEY  | Sitzungskennung                                                  |
| `user_id`         | TEXT              | Verweis auf Benutzertabelle (nullable für nicht authentifizierte Sitzungen) |
| `created_at`      | DATETIME          | Sitzungserstellungs-Zeitstempel                                  |
| `last_accessed`   | DATETIME          | Letzte Zugriffs-Zeitstempel                                      |
| `expires_at`      | DATETIME NOT NULL | Sitzungsablauf-Zeitstempel                                       |
| `ip_address`      | TEXT              | IP-Adresse des Sitzungsursprungs                                 |
| `user_agent`      | TEXT              | User-Agent-String                                               |
| `csrf_token`      | TEXT              | CSRF-Token für die Sitzung                                       |
| `csrf_expires_at` | DATETIME          | CSRF-Token-Ablauf                                               |

### Audit-Log-Tabelle {#audit-log-table}

Speichert ein Audit-Trail von Benutzeraktionen und Systemereignissen.

#### Felder {#fields}

| Feld            | Typ                               | Beschreibung                                                      |
|-----------------|-----------------------------------|-------------------------------------------------------------------|
| `id`            | INTEGER PRIMARY KEY AUTOINCREMENT | Eindeutige Audit-Log-Eintrags-ID                                  |
| `timestamp`     | DATETIME                          | Ereigniszeitstempel                                               |
| `user_id`       | TEXT                              | Referenz zur Benutzertabelle (optional)                           |
| `username`      | TEXT                              | Benutzername zum Zeitpunkt der Aktion                             |
| `action`        | TEXT NOT NULL                     | Durchgeführte Aktion                                              |
| `category`      | TEXT NOT NULL                     | Kategorie der Aktion (z. B. 'authentication', 'settings', 'backup') |
| `target_type`   | TEXT                              | Zieltyp (z. B. 'server', 'backup', 'user')                        |
| `target_id`     | TEXT                              | Kennung des Ziels                                                 |
| `details`       | TEXT                              | Zusätzliche Details (JSON)                                        |
| `ip_address`    | TEXT                              | IP-Adresse des Anforderers                                        |
| `user_agent`    | TEXT                              | User-Agent-String                                                 |
| `status`        | TEXT NOT NULL                     | Status der Aktion ('success', 'failure', 'error')                 |
| `error_message` | TEXT                              | Fehlermeldung bei fehlgeschlagener Aktion                         |

## Sitzungsverwaltung {#session-management}

### Datenbankgestützter Speicherplatz für Sitzungen {#database-backed-session-storage}

Sitzungen werden in der Datenbank mit In-Memory-Fallback gespeichert:
- **Primary Storage**: Datenbankgestützte Sitzungstabelle
- **Fallback**: In-Memory-Speicherplatz (Legacy-Unterstützung oder Fehlerfälle)
- **Session ID**: Kryptographisch sichere Zufallszeichenkette
- **Expiration**: Konfigurierbare Sitzungs-Zeitüberschreitung
- **CSRF Protection**: Cross-Site-Request-Forgery-Schutz
- **Automatic Cleanup**: Abgelaufene Sitzungen werden automatisch entfernt

### Session-API-Endpunkte {#session-api-endpoints}

- `POST /api/session`: Neue Sitzung erstellen
- `GET /api/session`: Vorhandene Sitzung validieren
- `DELETE /api/session`: Sitzung beenden
- `GET /api/csrf`: CSRF-Token abrufen

## Indizes {#indexes}

Die Datenbank enthält mehrere Indizes für optimale Abfrageleistung:

- **Primary Keys**: Alle Tabellen haben Primary-Key-Indizes
- **Foreign Keys**: Server-Referenzen in der Sicherungen-Tabelle, Benutzer-Referenzen in Sessions und audit_log
- **Query Optimisation**: Indizes auf häufig abgefragten Feldern
- **Date Indexes**: Indizes auf Datumfeldern für zeitbasierte Abfragen
- **User Indexes**: Benutzername-Index für schnelle Benutzersuchvorgänge
- **Session Indexes**: Ablauf- und user_id-Indizes für die Sitzungsverwaltung
- **Audit Indexes**: Zeitstempel-, user_id-, Aktion-, Kategorie- und Status-Indizes für Audit-Abfragen

## Beziehungen {#relationships}

- **Server → Sicherungen**: 1:n-Beziehung
- **Benutzer → Sessions**: 1:n-Beziehung (Sessions können ohne Benutzer existieren)
- **Benutzer → Audit-Log**: 1:n-Beziehung (Audit-Einträge können ohne Benutzer existieren)
- **Sicherungen → Nachrichten**: Eingebettete JSON-Arrays
- **Konfigurationen**: Schlüssel-Wert-Speicherung

## Datentypen {#data-types}

- **TEXT**: Zeichenkettendaten, JSON-Arrays
- **INTEGER**: Numerische Daten, Dateizählungen, Größen
- **REAL**: Gleitkommazahlen, Dauern
- **DATETIME**: Zeitstempeldaten
- **BOOLEAN**: Wahr/Falsch-Werte

## Sicherungsstatus-Werte {#backup-status-values}

- **Erfolg**: Sicherung erfolgreich abgeschlossen
- **Warnung**: Sicherung abgeschlossen mit Warnungen
- **Fehler**: Sicherung abgeschlossen mit Fehlern
- **Kritisch**: Sicherung fehlgeschlagen kritisch

## Häufig gestellte Anfragen {#common-queries}

### Neueste Sicherung für einen Server abrufen {#get-latest-backup-for-a-server}

```sql
SELECT * FROM backups 
WHERE server_id = ? 
ORDER BY date DESC 
LIMIT 1;
```

### Alle Sicherungen für einen Server abrufen {#get-all-backups-for-a-server}

```sql
SELECT * FROM backups 
WHERE server_id = ? 
ORDER BY date DESC;
```

### Server-Zusammenfassung abrufen {#get-server-summary}

```sql
SELECT 
  s.name,
  s.alias,
  COUNT(b.id) as backup_count,
  MAX(b.date) as last_backup,
  b.status as last_status
FROM servers s
LEFT JOIN backups b ON s.id = b.server_id
GROUP BY s.id;
```

### Gesamtzusammenfassung abrufen {#get-overall-summary}

```sql
SELECT 
  COUNT(DISTINCT s.id) as total_servers,
  COUNT(b.id) as total_backups_runs,
  COUNT(DISTINCT s.id || ':' || b.backup_name) as total_backups,
  COALESCE(SUM(b.uploaded_size), 0) as total_uploaded_size,
  (
    SELECT COALESCE(SUM(b2.known_file_size), 0)
    FROM backups b2
    INNER JOIN (
      SELECT server_id, MAX(date) as max_date
      FROM backups
      GROUP BY server_id
    ) latest ON b2.server_id = latest.server_id AND b2.date = latest.max_date
  ) as total_storage_used,
  (
    SELECT COALESCE(SUM(b2.size_of_examined_files), 0)
    FROM backups b2
    INNER JOIN (
      SELECT server_id, MAX(date) as max_date
      FROM backups
      GROUP BY server_id
    ) latest ON b2.server_id = latest.server_id AND b2.date = latest.max_date
  ) as total_backuped_size
FROM servers s
LEFT JOIN backups b ON b.server_id = s.id;
```

### Datenbankbereinigung {#database-cleanup}

```sql
-- Delete old backups (older than 30 days)
DELETE FROM backups 
WHERE date < datetime('now', '-30 days');

-- Delete servers with no backups
DELETE FROM servers 
WHERE id NOT IN (SELECT DISTINCT server_id FROM backups);
```

## JSON-zu-Datenbank-Zuordnung {#json-to-database-mapping}

### API-Anforderungstext zu Datenbankspalten-Zuordnung {#api-request-body-to-database-columns-mapping}

Wenn Duplicati Sicherungsdaten über HTTP POST sendet, wird die JSON-Struktur auf Datenbankspalten abgebildet:

```json
{
  "Data": {
    "ExaminedFiles": 15399,           // → examined_files
    "OpenedFiles": 1861,              // → opened_files
    "AddedFiles": 1861,               // → added_files
    "SizeOfExaminedFiles": 11086692615, // → size_of_examined_files
    "SizeOfOpenedFiles": 13450481,    // → size_of_opened_files
    "SizeOfAddedFiles": 13450481,     // → size_of_added_files
    "SizeOfModifiedFiles": 0,         // → size_of_modified_files
    "ParsedResult": "Success",        // → status
    "BeginTime": "2025-04-21T23:45:46.9712217Z", // → begin_time and date
    "Duration": "00:00:51.3856057",   // → duration_seconds (calculated)
    "WarningsActualLength": 0,        // → warnings_actual_length
    "ErrorsActualLength": 0           // → errors_actual_length
  },
  "Extra": {
    "machine-id": "66f5ffc7ff474a73a3c9cba4ac7bfb65", // → server_id
    "machine-name": "WSJ-SER5",       // → server name
    "backup-name": "WSJ-SER5 Local files", // → backup_name
    "backup-id": "DB-2"               // → backup_id
  }
}
```

**Hinweis**: Das Feld `size` in der Sicherungstabelle speichert `SizeOfExaminedFiles` und `uploaded_size` speichert die tatsächliche hochgeladene/übertragene Größe aus dem Sicherungsvorgang.
