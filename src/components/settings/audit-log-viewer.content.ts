import { t, type Dictionary } from 'intlayer';

export default {
  key: 'audit-log-viewer',
  content: {
    title: t({ 
      en: 'Audit Log', 
      de: 'Audit-Log', 
      fr: 'Journal d\'Audit', 
      es: 'Log de Auditoría', 
      'pt-BR': 'Log de Auditoria' 
    }),
    description: t({ 
      en: 'View application audit log entries', 
      de: 'Anwendungs-Audit-Log-Einträge anzeigen', 
      fr: 'Afficher les entrées du journal d\'audit de l\'application', 
      es: 'Ver entradas del registro de auditoría de la aplicación', 
      'pt-BR': 'Ver entradas do registro de auditoria do aplicativo' 
    }),
    retention: t({ 
      en: 'Log Retention', 
      de: 'Protokollaufbewahrung', 
      fr: 'Rétention des journaux', 
      es: 'Retención de registros', 
      'pt-BR': 'Retenção de registros' 
    }),
    // Header
    auditLogViewer: t({ 
      en: 'Audit Log Viewer', 
      de: 'Audit-Log-Viewer', 
      fr: 'Visualiseur de journal d\'audit', 
      es: 'Visor de registro de auditoría', 
      'pt-BR': 'Visualizador de registro de auditoria' 
    }),
    // 'refresh' is now available in common.ui.refresh
    refreshAuditLogs: t({ 
      en: 'Refresh audit logs', 
      de: 'Audit-Logs aktualisieren', 
      fr: 'Actualiser les journaux d\'audit', 
      es: 'Actualizar registros de auditoría', 
      'pt-BR': 'Atualizar registros de auditoria' 
    }),
    // Filters
    auditLogViewerFilters: t({ 
      en: 'Audit Log Viewer - Filters', 
      de: 'Prüfprotokoll-Viewer - Filter', 
      fr: 'Visualiseur de journal d\'audit - Filtres', 
      es: 'Visor de registro de auditoría - Filtros', 
      'pt-BR': 'Visualizador de registro de auditoria - Filtros' 
    }),
    reset: t({ 
      en: 'Reset', 
      de: 'Zurücksetzen', 
      fr: 'Réinitialiser', 
      es: 'Restablecer', 
      'pt-BR': 'Redefinir' 
    }),
    csv: t({ 
      en: 'CSV', 
      de: 'CSV', 
      fr: 'CSV', 
      es: 'CSV', 
      'pt-BR': 'CSV' 
    }),
    json: t({ 
      en: 'JSON', 
      de: 'JSON', 
      fr: 'JSON', 
      es: 'JSON', 
      'pt-BR': 'JSON' 
    }),
    startDate: t({ 
      en: 'Start Date', 
      de: 'Startdatum', 
      fr: 'Date de début', 
      es: 'Fecha de inicio', 
      'pt-BR': 'Data de início' 
    }),
    endDate: t({ 
      en: 'End Date', 
      de: 'Enddatum', 
      fr: 'Date de fin', 
      es: 'Fecha de fin', 
      'pt-BR': 'Data de término' 
    }),
    username: t({ 
      en: 'Username', 
      de: 'Benutzername', 
      fr: 'Nom d\'utilisateur', 
      es: 'Nombre de usuario', 
      'pt-BR': 'Nome de usuário' 
    }),
    action: t({ 
      en: 'Action', 
      de: 'Aktion', 
      fr: 'Action', 
      es: 'Acción', 
      'pt-BR': 'Ação' 
    }),
    category: t({ 
      en: 'Category', 
      de: 'Kategorie', 
      fr: 'Catégorie', 
      es: 'Categoría', 
      'pt-BR': 'Categoria' 
    }),
    status: t({ 
      en: 'Status', 
      de: 'Status', 
      fr: 'Statut', 
      es: 'Estado', 
      'pt-BR': 'Status' 
    }),
    filterByUsername: t({ 
      en: 'Filter by username', 
      de: 'Nach Benutzername filtern', 
      fr: 'Filtrer par nom d\'utilisateur', 
      es: 'Filtrar por nombre de usuario', 
      'pt-BR': 'Filtrar por nome de usuário' 
    }),
    allActions: t({ 
      en: 'All actions', 
      de: 'Alle Aktionen', 
      fr: 'Toutes les actions', 
      es: 'Todas las acciones', 
      'pt-BR': 'Todas as ações' 
    }),
    allCategories: t({ 
      en: 'All categories', 
      de: 'Alle Kategorien', 
      fr: 'Toutes les catégories', 
      es: 'Todas las categorías', 
      'pt-BR': 'Todas as categorias' 
    }),
    allStatuses: t({ 
      en: 'All statuses', 
      de: 'Alle Status', 
      fr: 'Tous les statuts', 
      es: 'Todos los estados', 
      'pt-BR': 'Todos os status' 
    }),
    // Loading and empty states
    loadingAuditLogs: t({ 
      en: 'Loading audit logs...', 
      de: 'Audit-Logs werden geladen...', 
      fr: 'Chargement des journaux d\'audit...', 
      es: 'Cargando registros de auditoría...', 
      'pt-BR': 'Carregando registros de auditoria...' 
    }),
    noAuditLogsFound: t({ 
      en: 'No audit logs found', 
      de: 'Keine Audit-Logs gefunden', 
      fr: 'Aucun journal d\'audit trouvé', 
      es: 'No se encontraron registros de auditoría', 
      'pt-BR': 'Nenhum registro de auditoria encontrado' 
    }),
    // Table headers
    tableNumber: t({ 
      en: '#', 
      de: '#', 
      fr: '#', 
      es: '#', 
      'pt-BR': '#' 
    }),
    timestamp: t({ 
      en: 'Timestamp', 
      de: 'Zeitstempel', 
      fr: 'Horodatage', 
      es: 'Marca de tiempo', 
      'pt-BR': 'Data e hora' 
    }),
    user: t({ 
      en: 'User', 
      de: 'Benutzer', 
      fr: 'Utilisateur', 
      es: 'Usuario', 
      'pt-BR': 'Usuário' 
    }),
    actionHeader: t({ 
      en: 'Action', 
      de: 'Aktion', 
      fr: 'Action', 
      es: 'Acción', 
      'pt-BR': 'Ação' 
    }),
    categoryHeader: t({ 
      en: 'Category', 
      de: 'Kategorie', 
      fr: 'Catégorie', 
      es: 'Categoría', 
      'pt-BR': 'Categoria' 
    }),
    statusHeader: t({ 
      en: 'Status', 
      de: 'Status', 
      fr: 'Statut', 
      es: 'Estado', 
      'pt-BR': 'Status' 
    }),
    target: t({ 
      en: 'Target', 
      de: 'Ziel', 
      fr: 'Cible', 
      es: 'Objetivo', 
      'pt-BR': 'Destino' 
    }),
    actions: t({ 
      en: 'Actions', 
      de: 'Aktionen', 
      fr: 'Actions', 
      es: 'Acciones', 
      'pt-BR': 'Ações' 
    }),
    // Table content
    system: t({ 
      en: 'System', 
      de: 'System', 
      fr: 'Système', 
      es: 'Sistema', 
      'pt-BR': 'Sistema' 
    }),
    viewDetails: t({ 
      en: 'View details', 
      de: 'Details anzeigen', 
      fr: 'Voir les détails', 
      es: 'Ver detalles', 
      'pt-BR': 'Ver detalhes' 
    }),
    loadingMore: t({ 
      en: 'Loading more...', 
      de: 'Lade weitere...', 
      fr: 'Chargement de plus...', 
      es: 'Cargando más...', 
      'pt-BR': 'Carregando mais...' 
    }),
    noMoreLogsToLoad: t({ 
      en: 'No more logs to load', 
      de: 'Keine weiteren Protokolle zu laden', 
      fr: 'Aucun autre journal à charger', 
      es: 'No hay más registros para cargar', 
      'pt-BR': 'Não há mais registros para carregar' 
    }),
    // Pagination
    loadedXOfYTotal: t({ 
      en: 'Loaded {loaded} of {total} total ({percentage}% loaded)', 
      de: '{loaded} von {total} insgesamt geladen ({percentage}% geladen)', 
      fr: '{loaded} sur {total} au total chargés ({percentage}% chargés)', 
      es: '{loaded} de {total} total cargados ({percentage}% cargados)', 
      'pt-BR': '{loaded} de {total} total carregados ({percentage}% carregados)' 
    }),
    noLogsAvailable: t({ 
      en: 'No logs available', 
      de: 'Keine Protokolle verfügbar', 
      fr: 'Aucun journal disponible', 
      es: 'No hay registros disponibles', 
      'pt-BR': 'Nenhum registro disponível' 
    }),
    resetToTop: t({ 
      en: 'Reset to Top', 
      de: 'Zum Anfang zurücksetzen', 
      fr: 'Réinitialiser en haut', 
      es: 'Restablecer al inicio', 
      'pt-BR': 'Redefinir para o topo' 
    }),
    // Dialog
    auditLogDetails: t({ 
      en: 'Audit Log Details', 
      de: 'Audit-Log-Details', 
      fr: 'Détails du journal d\'audit', 
      es: 'Detalles del registro de auditoría', 
      'pt-BR': 'Detalhes do registro de auditoria' 
    }),
    completeInformationForAuditLogEntry: t({ 
      en: 'Complete information for audit log entry #{id}', 
      de: 'Vollständige Informationen für Audit-Log-Eintrag #{id}', 
      fr: 'Informations complètes pour l\'entrée du journal d\'audit #{id}', 
      es: 'Información completa para la entrada del registro de auditoría #{id}', 
      'pt-BR': 'Informações completas para a entrada do registro de auditoria #{id}' 
    }),
    // Dialog field labels
    timestampLabel: t({ 
      en: 'Timestamp', 
      de: 'Zeitstempel', 
      fr: 'Horodatage', 
      es: 'Marca de tiempo', 
      'pt-BR': 'Data e hora' 
    }),
    statusLabel: t({ 
      en: 'Status', 
      de: 'Status', 
      fr: 'Statut', 
      es: 'Estado', 
      'pt-BR': 'Status' 
    }),
    userLabel: t({ 
      en: 'User', 
      de: 'Benutzer', 
      fr: 'Utilisateur', 
      es: 'Usuario', 
      'pt-BR': 'Usuário' 
    }),
    categoryLabel: t({ 
      en: 'Category', 
      de: 'Kategorie', 
      fr: 'Catégorie', 
      es: 'Categoría', 
      'pt-BR': 'Categoria' 
    }),
    actionLabel: t({ 
      en: 'Action', 
      de: 'Aktion', 
      fr: 'Action', 
      es: 'Acción', 
      'pt-BR': 'Ação' 
    }),
    ipAddress: t({ 
      en: 'IP Address', 
      de: 'IP-Adresse', 
      fr: 'Adresse IP', 
      es: 'Dirección IP', 
      'pt-BR': 'Endereço IP' 
    }),
    targetType: t({ 
      en: 'Target Type', 
      de: 'Zieltyp', 
      fr: 'Type de cible', 
      es: 'Tipo de objetivo', 
      'pt-BR': 'Tipo de destino' 
    }),
    targetId: t({ 
      en: 'Target ID', 
      de: 'Ziel-ID', 
      fr: 'ID de cible', 
      es: 'ID de objetivo', 
      'pt-BR': 'ID do destino' 
    }),
    userAgent: t({ 
      en: 'User Agent', 
      de: 'User-Agent', 
      fr: 'Agent utilisateur', 
      es: 'Agente de usuario', 
      'pt-BR': 'Agente do usuário' 
    }),
    details: t({ 
      en: 'Details', 
      de: 'Details', 
      fr: 'Détails', 
      es: 'Detalles', 
      'pt-BR': 'Detalhes' 
    }),
    errorMessage: t({ 
      en: 'Error Message', 
      de: 'Fehlermeldung', 
      fr: 'Message d\'erreur', 
      es: 'Mensaje de error', 
      'pt-BR': 'Mensagem de erro' 
    }),
    // Status badges
    // 'success' is now available in common.status.success
    failure: t({ 
      en: 'Failure', 
      de: 'Fehler', 
      fr: 'Échec', 
      es: 'Fallo', 
      'pt-BR': 'Falha' 
    }),
    // 'error' is now available in common.status.error
    // Toast messages
    failedToLoadAuditLogs: t({ 
      en: 'Failed to load audit logs', 
      de: 'Fehler beim Laden der Audit-Logs', 
      fr: 'Échec du chargement des journaux d\'audit', 
      es: 'Error al cargar registros de auditoría', 
      'pt-BR': 'Falha ao carregar registros de auditoria' 
    }),
    failedToLoadMoreAuditLogs: t({ 
      en: 'Failed to load more audit logs', 
      de: 'Fehler beim Laden weiterer Prüfprotokolle', 
      fr: 'Échec du chargement de plus de journaux d\'audit', 
      es: 'Error al cargar más registros de auditoría', 
      'pt-BR': 'Falha ao carregar mais registros de auditoria' 
    }),
    failedToLoadFilterValues: t({ 
      en: 'Failed to load filter values. Using loaded records only.', 
      de: 'Fehler beim Laden der Filterwerte. Verwende nur geladene Datensätze.', 
      fr: 'Échec du chargement des valeurs de filtre. Utilisation uniquement des enregistrements chargés.', 
      es: 'Error al cargar valores de filtro. Usando solo registros cargados.', 
      'pt-BR': 'Falha ao carregar valores de filtro. Usando apenas registros carregados.' 
    }),
    auditLogDownloadedAs: t({ 
      en: 'Audit log downloaded as {format}', 
      de: 'Audit-Log als {format} heruntergeladen', 
      fr: 'Journal d\'audit téléchargé au format {format}', 
      es: 'Registro de auditoría descargado como {format}', 
      'pt-BR': 'Registro de auditoria baixado como {format}' 
    }),
    failedToDownloadAuditLogs: t({ 
      en: 'Failed to download audit logs', 
      de: 'Fehler beim Herunterladen der Prüfprotokolle', 
      fr: 'Échec du téléchargement des journaux d\'audit', 
      es: 'Error al descargar registros de auditoría', 
      'pt-BR': 'Falha ao baixar registros de auditoria' 
    }),
  },
} satisfies Dictionary;
