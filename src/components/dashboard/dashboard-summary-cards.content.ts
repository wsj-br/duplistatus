import { t, type Dictionary } from 'intlayer';

export default {
  key: 'dashboard-summary-cards',
  content: {
    totalServers: t({ 
      en: 'Total Servers', 
      de: 'Gesamtserver', 
      fr: 'Total des serveurs', 
      es: 'Servidores totales', 
      'pt-BR': 'Total de servidores' 
    }),
    totalBackupJobs: t({ 
      en: 'Total Backup Jobs', 
      de: 'Gesamte Backup-Jobs', 
      fr: 'Total des tâches de sauvegarde', 
      es: 'Total de trabajos de respaldo', 
      'pt-BR': 'Total de trabalhos de backup' 
    }),
    totalBackupRuns: t({ 
      en: 'Total Backup Runs', 
      de: 'Gesamte Backup-Läufe', 
      fr: 'Total des exécutions de sauvegarde', 
      es: 'Total de ejecuciones de respaldo', 
      'pt-BR': 'Total de execuções de backup' 
    }),
    totalBackupSize: t({ 
      en: 'Total Backup Size', 
      de: 'Gesamte Sicherungsgröße', 
      fr: 'Taille totale des sauvegardes', 
      es: 'Tamaño total de respaldos', 
      'pt-BR': 'Tamanho total de backups' 
    }),
    totalStorageUsed: t({ 
      en: 'Total Storage Used', 
      de: 'Gesamter Speicherplatz verwendet', 
      fr: 'Stockage total utilisé', 
      es: 'Almacenamiento total usado', 
      'pt-BR': 'Armazenamento total usado' 
    }),
    totalUploadedSize: t({ 
      en: 'Total Uploaded Size', 
      de: 'Gesamte hochgeladene Größe', 
      fr: 'Taille totale téléchargée', 
      es: 'Tamaño total subido', 
      'pt-BR': 'Tamanho total enviado' 
    }),
    overdueBackups: t({ 
      en: 'Overdue Backups', 
      de: 'Überfällige Sicherungen', 
      fr: 'Sauvegardes en retard', 
      es: 'Respaldos vencidos', 
      'pt-BR': 'Backups atrasados' 
    }),
    switchToTable: t({ 
      en: 'Switch to Table', 
      de: 'Zur Tabelle wechseln', 
      fr: 'Passer au tableau', 
      es: 'Cambiar a tabla', 
      'pt-BR': 'Alternar para tabela' 
    }),
    switchToAnalytics: t({ 
      en: 'Switch to Analytics', 
      de: 'Zur Analyse wechseln', 
      fr: 'Passer à l\'analyse', 
      es: 'Cambiar a análisis', 
      'pt-BR': 'Alternar para análise' 
    }),
    tableView: t({ 
      en: 'table view', 
      de: 'Tabellenansicht', 
      fr: 'vue tableau', 
      es: 'vista de tabla', 
      'pt-BR': 'visualização de tabela' 
    }),
    analyticsView: t({ 
      en: 'analytics view', 
      de: 'Analyseansicht', 
      fr: 'vue analyse', 
      es: 'vista de análisis', 
      'pt-BR': 'visualização de análise' 
    }),
    overviewView: t({ 
      en: 'overview', 
      de: 'Übersicht', 
      fr: 'vue d\'ensemble', 
      es: 'resumen', 
      'pt-BR': 'visão geral' 
    }),
  },
} satisfies Dictionary;
