# Esquema de la Base de Datos {/* #database-schema */}

Este documento describe el esquema de la base de datos SQLite utilizado por duplistatus para almacenar datos de operaciones de copia de seguridad.

## Ubicación de la Base de Datos {/* #database-location */}

La base de datos se almacena en el directorio de datos de la aplicación:
- **Ubicación predeterminada**: `/app/data/backups.db`
- **Volumen de Docker**: `duplistatus_data:/app/data`
- **Nombre del archivo**: `backups.db`

## Sistema de Migración de la Base de Datos {/* #database-migration-system */}

duplistatus utiliza un sistema de migración automatizado para manejar los cambios en el esquema de la base de datos entre versiones.

### Historial de Versiones de Migración {/* #migration-version-history */}

Las siguientes son las versiones históricas de migración que llevaron la base de datos a su estado actual:

- **Esquema v1.0** (Aplicación v0.6.x y anteriores): Esquema inicial de la base de datos con tablas de máquinas y copias de seguridad
- **Esquema v2.0** (Aplicación v0.7.x): Añadió columnas faltantes y tabla de configuraciones
- **Esquema v3.0** (Aplicación v0.7.x): Renombró la tabla de máquinas a servidores, añadió la columna server_url
- **Esquema v3.1** (Aplicación v0.8.x): Mejoró los campos de datos de copia de seguridad, añadió la columna server_password
- **Esquema v4.0** (Aplicación v0.9.x / v1.0.x): Añadió Control de Acceso de Usuario (tablas de usuarios, sesiones, registro de auditoría)
- **Esquema v4.1** (Aplicación v1.5.x): Añadió `api_keys` y claves de configuración predeterminadas para autenticación opcional por clave API, listas de permitidos de IP y límites de subida
- **Esquema v4.2** (Aplicación v1.5.x): Añadió `daily_summary_deliveries` ledger y configuración predeterminada de `daily_summary` para notificaciones de resumen diario opcionales

La versión actual de la aplicación (v1.5.x) utiliza **Esquema v4.2** como la versión más reciente del esquema de la base de datos.

### Proceso de Migración {/* #migration-process */}

1. **Copia de Seguridad Automática**: Crea una copia de seguridad antes de la migración
2. **Actualización del Esquema**: Actualiza la estructura de la base de datos
3. **Migración de Datos**: Preserva los datos existentes
4. **Verificación**: Confirma que la migración se realizó con éxito

## Tablas {/* #tables */}

### Tabla de Servidores {/* #servers-table */}

Almacena información sobre los servidores Duplicati que están siendo monitoreados.

#### Campos {/* #fields */}

| Campo             | Tipo             | Descripción                        |
|-------------------|------------------|------------------------------------|
| `id`              | TEXT PRIMARY KEY | Identificador único del servidor           |
| `name`            | TEXT NOT NULL    | Nombre del servidor de Duplicati         |
| `server_url`      | TEXT             | URL del servidor Duplicati               |
| `alias`           | TEXT             | Nombre descriptivo definido por el usuario         |
| `note`            | TEXT             | Notas/descripción definidas por el usuario     |
| `server_password` | TEXT             | Contraseña del servidor para autenticación |
| `created_at`      | DATETIME         | Marca de tiempo de creación del servidor          |

### Tabla de Copias de seguridad {/* #backups-table */}

Almacena datos de operaciones de copia de seguridad recibidos de servidores Duplicati.

#### Campos Clave {/* #key-fields */}

| Campo              | Tipo              | Descripción                                    |
|--------------------|-------------------|------------------------------------------------|
| `id`               | TEXT PRIMARY KEY  | Identificador único de copia de seguridad                       |
| `server_id`        | TEXT NOT NULL     | Referencia a la tabla de servidores                     |
| `backup_name`      | TEXT NOT NULL     | Nombre del trabajo de copia de seguridad                                |
| `backup_id`        | TEXT NOT NULL     | ID de copia de seguridad de Duplicati                       |
| `date`             | DATETIME NOT NULL | Hora de ejecución de la copia de seguridad                          |
| `status`           | TEXT NOT NULL     | Estado de la copia de seguridad (Éxito, Advertencia, Error, Fatal) |
| `duration_seconds` | INTEGER NOT NULL  | Duración en segundos                            |
| `size`             | INTEGER           | Tamaño de los archivos fuente                           |
| `uploaded_size`    | INTEGER           | Tamaño de datos subidos                          |
| `examined_files`   | INTEGER           | Número de archivos examinados                       |
| `warnings`         | INTEGER           | Número de advertencias                             |
| `errors`           | INTEGER           | Número de errores                               |
| `created_at`       | DATETIME          | Marca de tiempo de creación del registro                      |

