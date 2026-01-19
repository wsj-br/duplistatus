import { t, type Dictionary } from 'intlayer';

export default {
  key: 'global-refresh-controls',
  content: {
    autoRefreshDisabled: t({ 
      en: 'Auto-refresh (disabled)', 
      de: 'Automatische Aktualisierung (deaktiviert)', 
      fr: 'Actualisation automatique (désactivée)', 
      es: 'Actualización automática (desactivada)', 
      'pt-BR': 'Atualização automática (desativada)' 
    }),
    autoRefreshLoading: t({ 
      en: 'Auto-refresh (loading)', 
      de: 'Automatische Aktualisierung (Lädt...)', 
      fr: 'Actualisation automatique (chargement)', 
      es: 'Actualización automática (cargando)', 
      'pt-BR': 'Atualização automática (carregando)' 
    }),
    autoRefreshEnabled: t({ 
      en: 'Auto-refresh ({interval})', 
      de: 'Automatische Aktualisierung ({interval})', 
      fr: 'Actualisation automatique ({interval})', 
      es: 'Actualización automática ({interval})', 
      'pt-BR': 'Atualização automática ({interval})' 
    }),
    seconds: t({ 
      en: 'sec', 
      de: 'Sek', 
      fr: 'sec', 
      es: 'seg', 
      'pt-BR': 'seg' 
    }),
    minutes: t({ 
      en: 'min', 
      de: 'Min', 
      fr: 'min', 
      es: 'min', 
      'pt-BR': 'min' 
    }),
    disableTooltip: t({ 
      en: 'Disable auto-refresh (Right-click for Display Settings)', 
      de: 'Automatische Aktualisierung deaktivieren (Rechtsklick für Anzeigeeinstellungen)', 
      fr: 'Désactiver l\'actualisation automatique (Clic droit pour les paramètres d\'affichage)', 
      es: 'Desactivar actualización automática (Clic derecho para Configuración de visualización)', 
      'pt-BR': 'Desativar atualização automática (Clique com o botão direito para Configurações de exibição)' 
    }),
    enableTooltip: t({ 
      en: 'Enable auto-refresh (Right-click for Display Settings)', 
      de: 'Automatische Aktualisierung aktivieren (Rechtsklick für Anzeigeeinstellungen)', 
      fr: 'Activer l\'actualisation automatique (Clic droit pour les paramètres d\'affichage)', 
      es: 'Activar actualización automática (Clic derecho para Configuración de visualización)', 
      'pt-BR': 'Ativar atualização automática (Clique com o botão direito para Configurações de exibição)' 
    }),
    refreshNow: t({ 
      en: 'Refresh now', 
      de: 'Jetzt aktualisieren', 
      fr: 'Actualiser maintenant', 
      es: 'Actualizar ahora', 
      'pt-BR': 'Atualizar agora' 
    }),
    refreshFailed: t({ 
      en: 'Refresh Failed', 
      de: 'Aktualisierung fehlgeschlagen', 
      fr: 'Échec de l\'actualisation', 
      es: 'Error de actualización', 
      'pt-BR': 'Falha na atualização' 
    }),
    refreshFailedDescription: t({ 
      en: 'Failed to refresh data. Please try again.', 
      de: 'Daten konnten nicht aktualisiert werden. Bitte versuchen Sie es erneut.', 
      fr: 'Échec de l\'actualisation des données. Veuillez réessayer.', 
      es: 'Error al actualizar los datos. Por favor, inténtelo de nuevo.', 
      'pt-BR': 'Falha ao atualizar os dados. Por favor, tente novamente.' 
    }),
  },
} satisfies Dictionary;
