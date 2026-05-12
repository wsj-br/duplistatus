# Monitoramento e Saúde {#monitoring-health}

## Verificação de Integridade - `/api/health` {#health-check---apihealth}
- **Endpoint**: `/api/health`
- **Método**: GET
- **Descrição**: Verifica o status de integridade da aplicação e do banco de dados.
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
  - Retorna status 503 para sistemas não saudáveis ou falhas em prepared statements
  - Inclui o campo `preparedStatementsError` quando ocorrem falhas em prepared statements
  - Inclui o campo `initializationError` quando a inicialização do banco de dados falha
  - Inclui `connectionHealthError` e `connectionDetails` quando as verificações de saúde da conexão falham
  - O rastreamento de pilha é incluído apenas no modo de desenvolvimento
  - Testa a conexão básica com o banco de dados, prepared statements, status de inicialização e saúde da conexão
  - Fornece diagnósticos abrangentes de saúde para solução de problemas
