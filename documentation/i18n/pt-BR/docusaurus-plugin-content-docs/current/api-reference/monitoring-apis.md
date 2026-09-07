# Monitoramento e Saúde {/* #monitoring--health */}

## Verificação de Saúde - `/api/health` {/* #health-check---apihealth */}
- **Endpoint**: `/api/health`
- **Método**: GET
- **Descrição**: Verificação de vitalidade barata para a aplicação e conexão SQLite. O Docker `HEALTHCHECK` e o loop de entrada usam esta URL no localhost.
- **Resposta** (saudável):

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

- **Resposta** (degradada):

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

- **Resposta de Erro** (503):

  ```json
  {
    "status": "unhealthy",
    "error": "Database connection failed",
    "message": "Connection timeout",
    "timestamp": "2024-03-20T10:00:00Z"
  }
  ```

- **Notas**:
  - Retorna 200 quando a inicialização é concluída e `SELECT 1` bem-sucedido
  - Retorna 503 quando a inicialização ou a verificação de conexão falha
  - Não lista nomes de tabelas ou executa consultas do painel
  - Nunca requer uma chave de API
  - Quando qualquer lista de permissões de IP está habilitada, o IP do cliente deve ser loopback ou listado na lista CIDR do administrador ou externo (`403` `IP_NOT_ALLOWED` caso contrário)
  - Clientes não loopback são limitados em taxa (`429` `PROBE_RATE_LIMITED`, 30/minuto e 120/hora). Loopback (`127.0.0.1`, `::1`) nunca é limitado

## Verificação de Conectividade - `/api/ping` {/* #connectivity-probe---apiping */}
- **Endpoint**: `/api/ping`
- **Método**: GET
- **Descrição**: Resposta pequena `{ "ok": true }` usada pela verificação de conectividade do painel (a cada 30 segundos).
- **Resposta**:

  ```json
  {
    "ok": true
  }
  ```

- **Notas**:
  - Nunca requer uma chave de API ou um cookie de sessão
  - Mesmas regras de lista de permissões e loopback que `/api/health`
  - Clientes não loopback são limitados em taxa (`429` `PROBE_RATE_LIMITED`, 60/minuto e 600/hora)
