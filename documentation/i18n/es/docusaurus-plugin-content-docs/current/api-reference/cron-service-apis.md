---
translation_last_updated: '2026-04-18T00:00:14.389Z'
source_file_mtime: '2026-03-05T22:33:28.419Z'
source_file_hash: add8fe98b40a55c51fdd7af09ba7c836d54475b8283bbdebecbe17f2c6beb071
translation_language: es
source_file_path: documentation/docs/api-reference/cron-service-apis.md
translation_models:
  - qwen/qwen3-235b-a22b-2507
---
# Gestión del servicio Cron {#cron-service-management}

## Obtener configuración de Cron - `/api/cron-config` {#get-cron-configuration-apicron-config}
- **Endpoint**: `/api/cron-config`
- **Método**: GET
- **Descripción**: Recupera la configuración actual del servicio cron.
- **Autenticación**: Requiere sesión válida y token CSRF
- **Respuesta**:

  ```json
  {
    "cronExpression": "*/20 * * * *",
    "enabled": true
  }
  ```

- **Respuestas de error**:
  - `500`: No se pudo obtener la configuración de cron
- **Notas**:
  - Devuelve la configuración actual del servicio cron
  - Incluye la expresión cron y el estado habilitado
  - Utilizado para la gestión del servicio cron

## Actualizar configuración de Cron - `/api/cron-config` {#update-cron-configuration-apicron-config}
- **Endpoint**: `/api/cron-config`
- **Método**: POST
- **Descripción**: Actualiza la configuración del servicio cron.
- **Autenticación**: Requiere sesión válida y token CSRF
- **Cuerpo de la solicitud**:

  ```json
  {
    "interval": "20min"
  }
  ```

- **Respuesta**:

  ```json
  {
    "success": true
  }
  ```

- **Intervalos disponibles**: `"disabled"`, `"1min"`, `"5min"`, `"10min"`, `"15min"`, `"20min"`, `"30min"`, `"1hour"`, `"2hours"`
- **Respuestas de error**:
  - `400`: El intervalo es obligatorio
  - `500`: No se pudo actualizar la configuración de cron
- **Notas**:
  - Actualiza la configuración del servicio cron
  - Valida el intervalo frente a las opciones permitidas
  - Afecta la frecuencia de verificación de copia de seguridad retrasada

## Proxy del servicio Cron - `/api/cron/*` {#cron-service-proxy-apicron}
- **Endpoint**: `/api/cron/*`
- **Método**: GET, POST
- **Descripción**: Proxifica solicitudes al servicio cron. Este punto final reenvía todas las solicitudes al servicio cron que se ejecuta en un puerto separado.
- **Autenticación**: Requiere sesión válida y token CSRF
- **Parámetros**:
  - `*`: Cualquier ruta que será reenviada al servicio cron
- **Respuesta**: Depende del punto final del servicio cron al que se accede
- **Respuesta de error** (503):

  ```json
  {
    "error": "Cron service is not running",
    "message": "The cron service is not available. Please start it with: npm run cron:start"
  }
  ```

- **Notas**:
  - Proxifica solicitudes al servicio cron
  - Devuelve 503 si el servicio cron no está disponible
  - Admite métodos GET y POST
  - Utilizado para la gestión del servicio cron desde la interfaz web
