# Monitoreo y salud {/* #monitoring--health */}

## Comprobación de salud - `/api/health` {/* #health-check---apihealth */}
- **Punto final**: `/api/health`
- **Método**: GET
- **Descripción**: Comprobación de vitalidad económica para la aplicación y la conexión SQLite. Docker `HEALTHCHECK` y el bucle de entrada de espera usan esta URL en localhost.
- **Respuesta** (sano):

  ```json
  {
    "status": "healthy",
    "database": "connected",
    "basicConnection": true,
    "initializationStatus": "complete",
    "initializationComplete": true,
    "connectionHealth": true,
    "timestamp": "2024-03-20T10:00:00Z"
  }
  ```

- **Respuesta** (degradado):

  ```json
  {
    "status": "degraded",
    "database": "unavailable",
    "basicConnection": false,
    "initializationStatus": "complete",
    "initializationComplete": true,
    "connectionHealth": false,
    "connectionHealthError": "Database connection test failed",
    "timestamp": "2024-03-20T10:00:00Z"
  }
  ```

- **Respuesta de error** (503):

  ```json
  {
    "status": "unhealthy",
    "error": "Database connection failed",
    "message": "Connection timeout",
    "timestamp": "2024-03-20T10:00:00Z"
  }
  ```

- **Notas**:
  - Devuelve 200 cuando la inicialización se completa y `SELECT 1` tiene éxito
  - Devuelve 503 cuando la inicialización o la comprobación de conexión falla
  - No enumera los nombres de las tablas ni ejecuta consultas del panel
  - Nunca requiere una clave de API
  - Cuando cualquiera de las listas de IPs permitidas está habilitada, la IP del cliente debe ser de bucle o estar en la lista de CIDR de administrador o externa (`403` `IP_NOT_ALLOWED` de lo contrario)
  - Los clientes que no son de bucle están limitados por tasa (`429` `PROBE_RATE_LIMITED`, 30/minuto y 120/hora). El bucle (`127.0.0.1`, `::1`) nunca se limita

## Sonda de conectividad - `/api/ping` {/* #connectivity-probe---apiping */}
- **Punto final**: `/api/ping`
- **Método**: GET
- **Descripción**: Respuesta `{ "ok": true }` pequeña utilizada por la comprobación de conectividad del panel (cada 30 segundos).
- **Respuesta**:

  ```json
  {
    "ok": true
  }
  ```

- **Notas**:
  - Nunca requiere una clave de API o una cookie de sesión
  - Misma unión de lista de permisos y reglas de bucle que `/api/health`
  - Los clientes que no son de bucle están limitados por tasa (`429` `PROBE_RATE_LIMITED`, 60/minuto y 600/hora)
