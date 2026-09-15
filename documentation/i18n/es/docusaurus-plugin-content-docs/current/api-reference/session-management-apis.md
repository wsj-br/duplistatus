# Gestión de Sesiones {/* #session-management */}

## Crear Sesión - `/api/session` {/* #create-session---apisession */}
- **Punto de acceso**: `/api/session`
- **Método**: POST
- **Descripción**: Crea una nueva sesión para el usuario.
- **Respuesta**:

  ```json
  {
    "sessionId": "session-id-string",
    "message": "Session created successfully"
  }
  ```

- **Respuestas de error**:
  - `500`: Error al crear la sesión
- **Notas**:
  - Crea una nueva sesión con expiración de 24 horas
  - Establece una cookie de sesión HTTP-only
  - Requerido para acceder a puntos de acceso protegidos

## Validar Sesión - `/api/session` {/* #validate-session---apisession */}
- **Punto de acceso**: `/api/session`
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

- **Respuestas de error**:
  - `401`: No hay cookie de sesión o ID de sesión
  - `500`: Error al validar la sesión
- **Notas**:
  - Comprueba si la cookie de sesión existe y es válida
  - Devuelve el ID de sesión si es válido

## Eliminar Sesión - `/api/session` {/* #delete-session---apisession */}
- **Punto de acceso**: `/api/session`
- **Método**: DELETE
- **Descripción**: Elimina la sesión actual (cerrar sesión).
- **Respuesta**:

  ```json
  {
    "message": "Session deleted successfully"
  }
  ```

- **Respuestas de error**:
  - `500`: Error al eliminar la sesión
- **Notas**:
  - Elimina la sesión del servidor y del cliente
  - Elimina la cookie de sesión

## Obtener Token CSRF - `/api/csrf` {/* #get-csrf-token---apicsrf */}
- **Punto de acceso**: `/api/csrf`
- **Método**: GET
- **Descripción**: Genera un token CSRF para la sesión actual.
- **Respuesta**:

  ```json
  {
    "csrfToken": "csrf-token-string",
    "message": "CSRF token generated successfully"
  }
  ```

- **Respuestas de error**:
  - `401`: No se encontró sesión o sesión inválida/expirada
  - `500`: Error al generar el token CSRF
- **Notas**:
  - Requiere una sesión válida
  - El token CSRF es requerido para todas las operaciones que cambian el estado
  - El token está vinculado a la sesión actual
