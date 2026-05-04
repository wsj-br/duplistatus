---
translation_last_updated: '2026-04-18T00:00:06.293Z'
source_file_mtime: '2026-03-05T22:33:28.419Z'
source_file_hash: d1370e091997b367954229cb55bb2ceeb6fa286bbe8c84b48a906d0d5678dee2
translation_language: es
source_file_path: documentation/docs/api-reference/core-operations.md
translation_models:
  - qwen/qwen3-235b-a22b-2507
---
# Operaciones principales {#core-operations}

## Obtener datos del panel (consolidado) - `/api/dashboard` {#get-dashboard-data-consolidated-apidashboard}
- **Endpoint**: `/api/dashboard`
- **Method**: GET
- **Description**: Recupera todos los datos del panel en una única respuesta consolidada, incluyendo resúmenes de servidores, resumen general y datos del gráfico.
- **Response**:

  ```json
  {
    "serversSummary": [
      {
        "id": "server-id",
        "name": "Server Name",
        "lastBackupDate": "2024-03-20T10:00:00Z",
        "lastBackupStatus": "Success",
        "lastBackupDuration": "00:38:31",
        "lastBackupListCount": 10,
        "lastBackupName": "Backup Name",
        "lastBackupId": "backup-id",
        "backupCount": 15,
        "totalWarnings": 5,
        "totalErrors": 0,
        "availableBackups": ["v1", "v2", "v3"],
        "isBackupOverdue": false,
        "notificationEvent": "all",
        "expectedBackupDate": "2024-03-21T10:00:00Z",
        "expectedBackupElapsed": "2 hours ago",
        "lastOverdueCheck": "2024-03-20T12:00:00Z",
        "lastNotificationSent": "N/A"
      }
    ],
    "overallSummary": {
      "totalServers": 3,
      "totalBackups": 9,
      "totalUploadedSize": 2397229507,
      "totalStorageUsed": 43346796938,
      "totalBackupSize": 126089687807,
      "overdueBackupsCount": 2,
      "secondsSinceLastBackup": 7200
    },
    "chartData": [
      {
        "date": "20/03/2024",
        "isoDate": "2024-03-20T10:00:00Z",
        "uploadedSize": 1024000,
        "duration": 45,
        "fileCount": 1500,
        "fileSize": 2048000,
        "storageSize": 3072000,
        "backupVersions": 5
      }
    ]
  }
  ```

- **Error Responses**:
  - `500`: Error del servidor al obtener los datos del panel
- **Notes**:
  - Este endpoint consolida el endpoint anterior `/api/servers-summary` (que ha sido eliminado)
  - El campo `overallSummary` contiene los mismos datos que `/api/summary` (que se mantiene para aplicaciones externas)
  - El campo `chartData` contiene los mismos datos que `/api/chart-data/aggregated` (que aún existe para acceso directo)
  - Proporciona un mejor rendimiento al reducir múltiples llamadas API a una única solicitud
  - Todos los datos se recuperan en paralelo para un rendimiento óptimo
  - El campo `secondsSinceLastBackup` muestra el tiempo en segundos desde la última copia de seguridad en todos los servidores

## Obtener todos los servidores - `/api/servers` {#get-all-servers-apiservers}
- **Endpoint**: `/api/servers`
- **Method**: GET
- **Description**: Recupera una lista de todos los servidores con su información básica. Opcionalmente incluye información de copia de seguridad.
- **Authentication**: Requiere sesión válida y token CSRF
- **Query Parameters**:
  - `includeBackups` (opcional): Establecer a `true` para incluir información de copia de seguridad para cada servidor
- **Response** (sin parámetros):

  ```json
  [
    {
      "id": "server-id",
      "name": "Server Name",
      "alias": "Server Alias",
      "note": "Additional notes about the server"
    }
  ]
  ```

- **Response** (con `includeBackups=true`):

  ```json
  [
    {
      "id": "server-id",
      "name": "Server Name",
      "backupName": "Backup Name",
      "server_url": "http://localhost:8200",
      "alias": "Server Alias",
      "note": "Additional notes about the server",
      "hasPassword": true
    }
  ]
  ```

- **Error Responses**:
  - `401`: No autorizado - Sesión o token CSRF inválido
  - `500`: Error del servidor al obtener servidores
