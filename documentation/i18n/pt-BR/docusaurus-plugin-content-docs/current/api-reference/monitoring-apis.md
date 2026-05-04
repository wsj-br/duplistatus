---
translation_last_updated: '2026-04-18T00:00:48.935Z'
source_file_mtime: '2026-03-05T22:33:28.419Z'
source_file_hash: ccd50e5fe2f6be70227afc5ce46c99b7ce52a87df5184098f4d303683bd9e6c6
translation_language: pt-BR
source_file_path: documentation/docs/api-reference/monitoring-apis.md
translation_models:
  - qwen/qwen3-235b-a22b-2507
---
# Monitoramento e Saúde {#monitoring-health}

## Verificar Saúde - `/api/health` {#health-check-apihealth}
- **Endpoint**: `/api/health`
- **Método**: GET
- **Descrição**: Verifica o status de saúde da aplicação e do banco de dados.
- **Resposta** (saudável):

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

- **Resposta** (degradada):

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

- **Resposta de Erro** (503):

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
  - Retorna status 200 para sistemas saudáveis
  - Retorna status 503 para sistemas não saudáveis ou falhas em declarações preparadas
  - Inclui o campo `preparedStatementsError` quando ocorrem falhas em declarações preparadas
  - Inclui o campo `initializationError` quando a inicialização do banco de dados falha
  - Inclui `connectionHealthError` e `connectionDetails` quando as verificações de saúde da conexão falham
  - Rastreamento de pilha incluído apenas no modo de desenvolvimento
  - Testa conexão básica com o banco de dados, declarações preparadas, status de inicialização e saúde da conexão
  - Fornece diagnósticos abrangentes de saúde para solução de problemas
