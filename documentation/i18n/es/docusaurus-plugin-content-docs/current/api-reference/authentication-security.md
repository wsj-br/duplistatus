# Autenticación y seguridad {/* #authentication--security */}

La API utiliza una combinación de autenticación basada en sesiones y protección CSRF para todas las operaciones de escritura en la base de datos a fin de evitar accesos no autorizados y posibles ataques de denegación de servicio. Las APIs externas utilizadas por Duplicati y Homepage permanecen exentas de CSRF. De forma opcional, pueden requerir una clave de API con ámbito y/o una lista de IPs permitidas (ambas desactivadas de forma predeterminada). `/api/upload` también tiene un límite de tamaño de cuerpo configurable y un límite de tasa.

## Autenticación basada en sesiones {/* #session-based-authentication */}

Los endpoints protegidos requieren una cookie de sesión válida y un token CSRF. El sistema de sesiones proporciona una autenticación segura para todas las operaciones protegidas.

### Gestión de sesiones {/* #session-management */}
1. **Crear sesión**: POST a `/api/session` para crear una nueva sesión
2. **Obtener token CSRF**: GET `/api/csrf` para obtener un token CSRF para la sesión
3. **Incluir en las solicitudes**: Envíe la cookie de sesión y el token CSRF con las solicitudes protegidas
4. **Validar sesión**: GET `/api/session` para comprobar si la sesión sigue siendo válida
5. **Eliminar sesión**: DELETE `/api/session` para cerrar sesión y borrar la sesión

### Protección CSRF {/* #csrf-protection */}
Todas las operaciones que modifican el estado requieren un token CSRF válido que coincida con la sesión actual. El token CSRF debe incluirse en el encabezado `X-CSRF-Token` para los endpoints protegidos.

### Endpoints protegidos {/* #protected-endpoints */}
Todos los endpoints que modifican datos de la base de datos requieren autenticación de sesión y token CSRF:

- **Gestión del servidor**: `/api/servers/:id` (PATCH, DELETE), `/api/servers/:id/server-url` (PATCH), `/api/servers/:id/password` (PATCH, GET)
- **Gestión de la configuración**: `/api/configuration/email` (GET, POST, DELETE), `/api/configuration/unified` (GET), `/api/configuration/ntfy` (GET), `/api/configuration/notifications` (GET, POST), `/api/configuration/backup-settings` (POST), `/api/configuration/templates` (POST), `/api/configuration/overdue-tolerance` (GET, POST), `/api/configuration/daily-summary` (GET, POST), `/api/configuration/daily-summary/send` (POST), `/api/configuration/daily-summary/retry` (POST), `/api/configuration/daily-summary/preview` (POST)
- **Sistema de notificaciones**: `/api/notifications/test` (POST), `/api/notifications/preview` (POST)
- **Configuración de Cron**: `/api/cron-config` (GET, POST)
- **Proxy de Cron**: `/api/cron/*` (GET, POST): redirige solicitudes al servicio cron. POST requiere un administrador. El proceso cron se vincula a `127.0.0.1` de forma predeterminada; las rutas mutables del servicio cron requieren `X-Cron-Service-Secret` cuando `CRON_SERVICE_SECRET` está configurado.
- **Gestión de sesiones**: `/api/session` (POST, GET, DELETE), `/api/csrf` (GET)
- **Datos de gráficos**: `/api/chart-data/*` (GET)
- **Panel de control**: `/api/dashboard` (GET)
- **Detalles del servidor**: `/api/servers` (GET), `/api/servers/:id` (GET), `/api/detail/:serverId` (GET)
- **Registro de auditoría**: `/api/audit-log` (GET), `/api/audit-log/download` (GET), `/api/audit-log/filters` (GET), `/api/audit-log/retention` (PATCH), `/api/audit-log/cleanup` (POST): se requiere administrador para operaciones de escritura
- **Gestión de usuarios**: `/api/users` (GET, POST, PATCH, DELETE): se requiere administrador
- **Gestión de la base de datos**: `/api/database/backup` (GET), `/api/database/restore` (POST): se requiere administrador
- **Registros de la Aplicación**: `/api/application-logs` (GET), `/api/application-logs/export` (GET): se requiere administrador
- **Recopilación de copias de seguridad**: `/api/backups/collect` (POST): requiere sesión y token CSRF
- **Sincronización de programación de copias de seguridad**: `/api/backups/sync-schedule` (POST): requiere sesión y token CSRF
- **Comprobación de vencimiento**: `/api/notifications/check-overdue` (POST): requiere sesión y token CSRF
- **Borrar marcas de tiempo de vencimiento**: `/api/notifications/clear-overdue-timestamps` (POST): requiere sesión y token CSRF

