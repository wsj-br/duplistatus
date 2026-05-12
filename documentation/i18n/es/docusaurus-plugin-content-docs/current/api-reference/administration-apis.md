# Administración {#administration}

## Recopilar Copias de Seguridad - `/api/backups/collect` {#collect-backups---apibackupscollect}
- **Endpoint**: `/api/backups/collect`
- **Method**: POST
- **Description**: Recopila datos de copia de seguridad directamente desde un servidor Duplicati a través de su API. Este endpoint detecta automáticamente el mejor protocolo de conexión (HTTPS con validación SSL, HTTPS con certificados autofirmados o HTTP como alternativa) y se conecta al servidor Duplicati para recuperar la información de copia de seguridad y procesarla en la base de datos local.
- **Autenticación**: Requiere sesión válida y token CSRF
- **Cuerpo de la solicitud**:

  ```json
  {
    "hostname": "duplicati-server.local",
    "port": 8200,
    "password": "your-password",
    "downloadJson": false
  }
  ```

- **Respuesta**:

  ```json
  {
    "success": true,
    "serverName": "Server Name",
    "serverAlias": "My Server",
    "stats": {
      "processed": 5,
      "skipped": 2,
      "errors": 0
    },
    "backupSettings": {
      "added": 2,
      "total": 7
    }
  }
  ```

- **Respuestas de error**:
  - `400`: Parámetros de solicitud inválidos o conexión fallida
  - `500`: Error del servidor durante la recopilación de copias de seguridad
- **Notas**: 
  - El endpoint detecta automáticamente el protocolo de conexión óptimo (HTTPS → HTTPS con certificados autofirmados → HTTP)
  - Los intentos de detección del protocolo se realizan según orden de preferencia de seguridad
  - Los tiempos de espera de conexión son configurables mediante variables de entorno
  - Registra los datos recopilados en modo desarrollo para depuración
  - Asegura que la configuración de copias de seguridad esté completa para todos los servidores y copias de seguridad
  - Usa el puerto predeterminado 8200 si no se especifica
  - El protocolo detectado y la URL del servidor se almacenan automáticamente en la base de datos
  - `serverAlias` se recupera de la base de datos y puede estar vacío si no se ha establecido un alias
  - La interfaz debe usar `serverAlias || serverName` con fines de visualización
  - Admite tanto la descarga en formato JSON como la recopilación directa mediante API

## Limpiar Copias de Seguridad - `/api/backups/cleanup` {#cleanup-backups---apibackupscleanup}
- **Endpoint**: `/api/backups/cleanup`
- **Method**: POST
- **Description**: Elimina datos antiguos de copias de seguridad según el período de retención. Este endpoint ayuda a gestionar el tamaño de la base de datos eliminando registros de copias de seguridad obsoletos, manteniendo los datos recientes e importantes.
- **Autenticación**: Requiere sesión válida y token CSRF
- **Cuerpo de la solicitud**:

  ```json
  {
    "retentionPeriod": "6 months"
  }
  ```

- **Períodos de retención**: `"6 months"`, `"1 year"`, `"2 years"`, `"Delete all data"`
- **Respuesta**:

  ```json
  {
    "message": "Successfully deleted 15 old backups",
    "status": 200
  }
  ```

Para la opción "Eliminar todos los datos":

  ```json
  {
    "message": "Successfully deleted all 15 backups and 3 servers, and cleared configuration settings",
    "status": 200
  }
  ```

- **Respuestas de error**:
  - `401`: No autorizado - Sesión o token CSRF inválido
  - `400`: Período de retención inválido especificado
  - `500`: Error del servidor durante la operación de limpieza con información detallada del error
- **Notas**: 
  - La operación de limpieza es irreversible
  - Los datos de copia de seguridad se eliminan permanentemente de la base de datos
  - Los registros de máquinas se conservan incluso si se eliminan todas las copias de seguridad
  - Cuando se selecciona "Eliminar todos los datos", se eliminan todas las máquinas y copias de seguridad y se borra la configuración
  - El informe de errores mejorado incluye detalles y traza de pila en modo desarrollo
  - Admite retención basada en tiempo y eliminación completa de datos

## Eliminar trabajo de copia de seguridad - `/api/backups/delete-job` {#delete-backup-job---apibackupsdelete-job}
- **Endpoint**: `/api/backups/delete-job`
- **Method**: DELETE
- **Description**: Elimina todos los registros de copia de seguridad para una combinación específica de servidor y copia de seguridad. Este endpoint solo está disponible en modo desarrollo.
- **Autenticación**: Requiere sesión válida y token CSRF
- **Cuerpo de la solicitud**:

  ```json
  {
    "serverId": "server-id",
    "backupName": "Backup Name"
  }
  ```

- **Respuesta**:

  ```json
  {
    "message": "Successfully deleted 5 backup record(s) for \"Files\" from server \"My Server\"",
    "status": 200,
    "deletedCount": 5,
    "serverName": "My Server",
    "backupName": "Files"
  }
  ```

