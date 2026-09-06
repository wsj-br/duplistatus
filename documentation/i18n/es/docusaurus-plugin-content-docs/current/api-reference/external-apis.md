# APIs externas {#external-apis}

Estos endpoints están diseñados para ser utilizados por otras aplicaciones e integraciones, por ejemplo [Página principal](../user-guide/homepage-integration.md). Son exentos de CSRF y no utilizan cookies de sesión.

La autenticación es opcional y está desactivada por defecto. Cuando **Requiere claves de API** está habilitado en [Claves de API](../user-guide/settings/api-keys-settings.md), envía la clave como `?api_key=`, `X-Api-Key`, o `Authorization: Bearer`. Las claves de subida solo funcionan en `POST /api/upload`. Las claves de lectura solo funcionan en `/api/summary` y `/api/lastbackup*`. Las claves de consulta en la cadena de consulta aparecen en los registros de acceso del proxy inverso.

Una [lista de IPs permitidas](../user-guide/settings/ip-allowlist-settings.md) también puede restringir estas rutas. `/api/health` y `/api/ping` permanecen abiertas.

## Obtener resumen general - `/api/summary` {#get-overall-summary---apisummary}
- **Endpoint**: `/api/summary`
- **Method**: GET
- **Description**: Recupera un resumen de todas las operaciones de copia de seguridad en todos los servidores.
- **Respuesta**:

  ```json
  {
    "totalServers": 3,
    "totalBackupsRuns": 9,
    "totalBackups": 9,
    "totalUploadedSize": 2397229507,
    "totalStorageUsed": 43346796938,
    "totalBackupSize": 126089687807,
    "overdueBackupsCount": 2,
    "secondsSinceLastBackup": 7200
  }
  ```

- **Respuestas de error**:
  - `401`: Clave de API faltante o inválida cuando las claves son requeridas
  - `403`: El ámbito de la clave no es `read`, o la IP del cliente no está en la lista de IPs permitidas externas
  - `429`: Límite de tasa de la API de lectura excedido
  - `500`: Error del servidor al obtener datos de resumen
- **Notas**:
  - En la versión 0.5.x, el campo `totalBackupedSize` fue reemplazado por `totalBackupSize`
  - En la versión 0.7.x, el campo `totalMachines` fue reemplazado por `totalServers`
  - El campo `overdueBackupsCount` muestra el número de copias de seguridad pendientes actualmente
  - El campo `secondsSinceLastBackup` muestra el tiempo en segundos desde la última copia de seguridad en todos los servidores
  - Devuelve una respuesta de respaldo con ceros si falla la obtención de datos
  - **Nota**: Para uso en el panel interno, considera usar `/api/dashboard` que incluye estos datos más información adicional

## Obtener última copia de seguridad - `/api/lastbackup/:serverId` {#get-latest-backup---apilastbackupserverid}
- **Endpoint**: `/api/lastbackup/:serverId`
- **Method**: GET
- **Description**: Recupera la información de la última copia de seguridad para un servidor específico.
- **Parámetros**:
  - `serverId`: el identificador del servidor (ID o nombre)

:::note
El identificador del servidor debe estar codificado en URL.
:::

- **Respuesta**:

  ```json
  {
    "server": {
      "id": "unique-server-id",
      "name": "Server Name",
      "backup_name": "Backup Name",
      "backup_id": "backup-id",
      "created_at": "2024-03-20T10:00:00Z"
    },
    "latest_backup": {
      "id": "backup-id",
      "server_id": "unique-server-id",
      "name": "Backup Name",
      "date": "2024-03-20T10:00:00Z",
      "status": "Success",
      "warnings": 0,
      "errors": 0,
      "messages": 150,
      "fileCount": 249426,
      "fileSize": 113395849938,
      "uploadedSize": 331318892,
      "duration": "00:38:31",
      "duration_seconds": 2311.6018052,
      "durationInMinutes": 38.52669675333333,
      "knownFileSize": 27203688543,
      "backup_list_count": 10,
      "messages_array": ["message1", "message2"],
      "warnings_array": ["warning1"],
      "errors_array": [],
      "available_backups": ["v1", "v2", "v3"]
    },
    "status": 200
  }
  ```

- **Respuestas de error**:
  - `401`: Clave de API faltante o inválida cuando las claves son requeridas
  - `403`: El ámbito de la clave no es `read`, o la IP del cliente no está en la lista de IPs permitidas externas
  - `404`: Servidor no encontrado
  - `429`: Límite de tasa de la API de lectura excedido
  - `500`: Error interno del servidor
- **Notas**:
  - En la versión 0.7.x, la clave del objeto de respuesta cambió de `machine` a `server`
  - El identificador del servidor puede ser ID o nombre
  - Devuelve null para latest_backup si no existen copias de seguridad
  - Incluye encabezados de control de caché para evitar el almacenamiento en caché

## Obtener últimas copias de seguridad - `/api/lastbackups/:serverId` {#get-latest-backups---apilastbackupsserverid}
- **Endpoint**: `/api/lastbackups/:serverId`
- **Method**: GET
- **Description**: Recupera la información de la última copia de seguridad para todas las copias de seguridad configuradas (por ejemplo, 'Archivos', 'Bases de datos') en un servidor específico.
- **Parámetros**:
  - `serverId`: el identificador del servidor (ID o nombre)

