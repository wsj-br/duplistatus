---
translation_last_updated: '2026-04-18T00:00:32.736Z'
source_file_mtime: '2026-03-05T22:33:28.419Z'
source_file_hash: 70fe731fa22f714de94b93df446dee4ca4dc1f5683c22bc93eb52b2e03dd77d4
translation_language: es
source_file_path: documentation/docs/api-reference/external-apis.md
translation_models:
  - qwen/qwen3-235b-a22b-2507
---
# APIs externas {#external-apis}

Estos endpoints están diseñados para ser utilizados por otras aplicaciones e integraciones, por ejemplo [Homepage](../user-guide/homepage-integration.md).

## Obtener resumen general - `/api/summary` {#get-overall-summary-apisummary}
- **Endpoint**: `/api/summary`
- **Método**: GET
- **Descripción**: Recupera un resumen de todas las operaciones de copia de seguridad en todos los servidores.
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
  - `500`: Error del servidor al obtener los datos del resumen
- **Notas**:
  - En la versión 0.5.x, el campo `totalBackupedSize` fue reemplazado por `totalBackupSize`
  - En la versión 0.7.x, el campo `totalMachines` fue reemplazado por `totalServers`
  - El campo `overdueBackupsCount` muestra el número de copias de seguridad atrasadas actualmente
  - El campo `secondsSinceLastBackup` muestra el tiempo en segundos desde la última copia de seguridad en todos los servidores
  - Devuelve una respuesta de respaldo con ceros si falla la obtención de datos
  - **Nota**: Para uso interno del panel, considere usar `/api/dashboard`, que incluye estos datos más información adicional

## Obtener última copia de seguridad - `/api/lastbackup/:serverId` {#get-latest-backup-apilastbackupserverid}
- **Endpoint**: `/api/lastbackup/:serverId`
- **Método**: GET
- **Descripción**: Recupera la información de la última copia de seguridad para un servidor específico.
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
  - `404`: Servidor no encontrado
  - `500`: Error interno del servidor
- **Notas**:
  - En la versión 0.7.x, la clave del objeto de respuesta cambió de `machine` a `server`
  - El identificador del servidor puede ser el ID o el nombre
  - Devuelve null para latest_backup si no existen copias de seguridad
  - Incluye cabeceras de control de caché para evitar el almacenamiento en caché

## Obtener últimas copias de seguridad - `/api/lastbackups/:serverId` {#get-latest-backups-apilastbackupsserverid}
- **Endpoint**: `/api/lastbackups/:serverId`
- **Método**: GET
- **Descripción**: Recupera la información de la última copia de seguridad para todas las copias de seguridad configuradas (por ejemplo, 'Archivos', 'Bases de datos') en un servidor específico.
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
  - `404`: Servidor no encontrado
  - `500`: Error interno del servidor
- **Notas**:
  - En la versión 0.7.x, la clave del objeto de respuesta cambió de `machine` a `server`, y el campo `backup_types_count` fue renombrado a `backup_jobs_count`
  - El identificador del servidor puede ser el ID o el nombre
  - Devuelve la última copia de seguridad para cada trabajo de copia de seguridad (backup_name) que tenga el servidor
  - A diferencia de `/api/lastbackup/:serverId`, que devuelve solo la copia de seguridad más reciente del servidor (independientemente del trabajo de copia)
  - Incluye cabeceras de control de caché para evitar el almacenamiento en caché

## Subir datos de copia de seguridad - `/api/upload` {#upload-backup-data-apiupload}
- **Endpoint**: `/api/upload`
- **Método**: POST
- **Descripción**: Sube datos de operación de copia de seguridad para un servidor. Admite la detección de ejecuciones duplicadas de copias de seguridad y envía notificaciones.
- **Cuerpo de la solicitud**: JSON enviado por Duplicati con las siguientes opciones:

  ```bash
  --send-http-url=http://my.local.server:9666/api/upload
  --send-http-result-output-format=Json
  --send-http-log-level=Information
  ```

- **Respuesta**:

  ```json
  {
    "success": true
  }
  ```

- **Respuestas de error**:
  - `400`: Faltan campos requeridos en las secciones Extra o Data, o MainOperation no válida
  - `409`: Datos duplicados de copia de seguridad (ignorados)
  - `500`: Error del servidor al procesar los datos de copia de seguridad
- **Notas**:
  - Solo procesa operaciones de copia de seguridad (MainOperation debe ser "Backup")
  - Valida los campos requeridos en la sección Extra: machine-id, machine-name, backup-name, backup-id
  - Valida los campos requeridos en la sección Data: ParsedResult, BeginTime, Duration
  - Detecta automáticamente ejecuciones duplicadas de copias de seguridad y devuelve el estado 409
  - Envía notificaciones tras la inserción exitosa de la copia de seguridad (si está configurado)
  - Registra los datos de la solicitud en un archivo en el directorio `data` en la raíz del proyecto en modo desarrollo para depuración
  - Usa transacción para garantizar la consistencia de los datos