- **Respuestas de error**:
  - `401`: No autorizado - Sesión o token CSRF inválido
  - `403`: La eliminación de trabajos de copia de seguridad solo está disponible en modo desarrollo
  - `400`: Se requieren ID del servidor y nombre de la copia de seguridad
  - `404`: No se encontraron copias de seguridad para eliminar
  - `500`: Error del servidor durante la eliminación con información detallada del error
- **Notas**: 
  - Esta operación solo está disponible en modo desarrollo
  - Esta operación es irreversible
  - Todos los registros de copia de seguridad para la combinación servidor-copia de seguridad especificada se eliminarán permanentemente
  - Devuelve la cantidad de copias de seguridad eliminadas y la información del servidor
  - Usa el alias del servidor para mostrarlo si está disponible, de lo contrario utiliza el nombre del servidor

## Sincronizar horarios de copia de seguridad - `/api/backups/sync-schedule` {#sync-backup-schedules---apibackupssync-schedule}
- **Endpoint**: `/api/backups/sync-schedule`
- **Method**: POST
- **Description**: Sincroniza la información de programación de copias de seguridad desde un servidor Duplicati. Este endpoint se conecta al servidor, recupera la información de programación para todas las copias de seguridad y actualiza la configuración local de copias de seguridad con detalles de programación, incluyendo intervalos de repetición, días de la semana permitidos y horarios de programación.
- **Autenticación**: Requiere sesión válida y token CSRF
- **Cuerpo de la solicitud**:

  ```json
  {
    "hostname": "duplicati-server.local",
    "port": 8200,
    "password": "your-password",
    "serverId": "optional-server-id"
  }
  ```

O solo con serverId (usa la contraseña almacenada):

  ```json
  {
    "serverId": "server-id"
  }
  ```

O con serverId y credenciales actualizadas:

  ```json
  {
    "serverId": "server-id",
    "hostname": "new-hostname.local",
    "port": 8200,
    "password": "new-password"
  }
  ```

- **Respuesta**:

  ```json
  {
    "success": true,
    "serverName": "Server Name",
    "stats": {
      "processed": 5,
      "errors": 0
    }
  }
  ```

Con errores:

  ```json
  {
    "success": true,
    "serverName": "Server Name",
    "stats": {
      "processed": 3,
      "errors": 2
    },
    "errors": [
      "Backup Name 1: Error message",
      "Backup Name 2: Error message"
    ]
  }
  ```

- **Respuestas de error**:
  - `400`: Parámetros de solicitud no válidos, falta el nombre de host o la contraseña cuando no se proporciona serverId, o conexión fallida
  - `404`: Servidor no encontrado (cuando se proporciona serverId) o no hay contraseña almacenada para el servidor
  - `500`: Error del servidor durante la sincronización del horario
- **Notas**:
  - El punto de conexión detecta automáticamente el protocolo de conexión óptimo (HTTPS → HTTPS con certificado autofirmado → HTTP)
  - Puede llamarse solo con serverId para usar las credenciales del servidor almacenadas
  - Puede llamarse con serverId y nuevas credenciales para actualizar los detalles de conexión del servidor
  - Puede llamarse con hostname/puerto/contraseña sin serverId para servidores nuevos
  - Actualiza la configuración de copias de seguridad con la información del horario, incluyendo:
    - `expectedInterval`: El intervalo de repetición (por ejemplo, "Diariamente", "Semanalmente", "Mensualmente")
    - `allowedWeekDays`: Array de días de la semana permitidos (0=Domingo, 1=Lunes, etc.)
    - `time`: La hora programada para la copia de seguridad
  - Procesa todas las copias de seguridad encontradas en el servidor
  - Devuelve estadísticas sobre las copias de seguridad procesadas y cualquier error encontrado
  - Registra eventos de auditoría para operaciones de sincronización exitosas y fallidas
  - Usa el puerto por defecto 8200 si no se especifica

## Probar conexión al servidor - `/api/servers/test-connection` {#test-server-connection---apiserverstest-connection}
- **Endpoint**: `/api/servers/test-connection`
- **Method**: POST
- **Description**: Prueba la conexión a un servidor Duplicati para verificar que sea accesible.
- **Cuerpo de la solicitud**:

  ```json
  {
    "server_url": "http://localhost:8200"
  }
  ```

- **Respuesta**:

  ```json
  {
    "success": true,
    "message": "Connection successful"
  }
  ```

- **Respuestas de error**:
  - `400`: Formato de URL no válido o falta la URL del servidor
  - `500`: Error del servidor durante la prueba de conexión
- **Notas**:
  - El punto de conexión valida el formato de la URL y prueba la conectividad
  - Devuelve éxito si el servidor responde con un estado 401 (esperado para el punto de acceso de inicio de sesión sin credenciales)
  - Prueba la conexión al punto de acceso de inicio de sesión del servidor Duplicati
  - Admite los protocolos HTTP y HTTPS
  - Usa la configuración de tiempo de espera para la prueba de conexión

