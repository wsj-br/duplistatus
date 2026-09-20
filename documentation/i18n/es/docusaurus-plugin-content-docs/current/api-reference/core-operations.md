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

- **Respuestas de Error**:
  - `500`: Error del servidor al obtener los datos del panel
- **Notas**:
  - Este punto final consolida el anterior `/api/servers-summary` (que ha sido eliminado)
  - El campo `overallSummary` contiene los mismos datos que `/api/summary` (que se mantiene para aplicaciones externas)
  - El campo `chartData` contiene los mismos datos que `/api/chart-data/aggregated` (que aún existe para acceso directo)
  - Proporciona un mejor rendimiento al reducir múltiples llamadas a la API en una sola solicitud
  - Todos los datos se obtienen en paralelo para un rendimiento óptimo
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

- **Respuestas de Error**:
  - `401`: No autorizado - Sesión o token CSRF inválido
  - `500`: Error del servidor al obtener servidores
- **Notas**:
  - Devuelve información del servidor incluyendo campos de alias y nota
  - Cuando `includeBackups=true`, devuelve combinaciones de servidor-copia de seguridad con URLs y estado de contraseña
  - Consolida el anterior `/api/servers-with-backups` (que ha sido eliminado)
  - Se utiliza para selección, visualización y propósitos de configuración de servidores
  - Incluye el campo `hasPassword` para indicar si el servidor tiene contraseña almacenada

## Obtener detalles del servidor - `/api/servers/:id` {/* #get-server-details---apiserversid */}
- **Endpoint**: `/api/servers/:id`
- **Método**: GET
- **Descripción**: Recupera información sobre un servidor específico. Puede devolver información básica del servidor o información detallada, incluidas copias de seguridad y datos de gráficos.
- **Autenticación**: Requiere sesión válida y token CSRF
- **Parámetros**:
  - `id`: el identificador del servidor
- **Parámetros de Consulta**:
  - `includeBackups` (opcional): Establecer a `true` para incluir datos de copia de seguridad
  - `includeChartData` (opcional): Establecer a `true` para incluir datos de gráfico
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
  - Al establecer `includeBackups` o `includeChartData` a `true` devuelve datos completos del servidor incluyendo copias de seguridad y chartData
  - Se utiliza para configuración de servidores y vistas detalladas

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

- **Respuestas de Error**:
  - `401`: No autorizado - Sesión o token CSRF inválido
  - `404`: Servidor no encontrado
  - `500`: Error del servidor durante la actualización
- **Notas**:
  - Actualiza el alias del servidor, nota y URL del servidor
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

- **Respuestas de Error**:
  - `401`: No autorizado - Sesión o token CSRF inválido
  - `404`: Servidor no encontrado
  - `500`: Error del servidor durante la eliminación
- **Notas**: 
  - Esta operación es irreversible
  - Todos los datos de copia de seguridad asociados con el servidor serán eliminados permanentemente
  - El registro del servidor en sí también será eliminado
  - Devuelve la cantidad de copias de seguridad y servidores eliminados

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

- **Respuestas de Error**:
  - `404`: Servidor no encontrado
  - `500`: Error del servidor al obtener detalles del servidor
- **Notas**:
  - Devuelve datos del servidor con información de copia de seguridad vencida
  - Incluye detalles y marcas de tiempo de copia de seguridad vencida
  - Se utiliza para gestión y monitoreo de copias de seguridad vencidas

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

- **Respuestas de Error**:
  - `401`: No autorizado - Sesión o token CSRF inválido
  - `403`: Se requiere acceso de administrador
  - `500`: Error del servidor al obtener servidores duplicados
- **Notas**:
  - Solo los administradores pueden acceder a este punto final
  - Devuelve grupos de servidores que comparten el mismo ID de máquina
  - Cada grupo contiene todos los servidores con el mismo ID de máquina
  - Se utiliza para identificar y fusionar registros de servidores duplicados
  - Incluye detalles del servidor y conteos de copias de seguridad para cada duplicado

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

- **Respuestas de Error**:
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
  - Se utiliza para consolidar registros duplicados de servidores
  - Valida que oldServerIds sea un array no vacío
  - Valida que targetServerId esté proporcionado y sea una cadena
