# Monitoramento e integridade {/* #monitoring--health */}

## Verificação de integridade - `/api/health` {/* #health-check---apihealth */}
- **Endpoint**: `/api/health`
- **Método**: GET
- **Descrição**: Verificação de atividade de baixo custo para o aplicativo e a conexão SQLite. O `HEALTHCHECK` do Docker e o loop de espera do ponto de entrada usam esta URL no localhost.
- **Resposta** (íntegro):

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

- **Resposta** (degradado):

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

- **Observações**:
  - Retorna 200 quando a inicialização é concluída e o `SELECT 1` é bem-sucedido
  - Retorna 503 quando a inicialização ou a verificação de conexão falha
  - Não lista nomes de tabelas nem executa consultas do painel
  - Nunca requer uma chave de API
  - Quando qualquer lista de permissões de IP estiver habilitada, o IP do cliente deve ser loopback ou estar listado na lista CIDR de administrador ou externa (caso contrário, `403` `IP_NOT_ALLOWED`)
  - Clientes que não sejam de loopback têm taxa limitada (`429` `PROBE_RATE_LIMITED`, 30/minuto e 120/hora). O loopback (`127.0.0.1`, `::1`) nunca é limitado

## Sonda de conectividade - `/api/ping` {/* #connectivity-probe---apiping */}
- **Endpoint**: `/api/ping`
- **Método**: GET
- **Descrição**: Resposta `{ "ok": true }` mínima usada pela verificação de conectividade do painel (a cada 30 segundos).
- **Resposta**:

  ```json
  {
    "ok": true
  }
  ```

- **Observações**:
  - Nunca requer uma chave de API ou um cookie de sessão
  - Mesma união de lista de permissões e regras de loopback que `/api/health`
  - Clientes que não sejam de loopback têm taxa limitada (`429` `PROBE_RATE_LIMITED`, 60/minuto e 600/hora)
