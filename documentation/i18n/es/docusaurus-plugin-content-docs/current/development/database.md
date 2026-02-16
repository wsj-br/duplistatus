---
translation_last_updated: '2026-02-16T02:21:38.214Z'
source_file_mtime: '2026-02-16T00:30:39.430Z'
source_file_hash: 21d21cb01acea43b
translation_language: es
source_file_path: development/database.md
---
# Esquema de Base de Datos {#database-schema}

Este documento describe el esquema de base de datos SQLite utilizado por duplistatus para almacenar datos de operaciones de backup.

## Ubicación de la Base de Datos {#database-location}

La base de datos se almacena en el directorio de datos de la aplicación:
- **Ubicación por defecto**: `/app/data/backups.db`
- **Volumen Docker**: `duplistatus_data:/app/data`
- **Nombre de archivo**: `backups.db`

## Sistema de Migración de Base de Datos {#database-migration-system}

duplistatus utiliza un sistema de migración automatizado para gestionar cambios en el esquema de la base de datos entre versiones.

### Historial de Versiones de Migración {#migration-version-history}

Las siguientes son versiones históricas de migración que llevaron la base de datos a su estado actual:

- **Schema v1.0** (Aplicación v0.6.x y anteriores): Esquema de base de datos inicial con tablas de máquinas y backups
- **Schema v2.0** (Aplicación v0.7.x): Se añadieron columnas faltantes y tabla de configuraciones
- **Schema v3.0** (Aplicación v0.7.x): Se renombró la tabla de máquinas a servidores, se añadió columna server_url
- **Schema v3.1** (Aplicación v0.8.x): Se mejoraron los campos de datos de backup, se añadió columna server_password
- **Schema v4.0** (Aplicación v0.9.x / v1.0.x): Se añadió Control de Acceso de Usuarios (tablas users, sessions, audit_log)

La versión actual de la aplicación (v1.3.x) utiliza **Schema v4.0** como la última versión del esquema de base de datos.

### Proceso de Migración {#migration-process}

1. **Backup Automático**: Crea un backup antes de la migración
2. **Actualización de Esquema**: Actualiza la estructura de la base de datos
3. **Migración de Datos**: Preserva los datos existentes
4. **Verificación**: Confirma la migración exitosa

## Tablas {#tables}

### Tabla de Servidores {#servers-table}

Almacena información sobre los servidores Duplicati que se están monitoreando.

#### Campos {#fields}

| Campo            | Tipo             | Descripción                           |
|------------------|------------------|------------------------------------|
| `id`              | TEXT PRIMARY KEY | Identificador único del servidor           |
| `name`            | TEXT NOT NULL    | Nombre del servidor desde Duplicati         |
| `server_url`      | TEXT             | URL del servidor Duplicati               |
| `alias`           | TEXT             | Nombre descriptivo definido por el usuario         |
| `note`            | TEXT             | Notas/Descripción definidas por el usuario     |
| `server_password` | TEXT             | Contraseña del servidor para autenticación |
| `created_at`      | DATETIME         | Marca de tiempo de creación del servidor          |

### Tabla de Backups {#backups-table}

Almacena datos de operaciones de backup recibidos de servidores Duplicati.

#### Campos Clave {#key-fields}

| Campo              | Tipo              | Descripción                                    |
|--------------------|-------------------|------------------------------------------------|
| `id`               | TEXT PRIMARY KEY  | Identificador único de backup                  |
| `server_id`        | TEXT NOT NULL     | Referencia a la tabla de servidores            |
| `backup_name`      | TEXT NOT NULL     | Nombre del trabajo de backup                   |
| `backup_id`        | TEXT NOT NULL     | ID de backup de Duplicati                      |
| `date`             | DATETIME NOT NULL | Hora de ejecución del backup                   |
| `status`           | TEXT NOT NULL     | Estado del backup (Éxito, Advertencia, Error, Fatal) |
| `duration_seconds` | INTEGER NOT NULL  | Duración en segundos                           |
| `size`             | INTEGER           | Tamaño de archivos de origen                   |
| `uploaded_size`    | INTEGER           | Tamaño de datos enviados                       |
| `examined_files`   | INTEGER           | Número de archivos examinados                  |
| `warnings`         | INTEGER           | Número de advertencias                         |
| `errors`           | INTEGER           | Número de errores                              |
| `created_at`       | DATETIME          | Marca de tiempo de creación del registro       |

#### Matrices de Mensajes (Almacenamiento JSON) {#message-arrays-json-storage}

