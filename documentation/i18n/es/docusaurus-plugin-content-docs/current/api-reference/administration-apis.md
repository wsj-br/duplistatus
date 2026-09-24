# Administración {/* #administration */}

## Recopilar copias de seguridad - `/api/backups/collect` {/* #collect-backups---apibackupscollect */}
- **Endpoint**: `/api/backups/collect`
- **Método**: POST
- **Descripción**: Recopila datos de copia de seguridad directamente desde un servidor Duplicati a través de su API. Este endpoint detecta automáticamente el mejor protocolo de conexión (HTTPS con validación SSL, HTTPS con certificados autofirmados o HTTP como alternativa) y se conecta al servidor Duplicati para recuperar la información de copia de seguridad y procesarla en la base de datos local.
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
  - `500`: Error del servidor durante la recopilación de copia de seguridad
- **Notas**: 
  - El endpoint detecta automáticamente el protocolo de conexión óptimo (HTTPS → HTTPS con autofirmado → HTTP)
  - Los intentos de detección de protocolo se realizan en orden de preferencia de seguridad
  - Los tiempos de espera de conexión son configurables mediante variables de entorno
  - Registra los datos recopilados en modo desarrollo para depuración
  - Asegura que la configuración de copia de seguridad esté completa para todos los servidores y copias de seguridad
  - Utiliza el puerto predeterminado 8200 si no se especifica
  - El protocolo detectado y la URL del servidor se almacenan automáticamente en la base de datos
  - `serverAlias` se recupera de la base de datos y puede estar vacío si no hay alias configurado
  - La interfaz debe usar `serverAlias || serverName` para fines de visualización
  - Soporta tanto métodos de descarga JSON como recopilación directa de API

## Limpiar copias de seguridad - `/api/backups/cleanup` {/* #cleanup-backups---apibackupscleanup */}
- **Endpoint**: `/api/backups/cleanup`
- **Método**: POST
- **Descripción**: Elimina datos de copia de seguridad antiguos según el período de retención. Este endpoint ayuda a gestionar el tamaño de la base de datos eliminando registros de copia de seguridad obsoletos mientras preserva datos recientes e importantes.
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
  - `401`: No autorizado - Sesión inválida o token CSRF incorrecto
  - `400`: Período de retención especificado inválido
  - `500`: Error del servidor durante la operación de limpieza con información detallada del error
- **Notas**: 
  - La operación de limpieza es irreversible
  - Los datos de copia de seguridad se eliminan permanentemente de la base de datos
  - Los registros de máquinas se conservan incluso si todas las copias de seguridad se eliminan
  - Cuando se selecciona "Eliminar todos los datos", se eliminan todas las máquinas y copias de seguridad y se borra la configuración
  - La generación de informes de errores mejorada incluye detalles y traza de pila en modo desarrollo
  - Soporta tanto retención basada en tiempo como eliminación completa de datos

## Eliminar trabajo de copia de seguridad - `/api/backups/delete-job` {/* #delete-backup-job---apibackupsdelete-job */}
- **Endpoint**: `/api/backups/delete-job`
- **Método**: DELETE
- **Descripción**: Elimina todos los registros de copia de seguridad para una combinación específica de servidor-copia de seguridad. Este endpoint solo está disponible en modo desarrollo.
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
  - `401`: No autorizado - Sesión inválida o token CSRF incorrecto
  - `403`: La eliminación de trabajos de copia de seguridad solo está disponible en modo desarrollo
  - `400`: Se requieren ID del servidor y nombre de copia de seguridad
  - `404`: No se encontraron copias de seguridad para eliminar
  - `500`: Error del servidor durante la eliminación con información detallada del error
- **Notas**: 
  - Esta operación solo está disponible en modo desarrollo
  - Esta operación es irreversible
  - Todos los registros de copia de seguridad para la combinación servidor-copia de seguridad especificada se eliminarán permanentemente
  - Devuelve la cantidad de copias de seguridad eliminadas y la información del servidor
  - Utiliza el alias del servidor para mostrarlo si está disponible, de lo contrario recurre al nombre del servidor

## Sincronizar horarios de copia de seguridad - `/api/backups/sync-schedule` {/* #sync-backup-schedules---apibackupssync-schedule */}
- **Endpoint**: `/api/backups/sync-schedule`
- **Método**: POST
- **Descripción**: Sincroniza la información de horario de copia de seguridad desde un servidor Duplicati. Este endpoint se conecta al servidor, recupera la información de horario para todas las copias de seguridad y actualiza la configuración local de copia de seguridad con los detalles del horario incluyendo intervalos de repetición, días de la semana permitidos y horas programadas.
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

