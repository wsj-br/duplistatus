# Esquema de Base de Datos {/* #database-schema */}

Este documento describe el esquema de base de datos SQLite utilizado por duplistatus para almacenar datos de operaciones de copia de seguridad.

## Ubicación de la Base de Datos {/* #database-location */}

La base de datos se almacena en el directorio de datos de la aplicación:
- **Ubicación Predeterminada**: `/app/data/backups.db`
- **Volumen Docker**: `duplistatus_data:/app/data`
- **Nombre de Archivo**: `backups.db`

## Sistema de Migración de Base de Datos {/* #database-migration-system */}

duplistatus utiliza un sistema de migración automatizado para gestionar cambios en el esquema de la base de datos entre versiones.

### Historial de Versiones de Migración {/* #migration-version-history */}

Las siguientes son versiones de migración históricas que llevaron la base de datos a su estado actual:

- **Esquema v1.0** (Aplicación v0.6.x y anteriores): Esquema de base de datos inicial con tablas de servidores y copias de seguridad
- **Esquema v2.0** (Aplicación v0.7.x): Se agregaron columnas faltantes y tabla de configuraciones
- **Esquema v3.0** (Aplicación v0.7.x): Se renombró la tabla de servidores, se agregó columna server_url
- **Esquema v3.1** (Aplicación v0.8.x): Se mejoraron los campos de datos de copia de seguridad, se agregó columna server_password
- **Esquema v4.0** (Aplicación v0.9.x / v1.0.x): Se agregaron tablas de Control de Acceso de Usuarios (usuarios, sesiones, registro de auditoría)
- **Esquema v4.1** (Aplicación v1.5.x): Se agregaron `api_keys` y claves de configuración predeterminadas para autenticación opcional por clave API, listas de permitidos de IP y límites de subida
- **Esquema v4.2** (Aplicación v1.5.x): Se agregó `daily_summary_deliveries` libro mayor y configuración `daily_summary` predeterminada para notificaciones opcionales de resumen diario

La versión actual de la aplicación (v1.5.x) utiliza **Esquema v4.2** como la versión de esquema de base de datos más reciente.

### Proceso de Migración {/* #migration-process */}

1. **Copia de Seguridad Automática**: Crea copia de seguridad antes de la migración
2. **Actualización de Esquema**: Actualiza la estructura de la base de datos
3. **Migración de Datos**: Preserva los datos existentes
4. **Verificación**: Confirma la migración exitosa

## Tablas {/* #tables */}

### Tabla de Servidores {/* #servers-table */}

Almacena información sobre los servidores Duplicati que se están monitoreando.

#### Campos {/* #fields */}

| Campo             | Tipo             | Descripción                        |
|-------------------|------------------|------------------------------------|
| `id`              | TEXT PRIMARY KEY | Identificador único del servidor   |
| `name`            | TEXT NOT NULL    | Nombre del servidor desde Duplicati |
| `server_url`      | TEXT             | URL del servidor Duplicati         |
| `alias`           | TEXT             | Nombre amigable definido por el usuario         |
| `note`            | TEXT             | Notas/descripción definidas por el usuario     |
| `server_password` | TEXT             | Contraseña del servidor para autenticación |
| `created_at`      | DATETIME         | Marca de tiempo de creación del servidor          |

### Tabla de Copias de seguridad {/* #backups-table */}

Almacena datos de operaciones de copia de seguridad recibidos de servidores Duplicati.

#### Campos clave {/* #key-fields */}

