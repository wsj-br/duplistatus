# Datenbankschema {/* #database-schema */}

Dieses Dokument beschreibt das SQLite-Datenbankschema, das von duplistatus zur Speicherung von Sicherungsdaten verwendet wird.

## Datenbankstandort {/* #database-location */}

Die Datenbank wird im Anwendungsdatenverzeichnis gespeichert:
- **Standardort**: `/app/data/backups.db`
- **Docker-Volumen**: `duplistatus_data:/app/data`
- **Dateiname**: `backups.db`

## Datenbankmigrationssystem {/* #database-migration-system */}

duplistatus verwendet ein automatisiertes Migrationssystem zur Handhabung von Datenbankschemaänderungen zwischen Versionen.

### Migrationsversionsverlauf {/* #migration-version-history */}

Die folgenden historischen Migrationsversionen haben das Datenbankschema in seinen aktuellen Zustand gebracht:

- **Schema v1.0** (Anwendung v0.6.x und früher): Initiales Datenbankschema mit Maschinen- und Sicherungstabellen
- **Schema v2.0** (Anwendung v0.7.x): Hinzufügen fehlender Spalten und Konfigurationstabelle
- **Schema v3.0** (Anwendung v0.7.x): Umbenennung der Maschinentabelle in Server, Hinzufügen der server_url-Spalte
- **Schema v3.1** (Anwendung v0.8.x): Verbesserung der Sicherungsdatenfelder, Hinzufügen der server_password-Spalte
- **Schema v4.0** (Anwendung v0.9.x / v1.0.x): Hinzufügen der Benutzerzugriffskontrolle (Benutzer-, Sitzungs- und audit_log-Tabellen)
- **Schema v4.1** (Anwendung v1.5.x): Hinzufügen von `api_keys` und Standardkonfigurationsschlüsseln für optionale API-Schlüsselauthentifizierung, IP-Zulassungslisten und Uploadlimits
- **Schema v4.2** (Anwendung v1.5.x): Hinzufügen von `daily_summary_deliveries` Buchhaltung und Standard`daily_summary`-Konfiguration für optionale tägliche Zusammenfassungsbenachrichtigungen

Die aktuelle Anwendungsversion (v1.5.x) verwendet **Schema v4.2** als neueste Datenbankschemaversion.

### Migrationsprozess {/* #migration-process */}

1. **Automatische Sicherung**: Erstellt eine Sicherung vor der Migration
2. **Schemaaktualisierung**: Aktualisiert die Datenbankstruktur
3. **Datenmigration**: Behält bestehende Daten bei
4. **Überprüfung**: Bestätigt die erfolgreiche Migration

## Tabellen {/* #tables */}

### Server-Tabelle {/* #servers-table */}

Speichert Informationen über die Duplicati-Server, die überwacht werden.

#### Felder {/* #fields */}

| Feld              | Typ              | Beschreibung                        |
|-------------------|------------------|------------------------------------|
| `id`              | TEXT PRIMARY KEY | Eindeutiger Serverkennzeichner           |
| `name`            | TEXT NOT NULL    | Servername von Duplicati         |
| `server_url`      | TEXT             | Duplicati-Server-URL               |
| `alias`           | TEXT             | Benutzerdefinierter Anzeigename         |
| `note`            | TEXT             | Benutzerdefinierte Notizen/Beschreibung     |
| `server_password` | TEXT             | Server-Passwort für die Authentifizierung |
| `created_at`      | DATETIME         | Server-Erstellungszeitstempel          |

### Backups-Tabelle {/* #backups-table */}

Speichert Sicherungsdaten, die von Duplicati-Servern empfangen wurden.

#### Wichtige Felder {/* #key-fields */}

