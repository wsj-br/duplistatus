import { t, type Dictionary } from 'intlayer';

export default {
  key: 'backup-notifications-form',
  content: {
    title: t({ 
      en: 'Configure Backup Notifications', 
      de: 'Backup-Benachrichtigungen konfigurieren', 
      fr: 'Configurer les notifications de sauvegarde', 
      es: 'Configurar notificaciones de backup', 
      'pt-BR': 'Configurar notificações de backup' 
    }),
    description: t({ 
      en: 'Configure notification settings for a server or backup when a new backup log is received. Icons indicate additional destinations:', 
      de: 'Konfigurieren Sie Benachrichtigungseinstellungen für einen Server oder eine Sicherung, wenn ein neues Sicherungsprotokoll empfangen wird. Symbole zeigen zusätzliche Ziele an:', 
      fr: 'Configurez les paramètres de notification pour un serveur ou une sauvegarde lorsqu\'un nouveau journal de sauvegarde est reçu. Les icônes indiquent des destinations supplémentaires:', 
      es: 'Configure los ajustes de notificación para un servidor o backup cuando se recibe un nuevo log de backup. Los iconos indican destinos adicionales:', 
      'pt-BR': 'Configure as notificações para um servidor ou backup quando um novo log de backup é recebido. Os ícones indicam destinos adicionais:' 
    }),
    serverDefaults: t({ 
      en: 'for server defaults', 
      de: 'für Server-Standardeinstellungen', 
      fr: 'pour les paramètres par défaut du serveur', 
      es: 'para valores predeterminados del servidor', 
      'pt-BR': 'para padrões do servidor' 
    }),
    customBackupOverrides: t({ 
      en: 'for custom backup overrides', 
      de: 'für benutzerdefinierte Sicherungsüberschreibungen', 
      fr: 'pour les remplacements de sauvegarde personnalisés', 
      es: 'para anulaciones de backup personalizadas', 
      'pt-BR': 'para substituições de backup personalizadas' 
    }),
    inheritedDestinations: t({ 
      en: 'for inherited destinations', 
      de: 'für geerbte Ziele', 
      fr: 'pour les destinations héritées', 
      es: 'para destinos heredados', 
      'pt-BR': 'para destinos herdados' 
    }),
    filterByServerName: t({ 
      en: 'Filter by Server Name', 
      de: 'Nach Servername filtern', 
      fr: 'Filtrer par nom de serveur', 
      es: 'Filtrar por nombre del servidor', 
      'pt-BR': 'Filtrar por nome do servidor' 
    }),
    searchPlaceholder: t({ 
      en: 'Search by server name or alias...', 
      de: 'Nach Servername oder Alias suchen...', 
      fr: 'Rechercher par nom de serveur ou alias...', 
      es: 'Buscar por nombre del servidor o alias...', 
      'pt-BR': 'Pesquisar por nome do servidor ou alias...' 
    }),
    serverBackup: t({ 
      en: 'Server / Backup', 
      de: 'Server / Sicherung', 
      fr: 'Serveur / Sauvegarde', 
      es: 'Servidor / Backup', 
      'pt-BR': 'Servidor / Backup' 
    }),
    notificationEvents: t({ 
      en: 'Notification Events', 
      de: 'Benachrichtigungsereignisse', 
      fr: 'Événements de notification', 
      es: 'Eventos de notificación', 
      'pt-BR': 'Eventos de notificação' 
    }),
    ntfyNotifications: t({ 
      en: 'NTFY Notifications', 
      de: 'NTFY-Benachrichtigungen', 
      fr: 'Notifications NTFY', 
      es: 'Notificaciones NTFY', 
      'pt-BR': 'Notificações NTFY' 
    }),
    emailNotifications: t({ 
      en: 'Email Notifications', 
      de: 'E-Mail-Benachrichtigungen', 
      fr: 'Notifications par e-mail', 
      es: 'Notificaciones por correo electrónico', 
      'pt-BR': 'Notificações por e-mail' 
    }),
    emailNotificationsDisabled: t({ 
      en: 'Email Notifications (disabled)', 
      de: 'E-Mail-Benachrichtigungen (deaktiviert)', 
      fr: 'Notifications par e-mail (désactivées)', 
      es: 'Notificaciones por correo electrónico (desactivadas)', 
      'pt-BR': 'Notificações por e-mail (desativadas)' 
    }),
    warnings: t({ 
      en: 'Warnings', 
      de: 'Warnungen', 
      fr: 'Avertissements', 
      es: 'Advertencias', 
      'pt-BR': 'Avisos' 
    }),
    errors: t({ 
      en: 'Errors', 
      de: 'Fehler', 
      fr: 'Erreurs', 
      es: 'Errores', 
      'pt-BR': 'Erros' 
    }),
    all: t({ 
      en: 'All', 
      de: 'Alle', 
      fr: 'Tous', 
      es: 'Todos', 
      'pt-BR': 'Todos' 
    }),
    off: t({ 
      en: 'Off', 
      de: 'Aus', 
      fr: 'Désactivé', 
      es: 'Desactivado', 
      'pt-BR': 'Desativado' 
    }),
    selectBackup: t({ 
      en: 'Select this backup', 
      de: 'Diese Sicherung auswählen', 
      fr: 'Sélectionner cette sauvegarde', 
      es: 'Seleccionar este backup', 
      'pt-BR': 'Selecionar este backup' 
    }),
    sendTestEmail: t({ 
      en: 'Send test email', 
      de: 'Test-E-Mail senden', 
      fr: 'Envoyer un e-mail de test', 
      es: 'Enviar correo de prueba', 
      'pt-BR': 'Enviar e-mail de teste' 
    }),
    sendTestNotification: t({ 
      en: 'Send test notification', 
      de: 'Testbenachrichtigung senden', 
      fr: 'Envoyer une notification de test', 
      es: 'Enviar notificación de prueba', 
      'pt-BR': 'Enviar notificação de teste' 
    }),
    showQrCode: t({ 
      en: 'Show QR code', 
      de: 'QR-Code anzeigen', 
      fr: 'Afficher le code QR', 
      es: 'Mostrar código QR', 
      'pt-BR': 'Mostrar código QR' 
    }),
    clearFilter: t({ 
      en: 'Clear filter', 
      de: 'Filter löschen', 
      fr: 'Effacer le filtre', 
      es: 'Limpiar filtro', 
      'pt-BR': 'Limpar filtro' 
    }),
    selectAllVisibleBackups: t({ 
      en: 'Select all visible backups', 
      de: 'Alle sichtbaren Sicherungen auswählen', 
      fr: 'Sélectionner toutes les sauvegardes visibles', 
      es: 'Seleccionar todas las copias de seguridad visibles', 
      'pt-BR': 'Selecionar todos os backups visíveis' 
    }),
    someBackupsSelectedClickToSelectAll: t({ 
      en: 'Some backups selected - click to select all visible', 
      de: 'Einige Sicherungen ausgewählt - Klicken zum Auswählen aller sichtbaren', 
      fr: 'Quelques sauvegardes sélectionnées - cliquer pour sélectionner toutes les visibles', 
      es: 'Algunas copias de seguridad seleccionadas - hacer clic para seleccionar todas las visibles', 
      'pt-BR': 'Alguns backups selecionados - clicar para selecionar todos os visíveis' 
    }),
    enableNtfyNotifications: t({ 
      en: 'Enable NTFY notifications', 
      de: 'NTFY-Benachrichtigungen aktivieren', 
      fr: 'Activer les notifications NTFY', 
      es: 'Activar notificaciones NTFY', 
      'pt-BR': 'Ativar notificações NTFY' 
    }),
    enableEmailNotifications: t({ 
      en: 'Enable Email notifications', 
      de: 'E-Mail-Benachrichtigungen aktivieren', 
      fr: 'Activer les notifications par e-mail', 
      es: 'Activar notificaciones por correo electrónico', 
      'pt-BR': 'Ativar notificações por e-mail' 
    }),
    bulkEdit: t({ 
      en: 'Bulk Edit', 
      de: 'Massenbearbeitung', 
      fr: 'Modification en masse', 
      es: 'Edición masiva', 
      'pt-BR': 'Edição em massa' 
    }),
    bulkClear: t({ 
      en: 'Bulk Clear', 
      de: 'Massenlöschung', 
      fr: 'Effacement en masse', 
      es: 'Limpiar en masa', 
      'pt-BR': 'Limpar em massa' 
    }),
    noServersWithBackups: t({ 
      en: 'No servers with backups found in the database', 
      de: 'Keine Server mit Sicherungen in der Datenbank gefunden', 
      fr: 'Aucun serveur avec sauvegardes trouvé dans la base de données', 
      es: 'No se encontraron servidores con backups en la base de datos', 
      'pt-BR': 'Nenhum servidor com backups encontrado no banco de dados' 
    }),
    noServersRegistered: t({ 
      en: 'No servers with backups have been registered yet. Add some backup data first to see backup notification settings.', 
      de: 'Es wurden noch keine Server mit Sicherungen registriert. Fügen Sie zuerst einige Sicherungsdaten hinzu, um die Einstellungen für Backup-Benachrichtigungen anzuzeigen.', 
      fr: 'Aucun serveur avec sauvegardes n\'a encore été enregistré. Ajoutez d\'abord des données de sauvegarde pour voir les paramètres de notification de sauvegarde.', 
      es: 'Aún no se han registrado servidores con backups. Agregue primero algunos datos de backup para ver la configuración de notificaciones de backup.', 
      'pt-BR': 'Nenhum servidor com backups foi registrado ainda. Adicione primeiro alguns dados de backup para ver as configurações de notificação de backup.' 
    }),
    additionalDestinations: t({ 
      en: 'Additional Destinations:', 
      de: 'Zusätzliche Ziele:', 
      fr: 'Destinations supplémentaires:', 
      es: 'Destinos adicionales:', 
      'pt-BR': 'Destinos adicionais:' 
    }),
    additionalDestinationsHeading: t({ 
      en: 'Additional Destinations', 
      de: 'Zusätzliche Ziele', 
      fr: 'Destinations supplémentaires', 
      es: 'Destinos adicionales', 
      'pt-BR': 'Destinos adicionais' 
    }),
    notificationEventLabel: t({ 
      en: 'Notification event', 
      de: 'Benachrichtigungsereignis', 
      fr: 'Événement de notification', 
      es: 'Evento de notificación', 
      'pt-BR': 'Evento de notificação' 
    }),
    notificationEventDescription: t({ 
      en: 'Notification events to be sent to the additional email address and topic', 
      de: 'Benachrichtigungsereignisse, die an die zusätzliche E-Mail-Adresse und das Thema gesendet werden', 
      fr: 'Événements de notification à envoyer à l\'adresse e-mail et au sujet supplémentaires', 
      es: 'Eventos de notificación a enviar a la dirección de correo y tema adicionales', 
      'pt-BR': 'Eventos de notificação a serem enviados ao endereço de e-mail e tópico adicionais' 
    }),
    additionalEmailsLabel: t({ 
      en: 'Additional Emails', 
      de: 'Zusätzliche E-Mails', 
      fr: 'E-mails supplémentaires', 
      es: 'Correos adicionales', 
      'pt-BR': 'E-mails adicionais' 
    }),
    additionalEmailsDescription: t({ 
      en: 'Notifications for this backup will be sent to these addresses in addition to the global recipient.', 
      de: 'Benachrichtigungen für diese Sicherung werden zusätzlich zum globalen Empfänger an diese Adressen gesendet.', 
      fr: 'Les notifications pour cette sauvegarde seront envoyées à ces adresses en plus du destinataire global.', 
      es: 'Las notificaciones de este backup se enviarán a estas direcciones además del destinatario global.', 
      'pt-BR': 'As notificações deste backup serão enviadas para estes endereços além do destinatário global.' 
    }),
    additionalEmailsDescriptionPlural: t({ 
      en: 'Notifications for these backups will be sent to these addresses in addition to the global recipient.', 
      de: 'Benachrichtigungen für diese Sicherungen werden zusätzlich zum globalen Empfänger an diese Adressen gesendet.', 
      fr: 'Les notifications pour ces sauvegardes seront envoyées à ces adresses en plus du destinataire global.', 
      es: 'Las notificaciones de estos backups se enviarán a estas direcciones además del destinatario global.', 
      'pt-BR': 'As notificações destes backups serão enviadas para estes endereços além do destinatário global.' 
    }),
    additionalNtfyTopicLabel: t({ 
      en: 'Additional NTFY Topic', 
      de: 'Zusätzliches NTFY-Thema', 
      fr: 'Sujet NTFY supplémentaire', 
      es: 'Tema NTFY adicional', 
      'pt-BR': 'Tópico NTFY adicional' 
    }),
    additionalNtfyTopicDescription: t({ 
      en: 'Notifications will be published to this topic in addition to the default topic.', 
      de: 'Benachrichtigungen werden zusätzlich zum Standardthema an dieses Thema gesendet.', 
      fr: 'Les notifications seront publiées sur ce sujet en plus du sujet par défaut.', 
      es: 'Las notificaciones se publicarán en este tema además del tema predeterminado.', 
      'pt-BR': 'As notificações serão publicadas neste tópico além do tópico padrão.' 
    }),
    additionalEmailsPlaceholder: t({ 
      en: 'e.g. user1@example.com, user2@example.com', 
      de: 'z.B. user1@beispiel.de, user2@beispiel.de', 
      fr: 'ex. user1@exemple.fr, user2@exemple.fr', 
      es: 'ej. user1@ejemplo.com, user2@ejemplo.com', 
      'pt-BR': 'ex. user1@exemplo.com, user2@exemplo.com' 
    }),
    additionalNtfyTopicPlaceholder: t({ 
      en: 'e.g. duplistatus-user-backup-alerts', 
      de: 'z.B. duplistatus-benutzer-backup-warnungen', 
      fr: 'ex. duplistatus-alertes-sauvegarde-utilisateur', 
      es: 'ej. duplistatus-alertas-backup-usuario', 
      'pt-BR': 'ex. duplistatus-alertas-backup-usuario' 
    }),
    inheritingPlaceholder: t({ 
      en: 'Inheriting: {value}', 
      de: 'Erbt: {value}', 
      fr: 'Hérite de : {value}', 
      es: 'Heredando: {value}', 
      'pt-BR': 'Herdando: {value}' 
    }),
    serverDefault: t({ 
      en: 'Server Default', 
      de: 'Server-Standard', 
      fr: 'Par défaut du serveur', 
      es: 'Predeterminado del servidor', 
      'pt-BR': 'Padrão do servidor' 
    }),
    inheritingFromServerDefaults: t({ 
      en: 'Inheriting from server defaults. Change to override.', 
      de: 'Erbt von Server-Standardeinstellungen. Ändern zum Überschreiben.', 
      fr: 'Hérite des paramètres par défaut du serveur. Modifier pour remplacer.', 
      es: 'Heredando de valores predeterminados del servidor. Cambiar para anular.', 
      'pt-BR': 'Herdando dos padrões do servidor. Altere para substituir.' 
    }),
    inheritingFromServerDefaultsClick: t({ 
      en: 'Inheriting from server defaults. Click to override.', 
      de: 'Erbt von Server-Standardeinstellungen. Klicken zum Überschreiben.', 
      fr: 'Hérite des paramètres par défaut du serveur. Cliquez pour remplacer.', 
      es: 'Heredando de valores predeterminados del servidor. Haga clic para anular.', 
      'pt-BR': 'Herdando dos padrões do servidor. Clique para substituir.' 
    }),
    inheritingFromServerDefaultsTitle: t({ 
      en: 'Inheriting from server defaults', 
      de: 'Erbt von Server-Standardeinstellungen', 
      fr: 'Hérite des paramètres par défaut du serveur', 
      es: 'Heredando de valores predeterminados del servidor', 
      'pt-BR': 'Herdando dos padrões do servidor' 
    }),
    overrideNotInheriting: t({ 
      en: 'Override (not inheriting)', 
      de: 'Überschreiben (nicht erbend)', 
      fr: 'Remplacer (n\'hérite pas)', 
      es: 'Anular (no heredando)', 
      'pt-BR': 'Substituir (não herdando)' 
    }),
    clickToInheritFromServerDefaults: t({ 
      en: 'Click to inherit from server defaults', 
      de: 'Klicken, um von Server-Standardeinstellungen zu erben', 
      fr: 'Cliquez pour hériter des paramètres par défaut du serveur', 
      es: 'Haga clic para heredar de los valores predeterminados del servidor', 
      'pt-BR': 'Clique para herdar dos padrões do servidor' 
    }),
    defaultAdditionalDestinationsForServer: t({ 
      en: 'Default Additional Destinations for this Server', 
      de: 'Standard-Zusatzziele für diesen Server', 
      fr: 'Destinations supplémentaires par défaut pour ce serveur', 
      es: 'Destinos adicionales predeterminados para este servidor', 
      'pt-BR': 'Destinos adicionais padrão para este servidor' 
    }),
    defaultAdditionalEmails: t({ 
      en: 'Default Additional Emails', 
      de: 'Standard-Zusatz-E-Mails', 
      fr: 'E-mails supplémentaires par défaut', 
      es: 'Correos adicionales predeterminados', 
      'pt-BR': 'E-mails adicionais padrão' 
    }),
    defaultAdditionalNtfyTopic: t({ 
      en: 'Default Additional NTFY Topic', 
      de: 'Standard-Zusatz-NTFY-Thema', 
      fr: 'Sujet NTFY supplémentaire par défaut', 
      es: 'Tema NTFY adicional predeterminado', 
      'pt-BR': 'Tópico NTFY adicional padrão' 
    }),
    clearAdditionalDestinations: t({ 
      en: 'Clear Additional Destinations', 
      de: 'Zusätzliche Ziele löschen', 
      fr: 'Effacer les destinations supplémentaires', 
      es: 'Borrar destinos adicionales', 
      'pt-BR': 'Limpar destinos adicionais' 
    }),
    setAdditionalDestinations: t({ 
      en: 'Set Additional Destinations', 
      de: 'Zusätzliche Ziele festlegen', 
      fr: 'Définir les destinations supplémentaires', 
      es: 'Establecer destinos adicionales', 
      'pt-BR': 'Definir destinos adicionais' 
    }),
    syncToAll: t({ 
      en: 'Sync to All', 
      de: 'Mit allen synchronisieren', 
      fr: 'Synchroniser avec tout', 
      es: 'Sincronizar con todo', 
      'pt-BR': 'Sincronizar com todos' 
    }),
    syncToAllTitle: t({ 
      en: 'Sync all backups to inherit from server defaults', 
      de: 'Alle Sicherungen mit Server-Standardeinstellungen synchronisieren', 
      fr: 'Synchroniser toutes les sauvegardes avec les paramètres par défaut du serveur', 
      es: 'Sincronizar todos los backups con los valores predeterminados del servidor', 
      'pt-BR': 'Sincronizar todos os backups com os padrões do servidor' 
    }),
    clearAll: t({ 
      en: 'Clear All', 
      de: 'Alles löschen', 
      fr: 'Tout effacer', 
      es: 'Borrar todo', 
      'pt-BR': 'Limpar tudo' 
    }),
    clearAllTitle: t({ 
      en: 'Clear all additional destinations from server and all backups', 
      de: 'Alle zusätzlichen Ziele von Server und allen Sicherungen löschen', 
      fr: 'Effacer toutes les destinations supplémentaires du serveur et de toutes les sauvegardes', 
      es: 'Borrar todos los destinos adicionales del servidor y todos los backups', 
      'pt-BR': 'Limpar todos os destinos adicionais do servidor e todos os backups' 
    }),
    bulkEditDialogDescription: t({ 
      en: 'Update additional destination settings for {count} selected backup(s).', 
      de: 'Zusätzliche Zieleinstellungen für {count} ausgewählte Sicherung(en) aktualisieren.', 
      fr: 'Mettre à jour les paramètres de destination supplémentaires pour {count} sauvegarde(s) sélectionnée(s).', 
      es: 'Actualizar la configuración de destinos adicionales para {count} backup(s) seleccionado(s).', 
      'pt-BR': 'Atualizar configurações de destinos adicionais para {count} backup(s) selecionado(s).' 
    }),
    defaultNotificationEventsDescription: t({ 
      en: 'Default notification events for additional destinations', 
      de: 'Standard-Benachrichtigungsereignisse für zusätzliche Ziele', 
      fr: 'Événements de notification par défaut pour les destinations supplémentaires', 
      es: 'Eventos de notificación predeterminados para destinos adicionales', 
      'pt-BR': 'Eventos de notificação padrão para destinos adicionais' 
    }),
    defaultAdditionalDestinationsConfigured: t({ 
      en: 'Default additional destinations configured', 
      de: 'Standard-Zusatzziele konfiguriert', 
      fr: 'Destinations supplémentaires par défaut configurées', 
      es: 'Destinos adicionales predeterminados configurados', 
      'pt-BR': 'Destinos adicionais padrão configurados' 
    }),
    notificationChannels: t({ 
      en: 'Notification Channels', 
      de: 'Benachrichtigungskanäle', 
      fr: 'Canaux de notification', 
      es: 'Canales de notificación', 
      'pt-BR': 'Canais de notificação' 
    }),
    someValuesInheritedFromServerDefaults: t({ 
      en: 'Some values inherited from server defaults', 
      de: 'Einige Werte von Server-Standardeinstellungen geerbt', 
      fr: 'Certaines valeurs héritées des paramètres par défaut du serveur', 
      es: 'Algunos valores heredados de los valores predeterminados del servidor', 
      'pt-BR': 'Alguns valores herdados dos padrões do servidor' 
    }),
    someValuesInheritedFromServerDefaultsParens: t({ 
      en: '(Some values inherited from server defaults)', 
      de: '(Einige Werte von Server-Standardeinstellungen geerbt)', 
      fr: '(Certaines valeurs héritées des paramètres par défaut du serveur)', 
      es: '(Algunos valores heredados de los valores predeterminados del servidor)', 
      'pt-BR': '(Alguns valores herdados dos padrões do servidor)' 
    }),
    backupsSelected: t({ 
      en: '{count} backup selected', 
      de: '{count} Sicherung ausgewählt', 
      fr: '{count} sauvegarde sélectionnée', 
      es: '{count} backup seleccionado', 
      'pt-BR': '{count} backup selecionado' 
    }),
    backupsSelectedPlural: t({ 
      en: '{count} backups selected', 
      de: '{count} Sicherungen ausgewählt', 
      fr: '{count} sauvegardes sélectionnées', 
      es: '{count} backups seleccionados', 
      'pt-BR': '{count} backups selecionados' 
    }),
    clearSelection: t({ 
      en: 'Clear Selection', 
      de: 'Auswahl löschen', 
      fr: 'Effacer la sélection', 
      es: 'Limpiar selección', 
      'pt-BR': 'Limpar seleção' 
    }),

    // Toast and error messages
    syncedToServerDefaults: t({ 
      en: 'Synced to Server Defaults', 
      de: 'Mit Server-Standardeinstellungen synchronisiert', 
      fr: 'Synchronisé avec les paramètres par défaut du serveur', 
      es: 'Sincronizado con valores predeterminados del servidor', 
      'pt-BR': 'Sincronizado com padrões do servidor' 
    }),
    syncedToServerDefaultsDesc: t({ 
      en: 'All {count} backup(s) now inherit from server defaults', 
      de: 'Alle {count} Sicherung(en) erben jetzt von den Server-Standardeinstellungen', 
      fr: 'Toutes les {count} sauvegarde(s) héritent maintenant des paramètres par défaut du serveur', 
      es: 'Todos los {count} backup(s) ahora heredan de los valores predeterminados del servidor', 
      'pt-BR': 'Todos os {count} backup(s) agora herdam dos padrões do servidor' 
    }),
    clearComplete: t({ 
      en: 'Clear Complete', 
      de: 'Löschung abgeschlossen', 
      fr: 'Effacement terminé', 
      es: 'Limpieza completada', 
      'pt-BR': 'Limpeza concluída' 
    }),
    clearCompleteDesc: t({ 
      en: 'Cleared all additional destinations for server and {count} backup(s).', 
      de: 'Alle zusätzlichen Ziele für Server und {count} Sicherung(en) gelöscht.', 
      fr: 'Toutes les destinations supplémentaires pour le serveur et {count} sauvegarde(s) effacées.', 
      es: 'Se han borrado todos los destinos adicionales para el servidor y {count} backup(s).', 
      'pt-BR': 'Todos os destinos adicionais para o servidor e {count} backup(s) foram limpos.' 
    }),
    noPermissionToModify: t({ 
      en: 'You do not have permission to modify this setting. Only administrators can change configurations.', 
      de: 'Sie haben keine Berechtigung, diese Einstellung zu ändern. Nur Administratoren können Konfigurationen ändern.', 
      fr: 'Vous n\'avez pas la permission de modifier ce paramètre. Seuls les administrateurs peuvent modifier les configurations.', 
      es: 'No tiene permiso para modificar esta configuración. Solo los administradores pueden cambiar las configuraciones.', 
      'pt-BR': 'Você não tem permissão para modificar esta configuração. Apenas administradores podem alterar configurações.' 
    }),
    failedToAutoSaveBackupSettings: t({ 
      en: 'Failed to auto-save backup settings: {details}', 
      de: 'Fehler beim automatischen Speichern der Backup-Einstellungen: {details}', 
      fr: 'Échec de l\'enregistrement automatique des paramètres de sauvegarde : {details}', 
      es: 'Error al guardar automáticamente la configuración de backup: {details}', 
      'pt-BR': 'Falha ao salvar automaticamente as configurações de backup: {details}' 
    }),
    autoSaveError: t({ 
      en: 'Auto-save Error', 
      de: 'Fehler beim automatischen Speichern', 
      fr: 'Erreur d\'enregistrement automatique', 
      es: 'Error de guardado automático', 
      'pt-BR': 'Erro de salvamento automático' 
    }),
    failedToSaveBackupNotificationSettings: t({ 
      en: 'Failed to save backup notification settings: {error}', 
      de: 'Fehler beim Speichern der Backup-Benachrichtigungseinstellungen: {error}', 
      fr: 'Échec de l\'enregistrement des paramètres de notification de sauvegarde : {error}', 
      es: 'Error al guardar la configuración de notificaciones de backup: {error}', 
      'pt-BR': 'Falha ao salvar as configurações de notificação de backup: {error}' 
    }),
    updateInProgress: t({ 
      en: 'Update In Progress', 
      de: 'Aktualisierung läuft', 
      fr: 'Mise à jour en cours', 
      es: 'Actualización en curso', 
      'pt-BR': 'Atualização em andamento' 
    }),
    pleaseWaitForSave: t({ 
      en: 'Please wait for the current save operation to complete.', 
      de: 'Bitte warten Sie, bis der aktuelle Speichervorgang abgeschlossen ist.', 
      fr: 'Veuillez attendre que l\'opération d\'enregistrement en cours soit terminée.', 
      es: 'Espere a que se complete la operación de guardado actual.', 
      'pt-BR': 'Aguarde a conclusão da operação de salvamento atual.' 
    }),
    additionalDestinationsCleared: t({ 
      en: 'Additional Destinations Cleared', 
      de: 'Zusätzliche Ziele gelöscht', 
      fr: 'Destinations supplémentaires effacées', 
      es: 'Destinos adicionales borrados', 
      'pt-BR': 'Destinos adicionais limpos' 
    }),
    additionalDestinationsClearedDesc: t({ 
      en: 'Cleared all additional destinations from {count} backup(s). Inheritance maintained.', 
      de: 'Alle zusätzlichen Ziele von {count} Sicherung(en) gelöscht. Vererbung beibehalten.', 
      fr: 'Toutes les destinations supplémentaires de {count} sauvegarde(s) effacées. Héritage maintenu.', 
      es: 'Se han borrado todos los destinos adicionales de {count} backup(s). Herencia mantenida.', 
      'pt-BR': 'Todos os destinos adicionais de {count} backup(s) foram limpos. Herança mantida.' 
    }),
    removeError: t({ 
      en: 'Remove Error', 
      de: 'Fehler beim Entfernen', 
      fr: 'Erreur de suppression', 
      es: 'Error al eliminar', 
      'pt-BR': 'Erro ao remover' 
    }),
    failedToRemoveAdditionalDestinations: t({ 
      en: 'Failed to remove additional destinations: {error}', 
      de: 'Fehler beim Entfernen zusätzlicher Ziele: {error}', 
      fr: 'Échec de la suppression des destinations supplémentaires : {error}', 
      es: 'Error al eliminar destinos adicionales: {error}', 
      'pt-BR': 'Falha ao remover destinos adicionais: {error}' 
    }),
    validationError: t({ 
      en: 'Validation Error', 
      de: 'Validierungsfehler', 
      fr: 'Erreur de validation', 
      es: 'Error de validación', 
      'pt-BR': 'Erro de validação' 
    }),
    pleaseEnterEmailAddressesBeforeTesting: t({ 
      en: 'Please enter email addresses before testing', 
      de: 'Bitte geben Sie E-Mail-Adressen ein, bevor Sie testen', 
      fr: 'Veuillez entrer les adresses e-mail avant de tester', 
      es: 'Por favor ingrese direcciones de correo antes de probar', 
      'pt-BR': 'Por favor, insira endereços de e-mail antes de testar' 
    }),
    invalidEmailAddresses: t({ 
      en: 'Invalid email addresses: {emails}', 
      de: 'Ungültige E-Mail-Adressen: {emails}', 
      fr: 'Adresses e-mail invalides : {emails}', 
      es: 'Direcciones de correo inválidas: {emails}', 
      'pt-BR': 'Endereços de e-mail inválidos: {emails}' 
    }),
    failedToSendTestEmail: t({ 
      en: 'Failed to send test email', 
      de: 'Fehler beim Senden der Test-E-Mail', 
      fr: 'Échec de l\'envoi de l\'e-mail de test', 
      es: 'Error al enviar correo de prueba', 
      'pt-BR': 'Falha ao enviar e-mail de teste' 
    }),
    testEmailSent: t({ 
      en: 'Test Email Sent', 
      de: 'Test-E-Mail gesendet', 
      fr: 'E-mail de test envoyé', 
      es: 'Correo de prueba enviado', 
      'pt-BR': 'E-mail de teste enviado' 
    }),
    testEmailSentToAddresses: t({ 
      en: 'Test email sent to {count} address(es)', 
      de: 'Test-E-Mail an {count} Adresse(n) gesendet', 
      fr: 'E-mail de test envoyé à {count} adresse(s)', 
      es: 'Correo de prueba enviado a {count} dirección(es)', 
      'pt-BR': 'E-mail de teste enviado para {count} endereço(s)' 
    }),
    testEmailFailed: t({ 
      en: 'Test Email Failed', 
      de: 'Test-E-Mail fehlgeschlagen', 
      fr: 'Échec de l\'e-mail de test', 
      es: 'Correo de prueba fallido', 
      'pt-BR': 'Falha no e-mail de teste' 
    }),
    pleaseEnterTopicBeforeTesting: t({ 
      en: 'Please enter a topic before testing', 
      de: 'Bitte geben Sie ein Thema ein, bevor Sie testen', 
      fr: 'Veuillez entrer un sujet avant de tester', 
      es: 'Por favor ingrese un tema antes de probar', 
      'pt-BR': 'Por favor, insira um tópico antes de testar' 
    }),
    configurationError: t({ 
      en: 'Configuration Error', 
      de: 'Konfigurationsfehler', 
      fr: 'Erreur de configuration', 
      es: 'Error de configuración', 
      'pt-BR': 'Erro de configuração' 
    }),
    ntfyNotConfigured: t({ 
      en: 'NTFY is not configured. Please configure NTFY settings first.', 
      de: 'NTFY ist nicht konfiguriert. Bitte konfigurieren Sie zuerst die NTFY-Einstellungen.', 
      fr: 'NTFY n\'est pas configuré. Veuillez configurer d\'abord les paramètres NTFY.', 
      es: 'NTFY no está configurado. Por favor configure primero los ajustes NTFY.', 
      'pt-BR': 'NTFY não está configurado. Por favor, configure as configurações NTFY primeiro.' 
    }),
    failedToSendTestNotification: t({ 
      en: 'Failed to send test notification', 
      de: 'Fehler beim Senden der Testbenachrichtigung', 
      fr: 'Échec de l\'envoi de la notification de test', 
      es: 'Error al enviar notificación de prueba', 
      'pt-BR': 'Falha ao enviar notificação de teste' 
    }),
    testNotificationSent: t({ 
      en: 'Test Notification Sent', 
      de: 'Testbenachrichtigung gesendet', 
      fr: 'Notification de test envoyée', 
      es: 'Notificación de prueba enviada', 
      'pt-BR': 'Notificação de teste enviada' 
    }),
    testNotificationSentToTopic: t({ 
      en: 'Test notification sent to topic: {topic}', 
      de: 'Testbenachrichtigung an Thema gesendet: {topic}', 
      fr: 'Notification de test envoyée au sujet : {topic}', 
      es: 'Notificación de prueba enviada al tema: {topic}', 
      'pt-BR': 'Notificação de teste enviada ao tópico: {topic}' 
    }),
    testNotificationFailed: t({ 
      en: 'Test Notification Failed', 
      de: 'Testbenachrichtigung fehlgeschlagen', 
      fr: 'Échec de la notification de test', 
      es: 'Notificación de prueba fallida', 
      'pt-BR': 'Falha na notificação de teste' 
    }),
    pleaseEnterTopicBeforeGeneratingQr: t({ 
      en: 'Please enter a topic before generating QR code', 
      de: 'Bitte geben Sie ein Thema ein, bevor Sie den QR-Code generieren', 
      fr: 'Veuillez entrer un sujet avant de générer le code QR', 
      es: 'Por favor ingrese un tema antes de generar el código QR', 
      'pt-BR': 'Por favor, insira um tópico antes de gerar o código QR' 
    }),
    qrCodeGenerationFailed: t({ 
      en: 'QR Code Generation Failed', 
      de: 'QR-Code-Generierung fehlgeschlagen', 
      fr: 'Échec de la génération du code QR', 
      es: 'Error en la generación del código QR', 
      'pt-BR': 'Falha na geração do código QR' 
    }),
    failedToGenerateQrCode: t({ 
      en: 'Failed to generate QR code. Please try again.', 
      de: 'Fehler beim Generieren des QR-Codes. Bitte versuchen Sie es erneut.', 
      fr: 'Échec de la génération du code QR. Veuillez réessayer.', 
      es: 'Error al generar el código QR. Por favor, inténtelo de nuevo.', 
      'pt-BR': 'Falha ao gerar código QR. Por favor, tente novamente.' 
    }),
    bulkUpdateSuccessful: t({ 
      en: 'Bulk Update Successful', 
      de: 'Massenaktualisierung erfolgreich', 
      fr: 'Mise à jour en masse réussie', 
      es: 'Actualización masiva exitosa', 
      'pt-BR': 'Atualização em massa bem-sucedida' 
    }),
    bulkUpdateError: t({ 
      en: 'Bulk Update Error', 
      de: 'Fehler bei der Massenaktualisierung', 
      fr: 'Erreur de mise à jour en masse', 
      es: 'Error de actualización masiva', 
      'pt-BR': 'Erro na atualização em massa' 
    }),
    failedToUpdateBackups: t({ 
      en: 'Failed to update backups: {error}', 
      de: 'Fehler beim Aktualisieren der Backups: {error}', 
      fr: 'Échec de la mise à jour des sauvegardes : {error}', 
      es: 'Error al actualizar backups: {error}', 
      'pt-BR': 'Falha ao atualizar backups: {error}' 
    }),
    appliedToServerDefaults: t({ 
      en: 'Applied to {servers} server default(s) ({backups} backup(s) will inherit)', 
      de: 'Angewendet auf {servers} Server-Standard(e) ({backups} Sicherung(en) werden erben)', 
      fr: 'Appliqué à {servers} paramètre(s) par défaut du serveur ({backups} sauvegarde(s) hériteront)', 
      es: 'Aplicado a {servers} valor(es) predeterminado(s) del servidor ({backups} backup(s) heredarán)', 
      'pt-BR': 'Aplicado a {servers} padrão(ões) do servidor ({backups} backup(s) herdarão)' 
    }),
    updatedBackups: t({ 
      en: 'Updated {count} backup(s)', 
      de: '{count} Sicherung(en) aktualisiert', 
      fr: '{count} sauvegarde(s) mise(s) à jour', 
      es: '{count} backup(s) actualizado(s)', 
      'pt-BR': '{count} backup(s) atualizado(s)' 
    }),
    andIndividualBackups: t({ 
      en: 'and {count} individual backup(s)', 
      de: 'und {count} einzelne Sicherung(en)', 
      fr: 'et {count} sauvegarde(s) individuelle(s)', 
      es: 'y {count} backup(s) individual(es)', 
      'pt-BR': 'e {count} backup(s) individual(is)' 
    }),
    failedToSaveBackupSettings: t({
      en: 'Failed to save backup settings: {details}',
      de: 'Fehler beim Speichern der Backup-Einstellungen: {details}',
      fr: 'Échec de l\'enregistrement des paramètres de sauvegarde : {details}',
      es: 'Error al guardar la configuración de backup: {details}',
      'pt-BR': 'Falha ao salvar as configurações de backup: {details}'
    }),

    // Tooltips and labels for UI elements
    clearFilterAria: t({
      en: 'Clear filter',
      de: 'Filter löschen',
      fr: 'Effacer le filtre',
      es: 'Limpiar filtro',
      'pt-BR': 'Limpar filtro'
    }),
    overrideNotInheritingAria: t({
      en: 'Override (not inheriting)',
      de: 'Überschreiben (nicht erbend)',
      fr: 'Remplacer (n\'hérite pas)',
      es: 'Anular (no heredando)',
      'pt-BR': 'Substituir (não herdando)'
    }),
    clickToInheritFromServerDefaultsAria: t({
      en: 'Click to inherit from server defaults',
      de: 'Klicken, um von Server-Standardeinstellungen zu erben',
      fr: 'Cliquez pour hériter des paramètres par défaut du serveur',
      es: 'Haga clic para heredar de los valores predeterminados del servidor',
      'pt-BR': 'Clique para herdar dos padrões do servidor'
    }),
    inheritingFromServerDefaultsAria: t({
      en: 'Inheriting from server defaults',
      de: 'Erbt von Server-Standardeinstellungen',
      fr: 'Hérite des paramètres par défaut du serveur',
      es: 'Heredando de valores predeterminados del servidor',
      'pt-BR': 'Herdando dos padrões do servidor'
    }),
    enableNtfyNotificationsAria: t({
      en: 'Enable NTFY notifications',
      de: 'NTFY-Benachrichtigungen aktivieren',
      fr: 'Activer les notifications NTFY',
      es: 'Activar notificaciones NTFY',
      'pt-BR': 'Ativar notificações NTFY'
    }),
    enableEmailNotificationsAria: t({
      en: 'Enable Email notifications',
      de: 'E-Mail-Benachrichtigungen aktivieren',
      fr: 'Activer les notifications par e-mail',
      es: 'Activar notificaciones por correo electrónico',
      'pt-BR': 'Ativar notificações por e-mail'
    }),
    sendTestEmailAria: t({
      en: 'Send test email',
      de: 'Test-E-Mail senden',
      fr: 'Envoyer un e-mail de test',
      es: 'Enviar correo de prueba',
      'pt-BR': 'Enviar e-mail de teste'
    }),
    sendTestNotificationAria: t({
      en: 'Send test notification',
      de: 'Testbenachrichtigung senden',
      fr: 'Envoyer une notification de test',
      es: 'Enviar notificación de prueba',
      'pt-BR': 'Enviar notificação de teste'
    }),
    showQrCodeAria: t({
      en: 'Show QR code',
      de: 'QR-Code anzeigen',
      fr: 'Afficher le code QR',
      es: 'Mostrar código QR',
      'pt-BR': 'Mostrar código QR'
    }),
    selectAllNtfyNotifications: t({
      en: 'Select all NTFY notifications',
      de: 'Alle NTFY-Benachrichtigungen auswählen',
      fr: 'Sélectionner toutes les notifications NTFY',
      es: 'Seleccionar todas las notificaciones NTFY',
      'pt-BR': 'Selecionar todas as notificações NTFY'
    }),
    selectAllEmailNotifications: t({
      en: 'Select all Email notifications',
      de: 'Alle E-Mail-Benachrichtigungen auswählen',
      fr: 'Sélectionner toutes les notifications par e-mail',
      es: 'Seleccionar todas las notificaciones por correo electrónico',
      'pt-BR': 'Selecionar todas as notificações por e-mail'
    }),
    notConfigured: t({
      en: 'not configured',
      de: 'nicht konfiguriert',
      fr: 'non configuré',
      es: 'no configurado',
      'pt-BR': 'não configurado'
    }),
    smtpNotConfiguredBulk: t({
      en: 'SMTP not configured - notifications will not be sent',
      de: 'SMTP nicht konfiguriert - Benachrichtigungen werden nicht gesendet',
      fr: 'SMTP non configuré - les notifications ne seront pas envoyées',
      es: 'SMTP no configurado - las notificaciones no se enviarán',
      'pt-BR': 'SMTP não configurado - as notificações não serão enviadas'
    }),
    ntfyNotConfiguredBulk: t({
      en: 'NTFY not configured - notifications will not be sent',
      de: 'NTFY nicht konfiguriert - Benachrichtigungen werden nicht gesendet',
      fr: 'NTFY non configuré - les notifications ne seront pas envoyées',
      es: 'NTFY no configurado - las notificaciones no se enviarán',
      'pt-BR': 'NTFY não configurado - as notificações não serão enviadas'
    }),
    serverIdLabel: t({
      en: 'ServerID: {value}',
      de: 'Server-ID: {value}',
      fr: 'ID de serveur: {value}',
      es: 'ID del servidor: {value}',
      'pt-BR': 'ID do servidor: {value}'
    }),
    customDestinationsConfigured: t({
      en: 'Custom additional destinations configured',
      de: 'Benutzerdefinierte zusätzliche Ziele konfiguriert',
      fr: 'Destinations supplémentaires personnalisées configurées',
      es: 'Destinos adicionales personalizados configurados',
      'pt-BR': 'Destinos adicionais personalizados configurados'
    }),
    usingServerDefaultDestinations: t({
      en: 'Using server default destinations',
      de: 'Verwendet Server-Standardziele',
      fr: 'Utilise les destinations par défaut du serveur',
      es: 'Usando destinos predeterminados del servidor',
      'pt-BR': 'Usando destinos padrão do servidor'
    }),
    someBackupsSelectedClickToSelectAllVisible: t({
      en: 'Some backups selected - click to select all visible',
      de: 'Einige Sicherungen ausgewählt - Klicken zum Auswählen aller sichtbaren',
      fr: 'Quelques sauvegardes sélectionnées - cliquer pour sélectionner toutes les visibles',
      es: 'Algunas copias de seguridad seleccionadas - hacer clic para seleccionar todas las visibles',
      'pt-BR': 'Alguns backups selecionados - clicar para selecionar todos os visíveis'
    }),
    selectAllBackupsForThisServer: t({
      en: 'Select all backups for this server',
      de: 'Alle Sicherungen für diesen Server auswählen',
      fr: 'Sélectionner toutes les sauvegardes pour ce serveur',
      es: 'Seleccionar todas las copias de seguridad para este servidor',
      'pt-BR': 'Selecionar todos os backups para este servidor'
    }),
    ntfyDisabled: t({
      en: 'NTFY (disabled)',
      de: 'NTFY (deaktiviert)',
      fr: 'NTFY (désactivé)',
      es: 'NTFY (desactivado)',
      'pt-BR': 'NTFY (desativado)'
    }),
    emailDisabled: t({
      en: 'Email (disabled)',
      de: 'E-Mail (deaktiviert)',
      fr: 'E-mail (désactivé)',
      es: 'Email (desactivado)',
      'pt-BR': 'E-mail (desativado)'
    }),
    allNtfy: t({
      en: 'All NTFY',
      de: 'Alle NTFY',
      fr: 'Toutes les NTFY',
      es: 'Todas las NTFY',
      'pt-BR': 'Todas as NTFY'
    }),
    allEmail: t({
      en: 'All Email',
      de: 'Alle E-Mails',
      fr: 'Tous les e-mails',
      es: 'Todos los correos',
      'pt-BR': 'Todos os e-mails'
    }),
    defaultEmailInherited: t({
      en: 'Default email addresses inherited by all backups on this server',
      de: 'Standard-E-Mail-Adressen, die von allen Sicherungen auf diesem Server geerbt werden',
      fr: 'Adresses e-mail par défaut héritées par toutes les sauvegardes sur ce serveur',
      es: 'Direcciones de correo predeterminadas heredadas por todas las copias de seguridad en este servidor',
      'pt-BR': 'Endereços de e-mail padrão herdados por todos os backups neste servidor'
    }),
    defaultNtfyInherited: t({
      en: 'Default NTFY topic inherited by all backups on this server',
      de: 'Standard-NTFY-Thema, das von allen Sicherungen auf diesem Server geerbt wird',
      fr: 'Sujet NTFY par défaut hérité par toutes les sauvegardes sur ce serveur',
      es: 'Tema NTFY predeterminado heredado por todas las copias de seguridad en este servidor',
      'pt-BR': 'Tópico NTFY padrão herdado por todos os backups neste servidor'
    }),
    clear: t({
      en: 'Clear',
      de: 'Löschen',
      fr: 'Effacer',
      es: 'Borrar',
      'pt-BR': 'Limpar'
    }),
  },
} satisfies Dictionary;
