# Administración {/* #administration */}

## Recopilar Copias de Seguridad - `/api/backups/collect` {/* #collect-backups---apibackupscollect */}
- **Endpoint**: `/api/backups/collect`
- **Método**: POST
- **Descripción**: Recopila datos de copia de seguridad directamente desde un servidor Duplicati a través de su API. Este endpoint detecta automáticamente el mejor protocolo de conexión (HTTPS con validación SSL, HTTPS con certificados autofirmados o HTTP como alternativa) y se conecta al servidor Duplicati para recuperar la información de copia de seguridad y procesarla en la base de datos local.
- **Autenticación**: Requiere una sesión válida y un token CSRF
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
  - `400`: Parámetros de solicitud no válidos o conexión fallida
  - `500`: Error del servidor durante la recolección de copias de seguridad
- **Notas**: 
  - El endpoint detecta automáticamente el protocolo de conexión óptimo (HTTPS → HTTPS con certificados autofirmados → HTTP)
  - Los intentos de detección de protocolo se realizan en orden de preferencia de seguridad
  - Los tiempos de espera de conexión son configurables a través de variables de entorno
  - Registra los datos recopilados en modo de desarrollo para depuración
  - Asegura que la configuración de copia de seguridad esté completa para todos los servidores y copias de seguridad
  - Usa el puerto predeterminado 8200 si no se especifica
  - El protocolo detectado y la URL del servidor se almacenan automáticamente en la base de datos
  - `serverAlias` se recupera de la base de datos y puede estar vacío si no se ha establecido un alias
  - El frontend debe usar `serverAlias || serverName` para fines de visualización
  - Soporta tanto la descarga de JSON como los métodos de recolección de API directos

## Limpiar Copias de Seguridad - `/api/backups/cleanup` {/* #cleanup-backups---apibackupscleanup */}
- **Endpoint**: `/api/backups/cleanup`
- **Método**: POST
- **Descripción**: Elimina datos de copia de seguridad antiguos según el período de retención. Este endpoint ayuda a gestionar el tamaño de la base de datos eliminando registros de copia de seguridad desactualizados mientras se conservan los datos recientes e importantes.
- **Autenticación**: Requiere una sesión válida y un token CSRF
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
  - `401`: No autorizado - Sesión o token CSRF no válidos
  - `400`: Período de retención no válido especificado
  - `500`: Error del servidor durante la operación de limpieza con información detallada del error
- **Notas**: 
  - La operación de limpieza es irreversible
  - Los datos de copia de seguridad se eliminan permanentemente de la base de datos
  - Los registros de máquinas se conservan incluso si se eliminan todas las copias de seguridad
  - Cuando se selecciona "Eliminar todos los datos", se eliminan todas las máquinas y copias de seguridad y se borra la configuración
  - El informe de errores mejorado incluye detalles y traza de la pila en modo de desarrollo
  - Soporta tanto la retención basada en tiempo como la eliminación completa de datos

## Eliminar Trabajo de Copia de Seguridad - `/api/backups/delete-job` {/* #delete-backup-job---apibackupsdelete-job */}
- **Endpoint**: `/api/backups/delete-job`
- **Método**: DELETE
- **Descripción**: Elimina todos los registros de copia de seguridad para una combinación específica de servidor-copia de seguridad. Este endpoint solo está disponible en modo de desarrollo.
- **Autenticación**: Requiere una sesión válida y un token CSRF
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
  - `401`: No autorizado - Sesión o token CSRF no válidos
  - `403`: La eliminación de trabajos de copia de seguridad solo está disponible en modo de desarrollo
  - `400`: Se requieren el ID del servidor y el nombre de la copia de seguridad
  - `404`: No se encontraron copias de seguridad para eliminar
  - `500`: Error del servidor durante la eliminación con información detallada del error
- **Notas**: 
  - Esta operación solo está disponible en modo de desarrollo
  - Esta operación es irreversible
  - Todos los registros de copia de seguridad para la combinación servidor-copia de seguridad especificada se eliminarán permanentemente
  - Devuelve el recuento de copias de seguridad eliminadas y la información del servidor
  - Usa el alias del servidor para mostrar si está disponible, de lo contrario, vuelve al nombre del servidor

