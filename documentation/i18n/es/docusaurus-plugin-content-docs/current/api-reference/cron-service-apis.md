# Gestión del servicio Cron {#cron-service-management}

## Obtener configuración de Cron - `/api/cron-config` {#get-cron-configuration---apicron-config}
- **Endpoint**: `/api/cron-config`
- **Method**: GET
- **Description**: Recupera la configuración actual del servicio cron.
- **Autenticación**: Requiere sesión válida y token CSRF
- **Respuesta**:

  ```json
  {
    "cronExpression": "*/20 * * * *",
    "enabled": true
  }
  ```

- **Respuestas de error**:
  - `500`: Fallido al obtener la configuración de cron
- **Notas**:
  - Devuelve la configuración actual del servicio cron
  - Incluye la expresión cron y el estado habilitado
  - Utilizado para la gestión del servicio cron

## Actualizar configuración de Cron - `/api/cron-config` {#update-cron-configuration---apicron-config}
- **Endpoint**: `/api/cron-config`
- **Method**: POST
- **Description**: Actualiza la configuración del servicio cron.
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
  - `500`: Fallido al actualizar la configuración de cron
- **Notas**:
  - Actualiza la configuración del servicio cron
  - Valida el intervalo contra las opciones permitidas
  - Afecta la frecuencia de verificación de copias de seguridad retrasadas

## Proxy del servicio Cron - `/api/cron/*` {#cron-service-proxy---apicron}
- **Endpoint**: `/api/cron/*`
- **Method**: GET, POST
- **Description**: Proxifica solicitudes al servicio cron. Este punto final reenvía todas las solicitudes al servicio cron que se ejecuta en un puerto diferente.
- **Autenticación**: Requiere sesión válida y token CSRF
- **Parámetros**:
  - `*`: Cualquier ruta que será reenviada al servicio cron
- **Respuesta**: Depende del punto final del servicio cron al que se accede
- **Respuesta de Error** (503):

  ```json
  {
    "error": "Cron service is not running",
    "message": "The cron service is not available. Please start it with: npm run cron:start"
  }
  ```

- **Notas**:
  - Reenvía solicitudes al servicio cron
  - Devuelve 503 si el servicio cron no está disponible
  - Admite los métodos GET y POST
  - Utilizado para la gestión del servicio cron desde la interfaz web
