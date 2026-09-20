# Serviço Cron {/* #cron-service */}

O aplicativo inclui um serviço cron separado para gerenciar tarefas agendadas:

## Iniciar o serviço cron em modo de desenvolvimento {/* #start-cron-service-in-development-mode */}

`pnpm dev` já inicia o serviço cron junto com o Next.js. Para executar o cron isoladamente (por exemplo, em um segundo terminal):

```bash
pnpm cron:dev
```

## Iniciar o serviço cron em modo de produção {/* #start-cron-service-in-production-mode */}

```bash
pnpm cron:start
```

## Iniciar o serviço cron localmente (para testes) {/* #start-cron-service-locally-for-testing */}

```bash
pnpm cron:start-local
```

O serviço cron é executado em uma porta separada (8667 em desenvolvimento, 9667 em produção) e lida com tarefas agendadas, como notificações de backups atrasados. A porta pode ser configurada usando a variável de ambiente `CRON_PORT`.

O serviço cron inclui:
- **Endpoint de verificação de integridade (health check)**: `/health` - Retorna o status do serviço e as tarefas ativas
- **Disparo manual de tarefas**: `POST /trigger/:taskName` - Executa manualmente tarefas agendadas. A tarefa `daily-summary-dispatch` é rejeitada nesta rota; use Configurações → Resumo Diário **Enviar resumo agora** em vez disso
- **Gerenciamento de tarefas**: `POST /start/:taskName` e `POST /stop/:taskName` - Controlam tarefas individuais
- **Recarga de configuração**: `POST /reload-config` - Recarrega a configuração a partir do banco de dados
- **Reinício automático**: O serviço reinicia automaticamente em caso de falha (gerenciado por `docker-entrypoint.sh` em implantações Docker)
- **Modo de observação (watch)**: O modo de desenvolvimento inclui monitoramento de arquivos para reinícios automáticos após alterações no código
- **Monitoramento de backups atrasados**: Verificação e notificação automatizadas de backups atrasados (executado a cada 5 minutos por padrão)
- **Envio do resumo diário**: Envia o snapshot do status atual uma vez por dia no horário UTC armazenado do Resumo Diário (`minute hour * * *`). O padrão para novas instalações é 01:00 UTC. Alterar o horário de envio recarrega este agendamento. A tarefa faz o envio se o Resumo Diário estiver habilitado e não verifica o relógio novamente.
- **Limpeza do log de auditoria**: Limpeza automatizada de entradas antigas do log de auditoria (executada diariamente às 2:00 UTC)
- **Compactação do banco de dados**: Semanalmente, Domingo às 04:00 UTC. Exclui linhas de backup cujo servidor não existe mais, linhas de servidor sem backups restantes, chaves `backup_settings` e `overdue_notifications` remanescentes, remove registros antigos de envio do Resumo Diário e executa o `VACUUM` do SQLite
- **Atualização da versão do Duplicati**: Atualiza as versões mais recentes dos canais do Duplicati em cache a partir do GitHub Releases. O padrão é diariamente às 3:00 UTC; administradores podem alterar o intervalo e a hora de início em [Configurações → Versões do Duplicati](../user-guide/settings/duplicati-versions.md).
- **Agendamento flexível**: Expressões cron configuráveis para diferentes tarefas
- **Integração com o banco de dados**: Compartilha o mesmo banco de dados SQLite com a aplicação principal
- **API RESTful**: API completa para gerenciamento e monitoramento do serviço
- **Vinculação local (bind)**: Escuta em `127.0.0.1` por padrão (`CRON_BIND_HOST`). Vinculações fora de loopback exigem `CRON_SERVICE_SECRET`
