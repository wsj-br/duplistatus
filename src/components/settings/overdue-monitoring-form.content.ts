import { t, type Dictionary } from 'intlayer';

export default {
  key: 'overdue-monitoring-form',
  content: {
    title: t({ 
      en: 'Overdue Backup Monitoring', 
      de: 'Überwachung überfälliger Sicherungen', 
      fr: 'Surveillance des sauvegardes en retard', 
      es: 'Monitoreo de backups retrasados', 
      'pt-BR': 'Monitoramento de backups atrasados' 
    }),
    description: t({ 
      en: 'Configure monitoring for overdue backups', 
      de: 'Überwachung für überfällige Sicherungen konfigurieren', 
      fr: 'Configurer la surveillance des sauvegardes en retard', 
      es: 'Configurar monitoreo para backups retrasados', 
      'pt-BR': 'Configurar monitoramento para backups atrasados' 
    }),
    // Card titles and descriptions
    overdueMonitoring: t({ 
      en: 'Overdue Monitoring', 
      de: 'Überwachung überfälliger Sicherungen', 
      fr: 'Surveillance des sauvegardes en retard', 
      es: 'Monitoreo de backups retrasados', 
      'pt-BR': 'Monitoramento de backups atrasados' 
    }),
    noServersWithBackups: t({ 
      en: 'No servers with backups found in the database', 
      de: 'Keine Server mit Sicherungen in der Datenbank gefunden', 
      fr: 'Aucun serveur avec sauvegardes trouvé dans la base de données', 
      es: 'No se encontraron servidores con backups en la base de datos', 
      'pt-BR': 'Nenhum servidor com backups encontrado no banco de dados' 
    }),
    noServersRegisteredYet: t({ 
      en: 'No servers with backups have been registered yet. Add some backup data first to see overdue monitoring settings.', 
      de: 'Es wurden noch keine Server mit Sicherungen registriert. Fügen Sie zuerst einige Sicherungsdaten hinzu, um die Einstellungen für die Überwachung überfälliger Sicherungen zu sehen.', 
      fr: 'Aucun serveur avec sauvegardes n\'a encore été enregistré. Ajoutez d\'abord quelques données de sauvegarde pour voir les paramètres de surveillance des sauvegardes en retard.', 
      es: 'Aún no se han registrado servidores con backups. Agregue primero algunos datos de backup para ver la configuración de monitoreo de backups retrasados.', 
      'pt-BR': 'Nenhum servidor com backups foi registrado ainda. Adicione primeiro alguns dados de backup para ver as configurações de monitoramento de backups atrasados.' 
    }),
    configureOverdueMonitoring: t({ 
      en: 'Configure Overdue Monitoring', 
      de: 'Überwachung überfälliger Sicherungen konfigurieren', 
      fr: 'Configurer la surveillance des sauvegardes en retard', 
      es: 'Configurar monitoreo de backups retrasados', 
      'pt-BR': 'Configurar monitoramento de backups atrasados' 
    }),
    configureOverdueMonitoringDescription: t({ 
      en: 'Configure overdue backup monitoring settings for each backup. Enable/disable overdue backup monitoring, set the timeout period and notification frequency.', 
      de: 'Konfigurieren Sie die Einstellungen für die Überwachung überfälliger Sicherungen für jede Sicherung. Aktivieren/Deaktivieren Sie die Überwachung überfälliger Sicherungen, legen Sie die Timeout-Periode und die Benachrichtigungshäufigkeit fest.', 
      fr: 'Configurez les paramètres de surveillance des sauvegardes en retard pour chaque sauvegarde. Activez/désactivez la surveillance des sauvegardes en retard, définissez la période d\'expiration et la fréquence des notifications.', 
      es: 'Configure los ajustes de monitoreo de backups retrasados para cada backup. Habilite/deshabilite el monitoreo de backups retrasados, establezca el período de tiempo de espera y la frecuencia de notificaciones.', 
      'pt-BR': 'Configure as configurações de monitoramento de backups atrasados para cada backup. Habilite/desabilite o monitoramento de backups atrasados, defina o período de tempo limite e a frequência de notificações.' 
    }),
    // Table headers
    serverName: t({ 
      en: 'Server Name', 
      de: 'Servername', 
      fr: 'Nom du serveur', 
      es: 'Nombre del servidor', 
      'pt-BR': 'Nome do servidor' 
    }),
    backupName: t({ 
      en: 'Backup Name', 
      de: 'Sicherungsname', 
      fr: 'Nom de sauvegarde', 
      es: 'Nombre de backup', 
      'pt-BR': 'Nome do backup' 
    }),
    nextRun: t({ 
      en: 'Next Run', 
      de: 'Nächster Lauf', 
      fr: 'Prochaine exécution', 
      es: 'Próxima ejecución', 
      'pt-BR': 'Próxima execução' 
    }),
    overdueBackupMonitoring: t({ 
      en: 'Overdue Backup Monitoring', 
      de: 'Überwachung überfälliger Sicherungen', 
      fr: 'Surveillance des sauvegardes en retard', 
      es: 'Monitoreo de backups retrasados', 
      'pt-BR': 'Monitoramento de backups atrasados' 
    }),
    expectedBackupInterval: t({ 
      en: 'Expected Backup Interval', 
      de: 'Erwartetes Sicherungsintervall', 
      fr: 'Intervalle de sauvegarde attendu', 
      es: 'Intervalo de backup esperado', 
      'pt-BR': 'Intervalo de backup esperado' 
    }),
    unit: t({ 
      en: 'Unit', 
      de: 'Einheit', 
      fr: 'Unité', 
      es: 'Unidad', 
      'pt-BR': 'Unidade' 
    }),
    allowedDays: t({ 
      en: 'Allowed Days', 
      de: 'Erlaubte Tage', 
      fr: 'Jours autorisés', 
      es: 'Días permitidos', 
      'pt-BR': 'Dias permitidos' 
    }),
    // Unit labels
    custom: t({ 
      en: 'Custom', 
      de: 'Benutzerdefiniert', 
      fr: 'Personnalisé', 
      es: 'Personalizado', 
      'pt-BR': 'Personalizado' 
    }),
    // Placeholders
    notSet: t({ 
      en: 'Not set', 
      de: 'Nicht gesetzt', 
      fr: 'Non défini', 
      es: 'No establecido', 
      'pt-BR': 'Não definido' 
    }),
    customIntervalPlaceholder: t({ 
      en: '1D2h30m', 
      de: '1D2h30m', 
      fr: '1D2h30m', 
      es: '1D2h30m', 
      'pt-BR': '1D2h30m' 
    }),
    // Tooltip
    lastBackup: t({ 
      en: 'Last Backup:', 
      de: 'Letzte Sicherung:', 
      fr: 'Dernière sauvegarde:', 
      es: 'Último backup:', 
      'pt-BR': 'Último backup:' 
    }),
    // Buttons
    saveOverdueMonitoringSettings: t({ 
      en: 'Save Overdue Monitoring Settings', 
      de: 'Einstellungen für Überwachung überfälliger Sicherungen speichern', 
      fr: 'Enregistrer les paramètres de surveillance des sauvegardes en retard', 
      es: 'Guardar configuración de monitoreo de backups retrasados', 
      'pt-BR': 'Salvar configurações de monitoramento de backups atrasados' 
    }),
    saving: t({ 
      en: 'Saving...', 
      de: 'Speichern...', 
      fr: 'Enregistrement...', 
      es: 'Guardando...', 
      'pt-BR': 'Salvando...' 
    }),
    downloadCSV: t({ 
      en: 'Download CSV', 
      de: 'CSV herunterladen', 
      fr: 'Télécharger CSV', 
      es: 'Descargar CSV', 
      'pt-BR': 'Baixar CSV' 
    }),
    csv: t({ 
      en: 'CSV', 
      de: 'CSV', 
      fr: 'CSV', 
      es: 'CSV', 
      'pt-BR': 'CSV' 
    }),
    checkNow: t({ 
      en: 'Check now', 
      de: 'Jetzt prüfen', 
      fr: 'Vérifier maintenant', 
      es: 'Verificar ahora', 
      'pt-BR': 'Verificar agora' 
    }),
    check: t({ 
      en: 'Check', 
      de: 'Prüfen', 
      fr: 'Vérifier', 
      es: 'Verificar', 
      'pt-BR': 'Verificar' 
    }),
    checking: t({ 
      en: 'Checking...', 
      de: 'Prüfe...', 
      fr: 'Vérification...', 
      es: 'Verificando...', 
      'pt-BR': 'Verificando...' 
    }),
    resetNotifications: t({ 
      en: 'Reset notifications', 
      de: 'Benachrichtigungen zurücksetzen', 
      fr: 'Réinitialiser les notifications', 
      es: 'Restablecer notificaciones', 
      'pt-BR': 'Redefinir notificações' 
    }),
    resetting: t({ 
      en: 'Resetting...', 
      de: 'Zurücksetzen...', 
      fr: 'Réinitialisation...', 
      es: 'Restableciendo...', 
      'pt-BR': 'Redefinindo...' 
    }),
    // Control labels
    overdueTolerance: t({ 
      en: 'Overdue tolerance:', 
      de: 'Überfälligkeitstoleranz:', 
      fr: 'Tolérance de retard:', 
      es: 'Tolerancia de retraso:', 
      'pt-BR': 'Tolerância de atraso:' 
    }),
    tolerance: t({ 
      en: 'Tolerance:', 
      de: 'Toleranz:', 
      fr: 'Tolérance:', 
      es: 'Tolerancia:', 
      'pt-BR': 'Tolerância:' 
    }),
    overdueMonitoringInterval: t({ 
      en: 'Overdue monitoring interval:', 
      de: 'Überwachungsintervall:', 
      fr: 'Intervalle de surveillance des sauvegardes en retard:', 
      es: 'Intervalo de monitoreo de backups retrasados:', 
      'pt-BR': 'Intervalo de monitoramento de backups atrasados:' 
    }),
    monitoringInterval: t({ 
      en: 'Monitoring interval:', 
      de: 'Überwachungsintervall:', 
      fr: 'Intervalle de surveillance:', 
      es: 'Intervalo de monitoreo:', 
      'pt-BR': 'Intervalo de monitoramento:' 
    }),
    interval: t({ 
      en: 'Interval:', 
      de: 'Intervall:', 
      fr: 'Intervalle:', 
      es: 'Intervalo:', 
      'pt-BR': 'Intervalo:' 
    }),
    notificationFrequency: t({ 
      en: 'Notification frequency:', 
      de: 'Benachrichtigungshäufigkeit:', 
      fr: 'Fréquence des notifications:', 
      es: 'Frecuencia de notificaciones:', 
      'pt-BR': 'Frequência de notificações:' 
    }),
    notificationFreq: t({ 
      en: 'Notification freq:', 
      de: 'Benachrichtigungsfreq:', 
      fr: 'Fréq. notifications:', 
      es: 'Frec. notificaciones:', 
      'pt-BR': 'Freq. notificações:' 
    }),
    frequency: t({ 
      en: 'Frequency:', 
      de: 'Häufigkeit:', 
      fr: 'Fréquence:', 
      es: 'Frecuencia:', 
      'pt-BR': 'Frequência:' 
    }),
    // Toast messages
    overdueBackupCheckComplete: t({ 
      en: 'Overdue Backup Check Complete', 
      de: 'Prüfung überfälliger Sicherungen abgeschlossen', 
      fr: 'Vérification des sauvegardes en retard terminée', 
      es: 'Verificación de backups retrasados completada', 
      'pt-BR': 'Verificação de backups atrasados concluída' 
    }),
    checkedBackupsFoundOverdue: t({ 
      en: 'Checked {checked} backups, found {overdue} overdue backups, sent {notifications} notifications.', 
      de: '{checked} Sicherungen geprüft, {overdue} überfällige Sicherungen gefunden, {notifications} Benachrichtigungen gesendet.', 
      fr: '{checked} sauvegardes vérifiées, {overdue} sauvegardes en retard trouvées, {notifications} notifications envoyées.', 
      es: '{checked} backups verificados, {overdue} backups retrasados encontrados, {notifications} notificaciones enviadas.', 
      'pt-BR': '{checked} backups verificados, {overdue} backups atrasados encontrados, {notifications} notificações enviadas.' 
    }),
    failedToRunOverdueBackupCheck: t({ 
      en: 'Failed to run overdue backup check', 
      de: 'Fehler beim Ausführen der Prüfung überfälliger Sicherungen', 
      fr: 'Échec de la vérification des sauvegardes en retard', 
      es: 'Error al ejecutar la verificación de backups retrasados', 
      'pt-BR': 'Falha ao executar verificação de backups atrasados' 
    }),
    overdueBackupCheckIntervalUpdated: t({ 
      en: 'Overdue backup check interval updated successfully', 
      de: 'Intervall für Prüfung überfälliger Sicherungen erfolgreich aktualisiert', 
      fr: 'Intervalle de vérification des sauvegardes en retard mis à jour avec succès', 
      es: 'Intervalo de verificación de backups retrasados actualizado exitosamente', 
      'pt-BR': 'Intervalo de verificação de backups atrasados atualizado com sucesso' 
    }),
    configurationSavedCronNotRunning: t({ 
      en: 'Configuration saved successfully. Note: Cron service is not running - start it with \'npm run cron:start\' to enable scheduled tasks.', 
      de: 'Konfiguration erfolgreich gespeichert. Hinweis: Cron-Service läuft nicht - starten Sie ihn mit \'npm run cron:start\', um geplante Aufgaben zu aktivieren.', 
      fr: 'Configuration enregistrée avec succès. Note: Le service Cron ne fonctionne pas - démarrez-le avec \'npm run cron:start\' pour activer les tâches planifiées.', 
      es: 'Configuración guardada exitosamente. Nota: El servicio Cron no está en ejecución - inícielo con \'npm run cron:start\' para habilitar tareas programadas.', 
      'pt-BR': 'Configuração salva com sucesso. Nota: O serviço Cron não está em execução - inicie-o com \'npm run cron:start\' para habilitar tarefas agendadas.' 
    }),
    failedToUpdateOverdueBackupCheckInterval: t({ 
      en: 'Failed to update overdue backup check interval', 
      de: 'Fehler beim Aktualisieren des Intervalls für Prüfung überfälliger Sicherungen', 
      fr: 'Échec de la mise à jour de l\'intervalle de vérification des sauvegardes en retard', 
      es: 'Error al actualizar el intervalo de verificación de backups retrasados', 
      'pt-BR': 'Falha ao atualizar intervalo de verificação de backups atrasados' 
    }),
    overdueMonitoringSettingsSaved: t({ 
      en: 'Overdue monitoring settings saved successfully', 
      de: 'Einstellungen für Überwachung überfälliger Sicherungen erfolgreich gespeichert', 
      fr: 'Paramètres de surveillance des sauvegardes en retard enregistrés avec succès', 
      es: 'Configuración de monitoreo de backups retrasados guardada exitosamente', 
      'pt-BR': 'Configurações de monitoramento de backups atrasados salvas com sucesso' 
    }),
    failedToSaveOverdueMonitoringSettings: t({ 
      en: 'Failed to save overdue monitoring settings', 
      de: 'Fehler beim Speichern der Einstellungen für Überwachung überfälliger Sicherungen', 
      fr: 'Échec de l\'enregistrement des paramètres de surveillance des sauvegardes en retard', 
      es: 'Error al guardar la configuración de monitoreo de backups retrasados', 
      'pt-BR': 'Falha ao salvar configurações de monitoramento de backups atrasados' 
    }),
    overdueBackupNotificationsReset: t({ 
      en: 'Overdue backup notifications have been reset', 
      de: 'Benachrichtigungen über überfällige Sicherungen wurden zurückgesetzt', 
      fr: 'Les notifications de sauvegardes en retard ont été réinitialisées', 
      es: 'Las notificaciones de backups retrasados se han restablecido', 
      'pt-BR': 'As notificações de backups atrasados foram redefinidas' 
    }),
    failedToResetOverdueBackupNotifications: t({ 
      en: 'Failed to reset overdue backup notifications', 
      de: 'Fehler beim Zurücksetzen der Benachrichtigungen über überfällige Sicherungen', 
      fr: 'Échec de la réinitialisation des notifications de sauvegardes en retard', 
      es: 'Error al restablecer las notificaciones de backups retrasados', 
      'pt-BR': 'Falha ao redefinir notificações de backups atrasados' 
    }),
    csvFileDownloadedSuccessfully: t({ 
      en: 'CSV file downloaded successfully', 
      de: 'CSV-Datei erfolgreich heruntergeladen', 
      fr: 'Fichier CSV téléchargé avec succès', 
      es: 'Archivo CSV descargado exitosamente', 
      'pt-BR': 'Arquivo CSV baixado com sucesso' 
    }),
    failedToGenerateCsvFile: t({ 
      en: 'Failed to generate CSV file', 
      de: 'Fehler beim Generieren der CSV-Datei', 
      fr: 'Échec de la génération du fichier CSV', 
      es: 'Error al generar archivo CSV', 
      'pt-BR': 'Falha ao gerar arquivo CSV' 
    }),
    overdueToleranceUpdatedSuccessfully: t({ 
      en: 'Overdue tolerance updated successfully.', 
      de: 'Überfälligkeitstoleranz erfolgreich aktualisiert.', 
      fr: 'Tolérance de retard mise à jour avec succès.', 
      es: 'Tolerancia de retraso actualizada exitosamente.', 
      'pt-BR': 'Tolerância de atraso atualizada com sucesso.' 
    }),
    failedToUpdateOverdueTolerance: t({ 
      en: 'Failed to update overdue tolerance', 
      de: 'Fehler beim Aktualisieren der Überfälligkeitstoleranz', 
      fr: 'Échec de la mise à jour de la tolérance de retard', 
      es: 'Error al actualizar la tolerancia de retraso', 
      'pt-BR': 'Falha ao atualizar tolerância de atraso' 
    }),
    notificationFrequencyUpdated: t({ 
      en: 'Notification frequency updated.', 
      de: 'Benachrichtigungshäufigkeit aktualisiert.', 
      fr: 'Fréquence des notifications mise à jour.', 
      es: 'Frecuencia de notificaciones actualizada.', 
      'pt-BR': 'Frequência de notificações atualizada.' 
    }),
    failedToUpdateNotificationFrequency: t({ 
      en: 'Failed to update notification frequency', 
      de: 'Fehler beim Aktualisieren der Benachrichtigungshäufigkeit', 
      fr: 'Échec de la mise à jour de la fréquence des notifications', 
      es: 'Error al actualizar la frecuencia de notificaciones', 
      'pt-BR': 'Falha ao atualizar frequência de notificações' 
    }),
    startingCollection: t({ 
      en: 'Starting Collection', 
      de: 'Sammlung starten', 
      fr: 'Démarrage de la collecte', 
      es: 'Iniciando recopilación', 
      'pt-BR': 'Iniciando coleta' 
    }),
    collectingBackupLogs: t({ 
      en: 'Collecting backup logs from all configured servers...', 
      de: 'Sammle Backup-Protokolle von allen konfigurierten Servern...', 
      fr: 'Collecte des journaux de sauvegarde de tous les serveurs configurés...', 
      es: 'Recopilando logs de backup de todos los servidores configurados...', 
      'pt-BR': 'Coletando logs de backup de todos os servidores configurados...' 
    }),
    // Validation errors
    invalidIntervalFormat: t({ 
      en: 'Invalid interval format', 
      de: 'Ungültiges Intervallformat', 
      fr: 'Format d\'intervalle invalide', 
      es: 'Formato de intervalo inválido', 
      'pt-BR': 'Formato de intervalo inválido' 
    }),
    pleaseEnterValidPositiveNumber: t({ 
      en: 'Please enter a valid positive number', 
      de: 'Bitte geben Sie eine gültige positive Zahl ein', 
      fr: 'Veuillez entrer un nombre positif valide', 
      es: 'Por favor ingrese un número positivo válido', 
      'pt-BR': 'Por favor, insira um número positivo válido' 
    }),
    // CSV headers
    csvGeneratedAt: t({ 
      en: 'CSV Generated At', 
      de: 'CSV generiert am', 
      fr: 'CSV généré le', 
      es: 'CSV generado en', 
      'pt-BR': 'CSV gerado em' 
    }),
    csvServerName: t({ 
      en: 'Server Name', 
      de: 'Servername', 
      fr: 'Nom du serveur', 
      es: 'Nombre del servidor', 
      'pt-BR': 'Nome do servidor' 
    }),
    csvServerId: t({ 
      en: 'Server ID', 
      de: 'Server-ID', 
      fr: 'ID du serveur', 
      es: 'ID del servidor', 
      'pt-BR': 'ID do servidor' 
    }),
    csvBackupName: t({ 
      en: 'Backup Name', 
      de: 'Sicherungsname', 
      fr: 'Nom de sauvegarde', 
      es: 'Nombre de backup', 
      'pt-BR': 'Nome do backup' 
    }),
    csvLastBackupCfg: t({ 
      en: 'Last Backup (cfg)', 
      de: 'Letzte Sicherung (cfg)', 
      fr: 'Dernière sauvegarde (cfg)', 
      es: 'Último backup (cfg)', 
      'pt-BR': 'Último backup (cfg)' 
    }),
    csvLastBackupCfgWeekday: t({ 
      en: 'Last Backup (cfg) Weekday', 
      de: 'Wochentag der letzten Sicherung (cfg)', 
      fr: 'Jour de la semaine de la dernière sauvegarde (cfg)', 
      es: 'Día de la semana del último backup (cfg)', 
      'pt-BR': 'Dia da semana do último backup (cfg)' 
    }),
    csvLastBackupDb: t({ 
      en: 'Last Backup (DB)', 
      de: 'Letzte Sicherung (DB)', 
      fr: 'Dernière sauvegarde (DB)', 
      es: 'Último backup (DB)', 
      'pt-BR': 'Último backup (DB)' 
    }),
    csvNextRun: t({ 
      en: 'Next Run', 
      de: 'Nächster Lauf', 
      fr: 'Prochaine exécution', 
      es: 'Próxima ejecución', 
      'pt-BR': 'Próxima execução' 
    }),
    csvNextRunWeekday: t({ 
      en: 'Next Run Weekday', 
      de: 'Wochentag des nächsten Laufs', 
      fr: 'Jour de la semaine de la prochaine exécution', 
      es: 'Día de la semana de la próxima ejecución', 
      'pt-BR': 'Dia da semana da próxima execução' 
    }),
    csvIsOverdue: t({ 
      en: 'Is Overdue', 
      de: 'Ist überfällig', 
      fr: 'Est en retard', 
      es: 'Está retrasado', 
      'pt-BR': 'Está atrasado' 
    }),
    csvMonitoringEnabled: t({ 
      en: 'Monitoring Enabled', 
      de: 'Überwachung aktiviert', 
      fr: 'Surveillance activée', 
      es: 'Monitoreo habilitado', 
      'pt-BR': 'Monitoramento habilitado' 
    }),
    csvExpectedInterval: t({ 
      en: 'Expected Interval', 
      de: 'Erwartetes Intervall', 
      fr: 'Intervalle attendu', 
      es: 'Intervalo esperado', 
      'pt-BR': 'Intervalo esperado' 
    }),
    csvAllowedWeekdays: t({ 
      en: 'Allowed Weekdays', 
      de: 'Erlaubte Wochentage', 
      fr: 'Jours de la semaine autorisés', 
      es: 'Días de la semana permitidos', 
      'pt-BR': 'Dias da semana permitidos' 
    }),
    // Permission errors
    noPermissionToModifySetting: t({ 
      en: 'You do not have permission to modify this setting. Only administrators can change configurations.', 
      de: 'Sie haben keine Berechtigung, diese Einstellung zu ändern. Nur Administratoren können Konfigurationen ändern.', 
      fr: 'Vous n\'avez pas la permission de modifier ce paramètre. Seuls les administrateurs peuvent modifier les configurations.', 
      es: 'No tiene permiso para modificar esta configuración. Solo los administradores pueden cambiar configuraciones.', 
      'pt-BR': 'Você não tem permissão para modificar esta configuração. Apenas administradores podem alterar configurações.' 
    }),
    noPermissionToRunOverdueBackupChecks: t({ 
      en: 'You do not have permission to run overdue backup checks. Only administrators can perform this action.', 
      de: 'Sie haben keine Berechtigung, Prüfungen überfälliger Sicherungen auszuführen. Nur Administratoren können diese Aktion ausführen.', 
      fr: 'Vous n\'avez pas la permission d\'exécuter des vérifications de sauvegardes en retard. Seuls les administrateurs peuvent effectuer cette action.', 
      es: 'No tiene permiso para ejecutar verificaciones de backups retrasados. Solo los administradores pueden realizar esta acción.', 
      'pt-BR': 'Você não tem permissão para executar verificações de backups atrasados. Apenas administradores podem realizar esta ação.' 
    }),
    // Select placeholders
    selectTolerance: t({ 
      en: 'Select tolerance', 
      de: 'Toleranz auswählen', 
      fr: 'Sélectionner la tolérance', 
      es: 'Seleccionar tolerancia', 
      'pt-BR': 'Selecionar tolerância' 
    }),
    // Loading
    loading: t({ 
      en: 'Loading...', 
      de: 'Laden...', 
      fr: 'Chargement...', 
      es: 'Cargando...', 
      'pt-BR': 'Carregando...' 
    }),
    // CSV download title
    downloadBackupMonitoringDataAsCsv: t({ 
      en: 'Download backup monitoring data as CSV', 
      de: 'Sicherungs-Überwachungsdaten als CSV herunterladen', 
      fr: 'Télécharger les données de surveillance des sauvegardes au format CSV', 
      es: 'Descargar datos de monitoreo de backups como CSV', 
      'pt-BR': 'Baixar dados de monitoramento de backups como CSV' 
    }),
  },
} satisfies Dictionary;