:::note
El identificador del servidor debe estar codificado en URL.
:::

- **Respuesta**:

  ```json
  {
    "server": {
      "id": "unique-server-id",
      "name": "Server Name",
      "backup_name": "Default Backup",
      "backup_id": "backup-id",
      "created_at": "2024-03-20T10:00:00Z"
    },
    "latest_backups": [
      {
        "id": "backup1",
        "server_id": "unique-server-id",
        "name": "Files",
        "date": "2024-03-20T10:00:00Z",
        "status": "Success",
        "warnings": 0,
        "errors": 0,
        "messages": 150,
        "fileCount": 249426,
        "fileSize": 113395849938,
        "uploadedSize": 331318892,
        "duration": "00:38:31",
        "duration_seconds": 2311.6018052,
        "durationInMinutes": 38.52669675333333,
        "knownFileSize": 27203688543,
        "backup_list_count": 10,
        "messages_array": "[\"message1\", \"message2\"]",
        "warnings_array": "[\"warning1\"]",
        "errors_array": "[]",
        "available_backups": ["v1", "v2", "v3"]
      },
      {
        "id": "backup2",
        "server_id": "unique-server-id",
        "name": "Databases",
        "date": "2024-03-20T11:00:00Z",
        "status": "Success",
        "warnings": 1,
        "errors": 0,
        "messages": 75,
        "fileCount": 125000,
        "fileSize": 56789012345,
        "uploadedSize": 123456789,
        "duration": "00:25:15",
        "duration_seconds": 1515.1234567,
        "durationInMinutes": 25.25205761166667,
        "knownFileSize": 12345678901,
        "backup_list_count": 5,
        "messages_array": ["message1"],
        "warnings_array": ["warning1"],
        "errors_array": [],
        "available_backups": ["v1", "v2"]
      }
    ],
    "backup_jobs_count": 2,
    "backup_names": ["Files", "Databases"],
    "status": 200
  }
  ```

- **Respuestas de error**:
  - `401`: Clave de API faltante o inválida cuando las claves son requeridas
  - `403`: El ámbito de la clave no es `read`, o la IP del cliente no está en la lista de IPs permitidas externas
  - `404`: Servidor no encontrado
  - `429`: Límite de tasa de la API de lectura excedido
  - `500`: Error interno del servidor
- **Notas**:
  - En la versión 0.7.x, la clave del objeto de respuesta cambió de `machine` a `server`, y el campo `backup_types_count` fue renombrado a `backup_jobs_count`
  - El identificador del servidor puede ser ID o nombre
  - Devuelve la última copia de seguridad para cada trabajo de copia de seguridad (backup_name) que el servidor tiene
  - A diferencia de `/api/lastbackup/:serverId` que devuelve solo la última copia de seguridad más reciente del servidor (independientemente del trabajo de copia de seguridad)
  - Incluye encabezados de control de caché para evitar el almacenamiento en caché

## Subir datos de copia de seguridad - `/api/upload` {#upload-backup-data---apiupload}
- **Endpoint**: `/api/upload`
- **Method**: POST
- **Description**: Sube los datos de la operación de copia de seguridad para un servidor. Admite la detección de ejecuciones duplicadas de copias de seguridad y envía notificaciones.
- **Cuerpo de la solicitud**: JSON enviado por Duplicati con las siguientes opciones:

  ```bash
  --send-http-json-urls=http://my.local.server:9666/api/upload?api_key=YOUR_UPLOAD_KEY
  --send-http-log-level=Information
  --send-http-max-log-lines=500
```

En Duplicati versiones anteriores a 2.0.9.106, use `--send-http-url` con `--send-http-result-output-format=Json`. Consulte [Configuración del Servidor Duplicati](../installation/duplicati-server-configuration.md).

- **Respuesta**:

  ```json
  {
    "success": true
  }
  ```

- **Respuestas de error**:
  - `400`: Campos requeridos faltantes en las secciones Extra o Data, o MainOperation inválido
  - `401`: Clave de API faltante o inválida cuando las claves son requeridas
  - `403`: El ámbito de la clave no es `upload`, o la IP del cliente no está en la lista de IPs permitidas externas
  - `409`: Datos de copia de seguridad duplicados (ignorados)
  - `413`: El cuerpo de la solicitud excede el límite de tamaño de subida configurado (predeterminado 5 MB)
  - `429`: Límite de tasa de subida o fallo de autenticación excedido (`Retry-After` está configurado)
  - `500`: Error del servidor al procesar los datos de copia de seguridad
- **Notas**:
  - Solo procesa operaciones de respaldo (MainOperation debe ser "Backup")
  - Valida los campos requeridos en la sección Extra: machine-id, machine-name, backup-name, backup-id
  - Valida los campos requeridos en la sección Data: ParsedResult, BeginTime, Duration
  - Detecta automáticamente ejecuciones duplicadas de respaldo y devuelve el estado 409
  - Envía notificaciones tras la inserción exitosa del respaldo (si está configurado)
  - Registra los datos de la solicitud en un archivo en el directorio `data` en la raíz del proyecto en modo desarrollo para depuración
  - Usa transacciones para garantizar la consistencia de los datos