| Campo              | Tipo              | Descripción                                    |
|--------------------|-------------------|------------------------------------------------|
| `id`               | TEXT PRIMARY KEY  | Identificador único de copia de seguridad                       |
| `server_id`        | TEXT NOT NULL     | Referencia a la tabla de servidores                     |
| `backup_name`      | TEXT NOT NULL     | Nombre del trabajo de copia de seguridad                                |
| `backup_id`        | TEXT NOT NULL     | ID de copia de seguridad de Duplicati                       |
| `date`             | DATETIME NOT NULL | Hora de ejecución de la copia de seguridad                          |
| `status`           | TEXT NOT NULL     | Estado de copia de seguridad (Éxito, Advertencia, Error, Fatal) |
| `duration_seconds` | INTEGER NOT NULL  | Duración en segundos                            |
| `size`             | INTEGER           | Tamaño de archivos de origen                           |
| `uploaded_size`    | INTEGER           | Tamaño de datos subidos                          |
| `examined_files`   | INTEGER           | Número de archivos examinados                       |
| `warnings`         | INTEGER           | Número de advertencias                             |
| `errors`           | INTEGER           | Número de errores                               |
| `created_at`       | DATETIME          | Marca de tiempo de creación del registro                      |

#### Matrices de Mensajes (Almacenamiento JSON) {/* #message-arrays-json-storage */}

| Field               | Type | Descripción                             |
|---------------------|------|-----------------------------------------|
| `messages_array`    | TEXT | Array JSON de Mensajes de registro              |
| `warnings_array`    | TEXT | Array JSON de Mensajes de Advertencia          |
| `errors_array`      | TEXT | Array JSON de mensajes de error            |
| `available_backups` | TEXT | Array JSON de versiones de copia de seguridad disponibles |

#### Campos de Operación de Archivos {/* #file-operation-fields */}

| Field                 | Type    | Description                  |
|-----------------------|---------|------------------------------|
| `examined_files`      | INTEGER | Archivos examinados durante la copia de seguridad |
| `opened_files`        | INTEGER | Archivos abiertos para copia de seguridad      |
| `added_files`         | INTEGER | Archivos nuevos añadidos a la copia de seguridad    |
| `modified_files`      | INTEGER | Archivos modificados en copia de seguridad     |
| `deleted_files`       | INTEGER | Archivos eliminados de la copia de seguridad    |
| `deleted_folders`     | INTEGER | Carpetas eliminadas de la copia de seguridad  |
| `added_folders`       | INTEGER | Carpetas añadidas a copia de seguridad      |
| `modified_folders`    | INTEGER | Carpetas modificadas en copia de seguridad   |
| `not_processed_files` | INTEGER | Archivos no procesados          |
| `too_large_files`     | INTEGER | Archivos demasiado grandes para procesar   |
| `files_with_error`    | INTEGER | Archivos con errores            |
| `added_symlinks`      | INTEGER | Enlaces simbólicos añadidos         |
| `modified_symlinks`   | INTEGER | Enlaces simbólicos modificados      |
| `deleted_symlinks`    | INTEGER | Enlaces simbólicos eliminados       |

#### Campos de Tamaño de Archivo {/* #file-size-fields */}

| Campo                    | Tipo    | Descripción                          |
|--------------------------|---------|--------------------------------------|
| `size_of_examined_files` | INTEGER | Tamaño de Archivo de archivos examinados durante la copia de seguridad |
| `size_of_opened_files`   | INTEGER | Tamaño de Archivo de archivos abiertos para la copia de seguridad      |
| `size_of_added_files`    | INTEGER | Tamaño de Archivo de nuevos archivos añadidos a la copia de seguridad    |
| `size_of_modified_files` | INTEGER | Tamaño de Archivo de archivos modificados en la copia de seguridad     |

#### Campos de Estado de Operación {/* #operation-status-fields */}

| Campo                    | Tipo              | Descripción                    |
|--------------------------|-------------------|--------------------------------|
| `parsed_result`          | TEXT NOT NULL     | Resultado de operación analizado        |
| `main_operation`         | TEXT NOT NULL     | Tipo de operación principal            |
| `interrupted`            | BOOLEAN           | Si la copia de seguridad fue interrumpida |
| `partial_backup`         | BOOLEAN           | Si la copia de seguridad fue parcial     |
| `dryrun`                 | BOOLEAN           | Si la copia de seguridad fue una ejecución de prueba   |
| `version`                | TEXT              | Versión de duplicati utilizada         |
| `begin_time`             | DATETIME NOT NULL | Hora de inicio de la copia de seguridad              |
| `end_time`               | DATETIME NOT NULL | Hora de finalización de la copia de seguridad                |
| `warnings_actual_length` | INTEGER           | Recuento real de advertencias          |
| `errors_actual_length`   | INTEGER           | Recuento real de errores            |
| `messages_actual_length` | INTEGER           | Recuento real de mensajes          |