## Sincronizar Programas de Copia de Seguridad - `/api/backups/sync-schedule` {/* #sync-backup-schedules---apibackupssync-schedule */}
- **Endpoint**: `/api/backups/sync-schedule`
- **Method**: POST
- **Descripción**: Sincroniza la información del programa de copia de seguridad desde un servidor Duplicati. Este endpoint se conecta al servidor, recupera la información del programa para todas las copias de seguridad y actualiza la configuración local de copia de seguridad con los detalles del programa, incluyendo intervalos de repetición, días de la semana permitidos y horas del programa.
- **Autenticación**: Requiere una sesión válida y un token CSRF
- **Cuerpo de la solicitud**:

  ```json
  {
    "hostname": "duplicati-server.local",
    "port": 8200,
    "password": "your-password",
    "serverId": "optional-server-id"
  }
  ```

O con solo serverId (usa la contraseña almacenada):

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
  - `400`: Parámetros de solicitud no válidos, falta el nombre de host/contraseña cuando no se proporciona serverId, o falló la conexión
  - `404`: Servidor no encontrado (cuando se proporciona serverId) o no hay contraseña almacenada para el servidor
  - `500`: Error del servidor durante la sincronización del programa
- **Notas**: 
  - El endpoint detecta automáticamente el protocolo de conexión óptimo (HTTPS → HTTPS con firma autofirmada → HTTP)
  - Puede ser llamado con solo serverId para usar las credenciales del servidor almacenadas
  - Puede ser llamado con serverId y nuevas credenciales para actualizar los detalles de conexión del servidor
  - Puede ser llamado con nombre de host/puerto/contraseña sin serverId para nuevos servidores
  - Actualiza la configuración de copia de seguridad con la información del programa, incluyendo:
    - `expectedInterval`: El intervalo de repetición (por ejemplo, "Diario", "Semanal", "Mensual")
    - `allowedWeekDays`: Matriz de días de la semana permitidos (0=Domingo, 1=Lunes, etc.)
    - `time`: La hora programada para la copia de seguridad
  - Procesa todas las copias de seguridad encontradas en el servidor
  - Devuelve estadísticas sobre las copias de seguridad procesadas y cualquier error encontrado
  - Registra eventos de auditoría para operaciones de sincronización exitosas y fallidas
  - Usa el puerto predeterminado 8200 si no se especifica

## Probar Conexión del Servidor - `/api/servers/test-connection` {/* #test-server-connection---apiserverstest-connection */}
- **Endpoint**: `/api/servers/test-connection`
- **Method**: POST
- **Descripción**: Prueba la conexión a un servidor Duplicati para verificar que es accesible.
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
  - El endpoint valida el formato de la URL y prueba la conectividad
  - Devuelve éxito si el servidor responde con un estado 401 (esperado para el endpoint de inicio de sesión sin credenciales)
  - Prueba la conexión al endpoint de inicio de sesión del servidor Duplicati
  - Soporta ambos protocolos HTTP y HTTPS
  - Usa la configuración de tiempo de espera para la prueba de conexión

## Obtener URL del Servidor - `/api/servers/:serverId/server-url` {/* #get-server-url---apiserversserveridserver-url */}
- **Endpoint**: `/api/servers/:serverId/server-url`
- **Method**: GET
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

- **Respuestas de error**:
  - `404`: Servidor no encontrado
  - `500`: Error del servidor
- **Notas**:
  - Devuelve la URL del servidor para un servidor específico
  - Se utiliza para la gestión de conexiones de servidores
  - Devuelve una cadena vacía si no se ha establecido ninguna URL de servidor

## Actualizar URL del servidor - `/api/servers/:serverId/server-url` {/* #update-server-url---apiserversserveridserver-url */}
- **Punto final**: `/api/servers/:serverId/server-url`
- **Método**: PATCH
- **Descripción**: Actualiza la URL del servidor para un servidor específico.
- **Autenticación**: Requiere una sesión válida y un token CSRF
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
  - `401`: No autorizado - Sesión o token CSRF no válidos
  - `400`: Formato de URL no válido
  - `404`: Servidor no encontrado
  - `500`: Error del servidor durante la actualización
