# Datenbankschema {/* #database-schema */}

Dieses Dokument beschreibt das von duplistatus verwendete SQLite-Datenbankschema zum Speichern von Sicherungsoperationsdaten.

## Datenbankstandort {/* #database-location */}

Die Datenbank wird im Anwendungsdatenverzeichnis gespeichert:
- **Standardstandort**: `/app/data/backups.db`
- **Docker Volume**: `duplistatus_data:/app/data`
- **Dateiname**: `backups.db`

## Datenbank-Migrationssystem {/* #database-migration-system */}

duplistatus verwendet ein automatisches Migrationssystem zur Behandlung von Änderungen am Datenbankschema zwischen Versionen.

### Migrationsversionshistorie {/* #migration-version-history */}

Folgende sind historische Migrationsversionen, die die Datenbank in ihren aktuellen Zustand gebracht haben:

- **Schema v1.0** (Anwendung v0.6.x und früher): Initiales Datenbankschema mit Maschinen- und Sicherungstabellen
- **Schema v2.0** (Anwendung v0.7.x): Fehlende Spalten und Konfigurationstabelle hinzugefügt
- **Schema v3.0** (Anwendung v0.7.x): Maschinentabelle in Server umbenannt, server_url-Spalte hinzugefügt
- **Schema v3.1** (Anwendung v0.8.x): Sicherungsdatenfelder verbessert, server_password-Spalte hinzugefügt
- **Schema v4.0** (Anwendung v0.9.x / v1.0.x): Benutzerzugriffskontrolle hinzugefügt (Benutzer-, Sitzungs-, Audit_log-Tabellen)
- **Schema v4.1** (Anwendung v1.5.x): `api_keys` und Standardkonfigurationsschlüssel für optionale API-Schlüsselauthentifizierung, IP-Zulassungslisten und Upload-Limits hinzugefügt
- **Schema v4.2** (Anwendung v1.5.x): `daily_summary_deliveries`-Hauptbuch und Standard-`daily_summary`-Konfiguration für optionale tägliche Zusammenfassungsbenachrichtigungen hinzugefügt

Die aktuelle Anwendungsversion (v1.5.x) verwendet **Schema v4.2** als neueste Datenbankschemaversion.

### Migrationsprozess {/* #migration-process */}

1. **Automatische Sicherung**: Erstellt Sicherung vor der Migration
2. **Schema-Aktualisierung**: Aktualisiert Datenbankstruktur
3. **Datenmigration**: Erhält vorhandene Daten
4. **Überprüfung**: Bestätigt erfolgreiche Migration

## Tabellen {/* #tables */}

### Server-Tabelle {/* #servers-table */}

Speichert Informationen über zu überwachende Duplicati-Server.

#### Felder {/* #fields */}

| Feld              | Typ              | Beschreibung                       |
|-------------------|------------------|------------------------------------|
| `id`              | TEXT PRIMARY KEY | Eindeutiger Server-Identifier      |
| `name`            | TEXT NOT NULL    | Servername von Duplicati           |
| `server_url`      | TEXT             | Duplicati-Server-URL               |
| `alias`           | TEXT             | Benutzerdefinierter Anzeigename         |
| `note`            | TEXT             | Benutzerdefinierte Notizen/Beschreibung     |
| `server_password` | TEXT             | Server-Passwort für Authentifizierung |
| `created_at`      | DATETIME         | Zeitstempel der Server-Erstellung          |

### Sicherungen Tabelle {/* #backups-table */}

Speichert Sicherungsoperationsdaten, die von Duplicati-Servern empfangen wurden.

#### Wichtige Felder {/* #key-fields */}

