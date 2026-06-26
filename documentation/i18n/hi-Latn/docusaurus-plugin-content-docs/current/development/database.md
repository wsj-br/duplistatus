# Database Schema {#database-schema}

Yah document Duplicati server ke dwara backup operation data store karne ke liye istemal hone wale SQLite database schema ka vivaran deta hai.

## Database Location {#database-location}

Database application data directory mein store hota hai:
- **Default Location**: `/app/data/backups.db`
- **Docker Volume**: `duplistatus_data:/app/data`
- **File Name**: `backups.db`

## Database Migration System {#database-migration-system}

Duplicati server versions ke beech database schema changes ko handle karne ke liye ek automated migration system ka istemal karta hai.

### Migration Version History {#migration-version-history}

Neeche historical migration versions hain jinhone database ko uski vartaman sthiti mein laya:

- **Schema v1.0** (Application v0.6.x aur pehle): machines aur backups tables ke saath prarambhik database schema
- **Schema v2.0** (Application v0.7.x): Missing columns aur configurations table joda gaya
- **Schema v3.0** (Application v0.7.x): machines table ka naam badalkar servers kar diya gaya, server_url column joda gaya
- **Schema v3.1** (Application v0.8.x): Backup data fields ko enhance kiya gaya, server_password column joda gaya
- **Schema v4.0** (Application v0.9.x / v1.0.x): User Access Control (users, sessions, audit_log tables) joda gaya

Vartaman application version (v1.3.x) latest database schema version ke roop mein **Schema v4.0** ka istemal karta hai.

### Migration Process {#migration-process}

1. **Automatic Backup**: Migration se pehle backup banata hai
2. **Schema Update**: Database structure ko update karta hai
3. **Data Migration**: Existing data ko preserve karta hai
4. **Verification**: Successful migration ki pushti karta hai

## Tables {#tables}

### Servers Table {#servers-table}

Monitor kiye ja rahe Duplicati servers ke baare mein information store karta hai.

#### Fields {#fields}

| Field             | Type             | Description                        |
|-------------------|------------------|------------------------------------|
| `id`              | TEXT PRIMARY KEY | Unique server identifier           |
| `name`            | TEXT NOT NULL    | Duplicati se server naam         |
| `server_url`      | TEXT             | Duplicati server URL               |
| `alias`           | TEXT             | Upyogkarta dvara paribhashit mitra naam         |
| `note`            | TEXT             | Upyogkarta dvara paribhashit notes/vivaran     |
| `server_password` | TEXT             | Pramanikaran ke liye server ka password |
| `created_at`      | DATETIME         | Server nirman ka samay chinh          |

### Backups Table {#backups-table}

Duplicati servers se prapt backup operation data store karta hai.

#### Key Fields {#key-fields}

| Field              | Type              | Description                                    |
|--------------------|-------------------|------------------------------------------------|
| `id`               | TEXT PRIMARY KEY  | Ananya backup pahchan                        |
| `server_id`        | TEXT NOT NULL     | Servers table ka sandarbh                    |
| `backup_name`      | TEXT NOT NULL     | Backup job ka naam                             |
| `backup_id`        | TEXT NOT NULL     | Duplicati se backup ID                       |
| `date`             | DATETIME NOT NULL | Backup execution ka samay                      |
| `status`           | TEXT NOT NULL     | Backup stithi (Safalta, Warning, Truti, Gambhir) |
| `duration_seconds` | INTEGER NOT NULL  | Seconds mein Avadhi                            |
| `size`             | INTEGER           | Source files ka aakar                          |
| `uploaded_size`    | INTEGER           | Uplod kiye gaye data ka aakar                  |
| `examined_files`   | INTEGER           | Jaanch kiye gaye files ki sankhya               |
| `warnings`         | INTEGER           | Chetavaniyon ki sankhya                        |
| `errors`           | INTEGER           | Trikon ki sankhya                              |
| `created_at`       | DATETIME          | Record nirman ka samay chinh                   |

#### Sandesh Array (JSON Sanchayan) {#message-arrays-json-storage}

| Kshetra               | Prakar | Vivaran                             |
|-----------------------|--------|-------------------------------------|
| `messages_array`    | TEXT | Log sandeshon ka JSON array              |
| `warnings_array`    | TEXT | Warning sandeshon ka JSON array          |
| `errors_array`      | TEXT | Error sandeshon ka JSON array            |
| `available_backups` | TEXT | Upalabdh Backup Sanskaranon ka JSON array |

