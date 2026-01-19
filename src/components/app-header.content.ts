import { t, type Dictionary } from 'intlayer';

export default {
  key: 'app-header',
  content: {
    returnToDashboard: t({ 
      en: 'Return to Dashboard', 
      de: 'Zurück zum Dashboard', 
      fr: 'Retour au tableau de bord', 
      es: 'Volver al Dashboard', 
      'pt-BR': 'Voltar ao Painel' 
    }),
  },
} satisfies Dictionary;