O solo con serverId (usa contraseña almacenada):

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

- **Respuestas de Error**:
  - `400`: Parámetros de solicitud no válidos, falta el nombre de host/contraseña cuando no se proporciona serverId, o conexión fallida
  - `404`: Servidor no encontrado (cuando se proporciona serverId) o no hay contraseña almacenada para el servidor
  - `500`: Error del servidor durante la sincronización del horario
- **Notas**: 
  - El endpoint detecta automáticamente el protocolo de conexión óptimo (HTTPS → HTTPS con certificado autofirmado → HTTP)
  - Puede llamarse solo con serverId para usar las credenciales de servidor almacenadas
  - Puede llamarse con serverId y nuevas credenciales para actualizar los detalles de conexión del servidor
  - Puede llamarse con hostname/puerto/contraseña sin serverId para servidores nuevos
  - Actualiza la configuración de copia de seguridad con información del horario incluyendo:
    - `expectedInterval`: El intervalo de repetición (por ejemplo, "Diariamente", "Semanalmente", "Mensualmente")
    - `allowedWeekDays`: Array de días de la semana permitidos (0=Domingo, 1=Lunes, etc.)
    - `time`: La hora programada para la copia de seguridad
  - Procesa todas las copias de seguridad encontradas en el servidor
  - Devuelve estadísticas sobre las copias de seguridad procesadas y cualquier error encontrado
  - Registra eventos de auditoría para operaciones de sincronización exitosas y fallidas
  - Usa el puerto predeterminado 8200 si no se especifica

## Probar Conexión del Servidor - `/api/servers/test-connection` {/* #test-server-connection---apiserverstest-connection */}
- **Endpoint**: `/api/servers/test-connection`
- **Método**: POST
- **Descripción**: Prueba la conexión a un servidor Duplicati para verificar que sea accesible.
- **Cuerpo de la Solicitud**:

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

- **Respuestas de Error**:
  - `400`: Formato de URL no válido o falta la URL del servidor
  - `500`: Error del servidor durante la prueba de conexión
- **Notas**: 
  - El endpoint valida el formato de URL y prueba la conectividad
  - Devuelve éxito si el servidor responde con un estado 401 (esperado para el endpoint de inicio de sesión sin credenciales)
  - Prueba la conexión al endpoint de inicio de sesión del servidor Duplicati
  - Soporta ambos protocolos HTTP y HTTPS
  - Utiliza la configuración de tiempo de espera para la prueba de conexión

## Obtener URL del Servidor - `/api/servers/:serverId/server-url` {/* #get-server-url---apiserversserveridserver-url */}
- **Endpoint**: `/api/servers/:serverId/server-url`
- **Método**: GET
- **Descripción**: Recupera la URL del servidor para un servidor específico.
- **Parámetros**:
  - `serverId`: el identificador del servidor

- **Respuesta**:

  ```json
  {
    "serverId": "server-id",
    "server_url": "http://localhost:8200"
  }
  ```

- **Respuestas de Error**:
  - `404`: Servidor no encontrado
  - `500`: Error del servidor
- **Notas**:
  - Devuelve la URL del servidor para servidor específico
  - Se utiliza para la gestión de conexiones del servidor
  - Devuelve una cadena vacía si no hay URL de servidor establecida

## Actualizar URL del Servidor - `/api/servers/:serverId/server-url` {/* #update-server-url---apiserversserveridserver-url */}
- **Endpoint**: `/api/servers/:serverId/server-url`
- **Método**: PATCH
- **Descripción**: Actualiza la URL del servidor para un servidor específico.
- **Autenticación**: Requiere sesión válida y token CSRF
- **Parámetros**:
  - `serverId`: el identificador del servidor
- **Cuerpo de la Solicitud**:

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

- **Respuestas de Error**:
  - `401`: No autorizado - Sesión o token CSRF no válidos
  - `400`: Formato de URL no válido
  - `404`: Servidor no encontrado
  - `500`: Error del servidor durante la actualización
- **Notas**: 
  - El endpoint valida el formato de URL antes de actualizar
  - Se permiten URLs de servidor vacías o nulas
  - Soporta ambos protocolos HTTP y HTTPS
  - Devuelve la información actualizada del servidor

