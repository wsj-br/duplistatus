---
translation_last_updated: '2026-04-17T23:59:24.400Z'
source_file_mtime: '2026-04-10T18:19:13.212Z'
source_file_hash: c9534dd52e365d0fa8362267d222bf25774890c9b7530524b456434c7f74b287
translation_language: es
source_file_path: documentation/docs/api-reference/authentication-security.md
translation_models:
  - anthropic/claude-haiku-4.5
  - qwen/qwen3-235b-a22b-2507
---
# Autenticación y seguridad {#authentication-security}

La API utiliza una combinación de autenticación basada en sesiones y protección CSRF para todas las operaciones de escritura en la base de datos, con el fin de evitar accesos no autorizados y posibles ataques de denegación de servicio. Las APIs externas (utilizadas por Duplicati) permanecen sin autenticar por compatibilidad.

## Autenticación basada en sesiones {#session-based-authentication}

Los endpoints protegidos requieren una cookie de sesión válida y un token CSRF. El sistema de sesiones proporciona autenticación segura para todas las operaciones protegidas.

### Gestión de sesiones {#session-management}
1. **Crear sesión**: POST a `/api/session` para crear una nueva sesión
2. **Obtener token CSRF**: GET `/api/csrf` para obtener un token CSRF para la sesión
3. **Incluir en solicitudes**: Enviar la cookie de sesión y el token CSRF con las solicitudes protegidas
4. **Validar sesión**: GET `/api/session` para comprobar si la sesión sigue siendo válida
5. **Eliminar sesión**: DELETE `/api/session` para cerrar sesión y eliminar la sesión

### Protección CSRF {#csrf-protection}
Todas las operaciones que cambian el estado requieren un token CSRF válido que coincida con la sesión actual. El token CSRF debe incluirse en el encabezado `X-CSRF-Token` para los endpoints protegidos.

### Endpoints protegidos {#protected-endpoints}
Todos los endpoints que modifican datos de la base de datos requieren autenticación de sesión y token CSRF:

- **Gestión del servidor**: `/api/servers/:id` (PATCH, DELETE), `/api/servers/:id/server-url` (PATCH), `/api/servers/:id/password` (PATCH, GET)
- **Gestión de configuración**: `/api/configuration/email` (GET, POST, DELETE), `/api/configuration/unified` (GET), `/api/configuration/ntfy` (GET), `/api/configuration/notifications` (GET, POST), `/api/configuration/backup-settings` (POST), `/api/configuration/templates` (POST), `/api/configuration/overdue-tolerance` (GET, POST)
- **Sistema de notificaciones**: `/api/notifications/test` (POST)
- **Configuración de cron**: `/api/cron-config` (GET, POST)
- **Proxy de cron**: `/api/cron/*` (GET, POST) - realiza proxy de solicitudes al servicio de cron
- **Gestión de sesiones**: `/api/session` (POST, GET, DELETE), `/api/csrf` (GET)
- **Datos de gráficos**: `/api/chart-data/*` (GET)
- **Panel de control**: `/api/dashboard` (GET)
- **Detalles del servidor**: `/api/servers` (GET), `/api/servers/:id` (GET), `/api/detail/:serverId` (GET)
- **Registro de auditoría**: `/api/audit-log` (GET), `/api/audit-log/download` (GET), `/api/audit-log/filters` (GET), `/api/audit-log/retention` (PATCH), `/api/audit-log/cleanup` (POST) - se requiere administrador para operaciones de escritura
- **Gestión de usuarios**: `/api/users` (GET, POST, PATCH, DELETE) - se requiere administrador
- **Gestión de base de datos**: `/api/database/backup` (GET), `/api/database/restore` (POST) - se requiere administrador
- **Registros de la aplicación**: `/api/application-logs` (GET), `/api/application-logs/export` (GET) - se requiere administrador
- **Colección de copias de seguridad**: `/api/backups/collect` (POST) - requiere sesión y token CSRF
- **Sincronización de programación de copias de seguridad**: `/api/backups/sync-schedule` (POST) - requiere sesión y token CSRF
- **Verificación de retraso**: `/api/notifications/check-overdue` (POST) - requiere sesión y token CSRF
- **Borrar marcas de tiempo de retraso**: `/api/notifications/clear-overdue-timestamps` (POST) - requiere sesión y token CSRF

### Endpoints no protegidos {#unprotected-endpoints}
Las APIs externas permanecen sin autenticar para la integración con Duplicati:

- `/api/upload` - Cargas de datos de copia de seguridad desde Duplicati
- `/api/lastbackup/:serverId` - Estado de la última copia de seguridad
- `/api/lastbackups/:serverId` - Estado de las últimas copias de seguridad
- `/api/summary` - Datos de resumen general
- `/api/health` - Endpoint de comprobación de estado

### Ejemplo de uso (Sesión + CSRF) {#usage-example-session-csrf}

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

## Endpoints de autenticación {#authentication-endpoints}

