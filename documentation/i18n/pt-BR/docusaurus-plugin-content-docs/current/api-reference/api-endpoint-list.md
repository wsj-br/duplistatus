---
translation_last_updated: '2026-04-17T23:59:11.059Z'
source_file_mtime: '2026-03-05T22:33:28.419Z'
source_file_hash: 1959fbdf3c6c7e5181a442a8c28c73bd0142703952149fcfc873bc9d8a932357
translation_language: pt-BR
source_file_path: documentation/docs/api-reference/api-endpoint-list.md
translation_models:
  - qwen/qwen3-235b-a22b-2507
---
# Lista de Pontos de Extensão da API {#api-endpoint-list}

Este documento fornece uma tabela de referência rápida de todos os pontos de extensão da API disponíveis (em ordem alfabética de ponto de extensão).

| Endpoint                                                                                                                                          | Método | Descrição                           | Grupo                     |
|---------------------------------------------------------------------------------------------------------------------------------------------------|--------|---------------------------------------|---------------------------|
| [/api/audit-log](administration-apis#list-audit-logs-apiaudit-log)                                                                              | GET    | Listar Registros de Auditoria       | Administração            |
| [/api/audit-log/cleanup](administration-apis#cleanup-audit-logs-apiaudit-logcleanup)                                                            | POST   | Limpar Registros de Auditoria       | Administração            |
| [/api/audit-log/download](administration-apis#download-audit-logs-apiaudit-logdownload)                                                         | GET    | Baixar Registros de Auditoria       | Administração            |
| [/api/audit-log/filters](administration-apis#get-audit-log-filter-values-apiaudit-logfilters)                                                   | GET    | Obter Valores de Filtro de Registro de Auditoria | Administração            |
| [/api/audit-log/retention](administration-apis#get-audit-log-retention-apiaudit-logretention)                                                   | GET    | Obter Retenção de Log de Auditoria  | Administração            |
| [/api/audit-log/retention](administration-apis#update-audit-log-retention-apiaudit-logretention)                                                | PATCH  | Atualizar Retenção de Log de Auditoria | Administração            |
| [/api/application-logs](administration-apis#get-application-logs-apiapplication-logs)                                                           | GET    | Obter Logs da Aplicação             | Administração            |
| [/api/application-logs/export](administration-apis#export-application-logs-apiapplication-logsexport)                                            | GET    | Exportar Logs da Aplicação          | Administração            |
| [/api/database/backup](administration-apis#backup-database-apidatabasebackup)                                                                   | GET    | Fazer Backup do Banco de Dados      | Administração            |
| [/api/database/restore](administration-apis#restore-database-apidatabaserestore)                                                                  | POST   | Restaurar Banco de Dados            | Administração            |
| [/api/auth/admin-must-change-password](authentication-security#check-admin-must-change-password-apiauthadmin-must-change-password)               | GET    | Verificar se Administrador Deve Alterar Senha | Autenticação e Segurança |
| [/api/auth/change-password](authentication-security#change-password-apiauthchange-password)                                                     | POST   | Alterar Senha                       | Autenticação e Segurança |
| [/api/auth/login](authentication-security#login-apiauthlogin)                                                                                   | POST   | Login                               | Autenticação e Segurança |
| [/api/auth/logout](authentication-security#logout-apiauthlogout)                                                                                | POST   | Sair                                | Autenticação e Segurança |
| [/api/auth/me](authentication-security#get-current-user-apiauthme)                                                                              | GET    | Obter Usuário Atual                 | Autenticação e Segurança |
| [/api/auth/password-policy](authentication-security#get-password-policy-apiauthpassword-policy)                                                 | GET    | Obter Política de Senha             | Autenticação e Segurança |
| [/api/backups/cleanup](administration-apis#cleanup-backups-apibackupscleanup)                                                                   | POST   | Limpar Backups                      | Administração            |
| [/api/backups/collect](administration-apis#collect-backups-apibackupscollect)                                                                   | POST   | Coletar Backups                     | Administração            |
| [/api/backups/delete-job](administration-apis#delete-backup-job-apibackupsdelete-job)                                                           | DELETE | Excluir Tarefa de Backup            | Administração            |
| [/api/backups/last-timestamps](administration-apis#get-last-backup-timestamps-apibackupslast-timestamps)                                        | GET    | Obter Carimbos de Tempo do Último Backup | Administração            |
| [/api/backups/sync-schedule](administration-apis#sync-backup-schedules-apibackupssync-schedule)                                                 | POST   | Sincronizar Agendamentos de Backup  | Administração            |
| [/api/chart-data/aggregated](chart-data-apis#get-aggregated-chart-data-apichart-dataaggregated)                                                 | GET    | Obter Dados Agregados do Gráfico    | Dados de Gráfico          |
| [/api/chart-data/server/:serverId](chart-data-apis#get-server-chart-data-apichart-dataserverserverid)                                           | GET    | Obter Dados do Gráfico do Servidor  | Dados de Gráfico          |
| [/api/chart-data/server/:serverId/backup/:backupName](chart-data-apis#get-server-backup-chart-data-apichart-dataserverserveridbackupbackupname) | GET    | Obter Dados do Gráfico de Backup do Servidor | Dados de Gráfico          |
| [/api/configuration/backup-settings](configuration-apis#update-backup-settings-apiconfigurationbackup-settings)                                 | POST   | Atualizar Configurações de Backup   | Gerenciamento de Configuração |
| [/api/configuration/email](configuration-apis#delete-email-configuration-apiconfigurationemail)                                                 | DELETE | Excluir Configuração de E-mail      | Gerenciamento de Configuração |
| [/api/configuration/email](configuration-apis#get-email-configuration-apiconfigurationemail)                                                    | GET    | Obter Configuração de E-mail        | Gerenciamento de Configuração |
| [/api/configuration/email](configuration-apis#update-email-configuration-apiconfigurationemail)                                                 | POST   | Atualizar Configuração de E-mail    | Gerenciamento de Configuração |
| [/api/configuration/email/password](configuration-apis#get-email-password-csrf-token-apiconfigurationemailpassword)                             | GET    | Obter Token CSRF da Senha de E-mail | Gerenciamento de Configuração |
| [/api/configuration/email/password](configuration-apis#update-email-password-apiconfigurationemailpassword)                                     | PATCH  | Atualizar Senha de E-mail           | Gerenciamento de Configuração |
| [/api/configuration/notifications](configuration-apis#get-notification-configuration-apiconfigurationnotifications)                            | GET    | Obter Configuração de Notificações  | Gerenciamento de Configuração |
| [/api/configuration/notifications](configuration-apis#update-notification-configuration-apiconfigurationnotifications)                          | POST   | Atualizar Configuração de Notificações | Gerenciamento de Configuração |
| [/api/configuration/ntfy](configuration-apis#get-ntfy-configuration-apiconfigurationntfy)                                                       | GET    | Obter Configuração do NTFY          | Gerenciamento de Configuração |
| [/api/configuration/overdue-tolerance](configuration-apis#get-overdue-tolerance-apiconfigurationoverdue-tolerance)                              | GET    | Obter Tolerância de Atraso          | Gerenciamento de Configuração |
| [/api/configuration/overdue-tolerance](configuration-apis#update-overdue-tolerance-apiconfigurationoverdue-tolerance)                           | POST   | Atualizar Tolerância de Atraso      | Gerenciamento de Configuração |
| [/api/configuration/templates](configuration-apis#update-notification-templates-apiconfigurationtemplates)                                      | POST   | Atualizar Modelos de Notificação    | Gerenciamento de Configuração |
| [/api/configuration/unified](configuration-apis#get-unified-configuration-apiconfigurationunified)                                              | GET    | Obter Configuração Unificada        | Gerenciamento de Configuração |
| [/api/cron-config](cron-service-apis#get-cron-configuration-apicron-config)                                                                     | GET    | Obter Configuração Cron             | Serviços Cron             |
| [/api/cron-config](cron-service-apis#update-cron-configuration-apicron-config)                                                                  | POST   | Atualizar Configuração Cron         | Serviços Cron             |
| [/api/cron/*](cron-service-apis#cron-service-proxy-apicron)                                                                                     | GET    | Proxy do Serviço Cron               | Serviços Cron             |
| [/api/cron/*](cron-service-apis#cron-service-proxy-apicron)                                                                                     | POST   | Proxy do Serviço Cron               | Serviços Cron             |
| [/api/csrf](session-management-apis#get-csrf-token-apicsrf)                                                                                     | GET    | Obter Token CSRF                    | Gerenciamento de Sessão   |
| [/api/dashboard](core-operations#get-dashboard-data-consolidated-apidashboard)                                                                  | GET    | Obter Dados do Painel (Consolidado) | Operações Principais      |
| [/api/detail/:serverId](core-operations#get-server-data-with-overdue-info-apidetailserverid)                                                    | GET    | Obter Dados do Servidor com Informações de Atraso | Operações Principais      |
| [/api/health](monitoring-apis#health-check-apihealth)                                                                                           | GET    | Verificação de Saúde                | Monitoramento e Saúde     |
| [/api/lastbackup/:serverId](external-apis#get-latest-backup-apilastbackupserverid)                                                              | GET    | Obter Último Backup                 | APIs Externas             |
| [/api/lastbackups/:serverId](external-apis#get-latest-backups-apilastbackupsserverid)                                                           | GET    | Obter Últimos Backups               | APIs Externas             |
| [/api/notifications/check-overdue](notification-apis#check-overdue-backups-apinotificationscheck-overdue)                                       | POST   | Verificar Backups Atrasados         | Sistema de Notificação    |
| [/api/notifications/clear-overdue-timestamps](notification-apis#clear-overdue-timestamps-apinotificationsclear-overdue-timestamps)              | POST   | Limpar Carimbos de Tempo de Atraso  | Sistema de Notificação    |
| [/api/notifications/test](notification-apis#test-notification-apinotificationstest)                                                             | POST   | Testar Notificação                  | Sistema de Notificação    |
| [/api/servers](core-operations#get-all-servers-apiservers)                                                                                      | GET    | Obter Todos os Servidores           | Operações Principais      |
| [/api/servers/:id](core-operations#delete-server-apiserversid)                                                                                  | DELETE | Excluir Servidor                    | Operações Principais      |
| [/api/servers/:id](core-operations#get-server-details-apiserversid)                                                                             | GET    | Obter Detalhes do Servidor          | Operações Principais      |
| [/api/servers/:id](core-operations#update-server-apiserversid)                                                                                  | PATCH  | Atualizar Servidor                  | Operações Principais      |
| [/api/servers/duplicates](core-operations#get-duplicate-servers-apiserversduplicates)                                                          | GET    | Obter Servidores Duplicados         | Operações Principais      |
| [/api/servers/merge](core-operations#merge-servers-apiserversmerge)                                                                             | POST   | Mesclar Servidores                  | Operações Principais      |
| [/api/servers/:serverId/password](administration-apis#get-server-password-apiserversserveridpassword)                                           | GET    | Obter Senha do Servidor             | Administração            |
| [/api/servers/:serverId/password](administration-apis#update-server-password-apiserversserveridpassword)                                        | PATCH  | Atualizar Senha do Servidor         | Administração            |
| [/api/servers/:serverId/server-url](administration-apis#get-server-url-apiserversserveridserver-url)                                            | GET    | Obter URL do Servidor               | Administração            |
| [/api/servers/:serverId/server-url](administration-apis#update-server-url-apiserversserveridserver-url)                                         | PATCH  | Atualizar URL do Servidor           | Administração            |
| [/api/servers/test-connection](administration-apis#test-server-connection-apiserverstest-connection)                                            | POST   | Testar Conexão do Servidor          | Administração            |
| [/api/session](session-management-apis#create-session-apisession)                                                                               | POST   | Criar Sessão                        | Gerenciamento de Sessão   |
| [/api/session](session-management-apis#delete-session-apisession)                                                                               | DELETE | Excluir Sessão                      | Gerenciamento de Sessão   |
| [/api/session](session-management-apis#validate-session-apisession)                                                                             | GET    | Validar Sessão                      | Gerenciamento de Sessão   |
| [/api/summary](external-apis#get-overall-summary-apisummary)                                                                                    | GET    | Obter Resumo Geral                  | APIs Externas             |
| [/api/upload](external-apis#upload-backup-data-apiupload)                                                                                       | POST   | Enviar Dados de Backup              | APIs Externas             |
| [/api/users](administration-apis#list-users-apiusers)                                                                                           | GET    | Listar Usuários                     | Administração            |
| [/api/users](administration-apis#create-user-apiusers)                                                                                          | POST   | Criar Usuário                       | Administração            |
| [/api/users/:id](administration-apis#update-user-apiusersid)                                                                                    | PATCH  | Atualizar Usuário                   | Administração            |
| [/api/users/:id](administration-apis#delete-user-apiusersid)                                                                                    | DELETE | Excluir Usuário                     | Administração            |
