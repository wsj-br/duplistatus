---
translation_last_updated: '2026-04-17T23:59:21.820Z'
source_file_mtime: '2026-03-05T22:33:28.419Z'
source_file_hash: 1959fbdf3c6c7e5181a442a8c28c73bd0142703952149fcfc873bc9d8a932357
translation_language: de
source_file_path: documentation/docs/api-reference/api-endpoint-list.md
translation_models:
  - qwen/qwen3-235b-a22b-2507
---
# API-Endpunktliste {#api-endpoint-list}

Dieses Dokument bietet eine Übersichtstabelle aller verfügbaren API-Endpunkte (in alphabetischer Reihenfolge der Endpunkte).

| Endpunkt                                                                                                                                          | Methode | Beschreibung                           | Gruppe                     |
|---------------------------------------------------------------------------------------------------------------------------------------------------|--------|---------------------------------------|---------------------------|
| [/api/audit-log](administration-apis#list-audit-logs-apiaudit-log)                                                                              | GET    | Audit-Logs auflisten                  | Administration            |
| [/api/audit-log/cleanup](administration-apis#cleanup-audit-logs-apiaudit-logcleanup)                                                            | POST   | Audit-Logs bereinigen                 | Administration            |
| [/api/audit-log/download](administration-apis#download-audit-logs-apiaudit-logdownload)                                                         | GET    | Audit-Logs herunterladen              | Administration            |
| [/api/audit-log/filters](administration-apis#get-audit-log-filter-values-apiaudit-logfilters)                                                   | GET    | Filterwerte für Audit-Log abrufen     | Administration            |
| [/api/audit-log/retention](administration-apis#get-audit-log-retention-apiaudit-logretention)                                                   | GET    | Audit-Protokoll-Beibehaltung abrufen  | Administration            |
| [/api/audit-log/retention](administration-apis#update-audit-log-retention-apiaudit-logretention)                                                | PATCH  | Audit-Protokoll-Beibehaltung aktualisieren | Administration         |
| [/api/application-logs](administration-apis#get-application-logs-apiapplication-logs)                                                           | GET    | Anwendungsprotokolle abrufen          | Administration            |
| [/api/application-logs/export](administration-apis#export-application-logs-apiapplication-logsexport)                                            | GET    | Anwendungsprotokolle exportieren      | Administration            |
| [/api/database/backup](administration-apis#backup-database-apidatabasebackup)                                                                   | GET    | Datenbank sichern                     | Administration            |
| [/api/database/restore](administration-apis#restore-database-apidatabaserestore)                                                                  | POST   | Datenbank wiederherstellen            | Administration            |
| [/api/auth/admin-must-change-password](authentication-security#check-admin-must-change-password-apiauthadmin-must-change-password)               | GET    | Prüfen, ob Admin Passwort ändern muss | Authentication & Security |
| [/api/auth/change-password](authentication-security#change-password-apiauthchange-password)                                                     | POST   | Passwort ändern                       | Authentication & Security |
| [/api/auth/login](authentication-security#login-apiauthlogin)                                                                                   | POST   | Anmelden                              | Authentication & Security |
| [/api/auth/logout](authentication-security#logout-apiauthlogout)                                                                                | POST   | Abmelden                              | Authentication & Security |
| [/api/auth/me](authentication-security#get-current-user-apiauthme)                                                                              | GET    | Aktuellen Benutzer abrufen            | Authentication & Security |
| [/api/auth/password-policy](authentication-security#get-password-policy-apiauthpassword-policy)                                                 | GET    | Passwortrichtlinie abrufen            | Authentication & Security |
| [/api/backups/cleanup](administration-apis#cleanup-backups-apibackupscleanup)                                                                   | POST   | Backups bereinigen                    | Administration            |
| [/api/backups/collect](administration-apis#collect-backups-apibackupscollect)                                                                   | POST   | Backups sammeln                       | Administration            |
| [/api/backups/delete-job](administration-apis#delete-backup-job-apibackupsdelete-job)                                                           | DELETE | Sicherungsauftrag löschen             | Administration            |
| [/api/backups/last-timestamps](administration-apis#get-last-backup-timestamps-apibackupslast-timestamps)                                        | GET    | Letzte Sicherungszeitpunkte abrufen   | Administration            |
| [/api/backups/sync-schedule](administration-apis#sync-backup-schedules-apibackupssync-schedule)                                                 | POST   | Sicherungspläne synchronisieren       | Administration            |
| [/api/chart-data/aggregated](chart-data-apis#get-aggregated-chart-data-apichart-dataaggregated)                                                 | GET    | Aggregierte Diagrammdaten abrufen     | Chart Data                |
| [/api/chart-data/server/:serverId](chart-data-apis#get-server-chart-data-apichart-dataserverserverid)                                           | GET    | Server-Diagrammdaten abrufen          | Chart Data                |
| [/api/chart-data/server/:serverId/backup/:backupName](chart-data-apis#get-server-backup-chart-data-apichart-dataserverserveridbackupbackupname) | GET    | Diagrammdaten der Server-Sicherung abrufen | Chart Data          |
| [/api/configuration/backup-settings](configuration-apis#update-backup-settings-apiconfigurationbackup-settings)                                 | POST   | Sicherungseinstellungen aktualisieren | Configuration Management  |
| [/api/configuration/email](configuration-apis#delete-email-configuration-apiconfigurationemail)                                                 | DELETE | E-Mail-Konfiguration löschen          | Configuration Management  |
| [/api/configuration/email](configuration-apis#get-email-configuration-apiconfigurationemail)                                                    | GET    | E-Mail-Konfiguration abrufen          | Configuration Management  |
| [/api/configuration/email](configuration-apis#update-email-configuration-apiconfigurationemail)                                                 | POST   | E-Mail-Konfiguration aktualisieren    | Configuration Management  |
| [/api/configuration/email/password](configuration-apis#get-email-password-csrf-token-apiconfigurationemailpassword)                             | GET    | CSRF-Token für E-Mail-Passwort abrufen | Configuration Management |
| [/api/configuration/email/password](configuration-apis#update-email-password-apiconfigurationemailpassword)                                     | PATCH  | E-Mail-Passwort aktualisieren         | Configuration Management  |
| [/api/configuration/notifications](configuration-apis#get-notification-configuration-apiconfigurationnotifications)                            | GET    | Benachrichtigungskonfiguration abrufen | Configuration Management |
| [/api/configuration/notifications](configuration-apis#update-notification-configuration-apiconfigurationnotifications)                          | POST   | Benachrichtigungskonfiguration aktualisieren | Configuration Management |
| [/api/configuration/ntfy](configuration-apis#get-ntfy-configuration-apiconfigurationntfy)                                                       | GET    | NTFY-Konfiguration abrufen            | Configuration Management  |
| [/api/configuration/overdue-tolerance](configuration-apis#get-overdue-tolerance-apiconfigurationoverdue-tolerance)                              | GET    | Überfällige Toleranz abrufen          | Configuration Management  |
| [/api/configuration/overdue-tolerance](configuration-apis#update-overdue-tolerance-apiconfigurationoverdue-tolerance)                           | POST   | Überfällige Toleranz aktualisieren    | Configuration Management  |
| [/api/configuration/templates](configuration-apis#update-notification-templates-apiconfigurationtemplates)                                      | POST   | Benachrichtigungsvorlagen aktualisieren | Configuration Management |
| [/api/configuration/unified](configuration-apis#get-unified-configuration-apiconfigurationunified)                                              | GET    | Vereinheitlichte Konfiguration abrufen | Configuration Management |
| [/api/cron-config](cron-service-apis#get-cron-configuration-apicron-config)                                                                     | GET    | Cron-Konfiguration abrufen            | Cron services             |
| [/api/cron-config](cron-service-apis#update-cron-configuration-apicron-config)                                                                  | POST   | Cron-Konfiguration aktualisieren      | Cron services             |
| [/api/cron/*](cron-service-apis#cron-service-proxy-apicron)                                                                                     | GET    | Cron-Service-Proxy                    | Cron services             |
| [/api/cron/*](cron-service-apis#cron-service-proxy-apicron)                                                                                     | POST   | Cron-Service-Proxy                    | Cron services             |
| [/api/csrf](session-management-apis#get-csrf-token-apicsrf)                                                                                     | GET    | CSRF-Token abrufen                    | Session Management        |
| [/api/dashboard](core-operations#get-dashboard-data-consolidated-apidashboard)                                                                  | GET    | Dashboard-Daten abrufen (konsolidiert) | Core Operations           |
| [/api/detail/:serverId](core-operations#get-server-data-with-overdue-info-apidetailserverid)                                                    | GET    | Serverdaten mit Überfälligkeitsinfo abrufen | Core Operations      |
| [/api/health](monitoring-apis#health-check-apihealth)                                                                                           | GET    | Statusüberprüfung                     | Monitoring & Health       |
| [/api/lastbackup/:serverId](external-apis#get-latest-backup-apilastbackupserverid)                                                              | GET    | Letzte Sicherung abrufen              | External APIs             |
| [/api/lastbackups/:serverId](external-apis#get-latest-backups-apilastbackupsserverid)                                                           | GET    | Letzte Sicherungen abrufen            | External APIs             |
| [/api/notifications/check-overdue](notification-apis#check-overdue-backups-apinotificationscheck-overdue)                                       | POST   | Überfällige Sicherungen prüfen        | Notification System       |
| [/api/notifications/clear-overdue-timestamps](notification-apis#clear-overdue-timestamps-apinotificationsclear-overdue-timestamps)              | POST   | Überfällige Zeitstempel löschen       | Notification System       |
| [/api/notifications/test](notification-apis#test-notification-apinotificationstest)                                                             | POST   | Benachrichtigung testen               | Notification System       |
| [/api/servers](core-operations#get-all-servers-apiservers)                                                                                      | GET    | Alle Server abrufen                   | Core Operations           |
| [/api/servers/:id](core-operations#delete-server-apiserversid)                                                                                  | DELETE | Server löschen                        | Core Operations           |
| [/api/servers/:id](core-operations#get-server-details-apiserversid)                                                                             | GET    | Serverdetails abrufen                 | Core Operations           |
| [/api/servers/:id](core-operations#update-server-apiserversid)                                                                                  | PATCH  | Server aktualisieren                  | Core Operations           |
| [/api/servers/duplicates](core-operations#get-duplicate-servers-apiserversduplicates)                                                          | GET    | Doppelte Server abrufen               | Core Operations           |
| [/api/servers/merge](core-operations#merge-servers-apiserversmerge)                                                                             | POST   | Server zusammenführen                 | Core Operations           |
| [/api/servers/:serverId/password](administration-apis#get-server-password-apiserversserveridpassword)                                           | GET    | Server-Passwort abrufen               | Administration            |
| [/api/servers/:serverId/password](administration-apis#update-server-password-apiserversserveridpassword)                                        | PATCH  | Server-Passwort aktualisieren         | Administration            |
| [/api/servers/:serverId/server-url](administration-apis#get-server-url-apiserversserveridserver-url)                                            | GET    | Server-URL abrufen                    | Administration            |
| [/api/servers/:serverId/server-url](administration-apis#update-server-url-apiserversserveridserver-url)                                         | PATCH  | Server-URL aktualisieren              | Administration            |
| [/api/servers/test-connection](administration-apis#test-server-connection-apiserverstest-connection)                                            | POST   | Serververbindung testen               | Administration            |
| [/api/session](session-management-apis#create-session-apisession)                                                                               | POST   | Sitzung erstellen                     | Session Management        |
| [/api/session](session-management-apis#delete-session-apisession)                                                                               | DELETE | Sitzung löschen                       | Session Management        |
| [/api/session](session-management-apis#validate-session-apisession)                                                                             | GET    | Sitzung überprüfen                    | Session Management        |
| [/api/summary](external-apis#get-overall-summary-apisummary)                                                                                    | GET    | Gesamtübersicht abrufen               | External APIs             |
| [/api/upload](external-apis#upload-backup-data-apiupload)                                                                                       | POST   | Sicherungsdaten hochladen             | External APIs             |
| [/api/users](administration-apis#list-users-apiusers)                                                                                           | GET    | Benutzer auflisten                    | Administration            |
| [/api/users](administration-apis#create-user-apiusers)                                                                                          | POST   | Benutzer erstellen                    | Administration            |
| [/api/users/:id](administration-apis#update-user-apiusersid)                                                                                    | PATCH  | Benutzer aktualisieren                | Administration            |
| [/api/users/:id](administration-apis#delete-user-apiusersid)                                                                                    | DELETE | Benutzer löschen                      | Administration            |