| Feld              | Typ              | Beschreibung                                    |
|--------------------|-------------------|------------------------------------------------|
| `id`               | TEXT PRIMARY KEY  | Eindeutiger Sicherungsbezeichner                       |
| `server_id`        | TEXT NOT NULL     | Verweis auf Server-Tabelle                     |
| `backup_name`      | TEXT NOT NULL     | Name des Sicherungsauftrags                                |
| `backup_id`        | TEXT NOT NULL     | Sicherungs-ID von Duplicati                       |
| `date`             | DATETIME NOT NULL | Zeitpunkt der Sicherungsausführung                          |
| `status`           | TEXT NOT NULL     | Sicherungsstatus (Erfolgreich, Warnung, Fehler, Fatal) |
| `duration_seconds` | INTEGER NOT NULL  | Dauer in Sekunden                            |
| `size`             | INTEGER           | Größe der Quelldateien                           |
| `uploaded_size`    | INTEGER           | Größe der hochgeladenen Daten                          |
| `examined_files`   | INTEGER           | Anzahl der untersuchten Dateien                       |
| `warnings`         | INTEGER           | Anzahl der Warnungen                             |
| `errors`           | INTEGER           | Anzahl der Fehler                               |
| `created_at`       | DATETIME          | Zeitstempel der Datensatzerstellung                      |

#### Nachrichtenarrays (JSON-Speicher) {/* #message-arrays-json-storage */}

| Feld                | Typ  | Beschreibung                            |
|---------------------|------|-----------------------------------------|
| `messages_array`    | TEXT | JSON-Array von Protokollnachrichten     |
| `warnings_array`    | TEXT | JSON-Array von Warnmeldungen            |
| `errors_array`      | TEXT | JSON-Array von Fehlermeldungen          |
| `available_backups` | TEXT | JSON-Array von verfügbaren Sicherungsversionen |

#### Dateioperationsfelder {/* #file-operation-fields */}

| Feld                  | Typ     | Beschreibung                   |
|-----------------------|---------|------------------------------|
| `examined_files`      | INTEGER | Während der Sicherung untersuchte Dateien |
| `opened_files`        | INTEGER | Für die Sicherung geöffnete Dateien |
| `added_files`         | INTEGER | Der Sicherung hinzugefügte neue Dateien |
| `modified_files`      | INTEGER | In der Sicherung geänderte Dateien |
| `deleted_files`       | INTEGER | Aus der Sicherung gelöschte Dateien |
| `deleted_folders`     | INTEGER | Aus der Sicherung gelöschte Ordner |
| `added_folders`       | INTEGER | Der Sicherung hinzugefügte Ordner |
| `modified_folders`    | INTEGER | In der Sicherung geänderte Ordner |
| `not_processed_files` | INTEGER | Nicht verarbeitete Dateien     |
| `too_large_files`     | INTEGER | Zu große Dateien zur Verarbeitung |
| `files_with_error`    | INTEGER | Dateien mit Fehlern            |
| `added_symlinks`      | INTEGER | Hinzugefügte symbolische Links |
| `modified_symlinks`   | INTEGER | Geänderte symbolische Links    |
| `deleted_symlinks`    | INTEGER | Gelöschte symbolische Links    |

#### Dateigröße-Felder {/* #file-size-fields */}

| Feld                    | Typ    | Beschreibung                          |
|--------------------------|---------|--------------------------------------|
| `size_of_examined_files` | INTEGER | Größe der Dateien, die während der Sicherung untersucht wurden |
| `size_of_opened_files`   | INTEGER | Größe der Dateien, die für die Sicherung geöffnet wurden      |
| `size_of_added_files`    | INTEGER | Größe der neuen Dateien, die zur Sicherung hinzugefügt wurden    |
| `size_of_modified_files` | INTEGER | Größe der Dateien, die in der Sicherung geändert wurden     |

#### Betriebsstatus-Felder {/* #operation-status-fields */}

| Feld                    | Typ              | Beschreibung                    |
|--------------------------|-------------------|--------------------------------|
| `parsed_result`          | TEXT NOT NULL     | Geparstes Operationsresultat        |
| `main_operation`         | TEXT NOT NULL     | Hauptoperationstyp            |
| `interrupted`            | BOOLEAN           | Ob die Sicherung unterbrochen wurde |
| `partial_backup`         | BOOLEAN           | Ob die Sicherung teilweise war     |
| `dryrun`                 | BOOLEAN           | Ob die Sicherung ein Trockenlauf war   |
| `version`                | TEXT              | Verwendete duplicati-Version         |
| `begin_time`             | DATETIME NOT NULL | Startzeit der Sicherung              |
| `end_time`               | DATETIME NOT NULL | Endzeit der Sicherung                |
| `warnings_actual_length` | INTEGER           | Tatsächliche Anzahl Warnungen          |
| `errors_actual_length`   | INTEGER           | Tatsächliche Anzahl Fehler            |
| `messages_actual_length` | INTEGER           | Tatsächliche Anzahl Nachrichten          |