| Campo              | Tipo | Descripción                                    |
|---------------------|------|------------------------------------------------|
| `messages_array`    | TEXT | Array JSON de mensajes de registro             |
| `warnings_array`    | TEXT | Array JSON de mensajes de advertencia          |
| `errors_array`      | TEXT | Array JSON de mensajes de error                |
| `available_backups` | TEXT | Array JSON de versiones de backup disponibles |

#### Campos de Operación de Archivos {#file-operation-fields}

| Campo                 | Tipo    | Descripción                          |
|-----------------------|---------|--------------------------------------|
| `examined_files`      | INTEGER | Archivos examinados durante backup   |
| `opened_files`        | INTEGER | Archivos abiertos para backup        |
| `added_files`         | INTEGER | Archivos nuevos añadidos a backup    |
| `modified_files`      | INTEGER | Archivos modificados en backup       |
| `deleted_files`       | INTEGER | Archivos eliminados de backup        |
| `deleted_folders`     | INTEGER | Carpetas eliminadas de backup        |
| `added_folders`       | INTEGER | Carpetas añadidas a backup           |
| `modified_folders`    | INTEGER | Carpetas modificadas en backup       |
| `not_processed_files` | INTEGER | Archivos no procesados               |
| `too_large_files`     | INTEGER | Archivos demasiado grandes para procesar |
| `files_with_error`    | INTEGER | Archivos con errores                 |
| `added_symlinks`      | INTEGER | Enlaces simbólicos añadidos          |
| `modified_symlinks`   | INTEGER | Enlaces simbólicos modificados       |
| `deleted_symlinks`    | INTEGER | Enlaces simbólicos eliminados        |

#### Campos de Tamaño de archivos {#file-size-fields}

| Campo                    | Tipo    | Descripción                          |
|--------------------------|---------|--------------------------------------|
| `size_of_examined_files` | INTEGER | Tamaño de archivos examinados durante el backup |
| `size_of_opened_files`   | INTEGER | Tamaño de archivos abiertos para el backup      |
| `size_of_added_files`    | INTEGER | Tamaño de archivos nuevos añadidos al backup    |
| `size_of_modified_files` | INTEGER | Tamaño de archivos modificados en el backup     |

#### Campos de Estado de Operación {#operation-status-fields}

| Campo                    | Tipo              | Descripción                    |
|--------------------------|-------------------|--------------------------------|
| `parsed_result`          | TEXT NOT NULL     | Resultado de operación analizado |
| `main_operation`         | TEXT NOT NULL     | Tipo de operación principal    |
| `interrupted`            | BOOLEAN           | Si el backup fue interrumpido  |
| `partial_backup`         | BOOLEAN           | Si el backup fue parcial       |
| `dryrun`                 | BOOLEAN           | Si el backup fue una ejecución de prueba |
| `version`                | TEXT              | Versión de Duplicati utilizada |
| `begin_time`             | DATETIME NOT NULL | Hora de inicio del backup      |
| `end_time`               | DATETIME NOT NULL | Hora de fin del backup         |
| `warnings_actual_length` | INTEGER           | Cantidad real de advertencias  |
| `errors_actual_length`   | INTEGER           | Cantidad real de errores       |
| `messages_actual_length` | INTEGER           | Cantidad real de mensajes      |

#### Campos de Estadísticas del Backend {#backend-statistics-fields}

| Campo                            | Tipo     | Descripción                       |
|----------------------------------|----------|-----------------------------------|
| `bytes_downloaded`               | INTEGER  | Bytes descargados del destino |
| `known_file_size`                | INTEGER  | Tamaño de archivos conocido en el destino    |
| `last_backup_date`               | DATETIME | Fecha del último backup en el destino   |
| `backup_list_count`              | INTEGER  | Número de versiones de backup         |
| `reported_quota_error`           | BOOLEAN  | Error de cuota reportado              |
| `reported_quota_warning`         | BOOLEAN  | Advertencia de cuota reportada            |
| `backend_main_operation`         | TEXT     | Operación principal del backend            |
| `backend_parsed_result`          | TEXT     | Resultado analizado del backend             |
| `backend_interrupted`            | BOOLEAN  | Operación del backend interrumpida     |
| `backend_version`                | TEXT     | Versión del backend                   |
| `backend_begin_time`             | DATETIME | Hora de inicio de la operación del backend      |
| `backend_duration`               | TEXT     | Duración de la operación del backend        |
| `backend_warnings_actual_length` | INTEGER  | Cantidad de advertencias del backend            |
| `backend_errors_actual_length`   | INTEGER  | Cantidad de errores del backend              |

### Tabla de Configuraciones {#configurations-table}

