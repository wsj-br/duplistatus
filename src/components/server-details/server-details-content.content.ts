import { t, type Dictionary } from 'intlayer';

export default {
  key: 'server-details-content',
  content: {
    detailsFor: t({ 
      en: 'Details for', 
      de: 'Details für', 
      fr: 'Détails pour', 
      es: 'Detalles para', 
      'pt-BR': 'Detalhes para' 
    }),
    detailsForBackup: t({ 
      en: 'Details for backup', 
      de: 'Details für Sicherung', 
      fr: 'Détails pour sauvegarde', 
      es: 'Detalles para respaldo', 
      'pt-BR': 'Detalhes para backup' 
    }),
    backup: t({ 
      en: 'backup', 
      de: 'Sicherung', 
      fr: 'sauvegarde', 
      es: 'respaldo', 
      'pt-BR': 'backup' 
    }),
    allBackups: t({ 
      en: 'all backups', 
      de: 'alle Sicherungen', 
      fr: 'toutes les sauvegardes', 
      es: 'todos los respaldos', 
      'pt-BR': 'todos os backups' 
    }),
    backupHistory: t({ 
      en: 'Backup History', 
      de: 'Sicherungsverlauf', 
      fr: 'Historique des sauvegardes', 
      es: 'Historial de respaldos', 
      'pt-BR': 'Histórico de backups' 
    }),
    listOfAllBackups: t({ 
      en: 'List of all {backupName} backups', 
      de: 'Liste aller {backupName} Sicherungen', 
      fr: 'Liste de toutes les sauvegardes {backupName}', 
      es: 'Lista de todos los respaldos {backupName}', 
      'pt-BR': 'Lista de todos os backups {backupName}' 
    }),
    listOfAllBackupsForServer: t({ 
      en: 'List of all backups for {serverName}', 
      de: 'Liste aller Sicherungen für {serverName}', 
      fr: 'Liste de toutes les sauvegardes pour {serverName}', 
      es: 'Lista de todos los respaldos para {serverName}', 
      'pt-BR': 'Lista de todos os backups para {serverName}' 
    }),
  },
} satisfies Dictionary;
