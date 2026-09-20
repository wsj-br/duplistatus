# Gestión de Sesiones {/* #session-management */}

## Crear Sesión - `/api/session` {/* #create-session---apisession */}
- **Endpoint**: `/api/session`
- **Método**: POST
- **Descripción**: Crea una nueva sesión para el usuario.
- **Respuesta**:

  ```json
  {
    "sessionId": "session-id-string",
    "message": "Session created successfully"
  }
  ```

- **Respuestas de Error**:
  - `500`: Falló al crear la sesión
- **Notas**:
  - Crea una nueva sesión con expiración de 24 horas
  - Establece una cookie de sesión solo HTTP
  - Requerida para acceder a puntos finales protegidos

## Validar Sesión - `/api/session` {/* #validate-session---apisession */}
- **Endpoint**: `/api/session`
- **Método**: GET
- **Descripción**: Valida una sesión existente.
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

- **Respuestas de Error**:
  - `401`: No hay cookie de sesión o ID de sesión
  - `500`: Falló al validar la sesión
- **Notas**:
  - Verifica si existe la cookie de sesión y es válida
  - Devuelve el ID de sesión si es válido

## Eliminar Sesión - `/api/session` {/* #delete-session---apisession */}
- **Endpoint**: `/api/session`
- **Método**: DELETE
- **Descripción**: Elimina la sesión actual (cerrar sesión).
- **Respuesta**:

  ```json
  {
    "message": "Session deleted successfully"
  }
  ```

- **Respuestas de Error**:
  - `500`: Falló al eliminar la sesión
- **Notas**:
  - Borra la sesión del servidor y cliente
  - Elimina la cookie de sesión

## Obtener Token CSRF - `/api/csrf` {/* #get-csrf-token---apicsrf */}
- **Endpoint**: `/api/csrf`
- **Método**: GET
- **Descripción**: Genera un token CSRF para la sesión actual.
- **Respuesta**:

  ```json
  {
    "csrfToken": "csrf-token-string",
    "message": "CSRF token generated successfully"
  }
  ```

- **Respuestas de Error**:
  - `401`: No se encontró sesión o sesión inválida/expirada
  - `500`: Falló al generar token CSRF
- **Notas**:
  - Requiere una sesión válida
  - El token CSRF es requerido para todas las operaciones que cambian estado
  - El token está asociado a la sesión actual
