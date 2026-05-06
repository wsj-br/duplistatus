---
translation_last_updated: '2026-05-06T23:19:29.427Z'
source_file_mtime: '2026-05-06T23:18:51.418Z'
source_file_hash: 92de20237e937c17944b837bfeae8ee1ff73d8f798d555278795e7a4b1be3864
translation_language: pt-BR
source_file_path: documentation/docs/api-reference/configuration-apis.md
translation_models:
  - qwen/qwen3-235b-a22b-2507
---
# Gerenciamento de Configuração {#configuration-management}

## Obter Configuração de E-mail - `/api/configuration/email` {#get-email-configuration---apiconfigurationemail}
- **Endpoint**: `/api/configuration/email`
- **Método**: GET
- **Descrição**: Recupera a configuração atual de notificações por e-mail e se as notificações por e-mail estão habilitadas/configuradas.
- **Autenticação**: Requer sessão válida e token CSRF
- **Resposta** (configurado):

  ```json
  {
    "configured": true,
    "config": {
      "host": "smtp.example.com",
      "port": 465,
      "connectionType": "ssl",
      "username": "user@example.com",
      "mailto": "admin@example.com",
      "senderName": "duplistatus",
      "fromAddress": "user@example.com",
      "requireAuth": true,
      "hasPassword": true
    },
    "message": "Email is configured and ready to use."
  }
  ```

- **Resposta** (não configurado):

  ```json
  {
    "configured": false,
    "config": null,
    "message": "Email is not configured. Please configure SMTP settings."
  }
  ```

- **Respostas de Erro**:
  - `400`: Chave mestra inválida - Todas as senhas e configurações criptografadas devem ser reconfiguradas
  - `401`: Não autorizado - Sessão ou token CSRF inválido
  - `500`: Falha ao obter a configuração de e-mail
- **Notas**:
  - Retorna a configuração sem a senha por segurança
  - Inclui o campo `hasPassword` para indicar se a senha está definida
  - Inclui os campos `connectionType` (plain|starttls|ssl), `senderName`, `fromAddress` e `requireAuth`
  - Indica se as notificações por e-mail estão disponíveis para uso em testes e produção
  - Trata erros de validação da chave mestra de forma adequada

## Atualizar Configuração de E-mail - `/api/configuration/email` {#update-email-configuration---apiconfigurationemail}
- **Endpoint**: `/api/configuration/email`
- **Método**: POST
- **Descrição**: Atualiza a configuração de notificações por e-mail SMTP.
- **Autenticação**: Requer sessão válida e token CSRF
- **Corpo da Requisição**:

  ```json
  {
    "host": "smtp.example.com",
    "port": 465,
    "secure": true,
    "username": "user@example.com",
    "password": "password",
    "mailto": "admin@example.com"
  }
  ```

- **Resposta**:

  ```json
  {
    "success": true,
    "message": "SMTP configuration saved successfully"
  }
  ```

- **Respostas de Erro**:
  - `400`: Campos obrigatórios ausentes ou número de porta inválido
  - `401`: Não autorizado - Sessão ou token CSRF inválido
  - `500`: Falha ao salvar a configuração SMTP
- **Notas**:
  - Todos os campos (host, porta, nome de usuário, senha, mailto) são obrigatórios
  - A porta deve ser um número válido entre 1 e 65535
  - O campo Secure é booleano (verdadeiro para SSL/TLS)
  - A senha é gerenciada separadamente por meio do endpoint de senha

## Excluir Configuração de E-mail - `/api/configuration/email` {#delete-email-configuration---apiconfigurationemail}
- **Endpoint**: `/api/configuration/email`
- **Método**: DELETE
- **Descrição**: Exclui a configuração de notificações por e-mail SMTP.
- **Autenticação**: Requer sessão válida e token CSRF
- **Resposta**:

  ```json
  {
    "success": true,
    "message": "SMTP configuration deleted successfully"
  }
  ```

- **Respostas de Erro**:
  - `401`: Não autorizado - Sessão ou token CSRF inválido
  - `404`: Nenhuma configuração SMTP encontrada para exclusão
  - `500`: Falha ao excluir a configuração SMTP
- **Notas**:
  - Esta operação remove permanentemente a configuração SMTP
  - Retorna 404 se nenhuma configuração existir para exclusão