## Obtener Contraseña del Servidor - `/api/servers/:serverId/password` {/* #get-server-password---apiserversserveridpassword */}
- **Endpoint**: `/api/servers/:serverId/password`
- **Método**: GET
- **Descripción**: Recupera un token CSRF para operaciones de contraseña del servidor.
- **Autenticación**: Requiere sesión válida
- **Parámetros**:
  - `serverId`: el identificador del servidor
- **Respuesta**:

  ```json
  {
    "csrfToken": "csrf-token-string",
    "serverId": "server-id"
  }
  ```

- **Respuestas de Error**:
  - `401`: Sesión no válida o expirada
  - `500`: Error al generar el token CSRF
- **Notas**:
  - Devuelve el token CSRF para su uso con operaciones de actualización de contraseña
  - La sesión debe ser válida para generar el token

## Actualizar Contraseña del Servidor - `/api/servers/:serverId/password` {/* #update-server-password---apiserversserveridpassword */}
- **Endpoint**: `/api/servers/:serverId/password`
- **Método**: PATCH
- **Descripción**: Actualiza la contraseña para un servidor específico.
- **Autenticación**: Requiere sesión válida y token CSRF
- **Parámetros**:
  - `serverId`: el identificador del servidor
- **Cuerpo de la Solicitud**:

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

- **Respuestas de Error**:
  - `400`: La contraseña debe ser una cadena
  - `401`: No autorizado - Sesión o token CSRF no válidos
  - `500`: Error al actualizar la contraseña
- **Notas**:
  - La contraseña puede ser una cadena vacía para borrar la contraseña
  - La contraseña se almacena de forma segura utilizando el sistema de gestión de secretos

## Gestión de usuarios {/* #user-management */}

### Lista de usuarios - `/api/users` {/* #list-users---apiusers */}
- **Endpoint**: `/api/users`
- **Método**: GET
- **Descripción**: Enumera todos los usuarios con paginación y filtrado opcional de búsqueda. Devuelve información del usuario incluyendo historial de inicio de sesión y estado de la cuenta.
- **Autenticación**: Requiere privilegios de administrador, sesión válida y token CSRF
- **Parámetros de consulta**:
  - `page` (opcional): Número de página (predeterminado: 1)
  - `limit` (opcional): Elementos por página (predeterminado: 50)
  - `search` (opcional): Término de búsqueda para filtrar por nombre de usuario