#### Backend-Statistik-Felder {/* #backend-statistics-fields */}

| Feld                            | Typ     | Beschreibung                       |
|----------------------------------|----------|-----------------------------------|
| `bytes_downloaded`               | INTEGER  | Vom Ziel heruntergeladene Bytes |
| `known_file_size`                | INTEGER  | Bekannte Dateigröße am Ziel    |
| `last_backup_date`               | DATETIME | Datum des letzten Backups am Zielort |
| `backup_list_count`              | INTEGER  | Anzahl der Backup-Versionen         |
| `reported_quota_error`           | BOOLEAN  | Quota-Fehler gemeldet               |
| `reported_quota_warning`         | BOOLEAN  | Quota-Warnung gemeldet              |
| `backend_main_operation`         | TEXT     | Hauptvorgang des Backends           |
| `backend_parsed_result`          | TEXT     | Geparstes Ergebnis des Backends     |
| `backend_interrupted`            | BOOLEAN  | Backend-Vorgang unterbrochen        |
| `backend_version`                | TEXT     | Backend-Version                     |
| `backend_begin_time`             | DATETIME | Startzeit des Backend-Vorgangs      |
| `backend_duration`               | TEXT     | Dauer des Backend-Vorgangs          |
| `backend_warnings_actual_length` | INTEGER  | Anzahl Backend-Warnungen            |
| `backend_errors_actual_length`   | INTEGER  | Anzahl Backend-Fehler               |

### Konfigurationstabelle {/* #configurations-table */}

Speichert die Anwendungskonfigurationseinstellungen.

#### Felder {/* #fields-1 */}

| Feld    | Typ                         | Beschreibung                       |
|---------|---------------------------|------------------------------------|
| `key`   | TEXT PRIMARY KEY NOT NULL | Konfigurationsschlüssel            |
| `value` | TEXT                      | Konfigurationswert (JSON)          |

#### Häufige Konfigurationsschlüssel {/* #common-configuration-keys */}

- `email_config`: E-Mail-Benachrichtigungseinstellungen
- `ntfy_config`: NTFY-Benachrichtigungseinstellungen
- `overdue_tolerance`: Einstellungen zur Toleranz überfälliger Backups
- `notification_templates`: Vorlagen für Benachrichtigungsnachrichten
- `daily_summary`: Tägliche Zusammenfassung Modus, Zeitplan, Zeitzone, optionale öffentliche Dashboard-URL und optionaler SMTP-Empfänger-Override (`smtpRecipient`; leer verwendet E-Mail-Einstellungen)
- `cron_service`: Cron-Aufgaben-Zeitpläne, einschließlich `daily-summary-dispatch` (`minute hour * * *` von `daily_summary.utcTime`)
- `audit_retention_days`: Aufbewahrungszeitraum für Prüfprotokolle (Standard: 90 Tage)

### Datenbankversions-Tabelle {/* #database-version-table */}

Verfolgt die Schema-Version der Datenbank für Migrationszwecke.

#### Felder {/* #fields-2 */}

| Feld         | Typ              | Beschreibung                       |
|--------------|------------------|------------------------------------|
| `version`    | TEXT PRIMARY KEY | Datenbankversion                   |
| `applied_at` | DATETIME         | Wann die Migration angewendet wurde |

### Benutzertabelle {/* #users-table */}

Speichert Benutzerkontoinformationen für Authentifizierung und Zugriffskontrolle.

#### Felder {/* #fields-3 */}

| Feld                      | Typ                  | Beschreibung                        |
|---------------------------|----------------------|-------------------------------------|
| `id`                    | TEXT PRIMARY KEY     | Eindeutiger Benutzeridentifikator   |
| `username`              | TEXT UNIQUE NOT NULL | Benutzername für die Anmeldung      |
| `password_hash`         | TEXT NOT NULL        | Mit Bcrypt gehashtes Passwort       |
| `is_admin`              | BOOLEAN NOT NULL     | Ob Benutzer Admin-Rechte besitzt    |
| `must_change_password`  | BOOLEAN              | Ob Passwortänderung erforderlich ist |
| `created_at`            | DATETIME             | Zeitstempel der Kontenerstellung    |
| `updated_at`       | DATETIME         | Zeitstempel der letzten Aktualisierung                                      |
| `last_login_at`         | DATETIME             | Zeitstempel der letzten erfolgreichen Anmeldung |
| `last_login_ip`         | TEXT                 | IP-Adresse der letzten Anmeldung    |
| `failed_login_attempts` | INTEGER              | Anzahl fehlgeschlagener Anmeldeversuche |
| `locked_until`          | DATETIME             | Ablauf der Kontosperrung (falls gesperrt) |

