import { t, type Dictionary } from 'intlayer';

export default {
  key: 'change-password-modal',
  content: {
    title: t({
      en: 'Change Password',
      de: 'Passwort ändern',
      fr: 'Changer le mot de passe',
      es: 'Cambiar contraseña',
      'pt-BR': 'Alterar senha',
    }),
    descriptionRequired: t({
      en: 'You must change your password before continuing. Please set a new password that meets the requirements below.',
      de: 'Sie müssen Ihr Passwort ändern, bevor Sie fortfahren können. Bitte legen Sie ein neues Passwort fest, das die folgenden Anforderungen erfüllt.',
      fr: 'Vous devez changer votre mot de passe avant de continuer. Veuillez définir un nouveau mot de passe qui répond aux exigences ci-dessous.',
      es: 'Debe cambiar su contraseña antes de continuar. Por favor, establezca una nueva contraseña que cumpla con los requisitos a continuación.',
      'pt-BR': 'Você deve alterar sua senha antes de continuar. Por favor, defina uma nova senha que atenda aos requisitos abaixo.',
    }),
    descriptionOptional: t({
      en: 'Set a new password for your account. Make sure it meets all the requirements below.',
      de: 'Legen Sie ein neues Passwort für Ihr Konto fest. Stellen Sie sicher, dass es alle folgenden Anforderungen erfüllt.',
      fr: 'Définissez un nouveau mot de passe pour votre compte. Assurez-vous qu\'il répond à toutes les exigences ci-dessous.',
      es: 'Establezca una nueva contraseña para su cuenta. Asegúrese de que cumpla con todos los requisitos a continuación.',
      'pt-BR': 'Defina uma nova senha para sua conta. Certifique-se de que ela atenda a todos os requisitos abaixo.',
    }),
    newPasswordLabel: t({
      en: 'New Password',
      de: 'Neues Passwort',
      fr: 'Nouveau mot de passe',
      es: 'Nueva contraseña',
      'pt-BR': 'Nova senha',
    }),
    confirmPasswordLabel: t({
      en: 'Confirm New Password',
      de: 'Neues Passwort bestätigen',
      fr: 'Confirmer le nouveau mot de passe',
      es: 'Confirmar nueva contraseña',
      'pt-BR': 'Confirmar nova senha',
    }),
    newPasswordPlaceholder: t({
      en: 'Enter new password',
      de: 'Neues Passwort eingeben',
      fr: 'Entrez le nouveau mot de passe',
      es: 'Ingrese la nueva contraseña',
      'pt-BR': 'Digite a nova senha',
    }),
    confirmPasswordPlaceholder: t({
      en: 'Confirm new password',
      de: 'Neues Passwort bestätigen',
      fr: 'Confirmez le nouveau mot de passe',
      es: 'Confirme la nueva contraseña',
      'pt-BR': 'Confirme a nova senha',
    }),
    requirementsTitle: t({
      en: 'Password Requirements:',
      de: 'Passwortanforderungen:',
      fr: 'Exigences du mot de passe:',
      es: 'Requisitos de contraseña:',
      'pt-BR': 'Requisitos de senha:',
    }),
    requirementMinLength: t({
      en: 'At least {minLength} characters long',
      de: 'Mindestens {minLength} Zeichen lang',
      fr: 'Au moins {minLength} caractères',
      es: 'Al menos {minLength} caracteres',
      'pt-BR': 'Pelo menos {minLength} caracteres',
    }),
    requirementUppercase: t({
      en: 'Contains at least one uppercase letter (A-Z)',
      de: 'Enthält mindestens einen Großbuchstaben (A-Z)',
      fr: 'Contient au moins une lettre majuscule (A-Z)',
      es: 'Contiene al menos una letra mayúscula (A-Z)',
      'pt-BR': 'Contém pelo menos uma letra maiúscula (A-Z)',
    }),
    requirementLowercase: t({
      en: 'Contains at least one lowercase letter (a-z)',
      de: 'Enthält mindestens einen Kleinbuchstaben (a-z)',
      fr: 'Contient au moins une lettre minuscule (a-z)',
      es: 'Contiene al menos una letra minúscula (a-z)',
      'pt-BR': 'Contém pelo menos uma letra minúscula (a-z)',
    }),
    requirementNumber: t({
      en: 'Contains at least one number (0-9)',
      de: 'Enthält mindestens eine Zahl (0-9)',
      fr: 'Contient au moins un chiffre (0-9)',
      es: 'Contiene al menos un número (0-9)',
      'pt-BR': 'Contém pelo menos um número (0-9)',
    }),
    requirementMatch: t({
      en: 'Passwords match',
      de: 'Passwörter stimmen überein',
      fr: 'Les mots de passe correspondent',
      es: 'Las contraseñas coinciden',
      'pt-BR': 'As senhas coincidem',
    }),
    errorRequirements: t({
      en: 'Please ensure all password requirements are met',
      de: 'Bitte stellen Sie sicher, dass alle Passwortanforderungen erfüllt sind',
      fr: 'Veuillez vous assurer que toutes les exigences du mot de passe sont respectées',
      es: 'Por favor, asegúrese de que se cumplan todos los requisitos de contraseña',
      'pt-BR': 'Por favor, certifique-se de que todos os requisitos de senha sejam atendidos',
    }),
    // 'errorDefault' should use auth.changePassword.changeFailed
    errorUnexpected: t({
      en: 'An unexpected error occurred',
      de: 'Ein unerwarteter Fehler ist aufgetreten',
      fr: 'Une erreur inattendue s\'est produite',
      es: 'Ocurrió un error inesperado',
      'pt-BR': 'Ocorreu um erro inesperado',
    }),
    // 'successMessage' should use auth.changePassword.changeSuccess
    // 'buttonCancel' is now available in common.ui.cancel
    buttonChanging: t({
      en: 'Changing...',
      de: 'Wird geändert...',
      fr: 'Modification...',
      es: 'Cambiando...',
      'pt-BR': 'Alterando...',
    }),
    // 'buttonSuccess' is now available in common.ui.success
    buttonChangePassword: t({
      en: 'Change Password',
      de: 'Passwort ändern',
      fr: 'Changer le mot de passe',
      es: 'Cambiar contraseña',
      'pt-BR': 'Alterar senha',
    }),
  },
} satisfies Dictionary;
