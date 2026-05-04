---
translation_last_updated: '2026-04-18T00:01:00.788Z'
source_file_mtime: '2026-03-05T22:33:28.419Z'
source_file_hash: c9fa1157e8f98ef3d8071252f75634990ea86aa2c6de3db3a16b0f911b7a2789
translation_language: pt-BR
source_file_path: documentation/docs/api-reference/notification-apis.md
translation_models:
  - qwen/qwen3-235b-a22b-2507
---
# Sistema de Notificação {#notification-system}

## Notificação de Teste - `/api/notifications/test` {#test-notification-apinotificationstest}
- **Endpoint**: `/api/notifications/test`
- **Método**: POST
- **Descrição**: Envia notificações de teste (simples, baseadas em modelo ou por e-mail) para verificar a configuração de notificação.
- **Autenticação**: Requer sessão válida e token CSRF
- **Corpo da Requisição**:
  Para teste simples:

    ```json
    {
      "type": "simple",
      "ntfyConfig": {
        "url": "https://ntfy.sh",
        "topic": "test-topic",
        "accessToken": "optional-access-token"
      }
    }
    ```

Para teste de modelo:

    ```json
    {
      "type": "template",
      "ntfyConfig": {
        "url": "https://ntfy.sh",
        "topic": "test-topic",
        "accessToken": "optional-access-token"
      },
      "template": {
        "title": "Test Title",
        "message": "Test message with {variable}",
        "priority": "default",
        "tags": "test"
      }
    }
    ```

Para teste de e-mail:

    ```json
    {
      "type": "email"
    }
    ```

- **Resposta**:
  Para teste simples:

  ```json
  {
    "message": "Test notification sent successfully"
  }
  ```

Para teste de modelo:

  ```json
  {
    "success": true,
    "message": "Test notifications sent successfully via NTFY and Email",
    "channels": ["NTFY", "Email"]
  }
  ```

Para teste de e-mail:

  ```json
  {
    "message": "Test email sent successfully"
  }
  ```

O conteúdo do e-mail de teste exibe:
  - Nome do host e porta do servidor SMTP
  - Tipo de Conexão (SMTP Puro, STARTTLS ou SSL/TLS Direto)
  - Status de exigência de autenticação SMTP
  - Nome de usuário SMTP (exibido apenas quando a autenticação é necessária)
  - Endereço de e-mail do destinatário
  - Endereço de origem e nome do remetente usados no e-mail
  - Data e hora do teste
- **Respostas de Erro**:
  - `401`: Não autorizado - Sessão ou token CSRF inválido
  - `400`: Configuração do NTFY é necessária, configuração inválida ou e-mail não configurado
  - `500`: Falha ao enviar notificação de teste com detalhes do erro
- **Notas**:
  - Suporta mensagens de teste simples, notificações baseadas em modelo e testes por e-mail
  - O teste de modelo usa dados de exemplo para substituir as variáveis do modelo
  - Inclui data e hora na mensagem de teste
  - Valida URL e tópico do NTFY antes do envio
  - Usa o campo `accessToken` para autenticação
  - Para testes de modelo, envia notificações para NTFY e e-mail (se configurado)
  - Testes por e-mail exigem que a configuração SMTP esteja configurada
  - O endpoint de e-mail de teste limpa o cache da requisição antes de ler a configuração SMTP, garantindo que scripts externos possam atualizar a configuração e ela seja imediatamente refletida nos e-mails de teste

## Verificar Backups Atrasados - `/api/notifications/check-overdue` {#check-overdue-backups-apinotificationscheck-overdue}
- **Endpoint**: `/api/notifications/check-overdue`
- **Método**: POST
- **Descrição**: Aciona manualmente a verificação de backups atrasados e envia notificações.
- **Autenticação**: Requer sessão válida e token CSRF
- **Resposta**:

  ```json
  {
    "message": "Overdue backup check completed",
    "statistics": {
      "totalBackupConfigs": 5,
      "checkedBackups": 5,
      "overdueBackupsFound": 2,
      "notificationsSent": 2
    }
  }
  ```

- **Respostas de Erro**:
  - `500`: Falha ao verificar backups atrasados
- **Notas**:
  - Aciona manualmente a verificação de backups atrasados
  - Retorna estatísticas sobre o processo de verificação
  - Envia notificações para backups atrasados encontrados

## Limpar Data e Hora de Backups Atrasados - `/api/notifications/clear-overdue-timestamps` {#clear-overdue-timestamps-apinotificationsclear-overdue-timestamps}
- **Endpoint**: `/api/notifications/clear-overdue-timestamps`
- **Método**: POST
- **Descrição**: Limpa todos os registros de data e hora de notificações de backups atrasados, permitindo que as notificações sejam enviadas novamente.
- **Autenticação**: Requer sessão válida e token CSRF
- **Resposta**:

  ```json
  {
    "message": "Overdue backup notification timestamps cleared successfully"
  }
  ```

- **Respostas de Erro**:
  - `500`: Falha ao limpar os registros de data e hora de backups atrasados
- **Notas**:
  - Limpa todos os registros de data e hora de notificações de backups atrasados
  - Permite que as notificações sejam enviadas novamente
  - Útil para testar o sistema de notificação
