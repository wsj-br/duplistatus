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

- **Schema v1.0** (Anwendung v0.6.x und früher): Erstes Datenbankschema mit Tabellen für machines und backups
- **Schema v2.0** (Anwendung v0.7.x): Hinzufügen fehlender Spalten und Tabelle für Konfigurationen
- **Schema v3.0** (Anwendung v0.7.x): Umbenennung der machines-Tabelle in servers, Hinzufügen der Spalte server_url
- **Schema v3.1** (Anwendung v0.8.x): Verbesserung der Sicherungsdatenfelder, Hinzufügen der Spalte server_password
- **Schema v4.0** (Anwendung v0.9.x / v1.0.x): Hinzufügen der Benutzerzugriffskontrolle (Tabellen users, sessions, audit_log)

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

| Feld              | Typ               | Beschreibung                                   |
|-------------------|-------------------|------------------------------------------------|
| `id`              | TEXT PRIMARY KEY  | Eindeutige Serverkennung                       |
| `name`            | TEXT NOT NULL     | Servername aus Duplicati                         |
| `server_url`      | TEXT              | Duplicati-Server-URL                             |
| `alias`           | TEXT              | Benutzerdefinierter Anzeigename                  |
| `note`            | TEXT              | Benutzerdefinierte Notizen/Beschreibung          |
| `server_password` | TEXT              | Serverpasswort für die Authentifizierung         |
| `created_at`      | DATETIME          | Erstellungszeitstempel des Servers               |

### Sicherungen-Tabelle {#backups-table}

Speichert Sicherungsvorgangsdaten, die von Duplicati-Servern empfangen werden.

#### Schlüsselfelder {#key-fields}

| Feld               | Typ                | Beschreibung                                     |
|--------------------|--------------------|--------------------------------------------------|
| `id`               | TEXT PRIMARY KEY   | Eindeutige Sicherungskennung                     |
| `server_id`        | TEXT NOT NULL     | Verweis auf Servertabelle                     |
| `backup_name`      | TEXT NOT NULL     | Name des Sicherungsauftrags                                |
| `backup_id`        | TEXT NOT NULL     | Sicherungs-ID von Duplicati                       |
| `date`             | DATETIME NOT NULL | Ausführungszeitpunkt der Sicherung                          |
| `status`           | TEXT NOT NULL     | Sicherungsstatus (Erfolg, Warnung, Fehler, Schwerwiegend) |
| `duration_seconds` | INTEGER NOT NULL  | Dauer in Sekunden                            |
| `size`             | INTEGER           | Größe der Quelldateien                           |
| `uploaded_size`    | INTEGER           | Größe der hochgeladenen Daten                          |
| `examined_files`   | INTEGER           | Anzahl der untersuchten Dateien                       |
| `warnings`         | INTEGER           | Anzahl der Warnungen                             |
| `errors`           | INTEGER           | Anzahl der Fehler                               |
| `created_at`       | DATETIME          | Zeitstempel der Datensatzerstellung                      |

#### Message Arrays (JSON Speicherplatz) {#message-arrays-json-storage}

| Feld               | Typ | Beschreibung                             |
|---------------------|------|-----------------------------------------|
| `messages_array`    | TEXT | JSON-Array mit Protokollnachrichten              |
| `warnings_array`    | TEXT | JSON-Array mit Warnmeldungen          |
| `errors_array`      | TEXT | JSON-Array mit Fehlermeldungen            |
| `available_backups` | TEXT | JSON-Array mit verfügbaren Sicherungsversionen |

#### Dateioperations-Felder {#file-operation-fields}