#### Arreglos de Mensajes (Almacenamiento JSON) {/* #message-arrays-json-storage */}

| Campo               | Tipo | Descripción                             |
|---------------------|------|-----------------------------------------|
| `messages_array`    | TEXTO | Arreglo JSON de mensajes de registro              |
| `warnings_array`    | TEXTO | Arreglo JSON de mensajes de advertencia          |
| `errors_array`      | TEXTO | Arreglo JSON de mensajes de error            |
| `available_backups` | TEXTO | Arreglo JSON de versiones de copia de seguridad disponibles |

#### Campos de Operaciones de Archivos {/* #file-operation-fields */}

| Campo                 | Tipo    | Descripción                  |
|-----------------------|---------|------------------------------|
| `examined_files`      | ENTERO | Archivos examinados durante la copia de seguridad |
| `opened_files`        | ENTERO | Archivos abiertos para copia de seguridad      |
| `added_files`         | ENTERO | Archivos nuevos añadidos a la copia de seguridad    |
| `modified_files`      | ENTERO | Archivos modificados en la copia de seguridad     |
| `deleted_files`       | ENTERO | Archivos eliminados de la copia de seguridad    |
| `deleted_folders`     | ENTERO | Carpetas eliminadas de la copia de seguridad  |
| `added_folders`       | ENTERO | Carpetas añadidas a la copia de seguridad      |
| `modified_folders`    | ENTERO | Carpetas modificadas en la copia de seguridad   |
| `not_processed_files` | ENTERO | Archivos no procesados          |
| `too_large_files`     | ENTERO | Archivos demasiado grandes para procesar   |
| `files_with_error`    | ENTERO | Archivos con errores            |
| `added_symlinks`      | ENTERO | Enlaces simbólicos añadidos         |
| `modified_symlinks`   | ENTERO | Enlaces simbólicos modificados      |
| `deleted_symlinks`    | ENTERO | Enlaces simbólicos eliminados       |

#### Campos de Tamaño de Archivo {/* #file-size-fields */}

| Campo                    | Tipo    | Descripción                          |
|--------------------------|---------|--------------------------------------|
| `size_of_examined_files` | INTEGER | Tamaño de archivos examinados durante la copia de seguridad |
| `size_of_opened_files`   | INTEGER | Tamaño de archivos abiertos para la copia de seguridad      |
| `size_of_added_files`    | INTEGER | Tamaño de nuevos archivos añadidos a la copia de seguridad    |
| `size_of_modified_files` | INTEGER | Tamaño de archivos modificados en la copia de seguridad     |

#### Campos de Estado de Operación {/* #operation-status-fields */}

| Campo                    | Tipo              | Descripción                    |
|--------------------------|-------------------|--------------------------------|
| `parsed_result`          | TEXT NOT NULL     | Resultado de la operación analizado        |
| `main_operation`         | TEXT NOT NULL     | Tipo principal de operación            |
| `interrupted`            | BOOLEAN           | Si la copia de seguridad fue interrumpida |
| `partial_backup`         | BOOLEAN           | Si la copia de seguridad fue parcial     |
| `dryrun`                 | BOOLEAN           | Si la copia de seguridad fue una prueba de ejecución   |
| `version`                | TEXT              | Versión de duplicati utilizada         |
| `begin_time`             | DATETIME NOT NULL | Hora de inicio de la copia de seguridad              |
| `end_time`               | DATETIME NOT NULL | Hora de finalización de la copia de seguridad                |
| `warnings_actual_length` | INTEGER           | Número real de advertencias          |
| `errors_actual_length`   | INTEGER           | Número real de errores            |
| `messages_actual_length` | INTEGER           | Número real de mensajes          |

#### Campos de Estadísticas de Backend {/* #backend-statistics-fields */}

| Campo                            | Tipo     | Descripción                       |
|----------------------------------|----------|-----------------------------------|
| `bytes_downloaded`               | INTEGER  | Bytes descargados del destino |
| `known_file_size`                | INTEGER  | Tamaño de archivo conocido en el destino    |
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
| `backend_warnings_actual_length` | INTEGER  | Número de advertencias del backend            |
| `backend_errors_actual_length`   | INTEGER  | Número de errores del backend              |

### Tabla de Configuraciones {/* #configurations-table */}

Almacena la configuración de la aplicación.

#### Campos {/* #fields-1 */}

| Campo   | Tipo                      | Descripción                |
|---------|---------------------------|----------------------------|
| `key`   | TEXT PRIMARY KEY NOT NULL | Clave de configuración          |
| `value` | TEXT                      | Valor de configuración (JSON) |

