import { t, type Dictionary } from 'intlayer';

export default {
  key: 'status-badge',
  content: {
    success: t({ 
      en: 'Success', 
      de: 'Erfolg', 
      fr: 'Succès', 
      es: 'Éxito', 
      'pt-BR': 'Sucesso' 
    }),
    unknown: t({ 
      en: 'Unknown', 
      de: 'Unbekannt', 
      fr: 'Inconnu', 
      es: 'Desconocido', 
      'pt-BR': 'Desconhecido' 
    }),
    warning: t({ 
      en: 'Warning', 
      de: 'Warnung', 
      fr: 'Avertissement', 
      es: 'Advertencia', 
      'pt-BR': 'Aviso' 
    }),
    error: t({ 
      en: 'Error', 
      de: 'Fehler', 
      fr: 'Erreur', 
      es: 'Error', 
      'pt-BR': 'Erro' 
    }),
    fatal: t({ 
      en: 'Fatal', 
      de: 'Kritisch', 
      fr: 'Fatal', 
      es: 'Fatal', 
      'pt-BR': 'Fatal' 
    }),
    na: t({ 
      en: 'N/A', 
      de: 'N/V', 
      fr: 'N/A', 
      es: 'N/A', 
      'pt-BR': 'N/A' 
    }),
    failed: t({ 
      en: 'Failed', 
      de: 'Fehlgeschlagen', 
      fr: 'Échoué', 
      es: 'Fallido', 
      'pt-BR': 'Falha' 
    }),
  },
} satisfies Dictionary;