#### Campos de Estadísticas de Backend {/* #backend-statistics-fields */}

| Campo                            | Tipo     | Descripción                       |
|----------------------------------|----------|-----------------------------------|
| `bytes_downloaded`               | INTEGER  | Bytes descargados del destino |
| `known_file_size`                | INTEGER  | Tamaño de Archivo conocido en el destino    |
| `last_backup_date`               | DATETIME | Fecha de última copia de seguridad en el destino   |
| `backup_list_count`              | INTEGER  | Número de versiones de copia de seguridad         |
| `reported_quota_error`           | BOOLEAN  | Error de cuota reportado              |
| `reported_quota_warning`         | BOOLEAN  | Advertencia de cuota reportada            |
| `backend_main_operation`         | TEXT     | Operación principal del backend            |
| `backend_parsed_result`          | TEXT     | Resultado analizado del backend             |
| `backend_interrupted`            | BOOLEAN  | Operación del backend interrumpida     |
| `backend_version`                | TEXT     | Versión del backend                   |
| `backend_begin_time`             | DATETIME | Hora de inicio de la operación del backend      |
| `backend_duration`               | TEXT     | Duración de la operación del backend        |
| `backend_warnings_actual_length` | INTEGER  | Recuento de advertencias del backend            |
| `backend_errors_actual_length`   | INTEGER  | Recuento de errores del backend              |

### Tabla de Configuraciones {/* #configurations-table */}

Almacena la configuración de la aplicación.

#### Campos {/* #fields-1 */}

| Campo   | Tipo                      | Descripción                |
|---------|---------------------------|----------------------------|
| `key`   | TEXT PRIMARY KEY NOT NULL | Clave de configuración          |
| `value` | TEXT                      | Valor de configuración (JSON) |

#### Claves de Configuración Comunes {/* #common-configuration-keys */}

- `email_config`: Configuración de correo electrónico
- `ntfy_config`: Configuración de notificaciones NTFY
- `overdue_tolerance`: Configuración de tolerancia de copia de seguridad vencida
- `notification_templates`: Plantillas de mensajes de notificación
- `daily_summary`: Modo de Resumen Diario, horario, zona horaria, URL del panel público opcional y anulación opcional de Destinatario SMTP (`smtpRecipient`; vacío utiliza Configuración de correo electrónico)
- `cron_service`: Horarios de tareas Cron, incluyendo `daily-summary-dispatch` (`minute hour * * *` de `daily_summary.utcTime`)
- `audit_retention_days`: Retención de Registro de Auditoría (predeterminada: 90 días)

### Tabla de Versión de Base de Datos {/* #database-version-table */}

Realiza un seguimiento de la versión del esquema de la base de datos para fines de migración.

#### Campos {/* #fields-2 */}

| Campo        | Tipo             | Descripción                |
|--------------|------------------|----------------------------|
| `version`    | TEXT PRIMARY KEY | Versión de base de datos           |
| `applied_at` | DATETIME         | Cuándo se aplicó la migración |

### Tabla de Usuarios {/* #users-table */}

Almacena información de cuentas de usuario para autenticación y control de acceso.

#### Campos {/* #fields-3 */}

