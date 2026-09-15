# Serviço Cron {/* #cron-service */}

O aplicativo inclui um serviço cron separado para lidar com tarefas agendadas:

## Iniciar serviço cron em modo de desenvolvimento {/* #start-cron-service-in-development-mode */}

`pnpm dev` já inicia o serviço cron junto com o Next.js. Para executar o cron sozinho (por exemplo, em um segundo terminal):

```bash
pnpm cron:dev
```

## Iniciar serviço cron em modo de produção {/* #start-cron-service-in-production-mode */}

```bash
pnpm cron:start
```

## Iniciar serviço cron localmente (para testes) {/* #start-cron-service-locally-for-testing */}

```bash
pnpm cron:start-local
```

O serviço cron é executado em uma porta separada (8667 no desenvolvimento, 9667 na produção) e lida com tarefas agendadas como notificações de backups atrasados. A porta pode ser configurada usando a variável de ambiente `CRON_PORT`.

O serviço cron inclui:
- **Endpoint de verificação de saúde**: `/health` - Retorna o status do serviço e as tarefas ativas
- **Disparo manual de tarefas**: `POST /trigger/:taskName` - Execute manualmente tarefas agendadas. A tarefa `daily-summary-dispatch` é rejeitada nesta rota; use Configurações → Resumo Diário **Enviar resumo agora** em vez disso
- **Gerenciamento de tarefas**: `POST /start/:taskName` e `POST /stop/:taskName` - Controle individual de tarefas
- **Recarregamento de configuração**: `POST /reload-config` - Recarrega a configuração do banco de dados
- **Reinício automático**: O serviço reinicia automaticamente se ele travar (gerenciado por `docker-entrypoint.sh` em implantações Docker)
- **Modo de observação**: O modo de desenvolvimento inclui observação de arquivos para reinícios automáticos em alterações de código
- **Monitoramento de backups atrasados**: Verificação e notificação automáticas de backups atrasados (executa a cada 5 minutos por padrão)
- **Despacho de resumo diário**: Envia o snapshot do status atual uma vez por dia na hora UTC armazenada do Resumo Diário (`minute hour * * *`). O padrão para novas instalações é 01:00 UTC. Alterar o horário de envio recarrega este agendamento. A tarefa é enviada se o Resumo Diário estiver habilitado e não verifica novamente o relógio.
- **Limpeza de log de auditoria**: Limpeza automática de entradas antigas de log de auditoria (executa diariamente às 2h UTC)
- **Compactação de banco de dados**: Domingo às 04:00 UTC. Exclui linhas de backup cujo servidor não existe mais, linhas de servidor sem backups restantes, chaves `backup_settings` e `overdue_notifications` remanescentes, poda linhas de entrega de Resumo Diário antigas e executa SQLite `VACUUM`
- **Atualização de versão do Duplicati**: Atualiza as versões mais recentes do canal Duplicati em cache a partir do GitHub Releases. O padrão é diário às 3h UTC; administradores podem alterar o intervalo e o horário de início em [Configurações → Versões do Duplicati](../user-guide/settings/duplicati-versions.md).
- **Agendamento flexível**: Expressões cron configuráveis para diferentes tarefas
- **Integração com banco de dados**: Compartilha o mesmo banco de dados SQLite com o aplicativo principal
- **API RESTful**: API completa para gerenciamento e monitoramento do serviço
- **Vinculação local**: Escuta em `127.0.0.1` por padrão (`CRON_BIND_HOST`). Vinculações não-loopback exigem `CRON_SERVICE_SECRET`