### Endpoints externos {/* #external-endpoints */}
Estas rutas no utilizan cookies de sesión ni CSRF. La autenticación es opcional y se configura en Configuración:

- `/api/upload` - Subidas de datos de copias de seguridad desde Duplicati (clave de ámbito upload, límites de tamaño y tasa)
- `/api/lastbackup/:serverId` - Estado de la copia de seguridad más reciente (clave de ámbito read)
- `/api/lastbackups/:serverId` - Estado de las copias de seguridad más recientes (clave de ámbito read)
- `/api/summary` - Datos de resumen general (clave de ámbito read)
- `/api/health` - Endpoint de comprobación de estado de salud (nunca con clave; sondeo ligero de SQLite; límite de tasa por IP)
- `/api/ping` - Sondeo de conectividad (nunca con clave; límite de tasa por IP)

Cuando **Require API keys** está desactivado, las cuatro primeras rutas aceptan solicitudes con o sin clave: se registra una clave válida con ámbito coincidente; se ignora una clave incorrecta. Cuando el interruptor está activado, devuelven `401` sin una clave válida y `403` cuando el ámbito de la clave no coincide. `/api/health` e `/api/ping` nunca usan claves. Consulte [Claves de API](../user-guide/settings/api-keys-settings.md) y [Lista de IPs permitidas](../user-guide/settings/ip-allowlist-settings.md).

### Ejemplo de uso (sesión + CSRF) {/* #usage-example-session--csrf */}

```typescript
// 1. Create session
const sessionResponse = await fetch('/api/session', { method: 'POST' });
const { sessionId } = await sessionResponse.json();

// 2. Get CSRF token
const csrfResponse = await fetch('/api/csrf', {
  headers: { 'Cookie': `session=${sessionId}` }
});
const { csrfToken } = await csrfResponse.json();

// 3. Make protected request
const response = await fetch('/api/servers/server-id', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken,
    'Cookie': `session=${sessionId}`
  },
  body: JSON.stringify({
    alias: 'Updated Server Name',
    note: 'Updated notes'
  })
});
```

## Endpoints de autenticación {/* #authentication-endpoints */}

### Inicio de sesión - `/api/auth/login` {/* #login---apiauthlogin */}
- **Punto de conexión**: `/api/auth/login`
- **Método**: POST
- **Descripción**: Autentica un usuario y crea una sesión. Admite bloqueo de cuenta después de intentos fallidos y requisitos de cambio de contraseña.
- **Autenticación**: Requiere sesión válida y token CSRF (pero sin usuario conectado)
- **Cuerpo de la solicitud**:

  ```json
  {
    "username": "admin",
    "password": "password123"
  }
  ```

- **Respuesta** (éxito):

  ```json
  {
    "success": true,
    "user": {
      "id": "user-id",
      "username": "admin",
      "isAdmin": true,
      "mustChangePassword": false
    },
    "keyChanged": false
  }
  ```

- **Respuestas de error**: Todas las respuestas de error incluyen `error` (mensaje en inglés) e `errorCode` (código estable para traducción del lado del cliente).
  - `400`: Falta nombre de usuario o contraseña — `errorCode: "REQUIRED_CREDENTIALS"`
  - `401`: Nombre de usuario o contraseña no válidos — `errorCode: "INVALID_CREDENTIALS"`
  - `403`: Cuenta bloqueada debido a demasiados intentos de inicio de sesión fallidos — `errorCode: "ACCOUNT_LOCKED"` (incluye `lockedUntil`, `minutesRemaining`)
  - `500`: Error interno del servidor — `errorCode: "INTERNAL_ERROR"`
  - `503`: Base de datos no lista — `errorCode: "DATABASE_NOT_READY"`
- **Notas**:
  - La cuenta se bloquea después de 5 intentos de inicio de sesión fallidos durante 15 minutos
  - Los intentos de inicio de sesión fallidos se rastrean y registran
  - La cookie de sesión se establece automáticamente en la respuesta
  - Si el usuario tiene la bandera `mustChangePassword` establecida, debe redirigirse a la página de cambio de contraseña
  - Todos los intentos de inicio de sesión (exitosos y fallidos) se registran en el registro de auditoría

