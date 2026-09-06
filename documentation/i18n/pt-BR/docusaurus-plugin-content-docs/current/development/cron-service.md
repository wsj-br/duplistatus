# Serviço Cron {#cron-service}

A aplicação inclui um serviço cron separado para lidar com tarefas agendadas:

## Iniciar serviço cron em modo de desenvolvimento {#start-cron-service-in-development-mode}

`pnpm dev` já inicia o serviço cron junto com o Next.js. Para executar o cron sozinho (por exemplo, em um segundo terminal):

```bash
pnpm cron:dev
```

## Iniciar serviço cron em modo de produção {#start-cron-service-in-production-mode}

```bash
pnpm cron:start
```

## Iniciar serviço cron localmente (para testes) {#start-cron-service-locally-for-testing}

```bash
pnpm cron:start-local
```

O serviço cron é executado em uma porta separada (8667 em desenvolvimento, 9667 em produção) e manipula tarefas agendadas como notificações de backup atrasado. A porta pode ser configurada usando a variável de ambiente `CRON_PORT`.

O serviço cron inclui:
- **Endpoint de verificação de saúde**: `/health` - Retorna o status do serviço e as tarefas ativas
- **Disparo manual de tarefas**: `POST /trigger/:taskName` - Executa manualmente tarefas agendadas. A tarefa `daily-summary-dispatch` é rejeitada nesta rota; use Configurações → Resumo Diário **Enviar resumo agora**
- **Gerenciamento de tarefas**: `POST /start/:taskName` e `POST /stop/:taskName` - Controle individual de tarefas
- **Recarga de configuração**: `POST /reload-config` - Recarrega a configuração do banco de dados
- **Reinicialização automática**: O serviço reinicia automaticamente se falhar (gerenciado por `docker-entrypoint.sh` em implantações Docker)
- **Modo de observação**: O modo de desenvolvimento inclui monitoramento de arquivos para reinicialização automática em alterações de código
- **Monitoramento de backups atrasados**: Verificação automatizada e notificação de backups atrasados (executado a cada 5 minutos por padrão)
- **Envio de resumo diário**: Avalia o agendamento do Resumo Diário salvo a cada minuto em UTC e envia o snapshot do status atual quando devido
- **Limpeza do log de auditoria**: Limpeza automatizada de entradas antigas no log de auditoria (executa diariamente às 2h UTC)
- **Atualização das versões do Duplicati**: Atualiza as versões mais recentes do canal Duplicati em cache a partir do GitHub Releases. O padrão é diariamente às 3h UTC; administradores podem alterar o intervalo e a hora de início em [Configurações → Versões do Duplicati](../user-guide/settings/duplicati-versions.md).
- **Agendamento flexível**: Expressões cron configuráveis para diferentes tarefas
- **Integração com banco de dados**: Compartilha o mesmo banco de dados SQLite com a aplicação principal
- **API RESTful**: API completa para gerenciamento e monitoramento do serviço
- **Vinculação local**: Escuta em `127.0.0.1` por padrão (`CRON_BIND_HOST`). Vinculações não-loopback exigem `CRON_SERVICE_SECRET`