Almacena la configuración de la aplicación.

#### Campos {#fields}

| Campo   | Tipo                      | Descripción                |
|---------|---------------------------|----------------------------|
| `key`   | TEXT PRIMARY KEY NOT NULL | Clave de configuración     |
| `value` | TEXT                      | Valor de configuración (JSON) |

#### Claves de Configuración Comunes {#common-configuration-keys}

- `email_config`: Configuración de notificaciones por correo electrónico
- `ntfy_config`: Configuración de notificaciones NTFY
- `overdue_tolerance`: Configuración de tolerancia de backup retrasado
- `notification_templates`: Plantillas de mensajes de notificación
- `audit_retention_days`: Período de retención del log de auditoría (por defecto: 90 días)

### Tabla de Versión de Base de Datos {#database-version-table}

Realiza un seguimiento de la versión del esquema de la base de datos con fines de migración.

#### Campos {#fields}

| Campo        | Tipo             | Descripción                |
|--------------|------------------|----------------------------|
| `version`    | TEXT PRIMARY KEY | Versión de la base de datos           |
| `applied_at` | DATETIME         | Cuándo se aplicó la migración |

### Tabla de Usuarios {#users-table}

Almacena información de cuenta de usuario para autenticación y control de acceso.

#### Campos {#fields}

| Campo                   | Tipo                 | Descripción                         |
|-------------------------|----------------------|-------------------------------------|
| `id`                    | TEXT PRIMARY KEY     | Identificador único de usuario      |
| `username`              | TEXT UNIQUE NOT NULL | Nombre de usuario para iniciar sesión |
| `password_hash`         | TEXT NOT NULL        | Contraseña cifrada con Bcrypt       |
| `is_admin`              | BOOLEAN NOT NULL     | Si el usuario tiene privilegios de admin |
| `must_change_password`  | BOOLEAN              | Si el cambio de contraseña es requerido |
| `created_at`            | DATETIME             | Marca de tiempo de creación de cuenta |
| `updated_at`            | DATETIME             | Marca de tiempo de última actualización |
| `last_login_at`         | DATETIME             | Marca de tiempo del último inicio de sesión exitoso |
| `last_login_ip`         | TEXT                 | Dirección IP del último inicio de sesión |
| `failed_login_attempts` | INTEGER              | Recuento de intentos de inicio de sesión fallidos |
| `locked_until`          | DATETIME             | Expiración del bloqueo de cuenta (si está bloqueado) |

### Tabla de Sesiones {#sessions-table}

Almacena datos de sesión del usuario para autenticación y seguridad.

#### Campos {#fields}

| Campo            | Tipo              | Descripción                                                      |
|------------------|-------------------|------------------------------------------------------------------|
| `id`             | TEXT PRIMARY KEY  | Identificador de sesión                                          |
| `user_id`        | TEXT              | Referencia a la tabla de usuarios (anulable para sesiones no autenticadas) |
| `created_at`     | DATETIME          | Marca de tiempo de creación de sesión                            |
| `last_accessed`  | DATETIME          | Marca de tiempo de última acceso                                 |
| `expires_at`     | DATETIME NOT NULL | Marca de tiempo de expiración de sesión                          |
| `ip_address`     | TEXT              | Dirección IP de origen de sesión                                 |
| `user_agent`     | TEXT              | Cadena de agente de usuario                                      |
| `csrf_token`     | TEXT              | Token CSRF para la sesión                                        |
| `csrf_expires_at`| DATETIME          | Expiración de token CSRF                                         |

### Log de Auditoría {#audit-log-table}

Almacena un registro de auditoría de acciones de usuario y eventos del sistema.

#### Campos {#fields}

| Campo           | Tipo                              | Descripción                                                       |
|-----------------|-----------------------------------|-------------------------------------------------------------------|
| `id`            | INTEGER PRIMARY KEY AUTOINCREMENT | Identificador único de entrada del log de auditoría                                 |
| `timestamp`     | DATETIME                          | Marca de tiempo del evento                                                   |
| `user_id`       | TEXT                              | Referencia a la tabla de usuarios (anulable)                       |
| `username`      | TEXT                              | Nombre de usuario en el momento de la acción                                        |
| `action`        | TEXT NOT NULL                     | Acción realizada                                                  |
| `category`      | TEXT NOT NULL                     | Categoría de la acción (p. ej., 'authentication', 'settings', 'backup') |
| `target_type`   | TEXT                              | Tipo de objetivo (p. ej., 'server', 'backup', 'user')                 |
| `target_id`     | TEXT                              | Identificador del objetivo                                              |
| `details`       | TEXT                              | Detalles adicionales (JSON)                                         |
| `ip_address`    | TEXT                              | Dirección IP del solicitante                                           |
| `user_agent`    | TEXT                              | Cadena de agente de usuario                                                 |
| `status`        | TEXT NOT NULL                     | Estado de la acción ('success', 'failure', 'error')                  |
| `error_message` | TEXT                              | Mensaje de error si la acción falló                                    |