## Obtener URL del servidor - `/api/servers/:serverId/server-url` {#get-server-url---apiserversserveridserver-url}
- **Endpoint**: `/api/servers/:serverId/server-url`
- **Method**: GET
- **Description**: Recupera la URL del servidor para un servidor específico.
- **Parámetros**:
  - `serverId`: el identificador del servidor

- **Respuesta**:

  ```json
  {
    "serverId": "server-id",
    "server_url": "http://localhost:8200"
  }
  ```

- **Respuestas de error**:
  - `404`: Servidor no encontrado
  - `500`: Error del servidor
- **Notas**:
  - Devuelve la URL del servidor para el servidor específico
  - Se utiliza para la gestión de la conexión del servidor
  - Devuelve una cadena vacía si no se ha establecido ninguna URL del servidor

## Actualizar URL del servidor - `/api/servers/:serverId/server-url` {#update-server-url---apiserversserveridserver-url}
- **Endpoint**: `/api/servers/:serverId/server-url`
- **Method**: PATCH
- **Description**: Actualiza la URL del servidor para un servidor específico.
- **Autenticación**: Requiere sesión válida y token CSRF
- **Parámetros**:
  - `serverId`: el identificador del servidor
- **Cuerpo de la solicitud**:

  ```json
  {
    "server_url": "http://localhost:8200"
  }
  ```

- **Respuesta**:

  ```json
  {
    "message": "Server URL updated successfully",
    "serverId": "server-id",
    "serverName": "Server Name",
    "server_url": "http://localhost:8200"
  }
  ```

- **Respuestas de error**:
  - `401`: No autorizado - Sesión o token CSRF no válido
  - `400`: Formato de URL no válido
  - `404`: Servidor no encontrado
  - `500`: Error del servidor durante la actualización
- **Notas**:
  - El punto de conexión valida el formato de la URL antes de actualizar
  - Se permiten URLs de servidor vacías o nulas
  - Admite los protocolos HTTP y HTTPS
  - Devuelve la información actualizada del servidor

## Obtener contraseña del servidor - `/api/servers/:serverId/password` {#get-server-password---apiserversserveridpassword}
- **Endpoint**: `/api/servers/:serverId/password`
- **Method**: GET
- **Description**: Recupera un token CSRF para operaciones relacionadas con la contraseña del servidor.
- **Autenticación**: Requiere una sesión válida
- **Parámetros**:
  - `serverId`: el identificador del servidor
- **Respuesta**:

  ```json
  {
    "csrfToken": "csrf-token-string",
    "serverId": "server-id"
  }
  ```

- **Respuestas de error**:
  - `401`: Sesión inválida o expirada
  - `500`: Error al generar el token CSRF
- **Notas**:
  - Devuelve el token CSRF para usarlo en operaciones de actualización de contraseña
  - La sesión debe ser válida para generar el token

## Actualizar contraseña del servidor - `/api/servers/:serverId/password` {#update-server-password---apiserversserveridpassword}
- **Endpoint**: `/api/servers/:serverId/password`
- **Method**: PATCH
- **Description**: Actualiza la contraseña para un servidor específico.
- **Autenticación**: Requiere sesión válida y token CSRF
- **Parámetros**:
  - `serverId`: el identificador del servidor
- **Cuerpo de la solicitud**:

  ```json
  {
    "password": "new-password"
  }
  ```

- **Respuesta**:

  ```json
  {
    "message": "Password updated successfully",
    "serverId": "server-id"
  }
  ```

- **Respuestas de error**:
  - `400`: La contraseña debe ser una cadena de texto
  - `401`: No autorizado - Sesión o token CSRF inválido
  - `500`: Error al actualizar la contraseña
- **Notas**:
  - La contraseña puede ser una cadena vacía para eliminarla
  - La contraseña se almacena de forma segura mediante el sistema de gestión de secretos

## Gestión de usuarios {#user-management}

### Listar Usuarios - `/api/users` {#list-users---apiusers}
- **Endpoint**: `/api/users`
- **Method**: GET
- **Description**: Lista todos los usuarios con paginación y filtrado de búsqueda opcional. Devuelve información del usuario, incluyendo historial de inicio de sesión y estado de la cuenta.
- **Autenticación**: Requiere privilegios de administrador, sesión válida y token CSRF
- **Parámetros de consulta**:
  - `page` (opcional): Número de página (por defecto: 1)
  - `limit` (opcional): Elementos por página (por defecto: 50)
  - `search` (opcional): Término de búsqueda para filtrar por nombre de usuario
- **Respuesta**:

  ```json
  {
    "users": [
      {
        "id": "user-id",
        "username": "admin",
        "isAdmin": true,
        "mustChangePassword": false,
        "createdAt": "2024-01-01T00:00:00Z",
        "lastLoginAt": "2024-01-15T10:30:00Z",
        "lastLoginIp": "192.168.1.100",
        "failedLoginAttempts": 0,
        "lockedUntil": null,
        "isLocked": false
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 5,
      "totalPages": 1
    }
  }
  ```

