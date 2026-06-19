# API 接口列表 {#api-endpoint-list}

本文档提供了一个所有可用 API 接口的快速参考表（按接口字母顺序排列）。

| 接口                                                                                                                                           | 方法 | 描述                       | 分组                     |
|----------------------------------------------------------------------------------------------------------------------------------------------------|--------|-----------------------------------|---------------------------|
| [`/api/audit-log`](administration-apis#list-audit-logs---apiaudit-log)                                                                              | GET    | 列出审计日志                   | 管理员            |
| [`/api/audit-log/cleanup`](administration-apis#cleanup-audit-logs---apiaudit-logcleanup)                                                            | POST   | 清理审计日志                | 管理员            |
| [`/api/audit-log/download`](administration-apis#download-audit-logs---apiaudit-logdownload)                                                         | GET    | 下载审计日志               | 管理员            |
| [`/api/audit-log/filters`](administration-apis#get-audit-log-filter-values---apiaudit-logfilters)                                                   | GET    | 获取审计日志过滤值       | 管理员            |
| [`/api/audit-log/retention`](administration-apis#get-audit-log-retention---apiaudit-logretention)                                                   | GET    | 获取审计日志保留           | 管理员            |
| [`/api/audit-log/retention`](administration-apis#update-audit-log-retention---apiaudit-logretention)                                                | PATCH  | 更新审计日志保留        | 管理员            |
| [`/api/application-logs`](administration-apis#get-application-logs---apiapplication-logs)                                                           | GET    | 获取应用程序日志              | 管理员            |
| [`/api/application-logs/export`](administration-apis#export-application-logs---apiapplication-logsexport)                                           | GET    | 导出应用程序日志           | 管理员            |
| [`/api/database/backup`](administration-apis#backup-database---apidatabasebackup)                                                                   | GET    | 备份数据库                   | 管理员            |
| [`/api/database/restore`](administration-apis#restore-database---apidatabaserestore)                                                                | POST   | 恢复数据库                  | 管理员            |
| [`/api/auth/admin-must-change-password`](authentication-security#check-admin-must-change-password---apiauthadmin-must-change-password)              | GET    | 检查管理员必须更改密码  | 身份验证与安全 |
| [`/api/auth/change-password`](authentication-security#change-password---apiauthchange-password)                                                     | POST   | 更改密码                   | 身份验证与安全 |
| [`/api/auth/login`](authentication-security#login---apiauthlogin)                                                                                   | POST   | 登录                             | 身份验证与安全 |
| [`/api/auth/logout`](authentication-security#logout---apiauthlogout)                                                                                | POST   | 退出登录                            | 身份验证与安全 |
| [`/api/auth/me`](authentication-security#get-current-user---apiauthme)                                                                              | GET    | 获取当前用户                  | 身份验证与安全 |
| [`/api/auth/password-policy`](authentication-security#get-password-policy---apiauthpassword-policy)                                                 | GET    | 获取密码策略               | 身份验证与安全 |
| [`/api/backups/cleanup`](administration-apis#cleanup-backups---apibackupscleanup)                                                                   | POST   | 清理备份                   | 管理员            |
| [`/api/backups/collect`](administration-apis#collect-backups---apibackupscollect)                                                                   | POST   | 采集备份                   | 管理员            |
| [`/api/backups/delete-job`](administration-apis#delete-backup-job---apibackupsdelete-job)                                                           | DELETE | 删除备份任务                 | 管理            |
| [`/api/backups/last-timestamps`](administration-apis#get-last-backup-timestamps---apibackupslast-timestamps)                                        | GET    | 获取上次备份时间戳        | 管理            |
| [`/api/backups/sync-schedule`](administration-apis#sync-backup-schedules---apibackupssync-schedule)                                                 | POST   | 同步备份计划             | 管理            |
| [`/api/chart-data/aggregated`](chart-data-apis#get-aggregated-chart-data---apichart-dataaggregated)                                                 | GET    | 获取聚合图表数据         | 图表数据                |
| [`/api/chart-data/server/:serverId`](chart-data-apis#get-server-chart-data---apichart-dataserverserverid)                                           | GET    | 获取服务器图表数据             | 图表数据                |
| [`/api/chart-data/server/:serverId/backup/:backupName`](chart-data-apis#get-server-backup-chart-data---apichart-dataserverserveridbackupbackupname) | GET    | 获取服务器备份图表数据      | 图表数据                |
| [`/api/configuration/backup-settings`](configuration-apis#update-backup-settings---apiconfigurationbackup-settings)                                 | POST   | 更新备份设置            | 配置管理  |
| [`/api/configuration/email`](configuration-apis#delete-email-configuration---apiconfigurationemail)                                                 | DELETE | 删除邮件配置        | 配置管理  |
| [`/api/configuration/email`](configuration-apis#get-email-configuration---apiconfigurationemail)                                                    | GET    | 获取邮件配置           | 配置管理  |
| [`/api/configuration/email`](configuration-apis#update-email-configuration---apiconfigurationemail)                                                 | POST   | 更新邮件配置        | 配置管理  |
| [`/api/configuration/email/password`](configuration-apis#get-email-password-csrf-token---apiconfigurationemailpassword)                             | GET    | 获取邮件密码 CSRF 令牌     | 配置管理  |
| [`/api/configuration/email/password`](configuration-apis#update-email-password---apiconfigurationemailpassword)                                     | PATCH  | 更新邮件密码             | 配置管理  |
| [`/api/configuration/notifications`](configuration-apis#get-notification-configuration---apiconfigurationnotifications)                             | GET    | 获取通知配置    | 配置管理  |
| [`/api/configuration/notifications`](configuration-apis#update-notification-configuration---apiconfigurationnotifications)                          | POST   | 更新通知配置 | 配置管理  |
| [`/api/configuration/ntfy`](configuration-apis#get-ntfy-configuration---apiconfigurationntfy)                                                       | GET    | 获取 NTFY 配置            | 配置管理  |
| [`/api/configuration/overdue-tolerance`](configuration-apis#get-overdue-tolerance---apiconfigurationoverdue-tolerance)                              | GET    | 获取逾期容差             | 配置管理  |
| [`/api/configuration/overdue-tolerance`](configuration-apis#update-overdue-tolerance---apiconfigurationoverdue-tolerance)                           | POST   | 更新逾期容差          | 配置管理  |
| [`/api/configuration/templates`](configuration-apis#update-notification-templates---apiconfigurationtemplates)                                      | POST   | 更新通知模板     | 配置管理  |
| [`/api/configuration/unified`](configuration-apis#get-unified-configuration---apiconfigurationunified)                                              | GET    | 获取统一配置         | 配置管理  |
| [`/api/cron-config`](cron-service-apis#get-cron-configuration---apicron-config)                                                                     | GET    | 获取 Cron 配置            | Cron 服务             |
| [`/api/cron-config`](cron-service-apis#update-cron-configuration---apicron-config)                                                                  | POST   | 更新 Cron 配置                 | Cron 服务             |
| [`/api/cron/*`](cron-service-apis#cron-service-proxy---apicron)                                                                                     | GET    | Cron 服务代理                | Cron 服务             |
| [`/api/cron/*`](cron-service-apis#cron-service-proxy---apicron)                                                                                     | POST   | Cron 服务代理                | Cron 服务             |
| [`/api/csrf`](session-management-apis#get-csrf-token---apicsrf)                                                                                     | GET    | 获取 CSRF 令牌                    | 会话管理        |
| [`/api/dashboard`](core-operations#get-dashboard-data-consolidated---apidashboard)                                                                  | GET    | 获取仪表板数据（汇总） | 核心操作           |
| [`/api/detail/:serverId`](core-operations#get-server-data-with-overdue-info---apidetailserverid)                                                    | GET    | 获取包含逾期信息的服务器数据 | 核心操作           |
| [`/api/health`](monitoring-apis#health-check---apihealth)                                                                                           | GET    | 健康检查                      | 监控与健康       |
| [`/api/lastbackup/:serverId`](external-apis#get-latest-backup---apilastbackupserverid)                                                              | GET    | 获取最新备份                 | 外部 API             |
| [`/api/lastbackups/:serverId`](external-apis#get-latest-backups---apilastbackupsserverid)                                                           | GET    | 获取最新备份列表                | 外部 API             |
| [`/api/notifications/check-overdue`](notification-apis#check-overdue-backups---apinotificationscheck-overdue)                                       | POST   | 检查逾期备份             | 通知系统       |
| [`/api/notifications/clear-overdue-timestamps`](notification-apis#clear-overdue-timestamps---apinotificationsclear-overdue-timestamps)              | POST   | 清除逾期时间戳          | 通知系统       |
| [`/api/notifications/test`](notification-apis#test-notification---apinotificationstest)                                                             | POST   | 测试通知                 | 通知系统       |
| [`/api/servers`](core-operations#get-all-servers---apiservers)                                                                                      | GET    | 获取全部服务器                   | 核心操作           |
| [`/api/servers/:id`](core-operations#delete-server---apiserversid)                                                                                  | DELETE | 删除服务器                     | 核心操作           |
| [`/api/servers/:id`](core-operations#get-server-details---apiserversid)                                                                             | GET    | 获取服务器详情                | 核心操作           |
| [`/api/servers/:id`](core-operations#update-server---apiserversid)                                                                                  | PATCH  | 更新服务器                     | 核心操作           |
| [`/api/servers/duplicates`](core-operations#get-duplicate-servers---apiserversduplicates)                                                           | GET    | 获取重复服务器             | 核心操作           |
| [`/api/servers/merge`](core-operations#merge-servers---apiserversmerge)                                                                             | POST   | 合并服务器                     | 核心操作           |
| [`/api/servers/:serverId/password`](administration-apis#get-server-password---apiserversserveridpassword)                                           | GET    | 获取服务器密码               | 管理            |
| [`/api/servers/:serverId/password`](administration-apis#update-server-password---apiserversserveridpassword)                                        | PATCH  | 更新服务器密码            | 管理            |
| [`/api/servers/:serverId/server-url`](administration-apis#get-server-url---apiserversserveridserver-url)                                            | GET    | 获取服务器 URL                    | 管理            |
| [`/api/servers/:serverId/server-url`](administration-apis#update-server-url---apiserversserveridserver-url)                                         | PATCH  | 更新服务器 URL                 | 管理            |
| [`/api/servers/test-connection`](administration-apis#test-server-connection---apiserverstest-connection)                                            | POST   | 测试服务器连接            | 管理            |
| [`/api/session`](session-management-apis#create-session---apisession)                                                                               | POST   | 创建会话                    | 会话管理        |
| [`/api/session`](session-management-apis#delete-session---apisession)                                                                               | DELETE | 删除会话                    | 会话管理        |
| [`/api/session`](session-management-apis#validate-session---apisession)                                                                             | GET    | 验证会话                  | 会话管理        |
| [`/api/summary`](external-apis#get-overall-summary---apisummary)                                                                                    | GET    | 获取总体摘要               | 外部 API             |
| [`/api/upload`](external-apis#upload-backup-data---apiupload)                                                                                       | POST   | 上传备份数据                | 外部 API             |
| [`/api/users`](administration-apis#list-users---apiusers)                                                                                           | GET    | 列出用户                        | 管理            |
| [`/api/users`](administration-apis#create-user---apiusers)                                                                                          | POST   | 创建用户                       | 管理            |
| [`/api/users/:id`](administration-apis#update-user---apiusersid)                                                                                    | PATCH  | 更新用户                       | 管理            |
| [`/api/users/:id`](administration-apis#delete-user---apiusersid)                                                                                    | DELETE | 删除用户                       | 管理            |