| Feld              | Typ              | Beschreibung                                    |
|--------------------|-------------------|------------------------------------------------|
| `id`               | TEXT PRIMARY KEY  | Eindeutiger Sicherungsbezeichner                       |
| `server_id`        | TEXT NOT NULL     | Verweis auf die Server-Tabelle                     |
| `backup_name`      | TEXT NOT NULL     | Name des Sicherungsauftrags                                |
| `backup_id`        | TEXT NOT NULL     | Sicherungs-ID von Duplicati                       |
| `date`             | DATETIME NOT NULL | Ausführungszeit der Sicherung                          |
| `status`           | TEXT NOT NULL     | Sicherungsstatus (Erfolgreich, Warnung, Fehler, Fatal) |
| `duration_seconds` | INTEGER NOT NULL  | Dauer in Sekunden                            |
| `size`             | INTEGER           | Größe der Quelldateien                           |
| `uploaded_size`    | INTEGER           | Größe der hochgeladenen Daten                          |
| `examined_files`   | INTEGER           | Anzahl der untersuchten Dateien                       |
| `warnings`         | INTEGER           | Anzahl der Warnungen                             |
| `errors`           | INTEGER           | Anzahl der Fehler                               |
| `created_at`       | DATETIME          | Zeitstempel der Datensatz-Erstellung                      |

#### Nachrichtenarrays (JSON-Speicher) {/* #message-arrays-json-storage */}

| Feld                | Typ  | Beschreibung                             |
|---------------------|------|-----------------------------------------|
| `messages_array`    | TEXT | JSON-Array von Protokollnachrichten              |
| `warnings_array`    | TEXT | JSON-Array von Warnmeldungen          |
| `errors_array`      | TEXT | JSON-Array von Fehlermeldungen            |
| `available_backups` | TEXT | JSON-Array von verfügbaren Sicherungsversionen |

#### Dateioperationsfelder {/* #file-operation-fields */}

| Feld                 | Typ     | Beschreibung                  |
|-----------------------|---------|------------------------------|
| `examined_files`      | INTEGER | Dateien, die während der Sicherung untersucht wurden |
| `opened_files`        | INTEGER | Dateien, die für die Sicherung geöffnet wurden      |
| `added_files`         | INTEGER | Neue Dateien, die zur Sicherung hinzugefügt wurden    |
| `modified_files`      | INTEGER | Dateien, die in der Sicherung geändert wurden     |
| `deleted_files`       | INTEGER | Dateien, die aus der Sicherung gelöscht wurden    |
| `deleted_folders`     | INTEGER | Ordner, die aus der Sicherung gelöscht wurden  |
| `added_folders`       | INTEGER | Ordner, die zur Sicherung hinzugefügt wurden      |
| `modified_folders`    | INTEGER | Ordner, die in der Sicherung geändert wurden   |
| `not_processed_files` | INTEGER | Dateien, die nicht verarbeitet wurden          |
| `too_large_files`     | INTEGER | Dateien, die zu groß zum Verarbeiten sind   |
| `files_with_error`    | INTEGER | Dateien mit Fehlern            |
| `added_symlinks`      | INTEGER | Symbolische Links hinzugefügt         |
| `modified_symlinks`   | INTEGER | Symbolische Links geändert      |
| `deleted_symlinks`    | INTEGER | Symbolische Links gelöscht       |

#### Dateigrößenfelder {/* #file-size-fields */}

| Feld                     | Typ     | Beschreibung                          |
|--------------------------|---------|--------------------------------------|
| `size_of_examined_files` | INTEGER | Größe der während der Sicherung untersuchten Dateien |
| `size_of_opened_files`   | INTEGER | Größe der für die Sicherung geöffneten Dateien      |
| `size_of_added_files`    | INTEGER | Größe der neuen Dateien, die der Sicherung hinzugefügt wurden    |
| `size_of_modified_files` | INTEGER | Größe der in der Sicherung geänderten Dateien     |

#### Betriebsstatusfelder {/* #operation-status-fields */}

| Feld                     | Typ              | Beschreibung                    |
|--------------------------|-------------------|--------------------------------|
| `parsed_result`          | TEXT NOT NULL     | Ergebnis der analysierten Operation        |
| `main_operation`         | TEXT NOT NULL     | Haupttyp der Operation            |
| `interrupted`            | BOOLEAN           | Ob die Sicherung unterbrochen wurde |
| `partial_backup`         | BOOLEAN           | Ob die Sicherung unvollständig war     |
| `dryrun`                 | BOOLEAN           | Ob die Sicherung ein Trockenlauf war   |
| `version`                | TEXT              | Verwendete Duplicati-Version         |
| `begin_time`             | DATETIME NOT NULL | Startzeit der Sicherung              |
| `end_time`               | DATETIME NOT NULL | Endzeit der Sicherung                |
| `warnings_actual_length` | INTEGER           | Tatsächliche Anzahl der Warnungen          |
| `errors_actual_length`   | INTEGER           | Tatsächliche Anzahl der Fehler            |
| `messages_actual_length` | INTEGER           | Tatsächliche Anzahl der Nachrichten          |