- **Respuestas de error**:
  - `401`: No autorizado - Sesión o token CSRF inválido
  - `403`: Prohibido - Se requieren privilegios de administrador
  - `500`: Error interno del servidor
- **Notas**:
  - Solo accesible para usuarios administradores
  - Admite paginación y filtrado de búsqueda
  - Devuelve el estado de la cuenta del usuario, incluido el estado de bloqueo

### Crear usuario - `/api/users` {#create-user---apiusers}
- **Endpoint**: `/api/users`
- **Method**: POST
- **Description**: Crea una nueva cuenta de usuario. Puede generar una contraseña temporal o utilizar una contraseña proporcionada.
- **Autenticación**: Requiere privilegios de administrador, sesión válida y token CSRF
- **Cuerpo de la solicitud**:

  ```json
  {
    "username": "newuser",
    "password": "optional-password",
    "isAdmin": false,
    "requirePasswordChange": true
  }
  ```

- `username`: Obligatorio, debe tener entre 3 y 50 caracteres, único
  - `password`: Opcional, si no se proporciona se genera una contraseña temporal segura
  - `isAdmin`: Opcional, por defecto falso
  - `requirePasswordChange`: Opcional, por defecto verdadero
- **Respuesta**:

  ```json
  {
    "user": {
      "id": "user-id",
      "username": "newuser",
      "isAdmin": false,
      "mustChangePassword": true
    },
    "temporaryPassword": "generated-password-123"
  }
  ```

- `temporaryPassword` solo se incluye si se generó una contraseña automáticamente
- **Respuestas de error**:
  - `400`: Formato de nombre de usuario inválido, violación de la política de contraseñas o errores de validación
  - `401`: No autorizado - Sesión o token CSRF inválido
  - `403`: Prohibido - Se requieren privilegios de administrador
  - `409`: El nombre de usuario ya existe
  - `500`: Error interno del servidor
- **Notas**:
  - Solo accesible para usuarios administradores
  - El nombre de usuario no distingue entre mayúsculas y minúsculas y se almacena en minúsculas
  - Si no se proporciona una contraseña, se genera una contraseña segura de 12 caracteres
  - Las contraseñas temporales generadas solo se devuelven una vez en la respuesta
  - La creación de usuarios se registra en el registro de auditoría

### Actualizar usuario - `/api/users/:id` {#update-user---apiusersid}
- **Endpoint**: `/api/users/:id`
- **Method**: PATCH
- **Description**: Actualiza la información del usuario, incluyendo nombre de usuario, estado de administrador, requisito de cambio de contraseña y restablecimiento de contraseña.
- **Autenticación**: Requiere privilegios de administrador, sesión válida y token CSRF
- **Parámetros**:
  - `id`: ID del usuario a actualizar
- **Cuerpo de la solicitud**:

  ```json
  {
    "username": "updated-username",
    "isAdmin": true,
    "requirePasswordChange": false,
    "resetPassword": true
  }
  ```

- Todos los campos son opcionales
  - `resetPassword`: Si es verdadero, genera una nueva contraseña temporal y establece `requirePasswordChange` en verdadero
- **Respuesta** (con restablecimiento de contraseña):

  ```json
  {
    "user": {
      "id": "user-id",
      "username": "updated-username",
      "isAdmin": true,
      "mustChangePassword": true
    },
    "temporaryPassword": "new-temp-password-456"
  }
  ```

- **Respuesta** (sin restablecimiento de contraseña):

  ```json
  {
    "user": {
      "id": "user-id",
      "username": "updated-username",
      "isAdmin": true,
      "mustChangePassword": false
    }
  }
  ```

- **Respuestas de error**:
  - `400`: Entrada no válida o errores de validación
  - `401`: No autorizado - Sesión o token CSRF no válido
  - `403`: Prohibido - Se requieren privilegios de administrador
  - `404`: Usuario no encontrado
  - `409`: El nombre de usuario ya existe (si se cambia el nombre de usuario)
  - `500`: Error interno del servidor
- **Notas**:
  - Solo accesible para usuarios administradores
  - Los cambios de nombre de usuario se validan para garantizar la unicidad
  - El restablecimiento de contraseña genera una contraseña temporal segura de 12 caracteres
  - Todos los cambios se registran en el registro de auditoría

### Eliminar usuario - `/api/users/:id` {#delete-user---apiusersid}
- **Endpoint**: `/api/users/:id`
- **Method**: DELETE
- **Description**: Elimina una cuenta de usuario. Impide eliminar tu propia cuenta o la última cuenta de administrador.
- **Autenticación**: Requiere privilegios de administrador, sesión válida y token CSRF
- **Parámetros**:
  - `id`: ID del usuario a eliminar
- **Respuesta**:

  ```json
  {
    "success": true,
    "message": "User deleted successfully"
  }
  ```

- **Respuestas de error**:
  - `400`: No se puede eliminar tu propia cuenta o la última cuenta de administrador
  - `401`: No autorizado - Sesión o token CSRF no válido
  - `403`: Prohibido - Se requieren privilegios de administrador
  - `404`: Usuario no encontrado
  - `500`: Error interno del servidor