- **Notas**: 
  - El punto final valida el formato de la URL antes de actualizar
  - Las URLs de servidores vacías o nulas están permitidas
  - Soporta protocolos HTTP y HTTPS
  - Devuelve la información del servidor actualizada

## Obtener contraseña del servidor - `/api/servers/:serverId/password` {/* #get-server-password---apiserversserveridpassword */}
- **Punto final**: `/api/servers/:serverId/password`
- **Método**: GET
- **Descripción**: Recupera un token CSRF para operaciones de contraseña del servidor.
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
  - `401`: Sesión no válida o expirada
  - `500`: Error al generar el token CSRF
- **Notas**:
  - Devuelve el token CSRF para su uso con operaciones de actualización de contraseña
  - La sesión debe ser válida para generar el token

## Actualizar contraseña del servidor - `/api/servers/:serverId/password` {/* #update-server-password---apiserversserveridpassword */}
- **Punto final**: `/api/servers/:serverId/password`
- **Método**: PATCH
- **Descripción**: Actualiza la contraseña para un servidor específico.
- **Autenticación**: Requiere una sesión válida y un token CSRF
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
  - `400`: La contraseña debe ser una cadena
  - `401`: No autorizado - Sesión o token CSRF no válidos
  - `500`: Error al actualizar la contraseña
- **Notas**:
  - La contraseña puede ser una cadena vacía para borrar la contraseña
  - La contraseña se almacena de forma segura utilizando el sistema de gestión de secretos

## Gestión de usuarios {/* #user-management */}

### Listar usuarios - `/api/users` {/* #list-users---apiusers */}
- **Punto final**: `/api/users`
- **Método**: GET
- **Descripción**: Lista todos los usuarios con paginación y filtrado de búsqueda opcional. Devuelve información del usuario, incluyendo historial de inicio de sesión y estado de la cuenta.
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
  - `401`: No autorizado - Sesión o token CSRF no válido
  - `403`: Prohibido - Se requieren privilegios de administrador
  - `500`: Error interno del servidor
- **Notas**:
  - Solo accesible para usuarios administradores
  - Soporta paginación y filtrado de búsqueda
  - Devuelve el estado de la cuenta de usuario, incluyendo el estado de bloqueo

### Crear usuario - `/api/users` {/* #create-user---apiusers */}
- **Endpoint**: `/api/users`
- **Método**: POST
- **Descripción**: Crea una nueva cuenta de usuario. Puede generar una contraseña temporal o usar una contraseña proporcionada.
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
  - `isAdmin`: Opcional, predeterminado falso
  - `requirePasswordChange`: Opcional, predeterminado verdadero
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

- `temporaryPassword` solo se incluye si se generó una contraseña
- **Respuestas de error**:
  - `400`: Formato de nombre de usuario no válido, violación de la política de contraseñas o errores de validación
  - `401`: No autorizado - Sesión o token CSRF no válido
  - `403`: Prohibido - Se requieren privilegios de administrador
  - `409`: El nombre de usuario ya existe
  - `500`: Error interno del servidor
- **Notas**:
  - Solo accesible para usuarios administradores
  - El nombre de usuario es insensible a mayúsculas y minúsculas y se almacena en minúsculas
  - Si no se proporciona una contraseña, se genera una contraseña temporal segura de 12 caracteres
  - Las contraseñas temporales generadas solo se devuelven una vez en la respuesta
  - La creación de usuarios se registra en el registro de auditoría

### Actualizar usuario - `/api/users/:id` {/* #update-user---apiusersid */}
- **Endpoint**: `/api/users/:id`
- **Método**: PATCH
- **Descripción**: Actualiza la información del usuario, incluyendo el nombre de usuario, el estado de administrador, la necesidad de cambio de contraseña y el restablecimiento de contraseña.
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
  - `409`: El nombre de usuario ya existe (si se está cambiando el nombre de usuario)
  - `500`: Error interno del servidor
- **Notas**:
  - Solo accesible para usuarios administradores
  - Los cambios de nombre de usuario se validan para unicidad
  - El restablecimiento de contraseña genera una contraseña temporal segura de 12 caracteres
  - Todos los cambios se registran en el registro de auditoría

