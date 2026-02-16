import { t, type Dictionary } from 'intlayer';

export default {
  key: 'metrics-charts-panel',
  content: {
    title: t({
      en: 'Metrics',
      de: 'Metriken',
      fr: 'Métriques',
      es: 'Métricas',
      'pt-BR': 'Métricas',
    }),
    chartLabelUploadedSize: t({
      en: 'Uploaded Size',
      de: 'Hochgeladene Größe',
      fr: 'Taille téléversée',
      es: 'Tamaño enviado',
      'pt-BR': 'Tamanho enviado',
    }),
    chartLabelDuration: t({
      en: 'Duration',
      de: 'Dauer',
      fr: 'Durée',
      es: 'Duración',
      'pt-BR': 'Duração',
    }),
    chartLabelFileCount: t({
      en: 'File Count',
      de: 'Dateianzahl',
      fr: 'Nombre de fichiers',
      es: 'Cantidad de archivos',
      'pt-BR': 'Contagem de arquivos',
    }),
    chartLabelFileSize: t({
      en: 'File Size',
      de: 'Dateigröße',
      fr: 'Taille du fichier',
      es: 'Tamaño del archivo',
      'pt-BR': 'Tamanho do arquivo',
    }),
    chartLabelStorageSize: t({
      en: 'Storage Size',
      de: 'Speichergröße',
      fr: 'Taille du stockage',
      es: 'Tamaño de almacenamiento',
      'pt-BR': 'Tamanho do armazenamento',
    }),
    chartLabelAvailableVersions: t({
      en: 'Available Versions',
      de: 'Verfügbare Versionen',
      fr: 'Versions disponibles',
      es: 'Versiones disponibles',
      'pt-BR': 'Versões disponíveis',
    }),
    loading: t({
      en: 'Loading chart data...',
      de: 'Diagrammdaten werden geladen...',
      fr: 'Chargement des données du graphique...',
      es: 'Cargando datos del gráfico...',
      'pt-BR': 'Carregando dados do gráfico...',
    }),
    errorLoading: t({
      en: 'Error loading chart data',
      de: 'Fehler beim Laden der Diagrammdaten',
      fr: 'Erreur lors du chargement des données du graphique',
      es: 'Error al cargar los datos del gráfico',
      'pt-BR': 'Erro ao carregar dados do gráfico',
    }),
    noDataAvailable: t({
      en: 'No data available',
      de: 'Keine Daten verfügbar',
      fr: 'Aucune donnée disponible',
      es: 'No hay datos disponibles',
      'pt-BR': 'Nenhum dado disponível',
    }),
    allBackups: t({
      en: ' (all backups)',
      de: ' (alle Sicherungen)',
      fr: ' (toutes les sauvegardes)',
      es: ' (todas las copias de seguridad)',
      'pt-BR': ' (todos os backups)',
    }),
    allServersAndBackups: t({
      en: 'All Servers & Backups',
      de: 'Alle Server & Sicherungen',
      fr: 'Tous les serveurs et sauvegardes',
      es: 'Todos los servidores y copias de seguridad',
      'pt-BR': 'Todos os servidores e backups',
    }),
    // Time ranges are now available in common.time:
    // timeRangeLast24Hours -> common.time.last24Hours
    // timeRangeLastWeek -> common.time.lastWeek
    // timeRangeLast2Weeks -> common.time.last2Weeks
    // timeRangeLastMonth -> common.time.lastMonth
    // timeRangeLastQuarter -> common.time.lastQuarter
    // timeRangeLastSemester -> common.time.lastSemester
    // timeRangeLastYear -> common.time.lastYear
    // timeRangeLast2Years -> common.time.last2Years
    // timeRangeAllData -> common.time.allAvailableData
  },
} satisfies Dictionary;
