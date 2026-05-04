---
translation_last_updated: '2026-04-18T00:01:13.145Z'
source_file_mtime: '2026-03-05T22:33:28.419Z'
source_file_hash: dcaa22d702c5a5e8506cf1be74b453ae66a255a11f09d5d169b57e890ae439c2
translation_language: es
source_file_path: documentation/docs/api-reference/session-management-apis.md
translation_models:
  - qwen/qwen3-235b-a22b-2507
---
# Gestión de Sesiones {#session-management}

## Crear Sesión - `/api/session` {#create-session-apisession}
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
  - `500`: Fallido al crear la sesión
- **Notas**:
  - Crea una nueva sesión con expiración de 24 horas
  - Establece una cookie de sesión HTTP-only
  - Requerido para acceder a endpoints protegidos

## Validar Sesión - `/api/session` {#validate-session-apisession}
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
  - `500`: Fallido al validar la sesión
- **Notas**:
  - Verifica si la cookie de sesión existe y es válida
  - Devuelve el ID de sesión si es válida

## Eliminar Sesión - `/api/session` {#delete-session-apisession}
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
  - `500`: Fallido al eliminar la sesión
- **Notas**:
  - Borra la sesión del servidor y del cliente
  - Elimina la cookie de sesión

## Obtener Token CSRF - `/api/csrf` {#get-csrf-token-apicsrf}
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
  - `500`: Fallido al generar el token CSRF
- **Notas**:
  - Requiere una sesión válida
  - El token CSRF es requerido para todas las operaciones que cambien el estado
  - El token está asociado a la sesión actual
