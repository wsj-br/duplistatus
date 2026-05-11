---
translation_last_updated: '2026-05-11T14:27:40.129Z'
source_file_mtime: '2026-05-06T23:18:51.394Z'
source_file_hash: df66022aefa103713391937aaf3a13f7b727d815f252518c6028f2e35c7e5e28
translation_language: es
source_file_path: documentation/docs/development/database.md
translation_models:
  - anthropic/claude-3.5-haiku
  - anthropic/claude-haiku-4.5
  - qwen/qwen3-235b-a22b-2507
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

- **Esquema v1.0** (Aplicación v0.6.x y anteriores): Esquema inicial de la base de datos con tablas de máquinas y copias de seguridad
- **Esquema v2.0** (Aplicación v0.7.x): Se agregaron columnas faltantes y la tabla de configuraciones
- **Esquema v3.0** (Aplicación v0.7.x): Se cambió el nombre de la tabla de máquinas a servidores, se agregó la columna server_url
- **Esquema v3.1** (Aplicación v0.8.x): Se mejoraron los campos de datos de copia de seguridad, se agregó la columna server_password
- **Esquema v4.0** (Aplicación v0.9.x / v1.0.x): Se agregó el control de acceso de usuarios (tablas users, sessions, audit_log)

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

| Campo             | Tipo             | Descripción                        |
|-------------------|------------------|------------------------------------|
| `id`              | TEXT PRIMARY KEY | Identificador único del servidor           |
| `name`            | TEXT NOT NULL    | Nombre del servidor de Duplicati         |
| `server_url`      | TEXT             | URL del servidor Duplicati               |
| `alias`           | TEXT             | Nombre descriptivo definido por el usuario         |
| `note`            | TEXT             | Notas o descripción definida por el usuario     |
| `server_password` | TEXT             | Contraseña del servidor para autenticación |
| `created_at`      | DATETIME         | Marca de tiempo de creación del servidor          |

### Tabla de Backups {#backups-table}

Almacena datos de operaciones de backup recibidos de servidores Duplicati.

#### Campos Clave {#key-fields}

| Campo              | Tipo              | Descripción                                    |
|--------------------|-------------------|------------------------------------------------|
| `id`               | TEXT PRIMARY KEY  | Identificador único de la copia de seguridad                       |
| `server_id`        | TEXT NOT NULL     | Referencia a la tabla de servidores                     |
| `backup_name`      | TEXT NOT NULL     | Nombre del trabajo de respaldo                                |
| `backup_id`        | TEXT NOT NULL     | ID de respaldo de Duplicati                       |
| `date`             | DATETIME NOT NULL | Hora de ejecución del respaldo                          |
| `status`           | TEXT NOT NULL     | Estado del respaldo (Éxito, Advertencia, Error, Fatal) |
| `duration_seconds` | INTEGER NOT NULL  | Duración en segundos                            |
| `size`             | INTEGER           | Tamaño de los archivos de origen                           |
| `uploaded_size`    | INTEGER           | Tamaño de los datos subidos                          |
| `examined_files`   | INTEGER           | Número de archivos examinados                       |
| `warnings`         | INTEGER           | Número de advertencias                             |
| `errors`           | INTEGER           | Número de errores                               |
| `created_at`       | DATETIME          | Marca de tiempo de creación del registro                      |

#### Matrices de Mensajes (Almacenamiento JSON) {#message-arrays-json-storage}

| Campo               | Tipo | Descripción                             |
|---------------------|------|-----------------------------------------|
| `messages_array`    | TEXT | Matriz JSON de mensajes de registro              |
| `warnings_array`    | TEXT | Matriz JSON de mensajes de advertencia          |
| `errors_array`      | TEXT | Matriz JSON de mensajes de error            |
| `available_backups` | TEXT | Matriz JSON de versiones de respaldo disponibles |

#### Campos de Operación de Archivos {#file-operation-fields}

| Campo                 | Tipo    | Descripción                  |
|-----------------------|---------|------------------------------|
| `examined_files`      | INTEGER | Archivos examinados durante el respaldo |
| `opened_files`        | INTEGER | Archivos abiertos para respaldo      |
| `added_files`         | INTEGER | Archivos nuevos agregados a la copia de seguridad    |
| `modified_files`      | INTEGER | Archivos modificados en la copia de seguridad     |
| `deleted_files`       | INTEGER | Archivos eliminados de la copia de seguridad    |
| `deleted_folders`     | INTEGER | Carpetas eliminadas de la copia de seguridad  |
| `added_folders`       | INTEGER | Carpetas agregadas a la copia de seguridad      |
| `modified_folders`    | INTEGER | Carpetas modificadas en la copia de seguridad   |
| `not_processed_files` | INTEGER | Archivos no procesados          |
| `too_large_files`     | INTEGER | Archivos demasiado grandes para procesar   |
| `files_with_error`    | INTEGER | Archivos con errores            |
| `added_symlinks`      | INTEGER | Enlaces simbólicos agregados         |
| `modified_symlinks`   | INTEGER | Enlaces simbólicos modificados      |
| `deleted_symlinks`    | INTEGER | Enlaces simbólicos eliminados       |

