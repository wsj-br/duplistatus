import { t, type Dictionary } from 'intlayer';

export default {
  key: 'backup-tooltip-content',
  content: {
    lastBackupDetails: t({ 
      en: 'Last Backup Details', 
      de: 'Details der letzten Sicherung', 
      fr: 'Détails de la dernière sauvegarde', 
      es: 'Detalles del último backup', 
      'pt-BR': 'Detalhes do último backup' 
    }),
    date: t({ 
      en: 'Date:', 
      de: 'Datum:', 
      fr: 'Date:', 
      es: 'Fecha:', 
      'pt-BR': 'Data:' 
    }),
    status: t({ 
      en: 'Status:', 
      de: 'Status:', 
      fr: 'Statut:', 
      es: 'Estado:', 
      'pt-BR': 'Status:' 
    }),
    duration: t({ 
      en: 'Duration:', 
      de: 'Dauer:', 
      fr: 'Durée:', 
      es: 'Duración:', 
      'pt-BR': 'Duração:' 
    }),
    files: t({ 
      en: 'Files:', 
      de: 'Dateien:', 
      fr: 'Fichiers:', 
      es: 'Archivos:', 
      'pt-BR': 'Arquivos:' 
    }),
    size: t({ 
      en: 'Size:', 
      de: 'Größe:', 
      fr: 'Taille:', 
      es: 'Tamaño:', 
      'pt-BR': 'Tamanho:' 
    }),
    storageSize: t({ 
      en: 'Storage Size:', 
      de: 'Speichergröße:', 
      fr: 'Taille de stockage:', 
      es: 'Tamaño de almacenamiento:', 
      'pt-BR': 'Tamanho de armazenamento:' 
    }),
    storage: t({ 
      en: 'Storage:', 
      de: 'Speicherplatz:', 
      fr: 'Stockage:', 
      es: 'Almacenamiento:', 
      'pt-BR': 'Armazenamento:' 
    }),
    uploadedSize: t({ 
      en: 'Uploaded Size:', 
      de: 'Hochgeladene Größe:', 
      fr: 'Taille téléversée:', 
      es: 'Tamaño enviado:', 
      'pt-BR': 'Tamanho enviado:' 
    }),
    uploaded: t({ 
      en: 'Uploaded:', 
      de: 'Hochgeladen:', 
      fr: 'Téléversé:', 
      es: 'Enviado:', 
      'pt-BR': 'Enviado:' 
    }),
    versions: t({ 
      en: 'Versions:', 
      de: 'Versionen:', 
      fr: 'Versions:', 
      es: 'Versiones:', 
      'pt-BR': 'Versões:' 
    }),
    backupOverdue: t({ 
      en: 'Backup Overdue', 
      de: 'Sicherung überfällig', 
      fr: 'Sauvegarde en retard', 
      es: 'Backup retrasado', 
      'pt-BR': 'Backup atrasado' 
    }),
    expected: t({ 
      en: 'Expected:', 
      de: 'Erwartet:', 
      fr: 'Attendu:', 
      es: 'Esperado:', 
      'pt-BR': 'Esperado:' 
    }),
    overdueConfiguration: t({ 
      en: 'Overdue configuration', 
      de: 'Überfälligkeitskonfiguration', 
      fr: 'Configuration des retards', 
      es: 'Configuración de vencimientos', 
      'pt-BR': 'Configuração de atrasos' 
    }),
  },
} satisfies Dictionary;