#### Claves de Configuración Comunes {/* #common-configuration-keys */}

- `email_config`: Configuración de notificaciones por correo electrónico
- `ntfy_config`: Configuración de notificaciones NTFY
- `overdue_tolerance`: Configuración de tolerancia para copias de seguridad vencidas
- `notification_templates`: Plantillas de mensajes de notificación
- `daily_summary`: Modo Resumen Diario, horario, zona horaria, URL del panel público opcional y destinatario SMTP opcional (`smtpRecipient`; vacío usa la configuración de correo electrónico)
- `cron_service`: Horarios de tareas Cron, incluyendo `daily-summary-dispatch` (`minute hour * * *` de `daily_summary.utcTime`)
- `audit_retention_days`: Período de retención del registro de auditoría (predeterminado: 90 días)

### Tabla de Versión de Base de Datos {/* #database-version-table */}

Rastrea la versión del esquema de la base de datos para fines de migración.

#### Campos {/* #fields-2 */}

| Campo        | Tipo             | Descripción                |
|--------------|------------------|----------------------------|
| `version`    | TEXT PRIMARY KEY | Versión de la base de datos           |
| `applied_at` | DATETIME         | Cuándo se aplicó la migración |

### Tabla de Usuarios {/* #users-table */}

Almacena información de cuentas de usuario para autenticación y control de acceso.

#### Campos {/* #fields-3 */}

| Campo                   | Tipo                 | Descripción                         |
|-------------------------|----------------------|-------------------------------------|
| `id`                    | TEXT PRIMARY KEY     | Identificador único de usuario              |
| `username`              | TEXT UNIQUE NOT NULL | Nombre de usuario para inicio de sesión                  |
| `password_hash`         | TEXT NOT NULL        | Contraseña cifrada con Bcrypt              |
| `is_admin`              | BOOLEAN NOT NULL     | Si el usuario tiene privilegios de administrador   |
| `must_change_password`  | BOOLEAN              | Si se requiere cambiar la contraseña |
| `created_at`            | DATETIME             | Marca de tiempo de creación de la cuenta          |
| `updated_at`       | DATETIME         | Última marca de tiempo de actualización                                                       |
| `last_login_at`         | DATETIME             | Última marca de tiempo de inicio de sesión exitoso     |
| `last_login_ip`         | TEXT                 | Dirección IP del último inicio de sesión            |
| `failed_login_attempts` | INTEGER              | Número de intentos de inicio de sesión fallidos      |
| `locked_until`          | DATETIME             | Expiración del bloqueo de la cuenta (si está bloqueada) |

### Tabla de Sesiones {/* #sessions-table */}

Almacena datos de sesión de usuario para autenticación y seguridad.

#### Campos {/* #fields-4 */}

| Campo             | Tipo              | Descripción                                                      |
|-------------------|-------------------|------------------------------------------------------------------|
| `id`              | TEXT PRIMARY KEY  | Identificador de sesión                                               |
| `user_id`         | TEXT              | Referencia a la tabla de usuarios (nulo para sesiones no autenticadas) |
| `created_at`      | DATETIME          | Marca de tiempo de creación de la sesión                                       |
| `last_accessed`   | DATETIME          | Marca de tiempo del último acceso                                            |
| `expires_at`      | DATETIME NOT NULL | Marca de tiempo de expiración de la sesión                                     |
| `ip_address`      | TEXT              | Dirección IP de origen de la sesión                                     |
| `user_agent`    | TEXT                              | Cadena de agente de usuario                                                 |
| `csrf_token`      | TEXT              | Token CSRF para la sesión                                       |
| `csrf_expires_at` | DATETIME          | Expiración del token CSRF                                            |

### Tabla de Registro de Auditoría {/* #audit-log-table */}

Almacena el registro de auditoría de acciones de usuario y eventos del sistema.

#### Campos {/* #fields-5 */}