### Cerrar sesión - `/api/auth/logout` {/* #logout---apiauthlogout */}
- **Punto de conexión**: `/api/auth/logout`
- **Método**: POST
- **Descripción**: Cierra la sesión del usuario actual y destruye su sesión.
- **Autenticación**: Requiere sesión válida y token CSRF
- **Respuesta** (éxito):

  ```json
  {
    "success": true,
    "message": "Logged out successfully",
    "successCode": "LOGGED_OUT"
  }
  ```

- **Respuestas de error**: Incluyen `error` e `errorCode` para traducción del lado del cliente.
  - `400`: Sin sesión activa — `errorCode: "NO_ACTIVE_SESSION"`
  - `500`: Error interno del servidor — `errorCode: "INTERNAL_ERROR"`
- **Notas**:
  - La cookie de sesión se borra en la respuesta
  - El cierre de sesión se registra en el registro de auditoría
  - La sesión se invalida inmediatamente

### Obtener usuario actual - `/api/auth/me` {/* #get-current-user---apiauthme */}
- **Punto de conexión**: `/api/auth/me`
- **Método**: GET
- **Descripción**: Devuelve la información del usuario autenticado actual, o indica si no hay ningún usuario conectado.
- **Autenticación**: Requiere sesión válida (pero no se requiere usuario conectado)
- **Respuesta** (autenticado):

  ```json
  {
    "authenticated": true,
    "user": {
      "id": "user-id",
      "username": "admin",
      "isAdmin": true,
      "mustChangePassword": false
    }
  }
  ```

- **Respuesta** (no autenticado):

  ```json
  {
    "authenticated": false,
    "user": null
  }
  ```

- **Respuestas de error**: Incluyen `error` e `errorCode` para traducción del lado del cliente.
  - `500`: Error interno del servidor — `errorCode: "INTERNAL_ERROR"`
- **Notas**:
  - Puede llamarse sin un usuario conectado (devuelve `authenticated: false`)
  - Útil para verificar el estado de autenticación al cargar la página

### Cambiar contraseña - `/api/auth/change-password` {/* #change-password---apiauthchange-password */}
- **Punto de conexión**: `/api/auth/change-password`
- **Método**: POST
- **Descripción**: Cambia la contraseña del usuario autenticado actual. Si `mustChangePassword` está establecido, se omite la verificación de contraseña actual.
- **Autenticación**: Requiere sesión válida y token CSRF (usuario conectado requerido)
- **Cuerpo de la solicitud**:

  ```json
  {
    "currentPassword": "old-password",
    "newPassword": "new-secure-password"
  }
  ```

- `currentPassword`: Opcional si `mustChangePassword` es verdadero, requerido de lo contrario
  - `newPassword`: Requerido, debe cumplir con los requisitos de la política de contraseñas
- **Respuesta** (éxito):

  ```json
  {
    "success": true,
    "message": "Password changed successfully",
    "successCode": "PASSWORD_CHANGED"
  }
  ```

- **Respuestas de error**: Incluyen `error` e `errorCode` para traducción del lado del cliente. La violación de política puede incluir `validationErrors` (matriz de cadenas).
  - `400`: Falta nueva contraseña — `errorCode: "NEW_PASSWORD_REQUIRED"`
  - `400`: Violación de política de contraseña — `errorCode: "POLICY_NOT_MET"` (puede incluir `validationErrors`)
  - `400`: Nueva contraseña igual a la actual — `errorCode: "NEW_PASSWORD_SAME_AS_CURRENT"`
  - `401`: La contraseña actual es incorrecta — `errorCode: "CURRENT_PASSWORD_INCORRECT"`
  - `404`: Usuario no encontrado — `errorCode: "USER_NOT_FOUND"`
  - `500`: Error interno del servidor — `errorCode: "INTERNAL_ERROR"`
- **Notas**:
  - La nueva contraseña debe cumplir los requisitos de la directiva de contraseñas (longitud, complejidad, etc.)
  - Si el indicador `mustChangePassword` está activado, se omite la verificación de la contraseña actual
  - Tras cambiar la contraseña con éxito, el indicador `mustChangePassword` se borra
  - Los cambios de contraseña se registran en el registro de auditoría
  - La nueva contraseña debe ser diferente de la contraseña actual

