import { t, type Dictionary } from 'intlayer';

export default {
  key: 'backup-monitoring-form',
  content: {
    title: t({
      en: 'Backup Monitoring',
      de: 'Backup-Überwachung',
      fr: 'Surveillance des sauvegardes',
      es: 'Monitoreo de backups',
      'pt-BR': 'Monitoramento de backups'
    }),
    description: t({
      en: 'Configure monitoring for backups',
      de: 'Backup-Überwachung konfigurieren',
      fr: 'Configurer la surveillance des sauvegardes',
      es: 'Configurar monitoreo de backups',
      'pt-BR': 'Configurar monitoramento de backups'
    }),
    // Card titles and descriptions
    backupMonitoring: t({
      en: 'Backup Monitoring',
      de: 'Backup-Überwachung',
      fr: 'Surveillance des sauvegardes',
      es: 'Monitoreo de backups',
      'pt-BR': 'Monitoramento de backups'
    }),
    noServersWithBackups: t({ 
      en: 'No servers with backups found in the database', 
      de: 'Keine Server mit Sicherungen in der Datenbank gefunden', 
      fr: 'Aucun serveur avec sauvegardes trouvé dans la base de données', 
      es: 'No se encontraron servidores con backups en la base de datos', 
      'pt-BR': 'Nenhum servidor com backups encontrado no banco de dados' 
    }),
    noServersRegisteredYet: t({
      en: 'No servers with backups have been registered yet. Add some backup data first to see backup monitoring settings.',
      de: 'Es wurden noch keine Server mit Sicherungen registriert. Fügen Sie zuerst einige Sicherungsdaten hinzu, um die Einstellungen für die Backup-Überwachung zu sehen.',
      fr: 'Aucun serveur avec sauvegardes n\'a encore été enregistré. Ajoutez d\'abord quelques données de sauvegarde pour voir les paramètres de surveillance des sauvegardes.',
      es: 'Aún no se han registrado servidores con backups. Agregue primero algunos datos de backup para ver la configuración de monitoreo de backups.',
      'pt-BR': 'Nenhum servidor com backups foi registrado ainda. Adicione primeiro alguns dados de backup para ver as configurações de monitoramento de backups.'
    }),
    configureBackupMonitoring: t({
      en: 'Configure Backup Monitoring',
      de: 'Backup-Überwachung konfigurieren',
      fr: 'Configurer la surveillance des sauvegardes',
      es: 'Configurar monitoreo de backups',
      'pt-BR': 'Configurar monitoramento de backups'
    }),
    configureBackupMonitoringDescription: t({
      en: 'Configure monitoring settings for each backup. Enable/disable backup monitoring, set the timeout period and notification frequency.',
      de: 'Konfigurieren Sie die Überwachungseinstellungen für jede Sicherung. Aktivieren/deaktivieren Sie die Sicherungsüberwachung, legen Sie den Timeout-Zeitraum und die Benachrichtigungshäufigkeit fest.',
      fr: 'Configurez les paramètres de surveillance pour chaque sauvegarde. Activez/désactivez la surveillance des sauvegardes, définissez la période d\'expiration et la fréquence des notifications.',
      es: 'Configure los ajustes de monitoreo para cada copia de seguridad. Habilite/deshabilite el monitoreo de copias de seguridad, establezca el período de tiempo de espera y la frecuencia de notificaciones.',
      'pt-BR': 'Configure as configurações de monitoramento para cada backup. Ative/desative o monitoramento de backup, defina o período de timeout e a frequência de notificações.'
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
    saveBackupMonitoringSettings: t({
      en: 'Save Backup Monitoring Settings',
      de: 'Backup-Überwachungseinstellungen speichern',
      fr: 'Enregistrer les paramètres de surveillance des sauvegardes',
      es: 'Guardar configuración de monitoreo de backups',
      'pt-BR': 'Salvar configurações de monitoramento de backups'
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
    backupTolerance: t({
      en: 'Backup tolerance:',
      de: 'Backup-Toleranz:',
      fr: 'Tolérance de sauvegarde:',
      es: 'Tolerancia de backup:',
      'pt-BR': 'Tolerância de backup:'
    }),
    tolerance: t({
      en: 'Tolerance:',
      de: 'Toleranz:',
      fr: 'Tolérance:',
      es: 'Tolerancia:',
      'pt-BR': 'Tolerância:'
    }),
    backupMonitoringInterval: t({
      en: 'Backup monitoring interval:',
      de: 'Backup-Überwachungsintervall:',
      fr: 'Intervalle de surveillance des sauvegardes:',
      es: 'Intervalo de monitoreo de backups:',
      'pt-BR': 'Intervalo de monitoramento de backups:'
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
    backupCheckComplete: t({
      en: 'Backup Check Complete',
      de: 'Backup-Prüfung abgeschlossen',
      fr: 'Vérification des sauvegardes terminée',
      es: 'Verificación de backups completada',
      'pt-BR': 'Verificação de backups concluída'
    }),
    checkedBackupsFoundNeedingAttention: t({
      en: 'Checked {checked} backups, found {overdue} backups needing attention, sent {notifications} notifications.',
      de: '{checked} Sicherungen geprüft, {overdue} Sicherungen beachten, {notifications} Benachrichtigungen gesendet.',
      fr: '{checked} sauvegardes vérifiées, {overdue} sauvegardes nécessitant une attention, {notifications} notifications envoyées.',
      es: '{checked} backups verificados, {overdue} backups que necesitan atención, {notifications} notificaciones enviadas.',
      'pt-BR': '{checked} backups verificados, {overdue} backups que precisam de atenção, {notifications} notificações enviadas.'
    }),
    failedToRunBackupCheck: t({
      en: 'Failed to run backup check',
      de: 'Fehler beim Ausführen der Backup-Prüfung',
      fr: 'Échec de la vérification des sauvegardes',
      es: 'Error al ejecutar la verificación de backups',
      'pt-BR': 'Falha ao executar verificação de backups'
    }),
    backupCheckIntervalUpdated: t({
      en: 'Backup check interval updated successfully',
      de: 'Backup-Prüfintervall erfolgreich aktualisiert',
      fr: 'Intervalle de vérification des sauvegardes mis à jour avec succès',
      es: 'Intervalo de verificación de backups actualizado exitosamente',
      'pt-BR': 'Intervalo de verificação de backups atualizado com sucesso'
    }),
    configurationSavedCronNotRunning: t({ 
      en: 'Configuration saved successfully. Note: Cron service is not running - start it with \'npm run cron:start\' to enable scheduled tasks.', 
      de: 'Konfiguration erfolgreich gespeichert. Hinweis: Cron-Service läuft nicht - starten Sie ihn mit \'npm run cron:start\', um geplante Aufgaben zu aktivieren.', 
      fr: 'Configuration enregistrée avec succès. Note: Le service Cron ne fonctionne pas - démarrez-le avec \'npm run cron:start\' pour activer les tâches planifiées.', 
      es: 'Configuración guardada exitosamente. Nota: El servicio Cron no está en ejecución - inícielo con \'npm run cron:start\' para habilitar tareas programadas.', 
      'pt-BR': 'Configuração salva com sucesso. Nota: O serviço Cron não está em execução - inicie-o com \'npm run cron:start\' para habilitar tarefas agendadas.' 
    }),
    failedToUpdateBackupCheckInterval: t({
      en: 'Failed to update backup check interval',
      de: 'Fehler beim Aktualisieren des Backup-Prüfintervalls',
      fr: 'Échec de la mise à jour de l\'intervalle de vérification des sauvegardes',
      es: 'Error al actualizar el intervalo de verificación de backups',
      'pt-BR': 'Falha ao atualizar intervalo de verificação de backups'
    }),
    backupMonitoringSettingsSaved: t({
      en: 'Backup monitoring settings saved successfully',
      de: 'Backup-Überwachungseinstellungen erfolgreich gespeichert',
      fr: 'Paramètres de surveillance des sauvegardes enregistrés avec succès',
      es: 'Configuración de monitoreo de backups guardada exitosamente',
      'pt-BR': 'Configurações de monitoramento de backups salvas com sucesso'
    }),
    failedToSaveBackupMonitoringSettings: t({
      en: 'Failed to save backup monitoring settings',
      de: 'Fehler beim Speichern der Backup-Überwachungseinstellungen',
      fr: 'Échec de l\'enregistrement des paramètres de surveillance des sauvegardes',
      es: 'Error al guardar la configuración de monitoreo de backups',
      'pt-BR': 'Falha ao salvar configurações de monitoramento de backups'
    }),
    backupNotificationsReset: t({
      en: 'Backup notifications have been reset',
      de: 'Backup-Benachrichtigungen wurden zurückgesetzt',
      fr: 'Les notifications de sauvegardes ont été réinitialisées',
      es: 'Las notificaciones de backups se han restablecido',
      'pt-BR': 'As notificações de backups foram redefinidas'
    }),
    failedToResetBackupNotifications: t({
      en: 'Failed to reset backup notifications',
      de: 'Fehler beim Zurücksetzen der Backup-Benachrichtigungen',
      fr: 'Échec de la réinitialisation des notifications de sauvegardes',
      es: 'Error al restablecer las notificaciones de backups',
      'pt-BR': 'Falha ao redefinir notificações de backups'
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
    backupToleranceUpdatedSuccessfully: t({
      en: 'Backup tolerance updated successfully.',
      de: 'Backup-Toleranz erfolgreich aktualisiert.',
      fr: 'Tolérance de sauvegarde mise à jour avec succès.',
      es: 'Tolerancia de backup actualizada exitosamente.',
      'pt-BR': 'Tolerância de backup atualizada com sucesso.'
    }),
    failedToUpdateBackupTolerance: t({
      en: 'Failed to update backup tolerance',
      de: 'Fehler beim Aktualisieren der Backup-Toleranz',
      fr: 'Échec de la mise à jour de la tolérance de sauvegarde',
      es: 'Error al actualizar la tolerancia de backup',
      'pt-BR': 'Falha ao atualizar tolerância de backup'
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
    csvNeedsAttention: t({
      en: 'Needs Attention',
      de: 'Benötigt Aufmerksamkeit',
      fr: 'Nécessite une attention',
      es: 'Necesita atención',
      'pt-BR': 'Precisa de atenção'
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
    noPermissionToRunBackupChecks: t({
      en: 'You do not have permission to run backup checks. Only administrators can perform this action.',
      de: 'Sie haben keine Berechtigung, Backup-Prüfungen auszuführen. Nur Administratoren können diese Aktion ausführen.',
      fr: 'Vous n\'avez pas la permission d\'exécuter des vérifications de sauvegardes. Seuls les administrateurs peuvent effectuer cette action.',
      es: 'No tiene permiso para ejecutar verificaciones de backups. Solo los administradores pueden realizar esta acción.',
      'pt-BR': 'Você não tem permissão para executar verificações de backups. Apenas administradores podem realizar esta ação.'
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