## Atualizar Senha de E-mail - `/api/configuration/email/password` {#update-email-password---apiconfigurationemailpassword}
- **Endpoint**: `/api/configuration/email/password`
- **Método**: PATCH
- **Descrição**: Atualiza a senha de e-mail para autenticação SMTP.
- **Autenticação**: Requer sessão válida e token CSRF
- **Corpo da Requisição**:

  ```json
  {
    "password": "new-password",
    "config": {
      "host": "smtp.example.com",
      "port": 465,
      "secure": true,
      "username": "user@example.com",
      "mailto": "admin@example.com"
    }
  }
  ```

- **Resposta**:

  ```json
  {
    "message": "Email password updated successfully"
  }
  ```

- **Respostas de Erro**:
  - `400`: A senha deve ser uma string ou estão faltando campos obrigatórios na configuração
  - `401`: Não autorizado - Sessão ou token CSRF inválido
  - `500`: Falha ao atualizar a senha de e-mail
- **Notas**:
  - A senha pode ser uma string vazia para limpar a senha
  - Se nenhuma configuração SMTP existir, cria uma configuração mínima com base na configuração fornecida
  - O parâmetro Config é obrigatório quando não existe uma configuração SMTP existente
  - A senha é armazenada com segurança usando criptografia

## Obter Token CSRF da Senha de E-mail - `/api/configuration/email/password` {#get-email-password-csrf-token---apiconfigurationemailpassword}
- **Endpoint**: `/api/configuration/email/password`
- **Método**: GET
- **Descrição**: Recupera um token CSRF para operações de senha de e-mail.
- **Autenticação**: Requer sessão válida
- **Resposta**:

  ```json
  {
    "csrfToken": "csrf-token-string"
  }
  ```

- **Respostas de Erro**:
  - `401`: Sessão inválida ou expirada
  - `500`: Falha ao gerar token CSRF
- **Notas**:
  - Retorna token CSRF para uso em operações de atualização de senha
  - A sessão deve ser válida para gerar o token

## Obter Configuração Unificada - `/api/configuration/unified` {#get-unified-configuration---apiconfigurationunified}
- **Endpoint**: `/api/configuration/unified`
- **Método**: GET
- **Descrição**: Recupera um objeto de configuração unificada contendo todos os dados de configuração, incluindo configurações de cron, frequência de notificação e servidores com backups.
- **Autenticação**: Requer sessão válida e token CSRF
- **Resposta**:

  ```json
  {
    "ntfy": {
      "url": "https://ntfy.sh",
      "topic": "duplistatus-notifications",
      "accessToken": ""
    },
    "templates": {
      "language": "en",
      "success": {
        "title": "✅ {status} - {backup_name} @ {server_name}",
        "message": "Backup {backup_name} on {server_name} completed with status '{status}' at {backup_date} in {duration}.",
        "priority": "default",
        "tags": "duplicati, duplistatus, success"
      },
      "warning": {
        "title": "⚠️ {status} - {backup_name} @ {server_name}",
        "message": "Backup {backup_name} on {server_name} completed with status '{status}' at {backup_date}.",
        "priority": "high",
        "tags": "duplicati, duplistatus, warning, error"
      },
      "overdueBackup": {
        "title": "🕑 Overdue - {backup_name} @ {server_name}",
        "message": "The backup {backup_name} is overdue on {server_name}.",
        "priority": "default",
        "tags": "duplicati, duplistatus, overdue"
      }
    },
    "email": {
      "host": "smtp.example.com",
      "port": 465,
      "connectionType": "ssl",
      "username": "user@example.com",
      "mailto": "admin@example.com",
      "senderName": "duplistatus",
      "fromAddress": "user@example.com",
      "requireAuth": true,
      "hasPassword": true
    },
    "overdue_tolerance": "1h",
    "backup_settings": {
      "server1:backup1": {
        "notificationEvent": "all",
        "expectedInterval": 24,
        "overdueBackupCheckEnabled": true,
        "intervalUnit": "hours",
        "expectedBackupDate": "2025-02-07T00:00:00.000Z",
        "lastBackupDate": "2025-02-06T00:00:00.000Z"
      }
    },
    "serverAddresses": [
      {
        "id": "server1",
        "name": "Server 1",
        "server_url": "http://localhost:8200"
      }
    ],
    "cronConfig": {
      "cronExpression": "*/20 * * * *",
      "enabled": true
    },
    "notificationFrequency": "every_day",
    "serversWithBackups": [
      {
        "id": "server1",
        "name": "Server 1",
        "backupName": "backup1",
        "server_url": "http://localhost:8200",
        "alias": "My Server",
        "note": "Primary backup server",
        "hasPassword": true,
        "expectedBackupDate": "2025-02-07T00:00:00.000Z",
        "lastBackupDate": "2025-02-06T00:00:00.000Z"
      }
    ]
  }
  ```