### Sitzungstabelle {/* #sessions-table */}

Speichert Benutzersitzungsdaten für Authentifizierung und Sicherheit.

#### Felder {/* #fields-4 */}

| Feld              | Typ               | Beschreibung                                                     |
|-------------------|-------------------|------------------------------------------------------------------|
| `id`              | TEXT PRIMARY KEY  | Sitzungskennung                                                  |
| `user_id`         | TEXT              | Verweis auf Benutzertabelle (kann für nicht authentifizierte Sitzungen null sein) |
| `created_at`      | DATETIME          | Zeitstempel der Sitzungserstellung                               |
| `last_accessed`   | DATETIME          | Zeitstempel des letzten Zugriffs                                 |
| `expires_at`      | DATETIME NOT NULL | Zeitstempel des Ablaufs der Sitzung                               |
| `ip_address`      | TEXT              | IP-Adresse des Sitzungsursprungs                                 |
| `user_agent`    | TEXT                              | Benutzer-Agent-Zeichenkette                                     |
| `csrf_token`      | TEXT              | CSRF-Token für die Sitzung                                       |
| `csrf_expires_at` | DATETIME          | Ablauf des CSRF-Tokens                                           |

### Audit-Protokoll-Tabelle {/* #audit-log-table */}

Speichert den Audit-Verlauf von Benutzeraktionen und Systemereignissen.

#### Felder {/* #fields-5 */}

| Feld            | Typ                               | Beschreibung                                                      |
|-----------------|-----------------------------------|-------------------------------------------------------------------|
| `id`            | INTEGER PRIMARY KEY AUTOINCREMENT | Eindeutige Kennung des Audit-Protokolleintrags                    |
| `timestamp`     | DATETIME                          | Zeitstempel des Ereignisses                                       |
| `user_id`       | TEXT                              | Verweis auf Benutzertabelle (kann null sein)                      |
| `username`      | TEXT                              | Benutzername zum Zeitpunkt der Aktion                             |
| `action`        | TEXT NOT NULL                     | Durchgeführte Aktion                                              |
| `category`      | TEXT NOT NULL                     | Kategorie der Aktion (z.B. 'Authentifizierung', 'Einstellungen', 'Sicherung') |
| `target_type`   | TEXT                              | Art des Ziels (z.B. 'Server', 'Sicherung', 'Benutzer')          |
| `target_id`     | TEXT                              | Identifikator des Ziels                                         |
| `details`       | TEXT                              | Zusätzliche Details (JSON)                                      |
| `ip_address`    | TEXT                              | IP-Adresse des Anfordernden                                     |
| `user_agent`    | TEXT                              | Benutzer-Agent-Zeichenkette                                     |
| `status`        | TEXT NOT NULL                     | Status der Aktion ('Erfolg', 'Fehlgeschlagen', 'Fehler')        |
| `error_message` | TEXT                              | Fehlermeldung, falls die Aktion fehlgeschlagen ist              |

### API-Schlüssel-Tabelle {/* #api-keys-table */}

Speichert gehashte API-Schlüssel für die externen HTTP-APIs. Das Klartextgeheimnis wird einmalig bei der Erstellung angezeigt und niemals gespeichert.

#### Felder {/* #fields-6 */}