### Comprobar Debe cambiar la contraseña de Administrador - `/api/auth/admin-must-change-password` {/* #check-admin-must-change-password---apiauthadmin-must-change-password */}
- **Endpoint**: `/api/auth/admin-must-change-password`
- **Método**: GET
- **Descripción**: Comprueba si el usuario administrador debe cambiar su contraseña. Este endpoint es público (no requiere autenticación), ya que solo devuelve un indicador booleano.
- **Respuesta**:

  ```json
  {
    "mustChangePassword": false
  }
  ```

- **Respuestas de error**:
  - `500`: Error interno del servidor (devuelve `mustChangePassword: false` en caso de error para evitar mostrar la sugerencia si hay un problema con la base de datos)
- **Notas**:
  - Endpoint público, no requiere autenticación
  - Devuelve `false` si el usuario administrador no existe
  - Se utiliza para determinar si debe mostrarse la sugerencia de cambio de contraseña
  - En caso de error, devuelve `false` para evitar mostrar la sugerencia si hay un problema con la base de datos

### Obtener directiva de contraseñas - `/api/auth/password-policy` {/* #get-password-policy---apiauthpassword-policy */}
- **Endpoint**: `/api/auth/password-policy`
- **Método**: GET
- **Descripción**: Devuelve la configuración de la directiva de contraseñas actual. Este endpoint es público (no requiere autenticación), ya que es necesario para la validación en el frontend.
- **Respuesta**:

  ```json
  {
    "minLength": 8,
    "requireUppercase": true,
    "requireLowercase": true,
    "requireNumbers": true,
    "requireSpecialChars": false
  }
  ```

- **Respuestas de error**: Incluyen `error` e `errorCode` para la traducción en el cliente.
  - `500`: Fallo al recuperar la directiva de contraseñas — `errorCode: "POLICY_RETRIEVE_FAILED"`
- **Notas**:
  - Endpoint público, no requiere autenticación
  - Utilizado por los componentes del frontend para mostrar los requisitos de contraseña y validar las contraseñas antes de enviarlas
  - La directiva se configura mediante variables de entorno (`PWD_ENFORCE`, `PWD_MIN_LEN`)
  - La comprobación de contraseña predeterminada (que evita el uso de la contraseña de administrador predeterminada) se aplica siempre, independientemente de la configuración de la directiva

### Códigos de error y de éxito de la API de autenticación (i18n) {/* #auth-api-error-and-success-codes-i18n */}

Los endpoints de autenticación devuelven un `errorCode` estable (y, en caso de éxito, `successCode`) además del campo legible para personas `error` o `message`. Los valores de `error` e `message` están en inglés. Los clientes deben utilizar los códigos para buscar las cadenas localizadas de modo que la interfaz de usuario muestre los mensajes en el idioma seleccionado por el usuario.

| Endpoint | Código de éxito | Códigos de error |
|----------|-----------------|------------------|
| `/api/auth/login` | — | `REQUIRED_CREDENTIALS`, `INVALID_CREDENTIALS`, `ACCOUNT_LOCKED`, `DATABASE_NOT_READY`, `INTERNAL_ERROR` |
| `/api/auth/logout` | `LOGGED_OUT` | `NO_ACTIVE_SESSION`, `INTERNAL_ERROR` |
| `/api/auth/me` | — | `INTERNAL_ERROR` |
| `/api/auth/change-password` | `PASSWORD_CHANGED` | `NEW_PASSWORD_REQUIRED`, `POLICY_NOT_MET`, `USER_NOT_FOUND`, `CURRENT_PASSWORD_INCORRECT`, `NEW_PASSWORD_SAME_AS_CURRENT`, `INTERNAL_ERROR` |
| `/api/auth/password-policy` | — | `POLICY_RETRIEVE_FAILED` |

### Respuestas de error {/* #error-responses */}
- `401 Unauthorized`: Sesión no válida o ausente, sesión expirada o fallo en la validación del token CSRF
- `403 Forbidden`: Fallo en la validación del token CSRF u operación no permitida

:::caution
 No exponga el servidor de **duplistatus** a la red pública de internet. Utilícelo en una red segura 
(p. ej., una LAN local protegida por un cortafuegos).

Exponer la interfaz de **duplistatus** a la red pública
 de internet sin las medidas de seguridad adecuadas podría provocar accesos no autorizados.
:::
