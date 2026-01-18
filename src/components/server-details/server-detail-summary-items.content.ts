import { t, type Dictionary } from 'intlayer';

export default {
  key: 'server-detail-summary-items',
  content: {
    statistics: t({ 
      en: 'Statistics', 
      de: 'Statistiken', 
      fr: 'Statistiques', 
      es: 'Estadísticas', 
      'pt-BR': 'Estatísticas' 
    }),
    machineStatistics: t({ 
      en: 'Machine Statistics', 
      de: 'Maschinenstatistiken', 
      fr: 'Statistiques de la machine', 
      es: 'Estadísticas de la máquina', 
      'pt-BR': 'Estatísticas da máquina' 
    }),
    backupStatistics: t({ 
      en: 'Statistics', 
      de: 'Statistiken', 
      fr: 'Statistiques', 
      es: 'Estadísticas', 
      'pt-BR': 'Estatísticas' 
    }),
    totalBackupRuns: t({ 
      en: 'Total Backup Runs', 
      de: 'Gesamte Backup-Läufe', 
      fr: 'Total des exécutions de sauvegarde', 
      es: 'Total de ejecuciones de respaldo', 
      'pt-BR': 'Total de execuções de backup' 
    }),
    averageDuration: t({ 
      en: 'Average Duration', 
      de: 'Durchschnittliche Dauer', 
      fr: 'Durée moyenne', 
      es: 'Duración promedio', 
      'pt-BR': 'Duração média' 
    }),
    totalUploadedSize: t({ 
      en: 'Total Uploaded Size', 
      de: 'Gesamte hochgeladene Größe', 
      fr: 'Taille totale téléchargée', 
      es: 'Tamaño total subido', 
      'pt-BR': 'Tamanho total enviado' 
    }),
    lastBackupStorageSize: t({ 
      en: 'Last Backup Storage Size', 
      de: 'Speichergröße der letzten Sicherung', 
      fr: 'Taille de stockage de la dernière sauvegarde', 
      es: 'Tamaño de almacenamiento del último respaldo', 
      'pt-BR': 'Tamanho de armazenamento do último backup' 
    }),
    lastBackupListCount: t({ 
      en: 'Last Backup List Count', 
      de: 'Anzahl der letzten Sicherungsliste', 
      fr: 'Nombre d\'éléments de la dernière sauvegarde', 
      es: 'Cantidad de elementos del último respaldo', 
      'pt-BR': 'Contagem da lista do último backup' 
    }),
    lastBackupFileSize: t({ 
      en: 'Last Backup File Size', 
      de: 'Dateigröße der letzten Sicherung', 
      fr: 'Taille de fichier de la dernière sauvegarde', 
      es: 'Tamaño de archivo del último respaldo', 
      'pt-BR': 'Tamanho do arquivo do último backup' 
    }),
    overdueBackups: t({ 
      en: 'Overdue Backups', 
      de: 'Überfällige Sicherungen', 
      fr: 'Sauvegardes en retard', 
      es: 'Respaldos vencidos', 
      'pt-BR': 'Backups atrasados' 
    }),
    configureMonitoring: t({ 
      en: 'Configure Monitoring', 
      de: 'Überwachung konfigurieren', 
      fr: 'Configurer la surveillance', 
      es: 'Configurar monitoreo', 
      'pt-BR': 'Configurar monitoramento' 
    }),
    detailsFor: t({ 
      en: 'Details for', 
      de: 'Details für', 
      fr: 'Détails pour', 
      es: 'Detalles para', 
      'pt-BR': 'Detalhes para' 
    }),
    allBackups: t({ 
      en: 'all backups', 
      de: 'alle Sicherungen', 
      fr: 'toutes les sauvegardes', 
      es: 'todos los respaldos', 
      'pt-BR': 'todos os backups' 
    }),
    totalBackupJobs: t({ 
      en: 'Total Backup Jobs', 
      de: 'Gesamte Backup-Aufträge', 
      fr: 'Total des travaux de sauvegarde', 
      es: 'Total de trabajos de respaldo', 
      'pt-BR': 'Total de trabalhos de backup' 
    }),
    availableVersions: t({ 
      en: 'Available Versions', 
      de: 'Verfügbare Versionen', 
      fr: 'Versions disponibles', 
      es: 'Versiones disponibles', 
      'pt-BR': 'Versões disponíveis' 
    }),
    avgDuration: t({ 
      en: 'Avg. Duration', 
      de: 'Durchschn. Dauer', 
      fr: 'Durée moy.', 
      es: 'Duración prom.', 
      'pt-BR': 'Duração méd.' 
    }),
    lastBackupSize: t({ 
      en: 'Last Backup Size', 
      de: 'Größe der letzten Sicherung', 
      fr: 'Taille de la dernière sauvegarde', 
      es: 'Tamaño del último respaldo', 
      'pt-BR': 'Tamanho do último backup' 
    }),
    totalStorageUsed: t({ 
      en: 'Total Storage Used', 
      de: 'Gesamter Speicherplatz verwendet', 
      fr: 'Espace de stockage total utilisé', 
      es: 'Almacenamiento total usado', 
      'pt-BR': 'Armazenamento total usado' 
    }),
    totalUploaded: t({ 
      en: 'Total Uploaded', 
      de: 'Gesamt hochgeladen', 
      fr: 'Total téléchargé', 
      es: 'Total subido', 
      'pt-BR': 'Total enviado' 
    }),
    overdueScheduledBackups: t({ 
      en: 'Overdue scheduled backups:', 
      de: 'Überfällige geplante Sicherungen:', 
      fr: 'Sauvegardes planifiées en retard:', 
      es: 'Respaldos programados vencidos:', 
      'pt-BR': 'Backups agendados atrasados:' 
    }),
    lastChecked: t({ 
      en: 'Last checked:', 
      de: 'Zuletzt geprüft:', 
      fr: 'Dernière vérification:', 
      es: 'Última verificación:', 
      'pt-BR': 'Última verificação:' 
    }),
    configure: t({ 
      en: 'Configure', 
      de: 'Konfigurieren', 
      fr: 'Configurer', 
      es: 'Configurar', 
      'pt-BR': 'Configurar' 
    }),
    scheduledBackupIsOverdue: t({ 
      en: 'Scheduled backup is overdue. Expected backup date: {date} ({elapsed} overdue).', 
      de: 'Geplante Sicherung ist überfällig. Erwartetes Sicherungsdatum: {date} ({elapsed} überfällig).', 
      fr: 'La sauvegarde planifiée est en retard. Date de sauvegarde attendue: {date} ({elapsed} en retard).', 
      es: 'El respaldo programado está vencido. Fecha de respaldo esperada: {date} ({elapsed} vencido).', 
      'pt-BR': 'Backup agendado está atrasado. Data de backup esperada: {date} ({elapsed} atrasado).' 
    }),
  },
} satisfies Dictionary;