| Feld                 | Typ    | Beschreibung                  |
|-----------------------|---------|------------------------------|
| `examined_files`      | INTEGER | Bei der Sicherung untersuchte Dateien |
| `opened_files`        | INTEGER | Zum Sichern geöffnete Dateien      |
| `added_files`         | INTEGER | Neue Dateien zur Sicherung hinzugefügt    |
| `modified_files`      | INTEGER | In der Sicherung geänderte Dateien     |
| `deleted_files`       | INTEGER | Aus der Sicherung gelöschte Dateien    |
| `deleted_folders`     | INTEGER | Aus der Sicherung gelöschte Ordner  |
| `added_folders`       | INTEGER | Dem Backup hinzugefügte Ordner      |
| `modified_folders`    | INTEGER | In der Sicherung geänderte Ordner   |
| `not_processed_files` | INTEGER | Nicht verarbeitete Dateien          |
| `too_large_files`     | INTEGER | Zu große Dateien zur Verarbeitung   |
| `files_with_error`    | INTEGER | Dateien mit Fehlern            |
| `added_symlinks`      | INTEGER | Hinzugefügte symbolische Verknüpfungen         |
| `modified_symlinks`   | INTEGER | Geänderte symbolische Verknüpfungen      |
| `deleted_symlinks`    | INTEGER | Gelöschte symbolische Verknüpfungen       |

#### Dateigröße-Felder {#file-size-fields}

| Feld                    | Typ    | Beschreibung                          |
|--------------------------|---------|--------------------------------------|
| `size_of_examined_files` | INTEGER | Größe der während der Sicherung untersuchten Dateien |
| `size_of_opened_files`   | INTEGER | Größe der zum Sichern geöffneten Dateien      |
| `size_of_added_files`    | INTEGER | Größe der neuen Dateien, die der Sicherung hinzugefügt wurden    |
| `size_of_modified_files` | INTEGER | Größe der in der Sicherung geänderten Dateien     |

#### Felder des Betriebsstatus {#operation-status-fields}

| Feld                    | Typ              | Beschreibung                    |
|--------------------------|-------------------|--------------------------------|
| `parsed_result`          | TEXT NOT NULL     | Geparstes Operationsergebnis        |
| `main_operation`         | TEXT NOT NULL     | Hauptoperationstyp            |
| `interrupted`            | BOOLEAN           | Gibt an, ob die Sicherung unterbrochen wurde |
| `partial_backup`         | BOOLEAN           | Gibt an, ob die Sicherung teilweise war     |
| `dryrun`                 | BOOLEAN           | Gibt an, ob die Sicherung ein Trockenlauf war   |
| `version`                | TEXT              | Verwendete Duplicati-Version         |
| `begin_time`             | DATETIME NOT NULL | Startzeit der Sicherung              |
| `end_time`               | DATETIME NOT NULL | Endzeit der Sicherung                |
| `warnings_actual_length` | INTEGER           | Tatsächliche Anzahl der Warnungen          |
| `errors_actual_length`   | INTEGER           | Tatsächliche Anzahl der Fehler            |
| `messages_actual_length` | INTEGER           | Tatsächliche Anzahl der Nachrichten          |

#### Backend-Statistiken-Felder {#backend-statistics-fields}

| Feld                            | Typ     | Beschreibung                       |
|----------------------------------|----------|-----------------------------------|
| `bytes_downloaded`               | INTEGER  | Vom Zielort heruntergeladene Bytes |
| `known_file_size`                | INTEGER  | Bekannte Dateigröße am Zielort    |
| `last_backup_date`               | DATETIME | Datum der letzten Sicherung am Zielort   |
| `backup_list_count`              | INTEGER  | Anzahl der Sicherungsversionen         |
| `reported_quota_error`           | BOOLEAN  | Quota-Fehler gemeldet              |
| `reported_quota_warning`         | BOOLEAN  | Quota-Warnung gemeldet            |
| `backend_main_operation`         | TEXT     | Hauptoperation des Backends            |
| `backend_parsed_result`          | TEXT     | Geparstes Ergebnis des Backends             |
| `backend_interrupted`            | BOOLEAN  | Backend-Operation unterbrochen     |
| `backend_version`                | TEXT     | Backend-Version                   |
| `backend_begin_time`             | DATETIME | Startzeit der Backend-Operation      |
| `backend_duration`               | TEXT     | Dauer der Backend-Operation        |
| `backend_warnings_actual_length` | INTEGER  | Anzahl der Backend-Warnungen            |
| `backend_errors_actual_length`   | INTEGER  | Anzahl der Backend-Fehler              |

### Konfigurationstabelle {#configurations-table}