#### Campos de Tamaño de archivos {#file-size-fields}

| Campo                    | Tipo    | Descripción                          |
|--------------------------|---------|--------------------------------------|
| `size_of_examined_files` | INTEGER | Tamaño de los archivos examinados durante la copia de seguridad |
| `size_of_opened_files`   | INTEGER | Tamaño de los archivos abiertos para la copia de seguridad      |
| `size_of_added_files`    | INTEGER | Tamaño de los archivos nuevos agregados a la copia de seguridad    |
| `size_of_modified_files` | INTEGER | Tamaño de los archivos modificados en la copia de seguridad     |

#### Campos de Estado de Operación {#operation-status-fields}

| Campo                    | Tipo              | Descripción                    |
|--------------------------|-------------------|--------------------------------|
| `parsed_result`          | TEXT NOT NULL     | Resultado de la operación analizado        |
| `main_operation`         | TEXT NOT NULL     | Tipo principal de operación            |
| `interrupted`            | BOOLEAN           | Indica si la copia de seguridad se interrumpió |
| `partial_backup`         | BOOLEAN           | Indica si la copia de seguridad fue parcial     |
| `dryrun`                 | BOOLEAN           | Indica si la copia de seguridad fue una prueba (dry run)   |
| `version`                | TEXT              | Versión de Duplicati utilizada         |
| `begin_time`             | DATETIME NOT NULL | Hora de inicio de la copia de seguridad              |
| `end_time`               | DATETIME NOT NULL | Hora de finalización de la copia de seguridad                |
| `warnings_actual_length` | INTEGER           | Cantidad real de advertencias          |
| `errors_actual_length`   | INTEGER           | Cantidad real de errores            |
| `messages_actual_length` | INTEGER           | Cantidad real de mensajes          |

#### Campos de Estadísticas del Backend {#backend-statistics-fields}

| Campo                            | Tipo     | Descripción                       |
|----------------------------------|----------|-----------------------------------|
| `bytes_downloaded`               | INTEGER  | Bytes descargados del destino |
| `known_file_size`                | INTEGER  | Tamaño del archivo conocido en el destino    |
| `last_backup_date`               | DATETIME | Fecha del último respaldo en el destino   |
| `backup_list_count`              | INTEGER  | Número de versiones de copia de seguridad         |
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

#### Campos {#fields-1}

| Campo   | Tipo                      | Descripción                |
|---------|---------------------------|----------------------------|
| `key`   | TEXT PRIMARY KEY NOT NULL | Clave de configuración          |
| `value` | TEXT                      | Valor de configuración (JSON) |

#### Claves de Configuración Comunes {#common-configuration-keys}

- `email_config`: Configuración de notificaciones por correo electrónico
- `ntfy_config`: Configuración de notificaciones NTFY
- `overdue_tolerance`: Configuración de tolerancia para copia de seguridad retrasada
- `notification_templates`: Plantillas de mensajes de notificación
- `audit_retention_days`: Periodo de retención del registro de auditoría (por defecto: 90 días)

### Tabla de Versión de Base de Datos {#database-version-table}

Realiza un seguimiento de la versión del esquema de la base de datos con fines de migración.

#### Campos {#fields-2}

| Campo        | Tipo             | Descripción                |
|--------------|------------------|----------------------------|
| `version`    | TEXT PRIMARY KEY | Versión de la base de datos           |
| `applied_at` | DATETIME         | Cuándo se aplicó la migración |

### Tabla de Usuarios {#users-table}

Almacena información de cuenta de usuario para autenticación y control de acceso.

#### Campos {#fields-3}

| Campo                   | Tipo                 | Descripción                         |
|-------------------------|----------------------|-------------------------------------|
| `id`                    | TEXT PRIMARY KEY     | Identificador único del usuario              |
| `username`              | TEXT UNIQUE NOT NULL | Nombre de usuario para inicio de sesión                  |
| `password_hash`         | TEXT NOT NULL        | Contraseña hasheada con Bcrypt              |
| `is_admin`              | BOOLEAN NOT NULL     | Si el usuario tiene privilegios de administrador   |
| `must_change_password`  | BOOLEAN              | Si se requiere el cambio de contraseña |
| `created_at`            | DATETIME             | Marca de tiempo de creación de la cuenta          |
| `updated_at`            | DATETIME             | Marca de tiempo de la última actualización               |
| `last_login_at`         | DATETIME             | Marca de tiempo del último inicio de sesión exitoso     |
| `last_login_ip`         | TEXT                 | Dirección IP del último inicio de sesión            |
| `failed_login_attempts` | INTEGER              | Cantidad de intentos fallidos de inicio de sesión      |
| `locked_until`          | DATETIME             | Expiración del bloqueo de la cuenta (si está bloqueada) |