| Campo                   | Tipo                 | Descripción                         |
|-------------------------|----------------------|-------------------------------------|
| `id`                    | TEXT PRIMARY KEY     | Identificador único de usuario              |
| `username`              | TEXT UNIQUE NOT NULL | Nombre de usuario para inicio de sesión                  |
| `password_hash`         | TEXT NOT NULL        | Contraseña con hash Bcrypt              |
| `is_admin`              | BOOLEAN NOT NULL     | Si el usuario tiene privilegios de administrador   |
| `must_change_password`  | BOOLEAN              | Si se requiere cambio de contraseña |
| `created_at`            | DATETIME             | Marca de tiempo de creación de cuenta          |
| `updated_at`       | DATETIME         | Marca de tiempo de última actualización                                                       |
| `last_login_at`         | DATETIME             | Marca de tiempo del último inicio de sesión exitoso     |
| `last_login_ip`         | TEXT                 | Dirección IP del último inicio de sesión            |
| `failed_login_attempts` | INTEGER              | Recuento de intentos de inicio de sesión fallidos      |
| `locked_until`          | DATETIME             | Expiración del bloqueo de cuenta (si está bloqueado) |

### Tabla de Sesiones {/* #sessions-table */}

Almacena datos de sesión de usuario para autenticación y seguridad.

#### Campos {/* #fields-4 */}

| Campo             | Tipo              | Descripción                                                      |
|-------------------|-------------------|------------------------------------------------------------------|
| `id`              | TEXT PRIMARY KEY  | Identificador de sesión                                               |
| `user_id`         | TEXT              | Referencia a la tabla de usuarios (nula para sesiones no autenticadas) |
| `created_at`      | DATETIME          | Marca de tiempo de creación de sesión                                                       |
| `last_accessed`   | DATETIME          | Marca de tiempo de último acceso                                            |
| `expires_at`      | DATETIME NOT NULL | Marca de tiempo de expiración de sesión                                     |
| `ip_address`      | TEXT              | Dirección IP de origen de sesión                                     |
| `user_agent`    | TEXT                              | Cadena de agente de usuario                                                 |
| `csrf_token`      | TEXT              | Token CSRF para la sesión                                       |
| `csrf_expires_at` | DATETIME          | Expiración del token CSRF                                            |

### Tabla de Registro de auditoría {/* #audit-log-table */}

Almacena el registro de auditoría de acciones de usuario y eventos del sistema.

#### Campos {/* #fields-5 */}

| Campo           | Tipo                              | Descripción                                                       |
|-----------------|-----------------------------------|-------------------------------------------------------------------|
| `id`            | INTEGER PRIMARY KEY AUTOINCREMENT | Identificador único de entrada de registro de auditoría                                 |
| `timestamp`     | DATETIME                          | Marca de tiempo de evento                                                   |
| `user_id`       | TEXT                              | Referencia a la tabla de usuarios (nula)                               |
| `username`      | TEXT                              | Nombre de usuario en el momento de la acción                                        |
| `action`        | TEXT NOT NULL                     | Acción realizada                                                  |
| `category`      | TEXT NOT NULL                     | Categoría de acción (p. ej., 'autenticación', 'configuración', 'copia de seguridad') |
| `target_type`   | TEXT                              | Tipo de destino (p. ej., 'servidor', 'copia de seguridad', 'usuario')                 |
| `target_id`     | TEXT                              | Identificador de destino                                              |
| `details`       | TEXT                              | Detalles adicionales (JSON)                                         |
| `ip_address`    | TEXT                              | Dirección IP del solicitante                                           |
| `user_agent`    | TEXT                              | Cadena de agente de usuario                                                 |
| `status`        | TEXT NOT NULL                     | Estado de la acción ('éxito', 'error', 'error')                  |
| `error_message` | TEXT                              | Mensaje de error si la acción falló                                    |

### Tabla de claves de API {/* #api-keys-table */}

Almacena claves de API con hash para las API HTTP externas. El secreto en texto plano se muestra una sola vez en la creación y nunca se almacena.

#### Campos {/* #fields-6 */}

