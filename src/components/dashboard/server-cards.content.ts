import { t, type Dictionary } from 'intlayer';

export default {
  key: 'server-cards',
  content: {
    // Server cards component-specific content
    sortOptions: {
      serverName: t({ 
        en: 'Server name (a-z)', 
        de: 'Servername (a-z)', 
        fr: 'Nom du serveur (a-z)', 
        es: 'Nombre del servidor (a-z)', 
        'pt-BR': 'Nome do servidor (a-z)' 
      }),
      status: t({ 
        en: 'Status (error>warnings>success)', 
        de: 'Status (Fehler>Warnungen>Erfolg)', 
        fr: 'Statut (erreur>avertissements>succès)', 
        es: 'Estado (error>advertencias>éxito)', 
        'pt-BR': 'Status (erro>avisos>sucesso)' 
      }),
      lastBackup: t({ 
        en: 'Last backup received (new>old)', 
        de: 'Letzte Sicherung erhalten (neu>alt)', 
        fr: 'Dernière sauvegarde reçue (nouveau>ancien)', 
        es: 'Último respaldo recibido (nuevo>antiguo)', 
        'pt-BR': 'Último backup recebido (novo>antigo)' 
      }),
    },
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
  },
} satisfies Dictionary;
