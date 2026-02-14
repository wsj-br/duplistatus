---
translation_last_updated: '2026-02-14T04:57:48.111Z'
source_file_mtime: '2026-02-06T21:19:17.562Z'
source_file_hash: 5ce1c81347ec9e1a
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

O serviço de cron inclui:
- **Endpoint de verificação de saúde**: `/health` - Retorna o status do serviço e tarefas ativas
- **Acionamento manual de tarefas**: `POST /trigger/:taskName` - Executar manualmente tarefas agendadas
- **Gerenciamento de tarefas**: `POST /start/:taskName` e `POST /stop/:taskName` - Controlar tarefas individuais
- **Recarregamento de configuração**: `POST /reload-config` - Recarregar configuração do banco de dados
- **Reinício automático**: O serviço reinicia automaticamente se travar (gerenciado por `docker-entrypoint.sh` em implantações Docker)
- **Modo de observação**: Modo de desenvolvimento inclui observação de arquivos para reinícios automáticos em mudanças de código
- **Monitoramento de backups atrasados**: Verificação e notificação automatizada de backups atrasados (executa a cada 5 minutos por padrão)
- **Limpeza de log de auditoria**: Limpeza automatizada de entradas antigas do log de auditoria (executa diariamente às 2h UTC)
- **Agendamento flexível**: Expressões cron configuráveis para diferentes tarefas
- **Integração de banco de dados**: Compartilha o mesmo banco de dados SQLite com o aplicativo principal
- **API RESTful**: API completa para gerenciamento e monitoramento do serviço