### Eliminar usuario - `/api/users/:id` {/* #delete-user---apiusersid */}
- **Endpoint**: `/api/users/:id`
- **Método**: DELETE
- **Descripción**: Elimina una cuenta de usuario. Evita eliminar tu propia cuenta o la última cuenta de administrador.
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
  - `400`: No se puede eliminar su propia cuenta o la última cuenta de administrador
  - `401`: No autorizado - Sesión o token CSRF no válido
  - `403`: Prohibido - Se requieren privilegios de administrador
  - `404`: Usuario no encontrado
  - `500`: Error interno del servidor
- **Notas**:
  - Solo accesible para usuarios administradores
  - No se puede eliminar su propia cuenta
  - No se puede eliminar la última cuenta de administrador (debe quedar al menos un administrador)
  - La eliminación de usuarios se registra en el registro de auditoría
  - Las sesiones asociadas se eliminan automáticamente (en cascada)

## Gestión del Registro de Auditoría {/* #audit-log-management */}

### Listar Registros de Auditoría - `/api/audit-log` {/* #list-audit-logs---apiaudit-log */}
- **Endpoint**: `/api/audit-log`
- **Método**: GET
- **Descripción**: Recupera entradas del registro de auditoría con capacidades de filtrado, paginación y búsqueda. Soporta paginación basada en páginas y desplazamiento.
- **Autenticación**: Requiere sesión y token CSRF válidos (se requiere usuario registrado)
- **Parámetros de consulta**:
  - `page` (opcional): Número de página para paginación basada en páginas
  - `offset` (opcional): Desplazamiento para paginación basada en desplazamiento (tiene prioridad sobre la página)
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
  - `401`: No autorizado - Sesión o token CSRF no válido
  - `500`: Error interno del servidor
- **Notas**:
  - Soporta paginación basada en páginas (`page`) y basada en desplazamiento (`offset`)
  - El campo `details` contiene JSON analizado con contexto adicional
  - Todas las consultas del registro de auditoría se registran

### Obtener Valores de Filtro del Registro de Auditoría - `/api/audit-log/filters` {/* #get-audit-log-filter-values---apiaudit-logfilters */}
- **Endpoint**: `/api/audit-log/filters`
- **Método**: GET
- **Descripción**: Recupera valores de filtro únicos disponibles para filtrar registros de auditoría. Devuelve todas las acciones, categorías y estados distintos que existen en la base de datos del registro de auditoría. Útil para poblar listas desplegables de filtros en la interfaz de usuario.
- **Autenticación**: Requiere sesión y token CSRF válidos (se requiere usuario registrado)
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
  - Los valores están ordenados alfabéticamente
  - Se devuelven matrices vacías si no existen datos o en caso de error
  - Utilizado por el visor de registro de auditoría para poblar listas desplegables de filtros dinámicamente

### Descargar Registros de Auditoría - `/api/audit-log/download` {/* #download-audit-logs---apiaudit-logdownload */}
- **Endpoint**: `/api/audit-log/download`
- **Método**: GET
- **Descripción**: Descarga registros de auditoría en formato CSV o JSON con filtrado opcional. Útil para análisis externo y generación de informes.
- **Autenticación**: Requiere sesión y token CSRF válidos (se requiere usuario registrado)
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
  - JSON array of audit log entries
- **Error Responses**:
  - `400`: No logs to export
  - `401`: Unauthorized - Invalid session or CSRF token
  - `500`: Internal server error
- **Notes**:
  - Export limit is 10,000 records
  - CSV format escapes special characters properly
  - Details field in CSV is JSON-stringified
  - File name includes the current date

### Cleanup Audit Logs - `/api/audit-log/cleanup` {/* #cleanup-audit-logs---apiaudit-logcleanup */}
- **Endpoint**: `/api/audit-log/cleanup`
- **Method**: POST
- **Description**: Activa manualmente la limpieza de registros de auditoría antiguos según el período de retención. Soporta el modo de ejecución en seco para previsualizar lo que se eliminaría.
- **Autenticación**: Requiere privilegios de administrador, sesión válida y token CSRF
- **Cuerpo de la solicitud**:

  ```json
  {
    "retentionDays": 90,
    "dryRun": false
  }
  ```

- `retentionDays` (optional): Override retention days (30-365), otherwise uses configured value
  - `dryRun` (optional): If true, only returns what would be deleted without actually deleting
