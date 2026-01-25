import { t, type Dictionary } from 'intlayer';

export default {
  key: 'application-logs-viewer',
  content: {
    title: t({ 
      en: 'Application Logs Viewer', 
      de: 'Anwendungsprotokoll-Viewer', 
      fr: 'Visualiseur de journaux d\'application', 
      es: 'Visor de Logs de aplicación', 
      'pt-BR': 'Visualizador de logs do aplicativo' 
    }),
    refreshLogs: t({ 
      en: 'Refresh logs', 
      de: 'Protokolle aktualisieren', 
      fr: 'Actualiser les journaux', 
      es: 'Actualizar logs', 
      'pt-BR': 'Atualizar logs' 
    }),
    refresh: t({ 
      en: 'Refresh', 
      de: 'Aktualisieren', 
      fr: 'Actualiser', 
      es: 'Actualizar', 
      'pt-BR': 'Atualizar' 
    }),
    fileVersion: t({ 
      en: 'File Version', 
      de: 'Dateiversion', 
      fr: 'Version du fichier', 
      es: 'Versión del archivo', 
      'pt-BR': 'Versão do arquivo' 
    }),
    current: t({ 
      en: 'Current', 
      de: 'Aktuell', 
      fr: 'Actuel', 
      es: 'Actual', 
      'pt-BR': 'Atual' 
    }),
    search: t({ 
      en: 'Search', 
      de: 'Suchen', 
      fr: 'Rechercher', 
      es: 'Buscar', 
      'pt-BR': 'Pesquisar' 
    }),
    searchPlaceholder: t({ 
      en: 'Filter by text (case-insensitive)', 
      de: 'Nach Text filtern (Groß-/Kleinschreibung ignorieren)', 
      fr: 'Filtrer par texte (insensible à la casse)', 
      es: 'Filtrar por texto (sin distinción de mayúsculas y minúsculas)', 
      'pt-BR': 'Filtrar por texto (sem distinção entre maiúsculas e minúsculas)' 
    }),
    clearSearch: t({ 
      en: 'Clear search', 
      de: 'Suche löschen', 
      fr: 'Effacer la recherche', 
      es: 'Limpiar búsqueda', 
      'pt-BR': 'Limpar pesquisa' 
    }),
    linesToShow: t({ 
      en: 'Lines to Show', 
      de: 'Anzuzeigende Zeilen', 
      fr: 'Lignes à afficher', 
      es: 'Líneas a mostrar', 
      'pt-BR': 'Linhas para mostrar' 
    }),
    autoScroll: t({ 
      en: 'Auto-scroll', 
      de: 'Automatisches Scrollen', 
      fr: 'Défilement automatique', 
      es: 'Desplazamiento automático', 
      'pt-BR': 'Rolagem automática' 
    }),
    enableAutoScroll: t({ 
      en: 'Enable auto-scroll', 
      de: 'Automatisches Scrollen aktivieren', 
      fr: 'Activer le défilement automatique', 
      es: 'Habilitar desplazamiento automático', 
      'pt-BR': 'Habilitar rolagem automática' 
    }),
    copy: t({ 
      en: 'Copy', 
      de: 'Kopieren', 
      fr: 'Copier', 
      es: 'Copiar', 
      'pt-BR': 'Copiar' 
    }),
    download: t({ 
      en: 'Download', 
      de: 'Herunterladen', 
      fr: 'Télécharger', 
      es: 'Descargar', 
      'pt-BR': 'Baixar' 
    }),
    loadingLogs: t({ 
      en: 'Loading logs...', 
      de: 'Protokolle werden geladen...', 
      fr: 'Chargement des journaux...', 
      es: 'Cargando logs...', 
      'pt-BR': 'Carregando logs...' 
    }),
    noLogsMatch: t({ 
      en: 'No logs match the current filters', 
      de: 'Keine Protokolle entsprechen den aktuellen Filtern', 
      fr: 'Aucun journal ne correspond aux filtres actuels', 
      es: 'Ningún log coincide con los filtros actuales', 
      'pt-BR': 'Nenhum log corresponde aos filtros atuais' 
    }),
    noLogsAvailable: t({ 
      en: 'No logs available', 
      de: 'Keine Protokolle verfügbar', 
      fr: 'Aucun journal disponible', 
      es: 'No hay logs disponibles', 
      'pt-BR': 'Nenhum log disponível' 
    }),
    showingLines: t({ 
      en: 'Showing {filtered} of {total} lines', 
      de: 'Zeige {filtered} von {total} Zeilen', 
      fr: 'Affichage de {filtered} sur {total} lignes', 
      es: 'Mostrando {filtered} de {total} líneas', 
      'pt-BR': 'Mostrando {filtered} de {total} linhas' 
    }),
    scrollToTop: t({ 
      en: 'Scroll to top', 
      de: 'Nach oben scrollen', 
      fr: 'Défiler vers le haut', 
      es: 'Desplazarse hacia arriba', 
      'pt-BR': 'Rolar para o topo' 
    }),
    scrollToBottom: t({ 
      en: 'Scroll to bottom', 
      de: 'Nach unten scrollen', 
      fr: 'Défiler vers le bas', 
      es: 'Desplazarse hacia abajo', 
      'pt-BR': 'Rolar para baixo' 
    }),
    lastModified: t({ 
      en: 'Last modified:', 
      de: 'Zuletzt geändert:', 
      fr: 'Dernière modification:', 
      es: 'Última modificación:', 
      'pt-BR': 'Última modificação:' 
    }),
    fileMismatch: t({ 
      en: 'File mismatch detected. Please refresh.', 
      de: 'Dateiinkonsistenz erkannt. Bitte aktualisieren.', 
      fr: 'Incohérence de fichier détectée. Veuillez actualiser.', 
      es: 'Inconsistencia de archivo detectada. Por favor, actualice.', 
      'pt-BR': 'Inconsistência de arquivo detectada. Por favor, atualize.' 
    }),
    failedToLoadLogs: t({ 
      en: 'Failed to load logs', 
      de: 'Fehler beim Laden der Protokolle', 
      fr: 'Échec du chargement des journaux', 
      es: 'Error al cargar los logs', 
      'pt-BR': 'Falha ao carregar logs' 
    }),
    logsCopied: t({ 
      en: 'Logs copied to clipboard', 
      de: 'Protokolle in die Zwischenablage kopiert', 
      fr: 'Journaux copiés dans le presse-papiers', 
      es: 'Logs copiados al portapapeles', 
      'pt-BR': 'Logs copiados para a área de transferência' 
    }),
    failedToCopy: t({ 
      en: 'Failed to copy logs to clipboard', 
      de: 'Fehler beim Kopieren der Protokolle in die Zwischenablage', 
      fr: 'Échec de la copie des journaux dans le presse-papiers', 
      es: 'Error al copiar los logs al portapapeles', 
      'pt-BR': 'Falha ao copiar logs para a área de transferência' 
    }),
    logsExported: t({ 
      en: 'Logs exported successfully', 
      de: 'Protokolle erfolgreich exportiert', 
      fr: 'Journaux exportés avec succès', 
      es: 'Logs exportados exitosamente', 
      'pt-BR': 'Logs exportados com sucesso' 
    }),
    failedToExport: t({ 
      en: 'Failed to export logs', 
      de: 'Fehler beim Exportieren der Protokolle', 
      fr: 'Échec de l\'exportation des journaux', 
      es: 'Error al exportar los logs', 
      'pt-BR': 'Falha ao exportar logs' 
    }),
  },
} satisfies Dictionary;
