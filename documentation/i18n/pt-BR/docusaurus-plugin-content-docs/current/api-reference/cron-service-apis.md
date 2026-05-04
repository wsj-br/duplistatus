---
translation_last_updated: '2026-04-18T00:00:28.056Z'
source_file_mtime: '2026-03-05T22:33:28.419Z'
source_file_hash: add8fe98b40a55c51fdd7af09ba7c836d54475b8283bbdebecbe17f2c6beb071
translation_language: pt-BR
source_file_path: documentation/docs/api-reference/cron-service-apis.md
translation_models:
  - qwen/qwen3-235b-a22b-2507
---
# Gerenciamento do Serviço Cron {#cron-service-management}

## Obter Configuração do Cron - `/api/cron-config` {#get-cron-configuration-apicron-config}
- **Endpoint**: `/api/cron-config`
- **Método**: GET
- **Descrição**: Recupera a configuração atual do serviço cron.
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
  - Usado para gerenciamento do serviço cron

## Atualizar Configuração do Cron - `/api/cron-config` {#update-cron-configuration-apicron-config}
- **Endpoint**: `/api/cron-config`
- **Método**: POST
- **Descrição**: Atualiza a configuração do serviço cron.
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

## Proxy do Serviço Cron - `/api/cron/*` {#cron-service-proxy-apicron}
- **Endpoint**: `/api/cron/*`
- **Método**: GET, POST
- **Descrição**: Encaminha requisições ao serviço cron. Este endpoint encaminha todas as requisições ao serviço cron em execução em uma porta separada.
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
  - Usado para gerenciamento do serviço cron pela interface web