- **Response** (dry run):

  ```json
  {
    "dryRun": true,
    "wouldDeleteCount": 50,
    "oldestRemaining": "2024-01-01T00:00:00Z",
    "retentionDays": 90,
    "cutoffDate": "2024-01-01"
  }
  ```

- **Response** (actual cleanup):

  ```json
  {
    "success": true,
    "deletedCount": 50,
    "oldestRemaining": "2024-01-01T00:00:00Z",
    "retentionDays": 90
  }
  ```

- **Error Responses**:
  - `400`: Invalid retention days (must be 30-365)
  - `401`: Unauthorized - Invalid session or CSRF token
  - `403`: Forbidden - Admin privileges required
  - `500`: Internal server error
- **Notes**:
  - Only accessible to admin users
  - Default retention is 90 days if not configured
  - Cleanup operation is logged to audit log
  - Dry-run mode is useful for previewing cleanup impact

### Get Audit Log Retention - `/api/audit-log/retention` {/* #get-audit-log-retention---apiaudit-logretention */}
- **Endpoint**: `/api/audit-log/retention`
- **Method**: GET
- **Description**: Recupera la configuración actual de retención de registros de auditoría en días.
- **Authentication**: Requires valid session and CSRF token (no logged-in user required)
- **Response**:

  ```json
  {
    "retentionDays": 90
  }
  ```

- **Error Responses**:
  - `500`: Internal server error
- **Notes**:
  - Default retention is 90 days if not configured
  - Can be accessed without authentication (read-only)

### Update Audit Log Retention - `/api/audit-log/retention` {/* #update-audit-log-retention---apiaudit-logretention */}
- **Endpoint**: `/api/audit-log/retention`
- **Method**: PATCH
- **Description**: Actualiza el período de retención de registros de auditoría en días. Esta configuración determina cuánto tiempo se conservan los registros de auditoría antes de la limpieza automática.
- **Autenticación**: Requiere privilegios de administrador, sesión válida y token CSRF
- **Cuerpo de la solicitud**:

  ```json
  {
    "retentionDays": 120
  }
  ```

- `retentionDays`: Required, must be between 30 and 365 days
- **Response**:

  ```json
  {
    "success": true,
    "retentionDays": 120
  }
  ```

- **Error Responses**:
  - `400`: Invalid retention days (must be 30-365)
  - `401`: Unauthorized - Invalid session or CSRF token
  - `403`: Forbidden - Admin privileges required
  - `500`: Internal server error
- **Notes**:
  - Only accessible to admin users
  - Configuration change is logged to audit log
  - Retention period affects automatic and manual cleanup operations

## Claves de API {/* #api-keys */}

### Listar claves de API - `/api/api-keys` {/* #list-api-keys---apiapi-keys */}
- **Punto final**: `/api/api-keys`
- **Método**: GET
- **Descripción**: Lista todas las claves de API. Los secretos nunca se devuelven; cada clave incluye una huella digital (`Qk7v…3xTa`).
- **Autenticación**: Requiere privilegios de administrador, sesión válida y token CSRF
- **Respuestas de error**:
  - `401`: No autorizado - Sesión o token CSRF no válido
  - `403`: Prohibido - Se requieren privilegios de administrador
  - `500`: Error interno del servidor

### Crear clave de API - `/api/api-keys` {/* #create-api-key---apiapi-keys */}
- **Punto final**: `/api/api-keys`
- **Método**: POST
- **Descripción**: Crea una clave de API con ámbito. El secreto en texto plano solo se devuelve en esta respuesta.
- **Autenticación**: Requiere privilegios de administrador, sesión válida y token CSRF
- **Cuerpo de la solicitud**:

  ```json
  {
    "name": "Duplicati uploads",
    "scope": "upload",
    "description": "Optional",
    "expiresAt": null
  }
  ```

- **Respuestas de error**:
  - `400`: Falta el nombre o ámbito no válido (`upload` o `read`)
  - `401`: No autorizado - Sesión o token CSRF no válido
  - `403`: Prohibido - Se requieren privilegios de administrador
  - `500`: Error interno del servidor

