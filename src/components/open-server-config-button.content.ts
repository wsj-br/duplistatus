import { t, type Dictionary } from 'intlayer';

export default {
  key: 'open-server-config-button',
  content: {
    buttonTitle: t({
      en: 'Duplicati configuration',
      de: 'Duplicati-Konfiguration',
      fr: 'Configuration Duplicati',
      es: 'Configuración de Duplicati',
      'pt-BR': 'Configuração do Duplicati',
    }),
    popoverTitle: t({
      en: 'Open Duplicati Configuration',
      de: 'Duplicati-Konfiguration öffnen',
      fr: 'Ouvrir la configuration Duplicati',
      es: 'Abrir configuración de Duplicati',
      'pt-BR': 'Abrir configuração do Duplicati',
    }),
    description: t({
      en: 'Select a server below to manage its settings and backups',
      de: 'Wählen Sie unten einen Server aus, um dessen Einstellungen und Backups zu verwalten',
      fr: 'Sélectionnez un serveur ci-dessous pour gérer ses paramètres et sauvegardes',
      es: 'Seleccione un servidor a continuación para gestionar su configuración y copias de seguridad',
      'pt-BR': 'Selecione um servidor abaixo para gerenciar suas configurações e backups',
    }),
    // 'loading' is now available in settings.servers.loadingServerConnections
    // 'emptyState' is now available in settings.servers.noServersWithUrls
    serverTitle: t({
      en: 'Open {serverName} configuration (Right-click for old UI)',
      de: '{serverName}-Konfiguration öffnen (Rechtsklick für alte UI)',
      fr: 'Ouvrir la configuration {serverName} (Clic droit pour l\'ancienne UI)',
      es: 'Abrir configuración de {serverName} (Clic derecho para UI antigua)',
      'pt-BR': 'Abrir configuração de {serverName} (Clique direito para UI antiga)',
    }),
    configureServers: t({
      en: 'Configure server addresses',
      de: 'Serveradressen konfigurieren',
      fr: 'Configurer les adresses du serveur',
      es: 'Configurar direcciones del servidor',
      'pt-BR': 'Configurar endereços do servidor',
    }),
    // 'errorTitle' is now available in common.ui.error
    // 'errorLoadConnections' is now available in api.errors.failedToLoadServerConnections
    errorOpenUrl: t({
      en: 'Failed to open server URL',
      de: 'Fehler beim Öffnen der Server-URL',
      fr: 'Échec de l\'ouverture de l\'URL du serveur',
      es: 'Error al abrir la URL del servidor',
      'pt-BR': 'Falha ao abrir URL do servidor',
    }),
    errorOpenOldUi: t({
      en: 'Failed to open old UI',
      de: 'Fehler beim Öffnen der alten UI',
      fr: 'Échec de l\'ouverture de l\'ancienne UI',
      es: 'Error al abrir la UI antigua',
      'pt-BR': 'Falha ao abrir UI antiga',
    }),
  },
} satisfies Dictionary;