| Feld           | Typ              | Beschreibung                                               |
|----------------|------------------|----------------------------------------------------------|
| `id`           | TEXT PRIMARY KEY | Eindeutiger Schlüssel-Identifikator                      |
| `name`         | TEXT NOT NULL    | Anzeigename                                                |
| `key_hash`     | TEXT UNIQUE      | SHA-256-Hash des Geheimnisses                            |
| `key_prefix`   | TEXT             | Erste vier Zeichen des Geheimnisses (für Fingerabdrücke) |
| `key_suffix`   | TEXT             | Letzte vier Zeichen des Geheimnisses (für Fingerabdrücke)|
| `scope`        | TEXT NOT NULL    | `upload` oder `read`                                       |
| `description`  | TEXT             | Optionale Beschreibung                                   |
| `enabled`      | INTEGER          | `1` wenn der Schlüssel aktiv ist                       |
| `created_at`   | DATETIME         | Erstellungszeitstempel                                   |
| `created_by`   | TEXT             | Benutzer-ID des Administrators, der den Schlüssel erstellt hat |
| `expires_at`   | DATETIME         | Optionales Ablaufdatum                                          |
| `last_used_at` | DATETIME         | Letzte erfolgreiche Verwendung                                      |
| `usage_count`  | INTEGER          | Anzahl erfolgreicher Verwendungen                                     |

Zugehörige Konfigurationsschlüssel in der `configurations` Tabelle: `external_api_require_api_key`, `ip_trusted_proxies`, `admin_ip_allowlist`, `external_api_ip_allowlist`, `upload_limits`.

### Tabelle für tägliche Zusammenfassungs-Lieferungen {/* #daily-summary-deliveries-table */}

Pro-Kanal-Protokoll für den Versand von E-Mails mit täglicher Zusammenfassung. Alte Einträge können einen `ntfy` Kanal aus früheren Versionen enthalten. Jede geplante Ausführung (oder eindeutiger manueller Versand) hat maximal einen Eintrag pro Kanal. Die gerenderten Nutzlasten werden vor dem Senden gespeichert, damit Wiederholungen denselben Zustand verwenden. Einträge älter als 30 Tage werden entfernt.

Wenn der Prozess nach der Annahme einer Nachricht durch einen Anbieter abstirbt, aber bevor der Erfolg aufgezeichnet wurde, kann dieser Kanal erneut versucht werden (mindestens einmal).

#### Felder {/* #fields-7 */}

| Feld              | Typ             | Beschreibung                                                                 |
|--------------------|------------------|-----------------------------------------------------------------------------|
| `id`               | TEXT PRIMARY KEY | Eindeutige Lieferkennung                                                  |
| `occurrence_key`   | TEXT NOT NULL    | Geplanter Schlüssel `scheduled:UTC:{date}:{HH:mm}` oder `manual:{uuid}`             |
| `channel`          | TEXT NOT NULL    | `email` oder `ntfy`                                                           |
| `trigger`          | TEXT NOT NULL    | `scheduled`, `manual` oder `retry`                                           |
| `summary_date`     | TEXT NOT NULL    | Lokales Kalenderdatum für den Snapshot                                        |
| `time_zone`        | TEXT NOT NULL    | Gespeicherte IANA-Zeitzone                                                         |
| `payload_json`     | TEXT             | Gerenderte Betreff-, HTML-, Text- und NTFY-Felder                               |
| `state`            | TEXT NOT NULL    | `pending`, `sending`, `sent` oder `failed`                                   |
| `attempt_count`    | INTEGER          | Zustellversuche                                                           |
| `next_retry_at`    | DATETIME         | Wann ein fehlgeschlagener Kanal erneut beansprucht werden kann                                  |
| `lease_expires_at` | DATETIME         | Anspruchsfrist; eine abgelaufene Frist kann wiederhergestellt werden                                 |
| `error`            | TEXT             | Letzter Fehler, falls vorhanden                                                          |
| `created_at`       | DATETIME         | Zeitstempel der Zeilerstellung                                               |
| `updated_at`       | DATETIME         | Zeitstempel der letzten Aktualisierung                                      |
| `sent_at`          | DATETIME         | Erfolgszeitstempel                                                          |

Ein eindeutiger Index auf `(occurrence_key, channel)` verhindert doppelte Sendungen desselben Vorkommnisses über denselben Kanal.

## Sitzungsverwaltung {/* #session-management */}

### Datenbankgestützter Sitzungsspeicher {/* #database-backed-session-storage */}

