import { t, type Dictionary } from 'intlayer';

export default {
  key: 'backup-detail-page',
  content: {
    backupDetails: t({ 
      en: 'Backup details:', 
      de: 'Sicherungsdetails:', 
      fr: 'Détails de la sauvegarde:', 
      es: 'Detalles del backup:', 
      'pt-BR': 'Detalhes do backup:' 
    }),
    backupInformation: t({ 
      en: 'Backup Information', 
      de: 'Sicherungsinformationen', 
      fr: 'Informations de sauvegarde', 
      es: 'Información del backup', 
      'pt-BR': 'Informações do backup' 
    }),
    id: t({ 
      en: 'ID:', 
      de: 'ID:', 
      fr: 'ID:', 
      es: 'ID:', 
      'pt-BR': 'ID:' 
    }),
    date: t({ 
      en: 'Date:', 
      de: 'Datum:', 
      fr: 'Date:', 
      es: 'Fecha:', 
      'pt-BR': 'Data:' 
    }),
    backupStatistics: t({ 
      en: 'Backup Statistics', 
      de: 'Sicherungsstatistiken', 
      fr: 'Statistiques de sauvegarde', 
      es: 'Estadísticas del backup', 
      'pt-BR': 'Estatísticas do backup' 
    }),
    fileCount: t({ 
      en: 'File Count:', 
      de: 'Dateianzahl:', 
      fr: 'Nombre de fichiers:', 
      es: 'Cantidad de archivos:', 
      'pt-BR': 'Quantidade de arquivos:' 
    }),
    fileSize: t({ 
      en: 'File Size:', 
      de: 'Dateigröße:', 
      fr: 'Taille des fichiers:', 
      es: 'Tamaño de archivos:', 
      'pt-BR': 'Tamanho dos arquivos:' 
    }),
    uploadedSize: t({ 
      en: 'Uploaded Size:', 
      de: 'Hochgeladene Größe:', 
      fr: 'Taille téléversée:', 
      es: 'Tamaño enviado:', 
      'pt-BR': 'Tamanho enviado:' 
    }),
    duration: t({ 
      en: 'Duration:', 
      de: 'Dauer:', 
      fr: 'Durée:', 
      es: 'Duración:', 
      'pt-BR': 'Duração:' 
    }),
    storageSize: t({ 
      en: 'Storage Size:', 
      de: 'Speichergröße:', 
      fr: 'Taille de stockage:', 
      es: 'Tamaño de almacenamiento:', 
      'pt-BR': 'Tamanho de armazenamento:' 
    }),
    logSummary: t({ 
      en: 'Log Summary', 
      de: 'Protokollzusammenfassung', 
      fr: 'Résumé du journal', 
      es: 'Resumen del log', 
      'pt-BR': 'Resumo do log' 
    }),
    messages: t({ 
      en: 'Messages:', 
      de: 'Nachrichten:', 
      fr: 'Messages:', 
      es: 'Mensajes:', 
      'pt-BR': 'Mensagens:' 
    }),
    warnings: t({ 
      en: 'Warnings:', 
      de: 'Warnungen:', 
      fr: 'Avertissements:', 
      es: 'Advertencias:', 
      'pt-BR': 'Avisos:' 
    }),
    errors: t({ 
      en: 'Errors:', 
      de: 'Fehler:', 
      fr: 'Erreurs:', 
      es: 'Errores:', 
      'pt-BR': 'Erros:' 
    }),
    availableVersionsAtTime: t({ 
      en: 'Available versions at the time of the backup:', 
      de: 'Verfügbare Versionen zum Zeitpunkt der Sicherung:', 
      fr: 'Versions disponibles au moment de la sauvegarde:', 
      es: 'Versiones disponibles en el momento del backup:', 
      'pt-BR': 'Versões disponíveis no momento do backup:' 
    }),
    errorsTitle: t({ 
      en: 'Errors', 
      de: 'Fehler', 
      fr: 'Erreurs', 
      es: 'Errores', 
      'pt-BR': 'Erros' 
    }),
    warningsTitle: t({ 
      en: 'Warnings', 
      de: 'Warnungen', 
      fr: 'Avertissements', 
      es: 'Advertencias', 
      'pt-BR': 'Avisos' 
    }),
    messagesTitle: t({ 
      en: 'Messages', 
      de: 'Nachrichten', 
      fr: 'Messages', 
      es: 'Mensajes', 
      'pt-BR': 'Mensagens' 
    }),
    showingOnlyFirst: t({ 
      en: 'Showing only first {count} of {total} messages', 
      de: 'Nur die ersten {count} von {total} Nachrichten werden angezeigt', 
      fr: 'Affichage des {count} premiers messages sur {total}', 
      es: 'Mostrando solo los primeros {count} de {total} mensajes', 
      'pt-BR': 'Mostrando apenas os primeiros {count} de {total} mensagens' 
    }),
    showingAllMessages: t({ 
      en: 'Showing all messages ({count})', 
      de: 'Alle Nachrichten anzeigen ({count})', 
      fr: 'Affichage de tous les messages ({count})', 
      es: 'Mostrando todos los mensajes ({count})', 
      'pt-BR': 'Mostrando todas as mensagens ({count})' 
    }),
    collectBackupLogsTooltip: t({ 
      en: 'If the backup log was collected using the Collect backup logs feature, the number of messages is limited to 20 due to a hardcoded limit in the Duplicati Server when saving to the local database.', 
      de: 'Wenn das Sicherungsprotokoll mit der Funktion "Sicherungsprotokolle sammeln" gesammelt wurde, ist die Anzahl der Nachrichten auf 20 begrenzt, da der Duplicati-Server beim Speichern in der lokalen Datenbank eine fest codierte Begrenzung hat.', 
      fr: 'Si le journal de sauvegarde a été collecté à l\'aide de la fonctionnalité Collecter les journaux de sauvegarde, le nombre de messages est limité à 20 en raison d\'une limite codée en dur dans le serveur Duplicati lors de l\'enregistrement dans la base de données locale.', 
      es: 'Si el log de backup se recopiló usando la función Recopilar logs de backup, el número de mensajes está limitado a 20 debido a un límite codificado en el servidor Duplicati al guardar en la base de datos local.', 
      'pt-BR': 'Se o log de backup foi coletado usando o recurso Coletar logs de backup, o número de mensagens é limitado a 20 devido a um limite codificado no servidor Duplicati ao salvar no banco de dados local.' 
    }),
    duplicatiServerOptions: t({ 
      en: 'If the backup log was received directly from the Duplicati server, ensure you are using the following options: send-http-log-level=Information and send-http-max-log-lines=0 in the Duplicati server configuration.', 
      de: 'Wenn das Sicherungsprotokoll direkt vom Duplicati-Server empfangen wurde, stellen Sie sicher, dass Sie die folgenden Optionen verwenden: send-http-log-level=Information und send-http-max-log-lines=0 in der Duplicati-Server-Konfiguration.', 
      fr: 'Si le journal de sauvegarde a été reçu directement du serveur Duplicati, assurez-vous d\'utiliser les options suivantes : send-http-log-level=Information et send-http-max-log-lines=0 dans la configuration du serveur Duplicati.', 
      es: 'Si el log de backup se recibió directamente del servidor Duplicati, asegúrese de usar las siguientes opciones: send-http-log-level=Information y send-http-max-log-lines=0 en la configuración del servidor Duplicati.', 
      'pt-BR': 'Se o log de backup foi recebido diretamente do servidor Duplicati, certifique-se de usar as seguintes opções: send-http-log-level=Information e send-http-max-log-lines=0 na configuração do servidor Duplicati.' 
    }),
    databaseError: t({ 
      en: 'Database Error', 
      de: 'Datenbankfehler', 
      fr: 'Erreur de base de données', 
      es: 'Error de base de datos', 
      'pt-BR': 'Erro de banco de dados' 
    }),
    unableToLoadBackupData: t({ 
      en: 'Unable to load backup data. The database may be temporarily unavailable. Please try again later or contact your administrator.', 
      de: 'Sicherungsdaten konnten nicht geladen werden. Die Datenbank ist möglicherweise vorübergehend nicht verfügbar. Bitte versuchen Sie es später erneut oder kontaktieren Sie Ihren Administrator.', 
      fr: 'Impossible de charger les données de sauvegarde. La base de données peut être temporairement indisponible. Veuillez réessayer plus tard ou contacter votre administrateur.', 
      es: 'No se pueden cargar los datos del backup. La base de datos puede estar temporalmente no disponible. Por favor, inténtelo de nuevo más tarde o contacte a su administrador.', 
      'pt-BR': 'Não foi possível carregar os dados do backup. O banco de dados pode estar temporariamente indisponível. Por favor, tente novamente mais tarde ou entre em contato com seu administrador.' 
    }),
    backupDate: t({ 
      en: 'Backup Date', 
      de: 'Sicherungsdatum', 
      fr: 'Date de sauvegarde', 
      es: 'Fecha del backup', 
      'pt-BR': 'Data do backup' 
    }),
    when: t({ 
      en: 'When', 
      de: 'Wann', 
      fr: 'Quand', 
      es: 'Cuándo', 
      'pt-BR': 'Quando' 
    }),
    tableNumber: t({ 
      en: '#', 
      de: '#', 
      fr: '#', 
      es: '#', 
      'pt-BR': '#' 
    }),
  },
} satisfies Dictionary;
