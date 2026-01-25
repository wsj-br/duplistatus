import { t, type Dictionary } from 'intlayer';

export default {
  key: 'audit-log-retention-form',
  content: {
    title: t({ 
      en: 'Audit Log Retention',
      de: 'Audit-Log-Aufbewahrung', 
      fr: 'Rétention du journal d\'audit', 
      es: 'Retención del log de auditoría', 
      'pt-BR': 'Retenção de log de auditoria' 
    }),
    description: t({ 
      en: 'Configure how long audit logs are retained before automatic cleanup. Set the number of days audit logs should be retained. Logs older than this period will be automatically deleted during daily cleanup.', 
      de: 'Konfigurieren Sie, wie lange Audit-Logs vor der automatischen Bereinigung aufbewahrt werden. Legen Sie die Anzahl der Tage fest, für die Audit-Logs aufbewahrt werden sollen. Logs, die älter als dieser Zeitraum sind, werden während der täglichen Bereinigung automatisch gelöscht.', 
      fr: 'Configurez la durée de conservation des journaux d\'audit avant le nettoyage automatique. Définissez le nombre de jours pendant lesquels les journaux d\'audit doivent être conservés. Les journaux plus anciens que cette période seront automatiquement supprimés lors du nettoyage quotidien.', 
      es: 'Configure cuánto tiempo se conservan los logs de auditoría antes de la limpieza automática. Establezca el número de días que se deben conservar los logs de auditoría. Los logs más antiguos que este período se eliminarán automáticamente durante la limpieza diaria.', 
      'pt-BR': 'Configure por quanto tempo os logs de auditoria são retidos antes da limpeza automática. Defina o número de dias que os logs de auditoria devem ser retidos. Logs mais antigos que este período serão automaticamente excluídos durante a limpeza diária.' 
    }),
    retentionDays: t({ 
      en: 'Retention (days):', 
      de: 'Aufbewahrung (Tage):', 
      fr: 'Rétention (jours):', 
      es: 'Retención (días):', 
      'pt-BR': 'Retenção (dias):' 
    }),
    saving: t({ 
      en: 'Saving...', 
      de: 'Wird gespeichert...', 
      fr: 'Enregistrement...', 
      es: 'Guardando...', 
      'pt-BR': 'Salvando...' 
    }),
    save: t({ 
      en: 'Save', 
      de: 'Speichern', 
      fr: 'Enregistrer', 
      es: 'Guardar', 
      'pt-BR': 'Salvar' 
    }),
    range: t({ 
      en: '(Range: 30-365 days)', 
      de: '(Bereich: 30-365 Tage)', 
      fr: '(Plage: 30-365 jours)', 
      es: '(Rango: 30-365 días)', 
      'pt-BR': '(Intervalo: 30-365 dias)' 
    }),
    loadingRetention: t({ 
      en: 'Loading retention configuration...', 
      de: 'Aufbewahrungskonfiguration wird geladen...', 
      fr: 'Chargement de la configuration de rétention...', 
      es: 'Cargando configuración de retención...', 
      'pt-BR': 'Carregando configuração de retenção...' 
    }),
    noPermission: t({ 
      en: 'You do not have permission to access this section.', 
      de: 'Sie haben keine Berechtigung, auf diesen Bereich zuzugreifen.', 
      fr: 'Vous n\'avez pas la permission d\'accéder à cette section.', 
      es: 'No tiene permiso para acceder a esta sección.', 
      'pt-BR': 'Você não tem permissão para acessar esta seção.' 
    }),
    failedToLoad: t({ 
      en: 'Failed to load retention configuration', 
      de: 'Fehler beim Laden der Aufbewahrungskonfiguration', 
      fr: 'Échec du chargement de la configuration de rétention', 
      es: 'Error al cargar la configuración de retención', 
      'pt-BR': 'Falha ao carregar a configuração de retenção' 
    }),
    invalidRange: t({ 
      en: 'Retention days must be between 30 and 365', 
      de: 'Aufbewahrungstage müssen zwischen 30 und 365 liegen', 
      fr: 'Les jours de rétention doivent être entre 30 et 365', 
      es: 'Los días de retención deben estar entre 30 y 365', 
      'pt-BR': 'Os dias de retenção devem estar entre 30 e 365' 
    }),
    updatedSuccessfully: t({ 
      en: 'Audit log retention updated to {days} days', 
      de: 'Aufbewahrungsfrist auf {days} Tage aktualisiert', 
      fr: 'Rétention du journal d\'audit mise à jour à {days} jours', 
      es: 'Retención de Logs de Auditoría actualizada a {days} días', 
      'pt-BR': 'Retenção de log de auditoria atualizada para {days} dias' 
    }),
    failedToSave: t({ 
      en: 'Failed to save retention configuration', 
      de: 'Fehler beim Speichern der Aufbewahrungskonfiguration', 
      fr: 'Échec de l\'enregistrement de la configuration de rétention', 
      es: 'Error al guardar la configuración de retención', 
      'pt-BR': 'Falha ao salvar a configuração de retenção' 
    }),
  },
} satisfies Dictionary;
