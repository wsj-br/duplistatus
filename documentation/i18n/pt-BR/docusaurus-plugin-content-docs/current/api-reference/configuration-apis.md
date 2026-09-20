# Gerenciamento de Configuração {/* #configuration-management */}

## Obter Configuração de E-mail - `/api/configuration/email` {/* #get-email-configuration---apiconfigurationemail */}
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
  - `400`: Chave mestra é inválida - Todas as senhas e configurações criptografadas devem ser reconfiguradas
  - `401`: Não autorizado - Sessão ou token CSRF inválido
  - `500`: Falha ao obter configuração de e-mail
- **Notas**:
  - Retorna configuração sem senha por segurança
  - Inclui campo `hasPassword` para indicar se a senha está definida
  - Inclui campos `connectionType` (plain|starttls|ssl), `senderName`, `fromAddress` e `requireAuth`
  - Indica se as notificações por e-mail estão disponíveis para uso em teste e produção
  - Trata erros de validação da chave mestra com elegância

## Atualizar Configuração de E-mail - `/api/configuration/email` {/* #update-email-configuration---apiconfigurationemail */}
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
  - `500`: Falha ao salvar configuração SMTP
- **Notas**:
  - Todos os campos (host, porta, nome de usuário, senha, mailto) são obrigatórios
  - A porta deve ser um número válido entre 1 e 65535
  - O campo seguro é booleano (verdadeiro para SSL/TLS)
  - A senha é gerenciada separadamente através do endpoint de senha

## Excluir Configuração de E-mail - `/api/configuration/email` {/* #delete-email-configuration---apiconfigurationemail */}
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
  - `500`: Falha ao excluir configuração SMTP
- **Notas**:
  - Esta operação remove permanentemente a configuração SMTP
  - Retorna 404 se nenhuma configuração existir para exclusão
  - Retorna 400 enquanto o modo Resumo Diário estiver habilitado, porque esse modo requer SMTP

## Atualizar Senha de E-mail - `/api/configuration/email/password` {/* #update-email-password---apiconfigurationemailpassword */}
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
  - `400`: A senha deve ser uma string ou campos de configuração obrigatórios ausentes
  - `401`: Não autorizado - Sessão ou token CSRF inválido
  - `500`: Falha ao atualizar senha de e-mail
- **Notas**:
  - A senha pode ser uma string vazia para limpar a senha
  - Se nenhuma configuração SMTP existir, cria uma configuração mínima a partir da configuração fornecida
  - O parâmetro config é obrigatório quando nenhuma configuração SMTP existente existe
  - A senha é armazenada com segurança usando criptografia

## Obter Token CSRF da Senha de E-mail - `/api/configuration/email/password` {/* #get-email-password-csrf-token---apiconfigurationemailpassword */}
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
  - Retorna token CSRF para uso com operações de atualização de senha
  - A sessão deve ser válida para gerar o token