| Campo          | Tipo             | Descripción                                              |
|----------------|------------------|----------------------------------------------------------|
| `id`           | TEXT PRIMARY KEY | Identificador único de clave                                    |
| `name`         | TEXT NOT NULL    | Nombre para mostrar                                             |
| `key_hash`     | TEXT UNIQUE      | Hash SHA-256 del secreto                               |
| `key_prefix`   | TEXT             | Primeros cuatro caracteres del secreto (para huellas dactilares)   |
| `key_suffix`   | TEXT             | Últimos cuatro caracteres del secreto (para huellas dactilares)    |
| `scope`        | TEXT NOT NULL    | `upload` o `read`                                       |
| `description`  | TEXT             | Descripción opcional                                     |
| `enabled`      | INTEGER          | `1` cuando la clave está activa                               |
| `created_at`   | DATETIME         | Marca de tiempo de creación                                       |
| `created_by`   | TEXT             | Id de usuario del administrador que creó la clave         |
| `expires_at`   | DATETIME         | Expiración opcional                                      |
| `last_used_at` | DATETIME         | Último uso exitoso                                       |
| `usage_count`  | INTEGER          | Recuento de usos exitosos                                |

Claves de configuración relacionadas en la tabla `configurations`: `external_api_require_api_key`, `ip_trusted_proxies`, `admin_ip_allowlist`, `external_api_ip_allowlist`, `upload_limits`.

### Tabla de entregas de Resumen Diario {/* #daily-summary-deliveries-table */}

Libro mayor por canal para la entrega de correo electrónico de Resumen Diario. Las filas heredadas pueden incluir un canal `ntfy` de versiones anteriores. Cada ocurrencia programada (o envío manual único) tiene como máximo una fila por canal. Las cargas útiles procesadas se almacenan antes del envío para que los reintentos mantengan la misma instantánea. Las filas más antiguas de 30 días se eliminan.

Si el proceso muere después de que un proveedor acepta un mensaje pero antes de que se registre el éxito, ese canal puede reintentarse (al menos una vez).

#### Campos {/* #fields-7 */}

| Campo              | Tipo             | Descripción                                                                 |
|--------------------|------------------|-----------------------------------------------------------------------------|
| `id`               | TEXT PRIMARY KEY | Identificador de entrega único                                              |
| `occurrence_key`   | TEXT NOT NULL    | Clave programada `scheduled:UTC:{date}:{HH:mm}` o `manual:{uuid}`             |
| `channel`          | TEXT NOT NULL    | `email` o `ntfy`                                                           |
| `trigger`          | TEXT NOT NULL    | `scheduled`, `manual`, o `retry`                                           |
| `summary_date`     | TEXT NOT NULL    | Fecha de calendario local para la instantánea                               |
| `time_zone`        | TEXT NOT NULL    | Zona horaria IANA guardada                                                  |
| `payload_json`     | TEXT             | Asunto procesado, campos HTML, texto y NTFY                                |
| `state`            | TEXT NOT NULL    | `pending`, `sending`, `sent`, o `failed`                                   |
| `attempt_count`    | INTEGER          | Intentos de entrega                                                        |
| `next_retry_at`    | DATETIME         | Cuándo un canal fallido puede reclamarse nuevamente                        |
| `lease_expires_at` | DATETIME         | Arrendamiento de reclamación; un arrendamiento obsoleto puede recuperarse   |
| `error`            | TEXT             | Último error, si existe                                                     |
| `created_at`       | DATETIME         | Marca de tiempo de creación de fila                                                      |
| `updated_at`       | DATETIME         | Marca de tiempo de última actualización                                                       |
| `sent_at`          | DATETIME         | Marca de tiempo de éxito                                                           |

Un índice único en `(occurrence_key, channel)` previene envíos duplicados de la misma ocurrencia en el mismo canal.

## Gestión de sesiones {/* #session-management */}

### Almacenamiento de sesiones respaldado por base de datos {/* #database-backed-session-storage */}

Las sesiones se almacenan en la base de datos con respaldo en memoria:
- **Almacenamiento principal**: Tabla de sesiones respaldada por base de datos
- **Respaldo**: Almacenamiento en memoria (soporte heredado o casos de error)
- **ID de sesión**: Cadena aleatoria criptográficamente segura
- **Expiración**: Tiempo de espera de sesión configurable
- **Protección CSRF**: Protección contra falsificación de solicitudes entre sitios
- **Limpieza automática**: Las sesiones expiradas se eliminan automáticamente

