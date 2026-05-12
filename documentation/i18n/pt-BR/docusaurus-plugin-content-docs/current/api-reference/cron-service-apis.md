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
- **Autenticação**: Requer sessão válida e token CSRF
- **Parâmetros**:
  - `*`: Qualquer caminho que será encaminhado ao serviço cron
- **Resposta**: Depende do endpoint do serviço cron acessado
- **Resposta de Erro** (503):

  ```json
  {
    "error": "Cron service is not running",
    "message": "The cron service is not available. Please start it with: npm run cron:start"
  }
  ```

- **Notas**:
  - Encaminha requisições ao serviço cron
  - Retorna 503 se o serviço cron não estiver disponível
  - Suporta os métodos GET e POST
  - Utilizado para gerenciamento do serviço cron pela interface web
