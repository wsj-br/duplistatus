# Operaciones principales {/* #core-operations */}

## Obtener datos del panel (consolidado) - `/api/dashboard` {/* #get-dashboard-data-consolidated---apidashboard */}
- **Endpoint**: `/api/dashboard`
- **Método**: GET
- **Descripción**: Recupera todos los datos del panel en una única respuesta consolidada, incluidos los resúmenes de los servidores, el resumen general y los datos de gráficos.
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

- **Respuestas de error**:
  - `500`: Error del servidor al recuperar los datos del panel
- **Notas**:
  - Este endpoint consolida el endpoint anterior `/api/servers-summary` (que se ha eliminado)
  - El campo `overallSummary` contiene los mismos datos que `/api/summary` (que se mantiene para aplicaciones externas)
  - El campo `chartData` contiene los mismos datos que `/api/chart-data/aggregated` (que todavía existe para acceso directo)
  - Ofrece un mejor rendimiento al reducir múltiples llamadas a la API a una sola solicitud
  - Todos los datos se recuperan en paralelo para un rendimiento óptimo
  - El campo `secondsSinceLastBackup` muestra el tiempo en segundos desde la última copia de seguridad en todos los servidores

## Obtener todos los servidores - `/api/servers` {/* #get-all-servers---apiservers */}
- **Endpoint**: `/api/servers`
- **Método**: GET
- **Descripción**: Recupera una lista de todos los servidores con su información básica. De forma opcional, incluye información de copia de seguridad.
- **Autenticación**: Requiere una sesión y un token CSRF válidos
- **Parámetros de consulta**:
  - `includeBackups` (opcional): Establézcalo en `true` para incluir información de copia de seguridad de cada servidor
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

- **Respuestas de error**:
  - `401`: No autorizado: sesión o token CSRF no válidos
  - `500`: Error del servidor al recuperar los servidores
- **Notas**:
  - Devuelve información del servidor, incluidos los campos de alias y nota
  - Cuándo `includeBackups=true`, devuelve combinaciones de servidor y copia de seguridad con URL y el estado de la contraseña
  - Consolida el endpoint anterior `/api/servers-with-backups` (que se ha eliminado)
  - Se utiliza para la selección, visualización y configuración de servidores
  - Incluye el campo `hasPassword` para indicar si el servidor tiene una contraseña almacenada

## Obtener detalles del servidor - `/api/servers/:id` {/* #get-server-details---apiserversid */}
- **Endpoint**: `/api/servers/:id`
- **Método**: GET
- **Descripción**: Recupera información sobre un servidor específico. Puede devolver información básica del servidor o información detallada, incluidas copias de seguridad y datos de gráficos.
- **Autenticación**: Requiere una sesión y un token CSRF válidos
- **Parámetros**:
  - `id`: el identificador del servidor
- **Parámetros de consulta**:
  - `includeBackups` (opcional): Establézcalo en `true` para incluir datos de copia de seguridad
  - `includeChartData` (opcional): Establézcalo en `true` para incluir datos de gráficos
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

- **Respuestas de error**:
  - `401`: No autorizado: sesión o token CSRF no válidos
  - `404`: Servidor no encontrado
  - `500`: Error del servidor al recuperar los detalles del servidor
- **Notas**:
  - Devuelve información básica del servidor cuando no se proporcionan parámetros de consulta
  - Establecer `includeBackups` o `includeChartData` en `true` devuelve los datos completos del servidor, incluidas las copias de seguridad y chartData
  - Se utiliza para la configuración del servidor y las vistas de detalles

## Actualizar servidor - `/api/servers/:id` {/* #update-server---apiserversid */}
- **Endpoint**: `/api/servers/:id`
- **Método**: PATCH
- **Descripción**: Actualiza los detalles del servidor, incluidos el alias, la nota y la URL del servidor.
- **Autenticación**: Requiere una sesión y un token CSRF válidos
- **Parámetros**:
  - `id`: el identificador del servidor
- **Cuerpo de la solicitud**:

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

