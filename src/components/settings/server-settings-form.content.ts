import { t, type Dictionary } from 'intlayer';

export default {
  key: 'server-settings-form',
  content: {
    title: t({ 
      en: 'Server Management', 
      de: 'Serververwaltung', 
      fr: 'Gestion des serveurs', 
      es: 'Gestión de servidores', 
      'pt-BR': 'Gerenciamento de servidores' 
    }),
    description: t({ 
      en: 'Add, edit, and manage backup servers', 
      de: 'Backup-Server hinzufügen, bearbeiten und verwalten', 
      fr: 'Ajouter, modifier et gérer les serveurs de sauvegarde', 
      es: 'Agregar, editar y administrar servidores de respaldo', 
      'pt-BR': 'Adicionar, editar e gerenciar servidores de backup' 
    }),
    addServer: t({ 
      en: 'Add Server', 
      de: 'Server hinzufügen', 
      fr: 'Ajouter un serveur', 
      es: 'Agregar servidor', 
      'pt-BR': 'Adicionar servidor' 
    }),
    editServer: t({ 
      en: 'Edit Server', 
      de: 'Server bearbeiten', 
      fr: 'Modifier le serveur', 
      es: 'Editar servidor', 
      'pt-BR': 'Editar servidor' 
    }),
    deleteServer: t({ 
      en: 'Delete Server', 
      de: 'Server löschen', 
      fr: 'Supprimer le serveur', 
      es: 'Eliminar servidor', 
      'pt-BR': 'Excluir servidor' 
    }),
    serverName: t({ 
      en: 'Server Name', 
      de: 'Servername', 
      fr: 'Nom du serveur', 
      es: 'Nombre del servidor', 
      'pt-BR': 'Nome do servidor' 
    }),
    serverNameDescription: t({ 
      en: 'A unique name for this server', 
      de: 'Ein eindeutiger Name für diesen Server', 
      fr: 'Un nom unique pour ce serveur', 
      es: 'Un nombre único para este servidor', 
      'pt-BR': 'Um nome exclusivo para este servidor' 
    }),
    testConnection: t({ 
      en: 'Test Connection', 
      de: 'Verbindung testen', 
      fr: 'Tester la connexion', 
      es: 'Probar conexión', 
      'pt-BR': 'Testar conexão' 
    }),
    testConnectionSuccess: t({ 
      en: 'Connection successful', 
      de: 'Verbindung erfolgreich', 
      fr: 'Connexion réussie', 
      es: 'Conexión exitosa', 
      'pt-BR': 'Conexão bem-sucedida' 
    }),
    testConnectionFailed: t({ 
      en: 'Connection failed', 
      de: 'Verbindung fehlgeschlagen', 
      fr: 'Connexion échouée', 
      es: 'Conexión fallida', 
      'pt-BR': 'Conexão falhou' 
    }),
    confirmDelete: t({ 
      en: 'Are you sure you want to delete this server?', 
      de: 'Sind Sie sicher, dass Sie diesen Server löschen möchten?', 
      fr: 'Êtes-vous sûr de vouloir supprimer ce serveur?', 
      es: '¿Está seguro de que desea eliminar este servidor?', 
      'pt-BR': 'Tem certeza de que deseja excluir este servidor?' 
    }),
    noServers: t({ 
      en: 'No servers configured', 
      de: 'Keine Server konfiguriert', 
      fr: 'Aucun serveur configuré', 
      es: 'No hay servidores configurados', 
      'pt-BR': 'Nenhum servidor configurado' 
    }),
    // Table headers
    alias: t({ 
      en: 'Alias', 
      de: 'Alias', 
      fr: 'Alias', 
      es: 'Alias', 
      'pt-BR': 'Apelido' 
    }),
    note: t({ 
      en: 'Note', 
      de: 'Notiz', 
      fr: 'Note', 
      es: 'Nota', 
      'pt-BR': 'Nota' 
    }),
    webInterfaceAddress: t({ 
      en: 'Web Interface Address (URL)', 
      de: 'Web-Interface-Adresse (URL)', 
      fr: 'Adresse de l\'interface Web (URL)', 
      es: 'Dirección de interfaz web (URL)', 
      'pt-BR': 'Endereço da interface web (URL)' 
    }),
    status: t({ 
      en: 'Status', 
      de: 'Status', 
      fr: 'Statut', 
      es: 'Estado', 
      'pt-BR': 'Status' 
    }),
    actions: t({ 
      en: 'Actions', 
      de: 'Aktionen', 
      fr: 'Actions', 
      es: 'Acciones', 
      'pt-BR': 'Ações' 
    }),
    // Placeholders
    serverAliasPlaceholder: t({ 
      en: 'Server alias', 
      de: 'Server-Alias', 
      fr: 'Alias du serveur', 
      es: 'Alias del servidor', 
      'pt-BR': 'Apelido do servidor' 
    }),
    notesPlaceholder: t({ 
      en: 'Notes about this server', 
      de: 'Notizen zu diesem Server', 
      fr: 'Notes sur ce serveur', 
      es: 'Notas sobre este servidor', 
      'pt-BR': 'Notas sobre este servidor' 
    }),
    additionalNotesPlaceholder: t({ 
      en: 'Additional notes', 
      de: 'Zusätzliche Notizen', 
      fr: 'Notes supplémentaires', 
      es: 'Notas adicionales', 
      'pt-BR': 'Notas adicionais' 
    }),
    urlPlaceholder: t({ 
      en: 'https://server:8200', 
      de: 'https://server:8200', 
      fr: 'https://server:8200', 
      es: 'https://server:8200', 
      'pt-BR': 'https://server:8200' 
    }),
    // Status messages
    connected: t({ 
      en: 'Connected', 
      de: 'Verbunden', 
      fr: 'Connecté', 
      es: 'Conectado', 
      'pt-BR': 'Conectado' 
    }),
    collected: t({ 
      en: 'Collected', 
      de: 'Gesammelt', 
      fr: 'Collecté', 
      es: 'Recopilado', 
      'pt-BR': 'Coletado' 
    }),
    failed: t({ 
      en: 'Failed', 
      de: 'Fehlgeschlagen', 
      fr: 'Échoué', 
      es: 'Fallido', 
      'pt-BR': 'Falhou' 
    }),
    testing: t({ 
      en: 'Testing...', 
      de: 'Teste...', 
      fr: 'Test en cours...', 
      es: 'Probando...', 
      'pt-BR': 'Testando...' 
    }),
    collecting: t({ 
      en: 'Collecting...', 
      de: 'Sammle...', 
      fr: 'Collecte en cours...', 
      es: 'Recopilando...', 
      'pt-BR': 'Coletando...' 
    }),
    missingUrl: t({ 
      en: 'Missing URL', 
      de: 'URL fehlt', 
      fr: 'URL manquante', 
      es: 'URL faltante', 
      'pt-BR': 'URL ausente' 
    }),
    missingPassword: t({ 
      en: 'Missing Password', 
      de: 'Passwort fehlt', 
      fr: 'Mot de passe manquant', 
      es: 'Contraseña faltante', 
      'pt-BR': 'Senha ausente' 
    }),
    missingUrlAndPassword: t({ 
      en: 'Missing URL & Password', 
      de: 'URL & Passwort fehlen', 
      fr: 'URL et mot de passe manquants', 
      es: 'URL y contraseña faltantes', 
      'pt-BR': 'URL e senha ausentes' 
    }),
    unknown: t({ 
      en: 'Unknown', 
      de: 'Unbekannt', 
      fr: 'Inconnu', 
      es: 'Desconocido', 
      'pt-BR': 'Desconhecido' 
    }),
    // Error messages
    invalidUrl: t({ 
      en: 'Invalid URL', 
      de: 'Ungültige URL', 
      fr: 'URL invalide', 
      es: 'URL inválida', 
      'pt-BR': 'URL inválida' 
    }),
    pleaseEnterServerUrl: t({ 
      en: 'Please enter a server URL to test', 
      de: 'Bitte geben Sie eine Server-URL zum Testen ein', 
      fr: 'Veuillez entrer une URL de serveur à tester', 
      es: 'Por favor ingrese una URL de servidor para probar', 
      'pt-BR': 'Por favor, insira uma URL do servidor para testar' 
    }),
    pleaseEnterValidUrl: t({ 
      en: 'Please enter a valid URL', 
      de: 'Bitte geben Sie eine gültige URL ein', 
      fr: 'Veuillez entrer une URL valide', 
      es: 'Por favor ingrese una URL válida', 
      'pt-BR': 'Por favor, insira uma URL válida' 
    }),
    // Toast messages
    connectionFailed: t({ 
      en: 'Connection Failed', 
      de: 'Verbindung fehlgeschlagen', 
      fr: 'Connexion échouée', 
      es: 'Conexión fallida', 
      'pt-BR': 'Conexão falhou' 
    }),
    connectionSuccessful: t({ 
      en: 'Connection Successful', 
      de: 'Verbindung erfolgreich', 
      fr: 'Connexion réussie', 
      es: 'Conexión exitosa', 
      'pt-BR': 'Conexão bem-sucedida' 
    }),
    serverConnectionTestPassed: t({ 
      en: 'Server connection test passed', 
      de: 'Server-Verbindungstest bestanden', 
      fr: 'Test de connexion au serveur réussi', 
      es: 'Prueba de conexión del servidor exitosa', 
      'pt-BR': 'Teste de conexão do servidor passou' 
    }),
    connectionTestFailed: t({ 
      en: 'Connection Test Failed', 
      de: 'Verbindungstest fehlgeschlagen', 
      fr: 'Test de connexion échoué', 
      es: 'Prueba de conexión fallida', 
      'pt-BR': 'Teste de conexão falhou' 
    }),
    noUrlsToTest: t({ 
      en: 'No URLs to Test', 
      de: 'Keine URLs zum Testen', 
      fr: 'Aucune URL à tester', 
      es: 'No hay URLs para probar', 
      'pt-BR': 'Nenhuma URL para testar' 
    }),
    noServerUrlsConfigured: t({ 
      en: 'No server URLs are configured to test', 
      de: 'Keine Server-URLs zum Testen konfiguriert', 
      fr: 'Aucune URL de serveur configurée à tester', 
      es: 'No hay URLs de servidor configuradas para probar', 
      'pt-BR': 'Nenhuma URL de servidor configurada para testar' 
    }),
    connectionTestsComplete: t({ 
      en: 'Connection Tests Complete', 
      de: 'Verbindungstests abgeschlossen', 
      fr: 'Tests de connexion terminés', 
      es: 'Pruebas de conexión completadas', 
      'pt-BR': 'Testes de conexão concluídos' 
    }),
    testedConnections: t({ 
      en: 'Tested {count} connections: {success} successful, {failed} failed', 
      de: '{count} Verbindungen getestet: {success} erfolgreich, {failed} fehlgeschlagen', 
      fr: '{count} connexions testées: {success} réussies, {failed} échouées', 
      es: '{count} conexiones probadas: {success} exitosas, {failed} fallidas', 
      'pt-BR': '{count} conexões testadas: {success} bem-sucedidas, {failed} falharam' 
    }),
    failedToTestAllConnections: t({ 
      en: 'Failed to test all connections', 
      de: 'Fehler beim Testen aller Verbindungen', 
      fr: 'Échec du test de toutes les connexions', 
      es: 'Error al probar todas las conexiones', 
      'pt-BR': 'Falha ao testar todas as conexões' 
    }),
    validationError: t({ 
      en: 'Validation Error', 
      de: 'Validierungsfehler', 
      fr: 'Erreur de validation', 
      es: 'Error de validación', 
      'pt-BR': 'Erro de validação' 
    }),
    pleaseFixInvalidUrls: t({ 
      en: 'Please fix invalid URLs before saving', 
      de: 'Bitte korrigieren Sie ungültige URLs vor dem Speichern', 
      fr: 'Veuillez corriger les URL invalides avant d\'enregistrer', 
      es: 'Por favor corrija las URL inválidas antes de guardar', 
      'pt-BR': 'Por favor, corrija URLs inválidas antes de salvar' 
    }),
    serverDetailsUpdated: t({ 
      en: 'Server details updated successfully', 
      de: 'Server-Details erfolgreich aktualisiert', 
      fr: 'Détails du serveur mis à jour avec succès', 
      es: 'Detalles del servidor actualizados exitosamente', 
      'pt-BR': 'Detalhes do servidor atualizados com sucesso' 
    }),
    failedToSaveServerDetails: t({ 
      en: 'Failed to save server details', 
      de: 'Fehler beim Speichern der Server-Details', 
      fr: 'Échec de l\'enregistrement des détails du serveur', 
      es: 'Error al guardar detalles del servidor', 
      'pt-BR': 'Falha ao salvar detalhes do servidor' 
    }),
    failedToInitializePasswordChange: t({ 
      en: 'Failed to initialize password change', 
      de: 'Fehler beim Initialisieren der Passwortänderung', 
      fr: 'Échec de l\'initialisation du changement de mot de passe', 
      es: 'Error al inicializar el cambio de contraseña', 
      'pt-BR': 'Falha ao inicializar alteração de senha' 
    }),
    pleaseEnterBothPasswordFields: t({ 
      en: 'Please enter both password fields', 
      de: 'Bitte geben Sie beide Passwortfelder ein', 
      fr: 'Veuillez remplir les deux champs de mot de passe', 
      es: 'Por favor ingrese ambos campos de contraseña', 
      'pt-BR': 'Por favor, preencha ambos os campos de senha' 
    }),
    passwordsDoNotMatch: t({ 
      en: 'Passwords do not match', 
      de: 'Passwörter stimmen nicht überein', 
      fr: 'Les mots de passe ne correspondent pas', 
      es: 'Las contraseñas no coinciden', 
      'pt-BR': 'As senhas não coincidem' 
    }),
    passwordUpdatedSuccessfully: t({ 
      en: 'Password updated successfully', 
      de: 'Passwort erfolgreich aktualisiert', 
      fr: 'Mot de passe mis à jour avec succès', 
      es: 'Contraseña actualizada exitosamente', 
      'pt-BR': 'Senha atualizada com sucesso' 
    }),
    failedToUpdatePassword: t({ 
      en: 'Failed to update password', 
      de: 'Fehler beim Aktualisieren des Passworts', 
      fr: 'Échec de la mise à jour du mot de passe', 
      es: 'Error al actualizar la contraseña', 
      'pt-BR': 'Falha ao atualizar senha' 
    }),
    passwordDeletedSuccessfully: t({ 
      en: 'Password deleted successfully', 
      de: 'Passwort erfolgreich gelöscht', 
      fr: 'Mot de passe supprimé avec succès', 
      es: 'Contraseña eliminada exitosamente', 
      'pt-BR': 'Senha excluída com sucesso' 
    }),
    failedToDeletePassword: t({ 
      en: 'Failed to delete password', 
      de: 'Fehler beim Löschen des Passworts', 
      fr: 'Échec de la suppression du mot de passe', 
      es: 'Error al eliminar la contraseña', 
      'pt-BR': 'Falha ao excluir senha' 
    }),
    // Button labels
    test: t({ 
      en: 'Test', 
      de: 'Testen', 
      fr: 'Tester', 
      es: 'Probar', 
      'pt-BR': 'Testar' 
    }),
    changePassword: t({ 
      en: 'Change Password', 
      de: 'Passwort ändern', 
      fr: 'Changer le mot de passe', 
      es: 'Cambiar contraseña', 
      'pt-BR': 'Alterar senha' 
    }),
    clickToChangePassword: t({ 
      en: 'Click to change password', 
      de: 'Klicken Sie, um das Passwort zu ändern', 
      fr: 'Cliquez pour changer le mot de passe', 
      es: 'Haga clic para cambiar la contraseña', 
      'pt-BR': 'Clique para alterar a senha' 
    }),
    saveChanges: t({ 
      en: 'Save Changes', 
      de: 'Änderungen speichern', 
      fr: 'Enregistrer les modifications', 
      es: 'Guardar cambios', 
      'pt-BR': 'Salvar alterações' 
    }),
    saving: t({ 
      en: 'Saving...', 
      de: 'Speichern...', 
      fr: 'Enregistrement...', 
      es: 'Guardando...', 
      'pt-BR': 'Salvando...' 
    }),
    testAll: t({ 
      en: 'Test All', 
      de: 'Alle testen', 
      fr: 'Tout tester', 
      es: 'Probar todo', 
      'pt-BR': 'Testar todos' 
    }),
    testingAll: t({ 
      en: 'Testing All...', 
      de: 'Teste alle...', 
      fr: 'Test de tout...', 
      es: 'Probando todo...', 
      'pt-BR': 'Testando todos...' 
    }),
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
      es: 'Recopilando registros de respaldo de todos los servidores configurados...', 
      'pt-BR': 'Coletando logs de backup de todos os servidores configurados...' 
    }),
    deletePassword: t({ 
      en: 'Delete Password', 
      de: 'Passwort löschen', 
      fr: 'Supprimer le mot de passe', 
      es: 'Eliminar contraseña', 
      'pt-BR': 'Excluir senha' 
    }),
    deleting: t({ 
      en: 'Deleting...', 
      de: 'Lösche...', 
      fr: 'Suppression...', 
      es: 'Eliminando...', 
      'pt-BR': 'Excluindo...' 
    }),
    savePassword: t({ 
      en: 'Save Password', 
      de: 'Passwort speichern', 
      fr: 'Enregistrer le mot de passe', 
      es: 'Guardar contraseña', 
      'pt-BR': 'Salvar senha' 
    }),
    // Dialog
    changePasswordToAccess: t({ 
      en: 'Change Password to Access Duplicati Server', 
      de: 'Passwort ändern, um auf Duplicati-Server zuzugreifen', 
      fr: 'Changer le mot de passe pour accéder au serveur Duplicati', 
      es: 'Cambiar contraseña para acceder al servidor Duplicati', 
      'pt-BR': 'Alterar senha para acessar o servidor Duplicati' 
    }),
    server: t({ 
      en: 'Server:', 
      de: 'Server:', 
      fr: 'Serveur:', 
      es: 'Servidor:', 
      'pt-BR': 'Servidor:' 
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
    // Card titles/descriptions
    serverAddresses: t({ 
      en: 'Server Addresses', 
      de: 'Server-Adressen', 
      fr: 'Adresses des serveurs', 
      es: 'Direcciones de servidores', 
      'pt-BR': 'Endereços de servidores' 
    }),
    noServersFound: t({ 
      en: 'No servers found', 
      de: 'Keine Server gefunden', 
      fr: 'Aucun serveur trouvé', 
      es: 'No se encontraron servidores', 
      'pt-BR': 'Nenhum servidor encontrado' 
    }),
    noServersRegistered: t({ 
      en: 'No servers have been registered yet.', 
      de: 'Es wurden noch keine Server registriert.', 
      fr: 'Aucun serveur n\'a encore été enregistré.', 
      es: 'Aún no se han registrado servidores.', 
      'pt-BR': 'Nenhum servidor foi registrado ainda.' 
    }),
    configureServerSettings: t({ 
      en: 'Configure Server Settings', 
      de: 'Server-Einstellungen konfigurieren', 
      fr: 'Configurer les paramètres du serveur', 
      es: 'Configurar ajustes del servidor', 
      'pt-BR': 'Configurar configurações do servidor' 
    }),
    configureServerSettingsDescription: t({ 
      en: 'Configure an optional alias or name for each server. You can also add a descriptive note. Next, provide the web interface address for each server and test the connection to ensure it\'s accessible.', 
      de: 'Konfigurieren Sie einen optionalen Alias oder Namen für jeden Server. Sie können auch eine beschreibende Notiz hinzufügen. Geben Sie als Nächstes die Web-Interface-Adresse für jeden Server an und testen Sie die Verbindung, um sicherzustellen, dass sie zugänglich ist.', 
      fr: 'Configurez un alias ou un nom optionnel pour chaque serveur. Vous pouvez également ajouter une note descriptive. Ensuite, fournissez l\'adresse de l\'interface Web pour chaque serveur et testez la connexion pour vous assurer qu\'elle est accessible.', 
      es: 'Configure un alias o nombre opcional para cada servidor. También puede agregar una nota descriptiva. A continuación, proporcione la dirección de la interfaz web para cada servidor y pruebe la conexión para asegurarse de que sea accesible.', 
      'pt-BR': 'Configure um alias ou nome opcional para cada servidor. Você também pode adicionar uma nota descritiva. Em seguida, forneça o endereço da interface web para cada servidor e teste a conexão para garantir que esteja acessível.' 
    }),
  },
} satisfies Dictionary;