#### Backend-Statistikfelder {/* #backend-statistics-fields */}

| Feld                            | Typ     | Beschreibung                       |
|----------------------------------|----------|-----------------------------------|
| `bytes_downloaded`               | INTEGER  | Vom Ziel heruntergeladene Bytes |
| `known_file_size`                | INTEGER  | Bekannte Dateigröße am Ziel    |
| `last_backup_date`               | DATETIME | Datum des letzten Backups auf dem Ziel   |
| `backup_list_count`              | INTEGER  | Anzahl der Backup-Versionen         |
| `reported_quota_error`           | BOOLEAN  | Quota-Fehler gemeldet              |
| `reported_quota_warning`         | BOOLEAN  | Quota-Warnung gemeldet            |
| `backend_main_operation`         | TEXT     | Hauptoperation des Backends            |
| `backend_parsed_result`          | TEXT     | Ergebnis der Backend-Analyse             |
| `backend_interrupted`            | BOOLEAN  | Backend-Operation unterbrochen     |
| `backend_version`                | TEXT     | Backend-Version                   |
| `backend_begin_time`             | DATETIME | Startzeit der Backend-Operation      |
| `backend_duration`               | TEXT     | Dauer der Backend-Operation        |
| `backend_warnings_actual_length` | INTEGER  | Anzahl der Backend-Warnungen            |
| `backend_errors_actual_length`   | INTEGER  | Anzahl der Backend-Fehler              |

### Konfigurationstabelle {/* #configurations-table */}

Speichert die Anwendungskonfigurationseinstellungen.

#### Felder {/* #fields-1 */}

| Feld   | Typ                      | Beschreibung                |
|---------|---------------------------|----------------------------|
| `key`   | TEXT PRIMARY KEY NOT NULL | Konfigurationsschlüssel          |
| `value` | TEXT                      | Konfigurationswert (JSON) |

#### Gemeinsame Konfigurationsschlüssel {/* #common-configuration-keys */}

- `email_config`: E-Mail-Benachrichtigungseinstellungen
- `ntfy_config`: NTFY-Benachrichtigungseinstellungen
- `overdue_tolerance`: Einstellungen für überfällige Backups
- `notification_templates`: Benachrichtigungsnachrichtenvorlagen
- `daily_summary`: Täglicher Zusammenfassungsmodus, Zeitplan, Zeitzone, optionale öffentliche Dashboard-URL und optionaler SMTP-Empfänger-Override (`smtpRecipient`; leer verwendet E-Mail-Einstellungen)
- `cron_service`: Zeitplanaufgaben, einschließlich `daily-summary-dispatch` (`minute hour * * *` von `daily_summary.utcTime`)
- `audit_retention_days`: Aufbewahrungsdauer des Prüfprotokolls (Standard: 90 Tage)

### Datenbankversionstabelle {/* #database-version-table */}

Verfolgt die Datenbankschema-Version für Migrationszwecke.

#### Felder {/* #fields-2 */}

| Feld         | Typ              | Beschreibung                |
|--------------|------------------|----------------------------|
| `version`    | TEXT PRIMARY KEY | Datenbankversion           |
| `applied_at` | DATETIME         | Wann die Migration angewendet wurde |

### Benutzertabelle {/* #users-table */}

Speichert Benutzerkontoinformationen für Authentifizierung und Zugriffskontrolle.

#### Felder {/* #fields-3 */}

| Feld                   | Typ                 | Beschreibung                         |
|-------------------------|----------------------|-------------------------------------|
| `id`                    | TEXT PRIMARY KEY     | Eindeutige Benutzer-ID              |
| `username`              | TEXT UNIQUE NOT NULL | Benutzername für die Anmeldung                  |
| `password_hash`         | TEXT NOT NULL        | Bcrypt gehashtes Passwort              |
| `is_admin`              | BOOLEAN NOT NULL     | Ob der Benutzer Admin-Rechte hat   |
| `must_change_password`  | BOOLEAN              | Ob eine Passwortänderung erforderlich ist |
| `created_at`            | DATETIME             | Zeitstempel der Kontoerstellung          |
| `updated_at`       | DATETIME         | Zeitstempel der letzten Aktualisierung                                                       |
| `last_login_at`         | DATETIME             | Zeitstempel der letzten erfolgreichen Anmeldung     |
| `last_login_ip`         | TEXT                 | IP-Adresse der letzten Anmeldung            |
| `failed_login_attempts` | INTEGER              | Anzahl der fehlgeschlagenen Anmeldeversuche      |
| `locked_until`          | DATETIME             | Sperrungsende des Kontos (falls gesperrt) |

