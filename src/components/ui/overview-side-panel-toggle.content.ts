import { t, type Dictionary } from 'intlayer';

export default {
  key: 'overview-side-panel-toggle',
  content: {
    switchToChart: t({
      en: 'Switch to chart view',
      de: 'Zur Diagrammansicht wechseln',
      fr: 'Passer à la vue graphique',
      es: 'Cambiar a vista de gráfico',
      'pt-BR': 'Mudar para visualização de gráfico',
    }),
    switchToStatus: t({
      en: 'Switch to status view',
      de: 'Zur Statusansicht wechseln',
      fr: 'Passer à la vue statut',
      es: 'Cambiar a vista de estado',
      'pt-BR': 'Mudar para visualização de status',
    }),
  },
} satisfies Dictionary;