| Campo           | Tipo                              | Descripción                                                       |
|-----------------|-----------------------------------|-------------------------------------------------------------------|
| `id`            | INTEGER PRIMARY KEY AUTOINCREMENT | Identificador único de entrada en el registro de auditoría                                 |
| `timestamp`     | DATETIME                          | Marca de tiempo del evento                                                   |
| `user_id`       | TEXT                              | Referencia a la tabla de usuarios (nulo)                               |
| `username`      | TEXT                              | Nombre de usuario en el momento de la acción                                        |
| `action`        | TEXT NOT NULL                     | Acción realizada                                                  |
| `category`      | TEXT NOT NULL                     | Categoría de la acción (por ejemplo, 'autenticación', 'configuración', 'copia de seguridad') |
| `target_type`   | TEXT                              | Tipo de destino (por ejemplo, 'servidor', 'copia de seguridad', 'usuario')                 |
| `target_id`     | TEXT                              | Identificador del destino                                              |
| `details`       | TEXT                              | Detalles adicionales (JSON)                                         |
| `ip_address`    | TEXT                              | Dirección IP del solicitante                                           |
| `user_agent`    | TEXT                              | Cadena de agente de usuario                                                 |
| `status`        | TEXT NOT NULL                     | Estado de la acción ('éxito', 'error', 'fallido')                  |
| `error_message` | TEXT                              | Mensaje de error si la acción falló                                    |

### Tabla de Claves de API {/* #api-keys-table */}

Almacena claves de API cifradas para las API HTTP externas. El secreto en texto plano se muestra una vez al crear y nunca se almacena.

#### Campos {/* #fields-6 */}

| Campo          | Tipo             | Descripción                                              |
|----------------|------------------|----------------------------------------------------------|
| `id`           | TEXT PRIMARY KEY | Identificador único de la clave                                    |
| `name`         | TEXT NOT NULL    | Nombre para mostrar                                             |
| `key_hash`     | TEXT UNIQUE      | Hash SHA-256 del secreto                               |
| `key_prefix`   | TEXT             | Primeros cuatro caracteres del secreto (para huellas dactilares)   |
| `key_suffix`   | TEXT             | Últimos cuatro caracteres del secreto (para huellas dactilares)    |
| `scope`        | TEXT NOT NULL    | `upload` o `read`                                       |
| `description`  | TEXT             | Descripción opcional                                     |
| `enabled`      | INTEGER          | `1` cuando la clave está activa                               |
| `created_at`   | DATETIME         | Marca de tiempo de creación                                       |
| `created_by`   | TEXT             | ID de usuario del administrador que creó la clave         |
| `expires_at`   | DATETIME         | Expiración opcional                                          |
| `last_used_at` | DATETIME         | Último uso exitoso                                      |
| `usage_count`  | INTEGER          | Recuento de usos exitosos                                     |

Claves de configuración relacionadas en la tabla `configurations`: `external_api_require_api_key`, `ip_trusted_proxies`, `admin_ip_allowlist`, `external_api_ip_allowlist`, `upload_limits`.

### Tabla de Entregas de Resumen Diario {/* #daily-summary-deliveries-table */}

Registro por canal para la entrega de correos electrónicos de Resumen Diario. Las filas heredadas pueden incluir un canal `ntfy` de versiones anteriores. Cada ocurrencia programada (o envío manual único) tiene como máximo una fila por canal. Los payloads renderizados se almacenan antes de enviarse para que los reintentos mantengan la misma instantánea. Las filas con más de 30 días se eliminan.

Si el proceso se detiene después de que un proveedor acepte un mensaje pero antes de registrar el éxito, ese canal puede ser reintentado (al menos una vez).

#### Campos {/* #fields-7 */}

| Campo              | Tipo             | Descripción                                                                 |
|--------------------|------------------|-----------------------------------------------------------------------------|
| `id`               | TEXT PRIMARY KEY | Identificador único de entrega                                                  |
| `occurrence_key`   | TEXT NOT NULL    | Clave programada `scheduled:UTC:{date}:{HH:mm}` o `manual:{uuid}`             |
| `channel`          | TEXT NOT NULL    | `email` o `ntfy`                                                           |
| `trigger`          | TEXT NOT NULL    | `scheduled`, `manual`, o `retry`                                           |
| `summary_date`     | TEXT NOT NULL    | Fecha del calendario local para la instantánea                                        |
| `time_zone`        | TEXT NOT NULL    | Zona horaria IANA guardada                                                         |
| `payload_json`     | TEXT             | Asunto renderizado, HTML, texto y campos NTFY                               |
| `state`            | TEXT NOT NULL    | `pending`, `sending`, `sent`, o `failed`                                   |
| `attempt_count`    | INTEGER          | Intentos de entrega                                                           |
| `next_retry_at`    | DATETIME         | Cuándo un canal fallido puede ser reclamado nuevamente                                  |
| `lease_expires_at` | DATETIME         | Arrendamiento de reclamación; un arrendamiento obsoleto puede ser recuperado                                 |
| `error`            | TEXT             | Último error, si lo hay                                                          |
| `created_at`       | DATETIME         | Marca de tiempo de creación de la fila                                                      |
| `updated_at`       | DATETIME         | Última marca de tiempo de actualización                                                       |
| `sent_at`          | DATETIME         | Marca de tiempo de éxito                                                           |