### Sitzungstabelle {/* #sessions-table */}

Speichert Benutzer-Sitzungsdaten für die Authentifizierung und Sicherheit.

#### Felder {/* #fields-4 */}

| Feld              | Typ               | Beschreibung                                                      |
|-------------------|-------------------|------------------------------------------------------------------|
| `id`              | TEXT PRIMARY KEY  | Sitzungs-ID                                                     |
| `user_id`         | TEXT              | Verweis auf die Benutzer-Tabelle (kann NULL sein für nicht authentifizierte Sitzungen) |
| `created_at`      | DATETIME          | Sitzungs-Erstellungszeitstempel                                       |
| `last_accessed`   | DATETIME          | Letzter Zugriffszeitstempel                                            |
| `expires_at`      | DATETIME NOT NULL | Sitzungs-Ablaufzeitstempel                                     |
| `ip_address`      | TEXT              | IP-Adresse des Sitzungsursprungs                                     |
| `user_agent`    | TEXT                              | Benutzer-Agent-String                                                 |
| `csrf_token`      | TEXT              | CSRF-Token für die Sitzung                                       |
| `csrf_expires_at` | DATETIME          | CSRF-Token-Ablauf                                            |

### Audit-Protokoll-Tabelle {/* #audit-log-table */}

Speichert den Audit-Trail von Benutzer-Aktionen und System-Ereignissen.

#### Felder {/* #fields-5 */}

| Feld           | Typ                              | Beschreibung                                                       |
|-----------------|-----------------------------------|-------------------------------------------------------------------|
| `id`            | INTEGER PRIMARY KEY AUTOINCREMENT | Eindeutige Audit-Protokoll-Eintrags-ID                                 |
| `timestamp`     | DATETIME                          | Ereigniszeitstempel                                                   |
| `user_id`       | TEXT                              | Verweis auf die Benutzer-Tabelle (kann NULL sein)                               |
| `username`      | TEXT                              | Benutzername zum Zeitpunkt der Aktion                                        |
| `action`        | TEXT NOT NULL                     | Ausgeführte Aktion                                                  |
| `category`      | TEXT NOT NULL                     | Kategorie der Aktion (z. B. 'Authentifizierung', 'Einstellungen', 'Sicherung') |
| `target_type`   | TEXT                              | Typ des Ziels (z. B. 'Server', 'Sicherung', 'Benutzer')                 |
| `target_id`     | TEXT                              | Kennung des Ziels                                              |
| `details`       | TEXT                              | Zusätzliche Details (JSON)                                         |
| `ip_address`    | TEXT                              | IP-Adresse des Anforderers                                           |
| `user_agent`    | TEXT                              | Benutzer-Agent-String                                                 |
| `status`        | TEXT NOT NULL                     | Status der Aktion ('Erfolgreich', 'Fehler', 'Fehlermeldung')                  |
| `error_message` | TEXT                              | Fehlermeldung, falls die Aktion fehlgeschlagen ist                                    |

### API-Schlüssel-Tabelle {/* #api-keys-table */}

Speichert gehaschte API-Schlüssel für die externen HTTP-APIs. Das Klartext-Geheimnis wird einmal bei der Erstellung angezeigt und wird nie gespeichert.

#### Felder {/* #fields-6 */}

