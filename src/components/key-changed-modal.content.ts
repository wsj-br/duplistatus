import { t, type Dictionary } from 'intlayer';

export default {
  key: 'key-changed-modal',
  content: {
    title: t({
      en: 'Master Key File Changed',
      de: 'Master-Schlüsseldatei geändert',
      fr: 'Fichier de clé principale modifié',
      es: 'Archivo de clave maestra cambiado',
      'pt-BR': 'Arquivo de chave mestra alterado',
    }),
    description: t({
      en: 'The encryption key file (.duplistatus.key) has been changed or replaced.',
      de: 'Die Verschlüsselungsschlüsseldatei (.duplistatus.key) wurde geändert oder ersetzt.',
      fr: 'Le fichier de clé de chiffrement (.duplistatus.key) a été modifié ou remplacé.',
      es: 'El archivo de clave de cifrado (.duplistatus.key) ha sido cambiado o reemplazado.',
      'pt-BR': 'O arquivo de chave de criptografia (.duplistatus.key) foi alterado ou substituído.',
    }),
    warningTitle: t({
      en: 'All encrypted passwords have been cleared for security reasons.',
      de: 'Alle verschlüsselten Passwörter wurden aus Sicherheitsgründen gelöscht.',
      fr: 'Tous les mots de passe chiffrés ont été effacés pour des raisons de sécurité.',
      es: 'Todas las contraseñas cifradas han sido eliminadas por razones de seguridad.',
      'pt-BR': 'Todas as senhas criptografadas foram apagadas por razões de segurança.',
    }),
    reconfigurePrompt: t({
      en: 'You will need to reconfigure the following:',
      de: 'Sie müssen Folgendes neu konfigurieren:',
      fr: 'Vous devrez reconfigurer les éléments suivants:',
      es: 'Deberá reconfigurar lo siguiente:',
      'pt-BR': 'Você precisará reconfigurar o seguinte:',
    }),
    smtpPasswords: t({
      en: 'SMTP email passwords (in Email Settings)',
      de: 'SMTP-E-Mail-Passwörter (in E-Mail-Einstellungen)',
      fr: 'Mots de passe SMTP (dans les paramètres de messagerie)',
      es: 'Contraseñas de correo SMTP (en Configuración de correo)',
      'pt-BR': 'Senhas de e-mail SMTP (em Configurações de e-mail)',
    }),
    serverPasswords: t({
      en: 'Duplicati server passwords (in Server Settings)',
      de: 'Duplicati-Server-Passwörter (in Server-Einstellungen)',
      fr: 'Mots de passe du serveur Duplicati (dans les paramètres du serveur)',
      es: 'Contraseñas del servidor Duplicati (en Configuración del servidor)',
      'pt-BR': 'Senhas do servidor Duplicati (em Configurações do servidor)',
    }),
    explanation: t({
      en: 'This typically happens when restoring from a backup or migrating to a new system. The old encrypted passwords cannot be decrypted with the new key, so they have been cleared to prevent errors.',
      de: 'Dies geschieht typischerweise beim Wiederherstellen aus einem Backup oder bei der Migration zu einem neuen System. Die alten verschlüsselten Passwörter können mit dem neuen Schlüssel nicht entschlüsselt werden und wurden daher gelöscht, um Fehler zu vermeiden.',
      fr: 'Cela se produit généralement lors de la restauration à partir d\'une sauvegarde ou de la migration vers un nouveau système. Les anciens mots de passe chiffrés ne peuvent pas être déchiffrés avec la nouvelle clé, ils ont donc été effacés pour éviter les erreurs.',
      es: 'Esto suele ocurrir al restaurar desde una copia de seguridad o migrar a un nuevo sistema. Las contraseñas cifradas antiguas no se pueden descifrar con la nueva clave, por lo que se han eliminado para evitar errores.',
      'pt-BR': 'Isso geralmente acontece ao restaurar de um backup ou migrar para um novo sistema. As senhas criptografadas antigas não podem ser descriptografadas com a nova chave, então foram apagadas para evitar erros.',
    }),
    buttonUnderstand: t({
      en: 'I Understand',
      de: 'Ich verstehe',
      fr: 'Je comprends',
      es: 'Entiendo',
      'pt-BR': 'Eu entendo',
    }),
  },
} satisfies Dictionary;
