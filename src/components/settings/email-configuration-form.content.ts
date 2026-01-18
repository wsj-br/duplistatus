import { t, type Dictionary } from 'intlayer';

export default {
  key: 'email-configuration-form',
  content: {
    title: t({ 
      en: 'Email Configuration', 
      de: 'E-Mail-Konfiguration', 
      fr: 'Configuration e-mail', 
      es: 'Configuración de correo electrónico', 
      'pt-BR': 'Configuração de e-mail' 
    }),
    description: t({ 
      en: 'Configure SMTP settings for email notifications', 
      de: 'SMTP-Einstellungen für E-Mail-Benachrichtigungen konfigurieren', 
      fr: 'Configurer les paramètres SMTP pour les notifications par e-mail', 
      es: 'Configurar ajustes SMTP para notificaciones por correo electrónico', 
      'pt-BR': 'Configurar configurações SMTP para notificações por e-mail' 
    }),
    smtpHost: t({ 
      en: 'SMTP Host', 
      de: 'SMTP-Host', 
      fr: 'Hôte SMTP', 
      es: 'Host SMTP', 
      'pt-BR': 'Host SMTP' 
    }),
    smtpPort: t({ 
      en: 'SMTP Port', 
      de: 'SMTP-Port', 
      fr: 'Port SMTP', 
      es: 'Puerto SMTP', 
      'pt-BR': 'Porta SMTP' 
    }),
    smtpUsername: t({ 
      en: 'SMTP Username', 
      de: 'SMTP-Benutzername', 
      fr: 'Nom d\'utilisateur SMTP', 
      es: 'Nombre de usuario SMTP', 
      'pt-BR': 'Nome de usuário SMTP' 
    }),
    smtpPassword: t({ 
      en: 'SMTP Password', 
      de: 'SMTP-Passwort', 
      fr: 'Mot de passe SMTP', 
      es: 'Contraseña SMTP', 
      'pt-BR': 'Senha SMTP' 
    }),
    fromAddress: t({ 
      en: 'From Address', 
      de: 'Absenderadresse', 
      fr: 'Adresse d\'expéditeur', 
      es: 'Dirección de remitente', 
      'pt-BR': 'Endereço do remetente' 
    }),
    toAddresses: t({ 
      en: 'To Addresses', 
      de: 'Empfängeradressen', 
      fr: 'Adresses de destinataires', 
      es: 'Direcciones de destinatarios', 
      'pt-BR': 'Endereços de destinatários' 
    }),
    testNotification: t({ 
      en: 'Test Notification', 
      de: 'Benachrichtigung testen', 
      fr: 'Tester la notification', 
      es: 'Probar notificación', 
      'pt-BR': 'Testar notificação' 
    }),
    // Card title and description
    emailSettings: t({ 
      en: 'Email Settings', 
      de: 'E-Mail-Einstellungen', 
      fr: 'Paramètres e-mail', 
      es: 'Configuración de correo electrónico', 
      'pt-BR': 'Configurações de e-mail' 
    }),
    descriptionFull: t({ 
      en: 'Configure SMTP settings for email notifications. Settings are stored securely in the database.', 
      de: 'Konfigurieren Sie SMTP-Einstellungen für E-Mail-Benachrichtigungen. Einstellungen werden sicher in der Datenbank gespeichert.', 
      fr: 'Configurez les paramètres SMTP pour les notifications par e-mail. Les paramètres sont stockés en toute sécurité dans la base de données.', 
      es: 'Configure los ajustes SMTP para notificaciones por correo electrónico. Los ajustes se almacenan de forma segura en la base de datos.', 
      'pt-BR': 'Configure as configurações SMTP para notificações por e-mail. As configurações são armazenadas com segurança no banco de dados.' 
    }),
    // Alert messages
    emailNotificationsDisabled: t({ 
      en: 'Email notifications are disabled.', 
      de: 'E-Mail-Benachrichtigungen sind deaktiviert.', 
      fr: 'Les notifications par e-mail sont désactivées.', 
      es: 'Las notificaciones por correo electrónico están desactivadas.', 
      'pt-BR': 'As notificações por e-mail estão desativadas.' 
    }),
    completeRequiredFields: t({ 
      en: 'Complete the required fields below to enable notifications.', 
      de: 'Vervollständigen Sie die erforderlichen Felder unten, um Benachrichtigungen zu aktivieren.', 
      fr: 'Remplissez les champs requis ci-dessous pour activer les notifications.', 
      es: 'Complete los campos requeridos a continuación para habilitar las notificaciones.', 
      'pt-BR': 'Preencha os campos obrigatórios abaixo para habilitar as notificações.' 
    }),
    important: t({ 
      en: 'Important:', 
      de: 'Wichtig:', 
      fr: 'Important:', 
      es: 'Importante:', 
      'pt-BR': 'Importante:' 
    }),
    alwaysTestSettings: t({ 
      en: 'Always test your settings to ensure emails are delivered successfully.', 
      de: 'Testen Sie Ihre Einstellungen immer, um sicherzustellen, dass E-Mails erfolgreich zugestellt werden.', 
      fr: 'Testez toujours vos paramètres pour vous assurer que les e-mails sont livrés avec succès.', 
      es: 'Siempre pruebe sus ajustes para asegurarse de que los correos electrónicos se entreguen correctamente.', 
      'pt-BR': 'Sempre teste suas configurações para garantir que os e-mails sejam entregues com sucesso.' 
    }),
    // Field labels
    smtpServerHostname: t({ 
      en: 'SMTP Server Hostname', 
      de: 'SMTP-Server-Hostname', 
      fr: 'Nom d\'hôte du serveur SMTP', 
      es: 'Nombre de host del servidor SMTP', 
      'pt-BR': 'Nome do host do servidor SMTP' 
    }),
    smtpServerPort: t({ 
      en: 'SMTP Server Port', 
      de: 'SMTP-Server-Port', 
      fr: 'Port du serveur SMTP', 
      es: 'Puerto del servidor SMTP', 
      'pt-BR': 'Porta do servidor SMTP' 
    }),
    smtpServerUsername: t({ 
      en: 'SMTP Server Username', 
      de: 'SMTP-Server-Benutzername', 
      fr: 'Nom d\'utilisateur du serveur SMTP', 
      es: 'Nombre de usuario del servidor SMTP', 
      'pt-BR': 'Nome de usuário do servidor SMTP' 
    }),
    smtpServerPassword: t({ 
      en: 'SMTP Server Password', 
      de: 'SMTP-Server-Passwort', 
      fr: 'Mot de passe du serveur SMTP', 
      es: 'Contraseña del servidor SMTP', 
      'pt-BR': 'Senha do servidor SMTP' 
    }),
    recipientEmail: t({ 
      en: 'Recipient Email', 
      de: 'Empfänger-E-Mail', 
      fr: 'E-mail du destinataire', 
      es: 'Correo electrónico del destinatario', 
      'pt-BR': 'E-mail do destinatário' 
    }),
    connectionType: t({ 
      en: 'Connection Type', 
      de: 'Verbindungstyp', 
      fr: 'Type de connexion', 
      es: 'Tipo de conexión', 
      'pt-BR': 'Tipo de conexão' 
    }),
    plainSmtp: t({ 
      en: 'Plain SMTP', 
      de: 'Einfaches SMTP', 
      fr: 'SMTP simple', 
      es: 'SMTP simple', 
      'pt-BR': 'SMTP simples' 
    }),
    starttls: t({ 
      en: 'STARTTLS', 
      de: 'STARTTLS', 
      fr: 'STARTTLS', 
      es: 'STARTTLS', 
      'pt-BR': 'STARTTLS' 
    }),
    directSslTls: t({ 
      en: 'Direct SSL/TLS', 
      de: 'Direktes SSL/TLS', 
      fr: 'SSL/TLS direct', 
      es: 'SSL/TLS directo', 
      'pt-BR': 'SSL/TLS direto' 
    }),
    senderNameOptional: t({ 
      en: 'Sender Name (optional)', 
      de: 'Absendername (optional)', 
      fr: 'Nom de l\'expéditeur (optionnel)', 
      es: 'Nombre del remitente (opcional)', 
      'pt-BR': 'Nome do remetente (opcional)' 
    }),
    fromAddressLabel: t({ 
      en: 'From Address', 
      de: 'Absenderadresse', 
      fr: 'Adresse d\'expéditeur', 
      es: 'Dirección de remitente', 
      'pt-BR': 'Endereço do remetente' 
    }),
    // Required/Optional labels
    required: t({ 
      en: '(required)', 
      de: '(erforderlich)', 
      fr: '(requis)', 
      es: '(requerido)', 
      'pt-BR': '(obrigatório)' 
    }),
    optional: t({ 
      en: '(optional)', 
      de: '(optional)', 
      fr: '(optionnel)', 
      es: '(opcional)', 
      'pt-BR': '(opcional)' 
    }),
    // Placeholders
    smtpHostPlaceholder: t({ 
      en: 'smtp.your-domain.com', 
      de: 'smtp.ihre-domain.com', 
      fr: 'smtp.votre-domaine.com', 
      es: 'smtp.su-dominio.com', 
      'pt-BR': 'smtp.seu-dominio.com' 
    }),
    smtpPortPlaceholder: t({ 
      en: '587', 
      de: '587', 
      fr: '587', 
      es: '587', 
      'pt-BR': '587' 
    }),
    smtpUsernamePlaceholder: t({ 
      en: 'your-email@your-domain.com', 
      de: 'ihre-email@ihre-domain.com', 
      fr: 'votre-email@votre-domaine.com', 
      es: 'su-email@su-dominio.com', 
      'pt-BR': 'seu-email@seu-dominio.com' 
    }),
    recipientEmailPlaceholder: t({ 
      en: 'recipient@example.com', 
      de: 'empfaenger@beispiel.com', 
      fr: 'destinataire@exemple.com', 
      es: 'destinatario@ejemplo.com', 
      'pt-BR': 'destinatario@exemplo.com' 
    }),
    senderNamePlaceholder: t({ 
      en: 'duplistatus', 
      de: 'duplistatus', 
      fr: 'duplistatus', 
      es: 'duplistatus', 
      'pt-BR': 'duplistatus' 
    }),
    fromAddressPlaceholder: t({ 
      en: 'noreply@your-domain.com', 
      de: 'noreply@ihre-domain.com', 
      fr: 'noreply@votre-domaine.com', 
      es: 'noreply@su-dominio.com', 
      'pt-BR': 'noreply@seu-dominio.com' 
    }),
    // Connection type descriptions
    plainSmtpDescription: t({ 
      en: 'Plain SMTP connection without encryption (not recommended, use only for trusted networks).', 
      de: 'Einfache SMTP-Verbindung ohne Verschlüsselung (nicht empfohlen, nur für vertrauenswürdige Netzwerke verwenden).', 
      fr: 'Connexion SMTP simple sans chiffrement (non recommandé, utiliser uniquement pour les réseaux de confiance).', 
      es: 'Conexión SMTP simple sin cifrado (no recomendado, usar solo para redes de confianza).', 
      'pt-BR': 'Conexão SMTP simples sem criptografia (não recomendado, usar apenas para redes confiáveis).' 
    }),
    starttlsDescription: t({ 
      en: 'STARTTLS connection (recommended for port 587). The connection will upgrade to TLS after initial handshake.', 
      de: 'STARTTLS-Verbindung (empfohlen für Port 587). Die Verbindung wird nach dem anfänglichen Handshake auf TLS aktualisiert.', 
      fr: 'Connexion STARTTLS (recommandée pour le port 587). La connexion sera mise à niveau vers TLS après la poignée de main initiale.', 
      es: 'Conexión STARTTLS (recomendada para el puerto 587). La conexión se actualizará a TLS después del apretón de manos inicial.', 
      'pt-BR': 'Conexão STARTTLS (recomendada para a porta 587). A conexão será atualizada para TLS após o handshake inicial.' 
    }),
    directSslTlsDescription: t({ 
      en: 'Direct SSL/TLS connection (recommended for port 465). The connection is encrypted from the start.', 
      de: 'Direkte SSL/TLS-Verbindung (empfohlen für Port 465). Die Verbindung ist von Anfang an verschlüsselt.', 
      fr: 'Connexion SSL/TLS directe (recommandée pour le port 465). La connexion est chiffrée dès le début.', 
      es: 'Conexión SSL/TLS directa (recomendada para el puerto 465). La conexión está cifrada desde el principio.', 
      'pt-BR': 'Conexão SSL/TLS direta (recomendada para a porta 465). A conexão está criptografada desde o início.' 
    }),
    // Sender name description
    senderNameDescription: t({ 
      en: 'Display name shown as the sender. Defaults to "duplistatus" if not set.', 
      de: 'Anzeigename, der als Absender angezeigt wird. Standardmäßig "duplistatus", wenn nicht festgelegt.', 
      fr: 'Nom d\'affichage affiché comme expéditeur. Par défaut "duplistatus" si non défini.', 
      es: 'Nombre para mostrar como remitente. Por defecto "duplistatus" si no se establece.', 
      'pt-BR': 'Nome de exibição mostrado como remetente. Padrão "duplistatus" se não definido.' 
    }),
    // From address descriptions
    fromAddressRequiredDescription: t({ 
      en: 'Email address shown as the sender. Required when authentication is disabled.', 
      de: 'E-Mail-Adresse, die als Absender angezeigt wird. Erforderlich, wenn die Authentifizierung deaktiviert ist.', 
      fr: 'Adresse e-mail affichée comme expéditeur. Requise lorsque l\'authentification est désactivée.', 
      es: 'Dirección de correo electrónico mostrada como remitente. Requerida cuando la autenticación está desactivada.', 
      'pt-BR': 'Endereço de e-mail mostrado como remetente. Obrigatório quando a autenticação está desativada.' 
    }),
    fromAddressOptionalDescription: t({ 
      en: 'Email address shown as the sender. Defaults to SMTP Server Username if not set. Note: Some email providers (like Gmail) will always use the SMTP Server Username instead of this value.', 
      de: 'E-Mail-Adresse, die als Absender angezeigt wird. Standardmäßig SMTP-Server-Benutzername, wenn nicht festgelegt. Hinweis: Einige E-Mail-Anbieter (wie Gmail) verwenden immer den SMTP-Server-Benutzernamen anstelle dieses Werts.', 
      fr: 'Adresse e-mail affichée comme expéditeur. Par défaut, nom d\'utilisateur du serveur SMTP si non défini. Note: Certains fournisseurs de messagerie (comme Gmail) utiliseront toujours le nom d\'utilisateur du serveur SMTP au lieu de cette valeur.', 
      es: 'Dirección de correo electrónico mostrada como remitente. Por defecto, nombre de usuario del servidor SMTP si no se establece. Nota: Algunos proveedores de correo electrónico (como Gmail) siempre usarán el nombre de usuario del servidor SMTP en lugar de este valor.', 
      'pt-BR': 'Endereço de e-mail mostrado como remetente. Padrão: nome de usuário do servidor SMTP se não definido. Nota: Alguns provedores de e-mail (como Gmail) sempre usarão o nome de usuário do servidor SMTP em vez deste valor.' 
    }),
    // Buttons and actions
    changePassword: t({ 
      en: 'Change Password', 
      de: 'Passwort ändern', 
      fr: 'Changer le mot de passe', 
      es: 'Cambiar contraseña', 
      'pt-BR': 'Alterar senha' 
    }),
    setPassword: t({ 
      en: 'Set Password', 
      de: 'Passwort festlegen', 
      fr: 'Définir le mot de passe', 
      es: 'Establecer contraseña', 
      'pt-BR': 'Definir senha' 
    }),
    smtpRequiresAuth: t({ 
      en: 'SMTP Server requires authentication', 
      de: 'SMTP-Server erfordert Authentifizierung', 
      fr: 'Le serveur SMTP nécessite une authentification', 
      es: 'El servidor SMTP requiere autenticación', 
      'pt-BR': 'O servidor SMTP requer autenticação' 
    }),
    saveSettings: t({ 
      en: 'Save Settings', 
      de: 'Einstellungen speichern', 
      fr: 'Enregistrer les paramètres', 
      es: 'Guardar configuración', 
      'pt-BR': 'Salvar configurações' 
    }),
    saving: t({ 
      en: 'Saving...', 
      de: 'Speichern...', 
      fr: 'Enregistrement...', 
      es: 'Guardando...', 
      'pt-BR': 'Salvando...' 
    }),
    sendTestEmail: t({ 
      en: 'Send Test Email', 
      de: 'Test-E-Mail senden', 
      fr: 'Envoyer un e-mail de test', 
      es: 'Enviar correo de prueba', 
      'pt-BR': 'Enviar e-mail de teste' 
    }),
    sending: t({ 
      en: 'Sending...', 
      de: 'Senden...', 
      fr: 'Envoi...', 
      es: 'Enviando...', 
      'pt-BR': 'Enviando...' 
    }),
    deleteSmtpSettings: t({ 
      en: 'Delete SMTP Settings', 
      de: 'SMTP-Einstellungen löschen', 
      fr: 'Supprimer les paramètres SMTP', 
      es: 'Eliminar configuración SMTP', 
      'pt-BR': 'Excluir configurações SMTP' 
    }),
    deleting: t({ 
      en: 'Deleting...', 
      de: 'Löschen...', 
      fr: 'Suppression...', 
      es: 'Eliminando...', 
      'pt-BR': 'Excluindo...' 
    }),
    // Delete dialog
    deleteSmtpSettingsTitle: t({ 
      en: 'Delete SMTP Settings', 
      de: 'SMTP-Einstellungen löschen', 
      fr: 'Supprimer les paramètres SMTP', 
      es: 'Eliminar configuración SMTP', 
      'pt-BR': 'Excluir configurações SMTP' 
    }),
    deleteSmtpSettingsDescription: t({ 
      en: 'Are you sure you want to delete the SMTP settings? This action cannot be undone and will remove all email notification settings.', 
      de: 'Sind Sie sicher, dass Sie die SMTP-Einstellungen löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden und entfernt alle E-Mail-Benachrichtigungseinstellungen.', 
      fr: 'Êtes-vous sûr de vouloir supprimer les paramètres SMTP? Cette action ne peut pas être annulée et supprimera tous les paramètres de notification par e-mail.', 
      es: '¿Está seguro de que desea eliminar la configuración SMTP? Esta acción no se puede deshacer y eliminará todos los ajustes de notificación por correo electrónico.', 
      'pt-BR': 'Tem certeza de que deseja excluir as configurações SMTP? Esta ação não pode ser desfeita e removerá todas as configurações de notificação por e-mail.' 
    }),
    deleteSettings: t({ 
      en: 'Delete Settings', 
      de: 'Einstellungen löschen', 
      fr: 'Supprimer les paramètres', 
      es: 'Eliminar configuración', 
      'pt-BR': 'Excluir configurações' 
    }),
    // Password dialog
    changeEmailPassword: t({ 
      en: 'Change Email Password', 
      de: 'E-Mail-Passwort ändern', 
      fr: 'Changer le mot de passe e-mail', 
      es: 'Cambiar contraseña de correo electrónico', 
      'pt-BR': 'Alterar senha de e-mail' 
    }),
    newPassword: t({ 
      en: 'New Password', 
      de: 'Neues Passwort', 
      fr: 'Nouveau mot de passe', 
      es: 'Nueva contraseña', 
      'pt-BR': 'Nova senha' 
    }),
    enterNewPassword: t({ 
      en: 'Enter new password', 
      de: 'Neues Passwort eingeben', 
      fr: 'Entrez le nouveau mot de passe', 
      es: 'Ingrese nueva contraseña', 
      'pt-BR': 'Digite a nova senha' 
    }),
    confirmPassword: t({ 
      en: 'Confirm Password', 
      de: 'Passwort bestätigen', 
      fr: 'Confirmer le mot de passe', 
      es: 'Confirmar contraseña', 
      'pt-BR': 'Confirmar senha' 
    }),
    confirmNewPassword: t({ 
      en: 'Confirm new password', 
      de: 'Neues Passwort bestätigen', 
      fr: 'Confirmer le nouveau mot de passe', 
      es: 'Confirme la nueva contraseña', 
      'pt-BR': 'Confirme a nova senha' 
    }),
    deletePassword: t({ 
      en: 'Delete Password', 
      de: 'Passwort löschen', 
      fr: 'Supprimer le mot de passe', 
      es: 'Eliminar contraseña', 
      'pt-BR': 'Excluir senha' 
    }),
    savePassword: t({ 
      en: 'Save Password', 
      de: 'Passwort speichern', 
      fr: 'Enregistrer le mot de passe', 
      es: 'Guardar contraseña', 
      'pt-BR': 'Salvar senha' 
    }),
    passwordsDoNotMatch: t({ 
      en: 'Passwords do not match', 
      de: 'Passwörter stimmen nicht überein', 
      fr: 'Les mots de passe ne correspondent pas', 
      es: 'Las contraseñas no coinciden', 
      'pt-BR': 'As senhas não coincidem' 
    }),
    // Toast messages
    settingsSaved: t({ 
      en: 'Settings Saved', 
      de: 'Einstellungen gespeichert', 
      fr: 'Paramètres enregistrés', 
      es: 'Configuración guardada', 
      'pt-BR': 'Configurações salvas' 
    }),
    smtpSettingsSavedSuccessfully: t({ 
      en: 'SMTP settings saved successfully!', 
      de: 'SMTP-Einstellungen erfolgreich gespeichert!', 
      fr: 'Paramètres SMTP enregistrés avec succès!', 
      es: '¡Configuración SMTP guardada exitosamente!', 
      'pt-BR': 'Configurações SMTP salvas com sucesso!' 
    }),
    saveFailed: t({ 
      en: 'Save Failed', 
      de: 'Speichern fehlgeschlagen', 
      fr: 'Échec de l\'enregistrement', 
      es: 'Error al guardar', 
      'pt-BR': 'Falha ao salvar' 
    }),
    failedToSaveConfiguration: t({ 
      en: 'Failed to save configuration', 
      de: 'Fehler beim Speichern der Konfiguration', 
      fr: 'Échec de l\'enregistrement de la configuration', 
      es: 'Error al guardar la configuración', 
      'pt-BR': 'Falha ao salvar configuração' 
    }),
    testEmailSent: t({ 
      en: 'Test Email Sent', 
      de: 'Test-E-Mail gesendet', 
      fr: 'E-mail de test envoyé', 
      es: 'Correo de prueba enviado', 
      'pt-BR': 'E-mail de teste enviado' 
    }),
    testEmailSentDescription: t({ 
      en: 'Settings saved and test email sent successfully! Check your inbox.', 
      de: 'Einstellungen gespeichert und Test-E-Mail erfolgreich gesendet! Überprüfen Sie Ihren Posteingang.', 
      fr: 'Paramètres enregistrés et e-mail de test envoyé avec succès! Vérifiez votre boîte de réception.', 
      es: '¡Configuración guardada y correo de prueba enviado exitosamente! Revise su bandeja de entrada.', 
      'pt-BR': 'Configurações salvas e e-mail de teste enviado com sucesso! Verifique sua caixa de entrada.' 
    }),
    testEmailFailed: t({ 
      en: 'Test Email Failed', 
      de: 'Test-E-Mail fehlgeschlagen', 
      fr: 'Échec de l\'e-mail de test', 
      es: 'Error en correo de prueba', 
      'pt-BR': 'Falha no e-mail de teste' 
    }),
    failedToSendTestEmail: t({ 
      en: 'Failed to send test email', 
      de: 'Fehler beim Senden der Test-E-Mail', 
      fr: 'Échec de l\'envoi de l\'e-mail de test', 
      es: 'Error al enviar correo de prueba', 
      'pt-BR': 'Falha ao enviar e-mail de teste' 
    }),
    settingsDeleted: t({ 
      en: 'Settings Deleted', 
      de: 'Einstellungen gelöscht', 
      fr: 'Paramètres supprimés', 
      es: 'Configuración eliminada', 
      'pt-BR': 'Configurações excluídas' 
    }),
    smtpSettingsDeletedSuccessfully: t({ 
      en: 'SMTP settings have been deleted successfully.', 
      de: 'SMTP-Einstellungen wurden erfolgreich gelöscht.', 
      fr: 'Les paramètres SMTP ont été supprimés avec succès.', 
      es: 'La configuración SMTP se ha eliminado exitosamente.', 
      'pt-BR': 'As configurações SMTP foram excluídas com sucesso.' 
    }),
    deleteFailed: t({ 
      en: 'Delete Failed', 
      de: 'Löschen fehlgeschlagen', 
      fr: 'Échec de la suppression', 
      es: 'Error al eliminar', 
      'pt-BR': 'Falha ao excluir' 
    }),
    failedToDeleteConfiguration: t({ 
      en: 'Failed to delete configuration', 
      de: 'Fehler beim Löschen der Konfiguration', 
      fr: 'Échec de la suppression de la configuration', 
      es: 'Error al eliminar la configuración', 
      'pt-BR': 'Falha ao excluir configuração' 
    }),
    emailPasswordUpdatedSuccessfully: t({ 
      en: 'Email password updated successfully', 
      de: 'E-Mail-Passwort erfolgreich aktualisiert', 
      fr: 'Mot de passe e-mail mis à jour avec succès', 
      es: 'Contraseña de correo electrónico actualizada exitosamente', 
      'pt-BR': 'Senha de e-mail atualizada com sucesso' 
    }),
    emailPasswordDeletedSuccessfully: t({ 
      en: 'Email password deleted successfully', 
      de: 'E-Mail-Passwort erfolgreich gelöscht', 
      fr: 'Mot de passe e-mail supprimé avec succès', 
      es: 'Contraseña de correo electrónico eliminada exitosamente', 
      'pt-BR': 'Senha de e-mail excluída com sucesso' 
    }),
    failedToUpdatePassword: t({ 
      en: 'Failed to update password', 
      de: 'Fehler beim Aktualisieren des Passworts', 
      fr: 'Échec de la mise à jour du mot de passe', 
      es: 'Error al actualizar la contraseña', 
      'pt-BR': 'Falha ao atualizar senha' 
    }),
    failedToDeletePassword: t({ 
      en: 'Failed to delete password', 
      de: 'Fehler beim Löschen des Passworts', 
      fr: 'Échec de la suppression du mot de passe', 
      es: 'Error al eliminar la contraseña', 
      'pt-BR': 'Falha ao excluir senha' 
    }),
    // Validation errors
    validationError: t({ 
      en: 'Validation Error', 
      de: 'Validierungsfehler', 
      fr: 'Erreur de validation', 
      es: 'Error de validación', 
      'pt-BR': 'Erro de validação' 
    }),
    recipientEmailMustContainAt: t({ 
      en: 'Recipient email must contain \'@\' symbol', 
      de: 'Empfänger-E-Mail muss das Symbol \'@\' enthalten', 
      fr: 'L\'e-mail du destinataire doit contenir le symbole \'@\'', 
      es: 'El correo electrónico del destinatario debe contener el símbolo \'@\'', 
      'pt-BR': 'O e-mail do destinatário deve conter o símbolo \'@\'' 
    }),
    fromAddressRequiredWhenAuthDisabled: t({ 
      en: 'From address is required when authentication is disabled and must contain \'@\' symbol', 
      de: 'Absenderadresse ist erforderlich, wenn die Authentifizierung deaktiviert ist und muss das Symbol \'@\' enthalten', 
      fr: 'L\'adresse d\'expéditeur est requise lorsque l\'authentification est désactivée et doit contenir le symbole \'@\'', 
      es: 'La dirección de remitente es requerida cuando la autenticación está desactivada y debe contener el símbolo \'@\'', 
      'pt-BR': 'O endereço do remetente é obrigatório quando a autenticação está desativada e deve conter o símbolo \'@\'' 
    }),
    fromAddressMustContainAt: t({ 
      en: 'From address must contain \'@\' symbol', 
      de: 'Absenderadresse muss das Symbol \'@\' enthalten', 
      fr: 'L\'adresse d\'expéditeur doit contenir le symbole \'@\'', 
      es: 'La dirección de remitente debe contener el símbolo \'@\'', 
      'pt-BR': 'O endereço do remetente deve conter o símbolo \'@\'' 
    }),
    warning: t({ 
      en: 'Warning', 
      de: 'Warnung', 
      fr: 'Avertissement', 
      es: 'Advertencia', 
      'pt-BR': 'Aviso' 
    }),
    recipientEmailFormatMayBeInvalid: t({ 
      en: 'Recipient email format may be invalid (must contain \'@\' symbol). Configuration will be saved anyway.', 
      de: 'Das Format der Empfänger-E-Mail ist möglicherweise ungültig (muss das Symbol \'@\' enthalten). Die Konfiguration wird trotzdem gespeichert.', 
      fr: 'Le format de l\'e-mail du destinataire peut être invalide (doit contenir le symbole \'@\'). La configuration sera enregistrée quand même.', 
      es: 'El formato del correo electrónico del destinatario puede ser inválido (debe contener el símbolo \'@\'). La configuración se guardará de todos modos.', 
      'pt-BR': 'O formato do e-mail do destinatário pode ser inválido (deve conter o símbolo \'@\'). A configuração será salva mesmo assim.' 
    }),
    fromAddressFormatMayBeInvalid: t({ 
      en: 'From address format may be invalid (must contain \'@\' symbol). Configuration will be saved anyway.', 
      de: 'Das Format der Absenderadresse ist möglicherweise ungültig (muss das Symbol \'@\' enthalten). Die Konfiguration wird trotzdem gespeichert.', 
      fr: 'Le format de l\'adresse d\'expéditeur peut être invalide (doit contenir le symbole \'@\'). La configuration sera enregistrée quand même.', 
      es: 'El formato de la dirección de remitente puede ser inválido (debe contener el símbolo \'@\'). La configuración se guardará de todos modos.', 
      'pt-BR': 'O formato do endereço do remetente pode ser inválido (deve conter o símbolo \'@\'). A configuração será salva mesmo assim.' 
    }),
    failedToSaveCurrentConfiguration: t({ 
      en: 'Failed to save current configuration. Your changes may be lost when changing password.', 
      de: 'Fehler beim Speichern der aktuellen Konfiguration. Ihre Änderungen können beim Ändern des Passworts verloren gehen.', 
      fr: 'Échec de l\'enregistrement de la configuration actuelle. Vos modifications peuvent être perdues lors du changement de mot de passe.', 
      es: 'Error al guardar la configuración actual. Sus cambios pueden perderse al cambiar la contraseña.', 
      'pt-BR': 'Falha ao salvar a configuração atual. Suas alterações podem ser perdidas ao alterar a senha.' 
    }),
    pleaseEnterBothPasswordFields: t({ 
      en: 'Please enter both password fields', 
      de: 'Bitte geben Sie beide Passwortfelder ein', 
      fr: 'Veuillez remplir les deux champs de mot de passe', 
      es: 'Por favor ingrese ambos campos de contraseña', 
      'pt-BR': 'Por favor, preencha ambos os campos de senha' 
    }),
    // Missing fields
    smtpServerHostnameMissing: t({ 
      en: 'SMTP Server Hostname', 
      de: 'SMTP-Server-Hostname', 
      fr: 'Nom d\'hôte du serveur SMTP', 
      es: 'Nombre de host del servidor SMTP', 
      'pt-BR': 'Nome do host do servidor SMTP' 
    }),
    smtpServerPortMissing: t({ 
      en: 'SMTP Server Port', 
      de: 'SMTP-Server-Port', 
      fr: 'Port du serveur SMTP', 
      es: 'Puerto del servidor SMTP', 
      'pt-BR': 'Porta do servidor SMTP' 
    }),
    smtpServerUsernameMissing: t({ 
      en: 'SMTP Server Username', 
      de: 'SMTP-Server-Benutzername', 
      fr: 'Nom d\'utilisateur du serveur SMTP', 
      es: 'Nombre de usuario del servidor SMTP', 
      'pt-BR': 'Nome de usuário do servidor SMTP' 
    }),
    smtpServerPasswordMissing: t({ 
      en: 'SMTP Server Password', 
      de: 'SMTP-Server-Passwort', 
      fr: 'Mot de passe du serveur SMTP', 
      es: 'Contraseña del servidor SMTP', 
      'pt-BR': 'Senha do servidor SMTP' 
    }),
    recipientEmailMissing: t({ 
      en: 'Recipient Email', 
      de: 'Empfänger-E-Mail', 
      fr: 'E-mail du destinataire', 
      es: 'Correo electrónico del destinatario', 
      'pt-BR': 'E-mail do destinatário' 
    }),
    fromAddressMissing: t({ 
      en: 'From Address', 
      de: 'Absenderadresse', 
      fr: 'Adresse d\'expéditeur', 
      es: 'Dirección de remitente', 
      'pt-BR': 'Endereço do remetente' 
    }),
    // Master key error
    masterKeyInvalid: t({ 
      en: 'Master Key Invalid', 
      de: 'Hauptschlüssel ungültig', 
      fr: 'Clé principale invalide', 
      es: 'Clave maestra inválida', 
      'pt-BR': 'Chave mestra inválida' 
    }),
    masterKeyInvalidDescription: t({ 
      en: 'The master key is no longer valid. All encrypted passwords and settings must be reconfigured.', 
      de: 'Der Hauptschlüssel ist nicht mehr gültig. Alle verschlüsselten Passwörter und Einstellungen müssen neu konfiguriert werden.', 
      fr: 'La clé principale n\'est plus valide. Tous les mots de passe et paramètres chiffrés doivent être reconfigurés.', 
      es: 'La clave maestra ya no es válida. Todas las contraseñas cifradas y configuraciones deben reconfigurarse.', 
      'pt-BR': 'A chave mestra não é mais válida. Todas as senhas criptografadas e configurações devem ser reconfiguradas.' 
    }),
  },
} satisfies Dictionary;
