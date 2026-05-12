# Gestión de Sesiones {#session-management}

## Crear sesión - `/api/session` {#create-session---apisession}
- **Endpoint**: `/api/session`
- **Method**: POST
- **Description**: Crea una nueva sesión para el usuario.
- **Respuesta**:

  ```json
  {
    "sessionId": "session-id-string",
    "message": "Session created successfully"
  }
  ```

- **Respuestas de error**:
  - `500`: No se pudo crear la sesión
- **Notas**:
  - Crea una nueva sesión con expiración de 24 horas
  - Establece una cookie de sesión HTTP-only
  - Requerido para acceder a los endpoints protegidos

## Validar sesión - `/api/session` {#validate-session---apisession}
- **Endpoint**: `/api/session`
- **Method**: GET
- **Description**: Valida una sesión existente.
- **Respuesta** (válida):

  ```json
  {
    "valid": true,
    "sessionId": "session-id-string"
  }
  ```

- **Respuesta** (inválida):

  ```json
  {
    "valid": false,
    "error": "No session cookie"
  }
  ```

- **Respuestas de error**:
  - `401`: No hay cookie de sesión ni ID de sesión
  - `500`: No se pudo validar la sesión
- **Notas**:
  - Verifica si la cookie de sesión existe y es válida
  - Devuelve el ID de sesión si es válida

## Eliminar sesión - `/api/session` {#delete-session---apisession}
- **Endpoint**: `/api/session`
- **Method**: DELETE
- **Description**: Elimina la sesión actual (cerrar sesión).
- **Respuesta**:

  ```json
  {
    "message": "Session deleted successfully"
  }
  ```

- **Respuestas de error**:
  - `500`: No se pudo eliminar la sesión
- **Notas**:
  - Elimina la sesión del servidor y del cliente
  - Elimina la cookie de sesión

## Obtener token CSRF - `/api/csrf` {#get-csrf-token---apicsrf}
- **Endpoint**: `/api/csrf`
- **Method**: GET
- **Description**: Genera un token CSRF para la sesión actual.
- **Respuesta**:

  ```json
  {
    "csrfToken": "csrf-token-string",
    "message": "CSRF token generated successfully"
  }
  ```

- **Respuestas de error**:
  - `401`: No se encontró sesión o la sesión es inválida/expirada
  - `500`: No se pudo generar el token CSRF
- **Notas**:
  - Requiere una sesión válida
  - El token CSRF es obligatorio para todas las operaciones que cambien el estado
  - El token está asociado a la sesión actual