### Tabla de Sesiones {#sessions-table}

Almacena datos de sesión del usuario para autenticación y seguridad.

#### Campos {#fields-4}

| Campo             | Tipo              | Descripción                                                      |
|-------------------|-------------------|------------------------------------------------------------------|
| `id`              | TEXT PRIMARY KEY  | Identificador de la sesión                                               |
| `user_id`         | TEXT              | Referencia a la tabla de usuarios (nulo para sesiones no autenticadas) |
| `created_at`      | DATETIME          | Marca de tiempo de creación de la sesión                                       |
| `last_accessed`   | DATETIME          | Marca de tiempo del último acceso                                            |
| `expires_at`      | DATETIME NOT NULL | Marca de tiempo de expiración de la sesión                                     |
| `ip_address`      | TEXT              | Dirección IP de origen de la sesión                                     |
| `user_agent`    | TEXT                              | Cadena del agente de usuario                                                 |
| `csrf_token`      | TEXT              | Token CSRF para la sesión                                       |
| `csrf_expires_at` | DATETIME          | Expiración del token CSRF |

### Log de Auditoría {#audit-log-table}

Almacena un registro de auditoría de acciones de usuario y eventos del sistema.

#### Campos {#fields-5}

| Campo           | Tipo                              | Descripción                                                       |
|-----------------|-----------------------------------|-------------------------------------------------------------------|
| `id`            | INTEGER PRIMARY KEY AUTOINCREMENT | Identificador único de la entrada en el registro de auditoría                                 |
| `timestamp`     | DATETIME                          | Marca de tiempo del evento                                                   |
| `user_id`       | TEXT                              | Referencia a la tabla de usuarios (nullable)                               |
| `username`      | TEXT                              | Nombre de usuario en el momento de la acción                                        |
| `action`        | TEXT NOT NULL                     | Acción realizada                                                  |
| `category`      | TEXT NOT NULL                     | Categoría de la acción (por ejemplo, 'authentication', 'settings', 'backup') |
| `target_type`   | TEXT                              | Tipo de destino (por ejemplo, 'server', 'backup', 'user')                 |
| `target_id`     | TEXT                              | Identificador del destino                                              |
| `details`       | TEXT                              | Detalles adicionales (JSON)                                         |
| `ip_address`    | TEXT                              | Dirección IP del solicitante                                           |
| `user_agent`    | TEXT                              | Cadena del agente de usuario                                                 |
| `status`        | TEXT NOT NULL                     | Estado de la acción ('success', 'failure', 'error')                  |
| `error_message` | TEXT                              | Mensaje de error si la acción falló                                    |

## Gestión de Sesiones {#session-management}

### Almacenamiento de Sesiones Respaldado por Base de Datos {#database-backed-session-storage}

Las sesiones se almacenan en la base de datos con respaldo en memoria:
- **Almacenamiento principal**: Tabla de sesiones respaldada por base de datos
- **Respaldo**: Almacenamiento en memoria (soporte heredado o casos de error)
- **ID de sesión**: Cadena aleatoria criptográficamente segura
- **Expiración**: Tiempo de espera de sesión configurable
- **Protección CSRF**: Protección contra falsificación de solicitudes entre sitios
- **Limpieza automática**: Las sesiones expiradas se eliminan automáticamente

### Puntos finales de la API de sesión {#session-api-endpoints}

- `POST /api/session`: Crear nueva sesión
- `GET /api/session`: Validar sesión existente
- `DELETE /api/session`: Destruir sesión
- `GET /api/csrf`: Obtener token CSRF

## Índices {#indexes}

La base de datos incluye varios índices para un rendimiento óptimo de las consultas:

- **Claves primarias**: Todas las tablas tienen índices de clave primaria
- **Claves externas**: Referencias de servidores en la tabla de copias de seguridad, referencias de usuarios en sesiones y registro_de_auditoría
- **Optimización de consultas**: Índices en campos consultados con frecuencia
- **Índices de fecha**: Índices en campos de fecha para consultas basadas en tiempo
- **Índices de usuario**: Índice de nombre de usuario para búsquedas rápidas de usuarios
- **Índices de sesión**: Índices de expiración y user_id para la gestión de sesiones
- **Índices de auditoría**: Índices de marca de tiempo, user_id, acción, categoría y estado para consultas de auditoría

## Relaciones {#relationships}

- **Servidores → Copias de seguridad**: Relación uno a muchos
- **Usuarios → Sesiones**: Relación uno a muchos (las sesiones pueden existir sin usuarios)
- **Usuarios → Registro de auditoría**: Relación uno a muchos (las entradas de auditoría pueden existir sin usuarios)
- **Copias de seguridad → Mensajes**: Arrays JSON incrustados
- **Configuraciones**: Almacenamiento clave-valor

## Tipos de Datos {#data-types}

- **TEXT**: Datos de cadena, arrays JSON
- **INTEGER**: Datos numéricos, conteos de archivos, tamaños
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
