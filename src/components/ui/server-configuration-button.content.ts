import { t, type Dictionary } from 'intlayer';

export default {
  key: 'server-configuration-button',
  content: {
    buttonText: t({
      en: 'Duplicati configuration',
      de: 'Duplicati-Konfiguration',
      fr: 'Configuration Duplicati',
      es: 'Configuración de Duplicati',
      'pt-BR': 'Configuração do Duplicati',
    }),
    titleNoUrl: t({
      en: 'No URL configured',
      de: 'Keine URL konfiguriert',
      fr: 'Aucune URL configurée',
      es: 'No hay URL configurada',
      'pt-BR': 'Nenhuma URL configurada',
    }),
    titleWithAlias: t({
      en: 'Open {serverAlias}({serverName}) configuration (Right-click for old UI)',
      de: '{serverAlias}({serverName})-Konfiguration öffnen (Rechtsklick für alte UI)',
      fr: 'Ouvrir la configuration {serverAlias}({serverName}) (Clic droit pour l\'ancienne UI)',
      es: 'Abrir configuración de {serverAlias}({serverName}) (Clic derecho para UI antigua)',
      'pt-BR': 'Abrir configuração de {serverAlias}({serverName}) (Clique direito para UI antiga)',
    }),
    titleWithName: t({
      en: 'Open {serverName} configuration (Right-click for old UI)',
      de: '{serverName}-Konfiguration öffnen (Rechtsklick für alte UI)',
      fr: 'Ouvrir la configuration {serverName} (Clic droit pour l\'ancienne UI)',
      es: 'Abrir configuración de {serverName} (Clic derecho para UI antigua)',
      'pt-BR': 'Abrir configuração de {serverName} (Clique direito para UI antiga)',
    }),
    titleDefault: t({
      en: 'Open Duplicati configuration (Right-click for old UI)',
      de: 'Duplicati-Konfiguration öffnen (Rechtsklick für alte UI)',
      fr: 'Ouvrir la configuration Duplicati (Clic droit pour l\'ancienne UI)',
      es: 'Abrir configuración de Duplicati (Clic derecho para UI antigua)',
      'pt-BR': 'Abrir configuração do Duplicati (Clique direito para UI antiga)',
    }),
  },
} satisfies Dictionary;