## Gestión de Sesiones {#session-management}

### Almacenamiento de Sesiones Respaldado por Base de Datos {#database-backed-session-storage}

Las sesiones se almacenan en la base de datos con respaldo en memoria:
- **Almacenamiento Principal**: Tabla de sesiones respaldada por base de datos
- **Respaldo**: Almacenamiento en memoria (soporte heredado o casos de error)
- **ID de Sesión**: Cadena aleatoria criptográficamente segura
- **Vencimiento**: Tiempo de espera agotado configurable
- **Protección CSRF**: Protección contra falsificación de solicitudes entre sitios
- **Limpieza Automática**: Las sesiones vencidas se eliminan automáticamente

### Puntos finales de la API de sesión {#session-api-endpoints}

- `POST /api/session`: Crear nueva sesión
- `GET /api/session`: Validar sesión existente
- `DELETE /api/session`: Destruir sesión
- `GET /api/csrf`: Obtener token CSRF

## Índices {#indexes}

La base de datos incluye varios índices para un rendimiento óptimo de las consultas:

- **Claves Primarias**: Todos los tablas tienen índices de clave primaria
- **Claves Foráneas**: Referencias de Servidor en tabla de backups, referencias de Usuario en sesiones y audit_log
- **Optimización de Consultas**: Índices en campos consultados frecuentemente
- **Índices de Fecha**: Índices en campos de fecha para consultas basadas en tiempo
- **Índices de Usuario**: Índice de nombre de usuario para búsquedas rápidas de usuarios
- **Índices de Sesión**: Índices de expiración e ID de usuario para gestión de sesiones
- **Índices de Auditoría**: Índices de marca de tiempo, ID de usuario, acción, categoría y estado para consultas de auditoría

## Relaciones {#relationships}

- **Servidores → Backups**: Relación uno a muchos
- **Usuarios → Sesiones**: Relación uno a muchos (las sesiones pueden existir sin usuarios)
- **Usuarios → Log de Auditoría**: Relación uno a muchos (las entradas de auditoría pueden existir sin usuarios)
- **Backups → Mensajes**: Arreglos JSON incrustados
- **Configuraciones**: Almacenamiento de clave-valor

## Tipos de Datos {#data-types}

- **TEXT**: Datos de cadena, matrices JSON
- **INTEGER**: Datos numéricos, recuentos de archivos, tamaños
- **REAL**: Números de punto flotante, duraciones
- **DATETIME**: Datos de marca de tiempo
- **BOOLEAN**: Valores verdadero/falso

## Estados de Backup {#backup-status-values}

- **Éxito**: Backup completado exitosamente
- **Advertencia**: Backup completado con advertencias
- **Error**: Backup completado con errores
- **Fatal**: Backup fallido fatalmente

## Consultas Comunes {#common-queries}

### Obtener el Último Backup para un Servidor {#get-latest-backup-for-a-server}

```sql
SELECT * FROM backups 
WHERE server_id = ? 
ORDER BY date DESC 
LIMIT 1;
```

### Obtener Todos los Backups para un Servidor {#get-all-backups-for-a-server}

```sql
SELECT * FROM backups 
WHERE server_id = ? 
ORDER BY date DESC;
```

### Obtener Resumen del Servidor {#get-server-summary}

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

### Obtener Resumen General {#get-overall-summary}

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

### Limpieza de Base de Datos {#database-cleanup}

```sql
-- Delete old backups (older than 30 days)
DELETE FROM backups 
WHERE date < datetime('now', '-30 days');

-- Delete servers with no backups
DELETE FROM servers 
WHERE id NOT IN (SELECT DISTINCT server_id FROM backups);
```

## Asignación de JSON a Base de Datos {#json-to-database-mapping}

### Asignación de Cuerpo de Solicitud de API a Columnas de Base de Datos {#api-request-body-to-database-columns-mapping}

Cuando Duplicati envía datos de backup a través de HTTP POST, la estructura JSON se asigna a columnas de base de datos:

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

**Nota**: El campo `size` en la tabla de backups almacena `SizeOfExaminedFiles` y `uploaded_size` almacena el tamaño real enviado/transferido desde la operación de backup.
