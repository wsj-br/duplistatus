import { t, type Dictionary } from 'intlayer';

export default {
  key: 'available-backups-modal',
  content: {
    title: t({ 
      en: 'Available Backup Versions', 
      de: 'Verfügbare Sicherungsversionen', 
      fr: 'Versions de sauvegarde disponibles', 
      es: 'Versiones de respaldo disponibles', 
      'pt-BR': 'Versões de backup disponíveis' 
    }),
    version: t({ 
      en: 'Version', 
      de: 'Version', 
      fr: 'Version', 
      es: 'Versión', 
      'pt-BR': 'Versão' 
    }),
    date: t({ 
      en: 'Date', 
      de: 'Datum', 
      fr: 'Date', 
      es: 'Fecha', 
      'pt-BR': 'Data' 
    }),
    clickToView: t({ 
      en: 'Click to view available versions', 
      de: 'Klicken Sie, um verfügbare Versionen anzuzeigen', 
      fr: 'Cliquez pour voir les versions disponibles', 
      es: 'Haga clic para ver versiones disponibles', 
      'pt-BR': 'Clique para ver versões disponíveis' 
    }),
    versionInfoNotReceived: t({ 
      en: 'Version info not received', 
      de: 'Versionsinformationen nicht erhalten', 
      fr: 'Informations de version non reçues', 
      es: 'Información de versión no recibida', 
      'pt-BR': 'Informações de versão não recebidas' 
    }),
    created: t({ 
      en: 'Created', 
      de: 'Erstellt', 
      fr: 'Créé', 
      es: 'Creado', 
      'pt-BR': 'Criado' 
    }),
    age: t({ 
      en: 'Age', 
      de: 'Alter', 
      fr: 'Âge', 
      es: 'Antigüedad', 
      'pt-BR': 'Idade' 
    }),
  },
} satisfies Dictionary;