- **Respostas de Erro**:
  - `500`: Erro do servidor ao buscar a configuração unificada
- **Notas**:
  - Retorna todos os dados de configuração em uma única resposta
  - Inclui configurações de cron, frequência de notificações e servidores com backups
  - A configuração de e-mail inclui o campo `hasPassword`, mas não a senha real
  - Busca todos os dados em paralelo para melhor desempenho

## Obter Configuração do NTFY - `/api/configuration/ntfy` {#get-ntfy-configuration---apiconfigurationntfy}
- **Endpoint**: `/api/configuration/ntfy`
- **Método**: GET
- **Descrição**: Recupera as configurações atuais de configuração do NTFY.
- **Autenticação**: Requer sessão válida e token CSRF
- **Resposta**:

  ```json
  {
    "ntfy": {
      "url": "https://ntfy.sh",
      "topic": "duplistatus-notifications",
      "accessToken": "optional-access-token"
    }
  }
  ```

- **Respostas de Erro**:
  - `401`: Não autorizado - Sessão inválida ou token CSRF
  - `500`: Falha ao buscar a configuração do NTFY
- **Notas**:
  - Retorna as configurações atuais da configuração do NTFY
  - Utilizado para gerenciamento do sistema de notificações
  - Requer autenticação para acessar os dados de configuração

## Obter Configuração de Notificação - `/api/configuration/notifications` {#get-notification-configuration---apiconfigurationnotifications}
- **Endpoint**: `/api/configuration/notifications`
- **Método**: GET
- **Descrição**: Recupera a configuração atual de frequência de notificação.
- **Autenticação**: Requer sessão válida e token CSRF
- **Resposta**:

  ```json
  {
    "value": "every_day"
  }
  ```

- **Respostas de Erro**:
  - `401`: Não autorizado - Sessão inválida ou token CSRF
  - `500`: Falha ao buscar a configuração
- **Notas**:
  - Recupera a configuração atual da frequência de notificações
  - Utilizado para gerenciamento de notificações de backup atrasado
  - Retorna um dos valores: `"onetime"`, `"every_day"`, `"every_week"`, `"every_month"`

## Atualizar Configuração de Notificação - `/api/configuration/notifications` {#update-notification-configuration---apiconfigurationnotifications}
- **Endpoint**: `/api/configuration/notifications`
- **Método**: POST
- **Descrição**: Atualiza a configuração de notificação (configurações do NTFY ou frequência de notificação).
- **Autenticação**: Requer sessão válida e token CSRF
- **Corpo da Requisição**:
  Para configuração do NTFY:

  ```json
  {
    "ntfy": {
      "enabled": true,
      "url": "https://ntfy.sh",
      "topic": "duplistatus-notifications",
      "accessToken": "optional-access-token"
    }
  }
  ```

Para frequência de notificação:

  ```json
  {
    "value": "every_week"
  }
  ```

- **Resposta**:
  Para configuração do NTFY:

  ```json
  {
    "message": "Notification config updated successfully",
    "ntfy": {
      "enabled": true,
      "url": "https://ntfy.sh",
      "topic": "duplistatus-notifications",
      "accessToken": "optional-access-token"
    }
  }
  ```

Para frequência de notificação:

  ```json
  {
    "value": "every_week"
  }
  ```

- **Valores Disponíveis**: `"onetime"`, `"every_day"`, `"every_week"`, `"every_month"`
- **Respostas de Erro**:
  - `401`: Não autorizado - Sessão inválida ou token CSRF
  - `400`: Configuração do NTFY é obrigatória ou valor inválido
  - `500`: Erro do servidor ao atualizar a configuração de notificação
- **Notas**:
  - Suporta atualizações tanto da configuração do NTFY quanto da frequência de notificação
  - Atualiza apenas a configuração do NTFY quando o campo ntfy é fornecido
  - Atualiza a frequência de notificação quando o campo value é fornecido
  - Gera um tópico padrão se nenhum for fornecido
  - Mantém as configurações existentes
  - Usa o campo `accessToken` em vez de campos separados de nome de usuário/senha
  - Valida o valor da frequência de notificação contra as opções permitidas
  - Afeta a frequência com que as notificações de atraso são enviadas

