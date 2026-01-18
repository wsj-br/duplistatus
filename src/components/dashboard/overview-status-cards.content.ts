import { t, type Dictionary } from 'intlayer';

export default {
  key: 'overview-status-cards',
  content: {
    success: t({ 
      en: 'Success', 
      de: 'Erfolg', 
      fr: 'Succès', 
      es: 'Éxito', 
      'pt-BR': 'Sucesso' 
    }),
    overdueBackups: t({ 
      en: 'Overdue Backups', 
      de: 'Überfällige Sicherungen', 
      fr: 'Sauvegardes en retard', 
      es: 'Respaldos vencidos', 
      'pt-BR': 'Backups atrasados' 
    }),
    warningsAndErrors: t({ 
      en: 'Warnings & Errors', 
      de: 'Warnungen & Fehler', 
      fr: 'Avertissements & Erreurs', 
      es: 'Advertencias y Errores', 
      'pt-BR': 'Avisos e Erros' 
    }),
  },
} satisfies Dictionary;