## Obter Configuração Unificada - `/api/configuration/unified` {/* #get-unified-configuration---apiconfigurationunified */}
- **Endpoint**: `/api/configuration/unified`
- **Método**: GET
- **Descrição**: Recupera um objeto de configuração unificado contendo todos os dados de configuração, incluindo configurações de cron, frequência de notificação e servidores com backups.
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
      "language": "en-GB",
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
      },
      "dailySummary": {
        "email": {
          "title": "Daily Backup Summary — {summary_date} — ✅ {success_count} Success, ⚠️ {warning_count} Warning, 🕑 {overdue_count} Overdue, 🛑 {error_count} Error, ❌ {fatal_count} Fatal",
          "message": "## Daily backup summary"
        }
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
    "overdue_tolerance": "2h",
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
  - `500`: Erro do servidor ao buscar configuração unificada
- **Notas**:
  - Retorna todos os dados de configuração em uma única resposta
  - Inclui configurações do cron, frequência de notificação e servidores com backups
  - A configuração de e-mail inclui o campo `hasPassword` mas não a senha real
  - Busca todos os dados em paralelo para melhor desempenho

## Obter Configuração do NTFY - `/api/configuration/ntfy` {/* #get-ntfy-configuration---apiconfigurationntfy */}
- **Endpoint**: `/api/configuration/ntfy`
- **Método**: GET
- **Descrição**: Recupera as configurações atuais do NTFY.
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
  - `401`: Não autorizado - Sessão ou token CSRF inválido
  - `500`: Falha ao buscar configuração do NTFY
- **Notas**:
  - Retorna as configurações atuais da configuração do NTFY
  - Usado para gerenciamento do sistema de notificações
  - Requer autenticação para acessar dados de configuração

## Obter Configuração de Notificação - `/api/configuration/notifications` {/* #get-notification-configuration---apiconfigurationnotifications */}
- **Endpoint**: `/api/configuration/notifications`
- **Método**: GET
- **Descrição**: Recupera a configuração atual da frequência de notificação.
- **Autenticação**: Requer sessão válida e token CSRF
- **Resposta**:

  ```json
  {
    "value": "every_day"
  }
  ```

- **Respostas de Erro**:
  - `401`: Não autorizado - Sessão ou token CSRF inválido
  - `500`: Falha ao buscar configuração
- **Notas**:
  - Recupera a configuração atual da frequência de notificação
  - Usado para gerenciamento de notificações de backup atrasado
  - Retorna um dos seguintes: `"onetime"`, `"every_day"`, `"every_week"`, `"every_month"`

## Atualizar Configuração de Notificação - `/api/configuration/notifications` {/* #update-notification-configuration---apiconfigurationnotifications */}
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

Para a frequência de notificação:

  ```json
  {
    "value": "every_week"
  }
  ```

- **Resposta**:
  Para a configuração do NTFY:

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

Para a frequência de notificação:

  ```json
  {
    "value": "every_week"
  }
  ```

- **Valores Disponíveis**: `"onetime"`, `"every_day"`, `"every_week"`, `"every_month"`
- **Respostas de Erro**:
  - `401`: Não autorizado - Sessão ou token CSRF inválido
  - `400`: Configuração do NTFY é necessária ou valor inválido
  - `500`: Erro do servidor ao atualizar configuração de notificação
- **Notas**:
  - Suporta tanto atualização da configuração do NTFY quanto da frequência de notificação
  - Atualiza apenas a configuração do NTFY quando o campo ntfy é fornecido
  - Atualiza a frequência de notificação quando o campo value é fornecido
  - Gera tópico padrão se nenhum for fornecido
  - Preserva configurações existentes de configuração
  - Usa campo `accessToken` em vez de campos separados de nome de usuário/senha
  - Valida o valor da frequência de notificação contra opções permitidas
  - Afeta com que frequência as notificações atrasadas são enviadas

## Atualizar configurações de backup - `/api/configuration/backup-settings` {/* #update-backup-settings---apiconfigurationbackup-settings */}
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
  - `401`: Não autorizado - Sessão ou token CSRF inválido
  - `400`: backupSettings é obrigatório
  - `500`: Erro no servidor ao atualizar as configurações de backup
- **Observações**:
  - Atualiza as configurações de notificação de backup para servidores/backups específicos
  - Limpa as notificações de backup atrasadas para backups desativados
  - Limpa as notificações quando as configurações de tempo limite são alteradas

## Atualizar modelos de notificação - `/api/configuration/templates` {/* #update-notification-templates---apiconfigurationtemplates */}
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
  - `401`: Não autorizado - Sessão ou token CSRF inválido
  - `400`: modelos são obrigatórios
  - `500`: Erro no servidor ao atualizar os modelos de notificação
- **Observações**:
  - Atualiza modelos de notificação para diferentes status de backup
  - Preserva as configurações existentes de configuração
  - Os modelos suportam corpos de e-mail em Markdown e substituição `{placeholder}`
  - Um modelo de e-mail `dailySummary` (assunto e corpo em Markdown) é obrigatório

## Resumo Diário - `/api/configuration/daily-summary` {/* #daily-summary---apiconfigurationdaily-summary */}
- **Endpoint**: `/api/configuration/daily-summary`
- **Método**: GET, POST
- **Descrição**: Lê ou atualiza o modo Resumo Diário. O GET retorna configurações higienizadas, a integridade do despachante, a próxima ocorrência e o status da entrega do e-mail. O POST salva `enabled`, `utcTime` (`HH:mm` UTC), `timeZone` (fuso horário IANA do navegador a partir do último salvamento), `publicUrl` opcional e `smtpRecipient` opcional (quando vazio, usa o destinatário SMTP das configurações de e-mail). A ativação requer SMTP válido. Alterar `utcTime` atualiza `daily-summary-dispatch` para `minute hour * * *` UTC e recarrega o serviço cron. Alterar o agendamento define a próxima ocorrência **futura**.
- **Autenticação**: GET requer uma sessão válida e token CSRF. POST requer uma sessão de administrador e token CSRF.
- **Respostas de Erro**:
  - `400`: Hora/fuso horário inválido, URL pública inválida, destinatário SMTP inválido ou SMTP ausente
  - `401`: Não autorizado
  - `500`: Falha ao ler ou atualizar o Resumo Diário

## Enviar Resumo Diário - `/api/configuration/daily-summary/send` {/* #send-daily-summary---apiconfigurationdaily-summarysend */}
- **Endpoint**: `/api/configuration/daily-summary/send`
- **Método**: POST
- **Descrição**: Envia um snapshot extra do status atual imediatamente. Não consome a próxima ocorrência agendada. Usa o SMTP armazenado. Envia para `daily_summary.smtpRecipient` quando definido, caso contrário, para o destinatário das configurações de e-mail. Não aceita endereços de destinatários na requisição. Registra `daily_summary_sent` no log de auditoria (sistema).
- **Autenticação**: Requer sessão de administrador e token CSRF

## Tentar Novamente o Resumo Diário - `/api/configuration/daily-summary/retry` {/* #retry-daily-summary---apiconfigurationdaily-summaryretry */}
- **Endpoint**: `/api/configuration/daily-summary/retry`
- **Método**: POST
- **Descrição**: Tenta novamente os canais que falharam a partir da carga persistida. Corpo opcional `{ "occurrenceKey": "..." }`; caso contrário, tenta novamente a entrega de e-mail com falha mais recente.
- **Autenticação**: Requer sessão de administrador e token CSRF

## Visualização do Resumo Diário - `/api/configuration/daily-summary/preview` {/* #preview-daily-summary---apiconfigurationdaily-summarypreview */}
- **Endpoint**: `/api/configuration/daily-summary/preview`
- **Método**: POST
- **Descrição**: Renderiza o snapshot atual sem enviar e sem registrar linhas no livro-razão de entregas.
- **Autenticação**: Requer sessão válida e token CSRF

## Obter Tolerância de Atraso - `/api/configuration/overdue-tolerance` {/* #get-overdue-tolerance---apiconfigurationoverdue-tolerance */}
- **Endpoint**: `/api/configuration/overdue-tolerance`
- **Método**: GET
- **Descrição**: Recupera a configuração atual de tolerância de atraso.
- **Resposta**:

  ```json
  {
    "overdue_tolerance": "2h"
  }
  ```

- **Respostas de Erro**:
  - `500`: Falha ao obter tolerância de atraso
- **Observações**:
  - Retorna a configuração atual de tolerância de atraso
  - Usado para exibir a configuração atual

## Atualizar Tolerância de Atraso - `/api/configuration/overdue-tolerance` {/* #update-overdue-tolerance---apiconfigurationoverdue-tolerance */}
- **Endpoint**: `/api/configuration/overdue-tolerance`
- **Método**: POST
- **Descrição**: Atualiza a configuração de tolerância de atraso.
- **Autenticação**: Requer sessão válida e token CSRF
- **Corpo da Requisição**:

  ```json
  {
    "overdue_tolerance": "2h"
  }
  ```

- **Resposta**:

  ```json
  {
    "message": "Overdue tolerance updated successfully"
  }
  ```

- **Respostas de Erro**:
  - `401`: Não autorizado - Sessão ou token CSRF inválido
  - `400`: overdue_tolerance é obrigatório
  - `500`: Erro no servidor ao atualizar a tolerância de atraso
- **Observações**:
  - Atualiza a configuração de tolerância de atraso (aceita formato de string como `"1h"`, `"2h"`, etc.; o padrão para novas instalações é `2h`)
  - Afeta quando os backups são considerados atrasados
  - Usado pelo verificador de backup atrasado

## Segurança de APIs Externas - `/api/configuration/external-api-security` {/* #external-api-security---apiconfigurationexternal-api-security */}
- **Endpoint**: `/api/configuration/external-api-security`
- **Métodos**: GET, PATCH
- **Descrição**: Lê ou atualiza se as APIs externas exigem uma chave, além do tamanho de `/api/upload` e dos limites de taxa.
- **Autenticação**: Requer privilégios de administrador, sessão válida e token CSRF
- **Corpo do PATCH**:

  ```json
  {
    "requireApiKey": false,
    "uploadLimits": {
      "enabled": true,
      "maxBytes": 5242880,
      "perMinute": 20,
      "perHour": 200
    }
  }
  ```

## Lista de Permissões de IP - `/api/configuration/ip-allowlist` {/* #ip-allowlist---apiconfigurationip-allowlist */}
- **Endpoint**: `/api/configuration/ip-allowlist`
- **Métodos**: GET, PATCH
- **Descrição**: Lê ou atualiza os proxies confiáveis e as listas de permissões de CIDR de administrador / APIs externas. Habilitar a lista de administradores falhará a menos que o IP do cliente atual já esteja listado (o loopback está isento).
- **Autenticação**: Requer privilégios de administrador, sessão válida e token CSRF
