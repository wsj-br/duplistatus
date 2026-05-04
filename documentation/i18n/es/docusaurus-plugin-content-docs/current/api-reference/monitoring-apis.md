---
translation_last_updated: '2026-04-18T00:00:37.041Z'
source_file_mtime: '2026-03-05T22:33:28.419Z'
source_file_hash: ccd50e5fe2f6be70227afc5ce46c99b7ce52a87df5184098f4d303683bd9e6c6
translation_language: es
source_file_path: documentation/docs/api-reference/monitoring-apis.md
translation_models:
  - qwen/qwen3-235b-a22b-2507
---
# Monitoreo y Estado {#monitoring-health}

## Verificación de Estado - `/api/health` {#health-check-apihealth}
- **Punto de conexión**: `/api/health`
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
  - Incluye los campos `connectionHealthError` y `connectionDetails` cuando fallan las verificaciones de salud de conexión
  - La traza de pila solo se incluye en modo desarrollo
  - Prueba la conexión básica a la base de datos, sentencias preparadas, estado de inicialización y salud de la conexión
  - Proporciona diagnósticos de salud completos para la resolución de problemas