| Feld          | Typ             | Beschreibung                                              |
|----------------|------------------|----------------------------------------------------------|
| `id`           | TEXT PRIMARY KEY | Eindeutige Schlüsselkennung                                    |
| `name`         | TEXT NOT NULL    | Anzeigename                                             |
| `key_hash`     | TEXT UNIQUE      | SHA-256-Hash des Geheimnisses                               |
| `key_prefix`   | TEXT             | Erste vier Zeichen des Geheimnisses (für Fingerabdrücke)   |
| `key_suffix`   | TEXT             | Letzte vier Zeichen des Geheimnisses (für Fingerabdrücke)    |
| `scope`        | TEXT NOT NULL    | `upload` oder `read`                                       |
| `description`  | TEXT             | Optionale Beschreibung                                     |
| `enabled`      | INTEGER          | `1` wenn der Schlüssel aktiv ist                               |
| `created_at`   | DATETIME         | Erstellungszeitstempel                                       |
| `created_by`   | TEXT             | Benutzer-ID des Administrators, der den Schlüssel erstellt hat         |
| `expires_at`   | DATETIME         | Optionales Ablaufdatum                                          |
| `last_used_at` | DATETIME         | Letzte erfolgreiche Nutzung                                      |
| `usage_count`  | INTEGER          | Anzahl der erfolgreichen Nutzungen                                     |

Verwandte Konfigurationsschlüssel in der `configurations`-Tabelle: `external_api_require_api_key`, `ip_trusted_proxies`, `admin_ip_allowlist`, `external_api_ip_allowlist`, `upload_limits`.

### Tägliche Zusammenfassung der Lieferungen {/* #daily-summary-deliveries-table */}

Kanalbasiertes Konto für die Lieferung der täglichen Zusammenfassung per E-Mail. Veraltete Zeilen können einen `ntfy`-Kanal aus früheren Versionen enthalten. Jede geplante Ausführung (oder eindeutige manuelle Sendung) hat pro Kanal maximal eine Zeile. Die gerenderten Nutzlasten werden vor dem Senden gespeichert, damit Wiederholungen die gleiche Momentaufnahme verwenden. Zeilen älter als 30 Tage werden gelöscht.

Wenn der Prozess nach der Annahme einer Nachricht durch einen Anbieter stirbt, bevor der Erfolg aufgezeichnet wird, kann dieser Kanal erneut versucht werden (mindestens einmal).

#### Felder {/* #fields-7 */}

| Feld              | Typ             | Beschreibung                                                                 |
|--------------------|------------------|-----------------------------------------------------------------------------|
| `id`               | TEXT PRIMARY KEY | Eindeutiger Lieferungsbezeichner                                                  |
| `occurrence_key`   | TEXT NOT NULL    | Geplanter Schlüssel `scheduled:UTC:{date}:{HH:mm}` oder `manual:{uuid}`             |
| `channel`          | TEXT NOT NULL    | `email` oder `ntfy`                                                           |
| `trigger`          | TEXT NOT NULL    | `scheduled`, `manual`, oder `retry`                                           |
| `summary_date`     | TEXT NOT NULL    | Lokales Kalenderdatum für die Momentaufnahme                                        |
| `time_zone`        | TEXT NOT NULL    | Gespeicherte IANA-Zeitzone                                                         |
| `payload_json`     | TEXT             | Gerendertes Betreff, HTML, Text und NTFY-Felder                               |
| `state`            | TEXT NOT NULL    | `pending`, `sending`, `sent`, oder `failed`                                   |
| `attempt_count`    | INTEGER          | Lieferungsversuche                                                           |
| `next_retry_at`    | DATETIME         | Wann ein fehlgeschlagener Kanal erneut versucht werden kann                                  |
| `lease_expires_at` | DATETIME         | Claim-Lease; eine veraltete Lease kann wiederhergestellt werden                                 |
| `error`            | TEXT             | Letzter Fehler, falls vorhanden                                                          |
| `created_at`       | DATETIME         | Zeitstempel der Zeilen-Erstellung                                                      |
| `updated_at`       | DATETIME         | Zeitstempel der letzten Aktualisierung                                                       |
| `sent_at`          | DATETIME         | Zeitstempel des Erfolgs                                                           |

Ein eindeutiger Index auf `(occurrence_key, channel)` verhindert das doppelte Senden desselben Vorkommens auf demselben Kanal.

## Sitzungsverwaltung {/* #session-management */}

### Sitzungs-Speicher mit Datenbank-Unterstützung {/* #database-backed-session-storage */}

Sitzungen werden in der Datenbank mit einem Speicher-Fallback gespeichert:
- **Primärer Speicher**: Sitzungen in der Datenbank
- **Fallback**: Speicher im Arbeitsspeicher (Legacy-Unterstützung oder Fehlerfälle)
- **Sitzungs-ID**: Kryptografisch sicherer zufälliger String
- **Ablauf**: Konfigurierbare Sitzungszeitüberschreitung
- **CSRF-Schutz**: Schutz vor Cross-Site-Request-Forgery
- **Automatische Bereinigung**: Abgelaufene Sitzungen werden automatisch entfernt