Un índice único en `(occurrence_key, channel)` evita el envío duplicado de la misma ocurrencia en el mismo canal.

## Gestión de Sesiones {/* #session-management */}

### Almacenamiento de Sesiones con Soporte de Base de Datos {/* #database-backed-session-storage */}

Las sesiones se almacenan en la base de datos con respaldo en memoria:
- **Almacenamiento Primario**: Tabla de sesiones con soporte de base de datos
- **Respaldo**: Almacenamiento en memoria (soporte legado o casos de error)
- **ID de Sesión**: Cadena aleatoria criptográficamente segura
- **Expiración**: Tiempo de espera de sesión configurable
- **Protección CSRF**: Protección contra falsificación de solicitudes entre sitios
- **Limpieza Automática**: Las sesiones expiradas se eliminan automáticamente

### Puntos de Acceso de la API de Sesiones {/* #session-api-endpoints */}

- `POST /api/session`: Crear nueva sesión
- `GET /api/session`: Validar sesión existente
- `DELETE /api/session`: Destruir sesión
- `GET /api/csrf`: Obtener token CSRF

## Índices {/* #indexes */}

La base de datos incluye varios índices para un rendimiento óptimo de consulta:

- **Claves Primarias**: Todas las tablas tienen índices de claves primarias
- **Claves Extranjeras**: Referencias de servidores en la tabla de respaldos, referencias de usuarios en sesiones y registro de auditoría
- **Optimización de Consultas**: Índices en campos consultados con frecuencia
- **Índices de Fecha**: Índices en campos de fecha para consultas basadas en el tiempo
- **Índices de Usuarios**: Índice de nombre de usuario para búsquedas rápidas de usuarios
- **Índices de Sesiones**: Índices de expiración y user_id para gestión de sesiones
- **Índices de Auditoría**: Índices de marca de tiempo, user_id, acción, categoría y estado para consultas de auditoría
- **Índices de Claves de API**: Hash único, además de búsquedas de habilitado/ámbito para autenticación

## Relaciones {/* #relationships */}

- **Servidores → Respaldos**: Relación uno a muchos
- **Usuarios → Sesiones**: Relación uno a muchos (las sesiones pueden existir sin usuarios)
- **Usuarios → Registro de Auditoría**: Relación uno a muchos (las entradas de auditoría pueden existir sin usuarios)
- **Usuarios → Claves de API**: Relación uno a muchos a través de `created_by` (las claves permanecen después de que se elimina el usuario)
- **Respaldos → Mensajes**: Arreglos JSON incrustados
- **Configuraciones**: Almacenamiento clave-valor

## Tipos de Datos {/* #data-types */}

- **TEXT**: Datos de cadena, arreglos JSON
- **INTEGER**: Datos numéricos, recuentos de archivos, tamaños
- **REAL**: Números de punto flotante, duraciones
- **DATETIME**: Datos de marca de tiempo
- **BOOLEAN**: Valores verdadero/falso

## Valores de estado de copia de seguridad {/* #backup-status-values */}

- **Éxito**: Copia de seguridad completada con éxito
- **Advertencia**: Copia de seguridad completada con advertencias
- **Error**: Copia de seguridad completada con errores
- **Fatal**: Copia de seguridad fallida fatalmente

## Consultas comunes {/* #common-queries */}

### Obtener la última copia de seguridad de un servidor {/* #get-latest-backup-for-a-server */}

```sql
SELECT * FROM backups 
WHERE server_id = ? 
ORDER BY date DESC 
LIMIT 1;
```

### Obtener todas las copias de seguridad de un servidor {/* #get-all-backups-for-a-server */}

```sql
SELECT * FROM backups 
WHERE server_id = ? 
ORDER BY date DESC;
```

### Obtener resumen del servidor {/* #get-server-summary */}

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

### Obtener resumen general {/* #get-overall-summary */}

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

### Limpieza de la base de datos {/* #database-cleanup */}

```sql
-- Delete old backups (older than 30 days)
DELETE FROM backups 
WHERE date < datetime('now', '-30 days');

-- Delete servers with no backups
DELETE FROM servers 
WHERE id NOT IN (SELECT DISTINCT server_id FROM backups);
```

## Mapeo de JSON a base de datos {/* #json-to-database-mapping */}

### Mapeo de columnas de la base de datos a cuerpo de la solicitud de la API {/* #api-request-body-to-database-columns-mapping */}

Cuando Duplicati envía datos de copia de seguridad mediante HTTP POST, la estructura JSON se mapea a columnas de la base de datos:

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
