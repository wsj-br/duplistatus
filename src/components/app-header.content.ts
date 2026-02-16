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
    changePassword: t({ 
      en: 'Change Password', 
      de: 'Passwort ändern', 
      fr: 'Changer le mot de passe', 
      es: 'Cambiar contraseña', 
      'pt-BR': 'Alterar senha' 
    }),
    users: t({ 
      en: 'Users', 
      de: 'Benutzer', 
      fr: 'Utilisateurs', 
      es: 'Usuarios', 
      'pt-BR': 'Usuários' 
    }),
    auditLog: t({ 
      en: 'Audit Log', 
      de: 'Audit-Log', 
      fr: 'Journal d\'Audit', 
      es: 'Log de Auditoría', 
      'pt-BR': 'Log de Auditoria' 
    }),
    admin: t({ 
      en: 'Admin', 
      de: 'Admin', 
      fr: 'Admin', 
      es: 'Admin', 
      'pt-BR': 'Admin' 
    }),
    language: t({ 
      en: 'Language', 
      de: 'Sprache', 
      fr: 'Langue', 
      es: 'Idioma', 
      'pt-BR': 'Idioma' 
    }),
  },
} satisfies Dictionary;