### Puntos finales de API de sesión {/* #session-api-endpoints */}

- `POST /api/session`: Crear nueva sesión
- `GET /api/session`: Validar sesión existente
- `DELETE /api/session`: Destruir sesión
- `GET /api/csrf`: Obtener token CSRF

## Índices {/* #indexes */}

La base de datos incluye varios índices para un rendimiento óptimo de consultas:

- **Claves principales**: Todos los tablas tienen índices de clave principal
- **Claves externas**: Referencias de servidor en tabla de copias de seguridad, referencias de usuario en sesiones y registro de auditoría
- **Optimización de consultas**: Índices en campos consultados frecuentemente
- **Índices de fecha**: Índices en campos de fecha para consultas basadas en tiempo
- **Índices de usuario**: Índice de nombre de usuario para búsquedas rápidas de usuario
- **Índices de sesión**: Índices de expiración e id_usuario para gestión de sesiones
- **Índices de auditoría**: Índices de marca de tiempo, id_usuario, acción, categoría y estado para consultas de auditoría
- **Índices de clave de API**: Hash único, más búsquedas de ámbito/habilitado para autenticación

## Relaciones {/* #relationships */}

- **Servidores → Copias de seguridad**: Relación uno a muchos
- **Usuarios → Sesiones**: Relación uno a muchos (las sesiones pueden existir sin usuarios)
- **Usuarios → Registro de auditoría**: Relación uno a muchos (las entradas de auditoría pueden existir sin usuarios)
- **Usuarios → Claves de API**: Relación uno a muchos a través de `created_by` (las claves permanecen después de que se elimina el usuario)
- **Copias de seguridad → Mensajes**: Matrices JSON incrustadas
- **Configuraciones**: Almacenamiento de clave-valor

## Tipos de datos {/* #data-types */}

- **TEXT**: Datos de cadena, matrices JSON
- **INTEGER**: Datos numéricos, recuentos de archivos, tamaños
- **REAL**: Números de punto flotante, duraciones
- **DATETIME**: Datos de marca de tiempo
- **BOOLEAN**: Valores verdadero/falso

## Estados de Copia de seguridad {/* #backup-status-values */}

- **Éxito**: Copia de seguridad completada exitosamente
- **Advertencia**: Copia de seguridad completada con advertencias
- **Error**: Copia de seguridad completada con errores
- **Fatal**: Copia de seguridad falló fatalmente

## Consultas Comunes {/* #common-queries */}

### Obtener la Última Copia de seguridad para un Servidor {/* #get-latest-backup-for-a-server */}

```sql
SELECT * FROM backups 
WHERE server_id = ? 
ORDER BY date DESC 
LIMIT 1;
```

### Obtener Todas las Copias de seguridad para un Servidor {/* #get-all-backups-for-a-server */}

```sql
SELECT * FROM backups 
WHERE server_id = ? 
ORDER BY date DESC;
```

### Obtener Resumen del Servidor {/* #get-server-summary */}

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

### Obtener Resumen General {/* #get-overall-summary */}

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

### Limpieza de Base de Datos {/* #database-cleanup */}

```sql
-- Delete old backups (older than 30 days)
DELETE FROM backups 
WHERE date < datetime('now', '-30 days');

-- Delete servers with no backups
DELETE FROM servers 
WHERE id NOT IN (SELECT DISTINCT server_id FROM backups);
```

## Asignación de JSON a Base de Datos {/* #json-to-database-mapping */}

### Asignación de Cuerpo de Solicitud de API a Columnas de Base de Datos {/* #api-request-body-to-database-columns-mapping */}

Cuándo duplicati envía datos de copia de seguridad a través de HTTP POST, la estructura JSON se asigna a columnas de base de datos:

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

**Nota**: El campo `size` en la tabla de copias de seguridad almacena `SizeOfExaminedFiles` y `uploaded_size` almacena el tamaño real subido/transferido de la operación de copia de seguridad.