- **Notes**:
  - Devuelve información del servidor incluyendo campos de alias y nota
  - Cuando `includeBackups=true`, devuelve combinaciones de servidor-copia de seguridad con URLs y estado de contraseña
  - Consolida el endpoint anterior `/api/servers-with-backups` (que ha sido eliminado)
  - Se utiliza para selección, visualización y configuración de servidores
  - Incluye el campo `hasPassword` para indicar si el servidor tiene contraseña almacenada

## Obtener detalles del servidor - `/api/servers/:id` {#get-server-details-apiserversid}
- **Endpoint**: `/api/servers/:id`
- **Method**: GET
- **Description**: Recupera información sobre un servidor específico. Puede devolver información básica del servidor o información detallada que incluye copias de seguridad y datos del gráfico.
- **Authentication**: Requiere sesión válida y token CSRF
- **Parameters**:
  - `id`: el identificador del servidor
- **Query Parameters**:
  - `includeBackups` (opcional): Establecer a `true` para incluir datos de copia de seguridad
  - `includeChartData` (opcional): Establecer a `true` para incluir datos del gráfico
- **Response** (sin parámetros):

  ```json
  {
    "id": "server-id",
    "name": "Server Name",
    "alias": "Server Alias",
    "note": "Additional notes about the server",
    "server_url": "http://localhost:8200"
  }
  ```

- **Response** (con parámetros):

  ```json
  {
    "id": "server-id",
    "name": "Server Name",
    "alias": "Server Alias",
    "note": "Additional notes about the server",
    "server_url": "http://localhost:8200",
    "backups": [
      { ... }
    ],
    "chartData": [
      { ... }
    ]
  }
  ```

- **Error Responses**:
  - `401`: No autorizado - Sesión o token CSRF inválido
  - `404`: Servidor no encontrado
  - `500`: Error del servidor al obtener detalles del servidor
- **Notes**:
  - Devuelve información básica del servidor cuando no se proporcionan parámetros de consulta
  - Establecer cualquiera de `includeBackups` o `includeChartData` a `true` devuelve todos los datos del servidor, incluyendo copias de seguridad y chartData
  - Se utiliza para configuración del servidor y vistas de detalle

## Actualizar servidor - `/api/servers/:id` {#update-server-apiserversid}
- **Endpoint**: `/api/servers/:id`
- **Method**: PATCH
- **Description**: Actualiza los detalles del servidor, incluyendo alias, nota y URL del servidor.
- **Authentication**: Requiere sesión válida y token CSRF
- **Parameters**:
  - `id`: el identificador del servidor
- **Request Body**:

  ```json
  {
    "server_url": "http://localhost:8200",
    "alias": "Server Alias",
    "note": "Additional notes about the server"
  }
  ```

- **Respuesta**:

  ```json
  {
    "message": "Server updated successfully",
    "serverId": "server-id",
    "server_url": "http://localhost:8200",
    "alias": "Server Alias",
    "note": "Additional notes about the server"
  }
  ```

- **Error Responses**:
  - `401`: No autorizado - Sesión o token CSRF inválido
  - `404`: Servidor no encontrado
  - `500`: Error del servidor durante la actualización
- **Notes**:
  - Actualiza el alias, nota y URL del servidor
  - Todos los campos son opcionales
  - Se permiten cadenas vacías para todos los campos

## Eliminar servidor - `/api/servers/:id` {#delete-server-apiserversid}
- **Endpoint**: `/api/servers/:id`
- **Method**: DELETE
- **Description**: Elimina un servidor y todas sus copias de seguridad asociadas.
- **Authentication**: Requiere sesión válida y token CSRF
- **Parameters**:
  - `id`: el identificador del servidor

- **Respuesta**:

  ```json
  {
    "message": "Successfully deleted server and 15 backups",
    "status": 200,
    "changes": {
      "backupChanges": 15,
      "serverChanges": 1
    }
  }
  ```

- **Error Responses**:
  - `401`: No autorizado - Sesión o token CSRF inválido
  - `404`: Servidor no encontrado
  - `500`: Error del servidor durante la eliminación
- **Notes**: 
  - Esta operación es irreversible
  - Todos los datos de copia de seguridad asociados al servidor se eliminarán permanentemente
  - El registro del servidor también será eliminado
  - Devuelve el número de copias de seguridad y servidores eliminados