- **Notas**:
  - Solo accesible para usuarios administradores
  - No se puede eliminar tu propia cuenta
  - No se puede eliminar la última cuenta de administrador (debe quedar al menos un administrador)
  - La eliminación del usuario se registra en el registro de auditoría
  - Las sesiones asociadas se eliminan automáticamente (en cascada)

## Gestión del registro de auditoría {#audit-log-management}

### Listar registros de auditoría - `/api/audit-log` {#list-audit-logs---apiaudit-log}
- **Endpoint**: `/api/audit-log`
- **Method**: GET
- **Description**: Recupera entradas del registro de auditoría con filtros, paginación y capacidades de búsqueda. Admite paginación basada en páginas y basada en desplazamiento.
- **Autenticación**: Requiere sesión válida y token CSRF (se requiere usuario autenticado)
- **Parámetros de consulta**:
  - `page` (opcional): Número de página para paginación basada en página
  - `offset` (opcional): Desplazamiento para paginación basada en offset (tiene prioridad sobre la página)
  - `limit` (opcional): Elementos por página (por defecto: 50)
  - `startDate` (opcional): Filtrar registros desde esta fecha (formato ISO)
  - `endDate` (opcional): Filtrar registros hasta esta fecha (formato ISO)
  - `userId` (opcional): Filtrar por ID de usuario
  - `username` (opcional): Filtrar por nombre de usuario
  - `action` (opcional): Filtrar por nombre de acción
  - `category` (opcional): Filtrar por categoría (`auth`, `user_management`, `config`, `backup`, `server`)
  - `status` (opcional): Filtrar por estado (`success`, `failure`, `error`)
- **Respuesta**:

  ```json
  {
    "logs": [
      {
        "id": 1,
        "timestamp": "2024-01-15T10:30:00Z",
        "userId": "user-id",
        "username": "admin",
        "action": "login",
        "category": "auth",
        "targetType": "user",
        "targetId": "user-id",
        "status": "success",
        "ipAddress": "192.168.1.100",
        "userAgent": "Mozilla/5.0...",
        "details": {
          "is_admin": true
        },
        "errorMessage": null
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 150,
      "totalPages": 3
    }
  }
  ```

- **Respuestas de error**:
  - `401`: No autorizado - Sesión o token CSRF no válido
  - `500`: Error interno del servidor
- **Notas**:
  - Admite paginación basada en página (`page`) y basada en offset (`offset`)
  - El campo `details` contiene JSON analizado con contexto adicional
  - Todas las consultas del registro de auditoría se registran

### Obtener valores de filtro del registro de auditoría - `/api/audit-log/filters` {#get-audit-log-filter-values---apiaudit-logfilters}
- **Endpoint**: `/api/audit-log/filters`
- **Method**: GET
- **Description**: Recupera valores únicos de filtro disponibles para filtrar registros de auditoría. Devuelve todas las acciones, categorías y estados distintos que existen en la base de datos del registro de auditoría. Útil para rellenar menús desplegables de filtro en la interfaz de usuario.
- **Autenticación**: Requiere sesión válida y token CSRF (se requiere usuario autenticado)
- **Respuesta**:

  ```json
  {
    "actions": [
      "login",
      "logout",
      "user_created",
      "user_updated",
      "config_updated"
    ],
    "categories": [
      "auth",
      "user_management",
      "config",
      "backup",
      "server"
    ],
    "statuses": [
      "success",
      "failure",
      "error"
    ]
  }
  ```

- **Respuestas de error**:
  - `401`: No autorizado - Sesión o token CSRF no válido
  - `500`: Error interno del servidor
- **Notas**:
  - Devuelve matrices de valores únicos de la base de datos del registro de auditoría
  - Los valores se ordenan alfabéticamente
  - Se devuelven matrices vacías si no hay datos o en caso de error
  - Utilizado por el visor de registros de auditoría para rellenar dinámicamente los desplegables de filtro

### Descargar registros de auditoría - `/api/audit-log/download` {#download-audit-logs---apiaudit-logdownload}
- **Endpoint**: `/api/audit-log/download`
- **Method**: GET
- **Description**: Descarga registros de auditoría en formato CSV o JSON con filtrado opcional. Útil para análisis externos e informes.
- **Autenticación**: Requiere sesión válida y token CSRF (se requiere usuario autenticado)
- **Parámetros de consulta**:
  - `format` (opcional): Formato de exportación - `csv` o `json` (por defecto: `csv`)
  - `startDate` (opcional): Filtrar registros desde esta fecha (formato ISO)
  - `endDate` (opcional): Filtrar registros hasta esta fecha (formato ISO)
  - `userId` (opcional): Filtrar por ID de usuario
  - `username` (opcional): Filtrar por nombre de usuario
  - `action` (opcional): Filtrar por nombre de acción
  - `category` (opcional): Filtrar por categoría
  - `status` (opcional): Filtrar por estado