### Actualizar clave de API - `/api/api-keys/:id` {/* #update-api-key---apiapi-keysid */}
- **Punto final**: `/api/api-keys/:id`
- **Método**: PATCH
- **Descripción**: Habilita o deshabilita una clave.
- **Autenticación**: Requiere privilegios de administrador, sesión válida y token CSRF

### Eliminar clave de API - `/api/api-keys/:id` {/* #delete-api-key---apiapi-keysid */}
- **Punto final**: `/api/api-keys/:id`
- **Método**: DELETE
- **Descripción**: Elimina una clave. Los clientes existentes que usen ese secreto pierden inmediatamente el acceso.
- **Autenticación**: Requiere privilegios de administrador, sesión válida y token CSRF

## Gestión de base de datos {/* #database-management */}

### Copia de seguridad de la base de datos - `/api/database/backup` {/* #backup-database---apidatabasebackup */}
- **Punto final**: `/api/database/backup`
- **Método**: GET
- **Descripción**: Crea una copia de seguridad de la base de datos en formato binario (.db) o SQL (.sql). El archivo de copia de seguridad se descarga automáticamente con un nombre de archivo con marca de tiempo.
- **Autenticación**: Requiere privilegios de administrador, sesión válida y token CSRF
- **Parámetros de consulta**:
  - `format` (opcional): Formato de copia de seguridad - `db` (binario) o `sql` (volcado SQL). Predeterminado: `db`
- **Respuesta**:
  - Content-Type: `application/octet-stream` (para .db) o `text/plain` (para .sql)
  - Content-Disposition: `attachment; filename="duplistatus-backup-YYYY-MM-DDTHH-MM-SS.db"` o `.sql`
  - Contenido del archivo binario (para .db) o contenido de texto SQL (para .sql)
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
  - Los archivos temporales se limpian automáticamente después de la descarga

### Restaurar base de datos - `/api/database/restore` {/* #restore-database---apidatabaserestore */}
- **Punto final**: `/api/database/restore`
- **Método**: POST
- **Descripción**: Restaura la base de datos desde un archivo de copia de seguridad (.db o .sql). Crea una copia de seguridad de seguridad antes de restaurar y borra todas las sesiones después de restaurar por seguridad.
- **Autenticación**: Requiere privilegios de administrador, sesión válida y token CSRF
- **Cuerpo de la solicitud**: FormData con un campo de archivo llamado `database`
  - El archivo debe ser `.db`, `.sqlite`, `.sqlite3` (formato binario) o `.sql` (formato SQL)
  - Tamaño máximo de archivo: 100MB
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
  - `400`: No se proporcionó archivo, tamaño de archivo excede el límite, formato de archivo no válido o falló la comprobación de integridad de la base de datos
  - `401`: No autorizado - Sesión o token CSRF no válido
  - `403`: Prohibido - Se requieren privilegios de administrador
  - `500`: Falló la restauración de la base de datos (se restaura la base de datos original desde la copia de seguridad de seguridad si la restauración falla)
- **Notas**:
  - Solo accesible para usuarios administradores
  - Crea automáticamente una copia de seguridad de seguridad antes de la restauración
  - Soporta ambos formatos binarios (.db) y SQL (.sql)
  - Valida la integridad de la base de datos después de la restauración
  - Si la restauración falla, se restaura automáticamente desde la copia de seguridad de seguridad
  - Todas las sesiones se borran después de una restauración exitosa por seguridad
  - Devuelve `requiresReauth: true` para indicar que el usuario necesita iniciar sesión nuevamente
  - La operación de restauración se registra en el registro de auditoría
  - Para el formato SQL, valida el contenido SQL antes de la ejecución
  - La conexión a la base de datos se reinicializa después de la restauración
  - Todas las cachés se invalidan después de la restauración

## Marcas de tiempo de Copias de Seguridad {/* #backup-timestamps */}

### Obtener Marcas de Tiempo de Últimas Copias de Seguridad - `/api/backups/last-timestamps` {/* #get-last-backup-timestamps---apibackupslast-timestamps */}
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
  - `500`: Falló la recuperación de las marcas de tiempo de las últimas copias de seguridad
- **Notas**:
  - Devuelve tanto un mapa (para facilitar la búsqueda por `server_id:backup_name`) como un formato de matriz sin procesar
  - Incluye encabezados de control de caché para evitar el almacenamiento en caché
  - Útil para rastrear las últimas veces de copia de seguridad en todas las combinaciones servidor-copia de seguridad
  - Las marcas de tiempo están en formato ISO

