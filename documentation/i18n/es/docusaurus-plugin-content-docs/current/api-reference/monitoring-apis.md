---
translation_last_updated: '2026-05-06T23:19:41.839Z'
source_file_mtime: '2026-05-06T23:18:51.410Z'
source_file_hash: eb18cd75959282575195e73b0368d4eecd23bf9684c9c5915cea3d8f6c360fce
translation_language: es
source_file_path: documentation/docs/api-reference/monitoring-apis.md
translation_models:
  - qwen/qwen3-235b-a22b-2507
---
# Monitoreo y Estado {#monitoring-health}

## Comprobación de estado - `/api/health` {#health-check---apihealth}
- **Endpoint**: `/api/health`
- **Método**: GET
- **Descripción**: Verifica el estado de salud de la aplicación y la base de datos.
- **Respuesta** (saludable):

  ```json
  {
    "status": "healthy",
    "database": "connected",
    "basicConnection": true,
    "tablesFound": 2,
    "tables": [
      "servers",
      "backups"
    ],
    "preparedStatements": true,
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
    "database": "connected",
    "basicConnection": true,
    "tablesFound": 2,
    "tables": [
      "servers",
      "backups"
    ],
    "preparedStatements": false,
    "preparedStatementsError": "Prepared statement error details",
    "initializationStatus": "complete",
    "initializationComplete": true,
    "connectionHealth": false,
    "connectionHealthError": "Connection health check failed",
    "connectionDetails": {
      "additional": "diagnostic information"
    },
    "timestamp": "2024-03-20T10:00:00Z"
  }
  ```

- **Respuesta de Error** (503):

  ```json
  {
    "status": "unhealthy",
    "error": "Database connection failed",
    "message": "Connection timeout",
    "stack": "Error: Connection timeout\n    at...",
    "timestamp": "2024-03-20T10:00:00Z"
  }
  ```

- **Notas**: 
  - Devuelve el estado 200 para sistemas saludables
  - Devuelve el estado 503 para sistemas no saludables o fallos en sentencias preparadas
  - Incluye el campo `preparedStatementsError` cuando fallan las sentencias preparadas
  - Incluye el campo `initializationError` cuando falla la inicialización de la base de datos
  - Incluye `connectionHealthError` y `connectionDetails` cuando fallan las comprobaciones de estado de conexión
  - La traza de pila solo se incluye en modo desarrollo
  - Prueba la conexión básica a la base de datos, sentencias preparadas, estado de inicialización y salud de la conexión
  - Proporciona diagnósticos de salud completos para la resolución de problemas