- **Respuestas de error**:
  - `401`: No autorizado: sesión o token CSRF no válidos
  - `404`: Servidor no encontrado
  - `500`: Error del servidor durante la actualización
- **Notas**:
  - Actualiza el alias del servidor, la nota y la URL del servidor
  - Todos los campos son opcionales
  - Se permiten cadenas vacías para todos los campos

## Eliminar servidor - `/api/servers/:id` {/* #delete-server---apiserversid */}
- **Punto de conexión**: `/api/servers/:id`
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
  - `401`: No autorizado: sesión o token CSRF no válidos
  - `404`: Servidor no encontrado
  - `500`: Error del servidor durante la eliminación
- **Notas**: 
  - Esta operación es irreversible
  - Todos los datos de las copias de seguridad asociados con el servidor se eliminarán de forma permanente
  - El propio registro del servidor también se eliminará
  - Devuelve el recuento de copias de seguridad y servidores eliminados

## Obtener datos del servidor con información de vencimiento - `/api/detail/:serverId` {/* #get-server-data-with-overdue-info---apidetailserverid */}
- **Punto de conexión**: `/api/detail/:serverId`
- **Método**: GET
- **Descripción**: Recupera información detallada del servidor, incluido el estado de copia de seguridad vencida.
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
  - `500`: Error del servidor al recuperar los detalles del servidor
- **Notas**:
  - Devuelve datos del servidor con información de copia de seguridad vencida
  - Incluye detalles y marcas de tiempo de las copias de seguridad vencidas
  - Se utiliza para la gestión y supervisión de copias de seguridad vencidas

## Obtener servidores duplicados - `/api/servers/duplicates` {/* #get-duplicate-servers---apiserversduplicates */}
- **Punto de conexión**: `/api/servers/duplicates`
- **Método**: GET
- **Descripción**: Recupera una lista de servidores duplicados según el ID de la máquina. Los servidores duplicados son servidores que comparten el mismo ID de máquina pero se almacenan como registros independientes en la base de datos.
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
  - `401`: No autorizado: sesión o token CSRF no válidos
  - `403`: Se requiere acceso de administrador
  - `500`: Error del servidor al recuperar los servidores duplicados
- **Notas**:
  - Solo los administradores pueden acceder a este punto de conexión
  - Devuelve grupos de servidores que comparten el mismo ID de máquina
  - Cada grupo contiene todos los servidores con el mismo ID de máquina
  - Se utiliza para identificar y combinar registros de servidores duplicados
  - Incluye los detalles del servidor y los recuentos de copias de seguridad de cada duplicado

## Combinar servidores - `/api/servers/merge` {/* #merge-servers---apiserversmerge */}
- **Punto de conexión**: `/api/servers/merge`
- **Método**: POST
- **Descripción**: Combina varios servidores en un servidor de destino. Todas las copias de seguridad de los servidores de origen se transfieren al servidor de destino y los servidores de origen se eliminan.
- **Autenticación**: Requiere una sesión válida, token CSRF y acceso de administrador
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
  - `400`: Cuerpo de la solicitud no válido, faltan campos obligatorios o el servidor de destino está en la lista de servidores a fusionar
  - `401`: No autorizado: sesión o token CSRF no válidos
  - `403`: Se requiere acceso de administrador
  - `500`: Error del servidor durante la operación de fusión
- **Notas**:
  - Solo los administradores pueden realizar operaciones de fusión
  - El servidor de destino no debe estar en la lista de servidores a fusionar
  - Todas las copias de seguridad de los servidores de origen se transfieren al servidor de destino
  - Los valores duplicados de `backup_id` para el mismo `backup_name` en el servidor fusionado se normalizan al ID de la fila de copia de seguridad más reciente
  - Los servidores de origen se eliminan tras una fusión correcta
  - Esta operación es irreversible
  - Se utiliza para consolidar registros de servidores duplicados
  - Valida que oldServerIds sea un array no vacío
  - Valida que targetServerId se proporcione y sea una cadena de texto
