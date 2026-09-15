# Operaciones Principales {/* #core-operations */}

## Obtener Datos del Panel (Consolidado) - `/api/dashboard` {/* #get-dashboard-data-consolidated---apidashboard */}
- **Endpoint**: `/api/dashboard`
- **Método**: GET
- **Descripción**: Recupera todos los datos del panel en una sola respuesta consolidada, incluyendo resúmenes de servidores, resumen general y datos de gráficos.
- **Respuesta**:

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

- **Respuestas de Error**:
  - `500`: Error del servidor al obtener datos del panel
- **Notas**:
  - Este endpoint consolida el endpoint anterior `/api/servers-summary` (que ha sido eliminado)
  - El campo `overallSummary` contiene los mismos datos que `/api/summary` (que se mantiene para aplicaciones externas)
  - El campo `chartData` contiene los mismos datos que `/api/chart-data/aggregated` (que sigue existiendo para acceso directo)
  - Proporciona mejor rendimiento al reducir múltiples llamadas a la API a una sola solicitud
  - Todos los datos se obtienen en paralelo para un rendimiento óptimo
  - El campo `secondsSinceLastBackup` muestra el tiempo en segundos desde la última copia de seguridad en todos los servidores

## Obtener Todos los Servidores - `/api/servers` {/* #get-all-servers---apiservers */}
- **Endpoint**: `/api/servers`
- **Método**: GET
- **Descripción**: Recupera una lista de todos los servidores con su información básica. Opcionalmente incluye información de copia de seguridad.
- **Autenticación**: Requiere una sesión válida y un token CSRF
- **Parámetros de Consulta**:
  - `includeBackups` (opcional): Establecer en `true` para incluir información de copia de seguridad para cada servidor
- **Respuesta** (sin parámetros):

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

- **Respuesta** (con `includeBackups=true`):

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

- **Respuestas de Error**:
  - `401`: No autorizado - Sesión o token CSRF inválido
  - `500`: Error del servidor al obtener servidores
- **Notas**:
  - Devuelve información del servidor incluyendo los campos alias y nota
  - Cuando `includeBackups=true`, devuelve combinaciones de servidor-copia de seguridad con URLs y estado de contraseña
  - Consolida el endpoint anterior `/api/servers-with-backups` (que ha sido eliminado)
  - Utilizado para la selección, visualización y configuración de servidores
  - Incluye el campo `hasPassword` para indicar si el servidor tiene una contraseña almacenada

## Obtener Detalles del Servidor - `/api/servers/:id` {/* #get-server-details---apiserversid */}
- **Endpoint**: `/api/servers/:id`
- **Método**: GET
- **Descripción**: Recupera información sobre un servidor específico. Puede devolver información básica del servidor o información detallada incluyendo copias de seguridad y datos de gráficos.
- **Autenticación**: Requiere una sesión válida y un token CSRF
- **Parámetros**:
  - `id`: el identificador del servidor
- **Parámetros de Consulta**:
  - `includeBackups` (opcional): Establecer en `true` para incluir datos de copia de seguridad
  - `includeChartData` (opcional): Establecer en `true` para incluir datos de gráficos
- **Respuesta** (sin parámetros):

  ```json
  {
    "id": "server-id",
    "name": "Server Name",
    "alias": "Server Alias",
    "note": "Additional notes about the server",
    "server_url": "http://localhost:8200"
  }
  ```

- **Respuesta** (con parámetros):

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

- **Respuestas de Error**:
  - `401`: No autorizado - Sesión o token CSRF inválido
  - `404`: Servidor no encontrado
  - `500`: Error del servidor al obtener detalles del servidor
- **Notas**:
  - Devuelve información básica del servidor cuando no se proporcionan parámetros de consulta
  - Establecer `includeBackups` o `includeChartData` en `true` devuelve datos completos del servidor incluyendo copias de seguridad y chartData
  - Utilizado para vistas de configuración y detalles del servidor

## Actualizar Servidor - `/api/servers/:id` {/* #update-server---apiserversid */}
- **Endpoint**: `/api/servers/:id`
- **Método**: PATCH
- **Descripción**: Actualiza los detalles del servidor incluyendo alias, nota y URL del servidor.
- **Autenticación**: Requiere una sesión válida y un token CSRF
- **Parámetros**:
  - `id`: el identificador del servidor
- **Cuerpo de la Solicitud**:

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

- **Respuestas de Error**:
  - `401`: No autorizado - Sesión o token CSRF inválido
  - `404`: Servidor no encontrado
  - `500`: Error del servidor durante la actualización