Speichert Anwendungskonfigurationseinstellungen.

#### Felder {#fields-1}

| Feld   | Typ                      | Beschreibung                |
|---------|---------------------------|----------------------------|
| `key`   | TEXT PRIMARY KEY NOT NULL | Konfigurationsschlüssel          |
| `value` | TEXT                      | Konfigurationswert (JSON) |

#### Allgemeine Konfigurationsschlüssel {#common-configuration-keys}

- `email_config`: E-Mail-Benachrichtigungseinstellungen
- `ntfy_config`: NTFY-Benachrichtigungseinstellungen
- `overdue_tolerance`: Toleranzeinstellungen für verspätete Sicherungen
- `notification_templates`: Vorlagen für Benachrichtigungsnachrichten
- `audit_retention_days`: Dauer der Audit-Protokoll-Beibehaltung (Standard: 90 Tage)

### Datenbankversionstabelle {#database-version-table}

Verfolgt die Datenbankschema-Version für Migrationszwecke.

#### Felder {#fields-2}

| Feld        | Typ             | Beschreibung                |
|--------------|------------------|----------------------------|
| `version`    | TEXT PRIMARY KEY | Datenbankversion           |
| `applied_at` | DATETIME         | Wann die Migration angewendet wurde |

### Benutzer-Tabelle {#users-table}

Speichert Benutzerkonteninformationen für Authentifizierung und Zugriffskontrolle.

#### Felder {#fields-3}

| Feld                   | Typ                 | Beschreibung                         |
|-------------------------|----------------------|-------------------------------------|
| `id`                    | TEXT PRIMARY KEY     | Eindeutige Benutzerkennung              |
| `username`              | TEXT UNIQUE NOT NULL | Benutzername für die Anmeldung                  |
| `password_hash`         | TEXT NOT NULL        | Mit Bcrypt gehashtes Passwort              |
| `is_admin`              | BOOLEAN NOT NULL     | Gibt an, ob der Benutzer Administratorrechte hat   |
| `must_change_password`  | BOOLEAN              | Gibt an, ob eine Passwortänderung erforderlich ist |
| `created_at`            | DATETIME             | Zeitstempel der Kontoerstellung          |
| `updated_at`            | DATETIME             | Zeitstempel der letzten Aktualisierung               |
| `last_login_at`         | DATETIME             | Zeitstempel der letzten erfolgreichen Anmeldung     |
| `last_login_ip`         | TEXT                 | IP-Adresse der letzten Anmeldung            |
| `failed_login_attempts` | INTEGER              | Anzahl fehlgeschlagener Anmeldeversuche      |
| `locked_until`          | DATETIME             | Sperrfrist des Kontos (falls gesperrt) |

### Sitzungstabelle {#sessions-table}

Speichert Benutzersitzungsdaten für Authentifizierung und Sicherheit.

#### Felder {#fields-4}

| Feld             | Typ              | Beschreibung                                                      |
|-------------------|-------------------|------------------------------------------------------------------|
| `id`              | TEXT PRIMARY KEY  | Sitzungskennung                                               |
| `user_id`         | TEXT              | Verweis auf die Benutzertabelle (kann für nicht authentifizierte Sitzungen null sein) |
| `created_at`      | DATETIME          | Zeitstempel der Sitzungserstellung                                       |
| `last_accessed`   | DATETIME          | Zeitstempel des letzten Zugriffs                                            |
| `expires_at`      | DATETIME NOT NULL | Zeitstempel des Sitzungsablaufs                                     |
| `ip_address`      | TEXT              | IP-Adresse des Sitzungsherkunftsorts                                     |
| `user_agent`    | TEXT                              | User-Agent-Zeichenfolge                                                 |
| `csrf_token`      | TEXT              | CSRF-Token für die Sitzung                                       |
| `csrf_expires_at` | DATETIME          | Ablauf des CSRF-Tokens |

### Audit-Log-Tabelle {#audit-log-table}

Speichert ein Audit-Trail von Benutzeraktionen und Systemereignissen.

#### Felder {#fields-5}

