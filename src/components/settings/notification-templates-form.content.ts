import { t, type Dictionary } from 'intlayer';

export default {
  key: 'notification-templates-form',
  content: {
    title: t({ 
      en: 'Notification Templates', 
      de: 'Benachrichtigungsvorlagen', 
      fr: 'Modèles de notification', 
      es: 'Plantillas de notificación', 
      'pt-BR': 'Modelos de notificação' 
    }),
    description: t({ 
      en: 'Customize notification message templates', 
      de: 'Benachrichtigungsnachrichtenvorlagen anpassen', 
      fr: 'Personnaliser les modèles de messages de notification', 
      es: 'Personalizar plantillas de mensajes de notificación', 
      'pt-BR': 'Personalizar modelos de mensagens de notificação' 
    }),
    // Tab labels
    successTab: t({ 
      en: 'Success', 
      de: 'Erfolg', 
      fr: 'Succès', 
      es: 'Éxito', 
      'pt-BR': 'Sucesso' 
    }),
    warningTab: t({ 
      en: 'Warning/Error', 
      de: 'Warnung/Fehler', 
      fr: 'Avertissement/Erreur', 
      es: 'Advertencia/Error', 
      'pt-BR': 'Aviso/Erro' 
    }),
    warningTabShort: t({ 
      en: 'Warning', 
      de: 'Warnung', 
      fr: 'Avertissement', 
      es: 'Advertencia', 
      'pt-BR': 'Aviso' 
    }),
    overdueTab: t({ 
      en: 'Overdue Backup', 
      de: 'Überfällige Sicherung', 
      fr: 'Sauvegarde en retard', 
      es: 'Backup retrasado', 
      'pt-BR': 'Backup atrasado' 
    }),
    overdueTabShort: t({ 
      en: 'Overdue', 
      de: 'Überfällig', 
      fr: 'En retard', 
      es: 'Retrasado', 
      'pt-BR': 'Atrasado' 
    }),
    // Template titles and descriptions
    successTemplateTitle: t({ 
      en: 'Success Notification Template', 
      de: 'Erfolgs-Benachrichtigungsvorlage', 
      fr: 'Modèle de notification de succès', 
      es: 'Plantilla de notificación de éxito', 
      'pt-BR': 'Modelo de notificação de sucesso' 
    }),
    successTemplateDescription: t({ 
      en: 'Template used when backups complete successfully', 
      de: 'Vorlage, die verwendet wird, wenn Sicherungen erfolgreich abgeschlossen werden', 
      fr: 'Modèle utilisé lorsque les sauvegardes se terminent avec succès', 
      es: 'Plantilla utilizada cuando las copias de seguridad se completan exitosamente', 
      'pt-BR': 'Modelo usado quando os backups são concluídos com sucesso' 
    }),
    warningTemplateTitle: t({ 
      en: 'Warning/Error Notification Template', 
      de: 'Warnung/Fehler-Benachrichtigungsvorlage', 
      fr: 'Modèle de notification d\'avertissement/erreur', 
      es: 'Plantilla de notificación de advertencia/error', 
      'pt-BR': 'Modelo de notificação de aviso/erro' 
    }),
    warningTemplateDescription: t({ 
      en: 'Template used when backups complete with warnings or errors', 
      de: 'Vorlage, die verwendet wird, wenn Sicherungen mit Warnungen oder Fehlern abgeschlossen werden', 
      fr: 'Modèle utilisé lorsque les sauvegardes se terminent avec des avertissements ou des erreurs', 
      es: 'Plantilla utilizada cuando las copias de seguridad se completan con advertencias o errores', 
      'pt-BR': 'Modelo usado quando os backups são concluídos com avisos ou erros' 
    }),
    overdueTemplateTitle: t({ 
      en: 'Overdue Backup Notification Template', 
      de: 'Überfällige Sicherungs-Benachrichtigungsvorlage', 
      fr: 'Modèle de notification de sauvegarde en retard', 
      es: 'Plantilla de notificación de backup retrasado', 
      'pt-BR': 'Modelo de notificação de backup atrasado' 
    }),
    overdueTemplateDescription: t({ 
      en: 'Template used when expected backups are overdue based on the configured interval', 
      de: 'Vorlage, die verwendet wird, wenn erwartete Sicherungen basierend auf dem konfigurierten Intervall überfällig sind', 
      fr: 'Modèle utilisé lorsque les sauvegardes attendues sont en retard selon l\'intervalle configuré', 
      es: 'Plantilla utilizada cuando las copias de seguridad esperadas están vencidas según el intervalo configurado', 
      'pt-BR': 'Modelo usado quando os backups esperados estão atrasados com base no intervalo configurado' 
    }),
    // Field labels
    titleLabel: t({ 
      en: 'Title', 
      de: 'Titel', 
      fr: 'Titre', 
      es: 'Título', 
      'pt-BR': 'Título' 
    }),
    priority: t({ 
      en: 'Priority', 
      de: 'Priorität', 
      fr: 'Priorité', 
      es: 'Prioridad', 
      'pt-BR': 'Prioridade' 
    }),
    tags: t({ 
      en: 'Tags (comma separated)', 
      de: 'Tags (kommagetrennt)', 
      fr: 'Tags (séparés par des virgules)', 
      es: 'Etiquetas (separadas por comas)', 
      'pt-BR': 'Tags (separadas por vírgula)' 
    }),
    messageTemplate: t({ 
      en: 'Message Template', 
      de: 'Nachrichtenvorlage', 
      fr: 'Modèle de message', 
      es: 'Plantilla de mensaje', 
      'pt-BR': 'Modelo de mensagem' 
    }),
    // Priority options
    priorityMax: t({ 
      en: 'Max/Urgent', 
      de: 'Max/Dringend', 
      fr: 'Max/Urgent', 
      es: 'Máx/Urgente', 
      'pt-BR': 'Máx/Urgente' 
    }),
    priorityHigh: t({ 
      en: 'High', 
      de: 'Hoch', 
      fr: 'Élevé', 
      es: 'Alto', 
      'pt-BR': 'Alto' 
    }),
    priorityDefault: t({ 
      en: 'Default', 
      de: 'Standard', 
      fr: 'Par défaut', 
      es: 'Por defecto', 
      'pt-BR': 'Padrão' 
    }),
    priorityLow: t({ 
      en: 'Low', 
      de: 'Niedrig', 
      fr: 'Faible', 
      es: 'Bajo', 
      'pt-BR': 'Baixo' 
    }),
    priorityMin: t({ 
      en: 'Min', 
      de: 'Min', 
      fr: 'Min', 
      es: 'Mín', 
      'pt-BR': 'Mín' 
    }),
    // Placeholders
    selectVariable: t({ 
      en: 'Select variable...', 
      de: 'Variable auswählen...', 
      fr: 'Sélectionner une variable...', 
      es: 'Seleccionar variable...', 
      'pt-BR': 'Selecionar variável...' 
    }),
    enterNotificationTitle: t({ 
      en: 'Enter notification title', 
      de: 'Benachrichtigungstitel eingeben', 
      fr: 'Entrez le titre de la notification', 
      es: 'Ingrese el título de la notificación', 
      'pt-BR': 'Digite o título da notificação' 
    }),
    enterMessageTemplate: t({ 
      en: 'Enter your message template using variables like {server_name}, {backup_name}, {status}, etc.', 
      de: 'Geben Sie Ihre Nachrichtenvorlage mit Variablen wie {server_name}, {backup_name}, {status} usw. ein.', 
      fr: 'Entrez votre modèle de message en utilisant des variables comme {server_name}, {backup_name}, {status}, etc.', 
      es: 'Ingrese su plantilla de mensaje usando variables como {server_name}, {backup_name}, {status}, etc.', 
      'pt-BR': 'Digite seu modelo de mensagem usando variáveis como {server_name}, {backup_name}, {status}, etc.' 
    }),
    // Buttons
    insert: t({ 
      en: 'Insert', 
      de: 'Einfügen', 
      fr: 'Insérer', 
      es: 'Insertar', 
      'pt-BR': 'Inserir' 
    }),
    saveTemplateSettings: t({ 
      en: 'Save Template Settings', 
      de: 'Vorlageneinstellungen speichern', 
      fr: 'Enregistrer les paramètres du modèle', 
      es: 'Guardar configuración de plantilla', 
      'pt-BR': 'Salvar configurações do modelo' 
    }),
    saving: t({ 
      en: 'Saving...', 
      de: 'Speichern...', 
      fr: 'Enregistrement...', 
      es: 'Guardando...', 
      'pt-BR': 'Salvando...' 
    }),
    sendTestNotification: t({ 
      en: 'Send Test Notification', 
      de: 'Testbenachrichtigung senden', 
      fr: 'Envoyer une notification de test', 
      es: 'Enviar notificación de prueba', 
      'pt-BR': 'Enviar notificação de teste' 
    }),
    sendTest: t({ 
      en: 'Send Test', 
      de: 'Test senden', 
      fr: 'Envoyer le test', 
      es: 'Enviar prueba', 
      'pt-BR': 'Enviar teste' 
    }),
    sending: t({ 
      en: 'Sending...', 
      de: 'Senden...', 
      fr: 'Envoi...', 
      es: 'Enviando...', 
      'pt-BR': 'Enviando...' 
    }),
    resetToDefault: t({ 
      en: 'Reset to Default', 
      de: 'Auf Standard zurücksetzen', 
      fr: 'Réinitialiser aux valeurs par défaut', 
      es: 'Restablecer a predeterminado', 
      'pt-BR': 'Redefinir para padrão' 
    }),
    reset: t({ 
      en: 'Reset', 
      de: 'Zurücksetzen', 
      fr: 'Réinitialiser', 
      es: 'Restablecer', 
      'pt-BR': 'Redefinir' 
    }),
    // Toast messages
    templateSettingsSavedSuccessfully: t({ 
      en: 'Template settings saved successfully', 
      de: 'Vorlageneinstellungen erfolgreich gespeichert', 
      fr: 'Paramètres du modèle enregistrés avec succès', 
      es: 'Configuración de plantilla guardada exitosamente', 
      'pt-BR': 'Configurações do modelo salvas com sucesso' 
    }),
    failedToSaveTemplateSettings: t({ 
      en: 'Failed to save template settings', 
      de: 'Fehler beim Speichern der Vorlageneinstellungen', 
      fr: 'Échec de l\'enregistrement des paramètres du modèle', 
      es: 'Error al guardar la configuración de plantilla', 
      'pt-BR': 'Falha ao salvar configurações do modelo' 
    }),
    testSent: t({ 
      en: 'Test Sent', 
      de: 'Test gesendet', 
      fr: 'Test envoyé', 
      es: 'Prueba enviada', 
      'pt-BR': 'Teste enviado' 
    }),
    testNotificationSentUsing: t({ 
      en: 'Test notification sent using {template} template', 
      de: 'Testbenachrichtigung gesendet mit {template}-Vorlage', 
      fr: 'Notification de test envoyée en utilisant le modèle {template}', 
      es: 'Notificación de prueba enviada usando plantilla {template}', 
      'pt-BR': 'Notificação de teste enviada usando modelo {template}' 
    }),
    failedToSendTestNotification: t({ 
      en: 'Failed to send test notification', 
      de: 'Fehler beim Senden der Testbenachrichtigung', 
      fr: 'Échec de l\'envoi de la notification de test', 
      es: 'Error al enviar notificación de prueba', 
      'pt-BR': 'Falha ao enviar notificação de teste' 
    }),
    templateResetToDefault: t({ 
      en: '{template} template has been reset to default values', 
      de: '{template}-Vorlage wurde auf Standardwerte zurückgesetzt', 
      fr: 'Le modèle {template} a été réinitialisé aux valeurs par défaut', 
      es: 'La plantilla {template} se ha restablecido a los valores predeterminados', 
      'pt-BR': 'O modelo {template} foi redefinido para os valores padrão' 
    }),
    // Help text
    tipInsertVariable: t({ 
      en: 'Tip: to insert a variable, place your cursor where you want it, choose the variable, and click \'Insert\'.', 
      de: 'Tipp: Um eine Variable einzufügen, platzieren Sie den Cursor an der gewünschten Stelle, wählen Sie die Variable aus und klicken Sie auf \'Einfügen\'.', 
      fr: 'Astuce: pour insérer une variable, placez votre curseur où vous le souhaitez, choisissez la variable et cliquez sur \'Insérer\'.', 
      es: 'Consejo: para insertar una variable, coloque el cursor donde lo desee, elija la variable y haga clic en \'Insertar\'.', 
      'pt-BR': 'Dica: para inserir uma variável, coloque o cursor onde desejar, escolha a variável e clique em \'Inserir\'.' 
    }),
    // Variable descriptions (for template variables)
    variableServerName: t({ 
      en: 'Name of the server', 
      de: 'Name des Servers', 
      fr: 'Nom du serveur', 
      es: 'Nombre del servidor', 
      'pt-BR': 'Nome do servidor' 
    }),
    variableServerAlias: t({ 
      en: 'Alias of the server (server_name if not set)', 
      de: 'Alias des Servers (server_name, wenn nicht gesetzt)', 
      fr: 'Alias du serveur (server_name si non défini)', 
      es: 'Alias del servidor (server_name si no está configurado)', 
      'pt-BR': 'Apelido do servidor (server_name se não definido)' 
    }),
    variableServerNote: t({ 
      en: 'Note of the server', 
      de: 'Notiz des Servers', 
      fr: 'Note du serveur', 
      es: 'Nota del servidor', 
      'pt-BR': 'Nota do servidor' 
    }),
    variableServerUrl: t({ 
      en: 'URL of the Duplicati server', 
      de: 'URL des Duplicati-Servers', 
      fr: 'URL du serveur Duplicati', 
      es: 'URL del servidor Duplicati', 
      'pt-BR': 'URL do servidor Duplicati' 
    }),
    variableBackupName: t({ 
      en: 'Name of the backup', 
      de: 'Name der Sicherung', 
      fr: 'Nom de la sauvegarde', 
      es: 'Nombre del backup', 
      'pt-BR': 'Nome do backup' 
    }),
    variableBackupDate: t({ 
      en: 'Date/time of the backup', 
      de: 'Datum/Zeit der Sicherung', 
      fr: 'Date/heure de la sauvegarde', 
      es: 'Fecha/hora del backup', 
      'pt-BR': 'Data/hora do backup' 
    }),
    variableStatus: t({ 
      en: 'Backup status (Success, Failed, etc.)', 
      de: 'Sicherungsstatus (Erfolg, Fehlgeschlagen, etc.)', 
      fr: 'Statut de la sauvegarde (Succès, Échoué, etc.)', 
      es: 'Estado del backup (Éxito, Fallido, etc.)', 
      'pt-BR': 'Status do backup (Sucesso, Falha, etc.)' 
    }),
    variableMessagesCount: t({ 
      en: 'Number of messages', 
      de: 'Anzahl der Nachrichten', 
      fr: 'Nombre de messages', 
      es: 'Número de mensajes', 
      'pt-BR': 'Número de mensagens' 
    }),
    variableWarningsCount: t({ 
      en: 'Number of warnings', 
      de: 'Anzahl der Warnungen', 
      fr: 'Nombre d\'avertissements', 
      es: 'Número de advertencias', 
      'pt-BR': 'Número de avisos' 
    }),
    variableErrorsCount: t({ 
      en: 'Number of errors', 
      de: 'Anzahl der Fehler', 
      fr: 'Nombre d\'erreurs', 
      es: 'Número de errores', 
      'pt-BR': 'Número de erros' 
    }),
    variableLogText: t({ 
      en: 'Log text messages (warnings and errors)', 
      de: 'Protokolltextnachrichten (Warnungen und Fehler)', 
      fr: 'Messages texte du journal (avertissements et erreurs)', 
      es: 'Mensajes de texto del registro (advertencias y errores)', 
      'pt-BR': 'Mensagens de texto do log (avisos e erros)' 
    }),
    variableDuration: t({ 
      en: 'Backup duration', 
      de: 'Sicherungsdauer', 
      fr: 'Durée de la sauvegarde', 
      es: 'Duración del backup', 
      'pt-BR': 'Duração do backup' 
    }),
    variableFileCount: t({ 
      en: 'Number of files processed', 
      de: 'Anzahl der verarbeiteten Dateien', 
      fr: 'Nombre de fichiers traités', 
      es: 'Número de archivos procesados', 
      'pt-BR': 'Número de arquivos processados' 
    }),
    variableFileSize: t({ 
      en: 'Total file size', 
      de: 'Gesamte Dateigröße', 
      fr: 'Taille totale des fichiers', 
      es: 'Tamaño total de archivos', 
      'pt-BR': 'Tamanho total dos arquivos' 
    }),
    variableUploadedSize: t({ 
      en: 'Size of uploaded data', 
      de: 'Größe der hochgeladenen Daten', 
      fr: 'Taille des données téléversées', 
      es: 'Tamaño de datos enviados', 
      'pt-BR': 'Tamanho dos dados enviados' 
    }),
    variableStorageSize: t({ 
      en: 'Storage size used', 
      de: 'Verwendete Speichergröße', 
      fr: 'Taille de stockage utilisée', 
      es: 'Tamaño de almacenamiento usado', 
      'pt-BR': 'Tamanho de armazenamento usado' 
    }),
    variableAvailableVersions: t({ 
      en: 'Number of available versions', 
      de: 'Anzahl der verfügbaren Versionen', 
      fr: 'Nombre de versions disponibles', 
      es: 'Número de versiones disponibles', 
      'pt-BR': 'Número de versões disponíveis' 
    }),
    // Overdue backup specific variables
    variableLastBackupDate: t({ 
      en: 'Date/time of the last backup', 
      de: 'Datum/Zeit der letzten Sicherung', 
      fr: 'Date/heure de la dernière sauvegarde', 
      es: 'Fecha/hora del último backup', 
      'pt-BR': 'Data/hora do último backup' 
    }),
    variableLastElapsed: t({ 
      en: 'Time ago since the last backup', 
      de: 'Zeit seit der letzten Sicherung', 
      fr: 'Temps écoulé depuis la dernière sauvegarde', 
      es: 'Tiempo transcurrido desde el último backup', 
      'pt-BR': 'Tempo decorrido desde o último backup' 
    }),
    variableExpectedDate: t({ 
      en: 'Date/time when the backup was expected', 
      de: 'Datum/Zeit, zu der die Sicherung erwartet wurde', 
      fr: 'Date/heure à laquelle la sauvegarde était attendue', 
      es: 'Fecha/hora en que se esperaba el backup', 
      'pt-BR': 'Data/hora em que o backup era esperado' 
    }),
    variableExpectedElapsed: t({ 
      en: 'Time elapsed since the expected backup date', 
      de: 'Zeit seit dem erwarteten Sicherungsdatum', 
      fr: 'Temps écoulé depuis la date de sauvegarde attendue', 
      es: 'Tiempo transcurrido desde la fecha de backup esperada', 
      'pt-BR': 'Tempo decorrido desde a data de backup esperada' 
    }),
    variableBackupInterval: t({ 
      en: 'Backup interval string (e.g., "1D", "2W", "1M")', 
      de: 'Sicherungsintervall-String (z.B. "1D", "2W", "1M")', 
      fr: 'Chaîne d\'intervalle de sauvegarde (par ex. "1D", "2W", "1M")', 
      es: 'Cadena de intervalo de backup (ej. "1D", "2W", "1M")', 
      'pt-BR': 'String de intervalo de backup (ex: "1D", "2W", "1M")' 
    }),
    variableOverdueTolerance: t({ 
      en: 'Configured overdue tolerance (1 hour, 1 day, etc.)', 
      de: 'Konfigurierte Überfälligkeitstoleranz (1 Stunde, 1 Tag, etc.)', 
      fr: 'Tolérance de retard configurée (1 heure, 1 jour, etc.)', 
      es: 'Tolerancia de retraso configurada (1 hora, 1 día, etc.)', 
      'pt-BR': 'Tolerância de atraso configurada (1 hora, 1 dia, etc.)' 
    }),
  },
} satisfies Dictionary;
