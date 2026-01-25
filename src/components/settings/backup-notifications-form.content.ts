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
    backupNotifications: t({ 
      en: 'Backup Notifications', 
      de: 'Backup-Benachrichtigungen', 
      fr: 'Notifications de sauvegarde', 
      es: 'Notificaciones de backup', 
      'pt-BR': 'Notificações de backup' 
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
  },
} satisfies Dictionary;
