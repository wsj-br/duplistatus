---
translation_last_updated: '2026-04-17T23:59:05.834Z'
source_file_mtime: '2026-03-05T22:33:28.419Z'
source_file_hash: 1959fbdf3c6c7e5181a442a8c28c73bd0142703952149fcfc873bc9d8a932357
translation_language: es
source_file_path: documentation/docs/api-reference/api-endpoint-list.md
translation_models:
  - qwen/qwen3-235b-a22b-2507
---
# Lista de puntos de conexión de API {#api-endpoint-list}

Este documento proporciona una tabla de referencia rápida de todos los puntos de conexión de API disponibles (en orden alfabético del punto de conexión).

| Endpoint                                                                                                                                          | Método | Descripción                           | Grupo                     |
|---------------------------------------------------------------------------------------------------------------------------------------------------|--------|---------------------------------------|---------------------------|
| [/api/audit-log](administration-apis#list-audit-logs-apiaudit-log)                                                                              | GET    | Listar registros de auditoría         | Administración            |
| [/api/audit-log/cleanup](administration-apis#cleanup-audit-logs-apiaudit-logcleanup)                                                            | POST   | Limpiar registros de auditoría        | Administración            |
| [/api/audit-log/download](administration-apis#download-audit-logs-apiaudit-logdownload)                                                         | GET    | Descargar registros de auditoría      | Administración            |
| [/api/audit-log/filters](administration-apis#get-audit-log-filter-values-apiaudit-logfilters)                                                   | GET    | Obtener valores de filtro del registro de auditoría | Administración            |
| [/api/audit-log/retention](administration-apis#get-audit-log-retention-apiaudit-logretention)                                                   | GET    | Obtener retención del registro de auditoría | Administración            |
| [/api/audit-log/retention](administration-apis#update-audit-log-retention-apiaudit-logretention)                                                | PATCH  | Actualizar retención del registro de auditoría | Administración            |
| [/api/application-logs](administration-apis#get-application-logs-apiapplication-logs)                                                           | GET    | Obtener registros de la aplicación    | Administración            |
| [/api/application-logs/export](administration-apis#export-application-logs-apiapplication-logsexport)                                            | GET    | Exportar registros de la aplicación   | Administración            |
| [/api/database/backup](administration-apis#backup-database-apidatabasebackup)                                                                   | GET    | Copia de seguridad de la base de datos | Administración            |
| [/api/database/restore](administration-apis#restore-database-apidatabaserestore)                                                                  | POST   | Restaurar base de datos               | Administración            |
| [/api/auth/admin-must-change-password](authentication-security#check-admin-must-change-password-apiauthadmin-must-change-password)               | GET    | Verificar si el administrador debe cambiar la contraseña | Autenticación y seguridad |
| [/api/auth/change-password](authentication-security#change-password-apiauthchange-password)                                                     | POST   | Cambiar contraseña                    | Autenticación y seguridad |
| [/api/auth/login](authentication-security#login-apiauthlogin)                                                                                   | POST   | Iniciar sesión                        | Autenticación y seguridad |
| [/api/auth/logout](authentication-security#logout-apiauthlogout)                                                                                | POST   | Cerrar sesión                         | Autenticación y seguridad |
| [/api/auth/me](authentication-security#get-current-user-apiauthme)                                                                              | GET    | Obtener usuario actual                | Autenticación y seguridad |
| [/api/auth/password-policy](authentication-security#get-password-policy-apiauthpassword-policy)                                                 | GET    | Obtener política de contraseñas       | Autenticación y seguridad |
| [/api/backups/cleanup](administration-apis#cleanup-backups-apibackupscleanup)                                                                   | POST   | Limpiar copias de seguridad           | Administración            |
| [/api/backups/collect](administration-apis#collect-backups-apibackupscollect)                                                                   | POST   | Recopilar copias de seguridad         | Administración            |
| [/api/backups/delete-job](administration-apis#delete-backup-job-apibackupsdelete-job)                                                           | DELETE | Eliminar trabajo de copia de seguridad | Administración            |
| [/api/backups/last-timestamps](administration-apis#get-last-backup-timestamps-apibackupslast-timestamps)                                        | GET    | Obtener marcas de tiempo de la última copia de seguridad | Administración            |
| [/api/backups/sync-schedule](administration-apis#sync-backup-schedules-apibackupssync-schedule)                                                 | POST   | Sincronizar horarios de copia de seguridad | Administración            |
| [/api/chart-data/aggregated](chart-data-apis#get-aggregated-chart-data-apichart-dataaggregated)                                                 | GET    | Obtener datos agregados del gráfico   | Datos de gráfico          |
| [/api/chart-data/server/:serverId](chart-data-apis#get-server-chart-data-apichart-dataserverserverid)                                           | GET    | Obtener datos del gráfico del servidor | Datos de gráfico          |
| [/api/chart-data/server/:serverId/backup/:backupName](chart-data-apis#get-server-backup-chart-data-apichart-dataserverserveridbackupbackupname) | GET    | Obtener datos del gráfico de copia de seguridad del servidor | Datos de gráfico          |
| [/api/configuration/backup-settings](configuration-apis#update-backup-settings-apiconfigurationbackup-settings)                                 | POST   | Actualizar configuración de copias de seguridad | Gestión de configuración  |
| [/api/configuration/email](configuration-apis#delete-email-configuration-apiconfigurationemail)                                                 | DELETE | Eliminar configuración de correo electrónico | Gestión de configuración  |
| [/api/configuration/email](configuration-apis#get-email-configuration-apiconfigurationemail)                                                    | GET    | Obtener configuración de correo electrónico | Gestión de configuración  |
| [/api/configuration/email](configuration-apis#update-email-configuration-apiconfigurationemail)                                                 | POST   | Actualizar configuración de correo electrónico | Gestión de configuración  |
| [/api/configuration/email/password](configuration-apis#get-email-password-csrf-token-apiconfigurationemailpassword)                             | GET    | Obtener token CSRF de contraseña de correo electrónico | Gestión de configuración  |
| [/api/configuration/email/password](configuration-apis#update-email-password-apiconfigurationemailpassword)                                     | PATCH  | Actualizar contraseña de correo electrónico | Gestión de configuración  |
| [/api/configuration/notifications](configuration-apis#get-notification-configuration-apiconfigurationnotifications)                            | GET    | Obtener configuración de notificaciones | Gestión de configuración  |
| [/api/configuration/notifications](configuration-apis#update-notification-configuration-apiconfigurationnotifications)                          | POST   | Actualizar configuración de notificaciones | Gestión de configuración  |
| [/api/configuration/ntfy](configuration-apis#get-ntfy-configuration-apiconfigurationntfy)                                                       | GET    | Obtener configuración de NTFY         | Gestión de configuración  |
| [/api/configuration/overdue-tolerance](configuration-apis#get-overdue-tolerance-apiconfigurationoverdue-tolerance)                              | GET    | Obtener tolerancia de retraso         | Gestión de configuración  |
| [/api/configuration/overdue-tolerance](configuration-apis#update-overdue-tolerance-apiconfigurationoverdue-tolerance)                           | POST   | Actualizar tolerancia de retraso      | Gestión de configuración  |
| [/api/configuration/templates](configuration-apis#update-notification-templates-apiconfigurationtemplates)                                      | POST   | Actualizar plantillas de notificación | Gestión de configuración  |
| [/api/configuration/unified](configuration-apis#get-unified-configuration-apiconfigurationunified)                                              | GET    | Obtener configuración unificada       | Gestión de configuración  |
| [/api/cron-config](cron-service-apis#get-cron-configuration-apicron-config)                                                                     | GET    | Obtener configuración de Cron         | Servicios Cron            |
| [/api/cron-config](cron-service-apis#update-cron-configuration-apicron-config)                                                                  | POST   | Actualizar configuración de Cron      | Servicios Cron            |
| [/api/cron/*](cron-service-apis#cron-service-proxy-apicron)                                                                                     | GET    | Proxy de servicio Cron                | Servicios Cron            |
| [/api/cron/*](cron-service-apis#cron-service-proxy-apicron)                                                                                     | POST   | Proxy de servicio Cron                | Servicios Cron            |
| [/api/csrf](session-management-apis#get-csrf-token-apicsrf)                                                                                     | GET    | Obtener token CSRF                    | Gestión de sesión         |
| [/api/dashboard](core-operations#get-dashboard-data-consolidated-apidashboard)                                                                  | GET    | Obtener datos del panel (consolidado) | Operaciones principales   |
| [/api/detail/:serverId](core-operations#get-server-data-with-overdue-info-apidetailserverid)                                                    | GET    | Obtener datos del servidor con información de retraso | Operaciones principales   |
| [/api/health](monitoring-apis#health-check-apihealth)                                                                                           | GET    | Comprobación de estado                | Monitoreo y estado        |
| [/api/lastbackup/:serverId](external-apis#get-latest-backup-apilastbackupserverid)                                                              | GET    | Obtener última copia de seguridad     | API externas              |
| [/api/lastbackups/:serverId](external-apis#get-latest-backups-apilastbackupsserverid)                                                           | GET    | Obtener últimas copias de seguridad   | API externas              |
| [/api/notifications/check-overdue](notification-apis#check-overdue-backups-apinotificationscheck-overdue)                                       | POST   | Verificar copias de seguridad atrasadas | Sistema de notificaciones |
| [/api/notifications/clear-overdue-timestamps](notification-apis#clear-overdue-timestamps-apinotificationsclear-overdue-timestamps)              | POST   | Borrar marcas de tiempo de retraso    | Sistema de notificaciones |
| [/api/notifications/test](notification-apis#test-notification-apinotificationstest)                                                             | POST   | Probar notificación                   | Sistema de notificaciones |
| [/api/servers](core-operations#get-all-servers-apiservers)                                                                                      | GET    | Obtener todos los servidores          | Operaciones principales   |
| [/api/servers/:id](core-operations#delete-server-apiserversid)                                                                                  | DELETE | Eliminar servidor                     | Operaciones principales   |
| [/api/servers/:id](core-operations#get-server-details-apiserversid)                                                                             | GET    | Obtener detalles del servidor         | Operaciones principales   |
| [/api/servers/:id](core-operations#update-server-apiserversid)                                                                                  | PATCH  | Actualizar servidor                   | Operaciones principales   |
| [/api/servers/duplicates](core-operations#get-duplicate-servers-apiserversduplicates)                                                          | GET    | Obtener servidores duplicados         | Operaciones principales   |
| [/api/servers/merge](core-operations#merge-servers-apiserversmerge)                                                                             | POST   | Fusionar servidores                   | Operaciones principales   |
| [/api/servers/:serverId/password](administration-apis#get-server-password-apiserversserveridpassword)                                           | GET    | Obtener contraseña del servidor       | Administración            |
| [/api/servers/:serverId/password](administration-apis#update-server-password-apiserversserveridpassword)                                        | PATCH  | Actualizar contraseña del servidor    | Administración            |
| [/api/servers/:serverId/server-url](administration-apis#get-server-url-apiserversserveridserver-url)                                            | GET    | Obtener URL del servidor              | Administración            |
| [/api/servers/:serverId/server-url](administration-apis#update-server-url-apiserversserveridserver-url)                                         | PATCH  | Actualizar URL del servidor           | Administración            |
| [/api/servers/test-connection](administration-apis#test-server-connection-apiserverstest-connection)                                            | POST   | Probar conexión del servidor          | Administración            |
| [/api/session](session-management-apis#create-session-apisession)                                                                               | POST   | Crear sesión                          | Gestión de sesión         |
| [/api/session](session-management-apis#delete-session-apisession)                                                                               | DELETE | Eliminar sesión                       | Gestión de sesión         |
| [/api/session](session-management-apis#validate-session-apisession)                                                                             | GET    | Validar sesión                        | Gestión de sesión         |
| [/api/summary](external-apis#get-overall-summary-apisummary)                                                                                    | GET    | Obtener resumen general               | API externas              |
| [/api/upload](external-apis#upload-backup-data-apiupload)                                                                                       | POST   | Subir datos de copia de seguridad     | API externas              |
| [/api/users](administration-apis#list-users-apiusers)                                                                                           | GET    | Listar usuarios                       | Administración            |
| [/api/users](administration-apis#create-user-apiusers)                                                                                          | POST   | Crear usuario                         | Administración            |
| [/api/users/:id](administration-apis#update-user-apiusersid)                                                                                    | PATCH  | Actualizar usuario                    | Administración            |
| [/api/users/:id](administration-apis#delete-user-apiusersid)                                                                                    | DELETE | Eliminar usuario                      | Administración            |