## Obtener datos del servidor con información retrasada - `/api/detail/:serverId` {#get-server-data-with-overdue-info-apidetailserverid}
- **Endpoint**: `/api/detail/:serverId`
- **Method**: GET
- **Description**: Recupera información detallada del servidor, incluido el estado de copia de seguridad retrasada.
- **Parameters**:
  - `serverId`: el identificador del servidor

- **Respuesta**:

  ```json
  {
    "server": {
      "id": "server-id",
      "name": "Server Name",
      "backups": [...]
    },
    "overdueBackups": [
      {
        "serverName": "Server Name",
        "backupName": "Backup Name",
        "lastBackupDate": "2024-03-20T10:00:00Z",
        "lastNotificationSent": "2024-03-20T12:00:00Z",
        "notificationEvent": "all",
        "expectedBackupDate": "2024-03-21T10:00:00Z",
        "expectedBackupElapsed": "2 hours ago"
      }
    ],
    "lastOverdueCheck": "2024-03-20T12:00:00Z"
  }
  ```

- **Error Responses**:
  - `404`: Servidor no encontrado
  - `500`: Error del servidor al obtener los detalles del servidor
- **Notes**:
  - Devuelve datos del servidor con información de copia de seguridad retrasada
  - Incluye detalles y marcas de tiempo de copias de seguridad retrasadas
  - Se utiliza para la gestión y supervisión de copias de seguridad retrasadas

## Obtener servidores duplicados - `/api/servers/duplicates` {#get-duplicate-servers-apiserversduplicates}
- **Endpoint**: `/api/servers/duplicates`
- **Method**: GET
- **Description**: Recupera una lista de servidores duplicados según el ID de máquina. Los servidores duplicados son aquellos que comparten el mismo ID de máquina pero se almacenan como registros separados en la base de datos.
- **Authentication**: Requiere sesión válida, token CSRF y acceso de administrador
- **Response**:

  ```json
  [
    {
      "machineId": "machine-id-123",
      "servers": [
        {
          "id": "server-id-1",
          "name": "Server Name 1",
          "alias": "Server Alias 1",
          "server_url": "http://localhost:8200",
          "backupCount": 5
        },
        {
          "id": "server-id-2",
          "name": "Server Name 2",
          "alias": "Server Alias 2",
          "server_url": "http://localhost:8200",
          "backupCount": 3
        }
      ]
    }
  ]
  ```

- **Error Responses**:
  - `401`: No autorizado - Sesión o token CSRF inválido
  - `403`: Se requiere acceso de administrador
  - `500`: Error del servidor al obtener servidores duplicados
- **Notes**:
  - Solo los administradores pueden acceder a este endpoint
  - Devuelve grupos de servidores que comparten el mismo ID de máquina
  - Cada grupo contiene todos los servidores con el mismo ID de máquina
  - Se utiliza para identificar y fusionar registros duplicados de servidores
  - Incluye detalles del servidor y conteo de copias de seguridad para cada duplicado

## Fusionar servidores - `/api/servers/merge` {#merge-servers-apiserversmerge}
- **Endpoint**: `/api/servers/merge`
- **Method**: POST
- **Description**: Fusiona múltiples servidores en un servidor destino. Todas las copias de seguridad de los servidores de origen se transfieren al servidor destino, y los servidores de origen se eliminan.
- **Authentication**: Requiere sesión válida, token CSRF y acceso de administrador
- **Request Body**:

  ```json
  {
    "oldServerIds": ["server-id-1", "server-id-2"],
    "targetServerId": "server-id-3"
  }
  ```

- **Respuesta**:

  ```json
  {
    "success": true,
    "message": "Successfully merged 2 server(s) into target server"
  }
  ```

- **Error Responses**:
  - `400`: Cuerpo de solicitud inválido, campos obligatorios faltantes, o el servidor destino está en la lista de servidores a fusionar
  - `401`: No autorizado - Sesión o token CSRF inválido
  - `403`: Se requiere acceso de administrador
  - `500`: Error del servidor durante la operación de fusión
- **Notes**:
  - Solo los administradores pueden realizar operaciones de fusión
  - El servidor destino no debe estar en la lista de servidores a fusionar
  - Todas las copias de seguridad de los servidores de origen se transfieren al servidor destino
  - Los servidores de origen se eliminan tras una fusión exitosa
  - Esta operación es irreversible
  - Se utiliza para consolidar registros duplicados de servidores
  - Valida que oldServerIds sea un array no vacío
  - Valida que targetServerId esté proporcionado y sea una cadena