Sitzungen werden in der Datenbank mit In-Memory-Alternative gespeichert:
- **Primärer Speicher**: Datenbankgestützte Sitzungstabelle
- **Alternative**: In-Memory-Speicher (Legacy-Unterstützung oder Fehlerfälle)
- **Sitzungs-ID**: Kryptografisch sicherer Zufallsstring
- **Ablauf**: Konfigurierbarer Sitzungs-Timeout
- **CSRF-Schutz**: Schutz vor Cross-Site-Request-Forgery
- **Automatische Bereinigung**: Abgelaufene Sitzungen werden automatisch entfernt

### Sitzungs-API-Endpunkte {/* #session-api-endpoints */}

- `POST /api/session`: Neue Sitzung erstellen
- `GET /api/session`: Bestehende Sitzung validieren
- `DELETE /api/session`: Sitzung löschen
- `GET /api/csrf`: CSRF-Token abrufen

## Indizes {/* #indexes */}

Die Datenbank enthält mehrere Indizes für optimale Abfrageleistung:

- **Primärschlüssel**: Alle Tabellen haben Primärschlüsselindizes
- **Fremdschlüssel**: Server-Referenzen in der Backups-Tabelle, Benutzer-Referenzen in Sitzungen und Audit-Protokoll
- **Abfrageoptimierung**: Indizes auf häufig abgefragten Feldern
- **Datumsindizes**: Indizes auf Datumsfeldern für zeitbasierte Abfragen
- **Benutzerindizes**: Benutzernamenindex für schnelle Benutzerabfragen
- **Sitzungsindizes**: Ablauf- und Benutzer-ID-Indizes für Sitzungsverwaltung
- **Audit-Indizes**: Zeitstempel-, Benutzer-ID-, Aktions-, Kategorie- und Statusindizes für Audit-Abfragen
- **API-Schlüsselindizes**: Eindeutiger Hash plus aktivierter/Bereichs-Abfragen für Authentifizierung

## Beziehungen {/* #relationships */}

- **Server → Backups**: Eins-zu-viele-Beziehung
- **Benutzer → Sitzungen**: Eins-zu-viele-Beziehung (Sitzungen können ohne Benutzer existieren)
- **Benutzer → Audit-Protokoll**: Eins-zu-viele-Beziehung (Audit-Einträge können ohne Benutzer existieren)
- **Benutzer → API-Schlüssel**: Eins-zu-viele-Beziehung über `created_by` (Schlüssel bleiben erhalten, nachdem der Benutzer gelöscht wurde)
- **Backups → Nachrichten**: Eingebettete JSON-Arrays
- **Konfigurationen**: Schlüssel-Wert-Speicher

## Datentypen {/* #data-types */}

- **TEXT**: Zeichenfolgendaten, JSON-Arrays
- **INTEGER**: Numerische Daten, Dateianzahlen, Größen
- **REAL**: Fließkommazahlen, Dauern
- **DATETIME**: Zeitstempeldaten
- **BOOLEAN**: Wahr/Falsch-Werte

## Sicherungsstatuswerte {/* #backup-status-values */}

- **Erfolgreich**: Sicherung erfolgreich abgeschlossen
- **Warnung**: Sicherung mit Warnungen abgeschlossen
- **Fehler**: Sicherung mit Fehlern abgeschlossen
- **Fatal**: Sicherung ist fatal fehlgeschlagen

## Häufige Abfragen {/* #common-queries */}

### Neueste Sicherung für einen Server abrufen {/* #get-latest-backup-for-a-server */}

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

### Server-Zusammenfassung abrufen {/* #get-server-summary */}

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

### Datenbank-Bereinigung {/* #database-cleanup */}

```sql
-- Delete old backups (older than 30 days)
DELETE FROM backups 
WHERE date < datetime('now', '-30 days');

-- Delete servers with no backups
DELETE FROM servers 
WHERE id NOT IN (SELECT DISTINCT server_id FROM backups);
```

## JSON-zu-Datenbank-Zuordnung {/* #json-to-database-mapping */}

### Zuordnung des API-Anforderungstexts zu Datenbankspalten {/* #api-request-body-to-database-columns-mapping */}

Wenn duplicati Sicherungsdaten über HTTP POST sendet, wird die JSON-Struktur den Datenbankspalten zugeordnet:

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

**Notiz**: Das Feld `size` in der Sicherungstabelle speichert `SizeOfExaminedFiles` und `uploaded_size` speichert die tatsächliche hochgeladene/übertragene Größe aus der Sicherungsoperation.