### Sitzungs-API-Endpunkte {/* #session-api-endpoints */}

- `POST /api/session`: Neue Sitzung erstellen
- `GET /api/session`: Bestehende Sitzung validieren
- `DELETE /api/session`: Sitzung beenden
- `GET /api/csrf`: CSRF-Token abrufen

## Indizes {/* #indexes */}

Die Datenbank enthält mehrere Indizes für optimale Abfrageleistung:

- **Primärschlüssel**: Alle Tabellen haben Primärschlüssel-Indizes
- **Fremdschlüssel**: Server-Referenzen in der Sicherungstabelle, Benutzer-Referenzen in Sitzungen und Audit-Protokoll
- **Abfrageoptimierung**: Indizes auf häufig abgefragte Felder
- **Datumsindizes**: Indizes auf Datumsfelder für zeitbasierte Abfragen
- **Benutzerindizes**: Benutzername-Index für schnelle Benutzerabfragen
- **Sitzungsindizes**: Ablauf- und Benutzer-ID-Indizes für Sitzungsverwaltung
- **Audit-Indizes**: Zeitstempel-, Benutzer-ID-, Aktions-, Kategorien- und Statusindizes für Audit-Abfragen
- **API-Schlüssel-Indizes**: Eindeutiger Hash, plus aktiviert/Bereich-Abfragen für Authentifizierung

## Beziehungen {/* #relationships */}

- **Server → Sicherungen**: Ein-zu-viele-Beziehung
- **Benutzer → Sitzungen**: Ein-zu-viele-Beziehung (Sitzungen können ohne Benutzer existieren)
- **Benutzer → Audit-Protokoll**: Ein-zu-viele-Beziehung (Audit-Einträge können ohne Benutzer existieren)
- **Benutzer → API-Schlüssel**: Ein-zu-viele-Beziehung über `created_by` (Schlüssel bleiben nach dem Löschen des Benutzers bestehen)
- **Sicherungen → Nachrichten**: Eingebettete JSON-Arrays
- **Konfigurationen**: Schlüssel-Wert-Speicher

## Datentypen {/* #data-types */}

- **TEXT**: Zeichenketten-Daten, JSON-Arrays
- **INTEGER**: Numerische Daten, Datei-Anzahlen, Größen
- **REAL**: Gleitkommazahlen, Dauer
- **DATETIME**: Zeitstempel-Daten
- **BOOLEAN**: Wahr/Falsch-Werte

## Statuswerte der Sicherung {/* #backup-status-values */}

- **Erfolgreich**: Sicherung erfolgreich abgeschlossen
- **Warnung**: Sicherung mit Warnungen abgeschlossen
- **Fehler**: Sicherung mit Fehlern abgeschlossen
- **Fatal**: Sicherung fehlgeschlagen

## Häufige Abfragen {/* #common-queries */}

### Letzte Sicherung für einen Server abrufen {/* #get-latest-backup-for-a-server */}

```sql
SELECT * FROM backups 
WHERE server_id = ? 
ORDER BY date DESC 
LIMIT 1;
```

### Alle Sicherungen für einen Server abrufen {/* #get-all-backups-for-a-server */}

```sql
SELECT * FROM backups 
WHERE server_id = ? 
ORDER BY date DESC;
```

### Serverzusammenfassung abrufen {/* #get-server-summary */}

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

### Gesamtzusammenfassung abrufen {/* #get-overall-summary */}

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

### Datenbankbereinigung {/* #database-cleanup */}

```sql
-- Delete old backups (older than 30 days)
DELETE FROM backups 
WHERE date < datetime('now', '-30 days');

-- Delete servers with no backups
DELETE FROM servers 
WHERE id NOT IN (SELECT DISTINCT server_id FROM backups);
```

## JSON-zu-Datenbank-Mapping {/* #json-to-database-mapping */}

### API-Anfragekörper zu Datenbankspalten-Mapping {/* #api-request-body-to-database-columns-mapping */}

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

**Notiz**: Das `size`-Feld in der Sicherungstabelle speichert `SizeOfExaminedFiles` und `uploaded_size` speichert die tatsächliche hochgeladene/übertragene Größe aus dem Sicherungsvorgang.