## Gestión de Registros de la Aplicación {/* #application-logs-management */}

### Obtener Registros de la Aplicación - `/api/application-logs` {/* #get-application-logs---apiapplication-logs */}
- **Endpoint**: `/api/application-logs`
- **Método**: GET
- **Descripción**: Recupera las entradas de registro de la aplicación desde los archivos de registro. Soporta la lectura de archivos de registro actuales y rotados con funcionalidad de cola.
- **Autenticación**: Requiere privilegios de administrador, sesión válida y token CSRF
- **Parámetros de consulta**:
  - `file` (opcional): Nombre del archivo de registro a leer - `application.log`, `application.log.1`, `application.log.2`, etc. Si no se proporciona, devuelve la lista de archivos disponibles
  - `tail` (opcional): Número de líneas a devolver desde el final del archivo (predeterminado: 1000, mínimo: 1, máximo: 10000)
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

- **Respuestas de error**:
  - `400`: Parámetro de cola no válido (debe ser 1-10000) o formato de parámetro de archivo no válido
  - `401`: No autorizado - Sesión o token CSRF no válido
  - `403`: Prohibido - Se requieren privilegios de administrador
  - `404`: Archivo de registro no encontrado
  - `500`: Falló la lectura del archivo de registro
- **Notas**:
  - Solo accesible para usuarios administradores
  - Soporta la lectura del archivo de registro actual y los archivos de registro rotados (hasta 10 archivos rotados)
  - Devuelve las últimas N líneas (cola) del archivo de registro especificado
  - El nombre del archivo de registro se determina por la variable de entorno (predeterminado: `application.log`)
  - Devuelve la lista de archivos de registro disponibles cuando no se proporciona el parámetro de archivo
  - Los nombres de archivo se validan para prevenir ataques de recorrido de directorios
  - Los archivos rotados se numeran secuencialmente (`.1`, `.2`, etc.)

### Exportar Registros de la Aplicación - `/api/application-logs/export` {/* #export-application-logs---apiapplication-logsexport */}
- **Punto final**: `/api/application-logs/export`
- **Método**: GET
- **Descripción**: Exporta entradas de registro de la aplicación en formato de texto filtrado. Soporta filtrado por nivel de registro y cadena de búsqueda.
- **Autenticación**: Requiere privilegios de administrador, sesión válida y token CSRF
- **Parámetros de consulta**:
  - `file` (obligatorio): Nombre del archivo de registro a exportar - `application.log`, `application.log.1`, `application.log.2`, etc.
  - `logLevels` (opcional): Lista separada por comas de niveles de registro a incluir - `INFO`, `WARN`, `ERROR` (predeterminada: `INFO,WARN,ERROR`)
  - `search` (opcional): Cadena de búsqueda para filtrar líneas de registro (sin distinguir mayúsculas y minúsculas)
- **Respuesta**:
  - Content-Type: `text/plain`
  - Content-Disposition: `attachment; filename="duplistatus-logs-YYYY-MM-DDTHH-MM-SS.txt"`
  - Contenido de registro filtrado como texto plano
- **Respuestas de error**:
  - `400`: Parámetro de archivo es obligatorio o formato de parámetro de archivo inválido
  - `401`: No autorizado - Sesión o token CSRF inválido
  - `403`: Prohibido - Se requieren privilegios de administrador
  - `500`: Error al exportar los registros
- **Notas**:
  - Solo accesible para usuarios administradores
  - Exporta entradas de registro filtradas basadas en el nivel de registro y criterios de búsqueda
  - Soporta filtrado por niveles de registro: `INFO`, `WARN`, `ERROR`
  - El filtrado por cadena de búsqueda no distingue mayúsculas y minúsculas
  - Las líneas vacías se filtran automáticamente
  - El nombre del archivo de registro se determina por la variable de entorno (predeterminada: `application.log`)
  - Los nombres de archivo se validan para prevenir ataques de recorrido de directorios
  - El archivo exportado incluye la marca de tiempo en el nombre del archivo
  - Útil para análisis externo y solución de problemas