- **Notas**:
  - Actualiza el alias del servidor, la nota y la URL del servidor
  - Todos los campos son opcionales
  - Las cadenas vacías están permitidas para todos los campos

## Eliminar servidor - `/api/servers/:id` {/* #delete-server---apiserversid */}
- **Punto final**: `/api/servers/:id`
- **Método**: DELETE
- **Descripción**: Elimina un servidor y todas sus copias de seguridad asociadas.
- **Autenticación**: Requiere una sesión válida y un token CSRF
- **Parámetros**:
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

- **Respuestas de error**:
  - `401`: No autorizado - Sesión o token CSRF no válido
  - `404`: Servidor no encontrado
  - `500`: Error del servidor durante la eliminación
- **Notas**: 
  - Esta operación es irreversible
  - Todos los datos de copia de seguridad asociados con el servidor se eliminarán permanentemente
  - El registro del servidor también se eliminará
  - Devuelve el recuento de copias de seguridad y servidores eliminados

## Obtener datos del servidor con información de copia de seguridad vencida - `/api/detail/:serverId` {/* #get-server-data-with-overdue-info---apidetailserverid */}
- **Punto final**: `/api/detail/:serverId`
- **Método**: GET
- **Descripción**: Recupera información detallada del servidor, incluyendo el estado de la copia de seguridad vencida.
- **Parámetros**:
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

- **Respuestas de error**:
  - `404`: Servidor no encontrado
  - `500`: Error del servidor al obtener los detalles del servidor
- **Notas**:
  - Devuelve los datos del servidor con información de copia de seguridad vencida
  - Incluye detalles de copia de seguridad vencida y marcas de tiempo
  - Se utiliza para la gestión y supervisión de copias de seguridad vencidas

## Obtener servidores duplicados - `/api/servers/duplicates` {/* #get-duplicate-servers---apiserversduplicates */}
- **Punto final**: `/api/servers/duplicates`
- **Método**: GET
- **Descripción**: Recupera una lista de servidores duplicados basados en el ID de la máquina. Los servidores duplicados son servidores que comparten el mismo ID de máquina pero se almacenan como registros separados en la base de datos.
- **Autenticación**: Requiere una sesión válida, un token CSRF y acceso de administrador
- **Respuesta**:

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

- **Respuestas de error**:
  - `401`: No autorizado - Sesión o token CSRF no válido
  - `403`: Se requiere acceso de administrador
  - `500`: Error del servidor al obtener servidores duplicados
- **Notas**:
  - Solo los administradores pueden acceder a este punto final
  - Devuelve grupos de servidores que comparten el mismo ID de máquina
  - Cada grupo contiene todos los servidores con el mismo ID de máquina
  - Se utiliza para identificar y fusionar registros de servidores duplicados
  - Incluye detalles del servidor y recuentos de copias de seguridad para cada duplicado

## Combinar servidores - `/api/servers/merge` {/* #merge-servers---apiserversmerge */}
- **Punto final**: `/api/servers/merge`
- **Método**: POST
- **Descripción**: Combina múltiples servidores en un servidor de destino. Todas las copias de seguridad de los servidores de origen se transfieren al servidor de destino, y los servidores de origen se eliminan.
- **Autenticación**: Requiere una sesión válida, un token CSRF y acceso de administrador
- **Cuerpo de la solicitud**:

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
    "message": "Successfully merged 2 server(s) into target server",
    "backupIdsNormalized": 1
  }
  ```

- **Respuestas de error**:
  - `400`: Cuerpo de solicitud no válido, campos obligatorios faltantes o el servidor de destino está en la lista de servidores para combinar
  - `401`: No autorizado - Sesión o token CSRF no válido
  - `403`: Se requiere acceso de administrador
  - `500`: Error del servidor durante la operación de combinación
- **Notas**:
  - Solo los administradores pueden realizar operaciones de combinación
  - El servidor de destino no debe estar en la lista de servidores para combinar
  - Todas las copias de seguridad de los servidores de origen se transfieren al servidor de destino
  - Los valores duplicados de `backup_id` para el mismo `backup_name` en el servidor combinado se normalizan al ID de la fila de copia de seguridad más reciente
  - Los servidores de origen se eliminan después de una combinación exitosa
  - Esta operación es irreversible
  - Se utiliza para consolidar registros de servidores duplicados
  - Valida que oldServerIds sea una matriz no vacía
  - Valida que targetServerId se proporcione y sea una cadena
