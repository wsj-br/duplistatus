---
translation_last_updated: '2026-02-05T00:21:07.424Z'
source_file_mtime: '2026-01-27T14:22:06.830Z'
source_file_hash: a4aa296b36d4dd44
translation_language: pt-BR
source_file_path: development/cron-service.md
---
# Serviço Cron {#cron-service}

A aplicação inclui um serviço cron separado para lidar com tarefas agendadas:

## Iniciar serviço cron em modo de desenvolvimento {#start-cron-service-in-development-mode}

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
- **Endpoint de verificação de saúde**: `/health` - Retorna o status do serviço e tarefas ativas
- **Acionamento manual de tarefas**: `POST /trigger/:taskName` - Executa manualmente tarefas agendadas
- **Gerenciamento de tarefas**: `POST /start/:taskName` e `POST /stop/:taskName` - Controla tarefas individuais
- **Recarga de configuração**: `POST /reload-config` - Recarrega a configuração do banco de dados
- **Reinicialização automática**: O serviço reinicia automaticamente se falhar (gerenciado por `duplistatus-cron.sh`)
- **Modo de observação**: O modo de desenvolvimento inclui observação de arquivos para reinicializações automáticas em caso de alterações de código
- **Monitoramento de backups atrasados**: Verificação automatizada e notificação de backups atrasados (executado a cada 5 minutos por padrão)
- **Limpeza de log de auditoria**: Limpeza automatizada de entradas antigas do log de auditoria (executado diariamente às 2 AM UTC)
- **Agendamento flexível**: Expressões cron configuráveis para diferentes tarefas
- **Integração com banco de dados**: Compartilha o mesmo banco de dados SQLite com a aplicação principal
- **API RESTful**: API completa para gerenciamento e monitoramento do serviço