| Feld           | Typ                              | Beschreibung                                                       |
|-----------------|-----------------------------------|-------------------------------------------------------------------|
| `id`            | INTEGER PRIMARY KEY AUTOINCREMENT | Eindeutige Kennung des Audit-Log-Eintrags                                 |
| `timestamp`     | DATETIME                          | Zeitstempel des Ereignisses                                                   |
| `user_id`       | TEXT                              | Verweis auf Benutzertabelle (kann null sein)                               |
| `username`      | TEXT                              | Benutzername zum Zeitpunkt der Aktion                                        |
| `action`        | TEXT NOT NULL                     | Durchgeführte Aktion                                                  |
| `category`      | TEXT NOT NULL                     | Kategorie der Aktion (z. B. 'authentication', 'settings', 'backup') |
| `target_type`   | TEXT                              | Typ des Ziels (z. B. 'server', 'backup', 'user')                 |
| `target_id`     | TEXT                              | Kennung des Ziels                                              |
| `details`       | TEXT                              | Zusätzliche Details (JSON)                                         |
| `ip_address`    | TEXT                              | IP-Adresse des Anfragenden                                           |
| `user_agent`    | TEXT                              | User-Agent-Zeichenfolge                                                 |
| `status`        | TEXT NOT NULL                     | Status der Aktion ('success', 'failure', 'error')                  |
| `error_message` | TEXT                              | Fehlermeldung, falls die Aktion fehlgeschlagen ist                                    |

## Sitzungsverwaltung {#session-management}

### Datenbankgestützter Speicherplatz für Sitzungen {#database-backed-session-storage}

Sitzungen werden in der Datenbank mit einem In-Memory-Fallback gespeichert:
- **Primärer Speicher**: Datenbankbasierte Sitzungstabelle
- **Fallback**: In-Memory-Speicherung (Legacy-Unterstützung oder Fehlerfälle)
- **Sitzungs-ID**: Kryptografisch sicherer Zufallsstring
- **Ablauf**: Konfigurierbare Sitzungszeitüberschreitung
- **CSRF-Schutz**: Schutz vor Cross-Site-Request-Forgery
- **Automatische Bereinigung**: Abgelaufene Sitzungen werden automatisch entfernt

### Session-API-Endpunkte {#session-api-endpoints}

- `POST /api/session`: Neue Sitzung erstellen
- `GET /api/session`: Vorhandene Sitzung validieren
- `DELETE /api/session`: Sitzung beenden
- `GET /api/csrf`: CSRF-Token abrufen

## Indizes {#indexes}

Die Datenbank enthält mehrere Indizes für optimale Abfrageleistung:

- **Primärschlüssel**: Alle Tabellen verfügen über Primärschlüsselindizes
- **Fremdschlüssel**: Server-Referenzen in der Backups-Tabelle, Benutzer-Referenzen in den Tabellen sessions und audit_log
- **Abfrageoptimierung**: Indizes für häufig abgefragte Felder
- **Datumsindizes**: Indizes für Datumsfelder zur Unterstützung zeitbasierter Abfragen
- **Benutzerindizes**: Index für Benutzernamen zur schnellen Benutzersuche
- **Sitzungsindizes**: Indizes für Ablaufdatum und user_id zur Sitzungsverwaltung
- **Audit-Indizes**: Indizes für Zeitstempel, user_id, Aktion, Kategorie und Status für Audit-Abfragen

## Beziehungen {#relationships}

- **Server → Sicherungen**: Eins-zu-viele-Beziehung
- **Benutzer → Sitzungen**: Eins-zu-viele-Beziehung (Sitzungen können ohne Benutzer existieren)
- **Benutzer → Audit-Log**: Eins-zu-viele-Beziehung (Audit-Einträge können ohne Benutzer existieren)
- **Sicherungen → Nachrichten**: Eingebettete JSON-Arrays
- **Konfigurationen**: Schlüssel-Wert-Speicher

## Datentypen {#data-types}

- **TEXT**: Zeichenkettendaten, JSON-Arrays
- **INTEGER**: Numerische Daten, Dateianzahlen, Größenangaben
- **REAL**: Gleitkommazahlen, Dauerangaben
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