- **Respuesta** (CSV):
  - Content-Type: `text/csv`
  - Content-Disposition: `attachment; filename="audit-log-YYYY-MM-DD.csv"`
  - Archivo CSV con encabezados: ID, Marca de tiempo, ID de usuario, Nombre de usuario, Acción, Categoría, Tipo de destino, ID de destino, Estado, Dirección IP, Agente de usuario, Detalles, Mensaje de error
- **Respuesta** (JSON):
  - Content-Type: `application/json`
  - Content-Disposition: `attachment; filename="audit-log-YYYY-MM-DD.json"`
  - Array JSON de entradas del registro de auditoría
- **Respuestas de error**:
  - `400`: No hay registros para exportar
  - `401`: No autorizado - Sesión o token CSRF inválido
  - `500`: Error interno del servidor
- **Notas**:
  - El límite de exportación es de 10,000 registros
  - El formato CSV escapa correctamente los caracteres especiales
  - El campo Detalles en CSV está serializado en formato JSON
  - El nombre del archivo incluye la fecha actual

### Limpiar registros de auditoría - `/api/audit-log/cleanup` {#cleanup-audit-logs---apiaudit-logcleanup}
- **Endpoint**: `/api/audit-log/cleanup`
- **Method**: POST
- **Description**: Dispara manualmente la limpieza de registros de auditoría antiguos según el período de retención. Admite el modo de prueba (dry-run) para previsualizar qué se eliminaría.
- **Autenticación**: Requiere privilegios de administrador, sesión válida y token CSRF
- **Cuerpo de la solicitud**:

  ```json
  {
    "retentionDays": 90,
    "dryRun": false
  }
  ```

- `retentionDays` (opcional): Anular los días de retención (30-365), de lo contrario usa el valor configurado
  - `dryRun` (opcional): Si es verdadero, solo devuelve lo que se eliminaría sin eliminarlo realmente
- **Respuesta** (modo de prueba):

  ```json
  {
    "dryRun": true,
    "wouldDeleteCount": 50,
    "oldestRemaining": "2024-01-01T00:00:00Z",
    "retentionDays": 90,
    "cutoffDate": "2024-01-01"
  }
  ```

- **Respuesta** (limpieza real):

  ```json
  {
    "success": true,
    "deletedCount": 50,
    "oldestRemaining": "2024-01-01T00:00:00Z",
    "retentionDays": 90
  }
  ```

- **Respuestas de error**:
  - `400`: Días de retención no válidos (deben estar entre 30 y 365)
  - `401`: No autorizado - Sesión o token CSRF inválido
  - `403`: Prohibido - Se requieren privilegios de administrador
  - `500`: Error interno del servidor
- **Notas**:
  - Solo accesible para usuarios administradores
  - La retención por defecto es de 90 días si no está configurada
  - La operación de limpieza se registra en el registro de auditoría
  - El modo de prueba es útil para previsualizar el impacto de la limpieza

### Obtener retención del registro de auditoría - `/api/audit-log/retention` {#get-audit-log-retention---apiaudit-logretention}
- **Endpoint**: `/api/audit-log/retention`
- **Método**: GET
- **Descripción**: Recupera la configuración actual de retención del registro de auditoría en días.
- **Autenticación**: Requiere sesión válida y token CSRF (no se requiere usuario autenticado)
- **Respuesta**:

  ```json
  {
    "retentionDays": 90
  }
  ```

- **Respuestas de error**:
  - `500`: Error interno del servidor
- **Notas**:
  - La retención por defecto es de 90 días si no está configurada
  - Puede accederse sin autenticación (solo lectura)

### Actualizar retención del registro de auditoría - `/api/audit-log/retention` {#update-audit-log-retention---apiaudit-logretention}
- **Endpoint**: `/api/audit-log/retention`
- **Método**: PATCH
- **Descripción**: Actualiza el período de retención del registro de auditoría en días. Esta configuración determina cuánto tiempo se conservan los registros de auditoría antes de la eliminación automática.
- **Autenticación**: Requiere privilegios de administrador, sesión válida y token CSRF
- **Cuerpo de la solicitud**:

  ```json
  {
    "retentionDays": 120
  }
  ```

- `retentionDays`: Obligatorio, debe estar entre 30 y 365 días
- **Respuesta**:

  ```json
  {
    "success": true,
    "retentionDays": 120
  }
  ```

- **Respuestas de error**:
  - `400`: Días de retención no válidos (deben estar entre 30 y 365)
  - `401`: No autorizado - Sesión o token CSRF inválido
  - `403`: Prohibido - Se requieren privilegios de administrador
  - `500`: Error interno del servidor
- **Notas**:
  - Solo accesible para usuarios administradores
  - El cambio de configuración se registra en el registro de auditoría
  - El período de retención afecta las operaciones de limpieza automáticas y manuales

## Gestión de base de datos {#database-management}

