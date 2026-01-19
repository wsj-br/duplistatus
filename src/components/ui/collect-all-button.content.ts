import { t, type Dictionary } from 'intlayer';

export default {
  key: 'collect-all-button',
  content: {
    collectAll: t({ 
      en: 'Collect All', 
      de: 'Alle sammeln', 
      fr: 'Tout collecter', 
      es: 'Recopilar todo', 
      'pt-BR': 'Coletar todos' 
    }),
    collecting: t({ 
      en: 'Collecting...', 
      de: 'Sammle...', 
      fr: 'Collecte en cours...', 
      es: 'Recopilando...', 
      'pt-BR': 'Coletando...' 
    }),
    tooltip: t({ 
      en: 'Collect backups from all configured servers', 
      de: 'Backups von allen konfigurierten Servern sammeln', 
      fr: 'Collecter les sauvegardes de tous les serveurs configurés', 
      es: 'Recopilar copias de seguridad de todos los servidores configurados', 
      'pt-BR': 'Coletar backups de todos os servidores configurados' 
    }),
    noServersTooltip: t({ 
      en: 'No servers with passwords configured', 
      de: 'Keine Server mit konfigurierten Passwörtern', 
      fr: 'Aucun serveur avec mot de passe configuré', 
      es: 'No hay servidores con contraseñas configuradas', 
      'pt-BR': 'Nenhum servidor com senhas configuradas' 
    }),
    noEligibleServers: t({ 
      en: 'No Eligible Servers', 
      de: 'Keine geeigneten Server', 
      fr: 'Aucun serveur éligible', 
      es: 'No hay servidores elegibles', 
      'pt-BR': 'Nenhum servidor elegível' 
    }),
    noEligibleServersDescription: t({ 
      en: 'No servers with passwords and valid URLs found to collect from', 
      de: 'Keine Server mit Passwörtern und gültigen URLs zum Sammeln gefunden', 
      fr: 'Aucun serveur avec mot de passe et URL valide trouvé pour la collecte', 
      es: 'No se encontraron servidores con contraseñas y URL válidas para recopilar', 
      'pt-BR': 'Nenhum servidor com senhas e URLs válidas encontrado para coletar' 
    }),
    serverErrorsDetected: t({ 
      en: 'Server Errors Detected', 
      de: 'Serverfehler erkannt', 
      fr: 'Erreurs serveur détectées', 
      es: 'Errores de servidor detectados', 
      'pt-BR': 'Erros de servidor detectados' 
    }),
    serverErrorsDetectedDescription: t({ 
      en: 'Check server(s) settings and password and if the server is up and running, then try again. Click "Collect All" to show which server is with error', 
      de: 'Überprüfen Sie die Server-Einstellungen und das Passwort und ob der Server läuft, dann versuchen Sie es erneut. Klicken Sie auf "Alle sammeln", um anzuzeigen, welcher Server einen Fehler hat', 
      fr: 'Vérifiez les paramètres et le mot de passe du serveur et si le serveur est en cours d\'exécution, puis réessayez. Cliquez sur "Tout collecter" pour afficher quel serveur a une erreur', 
      es: 'Verifique la configuración y la contraseña del servidor y si el servidor está en funcionamiento, luego intente nuevamente. Haga clic en "Recopilar todo" para mostrar qué servidor tiene un error', 
      'pt-BR': 'Verifique as configurações e a senha do servidor e se o servidor está em execução, então tente novamente. Clique em "Coletar todos" para mostrar qual servidor tem erro' 
    }),
    serverErrorsDetectedDescriptionWithStatus: t({ 
      en: 'Check server(s) settings and password and if the server is up and running, then try again. Click "Collect All" to show which server is with error (column Status)', 
      de: 'Überprüfen Sie die Server-Einstellungen und das Passwort und ob der Server läuft, dann versuchen Sie es erneut. Klicken Sie auf "Alle sammeln", um anzuzeigen, welcher Server einen Fehler hat (Spalte Status)', 
      fr: 'Vérifiez les paramètres et le mot de passe du serveur et si le serveur est en cours d\'exécution, puis réessayez. Cliquez sur "Tout collecter" pour afficher quel serveur a une erreur (colonne Statut)', 
      es: 'Verifique la configuración y la contraseña del servidor y si el servidor está en funcionamiento, luego intente nuevamente. Haga clic en "Recopilar todo" para mostrar qué servidor tiene un error (columna Estado)', 
      'pt-BR': 'Verifique as configurações e a senha do servidor e se o servidor está em execução, então tente novamente. Clique em "Coletar todos" para mostrar qual servidor tem erro (coluna Status)' 
    }),
    serversSettings: t({ 
      en: 'Servers settings', 
      de: 'Server-Einstellungen', 
      fr: 'Paramètres des serveurs', 
      es: 'Configuración de servidores', 
      'pt-BR': 'Configurações de servidores' 
    }),
    collectionError: t({ 
      en: 'Collection Error', 
      de: 'Sammlungsfehler', 
      fr: 'Erreur de collecte', 
      es: 'Error de recopilación', 
      'pt-BR': 'Erro de coleta' 
    }),
    collectionErrorDescription: t({ 
      en: 'An unexpected error occurred during collection', 
      de: 'Ein unerwarteter Fehler ist während der Sammlung aufgetreten', 
      fr: 'Une erreur inattendue s\'est produite lors de la collecte', 
      es: 'Ocurrió un error inesperado durante la recopilación', 
      'pt-BR': 'Ocorreu um erro inesperado durante a coleta' 
    }),
  },
} satisfies Dictionary;
