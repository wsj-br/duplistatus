import { t, type Dictionary } from 'intlayer';

export default {
  key: 'server-backup-table',
  content: {
    // Table headers and labels
    backupName: t({ 
      en: 'Backup Name', 
      de: 'Sicherungsname', 
      fr: 'Nom de sauvegarde', 
      es: 'Nombre de respaldo', 
      'pt-BR': 'Nome do backup' 
    }),
    date: t({ 
      en: 'Date', 
      de: 'Datum', 
      fr: 'Date', 
      es: 'Fecha', 
      'pt-BR': 'Data' 
    }),
    status: t({ 
      en: 'Status', 
      de: 'Status', 
      fr: 'Statut', 
      es: 'Estado', 
      'pt-BR': 'Status' 
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
    uploadedSize: t({ 
      en: 'Uploaded Size', 
      de: 'Hochgeladene Größe', 
      fr: 'Taille téléchargée', 
      es: 'Tamaño subido', 
      'pt-BR': 'Tamanho enviado' 
    }),
    duration: t({ 
      en: 'Duration', 
      de: 'Dauer', 
      fr: 'Durée', 
      es: 'Duración', 
      'pt-BR': 'Duração' 
    }),
    filterByBackup: t({ 
      en: 'Filter by Backup', 
      de: 'Nach Sicherung filtern', 
      fr: 'Filtrer par sauvegarde', 
      es: 'Filtrar por respaldo', 
      'pt-BR': 'Filtrar por backup' 
    }),
    allBackups: t({ 
      en: 'All Backups', 
      de: 'Alle Sicherungen', 
      fr: 'Toutes les sauvegardes', 
      es: 'Todos los respaldos', 
      'pt-BR': 'Todos os backups' 
    }),
    noBackupsFound: t({ 
      en: 'No backups found', 
      de: 'Keine Sicherungen gefunden', 
      fr: 'Aucune sauvegarde trouvée', 
      es: 'No se encontraron respaldos', 
      'pt-BR': 'Nenhum backup encontrado' 
    }),
    // Additional table headers
    availableVersions: t({ 
      en: 'Available Versions', 
      de: 'Verfügbare Versionen', 
      fr: 'Versions disponibles', 
      es: 'Versiones disponibles', 
      'pt-BR': 'Versões disponíveis' 
    }),
    fileCount: t({ 
      en: 'File Count', 
      de: 'Dateianzahl', 
      fr: 'Nombre de fichiers', 
      es: 'Cantidad de archivos', 
      'pt-BR': 'Contagem de arquivos' 
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
    // Select placeholder
    selectBackup: t({ 
      en: 'Select backup', 
      de: 'Sicherung auswählen', 
      fr: 'Sélectionner la sauvegarde', 
      es: 'Seleccionar respaldo', 
      'pt-BR': 'Selecionar backup' 
    }),
    // Empty states
    noBackupsFoundForThisServer: t({ 
      en: 'No backups found for this server.', 
      de: 'Keine Sicherungen für diesen Server gefunden.', 
      fr: 'Aucune sauvegarde trouvée pour ce serveur.', 
      es: 'No se encontraron respaldos para este servidor.', 
      'pt-BR': 'Nenhum backup encontrado para este servidor.' 
    }),
    noBackupsFoundForThisMachine: t({ 
      en: 'No backups found for this machine.', 
      de: 'Keine Sicherungen für diese Maschine gefunden.', 
      fr: 'Aucune sauvegarde trouvée pour cette machine.', 
      es: 'No se encontraron respaldos para esta máquina.', 
      'pt-BR': 'Nenhum backup encontrado para esta máquina.' 
    }),
    // Tooltip
    noMessagesReceivedForThisBackup: t({ 
      en: 'No messages were received for this backup.', 
      de: 'Für diese Sicherung wurden keine Nachrichten empfangen.', 
      fr: 'Aucun message n\'a été reçu pour cette sauvegarde.', 
      es: 'No se recibieron mensajes para este respaldo.', 
      'pt-BR': 'Nenhuma mensagem foi recebida para este backup.' 
    }),
    // Mobile view labels
    viewDetails: t({ 
      en: 'View Details', 
      de: 'Details anzeigen', 
      fr: 'Voir les détails', 
      es: 'Ver detalles', 
      'pt-BR': 'Ver detalhes' 
    }),
    // Pagination
    previous: t({ 
      en: 'Previous', 
      de: 'Vorherige', 
      fr: 'Précédent', 
      es: 'Anterior', 
      'pt-BR': 'Anterior' 
    }),
    next: t({ 
      en: 'Next', 
      de: 'Nächste', 
      fr: 'Suivant', 
      es: 'Siguiente', 
      'pt-BR': 'Próximo' 
    }),
    page: t({ 
      en: 'Page', 
      de: 'Seite', 
      fr: 'Page', 
      es: 'Página', 
      'pt-BR': 'Página' 
    }),
    of: t({ 
      en: 'of', 
      de: 'von', 
      fr: 'de', 
      es: 'de', 
      'pt-BR': 'de' 
    }),
  },
} satisfies Dictionary;