### Copiar base de datos - `/api/database/backup` {#backup-database---apidatabasebackup}
- **Endpoint**: `/api/database/backup`
- **Método**: GET
- **Descripción**: Crea una copia de seguridad de la base de datos en formato binario (.db) o SQL (.sql). El archivo de copia de seguridad se descarga automáticamente con un nombre que incluye la marca de tiempo.
- **Autenticación**: Requiere privilegios de administrador, sesión válida y token CSRF
- **Parámetros de consulta**:
  - `format` (opcional): Formato de copia de seguridad - `db` (binario) o `sql` (volcado SQL). Por defecto: `db`
- **Respuesta**:
  - Content-Type: `application/octet-stream` (para .db) o `text/plain` (para .sql)
  - Content-Disposition: `attachment; filename="duplistatus-backup-YYYY-MM-DDTHH-MM-SS.db"` o `.sql`
  - Contenido binario del archivo (para .db) o contenido de texto SQL (para .sql)
- **Respuestas de error**:
  - `400`: Formato no válido (debe ser "db" o "sql")
  - `401`: No autorizado - Sesión o token CSRF no válido
  - `403`: Prohibido - Se requieren privilegios de administrador
  - `500`: No se pudo crear la copia de seguridad de la base de datos
- **Notas**:
  - Solo accesible para usuarios administradores
  - El formato binario utiliza el método de copia de seguridad de SQLite para garantizar la integridad
  - El formato SQL crea un volcado de texto de todo el contenido de la base de datos
  - La marca de tiempo en el nombre del archivo utiliza la zona horaria local del servidor
  - La operación de copia de seguridad se registra en el registro de auditoría
  - Los archivos temporales se eliminan automáticamente después de la descarga

### Restaurar base de datos - `/api/database/restore` {#restore-database---apidatabaserestore}
- **Endpoint**: `/api/database/restore`
- **Método**: POST
- **Descripción**: Restaura la base de datos desde un archivo de copia de seguridad (formato .db o .sql). Crea una copia de seguridad de seguridad antes de la restauración y elimina todas las sesiones tras la restauración por motivos de seguridad.
- **Autenticación**: Requiere privilegios de administrador, sesión válida y token CSRF
- **Cuerpo de la solicitud**: FormData con un campo de archivo llamado `database`
  - El archivo debe ser `.db`, `.sqlite`, `.sqlite3` (formato binario) o `.sql` (formato SQL)
  - Tamaño máximo del archivo: 100 MB
- **Respuesta**:

  ```json
  {
    "success": true,
    "message": "Database restored successfully from DB file",
    "safetyBackupPath": "duplistatus-backup-YYYY-MM-DDTHH-MM-SS.db",
    "requiresReauth": true
  }
  ```

- **Respuestas de error**:
  - `400`: No se proporcionó archivo, el tamaño del archivo excede el límite, formato de archivo no válido o falló la verificación de integridad de la base de datos
  - `401`: No autorizado - Sesión o token CSRF no válido
  - `403`: Prohibido - Se requieren privilegios de administrador
  - `500`: No se pudo restaurar la base de datos (la base de datos original se restaura desde la copia de seguridad de seguridad si falla la restauración)
- **Notas**:
  - Solo accesible para usuarios administradores
  - Crea automáticamente una copia de seguridad de seguridad antes de la restauración
  - Admite formatos binario (.db) y SQL (.sql)
  - Valida la integridad de la base de datos después de la restauración
  - Si la restauración falla, se restaura automáticamente desde la copia de seguridad de seguridad
  - Todas las sesiones se eliminan tras una restauración exitosa por motivos de seguridad
  - Devuelve `requiresReauth: true` para indicar que el usuario debe iniciar sesión nuevamente
  - La operación de restauración se registra en el registro de auditoría
  - Para el formato SQL, valida el contenido SQL antes de su ejecución
  - La conexión a la base de datos se reinicializa después de la restauración
  - Todas las cachés se invalidan después de la restauración

## Marcas de tiempo de copia de seguridad {#backup-timestamps}

### Obtener marcas de tiempo de la última copia de seguridad - `/api/backups/last-timestamps` {#get-last-backup-timestamps---apibackupslast-timestamps}
- **Endpoint**: `/api/backups/last-timestamps`
- **Método**: GET
- **Descripción**: Recupera la marca de tiempo de la última copia de seguridad para cada combinación servidor-copia de seguridad. Devuelve un mapa para facilitar la búsqueda.
- **Autenticación**: Requiere sesión válida y token CSRF
- **Respuesta**:

  ```json
  {
    "timestamps": {
      "server-id-1:Backup Name 1": "2024-03-20T10:00:00Z",
      "server-id-1:Backup Name 2": "2024-03-20T11:00:00Z",
      "server-id-2:Backup Name 1": "2024-03-20T12:00:00Z"
    },
    "raw": [
      {
        "server_name": "Server Name",
        "server_id": "server-id-1",
        "backup_name": "Backup Name 1",
        "date": "2024-03-20T10:00:00Z"
      }
    ]
  }
  ```

- **Respuestas de error**:
  - `401`: No autorizado - Sesión o token CSRF no válido
  - `500`: No se pudieron obtener las marcas de tiempo de la última copia de seguridad
