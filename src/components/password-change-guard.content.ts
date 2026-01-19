import { t, type Dictionary } from 'intlayer';

export default {
  key: 'password-change-guard',
  content: {
    // 'Loading...' is now available in common.ui.loading
    changePasswordMessage: t({
      en: 'Please change your password to continue',
      de: 'Bitte ändern Sie Ihr Passwort, um fortzufahren',
      fr: 'Veuillez changer votre mot de passe pour continuer',
      es: 'Por favor, cambie su contraseña para continuar',
      'pt-BR': 'Por favor, altere sua senha para continuar',
    }),
  },
} satisfies Dictionary;