#### File Karyakshetra Ke Kshetra {#file-operation-fields}

| Kshetra                 | Prakar    | Vivaran                  |
|-----------------------|---------|------------------------------|
| `examined_files`      | INTEGER | Backup ke dauran jaanch ki gayi File |
| `opened_files`        | INTEGER | Backup ke liye kholi gayi File      |
| `added_files`         | INTEGER | Backup mein jodi gayi nayi File    |
| `modified_files`      | INTEGER | Backup mein sanshodhit File     |
| `deleted_files`       | INTEGER | Backup se hatayi gayi File    |
| `deleted_folders`     | INTEGER | Backup se hataye gaye Folder  |
| `added_folders`       | INTEGER | Backup mein jode gaye Folder      |
| `modified_folders`    | INTEGER | Backup mein sanshodhit Folder   |
| `not_processed_files` | INTEGER | Process na ki gayi File          |
| `too_large_files`     | INTEGER | Process karne ke liye bahut badi File   |
| `files_with_error`    | INTEGER | Trutiyon wali File            |
| `added_symlinks`      | INTEGER | Jode gaye Symbolic links         |
| `modified_symlinks`   | INTEGER | Sanshodhit Symbolic links      |
| `deleted_symlinks`    | INTEGER | Hataye gaye Symbolic links       |

#### File Size Fields {#file-size-fields}

| Field                    | Type    | Description                          |
|--------------------------|---------|--------------------------------------|
| `size_of_examined_files` | INTEGER | Backup ke dauraan jaanche gaye file ka aakar |
| `size_of_opened_files`   | INTEGER | Backup ke liye khole gaye file ka aakar      |
| `size_of_added_files`    | INTEGER | Backup mein jode gaye naye file ka aakar    |
| `size_of_modified_files` | INTEGER | Backup mein sanshodhit kiye gaye file ka aakar     |

#### Operation Status Fields {#operation-status-fields}

| Field                    | Type              | Description                    |
|--------------------------|-------------------|--------------------------------|
| `parsed_result`          | TEXT NOT NULL     | Process ki gayi operation parinaam        |
| `main_operation`         | TEXT NOT NULL     | Mukhya operation prakar            |
| `interrupted`            | BOOLEAN           | Kya backup mein baadha daali gayi thi |
| `partial_backup`         | BOOLEAN           | Kya backup anshtik tha     |
| `dryrun`                 | BOOLEAN           | Kya backup ek dry run tha   |
| `version`                | TEXT              | Upyog kiya gaya Duplicati sanskaran         |
| `begin_time`             | DATETIME NOT NULL | Backup shuru hone ka samay              |
| `end_time`               | DATETIME NOT NULL | Backup samapt hone ka samay                |
| `warnings_actual_length` | INTEGER           | Vastavik chetaavaniyon ki sankhya          |
| `errors_actual_length`   | INTEGER           | Vastavik trutiyon ki sankhya            |
| `messages_actual_length` | INTEGER           | Vastavik sandeshon ki sankhya          |

#### Backend Statistics Fields {#backend-statistics-fields}

| Field                            | Type     | Description                       |
|----------------------------------|----------|-----------------------------------|
| `bytes_downloaded`               | INTEGER  | Destination se download kiye gaye bytes |
| `known_file_size`                | INTEGER  | Destination par gyat file ka aakar    |
| `last_backup_date`               | DATETIME | Antim backup tithi destination par   |
| `backup_list_count`              | INTEGER  | Backup sanskaran ki sankhya         |
| `reported_quota_error`           | BOOLEAN  | Quota truti report ki gayi hai      |
| `reported_quota_warning`         | BOOLEAN  | Quota warning report ki gayi hai    |
| `backend_main_operation`         | TEXT     | Backend mukhya operation            |
| `backend_parsed_result`          | TEXT     | Backend parsed parinaam             |
| `backend_interrupted`            | BOOLEAN  | Backend operation mein vyavadhan    |
| `backend_version`                | TEXT     | Backend sanskaran                   |
| `backend_begin_time`             | DATETIME | Backend operation shuru hone ka samay |
| `backend_duration`               | TEXT     | Backend operation ki avadhi         |
| `backend_warnings_actual_length` | INTEGER  | Backend warnings ki sankhya         |
| `backend_errors_actual_length`   | INTEGER  | Backend trutiyon ki sankhya         |

