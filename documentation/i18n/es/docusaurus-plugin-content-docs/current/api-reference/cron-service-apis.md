# Gestión del servicio Cron {/* #cron-service-management */}

## Obtener configuración de Cron - `/api/cron-config` {/* #get-cron-configuration---apicron-config */}
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

- **Respuestas de Error**:
  - `500`: Falló al obtener la configuración de cron
- **Notas**:
  - Devuelve la configuración actual del servicio cron
  - Incluye la expresión cron y el estado habilitado
  - Utilizado para la gestión del servicio cron

## Actualizar configuración de Cron - `/api/cron-config` {/* #update-cron-configuration---apicron-config */}
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

- **Intervalos Disponibles**: `"disabled"`, `"1min"`, `"5min"`, `"10min"`, `"15min"`, `"20min"`, `"30min"`, `"1hour"`, `"2hours"`
- **Respuestas de Error**:
  - `400`: El intervalo es obligatorio
  - `500`: Falló al actualizar la configuración de cron
- **Notas**:
  - Actualiza la configuración del servicio cron
  - Valida el intervalo contra las opciones permitidas
  - Afecta la frecuencia de comprobación de copias de seguridad vencidas

## Proxy del servicio Cron - `/api/cron/*` {/* #cron-service-proxy---apicron */}
- **Endpoint**: `/api/cron/*`
- **Método**: GET, POST
- **Descripción**: Envía solicitudes al servicio cron. Este endpoint reenvía todas las solicitudes al servicio cron que se ejecuta en un puerto separado.
- **Autenticación**: Requiere una sesión válida y un token CSRF. Se permite GET para usuarios autenticados; POST (inicio/detención/disparador/recarga) requiere un administrador.
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
  - Sirve como proxy para solicitudes al servicio cron en `127.0.0.1`
  - Reenvía `CRON_SERVICE_SECRET` como `X-Cron-Service-Secret` cuando está establecido
  - Devuelve 503 si el servicio cron no está disponible
  - Soporta ambos métodos GET y POST
  - Utilizado para la gestión del servicio cron desde la interfaz web
  - `POST /trigger/daily-summary-dispatch` es rechazado por el servicio cron; utilice `/api/configuration/daily-summary/send` en su lugar
  - `POST /trigger/database-compact` ejecuta inmediatamente la compactación semanal (copias de seguridad/servidores huérfanos y configuración de notificaciones, además de SQLite `VACUUM`)
