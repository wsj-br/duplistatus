import { t, type Dictionary } from 'intlayer';

export default {
  key: 'overview-charts-panel',
  content: {
    backupHistory: t({ 
      en: 'Backup History', 
      de: 'Sicherungsverlauf', 
      fr: 'Historique des sauvegardes', 
      es: 'Historial de respaldos', 
      'pt-BR': 'Histórico de backups' 
    }),
    successRate: t({ 
      en: 'Success Rate', 
      de: 'Erfolgsquote', 
      fr: 'Taux de réussite', 
      es: 'Tasa de éxito', 
      'pt-BR': 'Taxa de sucesso' 
    }),
    backupSize: t({ 
      en: 'Backup Size', 
      de: 'Sicherungsgröße', 
      fr: 'Taille de sauvegarde', 
      es: 'Tamaño de respaldo', 
      'pt-BR': 'Tamanho do backup' 
    }),
    fileSize: t({ 
      en: 'File Size', 
      de: 'Dateigröße', 
      fr: 'Taille de fichier', 
      es: 'Tamaño de archivo', 
      'pt-BR': 'Tamanho do arquivo' 
    }),
    storageSize: t({ 
      en: 'Storage Size', 
      de: 'Speichergröße', 
      fr: 'Taille de stockage', 
      es: 'Tamaño de almacenamiento', 
      'pt-BR': 'Tamanho de armazenamento' 
    }),
    backupDuration: t({ 
      en: 'Backup Duration', 
      de: 'Sicherungsdauer', 
      fr: 'Durée de sauvegarde', 
      es: 'Duración de respaldo', 
      'pt-BR': 'Duração do backup' 
    }),
    serverStatus: t({ 
      en: 'Server Status', 
      de: 'Serverstatus', 
      fr: 'Statut du serveur', 
      es: 'Estado del servidor', 
      'pt-BR': 'Status do servidor' 
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
    last90Days: t({ 
      en: 'Last 90 Days', 
      de: 'Letzte 90 Tage', 
      fr: 'Derniers 90 jours', 
      es: 'Últimos 90 días', 
      'pt-BR': 'Últimos 90 dias' 
    }),
    thisYear: t({ 
      en: 'This Year', 
      de: 'Dieses Jahr', 
      fr: 'Cette année', 
      es: 'Este año', 
      'pt-BR': 'Este ano' 
    }),
    successful: t({ 
      en: 'Successful', 
      de: 'Erfolgreich', 
      fr: 'Réussi', 
      es: 'Exitoso', 
      'pt-BR': 'Bem-sucedido' 
    }),
    failed: t({ 
      en: 'Failed', 
      de: 'Fehlgeschlagen', 
      fr: 'Échoué', 
      es: 'Fallido', 
      'pt-BR': 'Falhado' 
    }),
    total: t({ 
      en: 'Total', 
      de: 'Gesamt', 
      fr: 'Total', 
      es: 'Total', 
      'pt-BR': 'Total' 
    }),
    percentage: t({ 
      en: 'Percentage', 
      de: 'Prozentsatz', 
      fr: 'Pourcentage', 
      es: 'Porcentaje', 
      'pt-BR': 'Percentual' 
    }),
    average: t({ 
      en: 'Average', 
      de: 'Durchschnitt', 
      fr: 'Moyenne', 
      es: 'Promedio', 
      'pt-BR': 'Média' 
    }),
    minimum: t({ 
      en: 'Minimum', 
      de: 'Minimum', 
      fr: 'Minimum', 
      es: 'Mínimo', 
      'pt-BR': 'Mínimo' 
    }),
    maximum: t({ 
      en: 'Maximum', 
      de: 'Maximum', 
      fr: 'Maximum', 
      es: 'Máximo', 
      'pt-BR': 'Máximo' 
    }),
    // Additional strings for component
    allBackups: t({ 
      en: ' (all backups)', 
      de: ' (alle Sicherungen)', 
      fr: ' (toutes les sauvegardes)', 
      es: ' (todos los respaldos)', 
      'pt-BR': ' (todos os backups)' 
    }),
    allServersAndBackups: t({ 
      en: 'All Servers & Backups', 
      de: 'Alle Server & Sicherungen', 
      fr: 'Tous les serveurs et sauvegardes', 
      es: 'Todos los servidores y respaldos', 
      'pt-BR': 'Todos os servidores e backups' 
    }),
    loadingChartData: t({ 
      en: 'Loading chart data...', 
      de: 'Lade Diagrammdaten...', 
      fr: 'Chargement des données du graphique...', 
      es: 'Cargando datos del gráfico...', 
      'pt-BR': 'Carregando dados do gráfico...' 
    }),
    errorLoadingChartData: t({ 
      en: 'Error loading chart data', 
      de: 'Fehler beim Laden der Diagrammdaten', 
      fr: 'Erreur lors du chargement des données du graphique', 
      es: 'Error al cargar datos del gráfico', 
      'pt-BR': 'Erro ao carregar dados do gráfico' 
    }),
    noDataAvailable: t({ 
      en: 'No data available', 
      de: 'Keine Daten verfügbar', 
      fr: 'Aucune donnée disponible', 
      es: 'No hay datos disponibles', 
      'pt-BR': 'Nenhum dado disponível' 
    }),
  },
} satisfies Dictionary;