### Configurations Table {#configurations-table}

Application configuration settings store karta hai.

#### Fields {#fields-1}

| Field   | Type                      | Description                |
|---------|---------------------------|----------------------------|
| `key`   | TEXT PRIMARY KEY NOT NULL | Configuration key          |
| `value` | TEXT                      | Configuration value (JSON) |

#### Common Configuration Keys {#common-configuration-keys}

- `email_config`: Email notification settings
- `ntfy_config`: NTFY notification settings
- `overdue_tolerance`: Vilambit Backup tolerance settings
- `notification_templates`: Notification message templates
- `audit_retention_days`: Audit Log Retention avadhi (Default: 90 din)

### Database Sanskaran Table {#database-version-table}

Migration ke uddeshyaon ke liye database schema sanskaran ko track karta hai.

#### Fields {#fields-2}

| Field        | Type             | Description                |
|--------------|------------------|----------------------------|
| `version`    | TEXT PRIMARY KEY | Database sanskaran           |
| `applied_at` | DATETIME         | Kab migration lagu kiya gaya tha |

### Upyogkarta Table {#users-table}

Authentication aur access control ke liye upyogkarta account ki jaankari store karta hai.

#### Fields {#fields-3}

| Field                   | Type                 | Description                         |
|-------------------------|----------------------|-------------------------------------|
| `id`                    | TEXT PRIMARY KEY     | Anya upyogkarta identifier              |
| `username`              | TEXT UNIQUE NOT NULL | Login ke liye Username                  |
| `password_hash`         | TEXT NOT NULL        | Bcrypt hashed Password              |
| `is_admin`              | BOOLEAN NOT NULL     | Kya upyogkarta ke paas Prabandhak adhikar hain   |
| `must_change_password`  | BOOLEAN              | Kya Password badlav anivarya hai |
| `created_at`            | DATETIME             | Account nirman Samay chinh          |
| `updated_at`            | DATETIME             | Antim Update Samay chinh               |
| `last_login_at`         | DATETIME             | Antim safal login Samay chinh     |
| `last_login_ip`         | TEXT                 | Antim login ka IP pata            |
| `failed_login_attempts` | INTEGER              | Asafal login prayason ki sankhya      |
| `locked_until`          | DATETIME             | Account lock samapti (agar lock hai) |

### Sessions Table {#sessions-table}

Upyogkarta session data ko authentication aur suraksha ke liye store karta hai.

#### Fields {#fields-4}

| Field             | Type              | Description                                                      |
|-------------------|-------------------|------------------------------------------------------------------|
| `id`              | TEXT PRIMARY KEY  | Session identifier                                               |
| `user_id`         | TEXT              | Upyogkarta table ka reference (unauthenticated sessions ke liye nullable) |
| `created_at`      | DATETIME          | Session creation timestamp                                       |
| `last_accessed`   | DATETIME          | Antim access timestamp                                           |
| `expires_at`      | DATETIME NOT NULL | Session expiration timestamp                                     |
| `ip_address`      | TEXT              | Session origin ka IP address                                     |
| `user_agent`    | TEXT                              | Upyogkarta agent string                                                 |
| `csrf_token`      | TEXT              | Session ke liye CSRF token                                       |
| `csrf_expires_at` | DATETIME          | CSRF token expiration                                            |

### Audit Log Table {#audit-log-table}

Upyogkarta actions aur system events ka audit trail store karta hai.

#### Fields {#fields-5}

| Field           | Type                              | Description                                                       |
|-----------------|-----------------------------------|-------------------------------------------------------------------|
| `id`            | INTEGER PRIMARY KEY AUTOINCREMENT | Unique audit log entry identifier                                 |
| `timestamp`     | DATETIME                          | Event timestamp                                                   |
| `user_id`       | TEXT                              | Upyogkarta table ka reference (nullable)                               |
| `username`      | TEXT                              | Action ke samay username                                        |
| `action`        | TEXT NOT NULL                     | Ki gayi action                                                  |
| `category`      | TEXT NOT NULL                     | Action ka category (e.g., 'authentication', 'settings', 'backup') |
| `target_type`   | TEXT                              | Lakshya ka prakar (udaharan: 'server', 'backup', 'user')                 |
| `target_id`     | TEXT                              | Lakshya ka identifier                                              |
| `details`       | TEXT                              | Adhik vivaran (JSON)                                         |
| `ip_address`    | TEXT                              | Anurodh karne wale ka IP pata                                           |
| `user_agent`    | TEXT                              | Upyogkarta agent string                                                 |
| `status`        | TEXT NOT NULL                     | Action ki stithi ('success', 'failure', 'error')                  |
| `error_message` | TEXT                              | Yadi action asafal raha to truti sandesh                                    |