- **Respuesta**:

  ```json
  {
    "users": [
      {
        "id": "user-id",
        "username": "admin",
        "isAdmin": true,
        "accessAllServers": true,
        "serverIds": [],
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
  - Compatible con paginación y filtrado de búsqueda
  - Devuelve el estado de la cuenta de usuario incluyendo estado de bloqueo

### Crear usuario - `/api/users` {/* #create-user---apiusers */}
- **Endpoint**: `/api/users`
- **Método**: POST
- **Descripción**: Crea una nueva cuenta de usuario. Puede generar una contraseña temporal o usar una contraseña proporcionada.
- **Autenticación**: Requiere privilegios de administrador, sesión válida y token CSRF
- **Cuerpo de solicitud**:

  ```json
  {
    "username": "newuser",
    "password": "optional-password",
    "isAdmin": false,
    "requirePasswordChange": true,
    "accessAllServers": false,
    "serverIds": ["server-id"]
  }
  ```

- `username`: Obligatorio, debe tener entre 3 y 50 caracteres, único
  - `password`: Opcional, si no se proporciona, se genera una contraseña temporal segura
  - `isAdmin`: Opcional, valor predeterminado false. Los usuarios administradores siempre reciben todos los servidores
  - `requirePasswordChange`: Opcional, valor predeterminado true
  - `accessAllServers`: Opcional, valor predeterminado true. Cuando es false, `serverIds` es el único conjunto de servidores que el usuario puede ver
  - `serverIds`: Matriz opcional de identificadores de servidores existentes. Los identificadores desconocidos son rechazados. Se ignora cuando el usuario es un administrador o `accessAllServers` no es false
- **Respuesta**:

  ```json
  {
    "user": {
      "id": "user-id",
      "username": "newuser",
      "isAdmin": false,
      "mustChangePassword": true,
      "accessAllServers": true,
      "serverIds": []
    },
    "temporaryPassword": "generated-password-123"
  }
  ```

- `temporaryPassword` solo se incluye si se generó automáticamente una contraseña
- **Respuestas de error**:
  - `400`: Formato de nombre de usuario inválido, violación de política de contraseña o errores de validación
  - `401`: No autorizado - Sesión o token CSRF inválido
  - `403`: Prohibido - Se requieren privilegios de administrador
  - `409`: El nombre de usuario ya existe
  - `500`: Error interno del servidor
- **Notas**:
  - Solo accesible para usuarios administradores
  - El nombre de usuario no distingue mayúsculas y se almacena en minúsculas
  - Si no se proporciona contraseña, se genera una contraseña segura de 12 caracteres
  - Las contraseñas temporales generadas solo se devuelven una vez en la respuesta
  - La creación de usuarios se registra en el registro de auditoría

### Actualizar usuario - `/api/users/:id` {/* #update-user---apiusersid */}
- **Endpoint**: `/api/users/:id`
- **Método**: PATCH
- **Descripción**: Actualiza la información del usuario incluyendo nombre de usuario, estado de administrador, requisito de cambio de contraseña y restablecimiento de contraseña.
- **Autenticación**: Requiere privilegios de administrador, sesión válida y token CSRF
- **Parámetros**:
  - `id`: ID de usuario a actualizar
- **Cuerpo de solicitud**:

  ```json
  {
    "username": "updated-username",
    "isAdmin": true,
    "requirePasswordChange": false,
    "resetPassword": true,
    "password": "optional-custom-password",
    "accessAllServers": false,
    "serverIds": ["server-id"]
  }
  ```

- Todos los campos son opcionales
  - `accessAllServers` y `serverIds`: Mismas reglas que para crear. Promover un usuario a administrador almacena acceso a todos los servidores. Degradar a un administrador comienza de nuevo en todos los servidores a menos que se envíe una lista personalizada en la misma solicitud
  - `resetPassword`: Si es true, establece una nueva contraseña. `password`, cuando se proporciona, se utiliza después de las comprobaciones de política. Cuando se omite `password`, se genera una contraseña temporal
  - `requirePasswordChange`: Con `resetPassword`, el valor predeterminado es true. Envíe `false` para borrar el indicador de cambio obligatorio de contraseña
- **Respuesta** (con restablecimiento de contraseña):

  ```json
  {
    "user": {
      "id": "user-id",
      "username": "updated-username",
      "isAdmin": true,
      "mustChangePassword": true,
      "accessAllServers": true,
      "serverIds": []
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
      "mustChangePassword": false,
      "accessAllServers": true,
      "serverIds": []
    }
  }
  ```

- **Respuestas de error**:
  - `400`: Entrada no válida o errores de validación
  - `401`: No autorizado: sesión o token CSRF no válido
  - `403`: Prohibido: se requieren privilegios de administrador
  - `404`: Usuario no encontrado
  - `409`: El nombre de usuario ya existe (si se cambia el nombre de usuario)
  - `500`: Error interno del servidor
- **Notas**:
  - Solo accesible para usuarios administradores
  - Los cambios de nombre de usuario se validan para garantizar su unicidad
  - Si se omite la contraseña de restablecimiento, se genera una contraseña temporal segura de 12 caracteres, que se devuelve una sola vez
  - Una contraseña de restablecimiento proporcionada debe cumplir con la política de contraseñas y no se devuelve
  - Todos los cambios se registran en el registro de auditoría

### Eliminar usuario - `/api/users/:id` {/* #delete-user---apiusersid */}
- **Endpoint**: `/api/users/:id`
- **Método**: DELETE
- **Descripción**: Elimina una cuenta de usuario. Impide eliminar tu propia cuenta o la última cuenta de administrador.
- **Autenticación**: Requiere privilegios de administrador, sesión válida y token CSRF
- **Parámetros**:
  - `id`: ID de usuario a eliminar
- **Respuesta**:

  ```json
  {
    "success": true,
    "message": "User deleted successfully"
  }
  ```

- **Respuestas de error**:
  - `400`: No se puede eliminar tu propia cuenta o la última cuenta de administrador
  - `401`: No autorizado - Sesión o token CSRF inválido
  - `403`: Prohibido - Se requieren privilegios de administrador
  - `404`: Usuario no encontrado
  - `500`: Error interno del servidor
- **Notas**:
  - Solo accesible para usuarios administradores
  - No puedes eliminar tu propia cuenta
  - No se puede eliminar la última cuenta de administrador (debe permanecer al menos un administrador)
  - La eliminación de usuarios se registra en el registro de auditoría
  - Las sesiones asociadas se eliminan automáticamente (en cascada)

## Gestión del registro de auditoría {/* #audit-log-management */}

### Lista de Registros de Auditoría - `/api/audit-log` {/* #list-audit-logs---apiaudit-log */}
- **Endpoint**: `/api/audit-log`
- **Método**: GET
- **Descripción**: Recupera entradas de registro de auditoría con capacidades de filtrado, paginación y búsqueda. Admite tanto la paginación basada en páginas como la basada en desplazamiento.
- **Autenticación**: Requiere sesión válida y token CSRF (se requiere usuario conectado)
- **Parámetros de consulta**:
  - `page` (opcional): Número de página para la paginación basada en páginas
  - `offset` (opcional): Desplazamiento para la paginación basada en desplazamiento (tiene prioridad sobre la página)
  - `limit` (opcional): Elementos por página (predeterminado: 50)
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
  - `401`: No autorizado - Sesión o token CSRF inválido
  - `500`: Error interno del servidor
- **Notas**:
  - Admite tanto la paginación basada en páginas (`page`) como la basada en desplazamiento (`offset`)
  - El campo `details` contiene JSON analizado con contexto adicional
  - Todas las consultas de registros de auditoría se registran

### Obtener Valores de Filtro de Registro de Auditoría - `/api/audit-log/filters` {/* #get-audit-log-filter-values---apiaudit-logfilters */}
- **Endpoint**: `/api/audit-log/filters`
- **Método**: GET
- **Descripción**: Recupera valores de filtro únicos disponibles para filtrar registros de auditoría. Devuelve todas las acciones, categorías y estados distintos que existen en la base de datos de registros de auditoría. Útil para completar menús desplegables de filtro en la interfaz de usuario.
- **Autenticación**: Requiere sesión válida y token CSRF (se requiere usuario conectado)
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
  - `401`: No autorizado - Sesión o token CSRF inválido
  - `500`: Error interno del servidor
- **Notas**:
  - Devuelve matrices de valores únicos de la base de datos de registros de auditoría
  - Los valores están ordenados alfabéticamente
  - Se devuelven matrices vacías si no existe ningún dato o en caso de error
  - Utilizado por el visor de registros de auditoría para completar dinámicamente los menús desplegables de filtro

### Descargar Registros de Auditoría - `/api/audit-log/download` {/* #download-audit-logs---apiaudit-logdownload */}
- **Endpoint**: `/api/audit-log/download`
- **Método**: GET
- **Descripción**: Descarga registros de auditoría en formato CSV o JSON con filtrado opcional. Útil para análisis externos e informes.
- **Autenticación**: Requiere sesión válida y token CSRF (se requiere usuario conectado)
- **Parámetros de consulta**:
  - `format` (opcional): Formato de exportación - `csv` o `json` (predeterminado: `csv`)
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
  - Matriz JSON de entradas de registro de auditoría
- **Respuestas de error**:
  - `400`: No hay registros para exportar
  - `401`: No autorizado - Sesión o token CSRF inválido
  - `500`: Error interno del servidor
- **Notas**:
  - El límite de exportación es de 10,000 registros
  - El formato CSV escapa correctamente los caracteres especiales
  - El campo Detalles en CSV está convertido a cadena JSON
  - El nombre del archivo incluye la fecha actual

### Limpiar Registros de Auditoría - `/api/audit-log/cleanup` {/* #cleanup-audit-logs---apiaudit-logcleanup */}
- **Endpoint**: `/api/audit-log/cleanup`
- **Método**: POST
- **Descripción**: Activa manualmente la limpieza de registros de auditoría antiguos según el período de retención. Admite modo de prueba para previsualizar lo que se eliminaría.
- **Autenticación**: Requiere privilegios de administrador, sesión válida y token CSRF
- **Cuerpo de solicitud**:

  ```json
  {
    "retentionDays": 90,
    "dryRun": false
  }
  ```

- `retentionDays` (opcional): Anula los días de retención (30-365), de lo contrario usa el valor configurado
  - `dryRun` (opcional): Si es verdadero, solo devuelve lo que se eliminaría sin eliminarlo realmente
- **Respuesta** (ejecución simulada):

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

- **Respuestas de Error**:
  - `400`: Días de retención no válidos (debe ser 30-365)
  - `401`: No autorizado - Sesión o token CSRF inválido
  - `403`: Prohibido - Se requieren privilegios de Administrador
  - `500`: Error interno del servidor
- **Notas**:
  - Solo accesible para usuarios administradores
  - La retención predeterminada es de 90 días si no está configurada
  - La operación de limpieza se registra en el registro de auditoría
  - El modo de ejecución simulada es útil para previsualizar el impacto de la limpieza

### Obtener retención de registro de auditoría - `/api/audit-log/retention` {/* #get-audit-log-retention---apiaudit-logretention */}
- **Endpoint**: `/api/audit-log/retention`
- **Método**: GET
- **Descripción**: Recupera la configuración actual de retención del registro de auditoría en días.
- **Autenticación**: Requiere sesión válida y token CSRF (no se requiere usuario iniciado sesión)
- **Respuesta**:

  ```json
  {
    "retentionDays": 90
  }
  ```

- **Respuestas de Error**:
  - `500`: Error interno del servidor
- **Notas**:
  - La retención predeterminada es de 90 días si no está configurada
  - Se puede acceder sin autenticación (solo lectura)

### Actualizar retención de registro de auditoría - `/api/audit-log/retention` {/* #update-audit-log-retention---apiaudit-logretention */}
- **Endpoint**: `/api/audit-log/retention`
- **Método**: PATCH
- **Descripción**: Actualiza el período de retención del registro de auditoría en días. Esta configuración determina cuánto tiempo se conservan los registros de auditoría antes de la limpieza automática.
- **Autenticación**: Requiere privilegios de administrador, sesión válida y token CSRF
- **Cuerpo de solicitud**:

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

- **Respuestas de Error**:
  - `400`: Días de retención no válidos (debe ser 30-365)
  - `401`: No autorizado - Sesión o token CSRF inválido
  - `403`: Prohibido - Se requieren privilegios de Administrador
  - `500`: Error interno del servidor
- **Notas**:
  - Solo accesible para usuarios administradores
  - El cambio de configuración se registra en el registro de auditoría
  - El período de retención afecta las operaciones de limpieza automáticas y manuales

## Claves de API {/* #api-keys */}

### Listar claves de API - `/api/api-keys` {/* #list-api-keys---apiapi-keys */}
- **Endpoint**: `/api/api-keys`
- **Método**: GET
- **Descripción**: Lista todas las claves de API. Los secretos nunca se devuelven; cada clave incluye una huella digital (`Qk7v…3xTa`).
- **Autenticación**: Requiere privilegios de administrador, sesión válida y token CSRF
- **Respuestas de Error**:
  - `401`: No autorizado - Sesión o token CSRF inválido
  - `403`: Prohibido - Se requieren privilegios de Administrador
  - `500`: Error interno del servidor

### Crear clave de API - `/api/api-keys` {/* #create-api-key---apiapi-keys */}
- **Endpoint**: `/api/api-keys`
- **Método**: POST
- **Descripción**: Crea una clave de API con ámbito. El secreto en texto plano se devuelve solo en esta respuesta.
- **Autenticación**: Requiere privilegios de administrador, sesión válida y token CSRF
- **Cuerpo de solicitud**:

  ```json
  {
    "name": "Duplicati uploads",
    "scope": "upload",
    "description": "Optional",
    "expiresAt": null
  }
  ```

- **Respuestas de Error**:
  - `400`: Nombre faltante o ámbito no válido (`upload` o `read`)
  - `401`: No autorizado - Sesión o token CSRF inválido
  - `403`: Prohibido - Se requieren privilegios de Administrador
  - `500`: Error interno del servidor

### Actualizar clave de API - `/api/api-keys/:id` {/* #update-api-key---apiapi-keysid */}
- **Endpoint**: `/api/api-keys/:id`
- **Método**: PATCH
- **Descripción**: Habilita o deshabilita una clave.
- **Autenticación**: Requiere privilegios de administrador, sesión válida y token CSRF

### Eliminar clave de API - `/api/api-keys/:id` {/* #delete-api-key---apiapi-keysid */}
- **Endpoint**: `/api/api-keys/:id`
- **Método**: DELETE
- **Descripción**: Elimina una clave. Los clientes existentes que usen ese secreto pierden acceso inmediatamente.
- **Autenticación**: Requiere privilegios de administrador, sesión válida y token CSRF

## Gestión de base de datos {/* #database-management */}

### Copia de seguridad de base de datos - `/api/database/backup` {/* #backup-database---apidatabasebackup */}
- **Endpoint**: `/api/database/backup`
- **Método**: GET
- **Descripción**: Crea una copia de seguridad de la base de datos en formato binario (.db) o SQL (.sql). El archivo de copia de seguridad se descarga automáticamente con un nombre de archivo con marca de tiempo.
- **Autenticación**: Requiere privilegios de administrador, sesión válida y token CSRF
- **Parámetros de consulta**:
  - `format` (opcional): Formato de copia de seguridad - `db` (binario) o `sql` (volcado SQL). Predeterminada: `db`
- **Respuesta**:
  - Content-Type: `application/octet-stream` (para .db) o `text/plain` (para .sql)
  - Content-Disposition: `attachment; filename="duplistatus-backup-YYYY-MM-DDTHH-MM-SS.db"` o `.sql`
  - Contenido binario del archivo (para .db) o contenido de texto SQL (para .sql)
- **Respuestas de error**:
  - `400`: Formato no válido (debe ser "db" o "sql")
  - `401`: No autorizado - Sesión o token CSRF no válido
  - `403`: Prohibido - Se requieren privilegios de administrador
  - `500`: Error al crear la copia de seguridad de la base de datos
- **Notas**:
  - Solo accesible para usuarios administradores
  - El formato binario utiliza el método de copia de seguridad de SQLite para integridad
  - El formato SQL crea un volcado de texto de todo el contenido de la base de datos
  - La marca de tiempo en el nombre de archivo usa la zona horaria local del servidor
  - La operación de copia de seguridad se registra en el registro de auditoría
  - Los archivos temporales se limpian automáticamente después de la descarga

### Restaurar base de datos - `/api/database/restore` {/* #restore-database---apidatabaserestore */}
- **Punto final**: `/api/database/restore`
- **Método**: POST
- **Descripción**: Restaura la base de datos desde un archivo de copia de seguridad (formato .db o .sql). Crea una copia de seguridad de seguridad antes de restaurar y borra todas las sesiones después de restaurar por seguridad.
- **Autenticación**: Requiere privilegios de administrador, sesión válida y token CSRF
- **Cuerpo de la solicitud**: FormData con un campo de archivo llamado `database`
  - El archivo debe ser `.db`, `.sqlite`, `.sqlite3` (formato binario) o `.sql` (formato SQL)
  - Tamaño máximo de archivo: 200MB
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
  - `400`: No se proporcionó archivo, el tamaño del archivo excede el límite, formato de archivo no válido o verificación de integridad de la base de datos fallida
  - `401`: No autorizado - Sesión o token CSRF no válido
  - `403`: Prohibido - Se requieren privilegios de administrador
  - `500`: Error al restaurar la base de datos (la base de datos original se restaura desde la copia de seguridad de seguridad si falla la restauración)
- **Notas**:
  - Solo accesible para usuarios administradores
  - Crea automáticamente una copia de seguridad de seguridad antes de restaurar
  - Compatible con ambos formatos binario (.db) y SQL (.sql)
  - Valida la integridad de la base de datos después de restaurar
  - Si la restauración falla, restaura automáticamente desde la copia de seguridad de seguridad
  - Todas las sesiones se borran después de una restauración exitosa por seguridad
  - Devuelve `requiresReauth: true` para indicar que el usuario necesita iniciar sesión nuevamente
  - La operación de restauración se registra en el registro de auditoría
  - Para el formato SQL, valida el contenido SQL antes de la ejecución
  - La conexión a la base de datos se reinicializa después de restaurar
  - Todas las cachés se invalidan después de restaurar

## Marcas de tiempo de copia de seguridad {/* #backup-timestamps */}

### Obtener marcas de tiempo de la última copia de seguridad - `/api/backups/last-timestamps` {/* #get-last-backup-timestamps---apibackupslast-timestamps */}
- **Punto final**: `/api/backups/last-timestamps`
- **Método**: GET
- **Descripción**: Recupera la marca de tiempo de la última copia de seguridad para cada combinación servidor-copia de seguridad. Devuelve un mapa para búsqueda fácil.
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
  - `500`: Error al obtener las marcas de tiempo de la última copia de seguridad
- **Notas**:
  - Devuelve tanto un mapa (para búsqueda fácil por `server_id:backup_name`) como formato de matriz sin procesar
  - Incluye encabezados de control de caché para evitar el almacenamiento en caché
  - Útil para rastrear los tiempos de la última copia de seguridad en todas las combinaciones servidor-copia de seguridad
  - Las marcas de tiempo están en formato ISO

## Gestión de Registros de la Aplicación {/* #application-logs-management */}

### Obtener Registros de la Aplicación - `/api/application-logs` {/* #get-application-logs---apiapplication-logs */}
- **Punto final**: `/api/application-logs`
- **Método**: GET
- **Descripción**: Recupera entradas de registro de la aplicación desde archivos de registro. Compatible con la lectura de archivos de registro actuales y rotados con funcionalidad de cola.
- **Autenticación**: Requiere privilegios de administrador, sesión válida y token CSRF
- **Parámetros de consulta**:
  - `file` (opcional): Nombre del archivo de registro a leer - `application.log`, `application.log.1`, `application.log.2`, etc. Si no se proporciona, devuelve la lista de archivos disponibles
  - `tail` (opcional): Número de líneas a devolver desde el final del archivo (predeterminado: 1000, mín: 1, máx: 10000)
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

- **Respuesta** (sin parámetro de archivo):

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

- **Respuestas de Error**:
  - `400`: Parámetro de cola no válido (debe ser 1-10000) o formato de parámetro de archivo no válido
  - `401`: No autorizado - Sesión o token CSRF inválido
  - `403`: Prohibido - Se requieren privilegios de administrador
  - `404`: Archivo de registro no encontrado
  - `500`: Error al leer el archivo de registro
- **Notas**:
  - Solo accesible para usuarios administradores
  - Admite la lectura del archivo de registro actual y archivos de registro rotados (hasta 10 archivos rotados)
  - Devuelve las últimas N líneas (cola) del archivo de registro especificado
  - El nombre del archivo de registro se determina mediante una variable de entorno (predeterminada: `application.log`)
  - Devuelve la lista de archivos de registro disponibles cuando no se proporciona el parámetro de archivo
  - Los nombres de archivo se validan para prevenir ataques de traversía de directorio
  - Los archivos rotados se numeran secuencialmente (`.1`, `.2`, etc.)

### Exportar Registros de la Aplicación - `/api/application-logs/export` {/* #export-application-logs---apiapplication-logsexport */}
- **Punto final**: `/api/application-logs/export`
- **Método**: GET
- **Descripción**: Exporta entradas de registro de la aplicación en formato de texto filtrado. Admite filtrado por nivel de registro y cadena de búsqueda.
- **Autenticación**: Requiere privilegios de administrador, sesión válida y token CSRF
- **Parámetros de consulta**:
  - `file` (obligatorio): Nombre del archivo de registro a exportar - `application.log`, `application.log.1`, `application.log.2`, etc.
  - `logLevels` (opcional): Lista separada por comas de niveles de registro a incluir - `INFO`, `WARN`, `ERROR` (predeterminado: `INFO,WARN,ERROR`)
  - `search` (opcional): Cadena de búsqueda para filtrar líneas de registro (no distingue mayúsculas/minúsculas)
- **Respuesta**:
  - Content-Type: `text/plain`
  - Content-Disposition: `attachment; filename="duplistatus-logs-YYYY-MM-DDTHH-MM-SS.txt"`
  - Contenido de registro filtrado como texto plano
- **Respuestas de Error**:
  - `400`: El parámetro de archivo es obligatorio o formato de parámetro de archivo no válido
  - `401`: No autorizado - Sesión o token CSRF inválido
  - `403`: Prohibido - Se requieren privilegios de administrador
  - `500`: Error al exportar los registros
- **Notas**:
  - Solo accesible para usuarios administradores
  - Exporta entradas de registro filtradas según criterios de nivel de registro y búsqueda
  - Admite filtrado por niveles de registro: `INFO`, `WARN`, `ERROR`
  - El filtrado por cadena de búsqueda no distingue mayúsculas/minúsculas
  - Las líneas vacías se filtran automáticamente
  - El nombre del archivo de registro se determina mediante una variable de entorno (predeterminada: `application.log`)
  - Los nombres de archivo se validan para prevenir ataques de traversía de directorio
  - El archivo exportado incluye marca de tiempo en el nombre de archivo
  - Útil para análisis externos y resolución de problemas