### Inicio de sesión - `/api/auth/login` {#login-apiauthlogin}
- **Endpoint**: `/api/auth/login`
- **Método**: POST
- **Descripción**: Autentica a un usuario y crea una sesión. Admite bloqueo de cuenta tras intentos fallidos y requisitos de cambio de contraseña.
- **Autenticación**: Requiere sesión válida y token CSRF (pero no un usuario conectado)
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

- **Respuestas de error**: Todas las respuestas de error incluyen `error` (mensaje en inglés) y `errorCode` (código estable para traducción en el cliente).
  - `400`: Falta el nombre de usuario o la contraseña — `errorCode: "REQUIRED_CREDENTIALS"`
  - `401`: Nombre de usuario o contraseña inválidos — `errorCode: "INVALID_CREDENTIALS"`
  - `403`: Cuenta bloqueada debido a demasiados intentos fallidos de inicio de sesión — `errorCode: "ACCOUNT_LOCKED"` (incluye `lockedUntil`, `minutesRemaining`)
  - `500`: Error interno del servidor — `errorCode: "INTERNAL_ERROR"`
  - `503`: Base de datos no lista — `errorCode: "DATABASE_NOT_READY"`
- **Notas**:
  - La cuenta se bloquea tras 5 intentos fallidos de inicio de sesión durante 15 minutos
  - Se registran y registran los intentos de inicio de sesión fallidos
  - La cookie de sesión se establece automáticamente en la respuesta
  - Si el usuario tiene la bandera `mustChangePassword` activada, debe redirigirse a la página de cambio de contraseña
  - Todos los intentos de inicio de sesión (exitosos y fallidos) se registran en el registro de auditoría

### Cerrar sesión - `/api/auth/logout` {#logout-apiauthlogout}
- **Endpoint**: `/api/auth/logout`
- **Method**: POST
- **Description**: Cierra la sesión del usuario actual y destruye su sesión.
- **Authentication**: Requiere sesión válida y token CSRF
- **Response** (success):

  ```json
  {
    "success": true,
    "message": "Logged out successfully",
    "successCode": "LOGGED_OUT"
  }
  ```

- **Error Responses**: Incluye `error` y `errorCode` para traducción en el lado del cliente.
  - `400`: No hay sesión activa — `errorCode: "NO_ACTIVE_SESSION"`
  - `500`: Error interno del servidor — `errorCode: "INTERNAL_ERROR"`
- **Notes**:
  - La cookie de sesión se borra en la respuesta
  - El cierre de sesión se registra en el registro de auditoría
  - La sesión se invalida inmediatamente

### Obtener usuario actual - `/api/auth/me` {#get-current-user-apiauthme}
- **Endpoint**: `/api/auth/me`
- **Method**: GET
- **Description**: Devuelve la información del usuario autenticado actual, o indica si no hay ningún usuario conectado.
- **Authentication**: Requiere sesión válida (pero no se requiere un usuario conectado)
- **Response** (authenticated):

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

- **Response** (not authenticated):

  ```json
  {
    "authenticated": false,
    "user": null
  }
  ```

- **Error Responses**: Incluye `error` y `errorCode` para traducción en el lado del cliente.
  - `500`: Error interno del servidor — `errorCode: "INTERNAL_ERROR"`
- **Notes**:
  - Puede llamarse sin un usuario conectado (devuelve `authenticated: false`)
  - Útil para verificar el estado de autenticación al cargar la página

### Cambiar contraseña - `/api/auth/change-password` {#change-password-apiauthchange-password}
- **Endpoint**: `/api/auth/change-password`
- **Method**: POST
- **Description**: Cambia la contraseña del usuario autenticado actual. Si `mustChangePassword` está activado, se omite la verificación de la contraseña actual.
- **Authentication**: Requiere sesión válida y token CSRF (se requiere usuario conectado)
- **Request Body**:

  ```json
  {
    "currentPassword": "old-password",
    "newPassword": "new-secure-password"
  }
  ```

- `currentPassword`: Opcional si `mustChangePassword` es verdadero, obligatorio en caso contrario
  - `newPassword`: Obligatorio, debe cumplir con los requisitos de la política de contraseñas
- **Response** (success):

  ```json
  {
    "success": true,
    "message": "Password changed successfully",
    "successCode": "PASSWORD_CHANGED"
  }
  ```

- **Error Responses**: Incluye `error` y `errorCode` para traducción en el lado del cliente. La violación de la política puede incluir `validationErrors` (matriz de cadenas).
  - `400`: Falta la nueva contraseña — `errorCode: "NEW_PASSWORD_REQUIRED"`
  - `400`: Violación de la política de contraseñas — `errorCode: "POLICY_NOT_MET"` (puede incluir `validationErrors`)
  - `400`: La nueva contraseña es igual a la actual — `errorCode: "NEW_PASSWORD_SAME_AS_CURRENT"`
  - `401`: La contraseña actual es incorrecta — `errorCode: "CURRENT_PASSWORD_INCORRECT"`
  - `404`: Usuario no encontrado — `errorCode: "USER_NOT_FOUND"`
  - `500`: Error interno del servidor — `errorCode: "INTERNAL_ERROR"`
