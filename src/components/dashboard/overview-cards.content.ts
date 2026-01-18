import { t, type Dictionary } from 'intlayer';

export default {
  key: 'overview-cards',
  content: {
    totalServers: t({ 
      en: 'Total Servers', 
      de: 'Gesamtserver', 
      fr: 'Total des serveurs', 
      es: 'Servidores totales', 
      'pt-BR': 'Total de servidores' 
    }),
    onlineServers: t({ 
      en: 'Online Servers', 
      de: 'Server online', 
      fr: 'Serveurs en ligne', 
      es: 'Servidores en línea', 
      'pt-BR': 'Servidores online' 
    }),
    offlineServers: t({ 
      en: 'Offline Servers', 
      de: 'Server offline', 
      fr: 'Serveurs hors ligne', 
      es: 'Servidores fuera de línea', 
      'pt-BR': 'Servidores offline' 
    }),
    totalBackups: t({ 
      en: 'Total Backups', 
      de: 'Gesamtsicherungen', 
      fr: 'Total des sauvegardes', 
      es: 'Respaldos totales', 
      'pt-BR': 'Total de backups' 
    }),
    successfulBackups: t({ 
      en: 'Successful Backups', 
      de: 'Erfolgreiche Sicherungen', 
      fr: 'Sauvegardes réussies', 
      es: 'Respaldos exitosos', 
      'pt-BR': 'Backups bem-sucedidos' 
    }),
    failedBackups: t({ 
      en: 'Failed Backups', 
      de: 'Fehlgeschlagene Sicherungen', 
      fr: 'Sauvegardes échouées', 
      es: 'Respaldos fallidos', 
      'pt-BR': 'Backups falharam' 
    }),
    last24Hours: t({ 
      en: 'Last 24 Hours', 
      de: 'Letzte 24 Stunden', 
      fr: 'Dernières 24 heures', 
      es: 'Últimas 24 horas', 
      'pt-BR': 'Últimas 24 horas' 
    }),
    last7Days: t({ 
      en: 'Last 7 Days', 
      de: 'Letzte 7 Tage', 
      fr: 'Derniers 7 jours', 
      es: 'Últimos 7 días', 
      'pt-BR': 'Últimos 7 dias' 
    }),
    last30Days: t({ 
      en: 'Last 30 Days', 
      de: 'Letzte 30 Tage', 
      fr: 'Derniers 30 jours', 
      es: 'Últimos 30 días', 
      'pt-BR': 'Últimos 30 dias' 
    }),
    // Card-specific labels
    files: t({ 
      en: 'Files', 
      de: 'Dateien', 
      fr: 'Fichiers', 
      es: 'Archivos', 
      'pt-BR': 'Arquivos' 
    }),
    size: t({ 
      en: 'Size', 
      de: 'Größe', 
      fr: 'Taille', 
      es: 'Tamaño', 
      'pt-BR': 'Tamanho' 
    }),
    storage: t({ 
      en: 'Storage', 
      de: 'Speicher', 
      fr: 'Stockage', 
      es: 'Almacenamiento', 
      'pt-BR': 'Armazenamento' 
    }),
    last: t({ 
      en: 'Last', 
      de: 'Letzte', 
      fr: 'Dernière', 
      es: 'Última', 
      'pt-BR': 'Última' 
    }),
    backups: t({ 
      en: 'Backups:', 
      de: 'Sicherungen:', 
      fr: 'Sauvegardes:', 
      es: 'Respaldos:', 
      'pt-BR': 'Backups:' 
    }),
    noBackupJobsAvailable: t({ 
      en: 'No backup jobs available', 
      de: 'Keine Backup-Jobs verfügbar', 
      fr: 'Aucune tâche de sauvegarde disponible', 
      es: 'No hay trabajos de respaldo disponibles', 
      'pt-BR': 'Nenhum trabalho de backup disponível' 
    }),
    noServersFound: t({ 
      en: 'No servers found', 
      de: 'Keine Server gefunden', 
      fr: 'Aucun serveur trouvé', 
      es: 'No se encontraron servidores', 
      'pt-BR': 'Nenhum servidor encontrado' 
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
    // Sort options (used from server-cards but referenced here)
    sortServerName: t({ 
      en: 'Server name (a-z)', 
      de: 'Servername (a-z)', 
      fr: 'Nom du serveur (a-z)', 
      es: 'Nombre del servidor (a-z)', 
      'pt-BR': 'Nome do servidor (a-z)' 
    }),
    sortStatus: t({ 
      en: 'Status (error>warnings>success)', 
      de: 'Status (Fehler>Warnungen>Erfolg)', 
      fr: 'Statut (erreur>avertissements>succès)', 
      es: 'Estado (error>advertencias>éxito)', 
      'pt-BR': 'Status (erro>avisos>sucesso)' 
    }),
    sortLastBackup: t({ 
      en: 'Last backup received (new>old)', 
      de: 'Letzte Sicherung erhalten (neu>alt)', 
      fr: 'Dernière sauvegarde reçue (nouveau>ancien)', 
      es: 'Último respaldo recibido (nuevo>antiguo)', 
      'pt-BR': 'Último backup recebido (novo>antigo)' 
    }),
  },
} satisfies Dictionary;
