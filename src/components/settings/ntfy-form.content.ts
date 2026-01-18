import { t, type Dictionary } from 'intlayer';

export default {
  key: 'ntfy-form',
  content: {
    title: t({ 
      en: 'NTFY Configuration', 
      de: 'NTFY-Konfiguration', 
      fr: 'Configuration NTFY', 
      es: 'Configuración NTFY', 
      'pt-BR': 'Configuração NTFY' 
    }),
    description: t({ 
      en: 'Configure NTFY push notification settings', 
      de: 'NTFY-Push-Benachrichtigungseinstellungen konfigurieren', 
      fr: 'Configurer les paramètres de notification push NTFY', 
      es: 'Configurar ajustes de notificaciones push NTFY', 
      'pt-BR': 'Configurar configurações de notificações push NTFY' 
    }),
    ntfyUrl: t({ 
      en: 'NTFY URL', 
      de: 'NTFY-URL', 
      fr: 'URL NTFY', 
      es: 'URL NTFY', 
      'pt-BR': 'URL NTFY' 
    }),
    ntfyTopic: t({ 
      en: 'NTFY Topic', 
      de: 'NTFY-Thema', 
      fr: 'Sujet NTFY', 
      es: 'Tema NTFY', 
      'pt-BR': 'Tópico NTFY' 
    }),
    ntfyPriority: t({ 
      en: 'NTFY Priority', 
      de: 'NTFY-Priorität', 
      fr: 'Priorité NTFY', 
      es: 'Prioridad NTFY', 
      'pt-BR': 'Prioridade NTFY' 
    }),
    testNotification: t({ 
      en: 'Test Notification', 
      de: 'Benachrichtigung testen', 
      fr: 'Tester la notification', 
      es: 'Probar notificación', 
      'pt-BR': 'Testar notificação' 
    }),
    // Card description
    descriptionFull: t({ 
      en: 'Configure your NTFY server settings for receiving notifications. Learn more about NTFY at docs.ntfy.sh and here to subscribe to your topic in your phone.', 
      de: 'Konfigurieren Sie Ihre NTFY-Server-Einstellungen zum Empfangen von Benachrichtigungen. Erfahren Sie mehr über NTFY unter docs.ntfy.sh und hier, um sich für Ihr Thema auf Ihrem Telefon anzumelden.', 
      fr: 'Configurez les paramètres de votre serveur NTFY pour recevoir des notifications. En savoir plus sur NTFY sur docs.ntfy.sh et ici pour vous abonner à votre sujet sur votre téléphone.', 
      es: 'Configure los ajustes de su servidor NTFY para recibir notificaciones. Obtenga más información sobre NTFY en docs.ntfy.sh y aquí para suscribirse a su tema en su teléfono.', 
      'pt-BR': 'Configure as configurações do servidor NTFY para receber notificações. Saiba mais sobre NTFY em docs.ntfy.sh e aqui para se inscrever no seu tópico no seu telefone.' 
    }),
    // Field labels
    ntfyAccessTokenOptional: t({ 
      en: 'NTFY Access Token (Optional)', 
      de: 'NTFY-Zugriffstoken (Optional)', 
      fr: 'Jeton d\'accès NTFY (Optionnel)', 
      es: 'Token de acceso NTFY (Opcional)', 
      'pt-BR': 'Token de acesso NTFY (Opcional)' 
    }),
    // Placeholders
    ntfyUrlPlaceholder: t({ 
      en: 'https://ntfy.sh/', 
      de: 'https://ntfy.sh/', 
      fr: 'https://ntfy.sh/', 
      es: 'https://ntfy.sh/', 
      'pt-BR': 'https://ntfy.sh/' 
    }),
    ntfyTopicPlaceholder: t({ 
      en: 'duplistatus-my-notification-topic', 
      de: 'duplistatus-mein-benachrichtigungs-thema', 
      fr: 'duplistatus-mon-sujet-de-notification', 
      es: 'duplistatus-mi-tema-de-notificacion', 
      'pt-BR': 'duplistatus-meu-topico-de-notificacao' 
    }),
    ntfyAccessTokenPlaceholder: t({ 
      en: 'Enter your NTFY access token', 
      de: 'Geben Sie Ihr NTFY-Zugriffstoken ein', 
      fr: 'Entrez votre jeton d\'accès NTFY', 
      es: 'Ingrese su token de acceso NTFY', 
      'pt-BR': 'Digite seu token de acesso NTFY' 
    }),
    // Help text
    ntfyUrlDescription: t({ 
      en: 'The URL of your NTFY server. Defaults to https://ntfy.sh/', 
      de: 'Die URL Ihres NTFY-Servers. Standardmäßig https://ntfy.sh/', 
      fr: 'L\'URL de votre serveur NTFY. Par défaut https://ntfy.sh/', 
      es: 'La URL de su servidor NTFY. Por defecto https://ntfy.sh/', 
      'pt-BR': 'A URL do seu servidor NTFY. Padrão https://ntfy.sh/' 
    }),
    ntfyTopicDescription: t({ 
      en: 'Leave empty to automatically generate a random name when you save. You can view this topic at', 
      de: 'Lassen Sie leer, um beim Speichern automatisch einen zufälligen Namen zu generieren. Sie können dieses Thema unter anzeigen', 
      fr: 'Laissez vide pour générer automatiquement un nom aléatoire lors de l\'enregistrement. Vous pouvez afficher ce sujet sur', 
      es: 'Deje vacío para generar automáticamente un nombre aleatorio al guardar. Puede ver este tema en', 
      'pt-BR': 'Deixe vazio para gerar automaticamente um nome aleatório ao salvar. Você pode ver este tópico em' 
    }),
    ntfyAccessTokenDescription: t({ 
      en: 'If your NTFY server requires authentication, please enter your access token. For more details, refer to the NTFY authentication documentation.', 
      de: 'Wenn Ihr NTFY-Server eine Authentifizierung erfordert, geben Sie bitte Ihr Zugriffstoken ein. Weitere Details finden Sie in der NTFY-Authentifizierungsdokumentation.', 
      fr: 'Si votre serveur NTFY nécessite une authentification, veuillez entrer votre jeton d\'accès. Pour plus de détails, consultez la documentation d\'authentification NTFY.', 
      es: 'Si su servidor NTFY requiere autenticación, ingrese su token de acceso. Para más detalles, consulte la documentación de autenticación NTFY.', 
      'pt-BR': 'Se o servidor NTFY exigir autenticação, insira seu token de acesso. Para mais detalhes, consulte a documentação de autenticação NTFY.' 
    }),
    // Buttons
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
    sendTestMessage: t({ 
      en: 'Send Test Message', 
      de: 'Testnachricht senden', 
      fr: 'Envoyer un message de test', 
      es: 'Enviar mensaje de prueba', 
      'pt-BR': 'Enviar mensagem de teste' 
    }),
    sending: t({ 
      en: 'Sending...', 
      de: 'Senden...', 
      fr: 'Envoi...', 
      es: 'Enviando...', 
      'pt-BR': 'Enviando...' 
    }),
    configureDevice: t({ 
      en: 'Configure Device', 
      de: 'Gerät konfigurieren', 
      fr: 'Configurer l\'appareil', 
      es: 'Configurar dispositivo', 
      'pt-BR': 'Configurar dispositivo' 
    }),
    // Toast messages
    validationError: t({ 
      en: 'Validation Error', 
      de: 'Validierungsfehler', 
      fr: 'Erreur de validation', 
      es: 'Error de validación', 
      'pt-BR': 'Erro de validação' 
    }),
    pleaseEnterBothUrlAndTopic: t({ 
      en: 'Please enter both NTFY URL and Topic before generating QR code', 
      de: 'Bitte geben Sie sowohl NTFY-URL als auch Thema ein, bevor Sie den QR-Code generieren', 
      fr: 'Veuillez entrer à la fois l\'URL NTFY et le sujet avant de générer le code QR', 
      es: 'Por favor ingrese tanto la URL NTFY como el Tema antes de generar el código QR', 
      'pt-BR': 'Por favor, insira tanto a URL NTFY quanto o Tópico antes de gerar o código QR' 
    }),
    pleaseEnterBothUrlAndTopicForTest: t({ 
      en: 'Please enter both NTFY URL and Topic before testing', 
      de: 'Bitte geben Sie sowohl NTFY-URL als auch Thema ein, bevor Sie testen', 
      fr: 'Veuillez entrer à la fois l\'URL NTFY et le sujet avant de tester', 
      es: 'Por favor ingrese tanto la URL NTFY como el Tema antes de probar', 
      'pt-BR': 'Por favor, insira tanto a URL NTFY quanto o Tópico antes de testar' 
    }),
    qrCodeGenerationFailed: t({ 
      en: 'QR Code Generation Failed', 
      de: 'QR-Code-Generierung fehlgeschlagen', 
      fr: 'Échec de la génération du code QR', 
      es: 'Error en la generación del código QR', 
      'pt-BR': 'Falha na geração do código QR' 
    }),
    failedToGenerateQrCode: t({ 
      en: 'Failed to generate QR code. Please try again.', 
      de: 'Fehler beim Generieren des QR-Codes. Bitte versuchen Sie es erneut.', 
      fr: 'Échec de la génération du code QR. Veuillez réessayer.', 
      es: 'Error al generar el código QR. Por favor, inténtelo de nuevo.', 
      'pt-BR': 'Falha ao gerar código QR. Por favor, tente novamente.' 
    }),
    testSuccessful: t({ 
      en: 'Test Successful', 
      de: 'Test erfolgreich', 
      fr: 'Test réussi', 
      es: 'Prueba exitosa', 
      'pt-BR': 'Teste bem-sucedido' 
    }),
    testNotificationSentSuccessfully: t({ 
      en: 'Test notification sent successfully! Check your device.', 
      de: 'Testbenachrichtigung erfolgreich gesendet! Überprüfen Sie Ihr Gerät.', 
      fr: 'Notification de test envoyée avec succès! Vérifiez votre appareil.', 
      es: '¡Notificación de prueba enviada exitosamente! Verifique su dispositivo.', 
      'pt-BR': 'Notificação de teste enviada com sucesso! Verifique seu dispositivo.' 
    }),
    testFailed: t({ 
      en: 'Test Failed', 
      de: 'Test fehlgeschlagen', 
      fr: 'Test échoué', 
      es: 'Prueba fallida', 
      'pt-BR': 'Teste falhou' 
    }),
    failedToSendTestNotification: t({ 
      en: 'Failed to send test notification', 
      de: 'Fehler beim Senden der Testbenachrichtigung', 
      fr: 'Échec de l\'envoi de la notification de test', 
      es: 'Error al enviar notificación de prueba', 
      'pt-BR': 'Falha ao enviar notificação de teste' 
    }),
  },
} satisfies Dictionary;