- **Notes**:
  - La nueva contraseña debe cumplir con los requisitos de la política de contraseñas (longitud, complejidad, etc.)
  - Si la bandera `mustChangePassword` está activada, se omite la verificación de la contraseña actual
  - Tras un cambio exitoso de contraseña, la bandera `mustChangePassword` se desactiva
  - Los cambios de contraseña se registran en el registro de auditoría
  - La nueva contraseña debe ser diferente de la contraseña actual

### Verificar si el administrador debe cambiar la contraseña - `/api/auth/admin-must-change-password` {#check-admin-must-change-password-apiauthadmin-must-change-password}
- **Endpoint**: `/api/auth/admin-must-change-password`
- **Method**: GET
- **Description**: Verifica si el usuario administrador debe cambiar su contraseña. Este punto final es público (no requiere autenticación) ya que solo devuelve una bandera booleana.
- **Response**:

  ```json
  {
    "mustChangePassword": false
  }
  ```

- **Error Responses**:
  - `500`: Error interno del servidor (devuelve `mustChangePassword: false` en caso de error para evitar mostrar la sugerencia si hay un problema en la base de datos)
- **Notes**:
  - Punto final público, no se requiere autenticación
  - Devuelve `false` si el usuario administrador no existe
  - Se utiliza para determinar si se debe mostrar la sugerencia de cambio de contraseña
  - En caso de error, devuelve `false` para evitar mostrar la sugerencia si hay un problema en la base de datos

### Obtener política de contraseñas - `/api/auth/password-policy` {#get-password-policy-apiauthpassword-policy}
- **Endpoint**: `/api/auth/password-policy`
- **Method**: GET
- **Description**: Devuelve la configuración actual de la política de contraseñas. Este punto final es público (no requiere autenticación) ya que es necesario para la validación en el frontend.
- **Response**:

  ```json
  {
    "minLength": 8,
    "requireUppercase": true,
    "requireLowercase": true,
    "requireNumbers": true,
    "requireSpecialChars": false
  }
  ```

- **Error Responses**: Incluye `error` y `errorCode` para traducción en el lado del cliente.
  - `500`: No se pudo recuperar la política de contraseñas — `errorCode: "POLICY_RETRIEVE_FAILED"`
- **Notes**:
  - Punto final público, no se requiere autenticación
  - Utilizado por componentes del frontend para mostrar los requisitos de contraseña y validarlas antes del envío
  - La política se configura mediante variables de entorno (`PWD_ENFORCE`, `PWD_MIN_LEN`)
  - La verificación predeterminada de contraseñas (impedir el uso de la contraseña predeterminada del administrador) siempre se aplica independientemente de la configuración de la política

### Códigos de error y éxito de la API de autenticación (i18n) {#auth-api-error-and-success-codes-i18n}

Los puntos finales de autenticación devuelven un `errorCode` estable (y, en caso de éxito, `successCode`) además del campo legible por humanos `error` o `message`. Los valores `error` y `message` están en inglés. Los clientes deben usar los códigos para buscar cadenas localizadas, de modo que la interfaz muestre los mensajes en el idioma seleccionado por el usuario.

| Punto final | Código de éxito | Códigos de error |
|----------|--------------|-------------|
| `/api/auth/login` | — | `REQUIRED_CREDENTIALS`, `INVALID_CREDENTIALS`, `ACCOUNT_LOCKED`, `DATABASE_NOT_READY`, `INTERNAL_ERROR` |
| `/api/auth/logout` | `LOGGED_OUT` | `NO_ACTIVE_SESSION`, `INTERNAL_ERROR` |
| `/api/auth/me` | — | `INTERNAL_ERROR` |
| `/api/auth/change-password` | `PASSWORD_CHANGED` | `NEW_PASSWORD_REQUIRED`, `POLICY_NOT_MET`, `USER_NOT_FOUND`, `CURRENT_PASSWORD_INCORRECT`, `NEW_PASSWORD_SAME_AS_CURRENT`, `INTERNAL_ERROR` |
| `/api/auth/password-policy` | — | `POLICY_RETRIEVE_FAILED` |

### Respuestas de error {#error-responses}
- `401 Unauthorized`: Sesión inválida o ausente, sesión expirada o falló la validación del token CSRF
- `403 Forbidden`: Falló la validación del token CSRF o la operación no está permitida

:::caution
 No exponga el servidor **duplistatus** a Internet público. Úselo en una red segura 
(por ejemplo, una LAN local protegida por un firewall).

Exponer la interfaz **duplistatus** a Internet público 
sin medidas de seguridad adecuadas podría provocar acceso no autorizado.
:::
