import { t, type Dictionary } from 'intlayer';

export default {
  key: 'ntfy-messages-button',
  content: {
    buttonTitle: t({
      en: 'View NTFY messages (right-click for QR code)',
      de: 'NTFY-Nachrichten anzeigen (Rechtsklick für QR-Code)',
      fr: 'Voir les messages NTFY (clic droit pour le code QR)',
      es: 'Ver mensajes NTFY (clic derecho para código QR)',
      'pt-BR': 'Ver mensagens NTFY (clique direito para código QR)',
    }),
    qrGenerationFailedTitle: t({
      en: 'QR Code Generation Failed',
      de: 'QR-Code-Generierung fehlgeschlagen',
      fr: 'Échec de la génération du code QR',
      es: 'Error al generar código QR',
      'pt-BR': 'Falha na geração do código QR',
    }),
    qrGenerationFailedDescription: t({
      en: 'Failed to generate QR code. Please try again.',
      de: 'QR-Code konnte nicht generiert werden. Bitte versuchen Sie es erneut.',
      fr: 'Échec de la génération du code QR. Veuillez réessayer.',
      es: 'Error al generar código QR. Por favor, inténtelo de nuevo.',
      'pt-BR': 'Falha ao gerar código QR. Por favor, tente novamente.',
    }),
    // 'errorTitle' is now available in common.ui.error
    topicNotConfigured: t({
      en: 'NTFY topic not configured',
      de: 'NTFY-Thema nicht konfiguriert',
      fr: 'Sujet NTFY non configuré',
      es: 'Tema NTFY no configurado',
      'pt-BR': 'Tópico NTFY não configurado',
    }),
    failedToLoadConfig: t({
      en: 'Failed to load NTFY configuration',
      de: 'Fehler beim Laden der NTFY-Konfiguration',
      fr: 'Échec du chargement de la configuration NTFY',
      es: 'Error al cargar la configuración NTFY',
      'pt-BR': 'Falha ao carregar configuração NTFY',
    }),
  },
} satisfies Dictionary;