## Session Prabandhan {#session-management}

### Database-Backed Session Storage {#database-backed-session-storage}

Sessions database mein in-memory fallback ke saath store kiye jaate hain:
- **Prathmik Sanchayan**: Database-backed sessions table
- **Fallback**: In-memory storage (legacy support ya truti ke mamle)
- **Session ID**: Cryptographically secure random string
- **Samapti**: Configurable session timeout
- **CSRF Suraksha**: Cross-site request forgery suraksha
- **Swachalit Safai**: Samapt ho chuki sessions swachalit roop se hata di jaati hain

### Session API Endpoints {#session-api-endpoints}

- `POST /api/session`: Nayi session banayein
- `GET /api/session`: Maujood session ko validate karein
- `DELETE /api/session`: Session ko destroy karein
- `GET /api/csrf`: CSRF token prapt karein

## Indexes {#indexes}

Database mein optimal query performance ke liye kai indexes shamil hain:

- **Prathmik Keys**: Sabhi tables mein primary key indexes hain
- **Foreign Keys**: Backups table mein Server references, sessions aur audit_log mein user references
- **Query Optimisation**: Aksar query kiye jaane wale fields par indexes
- **Taareekh Indexes**: Samay-aadhaarit queries ke liye taareekh fields par indexes
- **Upyogkarta Indexes**: Upyogkarta ko tezi se lookup karne ke liye Username index
- **Session Indexes**: Session prabandhan ke liye expiration aur user_id indexes
- **Audit Indexes**: Audit queries ke liye timestamp, user_id, action, category, aur status indexes

## Sambandh {#relationships}

- **Servers → Backups**: Ek-se-anek sambandh
- **Users → Sessions**: Ek-se-anek sambandh (sessions upyogkarta ke bina bhi ho sakti hain)
- **Users → Audit Log**: Ek-se-anek sambandh (audit entries upyogkarta ke bina bhi ho sakti hain)
- **Backups → Messages**: Embedded JSON arrays
- **Configurations**: Key-value storage

## Data Types {#data-types}

- **TEXT**: String data, JSON arrays
- **INTEGER**: Numeric data, file counts, sizes
- **REAL**: Floating-point numbers, durations
- **DATETIME**: Timestamp data
- **BOOLEAN**: True/false values

## Backup Status Values {#backup-status-values}

- **Success**: Backup safaltapoorvak poora hua
- **Warning**: Backup chetaavaniyon ke saath poora hua
- **Error**: Backup trutiyon ke saath poora hua
- **Fatal**: Backup gambhir roop se asafal hua

## Common Queries {#common-queries}

### Get Latest Backup for a Server {#get-latest-backup-for-a-server}

```sql
SELECT * FROM backups 
WHERE server_id = ? 
ORDER BY date DESC 
LIMIT 1;
```

### Get All Backups for a Server {#get-all-backups-for-a-server}

```sql
SELECT * FROM backups 
WHERE server_id = ? 
ORDER BY date DESC;
```

### Get Server Summary {#get-server-summary}

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

### Get Overall Summary {#get-overall-summary}

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

### Database Cleanup {#database-cleanup}

```sql
-- Delete old backups (older than 30 days)
DELETE FROM backups 
WHERE date < datetime('now', '-30 days');

-- Delete servers with no backups
DELETE FROM servers 
WHERE id NOT IN (SELECT DISTINCT server_id FROM backups);
```

## JSON to Database Mapping {#json-to-database-mapping}

### API Request Body to Database Columns Mapping {#api-request-body-to-database-columns-mapping}

Jab Duplicati backup data ko HTTP POST ke madhyam se bhejta hai, to JSON structure ko database columns mein map kiya jaata hai:

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

**Note**: Backups table mein `size` field `SizeOfExaminedFiles` store karta hai aur `uploaded_size` backup operation se actual uploaded/transferred size store karta hai.
