import { t, type Dictionary } from 'intlayer';

export default {
  key: 'dashboard-table',
  content: {
    servers: {
      title: t({ 
        en: 'Servers', 
        de: 'Server', 
        fr: 'Serveurs', 
        es: 'Servidores', 
        'pt-BR': 'Servidores' 
      }),
      searchPlaceholder: t({ 
        en: 'Search servers...', 
        de: 'Server suchen...', 
        fr: 'Rechercher des serveurs...', 
        es: 'Buscar servidores...', 
        'pt-BR': 'Pesquisar servidores...' 
      }),
      filterByStatus: t({ 
        en: 'Filter by Status', 
        de: 'Nach Status filtern', 
        fr: 'Filtrer par statut', 
        es: 'Filtrar por estado', 
        'pt-BR': 'Filtrar por status' 
      }),
      filterByType: t({ 
        en: 'Filter by Type', 
        de: 'Nach Typ filtern', 
        fr: 'Filtrer par type', 
        es: 'Filtrar por tipo', 
        'pt-BR': 'Filtrar por tipo' 
      }),
      showOnlineOnly: t({ 
        en: 'Show Online Only', 
        de: 'Nur Online anzeigen', 
        fr: 'Afficher uniquement en ligne', 
        es: 'Mostrar solo en línea', 
        'pt-BR': 'Mostrar apenas online' 
      }),
      showOfflineOnly: t({ 
        en: 'Show Offline Only', 
        de: 'Nur Offline anzeigen', 
        fr: 'Afficher uniquement hors ligne', 
        es: 'Mostrar solo fuera de línea', 
        'pt-BR': 'Mostrar apenas offline' 
      }),
      showAll: t({ 
        en: 'Show All', 
        de: 'Alle anzeigen', 
        fr: 'Afficher tout', 
        es: 'Mostrar todo', 
        'pt-BR': 'Mostrar todos' 
      }),
      noServersFound: t({ 
        en: 'No servers found', 
        de: 'Keine Server gefunden', 
        fr: 'Aucun serveur trouvé', 
        es: 'No se encontraron servidores', 
        'pt-BR': 'Nenhum servidor encontrado' 
      }),
      serverName: t({ 
        en: 'Server Name', 
        de: 'Servername', 
        fr: 'Nom du serveur', 
        es: 'Nombre del servidor', 
        'pt-BR': 'Nome do servidor' 
      }),
      status: t({ 
        en: 'Status', 
        de: 'Status', 
        fr: 'Statut', 
        es: 'Estado', 
        'pt-BR': 'Status' 
      }),
      lastBackup: t({ 
        en: 'Last Backup', 
        de: 'Letzte Sicherung', 
        fr: 'Dernière sauvegarde', 
        es: 'Último respaldo', 
        'pt-BR': 'Último backup' 
      }),
      nextBackup: t({ 
        en: 'Next Backup', 
        de: 'Nächste Sicherung', 
        fr: 'Prochaine sauvegarde', 
        es: 'Próximo respaldo', 
        'pt-BR': 'Próximo backup' 
      }),
      actions: t({ 
        en: 'Actions', 
        de: 'Aktionen', 
        fr: 'Actions', 
        es: 'Acciones', 
        'pt-BR': 'Ações' 
      }),
      viewDetails: t({ 
        en: 'View Details', 
        de: 'Details anzeigen', 
        fr: 'Voir les détails', 
        es: 'Ver detalles', 
        'pt-BR': 'Ver detalhes' 
      }),
      editServer: t({ 
        en: 'Edit Server', 
        de: 'Server bearbeiten', 
        fr: 'Modifier le serveur', 
        es: 'Editar servidor', 
        'pt-BR': 'Editar servidor' 
      }),
      deleteServer: t({ 
        en: 'Delete Server', 
        de: 'Server löschen', 
        fr: 'Supprimer le serveur', 
        es: 'Eliminar servidor', 
        'pt-BR': 'Excluir servidor' 
      }),
      testConnection: t({ 
        en: 'Test Connection', 
        de: 'Verbindung testen', 
        fr: 'Tester la connexion', 
        es: 'Probar conexión', 
        'pt-BR': 'Testar conexão' 
      }),
      forceBackup: t({ 
        en: 'Force Backup', 
        de: 'Sicherung erzwingen', 
        fr: 'Forcer la sauvegarde', 
        es: 'Forzar respaldo', 
        'pt-BR': 'Forçar backup' 
      }),
      backupName: t({ 
        en: 'Backup Name', 
        de: 'Sicherungsname', 
        fr: 'Nom de sauvegarde', 
        es: 'Nombre de respaldo', 
        'pt-BR': 'Nome do backup' 
      }),
      overdueNextRun: t({ 
        en: 'Overdue / Next run', 
        de: 'Überfällig / Nächster Lauf', 
        fr: 'En retard / Prochaine exécution', 
        es: 'Vencido / Próxima ejecución', 
        'pt-BR': 'Atrasado / Próxima execução' 
      }),
      availableVersions: t({ 
        en: 'Available Versions', 
        de: 'Verfügbare Versionen', 
        fr: 'Versions disponibles', 
        es: 'Versiones disponibles', 
        'pt-BR': 'Versões disponíveis' 
      }),
      backupCount: t({ 
        en: 'Backup Count', 
        de: 'Anzahl der Sicherungen', 
        fr: 'Nombre de sauvegardes', 
        es: 'Cantidad de respaldos', 
        'pt-BR': 'Contagem de backups' 
      }),
      lastBackupDate: t({ 
        en: 'Last Backup Date', 
        de: 'Datum der letzten Sicherung', 
        fr: 'Date de la dernière sauvegarde', 
        es: 'Fecha del último respaldo', 
        'pt-BR': 'Data do último backup' 
      }),
      lastBackupStatus: t({ 
        en: 'Last Backup Status', 
        de: 'Status der letzten Sicherung', 
        fr: 'Statut de la dernière sauvegarde', 
        es: 'Estado del último respaldo', 
        'pt-BR': 'Status do último backup' 
      }),
      settingsActions: t({ 
        en: 'Settings/Actions', 
        de: 'Einstellungen/Aktionen', 
        fr: 'Paramètres/Actions', 
        es: 'Configuración/Acciones', 
        'pt-BR': 'Configurações/Ações' 
      }),
      collectDataMessage: t({ 
        en: 'Collect data for your first server by clicking on', 
        de: 'Sammeln Sie Daten für Ihren ersten Server, indem Sie auf', 
        fr: 'Collectez des données pour votre premier serveur en cliquant sur', 
        es: 'Recopile datos para su primer servidor haciendo clic en', 
        'pt-BR': 'Colete dados para seu primeiro servidor clicando em' 
      }),
      collectBackupsLogs: t({ 
        en: '(Collect backups logs)', 
        de: '(Sicherungsprotokolle sammeln)', 
        fr: '(Collecter les journaux de sauvegarde)', 
        es: '(Recopilar registros de respaldo)', 
        'pt-BR': '(Coletar logs de backup)' 
      }),
    },
    backups: {
      title: t({ 
        en: 'Backups', 
        de: 'Sicherungen', 
        fr: 'Sauvegardes', 
        es: 'Respaldos', 
        'pt-BR': 'Backups' 
      }),
      searchPlaceholder: t({ 
        en: 'Search backups...', 
        de: 'Sicherungen suchen...', 
        fr: 'Rechercher des sauvegardes...', 
        es: 'Buscar respaldos...', 
        'pt-BR': 'Pesquisar backups...' 
      }),
      filterByStatus: t({ 
        en: 'Filter by Status', 
        de: 'Nach Status filtern', 
        fr: 'Filtrer par statut', 
        es: 'Filtrar por estado', 
        'pt-BR': 'Filtrar por status' 
      }),
      filterByServer: t({ 
        en: 'Filter by Server', 
        de: 'Nach Server filtern', 
        fr: 'Filtrer par serveur', 
        es: 'Filtrar por servidor', 
        'pt-BR': 'Filtrar por servidor' 
      }),
      filterByDate: t({ 
        en: 'Filter by Date', 
        de: 'Nach Datum filtern', 
        fr: 'Filtrer par date', 
        es: 'Filtrar por fecha', 
        'pt-BR': 'Filtrar por data' 
      }),
      showAll: t({ 
        en: 'Show All', 
        de: 'Alle anzeigen', 
        fr: 'Afficher tout', 
        es: 'Mostrar todo', 
        'pt-BR': 'Mostrar todos' 
      }),
      showSuccessful: t({ 
        en: 'Show Successful', 
        de: 'Erfolgreiche anzeigen', 
        fr: 'Afficher les réussis', 
        es: 'Mostrar exitosos', 
        'pt-BR': 'Mostrar bem-sucedidos' 
      }),
      showFailed: t({ 
        en: 'Show Failed', 
        de: 'Fehlgeschlagene anzeigen', 
        fr: 'Afficher les échoués', 
        es: 'Mostrar fallidos', 
        'pt-BR': 'Mostrar falhados' 
      }),
      showPending: t({ 
        en: 'Show Pending', 
        de: 'Ausstehende anzeigen', 
        fr: 'Afficher en attente', 
        es: 'Mostrar pendientes', 
        'pt-BR': 'Mostrar pendentes' 
      }),
      noBackupsFound: t({ 
        en: 'No backups found', 
        de: 'Keine Sicherungen gefunden', 
        fr: 'Aucune sauvegarde trouvée', 
        es: 'No se encontraron respaldos', 
        'pt-BR': 'Nenhum backup encontrado' 
      }),
      backupId: t({ 
        en: 'Backup ID', 
        de: 'Sicherungs-ID', 
        fr: 'ID de sauvegarde', 
        es: 'ID de respaldo', 
        'pt-BR': 'ID do backup' 
      }),
      serverName: t({ 
        en: 'Server Name', 
        de: 'Servername', 
        fr: 'Nom du serveur', 
        es: 'Nombre del servidor', 
        'pt-BR': 'Nome do servidor' 
      }),
      startTime: t({ 
        en: 'Start Time', 
        de: 'Startzeit', 
        fr: 'Heure de début', 
        es: 'Hora de inicio', 
        'pt-BR': 'Hora de início' 
      }),
      endTime: t({ 
        en: 'End Time', 
        de: 'Endzeit', 
        fr: 'Heure de fin', 
        es: 'Hora de fin', 
        'pt-BR': 'Hora de término' 
      }),
      duration: t({ 
        en: 'Duration', 
        de: 'Dauer', 
        fr: 'Durée', 
        es: 'Duración', 
        'pt-BR': 'Duração' 
      }),
      status: t({ 
        en: 'Status', 
        de: 'Status', 
        fr: 'Statut', 
        es: 'Estado', 
        'pt-BR': 'Status' 
      }),
      size: t({ 
        en: 'Size', 
        de: 'Größe', 
        fr: 'Taille', 
        es: 'Tamaño', 
        'pt-BR': 'Tamanho' 
      }),
      files: t({ 
        en: 'Files', 
        de: 'Dateien', 
        fr: 'Fichiers', 
        es: 'Archivos', 
        'pt-BR': 'Arquivos' 
      }),
      errors: t({ 
        en: 'Errors', 
        de: 'Fehler', 
        fr: 'Erreurs', 
        es: 'Errores', 
        'pt-BR': 'Erros' 
      }),
      warnings: t({ 
        en: 'Warnings', 
        de: 'Warnungen', 
        fr: 'Avertissements', 
        es: 'Advertencias', 
        'pt-BR': 'Avisos' 
      }),
      viewDetails: t({ 
        en: 'View Details', 
        de: 'Details anzeigen', 
        fr: 'Voir les détails', 
        es: 'Ver detalles', 
        'pt-BR': 'Ver detalhes' 
      }),
      downloadLog: t({ 
        en: 'Download Log', 
        de: 'Log herunterladen', 
        fr: 'Télécharger le journal', 
        es: 'Descargar registro', 
        'pt-BR': 'Baixar log' 
      }),
      retryBackup: t({ 
        en: 'Retry Backup', 
        de: 'Sicherung wiederholen', 
        fr: 'Réessayer la sauvegarde', 
        es: 'Reintentar respaldo', 
        'pt-BR': 'Tentar backup novamente' 
      }),
    },
    // Tooltip and detail labels
    nextRun: t({ 
      en: 'Next run', 
      de: 'Nächster Lauf', 
      fr: 'Prochaine exécution', 
      es: 'Próxima ejecución', 
      'pt-BR': 'Próxima execução' 
    }),
    checked: t({ 
      en: 'Checked:', 
      de: 'Geprüft:', 
      fr: 'Vérifié:', 
      es: 'Verificado:', 
      'pt-BR': 'Verificado:' 
    }),
    lastBackupLabel: t({ 
      en: 'Last backup:', 
      de: 'Letzte Sicherung:', 
      fr: 'Dernière sauvegarde:', 
      es: 'Último respaldo:', 
      'pt-BR': 'Último backup:' 
    }),
    expectedBackup: t({ 
      en: 'Expected backup:', 
      de: 'Erwartete Sicherung:', 
      fr: 'Sauvegarde attendue:', 
      es: 'Respaldo esperado:', 
      'pt-BR': 'Backup esperado:' 
    }),
    lastNotification: t({ 
      en: 'Last notification:', 
      de: 'Letzte Benachrichtigung:', 
      fr: 'Dernière notification:', 
      es: 'Última notificación:', 
      'pt-BR': 'Última notificação:' 
    }),
    overdueConfiguration: t({ 
      en: 'Overdue configuration', 
      de: 'Überfälligkeitskonfiguration', 
      fr: 'Configuration des retards', 
      es: 'Configuración de vencimientos', 
      'pt-BR': 'Configuração de atrasos' 
    }),
    overdueConfig: t({ 
      en: 'Overdue Config', 
      de: 'Überfälligkeits-Konfig', 
      fr: 'Config des retards', 
      es: 'Config de vencimientos', 
      'pt-BR': 'Config de atrasos' 
    }),
    overdueDetails: t({ 
      en: 'Overdue Details', 
      de: 'Überfälligkeitsdetails', 
      fr: 'Détails des retards', 
      es: 'Detalles de vencimientos', 
      'pt-BR': 'Detalhes de atrasos' 
    }),
    off: t({ 
      en: 'Off', 
      de: 'Aus', 
      fr: 'Désactivé', 
      es: 'Desactivado', 
      'pt-BR': 'Desativado' 
    }),
    lastBackup: t({ 
      en: 'Last Backup', 
      de: 'Letzte Sicherung', 
      fr: 'Dernière sauvegarde', 
      es: 'Último respaldo', 
      'pt-BR': 'Último backup' 
    }),
    settings: t({ 
      en: 'Settings', 
      de: 'Einstellungen', 
      fr: 'Paramètres', 
      es: 'Configuración', 
      'pt-BR': 'Configurações' 
    }),
  },
} satisfies Dictionary;
