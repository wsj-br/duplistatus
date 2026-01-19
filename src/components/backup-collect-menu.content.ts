import { t, type Dictionary } from 'intlayer';

export default {
  key: 'backup-collect-menu',
  content: {
    // Error messages
    // 'error' is now available in common.ui.error
    // 'failedToLoadServerConnections' is now available in api.errors.failedToLoadServerConnections
    masterKeyInvalid: t({ 
      en: 'Master Key Invalid', 
      de: 'Hauptschlüssel ungültig', 
      fr: 'Clé maître invalide', 
      es: 'Clave maestra inválida', 
      'pt-BR': 'Chave mestra inválida' 
    }),
    masterKeyInvalidDescription: t({ 
      en: 'The master key is no longer valid. All encrypted passwords and settings must be reconfigured.', 
      de: 'Der Hauptschlüssel ist nicht mehr gültig. Alle verschlüsselten Passwörter und Einstellungen müssen neu konfiguriert werden.', 
      fr: 'La clé maître n\'est plus valide. Tous les mots de passe et paramètres cryptés doivent être reconfigurés.', 
      es: 'La clave maestra ya no es válida. Todas las contraseñas y configuraciones cifradas deben ser reconfiguradas.', 
      'pt-BR': 'A chave mestra não é mais válida. Todas as senhas e configurações criptografadas devem ser reconfiguradas.' 
    }),
    connectionFailed: t({ 
      en: 'Connection Failed', 
      de: 'Verbindung fehlgeschlagen', 
      fr: 'Connexion échouée', 
      es: 'Conexión fallida', 
      'pt-BR': 'Falha na conexão' 
    }),
    connectionFailedDescription: t({ 
      en: 'Unable to connect to {host}:{port}. Please check: Server is running and accessible, hostname/IP address is correct, port number is correct, and network connectivity.', 
      de: 'Verbindung zu {host}:{port} nicht möglich. Bitte prüfen Sie: Server läuft und ist erreichbar, Hostname/IP-Adresse ist korrekt, Portnummer ist korrekt und Netzwerkverbindung.', 
      fr: 'Impossible de se connecter à {host}:{port}. Veuillez vérifier: Le serveur fonctionne et est accessible, le nom d\'hôte/adresse IP est correct, le numéro de port est correct et la connectivité réseau.', 
      es: 'No se puede conectar a {host}:{port}. Por favor verifique: El servidor está funcionando y accesible, el nombre de host/dirección IP es correcto, el número de puerto es correcto y la conectividad de red.', 
      'pt-BR': 'Não foi possível conectar a {host}:{port}. Por favor verifique: O servidor está em execução e acessível, o nome do host/endereço IP está correto, o número da porta está correto e a conectividade de rede.' 
    }),
    hostUnreachable: t({ 
      en: 'Host Unreachable', 
      de: 'Host nicht erreichbar', 
      fr: 'Hôte inaccessible', 
      es: 'Host inalcanzable', 
      'pt-BR': 'Host inacessível' 
    }),
    hostUnreachableDescription: t({ 
      en: 'Cannot reach {host}:{port}. The server may be down or the network address is incorrect.', 
      de: 'Kann {host}:{port} nicht erreichen. Der Server ist möglicherweise nicht verfügbar oder die Netzwerkadresse ist falsch.', 
      fr: 'Impossible d\'atteindre {host}:{port}. Le serveur est peut-être hors service ou l\'adresse réseau est incorrecte.', 
      es: 'No se puede alcanzar {host}:{port}. El servidor puede estar caído o la dirección de red es incorrecta.', 
      'pt-BR': 'Não é possível alcançar {host}:{port}. O servidor pode estar inativo ou o endereço de rede está incorreto.' 
    }),
    connectionRefused: t({ 
      en: 'Connection Refused', 
      de: 'Verbindung abgelehnt', 
      fr: 'Connexion refusée', 
      es: 'Conexión rechazada', 
      'pt-BR': 'Conexão recusada' 
    }),
    connectionRefusedDescription: t({ 
      en: '{host}:{port} refused the connection. The Duplicati service may not be running on this port.', 
      de: '{host}:{port} hat die Verbindung abgelehnt. Der Duplicati-Dienst läuft möglicherweise nicht auf diesem Port.', 
      fr: '{host}:{port} a refusé la connexion. Le service Duplicati ne fonctionne peut-être pas sur ce port.', 
      es: '{host}:{port} rechazó la conexión. El servicio Duplicati puede no estar ejecutándose en este puerto.', 
      'pt-BR': '{host}:{port} recusou a conexão. O serviço Duplicati pode não estar em execução nesta porta.' 
    }),
    connectionTimeout: t({ 
      en: 'Connection Timeout', 
      de: 'Verbindungs-Timeout', 
      fr: 'Délai de connexion dépassé', 
      es: 'Tiempo de conexión agotado', 
      'pt-BR': 'Tempo de conexão esgotado' 
    }),
    connectionTimeoutDescription: t({ 
      en: 'Connection to {host}:{port} timed out. Check network connectivity and firewall settings.', 
      de: 'Verbindung zu {host}:{port} hat das Zeitlimit überschritten. Überprüfen Sie die Netzwerkverbindung und Firewall-Einstellungen.', 
      fr: 'La connexion à {host}:{port} a expiré. Vérifiez la connectivité réseau et les paramètres du pare-feu.', 
      es: 'La conexión a {host}:{port} agotó el tiempo de espera. Verifique la conectividad de red y la configuración del firewall.', 
      'pt-BR': 'A conexão com {host}:{port} expirou. Verifique a conectividade de rede e as configurações do firewall.' 
    }),
    authenticationFailed: t({ 
      en: 'Authentication Failed', 
      de: 'Authentifizierung fehlgeschlagen', 
      fr: 'Échec de l\'authentification', 
      es: 'Autenticación fallida', 
      'pt-BR': 'Autenticação falhou' 
    }),
    authenticationFailedDescription: t({ 
      en: 'Invalid password for {host}:{port}. Please check your Duplicati password.', 
      de: 'Ungültiges Passwort für {host}:{port}. Bitte überprüfen Sie Ihr Duplicati-Passwort.', 
      fr: 'Mot de passe invalide pour {host}:{port}. Veuillez vérifier votre mot de passe Duplicati.', 
      es: 'Contraseña inválida para {host}:{port}. Por favor verifique su contraseña de Duplicati.', 
      'pt-BR': 'Senha inválida para {host}:{port}. Por favor verifique sua senha do Duplicati.' 
    }),
    hostNotFound: t({ 
      en: 'Host Not Found', 
      de: 'Host nicht gefunden', 
      fr: 'Hôte non trouvé', 
      es: 'Host no encontrado', 
      'pt-BR': 'Host não encontrado' 
    }),
    hostNotFoundDescription: t({ 
      en: 'Cannot resolve hostname "{host}". Please check the server name or IP address.', 
      de: 'Hostname "{host}" kann nicht aufgelöst werden. Bitte überprüfen Sie den Servernamen oder die IP-Adresse.', 
      fr: 'Impossible de résoudre le nom d\'hôte "{host}". Veuillez vérifier le nom du serveur ou l\'adresse IP.', 
      es: 'No se puede resolver el nombre de host "{host}". Por favor verifique el nombre del servidor o la dirección IP.', 
      'pt-BR': 'Não é possível resolver o nome do host "{host}". Por favor verifique o nome do servidor ou o endereço IP.' 
    }),
    collectionFailed: t({ 
      en: 'Collection Failed', 
      de: 'Sammlung fehlgeschlagen', 
      fr: 'Collecte échouée', 
      es: 'Recopilación fallida', 
      'pt-BR': 'Coleta falhou' 
    }),
    collectionError: t({ 
      en: 'Collection Error', 
      de: 'Sammlungsfehler', 
      fr: 'Erreur de collecte', 
      es: 'Error de recopilación', 
      'pt-BR': 'Erro de coleta' 
    }),
    // Success messages
    jsonFileDownloaded: t({ 
      en: 'JSON file downloaded', 
      de: 'JSON-Datei heruntergeladen', 
      fr: 'Fichier JSON téléchargé', 
      es: 'Archivo JSON descargado', 
      'pt-BR': 'Arquivo JSON baixado' 
    }),
    downloadedFilename: t({ 
      en: 'Downloaded {filename}', 
      de: '{filename} heruntergeladen', 
      fr: '{filename} téléchargé', 
      es: '{filename} descargado', 
      'pt-BR': '{filename} baixado' 
    }),
    downloadFailed: t({ 
      en: 'Download failed', 
      de: 'Download fehlgeschlagen', 
      fr: 'Échec du téléchargement', 
      es: 'Descarga fallida', 
      'pt-BR': 'Download falhou' 
    }),
    failedToDownloadJsonFile: t({ 
      en: 'Failed to download JSON file', 
      de: 'Fehler beim Herunterladen der JSON-Datei', 
      fr: 'Échec du téléchargement du fichier JSON', 
      es: 'Error al descargar el archivo JSON', 
      'pt-BR': 'Falha ao baixar arquivo JSON' 
    }),
    backupsCollectedSuccessfully: t({ 
      en: 'Backups collected successfully from {serverName}', 
      de: 'Backups erfolgreich von {serverName} gesammelt', 
      fr: 'Sauvegardes collectées avec succès depuis {serverName}', 
      es: 'Copias de seguridad recopiladas exitosamente de {serverName}', 
      'pt-BR': 'Backups coletados com sucesso de {serverName}' 
    }),
    collectionStats: t({ 
      en: 'Processed: {processed}, Skipped: {skipped}, Errors: {errors}', 
      de: 'Verarbeitet: {processed}, Übersprungen: {skipped}, Fehler: {errors}', 
      fr: 'Traités: {processed}, Ignorés: {skipped}, Erreurs: {errors}', 
      es: 'Procesados: {processed}, Omitidos: {skipped}, Errores: {errors}', 
      'pt-BR': 'Processados: {processed}, Ignorados: {skipped}, Erros: {errors}' 
    }),
    // Validation messages
    pleaseEnterPasswordForMultipleServers: t({ 
      en: 'Please enter a password for multiple servers', 
      de: 'Bitte geben Sie ein Passwort für mehrere Server ein', 
      fr: 'Veuillez entrer un mot de passe pour plusieurs serveurs', 
      es: 'Por favor ingrese una contraseña para múltiples servidores', 
      'pt-BR': 'Por favor insira uma senha para múltiplos servidores' 
    }),
    invalidHostnames: t({ 
      en: 'Invalid Hostnames', 
      de: 'Ungültige Hostnamen', 
      fr: 'Noms d\'hôte invalides', 
      es: 'Nombres de host inválidos', 
      'pt-BR': 'Nomes de host inválidos' 
    }),
    invalidHostnamesDetected: t({ 
      en: 'Invalid hostnames detected: {hostnames}', 
      de: 'Ungültige Hostnamen erkannt: {hostnames}', 
      fr: 'Noms d\'hôte invalides détectés: {hostnames}', 
      es: 'Nombres de host inválidos detectados: {hostnames}', 
      'pt-BR': 'Nomes de host inválidos detectados: {hostnames}' 
    }),
    pleaseEnterHostname: t({ 
      en: 'Please enter a hostname', 
      de: 'Bitte geben Sie einen Hostnamen ein', 
      fr: 'Veuillez entrer un nom d\'hôte', 
      es: 'Por favor ingrese un nombre de host', 
      'pt-BR': 'Por favor insira um nome de host' 
    }),
    pleaseEnterPassword: t({ 
      en: 'Please enter a password', 
      de: 'Bitte geben Sie ein Passwort ein', 
      fr: 'Veuillez entrer un mot de passe', 
      es: 'Por favor ingrese una contraseña', 
      'pt-BR': 'Por favor insira uma senha' 
    }),
    // Collection dialog
    startingCollection: t({ 
      en: 'Starting Collection', 
      de: 'Sammlung starten', 
      fr: 'Démarrage de la collecte', 
      es: 'Iniciando recopilación', 
      'pt-BR': 'Iniciando coleta' 
    }),
    collectingBackupLogs: t({ 
      en: 'Collecting backup logs from all configured servers...', 
      de: 'Sammle Backup-Protokolle von allen konfigurierten Servern...', 
      fr: 'Collecte des journaux de sauvegarde de tous les serveurs configurés...', 
      es: 'Recopilando registros de backup de todos los servidores configurados...', 
      'pt-BR': 'Coletando logs de backup de todos os servidores configurados...' 
    }),
    collectAllBackups: t({ 
      en: 'Collect All Backups', 
      de: 'Alle Backups sammeln', 
      fr: 'Collecter toutes les sauvegardes', 
      es: 'Recopilar todas las copias de seguridad', 
      'pt-BR': 'Coletar todos os backups' 
    }),
    collectAllBackupsDescription: t({ 
      en: 'This will collect backup logs from all configured servers. Are you sure you want to continue?', 
      de: 'Dies wird Backup-Protokolle von allen konfigurierten Servern sammeln. Möchten Sie fortfahren?', 
      fr: 'Cela collectera les journaux de sauvegarde de tous les serveurs configurés. Êtes-vous sûr de vouloir continuer?', 
      es: 'Esto recopilará registros de backup de todos los servidores configurados. ¿Está seguro de que desea continuar?', 
      'pt-BR': 'Isso coletará logs de backup de todos os servidores configurados. Tem certeza de que deseja continuar?' 
    }),
    // 'cancel' is now available in common.ui.cancel
    // UI Labels and buttons
    buttonTitle: t({
      en: 'Collect backup logs (Right-click for Collect All)',
      de: 'Backup-Protokolle sammeln (Rechtsklick für Alle sammeln)',
      fr: 'Collecter les journaux de sauvegarde (Clic droit pour tout collecter)',
      es: 'Recopilar registros de backup (Clic derecho para recopilar todo)',
      'pt-BR': 'Coletar logs de backup (Clique direito para coletar todos)',
    }),
    buttonText: t({
      en: 'Collect',
      de: 'Sammeln',
      fr: 'Collecter',
      es: 'Recopilar',
      'pt-BR': 'Coletar',
    }),
    title: t({
      en: 'Collect Backup Logs',
      de: 'Backup-Protokolle sammeln',
      fr: 'Collecter les journaux de sauvegarde',
      es: 'Recopilar registros de backup',
      'pt-BR': 'Coletar logs de backup',
    }),
    descriptionPrefilled: t({
      en: 'Extract backup logs and configuration from {serverName}',
      de: 'Backup-Protokolle und Konfiguration von {serverName} extrahieren',
      fr: 'Extraire les journaux de sauvegarde et la configuration de {serverName}',
      es: 'Extraer registros de backup y configuración de {serverName}',
      'pt-BR': 'Extrair logs de backup e configuração de {serverName}',
    }),
    descriptionStoredCredentials: t({
      en: 'Using stored credentials for selected server',
      de: 'Verwende gespeicherte Anmeldedaten für den ausgewählten Server',
      fr: 'Utilisation des identifiants stockés pour le serveur sélectionné',
      es: 'Usando credenciales almacenadas para el servidor seleccionado',
      'pt-BR': 'Usando credenciais armazenadas para o servidor selecionado',
    }),
    descriptionUpdatingCredentials: t({
      en: 'Updating server credentials and collecting backups',
      de: 'Server-Anmeldedaten aktualisieren und Backups sammeln',
      fr: 'Mise à jour des identifiants du serveur et collecte des sauvegardes',
      es: 'Actualizando credenciales del servidor y recopilando backups',
      'pt-BR': 'Atualizando credenciais do servidor e coletando backups',
    }),
    descriptionMultipleServers: t({
      en: 'Extract backup logs from {count} servers using the same port and password',
      de: 'Backup-Protokolle von {count} Servern mit demselben Port und Passwort extrahieren',
      fr: 'Extraire les journaux de sauvegarde de {count} serveurs en utilisant le même port et mot de passe',
      es: 'Extraer registros de backup de {count} servidores usando el mismo puerto y contraseña',
      'pt-BR': 'Extrair logs de backup de {count} servidores usando a mesma porta e senha',
    }),
    descriptionDefault: t({
      en: 'Extract backup logs and schedule configuration directly from Duplicati server',
      de: 'Backup-Protokolle und Zeitplan-Konfiguration direkt vom Duplicati-Server extrahieren',
      fr: 'Extraire les journaux de sauvegarde et la configuration de planification directement du serveur Duplicati',
      es: 'Extraer registros de backup y configuración de programación directamente del servidor Duplicati',
      'pt-BR': 'Extrair logs de backup e configuração de agendamento diretamente do servidor Duplicati',
    }),
    selectServer: t({
      en: 'Select Server',
      de: 'Server auswählen',
      fr: 'Sélectionner le serveur',
      es: 'Seleccionar servidor',
      'pt-BR': 'Selecionar servidor',
    }),
    // 'loadingServers' is now available in settings.servers.loadingServers
    chooseServerOrManual: t({
      en: 'Choose a server or enter manually below',
      de: 'Wählen Sie einen Server aus oder geben Sie manuell unten ein',
      fr: 'Choisissez un serveur ou saisissez manuellement ci-dessous',
      es: 'Elija un servidor o ingrese manualmente a continuación',
      'pt-BR': 'Escolha um servidor ou insira manualmente abaixo',
    }),
    newServer: t({
      en: '+ New Server',
      de: '+ Neuer Server',
      fr: '+ Nouveau serveur',
      es: '+ Nuevo servidor',
      'pt-BR': '+ Novo servidor',
    }),
    // 'noServersConfigured' is now available in settings.servers.noServersWithUrls
    hostnameLabel: t({
      en: 'Hostname',
      de: 'Hostname',
      fr: 'Nom d\'hôte',
      es: 'Nombre de host',
      'pt-BR': 'Nome do host',
    }),
    multipleServersCount: t({
      en: '({count} servers)',
      de: '({count} Server)',
      fr: '({count} serveurs)',
      es: '({count} servidores)',
      'pt-BR': '({count} servidores)',
    }),
    storedHostnameHint: t({
      en: '(stored hostname, change if needed)',
      de: '(gespeicherter Hostname, bei Bedarf ändern)',
      fr: '(nom d\'hôte stocké, modifier si nécessaire)',
      es: '(nombre de host almacenado, cambiar si es necesario)',
      'pt-BR': '(nome do host armazenado, alterar se necessário)',
    }),
    updatingStoredValue: t({
      en: '(updating stored value)',
      de: '(gespeicherten Wert aktualisieren)',
      fr: '(mise à jour de la valeur stockée)',
      es: '(actualizando valor almacenado)',
      'pt-BR': '(atualizando valor armazenado)',
    }),
    placeholderUseStoredHostname: t({
      en: 'Leave empty to use stored hostname',
      de: 'Leer lassen, um gespeicherten Hostname zu verwenden',
      fr: 'Laisser vide pour utiliser le nom d\'hôte stocké',
      es: 'Dejar vacío para usar el nombre de host almacenado',
      'pt-BR': 'Deixar vazio para usar o nome do host armazenado',
    }),
    placeholderHostname: t({
      en: 'name or IP (comma-separated for multiple)',
      de: 'name oder IP (durch Komma getrennt für mehrere)',
      fr: 'nom ou IP (séparés par des virgules pour plusieurs)',
      es: 'nombre o IP (separados por comas para múltiples)',
      'pt-BR': 'nome ou IP (separados por vírgula para múltiplos)',
    }),
    multipleServersDetected: t({
      en: 'Multiple servers detected:',
      de: 'Mehrere Server erkannt:',
      fr: 'Plusieurs serveurs détectés:',
      es: 'Múltiples servidores detectados:',
      'pt-BR': 'Múltiplos servidores detectados:',
    }),
    fixInvalidHostnames: t({
      en: 'Please fix invalid hostnames before collecting.',
      de: 'Bitte korrigieren Sie ungültige Hostnamen vor dem Sammeln.',
      fr: 'Veuillez corriger les noms d\'hôte invalides avant de collecter.',
      es: 'Por favor corrija los nombres de host inválidos antes de recopilar.',
      'pt-BR': 'Por favor corrija os nomes de host inválidos antes de coletar.',
    }),
    portLabel: t({
      en: 'Port',
      de: 'Port',
      fr: 'Port',
      es: 'Puerto',
      'pt-BR': 'Porta',
    }),
    passwordLabel: t({
      en: 'Password',
      de: 'Passwort',
      fr: 'Mot de passe',
      es: 'Contraseña',
      'pt-BR': 'Senha',
    }),
    passwordOnlyIfChanged: t({
      en: '(only fill if password changed)',
      de: '(nur ausfüllen, wenn Passwort geändert wurde)',
      fr: '(remplir uniquement si le mot de passe a changé)',
      es: '(solo completar si la contraseña cambió)',
      'pt-BR': '(preencher apenas se a senha mudou)',
    }),
    placeholderUseStoredPassword: t({
      en: 'Leave empty to use stored password',
      de: 'Leer lassen, um gespeichertes Passwort zu verwenden',
      fr: 'Laisser vide pour utiliser le mot de passe stocké',
      es: 'Dejar vacío para usar la contraseña almacenada',
      'pt-BR': 'Deixar vazio para usar a senha armazenada',
    }),
    placeholderPassword: t({
      en: 'Enter Duplicati password',
      de: 'Duplicati-Passwort eingeben',
      fr: 'Entrez le mot de passe Duplicati',
      es: 'Ingrese la contraseña de Duplicati',
      'pt-BR': 'Digite a senha do Duplicati',
    }),
    passwordMissingLink: t({
      en: 'Password missing or lost?',
      de: 'Passwort fehlt oder verloren?',
      fr: 'Mot de passe manquant ou perdu?',
      es: '¿Contraseña faltante o perdida?',
      'pt-BR': 'Senha esquecida ou perdida?',
    }),
    downloadJsonLabel: t({
      en: 'Download collected JSON data',
      de: 'Gesammelte JSON-Daten herunterladen',
      fr: 'Télécharger les données JSON collectées',
      es: 'Descargar datos JSON recopilados',
      'pt-BR': 'Baixar dados JSON coletados',
    }),
    collectingFromServer: t({
      en: 'Collecting backup logs from {serverName}...',
      de: 'Sammle Backup-Protokolle von {serverName}...',
      fr: 'Collecte des journaux de sauvegarde de {serverName}...',
      es: 'Recopilando registros de backup de {serverName}...',
      'pt-BR': 'Coletando logs de backup de {serverName}...',
    }),
    percentComplete: t({
      en: '{percent}% complete',
      de: '{percent}% abgeschlossen',
      fr: '{percent}% terminé',
      es: '{percent}% completo',
      'pt-BR': '{percent}% completo',
    }),
    collectionCompleteFrom: t({
      en: 'Collection complete from {serverName}!',
      de: 'Sammlung von {serverName} abgeschlossen!',
      fr: 'Collecte terminée de {serverName}!',
      es: '¡Recopilación completa de {serverName}!',
      'pt-BR': 'Coleta completa de {serverName}!',
    }),
    processedBackups: t({
      en: 'Processed: {count} backups',
      de: 'Verarbeitet: {count} Backups',
      fr: 'Traités: {count} sauvegardes',
      es: 'Procesados: {count} backups',
      'pt-BR': 'Processados: {count} backups',
    }),
    skippedDuplicates: t({
      en: 'Skipped: {count} duplicates',
      de: 'Übersprungen: {count} Duplikate',
      fr: 'Ignorés: {count} doublons',
      es: 'Omitidos: {count} duplicados',
      'pt-BR': 'Ignorados: {count} duplicados',
    }),
    errorsCount: t({
      en: 'Errors: {count}',
      de: 'Fehler: {count}',
      fr: 'Erreurs: {count}',
      es: 'Errores: {count}',
      'pt-BR': 'Erros: {count}',
    }),
    collectFromMultipleServers: t({
      en: 'Collect backup logs from {count} servers',
      de: 'Backup-Protokolle von {count} Servern sammeln',
      fr: 'Collecter les journaux de sauvegarde de {count} serveurs',
      es: 'Recopilar registros de backup de {count} servidores',
      'pt-BR': 'Coletar logs de backup de {count} servidores',
    }),
    collectingFromMultiple: t({
      en: 'Collecting from {count} servers...',
      de: 'Sammle von {count} Servern...',
      fr: 'Collecte de {count} serveurs...',
      es: 'Recopilando de {count} servidores...',
      'pt-BR': 'Coletando de {count} servidores...',
    }),
    collecting: t({
      en: 'Collecting...',
      de: 'Wird gesammelt...',
      fr: 'Collecte...',
      es: 'Recopilando...',
      'pt-BR': 'Coletando...',
    }),
    collectionComplete: t({
      en: 'Collection Complete!',
      de: 'Sammlung abgeschlossen!',
      fr: 'Collecte terminée!',
      es: '¡Recopilación completa!',
      'pt-BR': 'Coleta completa!',
    }),
    collectFromMultiple: t({
      en: 'Collect from {count} Servers',
      de: 'Von {count} Servern sammeln',
      fr: 'Collecter de {count} serveurs',
      es: 'Recopilar de {count} servidores',
      'pt-BR': 'Coletar de {count} servidores',
    }),
    collectBackups: t({
      en: 'Collect Backups',
      de: 'Backups sammeln',
      fr: 'Collecter les sauvegardes',
      es: 'Recopilar backups',
      'pt-BR': 'Coletar backups',
    }),
    multiServerCollectionProgress: t({
      en: 'Multi-Server Collection Progress',
      de: 'Fortschritt der Multi-Server-Sammlung',
      fr: 'Progression de la collecte multi-serveurs',
      es: 'Progreso de recopilación multi-servidor',
      'pt-BR': 'Progresso da coleta multi-servidor',
    }),
    serverAddress: t({
      en: 'Server Address',
      de: 'Serveradresse',
      fr: 'Adresse du serveur',
      es: 'Dirección del servidor',
      'pt-BR': 'Endereço do servidor',
    }),
    status: t({
      en: 'Status',
      de: 'Status',
      fr: 'Statut',
      es: 'Estado',
      'pt-BR': 'Status',
    }),
    successWithStats: t({
      en: 'Success (Processed: {processed}, Skipped: {skipped}, Errors: {errors})',
      de: 'Erfolg (Verarbeitet: {processed}, Übersprungen: {skipped}, Fehler: {errors})',
      fr: 'Succès (Traités: {processed}, Ignorés: {skipped}, Erreurs: {errors})',
      es: 'Éxito (Procesados: {processed}, Omitidos: {skipped}, Errores: {errors})',
      'pt-BR': 'Sucesso (Processados: {processed}, Ignorados: {skipped}, Erros: {errors})',
    }),
    // 'failed' is now available in common.status.failed
    waiting: t({
      en: 'Waiting',
      de: 'Warten',
      fr: 'En attente',
      es: 'Esperando',
      'pt-BR': 'Aguardando',
    }),
    collectionInProgress: t({
      en: 'Collection in Progress...',
      de: 'Sammlung läuft...',
      fr: 'Collecte en cours...',
      es: 'Recopilación en progreso...',
      'pt-BR': 'Coleta em progresso...',
    }),
    // 'close' is now available in common.ui.close
  },
} satisfies Dictionary;