- **Notas**:
  - Devuelve tanto un mapa (para búsqueda fácil por `server_id:backup_name`) como el formato de matriz sin procesar
  - Incluye cabeceras de control de caché para evitar el almacenamiento en caché
  - Útil para rastrear los tiempos de la última copia de seguridad en todas las combinaciones de servidor y copia de seguridad
  - Las marcas de tiempo están en formato ISO

## Gestión de registros de la aplicación {#application-logs-management}

### Obtener registros de la aplicación - `/api/application-logs` {#get-application-logs---apiapplication-logs}
- **Endpoint**: `/api/application-logs`
- **Método**: GET
- **Descripción**: Recupera entradas de registro de la aplicación desde archivos de registro. Admite la lectura de archivos de registro actuales y rotados con funcionalidad de seguimiento final (tail).
- **Autenticación**: Requiere privilegios de administrador, sesión válida y token CSRF
- **Parámetros de consulta**:
  - `file` (opcional): Nombre del archivo de registro a leer - `application.log`, `application.log.1`, `application.log.2`, etc. Si no se proporciona, devuelve la lista de archivos disponibles
  - `tail` (opcional): Número de líneas a devolver desde el final del archivo (por defecto: 1000, mínimo: 1, máximo: 10000)
- **Respuesta** (con parámetro de archivo):

  ```json
  {
    "logs": "log content as string...",
    "fileSize": 1024000,
    "lastModified": "2024-03-20T10:00:00Z",
    "lineCount": 5000,
    "currentFile": "application.log",
    "availableFiles": ["application.log", "application.log.1", "application.log.2"]
  }
  ```

- **Respuesta** (sin el parámetro de archivo):

  ```json
  {
    "logs": "",
    "fileSize": 0,
    "lastModified": "2024-03-20T10:00:00Z",
    "lineCount": 0,
    "currentFile": "",
    "availableFiles": ["application.log", "application.log.1", "application.log.2"]
  }
  ```

- **Respuestas de error**:
  - `400`: Parámetro de cola no válido (debe estar entre 1 y 10000) o formato de parámetro de archivo no válido
  - `401`: No autorizado - Sesión o token CSRF no válido
  - `403`: Prohibido - Se requieren privilegios de administrador
  - `404`: Archivo de registro no encontrado
  - `500`: No se pudo leer el archivo de registro
- **Notas**:
  - Solo accesible para usuarios administradores
  - Admite la lectura del archivo de registro actual y archivos rotados (hasta 10 archivos rotados)
  - Devuelve las últimas N líneas (cola) del archivo de registro especificado
  - El nombre del archivo de registro lo determina la variable de entorno (por defecto: `application.log`)
  - Devuelve la lista de archivos de registro disponibles cuando no se proporciona el parámetro de archivo
  - Los nombres de archivo se validan para evitar ataques de recorrido de directorio
  - Los archivos rotados se numeran secuencialmente (`.1`, `.2`, etc.)

### Exportar registros de la aplicación - `/api/application-logs/export` {#export-application-logs---apiapplication-logsexport}
- **Endpoint**: `/api/application-logs/export`
- **Método**: GET
- **Descripción**: Exporta entradas de registro de la aplicación en formato de texto filtrado. Admite filtrado por nivel de registro y cadena de búsqueda.
- **Autenticación**: Requiere privilegios de administrador, sesión válida y token CSRF
- **Parámetros de consulta**:
  - `file` (requerido): Nombre del archivo de registro a exportar - `application.log`, `application.log.1`, `application.log.2`, etc.
  - `logLevels` (opcional): Lista separada por comas de niveles de registro a incluir - `INFO`, `WARN`, `ERROR` (por defecto: `INFO,WARN,ERROR`)
  - `search` (opcional): Cadena de búsqueda para filtrar líneas de registro (no distingue mayúsculas y minúsculas)
- **Respuesta**:
  - Content-Type: `text/plain`
  - Content-Disposition: `attachment; filename="duplistatus-logs-YYYY-MM-DDTHH-MM-SS.txt"`
  - Contenido de registro filtrado como texto plano
- **Respuestas de error**:
  - `400`: El parámetro de archivo es obligatorio o tiene un formato no válido
  - `401`: No autorizado - Sesión o token CSRF no válido
  - `403`: Prohibido - Se requieren privilegios de administrador
  - `500`: No se pudieron exportar los registros
- **Notas**:
  - Solo accesible para usuarios administradores
  - Exporta entradas de registro filtradas según el nivel de registro y los criterios de búsqueda
  - Admite filtrado por niveles de registro: `INFO`, `WARN`, `ERROR`
  - El filtrado por cadena de búsqueda no distingue mayúsculas y minúsculas
  - Las líneas vacías se filtran automáticamente
  - El nombre del archivo de registro lo determina la variable de entorno (por defecto: `application.log`)
  - Los nombres de archivo se validan para evitar ataques de recorrido de directorio
  - El archivo exportado incluye la marca de tiempo en el nombre del archivo
  - Útil para análisis externo y solución de problemas
