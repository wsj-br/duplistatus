# Monitoreo y Salud {/* #monitoring--health */}

## Comprobación de Salud - `/api/health` {/* #health-check---apihealth */}
- **Endpoint**: `/api/health`
- **Método**: GET
- **Descripción**: Comprobación de disponibilidad económica para la aplicación y la conexión SQLite. Docker `HEALTHCHECK` y el bucle de punto de entrada utilizan esta URL en localhost.
- **Respuesta** (saludable):

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

- **Respuesta** (degradada):

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

- **Respuesta de Error** (503):

  ```json
  {
    "status": "unhealthy",
    "error": "Database connection failed",
    "message": "Connection timeout",
    "timestamp": "2024-03-20T10:00:00Z"
  }
  ```

- **Notas**:
  - Devuelve 200 cuando la inicialización se completó y `SELECT 1` tiene éxito
  - Devuelve 503 cuando la inicialización o la comprobación de conexión falla
  - No enumera nombres de tablas ni ejecuta consultas del panel de control
  - Nunca requiere una clave de API
  - Cuando se habilita la lista de IPs permitidas, la IP del cliente debe ser loopback o estar listada en la lista CIDR de administrador o externa (`403` `IP_NOT_ALLOWED` en caso contrario)
  - Los clientes que no son loopback tienen límite de velocidad (`429` `PROBE_RATE_LIMITED`, 30/minuto y 120/hora). Loopback (`127.0.0.1`, `::1`) nunca se acelera

## Sonda de Conectividad - `/api/ping` {/* #connectivity-probe---apiping */}
- **Endpoint**: `/api/ping`
- **Método**: GET
- **Descripción**: Respuesta `{ "ok": true }` diminuta utilizada por la comprobación de conectividad del panel de control (cada 30 segundos).
- **Respuesta**:

  ```json
  {
    "ok": true
  }
  ```

- **Notas**:
  - Nunca requiere una clave de API o una cookie de sesión
  - Las mismas reglas de unión de lista de permitidos y loopback que `/api/health`
  - Los clientes que no son loopback tienen límite de velocidad (`429` `PROBE_RATE_LIMITED`, 60/minuto y 600/hora)
