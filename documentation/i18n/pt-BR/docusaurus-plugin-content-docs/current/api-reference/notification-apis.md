# Sistema de Notificações {/* #notification-system */}

## Notificação de Teste - `/api/notifications/test` {/* #test-notification---apinotificationstest */}
- **Endpoint**: `/api/notifications/test`
- **Método**: POST
- **Descrição**: Enviar notificações de teste (simples, baseadas em modelo ou e-mail) para verificar a configuração de notificações.
- **Autenticação**: Requer sessão de administrador e token CSRF
- **Corpo da Solicitação**:
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
  - Nome do servidor SMTP e porta
  - Tipo de conexão (SMTP Simples, STARTTLS ou SSL/TLS Direto)
  - Status de requisito de autenticação SMTP
  - Nome de usuário SMTP (mostrado apenas quando a autenticação é necessária)
  - E-mail do destinatário
  - Endereço de origem e nome do remetente usado para o e-mail
  - Timestamp do teste
- **Respostas de Erro**:
  - `401`: Não autorizado - Sessão inválida ou token CSRF inválido
  - `400`: Configuração do NTFY é necessária, configuração inválida ou e-mail não configurado
  - `500`: Falha ao enviar notificação de teste com detalhes do erro
- **Notas**:
  - Suporta mensagens de teste simples, notificações baseadas em modelo e testes de e-mail
  - Testes de modelo usam dados de amostra para substituir variáveis de modelo
  - Inclui timestamp na mensagem de teste
  - Testes do NTFY usam a configuração do NTFY armazenada; uma URL do NTFY fornecida pelo cliente não é usada
  - Usa campo `accessToken` para autenticação quando armazenado
  - Para testes de modelo, envia notificações para NTFY e e-mail (se configurado)
  - Testes de e-mail requerem que a configuração SMTP seja definida
  - O endpoint de e-mail de teste limpa o cache de solicitação antes de ler a configuração SMTP, garantindo que scripts externos possam atualizar a configuração e tê-la imediatamente refletida em e-mails de teste
  - Testes de modelo e envio imediato de Resumo Diário contornam a supressão por backup

## Visualização de Modelo de Notificação - `/api/notifications/preview` {/* #preview-notification-template---apinotificationspreview */}
- **Endpoint**: `/api/notifications/preview`
- **Método**: POST
- **Descrição**: Renderiza um modelo de notificação com o renderizador Markdown de produção sem enviar. O corpo inclui `kind` (`success`, `warning`, `overdueBackup` ou `dailySummaryEmail`) e o modelo sendo editado. Visualizações de Resumo Diário usam o snapshot real atual; outros tipos usam valores de amostra determinísticos. E-mail HTML é destinado a um iframe em sandbox. Sucesso, Aviso/Erro e Atrasado também retornam o payload do NTFY (`ntfyMessage`); qualquer cabeçalho de tabela GFM é omitido e linhas de corpo são texto simples.
- **Autenticação**: Requer sessão válida e token CSRF

## Verificar Backups Atrasados - `/api/notifications/check-overdue` {/* #check-overdue-backups---apinotificationscheck-overdue */}
- **Endpoint**: `/api/notifications/check-overdue`
- **Método**: POST
- **Descrição**: Dispara manualmente a verificação de backup atrasado e envia notificações.
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

## Limpar Timestamps de Backups Atrasados - `/api/notifications/clear-overdue-timestamps` {/* #clear-overdue-timestamps---apinotificationsclear-overdue-timestamps */}
- **Endpoint**: `/api/notifications/clear-overdue-timestamps`
- **Método**: POST
- **Descrição**: Limpa todos os timestamps de notificação de backup atrasado, permitindo que as notificações sejam enviadas novamente.
- **Autenticação**: Requer sessão válida e token CSRF
- **Resposta**:

  ```json
  {
    "message": "Overdue backup notification timestamps cleared successfully"
  }
  ```

- **Respostas de Erro**:
  - `500`: Falha ao limpar os carimbos de data/hora dos backups atrasados
- **Notas**:
  - Limpa todos os carimbos de data/hora das notificações de backups atrasados
  - Permite que as notificações sejam enviadas novamente
  - Útil para testar o sistema de notificações