## Atualizar Configurações de Backup - `/api/configuration/backup-settings` {#update-backup-settings---apiconfigurationbackup-settings}
- **Endpoint**: `/api/configuration/backup-settings`
- **Método**: POST
- **Descrição**: Atualiza as configurações de notificação de backup para servidores/backups específicos.
- **Autenticação**: Requer sessão válida e token CSRF
- **Corpo da Requisição**:

  ```json
  {
    "backupSettings": {
      "Server Name:Backup Name": {
        "notificationEvent": "all",
        "expectedInterval": 24,
        "overdueBackupCheckEnabled": true,
        "intervalUnit": "hours"
      }
    }
  }
  ```

- **Resposta**:

  ```json
  {
    "message": "Backup settings updated successfully"
  }
  ```

- **Respostas de Erro**:
  - `401`: Não autorizado - Sessão inválida ou token CSRF
  - `400`: backupSettings é obrigatório
  - `500`: Erro do servidor ao atualizar as configurações de backup
- **Notas**:
  - Atualiza as configurações de notificação de backup para servidores/backups específicos
  - Limpa notificações de backup atrasado para backups desativados
  - Limpa notificações quando as configurações de tempo limite são alteradas

## Atualizar Modelos de Notificação - `/api/configuration/templates` {#update-notification-templates---apiconfigurationtemplates}
- **Endpoint**: `/api/configuration/templates`
- **Método**: POST
- **Descrição**: Atualiza os modelos de notificação.
- **Autenticação**: Requer sessão válida e token CSRF
- **Corpo da Requisição**:

  ```json
  {
    "templates": {
      "success": {
        "title": "✅ {status} - {backup_name} @ {server_name}",
        "message": "Backup {backup_name} on {server_name} completed with status '{status}' at {backup_date} in {duration}.",
        "priority": "default",
        "tags": "duplicati, duplistatus, success"
      }
    }
  }
  ```

- **Resposta**:

  ```json
  {
    "message": "Notification templates updated successfully"
  }
  ```

- **Respostas de Erro**:
  - `401`: Não autorizado - Sessão inválida ou token CSRF
  - `400`: modelos são obrigatórios
  - `500`: Erro do servidor ao atualizar os modelos de notificação
- **Notas**:
  - Atualiza os modelos de notificação para diferentes status de backup
  - Mantém as configurações existentes
  - Os modelos suportam substituição de variáveis

## Obter Tolerância de Atraso - `/api/configuration/overdue-tolerance` {#get-overdue-tolerance---apiconfigurationoverdue-tolerance}
- **Endpoint**: `/api/configuration/overdue-tolerance`
- **Método**: GET
- **Descrição**: Recupera a configuração atual de tolerância de atraso.
- **Resposta**:

  ```json
  {
    "overdue_tolerance": "1h"
  }
  ```

- **Respostas de Erro**:
  - `500`: Falha ao obter a tolerância de atraso
- **Notas**:
  - Retorna a configuração atual de tolerância de atraso
  - Utilizado para exibir a configuração atual

## Atualizar Tolerância de Atraso - `/api/configuration/overdue-tolerance` {#update-overdue-tolerance---apiconfigurationoverdue-tolerance}
- **Endpoint**: `/api/configuration/overdue-tolerance`
- **Método**: POST
- **Descrição**: Atualiza a configuração de tolerância de atraso.
- **Autenticação**: Requer sessão válida e token CSRF
- **Corpo da Requisição**:

  ```json
  {
    "overdue_tolerance": "1h"
  }
  ```

- **Resposta**:

  ```json
  {
    "message": "Overdue tolerance updated successfully"
  }
  ```

- **Respostas de Erro**:
  - `401`: Não autorizado - Sessão inválida ou token CSRF inválido
  - `400`: overdue_tolerance é obrigatório
  - `500`: Erro do servidor ao atualizar a tolerância de atraso
- **Notas**:
  - Atualiza a configuração de tolerância de atraso (aceita formato de string como "1h", "2h", etc.)
  - Afeta quando os backups são considerados atrasados
  - Utilizado pelo verificador de backup atrasado
