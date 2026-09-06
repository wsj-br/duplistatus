# Gerenciamento do Serviço Cron {#cron-service-management}

## Obter Configuração do Cron - `/api/cron-config` {#get-cron-configuration---apicron-config}
- **Endpoint**: `/api/cron-config`
- **Método**: GET
- **Descrição**: Recupera a configuração atual do serviço de cron.
- **Autenticação**: Requer sessão válida e token CSRF
- **Resposta**:

  ```json
  {
    "cronExpression": "*/20 * * * *",
    "enabled": true
  }
  ```

- **Respostas de Erro**:
  - `500`: Falha ao obter a configuração do cron
- **Notas**:
  - Retorna a configuração atual do serviço cron
  - Inclui expressão cron e status habilitado
  - Utilizado para gerenciamento do serviço cron

## Atualizar Configuração do Cron - `/api/cron-config` {#update-cron-configuration---apicron-config}
- **Endpoint**: `/api/cron-config`
- **Método**: POST
- **Descrição**: Atualiza a configuração do serviço de cron.
- **Autenticação**: Requer sessão válida e token CSRF
- **Corpo da Requisição**:

  ```json
  {
    "interval": "20min"
  }
  ```

- **Resposta**:

  ```json
  {
    "success": true
  }
  ```

- **Intervalos Disponíveis**: `"disabled"`, `"1min"`, `"5min"`, `"10min"`, `"15min"`, `"20min"`, `"30min"`, `"1hour"`, `"2hours"`
- **Respostas de Erro**:
  - `400`: Intervalo é obrigatório
  - `500`: Falha ao atualizar a configuração do cron
- **Notas**:
  - Atualiza a configuração do serviço cron
  - Valida o intervalo com base nas opções permitidas
  - Afeta a frequência da verificação de backup atrasado

## Proxy do Serviço de Cron - `/api/cron/*` {#cron-service-proxy---apicron}
- **Endpoint**: `/api/cron/*`
- **Método**: GET, POST
- **Descrição**: Proxies de solicitações para o serviço de cron. Este endpoint encaminha todas as solicitações para o serviço de cron em execução em uma porta separada.
- **Autenticação**: Requer sessão válida e token CSRF. GET é permitido para usuários autenticados; POST (iniciar/parar/acionar/recarregar) requer um administrador.
- **Parâmetros**:
  - `*`: Qualquer caminho que será encaminhado para o serviço cron
- **Resposta**: Depende do endpoint do serviço cron sendo acessado
- **Resposta de Erro** (503):

  ```json
  {
    "error": "Cron service is not running",
    "message": "The cron service is not available. Please start it with: npm run cron:start"
  }
  ```

- **Notas**:
  - Proxy para requisições ao serviço cron em `127.0.0.1`
  - Encaminha `CRON_SERVICE_SECRET` como `X-Cron-Service-Secret` quando definido
  - Retorna 503 se o serviço cron não estiver disponível
  - Suporta ambos os métodos GET e POST
  - Usado para gerenciamento do serviço cron a partir da interface web
  - `POST /trigger/daily-summary-dispatch` é rejeitado pelo serviço cron; use `/api/configuration/daily-summary/send` em vez disso
