import { t, type Dictionary } from 'intlayer';

export default {
  key: 'database-maintenance-form',
  content: {
    title: t({ 
      en: 'Database Maintenance', 
      de: 'Datenbankwartung', 
      fr: 'Maintenance de la base de données', 
      es: 'Mantenimiento de base de datos', 
      'pt-BR': 'Manutenção do banco de dados' 
    }),
    description: t({ 
      en: 'Perform database maintenance operations', 
      de: 'Datenbankwartungsvorgänge durchführen', 
      fr: 'Effectuer des opérations de maintenance de la base de données', 
      es: 'Realizar operaciones de mantenimiento de base de datos', 
      'pt-BR': 'Realizar operações de manutenção do banco de dados' 
    }),
    vacuum: t({ 
      en: 'Vacuum Database', 
      de: 'Datenbank bereinigen', 
      fr: 'Nettoyer la base de données', 
      es: 'Optimizar espacio', 
      'pt-BR': 'Otimizar espaço' 
    }),
    optimize: t({ 
      en: 'Optimize Database', 
      de: 'Datenbank optimieren', 
      fr: 'Optimiser la base de données', 
      es: 'Optimizar base de datos', 
      'pt-BR': 'Otimizar banco de dados' 
    }),
    // Card description
    cardDescription: t({ 
      en: 'Reduce database size by cleaning up old records and managing data', 
      de: 'Datenbankgröße durch Bereinigung alter Datensätze und Datenverwaltung reduzieren', 
      fr: 'Réduire la taille de la base de données en nettoyant les anciens enregistrements et en gérant les données', 
      es: 'Reducir el tamaño de la base de datos limpiando registros antiguos y gestionando datos', 
      'pt-BR': 'Reduzir o tamanho do banco de dados limpando registros antigos e gerenciando dados' 
    }),
    // Read-only mode
    readOnlyMode: t({ 
      en: 'You are viewing this in read-only mode. Only administrators can perform maintenance operations.', 
      de: 'Sie sehen dies im Nur-Lese-Modus. Nur Administratoren können Wartungsvorgänge durchführen.', 
      fr: 'Vous visualisez ceci en mode lecture seule. Seuls les administrateurs peuvent effectuer des opérations de maintenance.', 
      es: 'Está viendo esto en modo de solo lectura. Solo los administradores pueden realizar operaciones de mantenimiento.', 
      'pt-BR': 'Você está visualizando isso no modo somente leitura. Apenas administradores podem realizar operações de manutenção.' 
    }),
    // Database Backup
    databaseBackup: t({ 
      en: 'Database Backup', 
      de: 'Datenbanksicherung', 
      fr: 'Sauvegarde de la base de données', 
      es: 'Backup de base de datos', 
      'pt-BR': 'Backup do banco de dados' 
    }),
    backupFormat: t({ 
      en: 'Backup Format', 
      de: 'Sicherungsformat', 
      fr: 'Format de sauvegarde', 
      es: 'Formato de backup', 
      'pt-BR': 'Formato de backup' 
    }),
    selectFormat: t({ 
      en: 'Select format', 
      de: 'Format auswählen', 
      fr: 'Sélectionner le format', 
      es: 'Seleccionar formato', 
      'pt-BR': 'Selecionar formato' 
    }),
    databaseFile: t({ 
      en: 'Database File (.db)', 
      de: 'Datenbankdatei (.db)', 
      fr: 'Fichier de base de données (.db)', 
      es: 'Archivo de base de datos (.db)', 
      'pt-BR': 'Arquivo de banco de dados (.db)' 
    }),
    sqlDump: t({ 
      en: 'SQL Dump (.sql)', 
      de: 'SQL-Dump (.sql)', 
      fr: 'Dump SQL (.sql)', 
      es: 'Volcado SQL (.sql)', 
      'pt-BR': 'Dump SQL (.sql)' 
    }),
    binaryDatabaseFileDescription: t({ 
      en: 'Binary database file - fastest backup, preserves all database structure', 
      de: 'Binäre Datenbankdatei - schnellste Sicherung, bewahrt die gesamte Datenbankstruktur', 
      fr: 'Fichier de base de données binaire - sauvegarde la plus rapide, préserve toute la structure de la base de données', 
      es: 'Archivo de base de datos binario - backup más rápido, preserva toda la estructura de la base de datos', 
      'pt-BR': 'Arquivo de banco de dados binário - backup mais rápido, preserva toda a estrutura do banco de dados' 
    }),
    sqlTextFileDescription: t({ 
      en: 'SQL text file - human-readable, can be edited before restore', 
      de: 'SQL-Textdatei - menschenlesbar, kann vor der Wiederherstellung bearbeitet werden', 
      fr: 'Fichier texte SQL - lisible par l\'homme, peut être modifié avant la restauration', 
      es: 'Archivo de texto SQL - legible por humanos, se puede editar antes de restaurar', 
      'pt-BR': 'Arquivo de texto SQL - legível por humanos, pode ser editado antes da restauração' 
    }),
    creatingBackup: t({ 
      en: 'Creating Backup...', 
      de: 'Sicherung wird erstellt...', 
      fr: 'Création de la sauvegarde...', 
      es: 'Creando backup...', 
      'pt-BR': 'Criando backup...' 
    }),
    downloadBackup: t({ 
      en: 'Download Backup', 
      de: 'Sicherung herunterladen', 
      fr: 'Télécharger la sauvegarde', 
      es: 'Descargar backup', 
      'pt-BR': 'Baixar backup' 
    }),
    createBackupDescription: t({ 
      en: 'Create a backup of the entire database. The backup will be downloaded to your computer.', 
      de: 'Erstellen Sie eine Sicherung der gesamten Datenbank. Die Sicherung wird auf Ihren Computer heruntergeladen.', 
      fr: 'Créez une sauvegarde de toute la base de données. La sauvegarde sera téléchargée sur votre ordinateur.', 
      es: 'Cree un backup de toda la base de datos. El backup se descargará en su computadora.', 
      'pt-BR': 'Crie um backup de todo o banco de dados. O backup será baixado para o seu computador.' 
    }),
    // Database Restore
    databaseRestore: t({ 
      en: 'Database Restore', 
      de: 'Datenbankwiederherstellung', 
      fr: 'Restauration de la base de données', 
      es: 'Restauración de base de datos', 
      'pt-BR': 'Restauração do banco de dados' 
    }),
    selectBackupFile: t({ 
      en: 'Select Backup File', 
      de: 'Sicherungsdatei auswählen', 
      fr: 'Sélectionner le fichier de sauvegarde', 
      es: 'Seleccionar archivo de backup', 
      'pt-BR': 'Selecionar arquivo de backup' 
    }),
    selected: t({ 
      en: 'Selected: {filename} ({size} MB)', 
      de: 'Ausgewählt: {filename} ({size} MB)', 
      fr: 'Sélectionné: {filename} ({size} MB)', 
      es: 'Seleccionado: {filename} ({size} MB)', 
      'pt-BR': 'Selecionado: {filename} ({size} MB)' 
    }),
    selectBackupFileDescription: t({ 
      en: 'Select a .db or .sql backup file to restore. This will replace the current database.', 
      de: 'Wählen Sie eine .db- oder .sql-Sicherungsdatei zur Wiederherstellung aus. Dies ersetzt die aktuelle Datenbank.', 
      fr: 'Sélectionnez un fichier de sauvegarde .db ou .sql à restaurer. Cela remplacera la base de données actuelle.', 
      es: 'Seleccione un archivo de backup .db o .sql para restaurar. Esto reemplazará la base de datos actual.', 
      'pt-BR': 'Selecione um arquivo de backup .db ou .sql para restaurar. Isso substituirá o banco de dados atual.' 
    }),
    restoring: t({ 
      en: 'Restoring...', 
      de: 'Wird wiederhergestellt...', 
      fr: 'Restauration...', 
      es: 'Restaurando...', 
      'pt-BR': 'Restaurando...' 
    }),
    restoreDatabase: t({ 
      en: 'Restore Database', 
      de: 'Datenbank wiederherstellen', 
      fr: 'Restaurer la base de données', 
      es: 'Restaurar base de datos', 
      'pt-BR': 'Restaurar banco de dados' 
    }),
    restoreDatabaseDialogTitle: t({ 
      en: 'Restore Database?', 
      de: 'Datenbank wiederherstellen?', 
      fr: 'Restaurer la base de données?', 
      es: '¿Restaurar base de datos?', 
      'pt-BR': 'Restaurar banco de dados?' 
    }),
    restoreDatabaseDialogDescription: t({ 
      en: 'This will replace the current database with the backup file. All current data will be lost unless you have a backup. A safety backup of the current database will be created automatically before restore.\n\nThis action cannot be undone.', 
      de: 'Dies ersetzt die aktuelle Datenbank durch die Sicherungsdatei. Alle aktuellen Daten gehen verloren, es sei denn, Sie haben eine Sicherung. Eine Sicherungssicherung der aktuellen Datenbank wird automatisch vor der Wiederherstellung erstellt.\n\nDiese Aktion kann nicht rückgängig gemacht werden.', 
      fr: 'Cela remplacera la base de données actuelle par le fichier de sauvegarde. Toutes les données actuelles seront perdues sauf si vous avez une sauvegarde. Une sauvegarde de sécurité de la base de données actuelle sera créée automatiquement avant la restauration.\n\nCette action ne peut pas être annulée.', 
      es: 'Esto reemplazará la base de datos actual con el archivo de backup. Se perderán todos los datos actuales a menos que tenga un backup. Se creará automáticamente un backup de seguridad de la base de datos actual antes de la restauración.\n\nEsta acción no se puede deshacer.', 
      'pt-BR': 'Isso substituirá o banco de dados atual pelo arquivo de backup. Todos os dados atuais serão perdidos, a menos que você tenha um backup. Um backup de segurança do banco de dados atual será criado automaticamente antes da restauração.\n\nEsta ação não pode ser desfeita.' 
    }),
    restoreWarning: t({ 
      en: 'Warning: Restoring will replace all current database data. A safety backup will be created automatically.', 
      de: 'Warnung: Die Wiederherstellung ersetzt alle aktuellen Datenbankdaten. Eine Sicherungssicherung wird automatisch erstellt.', 
      fr: 'Avertissement: La restauration remplacera toutes les données actuelles de la base de données. Une sauvegarde de sécurité sera créée automatiquement.', 
      es: 'Advertencia: La restauración reemplazará todos los datos actuales de la base de datos. Se creará automáticamente un backup de seguridad.', 
      'pt-BR': 'Aviso: A restauração substituirá todos os dados atuais do banco de dados. Um backup de segurança será criado automaticamente.' 
    }),
    // Database Cleanup
    databaseCleanupPeriod: t({ 
      en: 'Database Cleanup Period', 
      de: 'Datenbankbereinigungszeitraum', 
      fr: 'Période de nettoyage de la base de données', 
      es: 'Período de limpieza de base de datos', 
      'pt-BR': 'Período de limpeza do banco de dados' 
    }),
    selectCleanupPeriod: t({ 
      en: 'Select cleanup period', 
      de: 'Bereinigungszeitraum auswählen', 
      fr: 'Sélectionner la période de nettoyage', 
      es: 'Seleccionar período de limpieza', 
      'pt-BR': 'Selecionar período de limpeza' 
    }),
    deleteAllData: t({ 
      en: 'Delete all data', 
      de: 'Alle Daten löschen', 
      fr: 'Supprimer toutes les données', 
      es: 'Eliminar todos los datos', 
      'pt-BR': 'Excluir todos os dados' 
    }),
    sixMonths: t({ 
      en: '6 months', 
      de: '6 Monate', 
      fr: '6 mois', 
      es: '6 meses', 
      'pt-BR': '6 meses' 
    }),
    oneYear: t({ 
      en: '1 year', 
      de: '1 Jahr', 
      fr: '1 an', 
      es: '1 año', 
      'pt-BR': '1 ano' 
    }),
    twoYears: t({ 
      en: '2 years', 
      de: '2 Jahre', 
      fr: '2 ans', 
      es: '2 años', 
      'pt-BR': '2 anos' 
    }),
    selectCleanupPeriodDescription: t({ 
      en: 'Select how long backup records are kept in the database.', 
      de: 'Wählen Sie aus, wie lange Sicherungsdatensätze in der Datenbank gespeichert werden.', 
      fr: 'Sélectionnez la durée de conservation des enregistrements de sauvegarde dans la base de données.', 
      es: 'Seleccione cuánto tiempo se conservan los registros de backup en la base de datos.', 
      'pt-BR': 'Selecione por quanto tempo os registros de backup são mantidos no banco de dados.' 
    }),
    cleaning: t({ 
      en: 'Cleaning...', 
      de: 'Wird bereinigt...', 
      fr: 'Nettoyage...', 
      es: 'Limpiando...', 
      'pt-BR': 'Limpando...' 
    }),
    clearOldRecords: t({ 
      en: 'Clear Old Records', 
      de: 'Alte Datensätze löschen', 
      fr: 'Effacer les anciens enregistrements', 
      es: 'Limpiar registros antiguos', 
      'pt-BR': 'Limpar registros antigos' 
    }),
    areYouSure: t({ 
      en: 'Are you sure?', 
      de: 'Sind Sie sicher?', 
      fr: 'Êtes-vous sûr?', 
      es: '¿Está seguro?', 
      'pt-BR': 'Tem certeza?' 
    }),
    cleanupDialogDescription: t({ 
      en: 'This will permanently delete all backup records older than the selected cleanup period. This action cannot be undone.', 
      de: 'Dies löscht dauerhaft alle Sicherungsdatensätze, die älter als der ausgewählte Bereinigungszeitraum sind. Diese Aktion kann nicht rückgängig gemacht werden.', 
      fr: 'Cela supprimera définitivement tous les enregistrements de sauvegarde plus anciens que la période de nettoyage sélectionnée. Cette action ne peut pas être annulée.', 
      es: 'Esto eliminará permanentemente todos los registros de backup más antiguos que el período de limpieza seleccionado. Esta acción no se puede deshacer.', 
      'pt-BR': 'Isso excluirá permanentemente todos os registros de backup mais antigos que o período de limpeza selecionado. Esta ação não pode ser desfeita.' 
    }),
    continue: t({ 
      en: 'Continue', 
      de: 'Fortfahren', 
      fr: 'Continuer', 
      es: 'Continuar', 
      'pt-BR': 'Continuar' 
    }),
    cleanupDescription: t({ 
      en: 'This will remove all backup records older than the selected cleanup period. Manual action required - you must click the button to perform the cleanup.', 
      de: 'Dies entfernt alle Sicherungsdatensätze, die älter als der ausgewählte Bereinigungszeitraum sind. Manuelle Aktion erforderlich - Sie müssen auf die Schaltfläche klicken, um die Bereinigung durchzuführen.', 
      fr: 'Cela supprimera tous les enregistrements de sauvegarde plus anciens que la période de nettoyage sélectionnée. Action manuelle requise - vous devez cliquer sur le bouton pour effectuer le nettoyage.', 
      es: 'Esto eliminará todos los registros de backup más antiguos que el período de limpieza seleccionado. Se requiere acción manual: debe hacer clic en el botón para realizar la limpieza.', 
      'pt-BR': 'Isso removerá todos os registros de backup mais antigos que o período de limpeza selecionado. Ação manual necessária - você deve clicar no botão para realizar a limpeza.' 
    }),
    // Delete Backup Job
    deleteBackupJob: t({ 
      en: 'Delete Backup Job', 
      de: 'Sicherungsauftrag löschen', 
      fr: 'Supprimer le travail de sauvegarde', 
      es: 'Eliminar trabajo de backup', 
      'pt-BR': 'Excluir trabalho de backup' 
    }),
    selectBackupJob: t({ 
      en: 'Select backup job', 
      de: 'Sicherungsauftrag auswählen', 
      fr: 'Sélectionner le travail de sauvegarde', 
      es: 'Seleccionar trabajo de backup', 
      'pt-BR': 'Selecionar trabalho de backup' 
    }),
    selectBackupJobToDelete: t({ 
      en: 'Select backup job to delete', 
      de: 'Zu löschenden Sicherungsauftrag auswählen', 
      fr: 'Sélectionner le travail de sauvegarde à supprimer', 
      es: 'Seleccionar trabajo de backup a eliminar', 
      'pt-BR': 'Selecionar trabalho de backup para excluir' 
    }),
    selectBackupJobDescription: t({ 
      en: 'Select a backup job to delete all its backup records permanently.', 
      de: 'Wählen Sie einen Sicherungsauftrag aus, um alle zugehörigen Sicherungsdatensätze dauerhaft zu löschen.', 
      fr: 'Sélectionnez un travail de sauvegarde pour supprimer définitivement tous ses enregistrements de sauvegarde.', 
      es: 'Seleccione un trabajo de backup para eliminar permanentemente todos sus registros de backup.', 
      'pt-BR': 'Selecione um trabalho de backup para excluir permanentemente todos os seus registros de backup.' 
    }),
    deleting: t({ 
      en: 'Deleting...', 
      de: 'Wird gelöscht...', 
      fr: 'Suppression...', 
      es: 'Eliminando...', 
      'pt-BR': 'Excluindo...' 
    }),
    deleteBackupJobButton: t({ 
      en: 'Delete Backup Job', 
      de: 'Sicherungsauftrag löschen', 
      fr: 'Supprimer le travail de sauvegarde', 
      es: 'Eliminar trabajo de backup', 
      'pt-BR': 'Excluir trabalho de backup' 
    }),
    deleteBackupJobDialogTitle: t({ 
      en: 'Delete Backup Job?', 
      de: 'Sicherungsauftrag löschen?', 
      fr: 'Supprimer le travail de sauvegarde?', 
      es: '¿Eliminar trabajo de backup?', 
      'pt-BR': 'Excluir trabalho de backup?' 
    }),
    deleteBackupJobDialogDescription: t({ 
      en: 'This will permanently delete all backup records for "{backupName}" from server "{serverName}". This action cannot be undone.', 
      de: 'Dies löscht dauerhaft alle Sicherungsdatensätze für "{backupName}" vom Server "{serverName}". Diese Aktion kann nicht rückgängig gemacht werden.', 
      fr: 'Cela supprimera définitivement tous les enregistrements de sauvegarde pour "{backupName}" du serveur "{serverName}". Cette action ne peut pas être annulée.', 
      es: 'Esto eliminará permanentemente todos los registros de backup para "{backupName}" del servidor "{serverName}". Esta acción no se puede deshacer.', 
      'pt-BR': 'Isso excluirá permanentemente todos os registros de backup para "{backupName}" do servidor "{serverName}". Esta ação não pode ser desfeita.' 
    }),
    // Delete Server Data
    deleteServerData: t({ 
      en: 'Delete Server Data', 
      de: 'Serverdaten löschen', 
      fr: 'Supprimer les données du serveur', 
      es: 'Eliminar datos del servidor', 
      'pt-BR': 'Excluir dados do servidor' 
    }),
    selectServer: t({ 
      en: 'Select server', 
      de: 'Server auswählen', 
      fr: 'Sélectionner le serveur', 
      es: 'Seleccionar servidor', 
      'pt-BR': 'Selecionar servidor' 
    }),
    selectServerToDelete: t({ 
      en: 'Select server to delete', 
      de: 'Zu löschenden Server auswählen', 
      fr: 'Sélectionner le serveur à supprimer', 
      es: 'Seleccionar servidor a eliminar', 
      'pt-BR': 'Selecionar servidor para excluir' 
    }),
    selectServerDescription: t({ 
      en: 'Select a server to delete all its backup data permanently.', 
      de: 'Wählen Sie einen Server aus, um alle zugehörigen Sicherungsdaten dauerhaft zu löschen.', 
      fr: 'Sélectionnez un serveur pour supprimer définitivement toutes ses données de sauvegarde.', 
      es: 'Seleccione un servidor para eliminar permanentemente todos sus datos de backup.', 
      'pt-BR': 'Selecione um servidor para excluir permanentemente todos os seus dados de backup.' 
    }),
    deleteServerDataButton: t({ 
      en: 'Delete Server Data', 
      de: 'Serverdaten löschen', 
      fr: 'Supprimer les données du serveur', 
      es: 'Eliminar datos del servidor', 
      'pt-BR': 'Excluir dados do servidor' 
    }),
    deleteServerDataDialogTitle: t({ 
      en: 'Delete Server Data?', 
      de: 'Serverdaten löschen?', 
      fr: 'Supprimer les données du serveur?', 
      es: '¿Eliminar datos del servidor?', 
      'pt-BR': 'Excluir dados do servidor?' 
    }),
    deleteServerDataDialogDescription: t({ 
      en: 'This will permanently delete server "{serverName}" and all its backup records. This action cannot be undone.', 
      de: 'Dies löscht dauerhaft den Server "{serverName}" und alle zugehörigen Sicherungsdatensätze. Diese Aktion kann nicht rückgängig gemacht werden.', 
      fr: 'Cela supprimera définitivement le serveur "{serverName}" et tous ses enregistrements de sauvegarde. Cette action ne peut pas être annulée.', 
      es: 'Esto eliminará permanentemente el servidor "{serverName}" y todos sus registros de backup. Esta acción no se puede deshacer.', 
      'pt-BR': 'Isso excluirá permanentemente o servidor "{serverName}" e todos os seus registros de backup. Esta ação não pode ser desfeita.' 
    }),
    deleteServer: t({ 
      en: 'Delete Server', 
      de: 'Server löschen', 
      fr: 'Supprimer le serveur', 
      es: 'Eliminar servidor', 
      'pt-BR': 'Excluir servidor' 
    }),
    // Merge Duplicate Servers
    mergeDuplicateServers: t({ 
      en: 'Merge Duplicate Servers', 
      de: 'Doppelte Server zusammenführen', 
      fr: 'Fusionner les serveurs en double', 
      es: 'Fusionar servidores duplicados', 
      'pt-BR': 'Mesclar servidores duplicados' 
    }),
    mergeDuplicateServersDescription: t({ 
      en: 'Select server groups to merge. These servers have the same name but different IDs.', 
      de: 'Wählen Sie Servergruppen zum Zusammenführen aus. Diese Server haben denselben Namen, aber unterschiedliche IDs.', 
      fr: 'Sélectionnez les groupes de serveurs à fusionner. Ces serveurs ont le même nom mais des ID différents.', 
      es: 'Seleccione grupos de servidores para fusionar. Estos servidores tienen el mismo nombre pero diferentes ID.', 
      'pt-BR': 'Selecione grupos de servidores para mesclar. Esses servidores têm o mesmo nome, mas IDs diferentes.' 
    }),
    duplicateServersInfo: t({ 
      en: 'Duplicati\'s machine-id can be changed after an upgrade or reinstall.\nAll backup logs and configurations will be transferred to the target servers.', 
      de: 'Die Maschinen-ID von Duplicati kann nach einem Upgrade oder einer Neuinstallation geändert werden.\nAlle Sicherungsprotokolle und Konfigurationen werden auf die Zielserver übertragen.', 
      fr: 'L\'ID machine de Duplicati peut être modifié après une mise à niveau ou une réinstallation.\nTous les journaux de sauvegarde et configurations seront transférés vers les serveurs cibles.', 
      es: 'El ID de máquina de Duplicati puede cambiar después de una actualización o reinstalación.\nTodos los registros de backup y configuraciones se transferirán a los servidores objetivo.', 
      'pt-BR': 'O ID da máquina do Duplicati pode ser alterado após uma atualização ou reinstalação.\nTodos os logs de backup e configurações serão transferidos para os servidores de destino.' 
    }),
    serverName: t({ 
      en: 'Server Name:', 
      de: 'Servername:', 
      fr: 'Nom du serveur:', 
      es: 'Nombre del servidor:', 
      'pt-BR': 'Nome do servidor:' 
    }),
    targetServerNewest: t({ 
      en: 'Target Server (newest)', 
      de: 'Zielserver (neueste)', 
      fr: 'Serveur cible (le plus récent)', 
      es: 'Servidor objetivo (más reciente)', 
      'pt-BR': 'Servidor de destino (mais recente)' 
    }),
    oldServerId: t({ 
      en: 'Old Server ID', 
      de: 'Alte Server-ID', 
      fr: 'Ancien ID de serveur', 
      es: 'ID de servidor antiguo', 
      'pt-BR': 'ID do servidor antigo' 
    }),
    created: t({ 
      en: 'Created:', 
      de: 'Erstellt:', 
      fr: 'Créé:', 
      es: 'Creado:', 
      'pt-BR': 'Criado:' 
    }),
    alias: t({ 
      en: 'Alias:', 
      de: 'Alias:', 
      fr: 'Alias:', 
      es: 'Alias:', 
      'pt-BR': 'Alias:' 
    }),
    none: t({ 
      en: 'None', 
      de: 'Keine', 
      fr: 'Aucun', 
      es: 'Ninguno', 
      'pt-BR': 'Nenhum' 
    }),
    invalidDate: t({ 
      en: 'Invalid Date', 
      de: 'Ungültiges Datum', 
      fr: 'Date invalide', 
      es: 'Fecha inválida', 
      'pt-BR': 'Data inválida' 
    }),
    merging: t({ 
      en: 'Merging...', 
      de: 'Wird zusammengeführt...', 
      fr: 'Fusion...', 
      es: 'Fusionando...', 
      'pt-BR': 'Mesclando...' 
    }),
    mergeSelectedServers: t({ 
      en: 'Merge Selected Servers ({count})', 
      de: 'Ausgewählte Server zusammenführen ({count})', 
      fr: 'Fusionner les serveurs sélectionnés ({count})', 
      es: 'Fusionar servidores seleccionados ({count})', 
      'pt-BR': 'Mesclar servidores selecionados ({count})' 
    }),
    mergeDuplicateServersDialogTitle: t({ 
      en: 'Merge Duplicate Servers?', 
      de: 'Doppelte Server zusammenführen?', 
      fr: 'Fusionner les serveurs en double?', 
      es: '¿Fusionar servidores duplicados?', 
      'pt-BR': 'Mesclar servidores duplicados?' 
    }),
    mergeDuplicateServersDialogDescription: t({ 
      en: 'This will merge {count} server group(s). For each group, all old server IDs will be merged into the target server (newest by creation date). All backup records and configurations will be transferred to the target servers. The old server entries will be deleted. This action cannot be undone.', 
      de: 'Dies führt {count} Servergruppe(n) zusammen. Für jede Gruppe werden alle alten Server-IDs in den Zielserver (neueste nach Erstellungsdatum) zusammengeführt. Alle Sicherungsdatensätze und Konfigurationen werden auf die Zielserver übertragen. Die alten Servereinträge werden gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.', 
      fr: 'Cela fusionnera {count} groupe(s) de serveurs. Pour chaque groupe, tous les anciens ID de serveur seront fusionnés dans le serveur cible (le plus récent par date de création). Tous les enregistrements de sauvegarde et configurations seront transférés vers les serveurs cibles. Les anciennes entrées de serveur seront supprimées. Cette action ne peut pas être annulée.', 
      es: 'Esto fusionará {count} grupo(s) de servidores. Para cada grupo, todos los ID de servidor antiguos se fusionarán en el servidor objetivo (más reciente por fecha de creación). Todos los registros de backup y configuraciones se transferirán a los servidores objetivo. Las entradas antiguas del servidor se eliminarán. Esta acción no se puede deshacer.', 
      'pt-BR': 'Isso mesclará {count} grupo(s) de servidores. Para cada grupo, todos os IDs de servidor antigos serão mesclados no servidor de destino (mais recente por data de criação). Todos os registros de backup e configurações serão transferidos para os servidores de destino. As entradas antigas do servidor serão excluídas. Esta ação não pode ser desfeita.' 
    }),
    mergeServers: t({ 
      en: 'Merge Servers', 
      de: 'Server zusammenführen', 
      fr: 'Fusionner les serveurs', 
      es: 'Fusionar servidores', 
      'pt-BR': 'Mesclar servidores' 
    }),
    duplicateServers: t({ 
      en: 'Duplicate Servers', 
      de: 'Doppelte Server', 
      fr: 'Serveurs en double', 
      es: 'Servidores duplicados', 
      'pt-BR': 'Servidores duplicados' 
    }),
    noDuplicateServersFound: t({ 
      en: 'No duplicate servers found. All servers have unique names.', 
      de: 'Keine doppelten Server gefunden. Alle Server haben eindeutige Namen.', 
      fr: 'Aucun serveur en double trouvé. Tous les serveurs ont des noms uniques.', 
      es: 'No se encontraron servidores duplicados. Todos los servidores tienen nombres únicos.', 
      'pt-BR': 'Nenhum servidor duplicado encontrado. Todos os servidores têm nomes únicos.' 
    }),
    // Toast messages
    databaseCleaned: t({ 
      en: 'Database cleaned', 
      de: 'Datenbank bereinigt', 
      fr: 'Base de données nettoyée', 
      es: 'Base de datos limpiada', 
      'pt-BR': 'Banco de dados limpo' 
    }),
    oldRecordsRemoved: t({ 
      en: 'Old records have been successfully removed.', 
      de: 'Alte Datensätze wurden erfolgreich entfernt.', 
      fr: 'Les anciens enregistrements ont été supprimés avec succès.', 
      es: 'Los registros antiguos se han eliminado exitosamente.', 
      'pt-BR': 'Os registros antigos foram removidos com sucesso.' 
    }),
    databaseCleanupFailed: t({ 
      en: 'Database Cleanup Failed', 
      de: 'Datenbankbereinigung fehlgeschlagen', 
      fr: 'Échec du nettoyage de la base de données', 
      es: 'Error en la limpieza de base de datos', 
      'pt-BR': 'Falha na limpeza do banco de dados' 
    }),
    serverDeleted: t({ 
      en: 'Server "{serverName}" deleted', 
      de: 'Server "{serverName}" gelöscht', 
      fr: 'Serveur "{serverName}" supprimé', 
      es: 'Servidor "{serverName}" eliminado', 
      'pt-BR': 'Servidor "{serverName}" excluído' 
    }),
    serverDeletionFailed: t({ 
      en: 'Server "{serverName}" Deletion Failed', 
      de: 'Löschen des Servers "{serverName}" fehlgeschlagen', 
      fr: 'Échec de la suppression du serveur "{serverName}"', 
      es: 'Error al eliminar servidor "{serverName}"', 
      'pt-BR': 'Falha ao excluir servidor "{serverName}"' 
    }),
    failedToDeleteServer: t({ 
      en: 'Failed to delete server. Please try again.', 
      de: 'Fehler beim Löschen des Servers. Bitte versuchen Sie es erneut.', 
      fr: 'Échec de la suppression du serveur. Veuillez réessayer.', 
      es: 'Error al eliminar servidor. Por favor, intente de nuevo.', 
      'pt-BR': 'Falha ao excluir servidor. Por favor, tente novamente.' 
    }),
    backupJobDeleted: t({ 
      en: 'Backup Job "{backupName}" deleted', 
      de: 'Sicherungsauftrag "{backupName}" gelöscht', 
      fr: 'Travail de sauvegarde "{backupName}" supprimé', 
      es: 'Trabajo de backup "{backupName}" eliminado', 
      'pt-BR': 'Trabalho de backup "{backupName}" excluído' 
    }),
    backupJobDeletionFailed: t({ 
      en: 'Backup Job "{backupName}" Deletion Failed', 
      de: 'Löschen des Sicherungsauftrags "{backupName}" fehlgeschlagen', 
      fr: 'Échec de la suppression du travail de sauvegarde "{backupName}"', 
      es: 'Error al eliminar trabajo de backup "{backupName}"', 
      'pt-BR': 'Falha ao excluir trabalho de backup "{backupName}"' 
    }),
    failedToDeleteBackupJob: t({ 
      en: 'Failed to delete backup job. Please try again.', 
      de: 'Fehler beim Löschen des Sicherungsauftrags. Bitte versuchen Sie es erneut.', 
      fr: 'Échec de la suppression du travail de sauvegarde. Veuillez réessayer.', 
      es: 'Error al eliminar trabajo de backup. Por favor, intente de nuevo.', 
      'pt-BR': 'Falha ao excluir trabalho de backup. Por favor, tente novamente.' 
    }),
    backupCreated: t({ 
      en: 'Backup created', 
      de: 'Sicherung erstellt', 
      fr: 'Sauvegarde créée', 
      es: 'Backup creado', 
      'pt-BR': 'Backup criado' 
    }),
    databaseBackupDownloadedSuccessfully: t({ 
      en: 'Database backup downloaded successfully as {filename}', 
      de: 'Datenbanksicherung erfolgreich als {filename} heruntergeladen', 
      fr: 'Sauvegarde de la base de données téléchargée avec succès sous {filename}', 
      es: 'Backup de base de datos descargado exitosamente como {filename}', 
      'pt-BR': 'Backup do banco de dados baixado com sucesso como {filename}' 
    }),
    backupFailed: t({ 
      en: 'Backup Failed', 
      de: 'Sicherung fehlgeschlagen', 
      fr: 'Échec de la sauvegarde', 
      es: 'Error en el backup', 
      'pt-BR': 'Falha no backup' 
    }),
    failedToCreateBackup: t({ 
      en: 'Failed to create backup. Please try again.', 
      de: 'Fehler beim Erstellen der Sicherung. Bitte versuchen Sie es erneut.', 
      fr: 'Échec de la création de la sauvegarde. Veuillez réessayer.', 
      es: 'Error al crear backup. Por favor, intente de nuevo.', 
      'pt-BR': 'Falha ao criar backup. Por favor, tente novamente.' 
    }),
    noFileSelected: t({ 
      en: 'No file selected', 
      de: 'Keine Datei ausgewählt', 
      fr: 'Aucun fichier sélectionné', 
      es: 'No se seleccionó ningún archivo', 
      'pt-BR': 'Nenhum arquivo selecionado' 
    }),
    pleaseSelectBackupFile: t({ 
      en: 'Please select a database backup file to restore.', 
      de: 'Bitte wählen Sie eine Datenbanksicherungsdatei zur Wiederherstellung aus.', 
      fr: 'Veuillez sélectionner un fichier de sauvegarde de base de données à restaurer.', 
      es: 'Por favor, seleccione un archivo de backup de base de datos para restaurar.', 
      'pt-BR': 'Por favor, selecione um arquivo de backup do banco de dados para restaurar.' 
    }),
    databaseRestored: t({ 
      en: 'Database restored', 
      de: 'Datenbank wiederhergestellt', 
      fr: 'Base de données restaurée', 
      es: 'Base de datos restaurada', 
      'pt-BR': 'Banco de dados restaurado' 
    }),
    databaseRestoredSuccessfully: t({ 
      en: 'Database restored successfully', 
      de: 'Datenbank erfolgreich wiederhergestellt', 
      fr: 'Base de données restaurée avec succès', 
      es: 'Base de datos restaurada exitosamente', 
      'pt-BR': 'Banco de dados restaurado com sucesso' 
    }),
    youWillNeedToLoginAgain: t({ 
      en: 'You will need to log in again.', 
      de: 'Sie müssen sich erneut anmelden.', 
      fr: 'Vous devrez vous reconnecter.', 
      es: 'Necesitará iniciar sesión nuevamente.', 
      'pt-BR': 'Você precisará fazer login novamente.' 
    }),
    restoreFailed: t({ 
      en: 'Restore Failed', 
      de: 'Wiederherstellung fehlgeschlagen', 
      fr: 'Échec de la restauration', 
      es: 'Error en la restauración', 
      'pt-BR': 'Falha na restauração' 
    }),
    failedToRestoreDatabase: t({ 
      en: 'Failed to restore database. Please try again.', 
      de: 'Fehler beim Wiederherstellen der Datenbank. Bitte versuchen Sie es erneut.', 
      fr: 'Échec de la restauration de la base de données. Veuillez réessayer.', 
      es: 'Error al restaurar base de datos. Por favor, intente de nuevo.', 
      'pt-BR': 'Falha ao restaurar banco de dados. Por favor, tente novamente.' 
    }),
    noServersSelected: t({ 
      en: 'No servers selected', 
      de: 'Keine Server ausgewählt', 
      fr: 'Aucun serveur sélectionné', 
      es: 'No se seleccionaron servidores', 
      'pt-BR': 'Nenhum servidor selecionado' 
    }),
    pleaseSelectAtLeastOneServerGroup: t({ 
      en: 'Please select at least one server group to merge.', 
      de: 'Bitte wählen Sie mindestens eine Servergruppe zum Zusammenführen aus.', 
      fr: 'Veuillez sélectionner au moins un groupe de serveurs à fusionner.', 
      es: 'Por favor, seleccione al menos un grupo de servidores para fusionar.', 
      'pt-BR': 'Por favor, selecione pelo menos um grupo de servidores para mesclar.' 
    }),
    serversMergedSuccessfully: t({ 
      en: 'Servers merged successfully', 
      de: 'Server erfolgreich zusammengeführt', 
      fr: 'Serveurs fusionnés avec succès', 
      es: 'Servidores fusionados exitosamente', 
      'pt-BR': 'Servidores mesclados com sucesso' 
    }),
    successfullyMergedServers: t({ 
      en: 'Successfully merged {totalMerged} server(s) across {groupCount} server group(s).', 
      de: '{totalMerged} Server erfolgreich über {groupCount} Servergruppe(n) zusammengeführt.', 
      fr: '{totalMerged} serveur(s) fusionné(s) avec succès sur {groupCount} groupe(s) de serveurs.', 
      es: '{totalMerged} servidor(es) fusionado(s) exitosamente en {groupCount} grupo(s) de servidores.', 
      'pt-BR': '{totalMerged} servidor(es) mesclado(s) com sucesso em {groupCount} grupo(s) de servidores.' 
    }),
    mergeFailed: t({ 
      en: 'Merge Failed', 
      de: 'Zusammenführung fehlgeschlagen', 
      fr: 'Échec de la fusion', 
      es: 'Error en la fusión', 
      'pt-BR': 'Falha na mesclagem' 
    }),
    failedToMergeServers: t({ 
      en: 'Failed to merge servers. Please try again.', 
      de: 'Fehler beim Zusammenführen der Server. Bitte versuchen Sie es erneut.', 
      fr: 'Échec de la fusion des serveurs. Veuillez réessayer.', 
      es: 'Error al fusionar servidores. Por favor, intente de nuevo.', 
      'pt-BR': 'Falha ao mesclar servidores. Por favor, tente novamente.' 
    }),
    // Common
    cancel: t({ 
      en: 'Cancel', 
      de: 'Abbrechen', 
      fr: 'Annuler', 
      es: 'Cancelar', 
      'pt-BR': 'Cancelar' 
    }),
    unknownServer: t({ 
      en: 'Unknown Server', 
      de: 'Unbekannter Server', 
      fr: 'Serveur inconnu', 
      es: 'Servidor desconocido', 
      'pt-BR': 'Servidor desconhecido' 
    }),
    unknownBackup: t({ 
      en: 'Unknown Backup', 
      de: 'Unbekannte Sicherung', 
      fr: 'Sauvegarde inconnue', 
      es: 'Backup desconocido', 
      'pt-BR': 'Backup desconhecido' 
    }),
  },
} satisfies Dictionary;
